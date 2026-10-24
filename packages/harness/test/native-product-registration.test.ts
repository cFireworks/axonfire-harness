import { test } from "node:test";
import { PRODUCT_REGISTRATION_CASES } from "../scripts/helpers/product-registration-scenarios.js";
import { createNativeProductRegistration } from "../src/di/native-product-registration.js";
for (const c of PRODUCT_REGISTRATION_CASES)
  test(c.name, async () => {
    await c.run(createNativeProductRegistration);
  });
