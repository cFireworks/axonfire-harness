import { test } from "node:test";
import { EXPORT_CONTEXT_CASES } from "../scripts/helpers/export-context-scenarios.js";
import { createNativeExportContext } from "../src/runtime/native-export-context.js";
for (const c of EXPORT_CONTEXT_CASES)
  test(c.name, () => c.run(createNativeExportContext));
