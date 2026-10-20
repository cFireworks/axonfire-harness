import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { setTracingDisabled } from "@openai/agents";
import { Usage, type Model, type ModelRequest } from "@openai/agents-core";
import { AgentManager } from "../src/agents/agent-manager.js";
import { AgentFactory } from "../src/agents/agent-factory.js";
import { AgentService } from "../src/agents/agent-service.js";
import { loadProductConfiguration } from "../src/config/product-config.js";
import { McpRegistry } from "../src/mcp/mcp-registry.js";
import type { WorkBuddyModelProvider, SettingsManager } from "../src/models/model-provider.js";
import { ProductPromptRenderer } from "../src/prompts/prompt-renderer.js";
import { RunnerFactory } from "../src/runner/runner-factory.js";
import { SessionManager } from "../src/sessions/session-manager.js";
import { SessionRunStateMachine } from "../src/sessions/run-state-machine.js";
import { SessionStore } from "../src/sessions/session-store.js";
import { ToolManager } from "../src/tools/tool-manager.js";
import { registerCoreFileTools } from "../src/tools/core-file-tools.js";
import { registerDeferredRuntimeTools } from "../src/tools/deferred-runtime.js";

test("real Agents SDK executes recovered Read, persists output, and replays history on next turn", async (t) => {
  setTracingDisabled(true);
  const directory = await mkdtemp(join(tmpdir(), "workbuddy-sdk-runtime-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const path = join(directory, "fixture.txt");
  await writeFile(path, "harness fixture\n");
  const product = await loadProductConfiguration();
  const prompts = new ProductPromptRenderer(product);
  const mcp = new McpRegistry();
  const tools = new ToolManager(product, prompts);
  registerCoreFileTools(tools, { workDir: directory });
  registerDeferredRuntimeTools(tools, mcp, { cwd: directory });
  const state = new SessionRunStateMachine();
  const agents = new AgentManager(product, prompts, tools, mcp, new AgentFactory(state));
  await agents.start();t.after(()=>agents.close());
  const store = new SessionStore({ storageDir: join(directory, "sessions"), workDir: () => directory });
  const errors: unknown[] = [];
  const sessions = new SessionManager(store, state, { onResultError: (error) => errors.push(error) });
  const requests: ModelRequest[] = [];
  let response = 0;
  const model: Model = {
    getResponse: async () => ({ output: [], usage: new Usage() }),
    async *getStreamedResponse(request) {
      requests.push(request);
      response += 1;
      const output = response === 1
        ? [{ type: "function_call", id: "read-call", callId: "read-call", name: "Read", arguments: JSON.stringify({ file_path: path }), status: "completed" }]
        : [{ type: "message", role: "assistant", id: `answer-${response}`, status: "completed", content: [{ type: "output_text", text: response === 2 ? "fixture read" : "history restored" }] }];
      yield { type: "response_started" };
      if (response > 1) yield { type: "output_text_delta", delta: response === 2 ? "fixture read" : "history restored" };
      yield { type: "response_done", response: { id: `response-${response}`, usage: { inputTokens: 40, outputTokens: 5, totalTokens: 45 }, output } } as any;
    },
  };
  const provider = { getModel: () => model } as unknown as WorkBuddyModelProvider;
  const runner = new RunnerFactory(provider, sessions, state, agents, product, { check: () => undefined }, { compactAndSummarize: async () => false });
  const settings: SettingsManager = { get: async <T>() => undefined as T | undefined };
  const service = new AgentService({ initialized: Promise.resolve(), current: () => ({ accessToken: "offline" }), clear: () => undefined }, settings, runner, sessions, state, agents);
  const session = await sessions.create();
  await service.runDefault("read fixture", { context: session });
  const first = session.resultSubject.value as any;
  await first.completed;
  await sessions.waitForResultHandled(first);
  assert.deepEqual(errors, []);
  assert.equal(first.finalOutput, "fixture read");
  const toolResult = (session.history as any[]).find((item) => item.type === "function_call_result");
  assert.ok(JSON.stringify(toolResult).includes("harness fixture"));
  assert.equal(session.status, "idle");
  const transcript = await readFile(store.getSessionFilePath(session.id), "utf8");
  assert.ok(transcript.includes("read-call"));
  await service.runDefault("what was read?", { context: session });
  const second = session.resultSubject.value as any;
  await second.completed;
  await sessions.waitForResultHandled(second);
  assert.equal(second.finalOutput, "history restored");
  assert.ok(JSON.stringify(requests.at(-1)?.input).includes("fixture read"));
  assert.deepEqual(errors, []);
});
