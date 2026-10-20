import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

export type FileLockOptions = { maxRetries: number; retryDelay: number; staleTimeout: number };
/** module 65117: process mutex + mkdir/lock.json cross-process protocol. */
export class FileLockService {
  readonly defaultOptions: FileLockOptions = { maxRetries: 5, retryDelay: 500, staleTimeout: 300_000 };
  private readonly tails = new Map<string, Promise<void>>();
  constructor(private readonly lockDirectory = tmpdir()) {}

  async acquireFileLock(name: string, options: Partial<FileLockOptions> = {}): Promise<() => Promise<void>> {
    const config = { ...this.defaultOptions, ...options };
    const path = join(this.lockDirectory, `${this.sanitizePath(name)}.lock`);
    const previous = this.tails.get(path) ?? Promise.resolve();
    let releaseMutex!: () => void;
    const next = new Promise<void>((resolve) => releaseMutex = resolve);
    this.tails.set(path, next);
    await previous;
    const unlock = () => { releaseMutex(); if (this.tails.get(path) === next) this.tails.delete(path); };
    let attempts = 0, staleRemovals = 0;
    try {
      while (attempts < config.maxRetries) {
        if (attempts > 0) await new Promise((resolve) => setTimeout(resolve, config.retryDelay));
        const result = await this.tryCreateLock(path);
        if (result.success) return async () => { await rm(path, { recursive: true, force: true }).catch(() => undefined); unlock(); };
        if ((result.error as NodeJS.ErrnoException).code !== "EEXIST") throw result.error;
        if (await this.isLockStale(path, config.staleTimeout) && staleRemovals < 3
          && await rm(path, { recursive: true, force: true }).then(() => true).catch(() => false)) { staleRemovals++; continue; }
        attempts++;
      }
      throw new Error(`Failed to acquire lock for ${name}. Please retry after ${config.staleTimeout / 60000} minutes, or force: rm -rf ${path}`);
    } catch (error) { unlock(); throw error; }
  }

  async tryCreateLock(path: string): Promise<{ success: true } | { success: false; error: unknown }> {
    try {
      await mkdir(path, { recursive: false });
      try { await writeFile(join(path, "lock.json"), JSON.stringify({ pid: process.pid, timestamp: Date.now() })); }
      catch (error) { await rm(path, { recursive: true, force: true }).catch(() => undefined); throw error; }
      return { success: true };
    } catch (error) { return { success: false, error }; }
  }
  async isLockStale(path: string, timeout: number): Promise<boolean> {
    try {
      const data = JSON.parse(await readFile(join(path, "lock.json"), "utf8"));
      if (Date.now() - data.timestamp > timeout) return true;
      if (data.pid && typeof data.pid === "number") {
        try { process.kill(data.pid, 0); } catch (error) { if ((error as NodeJS.ErrnoException).code === "ESRCH") return true; }
      }
      return false;
    } catch { return true; }
  }
  sanitizePath(value: string): string { return value.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-50); }
}
