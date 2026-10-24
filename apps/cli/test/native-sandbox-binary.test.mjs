import { test } from "node:test";
import assert from "node:assert/strict";
import { once, EventEmitter } from "node:events";
import * as fs from "node:fs";
import * as net from "node:net";
import * as cp from "node:child_process";
import * as crypto from "node:crypto";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { sandboxCliFixture } from "../../../packages/harness/dist/scripts/helpers/sandbox-cli-fixture.js";
import { createNativeSandboxCLI } from "@axonfire/harness/sandbox/native-sandbox-cli.js";

test("captured sandbox enforces a real file denial through original lifecycle and IPC", {
  skip: process.platform !== "darwin" || process.arch !== "arm64",
  timeout: 20000,
}, async () => {
  const root = fs.mkdtempSync(join(tmpdir(), "axon-captured-sandbox-"));
  const assets = fileURLToPath(new URL("../../../packages/harness/dist/native-product/", import.meta.url));
  const children = [], timers = new Set();
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
      ...seed.runtime.modules, 69278: net, 79896: fs, 54601: crypto,
      35317: { ...cp, spawn(exe, args, options) {
        assert.equal(args[args.indexOf("--app_home") + 1], join(root, "app"));
        const child = cp.spawn(exe, args, { ...options, cwd: root });
        children.push(child);
        return child;
      } },
      44237: { PathUtils: { getRootPathSync: () => assets, isBunCompiled: () => false } },
    },
  };
  const fixture = sandboxCliFixture(createNativeSandboxCLI, runtime);
  const session = "owned-captured", file = join(root, "blocked.txt"), evidence = "owned-sandbox-data-483";
  fs.writeFileSync(file, evidence);
  async function readThroughSandbox() {
    const messages = [];
    let resolveExit;
    const exited = new Promise(resolve => { resolveExit = resolve; });
    const unsubscribe = fixture.client.addReverseListener({ commands: ["ProcessOutput", "ProcessExit"] }, message => {
      messages.push(message);
      if (message.command === "ProcessExit") resolveExit(message.data);
    });
    const timer = setTimeout(() => resolveExit({ timeout: true }), 5000);
    try {
      const started = await fixture.client.sendRequest(session, "RunExecutable", {
        executable: "/bin/cat", args: [file], cwdDir: root, timeoutMs: 3000,
        executionMode: "sandbox", env: { HOME: root, PATH: "/usr/bin:/bin" },
        stdoutMode: "pipe", stdinMode: "pipe",
      });
      assert.ok(started.processId);
      const result = await exited;
      assert.ok(!result.timeout, "native process must report its exit");
      assert.equal(result.processId, started.processId);
      const stdout = messages.filter(m => m.command === "ProcessOutput" && m.data.stream === "stdout")
        .map(m => Buffer.from(m.data.data, "base64").toString()).join("");
      return { result, stdout };
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
    assert.ok(denied.result.fileBlockRecords.some(record => record.path === fs.realpathSync(file)));
    await fixture.client.sendRequest(session, "SetFileRules", { rules: [] });
    const allowed = await readThroughSandbox();
    assert.equal(allowed.result.exitCode, 0);
    assert.equal(allowed.stdout, evidence);
    assert.equal(fs.readFileSync(file, "utf8"), evidence);
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
      fs.rmSync(root, { recursive: true, force: true });
    }
  }

  assert.equal(fixture.manager.isRunning(), false);
  assert.equal(seed.pids.size, 0);
});
