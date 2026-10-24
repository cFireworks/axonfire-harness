import test from "node:test";
import { createNativeSessionRestart } from "../src/sessions/native-session-restart.js";
import { sessionRestartScenarios } from "../scripts/helpers/session-restart-scenarios.js";
for (const [name, run] of sessionRestartScenarios)
  test("native session restart: " + name, () =>
    run(createNativeSessionRestart),
  );
