import test from "node:test";
import { attachNativeSessionStartup } from "../src/sessions/native-session-startup.js";
import { sessionStartupScenarios } from "../scripts/helpers/session-startup-scenarios.js";
for (const [name, run] of sessionStartupScenarios)
  test("native startup: " + name, () => run(attachNativeSessionStartup));
