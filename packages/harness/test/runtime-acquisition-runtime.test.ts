import { test } from "node:test";
import { runtimeAcquisitionScenarios } from "../scripts/helpers/runtime-acquisition-scenarios.js";
import { createNativeRuntimeAcquisition } from "../src/terminal/native-runtime-acquisition.js";
for (const [name, run] of runtimeAcquisitionScenarios)
  test("native runtime acquisition: " + name, () =>
    run(createNativeRuntimeAcquisition),
  );
