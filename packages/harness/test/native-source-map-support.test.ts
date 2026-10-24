import { test } from "node:test";
import { SOURCE_MAP_SUPPORT_CASES } from "../scripts/helpers/source-map-support-scenarios.js";
import { createNativeSourceMapSupport } from "../src/di/native-source-map-support.js";
for (const c of SOURCE_MAP_SUPPORT_CASES)
  test(c.name, async () => {
    await c.run(createNativeSourceMapSupport);
  });
