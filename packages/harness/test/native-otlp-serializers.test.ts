import { test } from "node:test";
import { OTLP_SERIALIZERS_CASES } from "../scripts/helpers/otlp-serializers-scenarios.js";
import { createNativeOtlpSerializers } from "../src/runtime/native-otlp-serializers.js";
for (const c of OTLP_SERIALIZERS_CASES)
  test(c.name, () => c.run(createNativeOtlpSerializers));
