import test from "node:test";
import { SANDBOX_SHELL_CASES } from "../scripts/helpers/sandbox-shell-scenarios.js";
import { createNativeSandboxShell } from "../src/sandbox/native-sandbox-shell.js";
for (const c of SANDBOX_SHELL_CASES)
  test(c.name, () => c.run(createNativeSandboxShell));
import { sandboxCliProcessScenario } from "../scripts/helpers/sandbox-cli-process-scenario.js";
import { createNativeSandboxCLI } from "../src/sandbox/native-sandbox-cli.js";
import { createNativeSandboxRules } from "../src/sandbox/native-sandbox-rules.js";
import { createNativeBashSandboxManager } from "../src/sandbox/native-bash-sandbox-manager.js";
test(
  "original shell Pipe and PTY consume real IPC reverse events across child restart",
  { timeout: 15000, skip: process.platform === "win32" },
  async () => {
    await sandboxCliProcessScenario(
      createNativeSandboxCLI,
      createNativeSandboxRules,
      createNativeBashSandboxManager,
      undefined,
      createNativeSandboxShell,
    );
  },
);
