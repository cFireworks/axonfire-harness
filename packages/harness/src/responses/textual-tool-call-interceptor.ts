// Native UTF-16 11107081..11110592; method bodies + explicit DI.
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
export class TextualToolCallInterceptor extends NativeResponseInterceptor {
  static MAX_RETRIES = 1;
  static RETRY_CHECK_WINDOW = 15;
  static CLEAN_RETRY_ENABLED =
    "0" !== process.env.CODEBUDDY_TEXTUAL_TOOL_CALL_CLEAN_RETRY;
  static INVOKE_BLOCK_RE = /<invoke\s+name="[^"]+"\s*>[\s\S]*?<\/invoke>/;
  async intercept(eA: any): Promise<any> {
    if (eA.session.abortSignal?.aborted) return;
    let el: any = eA.modelResponseMetadata?.finishReason;
    if ("stop" !== el && "end_turn" !== el && "tool_calls" !== el) return;
    let ec: any = this.getTurnRawItems(eA);
    if (this.turnHasRealToolCall(ec)) return;
    let eu: any = this.extractTurnAssistantText(ec);
    if (!eu || !this.hasTextualToolCall(eu)) return;
    let ed: any = this.countRecentRetries(eA.session.history);
    if (ed >= TextualToolCallInterceptor.MAX_RETRIES) {
      this.logger.info(
        `[TextualToolCallInterceptor] Max retries (${ed}/${TextualToolCallInterceptor.MAX_RETRIES}) reached in session ${eA.session.id}, leaving control to the user`,
      );
      try {
        let el: any =
            "The model repeatedly wrote tool calls as plain text instead of invoking the tools, so nothing was executed. Please re-send your request (or start a new session if the conversation has grown very long).",
          ec: any =
            this.runtime.utilities.InputItemUtils.createAssistantMessage(el, {
              status: "incomplete",
              skipRun: !0,
            }),
          eu: any = this.runtime.getAgentService();
        await eu.runDefault([ec], { context: eA.session });
      } catch (eA: any) {
        this.logger.warn(
          "[TextualToolCallInterceptor] Failed to surface terminal notice:",
          eA,
        );
      }
      return;
    }
    try {
      (this.logger.info(
        `[TextualToolCallInterceptor] Detected textual tool call (finish_reason=${el}, no real tool call) in session ${eA.session.id}, retrying ${ed + 1}/${TextualToolCallInterceptor.MAX_RETRIES}`,
      ),
        TextualToolCallInterceptor.CLEAN_RETRY_ENABLED &&
          this.discardAssistantMessagesFromModelInput(ec));
      let eu: any = this.stateMachine.getSnapshot(eA.session).status;
      (this.stateMachine.isBusy(eA.session) &&
        this.logger.info(
          `[TextualToolCallInterceptor] force idling session from status='${eu}' before retry`,
        ),
        this.stateMachine.forceIdle(eA.session, "textual-tool-call-recovery"));
      let ep: any = this.runtime.getAgentService();
      return (
        await ep.runDefault(
          this.runtime.utilities.InputItemUtils.createErrorRecoveryInput(
            this.buildReminder(),
          ),
          { context: eA.session, bypassMessageQueue: !0 },
        ),
        !0
      );
    } catch (eA: any) {
      this.logger.warn(
        "[TextualToolCallInterceptor] Failed to inject recovery reminder:",
        eA,
      );
    }
  }
  getTurnRawItems(eA: any): any {
    let el: any = eA.session.history ?? [];
    for (let eA: any = el.length - 1; eA >= 0; eA--) {
      let ec: any = el[eA],
        eu: any = ec?.providerData?.messageId;
      if (ec?.type === "message" && ec?.role === "assistant" && eu)
        return el.filter((eA: any) => eA?.providerData?.messageId === eu);
    }
    return Array.isArray(eA.result?.newItems)
      ? eA.result.newItems.map((eA: any) => eA?.rawItem).filter(Boolean)
      : [];
  }
  turnHasRealToolCall(eA: any): any {
    return eA.some((eA: any) => eA?.type === "function_call");
  }
  extractTurnAssistantText(eA: any): any {
    let el: any = [];
    for (let ec of eA)
      if (ec?.type === "message" && ec?.role === "assistant") {
        let eA: any =
          this.runtime.utilities.SummaryUtils.extractTextFromAssistantContent(
            ec.content,
          );
        eA && el.push(eA);
      }
    return el.join("\n");
  }
  discardAssistantMessagesFromModelInput(eA: any): any {
    for (let el of eA)
      el?.type === "message" &&
        "assistant" === el.role &&
        (el.providerData = { ...el.providerData, discard: !0 });
  }
  hasTextualToolCall(eA: any): any {
    let el: any = eA.replace(/```[\s\S]*?```/g, "").replace(/`+[^`\n]*`+/g, "");
    return TextualToolCallInterceptor.INVOKE_BLOCK_RE.test(el);
  }
  countRecentRetries(eA: any): any {
    if (!Array.isArray(eA)) return 0;
    let el: any = eA.slice(-TextualToolCallInterceptor.RETRY_CHECK_WINDOW),
      ec: any = 0;
    for (let eA: any = el.length - 1; eA >= 0; eA--) {
      let eu: any = el[eA];
      if (eu?.type === "function_call") break;
      let ed: any = eu;
      if (ed?.role === "user" && ed.content) {
        if (
          ("string" == typeof ed.content
            ? ed.content
            : JSON.stringify(ed.content)
          ).includes(rS)
        ) {
          ec++;
          continue;
        }
        if (this.runtime.utilities.InputItemUtils.isRealUserMessageItem(ed))
          break;
      }
    }
    return ec;
  }
  buildReminder(): any {
    return [
      '<system-reminder data-role="error-recovery"> The previous response failed to produce a valid tool call. Please retry the intended tool call now using the real tool-calling channel. Do not describe, quote, or print tool-call syntax in assistant text. Resume directly — no apology, no recap of what you were doing.',
      rS,
      "</system-reminder>",
    ].join(" ");
  }
}
