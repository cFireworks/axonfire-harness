import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedProductRegistration } from "./helpers/captured-product-registration.js";
import { PRODUCT_REGISTRATION_CASES } from "./helpers/product-registration-scenarios.js";
import { createNativeProductRegistration } from "../src/di/native-product-registration.js";
const source = loadCapturedProductRegistration(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of PRODUCT_REGISTRATION_CASES)
  assert.deepEqual(
    await c.run(createNativeProductRegistration),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    regions: 0,
    modules: 2,
    comparisons: PRODUCT_REGISTRATION_CASES.length,
    bundleBootstrapExecuted: false,
    ok: true,
  }),
);
