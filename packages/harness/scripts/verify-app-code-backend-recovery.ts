import { loadCapturedAppCodeBackend } from "./helpers/captured-app-code-backend.js";
import { appCodeBackendScenarios } from "./helpers/app-code-backend-scenarios.js";
import {
  createNativeAppCodeBackend,
  APP_CODE_BACKEND_SOURCE,
} from "../src/terminal/native-app-code-backend.js";
const captured = loadCapturedAppCodeBackend();
for (const [, run] of appCodeBackendScenarios) {
  await run(captured);
  await run(createNativeAppCodeBackend);
}
console.log(
  JSON.stringify({
    sourceRegions: APP_CODE_BACKEND_SOURCE.regions.length,
    pairedScenarios: appCodeBackendScenarios.length,
  }),
);
