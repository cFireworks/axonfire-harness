import { test } from "node:test";
import { BACKEND_SERVER_CASES } from "../scripts/helpers/backend-server-scenarios.js";
import { createNativeBackendServer } from "../src/http/native-backend-server.js";
for (const c of BACKEND_SERVER_CASES)
  test(c.name, async () => {
    await c.run(createNativeBackendServer);
  });
