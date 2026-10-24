import { loadCapturedSessionBackendEvents } from "./helpers/captured-session-backend-events.js";
import { sessionBackendEventsScenarios } from "./helpers/session-backend-events-scenarios.js";
import { attachNativeSessionBackendEvents } from "../src/sessions/native-session-backend-events.js";
const captured = loadCapturedSessionBackendEvents();
for (const [, run] of sessionBackendEventsScenarios) {
  await run(captured);
  await run(attachNativeSessionBackendEvents);
}
console.log(
  JSON.stringify({
    sourceComparisons: 5,
    pairedScenarios: sessionBackendEventsScenarios.length,
  }),
);
