import { loadCapturedSessionPlans } from "./helpers/captured-session-plans.js";
import { sessionPlansScenarios } from "./helpers/session-plans-scenarios.js";
import { attachNativeSessionPlans } from "../src/sessions/native-session-plans.js";
const captured = loadCapturedSessionPlans();
for (const [, run] of sessionPlansScenarios) {
  await run(captured);
  await run(attachNativeSessionPlans);
}
console.log(
  JSON.stringify({
    sourceComparisons: 17,
    pairedScenarios: sessionPlansScenarios.length,
  }),
);
