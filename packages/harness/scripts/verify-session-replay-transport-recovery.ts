import { createNativeSessionReplayTransport } from "../src/sessions/native-session-replay-transport.js";
import { loadCapturedSessionReplayTransport } from "./helpers/captured-session-replay-transport.js";
import { sessionReplayTransportScenarios } from "./helpers/session-replay-transport-scenarios.js";
const captured = loadCapturedSessionReplayTransport();
for (const [, run] of sessionReplayTransportScenarios) {
  await run(captured);
  await run(createNativeSessionReplayTransport);
}
console.log(
  JSON.stringify({
    sourceComparisons: 16,
    pairedScenarios: sessionReplayTransportScenarios.length,
  }),
);
