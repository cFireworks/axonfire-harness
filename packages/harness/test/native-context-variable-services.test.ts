import { test } from "node:test";
import { createNativeContextVariableServices } from "../src/runtime/native-context-variable-services.js";
import { contextVariableServicesScenario } from "../scripts/helpers/context-variable-services-scenarios.js";
test("original context-variable manager registers through bootstrap and preserves priority, skipped failures, collection and map semantics", async () => {
  await contextVariableServicesScenario(createNativeContextVariableServices);
});
