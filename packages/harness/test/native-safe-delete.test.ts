import test from "node:test";
import { SAFE_DELETE_CASES } from "../scripts/helpers/safe-delete-scenarios.js";
import { createNativeSafeDelete } from "../src/sandbox/native-safe-delete.js";
for (const c of SAFE_DELETE_CASES)
  test(c.name, () => c.run(createNativeSafeDelete));
import { sandboxCliProcessScenario } from "../scripts/helpers/sandbox-cli-process-scenario.js";
import { createNativeSandboxCLI } from "../src/sandbox/native-sandbox-cli.js";
import { createNativeSandboxRules } from "../src/sandbox/native-sandbox-rules.js";
import { createNativeBashSandboxManager } from "../src/sandbox/native-bash-sandbox-manager.js";
import { createNativeSandboxShell } from "../src/sandbox/native-sandbox-shell.js";
test(
  "real IPC shell uses original safe-delete env and security audit across restart",
  { timeout: 15000, skip: process.platform === "win32" },
  async () => {
    await sandboxCliProcessScenario(
      createNativeSandboxCLI,
      createNativeSandboxRules,
      createNativeBashSandboxManager,
      undefined,
      createNativeSandboxShell,
      createNativeSafeDelete,
    );
  },
);
