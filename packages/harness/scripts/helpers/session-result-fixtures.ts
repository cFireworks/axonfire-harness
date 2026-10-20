import { HarnessSession } from "../../src/sessions/session.js";
import { SessionResultLifecycle } from "../../src/sessions/session-result-lifecycle.js";
import {
  createSessionResultRuntime,
  createSessionResultObservers,
} from "../../src/sessions/session-result-runtime.js";
import { AbortedStreamDraftStore } from "../../src/sessions/aborted-stream-draft-store.js";
import { createContentFilterInputUtils } from "../../src/sessions/content-filter-input-utils.js";

export const turn = async () => {
  for (let i = 0; i < 20; i++) await Promise.resolve();
};
export const clone = (value: any): any => structuredClone(value);
export const user = (id: string, providerData: any = {}): any => ({
  id,
  type: "message",
  role: "user",
  content: [{ type: "input_text", text: "owned question" }],
  providerData,
});
export const assistant = (id: string, text = "owned answer"): any => ({
  id,
  type: "message",
  role: "assistant",
  status: "completed",
  content: [{ type: "output_text", text }],
});
export const raw = (event: any): any => ({
  type: "raw_model_stream_event",
  data: { type: "model", event },
});
export const delta = (text: string): any => ({
  type: "raw_model_stream_event",
  data: { type: "output_text_delta", delta: text },
});
export const item = (value: any, type = "message_output_item"): any => ({
  type: "run_item_stream_event",
  item: { type, rawItem: value },
});
export const done = (output: any[], usage?: any): any => ({
  type: "raw_model_stream_event",
  data: {
    type: "response_done",
    response: { id: "provider-id", output, usage },
  },
});
export function manualTimers() {
  let sequence = 0;
  const pending = new Map<number, any>(),
    calls: any[] = [];
  return {
    pending,
    calls,
    setTimeout(callback: () => any, ms: number) {
      const timer = {
        id: ++sequence,
        callback,
        ms,
        unref() {
          calls.push(["unref", this.id]);
        },
      };
      pending.set(timer.id, timer);
      calls.push(["set", timer.id, ms]);
      return timer;
    },
    clearTimeout(timer: any) {
      pending.delete(timer.id);
      calls.push(["clear", timer.id]);
    },
    async fire() {
      const timer = pending.values().next().value;
      if (!timer) throw Error("no pending timer");
      pending.delete(timer.id);
      return await timer.callback();
    },
  };
}
/** Owned, deterministic adapters; neither application entry point nor external I/O is executed. */
export function resultFixture(
  Factory: any = SessionResultLifecycle,
  options: any = {},
) {
  const events: any[] = [],
    logs: any[] = [],
    callbacks: Array<(result: any) => Promise<void>> = [],
    timers = manualTimers();
  let uuid = 0;
  const nextId = () => `owned-${++uuid}`,
    runtime = createSessionResultRuntime(
      {
        env: {},
        timers: { ...timers, now: () => 1234 },
        mapMessageErrorCode: () => "owned-error-code",
      },
      (_s, callback) => {
        const index = callbacks.push(callback) - 1;
        return { unsubscribe: () => events.push(["unsubscribe", index]) };
      },
      (_s, _r, e) => events.push(["handling-error", e.message]),
    );
  runtime.createDraftStore = () => new AbortedStreamDraftStore(nextId);
  runtime.inputItemUtils = createContentFilterInputUtils(nextId);
  const s = new HarnessSession("owned-session", {
    options: { model: "requested-model" },
  });
  s.resultSubject.subscribe = ((callback: any) =>
    runtime.subscribe(s, callback)) as any;
  s.messageId = "message-id";
  s.traceId = "trace";
  s.conversationRequestId = "conversation";
  s.telemetry = {
    modelId: "telemetry-model",
    modelName: "telemetry-name",
    currentTurn: 2,
    traceId: "request-trace",
  } as any;
  s.history = [user("user-id")];
  s.lastUserMessageId = "user-id";
  s.modelSubject.subscribe((v) => events.push(["model", clone(v)]));
  s.combineSubject.subscribe((v) => events.push(["combine", clone(v)]));
  s.historyReloadSubject.subscribe((v) => events.push(["reload", clone(v)]));
  const observers = createSessionResultObservers();
  for (const [group, object] of Object.entries(observers))
    for (const name of Object.keys(object))
      object[name] = (...args: any[]) => {
        // Snapshot metadata at the observer boundary; never retain the mutable session/result.
        events.push([
          group,
          name,
          args
            .slice(2)
            .map((a) =>
              a instanceof Error ? { message: a.message } : clone(a),
            ),
        ]);
      };
  let idle = true;
  const dependencies: any = {
    ...observers,
    logger: Object.fromEntries(
      ["info", "debug", "warn", "error"].map((name) => [
        name,
        (...args: any[]) =>
          logs.push([
            name,
            ...args.map((a) => (a instanceof Error ? a.message : a)),
          ]),
      ]),
    ),
    stateMachine: {
      isIdle: () => idle,
      transition: (_s: any, event: any) =>
        events.push(["transition", clone(event)]),
    },
    interruptionService: { waitFor: () => events.push(["wait-interruptions"]) },
    sessionHookManager: {
      executeNotificationHooks: async (_s: any, ...args: any[]) =>
        events.push(["notification", ...args]),
      executeSessionStartHooks: async (_s: any, reason: any) =>
        events.push(["session-start", reason]),
    },
    interceptors: [],
    addHistory: async (_s: any, values: any[]) => {
      s.history.push(...values);
      events.push(["history", clone(values)]);
    },
    flushHistory: async () => events.push(["flush"]),
    stampModelHistoryItemTimestamp: (v: any) => (v.timestamp ??= 1234),
    stampModelStreamEventTimestamp: (v: any) => (v.timestamp ??= 1234),
    formatCreditForLog: (v: any) => JSON.stringify(v),
    ...options,
  };
  const lifecycle = new Factory(runtime, dependencies);
  return {
    s,
    lifecycle,
    runtime,
    events,
    logs,
    timers,
    callbacks,
    dependencies,
    setIdle(value: boolean) {
      idle = value;
    },
  };
}
export function streamResult(
  events: any[],
  s: HarnessSession,
  options: any = {},
) {
  return {
    currentTurn: 1,
    state: { _context: { owned: true } },
    completed: Promise.resolve(),
    rawResponses: [],
    lastAgent: { emit: (...args: any[]) => options.emissions?.push(args) },
    async *[Symbol.asyncIterator]() {
      for (const value of events) {
        if (typeof value === "function") await value(s);
        else yield value;
      }
    },
    ...options,
  };
}
