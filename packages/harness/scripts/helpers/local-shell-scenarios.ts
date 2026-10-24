import { createNodeShellIO } from "../../src/sandbox/node-shell-io.js";
import { createNativeLocalShellServices } from "../../src/sandbox/native-local-shell-services.js";
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as cp from "node:child_process";
import { EventEmitter } from "node:events";
import { sandboxShellFixture } from "./sandbox-shell-fixture.js";
import { safeDeleteFixture } from "./safe-delete-fixture.js";
import { createNativeLocalShell } from "../../src/sandbox/native-local-shell.js";
export function localShellFixture(
  factory = createNativeLocalShell,
  ownedRoot?: string,
) {
  const safe = safeDeleteFixture(undefined, { root: ownedRoot }),
    root = safe.root,
    registrations: any[] = [],
    logs: any[] = [],
    timers = new Set<any>();
  const proc = Object.assign(new EventEmitter(), {
    env: {
      PATH: process.env.PATH,
      HOME: root,
      SHELL: "/bin/bash",
      CODEBUDDY_DISABLE_SHELL_SNAPSHOT: "1",
    },
    platform: process.platform,
    arch: process.arch,
    pid: process.pid,
    stdout: { columns: 80, rows: 24 },
    cwd: () => root,
    kill: process.kill.bind(process),
    getuid: process.getuid?.bind(process),
    getgid: process.getgid?.bind(process),
    getgroups: process.getgroups?.bind(process),
  });
  const decorator =
    (kind: string) => (token?: any) => (target: any, key?: any) => {
      registrations.push([
        kind,
        typeof token === "symbol" ? token.description : token,
        key,
      ]);
    };
  const io = createNodeShellIO({ process: proc });
  const seed = sandboxShellFixture(undefined, {
    process: proc,
    modules: {
      79896: fs,
      70857: {
        ...os,
        homedir: () => root,
        tmpdir: () => path.join(root, "tmp"),
      },
      93130: io.iconv,
      23238: io.detector,
      5516: io.which,
      35317: cp,
      35568: safe.s,
    },
  });
  const runtime: any = {
    ...seed.runtime,
    process: proc,
    Date: { now: () => 1000 },
    Math: Object.assign(Object.create(Math), { random: () => 0.5 }),
    setTimeout: (fn: any, ms: number) => {
      const h = setTimeout(() => {
        timers.delete(h);
        fn();
      }, ms);
      timers.add(h);
      return h;
    },
    clearTimeout: (h: any) => {
      timers.delete(h);
      clearTimeout(h);
    },
    modules: {
      ...seed.runtime.modules,
      80699: {
        ...seed.runtime.modules[80699],
        Autowired: decorator("Autowired"),
        Component: decorator("Component"),
        Optional: decorator("Optional"),
        PostConstruct: decorator("PostConstruct"),
        Logger: Symbol("Logger"),
      },
      20852: { BashSandboxManager: Symbol("BashSandboxManager") },
      57126: { LegacySandboxShellService: Symbol("LegacySandboxShellService") },
      79814: { Workspace: Symbol("Workspace") },
      35151: { SettingsManager: Symbol("SettingsManager") },
      44237: { PathUtils: { getHomeDir: () => root } },
    },
    getModule: (id: number) => seed.native.getModule(id),
  };
  const logger = Object.fromEntries(
      ["info", "warn", "debug", "error", "setContext"].map((k) => [
        k,
        (...a: any[]) => logs.push([k, ...a]),
      ]),
    ),
    host = createNativeLocalShellServices({
      runtime,
      logger,
      workspace: { workspaceFolders: [{ uri: { fsPath: root } }] },
      settingsManager: {
        list: async () => ({ sandbox: { safeDeleteRuntimeEnabled: false } }),
      },
      sourceFactory: factory,
      bashSandboxManager: { wrapCommand: async (c: string) => c },
    }),
    native = host.native,
    service: any = host.localShell,
    snapshot: any = host.snapshot;
  assert.equal(host.bindings.get(native.LocalShellService), service);
  assert.equal(host.legacyShell.localShellService, service);
  return {
    native,
    service,
    snapshot,
    root,
    runtime,
    proc,
    logs,
    registrations,
    async close() {
      await service.disposeAll();
      snapshot.clearCache();
      for (const h of timers) clearTimeout(h);
      safe.close();
    },
  };
}
export const LOCAL_SHELL_CASES: {
  name: string;
  run(factory: typeof createNativeLocalShell, root?: string): Promise<any>;
}[] = [
  {
    name: "complete module registers original services, properties and init hooks",
    async run(factory, root) {
      const f = localShellFixture(factory, root);
      try {
        assert.equal(
          f.registrations.filter((x) => x[0] === "Component").length,
          3,
        );
        assert.equal(
          f.registrations.filter((x) => x[0] === "PostConstruct").length,
          2,
        );
        assert.equal(
          f.native.LocalShellService,
          f.native.getModule(19702).LocalShellService,
        );
        return f.registrations;
      } finally {
        await f.close();
      }
    },
  },
  {
    name: "legacy wrapper preserves original options identity when disabled and leaves handle ownership local",
    async run(factory, root) {
      const f = localShellFixture(factory, root);
      try {
        const calls: any[] = [],
          legacy: any = Object.assign(
            new f.native.LegacySandboxShellServiceImpl(),
            {
              logger: { info() {} },
              bashSandboxManager: { wrapCommand: async (c: string) => c },
              localShellService: {
                execute: async (o: any) => {
                  calls.push(o);
                  return o;
                },
              },
            },
          );
        const options = { command: "owned", cwd: "owned", timeout: 2 };
        assert.equal(await legacy.execute(options), options);
        legacy.bashSandboxManager.wrapCommand = async () => "wrapped owned";
        assert.deepEqual(await legacy.execute(options), {
          ...options,
          command: "wrapped owned",
        });
        await legacy.disposeAll();
        assert.equal(legacy.getActiveHandleCount(), 0);
        return calls;
      } finally {
        await f.close();
      }
    },
  },
  {
    name: "raw child executes owned command, captures both streams, exit code and releases active handle",
    async run(factory, root) {
      const f = localShellFixture(factory, root);
      try {
        const script = path.join(f.root, "owned.cjs");
        fs.writeFileSync(
          script,
          "process.stdout.write('owned stdout');process.stderr.write('owned stderr');process.exitCode=7;",
        );
        const h = await f.service.execute({
          command:
            JSON.stringify(process.execPath) + " " + JSON.stringify(script),
          rawCommand: true,
          usePty: false,
        });
        assert.equal(f.service.getActiveHandleCount(), 1);
        const r = await h.wait();
        assert.equal(r.exitCode, 7);
        assert.match(r.stdout, /owned stdout/);
        assert.match(r.stderr, /owned stderr/);
        await f.service.disposeAll();
        assert.equal(f.service.getActiveHandleCount(), 0);
        return {
          exitCode: r.exitCode,
          stdout: r.stdout.includes("owned stdout"),
          stderr: r.stderr.includes("owned stderr"),
        };
      } finally {
        await f.close();
      }
    },
  },
  {
    name: "invalid cwd rejects before spawning and original formatting retains two safe bootstrap insertions",
    async run(factory, root) {
      const f = localShellFixture(factory, root);
      try {
        await assert.rejects(
          f.service.execute({
            command: "owned",
            cwd: "missing",
            usePty: false,
          }),
          /Working directory/,
        );
        const posix = f.service.formatCommandPosix("printf '%s' owned", "bash");
        assert.match(posix, /eval '/);
        assert.equal(
          f.native.resolveWindowsHideOption(false).windowsHide,
          undefined,
        );
        assert.deepEqual(f.native.resolveWindowsHideOption(true), {
          windowsHide: true,
        });
        return {
          posix,
          disabled: f.native.wrapPowerShellCommandWithSafeDelete(" rm owned ", {
            enabled: false,
          }),
        };
      } finally {
        await f.close();
      }
    },
  },
  {
    name: "snapshot cache failure gate and shared pending creation preserve ownership",
    async run(factory, root) {
      const f = localShellFixture(factory, root);
      try {
        let count = 0,
          resolve: any;
        f.snapshot.createSnapshot = () => {
          count++;
          return new Promise((r) => (resolve = r));
        };
        const a = f.snapshot.getSnapshot(),
          b = f.snapshot.getSnapshot();
        assert.equal(count, 1);
        resolve(undefined);
        assert.equal(await a, undefined);
        assert.equal(await b, undefined);
        assert.equal(f.snapshot.creatingPromise, undefined);
        f.snapshot.creationFailed = true;
        assert.equal(await f.snapshot.getSnapshot(), undefined);
        assert.equal(count, 1);
        return { count, cached: f.snapshot.cachedSnapshot ?? null };
      } finally {
        await f.close();
      }
    },
  },
  {
    name: "snapshot helper reads only owned home and original cache cleanup removes snapshot",
    async run(factory, root) {
      const f = localShellFixture(factory, root);
      try {
        fs.writeFileSync(path.join(f.root, ".bashrc"), "# owned");
        assert.equal(f.native.getShellConfigFile("/bin/bash").exists, true);
        const file = path.join(f.root, "snapshot.sh");
        fs.writeFileSync(file, "# owned");
        f.snapshot.cachedSnapshot = { snapshotFilePath: file };
        assert.equal(await f.snapshot.getSnapshot(), file);
        f.snapshot.clearCache();
        assert.equal(fs.existsSync(file), false);
        return {
          fileName: f.native.generateSnapshotFileName("bash"),
          directory: path.basename(f.native.getSnapshotDirectory(f.root)),
          removed: true,
        };
      } finally {
        await f.close();
      }
    },
  },
];

LOCAL_SHELL_CASES.push(
  {
    name: "real Bash snapshot restores functions and aliases then releases exit listener and file",
    async run(factory, root) {
      const f = localShellFixture(factory, root);
      try {
        fs.writeFileSync(
          path.join(f.root, ".bashrc"),
          "alias owned_alias='printf owned-alias'\nowned_function() { printf owned-function; }\n_hidden_completion() { :; }\n__owned_helper() { printf owned-helper; }\n",
        );
        const file = await f.snapshot.getSnapshot();
        assert.equal(typeof file, "string", JSON.stringify(f.logs));
        const contents = fs.readFileSync(file, "utf8");
        assert.match(contents, /alias -- owned_alias=/);
        assert.equal(f.proc.listenerCount("exit"), 1);
        assert.equal(await f.snapshot.getSnapshot(), file);
        delete (f.proc.env as any).CODEBUDDY_DISABLE_SHELL_SNAPSHOT;
        const handle = await f.service.execute({
          command:
            'owned_function; printf "|"; owned_alias; printf "|"; __owned_helper',
          usePty: false,
        });
        const result = await handle.wait();
        assert.equal(result.exitCode, 0);
        assert.equal(result.stderr, "");
        assert.equal(result.stdout, "owned-function|owned-alias|owned-helper");
        const filter = await f.service.execute({
          command: "type _hidden_completion >/dev/null 2>&1",
          usePty: false,
        });
        assert.notEqual((await filter.wait()).exitCode, 0);
        f.snapshot.clearCache();
        assert.equal(f.proc.listenerCount("exit"), 0);
        assert.equal(fs.existsSync(file), false);
        return {
          contents,
          result,
          removed: true,
          listeners: f.proc.listenerCount("exit"),
        };
      } finally {
        await f.close();
      }
    },
  },
  {
    name: "real snapshot validation rejects output and syntax errors; creation command failure propagates",
    async run(factory, root) {
      const f = localShellFixture(factory, root);
      try {
        const file = path.join(f.root, "owned-validation.sh");
        fs.writeFileSync(file, "printf owned-noise");
        await assert.rejects(
          f.snapshot.validateSnapshot("/bin/bash", file),
          /Snapshot validation must be silent/,
        );
        fs.writeFileSync(file, "if then");
        await assert.rejects(
          f.snapshot.validateSnapshot("/bin/bash", file),
          /Snapshot validation failed/,
        );
        await assert.rejects(
          f.snapshot.executeSnapshotScript("/bin/bash", "exit 9"),
        );
        f.snapshot.cleanupPartialSnapshot(file);
        assert.equal(fs.existsSync(file), false);
        assert.equal(f.proc.listenerCount("exit"), 0);
        return {
          noiseRejected: true,
          syntaxRejected: true,
          executionRejected: true,
          removed: true,
        };
      } finally {
        await f.close();
      }
    },
  },
  {
    name: "original OutputSpiller counts UTF8 bytes and closes before owned file cleanup",
    async run(factory, root) {
      const f = localShellFixture(factory, root);
      try {
        const file = path.join(f.root, "output", "owned.txt"),
          spiller = new f.native.OutputSpiller(file);
        spiller.push("owned😀");
        spiller.push("\n");
        await spiller.close();
        assert.equal(spiller.totalBytes, 10);
        assert.equal(spiller.isClosed, true);
        assert.equal(spiller.hasError, false);
        spiller.push("ignored");
        await spiller.close();
        assert.equal(fs.readFileSync(file, "utf8"), "owned😀\n");
        await spiller.cleanup();
        assert.equal(fs.existsSync(file), false);
        return {
          bytes: spiller.totalBytes,
          closed: spiller.isClosed,
          error: spiller.hasError,
          removed: true,
        };
      } finally {
        await f.close();
      }
    },
  },
  {
    name: "real raw child timeout kills owned process group and settles wait with interrupted result",
    async run(factory, root) {
      const f = localShellFixture(factory, root);
      try {
        const script = path.join(f.root, "timeout.cjs");
        fs.writeFileSync(script, "setInterval(()=>{},1000);");
        let timeouts = 0;
        const handle = await f.service.execute({
          command:
            JSON.stringify(process.execPath) + " " + JSON.stringify(script),
          rawCommand: true,
          usePty: false,
          timeout: 250,
          onTimeout: () => {
            timeouts++;
            return false;
          },
        });
        const result = await handle.wait();
        assert.equal(result.interrupted, true);
        assert.equal(result.signal, "SIGTERM");
        assert.equal(timeouts, 1);
        assert.equal(f.service.getActiveHandleCount(), 0);
        assert.equal(handle.isAlive, false);
        return { result, timeouts, active: f.service.getActiveHandleCount() };
      } finally {
        await f.close();
      }
    },
  },
);

LOCAL_SHELL_CASES.push({
  name: "real PTY backend executes owned command through headless terminal without child-process fallback",
  async run(factory, root) {
    const f = localShellFixture(factory, root);
    try {
      const backend = await f.native.getModule(6453).getPty();
      assert.equal(backend?.name, "lydell-node-pty");
      const handle = await f.service.execute({
        command: "printf 'owned-pty\\n'",
        usePty: true,
        cols: 40,
        rows: 6,
      });
      assert.equal(handle.constructor.name, "ShellExecutionHandleImpl");
      const result = await handle.wait();
      assert.equal(result.exitCode, 0);
      assert.match(result.stdout, /owned-pty/);
      assert.equal(result.stderr, "");
      assert.equal(f.service.getActiveHandleCount(), 0);
      assert.equal(handle.isAlive, false);
      handle.dispose();
      return {
        result,
        backend: backend.name,
        active: f.service.getActiveHandleCount(),
      };
    } finally {
      await f.close();
    }
  },
});
