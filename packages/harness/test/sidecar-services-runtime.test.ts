import { test } from "node:test";
import { recoveredSidecarServices } from "../scripts/helpers/captured-sidecar-services.js";
import { sidecarServiceScenarios } from "../scripts/helpers/sidecar-services-scenarios.js";
for (const [name, run] of sidecarServiceScenarios)
  test("native sidecar services: " + name, () => run(recoveredSidecarServices));
