import { test } from "node:test";
import { codeSessionBackendScenarios } from "../scripts/helpers/code-session-backend-scenarios.js";
import { createNativeCodeSessionBackend } from "../src/terminal/native-code-session-backend.js";
for (const [name, run] of codeSessionBackendScenarios)
  test("native complete code session backend: " + name, () =>
    run(createNativeCodeSessionBackend),
  );
