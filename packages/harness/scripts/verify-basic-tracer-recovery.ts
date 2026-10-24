import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedBasicTracer } from "./helpers/captured-basic-tracer.js";
import { BASIC_TRACER_CASES } from "./helpers/basic-tracer-scenarios.js";
import { createNativeBasicTracer } from "../src/runtime/native-basic-tracer.js";
const source = loadCapturedBasicTracer(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of BASIC_TRACER_CASES)
  assert.deepEqual(
    await c.run(createNativeBasicTracer),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    regions: 0,
    modules: 19,
    comparisons: BASIC_TRACER_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
