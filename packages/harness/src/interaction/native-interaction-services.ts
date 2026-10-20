// @ts-nocheck
// Complete original AskService/PlanStorage classes and selected complete PlanModeUtils.
// Only DI/bootstrap and external resource ownership stay outside source business bodies.
export const INTERACTION_SERVICES_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const INTERACTION_SERVICES_SCOPES = [
  {
    "id": 40348,
    "blocks": [
      ["expression", 7221686, 7221694],
      ["expression", 7221695, 7221756],
      ["declaration", 7222320, 7222431],
      ["declaration", 7222431, 7228157],
    ],
    "fragments": [
      ["var", "ed", 7221764, 7221776],
      ["var", "ep", 7221777, 7221789],
      ["var", "eg", 7221790, 7221802],
      ["var", "eh", 7221803, 7221815],
    ],
    "classes": [["ef", 7222438, 7228156, 14]],
    "bindings": [
      ["ed", 42086],
      ["ep", 80699],
      ["eg", 92735],
      ["eh", 29827],
    ],
  },
  {
    "id": 78621,
    "blocks": [
      ["expression", 12169913, 12169921],
      ["expression", 12169922, 12169988],
      ["declaration", 12170565, 12172464],
    ],
    "fragments": [
      ["var", "ed", 12169996, 12170008],
      ["var", "ep", 12170009, 12170021],
      ["var", "eg", 12170022, 12170034],
      ["var", "eh", 12170035, 12170047],
      ["var", "ef", 12170048, 12170060],
    ],
    "classes": [["eE", 12170604, 12172463, 6]],
    "bindings": [
      ["ed", 80699],
      ["ep", 92735],
      ["eg", 91943],
      ["eh", 93039],
      ["ef", 79896],
    ],
  },
] as const;
export const INTERACTION_SERVICES_FACTORIES = [
  [42086, 7221561, 7221656],
  [8461, 116942, 117169],
  [33563, 15734823, 15742368],
] as const;
export const INTERACTION_PLAN_UTILITIES = [
  "PlanModeUtils",
  13252197,
  13252791,
  2,
] as const;
export function createNativeInteractionServices(runtime: any = {}) {
  const setTimeout = runtime.setTimeout ?? globalThis.setTimeout,
    clearTimeout = runtime.clearTimeout ?? globalThis.clearTimeout,
    Math = runtime.Math ?? globalThis.Math;
  const cache = new Map(),
    factories: any = {
      42086(eA, el, ec) {
        "use strict";
        (ec.r(el), ec.d(el, { AskService: () => eu }));
        let eu = Symbol("AskService");
      },
      8461(eA, el) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.Deferred = void 0));
        let Deferred = class Deferred {
          constructor() {
            this.promise = new Promise((eA, el) => {
              ((this.resolve = eA), (this.reject = el));
            });
          }
        };
        el.Deferred = Deferred;
      },
      33563(eA, el) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.ATTR_STREAM_CHUNKS_APPLIED =
            el.ATTR_STREAM_CHUNKS_RECEIVED =
            el.SPAN_TYPE_USER_INPUT_WAIT =
            el.SPAN_TYPE_MODEL_STREAM =
            el.SPAN_TYPE_SESSION_REPLAY =
            el.SPAN_TYPE_CONTEXT_COMPACT =
            el.SPAN_TYPE_MCP_CALL =
            el.SPAN_TYPE_TEAMMATE_BUSY =
            el.SPAN_TYPE_SUBAGENT =
            el.SPAN_TYPE_TOOL =
            el.SPAN_TYPE_INTERACTION =
            el.ATTR_WORKBUDDY_MENTION_CONTEXTS =
            el.ATTR_WORKBUDDY_MESSAGE_CONTENT_LENGTH =
            el.ATTR_WORKBUDDY_OUTCOME =
            el.ATTR_WORKBUDDY_ERROR_MESSAGE =
            el.ATTR_WORKBUDDY_ERROR_NAME =
            el.ATTR_WORKBUDDY_DURATION_MS =
            el.ATTR_WORKBUDDY_OK =
            el.ATTR_WORKBUDDY_STATUS =
            el.ATTR_WORKBUDDY_STOP_REASON =
            el.ATTR_WORKBUDDY_CLIENT_TO_MAIN_MS =
            el.ATTR_WORKBUDDY_CLIENT_SEND_TIME =
            el.ATTR_WORKBUDDY_HAS_EXPERT_META =
            el.ATTR_WORKBUDDY_EXPERT_ID =
            el.ATTR_WORKBUDDY_ARDOT_FILE_ACTION =
            el.ATTR_WORKBUDDY_COLOR_SCHEME =
            el.ATTR_WORKBUDDY_IS_PLAYGROUND =
            el.ATTR_WORKBUDDY_REASONING_EFFORT =
            el.ATTR_WORKBUDDY_MODEL_IS_THINKING =
            el.ATTR_WORKBUDDY_MODEL =
            el.ATTR_WORKBUDDY_WELCOME_MODE =
            el.ATTR_WORKBUDDY_MODE =
            el.ATTR_WORKBUDDY_SOURCE =
            el.ATTR_WORKBUDDY_MESSAGE_ID =
            el.ATTR_WORKBUDDY_REQUEST_ID =
            el.ATTR_WORKBUDDY_PROMPT_REQUEST_ID =
            el.ATTR_WORKBUDDY_UID =
            el.ATTR_WORKBUDDY_CONVERSATION_ID =
            el.ATTR_WORKBUDDY_PROJECT_ID =
            el.ATTR_WORKBUDDY_SESSION_ID =
            el.ATTR_CONVERSATION_REQUEST_ID =
            el.SPAN_NAME_USER_INPUT_WAIT =
            el.SPAN_NAME_MODEL_STREAM =
            el.SPAN_NAME_SESSION_REPLAY =
            el.SPAN_NAME_CONTEXT_COMPACT =
            el.SPAN_NAME_MCP_CALL =
            el.SPAN_NAME_TEAMMATE_BUSY =
            el.SPAN_NAME_SUBAGENT =
            el.SPAN_NAME_TOOL =
            el.SPAN_NAME_INTERACTION =
              void 0),
          (el.TRUNCATION_SUFFIX =
            el.TOOL_CONTENT_MAX_SIZE =
            el.TOOL_INPUT_MAX_SIZE =
            el.TOOL_EVENT_ATTRS =
            el.TOOL_EVENT_RESULT =
            el.TOOL_EVENT_INPUT =
            el.TOOL_DETAIL_ATTRS =
            el.TOOL_INPUT_ATTRS =
            el.TOOL_BASE_ATTRS =
            el.USER_INPUT_WAIT_ATTRS =
            el.MODEL_STREAM_EVENT_CHUNK_PROGRESS =
            el.MODEL_STREAM_EVENT_FIRST_TOKEN =
            el.MODEL_STREAM_ATTRS =
            el.SESSION_REPLAY_ATTRS =
            el.CONTEXT_COMPACT_ATTRS =
            el.TEAMMATE_BUSY_ATTRS =
            el.SUBAGENT_ATTRS =
            el.INTERACTION_CANCEL_ATTRS =
            el.INTERACTION_PROMPT_ATTRS =
            el.INTERACTION_ATTRS =
            el.EVENT_DAEMON_PROMPT_FORWARD_FAILED =
            el.EVENT_DAEMON_PROMPT_FORWARD =
            el.EVENT_STREAM_FAILED =
            el.EVENT_STREAM_COMPLETED =
            el.EVENT_STALL_APPLY =
            el.EVENT_STALL_RECEIVED =
            el.EVENT_CHUNK_BATCH_APPLIED =
            el.EVENT_CHUNK_BATCH_RECEIVED =
            el.ATTR_STREAM_FIRST_CHUNK_AT_MS =
            el.ATTR_STREAM_STATUS =
              void 0),
          (el.SPAN_NAME_INTERACTION = "codebuddy_code.interaction"),
          (el.SPAN_NAME_TOOL = "codebuddy_code.tool"),
          (el.SPAN_NAME_SUBAGENT = "codebuddy_code.subagent"),
          (el.SPAN_NAME_TEAMMATE_BUSY = "codebuddy_code.teammate_busy"),
          (el.SPAN_NAME_MCP_CALL = "codebuddy_code.mcp_call"),
          (el.SPAN_NAME_CONTEXT_COMPACT = "codebuddy_code.context_compact"),
          (el.SPAN_NAME_SESSION_REPLAY = "codebuddy_code.session_replay"),
          (el.SPAN_NAME_MODEL_STREAM = "codebuddy_code.model_stream"),
          (el.SPAN_NAME_USER_INPUT_WAIT = "codebuddy_code.user_input_wait"),
          (el.ATTR_CONVERSATION_REQUEST_ID = "conversation.request.id"),
          (el.ATTR_WORKBUDDY_SESSION_ID = "workbuddy.session.id"),
          (el.ATTR_WORKBUDDY_PROJECT_ID = "workbuddy.project.id"),
          (el.ATTR_WORKBUDDY_CONVERSATION_ID = "workbuddy.conversation.id"),
          (el.ATTR_WORKBUDDY_UID = "workbuddy.uid"),
          (el.ATTR_WORKBUDDY_PROMPT_REQUEST_ID = "workbuddy.prompt_request_id"),
          (el.ATTR_WORKBUDDY_REQUEST_ID = "workbuddy.request_id"),
          (el.ATTR_WORKBUDDY_MESSAGE_ID = "workbuddy.message_id"),
          (el.ATTR_WORKBUDDY_SOURCE = "workbuddy.source"),
          (el.ATTR_WORKBUDDY_MODE = "workbuddy.mode"),
          (el.ATTR_WORKBUDDY_WELCOME_MODE = "workbuddy.welcome_mode"),
          (el.ATTR_WORKBUDDY_MODEL = "workbuddy.model"),
          (el.ATTR_WORKBUDDY_MODEL_IS_THINKING = "workbuddy.model_is_thinking"),
          (el.ATTR_WORKBUDDY_REASONING_EFFORT = "workbuddy.reasoning_effort"),
          (el.ATTR_WORKBUDDY_IS_PLAYGROUND = "workbuddy.is_playground"),
          (el.ATTR_WORKBUDDY_COLOR_SCHEME = "workbuddy.color_scheme"),
          (el.ATTR_WORKBUDDY_ARDOT_FILE_ACTION = "workbuddy.ardot_file_action"),
          (el.ATTR_WORKBUDDY_EXPERT_ID = "workbuddy.expert_id"),
          (el.ATTR_WORKBUDDY_HAS_EXPERT_META = "workbuddy.has_expert_meta"),
          (el.ATTR_WORKBUDDY_CLIENT_SEND_TIME = "workbuddy.client_send_time"),
          (el.ATTR_WORKBUDDY_CLIENT_TO_MAIN_MS = "workbuddy.client_to_main_ms"),
          (el.ATTR_WORKBUDDY_STOP_REASON = "workbuddy.stop_reason"),
          (el.ATTR_WORKBUDDY_STATUS = "workbuddy.status"),
          (el.ATTR_WORKBUDDY_OK = "workbuddy.ok"),
          (el.ATTR_WORKBUDDY_DURATION_MS = "workbuddy.duration_ms"),
          (el.ATTR_WORKBUDDY_ERROR_NAME = "workbuddy.error_name"),
          (el.ATTR_WORKBUDDY_ERROR_MESSAGE = "workbuddy.error_message"),
          (el.ATTR_WORKBUDDY_OUTCOME = "workbuddy.outcome"),
          (el.ATTR_WORKBUDDY_MESSAGE_CONTENT_LENGTH =
            "workbuddy.message_content_length"),
          (el.ATTR_WORKBUDDY_MENTION_CONTEXTS = "workbuddy.mention_contexts"),
          (el.SPAN_TYPE_INTERACTION = "interaction"),
          (el.SPAN_TYPE_TOOL = "tool"),
          (el.SPAN_TYPE_SUBAGENT = "subagent"),
          (el.SPAN_TYPE_TEAMMATE_BUSY = "teammate_busy"),
          (el.SPAN_TYPE_MCP_CALL = "mcp_call"),
          (el.SPAN_TYPE_CONTEXT_COMPACT = "context_compact"),
          (el.SPAN_TYPE_SESSION_REPLAY = "session_replay"),
          (el.SPAN_TYPE_MODEL_STREAM = "model_stream"),
          (el.SPAN_TYPE_USER_INPUT_WAIT = "user_input_wait"),
          (el.ATTR_STREAM_CHUNKS_RECEIVED = "stream.chunks.received"),
          (el.ATTR_STREAM_CHUNKS_APPLIED = "stream.chunks.applied"),
          (el.ATTR_STREAM_STATUS = "stream.status"),
          (el.ATTR_STREAM_FIRST_CHUNK_AT_MS = "stream.first_chunk_at_ms"),
          (el.EVENT_CHUNK_BATCH_RECEIVED = "chunk_batch_received"),
          (el.EVENT_CHUNK_BATCH_APPLIED = "chunk_batch_applied"),
          (el.EVENT_STALL_RECEIVED = "stall_received"),
          (el.EVENT_STALL_APPLY = "stall_apply"),
          (el.EVENT_STREAM_COMPLETED = "stream_completed"),
          (el.EVENT_STREAM_FAILED = "stream_failed"),
          (el.EVENT_DAEMON_PROMPT_FORWARD = "daemon.prompt.forward"),
          (el.EVENT_DAEMON_PROMPT_FORWARD_FAILED =
            "daemon.prompt.forward.failed"),
          (el.INTERACTION_ATTRS = {
            SPAN_TYPE: "span.type",
            CONVERSATION_ID: "conversation.id",
            CONVERSATION_AGENT: "conversation.agent",
          }),
          (el.INTERACTION_PROMPT_ATTRS = {
            USER_PROMPT: "user_prompt",
            USER_PROMPT_LENGTH: "user_prompt_length",
          }),
          (el.INTERACTION_CANCEL_ATTRS = {
            CONVERSATION_CANCELLED: "conversation.cancelled",
          }),
          (el.SUBAGENT_ATTRS = {
            SPAN_TYPE: "span.type",
            CONVERSATION_ID: "conversation.id",
            AGENT_ID: "agent_id",
            AGENT_TYPE: "agent_type",
          }),
          (el.TEAMMATE_BUSY_ATTRS = {
            SPAN_TYPE: "span.type",
            TEAM_NAME: "team_name",
            TEAMMATE_NAME: "teammate_name",
            SESSION_ID: "session_id",
          }),
          (el.CONTEXT_COMPACT_ATTRS = {
            SPAN_TYPE: "span.type",
            COMPACT_TYPE: "compact.type",
            COMPACT_STRATEGY: "compact.strategy",
          }),
          (el.SESSION_REPLAY_ATTRS = {
            SPAN_TYPE: "span.type",
            ACTIVE_ITEMS: "active_items",
            EVENTS: "events",
          }),
          (el.MODEL_STREAM_ATTRS = {
            SPAN_TYPE: "span.type",
            CHUNK_COUNT: "chunk_count",
            TOTAL_BYTES: "total_bytes",
            FIRST_TOKEN_MS: "first_token_ms",
          }),
          (el.MODEL_STREAM_EVENT_FIRST_TOKEN = "first_token_received"),
          (el.MODEL_STREAM_EVENT_CHUNK_PROGRESS = "chunk_progress"),
          (el.USER_INPUT_WAIT_ATTRS = {
            SPAN_TYPE: "span.type",
            TOOL_NAME: "tool_name",
            TOOL_CALL_ID: "tool.call_id",
            QUESTION_COUNT: "question.count",
          }),
          (el.TOOL_BASE_ATTRS = {
            SPAN_TYPE: "span.type",
            TOOL_NAME: "tool_name",
            TOOL_CALL_ID: "tool.call_id",
          }),
          (el.TOOL_INPUT_ATTRS = {
            TOOL_INPUT: "tool_input",
            TOOL_INPUT_TRUNCATED: "tool_input_truncated",
            TOOL_INPUT_ORIGINAL_LENGTH: "tool_input_original_length",
          }),
          (el.TOOL_DETAIL_ATTRS = {
            FILE_PATH: "file.path",
            FILE_OFFSET: "file.offset",
            FILE_LIMIT: "file.limit",
            FILE_SIZE: "file.size",
            EDIT_COUNT: "edit.count",
            COMMAND: "command",
            COMMAND_TIMEOUT: "command.timeout",
            GLOB_PATTERN: "glob.pattern",
            GLOB_PATH: "glob.path",
            GREP_PATTERN: "grep.pattern",
            GREP_PATH: "grep.path",
            GREP_GLOB: "grep.glob",
            HTTP_URL: "http.url",
            SEARCH_QUERY: "search.query",
            AGENT_PROMPT: "agent.prompt",
            AGENT_TYPE: "agent.type",
            MCP_SERVER: "mcp.server",
            MCP_TOOL: "mcp.tool",
            MCP_INPUT: "mcp.input",
            QUESTION_COUNT: "question.count",
          }),
          (el.TOOL_EVENT_INPUT = "tool_input"),
          (el.TOOL_EVENT_RESULT = "tool_result"),
          (el.TOOL_EVENT_ATTRS = {
            CONTENT: "content",
            CONTENT_TRUNCATED: "content_truncated",
            CONTENT_ORIGINAL_LENGTH: "content_original_length",
          }),
          (el.TOOL_INPUT_MAX_SIZE = 4096),
          (el.TOOL_CONTENT_MAX_SIZE = 61440),
          (el.TRUNCATION_SUFFIX =
            "\n\n[TRUNCATED - Content exceeds 60KB limit]"));
      },
    };
  function resolve(id: number): any {
    if (runtime.modules?.[id] !== undefined) return runtime.modules[id];
    if (cache.has(id)) return cache.get(id).exports;
    const m = { exports: {} };
    if (factories[id] || scopes[id]) {
      cache.set(id, m);
      if (factories[id]) factories[id](m, m.exports, resolve);
      else scopes[id](m.exports);
      return m.exports;
    }
    if (id === 80699) return resolve(8461);
    if (id === 92735) return resolve(33563);
    if (id === 93039) return { PlanModeUtils };
    return (
      runtime.getModule?.(id) ??
      new Proxy(
        {},
        {
          get(_target, key) {
            throw Error(
              "Explicit interaction dependency required: " +
                id +
                "." +
                String(key),
            );
          },
        },
      )
    );
  }
  resolve.r = (value: any) => {
    Object.defineProperty(value, "__esModule", { value: true });
    if (typeof Symbol !== "undefined" && Symbol.toStringTag)
      Object.defineProperty(value, Symbol.toStringTag, { value: "Module" });
  };
  resolve.d = (value: any, getters: any) => {
    for (const key of Object.keys(getters))
      if (!Object.hasOwn(value, key))
        Object.defineProperty(value, key, {
          enumerable: true,
          get: getters[key],
        });
  };
  const e$ = resolve(16928),
    tp = { PathUtils: { getPlansDir: () => runtime.getPlansDir() } };
  let PlanModeUtils = class PlanModeUtils {
    static generateUniquePlanFileName() {
      let eA = [
          "toasty",
          "blazing",
          "swift",
          "cosmic",
          "radiant",
          "stellar",
          "quantum",
          "electric",
        ],
        el = [
          "forging",
          "aurora",
          "thunder",
          "cascade",
          "nebula",
          "pulse",
          "vortex",
          "beacon",
        ],
        ec = [
          "babbage",
          "tesla",
          "curie",
          "einstein",
          "newton",
          "darwin",
          "lovelace",
          "turing",
        ],
        eu = eA[Math.floor(Math.random() * eA.length)],
        ed = el[Math.floor(Math.random() * el.length)],
        ep = ec[Math.floor(Math.random() * ec.length)];
      return `${eu}-${ed}-${ep}.md`;
    }
    static generatePlanFilePath() {
      let eA = this.generateUniquePlanFileName();
      return (0, e$.join)(tp.PathUtils.getPlansDir(), eA);
    }
  };
  function scope40348(el: any) {
    const ec = resolve;
    ec.r(el);
    ec.d(el, { AskServiceImpl: () => ef, AskService: () => ed.AskService });
    var ed = ec(42086);
    var ep = ec(80699);
    var eg = ec(92735);
    var eh = ec(29827);
    function getItemToolCallId(eA) {
      if (eA)
        return (
          ("function_call" === eA.rawItem.type && eA.rawItem.callId) ||
          eA.rawItem.id
        );
    }
    let ef = class {
      constructor() {
        ((this.currentItem$ = new eh.BehaviorSubject(void 0)),
          (this.earlyAnswers = new Map()),
          (this.waitingDeferreds = new Map()),
          (this.waitSpans = new Map()));
      }
      init() {
        this.logger.setContext("AskService");
      }
      startWaitSpan(eA, el, ec, eu) {
        if (!el || !eA) return;
        let ed = this.waitSpans.get(eA);
        ed && ed.markAsSuccessful();
        let ep = el.startSpan(eg.SPAN_NAME_USER_INPUT_WAIT),
          eh = eu || "AskUserQuestion";
        (ep.setAttributes({
          [eg.USER_INPUT_WAIT_ATTRS.SPAN_TYPE]: eg.SPAN_TYPE_USER_INPUT_WAIT,
          [eg.USER_INPUT_WAIT_ATTRS.TOOL_NAME]: eh,
          [eg.USER_INPUT_WAIT_ATTRS.TOOL_CALL_ID]: eA,
          [eg.USER_INPUT_WAIT_ATTRS.QUESTION_COUNT]: ec,
          wait_type: ec > 0 ? "question" : "approval",
        }),
          this.waitSpans.set(eA, ep));
      }
      endWaitSpan(eA, el, ec) {
        if (!eA) return;
        let eu = this.waitSpans.get(eA);
        eu &&
          (this.waitSpans.delete(eA),
          el ? eu.markAsSuccessful() : eu.markAsFailed(ec));
      }
      endWaitSpanExternal(eA, el, ec) {
        this.endWaitSpan(eA, el, ec);
      }
      flushPendingWaitSpans(eA) {
        if (0 !== this.waitSpans.size)
          for (let el of Array.from(this.waitSpans.keys()))
            this.endWaitSpan(el, !1, Error(eA));
      }
      setAsk(eA) {
        let el = getItemToolCallId(eA),
          ec = getItemToolCallId(this.currentItem);
        if (
          (this.logger.info?.(
            `[AskService] setAsk: currentId=${ec || "none"}, nextId=${el || "none"}`,
          ),
          this.currentItem && this.currentItem.rawItem.id === eA.rawItem.id)
        )
          return void this.logger.info?.(
            "[AskService] setAsk: same item, skip",
          );
        if (
          (ec &&
            ec !== el &&
            this.waitSpans.has(ec) &&
            this.endWaitSpan(ec, !1, Error("Superseded by new ask")),
          this.currentDeferred &&
            (this.logger.info?.(
              "[AskService] setAsk: resolving previous deferred before replacing",
            ),
            this.currentDeferred.resolve()),
          this.cleanup(),
          (this.currentDeferred = new ep.Deferred()),
          (this.currentItem = eA),
          el && this.earlyAnswers.has(el))
        ) {
          let eA = this.earlyAnswers.get(el);
          (this.earlyAnswers.delete(el),
            this.logger.info?.(
              `[AskService] setAsk: draining early answers for ${el}`,
            ),
            this.currentDeferred.resolve(eA));
          let ec = this.waitingDeferreds.get(el);
          ec && (this.waitingDeferreds.delete(el), ec.resolve(eA));
        }
        (this.currentItem$.next(eA),
          this.logger.info?.(
            `[AskService] setAsk: new deferred created for ${el || "none"}`,
          ));
      }
      doneAsk(eA, el) {
        let ec = getItemToolCallId(this.currentItem),
          eu = el || ec;
        if (
          (this.logger.info?.(
            `[AskService] doneAsk: targetId=${eu || "none"}, currentId=${ec || "none"}, answerKeys=${Object.keys(eA || {}).join(",")}`,
          ),
          this.endWaitSpan(eu, !0),
          this.currentDeferred && (!el || el === ec)
            ? (this.currentDeferred.resolve(eA),
              this.logger.info?.(
                "[AskService] doneAsk: legacy deferred resolved",
              ),
              eu &&
                eu === ec &&
                this.currentItem$.value === this.currentItem &&
                this.currentItem$.next(void 0))
            : this.currentDeferred ||
              this.logger.info?.(
                "[AskService] doneAsk: no legacy currentDeferred",
              ),
          !eu)
        ) {
          if (1 === this.waitingDeferreds.size) {
            let el = this.waitingDeferreds.entries().next().value;
            if (el) {
              let [ec, eu] = el;
              (this.waitingDeferreds.delete(ec),
                eu.resolve(eA),
                this.logger.warn?.(
                  `[AskService] doneAsk: no toolCallId, fell back to single waiter ${ec}`,
                ));
              return;
            }
          }
          this.logger.warn?.(
            `[AskService] doneAsk: no toolCallId and ${this.waitingDeferreds.size} waiters; answer dropped`,
          );
          return;
        }
        let ed = this.waitingDeferreds.get(eu);
        ed
          ? (this.waitingDeferreds.delete(eu),
            ed.resolve(eA),
            this.logger.info?.(
              `[AskService] doneAsk: waiting deferred resolved for ${eu}`,
            ))
          : (this.earlyAnswers.set(eu, eA),
            this.logger.info?.(
              `[AskService] doneAsk: answers stashed in earlyAnswers for ${eu}`,
            ));
      }
      rejectAsk(eA) {
        let el = getItemToolCallId(this.currentItem),
          ec = eA || el;
        if (
          (this.logger.info?.(
            `[AskService] rejectAsk: targetId=${ec || "none"}, currentId=${el || "none"}`,
          ),
          this.endWaitSpan(ec, !1, Error("User declined to answer questions")),
          this.currentDeferred && (!eA || eA === el)
            ? (this.currentDeferred.resolve(),
              this.logger.info?.(
                "[AskService] rejectAsk: legacy deferred resolved without answers",
              ),
              ec &&
                ec === el &&
                this.currentItem$.value === this.currentItem &&
                this.currentItem$.next(void 0))
            : this.currentDeferred ||
              this.logger.info?.(
                "[AskService] rejectAsk: no legacy currentDeferred",
              ),
          !ec)
        )
          return;
        let eu = this.waitingDeferreds.get(ec);
        eu &&
          (this.waitingDeferreds.delete(ec),
          eu.reject(Error("User declined to answer questions")),
          this.logger.info?.(
            `[AskService] rejectAsk: waiting deferred rejected for ${ec}`,
          ));
      }
      acquireAnswers(eA, el, ec = 6e5) {
        let eu;
        if (!eA)
          return Promise.reject(Error("acquireAnswers requires toolCallId"));
        let ed = this.earlyAnswers.get(eA);
        if (ed)
          return (
            this.earlyAnswers.delete(eA),
            this.logger.info?.(
              `[AskService] acquireAnswers: consumed earlyAnswers for ${eA}`,
            ),
            Promise.resolve(ed)
          );
        let eg = this.waitingDeferreds.get(eA);
        eg &&
          (this.logger.warn?.(
            `[AskService] acquireAnswers: replacing existing waiter for ${eA}`,
          ),
          eg.reject(Error("Superseded by new acquireAnswers")));
        let eh = new ep.Deferred();
        if (
          (this.waitingDeferreds.set(eA, eh),
          this.logger.info?.(
            `[AskService] acquireAnswers: waiting for ${eA} (timeoutMs=${ec})`,
          ),
          ec > 0 &&
            Number.isFinite(ec) &&
            ((eu = setTimeout(() => {
              let el = this.waitingDeferreds.get(eA);
              el === eh &&
                (this.waitingDeferreds.delete(eA),
                this.logger.warn?.(
                  `[AskService] acquireAnswers: timed out for ${eA} after ${ec}ms`,
                ),
                el.reject(
                  Error("AskUserQuestion timed out: no answer received"),
                ));
            }, ec)),
            eu.unref?.()),
          el)
        ) {
          if (el.aborted)
            return (
              this.waitingDeferreds.delete(eA),
              eu && clearTimeout(eu),
              Promise.reject(Error("Aborted"))
            );
          let onAbort = () => {
            let el = this.waitingDeferreds.get(eA);
            el === eh &&
              (this.waitingDeferreds.delete(eA), el.reject(Error("Aborted")));
          };
          (el.addEventListener("abort", onAbort, { once: !0 }),
            eh.promise
              .finally(() => el.removeEventListener("abort", onAbort))
              .catch(() => {}));
        }
        return (
          eh.promise
            .finally(() => {
              eu && clearTimeout(eu);
            })
            .catch(() => {}),
          eh.promise
        );
      }
      getCurrentAskItem() {
        return this.currentItem;
      }
      getCurrentDeferred() {
        return this.currentDeferred;
      }
      getRoutingState() {
        return {
          earlyAnswerKeys: Array.from(this.earlyAnswers.keys()),
          waitingDeferredKeys: Array.from(this.waitingDeferreds.keys()),
          currentItemId: getItemToolCallId(this.currentItem),
        };
      }
      cleanup() {
        ((this.currentDeferred = void 0), (this.currentItem = void 0));
      }
    };
    return el;
  }
  function scope78621(el: any) {
    const ec = resolve;
    ec.r(el);
    ec.d(el, {
      PlanStorageService: () => em,
      PlanStorageServiceImpl: () => eE,
    });
    var ed = ec(80699);
    var ep = ec(92735);
    var eg = ec(91943);
    var eh = ec(93039);
    var ef = ec(79896);
    let em = Symbol("PlanStorageService"),
      eE = class {
        initializePlanFilePath(eA) {
          if (eA.meta?.planFilePath) return eA.meta.planFilePath;
          let el = eh.PlanModeUtils.generatePlanFilePath();
          return (
            eA.meta || (eA.meta = {}),
            (eA.meta.planFilePath = el),
            this.logger.debug(
              `[PlanStorageService] Initialized plan file path for session ${eA.id}: ${el}`,
            ),
            el
          );
        }
        getPlanFilePath(eA) {
          return eA.meta?.planFilePath;
        }
        async write(eA, el) {
          let ec = this.getPlanFilePath(eA);
          if (!ec)
            throw Error(
              "Plan file path not initialized in session. Call initializePlanFilePath first.",
            );
          try {
            (await eg.writeFile(ec, el, "utf-8"),
              this.logger.debug(
                `[PlanStorageService] Wrote plan for session ${eA.id} to ${ec}`,
              ));
          } catch (el) {
            throw (
              this.logger.error(
                `[PlanStorageService] Failed to write plan for session ${eA.id}:`,
                el,
              ),
              el
            );
          }
        }
        async read(eA) {
          let el = this.getPlanFilePath(eA);
          if (!el)
            return void this.logger.warn(
              `[PlanStorageService] No plan file path found in session ${eA.id}`,
            );
          try {
            let ec = await eg.readFile(el, "utf-8");
            return (
              this.logger.debug(
                `[PlanStorageService] Read plan for session ${eA.id} from ${el}`,
              ),
              ec
            );
          } catch (ec) {
            if ("ENOENT" === ec.code)
              return void this.logger.debug(
                `[PlanStorageService] Plan file not found for session ${eA.id}: ${el}`,
              );
            this.logger.warn(
              `[PlanStorageService] Failed to read plan for session ${eA.id}:`,
              ec,
            );
            return;
          }
        }
        syncRead(eA) {
          let el = this.getPlanFilePath(eA);
          if (!el)
            return void this.logger.warn(
              `[PlanStorageService] No plan file path found in session ${eA.id}`,
            );
          try {
            let ec = (0, ef.readFileSync)(el, "utf-8");
            return (
              this.logger.debug(
                `[PlanStorageService] Read plan for session ${eA.id} from ${el}`,
              ),
              ec
            );
          } catch (ec) {
            if ("ENOENT" === ec.code)
              return void this.logger.debug(
                `[PlanStorageService] Plan file not found for session ${eA.id}: ${el}`,
              );
            this.logger.warn(
              `[PlanStorageService] Failed to read plan for session ${eA.id}:`,
              ec,
            );
            return;
          }
        }
        async exists(eA) {
          let el = this.getPlanFilePath(eA);
          if (!el) return !1;
          try {
            return (await eg.access(el), !0);
          } catch {
            return !1;
          }
        }
      };
    return el;
  }
  const scopes: any = { 40348: scope40348, 78621: scope78621 };
  return {
    getModule: resolve,
    PlanModeUtils,
    get AskServiceImpl() {
      return resolve(40348).AskServiceImpl;
    },
    get PlanStorageServiceImpl() {
      return resolve(78621).PlanStorageServiceImpl;
    },
  };
}
