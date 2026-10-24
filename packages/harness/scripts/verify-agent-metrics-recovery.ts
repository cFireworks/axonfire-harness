import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedAgentMetrics } from "./helpers/captured-agent-metrics.js";
import { AGENT_METRICS_CASES } from "./helpers/agent-metrics-scenarios.js";
import { createNativeAgentMetrics } from "../src/runtime/native-agent-metrics.js";
const source = loadCapturedAgentMetrics(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of AGENT_METRICS_CASES)
  assert.deepEqual(
    await c.run(createNativeAgentMetrics),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    modules: 1,
    comparisons: AGENT_METRICS_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
