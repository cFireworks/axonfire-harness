import { loadCapturedDesktopCloud } from "./helpers/captured-desktop-cloud.js";
import { desktopCloudScenarios } from "./helpers/desktop-cloud-scenarios.js";
import { createNativeDesktopCloudProduct } from "../src/config/native-desktop-cloud-product.js";
const captured = loadCapturedDesktopCloud();
for (const [, run] of desktopCloudScenarios) {
  await run(captured.factory);
  await run(createNativeDesktopCloudProduct);
}
console.log(
  JSON.stringify({
    sourceComparisons: captured.regions,
    pairedScenarios: desktopCloudScenarios.length,
  }),
);
