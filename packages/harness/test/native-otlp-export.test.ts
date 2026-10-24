import { test } from "node:test";
import { OTLP_EXPORT_CASES } from "../scripts/helpers/otlp-export-scenarios.js";
import { createNativeOtlpExport } from "../src/runtime/native-otlp-export.js";
for (const c of OTLP_EXPORT_CASES)
  test(c.name, () => c.run(createNativeOtlpExport));
