import { loadCapturedSessionRestart } from "./helpers/captured-session-restart.js";
import { createNativeSessionRestart } from "../src/sessions/native-session-restart.js";
import { sessionRestartScenarios } from "./helpers/session-restart-scenarios.js";
const { factory, declarations, members } = loadCapturedSessionRestart();
for (const [, run] of sessionRestartScenarios) {
  await run(factory);
  await run(createNativeSessionRestart);
}
console.log(
  JSON.stringify({
    declarations,
    members,
    sourceComparisons: declarations + members,
    pairedScenarios: sessionRestartScenarios.length,
  }),
);
