import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
function fakeProcess(): any {
  return Object.assign(new EventEmitter(), {
    pid: 123,
    versions: { node: "owned" },
    platform: "owned",
    arch: "owned",
    env: {},
    argv: ["node", "entry"],
    exit: (code: number) => {
      throw new Error("exit:" + code);
    },
  });
}
export const sidecarEntryScenarios: Array<[string, (s: any) => Promise<void>]> =
  [];
sidecarEntryScenarios.push([
  "crash writer persists owned report, caps entries and sanitizes process names",
  async (s) => {
    const root = await mkdtemp(join(tmpdir(), "axon-crash-"));
    try {
      const process = fakeProcess();
      const api = s.writer({ process });
      const handle = api.installCrashWriter({
        logsDir: root,
        processName: "../../owned daemon",
        appVersion: "test",
        maxEntriesPerLaunch: 2,
      });
      handle.write({ type: "uncaught_exception", error: new Error("owned") });
      process.emit("unhandledRejection", "rejected");
      handle.write({ type: "uncaught_exception", error: "excess" });
      const file = JSON.parse(await readFile(handle.getReportPath(), "utf8"));
      assert.equal(file.entries.length, 2);
      assert.equal(file.droppedCount, 1);
      assert.equal(file.entries[0].errorMessage, "owned");
      assert.equal(file.entries[1].errorName, "NonError");
      assert.equal(file.processName, ".._.._owned_daemon");
      assert.equal(file.pid, 123);
      api.installCrashWriter({ logsDir: root, processName: "again" });
      assert.equal(process.listenerCount("uncaughtException"), 1);
      assert.equal(process.listenerCount("unhandledRejection"), 1);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
]);
sidecarEntryScenarios.push([
  "child crash reporting ignores successful exit and retains spawn errors",
  async (s) => {
    const api = s.writer({ process: fakeProcess() });
    const child = new EventEmitter(),
      entries: any[] = [];
    api.wrapChildProcess(
      child,
      { name: "cli" },
      { write: (entry: any) => entries.push(entry) },
    );
    child.emit("exit", 0, null);
    child.emit("exit", null, "SIGTERM");
    child.emit("error", new Error("spawn failed"));
    assert.equal(entries.length, 2);
    assert.equal(entries[0].childProcess.reason, "signal:SIGTERM");
    assert.equal(entries[1].childProcess.reason, "spawn-error:spawn failed");
    const failed = s.writer({
      process: fakeProcess(),
      fs: {
        mkdirSync() {
          throw new Error("denied");
        },
      },
    });
    assert.equal(
      failed
        .installCrashWriter({ logsDir: "/owned", processName: "x" })
        .write({ type: "uncaught_exception", error: "a" }),
      null,
    );
  },
]);
sidecarEntryScenarios.push([
  "entry parses required token and wires signal shutdown without import startup",
  async (s) => {
    const process = fakeProcess();
    const order: any[] = [];
    process.argv.push("--token", "owned-token");
    const api = s.entry({
      process,
      sidecar: {
        SidecarServer: class {
          constructor(token: string) {
            order.push(token);
          }
          async start() {
            order.push("start");
          }
          async shutdown() {
            order.push("shutdown");
          }
        },
        bindSessionCrashReporter() {},
      },
      console: { error: (...v: any[]) => order.push(v) },
    });
    assert.equal(order.length, 0);
    assert.equal(api.parseToken(), "owned-token");
    process.exit = (code: number) => {
      order.push("exit:" + code);
    };
    await api.main();
    assert.deepEqual(order, ["owned-token", "start"]);
    process.emit("SIGTERM");
    await Promise.resolve();
    assert.deepEqual(order, ["owned-token", "start", "shutdown", "exit:0"]);
    const missing = s.entry({
      process: fakeProcess(),
      console: { error() {} },
      sidecar: {},
    });
    assert.throws(() => missing.parseToken(), /exit:1/);
  },
]);
sidecarEntryScenarios.push([
  "sidecar crash writer binding preserves signal and exit details",
  async (s) => {
    const process = fakeProcess();
    process.env = {
      WORKBUDDY_CONFIG_DIR: "/owned",
      WORKBUDDY_APP_VERSION: "1",
    };
    let report: any, options: any;
    const entries: any[] = [];
    const api = s.entry({
      process,
      sidecar: { bindSessionCrashReporter: (fn: any) => (report = fn) },
      crashWriter: {
        installCrashWriter: (value: any) => {
          options = value;
          return { write: (entry: any) => entries.push(entry) };
        },
      },
    });
    api.installSidecarCrashWriter();
    assert.equal(options.logsDir, "/owned/logs");
    report({ exitCode: 2, name: "cli" });
    report({ exitCode: 0, signal: 15, name: "cli" });
    assert.equal(entries[0].childProcess.reason, "exit:2");
    assert.equal(entries[1].childProcess.reason, "signal:15");
  },
]);
