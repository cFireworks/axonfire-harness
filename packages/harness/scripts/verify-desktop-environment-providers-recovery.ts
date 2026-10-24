import { loadCapturedDesktopEnvironmentProviders } from "./helpers/captured-desktop-environment-providers.js";
import { desktopEnvironmentProvidersScenarios } from "./helpers/desktop-environment-providers-scenarios.js";
import { createNativeDesktopEnvironmentProviders } from "../src/config/native-desktop-environment-providers.js";
const captured = loadCapturedDesktopEnvironmentProviders();
for (const [, run] of desktopEnvironmentProvidersScenarios) {
  await run(captured.factory);
  await run(createNativeDesktopEnvironmentProviders);
}
console.log(
  JSON.stringify({
    sourceComparisons: captured.regions,
    pairedScenarios: desktopEnvironmentProvidersScenarios.length,
  }),
);
