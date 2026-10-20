// Complete native InterruptionService result dispatcher methods. UTF-16 11047102..11089570.
// The only method-body bridge is subscription ownership; globals/container are explicit DI.
import { ModelBehaviorError } from "@openai/agents-core";
import { RunResultUtils } from "../agents/run-result-utils.js";
import {
  ModelErrorUtils,
  InterruptedByUserError,
  INTERRUPTED_BY_USER_MESSAGE,
} from "../models/model-error-utils.js";
import { createResponseInputUtils } from "../sessions/response-input-utils.js";
import { getActiveAgentOnlyHistory } from "../sessions/history-utils.js";
import { createToolCallResultItem } from "../tools/tool-rejection.js";
import {
  SessionRunEventType,
  SessionRunStatus,
} from "../sessions/run-state-types.js";
import {
  MODEL_ERROR_RETRY_MARKER,
  MODEL_ERROR_RETRY_CHECK_WINDOW,
  MODEL_ERROR_MAX_RETRIES,
  NETWORK_ERROR_RETRY_MARKER,
  NETWORK_ERROR_RETRY_CHECK_WINDOW,
} from "./interruption-stream-recovery.js";
export type NativeInterruptionResultRuntime = {
  service: any;
  getDefaultAgent(): Promise<any>;
  stateMachine: any;
  getTasks(): any[];
  describeDeferredTool(name: string): any;
  isDeferredDispatchEnabled(): boolean;
  sleep(ms: number): Promise<void>;
  now(): number;
  setImmediate(callback: () => any): any;
  setTimeout(callback: () => void, ms: number): any;
  clearTimeout(timer: any): void;
  subscribe(session: any, callback: (result: any) => Promise<void>): any;
  inputItemUtils?: any;
  errorUtils?: any;
  profiler?: any;
};
export class AgentTimeoutError extends Error {
  constructor(message = "Timeout waiting for agent_end state") {
    super(message);
    this.name = "AgentTimeoutError";
  }
}
export function createNativeInterruptionResultDispatcher(
  runtime: NativeInterruptionResultRuntime,
  dependencies: Record<string, any>,
) {
  const Date = { now: () => runtime.now() },
    setImmediate = (callback: () => any) => runtime.setImmediate(callback),
    setTimeout = (callback: () => void, ms: number) =>
      runtime.setTimeout(callback, ms),
    clearTimeout = (timer: any) => runtime.clearTimeout(timer);
  const service = runtime.service,
    profiler = runtime.profiler ?? { markStart() {}, markEnd() {} },
    AB = {
      RunResultUtils,
      ErrorUtils: runtime.errorUtils ?? ModelErrorUtils,
      HistoryUtils: { getActiveAgentOnlyHistory },
      QueueDispatchUtils: {
        isDeferredDispatchEnabledSync: () =>
          runtime.isDeferredDispatchEnabled(),
      },
      INTERRUPTED_BY_USER_MESSAGE,
      InputItemUtils:
        runtime.inputItemUtils ??
        Object.assign(createResponseInputUtils(), { createToolCallResultItem }),
    },
    t4 = {
      SessionRunEventType,
      SessionRunStatus,
      SessionRunStateMachine: "state",
    },
    An = { AgentService: "service", AgentManager: "agents" },
    A$ = {
      StartupProfiler: "profiler",
      StartupPhase: { AGENT_LLM_CALL: "llm" },
    },
    rc = { ModelBehaviorError },
    rf = { ToolNames: { AGENT: "Agent" } },
    rp = { AgentTaskManager: "tasks" },
    rm = { ToolSearchService: "search" },
    rl = { HttpStatus: { UNAUTHORIZED_REASON_PHRASE: "Unauthorized" } },
    services: Record<string, any> = {
      service,
      agents: { getDefault: () => runtime.getDefaultAgent() },
      state: runtime.stateMachine,
      profiler,
      tasks: { getTasks: () => runtime.getTasks() },
      search: {
        describe: (name: string) => runtime.describeDeferredTool(name),
      },
    },
    t5 = {
      ContainerUtil: { get: (name: string) => services[name] },
      timeout: (ms: number) => runtime.sleep(ms),
    };
  class NativeInterruptionResultDispatcher {
    [key: string]: any;
    constructor(dependencies: Record<string, any>) {
      Object.assign(this, dependencies);
    }
    get startupProfiler(): any {
      try {
        return t5.ContainerUtil.get(A$.StartupProfiler);
      } catch {
        return;
      }
    }
    async waitFor(eA: any): Promise<any> {
      if (!this.waitForSubscriptions.has(eA)) {
        if ((this.waitForSubscriptions.add(eA), eA.meta?.parentSessionId)) {
          let el: any = this.parentIdToMainSession.get(eA.meta.parentSessionId);
          (el && this.childToMainSession.set(eA.id, el),
            this.logger.info(
              `[waitFor] Child session skipped registration: id=${eA.id}, parentSessionId=${eA.meta.parentSessionId}, meta=${JSON.stringify(eA.meta)}`,
            ));
        } else
          this.parentIdToMainSession.has(eA.id)
            ? this.logger.info(
                `[waitFor] Skipping mainSession registration for id=${eA.id}: already registered (likely session object re-created with lost meta), meta=${JSON.stringify(eA.meta ?? null)}`,
              )
            : (this.parentIdToMainSession.set(eA.id, eA),
              this.logger.info(
                `[waitFor] Registered mainSession: id=${eA.id}, meta=${JSON.stringify(eA.meta ?? null)}`,
              ));
        runtime.subscribe(eA, async (el: any) => {
          if (!el || !AB.RunResultUtils.isStream(el)) return;
          let ec: any = t5.ContainerUtil.get(An.AgentService);
          try {
            (this.startupProfiler.markStart(
              A$.StartupPhase.AGENT_LLM_CALL,
              "LLM Stream",
            ),
              this.logger.info(
                `[InterruptionService] await result.completed START — session=${eA.id}, agent=${eA.agentName}`,
              ));
            let eu: any = Date.now();
            if (
              (await el.completed,
              this.logger.info(
                `[InterruptionService] await result.completed DONE — session=${eA.id}, elapsed=${Date.now() - eu}ms`,
              ),
              this.startupProfiler.markEnd(A$.StartupPhase.AGENT_LLM_CALL),
              eA.abortSignal.aborted)
            )
              throw new InterruptedByUserError();
            let ed: any = el.interruptions?.slice(0) ?? [],
              ep: any = ed.length > 0;
            if (((el._hasInterruptions = ep), !ep))
              if (eA.meta?.parentSessionId)
                eA.headlessCompletionDeferred?.resolve();
              else {
                let ec: any = await t5.ContainerUtil.get(
                  An.AgentManager,
                ).getDefault();
                if (el && "lastAgent" in el && el.lastAgent?.name === ec.name) {
                  let ec: any = eA.hookContexts?.stopHookActive ?? !1;
                  (ec && delete eA.hookContexts.stopHookActive,
                    await this.sessionHookManager.executeStopHooks(eA, el, {
                      stopHookActive: ec,
                      stopReason: "completed",
                    }));
                  let eu: any = eA.hookContexts?.continueRequest;
                  eu
                    ? (this.logger.info("Stop hook requested continuation"),
                      delete eA.hookContexts.continueRequest,
                      eA.hookContexts || (eA.hookContexts = {}),
                      (eA.hookContexts.stopHookActive = !0),
                      setImmediate(async () => {
                        try {
                          await this.continueAgentWithMessage(eA, eu.message);
                        } catch (eA: any) {
                          this.logger.error(
                            "Failed to continue agent from Stop hook:",
                            eA,
                          );
                        }
                      }))
                    : eA.headlessCompletionDeferred?.resolve();
                } else
                  (this.logger.info(
                    `[NonDefaultAgent] non-default agent completed, executing stop hooks sessionId=${eA.id} lastAgent=${el && "lastAgent" in el ? el.lastAgent?.name : "unknown"}`,
                  ),
                    await this.sessionHookManager.executeStopHooks(eA, el),
                    eA.hookContexts?.continueRequest &&
                      delete eA.hookContexts.continueRequest,
                    eA.headlessCompletionDeferred?.resolve());
              }
            if (
              (eA.combineSubject.next({
                type: "result",
                data: el,
                hasInterruptions: ep,
              }),
              await this.handleInterruptions(eA, ed),
              AB.RunResultUtils.isFinalOutput(el))
            ) {
              let eu: any = el.state._currentStep,
                ed: any =
                  eu?.type === "next_step_final_output" ? eu.output : "",
                ep: any = t5.ContainerUtil.get(
                  t4.SessionRunStateMachine,
                ).getSnapshot(eA).status;
              (ep === t4.SessionRunStatus.MODEL_DONE ||
              ep === t4.SessionRunStatus.IDLE
                ? el.lastAgent?.emit("agent_end", el.state._context, ed)
                : this.logger.info(
                    `[Interruption] Skipping stale agent_end — session ${eA.id} has new run in ${ep}`,
                  ),
                eA.meta &&
                  (eA.meta.streamTimeoutRetryCount ||
                    eA.meta.firstTokenTimeoutRetryCount) &&
                  (this.logger.info(
                    `[Interruption] Resetting stream retry counters after final output: session=${eA.id}, streamTimeoutRetryCount=${eA.meta.streamTimeoutRetryCount ?? 0} -> 0, firstTokenTimeoutRetryCount=${eA.meta.firstTokenTimeoutRetryCount ?? 0} -> 0`,
                  ),
                  (eA.meta.streamTimeoutRetryCount = 0),
                  (eA.meta.firstTokenTimeoutRetryCount = 0)),
                AB.QueueDispatchUtils.isDeferredDispatchEnabledSync() ||
                  ec.runDefault([], { context: eA }));
            }
          } catch (eS: any) {
            let eu: any = !!eA.abortSignal?.aborted,
              ed: any = eS && "object" == typeof eS ? eS : {},
              ep: any =
                eS instanceof Error
                  ? eS.message
                  : "string" == typeof eS
                    ? eS
                    : String(eS);
            if (
              (this.logger.info(
                `[Interruption] Catch block entered, error: ${ep}`,
              ),
              el.silentAbort)
            ) {
              (el.lastAgent?.emit("agent_end", el.state._context, ""),
                (el.silentAbort = !1));
              let eu: any = el.newItems || [],
                ed: any = new Set();
              for (let eA of eu) {
                let el: any = eA?.rawItem;
                el?.type === "function_call_result" &&
                  el.callId &&
                  ed.add(el.callId);
              }
              for (let eA of eu) {
                let el: any = eA?.rawItem;
                el?.type === "function_call" &&
                  el.callId &&
                  !ed.has(el.callId) &&
                  (el.status = "incomplete");
              }
              (eA.headlessCompletionDeferred?.resolve(),
                eA.combineSubject.next({ type: "result", data: el }),
                !AB.QueueDispatchUtils.isDeferredDispatchEnabledSync() &&
                  eA.queue?.length > 0 &&
                  (this.logger.info(
                    `[Interruption] Draining ${eA.queue.length} queued message(s) after silentAbort`,
                  ),
                  ec.runDefault([], { context: eA })));
              return;
            }
            let eg: any = AB.ErrorUtils.isNetworkError(eS),
              eh: any = AB.ErrorUtils.isStreamTimeoutError(eS),
              ef: any = AB.ErrorUtils.isFirstTokenTimeoutError(eS),
              em: any =
                (eg && !this.hasRecentNetworkErrorRetry(eA)) ||
                (eh && !this.hasRecentStreamTimeoutRetry(eA, ef));
            em
              ? (eA.meta || (eA.meta = {}), (eA.meta.retryInProgress = !0))
              : el.lastAgent?.emit("agent_end", el.state._context, "");
            let eE: any = el.newItems;
            this.logger.info(
              `[Interruption] newItems count: ${eE.length}, types: ${eE.map((eA: any) => eA?.rawItem?.type).join(", ")}`,
            );
            let eC: any = new Set();
            for (let eA of eE) {
              let el: any = eA?.rawItem;
              el?.type === "function_call_result" &&
                el.callId &&
                eC.add(el.callId);
            }
            let ey: any = [];
            for (let eA of eE) {
              let el: any = eA?.rawItem;
              el?.type === "function_call" &&
                el.callId &&
                !eC.has(el.callId) &&
                ey.push(el);
            }
            this.logger.info(
              `[Interruption] functionCallItems without results: ${ey.length}, names: ${ey.map((eA: any) => eA.name).join(", ")}`,
            );
            let ew: any = {
                code: ed.code,
                message: e1.sanitizeToolNotFoundMessage(ep),
                requestID: ed.requestID,
                status: ed.status,
                statusText: ed.statusText,
                type: ed.type,
                isNetworkError: eg,
                isStreamTimeout: eh,
                isRetryable:
                  eg || eh || AB.ErrorUtils.isRetryableModelError(eS),
              },
              eB: any =
                401 !== ed.status
                  ? AB.ErrorUtils.formatErrorMessage(eS) ||
                    ep ||
                    "Unknown error occurred"
                  : `401 ${rl.HttpStatus.UNAUTHORIZED_REASON_PHRASE}`;
            eg &&
              this.logger.warn(
                `Network error detected: ${ed.code}, message: ${ep}, sessionId : ${eA.id}`,
              );
            let e_: any = !1;
            if (!this.stateMachine.isIdle(eA)) {
              let el: any = this.stateMachine.getSnapshot(eA).status;
              (this.logger.info(
                `[Interruption] Handling error from "${el}", willAutoRetry=${em}`,
              ),
                this.stateMachine.transition(eA, {
                  type: em
                    ? t4.SessionRunEventType.RETRYING
                    : t4.SessionRunEventType.RUN_FAILED,
                  reason: em ? "interruption-auto-retry" : "interruption-error",
                }));
            }
            let eI: any = e1.sanitizeToolNotFoundMessage(eB);
            if (
              (this.logger.info(
                `[Interruption] functionCallItems count: ${ey.length}`,
              ),
              ey.length > 0)
            ) {
              for (let el of (await (0, t5.timeout)(200), ey)) {
                let eu: any = eI;
                if (
                  (this.logger.info(
                    `[Interruption] Processing function call: name="${el.name}", errorMessage="${eI}", isTask=${el.name === rf.ToolNames.AGENT}, isInterrupted=${eI === AB.INTERRUPTED_BY_USER_MESSAGE}`,
                  ),
                  el.name === rf.ToolNames.AGENT &&
                    eI === AB.INTERRUPTED_BY_USER_MESSAGE)
                ) {
                  let eA: any = t5.ContainerUtil.get(
                    rp.AgentTaskManager,
                  ).getTasks();
                  this.logger.info(
                    `[Interruption] Found ${eA.length} tasks: ${JSON.stringify(eA.map((eA: any) => ({ id: eA.id, status: eA.status })))}`,
                  );
                  let el: any = eA.find(
                    (eA: any) =>
                      "running" === eA.status || "failed" === eA.status,
                  );
                  el
                    ? ((eu = `Task was interrupted by user. The task has been stopped.

If the user wants to continue this task later, you can resume it by calling the Agent tool with resume="${el.id}".

Do NOT use TaskOutput to retrieve results - TaskOutput is only for background tasks started with run_in_background=true.

[Agent ID: ${el.id}]`),
                      this.logger.info(
                        `[Interruption] Found related task: ${el.id}, using custom error message`,
                      ))
                    : this.logger.warn(
                        "[Interruption] No running/failed task found, using default error message",
                      );
                }
                let ed: any = AB.InputItemUtils.createToolCallResultItem(
                  eu,
                  el,
                  { status: "incomplete", skipRun: !0, error: ew },
                );
                await ec.runDefault([ed], { context: eA });
              }
              if (eg && !this.hasRecentNetworkErrorRetry(eA))
                (this.logger.info(
                  `[Interruption] Network error with pending tool calls, auto-retrying, sessionId: ${eA.id}`,
                ),
                  delete eA.meta?.retryInProgress,
                  (e_ = !0),
                  await ec.runDefault(
                    AB.InputItemUtils.createErrorRecoveryInput(
                      '<system-reminder data-role="error-recovery">Network error occurred, please continue</system-reminder>',
                    ),
                    { context: eA, bypassMessageQueue: !0 },
                  ));
              else if (eg)
                this.logger.warn(
                  `[Interruption] Network error retry suppressed - max retries reached, sessionId: ${eA.id}`,
                );
              else if (eh && !this.hasRecentStreamTimeoutRetry(eA, ef)) {
                let el: any = ef
                  ? "First token timeout occurred"
                  : "Stream timeout occurred";
                this.incrementStreamTimeoutRetryCount(eA, ef);
                let eu: any = ef
                    ? (eA.meta?.firstTokenTimeoutRetryCount ?? 0)
                    : (eA.meta?.streamTimeoutRetryCount ?? 0),
                  ed: any = 2e3 * eu;
                (this.logger.info(
                  `[Interruption] ${el} with pending tool calls, auto-retrying (attempt ${eu}, delay ${ed}ms), sessionId: ${eA.id}`,
                ),
                  ed > 0 && (await (0, t5.timeout)(ed)),
                  delete eA.meta?.retryInProgress,
                  (e_ = !0),
                  await ec.runDefault(
                    AB.InputItemUtils.createErrorRecoveryInput(
                      `<system-reminder data-role="error-recovery">${el} during tool execution. The response was interrupted. Please continue.</system-reminder>`,
                    ),
                    { context: eA, bypassMessageQueue: !0 },
                  ));
              }
            } else {
              let eu: any = AB.InputItemUtils.createAssistantMessage(eB, {
                status: "incomplete",
                skipRun: !0,
                error: ew,
              });
              if (
                (await ec.runDefault([eu], { context: eA }),
                eS instanceof SyntaxError || ed.error instanceof SyntaxError)
              )
                this.hasRecentModelErrorRetry(eA)
                  ? this.logger.warn(
                      `[Interruption] SyntaxError retry suppressed - max retries reached, sessionId: ${eA.id}`,
                    )
                  : (this.logger.info(
                      `[Interruption] SyntaxError, auto-retrying, sessionId: ${eA.id}`,
                    ),
                    (e_ = !0),
                    await ec.run(
                      el.lastAgent,
                      AB.InputItemUtils.createErrorRecoveryInput(
                        `<system-reminder data-role="error-recovery">Model error retry: ${ep}</system-reminder>`,
                      ),
                      { context: eA, bypassMessageQueue: !0 },
                    ));
              else if (eS instanceof rc.ModelBehaviorError) {
                let eu: any = eS.message.match(
                  /Tool (.+?) not found in agent \S+/,
                );
                if (eu) {
                  let ed: any,
                    ep: any = eu[1],
                    eg: any = t5.ContainerUtil.get(
                      rm.ToolSearchService,
                    ).describe(ep),
                    eh: any = this.hasRecentModelErrorRetry(eA);
                  if (eg && !eh)
                    ed = `<system-reminder data-role="error-recovery">
## Deferred Tool — Use DeferExecuteTool

You attempted to call "${ep}" directly, but deferred tools cannot be called directly. Use DeferExecuteTool instead:

DeferExecuteTool({ toolName: "${ep}", params: { ... } })

If you need to know the parameter schema, use ToolSearch first to look up the tool's details.

<!-- ${e1.MODEL_ERROR_RETRY_MARKER}: deferred tool "${ep}" invoked directly -->
</system-reminder>`;
                  else if (eg) {
                    this.logger.warn(
                      `[Interruption] Deferred tool "${ep}" called directly past retry cap — stopping loop, sessionId: ${eA.id}`,
                    );
                    let el: any = AB.InputItemUtils.createAssistantMessage(
                      `The tool "${ep}" must be invoked via DeferExecuteTool, but the previous attempts kept calling it directly. Stopping to avoid an endless loop. Please retry your request, or rephrase what you need.`,
                      { status: "incomplete", skipRun: !0 },
                    );
                    (await ec.runDefault([el], { context: eA }), (ed = ""));
                  } else
                    eh
                      ? (this.logger.warn(
                          `[Interruption] ModelBehaviorError (Tool Not Found: ${ep}) retry suppressed - max retries reached, sessionId: ${eA.id}`,
                        ),
                        (ed = ""))
                      : (ed = `<system-reminder data-role="error-recovery">
## Model error retry: Tool Not Found

You attempted to call a tool named "${ep}" but it does not exist in the current tool set.

Please check:
1. Did you misspell the tool name? Common tool names include: Read, Write, Edit, Bash, Glob, Grep, Agent, WebFetch, WebSearch, etc.
2. Is this tool available in the current context?

If you made a typo, please retry with the correct tool name.
If the tool genuinely doesn't exist, try to accomplish your goal using other available tools.
</system-reminder>`);
                  if (ed) {
                    (this.logger.info(
                      `[Interruption] ModelBehaviorError: Tool "${ep}" not found (deferred: ${!!eg}), prompting model to retry, conversationRequestId=${eA.conversationRequestId}`,
                    ),
                      (e_ = !0));
                    let eu: any = eA.conversationRequestId;
                    (await ec.run(
                      el.lastAgent,
                      AB.InputItemUtils.createErrorRecoveryInput(ed),
                      { context: eA, bypassMessageQueue: !0 },
                    ),
                      eA.conversationRequestId !== eu &&
                        this.logger.warn(
                          `[Interruption] conversationRequestId changed during retry! before=${eu}, after=${eA.conversationRequestId}`,
                        ));
                  }
                } else {
                  let eu: any = e1.sanitizeToolNotFoundMessage(eS.message);
                  this.hasRecentModelErrorRetry(eA)
                    ? this.logger.warn(
                        `[Interruption] ModelBehaviorError retry suppressed - max retries reached, sessionId: ${eA.id}`,
                      )
                    : (this.logger.info(
                        `[Interruption] ModelBehaviorError: ${eu}, prompting model to retry, sessionId: ${eA.id}`,
                      ),
                      (e_ = !0),
                      await ec.run(
                        el.lastAgent,
                        AB.InputItemUtils.createErrorRecoveryInput(
                          `<system-reminder data-role="error-recovery">Model error retry: ${eu}. Please try a different approach.</system-reminder>`,
                        ),
                        { context: eA, bypassMessageQueue: !0 },
                      ));
                }
              } else if (eg && !this.hasRecentNetworkErrorRetry(eA))
                (this.logger.info(
                  `[Interruption] Network error without pending tool calls, auto-retrying, sessionId: ${eA.id}`,
                ),
                  delete eA.meta?.retryInProgress,
                  (e_ = !0),
                  await ec.run(
                    el.lastAgent,
                    AB.InputItemUtils.createErrorRecoveryInput(
                      '<system-reminder data-role="error-recovery">Network error occurred, please continue</system-reminder>',
                    ),
                    { context: eA, bypassMessageQueue: !0 },
                  ));
              else if (eg)
                this.logger.warn(
                  `[Interruption] Network error retry suppressed - max retries reached, sessionId: ${eA.id}`,
                );
              else if (eh && !this.hasRecentStreamTimeoutRetry(eA, ef)) {
                let eu: any = ef
                  ? "First token timeout occurred"
                  : "Stream timeout occurred";
                this.incrementStreamTimeoutRetryCount(eA, ef);
                let ed: any = ef
                    ? (eA.meta?.firstTokenTimeoutRetryCount ?? 0)
                    : (eA.meta?.streamTimeoutRetryCount ?? 0),
                  ep: any = 2e3 * ed;
                (this.logger.info(
                  `[Interruption] ${eu}, auto-retrying (attempt ${ed}, delay ${ep}ms), sessionId: ${eA.id}`,
                ),
                  ep > 0 && (await (0, t5.timeout)(ep)),
                  delete eA.meta?.retryInProgress,
                  (e_ = !0),
                  await ec.run(
                    el.lastAgent,
                    AB.InputItemUtils.createErrorRecoveryInput(
                      `<system-reminder data-role="error-recovery">${eu}. The response was interrupted due to no data received. Please continue where you left off.</system-reminder>`,
                    ),
                    { context: eA, bypassMessageQueue: !0 },
                  ));
              } else if (
                null != eS &&
                "object" == typeof eS &&
                "error" in eS &&
                eS.error instanceof rc.ModelBehaviorError
              ) {
                let eu: any = eS.error.message,
                  ed: any = e1.sanitizeToolNotFoundMessage(eu);
                this.hasRecentModelErrorRetry(eA)
                  ? this.logger.warn(
                      `[Interruption] Wrapped ModelBehaviorError retry suppressed - max retries reached, sessionId: ${eA.id}`,
                    )
                  : (this.logger.info(
                      `[Interruption] Wrapped ModelBehaviorError: ${ed}, prompting model to retry, sessionId: ${eA.id}`,
                    ),
                    (e_ = !0),
                    await ec.run(
                      el.lastAgent,
                      AB.InputItemUtils.createErrorRecoveryInput(
                        `<system-reminder data-role="error-recovery">Model error retry: ${ed}. Please try a different approach.</system-reminder>`,
                      ),
                      { context: eA, bypassMessageQueue: !0 },
                    ));
              }
            }
            eA.meta?.retryInProgress && delete eA.meta.retryInProgress;
            let ev: any = !!eA.meta?.parentSessionId;
            (e_ ||
              ev ||
              (await this.sessionHookManager.executeStopHooks(eA, el, {
                stopReason: eu ? "cancelled" : "failed",
              }),
              eA.hookContexts?.continueRequest &&
                delete eA.hookContexts.continueRequest),
              e_ || eA.headlessCompletionDeferred?.resolve(),
              eA.combineSubject.next({ type: "result", data: el }),
              !e_ &&
                !eu &&
                !AB.QueueDispatchUtils.isDeferredDispatchEnabledSync() &&
                eA.queue?.length > 0 &&
                (this.logger.info(
                  `[Interruption] Draining ${eA.queue.length} queued message(s) after error handling`,
                ),
                ec.runDefault([], { context: eA })));
          } finally {
            (eA.resultAbortSignalMap.delete(el),
              eA.headlessCompletionDeferred?.resolve());
          }
        });
      }
    }
    async continueAgentWithMessage(eA: any, el: any): Promise<any> {
      try {
        if (eA.abortSignal?.aborted)
          return void this.logger.warn(
            "[StopHook] continuation cancelled (abort or stream teardown)",
          );
        if (!this.stateMachine.isIdle(eA)) {
          let el: any = 5e3;
          await new Promise((ec: any, eu: any) => {
            let ed: any = this.stateMachine.getChange$(eA, !0).subscribe(() => {
                this.stateMachine.isIdle(eA) && (ed.unsubscribe(), ec());
              }),
              ep: any = setTimeout(() => {
                (ed?.unsubscribe(),
                  this.stateMachine.isIdle(eA)
                    ? ec()
                    : eu(new AgentTimeoutError()));
              }, el);
            this.stateMachine.isIdle(eA) &&
              (clearTimeout(ep), ed?.unsubscribe(), ec());
          });
        }
        if (eA.abortSignal?.aborted)
          return void this.logger.warn(
            "[StopHook] continuation cancelled after idle wait (abort or stream teardown)",
          );
        let ec: any = t5.ContainerUtil.get(An.AgentService);
        await ec.runDefault([el], { context: eA });
      } catch (eA: any) {
        this.logger.error("Failed to continue agent with message:", eA);
      }
    }
    static sanitizeToolNotFoundMessage(eA: any): any {
      return eA
        ? eA.replace(
            /Tool (.+?) not found in agent [^\s.]+\.?/g,
            'Tool "$1" does not exist in the current tool set.',
          )
        : eA;
    }
    hasRecentModelErrorRetry(eA: any): any {
      let el: any = AB.HistoryUtils.getActiveAgentOnlyHistory(eA.history).slice(
          -e1.MODEL_ERROR_RETRY_CHECK_WINDOW,
        ),
        ec: any = 0;
      for (let eA of el) {
        let el: any = eA;
        if ("user" === el.role && el.content)
          try {
            ("string" == typeof el.content
              ? el.content
              : JSON.stringify(el.content)
            ).includes(e1.MODEL_ERROR_RETRY_MARKER) && ec++;
          } catch {}
      }
      return ec >= e1.MODEL_ERROR_MAX_RETRIES;
    }
    hasRecentNetworkErrorRetry(eA: any): any {
      return AB.HistoryUtils.getActiveAgentOnlyHistory(eA.history)
        .slice(-e1.NETWORK_ERROR_RETRY_CHECK_WINDOW)
        .some((eA: any) => {
          let el: any = eA;
          if ("user" === el.role && el.content)
            try {
              return (
                "string" == typeof el.content
                  ? el.content
                  : JSON.stringify(el.content)
              ).includes(e1.NETWORK_ERROR_RETRY_MARKER);
            } catch {}
          return !1;
        });
    }
    incrementStreamTimeoutRetryCount(eA: any, el: any): any {
      (eA.meta || (eA.meta = {}),
        el
          ? (eA.meta.firstTokenTimeoutRetryCount =
              (eA.meta.firstTokenTimeoutRetryCount ?? 0) + 1)
          : (eA.meta.streamTimeoutRetryCount =
              (eA.meta.streamTimeoutRetryCount ?? 0) + 1));
    }
    hasRecentStreamTimeoutRetry(eA: any, el: any): any {
      return el
        ? (eA.meta?.firstTokenTimeoutRetryCount ?? 0) >= 2
        : (eA.meta?.streamTimeoutRetryCount ?? 0) >= 1;
    }
  }
  const e1 = Object.assign(NativeInterruptionResultDispatcher, {
    MODEL_ERROR_RETRY_MARKER,
    MODEL_ERROR_RETRY_CHECK_WINDOW,
    MODEL_ERROR_MAX_RETRIES,
    NETWORK_ERROR_RETRY_MARKER,
    NETWORK_ERROR_RETRY_CHECK_WINDOW,
  });
  return new NativeInterruptionResultDispatcher(dependencies);
}
