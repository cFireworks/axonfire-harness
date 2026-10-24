import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedOtlpSerializers } from "./helpers/captured-otlp-serializers.js";
import { OTLP_SERIALIZERS_CASES } from "./helpers/otlp-serializers-scenarios.js";
import { createNativeOtlpSerializers } from "../src/runtime/native-otlp-serializers.js";
const source = loadCapturedOtlpSerializers(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of OTLP_SERIALIZERS_CASES)
  assert.deepEqual(
    await c.run(createNativeOtlpSerializers),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    regions: 42,
    modules: 3,
    comparisons: OTLP_SERIALIZERS_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
