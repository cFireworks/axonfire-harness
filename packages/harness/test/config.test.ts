import assert from "node:assert/strict";
import test from "node:test";
import {
  loadProductConfiguration,
  verifyDefaultConfiguration,
} from "../src/config/product-config.js";

test("original WorkBuddy configuration is byte-identical", async () => {
  assert.deepEqual(await verifyDefaultConfiguration(), {
    sha256: "548ba3b51f32afa72ca651cf37d8b181865e3386a3a5aaf4e2ffd73bd257dd00",
    agents: 19,
    tools: 48,
    models: 44,
    prompts: 115,
    promptCharacters: 284_902,
    promptCodePoints: 284_899,
  });
});

test("default agent and agents-as-tools topology is preserved", async () => {
  const product = await loadProductConfiguration();
  assert.equal(product.defaultAgent.name, "cli");
  const agentsAsTools = product.raw.agents
    .filter((agent) => agent.asTool)
    .map((agent) => agent.name);
  assert.deepEqual(agentsAsTools, ["statusline-setup", "Explore", "Plan"]);
});
