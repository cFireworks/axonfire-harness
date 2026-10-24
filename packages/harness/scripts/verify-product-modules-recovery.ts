import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedProductModules } from "./helpers/captured-product-modules.js";
import { createNativeProductModules } from "../src/runtime/native-product-modules.js";
import { productModulesScenario } from "./helpers/product-modules-scenarios.js";
const source = loadCapturedProductModules(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
assert.deepEqual(
  await productModulesScenario(createNativeProductModules),
  await productModulesScenario(source),
);
console.log(
  JSON.stringify({
    modules: 2153,
    comparisons: 1,
    bundleBootstrapExecuted: false,
    recoveredContainerBootstrapExecuted: false,
    ok: true,
  }),
);
