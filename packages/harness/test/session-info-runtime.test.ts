import { test } from "node:test";
import { attachNativeSessionInfo } from "../src/sessions/native-session-info.js";
import { sessionInfoScenarios } from "../scripts/helpers/session-info-scenarios.js";
for (const [name, run] of sessionInfoScenarios)
  test("native session info: " + name, () => run(attachNativeSessionInfo));
