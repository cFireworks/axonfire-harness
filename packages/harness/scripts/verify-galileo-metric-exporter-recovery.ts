import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedGalileoMetricExporter } from "./helpers/captured-galileo-metric-exporter.js";
import { GALILEO_METRIC_CASES } from "./helpers/galileo-metric-exporter-scenarios.js";
import { createNativeGalileoMetricExporter } from "../src/runtime/native-galileo-metric-exporter.js";
const source = loadCapturedGalileoMetricExporter(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of GALILEO_METRIC_CASES)
  assert.deepEqual(
    await c.run(createNativeGalileoMetricExporter),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    regions: 39,
    comparisons: GALILEO_METRIC_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
