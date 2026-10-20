import { tmpdir } from "node:os";
import { createNativeFileLock } from "./native-file-lock.js";
export type FileLockOptions = {
  maxRetries: number;
  retryDelay: number;
  staleTimeout: number;
};
/** Standalone constructor adapter; decisions live in the complete native class. */
export class FileLockService {
  private readonly native: any;
  constructor(lockDirectory = tmpdir(), runtime: any = {}) {
    const { FileLockServiceImpl } = createNativeFileLock({
      ...runtime,
      tmpdir: () => lockDirectory,
    });
    this.native = new FileLockServiceImpl();
  }
  get defaultOptions(): FileLockOptions {
    return this.native.defaultOptions;
  }
  get locks(): Map<string, any> {
    return this.native.locks;
  }
  getLockMutex(path: string) {
    return this.native.getLockMutex(path);
  }
  acquireFileLock(
    name: string,
    options?: Partial<FileLockOptions>,
  ): Promise<() => Promise<void>> {
    return this.native.acquireFileLock(name, options);
  }
  tryCreateLock(
    path: string,
  ): Promise<{ success: true } | { success: false; error: unknown }> {
    return this.native.tryCreateLock(path);
  }
  isLockStale(path: string, timeout: number): Promise<boolean> {
    return this.native.isLockStale(path, timeout);
  }
  sanitizePath(value: string): string {
    return this.native.sanitizePath(value);
  }
}
