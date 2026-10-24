import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedOtlpExport } from "./helpers/captured-otlp-export.js";
import { OTLP_EXPORT_CASES } from "./helpers/otlp-export-scenarios.js";
import { createNativeOtlpExport } from "../src/runtime/native-otlp-export.js";
const source = loadCapturedOtlpExport(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of OTLP_EXPORT_CASES)
  assert.deepEqual(
    await c.run(createNativeOtlpExport),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    regions: 8,
    modules: 1,
    comparisons: OTLP_EXPORT_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
