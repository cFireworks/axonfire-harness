import test from "node:test";
import { AGENT_METRICS_CASES } from "../scripts/helpers/agent-metrics-scenarios.js";
import { createNativeAgentMetrics } from "../src/runtime/native-agent-metrics.js";
for (const c of AGENT_METRICS_CASES)
  test(c.name, () => c.run(createNativeAgentMetrics));
