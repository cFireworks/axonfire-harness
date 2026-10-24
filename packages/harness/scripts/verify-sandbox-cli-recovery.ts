import { sandboxCliProcessScenario } from "./helpers/sandbox-cli-process-scenario.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedSandboxCLI } from "./helpers/captured-sandbox-cli.js";
import { SANDBOX_CLI_CASES } from "./helpers/sandbox-cli-scenarios.js";
import {
  createNativeSandboxCLI,
  SANDBOX_CLI_CLASSES,
} from "../src/sandbox/native-sandbox-cli.js";
const original = loadCapturedSandboxCLI(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const scenario of SANDBOX_CLI_CASES)
  assert.deepEqual(
    await scenario.run(createNativeSandboxCLI),
    await scenario.run(original),
    scenario.name,
  );
if (process.platform !== "win32")
  assert.deepEqual(
    await sandboxCliProcessScenario(createNativeSandboxCLI),
    await sandboxCliProcessScenario(original),
  );
console.log(
  JSON.stringify({
    classes: SANDBOX_CLI_CLASSES.length,
    members: SANDBOX_CLI_CLASSES.reduce((n, c) => n + c[3], 0),
    comparisons: SANDBOX_CLI_CASES.length,
    realProcessPairs: process.platform === "win32" ? 0 : 1,
    bootstrapExecuted: false,
    ok: true,
  }),
);
