import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { tmpdir } from "node:os";
import { createNativeSecurityAudit } from "../../src/sandbox/native-security-audit.js";
type Factory = typeof createNativeSecurityAudit;
const timestamp = 1700000000000;
class FixedDate extends Date {
  static now() {
    return timestamp;
  }
}
function fixture(
  factory: Factory,
  run: (audit: any, root: string, env: Record<string, string>) => unknown,
) {
  const root = fs.mkdtempSync(path.join(tmpdir(), "native-audit-"));
  const env: Record<string, string> = { CODEBUDDY_ENABLE_SECURITY_AUDIT: "1" };
  try {
    return run(
      factory({
        process: { env, pid: 1234 },
        Date: FixedDate,
        Buffer,
        modules: {
          54601: crypto,
          79896: fs,
          16928: path,
          44237: { PathUtils: { getHomeDir: () => root } },
        },
      }),
      root,
      env,
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}
function entries(a: any) {
  return a.readSecurityAuditLogForTest().entries;
}
export const SECURITY_AUDIT_CASES: {
  name: string;
  run: (factory: Factory) => unknown;
}[] = [
  {
    name: "audit exact environment gate and ungated read",
    run: (f) =>
      fixture(f, (a, root, env) => {
        for (const flag of ["", "true", "0"]) {
          env.CODEBUDDY_ENABLE_SECURITY_AUDIT = flag;
          a.appendSecurityAuditEntry({});
        }
        assert.deepEqual(fs.readdirSync(root), []);
        env.CODEBUDDY_ENABLE_SECURITY_AUDIT = "1";
        a.appendSecurityAuditEntry({});
        env.CODEBUDDY_ENABLE_SECURITY_AUDIT = "0";
        const e = entries(a);
        assert.deepEqual(e, [
          { category: "system", eventType: "system.event", timestamp },
        ]);
        return e;
      }),
  },
  {
    name: "audit redaction retains raw hash and caps preview",
    run: (f) =>
      fixture(f, (a) => {
        const command =
          "curl https://alice:secret@example.test Authorization: Bearer hidden --token=sensitive MY_TOKEN=private";
        a.appendCommandSafetyAuditLog("approved", {
          command: "  " + command + "  ",
          sessionId: "s",
        });
        a.appendCommandSafetyAuditLog("unknown", { command: "x".repeat(1100) });
        a.appendCommandSafetyAuditLog("rejected", {});
        const e = entries(a);
        assert.equal(
          e[0].commandHash,
          crypto.createHash("sha256").update(command).digest("hex"),
        );
        for (const secret of [
          "alice",
          "secret",
          "hidden",
          "sensitive",
          "private",
        ])
          assert.ok(!e[0].commandPreview.includes(secret));
        assert.equal(e[1].commandPreview.length, 1024);
        assert.ok(e[1].commandPreview.endsWith("… (truncated)"));
        assert.equal(e[1].decision, "info");
        assert.equal(e[2].commandPreview, "<unknown>");
        return e;
      }),
  },
  {
    name: "audit repairs missing LF and ignores malformed spool records",
    run: (f) =>
      fixture(f, (a, root) => {
        a.appendSecurityAuditEntry({ eventType: "first" });
        const dir = path.join(root, "audit-log/spool");
        const file = path.join(dir, fs.readdirSync(dir)[0]!);
        fs.writeFileSync(file, '{"prior":true}');
        a.appendSecurityAuditEntry({ eventType: "second" });
        const text = fs.readFileSync(file, "utf8");
        assert.ok(text.startsWith('{"prior":true}\n'));
        assert.ok(text.endsWith("\n"));
        fs.writeFileSync(path.join(dir, "zz.jsonl"), 'bad\n{"last":true}\n');
        fs.writeFileSync(path.join(dir, "ignore.txt"), '{"ignored":true}');
        const e = entries(a);
        assert.equal(e.length, 3);
        assert.deepEqual(e[0], { prior: true });
        assert.deepEqual(e[2], { last: true });
        return e;
      }),
  },
  {
    name: "audit swallows filesystem and serialization failures",
    run: (f) =>
      fixture(f, (a, root) => {
        fs.writeFileSync(path.join(root, "audit-log"), "blocked directory");
        assert.doesNotThrow(() => a.appendSecurityAuditEntry({}));
        assert.deepEqual(entries(a), []);
        fs.unlinkSync(path.join(root, "audit-log"));
        const cyclic: any = {};
        cyclic.self = cyclic;
        assert.doesNotThrow(() => a.appendSecurityAuditEntry(cyclic));
        assert.deepEqual(entries(a), []);
        a.appendSecurityAuditEntry({ eventType: "recovered" });
        assert.equal(entries(a).length, 1);
        return entries(a);
      }),
  },
  {
    name: "audit mask priority bulk target cap and file decisions",
    run: (f) =>
      fixture(f, (a) => {
        const masks = [undefined, 0, 1, 2, 3, 4, 7].map((x) =>
          a.fileSafetyOperationFromActionMask(x),
        );
        assert.deepEqual(masks, [
          "access",
          "access",
          "read",
          "write",
          "write",
          "delete",
          "delete",
        ]);
        a.appendBulkDeleteAuditLog("needs-approval", {
          command: "rm many",
          count: 8,
          threshold: 5,
          targets: ["a", "b", "c", "d", "e", "f"],
        });
        a.appendFileSafetyAuditLog("block-listed", {
          paths: ["a", "b"],
          operation: "delete",
          matchedRule: "rule",
        });
        const e = entries(a);
        assert.equal(e[0].messageParams.targets, "a, b, c, d, e");
        assert.equal(e[0].decision, "info");
        assert.equal(e[1].decision, "blocked");
        assert.ok(e[1].messageKey.endsWith("deleteWithRule"));
        return { masks, e };
      }),
  },
  {
    name: "audit network outcomes and original sandbox block categorization",
    run: (f) =>
      fixture(f, (a) => {
        a.appendNetworkAccessAuditLog(" ", true);
        a.appendSandboxBlockAuditLog({ target: " " });
        assert.deepEqual(entries(a), []);
        a.appendNetworkAccessAuditLog(" example.test ", true);
        a.appendNetworkAccessAuditLog("example.test", false, {
          reason: " denied ",
        });
        a.appendNetworkAccessAuditLog("example.test", "blocked");
        a.appendSandboxBlockAuditLog({
          target: " /workspace/file ",
          blockType: "file",
        });
        const e = entries(a);
        assert.deepEqual(
          e.map((v: any) => v.decision),
          ["allowed", "failed", "blocked", "blocked"],
        );
        assert.equal(e[1].messageParams.reason, "denied");
        assert.equal(e[3].eventType, "sandbox.network.blocked");
        return e;
      }),
  },
];
