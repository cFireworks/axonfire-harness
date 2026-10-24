import { test } from "node:test";
import { workbuddyAuthBindingsScenarios } from "../scripts/helpers/workbuddy-auth-bindings-scenarios.js";
import { createNativeWorkbuddyAuthBindings } from "../src/auth/native-workbuddy-auth-bindings.js";
for (const [name, run] of workbuddyAuthBindingsScenarios)
  test("original Workbuddy authentication bindings: " + name, () =>
    run(createNativeWorkbuddyAuthBindings),
  );
