import { BehaviorSubject } from "rxjs";

export type QuestionAnswers = Record<string, string>;
export type AskItem = { rawItem: { type?: string | undefined; callId?: string | undefined; id?: string | undefined; arguments?: string | undefined; name?: string | undefined } };
export class AnswerDeferred<T> {
  readonly promise: Promise<T | undefined>;
  resolve!: (value?: T) => void;
  reject!: (reason: unknown) => void;
  constructor() { this.promise = new Promise((resolve, reject) => { this.resolve = resolve; this.reject = reject; }); }
}
function callId(item?: AskItem): string | undefined { return item && (item.rawItem.type === "function_call" && item.rawItem.callId || item.rawItem.id); }
export type AskWaitSpan = { markAsSuccessful(): void; markAsFailed(reason?: unknown): void; setAttributes(values: Record<string, unknown>): void };
/** module 40348: answers may arrive before the SDK's approved tool execution. */
export class AskService {
  readonly currentItem$ = new BehaviorSubject<AskItem | undefined>(undefined);
  private currentItem: AskItem | undefined;
  private currentDeferred: AnswerDeferred<QuestionAnswers> | undefined;
  private readonly earlyAnswers = new Map<string, QuestionAnswers>();
  private readonly waitingDeferreds = new Map<string, AnswerDeferred<QuestionAnswers>>();
  private readonly waitSpans = new Map<string, AskWaitSpan>();
  startWaitSpan(id: string, trace: { startSpan(name: string): AskWaitSpan } | undefined, questionCount: number, toolName?: string): void {
    if (!id || !trace) return;
    this.waitSpans.get(id)?.markAsSuccessful();
    const span = trace.startSpan("codebuddy_code.user_input_wait");
    span.setAttributes({ "span.type": "user_input_wait", tool_name: toolName || "AskUserQuestion", "tool.call_id": id, "question.count": questionCount, wait_type: questionCount > 0 ? "question" : "approval" });
    this.waitSpans.set(id, span);
  }
  endWaitSpanExternal(id: string, successful: boolean, reason?: unknown): void { this.endWaitSpan(id, successful, reason); }
  private endWaitSpan(id: string | undefined, successful: boolean, reason?: unknown): void {
    if (!id) return;
    const span = this.waitSpans.get(id);
    if (!span) return;
    this.waitSpans.delete(id);
    if (successful) span.markAsSuccessful(); else span.markAsFailed(reason);
  }
  flushPendingWaitSpans(reason: string): void { for (const id of this.waitSpans.keys()) this.endWaitSpan(id, false, new Error(reason)); }
  setAsk(item: AskItem): void {
    const nextId = callId(item), previousId = callId(this.currentItem);
    if (this.currentItem && this.currentItem.rawItem.id === item.rawItem.id) return;
    if (previousId && previousId !== nextId && this.waitSpans.has(previousId)) this.endWaitSpan(previousId, false, new Error("Superseded by new ask"));
    this.currentDeferred?.resolve();
    this.cleanup();
    this.currentDeferred = new AnswerDeferred();
    this.currentItem = item;
    if (nextId && this.earlyAnswers.has(nextId)) {
      const answers = this.earlyAnswers.get(nextId)!;
      this.earlyAnswers.delete(nextId);
      this.currentDeferred.resolve(answers);
      const waiter = this.waitingDeferreds.get(nextId);
      if (waiter) { this.waitingDeferreds.delete(nextId); waiter.resolve(answers); }
    }
    this.currentItem$.next(item);
  }
  doneAsk(answers: QuestionAnswers, targetId?: string): void {
    const currentId = callId(this.currentItem), id = targetId || currentId;
    this.endWaitSpan(id, true);
    if (this.currentDeferred && (!targetId || targetId === currentId)) {
      this.currentDeferred.resolve(answers);
      if (id && id === currentId && this.currentItem$.value === this.currentItem) this.currentItem$.next(undefined);
    }
    if (!id) {
      if (this.waitingDeferreds.size === 1) {
        const [singleId, waiter] = this.waitingDeferreds.entries().next().value!;
        this.waitingDeferreds.delete(singleId); waiter.resolve(answers);
      }
      return;
    }
    const waiter = this.waitingDeferreds.get(id);
    if (waiter) { this.waitingDeferreds.delete(id); waiter.resolve(answers); }
    else this.earlyAnswers.set(id, answers);
  }
  rejectAsk(targetId?: string): void {
    const currentId = callId(this.currentItem), id = targetId || currentId;
    this.endWaitSpan(id, false, new Error("User declined to answer questions"));
    if (this.currentDeferred && (!targetId || targetId === currentId)) {
      this.currentDeferred.resolve();
      if (id && id === currentId && this.currentItem$.value === this.currentItem) this.currentItem$.next(undefined);
    }
    if (!id) return;
    const waiter = this.waitingDeferreds.get(id);
    if (waiter) { this.waitingDeferreds.delete(id); waiter.reject(new Error("User declined to answer questions")); }
  }
  acquireAnswers(id: string, signal?: AbortSignal, timeoutMs = 600_000): Promise<QuestionAnswers | undefined> {
    if (!id) return Promise.reject(new Error("acquireAnswers requires toolCallId"));
    const early = this.earlyAnswers.get(id);
    if (early) { this.earlyAnswers.delete(id); return Promise.resolve(early); }
    this.waitingDeferreds.get(id)?.reject(new Error("Superseded by new acquireAnswers"));
    const deferred = new AnswerDeferred<QuestionAnswers>();
    this.waitingDeferreds.set(id, deferred);
    let timer: NodeJS.Timeout | undefined;
    if (timeoutMs > 0 && Number.isFinite(timeoutMs)) {
      timer = setTimeout(() => { if (this.waitingDeferreds.get(id) === deferred) { this.waitingDeferreds.delete(id); deferred.reject(new Error("AskUserQuestion timed out: no answer received")); } }, timeoutMs);
      timer.unref();
    }
    if (signal) {
      if (signal.aborted) { this.waitingDeferreds.delete(id); if (timer) clearTimeout(timer); return Promise.reject(new Error("Aborted")); }
      const abort = () => { if (this.waitingDeferreds.get(id) === deferred) { this.waitingDeferreds.delete(id); deferred.reject(new Error("Aborted")); } };
      signal.addEventListener("abort", abort, { once: true });
      void deferred.promise.finally(() => signal.removeEventListener("abort", abort)).catch(() => undefined);
    }
    void deferred.promise.finally(() => { if (timer) clearTimeout(timer); }).catch(() => undefined);
    return deferred.promise;
  }
  getCurrentAskItem(): AskItem | undefined { return this.currentItem; }
  getCurrentDeferred(): AnswerDeferred<QuestionAnswers> | undefined { return this.currentDeferred; }
  getRoutingState(): { earlyAnswerKeys: string[]; waitingDeferredKeys: string[]; currentItemId: string | undefined } {
    return { earlyAnswerKeys: [...this.earlyAnswers.keys()], waitingDeferredKeys: [...this.waitingDeferreds.keys()], currentItemId: callId(this.currentItem) };
  }
  cleanup(): void { this.currentDeferred = undefined; this.currentItem = undefined; }
}
