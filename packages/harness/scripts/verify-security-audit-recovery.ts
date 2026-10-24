import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedSecurityAudit } from "./helpers/captured-security-audit.js";
import { SECURITY_AUDIT_CASES } from "./helpers/security-audit-scenarios.js";
import { createNativeSecurityAudit } from "../src/sandbox/native-security-audit.js";
const original = loadCapturedSecurityAudit(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const scenario of SECURITY_AUDIT_CASES)
  assert.deepEqual(
    scenario.run(createNativeSecurityAudit),
    scenario.run(original),
    scenario.name,
  );
console.log(
  JSON.stringify({
    modules: 1,
    comparisons: SECURITY_AUDIT_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
