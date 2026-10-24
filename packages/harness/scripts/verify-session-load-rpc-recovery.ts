import { createNativeSessionLoadRpc } from "../src/sessions/native-session-load-rpc.js";
import { loadCapturedSessionLoadRpc } from "./helpers/captured-session-load-rpc.js";
import { sessionLoadRpcScenarios } from "./helpers/session-load-rpc-scenarios.js";
const captured = loadCapturedSessionLoadRpc();
for (const [, run] of sessionLoadRpcScenarios) {
  await run(captured);
  await run(createNativeSessionLoadRpc);
}
console.log(
  JSON.stringify({
    sourceComparisons: 15,
    pairedScenarios: sessionLoadRpcScenarios.length,
  }),
);
