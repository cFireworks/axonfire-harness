const iq = {
    ENV_KEY_CODEBUDDY_DEFER_TOOL_LOADING: "CODEBUDDY_DEFER_TOOL_LOADING",
    ENV_KEY_CODEBUDDY_SHOW_ALL_DEFERRED_TOOLS:
      "CODEBUDDY_SHOW_ALL_DEFERRED_TOOLS",
  },
  nq = { ProductFeature: { DeferToolLoading: "DeferToolLoading" } };
// Native UTF-16 12005561..12006914.
export class DeferToolConfigServiceImpl {
  [key: string]: any;
  constructor(
    readonly runtime: {
      env: NodeJS.ProcessEnv;
      dependencies: Record<string, any>;
    },
  ) {
    Object.assign(this, runtime.dependencies);
  }
  async isGlobalDeferLoadingEnabled(): Promise<any> {
    let eA: any = this.runtime.env[iq.ENV_KEY_CODEBUDDY_DEFER_TOOL_LOADING];
    if (void 0 !== eA) {
      let el: any = this.parseEnvBoolean(eA);
      if (void 0 !== el) return el;
    }
    let el: any = await this.settingsManager.get("deferToolLoading");
    return void 0 !== el ? el : await this.getProductConfig();
  }
  shouldShowAllTools(): any {
    let eA: any =
      this.runtime.env[iq.ENV_KEY_CODEBUDDY_SHOW_ALL_DEFERRED_TOOLS];
    return void 0 !== eA && (this.parseEnvBoolean(eA) ?? !1);
  }
  async isToolDeferLoading(eA: any, ...el: any[]): Promise<any> {
    return this.isToolDeferLoadingWithOverlay(void 0, eA, ...el);
  }
  async isToolDeferLoadingWithOverlay(
    eA: any,
    el: any,
    ...ec: any[]
  ): Promise<any> {
    if (!0 === el.alwaysLoad) return !1;
    if (eA && !eA.isEmpty())
      for (let el of ec) {
        let ec: any = eA.decide(el);
        if ("force-no-defer" === ec) return !1;
        if ("force-defer" === ec) return !0;
      }
    let eu: any = "tools" in el ? el.tools : void 0;
    if (eu)
      for (let eA of ec) {
        let el: any = eu[eA]?.defer_loading;
        if (void 0 !== el) return el;
      }
    return "defer_loading" in el && void 0 !== el.defer_loading
      ? el.defer_loading
      : this.isGlobalDeferLoadingEnabled();
  }
  isBuiltinToolDeferLoading(eA: any, el: any, ec: any): any {
    if (ec && !ec.isEmpty()) {
      let el: any = ec.decide(eA);
      if ("force-no-defer" === el) return !1;
      if ("force-defer" === el) return !0;
    }
    return el;
  }
  parseEnvBoolean(eA: any): any {
    let el: any = eA.toLowerCase().trim();
    return (
      "true" === el || "1" === el || ("false" !== el && "0" !== el && void 0)
    );
  }
  async getProductConfig(): Promise<any> {
    let eA: any = await this.productManager.waitConfiguration();
    return eA.productFeatures?.[nq.ProductFeature.DeferToolLoading] ?? !0;
  }
}
