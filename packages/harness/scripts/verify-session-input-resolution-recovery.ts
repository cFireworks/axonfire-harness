import { loadCapturedSessionInputResolution } from "./helpers/captured-session-input-resolution.js";
import { sessionInputResolutionScenarios } from "./helpers/session-input-resolution-scenarios.js";
import { attachNativeSessionInputResolution } from "../src/sessions/native-session-input-resolution.js";
const captured = loadCapturedSessionInputResolution();
for (const [, run] of sessionInputResolutionScenarios) {
  await run(captured);
  await run(attachNativeSessionInputResolution);
}
console.log(
  JSON.stringify({
    sourceComparisons: 10,
    pairedScenarios: sessionInputResolutionScenarios.length,
  }),
);
