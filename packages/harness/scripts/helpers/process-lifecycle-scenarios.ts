import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { createRequire } from "node:module";
const semver = createRequire(import.meta.url)("semver");
import { installNativeProcessLifecycle } from "../../src/runtime/native-process-lifecycle.js";
export function processLifecycleFixture(
  factory = installNativeProcessLifecycle,
  patch: any = {},
) {
  const calls: any[] = [],
    timeouts = new Map<any, any>(),
    intervals = new Map<any, any>();
  let finish: any;
  const done = new Promise<void>((r) => (finish = r));
  const record = (name: string, ...args: any[]) => {
    calls.push([name, ...args]);
    if (patch.fail === name) throw Error("owned failure");
  };
  const proc: any = Object.assign(new EventEmitter(), {
    argv: ["node", "codebuddy", ...(patch.argv ?? [])],
    versions: { node: patch.node ?? "22.19.0" },
    env: { ...patch.env },
    platform: patch.platform ?? "darwin",
    stdin: { isTTY: patch.tty ?? false, readable: true },
    stdout: { writable: true, write: (s: any) => record("stdout", s) },
    stderr: { write: (s: any) => record("stderr", s) },
    exit: (code: any) => record("process.exit", code),
  });
  const token = (s: string) => Symbol(s),
    tokens = {
      log: token("log"),
      snapshot: token("snapshot"),
      shell: token("shell"),
      pty: token("pty"),
      child: token("child"),
      team: token("team"),
      session: token("session"),
      hook: token("hook"),
    };
  const services = new Map<any, any>([
    [
      tokens.log,
      {
        storeSync: (...a: any[]) => record("store", ...a),
        flushSync: () => record("logs"),
      },
    ],
    [tokens.snapshot, { clearCache: () => record("snapshot") }],
    [tokens.shell, { disposeAll: async () => record("shell") }],
    [tokens.pty, { destroyAllSessions: () => record("pty") }],
    [tokens.child, { destroyAllProcesses: () => record("child") }],
    [
      tokens.team,
      {
        isInTeam: () => patch.team ?? true,
        isAutoTeam: () => patch.autoTeam ?? true,
        deleteTeam: async () => record("team.delete"),
        cleanupSessionTeams: async () => record("team.cleanup"),
      },
    ],
    [
      tokens.session,
      { getCurrent: () => (patch.noSession ? undefined : { id: "owned" }) },
    ],
    [
      tokens.hook,
      {
        executeSessionEndHooks: async (s: any, r: any) =>
          record("session.end", s, r),
      },
    ],
  ]);
  const timer = (map: Map<any, any>, fn: any, ms: number) => {
    const id = { unref: () => record("unref", ms) };
    map.set(id, { fn, ms });
    return id;
  };
  const runtime: any = {
    process: proc,
    console: {
      error: (...a: any[]) =>
        record(
          "console.error",
          ...a.map((x) => (x instanceof Error ? x.message : x)),
        ),
      warn: (...a: any[]) => record("console.warn", ...a),
      log: (...a: any[]) => record("console.log", ...a),
    },
    Date: { now: () => 1000 },
    setTimeout: (fn: any, ms: number) => timer(timeouts, fn, ms),
    clearTimeout: (id: any) => timeouts.delete(id),
    setInterval: (fn: any, ms: number) => timer(intervals, fn, ms),
    clearInterval: (id: any) => intervals.delete(id),
    modules: {
      80699: {
        ContainerUtil: {
          get: (t: any) => {
            if (patch.missing === t.description) throw Error("missing");
            return services.get(t);
          },
        },
      },
      92735: { LoggerStorageService: tokens.log },
      94377: semver,
      68366: { TeamManager: tokens.team },
      26106: { PRODUCT_CLI_NAME: "codebuddy" },
      93441: {
        flushTelemetryBeforeExit: async (ms: any) => {
          record("telemetry.flush", ms);
          await patch.flushGate;
        },
        shutdownTelemetryBeforeExit: async (ms: any) =>
          record("telemetry.shutdown", ms),
      },
      97352: { packageJson: patch.packageJson ?? { version: "5.3.14" } },
      79488: { GatewayProcessService: tokens.child },
      32110: { GatewayPtyService: tokens.pty },
      80588: { killAllSandboxCliSync: () => record("kill") },
      99006: {
        SessionManager: tokens.session,
        SessionHookManager: tokens.hook,
      },
      19702: { ShellService: tokens.shell },
      35179: { ShellSnapshotService: tokens.snapshot },
      54193: {
        stopTeamLeadPoller: () => record("poller.stop"),
        getTeamMemberRegistry: () => ({
          destroyAll: async () => record("members.destroy"),
        }),
      },
      9151: { LogLevel: { Error: 4 } },
      36648: {
        SafeExitUtils: {
          exit: (code: any) => {
            record("safe.exit", code);
            finish();
          },
        },
      },
      70064: {
        WindowsBashUtils: {
          findBashPath: () => {
            if (patch.bashError) throw Error(patch.bashError);
            return patch.bash;
          },
        },
      },
    },
  };
  if (patch.telemetry) runtime.modules[93441] = patch.telemetry;
  const api = factory(runtime);
  return { api, proc, calls, timeouts, intervals, runtime, done };
}
export const PROCESS_LIFECYCLE_CASES: {
  name: string;
  run(factory: typeof installNativeProcessLifecycle): Promise<any>;
}[] = [
  {
    name: "original full shutdown order and single-flight guard",
    async run(factory) {
      const f = processLifecycleFixture(factory);
      await f.api.exit("clear");
      await f.api.exit("resume");
      assert.deepEqual(
        f.calls.map((c) => c[0]),
        [
          "unref",
          "telemetry.flush",
          "snapshot",
          "shell",
          "pty",
          "child",
          "poller.stop",
          "members.destroy",
          "team.delete",
          "team.cleanup",
          "session.end",
          "telemetry.shutdown",
          "safe.exit",
        ],
      );
      assert.equal(f.calls[10][2], "clear");
      assert.equal(f.timeouts.size, 0);
      assert.equal(f.proc.listenerCount("SIGINT"), 0);
      assert.equal(f.proc.noDeprecation, true);
      return f.calls;
    },
  },
  {
    name: "local cleanup failures continue, outer telemetry and hook failures short circuit",
    async run(factory) {
      const out = [];
      for (const fail of [
        "snapshot",
        "shell",
        "pty",
        "child",
        "members.destroy",
        "team.cleanup",
        "telemetry.flush",
        "session.end",
        "telemetry.shutdown",
      ]) {
        const f = processLifecycleFixture(factory, { fail });
        await f.api.exit();
        assert.equal(f.calls.at(-1)[0], "safe.exit");
        assert.equal(f.timeouts.size, 0);
        if (fail === "telemetry.flush")
          assert.equal(
            f.calls.some((c) => c[0] === "shell"),
            false,
          );
        if (fail === "session.end")
          assert.equal(
            f.calls.some((c) => c[0] === "telemetry.shutdown"),
            false,
          );
        out.push(f.calls);
      }
      return out;
    },
  },
  {
    name: "absent current session and non-auto team skip dependent cleanup",
    async run(factory) {
      const f = processLifecycleFixture(factory, {
        noSession: true,
        autoTeam: false,
      });
      await f.api.exit();
      assert.equal(
        f.calls.some(
          (c) => c[0] === "session.end" || c[0] === "members.destroy",
        ),
        false,
      );
      assert.equal(
        f.calls.some((c) => c[0] === "team.cleanup"),
        true,
      );
      return f.calls;
    },
  },
  {
    name: "five-second timeout invokes wrapped exit while pending shutdown remains single flight",
    async run(factory) {
      let release: any;
      const gate = new Promise<void>((r) => (release = r)),
        f = processLifecycleFixture(factory, { flushGate: gate });
      const first = f.api.exit();
      await f.api.exit("resume");
      const t = [...f.timeouts.values()][0];
      assert.equal(t.ms, 5000);
      t.fn();
      assert.deepEqual(f.calls.slice(-2), [["kill"], ["process.exit", 1]]);
      release();
      await first;
      assert.equal(f.timeouts.size, 0);
      return f.calls;
    },
  },
  {
    name: "signal diagnostic and synchronous log flush precede asynchronous exit",
    async run(factory) {
      const out = [];
      for (const signal of ["SIGQUIT", "SIGTERM", "SIGHUP"]) {
        const f = processLifecycleFixture(factory);
        f.proc.emit(signal);
        await f.done;
        assert.equal(f.calls[0][0], "store");
        assert.equal(f.calls[1][0], "logs");
        out.push(f.calls);
      }
      return out;
    },
  },
  {
    name: "TTY orphan polling is unrefed and cancels itself before shutdown",
    async run(factory) {
      const f = processLifecycleFixture(factory, { tty: true });
      assert.equal([...f.intervals.values()][0].ms, 30000);
      const tick = [...f.intervals.values()][0].fn;
      tick();
      assert.equal(f.intervals.size, 1);
      f.proc.stdout.writable = false;
      tick();
      await f.done;
      assert.equal(f.intervals.size, 0);
      const disabled = processLifecycleFixture(factory, {
        tty: true,
        env: { CODEBUDDY_DISABLE_ORPHAN_TTY_CHECK: "1" },
      });
      assert.equal(disabled.intervals.size, 0);
      return f.calls;
    },
  },
  {
    name: "unhandled rejection persists only; stream exceptions emit JSON; broken streams exit",
    async run(factory) {
      const f = processLifecycleFixture(factory, {
        argv: ["--output-format=stream-json"],
      });
      f.proc.emit("unhandledRejection", "owned rejection");
      f.proc.emit("uncaughtException", "owned exception");
      assert.deepEqual(f.calls.at(-1), [
        "stdout",
        '{"type":"error","error":"owned exception"}\n',
      ]);
      const e = Object.assign(new Error("pipe failure"), {
        code: "EPIPE",
        stack: "Error: pipe failure\nat owned",
      });
      f.proc.emit("uncaughtException", e);
      assert.deepEqual(f.calls.slice(-2), [["kill"], ["process.exit", 1]]);
      assert.equal(f.timeouts.size, 0);
      f.proc.emit("beforeExit", 0);
      f.proc.emit("exit", 0);
      return f.calls;
    },
  },
  {
    name: "diagnostics preserve limits, error code and escaped stack",
    async run(factory) {
      const f = processLifecycleFixture(factory);
      const e = Object.assign(new Error("x".repeat(2001)), {
        code: "OWNED",
        stack: "a\nb\r\n" + "s".repeat(4100),
      });
      const text = f.api.formatExitDiagnostic("owned", e);
      assert.match(text, /truncated 1/);
      assert.match(text, /code=OWNED/);
      assert.match(text, /\\n/);
      assert.equal(
        f.api.formatExitDiagnostic("empty", null),
        "[ProcessExit] empty",
      );
      return text;
    },
  },
  {
    name: "version and Node checks retain original gates with explicit nonterminating process fixture",
    async run(factory) {
      const out = [];
      for (const patch of [
        {
          argv: ["--version"],
          packageJson: {
            version: "base",
            publishConfig: { customPackage: { version: "custom" } },
          },
        },
        { argv: ["--version", "question"] },
        { node: "18.20.7" },
      ]) {
        const f = processLifecycleFixture(factory, patch);
        out.push(f.calls);
      }
      assert.deepEqual(out[0], [
        ["console.log", "custom"],
        ["process.exit", 0],
      ]);
      assert.deepEqual(out[1], []);
      assert.equal(out[2]![1][1], 1);
      return out;
    },
  },
  {
    name: "Windows Bash discovery updates SHELL or preserves original notice and skip branches",
    async run(factory) {
      const out = [];
      for (const patch of [
        { bash: "C:/bash.exe" },
        {},
        { env: { CODEBUDDY_SKIP_GIT_BASH_CHECK: "1", SHELL: "owned" } },
        { bashError: "lookup failed" },
      ]) {
        const f = processLifecycleFixture(factory, {
          platform: "win32",
          ...patch,
        });
        out.push({
          calls: f.calls.map((c) =>
            c[0] === "console.warn" && String(c[1]).startsWith("Error:")
              ? [c[0], "owned stack"]
              : c,
          ),
          shell: f.proc.env.SHELL,
        });
      }
      assert.equal(out[0]!.shell, "C:/bash.exe");
      assert.equal(out[1]!.shell, undefined);
      assert.equal(out[2]!.shell, "owned");
      return out;
    },
  },
  {
    name: "debug forced uncaught branch is retained behind explicit environment gate",
    async run(factory) {
      const f = processLifecycleFixture(factory, {
        env: { CODEBUDDY_DEBUG_FORCE_CRASH: "uncaught" },
      });
      const timer = [...f.intervals.values()][0];
      assert.equal(timer.ms, 200);
      assert.throws(timer.fn, /forced uncaught exception/);
      assert.equal(f.intervals.size, 0);
      return f.calls;
    },
  },
];

import { createNativeSafeExit } from "../../src/runtime/native-safe-exit.js";
export function safeExitScenarios(factory = createNativeSafeExit) {
  const results: any[] = [];
  for (const mode of ["plain", "tty", "raw-fails", "write-fails"]) {
    const calls: any[] = [];
    const process = {
      stdin: {
        isTTY: mode !== "plain",
        setRawMode(value: any) {
          calls.push(["raw", value]);
          if (mode === "raw-fails") throw Error("raw");
        },
      },
      stdout: {
        isTTY: mode !== "plain",
        write(value: any) {
          calls.push(["write", value]);
          if (mode === "write-fails") throw Error("write");
        },
      },
      exit: (code: any) => calls.push(["exit", code]),
    };
    const native = factory({ process });
    native.SafeExitUtils.exit(7);
    assert.deepEqual(calls.at(-1), ["exit", 7]);
    if (mode === "plain") assert.equal(calls.length, 1);
    else
      assert.deepEqual(calls.slice(0, 2), [
        ["raw", false],
        ["write", "\x1b[?25h"],
      ]);
    results.push(calls);
  }
  return results;
}
