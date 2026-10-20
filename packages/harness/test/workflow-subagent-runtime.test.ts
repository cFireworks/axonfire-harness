import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, rm, writeFile, readFile, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import { SubagentAbortBridge, SubagentStallWatchdog, SubagentThrottleRetry, defaultSleep } from "../src/workflow/subagent-control.js";
import { StructuredOutputValidator, StructuredOutputValidationError, StructuredOutputRetryPolicy } from "../src/workflow/structured-output-retry.js";
import { WorkflowSubagentPrompts } from "../src/workflow/workflow-subagent-prompts.js";
import { WorkflowSubagentSpawner } from "../src/workflow/workflow-subagent-spawner.js";
import { WorktreeIsolationStrategy } from "../src/workflow/worktree-isolation-strategy.js";
import { AgentTaskExecution, extractLastToolCalls } from "../src/workflow/agent-task-execution.js";
import { WorkflowAbortedError, WorkflowSandboxError } from "../src/workflow/workflow-errors.js";
import { HarnessSession } from "../src/sessions/session.js";
import { createHarness } from "../src/runtime/create-harness.js";
setTraceProcessors([]);
const signal = () => new AbortController().signal;
const spec = () => ({ prompt: "work", abortSignal: signal() });
test("Workflow throttle is one 45s backoff only and uses low-token unfinished late responses", async () => {
  const calls: any[] = [], retry = new SubagentThrottleRetry(180000, async (...args) => { calls.push(args[0]); }); let attempts = 0;
  const result = await retry.run(async () => { attempts++; if (attempts === 1) throw new Error("429 throttled"); return { text: "done", tokens: 10 }; }, signal());
  assert.equal(attempts, 2); assert.deepEqual(calls, [45000]); assert.equal(result.throttleRetried, true);
  assert.equal(retry.looksThrottled({ text: "rate limit", tokens: 49, durationMs: 90001 }), true);
  assert.equal(retry.looksThrottled({ text: "rate limit", tokens: 50, durationMs: 90001 }), false);
  assert.equal(retry.looksThrottled({ text: "rate limit", durationMs: 90000 }), false);
  assert.equal(retry.looksThrottled({ text: "rate limit", durationMs: 90001, structured: null }), false);
  assert.equal(retry.looksThrottled({ text: "rate limit", durationMs: 90001, stopReason: "end_turn" }), false);
  assert.equal(retry.looksThrottled(undefined, "429"), false);
});
test("Workflow backoff abort preserves sleep-aborted versus already-aborted marker", async () => {
  const controller = new AbortController(), sleeping = defaultSleep(45000, controller.signal); controller.abort(); await assert.rejects(sleeping, { message: "Workflow aborted: sleep-aborted" });
  await defaultSleep(45000, controller.signal);
  const retry = new SubagentThrottleRetry(180000, async () => { controller.abort(); });
  await assert.rejects(retry.run(async () => { throw new Error("429"); }, controller.signal), { message: "Workflow aborted: aborted-during-throttle-backoff" });
});
test("Workflow abort bridge uses distinct early/late reasons and disposes its listener", () => {
  const reasons: string[] = [], first = new AbortController(); first.abort(); new SubagentAbortBridge(first.signal, { abort: (reason) => reasons.push(reason) });
  const second = new AbortController(), bridge = new SubagentAbortBridge(second.signal, { abort: (reason) => reasons.push(reason) }); second.abort(); bridge.dispose();
  const third = new AbortController(), disposed = new SubagentAbortBridge(third.signal, { abort: (reason) => reasons.push(reason) }); disposed.dispose(); third.abort();
  assert.deepEqual(reasons, ["aborted-before-bridge", "parent-aborted"]);
});
test("Workflow watchdog checks activity timestamps and aborts at the exact threshold", () => {
  let now = 1000, last = 1000; const reasons: string[] = [], execution = { get lastActivityAt() { return last; }, wait: async () => ({ text: "unused" }), abort: (reason: string) => reasons.push(reason) };
  const watchdog = new SubagentStallWatchdog(execution, 10000, () => now); now = 10999; watchdog.check(); assert.equal(reasons.length, 0); last = 10500; now = 20499; watchdog.check(); assert.equal(reasons.length, 0); now = 20500; watchdog.check(); assert.deepEqual(reasons, ["stalled-10000ms"]); watchdog.dispose();
});
test("Workflow JSON parser accepts fences/balanced values, defaults without coercion, and caches schemas", () => {
  const validator = new StructuredOutputValidator(), schema = { type: "object", properties: { n: { type: "number", default: 4 } }, additionalProperties: false };
  assert.deepEqual(validator.validate('Answer:\n```json\n{}\n```', schema), { n: 4 });
  assert.deepEqual(validator.validate('😀 before {"n":2} after', schema), { n: 2 });
  assert.equal(validator.compile(schema), validator.compile(structuredClone(schema)));
  assert.throws(() => validator.validate('{"n":"2"}', schema), /schema validation/); assert.throws(() => validator.validate("no JSON", schema), StructuredOutputValidationError);
});
test("Workflow schema correction uses the original prompt on every retry and allows exactly two corrections", async () => {
  const inputs: string[] = [], outputs = ["no json", '{"n":"wrong"}', '{"n":3}'];
  const spawner = new WorkflowSubagentSpawner({ create: (input) => { inputs.push(input.prompt); return { lastActivityAt: Date.now(), abort() {}, wait: async () => ({ text: outputs.shift()! }) }; } }); spawner.setMainSession(new HarnessSession("lead"));
  const output = await spawner.spawn({ ...spec(), schema: { type: "object", required: ["n"], properties: { n: { type: "number" } } } });
  assert.deepEqual(output.structured, { n: 3 }); assert.equal(output.schemaRetried, true); assert.equal(inputs.length, 3); assert.equal(inputs[2]!.split("Your previous answer did not match").length - 1, 1);
  const policy = new StructuredOutputRetryPolicy(), input = { ...spec(), schema: {} }, error = new StructuredOutputValidationError("bad", undefined, "x".repeat(801)); assert.match(policy.next(input, 2, error)!.prompt, /\.\.\.\[truncated\]/); assert.equal(policy.next(input, 3, error), null);
});
test("Workflow spawner reports parent-session and exhausted-schema errors with native codes", async () => {
  const spawner = new WorkflowSubagentSpawner({ create: () => ({ lastActivityAt: Date.now(), abort() {}, wait: async () => ({ text: "not JSON" }) }) });
  await assert.rejects(spawner.spawn(spec()), { errorCode: 8 }); spawner.setMainSession(new HarnessSession("lead")); await assert.rejects(spawner.spawn({ ...spec(), schema: {} }), (error: any) => error instanceof WorkflowSandboxError && error.message.includes("after 3 retries"));
});
test("Workflow preambles preserve sync fallback, context lines and async registry overrides", async () => {
  const builder = new WorkflowSubagentPrompts({ get: async () => ({ template: "template" }), render: async (_template, options) => JSON.stringify(options.variables) }), input = { ...spec(), label: "worker", phase: "analysis", agentType: "Explore", isolation: "worktree", schema: {} };
  assert.match(builder.build(input).systemPreamble, /Agent \/ SendMessage tools are disabled/); assert.equal(builder.build(input).userPrompt, "[worker]\n\nwork"); assert.match((await builder.buildAsync(input)).systemPreamble, /Label: worker/);
});
test("Workflow worktree lease keeps dirty or failed-probe worktrees and removes clean checkouts", async () => {
  const created: string[] = [], removed: string[] = []; let dirty = false, failed = false;
  const strategy = new WorktreeIsolationStrategy({ create: async (name: string) => { created.push(name); return { worktreePath: `/tmp/${name}` }; }, remove: async (path: string) => { removed.push(path); } } as any, { detect: async () => { if (failed) throw new Error("probe"); return { hasChanges: dirty }; } } as any, "1234567890");
  await (await strategy.lease()).release(); dirty = true; await (await strategy.lease()).release(); dirty = false; failed = true; await (await strategy.lease()).release(); assert.deepEqual(created, ["wf-12345678-1", "wf-12345678-2", "wf-12345678-3"]); assert.deepEqual(removed, ["/tmp/wf-12345678-1"]);
});
test("Workflow AgentTask adapter preserves metrics, snapshots and cleanup; abort forwards only task controller", async () => {
  const events: any[] = [], controller = new AbortController(), history = [{ name: "Read", arguments: { file_path: "fixture" }, timestamp: Date.now() + 1 }], task: any = { id: "task", status: "completed", toolCallHistory: history, tokenUsage: { inputTokens: 5, outputTokens: 2 }, abortController: controller, execute: async () => ({ content: "answer", sessionId: "session" }) };
  const execution = new AgentTaskExecution(spec(), new HarnessSession("lead"), new WorkflowSubagentPrompts(), (input) => { events.push(input); return task; }, { registerTask: () => events.push("register"), removeTask: () => events.push("remove") }); execution.abort("watchdog"); assert.equal(controller.signal.reason, "watchdog"); assert.equal(execution.aborted, true);
  assert.ok(execution.lastActivityAt >= history[0]!.timestamp); const result = await execution.wait(); assert.equal(result.tokens, 7); assert.deepEqual(result.lastToolCalls, [{ tool: "Read", argsPreview: "fixture", at: result.lastToolCalls![0]!.at }]); assert.equal(task.toolCallHistory.length, 0); assert.equal(task.prompt, undefined); assert.equal(events.at(-1), "remove");
  assert.deepEqual(extractLastToolCalls([]), []);
});
test("actual SDK Workflow spawner performs schema correction through detached AgentTask and removes registry entries", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "harness-workflow-spawner-")); t.after(() => rm(root, { recursive: true, force: true })); const requests: any[] = []; let calls = 0;
  const model: Model = { getResponse: async () => ({ output: [], usage: new Usage() }), async *getStreamedResponse(request) { requests.push(request); const text = ++calls === 1 ? "not JSON" : '{"n":42}'; yield { type: "response_done", response: { id: `response-${calls}`, usage: { inputTokens: 10, outputTokens: 2, totalTokens: 12 }, output: [{ type: "message", role: "assistant", id: `answer-${calls}`, status: "completed", content: [{ type: "output_text", text }] }] } } as any; } };
  const harness = await createHarness({ workDir: root, modelProvider: { getModel: () => model } }); t.after(() => harness.close()); const main = await harness.openSession(), spawner = await harness.createWorkflowSubagentSpawner(main);
  const result = await spawner.spawn({ ...spec(), label: "schema-worker", schema: { type: "object", required: ["n"], properties: { n: { type: "number" } } } });
  assert.deepEqual(result.structured, { n: 42 }); assert.equal(result.schemaRetried, true); assert.equal(result.stopReason, "end_turn"); assert.equal(result.tokens, 12); assert.equal(harness.taskManager.getTasks().length, 0); assert.match(JSON.stringify(requests[1].input), /Your previous answer did not match/); assert.ok(!JSON.stringify(main.history).includes("schema-worker"));
});

test("actual SDK Workflow worktree lease runs child Read under isolated cwd and preserves parent edits", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "harness-workflow-worktree-")); t.after(() => rm(root, { recursive: true, force: true }));
  const git = (...args: string[]) => promisify(execFile)("git", args, { cwd: root });
  await git("init", "-b", "main"); await writeFile(join(root, "tracked.txt"), "committed fixture\n"); await git("add", "tracked.txt"); await git("-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid", "commit", "-m", "fixture"); await writeFile(join(root, "tracked.txt"), "parent uncommitted\n");
  const requests: any[] = []; let turn = 0;
  const model: Model = { getResponse: async () => ({ output: [], usage: new Usage() }), async *getStreamedResponse(request) { requests.push(request); const output = ++turn === 1 ? [{ type: "function_call", id: "read", callId: "read", name: "Read", arguments: '{"file_path":"tracked.txt"}', status: "completed" }] : [{ type: "message", role: "assistant", id: "answer", status: "completed", content: [{ type: "output_text", text: "isolated" }] }]; yield { type: "response_done", response: { id: `response-${turn}`, usage: { inputTokens: 10, outputTokens: 2, totalTokens: 12 }, output } } as any; } };
  const harness = await createHarness({ workDir: root, modelProvider: { getModel: () => model }, approveTool: () => true }); t.after(() => harness.close());
  const parent = await harness.openSession(), spawner = await harness.createWorkflowSubagentSpawner(parent), result = await spawner.spawn({ ...spec(), isolation: "worktree", runId: "1234567890" });
  assert.match(result.text, /isolated/); assert.match(JSON.stringify(requests[1].input), /committed fixture/); assert.ok(!JSON.stringify(requests[1].input).includes("parent uncommitted")); assert.equal(await readFile(join(root, "tracked.txt"), "utf8"), "parent uncommitted\n"); await assert.rejects(access(join(root, ".codebuddy", "worktrees", "wf-12345678-1"))); assert.equal(harness.taskManager.getTasks().length, 0);
});
