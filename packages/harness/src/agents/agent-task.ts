import { EventEmitter } from "node:events";
import { randomUUID } from "node:crypto";
import type { Agent, AgentInputItem } from "@openai/agents-core";
import type { Subscription } from "rxjs";
import type { AgentManager } from "./agent-manager.js";
import type { AgentService } from "./agent-service.js";
import type { AgentTaskOutputFileManager } from "./agent-task-output-file-manager.js";
import { RunResultUtils } from "./run-result-utils.js";
import { AGENT_TASK_INTERRUPTED_MESSAGE, categorizeFailure, isAgentTaskUserInterruption, sanitizeErrorForPrompt, type TeammateFailure } from "./teammate-failure.js";
import type { ProductAgent } from "../config/types.js";
import {
  isAgentAdminTrusted,
  type HookMap,
  type ScopedHookRegistry,
  type SessionHookManager,
  shouldRegisterFrontmatterHooks,
} from "../hooks/session-hooks.js";
import {
  inheritedSubagentPermissionMode,
  parsePermissionMode,
  permissionCeilingForParent,
  PermissionMode,
} from "../permissions/permission.js";
import type { InterruptionService } from "../permissions/interruption-service.js";
import type { HarnessSession } from "../sessions/session.js";
import type { SessionManager } from "../sessions/session-manager.js";
import { getActiveAgentOnlyHistory } from "../sessions/history-utils.js";
import type { SessionRunStateMachine } from "../sessions/run-state-machine.js";
import {
  extractTeammateProgress,
  type TeammateIdleTracker,
} from "../teams/teammate-idle-tracker.js";

export type AgentTaskStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled"
  | "killed";

export type AgentTaskConfig = {
  prompt: string;
  description: string;
  subagent_type?: string;
  resume?: string;
  model?: string;
  maxTurns?: number;
  permissionMode?: string;
  detached?: boolean;
  isFormalTeamMember?: boolean;
  isBackground?: boolean;
  captureOutput?: boolean;
  parentToolUseId?: string;
  teamContext?: {
    memberName?: string;
    teamName?: string;
    teamMembers?: string[];
    color?: string;
  };
  additionalHooks?: HookMap;
  additionalHooksSourceLabel?: string;
  additionalHooksAdminTrusted?: boolean;
};

export type AgentTaskResult = {
  content: string;
  sessionId: string;
  afterId?: string | undefined;
  lastId?: string | undefined;
  renderer: { type: "text" };
};

export type PreloadSkill = {
  name: string;
  instructions: string;
  baseDirectory?: string | undefined;
  source?: string | undefined;
  pluginInfo?: unknown;
};

export type AgentTaskLogger = {
  debug?(message: string, error?: unknown): void;
  info?(message: string, error?: unknown): void;
  warn?(message: string, error?: unknown): void;
  error?(message: string, error?: unknown): void;
};

export type AgentTaskRuntime = {
  hooks?: Pick<SessionHookManager, "executeSubagentStartHooks" | "executeSubagentStopHooks" | "executeTeammateIdleHooks">;
  scopedHooks?: Pick<ScopedHookRegistry, "register" | "unregister">;
  interruptions?: InterruptionService;
  idleTracker?: TeammateIdleTracker;
  outputFiles?: AgentTaskOutputFileManager;
  settings?: { get<T>(key: string): Promise<T | undefined> };
  skills?: readonly PreloadSkill[] | (() => Promise<readonly PreloadSkill[]>);
  renderSkill?: (skill: PreloadSkill) => string | Promise<string>;
  resolvePermissionMode?: (
    mainSession: HarnessSession,
  ) => PermissionMode | undefined | Promise<PermissionMode | undefined>;
  killBackgroundTasksBySessionId?: (sessionId: string) => void | Promise<void>;
  hasQueuedTeamWork?: (sessionId: string) => boolean;
  getTeamMember?: (name: string, teamName: string) => { lastFailure: TeammateFailure | undefined } | undefined;
  logger?: AgentTaskLogger;
};

type StreamedRunResult = {
  completed?: Promise<void>;
  error?: unknown;
  cancelled?: boolean;
  silentAbort?: boolean;
  finalOutput?: unknown;
};

export class AgentTask {
  readonly id = `agent-${randomUUID().replace(/-/g, "").slice(0, 8)}`;
  readonly events = new EventEmitter();
  status: AgentTaskStatus = "pending";
  error?: string;
  result: string | undefined;
  response: string | undefined;
  prompt: string | undefined;
  startTime = Date.now();
  endTime?: number;
  toolCallHistory: Array<{
    name: string;
    timestamp: number;
    arguments: unknown;
    status: "completed";
  }> = [];
  isDetached = false;
  outputFilePath?: string;
  tokenUsage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    lastContextWindow?: number;
  };

  private readonly controller = new AbortController();
  private readonly subscriptions: Subscription[] = [];
  private subAgentSession: HarnessSession | undefined;
  private agent: Agent<HarnessSession> | undefined;
  private executionResult: AgentTaskResult | undefined;
  private hasFixedPermissionMode = false;
  private mainAbortSignal: AbortSignal | undefined;
  private mainAbortListener: (() => void) | undefined;
  private completionCleanup: (() => void) | undefined;

  constructor(
    private readonly config: AgentTaskConfig,
    private readonly mainSession: HarnessSession,
    private readonly service: AgentService,
    private readonly agents: AgentManager,
    private readonly sessions: SessionManager,
    private readonly stateMachine: SessionRunStateMachine,
    private readonly runtime: AgentTaskRuntime = {},
  ) {
    this.isDetached = config.detached ?? false;
    this.prompt = config.prompt;
  }

  get title(): string { return this.config.description; }
  get description(): string { return this.config.description; }
  get abortController(): AbortController { return this.controller; }
  get agentType(): string | undefined { return this.config.subagent_type; }
  get mainSessionId(): string { return this.mainSession.id; }
  get memberName(): string | undefined { return this.config.teamContext?.memberName; }
  get teamContext(): AgentTaskConfig["teamContext"] { return this.config.teamContext; }
  get isTeamMember(): boolean { return Boolean(this.config.isFormalTeamMember); }
  get isBackground(): boolean { return this.isDetached; }

  async execute(): Promise<AgentTaskResult> {
    try {
      this.updateStatus("running");
      const { session } = await this.setupPhase();
      if (session.abortSignal.aborted) throw new Error("sub-agent task session is aborted");
      return await this.executePhaseWithRetry();
    } catch (error) {
      const normalized =
        error instanceof Error ? error : new Error(String(error));
      this.error = normalized.message;
      this.endTime = Date.now();
      const stream = this.subAgentSession?.resultSubject.value as
        | StreamedRunResult
        | undefined;
      const mainStream = this.mainSession.resultSubject.value as
        | StreamedRunResult
        | undefined;
      const silentAbort = Boolean(
        stream?.silentAbort === true ||
          mainStream?.silentAbort === true ||
          this.subAgentSession?.isCompressing === true ||
          this.mainSession.isCompressing === true,
      );
      if (this.status !== "killed" && this.status !== "cancelled") {
        if (silentAbort) this.updateStatus("completed");
        else if (isAgentTaskUserInterruption(error)) {
          this.updateStatus("cancelled");
        } else {
          this.updateStatus("failed");
          this.recordTeammateFailure(normalized.message, error);
        }
      }
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  /** The native name is retained: retries are driven externally, not a loop here. */
  async executePhaseWithRetry(input?: string): Promise<AgentTaskResult> {
    const session = this.subAgentSession!, afterId = lastHistoryId(session);
    const completion = this.waitForAgentCompletion();
    void completion.catch(() => undefined);
    try { await this.executeAgent(input); }
    catch (error) { if (!session.isCompressing) throw error; }
    const finalOutput = await completion;
    this.result = this.response = finalOutput;
    // Standalone persistence barrier, outside native completion arbitration.
    if (session.resultSubject.value && typeof session.resultSubject.value === "object") {
      await (session.resultSubject.value as StreamedRunResult).completed;
      await this.sessions.waitForResultHandled(session.resultSubject.value);
      await this.runtime.interruptions?.waitForResultHandled(session.resultSubject.value);
    }
    if (this.runtime.outputFiles && finalOutput) await this.captureFinalOutput(finalOutput);
    const sessionId = session.storeId ?? session.id, lastId = lastHistoryId(session);
    this.executionResult = { content: `${finalOutput}\n\n[Agent ID: ${sessionId}]`, sessionId, renderer: { type: "text" }, afterId, lastId };
    this.endTime = Date.now(); this.updateStatus("completed");
    return this.executionResult;
  }

  async executeAgent(input?: string): Promise<void> {
    const session = this.subAgentSession!;
    try { await this.runtime.hooks?.executeSubagentStartHooks(session); }
    catch (error) { this.runtime.logger?.error?.("SubagentStart hook dispatch failed:", error); }
    await this.service.run(this.agent!, input ?? this.config.prompt, { context: session, ...(this.config.maxTurns ? { maxTurns: this.config.maxTurns } : {}) });
  }

  async captureFinalOutput(output: string): Promise<void> {
    if (!this.runtime.outputFiles) return;
    try { await this.runtime.outputFiles.appendToOutputFileById(this.id, `\n--- RESULT ---\n${output}\n`); }
    catch (error) { this.runtime.logger?.warn?.("Failed to capture final output", error); }
  }

  cancel(): void {
    if (this.status !== "completed" && this.status !== "failed") {
      this.updateStatus("cancelled");
    }
    this.controller.abort();
    setTimeout(() => this.subAgentSession?.abortController.abort(), 0);
  }

  kill(): void {
    if (this.status !== "completed" && this.status !== "failed") {
      this.updateStatus("killed");
    }
    this.controller.abort();
    setTimeout(() => this.subAgentSession?.abortController.abort(), 0);
  }

  getResult(): AgentTaskResult | undefined {
    return this.executionResult;
  }

  getMainSession(): HarnessSession {
    return this.mainSession;
  }

  getSubAgentSession(): HarnessSession | undefined {
    return this.subAgentSession;
  }

  onStatusChange(
    listener: (event: {
      task: AgentTask;
      oldStatus: AgentTaskStatus;
      newStatus: AgentTaskStatus;
    }) => void,
  ): void {
    this.events.on("status-changed", listener);
  }

  offStatusChange(
    listener: (event: {
      task: AgentTask;
      oldStatus: AgentTaskStatus;
      newStatus: AgentTaskStatus;
    }) => void,
  ): void {
    this.events.off("status-changed", listener);
  }

  private async setupPhase(): Promise<{
    agent: Agent<HarnessSession>;
    agentName: string;
    agentConfig?: ProductAgent;
    session: HarnessSession;
  }> {
    const agentName = this.config.subagent_type ?? "general-purpose";
    const agent = (isForkSpecialization(agentName)
      ? await this.agents.getDefault()
      : await this.agents.get(agentName))!;
    this.agent = agent;
    const session = await this.setupSubAgentSession(agentName);
    this.subAgentSession = session;
    const agentConfig = await this.agents.getAgentConfig(agentName);
    session.agentPurpose = agentConfig?.tags?.includes("custom")
      ? `custom_agent:${agentName}`
      : `subagent:${agentName}`;
    if (!this.config.prompt.trimStart().startsWith("<system-reminder")) {
      session.originalUserIntent =
        this.config.prompt.length > 200
          ? `${this.config.prompt.slice(0, 200)}...`
          : this.config.prompt;
    }
    await this.registerFrontmatterHooks(agentConfig, agentName, session);
    this.applyAgentReasoningOverride(agentConfig, session);
    if (this.runtime.outputFiles) {
      this.outputFilePath =
        await this.runtime.outputFiles.createOutputFile(this.id);
    }
    await this.configurePermissionMode(session, agentName);
    this.setupSessionSubscriptions(session);
    await this.runtime.interruptions?.waitFor(session);
    this.setupMainAbortListener(session);
    await this.preloadFrontmatterSkills(agentConfig, session);
    return {
      agent,
      agentName,
      ...(agentConfig ? { agentConfig } : {}),
      session,
    };
  }

  private async setupSubAgentSession(
    agentName: string,
  ): Promise<HarnessSession> {
    if (this.config.resume) {
      const resumed = await this.sessions.get(this.config.resume);
      if (resumed) {
        resumed.abortController = new AbortController();
        resumed.abortSignal = resumed.abortController.signal;
        if (!this.stateMachine.isIdle(resumed)) {
          this.stateMachine.forceIdle(
            resumed,
            "sub-agent-resume-stale-state",
          );
        }
        restoreResumedSubAgentMeta(resumed, { mainSession: this.mainSession, taskId: this.id, taskName: this.config.description, agentName, teamContext: this.config.teamContext });
        // Native SessionFactory always allocates a fresh result subject; the
        // standalone SessionManager caches live objects instead. Drop its stale
        // result at this host boundary before installing native completion hooks.
        resumed.resultSubject.next(undefined);
        if (!resumed.lastMessageId) {
          for (
            let index = resumed.history.length - 1;
            index >= 0;
            index -= 1
          ) {
            const item = resumed.history[index] as AgentInputItem & {
              id?: string;
            };
            if (item.id && !isCustomInputItem(item)) {
              resumed.lastMessageId = item.id;
              break;
            }
          }
        }
        this.sessions.initRunResultHandler(resumed);
        this.inheritAllowRules(resumed);
        return resumed;
      }
    }

    const model = await this.resolveAgentModel(agentName);
    const agentConfig = await this.agents.getAgentConfig(agentName);
    const disallowedTools = Array.from(
      new Set([
        ...(this.mainSession.options.disallowedTools ?? []),
        ...(agentConfig?.disallowedTools ?? []),
      ]),
    );
    const sessionId = randomUUID();
    const parentModel = this.mainSession.requestOptions.model;
    const session = await this.sessions.create({
      id: sessionId,
      storeId: this.id,
      options: {
        ...this.mainSession.options,
        ...(model ? { model } : {}),
        ...(disallowedTools.length > 0 ? { disallowedTools } : {}),
      },
      requestOptions: {
        ...(model ? { model } : parentModel ? { model: parentModel } : {}),
      },
      meta: {
        sessionId,
        agentName,
        isBackgroundTaskSession: false,
        parentSessionId: this.mainSession.id,
        taskId: this.id,
        taskName: this.config.description,
        planFilePath: this.mainSession.meta.planFilePath,
        prePlanPermissionMode: this.mainSession.meta.prePlanPermissionMode,
        ...(this.config.teamContext
          ? { teamContext: this.config.teamContext }
          : {}),
        rootRequestId:
          this.mainSession.meta.rootRequestId ??
          this.mainSession.conversationRequestId,
        parentConversationId: this.mainSession.id,
      },
      agentName,
    });
    if (
      isForkSpecialization(agentName) &&
      this.mainSession.history.length > 0
    ) {
      const forkHistory = deepCloneHistory(getActiveAgentOnlyHistory(this.mainSession.history, {
        lastMessageId: this.mainSession.lastMessageId, hasCompactedHistory: this.mainSession.hasCompactedHistory,
      }));
      session.history.push(...forkHistory);
      const lastId = lastHistoryId(session);
      if (lastId) session.lastMessageId = lastId;
    }
    this.inheritAllowRules(session);
    return session;
  }

  private inheritAllowRules(session: HarnessSession): void {
    const parent = this.mainSession.toolPermissionContext.allowRules.session;
    if (parent.length > 0) {
      session.toolPermissionContext.allowRules.session = [
        ...session.toolPermissionContext.allowRules.session,
        ...parent,
      ];
    }
  }

  private async resolveAgentModel(
    _agentName: string,
  ): Promise<string | undefined> {
    try {
      const environment = process.env.CODEBUDDY_CODE_SUBAGENT_MODEL?.trim();
      const fromEnvironment = Boolean(environment && !isInheritedModel(environment));
      const configured = fromEnvironment ? environment : this.config.model?.trim();
      if (!configured || isInheritedModel(configured)) return undefined;
      const resolved = await this.agents.resolveModel(configured);
      if (resolved?.disabled) return undefined;
      return resolved?.id ?? (fromEnvironment ? configured : undefined);
    } catch { return undefined; }
  }

  private async configurePermissionMode(
    session: HarnessSession,
    agentName: string,
  ): Promise<void> {
    const parent = this.mainSession.permissionModeSubject.value;
    const ceiling = permissionCeilingForParent(parent);
    if (ceiling) {
      this.hasFixedPermissionMode = true;
      session.meta.permissionModeCeiling = ceiling;
      session.permissionModeSubject.next(ceiling);
      return;
    }
    const requested =
      parsePermissionMode(this.config.permissionMode) ??
      parsePermissionMode((await this.agents.getAgentConfig(agentName))?.permissionMode);
    if (requested && requested !== PermissionMode.Ignore) {
      this.hasFixedPermissionMode = true;
      session.permissionModeSubject.next(requested);
      if (requested === PermissionMode.Plan) {
        session.meta.subAgentPlanModeLocked = true;
      }
      return;
    }
    const configured = await this.runtime.resolvePermissionMode?.(
      this.mainSession,
    );
    session.permissionModeSubject.next(
      configured ?? inheritedSubagentPermissionMode(parent),
    );
  }

  private setupSessionSubscriptions(session: HarnessSession): void {
    this.subscriptions.push(
      session.inputSubject.subscribe((item) => {
        const usage = item.providerData?.usage;
        if (usage) {
          this.mainSession.usage.add(usage);
          this.tokenUsage ??= {
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
          };
          this.tokenUsage.inputTokens += usage.inputTokens ?? 0;
          this.tokenUsage.outputTokens += usage.outputTokens ?? 0;
          this.tokenUsage.totalTokens += usage.totalTokens ?? 0;
          if (usage.inputTokens) {
            this.tokenUsage.lastContextWindow = usage.inputTokens;
          }
        }
        const raw = item as unknown as {
          type?: string;
          name?: string;
          arguments?: unknown;
          role?: string;
          providerData?: Record<string, unknown>;
        };
        if (raw.type === "function_call" && raw.name) {
          void this.captureToolCall(raw.name, raw.arguments);
        }
        if (this.isDetached) {
          if (usage) {
            this.mainSession.inputSubject.next({
              ...item,
              _fromSubAgent: true,
            });
          }
          return;
        }
        if (
          isUserInterruptedItem(raw) ||
          (raw.type === "message" && raw.role === "user") ||
          session.isCompressing
        ) {
          return;
        }
        this.mainSession.inputSubject.next({ ...item, _fromSubAgent: true });
      }),
    );
    if (!this.isDetached) {
      this.subscriptions.push(
        session.modelSubject.subscribe((value) =>
          this.mainSession.modelSubject.next(value),
        ),
        session.phaseSubject.subscribe((value) => {
          if (
            value.phase !== "idle" &&
            !this.stateMachine.isIdle(this.mainSession)
          ) {
            this.mainSession.phaseSubject.next({ ...value });
          }
        }),
        session.combineSubject.subscribe((value) => {
          if (value.type !== "result" && !session.isCompressing) {
            this.mainSession.combineSubject.next({
              ...value,
              ...(this.config.parentToolUseId
                ? { parentToolUseId: this.config.parentToolUseId }
                : {}),
            });
          }
        }),
      );
    }
    if (this.config.isFormalTeamMember && !this.isDetached) {
      this.subscriptions.push(
        this.stateMachine.getChange$(session).subscribe(() => {
          if (!this.stateMachine.isIdle(session)) return;
          const teamName = this.config.teamContext?.teamName;
          const memberName =
            this.config.teamContext?.memberName ?? session.agentName;
          if (!teamName || !memberName) return;
          void this.runtime.hooks?.executeTeammateIdleHooks(this.mainSession, {
            teammateName: memberName,
            teamName,
          });
          this.runtime.idleTracker?.markAgentEnd(
            teamName,
            memberName,
            session.id,
            this.runtime.hasQueuedTeamWork?.(session.id) ?? false,
          );
        }),
        session.combineSubject.subscribe((event) => {
          if (event.type !== "input") return;
          const teamName = this.config.teamContext?.teamName;
          const memberName =
            this.config.teamContext?.memberName ?? session.agentName;
          if (teamName && memberName && this.runtime.idleTracker) {
            extractTeammateProgress(
              event.data,
              this.runtime.idleTracker,
              teamName,
              memberName,
            );
          }
        }),
      );
    }
    this.subscriptions.push(
      this.mainSession.permissionModeSubject.subscribe((mode) => {
        if (!this.hasFixedPermissionMode) {
          session.permissionModeSubject.next(
            inheritedSubagentPermissionMode(mode),
          );
        }
      }),
    );
  }

  private setupMainAbortListener(session: HarnessSession): void {
    if (this.config.isFormalTeamMember) return;
    this.mainAbortSignal = this.mainSession.abortSignal;
    this.mainAbortListener = () => {
      const result = this.mainSession.resultSubject.value as
        | StreamedRunResult
        | undefined;
      if (result?.silentAbort || this.mainSession.isCompressing) return;
      session.abortController.abort();
    };
    this.mainAbortSignal.addEventListener("abort", this.mainAbortListener);
    if (this.mainAbortSignal.aborted) this.mainAbortListener();
  }

  async waitForAgentCompletion(): Promise<string> {
    return new Promise((resolve, reject) => {
      let settled = false, stateSubscription: Subscription | undefined;
      const tryResolveFromResult = async (_source: string) => {
        const session = this.subAgentSession;
        if (settled || !session) return;
        const result = session.resultSubject.value as any;
        if (result && RunResultUtils.isStream(result)) {
          if (result.error) {
            if (session.meta.retryInProgress || session.isCompressing) return;
            settled = true; reject(result.error instanceof Error ? result.error : new Error(String(result.error))); return;
          } else if (result.cancelled) {
            if (session.isCompressing) return;
            settled = true; reject(new Error(AGENT_TASK_INTERRUPTED_MESSAGE)); return;
          }
        }
        if (!result || !RunResultUtils.isFinalOutput(result)) {
          if (session.abortSignal.aborted && !session.isCompressing) { settled = true; reject(new Error(AGENT_TASK_INTERRUPTED_MESSAGE)); }
          return;
        }
        if (session.isCompressing) return;
        settled = true;
        try { await this.runtime.hooks?.executeSubagentStopHooks(session, result); }
        catch (error) { this.runtime.logger?.error?.("SubagentStop hook failed:", error); }
        try { resolve(result.finalOutput ?? "Task completed"); }
        catch (error) { resolve((error as any)?.toString()); }
      };
      const forceTermination = () => {
        settled = true; stateSubscription?.unsubscribe();
        if (this.subAgentSession) this.subAgentSession.isCompressing = false;
        reject(new Error(AGENT_TASK_INTERRUPTED_MESSAGE));
      };
      const signals = new Set<AbortSignal>();
      const registerAbort = () => { const signal = this.subAgentSession?.abortSignal; if (signal) { signals.add(signal); signal.addEventListener("abort", abortHandler, { once: true }); } };
      const abortHandler = () => {
        if (settled) return;
        if (this.status === "cancelled" || this.status === "killed") { forceTermination(); return; }
        if (this.subAgentSession?.isCompressing === true) {
          void (async () => {
            const startedAt = Date.now();
            while (Date.now() - startedAt < 120_000) {
              if (settled) return;
              if (this.status === "cancelled" || this.status === "killed") { forceTermination(); return; }
              if (!this.subAgentSession?.isCompressing) break;
              await new Promise((done) => setTimeout(done, 200));
            }
            if (settled) return;
            if (this.subAgentSession?.abortSignal && !this.subAgentSession.abortSignal.aborted) registerAbort();
            const state = this.subAgentSession?.agentState;
            if (!settled && (!state || state === "agent_end")) await tryResolveFromResult("post_compression_idle");
          })().catch(() => undefined);
          return;
        }
        settled = true; stateSubscription?.unsubscribe(); reject(new Error(AGENT_TASK_INTERRUPTED_MESSAGE));
      };
      const onEnd = async () => {
        const session = this.subAgentSession;
        if (settled || !session) return;
        if (session.isCompressing) { await tryResolveFromResult("agent_end_event"); return; }
        session.abortSignal.removeEventListener("abort", abortHandler); stateSubscription?.unsubscribe();
        await tryResolveFromResult("agent_end_event");
      };
      registerAbort();
      this.agent?.on("agent_end", onEnd);
      const session = this.subAgentSession;
      stateSubscription = session ? this.stateMachine.getChange$(session, true).subscribe(async () => {
        if (!this.subAgentSession || !this.stateMachine.isIdle(this.subAgentSession) || settled) return;
        if (this.subAgentSession.isCompressing) { await tryResolveFromResult("runState_idle"); return; }
        this.subAgentSession.abortSignal.removeEventListener("abort", abortHandler); stateSubscription?.unsubscribe();
        await tryResolveFromResult("runState_idle");
      }) : undefined;
      // Host teardown additionally removes abort listeners on replaced signals.
      this.completionCleanup = () => { settled = true; stateSubscription?.unsubscribe(); this.agent?.off("agent_end", onEnd); for (const signal of signals) signal.removeEventListener("abort", abortHandler); };
      if (session && this.stateMachine.isIdle(session) && !session.isCompressing) void tryResolveFromResult("already_agent_end");
    });
  }

  recordTeammateFailure(message: string, error?: unknown): void {
    try {
      const name = this.memberName ?? this.config.teamContext?.memberName, team = this.config.teamContext?.teamName;
      if (!this.config.isFormalTeamMember || !name || !team) return;
      const member = this.runtime.getTeamMember?.(name, team); if (!member) return;
      member.lastFailure = { error: sanitizeErrorForPrompt(error ?? message) || "Unknown error", occurredAt: Date.now(), category: categorizeFailure(error ?? message) };
    } catch (error) { this.runtime.logger?.warn?.("Failed to record teammate failure on registry", error); }
  }

  private applyAgentReasoningOverride(
    agent: ProductAgent | undefined,
    session: HarnessSession,
  ): void {
    if (!agent) return;
    const custom = agent.tags?.includes("custom") === true;
    if (agent.thinkingEnabled === false) {
      if (custom) {
        this.runtime.logger?.warn?.(
          `[AgentTask] Agent '${agent.name}' thinkingEnabled=false ignored: not allowed for custom/plugin agents`,
        );
      } else {
        this.sessions.setOverrideThinking(session.id, {
          thinkingEnabled: false,
        });
        return;
      }
    }
    const effort = normalizeReasoningEffort(agent.effort);
    if (effort) {
      this.sessions.setOverrideThinking(session.id, {
        reasoningEffort: effort,
      });
    }
  }

  private async registerFrontmatterHooks(
    agent: ProductAgent | undefined,
    agentName: string,
    session: HarnessSession,
  ): Promise<void> {
    if (!this.runtime.scopedHooks) return;
    let allowUntrusted = false;
    try {
      allowUntrusted =
        (await this.runtime.settings?.get<boolean>(
          "allowUntrustedFrontmatterHooks",
        )) === true;
    } catch (error) {
      this.runtime.logger?.warn?.(
        "[AgentTask] Failed to read allowUntrustedFrontmatterHooks, treating as false",
        error,
      );
    }
    const merged: HookMap = {};
    const sources: string[] = [];
    const skipped: string[] = [];
    const ingest = (
      hooks: HookMap | undefined,
      source: string,
      trusted: boolean,
    ): void => {
      if (!hooks || typeof hooks !== "object") return;
      if (!shouldRegisterFrontmatterHooks(trusted, allowUntrusted)) {
        if (Object.keys(hooks).length > 0) skipped.push(source);
        return;
      }
      let count = 0;
      for (const [event, definitions] of Object.entries(hooks)) {
        if (!Array.isArray(definitions) || definitions.length === 0) continue;
        merged[event] = [...(merged[event] ?? []), ...definitions];
        count += definitions.length;
      }
      if (count > 0) sources.push(source);
    };
    ingest(agent?.hooks, `agent '${agentName}'`, isAgentAdminTrusted(agent));
    ingest(
      this.config.additionalHooks,
      this.config.additionalHooksSourceLabel ?? "task",
      this.config.additionalHooksAdminTrusted === true,
    );
    if (skipped.length > 0) {
      this.runtime.logger?.warn?.(
        `[AgentTask] Frontmatter hooks from ${skipped.join(" + ")} skipped (source not admin-trusted; enable \`allowUntrustedFrontmatterHooks\` in settings to allow)`,
      );
    }
    if (Object.keys(merged).length > 0) {
      this.runtime.scopedHooks.register(session.id, merged, {
        isAgent: true,
        sourceLabel: sources.join(" + "),
      });
    }
  }

  private async preloadFrontmatterSkills(
    agent: ProductAgent | undefined,
    session: HarnessSession,
  ): Promise<void> {
    const requested = agent?.skills ?? [];
    if (requested.length === 0) return;
    const skills =
      typeof this.runtime.skills === "function"
        ? await this.runtime.skills()
        : (this.runtime.skills ?? []);
    if (skills.length === 0) {
      this.runtime.logger?.warn?.(
        `[AgentTask] No skills available in product config; skipping preload of ${requested.length} skill(s) for agent '${agent?.name}': [${requested.map((name) => `'${name}'`).join(", ")}]`,
      );
      return;
    }
    const items: AgentInputItem[] = [];
    for (const requestedName of requested) {
      const skill = this.resolveSkillNameForPreload(
        requestedName,
        skills,
        agent,
      );
      if (!skill) {
        items.push(
          this.buildPreloadItem(
            `<system-reminder>Skill '${requestedName}' was requested in agent frontmatter but failed to preload (skill not found in product config). Its instructions are NOT available in this context. Do not assume the skill's content is loaded.</system-reminder>`,
          ),
        );
        continue;
      }
      try {
        const instructions = this.runtime.renderSkill
          ? await this.runtime.renderSkill(skill)
          : skill.instructions;
        const content = [
          `<skill-preloaded name="${skill.name}">`,
          ...(skill.baseDirectory
            ? [`Base directory for this skill: ${skill.baseDirectory}`]
            : []),
          instructions,
          "</skill-preloaded>",
        ].join("\n");
        items.push(this.buildPreloadItem(content));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        items.push(
          this.buildPreloadItem(
            `<system-reminder>Skill '${skill.name}' was requested in agent frontmatter but failed to preload (render failed — ${message}). Its instructions are NOT available in this context. Do not assume the skill's content is loaded.</system-reminder>`,
          ),
        );
      }
    }
    if (items.length > 0) await this.sessions.addHistory(session, items);
  }

  private resolveSkillNameForPreload(
    requested: string,
    skills: readonly PreloadSkill[],
    agent: ProductAgent | undefined,
  ): PreloadSkill | undefined {
    const exact = skills.find((skill) => skill.name === requested);
    if (exact) return exact;
    if (!requested.includes(":") && agent?.tags?.includes("plugin")) {
      const lastTag = agent.tags.at(-1);
      if (lastTag && lastTag !== "plugin") {
        const pluginName = lastTag.split("@")[0]!;
        const qualified = skills.find(
          (skill) => skill.name === `${pluginName}:${requested}`,
        );
        if (qualified) return qualified;
      }
    }
    if (!requested.includes(":")) {
      const suffixMatches = skills.filter((skill) =>
        skill.name.endsWith(`:${requested}`),
      );
      if (suffixMatches.length > 1) {
        this.runtime.logger?.warn?.(
          `[AgentTask] Ambiguous skill '${requested}' for agent '${agent?.name}' matches multiple: ${suffixMatches.map((skill) => `"${skill.name}"`).join(", ")}; picking first: "${suffixMatches[0]!.name}"`,
        );
      }
      return suffixMatches[0];
    }
    return undefined;
  }

  private buildPreloadItem(text: string): AgentInputItem {
    return {
      id: randomUUID(),
      type: "message",
      role: "user",
      content: [{ type: "input_text", text }],
      providerData: { isMeta: true, skipRun: true },
    } as unknown as AgentInputItem;
  }

  private async captureToolCall(name: string, args: unknown): Promise<void> {
    this.toolCallHistory.push({
      name,
      timestamp: Date.now(),
      arguments: args,
      status: "completed",
    });
    await this.runtime.outputFiles?.appendToOutputFileById(
      this.id,
      `[Tool: ${name}] ${JSON.stringify({ arguments: args })}\n`,
    );
  }

  private async cleanup(): Promise<void> {
    this.completionCleanup?.(); this.completionCleanup = undefined;
    if (this.subAgentSession?.id) {
      try { this.runtime.scopedHooks?.unregister(this.subAgentSession.id); } catch {}
      try { await this.runtime.killBackgroundTasksBySessionId?.(this.subAgentSession.id); } catch {}
    }
    for (const subscription of this.subscriptions) subscription.unsubscribe();
    this.subscriptions.length = 0;
    if (this.mainAbortListener && this.mainAbortSignal) {
      this.mainAbortSignal.removeEventListener(
        "abort",
        this.mainAbortListener,
      );
      this.mainAbortListener = undefined;
      this.mainAbortSignal = undefined;
    }
    this.events.removeAllListeners();
    if (!this.config.isFormalTeamMember) this.subAgentSession = undefined;
  }

  private updateStatus(status: AgentTaskStatus): void {
    const oldStatus = this.status;
    this.status = status;
    const event = { task: this, oldStatus, newStatus: status };
    this.events.emit("status-changed", event);
    this.events.emit("status", status);
  }
}

function isInheritedModel(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return normalized === "default" || normalized === "inherit";
}

function isForkSpecialization(agentName: string | undefined): boolean {
  return (
    agentName === "fork" &&
    !["1", "true", "yes", "on"].includes(
      (process.env.CODEBUDDY_DISABLE_FORK_SUBAGENT ?? "").toLowerCase(),
    )
  );
}

function normalizeReasoningEffort(
  value: string | undefined,
): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  return ["minimal", "low", "medium", "high", "xhigh", "max"].includes(
    normalized,
  )
    ? normalized
    : undefined;
}

function lastHistoryId(session: HarnessSession): string | undefined {
  const last = session.history.at(-1) as
    | (AgentInputItem & { id?: string })
    | undefined;
  return last?.id;
}

function deepCloneHistory(history: AgentInputItem[]): AgentInputItem[] {
  return history.map((entry) => {
    const source = entry as unknown as Record<string, unknown>;
    return {
      ...source,
      ...(Array.isArray(source.content)
        ? {
            content: source.content.map((block) =>
              block && typeof block === "object" ? { ...block } : block,
            ),
          }
        : {}),
      ...(source.providerData && typeof source.providerData === "object"
        ? { providerData: { ...source.providerData } }
        : {}),
    } as unknown as AgentInputItem;
  });
}

function isCustomInputItem(item: AgentInputItem): boolean {
  const type = (item as unknown as { type?: string }).type;
  return Boolean(type && ["goal-result", "goal-progress"].includes(type));
}

function isUserInterruptedItem(item: {
  type?: string;
  providerData?: Record<string, unknown>;
}): boolean {
  return (
    item.type === "user_interrupted" ||
    item.providerData?.userInterrupted === true
  );
}

export function restoreResumedSubAgentMeta(session: HarnessSession, options: { mainSession: HarnessSession; taskId: string; taskName: string; agentName: string; teamContext?: AgentTaskConfig["teamContext"] }): void {
  const { mainSession: main, taskId, taskName, agentName, teamContext } = options;
  const meta = session.meta ??= {};
  meta.parentSessionId ??= main.id;
  meta.taskId ??= session.storeId ?? taskId;
  meta.taskName ??= taskName;
  meta.agentName ??= agentName;
  meta.isBackgroundTaskSession ??= false;
  meta.planFilePath ??= main.meta.planFilePath;
  meta.prePlanPermissionMode ??= main.meta.prePlanPermissionMode;
  if (teamContext) meta.teamContext = teamContext;
  meta.rootRequestId ??= main.meta.rootRequestId ?? main.conversationRequestId;
  meta.parentConversationId ??= main.id;
}
