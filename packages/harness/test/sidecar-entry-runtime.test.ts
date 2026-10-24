import { test } from "node:test";
import { recoveredSidecarEntry } from "../scripts/helpers/captured-sidecar-entry.js";
import { sidecarEntryScenarios } from "../scripts/helpers/sidecar-entry-scenarios.js";
for (const [name, run] of sidecarEntryScenarios)
  test("native sidecar entry: " + name, () => run(recoveredSidecarEntry));
