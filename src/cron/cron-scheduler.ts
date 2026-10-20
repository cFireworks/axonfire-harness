import { CronStorage } from "./cron-storage.js";
import { CronStateManager } from "./cron-state-manager.js";
import { DEFAULT_JITTER_CONFIG, LOCK_RETRY_MS, SCHEDULER_TICK_MS, type CronJitterConfig, type CronLockIdentity, type ScheduledTask } from "./cron-types.js";
import { detectMissedTasks, getOneShotFireTime, getRecurringFireTime, humanSchedule, isExpired } from "./cron-utils.js";

export type CronScheduler = { start(): void; stop(): void; getNextFireTime(): number | null };
export type CronSchedulerOptions = { sessionId: string; onFire(prompt: string): void; isLoading(): boolean; onFireTask?: (task: ScheduledTask) => void; onMissed?: (tasks: ScheduledTask[]) => void; dir: string; lockIdentity: CronLockIdentity; getJitterConfig?: () => CronJitterConfig; isKilled?: () => boolean };
export type CronSchedulerRuntime = { now?: () => number; setInterval?: (callback: () => unknown, ms: number) => any; clearInterval?: (handle: any) => void; storage?: typeof CronStorage };
function debugLog(message: string, ...args: unknown[]): void { if (process.env.CODEBUDDY_DEBUG) console.debug(`[ScheduledTasks] ${message}`, ...args); }
export function dynamicBacktickFence(text: string): string { let longest = 0, current = 0; for (const character of text) if (character === "`") { if (++current > longest) longest = current; } else current = 0; return "`".repeat(Math.max(3, longest + 1)); }
export function buildMissedNotification(tasks: ScheduledTask[]): string {
  const plural = tasks.length > 1;
  const intro = `The following one-shot scheduled task${plural ? "s were" : " was"} missed while the assistant was not running. ${plural ? "They have" : "It has"} already been removed from {project}/.codebuddy/scheduled_tasks.json.\n\nDo NOT execute ${plural ? "these prompts" : "this prompt"} yet. First use the AskUserQuestion tool to ask whether to run ${plural ? "each one" : "it"} now. Only execute if the user confirms.`;
  const lines = tasks.map((task) => { const header = `[${humanSchedule(task.cron)}, created ${new Date(task.createdAt).toLocaleString()}]`, fence = dynamicBacktickFence(task.prompt); return `${header}\n${fence}\n${task.prompt}\n${fence}`; });
  return `${intro}\n\n${lines.join("\n\n")}`;
}
/** Source createCronScheduler, 8433xxx..84368xx. Optional runtime only makes the same timer/IO edges injectable. */
export function createCronScheduler(options: CronSchedulerOptions, state: CronStateManager, runtime: CronSchedulerRuntime = {}): CronScheduler {
  const { sessionId, onFire, isLoading, onFireTask, onMissed, dir, lockIdentity, getJitterConfig, isKilled } = options;
  const now = runtime.now ?? Date.now, repeat = runtime.setInterval ?? setInterval, cancel = runtime.clearInterval ?? clearInterval, storage = runtime.storage ?? CronStorage;
  let persisted: ScheduledTask[] = [];
  const fireTimes = new Map<string, number>(), missed = new Set<string>(), deleting = new Set<string>();
  let activationTimer: any = null, tickTimer: any = null, lockTimer: any = null, watcher: { close(): void } | null = null, stopped = false, lockAcquired = false;
  async function checkMissedTasks(surface: boolean): Promise<void> {
    try {
      const tasks = await storage.readTasks(dir); if (stopped) return; persisted = tasks; if (!surface) return;
      const overdue = detectMissedTasks(tasks, now()).filter((task) => !task.recurring && !missed.has(task.id));
      if (overdue.length) {
        debugLog("surfaced %d missed one-shot task(s)", overdue.length);
        for (const task of overdue) { missed.add(task.id); fireTimes.set(task.id, Infinity); }
        if (onMissed) onMissed(overdue); else onFire(buildMissedNotification(overdue));
        void storage.removeTasks(overdue.map((task) => task.id), dir).catch((error) => debugLog("failed to remove missed tasks: %s", String(error)));
      }
    } catch (error) { debugLog("failed to check missed tasks: %s", String(error)); }
  }
  function tick(): void {
    if (isKilled?.() || isLoading()) return;
    const time = now(), jitter = getJitterConfig?.() ?? DEFAULT_JITTER_CONFIG, tasks = [...state.getSessionTasks(sessionId), ...persisted], fired: string[] = [], removed: string[] = [];
    for (const task of tasks) {
      if (deleting.has(task.id)) continue;
      let next = fireTimes.get(task.id);
      if (next === undefined) {
        const from = task.recurring ? task.lastFiredAt ?? task.createdAt : task.createdAt;
        const computed = task.recurring ? getRecurringFireTime(task.cron, from, task.id, jitter) : getOneShotFireTime(task.cron, task.createdAt, task.id, jitter);
        if (computed === null) continue; next = computed; fireTimes.set(task.id, next); debugLog("scheduled %s for %s", task.id, new Date(next).toISOString());
      }
      if (next !== undefined && time >= next) {
        debugLog(task.recurring ? "firing %s (recurring)" : "firing %s (one-shot)", task.id);
        if (onFireTask) onFireTask(task); else onFire(task.prompt);
        if (task.recurring && !isExpired(task, time)) {
          const following = getRecurringFireTime(task.cron, time, task.id, jitter);
          if (following !== null) { fireTimes.set(task.id, following); debugLog("scheduled %s for %s", task.id, new Date(following).toISOString()); } else fireTimes.delete(task.id);
          if (task.permanent || task.durable) fired.push(task.id);
        } else {
          if (task.recurring && isExpired(task, time)) debugLog("recurring task %s aged out (%dh since creation), deleting after final fire", task.id, Math.round((time - task.createdAt) / 3_600_000));
          deleting.add(task.id); state.removeSessionTasks(sessionId, [task.id]); fireTimes.delete(task.id); removed.push(task.id);
        }
      }
    }
    if (removed.length || fired.length) void (async () => {
      try { if (removed.length) await storage.removeTasks(removed, dir); if (fired.length) await storage.updateTaskLastFiredAt(fired, time, dir); }
      catch (error) { debugLog("failed to persist task changes: %s", String(error)); }
      finally { for (const id of removed) deleting.delete(id); }
    })();
  }
  async function initialize(): Promise<void> {
    debugLog("scheduler start() — dir=%s, hasTasks=%s", dir, String(state.getSessionTasks(sessionId).length > 0));
    if (await storage.acquireLock(dir, lockIdentity)) { lockAcquired = true; debugLog("acquired scheduler lock (PID %d)", lockIdentity.pid); await checkMissedTasks(true); watcher = storage.watchTasksFile(dir, () => { void checkMissedTasks(false); }); }
    else {
      debugLog("scheduler lock held by another session, will retry every %dms", LOCK_RETRY_MS);
      lockTimer = repeat(async () => { if (await storage.acquireLock(dir, lockIdentity)) { lockAcquired = true; debugLog("acquired scheduler lock (PID %d)", lockIdentity.pid); if (lockTimer) { cancel(lockTimer); lockTimer = null; } await checkMissedTasks(true); watcher = storage.watchTasksFile(dir, () => { void checkMissedTasks(false); }); } }, LOCK_RETRY_MS); lockTimer?.unref?.();
    }
    tickTimer = repeat(tick, SCHEDULER_TICK_MS); tickTimer?.unref?.();
  }
  return {
    start() { const enabled = state.isScheduledTasksEnabled(); debugLog("scheduler start() — enabled=%s", String(enabled)); if (enabled) void initialize(); else { activationTimer = repeat(() => { if (state.isScheduledTasksEnabled()) { if (activationTimer) { cancel(activationTimer); activationTimer = null; } void initialize(); } }, SCHEDULER_TICK_MS); activationTimer?.unref?.(); } },
    stop() { stopped = true; debugLog("stopping scheduler"); if (activationTimer) { cancel(activationTimer); activationTimer = null; } if (tickTimer) { cancel(tickTimer); tickTimer = null; } if (lockTimer) { cancel(lockTimer); lockTimer = null; } if (watcher) { watcher.close(); watcher = null; } if (lockAcquired) { void storage.releaseLock(dir, lockIdentity); debugLog("released scheduler lock"); } },
    getNextFireTime() { let next: number | null = null; for (const time of fireTimes.values()) if (time !== Infinity && (next === null || time < next)) next = time; return next; },
  };
}
