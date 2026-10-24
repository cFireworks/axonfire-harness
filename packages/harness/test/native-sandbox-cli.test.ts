import test from "node:test";
import { SANDBOX_CLI_CASES } from "../scripts/helpers/sandbox-cli-scenarios.js";
import { createNativeSandboxCLI } from "../src/sandbox/native-sandbox-cli.js";
for (const scenario of SANDBOX_CLI_CASES)
  test(scenario.name, () => scenario.run(createNativeSandboxCLI));
import { sandboxCliProcessScenario } from "../scripts/helpers/sandbox-cli-process-scenario.js";
test(
  "original sandbox lifecycle launches, connects, restarts and stops an owned real process",
  { timeout: 15000, skip: process.platform === "win32" },
  async () => {
    await sandboxCliProcessScenario();
  },
);
