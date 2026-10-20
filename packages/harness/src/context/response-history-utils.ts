import { createResponseInputUtils } from "../sessions/response-input-utils.js";
import { TokenUtils } from "./token-utils.js";
export { TokenUtils } from "./token-utils.js";
export const PTL_RETRY_MARKER =
    "[earlier conversation truncated to fit context limit]",
  MAX_PTL_RETRIES = 3;
export function createHistoryTruncateUtils(
  InputItemUtils = createResponseInputUtils(),
) {
  const ex = { InputItemUtils },
    tn = PTL_RETRY_MARKER;
  let ed: any = {};
  (function (eA: any): any {
    function groupMessagesByApiRound(eA: any): any {
      if (0 === eA.length) return [];
      let el: any = [],
        ec: any = [];
      for (let eu of eA)
        isUserMessageStartingNewRound(eu) && ec.length > 0
          ? (el.push(ec), (ec = [eu]))
          : ec.push(eu);
      return (ec.length > 0 && el.push(ec), el);
    }
    function isUserMessageStartingNewRound(eA: any): any {
      return (
        !(
          !eA ||
          "message" !== eA.type ||
          "user" !== eA.role ||
          ex.InputItemUtils.isCustomInputItem(eA)
        ) &&
        (!!isPtlRetryMarkerItem(eA) ||
          !(
            ex.InputItemUtils.isSkipRunItem(eA) ||
            ex.InputItemUtils.isSystemTeammateMessage(eA)
          ))
      );
    }
    function isPtlRetryMarkerItem(eA: any): any {
      if (!eA || "message" !== eA.type || "user" !== eA.role) return !1;
      if (eA.providerData?.isPtlRetryMarker === !0) return !0;
      let el: any = eA.content;
      if ("string" == typeof el) return el.includes(tn);
      if (Array.isArray(el)) {
        for (let eA of el)
          if ("string" == typeof eA?.text && eA.text.includes(tn)) return !0;
      }
      return !1;
    }
    function stripLeadingPtlMarker(eA: any): any {
      if (0 === eA.length) return eA;
      let el: any = 0;
      for (; el < eA.length && isPtlRetryMarkerItem(eA[el]); ) el++;
      return 0 === el ? eA : eA.slice(el);
    }
    function estimateTokens(eA: any): any {
      let el: any = 0;
      for (let ec of eA) {
        let eA: any = "";
        try {
          eA = JSON.stringify(ec);
        } catch {
          eA = String(ec);
        }
        el += TokenUtils.estimateTokensRough(eA);
      }
      return el;
    }
    function truncateWithinSingleGroup(eA: any, el: any): any {
      let ec: any,
        eu: any = new Map(),
        ed: any = new Map();
      for (let el: any = 0; el < eA.length; el++) {
        let ec: any = eA[el];
        "function_call" === ec.type && ec.callId
          ? eu.set(ec.callId, { item: ec, index: el })
          : "function_call_result" === ec.type &&
            ec.callId &&
            ed.set(ec.callId, { item: ec, index: el });
      }
      let ep: any = [],
        eg: any = new Set();
      for (let [eA, el] of eu) {
        let ec: any = ed.get(eA);
        ec &&
          (ep.push({
            call: el.item,
            callIndex: el.index,
            result: ec.item,
            resultIndex: ec.index,
          }),
          eg.add(el.index),
          eg.add(ec.index));
      }
      if (
        (ep.sort((eA: any, el: any) => eA.callIndex - el.callIndex),
        ep.length < 2)
      )
        return null;
      if (void 0 !== el && el > 0) {
        let eA: any = 0;
        for (let eu of ((ec = 0), ep))
          if (((eA += estimateTokens([eu.call, eu.result])), ec++, eA >= el))
            break;
      } else ec = Math.max(1, Math.floor(0.5 * ep.length));
      if ((ec = Math.min(ec, ep.length - 1)) < 1) return null;
      let eh: any = new Set();
      for (let eA: any = 0; eA < ec; eA++)
        (eh.add(ep[eA].callIndex), eh.add(ep[eA].resultIndex));
      let ef: any = eA.filter((eA: any, el: any) => !eh.has(el));
      if (0 === ef.length) return null;
      if (!isUserMessageStartingNewRound(ef[0])) {
        let eA: any = ex.InputItemUtils.createUserMessage(tn, { skipRun: !0 });
        return (
          (eA.providerData = { ...eA.providerData, isPtlRetryMarker: !0 }),
          [eA, ...ef]
        );
      }
      return ef;
    }
    ((eA.groupMessagesByApiRound = groupMessagesByApiRound),
      (eA.truncateHeadByTokenGap = function (eA: any, el: any): any {
        let ec: any;
        if (0 === eA.length) return null;
        let eu: any = groupMessagesByApiRound(stripLeadingPtlMarker(eA));
        if (eu.length < 2)
          return 1 === eu.length ? truncateWithinSingleGroup(eu[0], el) : null;
        if (void 0 !== el && el > 0) {
          let eA: any = 0;
          for (let ed of ((ec = 0), eu))
            if (((eA += estimateTokens(ed)), ec++, eA >= el)) break;
        } else ec = Math.max(1, Math.floor(0.2 * eu.length));
        if ((ec = Math.min(ec, eu.length - 1)) < 1) return null;
        let ed: any = eu.slice(ec).flat();
        if (0 === ed.length) return null;
        if (!isUserMessageStartingNewRound(ed[0])) {
          let eA: any = ex.InputItemUtils.createUserMessage(tn, {
            skipRun: !0,
          });
          return (
            (eA.providerData = { ...eA.providerData, isPtlRetryMarker: !0 }),
            [eA, ...ed]
          );
        }
        return ed;
      }),
      (eA.countPtlRetries = function (eA: any): any {
        if (0 === eA.length) return 0;
        let el: any = eA.slice(-20),
          ec: any = 0;
        for (let eA of el) isPtlRetryMarkerItem(eA) && ec++;
        return ec;
      }));
  })(ed);
  return ed;
}
export const HistoryTruncateUtils = createHistoryTruncateUtils();
export const PtlErrorUtils = (() => {
  let ew: any = {};
  (function (eA: any): any {
    function extractMessage(eA: any): any {
      if (!eA) return "";
      if ("string" == typeof eA) return eA;
      let el: any = [],
        ec: any = new Set(),
        visit: any = (eA: any) => {
          if (!eA) return;
          if ("string" == typeof eA) {
            eA.length > 0 && el.push(eA);
            return;
          }
          if ("object" != typeof eA || ec.has(eA)) return;
          ec.add(eA);
          let eu: any = eA;
          ("string" == typeof eu.message &&
            eu.message.length > 0 &&
            el.push(eu.message),
            "string" == typeof eu.details &&
              eu.details.length > 0 &&
              el.push(eu.details),
            visit(eu.error),
            visit(eu.data));
        };
      if ((visit(eA), el.length > 0)) return el.join(" | ");
      try {
        return JSON.stringify(eA);
      } catch {
        return String(eA);
      }
    }
    function toResult(eA: any, el: any): any {
      let ec: any = eA ? parseInt(eA, 10) : void 0,
        eu: any = el ? parseInt(el, 10) : void 0;
      if (void 0 === ec || void 0 === eu || isNaN(ec) || isNaN(eu)) return {};
      let ed: any = ec - eu;
      return ed <= 0 ? {} : { actualTokens: ec, limitTokens: eu, gap: ed };
    }
    eA.parsePromptTooLongTokenCounts = function (eA: any): any {
      let el: any = extractMessage(eA);
      if (!el) return {};
      {
        let eA: any = el.match(
          /prompt is too long[^0-9]*(\d+)\s*tokens?\s*>\s*(\d+)/i,
        );
        if (eA) return toResult(eA[1], eA[2]);
      }
      {
        let eA: any = el.match(
          /input length too long[^0-9]*?(\d+)[^0-9]*?(?:>|tokens?|maximum|max|limit|exceed|context)[^0-9]*?(\d+)/i,
        );
        if (eA) {
          let el: any = parseInt(eA[1], 10);
          if (el > parseInt(eA[2], 10) && el > 1e3)
            return toResult(eA[1], eA[2]);
        }
      }
      {
        let eA: any = el.match(
          /maximum context length is (\d+)\s*tokens?.*?(?:resulted in|requested)\s+(\d+)\s*tokens?/is,
        );
        if (eA) return toResult(eA[2], eA[1]);
      }
      {
        let eA: any = el.match(
          /input\s*(?:length|tokens?)[^0-9]*(\d+)[^0-9]+(?:exceeds?|over|above)[^0-9]+(\d+)/i,
        );
        if (eA) return toResult(eA[1], eA[2]);
      }
      if (/token|length|context/i.test(el)) {
        let eA: any = el.match(/(\d{4,})\s*tokens?\s*>\s*(\d{4,})/i);
        if (eA) return toResult(eA[1], eA[2]);
      }
      return {};
    };
  })(ew);
  return ew;
})();
