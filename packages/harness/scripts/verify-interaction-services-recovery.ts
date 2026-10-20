import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedInteractionServices } from "./helpers/captured-interaction-services.js";
import { INTERACTION_SERVICE_CASES } from "./helpers/interaction-services-scenarios.js";
const original = loadCapturedInteractionServices(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const scenario of INTERACTION_SERVICE_CASES)
  assert.deepEqual(
    await scenario.run(),
    await scenario.run(original.factory),
    scenario.name,
  );
console.log(
  JSON.stringify({
    ...original,
    factory: undefined,
    comparisons: INTERACTION_SERVICE_CASES.length,
    originalBootstrapExecuted: false,
    ok: true,
  }),
);
