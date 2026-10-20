import vm from "node:vm";
import { WorkflowConcurrencyConstants as Constants } from "./subagent-types.js";
import { WorkflowAbortedError } from "./workflow-errors.js";
import type { WorkflowExecution } from "./workflow-execution.js";
import type { WorkflowRunRequest } from "./workflow-types.js";
import { WorkflowRuntimePrelude } from "./workflow-runtime-prelude.js";
export function toJsonSafe(value: unknown): any { if (value !== undefined) try { return JSON.parse(JSON.stringify(value)); } catch { return String(value); } }
export function isPromiseLike(value: any): boolean { return !!value && typeof value.then === "function"; }
export class WorkflowAbortRacer {
  constructor(readonly abortSignal: AbortSignal) {}
  async race<T>(value: T | PromiseLike<T>): Promise<T> { let cleanup: (() => void) | undefined; if (!isPromiseLike(value)) return value; const aborted = new Promise<never>((_resolve, reject) => { const onAbort = () => reject(new WorkflowAbortedError("user-abort")); if (this.abortSignal.aborted) onAbort(); else { this.abortSignal.addEventListener("abort", onAbort, { once: true }); cleanup = () => this.abortSignal.removeEventListener("abort", onAbort); } }); try { return await Promise.race([value, aborted]); } finally { cleanup?.(); } }
}
/** Native abort timers flush callbacks immediately, swallow callback errors,
 * return numeric IDs, unref handles, and clamp delays to 60s. */
export class WorkflowAbortAwareTimer {
  readonly pending = new Map<number, { handle: ReturnType<typeof setTimeout>; cb: () => void }>();
  private nextId = 1;
  private disposed = false;
  private readonly abortListener: () => void;
  readonly setTimeoutFn = (callback: () => void, delay?: number): number => {
    if (typeof callback !== "function") throw new TypeError("setTimeout callback must be a function");
    const timeout = Math.max(0, Math.min(delay ?? 0, 60000));
    if (this.abortSignal.aborted || this.disposed) { queueMicrotask(() => { try { callback(); } catch {} }); return -1; }
    const id = this.nextId++, handle = setTimeout(() => { this.pending.delete(id); try { callback(); } catch {} }, timeout); if (typeof handle.unref === "function") handle.unref(); this.pending.set(id, { handle, cb: callback }); return id;
  };
  readonly clearTimeoutFn = (id: number): void => { const pending = this.pending.get(id); if (pending) { clearTimeout(pending.handle); this.pending.delete(id); } };
  constructor(readonly abortSignal: AbortSignal) { this.abortListener = () => this.flushAllOnAbort(); if (!abortSignal.aborted) abortSignal.addEventListener("abort", this.abortListener, { once: true }); }
  dispose(): void { if (this.disposed) return; this.disposed = true; this.abortSignal.removeEventListener("abort", this.abortListener); for (const timer of this.pending.values()) clearTimeout(timer.handle); this.pending.clear(); }
  flushAllOnAbort(): void { const timers = [...this.pending.values()]; this.pending.clear(); for (const timer of timers) { clearTimeout(timer.handle); try { timer.cb(); } catch {} } }
}
/** Native VM composition, NOT a security isolation boundary. Host constructors
 * are intentionally exposed as in the sample; only use trusted workflows. */
export class WorkflowSandboxBuilder {
  constructor(readonly prelude = new WorkflowRuntimePrelude()) {}
  build(request: WorkflowRunRequest, execution: WorkflowExecution): { context: vm.Context; dispose(): void } { const timers = new WorkflowAbortAwareTimer(request.abortController.signal), globals = this.composeGlobals(request, execution, timers), context = vm.createContext(globals, { name: `workflow-${request.runId}`, codeGeneration: { strings: false, wasm: false } }); new vm.Script(this.prelude.build(0), { filename: "<workflow-prelude>" }).runInContext(context, { timeout: Constants.SCRIPT_SYNC_TIMEOUT_MS }); return { context, dispose: () => timers.dispose() }; }
  composeGlobals(request: WorkflowRunRequest, execution: WorkflowExecution, timers: WorkflowAbortAwareTimer): Record<string, unknown> { const console = { log: execution.hooks.log, warn: execution.hooks.log, error: execution.hooks.log, info: execution.hooks.log, debug: execution.hooks.log }; return { agent: execution.hooks.agent, parallel: execution.hooks.parallel, pipeline: execution.hooks.pipeline, phase: execution.hooks.phase, log: execution.hooks.log, workflow: execution.hooks.workflow, args: this.toJsonSafe(request.args), console, setTimeout: timers.setTimeoutFn, clearTimeout: timers.clearTimeoutFn, Promise, Symbol, Map, Set, JSON, RegExp, Number, Boolean, String, Array, Object, Error }; }
  toJsonSafe(value: unknown): any { return toJsonSafe(value); }
}
