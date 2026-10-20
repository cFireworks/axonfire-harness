// Complete fixed-sample local-marketplace classes. No original bootstrap is executed.
import * as path from "node:path";
import { SettingsScope } from "../permissions/native-permission-policy.js";
import { createCapturedPluginConstants } from "../vendor/captured-plugin-constants.js";
import { createNativePluginConcurrency } from "./native-plugin-concurrency.js";
export function createNativeMarketplace(runtime: any) {
  const Object: any = globalThis.Object,
    Promise: any = globalThis.Promise,
    t$: any = createCapturedPluginConstants(),
    tX = path,
    tZ = runtime.fsExtra,
    t5 = { PathUtils: { getHomePluginsDir: runtime.getHomePluginsDir } },
    t3 = createNativePluginConcurrency(runtime.env ?? {}),
    A_ = { SettingsScope },
    AS = { ProductManager: "productManager" },
    t0 = { ConsoleManager: "consoleManager" },
    t2 = { Logger: "logger" },
    process = runtime.process ?? globalThis.process,
    Date = runtime.Date ?? globalThis.Date,
    Math = runtime.Math ?? globalThis.Math,
    setTimeout = runtime.setTimeout ?? globalThis.setTimeout;
  const services = runtime.services ?? {},
    installers: any[] = runtime.installers ?? [];
  const tV = {
    ContainerUtil: {
      get: (key: any): any => {
        if (key === t1 || key === t4) return new key();
        if (key === t$.PluginErrorCollector) return services.errorCollector;
        if (key === "logger" || key === "consoleManager")
          return services.logger;
        if (key === "productManager") return services.productManager;
        return (
          runtime.resolve?.(key) ??
          (() => {
            throw Error(
              "Marketplace dependency not configured: " + String(key),
            );
          })()
        );
      },
      getAll: (key: any) =>
        key === t$.PluginInstaller
          ? installers
          : (runtime.resolveAll?.(key) ?? []),
    },
  };
  // UTF-16 9536013..9537667
  class BaseMarketplace {
    [key: string]: any;
    constructor() {
      ((this.name = ""),
        (this.storageName = ""),
        (this.type = t$.MarketplaceType.Directory),
        (this.source = {}),
        (this.installLocation = ""),
        (this.isBuiltIn = !1),
        (this.autoUpdate = !1));
    }
    init(eA: any): any {
      ((this.name = eA.name),
        (this.storageName = eA.storageName || eA.name),
        (this.type = eA.type || eA.source?.source),
        (this.source = eA.source),
        (this.installLocation = eA.installLocation),
        (this.description = eA.description),
        (this.lastUpdated = eA.lastUpdated),
        (this.isBuiltIn = eA.isBuiltIn || !1),
        (this.autoUpdate = eA.autoUpdate || !1));
    }
    async loadManifest(): Promise<any> {
      let eA: any = "";
      for (let el of t$.PLUGINS_METADATA_DIRS) {
        let ec: any = (0, tX.join)(
          this.installLocation,
          el,
          t$.MARKETPLACE_MANIFEST_FILE,
        );
        if (await (0, tZ.pathExists)(ec)) {
          eA = ec;
          break;
        }
      }
      eA &&
        ((this.manifest = await (0, tZ.readJSON)(eA)),
        this.manifest?.name && (this.name = this.manifest.name),
        this.manifest?.description &&
          (this.description = this.manifest.description));
    }
    async install(eA: any): Promise<any> {}
    async update(eA: any): Promise<any> {}
    async listPlugins(): Promise<any> {
      let eA: any = [],
        el: any = tV.ContainerUtil.get(t0.ConsoleManager);
      try {
        if (
          (await this.loadManifest(), !this.manifest || !this.manifest.plugins)
        )
          return eA;
        for (let ec of this.manifest.plugins)
          try {
            let el: any = {
              ...ec,
              name: ec.name,
              description: ec.description,
              version: ec.version,
              marketplaceName: this.name,
              source: ec.source,
            };
            eA.push(el);
          } catch (eA: any) {
            el.error(`Failed to read plugin ${ec.name}:`, eA);
          }
      } catch (eA: any) {
        el.error(`Failed to list plugins from marketplace ${this.name}:`, eA);
      }
      return eA;
    }
    async getPlugin(eA: any): Promise<any> {
      return (await this.listPlugins()).find((el: any) => el.name === eA);
    }
    toJSON(): any {
      return {
        name: this.name,
        storageName: this.storageName,
        type: this.type,
        source: this.source,
        installLocation: this.installLocation,
        description: this.description,
        lastUpdated: this.lastUpdated,
        isBuiltIn: this.isBuiltIn,
        autoUpdate: this.autoUpdate,
      };
    }
  }
  const t1 = BaseMarketplace;
  // UTF-16 9538211..9539998
  class DirectoryMarketplace extends t1 {
    [key: string]: any;
    clearPluginListCache(): any {
      ((this.pluginListCache = void 0), (this.pluginListLoading = void 0));
    }
    async install(eA: any): Promise<any> {
      (eA?.("Setting up local directory marketplace..."),
        (this.installLocation = this.source.path || ""),
        eA?.("Local directory marketplace ready"));
    }
    async listPlugins(): Promise<any> {
      if (this.pluginListCache) return this.clonePlugins(this.pluginListCache);
      if (this.pluginListLoading)
        return this.clonePlugins(await this.pluginListLoading);
      this.pluginListLoading = this.loadPluginList();
      try {
        return (
          (this.pluginListCache = await this.pluginListLoading),
          this.clonePlugins(this.pluginListCache)
        );
      } finally {
        this.pluginListLoading = void 0;
      }
    }
    async loadPluginList(): Promise<any> {
      try {
        if (
          (await this.loadManifest(), !this.manifest || !this.manifest.plugins)
        )
          return [];
        let eA: any = (0, t3.getPositiveIntegerEnv)(
            "CODEBUDDY_MARKETPLACE_PLUGIN_LOAD_CONCURRENCY",
            t3.DEFAULT_FS_CONCURRENCY,
          ),
          el: any = tV.ContainerUtil.getAll(t$.PluginInstaller);
        return await (0, t3.mapWithConcurrency)(
          this.manifest.plugins,
          eA,
          async (eA: any) => {
            try {
              let ec: any = "";
              for (let eu of el)
                if (eu.support(eA.source)) {
                  ec = (await eu.isInstalled(eA, this.installLocation)) || "";
                  break;
                }
              let eu: any = {
                ...eA,
                marketplaceName: this.name,
                installedPath: ec,
              };
              if (ec) {
                let el: any = await this.findPluginManifestPath(ec);
                if (el) {
                  let ed: any = await tZ.readJSON(el);
                  ed &&
                    Object.assign(eu, {
                      ...ed,
                      marketplaceName: this.name,
                      sourcePath: eA.source,
                      installedPath: ec,
                    });
                }
              }
              return eu;
            } catch (el: any) {
              return (
                tV.ContainerUtil.get(t2.Logger).error(
                  `Failed to read plugin ${eA.name}:`,
                  el,
                ),
                { ...eA, marketplaceName: this.name, installedPath: "" }
              );
            }
          },
        );
      } catch (eA: any) {
        return (
          tV.ContainerUtil.get(t2.Logger).error(
            `Failed to list plugins from marketplace ${this.name}:`,
            eA,
          ),
          []
        );
      }
    }
    async findPluginManifestPath(eA: any): Promise<any> {
      for (let el of t$.PLUGINS_METADATA_DIRS) {
        let ec: any = (0, tX.join)(eA, el, t$.PLUGIN_MANIFEST_FILE);
        if (await tZ.pathExists(ec)) return ec;
      }
    }
    clonePlugins(eA: any): any {
      return eA.map((eA: any) => ({ ...eA }));
    }
  }
  const t4 = DirectoryMarketplace,
    t9 = runtime.providers?.git ?? Symbol("GithubMarketplace"),
    t7 = runtime.providers?.http ?? Symbol("HttpMarketplace"),
    Ap = runtime.providers?.zip ?? Symbol("ZipMarketplace");
  // UTF-16 9555538..9556101
  class MarketplaceFactory {
    [key: string]: any;
    static createFromJSON(eA: any): any {
      let el: any,
        ec: any = eA.source?.source;
      switch (ec) {
        case t$.MarketplaceType.Directory:
          el = tV.ContainerUtil.get(t4);
          break;
        case t$.MarketplaceType.Github:
        case t$.MarketplaceType.Git:
          el = tV.ContainerUtil.get(t9);
          break;
        case t$.MarketplaceType.URL:
          el = tV.ContainerUtil.get(t7);
          break;
        case t$.MarketplaceType.Zip:
          el = tV.ContainerUtil.get(Ap);
          break;
        default:
          (tV.ContainerUtil.get(t2.Logger).warn(
            `Unknown marketplace source type: ${ec}, falling back to BaseMarketplace for '${eA.name}'`,
          ),
            (el = tV.ContainerUtil.get(t1)));
      }
      return (el.init(eA), el);
    }
  }
  const Ah = "marketplace-storage-",
    Af = 10,
    Am = 200,
    AE = 120000,
    AC = 5,
    Ay = 100,
    Aw = 1000;
  // UTF-16 9556732..9563889
  class MarketplaceStorage {
    [key: string]: any;
    constructor() {
      ((this.writeLock = Promise.resolve()),
        (this.configFilePath = (0, tX.join)(
          t5.PathUtils.getHomePluginsDir(),
          t$.MARKETPLACE_STORAGE_FILE_NAME,
        )));
    }
    init(): any {
      this.logger.setContext("MarketplaceStorage");
    }
    async withWriteLock(eA: any): Promise<any> {
      let el: any,
        ec: any = this.writeLock;
      this.writeLock = new Promise((eA: any) => {
        el = eA;
      });
      try {
        return (await ec.catch(() => void 0), await eA());
      } finally {
        el();
      }
    }
    async withFileLock(eA: any): Promise<any> {
      let el: any,
        ec: any = `${Ah}${this.sanitizeLockName(this.configFilePath)}`;
      try {
        el = await this.fileLockService.acquireFileLock(ec, {
          maxRetries: Af,
          retryDelay: Am,
          staleTimeout: AE,
        });
      } catch (eA: any) {
        this.logger.warn(
          `Failed to acquire cross-process file lock for marketplace storage, falling back to in-process lock only: ${eA instanceof Error ? eA.message : String(eA)}`,
        );
      }
      try {
        return await eA();
      } finally {
        el &&
          (await el().catch((eA: any) => {
            this.logger.warn(
              `Failed to release marketplace storage file lock: ${eA instanceof Error ? eA.message : String(eA)}`,
            );
          }));
      }
    }
    async withLocks(eA: any): Promise<any> {
      return this.withWriteLock(() => this.withFileLock(eA));
    }
    sanitizeLockName(eA: any): any {
      return eA.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-80);
    }
    async ensureConfigFileAsync(): Promise<any> {
      return (
        this.configFileInitPromise ||
          (this.configFileInitPromise = this.doEnsureConfigFile()),
        this.configFileInitPromise
      );
    }
    async doEnsureConfigFile(): Promise<any> {
      let eA: any = Date.now(),
        el: any = (0, tX.join)(this.configFilePath, ".."),
        ec: any = Date.now();
      await tZ.ensureDir(el);
      let eu: any = Date.now() - ec,
        ed: any = Date.now(),
        ep: any = await tZ.pathExists(this.configFilePath),
        eg: any = Date.now() - ed,
        eh: any = 0;
      if (!ep) {
        let eA: any = {},
          el: any = Date.now();
        (await this.atomicWriteJson(eA), (eh = Date.now() - el));
      }
      this.logger.info?.(
        `[MarketplaceStorage] doEnsureConfigFile ensureDir=${eu}ms pathExists=${eg}ms writeFile=${eh}ms total=${Date.now() - eA}ms dir=${el}`,
      );
    }
    async readAndRepair(): Promise<any> {
      let eA: any;
      try {
        eA = await tZ.readFile(this.configFilePath, "utf-8");
      } catch (eA: any) {
        if (eA?.code === "ENOENT") return {};
        throw eA;
      }
      try {
        let el: any = JSON.parse(eA);
        if (el && "object" == typeof el && !Array.isArray(el)) return el;
        throw Error("Marketplace config is not a JSON object");
      } catch (ec: any) {
        let eA: any = `${this.configFilePath}.broken-${Date.now()}`;
        try {
          await tZ.move(this.configFilePath, eA, { overwrite: !0 });
        } catch (el: any) {
          this.logger.warn(
            `Failed to back up corrupted marketplace config to ${eA}: ${el instanceof Error ? el.message : String(el)}`,
          );
        }
        let el: any = ec instanceof Error ? ec.message : String(ec);
        return (
          this.logger.error(
            `Marketplace config at ${this.configFilePath} is corrupted and has been backed up to ${eA}. Rebuilding with empty config. Details: ${el}`,
          ),
          this.errorCollector.addError({
            type: t$.PluginErrorType.MarketplaceConfigSaveFailed,
            operation: "repair",
            marketplaceName: "",
            message:
              "Marketplace configuration file was corrupted and has been reset",
            details: `Backed up to ${eA}. Parse error: ${el}`,
          }),
          {}
        );
      }
    }
    async hasRepairableLegacyMarketplaceCacheReferences(eA: any): Promise<any> {
      let el: any = new Set();
      for (let ec of Object.values(eA)) {
        let eA: any = this.getCanonicalMarketplaceLocation(ec?.installLocation),
          eu: any = this.getCanonicalMarketplaceLocation(ec?.source?.path);
        (eA && el.add(eA), eu && el.add(eu));
      }
      for (let eA of el) if (await this.isMarketplaceRoot(eA)) return !0;
      return !1;
    }
    getCanonicalMarketplaceLocation(eA: any): any {
      if ("string" != typeof eA || !eA) return;
      let el: any = t5.PathUtils.getHomePluginsDir(),
        ec: any = tX.resolve(el, t$.PLUGIN_CACHE_DIR),
        eu: any = tX.resolve(eA),
        ed: any = tX.relative(ec, eu);
      if (
        !(!ed || ed.startsWith("..") || tX.isAbsolute(ed)) &&
        1 === ed.split(tX.sep).length
      )
        return tX.join(el, t$.MARKETPLACES_DIR, ed);
    }
    async repairLegacyMarketplaceCacheReferences(eA: any): Promise<any> {
      let el: any = !1;
      for (let [ec, eu] of Object.entries(eA)) {
        if (!eu || "object" != typeof eu) continue;
        let eA: any = this.getCanonicalMarketplaceLocation(eu.installLocation);
        eA &&
          ((await this.isMarketplaceRoot(eA))
            ? ((eu.installLocation = eA), (el = !0))
            : this.logger.warn(
                `[MarketplaceStorage] Marketplace ${ec} still references legacy plugin cache ${eu.installLocation}; canonical source ${eA} is not available`,
              ));
        let ed: any = this.getCanonicalMarketplaceLocation(eu.source?.path);
        ed &&
          ((await this.isMarketplaceRoot(ed))
            ? ((eu.source = { ...eu.source, path: ed }), (el = !0))
            : this.logger.warn(
                `[MarketplaceStorage] Marketplace ${ec} source still references legacy plugin cache ${eu.source.path}; canonical source ${ed} is not available`,
              ));
      }
      return el;
    }
    async isMarketplaceRoot(eA: any): Promise<any> {
      for (let el of t$.PLUGINS_METADATA_DIRS)
        if (await tZ.pathExists(tX.join(eA, el, t$.MARKETPLACE_MANIFEST_FILE)))
          return !0;
      return !1;
    }
    async atomicWriteJson(eA: any): Promise<any> {
      let el: any = this.generateTempPath(),
        ec: any = JSON.stringify(eA, null, 2);
      try {
        (await this.writeTempFile(el, ec),
          await this.renameTempFile(el, this.configFilePath));
      } catch (eA: any) {
        throw (await this.removeTempFile(el), eA);
      }
    }
    generateTempPath(): any {
      return `${this.configFilePath}.tmp.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`;
    }
    async writeTempFile(eA: any, el: any): Promise<any> {
      await tZ.writeFile(eA, el, "utf-8");
    }
    async renameTempFile(eA: any, el: any): Promise<any> {
      let ec: any;
      for (let eu: any = 0; eu <= AC; eu++)
        try {
          await this.rawRename(eA, el);
          return;
        } catch (ed: any) {
          ec = ed;
          let eA: any = ed?.code;
          if (
            ("EBUSY" === eA || "EPERM" === eA || "EACCES" === eA) &&
            eu < AC
          ) {
            let ec: any = Math.min(Ay * 2 ** eu, Aw);
            (this.logger.warn(
              `[MarketplaceStorage] rename ${eA} on ${el}, retry ${eu + 1}/${AC} after ${ec}ms`,
            ),
              await new Promise((eA: any) => setTimeout(eA, ec)));
            continue;
          }
          break;
        }
      throw ec;
    }
    async rawRename(eA: any, el: any): Promise<any> {
      await tZ.rename(eA, el);
    }
    async removeTempFile(eA: any): Promise<any> {
      await tZ.remove(eA).catch(() => void 0);
    }
    async getMarketplaces(): Promise<any> {
      let eA: any = Date.now();
      try {
        let el: any = Date.now();
        await this.ensureConfigFileAsync();
        let ec: any = Date.now() - el,
          eu: any = Date.now(),
          ed: any = await this.readAndRepair(),
          ep: any = Date.now() - eu,
          eg: any = 0;
        if (await this.hasRepairableLegacyMarketplaceCacheReferences(ed)) {
          let eA: any = Date.now();
          (await this.withLocks(async () => {
            (await this.ensureConfigFileAsync(),
              (ed = await this.readAndRepair()),
              (await this.repairLegacyMarketplaceCacheReferences(ed)) &&
                (await this.atomicWriteJson(ed)));
          }),
            (eg = Date.now() - eA));
        }
        let eh: any = Object.entries(ed).map(([eA, el]: any) => ({
          name: eA,
          ...el,
        }));
        return (
          this.logger.info?.(
            `[MarketplaceStorage] getMarketplaces ensureConfigFile=${ec}ms readAndRepair=${ep}ms migration=${eg}ms total=${Date.now() - eA}ms count=${eh.length} path=${this.configFilePath}`,
          ),
          eh
        );
      } catch (el: any) {
        return (
          this.logger.error(
            `Failed to read marketplace config after ${Date.now() - eA}ms: ${el}`,
          ),
          []
        );
      }
    }
    async saveMarketplace(eA: any): Promise<any> {
      return this.withLocks(async () => {
        try {
          await this.ensureConfigFileAsync();
          let el: any = await this.readAndRepair(),
            ec: any = eA.storageName || eA.name,
            { name: eu, storageName: ed, ...ep } = eA;
          ((el[ec] = ep), await this.atomicWriteJson(el));
        } catch (el: any) {
          throw (
            this.logger.error(`Failed to save marketplace config: ${el}`),
            this.errorCollector.addError({
              type: t$.PluginErrorType.MarketplaceConfigSaveFailed,
              operation: "save",
              marketplaceName: eA.name,
              message: `Failed to save marketplace configuration for '${eA.name}'`,
              details: el instanceof Error ? el.message : String(el),
            }),
            el
          );
        }
      });
    }
    async removeMarketplace(eA: any): Promise<any> {
      return this.withLocks(async () => {
        try {
          await this.ensureConfigFileAsync();
          let el: any = await this.readAndRepair();
          (delete el[eA], await this.atomicWriteJson(el));
        } catch (el: any) {
          throw (
            this.logger.error(`Failed to remove marketplace config: ${el}`),
            this.errorCollector.addError({
              type: t$.PluginErrorType.MarketplaceConfigSaveFailed,
              operation: "remove",
              marketplaceName: eA,
              message: `Failed to remove marketplace configuration for '${eA}'`,
              details: el instanceof Error ? el.message : String(el),
              source: eA,
            }),
            el
          );
        }
      });
    }
    async isMarketplaceInstalled(eA: any): Promise<any> {
      try {
        return (await this.getMarketplaces()).some((el: any) => el.name === eA);
      } catch (eA: any) {
        return (
          this.logger.error(`Failed to check marketplace installation: ${eA}`),
          !1
        );
      }
    }
  }
  // UTF-16 9565529..9567108
  class MarketplaceConfigManager {
    [key: string]: any;
    init(): any {
      this.logger.setContext("MarketplaceConfigManager");
    }
    async getConfiguredMarketplaces(): Promise<any> {
      let eA: any = new Map();
      for (let el of [
        A_.SettingsScope.USER,
        A_.SettingsScope.PROJECT,
        A_.SettingsScope.PROJECT_LOCAL,
        A_.SettingsScope.CLI,
      ]) {
        if (!(await this.cliSettingSourcesProvider.isScopeAllowed(el)))
          continue;
        let ec: any = await this.settingsManager.get(
          "extraKnownMarketplaces",
          el,
        );
        this.mergeMarketplaceConfig(eA, ec);
      }
      return eA;
    }
    async getMarketplacesToInstall(): Promise<any> {
      try {
        let eA: any = await this.getConfiguredMarketplaces();
        if (0 === eA.size)
          return (
            this.logger.debug(
              "No marketplaces configured in extraKnownMarketplaces",
            ),
            []
          );
        let el: any = await this.marketplaceStorage.getMarketplaces(),
          ec: any = new Set(el.map((eA: any) => eA.name)),
          eu: any = [];
        for (let [el, ed] of eA.entries())
          ec.has(el) ||
            (eu.push({ name: el, source: ed }),
            this.logger.info(`Found marketplace to install: ${el}`));
        return eu;
      } catch (eA: any) {
        return (
          this.logger.error("Failed to get marketplaces to install:", eA),
          []
        );
      }
    }
    mergeMarketplaceConfig(eA: any, el: any): any {
      if (el)
        for (let [ec, eu] of Object.entries(el)) {
          let el: any;
          if ("string" == typeof eu.source) {
            let eA: any;
            switch (eu.source) {
              case "github":
              default:
                eA = t$.MarketplaceType.Github;
                break;
              case "git":
                eA = t$.MarketplaceType.Git;
                break;
              case "url":
                eA = t$.MarketplaceType.URL;
            }
            el = { source: eA, repo: eu.repo, path: eu.url, url: eu.url };
          } else {
            let eA: any = eu.source;
            el = { source: eA.source, repo: eA.repo, path: eA.url };
          }
          el && this.validateMarketplaceSource(el)
            ? eA.set(ec, el)
            : this.logger.warn(
                `Invalid marketplace configuration for '${ec}', skipping，${JSON.stringify(el)}- ${JSON.stringify(eu)}`,
              );
        }
    }
    validateMarketplaceSource(eA: any): any {
      return eA.source === t$.MarketplaceType.Github
        ? !!(eA.repo || eA.path)
        : !!eA.path;
    }
  }
  // UTF-16 9573457..9574515
  class BuiltInMarketplaceProvider {
    [key: string]: any;
    init(): any {
      this.logger.setContext("BuiltInMarketplaceProvider");
    }
    async getBuiltInMarketplaces(): Promise<any> {
      try {
        let eA: any = tV.ContainerUtil.get(
            AS.ProductManager,
          ).getCurrentConfiguration(),
          el: any = eA?.builtInMarketplaces || {},
          ec: any = Object.entries(el).map(([eA, el]: any) => ({
            name: eA,
            ...el,
          }));
        return (
          (this.builtInNamesCache = new Set(ec.map((eA: any) => eA.name))),
          this.logger.info(`Found ${ec.length} built-in marketplace(s)`),
          ec
        );
      } catch (eA: any) {
        return (
          this.logger.error("Failed to get built-in marketplaces:", eA),
          []
        );
      }
    }
    async isBuiltInMarketplace(eA: any): Promise<any> {
      return (
        this.builtInNamesCache || (await this.getBuiltInMarketplaces()),
        this.builtInNamesCache?.has(eA) || !1
      );
    }
    toMarketplaceSource(eA: any): any {
      let el: any = eA.source;
      switch (el) {
        case "github":
          return { source: t$.MarketplaceType.Github, repo: eA.repo };
        case "git":
          return { source: t$.MarketplaceType.Git, url: eA.url, path: eA.url };
        case "url":
          return { source: t$.MarketplaceType.URL, url: eA.url, path: eA.url };
        case "zip":
          return { source: t$.MarketplaceType.Zip, url: eA.url, path: eA.url };
        default:
          return (
            this.logger.warn(`Unknown marketplace source type: ${el}`),
            { source: t$.MarketplaceType.Github, repo: eA.repo }
          );
      }
    }
  }
  const r$ = /^[A-Za-z0-9][-A-Za-z0-9._]*$/;
  // UTF-16 9780911..9782967
  class LocalPluginInstaller {
    [key: string]: any;
    support(eA: any): any {
      return "string" == typeof eA || eA.source === t$.PluginSourceType.Local;
    }
    async install(eA: any, el: any, ec?: any): Promise<any> {
      let eu: any = eA.name,
        ed: any = eA.source;
      this.validatePluginName(eu);
      let ep: any = this.normalizeSource(ed);
      if ((ec?.(`Resolving local plugin path for ${eu}...`), !ep.path))
        throw (
          this.errorCollector.addError({
            type: t$.PluginErrorType.InstallFailed,
            pluginName: eu,
            marketplaceName: "",
            message: `Local plugin source requires a path for '${eu}'`,
            details: "Missing path in plugin source configuration",
          }),
          Error(`Local plugin source requires a path for ${eu}`)
        );
      let eg: any = await this.resolvePluginPath(eu, ep.path, el);
      if (!(await tZ.pathExists(eg)))
        throw (
          this.errorCollector.addError({
            type: t$.PluginErrorType.InstallFailed,
            pluginName: eu,
            marketplaceName: "",
            message: `Local plugin path does not exist for '${eu}'`,
            details: `Path: ${eg}`,
          }),
          Error(`Local plugin path does not exist: ${eg}`)
        );
      return (ec?.(`Local plugin ${eu} resolved at ${eg}`), eg);
    }
    async update(eA: any, el: any, ec?: any): Promise<any> {
      let eu: any = eA.name;
      return (this.validatePluginName(eu),
      ec?.(`Local plugin ${eu} does not require updates`),
      await tZ.pathExists(el))
        ? el
        : (ec?.("Local plugin path no longer exists, re-resolving..."),
          this.install(eA, (0, tX.join)(el, "..", ".."), ec));
    }
    async isInstalled(eA: any, el: any): Promise<any> {
      this.validatePluginName(eA.name);
      let ec: any = eA.source,
        eu: any = "";
      if (
        ("string" == typeof ec
          ? (eu = ec)
          : ec.source === t$.PluginSourceType.Local && (eu = ec.path || ""),
        !eu)
      )
        return;
      let ed: any = this.resolveContainedPath(el, eu);
      if (await tZ.pathExists(ed)) return ed;
    }
    async resolvePluginPath(eA: any, el: any, ec: any): Promise<any> {
      let eu: any = this.resolveContainedPath(ec, el);
      return (await tZ.pathExists(eu)) ||
        ((eu = this.resolveContainedPath(ec, (0, tX.join)(el, eA))),
        await tZ.pathExists(eu))
        ? eu
        : this.resolveContainedPath(ec, el);
    }
    resolveContainedPath(eA: any, el: any): any {
      let ec: any = (0, tX.resolve)(eA),
        eu: any = (0, tX.resolve)(ec, el),
        ed: any = (0, tX.relative)(ec, eu);
      if ((0, tX.isAbsolute)(ed) || ".." === ed || ed.startsWith(`..${tX.sep}`))
        throw Error(`Local plugin path escapes marketplace root: ${el}`);
      return eu;
    }
    validatePluginName(eA: any): any {
      if (!r$.test(eA)) throw Error(`Invalid plugin name: ${eA}`);
    }
    normalizeSource(eA: any): any {
      return "string" == typeof eA
        ? { source: t$.PluginSourceType.Local, path: eA }
        : eA;
    }
  }
  // UTF-16 9579120..9579902. Local sources do not probe git.
  class GitFallbackCoordinator {
    [key: string]: any;
    async maybeFallback(eA: any, el?: any): Promise<any> {
      if (
        (eA.source !== t$.MarketplaceType.Git &&
          eA.source !== t$.MarketplaceType.Github) ||
        (await this.detector.isAvailable())
      )
        return eA;
      let ec = el ?? "<unnamed>",
        eu = this.extractUrl(eA);
      if (!eu)
        return (
          this.logger.warn(
            `[GitFallback] git unavailable but cannot derive URL from source for marketplace '${ec}'; Git install will fail`,
          ),
          eA
        );
      let ed = this.converter.convert(eu);
      return ed
        ? (this.logger.info(
            `[GitFallback] git unavailable, converted Git source '${eu}' -> Zip '${ed}' for marketplace '${ec}'`,
          ),
          { source: t$.MarketplaceType.Zip, path: ed, url: ed })
        : (this.logger.warn(
            `[GitFallback] git unavailable and no ZIP conversion rule matches '${eu}' for marketplace '${ec}'; Git install will fail`,
          ),
          eA);
    }
    extractUrl(eA: any): any {
      return eA.url ? eA.url : eA.path ? eA.path : eA.repo ? eA.repo : void 0;
    }
  }
  return {
    GitFallbackCoordinator,
    BaseMarketplace,
    DirectoryMarketplace,
    MarketplaceFactory,
    MarketplaceStorage,
    MarketplaceConfigManager,
    BuiltInMarketplaceProvider,
    LocalPluginInstaller,
    constants: t$,
    installers,
  };
}
