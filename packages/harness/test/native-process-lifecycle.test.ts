import test from "node:test";
import { PROCESS_LIFECYCLE_CASES } from "../scripts/helpers/process-lifecycle-scenarios.js";
import { installNativeProcessLifecycle } from "../src/runtime/native-process-lifecycle.js";
for (const c of PROCESS_LIFECYCLE_CASES)
  test(c.name, () => c.run(installNativeProcessLifecycle));

import { processLifecycleChild } from "../scripts/helpers/process-lifecycle-child.js";
test(
  "owned child receives SIGTERM and completes original exit order",
  { skip: process.platform === "win32" },
  async () => { await processLifecycleChild(); },
);

import { safeExitScenarios } from "../scripts/helpers/process-lifecycle-scenarios.js";
test("safe exit restores terminal state and tolerates stream failures", () => {
  safeExitScenarios();
});
