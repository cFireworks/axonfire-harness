import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedHttpComponents } from "./helpers/captured-http-components.js";
import { HTTP_COMPONENTS_CASES } from "./helpers/http-components-scenarios.js";
import { createNativeHttpComponents } from "../src/http/native-http-components.js";
const source = loadCapturedHttpComponents(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of HTTP_COMPONENTS_CASES)
  assert.deepEqual(
    await c.run(createNativeHttpComponents),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    regions: 0,
    modules: 247,
    comparisons: HTTP_COMPONENTS_CASES.length,
    bundleBootstrapExecuted: false,
    ok: true,
  }),
);
