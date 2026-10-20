// Complete original Cloud product services; explicit DI and lifecycle seam only.
import * as constants from "./native-product-constants.js";
export const CLOUD_PRODUCT_CLASSES = [
  ["UserinfoProviderImpl", 7241866, 7242195, "e0"],
  ["CloudPreProductProvider", 9907133, 9907405, "tG"],
  ["CloudProductManagerImpl", 15252547, 15256941, "e_"],
  ["CloudProductProvider", 15258449, 15260416, "eE"],
] as const;
export function createNativeCloudProduct(runtime: any) {
  const Object: any = globalThis.Object,
    Promise: any = globalThis.Promise,
    process: any = { env: runtime.env ?? {} },
    Date: any = { now: runtime.now ?? globalThis.Date.now },
    setTimeout = runtime.setTimeout ?? globalThis.setTimeout;
  const types: any = {
    ...constants,
    ProductManager: "productManager",
    ProductFeature: {
      ...constants.ProductFeature,
      CloudAgentsSmartMerge: "CloudAgentsSmartMerge",
    },
  };
  const container = {
    get: (key: any) => {
      if (!(key in runtime.dependencies))
        throw Error("Cloud product dependency not configured: " + key);
      return runtime.dependencies[key];
    },
  };
  const e9 = types;
  // UTF-16 7241866..7242195
  class UserinfoProviderImpl {
    [key: string]: any;
    async provide(): Promise<any> {
      let eA: any = this.authenticationManager.currentSessionSubject.getValue();
      if (eA?.account?.uid)
        return {
          userId: eA?.account.uid ?? "",
          userName: eA?.account.nickname ?? "",
          userNickname: eA?.account.nickname ?? "",
          enterpriseId: eA?.account.enterpriseId,
          token: eA?.auth.accessToken ?? "",
          enterprise: eA?.account?.departmentFullName,
        };
    }
  }
  Object.defineProperty(UserinfoProviderImpl, "name", { value: "e0" });
  // UTF-16 9907133..9907405
  class CloudPreProductProvider {
    [key: string]: any;
    constructor() {
      this.priority = e9.ProductProviderPriority.CLOUD_PRE;
    }
    async provide(): Promise<any> {
      let eA: any =
        this.authenticationManager.currentSessionSubject.getValue()?.auth;
      return eA?.accessToken && "ApiKey" !== eA.tokenType
        ? {}
        : { mergeStrategy: e9.MergeStrategy.Merge, config: { disabled: !0 } };
    }
  }
  Object.defineProperty(CloudPreProductProvider, "name", { value: "tG" });
  const managerClasses = (() => {
    const ep = { ContainerUtil: container },
      em = types,
      eh = { REQUEST_ID_HEADER: "X-Request-ID" },
      eC = 20,
      ey = "cloud_product_config_cache",
      ew = 480000,
      eB = 60000;
    // UTF-16 15252547..15256941
    class CloudProductManagerImpl {
      [key: string]: any;
      constructor() {
        ((this.memCache = new Map()),
          (this.retrying = !1),
          (this.lastErrorLoggedAt = 0));
      }
      init(): any {
        this.logger.setContext("CloudProductManager");
      }
      async fetch(eA: any): Promise<any> {
        let el: any = await this.userinfoProvider.provide(),
          ec: any = null == el ? void 0 : el.userId;
        if (ec) {
          let eA: any = this.memCache.get(ec);
          if (eA && Date.now() < eA.expireAt) return eA.data;
        }
        try {
          return await this.fetchFromRemote(eA, ec);
        } catch (el: any) {
          if (
            (this.logger.warn(
              `Fetch remote configuration failed: ${this.briefError(el)}`,
            ),
            ec && this.fetchWithRetry(eA, ec),
            ec)
          ) {
            let eA: any = this.memCache.get(ec);
            if (eA) return eA.data;
          }
          if (ec) {
            let eA: any = await this.readDiskCache(ec);
            if (eA)
              return (
                this.logger.info(
                  "[DiskCacheFallback] disk cache hit, returning cached configuration",
                ),
                eA
              );
            this.logger.info("[DiskCacheFallback] disk cache missed");
          }
          return (
            this.logger.error(
              "No cached configuration available, returning empty config",
            ),
            {}
          );
        }
      }
      async fetchWithRetry(eA: any, el: any): Promise<any> {
        var ec: any, eu: any;
        let ed: any;
        if (this.retrying) return;
        this.retrying = !0;
        let ep: any = [1e3, 2e3, 4e3, 8e3, 16e3];
        try {
          for (let ec: any = 0; ec < ep.length; ec++) {
            await this.sleep(ep[ec]);
            try {
              (await this.fetchFromRemote(eA, el),
                this.logger.info(
                  `Fetch remote configuration succeeded after ${ec + 1} attempt(s)`,
                  el,
                ),
                (ed = void 0));
              break;
            } catch (el: any) {
              ed = el;
              let eA: any = ep[ec + 1];
              this.logger.warn(
                `Fetch remote configuration failed (attempt ${ec + 1})` +
                  (eA
                    ? `, will retry after ${eA / 1e3}s`
                    : ", no more retries"),
              );
            }
          }
          if (ed) {
            let eA: any =
                "isAxiosError" in ed && ed.isAxiosError
                  ? null ==
                    (eu =
                      null == (ec = ed.response) ? void 0 : ec.config.headers)
                    ? void 0
                    : eu[eh.REQUEST_ID_HEADER]
                  : "",
              el: any = Date.now();
            el - this.lastErrorLoggedAt > eB &&
              ((this.lastErrorLoggedAt = el),
              this.logger.error(
                `Fetch remote configuration failed after all retries: ${this.briefError(ed)}`,
                `${eA}`,
              ));
          }
        } finally {
          this.retrying = !1;
        }
      }
      async readDiskCache(eA: any): Promise<any> {
        var el: any;
        let ec: any =
            null != (el = await this.localStorage.get(ey, [])) ? el : [],
          eu: any = ec.findIndex((el: any) => el.userId === eA);
        if (-1 === eu) return;
        let ed: any = ec[eu];
        return (
          ec.splice(eu, 1),
          ec.push(ed),
          await this.localStorage.set(ey, ec),
          (this.configuration = ed.data),
          ed.data
        );
      }
      async fetchFromRemote(eA: any, el: any): Promise<any> {
        var ec: any,
          eu: any,
          ed: any,
          eg: any,
          eh: any,
          ef: any,
          eE: any,
          eC: any,
          ey: any,
          ew: any;
        this.logger.time("Fetched configuration from remote");
        let eB: any = [];
        if (this.gitInfoCollector) {
          let eA: any = await this.gitInfoCollector.collect();
          eB = null != (ec = null == eA ? void 0 : eA.repositories) ? ec : [];
        }
        let e_: any = await this.restOperations.get(eA, {
          timeout: 5e3,
          baseURL: ep.ContainerUtil.get(em.ProductManager).getEndpoint(),
          headers: { Connection: "close" },
          params: { repos: eB.map((eA: any) => eA.url) },
        });
        return (
          (this.configuration =
            null !=
            (ed =
              null == (eu = null == e_ ? void 0 : e_.data) ? void 0 : eu.data)
              ? ed
              : {}),
          this.logger.info(
            `fetch cloud product ${(null == (eg = null == e_ ? void 0 : e_.data) ? void 0 : eg.data) ? "success" : "empty"}, agents(${null != (ef = null == (eh = this.configuration.agents) ? void 0 : eh.length) ? ef : 0}): ${null == (eE = this.configuration.agents) ? void 0 : eE.map((eA: any) => eA.name)}, models(${null != (ey = null == (eC = this.configuration.models) ? void 0 : eC.length) ? ey : 0}): ${null == (ew = this.configuration.models) ? void 0 : ew.map((eA: any) => eA.id)}`,
          ),
          el &&
            (this.updateMemCache(el, this.configuration),
            this.updateDiskCache(el, this.configuration).catch((eA: any) =>
              this.logger.warn(
                `updateDiskCache failed: ${this.safeStringify(eA)}`,
              ),
            )),
          this.logger.timeEnd("Fetched configuration from remote"),
          this.configuration
        );
      }
      updateMemCache(eA: any, el: any): any {
        this.memCache.set(eA, { data: el, expireAt: Date.now() + ew });
      }
      async updateDiskCache(eA: any, el: any): Promise<any> {
        var ec: any;
        let eu: any =
            null != (ec = await this.localStorage.get(ey, [])) ? ec : [],
          ed: any = eu.findIndex((el: any) => el.userId === eA);
        for (
          -1 !== ed && eu.splice(ed, 1),
            eu.push({ userId: eA, data: el, ts: Date.now() });
          eu.length > eC;

        )
          eu.shift();
        await this.localStorage.set(ey, eu);
      }
      reset(eA: any): any {
        let el: any = Array.from(this.memCache.keys()),
          ec: any = this.memCache.size;
        (eA ? this.memCache.delete(eA) : this.memCache.clear(),
          this.logger.info(
            `[RESET] memory cache cleared: scope=${eA ? `user:${eA}` : "all"}, beforeSize=${ec}, beforeKeys=[${el.join(",")}], afterSize=${this.memCache.size}, hadConfiguration=${!!this.configuration}, retrying=${this.retrying}`,
          ),
          (this.configuration = void 0),
          (this.retrying = !1));
      }
      sleep(eA: any): any {
        return new Promise((el: any) => setTimeout(el, eA));
      }
      briefError(eA: any): any {
        var el: any, ec: any, eu: any, ed: any, ep: any, eg: any, eh: any;
        if (!eA || "object" != typeof eA) return String(eA);
        let ef: any = eA,
          em: any = null != (el = ef.message) ? el : String(eA),
          eE: any =
            null !=
            (ed =
              null != (eu = null == (ec = ef.response) ? void 0 : ec.status)
                ? eu
                : ef.status)
              ? ed
              : "",
          eC: any =
            null != (eg = null == (ep = ef.config) ? void 0 : ep.url) ? eg : "",
          ey: any = null != (eh = ef.code) ? eh : "",
          ew: any = [
            em,
            eE && `status=${eE}`,
            eC && `url=${eC}`,
            ey && `code=${ey}`,
          ]
            .filter(Boolean)
            .join(", ");
        return ew.length > 500 ? ew.slice(0, 500) + "..." : ew;
      }
      safeStringify(eA: any): any {
        try {
          return JSON.stringify(eA);
        } catch (el: any) {
          return `${eA}`;
        }
      }
    }
    Object.defineProperty(CloudProductManagerImpl, "name", { value: "e_" });
    return { CloudProductManagerImpl };
  })();
  const providerClasses = (() => {
    const ep = { ContainerUtil: container },
      eh = types,
      ef = "/v3/config",
      em = ["deploymentType"];
    // UTF-16 15258449..15260416
    class CloudProductProvider {
      [key: string]: any;
      constructor() {
        ((this.priority = eh.ProductProviderPriority.CLOUD),
          (this.cachedMergeStrategy = eh.MergeStrategy.Merge));
      }
      getCachedMergeStrategy(): any {
        return this.cachedMergeStrategy;
      }
      init(): any {
        this.logger.setContext("CloudProductProvider");
      }
      async provide(eA: any): Promise<any> {
        var el: any,
          ec: any,
          eu: any,
          ed: any,
          eg: any,
          em: any,
          eE: any,
          eC: any;
        if (
          (null == (el = eA.current.config) ? void 0 : el.disabled) ||
          "1" === process.env.CODEBUDDY_REMOTE_CONFIG_DISABLED ||
          "true" === process.env.CODEBUDDY_REMOTE_CONFIG_DISABLED
        )
          return {};
        let ey: any =
            (null == (ec = eA.current.config) ? void 0 : ec.url) || ef,
          ew: any =
            null == (eu = ep.ContainerUtil.get(eh.ProductManager))
              ? void 0
              : eu.getEndpoint();
        if ((null == (ed = eA.current.config) ? void 0 : ed.url) || ew)
          try {
            let el: any = await this.cloudProductManager.fetch(ey);
            (delete el.endpoint, delete el.stagingEndpoint);
            let ec: any =
                null == (eg = el.productFeatures)
                  ? void 0
                  : eg.CommandsSmartMerge,
              eu: any =
                null == (em = eA.current.productFeatures)
                  ? void 0
                  : em.CommandsSmartMerge,
              ed: any =
                null != (eE = null != ec ? ec : eu) && eE
                  ? eh.MergeStrategy.CommandsSmartMerge
                  : eh.MergeStrategy.Merge;
            this.cachedMergeStrategy = ed;
            let ep: any = this.omitExcludedFields(el);
            return (
              (null == (eC = eA.current.productFeatures)
                ? void 0
                : eC[eh.ProductFeature.CloudAgentsSmartMerge]) &&
                ep.agents &&
                eA.current.agents &&
                (ep.agents = this.smartMergeAgents(
                  eA.current.agents,
                  ep.agents,
                )),
              ep.models &&
                eA.current.models &&
                (ep.models = this.mergeModelsById(
                  eA.current.models,
                  ep.models,
                )),
              { ...ep, mergeStrategy: ed }
            );
          } catch (eA: any) {
            this.logger.warn(
              `Failed to get product configuration from ${ey} error: ${eA}`,
            );
          }
        return {};
      }
      omitExcludedFields(eA: any): any {
        if (!eA) return eA;
        let el: any = { ...eA };
        for (let eA of em) Reflect.deleteProperty(el, eA);
        return el;
      }
      smartMergeAgents(eA: any, el: any): any {
        let ec: any = eA.map((eA: any) => ({ ...eA }));
        for (let eA of el) {
          let el: any = ec.findIndex((el: any) => el.name === eA.name);
          if (el >= 0) {
            let eu: any = { ...eA, ...ec[el] };
            (void 0 !== eA.models && (eu.models = eA.models), (ec[el] = eu));
          } else ec.push(eA);
        }
        return ec;
      }
      mergeModelsById(eA: any, el: any): any {
        let ec: any = new Map();
        for (let el of eA) (null == el ? void 0 : el.id) && ec.set(el.id, el);
        return el.map((eA: any) => {
          if (!(null == eA ? void 0 : eA.id)) return eA;
          let el: any = ec.get(eA.id);
          return el ? { ...el, ...eA } : eA;
        });
      }
    }
    Object.defineProperty(CloudProductProvider, "name", { value: "eE" });
    return { CloudProductProvider };
  })();
  return {
    UserinfoProviderImpl,
    CloudPreProductProvider,
    ...managerClasses,
    ...providerClasses,
  };
}
