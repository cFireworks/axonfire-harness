import { rm } from "node:fs/promises";
import type { TruncateBuffer } from "./truncate-buffer.js";
export type ProductBackgroundTask = { id: string; toolName: string; title: string; startTime: number; endTime?: number; status: string; sessionId: string; toolUseId?: string; notified?: boolean; outputFilePath?: string; outputStderrPath?: string; error?: string; stdout: Pick<TruncateBuffer, "push" | "toString">; stderr: Pick<TruncateBuffer, "push" | "toString">; kill(): Promise<void> };
/** ToolManager's native generic registry/TTL methods, separated for composition. */
export class BackgroundTaskRegistry {
  static BG_TASK_TTL_MS = 300000; static BG_TASK_CLEANUP_INTERVAL_MS = 60000;
  readonly backgroundTasks = new Map<string, ProductBackgroundTask>();
  private bgTaskCleanupTimer: ReturnType<typeof setInterval> | undefined;
  constructor(readonly host: { sessionBgTasksDir?(id: string): string; error?(message: string, error: unknown): void; debug?(message: string): void; info?(message: string): void } = {}) {}
  addBackgroundTask(task: ProductBackgroundTask): void { this.backgroundTasks.set(task.id, task); this.ensureBgTaskCleanupStarted(); }
  removeBackgroundTask(id: string): void { this.backgroundTasks.delete(id); }
  getBackgroundTasks(): ProductBackgroundTask[] { return Array.from(this.backgroundTasks.values()); }
  getBackgroundTask(id: string): ProductBackgroundTask | undefined { return this.backgroundTasks.get(id); }
  async killBackgroundTask(id: string): Promise<boolean> { const task = this.backgroundTasks.get(id); if (!task) return false; try { await task.kill(); if (task.status === "running") { task.status = "killed"; task.endTime = Date.now(); } return true; } catch (error) { this.host.error?.(`Failed to kill background task ${id}:`, error); return false; } }
  async killBackgroundTasksBySessionId(id: string): Promise<void> { const tasks = Array.from(this.backgroundTasks.values()).filter((task) => task.sessionId === id); await Promise.allSettled(tasks.map((task) => this.killBackgroundTask(task.id))); try { const directory = this.host.sessionBgTasksDir?.(id); if (directory) await rm(directory, { recursive: true, force: true }); } catch (error) { this.host.debug?.(`[ToolManager] failed to rm bg-tasks dir for session ${id}: ${(error as any)?.message || error}`); } }
  ensureBgTaskCleanupStarted(): void { if (!this.bgTaskCleanupTimer) { this.bgTaskCleanupTimer = setInterval(() => this.cleanupTerminalBackgroundTasks(), BackgroundTaskRegistry.BG_TASK_CLEANUP_INTERVAL_MS); if (typeof this.bgTaskCleanupTimer.unref === "function") this.bgTaskCleanupTimer.unref(); } }
  cleanupTerminalBackgroundTasks(): void { const now = Date.now(); let removed = 0; for (const [id, task] of this.backgroundTasks) { if (task.status === "running" || task.status === "pending" || !task.notified) continue; const endedAt = task.endTime || task.startTime; if (endedAt && now - endedAt > BackgroundTaskRegistry.BG_TASK_TTL_MS) { this.backgroundTasks.delete(id); removed++; } } if (removed > 0) this.host.info?.(`[ToolManager] Auto-cleaned ${removed} terminal background tasks (remaining: ${this.backgroundTasks.size})`); }
  /** Standalone lifecycle only. Native generic cleanup is lazy/unref. */
  dispose(): void { if (this.bgTaskCleanupTimer) clearInterval(this.bgTaskCleanupTimer); this.bgTaskCleanupTimer = undefined; }
}
