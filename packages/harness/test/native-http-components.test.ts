import { test } from "node:test";
import { HTTP_COMPONENTS_CASES } from "../scripts/helpers/http-components-scenarios.js";
import { createNativeHttpComponents } from "../src/http/native-http-components.js";
for (const c of HTTP_COMPONENTS_CASES)
  test(c.name, async () => {
    await c.run(createNativeHttpComponents);
  });
