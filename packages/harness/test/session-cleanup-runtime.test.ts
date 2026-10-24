import { test } from "node:test";
import { attachNativeSessionCleanup } from "../src/sessions/native-session-cleanup.js";
import { sessionCleanupScenarios } from "../scripts/helpers/session-cleanup-scenarios.js";
for (const [name, run] of sessionCleanupScenarios)
  test("native session cleanup: " + name, () =>
    run(attachNativeSessionCleanup),
  );
