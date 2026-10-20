import type { RunContext } from "@openai/agents-core";
import type { HarnessSession } from "../sessions/session.js";
import { CronStateManager } from "../cron/cron-state-manager.js";
import { CronCreateModelSchema, CronDeleteSchema, CronListSchema, MAX_SCHEDULED_JOBS } from "../cron/cron-types.js";
import { parseCron, getNextFireTimestamp, humanSchedule } from "../cron/cron-utils.js";
import type { ToolManager } from "./tool-manager.js";

export class CronTools {
  constructor(readonly state: CronStateManager) {}
  isEnabled(): boolean { return process.env.CODEBUDDY_DISABLE_CRON !== "1"; }
  toAutoClassifierInput(input?: { cron?: unknown; prompt?: unknown }): string { const { cron, prompt } = input ?? {}; return typeof prompt !== "string" ? "" : typeof cron === "string" && cron ? `${cron}: ${prompt}` : prompt; }
  async create(input: { cron: string; prompt: string; recurring?: boolean }, context?: RunContext<HarnessSession>): Promise<any> {
    const id = context?.context?.id; if (!id) return { content: "Cannot determine current session.", error: "no_session" };
    const { cron, prompt, recurring = true } = input, durable = false;
    if (!parseCron(cron)) return { content: `Invalid cron expression '${cron}'. Expected 5 fields: M H DoM Mon DoW.`, error: "invalid_cron" };
    if (getNextFireTimestamp(cron, Date.now()) === null) return { content: `Cron expression '${cron}' does not match any calendar date in the next year.`, error: "no_match" };
    if ((await this.state.getAllTasks(id)).length >= MAX_SCHEDULED_JOBS) return { content: `Too many scheduled jobs (max ${MAX_SCHEDULED_JOBS}). Cancel one first.`, error: "too_many_jobs" };
    const taskId = await this.state.createTask(id, cron, prompt, recurring, durable), schedule = humanSchedule(cron), storage = "Session-only (not written to disk, dies when session exits)";
    return { content: recurring ? `Scheduled recurring job ${taskId} (${schedule}). ${storage}. Auto-expires after 3 days. Use CronDelete to cancel sooner.` : `Scheduled one-shot task ${taskId} (${schedule}). ${storage}. It will fire once then auto-delete.`, rawResponse: { id: taskId, humanSchedule: schedule, recurring, durable } };
  }
  async delete(input: { id: string }, context?: RunContext<HarnessSession>): Promise<any> { const id = context?.context?.id; if (!id) return { content: "Cannot determine current session.", error: "no_session" }; return await this.state.removeTasks(id, [input.id]) === 0 ? { content: `No scheduled job with id '${input.id}'`, error: "not_found" } : { content: `Cancelled job ${input.id}.`, rawResponse: { id: input.id } }; }
  async list(_input: unknown, context?: RunContext<HarnessSession>): Promise<any> {
    const id = context?.context?.id; if (!id) return { content: "No scheduled jobs.", rawResponse: { jobs: [] } };
    const tasks = await this.state.getAllTasks(id); if (!tasks.length) return { content: "No scheduled jobs.", rawResponse: { jobs: [] } };
    return { content: tasks.map((task) => `${task.id} — ${humanSchedule(task.cron)} (${task.recurring ? "recurring" : "one-shot"})${task.durable === false ? " [session-only]" : ""}: ${task.prompt.length > 80 ? task.prompt.slice(0, 77) + "..." : task.prompt}`).join("\n"), rawResponse: { jobs: tasks.map((task) => ({ id: task.id, cron: task.cron, humanSchedule: humanSchedule(task.cron), prompt: task.prompt, recurring: task.recurring, durable: task.durable })) } };
  }
  register(manager: ToolManager): void {
    manager.register("CronCreate", { parameters: CronCreateModelSchema, parseInput: false, needsApproval: false, isEnabled: () => this.isEnabled(), execute: (input, context) => this.create(input as any, context) });
    manager.register("CronDelete", { parameters: CronDeleteSchema, parseInput: false, needsApproval: false, isEnabled: () => this.isEnabled(), execute: (input, context) => this.delete(input as any, context) });
    manager.register("CronList", { parameters: CronListSchema, parseInput: false, needsApproval: false, isEnabled: () => this.isEnabled(), execute: (input, context) => this.list(input, context) });
  }
}
