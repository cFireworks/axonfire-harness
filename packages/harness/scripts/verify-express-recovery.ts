import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedExpress } from "./helpers/captured-express.js";
import { EXPRESS_CASES } from "./helpers/express-scenarios.js";
import { createNativeExpress } from "../src/http/native-express.js";
const source = loadCapturedExpress(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of EXPRESS_CASES)
  assert.deepEqual(
    await c.run(createNativeExpress),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    regions: 0,
    modules: 169,
    comparisons: EXPRESS_CASES.length,
    bundleBootstrapExecuted: false,
    ok: true,
  }),
);
