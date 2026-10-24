import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedContainerBootstrap } from "./helpers/captured-container-bootstrap.js";
import { createNativeContainerBootstrap } from "../src/di/native-container-bootstrap.js";
import { backendFoundationScenario } from "./helpers/backend-foundation-scenarios.js";
const source = loadCapturedContainerBootstrap(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
assert.deepEqual(
  await backendFoundationScenario(createNativeContainerBootstrap),
  await backendFoundationScenario(source),
);
console.log(
  JSON.stringify({
    modules: 29,
    comparisons: 1,
    bundleBootstrapExecuted: false,
    recoveredContainerBootstrapExecuted: true,
    ok: true,
  }),
);
