import assert from "node:assert/strict";
import test from "node:test";
import { Agent, setTracingDisabled } from "@openai/agents";
import { ModelConfigAgentRunInterceptor, getMaxOutputTokens } from "../src/agents/model-config-agent-run-interceptor.js";
import { AgentManager } from "../src/agents/agent-manager.js";
import { loadProductConfiguration } from "../src/config/product-config.js";
import { ProductPromptRenderer } from "../src/prompts/prompt-renderer.js";
import { McpRegistry } from "../src/mcp/mcp-registry.js";
import { ToolManager } from "../src/tools/tool-manager.js";
import { SessionManager } from "../src/sessions/session-manager.js";
import { HarnessSession } from "../src/sessions/session.js";
import { ToolCallLoopDetectorImpl, LOOP_DETECTION_MARKER } from "../src/runner/tool-call-loop-detector.js";
setTracingDisabled(true);

test("model config honors request > CLI, unknown ids keep base limits, refresh preserves instance", async () => {
  const product = await loadProductConfiguration();
  const prompts = new ProductPromptRenderer(product);
  const agents = new AgentManager(product, prompts, new ToolManager(product, prompts), new McpRegistry());
  await agents.start();
  const sessions = new SessionManager();
  const interceptor = new ModelConfigAgentRunInterceptor(agents, sessions, { get: async () => undefined });
  const session = await sessions.create({ options: { model: "cli-custom" }, requestOptions: { model: "request-custom" } });
  const agent = await agents.getDefault();
  const base = await agents.getModel(agent.name);
  await interceptor.configureModelConfig(agent, session);
  assert.equal(agent.model, "request-custom");
  assert.equal(agent.modelSettings.maxTokens, base.maxOutputTokens);
  assert.equal(agent.modelSettings.temperature, base.temperature ?? 1);
  assert.equal(await agents.ensureAgentToolsFreshForRun(agent.name, session, session.abortSignal,agent), undefined);
  assert.equal(await agents.get(agent.name),agent);
  assert.equal(agent.model, "request-custom");
  delete session.requestOptions.model;
  await interceptor.configureModelConfig(agent, session);
  assert.equal(agent.model, "cli-custom");
});

test("thinking settings preserve product overrides, max=>xhigh and explicit disable", async () => {
  const sessions = new SessionManager();
  const session = new HarnessSession("thinking");
  const values: Record<string, unknown> = { alwaysThinkingEnabled: true, reasoningEffort: "max" };
  const interceptor = new ModelConfigAgentRunInterceptor({} as AgentManager, sessions, { get: async <T>(key: string) => values[key] as T });
  const agent = new Agent<HarnessSession>({ name: "fixture" });
  const model = { id: "fixture", name: "fixture", supportsReasoning: true };
  await interceptor.configureThinkingSettings(agent, model, session);
  assert.deepEqual(agent.modelSettings.reasoning, { summary: "auto", effort: "xhigh" });
  assert.equal(agent.modelSettings.text?.verbosity, "high");
  sessions.setOverrideThinking(session.id, { thinkingEnabled: false });
  await interceptor.configureThinkingSettings(agent, model, session);
  assert.equal(agent.modelSettings.reasoning, undefined);
  sessions.setOverrideThinking(session.id, null);
  await interceptor.configureThinkingSettings(agent, { ...model, supportsReasoning: false }, session);
  assert.equal(agent.modelSettings.reasoning, undefined);
});

test("output token environment cap uses parseInt, 100k ceiling, and configured minimum", () => {
  const previous = process.env.CODEBUDDY_CODE_MAX_OUTPUT_TOKENS;
  try {
    for (const [value, configured, expected] of [["200000", undefined, 100000], ["200000", 24000, 24000], ["500x", 1000, 500], ["0", 1000, 1000], ["bad", undefined, undefined]] as const) {
      process.env.CODEBUDDY_CODE_MAX_OUTPUT_TOKENS = value;
      assert.equal(getMaxOutputTokens(configured), expected);
    }
  } finally {
    if (previous === undefined) delete process.env.CODEBUDDY_CODE_MAX_OUTPUT_TOKENS;
    else process.env.CODEBUDDY_CODE_MAX_OUTPUT_TOKENS = previous;
  }
});

test("loop detector exact 4/40 thresholds, tail boundaries, Read path fallback and one-shot marker", () => {
  const detector = new ToolCallLoopDetectorImpl();
  const calls = (name: string, count: number, args = "{}") => Array.from({ length: count }, () => ({ type: "function_call", name, arguments: args }));
  assert.equal(detector.detectLoop(calls("Bash", 3)).detected, false);
  assert.equal(detector.detectLoop(calls("Bash", 4)).detected, true);
  assert.equal(detector.detectLoop(calls("mcp__fixture__tool", 39)).detected, false);
  assert.equal(detector.detectLoop(calls("mcp__fixture__tool", 40)).detected, true);
  const read = calls("Read", 40).map((item, offset) => ({ ...item, arguments: `{"file_path":"fixture","offset":${offset}` }));
  const detection = detector.detectLoop(read);
  assert.ok(detection.detected);
  assert.equal(detection.reason, "read_file_loop");
  assert.equal(detection.consecutiveCount, 40);
  assert.equal(detector.detectLoop([...read, { type: "message", role: "assistant" }]).detected, false);
  assert.equal(detector.detectLoop([{ type: "message", role: "user", content: [{ text: LOOP_DETECTION_MARKER }] }, ...read]).detected, false);
  assert.ok(detector.check({ input: calls("Bash", 4), instructions: "fixture" } as any)?.input.at(-1));
});
