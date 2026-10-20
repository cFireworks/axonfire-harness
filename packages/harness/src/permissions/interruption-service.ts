import type {
  Agent,
  AgentInputItem,
  RunState,
  RunToolApprovalItem,
} from "@openai/agents-core";
import { BehaviorSubject, type Subscription } from "rxjs";
import { AsyncLocalStorage } from "node:async_hooks";
import { createNativeInterruptionResultDispatcher } from "./native-interruption-result-dispatcher.js";
import { PermissionMode } from "./permission.js";
import type { HarnessSession } from "../sessions/session.js";
import type { SessionRunStateMachine } from "../sessions/run-state-machine.js";
import {
  createDefaultRejectedResult,
  type RawFunctionCall,
} from "../tools/tool-rejection.js";
import { InterruptedByUserError } from "../models/model-error-utils.js";
import { InterruptionRetryPolicy, InterruptionStreamRecovery, MODEL_ERROR_RETRY_MARKER, MODEL_ERROR_RETRY_CHECK_WINDOW, MODEL_ERROR_MAX_RETRIES, NETWORK_ERROR_RETRY_MARKER, NETWORK_ERROR_RETRY_CHECK_WINDOW, sanitizeToolNotFoundMessage, type StreamRecoveryRuntime } from "./interruption-stream-recovery.js";

export type TeamApprovalContext = {
  memberName?: string;
  color?: string;
};

export type PendingInterruption = {
  item: RunToolApprovalItem;
  sourceSessionId: string;
  mainSessionId: string;
  teamContext?: TeamApprovalContext;
  queuePosition: 1;
  queueTotal: number;
};

export type InterruptionLogger = {
  debug?(message: string): void;
  info?(message: string): void;
  warn?(message: string): void;
  error?(message: string, error?: unknown): void;
};

export type ApprovalScope = "session" | "project" | "user";

export type ChannelPermissionDecision =
  | "allow"
  | "allow_always"
  | "deny"
  | "deny_and_exit_plan";

export type ChannelPermissionAdapter = {
  createPermissionRequest(
    toolCallId: string,
    toolName: string,
    title: string,
    details: string,
  ): Promise<ChannelPermissionDecision>;
  cancelRequest(toolCallId: string): void | Promise<void>;
};

export type PermissionBroadcastService = {
  broadcastPermissionResolved(
    mainSessionId: string,
    toolCallId: string,
    toolName: string,
    decision: string,
  ): void | Promise<void>;
  broadcastInterruptionRequest?(
    mainSessionId: string,
    item: RunToolApprovalItem,
  ): void | Promise<void>;
};

export type InterruptionServiceOptions = {
  /** Complete native waitFor/result dispatch, with explicit standalone ownership. */
  resultDispatch?: {
    getDefaultAgent(): Promise<Agent<HarnessSession>>;
    beforeResult?(session: HarnessSession, result: object): Promise<void>;
    executeStopHooks(session: HarnessSession, result: unknown, options?: { stopReason?: string; stopHookActive?: boolean }): Promise<void>;
  };
  recovery?: StreamRecoveryRuntime;
  logger?: InterruptionLogger;
  isAlwaysApproved?: (
    session: HarnessSession,
    item: RunToolApprovalItem,
  ) => boolean;
  approveAlways?: (
    session: HarnessSession,
    item: RunToolApprovalItem,
    scope: ApprovalScope,
  ) => void;
  isMandatoryApproval?: (
    session: HarnessSession,
    item: RunToolApprovalItem,
  ) => boolean | Promise<boolean>;
  onContinue?: (
    agent: Agent<HarnessSession> | undefined,
    state: RunState<HarnessSession, Agent<HarnessSession>>,
    session: HarnessSession,
  ) => void | Promise<void>;
  onRejected?: (
    session: HarnessSession,
    item: RunToolApprovalItem,
    reason: unknown,
  ) => void | Promise<void>;
  resolveRejectedResult?: (
    toolName: string,
    rawItem: RawFunctionCall,
    session: HarnessSession,
  ) => AgentInputItem[] | Promise<AgentInputItem[]>;
  onRejectedResults?: (
    session: HarnessSession,
    item: RunToolApprovalItem,
    results: AgentInputItem[],
    reason: unknown,
  ) => void | Promise<void>;
  channelPermissionAdapter?: ChannelPermissionAdapter;
  permissionBroadcast?: PermissionBroadcastService;
  executeNotificationHooks?: (
    session: HarnessSession,
    message: string,
    type: "permission_prompt",
  ) => void | Promise<void>;
};

type QueueEntry = {
  item: RunToolApprovalItem;
  session: HarnessSession;
  deferred: Deferred;
  teamContext?: TeamApprovalContext;
};

class Deferred {
  readonly promise: Promise<void>;
  private settled = false;
  private readonly resolvePromise: () => void;
  private readonly rejectPromise: (reason: unknown) => void;

  constructor() {
    let resolvePromise!: () => void;
    let rejectPromise!: (reason: unknown) => void;
    this.promise = new Promise<void>((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });
    this.resolvePromise = resolvePromise;
    this.rejectPromise = rejectPromise;
  }

  resolve(): void {
    if (this.settled) return;
    this.settled = true;
    this.resolvePromise();
  }

  reject(reason: unknown = new Error("Tool call rejected")): void {
    if (this.settled) return;
    this.settled = true;
    this.rejectPromise(reason);
  }
}

export class SessionAbortedError extends Error {
  constructor(message = "Session aborted while awaiting tool approval") {
    super(message);
    this.name = "SessionAbortedError";
  }
}

/**
 * Serializes Agents SDK approval interruptions and routes child/team approvals
 * onto the parent session UI. Queue and metadata behavior match WorkBuddy 5.3.14.
 */
export class InterruptionService {
  static readonly MODEL_ERROR_RETRY_MARKER = MODEL_ERROR_RETRY_MARKER;
  static readonly MODEL_ERROR_RETRY_CHECK_WINDOW = MODEL_ERROR_RETRY_CHECK_WINDOW;
  static readonly MODEL_ERROR_MAX_RETRIES = MODEL_ERROR_MAX_RETRIES;
  static readonly NETWORK_ERROR_RETRY_MARKER = NETWORK_ERROR_RETRY_MARKER;
  static readonly NETWORK_ERROR_RETRY_CHECK_WINDOW = NETWORK_ERROR_RETRY_CHECK_WINDOW;
  static sanitizeToolNotFoundMessage = sanitizeToolNotFoundMessage;
  readonly pending$ = new BehaviorSubject<PendingInterruption | undefined>(
    undefined,
  );

  private readonly pendingInterruptions = new Map<
    string,
    Map<RunToolApprovalItem, Deferred>
  >();
  private readonly itemToSessionMap = new Map<
    RunToolApprovalItem,
    HarnessSession
  >();
  private readonly interruptionQueues = new Map<string, QueueEntry[]>();
  private readonly parentIdToMainSession = new Map<string, HarnessSession>();
  private readonly childToMainSession = new Map<string, HarnessSession>();
  private readonly waitForSubscriptions = new WeakMap<
    HarnessSession,
    Subscription
  >();
  private readonly resultHandling = new WeakMap<object, Promise<void>>();
  private readonly resultFailures = new WeakMap<object, unknown>();
  private readonly retryPolicy = new InterruptionRetryPolicy();
  private readonly recovery: InterruptionStreamRecovery | undefined;
  readonly nativeResultDispatcher?: ReturnType<typeof createNativeInterruptionResultDispatcher>;
  private readonly nativeSessions = new Set<HarnessSession>();
  private readonly nativeResultContext = new AsyncLocalStorage<object>();
  private readonly nativeContinuations = new WeakMap<object, Set<Promise<void>>>();
  private readonly nativeTimers = new Set<ReturnType<typeof setTimeout>>();

  constructor(
    private readonly stateMachine: SessionRunStateMachine,
    private readonly options: InterruptionServiceOptions = {},
  ) {
    this.recovery = options.recovery ? new InterruptionStreamRecovery(stateMachine, options.recovery) : undefined;
    if (options.resultDispatch) {
      const dispatch = options.resultDispatch, recovery = options.recovery;
      if (!recovery) throw new Error("Native result dispatch requires explicit recovery service dependencies");
      const before = async (session: HarnessSession) => {
        const result = this.nativeResultContext.getStore() ?? session.resultSubject.value;
        if (result && typeof result === "object") await dispatch.beforeResult?.(session, result);
      };
      const logger = Object.fromEntries(["info", "debug", "warn", "error"].map(name => [name, (...args: any[]) => {
        const method = options.logger?.[name as keyof InterruptionLogger] as any;
        method?.(...args);
      }]));
      this.nativeResultDispatcher = createNativeInterruptionResultDispatcher({
        service: {
          run: async (...args: any[]) => { await before(args[2].context); return (recovery.service.run as any)(...args); },
          runDefault: async (...args: any[]) => { await before(args[1].context); return (recovery.service.runDefault as any)(...args); },
        },
        getDefaultAgent: () => dispatch.getDefaultAgent(), stateMachine,
        getTasks: () => recovery.getTasks?.() ?? [], describeDeferredTool: name => recovery.describeDeferredTool?.(name),
        isDeferredDispatchEnabled: () => recovery.isDeferredDispatchEnabled?.() ?? false,
        sleep: recovery.sleep ?? (ms => new Promise(resolve => setTimeout(resolve, ms))), now: Date.now,
        setImmediate: callback => {
          const result = this.nativeResultContext.getStore();
          let done!: () => void;
          const completion = new Promise<void>(resolve => { done = resolve; });
          if (result) { const pending = this.nativeContinuations.get(result) ?? new Set(); pending.add(completion); this.nativeContinuations.set(result, pending); }
          return setImmediate(() => { void Promise.resolve().then(callback).catch(error => options.logger?.error?.("Native continuation host failed", error)).finally(done); });
        },
        setTimeout: (callback, ms) => { const timer = setTimeout(() => { this.nativeTimers.delete(timer); callback(); }, ms); this.nativeTimers.add(timer); return timer; },
        clearTimeout: timer => { clearTimeout(timer); this.nativeTimers.delete(timer); },
        subscribe: (session: HarnessSession, callback) => {
          this.nativeSessions.add(session);
          const subscription = session.resultSubject.subscribe((value: any) => {
            if (!value || typeof value !== "object" || this.resultHandling.has(value)) return;
            const handling = this.nativeResultContext.run(value, () => callback(value)).catch(error => {
              this.resultFailures.set(value, error); options.logger?.error?.("Native result dispatch failed", error);
            });
            this.resultHandling.set(value, handling);
          });
          this.waitForSubscriptions.set(session, subscription);
          return subscription;
        },
      }, {
        logger, stateMachine, waitForSubscriptions: new WeakSet(),
        parentIdToMainSession: this.parentIdToMainSession, childToMainSession: this.childToMainSession,
        sessionHookManager: { executeStopHooks: async (session: HarnessSession, result: any, config: any) => {
          await dispatch.beforeResult?.(session, result); await dispatch.executeStopHooks(session, result, config);
        } },
        handleInterruptions: (session: HarnessSession, items: RunToolApprovalItem[]) => this.handleInterruptions(session, items, session.resultSubject.value as any),
      });
    }
  }

  hasRecentModelErrorRetry(session: HarnessSession): boolean { return this.retryPolicy.hasRecentModelErrorRetry(session); }
  hasRecentNetworkErrorRetry(session: HarnessSession): boolean { return this.retryPolicy.hasRecentNetworkErrorRetry(session); }
  incrementStreamTimeoutRetryCount(session: HarnessSession, firstToken: boolean): void { this.retryPolicy.incrementStreamTimeoutRetryCount(session, firstToken); }
  hasRecentStreamTimeoutRetry(session: HarnessSession, firstToken: boolean): boolean { return this.retryPolicy.hasRecentStreamTimeoutRetry(session, firstToken); }
  getResultError(result: object): unknown { return this.resultFailures.get(result); }

  approve(
    item: RunToolApprovalItem,
    options: { alwaysApprove?: boolean; scope?: ApprovalScope } = {},
  ): boolean {
    const raw = mutableRawItem(item);
    const name = toolName(item);
    const id = toolCallId(item);
    const sandboxResolve = raw.providerData?._sandboxResolve;
    if (typeof sandboxResolve === "function") {
      sandboxResolve(options.alwaysApprove ? "allow_session" : "allow_once");
      const source = this.findSessionByItem(item);
      if (source) {
        this.broadcastResolved(
          this.findMainSession(source),
          item,
          options.alwaysApprove ? "allowAll" : "allow",
        );
      }
      if (raw.providerData?._enqueuedViaQueue && source) {
        this.dequeueSandboxItem(source, item);
      }
      return true;
    }

    const session = this.findSessionByItem(item);
    if (!session?.state) {
      this.options.logger?.warn?.(
        `[Approve] Failed: Cannot find state for tool: ${name}, id: ${id}`,
      );
      return false;
    }
    const pending = this.getPendingMapForSession(session).get(item);
    if (!pending) return false;
    if (options.alwaysApprove) {
      const scope = options.scope ?? "session";
      this.options.approveAlways?.(session, item, scope);
      session.state.approve(item, { alwaysApprove: true });
    } else {
      session.state.approve(item);
    }
    this.broadcastResolved(
      this.findMainSession(session),
      item,
      options.alwaysApprove ? "allowAll" : "allow",
    );
    pending.resolve();
    this.dequeue(this.findMainSession(session), item);
    return true;
  }

  reject(
    item: RunToolApprovalItem,
    options: { decision?: string } = {},
  ): boolean {
    const raw = mutableRawItem(item);
    const sandboxResolve = raw.providerData?._sandboxResolve;
    if (typeof sandboxResolve === "function") {
      sandboxResolve(false);
      const source = this.findSessionByItem(item);
      if (source) {
        this.broadcastResolved(this.findMainSession(source), item, "deny");
      }
      if (raw.providerData?._enqueuedViaQueue && source) {
        this.dequeueSandboxItem(source, item);
      }
      return true;
    }

    const session = this.findSessionByItem(item);
    if (!session?.state) return false;
    const pending = this.getPendingMapForSession(session).get(item);
    if (!pending) return false;
    this.broadcastResolved(
      this.findMainSession(session),
      item,
      options.decision ?? "deny",
    );
    pending.reject(new Error(options.decision ?? "deny"));
    this.dequeue(this.findMainSession(session), item);
    return true;
  }

  cancelAllForSession(sessionId: string, reason: string): number {
    const queue = this.interruptionQueues.get(sessionId);
    if (!queue?.length) return 0;
    const copy = queue.slice();
    let rejected = 0;
    for (const entry of copy) {
      try {
        this.pendingInterruptions.get(entry.session.id)?.delete(entry.item);
        this.itemToSessionMap.delete(entry.item);
        const sandboxResolve = mutableRawItem(entry.item).providerData
          ?._sandboxResolve;
        if (typeof sandboxResolve === "function") sandboxResolve(false);
        entry.deferred.reject(new Error(reason));
        rejected += 1;
      } catch (error) {
        this.options.logger?.warn?.(
          `[cancelAllForSession] Failed to cancel item: ${String(error)}`,
        );
      }
    }
    queue.length = 0;
    this.interruptionQueues.delete(sessionId);
    const main = this.findMainSession(copy[0]!.session);
    if (main.id === sessionId) main.interruptionSubject.next(undefined);
    if (this.pending$.value?.mainSessionId === sessionId) {
      const next = this.findNextActiveQueue();
      if (next && copy.some((entry) => this.isSandboxQueueItem(entry.item))) {
        this.showHeadById(next.sessionId, next.queue);
      } else {
        this.pending$.next(undefined);
      }
    }
    return rejected;
  }

  async handleInterruptions(
    session: HarnessSession,
    items: readonly RunToolApprovalItem[],
    result?: {
      state: RunState<HarnessSession, Agent<HarnessSession>>;
      lastAgent?: Agent<HarnessSession>;
    },
  ): Promise<void> {
    if (result) session.state = result.state;
    const state = session.state;
    if (!state || session.abortSignal.aborted) return;
    const pending = this.getPendingMapForSession(session);
    let rejected = false;

    for (const item of items) {
      if (session.abortSignal.aborted) break;
      if (pending.has(item)) continue;
      const name = toolName(item);
      if (await this.shouldAutoApprove(session, item, pending)) {
        state.approve(item);
        continue;
      }

      const main = this.findMainSession(session);
      const team = session.meta.teamContext as TeamApprovalContext | undefined;
      const deferred = this.enqueue(main, item, session, team);
      this.stateMachine.transition(session, "permission_wait");
      const abort = () => deferred.reject(new SessionAbortedError());
      session.abortSignal.addEventListener("abort", abort, { once: true });
      try {
        const callId = toolCallId(item);
        const hookResult = callId
          ? session.preToolUseHookResults?.get(callId)
          : undefined;
        if (
          hookResult?.permissionDecision === "ask" &&
          hookResult.permissionDecisionReason
        ) {
          const raw = mutableRawItem(item);
          raw.providerData ??= {};
          raw.providerData.permissionDecisionReason =
            hookResult.permissionDecisionReason;
        }
        await this.options.executeNotificationHooks?.(
          session,
          `needs your permission to use ${name}`,
          "permission_prompt",
        );
        await this.awaitPermissionDecision(session, item, deferred);
      } catch (error) {
        rejected = true;
        pending.delete(item);
        this.itemToSessionMap.delete(item);
        this.dequeue(main, item);
        state.reject(item);
        const results = await this.buildRejectedResults(session, item, error);
        if (results.length > 0) {
          session.combineSubject.next({
            type: "interrupt_result",
            data: results,
          });
          await this.options.onRejectedResults?.(
            session,
            item,
            results,
            error,
          );
        }
        if (this.options.onRejected) {
          await this.options.onRejected(session, item, error);
        }
      } finally {
        session.abortSignal.removeEventListener("abort", abort);
      }
    }

    for (const item of items) this.itemToSessionMap.delete(item);
    pending.clear();
    if (!rejected && items.length > 0 && this.options.onContinue) {
      await this.options.onContinue(result?.lastAgent, state, session);
    }
  }

  async waitFor(session: HarnessSession): Promise<void> {
    if (this.nativeResultDispatcher) { await this.nativeResultDispatcher.waitFor(session); return; }
    if (this.waitForSubscriptions.has(session)) return;
    this.registerSession(session);
    const subscription = session.resultSubject.subscribe((value) => {
      const result = asStreamResult(value);
      if (!result) return;
      if (this.resultHandling.has(value as object)) return;
      const handling = (async () => {
        try {
          await result.completed;
          if (session.abortSignal.aborted) { if (this.options.recovery) throw new InterruptedByUserError(); return; }
          session.state = result.state;
          const interruptions = result.interruptions?.slice() ?? [];
          const hasInterruptions = interruptions.length > 0;
          (result as any)._hasInterruptions=hasInterruptions;
          session.combineSubject.next({
            type: "result",
            data: result,
            hasInterruptions,
          });
          await this.handleInterruptions(session, interruptions, result);
          if (this.recovery) await this.recovery.handleCompleted(session, result);
        } catch (error) {
          this.resultFailures.set(value as object, error);
          if (this.recovery) await this.recovery.handleError(session, result, error);
          else this.options.logger?.error?.(`[InterruptionService] result handling failed for ${session.id}`, error);
        } finally {
          session.resultAbortSignalMap.delete(value as object);
          session.headlessCompletionDeferred?.resolve();
        }
      })().catch((error) => { this.resultFailures.set(value as object, error); this.options.logger?.error?.(`[InterruptionService] recovery failed for ${session.id}`, error); });
      this.resultHandling.set(value as object, handling);
    });
    this.waitForSubscriptions.set(session, subscription);
  }

  /** Host completion barrier: includes approval decisions and continuation publication. */
  async waitForResultHandled(result: object): Promise<void> {
    await this.resultHandling.get(result);
    const pending = this.nativeContinuations.get(result);
    if (pending) { await Promise.all(pending); this.nativeContinuations.delete(result); }
  }

  disposeSession(session: HarnessSession): void {
    this.waitForSubscriptions.get(session)?.unsubscribe();
    this.waitForSubscriptions.delete(session);
    this.nativeResultDispatcher?.waitForSubscriptions.delete(session);
    this.nativeSessions.delete(session);
    if (!this.nativeSessions.size) { for (const timer of this.nativeTimers) clearTimeout(timer); this.nativeTimers.clear(); }
    this.cancelAllForSession(
      this.findMainSession(session).id,
      "session disposed",
    );
    this.parentIdToMainSession.delete(session.id);
    this.childToMainSession.delete(session.id);
  }

  findSessionByItem(item: RunToolApprovalItem): HarnessSession | undefined {
    return this.itemToSessionMap.get(item);
  }

  findMainSession(session: HarnessSession): HarnessSession {
    const parentId = session.meta.parentSessionId;
    if (typeof parentId === "string") {
      const parent = this.parentIdToMainSession.get(parentId);
      if (parent) return parent;
    } else {
      const cached = this.childToMainSession.get(session.id);
      if (cached) return cached;
    }
    return session;
  }

  enqueueSandboxApproval(
    session: HarnessSession,
    item: RunToolApprovalItem,
  ): void {
    const main = this.findMainSession(session);
    const team = session.meta.teamContext as TeamApprovalContext | undefined;
    this.enqueue(main, item, session, team);
  }

  getQueue(mainSessionId: string): readonly QueueEntry[] {
    return this.interruptionQueues.get(mainSessionId)?.slice() ?? [];
  }

  private registerSession(session: HarnessSession): void {
    const parentId = session.meta.parentSessionId;
    if (typeof parentId === "string") {
      const main = this.parentIdToMainSession.get(parentId);
      if (main) this.childToMainSession.set(session.id, main);
      return;
    }
    if (!this.parentIdToMainSession.has(session.id)) {
      this.parentIdToMainSession.set(session.id, session);
    }
  }

  private async shouldAutoApprove(
    session: HarnessSession,
    item: RunToolApprovalItem,
    pending: Map<RunToolApprovalItem, Deferred>,
  ): Promise<boolean> {
    const name = toolName(item);
    if (name === "AskUserQuestion") return false;
    const mode = session.permissionModeSubject.value;
    if (mode === PermissionMode.FullAccess) return true;
    if (
      mode === PermissionMode.AcceptEdits &&
      ["Write", "Edit", "MultiEdit", "NotebookEdit"].includes(name)
    ) {
      return true;
    }
    if (mode === PermissionMode.BypassPermissions) {
      const mandatory = await this.options.isMandatoryApproval?.(session, item);
      if (!mandatory && !isDangerousBash(item)) return true;
    }
    if (this.options.isAlwaysApproved?.(session, item)) return true;
    return [...pending.keys()].some((pendingItem) => {
      return toolName(pendingItem) === name;
    });
  }

  private enqueue(
    main: HarnessSession,
    item: RunToolApprovalItem,
    source: HarnessSession,
    teamContext?: TeamApprovalContext,
  ): Deferred {
    const deferred = new Deferred();
    const entry: QueueEntry = {
      item,
      session: source,
      deferred,
      ...(teamContext ? { teamContext } : {}),
    };
    const queue = this.interruptionQueues.get(main.id) ?? [];
    if (!this.interruptionQueues.has(main.id)) {
      this.interruptionQueues.set(main.id, queue);
    }
    queue.push(entry);
    this.getPendingMapForSession(source).set(item, deferred);
    this.itemToSessionMap.set(item, source);
    if (queue.length === 1) {
      const global = this.pending$.value;
      if (
        !(
          this.isSandboxQueueItem(item) &&
          global &&
          global.mainSessionId !== main.id
        )
      ) {
        this.showHead(main);
      }
    } else {
      this.updateHeadQueueInfo(main);
    }
    return deferred;
  }

  private dequeue(main: HarnessSession, item: RunToolApprovalItem): void {
    const queue = this.interruptionQueues.get(main.id);
    if (!queue) return;
    const index = queue.findIndex((entry) => entry.item === item);
    if (index >= 0) queue.splice(index, 1);
    this.itemToSessionMap.delete(item);
    if (queue.length > 0) {
      this.showHead(main);
      return;
    }
    main.interruptionSubject.next(undefined);
    this.interruptionQueues.delete(main.id);
    if (this.isSandboxQueueItem(item)) {
      const next = this.findNextActiveQueue();
      if (next) this.showHeadById(next.sessionId, next.queue);
      else this.publishPending(main, undefined);
    } else {
      this.publishPending(main, undefined);
    }
  }

  private dequeueSandboxItem(
    source: HarnessSession,
    item: RunToolApprovalItem,
  ): void {
    const main = this.findMainSession(source);
    const queue = this.interruptionQueues.get(main.id);
    if (queue?.some((entry) => entry.item === item)) {
      this.dequeue(main, item);
      return;
    }
    const fallback = this.interruptionQueues.get(source.id);
    if (fallback?.some((entry) => entry.item === item)) {
      this.dequeue(source, item);
      return;
    }
    this.itemToSessionMap.delete(item);
  }

  private showHeadById(sessionId: string, queue: QueueEntry[]): void {
    if (queue.length === 0) return;
    const source = queue[0]!.session;
    const parentId = source.meta.parentSessionId;
    const main =
      typeof parentId === "string"
        ? (this.parentIdToMainSession.get(parentId) ?? source)
        : source;
    if (main.id !== sessionId) {
      this.interruptionQueues.delete(sessionId);
      const existing = this.interruptionQueues.get(main.id);
      if (existing) existing.push(...queue);
      else this.interruptionQueues.set(main.id, queue);
    }
    this.showHead(main);
  }

  private showHead(main: HarnessSession): void {
    const queue = this.interruptionQueues.get(main.id);
    if (!queue?.length) return;
    const entry = queue[0]!;
    const raw = mutableRawItem(entry.item);
    raw.providerData ??= {};
    if (entry.teamContext) {
      raw.providerData.isSubAgent = true;
      raw.providerData.isTeamMember = true;
      raw.providerData.memberName = entry.teamContext.memberName;
      raw.providerData.agent = entry.teamContext.memberName;
      raw.providerData.agentColor = entry.teamContext.color;
    } else if (entry.session.meta.parentSessionId) {
      raw.providerData.isSubAgent = true;
      raw.providerData.agent ??=
        entry.session.meta.agentName ?? entry.session.meta.taskName;
    }
    raw.providerData.queuePosition = 1;
    raw.providerData.queueTotal = queue.length;
    main.interruptionSubject.next(entry.item);
    this.publishPending(main, entry);
    void Promise.resolve(
      this.options.permissionBroadcast?.broadcastInterruptionRequest?.(
        main.id,
        entry.item,
      ),
    ).catch((error) =>
      this.options.logger?.warn?.(
        `[showHead] Failed to broadcast interruptionRequest: ${String(error)}`,
      ),
    );
  }

  private updateHeadQueueInfo(main: HarnessSession): void {
    const queue = this.interruptionQueues.get(main.id);
    if (!queue?.length) return;
    const entry = queue[0]!;
    const raw = mutableRawItem(entry.item);
    if (raw.providerData) raw.providerData.queueTotal = queue.length;
    main.interruptionSubject.next(entry.item);
    this.publishPending(main, entry);
  }

  private publishPending(
    main: HarnessSession,
    entry: QueueEntry | undefined,
  ): void {
    if (!entry) {
      if (this.pending$.value !== undefined) this.pending$.next(undefined);
      return;
    }
    const queueTotal = this.interruptionQueues.get(main.id)?.length ?? 1;
    this.pending$.next({
      item: entry.item,
      sourceSessionId: entry.session.id,
      mainSessionId: main.id,
      ...(entry.teamContext ? { teamContext: entry.teamContext } : {}),
      queuePosition: 1,
      queueTotal,
    });
  }

  private findNextActiveQueue():
    | { sessionId: string; queue: QueueEntry[] }
    | undefined {
    for (const [sessionId, queue] of this.interruptionQueues) {
      if (queue.length > 0) return { sessionId, queue };
    }
    return undefined;
  }

  private isSandboxQueueItem(item: RunToolApprovalItem): boolean {
    return Boolean(mutableRawItem(item).providerData?._enqueuedViaQueue);
  }

  private getPendingMapForSession(
    session: HarnessSession,
  ): Map<RunToolApprovalItem, Deferred> {
    let pending = this.pendingInterruptions.get(session.id);
    if (!pending) {
      pending = new Map();
      this.pendingInterruptions.set(session.id, pending);
    }
    return pending;
  }

  private async awaitPermissionDecision(
    session: HarnessSession,
    item: RunToolApprovalItem,
    deferred: Deferred,
  ): Promise<void> {
    const adapter = this.options.channelPermissionAdapter;
    const id = toolCallId(item);
    if (!adapter || !id) {
      await deferred.promise;
      return;
    }
    const name = toolName(item);
    const raw = mutableRawItem(item);
    const channel = adapter
      .createPermissionRequest(
        id,
        name,
        `Tool call: ${name}`,
        JSON.stringify(parseToolArguments(raw.arguments)).slice(0, 200),
      )
      .then((behavior) => ({ source: "channel" as const, behavior }));
    const local = deferred.promise.then(() => ({
      source: "local" as const,
      behavior: "allow" as const,
    }));
    void local.catch(() => undefined);
    const winner = await Promise.race([local, channel]);
    if (winner.source === "local") {
      try {
        await adapter.cancelRequest(id);
      } catch (error) {
        this.options.logger?.warn?.(
          `[Permission] Failed to cancel channel request ${id}: ${String(error)}`,
        );
      }
      return;
    }
    if (winner.behavior === "allow") {
      this.approve(item);
      await deferred.promise;
      return;
    }
    if (winner.behavior === "allow_always") {
      this.approve(item, { alwaysApprove: true });
      await deferred.promise;
      return;
    }
    if (winner.behavior === "deny_and_exit_plan") {
      const previous = session.meta.prePlanPermissionMode;
      session.permissionModeSubject.next(
        typeof previous === "string"
          ? (previous as PermissionMode)
          : PermissionMode.Default,
      );
      delete session.meta.prePlanPermissionMode;
      this.reject(item, { decision: "rejectAndExitPlan" });
      await deferred.promise;
      return;
    }
    this.reject(item, { decision: "deny" });
    await deferred.promise;
  }

  private async buildRejectedResults(
    session: HarnessSession,
    item: RunToolApprovalItem,
    reason: unknown,
  ): Promise<AgentInputItem[]> {
    const raw = mutableRawItem(item) as RawFunctionCall;
    if (raw.type !== "function_call") return [];
    const name = toolName(item);
    try {
      const custom = await this.options.resolveRejectedResult?.(
        name,
        raw,
        session,
      );
      if (custom?.length) return custom;
    } catch (error) {
      this.options.logger?.warn?.(
        `Failed to resolve rejected result for tool ${name}: ${String(error)}`,
      );
    }
    const background = session.meta.isBackgroundTaskSession === true;
    const skipRun =
      background ||
      (session.options.inputFormat !== "stream-json" &&
        session.options.acp !== true);
    const backgroundReason = background
      ? `Tool call rejected in background task: ${name}. Reason: ${String(reason)}`
      : undefined;
    return [
      createDefaultRejectedResult(raw, {
        skipRun,
        ...(backgroundReason ? { backgroundReason } : {}),
      }),
    ];
  }

  private broadcastResolved(
    main: HarnessSession,
    item: RunToolApprovalItem,
    decision: string,
  ): void {
    const broadcaster = this.options.permissionBroadcast;
    if (!broadcaster) return;
    void Promise.resolve(
      broadcaster.broadcastPermissionResolved(
        main.id,
        toolCallId(item),
        toolName(item),
        decision,
      ),
    ).catch((error) =>
      this.options.logger?.warn?.(
        `[Permission] Failed to broadcast permissionResolved: ${String(error)}`,
      ),
    );
  }
}

type MutableRawItem = {
  type: string;
  id?: string;
  callId?: string;
  name?: string;
  arguments?: string;
  providerData?: Record<string, unknown> & {
    _sandboxResolve?: (decision: boolean | string) => void;
    _enqueuedViaQueue?: boolean;
  };
};

function mutableRawItem(item: RunToolApprovalItem): MutableRawItem {
  return item.rawItem as unknown as MutableRawItem;
}

function parseToolArguments(value: string | undefined): unknown {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export function toolName(item: RunToolApprovalItem): string {
  const raw = mutableRawItem(item);
  return raw.name ?? item.toolName ?? raw.type;
}

export function toolCallId(item: RunToolApprovalItem): string {
  const raw = mutableRawItem(item);
  return raw.callId ?? raw.id ?? "";
}

function isDangerousBash(item: RunToolApprovalItem): boolean {
  if (toolName(item) !== "Bash") return false;
  try {
    const args = JSON.parse(mutableRawItem(item).arguments ?? "{}");
    const command = typeof args.command === "string" ? args.command : "";
    return /(?:^|[;&|]\s*)(?:sudo\s+)?(?:rm\s+-[^\n]*r|git\s+(?:reset\s+--hard|clean\s+-)|mkfs|dd\s+if=)/i.test(
      command,
    );
  } catch {
    return false;
  }
}

type StreamResult = {
  completed: Promise<void>;
  state: RunState<HarnessSession, Agent<HarnessSession>>;
  interruptions: RunToolApprovalItem[];
  lastAgent?: Agent<HarnessSession>;
};

function asStreamResult(value: unknown): StreamResult | undefined {
  if (!value || typeof value !== "object") return undefined;
  const candidate = value as Partial<StreamResult>;
  if (!candidate.completed || !candidate.state) return undefined;
  return candidate as StreamResult;
}
