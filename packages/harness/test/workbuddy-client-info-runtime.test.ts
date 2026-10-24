import { test } from "node:test";
import { createNativeWorkbuddyClientInfo } from "../src/auth/native-workbuddy-client-info.js";
import { workbuddyClientInfoScenarios } from "../scripts/helpers/workbuddy-client-info-scenarios.js";
for (const [name, run] of workbuddyClientInfoScenarios)
  test(`original WorkBuddy client info: ${name}`, () =>
    run(createNativeWorkbuddyClientInfo));
