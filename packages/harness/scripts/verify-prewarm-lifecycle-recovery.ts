import {
  loadCapturedPrewarmLifecycle,
  recoveredPrewarmLifecycle,
} from "./helpers/captured-prewarm-lifecycle.js";
import { prewarmLifecycleScenarios } from "./helpers/prewarm-lifecycle-scenarios.js";
const c = loadCapturedPrewarmLifecycle();
for (const [, run] of prewarmLifecycleScenarios) {
  await run(c.services);
  await run(recoveredPrewarmLifecycle);
}
console.log(
  JSON.stringify({
    sourceRegions: c.regions,
    pairedScenarios: prewarmLifecycleScenarios.length,
  }),
);
