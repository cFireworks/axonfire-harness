import { mkdir, readFile, readdir, rename, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { FileLockService } from "./file-lock-service.js";

export type StoredTask = {
  id: string; subject: string; description: string; status: "pending" | "in_progress" | "completed";
  activeForm?: string; owner?: string; metadata?: Record<string, unknown>;
  blocks?: string[]; blockedBy?: string[]; createdAt: number; updatedAt: number;
};
export type TaskUpdate = Partial<Omit<StoredTask, "id" | "createdAt" | "updatedAt">> & { addBlocks?: string[]; addBlockedBy?: string[] };

/** module 57135: one JSON per task, numeric ids, rename-based writes under a session lock. */
export class TaskStorageService {
  constructor(private readonly baseDir: string, private readonly fileLockService = new FileLockService()) {}
  getTasksBaseDir(): string { return this.baseDir; }
  getTaskDir(scope: string): string { return join(this.baseDir, scope); }
  getTaskFilePath(scope: string, id: string): string { return join(this.getTaskDir(scope), `${id}.json`); }
  getSessionLockName(scope: string): string { return `task-storage-${scope}`; }
  async ensureTaskDir(scope: string): Promise<void> { try { await mkdir(this.getTaskDir(scope), { recursive: true }); } catch {} }
  async getNextId(scope: string, preferred?: number): Promise<number> {
    if (typeof preferred === "number" && preferred > 0 && !await this.loadTaskFile(scope, String(preferred))) return preferred;
    try {
      const entries = await readdir(this.getTaskDir(scope));
      let maximum = 0;
      for (const entry of entries) if (entry.endsWith(".json")) {
        const value = Number.parseInt(entry.replace(".json", ""), 10);
        if (!Number.isNaN(value) && value > maximum) maximum = value;
      }
      return maximum + 1;
    } catch { return 1; }
  }
  async loadTaskFile(scope: string, id: string): Promise<StoredTask | undefined> {
    try { return JSON.parse(await readFile(this.getTaskFilePath(scope, id), "utf8")); } catch { return undefined; }
  }
  async saveTaskFile(scope: string, task: StoredTask): Promise<void> {
    await this.ensureTaskDir(scope);
    const path = this.getTaskFilePath(scope, task.id), temporary = `${path}.tmp.${process.pid}.${Date.now()}`;
    try { await writeFile(temporary, JSON.stringify(task, null, 2), "utf8"); await rename(temporary, path); }
    catch (error) { await unlink(temporary).catch(() => undefined); throw error; }
  }
  async deleteTaskFile(scope: string, id: string): Promise<boolean> {
    try { await unlink(this.getTaskFilePath(scope, id)); return true; } catch { return false; }
  }
  private async withLock<T>(scope: string, operation: () => Promise<T>): Promise<T> {
    const release = await this.fileLockService.acquireFileLock(this.getSessionLockName(scope), { maxRetries: 10, retryDelay: 100, staleTimeout: 60_000 });
    try { return await operation(); } finally { await release(); }
  }
  async create(scope: string, input: Omit<StoredTask, "id" | "createdAt" | "updatedAt">, preferred?: number): Promise<StoredTask> {
    return this.withLock(scope, async () => {
      const id = await this.getNextId(scope, preferred), now = Date.now();
      const task: StoredTask = { ...input, id: String(id), createdAt: now, updatedAt: now };
      await this.saveTaskFile(scope, task);
      return task;
    });
  }
  async get(scope: string, id: string): Promise<StoredTask | undefined> { return this.loadTaskFile(scope, id); }
  async update(scope: string, id: string, update: TaskUpdate): Promise<StoredTask | undefined> {
    return this.withLock(scope, async () => {
      const task = await this.loadTaskFile(scope, id);
      if (!task) return undefined;
      // The product intentionally consumes these three keys from the update object.
      if ("addBlocks" in update) { task.blocks = [...new Set([...(task.blocks ?? []), ...(update.addBlocks ?? [])])]; delete update.addBlocks; }
      if ("addBlockedBy" in update) { task.blockedBy = [...new Set([...(task.blockedBy ?? []), ...(update.addBlockedBy ?? [])])]; delete update.addBlockedBy; }
      if (update.metadata) {
        task.metadata ??= {};
        for (const [key, value] of Object.entries(update.metadata)) { if (value === null) delete task.metadata[key]; else task.metadata[key] = value; }
        delete update.metadata;
      }
      Object.assign(task, update, { updatedAt: Date.now() });
      await this.saveTaskFile(scope, task);
      return task;
    });
  }
  async delete(scope: string, id: string): Promise<boolean> { return this.withLock(scope, () => this.deleteTaskFile(scope, id)); }
  async list(scope: string): Promise<StoredTask[]> {
    try {
      const tasks: StoredTask[] = [];
      for (const entry of await readdir(this.getTaskDir(scope))) {
        if (!entry.endsWith(".json") || entry.includes(".tmp.")) continue;
        const task = await this.loadTaskFile(scope, entry.replace(".json", ""));
        if (task) tasks.push(task);
      }
      return tasks.sort((a, b) => Number.parseInt(a.id, 10) - Number.parseInt(b.id, 10));
    } catch { return []; }
  }
}
