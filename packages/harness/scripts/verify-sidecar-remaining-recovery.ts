import {
  loadCapturedSidecarRemaining,
  recoveredSidecarRemaining,
} from "./helpers/captured-sidecar-remaining.js";
import { sidecarRemainingScenarios } from "./helpers/sidecar-remaining-scenarios.js";
const c = loadCapturedSidecarRemaining();
for (const [, run] of sidecarRemainingScenarios) {
  await run(c.services);
  await run(recoveredSidecarRemaining);
}
console.log(
  JSON.stringify({
    sourceRegions: c.regions,
    pairedScenarios: sidecarRemainingScenarios.length,
  }),
);
