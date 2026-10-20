// Fixed WorkBuddy 5.3.14 complete PluginManager (194 members); platform/bootstrap adapters remain explicit.
import * as path from "node:path";
import { createRequire } from "node:module";
import { NativeEmitter } from "../agents/native-agent-manager-runtime.js";
import { SettingsScope } from "../permissions/native-permission-policy.js";
import { createCapturedPluginConstants } from "../vendor/captured-plugin-constants.js";
import { createNativePluginSemver } from "./native-plugin-semver.js";
export function createNativePluginManager(runtime?: any) {
  const Object: any = globalThis.Object,
    Promise: any = globalThis.Promise,
    process = runtime.process,
    Date: any = runtime.Date ?? globalThis.Date,
    t$: any = createCapturedPluginConstants(),
    tX = path,
    tZ = runtime.fsExtra,
    AL: any = createNativePluginSemver(runtime),
    A_ = { SettingsScope },
    AS = { ProductManager: "productManager" },
    AK = {
      StartupPhase: {
        PLUGIN_LOAD: "plugin_load",
        MARKETPLACE_LOAD: "marketplace_load",
      },
    },
    tV = {
      Emitter: NativeEmitter,
      ContainerUtil: {
        get: (key?: any) => {
          if (!(key in runtime.dependencies))
            throw Error("Plugin dependency not configured: " + String(key));
          return runtime.dependencies[key];
        },
      },
    },
    ec: any = runtime.require;
  const setTimeout = runtime.setTimeout ?? globalThis.setTimeout;
  const setImmediate = runtime.setImmediate ?? globalThis.setImmediate;
  const { AP, AG, t5, A5, t8, AH, An, Aj, MarketplaceFactory } =
    runtime.bindings ?? {};
  const rI = Object.freeze([]),
    rv = {
      env: {
        ...process.env,
        GIT_TERMINAL_PROMPT: "0",
        GIT_SSH_COMMAND:
          "ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new",
        NODE_OPTIONS: "",
      },
    },
    rS = "installed-plugins-registry",
    rQ = "installed_plugins_v2.json",
    rD = { maxRetries: 10, retryDelay: 200, staleTimeout: 120000 },
    rT = ".orphaned_at",
    rR = ".in_use",
    rk = 1209600000,
    rM = 86400000,
    rx = "CODEBUDDY_MARKETPLACE_AUTO_UPDATE_INTERVAL_MS",
    rO = "workbuddy-builtin",
    rN = "seeded-defaults.json",
    rP = "workbuddy-builtin-seeded-defaults",
    rL = /^[A-Za-z0-9][-A-Za-z0-9._+]*$/,
    rF = new Set();
  let rU = false,
    e0: any;
  // UTF-16 9624483..9624636
  function registerPluginCacheMarkerForExit(eA?: any): any {
    (rF.add(eA),
      rU ||
        ((rU = !0),
        process.once("exit", () => {
          for (let eA of rF)
            try {
              tZ.removeSync(eA);
            } catch {}
          rF.clear();
        })));
  }
  // UTF-16 9533928..9534254
  async function mapWithConcurrencyLimit(
    eA?: any,
    el?: any,
    ec?: any,
  ): Promise<any> {
    if (0 === eA.length) return [];
    let eu: any = Math.max(
        1,
        Math.min(Number.isFinite(el) ? Math.floor(el) : 1, eA.length),
      ),
      ed: any = Array(eA.length),
      ep: any = 0;
    async function worker(): Promise<any> {
      for (; ep < eA.length; ) {
        let el: any = ep++;
        ed[el] = await ec(eA[el], el);
      }
    }
    return (await Promise.all(Array.from({ length: eu }, () => worker())), ed);
  }
  // UTF-16 9534271..9534735
  function resolveDependencyClosure(eA?: any, el?: any): any {
    let ec: any = [],
      eu: any = [],
      ed: any = [],
      ep: any = new Set(),
      eg: any = new Set(),
      eh: any = [];
    function dfs(ef?: any): any {
      if (eg.has(ef)) return;
      if (ep.has(ef)) {
        let eA: any = eh.indexOf(ef);
        eA >= 0 && ed.push([...eh.slice(eA), ef]);
        return;
      }
      (ep.add(ef), eh.push(ef));
      let em: any = el.get(ef);
      if (!em) {
        (ef !== eA && eu.push(ef), ep.delete(ef), eh.pop());
        return;
      }
      for (let eA of em.dependencies) dfs(eA);
      (ep.delete(ef), eh.pop(), eg.add(ef), ef !== eA && ec.push(ef));
    }
    return (dfs(eA), { resolved: ec, missing: eu, cycles: ed, demoted: [] });
  }
  // UTF-16 9624672..9624889
  class PluginDependencyResolutionError extends Error {
    [key: string]: any;
    constructor(eA?: any, el?: any, ec?: any, eu?: any) {
      (super(eA.message),
        (this.problem = eA),
        (this.errorType = el),
        (this.pluginName = ec),
        (this.marketplaceName = eu),
        (this.name = "PluginDependencyResolutionError"));
    }
  }
  // UTF-16 9624900..9758187
  class PluginManagerImpl {
    [key: string]: any;
    constructor() {
      ((this.onDidChangeEmitter = new tV.Emitter()),
        (this.onDidChange = this.onDidChangeEmitter.event),
        (this.activePlugins = rI),
        (this.installedPluginsRegistryWriteLock = Promise.resolve()),
        (this.marketplacePluginsCache = new Map()),
        (this.marketplacePluginsCacheMtime = new Map()),
        (this.marketplacePluginsLoading = new Map()),
        (this.pluginComponentsCache = new Map()),
        (this.pluginComponentsLoading = new Map()),
        (this.sessionEnabledPluginOverrides = new Map()),
        (this.cacheGeneration = 0),
        (this.initializationComplete = !1),
        (this.pendingManagedPolicies = new Map()),
        (this.pendingApplyRequest = !1),
        (this.isReinstallingBuiltInMarketplaces = !1),
        (this.pendingReinstallRequest = !1),
        (this.builtInMarketplaceRefreshPromise = Promise.resolve()));
    }
    init(): any {
      (this.logger.setContext("PluginManager"),
        this.cliSettingSourcesProvider.onDidChange(() => {
          (this.logger.info(
            "Setting sources changed, invalidating plugin caches",
          ),
            this.clearAllCaches(),
            this.onDidChangeEmitter.fire());
        }));
    }
    ensureInitialized(): any {
      return (
        this.initPromise || (this.initPromise = this.doInit()),
        this.startupPluginPreparationPromise ||
          (this.startupPluginPreparationPromise = this.initPromise.then(() =>
            this.installMarketplacesFromSettingsAsync(),
          )),
        this.initPromise
      );
    }
    async doInit(): Promise<any> {
      let eA: any = Date.now();
      (this.startupProfiler.markStart(
        AK.StartupPhase.PLUGIN_LOAD,
        "Plugin Load",
      ),
        this.startupProfiler.markStart(
          AK.StartupPhase.MARKETPLACE_LOAD,
          "Marketplace Load",
        ));
      let el: any = Date.now();
      await this.loadMarketplaces();
      let ec: any = Date.now() - el;
      (this.startupProfiler.markEnd(AK.StartupPhase.MARKETPLACE_LOAD),
        await this.reconcileBuiltinSeedInstalledPlugins(),
        (await this.hasCliSessionPluginSettings()) &&
          (await this.preparePluginsFromSettings({
            enabledPluginScopes: [A_.SettingsScope.CLI],
            persistEnabledPlugins: !1,
          })),
        await this.migrateLegacyEnabledPluginCaches(),
        await this.migrateUnknownPluginCaches());
      let eu: any = Date.now();
      await this.loadInstalledPlugins();
      let ed: any = Date.now() - eu;
      (await this.cleanupPluginCache(),
        this.startupProfiler.markEnd(AK.StartupPhase.PLUGIN_LOAD),
        this.pluginPolicyService.onDidChange(async () => {
          let eA: any = this.pluginPolicyService.getMergedPlugins();
          (this.logger.info(
            `[ManagedPolicy][DEBUG] Policies changed, count=${eA.length}, policies=${JSON.stringify(eA.map((eA?: any) => eA.name + "@" + eA.marketplaceName))}`,
          ),
            await this.applyManagedPolicies());
        }),
        this.subscribeToProductBuiltInMarketplacesChange(),
        (await this.shouldAutoUpdateThirdPartyMarketplaces()) &&
          this.logger.info("Auto-update enabled for third-party marketplaces"),
        (this.initializationComplete = !0),
        this.logger.info(
          `[PluginManager] doInit done total=${Date.now() - eA}ms loadMarketplaces=${ec}ms loadInstalledPlugins=${ed}ms`,
        ));
    }
    async hasCliSessionPluginSettings(): Promise<any> {
      let eA: any = await this.settingsManager.get(
        "enabledPlugins",
        A_.SettingsScope.CLI,
      );
      if (eA && "object" == typeof eA && Object.keys(eA).length > 0) return !0;
      let el: any = await this.settingsManager.get(
        "extraKnownMarketplaces",
        A_.SettingsScope.CLI,
      );
      return !!el && "object" == typeof el && Object.keys(el).length > 0;
    }
    async reconcileWorkbuddyBuiltinSeed(eA?: any): Promise<any> {
      let el: any;
      (this.validateWorkbuddyBuiltinSeedRequest(eA), await this.whenReady());
      let ec: any = await this.fileLockService.acquireFileLock(
        this.getWorkbuddyBuiltinSeedTransactionLockName(),
        rD,
      );
      try {
        return (
          (el = await this.fileLockService.acquireFileLock(rP, rD)),
          await this.reconcileWorkbuddyBuiltinSeedLocked(eA)
        );
      } finally {
        (await el?.().catch((eA?: any) => {
          this.logger.warn(
            `Failed to release WorkBuddy builtin defaults lock: ${eA}`,
          );
        }),
          await ec().catch((eA?: any) => {
            this.logger.warn(
              `Failed to release WorkBuddy builtin seed transaction lock: ${eA}`,
            );
          }));
      }
    }
    async reconcileWorkbuddyBuiltinSeedLocked(eA?: any): Promise<any> {
      let el: any = (await this.marketplaceStorage.getMarketplaces()).find(
          (eA?: any) => eA.name === rO || eA.storageName === rO,
        ),
        ec: any = eA.available
          ? this.normalizeWorkbuddyBuiltinDefaults(eA.defaults)
          : {},
        eu: any = this.createWorkbuddyBuiltinEnabledPluginsSnapshot(
          Object.keys(ec),
        ),
        ed: any = {
          enabledPluginsSnapshot: eu,
          marketplaceCommitted: !1,
          settingsCommitted: !1,
        };
      try {
        if (!1 === eA.available)
          return (
            el &&
              (await this.marketplaceStorage.removeMarketplace(
                el.storageName || el.name,
              ),
              (ed.marketplaceCommitted = !0),
              this.clearCache()),
            {
              marketplaceChanged: !!el,
              settingsChanged: !1,
              installedPluginsChanged: !1,
              newlySeededDisabled: [],
              newlySeededEnabled: [],
            }
          );
        let ec: any = tX.join(
          this.getHomePluginsDir(),
          t$.MARKETPLACES_DIR,
          rO,
        );
        await this.assertCanonicalWorkbuddyBuiltinMarketplace(ec);
        let eu: any = {
            name: rO,
            storageName: rO,
            type: t$.MarketplaceType.Directory,
            source: { source: t$.MarketplaceType.Directory, path: ec },
            installLocation: ec,
            isBuiltIn: !0,
            autoUpdate: !1,
            description: "WorkBuddy builtin plugins",
          },
          ep: any = !el || !this.isSameWorkbuddyBuiltinMarketplace(el, eu);
        ep &&
          (await this.marketplaceStorage.saveMarketplace({
            ...eu,
            lastUpdated: new Date().toISOString(),
          }),
          (ed.marketplaceCommitted = !0));
        let eg: any = await this.reconcileWorkbuddyBuiltinDefaults(eA, ed);
        this.clearCache();
        let eh: any =
          (await this.reconcileBuiltinSeedInstalledPlugins()) === !0;
        return (
          await this.cleanupLegacyWorkbuddyBuiltinSeededDefaults(),
          { marketplaceChanged: ep, installedPluginsChanged: eh, ...eg }
        );
      } catch (ec: any) {
        let eA: any = await this.rollbackWorkbuddyBuiltinSeedMetadata({
          existingMarketplace: el,
          enabledPluginsSnapshot: eu,
          tracker: ed,
        });
        if (eA.length > 0) {
          let el: any = ec instanceof Error ? ec.message : String(ec);
          throw Error(
            `${el}; WorkBuddy builtin metadata rollback failed: ${eA.join("; ")}`,
          );
        }
        throw ec;
      }
    }
    validateWorkbuddyBuiltinSeedRequest(eA?: any): any {
      if (!eA || "boolean" != typeof eA.available)
        throw Error("Invalid WorkBuddy builtin seed availability");
      if (!1 === eA.available) return;
      let el: any = eA.mode ?? "none";
      if ("all" !== el && "defaults" !== el && "none" !== el)
        throw Error(`Invalid WorkBuddy builtin seed mode: ${String(eA.mode)}`);
      this.normalizeWorkbuddyBuiltinDefaults(eA.defaults);
    }
    async assertCanonicalWorkbuddyBuiltinMarketplace(eA?: any): Promise<any> {
      let el: any = this.getHomePluginsDir(),
        ec: any = await tZ.lstat(el).catch(() => void 0);
      if (!ec?.isDirectory() || ec.isSymbolicLink())
        throw Error(`WorkBuddy plugins root is missing or unsafe at ${el}`);
      let eu: any = tX.dirname(el),
        [ed, ep] = await Promise.all([tZ.realpath(eu), tZ.realpath(el)]);
      if (ep !== tX.join(ed, tX.basename(el)))
        throw Error(
          `WorkBuddy plugins root must use its canonical path: ${el}`,
        );
      let eg: any = await tZ.lstat(eA).catch(() => void 0);
      if (!eg?.isDirectory() || eg.isSymbolicLink())
        throw Error(
          `WorkBuddy builtin marketplace is missing or unsafe at ${eA}`,
        );
      let eh: any = tX.dirname(eA),
        ef: any = await tZ.lstat(eh).catch(() => void 0);
      if (!ef?.isDirectory() || ef.isSymbolicLink())
        throw Error(`WorkBuddy builtin marketplace parent is unsafe at ${eh}`);
      let [em, eE] = await Promise.all([tZ.realpath(eA), tZ.realpath(eh)]);
      if (em !== tX.join(eE, rO))
        throw Error(
          `WorkBuddy builtin marketplace must use its canonical path: ${eA}`,
        );
      if ((await this.readMarketplaceManifestName(em)) !== rO)
        throw Error(`Invalid WorkBuddy builtin marketplace manifest at ${eA}`);
    }
    isSameWorkbuddyBuiltinMarketplace(eA?: any, el?: any): any {
      return (
        eA.type === el.type &&
        eA.source?.source === el.source.source &&
        tX.resolve(eA.source?.path || "") ===
          tX.resolve(el.source.path || "") &&
        tX.resolve(eA.installLocation || "") ===
          tX.resolve(el.installLocation) &&
        !0 === eA.isBuiltIn &&
        !1 === eA.autoUpdate &&
        eA.description === el.description
      );
    }
    createWorkbuddyBuiltinEnabledPluginsSnapshot(eA?: any): any {
      return {
        pluginIds: [...eA],
        captured: !1,
        wasRecord: !1,
        originalValue: void 0,
      };
    }
    captureWorkbuddyBuiltinEnabledPluginsSnapshot(eA?: any, el?: any): any {
      eA.captured ||
        ((eA.captured = !0),
        (eA.wasRecord = !!el && "object" == typeof el && !Array.isArray(el)),
        (eA.originalValue = eA.wasRecord
          ? Object.fromEntries(
              eA.pluginIds
                .filter((eA?: any) =>
                  Object.prototype.hasOwnProperty.call(el, eA),
                )
                .map((eA?: any) => [eA, el[eA]]),
            )
          : void 0));
    }
    async rollbackWorkbuddyBuiltinSeedMetadata(eA?: any): Promise<any> {
      let el: any = [],
        attempt: any = async (eA?: any, ec?: any) => {
          try {
            await ec();
          } catch (eu: any) {
            let ec: any = `${eA}: ${eu instanceof Error ? eu.message : String(eu)}`;
            (el.push(ec),
              this.logger.error(`Failed to roll back WorkBuddy builtin ${ec}`));
          }
        };
      return (
        eA.tracker.settingsCommitted &&
          (await attempt("enabled plugin defaults", async () => {
            if (!eA.enabledPluginsSnapshot.captured)
              throw Error("fresh user settings baseline was not captured");
            if (
              !(
                await this.settingsManager.update(
                  "enabledPlugins",
                  (el?: any) => {
                    if (!eA.enabledPluginsSnapshot.wasRecord) return;
                    let ec: any = {
                      ...(el && "object" == typeof el && !Array.isArray(el)
                        ? el
                        : {}),
                    };
                    for (let el of eA.enabledPluginsSnapshot.pluginIds)
                      eA.enabledPluginsSnapshot.originalValue &&
                      Object.prototype.hasOwnProperty.call(
                        eA.enabledPluginsSnapshot.originalValue,
                        el,
                      )
                        ? (ec[el] = eA.enabledPluginsSnapshot.originalValue[el])
                        : delete ec[el];
                    return ec;
                  },
                  A_.SettingsScope.USER,
                )
              ).applied
            )
              throw Error("user settings rejected rollback");
          })),
        eA.tracker.marketplaceCommitted &&
          (await attempt("marketplace registration", async () => {
            if (eA.existingMarketplace)
              await this.marketplaceStorage.saveMarketplace({
                ...eA.existingMarketplace,
                source: { ...eA.existingMarketplace.source },
              });
            else {
              let eA: any = (
                await this.marketplaceStorage.getMarketplaces()
              ).find((eA?: any) => eA.name === rO || eA.storageName === rO);
              eA &&
                (await this.marketplaceStorage.removeMarketplace(
                  eA.storageName || eA.name,
                ));
            }
          })),
        this.clearCache(),
        el
      );
    }
    async reconcileWorkbuddyBuiltinDefaults(eA?: any, el?: any): Promise<any> {
      let ec: any = eA.mode ?? "none";
      if ("all" !== ec && "defaults" !== ec && "none" !== ec)
        throw Error(`Invalid WorkBuddy builtin seed mode: ${String(eA.mode)}`);
      if ("none" === ec)
        return {
          settingsChanged: !1,
          newlySeededDisabled: [],
          newlySeededEnabled: [],
        };
      let eu: any = this.normalizeWorkbuddyBuiltinDefaults(eA.defaults),
        ed: any = Object.keys(eu).filter((eA?: any) => !0 === eu[eA]);
      if (0 === ed.length)
        return {
          settingsChanged: !1,
          newlySeededDisabled: [],
          newlySeededEnabled: [],
        };
      let ep: any = [],
        eg: any = await this.settingsManager.update(
          "enabledPlugins",
          (eA?: any) => {
            (this.captureWorkbuddyBuiltinEnabledPluginsSnapshot(
              el.enabledPluginsSnapshot,
              eA,
            ),
              (ep.length = 0));
            let ec: any = {
              ...(eA && "object" == typeof eA && !Array.isArray(eA) ? eA : {}),
            };
            for (let eA of ed)
              eA in ec ||
                ((ec[eA] = !0), ep.push(eA.slice(0, -`@${rO}`.length)));
            return ec;
          },
          A_.SettingsScope.USER,
        );
      if (!eg.applied)
        throw Error(
          "Failed to apply WorkBuddy builtin defaults to user settings",
        );
      return (
        (el.settingsCommitted = eg.changed),
        {
          settingsChanged: eg.changed,
          newlySeededDisabled: [],
          newlySeededEnabled: ep,
        }
      );
    }
    async cleanupLegacyWorkbuddyBuiltinSeededDefaults(): Promise<any> {
      let eA: any = this.getWorkbuddyBuiltinSeededDefaultsPath();
      try {
        if (!(await tZ.lstat(eA).catch(() => void 0))) return;
        (await tZ.remove(eA),
          this.logger.info(
            `Removed legacy WorkBuddy builtin seed ledger at ${eA}`,
          ));
      } catch (el: any) {
        this.logger.warn(
          `Failed to remove legacy WorkBuddy builtin seed ledger at ${eA}: ${el instanceof Error ? el.message : String(el)}`,
        );
      }
    }
    normalizeWorkbuddyBuiltinDefaults(eA?: any): any {
      if (void 0 === eA) return {};
      if (!eA || "object" != typeof eA || Array.isArray(eA))
        throw Error("Invalid WorkBuddy builtin defaults payload");
      let el: any = `@${rO}`,
        ec: any = {};
      for (let [eu, ed] of Object.entries(eA)) {
        let eA: any = eu.endsWith(el) ? eu.slice(0, -el.length) : "";
        if ("boolean" != typeof ed || !rL.test(eA))
          throw Error(`Invalid WorkBuddy builtin default: ${eu}`);
        ec[eu] = ed;
      }
      return ec;
    }
    getWorkbuddyBuiltinSeededDefaultsPath(): any {
      return tX.join(this.getHomePluginsDir(), rN);
    }
    getWorkbuddyBuiltinSeedTransactionLockName(): any {
      let eA: any = (0, AP.createHash)("sha256")
        .update(tX.resolve(this.getWorkbuddyBuiltinSeededDefaultsPath()))
        .digest("hex")
        .slice(0, 16);
      return `${rP}-${eA}`;
    }
    async getWorkbuddyBuiltinSeedPluginIds(eA?: any): Promise<any> {
      let el: any = eA.get(rO);
      if (
        !el ||
        el.type !== t$.MarketplaceType.Directory ||
        !0 !== el.isBuiltIn
      )
        return [];
      try {
        return (await el.listPlugins())
          .filter((eA?: any) => rL.test(eA.name))
          .map((eA?: any) => this.getPluginId(eA.name, rO));
      } catch (eA: any) {
        return (
          this.logger.warn(
            `Failed to list WorkBuddy builtin seed plugins: ${eA}`,
          ),
          []
        );
      }
    }
    async reconcileBuiltinSeedInstalledPlugins(): Promise<any> {
      let eA: any = (0, AG.isWorkBuddyDesktop)(),
        el: any = eA ? void 0 : await this.getEnabledPlugins(),
        ec: any = await this.listMarketplace(),
        eu: any = new Map();
      for (let eA of ec)
        (eu.set(eA.name, eA), eA.storageName && eu.set(eA.storageName, eA));
      let ed: any = eA
          ? await this.getWorkbuddyBuiltinSeedPluginIds(eu)
          : Object.entries(el ?? {})
              .filter(([eA, el]: any) => el.enabled && !eA.endsWith("@inline"))
              .map(([eA]: any) => eA),
        ep: any = [];
      for (let eA of ed) {
        let el: any = eA.indexOf("@");
        if (el <= 0 || el === eA.length - 1) continue;
        let ec: any = eA.slice(0, el),
          ed: any = eA.slice(el + 1);
        if (ed !== rO) continue;
        let eg: any = eu.get(ed);
        if (
          eg &&
          (eg.name === rO || eg.storageName === rO) &&
          eg.type === t$.MarketplaceType.Directory &&
          !0 === eg.isBuiltIn
        )
          try {
            let el: any = await eg.getPlugin(ec),
              eu: any = el?.version?.trim();
            if (
              !el ||
              !eu ||
              "." === eu ||
              ".." === eu ||
              1 !== eu.split(/[\\/]+/).length
            )
              continue;
            let eh: any = this.getBuiltinSeedPluginCacheRoot(ec, ed),
              ef: any = this.getBuiltinSeedPluginCachePath(ec, ed, eu);
            if (
              !(await this.isValidBuiltinSeedCacheDirectory(ef, eh, ec, eu))
            ) {
              this.logger.warn(
                `Skipping builtin seed registry reconcile for ${eA}: cache snapshot is missing or unsafe at ${ef}`,
              );
              continue;
            }
            ep.push({
              pluginId: eA,
              pluginName: ec,
              marketplaceName: ed,
              version: eu,
              installPath: ef,
              pluginCacheRoot: eh,
            });
          } catch (el: any) {
            this.logger.warn(`Failed to inspect builtin seed ${eA}: ${el}`);
          }
      }
      if (0 === ep.length) return !1;
      for (let eA of ep)
        await tZ.remove(tX.join(eA.installPath, rT)).catch(() => void 0);
      let eg: any = new Set(),
        eh: any = new Set();
      return (
        !!(await this.mutateInstalledPluginsRegistry(async (el?: any) => {
          let ec: any = new Date().toISOString(),
            eu: any = !1;
          for (let ed of ep) {
            let ep: any,
              eh: any = el.plugins[ed.pluginId] || [],
              ef: any = eh.filter(
                (eA?: any) => "user" === eA.scope || "managed" === eA.scope,
              ),
              em: any = new Set();
            for (let el of ef)
              !eA &&
                !0 !== el.workbuddySeedManaged &&
                (await this.isValidBuiltinSeedInstalledRecord(el, ed)) &&
                em.add(el);
            if (em.size > 0)
              ep = eh.filter((eA?: any) => !ef.includes(eA) || em.has(eA));
            else {
              let el: any,
                eu: any = ef.filter(
                  (eA?: any) => !0 === eA.workbuddySeedManaged,
                );
              for (let eA of eu)
                if (
                  eA.version === ed.version &&
                  tX.resolve(eA.installPath) === tX.resolve(ed.installPath) &&
                  (await this.isValidBuiltinSeedInstalledRecord(eA, ed))
                ) {
                  el = eA;
                  break;
                }
              let eg: any = el || eu[0] || (eA ? ef[0] : void 0),
                em: any =
                  el &&
                  el.version === ed.version &&
                  tX.resolve(el.installPath) === tX.resolve(ed.installPath) &&
                  (await this.isValidBuiltinSeedInstalledRecord(el, ed))
                    ? el
                    : {
                        scope: eg?.scope === "managed" ? "managed" : "user",
                        installPath: ed.installPath,
                        version: ed.version,
                        workbuddySeedManaged: !0,
                        installedAt: eg?.installedAt || ec,
                        lastUpdated: ec,
                      };
              ep = [...eh.filter((eA?: any) => !ef.includes(eA)), em];
            }
            if (JSON.stringify(eh) !== JSON.stringify(ep)) {
              for (let eA of eh)
                !0 !== eA.workbuddySeedManaged ||
                  ep.includes(eA) ||
                  eg.add(await this.resolveExistingRealPath(eA.installPath));
              ((el.plugins[ed.pluginId] = ep), (eu = !0));
            }
          }
          if (!eu) return !1;
          for (let eA of Object.values(el.plugins))
            for (let el of eA)
              eh.add(await this.resolveExistingRealPath(el.installPath));
          return !0;
        })) &&
        (await Promise.all(
          Array.from(eg)
            .filter((eA?: any) => !eh.has(eA))
            .map(async (eA?: any) => {
              try {
                await this.markPluginCacheOrphaned(eA);
              } catch (el: any) {
                this.logger.warn(
                  `Failed to mark replaced builtin seed cache as orphaned ${eA}: ${el}`,
                );
              }
            }),
        ),
        !0)
      );
    }
    async isValidBuiltinSeedInstalledRecord(eA?: any, el?: any): Promise<any> {
      return (
        ("user" === eA.scope || "managed" === eA.scope) &&
        void 0 === eA.projectPath &&
        !!eA.version &&
        (!0 === eA.workbuddySeedManaged
          ? this.isValidBuiltinSeedCacheDirectory(
              eA.installPath,
              el.pluginCacheRoot,
              el.pluginName,
              eA.version,
            )
          : (await this.isValidOrdinaryBuiltinCacheDirectory(
              eA.installPath,
              el.pluginName,
              el.marketplaceName,
              eA.version,
            )) ||
            this.isValidBuiltinSeedCacheDirectory(
              eA.installPath,
              el.pluginCacheRoot,
              el.pluginName,
              eA.version,
            ))
      );
    }
    async isValidBuiltinSeedCacheDirectory(
      eA?: any,
      el?: any,
      ec?: any,
      eu?: any,
    ): Promise<any> {
      if (!(await tZ.pathExists(eA))) return !1;
      let ed: any = await this.resolveRealPathStrictlyInside(el, eA);
      if (!ed) return !1;
      let ep: any = await this.readPluginManifest(ed);
      return (
        !!ep &&
        ep.name === ec &&
        ep.version === eu &&
        tX.basename(ed) === this.sanitizeBuiltinSeedCacheSegment(eu)
      );
    }
    async isValidOrdinaryBuiltinCacheDirectory(
      eA?: any,
      el?: any,
      ec?: any,
      eu?: any,
    ): Promise<any> {
      let ed: any = this.getPluginCacheRoot(el, ec);
      if (!(await tZ.pathExists(eA))) return !1;
      let ep: any = await this.resolveRealPathStrictlyInside(ed, eA);
      if (!ep) return !1;
      let eg: any = await this.readPluginManifest(ep);
      return (
        !!eg &&
        eg.name === el &&
        eg.version === eu &&
        tX.basename(ep) === this.sanitizeCacheSegment(eu, "version")
      );
    }
    async resolveRealPathStrictlyInside(eA?: any, el?: any): Promise<any> {
      try {
        let [ec, eu] = await Promise.all([tZ.realpath(eA), tZ.realpath(el)]),
          ed: any = tX.relative(ec, eu);
        return !ed ||
          ".." === ed ||
          ed.startsWith(`..${tX.sep}`) ||
          tX.isAbsolute(ed)
          ? void 0
          : eu;
      } catch {
        return;
      }
    }
    async resolveExistingRealPath(eA?: any): Promise<any> {
      try {
        return await tZ.realpath(eA);
      } catch {
        return tX.resolve(eA);
      }
    }
    async migrateLegacyEnabledPluginCaches(): Promise<any> {
      let eA: any = await this.getEnabledPlugins(),
        el: any = await this.readInstalledPluginsRegistry(),
        ec: any = Object.keys(eA).filter(
          (eA?: any) => eA.includes("@") && !eA.endsWith("@inline"),
        );
      await mapWithConcurrencyLimit(
        ec,
        t$.CONCURRENT_PLUGIN_INSTALL_LIMIT,
        async (ec?: any) => {
          let eu: any = ec.indexOf("@"),
            ed: any = ec.slice(0, eu),
            ep: any = ec.slice(eu + 1),
            eg: any = eA[ec];
          try {
            let eA: any = this.getProjectPathForScope(eg.scope),
              eu: any = el.plugins[ec]?.find((el?: any) =>
                this.installedRecordMatchesScope(el, eg.scope, eA),
              );
            if (eu && (await tZ.pathExists(eu.installPath))) return;
            let eh: any = await this.getMarketplace(ep),
              ef: any = await eh?.getPlugin(ed);
            if (!eh || !ef || this.shouldRunDirectoryPluginFromSource(eh))
              return;
            let em: any = await this.resolveInstalledPluginCache(
              ef,
              eg.scope,
              ef.version,
            );
            if (em)
              return void (await this.recordInstalledPlugin(
                ef,
                em.installPath,
                em.version || ef.version || "unknown",
                {
                  scope: eg.scope,
                  resolvedVersion: em.resolvedVersion,
                  gitCommitSha: em.gitCommitSha,
                  autoInstalled: eu?.auto,
                },
              ));
            let eE: any = this.installers.find((eA?: any) =>
                eA.support(ef.source),
              ),
              eC: any = await eE?.isInstalled(ef, eh.installLocation);
            if (!eC || !(await tZ.pathExists(eC))) return;
            (await this.materializePluginCache(
              ef,
              eC,
              { scope: eg.scope },
              eh.installLocation,
            ),
              this.logger.info(
                `Migrated legacy plugin ${ec} into the versioned cache`,
              ));
          } catch (eA: any) {
            this.logger.warn(`Failed to migrate legacy plugin ${ec}: ${eA}`);
          }
        },
      );
    }
    isUnknownInstalledPluginRecord(eA?: any): any {
      return (
        !eA.version ||
        "unknown" === eA.version ||
        "unknown" === tX.basename(tX.resolve(eA.installPath))
      );
    }
    async migrateUnknownPluginCaches(): Promise<any> {
      let eA: any = Object.entries(
        (await this.readInstalledPluginsRegistry()).plugins,
      )
        .map(([eA, el]: any) => ({
          pluginId: eA,
          records: el.filter((eA?: any) =>
            this.isUnknownInstalledPluginRecord(eA),
          ),
        }))
        .filter((eA?: any) => eA.records.length > 0);
      await mapWithConcurrencyLimit(
        eA,
        t$.CONCURRENT_PLUGIN_INSTALL_LIMIT,
        async ({ pluginId: eA, records: el }: any) => {
          let ec: any = eA.indexOf("@");
          if (ec <= 0 || ec === eA.length - 1) return;
          let eu: any = eA.slice(0, ec),
            ed: any = eA.slice(ec + 1);
          try {
            let ec: any = await this.getMarketplace(ed),
              ep: any = await ec?.getPlugin(eu);
            if (!ec || !ep || this.shouldRunDirectoryPluginFromSource(ec))
              return;
            let eg: any = this.installers.find((eA?: any) =>
                eA.support(ep.source),
              ),
              eh: any = await eg?.isInstalled(ep, ec.installLocation);
            if (!eh || !(await tZ.pathExists(eh))) return;
            let ef: any = new Set();
            for (let eu of el) {
              let el: any = await this.resolvePluginCacheIdentity(
                ep,
                eh,
                { resolvedVersion: eu.resolvedVersion },
                ec.installLocation,
              );
              if ("unknown" === el.cacheSegment) continue;
              let ed: any = this.getPluginCachePath(
                ep.name,
                ep.marketplaceName,
                el.cacheSegment,
              );
              (ef.has(ed) ||
                (await this.ensurePluginCacheForMigration(
                  eh,
                  ed,
                  ec.installLocation,
                ),
                ef.add(ed)),
                (await this.migrateUnknownInstalledPluginRecord(
                  eA,
                  eu,
                  ed,
                  el,
                )) &&
                  this.logger.info(
                    `Migrated plugin cache ${eA} from unknown to ${el.cacheSegment}`,
                  ));
            }
          } catch (el: any) {
            this.logger.warn(
              `Failed to migrate unknown plugin cache ${eA}: ${el}`,
            );
          }
        },
      );
    }
    async ensurePluginCacheForMigration(
      eA?: any,
      el?: any,
      ec?: any,
    ): Promise<any> {
      let eu: any = (0, AP.createHash)("sha256")
          .update(tX.resolve(el))
          .digest("hex")
          .slice(0, 16),
        ed: any = await this.fileLockService.acquireFileLock(
          `plugin-cache-migration-${eu}`,
          rD,
        );
      try {
        (await tZ.pathExists(el)) ||
          (await this.replacePluginCacheAtomically(eA, el, ec));
      } finally {
        await ed();
      }
    }
    async migrateUnknownInstalledPluginRecord(
      eA?: any,
      el?: any,
      ec?: any,
      eu?: any,
    ): Promise<any> {
      let ed: any,
        ep: any = !1,
        eg: any = !1;
      return (
        await this.mutateInstalledPluginsRegistry((eh?: any) => {
          let ef: any = eh.plugins[eA] || [],
            em: any = ef.findIndex(
              (eA?: any) =>
                eA.scope === el.scope &&
                eA.projectPath === el.projectPath &&
                tX.resolve(eA.installPath) === tX.resolve(el.installPath) &&
                this.isUnknownInstalledPluginRecord(eA),
            );
          if (em < 0) return;
          let eE: any = ef[em];
          ((ed = tX.resolve(eE.installPath)),
            (ef[em] = {
              ...eE,
              installPath: ec,
              version: eu.version,
              resolvedVersion: eu.resolvedVersion,
              gitCommitSha: eu.gitCommitSha,
              lastUpdated: new Date().toISOString(),
            }),
            (ep = !0),
            (eg = Object.values(eh.plugins).some((eA?: any) =>
              eA.some((eA?: any) => tX.resolve(eA.installPath) === ed),
            )));
        }),
        !!ep &&
          (await tZ.remove(tX.join(ec, rT)).catch(() => void 0),
          ed &&
            ed !== tX.resolve(ec) &&
            !eg &&
            (await this.markPluginCacheOrphaned(ed)),
          !0)
      );
    }
    async preparePluginsFromSettings(eA: any = {}): Promise<any> {
      (process.env.CODEBUDDY_SKIP_BUILTIN_MARKETPLACE
        ? this.logger.info(
            "Built-in marketplace installation is disabled via CODEBUDDY_SKIP_BUILTIN_MARKETPLACE",
          )
        : await this.installBuiltInMarketplaces(),
        await this.installMarketplacesFromSettings(),
        await this.loadMarketplaces(),
        await this.installMissingEnabledPlugins(eA));
    }
    installMarketplacesFromSettingsAsync(): any {
      return new Promise((eA?: any) => setImmediate(eA)).then(async () => {
        try {
          (await this.preparePluginsFromSettings(),
            await this.builtInMarketplaceRefreshPromise,
            await this.retryPendingManagedPolicies(),
            this.logger.info(
              "[ManagedPolicy] Startup apply managed policies (fallback)",
            ),
            await this.applyManagedPolicies(),
            this.onDidChangeEmitter.fire());
          let eA: any = this.errorCollector.getErrorCount();
          (eA > 0 &&
            this.consoleManager.warn(
              `${eA} plugin error(s) occurred. Run /plugin to view details.`,
              { displayDuration: 8e3 },
            ),
            setTimeout(() => {
              this.autoUpdateMarketplaces().catch((eA?: any) => {
                (this.logger.error("Failed to auto-update marketplaces:", eA),
                  this.consoleManager.warn(
                    "Marketplace update failed. Run /plugin to view details.",
                    { displayDuration: 8e3 },
                  ));
              });
            }, 5e3));
        } catch (eA: any) {
          (this.logger.error(
            "Failed to install marketplaces from settings in background:",
            eA,
          ),
            this.consoleManager.warn(
              "Failed to initialize plugins. Run /plugin to view details.",
              { displayDuration: 8e3 },
            ));
        }
      });
    }
    subscribeToProductBuiltInMarketplacesChange(): any {
      if (process.env.CODEBUDDY_SKIP_BUILTIN_MARKETPLACE)
        return void this.logger.info(
          "[BuiltInMarketplace-HotReload] Skipped: CODEBUDDY_SKIP_BUILTIN_MARKETPLACE is set",
        );
      try {
        (tV.ContainerUtil.get(AS.ProductManager).onDidChange(() => {
          this.handleBuiltInMarketplacesConfigChange();
        }),
          this.logger.info(
            "[BuiltInMarketplace-HotReload] Subscribed to ProductManager.onDidChange",
          ));
      } catch (eA: any) {
        this.logger.warn(
          `[BuiltInMarketplace-HotReload] Failed to subscribe to ProductManager.onDidChange: ${eA instanceof Error ? eA.message : String(eA)}`,
        );
      }
    }
    handleBuiltInMarketplacesConfigChange(): any {
      if (this.isReinstallingBuiltInMarketplaces) {
        this.pendingReinstallRequest = !0;
        return;
      }
      ((this.isReinstallingBuiltInMarketplaces = !0),
        (this.builtInMarketplaceRefreshPromise = new Promise((eA?: any) =>
          setImmediate(eA),
        ).then(async () => {
          let eA: any = !1;
          try {
            for (
              ;
              (await this.installBuiltInMarketplaces()) && (eA = !0),
                (this.marketplaceCache = void 0),
                await this.loadMarketplaces(),
                this.pendingReinstallRequest;

            )
              this.pendingReinstallRequest = !1;
            eA && this.onDidChangeEmitter.fire();
          } catch (eA: any) {
            this.logger.error(
              "[BuiltInMarketplace-HotReload] Failed to reinstall built-in marketplaces:",
              eA,
            );
          } finally {
            this.isReinstallingBuiltInMarketplaces = !1;
          }
        })));
    }
    async loadMarketplaces(): Promise<any> {
      let eA: any = Date.now(),
        el: any = Date.now(),
        ec: any = await this.marketplaceStorage.getMarketplaces(),
        eu: any = Date.now() - el,
        ed: any = Date.now(),
        ep: any =
          await this.builtInMarketplaceProvider.getBuiltInMarketplaces(),
        eg: any = Date.now() - ed,
        eh: any = new Set(ep.map((eA?: any) => eA.name)),
        ef: any = Date.now(),
        em: any = await this.shouldAutoUpdateThirdPartyMarketplaces(),
        eE: any = Date.now() - ef,
        eC: any = [],
        ey: any = new Map(ep.map((eA?: any) => [eA.name, eA]));
      for (let eA of ec) {
        let el: any = ey.get(eA.name),
          ec: any = !!el || !0 === eA.isBuiltIn,
          eu: any = eA.source;
        el && (eu = this.builtInMarketplaceProvider.toMarketplaceSource(el));
        let ed: any = {
          ...eA,
          type: eu.source,
          source: eu,
          isBuiltIn: ec,
          autoUpdate: ec ? (eA.autoUpdate ?? !0) : em || (eA.autoUpdate ?? !1),
        };
        try {
          let eA: any = MarketplaceFactory.createFromJSON(ed);
          (await eA.loadManifest?.(), eC.push(eA));
        } catch (el: any) {
          this.logger.error(
            `Failed to create marketplace '${eA.name}', skipping:`,
            el,
          );
        }
      }
      let ew: any = new Map(),
        eB: any = [];
      for (let eA of eC) {
        let el: any = ew.get(eA.name);
        if (!el) {
          ew.set(eA.name, eA);
          continue;
        }
        let ec: any = el.isBuiltIn ? el : eA.isBuiltIn ? eA : el,
          eu: any = ec === el ? eA : el;
        (ec !== el && ew.set(eA.name, ec),
          eB.push(eu),
          this.logger.warn(
            `[loadMarketplaces] Duplicate marketplace '${eA.name}' detected. Keeping isBuiltIn=${ec.isBuiltIn} source=${JSON.stringify(ec.source)}; removing storageName=${eu.storageName} source=${JSON.stringify(eu.source)}.`,
          ));
      }
      eB.length > 0 &&
        this.cleanupDuplicateMarketplaces(eB).catch((eA?: any) => {
          this.logger.warn(
            `[loadMarketplaces] cleanupDuplicateMarketplaces failed: ${eA}`,
          );
        });
      let e_: any = Array.from(ew.values()).sort((eA?: any, el?: any) =>
        eA.isBuiltIn && !el.isBuiltIn
          ? -1
          : !eA.isBuiltIn && el.isBuiltIn
            ? 1
            : eA.name.localeCompare(el.name),
      );
      ((this.marketplaceCache = e_),
        this.logger.info(
          `Loaded ${this.marketplaceCache.length} marketplaces (${eh.size} built-in) total=${Date.now() - eA}ms storage=${eu}ms builtIn=${eg}ms autoUpdate=${eE}ms`,
        ));
    }
    getMarketplaceAutoUpdateIntervalMs(): any {
      let eA: any = process.env[rx];
      if (void 0 !== eA) {
        let el: any = Number(eA);
        if (Number.isFinite(el) && el > 0) return el;
        this.logger.warn(`Invalid ${rx} value: ${eA}, falling back to default`);
      }
      return rM;
    }
    shouldAutoUpdate(eA?: any): any {
      if (!0 !== eA.autoUpdate) return !1;
      if (!eA.lastUpdated) return !0;
      let el: any = new Date(eA.lastUpdated).getTime();
      return Date.now() - el > this.getMarketplaceAutoUpdateIntervalMs();
    }
    async autoUpdateMarketplaces(): Promise<any> {
      try {
        this.logger.info("Starting auto-update check for marketplaces");
        let eA: any = (await this.listMarketplace()).filter((eA?: any) =>
          this.shouldAutoUpdate(eA),
        );
        if (0 === eA.length)
          return void this.logger.info("No marketplaces need auto-update");
        this.logger.info(
          `Found ${eA.length} marketplace(s) to auto-update: ${eA.map((eA?: any) => eA.name).join(", ")}`,
        );
        let el: any = [],
          ec: any = [];
        for (
          let eu: any = 0;
          eu < eA.length;
          eu += t$.CONCURRENT_MARKETPLACE_UPDATE_LIMIT
        ) {
          let ed: any = eA.slice(
            eu,
            eu + t$.CONCURRENT_MARKETPLACE_UPDATE_LIMIT,
          );
          (
            await Promise.allSettled(
              ed.map(
                async (eA?: any) => (
                  this.logger.info(`Auto-updating marketplace: ${eA.name}`),
                  await this.updateMarketplace(eA.name, {
                    skipDependencyResolution: !0,
                    force: !0,
                  }),
                  eA.name
                ),
              ),
            )
          ).forEach((eA?: any, eu?: any) => {
            let ep: any = ed[eu];
            if ("fulfilled" === eA.status)
              (el.push(ep.name),
                this.logger.info(
                  `Successfully auto-updated marketplace: ${ep.name}`,
                ));
            else {
              let el: any =
                eA.reason instanceof Error
                  ? eA.reason.message
                  : String(eA.reason);
              (ec.push({ name: ep.name, error: el }),
                this.logger.error(
                  `Failed to auto-update marketplace ${ep.name}: ${el}`,
                ));
            }
          });
        }
        (el.length > 0 &&
          (this.logger.info(
            `Auto-update completed: ${el.length} marketplace(s) updated successfully`,
          ),
          await this.retryPendingManagedPolicies(),
          await this.repairEnabledPlugins()),
          ec.length > 0 &&
            this.logger.warn(
              `Auto-update failed for ${ec.length} marketplace(s)`,
            ),
          this.logger.info("Auto-update check completed"));
      } catch (eA: any) {
        this.logger.error(`Failed to run auto-update for marketplaces: ${eA}`);
      }
    }
    async addMarketplace(eA?: any, el?: any): Promise<any> {
      try {
        let eu: any = el?.onProgress;
        (this.logger.info(`Adding marketplace from source: ${eA}`),
          eu?.("Parsing marketplace source..."));
        let ed: any = await this.findMarketplaceBySource(eA);
        if (ed)
          return (
            this.logger.info(
              `[addMarketplace] Marketplace already exists by source (storageName=${ed.storageName}, name=${ed.name})`,
            ),
            (ed._alreadyExists = !0),
            this.initializationComplete &&
              !el?.skipDependencyResolution &&
              (await this.repairEnabledPlugins()),
            ed
          );
        let ep: any = await this.parseSource(eA);
        eu?.("Marketplace source parsed successfully");
        let eg: any = el?.name || "";
        if (eg && !el?.bypassNameValidation) {
          let { isBlockedOfficialName: el, validateOfficialNameSource: eu } =
            await Promise.resolve().then(ec.bind(ec, 13423));
          if (el(eg))
            throw Error(
              `Marketplace name "${eg}" is not allowed: it resembles an official marketplace name. Please choose a different name.`,
            );
          if (!eu(eg, eA))
            throw Error(
              `Marketplace name "${eg}" is reserved for official use and can only be registered from trusted sources.`,
            );
        }
        eu?.("Marketplace source parsed successfully");
        let eh: any = await this.gitFallbackCoordinator.maybeFallback(
          ep,
          el?.name,
        );
        eu?.("Creating marketplace instance...");
        let ef: any = {
            name: el?.name || "temp",
            type: eh.source,
            source: eh,
            installLocation:
              (eh.source === t$.MarketplaceType.Directory && eh.path) || "",
          },
          em: any = MarketplaceFactory.createFromJSON(ef);
        (eu?.("Installing marketplace content..."),
          await em.install(eu),
          eu?.("Marketplace content installed successfully"));
        let eE: any = await this.readMarketplaceManifestName(
          em.installLocation,
        );
        eu?.("Validating marketplace and loading plugins...");
        let eC: any = await em.listPlugins();
        (this.logger.info(`Found ${eC.length} plugins in marketplace`),
          eu?.(`Found ${eC.length} plugins in marketplace`));
        let ey: any = el?.name || em.name || this.generateMarketplaceName(eA);
        if (
          (eu?.("Checking for existing marketplace..."),
          await this.marketplaceStorage.isMarketplaceInstalled(ey))
        ) {
          this.logger.info(
            `[addMarketplace] Marketplace already exists by storageName: ${ey}`,
          );
          let eA: any = await this.getMarketplace(ey);
          if (eA)
            return (
              (eA._alreadyExists = !0),
              this.initializationComplete &&
                !el?.skipDependencyResolution &&
                (await this.repairEnabledPlugins()),
              eA
            );
          throw Error(`Marketplace ${ey} already exists`);
        }
        if (
          eE &&
          eE !== ey &&
          (await this.marketplaceStorage.isMarketplaceInstalled(eE))
        )
          throw Error(
            `Marketplace manifest name "${eE}" conflicts with an existing marketplace. Please rename the marketplace or remove the existing one first.`,
          );
        eu?.("Creating marketplace configuration...");
        let ew: any = {
          name: ey,
          type: eh.source,
          source: eh,
          installLocation: em.installLocation,
          description: `Marketplace from ${eA}`,
          lastUpdated: new Date().toISOString(),
          autoUpdate: el?.autoUpdate ?? !1,
        };
        (eu?.("Saving marketplace configuration..."),
          await this.marketplaceStorage.saveMarketplace(ew),
          eu?.("Updating cache and finalizing..."),
          (this.marketplaceCache = void 0),
          this.clearAllCaches(),
          await this.retryPendingManagedPolicies(),
          this.onDidChangeEmitter.fire(),
          this.logger.info(`Marketplace ${ey} added successfully`),
          eu?.(`Marketplace '${ey}' added successfully`));
        let eB: any = MarketplaceFactory.createFromJSON(ew);
        return (
          this.pluginTelemetryService.reportMarketplaceAction({
            marketplace: eB,
            action: "add",
            actionSuccessful: !0,
          }),
          this.initializationComplete &&
            !el?.skipDependencyResolution &&
            (await this.repairEnabledPlugins()),
          eB
        );
      } catch (eu: any) {
        this.logger.error(`Failed to add marketplace: ${eu}`);
        let ec: any = el?.name || eA;
        throw (
          this.errorCollector.addError({
            type: t$.PluginErrorType.MarketplaceInstallFailed,
            source: ec,
            marketplaceName: ec,
            message: `Failed to add marketplace from ${eA}`,
            details: eu instanceof Error ? eu.message : String(eu),
          }),
          this.pluginTelemetryService.reportMarketplaceAction({
            marketplaceName: ec,
            marketplaceSource: eA,
            action: "add",
            actionSuccessful: !1,
            errorCode: t$.PluginErrorType.MarketplaceInstallFailed,
            errorMessage: eu instanceof Error ? eu.message : String(eu),
          }),
          eu
        );
      }
    }
    async removeMarketplace(eA?: any): Promise<any> {
      let el: any;
      try {
        if (
          (this.logger.info(`Removing marketplace: ${eA}`),
          !(el = await this.getMarketplace(eA)))
        )
          throw Error(`Marketplace ${eA} not found`);
        (await this.builtInMarketplaceProvider.isBuiltInMarketplace(eA)) &&
          this.logger.warn(
            `Marketplace '${eA}' is a built-in marketplace. It will be reinstalled on next startup.`,
          );
        let ec: any = (await this.getInstalledPlugins()).filter(
          (el?: any) => el.marketplaceName === eA,
        );
        if (ec.length > 0) {
          this.logger.info(
            `Uninstalling ${ec.length} plugin(s) from marketplace ${eA}`,
          );
          let el: any = ec.map((eA?: any) => eA.name);
          try {
            (await this.uninstallPlugins(el, eA),
              this.logger.info(`Uninstalled plugins: ${el.join(",")}`));
          } catch (eA: any) {
            this.logger.warn(
              `Failed to uninstall plugins: ${el.join(",")}: ${eA}`,
            );
          }
        }
        (await this.marketplaceStorage.removeMarketplace(el.storageName || eA),
          (this.marketplaceCache = void 0),
          this.clearAllCaches(),
          this.onDidChangeEmitter.fire(),
          this.logger.info(`Marketplace ${eA} removed successfully`),
          this.pluginTelemetryService.reportMarketplaceAction({
            marketplace: el,
            action: "remove",
            actionSuccessful: !0,
          }));
      } catch (ec: any) {
        throw (
          this.logger.error(`Failed to remove marketplace: ${ec}`),
          this.errorCollector.addError({
            type: t$.PluginErrorType.MarketplaceRemoveFailed,
            marketplaceName: eA,
            message: `Failed to remove marketplace '${eA}'`,
            details: ec instanceof Error ? ec.message : String(ec),
          }),
          this.pluginTelemetryService.reportMarketplaceAction({
            marketplace: el,
            marketplaceName: eA,
            action: "remove",
            actionSuccessful: !1,
            errorCode: t$.PluginErrorType.MarketplaceRemoveFailed,
            errorMessage: ec instanceof Error ? ec.message : String(ec),
          }),
          ec
        );
      }
    }
    async updateMarketplace(eA?: any, el?: any): Promise<any> {
      let ec: any,
        eu: any = [];
      try {
        let ed: any = el?.onProgress;
        (this.logger.info(`Updating marketplace from source: ${eA}`),
          ed?.("Checking marketplace existence..."));
        let ep: any =
          await this.builtInMarketplaceProvider.isBuiltInMarketplace(eA);
        if (
          (ep && (this.marketplaceCache = void 0),
          (ec = await this.getMarketplace(eA)) ||
            !ep ||
            (this.logger.warn(
              `[updateMarketplace] Built-in marketplace '${eA}' is not yet installed, attempting first-install before update...`,
            ),
            ed?.(`First-install built-in marketplace '${eA}'...`),
            await this.installBuiltInMarketplaces(),
            (this.marketplaceCache = void 0),
            (ec = await this.getMarketplace(eA))),
          !ec)
        )
          throw Error(`Marketplace ${eA} does not exist`);
        ((eu = (await this.getInstalledPlugins())
          .filter((el?: any) => el.marketplaceName === eA && !!el.installedPath)
          .map((eA?: any) => eA.name)),
          el?.force &&
            ec.installLocation &&
            (ed?.("Invalidating local cache for forced update..."),
            await this.marketplaceUpdateChecker.invalidateCache(
              eA,
              ec.installLocation,
            )),
          ed?.("Updating marketplace content..."),
          await ec.update(ed),
          this.clearMarketplacePluginCaches(ec));
        try {
          await ec.loadManifest();
        } catch (el: any) {
          this.logger.warn(
            `[updateMarketplace] Failed to refresh manifest for '${eA}' after update: ${el}`,
          );
        }
        let eg: any = { ...ec, lastUpdated: new Date().toISOString() };
        return (
          await this.marketplaceStorage.saveMarketplace(eg),
          (this.marketplaceCache = void 0),
          this.clearAllCaches(),
          await this.refreshInstalledPluginsAfterMarketplaceUpdate(eA, eu),
          this.logger.info(`Marketplace ${eA} updated successfully`),
          ed?.(`Marketplace '${eA}' updated successfully`),
          this.pluginTelemetryService.reportMarketplaceAction({
            marketplace: ec,
            action: "refresh",
            actionSuccessful: !0,
          }),
          this.initializationComplete &&
            !el?.skipDependencyResolution &&
            (await this.repairEnabledPlugins()),
          ec
        );
      } catch (el: any) {
        throw (
          this.logger.error(`Failed to update marketplace: ${el}`),
          this.errorCollector.addError({
            type: t$.PluginErrorType.MarketplaceUpdateFailed,
            marketplaceName: eA,
            message: `Failed to update marketplace '${eA}'`,
            details: el instanceof Error ? el.message : String(el),
          }),
          this.pluginTelemetryService.reportMarketplaceAction({
            marketplace: ec,
            marketplaceName: eA,
            action: "refresh",
            actionSuccessful: !1,
            errorCode: t$.PluginErrorType.MarketplaceUpdateFailed,
            errorMessage: el instanceof Error ? el.message : String(el),
          }),
          el
        );
      }
    }
    async listMarketplace(): Promise<any> {
      return (
        this.marketplaceCache || (await this.loadMarketplaces()),
        this.marketplaceCache || []
      );
    }
    async getMarketplace(eA?: any): Promise<any> {
      return (await this.listMarketplace()).find(
        (el?: any) => el.name === eA || el.storageName === eA,
      );
    }
    async setMarketplaceAutoUpdate(eA?: any, el?: any): Promise<any> {
      try {
        this.logger.info(`Setting auto-update for marketplace ${eA} to ${el}`);
        let ec: any = await this.getMarketplace(eA);
        if (!ec) throw Error(`Marketplace ${eA} not found`);
        let eu: any = { ...ec, autoUpdate: el };
        (await this.marketplaceStorage.saveMarketplace(eu),
          (this.marketplaceCache = void 0),
          this.clearAllCaches(),
          this.onDidChangeEmitter.fire(),
          this.logger.info(
            `Successfully set auto-update for marketplace ${eA} to ${el}`,
          ));
      } catch (el: any) {
        throw (
          this.logger.error(
            `Failed to set auto-update for marketplace ${eA}: ${el}`,
          ),
          this.errorCollector.addError({
            type: t$.PluginErrorType.MarketplaceConfigSaveFailed,
            operation: "save",
            marketplaceName: eA,
            message: `Failed to set auto-update for marketplace '${eA}'`,
            details: el instanceof Error ? el.message : String(el),
          }),
          el
        );
      }
    }
    async getPlugins(eA?: any): Promise<any> {
      try {
        let el: any = await this.getMarketplace(eA);
        if (!el) throw Error(`Marketplace ${eA} not found`);
        let ec: any = await this.listMarketplacePlugins(el),
          eu: any = await this.getInstalledPlugins(),
          ed: any = new Map(
            eu.map((eA?: any) => [`${eA.name}@${eA.marketplaceName}`, eA]),
          );
        for (let eA of ec) {
          let el: any = ed.get(`${eA.name}@${eA.marketplaceName}`);
          el
            ? ((eA.status = el.status), (eA.installedPath = el.installedPath))
            : (eA.installedPath = void 0);
        }
        return ec;
      } catch (el: any) {
        throw (
          this.logger.error(
            `Failed to get plugins from marketplace ${eA}: ${el}`,
          ),
          this.errorCollector.addError({
            type: t$.PluginErrorType.MarketplaceLoadFailed,
            marketplace: eA,
            reason: el instanceof Error ? el.message : String(el),
          }),
          el
        );
      }
    }
    getMarketplacePluginsCacheKey(eA?: any): any {
      return eA.storageName || eA.name;
    }
    clearMarketplacePluginCaches(eA?: any): any {
      let el: any = this.getMarketplacePluginsCacheKey(eA);
      (this.marketplacePluginsCache?.delete(el),
        this.marketplacePluginsCacheMtime?.delete(el),
        this.marketplacePluginsLoading?.delete(el),
        eA.clearPluginListCache?.());
    }
    async getMarketplaceManifestMtimeMs(eA?: any): Promise<any> {
      let el: any = eA.installLocation;
      if (!el) return 0;
      for (let eA of t$.PLUGINS_METADATA_DIRS) {
        let ec: any = tX.join(el, eA, t$.MARKETPLACE_MANIFEST_FILE);
        try {
          return (await tZ.stat(ec)).mtimeMs;
        } catch {}
      }
      return 0;
    }
    marketplaceNeedsRemoteSync(eA?: any): any {
      return (
        eA.type === t$.MarketplaceType.Git ||
        eA.type === t$.MarketplaceType.Github ||
        eA.type === t$.MarketplaceType.Zip ||
        eA.type === t$.MarketplaceType.URL
      );
    }
    clonePluginInfo(eA?: any): any {
      return { ...eA };
    }
    clonePluginInfos(eA?: any): any {
      return eA.map((eA?: any) => this.clonePluginInfo(eA));
    }
    async listMarketplacePlugins(eA?: any): Promise<any> {
      if (
        (this.marketplacePluginsCache ||
          (this.marketplacePluginsCache = new Map()),
        this.marketplacePluginsLoading ||
          (this.marketplacePluginsLoading = new Map()),
        this.marketplacePluginsCacheMtime ||
          (this.marketplacePluginsCacheMtime = new Map()),
        "function" != typeof eA.listPlugins)
      )
        return [];
      let el: any = this.getMarketplacePluginsCacheKey(eA),
        ec: any = await this.getMarketplaceManifestMtimeMs(eA),
        eu: any = this.marketplacePluginsCacheMtime.get(el);
      ec > 0 &&
        void 0 !== eu &&
        ec > eu &&
        (this.marketplacePluginsCache.delete(el),
        this.marketplacePluginsCacheMtime.delete(el),
        eA.clearPluginListCache?.());
      let ed: any = this.marketplacePluginsCache.get(el);
      if (ed) return this.clonePluginInfos(ed);
      let ep: any = this.marketplacePluginsLoading.get(el);
      if (ep) {
        let eA: any = await ep;
        return this.clonePluginInfos(eA);
      }
      let eg: any = this.cacheGeneration,
        eh: any = (async () => {
          let eu: any = Date.now(),
            ed: any = await eA.listPlugins(),
            ep: any = Date.now() - eu;
          return (
            ep > 1e3 &&
              this.logger.warn(
                `[PluginManager] slow listPlugins ${eA.name} = ${ep}ms`,
              ),
            eg === this.cacheGeneration &&
              (this.marketplacePluginsCache.set(el, ed),
              this.marketplacePluginsCacheMtime.set(el, ec)),
            ed
          );
        })();
      this.marketplacePluginsLoading.set(el, eh);
      try {
        let eA: any = await eh;
        return this.clonePluginInfos(eA);
      } finally {
        this.marketplacePluginsLoading.get(el) === eh &&
          this.marketplacePluginsLoading.delete(el);
      }
    }
    getPluginId(eA?: any, el?: any): any {
      return `${eA}@${el}`;
    }
    getHomePluginsDir(): any {
      return t5.PathUtils.getHomePluginsDir();
    }
    getInstalledPluginsRegistryPath(): any {
      return tX.join(this.getHomePluginsDir(), t$.INSTALLED_PLUGINS_FILE_NAME);
    }
    getInstalledPluginsRegistryLockName(): any {
      let eA: any = (0, AP.createHash)("sha256")
        .update(tX.resolve(this.getInstalledPluginsRegistryPath()))
        .digest("hex")
        .slice(0, 16);
      return `${rS}-${eA}`;
    }
    createEmptyInstalledPluginsRegistry(): any {
      return { version: 2, plugins: {} };
    }
    normalizeInstalledPluginsRegistry(eA?: any): any {
      let el: any = this.createEmptyInstalledPluginsRegistry(),
        ec: any = Array.isArray(eA)
          ? eA
          : eA && "object" == typeof eA && "plugins" in eA
            ? eA.plugins
            : void 0;
      if (Array.isArray(ec)) {
        for (let eA of ec) this.addNormalizedInstalledPluginRecord(el, eA);
        return el;
      }
      if (ec && "object" == typeof ec)
        for (let [eA, eu] of Object.entries(ec))
          for (let ec of Array.isArray(eu) ? eu : [eu])
            this.addNormalizedInstalledPluginRecord(el, {
              pluginId: eA,
              ...ec,
            });
      return el;
    }
    addNormalizedInstalledPluginRecord(eA?: any, el?: any): any {
      if (!el || "object" != typeof el) return;
      let ec: any = el,
        eu: any =
          "string" == typeof ec.pluginId
            ? ec.pluginId
            : "string" == typeof ec.name &&
                "string" == typeof ec.marketplaceName
              ? this.getPluginId(ec.name, ec.marketplaceName)
              : void 0,
        ed: any = eu?.indexOf("@") ?? -1;
      if (!eu || ed <= 0 || ed === eu.length - 1) return;
      let ep: any =
        "string" == typeof ec.installPath
          ? ec.installPath
          : "string" == typeof ec.path
            ? ec.path
            : void 0;
      if (!ep) return;
      let eg: any = el.scope,
        eh: any = eg === A_.SettingsScope.PROJECT_LOCAL ? "local" : eg,
        ef: any =
          "string" == typeof ec.tag ? ec.tag.match(/--v(.+)$/)?.[1] : void 0,
        em: any = {
          scope: ["managed", "user", "project", "local"].includes(String(eh))
            ? eh
            : "user",
          projectPath:
            "string" == typeof ec.projectPath ? ec.projectPath : void 0,
          installPath: ep,
          version:
            "string" == typeof ec.version && ec.version.length > 0
              ? ec.version
              : "unknown",
          resolvedVersion:
            "string" == typeof ec.resolvedVersion ? ec.resolvedVersion : ef,
          gitCommitSha:
            "string" == typeof ec.gitCommitSha ? ec.gitCommitSha : void 0,
          auto:
            "boolean" == typeof ec.auto
              ? ec.auto
              : "boolean" == typeof ec.autoInstalled
                ? ec.autoInstalled
                : void 0,
          workbuddySeedManaged:
            "boolean" == typeof ec.workbuddySeedManaged
              ? ec.workbuddySeedManaged
              : void 0,
          installedAt:
            "string" == typeof ec.installedAt
              ? ec.installedAt
              : new Date(0).toISOString(),
          lastUpdated:
            "string" == typeof ec.lastUpdated
              ? ec.lastUpdated
              : "string" == typeof ec.updatedAt
                ? ec.updatedAt
                : new Date(0).toISOString(),
        },
        eE: any = eA.plugins[eu] || [];
      (eE.push(em), (eA.plugins[eu] = eE));
    }
    async readInstalledPluginsRegistry(): Promise<any> {
      if (this.installedPluginsRegistryCache)
        return this.installedPluginsRegistryCache;
      if (this.installedPluginsRegistryLoading)
        return this.installedPluginsRegistryLoading;
      let eA: any = this.loadInstalledPluginsRegistryFromDisk();
      this.installedPluginsRegistryLoading = eA;
      try {
        return await eA;
      } finally {
        this.installedPluginsRegistryLoading === eA &&
          (this.installedPluginsRegistryLoading = void 0);
      }
    }
    async loadInstalledPluginsRegistryFromDisk(): Promise<any> {
      let eA: any = this.getInstalledPluginsRegistryPath();
      try {
        if (
          (await this.migrateLegacyInstalledPluginsRegistry(eA),
          !(await tZ.pathExists(eA)))
        )
          return (
            (this.installedPluginsRegistryCache =
              this.createEmptyInstalledPluginsRegistry()),
            this.installedPluginsRegistryCache
          );
        return (
          (this.installedPluginsRegistryCache =
            this.normalizeInstalledPluginsRegistry(await tZ.readJSON(eA))),
          this.installedPluginsRegistryCache
        );
      } catch (eA: any) {
        return (
          this.logger.warn(
            `Failed to load ${t$.INSTALLED_PLUGINS_FILE_NAME}: ${eA}`,
          ),
          (this.installedPluginsRegistryCache =
            this.createEmptyInstalledPluginsRegistry()),
          this.installedPluginsRegistryCache
        );
      }
    }
    async migrateLegacyInstalledPluginsRegistry(eA?: any): Promise<any> {
      let el: any = tX.join(this.getHomePluginsDir(), rQ);
      if (await tZ.pathExists(eA)) {
        (await tZ.pathExists(el)) && (await tZ.remove(el));
        return;
      }
      if (await tZ.pathExists(el)) {
        await tZ.ensureDir(tX.dirname(eA));
        try {
          (await tZ.rename(el, eA),
            this.logger.info(
              `Migrated ${rQ} to ${t$.INSTALLED_PLUGINS_FILE_NAME}`,
            ));
        } catch (eu: any) {
          let ec: any = eu?.code;
          if ("ENOENT" === ec && (await tZ.pathExists(eA))) return;
          if ("EEXIST" !== ec) throw eu;
          await tZ.remove(el);
        }
      }
    }
    async writeInstalledPluginsRegistry(eA?: any): Promise<any> {
      let el: any = this.getInstalledPluginsRegistryPath();
      await tZ.ensureDir(tX.dirname(el));
      let ec: any = `${el}.tmp.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`;
      try {
        (await tZ.writeFile(ec, JSON.stringify(eA, null, 2), "utf-8"),
          await this.renameInstalledPluginsRegistry(ec, el));
      } catch (eA: any) {
        throw (await tZ.remove(ec).catch(() => void 0), eA);
      }
      ((this.installedPluginsRegistryCache =
        this.cloneInstalledPluginsRegistry(eA)),
        (this.installedPluginsRegistryLoading = void 0));
    }
    async renameInstalledPluginsRegistry(eA?: any, el?: any): Promise<any> {
      let ec: any;
      for (let eu: any = 0; eu < 5; eu++)
        try {
          await tZ.rename(eA, el);
          return;
        } catch (eA: any) {
          if (
            ((ec = eA),
            !["EBUSY", "EPERM", "EACCES"].includes(eA?.code || "") || 4 === eu)
          )
            break;
          await new Promise((eA?: any) => setTimeout(eA, 50 * 2 ** eu));
        }
      throw ec;
    }
    async mutateInstalledPluginsRegistry(eA?: any): Promise<any> {
      let el: any,
        ec: any,
        eu: any = this.installedPluginsRegistryWriteLock || Promise.resolve();
      ((this.installedPluginsRegistryWriteLock = new Promise((eA?: any) => {
        el = eA;
      })),
        await eu.catch(() => void 0));
      try {
        ((ec = await this.fileLockService.acquireFileLock(
          this.getInstalledPluginsRegistryLockName(),
          rD,
        )),
          (this.installedPluginsRegistryCache = void 0));
        let el: any = this.cloneInstalledPluginsRegistry(
            await this.loadInstalledPluginsRegistryFromDisk(),
          ),
          eu: any = await eA(el);
        if (!1 === eu) return !1;
        return (await this.writeInstalledPluginsRegistry(el), !0);
      } finally {
        (await ec?.().catch((eA?: any) => {
          this.logger.warn(
            `Failed to release ${t$.INSTALLED_PLUGINS_FILE_NAME} lock: ${eA}`,
          );
        }),
          el());
      }
    }
    cloneInstalledPluginsRegistry(eA?: any): any {
      return {
        version: eA.version,
        plugins: Object.fromEntries(
          Object.entries(eA.plugins).map(([eA, el]: any) => [
            eA,
            el.map((eA?: any) => ({ ...eA })),
          ]),
        ),
      };
    }
    sanitizeCacheSegment(eA?: any, el?: any): any {
      let ec: any = eA || "unknown",
        eu: any =
          "version" === el
            ? ec.replace(/[^a-zA-Z0-9\-_.]/g, "-")
            : ec.replace(/[^a-zA-Z0-9\-_]/g, "-");
      return "." === eu || ".." === eu ? "-" : eu || "unknown";
    }
    sanitizeBuiltinSeedCacheSegment(eA?: any): any {
      let el: any = (eA || "unknown").replace(/[^a-zA-Z0-9._+-]/g, "_");
      return "." === el || ".." === el ? "-" : el || "unknown";
    }
    getBuiltinSeedPluginCachePath(eA?: any, el?: any, ec?: any): any {
      let eu: any = tX.join(this.getHomePluginsDir(), t$.PLUGIN_CACHE_DIR),
        ed: any = tX.join(
          eu,
          this.sanitizeBuiltinSeedCacheSegment(el),
          this.sanitizeBuiltinSeedCacheSegment(eA),
          this.sanitizeBuiltinSeedCacheSegment(ec),
        );
      return (
        this.assertPathInside(eu, ed, "builtin seed plugin cache path"),
        ed
      );
    }
    getBuiltinSeedPluginCacheRoot(eA?: any, el?: any): any {
      let ec: any = tX.join(this.getHomePluginsDir(), t$.PLUGIN_CACHE_DIR),
        eu: any = tX.join(
          ec,
          this.sanitizeBuiltinSeedCacheSegment(el),
          this.sanitizeBuiltinSeedCacheSegment(eA),
        );
      return (
        this.assertPathInside(ec, eu, "builtin seed plugin cache root"),
        eu
      );
    }
    getPluginCachePath(eA?: any, el?: any, ec?: any): any {
      let eu: any = tX.join(this.getHomePluginsDir(), t$.PLUGIN_CACHE_DIR),
        ed: any = tX.join(
          eu,
          this.sanitizeCacheSegment(el, "name"),
          this.sanitizeCacheSegment(eA, "name"),
          this.sanitizeCacheSegment(ec, "version"),
        );
      return (this.assertPathInside(eu, ed, "plugin cache path"), ed);
    }
    getPluginCacheRoot(eA?: any, el?: any): any {
      let ec: any = tX.join(this.getHomePluginsDir(), t$.PLUGIN_CACHE_DIR),
        eu: any = tX.join(
          ec,
          this.sanitizeCacheSegment(el, "name"),
          this.sanitizeCacheSegment(eA, "name"),
        );
      return (this.assertPathInside(ec, eu, "plugin cache root"), eu);
    }
    assertPathInside(eA?: any, el?: any, ec?: any): any {
      if (
        !this.isPathInside(tX.resolve(eA), tX.resolve(el)) ||
        tX.resolve(eA) === tX.resolve(el)
      )
        throw Error(`Invalid ${ec}: ${el} escapes ${eA}`);
    }
    async findPluginManifestPath(eA?: any): Promise<any> {
      for (let el of t$.PLUGINS_METADATA_DIRS) {
        let ec: any = tX.join(eA, el, t$.PLUGIN_MANIFEST_FILE);
        if (await tZ.pathExists(ec)) return ec;
      }
    }
    async readPluginManifest(eA?: any): Promise<any> {
      let el: any = await this.findPluginManifestPath(eA);
      if (el)
        try {
          return await tZ.readJSON(el);
        } catch (eA: any) {
          this.logger.warn(`Failed to read plugin manifest at ${el}: ${eA}`);
          return;
        }
    }
    async resolvePluginCacheIdentity(
      eA?: any,
      el?: any,
      ec?: any,
      eu?: any,
    ): Promise<any> {
      let ed: any = await this.readPluginManifest(el),
        ep: any = ed?.version || eA.version,
        eg: any = ec?.resolvedVersion,
        eh: any = ec?.gitCommitSha || (await this.resolveGitCommitSha(el)),
        ef: any =
          "string" == typeof eA.source ||
          eA.source.source === t$.PluginSourceType.Local;
      !eh &&
        ef &&
        eu &&
        tX.resolve(eu) !== tX.resolve(el) &&
        (eh = await this.resolveGitCommitSha(eu));
      let em: any = ep;
      if (!em && eh) {
        let el: any = eh.slice(0, 12);
        if (
          "string" != typeof eA.source &&
          eA.source.source === t$.PluginSourceType.GitSubdir
        ) {
          let ec: any = (eA.source.path || eA.source.subdir || "")
              .replace(/\\/g, "/")
              .replace(/^\.\//, "")
              .replace(/\/+$/, ""),
            eu: any = (0, AP.createHash)("sha256")
              .update(ec)
              .digest("hex")
              .slice(0, 8);
          em = `${el}-${eu}`;
        } else em = el;
      }
      em || (em = eg || "unknown");
      let eE: any = eg && ep && eh ? `${em}-${eh.slice(0, 12)}` : em;
      return {
        cacheSegment: eE,
        version: eE,
        resolvedVersion: eg,
        gitCommitSha: eh,
      };
    }
    async resolveGitCommitSha(eA?: any): Promise<any> {
      try {
        let el: any = await this.runGit(["rev-parse", "HEAD"], eA);
        return /^[0-9a-f]{40}$/i.test(el) ? el.toLowerCase() : void 0;
      } catch {
        return;
      }
    }
    async materializePluginCache(
      eA?: any,
      el?: any,
      ec?: any,
      eu?: any,
    ): Promise<any> {
      let ed: any = await this.resolvePluginCacheIdentity(eA, el, ec, eu),
        ep: any = this.getPluginCachePath(
          eA.name,
          eA.marketplaceName,
          ed.cacheSegment,
        );
      return (
        tX.resolve(el) !== tX.resolve(ep) &&
          (await this.replacePluginCacheAtomically(el, ep, eu)),
        await this.recordInstalledPlugin(eA, ep, ed.version, {
          ...ec,
          resolvedVersion: ed.resolvedVersion,
          gitCommitSha: ed.gitCommitSha,
        }),
        ep
      );
    }
    async replacePluginCacheAtomically(
      eA?: any,
      el?: any,
      ec?: any,
    ): Promise<any> {
      let eu: any = tX.dirname(el),
        ed: any = `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ep: any = tX.join(eu, `.staging-${ed}`),
        eg: any = tX.join(eu, `.backup-${ed}`),
        eh: any = !1;
      await tZ.ensureDir(eu);
      try {
        (await this.copyPluginToCache(eA, ep, ec),
          (await tZ.pathExists(el)) && (await tZ.rename(el, eg), (eh = !0)));
        try {
          await tZ.rename(ep, el);
        } catch (eA: any) {
          throw (eh && (await tZ.rename(eg, el), (eh = !1)), eA);
        }
        eh && (await tZ.remove(eg), (eh = !1));
      } finally {
        (await tZ.remove(ep).catch(() => void 0),
          eh || (await tZ.remove(eg).catch(() => void 0)));
      }
    }
    isPathInside(eA?: any, el?: any): any {
      let ec: any = tX.relative(eA, el);
      return "" === ec || (!!ec && !ec.startsWith("..") && !tX.isAbsolute(ec));
    }
    async safeRealpath(eA?: any): Promise<any> {
      try {
        return await tZ.realpath(eA);
      } catch {
        return tX.resolve(eA);
      }
    }
    async copyPluginToCache(eA?: any, el?: any, ec?: any): Promise<any> {
      let eu: any = await this.safeRealpath(eA),
        ed: any = ec ? await this.safeRealpath(ec) : eu;
      if (ec && !this.isPathInside(ed, eu))
        throw Error(`Plugin source path escapes marketplace root: ${eA}`);
      let ep: any = new Set(),
        copyEntry: any = async (eA?: any, ec?: any) => {
          if (".git" === tX.basename(eA)) return;
          let eg: any = await tZ.lstat(eA);
          if (eg.isSymbolicLink()) {
            let eg: any = await tZ.readlink(eA),
              eh: any = tX.resolve(tX.dirname(eA), eg),
              ef: any = await this.safeRealpath(eh);
            if (this.isPathInside(eu, ef)) {
              await tZ.ensureDir(tX.dirname(ec));
              let eA: any = tX.join(el, tX.relative(eu, ef)),
                ed: any = tX.relative(tX.dirname(ec), eA) || ".";
              await tZ.symlink(ed, ec);
              return;
            }
            return this.isPathInside(ed, ef)
              ? ep.has(ef) || this.isPathInside(ef, eu)
                ? void this.logger.warn(
                    `Skipping cyclic plugin symlink: ${eA} -> ${eg}`,
                  )
                : void (await copyEntry(ef, ec))
              : void this.logger.warn(
                  `Skipping plugin symlink outside marketplace: ${eA} -> ${eg}`,
                );
          }
          if (eg.isDirectory()) {
            let el: any = await this.safeRealpath(eA);
            if (ep.has(el))
              return void this.logger.warn(
                `Skipping cyclic plugin directory while caching: ${eA}`,
              );
            (ep.add(el), await tZ.ensureDir(ec));
            try {
              for (let el of await tZ.readdir(eA))
                await copyEntry(tX.join(eA, el), tX.join(ec, el));
            } finally {
              ep.delete(el);
            }
            return;
          }
          eg.isFile() &&
            (await tZ.ensureDir(tX.dirname(ec)),
            await tZ.copyFile(eA, ec),
            await tZ.chmod(ec, eg.mode));
        };
      await copyEntry(eu, el);
    }
    async recordInstalledPlugin(
      eA?: any,
      el?: any,
      ec?: any,
      eu?: any,
    ): Promise<any> {
      let ed: any = this.getPluginId(eA.name, eA.marketplaceName);
      await tZ.remove(tX.join(el, rT)).catch(() => void 0);
      let ep: any = new Set(),
        eg: any = new Set();
      (await this.mutateInstalledPluginsRegistry((eA?: any) => {
        let eh: any = new Date().toISOString(),
          ef: any = eu?.scope || A_.SettingsScope.USER,
          em: any = this.toInstalledPluginScope(ef),
          eE: any = eA.plugins[ed] || [],
          eC: any = this.getProjectPathForScope(ef, eu?.workspacePath),
          ey: any =
            eE.find((eA?: any) => eA.scope === em && eA.projectPath === eC) ||
            (eC
              ? eE.find(
                  (eA?: any) => eA.scope === em && void 0 === eA.projectPath,
                )
              : void 0),
          ew: any = eE.filter(
            (eA?: any) =>
              eA.scope !== em ||
              (eA.projectPath !== eC &&
                (void 0 === eC || void 0 !== eA.projectPath)),
          );
        for (let eA of eE)
          ew.includes(eA) || ep.add(tX.resolve(eA.installPath));
        for (let ep of (ew.push({
          scope: em,
          projectPath: eC,
          installPath: el,
          version: ec,
          resolvedVersion: eu?.resolvedVersion,
          gitCommitSha: eu?.gitCommitSha,
          auto: (eu?.autoInstalled === !0 && (!ey || !0 === ey.auto)) || void 0,
          installedAt: ey?.installedAt || eh,
          lastUpdated: eh,
        }),
        (eA.plugins[ed] = ew),
        Object.values(eA.plugins)))
          for (let eA of ep) eg.add(tX.resolve(eA.installPath));
      }),
        await Promise.all(
          Array.from(ep)
            .filter((eA?: any) => !eg.has(eA))
            .map((eA?: any) => this.markPluginCacheOrphaned(eA)),
        ));
    }
    getProjectPathForScope(eA?: any, el?: any): any {
      if (
        eA === A_.SettingsScope.PROJECT ||
        eA === A_.SettingsScope.PROJECT_LOCAL
      )
        return tX.resolve(el || t5.PathUtils.getWorkDir());
    }
    toInstalledPluginScope(eA?: any): any {
      return eA === A_.SettingsScope.PROJECT_LOCAL
        ? "local"
        : eA === A_.SettingsScope.CLI
          ? "user"
          : eA;
    }
    installedRecordMatchesScope(eA?: any, el?: any, ec?: any): any {
      return (
        eA.scope === this.toInstalledPluginScope(el) &&
        (eA.projectPath === ec || (void 0 !== ec && void 0 === eA.projectPath))
      );
    }
    async removeInstalledPluginRecordsForScope(
      eA?: any,
      el?: any,
      ec?: any,
    ): Promise<any> {
      let eu: any = new Set(),
        ed: any = new Set(),
        ep: any = new Set();
      await this.mutateInstalledPluginsRegistry((eg?: any) => {
        for (let ed of eA) {
          let eA: any = eg.plugins[ed] || [],
            eh: any = eA.filter((eA?: any) =>
              this.installedRecordMatchesScope(eA, el, ec),
            ),
            ef: any = eA.filter((eA?: any) => !eh.includes(eA));
          for (let eA of (ef.length > 0
            ? (eg.plugins[ed] = ef)
            : (delete eg.plugins[ed], eh.length > 0 && ep.add(ed)),
          eh))
            eu.add(tX.resolve(eA.installPath));
        }
        for (let eA of Object.values(eg.plugins))
          for (let el of eA) ed.add(tX.resolve(el.installPath));
      });
      let eg: any = Array.from(eu).filter((eA?: any) => !ed.has(eA));
      return (
        await Promise.all(
          eg.map((eA?: any) => this.markPluginCacheOrphaned(eA)),
        ),
        ep
      );
    }
    async cleanupFinalPluginState(eA?: any, el: any = !1): Promise<any> {
      await Promise.all(
        Array.from(eA).map(async (eA?: any) => {
          if (!el)
            try {
              await (0, A5.removePluginDataDirectory)(
                eA,
                this.getHomePluginsDir(),
              );
            } catch (el: any) {
              this.logger.warn(`Failed to remove plugin data for ${eA}: ${el}`);
            }
          if (this.pluginOptionsStorage)
            try {
              await this.pluginOptionsStorage.deleteOptions(eA);
            } catch (el: any) {
              this.logger.warn(
                `Failed to remove plugin options for ${eA}: ${el}`,
              );
            }
        }),
      );
    }
    async markPluginCacheOrphaned(eA?: any): Promise<any> {
      let el: any = tX.resolve(this.getHomePluginsDir(), t$.PLUGIN_CACHE_DIR),
        ec: any = await this.resolveRealPathStrictlyInside(el, eA);
      if (ec)
        try {
          (await tZ.pathExists(ec)) &&
            (await tZ.writeFile(tX.join(ec, rT), String(Date.now()), "utf-8"));
        } catch (el: any) {
          this.logger.warn(`Failed to mark orphaned plugin cache ${eA}: ${el}`);
        }
    }
    isVersionedPluginCachePath(eA?: any): any {
      let el: any = tX.resolve(this.getHomePluginsDir(), t$.PLUGIN_CACHE_DIR),
        ec: any = tX.resolve(eA);
      return ec !== el && this.isPathInside(el, ec);
    }
    async markPluginCachesInUse(eA?: any): Promise<any> {
      let el: any = new Date(Date.now() - 1e3 * process.uptime()).toISOString(),
        ec: any = new Set(
          eA
            .filter(
              (eA?: any) =>
                eA.status === t$.PluginStatus.Enabled &&
                !!eA.installedPath &&
                this.isVersionedPluginCachePath(eA.installedPath),
            )
            .map((eA?: any) => tX.resolve(eA.installedPath)),
        );
      await Promise.all(
        Array.from(ec, async (eA?: any) => {
          let ec: any = tX.join(eA, rR),
            eu: any = tX.join(ec, String(process.pid)),
            ed: any = `${eu}.tmp.${Date.now()}.${Math.random().toString(36).slice(2)}`;
          try {
            (await tZ.ensureDir(ec),
              await tZ.writeJSON(ed, { pid: process.pid, procStart: el }),
              await tZ.rename(ed, eu),
              registerPluginCacheMarkerForExit(eu));
          } catch (el: any) {
            (await tZ.remove(ed).catch(() => void 0),
              this.logger.warn(
                `Failed to write ${rR} marker for ${eA}: ${el}`,
              ));
          }
        }),
      );
    }
    isProcessAlive(eA?: any): any {
      try {
        return (process.kill(eA, 0), !0);
      } catch (eA: any) {
        return eA?.code !== "ESRCH";
      }
    }
    async isSameProcessInstance(eA?: any, el?: any): Promise<any> {
      if (!this.isProcessAlive(eA)) return !1;
      if (!el) return !0;
      let ec: any = Date.parse(el);
      if (!Number.isFinite(ec)) return !0;
      if (eA === process.pid)
        return 2e3 > Math.abs(Date.now() - 1e3 * process.uptime() - ec);
      if ("win32" === process.platform) return !0;
      try {
        let el: any = await (0, t8.default)(
            "ps",
            ["-o", "lstart=", "-p", String(eA)],
            { env: { ...process.env, NODE_OPTIONS: "" } },
          ),
          eu: any = Date.parse(String(el.stdout || "").trim());
        return !Number.isFinite(eu) || 2e3 > Math.abs(eu - ec);
      } catch {
        return !0;
      }
    }
    async isPluginCacheInUse(eA?: any): Promise<any> {
      let el: any,
        ec: any = tX.join(eA, rR);
      try {
        el = await tZ.readdir(ec);
      } catch (eA: any) {
        if (eA?.code === "ENOENT") return !1;
        throw eA;
      }
      let eu: any = !1;
      for (let eA of el) {
        let el: any, ed: any, ep: any;
        if (eA.includes(".tmp.")) {
          eu = !0;
          continue;
        }
        let eg: any = tX.join(ec, eA);
        try {
          el = await tZ.readFile(eg, "utf-8");
        } catch {}
        if ("" === el) {
          eu = !0;
          continue;
        }
        try {
          let eA: any = JSON.parse(el || "{}");
          ((ed = "number" == typeof eA.pid ? eA.pid : void 0),
            (ep =
              "string" == typeof eA.procStart
                ? eA.procStart
                : "string" == typeof eA.processStart
                  ? eA.processStart
                  : void 0));
        } catch {}
        if (void 0 !== ed && (await this.isSameProcessInstance(ed, ep))) {
          eu = !0;
          continue;
        }
        (await tZ.remove(eg).catch(() => void 0), rF.delete(eg));
      }
      return eu;
    }
    async listChildDirectories(eA?: any): Promise<any> {
      try {
        return (await tZ.readdir(eA, { withFileTypes: !0 }))
          .filter((eA?: any) => eA.isDirectory())
          .map((eA?: any) => eA.name);
      } catch {
        return [];
      }
    }
    async removeDirectoryIfEmpty(eA?: any): Promise<any> {
      try {
        0 === (await tZ.readdir(eA)).length && (await tZ.remove(eA));
      } catch {}
    }
    async cleanupOrphanedPluginCache(eA?: any, el?: any): Promise<any> {
      let ec: any,
        eu: any = tX.join(eA, rT);
      try {
        ec = (await tZ.stat(eu)).mtimeMs;
      } catch (el: any) {
        if (el?.code === "ENOENT")
          return void (await this.markPluginCacheOrphaned(eA));
        this.logger.warn(`Failed to stat orphaned marker for ${eA}: ${el}`);
        return;
      }
      if (!(el - ec <= rk)) {
        try {
          if (await this.isPluginCacheInUse(eA))
            return void this.logger.debug(
              `Skipping orphaned plugin cache still used by a live session: ${eA}`,
            );
        } catch (el: any) {
          this.logger.warn(
            `Failed to check live plugin cache users for ${eA}: ${el}`,
          );
          return;
        }
        try {
          (await tZ.remove(eA),
            this.logger.info(`Removed expired orphaned plugin cache: ${eA}`));
        } catch (el: any) {
          this.logger.warn(
            `Failed to remove expired orphaned plugin cache ${eA}: ${el}`,
          );
        }
      }
    }
    async getCurrentBuiltinSeedSnapshotPaths(): Promise<any> {
      let eA: any = new Set();
      for (let el of await this.listMarketplace()) {
        let ec: any;
        if (
          el.type === t$.MarketplaceType.Directory &&
          !0 === el.isBuiltIn &&
          (el.name === rO || el.storageName === rO)
        ) {
          try {
            ec = await el.listPlugins();
          } catch (eA: any) {
            this.logger.warn(
              `Failed to list current builtin seed snapshots for cache cleanup: ${eA}`,
            );
            continue;
          }
          for (let el of ec) {
            let ec: any = el.version?.trim();
            if (!ec) continue;
            let eu: any = this.getBuiltinSeedPluginCacheRoot(el.name, rO),
              ed: any = this.getBuiltinSeedPluginCachePath(el.name, rO, ec);
            (await this.isValidBuiltinSeedCacheDirectory(
              ed,
              eu,
              el.name,
              ec,
            )) && eA.add(tX.resolve(ed));
          }
        }
      }
      return eA;
    }
    async cleanupPluginCache(): Promise<any> {
      try {
        let eA: any = tX.resolve(this.getHomePluginsDir(), t$.PLUGIN_CACHE_DIR),
          el: any = await this.readInstalledPluginsRegistry(),
          ec: any = new Set();
        for (let eA of Object.values(el.plugins))
          for (let el of eA)
            this.isVersionedPluginCachePath(el.installPath) &&
              ec.add(tX.resolve(el.installPath));
        for (let eA of await this.getCurrentBuiltinSeedSnapshotPaths())
          ec.add(eA);
        await Promise.all(
          Array.from(ec, (eA?: any) =>
            tZ.remove(tX.join(eA, rT)).catch((el?: any) => {
              this.logger.warn(
                `Failed to remove orphaned marker for ${eA}: ${el}`,
              );
            }),
          ),
        );
        let eu: any = Date.now();
        for (let el of await this.listChildDirectories(eA)) {
          let ed: any = tX.join(eA, el);
          for (let eA of await this.listChildDirectories(ed)) {
            let el: any = tX.join(ed, eA);
            for (let eA of await this.listChildDirectories(el)) {
              let ed: any = tX.resolve(el, eA);
              ec.has(ed) || (await this.cleanupOrphanedPluginCache(ed, eu));
            }
            await this.removeDirectoryIfEmpty(el);
          }
          await this.removeDirectoryIfEmpty(ed);
        }
      } catch (eA: any) {
        this.logger.warn(`Plugin cache cleanup failed: ${eA}`);
      }
    }
    versionSatisfiesRange(eA?: any, el?: any): any {
      if (!el) return !0;
      let ec: any = (0, AL.validRange)(el),
        eu: any = this.getNormalizedSemver(eA);
      return !!ec && !!eu && (0, AL.satisfies)(eu, ec);
    }
    chooseHighestVersion(eA?: any, el?: any): any {
      let ec: any = new Map();
      for (let el of eA) {
        let eA: any = this.getNormalizedSemver(el);
        eA && ec.set(eA, el);
      }
      if (0 === ec.size) return eA.sort().at(-1);
      let eu: any = el
        ? (0, AL.maxSatisfying)(Array.from(ec.keys()), el)
        : (0, AL.maxSatisfying)(Array.from(ec.keys()), "*");
      return eu ? ec.get(eu) : void 0;
    }
    async findCachedPluginByDirectory(eA?: any, el?: any): Promise<any> {
      let ec: any = this.getPluginCacheRoot(eA.name, eA.marketplaceName);
      if (!(await tZ.pathExists(ec))) return;
      let eu: any = (await tZ.readdir(ec, { withFileTypes: !0 }))
          .filter((eA?: any) => eA.isDirectory() && !eA.name.startsWith("."))
          .map((eA?: any) => eA.name),
        ed: any =
          eA.version && !el
            ? eu.find((el?: any) => el === eA.version) ||
              this.chooseHighestVersion(eu)
            : this.chooseHighestVersion(eu, el);
      if (!ed) return;
      let ep: any = tX.join(ec, ed);
      if (!(await tZ.pathExists(ep))) return;
      let eg: any = await this.readPluginManifest(ep),
        eh: any = this.getNormalizedSemver(ed);
      return {
        installPath: ep,
        version: eg?.version || ed,
        resolvedVersion:
          eh && eh !== this.getNormalizedSemver(eg?.version) ? eh : void 0,
      };
    }
    getInstalledRecordVersion(eA?: any): any {
      return eA.resolvedVersion || eA.version;
    }
    async resolveInstalledPluginCache(
      eA?: any,
      el?: any,
      ec?: any,
      eu?: any,
    ): Promise<any> {
      let ed: any = this.getPluginId(eA.name, eA.marketplaceName),
        ep: any = await this.readInstalledPluginsRegistry(),
        eg: any = el ? this.getProjectPathForScope(el, eu) : void 0,
        eh: any = (ep.plugins[ed] || []).filter(
          (eA?: any) =>
            (!el || this.installedRecordMatchesScope(eA, el, eg)) &&
            this.versionSatisfiesRange(this.getInstalledRecordVersion(eA), ec),
        ),
        ef: any = [];
      for (let eA of eh) (await tZ.pathExists(eA.installPath)) && ef.push(eA);
      if (ef.length > 0) {
        let el: any =
          eA.version && !ec
            ? ef.find(
                (el?: any) => this.getInstalledRecordVersion(el) === eA.version,
              )
            : void 0;
        if (el) return { ...el };
        let eu: any = this.chooseHighestVersion(
            ef
              .map((eA?: any) => this.getInstalledRecordVersion(eA))
              .filter((eA?: any) => !!eA),
            ec,
          ),
          ed: any = eu
            ? ef.find((eA?: any) => this.getInstalledRecordVersion(eA) === eu)
            : ef
                .sort((eA?: any, el?: any) =>
                  (eA.lastUpdated || "").localeCompare(el.lastUpdated || ""),
                )
                .at(-1);
        if (ed) return { ...ed };
      }
      return this.findCachedPluginByDirectory(eA, ec);
    }
    async resolveBuiltinSeedPluginCache(eA?: any): Promise<any> {
      let el: any = this.getPluginId(eA.name, eA.marketplaceName),
        ec: any = this.getBuiltinSeedPluginCacheRoot(
          eA.name,
          eA.marketplaceName,
        ),
        eu: any = eA.version?.trim();
      if (eu) {
        let el: any = this.getBuiltinSeedPluginCachePath(
          eA.name,
          eA.marketplaceName,
          eu,
        );
        if (await this.isValidBuiltinSeedCacheDirectory(el, ec, eA.name, eu))
          return { installPath: el, version: eu };
        this.logger.warn(
          `Current builtin seed snapshot is unavailable for ${eA.name}@${eA.marketplaceName} ${eu}; falling back to installed registry records`,
        );
      }
      let ed: any = await this.readInstalledPluginsRegistry(),
        ep: any = [];
      for (let eu of ed.plugins[el] || [])
        ("user" === eu.scope || "managed" === eu.scope) &&
          void 0 === eu.projectPath &&
          (!0 === eu.workbuddySeedManaged
            ? await this.isValidBuiltinSeedCacheDirectory(
                eu.installPath,
                ec,
                eA.name,
                eu.version || "",
              )
            : (await this.isValidOrdinaryBuiltinCacheDirectory(
                eu.installPath,
                eA.name,
                eA.marketplaceName,
                eu.version || "",
              )) ||
              (await this.isValidBuiltinSeedCacheDirectory(
                eu.installPath,
                ec,
                eA.name,
                eu.version || "",
              ))) &&
          ep.push(eu);
      if (ep.length > 0) {
        let el: any = eA.version
            ? ep.find(
                (el?: any) => this.getInstalledRecordVersion(el) === eA.version,
              )
            : void 0,
          ec: any = el
            ? void 0
            : this.chooseHighestVersion(
                ep
                  .map((eA?: any) => this.getInstalledRecordVersion(eA))
                  .filter((eA?: any) => !!eA),
              ),
          eu: any =
            el ||
            (ec
              ? ep.find((eA?: any) => this.getInstalledRecordVersion(eA) === ec)
              : ep
                  .sort((eA?: any, el?: any) =>
                    (eA.lastUpdated || "").localeCompare(el.lastUpdated || ""),
                  )
                  .at(-1));
        if (eu) return { ...eu };
      }
    }
    normalizePluginDependencies(eA?: any, el?: any): any {
      if (!Array.isArray(eA) || 0 === eA.length) return [];
      let ec: any = el.marketplaceName,
        eu: any = this.getPluginId(el.name, ec),
        ed: any = [];
      for (let ep of eA) {
        if ("string" == typeof ep) {
          let eA: any = ep.trim(),
            eg: any = eA.split("@");
          ((!(eg.length > 2) &&
            rL.test(eg[0] || "") &&
            (2 !== eg.length || rL.test(eg[1] || ""))) ||
            this.throwDependencyResolutionError(
              {
                code: "invalid-dependency",
                dependency: eA,
                message: `Invalid dependency "${eA}" declared by ${eu}`,
              },
              t$.PluginErrorType.DependencyUnsatisfied,
              el,
            ),
            ed.push({
              name: eg[0],
              marketplaceName: eg[1] || ec,
              declaringPluginId: eu,
              declaringMarketplaceName: ec,
            }));
          continue;
        }
        let eA: any = ep?.name?.trim(),
          eg: any = ep?.marketplace?.trim(),
          eh: any = ep?.version?.trim();
        ((eA &&
          rL.test(eA) &&
          (ep?.marketplace === void 0 || (eg && rL.test(eg))) &&
          (ep?.version === void 0 || (eh && (0, AL.validRange)(eh)))) ||
          this.throwDependencyResolutionError(
            {
              code: "invalid-dependency",
              dependency: JSON.stringify(ep),
              message: `Invalid dependency object declared by ${eu}: ${JSON.stringify(ep)}`,
            },
            t$.PluginErrorType.DependencyUnsatisfied,
            el,
          ),
          ed.push({
            name: eA,
            marketplaceName: eg || ec,
            versionRange: eh,
            declaringPluginId: eu,
            declaringMarketplaceName: ec,
          }));
      }
      return ed;
    }
    throwDependencyResolutionError(eA?: any, el?: any, ec?: any): any {
      throw new PluginDependencyResolutionError(
        eA,
        el,
        ec.name,
        ec.marketplaceName,
      );
    }
    recordDependencyResolutionError(eA?: any): any {
      let el: any = eA.problem.dependency,
        ec: any = eA.problem.dependencyMarketplace || eA.marketplaceName,
        eu: any = {
          type: eA.errorType,
          pluginName: eA.pluginName,
          marketplaceName: eA.marketplaceName,
          dependencyName: el,
          dependencyMarketplaceName: ec,
          message: eA.problem.message,
          details: eA.problem.message,
        };
      eA.errorType === t$.PluginErrorType.DependencyVersionUnsatisfied
        ? this.errorCollector.addError({
            ...eu,
            required: eA.problem.required || "",
            installed: eA.problem.installed,
          })
        : eA.errorType === t$.PluginErrorType.DependencyNoMatchingTag
          ? this.errorCollector.addError({
              ...eu,
              required: eA.problem.required || "",
            })
          : eA.errorType === t$.PluginErrorType.DependencyRangeConflict
            ? this.errorCollector.addError({
                ...eu,
                ranges: (eA.problem.required || "")
                  .split(",")
                  .map((eA?: any) => eA.trim())
                  .filter(Boolean),
              })
            : this.errorCollector.addError(eu);
    }
    async getRootMarketplaceCrossDependencyAllowlist(eA?: any): Promise<any> {
      try {
        await eA.loadManifest?.();
        let el: any = eA.manifest;
        return new Set(
          (el?.allowCrossMarketplaceDependenciesOn || []).filter(
            (eA?: any) => "string" == typeof eA && eA.length > 0,
          ),
        );
      } catch (el: any) {
        return (
          this.logger.warn(
            `[PluginManager] Failed to load marketplace dependency allowlist for ${eA.name}: ${el}`,
          ),
          new Set()
        );
      }
    }
    getNormalizedSemver(eA?: any): any {
      if (eA) return (0, AL.valid)(eA) || (0, AL.coerce)(eA)?.version;
    }
    getEffectivePluginVersion(eA?: any): any {
      return eA.resolvedVersion || eA.version;
    }
    assertDependencyVersion(eA?: any, el?: any, ec?: any, eu?: any): any {
      let ed: any = this.getPluginId(eA.name, eA.marketplaceName),
        ep: any = ec.get(ed) || [],
        eg: any = this.combineVersionRanges(ep);
      if (
        (eg.ok ||
          this.throwDependencyResolutionError(
            {
              code: "range-conflict",
              dependency: eA.name,
              dependencyMarketplace: eA.marketplaceName,
              required: ep.join(", "),
              installed: this.getEffectivePluginVersion(el),
              message: `Dependency ${ed} has ${eg.reason || "invalid"} version requirements: ${ep.join(", ")}`,
            },
            t$.PluginErrorType.DependencyRangeConflict,
            eu,
          ),
        eg.range)
      ) {
        let ec: any = this.getEffectivePluginVersion(el),
          eh: any = this.getNormalizedSemver(ec);
        (eh && (0, AL.satisfies)(eh, eg.range)) ||
          this.throwDependencyResolutionError(
            {
              code: "dependency-version-unsatisfied",
              dependency: eA.name,
              dependencyMarketplace: eA.marketplaceName,
              required: ep.join(", ") || eA.versionRange,
              installed: ec,
              message: `Dependency ${ed} ${ec || "version unknown"} does not satisfy ${ep.join(", ") || eA.versionRange}`,
            },
            t$.PluginErrorType.DependencyVersionUnsatisfied,
            eu,
          );
      }
    }
    combineVersionRanges(eA?: any): any {
      let el: any = eA.map((eA?: any) => eA.trim()).filter(Boolean);
      if (0 === el.length) return { ok: !0 };
      if (el.reduce((eA?: any, el?: any) => eA + el.length, 0) > 4096)
        return { ok: !1, reason: "too-complex" };
      let ec: any = [""];
      for (let eA of el) {
        let el: any = (0, AL.validRange)(eA);
        if (!el) return { ok: !1, reason: "invalid" };
        let eu: any = el
          .split("||")
          .map((eA?: any) => eA.trim())
          .filter(Boolean);
        if (ec.length * eu.length > 64)
          return { ok: !1, reason: "too-complex" };
        ec = ec.flatMap((eA?: any) =>
          eu.map((el?: any) => `${eA} ${el}`.trim()),
        );
      }
      let eu: any = ec.filter((eA?: any) => {
        let el: any = (0, AL.validRange)(eA);
        return !!el && !!(0, AL.minVersion)(el);
      });
      if (0 === eu.length) return { ok: !1, reason: "disjoint" };
      let ed: any = (0, AL.validRange)(eu.join(" || "));
      return ed ? { ok: !0, range: ed } : { ok: !1, reason: "disjoint" };
    }
    collectExistingDependencyConstraints(eA?: any): any {
      let el: any = new Map();
      for (let ec of this.installedPluginsCache || []) {
        let eu: any,
          ed: any = this.getPluginId(ec.name, ec.marketplaceName);
        if (!(!ec.installedPath || eA.has(ed))) {
          try {
            eu = this.normalizePluginDependencies(ec.dependencies, ec);
          } catch {
            continue;
          }
          for (let eA of eu) {
            let ec: any = this.getPluginId(eA.name, eA.marketplaceName);
            if (eA.versionRange) {
              let eu: any = el.get(ec) || [];
              (eu.includes(eA.versionRange) || eu.push(eA.versionRange),
                el.set(ec, eu));
            }
          }
        }
      }
      return el;
    }
    async resolveRequestedPluginRefs(eA?: any): Promise<any> {
      let el: any = new Set(eA.map((eA?: any) => eA.pluginId)),
        ec: any = this.collectExistingDependencyConstraints(el),
        eu: any = [];
      try {
        for (let el of eA) {
          let eA: any = ec.get(el.pluginId) || [];
          if (0 === eA.length) {
            eu.push(el);
            continue;
          }
          let ed: any = this.combineVersionRanges(eA);
          (ed.ok && ed.range) ||
            this.throwDependencyResolutionError(
              {
                code: "range-conflict",
                dependency: el.plugin.name,
                dependencyMarketplace: el.plugin.marketplaceName,
                required: eA.join(", "),
                message: `Dependency ${el.pluginId} has ${ed.reason || "invalid"} version requirements: ${eA.join(", ")}`,
              },
              t$.PluginErrorType.DependencyRangeConflict,
              el.plugin,
            );
          let ep: any = {
              name: el.plugin.name,
              marketplaceName: el.plugin.marketplaceName,
              versionRange: ed.range,
              declaringPluginId: el.pluginId,
              declaringMarketplaceName: el.plugin.marketplaceName,
            },
            eg: any =
              (await this.resolveGitTaggedDependencyPlugin(
                ep,
                el.marketplace,
                ed.range,
                el.plugin,
                el.plugin,
              )) || el;
          (this.assertDependencyVersion(ep, eg.plugin, ec, el.plugin),
            eu.push(eg));
        }
      } catch (eA: any) {
        throw (
          await Promise.all(
            eu.map((eA?: any) =>
              eA.cleanupMarketplaceLocation
                ? tZ.remove(eA.cleanupMarketplaceLocation).catch(() => void 0)
                : Promise.resolve(),
            ),
          ),
          eA
        );
      }
      return eu;
    }
    async isGitBackedMarketplace(eA?: any): Promise<any> {
      return (
        eA.type === t$.MarketplaceType.Git ||
        eA.type === t$.MarketplaceType.Github ||
        (eA.type === t$.MarketplaceType.Directory &&
          !!eA.installLocation &&
          (await tZ.pathExists(tX.join(eA.installLocation, ".git"))))
      );
    }
    async runGit(eA?: any, el?: any): Promise<any> {
      return String(
        (await (0, t8.default)("git", eA, { ...rv, cwd: el })).stdout || "",
      ).trim();
    }
    async listMarketplacePluginTags(
      eA?: any,
      el?: any,
      ec: any = !1,
    ): Promise<any> {
      if (!(await this.isGitBackedMarketplace(el)) || !el.installLocation)
        return [];
      let eu: any = `${eA}--v`;
      if (ec)
        try {
          await this.runGit(
            ["fetch", "--tags", "--force", "--depth", "1"],
            el.installLocation,
          );
        } catch (eA: any) {
          this.logger.warn(
            `Failed to fetch tags for marketplace ${el.name}: ${eA}`,
          );
        }
      let ed: any = await this.runGit(
          [
            "for-each-ref",
            "--format=%(refname:short)%09%(objectname)%09%(*objectname)",
            `refs/tags/${eu}*`,
          ],
          el.installLocation,
        ),
        ep: any = [];
      for (let eA of ed.split(/\r?\n/).filter(Boolean)) {
        let [el, ec, ed] = eA.split("	"),
          eg: any = el.slice(eu.length),
          eh: any = (0, AL.valid)(eg) || void 0;
        if (!eh) continue;
        let ef: any = ed || ec;
        ef && ep.push({ tag: el, version: eg, normalizedVersion: eh, sha: ef });
      }
      return ep;
    }
    async checkoutMarketplaceRef(eA?: any, el?: any): Promise<any> {
      let ec: any = await tZ.mkdtemp(
        tX.join(An.tmpdir(), "codebuddy-plugin-tag-"),
      );
      try {
        try {
          await this.runGit(
            ["cat-file", "-e", `${el}^{commit}`],
            eA.installLocation,
          );
        } catch {
          await this.runGit(
            ["fetch", "origin", el, "--depth", "1"],
            eA.installLocation,
          );
        }
        return (
          await (0, t8.default)(
            "git",
            ["clone", "--shared", "--no-checkout", eA.installLocation, ec],
            rv,
          ),
          await this.runGit(["checkout", "--detach", el], ec),
          ec
        );
      } catch (eA: any) {
        throw (await tZ.remove(ec), eA);
      }
    }
    async readMarketplacePluginFromLocation(
      eA?: any,
      el?: any,
      ec?: any,
    ): Promise<any> {
      for (let eu of t$.PLUGINS_METADATA_DIRS) {
        let ed: any = tX.join(eA, eu, t$.MARKETPLACE_MANIFEST_FILE);
        if (!(await tZ.pathExists(ed))) continue;
        let ep: any = await tZ.readJSON(ed),
          eg: any = ep.plugins?.find((eA?: any) => eA.name === ec);
        if (!eg) break;
        return { ...eg, name: eg.name, marketplaceName: el, source: eg.source };
      }
    }
    isGitPluginSource(eA?: any): any {
      return (
        "string" != typeof eA &&
        [
          t$.PluginSourceType.Github,
          t$.PluginSourceType.Url,
          t$.PluginSourceType.GitSubdir,
        ].includes(eA.source)
      );
    }
    getPluginGitUrl(eA?: any): any {
      return eA.url
        ? eA.source === t$.PluginSourceType.GitSubdir &&
          /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/.test(eA.url)
          ? `https://github.com/${eA.url}.git`
          : eA.url
        : eA.repo
          ? /^(?:https?:\/\/|ssh:\/\/|git@)/.test(eA.repo)
            ? eA.repo
            : `https://github.com/${eA.repo.replace(/\.git$/, "")}.git`
          : void 0;
    }
    async listRemotePluginTags(eA?: any, el?: any): Promise<any> {
      let ec: any = this.getPluginGitUrl(el);
      if (!ec) return [];
      let eu: any = `${eA}--v`,
        ed: any = await (0, t8.default)(
          "git",
          ["ls-remote", "--tags", "--", ec, `${eu}*`],
          rv,
        ),
        ep: any = new Map();
      for (let eA of String(ed.stdout || "").split(/\r?\n/)) {
        let [el, ec] = eA.trim().split(/\s+/, 2),
          ed: any = ec?.replace(/^refs\/tags\//, ""),
          eg: any = ed?.endsWith("^{}") === !0,
          eh: any = eg ? ed.slice(0, -3) : ed;
        if (!el || !eh?.startsWith(eu)) continue;
        let ef: any = eh.slice(eu.length),
          em: any = (0, AL.valid)(ef) || void 0;
        em &&
          (!ep.has(eh) || eg) &&
          ep.set(eh, { tag: eh, version: ef, normalizedVersion: em, sha: el });
      }
      return Array.from(ep.values());
    }
    selectHighestMatchingTag(eA?: any, el?: any): any {
      let ec: any = (0, AL.maxSatisfying)(
        eA.map((eA?: any) => eA.normalizedVersion),
        el,
      );
      return ec ? eA.find((eA?: any) => eA.normalizedVersion === ec) : void 0;
    }
    async resolveGitTaggedDependencyPlugin(
      eA?: any,
      el?: any,
      ec?: any,
      eu?: any,
      ed?: any,
    ): Promise<any> {
      let ep: any = ec ? (0, AL.validRange)(ec) : void 0;
      if (!ep) return;
      let eg: any = eu || (await el.getPlugin(eA.name));
      if (
        eg &&
        "string" != typeof eg.source &&
        [t$.PluginSourceType.Npm, t$.PluginSourceType.Pip].includes(
          eg.source.source,
        )
      )
        return;
      if (eg && this.isGitPluginSource(eg.source)) {
        let ec: any = await this.listRemotePluginTags(eA.name, eg.source),
          eu: any = this.selectHighestMatchingTag(ec, ep);
        eu || this.throwNoMatchingDependencyTag(eA, ep, ec, ed || eg);
        let eh: any = {
          ...eg,
          source: { ...eg.source, ref: eu.tag, sha: eu.sha },
          resolvedVersion: eu.version,
          gitCommitSha: eu.sha,
        };
        return {
          pluginId: this.getPluginId(eA.name, eA.marketplaceName),
          plugin: eh,
          marketplace: el,
          resolvedTag: eu.tag,
          resolvedVersion: eu.version,
          gitCommitSha: eu.sha,
        };
      }
      if (!(await this.isGitBackedMarketplace(el))) return;
      let eh: any =
          el.type === t$.MarketplaceType.Git ||
          el.type === t$.MarketplaceType.Github,
        ef: any = await this.listMarketplacePluginTags(eA.name, el, eh),
        em: any = this.selectHighestMatchingTag(ef, ep);
      (em ||
        eh ||
        ((ef = await this.listMarketplacePluginTags(eA.name, el, !0)),
        (em = this.selectHighestMatchingTag(ef, ep))),
        em || this.throwNoMatchingDependencyTag(eA, ep, ef, ed || eg));
      let eE: any = await this.checkoutMarketplaceRef(el, em.tag),
        eC: any = await this.readMarketplacePluginFromLocation(
          eE,
          el.name,
          eA.name,
        );
      return eC
        ? ((eC.resolvedVersion = em.version),
          (eC.gitCommitSha = em.sha),
          {
            pluginId: this.getPluginId(eA.name, eA.marketplaceName),
            plugin: eC,
            marketplace: el,
            marketplaceLocation: eE,
            cleanupMarketplaceLocation: eE,
            resolvedTag: em.tag,
            resolvedVersion: em.version,
            gitCommitSha: em.sha,
          })
        : void (await tZ.remove(eE));
    }
    throwNoMatchingDependencyTag(eA?: any, el?: any, ec?: any, eu?: any): any {
      let ed: any =
        ec.length > 0
          ? ` Available versions: ${ec.map((eA?: any) => eA.version).join(", ")}.`
          : " No version tags were found.";
      this.throwDependencyResolutionError(
        {
          code: "no-matching-tag",
          dependency: eA.name,
          dependencyMarketplace: eA.marketplaceName,
          required: el,
          message: `Dependency ${this.getPluginId(eA.name, eA.marketplaceName)} has no git tag satisfying ${el}.${ed}`,
        },
        t$.PluginErrorType.DependencyNoMatchingTag,
        eu,
      );
    }
    async resolveDependencyPlugin(
      eA?: any,
      el?: any,
      ec?: any,
      eu?: any,
      ed?: any,
      ep?: any,
      eg?: any,
    ): Promise<any> {
      let eh: any = this.getPluginId(eA.name, eA.marketplaceName),
        ef: any = ed.get(eh);
      if (ef) {
        if (
          this.versionSatisfiesRange(
            this.getEffectivePluginVersion(ef.plugin),
            eg,
          )
        )
          return ef;
        let ec: any = await this.resolveGitTaggedDependencyPlugin(
          eA,
          ef.marketplace,
          eg,
          ef.plugin,
          el,
        );
        return ec ? (ed.set(eh, ec), ec) : ef;
      }
      let em: any = ep.get(eh);
      if (
        em?.installedPath &&
        this.versionSatisfiesRange(this.getEffectivePluginVersion(em), eg)
      ) {
        let el: any = await this.getMarketplace(eA.marketplaceName);
        if (el) {
          let eA: any = { pluginId: eh, plugin: em, marketplace: el };
          return (ed.set(eh, eA), eA);
        }
      }
      eA.marketplaceName === eA.declaringMarketplaceName ||
        eu.has(eA.marketplaceName) ||
        this.throwDependencyResolutionError(
          {
            code: "cross-marketplace",
            dependency: eA.name,
            dependencyMarketplace: eA.marketplaceName,
            message: `Dependency ${eh} is in a different marketplace. Add "${eA.marketplaceName}" to allowCrossMarketplaceDependenciesOn in root marketplace "${ec.name}".`,
          },
          t$.PluginErrorType.DependencyCrossMarketplaceBlocked,
          el,
        );
      let eE: any = await this.getMarketplace(eA.marketplaceName);
      if (!eE) throw new t$.MarketplaceNotReadyError(eA.marketplaceName);
      let eC: any = await eE.getPlugin(eA.name);
      eC ||
        this.throwDependencyResolutionError(
          {
            code: "dependency-unsatisfied",
            dependency: eA.name,
            dependencyMarketplace: eA.marketplaceName,
            message: `Dependency ${eh} declared by ${eA.declaringPluginId} was not found.`,
          },
          t$.PluginErrorType.DependencyUnsatisfied,
          el,
        );
      let ey: any = (await this.resolveGitTaggedDependencyPlugin(
        eA,
        eE,
        eg,
        eC,
        el,
      )) || { pluginId: eh, plugin: eC, marketplace: eE };
      return (ed.set(eh, ey), ey);
    }
    async resolveDependencyClosure(
      eA?: any,
      el?: any,
      ec?: any,
      eu: any = new Set(
        eA.map((eA?: any) => this.getPluginId(eA.name, eA.marketplaceName)),
      ),
    ): Promise<any> {
      let ed: any = await this.getRootMarketplaceCrossDependencyAllowlist(el),
        ep: any = new Map(
          (this.installedPluginsCache || []).map((eA?: any) => [
            this.getPluginId(eA.name, eA.marketplaceName),
            eA,
          ]),
        ),
        eg: any = new Map(),
        eh: any = new Set(),
        ef: any = new Set(),
        em: any = this.collectExistingDependencyConstraints(eu),
        visit: any = async (eA?: any) => {
          let eu: any = this.getPluginId(eA.name, eA.marketplaceName);
          if (
            (ef.has(eu) &&
              this.throwDependencyResolutionError(
                {
                  code: "invalid-dependency",
                  dependency: eA.name,
                  dependencyMarketplace: eA.marketplaceName,
                  message: `Circular plugin dependency detected at ${eu}`,
                },
                t$.PluginErrorType.DependencyUnsatisfied,
                eA,
              ),
            !eh.has(eu))
          ) {
            for (let eE of (ef.add(eu),
            this.normalizePluginDependencies(eA.dependencies, eA))) {
              let eu: any = this.getPluginId(eE.name, eE.marketplaceName);
              if (eE.versionRange) {
                let eA: any = em.get(eu) || [];
                (eA.includes(eE.versionRange) || eA.push(eE.versionRange),
                  em.set(eu, eA));
              }
              let ef: any = em.get(eu) || [],
                eC: any = this.combineVersionRanges(ef);
              eC.ok ||
                this.throwDependencyResolutionError(
                  {
                    code: "range-conflict",
                    dependency: eE.name,
                    dependencyMarketplace: eE.marketplaceName,
                    required: ef.join(", "),
                    message: `Dependency ${eu} has ${eC.reason || "invalid"} version requirements: ${ef.join(", ")}`,
                  },
                  t$.PluginErrorType.DependencyRangeConflict,
                  eA,
                );
              let ey: any = ec.get(eu),
                ew: any = await this.resolveDependencyPlugin(
                  eE,
                  eA,
                  el,
                  ed,
                  ec,
                  ep,
                  eC.range,
                );
              (this.assertDependencyVersion(eE, ew.plugin, em, eA),
                eg.set(ew.pluginId, ew),
                ey &&
                  (this.getEffectivePluginVersion(ey.plugin) !==
                    this.getEffectivePluginVersion(ew.plugin) ||
                    ey.plugin.gitCommitSha !== ew.plugin.gitCommitSha) &&
                  (eh.delete(eu),
                  ey.cleanupMarketplaceLocation &&
                    ey.cleanupMarketplaceLocation !==
                      ew.cleanupMarketplaceLocation &&
                    (await tZ
                      .remove(ey.cleanupMarketplaceLocation)
                      .catch(() => void 0))),
                await visit(ew.plugin));
            }
            (ef.delete(eu), eh.add(eu));
          }
        };
      try {
        for (let el of eA) await visit(el);
      } catch (el: any) {
        let eA: any = new Set();
        for (let el of [...ec.values(), ...eg.values()])
          el.cleanupMarketplaceLocation &&
            eA.add(el.cleanupMarketplaceLocation);
        throw (
          await Promise.all(
            Array.from(eA, (eA?: any) => tZ.remove(eA).catch(() => void 0)),
          ),
          el
        );
      }
      return Array.from(eg.values());
    }
    async materializePluginRefs(eA?: any, el?: any): Promise<any> {
      let ec: any = [];
      for (let eu of eA) {
        let eA: any;
        this.logger.info(`Installing plugin ${eu.pluginId}...`);
        try {
          eA = await this.installPluginWithInstaller(
            eu.plugin,
            eu.marketplaceLocation || eu.marketplace.installLocation,
            {
              ...el,
              resolvedTag: eu.resolvedTag,
              resolvedVersion: eu.resolvedVersion,
              gitCommitSha: eu.gitCommitSha,
              autoInstalled: eu.autoInstalled ?? el?.autoInstalled,
            },
            this.shouldRunDirectoryPluginFromSource(eu.marketplace),
          );
        } finally {
          eu.cleanupMarketplaceLocation &&
            (await tZ
              .remove(eu.cleanupMarketplaceLocation)
              .catch((eA?: any) => {
                this.logger.warn(
                  `Failed to clean temporary marketplace checkout ${eu.cleanupMarketplaceLocation}: ${eA}`,
                );
              }));
        }
        let ed: any = {
          ...eu.plugin,
          installedPath: eA,
          status:
            el?.autoEnable === !1
              ? t$.PluginStatus.Disabled
              : t$.PluginStatus.Enabled,
          resolvedVersion: eu.resolvedVersion,
          gitCommitSha: eu.gitCommitSha,
          autoInstalled: eu.autoInstalled ?? el?.autoInstalled,
        };
        (await this.enrichPluginInfo(ed, eA),
          el?.autoEnable === void 0 &&
            !1 === ed.defaultEnabled &&
            (ed.status = t$.PluginStatus.Disabled),
          ec.push({ ...eu, plugin: ed }),
          this.logger.info(`Plugin ${eu.pluginId} installed at ${eA}`));
      }
      return ec;
    }
    async installDependencyClosure(
      eA?: any,
      el?: any,
      ec?: any,
      eu?: any,
    ): Promise<any> {
      let ed: any = [],
        ep: any = new Set(),
        eg: any = new Set(eA.keys());
      for (;;) {
        let eh: any = await this.resolveDependencyClosure(
          Array.from(eA.values()).map((eA?: any) => eA.plugin),
          el,
          eA,
          eg,
        );
        for (let eA of eh) ec.set(eA.pluginId, eA);
        let ef: any = eh.filter(
          (el?: any) =>
            !eg.has(el.pluginId) &&
            !this.hasMaterializedPluginCache(eA.get(el.pluginId)?.plugin) &&
            !ep.has(el.pluginId),
        );
        if (0 === ef.length) break;
        for (let el of await this.materializePluginRefs(
          ef.map((eA?: any) => ({ ...eA, autoInstalled: !0 })),
          { ...eu, autoInstalled: !0 },
        ))
          (ep.add(el.pluginId),
            eA.set(el.pluginId, el),
            ec.set(el.pluginId, el),
            ed.push(el));
      }
      return ed;
    }
    hasMaterializedPluginCache(eA?: any): any {
      return (
        !!eA?.installedPath && this.isVersionedPluginCachePath(eA.installedPath)
      );
    }
    async enableDependenciesForPlugins(
      eA?: any,
      el?: any,
      ec?: any,
    ): Promise<any> {
      if (0 === eA.length || !el) return [];
      let eu: any = new Set(
          eA.map((eA?: any) => this.getPluginId(eA.name, eA.marketplaceName)),
        ),
        ed: any = new Map();
      for (let ec of eA)
        ed.set(this.getPluginId(ec.name, ec.marketplaceName), {
          pluginId: this.getPluginId(ec.name, ec.marketplaceName),
          plugin: ec,
          marketplace: el,
        });
      let ep: any = new Map(),
        eg: any = ec.scope || eA[0]?.installScope || A_.SettingsScope.USER,
        eh: any = await this.getEnabledPlugins(),
        ef: any = await this.resolveDependencyClosure(eA, el, ed, eu);
      for (let eA of ef) ep.set(eA.pluginId, eA);
      let em: any = ef.find(
        (eA?: any) => !this.hasMaterializedPluginCache(eA.plugin),
      );
      if (em) {
        await Promise.all(
          ef.map((eA?: any) =>
            eA.cleanupMarketplaceLocation
              ? tZ.remove(eA.cleanupMarketplaceLocation).catch(() => void 0)
              : Promise.resolve(),
          ),
        );
        let el: any =
          eA.find((eA?: any) =>
            this.getDeclaredDependencyIds(eA).includes(em.pluginId),
          ) || eA[0];
        this.throwDependencyResolutionError(
          {
            code: "dependency-unsatisfied",
            dependency: em.plugin.name,
            dependencyMarketplace: em.plugin.marketplaceName,
            message: `Dependency ${em.pluginId} is not installed. Install it before enabling ${this.getPluginId(el.name, el.marketplaceName)}.`,
          },
          t$.PluginErrorType.DependencyUnsatisfied,
          el,
        );
      }
      let eE: any = [];
      for (let [el, ed] of ep.entries())
        !eu.has(el) &&
          (ed.plugin.status !== t$.PluginStatus.Enabled &&
            (this.assertDependencyCanBeEnabledAtScope(el, eg, eh, eA[0]),
            (ed.plugin.status = t$.PluginStatus.Enabled),
            eE.push(ed.plugin)),
          ec.persist &&
            (await this.updateEnabledPlugins(
              (eA?: any) => {
                eA[el] = !0;
              },
              eg,
              ec.workspacePath,
            )));
      return eE;
    }
    collectKnownDependencyIds(eA?: any, el?: any, ec: any = new Set()): any {
      for (let eu of this.normalizePluginDependencies(eA.dependencies, eA)) {
        let eA: any = this.getPluginId(eu.name, eu.marketplaceName);
        if (ec.has(eA)) continue;
        ec.add(eA);
        let ed: any = el.get(eA)?.plugin;
        ed && this.collectKnownDependencyIds(ed, el, ec);
      }
      return ec;
    }
    getDeclaredDependencyIds(eA?: any): any {
      try {
        return this.normalizePluginDependencies(eA.dependencies, eA).map(
          (eA?: any) => this.getPluginId(eA.name, eA.marketplaceName),
        );
      } catch {
        return [];
      }
    }
    async findOrphanedAutoDependencies(
      eA?: any,
      el?: any,
      ec?: any,
    ): Promise<any> {
      let eu: any = await this.readInstalledPluginsRegistry(),
        ed: any = new Map(),
        ep: any = new Map();
      for (let [ec, eg] of Object.entries(eu.plugins)) {
        let eu: any = eg.find((ec?: any) =>
          this.installedRecordMatchesScope(ec, eA, el),
        );
        if (!eu) continue;
        let eh: any = ec.indexOf("@"),
          ef: any = await this.readPluginManifest(eu.installPath);
        if (!ef || eh <= 0 || eh === ec.length - 1)
          return (
            this.logger.warn(
              `[PluginManager] Skipping orphan dependency cleanup because ${ec} cannot be loaded`,
            ),
            []
          );
        (ed.set(ec, eu),
          ep.set(ec, {
            ...ef,
            name: ec.slice(0, eh),
            marketplaceName: ec.slice(eh + 1),
            source: "",
            installedPath: eu.installPath,
            autoInstalled: eu.auto,
          }));
      }
      let eg: any = new Set(),
        eh: any = Array.from(ep.entries())
          .filter(([eA]: any) => !ec.has(eA) && ed.get(eA)?.auto !== !0)
          .map(([, eA]: any) => eA);
      try {
        for (; eh.length > 0; ) {
          let eA: any = eh.pop();
          for (let el of this.normalizePluginDependencies(
            eA.dependencies,
            eA,
          )) {
            let eA: any = this.getPluginId(el.name, el.marketplaceName);
            if (eg.has(eA)) continue;
            eg.add(eA);
            let eu: any = ep.get(eA);
            eu && !ec.has(eA) && eh.push(eu);
          }
        }
      } catch (eA: any) {
        return (
          this.logger.warn(
            `[PluginManager] Skipping orphan dependency cleanup: ${eA}`,
          ),
          []
        );
      }
      return Array.from(ed.entries())
        .filter(([eA, el]: any) => !0 === el.auto && !ec.has(eA) && !eg.has(eA))
        .map(([eA, el]: any) => ({ pluginId: eA, record: el }));
    }
    async findEnabledDependents(eA?: any, el: any = new Set()): Promise<any> {
      let ec: any = await this.getInstalledPlugins(),
        eu: any = [];
      for (let ed of ec) {
        let ec: any = this.getPluginId(ed.name, ed.marketplaceName),
          ep: any =
            ed.status === t$.PluginStatus.Enabled ||
            !!ed.dependencyErrors?.length;
        if (!el.has(ec) && ep)
          for (let el of this.getDeclaredDependencyIds(ed))
            eA.has(el) && eu.push({ dependentId: ec, dependencyId: el });
      }
      return eu;
    }
    async assertNoEnabledDependents(
      eA?: any,
      el?: any,
      ec?: any,
    ): Promise<any> {
      let eu: any = await this.findEnabledDependents(eA, el);
      if (0 === eu.length) return;
      let ed: any = eu[0];
      throw Error(
        `${ed.dependencyId} is still required by ${ed.dependentId}. ${"disable" === ec ? "Disable" : "Uninstall"} the dependent plugin first.`,
      );
    }
    async loadInstalledPlugins(eA: any = this.cacheGeneration): Promise<any> {
      let el: any = Date.now(),
        ec: any = Object.keys(await this.getEnabledPlugins()).filter(
          (eA?: any) => eA.includes("@") && !eA.endsWith("@inline"),
        ),
        eu: any = ec.map((eA?: any) => {
          let el: any = eA.indexOf("@");
          return {
            pluginId: eA,
            pluginName: eA.substring(0, el),
            marketplaceName: eA.substring(el + 1),
          };
        }),
        ed: any = new Map();
      for (let eA of eu) {
        let el: any = ed.get(eA.marketplaceName) || [];
        (el.push(eA), ed.set(eA.marketplaceName, el));
      }
      let ep: any = new Map();
      await mapWithConcurrencyLimit(
        Array.from(ed.entries()),
        t$.CONCURRENT_MARKETPLACE_PLUGIN_LOAD_LIMIT,
        async ([eA, el]: any) => {
          let ec: any = await this.getMarketplace(eA);
          if (!ec) return;
          if ("function" != typeof ec.listPlugins)
            return void (await mapWithConcurrencyLimit(
              el,
              t$.CONCURRENT_PLUGIN_METADATA_LOAD_LIMIT,
              async (eA?: any) => {
                let el: any = await ec.getPlugin(eA.pluginName);
                if (!el) return;
                let eu: any = await this.hydratePluginInfo({ ...el }, ec);
                ep.set(eA.pluginId, eu);
              },
            ));
          let eu: any = new Map(
            (await this.listMarketplacePlugins(ec)).map((eA?: any) => [
              eA.name,
              eA,
            ]),
          );
          await mapWithConcurrencyLimit(
            el,
            t$.CONCURRENT_PLUGIN_METADATA_LOAD_LIMIT,
            async (eA?: any) => {
              let el: any = eu.get(eA.pluginName);
              if (!el) return;
              let ed: any = Date.now(),
                eg: any = await this.hydratePluginInfo({ ...el }, ec),
                eh: any = Date.now() - ed;
              (eh > 500 &&
                this.logger.warn(
                  `[PluginManager] slow hydratePlugin ${eA.pluginId} = ${eh}ms`,
                ),
                ep.set(eA.pluginId, eg));
            },
          );
        },
      );
      let eg: any = ec.map((eA?: any) => ep.get(eA)).filter((eA?: any) => !!eA);
      (this.applyDependencyRuntimeGuards(eg), eA !== this.cacheGeneration)
        ? this.logger.debug(
            `[PluginManager] Discarding stale installed plugin load result generation=${eA}, current=${this.cacheGeneration}`,
          )
        : (await this.markPluginCachesInUse(eg), eA !== this.cacheGeneration)
          ? this.logger.debug(
              `[PluginManager] Discarding stale installed plugin load after cache usage markers generation=${eA}, current=${this.cacheGeneration}`,
            )
          : ((this.installedPluginsCache = eg),
            this.logger.info(
              `Loaded ${this.installedPluginsCache.length} installed plugins total=${Date.now() - el}ms`,
            ));
    }
    applyDependencyRuntimeGuards(eA?: any): any {
      let el: any,
        ec: any = new Map(
          eA.map((eA?: any) => [
            this.getPluginId(eA.name, eA.marketplaceName),
            eA,
          ]),
        );
      for (let el of eA) delete el.dependencyErrors;
      do
        for (let eu of ((el = !1), eA)) {
          if (eu.status !== t$.PluginStatus.Enabled || !eu.dependencies?.length)
            continue;
          let eA: any = [],
            ed: any = [];
          try {
            ed = this.normalizePluginDependencies(eu.dependencies, eu);
          } catch (el: any) {
            eA.push({
              code: "invalid-dependency",
              dependency: eu.name,
              dependencyMarketplace: eu.marketplaceName,
              message: el instanceof Error ? el.message : String(el),
            });
          }
          for (let el of ed) {
            let eu: any = this.getPluginId(el.name, el.marketplaceName),
              ed: any = ec.get(eu);
            if (
              !ed ||
              !ed.installedPath ||
              ed.status !== t$.PluginStatus.Enabled
            ) {
              eA.push({
                code: "dependency-unsatisfied",
                dependency: el.name,
                dependencyMarketplace: el.marketplaceName,
                message: `Requires enabled dependency ${eu}`,
              });
              continue;
            }
            if (el.versionRange) {
              let ec: any = this.getEffectivePluginVersion(ed),
                ep: any = this.getNormalizedSemver(ec),
                eg: any = (0, AL.validRange)(el.versionRange);
              (eg && ep && (0, AL.satisfies)(ep, eg)) ||
                eA.push({
                  code: eg
                    ? "dependency-version-unsatisfied"
                    : "range-conflict",
                  dependency: el.name,
                  dependencyMarketplace: el.marketplaceName,
                  required: el.versionRange,
                  installed: ec,
                  message: `Requires ${eu} ${el.versionRange}, installed ${ec || "version unknown"}`,
                });
            }
          }
          eA.length > 0 &&
            ((eu.dependencyErrors = eA),
            (eu.status = t$.PluginStatus.Disabled),
            (el = !0));
        }
      while (el);
    }
    async installPlugins(eA?: any, el?: any, ec?: any): Promise<any> {
      try {
        let eu: any = await this.getMarketplace(el);
        if (!eu) throw new t$.MarketplaceNotReadyError(el);
        let ed: any = [];
        for (let ec of eA) {
          let eA: any = this.getPluginId(ec, el),
            ep: any = await eu.getPlugin(ec);
          if (!ep)
            throw Error(`Plugin ${ec} is not found in marketplace ${el}.`);
          ed.push({ pluginId: eA, plugin: ep, marketplace: eu });
        }
        let ep: any = await this.resolveRequestedPluginRefs(ed),
          eg: any = new Set(ep.map((eA?: any) => eA.pluginId)),
          eh: any = await this.getEnabledPlugins(),
          ef: any = ec?.scope || A_.SettingsScope.USER,
          em: any = new Map(ep.map((eA?: any) => [eA.pluginId, eA])),
          eE: any = new Map(),
          eC: any = [];
        eC.push(
          ...(await this.installDependencyClosure(em, eu, eE, {
            ...ec,
            autoEnable: ec?.autoEnable !== !1,
          })),
        );
        let ey: any = ep.map((eA?: any) => em.get(eA.pluginId) || eA),
          ew: any = await this.materializePluginRefs(ey, ec);
        for (let eA of ew) (em.set(eA.pluginId, eA), eC.push(eA));
        eC.push(
          ...(await this.installDependencyClosure(em, eu, eE, {
            ...ec,
            autoEnable: ec?.autoEnable !== !1,
          })),
        );
        let eB: any = Array.from(eE.keys()).filter((eA?: any) => !eg.has(eA)),
          e_: any = [...eB, ...Array.from(eg)],
          eI: any = new Map(
            ew.map((eA?: any) => [
              eA.pluginId,
              ec?.autoEnable !== void 0
                ? ec.autoEnable
                : (eh[eA.pluginId]?.enabled ?? !1 !== eA.plugin.defaultEnabled),
            ]),
          ),
          ev: any = new Set();
        for (let eA of ew)
          if (eI.get(eA.pluginId))
            for (let el of this.collectKnownDependencyIds(eA.plugin, em))
              ev.add(el);
        for (let eA of ev) {
          let el: any =
            ew.find((el?: any) =>
              this.collectKnownDependencyIds(el.plugin, em).has(eA),
            )?.plugin || ew[0]?.plugin;
          el && this.assertDependencyCanBeEnabledAtScope(eA, ef, eh, el);
        }
        for (let { plugin: eA, marketplace: el } of (this.logger.info(
          `Installing plugins: ${e_.join(",")}...`,
        ),
        await this.updateEnabledPlugins(
          (eA?: any) => {
            for (let el of eB) {
              let ec: any = eE.get(el);
              eA[el] =
                ev.has(el) ||
                eh[el]?.enabled ||
                (void 0 === eh[el] && ec?.plugin.defaultEnabled !== !1);
            }
            for (let el of eg) eA[el] = !1 !== eI.get(el);
          },
          ef,
          ec?.workspacePath,
        ),
        this.clearAllCaches(),
        this.onDidChangeEmitter.fire(),
        this.logger.info(`Plugins ${e_.join(",")} installed successfully`),
        eC))
          this.pluginTelemetryService.reportPluginAction({
            plugin: eA,
            marketplace: el,
            action: "install",
            scope: ef,
          });
      } catch (ec: any) {
        for (let eu of (this.logger.error(
          `Failed to install plugin ${eA.join(",")}: ${ec}`,
        ),
        ec instanceof PluginDependencyResolutionError &&
          this.recordDependencyResolutionError(ec),
        eA))
          this.errorCollector.addError({
            type: t$.PluginErrorType.InstallFailed,
            pluginName: eu,
            marketplaceName: el,
            message: `Failed to install plugin ${eu}`,
            details: ec instanceof Error ? ec.message : String(ec),
          });
        throw ec;
      }
    }
    async installPluginWithInstaller(
      eA?: any,
      el?: any,
      ec?: any,
      eu: any = !1,
    ): Promise<any> {
      let ed: any = this.installers.find((el?: any) => el.support(eA.source));
      if (!ed)
        throw Error(
          `No installer found for plugin source: ${JSON.stringify(eA.source)}`,
        );
      if (eu) return ed.install(eA, el);
      let ep: any = await this.resolveInstalledPluginCache(
        eA,
        ec?.scope,
        ec?.resolvedVersion || eA.version,
        ec?.workspacePath,
      );
      if (ep && !ec?.force)
        return (
          this.logger.info(
            `Plugin ${eA.name}@${eA.marketplaceName} already installed at ${ep.installPath}`,
          ),
          await this.recordInstalledPlugin(
            eA,
            ep.installPath,
            ep.version || eA.version || "unknown",
            {
              ...ec,
              resolvedVersion: ep.resolvedVersion || ec?.resolvedVersion,
              gitCommitSha: ep.gitCommitSha || ec?.gitCommitSha,
              autoInstalled: ec?.autoInstalled,
            },
          ),
          ep.installPath
        );
      let eg: any = await ed.install(eA, el);
      return this.materializePluginCache(eA, eg, ec, el);
    }
    async refreshInstalledPluginsAfterMarketplaceUpdate(
      eA?: any,
      el?: any,
    ): Promise<any> {
      for (let ec of new Set(el))
        try {
          await this.updatePlugins([ec], eA, { skipMarketplaceSync: !0 });
        } catch (el: any) {
          this.logger.warn(
            `Marketplace ${eA} updated, but plugin ${ec} could not be refreshed: ${el instanceof Error ? el.message : String(el)}`,
          );
        }
    }
    async updatePlugins(eA?: any, el?: any, ec?: any): Promise<any> {
      try {
        let eu: any = [],
          ed: any = [],
          ep: any = await this.getMarketplace(el);
        if (!ep) throw Error(`Marketplace ${el} is not found.`);
        if (
          (await this.getInstalledPlugins(),
          this.marketplaceNeedsRemoteSync(ep) && !ec?.skipMarketplaceSync)
        ) {
          this.logger.info(
            `Syncing ${ep.type} marketplace ${el} from remote before plugin update...`,
          );
          try {
            (await ep.update(),
              this.clearMarketplacePluginCaches(ep),
              this.logger.info(`Marketplace ${el} synced successfully`));
          } catch (eu: any) {
            let ec: any = eu instanceof Error ? eu.message : String(eu);
            throw Error(
              `Failed to sync marketplace ${el} before updating plugins ${eA.join(",")}: ${ec}`,
            );
          }
        }
        for (let eg of eA) {
          let eA: any = `${eg}@${el}`;
          eu.push(eA);
          let eh: any = await this.getPlugin(eg, el);
          if (!eh) throw Error(`Plugin ${eA} is not installed.`);
          let ef: any = await ep.getPlugin(eg);
          if (!ef)
            throw Error(`Plugin ${eg} is not found in marketplace ${el}.`);
          let em: any = ec?.scope || eh.installScope || A_.SettingsScope.USER,
            eE: any = (await this.getEnabledPlugins())[eA],
            eC: any = eE?.enabled ?? eh.status === t$.PluginStatus.Enabled,
            ey: any = { pluginId: eA, plugin: ef, marketplace: ep },
            [ew] = await this.resolveRequestedPluginRefs([ey]),
            eB: any = new Map([[eA, ew]]),
            e_: any = new Map(),
            eI: any = { ...ec, autoEnable: eC, scope: em };
          (await this.installDependencyClosure(eB, ep, e_, eI),
            this.logger.info(`Updating plugin ${eA}...`));
          let [ev] = await this.materializePluginRefs([eB.get(eA) || ew], {
              ...ec,
              force: !0,
              autoEnable: eC,
              autoInstalled: eh.autoInstalled,
              scope: em,
            }),
            eS: any = ev.plugin.installedPath,
            eQ: any = { ...ev.plugin, installScope: em };
          (eB.set(eA, { ...ev, plugin: eQ }),
            await this.installDependencyClosure(eB, ep, e_, eI));
          let eD: any = Array.from(e_.keys()).filter((el?: any) => el !== eA);
          if (eD.length > 0) {
            let eA: any = await this.getEnabledPlugins();
            if (eC)
              for (let el of eD)
                this.assertDependencyCanBeEnabledAtScope(el, em, eA, eQ);
            await this.updateEnabledPlugins(
              (el?: any) => {
                for (let ec of eD) {
                  let eu: any = e_.get(ec);
                  el[ec] =
                    eC ||
                    eA[ec]?.enabled ||
                    (void 0 === eA[ec] && eu?.plugin.defaultEnabled !== !1);
                }
              },
              em,
              ec?.workspacePath,
            );
          }
          (ed.push({ plugin: eQ, scope: em }),
            this.logger.info(`Plugin ${eA} updated at ${eS}`));
        }
        for (let ec of (this.logger.info(`Updated plugins: ${eu.join(",")}...`),
        eA))
          this.clearPluginComponentsCache(ec, el);
        for (let { plugin: eA, scope: el } of (this.clearAllCaches(),
        this.onDidChangeEmitter.fire(),
        this.logger.info(`Plugins ${eu.join(",")} updated successfully`),
        ed))
          this.pluginTelemetryService.reportPluginAction({
            plugin: eA,
            marketplace: ep,
            action: "update",
            scope: el,
          });
      } catch (ec: any) {
        for (let eu of (this.logger.error(
          `Failed to update plugins ${eA.join(",")}@${el}: ${ec}`,
        ),
        ec instanceof PluginDependencyResolutionError &&
          this.recordDependencyResolutionError(ec),
        eA))
          this.errorCollector.addError({
            type: t$.PluginErrorType.UpdateFailed,
            pluginName: eu,
            marketplaceName: el,
            message: `Failed to update plugin '${eu}'`,
            details: ec instanceof Error ? ec.message : String(ec),
          });
        throw ec;
      }
    }
    async uninstallPlugins(eA?: any, el?: any, ec?: any): Promise<any> {
      try {
        if (!ec?.bypassPolicyCheck)
          for (let ec of eA) {
            let eA: any = `${ec}@${el}`;
            if (this.pluginPolicyService.isPluginCannotRemove(eA))
              throw (
                this.logger.warn(
                  `[MergedPlugins] Blocked: uninstall ${eA} is required by enterprise policy`,
                ),
                Error(`Plugin '${ec}' is required by enterprise policy.`)
              );
          }
        let eu: any = new Set(eA.map((eA?: any) => this.getPluginId(eA, el)));
        await this.assertNoEnabledDependents(eu, eu, "uninstall");
        let ed: any = new Map(),
          ep: any = [],
          eg: any = "inline" === el,
          eh: any = eg ? void 0 : await this.getMarketplace(el);
        if (!eg && !eh) throw Error(`Marketplace ${el} is not found.`);
        for (let eu of eA) {
          let eA: any = `${eu}@${el}`,
            eh: any = await this.getPlugin(eu, el);
          if (!eh) {
            if (eg) {
              await this.handleUnresolvableInlinePlugin(eA, "uninstall");
              continue;
            }
            throw Error(`Plugin ${eA} is not installed`);
          }
          let ef: any = ec?.scope || eh.installScope || A_.SettingsScope.USER;
          if (
            (ed.set(eA, { scope: ef, plugin: eh }),
            eh.mcpServers && eh.installedPath)
          )
            try {
              let eA: any = [];
              if (
                "string" == typeof eh.mcpServers ||
                Array.isArray(eh.mcpServers)
              )
                for (let el of Array.isArray(eh.mcpServers)
                  ? eh.mcpServers
                  : [eh.mcpServers]) {
                  if ("string" != typeof el) continue;
                  let ec: any = tX.join(eh.installedPath, el);
                  if (await tZ.pathExists(ec)) {
                    let el: any = await tZ.readFile(ec, "utf-8"),
                      eu: any = JSON.parse(el),
                      ed: any = eu.mcpServers || eu;
                    ed && "object" == typeof ed && eA.push(...Object.keys(ed));
                  }
                }
              else
                "object" == typeof eh.mcpServers &&
                  eA.push(...Object.keys(eh.mcpServers));
              for (let el of eA) el && ep.push(el);
            } catch (el: any) {
              this.logger.warn(
                `[PluginManager] uninstallPlugins: failed to collect MCP servers for ${eA}: ${el?.message}`,
              );
            }
        }
        let ef: any = new Map();
        for (let [eA, { scope: el }] of ed) {
          let eu: any = this.getProjectPathForScope(el, ec?.workspacePath),
            ed: any = `${el}\0${eu || ""}`,
            ep: any = ef.get(ed) || {
              scope: el,
              projectPath: eu,
              rootPluginIds: new Set(),
              orphaned: [],
            };
          (ep.rootPluginIds.add(eA), ef.set(ed, ep));
        }
        if (!eg && ec?.prune)
          for (let eA of ef.values())
            eA.orphaned = await this.findOrphanedAutoDependencies(
              eA.scope,
              eA.projectPath,
              eA.rootPluginIds,
            );
        if (
          (this.logger.info(
            `Uninstalling plugins: ${Array.from(ed.keys()).join(",")}...`,
          ),
          ep.length > 0)
        )
          try {
            let eA: any = tV.ContainerUtil.get(Aj.McpOAuthManager);
            for (let el of ep)
              try {
                (await eA.invalidateCredentials(el, "all"),
                  this.logger.info(
                    `[PluginManager] Cleared OAuth credentials for uninstalled plugin MCP server: ${el}`,
                  ));
              } catch (eA: any) {
                this.logger.warn(
                  `[PluginManager] Failed to clear OAuth credentials for ${el}: ${eA?.message}`,
                );
              }
          } catch (eA: any) {
            this.logger.warn(
              `[PluginManager] Failed to resolve McpOAuthManager, skip OAuth cleanup: ${eA?.message}`,
            );
          }
        for (let [eA, { scope: el }] of ed.entries())
          await this.updateEnabledPlugins(
            (el?: any) => {
              delete el[eA];
            },
            el,
            ec?.workspacePath,
          );
        let em: any = new Set();
        if (!eg) {
          for (let eA of ef.values())
            for (let el of (eA.orphaned.length > 0 &&
              (await this.updateEnabledPlugins(
                (el?: any) => {
                  for (let ec of eA.orphaned) delete el[ec.pluginId];
                },
                eA.scope,
                eA.projectPath,
              )),
            await this.removeInstalledPluginRecordsForScope(
              [
                ...eA.rootPluginIds,
                ...eA.orphaned.map((eA?: any) => eA.pluginId),
              ],
              eA.scope,
              eA.projectPath,
            )))
              em.add(el);
          await this.cleanupFinalPluginState(em, ec?.keepData === !0);
        }
        for (let ec of eA) this.clearPluginComponentsCache(ec, el);
        let eE: any = Array.from(ef.values()).flatMap((eA?: any) =>
          eA.orphaned.map((eA?: any) => eA.pluginId),
        );
        for (let eA of eE) {
          let el: any = eA.indexOf("@");
          this.clearPluginComponentsCache(eA.slice(0, el), eA.slice(el + 1));
        }
        if (
          (this.clearAllCaches(),
          this.onDidChangeEmitter.fire(),
          this.logger.info(
            `Plugins ${Array.from(ed.keys()).join(",")} uninstalled successfully`,
          ),
          eE.length > 0 &&
            this.logger.info(
              `Removed orphaned auto-installed dependencies: ${eE.join(",")}`,
            ),
          eh)
        )
          for (let [, { scope: eA, plugin: el }] of ed.entries())
            this.pluginTelemetryService.reportPluginAction({
              plugin: el,
              marketplace: eh,
              action: "uninstall",
              scope: eA,
            });
      } catch (ec: any) {
        for (let eu of (this.logger.error(
          `Failed to uninstall plugins ${eA.join(",")}@${el}: ${ec}`,
        ),
        eA))
          this.errorCollector.addError({
            type: t$.PluginErrorType.UninstallFailed,
            pluginName: eu,
            marketplaceName: el,
            message: `Failed to uninstall plugin '${eu}'`,
            details: ec instanceof Error ? ec.message : String(ec),
          });
        throw ec;
      }
    }
    async prunePlugins(eA?: any): Promise<any> {
      let el: any = eA?.scope || A_.SettingsScope.USER,
        ec: any = this.getProjectPathForScope(el, eA?.workspacePath),
        eu: any = (
          await this.findOrphanedAutoDependencies(el, ec, new Set())
        ).map((eA?: any) => eA.pluginId);
      if (eA?.dryRun || 0 === eu.length) return eu;
      await this.updateEnabledPlugins(
        (eA?: any) => {
          for (let el of eu) delete eA[el];
        },
        el,
        ec,
      );
      let ed: any = await this.removeInstalledPluginRecordsForScope(eu, el, ec);
      for (let eA of (await this.cleanupFinalPluginState(ed), eu)) {
        let el: any = eA.indexOf("@");
        this.clearPluginComponentsCache(eA.slice(0, el), eA.slice(el + 1));
      }
      return (this.clearAllCaches(), this.onDidChangeEmitter.fire(), eu);
    }
    async enablePlugins(eA?: any, el?: any, ec?: any): Promise<any> {
      let eu: any = ec?.persist !== !1;
      try {
        let ed: any = [],
          ep: any = [];
        if (!ec?.bypassPolicyCheck)
          for (let ec of eA) {
            let eA: any = `${ec}@${el}`;
            if (this.pluginPolicyService.isPluginCannotSwitchoff(eA))
              throw (
                this.logger.warn(
                  `[MergedPlugins] Blocked: enable ${eA} is controlled by enterprise policy`,
                ),
                Error(`Plugin '${ec}' is controlled by enterprise policy.`)
              );
          }
        let eg: any = "inline" === el,
          eh: any = eg ? void 0 : await this.getMarketplace(el);
        if (!eg && !eh) throw Error(`Marketplace ${el} is not found.`);
        for (let eu of eA) {
          let eA: any = `${eu}@${el}`,
            eh: any = await this.getPlugin(eu, el);
          if (!eh) {
            if (eg) {
              await this.handleUnresolvableInlinePlugin(eA, "enable");
              continue;
            }
            throw Error(`Plugin ${eA} is not installed`);
          }
          if (eh.status === t$.PluginStatus.Enabled && !ec?.scope) {
            (this.logger.info(`Plugin ${eA} is already enabled`), ep.push(eh));
            continue;
          }
          (ep.push(eh), ed.push(eh));
        }
        let ef: any = await this.enableDependenciesForPlugins(ep, eh, {
          persist: eu,
          scope: ec?.scope,
          workspacePath: ec?.workspacePath,
        });
        if (0 === ed.length && 0 === ef.length)
          return void this.logger.info("All plugins are already enabled");
        for (let eA of (this.logger.info(
          `Enabling plugins: ${ed.map((eA?: any) => `${eA.name}@${eA.marketplaceName}`).join(",")}...`,
        ),
        ed)) {
          let el: any = `${eA.name}@${eA.marketplaceName}`,
            ed: any = ec?.scope || eA.installScope || A_.SettingsScope.USER;
          ((eA.status = t$.PluginStatus.Enabled),
            eu &&
              (await this.updateEnabledPlugins(
                (eA?: any) => {
                  eA[el] = !0;
                },
                ed,
                ec?.workspacePath,
              )));
        }
        for (let ec of eA) this.clearPluginComponentsCache(ec, el);
        if (
          (eu
            ? this.clearAllCaches()
            : this.syncInstalledPluginsCache([...ef, ...ed]),
          this.onDidChangeEmitter.fire(),
          this.logger.info(
            `Plugins ${ed.map((eA?: any) => `${eA.name}@${eA.marketplaceName}`).join(",")} enabled successfully${eu ? "" : " (non-persistent)"}`,
          ),
          eh)
        )
          for (let eA of ed)
            this.pluginTelemetryService.reportPluginAction({
              plugin: eA,
              marketplace: eh,
              action: "enable",
              scope: ec?.scope || eA.installScope || A_.SettingsScope.USER,
            });
      } catch (ec: any) {
        for (let eu of (this.logger.error(
          `Failed to enable plugins ${eA.join(",")}@${el}: ${ec}`,
        ),
        ec instanceof PluginDependencyResolutionError &&
          this.recordDependencyResolutionError(ec),
        eA))
          this.errorCollector.addError({
            type: t$.PluginErrorType.EnableFailed,
            pluginName: eu,
            marketplaceName: el,
            message: `Failed to enable plugin '${eu}'`,
            details: ec instanceof Error ? ec.message : String(ec),
          });
        throw ec;
      }
    }
    async disablePlugins(eA?: any, el?: any, ec?: any): Promise<any> {
      let eu: any = ec?.persist !== !1;
      try {
        let ed: any = [];
        for (let ec of eA) {
          let eA: any = `${ec}@${el}`;
          if (this.pluginPolicyService.isPluginCannotSwitchoff(eA))
            throw (
              this.logger.warn(
                `[MergedPlugins] Blocked: disable ${eA} is required by enterprise policy`,
              ),
              Error(`Plugin '${ec}' is required by enterprise policy.`)
            );
        }
        let ep: any = new Set(eA.map((eA?: any) => this.getPluginId(eA, el)));
        await this.assertNoEnabledDependents(ep, ep, "disable");
        let eg: any = "inline" === el,
          eh: any = eg ? void 0 : await this.getMarketplace(el);
        if (!eg && !eh) throw Error(`Marketplace ${el} is not found.`);
        for (let eu of eA) {
          let eA: any = `${eu}@${el}`,
            ep: any = await this.getPlugin(eu, el);
          if (!ep) {
            if (eg) {
              await this.handleUnresolvableInlinePlugin(eA, "disable");
              continue;
            }
            throw Error(`Plugin ${eA} is not installed`);
          }
          if (ep.status === t$.PluginStatus.Disabled && !ec?.scope) {
            this.logger.info(`Plugin ${eA} is already disabled`);
            continue;
          }
          ed.push(ep);
        }
        if (0 === ed.length)
          return void this.logger.info("All plugins are already disabled");
        for (let eA of (this.logger.info(
          `Disabling plugins: ${ed.map((eA?: any) => `${eA.name}@${eA.marketplaceName}`).join(",")}...`,
        ),
        ed)) {
          let el: any = `${eA.name}@${eA.marketplaceName}`,
            ed: any = ec?.scope || eA.installScope || A_.SettingsScope.USER;
          ((eA.status = t$.PluginStatus.Disabled),
            eu &&
              (await this.updateEnabledPlugins(
                (eA?: any) => {
                  eA[el] = !1;
                },
                ed,
                ec?.workspacePath,
              )));
        }
        for (let ec of eA) this.clearPluginComponentsCache(ec, el);
        if (
          (eu ? this.clearAllCaches() : this.syncInstalledPluginsCache(ed),
          this.onDidChangeEmitter.fire(),
          this.logger.info(
            `Plugins ${ed.map((eA?: any) => `${eA.name}@${eA.marketplaceName}`).join(",")} disabled successfully${eu ? "" : " (non-persistent)"}`,
          ),
          eh)
        )
          for (let eA of ed)
            this.pluginTelemetryService.reportPluginAction({
              plugin: eA,
              marketplace: eh,
              action: "disable",
              scope: ec?.scope || eA.installScope || A_.SettingsScope.USER,
            });
      } catch (ec: any) {
        for (let eu of (this.logger.error(
          `Failed to disable plugins ${eA.join(",")}@${el}: ${ec}`,
        ),
        eA))
          this.errorCollector.addError({
            type: t$.PluginErrorType.DisableFailed,
            pluginName: eu,
            marketplaceName: el,
            message: `Failed to disable plugin '${eu}'`,
            details: ec instanceof Error ? ec.message : String(ec),
          });
        throw ec;
      }
    }
    async switchPlugins(eA?: any, el?: any, ec?: any, eu?: any): Promise<any> {
      let ed: any = eu?.persist !== !1;
      try {
        let eu: any = "inline" === ec,
          ep: any = eu ? void 0 : await this.getMarketplace(ec);
        if (!eu && !ep) throw Error(`Marketplace ${ec} is not found.`);
        let eg: any = [],
          eh: any = [];
        for (let eA of el) {
          let el: any = `${eA}@${ec}`,
            ed: any = await this.getPlugin(eA, ec);
          if (!ed) {
            if (eu) {
              await this.handleUnresolvableInlinePlugin(el, "enable");
              continue;
            }
            this.logger.warn(
              `[switchPlugins] Plugin ${el} not found, skipping enable`,
            );
            continue;
          }
          eh.push(ed);
        }
        if (eA.length > 0 && eh.length > 0) {
          let el: any = new Set(eA.map((eA?: any) => this.getPluginId(eA, ec))),
            eu: any = new Map(
              (await this.getInstalledPlugins()).map((eA?: any) => [
                this.getPluginId(eA.name, eA.marketplaceName),
                {
                  pluginId: this.getPluginId(eA.name, eA.marketplaceName),
                  plugin: eA,
                  marketplace: ep,
                },
              ]),
            );
          for (let eA of eh) {
            let ec: any = this.collectKnownDependencyIds(eA, eu),
              ed: any = Array.from(ec).find((eA?: any) => el.has(eA));
            if (ed)
              throw Error(
                `Cannot disable ${ed} while enabling a plugin that depends on it.`,
              );
          }
        }
        let ef: any = await this.enableDependenciesForPlugins(eh, ep, {
          persist: ed,
        });
        if ((eg.push(...ef), eA.length > 0)) {
          let el: any = new Set(eA.map((eA?: any) => this.getPluginId(eA, ec)));
          await this.assertNoEnabledDependents(el, el, "disable");
        }
        for (let el of eA) {
          let eA: any = `${el}@${ec}`,
            ep: any = await this.getPlugin(el, ec);
          if (!ep) {
            if (eu) {
              await this.handleUnresolvableInlinePlugin(eA, "disable");
              continue;
            }
            this.logger.warn(
              `[switchPlugins] Plugin ${eA} not found, skipping disable`,
            );
            continue;
          }
          ep.status !== t$.PluginStatus.Disabled &&
            ((ep.status = t$.PluginStatus.Disabled),
            ed &&
              (await this.updateEnabledPlugins((el?: any) => {
                el[eA] = !1;
              }, ep.installScope || A_.SettingsScope.USER)),
            this.clearPluginComponentsCache(el, ec),
            eg.push(ep));
        }
        for (let eA of eh) {
          let el: any = this.getPluginId(eA.name, eA.marketplaceName);
          eA.status !== t$.PluginStatus.Enabled &&
            ((eA.status = t$.PluginStatus.Enabled),
            ed &&
              (await this.updateEnabledPlugins((eA?: any) => {
                eA[el] = !0;
              }, eA.installScope || A_.SettingsScope.USER)),
            this.clearPluginComponentsCache(eA.name, eA.marketplaceName),
            eg.push(eA));
        }
        if (0 === eg.length)
          return void this.logger.info("[switchPlugins] No changes needed");
        (ed ? this.clearAllCaches() : this.syncInstalledPluginsCache(eg),
          this.onDidChangeEmitter.fire(),
          this.logger.info(
            `[switchPlugins] disabled=[${eA.join(",")}], enabled=[${el.join(",")}] @${ec}${ed ? "" : " (non-persistent)"}`,
          ));
      } catch (eA: any) {
        throw (this.logger.error(`[switchPlugins] Failed: ${eA}`), eA);
      }
    }
    async getInstalledPlugins(): Promise<any> {
      if ((await this.ensureInitialized(), !this.installedPluginsCache))
        for (; !this.installedPluginsCache; ) {
          if (!this.installedPluginsLoading) {
            let eA: any = this.cacheGeneration,
              el: any = this.loadInstalledPlugins(eA).finally(() => {
                this.installedPluginsLoading === el &&
                  (this.installedPluginsLoading = void 0);
              });
            this.installedPluginsLoading = el;
          }
          await this.installedPluginsLoading;
        }
      let eA: any = [...(this.installedPluginsCache || [])];
      for (let [, el] of await this.getInlinePlugins()) {
        let ec: any = eA.findIndex(
          (eA?: any) =>
            eA.name === el.name && eA.marketplaceName === el.marketplaceName,
        );
        ec >= 0 ? this.mergePluginFields(eA[ec], el) : eA.push(el);
      }
      return eA;
    }
    async loadLocalPluginInfo(eA?: any): Promise<any> {
      for (let el of t$.PLUGINS_METADATA_DIRS) {
        let ec: any = tX.join(eA, el, t$.PLUGIN_MANIFEST_FILE);
        if (await tZ.pathExists(ec))
          try {
            let el: any = JSON.parse(await tZ.readFile(ec, "utf-8")),
              eu: any = tX.join(eA, "settings.json");
            if (await tZ.pathExists(eu))
              try {
                let eA: any = JSON.parse(await tZ.readFile(eu, "utf-8")),
                  ec: any = {
                    ...(eA.agent ? { agent: eA.agent } : {}),
                    ...(void 0 !== eA.subagentStatusLine
                      ? { subagentStatusLine: eA.subagentStatusLine }
                      : {}),
                  };
                Object.keys(ec).length > 0 &&
                  (el.settings = { ...el.settings, ...ec });
              } catch {
                this.logger.debug(`Failed to parse settings.json at ${eu}`);
              }
            let ed: any = `${el.name}@inline`,
              ep: any = t$.PluginStatus.Enabled;
            try {
              let eA: any =
                ((await this.cliSettingSourcesProvider.isScopeAllowed(
                  A_.SettingsScope.USER,
                )) &&
                  (await this.settingsManager.get(
                    "enabledPlugins",
                    A_.SettingsScope.USER,
                  ))) ||
                {};
              ed in eA && !eA[ed] && (ep = t$.PluginStatus.Disabled);
            } catch {}
            let eg: any = {
              ...el,
              marketplaceName: "inline",
              source: eA,
              status: ep,
              installedPath: eA,
            };
            return (await this.enrichPluginInfo(eg, eA), eg);
          } catch (eA: any) {
            this.logger.warn(`Failed to parse plugin manifest at ${ec}`, eA);
          }
      }
    }
    async hydratePluginInfo(eA?: any, el?: any): Promise<any> {
      let ec: any = (await this.getEnabledPlugins())[
        `${eA.name}@${eA.marketplaceName}`
      ];
      if (
        (ec &&
          ((eA.status = ec.enabled
            ? t$.PluginStatus.Enabled
            : t$.PluginStatus.Disabled),
          (eA.installScope = ec.scope)),
        this.shouldRunDirectoryPluginFromSource(el))
      )
        return (
          eA.installedPath &&
            (await this.enrichPluginInfo(eA, eA.installedPath)),
          eA
        );
      let eu: any =
        el.type === t$.MarketplaceType.Directory && !0 === el.isBuiltIn
          ? await this.resolveBuiltinSeedPluginCache(eA)
          : await this.resolveInstalledPluginCache(eA, ec?.scope);
      if (
        ((eA.installedPath = eu?.installPath),
        eu &&
          ((eA.version = eu.resolvedVersion || eu.version || eA.version),
          (eA.resolvedVersion = eu.resolvedVersion),
          (eA.gitCommitSha = eu.gitCommitSha),
          (eA.autoInstalled = eu.auto)),
        !eA.installedPath && this.installedPluginsCache)
      ) {
        let el: any = this.installedPluginsCache.find(
          (el?: any) =>
            el.name === eA.name && el.marketplaceName === eA.marketplaceName,
        );
        el?.installedPath && (eA.installedPath = el.installedPath);
      }
      return (
        eA.installedPath && (await this.enrichPluginInfo(eA, eA.installedPath)),
        eA
      );
    }
    shouldRunDirectoryPluginFromSource(eA?: any): any {
      return eA.type === t$.MarketplaceType.Directory && !0 !== eA.isBuiltIn;
    }
    async getPlugin(eA?: any, el?: any): Promise<any> {
      if ("inline" === el) return (await this.getInlinePlugins()).get(eA);
      let ec: any = this.installedPluginsCache?.find(
        (ec?: any) => ec.name === eA && ec.marketplaceName === el,
      );
      if (ec) return this.clonePluginInfo(ec);
      let eu: any = await this.getMarketplace(el);
      if (!eu) return;
      if ("function" != typeof eu.listPlugins) {
        let el: any = await eu.getPlugin(eA);
        return el ? this.hydratePluginInfo(el, eu) : void 0;
      }
      let ed: any = (await this.listMarketplacePlugins(eu)).find(
        (el?: any) => el.name === eA,
      );
      if (ed) return this.hydratePluginInfo(ed, eu);
    }
    async getPluginComponents(eA?: any, el?: any): Promise<any> {
      try {
        let ec: any = `${eA}@${el}`,
          eu: any = this.pluginComponentsCache.get(ec);
        if (eu)
          return (
            this.logger.debug(`Using cached plugin components for ${ec}`),
            eu
          );
        let ed: any = this.pluginComponentsLoading.get(ec);
        if (ed) return ed;
        let ep: any = this.doLoadPluginComponents(eA, el, ec);
        this.pluginComponentsLoading.set(ec, ep);
        try {
          let eA: any = await ep;
          return (
            eA &&
              this.pluginComponentsLoading.get(ec) === ep &&
              this.pluginComponentsCache.set(ec, eA),
            eA
          );
        } finally {
          this.pluginComponentsLoading.get(ec) === ep &&
            this.pluginComponentsLoading.delete(ec);
        }
      } catch (ec: any) {
        throw (
          this.logger.error(
            `Failed to load plugin components for ${eA}@${el}: ${ec}`,
          ),
          this.errorCollector.addError({
            type: t$.PluginErrorType.LoadFailed,
            componentType: "PluginComponents",
            pluginName: eA,
            marketplaceName: el,
            message: `Failed to load components for plugin '${eA}'`,
            details: ec instanceof Error ? ec.message : String(ec),
          }),
          ec
        );
      }
    }
    async getActivePlugins(): Promise<any> {
      return this.activePlugins ?? rI;
    }
    async refreshActivePlugins(eA: any = {}): Promise<any> {
      let el: any = await this.getInstalledPlugins(),
        ec: any = new Map(
          el.map((eA?: any) => [
            this.getPluginId(eA.name, eA.marketplaceName),
            eA,
          ]),
        ),
        eu: any = [];
      for (let eA of el) {
        let el: any = this.getPluginId(eA.name, eA.marketplaceName);
        for (let ed of eA.dependencyErrors ?? []) {
          let ep: any = ed.dependencyMarketplace ?? eA.marketplaceName,
            eg: any = this.getPluginId(ed.dependency, ep),
            eh: any = ec.get(eg),
            ef: any =
              "dependency-version-unsatisfied" === ed.code
                ? "version-unsatisfied"
                : "dependency-unsatisfied" === ed.code
                  ? eh?.installedPath
                    ? "not-enabled"
                    : "not-found"
                  : "unknown";
          eu.push(
            Object.freeze({
              type: "dependency-unsatisfied",
              source: el,
              message: ed.message,
              reason: ef,
              dependency: ed.dependency,
              dependencyMarketplace: ep,
            }),
          );
        }
      }
      let ed: any = el.filter(
          (eA?: any) =>
            eA.status === t$.PluginStatus.Enabled && !!eA.installedPath,
        ),
        ep: any = await Promise.all(
          ed.map(async (eA?: any) => {
            let el: any = this.getPluginId(eA.name, eA.marketplaceName);
            try {
              let ec: any = await this.getPluginComponents(
                eA.name,
                eA.marketplaceName,
              );
              if (!ec)
                return {
                  error: Object.freeze({
                    type: "component-load-failed",
                    source: el,
                    message: `Plugin components are unavailable for ${el}`,
                  }),
                };
              return {
                entry: Object.freeze({
                  plugin: Object.freeze({ ...eA }),
                  components: ec,
                }),
              };
            } catch (eA: any) {
              return {
                error: Object.freeze({
                  type: "component-load-failed",
                  source: el,
                  message: eA instanceof Error ? eA.message : String(eA),
                }),
              };
            }
          }),
        ),
        eg: any = Object.freeze(
          ep.map((eA?: any) => eA.entry).filter((eA?: any) => !!eA),
        ),
        eh: any = Object.freeze([
          ...eu,
          ...ep.map((eA?: any) => eA.error).filter((eA?: any) => !!eA),
        ]);
      return (
        await eA.beforeCommit?.(
          Object.freeze({
            previousActivePlugins: this.activePlugins ?? rI,
            activePlugins: eg,
            errors: eh,
          }),
        ),
        this.mcpPluginRegistry?.replace(
          eg.flatMap(({ plugin: eA, components: el }: any) =>
            Object.keys(el.mcpServers ?? {}).map((el?: any) => [
              el,
              { pluginName: eA.name, marketplaceName: eA.marketplaceName },
            ]),
          ),
        ),
        (this.activePlugins = eg),
        this.logger.info(
          `[PluginManager] active plugins refreshed: ${eg.length} enabled, errors=${eh.length}`,
        ),
        eg
      );
    }
    async doLoadPluginComponents(eA?: any, el?: any, ec?: any): Promise<any> {
      this.logger.info(`Loading plugin components for ${ec}`);
      let eu: any = await this.getPlugin(eA, el);
      if (!eu) return void this.logger.error(`Plugin ${ec} not found`);
      let ed: any = eu.installedPath;
      if (!ed)
        return void this.logger.error(
          `Plugin ${ec} installation path not found`,
        );
      if (this.pluginLoadGuard)
        try {
          if (!(await this.pluginLoadGuard.canLoad(eu))) {
            (this.logger.error(`Plugin ${ec} blocked by PluginLoadGuard`),
              this.errorCollector.addError({
                type: t$.PluginErrorType.LoadFailed,
                pluginName: eA,
                marketplaceName: el,
                message: `Plugin '${eA}' integrity verification failed`,
                details: "Directory integrity check did not pass",
              }));
            return;
          }
        } catch (ed: any) {
          let eu: any = ed instanceof Error ? ed.message : String(ed);
          (this.logger.error(`Plugin ${ec} PluginLoadGuard threw: ${eu}`),
            this.errorCollector.addError({
              type: t$.PluginErrorType.LoadFailed,
              pluginName: eA,
              marketplaceName: el,
              message: `Plugin '${eA}' integrity verification error`,
              details: eu,
            }));
          return;
        }
      return await this.pluginLoaderManager.loadPluginComponents(eu, ed);
    }
    whenReady(): any {
      if (!this.readyPromise) {
        let eA: any = this.ensureInitialized();
        this.readyPromise = this.startupPluginPreparationPromise ?? eA;
      }
      return this.readyPromise;
    }
    clearAllCaches(): any {
      (this.cacheGeneration++,
        (this.marketplaceCache = void 0),
        (this.installedPluginsCache = void 0),
        (this.installedPluginsLoading = void 0),
        (this.installedPluginsRegistryCache = void 0),
        (this.installedPluginsRegistryLoading = void 0),
        this.marketplacePluginsCache?.clear(),
        this.marketplacePluginsCacheMtime?.clear(),
        this.marketplacePluginsLoading?.clear(),
        this.pluginComponentsCache?.clear(),
        this.pluginComponentsLoading?.clear(),
        (this.enabledPluginsCache = void 0));
    }
    syncInstalledPluginsCache(eA?: any): any {
      for (let el of (this.installedPluginsCache ||
        (this.installedPluginsCache = []),
      eA)) {
        let eA: any = this.installedPluginsCache.findIndex(
          (eA?: any) =>
            eA.name === el.name && eA.marketplaceName === el.marketplaceName,
        );
        eA >= 0
          ? (this.installedPluginsCache[eA] = el)
          : this.installedPluginsCache.push(el);
      }
    }
    clearCache(): any {
      this.logger.debug("[HotReload] Clearing plugin cache");
      let eA: any = this.marketplaceCache || [];
      for (let el of (this.clearAllCaches(), eA)) el.clearPluginListCache?.();
      ((this.inlinePluginsCache = void 0), this.onDidChangeEmitter.fire());
    }
    async getInlinePlugins(): Promise<any> {
      if (this.inlinePluginsCache) return this.inlinePluginsCache;
      let eA: any = new Map(),
        el: any = process.env.CODEBUDDY_PLUGIN_DIRS;
      if (!el) return eA;
      for (let ec of el.split(tX.delimiter).filter(Boolean))
        try {
          let el: any = await this.loadLocalPluginInfo(ec);
          el && eA.set(el.name, el);
        } catch {}
      return ((this.inlinePluginsCache = eA), eA);
    }
    async enrichPluginInfo(eA?: any, el?: any): Promise<any> {
      try {
        for (let ec of t$.PLUGINS_METADATA_DIRS) {
          let eu: any = tX.join(el, ec, t$.PLUGIN_MANIFEST_FILE);
          if (await tZ.pathExists(eu)) {
            let el: any = JSON.parse(await tZ.readFile(eu, "utf-8"));
            for (let ec of [
              "hooks",
              "commands",
              "skills",
              "agents",
              "mcpServers",
              "mcpBundles",
              "lspServers",
              "outputStyles",
              "themes",
              "monitors",
              "experimental",
              "settings",
              "dependencies",
              "defaultEnabled",
            ]) {
              if ("dependencies" === ec) {
                this.mergePluginDependencies(eA, el.dependencies);
                continue;
              }
              null == eA[ec] && null != el[ec] && (eA[ec] = el[ec]);
            }
            break;
          }
        }
      } catch {}
      try {
        if (!eA.commands) {
          let ec: any = tX.join(el, "commands");
          if (await tZ.pathExists(ec)) {
            let el: any = await tZ.readdir(ec),
              eu: any = [];
            for (let eA of el.filter((eA?: any) => eA.endsWith(".md"))) {
              let el: any = eA.replace(/\.md$/, "");
              try {
                let ed: any = await tZ.readFile(tX.join(ec, eA), "utf-8"),
                  ep: any = ed
                    .match(
                      /^---\s*\n[\s\S]*?description:\s*(.+?)\n[\s\S]*?---/,
                    )?.[1]
                    ?.trim();
                eu.push(ep ? { name: el, description: ep } : el);
              } catch {
                eu.push(el);
              }
            }
            eA.commands = eu;
          }
        }
        if (!eA.skills) {
          let ec: any = tX.join(el, "skills");
          if (await tZ.pathExists(ec)) {
            let el: any = await tZ.readdir(ec),
              eu: any = [];
            for (let eA of el.filter((eA?: any) => !eA.startsWith("."))) {
              try {
                let el: any = tX.join(ec, eA, "SKILL.md");
                if (await tZ.pathExists(el)) {
                  let eA: any = await tZ.readFile(el, "utf-8"),
                    ec: any = eA
                      .match(/^---\s*\n[\s\S]*?name:\s*(.+?)\n/)?.[1]
                      ?.trim(),
                    ed: any = eA
                      .match(/^---\s*\n[\s\S]*?description:\s*(.+?)\n/)?.[1]
                      ?.trim();
                  if (ec) {
                    eu.push({ name: ec, description: ed || "" });
                    continue;
                  }
                }
              } catch {}
              eu.push(`./skills/${eA}`);
            }
            eA.skills = eu;
          }
        }
        if (!eA.hooks) {
          let ec: any = tX.join(el, "hooks");
          if (await tZ.pathExists(ec)) {
            let el: any = (await tZ.readdir(ec)).filter((eA?: any) =>
              eA.endsWith(".json"),
            );
            el.length > 0 && (eA.hooks = `hooks/${el[0]}`);
          }
        }
      } catch {}
    }
    mergePluginFields(eA?: any, el?: any): any {
      for (let ec of [
        "skills",
        "commands",
        "hooks",
        "agents",
        "mcpServers",
        "lspServers",
        "outputStyles",
        "dependencies",
      ]) {
        if ("dependencies" === ec) {
          this.mergePluginDependencies(eA, el.dependencies);
          continue;
        }
        null == eA[ec] && null != el[ec] && (eA[ec] = el[ec]);
      }
      !eA.installedPath &&
        el.installedPath &&
        (eA.installedPath = el.installedPath);
    }
    mergePluginDependencies(eA?: any, el?: any): any {
      if (!el?.length) return;
      if (!eA.dependencies?.length) {
        eA.dependencies = [...el];
        return;
      }
      let ec: any = [...eA.dependencies],
        eu: any = new Set(
          ec.map((eA?: any) => this.getDependencyDeclarationKey(eA)),
        );
      for (let eA of el) {
        let el: any = this.getDependencyDeclarationKey(eA);
        eu.has(el) || (eu.add(el), ec.push(eA));
      }
      eA.dependencies = ec;
    }
    getDependencyDeclarationKey(eA?: any): any {
      return "string" == typeof eA
        ? `string:${eA.trim()}`
        : [
            "object",
            eA.name?.trim() || "",
            eA.marketplace?.trim() || "",
            eA.version?.trim() || "",
          ].join(":");
    }
    async handleUnresolvableInlinePlugin(eA?: any, el?: any): Promise<any> {
      (this.logger.info(
        `Inline plugin ${eA} not resolvable, updating settings only`,
      ),
        await this.updateEnabledPlugins((ec?: any) => {
          "uninstall" === el ? delete ec[eA] : (ec[eA] = "enable" === el);
        }, A_.SettingsScope.USER),
        this.clearAllCaches(),
        (this.inlinePluginsCache = void 0),
        this.onDidChangeEmitter.fire());
    }
    async getPluginBinPaths(): Promise<any> {
      try {
        let eA: any = await this.getActivePlugins(),
          el: any = [];
        for (let { plugin: ec } of eA)
          if (ec.installedPath) {
            let eA: any = tX.join(ec.installedPath, "bin"),
              eu: any = await tZ.stat(eA).catch(() => void 0);
            eu?.isDirectory() && el.push(eA);
          }
        return el;
      } catch (eA: any) {
        return (this.logger.debug("Failed to get plugin bin paths", eA), []);
      }
    }
    async getPluginOptions(eA?: any, el?: any): Promise<any> {
      let eu: any = `${eA}@${el}`;
      try {
        let { PluginOptionsStorage: eA } = await Promise.resolve().then(
            ec.bind(ec, 2845),
          ),
          el: any = this.container;
        if (el) {
          let ec: any = el.get(eA);
          if (ec) return await ec.loadOptions(eu);
        }
      } catch {}
      return {};
    }
    async savePluginOptions(eA?: any, el?: any, eu?: any): Promise<any> {
      let ed: any = `${eA}@${el}`;
      try {
        let ep: any = await this.getPlugin(eA, el);
        if (!ep?.userConfig)
          throw Error(`Plugin ${ed} does not define userConfig`);
        let { PluginOptionsStorage: eg } = await Promise.resolve().then(
            ec.bind(ec, 2845),
          ),
          eh: any = this.container;
        if (eh) {
          let eA: any = eh.get(eg);
          eA && (await eA.saveOptions(ed, eu, ep.userConfig));
        }
      } catch (eA: any) {
        throw (
          this.logger.error(`Failed to save plugin options for ${ed}`, eA),
          eA
        );
      }
    }
    clearPluginComponentsCache(eA?: any, el?: any): any {
      let ec: any = `${eA}@${el}`;
      this.pluginComponentsCache.delete(ec);
    }
    async findMarketplaceBySource(eA?: any): Promise<any> {
      if (eA)
        try {
          let el: any = eA.replace(/\.git$/, "").toLowerCase();
          for (let eA of await this.marketplaceStorage.getMarketplaces()) {
            let ec: any = eA?.source;
            if (!ec) continue;
            let eu: any = ec.url?.replace(/\.git$/, "").toLowerCase();
            if (eu && eu === el)
              return (
                this.logger.info(
                  `[findMarketplaceBySource] Matched by url: ${eA.name}`,
                ),
                this.getMarketplace(eA.storageName || eA.name)
              );
            let ed: any = ec.path?.replace?.(/\.git$/, "").toLowerCase();
            if (ed && ed === el)
              return (
                this.logger.info(
                  `[findMarketplaceBySource] Matched by path: ${eA.name}`,
                ),
                this.getMarketplace(eA.storageName || eA.name)
              );
            if (ec.repo) {
              let eu: any = ec.repo.replace(/\.git$/, "").toLowerCase();
              if (el === eu || el.endsWith("/" + eu))
                return (
                  this.logger.info(
                    `[findMarketplaceBySource] Matched by repo: ${eA.name}`,
                  ),
                  this.getMarketplace(eA.storageName || eA.name)
                );
            }
          }
          return;
        } catch (eA: any) {
          this.logger.warn(
            `[findMarketplaceBySource] Failed to check existing marketplaces: ${eA}`,
          );
          return;
        }
    }
    async readMarketplaceManifestName(eA?: any): Promise<any> {
      if (eA)
        try {
          for (let el of t$.PLUGINS_METADATA_DIRS) {
            let ec: any = tX.join(eA, el, t$.MARKETPLACE_MANIFEST_FILE);
            if (await tZ.pathExists(ec)) {
              let eA: any = await tZ.readJSON(ec),
                el: any = eA?.name;
              return "string" == typeof el && el.length > 0 ? el : void 0;
            }
          }
        } catch (el: any) {
          this.logger.warn(
            `[readMarketplaceManifestName] Failed to read manifest at ${eA}: ${el}`,
          );
        }
    }
    async cleanupDuplicateMarketplaces(eA?: any): Promise<any> {
      for (let el of eA) {
        let eA: any = el.storageName || el.name;
        try {
          (await this.marketplaceStorage.removeMarketplace(eA),
            this.logger.info(
              `[cleanupDuplicateMarketplaces] Removed duplicate storage entry '${eA}' (name='${el.name}', source=${JSON.stringify(el.source)})`,
            ));
        } catch (el: any) {
          this.logger.warn(
            `[cleanupDuplicateMarketplaces] Failed to remove duplicate '${eA}': ${el}`,
          );
        }
      }
    }
    async parseSource(eA?: any): Promise<any> {
      let el: any = t5.PathUtils.resolveFilePathToWorkDir(eA);
      if (await tZ.pathExists(el)) {
        let eA: any = el.toLowerCase();
        return eA.endsWith(".zip") ||
          eA.endsWith(".tgz") ||
          eA.endsWith(".tar.gz")
          ? { source: t$.MarketplaceType.Zip, path: el, url: el }
          : { source: t$.MarketplaceType.Directory, path: el };
      }
      if (eA.startsWith("npm:") || eA.startsWith("pip:"))
        return { source: t$.MarketplaceType.URL, path: eA, url: eA };
      if (eA.match(/^[\w-]+\/[\w-]+$/))
        return { source: t$.MarketplaceType.Github, repo: eA };
      if (eA.startsWith("git@"))
        return { source: t$.MarketplaceType.Git, path: eA, url: eA };
      try {
        let el: any = new URL(eA);
        if ("http:" !== el.protocol && "https:" !== el.protocol)
          throw Error(`Unsupported protocol: ${el.protocol}`);
        if (!el.hostname) throw Error("Invalid URL: missing hostname");
        let ec: any = el.pathname.toLowerCase();
        if (ec.endsWith(".json"))
          return { source: t$.MarketplaceType.URL, path: eA, url: eA };
        if (
          ec.endsWith(".zip") ||
          ec.endsWith(".tgz") ||
          ec.endsWith(".tar.gz")
        )
          return { source: t$.MarketplaceType.Zip, path: eA, url: eA };
        return { source: t$.MarketplaceType.Git, path: eA, url: eA };
      } catch (el: any) {
        if (eA.endsWith(".git"))
          return { source: t$.MarketplaceType.Git, path: eA, url: eA };
        throw Error(
          `Unsupported source format: ${eA}. Error: ${el instanceof Error ? el.message : String(el)}`,
        );
      }
    }
    async getEnabledPlugins(): Promise<any> {
      if (this.enabledPluginsCache) return this.enabledPluginsCache;
      let readScoped: any = async (eA?: any) =>
          ((await this.cliSettingSourcesProvider.isScopeAllowed(eA)) &&
            (await this.settingsManager.get("enabledPlugins", eA))) ||
          {},
        eA: any = {},
        el: any = await readScoped(A_.SettingsScope.USER),
        ec: any = await readScoped(A_.SettingsScope.PROJECT),
        eu: any = await readScoped(A_.SettingsScope.PROJECT_LOCAL),
        ed: any = await readScoped(A_.SettingsScope.CLI);
      for (let [ec, eu] of Object.entries(el))
        eA[ec] = { enabled: eu, scope: A_.SettingsScope.USER };
      for (let [el, eu] of Object.entries(ec))
        void 0 === eA[el] &&
          (eA[el] = { enabled: eu, scope: A_.SettingsScope.PROJECT });
      for (let [el, ec] of Object.entries(eu))
        eA[el] = { enabled: ec, scope: A_.SettingsScope.PROJECT_LOCAL };
      for (let [el, ec] of Object.entries(ed))
        eA[el] = { enabled: ec, scope: A_.SettingsScope.CLI };
      for (let [el, ec] of this.sessionEnabledPluginOverrides || [])
        eA[el] = ec;
      return ((this.enabledPluginsCache = eA), eA);
    }
    getSettingsScopePriority(eA?: any): any {
      switch (eA) {
        case A_.SettingsScope.PROJECT:
          return 1;
        case A_.SettingsScope.USER:
          return 2;
        case A_.SettingsScope.PROJECT_LOCAL:
          return 3;
        case A_.SettingsScope.CLI:
          return 4;
      }
    }
    assertDependencyCanBeEnabledAtScope(
      eA?: any,
      el?: any,
      ec?: any,
      eu?: any,
    ): any {
      let ed: any = ec[eA];
      if (
        ed?.enabled === !1 &&
        this.getSettingsScopePriority(ed.scope) >
          this.getSettingsScopePriority(el)
      ) {
        let el: any = eA.indexOf("@");
        this.throwDependencyResolutionError(
          {
            code: "dependency-unsatisfied",
            dependency: eA.slice(0, el),
            dependencyMarketplace: eA.slice(el + 1),
            message: `Dependency ${eA} is disabled at higher-precedence scope ${ed.scope}. Enable it at that scope before enabling ${this.getPluginId(eu.name, eu.marketplaceName)}.`,
          },
          t$.PluginErrorType.DependencyUnsatisfied,
          eu,
        );
      }
    }
    setSessionEnabledPlugins(eA?: any, el?: any): any {
      for (let [ec, eu] of (this.sessionEnabledPluginOverrides ||
        (this.sessionEnabledPluginOverrides = new Map()),
      eA))
        this.sessionEnabledPluginOverrides.set(ec, { enabled: eu, scope: el });
      this.enabledPluginsCache = void 0;
    }
    generateMarketplaceName(eA?: any): any {
      if (eA.includes("/")) {
        let el: any = eA.split("/");
        return el[el.length - 1] || el[el.length - 2] || "marketplace";
      }
      return eA;
    }
    async updateEnabledPlugins(
      eA?: any,
      el: any = A_.SettingsScope.USER,
      ec?: any,
    ): Promise<any> {
      if (
        ec &&
        (el === A_.SettingsScope.PROJECT_LOCAL ||
          el === A_.SettingsScope.PROJECT)
      ) {
        let eu: any;
        if (!tX.isAbsolute(ec))
          throw Error(
            `Invalid workspacePath: must be an absolute path, got ${ec}`,
          );
        if (ec.split(/[\\/]/).includes(".."))
          throw Error(
            `Invalid workspacePath: path traversal segments ('..') are not allowed, got ${ec}`,
          );
        let ed: any = tX.resolve(ec),
          ep: any =
            el === A_.SettingsScope.PROJECT_LOCAL
              ? AH.SETTINGS_LOCAL_FILENAME
              : AH.SETTINGS_FILENAME,
          eg: any = tX.join(ed, ".codebuddy", ep);
        await tZ.mkdirp(tX.dirname(eg));
        let eh: any = {};
        try {
          eu = await tZ.readFile(eg, "utf-8");
          let eA: any = t5.JsonUtils.parse(eu || "{}");
          if (null === eA || "object" != typeof eA || Array.isArray(eA))
            throw Error(`Existing settings file is not a JSON object: ${eg}`);
          eh = eA;
        } catch (eA: any) {
          if (eA?.code !== "ENOENT") throw eA;
        }
        let ef: any = eh.enabledPlugins,
          em: any =
            null === ef || "object" != typeof ef || Array.isArray(ef) ? {} : ef;
        (eA(em), (eh.enabledPlugins = em));
        let eE: any =
            void 0 === eu
              ? JSON.stringify(eh, null, 2)
              : t5.JsonUtils.updateText(eu, eh),
          eC: any = `${eg}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
        (await tZ.writeFile(eC, eE, "utf-8"), await tZ.rename(eC, eg));
        return;
      }
      await this.settingsManager.update(
        "enabledPlugins",
        (el?: any) => {
          let ec: any = {
            ...(el && "object" == typeof el && !Array.isArray(el) ? el : {}),
          };
          return (eA(ec), ec);
        },
        el,
      );
    }
    async installBuiltInMarketplaces(): Promise<any> {
      let eA: any = !1;
      try {
        this.logger.info("Checking for built-in marketplaces to install...");
        let el: any =
          await this.builtInMarketplaceProvider.getBuiltInMarketplaces();
        if (0 === el.length)
          return (this.logger.info("No built-in marketplaces configured"), eA);
        this.logger.info(`Found ${el.length} built-in marketplace(s)`);
        let ec: any = await this.marketplaceStorage.getMarketplaces(),
          eu: any = new Set(ec.map((eA?: any) => eA.name)),
          ed: any = new Set(el.map((eA?: any) => eA.name)),
          ep: any = ec.filter(
            (eA?: any) => eA.isBuiltIn && eA.name !== rO && !ed.has(eA.name),
          );
        ep.length > 0 &&
          (this.logger.info(
            `Found ${ep.length} orphaned built-in marketplace(s) to remove`,
          ),
          (
            await Promise.allSettled(
              ep.map(async (eA?: any) => {
                try {
                  return (
                    await this.marketplaceStorage.removeMarketplace(eA.name),
                    this.logger.info(
                      `Removed orphaned marketplace: ${eA.name}`,
                    ),
                    !0
                  );
                } catch (el: any) {
                  return (
                    this.logger.warn(
                      `Failed to remove orphaned marketplace ${eA.name}: ${el}`,
                    ),
                    !1
                  );
                }
              }),
            )
          ).some((eA?: any) => "fulfilled" === eA.status && !0 === eA.value) &&
            (eA = !0),
          (this.marketplaceCache = void 0),
          this.clearAllCaches());
        let eg: any = el.filter(
          (eA?: any) =>
            !eu.has(eA.name) ||
            (this.logger.debug(
              `Built-in marketplace '${eA.name}' is already installed`,
            ),
            !1),
        );
        if (0 === eg.length)
          return (
            this.logger.info("All built-in marketplaces are already installed"),
            eA
          );
        this.logger.info(
          `Installing ${eg.length} built-in marketplace(s) in parallel...`,
        );
        let eh: any = [],
          ef: any = [];
        for (
          let eA: any = 0;
          eA < eg.length;
          eA += t$.CONCURRENT_MARKETPLACE_INSTALL_LIMIT
        ) {
          let el: any = eg.slice(
            eA,
            eA + t$.CONCURRENT_MARKETPLACE_INSTALL_LIMIT,
          );
          (
            await Promise.allSettled(
              el.map(async (eA?: any) => {
                this.logger.info(
                  `Installing built-in marketplace '${eA.name}'...`,
                );
                let el: any =
                    this.builtInMarketplaceProvider.toMarketplaceSource(eA),
                  ec: any = this.buildSourceString(el);
                await this.addMarketplace(ec, {
                  name: eA.name,
                  autoUpdate: !0,
                  bypassNameValidation: !0,
                  skipDependencyResolution: !0,
                  onProgress: (el?: any) => {
                    this.logger.debug(`[${eA.name}] ${el}`);
                  },
                });
                let eu: any = (
                  await this.marketplaceStorage.getMarketplaces()
                ).find((el?: any) => el.name === eA.name);
                return (
                  eu &&
                    (await this.marketplaceStorage.saveMarketplace({
                      ...eu,
                      isBuiltIn: !0,
                    })),
                  eA.name
                );
              }),
            )
          ).forEach((eA?: any, ec?: any) => {
            let eu: any = el[ec];
            if ("fulfilled" === eA.status)
              (eh.push(eu.name),
                this.logger.info(
                  `Successfully installed built-in marketplace '${eu.name}'`,
                ));
            else {
              let el: any =
                eA.reason instanceof Error
                  ? eA.reason.message
                  : String(eA.reason);
              (ef.push({ name: eu.name, error: el }),
                this.logger.error(
                  `Failed to install built-in marketplace '${eu.name}': ${el}`,
                ));
            }
          });
        }
        (eh.length > 0 &&
          (this.logger.info(
            `Successfully installed ${eh.length} built-in marketplace(s): ${eh.join(", ")}`,
          ),
          (eA = !0)),
          ef.length > 0 &&
            (this.logger.warn(
              `Failed to install ${ef.length} built-in marketplace(s):`,
            ),
            ef.forEach(({ name: eA, error: el }: any) => {
              this.logger.warn(`  - ${eA}: ${el}`);
            })));
      } catch (eA: any) {
        this.logger.error(
          `Error during built-in marketplace installation: ${eA}`,
        );
      }
      return eA;
    }
    async installMarketplacesFromSettings(): Promise<any> {
      try {
        this.logger.info(
          "Checking for marketplaces to install from settings...",
        );
        let eA: any =
          await this.marketplaceConfigManager.getMarketplacesToInstall();
        if (0 === eA.length)
          return void this.logger.info(
            "No new marketplaces to install from settings",
          );
        let el: any =
            await this.builtInMarketplaceProvider.getBuiltInMarketplaces(),
          ec: any = new Set(el.map((eA?: any) => eA.name)),
          eu: any = eA.filter(
            (eA?: any) =>
              !ec.has(eA.name) ||
              (this.logger.warn(
                `Marketplace '${eA.name}' in settings conflicts with a built-in marketplace, skipping...`,
              ),
              !1),
          ),
          ed: any = eA.length - eu.length;
        if (0 === eu.length)
          return void this.logger.info(
            "No new marketplaces to install from settings (all skipped due to conflicts)",
          );
        this.logger.info(
          `Installing ${eu.length} marketplace(s) from settings in parallel...`,
        );
        let ep: any = [],
          eg: any = [],
          eh: any = ed;
        for (
          let eA: any = 0;
          eA < eu.length;
          eA += t$.CONCURRENT_MARKETPLACE_INSTALL_LIMIT
        ) {
          let el: any = eu.slice(
            eA,
            eA + t$.CONCURRENT_MARKETPLACE_INSTALL_LIMIT,
          );
          (
            await Promise.allSettled(
              el.map(async (eA?: any) => {
                this.logger.info(
                  `Installing marketplace '${eA.name}' from settings...`,
                );
                let el: any = this.buildSourceString(eA.source);
                return (
                  await this.addMarketplace(el, {
                    name: eA.name,
                    skipDependencyResolution: !0,
                    onProgress: (el?: any) => {
                      this.logger.debug(`[${eA.name}] ${el}`);
                    },
                  }),
                  eA.name
                );
              }),
            )
          ).forEach((eA?: any, ec?: any) => {
            let eu: any = el[ec];
            if ("fulfilled" === eA.status)
              (ep.push(eu.name),
                this.logger.info(
                  `Successfully installed marketplace '${eu.name}'`,
                ));
            else {
              let el: any =
                eA.reason instanceof Error
                  ? eA.reason.message
                  : String(eA.reason);
              (eg.push({ name: eu.name, error: el }),
                this.logger.error(
                  `Failed to install marketplace '${eu.name}': ${el}`,
                ));
            }
          });
        }
        (ep.length > 0 &&
          this.logger.info(
            `Successfully installed ${ep.length} marketplace(s): ${ep.join(", ")}`,
          ),
          eh > 0 &&
            this.logger.warn(
              `Skipped ${eh} marketplace(s) due to conflict with built-in`,
            ),
          eg.length > 0 &&
            (this.logger.warn(`Failed to install ${eg.length} marketplace(s):`),
            eg.forEach(({ name: eA, error: el }: any) => {
              this.logger.warn(`  - ${eA}: ${el}`);
            })));
      } catch (eA: any) {
        this.logger.error(
          "Error during marketplace installation from settings:",
          eA,
        );
      }
    }
    buildSourceString(eA?: any): any {
      if (eA.source === t$.MarketplaceType.Github) {
        if (eA.repo) return eA.repo;
        if (eA.url) return eA.url;
      }
      if (eA.source === t$.MarketplaceType.Zip && eA.url) return eA.url;
      if (eA.path) return eA.path;
      if (eA.url) return eA.url;
      throw Error("Invalid marketplace source configuration");
    }
    async shouldAutoUpdateThirdPartyMarketplaces(): Promise<any> {
      let eA: any = "CODEBUDDY_AUTO_UPDATE_THIRD_PARTY_MARKETPLACES",
        el: any = await this.settingsManager.get("env"),
        ec: any = el?.[eA] ?? process.env[eA];
      if (void 0 !== ec) {
        let el: any = "true" === ec.toLowerCase() || "1" === ec;
        return (
          el &&
            this.logger.debug(
              `Auto-update third-party marketplaces enabled from env ${eA}`,
            ),
          el
        );
      }
      try {
        let eA: any = tV.ContainerUtil.get(
          AS.ProductManager,
        ).getCurrentConfiguration();
        if (eA?.autoUpdateThirdPartyMarketplaces !== void 0)
          return eA.autoUpdateThirdPartyMarketplaces;
      } catch {}
      return !1;
    }
    async repairEnabledPlugins(eA: any = {}): Promise<any> {
      (await this.getInstalledPlugins(),
        await this.installMissingEnabledPlugins(eA));
    }
    async repairMissingPluginDependencies(): Promise<any> {
      await this.getInstalledPlugins();
      let eA: any = await this.getEnabledPlugins(),
        el: any = await this.listMarketplace(),
        ec: any = new Map();
      for (let eA of el)
        (ec.set(eA.name, eA),
          eA.storageName &&
            eA.storageName !== eA.name &&
            ec.set(eA.storageName, eA));
      let eu: any = await this.repairEnabledPluginDependencies(
          eA,
          ec,
          void 0,
          !0,
          "missing-only",
        ),
        ed: any = Array.from(new Set(eu.installed));
      return (
        ed.length > 0 &&
          (this.clearAllCaches(), this.onDidChangeEmitter.fire()),
        Object.freeze({
          installed: Object.freeze(ed),
          failed: Object.freeze(
            eu.failed.map((eA?: any) => Object.freeze({ ...eA })),
          ),
        })
      );
    }
    async repairEnabledPluginDependencies(
      eA?: any,
      el?: any,
      ec?: any,
      eu?: any,
      ed: any = "all",
    ): Promise<any> {
      let ep: any = { success: [], installed: [], failed: [] };
      if (!this.installedPluginsCache) return ep;
      let eg: any = new Map(
          this.installedPluginsCache.map((eA?: any) => [
            this.getPluginId(eA.name, eA.marketplaceName),
            eA,
          ]),
        ),
        getMissingDependencyIds: any = (eA?: any) =>
          new Set(
            (eA.dependencyErrors ?? [])
              .filter((el?: any) => {
                if ("dependency-unsatisfied" !== el.code) return !1;
                let ec: any = el.dependencyMarketplace ?? eA.marketplaceName,
                  eu: any = eg.get(this.getPluginId(el.dependency, ec));
                return !eu?.installedPath;
              })
              .map((el?: any) =>
                this.getPluginId(
                  el.dependency,
                  el.dependencyMarketplace ?? eA.marketplaceName,
                ),
              ),
          );
      for (let eg of this.installedPluginsCache.filter((el?: any) => {
        let eu: any = eA[this.getPluginId(el.name, el.marketplaceName)],
          ep: any =
            "missing-only" === ed
              ? getMissingDependencyIds(el).size > 0
              : !!el.dependencyErrors?.some(
                  (eA?: any) =>
                    "dependency-unsatisfied" === eA.code ||
                    "dependency-version-unsatisfied" === eA.code,
                );
        return (
          eu?.enabled === !0 &&
          (!ec || ec.has(eu.scope)) &&
          !!el.installedPath &&
          ep
        );
      })) {
        let ec: any = this.getPluginId(eg.name, eg.marketplaceName),
          eh: any = eA[ec],
          ef: any = el.get(eg.marketplaceName);
        if (eh && ef)
          try {
            let el: any = eg;
            if ("missing-only" === ed) {
              let eA: any = getMissingDependencyIds(eg),
                ec: any = this.normalizePluginDependencies(
                  eg.dependencies ?? [],
                  eg,
                ),
                eu: any = (eg.dependencies ?? []).filter(
                  (el?: any, eu?: any) => {
                    let ed: any = ec[eu];
                    return (
                      !!ed &&
                      eA.has(this.getPluginId(ed.name, ed.marketplaceName))
                    );
                  },
                );
              el = { ...eg, dependencies: eu };
            }
            let em: any = { pluginId: ec, plugin: el, marketplace: ef },
              eE: any = new Map([[ec, em]]),
              eC: any = new Map();
            await this.installDependencyClosure(eE, ef, eC, {
              autoEnable: !0,
              scope: eh.scope,
            });
            let ey: any = Array.from(eC.keys()).filter((eA?: any) => eA !== ec);
            if (0 === ey.length) continue;
            for (let el of ey)
              this.assertDependencyCanBeEnabledAtScope(el, eh.scope, eA, eg);
            eu && eh.scope !== A_.SettingsScope.CLI
              ? await this.updateEnabledPlugins((eA?: any) => {
                  for (let el of ey) eA[el] = !0;
                }, eh.scope)
              : this.setSessionEnabledPlugins(
                  ey.map((eA?: any) => [eA, !0]),
                  eh.scope,
                );
            let ew: any = Array.from(
              eC.values(),
              (eA?: any) => (
                (eA.plugin.status = t$.PluginStatus.Enabled),
                delete eA.plugin.dependencyErrors,
                eA.plugin
              ),
            );
            ("all" === ed
              ? ((eg.status = t$.PluginStatus.Enabled),
                delete eg.dependencyErrors,
                this.syncInstalledPluginsCache([eg, ...ew]))
              : this.syncInstalledPluginsCache(ew),
              ep.success.push(ec),
              ep.installed.push(...ey),
              this.logger.info(
                `Repaired dependencies for enabled plugin '${ec}'`,
              ));
          } catch (el: any) {
            let eA: any = el instanceof Error ? el.message : String(el);
            (ep.failed.push({ pluginId: ec, error: eA }),
              el instanceof PluginDependencyResolutionError &&
                this.recordDependencyResolutionError(el),
              this.logger.warn(
                `Failed to repair dependencies for enabled plugin '${ec}': ${eA}`,
              ));
          }
      }
      return ep;
    }
    async installMissingEnabledPlugins(eA: any = {}): Promise<any> {
      try {
        this.logger.info("Checking for missing enabled plugins...");
        let el: any = await this.getEnabledPlugins();
        if (0 === Object.keys(el).length)
          return void this.logger.info("No enabled plugins configured");
        let ec: any = await this.listMarketplace();
        if (0 === ec.length)
          return void this.logger.info("No marketplaces available");
        let eu: any = new Map();
        for (let eA of ec)
          (eu.set(eA.name, eA),
            eA.storageName &&
              eA.storageName !== eA.name &&
              eu.set(eA.storageName, eA));
        let ed: any = eA.enabledPluginScopes
            ? new Set(eA.enabledPluginScopes)
            : void 0,
          ep: any = Object.keys(el).filter(
            (eA?: any) => eA.includes("@") && (!ed || ed.has(el[eA].scope)),
          ),
          eg: any = await this.repairEnabledPluginDependencies(
            el,
            eu,
            ed,
            !1 !== eA.persistEnabledPlugins,
          ),
          eh: any = (
            await Promise.all(
              ep.map(async (eA?: any) => {
                let ec: any = eA.indexOf("@"),
                  ed: any = eA.substring(0, ec),
                  ep: any = eA.substring(ec + 1),
                  eg: any = el[eA],
                  eh: any = eg.enabled,
                  ef: any = eg.scope,
                  em: any = eu.get(ep);
                if (!em)
                  return (
                    this.logger.warn(
                      `Marketplace '${ep}' not found for plugin '${ed}'`,
                    ),
                    null
                  );
                let eE: any = await em.getPlugin(ed);
                if (!eE)
                  return (
                    this.logger.warn(
                      `Plugin '${ed}' not found in marketplace '${ep}'`,
                    ),
                    null
                  );
                let eC: any = await this.getPlugin(ed, ep);
                return eC && eC.installedPath
                  ? (this.logger.debug(`Plugin '${eA}' is already installed`),
                    null)
                  : (this.logger.info(
                      `Plugin '${eA}' is not installed, will be installed`,
                    ),
                    {
                      pluginName: ed,
                      marketplaceName: ep,
                      marketplace: em,
                      enabled: eh,
                      scope: ef,
                      pluginInfo: eE,
                    });
              }),
            )
          ).filter((eA?: any) => null !== eA);
        if (0 === eh.length) {
          (this.logger.info("All enabled plugins are already installed"),
            eg.success.length > 0 &&
              (this.clearAllCaches(), this.onDidChangeEmitter.fire()));
          return;
        }
        this.logger.info(
          `Found ${eh.length} missing plugin(s) to install in parallel...`,
        );
        let ef: any = {
          success: [],
          failed: [],
          dependencyEnabledByScope: new Map(),
        };
        for (
          let eA: any = 0;
          eA < eh.length;
          eA += t$.CONCURRENT_PLUGIN_INSTALL_LIMIT
        ) {
          let ec: any = eh.slice(eA, eA + t$.CONCURRENT_PLUGIN_INSTALL_LIMIT);
          (
            await Promise.allSettled(
              ec.map(
                async ({
                  pluginName: eA,
                  marketplaceName: ec,
                  marketplace: eu,
                  enabled: ed,
                  scope: ep,
                  pluginInfo: eg,
                }: any) => {
                  let eh: any = `${eA}@${ec}`;
                  this.logger.info(`Installing missing plugin '${eh}'...`);
                  let ef: any = await this.installPluginWithInstaller(
                      eg,
                      eu.installLocation,
                      { autoEnable: ed, scope: ep },
                      this.shouldRunDirectoryPluginFromSource(eu),
                    ),
                    em: any = {
                      ...eg,
                      installedPath: ef,
                      status: ed
                        ? t$.PluginStatus.Enabled
                        : t$.PluginStatus.Disabled,
                      installScope: ep,
                    };
                  await this.enrichPluginInfo(em, ef);
                  let eE: any = { pluginId: eh, plugin: em, marketplace: eu },
                    eC: any = new Map([[eh, eE]]),
                    ey: any = new Map();
                  await this.installDependencyClosure(eC, eu, ey, {
                    autoEnable: ed,
                    scope: ep,
                  });
                  let ew: any = Array.from(ey.entries())
                    .filter(([eA]: any) => eA !== eh)
                    .map(([eA, ec]: any) => [
                      eA,
                      ed ||
                        el[eA]?.enabled ||
                        (void 0 === el[eA] && !1 !== ec.plugin.defaultEnabled),
                    ]);
                  for (let [eA, ec] of ew)
                    ec &&
                      this.assertDependencyCanBeEnabledAtScope(eA, ep, el, em);
                  return {
                    pluginId: eh,
                    pluginName: eA,
                    marketplaceName: ec,
                    enabled: ed,
                    dependencyStates: ew,
                  };
                },
              ),
            )
          ).forEach((eA?: any, el?: any) => {
            let { pluginName: eu, marketplaceName: ed, scope: ep } = ec[el],
              eg: any = `${eu}@${ed}`;
            if ("fulfilled" === eA.status) {
              ef.success.push(eg);
              let el: any = ef.dependencyEnabledByScope.get(ep) || new Map();
              for (let [ec, eu] of eA.value.dependencyStates)
                el.set(ec, el.get(ec) || eu);
              (el.size > 0 && ef.dependencyEnabledByScope.set(ep, el),
                this.logger.info(
                  `Successfully installed missing plugin '${eg}'`,
                ));
            } else {
              let el: any =
                eA.reason instanceof Error
                  ? eA.reason.message
                  : String(eA.reason);
              (ef.failed.push({ pluginId: eg, error: el }),
                this.logger.error(
                  `Failed to install missing plugin '${eg}': ${el}`,
                ));
            }
          });
        }
        if (ef.success.length > 0) {
          let el: any = eh.filter(
            ({ pluginName: eA, marketplaceName: el }: any) =>
              ef.success.includes(`${eA}@${el}`),
          );
          if (!1 !== eA.persistEnabledPlugins)
            for (let eA of [
              A_.SettingsScope.USER,
              A_.SettingsScope.PROJECT,
              A_.SettingsScope.PROJECT_LOCAL,
            ]) {
              let ec: any = el.filter((el?: any) => el.scope === eA);
              0 !== ec.length &&
                (await this.updateEnabledPlugins((el?: any) => {
                  for (let {
                    pluginName: eA,
                    marketplaceName: eu,
                    enabled: ed,
                  } of ec)
                    el[`${eA}@${eu}`] = ed;
                  let eu: any = ef.dependencyEnabledByScope.get(eA);
                  if (eu)
                    for (let [eA, ec] of eu.entries()) el[eA] = el[eA] || ec;
                }, eA));
            }
          else
            for (let {
              pluginName: eA,
              marketplaceName: ec,
              enabled: eu,
              scope: ed,
            } of el) {
              this.setSessionEnabledPlugins([[`${eA}@${ec}`, eu]], ed);
              let el: any = ef.dependencyEnabledByScope.get(ed);
              el && this.setSessionEnabledPlugins(el, ed);
            }
          this.logger.info(
            `Successfully installed ${ef.success.length} missing plugin(s): ${ef.success.join(", ")}`,
          );
        }
        ((ef.success.length > 0 || eg.success.length > 0) &&
          (this.clearAllCaches(), this.onDidChangeEmitter.fire()),
          ef.failed.length > 0 &&
            (this.logger.warn(
              `Failed to install ${ef.failed.length} missing plugin(s):`,
            ),
            ef.failed.forEach(({ pluginId: eA, error: el }: any) => {
              this.logger.warn(`  - ${eA}: ${el}`);
            })),
          eg.failed.length > 0 &&
            (this.logger.warn(
              `Failed to repair ${eg.failed.length} enabled plugin dependency set(s):`,
            ),
            eg.failed.forEach(({ pluginId: eA, error: el }: any) => {
              this.logger.warn(`  - ${eA}: ${el}`);
            })));
      } catch (eA: any) {
        this.logger.error(
          "Error during missing enabled plugins installation:",
          eA,
        );
      }
    }
    applyManagedPolicies(): any {
      if (this.managedPoliciesApplyPromise)
        return (
          (this.pendingApplyRequest = !0),
          this.logger.info(
            "[ManagedPolicy] Already applying, queued for re-execution",
          ),
          this.managedPoliciesApplyPromise
        );
      let eA: any = Promise.resolve().then(async () => {
        try {
          do
            ((this.pendingApplyRequest = !1),
              await this.doApplyManagedPolicies());
          while (this.pendingApplyRequest);
        } finally {
          this.managedPoliciesApplyPromise === eA &&
            (this.managedPoliciesApplyPromise = void 0);
        }
      });
      return ((this.managedPoliciesApplyPromise = eA), eA);
    }
    async doApplyManagedPolicies(): Promise<any> {
      let eA: any = this.pluginPolicyService.getMergedPlugins();
      this.logger.info(
        `[MergedPlugins] Applying ${eA.length} merged plugin policies...`,
      );
      let el: any = !1;
      for (let ec of eA) {
        let eA: any = `${ec.name}@${ec.marketplaceName}`;
        try {
          ((await this.applySinglePolicy(ec)) && (el = !0),
            this.pendingManagedPolicies.delete(eA));
        } catch (el: any) {
          if (this.isRetryableError(el)) {
            let el: any = this.pendingManagedPolicies.get(eA);
            el
              ? (el.retryCount++,
                this.logger.info(
                  `[ManagedPolicy] Pending retry #${el.retryCount} for ${eA}`,
                ))
              : (this.pendingManagedPolicies.set(eA, {
                  policy: ec,
                  addedAt: Date.now(),
                  retryCount: 0,
                }),
                this.logger.info(
                  `[ManagedPolicy] Added ${eA} to pending queue (marketplace not ready)`,
                ));
          } else
            this.logger.error(
              `[ManagedPolicy] Failed to apply policy for ${eA}:`,
              el,
            );
        }
      }
      let ec: any = new Set(
        eA.map((eA?: any) => `${eA.name}@${eA.marketplaceName}`),
      );
      for (let eA of this.pendingManagedPolicies.keys())
        ec.has(eA) ||
          (this.logger.info(
            `[ManagedPolicy] Removing withdrawn policy from pending: ${eA}`,
          ),
          this.pendingManagedPolicies.delete(eA));
      el && (this.clearAllCaches(), this.onDidChangeEmitter.fire());
    }
    async applySinglePolicy(eA?: any): Promise<any> {
      let el: any = `${eA.name}@${eA.marketplaceName}`,
        ec: any =
          "project" === eA.scope
            ? A_.SettingsScope.PROJECT
            : "project-local" === eA.scope
              ? A_.SettingsScope.PROJECT_LOCAL
              : A_.SettingsScope.USER;
      this.logger.info(
        `[MergedPlugins][DEBUG] applySinglePolicy called for ${el}, scope=${eA.scope}, autoEnable=${eA.autoEnable}`,
      );
      let eu: any = await this.getEnabledPlugins(),
        ed: any = await this.getPlugin(eA.name, eA.marketplaceName);
      if (
        (this.logger.info(
          `[MergedPlugins][DEBUG] ${el}: installed=${!!ed}, installedPath=${ed?.installedPath ?? "N/A"}, enabledState=${JSON.stringify(eu[el] ?? "not-found")}`,
        ),
        !ed)
      ) {
        let eu: any = !1 !== eA.autoEnable;
        this.logger.info(
          `[MergedPlugins] auto-install: installing ${el} (autoEnable=${eu})`,
        );
        try {
          (await this.installPlugins([eA.name], eA.marketplaceName, {
            scope: ec,
            autoEnable: eu,
          }),
            this.logger.info(
              `[MergedPlugins][DEBUG] auto-install SUCCESS for ${el}`,
            ));
        } catch (eA: any) {
          throw (
            this.logger.error(
              `[MergedPlugins][DEBUG] auto-install FAILED for ${el}: ${eA}`,
            ),
            eA
          );
        }
        return !0;
      }
      return !1 !== eA.autoEnable && eu[el]?.enabled !== !0
        ? (this.logger.info(
            `[MergedPlugins] auto-enable: enabling ${el} (bypassing policy check for managed operation)`,
          ),
          await this.enablePlugins([eA.name], eA.marketplaceName, {
            bypassPolicyCheck: !0,
          }),
          !0)
        : (this.logger.debug?.(
            `[MergedPlugins] ${el} already installed and in desired state`,
          ),
          !1);
    }
    async retryPendingManagedPolicies(): Promise<any> {
      if (0 === this.pendingManagedPolicies.size) return;
      this.logger.info(
        `[ManagedPolicy] Retrying ${this.pendingManagedPolicies.size} pending policies...`,
      );
      let eA: any = Date.now(),
        el: any = [],
        ec: any = [];
      for (let [eu, ed] of this.pendingManagedPolicies)
        eA - ed.addedAt > e0.PENDING_MAX_AGE_MS ||
        ed.retryCount >= e0.PENDING_MAX_RETRY
          ? el.push(eu)
          : ec.push(eu);
      for (let eA of el)
        (this.logger.warn(
          `[ManagedPolicy] Removing expired/max-retried pending policy: ${eA}`,
        ),
          this.pendingManagedPolicies.delete(eA));
      if (0 === ec.length) return;
      let eu: any = !1;
      for (let eA of ec) {
        let el: any = this.pendingManagedPolicies.get(eA);
        if (el)
          try {
            ((await this.applySinglePolicy(el.policy)) && (eu = !0),
              this.pendingManagedPolicies.delete(eA),
              this.logger.info(
                `[ManagedPolicy] Pending policy ${eA} applied successfully`,
              ));
          } catch (ec: any) {
            this.isRetryableError(ec)
              ? (el.retryCount++,
                this.logger.info(
                  `[ManagedPolicy] Pending policy ${eA} still not ready (retry #${el.retryCount})`,
                ))
              : (this.logger.error(
                  `[ManagedPolicy] Pending policy ${eA} failed permanently:`,
                  ec,
                ),
                this.pendingManagedPolicies.delete(eA));
          }
      }
      eu && (this.clearAllCaches(), this.onDidChangeEmitter.fire());
    }
    isRetryableError(eA?: any): any {
      return eA instanceof t$.MarketplaceNotReadyError;
    }
  }
  e0 = PluginManagerImpl;
  return {
    PluginManagerImpl,
    PluginDependencyResolutionError,
    mapWithConcurrencyLimit,
    resolveDependencyClosure,
    cacheMarkers: rF,
  };
}
