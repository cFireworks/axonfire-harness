import { loadCapturedAppCliEnvironment } from "./helpers/captured-app-cli-environment.js";
import { appCliEnvironmentScenarios } from "./helpers/app-cli-environment-scenarios.js";
import { createNativeAppCliEnvironment } from "../src/terminal/native-app-cli-environment.js";
const captured = loadCapturedAppCliEnvironment();
for (const [, run] of appCliEnvironmentScenarios) {
  await run(captured);
  await run(createNativeAppCliEnvironment);
}
console.log(
  JSON.stringify({
    sourceRegions: 3,
    pairedScenarios: appCliEnvironmentScenarios.length,
  }),
);
