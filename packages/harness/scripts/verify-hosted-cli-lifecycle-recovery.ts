import { loadCapturedHostedCliLifecycle } from "./helpers/captured-hosted-cli-lifecycle.js";
import { hostedCliLifecycleScenarios } from "./helpers/hosted-cli-lifecycle-scenarios.js";
import {
  createNativeHostedCliLifecycle,
  HOSTED_CLI_LIFECYCLE_SOURCE,
} from "../src/terminal/native-hosted-cli-lifecycle.js";
const captured = loadCapturedHostedCliLifecycle();
for (const [, run] of hostedCliLifecycleScenarios) {
  await run(captured);
  await run(createNativeHostedCliLifecycle);
}
console.log(
  JSON.stringify({
    sourceRegions: HOSTED_CLI_LIFECYCLE_SOURCE.regions.length,
    pairedScenarios: hostedCliLifecycleScenarios.length,
  }),
);
