import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedTracing } from "./helpers/captured-tracing.js";
import { TRACING_CASES } from "./helpers/tracing-scenarios.js";
import {
  createNativeTracing,
  TRACING_MODULES,
} from "../src/runtime/native-tracing.js";
const source = loadCapturedTracing(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of TRACING_CASES)
  assert.deepEqual(
    await c.run(createNativeTracing),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    modules: TRACING_MODULES.length,
    comparisons: TRACING_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
