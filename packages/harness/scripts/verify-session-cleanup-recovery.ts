import { loadCapturedSessionCleanup } from "./helpers/captured-session-cleanup.js";
import { sessionCleanupScenarios } from "./helpers/session-cleanup-scenarios.js";
import { attachNativeSessionCleanup } from "../src/sessions/native-session-cleanup.js";
const captured = loadCapturedSessionCleanup();
for (const [, run] of sessionCleanupScenarios) {
  await run(captured);
  await run(attachNativeSessionCleanup);
}
console.log(
  JSON.stringify({
    sourceComparisons: 33,
    pairedScenarios: sessionCleanupScenarios.length,
  }),
);
