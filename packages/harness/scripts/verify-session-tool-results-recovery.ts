import { loadCapturedSessionToolResults } from "./helpers/captured-session-tool-results.js";
import { sessionToolResultsScenarios } from "./helpers/session-tool-results-scenarios.js";
import { attachNativeSessionToolResults } from "../src/sessions/native-session-tool-results.js";
const captured = loadCapturedSessionToolResults();
for (const [, run] of sessionToolResultsScenarios) {
  await run(captured);
  await run(attachNativeSessionToolResults);
}
console.log(
  JSON.stringify({
    sourceComparisons: 7,
    pairedScenarios: sessionToolResultsScenarios.length,
  }),
);
