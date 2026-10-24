import { loadCapturedDesktopAuthentication } from "./helpers/captured-desktop-auth.js";
import { desktopAuthScenarios } from "./helpers/desktop-auth-scenarios.js";
import { createNativeDesktopAuthentication } from "../src/auth/native-desktop-authentication.js";
const captured = loadCapturedDesktopAuthentication();
for (const [, run] of desktopAuthScenarios) {
  await run(captured.factory);
  await run(createNativeDesktopAuthentication);
}
console.log(
  JSON.stringify({
    sourceComparisons: captured.regions,
    pairedScenarios: desktopAuthScenarios.length,
  }),
);
