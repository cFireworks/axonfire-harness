import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedAcpConnections } from "./helpers/captured-acp-connections.js";
import { loadCapturedAcpSdk } from "./helpers/captured-acp-sdk.js";
import { ACP_CONNECTION_CASES } from "./helpers/acp-connections-scenarios.js";
import { ACP_SDK_CASES } from "./helpers/acp-sdk-scenarios.js";
import { protocolSnapshot } from "./helpers/acp-protocol-scenarios.js";
import { createNativeAcpConnections } from "../src/protocol/native-acp-connections.js";
import { createCapturedAcpSdk } from "../src/vendor/captured-acp-sdk.js";

const cli = readFileSync(getCapturedBundlePath(), "utf8");
const original = loadCapturedAcpConnections(cli),
  sdk = loadCapturedAcpSdk(cli);
for (const scenario of ACP_CONNECTION_CASES)
  assert.deepEqual(
    protocolSnapshot(await scenario.run(createNativeAcpConnections)),
    protocolSnapshot(await scenario.run(original.factory)),
    scenario.name,
  );
for (const scenario of ACP_SDK_CASES)
  assert.deepEqual(
    protocolSnapshot(await scenario.run(createCapturedAcpSdk)),
    protocolSnapshot(await scenario.run(sdk.factory)),
    scenario.name,
  );
console.log(
  JSON.stringify({
    connections: {
      ...original,
      factory: undefined,
      comparisons: ACP_CONNECTION_CASES.length,
    },
    sdk: {
      classes: sdk.classes,
      members: sdk.members,
      comparisons: ACP_SDK_CASES.length,
      originalZodCore: sdk.originalZod.core.version,
    },
    bootstrapExecuted: false,
    ok: true,
  }),
);
