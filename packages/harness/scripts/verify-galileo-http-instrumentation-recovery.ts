import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedGalileoHttpInstrumentation } from "./helpers/captured-galileo-http-instrumentation.js";
import { GALILEO_HTTP_INSTRUMENTATION_CASES } from "./helpers/galileo-http-instrumentation-scenarios.js";
import { createNativeGalileoHttpInstrumentation } from "../src/runtime/native-galileo-http-instrumentation.js";
const source = loadCapturedGalileoHttpInstrumentation(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of GALILEO_HTTP_INSTRUMENTATION_CASES)
  assert.deepEqual(
    await c.run(createNativeGalileoHttpInstrumentation),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    regions: 0,
    modules: 3,
    comparisons: GALILEO_HTTP_INSTRUMENTATION_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
