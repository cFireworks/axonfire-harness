import { loadCapturedSidecarClient } from "./helpers/captured-sidecar-client.js";
import { sidecarClientScenarios } from "./helpers/sidecar-client-scenarios.js";
import { createNativeSidecarClient } from "../src/terminal/native-sidecar-client.js";
const original = loadCapturedSidecarClient();
for (const [, run] of sidecarClientScenarios) {
  await run(original);
  await run(createNativeSidecarClient);
}
console.log(
  JSON.stringify({
    declarations: 3,
    comparison: "verbatim source region",
    pairedScenarios: sidecarClientScenarios.length,
  }),
);
