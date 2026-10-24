import { test } from "node:test";
import { HTTPS_PROXY_AGENT_CASES } from "../scripts/helpers/https-proxy-agent-scenarios.js";
import { createNativeHttpsProxyAgent } from "../src/runtime/native-https-proxy-agent.js";
for (const c of HTTPS_PROXY_AGENT_CASES)
  test(c.name, () => c.run(createNativeHttpsProxyAgent));
