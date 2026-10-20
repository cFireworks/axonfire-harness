import { AsyncLocalStorage } from "node:async_hooks";
import { BehaviorSubject } from "rxjs";
import { distinctUntilChanged, map } from "rxjs/operators/index.js";

/** 13441020..13441541: an async-local override does not mutate global cwd state. */
export class CwdService {
  private readonly asyncLocalStorage = new AsyncLocalStorage<string>();
  private globalCwdState: string | null = null;
  readonly cwdSubject = new BehaviorSubject(process.cwd());
  readonly onDidChangeCwd = this.cwdSubject.pipe(map(() => this.getCwd()), distinctUntilChanged());
  setCwdState(directory: string, emit = false): void {
    const changed = this.globalCwdState !== directory;
    this.globalCwdState = directory;
    if (emit && changed) this.cwdSubject.next(directory);
  }
  async runWithCwd<T>(directory: string, operation: () => Promise<T>): Promise<T> { return this.asyncLocalStorage.run(directory, operation); }
  getCwd(): string { return this.asyncLocalStorage.getStore() || this.globalCwdState || process.cwd(); }
}
