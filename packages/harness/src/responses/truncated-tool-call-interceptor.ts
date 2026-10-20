// Native UTF-16 11111362..11112484; method bodies + explicit DI.
import * as rB from "node:path";
import { CompactType } from "../context/compact-config.js";
import { TRUNCATION_RETRY_MARKER } from "../runner/history-repair.js";
import {
  NativeResponseInterceptor,
  MediaContentErrorType as tk,
  TEXTUAL_TOOL_CALL_RETRY_MARKER as rS,
} from "./response-interceptor-runtime.js";
const r_ = { TRUNCATION_RETRY_MARKER },
  rM = 11136;
export class TruncatedToolCallInterceptor extends NativeResponseInterceptor {
  async intercept(eA: any): Promise<any> {
    if (
      eA.session.abortSignal.aborted ||
      "length" !== eA.modelResponseMetadata?.finishReason
    )
      return;
    let el: any = this.findTruncatedToolCalls(eA.result);
    0 !== el.length &&
      (this.logger.info(
        `[TruncatedToolCallInterceptor] Found ${el.length} truncated tool call(s) in session ${eA.session.id} (finish_reason=length), marking as discarded`,
      ),
      this.discardTruncatedToolCallsInHistory(eA.session.history, el),
      eA.session.meta || (eA.session.meta = {}),
      (eA.session.meta.lastTruncatedToolNames = el.map((eA: any) => eA.name)));
  }
  findTruncatedToolCalls(eA: any): any {
    let el: any = [];
    if (!eA?.newItems) return el;
    for (let ec of eA.newItems) {
      let eA: any = ec?.rawItem;
      eA?.type === "function_call" &&
        eA?.arguments &&
        !this.isValidJson(eA.arguments) &&
        el.push({
          name: eA.name || "unknown",
          callId: eA.callId || "",
          arguments: eA.arguments,
        });
    }
    return el;
  }
  discardTruncatedToolCallsInHistory(eA: any, el: any): any {
    let ec: any = new Set(el.map((eA: any) => eA.callId).filter(Boolean));
    if (0 !== ec.size)
      for (let el of eA)
        "function_call" === el.type &&
          ec.has(el.callId) &&
          (el.providerData || (el.providerData = {}),
          (el.providerData.discard = !0));
  }
  isValidJson(eA: any): any {
    if (!eA || "string" != typeof eA) return !1;
    try {
      return (JSON.parse(eA), !0);
    } catch {
      return !1;
    }
  }
}
