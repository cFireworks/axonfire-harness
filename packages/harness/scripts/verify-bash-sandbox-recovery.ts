import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { sandboxCliProcessScenario } from "./helpers/sandbox-cli-process-scenario.js";
import { createNativeSandboxCLI } from "../src/sandbox/native-sandbox-cli.js";
import { createNativeSandboxRules } from "../src/sandbox/native-sandbox-rules.js";
import { loadCapturedSandboxCLI } from "./helpers/captured-sandbox-cli.js";
import { loadCapturedSandboxRules } from "./helpers/captured-sandbox-rules.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedBashSandboxManager } from "./helpers/captured-bash-sandbox-manager.js";
import { BASH_SANDBOX_CASES } from "./helpers/bash-sandbox-scenarios.js";
import { createNativeBashSandboxManager } from "../src/sandbox/native-bash-sandbox-manager.js";
const source = loadCapturedBashSandboxManager(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of BASH_SANDBOX_CASES)
  assert.deepEqual(
    await c.run(createNativeBashSandboxManager),
    await c.run(source),
    c.name,
  );
if (process.platform !== "win32") {
  const cli = readFileSync(getCapturedBundlePath(), "utf8"),
    root = mkdtempSync(join(tmpdir(), "axonfire-bash-pair-"));
  assert.deepEqual(
    await sandboxCliProcessScenario(
      createNativeSandboxCLI,
      createNativeSandboxRules,
      createNativeBashSandboxManager,
      root,
    ),
    await sandboxCliProcessScenario(
      loadCapturedSandboxCLI(cli),
      loadCapturedSandboxRules(cli),
      source,
      root,
    ),
  );
}
console.log(
  JSON.stringify({
    classes: 1,
    members: 18,
    modules: 6,
    comparisons: BASH_SANDBOX_CASES.length,
    realProcessPairs: process.platform === "win32" ? 0 : 1,
    bootstrapExecuted: false,
    ok: true,
  }),
);
