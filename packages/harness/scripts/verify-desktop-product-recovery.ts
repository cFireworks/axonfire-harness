import { loadCapturedDesktopProduct } from "./helpers/captured-desktop-product.js";
import { desktopProductScenarios } from "./helpers/desktop-product-scenarios.js";
import { createNativeDesktopProductManager } from "../src/config/native-desktop-product-manager.js";
const captured = loadCapturedDesktopProduct();
for (const [, run] of desktopProductScenarios) {
  await run(captured.factory);
  await run(createNativeDesktopProductManager);
}
console.log(
  JSON.stringify({
    sourceComparisons: captured.regions,
    pairedScenarios: desktopProductScenarios.length,
  }),
);
