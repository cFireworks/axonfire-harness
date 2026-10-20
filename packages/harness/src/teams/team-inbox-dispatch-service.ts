import { user, type AgentInputItem } from "@openai/agents";
import type { AgentManager } from "../agents/agent-manager.js";
import type { AgentService } from "../agents/agent-service.js";
import type { HarnessSession } from "../sessions/session.js";
import type { SessionRunStateMachine } from "../sessions/run-state-machine.js";
import type { TeammateIdleTracker } from "./teammate-idle-tracker.js";

export type TeamQueueItem = {
  id: string;
  status: "pending" | "sending" | "sent" | "cancelled" | string;
  contentBlocks: unknown[];
};

export type TeamRichQueue = {
  runtime?: {
    paused?: boolean;
    pauseReason?: string;
    immediateItemId?: string;
  };
  items: TeamQueueItem[];
};

export type RichMessageQueueManager = {
  getQueue(sessionId: string): TeamRichQueue | undefined;
  resume(sessionId: string): void;
  activate(sessionId: string): { item?: TeamQueueItem };
};

export type TeamInboxDispatchLogger = {
  debug?(message: string): void;
  info?(message: string): void;
  warn?(message: string, error?: unknown): void;
};

export function decidePausedQueueAction(
  runtime: TeamRichQueue["runtime"],
): "proceed" | "skip" | "auto-resume" {
  return runtime?.paused
    ? runtime.pauseReason === "cancel"
      ? "auto-resume"
      : "skip"
    : "proceed";
}

export class TeamInboxDispatchService {
  private readonly subscriptions = new Map<
    string,
    { unsubscribe(): void }
  >();
  private readonly dispatching = new Set<string>();

  constructor(
    private readonly stateMachine: SessionRunStateMachine,
    private readonly queueManager: RichMessageQueueManager,
    private readonly agentService: AgentService,
    private readonly agentManager: AgentManager,
    private readonly idleTracker: TeammateIdleTracker,
    private readonly options: {
      isImmediateDispatchEnabled?: () => boolean;
      setLeadInboxPaused?: (session: HarnessSession, paused: boolean) => void;
      logger?: TeamInboxDispatchLogger;
    } = {},
  ) {}

  register(session: HarnessSession): void {
    if (this.subscriptions.has(session.id)) return;
    const subscription = this.stateMachine
      .getChange$(session, true)
      .subscribe(() => {
        if (this.stateMachine.isIdle(session)) this.scheduleAutoDispatch(session);
      });
    this.subscriptions.set(session.id, subscription);
    this.options.logger?.debug?.(
      `[TeamInboxDispatch] registered session=${session.id}`,
    );
  }

  unregister(sessionId: string): void {
    const subscription = this.subscriptions.get(sessionId);
    if (!subscription) return;
    subscription.unsubscribe();
    this.subscriptions.delete(sessionId);
    this.dispatching.delete(sessionId);
    this.options.logger?.debug?.(
      `[TeamInboxDispatch] unregistered session=${sessionId}`,
    );
  }

  scheduleAutoDispatch(session: HarnessSession): void {
    queueMicrotask(() => {
      void this.runAutoDispatch(session).catch((error) => {
        this.options.logger?.warn?.(
          `[TeamInboxDispatch] runAutoDispatch failed session=${session.id}:`,
          error,
        );
      });
    });
  }

  async runAutoDispatch(session: HarnessSession): Promise<void> {
    if (
      this.options.isImmediateDispatchEnabled?.() === false ||
      session.meta.isTeamLead !== true ||
      this.dispatching.has(session.id) ||
      session.isCompressing
    ) {
      return;
    }
    const queue = this.queueManager.getQueue(session.id);
    if (
      !queue ||
      (session.lastCancelledQueue !== undefined && !queue.runtime?.paused)
    ) {
      return;
    }
    const pausedAction = decidePausedQueueAction(queue.runtime);
    if (pausedAction === "skip") return;
    if (pausedAction === "auto-resume") {
      this.options.logger?.info?.(
        `[TeamInboxDispatch] auto-resume after cancel: session=${session.id}`,
      );
      try {
        this.queueManager.resume(session.id);
      } catch (error) {
        this.options.logger?.warn?.(
          `[TeamInboxDispatch] auto-resume failed session=${session.id}:`,
          error,
        );
        return;
      }
      this.options.setLeadInboxPaused?.(session, false);
    }
    const immediate = Boolean(queue.runtime?.immediateItemId);
    const pending = queue.items.some(
      (item) => item.status === "pending" || item.status === "sending",
    );
    if (!immediate && !pending) return;
    const agent = await this.agentManager.getDefault();
    if (!this.stateMachine.isIdle(session)) {
      this.options.logger?.debug?.(
        `[TeamInboxDispatch] skip dispatch: session no longer idle session=${session.id} status=${session.status}`,
      );
      return;
    }
    this.dispatching.add(session.id);
    try {
      const { item } = this.queueManager.activate(session.id);
      if (!item) return;
      const teamName =
        typeof session.meta.teamName === "string"
          ? session.meta.teamName
          : undefined;
      const context = session.meta.teamContext as
        | { memberName?: string }
        | undefined;
      const memberName = context?.memberName ?? session.agentName ?? "team-lead";
      if (teamName) {
        this.idleTracker.markBusy(teamName, memberName, session.id);
      }
      const text = contentBlocksToPlainText(item.contentBlocks);
      if (!text) {
        this.options.logger?.warn?.(
          `[TeamInboxDispatch] popped item had no text content session=${session.id} itemId=${item.id}`,
        );
        return;
      }
      this.options.logger?.info?.(
        `[TeamInboxDispatch] auto-dispatching session=${session.id} itemId=${item.id} textLen=${text.length}`,
      );
      await this.agentService.run(agent, [user(text) as AgentInputItem], {
        context: session,
      });
    } catch (error) {
      this.options.logger?.warn?.(
        `[TeamInboxDispatch] auto-dispatch failed session=${session.id}:`,
        error,
      );
    } finally {
      this.dispatching.delete(session.id);
    }
  }
}

export function contentBlocksToPlainText(blocks: readonly unknown[]): string {
  const result: string[] = [];
  for (const block of blocks) {
    if (typeof block === "string") {
      result.push(block);
      continue;
    }
    if (block && typeof block === "object") {
      const text = (block as { text?: unknown }).text;
      if (typeof text === "string" && text.length > 0) result.push(text);
    }
  }
  return result.join("");
}
