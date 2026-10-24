import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedCodeRatioServices } from "./helpers/captured-code-ratio-services.js";
import { createNativeCodeRatioServices } from "../src/runtime/native-code-ratio-services.js";
import { codeRatioServicesScenario } from "./helpers/code-ratio-services-scenarios.js";
const source = loadCapturedCodeRatioServices(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
assert.deepEqual(
  await codeRatioServicesScenario(createNativeCodeRatioServices),
  await codeRatioServicesScenario(source),
);
console.log(
  JSON.stringify({
    modules: 19,
    comparisons: 1,
    bundleBootstrapExecuted: false,
    recoveredContainerBootstrapExecuted: true,
    ok: true,
  }),
);
