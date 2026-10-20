import { z } from "zod";

export const CRON_EXPIRY_MS = 259_200_000;
export const SCHEDULER_TICK_MS = 500;
export const LOCK_RETRY_MS = 5_000;
export const MAX_SCHEDULED_JOBS = 50;
export const DEFAULT_LOOP_INTERVAL = "10m";
export const SCHEDULED_TASKS_FILE = "scheduled_tasks.json";
export const SCHEDULED_TASKS_LOCK = "scheduled_tasks.lock";
export const DEFAULT_JITTER_CONFIG = { recurringFrac: .1, recurringCapMs: 900_000, oneShotMaxMs: 90_000, oneShotFloorMs: 0, oneShotMinuteMod: 30 };
export type CronJitterConfig = typeof DEFAULT_JITTER_CONFIG;
export type ScheduledTask = { id: string; cron: string; prompt: string; createdAt: number; recurring?: boolean; durable?: boolean; permanent?: boolean; lastFiredAt?: number; [key: string]: unknown };
export type CronLockIdentity = { sessionId: string; pid: number };
export const CronCreateFullSchema = z.strictObject({
  cron: z.string().describe('Standard 5-field cron expression in local time: "M H DoM Mon DoW" (e.g. "*/5 * * * *" = every 5 minutes, "30 14 28 2 *" = Feb 28 at 2:30pm local once).'),
  prompt: z.string().describe("The prompt to enqueue at each fire time."),
  recurring: z.boolean().optional().describe('true (default) = fire on every cron match until deleted or auto-expired after 3 days. false = fire once at the next match, then auto-delete. Use false for "remind me at X" one-shot requests with pinned minute/hour/dom/month.'),
  durable: z.boolean().optional().describe("true = persist to {project}/.codebuddy/scheduled_tasks.json and survive restarts. false (default) = in-memory only, dies when this session ends."),
});
export const CronCreateModelSchema = CronCreateFullSchema.omit({ durable: true });
export const CronDeleteSchema = z.strictObject({ id: z.string().describe("Job ID returned by CronCreate.") });
export const CronListSchema = z.strictObject({});
