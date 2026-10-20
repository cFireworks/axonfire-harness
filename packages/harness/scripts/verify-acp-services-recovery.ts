import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedAcpServices } from "./helpers/captured-acp-services.js";
import { ACP_SERVICES_CASES } from "./helpers/acp-services-scenarios.js";
import { protocolSnapshot } from "./helpers/acp-protocol-scenarios.js";
import { createNativeAcpServices } from "../src/protocol/native-acp-services.js";
const original = loadCapturedAcpServices(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const scenario of ACP_SERVICES_CASES)
  assert.deepEqual(
    protocolSnapshot(await scenario.run(createNativeAcpServices)),
    protocolSnapshot(await scenario.run(original.factory)),
    scenario.name,
  );
console.log(
  JSON.stringify({
    ...original,
    factory: undefined,
    comparisons: ACP_SERVICES_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
