import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedOtelEnvironment } from "./helpers/captured-otel-environment.js";
import { OTEL_ENVIRONMENT_CASES } from "./helpers/otel-environment-scenarios.js";
import { createNativeOtelEnvironment } from "../src/runtime/native-otel-environment.js";
const source = loadCapturedOtelEnvironment(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of OTEL_ENVIRONMENT_CASES)
  assert.deepEqual(
    await c.run(createNativeOtelEnvironment),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    modules: 4,
    comparisons: OTEL_ENVIRONMENT_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
