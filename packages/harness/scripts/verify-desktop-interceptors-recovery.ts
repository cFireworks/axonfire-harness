import { loadCapturedDesktopInterceptors } from "./helpers/captured-desktop-interceptors.js";
import { desktopInterceptorScenarios } from "./helpers/desktop-interceptor-scenarios.js";
import { createNativeDesktopProductInterceptors } from "../src/http/native-desktop-product-interceptors.js";
const captured = loadCapturedDesktopInterceptors();
for (const [, run] of desktopInterceptorScenarios) {
  await run(captured.factory);
  await run(createNativeDesktopProductInterceptors);
}
console.log(
  JSON.stringify({
    sourceComparisons: captured.regions,
    pairedScenarios: desktopInterceptorScenarios.length,
  }),
);
