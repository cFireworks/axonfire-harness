import { test } from "node:test";
import { createNativeSidecarManager } from "../src/terminal/native-sidecar-manager.js";
import { sidecarManagerScenarios } from "../scripts/helpers/sidecar-manager-scenarios.js";
for (const [name, run] of sidecarManagerScenarios)
  test("native sidecar manager: " + name, () =>
    run(createNativeSidecarManager),
  );
