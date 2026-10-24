import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedProductConfigServices } from "./helpers/captured-product-config-services.js";
import { createNativeProductConfigServices } from "../src/runtime/native-product-config-services.js";
import { productConfigServicesScenario } from "./helpers/product-config-services-scenarios.js";
const source = loadCapturedProductConfigServices(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
assert.deepEqual(
  await productConfigServicesScenario(createNativeProductConfigServices),
  await productConfigServicesScenario(source),
);
console.log(
  JSON.stringify({
    modules: 62,
    comparisons: 1,
    bundleBootstrapExecuted: false,
    recoveredContainerBootstrapExecuted: true,
    ok: true,
  }),
);
