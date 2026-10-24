import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedOtelResource } from "./helpers/captured-otel-resource.js";
import { OTEL_RESOURCE_CASES } from "./helpers/otel-resource-scenarios.js";
import { createNativeOtelResource } from "../src/runtime/native-otel-resource.js";
const source = loadCapturedOtelResource(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of OTEL_RESOURCE_CASES)
  assert.deepEqual(
    await c.run(createNativeOtelResource),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    modules: 5,
    comparisons: OTEL_RESOURCE_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
