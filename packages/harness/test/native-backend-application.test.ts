import { test } from "node:test";
import { BACKEND_APPLICATION_CASES } from "../scripts/helpers/backend-application-scenarios.js";
import { createNativeBackendApplication } from "../src/runtime/native-backend-application.js";
for (const c of BACKEND_APPLICATION_CASES)
  test(c.name, async () => {
    await c.run(createNativeBackendApplication);
  });
