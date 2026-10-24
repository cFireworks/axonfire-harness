import { loadCapturedSessionHistory } from "./helpers/captured-session-history.js";
import { sessionHistoryScenarios } from "./helpers/session-history-scenarios.js";
import { attachNativeSessionHistory } from "../src/sessions/native-session-history.js";
const captured = loadCapturedSessionHistory();
for (const [, run] of sessionHistoryScenarios) {
  await run(captured);
  await run(attachNativeSessionHistory);
}
console.log(
  JSON.stringify({
    sourceComparisons: 21,
    pairedScenarios: sessionHistoryScenarios.length,
  }),
);
