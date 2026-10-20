import assert from "node:assert/strict";
import test from "node:test";
import { EventEmitter } from "node:events";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { RunContext, setTraceProcessors, Usage, type Model } from "@openai/agents-core";
import { AgentFactory, STATE_MACHINE_BYPASS_AGENTS } from "../src/agents/agent-factory.js";
import { AgentTask, restoreResumedSubAgentMeta } from "../src/agents/agent-task.js";
import { RunResultUtils } from "../src/agents/run-result-utils.js";
import { AGENT_TASK_INTERRUPTED_MESSAGE, categorizeFailure, formatTeammateFailuresBlock, isAgentTaskUserInterruption, sanitizeErrorForPrompt } from "../src/agents/teammate-failure.js";
import { TeammateFailureInterceptor } from "../src/agents/teammate-failure-interceptor.js";
import { HarnessSession } from "../src/sessions/session.js";
import { SessionRunStateMachine } from "../src/sessions/run-state-machine.js";
import { createHarness } from "../src/runtime/create-harness.js";
import { ToolArgumentRewriteService } from "../src/tools/tool-argument-rewrite-service.js";
import { McpToolCallContext } from "../src/mcp/mcp-tool-call-context.js";

setTraceProcessors([]);
const tick = () => new Promise<void>((done) => setImmediate(done));
function fixture(runtime: any = {}) {
  const state = new SessionRunStateMachine(), session = new HarnessSession("child"), agent = new EventEmitter();
  session.status = "agent_running";
  const task: any = new AgentTask({ prompt: "task", description: "fixture", isFormalTeamMember: true, teamContext: { memberName: "worker", teamName: "fixture" } }, new HarnessSession("lead"), {} as any, {} as any, { waitForResultHandled: async () => undefined } as any, state, runtime);
  task.subAgentSession = session; task.agent = agent; task.status = "running";
  return { task, session, agent, state };
}
const final = (output: unknown = "answer") => ({ currentTurn: 1, finalOutput: output, state: { _currentStep: { type: "next_step_final_output" } } });

test("tool argument rewrite preserves native recursive values, unchanged keys and regex-dot behavior", () => {
  const rewrite = new ToolArgumentRewriteService(), input = { "CB_PROJ_CB.md": [".CB/CB_PROJ_CB.md", "CB_PROJ_CBXmd", null, 5], untouched: true };
  assert.deepEqual(rewrite.process(input), { "CB_PROJ_CB.md": [".codebuddy/CODEBUDDY.md", "CODEBUDDY.md", null, 5], untouched: true });
  assert.equal(input["CB_PROJ_CB.md"][0], ".CB/CB_PROJ_CB.md");
});

test("MCP tool call context retains name matching and independent async continuation stores", async () => {
  McpToolCallContext.clear();
  const worker = async (id: string, name: string) => { await tick(); McpToolCallContext.enter(id, name); await tick(); assert.equal(McpToolCallContext.getCallIdForTool(name), id); assert.equal(McpToolCallContext.getCallIdForTool("wrong"), undefined); McpToolCallContext.enter("", ""); assert.equal(McpToolCallContext.getStore()?.callId, id); McpToolCallContext.clear(); assert.equal(McpToolCallContext.getStore(), undefined); };
  await Promise.all([worker("a", "Read"), worker("b", "Write")]); assert.equal(McpToolCallContext.getStore(), undefined);
});

test("AgentFactory filters stale end contexts and wires tool argument rewrite before context entry", async () => {
  const state = new SessionRunStateMachine(), calls: any[] = [], session = new HarnessSession("fixture");
  const factory = new AgentFactory(state, { process: (value) => { calls.push(["rewrite", value]); return '{"fixed":true}'; } }, { enter: (...args) => calls.push(["enter", ...args]), clear: () => calls.push(["clear"]) });
  const agent = await factory.create({ name: "general-purpose" }), old = new RunContext(session), current = new RunContext(session);
  state.transition(session, { type: "RUN_PREPARING" });
  agent.emit("agent_start", old, agent); agent.emit("agent_start", current, agent);
  agent.emit("agent_end", old, "stale"); assert.equal(session.status, "agent_running"); assert.equal(session.activeRunContext, current);
  const call: any = { arguments: "broken", callId: "call", name: "Read" };
  agent.emit("agent_tool_start", current, { name: "Read" } as any, { toolCall: call });
  assert.equal(session.status, "tool_executing"); assert.equal(call.arguments, '{"fixed":true}');
  agent.emit("agent_tool_end", current, {} as any, "result", { toolCall: call });
  assert.equal(session.agentState, "agent_tool_end"); assert.equal(session.status, "agent_running");
  agent.emit("agent_end", current, "answer"); assert.equal(session.status, "idle"); assert.equal(session.activeRunContext, undefined);
  assert.deepEqual(calls, [["rewrite", "broken"], ["enter", "call", "Read"], ["clear"]]);
});

test("AgentFactory bypasses only native generator names and pre-message summary purpose", async () => {
  for (const name of [...STATE_MACHINE_BYPASS_AGENTS, "compact", "contextSummary", "general-purpose"]) for (const purpose of [undefined, "context_summary_pre_message", "memory_extraction"]) {
    const state = new SessionRunStateMachine(), session = new HarnessSession("fixture"), factory = new AgentFactory(state), agent = await factory.create({ name });
    if (purpose !== undefined) session.agentPurpose = purpose; session.status = "pending";
    agent.emit("agent_start", new RunContext(session), agent);
    assert.equal(session.status, STATE_MACHINE_BYPASS_AGENTS.has(name) || purpose === "context_summary_pre_message" ? "pending" : "agent_running");
  }
});

test("stream result guard never reads a finalOutput getter before the final step", () => {
  let reads = 0; const result: any = { currentTurn: 1, state: { _currentStep: { type: "next_step_run_again" } }, get finalOutput() { reads++; return "answer"; } };
  assert.equal(RunResultUtils.isFinalOutput(result), false); assert.equal(RunResultUtils.extractFinalOutput(result), undefined); assert.equal(reads, 0);
  result.state._currentStep.type = "next_step_final_output"; assert.equal(RunResultUtils.extractFinalOutput(result), "answer"); assert.equal(reads, 1);
});

test("completion resolves on idle once, despite duplicate agent_end and throwing stop hook", async () => {
  let stops = 0; const f = fixture({ hooks: { executeSubagentStopHooks: async () => { stops++; throw new Error("hook failed"); } } });
  const wait = f.task.waitForAgentCompletion(); f.session.resultSubject.next(final());
  f.state.transition(f.session, { type: "AGENT_ENDED" }); f.agent.emit("agent_end");
  assert.equal(await wait, "answer"); assert.equal(stops, 1); await f.task.cleanup(); assert.equal(f.agent.listenerCount("agent_end"), 0);
});

test("completion propagates error, cancelled result and thrown finalOutput getter with native wording", async () => {
  for (const [result, expected] of [[{ currentTurn: 1, error: "503 overloaded" }, "503 overloaded"], [{ currentTurn: 1, cancelled: true }, AGENT_TASK_INTERRUPTED_MESSAGE]] as const) {
    const f = fixture(); f.session.resultSubject.next(result); const wait = f.task.waitForAgentCompletion(); f.agent.emit("agent_end"); await assert.rejects(wait, { message: expected }); await f.task.cleanup();
  }
  const f = fixture(); f.session.resultSubject.next({ ...final(), get finalOutput() { throw new Error("getter failed"); } }); const wait = f.task.waitForAgentCompletion(); f.agent.emit("agent_end"); assert.equal(await wait, "Error: getter failed"); await f.task.cleanup();
});

test("completion ignores retry-in-progress errors and compact finalOutput until the next agent_end", async () => {
  for (const compressing of [false, true]) {
    const f = fixture(); f.session.meta.retryInProgress = !compressing; f.session.isCompressing = compressing;
    f.session.resultSubject.next(compressing ? final("compact-only") : { currentTurn: 1, error: new Error("rate limited") });
    let settled = false; const wait = f.task.waitForAgentCompletion().finally(() => { settled = true; });
    f.agent.emit("agent_end"); await tick(); assert.equal(settled, false);
    f.session.meta.retryInProgress = false; f.session.isCompressing = false; f.session.resultSubject.next(final("resumed")); f.agent.emit("agent_end");
    assert.equal(await wait, "resumed"); await f.task.cleanup();
  }
});

test("explicit kill overrides compaction and abort rejects with the exact interruption marker", async () => {
  const f = fixture(); f.session.isCompressing = true;
  const wait = f.task.waitForAgentCompletion(); f.task.status = "killed"; f.session.abortController.abort();
  await assert.rejects(wait, { message: AGENT_TASK_INTERRUPTED_MESSAGE }); assert.equal(f.session.isCompressing, false); await f.task.cleanup();
});

test("compaction abort re-arms a replaced signal and resolves an idle post-compaction result", async () => {
  const f = fixture(); f.session.isCompressing = true;
  const wait = f.task.waitForAgentCompletion(); f.session.abortController.abort();
  f.session.abortController = new AbortController(); f.session.abortSignal = f.session.abortController.signal; f.session.isCompressing = false;
  f.session.agentState = "agent_end"; f.session.resultSubject.next(final("after compaction"));
  assert.equal(await wait, "after compaction"); await f.task.cleanup();
});

test("resumed metadata preserves original parent/task identities and fills nullish plan/request fields", () => {
  const child = new HarnessSession("child", { storeId: "stored-task", meta: { parentSessionId: "old-parent", taskId: "old-task", taskName: "old-name", agentName: "old-agent", isBackgroundTaskSession: true, planFilePath: null } });
  const main = new HarnessSession("lead", { meta: { planFilePath: "plan", prePlanPermissionMode: "default", rootRequestId: "root" } });
  restoreResumedSubAgentMeta(child, { mainSession: main, taskId: "new-task", taskName: "new-name", agentName: "new-agent", teamContext: { memberName: "worker" } });
  assert.equal(child.meta.taskId, "old-task"); assert.equal(child.meta.parentSessionId, "old-parent"); assert.equal(child.meta.planFilePath, "plan"); assert.equal(child.meta.rootRequestId, "root"); assert.equal(child.meta.parentConversationId, "lead"); assert.equal(child.meta.isBackgroundTaskSession, true);
});

test("teammate failure helpers retain exact interruption matching, category precedence and redaction", () => {
  assert.equal(isAgentTaskUserInterruption(new Error(AGENT_TASK_INTERRUPTED_MESSAGE)), true); assert.equal(isAgentTaskUserInterruption(new Error("Request aborted")), false);
  assert.equal(categorizeFailure("401 network error model not found"), "auth"); assert.equal(categorizeFailure("503 unknown model"), "network"); assert.equal(categorizeFailure("model_not_found"), "model");
  assert.equal(sanitizeErrorForPrompt("401 https://host/path?token=secret Bearer sk-abcdefghijklmnopqrst api_key=abcdefghijk\nretry"), "401 https://host/path Bearer <redacted> api_key=<redacted> retry");
  assert.equal(sanitizeErrorForPrompt("x".repeat(501)), "x".repeat(499) + "…");
  const member: any = {}, f = fixture({ getTeamMember: () => member }); f.task.recordTeammateFailure("fallback", new Error("503 Bearer secretsecret"));
  assert.equal(member.lastFailure.category, "network"); assert.equal(member.lastFailure.error, "503 Bearer <redacted>");
});

test("failure prompt respects ten-minute TTL, leader-only injection and existing marker suppression", async () => {
  const now = Date.now(), failure = { error: "failure", occurredAt: now, category: "auth" as const };
  assert.equal(formatTeammateFailuresBlock([{ name: "old", lastFailure: { ...failure, occurredAt: now - 600001 } }], now), undefined);
  assert.match(formatTeammateFailuresBlock([{ name: "boundary", lastFailure: { ...failure, occurredAt: now - 600000 } }], now)!, /boundary \(auth\)/);
  const interceptor = new TeammateFailureInterceptor({ isInTeam: () => true }, { getAll: () => [{ info: { name: "worker" }, lastFailure: failure }] });
  const context: any = { input: [{ type: "message", role: "user", content: "hello" }], session: new HarnessSession("lead"), skipRun: false };
  await interceptor.intercept(context); const once = JSON.stringify(context.input); assert.match(once, /Teammate Failure Report/); await interceptor.intercept(context); assert.equal(JSON.stringify(context.input), once);
  context.input = [{ type: "message", role: "user", content: "hello" }]; context.session.meta.teamContext = { memberName: "worker" }; await interceptor.intercept(context); assert.ok(!JSON.stringify(context.input).includes("Teammate Failure Report"));
});

test("real SDK teammate model failure is not reported as completed and injects a sanitized leader report", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "harness-lifecycle-")); t.after(() => rm(directory, { recursive: true, force: true }));
  const requests: any[] = [];
  const model: Model = { getResponse: async () => ({ output: [], usage: new Usage() }), async *getStreamedResponse(request) {
    requests.push(request);
    if (JSON.stringify(request.input).includes("FAIL_CHILD")) throw new Error("503 network error Bearer private-secret-token https://example.invalid/path?token=private");
    yield { type: "response_done", response: { id: "response", usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 }, output: [{ type: "message", id: "answer", role: "assistant", status: "completed", content: [{ type: "output_text", text: "leader acknowledged" }] }] } } as any;
  } };
  const runtime = await createHarness({ workDir: directory, modelProvider: { getModel: () => model } }); t.after(() => runtime.close());
  // Native Startup warms the default Agent before launching any subagent.
  await runtime.agents.getDefault();
  const main = await runtime.openSession(); await runtime.teamManager.createTeam("failure-test", main);
  const member: any = { teamName: "failure-test", info: { name: "worker" }, isActive: () => false, destroy: async () => undefined };
  runtime.teamMembers.register(member);
  const task = new AgentTask({ prompt: "FAIL_CHILD", description: "Fail fixture", isFormalTeamMember: true, teamContext: { teamName: "failure-test", memberName: "worker" } }, main, runtime.service, runtime.agents, runtime.sessions, runtime.stateMachine, { getTeamMember: () => member });
  await assert.rejects(task.execute(), /503 network error/); assert.equal(task.status, "failed"); assert.equal(member.lastFailure.category, "network"); assert.ok(!member.lastFailure.error.includes("private"));
  assert.equal(await runtime.prompt(main, "Report team status"), "leader acknowledged");
  assert.match(JSON.stringify(requests.at(-1)?.input), /Teammate Failure Report/); assert.ok(!JSON.stringify(requests.at(-1)?.input).includes("private-secret"));
});

test("actual SDK output capture has native RESULT delimiter and compiles without SDK replacement", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "harness-lifecycle-result-")); t.after(() => rm(directory, { recursive: true, force: true }));
  const model: Model = { getResponse: async () => ({ output: [], usage: new Usage() }), async *getStreamedResponse() { yield { type: "response_done", response: { id: "response", usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 }, output: [{ type: "message", id: "answer", role: "assistant", status: "completed", content: [{ type: "output_text", text: "child answer" }] }] } } as any; } };
  const runtime = await createHarness({ workDir: directory, modelProvider: { getModel: () => model } }); t.after(() => runtime.close());
  await runtime.agents.getDefault();
  const main = await runtime.openSession(), task = new AgentTask({ prompt: "complete", description: "Result fixture" }, main, runtime.service, runtime.agents, runtime.sessions, runtime.stateMachine, { outputFiles: new (await import("../src/agents/agent-task-output-file-manager.js")).AgentTaskOutputFileManager(join(directory, "output")), hooks: { executeSubagentStartHooks: async () => { throw new Error("start hook"); }, executeSubagentStopHooks: async () => { throw new Error("stop hook"); } } as any });
  const result = await task.execute(); assert.equal(task.status, "completed"); assert.equal(result.content, `child answer\n\n[Agent ID: ${result.sessionId}]`); assert.ok(Object.hasOwn(result, "afterId")); assert.match(await readFile(task.outputFilePath!, "utf8"), /\n--- RESULT ---\nchild answer\n/);
});
