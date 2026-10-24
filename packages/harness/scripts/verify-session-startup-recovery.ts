import { loadCapturedSessionStartup } from "./helpers/captured-session-startup.js";
import { sessionStartupScenarios } from "./helpers/session-startup-scenarios.js";
import { attachNativeSessionStartup } from "../src/sessions/native-session-startup.js";
const captured = loadCapturedSessionStartup();
for (const [, run] of sessionStartupScenarios) {
  await run(captured);
  await run(attachNativeSessionStartup);
}
console.log(
  JSON.stringify({
    sourceComparisons: 29,
    pairedScenarios: sessionStartupScenarios.length,
  }),
);
