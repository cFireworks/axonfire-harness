import { test } from "node:test";
import { createNativeSessionManager } from "../src/sessions/native-session-manager.js";
import { sessionManagerScenarios } from "../scripts/helpers/session-manager-scenarios.js";
for (const [name, run] of sessionManagerScenarios)
  test("complete native SessionManager: " + name, () =>
    run(createNativeSessionManager),
  );
