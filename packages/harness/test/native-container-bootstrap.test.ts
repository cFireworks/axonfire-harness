import { test } from "node:test";
import { CONTAINER_BOOTSTRAP_CASES } from "../scripts/helpers/container-bootstrap-scenarios.js";
import { createNativeContainerBootstrap } from "../src/di/native-container-bootstrap.js";
for (const c of CONTAINER_BOOTSTRAP_CASES)
  test(c.name, async () => {
    await c.run(createNativeContainerBootstrap);
  });
