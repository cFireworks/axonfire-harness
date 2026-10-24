import { test } from "node:test";
import { METER_PROVIDER_CASES } from "../scripts/helpers/meter-provider-scenarios.js";
import { createNativeMeterProvider } from "../src/runtime/native-meter-provider.js";
for (const c of METER_PROVIDER_CASES)
  test(c.name, () => c.run(createNativeMeterProvider));
