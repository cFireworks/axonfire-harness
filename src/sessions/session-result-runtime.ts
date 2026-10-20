import type { HarnessSession } from "./session.js";
import { createResponseErrorUtils } from "../models/response-error-utils.js";
import { AbortedStreamDraftStore } from "./aborted-stream-draft-store.js";
import {
  createAbortableIteratorFactory,
  type AbortableIteratorRuntime,
} from "./abortable-iterator.js";
import { createContentFilterInputUtils } from "./content-filter-input-utils.js";
export type ModelResponseMetadata = Record<string, any>;
export const ModelResponseInterceptor = Symbol("ModelResponseInterceptor");
export interface ModelResponseInterceptor {
  intercept(context: {
    session: HarnessSession;
    result: any;
    modelResponseMetadata: ModelResponseMetadata;
  }): boolean | void | Promise<boolean | void>;
}
export type SessionResultRuntime = AbortableIteratorRuntime & {
  now(): number;
  createDraftStore(): AbortedStreamDraftStore;
  createAbortableIterator: ReturnType<
    typeof createAbortableIteratorFactory
  >["createAbortableIterator"];
  inputItemUtils: ReturnType<typeof createContentFilterInputUtils>;
  subscribe(session: any, callback: (result: any) => Promise<void>): any;
  onHandlingError(session: any, result: any, error: any): void;
  mapMessageErrorCode(error: any): string;
};
export type SessionLifecycleOptions = {
  env?: NodeJS.ProcessEnv;
  timers?: Partial<
    Pick<SessionResultRuntime, "setTimeout" | "clearTimeout" | "now">
  >;
  interceptors?: ModelResponseInterceptor[];
  logger?: {
    info(...args: any[]): void;
    debug(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
  };
  onNotification?(
    session: HarnessSession,
    message: string,
    notificationType: string,
  ): void | Promise<void>;
  onSessionStart?(
    session: HarnessSession,
    reason: string,
  ): void | Promise<void>;
  getInterruptionService?():
    | { waitFor(session: HarnessSession): Promise<void> }
    | undefined;
  telemetryService?: Record<string, any>;
  galileoSessionBridge?: Record<string, any>;
  /** Optional production telemetry mapping; no guessed business-code mapping. */
  mapMessageErrorCode?(error: any): string;
};
export function createSessionResultRuntime(
  options: SessionLifecycleOptions = {},
  observe?: (session: any, callback: (result: any) => Promise<void>) => any,
  onHandlingError: (session: any, result: any, error: any) => void = () => {},
): SessionResultRuntime {
  const io = {
    env: options.env ?? process.env,
    setTimeout,
    clearTimeout,
    now: Date.now,
    ...options.timers,
  };
  const iterator = createAbortableIteratorFactory(io);
  return {
    ...io,
    createDraftStore: () => new AbortedStreamDraftStore(),
    createAbortableIterator: iterator.createAbortableIterator,
    inputItemUtils: createContentFilterInputUtils(),
    subscribe:
      observe ??
      ((session, callback) => session.resultSubject.subscribe(callback)),
    onHandlingError,
    mapMessageErrorCode:
      options.mapMessageErrorCode ??
      createResponseErrorUtils().mapMessageErrorCode,
  };
}
/** Explicit offline host adapters, not recovered production telemetry transports. */
export function createSessionResultObservers(
  options: SessionLifecycleOptions = {},
) {
  const telemetryService = options.telemetryService ?? {
    async reportChatRequestResponseTelemetry() {},
    reportChatMessageStatus() {},
    reportMessageResponseTelemetryStream() {},
    recordCreditRefundConversationRequestEnd() {},
    suppressCreditRefundConversationRequest() {},
    async reportUserTaskFailedCreditRefund() {},
    reportChatMaxTokenReached() {},
  };
  const galileoSessionBridge =
    options.galileoSessionBridge ??
    Object.fromEntries(
      [
        "emitRequestStart",
        "emitMessageStart",
        "emitRequestSuccess",
        "addRequestSuccessSpanEvent",
        "emitRequestError",
        "addRequestErrorSpanEvent",
        "emitMessageError",
        "addMessageErrorSpanEvent",
        "emitMessageSuccess",
        "addMessageSuccessSpanEvent",
      ].map((name) => [name, () => {}]),
    );
  return { telemetryService, galileoSessionBridge };
}
