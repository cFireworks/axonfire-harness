import { loadCapturedWorkbuddyAuthBindings } from "./helpers/captured-workbuddy-auth-bindings.js";
import { workbuddyAuthBindingsScenarios } from "./helpers/workbuddy-auth-bindings-scenarios.js";
import { createNativeWorkbuddyAuthBindings } from "../src/auth/native-workbuddy-auth-bindings.js";
const captured = loadCapturedWorkbuddyAuthBindings();
for (const [, run] of workbuddyAuthBindingsScenarios) {
  await run(captured.factory);
  await run(createNativeWorkbuddyAuthBindings);
}
console.log(
  JSON.stringify({
    sourceComparisons: captured.regions,
    pairedScenarios: workbuddyAuthBindingsScenarios.length,
  }),
);
