import { test } from "node:test";
import { appCliEnvironmentScenarios } from "../scripts/helpers/app-cli-environment-scenarios.js";
import { createNativeAppCliEnvironment } from "../src/terminal/native-app-cli-environment.js";
for (const [name, run] of appCliEnvironmentScenarios)
  test("native app CLI environment: " + name, () =>
    run(createNativeAppCliEnvironment),
  );
