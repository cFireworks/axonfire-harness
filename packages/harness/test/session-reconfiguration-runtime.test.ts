import test from "node:test";
import { createNativeSessionConfiguration } from "../src/sessions/native-session-reconfiguration.js";
import { sessionReconfigurationScenarios } from "../scripts/helpers/session-reconfiguration-scenarios.js";
for (const [name, run] of sessionReconfigurationScenarios)
  test("native configuration: " + name, () =>
    run(createNativeSessionConfiguration),
  );
