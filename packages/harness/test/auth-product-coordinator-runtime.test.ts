import { test } from "node:test";
import { createNativeAuthProductCoordinator } from "../src/config/native-auth-product-coordinator.js";
import { authProductCoordinatorScenarios } from "../scripts/helpers/auth-product-coordinator-scenarios.js";
for (const [name, run] of authProductCoordinatorScenarios)
  test("original auth/product coordinator: " + name, () =>
    run(createNativeAuthProductCoordinator),
  );
