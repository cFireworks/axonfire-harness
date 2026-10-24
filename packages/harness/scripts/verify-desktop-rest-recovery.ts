import { loadCapturedDesktopRest } from "./helpers/captured-desktop-rest.js";
import { desktopRestScenarios } from "./helpers/desktop-rest-scenarios.js";
import { createNativeDesktopRest } from "../src/http/native-desktop-rest.js";
const captured = loadCapturedDesktopRest();
for (const [, run] of desktopRestScenarios) {
  await run(captured.factory);
  await run(createNativeDesktopRest);
}
console.log(
  JSON.stringify({
    sourceComparisons: captured.regions,
    pairedScenarios: desktopRestScenarios.length,
  }),
);
