import { loadCapturedProductExperiment } from "./helpers/captured-product-experiment.js";
import { productExperimentScenarios } from "./helpers/product-experiment-scenarios.js";
import { createNativeProductExperimentManager } from "../src/config/native-product-experiment-manager.js";
const captured = loadCapturedProductExperiment();
for (const [, run] of productExperimentScenarios) {
  await run(captured.factory);
  await run(createNativeProductExperimentManager);
}
console.log(
  JSON.stringify({
    sourceComparisons: captured.regions,
    pairedScenarios: productExperimentScenarios.length,
  }),
);
