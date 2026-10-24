import { test } from "node:test";
import { MODULE_RUNTIME_CASES } from "../scripts/helpers/module-runtime-scenarios.js";
import { installNativeModuleRuntime } from "../src/di/native-module-runtime.js";
for (const c of MODULE_RUNTIME_CASES)
  test(c.name, async () => {
    await c.run(installNativeModuleRuntime);
  });
