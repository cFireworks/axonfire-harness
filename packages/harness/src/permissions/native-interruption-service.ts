// Complete InterruptionService, codebuddy.js UTF-16 11047102..11089570.
// Exact native constructor and all 32 members; only result subscription ownership is bridged.
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
import { BehaviorSubject } from "rxjs";
import { PermissionMode, isRestrictedDirectApproveMode } from "./permission.js";
import { ToolNames } from "../tools/tool-names.js";
import {
  TOOL_REJECT_RESULT_CONTENT,
  TOOL_REJECT_RESULT_DISPLAY,
  USER_DECLINED_TO_ANSWER_QUESTIONS,
} from "../tools/tool-rejection.js";
import { createNativeCommandSafety } from "./native-command-safety.js";
import type { NativeInterruptionResultRuntime } from "./native-interruption-result-dispatcher.js";

class ErrorUtil {
  [key: string]: any;
  static fixProto(eA: any, el: any): any {
    let ec: any = Object.setPrototypeOf;
    ec ? ec(eA, el) : (eA.__proto__ = el);
  }
  static fixStack(eA: any, el: any = eA.constructor): any {
    let ec: any = Error.captureStackTrace;
    ec && ec(eA, el);
  }
}
const eu = { ErrorUtil };
class CustomError extends Error {
  constructor(eA: any, el?: any) {
    (super(eA, el),
      Object.defineProperty(this, "name", {
        value: new.target.name,
        enumerable: !1,
        configurable: !0,
      }),
      eu.ErrorUtil.fixProto(this, new.target.prototype),
      eu.ErrorUtil.fixStack(this));
  }
}
class Deferred {
  [key: string]: any;
  constructor() {
    this.promise = new Promise((eA: any, el: any) => {
      ((this.resolve = eA), (this.reject = el));
    });
  }
}
const t5 = { CustomError };
class SessionAbortedError extends t5.CustomError {
  constructor(eA: any = "Session aborted") {
    super(eA);
  }
}
class SessionCompactionAbortError extends t5.CustomError {
  constructor() {
    super("Session aborted by context compaction");
  }
}
class SdkPermissionDeniedError extends t5.CustomError {
  declare interrupt: boolean;
  constructor(eA: any = "Permission denied by SDK", el: any = !1) {
    (super(eA), (this.interrupt = el));
  }
}
class AgentTimeoutError extends t5.CustomError {
  constructor(eA: any = "Timeout waiting for agent_end state") {
    super(eA);
  }
}
export {
  SessionAbortedError,
  SessionCompactionAbortError,
  SdkPermissionDeniedError,
};
export type NativeInterruptionControllerRuntime =
  NativeInterruptionResultRuntime & {
    commands?: any;
    isMandatoryApprovalTarget(
      session: any,
      name: string,
    ): Promise<boolean> | boolean;
    cwd(): string;
    logMcpUiDiag(logger: any, details: any, enabled?: boolean): void;
  };
export function createNativeInterruptionService(
  runtime: NativeInterruptionControllerRuntime,
  dependencies: Record<string, any>,
) {
  const commands = createNativeCommandSafety(),
    t7 = { BehaviorSubject },
    rh = { PermissionMode },
    Aw = { isRestrictedDirectApproveMode, TOOL_REJECT_RESULT_CONTENT },
    Ah = { NotificationType: { PERMISSION_PROMPT: "permission_prompt" } },
    rC = { logMcpUiDiag: runtime.logMcpUiDiag },
    process = { cwd: runtime.cwd };
  const Date = { now: () => runtime.now() },
    setImmediate = (callback: () => any) => runtime.setImmediate(callback),
    setTimeout = (callback: () => void, ms: number) =>
      runtime.setTimeout(callback, ms),
    clearTimeout = (timer: any) => runtime.clearTimeout(timer);
  const service = runtime.service,
    profiler = runtime.profiler ?? { markStart() {}, markEnd() {} },
    AB = {
      RunResultUtils,
      CommandUtils: runtime.commands ?? commands.CommandUtils,
      RiskLevel: commands.RiskLevel,
      ModelUtils: {
        isMandatoryApprovalTarget: runtime.isMandatoryApprovalTarget,
      },
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
    rf = {
      ToolNames,
      TOOL_REJECT_RESULT_DISPLAY,
      USER_DECLINED_TO_ANSWER_QUESTIONS,
    },
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
      // Host ownership only: observe early UI rejection while native code sleeps 200ms.
      Deferred: class extends Deferred {
        constructor() {
          super();
          this.promise.catch(() => {});
        }
      },
      CustomError,
      ContainerUtil: { get: (name: string) => services[name] },
      timeout: (ms: number) => runtime.sleep(ms),
    };

  class NativeInterruptionService {
    [key: string]: any;
    constructor() {
      ((this.pendingInterruptions = new Map()),
        (this.itemToSessionMap = new Map()),
        (this.interruptionQueues = new Map()),
        (this.parentIdToMainSession = new Map()),
        (this.childToMainSession = new Map()),
        (this.waitForSubscriptions = new WeakSet()),
        (this.pending$ = new t7.BehaviorSubject(void 0)));
    }
    get startupProfiler(): any {
      try {
        return t5.ContainerUtil.get(A$.StartupProfiler);
      } catch {
        return;
      }
    }
    approve(eA: any, el?: any): any {
      let ec: any = "name" in eA.rawItem ? eA.rawItem.name : eA.rawItem.type,
        eu: any = eA.rawItem.callId || eA.rawItem.id || "",
        ed: any = eA.rawItem.providerData;
      (this.logger.info?.(
        `[DIAG-mcpui-resolve] approve enter toolName=${ec} toolId=${eu} alwaysApprove=${!!el?.alwaysApprove} hasSandboxResolve=${"function" == typeof ed?._sandboxResolve} mcpUiIntercept=${ed?.["codebuddy.ai/mcpUiIntercept"] === !0}`,
      ),
        this.logger.info(
          `[Approve] User approved tool: ${ec}, id: ${eu}, alwaysApprove: ${el?.alwaysApprove || !1}, scope: ${el?.scope || "session"}`,
        ));
      let ep: any = eA.rawItem.providerData?._sandboxResolve;
      if (ep) {
        let ed: any = el?.alwaysApprove ? "allow_session" : "allow_once";
        if (
          (this.logger.info(
            `[Approve] Sandbox intercept approved: ${ec}, id: ${eu}, choice: ${ed}`,
          ),
          ep(ed),
          eA.rawItem.providerData?._enqueuedViaQueue)
        ) {
          let el: any = this.findSessionByItem(eA);
          el && this.dequeueSandboxItem(el, eA);
        }
        return;
      }
      let eg: any = this.findSessionByItem(eA);
      if (!eg)
        return void this.logger.warn(
          `[Approve] Failed: Cannot find session for tool: ${ec}, id: ${eu}`,
        );
      if (!eg.state)
        return void this.logger.warn(
          `[Approve] Failed: Session state is null for tool: ${ec}, id: ${eu}, sessionId: ${eg.id}`,
        );
      let eh: any = this.getPendingMapForSession(eg),
        ef: any = eh.get(eA);
      if (!ef)
        return void this.logger.warn(
          `[Approve] Failed: No pending deferred found for tool: ${ec}, id: ${eu}, sessionId: ${eg.id}, pendingMapSize: ${eh.size}`,
        );
      if (el?.alwaysApprove) {
        let eu: any = el.scope || "session";
        (this.toolAlwaysApprovalService.approve(eg, eA, eu),
          this.logger.info(
            `[Approve] Added to always-approve cache: ${ec}, scope: ${eu}`,
          ));
      } else
        (eg.state.approve(eA),
          this.logger.info(`[Approve] Single approval for: ${ec}`));
      let em: any = this.findMainSession(eg);
      (this.logger.info(
        `[Approve] mainSession=${em.id}, queueSizeBefore=${this.interruptionQueues.get(em.id)?.length || 0}, currentInterruption=${em.interruptionSubject.value ? "yes" : "no"}`,
      ),
        this.acpBroadcastService
          ?.broadcastPermissionResolved(
            em.id,
            eu,
            ec,
            el?.alwaysApprove ? "allowAll" : "allow",
          )
          .catch((eA: any) =>
            this.logger.warn?.(
              `[Approve] Failed to broadcast permissionResolved: ${eA}`,
            ),
          ),
        ef.resolve(),
        this.logger.info(
          `[Approve] Deferred resolved for tool: ${ec}, id: ${eu}`,
        ),
        this.dequeue(em, eA),
        this.logger.info(
          `[Approve] Success: Deferred resolved and interruption dequeued for tool: ${ec}, id: ${eu}`,
        ));
    }
    reject(eA: any, el?: any): any {
      let ec: any = "name" in eA.rawItem ? eA.rawItem.name : eA.rawItem.type,
        eu: any = eA.rawItem.callId || eA.rawItem.id || "",
        ed: any = el?.decision || "deny";
      this.logger.info(`[Reject] User rejected tool: ${ec}, id: ${eu}`);
      let ep: any = eA.rawItem.providerData?._sandboxResolve;
      if (ep) {
        (this.logger.info(
          `[Reject] Sandbox intercept rejected: ${ec}, id: ${eu}`,
        ),
          eA.rawItem.providerData?.["codebuddy.ai/mcpUiIntercept"] === !0 &&
            (0, rC.logMcpUiDiag)(
              this.logger,
              {
                event: "sandbox-reject",
                toolId: eu,
                note: "will broadcast permissionResolved=deny",
              },
              !0,
            ),
          ep(!1));
        let el: any = this.findSessionByItem(eA),
          ed: any = el ? this.findMainSession(el) : void 0;
        (eA.rawItem.providerData?._enqueuedViaQueue &&
          el &&
          this.dequeueSandboxItem(el, eA),
          ed
            ? (this.logger.info(
                `[Reject] Sandbox intercept broadcasting permissionResolved: toolId=${eu}, mainSession=${ed.id}`,
              ),
              this.acpBroadcastService
                ?.broadcastPermissionResolved(ed.id, eu, ec, "deny")
                .catch((eA: any) =>
                  this.logger.warn?.(
                    `[Reject] Failed to broadcast permissionResolved for sandbox reject: ${eA}`,
                  ),
                ))
            : this.logger.warn(
                `[Reject] Sandbox intercept: cannot find session for broadcast, toolId=${eu}`,
              ));
        return;
      }
      let eg: any = this.findSessionByItem(eA);
      if (!eg)
        return void this.logger.warn(
          `[Reject] Failed: Cannot find session for tool: ${ec}, id: ${eu}`,
        );
      if (!eg.state)
        return void this.logger.warn(
          `[Reject] Failed: Session state is null for tool: ${ec}, id: ${eu}, sessionId: ${eg.id}`,
        );
      let eh: any = this.getPendingMapForSession(eg),
        ef: any = eh.get(eA);
      if (!ef)
        return void this.logger.warn(
          `[Reject] Failed: No pending deferred found for tool: ${ec}, id: ${eu}, sessionId: ${eg.id}, pendingMapSize: ${eh.size}`,
        );
      let em: any = this.findMainSession(eg);
      (this.logger.info(
        `[Reject] mainSession=${em.id}, queueSizeBefore=${this.interruptionQueues.get(em.id)?.length || 0}, currentInterruption=${em.interruptionSubject.value ? "yes" : "no"}`,
      ),
        this.acpBroadcastService
          ?.broadcastPermissionResolved(em.id, eu, ec, ed)
          .catch((eA: any) =>
            this.logger.warn?.(
              `[Reject] Failed to broadcast permissionResolved: ${eA}`,
            ),
          ),
        ef.reject(),
        this.logger.info(
          `[Reject] Deferred rejected for tool: ${ec}, id: ${eu}`,
        ),
        this.dequeue(em, eA),
        this.logger.info(
          `[Reject] Success: Deferred rejected and interruption dequeued for tool: ${ec}, id: ${eu}`,
        ));
    }
    cancelAllForSession(eA: any, el: any): any {
      (0, rC.logMcpUiDiag)(
        this.logger,
        { event: "cancel-sweep", sessionId: eA, reason: el },
        !0,
      );
      let ec: any = this.interruptionQueues.get(eA);
      if (!ec || 0 === ec.length)
        return void this.logger.debug?.(
          `[cancelAllForSession] No pending interruptions for sessionId=${eA} (no-op)`,
        );
      let eu: any = ec.slice(),
        ed: any = 0;
      for (let ec of eu) {
        let { item: eu, session: ep, deferred: eg } = ec;
        try {
          let eA: any = this.pendingInterruptions.get(ep.id);
          (eA && eA.delete(eu), this.itemToSessionMap.delete(eu));
          let ec: any = eu.rawItem.providerData?._sandboxResolve;
          if (ec) {
            try {
              ec(!1);
            } catch {}
            try {
              let eA: any = eu.rawItem,
                el: any = eA.name || "Bash",
                ec: any = eA.callId || eA.id || "",
                ed: any = this.findMainSession(ep);
              (this.logger.info?.(
                `[cancelAllForSession] broadcasting permissionResolved=deny for sandbox item: toolCallId=${ec}, mainSession=${ed.id}`,
              ),
                this.acpBroadcastService
                  ?.broadcastPermissionResolved(ed.id, ec, el, "deny")
                  .catch((eA: any) =>
                    this.logger.warn?.(
                      `[cancelAllForSession] Failed to broadcast permissionResolved: ${eA}`,
                    ),
                  ));
            } catch (eA: any) {
              this.logger.warn?.(
                `[cancelAllForSession] permissionResolved broadcast setup failed: ${eA instanceof Error ? eA.message : String(eA)}`,
              );
            }
          }
          (eg.reject(Error(el)), ed++);
        } catch (el: any) {
          this.logger.warn?.(
            `[cancelAllForSession] Failed to cancel an interruption item, sessionId=${eA}, err=${el instanceof Error ? el.message : String(el)}`,
          );
        }
      }
      ((ec.length = 0), this.interruptionQueues.delete(eA));
      let ep: any = eu[0],
        eg: any = this.findMainSession(ep.session);
      if (eg.id === eA) eg.interruptionSubject.next(void 0);
      else
        for (let el of this.parentIdToMainSession.values())
          if (el.id === eA) {
            el.interruptionSubject.next(void 0);
            break;
          }
      let eh: any = this.pending$.value;
      if (eh && eh.mainSessionId === eA)
        if (eu.some((eA: any) => this.isSandboxQueueItem(eA.item))) {
          let el: any = this.findNextActiveQueue();
          el
            ? (this.logger.info(
                `[cancelAllForSession] Found orphan queue after clearing sessionId=${eA}, promoting queue for session=${el.sessionId} with ${el.queue.length} item(s)`,
              ),
              this.showHeadById(el.sessionId, el.queue))
            : this.pending$.next(void 0);
        } else this.pending$.next(void 0);
      this.logger.info(
        `[cancelAllForSession] sessionId=${eA}, reason=${el}, rejected=${ed}`,
      );
    }
    async handleInterruptions(eA: any, el: any): Promise<any> {
      let ec: any = eA.resultSubject.value;
      if (!ec || !AB.RunResultUtils.isStream(ec)) return;
      let eu: any = eA.resultAbortSignalMap.get(ec) ?? eA.abortSignal;
      if (eu.aborted) {
        (this.logger.info(
          "Session aborted before handling interruptions, skipping all tool approval requests",
        ),
          ec.lastAgent?.emit("agent_end", ec.state._context, ""));
        return;
      }
      let ed: any = t5.ContainerUtil.get(An.AgentService),
        ep: any = this.getPendingMapForSession(eA),
        eg: any = !!eA.options.acp,
        eh: any = !1,
        ef: any = !1;
      for (let em of el) {
        if (eu.aborted) {
          let eA: any = el.length - el.indexOf(em);
          this.logger.info(
            `Session aborted during interruption loop, skipping remaining ${eA} tool approval(s)`,
          );
          break;
        }
        if (!ep.has(em)) {
          let el: any =
            "name" in em.rawItem ? em.rawItem.name : em.rawItem.type;
          if (
            this.backgroundTaskToolApprovalService.isBackgroundTaskSession(
              eA,
            ) &&
            !this.shouldSuppressDirectApproveForMode(eA)
          ) {
            (this.backgroundTaskToolApprovalService.approve(em, eA),
              eA.state?.approve(em));
            continue;
          }
          if (
            el !== rf.ToolNames.ASK_USER_QUESTION &&
            eA.permissionModeSubject.value === rh.PermissionMode.FullAccess
          ) {
            (this.logger.info(
              `[HandleInterruptions] Auto-approving tool ${el} for session ${eA.id} (FullAccess mode)`,
            ),
              eA.state?.approve(em));
            continue;
          }
          if (
            eA.meta?.parentSessionId &&
            el !== rf.ToolNames.ASK_USER_QUESTION
          ) {
            let ec: any = eA.permissionModeSubject.value;
            if (
              ec === rh.PermissionMode.BypassPermissions &&
              !this.isDangerousBashCommand(em) &&
              !(await this.isMandatoryApprovalDeferTool(eA, em))
            ) {
              (this.logger.info(
                `[HandleInterruptions] Auto-approving tool ${el} for sub-session ${eA.id} (inherited BypassPermissions mode)`,
              ),
                eA.state?.approve(em));
              continue;
            }
            if (
              ec === rh.PermissionMode.AcceptEdits &&
              [
                rf.ToolNames.WRITE,
                rf.ToolNames.EDIT,
                rf.ToolNames.MULTI_EDIT,
                rf.ToolNames.NOTEBOOK_EDIT,
              ].includes(el)
            ) {
              (this.logger.info(
                `[HandleInterruptions] Auto-approving edit tool ${el} for sub-session ${eA.id} (inherited AcceptEdits mode)`,
              ),
                eA.state?.approve(em));
              continue;
            }
          }
          if (
            !eA.meta?.parentSessionId &&
            el !== rf.ToolNames.ASK_USER_QUESTION &&
            eA.permissionModeSubject.value ===
              rh.PermissionMode.BypassPermissions &&
            !this.isDangerousBashCommand(em) &&
            !(await this.isMandatoryApprovalDeferTool(eA, em))
          ) {
            (this.logger.info(
              `[HandleInterruptions] Auto-approving tool ${el} for main session ${eA.id} (BypassPermissions mode)`,
            ),
              eA.state?.approve(em));
            continue;
          }
          if (
            this.toolAlwaysApprovalService.isApproved(eA, em) ||
            Array.from(ep.keys()).find(
              (eA: any) =>
                ("name" in eA.rawItem ? eA.rawItem.name : eA.rawItem.type) ===
                el,
            )
          ) {
            eA.state?.approve(em);
            continue;
          }
          await this.maybePreloadWorkflowSource(em);
          let eE: any = this.findMainSession(eA),
            eC: any = eA.meta?.teamContext,
            ey: any = this.enqueue(
              eE,
              em,
              eA,
              eC ? { memberName: eC.memberName, color: eC.color } : void 0,
            ),
            ew: any = em.rawItem.callId || em.rawItem.id;
          (this.logger.info(
            `[HandleInterruptions] Enqueued tool: ${el}, id: ${ew}, sessionId: ${eA.id}, permissionMode: ${eA.permissionModeSubject.value}, queueSize: ${this.interruptionQueues.get(eE.id)?.length || 0}`,
          ),
            this.stateMachine.transition(eA, {
              type: t4.SessionRunEventType.WAITING_FOR_PERMISSION,
              toolName: el,
            }));
          try {
            if (eh) ey.reject();
            else if (
              "stream-json" !== eA.options.inputFormat ||
              eA.options.acp
            ) {
              if (eu.aborted)
                throw (
                  this.logger.info(
                    `Session aborted before showing approval dialog for tool: ${el}`,
                  ),
                  new SessionAbortedError()
                );
              await (0, t5.timeout)(200);
              let ec: any = em.rawItem.callId;
              if (ec) {
                let el: any = eA.preToolUseHookResults?.get(ec);
                el?.permissionDecisionReason &&
                  "ask" === el.permissionDecision &&
                  (em.rawItem.providerData || (em.rawItem.providerData = {}),
                  (em.rawItem.providerData.permissionDecisionReason =
                    el.permissionDecisionReason));
              }
              this.logger.info(
                `[HandleInterruptions] Approval dialog shown for tool: ${el}, id: ${ew}, waiting for user response...`,
              );
              let ed: any = `needs your permission to use ${el}`;
              try {
                await this.sessionHookManager.executeNotificationHooks(
                  eA,
                  ed,
                  Ah.NotificationType.PERMISSION_PROMPT,
                );
              } catch (eA: any) {
                this.consoleManager.error("Notification hook failed:", eA);
              }
            } else await this.requestSdkPermission(eA, em, el, ey);
            let abortHandler: any = () => {
              let ec: any = !0 === eA.isCompressing;
              (this.logger.info(
                `Session aborted while waiting for tool approval: ${el}, id: ${ew}, isCompressing=${ec}`,
              ),
                ey.reject(
                  ec
                    ? new SessionCompactionAbortError()
                    : new SessionAbortedError(
                        "Session aborted while awaiting tool approval",
                      ),
                ));
            };
            if (eu.aborted)
              throw !0 === eA.isCompressing
                ? new SessionCompactionAbortError()
                : new SessionAbortedError(
                    "Session aborted before awaiting tool approval",
                  );
            eu.addEventListener("abort", abortHandler, { once: !0 });
            try {
              if (this.channelPermissionAdapter && ew) {
                let ec: any =
                    this.channelPermissionAdapter.createPermissionRequest(
                      ew,
                      el,
                      `Tool call: ${el}`,
                      JSON.stringify(em.rawItem.arguments || {}).slice(0, 200),
                    ),
                  eu: any = ey.promise.then(
                    () => ({ source: "local", behavior: "allow" }),
                    (eA: any) => {
                      throw eA;
                    },
                  );
                eu.catch(() => {});
                let ed: any = ec.then((eA: any) => ({
                    source: "channel",
                    behavior: eA,
                  })),
                  ep: any = await Promise.race([eu, ed]);
                if ("channel" === ep.source)
                  if (
                    (this.logger.info(
                      `[Channel] Permission relay won for tool: ${el}, decision: ${ep.behavior}`,
                    ),
                    "allow" === ep.behavior)
                  )
                    this.approve(em);
                  else if ("allow_always" === ep.behavior)
                    this.approve(em, { alwaysApprove: !0 });
                  else if ("deny_and_exit_plan" === ep.behavior) {
                    let el: any = eA.meta?.prePlanPermissionMode;
                    (void 0 !== el
                      ? (eA.permissionModeSubject.next(el),
                        delete eA.meta?.prePlanPermissionMode)
                      : eA.permissionModeSubject.next(
                          rh.PermissionMode.Default,
                        ),
                      this.reject(em, { decision: "rejectAndExitPlan" }),
                      await ey.promise);
                  } else (this.reject(em), await ey.promise);
                else this.channelPermissionAdapter.cancelRequest(ew);
              } else await ey.promise;
            } finally {
              eu.removeEventListener("abort", abortHandler);
            }
            this.logger.info(
              `[HandleInterruptions] Deferred resolved for tool: ${el}, id: ${ew}`,
            );
          } catch (eu: any) {
            if (
              (this.logger.info(
                `[HandleInterruptions] Deferred rejected for tool: ${el}, id: ${ew}, error: ${eu instanceof Error ? eu.message : String(eu)}`,
              ),
              eu instanceof SessionCompactionAbortError)
            ) {
              (this.logger.info(
                `[HandleInterruptions] Compaction abort detected for tool: ${el}, skipping rejection run`,
              ),
                ep.delete(em),
                this.itemToSessionMap.delete(em),
                this.dequeue(eE, em));
              break;
            }
            if (
              ((eh = !0),
              eu instanceof SdkPermissionDeniedError &&
                !0 === eu.interrupt &&
                (ef = !0),
              eg &&
                !(await this.isMandatoryApprovalDeferTool(eA, em)) &&
                (ef = !0),
              ep.delete(em),
              this.itemToSessionMap.delete(em),
              this.dequeue(eE, em),
              "function_call" === em.rawItem.type)
            ) {
              this.logger.info(
                `Tool rejected in interruption-service, tool name: ${em.rawItem.name || "unknown"}, interrupt: ${ef}`,
              );
              let el: any = [];
              this.backgroundTaskToolApprovalService.isBackgroundTaskSession(
                eA,
              ) &&
                (el =
                  await this.backgroundTaskToolApprovalService.handleRejection(
                    em,
                    eA,
                    "Tool call rejected",
                  ));
              try {
                let eA: any = await this.toolManager.get(em.rawItem.name || "");
                eA && (el = await eA.resolveRejectedResult(em.rawItem));
              } catch (eA: any) {
                this.logger.warn(
                  `Failed to resolve rejected result for tool ${em.rawItem.name}:`,
                  eA,
                );
              }
              if (!el.length) {
                let ec: any =
                    em.rawItem.name === rf.ToolNames.ASK_USER_QUESTION
                      ? rf.USER_DECLINED_TO_ANSWER_QUESTIONS
                      : rf.TOOL_REJECT_RESULT_DISPLAY,
                  eu: any = "stream-json" !== eA.options.inputFormat && !eg;
                el = [
                  AB.InputItemUtils.createToolCallResultItem(
                    Aw.TOOL_REJECT_RESULT_CONTENT,
                    em.rawItem,
                    { status: "incomplete", skipRun: eu, error: ec },
                  ),
                ];
              }
              let ep: any = "stream-json" !== eA.options.inputFormat && !eg;
              try {
                let el: any = em.rawItem,
                  ec: any = el.name || "unknown",
                  ed: any = inferTraceCancelReason(eu, ec),
                  ep: any = await this.traceCollector?.flushSession(eA.id, {
                    reason: ed,
                    cancelledTool: {
                      toolName: ec,
                      callId: el.callId,
                      toolInput: el.arguments,
                      errorMessage: extractCancelMessage(eu, ec),
                    },
                  });
                this.logger.info(
                  `[TraceCancel] flushSession before abort sessionId=${eA.id} tool=${ec} callId=${el.callId ?? "-"} reason=${ed} flushed=${ep ?? "noop"}`,
                );
              } catch (eA: any) {
                this.logger.warn(`[TraceCancel] flushSession failed: ${eA}`);
              }
              if (ep)
                (eA.meta || (eA.meta = {}),
                  (eA.meta.userInitiatedAbort = !0),
                  (ec.silentAbort = !0),
                  eA.abortController.abort(),
                  ec.lastAgent?.emit("agent_end", ec.state._context, ""),
                  ed.run(em.agent, el, { context: eA }).catch((eA: any) => {
                    this.logger.error(
                      "[InterruptionService] CLI UI tool rejection run failed:",
                      eA,
                    );
                  }));
              else if (ef)
                (eA.meta || (eA.meta = {}),
                  (eA.meta.userInitiatedAbort = !0),
                  eA.abortController.abort(),
                  ec.lastAgent?.emit("agent_end", ec.state._context, ""));
              else {
                (eA.meta || (eA.meta = {}),
                  (eA.meta.userInitiatedAbort = !0),
                  (ec.silentAbort = !0),
                  eA.abortController.abort());
                let eu: any = em.agent || ec.lastAgent;
                (eu?.emit("agent_end", ec.state._context, ""),
                  ed.run(eu, el, { context: eA }).catch((eA: any) => {
                    this.logger.error(
                      "agentService.run failed for interrupt=false:",
                      eA,
                    );
                  }));
              }
            }
          }
        }
      }
      for (let eA of el) this.itemToSessionMap.delete(eA);
      if ((ep.clear(), ef)) {
        (this.logger.info(
          `SDK requested interrupt, permission denials: ${eA.permissionDenials?.length || 0}`,
        ),
          !eA.meta?.parentSessionId &&
            (await this.sessionHookManager.executeStopHooks(eA, ec, {
              stopReason: "interrupted",
            }),
            eA.hookContexts?.continueRequest &&
              delete eA.hookContexts.continueRequest),
          eA.combineSubject.next({ type: "interrupt_result", data: ec }));
        return;
      }
      !eh &&
        el.length > 0 &&
        ed.run(ec.lastAgent, ec.state, { context: eA }).catch((eA: any) => {
          this.logger.error(
            "[InterruptionService] Continuation run failed:",
            eA,
          );
        });
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
    findSessionByItem(eA: any): any {
      return this.itemToSessionMap.get(eA);
    }
    async maybePreloadWorkflowSource(eA: any): Promise<any> {
      let el: any;
      if (!this.workflowSourceResolver)
        return void this.logger.info(
          "[PreloadWorkflow] resolver not injected — skip",
        );
      let ec: any = eA.rawItem;
      if (
        !ec ||
        "function_call" !== ec.type ||
        ec.name !== rf.ToolNames.DEFER_EXECUTE
      )
        return;
      try {
        el = JSON.parse(ec.arguments || "{}");
      } catch {
        return;
      }
      if (el?.toolName !== rf.ToolNames.WORKFLOW) return;
      let eu: any = el.params;
      if (eu && "object" == typeof eu) {
        if ("string" == typeof eu.script && eu.script.trim())
          return void this.logger.info(
            "[PreloadWorkflow] inline script present, no preload needed",
          );
        if ("string" == typeof eu.name || "string" == typeof eu.scriptPath)
          try {
            let eA: any = await this.workflowSourceResolver.resolve(eu);
            (ec.providerData || (ec.providerData = {}),
              (ec.providerData.workflowSourceText = eA.text),
              this.logger.info(
                `[PreloadWorkflow] loaded ${eA.text.length} chars from ${eA.provenance.kind}:${eA.provenance.location ?? ""}`,
              ));
          } catch (eA: any) {
            this.logger.warn?.(
              `[PreloadWorkflow] resolve failed: ${eA?.message ?? eA}`,
            );
          }
      }
    }
    shouldSuppressDirectApproveForMode(eA: any): any {
      let el: any = eA.permissionModeSubject.value,
        ec: any = eA.meta?.permissionModeCeiling;
      return (
        (0, Aw.isRestrictedDirectApproveMode)(el) ||
        (0, Aw.isRestrictedDirectApproveMode)(ec)
      );
    }
    isDangerousBashCommand(eA: any): any {
      if (
        ("name" in eA.rawItem ? eA.rawItem.name : eA.rawItem.type) !==
        rf.ToolNames.BASH
      )
        return !1;
      try {
        let el: any = JSON.parse(
          ("arguments" in eA.rawItem ? eA.rawItem.arguments : void 0) || "{}",
        );
        if ("string" == typeof el.command) {
          let eA: any = AB.CommandUtils.checkCommandSafety(el.command);
          return (
            eA.riskLevel === AB.RiskLevel.CRITICAL ||
            eA.riskLevel === AB.RiskLevel.HIGH
          );
        }
      } catch {}
      return !1;
    }
    async isMandatoryApprovalDeferTool(eA: any, el: any): Promise<any> {
      if (
        ("name" in el.rawItem ? el.rawItem.name : el.rawItem.type) !==
        rf.ToolNames.DEFER_EXECUTE
      )
        return !1;
      try {
        let ec: any = JSON.parse(
            ("arguments" in el.rawItem ? el.rawItem.arguments : void 0) || "{}",
          ),
          eu: any = "string" == typeof ec.toolName ? ec.toolName : "";
        return await AB.ModelUtils.isMandatoryApprovalTarget(eA, eu);
      } catch {
        return !1;
      }
    }
    findMainSession(eA: any): any {
      let el: any = [...this.parentIdToMainSession.keys()];
      if (
        (this.logger.info(
          `[findMainSession] session=${eA.id}, meta=${JSON.stringify(eA.meta ?? null)}, parentIdToMainSession.keys=[${el.join(", ")}]`,
        ),
        eA.meta?.parentSessionId)
      ) {
        let el: any = this.parentIdToMainSession.get(eA.meta.parentSessionId);
        if (el)
          return (
            this.logger.info(
              `[findMainSession] resolved mainSession=${el.id} via parentSessionId=${eA.meta.parentSessionId}`,
            ),
            el
          );
        this.logger.warn(
          `[findMainSession] Main session not found for parentSessionId: ${eA.meta.parentSessionId}, falling back to session itself (pending$ 全局源不受影响)`,
        );
      } else {
        let el: any = this.childToMainSession.get(eA.id);
        if (el)
          return (
            this.logger.info(
              `[findMainSession] session ${eA.id} has NO parentSessionId but found cached mainSession=${el.id} via childToMainSession (meta was likely overwritten)`,
            ),
            el
          );
        this.logger.warn(
          `[findMainSession] session ${eA.id} has NO parentSessionId (meta.parentSessionId is falsy), returning self`,
        );
      }
      return eA;
    }
    enqueueSandboxApproval(eA: any, el: any): any {
      let ec: any = this.findMainSession(eA),
        eu: any = eA.meta?.teamContext;
      this.enqueue(
        ec,
        el,
        eA,
        eu ? { memberName: eu.memberName, color: eu.color } : void 0,
      );
      let ed: any = el.rawItem.name || "Bash",
        ep: any = el.rawItem.callId || el.rawItem.id || "";
      this.logger.info(
        `[enqueueSandboxApproval] Enqueued sandbox approval: tool=${ed}, id=${ep}, session=${eA.id}, mainSession=${ec.id}, queueSize=${this.interruptionQueues.get(ec.id)?.length || 0}`,
      );
      let eg: any = el.rawItem.providerData;
      eg?.["codebuddy.ai/mcpUiIntercept"] === !0 &&
        (0, rC.logMcpUiDiag)(this.logger, {
          event: "enqueue",
          toolCallId: ep,
          mainSessionId: ec.id,
        });
    }
    enqueue(eA: any, el: any, ec: any, eu: any): any {
      let ed: any = new t5.Deferred(),
        ep: any = { item: el, session: ec, deferred: ed, teamContext: eu };
      this.interruptionQueues.has(eA.id) ||
        this.interruptionQueues.set(eA.id, []);
      let eg: any = this.interruptionQueues.get(eA.id);
      if (
        (eg.push(ep),
        this.getPendingMapForSession(ec).set(el, ed),
        this.itemToSessionMap.set(el, ec),
        1 === eg.length)
      ) {
        let ec: any = this.pending$.value;
        this.isSandboxQueueItem(el) && ec && ec.mainSessionId !== eA.id
          ? this.logger.info(
              `[enqueue] Deferring showHead for mainSession=${eA.id}: pending$ already held by mainSession=${ec.mainSessionId}`,
            )
          : this.showHead(eA);
      } else this.updateHeadQueueInfo(eA);
      return ed;
    }
    dequeue(eA: any, el: any): any {
      let ec: any = this.interruptionQueues.get(eA.id);
      if (!ec)
        return void this.logger.info(
          `[dequeue] No queue found for mainSession=${eA.id}`,
        );
      let eu: any = "name" in el.rawItem ? el.rawItem.name : el.rawItem.type,
        ed: any = el.rawItem.callId || el.rawItem.id || "";
      this.logger.info(
        `[dequeue] Start: mainSession=${eA.id}, tool=${eu}, id=${ed}, queueSizeBefore=${ec.length}`,
      );
      let ep: any = ec.findIndex((eA: any) => eA.item === el);
      if (
        (ep >= 0 && ec.splice(ep, 1),
        this.itemToSessionMap.delete(el),
        ec.length > 0)
      )
        (this.logger.info(
          `[dequeue] Queue not empty for mainSession=${eA.id}, queueSizeAfter=${ec.length}, showing next head`,
        ),
          this.showHead(eA));
      else if (
        (this.logger.info(
          `[dequeue] Queue empty for mainSession=${eA.id}, clearing interruptionSubject`,
        ),
        eA.interruptionSubject.next(void 0),
        this.interruptionQueues.delete(eA.id),
        this.isSandboxQueueItem(el))
      ) {
        let el: any = this.findNextActiveQueue();
        el
          ? (this.logger.info(
              `[dequeue] Found orphan queue after clearing mainSession=${eA.id}, promoting queue for session=${el.sessionId} with ${el.queue.length} item(s)`,
            ),
            this.showHeadById(el.sessionId, el.queue))
          : this.publishPending(eA, void 0);
      } else this.publishPending(eA, void 0);
    }
    findNextActiveQueue(): any {
      for (let [eA, el] of this.interruptionQueues.entries())
        if (el.length > 0) return { sessionId: eA, queue: el };
    }
    isSandboxQueueItem(eA: any): any {
      return !!eA.rawItem.providerData?._enqueuedViaQueue;
    }
    dequeueSandboxItem(eA: any, el: any): any {
      let ec: any = this.findMainSession(eA),
        eu: any = this.interruptionQueues.get(ec.id);
      if (eu && eu.some((eA: any) => eA.item === el)) {
        (this.dequeue(ec, el), this.itemToSessionMap.delete(el));
        return;
      }
      if (ec.id !== eA.id) {
        let eu: any = this.interruptionQueues.get(eA.id);
        if (eu && eu.some((eA: any) => eA.item === el)) {
          (this.logger.info(
            `[dequeueSandboxItem] Item found in fallback queue (sourceSession=${eA.id}) instead of mainSession=${ec.id}, dequeuing from fallback`,
          ),
            this.dequeue(eA, el),
            this.itemToSessionMap.delete(el));
          return;
        }
      }
      (this.logger.warn(
        `[dequeueSandboxItem] Item not found in any queue: sourceSession=${eA.id}, mainSession=${ec.id}`,
      ),
        this.itemToSessionMap.delete(el));
    }
    showHeadById(eA: any, el: any): any {
      if (0 === el.length) return;
      let ec: any = el[0],
        eu: any = ec.session.meta?.parentSessionId
          ? (this.parentIdToMainSession.get(ec.session.meta.parentSessionId) ??
            ec.session)
          : ec.session;
      if (eu.id !== eA) {
        (this.logger.info(
          `[showHeadById] Migrating orphan queue from session=${eA} to mainSession=${eu.id}, items=${el.length}`,
        ),
          this.interruptionQueues.delete(eA));
        let ec: any = this.interruptionQueues.get(eu.id);
        ec ? ec.push(...el) : this.interruptionQueues.set(eu.id, el);
      }
      this.showHead(eu);
    }
    showHead(eA: any): any {
      let el: any = this.interruptionQueues.get(eA.id);
      if (!el || 0 === el.length) return;
      let ec: any = el[0],
        eu: any = ec.item.rawItem;
      (eu.providerData || (eu.providerData = {}),
        ec.teamContext
          ? ((eu.providerData.isSubAgent = !0),
            (eu.providerData.isTeamMember = !0),
            (eu.providerData.memberName = ec.teamContext.memberName),
            (eu.providerData.agent = ec.teamContext.memberName),
            (eu.providerData.agentColor = ec.teamContext.color))
          : ec.session.meta?.parentSessionId &&
            ((eu.providerData.isSubAgent = !0),
            (eu.providerData.agent =
              eu.providerData.agent ||
              ec.session.meta.agentName ||
              ec.session.meta.taskName)),
        (eu.providerData.queuePosition = 1),
        (eu.providerData.queueTotal = el.length));
      let ed: any = eu.name || eu.type,
        ep: any = eu.callId || eu.id || "";
      (this.logger.info(
        `[showHead] mainSession=${eA.id}, tool=${ed}, id=${ep}, queueSize=${el.length}`,
      ),
        eA.interruptionSubject.next(ec.item),
        this.publishPending(eA, ec),
        this.acpBroadcastService
          ?.broadcastInterruptionRequest(eA.id, ec.item)
          .catch((eA: any) =>
            this.logger.warn?.(
              `[showHead] Failed to broadcast interruptionRequest: ${eA}`,
            ),
          ));
    }
    updateHeadQueueInfo(eA: any): any {
      let el: any = this.interruptionQueues.get(eA.id);
      if (!el || 0 === el.length) return;
      let ec: any = el[0],
        eu: any = ec.item.rawItem;
      (eu.providerData && (eu.providerData.queueTotal = el.length),
        eA.interruptionSubject.next(ec.item),
        this.publishPending(eA, ec));
    }
    publishPending(eA: any, el: any): any {
      if (!el) {
        void 0 !== this.pending$.value && this.pending$.next(void 0);
        return;
      }
      let ec: any = this.interruptionQueues.get(eA.id),
        eu: any = ec?.length ?? 1,
        ed: any = {
          item: el.item,
          sourceSessionId: el.session.id,
          mainSessionId: eA.id,
          teamContext: el.teamContext,
          queuePosition: 1,
          queueTotal: eu,
        };
      this.pending$.next(ed);
    }
    getPendingMapForSession(eA: any): any {
      return (
        this.pendingInterruptions.has(eA.id) ||
          this.pendingInterruptions.set(eA.id, new Map()),
        this.pendingInterruptions.get(eA.id)
      );
    }
    async requestSdkPermission(
      eA: any,
      el: any,
      ec: any,
      eu: any,
    ): Promise<any> {
      try {
        let ed: any,
          ep: any =
            "function_call" === el.rawItem.type ? el.rawItem.callId : void 0;
        if (!ep) {
          (this.logger.warn(
            `Cannot get toolUseId for tool ${ec}, defaulting to approve`,
          ),
            eA.state?.approve(el),
            eu.resolve());
          return;
        }
        let eg: any =
          "function_call" === el.rawItem.type
            ? "string" == typeof el.rawItem.arguments
              ? JSON.parse(el.rawItem.arguments)
              : el.rawItem.arguments || {}
            : {};
        await this.triggerPermissionRequestHook(eA, ec, eg, ep);
        let eh: any = eA.resultSubject.value,
          ef: any = eh
            ? (eA.resultAbortSignalMap.get(eh) ?? eA.abortSignal)
            : eA.abortSignal;
        if (ef.aborted) return void eu.reject(new SessionAbortedError());
        let em: any = !1,
          onAbort: any = () => {
            em || eu.reject(new SessionAbortedError());
          };
        ef.addEventListener("abort", onAbort, { once: !0 });
        try {
          ed = await this.sdkPermissionClient.requestPermission(ec, eg, ep);
        } finally {
          ((em = !0), ef.removeEventListener("abort", onAbort));
        }
        if (ed.allowed) {
          if (ed.updatedInput && "function_call" === el.rawItem.type) {
            let eA: any = {
              ...("string" == typeof el.rawItem.arguments
                ? JSON.parse(el.rawItem.arguments)
                : el.rawItem.arguments || {}),
              ...ed.updatedInput,
            };
            ((el.rawItem.arguments = JSON.stringify(eA)),
              this.logger.info(
                `Updated tool input for ${ec} with SDK-provided answers`,
              ));
          }
          (eA.state?.approve(el), eu.resolve());
        } else {
          (this.logger.info(
            `SDK denied permission for tool ${ec}: ${ed.reason || "no reason"}, interrupt: ${ed.interrupt}`,
          ),
            this.addPermissionDenial(eA, {
              tool_name: ec,
              tool_use_id: ep,
              tool_input: eg,
            }));
          let el: any = new SdkPermissionDeniedError(
            ed.reason || "Permission denied by SDK",
            ed.interrupt,
          );
          eu.reject(el);
        }
      } catch (eA: any) {
        (this.logger.error(
          `Failed to request SDK permission for tool ${ec}:`,
          eA,
        ),
          eu.reject(eA instanceof Error ? eA : Error(String(eA))));
      }
    }
    async triggerPermissionRequestHook(
      eA: any,
      el: any,
      ec: any,
      eu: any,
    ): Promise<any> {
      let ed: any = this.sdkHooksManager.getHooks("PermissionRequest");
      if (0 === ed.length) return;
      let ep: any = {
        hook_event_name: "PermissionRequest",
        session_id: eA.id,
        transcript_path: "",
        cwd: process.cwd(),
        tool_name: el,
        tool_input: ec,
      };
      for (let eA of ed)
        for (let el of eA.hookCallbackIds)
          try {
            let ec: any = (eA.timeout ?? 60) * 1e3;
            await this.sdkHooksManager.invokeCallback(el, ep, eu, ec);
          } catch (eA: any) {
            this.logger.warn(`PermissionRequest hook callback failed: ${eA}`);
          }
    }
    addPermissionDenial(eA: any, el: any): any {
      (eA.permissionDenials || (eA.permissionDenials = []),
        eA.permissionDenials.push(el));
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
  function extractCancelMessage(eA: any, el: any): any {
    return eA instanceof Error && eA.message
      ? eA.message
      : "string" == typeof eA && eA
        ? eA
        : el === rf.ToolNames.ASK_USER_QUESTION
          ? rf.USER_DECLINED_TO_ANSWER_QUESTIONS
          : rf.TOOL_REJECT_RESULT_DISPLAY;
  }
  function inferTraceCancelReason(eA: any, el: any): any {
    return eA instanceof SdkPermissionDeniedError
      ? "permission_denied"
      : el === rf.ToolNames.ASK_USER_QUESTION
        ? "ask_cancelled"
        : el === rf.ToolNames.EXIT_PLAN_MODE
          ? "plan_rejected"
          : "user_rejected";
  }
  const e1 = Object.assign(NativeInterruptionService, {
    MODEL_ERROR_RETRY_MARKER,
    MODEL_ERROR_RETRY_CHECK_WINDOW,
    MODEL_ERROR_MAX_RETRIES,
    NETWORK_ERROR_RETRY_MARKER,
    NETWORK_ERROR_RETRY_CHECK_WINDOW,
  });
  return Object.assign(new NativeInterruptionService(), dependencies);
}
export function createNativeToolApprovalServices(runtime: {
  permissions: any;
  commands?: any;
  getTasks(): any[];
  toolManager: any;
  logger: any;
  inputItemUtils?: any;
}) {
  const commands = createNativeCommandSafety(),
    lV = {
      CommandUtils: runtime.commands ?? commands.CommandUtils,
      RiskLevel: commands.RiskLevel,
    },
    nC = { ToolNames, ToolPermissionService: "permissions" },
    aY = { AgentTaskManager: "tasks" },
    nk = {
      ContainerUtil: {
        get: (key: string) =>
          key === "permissions"
            ? runtime.permissions
            : { getTasks: runtime.getTasks },
      },
    },
    eX = {
      InputItemUtils: runtime.inputItemUtils ?? { createToolCallResultItem },
    },
    tn = { TOOL_REJECT_RESULT_CONTENT };
  class ToolAlwaysApprovalService {
    [key: string]: any;
    constructor() {
      ((this.storeMap = new Map()), (this.sessionCaches = new Map()));
    }
    async approve(eA: any, el: any, ec: any = "session"): Promise<any> {
      let eu: any = nk.ContainerUtil.get(nC.ToolPermissionService),
        ed: any = "name" in el.rawItem ? el.rawItem.name : el.rawItem.type;
      if (!ed) return;
      let ep: any = this.checkSafety(el),
        eg: any = this.getToolSignature(el, ep);
      if (
        eg &&
        ep &&
        (ep.riskLevel === lV.RiskLevel.SAFE ||
          ep.riskLevel === lV.RiskLevel.LOW ||
          ep.riskLevel === lV.RiskLevel.MEDIUM)
      ) {
        let ep: any = this.getOrCreateStore(ed);
        ep.add(eA.id, eg);
        let eh: any = this.resolveApprovalRules(el);
        (await eu.applyUpdate(eA, {
          type: "addRules",
          rules: eh,
          behavior: "allow",
          destination: ec,
        }),
          "session" === ec &&
            (await this.syncApprovalToMainSession(eA, ep, eg, eh, eu)));
      }
      eA.state?.approve(el);
    }
    isApproved(eA: any, el: any): any {
      let ec: any = "name" in el.rawItem ? el.rawItem.name : el.rawItem.type;
      if (!ec) return !1;
      let eu: any = this.storeMap.get(ec),
        ed: any = this.checkSafety(el),
        ep: any = this.getToolSignature(el, ed);
      if (!eu || !ep) return !1;
      if (eu.has(eA.id, ep)) return !0;
      let eg: any = eA.meta?.parentSessionId;
      return !!(eg && eu.has(eg, ep));
    }
    clear(eA: any): any {
      for (let el of this.storeMap.values()) el.delete(eA);
    }
    getOrCreateStore(eA: any): any {
      return (
        this.storeMap.has(eA) ||
          this.storeMap.set(eA, this.createStoreForTool()),
        this.storeMap.get(eA)
      );
    }
    createStoreForTool(): any {
      return {
        has: (eA: any, el: any) => this.getSessionCache(eA).has(el),
        add: (eA: any, el: any) => {
          this.getSessionCache(eA).add(el);
        },
        delete: (eA: any) => {
          this.sessionCaches.delete(eA);
        },
      };
    }
    getSessionCache(eA: any): any {
      return (
        this.sessionCaches.has(eA) || this.sessionCaches.set(eA, new Set()),
        this.sessionCaches.get(eA)
      );
    }
    getToolSignature(eA: any, el: any): any {
      let ec: any = "name" in eA.rawItem ? eA.rawItem.name : eA.rawItem.type;
      if (
        el.riskLevel !== lV.RiskLevel.HIGH &&
        el.riskLevel !== lV.RiskLevel.CRITICAL
      ) {
        if (ec === nC.ToolNames.DEFER_EXECUTE)
          try {
            let el: any = JSON.parse(
                ("arguments" in eA.rawItem ? eA.rawItem.arguments : void 0) ||
                  "{}",
              ),
              eu: any = "string" == typeof el.toolName ? el.toolName : "";
            if (eu) return `${ec}:${eu}`;
          } catch {}
        return ec;
      }
    }
    checkSafety(eA: any): any {
      let el: any = "name" in eA.rawItem ? eA.rawItem.name : eA.rawItem.type;
      if (el === nC.ToolNames.EXIT_PLAN_MODE)
        return {
          isSafe: !1,
          requiresApproval: !0,
          riskLevel: lV.RiskLevel.HIGH,
        };
      if (el === nC.ToolNames.BASH)
        try {
          let el: any = JSON.parse(
            ("arguments" in eA.rawItem ? eA.rawItem.arguments : void 0) || "{}",
          ).command;
          if ("string" == typeof el)
            return lV.CommandUtils.checkCommandSafety(el);
        } catch (eA: any) {
          return {
            isSafe: !1,
            requiresApproval: !0,
            riskLevel: lV.RiskLevel.HIGH,
          };
        }
      return { isSafe: !0, requiresApproval: !1, riskLevel: lV.RiskLevel.SAFE };
    }
    async syncApprovalToMainSession(
      eA: any,
      el: any,
      ec: any,
      eu: any,
      ed: any,
    ): Promise<any> {
      if (eA.meta?.parentSessionId)
        try {
          let ep: any = nk.ContainerUtil.get(aY.AgentTaskManager)
              .getTasks()
              .find(
                (el: any) =>
                  el.sessionId === eA.id ||
                  el.getSubAgentSession()?.id === eA.id,
              ),
            eg: any = ep?.getMainSession();
          if (!eg) return;
          (el.add(eg.id, ec),
            await ed.applyUpdate(eg, {
              type: "addRules",
              rules: eu,
              behavior: "allow",
              destination: "session",
            }));
        } catch {}
    }
    resolveApprovalRules(eA: any): any {
      let el: any = "name" in eA.rawItem ? eA.rawItem.name : eA.rawItem.type;
      return el ? [{ toolName: el }] : [];
    }
  }
  class BackgroundTaskToolApprovalService {
    [key: string]: any;
    isBackgroundTaskSession(eA: any): any {
      return eA?.meta?.isBackgroundTaskSession === !0;
    }
    approve(eA: any, el: any): any {
      el?.state &&
        (el.state.approve(eA), this.logApprovalDecision(eA, el, "approved"));
    }
    async handleRejection(eA: any, el: any, ec: any): Promise<any> {
      this.logApprovalDecision(eA, el, "rejected");
      let eu: any = ("name" in eA.rawItem && eA.rawItem.name) || "unknown",
        ed: any = `Tool call rejected in background task: ${eu}. Reason: ${ec}`,
        ep: any = [];
      if ("function_call" === eA.rawItem.type) {
        let el: any = await this.toolManager.get(eu);
        if (el)
          try {
            let ec: any = await el.resolveRejectedResult(eA.rawItem);
            ec && ec.length > 0 && ep.push(...ec);
          } catch (eA: any) {
            this.logger.warn(
              `Failed to get custom rejection result from tool ${eu}:`,
              eA,
            );
          }
        if (0 === ep.length) {
          let el: any = eX.InputItemUtils.createToolCallResultItem(
            tn.TOOL_REJECT_RESULT_CONTENT,
            eA.rawItem,
            { status: "incomplete", skipRun: !0, error: ed },
          );
          ep.push(el);
        }
      }
      return ep;
    }
    logApprovalDecision(eA: any, el: any, ec: any): any {
      let eu: any = ("name" in eA.rawItem && eA.rawItem.name) || "unknown",
        ed: any = el.meta?.parentSessionId || "unknown",
        ep: any = el.meta?.taskId || "unknown",
        eg: any = `[BackgroundTaskToolApproval] Tool ${ec}: tool=${eu}, sessionId=${el.id}, parentSessionId=${ed}, taskId=${ep}`;
      "approved" === ec ? this.logger.info(eg) : this.logger.warn(eg);
    }
  }
  return {
    always: new ToolAlwaysApprovalService(),
    background: Object.assign(new BackgroundTaskToolApprovalService(), {
      toolManager: runtime.toolManager,
      logger: runtime.logger,
    }),
  };
}
