import { test } from "node:test";
import { createNativeCodeRatioServices } from "../src/runtime/native-code-ratio-services.js";
import { codeRatioServicesScenario } from "../scripts/helpers/code-ratio-services-scenarios.js";
test("original code ratio registration reports through real event processors and HTTP", async () => {
  await codeRatioServicesScenario(createNativeCodeRatioServices);
});
