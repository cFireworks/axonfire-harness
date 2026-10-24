import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedMetricReader } from "./helpers/captured-metric-reader.js";
import { METRIC_READER_CASES } from "./helpers/metric-reader-scenarios.js";
import { createNativeMetricReader } from "../src/runtime/native-metric-reader.js";
const source = loadCapturedMetricReader(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of METRIC_READER_CASES)
  assert.deepEqual(
    await c.run(createNativeMetricReader),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    regions: 1,
    modules: 2,
    comparisons: METRIC_READER_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
