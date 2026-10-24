import test from "node:test";
import { TRACING_CASES } from "../scripts/helpers/tracing-scenarios.js";
import { createNativeTracing } from "../src/runtime/native-tracing.js";
for (const c of TRACING_CASES) test(c.name, () => c.run(createNativeTracing));
