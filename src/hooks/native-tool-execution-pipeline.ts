import type { HookLifecycleRuntime } from "./hook-lifecycle-runtime.js";
import { PermissionDeniedError } from "../tools/native-tool-errors.js";
import { ToolResult } from "../tools/tool-result.js";
const nC = { PermissionDeniedError, ToolResult };
// Selected complete methods from ToolManager 11657350..11681925.
export class NativeToolExecutionPipeline {
  [key: string]: any;
  constructor(readonly runtime: HookLifecycleRuntime) {
    Object.assign(this, runtime.dependencies);
  }
  getPlainToolInput(eA: any): any {
    let el: any = eA && "object" == typeof eA && "value" in eA ? eA.value : eA;
    return el && "object" == typeof el ? el : {};
  }
  async executeToolWithHooks(
    eA: any,
    el: any,
    ec: any,
    eu: any,
    ed: any,
  ): Promise<any> {
    let ep: any,
      eg: any,
      eh: any,
      ef: any = ed?.toolCall?.callId,
      em: any = this.runtime.now();
    this.logger.info?.(
      `[ToolManager] execute | tool=${eA.name} | callId=${ef ?? "none"}`,
    );
    let eE: any = eu?.context;
    if (!eE) {
      let ep: any = this.tryInterceptTool(eA.name, ec, eu, ed);
      return ep || el(ec, eu, ed);
    }
    let eC: any = this.sessionStore.getSessionFilePath(eE.id),
      ey: any = this.getPlainToolInput(ec),
      ew: any = ef ? eE.preToolUseHookResults?.get(ef) : void 0;
    if (ew) eE.preToolUseHookResults.delete(ef);
    else if (ef)
      try {
        ("1" === this.runtime.env.CODEBUDDY_DEBUG_PRETOOLUSE &&
          this.runtime.consoleError(
            `[PreToolUse:fire@executeToolWithHooks] tool=${eA.name} sessionId=${eE.id} storeId=${eE.storeId ?? "-"} agentName=${eE.agentName ?? "-"} callId=${ef} cacheKeys=${Array.from(eE.preToolUseHookResults?.keys() ?? []).join(",") || "∅"}`,
          ),
          (ew = await this.toolHookManager.executePreToolUseHooks(
            eA.name,
            ey,
            eE,
            eC,
            this.runtime.utilities.PathUtils.getWorkDir(),
            ef,
          )));
      } catch (eA: any) {
        this.logger.error(
          "PreToolUse hook execution failed in executeToolWithHooks:",
          eA,
        );
      }
    if (ew) {
      if (!ew.allowed) {
        this.logger.info(`Tool ${eA.name} blocked by PreToolUse hook`);
        let el: any = ew.message || "Operation blocked";
        throw new nC.PermissionDeniedError(eA.name, el);
      }
      (ew.modifiedInput &&
        ((ec =
          "object" == typeof ec && "object" == typeof ew.modifiedInput
            ? "value" in ec && "object" == typeof ec.value && null !== ec.value
              ? { ...ec, value: { ...ec.value, ...ew.modifiedInput } }
              : { ...ec, ...ew.modifiedInput }
            : ew.modifiedInput),
        (ey = this.getPlainToolInput(ec))),
        ew.message &&
          this.logger.info(`PreToolUse hook message: ${ew.message}`));
    }
    let eB: any = this.checkIdeInputTransformation(eA.name, ec, eu, ed);
    eB && ((ec = eB), (ey = this.getPlainToolInput(ec)));
    try {
      let eg: any = await this.sandboxWriteRuleGuard?.prepareWrite(
          eA.name,
          ey,
          eE,
          ed,
        ),
        eC: any = this.tryInterceptTool(eA.name, ec, eu, ed);
      if (
        (eC
          ? (ep = await eC)
          : ((eh = await this.createFileBackupBeforeExecute(
              eA.name,
              ey,
              eE,
              ed,
            )),
            (ep = await el(ec, eu, ed)),
            this.reportMcpToolCapabilityCall(eA.name, eE)),
        await eg?.afterSuccess(),
        ep && nC.ToolResult.is(ep))
      )
        try {
          let el: any = this.runtime.getPaymentInterceptor(),
            ec: any = await el.scan(eA, ep, eu, ed);
          ec && (ep = ec);
        } catch {}
      this.logger.info?.(
        `[ToolManager] execute OK | tool=${eA.name} | callId=${ef ?? "none"} | elapsed=${this.runtime.now() - em}ms`,
      );
    } catch (el: any) {
      if (
        (this.logger.error?.(
          `[ToolManager] execute FAILED | tool=${eA.name} | callId=${ef ?? "none"} | elapsed=${this.runtime.now() - em}ms`,
          el,
        ),
        (eg = el),
        ef && eE._toolSpans)
      ) {
        let eA: any = eE._toolSpans.get(ef);
        if (eA)
          try {
            (eA.markAsFailed(el instanceof Error ? el : Error(String(el))),
              eE._toolSpans.delete(ef));
          } catch {}
      }
    }
    if (!eg && ep) {
      let el: any = this.extractRawResponse(eA, ep),
        ec: any = await this.toolHookManager.executePostToolUseHooks(
          eA.name,
          ey,
          el,
          eE,
          eC,
          this.runtime.utilities.PathUtils.getWorkDir(),
          ef,
        );
      if (
        (ec.message &&
          this.logger.info(`PostToolUse hook message: ${ec.message}`),
        ec.additionalContext &&
          (this.logger.info("PostToolUse hook provided additional context"),
          nC.ToolResult.is(ep)))
      ) {
        let eA: any = `
<system-reminder data-role="tool-hint">${ec.additionalContext}</system-reminder>`;
        if ("string" == typeof ep.content) ep.content += eA;
        else {
          let el: any = String(ep.content || "");
          ep.content = el + eA;
        }
      }
    } else if (eg) {
      let el: any = eg,
        ec: any =
          el?.name === "AbortError" ||
          el?.code === "ABORT_ERR" ||
          eE.abortSignal?.aborted;
      try {
        let el: any = await this.toolHookManager.executePostToolUseFailureHooks(
          eA.name,
          ey,
          eg,
          eE,
          eC,
          this.runtime.utilities.PathUtils.getWorkDir(),
          ef,
          !!ec,
        );
        if (el.additionalContext) {
          this.logger.info(
            "PostToolUseFailure hook provided additional context",
          );
          let eA: any = `
<system-reminder data-role="tool-hint">${el.additionalContext}</system-reminder>`;
          eg instanceof Error
            ? (eg.message = `${eg.message}${eA}`)
            : this.logger.info(
                `PostToolUseFailure additionalContext (toolError not Error): ${eA}`,
              );
        }
      } catch (eA: any) {
        this.logger.error("PostToolUseFailure hook execution failed:", eA);
      }
    }
    if (
      !eg &&
      ep &&
      (await this.injectConditionalRules(eA.name, ey, eE, ep),
      eh &&
        (await this.checkpointService.createCheckpoint(eE, {
          isSnapshotUpdate: !0,
        })),
      "Bash" === eA.name || "PowerShell" === eA.name)
    )
      try {
        let eA: any = this.runtime.getCwd();
        eE.meta || (eE.meta = {});
        let el: any =
          eE.meta.lastKnownCwd ?? this.runtime.utilities.PathUtils.getWorkDir();
        eA !== el &&
          ((eE.meta.lastKnownCwd = eA),
          await this.sessionHookManager.executeCwdChangedHooks(eE, {
            oldCwd: el,
            newCwd: eA,
          }));
      } catch (eA: any) {
        this.logger.debug?.(`CwdChanged hook dispatch failed: ${eA}`);
      }
    if (eg) throw eg;
    return ep;
  }
  extractRawResponse(eA: any, el: any): any {
    return eA.extractRawResponse
      ? eA.extractRawResponse(el)
      : nC.ToolResult.is(el) && void 0 !== el.rawResponse
        ? el.rawResponse
        : nC.ToolResult.is(el)
          ? el.content
          : el;
  }
}
