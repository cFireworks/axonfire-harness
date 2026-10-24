import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedCommonServices } from "./helpers/captured-common-services.js";
import { createNativeCommonServices } from "../src/runtime/native-common-services.js";
import { commonServicesScenario } from "./helpers/common-services-scenarios.js";
const source = loadCapturedCommonServices(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
assert.deepEqual(
  await commonServicesScenario(createNativeCommonServices),
  await commonServicesScenario(source),
);
console.log(
  JSON.stringify({
    modules: 64,
    comparisons: 1,
    bundleBootstrapExecuted: false,
    recoveredContainerBootstrapExecuted: true,
    ok: true,
  }),
);
