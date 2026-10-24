import { test } from "node:test";
import { createNativeSessionLoadRpc } from "../src/sessions/native-session-load-rpc.js";
import { sessionLoadRpcScenarios } from "../scripts/helpers/session-load-rpc-scenarios.js";
for (const [name, run] of sessionLoadRpcScenarios)
  test("native load RPC: " + name, () => run(createNativeSessionLoadRpc));
