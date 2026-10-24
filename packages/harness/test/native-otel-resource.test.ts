import { test } from "node:test";
import { OTEL_RESOURCE_CASES } from "../scripts/helpers/otel-resource-scenarios.js";
import { createNativeOtelResource } from "../src/runtime/native-otel-resource.js";
for (const c of OTEL_RESOURCE_CASES)
  test(c.name, () => c.run(createNativeOtelResource));
