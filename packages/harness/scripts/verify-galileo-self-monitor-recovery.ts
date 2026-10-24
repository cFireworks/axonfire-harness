import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedGalileoSelfMonitor } from "./helpers/captured-galileo-self-monitor.js";
import { GALILEO_SELF_MONITOR_CASES } from "./helpers/galileo-self-monitor-scenarios.js";
import { createNativeGalileoSelfMonitor } from "../src/runtime/native-galileo-self-monitor.js";
const source = loadCapturedGalileoSelfMonitor(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of GALILEO_SELF_MONITOR_CASES)
  assert.deepEqual(
    await c.run(createNativeGalileoSelfMonitor),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    regions: 3,
    modules: 0,
    comparisons: GALILEO_SELF_MONITOR_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
