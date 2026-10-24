import { test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer as createHttpServer, request } from "node:http";
import { createServer as createNetServer } from "node:net";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import WebSocket from "ws-native";
import { createNativeSessionHostRuntime } from "../../../packages/harness/dist/src/sessions/native-session-host-runtime.js";

async function fixture({ token = "owned-secret", missing = false } = {}) {
  const root = await mkdtemp(join(tmpdir(), "axon-pty-"));
  const socketPath = join(root, "data.sock"),
    peers = new Set(),
    clients = new Set(),
    resolved = [],
    logs = [];
  const unix = createNetServer((peer) => {
    peers.add(peer);
    peer.on("error", () => {});
    peer.on("close", () => peers.delete(peer));
  });
  const http = createHttpServer((_req, res) => {
    res.writeHead(404);
    res.end();
  });
  const logger = {
    log: (...args) => logs.push(args),
    info: (...args) => logs.push(args),
    warn: (...args) => logs.push(args),
    error: (...args) => logs.push(args),
  };
  let attachment;
  try {
    await new Promise((resolve, reject) => {
      unix.once("error", reject);
      unix.listen(socketPath, resolve);
    });
    const api = createNativeSessionHostRuntime({
      loggerModule: { createWorkbuddyScopedLogger: () => logger },
    });
    attachment = api.attachWorkbuddyAppServerSessionRuntime({
      endpoint: {
        getHttpServer: () => http,
        getToken: () => token,
        handle() {},
        push() {},
      },
      sessionManager: {
        startRuntimeReclaimJanitor() {},
        stopRuntimeReclaimJanitor() {},
        reclaimInactiveSessions: async () => ({}),
      },
      windowFocus: { isFocused: () => false },
      logger,
      resolveDataSocketPath: (id) => {
        resolved.push(id);
        return missing ? join(root, "missing.sock") : socketPath;
      },
      handlers: { auxiliary: {}, createConfig: {}, load: {} },
    });
    await new Promise((resolve, reject) => {
      http.once("error", reject);
      http.listen(0, "127.0.0.1", resolve);
    });
  } catch (error) {
    await cleanup();
    throw error;
  }
  function connect(path) {
    const ws = new WebSocket(`ws://127.0.0.1:${http.address().port}${path}`);
    clients.add(ws);
    ws.on("error", () => {});
    ws.on("close", () => clients.delete(ws));
    return ws;
  }
  async function cleanup() {
    for (const client of clients) client.terminate();
    attachment?.stop();
    for (const peer of peers) peer.destroy();
    http.closeAllConnections();
    await Promise.all(
      [http, unix].map(
        (server) => new Promise((resolve) => server.close(() => resolve())),
      ),
    );
    await rm(root, { recursive: true, force: true });
  }
  return {
    http,
    unix,
    attachment,
    clients,
    peers,
    resolved,
    logs,
    connect,
    cleanup,
  };
}
function readBytes(socket, count) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    function data(chunk) {
      chunks.push(chunk);
      size += chunk.length;
      if (size >= count) {
        socket.off("data", data);
        socket.off("error", reject);
        resolve(Buffer.concat(chunks));
      }
    }
    socket.on("data", data);
    socket.once("error", reject);
  });
}
function rejectedUpgrade(port, path) {
  return new Promise((resolve, reject) => {
    const req = request({
      host: "127.0.0.1",
      port,
      path,
      headers: {
        Connection: "Upgrade",
        Upgrade: "websocket",
        "Sec-WebSocket-Version": "13",
        "Sec-WebSocket-Key": "b3duZWQtdGVzdC1rZXkxMg==",
      },
    });
    req.on("response", (res) => {
      res.resume();
      resolve(res.statusCode);
    });
    req.on("error", reject);
    req.on("upgrade", (_res, socket) => {
      socket.destroy();
      reject(Error("unexpected accepted upgrade"));
    });
    req.end();
  });
}
const options = { timeout: 15000, skip: process.platform === "win32" };
test(
  "original host terminal proxy bridges real websocket and owned Unix socket, then stops",
  options,
  async () => {
    const f = await fixture();
    try {
      const accepted = once(f.unix, "connection"),
        ws = f.connect("/pty/owned-session?token=owned-secret");
      await once(ws, "open");
      const [peer] = await accepted;
      assert.deepEqual(f.resolved, ["owned-session"]);
      const received = readBytes(peer, 4);
      ws.send(Buffer.from([0, 255, 10, 13]));
      assert.deepEqual(await received, Buffer.from([0, 255, 10, 13]));
      const message = once(ws, "message");
      peer.write(Buffer.from([1, 0, 254]));
      const [payload, binary] = await message;
      assert.deepEqual(payload, Buffer.from([1, 0, 254]));
      assert.equal(binary, true);
      const closed = once(ws, "close"),
        peerClosed = once(peer, "close");
      f.attachment.stop();
      const [code, reason] = await closed;
      assert.equal(code, 1001);
      assert.equal(reason.toString(), "server shutting down");
      await peerClosed;
    } finally {
      await f.cleanup();
    }
  },
);
test(
  "original terminal proxy rejects missing or incorrect token before data connection",
  options,
  async () => {
    const f = await fixture();
    try {
      assert.equal(
        await rejectedUpgrade(f.http.address().port, "/pty/owned"),
        401,
      );
      assert.equal(
        await rejectedUpgrade(f.http.address().port, "/pty/owned?token=wrong"),
        401,
      );
      assert.deepEqual(f.resolved, []);
      assert.equal(f.peers.size, 0);
    } finally {
      await f.cleanup();
    }
  },
);
test(
  "original terminal proxy preserves empty-token mode, prefix parsing and data-close code",
  options,
  async () => {
    const f = await fixture({ token: "" });
    try {
      const accepted = once(f.unix, "connection"),
        ws = f.connect("/pty/owned/suffix");
      const closed = once(ws, "close");
      await once(ws, "open");
      const [peer] = await accepted;
      assert.deepEqual(f.resolved, ["owned"]);
      peer.end();
      const [code, reason] = await closed;
      assert.equal(code, 1000);
      assert.equal(reason.toString(), "data socket closed");
    } finally {
      await f.cleanup();
    }
  },
);
test(
  "original terminal proxy reports owned missing data socket as websocket 1011",
  options,
  async () => {
    const f = await fixture({ missing: true });
    try {
      const ws = f.connect("/pty/owned?token=owned-secret"),
        closed = once(ws, "close");
      await once(ws, "open");
      const [code, reason] = await closed;
      assert.equal(code, 1011);
      assert.equal(reason.toString(), "data socket error");
      assert.ok(
        f.logs.some((args) => String(args[0]).includes("Data socket error")),
      );
    } finally {
      await f.cleanup();
    }
  },
);
