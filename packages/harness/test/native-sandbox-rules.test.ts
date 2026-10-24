import test from "node:test";
import { SANDBOX_RULES_CASES } from "../scripts/helpers/sandbox-rules-scenarios.js";
import { createNativeSandboxRules } from "../src/sandbox/native-sandbox-rules.js";
for (const scenario of SANDBOX_RULES_CASES)
  test(scenario.name, () => scenario.run(createNativeSandboxRules));

import { sandboxCliProcessScenario } from "../scripts/helpers/sandbox-cli-process-scenario.js";
import { createNativeSandboxCLI } from "../src/sandbox/native-sandbox-cli.js";
test(
  "original rule service applies shared turn config through real IPC before and after restart",
  { timeout: 15000, skip: process.platform === "win32" },
  async () => {
    await sandboxCliProcessScenario(
      createNativeSandboxCLI,
      createNativeSandboxRules,
    );
  },
);
