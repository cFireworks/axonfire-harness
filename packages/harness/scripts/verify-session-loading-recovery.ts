import { loadCapturedSessionLoading } from "./helpers/captured-session-loading.js";
import { sessionLoadingScenarios } from "./helpers/session-loading-scenarios.js";
import { attachNativeSessionLoading } from "../src/sessions/native-session-loading.js";
const captured = loadCapturedSessionLoading();
for (const [, run] of sessionLoadingScenarios) {
  await run(captured);
  await run(attachNativeSessionLoading);
}
console.log(
  JSON.stringify({
    sourceComparisons: 15,
    pairedScenarios: sessionLoadingScenarios.length,
  }),
);
