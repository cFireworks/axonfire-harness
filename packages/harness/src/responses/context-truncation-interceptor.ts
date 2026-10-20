// Native UTF-16 11097159..11101525; method bodies + explicit DI.
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
export class ContextTruncationInterceptor extends NativeResponseInterceptor {
  async intercept(eA: any): Promise<any> {
    let el: any = eA.result.error;
    if (!this.runtime.utilities.ErrorUtils.isInputLengthError(el)) return;
    let ec: any = eA.session.id,
      eu: any = eA.session.history?.length ?? 0,
      ed: any = this.extractErrorSnippet(el);
    if (
      (this.logger.info(
        `[PTL] Detected input-length error in session=${ec}, historyLen=${eu}, error="${ed}"`,
      ),
      eA.result?.__cancelNudge)
    )
      return void this.logger.info(
        `[PTL] Skip recovery - result is a cancel-nudge re-emit, session=${ec}`,
      );
    if (eA.session.abortSignal?.aborted)
      return void this.logger.info(
        `[PTL] Skip recovery - session ${ec} was cancelled (abortSignal.aborted=true)`,
      );
    let ep: any = this.runtime.utilities.HistoryTruncateUtils.countPtlRetries(
      eA.session.history,
    );
    if (
      (this.logger.info(
        `[PTL] session=${ec} ptlRetryCount=${ep}/${this.runtime.utilities.MAX_PTL_RETRIES}`,
      ),
      ep >= this.runtime.utilities.MAX_PTL_RETRIES)
    )
      return void this.logger.warn(
        `[PTL] Max retries (${ep}/${this.runtime.utilities.MAX_PTL_RETRIES}) reached in session ${ec}, surfacing error to user`,
      );
    let eg: any = eA.result?.lastAgent?.name === "compact";
    if (eA.session.isCompressing && eg)
      return void this.logger.info(
        `[PTL] Skip recovery - session ${ec} is compact agent's own PTL (will be handled by compact caller)`,
      );
    if (eA.session.isCompressing)
      return (
        this.logger.info(
          `[PTL] Continue run PTL during compaction — falling back to deterministic truncation (session=${ec})`,
        ),
        this.truncateAndRetryAfterPtl(eA, el, "continue-ptl-during-compact")
      );
    this.logger.info(
      `[PTL] Phase A begin: compactAndSummarize(force=true) session=${ec}`,
    );
    try {
      let eu: any = await this.contextCompactSummarizer.compactAndSummarize(
        eA.session,
        { force: !0, skipContinue: !1, type: CompactType.EMERGENCY_AUTO },
      );
      if (
        (this.logger.info(
          `[PTL] Phase A compact returned, compacted=${eu}, historyLen=${eA.session.history.length}`,
        ),
        eu)
      )
        return (
          this.logger.info(
            `[PTL] Phase A SUCCESS: session=${ec} compacted + continue dispatched`,
          ),
          !0
        );
      if (
        this.shouldSurfacePtlWithoutDeterministicFallback(eA, "phase-a-false")
      )
        return;
      return (
        this.logger.warn(
          `[PTL] Phase A: compactAndSummarize returned false for session=${ec}, trying deterministic truncation fallback`,
        ),
        this.truncateAndRetryAfterPtl(eA, el, "phase-a-false")
      );
    } catch (ed: any) {
      let eu: any =
        ed instanceof Error
          ? `${ed.message}
${ed.stack ?? ""}`
          : String(ed);
      return (
        this.logger.warn(
          `[PTL] Phase A: compactAndSummarize threw for session=${ec}, trying deterministic truncation fallback: ${eu}`,
        ),
        this.truncateAndRetryAfterPtl(eA, el, "phase-a-throw", ed)
      );
    }
  }
  shouldSurfacePtlWithoutDeterministicFallback(eA: any, el: any): any {
    return eA.session.meta?.compactLimitReached
      ? (this.logger.warn(
          `[PTL] ${el}: compact limit reached, not running deterministic fallback (session=${eA.session.id})`,
        ),
        !0)
      : !!(
          eA.session.meta?.compactBlockedByPendingInterruption ||
          eA.session.interruptionSubject?.value
        ) &&
          (this.logger.warn(
            `[PTL] ${el}: pending approval exists, not running deterministic fallback (session=${eA.session.id})`,
          ),
          !0);
  }
  async truncateAndRetryAfterPtl(
    eA: any,
    el: any,
    ec: any,
    eu?: any,
  ): Promise<any> {
    let {
        gap: ed,
        actualTokens: ep,
        limitTokens: eg,
      } = this.runtime.utilities.PtlErrorUtils.parsePromptTooLongTokenCounts(
        el,
      ),
      eh: any = eA.session.history.length,
      ef: any =
        this.runtime.utilities.HistoryTruncateUtils.truncateHeadByTokenGap(
          eA.session.history,
          ed,
        );
    if (!ef)
      return void this.logger.warn(
        `[PTL] ${ec}: deterministic truncation failed, session=${eA.session.id}, historyLen=${eh}, actual=${ep ?? "?"}, limit=${eg ?? "?"}` +
          (eu
            ? `, cause=${eu instanceof Error ? eu.message : String(eu)}`
            : ""),
      );
    ((eA.session.history.length = 0), eA.session.history.push(...ef));
    let em: any = this.stateMachine.getSnapshot(eA.session).status;
    (this.stateMachine.isBusy(eA.session) &&
      this.logger.info(
        `[PTL] ${ec}: force idling session from status='${em}' before retry`,
      ),
      this.stateMachine.forceIdle(eA.session, `ptl-recovery-${ec}`));
    let eE: any = eh - ef.length,
      eC: any =
        `<system-reminder data-role="error-recovery">${this.runtime.utilities.PTL_RETRY_MARKER} The previous request exceeded the model context limit. Removed ${eE} older history item(s) and retrying with the remaining context.` +
        (ep && eg ? ` Token usage: ${ep}/${eg}.` : "") +
        "</system-reminder>",
      ey: any = this.runtime.utilities.InputItemUtils.createUserMessage(eC, {
        skipRun: !1,
      });
    ((ey.providerData = {
      ...ey.providerData,
      isCompactInternal: !0,
      isPtlRecovery: !0,
      isPtlRetryMarker: !0,
    }),
      this.logger.info(
        `[PTL] ${ec}: truncated ${eE} item(s), remaining=${ef.length}, gap=${ed ?? "unknown"}, session=${eA.session.id}`,
      ));
    let ew: any = this.runtime.getAgentService();
    return (await ew.runDefault([ey], { context: eA.session }), !0);
  }
  extractErrorSnippet(eA: any): any {
    let el: any =
      eA?.message ??
      eA?.error?.message ??
      eA?.details ??
      ("string" == typeof eA ? eA : "");
    return (("string" == typeof el ? el : JSON.stringify(el)) || "")
      .slice(0, 200)
      .replace(/\s+/g, " ");
  }
}
