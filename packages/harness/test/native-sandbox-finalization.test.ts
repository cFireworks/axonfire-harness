import test from "node:test";
import { SANDBOX_FINALIZATION_CASES } from "../scripts/helpers/sandbox-finalization-scenarios.js";
import { createNativeSandboxFinalization } from "../src/sandbox/native-sandbox-finalization.js";
for (const c of SANDBOX_FINALIZATION_CASES)
  test(c.name, () => c.run(createNativeSandboxFinalization));
