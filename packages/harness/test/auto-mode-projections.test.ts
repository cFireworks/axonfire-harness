import assert from "node:assert/strict";
import test from "node:test";
import { loadProductConfiguration } from "../src/config/product-config.js";
import { ProductPromptRenderer } from "../src/prompts/prompt-renderer.js";
import { ToolManager } from "../src/tools/tool-manager.js";

test("tool descriptors preserve native, empty inherited and explicit custom Auto projections", async () => {
  const product = await loadProductConfiguration();
  const tools = new ToolManager(product, new ProductPromptRenderer(product));
  for (const name of ["Bash", "TaskList", "OwnedUnknown"]) tools.register(name, { execute() {} });
  tools.register("OwnedCustom", { toAutoClassifierInput: input => `owned:${input.value}`, execute() {} });
  const projections = tools.getAutoClassifierTools();
  assert.equal(projections.find(tool => tool.name === "Bash")?.toAutoClassifierInput({ command: "echo owned", description: "excluded" }), "echo owned");
  assert.equal(projections.find(tool => tool.name === "TaskList")?.toAutoClassifierInput({ owned: true }), "");
  assert.equal(projections.find(tool => tool.name === "OwnedUnknown"), undefined);
  assert.equal(projections.find(tool => tool.name === "OwnedCustom")?.toAutoClassifierInput({ value: "input" }), "owned:input");
  assert.equal((await tools.get("Bash"))?.toAutoClassifierInput?.({ command: "echo owned" }), "echo owned");
  assert.equal((await tools.get("OwnedUnknown"))?.toAutoClassifierInput, undefined);
  assert.equal((await tools.get("OwnedCustom"))?.toAutoClassifierInput?.({ value: "input" }), "owned:input");
});
