import assert from "node:assert/strict";
import test from "node:test";
import { autoModeSupportScenarios, originalAutoPrompt } from "../scripts/helpers/auto-mode-support-scenarios.js";
import { createNativeAutoModeRuntime } from "../src/permissions/native-auto-mode-runtime.js";

test("original Auto support preserves settings sources, prompt substitution, memory and context limits", async () => {
  await autoModeSupportScenarios();
});

test("composed Auto runtime builds the captured prompt and stops oversized transcripts before the model", async () => {
  const template = await originalAutoPrompt(), calls: any[] = [];
  let maxInputTokens = 128000;
  const runtime = createNativeAutoModeRuntime({
    settingsManager: { async get() { return {}; } },
    promptManager: { async get() { return { template }; } },
    agentManager: { async getModel() { return { id: "owned" }; } },
    productManager: { async waitConfiguration() { return { models: [{ id: "owned", maxInputTokens }] }; } },
    memoryManager: { async get() { return [{ content: "owned instruction" }]; } },
    tools: [{ name: "Bash", toAutoClassifierInput: input => input.command }],
    getHomeDir: () => "/owned/state",
    agentService: { async runOneTimeWithOverrides(name, input, overrides) { calls.push({ name, input, overrides }); return "<block>no</block>"; } },
  });
  const request = { sessionId: "owned", toolName: "Bash", toolInput: { command: "owned action" }, headless: true, canPrompt: false };
  assert.equal((await runtime.service.classifyAsk(request)).behavior, "allow");
  assert.equal(calls.length, 1);
  assert.ok(calls[0].overrides.systemPrompt.length > 25000);
  assert.equal(calls[0].overrides.systemPrompt.includes("user_allow_rules_to_replace"), false);
  assert.match(JSON.stringify(calls[0].input), /owned instruction/);
  maxInputTokens = 1;
  const overflow: any = await runtime.service.classifyAsk(request);
  assert.equal(overflow.behavior, "transcriptTooLong"); assert.equal(overflow.headlessAbort, true);
  assert.equal(calls.length, 1);
});
