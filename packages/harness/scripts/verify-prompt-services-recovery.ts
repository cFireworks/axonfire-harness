import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedPromptServices } from "./helpers/captured-prompt-services.js";
import { createNativePromptServices } from "../src/runtime/native-prompt-services.js";
import { promptServicesScenario } from "./helpers/prompt-services-scenarios.js";
const source = loadCapturedPromptServices(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
assert.deepEqual(
  await promptServicesScenario(createNativePromptServices),
  await promptServicesScenario(source),
);
console.log(
  JSON.stringify({
    modules: 244,
    comparisons: 1,
    bundleBootstrapExecuted: false,
    recoveredContainerBootstrapExecuted: true,
    ok: true,
  }),
);
