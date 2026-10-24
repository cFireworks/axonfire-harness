import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedEventServices } from "./helpers/captured-event-services.js";
import { createNativeEventServices } from "../src/runtime/native-event-services.js";
import { eventServicesScenario } from "./helpers/event-services-scenarios.js";
const source = loadCapturedEventServices(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
assert.deepEqual(
  await eventServicesScenario(createNativeEventServices),
  await eventServicesScenario(source),
);
console.log(
  JSON.stringify({
    modules: 162,
    comparisons: 1,
    bundleBootstrapExecuted: false,
    recoveredContainerBootstrapExecuted: true,
    ok: true,
  }),
);
