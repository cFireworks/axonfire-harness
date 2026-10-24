import { loadCapturedSessionManager } from "./helpers/captured-session-manager.js";
import { sessionManagerScenarios } from "./helpers/session-manager-scenarios.js";
import { createNativeSessionManager } from "../src/sessions/native-session-manager.js";
const captured = loadCapturedSessionManager();
for (const [, run] of sessionManagerScenarios) {
  await run(captured.factory);
  await run(createNativeSessionManager);
}
console.log(
  JSON.stringify({
    sourceComparisons: captured.regions,
    pairedScenarios: sessionManagerScenarios.length,
  }),
);
