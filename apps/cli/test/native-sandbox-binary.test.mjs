import { test } from "node:test";
import assert from "node:assert/strict";
import { once, EventEmitter } from "node:events";
import * as fs from "node:fs";
import * as net from "node:net";
import * as cp from "node:child_process";
import * as crypto from "node:crypto";
import { StringDecoder } from "node:string_decoder";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { sandboxCliFixture } from "../../../packages/harness/dist/scripts/helpers/sandbox-cli-fixture.js";
import { createNativeSandboxCLI } from "@axonfire/harness/sandbox/native-sandbox-cli.js";

test("captured sandbox enforces a real file denial through original lifecycle and IPC", {
  skip: process.platform !== "darwin" || process.arch !== "arm64",
  timeout: 20000,
}, async (t) => {
  const root = fs.mkdtempSync(join(tmpdir(), "axon-captured-sandbox-"));
  const assets = fileURLToPath(new URL("../../../packages/harness/dist/native-product/", import.meta.url));
  const children = [], timers = new Set();
  const nativeOutputTails = [];
  const wireMessages = [], wireErrors = [];
  const seed = sandboxCliFixture();
  const proc = Object.assign(new EventEmitter(), {
    env: { PATH: process.env.PATH, HOME: root }, platform: process.platform,
    arch: process.arch, execPath: process.execPath, pid: process.pid, cwd: () => root,
  });
  // Only parent boundaries are supplied here; the peer is the captured native binary.
  const runtime = {
    ...seed.runtime, process: proc, Date, Math, console, setImmediate, clearImmediate,
    setTimeout(fn, ms) {
      const timer = setTimeout(() => { timers.delete(timer); fn(); }, ms);
      timers.add(timer);
      return timer;
    },
    clearTimeout(timer) { timers.delete(timer); clearTimeout(timer); },
    modules: {
      ...seed.runtime.modules,
      69278: { ...net, createConnection(...args) {
        const socket = net.createConnection(...args);
        const decoder = new StringDecoder("utf8");
        let pending = "";
        // Passive observation of the actual peer bytes, before the original client parser.
        socket.on("data", chunk => {
          pending += decoder.write(chunk);
          let end;
          while ((end = pending.indexOf("\n")) !== -1) {
            const line = pending.slice(0, end).trim();
            pending = pending.slice(end + 1);
            if (!line) continue;
            try { wireMessages.push(JSON.parse(line)); }
            catch (error) { wireErrors.push(String(error)); }
          }
        });
        return socket;
      } },
      79896: fs, 54601: crypto,
      35317: { ...cp, spawn(exe, args, options) {
        assert.equal(args[args.indexOf("--app_home") + 1], join(root, "app"));
        const child = cp.spawn(exe, args, { ...options, cwd: root });
        // The original manager retains only 1 KiB at each end. Keep a separate
        // bounded tail so monitor diagnostics in the middle survive unchanged.
        const output = { stdout: "", stderr: "" };
        nativeOutputTails.push(output);
        for (const stream of ["stdout", "stderr"]) {
          const decoder = new StringDecoder("utf8");
          child[stream]?.on("data", chunk => {
            output[stream] = (output[stream] + decoder.write(chunk)).slice(-65536);
          });
          child[stream]?.on("end", () => {
            output[stream] = (output[stream] + decoder.end()).slice(-65536);
          });
        }
        children.push(child);
        return child;
      } },
      44237: { PathUtils: { getRootPathSync: () => assets, isBunCompiled: () => false } },
    },
  };
  const fixture = sandboxCliFixture(createNativeSandboxCLI, runtime);
  const session = "owned-captured", file = join(root, "blocked.txt"), evidence = "owned-sandbox-data-483";
  fs.writeFileSync(file, evidence);
  let testError;
  function collectNativeLogs() {
    const nativeLogFiles = {};
    for (const relative of fs.readdirSync(root, { recursive: true }).filter(path => /\.log$/.test(path)).sort().slice(-8)) {
      const path = join(root, relative), stat = fs.lstatSync(path);
      if (stat.isFile() && stat.size <= 1024 * 1024) nativeLogFiles[relative] = fs.readFileSync(path, "utf8").slice(-16000);
    }
    return nativeLogFiles;
  }
  async function readThroughSandbox(target = file) {
    const messages = [];
    const wireStart = wireMessages.length;
    let resolveExit, processId;
    const exited = new Promise(resolve => { resolveExit = resolve; });
    const unsubscribe = fixture.client.addReverseListener({ commands: ["ProcessOutput", "ProcessExit"] }, message => {
      messages.push(message);
      if (message.command === "ProcessExit" && message.data.processId === processId) resolveExit(message.data);
    });
    const timer = setTimeout(() => resolveExit({ timeout: true }), 5000);
    try {
      const started = await fixture.client.sendRequest(session, "RunExecutable", {
        executable: "/bin/cat", args: [target], cwdDir: root, timeoutMs: 3000,
        executionMode: "sandbox", env: { HOME: root, PATH: "/usr/bin:/bin" },
        stdoutMode: "pipe", stdinMode: "pipe",
      });
      assert.ok(started.processId);
      processId = started.processId;
      const earlyExit = messages.find(message => message.command === "ProcessExit" && message.data.processId === processId);
      if (earlyExit) resolveExit(earlyExit.data);
      const result = await exited;
      assert.ok(!result.timeout, "native process must report its exit");
      assert.equal(result.processId, started.processId);
      assert.deepEqual(wireErrors, [], "native IPC frames must remain valid JSON");
      const exitFrames = wireMessages.slice(wireStart).filter(message =>
        message.command === "ProcessExit" && message.data?.processId === started.processId);
      assert.equal(exitFrames.length, 1, "one peer exit frame must match the original client callback");
      assert.deepEqual(result, exitFrames[0].data, "original client must preserve the peer's entire exit payload");
      const stdout = messages.filter(m => m.command === "ProcessOutput" && m.data.processId === processId && m.data.stream === "stdout")
        .map(m => Buffer.from(m.data.data, "base64").toString()).join("");
      const stderr = messages.filter(m => m.command === "ProcessOutput" && m.data.processId === processId && m.data.stream === "stderr")
        .map(m => Buffer.from(m.data.data, "base64").toString()).join("");
      // Preserve the native peer's own diagnostics as well as its raw IPC exit.
      // Read-only capture: do not add a grace period or synthesize audit records.
      const capture = fixture.manager.getCapturedStdio();
      const nativeStdio = { ...capture, stdout: capture.stdout?.slice(-16000), stderr: capture.stderr?.slice(-16000) };
      const nativeLogFiles = collectNativeLogs();
      const nativeOutput = nativeOutputTails.map(output => ({ ...output }));
      const observation = { result, stdout, stderr, peerExit: exitFrames[0].data, nativeStdio, nativeLogFiles, nativeOutput };
      if (process.env.AXONFIRE_SANDBOX_DIAGNOSTICS === "1") t.diagnostic(JSON.stringify(observation));
      return observation;
    } finally { clearTimeout(timer); unsubscribe(); }
  }
  try {
    assert.equal(fixture.manager._resolveSandboxCLIPath(), join(assets, "vendor/sandbox/5.3.3/sandbox-cli"));
    await fixture.lifecycle.ensureReady({ sessionId: session, appHomeDir: join(root, "app"), autoProjection: false });
    assert.equal(children.length, 1);
    assert.ok(seed.pids.has(children[0].pid));
    assert.equal(fixture.manager.isRunning(), true);
    const set = await fixture.client.sendRequest(session, "SetFileRules", {
      rules: [{ path: file, type: "no_access", source: "global" }],
    });
    assert.equal(set.addedCount, 1);
    const denied = await readThroughSandbox();
    assert.notEqual(denied.result.exitCode, 0);
    assert.equal(denied.stdout, "");
    assert.ok(Array.isArray(denied.result.fileBlockRecords),
      "native denial must include audit records: " + JSON.stringify({ ...denied, nativeLogs: fixture.logs.slice(-10) }));
    assert.ok(denied.result.fileBlockRecords.some(record => record.path === fs.realpathSync(file)),
      "native denial must identify the blocked file: " + JSON.stringify(denied));
    await fixture.client.sendRequest(session, "SetFileRules", { rules: [] });
    const allowed = await readThroughSandbox();
    assert.equal(allowed.result.exitCode, 0);
    assert.equal(allowed.stdout, evidence);
    assert.equal(fs.readFileSync(file, "utf8"), evidence);
    const parallelFiles = Array.from({ length: 4 }, (_, index) => {
      const path = join(root, `parallel-${index}.txt`);
      const content = `owned-parallel-evidence-${index}`;
      fs.writeFileSync(path, content);
      return { path, content, denied: index % 2 === 0 };
    });
    await fixture.client.sendRequest(session, "SetFileRules", {
      rules: parallelFiles.filter(entry => entry.denied).map(entry => ({ path: entry.path, type: "no_access", source: "global" })),
    });
    const parallel = await Promise.all(parallelFiles.map(entry => readThroughSandbox(entry.path)));
    assert.equal(new Set(parallel.map(entry => entry.result.processId)).size, parallelFiles.length);
    for (let index = 0; index < parallel.length; index++) {
      const entry = parallelFiles[index], actual = parallel[index];
      if (entry.denied) {
        assert.notEqual(actual.result.exitCode, 0);
        assert.equal(actual.stdout, "");
        assert.ok(actual.result.fileBlockRecords?.some(record => record.path === fs.realpathSync(entry.path)),
          "concurrent denial must identify its own file: " + JSON.stringify({ ...actual, nativeLogs: fixture.logs.slice(-10) }));
      } else {
        assert.equal(actual.result.exitCode, 0);
        assert.equal(actual.stdout, entry.content);
        assert.ok(!actual.result.fileBlockRecords?.length);
      }
    }

  } catch (error) {
    testError = error;
    throw error;
  } finally {
    try {
      await fixture.lifecycle.stop();
    } finally {
      for (const timer of timers) clearTimeout(timer);
      for (const child of children) {
        if (child.exitCode === null && child.signalCode === null) {
          const closed = once(child, "close");
          child.kill("SIGKILL");
          await closed;
        }
      }
      // Shutdown flushes buffered native file logs. Append them only after the
      // assertion has failed, without delaying or changing the measured operation.
      if (testError) {
        try { testError.message += "\nNative logs after shutdown: " + JSON.stringify(collectNativeLogs()); }
        catch (error) { testError.message += "\nNative log collection failed: " + String(error); }
      }
      fs.rmSync(root, { recursive: true, force: true });
    }
  }

  assert.equal(fixture.manager.isRunning(), false);
  assert.equal(seed.pids.size, 0);
});
