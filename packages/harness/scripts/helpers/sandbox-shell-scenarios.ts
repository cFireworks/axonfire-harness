import assert from "node:assert/strict";
import { createNativeSandboxShell } from "../../src/sandbox/native-sandbox-shell.js";
import { sandboxShellFixture } from "./sandbox-shell-fixture.js";
const b64 = (s: string | Buffer) => Buffer.from(s).toString("base64");
export const SANDBOX_SHELL_CASES: {
  name: string;
  run(factory: typeof createNativeSandboxShell): Promise<any>;
}[] = [
  {
    name: "pipe preserves split UTF-8, independent stderr, ANSI removal and denial records",
    async run(factory) {
      const f = sandboxShellFixture(factory),
        h = f.handle();
      const utf = Buffer.from("你");
      assert.equal(h.handleOutput(b64(utf.subarray(0, 2)), "stdout"), "");
      h.handleOutput(b64("\x1b[31merr\x1b[0m"), "stderr");
      h.handleOutput(b64(utf.subarray(2)), "stdout");
      h.handleOutput(b64("!"), "stdout");
      const pending = h.wait();
      h.handleExit(
        3,
        false,
        [{ path: "/denied", actionMask: 1 }],
        [{ host: "host", port: 443, scheme: "https", actionMask: 2 }],
      );
      const result = await pending;
      h.handleExit(99);
      assert.equal(result.stdout, "你!");
      assert.equal(result.stderr, "err");
      assert.equal(f.exits.length, 1);
      assert.equal(await h.wait(), result);
      h.dispose();
      return { result, data: f.data, outputs: f.outputs, alive: h.isAlive };
    },
  },
  {
    name: "pipe symbolic keys differ from PTY, write/kill/dispose preserve original wire behavior",
    async run(factory) {
      const f = sandboxShellFixture(factory),
        h = f.handle();
      h.sendKey("ENTER");
      h.sendKey("CTRL_A");
      h.sendKey("UNKNOWN");
      h.resize(10, 10);
      await h.kill("SIGKILL");
      h.dispose();
      h.write("ignored");
      await Promise.resolve();
      assert.equal(
        Buffer.from(f.requests[0].payload.data, "base64").toString(),
        "enter",
      );
      assert.equal(f.requests.length, 4);
      h.handleExit(0);
      return f.requests;
    },
  },
  {
    name: "abort and timeout mark interruption but dispose alone does not resolve wait",
    async run(factory) {
      const f = sandboxShellFixture(factory),
        abort = new AbortController(),
        h = f.handle(false, { abortSignal: abort.signal, timeout: 10 });
      abort.abort();
      assert.equal(f.requests[0].payload.signal, "term");
      const timer = [...f.timers.values()][0]!;
      timer.fn();
      let settled = false;
      void h.wait().then(() => {
        settled = true;
      });
      h.dispose();
      await Promise.resolve();
      assert.equal(settled, false);
      assert.equal(f.timers.size, 0);
      h.handleExit(-1, true);
      const result = await h.wait();
      assert.equal(result.interrupted, true);
      return { result, requests: f.requests };
    },
  },
  {
    name: "PTY uses original headless terminal, alternate buffer, colors and key protocol",
    async run(factory) {
      const f = sandboxShellFixture(factory),
        h = f.handle(true);
      let alternate = 0;
      h.onAlternateBuffer(() => alternate++);
      h.sendKey("UP");
      h.sendKey("CTRL_A");
      h.resize(20, 4);
      h.handleOutput(b64("\x1b[31mred\x1b[0m\r\nline"));
      await new Promise<void>((resolve) =>
        h.headlessTerminal.write("", resolve),
      );
      const screen = h.getScreen(),
        color = h.getColorScreen();
      assert.match(screen, /red/);
      assert.match(JSON.stringify(color), /red/);
      h.handleOutput(b64("\x1b[?1049halt"));
      await new Promise<void>((resolve) =>
        h.headlessTerminal.write("", resolve),
      );
      assert.equal(h.usedAlternateBuffer(), true);
      assert.equal(alternate, 1);
      assert.equal(f.requests[0].payload.key, "up");
      h.handleExit(0);
      const result = await h.wait();
      h.dispose();
      assert.equal(f.timers.size, 0);
      return { screen, color, result, requests: f.requests, alternate };
    },
  },
  {
    name: "original terminal truncation constants are runtime scoped",
    async run(factory) {
      const f = sandboxShellFixture(factory, {
          process: {
            env: { BASH_MAX_OUTPUT_LENGTH: "10", LANG: "en_US.UTF-8" },
            platform: "linux",
            stdout: {},
            cwd: () => "/owned/work",
          },
        }),
        h = f.handle();
      h.handleOutput(b64("abcdefghijklmnop"), "stdout");
      h.handleExit(0);
      const result = await h.wait();
      h.dispose();
      assert.match(result.stdout, /truncated 6 bytes/);
      assert.equal(f.native.getModule(19702).MAX_SHELL_OUTPUT_LENGTH, 10);
      return result;
    },
  },
  {
    name: "shell execution routes reverse output, audit, telemetry and enriched wait result",
    async run(factory) {
      const f = sandboxShellFixture(factory),
        s = f.service;
      s.init();
      await f.ready();
      await f.ready();
      const h = await s.execute({ command: "echo owned", rawCommand: true });
      assert.equal(s.getActiveHandleCount(), 1);
      await f.reverse({
        command: "ProcessOutput",
        data: { processId: "p1", data: b64("ok"), stream: "stdout" },
      });
      await f.reverse({ command: "ReportEvent", data: { name: "owned" } });
      await f.reverse({
        command: "ProcessExit",
        data: {
          processId: "p1",
          exitCode: 0,
          fileBlockRecords: [
            { path: "/blocked", actionMask: 1 },
            {
              path: "/exec",
              actionMask: 1,
              raw: { operation: "process-exec" },
            },
          ],
          networkBlockRecords: [
            { host: "denied", port: 443, scheme: "https", actionMask: 1 },
          ],
        },
      });
      const result = await h.wait();
      assert.equal(result.stdout, "ok");
      assert.deepEqual(result.sandboxBlockedPaths, ["/blocked"]);
      assert.equal(result.safeReportAttached, true);
      assert.equal(s.getActiveHandleCount(), 0);
      h.dispose();
      return {
        result,
        requests: f.requests,
        reports: f.reports,
        audits: f.audits,
      };
    },
  },
  {
    name: "original shell does not infer sandbox denial from stderr or nonzero exit without actionable audit records",
    async run(factory) {
      const results = [];
      for (const records of [
        undefined,
        [],
        [{ path: "/owned/blocked", actionMask: 0 }],
        [{ path: "/owned/blocked", actionMask: 1, raw: { operation: "process-exec" } }],
      ]) {
        const f = sandboxShellFixture(factory), s = f.service;
        s.init();
        await f.ready();
        const h = await s.execute({ command: "cat /owned/blocked", rawCommand: true });
        await f.reverse({ command: "ProcessOutput", data: {
          processId: "p1", stream: "stderr", data: b64("cat: /owned/blocked: Operation not permitted"),
        } });
        const data: any = { processId: "p1", exitCode: 1 };
        if (records !== undefined) data.fileBlockRecords = records;
        await f.reverse({ command: "ProcessExit", data });
        const result = await h.wait();
        assert.equal(result.exitCode, 1);
        assert.match(result.stderr, /Operation not permitted/);
        assert.equal(result.fileBlockRecords, records);
        assert.equal(result.sandboxDenied, undefined);
        assert.equal(result.sandboxBlockedPaths, undefined);
        assert.equal(s.getActiveHandleCount(), 0);
        h.dispose();
        results.push(result);
      }
      return results;
    },
  },
  {
    name: "connection loss force-exits pending handles and clears tracking",
    async run(factory) {
      const f = sandboxShellFixture(factory),
        s = f.service;
      s.init();
      await f.ready();
      const h = await s.execute({ command: "echo owned", rawCommand: true });
      f.disconnect();
      const result = await h.wait();
      assert.equal(result.exitCode, -1);
      assert.equal(result.interrupted, false);
      assert.equal(s.processHandles.size, 0);
      assert.equal(s.activeHandles.size, 0);
      h.dispose();
      return result;
    },
  },
  {
    name: "original command exclusions, unavailable lifecycle and missing session fall back locally",
    async run(factory) {
      const f = sandboxShellFixture(factory),
        s = f.service;
      f.setConfig({ excludedCommands: ["echo"] });
      const excluded = await s.execute({ command: "A=b /bin/echo owned" });
      f.setConfig({});
      f.setReadyError(Error("offline"));
      const offline = await s.execute({ command: "echo offline" });
      f.setReadyError(undefined);
      f.lifecycle.getOpenedSessionId = () => null as any;
      const missing = await s.execute({ command: "echo no-session" });
      assert.equal(f.requests.length, 0);
      return { excluded, offline, missing };
    },
  },
  {
    name: "shell maps sandbox errors and rejects invalid process responses",
    async run(factory) {
      const f = sandboxShellFixture(factory);
      f.setResponse(Error("SandboxError(0x5) failed"));
      await assert.rejects(
        f.service.execute({ command: "owned", rawCommand: true }),
        /executable not found/,
      );
      f.setResponse({});
      await assert.rejects(
        f.service.execute({ command: "owned", rawCommand: true }),
        /invalid.*response/i,
      );
      assert.equal(f.service.activeHandles.size, 0);
      return f.requests;
    },
  },
  {
    name: "rule deltas preserve expansion, ordering, full-access skip and aggregated errors",
    async run(factory) {
      const f = sandboxShellFixture(factory),
        s = f.service;
      const delta = {
        network: {
          added: [{ endpoint: "example.com", type: "allow" }],
          removed: [{ endpoint: "old.test" }],
        },
        file: {
          added: [{ path: "$WORK/new", type: "allow" }],
          removed: [{ path: "$WORK/old" }],
        },
      };
      await s.applyRulesDelta(delta);
      assert.equal(f.requests.length, 4);
      s.turnConfig.permissionMode = "fullAccess";
      await s.applyRulesDelta(delta);
      assert.equal(f.requests.length, 4);
      s.turnConfig.permissionMode = "default";
      f.setResponse(Error("denied"));
      await assert.rejects(s.applyRulesDelta(delta));
      assert.equal(f.requests.length, 8);
      return f.requests;
    },
  },
  {
    name: "shell formatting preserves duplicate safe bootstrap and original env defaults",
    async run(factory) {
      const f = sandboxShellFixture(factory),
        s = f.service;
      f.runtime.process.env.WORKBUDDY_EXTRA_PATHS = "/one:/two";
      const command = s.buildSandboxCommand({
        command: "echo 'owned'",
        env: { KEEP: "yes" },
        toolCallId: "t",
      });
      assert.equal(
        (command.args.at(-1).match(/safe_bootstrap/g) || []).length,
        2,
      );
      assert.equal(command.env.PYTHONUTF8, "1");
      assert.equal(command.env.CODEBUDDY_SAFE_DELETE_SANDBOX, "1");
      assert.equal(s.formatCommand(" x ", "powershell"), "x");
      return command;
    },
  },
  {
    name: "staged cleanup retries failures and disposeAll clears tracked handles",
    async run(factory) {
      const f = sandboxShellFixture(factory),
        s = f.service;
      let calls = 0;
      const cleanup = s._trackStagedScriptCleanup(() => {
        if (++calls === 1) throw Error("busy");
      });
      cleanup();
      assert.equal(s.stagedScriptCleanups.size, 1);
      cleanup();
      cleanup();
      assert.equal(calls, 2);
      const h = await s.execute({ command: "owned", rawCommand: true });
      await s.disposeAll();
      assert.equal(s.getActiveHandleCount(), 0);
      assert.equal(s.processHandles.size, 0);
      assert.equal(h.isAlive, false);
      assert.equal(s.stagedScriptCleanups.size, 0);
      h.handleExit(-1, true);
      return { calls, requests: f.requests, result: await h.wait() };
    },
  },
];
SANDBOX_SHELL_CASES.push(
  {
    name: "Windows payload staging sweeps once, preserves script bytes and retries cleanup",
    async run(factory) {
      const writes: any[] = [],
        removed: any[] = [];
      let sequence = 0;
      const f = sandboxShellFixture(factory, {
        process: {
          title: "owned-node",
          env: { LANG: "en_US.UTF-8" },
          platform: "win32",
          pid: 123,
          stdout: {},
          cwd: () => "/owned/work",
        },
        modules: {
          70857: {
            platform: () => "win32",
            tmpdir: () => "C:/owned/tmp",
            release: () => "10.0.22631",
          },
          79896: {
            readdirSync: () => [
              {
                name: "codebuddy-shell-payload-stale",
                isDirectory: () => true,
              },
              { name: "unrelated", isDirectory: () => true },
            ],
            statSync: () => ({ mtimeMs: -1e9 }),
            rmSync: (...args: any[]) => removed.push(args),
            mkdtempSync: (prefix: string) => prefix + ++sequence,
            writeFileSync: (...args: any[]) => writes.push(args),
          },
        },
      });
      const one = f.native.stageWindowsBashScript(
          ["-c"],
          "bash",
          "echo 'one'\n",
        ),
        two = f.native.stageWindowsBashScript(["-c"], "bash", "echo two");
      assert.equal(writes[0][1], "echo 'one'\n");
      assert.equal(writes[0][2].mode, 384);
      assert.equal(removed.length, 1);
      one.cleanup();
      one.cleanup();
      two.cleanup();
      assert.equal(removed.length, 3);
      assert.equal(f.service._needsSafeDeleteShellWrap("rm"), true);
      assert.equal(f.service._needsSafeDeleteShellWrap("echo"), false);
      return { args: [one.args, two.args], writes, removed };
    },
  },
  {
    name: "parent shell token namespace and truncation limit retain identity",
    async run(factory) {
      const parent = {
          ShellService: Symbol("parent"),
          LocalShellService: Symbol("local"),
          MAX_SHELL_OUTPUT_LENGTH: 5,
        },
        f = sandboxShellFixture(factory, { modules: { 19702: parent } }),
        h = f.handle();
      assert.equal(f.native.getModule(19702), parent);
      h.handleOutput(b64("abcdefgh"), "stdout");
      h.handleExit(0);
      const result = await h.wait();
      h.dispose();
      assert.match(result.stdout, /truncated 3 bytes/);
      return result;
    },
  },
  {
    name: "invalid working directory fails before sandbox request and PTY abort is preserved",
    async run(factory) {
      const f = sandboxShellFixture(factory, {
        modules: {
          79896: {
            statSync: () => {
              throw Error("missing");
            },
          },
        },
      });
      await assert.rejects(
        f.service.execute({ command: "echo owned" }),
        /Working directory does not exist/,
      );
      assert.equal(f.requests.length, 0);
      const abort = new AbortController();
      abort.abort();
      const h = f.handle(true, { abortSignal: abort.signal, timeout: 20 });
      assert.equal(f.requests[0].payload.signal, "term");
      h.handleExit(-1, true);
      const result = await h.wait();
      h.dispose();
      assert.equal(result.interrupted, true);
      assert.equal(f.timers.size, 0);
      return result;
    },
  },
);
