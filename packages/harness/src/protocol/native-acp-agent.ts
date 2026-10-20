export const ACP_AGENT_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const ACP_AGENT_CLASSES = [
  ["JsonStreamParser", 6823236, 6827433],
  ["e7", 6835174, 6912795],
] as const;
export const ACP_AGENT_FUNCTIONS = [
  ["handleRollback", 6827503, 6828580],
  ["buildInjectHistoryItems", 6828580, 6829582],
  ["buildWorkspaceInfoParams", 6829625, 6830047],
  ["sendWorkspaceInfoNotification", 6830047, 6830387],
  ["isSandboxDisabledReason", 6830940, 6831015],
  ["normalizeSandboxDisabledReason", 6831015, 6831104],
  ["mapFinishReasonToStopReason", 6831104, 6831393],
  ["isRecord", 6831489, 6831563],
  ["createAuthRequiredError", 6831563, 6831665],
  ["isAuthRequiredLikeError", 6831708, 6831968],
  ["extractStructuredErrorData", 6831968, 6832312],
  ["isCancelledMessage", 6832312, 6832493],
  ["classifyErrorAsRequestError", 6832493, 6834126],
  ["buildDeniedToolCallCancelledUpdate", 6834126, 6834498],
  ["dedupeDenialToolCallIds", 6834498, 6834679],
  ["buildPendingToolCallFailedUpdate", 6834791, 6835136],
] as const;
export const ACP_AGENT_INITIALIZERS = [
  ["e2", 6830778, 6830899],
  ["e3", 6830903, 6830939],
  ["e4", 6831400, 6831488],
  ["e8", 6831672, 6831700],
  ["e5", 6831704, 6831707],
  ["e6", 6834686, 6834790],
  ["e9", 6835143, 6835170],
] as const;
export const ACP_AGENT_DECLARATIONS = [
  ["JsonStreamParser", 6823215, 6827434],
  ["handleRollback", 6827503, 6828580],
  ["buildInjectHistoryItems", 6828580, 6829582],
  ["buildWorkspaceInfoParams", 6829625, 6830047],
  ["sendWorkspaceInfoNotification", 6830047, 6830387],
  ["e2", 6830771, 6830940],
  ["isSandboxDisabledReason", 6830940, 6831015],
  ["normalizeSandboxDisabledReason", 6831015, 6831104],
  ["mapFinishReasonToStopReason", 6831104, 6831393],
  ["e4", 6831393, 6831489],
  ["isRecord", 6831489, 6831563],
  ["createAuthRequiredError", 6831563, 6831665],
  ["e8", 6831665, 6831708],
  ["isAuthRequiredLikeError", 6831708, 6831968],
  ["extractStructuredErrorData", 6831968, 6832312],
  ["isCancelledMessage", 6832312, 6832493],
  ["classifyErrorAsRequestError", 6832493, 6834126],
  ["buildDeniedToolCallCancelledUpdate", 6834126, 6834498],
  ["dedupeDenialToolCallIds", 6834498, 6834679],
  ["e6", 6834679, 6834791],
  ["buildPendingToolCallFailedUpdate", 6834791, 6835136],
  ["e9", 6835136, 6912796],
] as const;
export const ACP_AGENT_MODULE_BINDINGS = [
  ["e$", 93039],
  ["e0", 70353],
  ["e1", 70890],
  ["eB", 97959],
  ["eC", 92537],
  ["eD", 76922],
  ["eE", 54601],
  ["eF", 32917],
  ["eG", 54193],
  ["eH", 56452],
  ["eI", 74183],
  ["eJ", 75635],
  ["eK", 54631],
  ["eL", 30654],
  ["eM", 89425],
  ["eN", 95449],
  ["eO", 28579],
  ["eP", 43533],
  ["eQ", 92763],
  ["eR", 73850],
  ["eS", 67330],
  ["eT", 7357],
  ["eU", 71915],
  ["eV", 91364],
  ["eW", 38548],
  ["eX", 67037],
  ["eY", 12502],
  ["eZ", 28737],
  ["e_", 40348],
  ["ed", 67062],
  ["ef", 79814],
  ["eg", 86482],
  ["eh", 9151],
  ["ej", 35151],
  ["ek", 74272],
  ["em", 97903],
  ["ep", 70724],
  ["eu", 80699],
  ["ev", 87422],
  ["ew", 77787],
  ["ex", 39311],
  ["ey", 66545],
  ["ez", 22618],
] as const;
// Full inert original declarations. DI/IO/capabilities stay explicit; never runs app bootstrap.
export function createNativeAcpAgent(runtime: any = {}) {
  const Object: any = globalThis.Object,
    Promise: any = globalThis.Promise,
    Array: any = globalThis.Array,
    Map: any = globalThis.Map,
    Set: any = globalThis.Set,
    Date: any = runtime.Date ?? globalThis.Date;
  const setTimeout = runtime.setTimeout ?? globalThis.setTimeout,
    clearTimeout = runtime.clearTimeout ?? globalThis.clearTimeout;
  const module = (id: number) =>
    runtime.modules?.[id] ??
    runtime.getModule?.(id) ??
    new Proxy(
      {},
      {
        get(_target, key) {
          throw Error(
            "Explicit ACP agent dependency required: " + id + "." + String(key),
          );
        },
      },
    );
  const ec: any = (id: number) => module(id);
  const e$: any = module(93039);
  const e0: any = module(70353);
  const e1: any = module(70890);
  const eB: any = module(97959);
  const eC: any = module(92537);
  const eD: any = module(76922);
  const eE: any = module(54601);
  const eF: any = module(32917);
  const eG: any = module(54193);
  const eH: any = module(56452);
  const eI: any = module(74183);
  const eJ: any = module(75635);
  const eK: any = module(54631);
  const eL: any = module(30654);
  const eM: any = module(89425);
  const eN: any = module(95449);
  const eO: any = module(28579);
  const eP: any = module(43533);
  const eQ: any = module(92763);
  const eR: any = module(73850);
  const eS: any = module(67330);
  const eT: any = module(7357);
  const eU: any = module(71915);
  const eV: any = module(91364);
  const eW: any = module(38548);
  const eX: any = module(67037);
  const eY: any = module(12502);
  const eZ: any = module(28737);
  const e_: any = module(40348);
  const ed: any = module(67062);
  const ef: any = module(79814);
  const eg: any = module(86482);
  const eh: any = module(9151);
  const ej: any = module(35151);
  const ek: any = module(74272);
  const em: any = module(97903);
  const ep: any = module(70724);
  const eu: any = module(80699);
  const ev: any = module(87422);
  const ew: any = module(77787);
  const ex: any = module(39311);
  const ey: any = module(66545);
  const ez: any = module(22618);

  // UTF-16 6823215..6827434
  let JsonStreamParser: any = class JsonStreamParser {
    [key: string]: any;
    constructor(eA?: any) {
      ((this.buffer = ""),
        (this.parsedParams = new Map()),
        (this.completed = !1),
        (this.onUnexpectedError = eA));
    }
    reportUnexpected(eA?: any, el?: any): any {
      eA instanceof SyntaxError || this.onUnexpectedError?.(eA, el);
    }
    appendDelta(eA?: any): any {
      return this.completed
        ? this.getCurrentResult()
        : ((this.buffer += eA), this.tryParse());
    }
    setComplete(eA?: any): any {
      if ("string" == typeof eA) {
        this.buffer = eA;
        try {
          let el: any = JSON.parse(eA);
          el && "object" == typeof el && !Array.isArray(el)
            ? this.updateParsedParams(el, !0)
            : this.reportUnexpected(
                TypeError(
                  `setComplete: final JSON is not an object (typeof=${typeof el})`,
                ),
                "setComplete",
              );
        } catch (eA: any) {
          this.reportUnexpected(eA, "setComplete");
        }
      } else
        ((this.buffer = JSON.stringify(eA)), this.updateParsedParams(eA, !0));
      this.completed = !0;
    }
    getCurrentResult(): any {
      let eA: any = {};
      return (
        this.parsedParams.forEach((el?: any, ec?: any) => {
          eA[ec] = el.value;
        }),
        { complete: this.completed, parameters: eA, rawBuffer: this.buffer }
      );
    }
    getBuffer(): any {
      return this.buffer;
    }
    isCompleted(): any {
      return this.completed;
    }
    tryParse(): any {
      let eA: any = this.buffer.trim();
      if (!eA || "{}" === eA)
        return { complete: !1, parameters: {}, rawBuffer: this.buffer };
      try {
        let el: any = JSON.parse(eA);
        if (el && "object" == typeof el && !Array.isArray(el))
          return (
            this.updateParsedParams(el, !0),
            (this.completed = !0),
            this.getCurrentResult()
          );
      } catch (ec: any) {
        this.reportUnexpected(ec, "tryParse");
        let el: any = this.trySmartParse(eA);
        if (
          el &&
          Object.keys(el.parsed).length > 0 &&
          (this.updateParsedParams(el.parsed, el.isComplete), el.isComplete)
        )
          return ((this.completed = !0), this.getCurrentResult());
      }
      return {
        complete: !1,
        parameters: this.getParametersObject(),
        rawBuffer: this.buffer,
      };
    }
    trySmartParse(eA?: any): any {
      let el: any = eA.trim();
      if (!(el = this.tryFixMissingPrefix(el)).startsWith("{")) return;
      try {
        let eA: any = this.tryCompleteJson(el);
        if (eA) {
          let ec: any = JSON.parse(eA);
          if (ec && "object" == typeof ec && !Array.isArray(ec)) {
            let eu: any = eA === el;
            return { parsed: ec, isComplete: eu };
          }
        }
      } catch (eA: any) {
        this.reportUnexpected(eA, "trySmartParse");
      }
      let ec: any = this.extractPartialKeyValues(el);
      if (ec) return { parsed: ec, isComplete: !1 };
    }
    tryFixMissingPrefix(eA?: any): any {
      let el: any = eA.trim();
      if (el.startsWith("{")) return el;
      if (el.startsWith('"')) return "{" + el;
      if (el.match(/^([a-zA-Z_][a-zA-Z0-9_]*)"\s*:/)) return '{"' + el;
      let ec: any = el.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*"?\s*:/);
      if (ec) {
        let eA: any = ec[1],
          eu: any = ec[0].length;
        return '{"' + eA + '":' + el.substring(eu);
      }
      return el;
    }
    tryCompleteJson(eA?: any): any {
      let el: any = eA.trim(),
        ec: any = 0,
        eu: any = 0,
        ed: any = !1,
        ep: any = !1;
      for (let eA: any = 0; eA < el.length; eA++) {
        let eg: any = el[eA];
        if ("\\" === eg && !ep) {
          ep = !0;
          continue;
        }
        ('"' !== eg || ep || (ed = !ed),
          !ed &&
            ("{" === eg && ec++,
            "}" === eg && ec--,
            "[" === eg && eu++,
            "]" === eg && eu--),
          (ep = !1));
      }
      if (0 === ec && 0 === eu && !ed) return el;
      let eg: any = el;
      for (ed && (eg += '"'); eu > 0; ) ((eg += "]"), eu--);
      for (; ec > 0; ) ((eg += "}"), ec--);
      try {
        return (JSON.parse(eg), eg);
      } catch {
        return null;
      }
    }
    extractPartialKeyValues(eA?: any): any {
      let el: any = {};
      for (let ec of this.smartSplitJson(eA)) {
        let eA: any = ec.indexOf(":");
        if (-1 === eA) continue;
        let eu: any = ec.substring(0, eA).trim(),
          ed: any = ec.substring(eA + 1).trim(),
          ep: any = eu.replace(/^[{"]|"$/g, "").trim();
        if (!ep) continue;
        let eg: any = this.tryParseValue(ed);
        void 0 !== eg && (el[ep] = eg);
      }
      return Object.keys(el).length > 0 ? el : void 0;
    }
    tryParseValue(eA?: any): any {
      let el: any = eA.trim();
      if (el)
        try {
          if (el.startsWith('"') && !el.endsWith('"'))
            return this.unescapeJsonString(el.slice(1));
          let eA: any = el.replace(/[,}]+$/, "");
          if (!eA) return;
          return JSON.parse(eA);
        } catch {
          if (el.startsWith('"'))
            return this.unescapeJsonString(el.slice(1).replace(/[,}]+$/, ""));
          let eA: any = el.match(/^(-?\d+(\.\d+)?)/);
          if (eA) return parseFloat(eA[1]);
          if (el.startsWith("true")) return !0;
          if (el.startsWith("false")) return !1;
          if (el.startsWith("null")) return null;
          return;
        }
    }
    smartSplitJson(eA?: any): any {
      let el: any = [],
        ec: any = "",
        eu: any = !1,
        ed: any = !1,
        ep: any = 0,
        eg: any = 0;
      for (let eh: any = 0; eh < eA.length; eh++) {
        let ef: any = eA[eh];
        if ("\\" === ef && !ed) {
          ((ed = !0), (ec += ef));
          continue;
        }
        if ('"' === ef && !ed) {
          ((eu = !eu), (ec += ef), (ed = !1));
          continue;
        }
        if (!eu) {
          if ("{" === ef) ep++;
          else if ("}" === ef) ep--;
          else if ("[" === ef) eg++;
          else if ("]" === ef) eg--;
          else if ("," === ef && 1 === ep && 0 === eg) {
            (el.push(ec.trim()), (ec = ""), (ed = !1));
            continue;
          }
        }
        ((ec += ef), (ed = !1));
      }
      return (ec.trim() && el.push(ec.trim()), el);
    }
    unescapeJsonString(eA?: any): any {
      return eA.endsWith("\\") && !eA.endsWith("\\\\")
        ? eA
        : eA.replace(
            /\\([\\/"'bfnrt])/g,
            (eA?: any, el?: any) =>
              (
                ({
                  "\\": "\\",
                  "/": "/",
                  '"': '"',
                  "'": "'",
                  b: "\b",
                  f: "\f",
                  n: "\n",
                  r: "\r",
                  t: "	",
                }) as any
              )[el] || eA,
          );
    }
    updateParsedParams(eA?: any, el?: any): any {
      for (let [ec, eu] of Object.entries(eA))
        this.parsedParams.set(ec, { value: eu, completed: el });
    }
    getParametersObject(): any {
      let eA: any = {};
      return (
        this.parsedParams.forEach((el?: any, ec?: any) => {
          eA[ec] = el.value;
        }),
        eA
      );
    }
  };
  // UTF-16 6827503..6828580
  async function handleRollback(eA?: any, el?: any): Promise<any> {
    let { session: ec } = eA;
    if (!(el.targetMessageId || el.targetRequestId) && "forkPointId" in el) {
      let eu: any = el.forkPointId ?? void 0;
      return (
        "resend_edit" === el.reason && eA.addHistory
          ? await (0, eZ.rewindTo)(ec, eu, el.reason, {
              editedUserItemId: `root-rewind-${Date.now()}`,
              addHistory: eA.addHistory,
            })
          : await (0, eZ.rewindTo)(ec, eu, el.reason),
        { applied: !0, actualForkPointId: eu }
      );
    }
    if (el.targetMessageId || el.targetRequestId) {
      let eu: any = await eA.resolveForkPoint(ec.history, {
        userMessageId: el.targetMessageId,
        forkFromRequestId: el.targetRequestId,
      });
      if (!eu?.found)
        return (
          eA.logger?.warn?.(
            `[Rollback] fork point not resolved: sessionId=${el.sessionId}, targetMessageId=${el.targetMessageId}, targetRequestId=${el.targetRequestId}`,
          ),
          { applied: !1, error: "Cannot resolve fork point" }
        );
      let ed: any = eu.forkPoint;
      return (
        "resend_edit" === el.reason
          ? await (0, eZ.rewindTo)(ec, ed, el.reason, {
              editedUserItemId: eu.editedUserItemId,
              addHistory: eA.addHistory,
            })
          : await (0, eZ.rewindTo)(ec, ed, el.reason),
        { applied: !0, actualForkPointId: ed }
      );
    }
    return {
      applied: !1,
      error: "Either forkPointId or targetMessageId is required",
    };
  }
  // UTF-16 6828580..6829582
  function buildInjectHistoryItems(eA?: any): any {
    let el: any,
      ec: any = [];
    for (let eu of eA)
      switch (eu.role) {
        case "user":
          ec.push(
            e$.InputItemUtils.createUserMessage(eu.content ?? "", {
              skipRun: !0,
            }),
          );
          break;
        case "assistant": {
          let eA: any = e$.InputItemUtils.createAssistantMessage(
            eu.content ?? "",
            { skipRun: !0 },
          );
          (eu.usage &&
            (eA.providerData = { ...(eA.providerData ?? {}), usage: eu.usage }),
            ec.push(eA));
          break;
        }
        case "tool_call": {
          let eA: any;
          if ("object" == typeof eu.arguments && null !== eu.arguments)
            eA = eu.arguments;
          else
            try {
              eA = JSON.parse(String(eu.arguments ?? "{}"));
            } catch {
              throw Error(
                `Invalid JSON in tool_call arguments for tool "${eu.name ?? "unknown"}"`,
              );
            }
          let ed: any = e$.InputItemUtils.createToolCallItem(
            eu.name ?? "unknown",
            eA,
            { skipRun: !0 },
          );
          ((el = ed), ec.push(ed));
          break;
        }
        case "tool_result": {
          let eA: any =
            el ??
            e$.InputItemUtils.createToolCallItem(
              eu.tool_call_name ?? "unknown",
              {},
              { skipRun: !0 },
            );
          (ec.push(
            e$.InputItemUtils.createToolCallResultItem(
              eu.output ?? eu.content ?? "",
              eA,
              { skipRun: !0 },
            ),
          ),
            (el = void 0));
          break;
        }
        default:
          throw Error(`Unknown role "${eu.role}" in inject history message`);
      }
    return ec;
  }
  // UTF-16 6829625..6830047
  async function buildWorkspaceInfoParams(): Promise<any> {
    let eA: any = eu.ContainerUtil.get(e1.CwdService),
      el: any = { isGitWorkspace: e$.GitUtils.isGitRepository(eA.getCwd()) },
      ec: any = !1;
    try {
      let eA: any = eu.ContainerUtil.get(ej.SettingsManager),
        el: any = (await eA.list()).sandbox;
      ec = !!(el?.versionControl || el?.deleteProtection);
    } catch (eA: any) {}
    if (!ec) return el;
    try {
      el.isProjectionActive = eu.ContainerUtil.get(
        e0.SandboxCLILifecycle,
      ).isProjectionActive();
    } catch (eA: any) {}
    return el;
  }
  // UTF-16 6830047..6830387
  async function sendWorkspaceInfoNotification(
    eA?: any,
    el?: any,
    ec?: any,
  ): Promise<any> {
    let eu: any = await buildWorkspaceInfoParams();
    (await eA.extNotification(ep.ExtensionMethod.COMMAND, {
      sessionId: el,
      action: "workspace_info",
      params: eu,
    }),
      ec?.info?.(
        `[ACP Agent] workspace_info sent: sessionId=${el} isGitWorkspace=${eu.isGitWorkspace} isProjectionActive=${eu.isProjectionActive}`,
      ));
  }
  // UTF-16 6830771..6830940
  let e2: any = new Set([
      "security-center-setting-disabled",
      "session-local-environment-selected",
      "background-automation-no-approval-ui",
    ]),
    e3: any = "codebuddy.ai/sandboxDisabledReason";
  // UTF-16 6830940..6831015
  function isSandboxDisabledReason(eA?: any): any {
    return "string" == typeof eA && e2.has(eA);
  }
  // UTF-16 6831015..6831104
  function normalizeSandboxDisabledReason(eA?: any): any {
    return isSandboxDisabledReason(eA) ? eA : void 0;
  }
  // UTF-16 6831104..6831393
  function mapFinishReasonToStopReason(eA?: any): any {
    if (eA)
      switch (eA) {
        case "content_filter":
        case "refusal":
          return "refusal";
        case "length":
        case "max_tokens":
          return "max_tokens";
        case "stop":
        case "end_turn":
        case "stop_sequence":
        case "tool_calls":
        case "tool_use":
        case "function_call":
          return "end_turn";
        default:
          return;
      }
  }
  // UTF-16 6831393..6831489
  let e4: any = {
    NetworkError: -32001,
    InternalError: -32002,
    QuotaExceeded: -32003,
    ModelServiceError: -32004,
  };
  // UTF-16 6831489..6831563
  function isRecord(eA?: any): any {
    return !!eA && "object" == typeof eA && !Array.isArray(eA);
  }
  // UTF-16 6831563..6831665
  function createAuthRequiredError(eA?: any): any {
    return ez.RequestError.authRequired({ ...(eA ?? {}), category: "auth" });
  }
  // UTF-16 6831665..6831708
  let e8: any = new Set([11140, 11141, 11142]),
    e5: any = 5e3;
  // UTF-16 6831708..6831968
  function isAuthRequiredLikeError(
    eA?: any,
    el?: any,
    ec?: any,
    eu?: any,
  ): any {
    return (
      !(
        el?.category === "custom_model_auth" ||
        (403 === ec && void 0 !== eu && e8.has(eu))
      ) &&
      (eA instanceof eM.AuthenticationRequiredError ||
        eA instanceof eM.AuthenticationFailedError ||
        el?.category === "auth" ||
        401 === ec ||
        403 === ec)
    );
  }
  // UTF-16 6831968..6832312
  function extractStructuredErrorData(eA?: any): any {
    if (isRecord(eA)) {
      if (isRecord(eA.data) && Object.keys(eA.data).length > 0) return eA.data;
      if (isRecord(eA.error)) {
        let el: any = eA.error;
        if (isRecord(el.data) && Object.keys(el.data).length > 0)
          return el.data;
      }
      if (isRecord(eA.response)) {
        let el: any = eA.response;
        if (isRecord(el.data) && Object.keys(el.data).length > 0)
          return el.data;
      }
    }
  }
  // UTF-16 6832312..6832493
  function isCancelledMessage(eA?: any): any {
    if (!eA) return !1;
    let el: any = eA.toLowerCase();
    return (
      "canceled" === el ||
      "cancelled" === el ||
      "the operation was aborted" === el ||
      "this operation was aborted" === el
    );
  }
  // UTF-16 6832493..6834126
  function classifyErrorAsRequestError(eA?: any): any {
    let el: any = eA?.status ?? eA?.response?.status,
      ec: any = e$.ErrorUtils.extractBizCode(eA),
      eu: any = e$.ErrorUtils.getErrorMessage(eA),
      ed: any = eu
        ? eu.replace(
            /Tool (.+?) not found in agent [^\s.]+\.?/g,
            'Tool "$1" does not exist in the current tool set.',
          )
        : eu,
      ep: any = extractStructuredErrorData(eA);
    if (eA instanceof ez.RequestError)
      return -32e3 === eA.code ? createAuthRequiredError(ep) : eA;
    let eg: any = ep?.code,
      eh: any = "number" == typeof eg && eg >= 1e3 ? eg : ec,
      ef: any = { ...(ep ?? {}), details: ed, statusCode: el, code: eh };
    if (isAuthRequiredLikeError(eA, ep, el, ec))
      return createAuthRequiredError(ef);
    if (
      e$.ErrorUtils.isQuotaExhaustedError(eA) ||
      e$.ErrorUtils.isModelOverloadedError(eA)
    )
      return new ez.RequestError(e4.QuotaExceeded, `Quota exceeded: ${ed}`, {
        ...ef,
        category: "quota",
      });
    let em: any =
      "number" == typeof el &&
      (408 === el || 502 === el || 503 === el || 504 === el);
    if (
      e$.ErrorUtils.isStreamTimeoutError(eA) ||
      e$.ErrorUtils.isNetworkError(eA) ||
      em
    )
      return e$.ErrorUtils.isEmptyStreamError(eA)
        ? new ez.RequestError(
            e4.NetworkError,
            `Upstream gateway returned empty stream (only placeholder chunks, no model output). The model service may be temporarily unavailable. Details: ${ed}`,
            { ...ef, category: "network" },
          )
        : new ez.RequestError(e4.NetworkError, `Network error: ${ed}`, {
            ...ef,
            category: "network",
          });
    if (e$.ErrorUtils.isRetryableModelError(eA))
      return new ez.RequestError(
        e4.ModelServiceError,
        `Model service error: ${ed}`,
        { ...ef, category: "model_service" },
      );
    if (ep?.category === "cancelled" || isCancelledMessage(ed))
      return new ez.RequestError(e4.InternalError, "Request cancelled", {
        ...ef,
        category: "cancelled",
      });
    let eE: any = ef.category ?? "internal";
    return ez.RequestError.internalError({ ...ef, category: eE });
  }
  // UTF-16 6834126..6834498
  function buildDeniedToolCallCancelledUpdate(eA?: any, el?: any): any {
    let ec: any = Date.now();
    return (0, eW.withAcpTimestampMeta)(
      {
        sessionId: eA,
        update: (0, eW.withAcpTimestampMeta)(
          {
            sessionUpdate: "tool_call_update",
            toolCallId: el,
            status: "cancelled",
            content: [
              {
                type: "content",
                content: { type: "text", text: "Permission denied by user." },
              },
            ],
            _meta: { "codebuddy.ai/toolCancelReason": "permission_denied" },
          },
          ec,
        ),
      },
      ec,
    );
  }
  // UTF-16 6834498..6834679
  function dedupeDenialToolCallIds(eA?: any): any {
    let el: any = new Set(),
      ec: any = [];
    for (let eu of eA) {
      let eA: any = eu.tool_use_id;
      "string" != typeof eA ||
        0 === eA.length ||
        el.has(eA) ||
        (el.add(eA), ec.push(eA));
    }
    return ec;
  }
  // UTF-16 6834679..6834791
  let e6: any = new Set([
    "plugin-change",
    "marketplace-add",
    "marketplace-refresh",
    "builtin-marketplace-periodic-update",
  ]);
  // UTF-16 6834791..6835136
  function buildPendingToolCallFailedUpdate(
    eA?: any,
    el?: any,
    ec?: any,
    eu: any = "tool_not_found",
  ): any {
    let ed: any = Date.now();
    return (0, eW.withAcpTimestampMeta)(
      {
        sessionId: eA,
        update: (0, eW.withAcpTimestampMeta)(
          {
            sessionUpdate: "tool_call_update",
            toolCallId: el,
            status: "failed",
            content: [{ type: "content", content: { type: "text", text: ec } }],
            _meta: { "codebuddy.ai/toolFailReason": eu },
          },
          ed,
        ),
      },
      ed,
    );
  }
  // UTF-16 6835136..6912796
  let e9: any = Symbol("mcpUiModelContext"),
    e7: any = class {
      [key: string]: any;
      constructor() {
        ((this.toolCallSentDeferreds = new Map()),
          (this.handledApprovals = new WeakSet()),
          (this.promptEvent = new eC.Subject()),
          (this.modelChangeEvent = new eC.Subject()),
          (this.modeChangeEvent = new eC.Subject()),
          (this.displayModeEvent = new eC.Subject()),
          (this.configChangeEvent = new eC.Subject()),
          (this.cancelEvent = new eC.Subject()),
          (this.pendingCancellations = new Set()),
          (this.pendingEarlyAskSkipToolCallIds = new Set()),
          (this.handledAskToolCallIds = new Set()),
          (this.activeForwardingCleanups = new Map()));
      }
      consumePendingCancellation(eA?: any): any {
        let el: any = this.pendingCancellations.has(eA);
        return (el && this.pendingCancellations.delete(eA), el);
      }
      getScopedToolCallId(eA?: any, el?: any): any {
        return `${eA}\0${el}`;
      }
      addPendingEarlyAskSkipToolCallId(eA?: any, el?: any): any {
        this.pendingEarlyAskSkipToolCallIds.add(
          this.getScopedToolCallId(eA, el),
        );
      }
      consumePendingEarlyAskSkipToolCallId(eA?: any, el?: any): any {
        let ec: any = this.getScopedToolCallId(eA, el),
          eu: any = this.pendingEarlyAskSkipToolCallIds.has(ec);
        return (eu && this.pendingEarlyAskSkipToolCallIds.delete(ec), eu);
      }
      clearPendingEarlyAskSkipsForSession(eA?: any): any {
        let el: any = `${eA}\0`;
        for (let eA of this.pendingEarlyAskSkipToolCallIds)
          eA.startsWith(el) && this.pendingEarlyAskSkipToolCallIds.delete(eA);
      }
      markAskToolCallHandled(eA?: any, el?: any): any {
        let ec: any = this.getScopedToolCallId(eA, el);
        for (
          this.handledAskToolCallIds.delete(ec),
            this.handledAskToolCallIds.add(ec);
          this.handledAskToolCallIds.size > 512;

        ) {
          let eA: any = this.handledAskToolCallIds.values().next().value;
          if ("string" != typeof eA) break;
          this.handledAskToolCallIds.delete(eA);
        }
      }
      hasHandledAskToolCall(eA?: any, el?: any): any {
        return this.handledAskToolCallIds.has(this.getScopedToolCallId(eA, el));
      }
      getAskSkipAnswer(eA?: any): any {
        return {
          _action:
            eA.permissionModeSubject.value === ej.PermissionMode.Plan
              ? "skip_interview"
              : "skip_question",
        };
      }
      createAbortError(eA: any = "aborted"): any {
        let el: any = Error(eA);
        return ((el.name = "AbortError"), el);
      }
      createSessionUpdateTimeoutError(eA?: any): any {
        let el: any = Error(
          `ACP sessionUpdate timed out after ${e5}ms for session ${eA}`,
        );
        return ((el.name = "AcpSessionUpdateTimeoutError"), el);
      }
      isAbortError(eA?: any): any {
        return eA instanceof Error && "AbortError" === eA.name;
      }
      isSessionUpdateTimeoutError(eA?: any): any {
        return (
          eA instanceof Error && "AcpSessionUpdateTimeoutError" === eA.name
        );
      }
      async sendPromptSessionUpdate(
        eA?: any,
        el?: any,
        ec?: any,
      ): Promise<any> {
        let eu: any, ed: any;
        if (ec?.aborted) return !1;
        let ep: any = new Promise((eA?: any, ec?: any) => {
            "function" ==
              typeof (eu = setTimeout(
                () => ec(this.createSessionUpdateTimeoutError(el)),
                e5,
              )).unref && eu.unref();
          }),
          eg: any = ec
            ? new Promise((eA?: any, el?: any) => {
                ((ed = () => el(this.createAbortError())),
                  ec.aborted
                    ? ed()
                    : ec.addEventListener("abort", ed, { once: !0 }));
              })
            : void 0,
          eh: any = this.connection.sessionUpdate(eA);
        try {
          return (await Promise.race(eg ? [eh, ep, eg] : [eh, ep]), !0);
        } catch (eA: any) {
          if (ec?.aborted || this.isAbortError(eA)) return !1;
          if (this.isSessionUpdateTimeoutError(eA))
            return (
              this.logger.warn?.(
                `[ACP Agent] Dropping sessionUpdate after timeout for session ${el}`,
              ),
              !1
            );
          throw eA;
        } finally {
          (eu && clearTimeout(eu),
            ec && ed && ec.removeEventListener("abort", ed));
        }
      }
      setConnection(eA?: any, el?: any): any {
        ((this.connection = eA),
          (this.connectionId = el),
          eu.ContainerUtil.get(ez.AcpToolInterceptor).setConnection(eA),
          eu.ContainerUtil.get(ez.DelegateToolManager).setConnection(eA),
          this.setupUrlSubjectSubscription());
      }
      getConnectionId(): any {
        return this.connectionId;
      }
      getConnection(): any {
        return this.connection;
      }
      getSessionRequest(): any {
        return this.sessionRequest;
      }
      getClientCapabilities(): any {
        return this.clientCapabilities;
      }
      getCurrentSessionId(): any {
        return this.currentSessionId;
      }
      listPendingToolCallIds(eA?: any): any {
        return this.currentSessionId !== eA
          ? []
          : Array.from(this.toolCallSentDeferreds.keys());
      }
      notifyToolCallSent(eA?: any): any {
        if (!eA) return;
        this.toolCallSentDeferreds.has(eA) ||
          this.toolCallSentDeferreds.set(eA, new eu.Deferred());
        let el: any = this.toolCallSentDeferreds.get(eA);
        el && el.resolve();
      }
      setSession(eA?: any): any {
        this.logger.info?.(
          `[ACP Agent] setSession called for session ${eA.id}`,
        );
        let el: any = this.currentSessionId;
        if (el && el !== eA.id)
          try {
            this.usagePublisher.unregister(el);
          } catch (eA: any) {
            this.logger.debug?.(
              `[ACP Agent] usagePublisher.unregister(${el}) failed: ${eA?.message ?? eA}`,
            );
          }
        this.currentSessionId = eA.id;
        try {
          this.usagePublisher.register(eA, this.connection);
        } catch (el: any) {
          this.logger.warn?.(
            `[ACP Agent] usagePublisher.register failed for session ${eA.id}: ${el?.message ?? el}`,
          );
        }
        this.sessionDeferred && this.sessionDeferred.resolve(eA);
      }
      setupUrlSubjectSubscription(): any {
        (this.urlSubjectSubscription &&
          this.urlSubjectSubscription.unsubscribe(),
          (this.urlSubjectSubscription =
            this.externalUriOpener.urlSubject.subscribe((eA?: any) => {
              this.logger.info(
                `[AcpAgent] External URL opened, sending auth URL notification: ${eA}`,
              );
              try {
                this.connection.extNotification(ep.ExtensionMethod.AUTH_URL, {
                  authUrl: eA,
                  provider: "external",
                });
              } catch (eA: any) {
                this.logger.error(
                  `[AcpAgent] Failed to send auth URL notification: ${eA}`,
                );
              }
            })));
      }
      get agentManager(): any {
        return eu.ContainerUtil.get(ey.AgentManager);
      }
      get sessionManager(): any {
        return eu.ContainerUtil.get(eU.SessionManager);
      }
      get interruptionService(): any {
        return eu.ContainerUtil.get(eU.InterruptionService);
      }
      get mcpManager(): any {
        return eu.ContainerUtil.get(eR.McpManager);
      }
      get authManager(): any {
        return eu.ContainerUtil.get(eg.AuthenticationManager);
      }
      get logger(): any {
        return eu.ContainerUtil.get(eu.Logger);
      }
      get usagePublisher(): any {
        return eu.ContainerUtil.get(ez.AcpUsagePublisher);
      }
      get galileoTimingHook(): any {
        try {
          return eu.ContainerUtil.get(eQ.GalileoTimingHook);
        } catch {
          return;
        }
      }
      get metricsAggregator(): any {
        try {
          return eu.ContainerUtil.get(eQ.AgentMetricsAggregator);
        } catch {
          return;
        }
      }
      get sessionErrorTracker(): any {
        try {
          return eu.ContainerUtil.get(eD.SessionErrorTracker);
        } catch {
          return;
        }
      }
      get commandManager(): any {
        return eu.ContainerUtil.get(ev.CommandManager);
      }
      get contextCompactSummarizer(): any {
        return eu.ContainerUtil.get(eS.ContextCompactSummarizer);
      }
      get externalUriOpener(): any {
        return eu.ContainerUtil.get(ef.ExternalUriOpener);
      }
      get restOperationsFactory(): any {
        return eu.ContainerUtil.get(ed.RestOperationsFactory);
      }
      get endpointProvider(): any {
        return eu.ContainerUtil.get(eF.EndpointProvider);
      }
      get settingsManager(): any {
        return eu.ContainerUtil.get(ej.SettingsManager);
      }
      get cliSettingsProvider(): any {
        return eu.ContainerUtil.get(ej.CliSettingsProvider);
      }
      get askService(): any {
        return eu.ContainerUtil.get(e_.AskService);
      }
      get productManager(): any {
        return eu.ContainerUtil.get(eh.ProductManager);
      }
      get cliRuntimeOptions(): any {
        return eu.ContainerUtil.get(eI.CliRuntimeOptions);
      }
      async getModelsInfo(eA?: any): Promise<any> {
        let el: any;
        this.logger.info?.("[ACP Agent] getModelsInfo: START");
        let ec: any = await this.agentManager.getDefault();
        this.logger.info?.(
          `[ACP Agent] getModelsInfo: got defaultAgent=${ec.name}`,
        );
        let eu: any = await this.agentManager.getModels(ec.name);
        this.logger.info?.(
          `[ACP Agent] getModelsInfo: got ${eu.length} models`,
        );
        let ed: any = eA.requestOptions.model || eA.options.model;
        if (ed) el = ed;
        else {
          let eA: any = await this.agentManager.getModel(ec.name);
          el = eA?.id || "default";
        }
        this.logger.info?.(
          `[ACP Agent] getModelsInfo: sessionId=${eA.id}, currentModelId=${el}, reqOptModel=${eA.requestOptions.model ?? "<none>"}, optModel=${eA.options.model ?? "<none>"}`,
        );
        let ep: any = eu.map((eA?: any) => ({
          modelId: eA.id,
          name: eA.name || eA.id,
          description:
            [eA.description, eA.credits].filter(Boolean).join(" \xb7 ") || null,
          _meta: {
            supportsImages: eA.supportsImages ?? !1,
            supportsReasoning: eA.supportsReasoning ?? !1,
          },
        }));
        return (
          this.logger.info?.(
            `[ACP Agent] getModelsInfo: END, returning ${ep.length} models`,
          ),
          { availableModels: ep, currentModelId: el }
        );
      }
      async getCurrentModelLanguageConfig(eA?: any): Promise<any> {
        let el: any = eA.requestOptions.model || eA.options.model;
        if (!el) {
          let eA: any = await this.agentManager.getDefault(),
            ec: any = await this.agentManager.getModel(eA.name);
          el = ec?.id;
        }
        if (el)
          try {
            let eA: any = await this.productManager.waitConfiguration();
            return eA.models?.find((eA?: any) => eA.id === el);
          } catch (eA: any) {
            this.logger.warn?.(
              `[ACP Agent] getCurrentModelLanguageConfig failed: ${eA?.message ?? eA}`,
            );
            return;
          }
      }
      canDisableThinking(eA?: any): any {
        return (
          !eA || (!eA.onlyReasoning && eA.reasoning?.canDisableThinking !== !1)
        );
      }
      getModesInfo(eA?: any): any {
        return {
          availableModes: [
            {
              id: "default",
              name: "Always Ask",
              description: "Prompts for permission on first use of each tool",
            },
            {
              id: "acceptEdits",
              name: "Accept Edits",
              description:
                "Automatically accepts file edit permissions for the session",
            },
            {
              id: "plan",
              name: "Plan",
              description:
                "Claude can analyze but not modify files or execute commands",
            },
            {
              id: "auto",
              name: "Auto",
              description:
                "An AI classifier reviews actions that would normally prompt: safe ones are auto-approved, risky ones are denied. If the classifier is unavailable, the action falls back to a prompt (or is denied when prompts cannot be shown)",
            },
            {
              id: "dontAsk",
              name: "Don't Ask",
              description:
                "Never shows permission prompts; runs pre-approved and safe actions, denies anything that would require approval",
            },
            {
              id: "bypassPermissions",
              name: "Bypass Permissions",
              description: "Skips all permission prompts",
            },
          ],
          currentModeId: eA.permissionModeSubject.getValue() || "default",
        };
      }
      async getConfigOptions(eA?: any): Promise<any> {
        let el: any,
          ec: any = await this.settingsManager.get("alwaysThinkingEnabled"),
          eu: any = !1;
        try {
          let eA: any = await this.settingsManager.list();
          eu = !!eA.sandbox?.enabled;
        } catch (eA: any) {
          this.logger.warn?.(
            `[ACP Agent] Failed to read sandbox setting for getConfigOptions: ${eA?.message ?? eA}`,
          );
        }
        let ed: any = {
            type: "select",
            id: "mode",
            name: "Permission Mode",
            description:
              "Controls how the agent requests permission before making changes",
            category: "mode",
            currentValue: eA.permissionModeSubject.getValue() || "default",
            options: [
              {
                value: "default",
                name: "Always Ask",
                description: "Prompts for permission on first use of each tool",
              },
              {
                value: "acceptEdits",
                name: "Accept Edits",
                description:
                  "Automatically accepts file edit permissions for the session",
              },
              {
                value: "plan",
                name: "Plan",
                description:
                  "Agent can analyze but not modify files or execute commands",
              },
              {
                value: "auto",
                name: "Auto",
                description:
                  "An AI classifier reviews actions that would normally prompt: safe ones are auto-approved, risky ones are denied. If the classifier is unavailable, the action falls back to a prompt (or is denied when prompts cannot be shown)",
              },
              {
                value: "dontAsk",
                name: "Don't Ask",
                description:
                  "Does not show permission prompts; pre-approved and safe read-only actions run, everything else that would prompt is denied",
              },
              {
                value: "bypassPermissions",
                name: "Bypass Permissions",
                description: "Skips all permission prompts",
              },
              {
                value: "fullAccess",
                name: "Full Access",
                description:
                  "Skips ALL permission checks including dangerous commands for all agents",
              },
            ],
          },
          { availableModels: ep, currentModelId: eg } =
            await this.getModelsInfo(eA),
          eh: any = {
            type: "select",
            id: "model",
            name: "Model",
            description: "Select the AI model to use for this session",
            category: "model",
            currentValue: eg,
            options: ep.map((eA?: any) => ({
              value: eA.modelId,
              name: eA.name || eA.modelId,
              description: eA.description || void 0,
            })),
          },
          ef: any = this.sessionManager.getOverrideThinking(eA.id),
          em: any = ef?.thinkingEnabled ?? ec,
          eE: any = ef?.reasoningEffort,
          eC: any = await this.getCurrentModelLanguageConfig(eA),
          ey: any = this.canDisableThinking(eC),
          ew: any = eC?.reasoning?.supportedEfforts,
          eB: any = [
            {
              value: "minimal",
              name: "Minimal",
              description: "Briefest reasoning",
            },
            { value: "low", name: "Low", description: "Light reasoning" },
            {
              value: "medium",
              name: "Medium",
              description: "Balanced reasoning",
            },
            { value: "high", name: "High", description: "Deep reasoning" },
            {
              value: "xhigh",
              name: "X-High",
              description: "Very deep reasoning",
            },
            {
              value: "max",
              name: "Max",
              description: "Maximum reasoning effort",
            },
          ],
          e_: any =
            ew && ew.length > 0
              ? eB.filter((eA?: any) => ew.includes(eA.value))
              : eB;
        return [
          ed,
          eh,
          {
            type: "select",
            id: "thought_level",
            name: "Deep Thinking",
            description: "Choose reasoning effort level for this session",
            category: "thought_level",
            currentValue: (el =
              !1 === em && ey ? "disabled" : !1 !== em && eE ? eE : "enabled"),
            options: [
              ...(ey
                ? [
                    {
                      value: "disabled",
                      name: "Off",
                      description:
                        "Standard response without extended thinking",
                    },
                  ]
                : []),
              ...e_,
              {
                value: "enabled",
                name: "On (default)",
                description: "Use the model default effort",
              },
            ],
          },
          {
            type: "select",
            id: "sandbox",
            name: "Sandbox",
            description:
              "Run shell commands inside the sandbox-cli isolation layer",
            category: "sandbox",
            currentValue: eu ? "true" : "false",
            options: [
              {
                value: "true",
                name: "Sandbox Environment",
                description:
                  "Bash/PowerShell commands run inside the sandbox and require escalation to touch the host",
              },
              {
                value: "false",
                name: "Local Environment",
                description:
                  "Commands run with full user permissions (no sandbox isolation)",
              },
            ],
          },
        ];
      }
      async sendAvailableCommandsUpdate(eA?: any): Promise<any> {
        try {
          let el: any = [
              "/exit",
              "/help",
              "/config",
              "/sandbox",
              "/ide",
              "/hooks",
              "/theme",
              "/rename",
              "/agents",
              "/model",
              "/model:text-to-image",
              "/model:image-to-image",
              "/resume",
              "/mcp",
              "/permissions",
              "/tasks",
              "/plugin",
              "/output-style",
              "/stats",
              "/rewind",
              "/export",
              "/status",
              "/bash",
              "/memory",
              "/add-dir",
              "/terminal-setup",
              "/vim",
              "/upgrade",
              "/install-github-app",
              "/migrate-installer",
            ],
            ec: any = (await this.commandManager.getAll())
              .filter((eA?: any) => !el.includes(eA.name))
              .map((eA?: any) => {
                let el: any = {
                  name: eA.name.startsWith("/")
                    ? eA.name.substring(1)
                    : eA.name,
                  description: eA.description || "",
                };
                return (
                  eA.argumentHint && (el.input = { hint: eA.argumentHint }),
                  el
                );
              });
          try {
            for (let eA of (await this.productManager.waitConfiguration())
              .skills || [])
              !1 !== eA.userInvocable &&
                ec.push({
                  name: eA.name,
                  description: eA.description || "",
                  _meta: { type: "skill", source: eA.source },
                });
          } catch (eA: any) {
            this.logger.warn?.(
              `Failed to load skills for available commands: ${eA.message}`,
            );
          }
          await this.connection.sessionUpdate(
            (0, eW.withAcpTimestampMeta)({
              sessionId: eA,
              update: {
                sessionUpdate: "available_commands_update",
                availableCommands: ec,
              },
            }),
          );
        } catch (eA: any) {
          this.logger.error(
            `Failed to send available commands update: ${eA.message}`,
          );
        }
      }
      async sendWorkspaceInfo(eA?: any): Promise<any> {
        try {
          await sendWorkspaceInfoNotification(this.connection, eA, this.logger);
        } catch (el: any) {
          this.logger.warn?.(
            `[ACP Agent] sendWorkspaceInfo failed sessionId=${eA}: ${el?.message ?? el}`,
          );
        }
      }
      async initialize(eA?: any): Promise<any> {
        (this.logger.info?.("[ACP Agent] initialize() called"),
          (this.clientCapabilities = eA.clientCapabilities),
          eu.ContainerUtil.get(ez.AcpToolInterceptor).setCapabilities(
            eA.clientCapabilities,
          ));
        let el: any = eu.ContainerUtil.get(eL.HostCapabilityProvider),
          ec: any = eA.clientCapabilities?._meta?.["codebuddy.ai"],
          ed: any = !!eA.clientCapabilities?.elicitation?.form,
          ep: any = ec?.weixinpay?.interception === !0;
        (ed && el.markElicitationForm(),
          ep && el.markWeixinpayInterception(),
          eu.ContainerUtil.get(eN.ReferenceService).setFileReferencesPathOnly(
            ec?.fileReferencesPathOnly === !0,
          ));
        let eg: any = [
            { id: "iOA", name: "Login with iOA", description: null },
            {
              id: "external",
              name: "Login with Google/Github",
              description: null,
            },
            { id: "internal", name: "Login with WeChat", description: null },
            {
              id: "selfhosted",
              name: "Login with Enterprise Domain",
              description: null,
            },
          ],
          eh: any = {
            protocolVersion: ez.PROTOCOL_VERSION,
            agentCapabilities: {
              promptCapabilities: { image: !0, embeddedContext: !0 },
              mcpCapabilities: { http: !0, sse: !0 },
              loadSession: !0,
              delegateToolsSupport: !0,
            },
            authMethods: eg,
          };
        return (
          this.logger.info?.("[ACP Agent] initialize() returning response"),
          eh
        );
      }
      async authenticate(eA?: any): Promise<any> {
        let el: any = (
          {
            external: "external",
            internal: "internal",
            iOA: "iOA",
            selfhosted: "selfhosted",
          } as any
        )[eA.methodId];
        if (!el)
          throw Error(`Unsupported authentication method: ${eA.methodId}`);
        try {
          (await this.authManager.initialized,
            this.authManager.currentSessionSubject.getValue() &&
              (this.logger.info(
                "User already logged in, logging out first to force re-authentication...",
              ),
              await this.authManager.logout()),
            await this.authManager.login({ type: el }));
          let eA: any = await this.authManager.waitAuthSession();
          if (!eA) throw createAuthRequiredError();
          return {
            _meta: {
              "codebuddy.ai/userinfo": {
                userId: eA.account.uid,
                userName: eA.account.nickname,
                userNickname: eA.account.nickname,
                enterpriseId: eA.account.enterpriseId,
                enterpriseName: eA.account.enterpriseName,
                enterprise: eA.account.departmentFullName,
                authType: eA.account.type ?? "local",
              },
            },
          };
        } catch (eA: any) {
          throw (
            this.logger.error(`Authentication failed: ${eA.message}`),
            createAuthRequiredError()
          );
        }
      }
      async getUserInfo(): Promise<any> {
        await this.authManager.initialized;
        let eA: any = this.authManager.currentSessionSubject.getValue();
        if (!eA) return { userInfo: void 0 };
        let el: any = "local";
        return (
          eA.account?.type && (el = eA.account.type),
          {
            userInfo: {
              userId: eA.account?.uid ?? "",
              userName: eA.account?.nickname ?? "",
              userNickname: eA.account?.nickname ?? "",
              enterpriseId: eA.account?.enterpriseId,
              enterpriseName: eA.account?.enterpriseName,
              enterprise: eA.account?.departmentFullName,
              authType: el,
              token: eA.auth?.accessToken,
              accessToken: eA.auth?.accessToken,
            },
          }
        );
      }
      async getRuntimeSession(eA?: any): Promise<any> {
        try {
          let el: any = this.sessionManager.getCurrent();
          if (el?.id === eA) return el;
        } catch (eA: any) {
          this.logger.debug?.(
            `[ACP Agent] getRuntimeSession: getCurrent() failed, falling back: ${eA?.message}`,
          );
        }
        let el: any = this.sessionManager.sessionSubject?.value;
        return el?.id === eA ? el : this.sessionManager.get(eA);
      }
      async applyRuntimeSessionModel(
        eA?: any,
        el?: any,
        ec?: any,
      ): Promise<any> {
        let ed: any = await this.getRuntimeSession(eA);
        if (!ed) throw Error(`Session not found: ${eA}`);
        let ep: any = ed.requestOptions.model || ed.options.model;
        ((ed.requestOptions.model = el),
          (ed.options.model = el),
          this.sessionManager.setOverrideModel(ed.id, el));
        try {
          eu.ContainerUtil.get(ej.CliSettingsProvider)
            .set("model", el)
            .catch((eA?: any) => {
              this.logger.warn?.(
                `[ACP Agent] ${ec}: failed to sync CLI model setting: ${eA?.message ?? eA}`,
              );
            });
        } catch (eA: any) {
          this.logger.warn?.(
            `[ACP Agent] ${ec}: failed to access CLI settings provider: ${eA?.message ?? eA}`,
          );
        }
        (await this.reconcileThinkingOverrideAfterModelChange(ed, ec),
          this.logger.info?.(
            `[ACP Agent] ${ec}: applied model to runtime session ${eA}: ${ep || "default"} -> ${el}`,
          ));
      }
      async reconcileThinkingOverrideAfterModelChange(
        eA?: any,
        el?: any,
      ): Promise<any> {
        let ec: any = await this.getCurrentModelLanguageConfig(eA);
        if (this.canDisableThinking(ec)) return;
        let eu: any = this.sessionManager.getOverrideThinking(eA.id);
        eu?.thinkingEnabled === !1 &&
          (this.sessionManager.setOverrideThinking(eA.id, {
            thinkingEnabled: !0,
            reasoningEffort:
              ec?.reasoning?.defaultEffort ?? ec?.reasoning?.effort,
          }),
          this.logger.info?.(
            `[ACP Agent] ${el}: reset disabled thinking override for non-disableable model ${ec?.id ?? "unknown"}`,
          ));
      }
      async initializeSession(eA?: any): Promise<any> {
        let el: any;
        if (
          (await this.authManager.initialized,
          !this.authManager.currentSessionSubject.getValue())
        )
          throw createAuthRequiredError();
        (this.logger.info?.(
          `[ACP Agent] initializeSession: type=${eA.type}, sessionId=${eA.sessionId || "new"}`,
        ),
          (this.sessionRequest = {
            type: eA.type,
            ...(eA.sessionId && { sessionId: eA.sessionId }),
          }),
          (this.sessionDeferred = new eu.Deferred()),
          eA.mcpServers &&
            eA.mcpServers.length > 0 &&
            (el = JSON.stringify({
              mcpServers: eY.AcpUtils.convertAcpMcpServersToDynamic(
                eA.mcpServers,
              ),
            })));
        let ec: any = this.restOperationsFactory.create(),
          ep: any = await this.endpointProvider.get(),
          eg: any = `${ep}/internal/agent`;
        this.logger.info?.(
          `[ACP Agent] initializeSession: sending request to ${eg}`,
        );
        let eh: any = this.cliRuntimeOptions.get(),
          ef: any = el ?? eh.mcpConfig,
          em: any = !0 === eh.strictMcpConfig;
        ec.post(
          eg,
          {
            ...eh,
            interactive: !1,
            acp: !0,
            mcpConfig: ef,
            strictMcpConfig: em,
            ...(eA.continue && { continue: !0 }),
            ...(eA.sessionId && { sessionId: eA.sessionId }),
          },
          {
            headers: (0, eP.withSecurityHeader)({
              [ed.HttpHeaders.CONTENT_TYPE]: ed.MediaType.APPLICATION_JSON_UTF8,
              "acp-connection-id": this.connectionId || "",
            }),
            proxy: !1,
          },
        ).catch((eA?: any) => {
          (this.logger.error?.(
            `[ACP Agent] initializeSession: request failed: ${eA.message}`,
          ),
            this.sessionDeferred && this.sessionDeferred.reject(eA));
        });
        let eE: any = await this.sessionDeferred.promise;
        this.logger.info?.(
          `[ACP Agent] initializeSession: session received: ${eE.id}`,
        );
        let eC: any = await this.getModelsInfo(eE),
          ey: any = this.getModesInfo(eE),
          ew: any = await this.getConfigOptions(eE);
        return (
          (this.sessionRequest = void 0),
          { session: eE, modelsInfo: eC, modesInfo: ey, configOptions: ew }
        );
      }
      async refreshProductAndTools(eA?: any): Promise<any> {
        try {
          let el: any =
            "builtin-plugin-seed" === eA ? "builtin-seed" : "acp-host-refresh";
          (await eu.ContainerUtil.get(eO.PluginRuntimeRefreshService).refresh(
            el,
          ),
            this.logger.info?.(
              `[ACP Agent] refreshProductAndTools done (${eA})`,
            ));
        } catch (el: any) {
          throw (
            this.logger.warn?.(
              `[ACP Agent] refreshProductAndTools failed (${eA}): ${el}`,
            ),
            el
          );
        }
      }
      async newSession(eA?: any): Promise<any> {
        let el: any = !!eA._meta?.["codebuddy.ai/continue"];
        this.logger.info?.(`[ACP Agent] newSession() called, continue=${el}`);
        let {
          session: ec,
          modelsInfo: eu,
          modesInfo: ed,
          configOptions: ep,
        } = await this.initializeSession({
          type: "new",
          mcpServers: eA.mcpServers,
          continue: el,
        });
        (ec.history.length > 0 && (await this.replayHistory(ec)),
          await this.sendAvailableCommandsUpdate(ec.id),
          setTimeout(() => this.sendAvailableCommandsUpdate(ec.id), 0),
          this.sendWorkspaceInfo(ec.id).catch(() => {}));
        let eg: any = {
          sessionId: ec.id,
          models: eu,
          modes: ed,
          configOptions: ep,
        };
        return (
          this.logger.info?.(
            `[ACP Agent] newSession() returning response: sessionId=${eg.sessionId}`,
          ),
          0 === ec.history.length &&
            (await this.usagePublisher.publish(ec.id, "new_session")),
          eg
        );
      }
      async loadSession(eA?: any): Promise<any> {
        this.logger.info?.(
          `[ACP Agent] loadSession() called, sessionId=${eA.sessionId}`,
        );
        let {
          session: el,
          modelsInfo: ec,
          modesInfo: eu,
          configOptions: ed,
        } = await this.initializeSession({
          type: "load",
          sessionId: eA.sessionId,
          mcpServers: eA.mcpServers,
        });
        (el.history.length > 0 && (await this.replayHistory(el)),
          await this.sendAvailableCommandsUpdate(el.id),
          setTimeout(() => this.sendAvailableCommandsUpdate(el.id), 0),
          this.sendWorkspaceInfo(el.id).catch(() => {}));
        let ep: any = { models: ec, modes: eu, configOptions: ed };
        return (
          this.logger.info?.("[ACP Agent] loadSession() returning response"),
          0 === el.history.length &&
            (await this.usagePublisher.publish(el.id, "load_session")),
          ep
        );
      }
      async resumeSession(eA?: any): Promise<any> {
        return this.unstable_resumeSession(eA);
      }
      async unstable_resumeSession(eA?: any): Promise<any> {
        this.logger.info?.(
          `[ACP Agent] unstable_resumeSession() called, sessionId=${eA.sessionId}`,
        );
        let {
          session: el,
          modelsInfo: ec,
          modesInfo: eu,
          configOptions: ed,
        } = await this.initializeSession({
          type: "resume",
          sessionId: eA.sessionId,
          mcpServers: eA.mcpServers,
        });
        (await this.sendAvailableCommandsUpdate(el.id),
          setTimeout(() => this.sendAvailableCommandsUpdate(el.id), 0),
          this.sendWorkspaceInfo(el.id).catch(() => {}));
        let ep: any = { models: ec, modes: eu, configOptions: ed };
        return (
          this.logger.info?.(
            "[ACP Agent] unstable_resumeSession() returning response",
          ),
          await this.usagePublisher.publish(el.id, "resume_session"),
          ep
        );
      }
      async replayHistory(eA?: any): Promise<any> {
        let el: any = await (0, eX.collectSessionReplayEvents)(
          eA,
          this.logger,
          {
            showPreCompactHistory: (0, eX.isReplayShowPreCompactEnabled)(),
            mcpUiResourceReader: async (eA?: any, el?: any) => {
              let ec: any = await this.findMcpServer(eA);
              return ec ? ec.readResource({ uri: el }) : [];
            },
          },
        );
        (await (0, eX.emitSessionReplayEvents)(this.connection, el),
          this.logger.info?.("[ACP Agent] replayHistory: complete"));
      }
      getCodebuddyExpertId(eA?: any): any {
        let el: any = "string" == typeof eA?.expertId ? eA.expertId.trim() : "";
        if (el) return el;
        let ec: any = eA?.expert;
        if (ec && "object" == typeof ec && !Array.isArray(ec)) {
          let eA: any = ec.id;
          if ("string" == typeof eA && eA.trim()) return eA.trim();
        }
      }
      applyUpstreamMeta(eA?: any, el?: any): any {
        let ec: any =
            "string" == typeof el?.promptRequestId
              ? el.promptRequestId
              : void 0,
          eu: any = (0, eK.isValidW3CTraceId)(ec) ? ec : void 0;
        eu && (eA.promptRequestId = eu);
        let ed: any =
            "string" == typeof el?.traceparent ? el.traceparent : void 0,
          ep: any = (0, eK.parseW3CTraceparent)(ed);
        ep && ((eA.traceId = ep.traceId), (eA.upstreamTraceparent = ed));
        let eg: any = "string" == typeof el?.userId ? el.userId : void 0,
          eh: any =
            "string" == typeof el?.conversationId ? el.conversationId : void 0,
          ef: any =
            "string" == typeof el?.locale
              ? el.locale
              : "string" == typeof el?.language
                ? el.language
                : void 0,
          em: any = this.getCodebuddyExpertId(el);
        (eg || eh || ef || em) &&
          (eA.meta = {
            ...(eA.meta ?? {}),
            ...(eg ? { "codebuddy.ai/userId": eg } : {}),
            ...(eh ? { "codebuddy.ai/conversationId": eh } : {}),
            ...(ef ? { "codebuddy.ai/locale": ef } : {}),
            ...(em ? { "codebuddy.ai/expertId": em } : {}),
          });
        let eE: any =
          "number" == typeof el?.clientSendTime ? el.clientSendTime : void 0;
        (eE &&
          (eA.telemetry || (eA.telemetry = {}),
          (eA.telemetry.clientSendTime = eE)),
          eu
            ? this.logger.info?.(
                `[ACP Agent] adopt upstream promptRequestId=${eu} for session ${eA.id}`,
              )
            : ec &&
              this.logger.warn?.(
                `[ACP Agent] ignore invalid upstream promptRequestId=${ec} for session ${eA.id}`,
              ));
      }
      resolvePromptTracking(eA?: any, el?: any): any {
        let ec: any = eA._meta,
          eu: any = ec?.["codebuddy.ai"],
          ed: any =
            el.conversationRequestId ??
            ec?.["codebuddy.ai/requestId"] ??
            eu?.requestId ??
            (0, eE.randomUUID)(),
          ep: any =
            ec?.messageId ??
            ec?.["codebuddy.ai/userMessageId"] ??
            ec?.["codebuddy.ai/messageRequestId"] ??
            eu?.messageRequestId ??
            ed,
          eg: any = ec?.["codebuddy.ai/messageId"] ?? eu?.messageId;
        return {
          requestId: ed,
          messageId:
            "string" == typeof eg && eg.trim()
              ? eg.trim()
              : `${eA.sessionId}-${ep}`,
          messageRequestId: ep,
        };
      }
      async prompt(eA?: any): Promise<any> {
        this.logger.info?.(
          `[ACP Agent] prompt() called for session ${eA.sessionId}`,
        );
        let el: any = await this.getRuntimeSession(eA.sessionId);
        if (!el) throw Error(`Session not found: ${eA.sessionId}`);
        let ec: any = eA._meta,
          ed: any = ec?.["codebuddy.ai"],
          ep: any = this.getCodebuddyExpertId(ed),
          eg: any =
            "string" == typeof ed?.mode &&
            ["craft", "ask", "plan", "expert"].includes(ed.mode)
              ? ed.mode
              : void 0;
        if (
          (eg &&
            ((el.meta = { ...(el.meta ?? {}), "codebuddy.ai/mode": eg }),
            ep || delete el.meta["codebuddy.ai/expertId"]),
          (el.conversationRequestId = void 0),
          this.applyUpstreamMeta(el, ed),
          ed?.isAutomationBackground === !0 &&
            ((el.agentPurpose = ew.AgentPurpose.Automation),
            this.logger.info?.(
              `[ACP Agent] prompt() automation detected, set agentPurpose=${el.agentPurpose} for session ${el.id}`,
            )),
          ed?.isClearSession === !0)
        )
          return await this.handleClearSession(el, ed, ec);
        if (ed?.isCompactSession === !0)
          return await this.handleCompactSession(el);
        let eh: any = this.resolvePromptTracking(eA, el),
          ef: any = Date.now();
        (el.telemetry || (el.telemetry = {}),
          (el.telemetry.promptStartTime = ef),
          this.sessionErrorTracker?.reset(el.id));
        let em: any = new eu.Deferred();
        this.promptEvent.next({
          request: eA,
          responseDeferred: em,
          tracking: eh,
        });
        try {
          let eA: any = await em.promise;
          this.logger.info?.(
            `[ACP Agent] prompt() completed with stopReason: ${eA.stopReason}`,
          );
          try {
            let ec: any = Date.now() - ef;
            this.galileoTimingHook?.reportTaskTotal(ec, {
              taskId: eh.requestId,
              model: el.requestOptions?.model ?? "",
              agentName: el.agentName ?? "",
              agentPurpose: el.agentPurpose ?? "",
            });
            let eu: any = this.sessionErrorTracker?.snapshot(el.id) ?? {
                modelErrorCount: 0,
                modelSuccessAfterErrorCount: 0,
                toolErrorCount: 0,
              },
              ed: any = eA._meta?.["codebuddy.ai/errorMessage"],
              ep: any = (0, eT.resolveTaskOutcome)(eA.stopReason, ed, eu);
            (this.sessionErrorTracker?.cleanup(el.id),
              this.metricsAggregator?.recordTaskOutcome(ep, {
                model: el.requestOptions?.model ?? "",
                agentName: el.agentName ?? "",
                scene: el.meta?.["codebuddy.ai/mode"] ?? "",
                promptRequestId: el.promptRequestId ?? "",
                conversationRequestId: eh.requestId,
                traceId:
                  "string" == typeof eA._meta?.["codebuddy.ai/traceId"]
                    ? eA._meta["codebuddy.ai/traceId"]
                    : (el.traceId ?? ""),
                stopReason: eA.stopReason,
                errorCategory:
                  (0, eT.extractCategoryFromErrorMessage)(ed) ?? "",
                expertId: el.meta?.["codebuddy.ai/expertId"] ?? "",
              }),
              eA._meta || (eA._meta = {}));
            let eg: any = eA._meta;
            eg["codebuddy.ai/outcome"] || (eg["codebuddy.ai/outcome"] = ep);
          } catch {}
          return eA;
        } finally {
          await this.usagePublisher.publish(el.id, "prompt_end");
        }
      }
      async handleClearSession(eA?: any, el?: any, ec?: any): Promise<any> {
        let eu: any = el.clearMessageId ?? `session-separator-${Date.now()}`,
          ed: any = el.clearExtra,
          ep: any =
            ed && "object" == typeof ed ? ed : { isSessionSeparator: !0 },
          eg: any = (0, eW.resolveAcpTimestamp)(ec?.timestamp);
        this.logger.info?.(
          `[ACP Agent] handleClearSession: sessionId=${eA.id}, messageId=${eu}`,
        );
        try {
          let el: any = {
            id: eu,
            type: "message",
            role: "system",
            content: "",
            timestamp: eg,
            providerData: {
              skipRun: !0,
              isSessionSeparator: !0,
              separatorMessageId: eu,
              separatorExtra: ep,
            },
          };
          return (
            await this.sessionManager.addHistory(eA, [el]),
            this.connection &&
              (await this.connection.sessionUpdate(
                (0, eW.withAcpTimestampMeta)(
                  {
                    sessionId: eA.id,
                    update: { sessionUpdate: "session_info_update" },
                    _meta: {
                      "codebuddy.ai": {
                        isHistoryReplay: !1,
                        messageId: eu,
                        isSessionSeparator: !0,
                        separatorExtra: ep,
                      },
                    },
                  },
                  eg,
                ),
              )),
            this.logger.info?.(
              `[ACP Agent] handleClearSession: separator written & emitted, messageId=${eu}`,
            ),
            { stopReason: "end_turn" }
          );
        } catch (eA: any) {
          throw (
            this.logger.error?.("[ACP Agent] handleClearSession failed:", eA),
            eA
          );
        }
      }
      async handleCompactSession(eA?: any): Promise<any> {
        this.logger.info?.(
          `[ACP Agent] handleCompactSession: sessionId=${eA.id}`,
        );
        let el: any = Date.now();
        try {
          if (
            !(await this.contextCompactSummarizer.compactAndSummarize(eA, {
              force: !0,
              skipContinue: !0,
            }))
          )
            throw new ez.RequestError(
              e4.ModelServiceError,
              "上下文压缩失败，请稍后重试或新建会话减少历史上下文后再继续。",
              { category: "model_service", reason: "compact_failed" },
            );
          return (
            this.galileoTimingHook?.reportContextCompact(Date.now() - el, {
              compactType: "manual",
              model: eA.requestOptions?.model ?? "",
            }),
            this.logger.info?.(
              `[ACP Agent] handleCompactSession: completed, sessionId=${eA.id}`,
            ),
            { stopReason: "end_turn" }
          );
        } catch (eA: any) {
          throw (
            this.logger.error?.("[ACP Agent] handleCompactSession failed:", eA),
            eA
          );
        }
      }
      consumePreMessageCompactEnd(eA?: any): any {
        if (!eA.meta?.[eS.SESSION_META_PRE_MESSAGE_COMPACT_ENDED])
          return { ended: !1 };
        let el: any =
          eA.meta[eS.SESSION_META_PRE_MESSAGE_COMPACT_ERROR_MESSAGE];
        return (delete eA.meta[eS.SESSION_META_PRE_MESSAGE_COMPACT_ENDED],
        delete eA.meta[eS.SESSION_META_PRE_MESSAGE_COMPACT_ERROR_MESSAGE],
        "string" == typeof el)
          ? { ended: !0, errorMessage: el }
          : { ended: !0 };
      }
      serializePreMessageCompactFailure(eA?: any): any {
        return JSON.stringify(
          new ez.RequestError(e4.ModelServiceError, eA, {
            category: "model_service",
            details: eA,
            reason: "pre_message_compact_failed",
          }).toErrorResponse(),
        );
      }
      createEventForwardingPromise(eA?: any, el?: any, ec?: any): any {
        let ed: any,
          ep: any = this.activeForwardingCleanups.get(eA.id);
        (ep &&
          (this.logger.warn?.(
            `[ACP Agent] createEventForwardingPromise: replacing stale forwarding subscription for session ${eA.id}`,
          ),
          ep()),
          this.logger.info?.(
            `[ACP Agent] createEventForwardingPromise: subscribing to session ${eA.id}`,
          ));
        let eg: any = eA.resultSubject.getValue(),
          eh: any = eA.traceId,
          getPromptTraceId: any = () => (eA.traceId && (eh = eA.traceId), eh),
          ef: any = new Set(),
          getAcpUpdateMessageId: any = (eA?: any) => {
            let el: any = eA.messageId;
            if ("string" == typeof el && el.length > 0) return el;
            let ec: any = eA._meta;
            if (!ec || "object" != typeof ec || Array.isArray(ec)) return;
            let eu: any = ec["codebuddy.ai/messageId"];
            return "string" == typeof eu && eu.length > 0 ? eu : void 0;
          },
          hasStreamedAgentMessage: any = (eA?: any) => {
            let el: any = getAcpUpdateMessageId(eA);
            return !!(el && ef.has(el));
          },
          markStreamedAgentMessage: any = (eA?: any, el?: any) => {
            if ("agent_message_chunk" !== eA.sessionUpdate) return;
            let ec: any = getAcpUpdateMessageId(eA);
            (ec && ef.add(ec), el && ef.add(el));
          },
          injectTrackingMeta: any = (ec?: any, eu?: any, ep?: any) => {
            let eg: any = eA.conversationRequestId || el?.requestId,
              eh: any = el?.messageRequestId || eg,
              ef: any =
                "string" == typeof ec.sessionUpdate ? ec.sessionUpdate : void 0,
              em: any = getPromptTraceId(),
              eE: any = { ...(ec._meta || {}) },
              eC: any = !0 === eE["codebuddy.ai/isCompactInternal"],
              ey: any =
                "agent_message_chunk" === ef ||
                "agent_thought_chunk" === ef ||
                "tool_call" === ef ||
                "tool_call_update" === ef,
              ew: any = eC ? void 0 : el?.messageId,
              eB: any = ey ? (0, eS.withCompactGeneration)(ew, eA) : ew,
              e_: any = eB || ep || ed || eA.messageId,
              eI: any = ey && !!eB;
            (eg &&
              !eE["codebuddy.ai/requestId"] &&
              (eE["codebuddy.ai/requestId"] = eg),
              eA.promptRequestId &&
                !eE["codebuddy.ai/promptRequestId"] &&
                (eE["codebuddy.ai/promptRequestId"] = eA.promptRequestId),
              e_ && eI
                ? (eE["codebuddy.ai/messageId"] = e_)
                : e_ &&
                  !eE["codebuddy.ai/messageId"] &&
                  (eE["codebuddy.ai/messageId"] = e_),
              eh &&
                !eE["codebuddy.ai/messageRequestId"] &&
                (eE["codebuddy.ai/messageRequestId"] = eh),
              em &&
                !eE["codebuddy.ai/traceId"] &&
                (eE["codebuddy.ai/traceId"] = em),
              eA.upstreamTraceparent &&
                !eE["codebuddy.ai/traceparent"] &&
                (eE["codebuddy.ai/traceparent"] = eA.upstreamTraceparent));
            let ev: any = eA.requestOptions.model || eA.options.model;
            ev &&
              !eE["codebuddy.ai/requestModelId"] &&
              (eE["codebuddy.ai/requestModelId"] = ev);
            let eQ: any = eA.telemetry?.modelName;
            eQ &&
              !eE["codebuddy.ai/requestModelName"] &&
              (eE["codebuddy.ai/requestModelName"] = eQ);
            let eD: any = eA.meta?.responseModelId;
            eD &&
              !eE["codebuddy.ai/responseModelId"] &&
              (eE["codebuddy.ai/responseModelId"] = eD);
            let eT: any = { ...ec, _meta: eE };
            return (
              "user_message_chunk" === eT.sessionUpdate && eh && !eT.messageId
                ? (eT.messageId = eh)
                : eI && e_
                  ? (eT.messageId = e_)
                  : !eT.messageId &&
                    ("user_message_chunk" === eT.sessionUpdate && eh
                      ? (eT.messageId = eh)
                      : ("agent_message_chunk" === eT.sessionUpdate ||
                          "agent_thought_chunk" === eT.sessionUpdate) &&
                        e_ &&
                        (eT.messageId = e_)),
              (0, eW.withAcpTimestampMeta)(eT, eu)
            );
          };
        return new Promise((el?: any) => {
          let ep: any,
            eh: any,
            ef: any,
            eE: any = "end_turn",
            eC: any = new Map(),
            ew: any = new Map(),
            e_: any = new Map(),
            eI: any = !1,
            ev: any = [],
            allTeamMembersTerminal: any = () => {
              let eA: any = (0, eG.getTeamMemberRegistry)().getAll();
              return (
                0 === eA.length ||
                eA.every((eA?: any) => {
                  let el: any = eA.getAgentTask();
                  if (!el) return !0;
                  let ec: any = el.status;
                  return (
                    "completed" === ec ||
                    "failed" === ec ||
                    "cancelled" === ec ||
                    "killed" === ec
                  );
                })
              );
            },
            eQ: any = eu.ContainerUtil.get(eU.SessionRunStateMachine),
            isSessionIdle: any = () => eQ.isIdle(eA),
            hasTeamMembers: any = () =>
              (0, eG.getTeamMemberRegistry)().getAll().length > 0,
            shouldGuardSessionIdleForTeamResolve: any = () =>
              !!eA.meta?.isTeamLead || hasTeamMembers(),
            eD: any = null,
            eT: any = null,
            eR: any = eu.ContainerUtil.get(eB.AgentTaskManager),
            ek: any = [
              "task-completed",
              "task-failed",
              "task-cancelled",
              "task-killed",
            ],
            tryResolvePending: any = () => {
              if (!eD || !allTeamMembersTerminal() || eA.isCompressing) return;
              if (shouldGuardSessionIdleForTeamResolve() && !isSessionIdle())
                return void this.logger.info?.(
                  `[ACP Agent] Team all terminal but session not idle — deferring resolve for session ${eA.id}`,
                );
              this.pendingCancellations.has(eA.id) &&
                eT &&
                (this.logger.info?.(
                  `[ACP Agent] Team all terminal under user cancel — overriding stopReason to 'cancelled' for session ${eA.id} (was ${eT.stopReason})`,
                ),
                (eT.stopReason = "cancelled"),
                (eT.errorMessage = void 0),
                (eT.finishReason = void 0),
                (eT.traceId = void 0),
                this.consumePendingCancellation(eA.id),
                eA.meta?.userInitiatedAbort &&
                  delete eA.meta.userInitiatedAbort);
              let el: any = eD;
              ((eD = null),
                (eT = null),
                this.logger.info?.(
                  `[ACP Agent] Team all terminal + session idle — running pendingTeamResolve for session ${eA.id}`,
                ),
                el());
            },
            teamTerminalListener: any = () => {
              setTimeout(() => tryResolvePending(), 0);
            };
          for (let eA of ek) eR.on(eA, teamTerminalListener);
          ev.push(
            eQ.getChange$(eA, !0).subscribe(() => {
              eD && eQ.isIdle(eA) && setTimeout(() => tryResolvePending(), 0);
            }),
          );
          let cleanup: any = () => {
              if (!eI) {
                for (let eA of ((eI = !0), ev)) eA.unsubscribe();
                for (let el of (ec?.signal &&
                  ef &&
                  ec.signal.removeEventListener("abort", ef),
                this.activeForwardingCleanups.get(eA.id) === cleanup &&
                  this.activeForwardingCleanups.delete(eA.id),
                ek))
                  eR.off(el, teamTerminalListener);
                ((eD = null),
                  (eT = null),
                  eC.clear(),
                  ew.clear(),
                  e_.clear(),
                  this.clearPendingEarlyAskSkipsForSession(eA.id));
              }
            },
            resolveCancelledByAbort: any = () => {
              eI ||
                ((eE = "cancelled"),
                this.consumePendingCancellation(eA.id),
                eA.meta?.userInitiatedAbort &&
                  delete eA.meta.userInitiatedAbort,
                this.logger.info?.(
                  `[ACP Agent] Forwarding aborted for session ${eA.id}; resolving prompt as cancelled`,
                ),
                cleanup(),
                el({ stopReason: eE, traceId: getPromptTraceId() }));
            },
            resolveWhenTeamTerminal: any = (ec?: any) => {
              let run: any = () => {
                (cleanup(), el(ec));
              };
              if (
                allTeamMembersTerminal() &&
                (!shouldGuardSessionIdleForTeamResolve() || isSessionIdle())
              )
                return void run();
              let eu: any = [];
              (allTeamMembersTerminal() ||
                eu.push("team members not yet all terminal"),
                shouldGuardSessionIdleForTeamResolve() &&
                  !isSessionIdle() &&
                  eu.push("session not idle (auto-dispatch run in progress)"),
                this.logger.info?.(
                  `[ACP Agent] resolveWhenTeamTerminal: deferring resolve for session ${eA.id} — ${eu.join(", ")} (stopReason=${ec.stopReason})`,
                ),
                (eD = run),
                (eT = ec));
            };
          (ev.push(
            eA.interruptionSubject.subscribe(async (el?: any) => {
              el && (await this.handleToolApproval(el, eA.id));
            }),
          ),
            ev.push(
              eA.phaseSubject.subscribe((ed?: any) => {
                if (this.connection) {
                  let el: any = this.logger;
                  this.sendPromptSessionUpdate(
                    injectTrackingMeta({
                      sessionId: eA.id,
                      update: {
                        sessionUpdate: "session_info_update",
                        _meta: { "codebuddy.ai/agentPhase": ed },
                      },
                    }),
                    eA.id,
                    ec?.signal,
                  ).catch((eA?: any) => {
                    el.warn?.("[ACP Agent] Failed to send phase update:", eA);
                  });
                }
                if (
                  eu.ContainerUtil.get(eU.SessionRunStateMachine).isIdle(eA)
                ) {
                  let ec: any = this.consumePreMessageCompactEnd(eA);
                  if (!ec.ended) return;
                  (ec.errorMessage &&
                    ((eE = "refusal"),
                    (ep = this.serializePreMessageCompactFailure(
                      ec.errorMessage,
                    ))),
                    this.logger.info?.(
                      `[ACP Agent] Resolving prompt after pre-message compact ended without running the user prompt, stopReason=${eE}`,
                    ),
                    cleanup(),
                    el({
                      stopReason: eE,
                      errorMessage: ep,
                      finishReason: eh,
                      traceId: getPromptTraceId(),
                    }));
                }
              }),
            ),
            ev.push(
              eA.progressSubject.subscribe(async (el?: any) => {
                try {
                  (this.logger.info?.(
                    `[ACP Agent] Progress update: ${el ? JSON.stringify({ type: el }) : "null"}`,
                  ),
                    this.connection &&
                      (await this.sendPromptSessionUpdate(
                        injectTrackingMeta({
                          sessionId: eA.id,
                          update: {
                            sessionUpdate: "session_info_update",
                            _meta: {
                              "codebuddy.ai/progress": el ? { type: el } : null,
                            },
                          },
                        }),
                        eA.id,
                        ec?.signal,
                      )));
                } catch (eA: any) {
                  this.logger.warn?.(
                    "[ACP Agent] Failed to send progress update:",
                    eA,
                  );
                }
              }),
            ),
            ev.push(
              eA.combineSubject.subscribe(async (ef?: any) => {
                try {
                  if ("input" === ef.type) {
                    if (
                      "function_call" === ef.data.type ||
                      "function_call_result" === ef.data.type ||
                      "function_call_output" === ef.data.type
                    ) {
                      this.logger.info?.(
                        `[ACP Agent] Received input event type: ${ef.data.type}, callId: ${ef.data.callId}`,
                      );
                      let el: any = eu.ContainerUtil.get(
                          ez.AcpToolInterceptor,
                        ).getFileContentCache(),
                        ed: any = eY.AcpUtils.convertInputItemToAcp(
                          ef.data,
                          el,
                          { parentToolUseId: ef.parentToolUseId },
                        );
                      if (ed) {
                        let el: any = (0, eW.getAcpItemTimestamp)(ef.data);
                        if (
                          (this.logger.info?.(
                            `[ACP Agent] Converted to sessionUpdate: ${ed.sessionUpdate}, toolCallId: ${ed.toolCallId}`,
                          ),
                          "tool_call" === ed.sessionUpdate &&
                            ed.toolCallId &&
                            !this.toolCallSentDeferreds.has(ed.toolCallId) &&
                            this.toolCallSentDeferreds.set(
                              ed.toolCallId,
                              new eu.Deferred(),
                            ),
                          await this.sendPromptSessionUpdate(
                            {
                              sessionId: eA.id,
                              update: injectTrackingMeta(ed, el),
                            },
                            eA.id,
                            ec?.signal,
                          ),
                          "tool_call" === ed.sessionUpdate && ed.toolCallId)
                        ) {
                          let eA: any = this.toolCallSentDeferreds.get(
                            ed.toolCallId,
                          );
                          eA && eA.resolve();
                        }
                        "tool_call_update" === ed.sessionUpdate && ed.toolCallId
                          ? (this.logger.info?.(
                              `[ACP Agent] Cleaning up tool_call deferral for ${ed.toolCallId}`,
                            ),
                            this.toolCallSentDeferreds.delete(ed.toolCallId))
                          : "tool_call_update" !== ed.sessionUpdate ||
                            ed.toolCallId ||
                            this.logger.warn?.(
                              "[ACP Agent] tool_call_update missing toolCallId!",
                            );
                      }
                    } else if (
                      "message" === ef.data.type &&
                      "user" === ef.data.role &&
                      ef.data.providerData?.isCompactInternal
                    ) {
                      let el: any =
                          !!eA.meta?.[
                            eS.SESSION_META_COMPACT_CONTINUE_IN_PROGRESS
                          ],
                        eu: any = !!ef.parentToolUseId,
                        ed: any = !!eA.isCompressing;
                      if (el || eu || ed) {
                        let el: any;
                        ((el = ed
                          ? "compactInProgress"
                          : eu
                            ? "sub-agent"
                            : "postCompactContinue"),
                          this.logger.info?.(
                            `[ACP Agent] skip forwarding compact internal user message (sessionId=${eA.id}, messageId=${ef.data.id}, reason=${el})`,
                          ));
                      } else {
                        let el: any = eY.AcpUtils.convertHistoryItemToAcp(
                            ef.data,
                          ),
                          eu: any = (0, eW.getAcpItemTimestamp)(ef.data);
                        for (let ed of el)
                          await this.sendPromptSessionUpdate(
                            {
                              sessionId: eA.id,
                              update: injectTrackingMeta(ed, eu),
                            },
                            eA.id,
                            ec?.signal,
                          );
                      }
                    } else if (
                      "message" === ef.data.type &&
                      "assistant" === ef.data.role
                    ) {
                      let el: any = ef.data?.providerData?.model;
                      "string" == typeof el &&
                        el &&
                        (eA.meta || (eA.meta = {}),
                        (eA.meta.responseModelId = el));
                      let eu: any = eY.AcpUtils.convertHistoryItemToAcp(
                          ef.data,
                        ),
                        ed: any = (0, eW.getAcpItemTimestamp)(ef.data);
                      for (let el of eu) {
                        let eu: any = ef.parentToolUseId
                          ? {
                              ...el,
                              _meta: {
                                ...(el._meta || {}),
                                "codebuddy.ai/parentToolCallId":
                                  ef.parentToolUseId,
                              },
                            }
                          : el;
                        if (hasStreamedAgentMessage(eu)) {
                          this.logger.debug?.(
                            "[ACP Agent] skip final assistant history item already streamed",
                          );
                          continue;
                        }
                        let ep: any = injectTrackingMeta(eu, ed);
                        (markStreamedAgentMessage(ep),
                          await this.sendPromptSessionUpdate(
                            { sessionId: eA.id, update: ep },
                            eA.id,
                            ec?.signal,
                          ));
                      }
                    }
                  } else if ("model" === ef.type) {
                    ef.parentToolUseId ||
                      ef.data?.type !== "response_started" ||
                      (ed = eA.messageId);
                    let el: any = ef.data?.event;
                    el &&
                      "string" == typeof el.model &&
                      el.model &&
                      (eA.meta || (eA.meta = {}),
                      (eA.meta.responseModelId = el.model));
                    let eu: any = ed,
                      ep: any = eY.AcpUtils.convertOpenAIEventToAcp(ef.data),
                      eg: any = (0, eW.getAcpItemTimestamp)(ef.data);
                    for (let el of ep) {
                      let ed: any = {};
                      ef.parentToolUseId &&
                        (ed["codebuddy.ai/parentToolCallId"] =
                          ef.parentToolUseId);
                      let ep: any =
                        !!eA.meta?.[
                          eS.SESSION_META_COMPACT_CONTINUE_IN_PROGRESS
                        ];
                      if (eA.isCompressing && !ep) {
                        ed["codebuddy.ai/isCompactInternal"] = !0;
                        let el: any = eA.meta?.[eS.SESSION_META_COMPACT_TYPE];
                        el && (ed[eS.ACP_META_COMPACT_TYPE] = el);
                      }
                      Object.keys(ed).length > 0 &&
                        (el._meta = { ...(el._meta || {}), ...ed });
                      let eh: any = el.sessionUpdate;
                      if ("tool_call_pending" === eh) {
                        let ep: any = el.toolCallId,
                          eh: any = el.toolName,
                          ef: any = el.toolCallIndex;
                        if (
                          (ep || void 0 === ef || (ep = eC.get(ef)),
                          !ep ||
                            (void 0 !== ef && eC.set(ef, ep),
                            eh && ew.set(ep, eh),
                            e_.has(ep) ||
                              e_.set(
                                ep,
                                new JsonStreamParser((eA?: any, el?: any) => {
                                  let ec: any =
                                    eA instanceof Error
                                      ? `${eA.message}${
                                          eA.stack
                                            ? `
${eA.stack}`
                                            : ""
                                        }`
                                      : String(eA);
                                  this.logger.warn?.(
                                    `[ACP Agent] JsonStreamParser unexpected error in ${el} for ${ep}: ${ec}`,
                                  );
                                }),
                              ),
                            !el.toolCallId))
                        )
                          continue;
                        let em: any = {
                          sessionUpdate: "tool_call",
                          toolCallId: ep,
                          title: eh ?? "",
                          kind: "other",
                          status: "in_progress",
                          input: {},
                          rawInput: {},
                          _meta: { ...ed, "codebuddy.ai/toolName": eh },
                        };
                        await this.sendPromptSessionUpdate(
                          {
                            sessionId: eA.id,
                            update: injectTrackingMeta(em, eg, eu),
                          },
                          eA.id,
                          ec?.signal,
                        );
                      } else if ("tool_call_arguments_delta" === eh) {
                        let ep: any = el.toolCallId;
                        if (!ep) {
                          let eA: any = el.toolCallIndex;
                          if (void 0 === eA) {
                            this.logger.warn?.(
                              "[ACP Agent] tool_call_arguments_delta missing both toolCallId and toolCallIndex; dropping delta",
                            );
                            continue;
                          }
                          if (!(ep = eC.get(eA))) {
                            this.logger.warn?.(
                              `[ACP Agent] tool_call_arguments_delta for unknown toolCallIndex=${eA}; dropping delta`,
                            );
                            continue;
                          }
                        }
                        let eh: any = el.toolName;
                        eh && !ew.has(ep) && ew.set(ep, eh);
                        let ef: any = el.argumentsDelta ?? "";
                        if (!ef) continue;
                        let em: any = e_.get(ep);
                        if (!em) {
                          let eA: any = ep;
                          ((em = new JsonStreamParser((el?: any, ec?: any) => {
                            let eu: any =
                              el instanceof Error
                                ? `${el.message}${
                                    el.stack
                                      ? `
${el.stack}`
                                      : ""
                                  }`
                                : String(el);
                            this.logger.warn?.(
                              `[ACP Agent] JsonStreamParser unexpected error in ${ec} for ${eA}: ${eu}`,
                            );
                          })),
                            e_.set(ep, em));
                        }
                        em.appendDelta(ef);
                        let eE: any = em.getCurrentResult();
                        if (0 === Object.keys(eE.parameters).length) continue;
                        await this.sendPromptSessionUpdate(
                          {
                            sessionId: eA.id,
                            update: injectTrackingMeta(
                              {
                                ...ed,
                                sessionUpdate: "tool_call_update",
                                toolCallId: ep,
                                rawInput: eE.parameters,
                                content: [
                                  {
                                    type: "content",
                                    content: { type: "text", text: ef },
                                  },
                                ],
                                ...(ew.has(ep)
                                  ? {
                                      _meta: {
                                        "codebuddy.ai/toolName": ew.get(ep),
                                      },
                                    }
                                  : {}),
                              },
                              eg,
                              eu,
                            ),
                          },
                          eA.id,
                          ec?.signal,
                        );
                      } else if ("tool_call_arguments_done" === eh) {
                        let ep: any = el.toolCallId,
                          eh: any = el.argumentsFinal ?? "";
                        if (!ep) continue;
                        let ef: any =
                          e_.get(ep) ??
                          new JsonStreamParser((eA?: any, el?: any) => {
                            let ec: any =
                              eA instanceof Error ? eA.message : String(eA);
                            this.logger.warn?.(
                              `[ACP Agent] JsonStreamParser unexpected error in ${el} for ${ep}: ${ec}`,
                            );
                          });
                        eh && ef.setComplete(eh);
                        let em: any = ef.getCurrentResult();
                        (await this.sendPromptSessionUpdate(
                          {
                            sessionId: eA.id,
                            update: injectTrackingMeta(
                              {
                                ...ed,
                                sessionUpdate: "tool_call_update",
                                toolCallId: ep,
                                rawInput: em.parameters,
                                _meta: {
                                  ...(ew.has(ep)
                                    ? { "codebuddy.ai/toolName": ew.get(ep) }
                                    : {}),
                                  "codebuddy.ai/toolArgumentsComplete": !0,
                                },
                              },
                              eg,
                              eu,
                            ),
                          },
                          eA.id,
                          ec?.signal,
                        ),
                          e_.delete(ep));
                      } else {
                        let ed: any = injectTrackingMeta(el, eg, eu);
                        (markStreamedAgentMessage(ed, eu),
                          await this.sendPromptSessionUpdate(
                            { sessionId: eA.id, update: ed },
                            eA.id,
                            ec?.signal,
                          ));
                      }
                    }
                    let em: any = ef.data;
                    if ("model" === em.type && em.event?.choices)
                      for (let eA of em.event.choices)
                        eA.finish_reason &&
                          ((eh = eA.finish_reason),
                          this.logger.info?.(
                            `[ACP Agent] Captured finish_reason: ${eh}`,
                          ));
                  } else if ("interrupt_result" === ef.type) {
                    if (ef.data === eg)
                      return void this.logger.info?.(
                        "[ACP Agent] RESULT: skipping interrupt_result from previous turn",
                      );
                    if (eA.isCompressing)
                      return void this.logger.info?.(
                        "[ACP Agent] RESULT: interrupt_result during compact — suppressing (isCompressing=true)",
                      );
                    let ec: any = eA.permissionDenials ?? [],
                      eu: any =
                        ec.map((eA?: any) => eA.tool_name).join(", ") ||
                        "unknown";
                    (this.logger.info?.(
                      `[ACP Agent] RESULT: interrupt_result received, permission denied for: ${eu}`,
                    ),
                      (eE = "cancelled"),
                      (ep = `Permission denied for tool(s): ${eu}`),
                      await this.emitCancelledToolCallUpdatesForDenials(eA, ec),
                      this.consumePendingCancellation(eA.id),
                      eA.meta?.userInitiatedAbort &&
                        delete eA.meta.userInitiatedAbort,
                      cleanup(),
                      el({
                        stopReason: eE,
                        errorMessage: ep,
                        finishReason: eh,
                      }));
                  } else if ("result" === ef.type) {
                    let ec: any = ef.data;
                    if (ec === eg)
                      return void this.logger.info?.(
                        "[ACP Agent] RESULT: skipping replayed result from previous turn",
                      );
                    let ed: any = (ec?.interruptions?.length ?? 0) > 0,
                      eC: any = !!ec?.error,
                      ew: any = e$.RunResultUtils.isFinalOutput(ec),
                      eB: any = !!ec && e$.RunResultUtils.isStream(ec);
                    if (
                      (this.logger.info?.(
                        `[ACP Agent] RESULT: isStream=${eB}, isFinal=${ew}, hasInterruptions=${ed}, hasError=${eC}`,
                      ),
                      !ec || !e$.RunResultUtils.isStream(ec))
                    )
                      return void this.logger.info?.(
                        "[ACP Agent] RESULT: not a stream result, skipping",
                      );
                    let e_: any =
                      !!eA.meta?.[eS.SESSION_META_COMPACT_EXPECTS_CONTINUE];
                    if (
                      ec.lastAgent?.name === ey.AgentNames.COMPACT &&
                      eA.isCompressing &&
                      e_
                    )
                      return void this.logger.info?.(
                        "[ACP Agent] RESULT: compact agent result observed during compact lifecycle — keeping forwarding alive for post-compact continue run",
                      );
                    let eI: any = eA.interceptorGate,
                      ev: any = null;
                    ec.completed
                      .catch((eA?: any) => {
                        ((ev = eA),
                          this.logger.error?.(
                            `[ACP Agent] RESULT: completed promise rejected with error: ${e$.ErrorUtils.getErrorMessage(eA)}`,
                          ));
                      })
                      .finally(async () => {
                        if (
                          ev instanceof em.ModelBehaviorError ||
                          (null != ev &&
                            "object" == typeof ev &&
                            "error" in ev &&
                            ev.error instanceof em.ModelBehaviorError)
                        ) {
                          let el: any,
                            ec: any,
                            ed: any =
                              ev instanceof em.ModelBehaviorError
                                ? ev.message
                                : (ev?.error?.message ??
                                  "Model behavior error"),
                            ep: any = ed.match(
                              /Tool (.+?) not found in agent \S+/,
                            );
                          if (ep) {
                            let eA: any = ep[1];
                            eu.ContainerUtil.get(eH.ToolSearchService).describe(
                              eA,
                            )
                              ? ((el = `Retrying with corrected invocation method for tool "${eA}".`),
                                (ec = "deferred_tool_direct_call"))
                              : ((el = ed.replace(
                                  /Tool (.+?) not found in agent [^\s.]+\.?/g,
                                  'Tool "$1" does not exist in the current tool set.',
                                )),
                                (ec = "tool_not_found"));
                          } else
                            ((el =
                              "Tool parameter validation failed. Retrying automatically."),
                              (ec = "invalid_tool_input"));
                          await this.drainPendingToolCallsAsFailed(eA, el, ec);
                        }
                        if (eI && (await eI.completed)) {
                          let eu: any = eA.interceptorGate !== eI,
                            ed: any = ev
                              ? ev?.constructor?.name || ev?.name || typeof ev
                              : "none",
                            eg: any = ec.interruptions?.length ?? 0,
                            ef: any = ec._hasInterruptions,
                            em: any = !!ec.silentAbort,
                            eC: any = ec.error
                              ? ec.error?.code || ec.error?.message || "set"
                              : "none";
                          if (
                            (this.logger.info?.(
                              `[ACP Agent] RESULT: suppressed by interceptorGate (retry/interruption in progress) session=${eA.id} gateMismatch=${eu} errType=${ed} resultErr=${eC} silentAbort=${em} stampedInterruptions=${ef} liveInterruptions=${eg} aborted=${eA.abortSignal?.aborted}`,
                            ),
                            !this.pendingCancellations.has(eA.id))
                          )
                            return;
                          (this.logger.info?.(
                            "[ACP Agent] RESULT: interceptorGate willRetry=true but user cancelled — resolving with cancelled",
                          ),
                            (eE = "cancelled"),
                            this.consumePendingCancellation(eA.id),
                            cleanup(),
                            el({
                              stopReason: eE,
                              errorMessage: ep,
                              finishReason: eh,
                            }));
                          return;
                        }
                        if (
                          ev &&
                          e$.ErrorUtils.isInputLengthError(ev) &&
                          eA.isCompressing
                        )
                          return void this.logger.info?.(
                            "[ACP Agent] RESULT: input length too long during compaction, suppressing (compact will handle recovery)",
                          );
                        try {
                          let eu: any =
                              !!eA.meta?.[
                                eS.SESSION_META_COMPACT_CONTINUE_IN_PROGRESS
                              ],
                            ed: any =
                              ec.lastAgent?.name === ey.AgentNames.COMPACT,
                            eg: any =
                              !!eA.isCompressing &&
                              !eu &&
                              (!ed ||
                                !!eA.meta?.[
                                  eS.SESSION_META_COMPACT_EXPECTS_CONTINUE
                                ]),
                            ef: any = !!eA.meta?.userInitiatedAbort || eg;
                          if (
                            eA.abortSignal.aborted ||
                            this.pendingCancellations.has(eA.id) ||
                            ef
                          ) {
                            if (
                              (this.logger.info?.(
                                `[ACP Agent] RESULT: session was aborted (checked before errors, internal=${ef}, isCompressing=${eA.isCompressing})`,
                              ),
                              eg)
                            ) {
                              (this.logger.info?.(
                                "[ACP Agent] Session is compressing — keeping event forwarding alive for subsequent compact/continue runs",
                              ),
                                this.consumePendingCancellation(eA.id),
                                eA.meta?.userInitiatedAbort &&
                                  delete eA.meta.userInitiatedAbort);
                              return;
                            }
                            ((eE = "cancelled"),
                              this.consumePendingCancellation(eA.id),
                              eA.meta?.userInitiatedAbort &&
                                delete eA.meta.userInitiatedAbort,
                              cleanup(),
                              el({
                                stopReason: eE,
                                errorMessage: ep,
                                finishReason: eh,
                              }));
                            return;
                          }
                          if (ev) throw ev;
                          let em: any = ec.state._lastTurnResponse;
                          if (!em || !em.output || 0 === em.output.length)
                            throw Error("No response received from model");
                          let eC: any = mapFinishReasonToStopReason(eh);
                          (eC && (eE = eC),
                            this.logger.info?.(
                              `[ACP Agent] RESULT: completed successfully, stopReason=${eE}, finishReason=${eh}`,
                            ),
                            resolveWhenTeamTerminal({
                              stopReason: eE,
                              errorMessage: ep,
                              finishReason: eh,
                              traceId: getPromptTraceId(),
                            }));
                        } catch (e_: any) {
                          let eu: any = e$.ErrorUtils.getErrorMessage(e_);
                          this.logger.error?.(
                            `[ACP Agent] RESULT: error during completion: ${eu}`,
                          );
                          let ed: any = this.pendingCancellations.has(eA.id),
                            eg: any =
                              !!eA.meta?.[
                                eS.SESSION_META_COMPACT_CONTINUE_IN_PROGRESS
                              ],
                            ef: any =
                              ec.lastAgent?.name === ey.AgentNames.COMPACT,
                            eC: any =
                              !!eA.isCompressing &&
                              !eg &&
                              (!ef ||
                                !!eA.meta?.[
                                  eS.SESSION_META_COMPACT_EXPECTS_CONTINUE
                                ]),
                            ew: any = !!eA.meta?.userInitiatedAbort || eC,
                            eB: any =
                              e_ instanceof em.ModelBehaviorError ||
                              (null != e_ &&
                                "object" == typeof e_ &&
                                "error" in e_ &&
                                e_.error instanceof em.ModelBehaviorError);
                          if (
                            e_ instanceof Error &&
                            ("AbortError" === e_.name ||
                              eu.includes("aborted") ||
                              eA.abortSignal.aborted ||
                              ed ||
                              ew)
                          )
                            ((eE = "cancelled"),
                              this.consumePendingCancellation(eA.id),
                              eA.meta?.userInitiatedAbort &&
                                delete eA.meta.userInitiatedAbort);
                          else if (eB)
                            (this.logger.info?.(
                              "[ACP Agent] RESULT: ModelBehaviorError — treating as end_turn (model self-correction expected, not surfacing as ACP error)",
                            ),
                              (eE = "end_turn"));
                          else if (eA.meta?.compactLimitReached)
                            (this.logger.info?.(
                              "[ACP Agent] RESULT: suppressing refusal — compactLimitReached already notified frontend",
                            ),
                              (eE = "end_turn"),
                              delete eA.meta.compactLimitReached);
                          else {
                            eE = "refusal";
                            let el: any = classifyErrorAsRequestError(e_);
                            ((ep = JSON.stringify(el.toErrorResponse())),
                              this.logger.warn?.(
                                `[ACP Agent] refusal classified: sessionId=${eA.id}, rpcCode=${el.code}, httpStatus=${el.data?.statusCode}, bizCode=${el.data?.code}, category=${el.data?.category}`,
                              ),
                              this.logRefusalDiagnostics(eA, eu));
                          }
                          "cancelled" === eE
                            ? (cleanup(),
                              el({
                                stopReason: eE,
                                errorMessage: ep,
                                finishReason: eh,
                              }))
                            : resolveWhenTeamTerminal({
                                stopReason: eE,
                                errorMessage: ep,
                                finishReason: eh,
                                traceId: getPromptTraceId(),
                              });
                        }
                      });
                  }
                } catch (eC: any) {
                  let ec: any = e$.ErrorUtils.getErrorMessage(eC);
                  this.logger.error?.(
                    `[ACP Agent] combineSubject subscription error: ${ec}`,
                  );
                  let eu: any = this.pendingCancellations.has(eA.id),
                    ed: any =
                      !!eA.meta?.[eS.SESSION_META_COMPACT_CONTINUE_IN_PROGRESS],
                    eg: any =
                      !!eA.meta?.userInitiatedAbort ||
                      (!!eA.isCompressing && !ed),
                    ef: any =
                      eC instanceof em.ModelBehaviorError ||
                      (null != eC &&
                        "object" == typeof eC &&
                        "error" in eC &&
                        eC.error instanceof em.ModelBehaviorError);
                  if (eA.isCompressing && !ed && !eu) {
                    (this.logger.info?.(
                      "[ACP Agent] combineSubject catch: subscription error during compact — suppressing (isCompressing=true, keeping forwarding alive for subsequent continue run)",
                    ),
                      eA.meta?.userInitiatedAbort &&
                        delete eA.meta.userInitiatedAbort);
                    return;
                  }
                  if (
                    eC instanceof Error &&
                    ("AbortError" === eC.name ||
                      eA.abortSignal.aborted ||
                      eu ||
                      eg)
                  )
                    ((eE = "cancelled"),
                      this.consumePendingCancellation(eA.id),
                      eA.meta?.userInitiatedAbort &&
                        delete eA.meta.userInitiatedAbort);
                  else if (ef)
                    (this.logger.info?.(
                      "[ACP Agent] combineSubject catch: ModelBehaviorError — treating as end_turn",
                    ),
                      (eE = "end_turn"));
                  else if (eA.meta?.compactLimitReached)
                    (this.logger.info?.(
                      "[ACP Agent] combineSubject catch: suppressing refusal — compactLimitReached",
                    ),
                      (eE = "end_turn"),
                      delete eA.meta.compactLimitReached);
                  else {
                    eE = "refusal";
                    let el: any = classifyErrorAsRequestError(eC);
                    ((ep = JSON.stringify(el.toErrorResponse())),
                      this.logger.warn?.(
                        `[ACP Agent] refusal classified: sessionId=${eA.id}, rpcCode=${el.code}, httpStatus=${el.data?.statusCode}, bizCode=${el.data?.code}, category=${el.data?.category}`,
                      ),
                      this.logRefusalDiagnostics(eA, ec));
                  }
                  "cancelled" === eE
                    ? (cleanup(),
                      el({
                        stopReason: eE,
                        errorMessage: ep,
                        finishReason: eh,
                      }))
                    : resolveWhenTeamTerminal({
                        stopReason: eE,
                        errorMessage: ep,
                        finishReason: eh,
                        traceId: getPromptTraceId(),
                      });
                }
              }),
            ),
            ec?.signal &&
              (ec.signal.aborted
                ? resolveCancelledByAbort()
                : ((ef = resolveCancelledByAbort),
                  ec.signal.addEventListener("abort", ef, { once: !0 }))),
            eI || this.activeForwardingCleanups.set(eA.id, cleanup));
        });
      }
      async emitCancelledToolCallUpdatesForDenials(
        eA?: any,
        el?: any,
      ): Promise<any> {
        if (!this.connection || 0 === el.length) return;
        let ec: any = dedupeDenialToolCallIds(el);
        if (0 === ec.length) return;
        let eu: any = new Map();
        for (let eA of el)
          eA.tool_use_id &&
            !eu.has(eA.tool_use_id) &&
            eu.set(eA.tool_use_id, eA.tool_name);
        for (let el of ec)
          try {
            let ec: any = buildDeniedToolCallCancelledUpdate(eA.id, el);
            (await this.sendPromptSessionUpdate(ec, eA.id),
              this.logger.info?.(
                `[ACP Agent] Emitted tool_call_update(cancelled) for denied tool ${eu.get(el) ?? "unknown"}, id=${el}`,
              ));
          } catch (eA: any) {
            this.logger.debug?.(
              `[ACP Agent] Failed to emit cancelled update for ${el}: ${eA}`,
            );
          }
        this.logger.info?.(
          `[ACP Agent] interrupt_result: emitted ${ec.length} cancelled updates for ${el.length} denials`,
        );
      }
      async drainPendingToolCallsAsFailed(
        eA?: any,
        el?: any,
        ec: any = "tool_not_found",
      ): Promise<any> {
        if (!this.connection) return;
        let eu: any = Array.from(this.toolCallSentDeferreds.keys());
        if (0 !== eu.length)
          for (let ed of (this.logger.info?.(
            `[ACP Agent] Draining ${eu.length} pending tool_call(s) as failed (reason=${ec}): ${eu.join(", ")}`,
          ),
          eu))
            try {
              let eu: any = buildPendingToolCallFailedUpdate(eA.id, ed, el, ec);
              if (eA.conversationRequestId) {
                let el: any = eu.update._meta || {};
                ((el["codebuddy.ai/requestId"] = eA.conversationRequestId),
                  (eu.update._meta = el));
              }
              await this.sendPromptSessionUpdate(eu, eA.id);
            } catch (eA: any) {
              this.logger.debug?.(
                `[ACP Agent] Failed to drain pending tool_call ${ed}: ${eA}`,
              );
            } finally {
              this.toolCallSentDeferreds.delete(ed);
            }
      }
      async handleToolApproval(eA?: any, el?: any): Promise<any> {
        if (this.handledApprovals.has(eA)) return;
        this.handledApprovals.add(eA);
        let ec: any =
            "providerData" in eA.rawItem ? eA.rawItem.providerData : void 0,
          ed: any = ec?.["codebuddy.ai/mcpUiIntercept"] === !0,
          ep: any =
            ("function_call" === eA.rawItem.type &&
              (eA.rawItem.callId || eA.rawItem.id)) ||
            "";
        ed &&
          (0, eJ.logMcpUiDiag)(this.logger, {
            event: "approval-enter",
            toolCallId: ep,
            sessionId: el,
          });
        let eg: any =
            "function_call" === eA.rawItem.type
              ? eA.rawItem.callId
              : eA.rawItem?.id || "",
          eh: any = "arguments" in eA.rawItem ? eA.rawItem.arguments : void 0,
          ef: any = "name" in eA.rawItem ? eA.rawItem.name : void 0;
        "AskUserQuestion" === ef && eg && this.markAskToolCallHandled(el, eg);
        let em: any = [
          {
            kind: "allow_always",
            name: "Always Allow",
            optionId: "allow_always",
          },
          { kind: "allow_once", name: "Allow", optionId: "allow" },
          { kind: "reject_once", name: "Reject", optionId: "reject" },
        ];
        "ExitPlanMode" === ef &&
          em.push({
            kind: "reject_once",
            name: "Exit plan mode",
            optionId: "reject_and_exit_plan",
          });
        let eC: any = await this.getRuntimeSession(el);
        if (!eC) {
          (this.logger.warn?.(
            `[ACP Agent] Session not found for tool approval: ${el}`,
          ),
            this.interruptionService.reject(eA));
          return;
        }
        if (eC.abortSignal.aborted) {
          (this.logger.info?.(
            `[ACP Agent] Session already aborted, rejecting tool approval: ${ef}`,
          ),
            this.interruptionService.reject(eA));
          return;
        }
        let ey: any =
          "AskUserQuestion" === ef &&
          !!eg &&
          this.consumePendingEarlyAskSkipToolCallId(el, eg);
        if ("AskUserQuestion" === ef) {
          if ((this.askService.setAsk(eA), eg)) {
            let el: any = eA?.rawItem?.arguments?.questions,
              ec: any = Array.isArray(el) ? el.length : 0;
            this.askService.startWaitSpan(
              eg,
              eC.conversationRequestRootSpan,
              ec,
            );
          }
          this.logger.info?.(
            `[ACP Agent] Primed AskService.setAsk for AskUserQuestion: toolCallId=${eg || "none"}`,
          );
        } else
          eg &&
            eC.conversationRequestRootSpan &&
            this.askService.startWaitSpan(
              eg,
              eC.conversationRequestRootSpan,
              0,
              ef,
            );
        try {
          let ec: any;
          if (eg) {
            this.toolCallSentDeferreds.has(eg) ||
              this.toolCallSentDeferreds.set(eg, new eu.Deferred());
            let eA: any = this.toolCallSentDeferreds.get(eg);
            eA && (await eA.promise);
          }
          if (ey) {
            if (this.interruptionService.pending$.value?.item !== eA)
              return void this.logger.info?.(
                `[ACP Agent] handleToolApproval: early AskUserQuestion skip already handled, toolCallId=${eg}`,
              );
            (this.logger.info?.(
              `[ACP Agent] handleToolApproval: applying early AskUserQuestion skip, toolCallId=${eg}`,
            ),
              this.askService.doneAsk(this.getAskSkipAnswer(eC), eg),
              this.interruptionService.approve(eA));
            return;
          }
          if (eC.interruptionSubject.value !== eA)
            return void this.logger.info?.(
              `[ACP Agent] Tool approval already handled before requestPermission: ${ef}, id: ${eg}`,
            );
          let ep: any = (0, eE.randomUUID)(),
            ew: any =
              "providerData" in eA.rawItem ? eA.rawItem.providerData : void 0,
            eB: any = ew?.["codebuddy.ai/sandboxIntercept"] === !0,
            e_: any = { "codebuddy.ai/toolName": ef };
          (ew &&
            !0 === ew.isTeamMember &&
            "string" == typeof ew.memberName &&
            ((e_["codebuddy.ai/isTeamMember"] = !0),
            (e_["codebuddy.ai/memberName"] = ew.memberName),
            "string" == typeof ew.agentColor &&
              ew.agentColor &&
              (e_["codebuddy.ai/agentColor"] = ew.agentColor)),
            eB &&
              ((e_["codebuddy.ai/sandboxIntercept"] = !0),
              (e_["codebuddy.ai/interceptType"] =
                ew["codebuddy.ai/interceptType"]),
              (e_["codebuddy.ai/target"] = ew["codebuddy.ai/target"]),
              (e_["codebuddy.ai/operation"] = ew["codebuddy.ai/operation"]),
              (e_["codebuddy.ai/description"] = ew["codebuddy.ai/description"]),
              ew["codebuddy.ai/sandboxApprovalMode"] &&
                (e_["codebuddy.ai/sandboxApprovalMode"] =
                  ew["codebuddy.ai/sandboxApprovalMode"]),
              ew["codebuddy.ai/bypassHint"] &&
                (e_["codebuddy.ai/bypassHint"] = ew["codebuddy.ai/bypassHint"]),
              ew["codebuddy.ai/bulkDeleteInfo"] &&
                (e_["codebuddy.ai/bulkDeleteInfo"] =
                  ew["codebuddy.ai/bulkDeleteInfo"])));
          let eI: any = this.connection.requestPermission({
              sessionId: el,
              options: em,
              toolCall: {
                toolCallId: eg,
                rawInput: eY.AcpUtils.parseToRecord(eh, "arguments"),
                _meta: e_,
              },
              _meta: { "codebuddy.ai/requestId": ep },
            }),
            ev: any = new Promise((eA?: any, el?: any) => {
              let abortHandler: any = () => {
                el(Error("Session aborted"));
              };
              eC.abortSignal.aborted
                ? abortHandler()
                : eC.abortSignal.addEventListener("abort", abortHandler, {
                    once: !0,
                  });
            }),
            eS: any = Symbol("localDecided"),
            eQ: any = new Promise((el?: any) => {
              let eu: any = !0;
              ec = eC.interruptionSubject.subscribe((ed?: any) => {
                if (eu) {
                  eu = !1;
                  return;
                }
                ed !== eA && (ec?.unsubscribe(), el(eS));
              });
            }),
            eD: any = await Promise.race([eI, ev, eQ]);
          if (
            (ec?.unsubscribe(),
            "AskUserQuestion" !== ef &&
              this.askService.endWaitSpanExternal(eg, !0),
            eD === eS)
          ) {
            (this.logger.info?.(
              `[ACP Agent] Tool approval handled by TUI/Channel: ${ef}, id: ${eg}`,
            ),
              ed &&
                (0, eJ.logMcpUiDiag)(this.logger, {
                  event: "race-winner",
                  winner: "local-decided",
                  toolCallId: eg,
                }));
            return;
          }
          ed &&
            (0, eJ.logMcpUiDiag)(this.logger, {
              event: "race-winner",
              winner: "acp-requestPermission",
              toolCallId: eg,
            });
          let eT: any = eD,
            eR: any = "deny";
          if (eT.outcome?.outcome === "selected")
            switch (eT.outcome.optionId) {
              case "allow_always":
                eR = "allowAll";
                break;
              case "allow":
                eR = "allow";
                break;
              case "reject_and_exit_plan":
                eR = "rejectAndExitPlan";
                break;
              default:
                eR = "deny";
            }
          if ("allow" === eR || "allowAll" === eR)
            this.interruptionService.approve(eA, {
              alwaysApprove: "allowAll" === eR,
            });
          else if ("rejectAndExitPlan" === eR) {
            let el: any = eC.meta?.prePlanPermissionMode;
            (void 0 !== el
              ? (eC.permissionModeSubject.next(el),
                delete eC.meta?.prePlanPermissionMode)
              : eC.permissionModeSubject.next(ej.PermissionMode.Default),
              this.interruptionService.reject(eA, {
                decision: "rejectAndExitPlan",
              }));
          } else this.interruptionService.reject(eA);
        } catch (eu: any) {
          let ec: any =
            eu.message?.includes("aborted") || eC.abortSignal.aborted;
          (ec
            ? this.logger.info?.(
                `[ACP Agent] Session aborted, rejecting tool approval: ${ef}`,
              )
            : this.logger.error(`Tool approval failed: ${eu.message}`),
            "AskUserQuestion" !== ef &&
              this.askService.endWaitSpanExternal(
                eg,
                !1,
                eu instanceof Error ? eu : Error(String(eu)),
              ),
            ed &&
              (0, eJ.logMcpUiDiag)(this.logger, {
                event: "catch-reject",
                toolCallId: ep,
                sessionId: el,
                isAbort: ec,
                aborted: eC.abortSignal.aborted,
                errMsg: eu?.message || "",
              }),
            this.interruptionService.reject(eA),
            eg && this.toolCallSentDeferreds.delete(eg));
        }
      }
      async cancel(eA?: any): Promise<any> {
        (this.logger.error(
          `[ACP Agent] cancel: received cancel request for session ${eA.sessionId}`,
        ),
          this.pendingCancellations.add(eA.sessionId));
        let el: any = eA._meta?.[ez.ACP_META_CANCEL_REASON];
        (this.cancelEvent.next({
          sessionId: eA.sessionId,
          ...("string" == typeof el ? { cancelReason: el } : {}),
        }),
          await this.usagePublisher.publish(eA.sessionId, "cancel"));
      }
      async unstable_setSessionModel(eA?: any): Promise<any> {
        return (
          this.logger.info?.(
            `[ACP Agent] unstable_setSessionModel called: sessionId=${eA.sessionId}, modelId=${eA.modelId}`,
          ),
          await this.applyRuntimeSessionModel(
            eA.sessionId,
            eA.modelId,
            "unstable_setSessionModel",
          ),
          this.modelChangeEvent.next({
            sessionId: eA.sessionId,
            modelId: eA.modelId,
          }),
          setTimeout(() => {
            this.currentSessionId === eA.sessionId &&
              (this.configChangeEvent.next({
                sessionId: eA.sessionId,
                configId: "model",
                value: eA.modelId,
              }),
              this.usagePublisher
                .publish(eA.sessionId, "model_changed")
                .catch((el?: any) => {
                  this.logger.warn?.(
                    `[ACP Agent] post-response model usage update failed for session ${eA.sessionId}: ${e$.ErrorUtils.getErrorMessage(el)}`,
                  );
                }));
          }, 0).unref?.(),
          { modelId: eA.modelId }
        );
      }
      async setSessionModel(eA?: any): Promise<any> {
        return this.unstable_setSessionModel(eA);
      }
      async setSessionMode(eA?: any): Promise<any> {
        if (
          ![
            ej.PermissionMode.Default,
            ej.PermissionMode.AcceptEdits,
            ej.PermissionMode.BypassPermissions,
            ej.PermissionMode.FullAccess,
            ej.PermissionMode.Plan,
            ej.PermissionMode.DontAsk,
            ej.PermissionMode.Auto,
            ej.PermissionMode.Work,
          ].includes(eA.modeId)
        )
          throw Error(`Invalid mode: ${eA.modeId}`);
        return (
          this.logger.info?.(
            `[ACP Agent] setSessionMode called: sessionId=${eA.sessionId}, modeId=${eA.modeId}`,
          ),
          this.modeChangeEvent.next({
            sessionId: eA.sessionId,
            modeId: eA.modeId,
          }),
          this.configChangeEvent.next({
            sessionId: eA.sessionId,
            configId: "mode",
            value: eA.modeId,
          }),
          {}
        );
      }
      async setSessionConfigOption(eA?: any): Promise<any> {
        this.logger.info?.(
          `[ACP Agent] setSessionConfigOption called: configId=${eA.configId}, value=${eA.value}`,
        );
        let el: any = await this.getRuntimeSession(eA.sessionId);
        if (!el) throw Error(`Session not found: ${eA.sessionId}`);
        let requireStringConfigValue: any = (eA?: any, el?: any) => {
          if ("string" != typeof eA)
            throw Error(
              `Invalid value type for config option ${el}: expected value ID string`,
            );
          return eA;
        };
        if ("mode" === eA.configId) {
          let el: any = requireStringConfigValue(eA.value, eA.configId),
            ec: any = [
              ej.PermissionMode.Default,
              ej.PermissionMode.AcceptEdits,
              ej.PermissionMode.BypassPermissions,
              ej.PermissionMode.FullAccess,
              ej.PermissionMode.Plan,
              ej.PermissionMode.DontAsk,
              ej.PermissionMode.Auto,
              ej.PermissionMode.Work,
            ];
          if (!ec.includes(el))
            throw (
              this.logger.warn?.(
                `[ACP Agent] setSessionConfigOption: invalid mode "${el}", valid=${ec.join(",")}`,
              ),
              Error(`Invalid mode: ${el}`)
            );
          (this.logger.info?.(
            `[ACP Agent] setSessionConfigOption: applying mode=${el} to session=${eA.sessionId}`,
          ),
            this.modeChangeEvent.next({ sessionId: eA.sessionId, modeId: el }),
            this.configChangeEvent.next({
              sessionId: eA.sessionId,
              configId: eA.configId,
              value: el,
            }));
        } else if ("model" === eA.configId) {
          let el: any = requireStringConfigValue(eA.value, eA.configId);
          (await this.applyRuntimeSessionModel(
            eA.sessionId,
            el,
            "setSessionConfigOption(model)",
          ),
            this.modelChangeEvent.next({
              sessionId: eA.sessionId,
              modelId: el,
            }),
            this.configChangeEvent.next({
              sessionId: eA.sessionId,
              configId: eA.configId,
              value: el,
            }));
        } else if ("thought_level" === eA.configId) {
          let el: any = requireStringConfigValue(eA.value, eA.configId),
            ec: any = await this.getRuntimeSession(eA.sessionId);
          if (!ec) throw Error(`Session not found: ${eA.sessionId}`);
          if ("disabled" === el) {
            let el: any = await this.getCurrentModelLanguageConfig(ec);
            if (!this.canDisableThinking(el))
              throw Error(
                `Current model does not support disabling thinking (modelId=${el?.id ?? "unknown"})`,
              );
            this.sessionManager.setOverrideThinking(eA.sessionId, {
              thinkingEnabled: !1,
            });
          } else if ("enabled" === el)
            this.sessionManager.setOverrideThinking(eA.sessionId, {
              thinkingEnabled: !0,
            });
          else {
            let ec: any = (0, eh.normalizeReasoningEffort)(el);
            if (!ec)
              throw Error(
                `Invalid thought_level value: "${el}". Allowed: ${eh.VALID_REASONING_EFFORTS.join(", ")} | enabled | disabled`,
              );
            this.sessionManager.setOverrideThinking(eA.sessionId, {
              thinkingEnabled: !0,
              reasoningEffort: ec,
            });
          }
          this.configChangeEvent.next({
            sessionId: eA.sessionId,
            configId: eA.configId,
            value: el,
          });
        } else if ("language" === eA.configId) {
          let ec: any = requireStringConfigValue(eA.value, eA.configId);
          (await this.cliSettingsProvider.set("language", ec),
            this.logger.info?.(
              `[ACP Agent] Applied language=${ec} to session-level settings for session ${el.id}`,
            ),
            this.configChangeEvent.next({
              sessionId: eA.sessionId,
              configId: eA.configId,
              value: ec,
            }));
        } else if ("sandbox" === eA.configId) {
          let ec: any = requireStringConfigValue(eA.value, eA.configId),
            eu: any = "true" === ec,
            ed: any = {
              ...((await this.cliSettingsProvider.getSettings()).sandbox || {}),
              enabled: eu,
            };
          (await this.cliSettingsProvider.set("sandbox", ed),
            (0, ex.setSandboxConfigApplicationState)(el, eu));
          let ep: any = normalizeSandboxDisabledReason(eA._meta?.[e3]);
          ((0, ex.setSandboxTurnDisabledReason)(el, eu ? void 0 : ep),
            this.logger.info?.(
              `[ACP Agent] Applied sandbox.enabled=${eu} to session-level settings for session ${el.id}`,
            ),
            this.configChangeEvent.next({
              sessionId: eA.sessionId,
              configId: eA.configId,
              value: ec,
            }));
        } else if ("preMessageCompactPct" === eA.configId) {
          let ec: any = "string" == typeof eA.value ? eA.value : "",
            eu: any = "" === ec ? void 0 : parseInt(ec, 10);
          ((el.meta = {
            ...(el.meta ?? {}),
            preMessageCompactPct: void 0 === eu || isNaN(eu) ? void 0 : eu,
          }),
            this.logger.info?.(
              `[ACP Agent] setSessionConfigOption: preMessageCompactPct=${eu ?? "cleared"} for session ${el.id}`,
            ),
            this.configChangeEvent.next({
              sessionId: eA.sessionId,
              configId: eA.configId,
              value: ec,
            }));
        } else throw Error(`Unknown config option: ${eA.configId}`);
        return { configOptions: await this.getConfigOptions(el) };
      }
      async extMethod(eA?: any, el?: any): Promise<any> {
        switch (
          (("_codebuddy.ai/resolveInterruption" === eA ||
            "_codebuddy.ai/mcpUiCallTool" === eA) &&
            this.logger.info?.(
              `[DIAG-mcpui-resolve] extMethod hit method=${eA} paramKeys=${Object.keys(el || {}).join(",")}`,
            ),
          eA)
        ) {
          case "_codebuddy.ai/getUserInfo":
            return this.getUserInfo();
          case "_codebuddy.ai/delegateToolsChanged":
            return this.handleDelegateToolsChanged(el);
          case "_codebuddy.ai/resolveInterruption":
            return this.handleResolveInterruption(el);
          case "_codebuddy.ai/refreshPlugins": {
            let eA: any =
              "string" == typeof el.reason ? el.reason : "extMethod";
            return (
              e6.has(eA)
                ? this.logger.info?.(
                    `[ACP Agent] plugin management change remains pending (${eA})`,
                  )
                : await this.refreshProductAndTools(eA),
              {}
            );
          }
          case "_codebuddy.ai/mcpUiReadResource":
            return this.handleMcpUiReadResource(el);
          case "_codebuddy.ai/mcpUiCallTool":
            return this.handleMcpUiCallTool(el);
          case "session/get_message_queue":
            return this.handleQueueMethod(
              eA,
              el,
              (eA?: any) => eA.getQueue(el.sessionId) ?? {},
            );
          case "session/save_message_queue":
            return this.handleQueueMethod(
              eA,
              el,
              (eA?: any) => (eA.saveQueue(el), el),
            );
          case "session/enqueue_message":
            return this.handleQueueMethod(eA, el, (eA?: any) =>
              eA.enqueueItem(el.sessionId, el.contentBlocks),
            );
          case "session/remove_queue_item":
            return this.handleQueueMethod(eA, el, (eA?: any) =>
              eA.removeItem(el.sessionId, el.itemId),
            );
          case "session/pop_queue_item_for_edit":
            return this.handleQueueMethod(eA, el, (eA?: any) =>
              eA.popItemForEdit(el.sessionId, el.itemId),
            );
          case "session/reorder_queue":
            return this.handleQueueMethod(eA, el, (eA?: any) =>
              eA.reorderItems(el.sessionId, el.orderedIds),
            );
          case "session/send_queue_item_now":
            return this.handleQueueMethod(eA, el, async (eA?: any) =>
              eA.sendNow(el.sessionId, el.itemId),
            );
          case "session/activate_queue":
            return this.handleQueueMethod(eA, el, (eA?: any) =>
              eA.activate(el.sessionId),
            );
          case "session/pause_queue":
            return this.handleQueueMethod(eA, el, (eA?: any) =>
              eA.pause(el.sessionId, el.reason),
            );
          case "session/resume_queue":
            return this.handleQueueMethod(eA, el, (eA?: any) =>
              eA.resume(el.sessionId),
            );
          case "session/set_config_option":
            return this.setSessionConfigOption(el);
          case "session/set_model":
            return (await this.unstable_setSessionModel(el)) ?? {};
          case "session/inject_history":
            return this.handleInjectHistory(el);
          case "_codebuddy.ai/session/rollback": {
            let eA: any = String(el.sessionId || ""),
              ec: any = await this.getRuntimeSession(eA);
            if (!ec)
              throw ez.RequestError.invalidParams(
                `Session not found for rollback: ${eA}`,
              );
            return await handleRollback(
              {
                session: ec,
                resolveForkPoint: async (eA?: any, el?: any) =>
                  (0, eV.resolveResendForkPoint)(eA, el),
                logger: this.logger,
                addHistory: (eA?: any, el?: any) =>
                  this.sessionManager.addHistory(eA, el),
              },
              el,
            );
          }
          case "_codebuddy.ai/mcpUiUpdateModelContext":
            return this.handleMcpUiUpdateModelContext(el);
          case "_codebuddy.ai/mcpUiRequestDisplayMode":
            return this.handleMcpUiRequestDisplayMode(el);
          case "_codebuddy.ai/mcpUiResourceTeardown":
            return this.handleMcpUiResourceTeardown(el);
          default:
            throw ez.RequestError.methodNotFound(eA);
        }
      }
      async handleMcpUiUpdateModelContext(eA?: any): Promise<any> {
        let el: any = String(eA.sessionId || ""),
          ec: any = eA.content,
          eu: any = eA.structuredContent;
        if (!el)
          throw ez.RequestError.invalidParams(
            "mcpUiUpdateModelContext requires sessionId",
          );
        let ed: any = await this.getRuntimeSession(el);
        if (!ed)
          throw ez.RequestError.invalidParams(
            `No session found for mcpUiUpdateModelContext: ${el}`,
          );
        return (
          (ed[e9] = {
            ...(void 0 !== ec ? { content: ec } : {}),
            ...(void 0 !== eu ? { structuredContent: eu } : {}),
          }),
          this.logger?.info?.(
            `[mcpUi] updateModelContext stored for session ${el}`,
          ),
          {}
        );
      }
      async handleMcpUiRequestDisplayMode(eA?: any): Promise<any> {
        let el: any = String(eA.sessionId || ""),
          ec: any = String(eA.serverName || ""),
          eu: any = String(eA.mode || "inline");
        if (!el || !ec)
          throw ez.RequestError.invalidParams(
            "mcpUiRequestDisplayMode requires sessionId and serverName",
          );
        return (
          this.logger?.info?.(
            `[mcpUi] requestDisplayMode: server=${ec}, mode=${eu}`,
          ),
          this.displayModeEvent.next({ serverName: ec, mode: eu }),
          { mode: eu }
        );
      }
      async handleMcpUiResourceTeardown(eA?: any): Promise<any> {
        let el: any = String(eA.sessionId || ""),
          ec: any = String(eA.serverName || "");
        if (!el || !ec)
          throw ez.RequestError.invalidParams(
            "mcpUiResourceTeardown requires sessionId and serverName",
          );
        return (
          this.logger?.info?.(`[mcpUi] resourceTeardown: server=${ec}`),
          {}
        );
      }
      async handleMcpUiReadResource(eA?: any): Promise<any> {
        let el: any = String(eA.serverName || ""),
          ec: any = String(eA.uri || "");
        if (!el || !ec)
          throw ez.RequestError.invalidParams(
            "mcpUiReadResource requires serverName and uri",
          );
        let eu: any = await this.findMcpServer(el);
        if (!eu)
          throw ez.RequestError.invalidParams(
            `MCP server not connected: ${el}`,
          );
        return { contents: await eu.readResource({ uri: ec }) };
      }
      async handleMcpUiCallTool(eA?: any): Promise<any> {
        let el: any = String(eA.sessionId || ""),
          ec: any = String(eA.serverName || ""),
          eu: any = String(eA.toolName || ""),
          ed: any =
            eA.arguments && "object" == typeof eA.arguments ? eA.arguments : {};
        if (!ec || !eu)
          throw ez.RequestError.invalidParams(
            "mcpUiCallTool requires serverName and toolName",
          );
        let ep: any = await this.getRuntimeSession(el);
        if (!ep)
          throw ez.RequestError.invalidParams(
            `No session found for mcpUiCallTool: ${el}`,
          );
        if (!(await this.requestMcpUiApproval(ep, ec, eu, ed)))
          return {
            content: [
              { type: "text", text: `User denied UI tool call: ${eu}` },
            ],
            isError: !0,
          };
        let eg: any = await this.findMcpServer(ec);
        if (!eg)
          return {
            content: [
              { type: "text", text: `MCP server not connected: ${ec}` },
            ],
            isError: !0,
          };
        let eh: any = `mcp__${ec}__${eu}`,
          ef: any = {};
        return {
          content: await eg.callTool(eh, ed, {
            __resultMetaSink: (eA?: any) => {
              ef = eA;
            },
          }),
          ...(ef.structuredContent
            ? { structuredContent: ef.structuredContent }
            : {}),
          ...(ef._meta ? { _meta: ef._meta } : {}),
        };
      }
      requestMcpUiApproval(eA?: any, el?: any, ec?: any, eu?: any): any {
        let ed: any = this.sessionManager.sessionSubject?.value,
          ep: any = ed?.permissionModeSubject?.value,
          eg: any = this.sessionManager.getOverridePermissionMode?.(
            ed?.id ?? eA.id,
          ),
          isFreePass: any = (eA?: any) =>
            eA === ej.PermissionMode.FullAccess ||
            eA === ej.PermissionMode.BypassPermissions;
        if (
          (this.logger.info?.(
            `[DIAG-mcpui-allow-session] permissionMode check server=${el} tool=${ec} sessionId=${eA.id} memSessionId=${ed?.id ?? "none"} subjectMode=${ep ?? "undefined"} overrideMode=${eg ?? "undefined"} paramSubjectMode=${eA.permissionModeSubject?.value ?? "undefined"}`,
          ),
          isFreePass(ep) || isFreePass(eg))
        )
          return (
            this.logger.info?.(
              `[mcpUi] auto-approve ${el}::${ec} (permissionMode=${ep ?? eg})`,
            ),
            Promise.resolve(!0)
          );
        let eh: any = { canonicalCommand: `mcpui:${el}::${ec}`, cwd: "" },
          ef: any = ed?.sandboxApprovalStore ?? eA.sandboxApprovalStore,
          em: any = ef?.get(eh);
        return (this.logger.info?.(
          `[DIAG-mcpui-allow-session] lookup server=${el} tool=${ec} sessionId=${eA.id} storeFromMem=${!!ed?.sandboxApprovalStore} storeFromParam=${!!eA.sandboxApprovalStore} storeSize=${ef?.size?.() ?? "n/a"} hit=${em ?? "miss"}`,
        ),
        "approved_for_session" === em)
          ? Promise.resolve(!0)
          : new Promise((ed?: any) => {
              let ep: any = `mcpui-${(0, eE.randomUUID)()}`,
                eg: any = {
                  rawItem: {
                    type: "function_call",
                    id: ep,
                    callId: ep,
                    name: `mcp__${el}__${ec}`,
                    arguments: JSON.stringify(eu),
                    status: "in_progress",
                    providerData: {
                      "codebuddy.ai/mcpUiIntercept": !0,
                      "codebuddy.ai/target": el,
                      "codebuddy.ai/operation": "mcp-ui reverse tools/call",
                      "codebuddy.ai/description": `An interactive UI from "${el}" wants to call tool "${ec}". Your confirmation is required.`,
                      argumentsDisplayText: `[MCP App] ${ec}`,
                      _sandboxResolve: (eu?: any) => {
                        if (
                          ((0, eJ.logMcpUiDiag)(
                            this.logger,
                            {
                              event: "sandbox-resolve",
                              callId: ep,
                              server: el,
                              tool: ec,
                              choice: "string" == typeof eu ? eu : String(eu),
                            },
                            !0,
                          ),
                          "allow_session" === eu)
                        ) {
                          let eu: any =
                            this.sessionManager.sessionSubject?.value
                              ?.sandboxApprovalStore ?? ef;
                          eu
                            ? (eu.put(eh),
                              this.logger.info?.(
                                `[DIAG-mcpui-allow-session] put server=${el} tool=${ec} sessionId=${eA.id} storeSizeAfter=${eu.size?.() ?? "n/a"}`,
                              ))
                            : this.logger.warn?.(
                                `[mcpUi] session has no sandboxApprovalStore; allow_session is only effective for this call (server=${el} tool=${ec})`,
                              );
                        }
                        ed("boolean" == typeof eu ? eu : "deny" !== eu);
                      },
                      _enqueuedViaQueue: !0,
                    },
                  },
                };
              this.interruptionService.enqueueSandboxApproval(eA, eg);
            });
      }
      async findMcpServer(eA?: any): Promise<any> {
        return (await this.mcpManager.getConnectedServers()).find(
          (el?: any) => el.name === eA,
        );
      }
      async handleQueueMethod(eA?: any, el?: any, ec?: any): Promise<any> {
        let ed: any = eu.ContainerUtil.get(eh.ProductManager),
          ep: any = await ed.waitConfiguration();
        if (
          ep.productFeatures?.[
            eh.ProductFeature.MessageQueueDeferredDispatch
          ] !== !0
        )
          throw ez.RequestError.methodNotFound(eA);
        return ec(eu.ContainerUtil.get(ek.RichMessageQueueManager));
      }
      async handleInjectHistory(eA?: any): Promise<any> {
        let el: any = eA.messages;
        if (!Array.isArray(el) || 0 === el.length)
          throw ez.RequestError.invalidParams(
            'Missing or empty "messages" array',
          );
        let ec: any = eA.sessionId,
          eu: any =
            (ec ? await this.getRuntimeSession(ec) : void 0) ??
            (this.sessionDeferred
              ? await this.sessionDeferred.promise
              : void 0);
        if (!eu)
          throw ez.RequestError.invalidParams(
            "No active session found for history injection",
          );
        let ed: any = buildInjectHistoryItems(el);
        return (
          await this.sessionManager.addHistory(eu, ed),
          this.logger.info?.(
            `[ACP Agent] inject_history: injected ${ed.length} items into session ${eu.id}`,
          ),
          { injected: ed.length }
        );
      }
      async handleDelegateToolsChanged(eA?: any): Promise<any> {
        try {
          let el: any = eA.changeType,
            ec: any = eA.tools,
            ed: any = eA.providerId || eA.sessionId || "unknown";
          this.logger.info?.(
            `[handleDelegateToolsChanged] enter changeType=${el} providerId=${ed} tools.count=${Array.isArray(ec) ? ec.length : "n/a"} toolIds.count=${Array.isArray(eA.toolIds) ? eA.toolIds.length : "n/a"}`,
          );
          let ep: any = eu.ContainerUtil.get(ez.DelegateToolManager);
          if ("added" === el && ec && Array.isArray(ec))
            for (let eA of ec) {
              let el: any = {
                name: eA.name,
                description: eA.description,
                inputSchema: eA.inputSchema || {},
                provider: eA.provider,
                category: eA.category,
                requiresApproval: eA.requiresApproval,
              };
              (await ep.registerTool(eA.id, el, ed),
                this.logger.info?.(
                  `[ACP Agent] Registered delegate tool: ${eA.id} from provider: ${ed}`,
                ));
            }
          else if ("removed" === el)
            for (let el of Array.isArray(ec)
              ? ec
                  .map((eA?: any) => ("string" == typeof eA ? eA : eA?.id))
                  .filter(Boolean)
              : Array.isArray(eA.toolIds)
                ? eA.toolIds.filter((eA?: any) => "string" == typeof eA)
                : [])
              (await ep.unregisterTool(el),
                this.logger.info?.(
                  `[ACP Agent] Unregistered delegate tool: ${el}`,
                ));
          return {};
        } catch (eA: any) {
          throw (
            this.logger.error?.(
              `Failed to handle delegate tools changed: ${eA?.message}`,
            ),
            eA
          );
        }
      }
      async handleResolveInterruption(eA?: any): Promise<any> {
        let el: any = eA.sessionId,
          ec: any = eA.toolCallId,
          eu: any = eA.decision,
          ed: any = eA.answers;
        if (
          (this.logger.info?.(
            `[DIAG-mcpui-resolve] enter sessionId=${el ?? "none"} toolCallId=${ec ?? "none"} decision=${eu ?? "none"}`,
          ),
          this.logger.info?.(
            `[ACP Agent] handleResolveInterruption: sessionId=${el || "none"}, toolCallId=${ec || "none"}, decision=${eu || "none"}, answerKeys=${ed ? Object.keys(ed).join(",") : "none"}`,
          ),
          !el || !ec || !eu)
        )
          throw Error("Invalid resolveInterruption params");
        let ep: any = await this.getRuntimeSession(el);
        if (!ep)
          return (
            this.logger.warn?.(
              `[ACP Agent] Session not found for resolveInterruption: ${el}`,
            ),
            { resolved: !1, queued: !1 }
          );
        this.logger.info?.(
          `[ACP Agent] handleResolveInterruption: session found, activeInterruption=${ep.interruptionSubject.value ? "yes" : "no"}`,
        );
        let eg: any = ep.interruptionSubject.value,
          eh: any = eg
            ? "function_call" === eg.rawItem.type
              ? eg.rawItem.callId || eg.rawItem.id
              : eg.rawItem?.id
            : void 0,
          ef: any = this.askService.currentItem$.value;
        if ((!eg || eh !== ec) && ef) {
          let eA: any = ef;
          this.logger.info?.(
            `[ACP Agent] handleResolveInterruption: trying AskService fallback, currentInterruptionToolCallId=${eh || "none"}`,
          );
          let el: any =
            "function_call" === eA.rawItem.type
              ? eA.rawItem.callId || eA.rawItem.id
              : eA.rawItem?.id;
          (this.logger.info?.(
            `[ACP Agent] handleResolveInterruption: askToolCallId=${el || "none"}`,
          ),
            el === ec &&
              ((eg = eA),
              this.logger.info?.(
                "[ACP Agent] handleResolveInterruption: matched via AskService fallback",
              )));
        }
        if (!eg) {
          let eA: any = this.interruptionService.pending$.value,
            el: any = eA?.item?.rawItem,
            eu: any = el
              ? ("function_call" === el.type && el.callId) || el.id
              : void 0;
          eA &&
            eu === ec &&
            ((eg = eA.item),
            this.logger.info?.(
              `[ACP Agent] handleResolveInterruption: matched via pending$ fallback (sandbox approval), mainSessionId=${eA.mainSessionId}`,
            ));
        }
        if (!eg) {
          let eA: any =
            "deny" === eu &&
            !this.toolCallSentDeferreds.has(ec) &&
            !this.hasHandledAskToolCall(el, ec);
          return (
            eA &&
              (this.addPendingEarlyAskSkipToolCallId(el, ec),
              this.logger.info?.(
                `[ACP Agent] handleResolveInterruption: recorded early AskUserQuestion skip without active interruption, toolCallId=${ec}`,
              )),
            this.logger.info?.(
              `[ACP Agent] No active interruption to resolve for session ${el}`,
            ),
            { resolved: !1, queued: eA }
          );
        }
        let em: any =
          "function_call" === eg.rawItem.type
            ? eg.rawItem.callId || eg.rawItem.id
            : eg.rawItem?.id;
        if (
          (this.logger.info?.(
            `[ACP Agent] handleResolveInterruption: resolved currentToolCallId=${em || "none"}`,
          ),
          em !== ec)
        ) {
          this.logger.warn?.(
            `[ACP Agent] resolveInterruption toolCallId mismatch: expected ${em}, got ${ec}`,
          );
          let eA: any =
            "deny" === eu &&
            !this.toolCallSentDeferreds.has(ec) &&
            !this.hasHandledAskToolCall(el, ec);
          return (
            eA &&
              (this.addPendingEarlyAskSkipToolCallId(el, ec),
              this.logger.info?.(
                `[ACP Agent] handleResolveInterruption: recorded early AskUserQuestion skip for mismatched toolCallId=${ec}`,
              )),
            { resolved: !1, queued: eA }
          );
        }
        let eE: any = "name" in eg.rawItem ? eg.rawItem.name : eg.rawItem.type,
          eC: any = eg.rawItem.providerData;
        if (
          (this.logger.info?.(
            `[DIAG-mcpui-resolve] matched item toolName=${eE} hasProviderData=${!!eC} hasSandboxResolve=${"function" == typeof eC?._sandboxResolve} mcpUiIntercept=${eC?.["codebuddy.ai/mcpUiIntercept"] === !0} enqueuedViaQueue=${eC?._enqueuedViaQueue === !0}`,
          ),
          "allow" === eu || "allowAll" === eu)
        ) {
          if (
            (this.logger.info?.(
              `[ACP Agent] handleResolveInterruption: approving toolName=${eE}`,
            ),
            "AskUserQuestion" === eE && ed)
          ) {
            let eA: any = new Map(),
              el: any =
                "arguments" in eg.rawItem ? eg.rawItem.arguments : void 0;
            try {
              let ec: any = "string" == typeof el ? JSON.parse(el) : el;
              (Array.isArray(ec?.questions) ? ec.questions : []).forEach(
                (el?: any, ec?: any) => {
                  let eu: any =
                    "string" == typeof el?.question ? el.question : "";
                  eu &&
                    (eA.set(eu, eu),
                    "string" == typeof el?.id && el.id && eA.set(el.id, eu),
                    eA.set(`q_${ec}`, eu));
                },
              );
            } catch (eA: any) {
              this.logger.warn?.(
                `[ACP Agent] handleResolveInterruption: failed to parse AskUserQuestion arguments: ${eA instanceof Error ? eA.message : String(eA)}`,
              );
            }
            let ec: any = Object.fromEntries(
              Object.entries(ed).map(([el, ec]: any) => [
                eA.get(el) || el,
                Array.isArray(ec) ? ec.join(", ") : ec,
              ]),
            );
            (this.logger.info?.(
              `[ACP Agent] handleResolveInterruption: forwarding Ask answers keys=${Object.keys(ec).join(",")}`,
            ),
              this.askService.doneAsk(ec, em));
          }
          return (
            this.interruptionService.approve(eg, {
              alwaysApprove: "allowAll" === eu,
            }),
            this.logger.info?.(
              "[ACP Agent] handleResolveInterruption: approve dispatched",
            ),
            { resolved: !0, queued: !1 }
          );
        }
        if ("rejectAndExitPlan" === eu) {
          let eA: any = ep.meta?.prePlanPermissionMode;
          return (
            void 0 !== eA
              ? (ep.permissionModeSubject.next(eA),
                delete ep.meta?.prePlanPermissionMode)
              : ep.permissionModeSubject.next(ej.PermissionMode.Default),
            this.interruptionService.reject(eg, {
              decision: "rejectAndExitPlan",
            }),
            { resolved: !0, queued: !1 }
          );
        }
        return (
          "AskUserQuestion" === eE
            ? (this.logger.info?.(
                "[ACP Agent] handleResolveInterruption: skipping AskUserQuestion",
              ),
              this.askService.doneAsk(this.getAskSkipAnswer(ep), em),
              this.interruptionService.approve(eg),
              this.logger.info?.(
                "[ACP Agent] handleResolveInterruption: AskUserQuestion skip dispatched",
              ))
            : (this.interruptionService.reject(eg, { decision: "deny" }),
              this.logger.info?.(
                "[ACP Agent] handleResolveInterruption: reject dispatched",
              )),
          { resolved: !0, queued: !1 }
        );
      }
      logRefusalDiagnostics(eA?: any, el?: any): any {
        try {
          let ec: any = Array.isArray(eA.history) ? eA.history : [],
            eu: any = new Set(),
            ed: any = null;
          for (let eA: any = ec.length - 1; eA >= 0; eA--) {
            let el: any = ec[eA];
            if (el) {
              if ("function_call_result" === el.type && el.callId)
                eu.add(el.callId);
              else if (
                "function_call" === el.type &&
                el.callId &&
                !eu.has(el.callId)
              ) {
                ed = { callId: el.callId, name: el.name };
                break;
              }
            }
          }
          this.logger.error?.(
            `[ACP Agent] Prompt refused: sessionId=${eA.id}, errorMsg=${el}, lastPendingTool=${ed ? `${ed.name}/${ed.callId}` : "(none)"}`,
          );
        } catch (eA: any) {
          this.logger.debug?.(
            `[ACP Agent] logRefusalDiagnostics failed: ${eA?.message || eA}`,
          );
        }
      }
      async _handleSandboxInterceptPermission(eA?: any): Promise<any> {
        this.logger.info?.(
          `[AcpAgent] Requesting sandbox intercept permission | requestId=${eA.requestId} | type=${eA.interceptType}`,
        );
        try {
          let el: any = await this.connection.requestPermission({
              sessionId: eA.sessionId,
              options: [
                { kind: "allow", name: "Yes", optionId: "allow_once" },
                {
                  kind: "allow",
                  name: "Yes, don't ask again in this session",
                  optionId: "allow_session",
                },
                { kind: "reject", name: "No, ask to adjust", optionId: "deny" },
              ],
              toolCall: {
                toolCallId: eA.requestId,
                rawInput: {
                  command: eA.command,
                  target: eA.target,
                  operation: eA.operation,
                },
                _meta: {
                  "codebuddy.ai/toolName": "SandboxIntercept",
                  "codebuddy.ai/interceptType": eA.interceptType,
                  "codebuddy.ai/target": eA.target,
                  "codebuddy.ai/operation": eA.operation,
                  "codebuddy.ai/details": eA.details,
                },
              },
              _meta: { "codebuddy.ai/requestId": eA.requestId },
            }),
            ec: any = el?.outcome?.optionId;
          if (
            (this.logger.info?.(
              `[AcpAgent] Sandbox intercept permission response | requestId=${eA.requestId} | optionId=${ec ?? "none"}`,
            ),
            "allow_once" === ec || "allow_session" === ec || "deny" === ec)
          )
            return ec;
          return "deny";
        } catch (eA: any) {
          return (
            this.logger.warn?.(
              `[AcpAgent] Sandbox intercept permission request failed: ${eA.message}`,
            ),
            "deny"
          );
        }
      }
    };
  return {
    AcpAgentImpl: e7,
    JsonStreamParser: JsonStreamParser,
    AcpErrorCode: e4,
    MCP_UI_MODEL_CONTEXT: e9,
    handleRollback,
    buildInjectHistoryItems,
    buildWorkspaceInfoParams,
    sendWorkspaceInfoNotification,
    isSandboxDisabledReason,
    normalizeSandboxDisabledReason,
    mapFinishReasonToStopReason,
    isRecord,
    createAuthRequiredError,
    isAuthRequiredLikeError,
    extractStructuredErrorData,
    isCancelledMessage,
    classifyErrorAsRequestError,
    buildDeniedToolCallCancelledUpdate,
    dedupeDenialToolCallIds,
    buildPendingToolCallFailedUpdate,
  };
}
