import test from "node:test";
import { AGENT_RUN_CASES } from "../scripts/helpers/agent-run-scenarios.js";
import { agentRunFactories } from "../scripts/helpers/agent-run-fixture.js";
import {
  agentRunSdk,
  AGENT_RUN_SDK_MODES,
} from "../scripts/helpers/agent-run-sdk.js";
for (const scenario of AGENT_RUN_CASES)
  test(scenario.name, () => scenario.run(agentRunFactories));
for (const mode of AGENT_RUN_SDK_MODES)
  test(
    "full original AgentService/interceptors + native sessions + real SDK: " +
      mode,
    { timeout: 20000 },
    async () => {
      await agentRunSdk(agentRunFactories, mode);
    },
  );
