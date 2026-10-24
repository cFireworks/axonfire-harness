import { loadCapturedDesktopExternalLink } from "./helpers/captured-desktop-external-link.js";
import { desktopExternalLinkScenarios } from "./helpers/desktop-external-link-scenarios.js";
import { createNativeDesktopExternalLink } from "../src/auth/native-desktop-external-link.js";
const captured = loadCapturedDesktopExternalLink();
for (const [, run] of desktopExternalLinkScenarios) {
  await run(captured.factory);
  await run(createNativeDesktopExternalLink);
}
console.log(
  JSON.stringify({
    sourceComparisons: captured.regions,
    pairedScenarios: desktopExternalLinkScenarios.length,
  }),
);
