import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedComponentProviders } from "./helpers/captured-component-providers.js";
import { COMPONENT_PROVIDER_CASES } from "./helpers/component-provider-scenarios.js";
import { createNativeComponentProviders } from "../src/di/native-component-providers.js";
const original = loadCapturedComponentProviders(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const scenario of COMPONENT_PROVIDER_CASES)
  assert.deepEqual(
    await scenario.run(createNativeComponentProviders),
    await scenario.run(original),
    scenario.name,
  );
console.log(
  JSON.stringify({
    modules: 3,
    classes: 2,
    comparisons: COMPONENT_PROVIDER_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
