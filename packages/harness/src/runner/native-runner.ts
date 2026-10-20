// @ts-nocheck
// Complete inert original RunnerFactory, RunnerProvider and loop detector.
// No decorators/bootstrap; SDK/jsonrepair/parent services are explicit dependencies.
export const NATIVE_RUNNER_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const NATIVE_RUNNER_SCOPES = [
  {
    "scope": "factory",
    "module": 43843,
    "root": "eP",
    "blocks": [
      ["eM", 7212018, 7212992],
      ["buildTruncationRetryMessage", 7212992, 7213282],
      ["eP", 7213282, 7219793],
    ],
    "classes": [["eP", 7213289, 7219792, 5]],
    "bindings": [
      ["eB", 28894],
      ["eC", 80699],
      ["eD", 69466],
      ["eQ", 93039],
      ["eR", 18553],
      ["eT", 77787],
      ["e_", 67330],
      ["ev", 71915],
    ],
    "initializers": [
      ["eM", 7212025, 7212104],
      ["ex", 7212108, 7212138],
      ["eO", 7212142, 7212885],
      ["eN", 7212889, 7212991],
    ],
    "functions": [["buildTruncationRetryMessage", 7212992, 7213282]],
    "statics": [],
    "exports": [
      ["RunnerFactoryImpl", "eP", 7211279, 7211285],
      ["TRUNCATION_RETRY_MARKER", "eM", 7211310, 7211316],
    ],
  },
  {
    "scope": "provider",
    "module": 66545,
    "root": "rd",
    "blocks": [["rd", 7067470, 7067577]],
    "classes": [["rd", 7067477, 7067576, 1]],
    "bindings": [],
    "initializers": [],
    "functions": [],
    "statics": [],
    "exports": [["RunnerProviderImpl", "rd", 7014136, 7014142]],
  },
  {
    "scope": "loop",
    "module": 66545,
    "root": "n8",
    "blocks": [["nX", 7206973, 7210302]],
    "classes": [["n8", 7207144, 7210301, 9]],
    "bindings": [["nZ", 40038]],
    "initializers": [
      ["nX", 7206980, 7206981],
      ["n0", 7206985, 7206987],
      ["n1", 7206991, 7206993],
      ["n2", 7206997, 7207003],
      ["n3", 7207007, 7207052],
      ["n4", 7207056, 7207140],
    ],
    "functions": [],
    "statics": [],
    "exports": [["ToolCallLoopDetectorImpl", "n8", 7016812, 7016818]],
  },
] as const;
export const NATIVE_RUNNER_FACTORIES = [
  [40038, 7221395, 7221560],
  [67330, 7684418, 7687591],
  [3927, 13322684, 13323238],
] as const;
export function createNativeRunner(runtime: any = {}) {
  const process: any = { env: runtime.env ?? {} };
  const Date = runtime.Date ?? globalThis.Date;
  const setImmediate = runtime.setImmediate ?? globalThis.setImmediate;
  const cache = new Map(),
    factories: any = {
      40038(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            LOOP_DETECTION_MARKER: () => ed,
            ToolCallLoopDetector: () => eu,
          }));
        let eu = Symbol("ToolCallLoopDetector"),
          ed = "[LOOP_DETECTED]";
      },
      67330(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            ACP_META_COMPACT_CANCELLED: () => ex,
            ACP_META_COMPACT_LIMIT_REACHED: () => eO,
            ACP_META_COMPACT_TYPE: () => eD,
            ACP_META_CONTENT_FILTER_NOTICE: () => ek,
            ACP_META_IS_SUB_AGENT: () => eT,
            ACP_META_PARENT_SESSION_ID: () => eR,
            COMPACT_PROMPT: () => em,
            CompactStrategy: () => eP,
            CompactType: () => eu,
            ContextCompactSummarizer: () => eh,
            DEFAULT_MAX_CONSECUTIVE_COMPACT: () => eN,
            DEFAULT_TOKEN_THRESHOLD: () => eE,
            DEFAULT_WARNING_THRESHOLD: () => eC,
            PromptContextInitializer: () => eg,
            PromptContextProvider: () => ep,
            PromptRenderer: () => ef,
            SESSION_META_COMPACT_CANCELLED: () => eM,
            SESSION_META_COMPACT_CONTINUE_IN_PROGRESS: () => ev,
            SESSION_META_COMPACT_EXPECTS_CONTINUE: () => eI,
            SESSION_META_COMPACT_TYPE: () => e_,
            SESSION_META_PRE_MESSAGE_COMPACT_ENDED: () => eS,
            SESSION_META_PRE_MESSAGE_COMPACT_ERROR_MESSAGE: () => eQ,
            getAutoCompactWindow: () => getAutoCompactWindow,
            getAutocompactThresholdOverride: () =>
              getAutocompactThresholdOverride,
            getEngineeringCompactSufficiencyRatio: () =>
              getEngineeringCompactSufficiencyRatio,
            getPreMessageCompactThresholdOverride: () =>
              getPreMessageCompactThresholdOverride,
            resolveCompactTriggerAt: () => resolveCompactTriggerAt,
            resolvePreMessageCompactEnabled: () =>
              resolvePreMessageCompactEnabled,
            withCompactGeneration: () => withCompactGeneration,
          }));
        var eu,
          ed = ec(3927);
        let ep = Symbol("PromptContextProvider"),
          eg = Symbol("PromptContextInitializer"),
          eh = Symbol("ContextCompactSummarizer"),
          ef = Symbol("PromptRenderer"),
          em = "compact-prompt",
          eE = 0.7,
          eC = 0.5;
        function getAutocompactThresholdOverride() {
          let eA = process.env.CODEBUDDY_AUTOCOMPACT_PCT_OVERRIDE;
          if (!eA) return;
          let el = parseInt(eA, 10);
          if (!isNaN(el) && !(el < 1) && !(el > 100)) return el / 100;
        }
        function getPreMessageCompactThresholdOverride() {
          let eA = process.env.CODEBUDDY_PRE_MESSAGE_COMPACT_PCT;
          if (!eA) return;
          let el = parseInt(eA, 10);
          if (!isNaN(el) && !(el < 1) && !(el > 100)) return el / 100;
        }
        function getEngineeringCompactSufficiencyRatio() {
          let eA = process.env.CODEBUDDY_ENGINEERING_COMPACT_SUFFICIENCY_PCT;
          if (!eA) return 0.15;
          let el = parseInt(eA, 10);
          return isNaN(el) || el < 1 || el > 100 ? 0.15 : el / 100;
        }
        function resolvePreMessageCompactEnabled(eA) {
          let el = process.env.CODEBUDDY_PRE_MESSAGE_COMPACT;
          if (void 0 !== el && "" !== el) return "true" === el || "1" === el;
          if (!eA) return !1;
          let ec = eA.enablePreMessageCompact;
          return "boolean" == typeof ec ? ec : !0 === eA.ContextSummaryAgent;
        }
        let ey = 2e5,
          ew = 1e5,
          eB = 1e6;
        function getAutoCompactWindow() {
          let eA = ed.NumberUtils.parsePositiveInteger(
            process.env.CODEBUDDY_AUTO_COMPACT_WINDOW,
          );
          return ed.NumberUtils.clamp(eA ?? ey, ew, eB);
        }
        function resolveCompactTriggerAt(eA, el) {
          return eA ? eA * el : getAutoCompactWindow();
        }
        !(function (eA) {
          ((eA.USER_COMMAND = "user-command"),
            (eA.PRE_MESSAGE_AUTO = "pre-message-auto"),
            (eA.EMERGENCY_AUTO = "emergency-auto"));
        })(eu || (eu = {}));
        let e_ = "compactType",
          eI = "compactExpectsContinue",
          ev = "compactContinueInProgress",
          eS = "preMessageCompactEnded",
          eQ = "preMessageCompactErrorMessage",
          eD = "codebuddy.ai/compactType",
          eT = "codebuddy.ai/isSubAgent",
          eR = "codebuddy.ai/parentSessionId",
          ek = "codebuddy.ai/contentFilterNotice",
          eM = "compactCancelled",
          ex = "codebuddy.ai/compact-cancelled",
          eO = "codebuddy.ai/compact-limit-reached",
          eN = 5;
        function withCompactGeneration(eA, el) {
          let ec = el?.compactMessageGeneration ?? 0;
          return !eA || ec <= 0 ? eA : `${eA}-c${ec}`;
        }
        let eP = Symbol("CompactStrategy");
      },
      3927(eA, el, ec) {
        "use strict";
        (ec.r(el), ec.d(el, { NumberUtils: () => NumberUtils }));
        let NumberUtils = class NumberUtils {
          static clamp(eA, el, ec) {
            if (!Number.isFinite(eA))
              throw Error("Value to clamp must be a finite number");
            if (!Number.isFinite(el) || !Number.isFinite(ec))
              throw Error("Clamp bounds must be finite numbers");
            if (el > ec)
              throw Error("Clamp minimum cannot be greater than maximum");
            return eA < el ? el : eA > ec ? ec : eA;
          }
          static parsePositiveInteger(eA) {
            if (null == eA) return;
            let el = "number" == typeof eA ? eA : Number(eA);
            if (Number.isFinite(el) && !(el <= 0)) return Math.floor(el);
          }
        };
      },
    };
  const ec: any = (id: number) => {
    if (runtime.modules?.[id] !== undefined) return runtime.modules[id];
    if (cache.has(id)) return cache.get(id).exports;
    if (factories[id]) {
      const m = { exports: {} };
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
              "Explicit native Runner dependency required: " +
                id +
                "." +
                String(key),
            );
          },
        },
      )
    );
  };
  ec.r = (exports: any) =>
    Object.defineProperty(exports, "__esModule", { value: true });
  ec.d = (exports: any, defs: any) => {
    for (const key of Object.keys(defs))
      Object.defineProperty(exports, key, { enumerable: true, get: defs[key] });
  };
  const factory = (() => {
    const eB = ec(28894);
    const eC = ec(80699);
    const eD = ec(69466);
    const eQ = ec(93039);
    const eR = ec(18553);
    const eT = ec(77787);
    const e_ = ec(67330);
    const ev = ec(71915);
    let eM =
        "Do NOT repeat the same oversized tool call. Break it into smaller operations.",
      ex = "[TRUNCATION_RETRY_EXHAUSTED]",
      eO = {
        Write:
          "The Write tool call was too large. Instead of writing the entire file at once, use multiple Edit calls to make changes incrementally. First Read the file if you haven't already, then apply individual Edit operations for each change.",
        MultiEdit:
          "The MultiEdit tool call was too large. Split the edits into multiple separate Edit calls, each modifying one section at a time. Do NOT try to put all edits into a single MultiEdit call.",
        Edit: "The Edit tool call was too large. Use a smaller old_string that uniquely identifies the target location with minimal surrounding context, and keep new_string focused on only the changed content.",
        Bash: "The Bash command was too long. Break it into multiple shorter commands executed sequentially.",
      },
      eN =
        "The tool call was too large and got truncated. Break the operation into multiple smaller tool calls.";
    function buildTruncationRetryMessage(eA) {
      let el = [
          "Your previous response was truncated due to output length limits.",
          "",
        ],
        ec = new Set();
      for (let eu of eA) {
        let eA = eO[eu];
        eA && !ec.has(eA) && (el.push(eA), el.push(""), ec.add(eA));
      }
      return (
        0 === ec.size && (el.push(eN), el.push("")),
        el.push(eM),
        el.join("\n")
      );
    }
    let eP = class {
      async create(eA) {
        return new eR.Runner({
          modelProvider: this.modelProvider,
          callModelInputFilter: async ({ modelData: eA }) => {
            let el,
              ec = this.toolCallLoopDetector.check(eA);
            if (ec) {
              let eA =
                this.sessionManager.getCurrent() ||
                this.sessionManager.sessionSubject?.getValue();
              if (eA)
                try {
                  await this.telemetryService.reportUserTaskFailedCreditRefund(
                    eA,
                    "loop_detected",
                  );
                } catch (eA) {
                  this.logger.warn(
                    "[RunnerFactory] Failed to report credit refund loop detection telemetry:",
                    eA,
                  );
                }
              return ec;
            }
            await this.checkAutoCompact();
            let eu = this.filterTruncatedToolCalls(eA);
            await this.injectSendNowItems(eu);
            try {
              (el =
                this.sessionManager.getCurrent() ||
                this.sessionManager.sessionSubject?.getValue()) &&
                !(0, eT.isAuxiliaryPurpose)(el.agentPurpose) &&
                this.stateMachine.transition(el, {
                  type: ev.SessionRunEventType.MODEL_REQUEST_STARTED,
                });
            } catch (eA) {
              this.logger.warn(
                `[RunnerFactory] Failed to emit MODEL_REQUEST_STARTED before model request, sessionId=${el?.id ?? "unknown"}`,
                eA,
              );
            }
            return eu;
          },
        });
      }
      async checkAutoCompact() {
        try {
          let eA =
            this.sessionManager.getCurrent() ||
            this.sessionManager.sessionSubject?.getValue();
          if (!eA) return;
          let el = eC.ContainerUtil.get(e_.ContextCompactSummarizer);
          (await this.shouldCompact(eA, el)) &&
            setImmediate(async () => {
              try {
                await el.compactAndSummarize(eA, {
                  force: !0,
                  type: e_.CompactType.EMERGENCY_AUTO,
                });
              } catch (eA) {
                this.logger.warn(
                  "[checkAutoCompact] Deferred compaction failed:",
                  eA,
                );
              }
            });
        } catch (eA) {
          this.logger.warn("[checkAutoCompact] Auto compact check failed:", eA);
        }
      }
      async injectSendNowItems(eA) {}
      async shouldCompact(eA, el) {
        try {
          if (eA.isCompressing || eA.abortSignal?.aborted) return !1;
          if (
            eA.lastCompactTimestamp &&
            Date.now() - eA.lastCompactTimestamp < 3e4
          )
            return (
              this.logger.info(
                `[shouldCompact] Skip: cooldown (${((Date.now() - eA.lastCompactTimestamp) / 1e3).toFixed(1)}s since last compact)`,
              ),
              !1
            );
          let el = await this.productManager.waitConfiguration(),
            ec = eQ.SessionUtils.isSubAgent(eA),
            eu =
              (0, e_.getAutocompactThresholdOverride)() ??
              (ec
                ? (el?.tokenUsageThresholds?.inputTokens?.subAgentEmergency ??
                  el?.tokenUsageThresholds?.inputTokens?.emergency ??
                  0.92)
                : (el?.tokenUsageThresholds?.inputTokens?.emergency ?? 0.92)),
            { history: ed, resultSubject: ep } = eA;
          if (
            !ed ||
            0 === ed.length ||
            ep?.value?.lastAgent?.name === eD.AgentNames.COMPACT
          )
            return !1;
          let eg = eQ.UsageUtils.getLatestUsage(eA),
            eh = eg?.inputTokens ?? 0;
          if (eh > 0 && ed.length > 0) {
            let eA = eQ.TokenUtils.estimateTrailingToolResultTokens(ed);
            eA > 0 &&
              ((eh += eA),
              this.logger.info(
                `[shouldCompact] Added trailing tool result tokens: +${eA}, totalTokens=${eh}, isSubAgent=${ec}, threshold=${(100 * eu).toFixed(1)}%`,
              ));
          }
          if (ec) {
            let el =
                eA.agentName ||
                ep?.value?.lastAgent?.name ||
                (await this.agentManager.getDefault()).name,
              ec = await this.agentManager.getModel(el),
              eg = (0, e_.resolveCompactTriggerAt)(ec.maxInputTokens, eu);
            if (eh < eg) return !1;
            if (!eQ.HistoryUtils.hasMeaningfulNewHistorySinceLastCompact(ed))
              return (
                this.logger.info(
                  `[shouldCompact] Skip (subagent): no meaningful new content since last compact (tokens=${eh}/${eg}, would loop)`,
                ),
                !1
              );
            return !0;
          }
          let ef = await this.agentManager.getDefault(),
            em = await this.agentManager.getModel(ef.name);
          if (ep?.value?.lastAgent?.name !== ef.name) return !1;
          let eE = (0, e_.resolveCompactTriggerAt)(em.maxInputTokens, eu);
          if (eh < eE) return !1;
          if (!eQ.HistoryUtils.hasMeaningfulNewHistorySinceLastCompact(ed))
            return (
              this.logger.info(
                `[shouldCompact] Skip: no meaningful new content since last compact (tokens=${eh}/${eE}, would loop)`,
              ),
              !1
            );
          return !0;
        } catch (eA) {
          return (this.logger.warn("[shouldCompact] Check failed:", eA), !1);
        }
      }
      filterTruncatedToolCalls(eA) {
        if (!eA.input || !Array.isArray(eA.input)) return eA;
        let el =
            this.sessionManager.getCurrent() ||
            this.sessionManager.sessionSubject?.getValue(),
          ec = "length" === el?.meta?.lastFinishReason,
          eu = (eA = eQ.HistoryUtils.applyContentFilterCleanup(
            eA,
            el?.meta,
            this.logger,
          )).input,
          ed = new Set();
        for (let eA of eu) {
          if (
            "function_call_result" !== eA.type &&
            "function_call_output" !== eA.type
          )
            continue;
          let el = eA.callId || eA.call_id;
          el &&
            (eA.providerData?.skipRun ||
              eA.providerData?.isPartialAborted ||
              ed.add(el));
        }
        let ep = new Set(),
          eg = new Set(),
          eh = [];
        for (let eA of eu)
          if ("function_call" === eA.type) {
            let el,
              eu = eA.callId || eA.call_id,
              ef = "string" == typeof eA.arguments ? eA.arguments : "";
            if ("" === eA.arguments)
              !ec &&
              eu &&
              ed.has(eu) &&
              "incomplete" !== eA.status &&
              !eA.providerData?.isPartialAborted
                ? ((eA.arguments = "{}"), (ef = "{}"))
                : (el = "arguments is empty");
            else if (ef)
              try {
                JSON.parse(ef);
              } catch (ec) {
                try {
                  let el = (0, eB.jsonrepair)(ef);
                  ((eA.arguments = el),
                    (ef = el),
                    this.logger.debug(
                      `[callModelInputFilter] Repaired malformed JSON in tool arguments for "${eA.name}"`,
                    ));
                } catch (ep) {
                  let eu = !1,
                    ed = ef.replace(/">\s*([[{"\d\-ntf])/g, '": $1');
                  if (ed !== ef)
                    try {
                      let el = (0, eB.jsonrepair)(ed);
                      ((eA.arguments = el),
                        (ef = el),
                        this.logger.debug(
                          `[callModelInputFilter] Repaired malformed JSON (">"-fix + jsonrepair) for "${eA.name}"`,
                        ),
                        (eu = !0));
                    } catch (el) {
                      this.logger.debug(
                        `[callModelInputFilter] jsonrepair ">"-fix also failed for "${eA.name}": ${el.message}`,
                      );
                    }
                  eu ||
                    ((el = ec.message || "invalid JSON"),
                    this.logger.debug(
                      `[callModelInputFilter] jsonrepair failed for "${eA.name}": ${ep.message}`,
                    ));
                }
              }
            else el = "arguments is empty";
            if (el && eu) {
              ep.add(eu);
              let ec = eA.name || "unknown";
              (eg.add(ec),
                eh.push({
                  name: ec,
                  args: ef.length > 200 ? ef.slice(0, 200) + "..." : ef,
                  error: el,
                }));
            }
          }
        if (0 === ep.size) return eA;
        if (!ec) {
          this.logger.warn(
            `[callModelInputFilter] Detected ${ep.size} invalid JSON function_call(s) [${[...eg].join(", ")}] — filtering invalid calls (no retry). Details: ${JSON.stringify(eh)}`,
          );
          let el = eu.filter((eA) => {
            let el = eA.callId || eA.call_id;
            return !(
              ("function_call" === eA.type && el && ep.has(el)) ||
              ("function_call_result" === eA.type && el && ep.has(el))
            );
          });
          return { ...eA, input: el };
        }
        let ef = eu.some(
          (eA) =>
            "message" === eA.type &&
            "user" === eA.role &&
            Array.isArray(eA.content) &&
            eA.content.some(
              (eA) =>
                "string" == typeof eA.text &&
                (eA.text.includes(eM) || eA.text.includes(ex)),
            ),
        );
        ef
          ? this.logger.info(
              `[callModelInputFilter] Detected ${ep.size} truncated function_call(s) [${[...eg].join(", ")}] after prior retry — stopping to prevent loop`,
            )
          : this.logger.info(
              `[callModelInputFilter] Detected ${ep.size} truncated function_call(s) [${[...eg].join(", ")}], filtering and adding retry prompt`,
            );
        let em = eu.filter((eA) => {
          let el = eA.callId || eA.call_id;
          return !(
            ("function_call" === eA.type && el && ep.has(el)) ||
            ("function_call_result" === eA.type && el && ep.has(el))
          );
        });
        if (ef)
          em.push({
            type: "message",
            role: "user",
            content: [
              {
                type: "input_text",
                text:
                  "Your tool call failed again after a previous retry. Stop attempting this tool call. Instead, tell the user what you were trying to do and ask for guidance. " +
                  ex,
              },
            ],
          });
        else {
          let eA = buildTruncationRetryMessage(eg);
          em.push({
            type: "message",
            role: "user",
            content: [{ type: "input_text", text: eA }],
          });
        }
        return { ...eA, input: em };
      }
    };

    const originalModule: any = {};
    ec.d(originalModule, {
      "RunnerFactoryImpl": () => eP,
      "TRUNCATION_RETRY_MARKER": () => eM,
    });
    return {
      originalModule,
      eP,
      ...originalModule,
      buildTruncationRetryMessage,
      TRUNCATION_RETRY_EXHAUSTED: ex,
    };
  })();
  const provider = (() => {
    let rd = class {
      async get() {
        return (
          this.runner || (this.runner = await this.runnerFactory.create()),
          this.runner
        );
      }
    };

    const originalModule: any = {};
    ec.d(originalModule, { "RunnerProviderImpl": () => rd });
    return { originalModule, rd, ...originalModule };
  })();
  const loop = (() => {
    const nZ = ec(40038);
    let nX = 4,
      n0 = 40,
      n1 = 40,
      n2 = "Read",
      n3 = new Set(["function_call_result", "reasoning"]),
      n4 = new Set([
        "Read",
        "Grep",
        "Glob",
        "Write",
        "WebFetch",
        "WebSearch",
        "Edit",
        "Skill",
        "Bash",
      ]),
      n8 = class {
        check(eA) {
          try {
            let el = this.detectLoop(eA.input);
            if (el.detected && el.message) {
              this.logger.warn(
                `[ToolCallLoopDetector] Loop detected: tool="${el.toolName}", reason=${el.reason}, consecutiveCount=${el.consecutiveCount}`,
              );
              let ec = [
                ...eA.input,
                {
                  type: "message",
                  role: "user",
                  content: [{ type: "input_text", text: el.message }],
                },
              ];
              return { ...eA, input: ec };
            }
          } catch (eA) {
            this.logger.warn(
              "[ToolCallLoopDetector] Loop detection check failed:",
              eA,
            );
          }
          return null;
        }
        detectLoop(eA) {
          if (
            !eA ||
            !Array.isArray(eA) ||
            0 === eA.length ||
            this.hasExistingMarker(eA)
          )
            return { detected: !1 };
          let el = this.collectTailCalls(eA);
          if (el.length >= nX) {
            let eA = this.checkGenericLoop(el);
            if (eA.detected) return eA;
            let ec = this.checkReadFileLoop(el);
            if (ec.detected) return ec;
          }
          let ec = this.checkNonBlacklistLoop(eA);
          return ec.detected ? ec : { detected: !1 };
        }
        hasExistingMarker(eA) {
          for (let el of eA)
            if (
              "message" === el.type &&
              "user" === el.role &&
              Array.isArray(el.content) &&
              el.content.some(
                (eA) =>
                  "string" == typeof eA.text &&
                  eA.text.includes(nZ.LOOP_DETECTION_MARKER),
              )
            )
              return !0;
          return !1;
        }
        collectTailCalls(eA, el = !0) {
          let ec = [];
          for (let eu = eA.length - 1; eu >= 0; eu--) {
            let ed = eA[eu];
            if ("function_call" === ed.type)
              n4.has(ed.name) === el &&
                ec.unshift({ name: ed.name, arguments: ed.arguments || "" });
            else if (ed.type && n3.has(ed.type)) continue;
            else break;
          }
          return ec;
        }
        checkGenericLoop(eA) {
          let el = eA[eA.length - 1],
            ec = el.name + "\0" + el.arguments,
            eu = 0;
          for (let el = eA.length - 1; el >= 0; el--)
            if (eA[el].name + "\0" + eA[el].arguments === ec) eu++;
            else break;
          return eu >= nX
            ? {
                detected: !0,
                toolName: el.name,
                reason: "generic_loop",
                consecutiveCount: eu,
                message: this.buildStopMessage(el.name, eu, "generic_loop"),
              }
            : { detected: !1 };
        }
        checkNonBlacklistLoop(eA) {
          let el = this.collectTailCalls(eA, !1);
          if (el.length < n1) return { detected: !1 };
          let ec = el[el.length - 1],
            eu = ec.name + "\0" + ec.arguments,
            ed = 0;
          for (let eA = el.length - 1; eA >= 0; eA--)
            if (el[eA].name + "\0" + el[eA].arguments === eu) ed++;
            else break;
          return ed >= n1
            ? {
                detected: !0,
                toolName: ec.name,
                reason: "generic_loop",
                consecutiveCount: ed,
                message: this.buildStopMessage(ec.name, ed, "generic_loop"),
              }
            : { detected: !1 };
        }
        checkReadFileLoop(eA) {
          let el = eA[eA.length - 1];
          if (el.name !== n2) return { detected: !1 };
          let ec = this.extractFilePath(el.arguments);
          if (!ec) return { detected: !1 };
          let eu = 0;
          for (let el = eA.length - 1; el >= 0; el--) {
            let ed = eA[el];
            if (ed.name !== n2) break;
            if (this.extractFilePath(ed.arguments) === ec) eu++;
            else break;
          }
          return eu >= n0
            ? {
                detected: !0,
                toolName: n2,
                reason: "read_file_loop",
                consecutiveCount: eu,
                message: this.buildStopMessage(n2, eu, "read_file_loop"),
              }
            : { detected: !1 };
        }
        buildStopMessage(eA, el, ec) {
          let eu = [];
          return (
            eu.push("["),
            "generic_loop" === ec
              ? eu.push(
                  `Loop detected: the tool "${eA}" has been called ${el} consecutive times with identical arguments.`,
                )
              : eu.push(
                  `Loop detected: the tool "${eA}" has been reading the same file ${el} consecutive times.`,
                ),
            eu.push(""),
            eu.push(
              "STOP calling tools immediately. Do NOT make any more tool calls.",
            ),
            eu.push(
              "Instead, tell the user what happened and suggest they switch models or modify their prompt to retry.",
            ),
            eu.push("]"),
            eu.push(""),
            eu.push(nZ.LOOP_DETECTION_MARKER),
            eu.join("\n")
          );
        }
        extractFilePath(eA) {
          if (eA)
            try {
              let el = JSON.parse(eA);
              return el.file_path || el.filePath;
            } catch {
              let el = eA.match(/"(?:file_path|filePath)"\s*:\s*"([^"]+)"/);
              return el?.[1];
            }
        }
      };

    const originalModule: any = {};
    ec.d(originalModule, { "ToolCallLoopDetectorImpl": () => n8 });
    return { originalModule, n8, ...originalModule };
  })();
  return {
    getModule: ec,
    RunnerFactoryImpl: factory.eP,
    RunnerProviderImpl: provider.rd,
    ToolCallLoopDetectorImpl: loop.n8,
    buildTruncationRetryMessage: factory.buildTruncationRetryMessage,
    TRUNCATION_RETRY_EXHAUSTED: factory.TRUNCATION_RETRY_EXHAUSTED,
    TRUNCATION_RETRY_MARKER: factory.TRUNCATION_RETRY_MARKER,
    originalModules: {
      factory: factory.originalModule,
      provider: provider.originalModule,
      loop: loop.originalModule,
    },
  };
}
