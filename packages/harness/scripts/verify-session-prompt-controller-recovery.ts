import { loadCapturedSessionPromptController } from "./helpers/captured-session-prompt-controller.js";
import { sessionPromptControllerScenarios } from "./helpers/session-prompt-controller-scenarios.js";
import { attachNativeSessionPromptController } from "../src/sessions/native-session-prompt-controller.js";
const captured = loadCapturedSessionPromptController();
for (const [, run] of sessionPromptControllerScenarios) {
  await run(captured);
  await run(attachNativeSessionPromptController);
}
console.log(
  JSON.stringify({
    sourceComparisons: 40,
    pairedScenarios: sessionPromptControllerScenarios.length,
  }),
);
