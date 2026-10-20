import { WorkflowConcurrencyConstants, type SubagentExecution, type WorkflowSubagentResult } from "./subagent-types.js";
import { WorkflowAbortedError } from "./workflow-errors.js";
export class SubagentAbortBridge {
  private listener: (() => void) | undefined;
  constructor(readonly signal: AbortSignal, execution: Pick<SubagentExecution, "abort">) {
    if (signal.aborted) { execution.abort("aborted-before-bridge"); return; }
    this.listener = () => execution.abort("parent-aborted"); signal.addEventListener("abort", this.listener, { once: true });
  }
  dispose(): void { if (this.listener) { this.signal.removeEventListener("abort", this.listener); this.listener = undefined; } }
}
export class SubagentStallWatchdog {
  disposed = false;
  timer: ReturnType<typeof setTimeout> | undefined;
  constructor(readonly execution: SubagentExecution, readonly stallMs = WorkflowConcurrencyConstants.DEFAULT_STALL_MS, readonly clock = Date.now) { this.scheduleCheck(); }
  dispose(): void { this.disposed = true; if (this.timer) { clearTimeout(this.timer); this.timer = undefined; } }
  scheduleCheck(): void { if (this.disposed) return; const delay = Math.max(5000, Math.floor(this.stallMs / 6)); this.timer = setTimeout(() => this.check(), delay); if (this.timer && typeof this.timer.unref === "function") this.timer.unref(); }
  check(): void { if (this.disposed) return; const elapsed = this.clock() - this.execution.lastActivityAt; if (elapsed >= this.stallMs) { this.execution.abort(`stalled-${elapsed}ms`); this.disposed = true; return; } this.scheduleCheck(); }
}
export const THROTTLE_BACKOFF_MS = 45000;
const THROTTLED = /(rate.?limit|throttl|429|too\s+many\s+requests)/i;
export class SubagentThrottleRetry {
  constructor(readonly stallMs = WorkflowConcurrencyConstants.DEFAULT_STALL_MS, readonly sleep = defaultSleep) {}
  async run(operation: (options: { abortSignal: AbortSignal; stallMs: number }) => Promise<WorkflowSubagentResult>, signal: AbortSignal): Promise<WorkflowSubagentResult> {
    const first = await this.tryOnce(operation, signal);
    if (!this.looksThrottled(first.result, first.error)) { if (first.error) throw first.error; return first.result!; }
    await this.sleep(THROTTLE_BACKOFF_MS, signal);
    if (signal.aborted) throw new WorkflowAbortedError("aborted-during-throttle-backoff");
    const second = await this.tryOnce(operation, signal); if (second.error) throw second.error;
    return { ...second.result!, throttleRetried: true };
  }
  async tryOnce(operation: (options: { abortSignal: AbortSignal; stallMs: number }) => Promise<WorkflowSubagentResult>, signal: AbortSignal): Promise<{ result?: WorkflowSubagentResult; error?: unknown }> { try { return { result: await operation({ abortSignal: signal, stallMs: this.stallMs }) }; } catch (error) { return { error }; } }
  looksThrottled(result?: WorkflowSubagentResult, error?: unknown): boolean {
    const text = result?.text ?? "", message = error instanceof Error ? error.message : "";
    if (!(THROTTLED.test(text) || THROTTLED.test(message))) return false;
    if (result) return result.stopReason == null && result.structured === undefined && (result.tokens ?? 0) < 50 && (result.durationMs ?? 0) > 0.5 * this.stallMs;
    return true;
  }
}
export function defaultSleep(milliseconds: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { resolve(); return; }
    const timer = setTimeout(() => { signal.removeEventListener("abort", onAbort); resolve(); }, milliseconds); if (typeof timer.unref === "function") timer.unref();
    const onAbort = () => { clearTimeout(timer); reject(new WorkflowAbortedError("sleep-aborted")); }; signal.addEventListener("abort", onAbort, { once: true });
  });
}
