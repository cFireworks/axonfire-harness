import { loadCapturedDesktopCustomToken } from "./helpers/captured-desktop-custom-token.js";
import { desktopCustomTokenScenarios } from "./helpers/desktop-custom-token-scenarios.js";
import { createNativeDesktopCustomToken } from "../src/auth/native-desktop-custom-token.js";
const captured = loadCapturedDesktopCustomToken();
for (const [, run] of desktopCustomTokenScenarios) {
  await run(captured.factory);
  await run(createNativeDesktopCustomToken);
}
console.log(
  JSON.stringify({
    sourceComparisons: captured.regions,
    pairedScenarios: desktopCustomTokenScenarios.length,
  }),
);
