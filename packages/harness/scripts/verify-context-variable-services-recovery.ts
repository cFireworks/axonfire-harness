import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedContextVariableServices } from "./helpers/captured-context-variable-services.js";
import { createNativeContextVariableServices } from "../src/runtime/native-context-variable-services.js";
import { contextVariableServicesScenario } from "./helpers/context-variable-services-scenarios.js";
const source = loadCapturedContextVariableServices(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
assert.deepEqual(
  await contextVariableServicesScenario(createNativeContextVariableServices),
  await contextVariableServicesScenario(source),
);
console.log(
  JSON.stringify({
    modules: 23,
    comparisons: 1,
    bundleBootstrapExecuted: false,
    recoveredContainerBootstrapExecuted: true,
    ok: true,
  }),
);
