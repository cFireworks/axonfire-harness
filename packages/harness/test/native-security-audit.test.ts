import test from "node:test";
import { createNativeSecurityAudit } from "../src/sandbox/native-security-audit.js";
import { SECURITY_AUDIT_CASES } from "../scripts/helpers/security-audit-scenarios.js";
for (const scenario of SECURITY_AUDIT_CASES)
  test(scenario.name, () => { scenario.run(createNativeSecurityAudit); });
