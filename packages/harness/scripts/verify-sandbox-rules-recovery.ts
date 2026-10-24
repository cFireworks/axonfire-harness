import { sandboxCliProcessScenario } from "./helpers/sandbox-cli-process-scenario.js";
import { loadCapturedSandboxCLI } from "./helpers/captured-sandbox-cli.js";
import { createNativeSandboxCLI } from "../src/sandbox/native-sandbox-cli.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedSandboxRules } from "./helpers/captured-sandbox-rules.js";
import { SANDBOX_RULES_CASES } from "./helpers/sandbox-rules-scenarios.js";
import { createNativeSandboxRules } from "../src/sandbox/native-sandbox-rules.js";
const source = loadCapturedSandboxRules(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of SANDBOX_RULES_CASES)
  assert.deepEqual(
    await c.run(createNativeSandboxRules),
    await c.run(source),
    c.name,
  );
if (process.platform !== "win32")
  assert.deepEqual(
    await sandboxCliProcessScenario(
      createNativeSandboxCLI,
      createNativeSandboxRules,
    ),
    await sandboxCliProcessScenario(
      loadCapturedSandboxCLI(readFileSync(getCapturedBundlePath(), "utf8")),
      source,
    ),
  );
console.log(
  JSON.stringify({
    modules: 4,
    classes: 1,
    members: 24,
    helpers: 6,
    comparisons: SANDBOX_RULES_CASES.length,
    realProcessPairs: process.platform === "win32" ? 0 : 1,
    bootstrapExecuted: false,
    ok: true,
  }),
);
