import { user } from "@openai/agents-core";
import type { HarnessSession } from "../sessions/session.js";
import type { SessionRunStateMachine } from "../sessions/run-state-machine.js";
import type { MessageQueueManager } from "../sessions/message-queue-manager.js";
import { CronStateManager } from "./cron-state-manager.js";
import { createCronScheduler, type CronScheduler, type CronSchedulerRuntime } from "./cron-scheduler.js";

export class CronSchedulerService {
  private readonly schedulers = new Map<string, CronScheduler>();
  constructor(private readonly state: CronStateManager, private readonly stateMachine: SessionRunStateMachine, private readonly queue: MessageQueueManager,
    private readonly runtime: { storageDir(): string; runEmpty(session: HarnessSession): Promise<void>; timers?: CronSchedulerRuntime; logger?: { info?(message: string): void; debug?(message: string): void; warn?(message: string, error?: unknown): void }; isLoading?: (session: HarnessSession) => boolean }) {}
  start(session: HarnessSession): void {
    if (process.env.CODEBUDDY_DISABLE_CRON === "1") return;
    if (this.schedulers.has(session.id)) { this.runtime.logger?.info?.(`[ScheduledTasks] Scheduler already running for session ${session.id}`); return; }
    const directory = this.runtime.storageDir(); this.state.setStorageDir(directory); let waking = false;
    const scheduler = createCronScheduler({ sessionId: session.id, onFire: (prompt) => {
      this.queue.enqueueMessage(session, user(prompt, { isMeta: true }));
      if (!waking && !this.stateMachine.isBusy(session)) { waking = true; queueMicrotask(() => { waking = false; if (!this.stateMachine.isBusy(session) && !session.abortSignal.aborted) void this.runtime.runEmpty(session).catch((error) => { if (!session.abortSignal.aborted) console.error(`[ScheduledTasks] Drain failed: ${error}`); }); }); }
      this.runtime.logger?.info?.(`[ScheduledTasks] Fired prompt into session ${session.id}`); this.reportScheduledTaskFire(undefined, session, prompt);
    }, isLoading: () => this.runtime.isLoading?.(session) ?? ["agent_running", "model_requesting", "model_streaming", "model_done"].includes(this.stateMachine.getSnapshot(session).status), dir: directory, lockIdentity: { sessionId: session.id, pid: process.pid }, isKilled: () => session.abortSignal.aborted }, this.state, this.runtime.timers);
    this.schedulers.set(session.id, scheduler); scheduler.start(); this.runtime.logger?.info?.(`[ScheduledTasks] Started scheduler for session ${session.id}`);
  }
  stop(id: string): void { const scheduler = this.schedulers.get(id); if (scheduler) { scheduler.stop(); this.schedulers.delete(id); this.state.clearSessionTasks(id); this.runtime.logger?.info?.(`[ScheduledTasks] Stopped scheduler for session ${id}`); } }
  getNextFireTime(id: string): number | null { return this.schedulers.get(id)?.getNextFireTime() ?? null; }
  reportScheduledTaskFire(telemetry: unknown, session: HarnessSession, _prompt: string): void { try { if (!telemetry || !session.conversationRequestId || !session.messageId) return; this.runtime.logger?.debug?.(`[ScheduledTasks] Fired task for session ${session.id}`); } catch (error) { this.runtime.logger?.warn?.("Failed to report scheduled task fire telemetry:", error); } }
}
