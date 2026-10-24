import { loadCapturedSessionInfo } from "./helpers/captured-session-info.js";
import { sessionInfoScenarios } from "./helpers/session-info-scenarios.js";
import { attachNativeSessionInfo } from "../src/sessions/native-session-info.js";
const captured = loadCapturedSessionInfo();
for (const [, run] of sessionInfoScenarios) {
  await run(captured);
  await run(attachNativeSessionInfo);
}
console.log(
  JSON.stringify({
    sourceComparisons: 24,
    pairedScenarios: sessionInfoScenarios.length,
  }),
);
