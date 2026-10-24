import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedProductEntry } from "./helpers/captured-product-entry.js";
import { PRODUCT_ENTRY_CASES } from "./helpers/product-entry-scenarios.js";
import { createNativeProductEntry } from "../src/runtime/native-product-entry.js";
const source = loadCapturedProductEntry(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of PRODUCT_ENTRY_CASES)
  assert.deepEqual(
    await c.run(createNativeProductEntry),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    regions: 0,
    modules: 1,
    comparisons: PRODUCT_ENTRY_CASES.length,
    bundleBootstrapExecuted: false,
    recoveredProductEntryExecuted: true,
    ok: true,
  }),
);
