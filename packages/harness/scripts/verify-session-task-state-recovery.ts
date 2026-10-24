import { loadCapturedSessionTaskState } from "./helpers/captured-session-task-state.js";
import { sessionTaskStateScenarios } from "./helpers/session-task-state-scenarios.js";
import {
  attachNativeSessionTaskState,
  SESSION_TASK_STATE_MEMBERS,
  SESSION_TASK_STATE_FUNCTIONS,
} from "../src/sessions/native-session-task-state.js";
const captured = loadCapturedSessionTaskState();
for (const [, run] of sessionTaskStateScenarios) {
  await run(captured);
  await run(attachNativeSessionTaskState);
}
console.log(
  JSON.stringify({
    sourceComparisons:
      SESSION_TASK_STATE_MEMBERS.length + SESSION_TASK_STATE_FUNCTIONS.length,
    pairedScenarios: sessionTaskStateScenarios.length,
  }),
);
