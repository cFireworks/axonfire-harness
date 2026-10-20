import { randomUUID } from "node:crypto";
import { CronStorage } from "./cron-storage.js";
import type { ScheduledTask } from "./cron-types.js";

export class CronStateManager {
  private scheduledTasksEnabled = false;
  private readonly sessionCronTasksMap = new Map<string, ScheduledTask[]>();
  private storageDir: string | undefined;
  setEnabled(enabled: boolean): void { this.scheduledTasksEnabled = enabled; }
  isScheduledTasksEnabled(): boolean { return this.scheduledTasksEnabled; }
  setStorageDir(directory: string): void { this.storageDir = directory; }
  getStorageDir(): string | undefined { return this.storageDir; }
  getSessionTasks(id: string): ScheduledTask[] { return this.sessionCronTasksMap.get(id) ?? []; }
  addSessionTask(id: string, task: ScheduledTask): void { const tasks = this.sessionCronTasksMap.get(id); if (tasks) tasks.push(task); else this.sessionCronTasksMap.set(id, [task]); }
  removeSessionTasks(id: string, ids: string[]): number { const tasks = this.sessionCronTasksMap.get(id); if (!tasks) return 0; const selected = new Set(ids), remaining = tasks.filter((task) => !selected.has(task.id)); this.sessionCronTasksMap.set(id, remaining); return tasks.length - remaining.length; }
  clearSessionTasks(id: string): void { this.sessionCronTasksMap.delete(id); }
  async createTask(sessionId: string, cron: string, prompt: string, recurring: boolean, durable: boolean): Promise<string> {
    const id = randomUUID().slice(0, 8), task: ScheduledTask = { id, cron, prompt, createdAt: Date.now(), ...recurring ? { recurring: true } : {}, ...durable ? { durable: true } : {} };
    if (durable) { if (this.storageDir) { const tasks = await CronStorage.readTasks(this.storageDir); tasks.push(task); await CronStorage.writeTasks(tasks, this.storageDir); } }
    else this.addSessionTask(sessionId, task);
    this.setEnabled(true); return id;
  }
  async getAllTasks(sessionId: string): Promise<ScheduledTask[]> { const tasks = this.getSessionTasks(sessionId); return this.storageDir ? [...tasks, ...(await CronStorage.readTasks(this.storageDir)).map((task) => ({ ...task, permanent: true }))] : tasks; }
  async removeTasks(sessionId: string, ids: string[]): Promise<number> { if (!ids.length) return 0; const count = this.removeSessionTasks(sessionId, ids); if (this.storageDir) await CronStorage.removeTasks(ids, this.storageDir); return count; }
}
