import { test } from "node:test";
import { attachNativeSessionOperations } from "../src/sessions/native-session-operations.js";
import { sessionOperationsScenarios } from "../scripts/helpers/session-operations-scenarios.js";
for (const [name, run] of sessionOperationsScenarios)
  test("native session operations: " + name, () =>
    run(attachNativeSessionOperations),
  );
