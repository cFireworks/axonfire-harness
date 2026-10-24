import { safeExitScenarios } from "./helpers/process-lifecycle-scenarios.js";
import { processLifecycleChild } from "./helpers/process-lifecycle-child.js";
import { loadCapturedSafeExit } from "./helpers/captured-process-lifecycle.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedProcessLifecycle } from "./helpers/captured-process-lifecycle.js";
import { PROCESS_LIFECYCLE_CASES } from "./helpers/process-lifecycle-scenarios.js";
import { installNativeProcessLifecycle } from "../src/runtime/native-process-lifecycle.js";
const source = loadCapturedProcessLifecycle(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of PROCESS_LIFECYCLE_CASES)
  assert.deepEqual(
    await c.run(installNativeProcessLifecycle),
    await c.run(source),
    c.name,
  );
const safe = loadCapturedSafeExit(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
assert.deepEqual(safeExitScenarios(), safeExitScenarios(safe));
if (process.platform !== "win32")
  assert.deepEqual(
    await processLifecycleChild(),
    await processLifecycleChild(source, safe),
  );
console.log(
  JSON.stringify({
    modules: 2,
    realProcessPairs: process.platform === "win32" ? 0 : 1,
    safeExitComparisons: 4,
    comparisons: PROCESS_LIFECYCLE_CASES.length,
    globalProcessModified: false,
    bootstrapExecuted: false,
    ok: true,
  }),
);
