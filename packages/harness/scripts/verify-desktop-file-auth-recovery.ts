import { loadCapturedDesktopFileAuthentication } from "./helpers/captured-desktop-file-auth.js";
import { desktopFileAuthScenarios } from "./helpers/desktop-file-auth-scenarios.js";
import { createNativeDesktopFileAuthentication } from "../src/auth/native-desktop-file-authentication.js";
const captured = loadCapturedDesktopFileAuthentication();
for (const [, run] of desktopFileAuthScenarios) {
  await run(captured.factory);
  await run(createNativeDesktopFileAuthentication);
}
console.log(
  JSON.stringify({
    sourceComparisons: captured.regions,
    pairedScenarios: desktopFileAuthScenarios.length,
  }),
);
