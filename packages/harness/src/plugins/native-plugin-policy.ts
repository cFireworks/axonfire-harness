// Complete original PluginPolicyService; platform/application container is injected.
import { NativeEmitter } from "../agents/native-agent-manager-runtime.js";
export function createNativePluginPolicy(runtime: any) {
  const ed = {
      Emitter: NativeEmitter,
      ContainerUtil: {
        get: (key: any) => {
          if (!(key in runtime.dependencies))
            throw Error("Plugin policy dependency not configured: " + key);
          return runtime.dependencies[key];
        },
      },
    },
    ep = { ProductManager: "productManager" },
    eh = /^[a-zA-Z0-9_.\-@/]+$/;
  // UTF-16 9824149..9826670
  class PluginPolicyServiceImpl {
    [key: string]: any;
    constructor() {
      ((this.mergedPlugins = new Map()),
        (this.onDidChangeEmitter = new ed.Emitter()),
        (this.onDidChange = this.onDidChangeEmitter.event));
    }
    init(): any {
      (this.logger.setContext("PluginPolicyService"),
        this.logger.info(
          "[MergedPlugins][DEBUG] PluginPolicyService @PostConstruct - calling loadPolicies for the first time",
        ),
        this.loadPolicies());
      try {
        let eA: any = ed.ContainerUtil.get(ep.ProductManager);
        eA.onDidChange(() => {
          this.logger.info(
            "[MergedPlugins][DEBUG] ProductManager.onDidChange fired, reloading policies...",
          );
          let el: any = eA.getCurrentConfiguration();
          (this.logger.info(
            `[MergedPlugins][DEBUG] Current config builtInMarketPluginsMerge: ${JSON.stringify(el?.builtInMarketPluginsMerge ?? "undefined")}`,
          ),
            this.loadPolicies());
        });
      } catch (eA: any) {
        this.logger.warn(
          `[MergedPlugins] Failed to subscribe to ProductManager.onDidChange: ${eA}`,
        );
      }
    }
    loadPolicies(): any {
      try {
        let eA: any = ed.ContainerUtil.get(
            ep.ProductManager,
          ).getCurrentConfiguration(),
          el: any = eA?.builtInMarketPluginsMerge || [],
          ec: any = new Map(this.mergedPlugins);
        for (let eA of (this.mergedPlugins.clear(), el)) {
          if (!eA.name || !eA.marketplaceName) {
            this.logger.warn(
              `[MergedPlugins] Invalid plugin entry, skipping: ${JSON.stringify(eA)}`,
            );
            continue;
          }
          if (!eh.test(eA.name) || !eh.test(eA.marketplaceName)) {
            this.logger.warn(
              `[MergedPlugins] Suspicious name, skipping: ${eA.name}@${eA.marketplaceName}`,
            );
            continue;
          }
          this.mergedPlugins.set(`${eA.name}@${eA.marketplaceName}`, eA);
        }
        (this.logger.info(
          `[MergedPlugins] Loaded ${this.mergedPlugins.size} merged plugin entries`,
        ),
          this.hasPluginsChanged(ec, this.mergedPlugins) &&
            (this.logger.info(
              "[MergedPlugins] Merged plugins changed, firing onDidChange",
            ),
            this.onDidChangeEmitter.fire()));
      } catch (eA: any) {
        this.logger.error(
          `[MergedPlugins] Failed to load merged plugins: ${eA}`,
        );
      }
    }
    hasPluginsChanged(eA: any, el: any): any {
      if (eA.size !== el.size) return !0;
      for (let [ec, eu] of el) {
        let el: any = eA.get(ec);
        if (
          !el ||
          el.scope !== eu.scope ||
          el.autoEnable !== eu.autoEnable ||
          el.canRemove !== eu.canRemove ||
          el.canSwitchoff !== eu.canSwitchoff ||
          el.canEdit !== eu.canEdit
        )
          return !0;
      }
      for (let ec of eA.keys()) if (!el.has(ec)) return !0;
      return !1;
    }
    getMergedPlugins(): any {
      return Array.from(this.mergedPlugins.values());
    }
    getMergedPlugin(eA: any): any {
      return this.mergedPlugins.get(eA);
    }
    isPluginCannotRemove(eA: any): any {
      let el: any = this.mergedPlugins.get(eA);
      return void 0 !== el && !1 === el.canRemove;
    }
    isPluginCannotSwitchoff(eA: any): any {
      let el: any = this.mergedPlugins.get(eA);
      return void 0 !== el && !1 === el.canSwitchoff;
    }
    isPluginCannotEdit(eA: any): any {
      let el: any = this.mergedPlugins.get(eA);
      return void 0 !== el && !1 === el.canEdit;
    }
    isPluginAutoInstall(eA: any): any {
      return this.mergedPlugins.has(eA);
    }
    isMarketplaceBlockedByPolicy(eA: any): any {
      return !1;
    }
  }
  return { PluginPolicyServiceImpl };
}
