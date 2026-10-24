import { loadCapturedDesktopClientProduct } from "./helpers/captured-desktop-client-product.js";
import { desktopClientProductScenarios } from "./helpers/desktop-client-product-scenarios.js";
import { createNativeDesktopClientProduct } from "../src/config/native-desktop-client-product.js";
const captured = loadCapturedDesktopClientProduct();
for (const [, run] of desktopClientProductScenarios) {
  await run(captured.factory);
  await run(createNativeDesktopClientProduct);
}
console.log(
  JSON.stringify({
    sourceComparisons: captured.regions,
    pairedScenarios: desktopClientProductScenarios.length,
  }),
);
