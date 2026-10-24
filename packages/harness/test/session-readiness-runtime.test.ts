import test from "node:test";
import { attachNativeSessionReadiness } from "../src/sessions/native-session-readiness.js";
import { sessionReadinessScenarios } from "../scripts/helpers/session-readiness-scenarios.js";
for (const [name, run] of sessionReadinessScenarios)
  test("native readiness: " + name, () => run(attachNativeSessionReadiness));
