// Native UTF-16 11102390..11106192; method bodies + explicit DI.
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
export class finishReasonErrorInterceptor extends NativeResponseInterceptor {
  static MAX_LENGTH_RETRIES = 2;
  static RETRY_CHECK_WINDOW = 15;
  async intercept(eA: any): Promise<any> {
    if (eA.session.abortSignal.aborted) return;
    let el: any = eA?.modelResponseMetadata?.finishReason;
    if (
      (this.telemetryService.recordCreditRefundConversationRequestEnd(
        eA.session,
        el,
      ),
      "tool_calls" === el || "tool-calls" === el)
    )
      if (this.shouldSkipExpectedSubagentToolCalls(eA))
        this.telemetryService.suppressCreditRefundConversationRequest(
          eA.session,
        );
      else
        try {
          await this.telemetryService.reportUserTaskFailedCreditRefund(
            eA.session,
            "abnormal_finish_reason",
          );
        } catch (eA: any) {
          this.logger.warn(
            "Failed to report credit refund abnormal finish_reason telemetry:",
            eA,
          );
        }
    if ("length" === el) {
      try {
        this.telemetryService.reportChatMaxTokenReached(
          eA.session,
          eA.modelResponseMetadata?.model,
        );
      } catch (eA: any) {
        this.logger.warn(
          "Failed to report chat max token reached telemetry:",
          eA,
        );
      }
      return this.handleLengthFinishReason(eA);
    }
    let ec: any = "";
    switch (el) {
      case "content_filter":
      case "content-filter":
        break;
      case null:
      case void 0:
      case "":
        eA.session.meta?.userInitiatedAbort &&
          delete eA.session.meta.userInitiatedAbort;
        return;
      case "error":
        ec =
          'Model service internal error, please enter "continue" or run /clear to retry.';
    }
    if (ec) {
      let el: any =
          this.runtime.utilities.InputItemUtils.createAssistantMessage(ec, {
            status: "incomplete",
            skipRun: !0,
          }),
        eu: any = this.runtime.getAgentService();
      await eu.runDefault([el], { context: eA.session });
    }
  }
  shouldSkipExpectedSubagentToolCalls(eA: any): any {
    return (
      !!this.runtime.utilities.SessionUtils.isSubAgent(eA.session) &&
      this.runtime.utilities.ErrorUtils.extractBizCode(
        eA.result?.error ?? eA.result,
      ) === this.runtime.utilities.ServerErrorCode.CraftRateTPDLimit
    );
  }
  async handleLengthFinishReason(eA: any): Promise<any> {
    let el: any = this.countRecentLengthRetries(
      this.runtime.utilities.HistoryUtils.getActiveAgentOnlyHistory(
        eA.session.history,
      ),
    );
    if (el >= finishReasonErrorInterceptor.MAX_LENGTH_RETRIES) {
      this.logger.info(
        `[finishReasonErrorInterceptor] Max retries (${el}/${finishReasonErrorInterceptor.MAX_LENGTH_RETRIES}) reached in session ${eA.session.id}, stopping`,
      );
      let ec: any =
          "Response was repeatedly truncated due to length limit. The operation is too large for a single response. Please try breaking the task into smaller steps manually.",
        eu: any = this.runtime.utilities.InputItemUtils.createAssistantMessage(
          ec,
          { status: "incomplete", skipRun: !0 },
        ),
        ed: any = this.runtime.getAgentService();
      await ed.runDefault([eu], { context: eA.session });
      return;
    }
    try {
      this.logger.info(
        `[finishReasonErrorInterceptor] Length limit reached in session ${eA.session.id}, retry ${el + 1}/${finishReasonErrorInterceptor.MAX_LENGTH_RETRIES}`,
      );
      let ec: any = eA.session.meta?.lastTruncatedToolNames,
        eu: any = this.buildRetryMessage(ec),
        ed: any = this.runtime.getAgentService();
      return (await ed.runDefault(eu, { context: eA.session }), !0);
    } catch (ed: any) {
      this.logger.warn(
        "[finishReasonErrorInterceptor] Failed to handle length finish reason:",
        ed,
      );
      let el: any =
          "Response was truncated due to length limit. Please try again.",
        ec: any = this.runtime.utilities.InputItemUtils.createAssistantMessage(
          el,
          { status: "incomplete", skipRun: !0 },
        ),
        eu: any = this.runtime.getAgentService();
      await eu.runDefault([ec], { context: eA.session });
    }
  }
  buildRetryMessage(eA: any): any {
    let el: any = {
        Write:
          "Instead of writing the entire file, use multiple Edit calls to make changes incrementally.",
        MultiEdit:
          "Split into multiple separate Edit calls, each modifying one section at a time.",
        Edit: "Use a smaller old_string with minimal surrounding context and keep new_string focused.",
        Bash: "Break it into multiple shorter commands executed sequentially.",
      },
      ec: any = [
        "Your previous response was truncated due to output length limits.",
        "",
      ],
      eu: any = new Set();
    if (eA)
      for (let ed of eA) {
        let eA: any = el[ed];
        eA && !eu.has(eA) && (ec.push(`${ed}: ${eA}`), eu.add(eA));
      }
    return (
      0 === eu.size &&
        ec.push("Break the operation into multiple smaller tool calls."),
      ec.push(""),
      ec.push(r_.TRUNCATION_RETRY_MARKER),
      ec.join("\n")
    );
  }
  countRecentLengthRetries(eA: any): any {
    let el: any = eA.slice(-finishReasonErrorInterceptor.RETRY_CHECK_WINDOW),
      ec: any = 0;
    for (let eA of el) {
      let el: any = eA;
      if ("user" === el.role && el.content)
        try {
          let eA: any =
            "string" == typeof el.content
              ? el.content
              : JSON.stringify(el.content);
          (eA.includes(r_.TRUNCATION_RETRY_MARKER) ||
            eA.includes("truncated due to output length limits")) &&
            ec++;
        } catch {}
    }
    return ec;
  }
}
