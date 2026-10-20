// @ts-nocheck
// Complete inert original HistoryUtils/InputItemUtils/MessageUtils and resend/summary factories.
// No app bootstrap or installed-account lookup. SDK and IO are borrowed explicit dependencies.
export const AGENT_RUN_UTILITIES_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const AGENT_RUN_UTILITY_FACTORIES = [
  [77787, 7010487, 7012456],
  [18553, 7210615, 7211213],
  [21580, 13099124, 13108539],
  [58830, 13263513, 13273308],
  [46943, 13313104, 13320096],
  [2623, 13352531, 13353665],
  [4636, 13375898, 13377688],
] as const;
export function createNativeAgentRunUtilities(runtime: any = {}) {
  const process: any = {
    env: runtime.env ?? {},
    platform: runtime.platform ?? "unsupported",
  };
  const Date = runtime.Date ?? globalThis.Date;
  const cache = new Map(),
    factories: any = {
      77787(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            AGENT_PURPOSE_MAP: () => eh,
            AUXILIARY_PURPOSES: () => ef,
            AgentPurpose: () => eu,
            CUSTOM_AGENT_PURPOSE_PREFIX: () => eg,
            STATE_MACHINE_BYPASS_PURPOSES: () => em,
            SUBAGENT_PURPOSE_PREFIX: () => ep,
            isAuxiliaryPurpose: () => isAuxiliaryPurpose,
            isStateMachineBypassPurpose: () => isStateMachineBypassPurpose,
            resolveAgentPurpose: () => resolveAgentPurpose,
          }));
        var eu,
          ed = ec(69466);
        !(function (eA) {
          ((eA.Conversation = "conversation"),
            (eA.Summary = "summary"),
            (eA.WebFetch = "webfetch"),
            (eA.ConversationTopic = "conversation_topic"),
            (eA.MemorySelection = "memory_selection"),
            (eA.Insights = "insights"),
            (eA.PromptHook = "prompt_hook"),
            (eA.AgentInstructions = "agent_instructions"),
            (eA.ContextCompact = "context_compact"),
            (eA.ContextSummaryPreMessage = "context_summary_pre_message"),
            (eA.ContextSummaryMaxToken = "context_summary_max_token"),
            (eA.PromptSuggestion = "prompt_suggestion"),
            (eA.MemoryExtraction = "memory_extraction"),
            (eA.AutoModeClassifier = "auto_mode_classifier"),
            (eA.Automation = "automation"));
        })(eu || (eu = {}));
        let ep = "subagent",
          eg = "custom_agent",
          eh = {
            [ed.AgentNames.SUMMARY_GENERATOR]: eu.Summary,
            [ed.AgentNames.CONTENT_ANALYZER]: eu.WebFetch,
            [ed.AgentNames.TERMINAL_TITLE_GENERATOR]: eu.ConversationTopic,
            [ed.AgentNames.PROMPT_SUGGESTION]: eu.PromptSuggestion,
            [ed.AgentNames.MEMORY_SELECTOR]: eu.MemorySelection,
            [ed.AgentNames.INSIGHTS_ANALYZER]: eu.Insights,
            [ed.AgentNames.PROMPT_HOOK_EVALUATOR]: eu.PromptHook,
            [ed.AgentNames.AGENT_INSTRUCTIONS]: eu.AgentInstructions,
            [ed.AgentNames.COMPACT]: eu.ContextCompact,
            [ed.AgentNames.AUTO_MODE_CLASSIFIER]: eu.AutoModeClassifier,
          };
        function resolveAgentPurpose(eA) {
          return eh[eA] ?? eA;
        }
        let ef = new Set([
          eu.Summary,
          eu.WebFetch,
          eu.ConversationTopic,
          eu.MemorySelection,
          eu.Insights,
          eu.PromptHook,
          eu.AgentInstructions,
          eu.PromptSuggestion,
          eu.MemoryExtraction,
          eu.AutoModeClassifier,
          eu.ContextSummaryPreMessage,
        ]);
        function isAuxiliaryPurpose(eA) {
          return void 0 !== eA && ef.has(eA);
        }
        let em = new Set([eu.ContextSummaryPreMessage]);
        function isStateMachineBypassPurpose(eA) {
          return void 0 !== eA && em.has(eA);
        }
      },
      18553(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            CUSTOM_INPUT_ITEM_TYPES: () => ep,
            RunState: () => ed.RunState,
            RunContext: () => ed.RunContext,
            RawStreamedRunResult: () => ed.StreamedRunResult,
            Runner: () => ed.Runner,
            Usage: () => ed.Usage,
            tool: () => ed.tool,
            user: () => user,
            Agent: () => ed.Agent,
            RunToolApprovalItem: () => ed.RunToolApprovalItem,
            RunResult: () => ed.RunResult,
          }));
        var eu = ec(80699),
          ed = ec(25301);
        let ep = [
          "custom-title",
          "ai-title",
          "file-history-snapshot",
          "summary",
          "topic",
          "goal-result",
          "goal-progress",
          "resend-fork-notice",
        ];
        function user(eA, el) {
          let ec = (0, ed.user)(eA, el);
          return (ec.id || (ec.id = (0, eu.generateUUUID)()), ec);
        }
      },
      21580(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            CompactSummaryNotFoundError: () => eh.CompactSummaryNotFoundError,
            HistoryUtils: () => HistoryUtils,
          }));
        var eu = ec(70724),
          ed = ec(69466),
          ep = ec(58830),
          eg = ec(2623),
          eh = ec(4636);
        let ef = RegExp(
          `<system-reminder\\s+data-role="${eu.USER_CONTEXT_ROLE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}">[\\s\\S]*?</system-reminder>`,
        );
        let HistoryUtils = class HistoryUtils {
          static getActiveAgentOnlyHistory(eA, el) {
            return this.getActiveHistory(eA, el).filter(
              (eA) => !ep.InputItemUtils.isCustomInputItem(eA),
            );
          }
          static resolveReplayHistory(eA, el) {
            let {
                lastMessageId: ec,
                hasCompactedHistory: eu,
                keepCustomItems: ed,
                recoverLegacySelfParentCompact: eh,
              } = el,
              ef = eh ? this.recoverLegacyReplayParents(eA) : eA,
              em = ef.some((eA) => !!eA.parentId),
              eE = ef.some((eA) =>
                ep.InputItemUtils.isContentFilterNoticeItem(eA),
              );
            if (!ec && (!em || !eE)) {
              let eA = (0, eg.pruneResendForkBranches)(ef);
              return ed
                ? eA
                : eA.filter((eA) => !ep.InputItemUtils.isCustomInputItem(eA));
            }
            let eC = this.getActiveHistory(ef, {
              lastMessageId: ec,
              hasCompactedHistory: eu,
            });
            if (!ed)
              return eC.filter(
                (eA) => !ep.InputItemUtils.isCustomInputItem(eA),
              );
            let ey = new Set(eC.map((eA) => eA.id));
            return ef.filter(
              (eA) => ep.InputItemUtils.isCustomInputItem(eA) || ey.has(eA.id),
            );
          }
          static recoverLegacyReplayParents(eA) {
            let el = !1,
              ec = new Set(eA.map((eA) => eA.id).filter(Boolean)),
              eu = new Map(eA.filter((eA) => eA.id).map((eA) => [eA.id, eA])),
              ed = eA.map((ed, eg) => {
                let eh = ed,
                  ef =
                    !ed.parentId ||
                    ed.parentId === ed.id ||
                    !ec.has(ed.parentId),
                  em = ep.InputItemUtils.isReplayRecoverableCompactMessage(ed),
                  eE =
                    !!ed.parentId &&
                    em &&
                    this.parentChainReaches(ed.parentId, ed.id, eu),
                  eC = this.findPreviousReplayItemId(eA, eg, ed.id, eu);
                return (
                  ed.id && (ef || eE) && !ed.logicalParentId && eC && em
                    ? ((el = !0),
                      (eh = { ...ed, parentId: void 0, logicalParentId: eC }))
                    : ed.id &&
                      ef &&
                      eC &&
                      ep.InputItemUtils.isSystemTeammateMessage(ed) &&
                      ((el = !0), (eh = { ...ed, parentId: eC })),
                  eh
                );
              });
            return el ? ed : eA;
          }
          static findPreviousReplayItemId(eA, el, ec, eu) {
            for (let ed = el - 1; ed >= 0; ed--) {
              let el = eA[ed];
              if (
                !(
                  !el.id ||
                  el.id === ec ||
                  ep.InputItemUtils.isCustomInputItem(el)
                ) &&
                !(ec && this.parentChainReaches(el.id, ec, eu))
              )
                return el.id;
            }
          }
          static parentChainReaches(eA, el, ec) {
            if (!eA || !el) return !1;
            let eu = new Set(),
              ed = eA;
            for (; ed && !eu.has(ed); ) {
              if (ed === el) return !0;
              (eu.add(ed), (ed = ec.get(ed)?.parentId));
            }
            return !1;
          }
          static getActiveHistory(eA, el) {
            if (0 === eA.length) return [];
            let { lastMessageId: ec, hasCompactedHistory: eu = !1 } = el ?? {},
              eg = ec;
            if (!eg)
              for (let el = eA.length - 1; el >= 0; el--) {
                let ec = eA[el];
                if (ec?.id && !ep.InputItemUtils.isCustomInputItem(ec)) {
                  eg = ec.id;
                  break;
                }
              }
            if (!eg) return [];
            let eh = [];
            for (let el = eA.length - 1; el >= 0; el--) {
              let ec = eA[el];
              if (ec.id === eg) {
                for (eh.unshift(ec); el - 1 >= 0 && eA[el - 1].id === eg; )
                  (el--, eh.unshift(eA[el]));
                let ep = eA[el],
                  ef = ep.providerData?.agent === ed.AgentNames.COMPACT;
                eg =
                  ep.parentId ??
                  (eu || el === eA.length - 1 || ef
                    ? ep.logicalParentId
                    : void 0);
              }
            }
            return eh;
          }
          static findLastFileHistorySnapshotItem(eA) {
            for (let el = eA.length - 1; el >= 0; el--) {
              let ec = eA[el];
              if (ep.InputItemUtils.isFileHistorySnapshotItem(ec)) return ec;
            }
          }
          static hasRealUserMessageItem(eA) {
            return eA.some(
              (eA) =>
                ep.InputItemUtils.isRealUserMessageItem(eA) &&
                eA.providerData?.agent !== ed.AgentNames.COMPACT,
            );
          }
          static getSessionSeparatorHistory(eA) {
            for (let el = eA.length - 1; el >= 0; el--) {
              let ec = eA[el];
              if (this.isSessionSeparatorItem(ec)) return eA.slice(el + 1);
            }
            return eA;
          }
          static getCompactionBoundaryHistory(eA) {
            for (let el = eA.length - 1; el >= 0; el--) {
              let ec = eA[el],
                eu = ec.providerData ?? {};
              if (!0 === eu.isCompacted || !0 === eu.isSummary)
                return eA.slice(el);
              if (this.isSessionSeparatorItem(ec)) return eA.slice(el + 1);
            }
            return eA;
          }
          static isSessionSeparatorItem(eA) {
            if ("message" !== eA.type || "system" !== eA.role) return !1;
            if (eA.providerData?.isSessionSeparator === !0) return !0;
            let el = eA.id ?? "";
            return (
              el.startsWith("session-separator-") || el.startsWith("clear-")
            );
          }
          static getCompactHistory(eA) {
            let el = -1;
            for (let ec = eA.length - 1; ec >= 0; ec--) {
              let eu = eA[ec];
              if (
                eu.providerData?.agent !== ed.AgentNames.COMPACT ||
                "message" !== eu.type ||
                "assistant" !== eu.role
              )
                continue;
              let ep = eh.SummaryUtils.extractTextFromAssistantContent(
                eu.content,
              );
              if (ep && this.hasCompactOutputStructure(ep)) {
                el = ec;
                break;
              }
            }
            return el < 0 ? eA : eA.slice(el);
          }
          static hasCompactOutputStructure(eA) {
            return (
              !!eA &&
              (/<summary>[\s\S]+?<\/summary>/i.test(eA) ||
                /<conversation_history_summary>[\s\S]+?<\/conversation_history_summary>/i.test(
                  eA,
                ))
            );
          }
          static hasMeaningfulNewHistorySinceLastCompact(eA) {
            if (!Array.isArray(eA) || 0 === eA.length) return !1;
            let el = -1;
            for (let ec = eA.length - 1; ec >= 0; ec--) {
              let eu = eA[ec];
              if (
                eu.providerData?.agent === ed.AgentNames.COMPACT &&
                "message" === eu.type &&
                "assistant" === eu.role
              ) {
                el = ec;
                break;
              }
            }
            if (el < 0) return !0;
            for (let ec = el + 1; ec < eA.length; ec++)
              if (this.isMeaningfulPostCompactItem(eA[ec])) return !0;
            return !1;
          }
          static isMeaningfulPostCompactItem(eA) {
            if (
              eA.providerData?.agent === ed.AgentNames.COMPACT ||
              eA.providerData?.isCompactInternal ||
              ep.InputItemUtils.isFileHistorySnapshotItem(eA) ||
              ep.InputItemUtils.isCustomInputItem(eA)
            )
              return !1;
            if (
              "function_call" === eA.type ||
              "function_call_result" === eA.type
            )
              return !0;
            if ("reasoning" === eA.type) {
              let el = eA.content;
              return Array.isArray(el) && el.length > 0;
            }
            if ("message" === eA.type) {
              let el = eA.role;
              if ("assistant" === el) {
                let el = eA.content;
                return "string" == typeof el
                  ? el.length > 0
                  : !!Array.isArray(el) &&
                      el.some(
                        (eA) =>
                          "string" == typeof eA?.text && eA.text.length > 0,
                      );
              }
              if ("user" === el && eA.providerData?.skipRun) return !1;
            }
            return !0;
          }
          static extractCompactSummaryFromHistory(eA) {
            if (Array.isArray(eA))
              for (let el = eA.length - 1; el >= 0; el--) {
                let ec = eA[el];
                if (
                  ec?.providerData?.agent !== ed.AgentNames.COMPACT ||
                  "message" !== ec.type ||
                  "assistant" !== ec.role
                )
                  continue;
                let eu = eh.SummaryUtils.extractTextFromAssistantContent(
                    ec.content,
                  ),
                  ep = eh.SummaryUtils.extractCompactSummaryFromText(eu);
                if (ep) return ep;
              }
          }
          static requireCompactSummaryFromHistory(eA) {
            let el = this.extractCompactSummaryFromHistory(eA);
            if (!el)
              throw new eh.CompactSummaryNotFoundError(
                "No compact summary (e.g. <summary>…</summary>) could be extracted from any compact-agent assistant message in the current history.",
              );
            return el;
          }
          static replaceCompactWithSummary(eA, el) {
            if (
              !eA.some((eA) => eA.providerData?.agent === ed.AgentNames.COMPACT)
            )
              return eA;
            let ec = this.extractCompactSummaryFromHistory(eA),
              eu = eA.filter(
                (eA) => eA.providerData?.agent !== ed.AgentNames.COMPACT,
              );
            if (!ec) return eu;
            let eg = eh.SummaryUtils.wrapSummaryWithContext(ec, el),
              ef = ep.InputItemUtils.createUserMessage(
                `<system-reminder data-role="compact-summary">
${eg}

Please address this message and continue with your tasks.
</system-reminder>`,
                { skipRun: !0 },
              );
            return (
              (ef.providerData = {
                ...ef.providerData,
                isCompactInternal: !0,
                agent: "cli",
              }),
              [ef, ...eu]
            );
          }
          static filterTaskHistory(eA, el) {
            return eA.name === ed.AgentNames.GENERAL_PURPOSE
              ? el
              : el.filter(
                  (eA) =>
                    eA.providerData?.agent !== ed.AgentNames.GENERAL_PURPOSE,
                );
          }
          static filterBeforeCompactedMessage(eA) {
            for (let el = eA.length - 1; el >= 0; el--)
              if (ep.InputItemUtils.isCompactBoundaryMessage(eA[el]))
                return eA.slice(el);
            return eA;
          }
          static extractUserContextFromHistory(eA) {
            for (let el of eA) {
              let eA = this.getUserMessageFullText(el);
              if (!eA) continue;
              let ec = eA.match(ef);
              if (ec) return ec[0];
            }
          }
          static getUserMessageFullText(eA) {
            let el = eA;
            if ("message" === el.type && "user" === el.role) {
              if ("string" == typeof el.content) return el.content;
              if (Array.isArray(el.content)) {
                let eA = [];
                for (let ec of el.content)
                  "input_text" === ec.type &&
                    "string" == typeof ec.text &&
                    eA.push(ec.text);
                return eA.join("\n");
              }
            }
          }
          static containsUserContext(eA, el) {
            for (let ec of eA) {
              let eA = this.getUserMessageFullText(ec);
              if (eA && eA.includes(el)) return !0;
            }
            return !1;
          }
          static filterTruncatedHistory(eA) {
            return eA.filter((eA) => !eA.providerData?.truncated);
          }
          static applyContentFilterCleanup(eA, el, ec) {
            let eu = el?.lastContentFilterUserMessageId,
              ed = new Set();
            for (let el of eA.input)
              if (ep.InputItemUtils.isContentFilterNoticeItem(el)) {
                let eA = el.providerData?.strippedUserMessageId;
                "string" == typeof eA && eA && ed.add(eA);
              }
            let eg = eA.input.filter(
              (eA) =>
                !(
                  ep.InputItemUtils.isContentFilterNoticeItem(eA) ||
                  (eA.id && ed.has(eA.id)) ||
                  (eu &&
                    ep.InputItemUtils.isContentFilterCandidateUserMessage(eA) &&
                    eA.id === eu)
                ),
            );
            return (el &&
              eu &&
              (delete el.lastContentFilterUserMessageId,
              delete el.lastFinishReason),
            eg.length === eA.input.length)
              ? eA
              : (ec?.info(
                  `[callModelInputFilter] Removed ${eA.input.length - eg.length} content-filter item(s) (blockedUserId=${eu ?? "none"}, persistentStripped=${ed.size})`,
                ),
                { ...eA, input: eg });
          }
          static filterApiErrorMessages(eA) {
            return eA.filter(
              (eA) =>
                !(
                  "message" === eA.type &&
                  "assistant" === eA.role &&
                  eA.providerData?.skipRun === !0 &&
                  eA.providerData?.error
                ),
            );
          }
          static filterRenameHistory(eA) {
            return eA.filter((eA) => "custom-title" !== eA.type);
          }
          static getItemsNeedingFill(eA) {
            let el = new Map(),
              ec = [];
            for (let ec of eA)
              if ("function_call_result" === ec.type) {
                let eA = ec;
                el.set(eA.callId, eA);
              }
            for (let eu of eA)
              if ("function_call" === eu.type) {
                let eA = eu;
                el.has(eA.callId) || ec.push(eA);
              }
            return ec;
          }
          static getFillItemsForNeedingFill(eA) {
            return eA.map((eA) =>
              ep.InputItemUtils.createToolCallResultItem("", eA, {
                status: "incomplete",
                skipRun: !0,
              }),
            );
          }
          static fillFunctionCallResultHistory(eA) {
            let el = [],
              ec = new Map(),
              eu = new Map();
            for (let el of eA)
              if ("function_call" === el.type) {
                if (el.providerData?.discard) continue;
                let eA = el;
                ec.set(eA.callId, eA);
              } else if ("function_call_result" === el.type) {
                let eA = el;
                eu.set(eA.callId, eA);
              }
            let ed = new Set(),
              eg = new Set();
            for (let ec of eA)
              if (
                !(
                  ("message" === ec.type && ec.providerData?.discard) ||
                  ("function_call" === ec.type && ed.has(ec.callId))
                ) &&
                !(
                  "function_call_result" === ec.type &&
                  (!ed.has(ec.callId) || eg.has(ec.callId))
                ) &&
                (el.push(ec), "function_call" === ec.type)
              ) {
                let eA = ec,
                  eh = eu.get(eA.callId);
                (eh ||
                  ((eh = ep.InputItemUtils.createToolCallResultItem("", eA, {
                    status: "incomplete",
                    skipRun: !0,
                  })),
                  eu.set(eA.callId, eh)),
                  el.push(eh),
                  ed.add(eA.callId),
                  eg.add(eh.callId));
              }
            return el;
          }
        };
      },
      58830(eA, el, ec) {
        "use strict";
        (ec.r(el), ec.d(el, { InputItemUtils: () => InputItemUtils }));
        var eu = ec(80699),
          ed = ec(79896),
          ep = ec(66545),
          eg = ec(18553),
          eh = ec(8046),
          ef = ec(84024),
          em = ec(46949);
        let InputItemUtils = class InputItemUtils {
          static createToolCallResultItem(eA, el, ec = {}) {
            let ed,
              { skipRun: ep = !1, error: eg } = ec;
            return (
              (ed =
                void 0 !== ec.status
                  ? ec.status
                  : null != eg
                    ? "incomplete"
                    : InputItemUtils.detectStatusFromOutput(eA)),
              {
                id: (0, eu.generateUUUID)(),
                name: el.name,
                callId: el.callId,
                status: ed,
                type: "function_call_result",
                providerData: { skipRun: ep, error: eg },
                output: { type: "text", text: eA },
              }
            );
          }
          static detectStatusFromOutput(eA) {
            if (!eA) return "completed";
            let el = eA.trimStart();
            if (!el.startsWith("{") && !el.startsWith("[")) return "completed";
            try {
              let eA = JSON.parse(el);
              if (!eA || "object" != typeof eA) return "completed";
              if (!0 === eA.isError) return "incomplete";
              let ec = eA.error;
              if (
                ("string" == typeof ec && ec.trim().length > 0) ||
                (ec &&
                  "object" == typeof ec &&
                  "string" == typeof ec.message &&
                  ec.message.trim().length > 0)
              )
                return "incomplete";
            } catch {}
            return "completed";
          }
          static createToolCallItem(eA, el, ec = {}) {
            let { skipRun: ed = !1 } = ec,
              ep = (0, eu.generateUUUID)();
            return {
              callId: ep,
              id: ep,
              name: eA,
              arguments:
                "object" == typeof el ? JSON.stringify(el) : String(el),
              type: "function_call",
              providerData: { manual: !0, skipRun: ed },
            };
          }
          static findLatestUserMessage(eA) {
            return eA
              .slice()
              .reverse()
              .find((eA) => "message" === eA.type && "user" === eA.role);
          }
          static findLatestConversationRequestId(eA) {
            for (let el = eA.length - 1; el >= 0; el--) {
              let ec = eA[el];
              if ("message" === ec.type && "user" === ec.role) return ec.id;
            }
          }
          static findLatestUserOrToolCallResultMessageId(eA) {
            for (let el = eA.length - 1; el >= 0; el--) {
              let ec = eA[el];
              if (
                ("message" === ec.type && "user" === ec.role) ||
                "function_call_result" === ec.type
              )
                return ec.id;
            }
          }
          static isContentFilterCandidateUserMessage(eA) {
            return (
              this.isRealUserMessageItem(eA) &&
              eA.providerData?.agent !== ep.AgentNames.COMPACT &&
              !eA.providerData?.isAdditionalData &&
              !eA.providerData?.isCompactInternal
            );
          }
          static findLatestContentFilterCandidateUserMessageId(eA, el) {
            if (el) {
              let ec = eA.find((eA) => eA.id === el);
              if (ec && this.isContentFilterCandidateUserMessage(ec)) return el;
            }
            for (let el = eA.length - 1; el >= 0; el--) {
              let ec = eA[el];
              if (this.isContentFilterCandidateUserMessage(ec)) return ec.id;
            }
          }
          static findLatestMessageId(eA) {
            return eA[eA.length - 1]?.id;
          }
          static findLatestConversationRequestItems(eA) {
            let el = [];
            for (let ec = eA.length - 1; ec >= 0; ec--) {
              let eu = eA[ec];
              if ("message" === eu.type && "user" === eu.role) {
                el.push(eu);
                break;
              }
              el.push(eu);
            }
            return el;
          }
          static createUserMessage(eA, el = {}) {
            let { skipRun: ec = !0 } = el;
            return {
              id: (0, eu.generateUUUID)(),
              type: "message",
              role: "user",
              content: Array.isArray(eA)
                ? eA
                : [{ type: "input_text", text: eA }],
              providerData: { skipRun: ec },
            };
          }
          static createErrorRecoveryInput(eA) {
            return [(0, eg.user)(eA, { isMeta: !0 })];
          }
          static createAssistantMessage(eA, el = {}) {
            let { status: ec = "completed", skipRun: ed = !0, error: ep } = el;
            return {
              id: (0, eu.generateUUUID)(),
              type: "message",
              role: "assistant",
              content: [{ type: "output_text", text: eA }],
              status: ec,
              providerData: { skipRun: ed, error: ep },
            };
          }
          static createContentFilterNoticeMessage(eA, el, ec) {
            return {
              id: (0, eu.generateUUUID)(),
              type: "message",
              role: "assistant",
              content: [
                {
                  type: "output_text",
                  text: InputItemUtils.CONTENT_FILTER_NOTICE_TEXT,
                },
              ],
              status: "completed",
              parentId: el,
              providerData: {
                skipRun: !0,
                contentFilterNotice: !0,
                messageId: eA,
                strippedUserMessageId: ec,
              },
            };
          }
          static isContentFilterNoticeItem(eA) {
            return !!eA.providerData?.contentFilterNotice;
          }
          static createHookMessage(eA, el = {}, ec, ed) {
            let {
              status: ep = "completed",
              skipRun: eg = !0,
              error: eh,
              hookStatus: ef,
              exitCode: eE,
            } = el;
            return {
              id: (0, eu.generateUUUID)(),
              type: "message",
              role: "assistant",
              status: ep,
              content: [
                {
                  type: "output_text",
                  text: em.ThemeUtils.chalk.secondary(eA),
                },
              ],
              providerData: {
                skipRun: eg,
                error: eh,
                hookEvent: ec,
                callId: ed,
                hookStatus: ef,
                exitCode: eE,
              },
            };
          }
          static isSkipRunItem(eA) {
            return !!eA.providerData?.skipRun;
          }
          static isQueueHoldItem(eA) {
            return !!eA.providerData?.queueHold;
          }
          static createQueueHoldUserMessage(eA) {
            return (0, eg.user)(eA, { queueHold: !0 });
          }
          static isManualToolCall(eA) {
            return "function_call" === eA.type && !!eA.providerData?.manual;
          }
          static isUserMessageItem(eA) {
            return "message" === eA.type && "user" === eA.role;
          }
          static isRealUserMessageItem(eA) {
            return (
              this.isUserMessageItem(eA) &&
              !this.isSkipRunItem(eA) &&
              eA.providerData?.isCompactInternal !== !0 &&
              !this.isCompactUserMessage(eA) &&
              !this.isSystemTeammateMessage(eA)
            );
          }
          static isSystemTeammateMessage(eA) {
            return (
              "string" == typeof eA.providerData?.teammateMessage?.from ||
              (this.isUserMessageItem(eA) && this.hasTeammateMessageContent(eA))
            );
          }
          static isEditableQueuedMessage(eA) {
            if (
              !this.isUserMessageItem(eA) ||
              eA.providerData?.isMeta === !0 ||
              this.isSkipRunItem(eA) ||
              this.isSystemTeammateMessage(eA)
            )
              return !1;
            let el = this.getUserMessageText(eA);
            return !(
              el.includes("<agent-notification>") || /<channel\b/i.test(el)
            );
          }
          static extractEditableText(eA) {
            return this.isUserMessageItem(eA)
              ? this.getUserMessageText(eA)
              : "";
          }
          static extractEditableImages(eA) {
            if (!this.isUserMessageItem(eA)) return [];
            let el = eA.content;
            if (!Array.isArray(el)) return [];
            let ec = [];
            for (let eA of el)
              if (
                eA &&
                "input_text" === eA.type &&
                "string" == typeof eA.text
              ) {
                let el,
                  eu = /\[Image #(\d+)\]/g;
                for (; null !== (el = eu.exec(eA.text)); )
                  ec.push(parseInt(el[1], 10));
              }
            let eu = [];
            for (let eA of el)
              if (eA && "input_image" === eA.type) {
                let el = eA.image,
                  ec =
                    "string" == typeof el
                      ? el
                      : el && "string" == typeof el.url
                        ? el.url
                        : void 0;
                "string" == typeof ec && ec.startsWith("data:") && eu.push(ec);
              }
            let ed = [];
            for (let eA = 0; eA < eu.length; eA++) {
              let el = eA < ec.length ? ec[eA] : -(eA + 1);
              ed.push({ placeholderId: el, dataUrl: eu[eA] });
            }
            return ed;
          }
          static isCustomInputItem(eA) {
            return !!eA.type && eg.CUSTOM_INPUT_ITEM_TYPES.includes(eA.type);
          }
          static isFileHistorySnapshotItem(eA) {
            return "file-history-snapshot" === eA.type;
          }
          static createResendForkNoticeItem(eA, el) {
            return {
              type: "resend-fork-notice",
              id: (0, eu.generateUUUID)(),
              parentId: eA,
              timestamp: Date.now(),
              ...(el ? { editedUserItemId: el } : {}),
              providerData: { skipRun: !0, resendForkNotice: !0 },
            };
          }
          static isResendForkNoticeItem(eA) {
            return eA?.type === "resend-fork-notice";
          }
          static isAssistantMessage(eA) {
            return "message" === eA.type && "assistant" === eA.role;
          }
          static isSessionSeparatorItem(eA) {
            return (
              "message" === eA.type &&
              "system" === eA.role &&
              eA.providerData?.isSessionSeparator === !0
            );
          }
          static isUserInterrupted(eA) {
            return (
              "message" === eA.type &&
              "assistant" === eA.role &&
              ("string" == typeof eA.content
                ? eA.content === eh.INTERRUPTED_BY_USER_MESSAGE
                : eA.content.some(
                    (eA) =>
                      "output_text" === eA.type &&
                      eA.text === eh.INTERRUPTED_BY_USER_MESSAGE,
                  ))
            );
          }
          static isSuccessfulFunctionCallResultItem(eA) {
            return (
              "function_call_result" === eA.type &&
              "completed" === eA.status &&
              !eA.providerData?.toolResult?.error
            );
          }
          static isCompactBoundaryMessage(eA) {
            if (!this.isUserMessageItem(eA)) return !1;
            let el = eA.providerData ?? {};
            return (
              !0 !== el.isPtlRecovery &&
              !0 !== el.isMediaBodyRecovery &&
              (!0 === el.isCompacted ||
                !0 === el.isSummary ||
                (!0 !== el.isCompactInternal &&
                  el.agent !== ep.AgentNames.COMPACT &&
                  (("string" == typeof el.compactType &&
                    !this.isCompactContinuePromptMessage(eA)) ||
                    this.hasCompactBoundaryContent(eA))))
            );
          }
          static isReplayRecoverableCompactMessage(eA) {
            return (
              !!this.isUserMessageItem(eA) &&
              (this.isCompactBoundaryMessage(eA) ||
                (eA.providerData?.isCompactInternal === !0 &&
                  this.isCompactContinuePromptMessage(eA)))
            );
          }
          static isCompactUserMessage(eA) {
            return (
              this.isCompactBoundaryMessage(eA) ||
              (this.isUserMessageItem(eA) &&
                eA.providerData?.agent === ep.AgentNames.COMPACT)
            );
          }
          static hasCompactBoundaryContent(eA) {
            let el = this.getUserMessageText(eA);
            return (
              /<cb_summary\b/i.test(el) ||
              /<conversation_history_summary\b/i.test(el) ||
              /data-role=["']compact-summary["']/i.test(el)
            );
          }
          static isCompactContinuePromptMessage(eA) {
            if (!this.isUserMessageItem(eA)) return !1;
            let el = this.getUserMessageText(eA);
            return (
              /please continue\b/i.test(el) &&
              /summarized context above/i.test(el) &&
              !this.hasCompactBoundaryContent(eA)
            );
          }
          static hasTeammateMessageContent(eA) {
            return /<teammate-message\b/i.test(this.getUserMessageText(eA));
          }
          static getUserMessageText(eA) {
            let el = eA.content;
            return "string" == typeof el
              ? el
              : el
                  .map((eA) =>
                    "input_text" === eA.type && "string" == typeof eA.text
                      ? eA.text
                      : "",
                  )
                  .join("\n");
          }
          static async createUserMessageWithImage(eA, el, ec = "png") {
            let ep = [];
            if (
              (eA.trim() && ep.push({ type: "input_text", text: eA }),
              ed.existsSync(el))
            ) {
              let eA = ed.readFileSync(el).toString("base64"),
                eu = ef.ImageUtils.getImageMimeTypeSync(ec, ed.readFileSync),
                eg = `data:${eu};base64,${eA}`,
                eh = await ef.ImageUtils.compressUserImage(eg);
              eh
                ? ep.push({ type: "input_image", image: eh })
                : ep.push({
                    type: "input_text",
                    text: ef.ImageUtils
                      .IMAGE_TOO_LARGE_AFTER_COMPRESSION_PLACEHOLDER,
                  });
            }
            return {
              id: (0, eu.generateUUUID)(),
              type: "message",
              role: "user",
              content: ep,
            };
          }
          static async createImageOnlyUserMessage(eA, el = "png") {
            return this.createUserMessageWithImage("", eA, el);
          }
          static async createUserMessageWithMultipleImages(eA, el) {
            let ec = [],
              ep = [],
              eg = eA.match(/\[Image #(\d+)\]/g);
            for (let { index: eu } of (eg &&
              eg.forEach((eA) => {
                let el = eA.match(/\[Image #(\d+)\]/);
                if (el) {
                  let ec = parseInt(el[1]);
                  ep.push({ index: ec, placeholder: eA });
                }
              }),
            eA.trim() && ec.push({ type: "input_text", text: eA.trim() }),
            ep)) {
              let eA = el.get(eu);
              if (eA && ed.existsSync(eA.path)) {
                let el = ed.readFileSync(eA.path).toString("base64"),
                  ep = ef.ImageUtils.getImageMimeTypeSync(
                    eA.path,
                    ed.readFileSync,
                  ),
                  eg = `data:${ep};base64,${el}`,
                  eh = await ef.ImageUtils.compressUserImage(eg);
                eh
                  ? ec.push({ type: "input_image", image: eh })
                  : ec.push({
                      type: "input_text",
                      text: `[Image #${eu} too large — omitted after compression]`,
                    });
              }
            }
            if (0 === ep.length && el.size > 0) {
              for (let [, eA] of el)
                if (ed.existsSync(eA.path)) {
                  let el = ed.readFileSync(eA.path).toString("base64"),
                    eu = ef.ImageUtils.getImageMimeTypeSync(
                      eA.path,
                      ed.readFileSync,
                    ),
                    ep = `data:${eu};base64,${el}`,
                    eg = await ef.ImageUtils.compressUserImage(ep);
                  eg
                    ? ec.push({ type: "input_image", image: eg })
                    : ec.push({
                        type: "input_text",
                        text: ef.ImageUtils
                          .IMAGE_TOO_LARGE_AFTER_COMPRESSION_PLACEHOLDER,
                      });
                }
            }
            return {
              id: (0, eu.generateUUUID)(),
              type: "message",
              role: "user",
              content: ec,
            };
          }
          static isRenameMessage(eA) {
            return "custom-title" === eA.type;
          }
        };
        InputItemUtils.CONTENT_FILTER_NOTICE_TEXT =
          "This topic is currently outside the scope of my capabilities, so I'm unable to discuss it further.";
      },
      46943(eA, el, ec) {
        "use strict";
        (ec.r(el), ec.d(el, { MessageUtils: () => MessageUtils }));
        var eu = ec(70724);
        let ed = "<user_query>",
          ep = "</user_query>",
          eg = /<user_query>[\s\S]*?<\/user_query>/g;
        let MessageUtils = class MessageUtils {
          static mergeConsecutiveUserMessages(eA) {
            if (0 === eA.length) return eA;
            let el = [],
              ec = [];
            for (let eu of eA)
              if ("message" === eu.type && "user" === eu.role) {
                let eA = eu;
                eA.providerData?.teammateMessage
                  ? (ec.length > 0 &&
                      (el.push(this.mergeUserMessageGroup(ec)), (ec = [])),
                    el.push(eA))
                  : ec.push(eA);
              } else
                (ec.length > 0 &&
                  (el.push(this.mergeUserMessageGroup(ec)), (ec = [])),
                  el.push(eu));
            return (
              ec.length > 0 && el.push(this.mergeUserMessageGroup(ec)),
              el
            );
          }
          static mergeUserMessageGroup(eA) {
            if (1 === eA.length) return eA[0];
            let el = [];
            for (let ec of eA)
              "string" == typeof ec.content
                ? el.push({ type: "input_text", text: ec.content })
                : Array.isArray(ec.content) && el.push(...ec.content);
            return { ...eA[0], content: el };
          }
          static addSystemReminder(eA, el, ec = "last") {
            let eu =
              "first" === ec
                ? this.findFirstUserMessage(eA)
                : this.findLastUserMessage(eA);
            eu &&
              (this.ensureContentIsArray(eu),
              Array.isArray(eu.content) &&
                eu.content.unshift({ type: "input_text", text: el }));
          }
          static findFirstUserMessage(eA) {
            return eA.find((eA) => "message" === eA.type && "user" === eA.role);
          }
          static findLastUserMessage(eA) {
            for (let el = eA.length - 1; el >= 0; el--) {
              let ec = eA[el];
              if ("message" === ec.type && "user" === ec.role) return ec;
            }
          }
          static firstUserMessageContainsRole(eA, el) {
            let ec = this.findFirstUserMessage(eA);
            if (!ec) return !1;
            let eu = `data-role="${el}"`,
              ed = ec.content;
            if ("string" == typeof ed) return ed.includes(eu);
            if (Array.isArray(ed)) {
              for (let eA of ed)
                if (
                  "input_text" === eA.type &&
                  "string" == typeof eA.text &&
                  eA.text.includes(eu)
                )
                  return !0;
            }
            return !1;
          }
          static ensureContentIsArray(eA) {
            "string" == typeof eA.content &&
              (eA.content = [{ type: "input_text", text: eA.content }]);
          }
          static extractSystemReminders(eA) {
            let el = [];
            for (let ec of eA)
              if ("message" === ec.type && "user" === ec.role) {
                let eA = ec.content;
                if ("string" == typeof eA) {
                  let ec = eA.match(
                    /<system-reminder\b[^>]*>[\s\S]*?<\/system-reminder>\s*/g,
                  );
                  ec && el.push(...ec);
                } else if (Array.isArray(eA)) {
                  for (let ec of eA)
                    if (
                      "input_text" === ec.type &&
                      "string" == typeof ec.text
                    ) {
                      let eA = ec.text.match(
                        /<system-reminder\b[^>]*>[\s\S]*?<\/system-reminder>\s*/g,
                      );
                      eA && el.push(...eA);
                    }
                }
              }
            return el;
          }
          static filterSystemReminders(eA) {
            for (let el of eA)
              if ("message" === el.type && "user" === el.role) {
                let eA = el;
                if ("string" == typeof eA.content)
                  eA.content = (0, eu.stripSystemReminderXml)(eA.content);
                else if (Array.isArray(eA.content)) {
                  for (let el of eA.content)
                    "input_text" === el.type &&
                      "string" == typeof el.text &&
                      (el.text = (0, eu.stripSystemReminderXml)(el.text));
                  eA.content = eA.content.filter(
                    (eA) =>
                      "input_text" !== eA.type ||
                      (eA.text && eA.text.trim().length > 0),
                  );
                }
              }
            return eA;
          }
          static stripUserQueryTagsFromMessages(eA) {
            for (let el of eA)
              if ("message" === el.type && "user" === el.role) {
                let eA = el;
                if ("string" == typeof eA.content)
                  eA.content = (0, eu.stripUserQueryXml)(eA.content);
                else if (Array.isArray(eA.content))
                  for (let el of eA.content)
                    "input_text" === el.type &&
                      "string" == typeof el.text &&
                      (el.text = (0, eu.stripUserQueryXml)(el.text));
              }
            return eA;
          }
          static createFilteredCopyForCompaction(eA) {
            let el = JSON.parse(JSON.stringify(eA));
            return (
              this.filterHiddenSystemRemindersForCompaction(el),
              this.stripUserQueryTagsFromMessages(el)
            );
          }
          static filterHiddenSystemRemindersForCompaction(eA) {
            for (let el of eA) {
              if ("message" !== el.type || "user" !== el.role) continue;
              let eA = el;
              if ("string" == typeof eA.content)
                eA.content = this.stripSystemRemindersOutsideUserQuery(
                  eA.content,
                );
              else if (Array.isArray(eA.content)) {
                for (let el of eA.content)
                  "input_text" === el.type &&
                    "string" == typeof el.text &&
                    (el.text = this.stripSystemRemindersOutsideUserQuery(
                      el.text,
                    ));
                eA.content = eA.content.filter(
                  (eA) =>
                    "input_text" !== eA.type ||
                    (eA.text && eA.text.trim().length > 0),
                );
              }
            }
            return eA;
          }
          static stripSystemRemindersOutsideUserQuery(eA) {
            let el = [],
              ec = "__CODEBUDDY_USER_QUERY_BLOCK_",
              ed = eA.replace(eg, (eA) => {
                let eu = `${ec}${el.length}__`;
                return (el.push(eA), eu);
              });
            return (0, eu.stripSystemReminderXml)(ed).replace(
              RegExp(`${ec}(\\d+)__`, "g"),
              (eA, ec) => el[Number(ec)] ?? "",
            );
          }
          static performMicrocompact(eA, el) {
            let ec = new Set([
                "Read",
                "Bash",
                "Grep",
                "Glob",
                "WebFetch",
                "WebSearch",
                "Edit",
                "MultiEdit",
                "Write",
              ]),
              eu = "[Old tool result content cleared by microcompact]";
            if (el?.keepRecent !== void 0) {
              let ed = el.keepRecent,
                ep = el.maxCharsPerResult ?? 1500,
                eg = [];
              for (let el = 0; el < eA.length; el++) {
                let eu = eA[el];
                "function_call_result" === eu.type &&
                  eu.name &&
                  ec.has(eu.name) &&
                  eg.push(el);
              }
              let eh = Math.max(0, eg.length - ed),
                ef = 0,
                em = 0;
              for (let el = 0; el < eg.length; el++) {
                let ec = eA[eg[el]];
                el < eh
                  ? (void 0 !== ec.output &&
                      (ec.output = { type: "text", text: eu }),
                    ec.providerData?.toolResult &&
                      (ec.providerData.toolResult = { content: eu }),
                    ef++)
                  : (em += this.truncateToolResultContent(ec, ep));
              }
              (ef > 0 || em > 0) &&
                process.stderr
                  .write(`[Microcompact] Aggressive: cleared ${ef}, truncated ${em} tool results, kept ${eg.length - ef} recent (maxChars=${ep}, from ${eA.length} items)
`);
              return;
            }
            let ed = Date.now(),
              ep = ed - 36e5,
              eg = 0;
            for (let el of eA) {
              let eA = el;
              if ("function_call_result" !== eA.type) continue;
              let eh = eA.name;
              eh &&
                ec.has(eh) &&
                !((eA.timestamp || ed) > ep) &&
                (void 0 !== eA.output &&
                  (eA.output = { type: "text", text: eu }),
                eA.providerData?.toolResult &&
                  (eA.providerData.toolResult = { content: eu }),
                eg++);
            }
            eg > 0 &&
              process.stderr
                .write(`[Microcompact] Cleared ${eg} old tool results from ${eA.length} items
`);
          }
          static truncateToolResultContent(eA, el) {
            let ec = !1,
              eu =
                "\n\n[... content truncated by microcompact to fit context limit]";
            if (
              (eA.output &&
              "object" == typeof eA.output &&
              "string" == typeof eA.output.text
                ? eA.output.text.length > el &&
                  ((eA.output.text = eA.output.text.slice(0, el) + eu),
                  (ec = !0))
                : "string" == typeof eA.output &&
                  eA.output.length > el &&
                  ((eA.output = eA.output.slice(0, el) + eu), (ec = !0)),
              eA.providerData?.toolResult)
            ) {
              let ed = eA.providerData.toolResult;
              "string" == typeof ed.content &&
                ed.content.length > el &&
                ((ed.content = ed.content.slice(0, el) + eu), (ec = !0));
            }
            return +!!ec;
          }
          static stripImagesForCompaction(eA) {
            let el = 0;
            for (let ec of eA) {
              let eA = ec;
              if (
                "message" === eA.type &&
                "user" === eA.role &&
                Array.isArray(eA.content)
              )
                for (let ec = 0; ec < eA.content.length; ec++) {
                  let eu = eA.content[ec];
                  (eu?.type === "input_image" || eu?.type === "image") &&
                    ((eA.content[ec] = { type: "input_text", text: "[image]" }),
                    el++);
                }
              if ("function_call_result" === eA.type) {
                let ec = eA.output;
                ec &&
                  "object" == typeof ec &&
                  ("image" === ec.type || ec.media_type) &&
                  ((eA.output = { type: "text", text: "[image]" }), el++);
              }
            }
            el > 0 &&
              process.stderr
                .write(`[Compact] Stripped ${el} images from messages
`);
          }
          static isSystemInjectedContent(eA) {
            return (
              eA.includes("<system-reminder") ||
              eA.includes("<command-message>") ||
              eA.includes("<command-name>") ||
              eA.includes("<local-command-stdout>") ||
              eA.includes("<channel ") ||
              eA.includes("<cb_summary>") ||
              eA.includes("<conversation_history_summary>") ||
              eA.includes("<task-notification>")
            );
          }
          static isUserQueryContent(eA) {
            return (
              "string" == typeof eA && eA.startsWith(ed) && eA.endsWith(ep)
            );
          }
          static wrapUserQuery(eA) {
            return `<user_query>${eA}</user_query>`;
          }
          static stripUserQueryTags(eA) {
            if ("string" != typeof eA || !eA.includes(ed)) return eA;
            let el = RegExp(`${ed}([\\s\\S]*?)${ep}`, "g");
            return eA.replace(el, (eA, el) => el.trim()).trim();
          }
          static stripSystemReminders(eA) {
            return (0, eu.stripSystemReminderXml)(eA);
          }
        };
      },
      2623(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            collectResendForkDiscardedIds: () => collectResendForkDiscardedIds,
            pruneResendForkBranches: () => pruneResendForkBranches,
          }));
        var eu = ec(58830);
        function pruneResendForkBranches(eA) {
          let el = collectResendForkDiscardedIds(eA);
          return 0 === el.size
            ? eA
            : eA.filter((eA) => !(eA.id && el.has(eA.id)));
        }
        function collectResendForkDiscardedIds(eA) {
          let el = new Set(),
            ec = [],
            ed = new Set();
          for (let el = 0; el < eA.length; el++) {
            let ep = eA[el];
            (ep.id && ed.add(ep.id),
              eu.InputItemUtils.isResendForkNoticeItem(ep) &&
                ec.push({
                  index: el,
                  forkPoint: ep.parentId,
                  editedUserItemId: ep.editedUserItemId,
                }));
          }
          if (0 === ec.length) return el;
          for (let ep of ec) {
            if (ep.editedUserItemId && ed.has(ep.editedUserItemId)) {
              el.add(ep.editedUserItemId);
              continue;
            }
            for (let ec = 0; ec < ep.index; ec++) {
              let ed = eA[ec];
              !(!ed.id || eu.InputItemUtils.isCustomInputItem(ed)) &&
                ((ep.forkPoint && ed.parentId !== ep.forkPoint) ||
                  el.add(ed.id));
            }
          }
          let ep = new Map();
          for (let el of eA) {
            let { id: eA, parentId: ec } = el;
            if (!eA || !ec) continue;
            let eu = ep.get(ec);
            eu ? eu.push(eA) : ep.set(ec, [eA]);
          }
          let eg = [...el];
          for (; eg.length > 0; ) {
            let eA = eg.pop();
            for (let ec of ep.get(eA) ?? [])
              el.has(ec) || (el.add(ec), eg.push(ec));
          }
          return el;
        }
      },
      4636(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            CompactSummaryNotFoundError: () => CompactSummaryNotFoundError,
            SummaryUtils: () => SummaryUtils,
          }));
        let CompactSummaryNotFoundError = class CompactSummaryNotFoundError extends Error {
          constructor(
            eA = "No compact summary could be extracted from compact agent output",
          ) {
            (super(eA),
              (this.isCompactNoSummary = !0),
              (this.name = "CompactSummaryNotFoundError"));
          }
        };
        let SummaryUtils = class SummaryUtils {
          static extractSummaryContent(eA) {
            if (!eA) return "";
            let el = eA.match(/<summary>([\s\S]*?)<\/summary>/);
            return (el?.[1] ?? eA).trim();
          }
          static hasCompactOutputStructure(eA) {
            return (
              !!eA &&
              (/<summary>[\s\S]+?<\/summary>/i.test(eA) ||
                /<conversation_history_summary>[\s\S]+?<\/conversation_history_summary>/i.test(
                  eA,
                ))
            );
          }
          static extractCompactSummaryFromText(eA) {
            if (
              eA &&
              "string" == typeof eA &&
              this.hasCompactOutputStructure(eA)
            )
              return this.extractSummaryContent(eA) || void 0;
          }
          static requireCompactSummaryFromText(eA) {
            let el = this.extractCompactSummaryFromText(eA);
            if (!el)
              throw new CompactSummaryNotFoundError(
                "Compact agent output does not contain a well-formed <summary>…</summary> or <conversation_history_summary>…</conversation_history_summary> envelope, or the extracted body is empty.",
              );
            return el;
          }
          static wrapSummaryWithContext(eA, el) {
            return [
              "This session is being continued from a previous conversation that ran out of context. The summary below covers the earlier portion of the conversation.\n\nSummary:",
              eA,
              "",
              `If you need specific details from before compaction (like exact code snippets, error messages, or content you generated), read the full transcript at: ${el}`,
            ].join("\n");
          }
          static extractTextFromAssistantContent(eA) {
            return "string" == typeof eA
              ? eA
              : Array.isArray(eA)
                ? eA
                    .filter(
                      (eA) =>
                        (eA?.type === "output_text" || eA?.type === "text") &&
                        "string" == typeof eA.text,
                    )
                    .map((eA) => eA.text)
                    .join("\n")
                : "";
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
              "Explicit native AgentRun utility dependency required: " +
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
  return { getModule: ec };
}
