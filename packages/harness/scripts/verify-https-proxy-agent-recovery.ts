import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedHttpsProxyAgent } from "./helpers/captured-https-proxy-agent.js";
import { HTTPS_PROXY_AGENT_CASES } from "./helpers/https-proxy-agent-scenarios.js";
import { createNativeHttpsProxyAgent } from "../src/runtime/native-https-proxy-agent.js";
const source = loadCapturedHttpsProxyAgent(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of HTTPS_PROXY_AGENT_CASES)
  assert.deepEqual(
    await c.run(createNativeHttpsProxyAgent),
    await c.run(source),
    c.name,
  );
console.log(
  JSON.stringify({
    regions: 0,
    modules: 20,
    comparisons: HTTPS_PROXY_AGENT_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
