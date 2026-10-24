import { loadCapturedDesktopProductEnvironment } from "./helpers/captured-desktop-product-environment.js";
import { desktopProductEnvironmentScenarios } from "./helpers/desktop-product-environment-scenarios.js";
import { createNativeDesktopProductEnvironment } from "../src/auth/native-desktop-product-environment.js";
const captured = loadCapturedDesktopProductEnvironment();
for (const [, run] of desktopProductEnvironmentScenarios) {
  await run(captured.factory);
  await run(createNativeDesktopProductEnvironment);
}
console.log(
  JSON.stringify({
    sourceComparisons: captured.regions,
    pairedScenarios: desktopProductEnvironmentScenarios.length,
  }),
);
