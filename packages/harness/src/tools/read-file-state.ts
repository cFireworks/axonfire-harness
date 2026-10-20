import type { Stats } from "node:fs";
import { stat } from "node:fs/promises";
import { resolve } from "node:path";

type FileSnapshot = {
  mtimeMs: number;
  size: number;
};

/** Implements WorkBuddy's read-before-edit and changed-since-read guard. */
export class ReadFileStateService {
  private readonly files = new Map<string, FileSnapshot>();

  readFile(path: string, value: Stats): void {
    this.files.set(resolve(path), snapshot(value));
  }

  async refreshFile(path: string): Promise<void> {
    try {
      this.files.set(resolve(path), snapshot(await stat(path)));
    } catch {
      this.files.delete(resolve(path));
    }
  }

  hasBeenRead(path: string): boolean {
    return this.files.has(resolve(path));
  }

  async hasBeenModifiedSinceLastRead(path: string): Promise<boolean> {
    const before = this.files.get(resolve(path));
    if (!before) return false;
    try {
      const current = snapshot(await stat(path));
      return current.mtimeMs !== before.mtimeMs || current.size !== before.size;
    } catch {
      return true;
    }
  }

  clear(path?: string): void {
    if (path) this.files.delete(resolve(path));
    else this.files.clear();
  }
}

function snapshot(value: Stats): FileSnapshot {
  return { mtimeMs: value.mtimeMs, size: value.size };
}
