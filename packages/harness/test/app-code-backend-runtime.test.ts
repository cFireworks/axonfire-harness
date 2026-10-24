import { test } from "node:test";
import { appCodeBackendScenarios } from "../scripts/helpers/app-code-backend-scenarios.js";
import { createNativeAppCodeBackend } from "../src/terminal/native-app-code-backend.js";
for (const [name, run] of appCodeBackendScenarios)
  test("native app code backend: " + name, () =>
    run(createNativeAppCodeBackend),
  );
