import { EventEmitter } from "node:events";
import * as path from "node:path";
import * as decoder from "node:string_decoder";
import { createRequire } from "node:module";
const semver = createRequire(import.meta.url)("semver");
import { createNativeSandboxCLI } from "../../src/sandbox/native-sandbox-cli.js";
import { createNativeSandboxProtocol } from "../../src/sandbox/native-sandbox-protocol.js";
export function sandboxCliFixture(
  factory = createNativeSandboxCLI,
  overrides: any = {},
) {
  const timers = new Map<any, { callback: () => any; ms: number }>(),
    immediates: (() => any)[] = [];
  const writes: any[] = [],
    signals: string[] = [],
    pids = new Set<number>(),
    reports: any[] = [],
    logs: any[] = [];
  const child: any = new EventEmitter();
  child.pid = 4321;
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  child.kill = (signal: string) => {
    signals.push(signal);
    queueMicrotask(() => child.emit("close", 0, signal));
    return true;
  };
  const proc: any = Object.assign(new EventEmitter(), {
    env: {
      SANDBOX_CLI_PATH: "/owned/sandbox-cli",
      ACC_PRODUCT_CONFIG: "remove-me",
      PATH: "/owned/bin",
    },
    platform: "linux",
    arch: "x64",
    execPath: "/owned/node",
    pid: 123,
    cwd: () => "/owned/work",
  });
  const protocol = createNativeSandboxProtocol();
  const runtime: any = {
    process: proc,
    Date: { now: () => 100000 },
    Math: { random: () => 0.5 },
    console: { warn: (...a: any[]) => logs.push(a) },
    setTimeout(callback: () => any, ms: number) {
      const h = {
        unref() {
          return h;
        },
      };
      timers.set(h, { callback, ms });
      return h;
    },
    clearTimeout: (h: any) => timers.delete(h),
    setImmediate: (fn: () => any) => {
      immediates.push(fn);
      return fn;
    },
    modules: {
      69278: {},
      74674: protocol.getModule(74674),
      35317: {
        spawn: (...a: any[]) => {
          writes.push(a);
          return child;
        },
      },
      16928: path,
      79896: { existsSync: () => false },
      44237: {
        PathUtils: {
          getRootPathSync: () => "/owned/root",
          isBunCompiled: () => false,
        },
      },
      43121: {
        getSandboxCliPath: () => undefined,
        getExpectedSandboxCliPath: () => undefined,
      },
      80588: {
        registerSandboxCliPid: (pid: number) => pids.add(pid),
        unregisterSandboxCliPid: (pid: number) => pids.delete(pid),
      },
      94377: semver,
      54601: { randomBytes: () => Buffer.alloc(8, 1) },
      6453: { isWindows: () => false },
      13193: decoder,
    },
    ...overrides,
  };
  const native = factory(runtime);
  const logger = Object.fromEntries(
    ["info", "debug", "warn", "error"].map((k) => [
      k,
      (...a: any[]) => logs.push([k, ...a]),
    ]),
  );
  const telemetryReporter = {
    reportDaemonFailure: (x: any) => reports.push(x),
  };
  const client: any = Object.assign(new native.SandboxCLIClientImpl(), {
    logger,
  });
  const manager: any = Object.assign(
    new native.SandboxCLIProcessManagerImpl(),
    { logger, telemetryReporter },
  );
  const lifecycle: any = Object.assign(new native.SandboxCLILifecycleImpl(), {
    logger,
    client,
    processManager: manager,
    telemetryReporter,
  });
  async function fire(ms: number) {
    for (const [h, t] of [...timers])
      if (t.ms === ms) {
        timers.delete(h);
        t.callback();
      }
    for (let i = 0; i < 8; i++) await Promise.resolve();
  }
  async function flush() {
    for (const fn of immediates.splice(0)) await fn();
  }
  return {
    native,
    protocol,
    runtime,
    child,
    proc,
    client,
    manager,
    lifecycle,
    timers,
    writes,
    signals,
    pids,
    reports,
    logs,
    fire,
    flush,
  };
}
