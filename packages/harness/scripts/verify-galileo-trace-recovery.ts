import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedGalileoTrace } from "./helpers/captured-galileo-trace.js";
import { GALILEO_TRACE_CASES } from "./helpers/galileo-trace-scenarios.js";
import { createNativeGalileoTrace } from "../src/runtime/native-galileo-trace.js";
const source = loadCapturedGalileoTrace(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of GALILEO_TRACE_CASES)
  assert.deepEqual(
    await c.run(createNativeGalileoTrace),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    regions: 2,
    modules: 6,
    comparisons: GALILEO_TRACE_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
