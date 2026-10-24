import { loadCapturedSidecar } from "./helpers/captured-sidecar.js";
import { sidecarScenarios } from "./helpers/sidecar-scenarios.js";
import { createNativeSidecarEnvironment } from "../src/terminal/native-sidecar-environment.js";
import { createNativeSidecar } from "../src/terminal/native-sidecar.js";
const captured = loadCapturedSidecar();
await sidecarScenarios(captured.environment, captured.sidecar);
await sidecarScenarios(createNativeSidecarEnvironment, createNativeSidecar);
console.log(
  JSON.stringify({
    declarations: captured.declarations,
    comparison: "verbatim source regions",
    pairedScenarios: "ring buffer, environment, readiness",
  }),
);
