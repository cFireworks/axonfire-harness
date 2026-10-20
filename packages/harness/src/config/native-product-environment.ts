// Complete fixed-sample environment classes and functions; only outer DI and TypeScript annotations.
import * as path from "node:path";
import * as constants from "./native-product-constants.js";
import { createCapturedSettingsConstants } from "../vendor/captured-settings-constants.js";
export const PRODUCT_ENVIRONMENT_CLASSES = [
  ["ProductEnvServiceImpl", 9860010, 9862805, "tl"],
  ["ClientInternetEnviromentProductProvider", 9865679, 9868185, "td"],
  ["SettingsEndpointProductProvider", 9890783, 9892221, "eM"],
  ["BooleanUtils", 15165544, 15165887, "BooleanUtils"],
] as const;
export const PRODUCT_ENVIRONMENT_FUNCTIONS = [
  ["findProductJson", 9862806, 9862889],
  ["resolveEnvFromSessionFileSync", 9862889, 9864084],
  ["matchDomainList", 9864084, 9864267],
  ["isBuiltinModelsDisabled", 15245802, 15245976],
  ["stripBuiltinModelsIfDisabled", 15246138, 15246237],
  ["isChanged", 15169398, 15169461],
] as const;
export const ProductEnviroment = {
  External: "external",
  Internal: "internal",
  IOA: "iOA",
  Selfhosted: "selfhosted",
  Cloudhosted: "cloudhosted",
} as const;
export function createNativeProductEnvironment(runtime: any) {
  const Object: any = globalThis.Object,
    process: any = {
      env: runtime.env ?? {},
      platform: runtime.platform ?? globalThis.process.platform,
    },
    Date = { now: runtime.now ?? globalThis.Date.now };
  const e7: any = createCapturedSettingsConstants(runtime.platform),
    e0 = { ProductEnviroment },
    e1 = runtime.fs,
    e3 = () => ({ homedir: runtime.getPlatformHomeDir }),
    e8 = () => path,
    tn = { PathUtils: runtime.pathUtils },
    tu = tn;
  const e5 = {
      ContainerUtil: {
        get: (key: any) => {
          if (!(key in runtime.dependencies))
            throw Error(
              "Product environment dependency not configured: " + key,
            );
          return runtime.dependencies[key];
        },
      },
    },
    e6 = { AuthenticationManager: "authenticationManager" };
  // UTF-16 15165544..15165887
  class BooleanUtils {
    [key: string]: any;
    static isTruthy(eA: any): any {
      return (
        !!eA &&
        ("boolean" == typeof eA
          ? eA
          : ["1", "true", "yes", "on"].includes(eA.toLowerCase().trim()))
      );
    }
    static isFalsy(eA: any): any {
      return (
        void 0 !== eA &&
        ("boolean" == typeof eA
          ? !eA
          : !!eA &&
            ["0", "false", "no", "off"].includes(eA.toLowerCase().trim()))
      );
    }
    static toBoolean(eA: any, el: any = !1): any {
      return !!this.isTruthy(eA) || (!this.isFalsy(eA) && el);
    }
  }
  Object.defineProperty(BooleanUtils, "name", { value: "BooleanUtils" });
  const eu = { BooleanUtils },
    el = {
      ENV_KEY_CODEBUDDY_DISABLE_BUILTIN_MODELS:
        "CODEBUDDY_DISABLE_BUILTIN_MODELS",
    };
  // UTF-16 9862806..9862889
  function findProductJson(): any {
    return tn.PathUtils.resolveRootPathSync("product.json");
  }
  // UTF-16 9862889..9864084
  function resolveEnvFromSessionFileSync(): any {
    let eA: any,
      el: any = findProductJson(),
      ec: any = JSON.parse((0, e1.readFileSync)(el, { encoding: "utf-8" })),
      eu: any = ec.authentication?.id;
    if (!eu) return;
    let ed: any = e3().homedir();
    switch (process.platform) {
      case "darwin":
        eA = e8().join(ed, "Library/Application Support/CodeBuddyExtension");
        break;
      case "win32":
        eA = e8().join(ed, "AppData", "Local", "CodeBuddyExtension");
        break;
      default:
        eA = e8().join(ed, ".local", "share", "CodeBuddyExtension");
    }
    let ep: any = e8().join(eA, "Data", "Public", "auth"),
      eg: any = e8().join(ep, `${eu}.info`);
    try {
      let eA: any = e8().join(tn.PathUtils.getHomeDir(), e7.SETTINGS_FILENAME);
      if (
        (0, e1.existsSync)(eA) &&
        JSON.parse((0, e1.readFileSync)(eA, { encoding: "utf-8" }))[
          e7.CONFIGURATION_ENTERPRISE_ENDPOINT
        ]
      )
        return e0.ProductEnviroment.Selfhosted;
    } catch {}
    if (!(0, e1.existsSync)(eg)) return;
    let eh: any = JSON.parse((0, e1.readFileSync)(eg, { encoding: "utf-8" })),
      ef: any = eh?.auth?.domain;
    if (!ef) return;
    let em: any = ec.authentication?.attributes;
    return matchDomainList(em?.internalDomain, ef)
      ? e0.ProductEnviroment.Internal
      : matchDomainList(em?.iOADomain, ef)
        ? e0.ProductEnviroment.IOA
        : matchDomainList(em?.cloudHostedDomain, ef)
          ? e0.ProductEnviroment.Cloudhosted
          : matchDomainList(em?.externalDomain, ef)
            ? e0.ProductEnviroment.External
            : void 0;
  }
  // UTF-16 9864084..9864267
  function matchDomainList(eA: any, el: any): any {
    return (
      !!eA &&
      (Array.isArray(eA) ? eA : [eA]).some(
        (eA: any) =>
          eA === el ||
          (!!eA.includes("*") &&
            RegExp(
              "^" + eA.replace(/\./g, "\\.").replace(/\*/g, "[^.]*") + "$",
            ).test(el)),
      )
    );
  }
  // UTF-16 15245802..15245976
  function isBuiltinModelsDisabled(): any {
    var eA: any;
    return eu.BooleanUtils.isTruthy(
      null == (eA = null == process ? void 0 : process.env)
        ? void 0
        : eA[el.ENV_KEY_CODEBUDDY_DISABLE_BUILTIN_MODELS],
    );
  }
  // UTF-16 15246138..15246237
  function stripBuiltinModelsIfDisabled(eA: any): any {
    if (!isBuiltinModelsDisabled() || !eA.models) return eA;
    let { models: el, ...ec } = eA;
    return ec;
  }
  // UTF-16 15169398..15169461
  function isChanged(eA: any, el: any): any {
    return JSON.stringify(eA) !== JSON.stringify(el);
  }
  const tx = { ObjectUtils: { isChanged } },
    e9 = {
      ...constants,
      ProductManager: "productManager",
      stripBuiltinModelsIfDisabled,
    };
  // UTF-16 9860010..9862805
  class ProductEnvServiceImpl {
    [key: string]: any;
    earlyEnvInit(): any {
      if (!process.env[e7.ENV_KEY_CODEBUDDY_INTERNET_ENVIRONMENT])
        try {
          let eA: any = resolveEnvFromSessionFileSync();
          eA &&
            ((process.env[e7.ENV_KEY_CODEBUDDY_INTERNET_ENVIRONMENT] = eA),
            (this.lastSwitchedEnv = eA));
        } catch {}
    }
    async switch(eA: any): Promise<any> {
      if (eA) {
        if (
          eA === this.lastSwitchedEnv ||
          process.env[e7.ENV_KEY_CODEBUDDY_INTERNET_ENVIRONMENT] === eA
        ) {
          this.lastSwitchedEnv = eA;
          return;
        }
        ((this.lastSwitchedEnv = eA),
          (process.env[e7.ENV_KEY_CODEBUDDY_INTERNET_ENVIRONMENT] = eA),
          this.logger.info(
            `[ProductEnvService] Environment switched to: ${eA}`,
          ));
        try {
          await this.productManager.sync();
        } catch {}
      }
    }
    async switchBySession(eA: any): Promise<any> {
      if (!eA) return;
      let el: any =
        process.env[e7.ENV_KEY_CODEBUDDY_INTERNET_ENVIRONMENT] ||
        process.env[e7.ENV_KEY_CODEBUDDY_INTERNET_ENVIROMENT];
      if (el && el !== this.lastSwitchedEnv) return;
      let ec: any = await this.settingsManager.get("env");
      if (
        ec?.[e7.ENV_KEY_CODEBUDDY_INTERNET_ENVIRONMENT] ||
        ec?.[e7.ENV_KEY_CODEBUDDY_INTERNET_ENVIROMENT]
      )
        return;
      let eu: any = await this.resolveEnvBySession(eA);
      await this.switch(eu);
    }
    async getCurrent(): Promise<any> {
      let eA: any = await this.settingsManager.get("env");
      if (eA?.[e7.ENV_KEY_CODEBUDDY_INTERNET_ENVIRONMENT])
        return eA?.[e7.ENV_KEY_CODEBUDDY_INTERNET_ENVIRONMENT];
      if (eA?.[e7.ENV_KEY_CODEBUDDY_INTERNET_ENVIROMENT])
        return eA?.[e7.ENV_KEY_CODEBUDDY_INTERNET_ENVIROMENT];
      if (process.env[e7.ENV_KEY_CODEBUDDY_INTERNET_ENVIRONMENT])
        return process.env[e7.ENV_KEY_CODEBUDDY_INTERNET_ENVIRONMENT];
      if (process.env[e7.ENV_KEY_CODEBUDDY_INTERNET_ENVIROMENT])
        return process.env[e7.ENV_KEY_CODEBUDDY_INTERNET_ENVIROMENT];
      let el: any = await this.productManager.waitConfiguration();
      if (el.networkEnvironment) return el.networkEnvironment;
      let ec: any = e5.ContainerUtil.get(
        e6.AuthenticationManager,
      ).currentSessionSubject.getValue();
      return this.resolveEnvBySession(ec);
    }
    async resolveEnvBySession(eA: any): Promise<any> {
      if (!eA) return;
      let el: any = this.productManager.configuration.getValue();
      if (!el)
        try {
          let eA: any = findProductJson(),
            ec: any = (0, e1.readFileSync)(eA, { encoding: "utf-8" });
          el = JSON.parse(ec);
        } catch {
          return;
        }
      if (!el) return;
      let ec: any = await this.settingsManager.get(
        e7.CONFIGURATION_ENTERPRISE_ENDPOINT,
      );
      if (
        this.isDomain(
          el.authentication?.attributes?.internalDomain,
          eA.auth.domain,
        )
      )
        return e0.ProductEnviroment.Internal;
      if (
        this.isDomain(el.authentication?.attributes?.iOADomain, eA.auth.domain)
      )
        return e0.ProductEnviroment.IOA;
      if (
        this.isDomain(
          el.authentication?.attributes?.cloudHostedDomain,
          eA.auth.domain,
        )
      )
        return e0.ProductEnviroment.Cloudhosted;
      if (
        this.isDomain(
          el.authentication?.attributes?.externalDomain,
          eA.auth.domain,
        )
      )
        return e0.ProductEnviroment.External;
      if (ec) return e0.ProductEnviroment.Selfhosted;
    }
    isDomain(eA: any, el: any): any {
      return (
        !!eA &&
        !!el &&
        (Array.isArray(eA)
          ? eA.some((eA: any) => this.matchDomain(eA, el))
          : this.matchDomain(eA, el))
      );
    }
    matchDomain(eA: any, el: any): any {
      if (eA === el) return !0;
      if (!eA.includes("*")) return !1;
      let ec: any = eA.replace(/\./g, "\\.").replace(/\*/g, "[^.]*");
      return RegExp(`^${ec}$`).test(el);
    }
  }
  Object.defineProperty(ProductEnvServiceImpl, "name", { value: "tl" });
  // UTF-16 9865679..9868185
  class ClientInternetEnviromentProductProvider {
    [key: string]: any;
    constructor() {
      ((this.priority =
        e9.ProductProviderPriority.CLIENT_SETTINGS_ENDPOINT + 5),
        (this.cachedProductConfigurations = new Map()));
    }
    init(): any {
      this.logger.setContext("ClientInternetEnviromentProductProvider");
    }
    async provide(eA: any): Promise<any> {
      let el: any = await this.settingsManager.get("env"),
        ec: any =
          el?.[e7.ENV_KEY_CODEBUDDY_INTERNET_ENVIRONMENT] ||
          process.env[e7.ENV_KEY_CODEBUDDY_INTERNET_ENVIRONMENT] ||
          el?.[e7.ENV_KEY_CODEBUDDY_INTERNET_ENVIROMENT] ||
          process.env[e7.ENV_KEY_CODEBUDDY_INTERNET_ENVIROMENT] ||
          eA.current.networkEnvironment ||
          process.env[e7.ENV_PRODUCT_CLI_ACCOUNT_TYPE],
        eu: any = this.getNetworkEnviromentFromConfigEnv(
          eA.current.productConfigEnv,
        );
      if ((!ec && eu && (ec = eu), !ec)) return {};
      let ed: any = ec.toLowerCase();
      if (this.cachedProductConfigurations.has(ed))
        return this.cachedProductConfigurations.get(ed);
      let ep: any = await this.resolveDeploymentType(ec, eA.current);
      if (!this.fs) return ep ? { deploymentType: ep } : {};
      let eg: any = `product.${ed}.json`;
      try {
        let eA: any = tu.PathUtils.resolveRootPathSync(eg);
        this.logger.info(`Reading product configuration from ${eA}`);
        let el: any = this.fs.readFileSync(eA, { encoding: "utf-8" }),
          ec: any = (0, e9.stripBuiltinModelsIfDisabled)(
            JSON.parse(el.toString()),
          ),
          eu: any = ep ? { ...ec, deploymentType: ep } : ec;
        return (
          this.cachedProductConfigurations.set(ed, eu),
          this.logger.info(
            `Product configuration for environment '${ed}' loaded and cached successfully`,
          ),
          eu
        );
      } catch (eA: any) {
        return (
          this.logger.warn(
            `[ClientInternetEnviromentProductProvider] Failed to load product config for environment="${ed}" from "${eg}". The endpoint will fall back to the upstream provider's value (typically the default cloud endpoint), which can cause API requests to be routed to the wrong host (401 endpoint mismatch). Error: ${eA}`,
          ),
          ep ? { deploymentType: ep } : {}
        );
      }
    }
    async resolveDeploymentType(eA: any, el: any): Promise<any> {
      let ec: any = this.extractDomain(el.endpoint),
        eu: any = el.authentication?.attributes?.cloudHostedDomain;
      if (this.isDomain(eu, ec)) return "Cloud-Hosted";
      switch (eA.toLowerCase()) {
        case e0.ProductEnviroment.Cloudhosted:
          return "Cloud-Hosted";
        case e0.ProductEnviroment.Selfhosted:
          return "Self-Hosted";
      }
    }
    extractDomain(eA: any): any {
      if (eA)
        try {
          return new URL(eA).hostname;
        } catch {
          return;
        }
    }
    isDomain(eA: any, el: any): any {
      return (
        !!eA &&
        !!el &&
        (Array.isArray(eA) ? eA : [eA]).some(
          (eA: any) =>
            eA === el ||
            (!!eA.includes("*") &&
              RegExp(
                "^" + eA.replace(/\./g, "\\.").replace(/\*/g, "[^.]*") + "$",
              ).test(el)),
        )
      );
    }
    getNetworkEnviromentFromConfigEnv(eA: any): any {
      if (!eA) return;
      let el: any = "";
      for (let ec of ("string" == typeof eA && (el = process.env[eA]), eA)) {
        let eA: any = process.env[ec];
        if (eA) {
          el = eA;
          break;
        }
      }
      if (el)
        try {
          let eA: any = JSON.parse(el);
          if (eA.networkEnvironment) return eA.networkEnvironment;
        } catch (eA: any) {}
    }
  }
  Object.defineProperty(ClientInternetEnviromentProductProvider, "name", {
    value: "td",
  });
  // UTF-16 9890783..9892221
  class SettingsEndpointProductProvider {
    [key: string]: any;
    constructor() {
      ((this.priority = e9.ProductProviderPriority.CLIENT_SETTINGS_ENDPOINT),
        (this.cachedAt = 0));
    }
    init(): any {
      this.settingsManager.onDidChange(async () => {
        this.cachedConfig = void 0;
        let eA: any = await this.generateConfig();
        tx.ObjectUtils.isChanged(this.lastConfig, eA) &&
          (this.logger.info(
            "[ProductManager.sync] Triggered by settings endpoint configuration changes",
          ),
          e5.ContainerUtil.get(e9.ProductManager).sync());
      });
    }
    async provide(eA: any): Promise<any> {
      let el: any = process.env[e7.ENV_KEY_CODEBUDDY_INTERNET_ENVIRONMENT],
        ec: any = Date.now();
      if (
        this.cachedConfig &&
        ec - this.cachedAt < eM.CACHE_TTL_MS &&
        this.cachedEnv === el
      )
        return ((this.lastConfig = this.cachedConfig), this.cachedConfig);
      let eu: any = await this.generateConfig();
      return (
        (this.cachedConfig = eu),
        (this.cachedAt = ec),
        (this.cachedEnv = el),
        (this.lastConfig = eu),
        eu
      );
    }
    async generateConfig(): Promise<any> {
      let eA: any = e5.ContainerUtil.get(
          e9.ProductManager,
        ).getCurrentConfiguration(),
        el: any = {},
        ec: any = (
          await this.settingsManager.get(e7.CONFIGURATION_ENV_ROUTE_MODE)
        )?.trim(),
        eu: any = (
          await this.settingsManager.get(e7.CONFIGURATION_ENDPOINT)
        )?.trim(),
        ed: any = (
          await this.settingsManager.get(e7.CONFIGURATION_ENTERPRISE_ENDPOINT)
        )?.trim();
      return (
        (process.env[e7.ENV_KEY_CODEBUDDY_INTERNET_ENVIRONMENT] ===
          e0.ProductEnviroment.Selfhosted ||
          process.env[e7.ENV_KEY_CODEBUDDY_INTERNET_ENVIRONMENT] ===
            e0.ProductEnviroment.Cloudhosted) &&
        ed
          ? (el.endpoint = ed)
          : ec === e7.EnvRouteMode.Staging && eA?.stagingEndpoint
            ? ((el.endpoint = eA.stagingEndpoint),
              (el.stagingEndpoint = eA.stagingEndpoint))
            : eu && (el.endpoint = eu),
        el
      );
    }
  }
  Object.defineProperty(SettingsEndpointProductProvider, "name", {
    value: "eM",
  });
  const eM: any = SettingsEndpointProductProvider;
  eM.CACHE_TTL_MS = 1e4;
  return {
    ProductEnvServiceImpl,
    ClientInternetEnviromentProductProvider,
    SettingsEndpointProductProvider,
    BooleanUtils,
    findProductJson,
    resolveEnvFromSessionFileSync,
    matchDomainList,
    isBuiltinModelsDisabled,
    stripBuiltinModelsIfDisabled,
    isChanged,
  };
}
