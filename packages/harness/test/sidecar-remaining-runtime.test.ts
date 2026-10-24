import { test } from "node:test";
import { recoveredSidecarRemaining } from "../scripts/helpers/captured-sidecar-remaining.js";
import { sidecarRemainingScenarios } from "../scripts/helpers/sidecar-remaining-scenarios.js";
for (const [name, run] of sidecarRemainingScenarios)
  test("native sidecar remaining services: " + name, () =>
    run(recoveredSidecarRemaining),
  );
