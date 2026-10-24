import { test } from "node:test";
import { createNativeContainerBootstrap } from "../src/di/native-container-bootstrap.js";
import { backendFoundationScenario } from "../scripts/helpers/backend-foundation-scenarios.js";
test("original bootstrap loads shared backend, REST, path and HTTP parents and serves real REST health request", async () => {
  await backendFoundationScenario(createNativeContainerBootstrap);
});
