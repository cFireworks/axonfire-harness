import { test } from "node:test";
import { GALILEO_METRIC_CASES } from "../scripts/helpers/galileo-metric-exporter-scenarios.js";
import { createNativeGalileoMetricExporter } from "../src/runtime/native-galileo-metric-exporter.js";
for (const c of GALILEO_METRIC_CASES)
  test(c.name, () => c.run(createNativeGalileoMetricExporter));
