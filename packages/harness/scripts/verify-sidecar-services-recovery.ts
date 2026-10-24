import {
  loadCapturedSidecarServices,
  recoveredSidecarServices,
} from "./helpers/captured-sidecar-services.js";
import { sidecarServiceScenarios } from "./helpers/sidecar-services-scenarios.js";
const captured = loadCapturedSidecarServices();
for (const [, run] of sidecarServiceScenarios) {
  await run(captured.services);
  await run(recoveredSidecarServices);
}
console.log(
  JSON.stringify({
    sourceRegions: captured.regions,
    pairedScenarios: sidecarServiceScenarios.length,
  }),
);
