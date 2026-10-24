import { test } from "node:test";
import { EXPRESS_CASES } from "../scripts/helpers/express-scenarios.js";
import { createNativeExpress } from "../src/http/native-express.js";
for (const c of EXPRESS_CASES)
  test(c.name, async () => {
    await c.run(createNativeExpress);
  });
