import { loadCapturedWorkbuddyLocalStorage } from "./helpers/captured-workbuddy-local-storage.js";
import { workbuddyLocalStorageScenarios } from "./helpers/workbuddy-local-storage-scenarios.js";
import { createNativeWorkbuddyLocalStorage } from "../src/config/native-workbuddy-local-storage.js";
const captured = loadCapturedWorkbuddyLocalStorage();
for (const [, run] of workbuddyLocalStorageScenarios) {
  await run(captured.factory);
  await run(createNativeWorkbuddyLocalStorage);
}
console.log(
  JSON.stringify({
    sourceComparisons: captured.regions,
    pairedScenarios: workbuddyLocalStorageScenarios.length,
  }),
);
