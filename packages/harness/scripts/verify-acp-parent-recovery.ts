import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedAcpParent } from "./helpers/captured-acp-parent.js";
import { loadCapturedParentGraph } from "./helpers/captured-parent-graph.js";
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
const reference = loadCapturedParentGraph(source);
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
