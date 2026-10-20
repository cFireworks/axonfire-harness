// Native ErrorUtils enum, predicates and mapping; production config is explicit DI.
export const ServerErrorCode = (() => {
  let eu: any = {};
  (function (eA: any): any {
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
      (eA[(eA.ConversationChatTooMany = 14002)] = "ConversationChatTooMany"),
      (eA[(eA.RateLimitError = 14003)] = "RateLimitError"),
      (eA[(eA.UsageLimitExceededEnterprise = 14012)] =
        "UsageLimitExceededEnterprise"),
      (eA[(eA.UsageLimitExceededTencent = 14013)] =
        "UsageLimitExceededTencent"),
      (eA[(eA.UsageLimitEnterpriseExhausted = 14014)] =
        "UsageLimitEnterpriseExhausted"),
      (eA[(eA.UsageLimitLicenseExpired = 14015)] = "UsageLimitLicenseExpired"),
      (eA[(eA.UsageLimitEnterpriseNotActivated = 14016)] =
        "UsageLimitEnterpriseNotActivated"),
      (eA[(eA.UsageLimitUserNotActivated = 14017)] =
        "UsageLimitUserNotActivated"),
      (eA[(eA.UsageLimitUserExhausted = 14018)] = "UsageLimitUserExhausted"),
      (eA[(eA.ConversationLimitExceeded = 10105)] =
        "ConversationLimitExceeded"),
      (eA[(eA.WebSearchRateLimit = 15001)] = "WebSearchRateLimit"));
  })(eu);
  return eu;
})();
export function createResponseErrorUtils(
  getCurrentConfiguration: () => any = () => ({}),
) {
  const eu = ServerErrorCode;
  let eC: any = eu.CraftRateLimit,
    ey: any = eu.CraftRateRPDLimit,
    ew: any = new Set([eu.RateLimitError]),
    eB: any = new Set([
      eu.UsageLimitExceeded,
      eu.UsageLimitExceededEnterprise,
      eu.UsageLimitExceededTencent,
      eu.UsageLimitEnterpriseExhausted,
      eu.UsageLimitUserExhausted,
    ]),
    e_: any = new Set([...ew, ...eB]),
    eI: any = "Interrupted by user";
  function isRecordValue(eA: any): any {
    return !!eA && "object" == typeof eA && !Array.isArray(eA);
  }
  function getErrorMessage(eA: any): any {
    if (eA instanceof Error) return eA.message;
    try {
      return String(eA);
    } catch {
      return "Failed to get error details";
    }
  }
  function toNumber(eA: any): any {
    if ("number" == typeof eA && !isNaN(eA)) return eA;
    if ("string" == typeof eA && "" !== eA.trim()) {
      let el: any = Number(eA);
      return isNaN(el) ? void 0 : el;
    }
  }
  function safeParseJson(eA: any): any {
    try {
      return JSON.parse(eA);
    } catch {
      return;
    }
  }
  function extractBizCode(eA: any, el: any = 4): any {
    if (!isRecordValue(eA) || el <= 0) return;
    let ec: any = extractBizCode(eA.error, el - 1);
    if (void 0 !== ec) return ec;
    let eu: any = isRecordValue(eA.response) ? eA.response : void 0,
      ed: any = extractBizCode(eu?.data, el - 1);
    if (void 0 !== ed) return ed;
    let ep: any = eA.code;
    return "number" != typeof ep || isNaN(ep)
      ? "string" == typeof ep && /^\d+$/.test(ep)
        ? Number(ep)
        : void 0
      : ep;
  }
  function getHttpStatusCode(eA: any): any {
    if (!isRecordValue(eA)) return;
    let el: any = toNumber(eA.statusCode) ?? toNumber(eA.status);
    if (void 0 !== el) return el;
    let ec: any = toNumber(eA.response?.status);
    if (void 0 !== ec) return ec;
  }
  function getResponseBody(eA: any): any {
    if (!isRecordValue(eA)) return;
    let el: any = eA.responseBody;
    if (void 0 !== el) return el;
    let ec: any = eA.response?.data;
    if (void 0 !== ec) return ec;
  }
  function extractBizCodeFromResponseBody(eA: any, el: any): any {
    let ec: any = parseResponseBodyObject(eA);
    return void 0 !== ec.code && 0 !== ec.code ? ec.code : el || 0;
  }
  function extractRateLimitBizCode(eA: any, el: any): any {
    let ec: any = parseResponseBodyObject(eA);
    return void 0 !== ec.errorDataCode
      ? ec.errorDataCode
      : void 0 !== ec.errorCode
        ? ec.errorCode
        : void 0 !== ec.code && 0 !== ec.code
          ? ec.code
          : el;
  }
  function parseResponseBodyObject(eA: any): any {
    let el: any,
      ec: any,
      eu: any = eA;
    if ("string" == typeof eu)
      try {
        eu = JSON.parse(eu);
      } catch {
        return { code: void 0, errorCode: void 0, errorDataCode: void 0 };
      }
    if (!isRecordValue(eu))
      return { code: void 0, errorCode: void 0, errorDataCode: void 0 };
    let ed: any = toNumber(eu.code),
      ep: any = eu.error;
    if (isRecordValue(ep)) {
      el = toNumber(ep.code);
      let eA: any = ep.data;
      isRecordValue(eA) && (ec = toNumber(eA.code));
    }
    return { code: ed, errorCode: el, errorDataCode: ec };
  }
  function isSpecialError10008(eA: any): any {
    let el: any = eA;
    if ("string" == typeof el)
      try {
        el = JSON.parse(el);
      } catch {
        return !1;
      }
    return isRecordValue(el) && 10008 === toNumber(el.code);
  }
  function isCustomModelAPIKeyError(eA: any): any {
    if (!isRecordValue(eA) || 401 !== toNumber(eA.statusCode)) return !1;
    let el: any = eA.url;
    if ("string" != typeof el || !el) return !1;
    let ec: any = [];
    try {
      let eA: any = getCurrentConfiguration();
      for (let el of [eA?.endpoint, eA?.stagingEndpoint])
        if (el)
          try {
            ec.push(new URL(el).hostname);
          } catch {}
    } catch {}
    return !ec.some((eA: any) => el.includes(eA));
  }
  function isNetworkConnectionError(eA: any): any {
    if (!isRecordValue(eA)) return !1;
    let el: any = eA.message,
      ec: any = eA.code;
    if ("string" == typeof el || "string" == typeof ec) {
      let eA: any = `${el || ""} ${ec || ""}`;
      return /ECONNRESET|ECONNREFUSED|ENOTFOUND|socket hang up|network/i.test(
        eA,
      );
    }
    return !1;
  }
  function isTimeoutError(eA: any): any {
    if (!isRecordValue(eA)) return !1;
    if ("TimeoutError" === eA.name) return !0;
    let el: any = eA.code;
    if ("string" == typeof el) {
      let eA: any = el.toLowerCase();
      if ("etimedout" === eA || "timeout" === eA) return !0;
    }
    let ec: any = eA.message;
    if ("string" == typeof ec) {
      let eA: any = ec.toLowerCase();
      return (
        eA.includes("timeout") ||
        eA.includes("timed out") ||
        eA.includes("time exceeded")
      );
    }
    return !1;
  }
  function isUnauthorizedError(eA: any): any {
    if (!isRecordValue(eA)) return !1;
    if ("Unauthorized" === eA.name) return !0;
    let el: any = eA.code;
    if ("string" == typeof el) {
      let eA: any = el.toLowerCase();
      if (
        "unauthorized" === eA ||
        "authentication failed" === eA ||
        "authorization failed" === eA
      )
        return !0;
    }
    let ec: any = eA.message;
    if ("string" == typeof ec) {
      let eA: any = ec.toLowerCase();
      return (
        eA.includes("unauthorized") ||
        eA.includes("authentication failed") ||
        eA.includes("authorization failed") ||
        eA.includes("ai_apicallerror: unauthorized")
      );
    }
    try {
      let el: any = eA.toString?.()?.toLowerCase?.();
      if (el?.includes("ai_apicallerror: unauthorized")) return !0;
    } catch {}
    return !1;
  }
  function isStreamErrorByOtherPlugin(eA: any): any {
    if (!isRecordValue(eA)) return !1;
    let el: any = eA.message;
    return (
      "string" == typeof el &&
      el.includes("Failed to process successful response")
    );
  }
  function getFallbackCode(eA: any): any {
    if (!isRecordValue(eA)) return "10006";
    let el: any = eA.code;
    return null != el && "" !== el ? String(el) : "10006";
  }
  return {
    extractBizCode,
    isModelOverloadedError: function (eA: any): any {
      if (!eA) return !1;
      let el: any = [eA, eA?.error];
      for (let ec of [
        eA?.message,
        eA?.error?.message,
        eA?.details,
        eA?.error?.details,
      ])
        if ("string" == typeof ec) {
          let eA: any = safeParseJson(ec);
          eA &&
            "object" == typeof eA &&
            (el.push(eA),
            eA.error && el.push(eA.error),
            eA.data && el.push(eA.data));
        }
      for (let eA of el) {
        if (!eA || "object" != typeof eA) continue;
        let el: any = toNumber(eA.status) ?? toNumber(eA.statusCode),
          ec: any = toNumber(eA.code);
        if (
          429 === el ||
          (void 0 !== ec && ((ec >= eC && ec <= ey) || e_.has(ec)))
        )
          return !0;
        let eu: any = [eA.message, eA.details, eA.msg, eA.type]
          .filter((eA: any) => "string" == typeof eA)
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
    },
    isQuotaExhaustedError: function (eA: any): any {
      if (!eA) return !1;
      let el: any = [eA, eA?.error];
      for (let ec of [
        eA?.message,
        eA?.error?.message,
        eA?.details,
        eA?.error?.details,
      ])
        if ("string" == typeof ec) {
          let eA: any = safeParseJson(ec);
          eA &&
            "object" == typeof eA &&
            (el.push(eA),
            eA.error && el.push(eA.error),
            eA.data && el.push(eA.data));
        }
      for (let eA of el) {
        if (!eA || "object" != typeof eA) continue;
        let el: any = toNumber(eA.code);
        if (void 0 !== el && eB.has(el)) return !0;
        let ec: any = [eA.message, eA.details, eA.msg]
          .filter((eA: any) => "string" == typeof eA)
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
    },
    isInputLengthError: function (eA: any): any {
      if (!eA) return !1;
      let el: any = [],
        visit: any = (eA: any) => {
          if (eA) {
            if ("string" == typeof eA) return void el.push(eA);
            ("string" == typeof eA.message && el.push(eA.message),
              "string" == typeof eA.details && el.push(eA.details),
              eA.error && visit(eA.error),
              eA.data && visit(eA.data));
          }
        };
      visit(eA);
      let ec: any = el.join(" | ").toLowerCase();
      return (
        !!ec &&
        (ec.includes("input length too long") ||
          ec.includes("prompt is too long") ||
          ec.includes("maximum context length") ||
          /input\s*(?:length|tokens?)[^0-9]*\d+[^0-9]+exceeds/.test(ec))
      );
    },
    mapMessageErrorCode: function (eA: any): any {
      if (!eA) return "";
      let el: any = getHttpStatusCode(eA),
        ec: any = getResponseBody(eA);
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
    },
  };
}
