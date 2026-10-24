import { test } from "node:test";
import { attachNativeSessionPromptController } from "../src/sessions/native-session-prompt-controller.js";
import { sessionPromptControllerScenarios } from "../scripts/helpers/session-prompt-controller-scenarios.js";
for (const [name, run] of sessionPromptControllerScenarios)
  test("native session prompt: " + name, () => run(attachNativeSessionPromptController));
