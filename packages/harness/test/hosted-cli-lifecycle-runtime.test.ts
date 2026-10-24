import { test } from "node:test";
import { hostedCliLifecycleScenarios } from "../scripts/helpers/hosted-cli-lifecycle-scenarios.js";
import { createNativeHostedCliLifecycle } from "../src/terminal/native-hosted-cli-lifecycle.js";
for (const [name, run] of hostedCliLifecycleScenarios)
  test("native hosted CLI lifecycle: " + name, () =>
    run(createNativeHostedCliLifecycle),
  );
