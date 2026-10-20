import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";
import { ModelBehaviorError, user } from "@openai/agents-core";
import { InterruptionStreamRecovery, createRecoveryAssistantMessage, MODEL_ERROR_RETRY_MARKER, MODEL_ERROR_RETRY_CHECK_WINDOW, MODEL_ERROR_MAX_RETRIES, NETWORK_ERROR_RETRY_MARKER, NETWORK_ERROR_RETRY_CHECK_WINDOW, sanitizeToolNotFoundMessage } from "../src/permissions/interruption-stream-recovery.js";
import { ModelErrorUtils, INTERRUPTED_BY_USER_MESSAGE } from "../src/models/model-error-utils.js";
import { StreamTimeoutError, EmptyStreamError } from "../src/models/model-transport.js";
import { SessionRunStateMachine } from "../src/sessions/run-state-machine.js";
import * as runTypes from "../src/sessions/run-state-types.js";
import { HarnessSession } from "../src/sessions/session.js";
import { getActiveAgentOnlyHistory } from "../src/sessions/history-utils.js";
import { RunResultUtils } from "../src/agents/run-result-utils.js";
import { createToolCallResultItem, detectStatusFromOutput } from "../src/tools/tool-rejection.js";
const bundle = process.argv[2]; if (!bundle) throw new Error("Pass captured WorkBuddy codebuddy.js path");
const source = await readFile(bundle, "utf8"), hash = createHash("sha256").update(source).digest("hex");
assert.equal(hash, "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd");
const quiet = { info() {}, warn() {}, error() {}, debug() {} };
function evaluate(code: string, bindings: object = {}): any { return runInNewContext(code, { Error, SyntaxError, setImmediate, ...bindings }, { timeout: 1000, contextCodeGeneration: { strings: false, wasm: false } }); }
function assignedFunction(name: string, endName: string, bindings: object = {}) { const start = source.indexOf(`eA.${name}=function`, 13075000) + `eA.${name}=`.length, end = source.indexOf(`,eA.${endName}=`, start); assert.ok(start > 13075000 && end > start); return evaluate(`(${source.slice(start, end)})`, bindings); }
const nativeErrors: any = {
  isNetworkError: assignedFunction("isNetworkError", "isModelOverloadedError"),
  isStreamTimeoutError: assignedFunction("isStreamTimeoutError", "isFirstTokenTimeoutError", { ef: { StreamTimeoutError } }),
  isFirstTokenTimeoutError: assignedFunction("isFirstTokenTimeoutError", "isEmptyStreamError", { ef: { StreamTimeoutError } }),
  isRetryableModelError: assignedFunction("isRetryableModelError", "isStreamTimeoutError", { eh: { ModelBehaviorError } }),
  formatErrorMessage: assignedFunction("formatErrorMessage", "isNetworkError", { ep: { ContainerUtil: { get: () => ({ getCurrentConfiguration: () => ({}) }) } }, eg: { ProductManager: "product" }, em: { AnsiUtils: { createHyperlink: (text: string) => text } }, eE: { ThemeUtils: { chalk: { secondary: (text: string) => text } } }, eu: { UsageLimitExceeded: 14001 }, eI: "Interrupted by user" }),
};
let assertions = 0;
function normalize(value: unknown): any { return JSON.parse(JSON.stringify(value, (key, item) => key === "id" ? "ID" : item instanceof Error ? { message: item.message } : item) ?? "null"); }
function equal(after: unknown, before: unknown) { assert.deepEqual(normalize(after), normalize(before)); assertions++; }
// Engine-generated TypeError text embeds renamed local identifiers.
const capture = (operation: () => unknown) => { try { return { result: operation() }; } catch (error) { return { error: (error as Error).name }; } };
const sampleErrors: any[] = [null, undefined, {}, "text", new Error("failure"), Object.assign(new Error("reset"), { code: "ECONNRESET" }), { code: "ECONNABORTED" }, { code: "ETIMEDOUT" }, { code: "ENOTFOUND" }, new StreamTimeoutError(3000, 2, 40), new StreamTimeoutError(3000, 0, 0, true), new EmptyStreamError(1, 5), { message: "Stream timeout: no data received 4000ms" }, new SyntaxError("malformed JSON"), new ModelBehaviorError("Tool Unknown not found in agent Main."), { error: new SyntaxError("wrapped") }, { error: new ModelBehaviorError("wrapped") }, { status: 429, code: 14001, message: "credits" }, { message: "Request was aborted." }, { message: "Request aborted." }, { message: "cancelled" }];
for (const error of sampleErrors) for (const name of Object.keys(nativeErrors)) equal(capture(() => (ModelErrorUtils as any)[name](error)), capture(() => nativeErrors[name](error)));
const nativeConstants = { MODEL_ERROR_RETRY_MARKER, MODEL_ERROR_RETRY_CHECK_WINDOW, MODEL_ERROR_MAX_RETRIES, NETWORK_ERROR_RETRY_MARKER, NETWORK_ERROR_RETRY_CHECK_WINDOW };
let currentServices: any;
const Original = evaluate(`(${source.slice(11047102, 11089570)})`, {
  t4: runTypes,
  AB: { RunResultUtils, ErrorUtils: nativeErrors, HistoryUtils: { getActiveAgentOnlyHistory }, QueueDispatchUtils: { isDeferredDispatchEnabledSync: () => currentServices.deferred }, INTERRUPTED_BY_USER_MESSAGE,
    InputItemUtils: { createErrorRecoveryInput: (text: string) => [user(text, { isMeta: true })], createAssistantMessage: createRecoveryAssistantMessage, createToolCallResultItem } },
  t5: { ContainerUtil: { get: (key: string) => currentServices[key] }, timeout: async (milliseconds: number) => currentServices.sleep(milliseconds) },
  An: { AgentService: "service" }, A$: { StartupProfiler: "profiler", StartupPhase: { AGENT_LLM_CALL: "llm" } },
  rc: { ModelBehaviorError }, rf: { ToolNames: { AGENT: "Agent" } }, rp: { AgentTaskManager: "tasks" }, rm: { ToolSearchService: "search" }, rl: { HttpStatus: { UNAUTHORIZED_REASON_PHRASE: "Unauthorized" } }, e1: { ...nativeConstants, sanitizeToolNotFoundMessage },
});
const variants: Array<[string, () => any]> = [
  ["network", () => Object.assign(new Error("reset"), { code: "ECONNRESET" })],
  ["network-wrapped", () => Object.assign(new Error("reset"), { code: "ECONNRESET", error: new ModelBehaviorError("wrapped") })],
  ["first", () => new StreamTimeoutError(3000, 0, 0, true)], ["stream", () => new StreamTimeoutError(3000, 2, 40)], ["empty", () => new EmptyStreamError(1, 40)],
  ["syntax", () => new SyntaxError("bad JSON")], ["wrapped-syntax", () => ({ message: "bad wrapped", error: new SyntaxError("bad JSON") })],
  ["deferred", () => new ModelBehaviorError("Tool Read not found in agent Main.")], ["unknown", () => new ModelBehaviorError("Tool Missing not found in agent Main.")],
  ["model", () => new ModelBehaviorError("invalid output")], ["wrapped-model", () => ({ message: "wrapper", error: new ModelBehaviorError("invalid output") })],
  ["auth", () => Object.assign(new Error("bad auth"), { status: 401 })], ["cancel", () => new Error("Request was aborted.")], ["other", () => new Error("503 overloaded")],
];
for (const [label, makeError] of variants) for (const pending of ["none", "Read", "Agent"]) for (const cap of ["none", "network", "model", "stream"]) for (const child of [false, true]) for (const silent of [false, true]) for (const aborted of [false, true]) for (const deferred of [false, true]) {
  async function run(original: boolean) {
    const session = new HarnessSession("fixture"), state = new SessionRunStateMachine(), events: any[] = [];
    session.status = "model_streaming"; if (child) session.meta.parentSessionId = "lead";
    if (aborted) session.abortController.abort();
    session.hookContexts = { continueRequest: { message: "continue" } };
    if (cap === "stream") { session.meta.firstTokenTimeoutRetryCount = 2; session.meta.streamTimeoutRetryCount = 1; }
    if (cap === "network") session.history.push(user(NETWORK_ERROR_RETRY_MARKER));
    if (cap === "model") session.history.push(user(MODEL_ERROR_RETRY_MARKER), user(MODEL_ERROR_RETRY_MARKER));
    let ordinal = 0;
    const append = (input: any[]) => { for (const item of input) { item.parentId = (session.history.at(-1) as any)?.id; item.id = `history-${++ordinal}`; session.history.push(item); } };
    const seed = session.history.splice(0); append(seed);
    const lastAgent = { emit: (_event: string, _context: any, output: string) => { events.push(["end", output]); state.transition(session, { type: "AGENT_ENDED" }); } }, result: any = { currentTurn: 1, silentAbort: silent, state: { _context: { context: session } }, lastAgent, newItems: pending === "none" ? [] : [{ rawItem: { type: "function_call", callId: "pending", name: pending, arguments: "{}" } }, { rawItem: { type: "function_call", callId: "done", name: "Read", arguments: "{}" } }, { rawItem: { type: "function_call_result", callId: "done", output: "ok" } }] };
    session.combineSubject.subscribe((event) => events.push(["combine", event.type])); session.headlessCompletionDeferred = { resolve: () => events.push(["resolve"]) };
    const service: any = { runDefault: async (input: any, options: any) => { events.push(["runDefault", input, { context: options.context.id, bypassMessageQueue: options.bypassMessageQueue }]); append(input); }, run: async (_agent: any, input: any, options: any) => { events.push(["run", input, { context: options.context.id, bypassMessageQueue: options.bypassMessageQueue }]); append(input); } }, stop = async (_session: any, _result: any, options: any) => { events.push(["stop", options]); }, sleep = async (ms: number) => { events.push(["sleep", ms]); };
    session.queue.push(user("queued"));
    currentServices = { service, deferred, profiler: { markStart() {}, markEnd() {} }, tasks: { getTasks: () => [{ id: "task", status: "failed" }] }, search: { describe: (name: string) => name === "Read" ? {} : undefined }, sleep };
    const runtime: any = { service, sleep, executeStopHooks: stop, getTasks: () => currentServices.tasks.getTasks(), describeDeferredTool: (name: string) => currentServices.search.describe(name), isDeferredDispatchEnabled: () => deferred };
    const error = makeError();
    if (original) {
      const owner: any = Object.create(Original.prototype); Object.assign(owner, { logger: quiet, stateMachine: state, waitForSubscriptions: new WeakSet(), parentIdToMainSession: new Map(), childToMainSession: new Map(), sessionHookManager: { executeStopHooks: stop } });
      let callback: any; (session as any).resultSubject = { subscribe: (next: any) => { callback = next; } };
      await owner.waitFor(session); result.completed = Promise.reject(error); await callback(result);
    } else {
      await new InterruptionStreamRecovery(state, runtime).handleError(session, result, error);
      session.resultAbortSignalMap.delete(result); session.headlessCompletionDeferred?.resolve();
    }
    return { events, state: { ...session.runState, lastTransition: session.runState.lastTransition && { ...session.runState.lastTransition, at: "TIME" } }, history: session.history, meta: session.meta, hooks: session.hookContexts, silentAbort: result.silentAbort, calls: result.newItems };
  }
  try { equal(await run(false), await run(true)); } catch (error) { throw new Error(`Recovery mismatch ${label}/${pending}/${cap}/child=${child}/silent=${silent}`, { cause: error }); }
}
for (const text of ["", "hello", '{"isError":true}', '{"error":"bad"}', '{"error":{"message":"bad"}}', '{"error":" "}', "bad JSON", "[1]"]) {
  const start = source.indexOf("static detectStatusFromOutput("), end = source.indexOf("static createToolCallItem", start), native = evaluate(`({${source.slice(start, end).replace(/^static /, "")}})`);
  equal(detectStatusFromOutput(text), native.detectStatusFromOutput(text));
}
console.log(JSON.stringify({ bundleSHA256: hash, comparisons: assertions, passed: true, scope: "native InterruptionService rejected-stream branch, caps/prompt/order/metadata; ErrorUtils retry predicates; not full approval/UI pipeline" }, null, 2));
