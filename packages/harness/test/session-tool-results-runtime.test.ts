import { test } from "node:test";
import { attachNativeSessionToolResults } from "../src/sessions/native-session-tool-results.js";
import { sessionToolResultsScenarios } from "../scripts/helpers/session-tool-results-scenarios.js";
for (const [name, run] of sessionToolResultsScenarios)
  test("native session tool results: " + name, () =>
    run(attachNativeSessionToolResults),
  );
