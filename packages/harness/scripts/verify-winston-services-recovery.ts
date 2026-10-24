import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedWinstonServices } from "./helpers/captured-winston-services.js";
import { createNativeWinstonServices } from "../src/runtime/native-winston-services.js";
import { winstonServicesScenario } from "./helpers/winston-services-scenarios.js";
const source = loadCapturedWinstonServices(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
assert.deepEqual(
  await winstonServicesScenario(createNativeWinstonServices),
  await winstonServicesScenario(source),
);
console.log(
  JSON.stringify({
    modules: 117,
    comparisons: 1,
    bundleBootstrapExecuted: false,
    recoveredContainerBootstrapExecuted: true,
    ok: true,
  }),
);
