import { loadCapturedDesktopMerger } from "./helpers/captured-desktop-merger.js";
import { desktopMergerScenarios } from "./helpers/desktop-merger-scenarios.js";
import { createNativeDesktopProductMerger } from "../src/config/native-desktop-product-merger.js";
const captured = loadCapturedDesktopMerger();
for (const [, run] of desktopMergerScenarios) {
  await run(captured.factory);
  await run(createNativeDesktopProductMerger);
}
console.log(
  JSON.stringify({
    sourceComparisons: captured.regions,
    pairedScenarios: desktopMergerScenarios.length,
  }),
);
