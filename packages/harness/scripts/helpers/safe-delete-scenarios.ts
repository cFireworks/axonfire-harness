import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { createNativeSafeDelete } from "../../src/sandbox/native-safe-delete.js";
import { safeDeleteFixture } from "./safe-delete-fixture.js";
const marker = "[safe-delete][SAFE_DELETE_BULK_CONFIRM_REQUIRED]";
export const SAFE_DELETE_CASES: {
  name: string;
  run(factory: typeof createNativeSafeDelete, root?: string): Promise<any>;
}[] = [
  {
    name: "desktop-only safe-delete settings preserve strict threshold validation and failure default",
    async run(factory, root) {
      const f = safeDeleteFixture(factory, { root });
      try {
        const values = [];
        for (const sandbox of [
          {},
          { safeDeleteRuntimeEnabled: false, safeDeleteBulkThreshold: 4 },
          { safeDeleteBulkThreshold: 0 },
          { safeDeleteBulkThreshold: "12" },
          { safeDeleteBulkThreshold: 99999 },
        ])
          values.push(
            await f.s.resolveSafeDeleteRuntimeConfig(
              { list: async () => ({ sandbox }) },
              f.logger,
              "test",
            ),
          );
        values.push(
          await f.s.resolveSafeDeleteRuntimeConfig(
            {
              list: async () => {
                throw Error("offline");
              },
            },
            f.logger,
            "test",
          ),
        );
        f.runtime.process.env.CODEBUDDY_HOST = "cli";
        f.native.getModule(75753).__resetHostDetectionCache();
        values.push(
          await f.s.resolveSafeDeleteRuntimeConfig(
            {
              list: () => {
                throw Error("must not read");
              },
            },
            f.logger,
            "test",
          ),
        );
        assert.deepEqual(values[1], { enabled: false, bulkThreshold: 4 });
        assert.deepEqual(values.at(-1), { enabled: false, bulkThreshold: 50 });
        return { values, logs: f.logs };
      } finally {
        f.close();
      }
    },
  },
  {
    name: "actual shim resources produce original env and deduplicate injected paths",
    async run(factory, root) {
      const f = safeDeleteFixture(factory, { root });
      try {
        const options = {
            enabled: true,
            sessionId: "session",
            conversationRequestId: "turn",
            toolCallId: "tool",
            bulkThreshold: 7,
          },
          env = f.s.buildSafeDeleteEnv(
            {
              PATH: "/owned/bin",
              NODE_OPTIONS: "--trace-warnings",
              PYTHONPATH: "/owned/python",
            },
            options,
          ),
          again = f.s.buildSafeDeleteEnv(env, options);
        assert.deepEqual(again, env);
        assert.equal(env.CODEBUDDY_SAFE_DELETE_BULK_THRESHOLD, "7");
        assert.equal(
          env.BASH_ENV,
          path.join(f.root, "vendor/shim/safe-bin/safe-delete-bash-env.sh"),
        );
        assert.match(env.NODE_OPTIONS, /genie-safe-delete.cjs/);
        assert.equal(env.CODEBUDDY_NODE_BIN, process.execPath);
        assert.equal(env.CODEBUDDY_CONVERSATION_REQUEST_ID, "turn");
        assert.equal(
          fs
            .statSync(path.dirname(env.CODEBUDDY_SAFE_DELETE_REPORT_PATH))
            .isDirectory(),
          true,
        );
        return env;
      } finally {
        f.close();
      }
    },
  },
  {
    name: "missing resources cache absence and disabled injection leaves input untouched",
    async run(factory, root) {
      const f = safeDeleteFixture(factory, { root, assets: false });
      try {
        const input = { PATH: "/owned", NODE_OPTIONS: "keep" },
          a = f.s.buildSafeDeleteEnv(input),
          b = f.s.buildSafeDeleteEnv(input, { enabled: false });
        assert.deepEqual(a, input);
        assert.notEqual(a, input);
        assert.deepEqual(b, input);
        return { a, b };
      } finally {
        f.close();
      }
    },
  },
  {
    name: "report parser validates entries, removes file and attaches to same result",
    async run(factory, root) {
      const f = safeDeleteFixture(factory, { root });
      try {
        const report = path.join(f.root, "report.jsonl");
        fs.writeFileSync(
          report,
          "\ufeff" +
            JSON.stringify({
              operation: "trash",
              path: "/owned/a",
              runtime: "node",
              timestamp: 10,
            }) +
            "\ninvalid\n" +
            JSON.stringify({ operation: "delete", path: "/ignored" }) +
            "\n" +
            JSON.stringify({
              operation: "trash",
              path: "/owned/b",
              runtime: "unknown",
            }) +
            "\n",
        );
        const result: any = {
            stdout: "",
            safeDeleteEvents: [{ operation: "trash", path: "/previous" }],
          },
          same = f.s.attachSafeDeleteReportEvents(result, report, f.logger);
        assert.equal(same, result);
        assert.equal(fs.existsSync(report), false);
        assert.equal(result.safeDeleteEvents.length, 3);
        assert.deepEqual(f.s.readSafeDeleteReport(report, f.logger), []);
        return result;
      } finally {
        f.close();
      }
    },
  },
  {
    name: "bulk marker parsing handles escaped braces and limits sample targets",
    async run(factory, root) {
      const f = safeDeleteFixture(factory, { root });
      try {
        const text =
            marker +
            JSON.stringify({
              count: 70,
              threshold: 50,
              targets: ["brace }", 1, 'quote "', "c", "d", "e", "f"],
            }),
          parsed = f.s.parseSafeDeleteBulkConfirmInfo(text);
        assert.equal(parsed.targets.length, 5);
        assert.equal(parsed.count, 70);
        assert.equal(
          f.s.parseSafeDeleteBulkConfirmInfo(
            marker + '{"count":"70","threshold":50}',
          ),
          undefined,
        );
        const escalated = f.s.shouldEscalateSafeDeleteBulkConfirm(
          'bash -c "rm owned"',
          { stderr: text },
          0,
        );
        assert.deepEqual(escalated, parsed);
        assert.equal(
          f.s.shouldEscalateSafeDeleteBulkConfirm(
            "echo owned",
            { stderr: text },
            0,
          ),
          undefined,
        );
        assert.equal(
          f.s.shouldEscalateSafeDeleteBulkConfirm(
            "rm owned",
            { stderr: text },
            1,
          ),
          undefined,
        );
        return { parsed, escalated };
      } finally {
        f.close();
      }
    },
  },
  {
    name: "fail-closed escalation and helper process records preserve original classification",
    async run(factory, root) {
      const f = safeDeleteFixture(factory, { root });
      try {
        const commands = [
            "rm a",
            "node script.js",
            "python3 x.py",
            "Remove-Item C:\\a",
            "echo safe",
            'sh -c "unlink a"',
          ],
          matches = commands.map((c) => [
            f.s.matchesSafeDeleteEscalationCommand(c),
            f.s.shouldEscalateSafeDeleteFailClosed(
              c,
              { stderr: "SAFE_DELETE_FAIL_CLOSED" },
              0,
            ),
          ]);
        assert.deepEqual(matches[4], [false, false]);
        assert.equal(
          f.s.shouldEscalateSafeDeleteFailClosed(
            "rm a",
            { stdout: "SAFE_DELETE_FAIL_CLOSED" },
            1,
          ),
          false,
        );
        const records = [
          { path: "/usr/bin/osascript", raw: { operation: "process-exec" } },
          {
            path: "/bin/sh",
            command: "SAFE_DELETE something",
            raw: { operation: "process-execve" },
          },
          {
            path: "/vendor/genie-trash/darwin-arm64",
            raw: { operation: "read" },
          },
        ].map((r) => f.s.isSafeDeleteHelperProcessExecRecord(r));
        assert.deepEqual(records, [true, true, false]);
        return {
          matches,
          records,
          bootstrap: ["bash", "sh", "zsh", "powershell"].map((s) =>
            f.s.buildSafeDeletePosixBootstrap(s),
          ),
        };
      } finally {
        f.close();
      }
    },
  },
  {
    name: "signal file is consumed even for invalid JSON and rejects unsupported type",
    async run(factory, root) {
      const f = safeDeleteFixture(factory, { root });
      try {
        const ctx = { sessionDir: f.root, toolCallId: "tool" },
          file = path.join(f.root, "signal-tool.json"),
          results = [];
        for (const text of [
          "bad",
          JSON.stringify({ type: "unknown", payload: {} }),
          JSON.stringify({ type: "confirmRequired", payload: { count: 5 } }),
          JSON.stringify({ type: "rejected", payload: { count: 6 } }),
        ]) {
          fs.writeFileSync(file, text);
          results.push(f.s.readBulkGuardSignalFile(ctx));
          assert.equal(fs.existsSync(file), false);
        }
        assert.equal(results[0], undefined);
        assert.equal(results[2].type, "confirmRequired");
        return results;
      } finally {
        f.close();
      }
    },
  },
  {
    name: "shipped bulk guard CLI counts owned files, signals, approves and rejects without deleting",
    async run(factory, root) {
      const f = safeDeleteFixture(factory, { root });
      try {
        const target = path.join(f.root, "owned-target");
        fs.mkdirSync(target);
        fs.writeFileSync(path.join(target, "a"), "a");
        fs.writeFileSync(path.join(target, "b"), "b");
        const guard = path.join(
            f.root,
            "vendor/shim/safe-delete-bulk-guard.cjs",
          ),
          ctx = f.s.createSafeDeleteBulkGuardContext({
            stateRoot: path.join(f.root, "state"),
            sessionId: "session",
            conversationRequestId: "turn",
            toolCallId: "tool",
            threshold: 2,
          });
        const env = {
          ...process.env,
          CODEBUDDY_SAFE_DELETE_BULK_STATE_DIR: ctx.stateRoot,
          CODEBUDDY_SESSION_ID: ctx.sessionId,
          CODEBUDDY_TOOL_CALL_ID: ctx.toolCallId,
          CODEBUDDY_CONVERSATION_REQUEST_ID: "turn",
          CODEBUDDY_SAFE_DELETE_BULK_THRESHOLD: "2",
        };
        const run = () =>
          spawnSync(process.execPath, [guard, "check", "--target", target], {
            env,
            encoding: "utf8",
          });
        const initial = run();
        assert.equal(initial.status, 2);
        const signal = f.s.readBulkGuardSignalFile(ctx);
        assert.equal(signal.type, "confirmRequired");
        const parsed = f.s.parseSafeDeleteBulkConfirmInfo(initial.stderr);
        f.s.approveSafeDeleteBulkGuard(ctx, "turn");
        assert.equal(run().status, 0);
        f.s.rejectSafeDeleteBulkGuard(ctx, signal.payload);
        assert.equal(run().status, 3);
        const rejected = f.s.readBulkGuardSignalFile(ctx);
        assert.equal(rejected.type, "rejected");
        assert.equal(fs.readFileSync(path.join(target, "a"), "utf8"), "a");
        const lib = createRequire(import.meta.url)(guard);
        assert.equal(lib.DEFAULT_THRESHOLD, 20);
        assert.equal(f.s.DEFAULT_SAFE_DELETE_BULK_THRESHOLD, 50);
        return { parsed, signal, rejected, files: fs.readdirSync(target) };
      } finally {
        f.close();
      }
    },
  },
  {
    name: "Windows audit paths recover original target from fail-closed output before command",
    async run(factory, root) {
      const f = safeDeleteFixture(factory, {
        root,
        modules: {
          70857: { platform: () => "win32", tmpdir: () => "C:\\owned\\tmp" },
        },
      });
      try {
        const record = { path: "C:/$RECYCLE.BIN/SID/$Rabc" },
          output =
            "[safe-delete][SAFE_DELETE_FAIL_CLOSED] " +
            JSON.stringify({ target: "C:\\owned\\original.txt" }),
          resolved = f.s.resolveWindowsRecycleBinAuditPath(
            record,
            "rm /c/owned/fallback.txt",
            output,
          );
        assert.equal(resolved, "C:\\owned\\original.txt");
        assert.equal(
          f.s.normalizeWindowsShellPathForAudit("/c/owned/x"),
          "C:\\owned\\x",
        );
        assert.equal(
          f.s.normalizeWindowsShellPathForAudit("/tmp/probe"),
          "C:\\owned\\tmp\\probe",
        );
        return {
          resolved,
          filtered: f.s.filterSafeDeleteTempProbeNoise(
            [{ path: "C:\\owned\\tmp\\probe" }, { path: "C:\\owned\\keep" }],
            "rm C:\\owned\\keep",
            { stderr: "SAFE_DELETE_FAIL_CLOSED" },
          ),
        };
      } finally {
        f.close();
      }
    },
  },
  {
    name: "PowerShell env uses actual session and project fields",
    async run(factory, root) {
      const f = safeDeleteFixture(factory, { root });
      try {
        const env = f.s.buildPowerShellSafeDeleteEnv(
          {
            sessionSubject: { value: { id: "s", conversationRequestId: "c" } },
          },
          { enabled: true, bulkThreshold: 9 },
          { toolCallId: "t" },
        );
        assert.equal(env.CODEBUDDY_PROJECT_DIR, f.root);
        assert.equal(env.CODEBUDDY_SESSION_ID, "s");
        assert.equal(env.CODEBUDDY_SAFE_DELETE_BULK_THRESHOLD, "9");
        return env;
      } finally {
        f.close();
      }
    },
  },
];
SAFE_DELETE_CASES.push({
  name: "generated NODE_OPTIONS preloads original shim only inside an owned harmless child",
  async run(factory, root) {
    const f = safeDeleteFixture(factory, { root });
    try {
      const env = f.s.buildSafeDeleteEnv(
        {},
        { enabled: true, sessionId: "session", toolCallId: "tool" },
      );
      const probe = spawnSync(
        process.execPath,
        [
          "-e",
          "const fs=require('node:fs'); console.log(JSON.stringify({rm:fs.rmSync.name,promiseRm:fs.promises.rm.name}));",
        ],
        { env: { ...process.env, ...env }, cwd: f.root, encoding: "utf8" },
      );
      assert.equal(probe.status, 0, probe.stderr);
      const result = JSON.parse(probe.stdout);
      assert.equal(result.rm, "wrappedRmSync");
      assert.equal(result.promiseRm, "wrappedPromisesRm");
      return result;
    } finally {
      f.close();
    }
  },
});
