import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";
import { EventEmitter } from "node:events";
import { BehaviorSubject, EMPTY } from "rxjs";
import { skip, mapTo } from "rxjs/operators/index.js";
import { AgentFactory, STATE_MACHINE_BYPASS_AGENTS, isStateMachineBypassPurpose } from "../src/agents/agent-factory.js";
import { AgentTask, restoreResumedSubAgentMeta } from "../src/agents/agent-task.js";
import { RunResultUtils } from "../src/agents/run-result-utils.js";
import * as types from "../src/sessions/run-state-types.js";
import { SessionRunStateMachine, SESSION_RUN_TRANSITIONS } from "../src/sessions/run-state-machine.js";
import { HarnessSession } from "../src/sessions/session.js";
import { categorizeFailure, extractErrorString, sanitizeErrorForPrompt, isAgentTaskUserInterruption, formatTeammateFailuresBlock } from "../src/agents/teammate-failure.js";
import { TeammateFailureInterceptor } from "../src/agents/teammate-failure-interceptor.js";
import { addSystemReminder } from "../src/agents/system-reminder-agent-run-interceptor.js";
import { ToolArgumentRewriteService } from "../src/tools/tool-argument-rewrite-service.js";
import { McpToolCallContext } from "../src/mcp/mcp-tool-call-context.js";
import { AsyncLocalStorage } from "node:async_hooks";

const bundle = process.argv[2]; if (!bundle) throw new Error("Pass the captured WorkBuddy 5.3.14 codebuddy.js path");
const source = await readFile(bundle, "utf8"), hash = createHash("sha256").update(source).digest("hex");
assert.equal(hash, "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd");
const quiet = { info() {}, warn() {}, error() {}, debug() {}, setContext() {} };
const fixedTime = 1790000000000;
class FixedDate extends Date { constructor(value?: any) { super(value ?? fixedTime); } static override now() { return fixedTime; } }
function evaluate(code: string, bindings: Record<string, unknown> = {}): any { return runInNewContext(code, { Date: FixedDate, Error, String, setTimeout, clearTimeout, ...bindings }, { timeout: 1000, contextCodeGeneration: { strings: false, wasm: false } }); }
function moduleExports(id: number, next: number, deps: Record<number, unknown> = {}) {
  const marker = `${id}(eA,el,ec)`, start = source.indexOf(marker), end = source.indexOf(`},${next}(eA,el,ec)`, start);
  assert.ok(start >= 0 && end > start); const result: any = {};
  const loader: any = (key: number) => deps[key] ?? {}; loader.r = () => undefined; loader.d = (target: any, exports: any) => { for (const [name, get] of Object.entries(exports)) Object.defineProperty(target, name, { get: get as any, enumerable: true }); };
  evaluate(`(function(eA,el,ec)${source.slice(start + marker.length, end + 1)})`)({}, result, loader); return result;
}
const originalTypes = moduleExports(71389, 47262), agentConstants = moduleExports(69466, 77787, { 51147: { BooleanUtils: { isTruthy: (value: unknown) => !!value } } }), purposes = moduleExports(77787, 53224, { 69466: agentConstants });
const tableStart = source.indexOf("let r5={", 11165000) + "let r5=".length;
const table = evaluate(`(${source.slice(tableStart, source.indexOf(",r6=class", tableStart))})`, { t4: originalTypes });
const OriginalState = evaluate(`(${source.slice(11173014, 11178903)})`, { t4: originalTypes, r5: table, r3: { EMPTY }, r4: { skip }, r8: { mapTo } });
let comparisons = 0;
const normalize = (value: any) => JSON.parse(JSON.stringify(value, (_key, item) => item instanceof Error ? { error: item.message } : item) ?? "null");
function equal(left: any, right: any) { assert.deepEqual(normalize(left), normalize(right)); comparisons++; }
equal(SESSION_RUN_TRANSITIONS, table);
for (const name of ["SessionRunStatus", "SessionRunEventType", "SessionRunLegacyAgentState", "SessionRunLifecycle", "SessionRunProjectedPhase", "SESSION_RUN_STATE_PROJECTION_SCHEMA"] as const) equal(types[name], originalTypes[name]);
equal([...STATE_MACHINE_BYPASS_AGENTS], [...agentConstants.STATE_MACHINE_BYPASS_AGENTS]);
for (const status of [...Object.values(types.SessionRunStatus), "INVALID", undefined, null]) {
  for (const helper of ["deriveSessionRunLifecycle", "isSessionRunStatusBusy", "isSessionRunStatusIdle", "isSessionRunStatusBusyForQueue"] as const) equal(types[helper](status as any), originalTypes[helper](status));
  equal(new SessionRunStateMachine().phaseFromStatus(status as any), new OriginalState().phaseFromStatus(status));
}
for (const purpose of [undefined, "", "context_summary_pre_message", "context_summary_max_token", "summary", "memory_extraction", "subagent:Explore"]) equal(isStateMachineBypassPurpose(purpose), purposes.isStateMachineBypassPurpose(purpose));
const savedDate = globalThis.Date; globalThis.Date = FixedDate as DateConstructor;
try {
  for (const status of Object.values(types.SessionRunStatus)) for (const type of [...Object.values(types.SessionRunEventType), "INVALID"]) for (const details of [{}, { reason: "fixture", toolName: "Read", streamingToolName: "file" }, { reason: "", toolName: undefined, streamingToolName: "" }]) {
    function build(original: boolean) {
      const events: any[] = [], session = new HarnessSession("fixture"); session.status = status;
      session.runState = { status, lastTransition: { at: fixedTime - 25, event: "RUN_PREPARING", from: "idle", to: status, reason: undefined } };
      session.runStateSubject.subscribe((value) => events.push(["run", value])); session.agentStateSubject.subscribe((value) => events.push(["agent", value])); session.phaseSubject.subscribe((value) => events.push(["phase", value]));
      const logger = { info: (value: string) => events.push(["info", value]), warn: (value: string) => events.push(["warn", value]) }, machine = original ? Object.assign(new OriginalState(), { logger }) : new SessionRunStateMachine(logger);
      return { session, machine, events };
    }
    const before = build(true), after = build(false), event: any = { type, ...details };
    equal(after.machine.transition(after.session, event), before.machine.transition(before.session, event)); equal(after.events, before.events);
    for (const method of ["getSnapshot", "getLifecycle", "isIdle", "isBusy", "isBusyForQueue"]) equal(after.machine[method](after.session), before.machine[method](before.session));
    equal(after.machine.projectAgentPhase(after.session.runState, event, fixedTime), before.machine.projectAgentPhase(before.session.runState, event, fixedTime));
  }
  for (const skipCurrent of [undefined, false, true]) {
    const events = (original: boolean) => { const session = new HarnessSession("fixture"), machine = original ? new OriginalState() : new SessionRunStateMachine(), output: any[] = []; machine.getChange$(session, skipCurrent).subscribe((value: any) => output.push(value)); machine.forceIdle(session, "repeat"); machine.forceIdle(session, "same millisecond"); session.status = "preparing"; return output; };
    equal(events(false), events(true));
  }
  const installerStart = source.indexOf("function installRunStateProperty("), install = evaluate(`(${source.slice(installerStart, source.indexOf("var session_factory_decorate", installerStart))})`, { AF: { status: "idle" } });
  for (const values of [[{ status: "idle" }, { status: "pending" }, { status: "pending" }], [{ status: "idle", lastTransition: { at: 1 } }, { status: "idle", lastTransition: { at: 1, event: "different" } }, { status: "idle", lastTransition: { at: 2 } }], [undefined, null, { status: "preparing" }, undefined]]) {
    const session: any = new HarnessSession("fixture"), native: any = {}, subject = new BehaviorSubject({ status: "idle" }); install(native, subject);
    const left: any[] = [], right: any[] = []; session.runStateSubject.subscribe((value: any) => left.push(value)); subject.subscribe((value) => right.push(value));
    for (const value of values) { session.runState = value; native.runState = value; equal(session.runState, native.runState); } equal(left, right);
  }
  // Use native constant sets and a fake SDK event emitter to compare the wiring
  // itself; real SDK 0.5.2 execution is covered by lifecycle-runtime.test.ts.
  class FakeAgent extends EventEmitter { name: string; constructor(options: any) { super(); this.name = options.name; } }
  const OriginalFactory = evaluate(`(${source.slice(7063971, 7065964)})`, { AB: { Agent: FakeAgent }, A_: agentConstants, AI: purposes, ra: originalTypes, rn: { McpToolCallContext: { enter() {}, clear() {} } } });
  for (const name of [...agentConstants.STATE_MACHINE_BYPASS_AGENTS, "compact", "contextSummary", "general-purpose"]) for (const purpose of [undefined, "context_summary_pre_message", "summary"]) {
    async function build(original: boolean) {
      const events: any[] = [], state: any = { transition: (_session: any, event: any) => events.push(event) }, rewrite = { process: (value: string) => { events.push(["rewrite", value]); return "fixed"; } };
      const factory: any = original ? Object.assign(new OriginalFactory(), { logger: quiet, stateMachine: state, toolArgumentRewriteService: rewrite }) : new AgentFactory(state, rewrite);
      const agent = await factory.create({ name }), session = new HarnessSession("fixture"); if (purpose !== undefined) session.agentPurpose = purpose;
      const old: any = { context: session }, current: any = { context: session }, missing: any = { context: undefined };
      agent.emit("agent_start", missing); agent.emit("agent_start", old); agent.emit("agent_start", current); agent.emit("agent_end", old);
      events.push(["active", session.activeRunContext === current]);
      const call: any = { callId: "call", name: "Read", arguments: "broken" }; agent.emit("agent_tool_start", current, { name: "Read" }, { toolCall: call }); agent.emit("agent_tool_end", current); agent.emit("agent_handoff", current); agent.emit("agent_end", current); agent.emit("agent_end", current);
      return { events, arguments: call.arguments, active: session.activeRunContext === undefined };
    }
    equal(await build(false), await build(true));
  }
  const helperStart = source.indexOf("function isUserInterruption(", 6948500), helperEnd = source.indexOf("var agent_task_decorate", helperStart);
  const native = evaluate(`(()=>{const e0=500,e1="Task was interrupted by user";${source.slice(helperStart, helperEnd)};return{isUserInterruption,extractErrorString,categorizeFailure,sanitizeErrorForPrompt}})()`);
  const errors: any[] = [null, undefined, "", "Request aborted", "Task was interrupted by user", new Error("Task was interrupted by user"), new Error("401 network error model not found"), "503 unknown model", "model_not_found", "https://host/path?secret=value Bearer abcdefghijkl API_KEY=abcdefghijk", "x".repeat(501), { toString() { throw new Error("cannot stringify"); } }];
  for (const token of ["sk", "tc", "pk", "xoxp", "xoxb", "ghp", "ghs", "glpat"]) for (const length of [8, 15, 16, 32]) errors.push(`${token}-${"a".repeat(length)}`);
  for (const prefix of ["401", "403", "authentication failed", "unauthorized", "invalid api key", "incorrect api key", "econnreset", "etimedout", "enotfound", "econnrefused", "timeout", "timed out", "502", "503", "504", "bad gateway", "service unavailable", "model not found", "unsupported model"]) for (const suffix of ["", " network error", " unknown model"]) errors.push(prefix + suffix);
  for (const error of errors) { equal(isAgentTaskUserInterruption(error), native.isUserInterruption(error)); equal(extractErrorString(error), native.extractErrorString(error)); equal(categorizeFailure(error), native.categorizeFailure(error)); equal(sanitizeErrorForPrompt(error), native.sanitizeErrorForPrompt(error)); }
  const formatStart = source.indexOf("function formatTeammateFailuresBlock("), format = evaluate(`(${source.slice(formatStart, source.indexOf("let nK=class", formatStart))})`, { nG: 600000, nH: "Teammate Failure Report" });
  for (const age of [-1, 0, 599999, 600000, 600001, Number.NaN]) for (const name of [undefined, "worker"]) for (const category of [undefined, "auth", "network", "model", "unknown"]) {
    const members: any = [{ name, lastFailure: { occurredAt: fixedTime - age, category, error: "error" } }, { name: "none" }]; equal(formatTeammateFailuresBlock(members, fixedTime), format(members, fixedTime));
  }
  const resumeStart = source.indexOf("function restoreResumedSubAgentMeta("), resume = evaluate(`(${source.slice(resumeStart, source.indexOf("async function resolveSubagentPermissionModeFromConfig", resumeStart))})`);
  for (const old of [{}, { parentSessionId: "old", taskId: "old-task", taskName: "old-name", agentName: "old-agent", isBackgroundTaskSession: true, rootRequestId: "old-root" }, { parentSessionId: null, taskId: null, planFilePath: null }]) for (const storeId of [undefined, "store"]) {
    const main = new HarnessSession("lead", { meta: { planFilePath: "plan", prePlanPermissionMode: "default", rootRequestId: "root" } }), options = { mainSession: main, taskId: "task", taskName: "name", agentName: "Explore", teamContext: { memberName: "worker" } }, left: any = { storeId, meta: { ...old } }, right: any = { storeId, meta: { ...old } };
    restoreResumedSubAgentMeta(left, options); resume(right, options); equal(left, right);
  }
  const nativeResult = evaluate(`(${source.slice(13255534, source.indexOf(";var t5=", 13255534))})`);
  for (const result of [{}, { finalOutput: "answer" }, { currentTurn: 1 }, { currentTurn: 1, state: { _currentStep: { type: "next_step_final_output" } }, finalOutput: "answer" }, { currentTurn: 1, state: { _currentStep: { type: "next_step_run_again" } }, finalOutput: "not final" }]) { equal(RunResultUtils.isStream(result), nativeResult.isStream(result)); equal(RunResultUtils.isFinalOutput(result), nativeResult.isFinalOutput(result)); equal(RunResultUtils.extractFinalOutput(result), nativeResult.extractFinalOutput(result)); }
  const OriginalTask = evaluate(`(${source.slice(6952421, 6977558)})`, { e1: "Task was interrupted by user", isUserInterruption: native.isUserInterruption, eX: { RunResultUtils: nativeResult }, eD: { ContainerUtil: { get: (key: string) => key === "hooks" ? { executeSubagentStopHooks: async () => undefined } : undefined } }, eJ: { SessionHookManager: "hooks" }, ek: { getTeamMemberRegistry: () => ({ get: () => undefined }) }, sanitizeErrorForPrompt: native.sanitizeErrorForPrompt, categorizeFailure: native.categorizeFailure });
  for (const thrown of ["raw failure", new Error("503"), new Error("Request aborted"), new Error("Task was interrupted by user")]) for (const silent of [undefined, false, true, 1, "yes"]) for (const compressing of [false, true]) for (const terminal of [undefined, "cancelled", "killed"]) {
    async function run(original: boolean) {
      const main = new HarnessSession("lead"), child = new HarnessSession("child"), events: any[] = [], task: any = original ? Object.create(OriginalTask.prototype) : new AgentTask({ prompt: "fixture", description: "fixture" }, main, {} as any, {} as any, {} as any, new SessionRunStateMachine());
      main.isCompressing = compressing; child.resultSubject.next({ silentAbort: silent }); Object.assign(task, { mainSession: main, subAgentSession: child, logger: quiet, status: "pending" });
      task.setupPhase = async () => { if (terminal) task.status = terminal; throw thrown; }; task.cleanup = async () => undefined; task.updateStatus = (status: string) => { task.status = status; events.push(status); }; task.recordTeammateFailure = (...args: any[]) => events.push(["failure", ...args]);
      let raw; try { await task.execute(); } catch (error) { raw = error; } assert.equal(raw, thrown); return { events, status: task.status, error: task.error, endTime: task.endTime };
    }
    equal(await run(false), await run(true));
  }
  for (const scenario of ["final", "nonstream", "error", "cancelled", "retry", "compression", "aborted", "kill_compression", "getter"]) {
    async function run(original: boolean) {
      const session = new HarnessSession("child"), state = new SessionRunStateMachine(), agent = new EventEmitter(); session.status = "agent_running";
      const task: any = original ? Object.create(OriginalTask.prototype) : new AgentTask({ prompt: "fixture", description: "fixture" }, new HarnessSession("lead"), {} as any, {} as any, {} as any, state);
      Object.assign(task, { subAgentSession: session, agent, stateMachine: state, status: "running", logger: quiet, consoleManager: quiet });
      let outcome: any = { pending: true };
      const promise = task.waitForAgentCompletion().then((value: any) => { outcome = { value }; }, (error: any) => { outcome = { error: error.message }; });
      const final = { currentTurn: 1, state: { _currentStep: { type: "next_step_final_output" } }, finalOutput: "answer" };
      switch (scenario) {
        case "final": session.resultSubject.next(final); break;
        case "nonstream": session.resultSubject.next({ finalOutput: "answer" }); break;
        case "getter": session.resultSubject.next({ ...final, get finalOutput() { throw new Error("getter failed"); } }); break;
        case "error": session.resultSubject.next({ currentTurn: 1, error: "503" }); break;
        case "cancelled": session.resultSubject.next({ currentTurn: 1, cancelled: true }); break;
        case "retry": session.meta.retryInProgress = true; session.resultSubject.next({ currentTurn: 1, error: "rate limited" }); break;
        case "compression": session.isCompressing = true; session.resultSubject.next(final); break;
        case "aborted": session.abortController.abort(); break;
        case "kill_compression": session.isCompressing = true; task.status = "killed"; session.abortController.abort(); break;
      }
      agent.emit("agent_end"); await Promise.resolve(); await Promise.resolve(); const intermediate = { ...outcome };
      if (scenario === "retry" || scenario === "compression") { session.meta.retryInProgress = false; session.isCompressing = false; session.resultSubject.next(final); agent.emit("agent_end"); }
      await promise; const result = { intermediate, outcome, compressing: session.isCompressing }; if (!original) task.completionCleanup?.(); agent.removeAllListeners(); session.runStateSubject.complete(); return result;
    }
    equal(await run(false), await run(true));
  }
  const OriginalFailure = evaluate(`(${source.slice(7185305, 7186430)})`, { A_: { AgentRunInterceptorPriority: { TeammateFailureContext: 1160 } }, Av: { ContainerUtil: { get: () => ({ isInTeam: () => true }) } }, nP: { TeamManager: "team" }, nj: { getTeamMemberRegistry: () => ({ getAll: () => [{ info: { name: "worker" }, lastFailure: { occurredAt: fixedTime, category: "network", error: "503" } }] }) }, nH: "Teammate Failure Report", formatTeammateFailuresBlock: format, AH: { MessageUtils: { addSystemReminder } } });
  for (const skipRun of [false, true]) for (const teammate of [false, true]) for (const content of ["hello", "Teammate Failure Report", [{ type: "input_text", text: "hello" }], [{ type: "input_text", text: "Teammate Failure Report" }]]) {
    const registry: any = { getAll: () => [{ info: { name: "worker" }, lastFailure: { occurredAt: fixedTime, category: "network", error: "503" } }] }, after = new TeammateFailureInterceptor({ isInTeam: () => true }, registry), before = Object.assign(new OriginalFailure(), { logger: quiet });
    const context = () => ({ input: [{ type: "message", role: "user", content: structuredClone(content) }], skipRun, session: { meta: teammate ? { teamContext: {} } : {} } });
    const left: any = context(), right: any = context(); await after.intercept(left); await before.intercept(right); equal(left, right); equal(after.priority, before.priority);
  }
  const rewritesStart = source.indexOf("let lv=[", 11892000), rewriteEnd = source.indexOf(";lS=tool_argument_rewrite_service_decorate", rewritesStart);
  const OriginalRewrite = evaluate(`(()=>{${source.slice(rewritesStart, rewriteEnd)};return lS})()`), rewrite = new ToolArgumentRewriteService();
  for (const input of [undefined, null, true, 4, "CB_PROJ_CB.md", ".CB/CB_PROJ_CB.md", "CB_PROJ_CBXmd", "CB_PROJ_CB.md CB_PROJ_CB.md", [".CB/CB_PROJ_CB.md", null, 5], { "CB_PROJ_CB.md": { value: "CB_PROJ_CB.md" } }, '{"path":".CB/CB_PROJ_CB.md"}', new Date(0)]) equal(rewrite.process(input), new OriginalRewrite().process(input));
  const nativeContext = moduleExports(80539, 13394, { 94317: { AsyncLocalStorage } }).McpToolCallContext;
  const contextEvents = (context: typeof McpToolCallContext) => { const events: any[] = []; context.clear(); events.push(context.getStore()); context.enter("call", "Read"); events.push(context.getStore(), context.getCallIdForTool("Read"), context.getCallIdForTool("Write")); context.enter("", ""); events.push(context.getStore()); context.clear(); events.push(context.getStore()); return events; };
  equal(contextEvents(McpToolCallContext), contextEvents(nativeContext));
} finally { globalThis.Date = savedDate; }
console.log(JSON.stringify({ bundleSHA256: hash, differentialComparisons: comparisons, passed: true, scope: "native state table/projection/subjects, AgentFactory, result/wait arbitration, failure sanitization/prompt and resume metadata; not all harness branches" }, null, 2));
