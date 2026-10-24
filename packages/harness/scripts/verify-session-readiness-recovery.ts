import { loadCapturedSessionReadiness } from "./helpers/captured-session-readiness.js";
import { sessionReadinessScenarios } from "./helpers/session-readiness-scenarios.js";
import { attachNativeSessionReadiness } from "../src/sessions/native-session-readiness.js";
const captured = loadCapturedSessionReadiness();
for (const [, run] of sessionReadinessScenarios) {
  await run(captured);
  await run(attachNativeSessionReadiness);
}
console.log(
  JSON.stringify({
    sourceComparisons: 12,
    pairedScenarios: sessionReadinessScenarios.length,
  }),
);
