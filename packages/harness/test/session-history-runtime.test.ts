import { test } from "node:test";
import { attachNativeSessionHistory } from "../src/sessions/native-session-history.js";
import { sessionHistoryScenarios } from "../scripts/helpers/session-history-scenarios.js";
for (const [name, run] of sessionHistoryScenarios)
  test("native session history: " + name, () =>
    run(attachNativeSessionHistory),
  );
