import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedAcpProtocol } from "./helpers/captured-acp-protocol.js";
import {
  ACP_PROTOCOL_CASES,
  protocolSnapshot,
} from "./helpers/acp-protocol-scenarios.js";
import { protocolFactories } from "./helpers/acp-protocol-fixture.js";
const original = loadCapturedAcpProtocol(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const scenario of ACP_PROTOCOL_CASES) {
  const port = await scenario.run(protocolFactories),
    captured = await scenario.run(original);
  assert.deepEqual(
    protocolSnapshot(port),
    protocolSnapshot(captured),
    scenario.name,
  );
}
console.log(
  JSON.stringify({
    ok: true,
    completeClasses: 8,
    classMembers: original.members,
    completePrimitiveFactories: original.factoryCount,
    declarations: original.declarations,
    pairedScenarioGroups: ACP_PROTOCOL_CASES.length,
    bootstrapExecuted: false,
  }),
);
