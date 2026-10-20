import { rendezvousFactories } from "./acp-rendezvous-sdk.js";
import { loadCapturedAcpParent } from "./captured-acp-parent.js";
import { loadCapturedNativeHttp } from "./captured-native-http.js";
import { loadCapturedAgentRun } from "./captured-agent-run.js";
import { loadCapturedNativeRunner } from "./captured-native-runner.js";
import { loadCapturedAuthentication } from "./captured-authentication.js";
import { loadCapturedToolPermission } from "./captured-tool-permission.js";
import { loadCapturedInteractionServices } from "./captured-interaction-services.js";
import { loadCapturedAcpProtocol } from "./captured-acp-protocol.js";
import { loadCapturedAcpConnections } from "./captured-acp-connections.js";
import { loadCapturedAcpServices } from "./captured-acp-services.js";
import { loadCapturedAcpLifecycle } from "./captured-acp-lifecycle.js";
import {
  loadCapturedInterruptionController,
  loadCapturedToolApprovalServices,
} from "./captured-interruption-controller.js";
import { loadCapturedAcpReplay } from "./captured-acp-replay.js";
import { loadCapturedSessionStack } from "./captured-session-stack.js";
import { loadCapturedSessionIngress } from "./captured-session-ingress.js";
/** Complete fixed-source business classes/factories, never the app/DI bootstrap. */
export function loadCapturedParentGraph(
  source: string,
): typeof rendezvousFactories {
  return {
    ...rendezvousFactories,
    parent: loadCapturedAcpParent(source).factory,
    http: loadCapturedNativeHttp(source).factory,
    agentRun: loadCapturedAgentRun(source),
    runner: loadCapturedNativeRunner(source).factory,
    authentication: loadCapturedAuthentication(source).factory,
    protocol: loadCapturedAcpProtocol(source) as any,
    connections: loadCapturedAcpConnections(source).factory,
    lifecycle: loadCapturedAcpLifecycle(source).factory,
    services: loadCapturedAcpServices(source).factory,
    interruption: loadCapturedInterruptionController(source),
    approvals: loadCapturedToolApprovalServices(source),
    permission: loadCapturedToolPermission(source),
    interaction: loadCapturedInteractionServices(source).factory,
    replay: loadCapturedAcpReplay(source).factory,
    stack: loadCapturedSessionStack(source).factory,
    ingress: loadCapturedSessionIngress(source).factory,
  };
}
