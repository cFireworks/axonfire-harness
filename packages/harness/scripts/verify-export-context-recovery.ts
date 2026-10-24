import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedExportContext } from "./helpers/captured-export-context.js";
import { EXPORT_CONTEXT_CASES } from "./helpers/export-context-scenarios.js";
import { createNativeExportContext } from "../src/runtime/native-export-context.js";
const source = loadCapturedExportContext(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of EXPORT_CONTEXT_CASES)
  assert.deepEqual(
    await c.run(createNativeExportContext),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    regions: 1,
    modules: 9,
    comparisons: EXPORT_CONTEXT_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
