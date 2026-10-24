import { sandboxCliProcessScenario } from "./helpers/sandbox-cli-process-scenario.js";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createNativeSandboxCLI } from "../src/sandbox/native-sandbox-cli.js";
import { loadCapturedSandboxCLI } from "./helpers/captured-sandbox-cli.js";
import { createNativeSandboxRules } from "../src/sandbox/native-sandbox-rules.js";
import { loadCapturedSandboxRules } from "./helpers/captured-sandbox-rules.js";
import { createNativeBashSandboxManager } from "../src/sandbox/native-bash-sandbox-manager.js";
import { loadCapturedBashSandboxManager } from "./helpers/captured-bash-sandbox-manager.js";
import { createNativeSandboxShell } from "../src/sandbox/native-sandbox-shell.js";
import { loadCapturedSandboxShell } from "./helpers/captured-sandbox-shell.js";
import { createNativeSafeDelete } from "../src/sandbox/native-safe-delete.js";
import { loadCapturedSafeDelete } from "./helpers/captured-safe-delete.js";
import { createNativeSecurityAudit } from "../src/sandbox/native-security-audit.js";
import { loadCapturedSecurityAudit } from "./helpers/captured-security-audit.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedSandboxFinalization } from "./helpers/captured-sandbox-finalization.js";
import { SANDBOX_FINALIZATION_CASES } from "./helpers/sandbox-finalization-scenarios.js";
import { createNativeSandboxFinalization } from "../src/sandbox/native-sandbox-finalization.js";
const source = loadCapturedSandboxFinalization(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of SANDBOX_FINALIZATION_CASES)
  assert.deepEqual(
    await c.run(createNativeSandboxFinalization),
    await c.run(source),
    c.name,
  );
if (process.platform !== "win32") {
  const cli = readFileSync(getCapturedBundlePath(), "utf8"),
    root = mkdtempSync(join(tmpdir(), "axonfire-finalization-pair-"));
  assert.deepEqual(
    await sandboxCliProcessScenario(
      createNativeSandboxCLI,
      createNativeSandboxRules,
      createNativeBashSandboxManager,
      root,
      createNativeSandboxShell,
      createNativeSafeDelete,
      createNativeSecurityAudit,
      createNativeSandboxFinalization,
    ),
    await sandboxCliProcessScenario(
      loadCapturedSandboxCLI(cli),
      loadCapturedSandboxRules(cli),
      loadCapturedBashSandboxManager(cli),
      root,
      loadCapturedSandboxShell(cli),
      loadCapturedSafeDelete(cli),
      loadCapturedSecurityAudit(cli),
      source,
    ),
  );
}
console.log(
  JSON.stringify({
    classes: 4,
    members: 17,
    modules: 2,
    comparisons: SANDBOX_FINALIZATION_CASES.length,
    realProcessPairs: process.platform === "win32" ? 0 : 1,
    bootstrapExecuted: false,
    ok: true,
  }),
);
