import { test } from "node:test";
import { DI_CASES } from "../scripts/helpers/native-di-scenarios.js";
import { createNativeDi } from "../src/di/native-di.js";
for (const c of DI_CASES)
  test(c.name, async () => {
    await c.run(createNativeDi);
  });
