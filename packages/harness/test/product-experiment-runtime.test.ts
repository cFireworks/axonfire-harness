import { test } from "node:test";
import { productExperimentScenarios } from "../scripts/helpers/product-experiment-scenarios.js";
import { createNativeProductExperimentManager } from "../src/config/native-product-experiment-manager.js";
for (const [name, run] of productExperimentScenarios)
  test("original product experiment: " + name, () =>
    run(createNativeProductExperimentManager),
  );
