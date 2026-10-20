import { mkdir, readFile, writeFile, unlink } from "node:fs/promises";
import { watch } from "node:fs";
import { join } from "node:path";
import { SCHEDULED_TASKS_FILE, SCHEDULED_TASKS_LOCK, type ScheduledTask, type CronLockIdentity } from "./cron-types.js";
import { parseCron } from "./cron-utils.js";

export class CronStorage {
  static async readTasks(directory: string): Promise<ScheduledTask[]> {
    try { const value = JSON.parse(await readFile(join(directory, SCHEDULED_TASKS_FILE), "utf8")); if (!value?.tasks || !Array.isArray(value.tasks)) return []; return value.tasks.filter((task: ScheduledTask) => Boolean(task?.id && task?.cron && task?.prompt && task?.createdAt && parseCron(task.cron))); } catch { return []; }
  }
  static async writeTasks(tasks: ScheduledTask[], directory: string): Promise<void> { await mkdir(directory, { recursive: true }); const value = { tasks: tasks.map(({ durable: _durable, permanent: _permanent, ...task }) => task) }; await writeFile(join(directory, SCHEDULED_TASKS_FILE), JSON.stringify(value, null, 2) + "\n", "utf8"); }
  static async removeTasks(ids: string[], directory: string): Promise<void> { if (!ids.length) return; const selected = new Set(ids), tasks = await this.readTasks(directory), remaining = tasks.filter((task) => !selected.has(task.id)); if (remaining.length !== tasks.length) await this.writeTasks(remaining, directory); }
  static async updateTaskLastFiredAt(ids: string[], time: number, directory: string): Promise<void> {
    try { const tasks = await this.readTasks(directory), selected = new Set(ids); let changed = false; for (const task of tasks) if (selected.has(task.id)) { task.lastFiredAt = time; changed = true; } if (changed) await this.writeTasks(tasks, directory); } catch {}
  }
  static async acquireLock(directory: string, identity: CronLockIdentity): Promise<boolean> {
    const filename = join(directory, SCHEDULED_TASKS_LOCK), payload = { ...identity, acquiredAt: Date.now() };
    try { await mkdir(directory, { recursive: true }); await writeFile(filename, JSON.stringify(payload), { flag: "wx" }); return true; }
    catch {
      try {
        const current = JSON.parse(await readFile(filename, "utf8")); if (current.sessionId === identity.sessionId) return true;
        try { process.kill(current.pid, 0); return false; } catch {}
        await unlink(filename); try { await writeFile(filename, JSON.stringify(payload), { flag: "wx" }); return true; } catch { return false; }
      } catch { return false; }
    }
  }
  static async releaseLock(directory: string, identity: CronLockIdentity): Promise<void> { const filename = join(directory, SCHEDULED_TASKS_LOCK); try { const current = JSON.parse(await readFile(filename, "utf8")); if (current.sessionId === identity.sessionId) await unlink(filename); } catch {} }
  static watchTasksFile(directory: string, onChange: () => void): { close(): void } {
    try { let pending: ReturnType<typeof setTimeout> | null = null; const watcher = watch(join(directory, SCHEDULED_TASKS_FILE), { persistent: false }, () => { if (pending) clearTimeout(pending); pending = setTimeout(onChange, 200); }); watcher.unref?.(); return { close() { if (pending) clearTimeout(pending); watcher.close(); } }; } catch { return { close() {} }; }
  }
}
