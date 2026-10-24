import { test } from "node:test";
import { GALILEO_HTTP_INSTRUMENTATION_CASES } from "../scripts/helpers/galileo-http-instrumentation-scenarios.js";
import { createNativeGalileoHttpInstrumentation } from "../src/runtime/native-galileo-http-instrumentation.js";
for (const c of GALILEO_HTTP_INSTRUMENTATION_CASES)
  test(c.name, () => c.run(createNativeGalileoHttpInstrumentation));
