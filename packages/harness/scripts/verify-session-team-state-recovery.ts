import { loadCapturedSessionTeamState } from "./helpers/captured-session-team-state.js";
import { sessionTeamStateScenarios } from "./helpers/session-team-state-scenarios.js";
import { attachNativeSessionTeamState } from "../src/sessions/native-session-team-state.js";
const captured = loadCapturedSessionTeamState();
for (const [, run] of sessionTeamStateScenarios) {
  await run(captured);
  await run(attachNativeSessionTeamState);
}
console.log(
  JSON.stringify({
    sourceComparisons: 34,
    pairedScenarios: sessionTeamStateScenarios.length,
  }),
);
