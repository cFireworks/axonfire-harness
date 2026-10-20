import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";
import { cpus } from "node:os";
import Ajv from "ajv";
import * as Errors from "../src/workflow/workflow-errors.js";
import { WorkflowConcurrencyConstants as Constants } from "../src/workflow/subagent-types.js";
import { SubagentAbortBridge, SubagentStallWatchdog, SubagentThrottleRetry, defaultSleep } from "../src/workflow/subagent-control.js";
import { StructuredOutputValidator, StructuredOutputValidationError, StructuredOutputRetryPolicy } from "../src/workflow/structured-output-retry.js";
import { WorkflowSubagentPrompts } from "../src/workflow/workflow-subagent-prompts.js";
import { AgentTaskExecution, previewArgs, extractLastToolCalls } from "../src/workflow/agent-task-execution.js";
import { WorkflowSubagentSpawner } from "../src/workflow/workflow-subagent-spawner.js";
import { WorktreeIsolationStrategy } from "../src/workflow/worktree-isolation-strategy.js";
import { HarnessSession } from "../src/sessions/session.js";
const bundle = process.argv[2]; if (!bundle) throw new Error("Pass captured WorkBuddy codebuddy.js path");
const source = await readFile(bundle, "utf8"), hash = createHash("sha256").update(source).digest("hex");
assert.equal(hash, "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd");
const fixedTime = 1790000000000;
class FixedDate extends Date { constructor(value?: any) { super(value ?? fixedTime); } static override now() { return fixedTime; } }
function evaluate(code: string, bindings: object = {}): any { return runInNewContext(code, { Error, Date: FixedDate, ...bindings }, { timeout: 1000, contextCodeGeneration: { strings: false, wasm: false } }); }
let comparisons = 0;
const normalize = (value: any): any => JSON.parse(JSON.stringify(value, (_key, item) => item instanceof Error ? { ...item, name: item.name, message: item.message } : item) ?? "null");
function equal(after: any, before: any) { assert.deepEqual(normalize(after), normalize(before)); comparisons++; }
async function outcome(operation: () => unknown) { try { return { result: await operation() }; } catch (error) { return { error }; } }
const errorStart = source.indexOf("let WorkflowError=class"), errorEnd = source.indexOf("let Semaphore=class", errorStart);
const nativeErrors = evaluate(`(()=>{${source.slice(errorStart, errorEnd)}return{${Object.keys(Errors).join(",")},WorkflowConcurrencyConstants}})()`, { lH: { cpus } });
equal({ ...Constants }, { ...nativeErrors.WorkflowConcurrencyConstants });
for (const [name, args] of [["WorkflowError", ["bad", { cause: new Error("root") }]], ["WorkflowSourceError", ["missing", "absent"]], ["WorkflowParseError", ["invalid", { line: 1, column: 2 }]], ["WorkflowCompileError", ["bad", { cause: "root" }]], ["WorkflowDeterminismError", [[{ pattern: "Date.now", line: 2, column: 5 }]]], ["WorkflowAbortedError", ["cancel"]], ["WorkflowAgentCapError", [1000]], ["WorkflowBudgetExceededError", [10, 8, 3]], ["WorkflowSandboxError", ["bad", { cause: "root" }]], ["WorkflowParallelExhaustedError", [3, ["a", "b", "c", "d"]]]] as Array<[keyof typeof Errors, any[]]>) equal(new (Errors[name] as any)(...args), new nativeErrors[name](...args));
// Locate delimiters by declarations, so extracted evidence remains readable.
const bridgeStart = source.indexOf("class SubagentAbortBridge"), nativeBridge = evaluate(`(${source.slice(bridgeStart, source.indexOf(";let SubagentStallWatchdog", bridgeStart))})`);
function timers() { const records: any[] = []; return { records, setTimeout: (callback: () => void, delay: number) => { const timer = { callback, delay, unrefs: 0, cleared: false, unref() { this.unrefs++; } }; records.push(timer); return timer; }, clearTimeout: (timer: any) => { timer.cleared = true; }, snapshot: () => records.map(({ delay, unrefs, cleared }) => ({ delay, unrefs, cleared })) }; }
for (const early of [false, true]) for (const dispose of [false, true]) {
  const run = (original: boolean) => { const reasons: string[] = [], controller = new AbortController(); if (early) controller.abort(); const bridge = new (original ? nativeBridge : SubagentAbortBridge)(controller.signal, { abort: (reason: string) => reasons.push(reason) }); if (dispose) bridge.dispose(); controller.abort(); bridge.dispose(); return reasons; }; equal(run(false), run(true));
}
const savedTimeout = globalThis.setTimeout, savedClear = globalThis.clearTimeout, savedDate = globalThis.Date;
globalThis.Date = FixedDate as DateConstructor;
try {
  for (const stallMs of [0, 5000, 6000, 180000, Number.NaN]) for (const elapsed of [0, 4999, 5000, 180000, 200000]) {
    function run(original: boolean) {
      const clock = timers(), reasons: string[] = [], execution = { lastActivityAt: 1000, abort: (reason: string) => reasons.push(reason) }, Original = evaluate(`(${source.slice(8862692, 8863355)})`, { WorkflowConcurrencyConstants: nativeErrors.WorkflowConcurrencyConstants, setTimeout: clock.setTimeout, clearTimeout: clock.clearTimeout });
      globalThis.setTimeout = clock.setTimeout as any; globalThis.clearTimeout = clock.clearTimeout as any;
      const watchdog = new (original ? Original : SubagentStallWatchdog)(execution, stallMs, () => 1000 + elapsed); clock.records[0]!.callback(); watchdog.dispose(); return { reasons, timers: clock.snapshot(), disposed: watchdog.disposed };
    }
    equal(run(false), run(true));
  }
  const throttleStart = source.indexOf("let dl=45e3"), throttleEnd = source.indexOf("var workflow_subagent_spawner_decorate", throttleStart);
  function originalThrottle(bindings: object = {}) { return evaluate(`(()=>{${source.slice(throttleStart, throttleEnd)}return{SubagentThrottleRetry,defaultSleep}})()`, { WorkflowConcurrencyConstants: nativeErrors.WorkflowConcurrencyConstants, WorkflowAbortedError: nativeErrors.WorkflowAbortedError, ...bindings }); }
  const Throttle = originalThrottle().SubagentThrottleRetry;
  for (const text of ["", "rate limit", "throttle", "429", "Too many requests", "unrelated"]) for (const tokens of [undefined, 0, 49, 50]) for (const durationMs of [undefined, 0, 90000, 90001]) for (const stopReason of [undefined, null, "end_turn"]) for (const structured of [undefined, null, {}]) {
    const result: any = { text, tokens, durationMs, stopReason, structured }; equal(new SubagentThrottleRetry().looksThrottled(result), new Throttle().looksThrottled(result));
  }
  for (const first of ["success", "error", "throttle", "late-throttle", "falsey-error"]) for (const secondFails of [false, true]) for (const abort of [false, true]) {
    async function run(original: boolean) { const events: any[] = [], controller = new AbortController(), sleep = async (ms: number) => { events.push(["sleep", ms]); if (abort) controller.abort(); }, retry = new (original ? Throttle : SubagentThrottleRetry)(180000, sleep); let count = 0;
      const result = await outcome(() => retry.run(async (options: any) => { events.push(["call", options.stallMs, options.abortSignal === controller.signal]); count++; if (count === 1) { if (first === "error") throw new Error("failed"); if (first === "throttle") throw new Error("429"); if (first === "falsey-error") throw 0; if (first === "late-throttle") return { text: "rate limit", durationMs: 90001, tokens: 3 }; } if (count > 1 && secondFails) throw new Error("second"); return { text: "answer" }; }, controller.signal)); return { events, result };
    } equal(await run(false), await run(true));
  }
  for (const scenario of ["already-aborted", "abort", "timer"]) {
    async function run(original: boolean) { const controller = new AbortController(), clock = timers(); globalThis.setTimeout = clock.setTimeout as any; globalThis.clearTimeout = clock.clearTimeout as any; if (scenario === "already-aborted") controller.abort(); const sleep = original ? originalThrottle({ setTimeout: clock.setTimeout, clearTimeout: clock.clearTimeout }).defaultSleep : defaultSleep, pending = outcome(() => sleep(45000, controller.signal)); if (scenario === "abort") controller.abort(); else if (scenario === "timer") clock.records[0]!.callback(); return { outcome: await pending, timers: clock.snapshot() }; }
    equal(await run(false), await run(true));
  }
  globalThis.setTimeout = savedTimeout; globalThis.clearTimeout = savedClear;
  const validationStart = source.indexOf("class StructuredOutputValidationError extends"), ValidationError = evaluate(`(${source.slice(validationStart, source.indexOf(";let SubagentAbortBridge", validationStart))})`);
  const validatorStart = source.indexOf("let StructuredOutputValidator=class"), validatorEnd = source.indexOf("let StructuredOutputValidationError=class", validatorStart);
  const Validator = evaluate(`(()=>{${source.slice(validatorStart, validatorEnd)}return StructuredOutputValidator})()`, { di: () => Ajv, StructuredOutputValidationError: ValidationError });
  const Policy = evaluate(`(${source.slice(8859575, 8860184)})`, { u9: 2, truncate: (text: string, max: number) => text.length <= max ? text : text.slice(0, max) + "...[truncated]" });
  const schemas: any[] = [{ type: "object", required: ["n"], properties: { n: { type: "number" } }, additionalProperties: false }, { type: "object", properties: { n: { type: "number", default: 4 } } }, { type: "array", items: { type: "integer" } }, { type: "number" }, { type: "invalid" }];
  for (const schema of schemas) for (const text of ["", "no JSON", "null", "2", "{}", '{"n":3}', '{"n":"3"}', "[1,2]", '```json\n{"n":2}\n```', '😀 prefix {"n":2} tail', 'text [{"n":2}] tail', '~~~JSON\n{}\n~~~']) {
    equal(await outcome(() => new StructuredOutputValidator().validate(text, schema)), await outcome(() => new Validator().validate(text, schema))); equal(StructuredOutputValidator.lenientParse(text), Validator.lenientParse(text));
  }
  for (const attempt of [0, 1, 2, 3]) for (const rawText of [undefined, "", "wrong", "x".repeat(801)]) { const error = new StructuredOutputValidationError("bad", undefined, rawText), options: any = { prompt: "original", schema: {} }; equal(new StructuredOutputRetryPolicy().next(options, attempt, error), new Policy().next(options, attempt, error)); }
  const promptStart = source.indexOf('let cl="workflow-subagent-system-preamble"'), promptClass = source.indexOf("cg=class", promptStart), promptEnd = source.indexOf(";workflow_subagent_prompts_decorate", promptClass), Prompt = evaluate(`(()=>{${source.slice(promptStart, promptClass).replace(/,$/, ";")}return ${source.slice(promptClass + 3, promptEnd)}})()`);
  for (const schema of [undefined, {}]) for (const label of [undefined, "", "worker"]) for (const isolation of [undefined, "inherit", "worktree"]) {
    const options: any = { prompt: "task", schema, label, isolation, phase: "phase", agentType: "Explore" }, before = new Prompt(), after = new WorkflowSubagentPrompts(); equal(after.build(options), before.build(options)); equal(await after.buildAsync(options), await before.buildAsync(options));
  }
  const Worktree = evaluate(`(${source.slice(8858551, 8859533)})`);
  for (const dirty of [false, true]) for (const fails of [false, true]) for (const unavailable of [false, true]) {
    async function run(original: boolean) { const events: any[] = [], service = { create: async (name: string) => { events.push(["create", name]); if (unavailable) throw new Error("unavailable"); return { worktreePath: "/tmp/fixture" }; }, remove: async (...args: any[]) => { events.push(["remove", ...args]); } }, detector = { detect: async () => { if (fails) throw new Error("probe"); return { hasChanges: dirty }; } }, logger = { info: (text: string) => events.push(["info", text]), warn: (text: string) => events.push(["warn", text]) }, strategy = new (original ? Worktree : WorktreeIsolationStrategy)(service, detector, "run-123456789", logger); await (await strategy.lease()).release(); return events; } equal(await run(false), await run(true));
  }
  const previewStart = source.indexOf("let dg=3,dh=80"), previewEnd = source.indexOf("let NestedWorkflowRunner", previewStart), previews = evaluate(`(()=>{${source.slice(previewStart, previewEnd)}return{previewArgs,extractLastToolCalls}})()`);
  for (const args of [undefined, null, 4, "", "x".repeat(81), { command: "echo" }, { pattern: "", query: "search" }, {}, [], { n: 3 }, { toJSON() { throw new Error("no JSON"); } }]) { equal(previewArgs(args), previews.previewArgs(args)); const calls: any = Array.from({ length: 5 }, (_, n) => ({ name: "Read", arguments: args, timestamp: n })); equal(extractLastToolCalls(calls), previews.extractLastToolCalls(calls)); }
  let services: any;
  const Execution = evaluate(`(${source.slice(8868809, 8870571)})`, { r6: { ContainerUtil: { get: (key: string) => services[key] } }, nG: { AgentTask: "task", AgentTaskManager: "manager" }, dd: "general-purpose", extractLastToolCalls: previews.extractLastToolCalls, WorkflowSandboxError: nativeErrors.WorkflowSandboxError });
  for (const aborted of [false, true]) for (const failure of [false, true]) {
    async function run(original: boolean) { const events: any[] = [], controller = new AbortController(), task: any = { id: "task", status: "completed", toolCallHistory: [{ name: "Read", arguments: { file_path: "file" }, timestamp: fixedTime + 20 }], tokenUsage: { inputTokens: 4, outputTokens: 2 }, abortController: controller, init: (config: any) => events.push(["init", { ...config, mainSession: config.mainSession.id }]), execute: async () => { if (failure) throw new Error("task failed"); return { content: "answer", sessionId: "child" }; } }, manager: any = { registerTask: (_task: any, skip: boolean) => events.push(["register", skip]), removeTask: (id: string) => events.push(["remove", id]) }, parent = new HarnessSession("lead"), prompts = new WorkflowSubagentPrompts(), options: any = { prompt: "work", label: "worker", model: "model", maxTurns: 3, abortSignal: new AbortController().signal };
      services = { task, manager }; const execution = original ? new Execution(options, parent, prompts) : new AgentTaskExecution(options, parent, prompts, (config, main) => { task.init({ ...config, mainSession: main }); return task; }, manager); if (aborted) execution.abort("abort"); const activity = execution.lastActivityAt, result = await outcome(() => execution.wait()); return { events, activity, result, settled: execution.settled, aborted: execution.aborted, reason: controller.signal.reason, history: task.toolCallHistory, prompt: task.prompt, response: task.response, taskResult: task.result }; }
    equal(await run(false), await run(true));
  }
  const Spawner = evaluate(`(${source.slice(8865193, 8867173)})`, { StructuredOutputValidator: Validator, StructuredOutputRetryPolicy: Policy, StructuredOutputValidationError: ValidationError, WorkflowSandboxError: nativeErrors.WorkflowSandboxError, WorkflowConcurrencyConstants: nativeErrors.WorkflowConcurrencyConstants, SubagentThrottleRetry: Throttle, SubagentAbortBridge: nativeBridge, SubagentStallWatchdog, WorktreeIsolationStrategy: Worktree });
  for (const outputs of [["answer"], ["bad", '{"n":3}'], ["bad", "bad", "bad"]]) for (const schema of [undefined, schemas[0]]) {
    async function run(original: boolean) { const events: any[] = []; let index = 0; const factory = { create: (options: any, parent: any) => { events.push([options.prompt, options.stallMs, parent.id]); return { lastActivityAt: fixedTime, abort() {}, wait: async () => ({ text: outputs[Math.min(index++, outputs.length - 1)] }) }; } }, logger = { warn: (text: string) => events.push(["warn", text]) }, spawner = original ? Object.assign(new Spawner(), { executionFactory: factory, logger }) : new WorkflowSubagentSpawner(factory as any, undefined, undefined, undefined, logger); spawner.setMainSession(new HarnessSession("lead")); const result = await outcome(() => spawner.spawn({ prompt: "original", schema, abortSignal: new AbortController().signal })); return { events, result }; }
    equal(await run(false), await run(true));
  }
} finally { globalThis.setTimeout = savedTimeout; globalThis.clearTimeout = savedClear; globalThis.Date = savedDate; }
console.log(JSON.stringify({ bundleSHA256: hash, comparisons, passed: true, scope: "Workflow subagent controls, JSON/schema retry, prompts, worktree lease, AgentTask adapter and spawner; not the full Workflow runtime/handler" }, null, 2));
