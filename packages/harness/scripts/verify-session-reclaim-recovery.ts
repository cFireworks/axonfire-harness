import { loadCapturedSessionReclaim } from "./helpers/captured-session-reclaim.js";
import { sessionReclaimScenarios } from "./helpers/session-reclaim-scenarios.js";
import { attachNativeSessionReclaim } from "../src/sessions/native-session-reclaim.js";
const captured = loadCapturedSessionReclaim();
for (const [, run] of sessionReclaimScenarios) {
  await run(captured);
  await run(attachNativeSessionReclaim);
}
console.log(
  JSON.stringify({
    sourceComparisons: 12,
    pairedScenarios: sessionReclaimScenarios.length,
  }),
);
