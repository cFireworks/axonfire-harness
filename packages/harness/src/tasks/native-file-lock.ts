// Complete original module 65117 class. TS annotations and explicit runtime bindings only.
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { tmpdir } from "node:os";
import { Mutex } from "async-mutex";
export function createNativeFileLock(runtime: any = {}) {
  const ed = { Mutex: runtime.Mutex ?? Mutex },
    ep: any = runtime.fs ?? fs,
    eg = { tmpdir: runtime.tmpdir ?? tmpdir },
    eh = path,
    process = runtime.process ?? globalThis.process,
    Date = runtime.Date ?? globalThis.Date,
    setTimeout = runtime.setTimeout ?? globalThis.setTimeout;
  // UTF-16 9144647..9146302
  class FileLockServiceImpl {
    [key: string]: any;
    constructor() {
      ((this.locks = new Map()),
        (this.defaultOptions = {
          maxRetries: 5,
          retryDelay: 500,
          staleTimeout: 3e5,
        }));
    }
    getLockMutex(eA: any): any {
      let el: any = this.locks.get(eA);
      return (el || ((el = new ed.Mutex()), this.locks.set(eA, el)), el);
    }
    async acquireFileLock(eA: any, el: any): Promise<any> {
      let ec: any = { ...this.defaultOptions, ...el },
        eu: any = eh.join(eg.tmpdir(), `${this.sanitizePath(eA)}.lock`),
        ed: any = this.getLockMutex(eu),
        ef: any = await ed.acquire(),
        em: any = 0,
        eE: any = 0,
        eC: any = 3,
        createLockError: any = () =>
          Error(
            `Failed to acquire lock for ${eA}. Please retry after ${ec.staleTimeout / 6e4} minutes, or force: rm -rf ${eu}`,
          );
      try {
        for (; em < ec.maxRetries; ) {
          em > 0 &&
            (await new Promise((eA: any) => setTimeout(eA, ec.retryDelay)));
          let eA: any = await this.tryCreateLock(eu);
          if (eA.success)
            return async () => {
              try {
                await (0, ep.rm)(eu, { recursive: !0, force: !0 });
              } catch (eA: any) {}
              ef();
            };
          if ("EEXIST" !== eA.error.code) throw eA.error;
          if (
            (await this.isLockStale(eu, ec.staleTimeout)) &&
            eE < eC &&
            (await (0, ep.rm)(eu, { recursive: !0, force: !0 })
              .then(() => !0)
              .catch(() => !1))
          ) {
            eE++;
            continue;
          }
          em++;
        }
        throw createLockError();
      } catch (eA: any) {
        throw (ef(), eA);
      }
    }
    async tryCreateLock(eA: any): Promise<any> {
      try {
        await (0, ep.mkdir)(eA, { recursive: !1 });
        let el: any = { pid: process.pid, timestamp: Date.now() };
        try {
          await (0, ep.writeFile)(eh.join(eA, "lock.json"), JSON.stringify(el));
        } catch (el: any) {
          throw (
            await (0, ep.rm)(eA, { recursive: !0, force: !0 }).catch(() => {}),
            el
          );
        }
        return { success: !0 };
      } catch (eA: any) {
        return { success: !1, error: eA };
      }
    }
    async isLockStale(eA: any, el: any): Promise<any> {
      try {
        let ec: any = eh.join(eA, "lock.json"),
          eu: any = await (0, ep.readFile)(ec, "utf-8"),
          ed: any = JSON.parse(eu);
        if (Date.now() - ed.timestamp > el) return !0;
        if (ed.pid && "number" == typeof ed.pid)
          try {
            process.kill(ed.pid, 0);
          } catch (eA: any) {
            if (eA?.code === "ESRCH") return !0;
          }
        return !1;
      } catch (eA: any) {
        return !0;
      }
    }
    sanitizePath(eA: any): any {
      return eA.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-50);
    }
  }
  return { FileLockServiceImpl };
}
