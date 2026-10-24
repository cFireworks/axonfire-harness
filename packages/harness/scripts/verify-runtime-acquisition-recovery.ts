import { loadCapturedRuntimeAcquisition } from "./helpers/captured-runtime-acquisition.js";
import { runtimeAcquisitionScenarios } from "./helpers/runtime-acquisition-scenarios.js";
import { createNativeRuntimeAcquisition } from "../src/terminal/native-runtime-acquisition.js";
const captured = loadCapturedRuntimeAcquisition();
for (const [, run] of runtimeAcquisitionScenarios) {
  await run(captured);
  await run(createNativeRuntimeAcquisition);
}
console.log(
  JSON.stringify({
    sourceRegions: 5,
    pairedScenarios: runtimeAcquisitionScenarios.length,
  }),
);
