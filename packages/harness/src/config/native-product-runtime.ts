// Fixed WorkBuddy 5.3.14 SHA; complete original classes/methods, TS-only annotations and outer DI.
import * as fs from "node:fs";
import * as path from "node:path";
import * as zlib from "node:zlib";
import { BehaviorSubject } from "rxjs";
import { NativeEmitter } from "../agents/native-agent-manager-runtime.js";
import { createMemoryRuleUtilities } from "../memory/memory-rule-utilities.js";
import { generateSkillColor } from "../commands/skill-product-provider.js";
import * as constants from "./native-product-constants.js";
export function createNativeProductRuntime(runtime: any) {
  const Object: any = globalThis.Object,
    process = { env: runtime.env ?? {}, cwd: runtime.getWorkDir },
    Date = { now: runtime.now ?? globalThis.Date.now },
    setTimeout = runtime.setTimeout ?? globalThis.setTimeout,
    clearTimeout = runtime.clearTimeout ?? globalThis.clearTimeout;
  const BooleanUtils = {
      isTruthy: (eA: any) =>
        !!eA &&
        ("boolean" == typeof eA
          ? eA
          : ["1", "true", "yes", "on"].includes(eA.toLowerCase().trim())),
    },
    ObjectUtils = {
      isChanged: (eA: any, el: any) =>
        JSON.stringify(eA) !== JSON.stringify(el),
    };
  const mergerClasses = (() => {
    const eg = constants,
      em = new Set(["builtInMarketPluginsMerge"]);
    // UTF-16 15599132..15599242
    class OverrideProductMergeStrategy {
      [key: string]: any;
      async merge(eA: any, el: any): Promise<any> {
        return { ...el };
      }
      async support(eA: any): Promise<any> {
        return eA.mergeStrategy === eg.MergeStrategy.Override;
      }
    }
    // UTF-16 15599371..15599892
    class MergeProductMergeStrategy {
      [key: string]: any;
      async merge(eA: any, el: any): Promise<any> {
        return this.doMerge(eA, el);
      }
      mergeArray(eA: any, el: any): any {
        return el;
      }
      doMerge(eA: any, el: any): any {
        if (void 0 === el) return eA;
        if (!eA) return Array.isArray(el) ? this.mergeArray([], el) : el;
        if (null === el) return eA;
        if (Array.isArray(eA) || Array.isArray(el))
          return this.mergeArray(eA, el);
        let ec: any = el;
        if (
          "object" == typeof eA &&
          null !== eA &&
          "object" == typeof el &&
          null !== el
        )
          for (let eu of ((ec = { ...eA }), Object.keys(el)))
            ec[eu] = this.doMerge(eA[eu], el[eu]);
        return ec;
      }
      async support(eA: any): Promise<any> {
        return eA.mergeStrategy === eg.MergeStrategy.Merge || !eA.mergeStrategy;
      }
    }
    const ef: any = MergeProductMergeStrategy;
    // UTF-16 15600057..15601365
    class SmartMergeProductMergeStrategy extends ef {
      [key: string]: any;
      async support(eA: any): Promise<any> {
        return eA.mergeStrategy === eg.MergeStrategy.SmartMerge;
      }
      isObjectArray(eA: any): any {
        return (
          Array.isArray(eA) &&
          (0 === eA.length || eA.every((eA: any) => "object" == typeof eA))
        );
      }
      getItemIdOrName(eA: any): any {
        return (null == eA ? void 0 : eA.id) || (null == eA ? void 0 : eA.name);
      }
      doMergeWithPath(eA: any, el: any, ec: any): any {
        if (void 0 === el) return eA;
        if (!eA && !Array.isArray(el)) return el;
        if (null === el) return eA;
        if (Array.isArray(eA) || Array.isArray(el))
          return this.mergeArrayWithPath(eA, el, ec);
        let eu: any = el;
        if (
          "object" == typeof eA &&
          null !== eA &&
          "object" == typeof el &&
          null !== el
        )
          for (let ed of ((eu = { ...eA }), Object.keys(el)))
            eu[ed] = this.doMergeWithPath(eA[ed], el[ed], [...ec, ed]);
        return eu;
      }
      mergeArrayWithPath(eA: any, el: any, ec: any): any {
        let eu: any = ec[ec.length - 1];
        return eu && em.has(eu) && Array.isArray(el)
          ? el
          : this.mergeArray(null != eA ? eA : [], null != el ? el : []);
      }
      async merge(eA: any, el: any): Promise<any> {
        return this.doMergeWithPath(eA, el, []);
      }
      mergeArray(eA: any, el: any): any {
        if (!this.isObjectArray(eA) || !this.isObjectArray(el))
          return super.mergeArray(eA, el);
        let ec: any = [...eA],
          eu: any = new Map();
        for (let eA of (ec.forEach((eA: any, el: any) => {
          let ec: any = this.getItemIdOrName(eA);
          ec && !eu.has(ec) && eu.set(ec, el);
        }),
        el)) {
          if (!eA) continue;
          let el: any = this.getItemIdOrName(eA);
          if (!el) {
            ec.push(eA);
            continue;
          }
          let ed: any = eu.get(el);
          if (void 0 === ed) {
            (eu.set(el, ec.length), ec.push(eA));
            continue;
          }
          let ep: any = ec[ed];
          "replace" !== ep[eg.OVERRIDE_MODE] && (ec[ed] = this.doMerge(ep, eA));
        }
        return ec;
      }
    }
    const eE: any = SmartMergeProductMergeStrategy;
    // UTF-16 15601498..15602636
    class DeepSmartMergeProductMergeStrategy extends eE {
      [key: string]: any;
      constructor() {
        (super(...arguments),
          (this.sourceSeen = new WeakSet()),
          (this.targetSeen = new WeakSet()));
      }
      async support(eA: any): Promise<any> {
        return eA.mergeStrategy === eg.MergeStrategy.DeepSmartMerge;
      }
      async merge(eA: any, el: any): Promise<any> {
        return (
          (this.sourceSeen = new WeakSet()),
          (this.targetSeen = new WeakSet()),
          this.doMerge(eA, el)
        );
      }
      isPrimitiveArray(eA: any): any {
        return (
          Array.isArray(eA) &&
          eA.every((eA: any) => null === eA || "object" != typeof eA)
        );
      }
      mergeArray(eA: any, el: any): any {
        if (this.isPrimitiveArray(eA) && this.isPrimitiveArray(el)) {
          let ec: any = [...eA];
          for (let eA of el) ec.includes(eA) || ec.push(eA);
          return ec;
        }
        return super.mergeArray(eA, el);
      }
      doMerge(eA: any, el: any): any {
        if (
          this.isCircular(eA, this.sourceSeen) ||
          this.isCircular(el, this.targetSeen)
        )
          return el;
        if (!(this.isTrackable(eA) || this.isTrackable(el)))
          return super.doMerge(eA, el);
        this.enter(eA, el);
        try {
          return super.doMerge(eA, el);
        } finally {
          this.leave(eA, el);
        }
      }
      isTrackable(eA: any): any {
        return null !== eA && "object" == typeof eA;
      }
      isCircular(eA: any, el: any): any {
        return this.isTrackable(eA) && el.has(eA);
      }
      enter(eA: any, el: any): any {
        (this.isTrackable(eA) && this.sourceSeen.add(eA),
          this.isTrackable(el) && this.targetSeen.add(el));
      }
      leave(eA: any, el: any): any {
        (this.isTrackable(eA) && this.sourceSeen.delete(eA),
          this.isTrackable(el) && this.targetSeen.delete(el));
      }
    }
    // UTF-16 15602777..15603887
    class CommandsSmartMergeProductMergeStrategy extends ef {
      [key: string]: any;
      async support(eA: any): Promise<any> {
        return eA.mergeStrategy === eg.MergeStrategy.CommandsSmartMerge;
      }
      async merge(eA: any, el: any): Promise<any> {
        return this.doMergeWithPath(eA, el, []);
      }
      doMergeWithPath(eA: any, el: any, ec: any): any {
        if (void 0 === el) return eA;
        if (!eA && !Array.isArray(el)) return el;
        if (null === el) return eA;
        if (Array.isArray(eA) || Array.isArray(el))
          return this.mergeArrayWithPath(eA, el, ec);
        let eu: any = el;
        if (
          "object" == typeof eA &&
          null !== eA &&
          "object" == typeof el &&
          null !== el
        )
          for (let ed of ((eu = { ...eA }), Object.keys(el)))
            eu[ed] = this.doMergeWithPath(eA[ed], el[ed], [...ec, ed]);
        return eu;
      }
      mergeArrayWithPath(eA: any, el: any, ec: any): any {
        let eu: any = ec[ec.length - 1];
        return eu && em.has(eu) && Array.isArray(el)
          ? el
          : "commands" === eu
            ? this.mergeCommandsArray(
                Array.isArray(eA) ? eA : [],
                Array.isArray(el) ? el : [],
                ec,
              )
            : super.mergeArray(null != eA ? eA : [], null != el ? el : []);
      }
      mergeCommandsArray(eA: any, el: any, ec: any): any {
        if (!(null == el ? void 0 : el.length)) return null != eA ? eA : [];
        let eu: any = [...eA];
        for (let eA of el) {
          if (!eA) continue;
          let el: any = null == eA ? void 0 : eA.name;
          if (!el) {
            eu.push(eA);
            continue;
          }
          let ed: any = eu.findIndex(
            (eA: any) => (null == eA ? void 0 : eA.name) === el,
          );
          if (ed >= 0) {
            let ep: any = this.doMergeWithPath(eu[ed], eA, [...ec, el]);
            eu[ed] = ep;
          } else eu.push(eA);
        }
        return eu;
      }
    }
    // UTF-16 15604751..15605166
    const eh = ["projectId", "endpoint", "app", "server"];
    class DefaultProductMerger {
      [key: string]: any;
      async merge(...eA: any[]): Promise<any> {
        let el: any = {};
        for (let ec of eA) {
          for (let eA of this.productMergeStrategies)
            if (await eA.support(ec)) {
              el = await eA.merge(el, ec);
              break;
            }
          let eA: any = ec.galileo,
            eu: any = eh.filter((el: any) =>
              Object.prototype.hasOwnProperty.call(null != eA ? eA : {}, el),
            );
          eu.length > 0 &&
            eu.length < eh.length &&
            (el.galileo = {
              ...el.galileo,
              ...eA,
              enable: !1,
              projectId: void 0,
              endpoint: void 0,
              app: void 0,
              server: void 0,
            });
        }
        return (delete el.mergeStrategy, el);
      }
    }
    return {
      OverrideProductMergeStrategy,
      MergeProductMergeStrategy,
      SmartMergeProductMergeStrategy,
      DeepSmartMergeProductMergeStrategy,
      CommandsSmartMergeProductMergeStrategy,
      DefaultProductMerger,
    };
  })();
  const GzipUtils = (() => {
    const eg = runtime.gzipSync,
      eh = runtime.gunzipSync,
      getZlib = () => runtime.zlib ?? zlib; // UTF-16 15627963..15628249
    class GzipUtils {
      [key: string]: any;
      static compress(eA: any): any {
        return eg
          ? Buffer.from(eg(Buffer.from(eA))).toString("base64")
          : getZlib().gzipSync(eA).toString("base64");
      }
      static decompress(eA: any): any {
        let el: any = Buffer.from(eA, "base64");
        return eh
          ? Buffer.from(eh(el)).toString("utf-8")
          : getZlib().gunzipSync(el).toString("utf-8");
      }
    }
    return GzipUtils;
  })();
  const ProductManagerImpl = (() => {
    const eh = {
        Emitter: runtime.Emitter ?? NativeEmitter,
        Logger: "logger",
        ContainerUtil: {
          get: (name: string) => {
            if (!(name in runtime.dependencies))
              throw Error("Product dependency not configured: " + name);
            return runtime.dependencies[name];
          },
        },
      },
      ef = { BooleanUtils, ObjectUtils },
      eE = { BehaviorSubject },
      eC = constants,
      ey = { ProductFeature: constants.ProductFeature },
      ew = { GzipUtils },
      ed = { none: 0, cache: 1, server: 2 };
    let eu: any;
    // UTF-16 15588491..15597577
    class ProductManagerImpl {
      [key: string]: any;
      constructor() {
        ((this.onDidChangeEmitter = new eh.Emitter()),
          (this.onDidChange = this.onDidChangeEmitter.event),
          (this.lastSyncTime = 0),
          (this.configuration = new eE.BehaviorSubject(void 0)),
          (this.promise = Promise.resolve()),
          (this.dataLevel = ed.none),
          (this.lastProxySyncTime = 0));
      }
      static getCacheKey(): any {
        var eA: any;
        let el: any =
          null == (eA = process.env) ? void 0 : eA[eu.PRODUCT_VERSION_ENV_KEY];
        return el ? `${eu.cacheKeyPrefix}:${el}` : eu.cacheKeyPrefix;
      }
      init(): any {
        (this.loadFromCache(), this.sync());
      }
      loadFromCache(): any {
        var eA: any, el: any;
        if (
          ef.BooleanUtils.isTruthy(
            null == (eA = null == process ? void 0 : process.env)
              ? void 0
              : eA.CODEBUDDY_DISABLE_PRODUCT_CACHE,
          )
        )
          return;
        let ec: any =
          null == (el = this.localStorage.getSync)
            ? void 0
            : el.bind(this.localStorage);
        if (!ec) return void this.loadFromCacheAsync();
        try {
          let eA: any,
            el: any = ec(eu.endpointCacheKey);
          el && ((this.cachedEndpoint = el), (this.currentEndpoint = el));
          let ep: any = ec(eu.getCacheKey());
          if ("string" == typeof ep)
            try {
              eA = JSON.parse(ew.GzipUtils.decompress(ep));
            } catch (eA: any) {}
          else ep && "object" == typeof ep && (eA = ep);
          if (this.dataLevel >= ed.cache || void 0 === eA) return;
          if (
            ((this._configuration = eA),
            this.configuration.next(this._configuration),
            (this.dataLevel = ed.cache),
            !process.env[eu.ENV_KEY])
          ) {
            let el: any = eu.resolveNetworkEnvironmentFromProductConfigEnv(eA);
            if (el) process.env[eu.ENV_KEY] = el;
            else {
              let eA: any = ec(eu.envCacheKey);
              eA && (process.env[eu.ENV_KEY] = eA);
            }
          }
        } catch (eA: any) {}
      }
      async loadFromCacheAsync(): Promise<any> {
        let eA: any,
          el: any = await this.localStorage.get(eu.endpointCacheKey);
        el && ((this.cachedEndpoint = el), (this.currentEndpoint = el));
        let ec: any = await this.localStorage.get(eu.getCacheKey());
        if ("string" == typeof ec)
          try {
            eA = JSON.parse(ew.GzipUtils.decompress(ec));
          } catch (eA: any) {}
        else ec && "object" == typeof ec && (eA = ec);
        if (
          !(this.dataLevel >= ed.cache) &&
          void 0 !== eA &&
          ((this._configuration = eA),
          this.configuration.next(this._configuration),
          (this.dataLevel = ed.cache),
          !process.env[eu.ENV_KEY])
        ) {
          let el: any = eu.resolveNetworkEnvironmentFromProductConfigEnv(eA);
          if (el) process.env[eu.ENV_KEY] = el;
          else {
            let eA: any = await this.localStorage.get(eu.envCacheKey);
            eA && (process.env[eu.ENV_KEY] = eA);
          }
        }
      }
      static resolveNetworkEnvironmentFromProductConfigEnv(eA: any): any {
        let el: any = null == eA ? void 0 : eA.productConfigEnv;
        if (el)
          for (let eA of "string" == typeof el ? [el] : el) {
            let el: any = process.env[eA];
            if (el)
              try {
                let eA: any = JSON.parse(el);
                if (null == eA ? void 0 : eA.networkEnvironment)
                  return eA.networkEnvironment;
              } catch (eA: any) {}
          }
      }
      async saveToCache(): Promise<any> {
        var eA: any;
        try {
          let el: any =
              null != (eA = this._stableConfiguration)
                ? eA
                : this._configuration,
            ec: any = JSON.stringify(el),
            ed: any = await ew.GzipUtils.compress(ec);
          await this.localStorage.set(eu.getCacheKey(), ed);
        } catch (eA: any) {
          eh.ContainerUtil.get(eh.Logger).error(
            `Failed to save product cache: ${eA}`,
            eu.name,
          );
        }
        this.currentEndpoint &&
          this.currentEndpoint !== this.cachedEndpoint &&
          ((this.cachedEndpoint = this.currentEndpoint),
          await this.localStorage.set(
            eu.endpointCacheKey,
            this.currentEndpoint,
          ));
        let el: any = process.env[eu.ENV_KEY];
        el && (await this.localStorage.set(eu.envCacheKey, el));
      }
      getEndpoint(): any {
        var eA: any, el: any;
        return null !=
          (el =
            null == (eA = this.currentEndpoint)
              ? void 0
              : eA.replace(/\/+$/, ""))
          ? el
          : "";
      }
      getCurrentConfiguration(): any {
        return this.currentConfiguration;
      }
      isStagingEnv(): any {
        var eA: any;
        let el: any =
          null == (eA = this.currentConfiguration)
            ? void 0
            : eA.stagingEndpoint;
        return !!el && this.getEndpoint() === el.replace(/\/+$/, "");
      }
      throttledSyncForProxy(): any {
        let eA: any = Date.now(),
          el: any = eA - this.lastProxySyncTime;
        if (el >= eu.PROXY_SYNC_THROTTLE_MS) {
          (this.proxySyncThrottleTimer &&
            (clearTimeout(this.proxySyncThrottleTimer),
            (this.proxySyncThrottleTimer = void 0)),
            (this.lastProxySyncTime = eA),
            this.sync());
          return;
        }
        this.proxySyncThrottleTimer &&
          clearTimeout(this.proxySyncThrottleTimer);
        let ec: any = eu.PROXY_SYNC_THROTTLE_MS - el;
        this.proxySyncThrottleTimer = setTimeout(() => {
          ((this.proxySyncThrottleTimer = void 0),
            (this.lastProxySyncTime = Date.now()),
            this.sync());
        }, ec);
      }
      async sync(eA?: any): Promise<any> {
        return (
          (this.lastSyncTime = Date.now()),
          (this.promise = this.promise.finally(() => this.doSync(eA))),
          this.promise
        );
      }
      async syncVolatileProviders(eA?: any): Promise<any> {
        return (
          (this.lastSyncTime = Date.now()),
          (this.promise = this.promise.finally(() =>
            this.doSyncVolatileProviders(eA),
          )),
          this.promise
        );
      }
      async doSyncVolatileProviders(eA: any): Promise<any> {
        var el: any, ec: any;
        let ep: any = [...(await this.productProviderProvider.sort())]
            .reverse()
            .filter((eA: any) => eA.volatile),
          eg: any =
            null !=
            (ec =
              null != (el = this._stableConfiguration)
                ? el
                : this._configuration)
              ? ec
              : {},
          em: any = { force: !!eA, current: this.cloneConfiguration(eg) };
        try {
          for (let eA of ep) {
            let el: any = await eA.provide(em);
            ((em.current = await this.productMerger.merge(em.current, el)),
              (this.currentConfiguration = em.current));
          }
        } catch (eA: any) {
          try {
            eh.ContainerUtil.get(eh.Logger).error(
              `Error while syncing volatile product providers: ${eA}`,
              eu.name,
            );
          } catch (eA: any) {
            console.error(
              `Error while syncing volatile product providers: ${eA}`,
            );
          }
        }
        if (
          (em.current.endpoint && (this.currentEndpoint = em.current.endpoint),
          (this.currentConfiguration = em.current),
          this.applyProductFeatureFilters(em.current),
          !ef.ObjectUtils.isChanged(this._configuration, em.current))
        )
          return;
        this._configuration = em.current;
        let eE: any = new Proxy(em.current, {
          get: (eA: any, el: any) => (
            Date.now() - this.lastSyncTime >
              eC.PRODUCT_CONFIGURATION_CACHE_TIMEOUT &&
              this.throttledSyncForProxy(),
            eA[el]
          ),
        });
        ((this.dataLevel = ed.server),
          this.configuration.next(eE),
          this.onDidChangeEmitter.fire());
      }
      async doSync(eA: any): Promise<any> {
        var el: any, ec: any;
        let ep: any,
          eg: any = await this.productProviderProvider.sort(),
          em: any = {
            force: !!eA,
            current: this._stableConfiguration
              ? this.cloneConfiguration(this._stableConfiguration)
              : {},
          },
          eE: any = new Set([
            "McpPromptProductProvider",
            "CustomAgentsProductProvider",
            "CustomCommandsProductProvider",
            "ApiKeyHelperProductProvider",
            "SkillProductProvider",
            "PluginsProductProvider",
          ]),
          ey: any = new Set([
            "ClientProductProvider",
            "SettingsEndpointProductProvider",
            "ClientInternetEnviromentProductProvider",
            "WorkbuddyDevEnvEndpointProductProvider",
          ]),
          ew: any = new Set(["CloudProductProvider", "ModelsProductProvider"]),
          eB: any = new Map(),
          e_: any = [...eg].reverse();
        for (let eA of e_) ey.has(eA.constructor.name) && (ep = eA);
        for (let eA of e_)
          eE.has(eA.constructor.name) &&
            eB.set(
              eA,
              eA
                .provide(em)
                .catch(
                  (el: any) => (
                    eh.ContainerUtil.get(eh.Logger).debug(
                      `Error in independent provider ${eA.constructor.name}: ${el}`,
                    ),
                    {}
                  ),
                ),
            );
        let eI: any = [],
          ev: any = !1;
        try {
          for (let eA of e_) {
            let eu: any;
            ((eu = eB.has(eA) ? await eB.get(eA) : await eA.provide(em)),
              eA.volatile ? (ev = !0) : eI.push(eu),
              (em.current = await this.productMerger.merge(em.current, eu)),
              (this.currentConfiguration = em.current));
            let ed: any = null == (el = em.current.config) ? void 0 : el.url;
            if (
              (this.previousConfigUrl !== ed &&
                (eh.ContainerUtil.get(eh.Logger).info(
                  `[ProductManager] config.url 变更: 从 "${null != (ec = this.previousConfigUrl) ? ec : "undefined"}" 变更为 "${null != ed ? ed : "undefined"}" (Provider: ${eA.constructor.name})`,
                ),
                (this.previousConfigUrl = ed)),
              eA === ep && em.current.endpoint)
            )
              for (let eA of e_)
                ew.has(eA.constructor.name) &&
                  !eB.has(eA) &&
                  eB.set(
                    eA,
                    eA
                      .provide(em)
                      .catch(
                        (el: any) => (
                          eh.ContainerUtil.get(eh.Logger).debug(
                            `Error in endpoint-dependent provider ${eA.constructor.name}: ${el}`,
                          ),
                          {}
                        ),
                      ),
                  );
          }
        } catch (eA: any) {
          try {
            eh.ContainerUtil.get(eh.Logger).error(
              `Error while syncing product configuration: ${eA}`,
              eu.name,
            );
          } catch (eA: any) {
            console.error(`Error while syncing product configuration: ${eA}`);
          }
        }
        if (
          (em.current.endpoint && (this.currentEndpoint = em.current.endpoint),
          this.applyProductFeatureFilters(em.current),
          ev)
        ) {
          let eA: any = {};
          for (let el of eI) eA = await this.productMerger.merge(eA, el);
          this._stableConfiguration = eA;
        } else this._stableConfiguration = void 0;
        if (!ef.ObjectUtils.isChanged(this._configuration, em.current)) return;
        this._configuration = em.current;
        let eS: any = new Proxy(em.current, {
          get: (eA: any, el: any) => (
            Date.now() - this.lastSyncTime >
              eC.PRODUCT_CONFIGURATION_CACHE_TIMEOUT &&
              this.throttledSyncForProxy(),
            eA[el]
          ),
        });
        ((this.dataLevel = ed.server),
          this.configuration.next(eS),
          this.onDidChangeEmitter.fire(),
          this.saveToCache());
      }
      async waitConfiguration(eA: any = !1): Promise<any> {
        return (
          eA && (await this.promise),
          new Promise((eA: any) => {
            let el: any = this.configuration.subscribe((ec: any) => {
              ec &&
                (eA(ec),
                setTimeout(() => {
                  el.unsubscribe();
                }, 0));
            });
          })
        );
      }
      cloneConfiguration(eA: any): any {
        return JSON.parse(JSON.stringify(eA));
      }
      applyProductFeatureFilters(eA: any): any {
        var el: any, ec: any, eu: any;
        if (
          ((null == (el = eA.productFeatures)
            ? void 0
            : el[ey.ProductFeature.DisableTerminalVariable]) &&
            eA.variables &&
            (eA.variables = eA.variables.filter(
              (eA: any) => "terminal" !== eA.type,
            )),
          (null == (ec = eA.productFeatures)
            ? void 0
            : ec[ey.ProductFeature.DisableMultimodalGeneration]) && eA.agents)
        ) {
          let el: any = `

<capability_constraints>
IMPORTANT: 当前产品不支持视频生成、3D 模型生成、图片视频特效等多模态内容生成能力。当用户请求生成视频、3D 模型、动画或类似多媒体内容时，请直接告知用户该功能暂不可用，不要尝试搜索或调用任何相关 skill / tool（包括但不限于 ToolSearch、Skill、workbuddy_search_marketplace_skill 等去查找视频/3D 相关能力）。
IMPORTANT: This product does not support video generation, 3D model generation, or any multimodal/multimedia content generation. When the user requests such content, decline directly and do NOT attempt to search for or invoke any related skill or tool (including but not limited to ToolSearch / Skill / workbuddy_search_marketplace_skill).
</capability_constraints>`;
          eA.agents = eA.agents.map((eA: any) => {
            var ec: any, eu: any, ed: any;
            return !(null == (ec = eA.tags)
              ? void 0
              : ec.includes("default")) ||
              (null == (eu = eA.appendInstructions)
                ? void 0
                : eu.includes("<capability_constraints>"))
              ? eA
              : {
                  ...eA,
                  appendInstructions:
                    (null != (ed = eA.appendInstructions) ? ed : "") + el,
                };
          });
        }
        if (
          (null == (eu = eA.disabledBuiltinSkills) ? void 0 : eu.length) &&
          eA.skills
        ) {
          let el: any = new Set(eA.disabledBuiltinSkills);
          eA.skills = eA.skills.filter((eA: any) => {
            var ec: any;
            if ("bundled" !== eA.source) return !0;
            let eu: any = eA.baseDirectory
                .replace(/[\\/]+$/, "")
                .split(/[\\/]/),
              ed: any = null != (ec = eu[eu.length - 1]) ? ec : "";
            return !el.has(ed);
          });
        }
      }
    }
    eu = ProductManagerImpl;
    Object.defineProperty(ProductManagerImpl, "name", { value: "eu" });
    Object.assign(ProductManagerImpl, constants.PRODUCT_MANAGER_STATICS);
    return ProductManagerImpl;
  })();
  const paths = createMemoryRuleUtilities({
    getWorkDir: runtime.getWorkDir,
    getHomeDir: runtime.getHomeDir ?? runtime.getWorkDir,
    getUserHomeDir: runtime.getHomeDir ?? runtime.getWorkDir,
    fs: runtime.fs ?? fs,
    platform: runtime.platform ?? globalThis.process.platform,
  }).PathUtils;
  const providerClasses = (() => {
    const e9 = constants,
      tC = runtime.fs ?? fs,
      tu = {
        PathUtils: runtime.pathUtils ?? paths,
        ColorUtils: {
          generateColorFromName:
            runtime.generateColorFromName ?? generateSkillColor,
        },
      },
      tw = { CLI_AGENT_TAG: "cli", CUSTOM_AGENT_TAG: "custom" },
      tD = { MCP_PROMPT_COMMAND_TAG: "mcp-prompt" },
      em = constants,
      eg = constants,
      eh = { ...path, ...constants },
      ef = {
        stripBuiltinModelsIfDisabled: (value: any) => {
          if (
            !BooleanUtils.isTruthy(
              process.env.CODEBUDDY_DISABLE_BUILTIN_MODELS,
            ) ||
            !value.models
          )
            return value;
          const { models, ...rest } = value;
          return rest;
        },
      },
      __dirname = runtime.configBasePath ?? runtime.getWorkDir();
    function convertAgentDefinitionToProductAgent(
      eA: any,
      el: any,
      ec: any,
      eu: any,
    ): any {
      return el.description
        ? el.prompt
          ? {
              name: eA,
              description: el.description,
              instructions: el.prompt,
              tools: el.tools,
              disallowedTools: el.disallowedTools,
              models: el.model ? [el.model] : [],
              asTool: !0,
              color: tu.ColorUtils.generateColorFromName(eA),
              tags: [tw.CLI_AGENT_TAG, tw.CUSTOM_AGENT_TAG, ec],
            }
          : void eu.error(`Agent "${eA}" missing required field: prompt`)
        : void eu.error(`Agent "${eA}" missing required field: description`);
    }
    function buildSystemPromptAgentOverride(eA: any, el: any, ec: any): any {
      if (el || ec)
        return {
          name: eA,
          ...(el ? { instructions: el } : {}),
          ...(ec ? { appendInstructions: ec } : {}),
        };
    }
    const envPriority = constants.ProductProviderPriority.ENV,
      envDefaults = [
        "ACC_PRODUCT_CONFIG_V3",
        "ACC_PRODUCT_CONFIG_V2",
        "ACC_PRODUCT_CONFIG",
      ];
    // UTF-16 9877981..9880084
    class CliOptionsProductProvider {
      [key: string]: any;
      constructor() {
        ((this.priority = e9.ProductProviderPriority.OPTIONS),
          (this.volatile = !0));
      }
      async provide(eA: any): Promise<any> {
        let el: any = this.cliProvider.parseOpts().opts,
          ec: any = {};
        el.verbose &&
          (this.logger.info(
            "--verbose option detected, setting log level to debug",
          ),
          (ec.log = { output: ["console", "file"], level: "Verbose" }));
        let eu: any = await this.collectSystemPromptOptions(el);
        if (eu) {
          let el: any = eA.current.agents?.find((eA: any) =>
            eA.tags?.includes("default"),
          );
          if (el) {
            let eA: any = buildSystemPromptAgentOverride(
              el.name,
              eu.systemPrompt,
              eu.appendSystemPrompt,
            );
            eA && (ec.agents || (ec.agents = []), ec.agents.push(eA));
          }
        }
        let ed: any = this.parseAgentsOption(el);
        return (
          ed &&
            ed.length > 0 &&
            (ec.agents || (ec.agents = []), ec.agents.push(...ed)),
          { ...ec, mergeStrategy: e9.MergeStrategy.SmartMerge }
        );
      }
      async collectSystemPromptOptions(eA: any): Promise<any> {
        let el: any = {},
          ec: any = !1;
        if (eA.systemPrompt) ((el.systemPrompt = eA.systemPrompt), (ec = !0));
        else if (eA.systemPromptFile) {
          let eu: any = await this.readSystemPromptFile(eA.systemPromptFile);
          eu && ((el.systemPrompt = eu), (ec = !0));
        }
        return (
          eA.appendSystemPrompt &&
            ((el.appendSystemPrompt = eA.appendSystemPrompt), (ec = !0)),
          ec ? el : void 0
        );
      }
      parseAgentsOption(eA: any): any {
        if (eA.agents)
          try {
            let el: any = JSON.parse(eA.agents);
            if ("object" != typeof el || null === el || Array.isArray(el))
              return void this.logger.error(
                "--agents must be a JSON object with agent names as keys",
              );
            let ec: any = [];
            for (let [eA, eu] of Object.entries(el)) {
              let el: any = convertAgentDefinitionToProductAgent(
                eA,
                eu,
                "cli-option",
                this.logger,
              );
              el && ec.push(el);
            }
            return (
              this.logger.info(
                `Loaded ${ec.length} custom agent(s) from --agents option`,
              ),
              ec.length > 0 ? ec : void 0
            );
          } catch (eA: any) {
            this.logger.error(
              `Failed to parse --agents JSON: ${eA instanceof Error ? eA.message : eA}`,
            );
            return;
          }
      }
      async readSystemPromptFile(eA: any): Promise<any> {
        try {
          let el: any = tu.PathUtils.resolveFilePathToWorkDir(eA);
          await tC.promises.access(el, tC.constants.R_OK);
          let ec: any = await tC.promises.readFile(el, "utf-8");
          return (
            this.logger.info(`Successfully read system prompt file: ${el}`),
            ec
          );
        } catch (el: any) {
          "ENOENT" === el.code
            ? this.logger.error(`System prompt file not found: ${eA}`)
            : "EACCES" === el.code
              ? this.logger.error(
                  `Permission denied reading system prompt file: ${eA}`,
                )
              : this.logger.error(
                  `Failed to read system prompt file: ${eA}`,
                  el,
                );
          return;
        }
      }
    }
    Object.defineProperty(CliOptionsProductProvider, "name", { value: "tB" });
    // UTF-16 9881205..9881847
    class SdkInitializeProductProvider {
      [key: string]: any;
      constructor() {
        ((this.priority = e9.ProductProviderPriority.OPTIONS),
          (this.volatile = !0));
      }
      async provide(eA: any): Promise<any> {
        let el: any = this.sdkInitializeState.get(),
          ec: any = [],
          eu: any = eA.current.agents?.find((eA: any) =>
            eA.tags?.includes("default"),
          );
        if (eu) {
          let eA: any = buildSystemPromptAgentOverride(
            eu.name,
            el.systemPrompt,
            el.appendSystemPrompt,
          );
          eA && ec.push(eA);
        }
        if (el.agents) {
          for (let [eA, eu] of Object.entries(el.agents)) {
            let el: any = convertAgentDefinitionToProductAgent(
              eA,
              eu,
              "sdk-initialize",
              this.logger,
            );
            el && ec.push(el);
          }
          ec.length > 0 &&
            this.logger.info(
              `Loaded ${ec.length} agent override(s) from SDK initialize`,
            );
        }
        return {
          ...(ec.length > 0 ? { agents: ec } : {}),
          mergeStrategy: e9.MergeStrategy.SmartMerge,
        };
      }
    }
    Object.defineProperty(SdkInitializeProductProvider, "name", {
      value: "tI",
    });
    // UTF-16 9912987..9913726
    class PluginsProductProvider {
      [key: string]: any;
      constructor() {
        ((this.priority = e9.ProductProviderPriority.WORKSPACE),
          (this.volatile = !0));
      }
      async provide(): Promise<any> {
        try {
          let eA: any = await this.pluginManager.getActivePlugins(),
            el: any = eA.map(
              ({ plugin: eA }: any) => `${eA.name}@${eA.marketplaceName}`,
            ),
            ec: any =
              el.length > 50
                ? `${el.slice(0, 50).join(",")}...(+${el.length - 50})`
                : el.join(",");
          if (
            (this.logger.info(
              `[PluginsProductProvider.provide] active=${eA.length}, ids=[${ec}]`,
            ),
            0 === eA.length)
          )
            return { mergeStrategy: e9.MergeStrategy.SmartMerge };
          let eu: any = {};
          for (let { components: el } of eA) {
            let { settings: eA, ...ec } = el;
            eu = await this.productMerger.merge(eu, {
              ...ec,
              mergeStrategy: e9.MergeStrategy.SmartMerge,
            });
          }
          return { ...eu, mergeStrategy: e9.MergeStrategy.SmartMerge };
        } catch (eA: any) {
          return (this.logger.debug("Failed to load plugin products", eA), {});
        }
      }
    }
    Object.defineProperty(PluginsProductProvider, "name", { value: "tz" });
    // UTF-16 9915058..9916130
    class McpPromptProductProvider {
      [key: string]: any;
      constructor() {
        this.priority = e9.ProductProviderPriority.WORKSPACE;
      }
      async provide(): Promise<any> {
        try {
          let eA: any = await this.loadMcpPrompts();
          return { mergeStrategy: e9.MergeStrategy.SmartMerge, commands: eA };
        } catch (eA: any) {
          return (this.logger.debug("Failed to load MCP prompts", eA), {});
        }
      }
      async loadMcpPrompts(): Promise<any> {
        let eA: any = [];
        try {
          for (let el of await this.mcpManager.getConnectedServers({
            waitForSettle: !1,
          }))
            try {
              for (let ec of await el.listPrompts()) {
                let eu: any = this.convertPromptToCommand(el.name, ec);
                eu && eA.push(eu);
              }
            } catch (eA: any) {
              this.logger.debug(
                `Failed to get prompts from MCP server ${el.name}`,
                eA,
              );
            }
        } catch (eA: any) {
          this.logger.debug("Failed to get connected MCP servers", eA);
        }
        return eA;
      }
      convertPromptToCommand(eA: any, el: any): any {
        try {
          let ec: any = el.title || el.name,
            eu: any = `${eA}:${ec}`,
            ed: any = el.description || "",
            ep: any = "";
          return (
            el.arguments &&
              el.arguments.length > 0 &&
              (ep = el.arguments.map((eA: any) => eA.name).join(", ")),
            {
              name: eu,
              description: ed,
              tags: [tD.MCP_PROMPT_COMMAND_TAG],
              prompt: `mcp__${eA}__${el.name}`,
              argumentHint: ep,
              requiredVariables: [],
              scope: "mcp",
            }
          );
        } catch (eA: any) {
          this.logger.debug(
            `Failed to convert MCP prompt ${el.name} to command`,
            eA,
          );
          return;
        }
      }
    }
    Object.defineProperty(McpPromptProductProvider, "name", { value: "tV" });
    // UTF-16 15261645..15261742
    class DefaultProductProvider {
      [key: string]: any;
      constructor() {
        this.priority = eg.ProductProviderPriority.DEFAULT;
      }
      async provide(eA: any): Promise<any> {
        return {};
      }
    }
    Object.defineProperty(DefaultProductProvider, "name", { value: "eh" });
    // UTF-16 15628995..15629918
    class ClientProductProvider {
      [key: string]: any;
      constructor() {
        this.priority = em.ProductProviderPriority.CLIENT;
      }
      init(): any {
        this.logger.setContext("ClientProductProvider");
      }
      async provide(): Promise<any> {
        if (this.cachedProductConfiguration)
          return this.cachedProductConfiguration;
        if (!this.fs) return {};
        try {
          let eA: any = this.configBasePath || __dirname,
            el: any = (0, eh.join)(eA, "product.json");
          if (
            (this.fs.existsSync(el) ||
              (el = (0, eh.join)(eA, "..", "product.json")),
            this.fs.existsSync(el) ||
              (el = (0, eh.join)(eA, "..", "..", "product.json")),
            !this.fs.existsSync(el))
          )
            return (this.logger.debug("Failed to find product.json"), {});
          this.logger.info(`Reading product configuration from ${el}`);
          let ec: any = this.fs.readFileSync(el, { encoding: "utf-8" });
          return (
            (this.cachedProductConfiguration = (0,
            ef.stripBuiltinModelsIfDisabled)(JSON.parse(ec.toString()))),
            this.logger.info(
              "Product configuration loaded and cached successfully",
            ),
            this.cachedProductConfiguration
          );
        } catch (eA: any) {
          return (this.logger.warn("Failed to read product.json", eA), {});
        }
      }
    }
    Object.defineProperty(ClientProductProvider, "name", { value: "eE" });
    // UTF-16 7652318..7654310
    class McpPromptRendererImpl {
      [key: string]: any;
      async render(eA: any, el: any): Promise<any> {
        try {
          let { serverName: ec, promptName: eu } = this.parsePromptName(eA);
          if (!ec || !eu)
            return (
              this.logger.error(
                `Invalid MCP prompt command: ${eA.name}, prompt: ${eA.prompt}`,
              ),
              ""
            );
          let ed: any = this.parseArgumentNames(eA.argumentHint),
            { args: ep, remainingArgs: eg } = this.extractArguments(
              el,
              eA.name,
              ed,
            ),
            eh: any = await this.mcpManager.getPrompt(ec, eu, ep);
          if (!eh)
            return (
              this.logger.error(
                `Failed to get prompt ${eu} from MCP server ${ec}`,
              ),
              ""
            );
          let ef: any = this.convertPromptMessagesToText(eh);
          return (
            eg.length > 0 && (ef += "\n\n\nARGUMENTS: " + eg.join(" ")),
            ef
          );
        } catch (el: any) {
          return (
            this.logger.error(`Failed to render MCP prompt: ${eA.name}`, el),
            ""
          );
        }
      }
      parsePromptName(eA: any): any {
        if (!eA.prompt) return { serverName: "", promptName: "" };
        let el: any = eA.prompt.match(/^mcp__(.+?)__(.+)$/);
        return el
          ? { serverName: el[1], promptName: el[2] }
          : { serverName: "", promptName: "" };
      }
      parseArgumentNames(eA: any): any {
        return eA
          ? eA
              .split(",")
              .map((eA: any) => eA.trim())
              .filter((eA: any) => eA.length > 0)
          : [];
      }
      extractArguments(eA: any, el: any, ec: any): any {
        let eu: any;
        if (!eA || !el) return { args: {}, remainingArgs: [] };
        let ed: any = eA.trim();
        if ((ed.startsWith(el) && (ed = ed.substring(el.length).trim()), !ed))
          return { args: {}, remainingArgs: [] };
        let ep: any = [],
          eg: any = /"([^"]*)"|'([^']*)'|(\S+)/g;
        for (; null !== (eu = eg.exec(ed)); ) {
          let eA: any = eu[1] ?? eu[2] ?? eu[3];
          ep.push(eA);
        }
        let eh: any = {},
          ef: any = Math.min(ep.length, ec.length);
        for (let eA: any = 0; eA < ef; eA++) eh[ec[eA]] = ep[eA];
        return { args: eh, remainingArgs: ep.slice(ef) };
      }
      convertPromptMessagesToText(eA: any): any {
        if (!eA || 0 === eA.length) return "";
        let el: any = [];
        for (let ec of eA) {
          let eA: any = ec.role,
            eu: any = ec.content,
            ed: any = "user" !== eA ? `[${eA}] ` : "";
          if ("string" == typeof eu) el.push(`${ed}${eu}`);
          else if (eu && "object" == typeof eu && "type" in eu) {
            if ("text" === eu.type && "text" in eu) el.push(`${ed}${eu.text}`);
            else if ("image" === eu.type && "data" in eu)
              el.push(`${ed}[Image: ${eu.mimeType}]`);
            else if ("resource" === eu.type && "resource" in eu) {
              let eA: any = eu.resource;
              "text" in eA && eA.text
                ? el.push(`${ed}${eA.text}`)
                : "blob" in eA && eA.blob
                  ? el.push(`${ed}[Resource Blob: ${eA.mimeType || "unknown"}]`)
                  : eA.uri && el.push(`${ed}[Resource: ${eA.uri}]`);
            }
          }
        }
        return el.join("\n").trim();
      }
    }
    Object.defineProperty(McpPromptRendererImpl, "name", { value: "r5" });
    const EnvProductProvider = (() => {
      const eh = constants,
        ef = "ACC_PRODUCT_CONFIG_PATH",
        em = envDefaults; // UTF-16 15639250..15640120
      class EnvProductProvider {
        [key: string]: any;
        constructor() {
          this.priority = eh.ProductProviderPriority.ENV;
        }
        async provide(eA: any): Promise<any> {
          let el: any = eA.current,
            ec: any = {};
          try {
            let eA: any = process.env[el.productConfigPathEnv || ef];
            eA &&
              this.fs.existsSync(eA) &&
              (ec = await this.productMerger.merge(
                ec,
                JSON.parse(this.fs.readFileSync(eA, "utf-8").toString()),
              ));
          } catch (eA: any) {
            this.logger.info(
              `Failed to create configuration from env path: ${eA}`,
            );
          }
          try {
            let eA: any = this.getProductConfig(el.productConfigEnv || em);
            eA && (ec = await this.productMerger.merge(ec, JSON.parse(eA)));
          } catch (eA: any) {
            this.logger.info(`Failed to create configuration from env: ${eA}`);
          }
          return ec;
        }
        getProductConfig(eA: any): any {
          if (eA) {
            if ("string" == typeof eA) return process.env[eA];
            for (let el of eA) {
              let eA: any = process.env[el];
              if (eA) {
                let ec: any = JSON.parse(eA);
                return (
                  "ACC_PRODUCT_CONFIG" === el && delete ec.authentication,
                  ("ACC_PRODUCT_CONFIG" === el ||
                    "ACC_PRODUCT_CONFIG_V2" === el) &&
                    delete ec.models,
                  JSON.stringify(ec)
                );
              }
            }
          }
        }
      }
      Object.defineProperty(EnvProductProvider, "name", { value: "eE" });
      return EnvProductProvider;
    })();
    return {
      CliOptionsProductProvider,
      SdkInitializeProductProvider,
      PluginsProductProvider,
      McpPromptProductProvider,
      DefaultProductProvider,
      ClientProductProvider,
      EnvProductProvider,
      McpPromptRendererImpl,
      convertAgentDefinitionToProductAgent,
      buildSystemPromptAgentOverride,
    };
  })();
  // UTF-16 15669496..15669815
  const ed = { Emitter: runtime.Emitter ?? NativeEmitter };
  class MemoryLocalStorage {
    [key: string]: any;
    constructor() {
      ((this.storage = new Map()),
        (this.emitter = new ed.Emitter()),
        (this.changeEvent = this.emitter.event));
    }
    async set(eA: any, el: any): Promise<any> {
      (this.storage.set(eA, el), this.emitter.fire({ domain: eA }));
    }
    async get(eA: any, el?: any): Promise<any> {
      return this.storage.has(eA) ? this.storage.get(eA) : el;
    }
    async remove(eA: any): Promise<any> {
      (this.storage.delete(eA), this.emitter.fire({ domain: eA }));
    }
  }
  return {
    ...mergerClasses,
    ...providerClasses,
    ProductManagerImpl,
    GzipUtils,
    MemoryLocalStorage,
  };
}
