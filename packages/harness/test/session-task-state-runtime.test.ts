import { test } from "node:test";
import { attachNativeSessionTaskState } from "../src/sessions/native-session-task-state.js";
import { sessionTaskStateScenarios } from "../scripts/helpers/session-task-state-scenarios.js";
for (const [name, run] of sessionTaskStateScenarios)
  test("native session task state: " + name, () =>
    run(attachNativeSessionTaskState),
  );
