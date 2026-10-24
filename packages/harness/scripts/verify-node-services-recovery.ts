import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedNodeServices } from "./helpers/captured-node-services.js";
import { createNativeNodeServices } from "../src/runtime/native-node-services.js";
import { nodeServicesScenario } from "./helpers/node-services-scenarios.js";
const source = loadCapturedNodeServices(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
assert.deepEqual(
  await nodeServicesScenario(createNativeNodeServices),
  await nodeServicesScenario(source),
);
console.log(
  JSON.stringify({
    modules: 373,
    comparisons: 1,
    bundleBootstrapExecuted: false,
    recoveredContainerBootstrapExecuted: true,
    ok: true,
  }),
);
