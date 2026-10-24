import { loadCapturedSessionReplay } from "./helpers/captured-session-replay.js";
import { sessionReplayScenarios } from "./helpers/session-replay-scenarios.js";
import { attachNativeSessionReplay } from "../src/sessions/native-session-replay.js";
const captured = loadCapturedSessionReplay();
for (const [, run] of sessionReplayScenarios) {
  await run(captured);
  await run(attachNativeSessionReplay);
}
console.log(
  JSON.stringify({
    sourceComparisons: 11,
    pairedScenarios: sessionReplayScenarios.length,
  }),
);
