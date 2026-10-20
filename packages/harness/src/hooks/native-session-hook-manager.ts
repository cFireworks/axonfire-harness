import { HookEvent, HookBlockedError } from "./hook-constants.js";
import type { HookLifecycleRuntime } from "./hook-lifecycle-runtime.js";
const Ah = { HookEvent, HookBlockedError },
  l1 = Ah;
// Native UTF-16 11017694..11034969.
export class SessionHookManagerImpl {
  [key: string]: any;
  constructor(readonly runtime: HookLifecycleRuntime) {
    Object.assign(this, runtime.dependencies);
  }
  extractLastAssistantMessage(eA: any, el?: any): any {
    if (el) {
      let eA: any =
          this.runtime.utilities.RunResultUtils.extractFinalOutput(el),
        ec: any =
          this.runtime.utilities.SummaryUtils.extractTextFromAssistantContent(
            eA,
          );
      if (ec.length > 0) return ec;
    }
    return this.runtime.helpers.extractLastAssistantMessageText(eA.history);
  }
  getHookTranscriptPath(eA: any): any {
    let el: any = eA.meta?.parentSessionId;
    return this.sessionStore.getSessionFilePath(eA.storeId ?? eA.id, el);
  }
  async executeUserPromptSubmitHooks(eA: any, el: any): Promise<any> {
    if (!(await this.hookManager.hasHooks(Ah.HookEvent.USER_PROMPT_SUBMIT)))
      return;
    let ec: any = el.filter(
      (eA: any) => "message" === eA.type && "user" === eA.role,
    );
    if (0 === ec.length) return;
    let eu: any = [];
    for (let eA of ec)
      if (this.runtime.utilities.MessageContentUtils.hasVisibleContent(eA)) {
        let el: any =
          this.runtime.utilities.MessageContentUtils.extractTextContent(eA);
        el && eu.push(el);
      }
    let ed: any = eu.join("\n").trim();
    if (!ed) return;
    let ep: any = {
      session_id: (0, this.runtime.trigger.resolveHookSessionId)(eA),
      session: eA,
      transcript_path: this.getHookTranscriptPath(eA),
      cwd: this.runtime.utilities.PathUtils.getWorkDir(),
      hook_event_name: "UserPromptSubmit",
      prompt: ed,
      ...(0, this.runtime.trigger.buildAgentTrigger)(eA),
    };
    try {
      let el: any = await this.hookManager.executeHooks(
        Ah.HookEvent.USER_PROMPT_SUBMIT,
        ep,
      );
      if (!el.allowed)
        throw (
          this.logger.info("User prompt blocked by hook"),
          new Ah.HookBlockedError(
            "UserPromptSubmit",
            el.message || "User input blocked by hook",
          )
        );
      if (el.hookSpecificOutput?.additionalContext)
        (eA.hookContexts || (eA.hookContexts = {}),
          (eA.hookContexts.userPromptSubmitContext =
            el.hookSpecificOutput.additionalContext));
      else if (el.stdout && !el.suppressOutput) {
        eA.hookContexts || (eA.hookContexts = {});
        let ec: any = eA.hookContexts.userPromptSubmitContext || "";
        eA.hookContexts.userPromptSubmitContext = ec
          ? ec + "\n" + el.stdout
          : el.stdout;
      }
      el.message &&
        this.logger.info(`UserPromptSubmit hook message: ${el.message}`);
    } catch (eA: any) {
      throw (
        this.logger.error("UserPromptSubmit hook execution failed:", eA),
        eA
      );
    }
  }
  async executeSessionStartHooks(eA: any, el: any): Promise<any> {
    let ec: any = this.runtime.now(),
      eu: any = await this.hookManager.hasHooks(Ah.HookEvent.SESSION_START),
      ed: any = this.runtime.now() - ec;
    if (!eu)
      return void this.logger.info(
        `[SessionHookManager] executeSessionStartHooks source=${el} hasHooks=false hasHooksCheck=${ed}ms (no hooks to run)`,
      );
    let ep: any = {
      session_id: (0, this.runtime.trigger.resolveHookSessionId)(eA),
      session: eA,
      transcript_path: this.getHookTranscriptPath(eA),
      hook_event_name: "SessionStart",
      source: el,
      ...(0, this.runtime.trigger.buildAgentTrigger)(eA),
    };
    try {
      let eu: any = this.runtime.now(),
        eg: any = await this.hookManager.executeHooks(
          Ah.HookEvent.SESSION_START,
          ep,
        );
      if (
        (this.logger.info(
          `[SessionHookManager] executeSessionStartHooks source=${el} hasHooksCheck=${ed}ms executeHooks=${this.runtime.now() - eu}ms total=${this.runtime.now() - ec}ms`,
        ),
        eg.hookSpecificOutput?.additionalContext)
      )
        (this.logger.info("SessionStart hook provided additional context"),
          eA.hookContexts || (eA.hookContexts = {}),
          (eA.hookContexts.sessionStartContext =
            eg.hookSpecificOutput.additionalContext));
      else if (eg.stdout && !eg.suppressOutput) {
        eA.hookContexts || (eA.hookContexts = {});
        let el: any = eA.hookContexts.sessionStartContext || "";
        eA.hookContexts.sessionStartContext = el
          ? el + "\n" + eg.stdout
          : eg.stdout;
      }
      let eh: any = eg.hookSpecificOutput?.initialUserMessage;
      ("string" == typeof eh &&
        eh.trim() &&
        (eA.hookContexts || (eA.hookContexts = {}),
        (eA.hookContexts.sessionStartInitialUserMessage = eh),
        this.logger.info("SessionStart hook provided initialUserMessage")),
        this.setupWatchPaths(eA, eg.hookSpecificOutput?.watchPaths));
    } catch (eA: any) {
      this.logger.error("SessionStart hook execution failed:", eA);
    }
  }
  setupWatchPaths(eA: any, el: any): any {
    if (!el) return;
    eA.hookContexts || (eA.hookContexts = {});
    let ec: any = eA.hookContexts.fileWatchersDispose;
    if ("function" == typeof ec)
      try {
        ec();
      } catch {}
    let { watcherCount: eu, dispose: ed } =
      this.runtime.helpers.registerWatchPaths(
        el,
        (el: any, ec: any) => {
          this.executeFileChangedHooks(eA, { filePath: el, event: ec }).catch(
            (eA: any) => {
              this.logger.warn?.(
                `FileChanged dispatch failed for ${el}: ${eA}`,
              );
            },
          );
        },
        { logger: this.logger },
      );
    eu > 0 &&
      (this.logger.info(
        `[SessionHookManager] registered ${eu} file watcher(s)`,
      ),
      (eA.hookContexts.fileWatchersDispose = ed));
  }
  async executeSessionEndHooks(eA: any, el: any): Promise<any> {
    let ec: any = eA.hookContexts?.fileWatchersDispose;
    if ("function" == typeof ec) {
      try {
        ec();
      } catch {}
      delete eA.hookContexts.fileWatchersDispose;
    }
    if (!(await this.hookManager.hasHooks(Ah.HookEvent.SESSION_END))) return;
    let eu: any = {
      session_id: (0, this.runtime.trigger.resolveHookSessionId)(eA),
      session: eA,
      transcript_path: this.getHookTranscriptPath(eA),
      cwd: this.runtime.utilities.PathUtils.getWorkDir(),
      hook_event_name: "SessionEnd",
      reason: el,
      ...(0, this.runtime.trigger.buildAgentTrigger)(eA),
    };
    try {
      await this.hookManager.executeHooks(Ah.HookEvent.SESSION_END, eu);
    } catch (eA: any) {
      this.logger.error("SessionEnd hook execution failed:", eA);
    }
  }
  async executeStopHooks(eA: any, el: any, ec: any): Promise<any> {
    let eu: any = ec?.stopReason;
    this.logger.info(
      `[SessionHookManager] executeStopHooks sessionId=${eA.id} stopHookActive=${ec?.stopHookActive ?? "<unset>"} stopReason=${eu ?? "<unset>"}`,
    );
    let ed: any = this.extractLastAssistantMessage(eA, el),
      ep: any = {
        session_id: (0, this.runtime.trigger.resolveHookSessionId)(eA),
        session: eA,
        transcript_path: this.getHookTranscriptPath(eA),
        cwd: this.runtime.utilities.PathUtils.getWorkDir(),
        hook_event_name: "Stop",
        stop_hook_active: ec?.stopHookActive ?? !1,
        ...(0, this.runtime.trigger.buildAgentTrigger)(eA),
        ...(ed ? { last_assistant_message: ed } : {}),
      };
    try {
      let el: any = await this.hookManager.executeHooks(Ah.HookEvent.STOP, ep);
      eA.hookContexts || (eA.hookContexts = {});
      let ec: any = !eA.abortSignal?.aborted && "completed" === eu,
        ed: any = eA.abortSignal?.aborted
          ? "abort or stream teardown"
          : `stopReason=${eu ?? "<unset>"}`;
      el.preventContinuation
        ? this.logger.info(
            "Stop hook prevented continuation (prompt hook condition not met)",
          )
        : el.continueRequest
          ? ec
            ? (eA.hookContexts.continueRequest = el.continueRequest)
            : this.logger.warn(
                `Stop hook continueRequest discarded (${ed}), no model re-invoke`,
              )
          : !el.allowed && el.message && el.blocking
            ? ec
              ? (this.logger.info(
                  "Stop hook requests continuation with message for model",
                ),
                (eA.hookContexts.continueRequest = {
                  message: {
                    type: "message",
                    role: "user",
                    content: `Stop hook feedback:
${el.message}`,
                    providerData: { isMeta: !0 },
                  },
                }))
              : this.logger.warn(
                  `Stop hook block discarded (${ed}), no model re-invoke: ${el.message}`,
                )
            : el.allowed ||
              this.logger.warn(
                `Stop hook failed non-blockingly; not continuing: ${el.message ?? ""}`,
              );
      let eg: any = !!eA.hookContexts.continueRequest;
      ("completed" === eu && eg) || (await this.executeFinalStopHooks(eA, eu));
    } catch (el: any) {
      this.logger.error("Stop hook execution failed:", el);
      try {
        await this.executeStopFailureHooks(eA, el);
      } catch (eA: any) {
        this.logger.error("StopFailure hook dispatch failed:", eA);
      }
    }
  }
  async executeSubagentStopHooks(eA: any, el: any): Promise<any> {
    if (!(await this.hookManager.hasHooks(Ah.HookEvent.SUBAGENT_STOP))) return;
    let ec: any = this.getHookTranscriptPath(eA),
      eu: any = this.extractLastAssistantMessage(eA, el),
      ed: any = {
        session_id: (0, this.runtime.trigger.resolveHookSessionId)(eA),
        session: eA,
        transcript_path: ec,
        cwd: this.runtime.utilities.PathUtils.getWorkDir(),
        hook_event_name: "SubagentStop",
        stop_hook_active: !1,
        agent_transcript_path: ec,
        ...(0, this.runtime.trigger.buildAgentTrigger)(eA),
        ...(eu ? { last_assistant_message: eu } : {}),
      };
    try {
      let el: any = await this.hookManager.executeHooks(
        Ah.HookEvent.SUBAGENT_STOP,
        ed,
      );
      !el.allowed && el.message && el.blocking
        ? (this.logger.info(
            "SubagentStop hook requests continuation with message for subagent",
          ),
          eA.hookContexts || (eA.hookContexts = {}),
          (eA.hookContexts.subagentStopHookFeedback = el.message))
        : el.allowed ||
          this.logger.warn(
            `SubagentStop hook failed non-blockingly; not continuing: ${el.message ?? ""}`,
          );
    } catch (eA: any) {
      this.logger.error("SubagentStop hook execution failed:", eA);
    }
  }
  async executePreCompactHooks(eA: any, el: any, ec?: any): Promise<any> {
    let eu: any = {
      session_id: (0, this.runtime.trigger.resolveHookSessionId)(eA),
      session: eA,
      transcript_path: this.getHookTranscriptPath(eA),
      cwd: this.runtime.utilities.PathUtils.getWorkDir(),
      hook_event_name: "PreCompact",
      trigger: el,
      custom_instructions: ec ?? null,
      ...(0, this.runtime.trigger.buildAgentTrigger)(eA),
    };
    try {
      let eA: any = await this.hookManager.executeHooks(
        Ah.HookEvent.PRE_COMPACT,
        eu,
      );
      if (eA.allowed && eA.stdout && !eA.suppressOutput)
        return (
          this.logger.info("PreCompact hook provided additional instructions"),
          eA.stdout.trim()
        );
      return;
    } catch (eA: any) {
      this.logger.error("PreCompact hook execution failed:", eA);
      return;
    }
  }
  async executeNotificationHooks(eA: any, el: any, ec: any): Promise<any> {
    try {
      await this.terminalNotificationService.sendNotification(
        el,
        this.runtime.productCliName,
        ec,
        eA,
      );
    } catch (eA: any) {
      this.logger.warn?.("Failed to send terminal notification:", eA);
    }
    if (!(await this.hookManager.hasHooks(Ah.HookEvent.NOTIFICATION))) return;
    let eu: any = {
      session_id: (0, this.runtime.trigger.resolveHookSessionId)(eA),
      session: eA,
      transcript_path: eA ? this.getHookTranscriptPath(eA) : "",
      cwd: this.runtime.utilities.PathUtils.getWorkDir(),
      hook_event_name: "Notification",
      message: el,
      notification_type: ec,
      title: this.runtime.productCliName,
      ...(0, this.runtime.trigger.buildAgentTrigger)(eA),
    };
    try {
      await this.hookManager.executeHooks(Ah.HookEvent.NOTIFICATION, eu);
    } catch (eA: any) {
      this.logger.error("Notification hook execution failed:", eA);
    }
  }
  async executeSubagentStartHooks(eA: any): Promise<any> {
    if (!(await this.hookManager.hasHooks(Ah.HookEvent.SUBAGENT_START))) return;
    let el: any = {
      session_id: (0, this.runtime.trigger.resolveHookSessionId)(eA),
      session: eA,
      transcript_path: this.getHookTranscriptPath(eA),
      cwd: this.runtime.utilities.PathUtils.getWorkDir(),
      hook_event_name: "SubagentStart",
      ...(0, this.runtime.trigger.buildAgentTrigger)(eA),
    };
    try {
      await this.hookManager.executeHooks(Ah.HookEvent.SUBAGENT_START, el);
    } catch (eA: any) {
      this.logger.error("SubagentStart hook execution failed:", eA);
    }
  }
  async executeStopFailureHooks(eA: any, el: any): Promise<any> {
    if (!(await this.hookManager.hasHooks(Ah.HookEvent.STOP_FAILURE))) return;
    let ec: any = el instanceof Error ? el.message : String(el),
      eu: any = el instanceof Error && el.stack ? el.stack : void 0,
      ed: any = this.extractLastAssistantMessage(eA),
      ep: any = {
        session_id: (0, this.runtime.trigger.resolveHookSessionId)(eA),
        session: eA,
        transcript_path: this.getHookTranscriptPath(eA),
        cwd: this.runtime.utilities.PathUtils.getWorkDir(),
        hook_event_name: "StopFailure",
        error: ec,
        ...(0, this.runtime.trigger.buildAgentTrigger)(eA),
        ...(eu ? { error_details: eu } : {}),
        ...(ed ? { last_assistant_message: ed } : {}),
      };
    try {
      await this.hookManager.executeHooks(Ah.HookEvent.STOP_FAILURE, ep);
    } catch (eA: any) {
      this.logger.error("StopFailure hook execution failed:", eA);
    }
  }
  async executePostCompactHooks(eA: any, el: any, ec: any): Promise<any> {
    if (!(await this.hookManager.hasHooks(Ah.HookEvent.POST_COMPACT))) return;
    let eu: any = {
      session_id: (0, this.runtime.trigger.resolveHookSessionId)(eA),
      session: eA,
      transcript_path: this.getHookTranscriptPath(eA),
      cwd: this.runtime.utilities.PathUtils.getWorkDir(),
      hook_event_name: "PostCompact",
      trigger: el,
      ...(0, this.runtime.trigger.buildAgentTrigger)(eA),
      ...(ec ? { compact_summary: ec } : {}),
    };
    try {
      await this.hookManager.executeHooks(Ah.HookEvent.POST_COMPACT, eu);
    } catch (eA: any) {
      this.logger.error("PostCompact hook execution failed:", eA);
    }
  }
  async executePermissionRequestHooks(
    eA: any,
    el: any,
    ec: any,
    eu: any,
    ed: any,
  ): Promise<any> {
    if (!(await this.hookManager.hasHooks(Ah.HookEvent.PERMISSION_REQUEST)))
      return {};
    let ep: any = {
      session_id: (0, this.runtime.trigger.resolveHookSessionId)(eA),
      session: eA,
      transcript_path: this.getHookTranscriptPath(eA),
      cwd: this.runtime.utilities.PathUtils.getWorkDir(),
      hook_event_name: "PermissionRequest",
      tool_name: el,
      tool_input: ec,
      ...(0, this.runtime.trigger.buildAgentTrigger)(eA),
      ...(ed ? { call_id: ed, tool_use_id: ed } : {}),
      ...(void 0 !== eu ? { permission_suggestions: eu } : {}),
    };
    try {
      let eA: any = await this.hookManager.executeHooks(
          Ah.HookEvent.PERMISSION_REQUEST,
          ep,
          { hookEvent: Ah.HookEvent.PERMISSION_REQUEST, callId: ed },
        ),
        el: any = eA.hookSpecificOutput?.decision;
      if (el && ("allow" === el.behavior || "deny" === el.behavior))
        return { decision: el };
      return {};
    } catch (eA: any) {
      return (
        this.logger.error("PermissionRequest hook execution failed:", eA),
        {}
      );
    }
  }
  async executePermissionDeniedHooks(
    eA: any,
    el: any,
    ec: any,
    eu: any,
    ed: any,
  ): Promise<any> {
    if (!(await this.hookManager.hasHooks(Ah.HookEvent.PERMISSION_DENIED)))
      return {};
    let ep: any = {
      session_id: (0, this.runtime.trigger.resolveHookSessionId)(eA),
      session: eA,
      transcript_path: this.getHookTranscriptPath(eA),
      cwd: this.runtime.utilities.PathUtils.getWorkDir(),
      hook_event_name: "PermissionDenied",
      tool_name: el,
      tool_input: ec,
      reason: eu,
      ...(0, this.runtime.trigger.buildAgentTrigger)(eA),
      ...(ed ? { call_id: ed, tool_use_id: ed } : {}),
    };
    try {
      let eA: any = await this.hookManager.executeHooks(
        Ah.HookEvent.PERMISSION_DENIED,
        ep,
        { hookEvent: Ah.HookEvent.PERMISSION_DENIED, callId: ed },
      );
      return { retry: eA.hookSpecificOutput?.retry === !0 };
    } catch (eA: any) {
      return (
        this.logger.error("PermissionDenied hook execution failed:", eA),
        {}
      );
    }
  }
  async executeElicitationHooks(eA: any, el: any): Promise<any> {
    if (!(await this.hookManager.hasHooks(Ah.HookEvent.ELICITATION))) return {};
    let ec: any = {
      session_id: (0, this.runtime.trigger.resolveHookSessionId)(eA),
      session: eA,
      transcript_path: this.getHookTranscriptPath(eA),
      cwd: this.runtime.utilities.PathUtils.getWorkDir(),
      hook_event_name: "Elicitation",
      mcp_server_name: el.mcpServerName,
      message: el.message,
      ...(0, this.runtime.trigger.buildAgentTrigger)(eA),
      ...(el.mode ? { mode: el.mode } : {}),
      ...(el.url ? { url: el.url } : {}),
      ...(el.elicitationId ? { elicitation_id: el.elicitationId } : {}),
      ...(void 0 !== el.requestedSchema
        ? { requested_schema: el.requestedSchema }
        : {}),
    };
    try {
      let eA: any = await this.hookManager.executeHooks(
          Ah.HookEvent.ELICITATION,
          ec,
        ),
        el: any = eA.hookSpecificOutput?.action,
        eu: any = eA.hookSpecificOutput?.content;
      if ("accept" === el || "decline" === el || "cancel" === el)
        return { action: el, content: eu };
      return {};
    } catch (eA: any) {
      return (this.logger.error("Elicitation hook execution failed:", eA), {});
    }
  }
  async executeElicitationResultHooks(eA: any, el: any): Promise<any> {
    if (!(await this.hookManager.hasHooks(Ah.HookEvent.ELICITATION_RESULT)))
      return;
    let ec: any = {
      session_id: (0, this.runtime.trigger.resolveHookSessionId)(eA),
      session: eA,
      transcript_path: this.getHookTranscriptPath(eA),
      cwd: this.runtime.utilities.PathUtils.getWorkDir(),
      hook_event_name: "ElicitationResult",
      mcp_server_name: el.mcpServerName,
      action: el.action,
      ...(0, this.runtime.trigger.buildAgentTrigger)(eA),
      ...(el.mode ? { mode: el.mode } : {}),
      ...(el.elicitationId ? { elicitation_id: el.elicitationId } : {}),
      ...(void 0 !== el.content ? { content: el.content } : {}),
    };
    try {
      await this.hookManager.executeHooks(Ah.HookEvent.ELICITATION_RESULT, ec);
    } catch (eA: any) {
      this.logger.error("ElicitationResult hook execution failed:", eA);
    }
  }
  async executeTaskCreatedHooks(eA: any, el: any): Promise<any> {
    if (!(await this.hookManager.hasHooks(Ah.HookEvent.TASK_CREATED))) return;
    let ec: any = {
      session_id: (0, this.runtime.trigger.resolveHookSessionId)(eA),
      session: eA,
      transcript_path: this.getHookTranscriptPath(eA),
      cwd: this.runtime.utilities.PathUtils.getWorkDir(),
      hook_event_name: "TaskCreated",
      task_id: el.taskId,
      task_subject: el.subject,
      ...(0, this.runtime.trigger.buildAgentTrigger)(eA),
      ...(el.description ? { task_description: el.description } : {}),
      ...(el.teammateName ? { teammate_name: el.teammateName } : {}),
      ...(el.teamName ? { team_name: el.teamName } : {}),
    };
    try {
      await this.hookManager.executeHooks(Ah.HookEvent.TASK_CREATED, ec);
    } catch (eA: any) {
      this.logger.error("TaskCreated hook execution failed:", eA);
    }
  }
  async executeTaskCompletedHooks(eA: any, el: any): Promise<any> {
    if (!(await this.hookManager.hasHooks(Ah.HookEvent.TASK_COMPLETED))) return;
    let ec: any = {
      session_id: (0, this.runtime.trigger.resolveHookSessionId)(eA),
      session: eA,
      transcript_path: this.getHookTranscriptPath(eA),
      cwd: this.runtime.utilities.PathUtils.getWorkDir(),
      hook_event_name: "TaskCompleted",
      task_id: el.taskId,
      task_subject: el.subject,
      ...(0, this.runtime.trigger.buildAgentTrigger)(eA),
      ...(el.description ? { task_description: el.description } : {}),
      ...(el.teammateName ? { teammate_name: el.teammateName } : {}),
      ...(el.teamName ? { team_name: el.teamName } : {}),
    };
    try {
      await this.hookManager.executeHooks(Ah.HookEvent.TASK_COMPLETED, ec);
    } catch (eA: any) {
      this.logger.error("TaskCompleted hook execution failed:", eA);
    }
  }
  async executeTeammateIdleHooks(eA: any, el: any): Promise<any> {
    if (!(await this.hookManager.hasHooks(Ah.HookEvent.TEAMMATE_IDLE))) return;
    let ec: any = {
      session_id: (0, this.runtime.trigger.resolveHookSessionId)(eA),
      session: eA,
      transcript_path: this.getHookTranscriptPath(eA),
      cwd: this.runtime.utilities.PathUtils.getWorkDir(),
      hook_event_name: "TeammateIdle",
      teammate_name: el.teammateName,
      team_name: el.teamName,
      ...(0, this.runtime.trigger.buildAgentTrigger)(eA),
    };
    try {
      await this.hookManager.executeHooks(Ah.HookEvent.TEAMMATE_IDLE, ec);
    } catch (eA: any) {
      this.logger.error("TeammateIdle hook execution failed:", eA);
    }
  }
  async executeSetupHooks(eA: any, el: any): Promise<any> {
    if (!(await this.hookManager.hasHooks(Ah.HookEvent.SETUP))) return;
    let ec: any = {
      session_id: (0, this.runtime.trigger.resolveHookSessionId)(eA),
      session: eA,
      transcript_path: this.getHookTranscriptPath(eA),
      cwd: this.runtime.utilities.PathUtils.getWorkDir(),
      hook_event_name: "Setup",
      trigger: el,
      ...(0, this.runtime.trigger.buildAgentTrigger)(eA),
    };
    try {
      let el: any = await this.hookManager.executeHooks(Ah.HookEvent.SETUP, ec),
        eu: any =
          el.hookSpecificOutput?.additionalContext ??
          (el.stdout && !el.suppressOutput ? el.stdout.trim() : void 0);
      if ("string" == typeof eu && eu.length > 0) {
        eA.hookContexts || (eA.hookContexts = {});
        let el: any = eA.hookContexts.setupContext || "";
        eA.hookContexts.setupContext = el
          ? `${el}
${eu}`
          : eu;
      }
      this.setupWatchPaths(eA, el.hookSpecificOutput?.watchPaths);
    } catch (eA: any) {
      this.logger.error("Setup hook execution failed:", eA);
    }
  }
  async executeFileChangedHooks(eA: any, el: any): Promise<any> {
    if (!(await this.hookManager.hasHooks(Ah.HookEvent.FILE_CHANGED))) return;
    let ec: any = {
      session_id: (0, this.runtime.trigger.resolveHookSessionId)(eA),
      session: eA,
      transcript_path: this.getHookTranscriptPath(eA),
      cwd: this.runtime.utilities.PathUtils.getWorkDir(),
      hook_event_name: "FileChanged",
      file_path: el.filePath,
      event: el.event,
      ...(0, this.runtime.trigger.buildAgentTrigger)(eA),
    };
    try {
      await this.hookManager.executeHooks(Ah.HookEvent.FILE_CHANGED, ec);
    } catch (eA: any) {
      this.logger.error("FileChanged hook execution failed:", eA);
    }
  }
  async executeCwdChangedHooks(eA: any, el: any): Promise<any> {
    if (!(await this.hookManager.hasHooks(Ah.HookEvent.CWD_CHANGED))) return;
    let ec: any = {
      session_id: (0, this.runtime.trigger.resolveHookSessionId)(eA),
      session: eA,
      transcript_path: this.getHookTranscriptPath(eA),
      cwd: this.runtime.utilities.PathUtils.getWorkDir(),
      hook_event_name: "CwdChanged",
      old_cwd: el.oldCwd,
      new_cwd: el.newCwd,
      ...(0, this.runtime.trigger.buildAgentTrigger)(eA),
    };
    try {
      await this.hookManager.executeHooks(Ah.HookEvent.CWD_CHANGED, ec);
    } catch (eA: any) {
      this.logger.error("CwdChanged hook execution failed:", eA);
    }
  }
  async executeFinalStopHooks(eA: any, el: any = "completed"): Promise<any> {
    if (
      (this.logger.info(
        `[FinalStop] executeFinalStopHooks entry sessionId=${eA.id} reason=${el}`,
      ),
      !(await this.hookManager.hasHooks(Ah.HookEvent.FINAL_STOP)))
    )
      return void this.logger.info(
        `[FinalStop] no FinalStop hooks registered, skipping sessionId=${eA.id}`,
      );
    this.logger.info(
      `[FinalStop] executing FinalStop hooks sessionId=${eA.id}`,
    );
    let ec: any = this.runtime.now(),
      eu: any = {
        session_id: (0, this.runtime.trigger.resolveHookSessionId)(eA),
        session: eA,
        transcript_path: this.getHookTranscriptPath(eA),
        cwd: this.runtime.utilities.PathUtils.getWorkDir(),
        hook_event_name: "FinalStop",
        final_stop_reason: el,
        ...(0, this.runtime.trigger.buildAgentTrigger)(eA),
      };
    try {
      (await this.hookManager.executeHooks(Ah.HookEvent.FINAL_STOP, eu),
        this.logger.info(
          `[FinalStop] FinalStop hooks completed successfully sessionId=${eA.id} durationMs=${this.runtime.now() - ec}`,
        ));
    } catch (el: any) {
      this.logger.error(
        `[FinalStop] FinalStop hook execution failed sessionId=${eA.id} durationMs=${this.runtime.now() - ec}`,
        el,
      );
    }
  }
}
