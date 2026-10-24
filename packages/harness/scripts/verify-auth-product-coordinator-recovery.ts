import { loadCapturedAuthProductCoordinator } from "./helpers/captured-auth-product-coordinator.js";
import { authProductCoordinatorScenarios } from "./helpers/auth-product-coordinator-scenarios.js";
import { createNativeAuthProductCoordinator } from "../src/config/native-auth-product-coordinator.js";
const captured = loadCapturedAuthProductCoordinator();
for (const [, run] of authProductCoordinatorScenarios) {
  await run(captured.factory);
  await run(createNativeAuthProductCoordinator);
}
console.log(
  JSON.stringify({
    sourceComparisons: captured.regions,
    pairedScenarios: authProductCoordinatorScenarios.length,
  }),
);
