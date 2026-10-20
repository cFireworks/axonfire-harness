import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedAcpReplay } from "./helpers/captured-acp-replay.js";
import { loadCapturedParentGraph } from "./helpers/captured-parent-graph.js";
import {
  ACP_PARENT_RECOVERY_MODES,
  acpParentSessionLifecycle,
  ACP_PARENT_FAILURE_MODES,
  acpParentFailureLifecycle,
} from "./helpers/acp-parent-session-lifecycle.js";
import { ACP_REPLAY_CASES } from "./helpers/acp-replay-scenarios.js";
const source = readFileSync(getCapturedBundlePath(), "utf8"),
  original = loadCapturedAcpReplay(source),
  reference = loadCapturedParentGraph(source);
for (const scenario of ACP_REPLAY_CASES)
  assert.deepEqual(
    await scenario.run(),
    await scenario.run(original.factory),
    scenario.name,
  );
for (const mode of ACP_PARENT_RECOVERY_MODES)
  assert.deepEqual(
    await acpParentSessionLifecycle(mode),
    await acpParentSessionLifecycle(mode, reference),
    "complete native parent disk lifecycle source pair " + mode,
  );
for (const mode of ACP_PARENT_FAILURE_MODES)
  assert.deepEqual(
    await acpParentFailureLifecycle(mode),
    await acpParentFailureLifecycle(mode, reference),
    "native parent entrance edge source pair " + mode,
  );
console.log(
  JSON.stringify({
    ...original,
    factory: undefined,
    comparisons: ACP_REPLAY_CASES.length,
    coldParentPairs: ACP_PARENT_RECOVERY_MODES.length,
    entranceEdgePairs: ACP_PARENT_FAILURE_MODES.length,
    originalBootstrapExecuted: false,
    productionAccountUsed: false,
    ok: true,
  }),
);
