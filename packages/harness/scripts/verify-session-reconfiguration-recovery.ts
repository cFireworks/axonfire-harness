import { loadCapturedSessionReconfiguration } from "./helpers/captured-session-reconfiguration.js";
import { sessionReconfigurationScenarios } from "./helpers/session-reconfiguration-scenarios.js";
import { createNativeSessionConfiguration } from "../src/sessions/native-session-reconfiguration.js";
const captured = loadCapturedSessionReconfiguration();
for (const [, run] of sessionReconfigurationScenarios) {
  await run(captured);
  await run(createNativeSessionConfiguration);
}
console.log(
  JSON.stringify({
    sourceComparisons: 18,
    pairedScenarios: sessionReconfigurationScenarios.length,
  }),
);
