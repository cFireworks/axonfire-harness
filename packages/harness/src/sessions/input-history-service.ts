import { join } from "node:path";
import type { InputHistoryRuntime } from "./input-history-runtime.js";
export const INPUT_HISTORY_STORAGE_FILE = "history.jsonl";
export const InputHistoryService = Symbol("InputHistoryService");
// Native UTF-16 11139187..11142447.
export class InputHistoryServiceImpl {
  [key: string]: any;
  constructor(readonly runtime: InputHistoryRuntime) {
    Object.assign(this, runtime);
    ((this.writeLock = Promise.resolve()),
      (this.maxHistorySize = 1e4),
      (this.localStorageKey = "input_history"),
      (this.cleanupTimer = null),
      (this.cleanupDelay = 5e3),
      (this.lastHistoryItem = void 0));
  }
  getHistoryFilePath(): any {
    return join(this.runtime.getHomeDir(), INPUT_HISTORY_STORAGE_FILE);
  }
  async readHistoryFile(): Promise<any> {
    try {
      let eA: any = this.getHistoryFilePath(),
        el: any = (await this.runtime.fs.readFile(eA, "utf-8"))
          .trim()
          .split("\n")
          .filter((eA: any) => eA.trim()),
        ec: any = [];
      for (let eA of el)
        try {
          let el: any = JSON.parse(eA);
          ec.push(el);
        } catch (el: any) {
          this.logger.warn("Skipping invalid history line:", eA);
        }
      return ec;
    } catch (eA: any) {
      if ("ENOENT" === eA.code) return [];
      throw eA;
    }
  }
  async writeHistoryFile(eA: any): Promise<any> {
    let el: any = this.getHistoryFilePath(),
      ec: any = eA.map((eA: any) => JSON.stringify(eA)).join("\n") + "\n";
    await this.runtime.fs.writeFile(el, ec, "utf-8");
  }
  async getLegacyHistoryFromLocalStorage(): Promise<any> {
    try {
      return (await this.localStorage.get(this.localStorageKey, [])) || [];
    } catch (eA: any) {
      return (
        this.logger.warn("Failed to get history from localStorage:", eA),
        []
      );
    }
  }
  async appendHistoryItem(eA: any): Promise<any> {
    try {
      let el: any = this.getHistoryFilePath(),
        ec: any = JSON.stringify(eA) + "\n";
      await this.runtime.fs.appendFile(el, ec, "utf-8");
    } catch (eA: any) {
      throw (this.logger.error("Failed to append history item:", eA), eA);
    }
  }
  scheduleCleanup(): any {
    (this.cleanupTimer && this.runtime.clearTimeout(this.cleanupTimer),
      (this.cleanupTimer = this.runtime.setTimeout(() => {
        this.cleanupExcessHistory().catch((eA: any) => {
          this.logger.warn("Scheduled cleanup failed:", eA);
        });
      }, this.cleanupDelay)));
  }
  async cleanupExcessHistory(): Promise<any> {
    try {
      let eA: any,
        el: any = this.getHistoryFilePath();
      try {
        eA = await this.runtime.fs.stat(el);
      } catch (eA: any) {
        return;
      }
      let ec: any = 120 * this.maxHistorySize;
      if (eA.size < ec) return;
      let eu: any = (await this.runtime.fs.readFile(el, "utf-8"))
        .trim()
        .split("\n")
        .filter((eA: any) => eA.trim());
      if (eu.length > this.maxHistorySize) {
        let eA: any = eu.slice(-this.maxHistorySize),
          ec: any = eA.join("\n") + "\n";
        (await this.runtime.fs.writeFile(el, ec, "utf-8"),
          this.logger.info(
            `Cleaned up ${eu.length - eA.length} excess history records`,
          ));
      }
    } catch (eA: any) {
      this.logger.warn("Failed to cleanup excess history:", eA);
    }
  }
  async addHistory(eA: any): Promise<any> {
    let el: any,
      ec: any = this.writeLock,
      eu: any = new Promise((eA: any) => (el = eA));
    this.writeLock = ec.then(() => eu);
    try {
      await ec;
      let el: any = await this.runtime.getWorkDir(),
        eu: any = { ...eA, timestamp: this.runtime.now(), project: el };
      if (
        this.lastHistoryItem &&
        this.lastHistoryItem.display === eu.display &&
        this.lastHistoryItem.project === eu.project
      )
        return;
      (await this.appendHistoryItem(eu),
        (this.lastHistoryItem = eu),
        this.scheduleCleanup());
    } catch (eA: any) {
      throw (this.logger.error("Failed to add history:", eA), eA);
    } finally {
      el();
    }
  }
  async getHistoryForProject(eA: any = 100): Promise<any> {
    try {
      let el: any = await this.runtime.getWorkDir(),
        ec: any = (await this.readHistoryFile()).filter(
          (eA: any) => eA.project === el,
        );
      if (ec.length > 0)
        return (
          ec.sort((eA: any, el: any) => el.timestamp - eA.timestamp),
          ec.slice(0, eA).reverse()
        );
      let eu: any = await this.getLegacyHistoryFromLocalStorage();
      if (eu.length > 0) {
        let ec: any = this.runtime.now() - 1e3 * eu.length,
          ed: any = eu.map((eA: any, eu: any) => ({
            display: eA,
            pastedContents: {},
            timestamp: ec + 1e3 * eu,
            project: el,
          }));
        return (
          ed.sort((eA: any, el: any) => el.timestamp - eA.timestamp),
          ed.slice(0, eA).reverse()
        );
      }
      return [];
    } catch (eA: any) {
      return (this.logger.error("Failed to get project history:", eA), []);
    }
  }
  async cleanupHistory(eA: any = 30): Promise<any> {
    try {
      let el: any = this.runtime.now() - 24 * eA * 36e5,
        ec: any = await this.readHistoryFile(),
        eu: any = ec.filter((eA: any) => eA.timestamp >= el);
      eu.length !== ec.length &&
        (await this.writeHistoryFile(eu),
        this.logger.info(
          `Cleaned up ${ec.length - eu.length} expired history records`,
        ));
    } catch (eA: any) {
      throw (this.logger.error("Failed to cleanup history:", eA), eA);
    }
  }
}
