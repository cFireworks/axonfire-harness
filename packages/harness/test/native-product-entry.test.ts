import { test } from "node:test";
import { createNativeProductEntry } from "../src/runtime/native-product-entry.js";
import { PRODUCT_ENTRY_CASES } from "../scripts/helpers/product-entry-scenarios.js";
for (const scenario of PRODUCT_ENTRY_CASES)
  test(scenario.name, async () => {
    await scenario.run(createNativeProductEntry);
  });
