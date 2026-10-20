import { createNativeInterruptionResultDispatcher } from "../../src/permissions/native-interruption-result-dispatcher.js";
import { createResponseInputUtils } from "../../src/sessions/response-input-utils.js";
import { createToolCallResultItem } from "../../src/tools/tool-rejection.js";
import { HarnessSession } from "../../src/sessions/session.js";
import { SessionRunStateMachine } from "../../src/sessions/run-state-machine.js";
import { ModelErrorUtils } from "../../src/models/model-error-utils.js";
export type DispatchCase = {
  agent?: "default" | "other" | "missing";
  child?: boolean;
  aborted?: boolean;
  error?: any;
  silent?: boolean;
  interruptions?: boolean;
  continuation?: boolean;
  stopActive?: boolean;
  stopThrows?: boolean;
  deferred?: boolean;
  pending?: boolean;
  final?: boolean;
  status?: string;
  retryCap?: boolean;
};
export function interruptionResultFixture(
  spec: DispatchCase = {},
  construct = createNativeInterruptionResultDispatcher,
) {
  const events: any[] = [],
    callbacks: Array<(result: any) => Promise<void>> = [],
    immediate: Array<() => any> = [],
    timers = new Map<any, () => void>();
  const session = new HarnessSession("dispatch-owned"),
    machine = new SessionRunStateMachine();
  session.status = (spec.status ?? "model_done") as any;
  if (spec.child) session.meta.parentSessionId = "dispatch-parent";
  if (spec.aborted) session.abortController.abort();
  if (spec.stopActive) session.hookContexts = { stopHookActive: true };
  if (spec.retryCap) {
    session.meta.streamTimeoutRetryCount = 1;
    session.meta.firstTokenTimeoutRetryCount = 2;
  }
  const agent: any = {
    name: spec.agent === "other" ? "Other" : "Default",
    emit(name: string, _ctx: any, output: string) {
      events.push(["emit", name, output]);
      machine.transition(session, { type: "AGENT_ENDED" });
    },
  };
  const result: any = {
    currentTurn: 1,
    completed: spec.error ? Promise.reject(spec.error) : Promise.resolve(),
    state: {
      _context: { context: session },
      _currentStep: {
        type:
          spec.final === false
            ? "next_step_run_again"
            : "next_step_final_output",
        output: "final output",
      },
    },
    newItems: spec.pending
      ? [
          {
            rawItem: {
              type: "function_call",
              name: "Read",
              callId: "owned-call",
              arguments: "{}",
            },
          },
        ]
      : [],
    interruptions: spec.interruptions
      ? [
          {
            rawItem: {
              type: "function_call",
              name: "Read",
              callId: "approval-call",
              arguments: "{}",
            },
          },
        ]
      : [],
    silentAbort: spec.silent === true,
    ...(spec.agent === "missing" ? {} : { lastAgent: agent }),
  };
  void result.completed.catch(() => {});
  session.resultAbortSignalMap.set(result, session.abortSignal);
  session.headlessCompletionDeferred = {
    resolve() {
      events.push(["headless"]);
    },
  };
  session.combineSubject.subscribe((event) =>
    events.push(["combine", event.type, event.hasInterruptions]),
  );
  const logger = Object.fromEntries(
    ["debug", "info", "warn", "error"].map((name) => [
      name,
      (...args: any[]) =>
        events.push([
          "log",
          name,
          ...args.map((value) =>
            value instanceof Error
              ? { name: value.name, message: value.message }
              : value,
          ),
        ]),
    ]),
  );
  const inputUtils = Object.assign(
    createResponseInputUtils(() => "fixture-message"),
    { createToolCallResultItem },
  );
  const service = {
    async runDefault(input: any[], options: any) {
      events.push([
        "runDefault",
        input,
        options.context.id,
        options.bypassMessageQueue,
      ]);
      session.history.push(...input);
    },
    async run(_agent: any, input: any[], options: any) {
      events.push([
        "run",
        _agent?.name,
        input,
        options.context.id,
        options.bypassMessageQueue,
      ]);
      session.history.push(...input);
    },
  };
  const runtime: any = {
    service,
    getDefaultAgent: async () => ({ name: "Default" }),
    stateMachine: machine,
    getTasks: () => [],
    describeDeferredTool: () => undefined,
    isDeferredDispatchEnabled: () => spec.deferred !== false,
    sleep: async (ms: number) => {
      events.push(["sleep", ms]);
    },
    now: () => 7,
    setImmediate: (callback: () => any) => {
      immediate.push(callback);
      return immediate.length;
    },
    setTimeout: (callback: () => void, ms: number) => {
      const id = {};
      timers.set(id, callback);
      events.push(["timer", ms]);
      return id;
    },
    clearTimeout: (id: any) => {
      timers.delete(id);
      events.push(["clearTimer"]);
    },
    subscribe: (_session: any, callback: any) => {
      callbacks.push(callback);
      return { unsubscribe() {} };
    },
    inputItemUtils: inputUtils,
    errorUtils: ModelErrorUtils,
    profiler: {
      markStart(...args: any[]) {
        events.push(["profileStart", ...args]);
      },
      markEnd(...args: any[]) {
        events.push(["profileEnd", ...args]);
      },
    },
  };
  const dependencies = {
    logger,
    stateMachine: machine,
    waitForSubscriptions: new WeakSet(),
    parentIdToMainSession: new Map(),
    childToMainSession: new Map(),
    sessionHookManager: {
      async executeStopHooks(_session: any, _result: any, options: any) {
        events.push(["stop", options]);
        if (spec.stopThrows && !options?.stopReason?.match(/failed|cancelled/))
          throw new Error("owned Stop failure");
        if (spec.continuation) {
          session.hookContexts ??= {};
          session.hookContexts.continueRequest = {
            message: {
              type: "message",
              role: "user",
              content: "continue owned",
            },
          };
        }
      },
    },
    async handleInterruptions(_session: any, items: any[]) {
      events.push(["interruptions", items.length]);
    },
  };
  const owner = construct(runtime, dependencies);
  async function execute() {
    await owner.waitFor(session);
    await owner.waitFor(session);
    if (callbacks.length !== 1) throw Error("Subscription must be idempotent");
    await callbacks[0]!(result);
    for (const callback of immediate.splice(0)) {
      const task = callback();
      if (!machine.isIdle(session))
        machine.forceIdle(session, "owned continuation fixture");
      await task;
    }
    return {
      events,
      history: session.history,
      meta: session.meta,
      hooks: session.hookContexts,
      silent: result.silentAbort,
      stamped: result._hasInterruptions,
      state: session.status,
      resultSignalReleased: !session.resultAbortSignalMap.has(result),
    };
  }
  return {
    owner,
    session,
    machine,
    result,
    events,
    runtime,
    callbacks,
    timers,
    immediate,
    execute,
  };
}
