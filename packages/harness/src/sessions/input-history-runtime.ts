import * as fs from "node:fs/promises";
import { InputHistoryServiceImpl } from "./input-history-service.js";
export type InputHistoryItem = {
  display: string;
  pastedContents: Record<string, unknown>;
  timestamp?: number;
  project?: string;
  [key: string]: unknown;
};
export type InputHistoryRuntime = {
  fs: Pick<typeof fs, "readFile" | "writeFile" | "appendFile" | "stat">;
  getHomeDir(): string;
  getWorkDir(): string | Promise<string>;
  now(): number;
  setTimeout(callback: () => any, ms: number): any;
  clearTimeout(timer: any): void;
  localStorage: { get(key: string, fallback: any): any | Promise<any> };
  logger: {
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
  };
};
export type InputHistoryOptions = Partial<
  Omit<InputHistoryRuntime, "getHomeDir" | "getWorkDir">
>;
/** Ownership adapter around the unchanged native timer/JSONL algorithm. */
export function createOwnedInputHistory(
  stateDir: string,
  getWorkDir: () => string,
  options: InputHistoryOptions = {},
) {
  const handles = new Set<any>(),
    pending = new Set<Promise<any>>();
  let closed = false;
  const ioSet = options.setTimeout ?? setTimeout,
    ioClear = options.clearTimeout ?? clearTimeout;
  const runtime: InputHistoryRuntime = {
    fs,
    getHomeDir: () => stateDir,
    getWorkDir,
    now: Date.now,
    localStorage: { get: (_key, fallback) => fallback },
    logger: { info() {}, warn() {}, error() {} },
    ...options,
    setTimeout(callback, ms) {
      if (closed) return null;
      let handle: any;
      handle = ioSet(() => {
        handles.delete(handle);
        if (closed) return;
        const task = Promise.resolve().then(callback);
        pending.add(task);
        void task.finally(() => pending.delete(task)).catch(() => {});
      }, ms);
      handles.add(handle);
      return handle;
    },
    clearTimeout(handle) {
      handles.delete(handle);
      ioClear(handle);
    },
  };
  const service = new InputHistoryServiceImpl(runtime);
  const cleanup = service.cleanupExcessHistory.bind(service);
  service.cleanupExcessHistory = () => {
    const task = cleanup();
    pending.add(task);
    void task.finally(() => pending.delete(task)).catch(() => {});
    return task;
  };
  return {
    service,
    async close() {
      closed = true;
      for (const handle of handles) ioClear(handle);
      handles.clear();
      await service.writeLock;
      await Promise.allSettled([...pending]);
    },
  };
}
