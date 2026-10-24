import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedHttpController } from "./helpers/captured-http-controller.js";
import { createNativeHttpController } from "../src/http/native-http-controller.js";
import { httpControllerScenario } from "./helpers/http-controller-scenarios.js";
const source = loadCapturedHttpController(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
assert.deepEqual(
  await httpControllerScenario(createNativeHttpController),
  await httpControllerScenario(source),
);
console.log(
  JSON.stringify({
    modules: 81,
    comparisons: 1,
    bundleBootstrapExecuted: false,
    recoveredContainerBootstrapExecuted: true,
    ok: true,
  }),
);
