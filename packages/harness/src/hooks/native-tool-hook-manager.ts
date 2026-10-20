import { HookEvent, HookBlockedError } from "./hook-constants.js";
import type { HookLifecycleRuntime } from "./hook-lifecycle-runtime.js";
const Ah = { HookEvent, HookBlockedError },
  l1 = Ah;
// Native UTF-16 11942842..11947638, not MCP ServerManager.
export class ToolHookManagerImpl {
  [key: string]: any;
  constructor(readonly runtime: HookLifecycleRuntime) {
    Object.assign(this, runtime.dependencies);
    this.toolErrorResolvers = new Map();
  }
  async executePreToolUseHooks(
    eA: any,
    el: any,
    ec: any,
    eu: any,
    ed: any,
    ep: any,
  ): Promise<any> {
    let eg: any = {
      session_id: (0, this.runtime.trigger.resolveHookSessionId)(ec),
      session: ec,
      transcript_path: eu,
      cwd: ed || this.runtime.utilities.PathUtils.getWorkDir(),
      hook_event_name: "PreToolUse",
      tool_name: eA,
      tool_input: el,
      call_id: ep,
      tool_use_id: ep,
      ...(0, this.runtime.trigger.buildAgentTrigger)(ec),
    };
    try {
      let el: any,
        eu: any = await this.hookManager.executeHooks(
          l1.HookEvent.PRE_TOOL_USE,
          eg,
          { hookEvent: l1.HookEvent.PRE_TOOL_USE, callId: ep },
        );
      (ep &&
        this.galileoSessionBridge.addToolStartSpanEvent(ec, {
          toolName: eA,
          callId: ep,
        }),
        eu.hookSpecificOutput?.hookEventName === "PreToolUse" &&
          (el = eu.hookSpecificOutput.permissionDecision));
      let ed: any = eu.allowed;
      return (
        "deny" === el ? (ed = !1) : "allow" === el && (ed = !0),
        {
          allowed: ed,
          modifiedInput: eu.hookSpecificOutput?.updatedInput,
          message:
            eu.hookSpecificOutput?.permissionDecisionReason || eu.message,
          permissionDecision: el,
          permissionDecisionReason:
            eu.hookSpecificOutput?.permissionDecisionReason,
        }
      );
    } catch (eA: any) {
      return (
        this.logger.error("PreToolUse hook execution failed:", eA),
        { allowed: !0 }
      );
    }
  }
  async executePostToolUseHooks(
    eA: any,
    el: any,
    ec: any,
    eu: any,
    ed: any,
    ep: any,
    eg: any,
  ): Promise<any> {
    let eh: any = {
        session_id: (0, this.runtime.trigger.resolveHookSessionId)(eu),
        session: eu,
        transcript_path: ed,
        cwd: ep || this.runtime.utilities.PathUtils.getWorkDir(),
        hook_event_name: "PostToolUse",
        tool_name: eA,
        tool_input: el,
        tool_response: ec,
        call_id: eg,
        tool_use_id: eg,
        ...(0, this.runtime.trigger.buildAgentTrigger)(eu),
      },
      ef: any = eg ? eu._toolStartTimes?.get(eg) : void 0,
      em: any = "number" == typeof ef ? this.runtime.now() - ef : 0,
      eE: any = !!ec?.is_error || !!ec?.isError;
    if (eg && !eE)
      this.galileoSessionBridge.addToolSuccessSpanEvent(eu, {
        toolName: eA,
        callId: eg,
        durationMs: em,
      });
    else if (eg && eE) {
      let el: any = ec,
        ed: any = el?.content ?? el?.message ?? el?.error ?? "";
      if ("string" != typeof ed)
        try {
          ed = JSON.stringify(ed);
        } catch {
          ed = String(ed);
        }
      let ep: any = el?._meta,
        eh: any = String(
          el?.tool_error_code ??
            el?.toolErrorCode ??
            ep?.tool_error_code ??
            this.runtime.toolErrors.ToolErrorCode.UnknownToolError,
        ),
        ef: any =
          eh !== this.runtime.toolErrors.ToolErrorCode.UnknownToolError
            ? (0, this.runtime.toolErrors.getToolErrorName)(eh)
            : String(el?.tool_error_name ?? ep?.tool_error_name ?? "");
      this.galileoSessionBridge.addToolErrorSpanEvent(eu, {
        toolName: eA,
        callId: eg,
        durationMs: em,
        errorType: String(el?.error_type ?? el?.errorType ?? "EXECUTION_ERROR"),
        errorMessage: ed,
        errorSource: "response_flag",
        toolErrorCode: eh,
        toolErrorName: ef,
      });
    }
    try {
      let el: any,
        ec: any,
        eu: any = await this.hookManager.executeHooks(
          l1.HookEvent.POST_TOOL_USE,
          eh,
          { hookEvent: l1.HookEvent.POST_TOOL_USE, callId: eg },
        );
      return (
        eu.hookSpecificOutput?.hookEventName === "PostToolUse" &&
          ((el = eu.hookSpecificOutput.additionalContext),
          eA.startsWith("mcp__") &&
            "updatedMCPToolOutput" in eu.hookSpecificOutput &&
            (ec = eu.hookSpecificOutput.updatedMCPToolOutput)),
        { message: eu.message, additionalContext: el, updatedMCPToolOutput: ec }
      );
    } catch (eA: any) {
      return (this.logger.error("PostToolUse hook execution failed:", eA), {});
    }
  }
  async executePostToolUseFailureHooks(
    eA: any,
    el: any,
    ec: any,
    eu: any,
    ed: any,
    ep: any,
    eg: any,
    eh: any,
  ): Promise<any> {
    let ef: any = ec instanceof Error ? ec.message : String(ec),
      em: any = (0, this.runtime.isToolExecutionError)(ec)
        ? String(
            ec.toolErrorCode ??
              this.runtime.toolErrors.ToolErrorCode.UnknownToolError,
          )
        : this.resolveThrownErrorCode(eA, ec),
      eE: any =
        em !== this.runtime.toolErrors.ToolErrorCode.UnknownToolError
          ? (0, this.runtime.toolErrors.getToolErrorName)(em)
          : "",
      eC: any = {
        session_id: (0, this.runtime.trigger.resolveHookSessionId)(eu),
        session: eu,
        transcript_path: ed,
        cwd: ep || this.runtime.utilities.PathUtils.getWorkDir(),
        hook_event_name: "PostToolUseFailure",
        tool_name: eA,
        tool_input: el,
        error: ef,
        tool_error_code: em,
        tool_error_name: eE,
        call_id: eg,
        tool_use_id: eg,
        ...(0, this.runtime.trigger.buildAgentTrigger)(eu),
        ...(void 0 !== eh ? { is_interrupt: eh } : {}),
      },
      ey: any = eg ? eu._toolStartTimes?.get(eg) : void 0,
      ew: any = "number" == typeof ey ? this.runtime.now() - ey : 0;
    eg &&
      !eh &&
      this.galileoSessionBridge.addToolErrorSpanEvent(eu, {
        toolName: eA,
        callId: eg,
        durationMs: ew,
        errorType: "EXECUTION_ERROR",
        errorMessage: ef,
        errorSource: "thrown",
        toolErrorCode: em,
        toolErrorName: eE,
      });
    try {
      let eA: any,
        el: any = await this.hookManager.executeHooks(
          l1.HookEvent.POST_TOOL_USE_FAILURE,
          eC,
          { hookEvent: l1.HookEvent.POST_TOOL_USE_FAILURE, callId: eg },
        );
      return (
        el.hookSpecificOutput?.hookEventName === "PostToolUseFailure" &&
          (eA = el.hookSpecificOutput.additionalContext),
        { message: el.message, additionalContext: eA }
      );
    } catch (eA: any) {
      return (
        this.logger.error("PostToolUseFailure hook execution failed:", eA),
        {}
      );
    }
  }
  registerToolErrorResolver(eA: any, el: any): any {
    this.toolErrorResolvers.set(eA, el);
  }
  resolveThrownErrorCode(eA: any, el: any): any {
    let ec: any = this.toolErrorResolvers.get(eA);
    if (ec) {
      let eA: any = ec(el);
      if (eA) return eA;
    }
    let eu: any = el instanceof Error ? el.message : String(el),
      ed: any = eu.toLowerCase();
    if (
      "Glob" === eA &&
      (ed.includes("search path does not exist") ||
        ed.includes("search path is not a directory"))
    )
      return this.runtime.toolErrors.ToolErrorCode.SearchContentPathError;
    if (
      ed.includes("invalid parameters") ||
      ed.includes("expected string") ||
      ed.includes("expected number") ||
      ed.includes("required") ||
      ed.includes("invalid_type")
    )
      switch (eA) {
        case "Read":
          return this.runtime.toolErrors.ToolErrorCode
            .ReadFileInvalidParamsError;
        case "Agent":
          return this.runtime.toolErrors.ToolErrorCode.AgentInvalidParamsError;
        default:
          return this.runtime.toolErrors.ToolErrorCode.InvalidParameterError;
      }
    return (
      /cannot read propert(?:y|ies) of (?:undefined|null)/i.test(eu),
      this.runtime.toolErrors.ToolErrorCode.UnknownToolError
    );
  }
}
