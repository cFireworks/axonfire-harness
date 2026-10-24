import { createNativeSessionHostRuntime } from "../src/sessions/native-session-host-runtime.js";
import { loadCapturedSessionHostRuntime } from "./helpers/captured-session-host-runtime.js";
import { sessionHostRuntimeScenarios } from "./helpers/session-host-runtime-scenarios.js";
const captured = loadCapturedSessionHostRuntime();
for (const [, run] of sessionHostRuntimeScenarios) {
  await run(captured);
  await run(createNativeSessionHostRuntime);
}
console.log(
  JSON.stringify({
    sourceComparisons: 31,
    pairedScenarios: sessionHostRuntimeScenarios.length,
  }),
);
