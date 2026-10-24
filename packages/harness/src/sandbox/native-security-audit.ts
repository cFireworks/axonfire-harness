// @ts-nocheck
// Complete fixed-sample module; IO occurs only when exported operations are called.
export const SECURITY_AUDIT_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const SECURITY_AUDIT_MODULE = [48973, 13359527, 13369210] as const;
/** Parent supplies node namespaces and PathUtils; no implicit home-directory IO. */
export function createNativeSecurityAudit(runtime: any) {
  const process = runtime.process;
  const Date = runtime.Date ?? globalThis.Date;
  const Buffer = runtime.Buffer ?? globalThis.Buffer;
  if (!process) throw new Error("Security audit requires runtime.process");
  const factories = {
    48973(eA, el, ec) {
      "use strict";
      (ec.r(el),
        ec.d(el, {
          appendBulkDeleteAuditLog: () => appendBulkDeleteAuditLog,
          appendCommandSafetyAuditLog: () => appendCommandSafetyAuditLog,
          appendFileSafetyAuditLog: () => appendFileSafetyAuditLog,
          appendNetworkAccessAuditLog: () => appendNetworkAccessAuditLog,
          appendSandboxBlockAuditLog: () => appendSandboxBlockAuditLog,
          appendSecurityAuditEntry: () => appendSecurityAuditEntry,
          fileSafetyOperationFromActionMask: () =>
            fileSafetyOperationFromActionMask,
          readSecurityAuditLogForTest: () => readSecurityAuditLogForTest,
        }));
      var eu = ec(54601),
        ed = ec(79896),
        ep = ec(16928),
        eg = ec(44237);
      let eh = "CODEBUDDY_ENABLE_SECURITY_AUDIT";
      function isSecurityAuditEnabled() {
        return "1" === process.env[eh];
      }
      let ef = "audit-log",
        em = "spool",
        eE = 1024,
        eC = "… (truncated)",
        ey = "[REDACTED]";
      function truncateCommandPreview(eA) {
        if (eA.length <= eE) return eA;
        let el = eE - eC.length;
        return `${eA.slice(0, Math.max(0, el))}${eC}`;
      }
      function redactCommandPreview(eA) {
        return eA
          .replace(
            /\b([a-z][a-z0-9+.-]*:\/\/)([^/\s:@]+):([^@\s/]+)@/gi,
            `$1${ey}:${ey}@`,
          )
          .replace(
            /\b(Authorization:\s*(?:Bearer|Basic)\s+)(?:"[^"]*"|'[^']*'|[^\s"']+)/gi,
            `$1${ey}`,
          )
          .replace(
            /(--(?:token|password|passwd|pwd|api-key|apikey|secret|access-token|auth-token)(?:=|\s+))(?:"[^"]*"|'[^']*'|[^\s"']+)/gi,
            `$1${ey}`,
          )
          .replace(
            /\b([A-Za-z_][A-Za-z0-9_]*(?:TOKEN|PASSWORD|PASSWD|SECRET|API_KEY|APIKEY|ACCESS_TOKEN|AUTH_TOKEN)[A-Za-z0-9_]*=)(?:"[^"]*"|'[^']*'|[^\s"']+)/g,
            `$1${ey}`,
          );
      }
      function createCommandPreview(eA) {
        return truncateCommandPreview(redactCommandPreview(eA));
      }
      function hashSubject(eA) {
        return (0, eu.createHash)("sha256").update(eA).digest("hex");
      }
      let ew = {
        approved: "approved",
        rejected: "rejected",
        "allow-listed": "allowed",
        "allow-matched": "allowed",
        "excluded-command": "allowed",
        "exec-policy-allow": "allowed",
        "bypass-legacy-silent": "allowed",
        "session-cache-hit": "allowed",
        "sensitive-session-cache-hit": "allowed",
        "pre-exec-bypass-approved": "approved",
        "pre-exec-bypass-rejected": "rejected",
        "auto-approved": "allowed",
        "sandbox-executed": "allowed",
        success: "allowed",
        "safety-filter-allow-override": "allowed",
        blocked: "blocked",
        "block-listed": "blocked",
        "exec-policy-forbidden": "blocked",
        "credential-or-opaque-blocked": "blocked",
        "system-tool-blocked": "blocked",
        "system-tool-confirm-approved": "approved",
        "system-tool-confirm-rejected": "rejected",
        "system-tool-auto-executed": "allowed",
        "system-tool-session-cache-hit": "allowed",
        failed: "failed",
      };
      function decisionFromAction(eA) {
        return ew[eA] ?? "info";
      }
      function formatSpoolDate(eA) {
        let el = new Date(eA),
          ec = el.getFullYear(),
          eu = String(el.getMonth() + 1).padStart(2, "0"),
          ed = String(el.getDate()).padStart(2, "0");
        return `${ec}-${eu}-${ed}`;
      }
      function getSecurityAuditSpoolPath(eA) {
        return (0, ep.join)(
          eg.PathUtils.getHomeDir(),
          ef,
          em,
          `audit-spool-${process.pid}-${formatSpoolDate(eA)}.jsonl`,
        );
      }
      function readSpoolAuditLog() {
        try {
          let eA = (0, ep.join)(eg.PathUtils.getHomeDir(), ef, em),
            el = [];
          for (let ec of (0, ed.readdirSync)(eA)
            .filter((eA) => eA.endsWith(".jsonl"))
            .sort())
            for (let eu of (0, ed.readFileSync)(
              (0, ep.join)(eA, ec),
              "utf-8",
            ).split("\n")) {
              let eA = eu.trim();
              if (eA)
                try {
                  el.push(JSON.parse(eA));
                } catch {}
            }
          return { entries: el };
        } catch {
          return { entries: [] };
        }
      }
      let eB = new Set();
      function needsJsonlLineBreak(eA) {
        let el;
        try {
          el = (0, ed.openSync)(eA, "r");
          let ec = (0, ed.fstatSync)(el);
          if (0 === ec.size) return !1;
          let eu = Buffer.alloc(1);
          return ((0, ed.readSync)(el, eu, 0, 1, ec.size - 1), 10 !== eu[0]);
        } catch (eA) {
          if (eA?.code === "ENOENT") return !1;
          throw eA;
        } finally {
          void 0 !== el && (0, ed.closeSync)(el);
        }
      }
      function appendSecurityAuditEntry(eA) {
        if (isSecurityAuditEnabled())
          try {
            let el = eA.timestamp ?? Date.now(),
              ec = getSecurityAuditSpoolPath(el),
              eu = (0, ep.dirname)(ec);
            eB.has(eu) ||
              ((0, ed.mkdirSync)(eu, { recursive: !0 }), eB.add(eu));
            let eg = eA.category ?? "system",
              eh = needsJsonlLineBreak(ec) ? "\n" : "",
              ef = {
                ...eA,
                category: eg,
                eventType: eA.eventType ?? `${eg}.event`,
                timestamp: el,
              };
            (0, ed.appendFileSync)(
              ec,
              `${eh}${JSON.stringify(ef)}
`,
              "utf-8",
            );
          } catch {}
      }
      function appendCommandSafetyAuditLog(eA, el) {
        let ec = el.command?.trim() || "<unknown>",
          eu = createCommandPreview(ec),
          ed = formatCommandSafetyAuditMessage(eA, eu, el.matchedRule);
        appendSecurityAuditEntry({
          sessionId: el.sessionId,
          requestId: el.requestId,
          toolCallId: el.toolCallId,
          category: "command-safety",
          eventType: `command-safety.${eA}`,
          decision: decisionFromAction(eA),
          commandPreview: eu,
          commandHash: hashSubject(ec),
          messageKey: ed.messageKey,
          messageParams: ed.messageParams,
        });
      }
      let e_ = 2,
        eI = 4,
        ev = 1;
      function fileSafetyOperationFromActionMask(eA) {
        return "number" != typeof eA
          ? "access"
          : eA & eI
            ? "delete"
            : eA & e_
              ? "write"
              : eA & ev
                ? "read"
                : "access";
      }
      function appendFileSafetyAuditLog(eA, el) {
        let ec = formatFileSafetyAuditMessage(
          eA,
          el.paths.length > 0 ? el.paths.join(", ") : "<unknown>",
          el.operation ?? "access",
          el.matchedRule,
        );
        appendSecurityAuditEntry({
          sessionId: el.sessionId,
          requestId: el.requestId,
          toolCallId: el.toolCallId,
          category: "file-safety",
          eventType: `file-safety.${eA}`,
          decision: decisionFromAction(eA),
          messageKey: ec.messageKey,
          messageParams: ec.messageParams,
        });
      }
      function appendBulkDeleteAuditLog(eA, el) {
        let ec = el.command?.trim() || "<unknown>",
          eu = createCommandPreview(ec),
          ed = { command: eu };
        ("number" == typeof el.count && (ed.count = el.count),
          "number" == typeof el.threshold && (ed.threshold = el.threshold),
          el.targets?.length &&
            (ed.targets = el.targets.slice(0, 5).join(", ")));
        let ep = "needs-approval" === eA ? "needsApproval" : eA;
        appendSecurityAuditEntry({
          sessionId: el.sessionId,
          requestId: el.requestId,
          toolCallId: el.toolCallId,
          category: "file-safety",
          eventType: `file-safety.bulk-delete.${eA}`,
          decision: decisionFromAction(eA),
          commandPreview: eu,
          commandHash: hashSubject(ec),
          messageKey: `securityCenter.audit.fileSafety.bulkDelete.${ep}`,
          messageParams: ed,
        });
      }
      function formatCommandSafetyAuditMessage(eA, el, ec) {
        let eu = { command: el };
        ec && (eu.matchedRule = ec);
        let ed = "securityCenter.audit.commandSafety";
        switch (eA) {
          case "ask-matched":
            return {
              messageKey: `${ed}.askMatched${ec ? "WithRule" : ""}`,
              messageParams: eu,
            };
          case "allow-matched":
            return {
              messageKey: `${ed}.allowMatched${ec ? "WithRule" : ""}`,
              messageParams: eu,
            };
          case "excluded-command":
            return { messageKey: `${ed}.excludedCommand`, messageParams: eu };
          case "exec-policy-allow":
            return {
              messageKey: `${ed}.execPolicyAllow${ec ? "WithRule" : ""}`,
              messageParams: eu,
            };
          case "exec-policy-forbidden":
            return {
              messageKey: `${ed}.execPolicyForbidden${ec ? "WithRule" : ""}`,
              messageParams: eu,
            };
          case "bypass-legacy-silent":
            return {
              messageKey: `${ed}.bypassLegacySilent`,
              messageParams: eu,
            };
          case "session-cache-hit":
            return { messageKey: `${ed}.sessionCacheHit`, messageParams: eu };
          case "sensitive-session-cache-hit":
            return {
              messageKey: `${ed}.sensitiveSessionCacheHit`,
              messageParams: eu,
            };
          case "pre-exec-bypass-requested":
            return {
              messageKey: `${ed}.preExecBypassRequested`,
              messageParams: eu,
            };
          case "pre-exec-bypass-approved":
            return {
              messageKey: `${ed}.preExecBypassApproved`,
              messageParams: eu,
            };
          case "pre-exec-bypass-rejected":
            return {
              messageKey: `${ed}.preExecBypassRejected`,
              messageParams: eu,
            };
          case "allow-overridden-by-credential":
            return {
              messageKey: ec
                ? `${ed}.allowOverriddenByCredentialWithRule`
                : `${ed}.allowOverriddenByCredential`,
              messageParams: eu,
            };
          case "allow-overridden-by-opaque-host":
            return {
              messageKey: ec
                ? `${ed}.allowOverriddenByOpaqueHostWithRule`
                : `${ed}.allowOverriddenByOpaqueHost`,
              messageParams: eu,
            };
          case "credential-or-opaque-blocked":
            return {
              messageKey: ec
                ? `${ed}.credentialOrOpaqueBlockedWithRule`
                : `${ed}.credentialOrOpaqueBlocked`,
              messageParams: eu,
            };
          case "safety-filter-ask-override":
            return {
              messageKey: `${ed}.safetyFilterAskOverride`,
              messageParams: eu,
            };
          case "safety-filter-allow-override":
            return {
              messageKey: `${ed}.safetyFilterAllowOverride`,
              messageParams: eu,
            };
          case "auto-approved":
            return { messageKey: `${ed}.autoApproved`, messageParams: eu };
          case "sandbox-executed":
            return { messageKey: `${ed}.sandboxExecuted`, messageParams: eu };
          case "approved":
            return { messageKey: `${ed}.approved`, messageParams: eu };
          case "rejected":
            return { messageKey: `${ed}.rejected`, messageParams: eu };
          default:
            return { messageKey: `${ed}.fallback`, messageParams: eu };
        }
      }
      function formatFileSafetyAuditMessage(eA, el, ec, eu) {
        let ed = { paths: el };
        eu && (ed.matchedRule = eu);
        let ep = "securityCenter.audit.fileSafety",
          eg = "access" === ec ? "" : `.${ec}`;
        switch (eA) {
          case "block-listed":
            return {
              messageKey: eu
                ? `${ep}.blockListed${eg}WithRule`
                : `${ep}.blockListed${eg}`,
              messageParams: ed,
            };
          case "allow-listed":
            return {
              messageKey: eu
                ? `${ep}.allowListed${eg}WithRule`
                : `${ep}.allowListed${eg}`,
              messageParams: ed,
            };
          case "auto-approved":
            return { messageKey: `${ep}.autoApproved${eg}`, messageParams: ed };
          case "needs-approval":
            return {
              messageKey: `${ep}.needsApproval${eg}`,
              messageParams: ed,
            };
          case "approved":
            return {
              messageKey: eu
                ? `${ep}.approved${eg}WithRule`
                : `${ep}.approved${eg}`,
              messageParams: ed,
            };
          case "rejected":
            return {
              messageKey: eu
                ? `${ep}.rejected${eg}WithRule`
                : `${ep}.rejected${eg}`,
              messageParams: ed,
            };
          default:
            return { messageKey: `${ep}.fallback`, messageParams: ed };
        }
      }
      function appendNetworkAccessAuditLog(eA, el, ec = {}) {
        let eu = eA.trim();
        if (!eu) return;
        let ed = "boolean" == typeof el ? (el ? "success" : "failed") : el,
          ep = formatNetworkAccessAuditMessage(eu, ed, ec.reason);
        appendSecurityAuditEntry({
          category: "network",
          eventType: `network.${ed}`,
          decision: decisionFromAction(ed),
          messageKey: ep.messageKey,
          messageParams: ep.messageParams,
        });
      }
      function formatNetworkAccessAuditMessage(eA, el, ec) {
        let eu = ec?.trim(),
          ed = { target: eA };
        eu && (ed.reason = eu);
        let ep = "securityCenter.audit.network";
        switch (el) {
          case "success":
            return { messageKey: `${ep}.success`, messageParams: ed };
          case "blocked":
            return { messageKey: `${ep}.blocked`, messageParams: ed };
          case "failed":
            return {
              messageKey: eu ? `${ep}.failedWithReason` : `${ep}.failed`,
              messageParams: ed,
            };
          default:
            return { messageKey: `${ep}.failed`, messageParams: ed };
        }
      }
      function appendSandboxBlockAuditLog(eA) {
        let el = eA.target.trim();
        el &&
          appendSecurityAuditEntry({
            category: "sandbox",
            eventType: "sandbox.network.blocked",
            decision: "blocked",
            messageKey: "securityCenter.audit.sandbox.networkBlocked",
            messageParams: { target: el },
          });
      }
      function readSecurityAuditLogForTest() {
        return readSpoolAuditLog();
      }
    },
  };
  function requireModule(id) {
    const value = runtime.modules?.[id] ?? runtime.getModule?.(id);
    if (value === undefined)
      throw new Error("Missing security audit module " + id);
    return value;
  }
  requireModule.r = (value) =>
    Object.defineProperty(value, "__esModule", { value: true });
  requireModule.d = (value, getters) => {
    for (const [key, get] of Object.entries(getters))
      Object.defineProperty(value, key, { enumerable: true, get });
  };
  const exports = {};
  factories[48973]({ exports }, exports, requireModule);
  return exports;
}
