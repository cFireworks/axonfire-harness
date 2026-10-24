import { test } from "node:test";
import { attachNativeSessionPlans } from "../src/sessions/native-session-plans.js";
import { sessionPlansScenarios } from "../scripts/helpers/session-plans-scenarios.js";
for (const [name, run] of sessionPlansScenarios)
  test("native session plans: " + name, () => run(attachNativeSessionPlans));
