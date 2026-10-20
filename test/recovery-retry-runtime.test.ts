import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ModelBehaviorError, Usage, setTraceProcessors, user, type Model } from "@openai/agents-core";
import { createHarness } from "../src/runtime/create-harness.js";
import { AgentTask } from "../src/agents/agent-task.js";
import { ModelErrorUtils } from "../src/models/model-error-utils.js";
import { StreamTimeoutError, EmptyStreamError } from "../src/models/model-transport.js";
import { InterruptionStreamRecovery, MODEL_ERROR_RETRY_MARKER, NETWORK_ERROR_RETRY_MARKER, sanitizeToolNotFoundMessage } from "../src/permissions/interruption-stream-recovery.js";
import { HarnessSession } from "../src/sessions/session.js";
import { SessionRunStateMachine } from "../src/sessions/run-state-machine.js";
setTraceProcessors([]);
const message = (text: string, id = "answer") => ({ type: "message", role: "assistant", id, status: "completed", content: [{ type: "output_text", text }] });
function modelFixture(run: (request: any, index: number) => any[]): Model {
  let index = 0; return { getResponse: async () => ({ output: [], usage: new Usage() }), async *getStreamedResponse(request) { const output = run(request, ++index); yield { type: "response_started" }; yield { type: "response_done", response: { id: `response-${index}`, output, usage: { inputTokens: 10, outputTokens: 2, totalTokens: 12 } } } as any; } };
}
async function setup(t: { after(callback: () => any): void }, model: Model) {
  const root = await mkdtemp(join(tmpdir(), "harness-retry-")); t.after(() => rm(root, { recursive: true, force: true }));
  const harness = await createHarness({ workDir: root, modelProvider: { getModel: () => model }, approveTool: () => true }); t.after(() => harness.close());
  const session = await harness.openSession(); return { root, harness, session };
}
function history(texts: string[]) { return texts.map((text, index) => ({ ...user(text), id: `item-${index}`, parentId: index ? `item-${index - 1}` : undefined })) as any; }

test("stream error constructors and retry predicates preserve native categories rather than all 5xx/429", () => {
  const first = new StreamTimeoutError(3000, 0, 0, true), empty = new EmptyStreamError(2, 40);
  assert.equal(first.message, "Stream timeout: no data received for 3000ms"); assert.equal(first.isFirstTokenTimeout, true);
  assert.equal(empty.message, "Empty stream: upstream gateway sent only placeholder chunks without any model output (chunks=2, bytes=40)"); assert.ok(empty instanceof StreamTimeoutError);
  assert.equal(ModelErrorUtils.isStreamTimeoutError(empty), true); assert.equal(ModelErrorUtils.isFirstTokenTimeoutError(empty), false);
  for (const code of ["ECONNRESET", "ECONNABORTED", "ETIMEDOUT"]) assert.equal(ModelErrorUtils.isNetworkError({ code }), true);
  for (const error of [{ code: "ENOTFOUND" }, { status: 429 }, { status: 503 }, new Error("network error")]) assert.equal(ModelErrorUtils.isNetworkError(error), false);
  assert.equal(ModelErrorUtils.isRetryableModelError({ error: new SyntaxError("bad") }), true);
});

test("retry caps use linked active-history windows and first-token/stream counters independently", () => {
  const recovery = new InterruptionStreamRecovery(new SessionRunStateMachine(), { service: {} as any }), session = new HarnessSession("fixture");
  session.history = history([MODEL_ERROR_RETRY_MARKER, "ordinary", MODEL_ERROR_RETRY_MARKER, "tail"]); assert.equal(recovery.hasRecentModelErrorRetry(session), true);
  session.history = history([MODEL_ERROR_RETRY_MARKER, "ordinary", "ordinary", MODEL_ERROR_RETRY_MARKER, "tail"]); assert.equal(recovery.hasRecentModelErrorRetry(session), false);
  session.history = history([NETWORK_ERROR_RETRY_MARKER, "tail", "tail"]); assert.equal(recovery.hasRecentNetworkErrorRetry(session), true);
  session.history = history([NETWORK_ERROR_RETRY_MARKER, "tail", "tail", "tail"]); assert.equal(recovery.hasRecentNetworkErrorRetry(session), false);
  recovery.incrementStreamTimeoutRetryCount(session, true); assert.equal(recovery.hasRecentStreamTimeoutRetry(session, true), false); recovery.incrementStreamTimeoutRetryCount(session, true); assert.equal(recovery.hasRecentStreamTimeoutRetry(session, true), true); assert.equal(recovery.hasRecentStreamTimeoutRetry(session, false), false); recovery.incrementStreamTimeoutRetryCount(session, false); assert.equal(recovery.hasRecentStreamTimeoutRetry(session, false), true);
});

test("pending tool recovery writes only unmatched call results then retries after the native delay", async () => {
  const session = new HarnessSession("fixture"), state = new SessionRunStateMachine(), events: any[] = []; session.status = "model_streaming";
  const service: any = { runDefault: async (input: any, options: any) => { events.push(["run", input, options.bypassMessageQueue]); } };
  const recovery = new InterruptionStreamRecovery(state, { service, sleep: async (ms) => { events.push(["sleep", ms]); }, isDeferredDispatchEnabled: () => true });
  const result: any = { lastAgent: { emit: () => events.push(["end"]) }, state: { _context: {} }, newItems: [{ rawItem: { type: "function_call", name: "Read", callId: "pending" } }, { rawItem: { type: "function_call", name: "Read", callId: "done" } }, { rawItem: { type: "function_call_result", callId: "done" } }] };
  assert.equal(await recovery.handleError(session, result, new StreamTimeoutError(3000)), true);
  assert.equal(events[0][1], 200); assert.equal(events[1][1][0].callId, "pending"); assert.equal(events[1][1][0].providerData.error.isStreamTimeout, true); assert.equal(events[2][1], 2000); assert.match(JSON.stringify(events[3][1]), /during tool execution/); assert.equal(events[3][2], true); assert.equal(session.meta.retryInProgress, undefined); assert.equal(session.status, "retrying");
});

test("silent abort marks unmatched calls incomplete without generating an error/retry prompt", async () => {
  const session = new HarnessSession("fixture"), state = new SessionRunStateMachine(), events: any[] = [], recovery = new InterruptionStreamRecovery(state, { service: { runDefault: async () => { events.push("run"); } } as any, isDeferredDispatchEnabled: () => true });
  const call: any = { type: "function_call", callId: "call", status: "completed" }, result: any = { silentAbort: true, lastAgent: { emit: () => events.push("end") }, state: { _context: {} }, newItems: [{ rawItem: call }] };
  assert.equal(await recovery.handleError(session, result, new Error("aborted")), false); assert.equal(result.silentAbort, false); assert.equal(call.status, "incomplete"); assert.deepEqual(events, ["end"]); assert.equal(session.history.length, 0);
});

test("real SDK network failure continues with original recovery prompt and persists both attempts", async (t) => {
  const inputs: any[] = [], model = modelFixture((request, index) => { inputs.push(request.input); if (index === 1) throw Object.assign(new Error("connection reset"), { code: "ECONNRESET" }); return [message("recovered")]; });
  const { harness, session } = await setup(t, model), states: string[] = []; session.runStateSubject.subscribe((state) => states.push(state.status));
  assert.equal(await harness.prompt(session, "continue despite connection error"), "recovered"); assert.equal(inputs.length, 2); assert.match(JSON.stringify(inputs[1]), /Network error occurred, please continue/); assert.ok(states.includes("retrying")); assert.equal(session.meta.retryInProgress, undefined); assert.equal(session.status, "idle");
  const transcript = await readFile(harness.store.getSessionFilePath(session.id), "utf8"); assert.match(transcript, /connection reset/); assert.match(transcript, /recovered/);
});

test("real SDK repeated network failure stops at history-window cap rather than looping", async (t) => {
  let calls = 0; const { harness, session } = await setup(t, modelFixture(() => { calls++; throw Object.assign(new Error("connection reset"), { code: "ECONNRESET" }); }));
  await assert.rejects(harness.prompt(session, "fail with cap"), /connection reset/); assert.equal(calls, 2); assert.equal(session.meta.retryInProgress, undefined); assert.equal(session.status, "idle");
});

test("real SDK model schema failure retries with marker, and deferred-tool invocation gets the exact dispatcher prompt", async (t) => {
  for (const deferred of [false, true]) {
    const inputs: any[] = [], model = modelFixture((request, index) => { inputs.push(request.input); if (index === 1) throw deferred ? new ModelBehaviorError("Tool EnterPlanMode not found in agent Main.") : new SyntaxError("malformed output"); return [message("model recovered")]; });
    const { harness, session } = await setup(t, model); assert.equal(await harness.prompt(session, "fix model format"), "model recovered"); assert.equal(inputs.length, 2);
    assert.match(JSON.stringify(inputs[1]), deferred ? /Deferred Tool — Use DeferExecuteTool/ : /Model error retry: malformed output/);
    assert.match(JSON.stringify(inputs[1]), /error-recovery/);
  }
});

test("real SDK first-token timeout retries once here and resets counters after final output", async (t) => {
  const model = modelFixture((_request, index) => { if (index === 1) throw new StreamTimeoutError(3000, 0, 0, true); return [message("timeout recovered")]; });
  const { harness, session } = await setup(t, model); assert.equal(await harness.prompt(session, "first token retry"), "timeout recovered"); assert.equal(session.meta.firstTokenTimeoutRetryCount, 0); assert.equal(session.meta.streamTimeoutRetryCount, 0);
  assert.match(JSON.stringify(session.history), /First token timeout occurred/);
});

test("actual SDK rejects a directly emitted deferred tool and recovery steers it to the dispatcher", async (t) => {
  const inputs: any[] = [], model = modelFixture((request, index) => { inputs.push(request.input); return index === 1 ? [{ type: "function_call", id: "wrong-direct", callId: "wrong-direct", name: "EnterPlanMode", arguments: "{}", status: "completed" }] : [message("dispatch corrected")]; });
  const { harness, session } = await setup(t, model);
  assert.equal(await harness.prompt(session, "handle deferred tool"), "dispatch corrected"); assert.equal(inputs.length, 2); assert.match(JSON.stringify(inputs[1]), /Deferred Tool — Use DeferExecuteTool/);
});

test("real SDK child network recovery does not prematurely fail or record a false teammate failure", async (t) => {
  let calls = 0; const model = modelFixture(() => { calls++; if (calls === 1) throw Object.assign(new Error("reset child"), { code: "ECONNRESET" }); return [message("child recovered")]; });
  const { harness, session: main } = await setup(t, model); await harness.agents.getDefault(); const member: any = {};
  const task = new AgentTask({ prompt: "child retry", description: "fixture", isFormalTeamMember: true, teamContext: { teamName: "fixture", memberName: "worker", teamMembers: [] } }, main, harness.service, harness.agents, harness.sessions, harness.stateMachine, { interruptions: harness.interruptions, getTeamMember: () => member });
  const result = await task.execute(); assert.match(result.content, /child recovered/); assert.equal(calls, 2); assert.equal(task.status, "completed"); assert.equal(member.lastFailure, undefined);
});

test("sanitizing nonexistent-tool messages preserves original replacement and punctuation", () => {
  assert.equal(sanitizeToolNotFoundMessage("Tool Missing not found in agent Main. Please retry"), 'Tool "Missing" does not exist in the current tool set. Please retry');
});
