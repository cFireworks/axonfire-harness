import { loadCapturedCodeSessionBackend } from "./helpers/captured-code-session-backend.js";
import { codeSessionBackendScenarios } from "./helpers/code-session-backend-scenarios.js";
import { createNativeCodeSessionBackend } from "../src/terminal/native-code-session-backend.js";
const captured = loadCapturedCodeSessionBackend();
for (const [, run] of codeSessionBackendScenarios) {
  await run(captured.factory);
  await run(createNativeCodeSessionBackend);
}
console.log(
  JSON.stringify({
    sourceRegions: captured.regions,
    pairedScenarios: codeSessionBackendScenarios.length,
  }),
);
