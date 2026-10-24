import { test } from "node:test";
import { createNativeSessionHostRuntime } from "../src/sessions/native-session-host-runtime.js";
import { sessionHostRuntimeScenarios } from "../scripts/helpers/session-host-runtime-scenarios.js";
for (const [name, run] of sessionHostRuntimeScenarios)
  test("native session host: " + name, () =>
    run(createNativeSessionHostRuntime),
  );
