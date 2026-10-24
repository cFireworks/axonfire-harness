import { test } from "node:test";
import { METRIC_READER_CASES } from "../scripts/helpers/metric-reader-scenarios.js";
import { createNativeMetricReader } from "../src/runtime/native-metric-reader.js";
for (const c of METRIC_READER_CASES)
  test(c.name, () => c.run(createNativeMetricReader));
