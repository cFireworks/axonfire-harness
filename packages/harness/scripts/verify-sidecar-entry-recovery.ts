import {
  loadCapturedSidecarEntry,
  recoveredSidecarEntry,
} from "./helpers/captured-sidecar-entry.js";
import { sidecarEntryScenarios } from "./helpers/sidecar-entry-scenarios.js";
const c = loadCapturedSidecarEntry();
for (const [, run] of sidecarEntryScenarios) {
  await run(c.services);
  await run(recoveredSidecarEntry);
}
console.log(
  JSON.stringify({
    sourceRegions: c.regions,
    pairedScenarios: sidecarEntryScenarios.length,
  }),
);
