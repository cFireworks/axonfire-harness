import { test } from "node:test";
import { createNativeSidecarClient } from "../src/terminal/native-sidecar-client.js";
import { sidecarClientScenarios } from "../scripts/helpers/sidecar-client-scenarios.js";
for (const [name, run] of sidecarClientScenarios)
  test("native sidecar client: " + name, () => run(createNativeSidecarClient));
