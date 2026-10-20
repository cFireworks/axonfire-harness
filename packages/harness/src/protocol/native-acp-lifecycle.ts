// @ts-nocheck
// Complete inert original factories/declarations; no decorators or application bootstrap.
export const ACP_LIFECYCLE_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const ACP_LIFECYCLE_FACTORIES = [
  [7357, 8111047, 8112283],
  [66742, 8112284, 8112812],
  [95449, 9945916, 9946023],
  [50523, 10942940, 10946207],
  [99006, 11182604, 11184892],
  [71389, 11184893, 11188078],
] as const;
export const ACP_LIFECYCLE_BLOCKS = [
  ["ed", 10518279, 10518724],
  ["eD", 12182230, 12182249],
  ["setLeadInboxPaused", 12182249, 12182312],
  ["isLeadInboxPaused", 12182312, 12182361],
  ["getRichQueueManager", 12182361, 12182466],
  ["pauseTeamLeadFollowUpDispatch", 12182466, 12182691],
  ["resumeTeamLeadFollowUpDispatch", 12182691, 12182903],
] as const;
export const ACP_EXTERNAL_URI_DECLARATION = ["ew", 10520446, 10520841] as const;
export function createNativeAcpLifecycle(runtime: any = {}) {
  const Date = runtime.Date ?? globalThis.Date;
  const modules: any = {},
    cache = new Map();
  const ec: any = (id: number) => {
    if (runtime.modules?.[id]) return runtime.modules[id];
    if (cache.has(id)) return cache.get(id).exports;
    if (factories[id]) {
      let m = { exports: {} };
      cache.set(id, m);
      factories[id](m, m.exports, ec);
      return m.exports;
    }
    return (
      runtime.getModule?.(id) ??
      new Proxy(
        {},
        {
          get(_target, key) {
            throw Error(
              "Explicit ACP lifecycle dependency required: " +
                id +
                "." +
                String(key),
            );
          },
        },
      )
    );
  };
  ec.r = (exports) =>
    Object.defineProperty(exports, "__esModule", { value: true });
  ec.d = (exports, defs) => {
    for (const key of Object.keys(defs))
      Object.defineProperty(exports, key, { enumerable: true, get: defs[key] });
  };
  const factories = {
    7357(eA, el, ec) {
      "use strict";
      (ec.r(el),
        ec.d(el, {
          extractCategoryFromErrorMessage: () =>
            extractCategoryFromErrorMessage,
          resolveTaskOutcome: () => resolveTaskOutcome,
        }));
      var eu = ec(66742);
      function resolveTaskOutcome(eA, el, ec) {
        if ("cancelled" === eA && isPermissionDenial(el))
          return "PERMISSION_DENIED";
        let ed = extractCategoryFromErrorMessage(el),
          ep = "cancelled" === eA,
          eg = "refusal" === eA && isContentPolicyRefusal(ed),
          eh = "end_turn" === eA,
          ef = "max_turn_requests" === eA,
          em =
            ec.modelErrorCount > ec.modelSuccessAfterErrorCount ||
            ("refusal" === eA && isModelRequestFailure(ed)),
          eE = ec.toolErrorCount > 0;
        return (0, eu.determineTaskOutcome)({
          hasFinalAnswer: eh,
          hasUnrecoveredModelError: em,
          hasUnrecoveredToolError: eE,
          wasCancelled: ep,
          hitLoopLimit: ef,
          wasRefused: eg,
        });
      }
      function isPermissionDenial(eA) {
        return !!eA && eA.startsWith("Permission denied for tool");
      }
      function isContentPolicyRefusal(eA) {
        return !eA || "content_filter" === eA || !ed.has(eA);
      }
      function isModelRequestFailure(eA) {
        return !!eA && ed.has(eA);
      }
      let ed = new Set([
        "network",
        "quota",
        "model_service",
        "auth",
        "custom_model_auth",
        "internal",
      ]);
      function extractCategoryFromErrorMessage(eA) {
        if (eA)
          try {
            let el = JSON.parse(eA);
            if (el?.data?.category) return el.data.category;
            if (el?.error?.data?.category) return el.error.data.category;
            return;
          } catch {
            return;
          }
      }
    },
    66742(eA, el, ec) {
      "use strict";
      function determineTaskOutcome(eA) {
        return eA.wasCancelled
          ? "CANCELLED"
          : eA.wasRefused
            ? "REFUSED_OR_BLOCKED"
            : !eA.hasFinalAnswer ||
                eA.hasUnrecoveredModelError ||
                eA.hasUnrecoveredToolError
              ? eA.hasFinalAnswer &&
                (eA.hasUnrecoveredModelError || eA.hasUnrecoveredToolError)
                ? "PARTIAL_SUCCESS"
                : eA.hasUnrecoveredModelError
                  ? "FAILED_MODEL_REQUEST"
                  : eA.hasUnrecoveredToolError
                    ? "FAILED_TOOL_EXECUTION"
                    : eA.hitLoopLimit
                      ? "FAILED_AGENT_LOOP"
                      : "UNKNOWN"
              : "SUCCESS";
      }
      (ec.r(el),
        ec.d(el, { determineTaskOutcome: () => determineTaskOutcome }));
    },
    95449(eA, el, ec) {
      "use strict";
      (ec.r(el), ec.d(el, { ReferenceService: () => eu }));
      let eu = Symbol("ReferenceService");
    },
    50523(eA, el, ec) {
      "use strict";
      (ec.r(el),
        ec.d(el, {
          cancelSessionRuntimeState: () => cancelSessionRuntimeState,
        }));
      var eu = ec(69466),
        ed = ec(24618);
      function cancelSessionRuntimeState(eA, el, ec) {
        let {
            interruptionService: ep,
            acpBroadcastService: eg,
            taskStorage: eh,
            logger: ef,
          } = ec,
          em = eA.id;
        ef?.info(
          `[cancelSessionRuntimeState] sessionId=${em}, reason=${el} — begin cleanup`,
        );
        try {
          ep.cancelAllForSession(em, el);
        } catch (eA) {
          ef?.warn?.(
            `[cancelSessionRuntimeState] interruption cancel failed, sessionId=${em}, err=${formatErr(eA)}`,
          );
        }
        try {
          let el = eA.permissionModeSubject?.value === ed.PermissionMode.Plan,
            ec = eA.meta?.prePlanPermissionMode;
          (ef?.info(
            `[cancelSessionRuntimeState] plan mode check: sessionId=${em}, inPlanMode=${el}, savedPre=${ec ?? "undefined"}, currentMode=${eA.permissionModeSubject?.value}`,
          ),
            el
              ? (void 0 !== ec
                  ? (eA.permissionModeSubject.next(ec),
                    delete eA.meta.prePlanPermissionMode)
                  : eA.permissionModeSubject.next(ed.PermissionMode.Default),
                ef?.info(
                  `[cancelSessionRuntimeState] exited plan mode, sessionId=${em}, restoredTo=${ec ?? "default"}`,
                ))
              : void 0 !== ec &&
                (delete eA.meta.prePlanPermissionMode,
                ef?.info(
                  `[cancelSessionRuntimeState] not in plan mode, cleaned leftover prePlanPermissionMode=${ec}, sessionId=${em}`,
                )));
        } catch (eA) {
          ef?.warn?.(
            `[cancelSessionRuntimeState] plan mode exit failed, sessionId=${em}, err=${formatErr(eA)}`,
          );
        }
        (eh &&
          markInProgressTasksAsCancelled(eh, em, el, ef).catch((eA) => {
            ef?.warn?.(
              `[cancelSessionRuntimeState] todo cancel failed, sessionId=${em}, err=${formatErr(eA)}`,
            );
          }),
          eg &&
            eg.broadcastToolCallFailedForSession(em, el).catch((eA) => {
              ef?.warn?.(
                `[cancelSessionRuntimeState] tool broadcast failed, sessionId=${em}, err=${formatErr(eA)}`,
              );
            }),
          eg &&
            (!0 === eA.isCompressing ||
              eA.resultSubject?.value?.lastAgent?.name ===
                eu.AgentNames.COMPACT) &&
            eg.broadcastCompactCancelled(em).catch((eA) => {
              ef?.warn?.(
                `[cancelSessionRuntimeState] compact-cancelled broadcast failed, sessionId=${em}, err=${formatErr(eA)}`,
              );
            }));
        try {
          if (eA.queue && eA.queue.length > 0) {
            let el = eA.queue.length;
            ((eA.lastCancelledQueue = eA.queue.slice()),
              ef?.info(
                `[cancelSessionRuntimeState] preserved ${el} queued message(s) for auto-resume, sessionId=${em}, snapshot also written to session.lastCancelledQueue`,
              ));
          }
        } catch (eA) {
          ef?.warn?.(
            `[cancelSessionRuntimeState] queue snapshot failed, sessionId=${em}, err=${formatErr(eA)}`,
          );
        }
        eA.isCompressing &&
          ((eA.isCompressing = !1),
          ef?.info(
            `[cancelSessionRuntimeState] isCompressing reset, sessionId=${em}`,
          ));
        try {
          eA.progressSubject?.next(void 0);
        } catch (eA) {
          ef?.warn?.(
            `[cancelSessionRuntimeState] progress reset failed, sessionId=${em}, err=${formatErr(eA)}`,
          );
        }
        ef?.info(
          `[cancelSessionRuntimeState] sessionId=${em}, reason=${el} — cleanup complete`,
        );
      }
      async function markInProgressTasksAsCancelled(eA, el, ec, eu) {
        let ed;
        try {
          ed = await eA.list(el);
        } catch (eA) {
          eu?.debug?.(
            `[cancelSessionRuntimeState] task list unavailable, sessionId=${el}, err=${formatErr(eA)}`,
          );
          return;
        }
        let ep = ed.filter((eA) => "in_progress" === eA.status);
        if (0 === ep.length) return;
        let eg = Date.now();
        (await Promise.allSettled(
          ep.map((eu) =>
            eA.update(el, eu.id, {
              metadata: {
                ...(eu.metadata ?? {}),
                cancelled: !0,
                cancelReason: ec,
                cancelledAt: eg,
              },
            }),
          ),
        ),
          eu?.info(
            `[cancelSessionRuntimeState] marked ${ep.length} in_progress task(s) as cancelled via metadata, sessionId=${el}, reason=${ec}`,
          ));
      }
      function formatErr(eA) {
        return eA instanceof Error ? eA.message : String(eA);
      }
    },
    99006(eA, el, ec) {
      "use strict";
      (ec.r(el),
        ec.d(el, {
          AgentInputItemProcessor: () => eE,
          AgentInputItemProcessorPriority: () => eu,
          AgentPhaseUtils: () => eR,
          CURRENT_CHAT_SESSION: () => ev,
          INPUT_HISTORY_STORAGE_FILE: () => ek,
          IdleQueueDrainService: () => eI,
          InputHistoryService: () => e_,
          InterruptionService: () => ey,
          META_TOKEN_CALCULATION_CALLBACK: () => eD,
          META_TOKEN_CALCULATION_REQUEST: () => eQ,
          MessageQueueManager: () => ew,
          ModelResponseInterceptor: () => eB,
          RunItemProcessor: () => eC,
          SESSION_MIDDLEWARE_PRIORITY: () => eS,
          SessionFactory: () => ep,
          SessionHistoryCleanService: () => ef,
          SessionHookManager: () => em,
          SessionManager: () => eg,
          SessionStore: () => eh,
        }));
      var eu,
        ed = ec(47005);
      let ep = Symbol("SessionFactory"),
        eg = Symbol("SessionManager"),
        eh = Symbol("SessionStore"),
        ef = Symbol("SessionHistoryCleanService"),
        em = Symbol("SessionHookManager"),
        eE = Symbol("AgentInputItemProcessor"),
        eC = Symbol("RunItemProcessor"),
        ey = Symbol("InterruptionService"),
        ew = Symbol("MessageQueueManager"),
        eB = Symbol("ModelResponseInterceptor"),
        e_ = Symbol("InputHistoryService"),
        eI = Symbol("IdleQueueDrainService"),
        ev = "current-chat-session",
        eS = ed.BODY_MIDDLEWARE_PRIORITY - 100,
        eQ = "__token_calculation_request__",
        eD = "__token_calculation_callback__",
        eT = {
          preparing: "preparing",
          model_requesting: "waiting for model",
          model_streaming: "streaming",
          model_done: "processing",
          tool_executing: "running tool",
          waiting_for_permission: "waiting for permission",
          waiting_for_user: "waiting for user",
          retrying: "retrying",
          finalization_file_projection_sync: null,
          finalization_file_projection_sync_notify: "syncing file projection",
          idle: null,
        },
        eR = {
          create: (eA, el) => ({
            phase: eA,
            startedAt: Date.now(),
            ...(el ? { toolName: el } : {}),
          }),
          emit(eA, el, ec) {
            eA?.phaseSubject?.next(eR.create(el, ec));
          },
          getLabel(eA) {
            if (eA) {
              if ("tool_executing" === eA.phase && eA.toolName)
                return `running ${eA.toolName}`;
              if ("model_streaming" === eA.phase && eA.streamingToolName) {
                let el = eA.streamingToolName;
                return "file" === el
                  ? "writing file"
                  : "edits" === el
                    ? "editing"
                    : "notebook" === el
                      ? "editing notebook"
                      : `writing ${el}`;
              }
              return eT[eA.phase] ?? void 0;
            }
          },
        };
      !(function (eA) {
        ((eA[(eA.Default = 10)] = "Default"),
          (eA[(eA.ParentIdLinkage = 9)] = "ParentIdLinkage"),
          (eA[(eA.FunctionCall = 8)] = "FunctionCall"),
          (eA[(eA.FunctionCallResult = 7)] = "FunctionCallResult"),
          (eA[(eA.UsageProcessor = 6)] = "UsageProcessor"),
          (eA[(eA.Telemetry = 5)] = "Telemetry"),
          (eA[(eA.ExitPlanMode = 4)] = "ExitPlanMode"));
      })(eu || (eu = {}));
      let ek = "history.jsonl";
    },
    71389(eA, el, ec) {
      "use strict";
      var eu, ed, ep, eg, eh;
      (ec.r(el),
        ec.d(el, {
          SESSION_RUN_STATE_PROJECTION_SCHEMA: () => eE,
          SessionRunEventType: () => ep,
          SessionRunLegacyAgentState: () => eg,
          SessionRunLifecycle: () => ed,
          SessionRunProjectedPhase: () => eh,
          SessionRunStateMachine: () => ef,
          SessionRunStateProjectionService: () => em,
          SessionRunStatus: () => eu,
          deriveSessionRunLifecycle: () => deriveSessionRunLifecycle,
          isSessionRunStatusBusy: () => isSessionRunStatusBusy,
          isSessionRunStatusBusyForQueue: () => isSessionRunStatusBusyForQueue,
          isSessionRunStatusIdle: () => isSessionRunStatusIdle,
        }));
      let ef = Symbol("SessionRunStateMachine"),
        em = Symbol("SessionRunStateProjectionService"),
        eE = "session-run-state.v1";
      function deriveSessionRunLifecycle(eA) {
        switch (eA) {
          case eu.IDLE:
            return ed.IDLE;
          case eu.PREPARING:
          case eu.PENDING:
            return ed.PREPARING;
          case eu.WAITING_FOR_PERMISSION:
          case eu.WAITING_FOR_USER:
            return ed.WAITING;
          case eu.RETRYING:
            return ed.RETRYING;
          case eu.COMPACTING:
            return ed.COMPACTING;
          case eu.CANCELLING:
            return ed.CANCELLING;
          case eu.AGENT_RUNNING:
          case eu.MODEL_REQUESTING:
          case eu.MODEL_STREAMING:
          case eu.MODEL_DONE:
          case eu.TOOL_EXECUTING:
            return ed.RUNNING;
        }
      }
      function isSessionRunStatusBusy(eA) {
        return eA !== eu.IDLE;
      }
      function isSessionRunStatusIdle(eA) {
        return eA === eu.IDLE;
      }
      function isSessionRunStatusBusyForQueue(eA) {
        return eA !== eu.IDLE && eA !== eu.PREPARING;
      }
      (!(function (eA) {
        ((eA.IDLE = "idle"),
          (eA.PREPARING = "preparing"),
          (eA.PENDING = "pending"),
          (eA.AGENT_RUNNING = "agent_running"),
          (eA.MODEL_REQUESTING = "model_requesting"),
          (eA.MODEL_STREAMING = "model_streaming"),
          (eA.MODEL_DONE = "model_done"),
          (eA.TOOL_EXECUTING = "tool_executing"),
          (eA.WAITING_FOR_PERMISSION = "waiting_for_permission"),
          (eA.WAITING_FOR_USER = "waiting_for_user"),
          (eA.RETRYING = "retrying"),
          (eA.COMPACTING = "compacting"),
          (eA.CANCELLING = "cancelling"));
      })(eu || (eu = {})),
        (function (eA) {
          ((eA.IDLE = "idle"),
            (eA.PREPARING = "preparing"),
            (eA.RUNNING = "running"),
            (eA.WAITING = "waiting"),
            (eA.RETRYING = "retrying"),
            (eA.COMPACTING = "compacting"),
            (eA.CANCELLING = "cancelling"));
        })(ed || (ed = {})),
        (function (eA) {
          ((eA.RUN_PREPARING = "RUN_PREPARING"),
            (eA.RUN_ACCEPTED = "RUN_ACCEPTED"),
            (eA.RUN_SKIPPED = "RUN_SKIPPED"),
            (eA.AGENT_STARTED = "AGENT_STARTED"),
            (eA.AGENT_ENDED = "AGENT_ENDED"),
            (eA.TOOL_STARTED = "TOOL_STARTED"),
            (eA.TOOL_ENDED = "TOOL_ENDED"),
            (eA.AGENT_HANDOFF = "AGENT_HANDOFF"),
            (eA.MODEL_REQUEST_STARTED = "MODEL_REQUEST_STARTED"),
            (eA.MODEL_STREAM_STARTED = "MODEL_STREAM_STARTED"),
            (eA.MODEL_RESPONSE_DONE = "MODEL_RESPONSE_DONE"),
            (eA.WAITING_FOR_PERMISSION = "WAITING_FOR_PERMISSION"),
            (eA.WAITING_FOR_USER = "WAITING_FOR_USER"),
            (eA.RETRYING = "RETRYING"),
            (eA.COMPACT_STARTED = "COMPACT_STARTED"),
            (eA.COMPACT_ENDED = "COMPACT_ENDED"),
            (eA.COMPACT_FAILED = "COMPACT_FAILED"),
            (eA.CANCEL_REQUESTED = "CANCEL_REQUESTED"),
            (eA.RUN_FAILED = "RUN_FAILED"),
            (eA.FORCE_IDLE = "FORCE_IDLE"));
        })(ep || (ep = {})),
        (function (eA) {
          ((eA.AGENT_PENDING = "agent_pending"),
            (eA.AGENT_START = "agent_start"),
            (eA.AGENT_TOOL_START = "agent_tool_start"),
            (eA.AGENT_TOOL_END = "agent_tool_end"),
            (eA.AGENT_HANDOFF = "agent_handoff"),
            (eA.AGENT_END = "agent_end"));
        })(eg || (eg = {})),
        (function (eA) {
          ((eA.IDLE = "idle"),
            (eA.PREPARING = "preparing"),
            (eA.MODEL_REQUESTING = "model_requesting"),
            (eA.MODEL_STREAMING = "model_streaming"),
            (eA.MODEL_DONE = "model_done"),
            (eA.TOOL_EXECUTING = "tool_executing"),
            (eA.WAITING_FOR_PERMISSION = "waiting_for_permission"),
            (eA.WAITING_FOR_USER = "waiting_for_user"),
            (eA.RETRYING = "retrying"));
        })(eh || (eh = {})));
    },
  };
  const capability = (() => {
    let ed = "CODEBUDDY_HOST_CAPABILITIES",
      ep = {
        ELICITATION_FORM: "elicitation.form",
        WEIXINPAY_INTERCEPTION: "weixinpay.interception",
      },
      eg = class {
        constructor() {
          this.capabilities = new Set();
        }
        markElicitationForm() {
          this.capabilities.add(ep.ELICITATION_FORM);
        }
        markWeixinpayInterception() {
          this.capabilities.add(ep.WEIXINPAY_INTERCEPTION);
        }
        has(eA) {
          return this.capabilities.has(eA);
        }
        toEnvValue() {
          return this.capabilities.size > 0
            ? [...this.capabilities].join(",")
            : void 0;
        }
      };
    return {
      HOST_CAPABILITIES_ENV: ed,
      HOST_CAPABILITY: ep,
      HostCapabilityProvider: eg,
    };
  })();
  const team = (() => {
    const eg = ec(80699),
      eB = ec(74272);
    let eD = new WeakSet();
    function setLeadInboxPaused(eA, el) {
      el ? eD.add(eA) : eD.delete(eA);
    }
    function isLeadInboxPaused(eA) {
      return eD.has(eA);
    }
    function getRichQueueManager() {
      try {
        return eg.ContainerUtil.get(eB.RichMessageQueueManager);
      } catch {
        return;
      }
    }
    function pauseTeamLeadFollowUpDispatch(eA) {
      setLeadInboxPaused(eA, !0);
      let el = getRichQueueManager();
      if (!el) return;
      let ec = el.getQueue(eA.id);
      ec &&
        (!ec.runtime?.paused || "cancel" === ec.runtime.pauseReason) &&
        el.pause(eA.id, "cancel");
    }
    function resumeTeamLeadFollowUpDispatch(eA) {
      setLeadInboxPaused(eA, !1);
      let el = getRichQueueManager();
      if (!el) return;
      let ec = el.getQueue(eA.id);
      ec?.runtime?.paused &&
        "cancel" === ec.runtime.pauseReason &&
        el.resume(eA.id);
    }
    return {
      setLeadInboxPaused,
      isLeadInboxPaused,
      pauseTeamLeadFollowUpDispatch,
      resumeTeamLeadFollowUpDispatch,
    };
  })();
  const uri = (() => {
    const eC = ec(92537),
      ey = ec(93039);
    let ew = class {
      constructor() {
        this.urlSubject = new eC.Subject();
      }
      async open(eA) {
        (this.logger.info(
          `[CliExternalUriOpener] Attempting to open URI: ${eA}`,
        ),
          this.urlSubject.next(eA));
        try {
          let el = await ey.UrlUtils.openUrl(eA);
          return (
            this.logger.info(
              `[CliExternalUriOpener] UrlUtils.openUrl result: ${el}`,
            ),
            el
          );
        } catch (eA) {
          return (
            this.logger.error(
              `[CliExternalUriOpener] open external link error: ${eA}`,
            ),
            !1
          );
        }
      }
    };
    return ew;
  })();
  return {
    getModule: ec,
    capability,
    team,
    CliExternalUriOpener: uri,
    cancelSessionRuntimeState: ec(50523).cancelSessionRuntimeState,
  };
}
