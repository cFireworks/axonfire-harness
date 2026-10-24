import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { sandboxCliFixture } from "./sandbox-cli-fixture.js";
import { createNativeSandboxCLI } from "../../src/sandbox/native-sandbox-cli.js";
export const SANDBOX_CLI_CASES: {
  name: string;
  run(factory: typeof createNativeSandboxCLI): Promise<any>;
}[] = [
  {
    name: "process start coalesces, sanitizes environment, registers PID and stops",
    async run(factory) {
      const f = sandboxCliFixture(factory);
      const a = f.manager.start({ sessionId: "s", appHomeDir: "/owned/home" }),
        b = f.manager.start({ sessionId: "s" });
      assert.equal(f.writes.length, 1);
      assert.equal(f.manager.isRunning(), false);
      await f.fire(500);
      assert.equal(await a, await b);
      assert.equal(f.pids.has(4321), true);
      assert.equal(f.writes[0][2].env.ACC_PRODUCT_CONFIG, undefined);
      assert.equal(f.proc.listenerCount("exit"), 1);
      const data = {
        args: f.writes[0][1],
        env: f.writes[0][2].env,
        started: f.manager.getStartedAtMs(),
      };
      await f.manager.stop();
      assert.equal(f.proc.listenerCount("exit"), 0);
      assert.equal(f.pids.size, 0);
      assert.equal(f.timers.size, 0);
      return { ...data, signals: f.signals, state: f.manager._state };
    },
  },
  {
    name: "process early exit retains consumable startup failure",
    async run(factory) {
      const f = sandboxCliFixture(factory);
      const p = f.manager.start({ sessionId: "s" });
      const rejection = assert.rejects(p, /during startup/);
      f.child.emit("close", 7, null);
      await rejection;
      await f.fire(500);
      const failure = f.manager.consumeStartupFailure();
      assert.equal(failure.phase, "startup-window-exit");
      assert.equal(f.manager.consumeStartupFailure(), undefined);
      await f.manager.stop();
      return failure;
    },
  },
  {
    name: "established daemon crash emits deferred telemetry with captured output",
    async run(factory) {
      const f = sandboxCliFixture(factory);
      const p = f.manager.start({ sessionId: "s", conversationRequestId: "r" });
      await f.fire(500);
      await p;
      f.manager.markSessionEstablished();
      f.child.stdout.emit("data", Buffer.from("stdout"));
      f.child.stderr.emit("data", Buffer.from("stderr"));
      f.child.emit("close", 9, "SIGABRT");
      assert.equal(f.reports.length, 0);
      await f.flush();
      assert.equal(f.reports[0].phase, "runtime-exit");
      await f.manager.stop();
      return f.reports;
    },
  },
  {
    name: "stdio capture retains bounded head/tail and counts UTF8 bytes",
    async run(factory) {
      const f = sandboxCliFixture(factory),
        stream = new EventEmitter();
      const capture = new f.native.SandboxCliStdioCapture(stream, 3, 3);
      const bytes = Buffer.from("你好世界abcdef");
      stream.emit("data", bytes.subarray(0, 2));
      stream.emit("data", bytes.subarray(2));
      const result = capture.snapshot();
      assert.equal(result.bytes, bytes.length);
      assert.equal(result.text, "你好世\n...\ndef");
      return result;
    },
  },
  {
    name: "IPC request fragmentation resolves and pending IDs drain",
    async run(factory) {
      const f = sandboxCliFixture(factory),
        out: string[] = [];
      f.client._connected = true;
      f.client._socket = {
        write: (s: string, cb: any) => {
          out.push(s);
          cb?.();
        },
        removeAllListeners() {},
        destroy() {},
      };
      const p = f.client.sendRequest(
        "s",
        "Echo",
        { a: 1 },
        { conversationRequestId: "r" },
      );
      assert.deepEqual(f.client.getPendingConversationRequestIds(), ["r"]);
      const request = JSON.parse(out[0]!);
      const data =
        JSON.stringify(
          f.protocol.createIpcResponseOk(request.messageId, "s", "Echo", {
            answer: 42,
          }),
        ) + "\n";
      f.client._onSocketData(Buffer.from(data.slice(0, 10)));
      assert.equal(f.client._pendingRequests.size, 1);
      f.client._onSocketData(Buffer.from(data.slice(10)));
      assert.deepEqual(await p, { answer: 42 });
      assert.equal(f.timers.size, 0);
      await f.client.disconnect();
      return request;
    },
  },
  {
    name: "IPC timeout and disconnect reject exact pending requests",
    async run(factory) {
      const f = sandboxCliFixture(factory);
      f.client._connected = true;
      f.client._socket = {
        write: () => {},
        removeAllListeners() {},
        destroy() {},
      };
      f.client._config = { requestTimeoutMs: 17 };
      const p = f.client.sendRequest("s", "Missing", {});
      const rejection = assert.rejects(p, /timed out after 17ms/);
      await f.fire(17);
      await rejection;
      const next = f.client.sendRequest("s", "Waiting", {});
      const aborted = assert.rejects(next, /Client disconnected/);
      await f.client.disconnect();
      await aborted;
      assert.equal(f.timers.size, 0);
      return {
        pending: f.client._pendingRequests.size,
        counter: f.client._messageCounter,
      };
    },
  },
  {
    name: "lifecycle readiness caches generation and callback unsubscribe",
    async run(factory) {
      const f = sandboxCliFixture(factory),
        calls: any[] = [];
      f.manager.start = async () => "address";
      f.manager.markSessionEstablished = () => calls.push("established");
      f.client.connect = async (x: any) => calls.push(["connect", x]);
      f.client.sendRequest = async (_s: any, command: any, data: any) => {
        calls.push([command, data]);
        return { workingDir: "/owned/projection" };
      };
      const unsubscribe = f.lifecycle.onSessionReady((x: any) =>
        calls.push(["ready", x]),
      );
      const p = f.lifecycle.ensureReady({
        sessionId: "s",
        autoProjection: true,
      });
      assert.equal(f.lifecycle.ensureReady({ sessionId: "ignored" }), p);
      await p;
      assert.equal(f.lifecycle.getReadyGeneration(), 1);
      assert.equal(f.lifecycle.isProjectionActive(), true);
      unsubscribe();
      await f.lifecycle._fireSessionReadyCallbacks("restart");
      assert.equal(calls.filter((x) => x[0] === "ready").length, 1);
      f.lifecycle._clearAccessTelemetryFlushTimer();
      assert.deepEqual(
        [...f.timers.values()].map((t) => t.ms),
        [5000],
      );
      await f.fire(5000);
      assert.equal(f.timers.size, 0);
      return calls;
    },
  },
  {
    name: "lifecycle failed open clears readiness cache and allows retry",
    async run(factory) {
      const f = sandboxCliFixture(factory);
      f.manager.start = async () => "address";
      f.client.connect = async () => {};
      let attempt = 0;
      f.client.sendRequest = async () => {
        if (++attempt === 1) throw Error("open rejected");
        return { workingDir: "/owned/work" };
      };
      await assert.rejects(
        f.lifecycle.ensureReady({ sessionId: "s" }),
        /open rejected/,
      );
      await assert.rejects(f.lifecycle.waitReady(), /open rejected/);
      await f.lifecycle.ensureReady({ sessionId: "s" });
      f.lifecycle._clearAccessTelemetryFlushTimer();
      await f.flush();
      assert.equal(f.lifecycle.getReadyGeneration(), 1);
      return {
        attempt,
        phases: f.reports.map((x) => x.phase),
        timers: f.timers.size,
      };
    },
  },
  {
    name: "projection toggles use original commands and cached directory",
    async run(factory) {
      const f = sandboxCliFixture(factory),
        calls: any[] = [];
      f.lifecycle._bootstrapWorkdir = "/owned/work";
      f.client.sendRequest = async (s: any, c: any, d: any) => {
        calls.push([s, c, d]);
        return {
          workingDir:
            c === f.protocol.SANDBOX_COMMANDS.START_PROJECTION
              ? "/owned/projection"
              : "/owned/work",
        };
      };
      assert.equal(
        await f.lifecycle.getWorkdir("s", true),
        "/owned/projection",
      );
      await f.lifecycle.getWorkdir("s", true);
      assert.equal(await f.lifecycle.getWorkdir("s", false), "/owned/work");
      assert.equal(calls.length, 2);
      return calls;
    },
  },
];

SANDBOX_CLI_CASES.push(
  {
    name: "hard readiness timeout cleans a late successful startup",
    async run(factory) {
      const f = sandboxCliFixture(factory);
      let finish!: () => void,
        stops = 0,
        disconnects = 0;
      const gate = new Promise<void>((r) => (finish = r));
      f.lifecycle._startAndConnect = async () => {
        await gate;
        f.lifecycle._openedSessionId = "late";
      };
      f.client.disconnect = async () => {
        disconnects++;
      };
      f.manager.stop = async () => {
        stops++;
      };
      const p = f.lifecycle.ensureReady({ sessionId: "s" });
      const rejection = assert.rejects(p, /hard timeout after 30000ms/);
      await f.fire(30000);
      await rejection;
      assert.equal(stops, 0);
      finish();
      for (let i = 0; i < 12; i++) await Promise.resolve();
      await f.flush();
      assert.equal(stops, 1);
      assert.equal(disconnects, 1);
      assert.equal(f.lifecycle.getOpenedSessionId(), undefined);
      return {
        stops,
        disconnects,
        phase: f.reports[0].phase,
        timers: f.timers.size,
      };
    },
  },
  {
    name: "access telemetry coalesces by open session and retains original flush timeout",
    async run(factory) {
      const f = sandboxCliFixture(factory);
      f.lifecycle._openedSessionId = "s";
      let finish!: (v: any) => void,
        count = 0;
      f.client.isConnected = () => true;
      f.client.sendRequest = () => {
        count++;
        return new Promise((r) => (finish = r));
      };
      const a = f.lifecycle.flushAccessTelemetry("one"),
        b = f.lifecycle.flushAccessTelemetry("two");
      assert.equal(a, b);
      assert.equal(count, 1);
      assert.deepEqual(
        [...f.timers.values()].map((t) => t.ms),
        [1000],
      );
      finish({});
      await a;
      assert.equal(f.timers.size, 0);
      assert.equal(f.lifecycle._accessTelemetryFlushPromises.size, 0);
      return { count };
    },
  },
  {
    name: "IPC reverse request replies and event notifications remain fire-and-forget",
    async run(factory) {
      const f = sandboxCliFixture(factory),
        writes: any[] = [],
        seen: any[] = [];
      f.client._connected = true;
      f.client._socket = {
        write: (s: string) => writes.push(JSON.parse(s)),
        removeAllListeners() {},
        destroy() {},
      };
      f.client.onReverseRequest(async (request: any) => {
        seen.push(request.command);
        return { accepted: true };
      });
      f.client._handleMessage(
        f.protocol.createIpcRequest("q", "s", "Authorize", {}),
      );
      f.client._handleMessage(
        f.protocol.createIpcRequest(
          "event",
          "s",
          f.protocol.SANDBOX_COMMANDS.PROCESS_OUTPUT,
          {},
        ),
      );
      for (let i = 0; i < 5; i++) await Promise.resolve();
      assert.equal(writes.length, 1);
      assert.equal(writes[0].success, true);
      await f.client.disconnect();
      return { seen, writes };
    },
  },
  {
    name: "versioned binary discovery honors semver and GC keeps the resolved version",
    async run(factory) {
      const f = sandboxCliFixture(factory);
      delete f.proc.env.SANDBOX_CLI_PATH;
      const removed: string[] = [];
      Object.assign(f.runtime.modules[79896], {
        existsSync: (p: string) => !p.endsWith("package.json"),
        readdirSync: () =>
          ["2.0.0", "1.9.0", "README"].map((name) => ({
            name,
            isDirectory: () => true,
          })),
        rmSync: (p: string) => removed.push(p),
      });
      const chosen = f.manager._resolveSandboxCLIPath();
      assert.equal(chosen, "/owned/root/vendor/sandbox/2.0.0/sandbox-cli");
      f.manager._resolvedExePath = chosen;
      f.manager._gcOldSandboxVersions();
      assert.deepEqual(removed, ["/owned/root/vendor/sandbox/1.9.0"]);
      return { chosen, removed };
    },
  },
);
