import { loadCapturedSidecarManager } from "./helpers/captured-sidecar-manager.js";
import { sidecarManagerScenarios } from "./helpers/sidecar-manager-scenarios.js";
import {
  createNativeSidecarManager,
  SIDECAR_MANAGER_SOURCE,
} from "../src/terminal/native-sidecar-manager.js";
const original = loadCapturedSidecarManager();
for (const [, run] of sidecarManagerScenarios) {
  await run(original);
  await run(createNativeSidecarManager);
}
console.log(
  JSON.stringify({
    declarations: SIDECAR_MANAGER_SOURCE.declarations.length,
    pairedScenarios: sidecarManagerScenarios.length,
  }),
);
