import { RunResultUtils } from "../agents/run-result-utils.js";
import { ModelErrorUtils } from "../models/model-error-utils.js";
import { SessionRunEventType } from "./run-state-types.js";
import type { SessionResultRuntime } from "./session-result-runtime.js";
const AB = {
    RunResultUtils,
    ErrorUtils: {
      ...ModelErrorUtils,
    },
  },
  t4 = { SessionRunEventType },
  Ah = { NotificationType: { IDLE_PROMPT: "idle_prompt" } };
// Original SessionManager result/stream/gate methods, explicit host bridge only.
export class SessionResultLifecycle {
  [key: string]: any;
  resultSubscriptions = new Map<string, any>();
  idleTimers = new Map<string, any>();
  inflightSessionStarts = new WeakMap<object, Promise<any>>();
  constructor(
    readonly runtime: SessionResultRuntime,
    dependencies: Record<string, any>,
  ) {
    Object.assign(this, dependencies);
  }
  resetIdleTimer(eA: any): any {
    let el: any = this.idleTimers.get(eA.id);
    el && this.runtime.clearTimeout(el);
    let ec: any = this.runtime.setTimeout(async () => {
      this.idleTimers.delete(eA.id);
      try {
        if (!this.stateMachine.isIdle(eA)) return void this.resetIdleTimer(eA);
        await this.sessionHookManager.executeNotificationHooks(
          eA,
          "CodeBuddy is waiting for your input",
          Ah.NotificationType.IDLE_PROMPT,
        );
      } catch (eA: any) {
        this.logger.warn?.("Notification (idle) hook failed:", eA);
      }
    }, 6e4);
    this.idleTimers.set(eA.id, ec);
  }
  async emitSessionStart(eA: any, el: any): Promise<any> {
    if ("startup" === el || "resume" === el) {
      let ec: any = this.inflightSessionStarts.get(eA);
      if (ec)
        return (
          this.logger.debug(
            `[SessionManager] emitSessionStart(${el}) joining in-flight emit for session ${eA.id}`,
          ),
          ec
        );
    }
    let ec: any = (async () => {
      try {
        await this.sessionHookManager.executeSessionStartHooks(eA, el);
      } catch (eA: any) {
        this.logger.error(
          `[SessionManager] emitSessionStart(${el}) failed:`,
          eA,
        );
      }
    })();
    return (this.inflightSessionStarts.set(eA, ec), ec);
  }
  initRunResultHandler(eA: any): any {
    let el: any = this.resultSubscriptions.get(eA.id);
    (el && (el.unsubscribe(), this.resultSubscriptions.delete(eA.id)),
      this.handleRunResult(eA));
  }
  async handleRunResult(eA: any): Promise<any> {
    if (this.resultSubscriptions.has(eA.id)) return;
    this.interruptionService.waitFor(eA);
    let el: any = this.runtime.subscribe(eA, async (el: any) => {
      const originalResult: any = el;
      let ec: any, eu: any;
      if (!el) return;
      if (el.__cancelNudge)
        return void this.logger.info(
          `[SessionManager] Skip cancel-nudge result, session=${eA.id}`,
        );
      ((eA.state = el.state),
        (eA.interceptorGate = {
          completed: new Promise((eA: any) => {
            ec = eA;
          }),
          resolve: (eA: any) => ec(eA),
        }));
      let ed: any = !0,
        ep: any = {};
      try {
        let ec: any = this.runtime.now(),
          eu: any = eA.telemetry
            ? {
                modelId: eA.telemetry.modelId,
                modelName: eA.telemetry.modelName,
                currentTurn: eA.telemetry.currentTurn,
                traceId: eA.telemetry.traceId,
              }
            : void 0;
        (this.galileoSessionBridge.emitRequestStart(eA, eu),
          this.galileoSessionBridge.emitMessageStart(eA),
          AB.RunResultUtils.isStream(el)
            ? (this.logger.info(
                `[SessionManager] handleStreamRunResult START — session=${eA.id}`,
              ),
              await this.handleStreamRunResult(eA, el, ep),
              this.logger.info(
                `[SessionManager] handleStreamRunResult DONE — session=${eA.id}, elapsed=${this.runtime.now() - ec}ms`,
              ))
            : await this.handleNonStreamRunResult(eA, el, ep));
      } catch (el: any) {
        this.runtime.onHandlingError(eA, originalResult, el);
        ((eu = el),
          (ed = !1),
          this.logger.error("Failed to handle run result:", el),
          this.stateMachine.transition(eA, {
            type: t4.SessionRunEventType.RUN_FAILED,
            reason: "handle-run-result-error",
          }));
      } finally {
        let eg: any = !1,
          eh: any = null;
        if (AB.RunResultUtils.isStream(el)) {
          try {
            this.logger.info(
              `[SessionManager] await result.completed START — session=${eA.id}, agent=${eA.agentName}`,
            );
            let ec: any = this.runtime.now();
            (await el.completed,
              this.logger.info(
                `[SessionManager] await result.completed DONE — session=${eA.id}, elapsed=${this.runtime.now() - ec}ms`,
              ));
          } catch (el: any) {
            ((eh = el),
              this.logger.info(
                `[SessionManager] await result.completed ERROR — session=${eA.id}, error=${el?.message || el}`,
              ));
          }
          let ec: any = el._hasInterruptions,
            eu: any = el.interruptions?.length ?? 0;
          ((ec ?? (el.interruptions && el.interruptions.length > 0)) &&
            ((eg = !0),
            this.logger.info(
              `[SessionManager][Gate] willRetry=true reason=interruptions session=${eA.id} stamped=${ec} liveLen=${eu}`,
            )),
            !eg &&
              el.error &&
              AB.ErrorUtils.isNetworkError(el.error) &&
              ((eg = !0),
              this.logger.info(
                `[SessionManager][Gate] willRetry=true reason=networkError session=${eA.id} errorCode=${el.error?.code}`,
              )),
            !eg &&
              eh &&
              AB.ErrorUtils.isRetryableModelError(eh) &&
              ((eg = !0),
              this.logger.info(
                `[SessionManager][Gate] willRetry=true reason=retryableModelError session=${eA.id} errorType=${eh?.constructor?.name}`,
              )),
            !eg &&
              eh &&
              AB.ErrorUtils.isStreamTimeoutError(eh) &&
              ((eg = !0),
              this.logger.info(
                `[SessionManager][Gate] willRetry=true reason=streamTimeout session=${eA.id}`,
              )),
            !eg &&
              eA.meta?.retryInProgress &&
              ((eg = !0),
              this.logger.info(
                `[SessionManager][Gate] willRetry=true reason=retryInProgress session=${eA.id}`,
              )),
            !eg &&
              eA.isCompressing &&
              ((eg = !0),
              this.logger.info(
                `[SessionManager][Gate] willRetry=true reason=compacting session=${eA.id}`,
              )));
        }
        if (!eg)
          try {
            if (this.interceptors && this.interceptors.length > 0)
              for (let ec of this.interceptors)
                try {
                  let eu: any = await ec.intercept({
                    session: eA,
                    result: el,
                    modelResponseMetadata: ep,
                  });
                  if (!0 === eu) {
                    ((eg = !0),
                      this.logger.info(
                        `[SessionManager][Gate] willRetry=true reason=interceptor session=${eA.id} interceptor=${ec.constructor?.name}`,
                      ));
                    break;
                  }
                } catch (eA: any) {
                  this.logger.warn("ModelResponseInterceptor error:", eA);
                }
          } catch (eA: any) {
            this.logger.warn(`Failed to run session interceptors: ${eA}`);
          }
        (this.logger.info(
          `[SessionManager][Gate] resolve willRetry=${eg} session=${eA.id}`,
        ),
          ec(eg));
        let ef: any = eA.telemetry
          ? {
              modelId: eA.telemetry.modelId,
              modelName: eA.telemetry.modelName,
              currentTurn: eA.telemetry.currentTurn,
              traceId: eA.telemetry.traceId,
            }
          : void 0;
        if (
          eg &&
          ((eh && AB.ErrorUtils.isRetryableModelError(eh)) ||
            (eh && AB.ErrorUtils.isStreamTimeoutError(eh)) ||
            (el.error && AB.ErrorUtils.isNetworkError(el.error)) ||
            eA.meta?.retryInProgress)
        )
          (this.logger.info(
            `[SessionManager] Skipping telemetry report — auto-retry in progress, session=${eA.id}, error=${eu?.message || eu?.constructor?.name || "none"}`,
          ),
            (eA.telemetry = void 0));
        else {
          try {
            await this.telemetryService.reportChatRequestResponseTelemetry(
              eA,
              el,
              ed,
              eu,
              ep,
            );
          } catch (eA: any) {
            this.logger.warn(
              "Failed to report agent execution end telemetry:",
              eA,
            );
          }
          if (
            (ed &&
              (this.galileoSessionBridge.emitRequestSuccess(eA, ef, ep),
              this.galileoSessionBridge.addRequestSuccessSpanEvent(eA, ef, ep)),
            !ed &&
              eu &&
              (this.galileoSessionBridge.emitRequestError(eA, ef, eu, ep),
              this.galileoSessionBridge.addRequestErrorSpanEvent(
                eA,
                ef,
                eu,
                ep,
              )),
            !ed)
          ) {
            try {
              let el: any = this.runtime.mapMessageErrorCode(eu) || "unknown";
              this.telemetryService.reportChatMessageStatus(eA, el, eu);
            } catch (eA: any) {
              this.logger.warn(
                "Failed to report chat message status telemetry:",
                eA,
              );
            }
            eu &&
              (this.galileoSessionBridge.emitMessageError(eA, ef, eu),
              this.galileoSessionBridge.addMessageErrorSpanEvent(eA, ef, eu));
          }
        }
      }
    });
    this.resultSubscriptions.set(eA.id, el);
  }
  async handleStreamRunResult(eA: any, el: any, ec: any): Promise<any> {
    let eu: any = eA.traceId,
      ed: any = eA.conversationRequestId,
      ep: any =
        eA.telemetry?.modelId ||
        eA.requestOptions?.model ||
        eA.options?.model ||
        "",
      eg: any = eA.telemetry?.modelName || "",
      eh: any = null,
      ef: any = !1,
      em: any = !1,
      eE: any = {
        Write: "file",
        Edit: "edits",
        MultiEdit: "edits",
        NotebookEdit: "notebook",
      },
      eC: any = this.runtime.createDraftStore();
    for await (let ey of this.runtime.createAbortableIterator(
      el[Symbol.asyncIterator](),
      eA.abortSignal,
      this.logger,
    )) {
      if (eA.abortSignal.aborted) {
        ((ec.finishReason = "aborted"),
          el.lastAgent?.emit("agent_end", el.state._context));
        break;
      }
      if ("run_item_stream_event" === ey.type) {
        if ("reasoning_item" === ey.item.type) {
          let el: any = ey.item.rawItem;
          (this.stampModelHistoryItemTimestamp(el),
            el.providerData || (el.providerData = {}),
            eA.traceId && (eu = eA.traceId),
            (el.providerData = {
              ...el.providerData,
              messageId: eA.messageId || "",
              model: ec.model || eA.telemetry?.modelId || "",
              requestModelId: ep,
              requestModelName: eg,
              ...(eu ? { traceId: eu } : {}),
              ...(ed ? { conversationRequestId: ed } : {}),
            }),
            await this.addHistory(eA, [{ ...el }]),
            eC.markCommitted(el));
        } else if ("tool_approval_item" !== ey.item.type) {
          let ef: any = ey.item.rawItem;
          (this.stampModelHistoryItemTimestamp(ef),
            "function_call" === ef.type || "function_call_result" === ef.type
              ? this.logger.debug(
                  `Received stream item type: ${ef.type}, callId: ${ef.callId}`,
                )
              : this.logger.debug(`Received stream item type: ${ef.type}`),
            ef.providerData || (ef.providerData = {}),
            eA.traceId && (eu = eA.traceId),
            (ef.providerData = {
              ...ef.providerData,
              messageId: eA.messageId || "",
              model: ec.model || eA.telemetry?.modelId || "",
              requestModelId: ep,
              requestModelName: eg,
              ...(eu ? { traceId: eu } : {}),
              ...(ed ? { conversationRequestId: ed } : {}),
            }));
          let em: any = !1;
          if (el.rawResponses) {
            let eA: any = el.rawResponses[el.rawResponses.length - 1];
            eA &&
              eA.output[eA.output.length - 1] === ef &&
              ((eh = ef), (em = !0));
          }
          let eE: any = { ...ef };
          (em &&
            ((eE.providerData = {
              ...eE.providerData,
              _isLastResponseItem: !0,
            }),
            ec.usage
              ? ((eE.providerData.rawUsage = ec.usage), (eh = null))
              : (eh = eE)),
            await this.addHistory(eA, [eE]),
            eC.markCommitted(ef));
        }
      } else if ("raw_model_stream_event" === ey.type) {
        if (
          (this.stampModelStreamEventTimestamp(ey.data),
          eC.ingestModelStreamEvent(ey.data),
          "model" === ey.data.type)
        ) {
          if (!ef) {
            let el: any = ey.data.event?.choices,
              ec: any = ey.data.event?.type;
            (el?.length ||
              (ec &&
                ("response.text.delta" === ec ||
                  "response.output_item.added" === ec ||
                  "response.function_call_arguments.delta" === ec))) &&
              ((ef = !0),
              this.stateMachine.transition(eA, {
                type: t4.SessionRunEventType.MODEL_STREAM_STARTED,
              }));
          }
          let el: any = ey.data.event?.model,
            eu: any = ey.data.event?.choices,
            ed: any = ey.data.event?.usage;
          if (
            (el &&
              ((ec.model = el),
              eA.meta || (eA.meta = {}),
              (eA.meta.responseModelId = el)),
            eu)
          )
            for (let el of eu) {
              if (!em && el.delta?.tool_calls?.length) {
                let ec: any = el.delta.tool_calls[0],
                  eu: any = ec.function?.name;
                if (eu) {
                  em = !0;
                  let el: any = eE[eu] || eu;
                  this.stateMachine.transition(eA, {
                    type: t4.SessionRunEventType.MODEL_STREAM_STARTED,
                    streamingToolName: el,
                  });
                }
              }
              if (el.finish_reason)
                if (
                  ((ec.finishReason = el.finish_reason),
                  eA.meta || (eA.meta = {}),
                  (eA.meta.lastFinishReason = el.finish_reason),
                  "content_filter" === el.finish_reason ||
                    "content-filter" === el.finish_reason)
                ) {
                  let eu: any = el.delta?.content || el.message?.content;
                  (eu && (ec.contentFilterMessage = eu),
                    (ec.contentFilterMessageId = eA.messageId));
                  let ed: any =
                    this.runtime.inputItemUtils.findLatestContentFilterCandidateUserMessageId(
                      eA.history,
                      eA.lastUserMessageId,
                    );
                  ed
                    ? (eA.meta.lastContentFilterUserMessageId = ed)
                    : delete eA.meta.lastContentFilterUserMessageId;
                } else delete eA.meta.lastContentFilterUserMessageId;
            }
          ed &&
            ((ec.usage = ed),
            this.logger.info(
              `[SessionManager][credit] Credit received: rootRequestId=${eA.meta?.rootRequestId ?? "unknown"}, source=raw_model_stream_event, credit=${this.formatCreditForLog(ed)}`,
            ),
            eh &&
              (eh.providerData || (eh.providerData = {}),
              (eh.providerData.rawUsage = ed),
              (eh = null)));
          let ep: any = ey.data.event;
          if (
            !em &&
            ep?.type === "response.output_item.added" &&
            ep.item?.type === "function_call" &&
            ep.item.name
          ) {
            em = !0;
            let el: any = eE[ep.item.name] || ep.item.name;
            this.stateMachine.transition(eA, {
              type: t4.SessionRunEventType.MODEL_STREAM_STARTED,
              streamingToolName: el,
            });
          }
        } else if ("response_done" === ey.data.type) {
          (this.stateMachine.transition(eA, {
            type: t4.SessionRunEventType.MODEL_RESPONSE_DONE,
          }),
            (ef = !1),
            (em = !1),
            ey.data.response.output.length <= 0 &&
              !eA.structuredOutput &&
              ((el.silentAbort = !0),
              this.logger.info(
                "Aborting session in session-manager, reason: empty response output from model",
              ),
              eA.abortController.abort()),
            (ey.data.response.id = eA.messageId || ""),
            eh &&
              ey.data.response?.usage &&
              (eh.providerData || (eh.providerData = {}),
              (eh.providerData.rawUsage = ey.data.response.usage),
              (eh = null)));
          let eu: any = ey.data.response?.usage;
          this.logger.info(
            `[SessionManager][credit] Credit received: rootRequestId=${eA.meta?.rootRequestId ?? "unknown"}, source=response_done, credit=${this.formatCreditForLog(eu)}`,
          );
          let ed: any = eu
            ? {
                ...eu,
                inputTokensDetails: Array.isArray(eu.inputTokensDetails)
                  ? eu.inputTokensDetails[0]
                  : eu.inputTokensDetails,
                outputTokensDetails: Array.isArray(eu.outputTokensDetails)
                  ? eu.outputTokensDetails[0]
                  : eu.outputTokensDetails,
              }
            : void 0;
          (this.telemetryService.reportMessageResponseTelemetryStream(
            eA,
            ed,
            ec,
            el.error,
          ),
            this.telemetryService.reportChatMessageStatus(eA, "0"),
            this.galileoSessionBridge.emitMessageSuccess(eA),
            this.galileoSessionBridge.addMessageSuccessSpanEvent(eA));
        }
        (eA.modelSubject.next(ey.data),
          eA.combineSubject.next({ type: "model", data: ey.data }));
      }
    }
    if (eA.abortSignal.aborted) {
      ec.finishReason ||
        ((ec.finishReason = "aborted"),
        el.lastAgent?.emit("agent_end", el.state._context));
      let eh: any = eC.flushAbortedItems({
        messageId: eA.messageId || "",
        model: ec.model || eA.telemetry?.modelId || "",
        timestamp: this.runtime.now(),
        requestModelId: ep,
        requestModelName: eg,
        traceId: eu,
        conversationRequestId: ed,
      });
      if (eh.length > 0)
        try {
          (this.logger.info(
            `[AbortedStreamDraftStore] handleStreamRunResult: persisting ${eh.length} partial item(s) after abort, sessionId=${eA.id}, types=[${eh.map((eA: any) => eA.type).join(", ")}]`,
          ),
            await this.addHistory(eA, eh));
        } catch (eA: any) {
          this.logger.warn?.(
            `[AbortedStreamDraftStore] handleStreamRunResult: failed to persist partial items after abort: ${eA}`,
          );
        }
    }
    ("content_filter" === ec.finishReason ||
      "content-filter" === ec.finishReason) &&
      ec.contentFilterMessageId &&
      (await this.handleContentFilteredResponse(eA, ec.contentFilterMessageId));
  }
  async handleContentFilteredResponse(eA: any, el: any): Promise<any> {
    try {
      if (
        (await this.flushHistory(eA),
        eA.history.some(
          (eA: any) =>
            this.runtime.inputItemUtils.isContentFilterNoticeItem(eA) &&
            eA.providerData?.messageId === el,
        ))
      )
        return;
      let ec: any = eA.history.find(
        (eA: any) =>
          eA.providerData?.messageId === el &&
          ("reasoning" === eA.type ||
            "function_call" === eA.type ||
            "function_call_result" === eA.type ||
            ("message" === eA.type && "assistant" === eA.role)),
      );
      if (!ec)
        return void this.logger.info(
          `[ContentFilter] no filtered items for messageId=${el}, skip fork`,
        );
      let eu: any = eA.meta?.lastContentFilterUserMessageId ?? ec.parentId,
        ed: any = this.runtime.inputItemUtils.createContentFilterNoticeMessage(
          el,
          ec.parentId,
          eu,
        );
      await this.addHistory(eA, [ed]);
      try {
        eA.historyReloadSubject.next({ reason: "content-filter" });
      } catch (eA: any) {
        this.logger.warn?.(
          `[ContentFilter] historyReloadSubject.next failed: ${eA}`,
        );
      }
      this.logger.info(
        `[ContentFilter] forked past filtered round messageId=${el}, notice.parentId=${ec.parentId ?? "none"}, strippedUserMessageId=${eu ?? "none"}, historyLen=${eA.history.length}`,
      );
    } catch (eA: any) {
      this.logger.warn?.(
        `[ContentFilter] handleContentFilteredResponse failed: ${eA}`,
      );
    }
  }
  async handleNonStreamRunResult(eA: any, el: any, ec: any): Promise<any> {
    for (let ec of el.newItems) await this.addHistory(eA, [ec.rawItem]);
  }
  release(sessionId: string) {
    this.resultSubscriptions.get(sessionId)?.unsubscribe();
    this.resultSubscriptions.delete(sessionId);
    const timer = this.idleTimers.get(sessionId);
    if (timer) this.runtime.clearTimeout(timer);
    this.idleTimers.delete(sessionId);
  }
}
