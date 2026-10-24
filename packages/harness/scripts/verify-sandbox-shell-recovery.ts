import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { sandboxCliProcessScenario } from "./helpers/sandbox-cli-process-scenario.js";
import { createNativeSandboxCLI } from "../src/sandbox/native-sandbox-cli.js";
import { createNativeSandboxRules } from "../src/sandbox/native-sandbox-rules.js";
import { createNativeBashSandboxManager } from "../src/sandbox/native-bash-sandbox-manager.js";
import { loadCapturedSandboxCLI } from "./helpers/captured-sandbox-cli.js";
import { loadCapturedSandboxRules } from "./helpers/captured-sandbox-rules.js";
import { loadCapturedBashSandboxManager } from "./helpers/captured-bash-sandbox-manager.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedSandboxShell } from "./helpers/captured-sandbox-shell.js";
import { SANDBOX_SHELL_CASES } from "./helpers/sandbox-shell-scenarios.js";
import { createNativeSandboxShell } from "../src/sandbox/native-sandbox-shell.js";
const source = loadCapturedSandboxShell(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of SANDBOX_SHELL_CASES)
  assert.deepEqual(
    await c.run(createNativeSandboxShell),
    await c.run(source),
    c.name,
  );
if (process.platform !== "win32") {
  const cli = readFileSync(getCapturedBundlePath(), "utf8"),
    root = mkdtempSync(join(tmpdir(), "axonfire-shell-pair-"));
  assert.deepEqual(
    await sandboxCliProcessScenario(
      createNativeSandboxCLI,
      createNativeSandboxRules,
      createNativeBashSandboxManager,
      root,
      createNativeSandboxShell,
    ),
    await sandboxCliProcessScenario(
      loadCapturedSandboxCLI(cli),
      loadCapturedSandboxRules(cli),
      loadCapturedBashSandboxManager(cli),
      root,
      source,
    ),
  );
}
console.log(
  JSON.stringify({
    classes: 3,
    members: 58,
    modules: 11,
    declarationGroups: 9,
    comparisons: SANDBOX_SHELL_CASES.length,
    realProcessPairs: process.platform === "win32" ? 0 : 1,
    bootstrapExecuted: false,
    ok: true,
  }),
);
