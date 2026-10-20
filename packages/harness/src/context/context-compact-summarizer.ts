import { randomUUID } from "node:crypto";
import type { AgentInputItem } from "@openai/agents-core";
import type { AgentManager } from "../agents/agent-manager.js";
import type { AgentService } from "../agents/agent-service.js";
import type { ProductConfiguration } from "../config/product-config.js";
import type { ProductPromptRenderer } from "../prompts/prompt-renderer.js";
import type { SessionManager } from "../sessions/session-manager.js";
import type { HarnessSession } from "../sessions/session.js";
import type { SessionRunStateMachine } from "../sessions/run-state-machine.js";
import type { InterruptionService } from "../permissions/interruption-service.js";
import { estimateTrailingToolResultTokens, fillFunctionCallResultHistory, getCompactionBoundaryHistory, isCustomHistoryItem, type HistoryItem } from "../sessions/history-utils.js";
import { HistoryEngineeringCompactor } from "./history-engineering-compactor.js";
import { removeLastToolResultFromHistory, sanitizeItemsForSummaryAgent, takeRecentRounds } from "./compact-utils.js";
import {
  COMPACT_FALLBACK_ROUNDS, CompactType, DEFAULT_MAX_CONSECUTIVE_COMPACT, DEFAULT_TOKEN_THRESHOLD,
  getAutocompactThresholdOverride, getEngineeringCompactSufficiencyRatio, resolveCompactTriggerAt,
  SUMMARY_MAX_TOKENS,
} from "./compact-config.js";

export type CompactOptions = {
  force?: boolean;
  type?: CompactType;
  tokenThreshold?: number;
  skipContinue?: boolean;
  continueInput?: AgentInputItem[];
  customInstructions?: string;
};
export type CompactLogger = {
  info?(message: string): void;
  warn?(message: string, error?: unknown): void;
  error?(message: string, error?: unknown): void;
};
export type CompactRuntime = {
  settings?: { get<T>(key: string): Promise<T | undefined> };
  interruptions?: InterruptionService;
  logger?: CompactLogger;
  executePreCompactHooks?: (session: HarnessSession, trigger: string, instructions?: string) => Promise<string | undefined>;
  executePostCompactHooks?: (session: HarnessSession, trigger: string, summary: string) => Promise<void>;
  createCheckpoint?: (session: HarnessSession) => Promise<void>;
  broadcastStarted?: (session: HarnessSession, type: CompactType) => Promise<string | undefined>;
  broadcastCompleted?: (session: HarnessSession, summary: string, messageId: string | undefined, type: CompactType) => Promise<void>;
  broadcastCancelled?: (session: HarnessSession) => Promise<void>;
  broadcastLimitReached?: (session: HarnessSession) => Promise<void>;
};

export class CompactSummaryNotFoundError extends Error {
  constructor() {
    super("No compact summary (e.g. <summary>…</summary>) could be extracted from the compact-agent output.");
    this.name = "CompactSummaryNotFoundError";
  }
}

/** Product strategies, using the installed SDK only for summary/continue runs. */
export class ContextCompactSummarizerImpl {
  constructor(
    private readonly product: ProductConfiguration,
    private readonly agents: AgentManager,
    private readonly service: AgentService,
    private readonly sessions: SessionManager,
    private readonly stateMachine: SessionRunStateMachine,
    private readonly prompts: ProductPromptRenderer,
    private readonly runtime: CompactRuntime = {},
  ) {}

  async compactAndSummarize(session: HarnessSession, options: CompactOptions = {}): Promise<boolean> {
    if (session.isCompressing) return false;
    const type = options.type ?? CompactType.USER_COMMAND;
    delete session.meta.compactBlockedByPendingInterruption;
    if (type !== CompactType.EMERGENCY_AUTO) session.consecutiveMaxTokenCompactCount = 0;
    const pending = this.runtime.interruptions?.pending$.value;
    const main = this.runtime.interruptions?.findMainSession(session);
    if ((pending && pending.mainSessionId === main?.id) || session.interruptionSubject.value) {
      session.meta.compactBlockedByPendingInterruption = true;
      return false;
    }
    if (!options.force && await this.runtime.settings?.get<boolean>("autoCompactEnabled") === false) return false;
    const result = session.resultSubject.value as any;
    if (!session.history.length || result?.lastAgent?.name === "compact") return false;
    const isSubAgent = Boolean(session.meta.parentSessionId || session.meta.taskId);
    const thresholds = this.product.raw.tokenUsageThresholds?.inputTokens;
    const threshold = options.tokenThreshold || getAutocompactThresholdOverride() ||
      (isSubAgent ? thresholds?.subAgentEmergency : undefined) || thresholds?.emergency || DEFAULT_TOKEN_THRESHOLD;
    const defaultAgent = await this.agents.getDefault();
    const name = isSubAgent ? session.agentName || result?.lastAgent?.name || defaultAgent.name : defaultAgent.name;
    const model = await this.agents.getModel(name);
    const latest = latestInputTokens(session);
    const tokens = latest + (latest > 0 ? estimateTrailingToolResultTokens(session.history) : 0);
    if (!options.force && type !== CompactType.PRE_MESSAGE_AUTO &&
      (tokens < resolveCompactTriggerAt(model.maxInputTokens, threshold) || (!isSubAgent && result?.lastAgent?.name !== defaultAgent.name))) return false;
    try {
      if (type === CompactType.PRE_MESSAGE_AUTO || type === CompactType.USER_COMMAND)
        return await this.preMessage(session, { ...options, type });
      if (type === CompactType.EMERGENCY_AUTO) return await this.maxToken(session, options);
      return await this.blocking(session, options);
    } catch (error) {
      this.runtime.logger?.warn?.(`[Compact] Strategy failed (${type})`, error);
      return false;
    }
  }

  async preMessage(session: HarnessSession, options: CompactOptions): Promise<boolean> {
    session.isCompressing = true;
    try {
      const original = session.history;
      const engineering = HistoryEngineeringCompactor.compact(original);
      if (!engineering.compactContent) return false;
      const agent = await this.agents.getDefault();
      const model = await this.agents.getModel(agent.name);
      const sufficientAt = (model.maxInputTokens ?? 128_000) * getEngineeringCompactSufficiencyRatio();
      let content = engineering.compactContent;
      let isSummary = false;
      if (engineering.estimatedTokens > sufficientAt) {
        const summary = await this.runSummary(session, [message(engineering.compactContent), message(this.renderSummaryPrompt(false))], "context_summary_pre_message").catch((error) => {
          this.runtime.logger?.warn?.("[Compact:PreMessage] LLM summary failed:", error);
          return undefined;
        });
        if (summary?.trim()) { content = summary.trim(); isSummary = true; }
        else content = this.engineeringFallback(original) ?? engineering.compactContent;
      }
      const type = options.type ?? CompactType.USER_COMMAND;
      await this.appendSummary(session, content, isSummary, type);
      if (!isSummary) session.agentPurpose = "conversation:compact";
      this.markCompactionComplete(session, "compact-pre-message");
      if (type === CompactType.USER_COMMAND) {
        const id = await this.bestEffort(() => this.runtime.broadcastStarted?.(session, type));
        await this.bestEffort(() => this.runtime.broadcastCompleted?.(session,
          isSummary ? content : `Engineering compact: ${engineering.originalItemCount} items → ${engineering.estimatedTokens} estimated tokens`, id, type));
      }
      if (options.skipContinue) return true;
      if (options.continueInput?.length) return this.sendContinueMessage(session, agent.name, options.continueInput);
      return true;
    } finally { session.isCompressing = false; }
  }

  async maxToken(session: HarnessSession, options: CompactOptions): Promise<boolean> {
    const max = Number(this.product.raw.tokenUsageThresholds?.maxConsecutiveTokenLimitSummary ?? DEFAULT_MAX_CONSECUTIVE_COMPACT);
    if (session.consecutiveMaxTokenCompactCount >= max) {
      session.meta.compactLimitReached = true;
      await this.abortCurrentStreamAndWait(session);
      await this.bestEffort(() => this.runtime.broadcastLimitReached?.(session));
      return false;
    }
    session.consecutiveMaxTokenCompactCount += 1;
    const original = session.history.slice();
    const originalLastId = session.lastMessageId;
    const previousAgent = session.agentName;
    const previousCompressing = session.isCompressing;
    const ownsCompactType = !session.meta.compactType;
    const restoreHistory = (): void => {
      session.history.splice(0, session.history.length, ...original);
      assignOptional(session, "lastMessageId", originalLastId);
    };
    try {
      session.isCompressing = true;
      if (ownsCompactType) session.meta.compactType = CompactType.EMERGENCY_AUTO;
      await this.abortCurrentStreamAndWait(session);
      session.progressSubject.next("compacting");
      const broadcastId = await this.bestEffort(() => this.runtime.broadcastStarted?.(session, CompactType.EMERGENCY_AUTO));
      const trimmed = getCompactionBoundaryHistory(session.history as HistoryItem[])
        .filter((item) => item.providerData?.isSystemWarning !== true) as AgentInputItem[];
      if (!trimmed.length) throw new Error("Smart boundary trim produced empty history");
      let summary = await this.runMaxTokenSummary(session, trimmed).catch((error) => {
        this.runtime.logger?.warn?.("[Compact:MaxToken] First Summary Agent runDefault call failed:", error);
        return undefined;
      });
      if (!summary?.trim() && session.isCompressing && !session.abortSignal.aborted) {
        const retryInput = removeLastToolResultFromHistory(trimmed);
        if (retryInput) summary = await this.runMaxTokenSummary(session, retryInput).catch((error) => {
          this.runtime.logger?.warn?.("[Compact:MaxToken] Retry Summary Agent runDefault call also failed:", error);
          return undefined;
        });
      }
      const isSummary = Boolean(summary?.trim());
      const content = isSummary ? `<conversation_history_summary>\n${summary!.trim()}\n</conversation_history_summary>`
        : session.isCompressing && !session.abortSignal.aborted ? this.engineeringFallback(original) : undefined;
      if (!content || !session.isCompressing || session.abortSignal.aborted) {
        restoreHistory();
        if (session.abortSignal.aborted || !session.isCompressing) session.meta.compactCancelled = true;
        await this.bestEffort(() => this.runtime.broadcastCancelled?.(session));
        this.emitCancelledResult(session);
        return false;
      }
      restoreHistory();
      await this.appendSummary(session, content, isSummary, CompactType.EMERGENCY_AUTO);
      this.markCompactionComplete(session, "compact-max-token");
      await this.bestEffort(() => this.runtime.broadcastCompleted?.(session, isSummary ? summary!.trim() : content, broadcastId, CompactType.EMERGENCY_AUTO));
      assignOptional(session, "agentName", previousAgent);
      session.isCompressing = previousCompressing;
      if (ownsCompactType) delete session.meta.compactType;
      delete session.meta.userInitiatedAbort;
      return options.skipContinue ? true : this.sendContinueMessage(session, previousAgent);
    } finally {
      assignOptional(session, "agentName", previousAgent);
      session.isCompressing = previousCompressing;
      if (ownsCompactType) delete session.meta.compactType;
      session.progressSubject.next(undefined);
    }
  }

  /** The legacy compact-agent strategy remains available as an explicit fallback. */
  async blocking(session: HarnessSession, options: CompactOptions): Promise<boolean> {
    const type = options.type ?? CompactType.USER_COMMAND;
    const previousAgent = session.agentName ?? (session.resultSubject.value as any)?.lastAgent?.name;
    const previousModel = session.requestOptions.model;
    const previousLastId = session.lastMessageId;
    const previousResult = session.resultSubject.value;
    session.isCompressing = true;
    delete session.meta.compactCancelled;
    const ownsType = !session.meta.compactType;
    if (ownsType) session.meta.compactType = type;
    if (!options.skipContinue) session.meta.compactExpectsContinue = true;
    try {
      const compactAgent = (await this.agents.get("compact"))!;
      await this.abortCurrentStreamAndWait(session);
      const trigger = options.force ? "manual" : "auto";
      const instructions = await this.bestEffort(() => this.runtime.executePreCompactHooks?.(session, trigger, options.customInstructions));
      if (instructions) { session.hookContexts ??= {}; session.hookContexts.preCompactInstructions = instructions; }
      await this.bestEffort(() => this.runtime.createCheckpoint?.(session));
      const input = message(type === CompactType.USER_COMMAND ? "/compact" : "/_compact");
      (input as HistoryItem).providerData = { skipRun: type === CompactType.USER_COMMAND, isCompactInternal: true, compactType: type };
      if (type !== CompactType.PRE_MESSAGE_AUTO) session.progressSubject.next(session.meta.parentSessionId ? `${session.agentName || "Subagent"} · Compacting context` : "compacting");
      await this.service.run(compactAgent, [input], { context: session });
      const result = session.resultSubject.value as any;
      if (!result?.completed) throw new Error("Compact result is not a stream");
      await result.completed;
      await this.sessions.waitForResultHandled(result);
      const output = String(result.finalOutput ?? "");
      const summary = output.match(/<summary>([\s\S]+?)<\/summary>/i)?.[1]?.trim() ??
        output.match(/<conversation_history_summary>([\s\S]+?)<\/conversation_history_summary>/i)?.[1]?.trim();
      if (!summary) throw new CompactSummaryNotFoundError();
      this.markCompactionComplete(session, "compact-blocking");
      await this.bestEffort(() => this.runtime.executePostCompactHooks?.(session, trigger, summary));
      return options.skipContinue ? true : this.sendContinueMessage(session, previousAgent, options.continueInput);
    } catch (error) {
      if (session.abortSignal.aborted) { session.meta.compactCancelled = true; await this.bestEffort(() => this.runtime.broadcastCancelled?.(session)); }
      if ((session.resultSubject.value as any)?.lastAgent?.name === "compact") session.resultSubject.next(previousResult);
      assignOptional(session, "lastMessageId", previousLastId);
      this.runtime.logger?.warn?.("Blocking compaction failed:", error);
      return false;
    } finally {
      assignOptional(session, "agentName", previousAgent);
      assignOptional(session.requestOptions, "model", previousModel);
      session.isCompressing = false;
      session.progressSubject.next(undefined);
      if (!this.stateMachine.isIdle(session)) this.stateMachine.forceIdle(session, "compact-reset-agent-state");
      if (ownsType) delete session.meta.compactType;
      delete session.meta.compactExpectsContinue;
    }
  }

  async abortCurrentStreamAndWait(session: HarnessSession): Promise<void> {
    const result = session.resultSubject.value as any;
    if (!result?.completed || !this.stateMachine.isBusy(session)) return;
    result.silentAbort = true;
    session.meta.userInitiatedAbort = true;
    session.abortController.abort();
    result.lastAgent?.emit?.("agent_end", result.state?._context, "");
    const deadline = Date.now() + 5_000;
    while (!this.stateMachine.isIdle(session) && Date.now() < deadline) await delay(100);
    if (!this.stateMachine.isIdle(session)) this.stateMachine.forceIdle(session, "compact-abort-wait-timeout");
    session.abortController = new AbortController();
    session.abortSignal = session.abortController.signal;
    await delay(50);
  }

  async sendContinueMessage(session: HarnessSession, previousAgent?: string, overrideInput?: AgentInputItem[]): Promise<boolean> {
    await this.bestEffort(() => this.sessions.emitSessionStart(session, "compact"));
    const text = session.meta.parentSessionId && session.originalUserIntent
      ? `Please continue based on the summarized context above. Your original task was: "${session.originalUserIntent}" Maintain the same approach and level of detail.`
      : "Please continue with the conversation based on the summarized context above. Maintain the same level of detail and helpfulness as before the summarization.";
    const input = overrideInput?.length ? overrideInput : [message(text, { isCompactInternal: true, ...(session.meta.compactType ? { compactType: session.meta.compactType } : {}) })];
    try {
      const name = previousAgent || session.agentName;
      const agent = (name ? await this.agents.get(name) : await this.agents.getDefault())!;
      session.agentName = agent.name;
      if (!this.stateMachine.isIdle(session)) this.stateMachine.forceIdle(session, "compact-continue");
      session.meta.compactContinueInProgress = true;
      await this.service.run(agent, input, { context: session });
      return true;
    } catch (error) {
      this.runtime.logger?.warn?.("[sendContinueMessage] agentService.run failed (may recover):", error);
      this.stateMachine.forceIdle(session, "compact-continue-failure");
      return false;
    } finally { delete session.meta.compactContinueInProgress; }
  }

  private async runMaxTokenSummary(session: HarnessSession, history: AgentInputItem[]): Promise<string | undefined> {
    session.history.splice(0, session.history.length, ...history);
    assignOptional(session, "lastMessageId", lastHistoryId(history));
    const sanitized = sanitizeItemsForSummaryAgent(history.filter((item) => !isCustomHistoryItem(item as HistoryItem)));
    const input = [...fillFunctionCallResultHistory(sanitized), message(this.renderSummaryPrompt(true))];
    return this.runSummary(session, input, "context_summary_max_token");
  }

  private async runSummary(session: HarnessSession, input: AgentInputItem[], purpose: string): Promise<string | undefined> {
    const summaryAgent = (await this.agents.get("contextSummary"))!;
    summaryAgent.modelSettings = { ...(await this.agents.getDefault()).modelSettings };
    summaryAgent.modelSettings.maxTokens ??= SUMMARY_MAX_TOKENS;
    const previous = session.agentPurpose;
    session.agentPurpose = purpose;
    try { return (await this.service.runOneTime("contextSummary", input, { context: session })).trim() || undefined; }
    finally { assignOptional(session, "agentPurpose", previous); }
  }

  private renderSummaryPrompt(maxToken: boolean): string {
    return this.prompts.render(maxToken ? "context-summary-max-token-prompt" : "context-summary-prompt");
  }

  private engineeringFallback(history: AgentInputItem[]): string | undefined {
    return HistoryEngineeringCompactor.compact(takeRecentRounds(history, COMPACT_FALLBACK_ROUNDS)).compactContent || undefined;
  }

  private async appendSummary(session: HarnessSession, content: string, isSummary: boolean, compactType: CompactType): Promise<void> {
    await this.sessions.addHistory(session, [message(content, { compactType, isCompacted: true, isCompactInternal: true, isSummary })]);
    await this.sessions.save(session);
  }

  private markCompactionComplete(session: HarnessSession, reason: string): void {
    session.lastCompactTimestamp = Date.now();
    session.hasCompactedHistory = true;
    session.compactMessageGeneration += 1;
    session.historyReloadSubject.next({ reason });
  }

  private emitCancelledResult(session: HarnessSession): void {
    const result = session.resultSubject.value as any;
    if (result) { result.__cancelNudge = true; session.resultSubject.next(result); }
  }

  private async bestEffort<T>(operation: () => T | Promise<T>): Promise<Awaited<T> | undefined> {
    try { return await operation(); }
    catch (error) { this.runtime.logger?.warn?.("[Compact] Optional runtime callback failed:", error); return undefined; }
  }
}

function message(text: string, providerData: Record<string, unknown> = {}): AgentInputItem {
  return { id: randomUUID(), type: "message", role: "user", content: [{ type: "input_text", text }], providerData: { skipRun: false, ...providerData } } as AgentInputItem;
}
function lastHistoryId(history: AgentInputItem[]): string | undefined {
  return (history as HistoryItem[]).findLast((item) => typeof item.id === "string" && item.id.length > 0)?.id;
}
function assignOptional<T extends object, K extends keyof T>(target: T, key: K, value: T[K] | undefined): void {
  if (value === undefined) delete target[key]; else target[key] = value;
}
function delay(ms: number): Promise<void> { return new Promise((resolve) => setTimeout(resolve, ms)); }
function latestInputTokens(session: HarnessSession): number {
  const responses = (session.resultSubject.value as any)?.rawResponses ?? [];
  return responses.findLast((response: any) => typeof response.usage?.inputTokens === "number")?.usage?.inputTokens ?? 0;
}
