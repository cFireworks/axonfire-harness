import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedOtlpHttp } from "./helpers/captured-otlp-http.js";
import { OTLP_HTTP_CASES } from "./helpers/otlp-http-scenarios.js";
import { createNativeOtlpHttp } from "../src/runtime/native-otlp-http.js";
const source = loadCapturedOtlpHttp(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of OTLP_HTTP_CASES)
  assert.deepEqual(
    await c.run(createNativeOtlpHttp),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    regions: 26,
    modules: 3,
    comparisons: OTLP_HTTP_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
