import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedAcpParent } from "./helpers/captured-acp-parent.js";
import { loadCapturedNativeHttp } from "./helpers/captured-native-http.js";
import { loadCapturedAgentRun } from "./helpers/captured-agent-run.js";
import { loadCapturedNativeRunner } from "./helpers/captured-native-runner.js";
import { loadCapturedAuthentication } from "./helpers/captured-authentication.js";
import { loadCapturedAcpProtocol } from "./helpers/captured-acp-protocol.js";
import { loadCapturedAcpConnections } from "./helpers/captured-acp-connections.js";
import { loadCapturedAcpServices } from "./helpers/captured-acp-services.js";
import { loadCapturedAcpLifecycle } from "./helpers/captured-acp-lifecycle.js";
import { loadCapturedInterruptionController } from "./helpers/captured-interruption-controller.js";
import { ACP_PARENT_CASES } from "./helpers/acp-parent-scenarios.js";
import {
  acpRendezvousSdk,
  rendezvousFactories,
  ACP_RENDEZVOUS_MODES,
} from "./helpers/acp-rendezvous-sdk.js";
const source = readFileSync(getCapturedBundlePath(), "utf8"),
  original = loadCapturedAcpParent(source);
for (const scenario of ACP_PARENT_CASES)
  assert.deepEqual(
    await scenario.run(),
    await scenario.run(original.factory),
    scenario.name,
  );
const reference = {
  ...rendezvousFactories,
  parent: original.factory,
  http: loadCapturedNativeHttp(source).factory,
  agentRun: loadCapturedAgentRun(source),
  runner: loadCapturedNativeRunner(source).factory,
  authentication: loadCapturedAuthentication(source).factory,
  protocol: loadCapturedAcpProtocol(source) as any,
  connections: loadCapturedAcpConnections(source).factory,
  lifecycle: loadCapturedAcpLifecycle(source).factory,
  services: loadCapturedAcpServices(source).factory,
  interruption: loadCapturedInterruptionController(source),
};
for (const mode of ACP_RENDEZVOUS_MODES)
  assert.deepEqual(
    await acpRendezvousSdk(rendezvousFactories, mode),
    await acpRendezvousSdk(reference, mode),
    "complete parent/ACP/run chain source pair " + mode,
  );
console.log(
  JSON.stringify({
    ...original,
    factory: undefined,
    comparisons: ACP_PARENT_CASES.length,
    realSdkHttpRendezvousPairs: ACP_RENDEZVOUS_MODES.length,
    originalBootstrapExecuted: false,
    productionAccountUsed: false,
    ok: true,
  }),
);
