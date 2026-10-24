import test from "node:test";
import { BASH_SANDBOX_CASES } from "../scripts/helpers/bash-sandbox-scenarios.js";
import { createNativeBashSandboxManager } from "../src/sandbox/native-bash-sandbox-manager.js";
for (const c of BASH_SANDBOX_CASES)
  test(c.name, () => c.run(createNativeBashSandboxManager));

import { sandboxCliProcessScenario } from "../scripts/helpers/sandbox-cli-process-scenario.js";
import { createNativeSandboxCLI } from "../src/sandbox/native-sandbox-cli.js";
import { createNativeSandboxRules } from "../src/sandbox/native-sandbox-rules.js";
test(
  "original Bash config feeds original RuleSync over real IPC across restart",
  { timeout: 15000, skip: process.platform === "win32" },
  async () => {
    await sandboxCliProcessScenario(
      createNativeSandboxCLI,
      createNativeSandboxRules,
      createNativeBashSandboxManager,
    );
  },
);
