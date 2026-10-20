// @ts-nocheck
// Full inert source fragments; no transport bootstrap, account discovery, or ambient DI.
export const ACP_PRIMITIVES_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const ACP_PRIMITIVE_CLASSES = [
  ["AcpToolInterceptor", 8267394, 8276216],
  ["TelemetryUtils", 13255898, 13258162],
  ["RequestError", 16677682, 16678667],
] as const;
export const ACP_PRIMITIVE_FACTORIES = [
  [8461, 116942, 117169],
  [22618, 6912875, 6914131],
  [91364, 6916577, 6917786],
  [54631, 12203693, 12204314],
  [8046, 13069736, 13080314],
] as const;
export interface NativeAcpPrimitiveRuntime {
  modules?: Record<number, any>;
  getModule?: (id: number) => any;
  Date?: DateConstructor | { new (value?: any): Date; now(): number };
  setTimeout?: typeof globalThis.setTimeout;
  clearTimeout?: typeof globalThis.clearTimeout;
}
export function createNativeAcpPrimitives(
  runtime: NativeAcpPrimitiveRuntime = {},
): {
  Deferred: any;
  RequestError: any;
  TelemetryUtils: any;
  AcpToolInterceptor: any;
  protocol: any;
  trace: any;
  history: any;
  getModule(id: number): any;
} {
  const Date = runtime.Date ?? globalThis.Date;
  const setTimeout = runtime.setTimeout ?? globalThis.setTimeout,
    clearTimeout = runtime.clearTimeout ?? globalThis.clearTimeout;
  const missing = (id: number) =>
    new Proxy(
      {},
      {
        get(_target, key) {
          throw Error(
            "Explicit ACP primitive dependency required: " +
              id +
              "." +
              String(key),
          );
        },
      },
    );
  const factories: any = {
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
    22618(eA, el, ec) {
      "use strict";
      (ec.r(el),
        ec.d(el, {
          ACP_CANCEL_REASON_SANDBOX_APPROVAL_TIMEOUT: () => eD,
          ACP_META_CANCEL_REASON: () => eQ,
          ACP_USAGE_CATEGORY_SNAPSHOT_SOURCES: () => eT,
          AcpAgent: () => eg,
          AcpAgentManager: () => ew,
          AcpBroadcastService: () => e_,
          AcpConnectionGuard: () => eB,
          AcpContext: () => ep,
          AcpServer: () => ed,
          AcpStreamManager: () => eC,
          AcpToolInterceptor: () => eh,
          AcpTransport: () => eE,
          AcpTransportFactory: () => em,
          AcpTransportManager: () => ef,
          AcpUsagePublisher: () => eI,
          AcpView: () => ey,
          AgentSideConnection: () => eu.AgentSideConnection,
          DelegateTool: () => ev,
          DelegateToolManager: () => eS,
          PROTOCOL_VERSION: () => eu.PROTOCOL_VERSION,
          RequestError: () => eu.RequestError,
          ndJsonStream: () => eu.ndJsonStream,
        }));
      var eu = ec(38113);
      let ed = Symbol("AcpServer"),
        ep = Symbol("AcpContext"),
        eg = Symbol("AcpAgent"),
        eh = Symbol("AcpToolInterceptor"),
        ef = Symbol("AcpTransportManager"),
        em = Symbol("AcpTransportFactory"),
        eE = Symbol("AcpTransport"),
        eC = Symbol("AcpStreamManager"),
        ey = Symbol("AcpView"),
        ew = Symbol("AcpAgentManager"),
        eB = Symbol("AcpConnectionGuard"),
        e_ = Symbol("AcpBroadcastService"),
        eI = Symbol("AcpUsagePublisher"),
        ev = Symbol("DelegateTool"),
        eS = Symbol("DelegateToolManager"),
        eQ = "codebuddy.ai/cancelReason",
        eD = "sandbox_approval_timeout",
        eT = new Set([
          "new_session",
          "load_session",
          "resume_session",
          "prompt_end",
          "cancel",
        ]);
    },
    91364(eA, el, ec) {
      "use strict";
      function resolveResendForkPoint(eA, el) {
        let { userMessageId: ec, forkFromRequestId: eu } = el;
        if ((!ec && !eu) || !Array.isArray(eA) || 0 === eA.length)
          return { found: !1 };
        let ed = ec ? eA.find((eA) => eA?.id === ec) : void 0;
        if ((!ed && eu && (ed = eA.find((eA) => eA?.id === eu)), !ed && eu)) {
          let el = eA.find((eA) => eA?.id && eA.id.length > 36)?.id;
          if (el) {
            let ec = el.slice(0, 36);
            if (36 === ec.length && "-" === el[36]) {
              let el = `${ec}-${eu}`;
              ed = eA.find((eA) => eA?.id === el);
            }
          }
          if (!ed) {
            let el = `-${eu}`;
            ed = eA.find((eA) => eA?.id != null && eA.id.endsWith(el));
          }
        }
        if (!ed && eu) {
          let el = eA.find(
              (eA) => eA?.providerData?.conversationRequestId === eu,
            ),
            ec = el?.parentId;
          ec && (ed = eA.find((eA) => eA?.id === ec));
        }
        return ed
          ? { found: !0, editedUserItemId: ed.id, forkPoint: ed.parentId }
          : { found: !1 };
      }
      function resolveUserItemIdForResponse(eA, el) {
        if (Array.isArray(eA) && 0 !== eA.length) {
          if (el) {
            let ec = `-${el}`,
              eu = eA.find(
                (eA) =>
                  eA &&
                  "message" === eA.type &&
                  "user" === eA.role &&
                  (eA.id === el || (null != eA.id && eA.id.endsWith(ec))),
              );
            if (eu?.id) return eu.id;
          }
          for (let el = eA.length - 1; el >= 0; el--) {
            let ec = eA[el];
            if (
              ec &&
              "message" === ec.type &&
              "user" === ec.role &&
              !ec.providerData?.isMeta
            )
              return ec.id;
          }
        }
      }
      (ec.r(el),
        ec.d(el, {
          resolveResendForkPoint: () => resolveResendForkPoint,
          resolveUserItemIdForResponse: () => resolveUserItemIdForResponse,
        }));
    },
    54631(eA, el, ec) {
      "use strict";
      function isValidW3CTraceId(eA) {
        return (
          "string" == typeof eA &&
          /^[0-9a-f]{32}$/.test(eA) &&
          eA !== "0".repeat(32)
        );
      }
      function isValidW3CSpanId(eA) {
        return (
          "string" == typeof eA &&
          /^[0-9a-f]{16}$/.test(eA) &&
          eA !== "0".repeat(16)
        );
      }
      function parseW3CTraceparent(eA) {
        if ("string" != typeof eA) return;
        let el = eA.split("-");
        if (4 !== el.length) return;
        let [ec, eu, ed, ep] = el;
        if (
          "00" === ec &&
          isValidW3CTraceId(eu) &&
          isValidW3CSpanId(ed) &&
          /^[0-9a-f]{2}$/.test(ep)
        )
          return { traceId: eu, spanId: ed };
      }
      (ec.r(el),
        ec.d(el, {
          isValidW3CSpanId: () => isValidW3CSpanId,
          isValidW3CTraceId: () => isValidW3CTraceId,
          parseW3CTraceparent: () => parseW3CTraceparent,
        }));
    },
    8046(eA, el, ec) {
      "use strict";
      (ec.r(el),
        ec.d(el, {
          ErrorUtils: () => ed,
          INTERRUPTED_BY_USER_MESSAGE: () => eI,
          ServerErrorCode: () => eu,
        }));
      var eu,
        ed,
        ep = ec(80699),
        eg = ec(9151),
        eh = ec(97903),
        ef = ec(89425),
        em = ec(83473),
        eE = ec(46949);
      !(function (eA) {
        ((eA[(eA.CraftRateLimit = 6e3)] = "CraftRateLimit"),
          (eA[(eA.CraftRateTPSLimit = 6001)] = "CraftRateTPSLimit"),
          (eA[(eA.CraftRateTPMLimit = 6002)] = "CraftRateTPMLimit"),
          (eA[(eA.CraftRateTPHLimit = 6003)] = "CraftRateTPHLimit"),
          (eA[(eA.CraftRateTPDLimit = 6004)] = "CraftRateTPDLimit"),
          (eA[(eA.CraftRateRPSLimit = 6005)] = "CraftRateRPSLimit"),
          (eA[(eA.CraftRateRPMLimit = 6006)] = "CraftRateRPMLimit"),
          (eA[(eA.CraftRateRPHLimit = 6007)] = "CraftRateRPHLimit"),
          (eA[(eA.CraftRateRPDLimit = 6008)] = "CraftRateRPDLimit"),
          (eA[(eA.UsageLimitExceeded = 14001)] = "UsageLimitExceeded"),
          (eA[(eA.ConversationChatTooMany = 14002)] =
            "ConversationChatTooMany"),
          (eA[(eA.RateLimitError = 14003)] = "RateLimitError"),
          (eA[(eA.UsageLimitExceededEnterprise = 14012)] =
            "UsageLimitExceededEnterprise"),
          (eA[(eA.UsageLimitExceededTencent = 14013)] =
            "UsageLimitExceededTencent"),
          (eA[(eA.UsageLimitEnterpriseExhausted = 14014)] =
            "UsageLimitEnterpriseExhausted"),
          (eA[(eA.UsageLimitLicenseExpired = 14015)] =
            "UsageLimitLicenseExpired"),
          (eA[(eA.UsageLimitEnterpriseNotActivated = 14016)] =
            "UsageLimitEnterpriseNotActivated"),
          (eA[(eA.UsageLimitUserNotActivated = 14017)] =
            "UsageLimitUserNotActivated"),
          (eA[(eA.UsageLimitUserExhausted = 14018)] =
            "UsageLimitUserExhausted"),
          (eA[(eA.ConversationLimitExceeded = 10105)] =
            "ConversationLimitExceeded"),
          (eA[(eA.WebSearchRateLimit = 15001)] = "WebSearchRateLimit"));
      })(eu || (eu = {}));
      let eC = eu.CraftRateLimit,
        ey = eu.CraftRateRPDLimit,
        ew = new Set([eu.RateLimitError]),
        eB = new Set([
          eu.UsageLimitExceeded,
          eu.UsageLimitExceededEnterprise,
          eu.UsageLimitExceededTencent,
          eu.UsageLimitEnterpriseExhausted,
          eu.UsageLimitUserExhausted,
        ]),
        e_ = new Set([...ew, ...eB]),
        eI = "Interrupted by user";
      function isRecordValue(eA) {
        return !!eA && "object" == typeof eA && !Array.isArray(eA);
      }
      !(function (eA) {
        function getErrorMessage(eA) {
          if (eA instanceof Error) return eA.message;
          try {
            return String(eA);
          } catch {
            return "Failed to get error details";
          }
        }
        function toNumber(eA) {
          if ("number" == typeof eA && !isNaN(eA)) return eA;
          if ("string" == typeof eA && "" !== eA.trim()) {
            let el = Number(eA);
            return isNaN(el) ? void 0 : el;
          }
        }
        function safeParseJson(eA) {
          try {
            return JSON.parse(eA);
          } catch {
            return;
          }
        }
        function extractBizCode(eA, el = 4) {
          if (!isRecordValue(eA) || el <= 0) return;
          let ec = extractBizCode(eA.error, el - 1);
          if (void 0 !== ec) return ec;
          let eu = isRecordValue(eA.response) ? eA.response : void 0,
            ed = extractBizCode(eu?.data, el - 1);
          if (void 0 !== ed) return ed;
          let ep = eA.code;
          return "number" != typeof ep || isNaN(ep)
            ? "string" == typeof ep && /^\d+$/.test(ep)
              ? Number(ep)
              : void 0
            : ep;
        }
        function getHttpStatusCode(eA) {
          if (!isRecordValue(eA)) return;
          let el = toNumber(eA.statusCode) ?? toNumber(eA.status);
          if (void 0 !== el) return el;
          let ec = toNumber(eA.response?.status);
          if (void 0 !== ec) return ec;
        }
        function getResponseBody(eA) {
          if (!isRecordValue(eA)) return;
          let el = eA.responseBody;
          if (void 0 !== el) return el;
          let ec = eA.response?.data;
          if (void 0 !== ec) return ec;
        }
        function extractBizCodeFromResponseBody(eA, el) {
          let ec = parseResponseBodyObject(eA);
          return void 0 !== ec.code && 0 !== ec.code ? ec.code : el || 0;
        }
        function extractRateLimitBizCode(eA, el) {
          let ec = parseResponseBodyObject(eA);
          return void 0 !== ec.errorDataCode
            ? ec.errorDataCode
            : void 0 !== ec.errorCode
              ? ec.errorCode
              : void 0 !== ec.code && 0 !== ec.code
                ? ec.code
                : el;
        }
        function parseResponseBodyObject(eA) {
          let el,
            ec,
            eu = eA;
          if ("string" == typeof eu)
            try {
              eu = JSON.parse(eu);
            } catch {
              return { code: void 0, errorCode: void 0, errorDataCode: void 0 };
            }
          if (!isRecordValue(eu))
            return { code: void 0, errorCode: void 0, errorDataCode: void 0 };
          let ed = toNumber(eu.code),
            ep = eu.error;
          if (isRecordValue(ep)) {
            el = toNumber(ep.code);
            let eA = ep.data;
            isRecordValue(eA) && (ec = toNumber(eA.code));
          }
          return { code: ed, errorCode: el, errorDataCode: ec };
        }
        function isSpecialError10008(eA) {
          let el = eA;
          if ("string" == typeof el)
            try {
              el = JSON.parse(el);
            } catch {
              return !1;
            }
          return isRecordValue(el) && 10008 === toNumber(el.code);
        }
        function isCustomModelAPIKeyError(eA) {
          if (!isRecordValue(eA) || 401 !== toNumber(eA.statusCode)) return !1;
          let el = eA.url;
          if ("string" != typeof el || !el) return !1;
          let ec = [];
          try {
            let eA = ep.ContainerUtil.get(
              eg.ProductManager,
            ).getCurrentConfiguration();
            for (let el of [eA?.endpoint, eA?.stagingEndpoint])
              if (el)
                try {
                  ec.push(new URL(el).hostname);
                } catch {}
          } catch {}
          return !ec.some((eA) => el.includes(eA));
        }
        function isNetworkConnectionError(eA) {
          if (!isRecordValue(eA)) return !1;
          let el = eA.message,
            ec = eA.code;
          if ("string" == typeof el || "string" == typeof ec) {
            let eA = `${el || ""} ${ec || ""}`;
            return /ECONNRESET|ECONNREFUSED|ENOTFOUND|socket hang up|network/i.test(
              eA,
            );
          }
          return !1;
        }
        function isTimeoutError(eA) {
          if (!isRecordValue(eA)) return !1;
          if ("TimeoutError" === eA.name) return !0;
          let el = eA.code;
          if ("string" == typeof el) {
            let eA = el.toLowerCase();
            if ("etimedout" === eA || "timeout" === eA) return !0;
          }
          let ec = eA.message;
          if ("string" == typeof ec) {
            let eA = ec.toLowerCase();
            return (
              eA.includes("timeout") ||
              eA.includes("timed out") ||
              eA.includes("time exceeded")
            );
          }
          return !1;
        }
        function isUnauthorizedError(eA) {
          if (!isRecordValue(eA)) return !1;
          if ("Unauthorized" === eA.name) return !0;
          let el = eA.code;
          if ("string" == typeof el) {
            let eA = el.toLowerCase();
            if (
              "unauthorized" === eA ||
              "authentication failed" === eA ||
              "authorization failed" === eA
            )
              return !0;
          }
          let ec = eA.message;
          if ("string" == typeof ec) {
            let eA = ec.toLowerCase();
            return (
              eA.includes("unauthorized") ||
              eA.includes("authentication failed") ||
              eA.includes("authorization failed") ||
              eA.includes("ai_apicallerror: unauthorized")
            );
          }
          try {
            let el = eA.toString?.()?.toLowerCase?.();
            if (el?.includes("ai_apicallerror: unauthorized")) return !0;
          } catch {}
          return !1;
        }
        function isStreamErrorByOtherPlugin(eA) {
          if (!isRecordValue(eA)) return !1;
          let el = eA.message;
          return (
            "string" == typeof el &&
            el.includes("Failed to process successful response")
          );
        }
        function getFallbackCode(eA) {
          if (!isRecordValue(eA)) return "10006";
          let el = eA.code;
          return null != el && "" !== el ? String(el) : "10006";
        }
        ((eA.isNodeError = function (eA) {
          return eA instanceof Error && "code" in eA;
        }),
          (eA.getErrorMessage = getErrorMessage),
          (eA.formatErrorMessage = function (eA) {
            let { status: el, message: ec, code: ed } = eA,
              { links: eh } =
                ep.ContainerUtil.get(
                  eg.ProductManager,
                ).getCurrentConfiguration() || {},
              ef = eh?.upgradeUrl
                ? `Upgrade → ${em.AnsiUtils.createHyperlink(eh?.upgradeUrl)}`
                : "";
            return 429 === el && ed === eu.UsageLimitExceeded
              ? `No available credits left. New ones tomorrow at [time, e.g., 12:00 AM CST]. ${ef}`
              : "Request was aborted." === ec
                ? eI
                : "Request aborted." === ec
                  ? `Interrupted. ${eE.ThemeUtils.chalk.secondary("Try /clear to free up context in new conversation.")}`
                  : ec && ec.includes("Stream timeout: no data received")
                    ? "Response timed out (no data received). Retrying automatically..."
                    : "canceled" === ec ||
                        "cancelled" === ec ||
                        "Request cancelled" === ec
                      ? "Request was cancelled. This can happen after system sleep or network interruption. Please try again."
                      : ec || "Unknown error";
          }),
          (eA.isNetworkError = function (eA) {
            return (
              (eA && "ECONNRESET" === eA.code) ||
              "ECONNABORTED" === eA.code ||
              "ETIMEDOUT" === eA.code
            );
          }),
          (eA.isModelOverloadedError = function (eA) {
            if (!eA) return !1;
            let el = [eA, eA?.error];
            for (let ec of [
              eA?.message,
              eA?.error?.message,
              eA?.details,
              eA?.error?.details,
            ])
              if ("string" == typeof ec) {
                let eA = safeParseJson(ec);
                eA &&
                  "object" == typeof eA &&
                  (el.push(eA),
                  eA.error && el.push(eA.error),
                  eA.data && el.push(eA.data));
              }
            for (let eA of el) {
              if (!eA || "object" != typeof eA) continue;
              let el = toNumber(eA.status) ?? toNumber(eA.statusCode),
                ec = toNumber(eA.code);
              if (
                429 === el ||
                (void 0 !== ec && ((ec >= eC && ec <= ey) || e_.has(ec)))
              )
                return !0;
              let eu = [eA.message, eA.details, eA.msg, eA.type]
                .filter((eA) => "string" == typeof eA)
                .join(" ")
                .toLowerCase();
              if (
                eu &&
                (eu.includes("overloaded") ||
                  eu.includes("overload") ||
                  eu.includes("rate limit") ||
                  eu.includes("too many requests") ||
                  eu.includes("quota") ||
                  eu.includes("credit") ||
                  eu.includes("capacity") ||
                  eu.includes("额度") ||
                  eu.includes("用尽") ||
                  eu.includes("限流"))
              )
                return !0;
            }
            return !1;
          }),
          (eA.isQuotaExhaustedError = function (eA) {
            if (!eA) return !1;
            let el = [eA, eA?.error];
            for (let ec of [
              eA?.message,
              eA?.error?.message,
              eA?.details,
              eA?.error?.details,
            ])
              if ("string" == typeof ec) {
                let eA = safeParseJson(ec);
                eA &&
                  "object" == typeof eA &&
                  (el.push(eA),
                  eA.error && el.push(eA.error),
                  eA.data && el.push(eA.data));
              }
            for (let eA of el) {
              if (!eA || "object" != typeof eA) continue;
              let el = toNumber(eA.code);
              if (void 0 !== el && eB.has(el)) return !0;
              let ec = [eA.message, eA.details, eA.msg]
                .filter((eA) => "string" == typeof eA)
                .join(" ")
                .toLowerCase();
              if (
                ec &&
                (ec.includes("no available credits") ||
                  ec.includes("quota exhausted") ||
                  ec.includes("credit exhausted") ||
                  ec.includes("额度已用尽") ||
                  ec.includes("额度用尽"))
              )
                return !0;
            }
            return !1;
          }),
          (eA.isInputLengthError = function (eA) {
            if (!eA) return !1;
            let el = [],
              visit = (eA) => {
                if (eA) {
                  if ("string" == typeof eA) return void el.push(eA);
                  ("string" == typeof eA.message && el.push(eA.message),
                    "string" == typeof eA.details && el.push(eA.details),
                    eA.error && visit(eA.error),
                    eA.data && visit(eA.data));
                }
              };
            visit(eA);
            let ec = el.join(" | ").toLowerCase();
            return (
              !!ec &&
              (ec.includes("input length too long") ||
                ec.includes("prompt is too long") ||
                ec.includes("maximum context length") ||
                /input\s*(?:length|tokens?)[^0-9]*\d+[^0-9]+exceeds/.test(ec))
            );
          }),
          (eA.isRetryableModelError = function (eA) {
            return (
              eA instanceof eh.ModelBehaviorError ||
              eA instanceof SyntaxError ||
              (null != eA &&
                "object" == typeof eA &&
                "error" in eA &&
                (eA.error instanceof SyntaxError ||
                  eA.error instanceof eh.ModelBehaviorError))
            );
          }),
          (eA.isStreamTimeoutError = function (eA) {
            if (eA instanceof ef.StreamTimeoutError) return !0;
            if (!eA) return !1;
            let el = eA?.message || "";
            return (
              "string" == typeof el &&
              el.includes("Stream timeout: no data received")
            );
          }),
          (eA.isFirstTokenTimeoutError = function (eA) {
            return (
              eA instanceof ef.StreamTimeoutError && eA.isFirstTokenTimeout
            );
          }),
          (eA.isEmptyStreamError = function (eA) {
            if (eA instanceof ef.EmptyStreamError) return !0;
            if (!eA) return !1;
            let el = eA?.message || "";
            return "string" == typeof el && el.startsWith("Empty stream:");
          }),
          (eA.serializeErrorForAcp = function (eA) {
            try {
              if (
                eA &&
                "object" == typeof eA &&
                "status" in eA &&
                "code" in eA &&
                "message" in eA
              ) {
                let el = eA,
                  ec = {
                    details: el.message || "Unknown error",
                    statusCode: el.status,
                    code: el.code,
                  };
                try {
                  return JSON.stringify(ec);
                } catch (eA) {
                  return JSON.stringify({
                    details: el.message || "Unknown error",
                  });
                }
              }
              let el = getErrorMessage(eA);
              try {
                return JSON.stringify({ details: el });
              } catch (eA) {
                return el;
              }
            } catch (eA) {
              return "An error occurred";
            }
          }),
          (eA.extractBizCode = extractBizCode),
          (eA.mapMessageErrorCode = function (eA) {
            if (!eA) return "";
            let el = getHttpStatusCode(eA),
              ec = getResponseBody(eA);
            if (null === ec || "" === ec)
              return el ? String(el) : getFallbackCode(eA);
            if (el && el >= 500 && el < 600)
              return String(extractBizCodeFromResponseBody(ec, el));
            if (429 === el) return String(extractRateLimitBizCode(ec, el));
            if (el && el >= 400 && el < 500 && !isSpecialError10008(ec))
              return String(extractBizCodeFromResponseBody(ec, el));
            return isCustomModelAPIKeyError(eA)
              ? "3001"
              : isStreamErrorByOtherPlugin(eA)
                ? "3006"
                : isNetworkConnectionError(eA)
                  ? "3002"
                  : isTimeoutError(eA)
                    ? "3003"
                    : isUnauthorizedError(eA)
                      ? "3004"
                      : getFallbackCode(eA);
          }));
      })(ed || (ed = {}));
    },
  };
  const cache = new Map<number, any>();
  function load(id: number): any {
    if (runtime.modules?.[id] !== undefined) return runtime.modules[id];
    if (cache.has(id)) return cache.get(id).exports;
    if (id === 38113)
      return new Proxy(
        { RequestError },
        {
          get(target, key) {
            if (key in target) return target[key];
            throw Error("ACP transport SDK is not installed: " + String(key));
          },
        },
      );
    if (!factories[id]) return runtime.getModule?.(id) ?? missing(id);
    const module = { exports: {} };
    cache.set(id, module);
    factories[id](module, module.exports, load);
    return module.exports;
  }
  load.r = (exports: any) =>
    Object.defineProperty(exports, "__esModule", { value: true });
  load.d = (exports: any, defs: any) => {
    for (const key of Object.keys(defs))
      if (!Object.hasOwn(exports, key))
        Object.defineProperty(exports, key, {
          enumerable: true,
          get: defs[key],
        });
  };
  const AcpToolInterceptor = (() => {
    const nB = load(93039);
    const ne = load(70724);
    const nh = load(38548);
    const nw = load(33177);
    let n_ = class {
      constructor() {
        ((this.connection = null),
          (this.backgroundTerminals = {}),
          (this.fileContentCache = new Map()));
      }
      setConnection(eA) {
        this.connection = eA;
      }
      resolveAcpSessionId(eA) {
        return eA.context.meta?.parentSessionId ?? eA.context.id;
      }
      getConnection() {
        if (!this.connection)
          throw Error("ACP connection not set. Call setConnection() first.");
        return this.connection;
      }
      async readTextFile(eA) {
        let el = this.getConnection(),
          ec = await el.readTextFile(eA);
        return (
          eA.line || eA.limit || this.fileContentCache.set(eA.path, ec.content),
          ec
        );
      }
      async writeTextFile(eA) {
        let el = this.getConnection(),
          ec = await el.writeTextFile(eA);
        return (this.fileContentCache.set(eA.path, eA.content), ec);
      }
      getFileContentCache() {
        return Object.fromEntries(this.fileContentCache);
      }
      setCapabilities(eA) {
        this.capabilities = eA;
      }
      getCapabilities() {
        return this.capabilities;
      }
      isSupportRead() {
        return !!this.capabilities?.fs?.readTextFile;
      }
      async callRead(eA, el, ec) {
        let eu = this.resolveAcpSessionId(el);
        try {
          let el = nB.PathUtils.resolveFilePathToWorkDir(eA.file_path),
            ec = await this.readTextFile({
              sessionId: eu,
              path: el,
              line: eA.offset,
              limit: eA.limit,
            }),
            ed = ec.content.split(/\r?\n/),
            ep = this.formatContentWithLineNumbers(ec.content, eA.offset || 1);
          return {
            title: `Read ${ed.length} lines`,
            content: ep,
            renderer: {
              type: "code",
              context: {
                language: nB.LanguageUtils.getLanguageFromExtension(el),
              },
            },
          };
        } catch (el) {
          let eA = el instanceof Error ? el.message : String(el);
          return { content: eA, error: `Error reading file: ${eA}` };
        }
      }
      formatContentWithLineNumbers(eA, el) {
        return eA
          .split(/\r?\n/)
          .map((eA, ec) => {
            let eu = (el + ec).toString().padStart(4, " ");
            return `${eu}→${eA}`;
          })
          .join("\n");
      }
      isSupportWrite() {
        return !!this.capabilities?.fs?.writeTextFile;
      }
      async callWrite(eA, el, ec) {
        let eu = this.resolveAcpSessionId(el);
        try {
          let el = nB.PathUtils.resolveFilePathToWorkDir(eA.file_path);
          await this.writeTextFile({
            sessionId: eu,
            path: el,
            content: eA.content,
          });
          let ec = eA.content.split(/\r?\n/),
            ed = `Successfully wrote to file: ${el}`;
          return {
            title: `Wrote ${ec.length} lines`,
            content: ed,
            renderer: {
              type: "code",
              context: {
                language: nB.LanguageUtils.getLanguageFromExtension(el),
              },
              value: eA.content,
            },
          };
        } catch (el) {
          let eA = el instanceof Error ? el.message : String(el);
          throw Error(`Write error: ${eA}`);
        }
      }
      isSupportEdit() {
        return !!this.capabilities?.fs?.writeTextFile;
      }
      async callEdit(eA, el, ec) {
        let eu = this.resolveAcpSessionId(el);
        try {
          let el = nB.PathUtils.resolveFilePathToWorkDir(eA.file_path),
            ec = (await this.readTextFile({ sessionId: eu, path: el })).content,
            { newContent: ed } =
              nB.EditFileUtils.applyTextReplacementWithLocation(ec, [
                {
                  oldString: eA.old_string,
                  newString: eA.new_string,
                  replaceAll: eA.replace_all,
                },
              ]);
          await this.writeTextFile({ sessionId: eu, path: el, content: ed });
          let ep = `Successfully edited file: ${el}`;
          return {
            title: "Edit applied",
            content: ep,
            renderer: { type: "diff" },
          };
        } catch (el) {
          let eA = el instanceof Error ? el.message : String(el);
          throw Error(`Edit error: ${eA}`);
        }
      }
      isSupportMultiEdit() {
        return !!this.capabilities?.fs?.writeTextFile;
      }
      async callMultiEdit(eA, el, ec) {
        let eu = this.resolveAcpSessionId(el);
        try {
          let el = nB.PathUtils.resolveFilePathToWorkDir(eA.file_path),
            ec = (await this.readTextFile({ sessionId: eu, path: el })).content,
            { newContent: ed } =
              nB.EditFileUtils.applyTextReplacementWithLocation(
                ec,
                eA.edits.map((eA) => ({
                  oldString: eA.old_string,
                  newString: eA.new_string,
                  replaceAll: eA.replace_all,
                })),
              );
          await this.writeTextFile({ sessionId: eu, path: el, content: ed });
          let ep = `Successfully applied ${eA.edits.length} edit(s) to file: ${el}`;
          return {
            title: `Applied ${eA.edits.length} edits`,
            content: ep,
            renderer: { type: "diff" },
          };
        } catch (el) {
          let eA = el instanceof Error ? el.message : String(el);
          throw Error(`MultiEdit error: ${eA}`);
        }
      }
      isSupportBash() {
        return !!this.capabilities?.terminal;
      }
      async callBash(eA, el, ec) {
        let eu = this.getConnection(),
          ed = this.resolveAcpSessionId(el);
        try {
          let el = ec?.toolCall?.callId;
          if ("string" != typeof el) throw Error("No tool call ID found");
          if (!eu.createTerminal)
            throw Error("Terminal capability not available");
          let ep = await eu.createTerminal({
            command: eA.command,
            sessionId: ed,
            outputByteLimit: 32e3,
          });
          await eu.sessionUpdate({
            sessionId: ed,
            update: (0, nh.withAcpTimestampMeta)({
              sessionUpdate: "tool_call_update",
              toolCallId: el,
              status: "in_progress",
              title: eA.description,
              content: [{ type: "terminal", terminalId: ep.id }],
            }),
          });
          let eg = 12e4,
            eh = eA.timeout || eg,
            ef = new Promise((eA) => {
              setTimeout(async () => {
                let el = this.backgroundTerminals[ep.id];
                (el && "started" === el.status && (await ep.kill()),
                  eA({ status: "timedOut", exitStatus: null }));
              }, eh);
            }),
            em = ep
              .waitForExit()
              .then((eA) => ({ status: "exited", exitStatus: eA }));
          if (eA.run_in_background)
            return (
              (this.backgroundTerminals[ep.id] = {
                handle: ep,
                lastOutput: null,
                status: "started",
              }),
              Promise.race([em, ef]).then(
                async ({ status: eA, exitStatus: el }) => {
                  let ec = this.backgroundTerminals[ep.id];
                  if (!ec || "started" !== ec.status) return;
                  let eu = await ep.currentOutput();
                  ((this.backgroundTerminals[ep.id] = {
                    status: eA,
                    pendingOutput: {
                      ...eu,
                      output: this.stripCommonPrefix(
                        ec.lastOutput?.output ?? "",
                        eu.output,
                      ),
                      exitStatus: el ?? eu.exitStatus,
                    },
                  }),
                    await ep.release());
                },
              ),
              {
                content: `Command started in background with id: ${ep.id}`,
                renderer: {
                  type: "text",
                  value: `Command started in background with id: ${ep.id}`,
                },
              }
            );
          let { status: eE } = await Promise.race([em, ef]),
            eC = await ep.currentOutput();
          await ep.release();
          let ey = this.formatToolCommandOutput(eE, eC);
          return { content: ey, renderer: { type: "text", value: ey } };
        } catch (el) {
          let eA = el instanceof Error ? el.message : String(el);
          throw Error(`Bash error: ${eA}`);
        }
      }
      isSupportBashOutput() {
        return !!this.capabilities?.terminal;
      }
      async callBashOutput(eA, el, ec) {
        let eu = this.backgroundTerminals[eA.shell_id];
        if (!eu) throw Error(`Unknown shell ${eA.shell_id}`);
        if ("started" === eu.status) {
          let eA = await eu.handle.currentOutput(),
            el = this.stripCommonPrefix(eu.lastOutput?.output ?? "", eA.output);
          eu.lastOutput = eA;
          let ec = this.formatToolCommandOutput(eu.status, {
            ...eA,
            output: el,
          });
          return { content: ec, renderer: { type: "text", value: ec } };
        }
        {
          let eA = this.formatToolCommandOutput(eu.status, eu.pendingOutput);
          return { content: eA, renderer: { type: "text", value: eA } };
        }
      }
      isSupportKillShell() {
        return !!this.capabilities?.terminal;
      }
      async callKillShell(eA, el, ec) {
        let eu = this.backgroundTerminals[eA.shell_id];
        if (!eu) throw Error(`Unknown shell ${eA.shell_id}`);
        switch (eu.status) {
          case "started": {
            await eu.handle.kill();
            let eA = await eu.handle.currentOutput();
            return (
              (this.backgroundTerminals[eu.handle.id] = {
                status: "killed",
                pendingOutput: {
                  ...eA,
                  output: this.stripCommonPrefix(
                    eu.lastOutput?.output ?? "",
                    eA.output,
                  ),
                },
              }),
              await eu.handle.release(),
              {
                content: "Command killed successfully.",
                renderer: {
                  type: "text",
                  value: "Command killed successfully.",
                },
              }
            );
          }
          case "aborted":
            return {
              content: "Command aborted by user.",
              renderer: { type: "text", value: "Command aborted by user." },
            };
          case "exited":
            return {
              content: "Command had already exited.",
              renderer: { type: "text", value: "Command had already exited." },
            };
          case "killed":
            return {
              content: "Command was already killed.",
              renderer: { type: "text", value: "Command was already killed." },
            };
          case "timedOut":
            return {
              content: "Command killed by timeout.",
              renderer: { type: "text", value: "Command killed by timeout." },
            };
          default: {
            let eA = eu;
            throw Error(
              `Unknown background terminal status: ${JSON.stringify(eA)}`,
            );
          }
        }
      }
      isSupportAskUserQuestion() {
        let eA = this.capabilities?._meta,
          el = eA?.["codebuddy.ai"];
        return el?.question === !0;
      }
      async callAskUserQuestion(eA, el, ec) {
        let eu = this.getConnection(),
          ed = this.resolveAcpSessionId(el),
          ep = ec?.toolCall?.callId;
        if (!ep) throw Error("No tool call ID found for AskUserQuestion");
        try {
          let el = {
              sessionId: ed,
              toolCallId: ep,
              inputType: "question",
              schema: {
                questions: eA.questions.map((eA, el) => ({
                  id: `q_${el}`,
                  question: eA.question,
                  header: eA.header,
                  options: eA.options,
                  multiSelect: eA.multiSelect,
                })),
              },
            },
            ec = await eu.extMethod(ne.ExtensionMethod.QUESTION, el);
          if ("submitted" !== ec.outcome || !ec.answers)
            return {
              content: "User declined to answer questions",
              renderer: { type: "text" },
            };
          {
            let el = new Map(
                eA.questions.map((eA, el) => [`q_${el}`, eA.question]),
              ),
              eu = {};
            for (let [eA, ed] of Object.entries(ec.answers))
              eu[el.get(eA) || eA] = Array.isArray(ed) ? ed.join(", ") : ed;
            return {
              content: Object.entries(eu)
                .map(([eA, el]) => ` \xb7 ${eA} ${nw.default.arrowRight} ${el}`)
                .join("\n"),
              renderer: { type: "text" },
            };
          }
        } catch (el) {
          let eA = el instanceof Error ? el.message : String(el);
          return {
            content: "User declined to answer questions",
            error: `Error asking user question: ${eA}`,
            renderer: { type: "text" },
          };
        }
      }
      stripCommonPrefix(eA, el) {
        let ec = 0;
        for (; ec < eA.length && ec < el.length && eA[ec] === el[ec]; ) ec++;
        return el.slice(ec);
      }
      formatToolCommandOutput(eA, el) {
        let { exitStatus: ec, output: eu, truncated: ed } = el,
          ep = "";
        switch (eA) {
          case "started":
          case "exited":
            ec &&
              (ec.exitCode ?? null) === null &&
              (ep += "Interrupted by the user. ");
            break;
          case "killed":
            ep += "Killed. ";
            break;
          case "timedOut":
            ep += "Timed out. ";
            break;
          case "aborted":
            break;
          default: {
            let el = eA;
            throw Error(`Unknown status: ${el}`);
          }
        }
        return (
          ec
            ? ("number" == typeof ec.exitCode &&
                (ep += `Exited with code ${ec.exitCode}. `),
              "string" == typeof ec.signal &&
                (ep += `Signal \`${ec.signal}\`. `),
              (ep += "Final output:\n\n"))
            : (ep += "New output:\n\n"),
          (ep += eu),
          ed &&
            (ep += `

Command output was too long, so it was truncated to ${eu.length} bytes.`),
          ep
        );
      }
    };
    return n_;
  })();
  const TelemetryUtils = (() => {
    const Ac = load(69466);
    const eT = load(80699);
    let TelemetryUtils = class TelemetryUtils {
      static getInputLength(eA) {
        if ("string" == typeof eA) return eA.length;
        if (Array.isArray(eA))
          return eA.reduce(
            (eA, el) => eA + TelemetryUtils.getInputLengthFromItem(el),
            0,
          );
        for (let el = eA.history.length - 1; el >= 0; el--) {
          let ec = eA.history[el];
          if ("message" === ec.type && "user" === ec.role)
            return TelemetryUtils.getInputLength([ec]);
        }
        return 0;
      }
      static getInputLengthFromItem(eA) {
        let el = 0;
        if ("content" in eA && "string" == typeof eA.content)
          return el + eA.content.length;
        if ("content" in eA && Array.isArray(eA.content))
          for (let ec of eA.content) el += ec.text?.length || 0;
        return el;
      }
      static getInputType(eA) {
        return "string" == typeof eA
          ? "string"
          : Array.isArray(eA)
            ? "AgentInputItem[]"
            : "RunState";
      }
      static calculateActualTurns(eA) {
        let el = 0;
        for (let ec of eA.history)
          "message" === ec.type && "user" === ec.role && el++;
        return el;
      }
      static countToolCalls(eA) {
        let el = 0;
        for (let ec of eA.history) "function_call_result" === ec.type && el++;
        return el;
      }
      static isExecutionSuccessful(eA, el) {
        return !el && !!eA && (!("error" in eA) || !eA.error);
      }
      static async getModelInfo(eA) {
        if (!eA) return { modelId: "unknown", modelName: "unknown" };
        let el = eA.model;
        if ("string" == typeof el) {
          try {
            let eA = eT.ContainerUtil.get(Ac.AgentManager),
              ec = await eA.resolveModel(el);
            if (ec?.name) return { modelId: el, modelName: ec.name };
          } catch {}
          return { modelId: el, modelName: el };
        }
        return el && "object" == typeof el
          ? {
              modelId: el.id || "unknown",
              modelName: el.name || el.id || "unknown",
            }
          : { modelId: "unknown", modelName: "unknown" };
      }
      static getErrorInfo(eA) {
        return eA
          ? {
              errorCode: eA.code || eA.name || "unknown_error",
              errorMessage: eA.message || String(eA),
            }
          : {};
      }
      static extractMentionInfoFromPrompt(eA) {
        let el = [],
          ec = [],
          eu = [];
        if (!Array.isArray(eA))
          return { mentionContexts: el, knowledgeId: ec, knowledgeName: eu };
        for (let ed of eA) {
          let eA = ed?._meta;
          if (!eA || "object" != typeof eA) continue;
          let ep = eA.mentionType;
          if (
            ("file" === ep && el.push("file"),
            "rules" === ep && el.push("rule"),
            "ima" === eA.source)
          ) {
            el.push("knowledge");
            let ed = eA["ima.kbId"],
              ep = eA["ima.kbName"];
            ("string" == typeof ed && ed && ec.push(ed),
              "string" == typeof ep && ep && eu.push(ep));
            continue;
          }
          if ("tencent-doc" === ep || "tencent-lexiang" === ep) {
            el.push("knowledge");
            let ep = eA.docId ?? eA.fileId ?? eA.entityId,
              eg = eA.title ?? ed?.name;
            ("string" == typeof ep && ep && ec.push(ep),
              "string" == typeof eg && eg && eu.push(eg));
          }
        }
        return {
          mentionContexts: [...new Set(el)],
          knowledgeId: ec,
          knowledgeName: eu,
        };
      }
    };
    return TelemetryUtils;
  })();
  const RequestError = (() => {
    let RequestError = class RequestError extends Error {
      code;
      data;
      constructor(eA, el, ec) {
        (super(el),
          (this.code = eA),
          (this.name = "RequestError"),
          (this.data = ec));
      }
      static parseError(eA, el) {
        return new RequestError(
          -32700,
          `Parse error${el ? `: ${el}` : ""}`,
          eA,
        );
      }
      static invalidRequest(eA, el) {
        return new RequestError(
          -32600,
          `Invalid request${el ? `: ${el}` : ""}`,
          eA,
        );
      }
      static methodNotFound(eA) {
        return new RequestError(-32601, `"Method not found": ${eA}`, {
          method: eA,
        });
      }
      static invalidParams(eA, el) {
        return new RequestError(
          -32602,
          `Invalid params${el ? `: ${el}` : ""}`,
          eA,
        );
      }
      static internalError(eA, el) {
        return new RequestError(
          -32603,
          `Internal error${el ? `: ${el}` : ""}`,
          eA,
        );
      }
      static authRequired(eA, el) {
        return new RequestError(
          -32e3,
          `Authentication required${el ? `: ${el}` : ""}`,
          eA,
        );
      }
      static resourceNotFound(eA) {
        return new RequestError(
          -32002,
          `Resource not found${eA ? `: ${eA}` : ""}`,
          eA && { uri: eA },
        );
      }
      toResult() {
        return {
          error: { code: this.code, message: this.message, data: this.data },
        };
      }
      toErrorResponse() {
        return { code: this.code, message: this.message, data: this.data };
      }
    };
    return RequestError;
  })();
  return {
    Deferred: load(8461).Deferred,
    RequestError: load(38113).RequestError,
    TelemetryUtils,
    AcpToolInterceptor,
    protocol: load(22618),
    trace: load(54631),
    history: load(91364),
    getModule: load,
  };
}
