import { test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createNativeSidecarClient } from "../../../packages/harness/dist/src/terminal/native-sidecar-client.js";
import http from "node:http";
import { mkdtemp, writeFile, rm, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import WebSocket from "ws-native";
import { createNativeSidecarEnvironment } from "../../../packages/harness/dist/src/terminal/native-sidecar-environment.js";
import { createNativeSidecar } from "../../../packages/harness/dist/src/terminal/native-sidecar.js";
import { createNativeTerminalProxy } from "../../../packages/harness/dist/src/terminal/native-terminal-proxy.js";

async function waitFor(predicate, message) {
  for (let i = 0; i < 150; i++) {
    if (predicate()) return;
    await new Promise((r) => setTimeout(r, 20));
  }
  assert.fail(message);
}

test(
  "real sidecar PTY: endpoint ACK, control RPC, WebSocket IO, reconnect and process cleanup",
  { skip: process.platform === "win32", timeout: 20000 },
  async () => {
    const root = await mkdtemp(join(tmpdir(), "axon-sidecar-"));
    const childFile = join(root, "child.cjs");
    // A real PTY child and real HTTP endpoint, not the model-serving CLI.
    await writeFile(
      childFile,
      `const http=require('http'),net=require('net');
 require('child_process').spawnSync('/bin/stty',['-echo'],{stdio:'inherit'});
 const server=http.createServer((q,r)=>r.end('fixture endpoint'));
 server.listen(0,'127.0.0.1',()=>{
  const socket=net.createConnection(process.env.CODEBUDDY_SIDECAR_READY_SOCKET,()=>socket.write(JSON.stringify({jsonrpc:'2.0',id:1,method:'session.ready',params:{sessionId:process.env.CODEBUDDY_SIDECAR_READY_SESSION_ID,token:process.env.CODEBUDDY_SIDECAR_READY_TOKEN,pid:process.pid,port:server.address().port,protocolVersion:1}})+'\\n'));
  socket.on('data',()=>{socket.end();console.log('PTY_READY');});
 });
 let buffer='';process.stdin.on('data',chunk=>{buffer+=chunk;let p;while((p=buffer.indexOf('\\n'))>=0){const line=buffer.slice(0,p).trim();buffer=buffer.slice(p+1);console.log('REPLY:'+line);}});
 `,
    );
    const localProcess = Object.create(process);
    localProcess.env = { ...process.env, WORKBUDDY_CONFIG_DIR: root };
    const environment = createNativeSidecarEnvironment({
      process: localProcess,
    });
    const logs = [];
    const logger = {
      log: (...args) => logs.push(args),
      error: (...args) => logs.push(args),
      warn: (...args) => logs.push(args),
    };
    const { SidecarServer } = createNativeSidecar({
      environment,
      console: logger,
    });
    const server = new SidecarServer("owned-sidecar-token");
    const web = http.createServer((q, r) => {
      r.statusCode = 404;
      r.end();
    });
    const { TerminalProxy } = createNativeTerminalProxy();
    const proxy = new TerminalProxy({
      resolveDataSocketPath: environment.dataSocketPath,
      logger,
    });
    const clients = [];
    let rpc, created;
    async function connect() {
      const ws = new WebSocket(
        `ws://127.0.0.1:${web.address().port}/pty/owned-session?token=owned-web-token`,
      );
      clients.push(ws);
      const state = { ws, text: "", binary: true };
      ws.on("message", (data, binary) => {
        state.text += data.toString();
        state.binary &&= binary;
      });
      await once(ws, "open");
      return state;
    }
    try {
      await server.start();
      assert.equal(
        (await stat(environment.sidecarRuntimeDir())).mode & 0o777,
        0o700,
      );
      assert.deepEqual(
        JSON.parse(await readFile(environment.pidFilePath(), "utf8")),
        { pid: process.pid, token: "owned-sidecar-token", version: 3 },
      );
      const { SidecarClient } = createNativeSidecarClient({
        environment,
        console: logger,
      });
      rpc = new SidecarClient();
      await rpc.connect();
      assert.equal((await rpc.ping()).token, "owned-sidecar-token");
      await assert.rejects(rpc.createSession({}), /Missing required/);
      await assert.rejects(rpc.sendRequest("unknown.method"), /Unknown method/);
      created = await rpc.createSession({
        sessionId: "owned-session",
        command: process.execPath,
        args: [childFile],
        cwd: root,
        port: 0,
        env: { WORKBUDDY_CONFIG_DIR: root, ELECTRON_RUN_AS_NODE: "1" },
      });
      assert.equal(
        await (await fetch(created.acpEndpoint)).text(),
        "fixture endpoint",
      );
      assert.equal((await rpc.listSessions()).length, 1);
      proxy.start(web, "owned-web-token");
      web.listen(0, "127.0.0.1");
      await once(web, "listening");
      const first = await connect();
      await waitFor(
        () => first.text.includes("PTY_READY"),
        "PTY startup snapshot missing",
      );
      first.ws.send(Buffer.from("hello-one\n"));
      await waitFor(
        () => first.text.includes("REPLY:hello-one"),
        "PTY did not consume WebSocket input",
      );
      assert.equal(first.binary, true);
      const closed = once(first.ws, "close");
      first.ws.close();
      await closed;
      await rpc.sendRequest("session.reconnect", {
        sessionId: "owned-session",
        cols: 101,
        rows: 37,
      });
      const second = await connect();
      await waitFor(
        () => second.text.includes("REPLY:hello-one"),
        "reconnect did not replay original ring buffer",
      );
      await rpc.sendRequest("session.resize", {
        sessionId: "owned-session",
        cols: 102,
        rows: 38,
      });
      assert.equal((await rpc.listSessions())[0].cols, 102);
      second.ws.send("hello-two\n");
      await waitFor(
        () => second.text.includes("REPLY:hello-two"),
        "reconnected input failed",
      );
      assert.match(
        (
          await rpc.sendRequest("session.capture", {
            sessionId: "owned-session",
          })
        ).text,
        /REPLY:hello-two/,
      );
      const end = once(second.ws, "close");
      await rpc.killSession("owned-session");
      const [code] = await end;
      assert.equal(code, 1000);
      await waitFor(() => {
        try {
          process.kill(created.pid, 0);
          return false;
        } catch {
          return true;
        }
      }, "owned PTY child survived kill");
      assert.deepEqual(await rpc.listSessions(), []);
      await assert.rejects(stat(created.socketPath), { code: "ENOENT" });
    } finally {
      for (const ws of clients) ws.terminate();
      rpc?.dispose();
      proxy.stop();
      await server.shutdown();
      if (web.listening) {
        web.closeAllConnections();
        await new Promise((r) => web.close(r));
      }
      await rm(environment.sidecarRuntimeDir(), {
        recursive: true,
        force: true,
      });
      await rm(root, { recursive: true, force: true });
    }
    await assert.rejects(stat(environment.controlSocketPath()), {
      code: "ENOENT",
    });
  },
);
