import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedAgentRun } from "./helpers/captured-agent-run.js";
import { AGENT_RUN_CASES } from "./helpers/agent-run-scenarios.js";
import { agentRunFactories } from "./helpers/agent-run-fixture.js";
import { agentRunSdk, AGENT_RUN_SDK_MODES } from "./helpers/agent-run-sdk.js";
const original = loadCapturedAgentRun(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const scenario of AGENT_RUN_CASES)
  assert.deepEqual(
    await scenario.run(agentRunFactories),
    await scenario.run(original),
    scenario.name,
  );
for (const mode of AGENT_RUN_SDK_MODES)
  assert.deepEqual(
    await agentRunSdk(agentRunFactories, mode),
    await agentRunSdk(original, mode),
    "original AgentService real SDK pair " + mode,
  );
console.log(
  JSON.stringify({
    ...original,
    factory: undefined,
    utilities: undefined,
    comparisons: AGENT_RUN_CASES.length,
    realSdkPairs: AGENT_RUN_SDK_MODES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
