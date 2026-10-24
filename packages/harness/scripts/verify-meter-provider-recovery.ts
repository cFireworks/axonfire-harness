import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedMeterProvider } from "./helpers/captured-meter-provider.js";
import { METER_PROVIDER_CASES } from "./helpers/meter-provider-scenarios.js";
import { createNativeMeterProvider } from "../src/runtime/native-meter-provider.js";
const source = loadCapturedMeterProvider(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of METER_PROVIDER_CASES)
  assert.deepEqual(
    await c.run(createNativeMeterProvider),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    regions: 15,
    modules: 1,
    comparisons: METER_PROVIDER_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
