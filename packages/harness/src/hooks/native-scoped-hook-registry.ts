import { HookEvent, HookPriority } from "./hook-constants.js";
import type { GenericHookRuntime } from "./hook-runtime.js";
const oH = { HookEvent, HookPriority };
// Native UTF-16 8477754..8478813.
export class ScopedHookRegistryImpl {
  [key: string]: any;
  constructor(readonly runtime: GenericHookRuntime) {
    Object.assign(this, runtime.dependencies);
    this.scopes = new Map();
  }
  register(eA: any, el: any, ec: any): any {
    if (!eA)
      return void this.logger.warn?.(
        "[ScopedHookRegistry] register called with empty scopeId, ignored",
      );
    let eu: any = new Map(),
      ed: any = 0,
      stamp: any = (el: any) =>
        el.map((el: any) => ({
          ...el,
          hooks: el.hooks.map((el: any) =>
            el.sourceId ? el : { ...el, sourceId: eA },
          ),
        }));
    for (let [eA, ep] of Object.entries(el as Record<string, any>)) {
      if (!ep || 0 === ep.length) continue;
      let el: any = eA;
      ec.isAgent &&
        eA === oH.HookEvent.STOP &&
        (el = oH.HookEvent.SUBAGENT_STOP);
      let eg: any = stamp(ep),
        eh: any = eu.get(el) ?? [];
      (eu.set(el, [...eh, ...eg]), (ed += eg.length));
    }
    (this.scopes.set(eA, { byEvent: eu, sourceLabel: ec.sourceLabel }),
      this.logger.info?.(
        `[ScopedHookRegistry] registered ${ed} hook config(s) for scope '${eA}' (${ec.sourceLabel}, isAgent=${!0 === ec.isAgent})`,
      ));
  }
  unregister(eA: any): any {
    let el: any = this.scopes.get(eA);
    el &&
      (this.scopes.delete(eA),
      this.logger.info?.(
        `[ScopedHookRegistry] unregistered scope '${eA}' (${el.sourceLabel})`,
      ));
  }
  getHooks(eA: any): any {
    if (0 === this.scopes.size) return [];
    let el: any = [];
    for (let ec of this.scopes.values()) {
      let eu: any = ec.byEvent.get(eA);
      eu && eu.length > 0 && el.push(...eu);
    }
    return el;
  }
  hasScope(eA: any): any {
    return this.scopes.has(eA);
  }
}
