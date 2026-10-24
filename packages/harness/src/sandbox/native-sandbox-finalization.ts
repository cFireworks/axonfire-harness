// @ts-nocheck
// Complete original shell routing and Sandbox finalization/session hooks; no global registration.
export const SANDBOX_FINALIZATION_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const SANDBOX_FINALIZATION_BLOCKS = [
  ["e_", 11223565, 11224964],
  ["af", 8490432, 8496220],
  ["ay", 8497687, 8499841],
  ["aI", 8501449, 8502784],
] as const;
export const SANDBOX_FINALIZATION_MODULES = [
  [38195, 8127812, 8137271],
  [57126, 7339323, 7339448],
] as const;
export function createNativeSandboxFinalization(runtime: any) {
  if (!runtime?.process)
    throw Error("Explicit Sandbox finalization process boundary required");
  const process = runtime.process,
    Date = runtime.Date ?? globalThis.Date,
    setTimeout = runtime.setTimeout ?? globalThis.setTimeout,
    clearTimeout = runtime.clearTimeout ?? globalThis.clearTimeout;
  const factories = {
    38195(eA, el, ec) {
      "use strict";
      (ec.r(el),
        ec.d(el, {
          EVENTS_WITHOUT_MATCHER: () => eh,
          HOOK_EVENT_IO_DESCRIPTIONS: () => ef,
          HOOK_EVENT_TITLES: () => em,
          Hook: () => ew,
          HookBlockedError: () => HookBlockedError,
          HookEvent: () => ed,
          HookExecutor: () => eC,
          HookInputProcessor: () => eB,
          HookManager: () => eE,
          HookPriority: () => ep,
          NotificationType: () => eu,
          PromptHookService: () => ey,
          ScopedHookRegistry: () => e_,
        }));
      var eu,
        ed,
        ep,
        eg = ec(78213);
      let HookBlockedError = class HookBlockedError extends Error {
        constructor(eA, el) {
          (super(`${eA} hook error: 
${el}`),
            (this.hookEvent = eA),
            (this.reason = el),
            (this.name = "HookBlockedError"));
        }
      };
      (!(function (eA) {
        ((eA.PERMISSION_PROMPT = "permission_prompt"),
          (eA.IDLE_PROMPT = "idle_prompt"),
          (eA.AUTH_SUCCESS = "auth_success"),
          (eA.ELICITATION_DIALOG = "elicitation_dialog"));
      })(eu || (eu = {})),
        (function (eA) {
          ((eA.PRE_TOOL_USE = "PreToolUse"),
            (eA.POST_TOOL_USE = "PostToolUse"),
            (eA.NOTIFICATION = "Notification"),
            (eA.USER_PROMPT_SUBMIT = "UserPromptSubmit"),
            (eA.STOP = "Stop"),
            (eA.SUBAGENT_STOP = "SubagentStop"),
            (eA.PRE_COMPACT = "PreCompact"),
            (eA.SESSION_START = "SessionStart"),
            (eA.SESSION_END = "SessionEnd"),
            (eA.WORKTREE_CREATE = "WorktreeCreate"),
            (eA.WORKTREE_REMOVE = "WorktreeRemove"),
            (eA.POST_TOOL_USE_FAILURE = "PostToolUseFailure"),
            (eA.SUBAGENT_START = "SubagentStart"),
            (eA.STOP_FAILURE = "StopFailure"),
            (eA.POST_COMPACT = "PostCompact"),
            (eA.CONFIG_CHANGE = "ConfigChange"),
            (eA.INSTRUCTIONS_LOADED = "InstructionsLoaded"),
            (eA.PERMISSION_REQUEST = "PermissionRequest"),
            (eA.PERMISSION_DENIED = "PermissionDenied"),
            (eA.ELICITATION = "Elicitation"),
            (eA.ELICITATION_RESULT = "ElicitationResult"),
            (eA.TASK_CREATED = "TaskCreated"),
            (eA.TASK_COMPLETED = "TaskCompleted"),
            (eA.TEAMMATE_IDLE = "TeammateIdle"),
            (eA.SETUP = "Setup"),
            (eA.FILE_CHANGED = "FileChanged"),
            (eA.CWD_CHANGED = "CwdChanged"),
            (eA.FINAL_STOP = "FinalStop"));
        })(ed || (ed = {})));
      let eh = [
          ed.USER_PROMPT_SUBMIT,
          ed.NOTIFICATION,
          ed.STOP,
          ed.SUBAGENT_STOP,
          ed.WORKTREE_CREATE,
          ed.WORKTREE_REMOVE,
          ed.POST_COMPACT,
          ed.ELICITATION_RESULT,
          ed.TASK_CREATED,
          ed.TASK_COMPLETED,
          ed.TEAMMATE_IDLE,
          ed.CWD_CHANGED,
          ed.FILE_CHANGED,
          ed.FINAL_STOP,
        ],
        ef = {
          [ed.PRE_TOOL_USE]: [
            "Input to command is JSON of tool call arguments.",
            "Exit code 0 - stdout/stderr not shown",
            "Exit code 2 - show stderr to model and block tool call",
            "Other exit codes - show stderr to user only but continue with tool call",
          ],
          [ed.POST_TOOL_USE]: [
            'Input to command is JSON with fields "inputs" (tool call arguments) and "response" (tool call response). ',
            "Exit code 0 - stdout shown in transcript mode (Ctrl-R)",
            "Exit code 2 - show stderr to model immediately",
            "Other exit codes - show stderr to user only",
          ],
          [ed.NOTIFICATION]: [],
          [ed.USER_PROMPT_SUBMIT]: [
            "Input to command is JSON with original user prompt text.",
            `Exit code 0 - stdout shown to ${eg.PRODUCT_NAME}`,
            "Exit code 2 - block processing, erase original prompt, and show stderr to user only",
            "Other exit codes - show stderr to user only",
          ],
          [ed.SESSION_START]: [
            "Input to command is JSON with session start source.",
            `Exit code 0 - stdout shown to ${eg.PRODUCT_NAME}`,
            "Blocking errors are ignored",
            "Other exit codes - show stderr to user only",
          ],
          [ed.SESSION_END]: [
            "Input to command is JSON with session end reason.",
            "Exit code 0 - command completes successfully",
            "Other exit codes - show stderr to user only",
          ],
          [ed.STOP]: [
            "Exit code 0 - stdout/stderr not shown",
            "Exit code 2 - show stderr to model and continue conversation",
            "Other exit codes - show stderr to user only",
          ],
          [ed.SUBAGENT_STOP]: [
            "Exit code 0 - stdout/stderr not shown",
            "Exit code 2 - show stderr to subagent and continue having it run",
            "Other exit codes - show stderr to user only",
          ],
          [ed.PRE_COMPACT]: [
            "Input to command is JSON with compaction details.",
            "Exit code 0 - stdout appended as custom compact instructions",
            "Exit code 2 - block compaction",
            "Other exit codes - show stderr to user only but continue with compaction",
          ],
          [ed.WORKTREE_CREATE]: [
            "Input to command is JSON with worktree name and session info.",
            "Exit code 0 - stdout must contain the absolute path to the created worktree",
            "Other exit codes - worktree creation fails",
          ],
          [ed.WORKTREE_REMOVE]: [
            "Input to command is JSON with worktree path to remove.",
            "Exit code 0 - worktree removal handled by hook",
            "Other exit codes - show stderr to user only",
          ],
          [ed.POST_TOOL_USE_FAILURE]: [
            'Input to command is JSON with fields "tool_name", "tool_input", "error", optional "is_interrupt".',
            "Exit code 0 - stdout shown in transcript mode (Ctrl-R)",
            "Exit code 2 - show stderr to model immediately",
            "Other exit codes - show stderr to user only",
          ],
          [ed.SUBAGENT_START]: [
            "Input to command is JSON with agent_id / agent_type.",
            `Exit code 0 - stdout shown to ${eg.PRODUCT_NAME}`,
            "Blocking errors are ignored",
            "Other exit codes - show stderr to user only",
          ],
          [ed.STOP_FAILURE]: [
            "Input to command is JSON with error / error_details / last_assistant_message.",
            "Exit code 0 - stdout/stderr not shown",
            "Other exit codes - show stderr to user only",
          ],
          [ed.POST_COMPACT]: [
            "Input to command is JSON with trigger + compact_summary.",
            "Exit code 0 - stdout/stderr not shown",
            "Other exit codes - show stderr to user only",
          ],
          [ed.CONFIG_CHANGE]: [
            "Input to command is JSON with source + optional file_path.",
            "Exit code 0 - command completes successfully",
            "Other exit codes - show stderr to user only",
          ],
          [ed.INSTRUCTIONS_LOADED]: [
            "Input to command is JSON with file_path / memory_type / load_reason.",
            "Exit code 0 - command completes successfully",
            "Other exit codes - show stderr to user only",
          ],
          [ed.PERMISSION_REQUEST]: [
            "Input to command is JSON with tool_name / tool_input / permission_suggestions.",
            "Exit code 0 - stdout JSON decision may override user prompt (allow/deny + updatedInput)",
            "Other exit codes - show stderr to user only",
          ],
          [ed.PERMISSION_DENIED]: [
            "Input to command is JSON with tool_name / tool_input / tool_use_id / reason.",
            "Exit code 0 - hookSpecificOutput.retry requests model retry",
            "Other exit codes - show stderr to user only",
          ],
          [ed.ELICITATION]: [
            "Input to command is JSON with mcp_server_name / message / mode / url / elicitation_id / requested_schema.",
            "Exit code 0 - hookSpecificOutput.action + content auto-responds for the user",
            "Other exit codes - show stderr to user only",
          ],
          [ed.ELICITATION_RESULT]: [
            "Input to command is JSON with mcp_server_name / elicitation_id / mode / action / content.",
            "Exit code 0 - stdout/stderr not shown",
            "Other exit codes - show stderr to user only",
          ],
          [ed.TASK_CREATED]: [
            "Input to command is JSON with task_id / task_subject / task_description / teammate_name / team_name.",
            "Exit code 0 - stdout/stderr not shown",
            "Other exit codes - show stderr to user only",
          ],
          [ed.TASK_COMPLETED]: [
            "Input to command is JSON with task_id / task_subject / task_description / teammate_name / team_name.",
            "Exit code 0 - stdout/stderr not shown",
            "Other exit codes - show stderr to user only",
          ],
          [ed.TEAMMATE_IDLE]: [
            "Input to command is JSON with teammate_name / team_name.",
            "Exit code 0 - stdout/stderr not shown",
            "Other exit codes - show stderr to user only",
          ],
          [ed.SETUP]: [
            "Input to command is JSON with trigger (init|maintenance).",
            `Exit code 0 - stdout shown to ${eg.PRODUCT_NAME}; additionalContext injected into first prompt`,
            "Other exit codes - show stderr to user only",
          ],
          [ed.FILE_CHANGED]: [
            "Input to command is JSON with file_path + event (change|add|unlink).",
            "Exit code 0 - stdout/stderr not shown",
            "Other exit codes - show stderr to user only",
          ],
          [ed.CWD_CHANGED]: [
            "Input to command is JSON with old_cwd / new_cwd.",
            "Exit code 0 - stdout/stderr not shown",
            "Other exit codes - show stderr to user only",
          ],
          [ed.FINAL_STOP]: [
            "Internal-only event. Triggered when the current run/turn reaches a final terminal state.",
            "Internal HookInput includes final_stop_reason (completed|cancelled|failed|interrupted).",
            "Does NOT support continueRequest — any continuation in result is ignored.",
          ],
        },
        em = {
          [ed.PRE_TOOL_USE]: "Before a tool is executed",
          [ed.POST_TOOL_USE]: "After a tool completes successfully",
          [ed.NOTIFICATION]: "For permission requests or idle periods",
          [ed.USER_PROMPT_SUBMIT]: "When user submits a prompt",
          [ed.SESSION_START]: "When starting or resuming a session",
          [ed.SESSION_END]: "When session terminates",
          [ed.STOP]: "When main agent finishes responding",
          [ed.SUBAGENT_STOP]: "When subagent finishes responding",
          [ed.PRE_COMPACT]: "Before context compaction",
          [ed.WORKTREE_CREATE]: "When a worktree is being created",
          [ed.WORKTREE_REMOVE]: "When a worktree is being removed",
          [ed.POST_TOOL_USE_FAILURE]: "After a tool fails or is interrupted",
          [ed.SUBAGENT_START]: "Before a subagent starts running",
          [ed.STOP_FAILURE]: "When Stop hook execution itself fails",
          [ed.POST_COMPACT]: "After context compaction completes",
          [ed.CONFIG_CHANGE]: "When a settings file changes",
          [ed.INSTRUCTIONS_LOADED]: "When an instruction file is loaded",
          [ed.PERMISSION_REQUEST]: "Before a tool permission prompt",
          [ed.PERMISSION_DENIED]: "After a tool permission is denied",
          [ed.ELICITATION]: "Before an MCP elicitation prompt",
          [ed.ELICITATION_RESULT]: "After an MCP elicitation resolves",
          [ed.TASK_CREATED]: "When a task is created",
          [ed.TASK_COMPLETED]: "When a task completes",
          [ed.TEAMMATE_IDLE]: "When a teammate becomes idle",
          [ed.SETUP]: "During startup or maintenance",
          [ed.FILE_CHANGED]: "When a watched file changes",
          [ed.CWD_CHANGED]: "When the working directory changes",
          [ed.FINAL_STOP]:
            "When the current turn reaches a final terminal state",
        },
        eE = Symbol("HookManager"),
        eC = Symbol("HookExecutor"),
        ey = Symbol("PromptHookService"),
        ew = Symbol("Hook");
      !(function (eA) {
        ((eA[(eA.Highest = 0)] = "Highest"),
          (eA[(eA.High = 100)] = "High"),
          (eA[(eA.StructuredOutput = 200)] = "StructuredOutput"),
          (eA[(eA.Normal = 500)] = "Normal"),
          (eA[(eA.Low = 800)] = "Low"),
          (eA[(eA.Lowest = 1e3)] = "Lowest"));
      })(ep || (ep = {}));
      let eB = Symbol("HookInputProcessor"),
        e_ = Symbol("ScopedHookRegistry");
    },
    57126(eA, el, ec) {
      "use strict";
      (ec.r(el), ec.d(el, { LegacySandboxShellService: () => eu }));
      let eu = Symbol("LegacySandboxShellService");
    },
  };
  const cache = new Map();
  function getModule(id: number): any {
    if (runtime.modules?.[id] !== undefined) return runtime.modules[id];
    if (cache.has(id)) return cache.get(id).exports;
    if (factories[id]) {
      const mod = { exports: {} };
      cache.set(id, mod);
      factories[id](mod, mod.exports, getModule);
      return mod.exports;
    }
    const value = runtime.getModule?.(id);
    if (value === undefined)
      throw Error("Explicit Sandbox finalization module required: " + id);
    return value;
  }
  getModule.r = (o: any) => {
    Object.defineProperty(o, "__esModule", { value: true });
    Object.defineProperty(o, Symbol.toStringTag, { value: "Module" });
  };
  getModule.d = (o: any, defs: any) => {
    for (const k of Object.keys(defs))
      if (!Object.hasOwn(o, k))
        Object.defineProperty(o, k, { enumerable: true, get: defs[k] });
  };
  getModule.n = (v: any) => (v && v.__esModule ? () => v.default : () => v);
  const eE = getModule(70857),
    oH = getModule(38195),
    ad = getModule(74674),
    n5 = getModule(99006),
    ah = getModule(59255);
  let e_ = class {
    async execute(eA) {
      let el = await this.resolveBackend(),
        { delegate: ec, target: eu } = this.pickDelegate(el);
      this.logger.info?.(
        `[DelegatingShellService] execute → ${eu} | cmd="${eA.command}" cwd="${eA.cwd ?? ""}" timeout=${eA.timeout ?? "none"} usePty=${eA.usePty ?? !0}`,
      );
      let ed = Date.now();
      try {
        let el = await ec.execute(eA);
        return (
          this.logger.info?.(
            `[DelegatingShellService] execute OK → ${eu} | handleId=${el.id} pid=${el.pid} elapsed=${Date.now() - ed}ms`,
          ),
          el
        );
      } catch (eA) {
        throw (
          this.logger.error?.(
            `[DelegatingShellService] execute FAILED → ${eu} | elapsed=${Date.now() - ed}ms`,
            eA,
          ),
          eA
        );
      }
    }
    async disposeAll() {
      await Promise.allSettled([
        this.localShellService.disposeAll(),
        this.sandboxShellService.disposeAll(),
        this.legacySandboxShellService.disposeAll(),
      ]);
    }
    getActiveHandleCount() {
      return (
        this.localShellService.getActiveHandleCount() +
        this.sandboxShellService.getActiveHandleCount() +
        this.legacySandboxShellService.getActiveHandleCount()
      );
    }
    async resolveBackend() {
      let eA = !1;
      try {
        let el = await this.bashSandboxManager.getConfig();
        eA = !!el?.enabled;
      } catch {
        return "off";
      }
      return eA
        ? "linux" === eE.platform()
          ? "legacy"
          : "sandbox-cli"
        : "off";
    }
    pickDelegate(eA) {
      switch (eA) {
        case "sandbox-cli":
          return {
            delegate: this.sandboxShellService,
            target: "SandboxShellService",
          };
        case "legacy":
          return {
            delegate: this.legacySandboxShellService,
            target: "LegacySandboxShellService",
          };
        default:
          return {
            delegate: this.localShellService,
            target: "LocalShellService",
          };
      }
    }
  };
  let af = [".codebuddy/"],
    am = 3e3,
    aE = class {
      constructor() {
        ((this.event = oH.HookEvent.FINAL_STOP),
          (this.priority = oH.HookPriority.Lowest),
          this.logger?.setContext?.("FinalizationFileProjectionSyncHook"));
      }
      async execute(eA) {
        let el = eA.session;
        if (!el) return;
        let ec = eA.final_stop_reason ?? "completed";
        if ("completed" !== ec)
          return void this.logger?.info?.(
            `[finalization-file-projection-sync] skipped (final_stop_reason=${ec}) sessionId=${el.id}`,
          );
        if (!this.sandboxTurnConfig.enableProjection)
          return void this.logger?.info?.(
            `[finalization-file-projection-sync] skipped (enableProjection=false) sessionId=${el.id}`,
          );
        let eu = Date.now();
        (this.logger?.info?.(
          `[finalization-file-projection-sync] start sessionId=${el.id}`,
        ),
          this.logger?.info?.(
            `[finalization-file-projection-sync] emitting silent phase sessionId=${el.id}`,
          ),
          n5.AgentPhaseUtils.emit(el, "finalization_file_projection_sync"));
        let ed = this.scheduleNotifyEscalation(el);
        try {
          (this.logger?.info?.(
            `[finalization-file-projection-sync] entering doSyncBack sessionId=${el.id}`,
          ),
            await this.doSyncBack(eA),
            this.logger?.info?.(
              `[finalization-file-projection-sync] doSyncBack returned sessionId=${el.id}`,
            ));
        } catch (ec) {
          let eA = ec;
          this.logger?.error?.(
            `[finalization-file-projection-sync] failed sessionId=${el.id} error=${eA?.message}`,
          );
        } finally {
          (ed.cancel(),
            this.logger?.info?.(
              `[finalization-file-projection-sync] done sessionId=${el.id} durationMs=${Date.now() - eu} notifyEscalated=${ed.wasEscalated()}`,
            ));
        }
      }
      async queryFileChanges(eA) {
        if (!this.sandboxLifecycle)
          return (
            this.logger?.info?.(
              "[finalization-file-projection-sync] sandboxLifecycle not available, skip QueryFileChanges",
            ),
            []
          );
        let el = this.sandboxLifecycle.getOpenedSessionId();
        if (!el)
          return (
            this.logger?.info?.(
              "[finalization-file-projection-sync] no opened sandbox session, skip QueryFileChanges",
            ),
            []
          );
        try {
          return (
            await this.sandboxLifecycle
              .getClient()
              .sendRequest(el, ad.SANDBOX_COMMANDS.QUERY_FILE_CHANGES, {})
          ).changes;
        } catch (ec) {
          let el = ec;
          return (
            this.logger?.info?.(
              `[finalization-file-projection-sync] QueryFileChanges failed sessionId=${eA} error=${el?.message}`,
            ),
            []
          );
        }
      }
      scheduleNotifyEscalation(eA) {
        let el = !1,
          ec = setTimeout(() => {
            (n5.AgentPhaseUtils.emit(
              eA,
              "finalization_file_projection_sync_notify",
            ),
              (el = !0),
              (ec = void 0),
              this.logger?.info?.(
                `[finalization-file-projection-sync] escalated to notify sessionId=${eA.id} afterMs=${am}`,
              ));
          }, am);
        return {
          cancel: () => {
            ec && (clearTimeout(ec), (ec = void 0));
          },
          wasEscalated: () => el,
        };
      }
      async doSyncBack(eA) {
        let el = eA.session,
          ec = el?.abortSignal;
        if (ec?.aborted)
          return void this.logger?.info?.(
            "[doSyncBack] aborted on entry, skip sync",
          );
        let eu = el?.id ?? "unknown",
          ed = await this.queryFileChanges(eu);
        if (0 === ed.length)
          return void this.logger?.info?.(
            `[doSyncBack] no file changes, skip SyncFileChanges sessionId=${eu}`,
          );
        let ep = [],
          eg = [];
        for (let eA of ed) {
          let el = !this.isWhitelisted(eA.relativePath);
          (el ? ep.push(eA) : eg.push(eA),
            this.logger?.info?.(
              `[doSyncBack]   changed: ${eA.relativePath} (changeType=${eA.changeType}, fileSize=${eA.fileSize ?? "unknown"}, effective=${el})`,
            ));
        }
        if (
          (this.logger?.info?.(
            `[doSyncBack] QueryFileChanges totalChanges=${ed.length} effective=${ep.length} whitelisted=${eg.length} sessionId=${eu}`,
          ),
          !this.sandboxLifecycle)
        )
          return void this.logger?.info?.(
            "[doSyncBack] sandboxLifecycle not available, skip SyncFileChanges",
          );
        let eh = this.sandboxLifecycle.getOpenedSessionId();
        if (!eh)
          return void this.logger?.info?.(
            "[doSyncBack] no opened sandbox session, skip SyncFileChanges",
          );
        let ef = this.sandboxLifecycle
          .getClient()
          .addReverseListener(
            {
              commands: [
                ad.SANDBOX_COMMANDS.SYNC_FILE_PROGRESS,
                ad.SANDBOX_COMMANDS.COMMIT_FILE_PROGRESS,
              ],
            },
            (eA) => {
              if (eA.command === ad.SANDBOX_COMMANDS.SYNC_FILE_PROGRESS) {
                let ec = eA.data;
                (this.logger?.info?.(
                  `[doSyncBack] SyncFileProgress ${ec.current}/${ec.total} path=${ec.relativePath} sessionId=${eu}`,
                ),
                  el?.phaseSubject?.next({
                    phase: "finalization_file_projection_sync_notify",
                    progress: {
                      kind: "sync",
                      current: ec.current,
                      total: ec.total,
                    },
                    startedAt: Date.now(),
                  }));
              } else if (
                eA.command === ad.SANDBOX_COMMANDS.COMMIT_FILE_PROGRESS
              ) {
                let ec = eA.data;
                (this.logger?.info?.(
                  `[doSyncBack] CommitFileProgress ${ec.current}/${ec.total} path=${ec.relativePath} sessionId=${eu}`,
                ),
                  el?.phaseSubject?.next({
                    phase: "finalization_file_projection_sync_notify",
                    progress: {
                      kind: "commit",
                      current: ec.current,
                      total: ec.total,
                    },
                    startedAt: Date.now(),
                  }));
              }
            },
          );
        try {
          let eA = await this.sandboxLifecycle
            .getClient()
            .sendRequest(eh, ad.SANDBOX_COMMANDS.SYNC_FILE_CHANGES, {
              paths: ed.map((eA) => eA.relativePath),
              useTrash: this.sandboxTurnConfig.enableDeleteProtection,
            });
          this.logger?.info?.(
            `[doSyncBack] SyncFileChanges completed totalChanges=${eA.totalChanges} sessionId=${eu}`,
          );
          let ec = new Set(ed.map((eA) => eA.relativePath)),
            ep = new Set(eA.changes.map((eA) => eA.relativePath)),
            eg = [...ec].filter((eA) => !ep.has(eA)),
            ef = [...ep].filter((eA) => !ec.has(eA));
          if (
            (eg.length > 0 &&
              this.logger?.info?.(
                `[doSyncBack] files in queryFileChanges but NOT in SyncFileChanges: ${eg.join(", ")} sessionId=${eu}`,
              ),
            ef.length > 0 &&
              this.logger?.info?.(
                `[doSyncBack] files in SyncFileChanges but NOT in queryFileChanges: ${ef.join(", ")} sessionId=${eu}`,
              ),
            this.sandboxTurnConfig.enableVersionControl)
          ) {
            let ec = this.resolveCommitMessage(el) ?? "finalization sync",
              ed = await this.sandboxLifecycle
                .getClient()
                .sendRequest(eh, ad.SANDBOX_COMMANDS.COMMIT_FILE_CHANGES, {
                  changes: eA.changes,
                  message: ec,
                });
            this.logger?.info?.(
              `[doSyncBack] CommitFileChanges completed commitId=${ed.commit.commitId} filesAffected=${ed.commit.files.length} sessionId=${eu}`,
            );
          } else
            this.logger?.info?.(
              `[doSyncBack] skipped CommitFileChanges (enableVersionControl=false) sessionId=${eu}`,
            );
        } finally {
          ef();
        }
      }
      isWhitelisted(eA) {
        for (let el of af)
          if (el.endsWith("/")) {
            if (eA.startsWith(el)) return !0;
          } else if (eA === el) return !0;
        return !1;
      }
      resolveCommitMessage(eA) {
        let el = ah.MessageContentUtils.getLatestRealUserMessage(eA?.history);
        if (!el) return;
        let ec = el.length > 200 ? `${el.slice(0, 200)}…` : el;
        return `用户消息: ${ec}`;
      }
    };
  let ay = "modify backup finalization",
    aw = 16,
    aB = class {
      constructor() {
        ((this.event = oH.HookEvent.FINAL_STOP),
          (this.priority = oH.HookPriority.Lowest),
          this.logger?.setContext?.("FinalizationModifyBackupHook"));
      }
      async execute(eA) {
        let el = eA.session;
        if (!el)
          return void this.logger?.info?.(
            "[finalization-modify-backup] skipped: no session",
          );
        if (!this.sandboxTurnConfig.enableFileBackup)
          return void this.logger?.info?.(
            `[finalization-modify-backup] skipped (enableFileBackup=false) sessionId=${el.id}`,
          );
        if (!this.sandboxLifecycle)
          return void this.logger?.info?.(
            `[finalization-modify-backup] skipped: sandboxLifecycle not available sessionId=${el.id}`,
          );
        let ec = this.sandboxLifecycle.getOpenedSessionId();
        if (!ec)
          return void this.logger?.info?.(
            `[finalization-modify-backup] skipped: no opened sandbox session sessionId=${el.id}`,
          );
        let eu = this.resolveCommitMessage(el) ?? ay,
          ed = Date.now();
        this.logger?.info?.(
          `[finalization-modify-backup] start sessionId=${el.id} sandboxSessionId=${ec} finalStopReason=${eA.final_stop_reason ?? "<unset>"}`,
        );
        try {
          let eA = await this.sandboxLifecycle
            .getClient()
            .sendRequest(ec, ad.SANDBOX_COMMANDS.COMMIT_MODIFY_BACKUP, {
              commitMsg: eu,
            });
          (this.logger?.info?.(
            `[finalization-modify-backup] CommitModifyBackup completed sessionId=${el.id} commitSeq=${eA.commitSeq} commitLabel=${eA.commitLabel} modifyBackupSessionCount=${eA.modifyBackupSessionCount ?? "<unset>"} totalModifyBackupSizeMb=${eA.totalModifyBackupSizeMb ?? "<unset>"} durationMs=${Date.now() - ed}`,
          ),
            void 0 !== eA.totalModifyBackupSizeMb &&
              void 0 !== eA.modifyBackupSessionCount &&
              this.telemetryReporter &&
              this.telemetryReporter.reportModifyBackupCommitted({
                totalModifyBackupSizeMb: eA.totalModifyBackupSizeMb,
                modifyBackupSessionCount: eA.modifyBackupSessionCount,
                fileBackupMaxSizeMb: this.sandboxTurnConfig.fileBackupMaxSizeMB,
                conversationId: el.id,
                conversationRequestId: el.conversationRequestId,
              }));
        } catch (ec) {
          let eA = ec;
          this.logger?.error?.(
            `[finalization-modify-backup] CommitModifyBackup failed sessionId=${el.id} durationMs=${Date.now() - ed} error=${eA?.message}`,
          );
        }
      }
      resolveCommitMessage(eA) {
        let el = ah.MessageContentUtils.getLatestRealUserMessage(eA.history);
        return el ? Array.from(el).slice(0, aw).join("") : void 0;
      }
    };
  let aI = class {
    constructor() {
      ((this.event = oH.HookEvent.SESSION_END),
        (this.priority = oH.HookPriority.Normal));
    }
    async execute(eA) {
      let el = eA.session;
      if (!el)
        return void this.logger?.info?.(
          "[SandboxCLISessionEndHook] skipped: no session",
        );
      if (!this.sandboxLifecycle)
        return void this.logger?.info?.(
          `[SandboxCLISessionEndHook] skipped: sandboxLifecycle not available sessionId=${el.id}`,
        );
      this.logger?.info?.(
        `[SandboxCLISessionEndHook] triggered reason=${eA.reason} sessionId=${el.id}`,
      );
      let ec = eA.reason ?? "other";
      if ("clear" !== ec && "resume" !== ec) {
        try {
          (await this.sandboxLifecycle.flushAccessTelemetry(
            `session_end:${ec}`,
          ),
            this.logger?.info?.(
              `[SandboxCLISessionEndHook] access telemetry flushed sessionId=${el.id} reason=${ec}`,
            ));
        } catch (eu) {
          let eA = eu;
          this.logger?.info?.(
            `[SandboxCLISessionEndHook] failed to flush access telemetry sessionId=${el.id} reason=${ec} error=${eA?.message}`,
          );
        }
        return;
      }
      try {
        (await this.sandboxLifecycle.stop(),
          this.logger?.info?.(
            `[SandboxCLISessionEndHook] sandbox-cli stopped gracefully sessionId=${el.id}`,
          ));
      } catch (ec) {
        let eA = ec;
        this.logger?.info?.(
          `[SandboxCLISessionEndHook] failed to stop sandbox-cli sessionId=${el.id} error=${eA?.message}`,
        );
      }
      if (this.cwdService) {
        let eA = process.cwd();
        (this.cwdService.setCwdState(eA),
          this.logger?.info?.(
            `[SandboxCLISessionEndHook] cwdState restored to process.cwd()=${eA} sessionId=${el.id}`,
          ));
      }
    }
  };
  return {
    DelegatingShellService: e_,
    FinalizationFileProjectionSyncHook: aE,
    FinalizationModifyBackupHook: aB,
    SandboxCLISessionEndHook: aI,
    getModule,
  };
}
