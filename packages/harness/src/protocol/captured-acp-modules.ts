// @ts-nocheck
// Complete inert fixed CLI factories. No application bootstrap or installed account discovery.
import * as path from "node:path";
import * as crypto from "node:crypto";
import { ToolNames } from "../tools/tool-names.js";
export const ACP_INPUT_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const ACP_INPUT_FACTORIES = [
  [38548, 6914132, 6916576],
  [69466, 7006467, 7010486],
  [67330, 7684418, 7687591],
  [12502, 12986913, 13015034],
  [83473, 13015035, 13016732],
  [56037, 13371549, 13373358],
  [18703, 14976366, 15015643],
  [80742, 15015644, 15019667],
] as const;
export const ACP_VISIBLE_TODO_FUNCTION = [
  "getVisibleTodoItems",
  12192200,
  12192297,
] as const;
export function createCapturedAcpModules(runtime: any = {}) {
  const process: any = { env: runtime.env ?? {} },
    Date: any = runtime.Date ?? globalThis.Date;
  function getVisibleTodoItems(eA) {
    return eA.length > 0 && eA.every((eA) => "completed" === eA.status)
      ? []
      : eA;
  }
  const factories = {
    38548(eA, el, ec) {
      "use strict";
      (ec.r(el),
        ec.d(el, {
          buildAcpSessionEndUpdate: () => buildAcpSessionEndUpdate,
          createAcpHistoryMarker: () => createAcpHistoryMarker,
          getAcpItemTimestamp: () => getAcpItemTimestamp,
          getLatestAcpOutputTimestamp: () => getLatestAcpOutputTimestamp,
          resolveAcpTimestamp: () => resolveAcpTimestamp,
          withAcpTimestampMeta: () => withAcpTimestampMeta,
          withAcpTimestampRecord: () => withAcpTimestampRecord,
        }));
      var eu = ec(12502);
      function isRecord(eA) {
        return !!eA && "object" == typeof eA && !Array.isArray(eA);
      }
      let ed = new Set([
        "agent_message_chunk",
        "agent_thought_chunk",
        "tool_call",
        "tool_call_update",
        "plan",
      ]);
      function createAcpHistoryMarker(eA, el = Date.now()) {
        let ec = new Set(),
          eu = new Set();
        for (let el of eA)
          isRecord(el) &&
            (eu.add(el), "string" == typeof el.id && el.id && ec.add(el.id));
        return { startedAt: el, existingIds: ec, existingItems: eu };
      }
      function isAcpOutputHistoryItem(eA) {
        return eu.AcpUtils.convertHistoryItemToAcp(eA).some((eA) =>
          ed.has(eA.sessionUpdate),
        );
      }
      function getLatestAcpOutputTimestamp(eA, el) {
        let ec;
        for (let eu of eA) {
          if (!isRecord(eu)) continue;
          if (el) {
            let eA = "string" == typeof eu.id && eu.id ? eu.id : void 0;
            if (el.existingItems.has(eu) || (eA && el.existingIds.has(eA)))
              continue;
          }
          if (!isAcpOutputHistoryItem(eu)) continue;
          let eA = coerceTimestamp(eu.timestamp);
          void 0 === eA ||
            (el && eA < el.startedAt) ||
            (ec = void 0 === ec ? eA : Math.max(ec, eA));
        }
        return ec;
      }
      function coerceTimestamp(eA) {
        if ("number" == typeof eA && Number.isFinite(eA)) return eA;
        if ("string" == typeof eA && eA.trim()) {
          let el = Number(eA);
          if (Number.isFinite(el)) return el;
          let ec = Date.parse(eA);
          return Number.isFinite(ec) ? ec : void 0;
        }
      }
      function resolveAcpTimestamp(eA, el = Date.now()) {
        return coerceTimestamp(eA) ?? el;
      }
      function getAcpItemTimestamp(eA, el) {
        return isRecord(eA)
          ? resolveAcpTimestamp(eA.timestamp, el ?? Date.now())
          : (el ?? Date.now());
      }
      function withAcpTimestampRecord(eA, el = Date.now()) {
        let ec = { ...(isRecord(eA) ? eA : {}) },
          eu = resolveAcpTimestamp(ec.timestamp, el);
        if (
          (delete ec.timestamp,
          delete ec["codebuddy.ai/timestamp"],
          isRecord(ec["codebuddy.ai"]))
        ) {
          let eA = { ...ec["codebuddy.ai"] };
          (delete eA.timestamp,
            Object.keys(eA).length > 0
              ? (ec["codebuddy.ai"] = eA)
              : delete ec["codebuddy.ai"]);
        }
        return { ...ec, timestamp: new Date(eu).toISOString() };
      }
      function withAcpTimestampMeta(eA, el = Date.now()) {
        return {
          ...eA,
          _meta: withAcpTimestampRecord(
            isRecord(eA._meta) ? eA._meta : void 0,
            el,
          ),
        };
      }
      function buildAcpSessionEndUpdate(eA, el, ec = "end_turn") {
        let eu = {
          sessionUpdate: "session_end",
          stopReason: ec,
          ...(eA ? { _meta: { "codebuddy.ai/requestId": eA } } : {}),
        };
        return void 0 === el ? eu : withAcpTimestampMeta(eu, el);
      }
    },
    69466(eA, el, ec) {
      "use strict";
      (ec.r(el),
        ec.d(el, {
          AGENTS_WITH_MCP_ACCESS: () => ek,
          AGENT_TAG_SUFFIX: () => ev,
          AgentCompletionWaiter: () => eI,
          AgentFactory: () => eC,
          AgentManager: () => em,
          AgentNames: () => eu,
          AgentRunInterceptor: () => e_,
          AgentRunInterceptorPriority: () => ed,
          AgentService: () => eB,
          CLI_AGENT_TAG: () => eO,
          CLI_OUTPUT_STYLE_DESCRIPTION_TEMPLATE: () => eF,
          CUSTOM_AGENT_TAG: () => eN,
          CustomAgentManager: () => eE,
          CustomAgentSavePath: () => eg,
          CustomAgentScope: () => ep,
          DEFAULT_MAX_TURNS: () => eS,
          DEFAULT_TEMPERATURE: () => eR,
          ENV_DISABLE_FORK_SUBAGENT: () => eT,
          ENV_MAX_TURNS: () => eQ,
          ENV_SUBAGENT_MAX_TURNS: () => eD,
          INTERNAL_GENERATOR_AGENTS: () => eM,
          OutputStyleType: () => eh,
          PLUGIN_AGENT_TAG: () => eL,
          RunnerFactory: () => ey,
          RunnerProvider: () => ew,
          STATE_MACHINE_BYPASS_AGENTS: () => ex,
          SUB_AGENT_TAG: () => eP,
          isForkSubagentDisabled: () => isForkSubagentDisabled,
          shouldApplyForkSpecialization: () => shouldApplyForkSpecialization,
        }));
      var eu,
        ed,
        ep,
        eg,
        eh,
        ef = ec(51147);
      let em = Symbol("AgentManager"),
        eE = Symbol("CustomAgentManager"),
        eC = Symbol("AgentFactory"),
        ey = Symbol("RunnerFactory"),
        ew = Symbol("RunnerProvider"),
        eB = Symbol("AgentService"),
        e_ = Symbol("AgentRunInterceptor"),
        eI = Symbol("AgentCompletionWaiter"),
        ev = "-agent",
        eS = 500,
        eQ = "CODEBUDDY_CODE_MAX_TURNS",
        eD = "CODEBUDDY_CODE_SUBAGENT_MAX_TURNS",
        eT = "CODEBUDDY_DISABLE_FORK_SUBAGENT";
      function isForkSubagentDisabled() {
        return ef.BooleanUtils.isTruthy(process.env[eT]);
      }
      function shouldApplyForkSpecialization(eA) {
        return eA === eu.FORK && !isForkSubagentDisabled();
      }
      let eR = 1;
      !(function (eA) {
        ((eA.COMPACT = "compact"),
          (eA.CONTEXT_SUMMARY = "contextSummary"),
          (eA.CONTENT_ANALYZER = "contentAnalyzer"),
          (eA.GENERAL_PURPOSE = "general-purpose"),
          (eA.AGENT_INSTRUCTIONS = "agentInstructions"),
          (eA.EXPLORE = "Explore"),
          (eA.BASH = "Bash"),
          (eA.TERMINAL_TITLE_GENERATOR = "terminalTitleGenerator"),
          (eA.PROMPT_SUGGESTION = "promptSuggestion"),
          (eA.SUMMARY_GENERATOR = "summaryGenerator"),
          (eA.PROMPT_HOOK_EVALUATOR = "promptHookEvaluator"),
          (eA.INSIGHTS_ANALYZER = "insightsAnalyzer"),
          (eA.MEMORY_SELECTOR = "memorySelector"),
          (eA.AUTO_MODE_CLASSIFIER = "autoModeClassifier"),
          (eA.FORK = "fork"));
      })(eu || (eu = {}));
      let ek = new Set([eu.GENERAL_PURPOSE, eu.EXPLORE]),
        eM = new Set([
          eu.COMPACT,
          eu.CONTEXT_SUMMARY,
          eu.CONTENT_ANALYZER,
          eu.TERMINAL_TITLE_GENERATOR,
          eu.PROMPT_SUGGESTION,
          eu.SUMMARY_GENERATOR,
          eu.PROMPT_HOOK_EVALUATOR,
          eu.INSIGHTS_ANALYZER,
          eu.MEMORY_SELECTOR,
          eu.AGENT_INSTRUCTIONS,
          eu.AUTO_MODE_CLASSIFIER,
        ]),
        ex = new Set([
          eu.CONTENT_ANALYZER,
          eu.TERMINAL_TITLE_GENERATOR,
          eu.PROMPT_SUGGESTION,
          eu.SUMMARY_GENERATOR,
          eu.PROMPT_HOOK_EVALUATOR,
          eu.INSIGHTS_ANALYZER,
          eu.MEMORY_SELECTOR,
          eu.AGENT_INSTRUCTIONS,
          eu.AUTO_MODE_CLASSIFIER,
        ]);
      !(function (eA) {
        ((eA[(eA.Env = 2e3)] = "Env"),
          (eA[(eA.UserInput = 1900)] = "UserInput"),
          (eA[(eA.MessageQueue = 1800)] = "MessageQueue"),
          (eA[(eA.ReferencePathProcessor = 1750)] = "ReferencePathProcessor"),
          (eA[(eA.ConditionalRules = 1740)] = "ConditionalRules"),
          (eA[(eA.SkipRun = 1700)] = "SkipRun"),
          (eA[(eA.PreMessageCompact = 1650)] = "PreMessageCompact"),
          (eA[(eA.AgentSwitch = 1600)] = "AgentSwitch"),
          (eA[(eA.ProviderData = 1500)] = "ProviderData"),
          (eA[(eA.History = 1400)] = "History"),
          (eA[(eA.MessageReorganize = 1300)] = "MessageReorganize"),
          (eA[(eA.SandboxLifecycle = 1210)] = "SandboxLifecycle"),
          (eA[(eA.SystemReminderContext = 1200)] = "SystemReminderContext"),
          (eA[(eA.WorktreeContext = 1190)] = "WorktreeContext"),
          (eA[(eA.TeamContext = 1175)] = "TeamContext"),
          (eA[(eA.TeammateFailureContext = 1160)] = "TeammateFailureContext"),
          (eA[(eA.MemoryContext = 1150)] = "MemoryContext"),
          (eA[(eA.ImageCompression = 1075)] = "ImageCompression"),
          (eA[(eA.ImageRehydration = 1050)] = "ImageRehydration"),
          (eA[(eA.UserQueryWrapper = 1025)] = "UserQueryWrapper"),
          (eA[(eA.State = 1e3)] = "State"),
          (eA[(eA.Model = 900)] = "Model"),
          (eA[(eA.JsonSchema = 875)] = "JsonSchema"),
          (eA[(eA.ImageFilter = 850)] = "ImageFilter"),
          (eA[(eA.Continued = 800)] = "Continued"),
          (eA[(eA.Telemetry = 700)] = "Telemetry"),
          (eA[(eA.Sandbox = 550)] = "Sandbox"),
          (eA[(eA.TokenCalculation = 500)] = "TokenCalculation"));
      })(ed || (ed = {}));
      let eO = "cli",
        eN = "custom",
        eP = "sub-agent",
        eL = "plugin";
      (!(function (eA) {
        ((eA.PROJECT = "project"), (eA.USER = "user"));
      })(ep || (ep = {})),
        (function (eA) {
          ((eA.PROJECT = ".codebuddy/agents/"),
            (eA.USER = "~/.codebuddy/agents/"));
        })(eg || (eg = {})),
        (function (eA) {
          ((eA.DEFAULT = "default"),
            (eA.EXPLANATORY = "explanatory"),
            (eA.LEARNING = "learning"));
        })(eh || (eh = {})));
      let eF = "cli-output-style-description";
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
    12502(eA, el, ec) {
      "use strict";
      (ec.r(el), ec.d(el, { AcpUtils: () => AcpUtils }));
      var eu = ec(80699),
        ed = ec(70724),
        ep = ec(54601),
        eg = ec(79896),
        eh = ec(70857),
        ef = ec(16928),
        em = ec(69466),
        eE = ec(8443),
        eC = ec(67330),
        ey = ec(57651),
        ew = ec(83473),
        eB = ec(67019),
        e_ = ec(75796),
        eI = ec(72297),
        ev = ec(8046),
        eS = ec(58830);
      function isRecord(eA) {
        return "object" == typeof eA && null !== eA && !Array.isArray(eA);
      }
      function extractPersistedMcpUi(eA) {
        if (!isRecord(eA)) return;
        let el = eA.mcpUi;
        if (
          isRecord(el) &&
          "string" == typeof el.toolResourceUri &&
          el.toolResourceUri.length > 0
        )
          return el;
        let ec = eA;
        if (!isRecord(ec.mcpMeta)) return;
        let eu = ec.mcpMeta;
        if ("string" != typeof eu.uiResourceUri || !eu.uiResourceUri) return;
        let ed = Array.isArray(ec.content)
            ? ec.content
            : "string" == typeof ec.content
              ? [{ type: "text", text: ec.content }]
              : void 0,
          ep = isRecord(ec.rawResponse) ? ec.rawResponse : void 0;
        return {
          toolResourceUri: eu.uiResourceUri,
          toolResult: {
            ...(ed ? { content: ed } : {}),
            ...(isRecord(eu.structuredContent)
              ? { structuredContent: eu.structuredContent }
              : {}),
            ...(isRecord(eu._meta) ? { _meta: eu._meta } : {}),
            ...(ep?.is_error === !0 || "string" == typeof ec.error
              ? { isError: !0 }
              : {}),
          },
        };
      }
      let eQ = new Set(["auto", "auto-chat"]);
      let AcpUtils = class AcpUtils {
        static isInternalStreamingUpdate(eA) {
          if (!eA || "object" != typeof eA) return !1;
          let el = eA.sessionUpdate;
          return (
            "string" == typeof el && AcpUtils.INTERNAL_STREAMING_UPDATES.has(el)
          );
        }
        static isInterruptedByUserMessage(eA) {
          if ("message" !== eA.type || "assistant" !== eA.role) return !1;
          let el = eA.content;
          return "string" == typeof el
            ? el === ev.INTERRUPTED_BY_USER_MESSAGE
            : !!Array.isArray(el) &&
                el.some(
                  (eA) =>
                    "output_text" === eA.type &&
                    eA.text === ev.INTERRUPTED_BY_USER_MESSAGE,
                );
        }
        static getProviderMessageId(eA) {
          let el = eA?.providerData?.messageId;
          return "string" == typeof el && el.length > 0 ? el : void 0;
        }
        static isRecord(eA) {
          return !!eA && "object" == typeof eA && !Array.isArray(eA);
        }
        static attachToolMetaData(eA, el) {
          let ec = AcpUtils.isRecord(eA["codebuddy.ai"])
              ? eA["codebuddy.ai"]
              : {},
            eu = AcpUtils.isRecord(ec.toolMetaData) ? ec.toolMetaData : {};
          eA["codebuddy.ai"] = { ...ec, toolMetaData: { ...eu, ...el } };
        }
        static parseToRecord(eA, el) {
          if (eA) {
            if ("string" == typeof eA)
              try {
                return JSON.parse(eA);
              } catch {
                return { [el]: eA };
              }
            return "object" == typeof eA ? eA : { [el]: eA };
          }
        }
        static parseFunctionCallRawInput(eA) {
          let el =
              eA.providerData && "object" == typeof eA.providerData
                ? eA.providerData
                : void 0,
            ec =
              el?.rawItem && "object" == typeof el.rawItem
                ? el.rawItem
                : void 0,
            eu =
              el?.toolCall && "object" == typeof el.toolCall
                ? el.toolCall
                : void 0,
            ed =
              el?.toolUse && "object" == typeof el.toolUse
                ? el.toolUse
                : void 0;
          for (let ep of [
            eA.arguments,
            eA.rawInput,
            eA.input,
            eA.parameters,
            el?.rawInput,
            el?.input,
            el?.arguments,
            ec?.arguments,
            ec?.rawInput,
            ec?.input,
            eu?.input,
            eu?.function?.arguments,
            ed?.input,
          ]) {
            let eA = AcpUtils.parseToRecord(ep, "arguments");
            if (void 0 !== eA) return eA;
          }
          return {};
        }
        static parseFunctionCallResultRawInput(eA) {
          let el =
              eA.providerData && "object" == typeof eA.providerData
                ? eA.providerData
                : void 0,
            ec =
              el?.rawItem && "object" == typeof el.rawItem
                ? el.rawItem
                : void 0,
            eu =
              el?.toolCall && "object" == typeof el.toolCall
                ? el.toolCall
                : void 0,
            ed =
              el?.toolUse && "object" == typeof el.toolUse
                ? el.toolUse
                : void 0;
          for (let ep of [
            eA.rawInput,
            eA.input,
            eA.parameters,
            eA.arguments,
            el?.rawInput,
            el?.input,
            el?.arguments,
            ec?.arguments,
            ec?.rawInput,
            ec?.input,
            eu?.input,
            eu?.function?.arguments,
            ed?.input,
          ]) {
            let eA = AcpUtils.parseToRecord(ep, "arguments");
            if (void 0 !== eA && Object.keys(eA).length > 0) return eA;
          }
        }
        static convertTodosToPlanEntries(eA) {
          return (0, ey.getVisibleTodoItems)(eA.newTodos ?? eA.todos ?? []).map(
            (eA, el) => ({
              content: eA.content,
              status: eA.status,
              priority: "medium",
              _meta: {
                id: eA.id ?? `task-${el}`,
                ...(eA.dependencies && eA.dependencies.length > 0
                  ? { dependencies: eA.dependencies }
                  : {}),
                "codebuddy.ai": {
                  id: eA.id ?? `task-${el}`,
                  activeForm: eA.activeForm ?? eA.content,
                  ...(eA.dependencies && eA.dependencies.length > 0
                    ? { dependencies: eA.dependencies }
                    : {}),
                  order: el,
                },
              },
            }),
          );
        }
        static convertHistoryItemToAcp(eA) {
          if ("message" === eA.type && "user" === eA.role) {
            if (
              eA.providerData?.isMeta === !0 &&
              !eA.providerData?.isCompactInternal
            )
              return [];
            if (eA.providerData?.goalStatus)
              return [
                {
                  sessionUpdate: "session_info_update",
                  _meta: {
                    "codebuddy.ai/goalStatus": {
                      ...eA.providerData.goalStatus,
                      id: eA.id,
                    },
                  },
                },
              ];
            let el = eA.content;
            if (!el) return [];
            let ec = eA.id || `user-${eA.timestamp || Date.now()}`,
              eu = { "codebuddy.ai/messageId": ec };
            if (
              (eA.providerData?.isCompactInternal &&
                (eu["codebuddy.ai/isCompactInternal"] = !0),
              eA.providerData?.compactType &&
                (eu[eC.ACP_META_COMPACT_TYPE] = eA.providerData.compactType),
              eS.InputItemUtils.isCompactContinuePromptMessage(eA))
            )
              return [];
            if (eS.InputItemUtils.isCompactBoundaryMessage(eA))
              return [
                {
                  sessionUpdate: "agent_message_chunk",
                  messageId: ec,
                  content: {
                    type: "text",
                    text:
                      "string" == typeof el
                        ? el
                        : el
                            .filter((eA) => "input_text" === eA.type && eA.text)
                            .map((eA) => eA.text)
                            .join("\n"),
                  },
                  _meta: { ...eu, "codebuddy.ai/isCompactInternal": !0 },
                },
              ];
            if ("string" == typeof el) {
              let eA = el,
                ep = AcpUtils.extractChannelInfo(eA);
              if (
                ((eA = (0, ed.stripPromptContextXml)(eA)),
                ep && (eA = ep.content),
                eB.CommandMessageUtils.isSystemInternalMessage(eA) || !eA)
              )
                return [];
              let eg = eB.CommandMessageUtils.parseInput(eA);
              if (eg) {
                let eA = { ...eu };
                return (
                  ep &&
                    ((eA["codebuddy.ai/channelSource"] = ep.source),
                    (eA["codebuddy.ai/channelSender"] = ep.sender),
                    ep.chatId && (eA["codebuddy.ai/channelChatId"] = ep.chatId),
                    ep.chatType &&
                      (eA["codebuddy.ai/channelChatType"] = ep.chatType)),
                  eg.type === eB.CommandType.COMMAND &&
                    (eA["codebuddy.ai/commandKind"] = "slash"),
                  [
                    {
                      sessionUpdate: "user_message_chunk",
                      messageId: ec,
                      content: { type: "text", text: eg.text },
                      ...(Object.keys(eA).length > 0 && { _meta: eA }),
                    },
                  ]
                );
              }
              let eh = eB.CommandMessageUtils.parseOutput(eA);
              if (eh && eh.text.trim()) {
                let eA = eh.text.replace(
                  /\n\n {2}Scan to open Web UI:\n[\s\S]*$/,
                  "",
                );
                return [
                  {
                    sessionUpdate: "agent_message_chunk",
                    messageId: ec,
                    content: {
                      type: "text",
                      text:
                        "```\n" +
                        (eA = ew.AnsiUtils.replaceAnsiColor(eA)).trimEnd() +
                        "\n```",
                    },
                  },
                ];
              }
              let ef = { ...eu };
              return (
                ep &&
                  ((ef["codebuddy.ai/channelSource"] = ep.source),
                  (ef["codebuddy.ai/channelSender"] = ep.sender),
                  ep.chatId && (ef["codebuddy.ai/channelChatId"] = ep.chatId),
                  ep.chatType &&
                    (ef["codebuddy.ai/channelChatType"] = ep.chatType)),
                [
                  {
                    sessionUpdate: "user_message_chunk",
                    messageId: ec,
                    content: { type: "text", text: eA },
                    ...(Object.keys(ef).length > 0 && { _meta: ef }),
                  },
                ]
              );
            }
            if (Array.isArray(el)) {
              let eA = [],
                ep = el
                  .filter((eA) => "input_text" === eA.type)
                  .map((eA) => eA.text)
                  .join("\n"),
                eg = AcpUtils.extractChannelInfo(ep),
                eh = [];
              for (let ed of el) {
                if (ed?.type === "input_text" && "string" == typeof ed.text) {
                  let el = ed.text;
                  if (eB.CommandMessageUtils.isSystemInternalMessage(el)) {
                    eh.push(ed);
                    continue;
                  }
                  if (AcpUtils.isImageLocalPathText(el)) continue;
                  let ep = eB.CommandMessageUtils.parseInput(el);
                  if (ep) {
                    let el = { ...eu };
                    (0 === eA.length &&
                      eg &&
                      ((el["codebuddy.ai/channelSource"] = eg.source),
                      (el["codebuddy.ai/channelSender"] = eg.sender),
                      eg.chatId &&
                        (el["codebuddy.ai/channelChatId"] = eg.chatId),
                      eg.chatType &&
                        (el["codebuddy.ai/channelChatType"] = eg.chatType)),
                      ep.type === eB.CommandType.COMMAND &&
                        (el["codebuddy.ai/commandKind"] = "slash"),
                      eA.push({
                        sessionUpdate: "user_message_chunk",
                        messageId: ec,
                        content: { type: "text", text: ep.text },
                        ...(Object.keys(el).length > 0 && { _meta: el }),
                      }));
                    continue;
                  }
                  let ef = eB.CommandMessageUtils.parseOutput(el);
                  if (ef) {
                    if (ef.text.trim()) {
                      let el = ef.text.replace(
                        /\n\n {2}Scan to open Web UI:\n[\s\S]*$/,
                        "",
                      );
                      ((el = ew.AnsiUtils.replaceAnsiColor(el)),
                        eA.push({
                          sessionUpdate: "agent_message_chunk",
                          messageId: ec,
                          content: {
                            type: "text",
                            text: "```\n" + el.trimEnd() + "\n```",
                          },
                        }));
                    }
                    continue;
                  }
                }
                eh.push(ed);
              }
              if (eh.length > 0)
                for (let el of (0,
                ed.decodePersistedUserContentToAcpContentBlocks)(eh, {
                  convertPersistedImageBlock: (eA) =>
                    this.convertPersistedUserImageBlockToAcpContentBlock(eA),
                })) {
                  let ep = { ...eu };
                  if (
                    (0 === eA.length &&
                      eg &&
                      ((ep["codebuddy.ai/channelSource"] = eg.source),
                      (ep["codebuddy.ai/channelSender"] = eg.sender),
                      eg.chatId &&
                        (ep["codebuddy.ai/channelChatId"] = eg.chatId),
                      eg.chatType &&
                        (ep["codebuddy.ai/channelChatType"] = eg.chatType)),
                    "text" === el.type)
                  ) {
                    let eu = el.text || "";
                    if (
                      (eg && 0 === eA.length && (eu = eg.content),
                      (eu.includes("<system-reminder") ||
                        eu.includes("<user_query>")) &&
                        (eu = (0, ed.stripPromptContextXml)(eu)),
                      !eu ||
                        eB.CommandMessageUtils.isSystemInternalMessage(eu) ||
                        AcpUtils.isImageLocalPathText(eu))
                    )
                      continue;
                    eA.push({
                      sessionUpdate: "user_message_chunk",
                      messageId: ec,
                      content: { type: "text", text: eu },
                      ...(Object.keys(ep).length > 0 && { _meta: ep }),
                    });
                    continue;
                  }
                  let eh = el._meta?.filename || el.uri;
                  (eh &&
                    "image" === el.type &&
                    (ep["codebuddy.ai/filename"] = eh),
                    eA.push({
                      sessionUpdate: "user_message_chunk",
                      messageId: ec,
                      content: el,
                      ...(Object.keys(ep).length > 0 && { _meta: ep }),
                    }));
                }
              return eA;
            }
            return [];
          }
          if ("message" === eA.type && "assistant" === eA.role) {
            let el = eA.content;
            if (
              !el ||
              (eA.providerData?.skipRun === !0 &&
                ("incomplete" === eA.status || eA.providerData?.error) &&
                !AcpUtils.isInterruptedByUserMessage(eA))
            )
              return [];
            let ec = "";
            if (
              ("string" == typeof el
                ? (ec = el)
                : Array.isArray(el) &&
                  (ec = el
                    .filter((eA) => "output_text" === eA.type)
                    .map((eA) => eA.text)
                    .join("\n")),
              !ec)
            )
              return [];
            let eu =
                eA.providerData?.isCompactInternal ||
                eA.providerData?.agent === em.AgentNames.COMPACT,
              ed =
                AcpUtils.getProviderMessageId(eA) ||
                eA.id ||
                `assistant-${eA.timestamp || Date.now()}`,
              ep = { "codebuddy.ai/messageId": ed };
            (eu && (ep["codebuddy.ai/isCompactInternal"] = !0),
              eA.providerData?.contentFilterNotice &&
                (ep[eC.ACP_META_CONTENT_FILTER_NOTICE] = !0),
              eA.providerData?.compactType &&
                (ep[eC.ACP_META_COMPACT_TYPE] = eA.providerData.compactType),
              eA.providerData?.traceId &&
                (ep["codebuddy.ai/traceId"] = eA.providerData.traceId),
              eA.providerData?.conversationRequestId &&
                (ep["codebuddy.ai/requestId"] =
                  eA.providerData.conversationRequestId));
            let eg = eA.providerData?.requestModelId || eA.providerData?.model,
              eh =
                eA.providerData?.requestModelName || eA.providerData?.modelName,
              ef = eA.providerData?.model,
              eE =
                ef && ef !== eA.providerData?.requestModelId && !eQ.has(ef)
                  ? ef
                  : void 0;
            return (
              eg && (ep["codebuddy.ai/requestModelId"] = eg),
              eh && (ep["codebuddy.ai/requestModelName"] = eh),
              eE && (ep["codebuddy.ai/responseModelId"] = eE),
              [
                {
                  sessionUpdate: "agent_message_chunk",
                  messageId: ed,
                  content: { type: "text", text: ec },
                  _meta: ep,
                },
              ]
            );
          }
          if (
            "function_call" === eA.type ||
            "function_call_result" === eA.type ||
            "function_call_output" === eA.type
          ) {
            let el = AcpUtils.convertInputItemToAcp(eA, {});
            return el ? [el] : [];
          }
          if ("reasoning" === eA.type) {
            let el =
                AcpUtils.getProviderMessageId(eA) ||
                ("string" == typeof eA.id ? eA.id : void 0),
              ec = eA.rawContent;
            if (!ec || 0 === ec.length) return [];
            let eu = ec
              .filter((eA) => "reasoning_text" === eA.type && eA.text)
              .map((eA) => eA.text)
              .join("");
            return eu
              ? [
                  {
                    sessionUpdate: "agent_thought_chunk",
                    ...(el ? { messageId: el } : {}),
                    content: { type: "text", text: eu },
                    ...(el ? { _meta: { "codebuddy.ai/messageId": el } } : {}),
                  },
                ]
              : [];
          }
          if ("message" === eA.type && "system" === eA.role) {
            let el = eA.providerData;
            if (el?.isSessionSeparator === !0) {
              let ec = el.separatorMessageId ?? eA.id;
              return ec
                ? [
                    {
                      sessionUpdate: "session_info_update",
                      _meta: {
                        "codebuddy.ai": {
                          isHistoryReplay: !0,
                          messageId: ec,
                          isSessionSeparator: !0,
                          separatorExtra:
                            el.separatorExtra &&
                            "object" == typeof el.separatorExtra
                              ? el.separatorExtra
                              : { isSessionSeparator: !0 },
                        },
                      },
                    },
                  ]
                : [];
            }
            return [];
          }
          return "goal-progress" === eA.type
            ? [
                {
                  sessionUpdate: "session_info_update",
                  _meta: {
                    "codebuddy.ai/goalProgress": {
                      id: eA.id,
                      condition: eA.condition,
                      reason: eA.reason,
                      turnCount: eA.turnCount,
                    },
                  },
                },
              ]
            : [];
        }
        static convertInputItemToAcp(eA, el = {}, ec) {
          let ed = ec?.parentToolUseId
            ? { "codebuddy.ai/parentToolCallId": ec.parentToolUseId }
            : void 0;
          if ("function_call" === eA.type) {
            let ec = eA,
              ep =
                AcpUtils.getProviderMessageId(eA) ||
                ("string" == typeof ec.id ? ec.id : void 0);
            if (ec.name === ey.ToolNames.TODO_WRITE)
              try {
                let eA = JSON.parse(ec.arguments),
                  el = eA?.newTodos ?? eA?.todos;
                if ("string" == typeof el)
                  try {
                    el = JSON.parse(el);
                  } catch {}
                if (Array.isArray(el))
                  return {
                    sessionUpdate: "plan",
                    entries: AcpUtils.convertTodosToPlanEntries({
                      ...eA,
                      newTodos: el,
                    }),
                  };
              } catch (eA) {
                eu.ContainerUtil.get(eE.ConsoleManager).error(
                  "[AcpUtils] Failed to parse TodoWrite input:",
                  eA,
                );
              }
            let eg = AcpUtils.parseFunctionCallRawInput(ec),
              eh = AcpUtils.toolInfoFromToolUse(
                { name: ec.name, input: eg },
                el,
              ),
              ef = {
                ...{
                  "codebuddy.ai/toolName": ec.name,
                  "codebuddy.ai/toolArgumentsComplete": !0,
                  ...(ep ? { "codebuddy.ai/messageId": ep } : {}),
                },
                ...ed,
                ...eh._meta,
              };
            if (ec.name === ey.ToolNames.EXIT_PLAN_MODE) {
              let eA = ec.providerData?.toolResult?.content;
              eA &&
                "string" == typeof eA &&
                (ef["codebuddy.ai/planContent"] = eA);
            }
            return {
              sessionUpdate: "tool_call",
              ...(ep ? { messageId: ep } : {}),
              toolCallId: ec.callId,
              status:
                "completed" === ec.status
                  ? "completed"
                  : "in_progress" === ec.status
                    ? "in_progress"
                    : "incomplete" === ec.status
                      ? "failed"
                      : "pending",
              rawInput: eg,
              title: eh.title,
              kind: eh.kind,
              content: eh.content,
              locations: eh.locations,
              ...(ef && { _meta: ef }),
            };
          }
          if (
            "function_call_result" === eA.type ||
            "function_call_output" === eA.type
          ) {
            let el = eA,
              ec = AcpUtils.getProviderMessageId(eA);
            if (el.name === ey.ToolNames.TODO_WRITE) return null;
            let { acpStatus: eu, businessFailed: ep } =
                AcpUtils.resolveAcpToolStatus(el),
              eg = AcpUtils.parseFunctionCallResultRawInput(el),
              eh = { ...(ed || {}) };
            ("string" == typeof el.name &&
              el.name.length > 0 &&
              (eh["codebuddy.ai/toolName"] = el.name),
              ec && (eh["codebuddy.ai/messageId"] = ec));
            let ef = el.providerData?.toolResult?.rawResponse;
            void 0 !== ef && (eh["codebuddy.ai/rawResponse"] = ef);
            let em = extractPersistedMcpUi(el.providerData?.toolResult);
            (em && AcpUtils.attachToolMetaData(eh, { mcpUi: em }),
              ep && (eh["codebuddy.ai/businessFailed"] = !0));
            let eE = Object.keys(eh).length > 0;
            return el.name === ey.ToolNames.BASH
              ? "failed" === eu && el.output
                ? {
                    sessionUpdate: "tool_call_update",
                    ...(ec ? { messageId: ec } : {}),
                    toolCallId: el.callId,
                    status: eu,
                    content: [AcpUtils.wrapInCodeBlock(el.output)],
                    ...(eg ? { rawInput: eg } : {}),
                    rawOutput: AcpUtils.parseToRecord(el.output, "output"),
                    ...(eE && { _meta: eh }),
                  }
                : {
                    sessionUpdate: "tool_call_update",
                    ...(ec ? { messageId: ec } : {}),
                    toolCallId: el.callId,
                    status: eu,
                    ...(eg ? { rawInput: eg } : {}),
                    rawOutput: AcpUtils.parseToRecord(el.output, "output"),
                    ...(eE && { _meta: eh }),
                  }
              : {
                  sessionUpdate: "tool_call_update",
                  ...(ec ? { messageId: ec } : {}),
                  toolCallId: el.callId,
                  status: eu,
                  content: el.output
                    ? [AcpUtils.convertToolResultToAcp(el.output)]
                    : void 0,
                  ...(eg ? { rawInput: eg } : {}),
                  rawOutput: AcpUtils.parseToRecord(el.output, "output"),
                  ...(eE && { _meta: eh }),
                };
          }
          return null;
        }
        static resolveAcpToolStatus(eA) {
          let el = eA.providerData?.error,
            ec = eA.providerData?.toolResult?.error;
          if (
            AcpUtils.isTruthyErrorField(el) ||
            AcpUtils.isTruthyErrorField(ec)
          )
            return {
              acpStatus: "failed",
              businessFailed: "completed" === eA.status,
            };
          switch (eA.status) {
            case "completed":
              return { acpStatus: "completed", businessFailed: !1 };
            case "in_progress":
              return { acpStatus: "in_progress", businessFailed: !1 };
            case "incomplete":
              return { acpStatus: "failed", businessFailed: !1 };
            default:
              return { acpStatus: "pending", businessFailed: !1 };
          }
        }
        static isTruthyErrorField(eA) {
          if (!eA) return !1;
          if ("string" == typeof eA) return eA.trim().length > 0;
          if ("object" == typeof eA) {
            let el = eA.message;
            return (
              ("string" == typeof el && el.trim().length > 0) ||
              Object.keys(eA).length > 0
            );
          }
          return !1;
        }
        static convertOpenAIEventToAcp(eA) {
          switch (eA.type) {
            case "output_text_delta":
              return [
                {
                  sessionUpdate: "agent_message_chunk",
                  content: { type: "text", text: eA.delta },
                },
              ];
            case "response_started":
            case "response_done":
            default:
              return [];
            case "model": {
              let el = eA.event;
              if (!el) return [];
              let ec = [],
                eu = !1,
                ed = el.choices;
              if (ed?.[0]?.delta) {
                let eA = ed[0].delta,
                  el =
                    "reasoning_content" in eA &&
                    "string" == typeof eA.reasoning_content &&
                    "" !== eA.reasoning_content
                      ? eA.reasoning_content
                      : void 0,
                  ep = eA.tool_calls,
                  eg = [];
                if (Array.isArray(ep) && ep.length > 0) {
                  for (let eA of ep) {
                    if (!eA) continue;
                    let el = eA.index,
                      ec = "string" == typeof eA.id,
                      eu = eA.function?.name;
                    ec
                      ? eg.push({
                          sessionUpdate: "tool_call_pending",
                          toolCallId: eA.id,
                          toolName: eu,
                          toolCallIndex: el,
                        })
                      : eu &&
                        eg.push({
                          sessionUpdate: "tool_call_pending",
                          toolCallId: void 0,
                          toolName: eu,
                          toolCallIndex: el,
                        });
                    let ed = eA.function?.arguments;
                    "string" == typeof ed &&
                      ed.length > 0 &&
                      eg.push({
                        sessionUpdate: "tool_call_arguments_delta",
                        toolCallId: ec ? eA.id : void 0,
                        toolCallIndex: el,
                        argumentsDelta: ed,
                        toolName: eu,
                      });
                  }
                  eu = !0;
                }
                (void 0 !== el &&
                  ec.push(
                    AcpUtils.withSourceEventMeta(
                      {
                        sessionUpdate: "agent_thought_chunk",
                        content: { type: "text", text: el },
                      },
                      eu ? ["reasoning", "tool"] : ["reasoning"],
                    ),
                  ),
                  ec.push(...eg));
              }
              switch (el.type) {
                case "response.output_item.added": {
                  let eA = el.item;
                  eA?.type === "function_call" &&
                    eA.call_id &&
                    eA.name &&
                    ec.push({
                      sessionUpdate: "tool_call_pending",
                      toolCallId: eA.call_id,
                      toolName: eA.name,
                    });
                  break;
                }
                case "response.content_part.added":
                  break;
                case "response.text.delta": {
                  let eA = el.delta;
                  eA &&
                    ec.push({
                      sessionUpdate: "agent_message_chunk",
                      content: { type: "text", text: eA },
                    });
                  break;
                }
                case "response.function_call_arguments.delta": {
                  let eA = el.call_id,
                    eu = el.delta;
                  eA &&
                    "string" == typeof eu &&
                    eu.length > 0 &&
                    ec.push({
                      sessionUpdate: "tool_call_arguments_delta",
                      toolCallId: eA,
                      argumentsDelta: eu,
                    });
                  break;
                }
                case "response.function_call_arguments.done": {
                  let eA = el.call_id,
                    eu = el.arguments;
                  eA &&
                    "string" == typeof eu &&
                    ec.push({
                      sessionUpdate: "tool_call_arguments_done",
                      toolCallId: eA,
                      argumentsFinal: eu,
                    });
                }
              }
              return ec;
            }
          }
        }
        static withSourceEventMeta(eA, el) {
          let ec = eA._meta;
          return {
            ...eA,
            _meta: {
              ...(ec ?? {}),
              [AcpUtils.SOURCE_EVENT_META_KEY]: { facets: el },
            },
          };
        }
        static wrapInCodeBlock(eA) {
          let el;
          return (
            (el =
              "string" == typeof eA
                ? eA
                : eA && "object" == typeof eA && "text" === eA.type && eA.text
                  ? eA.text
                  : JSON.stringify(eA, null, 2)),
            {
              type: "content",
              content: {
                type: "text",
                text: `\`\`\`
${el}
\`\`\``,
              },
            }
          );
        }
        static convertToolResultToAcp(eA) {
          if ("string" == typeof eA) {
            try {
              let el = JSON.parse(eA);
              if (Array.isArray(el) && el.length > 0) {
                let eA = el.find(
                  (eA) => "image_url" === eA.type || "image" === eA.type,
                );
                if (eA) return AcpUtils.convertToolResultToAcp(eA);
              }
            } catch {}
            return { type: "content", content: { type: "text", text: eA } };
          }
          if (Array.isArray(eA) && eA.length > 0) {
            let el = eA.find(
              (eA) => "image_url" === eA.type || "image" === eA.type,
            );
            return el
              ? AcpUtils.convertToolResultToAcp(el)
              : {
                  type: "content",
                  content: { type: "text", text: JSON.stringify(eA, null, 2) },
                };
          }
          if (eA && "object" == typeof eA) {
            if ("text" === eA.type && eA.text) {
              try {
                let el = JSON.parse(eA.text);
                if (Array.isArray(el) && el.length > 0) {
                  let eA = el.find(
                    (eA) => "image_url" === eA.type || "image" === eA.type,
                  );
                  if (eA) return AcpUtils.convertToolResultToAcp(eA);
                }
              } catch {}
              return {
                type: "content",
                content: { type: "text", text: eA.text },
              };
            }
            if ("image" === eA.type && eA.data)
              return {
                type: "content",
                content: {
                  type: "image",
                  data: eA.data,
                  mimeType: eA.mediaType || eA.mimeType || "image/png",
                },
              };
            if ("image_url" === eA.type && eA.image_url?.url) {
              let el = eA.image_url.url,
                ec = el.match(/^data:([^;]+);base64,(.+)$/);
              return ec
                ? {
                    type: "content",
                    content: { type: "image", data: ec[2], mimeType: ec[1] },
                  }
                : { type: "content", content: { type: "image_url", url: el } };
            }
          }
          return {
            type: "content",
            content: { type: "text", text: JSON.stringify(eA, null, 2) },
          };
        }
        static extractChannelInfo(eA) {
          let el,
            ec,
            eu = /<channel\s+([^>]*)>([^<]*)<\/channel>/,
            ed = [...eA.matchAll(RegExp(eu, "g"))],
            ep = ed.length > 0 ? ed[ed.length - 1] : null;
          if (!ep) return null;
          let eg = ep[1],
            eh = ep[2]
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&amp;/g, "&")
              .trim(),
            ef = {},
            em = /(\w+)="([^"]*)"/g;
          for (; null !== (el = em.exec(eg)); ) {
            let eA = el[2]
              .replace(/&quot;/g, '"')
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&amp;/g, "&");
            ef[el[1]] = eA;
          }
          let eE = ef.source;
          return eE
            ? ("group" === ef.chattype
                ? (ec = "group")
                : "single" === ef.chattype && (ec = "single"),
              {
                source: eE,
                sender: ef.sender || ef.user || "",
                chatId: ef.chat_id,
                chatType: ec,
                content: eh,
              })
            : null;
        }
        static inferToolKind(eA) {
          let el = eA.toLowerCase();
          return el.includes("read") ||
            el.includes("list") ||
            el.includes("glob") ||
            el.includes("grep")
            ? "read"
            : el.includes("edit") ||
                el.includes("write") ||
                el.includes("multiedit")
              ? "edit"
              : el.includes("delete") || el.includes("remove")
                ? "delete"
                : el.includes("move") || el.includes("rename")
                  ? "move"
                  : el.includes("search")
                    ? "search"
                    : el.includes("bash") || el.includes("execute")
                      ? "execute"
                      : el.includes("fetch") || el.includes("web")
                        ? "fetch"
                        : "other";
        }
        static convertAcpMcpServersToDynamic(eA) {
          let el = {};
          for (let ec of eA) {
            let eA,
              eu = ec._meta || {};
            if ("type" in ec) {
              if ("http" !== ec.type && "sse" !== ec.type) continue;
              eA = {
                type: ec.type,
                url: ec.url,
                headers: ec.headers
                  ? Object.fromEntries(
                      ec.headers.map((eA) => [eA.name, eA.value]),
                    )
                  : void 0,
                ...(void 0 !== eu.defer_loading
                  ? { defer_loading: eu.defer_loading }
                  : {}),
                ...(eu.tools ? { tools: eu.tools } : {}),
                ...(void 0 !== eu.transparent_proxy
                  ? { transparent_proxy: eu.transparent_proxy }
                  : {}),
                ...(eu.builtin_tools
                  ? { builtin_tools: eu.builtin_tools }
                  : {}),
              };
            } else
              eA = {
                type: "stdio",
                command: ec.command,
                args: ec.args,
                env: ec.env
                  ? Object.fromEntries(ec.env.map((eA) => [eA.name, eA.value]))
                  : void 0,
                ...(void 0 !== eu.defer_loading
                  ? { defer_loading: eu.defer_loading }
                  : {}),
                ...(eu.tools ? { tools: eu.tools } : {}),
                ...(void 0 !== eu.transparent_proxy
                  ? { transparent_proxy: eu.transparent_proxy }
                  : {}),
                ...(eu.builtin_tools
                  ? { builtin_tools: eu.builtin_tools }
                  : {}),
              };
            el[ec.name] = eA;
          }
          return el;
        }
        static toolInfoFromToolUse(eA, el = {}) {
          let ec = eA.name,
            eu = eA.input;
          switch (ec) {
            case ey.ToolNames.READ: {
              let eA = "";
              return (
                eu?.limit
                  ? (eA = ` (${(eu.offset ?? 0) + 1} - ${(eu.offset ?? 0) + eu.limit})`)
                  : eu?.offset && (eA = ` (from line ${eu.offset + 1})`),
                {
                  title: `Read ${eu?.file_path ?? "File"}${eA}`,
                  kind: "read",
                  content: [],
                  locations: eu?.file_path
                    ? [{ path: eu.file_path, line: eu.offset ?? 0 }]
                    : [],
                }
              );
            }
            case ey.ToolNames.EDIT: {
              let eA = eu?.file_path,
                ec = eu?.old_string ?? null,
                ed = eu?.new_string ?? "",
                ep = [];
              if (eA && ec && Object.prototype.hasOwnProperty.call(el, eA))
                try {
                  let eg = el[eA] ?? "",
                    eh = eI.EditFileUtils.applyTextReplacementWithLocation(eg, [
                      {
                        oldString: ec,
                        newString: ed,
                        replaceAll: eu?.replace_all ?? !1,
                      },
                    ]);
                  ((ec = eg), (ed = eh.newContent), (ep = eh.affectedLines));
                } catch {}
              return {
                title: eA ? `Edit \`${eA}\`` : "Edit",
                kind: "edit",
                content:
                  eu && eA
                    ? [{ type: "diff", path: eA, oldText: ec, newText: ed }]
                    : [],
                locations: eA
                  ? ep.length > 0
                    ? ep.map((el) => ({ line: el, path: eA }))
                    : [{ path: eA }]
                  : [],
              };
            }
            case ey.ToolNames.MULTI_EDIT: {
              let eA = eu?.file_path,
                ec = null,
                ed = "",
                ep = [];
              if (eA && eu?.edits && Array.isArray(eu.edits)) {
                let eg = eu.edits;
                if (
                  ((ec = eg.map((eA) => eA.old_string ?? "").join("\n...\n")),
                  (ed = eg.map((eA) => eA.new_string ?? "").join("\n...\n")),
                  Object.prototype.hasOwnProperty.call(el, eA))
                )
                  try {
                    let eu = el[eA] ?? "",
                      eh = eI.EditFileUtils.applyTextReplacementWithLocation(
                        eu,
                        eg.map((eA) => ({
                          oldString: eA.old_string,
                          newString: eA.new_string,
                          replaceAll: eA.replace_all ?? !1,
                        })),
                      );
                    ((ec = eu), (ed = eh.newContent), (ep = eh.affectedLines));
                  } catch {}
              }
              return {
                title: eA ? `Edit \`${eA}\`` : "Multi Edit",
                kind: "edit",
                content:
                  eu && eA
                    ? [{ type: "diff", path: eA, oldText: ec, newText: ed }]
                    : [],
                locations: eA
                  ? ep.length > 0
                    ? ep.map((el) => ({ line: el, path: eA }))
                    : [{ path: eA }]
                  : [],
              };
            }
            case ey.ToolNames.WRITE:
              return {
                title: eu?.file_path ? `Write ${eu.file_path}` : "Write",
                kind: "edit",
                content:
                  eu && eu.file_path
                    ? [
                        {
                          type: "diff",
                          path: eu.file_path,
                          oldText: null,
                          newText: eu.content,
                        },
                      ]
                    : [],
                locations: eu?.file_path ? [{ path: eu.file_path }] : [],
              };
            case ey.ToolNames.BASH:
              return {
                title: eu?.command
                  ? "`" + eu.command.replace(/`/g, "\\`") + "`"
                  : "Terminal",
                kind: "execute",
                content:
                  eu && eu.description
                    ? [
                        {
                          type: "content",
                          content: { type: "text", text: eu.description },
                        },
                      ]
                    : [],
              };
            case ey.ToolNames.POWERSHELL:
              return {
                title: eu?.command
                  ? "`" + eu.command.replace(/`/g, "\\`") + "`"
                  : "PowerShell",
                kind: "execute",
                content:
                  eu && eu.description
                    ? [
                        {
                          type: "content",
                          content: { type: "text", text: eu.description },
                        },
                      ]
                    : [],
              };
            case ey.ToolNames.BASH_OUTPUT:
              return { title: "Tail Logs", kind: "execute", content: [] };
            case ey.ToolNames.KILL_SHELL:
              return { title: "Kill Process", kind: "execute", content: [] };
            case ey.ToolNames.GLOB: {
              let eA = "Find";
              return (
                eu?.path && (eA += ` \`${eu.path}\``),
                eu?.pattern && (eA += ` \`${eu.pattern}\``),
                {
                  title: eA,
                  kind: "search",
                  content: [],
                  locations: eu?.path ? [{ path: eu.path }] : [],
                }
              );
            }
            case ey.ToolNames.GREP: {
              let eA = "grep";
              if (
                (eu?.["-i"] && (eA += " -i"),
                eu?.["-n"] && (eA += " -n"),
                eu?.["-A"] !== void 0 && (eA += ` -A ${eu["-A"]}`),
                eu?.["-B"] !== void 0 && (eA += ` -B ${eu["-B"]}`),
                eu?.["-C"] !== void 0 && (eA += ` -C ${eu["-C"]}`),
                eu?.output_mode)
              )
                switch (eu.output_mode) {
                  case "files_with_matches":
                    eA += " -l";
                    break;
                  case "count":
                    eA += " -c";
                }
              return (
                eu?.head_limit !== void 0 &&
                  (eA += ` | head -${eu.head_limit}`),
                eu?.glob && (eA += ` --include="${eu.glob}"`),
                eu?.type && (eA += ` --type=${eu.type}`),
                eu?.multiline && (eA += " -P"),
                (eA += ` "${eu?.pattern}"`),
                eu?.path && (eA += ` ${eu.path}`),
                { title: eA, kind: "search", content: [] }
              );
            }
            case ey.ToolNames.WEB_FETCH:
              return {
                title: eu?.url ? `Fetch ${eu.url}` : "Fetch",
                kind: "fetch",
                content:
                  eu && eu.prompt
                    ? [
                        {
                          type: "content",
                          content: { type: "text", text: eu.prompt },
                        },
                      ]
                    : [],
              };
            case ey.ToolNames.WEB_SEARCH: {
              let eA = `"${eu?.query}"`;
              return (
                eu?.allowed_domains &&
                  eu.allowed_domains.length > 0 &&
                  (eA += ` (allowed: ${eu.allowed_domains.join(", ")})`),
                eu?.blocked_domains &&
                  eu.blocked_domains.length > 0 &&
                  (eA += ` (blocked: ${eu.blocked_domains.join(", ")})`),
                { title: eA, kind: "fetch", content: [] }
              );
            }
            case ey.ToolNames.TODO_WRITE:
              return {
                title: Array.isArray(eu?.todos)
                  ? `Update TODOs: ${eu.todos.map((eA) => eA.content).join(", ")}`
                  : "Update TODOs",
                kind: "think",
                content: [],
              };
            case ey.ToolNames.AGENT: {
              let eA = eu?.description || "",
                el = eu?.subagent_type || "general-purpose",
                ec = !!eu?.run_in_background,
                ed = eu?.name;
              return {
                title: ed ? `@${ed}` : el,
                kind: "other",
                content: eA
                  ? [{ type: "content", content: { type: "text", text: eA } }]
                  : [],
                _meta: {
                  "codebuddy.ai/isSubagent": !0,
                  "codebuddy.ai/subagentType": el,
                  "codebuddy.ai/isBackground": ec,
                  "codebuddy.ai/memberName": ed || null,
                  "codebuddy.ai/description": eA,
                },
              };
            }
            default:
              return {
                title: ec || "Unknown Tool",
                kind: "other",
                content: [],
              };
          }
        }
        static getImageExtension(eA) {
          switch (eA) {
            case "image/jpeg":
              return ".jpg";
            case "image/gif":
              return ".gif";
            case "image/webp":
              return ".webp";
            default:
              return ".png";
          }
        }
        static persistClipboardImage(eA, el) {
          try {
            let ec = process.env.CODEBUDDY_CONFIG_DIR
              ? ef.join(process.env.CODEBUDDY_CONFIG_DIR, "clipboard-images")
              : ef.join(eh.tmpdir(), "workbuddy-clipboard-images");
            eg.mkdirSync(ec, { recursive: !0 });
            let eu = new Date().toISOString().replace(/[:.]/g, "-"),
              ed = ep.createHash("sha1").update(eA).digest("hex").slice(0, 8),
              em = this.getImageExtension(el),
              eE = ef.join(ec, `clipboard-${eu}-${ed}${em}`);
            return (eg.writeFileSync(eE, Buffer.from(eA, "base64")), eE);
          } catch (eA) {
            e_.DebugLogger.error(
              "AcpUtils",
              "Failed to persist clipboard image",
              eA,
            ).catch(() => {});
            return;
          }
        }
        static promptToUserMessage(eA) {
          let el = [],
            ec = [];
          for (let eu of eA.prompt)
            switch (eu.type) {
              case "text": {
                let eA = eu.text,
                  ec = eA.match(/^\/mcp:([^:\s]+):(\S+)(\s+.*)?$/);
                if (ec) {
                  let [, el, eu, ed] = ec;
                  eA = `/${el}:${eu} (MCP)${ed || ""}`;
                }
                el.push({ type: "text", text: eA });
                break;
              }
              case "resource_link": {
                let eA = eu._meta || {};
                if ("inspiration" === eA.mentionType && eA.detail) {
                  let el = eA.cardTitle || eu.name || "Inspiration";
                  ec.push({
                    type: "text",
                    text: `
<context ref="inspiration:${eA.inspirationCardId || ""}" title="${el}">
${eA.detail}
</context>`,
                  });
                } else {
                  let eA = this.formatUriAsLink(eu.uri, eu.name);
                  el.push({ type: "text", text: eA });
                }
                break;
              }
              case "resource":
                if ("text" in eu.resource) {
                  let eA = this.formatUriAsLink(eu.resource.uri);
                  (el.push({ type: "text", text: eA }),
                    ec.push({
                      type: "text",
                      text: `
<context ref="${eu.resource.uri}">
${eu.resource.text}
</context>`,
                    }));
                }
                break;
              case "image":
                if (eu.data) {
                  let eA,
                    ec = eu._meta?.filename ?? eu._meta?.originalFilename,
                    ed = {
                      type: "image",
                      source: {
                        type: "base64",
                        data: eu.data,
                        media_type: eu.mimeType,
                      },
                      original_filename: "string" == typeof ec ? ec : void 0,
                    };
                  el.push(ed);
                  let ep =
                    "string" == typeof eu._meta?.path ? eu._meta.path : void 0;
                  (eA =
                    ep && ef.isAbsolute(ep) && eg.existsSync(ep)
                      ? ep
                      : "string" == typeof eu.uri &&
                          ef.isAbsolute(eu.uri) &&
                          eg.existsSync(eu.uri)
                        ? eu.uri
                        : AcpUtils.persistClipboardImage(
                            eu.data,
                            eu.mimeType,
                          )) &&
                    el.push({
                      type: "text",
                      text: `<image_local_path>${eA}</image_local_path>`,
                    });
                } else
                  eu.uri &&
                    eu.uri.startsWith("http") &&
                    el.push({
                      type: "image",
                      source: { type: "url", url: eu.uri },
                    });
            }
          return (
            el.push(...ec),
            {
              type: "user",
              message: { role: "user", content: el },
              session_id: eA.sessionId,
              parent_tool_use_id: null,
            }
          );
        }
        static isImageLocalPathText(eA) {
          return /^<image_local_path>[\s\S]*<\/image_local_path>$/.test(
            eA.trim(),
          );
        }
        static convertPersistedUserImageBlockToAcpContentBlock(eA) {
          let makeImageBlock = (eA, el, ec) => ({
            type: "image",
            mimeType: eA,
            data: el,
            ...(ec ? { uri: ec, _meta: { filename: ec } } : {}),
          });
          if ("image_blob_ref" === eA.type && eA.blob_path && eA.mime) {
            let el =
              eA.original_filename ||
              eA.blob_path.split("/").pop() ||
              eA.blob_path;
            return makeImageBlock(
              eA.mime,
              this.readBlobAsBase64(eA.blob_path),
              el,
            );
          }
          if ("input_image" !== eA.type || !eA.image) return;
          if (
            "object" == typeof eA.image &&
            "image_blob_ref" === eA.image.type &&
            eA.image.blob_path
          ) {
            let el =
              eA.image.original_filename ||
              eA.original_filename ||
              eA.image.blob_path.split("/").pop() ||
              eA.image.blob_path;
            return makeImageBlock(
              eA.image.mime,
              this.readBlobAsBase64(eA.image.blob_path),
              el,
            );
          }
          let el = eA.original_filename;
          if ("string" == typeof eA.image) {
            let ec = this.parseDataUri(eA.image);
            if (!ec) return;
            return makeImageBlock(ec.mimeType, ec.data, el);
          }
          if ("object" == typeof eA.image && "string" == typeof eA.image.data)
            return makeImageBlock(
              eA.image.mediaType || "image/png",
              eA.image.data,
              el,
            );
        }
        static readBlobAsBase64(eA) {
          try {
            if (eg.existsSync(eA))
              return eg.readFileSync(eA).toString("base64");
          } catch {}
          return "";
        }
        static parseDataUri(eA) {
          let el = eA.match(/^data:([^;]+);base64,(.+)$/);
          if (el) return { mimeType: el[1], data: el[2] };
        }
        static formatUriAsLink(eA, el) {
          try {
            return (0, ed.encodeAcpResourceLinkToInputText)({
              uri: eA,
              name: el,
            }).text;
          } catch {
            return el || eA;
          }
        }
        static extractBlobIdFromPath(eA) {
          try {
            let el = eA.lastIndexOf("/");
            if (-1 === el) return;
            let ec = eA.substring(el + 1),
              eu = ec.lastIndexOf(".");
            return (eu > 0 ? ec.substring(0, eu) : ec) || void 0;
          } catch {
            return;
          }
        }
      };
      ((AcpUtils.INTERNAL_STREAMING_UPDATES = new Set([
        "tool_call_pending",
        "tool_call_arguments_delta",
        "tool_call_arguments_done",
      ])),
        (AcpUtils.SOURCE_EVENT_META_KEY = "codebuddy.ai/sourceEvent"));
    },
    83473(eA, el, ec) {
      "use strict";
      (ec.r(el), ec.d(el, { AnsiUtils: () => AnsiUtils }));
      var eu = ec(70857),
        ed = ec.n(eu),
        ep = ec(16928),
        eg = ec.n(ep);
      let eh =
          /(?:^|(?<=[^\x21-\x7E]|[\s"'`<>([{,]))(file:\/\/\/[^\s"'`<>]+|~\/[^\s"'`<>]+|\.{1,2}\/[^\s"'`<>]+|\/[^\s"'`<>]+)/g,
        ef = /:(\d+)(?::(\d+))?$/,
        em = { ")": "(", "]": "[", "}": "{" },
        eE = ".,;:!?";
      function trimTrailingPunct(eA) {
        let el = eA;
        for (; el.length > 0; ) {
          let eA = el[el.length - 1];
          if (eE.includes(eA)) {
            el = el.slice(0, -1);
            continue;
          }
          let ec = em[eA];
          if (!ec) break;
          let eu = 0,
            ed = 0;
          for (let ep of el) ep === ec ? eu++ : ep === eA && ed++;
          if (ed > eu) el = el.slice(0, -1);
          else break;
        }
        return el;
      }
      let AnsiUtils = class AnsiUtils {
        static replaceAnsiColor(eA) {
          let el = RegExp(
            "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?(?:\\u0007|\\u001B\\u005C|\\u009C))|(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))",
            "g",
          );
          return eA.replace(el, "");
        }
        static createHyperlink(eA, el) {
          let ec = el || eA,
            eu = "\x1b",
            ed = "\x07";
          return eu + "]8;;" + eA + ed + ec + eu + "]8;;" + ed;
        }
        static createFileHyperlink(eA, el) {
          let ec = eg().resolve(eA),
            eu = `file://${ec}`,
            ed = el || eg().basename(eA),
            ep = "\x1b",
            eh = "\x07";
          return ep + "]8;;" + eu + eh + ed + ep + "]8;;" + eh;
        }
        static processAnsiText(eA) {
          return eA;
        }
        static linkifyFilePaths(eA) {
          return eA.includes("/")
            ? eA.replace(eh, (eA) => {
                let el,
                  ec,
                  eu,
                  ep = eA,
                  eh = ep.match(ef);
                eh &&
                  ((el = eh[1]),
                  (ec = eh[2]),
                  (ep = ep.slice(0, -eh[0].length)));
                let em = trimTrailingPunct(ep),
                  eE = ep.slice(em.length);
                if (0 === em.length) return eA;
                eu = em.startsWith("file:///")
                  ? em.slice(7)
                  : em.startsWith("~/")
                    ? eg().join(ed().homedir(), em.slice(2))
                    : eg().resolve(em);
                let eC = `file://${eu}`;
                el && (eC += `#L${el}${ec ? `,${ec}` : ""}`);
                let ey = em + (el ? `:${el}${ec ? `:${ec}` : ""}` : "");
                return AnsiUtils.createHyperlink(eC, ey) + eE;
              })
            : eA;
        }
      };
    },
    56037(eA, el, ec) {
      "use strict";
      (ec.r(el), ec.d(el, { StreamJsonUtils: () => StreamJsonUtils }));
      let StreamJsonUtils = class StreamJsonUtils {
        static parseMessagesFromPipeInput(eA) {
          let el = [];
          for (let ec of eA.split("\n")) {
            let eA = ec.trim();
            if (!eA) continue;
            let eu = this.parseUserMessage(eA);
            eu && el.push(this.convertUserMessage(eu));
          }
          return el;
        }
        static convertUserMessage(eA) {
          let el = eA.message.content;
          return "string" == typeof el
            ? { type: "message", role: "user", content: el }
            : {
                type: "message",
                role: "user",
                content: el.map((eA) => this.convertContentBlock(eA)),
              };
        }
        static buildDataUri(eA, el) {
          return eA.startsWith("data:") ? eA : `data:${el};base64,${eA}`;
        }
        static convertContentBlock(eA) {
          switch (eA.type) {
            case "text":
              return { type: "input_text", text: eA.text };
            case "image":
              return {
                type: "input_image",
                image:
                  "base64" === eA.source.type
                    ? this.buildDataUri(eA.source.data, eA.source.media_type)
                    : eA.source.url,
                original_filename: eA.original_filename,
              };
            case "document": {
              let el,
                ec = eA.source;
              if ("base64" === ec.type)
                el = this.buildDataUri(ec.data, ec.media_type);
              else if ("url" === ec.type) el = ec.url;
              else if ("text" === ec.type)
                el = this.buildDataUri(ec.data, ec.media_type);
              else if ("content" === ec.type) {
                let eA =
                  "string" == typeof ec.content
                    ? ec.content
                    : ec.content
                        .map((eA) =>
                          "text" === eA.type ? eA.text : `[${eA.type}]`,
                        )
                        .join("\n");
                el = `data:text/plain;base64,${Buffer.from(eA).toString("base64")}`;
              } else
                el = `data:text/plain;base64,${Buffer.from(JSON.stringify(ec)).toString("base64")}`;
              return { type: "input_file", file: el };
            }
            case "tool_result":
              return {
                type: "input_text",
                text: `[Tool result: ${eA.tool_use_id}]`,
              };
            case "tool_use":
              return { type: "input_text", text: `[Tool use: ${eA.name}]` };
            default:
              return { type: "input_text", text: JSON.stringify(eA) };
          }
        }
        static parseUserMessage(eA) {
          try {
            let el = JSON.parse(eA);
            if ("user" === el.type) return el;
            return null;
          } catch (el) {
            throw Error(`Error parsing streaming input line: ${eA}: ${el}`);
          }
        }
      };
    },
    18703(eA, el, ec) {
      "use strict";
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        (el.stripInlineBadgesFromText =
          el.parseLexiangUri =
          el.extractRuntimePromptText =
          el.extractVisiblePromptText =
          el.createAcpResourceLinkBlock =
          el.formatDocumentSelectionContextText =
          el.getAcpResourceLinkProviderData =
          el.decodePersistedUserContentToAcpContentBlocks =
          el.decodeInputTextToAcpContentBlocks =
          el.isInlineEncodableResourceLink =
          el.encodeAcpResourceLinkToInputText =
          el.getAcpResourceLinkDisplayName =
          el.INLINE_PROMPT_RESOURCE_MENTION_TYPE =
          el.ACP_RESOURCE_LINK_PROVIDER_DATA_KEY =
            void 0));
      let eu = ec(80742);
      ((el.ACP_RESOURCE_LINK_PROVIDER_DATA_KEY = "acpResourceLink"),
        (el.INLINE_PROMPT_RESOURCE_MENTION_TYPE = "inline-prompt"));
      let ed = "command://",
        ep = "file://",
        eg = "scene://",
        eh = "skill://",
        ef = "tdoc://",
        em = "ima://",
        eE = "lexiang://",
        eC = "netdrive://",
        ey = "selection://",
        ew = "comment://",
        eB = "tdoc-selection://",
        e_ = "tencentDocsSelection",
        eI = "agentmail://",
        ev = "expert://",
        eS = "article://",
        eQ = "http://",
        eD = "https://",
        eT = new Set([
          "scene",
          "image",
          "skill",
          "tdoc-selection",
          "tdoc",
          "ima",
          "lexiang",
          "netdrive",
          "selection",
          "comment",
          "expert",
          "article",
          "share-html",
          "agentmail",
        ]),
        eR = /[A-Za-z0-9_./-]/,
        ek = /[\p{L}\p{N}_-]/u,
        eM = /[A-Za-z0-9_]/,
        ex = /[A-Za-z0-9_:-]/,
        eO = /@image#\d+:/;
      function getAcpResourceLinkDisplayName(eA, el) {
        if (eA.startsWith(ed)) {
          let ec = el || eA.slice(ed.length);
          return ec.startsWith("/") ? ec : `/${ec}`;
        }
        return el || eA.replace(/\/+$/, "").split("/").pop() || eA;
      }
      function encodeAcpResourceLinkToInputText(eA) {
        var ec, e_, eT, eR, ek, eM, ex, eO;
        let eN = getAcpResourceLinkDisplayName(eA.uri, eA.name),
          eP = getInlinePromptResourceText(eA.meta);
        if (eA.uri.startsWith(eI)) {
          let ec = {
            uri: eA.uri,
            name: eN,
            ...collectAgentMailProviderHint(eA.meta),
          };
          return {
            text: `@agentmail:${encodeInlineBadgeValue(eN)}`,
            providerData: { [el.ACP_RESOURCE_LINK_PROVIDER_DATA_KEY]: ec },
          };
        }
        if (eP) return { text: `@${eP}` };
        if (
          (null == (ec = eA.meta) ? void 0 : ec.provider) === "space-doc" &&
          (null == (e_ = eA.meta) ? void 0 : e_.kind) === "space/doc-ref"
        )
          return {
            text:
              "string" == typeof eA.meta.url && eA.meta.url
                ? eA.meta.url
                : eA.uri,
            providerData: {
              [el.ACP_RESOURCE_LINK_PROVIDER_DATA_KEY]: {
                uri: eA.uri,
                name: eN,
              },
            },
          };
        if (eA.uri.startsWith(ed))
          return {
            text: eN,
            providerData: {
              [el.ACP_RESOURCE_LINK_PROVIDER_DATA_KEY]: {
                uri: eA.uri,
                name: eN,
              },
            },
          };
        if (eA.uri.startsWith(eg)) {
          let el = eA.uri.slice(eg.length),
            ec = eA.name || el;
          return {
            text:
              eA.name && el && eA.name !== el && isBareInlineBadgeValue(el)
                ? `@scene#${el}:${encodeInlineBadgeValue(ec)}`
                : `@scene:${encodeInlineBadgeValue(ec)}`,
          };
        }
        if (eA.uri.startsWith(eh))
          return {
            text: `@skill:${encodeInlineBadgeValue(eA.name || eA.uri.slice(eh.length))}`,
          };
        if (eA.uri.startsWith(ef)) {
          let ec = eA.uri.slice(ef.length),
            eu = eA.name || ec,
            ed = collectTencentDocsProviderHint(eA.meta);
          return {
            text: ec
              ? `@tdoc#${encodeURIComponent(ec)}:${encodeInlineBadgeValue(eu)}`
              : `@tdoc:${encodeInlineBadgeValue(eu)}`,
            providerData: {
              [el.ACP_RESOURCE_LINK_PROVIDER_DATA_KEY]: {
                uri: eA.uri,
                name: eu,
                ...ed,
              },
            },
          };
        }
        if (eA.uri.startsWith(ey)) {
          let ec =
              "string" ==
              typeof (null == (eT = eA.meta) ? void 0 : eT.selectedText)
                ? eA.meta.selectedText
                : "",
            ed =
              "string" == typeof (null == (eR = eA.meta) ? void 0 : eR.llmText)
                ? eA.meta.llmText
                : "",
            ep = eA.uri.slice(ey.length),
            eg = `@selection:${encodeInlineBadgeValue(eN)}`,
            eh =
              "string" == typeof (null == (ek = eA.meta) ? void 0 : ek.title) &&
              eA.meta.title
                ? ` title="${(0, eu.escapeXmlAttribute)(eA.meta.title)}"`
                : "",
            ef = (null == (eM = eA.meta) ? void 0 : eM.htmlSelection)
              ? ' htmlSelection="true"'
              : "",
            em = ed ? ` <system-reminder>${ed}</system-reminder>` : "",
            eE = ec
              ? `<selection_quote source="${(0, eu.escapeXmlAttribute)(ep)}"${eh}${ef}>${ec}</selection_quote>${em}`
              : "";
          return {
            text: eE ? `${eg} ${eE}` : eg,
            providerData: {
              [el.ACP_RESOURCE_LINK_PROVIDER_DATA_KEY]: {
                uri: eA.uri,
                name: eN,
                ...((null == (ex = eA.meta) ? void 0 : ex.htmlSelection)
                  ? { htmlSelection: !0 }
                  : {}),
              },
            },
          };
        }
        if (eA.uri.startsWith(ew)) {
          let ec =
              "string" == typeof (null == (eO = eA.meta) ? void 0 : eO.llmText)
                ? eA.meta.llmText
                : "",
            eu = `@comment:${encodeInlineBadgeValue(eN)}`,
            ed = ec ? ` <system-reminder>${ec}</system-reminder>` : "",
            ep = { uri: eA.uri, name: eN };
          return {
            text: ed ? `${eu}${ed}` : eu,
            providerData: {
              [el.ACP_RESOURCE_LINK_PROVIDER_DATA_KEY]: {
                ...ep,
                ...collectCommentProviderHint(eA.meta),
              },
            },
          };
        }
        if (eA.uri.startsWith(eB)) {
          let ec = readTDocSelectionTimestampRefFromHint(eA.meta),
            eu = readTDocSelectionDisplayNameFromHint(eA.meta, eN);
          return {
            text: ec ? formatTDocSelectionBadge(eu, ec) : eu,
            providerData: {
              [el.ACP_RESOURCE_LINK_PROVIDER_DATA_KEY]: {
                uri: eA.uri,
                name: eu,
                ...(ec ? { selectionRef: ec } : {}),
              },
            },
          };
        }
        if (eA.uri.startsWith(em)) {
          let ec = eA.uri.slice(em.length),
            eu = eA.name || ec;
          return {
            text: `@ima:${encodeInlineBadgeValue(eu)}`,
            providerData: {
              [el.ACP_RESOURCE_LINK_PROVIDER_DATA_KEY]: {
                uri: eA.uri,
                name: eu,
              },
            },
          };
        }
        if (eA.uri.startsWith(eE)) {
          let ec = eA.name || eA.uri.slice(eE.length),
            eu = collectLexiangProviderHint(eA.meta);
          return {
            text: `@lexiang:${encodeInlineBadgeValue(ec)}`,
            providerData: {
              [el.ACP_RESOURCE_LINK_PROVIDER_DATA_KEY]: {
                uri: eA.uri,
                name: ec,
                ...eu,
              },
            },
          };
        }
        if (eA.uri.startsWith(eC)) {
          let ec = eA.name || eA.uri.slice(eC.length);
          return {
            text: `@netdrive:${encodeInlineBadgeValue(ec)}`,
            providerData: {
              [el.ACP_RESOURCE_LINK_PROVIDER_DATA_KEY]: {
                uri: eA.uri,
                name: ec,
              },
            },
          };
        }
        if (eA.uri.startsWith(ev)) {
          let ec = eA.uri.slice(ev.length),
            eu = eA.name || ec;
          return {
            text: `@expert:${encodeInlineBadgeValue(ec)}`,
            providerData: {
              [el.ACP_RESOURCE_LINK_PROVIDER_DATA_KEY]: {
                uri: eA.uri,
                name: eu,
              },
            },
          };
        }
        if (eA.uri.startsWith(eS)) {
          let ec = eA.uri.slice(eS.length);
          return {
            text: `@article:${ec}`,
            providerData: {
              [el.ACP_RESOURCE_LINK_PROVIDER_DATA_KEY]: {
                uri: eA.uri,
                name: eA.name || ec,
              },
            },
          };
        }
        if (eA.uri.startsWith(ep)) {
          let el =
            eA.relativePath || eA.name || decodeFileUriPath(eA.uri) || eN;
          return { text: `@${encodeInlineBadgeValue(el)}` };
        }
        return eA.uri.startsWith(eD) || eA.uri.startsWith(eQ)
          ? {
              text: `@share-html:${eA.uri}`,
              providerData: {
                [el.ACP_RESOURCE_LINK_PROVIDER_DATA_KEY]: {
                  uri: eA.uri,
                  name: eN,
                },
              },
            }
          : { text: eN };
      }
      function decodeInputTextToAcpContentBlocks(eA, el, ec = {}) {
        let eu = getAcpResourceLinkProviderData(el);
        if (eu && shouldDecodeProviderDataHint(eA, eu))
          return [createAcpResourceLinkBlock(eu.uri, eu.name, eu)];
        let ed = stripPromptContextXmlIfNeeded(eA);
        if (!ed) return [];
        let ep = [],
          eg = 0;
        for (; eg < ed.length; ) {
          let el = findNextInlineToken(ed, eg, ec);
          if (!el) break;
          el.start > eg && ep.push(createTextBlock(ed.slice(eg, el.start)));
          let eh = maybeEnhanceTDocSelectionBlockWithHint(
            maybeEnhanceTencentDocsBlockWithHint(
              maybeEnhanceLexiangBlockWithHint(el.block, eu),
              eu,
            ),
            eu,
            eA,
          );
          if (!eh) {
            (ep.push(createTextBlock(ed.slice(el.start, el.end))),
              (eg = el.end));
            continue;
          }
          let ef = maybeEnhanceAgentMailBlockWithHint(eh, eu);
          (ep.push(maybeEnhanceCommentBlockWithHint(ef, eu)), (eg = el.end));
        }
        return (
          eg < ed.length && ep.push(createTextBlock(ed.slice(eg))),
          mergeAdjacentTextBlocks(ep)
        );
      }
      function maybeEnhanceResourceLinkBlockWithHint(eA, el, ec) {
        if (!el || "resource_link" !== eA.type) return eA;
        let eu = null == eA ? void 0 : eA.uri,
          ed = null == eA ? void 0 : eA.name;
        return "string" == typeof eu &&
          eu.startsWith(ec) &&
          el.uri.startsWith(ec) &&
          el.name === ed
          ? createAcpResourceLinkBlock(el.uri, el.name, el)
          : eA;
      }
      function maybeEnhanceLexiangBlockWithHint(eA, el) {
        return maybeEnhanceResourceLinkBlockWithHint(eA, el, eE);
      }
      function maybeEnhanceTencentDocsBlockWithHint(eA, el) {
        return maybeEnhanceResourceLinkBlockWithHint(eA, el, ef);
      }
      function maybeEnhanceTDocSelectionBlockWithHint(eA, el, ec) {
        if ("resource_link" !== eA.type) return eA;
        let eu = null == eA ? void 0 : eA.uri,
          ed = null == eA ? void 0 : eA.name;
        if (
          "string" != typeof eu ||
          !eu.startsWith(eB) ||
          "string" != typeof ed
        )
          return eA;
        let ep = decodeURIComponentSafe(eu.slice(eB.length));
        if (!isTDocSelectionTimestampRef(ep)) return eA;
        let eg = ec
          ? extractTDocSelectionProviderHintFromPromptContext(ec, {
              name: ed,
              selectionRef: ep,
            })
          : void 0;
        if (eg) return createAcpResourceLinkBlock(eg.uri, eg.name, eg);
        let eh = readTDocSelectionTimestampRefFromHint(el);
        if (!eh || eh !== ep) return;
        let ef = maybeEnhanceResourceLinkBlockWithHint(eA, el, eB);
        return ef === eA ? void 0 : ef;
      }
      function maybeEnhanceAgentMailBlockWithHint(eA, el) {
        return maybeEnhanceResourceLinkBlockWithHint(eA, el, eI);
      }
      function maybeEnhanceCommentBlockWithHint(eA, el) {
        return maybeEnhanceResourceLinkBlockWithHint(eA, el, ew);
      }
      function collectLegacyTencentDocsProviderHintsFromPersistedContent(eA) {
        var el, ec, eu, ed, ep, eg;
        if (
          !Array.isArray(eA) ||
          !eA.some(
            (eA) =>
              ((null == eA ? void 0 : eA.type) === "input_text" ||
                (null == eA ? void 0 : eA.type) === "text") &&
              "string" == typeof eA.text &&
              eA.text.includes("@tdoc:"),
          )
        )
          return;
        let eh = new Map();
        for (let em of eA) {
          let eA;
          if (
            !em ||
            "object" != typeof em ||
            ("input_text" !== em.type && "text" !== em.type) ||
            "string" != typeof em.text ||
            !em.text.includes("<references")
          )
            continue;
          let eE = /<doc\b([^>]*)\/?>/gi;
          for (; null !== (eA = eE.exec(em.text)); ) {
            let em = readXmlTagAttributes(eA[1]),
              eE =
                null != (el = readString(em.id)) ? el : readString(em.file_id),
              eC =
                null !=
                (eu =
                  null != (ec = readString(em.title))
                    ? ec
                    : readString(em.name))
                  ? eu
                  : eE;
            if (!eE || !eC || eh.has(eC)) continue;
            let ey = readString(em.url),
              ew =
                null != (ed = readString(em.doc_type))
                  ? ed
                  : readString(em.fileType),
              eB =
                null != (ep = readString(em.ext)) ? ep : readString(em.fileExt),
              e_ =
                null != (eg = readString(em.owner))
                  ? eg
                  : readString(em.ownerName);
            eh.set(eC, {
              uri: `${ef}${eE}`,
              name: eC,
              fileId: eE,
              ...(ey ? { fileUrl: ey, url: ey } : {}),
              ...(ew ? { fileType: ew } : {}),
              ...(eB ? { fileExt: eB } : {}),
              ...(e_ ? { ownerName: e_ } : {}),
              title: eC,
            });
          }
        }
        return eh.size > 0 ? eh : void 0;
      }
      function mergeLegacyTencentDocsProviderDataFromReferences(eA, ec, eu) {
        if (!eu || !eA.includes("@tdoc:")) return ec;
        let ed = getAcpResourceLinkProviderData(ec);
        if (null == ed ? void 0 : ed.uri.startsWith(ef)) return ec;
        let ep = extractLegacyTencentDocsDisplayNameFromPromptText(eA);
        if (!ep) return ec;
        let eg = eu.get(ep);
        return eg
          ? { ...(ec || {}), [el.ACP_RESOURCE_LINK_PROVIDER_DATA_KEY]: eg }
          : ec;
      }
      function extractLegacyTencentDocsDisplayNameFromPromptText(eA) {
        let el = stripPromptContextXmlIfNeeded(eA),
          ec = "@tdoc:",
          eu = el.indexOf(ec);
        if (eu < 0) return;
        let ed = parseInlineBadgeValue(el, eu + ec.length);
        return null == ed ? void 0 : ed.value;
      }
      function getAcpResourceLinkProviderData(eA) {
        let ec =
          null == eA ? void 0 : eA[el.ACP_RESOURCE_LINK_PROVIDER_DATA_KEY];
        if (!ec || "object" != typeof ec) return;
        let { uri: eu, name: ed } = ec;
        if ("string" == typeof eu && "string" == typeof ed)
          return { ...ec, uri: eu, name: ed };
      }
      function isRecord(eA) {
        return !!eA && "object" == typeof eA && !Array.isArray(eA);
      }
      function mergeTDocSelectionProviderDataFromPromptContext(eA, ec) {
        let eu = extractTDocSelectionProviderHintFromPromptContext(eA);
        if (!eu) return ec;
        let ed = getAcpResourceLinkProviderData(ec);
        if (ed && !ed.uri.startsWith(eB)) return ec;
        let ep = readString(eu.rangeId),
          eg = ed
            ? {
                ...ed,
                ...eu,
                uri: ep ? eu.uri : ed.uri,
                name: ed.name || eu.name,
              }
            : eu;
        return { ...(ec || {}), [el.ACP_RESOURCE_LINK_PROVIDER_DATA_KEY]: eg };
      }
      function extractTDocSelectionProviderHintFromPromptContext(eA, el) {
        var ec, eu, ed, ep, eg, eh, em, eE;
        if (!eA.includes("@tdoc-selection#")) return;
        let eC = null != el ? el : extractTDocSelectionBadgeFromPromptText(eA),
          ey = null == eC ? void 0 : eC.selectionRef;
        if (!eC || !ey) return;
        let ew = readFirstXmlTagAttributes(eA, "active_document"),
          e_ = readFirstXmlTagAttributes(eA, "doc"),
          eI = readSelectionPayload(eA, ey),
          ev = isRecord(eI) ? eI : void 0;
        if (!ev) return;
        let eS =
            null != (ec = readString(null == ev ? void 0 : ev.rangeId))
              ? ec
              : readString(null == ev ? void 0 : ev.selectionId),
          eQ = eC.name && eC.name !== ey ? eC.name : void 0,
          eD =
            null !=
            (ep =
              null !=
              (ed =
                null !=
                (eu =
                  null != eQ
                    ? eQ
                    : readFormattedSelectionDisplayText(
                        null == ev ? void 0 : ev.text,
                      ))
                  ? eu
                  : readFormattedSelectionDisplayText(
                      null == ev ? void 0 : ev.description,
                    ))
                ? ed
                : eS)
              ? ep
              : ey,
          eT =
            null !=
            (eh =
              null != (eg = readString(null == ev ? void 0 : ev.fileId))
                ? eg
                : readString(null == ew ? void 0 : ew.file_id))
              ? eh
              : readString(null == e_ ? void 0 : e_.id),
          eR = readString(null == ew ? void 0 : ew.path),
          ek = null != eR ? eR : eT ? `${ef}${eT}` : void 0,
          eM =
            null !=
            (eE =
              null != (em = readString(null == ew ? void 0 : ew.fileType))
                ? em
                : readString(null == ew ? void 0 : ew.file_type))
              ? eE
              : readString(null == e_ ? void 0 : e_.doc_type);
        return {
          uri: `${eB}${encodeURIComponent(eS || ey)}`,
          name: eD,
          selectionRef: ey,
          ...(ek ? { documentResourceUri: ek } : {}),
          ...(eR ? { filePath: eR } : {}),
          ...(eM ? { fileType: eM } : {}),
          ...(eT ? { fileId: eT } : {}),
          ...(eS ? { rangeId: eS } : {}),
          selectionPayload: ev,
        };
      }
      function extractTDocSelectionBadgeFromPromptText(eA) {
        let el = stripPromptContextXmlIfNeeded(eA),
          ec = "@tdoc-selection#",
          eu = el.indexOf(ec);
        if (eu < 0) return;
        let ed = eu + ec.length,
          ep = ed;
        for (; ed < el.length && /[0-9]/.test(el[ed]); ) ed += 1;
        if (ep === ed) return;
        let eg = decodeURIComponentSafe(el.slice(ep, ed));
        if (!isTDocSelectionTimestampRef(eg) || ":" !== el[ed]) return;
        let eh = parseInlineBadgeValue(el, ed + 1);
        return eh ? { name: eh.value, selectionRef: eg } : void 0;
      }
      function readSelectionPayload(eA, el) {
        let ec,
          eu = eA.match(
            /<selection_payload\b[^>]*>\s*([\s\S]*?)\s*<\/selection_payload>/i,
          );
        if (eu) {
          try {
            let eA = JSON.parse(unescapeXmlText(eu[1]));
            if (!Array.isArray(eA)) return;
            ec = eA;
          } catch (eA) {
            return;
          }
          return ec.find(
            (eA) =>
              isRecord(eA) &&
              readTDocSelectionTimestampRef(eA.timestamp) === el,
          );
        }
      }
      function readFirstXmlTagAttributes(eA, el) {
        let ec = eA.match(RegExp(`<${el}\\b([^>]*)>`, "i"));
        if (!ec) return;
        let eu = readXmlTagAttributes(ec[1]);
        return Object.keys(eu).length > 0 ? eu : void 0;
      }
      function readXmlTagAttributes(eA) {
        let el = {};
        return (
          eA.replace(
            /([\w:-]+)="([^"]*)"/g,
            (eA, ec, eu) => ((el[ec] = unescapeXmlAttribute(eu)), ""),
          ),
          el
        );
      }
      function readString(eA) {
        return "string" == typeof eA && eA.trim() ? eA.trim() : void 0;
      }
      function readPresentSelectionText(eA) {
        return "string" == typeof eA && eA.length > 0 ? eA : void 0;
      }
      function formatDocumentSelectionContextText(eA) {
        return 0 === eA.length
          ? ""
          : eA.includes("\n")
            ? eA.replace(/\s*\n+\s*/g, " ⏎ ").trim()
            : 0 === eA.trim().length
              ? eA
              : eA.trim();
      }
      function readFormattedSelectionDisplayText(eA) {
        let el = readPresentSelectionText(eA);
        return void 0 !== el ? formatDocumentSelectionContextText(el) : void 0;
      }
      function readTDocSelectionTimestampRef(eA) {
        if ("number" == typeof eA && Number.isSafeInteger(eA) && eA >= 0)
          return String(eA);
        let el = readString(eA);
        return el && isTDocSelectionTimestampRef(el) ? el : void 0;
      }
      function isTDocSelectionTimestampRef(eA) {
        return /^[0-9]+$/.test(eA);
      }
      function readTDocSelectionTimestampRefFromHint(eA) {
        var el, ec;
        if (!eA) return;
        let eu = isRecord(eA.selectionPayload) ? eA.selectionPayload : void 0;
        return null !=
          (ec =
            null !=
            (el = readTDocSelectionTimestampRef(
              null == eu ? void 0 : eu.timestamp,
            ))
              ? el
              : readTDocSelectionTimestampRef(eA.timestamp))
          ? ec
          : readTDocSelectionTimestampRef(eA.selectionRef);
      }
      function readTDocSelectionDisplayNameFromHint(eA, el) {
        var ec, eu, ed;
        let ep = isRecord(null == eA ? void 0 : eA.selectionPayload)
          ? eA.selectionPayload
          : void 0;
        return null !=
          (ed =
            null !=
            (eu =
              null !=
              (ec = readFormattedSelectionDisplayText(
                null == ep ? void 0 : ep.text,
              ))
                ? ec
                : readFormattedSelectionDisplayText(
                    null == ep ? void 0 : ep.description,
                  ))
              ? eu
              : isRecord(null == ep ? void 0 : ep.image)
                ? "图片选区"
                : void 0)
          ? ed
          : el;
      }
      function formatTDocSelectionBadge(eA, el) {
        return `${formatTDocSelectionRefBadge(el)}:${encodeInlineBadgeValue(eA)}`;
      }
      function formatTDocSelectionRefBadge(eA) {
        return `@tdoc-selection#${encodeURIComponent(eA)}`;
      }
      function collectAgentMailProviderHint(eA) {
        if (!eA || "object" != typeof eA) return {};
        let el = {};
        for (let ec of [
          "message_id",
          "subject",
          "sender",
          "from",
          "created_at",
          "snippet",
          "agentMail",
        ])
          void 0 !== eA[ec] && (el[ec] = eA[ec]);
        return el;
      }
      function collectCommentProviderHint(eA) {
        if (!eA || "object" != typeof eA) return {};
        let el = {};
        for (let ec of [
          "spaceId",
          "nodeId",
          "discussionId",
          "llmText",
          "sourceUrl",
        ])
          void 0 !== eA[ec] && (el[ec] = eA[ec]);
        return el;
      }
      function collectTencentDocsProviderHint(eA) {
        if (!eA || "object" != typeof eA) return {};
        let el = {};
        for (let ec of [
          "fileId",
          "fileUrl",
          "rawUrl",
          "url",
          "fileType",
          "fileExt",
          "fileSize",
          "ownerName",
          "title",
          "displayText",
        ])
          void 0 !== eA[ec] && (el[ec] = eA[ec]);
        return el;
      }
      function collectLexiangProviderHint(eA) {
        if (!eA || "object" != typeof eA) return {};
        let el = {};
        if ("string" == typeof eA.iconUrl && eA.iconUrl)
          el.iconUrl = eA.iconUrl;
        else if (
          eA.icon &&
          "object" == typeof eA.icon &&
          "string" == typeof eA.icon.url
        ) {
          let ec = eA.icon.url;
          ec && (el.iconUrl = ec);
        }
        return (
          "string" == typeof eA.extension &&
            eA.extension &&
            (el.extension = eA.extension),
          "string" == typeof eA.kind && eA.kind && (el.kind = eA.kind),
          "boolean" == typeof eA.isFolder
            ? (el.isFolder = eA.isFolder)
            : "string" == typeof eA.entityType &&
              (el.isFolder = "folder" === eA.entityType),
          el
        );
      }
      function createAcpResourceLinkBlock(eA, el, ec) {
        var eu, eQ, eD, eT;
        let eR = getAcpResourceLinkDisplayName(eA, el),
          ek = { displayAsPhrase: !0, displayText: eR };
        if (eA.startsWith(ed)) {
          let eA = eR.startsWith("/") ? eR.slice(1) : eR;
          ((ek.mentionType = "command"),
            (ek.type = "command"),
            (ek.commandName = eA));
        } else if (eA.startsWith(ep)) {
          let el = eA.endsWith("/"),
            ec = decodeFileUriPath(eA) || eR;
          ((ek.mentionType = el ? "folder" : "file"),
            (ek.type = ek.mentionType),
            (ek.icon = el ? "folder" : "file"),
            (ek.fileName = eR),
            (ek.relativePath = ec),
            (ek.filePath = ec));
        } else if (eA.startsWith(eg)) {
          let el = eA.slice(eg.length);
          ((ek.mentionType = "scene"), (ek.type = "scene"), (ek.sceneId = el));
        } else if (eA.startsWith(eh))
          ((ek.mentionType = "skill"), (ek.type = "skill"));
        else if (eA.startsWith(ef)) {
          ((ek.mentionType = "tencent-doc"),
            (ek.type = "tencent-doc"),
            (ek.fileId = eA.slice(ef.length)));
          let el = ec,
            ed =
              null !=
              (eQ =
                null != (eu = readString(null == el ? void 0 : el.fileUrl))
                  ? eu
                  : readString(null == el ? void 0 : el.rawUrl))
                ? eQ
                : readString(null == el ? void 0 : el.url);
          (ed && (ek.fileUrl = ed),
            "string" == typeof (null == el ? void 0 : el.fileType) &&
              el.fileType &&
              (ek.fileType = el.fileType),
            "string" == typeof (null == el ? void 0 : el.fileExt) &&
              el.fileExt &&
              (ek.fileExt = el.fileExt),
            "number" == typeof (null == el ? void 0 : el.fileSize) &&
              (ek.fileSize = el.fileSize),
            "string" == typeof (null == el ? void 0 : el.ownerName) &&
              el.ownerName &&
              (ek.ownerName = el.ownerName),
            "string" == typeof (null == el ? void 0 : el.title) &&
              el.title &&
              (ek.title = el.title));
        } else if (eA.startsWith(em)) {
          let el = eA
              .slice(em.length)
              .split("/")
              .filter(Boolean)
              .map(decodeURIComponentSafe),
            ec = el.length >= 2 ? el[0] : void 0,
            eu = el.length >= 2 ? el[1] : el[0];
          ((ek.mentionType = "ima"),
            (ek.type = "ima"),
            (ek.source = "ima"),
            eu && (ek["ima.fileId"] = eu),
            ec && (ek["ima.kbId"] = ec));
        } else if (eA.startsWith(eE)) {
          ((ek.mentionType = "tencent-lexiang"), (ek.type = "tencent-lexiang"));
          let el = parseLexiangUri(eA),
            eu =
              null != (eD = null == ec ? void 0 : ec.isFolder)
                ? eD
                : (null == el ? void 0 : el.entityType) === "folder";
          ((null == el ? void 0 : el.entityType) &&
            (ek.entityType = el.entityType),
            (ek.entityId =
              null != (eT = null == el ? void 0 : el.entityId)
                ? eT
                : eA.slice(eE.length)),
            (null == el ? void 0 : el.kbId) && (ek.kbId = el.kbId),
            (null == el ? void 0 : el.teamId) && (ek.teamId = el.teamId),
            "string" == typeof (null == ec ? void 0 : ec.iconUrl) && ec.iconUrl
              ? (ek.icon = { url: ec.iconUrl, alt: eR })
              : eu && (ek.icon = "folder"),
            "string" == typeof (null == ec ? void 0 : ec.extension) &&
              ec.extension &&
              (ek.extension = ec.extension),
            "string" == typeof (null == ec ? void 0 : ec.kind) &&
              ec.kind &&
              (ek.kind = ec.kind));
        } else if (eA.startsWith(eC)) {
          let el = eA.slice(eC.length);
          ((ek.mentionType = el.endsWith("/") ? "folder" : "file"),
            (ek.type = ek.mentionType),
            (ek.source = "personal"),
            (ek.filePath = el),
            (ek.fileName = eR));
        } else if (eA.startsWith(ey)) {
          if (
            ((ek.mentionType = "selection"),
            (ek.selectionQuote = !0),
            (ek.displayAsPhrase = !0),
            (ek.displayAsContext = !1),
            (ek.displayText = el),
            ec)
          ) {
            let eA = ec;
            ("string" == typeof eA.selectedText &&
              eA.selectedText &&
              (ek.selectedText = eA.selectedText),
              "string" == typeof eA.llmText &&
                eA.llmText &&
                (ek.llmText = eA.llmText),
              "string" == typeof eA.title && eA.title && (ek.title = eA.title),
              eA.htmlSelection && (ek.htmlSelection = !0));
          }
        } else if (eA.startsWith(ew)) {
          if (
            ((ek.mentionType = "comment-discussion"),
            (ek.type = "comment-discussion"),
            (ek.displayAsPhrase = !0),
            (ek.displayAsContext = !1),
            (ek.displayText = el),
            ec)
          ) {
            let eA = ec;
            ("string" == typeof eA.spaceId && (ek.spaceId = eA.spaceId),
              "string" == typeof eA.nodeId && (ek.nodeId = eA.nodeId),
              "string" == typeof eA.discussionId &&
                (ek.discussionId = eA.discussionId),
              "string" == typeof eA.llmText && (ek.llmText = eA.llmText),
              "string" == typeof eA.sourceUrl && (ek.sourceUrl = eA.sourceUrl));
          }
        } else if (eA.startsWith(eB)) {
          if (
            ((ek.mentionType = e_),
            (ek.type = "document-selection"),
            (ek.displayAsContext = !1),
            (ek.icon = "file"),
            (ek.rangeId = decodeURIComponentSafe(eA.slice(eB.length))),
            ec)
          ) {
            let eA = ec;
            ("string" == typeof eA.documentResourceUri &&
              eA.documentResourceUri &&
              (ek.documentResourceUri = eA.documentResourceUri),
              "string" == typeof eA.filePath &&
                eA.filePath &&
                (ek.filePath = eA.filePath),
              "string" == typeof eA.fileType &&
                eA.fileType &&
                (ek.fileType = eA.fileType),
              "string" == typeof eA.fileId &&
                eA.fileId &&
                (ek.fileId = eA.fileId),
              "string" == typeof eA.rangeId &&
                eA.rangeId &&
                (ek.rangeId = eA.rangeId),
              "string" == typeof eA.selectionRef &&
                eA.selectionRef &&
                (ek.selectionRef = eA.selectionRef),
              "string" == typeof eA.sourceApi &&
                eA.sourceApi &&
                (ek.sourceApi = eA.sourceApi),
              isRecord(eA.selectionPayload) &&
                (ek.selectionPayload = eA.selectionPayload));
          }
        } else if (eA.startsWith(eI)) {
          let el = eA.slice(eI.length),
            eu = ec;
          ((ek.mentionType = "agent-mail"),
            (ek.type = "agent-mail"),
            (ek.icon = "agent-mail"),
            (ek.agentMail = !0),
            (ek.id =
              "string" == typeof (null == eu ? void 0 : eu.message_id)
                ? eu.message_id
                : el),
            (ek.message_id = ek.id),
            (ek.title =
              "string" == typeof (null == eu ? void 0 : eu.subject)
                ? eu.subject
                : eR),
            (ek.displayText = ek.title),
            "string" == typeof (null == eu ? void 0 : eu.sender) &&
              eu.sender &&
              (ek.sender = eu.sender),
            "object" == typeof (null == eu ? void 0 : eu.from) &&
              eu.from &&
              (ek.from = eu.from),
            "string" == typeof (null == eu ? void 0 : eu.created_at) &&
              eu.created_at &&
              (ek.created_at = eu.created_at),
            "string" == typeof (null == eu ? void 0 : eu.snippet) &&
              (ek.snippet = eu.snippet));
        } else
          eA.startsWith(ev)
            ? ((ek.mentionType = "expert"),
              (ek.type = "expert"),
              (ek.expertId = eA.slice(ev.length)))
            : eA.startsWith(eS) &&
              ((ek.mentionType = "article"),
              (ek.type = "article"),
              (ek.url = eA.slice(eS.length)));
        return { type: "resource_link", uri: eA, name: eR, _meta: ek };
      }
      function createTextBlock(eA) {
        return { type: "text", text: eA };
      }
      function createInlineImageBadgeToken(eA, el) {
        let ec = getInlineImageLabel(eA, el);
        return `@image#${el}:${encodeInlineBadgeValue(ec)}`;
      }
      function getInlinePromptResourceText(eA) {
        if (
          (null == eA ? void 0 : eA.mentionType) ===
            el.INLINE_PROMPT_RESOURCE_MENTION_TYPE &&
          "string" == typeof eA.promptText &&
          eA.promptText.trim()
        )
          return eA.promptText.trim();
      }
      function getInlineImageLabel(eA, el) {
        var ec, eu;
        return String(
          (null == (ec = eA._meta) ? void 0 : ec.filename) ||
            (null == (eu = eA._meta) ? void 0 : eu.originalFilename) ||
            getLastPathSegment(eA.uri) ||
            `image-${el}`,
        );
      }
      function decodeFileUriPath(eA) {
        if (eA.startsWith(ep))
          return decodeURIComponentSafe(eA.slice(ep.length));
      }
      function decodeURIComponentSafe(eA) {
        try {
          return decodeURIComponent(eA);
        } catch (el) {
          return eA;
        }
      }
      function encodeInlineBadgeValue(eA) {
        return isBareInlineBadgeValue(eA)
          ? eA
          : `"${eA.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
      }
      function isBareInlineBadgeValue(eA) {
        return (
          eA.length > 0 &&
          !eA.includes('"') &&
          !eA.includes("\\") &&
          Array.from(eA).every((eA) => eR.test(eA))
        );
      }
      function shouldDecodeProviderDataHint(eA, el) {
        let ec = eA.trim();
        if (!ec) return !1;
        if (el.uri.startsWith(eB)) {
          let eA = readTDocSelectionTimestampRefFromHint(el);
          return !!eA && ec === formatTDocSelectionBadge(el.name, eA);
        }
        if (ec === el.name || ec === el.name.replace(/^\//, "")) return !0;
        let eu = el.name;
        return (
          !!(
            ec === `@"${eu}"` ||
            ec === `@${eu}` ||
            el.uri.startsWith(ey) ||
            el.uri.startsWith(ew)
          ) ||
          (el.uri.startsWith(eB)
            ? ec === `@tdoc-selection:${encodeInlineBadgeValue(el.name)}`
            : el.uri.startsWith(eD) || el.uri.startsWith(eQ)
              ? ec.includes(el.uri)
              : ec.includes("<command-message>"))
        );
      }
      function stripPromptContextXmlIfNeeded(eA) {
        return eA.includes("<system-reminder") || eA.includes("<user_query>")
          ? (0, eu.stripPromptContextXml)(eA)
          : eA;
      }
      function findNextInlineToken(eA, el, ec) {
        for (let eu = el; eu < eA.length; eu += 1) {
          let el = eA[eu];
          if ("@" === el) {
            let el = parseReferenceBadge(eA, eu, ec);
            if (el) return el;
          }
          if ("/" === el) {
            let el = parseSlashToken(eA, eu);
            if (el) return el;
          }
        }
      }
      function parseReferenceBadge(eA, el, ec) {
        if (!isReferenceBadgeBoundary(eA, el)) return;
        let eu = parseTypedBadge(eA, el, ec);
        if (eu) return eu;
        if (startsWithExplicitTypedBadgePrefix(eA, el)) return;
        let ed = parseInlineBadgeValue(eA, el + 1);
        if (!ed) return;
        let eg = `${ep}${ed.value}`,
          eh =
            (ed.value.startsWith("/") && getLastPathSegment(ed.value)) ||
            ed.value;
        return {
          start: el,
          end: ed.end,
          block: createAcpResourceLinkBlock(eg, eh),
        };
      }
      function startsWithExplicitTypedBadgePrefix(eA, el) {
        return (
          eA.startsWith("@scene:", el) ||
          eA.startsWith("@scene#", el) ||
          eA.startsWith("@skill:", el) ||
          eA.startsWith("@tdoc-selection#", el) ||
          eA.startsWith("@tdoc:", el) ||
          eA.startsWith("@tdoc#", el) ||
          eA.startsWith("@ima:", el) ||
          eA.startsWith("@lexiang:", el) ||
          eA.startsWith("@selection:", el) ||
          eA.startsWith("@comment:", el) ||
          eA.startsWith("@agentmail:", el) ||
          eA.startsWith("@expert:", el) ||
          eA.startsWith("@article:", el) ||
          eA.startsWith("@share-html:", el) ||
          eA.startsWith("@image#", el)
        );
      }
      function parseSelectionQuoteReminder(eA, el) {
        let ec = el;
        for (
          ;
          ec < eA.length &&
          (" " === eA[ec] || "\n" === eA[ec] || "	" === eA[ec]);

        )
          ec += 1;
        let eu = "<selection_quote",
          ed = "</selection_quote>";
        if (!eA.startsWith(eu, ec)) return;
        let ep = eA.indexOf(">", ec + eu.length);
        if (-1 === ep) return;
        let eg = eA.indexOf(ed, ep + 1);
        if (-1 === eg) return;
        let eh = eA.slice(ec + eu.length, ep),
          ef = eA.slice(ep + 1, eg),
          em = eg + ed.length;
        for (
          ;
          em < eA.length &&
          (" " === eA[em] || "\n" === eA[em] || "	" === eA[em]);

        )
          em += 1;
        let eE = eh.match(/\bsource="([^"]*)"/),
          eC = eh.match(/\btitle="([^"]*)"/),
          ey = eh.match(/\bhtmlSelection="true"/);
        return {
          end: em,
          ...(eE ? { sourceFile: unescapeXmlAttribute(eE[1]) } : {}),
          ...(eC ? { title: unescapeXmlAttribute(eC[1]) } : {}),
          ...(ey ? { htmlSelection: !0 } : {}),
          selectedText: ef,
        };
      }
      ((el.getAcpResourceLinkDisplayName = getAcpResourceLinkDisplayName),
        (el.encodeAcpResourceLinkToInputText =
          encodeAcpResourceLinkToInputText),
        (el.isInlineEncodableResourceLink = function (eA) {
          var el, ec, eu;
          if ("string" != typeof eA.uri) return !1;
          if (
            getInlinePromptResourceText(eA.meta) ||
            ((null == (el = eA.meta) ? void 0 : el.provider) === "space-doc" &&
              (null == (ec = eA.meta) ? void 0 : ec.kind) ===
                "space/doc-ref") ||
            eA.uri.startsWith(ed) ||
            eA.uri.startsWith(ep) ||
            eA.uri.startsWith(eg) ||
            eA.uri.startsWith(eh) ||
            eA.uri.startsWith(ef) ||
            eA.uri.startsWith(eC) ||
            eA.uri.startsWith(ey) ||
            eA.uri.startsWith(ew) ||
            eA.uri.startsWith(eB) ||
            eA.uri.startsWith(ev) ||
            eA.uri.startsWith(eS) ||
            eA.uri.startsWith(eD) ||
            eA.uri.startsWith(eQ)
          )
            return !0;
          let em =
            "string" ==
            typeof (null == (eu = eA.meta) ? void 0 : eu.mentionType)
              ? eA.meta.mentionType
              : void 0;
          return "file" === em || "folder" === em;
        }),
        (el.decodeInputTextToAcpContentBlocks =
          decodeInputTextToAcpContentBlocks),
        (el.decodePersistedUserContentToAcpContentBlocks = function (
          eA,
          el = {},
        ) {
          let ec =
              el.convertPersistedImageBlock ||
              defaultConvertPersistedImageBlock,
            eu = collectLegacyTencentDocsProviderHintsFromPersistedContent(eA),
            ed = eA.some(
              (eA) =>
                (null == eA ? void 0 : eA.type) === "input_text" &&
                "string" == typeof eA.text &&
                eO.test(stripPromptContextXmlIfNeeded(eA.text)),
            ),
            ep = eA
              .map((eA) => ({ converted: ec(eA) }))
              .filter((eA) => !!eA.converted),
            eg = new Set(),
            eh = [];
          for (let el of eA)
            if (el && "object" == typeof el) {
              if ("image" === el.type) {
                let eA = normalizePersistedImageBlockToAcp(el);
                eA && eh.push(eA);
                continue;
              }
              if (
                "text" === el.type ||
                "audio" === el.type ||
                "resource" === el.type ||
                "resource_link" === el.type
              ) {
                eh.push(el);
                continue;
              }
              if ("input_text" === el.type) {
                let eA = el.text || "",
                  ec = mergeTDocSelectionProviderDataFromPromptContext(
                    eA,
                    mergeLegacyTencentDocsProviderDataFromReferences(
                      eA,
                      el.providerData,
                      eu,
                    ),
                  ),
                  ef = decodeInputTextToAcpContentBlocks(eA, ec, {
                    resolveImageOrdinal: ed
                      ? (eA, el) => {
                          let ec = ep[eA - 1];
                          if (null == ec ? void 0 : ec.converted)
                            return (
                              eg.add(eA - 1),
                              applyInlineImageLabel(ec.converted, el)
                            );
                        }
                      : void 0,
                  });
                (null == ef ? void 0 : ef.length) && eh.push(...ef);
                continue;
              }
              if (!ed) {
                let eA = ec(el);
                eA && eh.push(eA);
              }
            }
          return (ed &&
            ep.forEach((eA, el) => {
              eg.has(el) || eh.push(eA.converted);
            }),
          0 === eh.length)
            ? []
            : mergeAdjacentTextBlocks(eh);
        }),
        (el.getAcpResourceLinkProviderData = getAcpResourceLinkProviderData),
        (el.formatDocumentSelectionContextText =
          formatDocumentSelectionContextText),
        (el.createAcpResourceLinkBlock = createAcpResourceLinkBlock),
        (el.extractVisiblePromptText = function (eA) {
          if (!Array.isArray(eA) || 0 === eA.length) return "";
          let el = "",
            ec = 0;
          for (let ed of eA)
            if (ed && "object" == typeof ed) {
              if ("text" === ed.type && "string" == typeof ed.text) {
                let eA = (0, eu.stripSystemReminderXml)(ed.text).trim();
                eA && (el = appendInlineTextPiece(el, eA));
                continue;
              }
              if ("resource_link" === ed.type && "string" == typeof ed.uri) {
                let eA = ed._meta || {},
                  ec = encodeAcpResourceLinkToInputText({
                    uri: toInlineEncodableResourceUri(
                      ed.uri,
                      "string" == typeof eA.mentionType
                        ? eA.mentionType
                        : void 0,
                      "string" == typeof eA.relativePath
                        ? eA.relativePath
                        : void 0,
                    ),
                    name: "string" == typeof ed.name ? ed.name : void 0,
                    relativePath:
                      "string" == typeof eA.relativePath
                        ? eA.relativePath
                        : void 0,
                    meta: eA,
                  }).text;
                el = appendInlineTextPiece(
                  el,
                  (0, eu.stripSystemReminderXml)(ec),
                );
                continue;
              }
              "image" === ed.type &&
                ("string" == typeof ed.data || "string" == typeof ed.uri) &&
                ((ec += 1),
                (el = appendInlineTextPiece(
                  el,
                  createInlineImageBadgeToken(ed, ec),
                )));
            }
          return el;
        }),
        (el.extractRuntimePromptText = function (eA) {
          if (!Array.isArray(eA) || 0 === eA.length) return "";
          let el = [],
            ec = "",
            ed = 0;
          for (let ep of eA)
            if (ep && "object" == typeof ep) {
              if ("text" === ep.type && "string" == typeof ep.text) {
                let eA = ep.text;
                if (eA.includes("<system-reminder")) {
                  let ec = eA.trim();
                  ec && el.push(ec);
                  continue;
                }
                let ed = (0, eu.stripSystemReminderXml)(eA).trim();
                ed && (ec = appendInlineTextPiece(ec, ed));
                continue;
              }
              if ("resource_link" === ep.type && "string" == typeof ep.uri) {
                let eA = ep._meta || {};
                ec = appendInlineTextPiece(
                  ec,
                  encodeAcpResourceLinkToInputText({
                    uri: toInlineEncodableResourceUri(
                      ep.uri,
                      "string" == typeof eA.mentionType
                        ? eA.mentionType
                        : void 0,
                      "string" == typeof eA.relativePath
                        ? eA.relativePath
                        : void 0,
                    ),
                    name: "string" == typeof ep.name ? ep.name : void 0,
                    relativePath:
                      "string" == typeof eA.relativePath
                        ? eA.relativePath
                        : void 0,
                    meta: eA,
                  }).text,
                );
                continue;
              }
              "image" === ep.type &&
                ("string" == typeof ep.data || "string" == typeof ep.uri) &&
                ((ed += 1),
                (ec = appendInlineTextPiece(
                  ec,
                  createInlineImageBadgeToken(ep, ed),
                )));
            }
          let ep = [];
          return (
            el.length > 0 && ep.push(el.join("\n")),
            ec && ep.push((0, eu.wrapUserQueryXml)(ec)),
            ep.join("\n")
          );
        }));
      let eN = { quot: '"', apos: "'", lt: "<", gt: ">", amp: "&" },
        eP = /&(?:(quot|apos|lt|gt|amp)|#x([0-9a-fA-F]+)|#(\d+));/g;
      function unescapeXmlText(eA) {
        return eA.replace(eP, (eA, el, ec, eu) =>
          el
            ? eN[el]
            : void 0 !== ec
              ? decodeXmlCharRef(eA, Number.parseInt(ec, 16))
              : decodeXmlCharRef(eA, Number.parseInt(eu, 10)),
        );
      }
      function decodeXmlCharRef(eA, el) {
        return !Number.isInteger(el) ||
          el < 0 ||
          el > 1114111 ||
          (el >= 55296 && el <= 57343)
          ? eA
          : String.fromCodePoint(el);
      }
      function unescapeXmlAttribute(eA) {
        return unescapeXmlText(eA);
      }
      function parseTypedBadge(eA, el, ec) {
        var eu;
        let ed = parseSceneBadge(eA, el);
        if (ed) return ed;
        for (let ed of eT) {
          let ep, eg, e_;
          if ("scene" === ed || !eA.startsWith(`@${ed}`, el)) continue;
          if ("article" === ed) {
            let ec = el + 8;
            if (":" !== eA[ec]) return;
            let eu = parseBareUrlBadgeValue(eA, ec + 1);
            if (!eu) return;
            return {
              start: el,
              end: eu.end,
              block: createAcpResourceLinkBlock(`${eS}${eu.value}`, eu.value),
            };
          }
          if ("share-html" === ed) {
            let ec = el + 11;
            if (":" !== eA[ec]) return;
            let eu = parseShareHtmlBadgeValue(eA, ec + 1);
            if (!eu) return;
            return {
              start: el,
              end: eu.end,
              block: createAcpResourceLinkBlock(
                eu.value,
                getShareHtmlChipDisplayName(eu.value),
              ),
            };
          }
          let eQ = el + ed.length + 1;
          if ("image" === ed) {
            if ("#" !== eA[eQ]) return;
            let el = (eQ += 1);
            for (; eQ < eA.length && /[0-9]/.test(eA[eQ]); ) eQ += 1;
            if (el === eQ) return;
            ep = Number.parseInt(eA.slice(el, eQ), 10);
          } else if ("tdoc" === ed && "#" === eA[eQ]) {
            let el = (eQ += 1);
            for (; eQ < eA.length && ":" !== eA[eQ]; ) eQ += 1;
            if (el === eQ) return;
            eg = decodeURIComponentSafe(eA.slice(el, eQ));
          } else if ("tdoc-selection" === ed && "#" === eA[eQ]) {
            let el = (eQ += 1);
            for (; eQ < eA.length && /[0-9]/.test(eA[eQ]); ) eQ += 1;
            if (el === eQ) return;
            if (
              !isTDocSelectionTimestampRef(
                (e_ = decodeURIComponentSafe(eA.slice(el, eQ))),
              )
            )
              break;
          }
          if (":" !== eA[eQ]) break;
          let eD = parseInlineBadgeValue(eA, eQ + 1);
          if (!eD) break;
          if ("skill" === ed)
            return {
              start: el,
              end: eD.end,
              block: createAcpResourceLinkBlock(`${eh}${eD.value}`, eD.value),
            };
          if ("expert" === ed)
            return {
              start: el,
              end: eD.end,
              block: createAcpResourceLinkBlock(`${ev}${eD.value}`, eD.value),
            };
          if ("tdoc" === ed) {
            let eA = eg || eD.value;
            return {
              start: el,
              end: eD.end,
              block: createAcpResourceLinkBlock(`${ef}${eA}`, eD.value),
            };
          }
          if ("tdoc-selection" === ed) {
            if (!e_)
              return {
                start: el,
                end: eD.end,
                block: createTextBlock(eD.value),
              };
            return {
              start: el,
              end: eD.end,
              block: createAcpResourceLinkBlock(
                `${eB}${encodeURIComponent(e_)}`,
                eD.value,
              ),
            };
          }
          if ("ima" === ed)
            return {
              start: el,
              end: eD.end,
              block: createAcpResourceLinkBlock(`${em}${eD.value}`, eD.value),
            };
          if ("lexiang" === ed)
            return {
              start: el,
              end: eD.end,
              block: createAcpResourceLinkBlock(`${eE}${eD.value}`, eD.value),
            };
          if ("netdrive" === ed)
            return {
              start: el,
              end: eD.end,
              block: createAcpResourceLinkBlock(`${eC}${eD.value}`, eD.value),
            };
          if ("agentmail" === ed)
            return {
              start: el,
              end: eD.end,
              block: createAcpResourceLinkBlock(`${eI}${eD.value}`, eD.value),
            };
          if ("selection" === ed) {
            let ec = parseSelectionQuoteReminder(eA, eD.end),
              ed = null == ec ? void 0 : ec.sourceFile,
              ep = ed ? `${ey}${ed}` : `${ey}${eD.value}`,
              eg = null != (eu = null == ec ? void 0 : ec.title) ? eu : ed,
              eh = ec
                ? {
                    uri: ep,
                    name: eD.value,
                    ...(ec.selectedText
                      ? { selectedText: ec.selectedText }
                      : {}),
                    ...(eg ? { title: eg } : {}),
                    ...(ec.htmlSelection ? { htmlSelection: !0 } : {}),
                  }
                : void 0,
              ef = createAcpResourceLinkBlock(ep, eD.value, eh);
            return { start: el, end: ec ? ec.end : eD.end, block: ef };
          }
          if ("comment" === ed)
            return {
              start: el,
              end: eD.end,
              block: createAcpResourceLinkBlock(
                `${ew}${encodeURIComponent(eD.value)}`,
                eD.value,
              ),
            };
          if (!ep || !ec.resolveImageOrdinal) break;
          let eT = ec.resolveImageOrdinal(ep, eD.value);
          if (!eT) break;
          return { start: el, end: eD.end, block: eT };
        }
      }
      function parseLexiangUri(eA) {
        if (!eA.startsWith(eE)) return;
        let el = eA.slice(eE.length),
          ec = el.indexOf("?");
        if (ec < 0) return { entityId: el };
        let eu = el.slice(0, ec),
          ed = el.slice(ec + 1),
          ep = { entityId: eu };
        for (let eA of ed.split("&")) {
          if (!eA) continue;
          let el = eA.indexOf("="),
            ec = el < 0 ? eA : eA.slice(0, el),
            eu = el < 0 ? "" : eA.slice(el + 1);
          if (!ec) continue;
          let ed = ec,
            eg = eu;
          try {
            ed = decodeURIComponent(ec);
          } catch (eA) {}
          try {
            eg = decodeURIComponent(eu);
          } catch (eA) {}
          "type" === ed && eg
            ? (ep.entityType = eg)
            : "kbId" === ed && eg
              ? (ep.kbId = eg)
              : "teamId" === ed && eg && (ep.teamId = eg);
        }
        return ep;
      }
      function parseSceneBadge(eA, el) {
        let ec;
        if (!eA.startsWith("@scene", el)) return;
        let eu = el + 6;
        if ("#" === eA[eu]) {
          let el = (eu += 1);
          for (; eu < eA.length && eR.test(eA[eu]); ) eu += 1;
          if (el === eu) return;
          ec = eA.slice(el, eu);
        }
        if (":" !== eA[eu]) return;
        let ed = parseInlineBadgeValue(eA, eu + 1);
        if (!ed) return;
        let ep = ec || ed.value;
        return {
          start: el,
          end: ed.end,
          block: createAcpResourceLinkBlock(`${eg}${ep}`, ed.value),
        };
      }
      function parseBareUrlBadgeValue(eA, el, ec = {}) {
        var eu;
        let ed = null == (eu = ec.stopAtCjk) || eu,
          ep = el;
        for (; ep < eA.length; ) {
          let el = eA[ep];
          if (
            " " === el ||
            "	" === el ||
            "\n" === el ||
            "\r" === el ||
            "@" === el ||
            (ed && el.charCodeAt(0) > 11903)
          )
            break;
          ep += 1;
        }
        if (ep !== el) return { end: ep, value: eA.slice(el, ep) };
      }
      function parseShareHtmlBadgeValue(eA, el) {
        let ec = parseBareUrlBadgeValue(eA, el, { stopAtCjk: !1 });
        if (!ec) return;
        let eu = ec.value,
          ed = eu.toLowerCase().lastIndexOf(".html");
        if (ed < 0) return ec;
        let ep = ed + 5;
        if ("?" === eu[ep] || "#" === eu[ep]) {
          let eA = ep + 1;
          for (; eA < eu.length; ) {
            let el = eu[eA];
            if (
              " " === el ||
              "	" === el ||
              "\n" === el ||
              "\r" === el ||
              "@" === el ||
              el.charCodeAt(0) > 11903
            )
              break;
            eA += 1;
          }
          ep = eA;
        }
        return { end: el + ep, value: eu.slice(0, ep) };
      }
      function getShareHtmlChipDisplayName(eA) {
        let el = eA,
          ec = el.indexOf("#");
        ec >= 0 && (el = el.slice(0, ec));
        let eu = el.indexOf("?");
        eu >= 0 && (el = el.slice(0, eu));
        let ed = el.replace(/\/+$/, "").split("/").pop();
        return ed ? decodeURIComponentSafe(ed) : eA;
      }
      function parseInlineBadgeValue(eA, el) {
        if ('"' === eA[el]) {
          let ec = el + 1,
            eu = "";
          for (; ec < eA.length; ) {
            let el = eA[ec];
            if ("\\" === el) {
              let el = eA[ec + 1];
              if ('"' === el || "\\" === el) {
                ((eu += el), (ec += 2));
                continue;
              }
            }
            if ('"' === el) return { end: ec + 1, value: eu };
            ((eu += el), (ec += 1));
          }
          return;
        }
        let ec = el;
        for (; ec < eA.length && eR.test(eA[ec]); ) ec += 1;
        if (ec !== el) return { end: ec, value: eA.slice(el, ec) };
      }
      function parseSlashToken(eA, el) {
        if (!isSlashTokenBoundary(eA, el)) return;
        let ec = el + 1;
        if (!eM.test(eA[ec] || "")) return;
        let eu = ec;
        for (; eu < eA.length && ex.test(eA[eu]); ) eu += 1;
        if ("/" === eA[eu]) return;
        let ep = eA[eu];
        if (ep && !isSlashTokenBoundaryEnd(ep)) return;
        let eg = eA.slice(ec, eu);
        return {
          start: el,
          end: eu,
          block: createAcpResourceLinkBlock(`${ed}${eg}`, `/${eg}`),
        };
      }
      function isReferenceBadgeBoundary(eA, el) {
        if (0 === el) return !0;
        let ec = eA[el - 1];
        return !eR.test(ec);
      }
      function isSlashTokenBoundary(eA, el) {
        let ec = getPreviousMeaningfulChar(eA, el);
        return !ec || ("<" !== ec && ":" !== ec && "/" !== ec && !ek.test(ec));
      }
      function isSlashTokenBoundaryEnd(eA) {
        return /\s/u.test(eA) || /[.,!?;:，。！？；：)\]}"']/.test(eA);
      }
      function getPreviousMeaningfulChar(eA, el) {
        for (let ec = el - 1; ec >= 0; ec -= 1) {
          let el = eA[ec];
          if (" " !== el && "	" !== el) return el;
        }
      }
      function mergeAdjacentTextBlocks(eA) {
        let el = [];
        for (let ec of eA) {
          if (
            "text" === ec.type &&
            "string" == typeof ec.text &&
            0 === ec.text.length
          )
            continue;
          let eA = el[el.length - 1];
          if (
            (null == eA ? void 0 : eA.type) === "text" &&
            "text" === ec.type
          ) {
            eA.text += ec.text;
            continue;
          }
          el.push(ec);
        }
        return el;
      }
      function appendInlineTextPiece(eA, el) {
        return el
          ? eA
            ? needsInlineSeparator(eA[eA.length - 1], el[0])
              ? `${eA} ${el}`
              : `${eA}${el}`
            : el
          : eA;
      }
      function needsInlineSeparator(eA, el) {
        if (!eA || !el || /\s/u.test(eA) || /\s/u.test(el)) return !1;
        let ec = ek.test(eA) || "@" === eA || "/" === eA || '"' === eA,
          eu = ek.test(el) || "@" === el || "/" === el;
        return ec && eu;
      }
      function applyInlineImageLabel(eA, el) {
        let ec = { ...eA, _meta: { ...(eA._meta || {}), displayAsPhrase: !0 } };
        return (
          ec._meta.filename || (ec._meta.filename = el),
          ec.uri || (ec.uri = el),
          ec
        );
      }
      function getLastPathSegment(eA) {
        if (eA) return eA.replace(/\/+$/, "").split("/").pop() || void 0;
      }
      function defaultConvertPersistedImageBlock(eA) {
        if ("image_blob_ref" === eA.type && eA.blob_path && eA.mime)
          return {
            type: "image",
            mimeType: eA.mime,
            data: eA.blob_path,
            uri:
              eA.original_filename ||
              getLastPathSegment(eA.blob_path) ||
              eA.blob_path,
            _meta: {
              blobPath: eA.blob_path,
              displayAsPhrase: !0,
              filename:
                eA.original_filename ||
                getLastPathSegment(eA.blob_path) ||
                eA.blob_path,
            },
          };
        if ("input_image" !== eA.type || !eA.image) return;
        let el = { type: "image", _meta: { displayAsPhrase: !0 } };
        if (
          (eA.original_filename &&
            ((el._meta.filename = eA.original_filename),
            (el.uri = eA.original_filename)),
          "string" == typeof eA.image)
        ) {
          let ec = parseDataUri(eA.image);
          if (!ec) return;
          return ((el.mimeType = ec.mimeType), (el.data = ec.data), el);
        }
        if ("object" == typeof eA.image && eA.image) {
          if ("image_blob_ref" === eA.image.type && eA.image.blob_path)
            return (
              (el.mimeType = eA.image.mime),
              (el.data = eA.image.blob_path),
              (el.uri =
                eA.image.original_filename ||
                getLastPathSegment(eA.image.blob_path) ||
                eA.image.blob_path),
              (el._meta.blobPath = eA.image.blob_path),
              !el._meta.filename &&
                eA.image.original_filename &&
                (el._meta.filename = eA.image.original_filename),
              el
            );
          if ("string" == typeof eA.image.data)
            return (
              (el.mimeType = eA.image.mediaType || "image/png"),
              (el.data = eA.image.data),
              el
            );
        }
      }
      function parseDataUri(eA) {
        let el = eA.match(/^data:([^;]+);base64,(.+)$/);
        if (el) return { mimeType: el[1], data: el[2] };
      }
      function normalizePersistedImageBlockToAcp(eA) {
        if (
          "string" == typeof eA.mimeType &&
          ("string" == typeof eA.data || "string" == typeof eA.uri)
        )
          return eA;
        let el = eA.source;
        if (el && "object" == typeof el) {
          if ("base64" === el.type && "string" == typeof el.data) {
            let ec = {
              type: "image",
              mimeType:
                "string" == typeof el.media_type ? el.media_type : "image/png",
              data: el.data,
            };
            return (
              "string" == typeof eA.uri && (ec.uri = eA.uri),
              eA._meta && "object" == typeof eA._meta && (ec._meta = eA._meta),
              ec
            );
          }
          if ("url" === el.type && "string" == typeof el.url) {
            let ec = {
              type: "image",
              mimeType:
                "string" == typeof el.media_type ? el.media_type : "image/png",
              uri: el.url,
            };
            return (
              eA._meta && "object" == typeof eA._meta && (ec._meta = eA._meta),
              ec
            );
          }
        }
      }
      function toInlineEncodableResourceUri(eA, el, ec) {
        return eA.includes("://")
          ? eA
          : "file" === el || "folder" === el
            ? `${ep}${ec || eA}`
            : eA;
      }
      function tryStripTypedBadge(eA, el) {
        if (eA.startsWith("@scene", el)) {
          let ec = el + 6;
          if ("#" === eA[ec])
            for (ec += 1; ec < eA.length && eR.test(eA[ec]); ) ec += 1;
          if (":" !== eA[ec]) return;
          let eu = parseInlineBadgeValue(eA, ec + 1);
          if (!eu) return;
          return { end: eu.end, value: eu.value };
        }
        if (eA.startsWith("@image#", el)) {
          let ec = el + 7;
          for (; ec < eA.length && /[0-9]/.test(eA[ec]); ) ec += 1;
          if (":" !== eA[ec]) return;
          let eu = parseInlineBadgeValue(eA, ec + 1);
          if (!eu) return;
          return { end: eu.end, value: eu.value };
        }
        if (eA.startsWith("@article:", el)) {
          let ec = parseBareUrlBadgeValue(eA, el + 9);
          if (!ec) return;
          return { end: ec.end, value: ec.value };
        }
        if (eA.startsWith("@share-html:", el)) {
          let ec = parseShareHtmlBadgeValue(eA, el + 12);
          if (!ec) return;
          return { end: ec.end, value: ec.value };
        }
        let ec = eA.startsWith("@tdoc-selection#", el)
          ? "@tdoc-selection#"
          : eA.startsWith("@tdoc#", el)
            ? "@tdoc#"
            : void 0;
        if (ec) {
          let eu = el + ec.length;
          if ("@tdoc-selection#" === ec)
            for (; eu < eA.length && /[0-9]/.test(eA[eu]); ) eu += 1;
          else for (; eu < eA.length && ":" !== eA[eu]; ) eu += 1;
          if (
            ":" !== eA[eu] ||
            ("@tdoc-selection#" === ec &&
              !isTDocSelectionTimestampRef(
                decodeURIComponentSafe(eA.slice(el + ec.length, eu)),
              ))
          )
            return;
          let ed = parseInlineBadgeValue(eA, eu + 1);
          if (!ed) return;
          return { end: ed.end, value: ed.value };
        }
        for (let ec of [
          "skill",
          "tdoc",
          "tdoc-selection",
          "ima",
          "lexiang",
          "agentmail",
          "comment",
          "expert",
        ]) {
          let eu = `@${ec}:`;
          if (eA.startsWith(eu, el)) {
            let ec = parseInlineBadgeValue(eA, el + eu.length);
            if (!ec) return;
            return { end: ec.end, value: ec.value };
          }
        }
      }
      ((el.parseLexiangUri = parseLexiangUri),
        (el.stripInlineBadgesFromText = function (eA) {
          if (!eA) return eA;
          let el = "",
            ec = 0;
          for (; ec < eA.length; ) {
            if ("@" !== eA[ec] || !isReferenceBadgeBoundary(eA, ec)) {
              ((el += eA[ec]), (ec += 1));
              continue;
            }
            let eu = tryStripTypedBadge(eA, ec);
            if (eu) {
              ((el += eu.value), (ec = eu.end));
              continue;
            }
            if (!startsWithExplicitTypedBadgePrefix(eA, ec)) {
              let eu = parseInlineBadgeValue(eA, ec + 1);
              if (eu) {
                ((el += eu.value), (ec = eu.end));
                continue;
              }
            }
            ((el += eA[ec]), (ec += 1));
          }
          return el;
        }));
    },
    80742(eA, el) {
      "use strict";
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        (el.stripPromptContextXml =
          el.stripUserQueryXml =
          el.wrapUserQueryXml =
          el.stripSystemReminderXml =
          el.wrapHiddenContextXml =
          el.wrapXmlTextElement =
          el.wrapXmlTextCdata =
          el.escapeXmlAttribute =
          el.formatProjectFileRulesXml =
          el.PROJECT_TOOL_ROUTING_XML =
          el.TEAM_PROJECT_CONTEXT_IDENTITY =
          el.wrapTeamProjectContext =
          el.TEAM_PROJECT_CONTEXT_TAG =
          el.ADDITIONAL_DATA_ROLE =
          el.USER_CONTEXT_ROLE =
            void 0));
      let ec = /<system-reminder\b[^>]*>[\s\S]*?<\/system-reminder>\s*/g,
        eu = /<user_query>([\s\S]*?)<\/user_query>/g;
      function wrapTeamProjectContext(eA) {
        let ec = (Array.isArray(eA) ? eA : [eA])
          .map((eA) => (null != eA ? eA : "").trim())
          .filter((eA) => eA.length > 0);
        return 0 === ec.length
          ? ""
          : `<${el.TEAM_PROJECT_CONTEXT_TAG}>
${ec.join("\n")}
</${el.TEAM_PROJECT_CONTEXT_TAG}>`;
      }
      ((el.USER_CONTEXT_ROLE = "user-context"),
        (el.ADDITIONAL_DATA_ROLE = "additional-data"),
        (el.TEAM_PROJECT_CONTEXT_TAG = "team-project-context"),
        (el.wrapTeamProjectContext = wrapTeamProjectContext),
        (el.TEAM_PROJECT_CONTEXT_IDENTITY =
          "You are working within a project. The project may have shared files/assets, members, todos/tasks, and messages."),
        (el.PROJECT_TOOL_ROUTING_XML =
          "<project-tool-routing>\nSelect tools by the user's actual intent:\n- Project shared files: use `tdrive.*` and search project files only when the user asks to access/list/search/read/write project assets, project drive, or shared project files. Do not search project files just to gather background for a report, plan, or task.\n- Project members: use `project_members` to resolve members.\n- Todos/tasks: use `todo_create` / `todo_list` / `todo_update` as needed.\n- Project messages: use `project_message_*` to list, view, add, reply, edit, or delete.\n</project-tool-routing>"));
      let ed =
          "There are two file systems (sandbox is the default):\n- Sandbox filesystem: for local/uploads/artifacts files.\n- Project Drive/assets (tdrive): a shared project file system (root below).",
        ep =
          "PROJECT DRIVE / ASSETS (tdrive) — MANDATORY WORKFLOW:\n- Any mutating operation on Project Drive (create, upload, modify, move, rename, delete, overwrite) MUST be confirmed with the user before execution.\n- For Drive file edits, follow this mandatory review-before-upload workflow:\n  1. Download the latest Drive file immediately before editing to avoid overwriting others' changes, then make changes locally.\n  2. Show the user what changed, ask for explicit confirmation, then STOP.\n  3. Resume the Project Drive mutation only after the user clearly approves the reviewed local version.\n- Never upload the locally modified file back to Project Drive directly after editing. MUST show the changes to the user and get explicit confirmation first.";
      function escapeXmlAttribute(eA) {
        return eA
          .replace(/&/g, "&amp;")
          .replace(/"/g, "&quot;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
      }
      function wrapXmlTextCdata(eA) {
        return `<![CDATA[${eA.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
      }
      function wrapHiddenContextXml(eA, ec = el.USER_CONTEXT_ROLE) {
        let eu = eA.trim();
        return eu
          ? `<system-reminder data-role="${escapeXmlAttribute(ec)}">
${eu}
</system-reminder>`
          : "";
      }
      function stripSystemReminderXml(eA) {
        return eA.replace(ec, "");
      }
      function stripUserQueryXml(eA) {
        return eA.replace(eu, "$1");
      }
      ((el.formatProjectFileRulesXml = function (eA) {
        let el = (null != eA ? eA : "").trim(),
          ec = el
            ? `${ed}

${el}

${ep}`
            : `${ed}

${ep}`;
        return `<project-file-rules>
${ec}
</project-file-rules>`;
      }),
        (el.escapeXmlAttribute = escapeXmlAttribute),
        (el.wrapXmlTextCdata = wrapXmlTextCdata),
        (el.wrapXmlTextElement = function (eA, el, ec) {
          let eu = Object.entries(null != ec ? ec : {})
            .filter(([, eA]) => "string" == typeof eA && eA.length > 0)
            .map(([eA, el]) => `${eA}="${escapeXmlAttribute(el)}"`)
            .join(" ");
          return [
            eu ? `<${eA} ${eu}>` : `<${eA}>`,
            wrapXmlTextCdata(el),
            `</${eA}>`,
          ].join("\n");
        }),
        (el.wrapHiddenContextXml = wrapHiddenContextXml),
        (el.stripSystemReminderXml = stripSystemReminderXml),
        (el.wrapUserQueryXml = function (eA) {
          return `<user_query>${eA}</user_query>`;
        }),
        (el.stripUserQueryXml = stripUserQueryXml),
        (el.stripPromptContextXml = function (eA) {
          return stripUserQueryXml(stripSystemReminderXml(eA)).trim();
        }));
    },
  };
  const cache = new Map<number, any>();
  const missing = (id: number) =>
    new Proxy(
      {},
      {
        get(_target, key) {
          throw Error(
            "Explicit ACP output dependency required: " +
              id +
              "." +
              String(key),
          );
        },
      },
    );
  function load(id: number): any {
    if (cache.has(id)) return cache.get(id).exports;
    if (id === 70724) return { ...load(18703), ...load(80742) };
    const defaults: any = {
      54601: crypto,
      16928: path,
      79896: runtime.fs,
      70857: runtime.os,
      57651: { ToolNames, getVisibleTodoItems },
      75796: {
        DebugLogger: {
          error: async (...args: any[]) => runtime.logger?.error?.(...args),
        },
      },
    };
    if (runtime.modules?.[id] !== undefined) return runtime.modules[id];
    if (Object.hasOwn(defaults, id) && defaults[id] !== undefined)
      return defaults[id];
    if (!factories[id]) return missing(id);
    const module = { exports: {} };
    cache.set(id, module);
    factories[id](module, module.exports, load);
    return module.exports;
  }
  load.r = (exports: any) =>
    Object.defineProperty(exports, "__esModule", { value: true });
  load.n = (value: any) => {
    const getter =
      value && value.__esModule ? () => value.default : () => value;
    Object.defineProperty(getter, "a", { get: getter });
    return getter;
  };
  load.d = (exports: any, defs: any) => {
    for (const key of Object.keys(defs))
      if (!Object.hasOwn(exports, key))
        Object.defineProperty(exports, key, {
          enumerable: true,
          get: defs[key],
        });
  };
  return {
    codec: load(18703),
    xml: load(80742),
    timestamps: load(38548),
    AcpUtils: load(12502).AcpUtils,
    StreamJsonUtils: load(56037).StreamJsonUtils,
  };
}
