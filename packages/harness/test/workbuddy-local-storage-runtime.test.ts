import { test } from "node:test";
import { workbuddyLocalStorageScenarios } from "../scripts/helpers/workbuddy-local-storage-scenarios.js";
import { createNativeWorkbuddyLocalStorage } from "../src/config/native-workbuddy-local-storage.js";
for (const [name, run] of workbuddyLocalStorageScenarios)
  test("original Workbuddy local storage: " + name, () =>
    run(createNativeWorkbuddyLocalStorage),
  );
