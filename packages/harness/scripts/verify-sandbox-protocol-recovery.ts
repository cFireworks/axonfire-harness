import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedSandboxProtocol } from "./helpers/captured-sandbox-protocol.js";
import {
  SANDBOX_PROTOCOL_CASES,
  sandboxProtocolFactories,
} from "./helpers/sandbox-protocol-scenarios.js";

const original = loadCapturedSandboxProtocol(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const scenario of SANDBOX_PROTOCOL_CASES)
  assert.deepEqual(
    scenario.run(sandboxProtocolFactories),
    scenario.run(original),
    scenario.name,
  );
console.log(
  JSON.stringify({
    modules: original.modules,
    configClasses: original.configClasses,
    comparisons: SANDBOX_PROTOCOL_CASES.length,
    bootstrapExecuted: original.bootstrapExecuted,
    ok: true,
  }),
);
