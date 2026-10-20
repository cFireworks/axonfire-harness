import { BehaviorSubject } from "rxjs";
import * as path from "node:path";
import { createNativeInteractionServices } from "./native-interaction-services.js";

export type QuestionAnswers = Record<string, string>;
export type AskItem = {
  rawItem: {
    type?: string | undefined;
    callId?: string | undefined;
    id?: string | undefined;
    arguments?: string | undefined;
    name?: string | undefined;
  };
};
export type AskWaitSpan = {
  markAsSuccessful(): void;
  markAsFailed(reason?: unknown): void;
  setAttributes(values: Record<string, unknown>): void;
};
const native = createNativeInteractionServices({
  modules: { 16928: path, 29827: { BehaviorSubject } },
});
/** Compatibility types only; construction and settlement are the original Deferred. */
export interface AnswerDeferred<T> {
  readonly promise: Promise<T | undefined>;
  resolve(value?: T): void;
  reject(reason: unknown): void;
}
export const AnswerDeferred = native.getModule(8461).Deferred as {
  new <T>(): AnswerDeferred<T>;
};
export interface AskService {
  readonly currentItem$: BehaviorSubject<AskItem | undefined>;
  startWaitSpan(
    id: string,
    trace: { startSpan(name: string): AskWaitSpan } | undefined,
    questionCount: number,
    toolName?: string,
  ): void;
  endWaitSpanExternal(id: string, successful: boolean, reason?: unknown): void;
  flushPendingWaitSpans(reason: string): void;
  setAsk(item: AskItem): void;
  doneAsk(answers: QuestionAnswers, targetId?: string): void;
  rejectAsk(targetId?: string): void;
  acquireAnswers(
    id: string,
    signal?: AbortSignal,
    timeoutMs?: number,
  ): Promise<QuestionAnswers | undefined>;
  getCurrentAskItem(): AskItem | undefined;
  getCurrentDeferred(): AnswerDeferred<QuestionAnswers> | undefined;
  getRoutingState(): {
    earlyAnswerKeys: string[];
    waitingDeferredKeys: string[];
    currentItemId: string | undefined;
  };
  cleanup(): void;
}
/** Public constructor compatibility; all 14 original members are inherited unchanged. */
export class AskService extends native.AskServiceImpl {
  constructor(logger: any = { setContext() {}, info() {}, warn() {} }) {
    super();
    this.logger = logger;
    this.init();
  }
}
