import { test } from "node:test";
import { BACKEND_NAMESPACE_CASES } from "../scripts/helpers/backend-namespace-scenarios.js";
import { createNativeBackendNamespace } from "../src/di/native-backend-namespace.js";
for (const c of BACKEND_NAMESPACE_CASES)
  test(c.name, async () => {
    await c.run(createNativeBackendNamespace);
  });
