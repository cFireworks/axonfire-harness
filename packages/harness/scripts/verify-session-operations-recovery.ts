import { loadCapturedSessionOperations } from "./helpers/captured-session-operations.js";
import { sessionOperationsScenarios } from "./helpers/session-operations-scenarios.js";
import { attachNativeSessionOperations } from "../src/sessions/native-session-operations.js";
const captured = loadCapturedSessionOperations();
for (const [, run] of sessionOperationsScenarios) {
  await run(captured);
  await run(attachNativeSessionOperations);
}
console.log(
  JSON.stringify({
    sourceComparisons: 26,
    pairedScenarios: sessionOperationsScenarios.length,
  }),
);
