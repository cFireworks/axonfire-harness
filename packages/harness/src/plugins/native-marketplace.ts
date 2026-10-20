// Complete fixed-sample local/Git/HTTP/ZIP marketplace classes. No original bootstrap is executed.
import * as path from "node:path";
import { SettingsScope } from "../permissions/native-permission-policy.js";
import { createCapturedPluginConstants } from "../vendor/captured-plugin-constants.js";
import { createNativePluginConcurrency } from "./native-plugin-concurrency.js";
import { createNativeZipUtils } from "./native-zip-utils.js";
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
        if (
          [
            BaseMarketplace,
            DirectoryMarketplace,
            GithubMarketplace,
            HttpMarketplace,
            ZipMarketplace,
          ].includes(key)
        )
          return new key();
        if (key === t$.MarketplaceUpdateChecker)
          return services.marketplaceUpdateChecker;
        if (key === t$.BuiltInMarketplaceProvider)
          return services.builtInMarketplaceProvider;
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
    t8 = { default: runtime.exec },
    t6 = {
      env: {
        GIT_TERMINAL_PROMPT: "0",
        GIT_SSH_COMMAND:
          "ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new",
      },
    },
    fetch = runtime.fetch ?? globalThis.fetch,
    An = { tmpdir: runtime.tmpdir },
    Al = runtime.zipUtils ?? createNativeZipUtils(runtime),
    Ac = [
      ["main", "master"],
      ["master", "main"],
    ],
    Au = /\.(\d{13})-[a-z0-9]{6}(?:\.zip|\.tmp)?$/,
    Ad = 3600000,
    AQ = ".marketplace-version",
    AD = ".zip-metadata.json",
    AT = 60000;
  // UTF-16 9540634..9543574
  class GithubMarketplace extends t4 {
    [key: string]: any;
    async install(eA: any): Promise<any> {
      if (
        (eA?.("Parsing repository information..."),
        !this.name || "temp" === this.name)
      ) {
        let eA: any = this.source.repo;
        eA
          ? (this.name = eA.replace(/\//g, "_").replace(/\.git$/, ""))
          : this.source.path
            ? (this.name = this.source.path
                .replace(/[^a-zA-Z0-9_]/g, "_")
                .replace(/\//g, "_")
                .replace(/\.git$/, ""))
            : (this.name = "unknown");
      }
      ((this.installLocation = (0, tX.join)(
        t5.PathUtils.getHomePluginsDir(),
        t$.MARKETPLACES_DIR,
        this.name,
      )),
        await this.update(eA),
        await this.renameToManifestName(eA));
    }
    async renameToManifestName(eA: any): Promise<any> {
      let el: any = await this.readManifestName(this.installLocation);
      if (!el || el === this.name) return;
      let ec: any = (0, tX.join)(
        t5.PathUtils.getHomePluginsDir(),
        t$.MARKETPLACES_DIR,
        el,
      );
      if (ec !== this.installLocation)
        try {
          (eA?.(`Aligning marketplace directory to manifest name "${el}"...`),
            (await tZ.pathExists(ec)) && (await tZ.remove(ec)),
            await tZ.move(this.installLocation, ec),
            (this.name = el),
            (this.installLocation = ec));
        } catch (eA: any) {
          tV.ContainerUtil.get(t2.Logger).warn(
            `[GithubMarketplace] Failed to rename "${this.installLocation}" to "${ec}": ${eA}`,
          );
        }
    }
    async readManifestName(eA: any): Promise<any> {
      for (let el of t$.PLUGINS_METADATA_DIRS) {
        let ec: any = (0, tX.join)(eA, el, t$.MARKETPLACE_MANIFEST_FILE);
        if (await tZ.pathExists(ec)) {
          try {
            let eA: any = await tZ.readJSON(ec),
              el: any = eA?.name;
            if ("string" == typeof el && el.length > 0) return el;
          } catch {}
          break;
        }
      }
    }
    async update(eA: any): Promise<any> {
      try {
        eA?.("Preparing Git repository...");
        let el: any = this.getGitUrl(),
          ec: any = this.installLocation;
        (await tZ.pathExists(ec))
          ? (await this.isValidGitRepo(ec))
            ? (eA?.("Updating existing repository..."),
              await this.updateRepo(ec, eA))
            : (eA?.("Removing invalid repository directory..."),
              await tZ.remove(ec),
              eA?.("Cloning repository..."),
              await this.cloneRepo(el, ec, eA))
          : (eA?.("Cloning repository..."), await this.cloneRepo(el, ec, eA));
      } catch (eA: any) {
        throw Error(`Failed to install GitHub marketplace: ${eA}`);
      }
    }
    async isValidGitRepo(eA: any): Promise<any> {
      try {
        return (
          await (0, t8.default)("git", ["rev-parse", "--git-dir"], {
            ...t6,
            cwd: eA,
          }),
          !0
        );
      } catch {
        return !1;
      }
    }
    async cloneRepo(eA: any, el: any, ec: any): Promise<any> {
      try {
        (await tZ.ensureDir((0, tX.join)(el, "..")),
          ec?.(`Cloning repository from ${eA}...`),
          await (0, t8.default)("git", ["clone", "--depth", "1", eA, el], t6),
          ec?.("Repository cloned successfully"));
      } catch (eA: any) {
        try {
          (await tZ.pathExists(el)) && (await tZ.remove(el));
        } catch {}
        throw Error(`Failed to clone repository: ${eA}`);
      }
    }
    async updateRepo(eA: any, el: any): Promise<any> {
      try {
        let ec: any = { ...t6, cwd: eA },
          eu: any = await (0, t8.default)(
            "git",
            ["rev-parse", "--abbrev-ref", "HEAD"],
            ec,
          ),
          ed: any = String(eu.stdout || "").trim() || "main";
        (el?.("Fetching latest changes..."),
          await (0, t8.default)(
            "git",
            ["fetch", "origin", ed, "--depth", "1"],
            ec,
          ),
          el?.("Syncing to remote..."),
          await (0, t8.default)("git", ["reset", "--hard", `origin/${ed}`], ec),
          await (0, t8.default)("git", ["clean", "-fd"], ec),
          el?.("Repository updated successfully"));
      } catch (eA: any) {
        throw Error(`Failed to update repository: ${eA}`);
      }
    }
    getGitUrl(): any {
      let eA: any = this.source;
      if (eA.repo) return `https://github.com/${eA.repo}.git`;
      if (eA.url) return eA.url;
      if (eA.path) return eA.path;
      throw Error("Invalid GitHub marketplace source: missing repo or url");
    }
  }
  // UTF-16 9544069..9547325
  class HttpMarketplace extends t4 {
    [key: string]: any;
    async install(eA: any): Promise<any> {
      try {
        eA?.("Parsing marketplace URL...");
        let el: any = this.getHttpUrl(),
          ec: any = this.generateNameFromUrl(el),
          eu: any = (0, tX.join)(
            t5.PathUtils.getHomePluginsDir(),
            t$.MARKETPLACES_DIR,
            ec,
          );
        (eA?.("Downloading marketplace manifest..."), await tZ.ensureDir(eu));
        let ed: any = await this.fetchManifest(el);
        ((this.name = ed.name || ec),
          (this.installLocation = (0, tX.join)(
            t5.PathUtils.getHomePluginsDir(),
            t$.MARKETPLACES_DIR,
            this.name,
          )),
          eu !== this.installLocation &&
            ((await tZ.pathExists(this.installLocation)) &&
              (await tZ.remove(this.installLocation)),
            (await tZ.pathExists(eu)) &&
              (await tZ.move(eu, this.installLocation))),
          await this.update(eA));
      } catch (eA: any) {
        throw Error(`Failed to install HTTP marketplace: ${eA}`);
      }
    }
    async update(eA: any): Promise<any> {
      try {
        eA?.("Preparing HTTP marketplace download...");
        let el: any = this.getHttpUrl(),
          ec: any = this.installLocation;
        (await tZ.ensureDir(ec),
          eA?.("Downloading marketplace manifest..."),
          await this.downloadManifest(el, ec, eA),
          eA?.("HTTP marketplace updated successfully"));
      } catch (eA: any) {
        throw Error(`Failed to update HTTP marketplace: ${eA}`);
      }
    }
    async fetchManifest(eA: any): Promise<any> {
      try {
        let el: any = await fetch(eA);
        if (!el.ok) throw Error(`HTTP ${el.status}: ${el.statusText}`);
        return await el.json();
      } catch (eA: any) {
        throw Error(`Failed to fetch manifest: ${eA}`);
      }
    }
    async downloadManifest(eA: any, el: any, ec: any): Promise<any> {
      try {
        ec?.("Fetching marketplace manifest...");
        let eu: any = await this.fetchManifest(eA);
        ec?.("Saving marketplace manifest...");
        let ed: any = t$.PLUGINS_METADATA_DIRS["0"],
          ep: any = (0, tX.join)(el, ed, "marketplace.json");
        (await tZ.ensureDir((0, tX.join)(el, ed)),
          await tZ.writeJSON(ep, eu, { spaces: 2 }),
          ec?.(`Downloading ${eu.plugins.length} plugin manifests...`));
        for (let ed: any = 0; ed < eu.plugins.length; ed++) {
          let ep: any = eu.plugins[ed];
          try {
            ec?.(
              `Downloading plugin manifest ${ed + 1}/${eu.plugins.length}: ${ep.name}`,
            );
            let eg: any =
              "string" == typeof ep.source ? ep.source : ep.source.path;
            eg && (await this.downloadPluginManifest(eA, el, eg));
          } catch (eA: any) {
            tV.ContainerUtil.get(t2.Logger).error(
              `Failed to download plugin manifest for ${ep.name}:`,
              eA,
            );
          }
        }
        ec?.("All plugin manifests downloaded successfully");
      } catch (eA: any) {
        throw Error(`Failed to download manifest: ${eA}`);
      }
    }
    async downloadPluginManifest(eA: any, el: any, ec: any): Promise<any> {
      let eu: any = this.detectedMetaDir
          ? [
              this.detectedMetaDir,
              ...t$.PLUGINS_METADATA_DIRS.filter(
                (eA: any) => eA !== this.detectedMetaDir,
              ),
            ]
          : t$.PLUGINS_METADATA_DIRS,
        ed: any = [];
      for (let ep of eu) {
        let eu: any = this.buildUrl(eA, `${ec}/${ep}/plugin.json`);
        try {
          let eA: any = await fetch(eu);
          if (!eA.ok) {
            ed.push(`${ep}: HTTP ${eA.status}`);
            continue;
          }
          let eg: any = await eA.json(),
            eh: any = (0, tX.join)(el, ec, ep, "plugin.json");
          (await tZ.ensureDir((0, tX.join)(el, ec, ep)),
            await tZ.writeJSON(eh, eg, { spaces: 2 }),
            await Promise.all(
              t$.PLUGINS_METADATA_DIRS.filter((eA: any) => eA !== ep).map(
                (eA: any) => tZ.remove((0, tX.join)(el, ec, eA, "plugin.json")),
              ),
            ),
            (this.detectedMetaDir = ep));
          return;
        } catch (eA: any) {
          ed.push(`${ep}: ${eA instanceof Error ? eA.message : String(eA)}`);
        }
      }
      throw Error(
        `Failed to download plugin manifest from any metadata dir [${ed.join("; ")}]`,
      );
    }
    generateNameFromUrl(eA: any): any {
      return eA
        .replace(/^https?:\/\//, "")
        .replace(/\/marketplace\.json$/, "")
        .replace(/[^a-zA-Z0-9_]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "");
    }
    getHttpUrl(): any {
      let eA: any = this.source;
      if (eA.url) return eA.url;
      if (eA.path) return eA.path;
      throw Error("Invalid HTTP marketplace source: missing url or path");
    }
    buildUrl(eA: any, el: any): any {
      let ec: any = eA.replace(/\/$/, ""),
        eu: any = el.replace(/^\//, "");
      return `${ec}/${eu}`;
    }
  }
  // UTF-16 9547937..9555429
  class ZipMarketplace extends t4 {
    [key: string]: any;
    async install(eA: any): Promise<any> {
      let el: any = this.getZipUrl(),
        ec: any = this.generateNameFromUrl(el),
        eu: any = (0, tX.join)(
          t5.PathUtils.getHomePluginsDir(),
          t$.MARKETPLACES_DIR,
        ),
        ed: any = await this.createTempRoot("install"),
        ep: any = (0, tX.join)(ed, "extract"),
        eg: any = (0, tX.join)(ed, `${ec}.zip`);
      try {
        (eA?.("Parsing marketplace ZIP URL..."),
          eA?.("Downloading marketplace ZIP archive..."),
          await tZ.ensureDir(eu));
        let { result: ed, url: eh } = (0, Al.isLocalFilePath)(el)
          ? { result: await (0, Al.copyLocalFile)(el, eg), url: el }
          : await this.downloadWithBranchFallback(el, eg);
        (eA?.("Extracting marketplace archive..."),
          await tZ.ensureDir(ep),
          await (0, Al.extractZip)(eg, ep, !0),
          await tZ.remove(eg),
          eA?.("Reading marketplace manifest..."));
        let ef: any = await this.readManifestFromDir(ep);
        ((this.name && "temp" !== this.name) || (this.name = ef?.name || ec),
          (this.installLocation = (0, tX.join)(eu, this.name)),
          ep !== this.installLocation &&
            (await tZ.pathExists(ep)) &&
            (await this.swapDirectoryFromTemp(ep, this.installLocation)),
          await (0, Al.writeZipMetadata)(this.installLocation, {
            url: eh,
            lastModified: ed.lastModified,
            etag: ed.etag,
            downloadedAt: new Date().toISOString(),
            installComplete: !0,
          }),
          (0, Al.isLocalFilePath)(el) || (await this.seedVersionFromUrl(el)),
          await this.cleanupOrphanArtifacts(eu),
          eA?.("ZIP marketplace installed successfully"));
      } catch (eA: any) {
        throw Error(
          `Failed to install ZIP marketplace: ${eA instanceof Error ? eA.message : String(eA)}`,
        );
      } finally {
        await this.safeRemove(ed);
      }
    }
    async update(eA: any): Promise<any> {
      let el: any,
        ec: any = tV.ContainerUtil.get(t2.Logger),
        eu: any = this.getZipUrl(),
        ed: any = this.installLocation;
      if (!(0, Al.isLocalFilePath)(eu) && ed)
        try {
          let ep: any = tV.ContainerUtil.get(t$.MarketplaceUpdateChecker),
            eg: any = (await this.isBuiltInMarketplace())
              ? ((0, Al.parseVersionFromUrl)(eu) ?? void 0)
              : void 0,
            eh: any = await ep.needsUpdate({
              marketplaceName: this.name,
              installLocation: ed,
              zipUrl: eu,
              urlVersion: eg,
            });
          if (!eh.needsUpdate) {
            (ec.info(
              `[ZipMarketplace.update] ${this.name} up-to-date, skipping download (reason=${eh.reason})`,
            ),
              eA?.(`Marketplace '${this.name}' is up to date`));
            return;
          }
          (ec.info(
            `[ZipMarketplace.update] ${this.name} needs update (reason=${eh.reason})`,
          ),
            (el = eh.remoteVersion));
        } catch (eA: any) {
          ec.warn(
            `[ZipMarketplace.update] update checker failed, proceeding with full download: ${eA instanceof Error ? eA.message : String(eA)}`,
          );
        }
      let ep: any = await this.createTempRoot("update"),
        eg: any = (0, tX.join)(
          ep,
          `${this.slugify(this.name || "marketplace")}.zip`,
        ),
        eh: any = (0, tX.join)(ep, "extract");
      try {
        (ec.info(
          `[ZipMarketplace.update] Downloading ${this.name} from ${eu}...`,
        ),
          eA?.("Preparing ZIP marketplace update..."),
          eA?.("Downloading updated marketplace archive..."));
        let { result: ep, url: ef } = (0, Al.isLocalFilePath)(eu)
          ? { result: await (0, Al.copyLocalFile)(eu, eg), url: eu }
          : await this.downloadWithBranchFallback(eu, eg);
        if (
          (eA?.("Extracting updated marketplace archive..."),
          (await tZ.pathExists(eh)) && (await tZ.remove(eh)),
          await tZ.ensureDir(eh),
          await (0, Al.extractZip)(eg, eh, !0),
          await tZ.remove(eg),
          await this.swapDirectoryFromTemp(eh, ed),
          await (0, Al.writeZipMetadata)(ed, {
            url: ef,
            lastModified: ep.lastModified,
            etag: ep.etag,
            downloadedAt: new Date().toISOString(),
            installComplete: !0,
          }),
          el)
        )
          try {
            let eA: any = tV.ContainerUtil.get(t$.MarketplaceUpdateChecker);
            await eA.commitVersion(this.name, ed, el);
          } catch (eA: any) {
            ec.warn(
              `[ZipMarketplace.update] commitVersion failed: ${eA instanceof Error ? eA.message : String(eA)}`,
            );
          }
        let em: any = await this.readManifestFromDir(ed);
        (em &&
          ((this.manifest = em),
          em.name && (this.name = em.name),
          em.description && (this.description = em.description)),
          await super.update(eA),
          await this.cleanupOrphanArtifacts(
            (0, tX.join)(t5.PathUtils.getHomePluginsDir(), t$.MARKETPLACES_DIR),
          ),
          eA?.("ZIP marketplace updated successfully"));
      } catch (eA: any) {
        throw Error(
          `Failed to update ZIP marketplace: ${eA instanceof Error ? eA.message : String(eA)}`,
        );
      } finally {
        await this.safeRemove(ep);
      }
    }
    async isBuiltInMarketplace(): Promise<any> {
      try {
        let eA: any = tV.ContainerUtil.get(t$.BuiltInMarketplaceProvider);
        return await eA.isBuiltInMarketplace(this.name);
      } catch {
        return !1;
      }
    }
    async seedVersionFromUrl(eA: any): Promise<any> {
      let el: any = tV.ContainerUtil.get(t2.Logger);
      try {
        if (!(await this.isBuiltInMarketplace())) return;
        let el: any = (0, Al.parseVersionFromUrl)(eA);
        if (!el) return;
        let ec: any = tV.ContainerUtil.get(t$.MarketplaceUpdateChecker);
        await ec.commitVersion(this.name, this.installLocation, el);
      } catch (eA: any) {
        el.debug(
          `[ZipMarketplace] seedVersionFromUrl failed for ${this.name}: ${eA instanceof Error ? eA.message : String(eA)}`,
        );
      }
    }
    async downloadWithBranchFallback(eA: any, el: any): Promise<any> {
      let ec: any = tV.ContainerUtil.get(t2.Logger);
      try {
        return { result: await (0, Al.downloadFile)(eA, el), url: eA };
      } catch (ed: any) {
        let eu: any = ed instanceof Error ? ed.message : String(ed);
        if (!eu.includes("HTTP 404")) throw ed;
        for (let [ed, ep] of Ac) {
          let eg: any = RegExp(`([-/])${ed}(\\.zip)(?=[?#]|$)`);
          if (!eg.test(eA)) continue;
          let eh: any = eA.replace(eg, `$1${ep}$2`);
          ec.info(
            `[ZipMarketplace] Branch "${ed}" returned 404, retrying with "${ep}": ${eh}`,
          );
          try {
            return { result: await (0, Al.downloadFile)(eh, el), url: eh };
          } catch (el: any) {
            let eA: any = el instanceof Error ? el.message : String(el);
            throw (
              ec.warn(
                `[ZipMarketplace] Fallback branch "${ep}" also failed: ${eA}`,
              ),
              Error(`${eu}; fallback "${ep}" also failed: ${eA}`)
            );
          }
        }
        throw (
          ec.debug(
            `[ZipMarketplace] URL "${eA}" returned 404 but matched no branch fallback pattern`,
          ),
          ed
        );
      }
    }
    async readManifestFromDir(eA: any): Promise<any> {
      let el: any = tV.ContainerUtil.get(t2.Logger);
      for (let ec of [
        (0, tX.join)(eA, t$.MARKETPLACE_MANIFEST_FILE),
        ...t$.PLUGINS_METADATA_DIRS.map((el: any) =>
          (0, tX.join)(eA, el, t$.MARKETPLACE_MANIFEST_FILE),
        ),
      ])
        if (await tZ.pathExists(ec))
          try {
            return await tZ.readJSON(ec);
          } catch (eA: any) {
            el.warn(`Failed to parse manifest at ${ec}:`, eA);
          }
    }
    getZipUrl(): any {
      let { url: eA, path: el } = this.source;
      if (eA) return eA;
      if (el) return el;
      throw Error("Invalid ZIP marketplace source: missing url or path");
    }
    generateNameFromUrl(eA: any): any {
      return (0, Al.isLocalFilePath)(eA)
        ? this.slugify(eA.split(/[\\/]/).pop() || "marketplace")
        : this.slugify(eA.replace(/^https?:\/\//, ""));
    }
    slugify(eA: any): any {
      return (
        eA
          .replace(/\.(zip|tgz|tar\.gz)$/i, "")
          .replace(/[^a-zA-Z0-9_-]/g, "_")
          .replace(/_+/g, "_")
          .replace(/^_|_$/g, "") || "marketplace"
      );
    }
    async createTempRoot(eA: any): Promise<any> {
      return tZ.mkdtemp(
        (0, tX.join)((0, An.tmpdir)(), `codebuddy-marketplace-${eA}-`),
      );
    }
    async swapDirectoryFromTemp(eA: any, el: any): Promise<any> {
      let ec: any = (0, tX.join)(el, ".."),
        eu: any = `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ed: any = (0, tX.join)(
          ec,
          `.${this.slugify(this.name || "marketplace")}.staging-${eu}`,
        ),
        ep: any = (0, tX.join)(
          ec,
          `.${this.slugify(this.name || "marketplace")}.backup-${eu}`,
        ),
        eg: any = !1,
        eh: any = !1;
      await tZ.ensureDir(ec);
      try {
        (await tZ.move(eA, ed, { overwrite: !1 }),
          (await tZ.pathExists(el)) &&
            (await this.renameDirectory(el, ep), (eg = !0)));
        try {
          (await this.renameDirectory(ed, el), (eh = !0));
        } catch (eA: any) {
          if (eg)
            try {
              (await this.renameDirectory(ep, el), (eg = !1));
            } catch (el: any) {
              throw Error(
                `Failed to promote marketplace and restore backup: ${eA instanceof Error ? eA.message : String(eA)}; restore failed: ${el instanceof Error ? el.message : String(el)}; backup preserved at ${ep}`,
              );
            }
          throw eA;
        }
        eg && (await this.safeRemove(ep), (eg = !1));
      } finally {
        (await this.safeRemove(ed), (eh || !eg) && (await this.safeRemove(ep)));
      }
    }
    async renameDirectory(eA: any, el: any): Promise<any> {
      await tZ.rename(eA, el);
    }
    async safeRemove(eA: any): Promise<any> {
      try {
        (await tZ.pathExists(eA)) && (await tZ.remove(eA));
      } catch {}
    }
    async cleanupOrphanArtifacts(eA: any): Promise<any> {
      let el: any = tV.ContainerUtil.get(t2.Logger);
      try {
        let ec: any = await tZ.readdir(eA),
          eu: any = Date.now();
        for (let ed of ec) {
          let ec: any = Au.exec(ed);
          if (!ec) continue;
          let ep: any = Number(ec[1]);
          if (!Number.isFinite(ep) || eu - ep < Ad) continue;
          let eg: any = (0, tX.join)(eA, ed);
          try {
            (await tZ.remove(eg),
              el.debug(`[ZipMarketplace] removed orphan artefact: ${ed}`));
          } catch (eA: any) {
            el.debug(
              `[ZipMarketplace] failed to remove orphan artefact ${ed}: ` +
                (eA instanceof Error ? eA.message : String(eA)),
            );
          }
        }
      } catch (eA: any) {
        el.debug(
          "[ZipMarketplace] cleanupOrphanArtifacts skipped: " +
            (eA instanceof Error ? eA.message : String(eA)),
        );
      }
    }
  }
  // UTF-16 9569105..9572073
  class MarketplaceUpdateChecker {
    [key: string]: any;
    init(): any {
      this.logger.setContext("MarketplaceUpdateChecker");
    }
    async needsUpdate(eA: any): Promise<any> {
      let {
          marketplaceName: el,
          installLocation: ec,
          zipUrl: eu,
          urlVersion: ed,
        } = eA,
        ep: any = Date.now();
      if (!ec || !(await tZ.pathExists(ec)))
        return (
          this.logger.info(`[${el}] checked reason=first-install`),
          { needsUpdate: !0, reason: "first-install" }
        );
      if (await this.isRecentlyChecked(ec)) {
        let eA: any = Date.now() - ep;
        return (
          this.logger.debug(`[${el}] checked reason=throttled elapsed=${eA}ms`),
          { needsUpdate: !1, reason: "throttled" }
        );
      }
      if (ed) {
        let eA: any = await this.readCachedVersion(ec),
          eu: any = Date.now() - ep;
        return eA && eA === ed
          ? (await this.touchVersionFile(ec),
            this.logger.info(
              `[${el}] checked reason=url-version-match elapsed=${eu}ms`,
            ),
            { needsUpdate: !1, reason: "url-version-match", remoteVersion: ed })
          : (this.logger.info(
              `[${el}] checked reason=url-version-changed elapsed=${eu}ms (local=${eA ?? "none"}, url=${ed})`,
            ),
            {
              needsUpdate: !0,
              reason: "url-version-changed",
              remoteVersion: ed,
            });
      }
      try {
        let eA: any = await (0, Al.checkZipNeedsUpdate)(eu, ec),
          ed: any = this.classifyHttpCheck(
            eA,
            !!(await this.hasZipMetadata(ec)),
          ),
          eg: any = Date.now() - ep;
        return (
          this.logger.info(`[${el}] checked reason=${ed} elapsed=${eg}ms`),
          eA.needsUpdate || (await this.touchVersionFile(ec)),
          {
            needsUpdate: eA.needsUpdate,
            reason: ed,
            etag: eA.etag,
            lastModified: eA.lastModified,
          }
        );
      } catch (eA: any) {
        return (
          this.logger.warn(
            `[${el}] HEAD check failed: ${eA instanceof Error ? eA.message : String(eA)}`,
          ),
          { needsUpdate: !0, reason: "head-failed" }
        );
      }
    }
    async commitVersion(eA: any, el: any, ec: any): Promise<any> {
      try {
        let eu: any = (0, tX.join)(el, AQ);
        (await tZ.writeFile(eu, ec.trim(), "utf-8"),
          this.logger.debug(`[${eA}] wrote version cache "${ec}"`));
      } catch (el: any) {
        this.logger.warn(
          `[${eA}] failed to write version cache: ${el instanceof Error ? el.message : String(el)}`,
        );
      }
    }
    async invalidateCache(eA: any, el: any): Promise<any> {
      for (let ec of [(0, tX.join)(el, AQ), (0, tX.join)(el, AD)])
        try {
          await tZ.remove(ec);
        } catch (el: any) {
          this.logger.warn(
            `[${eA}] failed to invalidate cache file '${ec}': ${el instanceof Error ? el.message : String(el)}`,
          );
        }
      this.logger.info(`[${eA}] cache invalidated for forced update`);
    }
    async isRecentlyChecked(eA: any): Promise<any> {
      try {
        let el: any = (0, tX.join)(eA, AQ);
        if (!(await tZ.pathExists(el))) return !1;
        let ec: any = await tZ.stat(el);
        return Date.now() - ec.mtimeMs < this.getCheckIntervalMs();
      } catch {
        return !1;
      }
    }
    async touchVersionFile(eA: any): Promise<any> {
      try {
        let el: any = (0, tX.join)(eA, AQ);
        if (await tZ.pathExists(el)) {
          let eA: any = new Date();
          await tZ.utimes(el, eA, eA);
        } else await tZ.writeFile(el, "", "utf-8");
      } catch {}
    }
    async readCachedVersion(eA: any): Promise<any> {
      try {
        let el: any = (0, tX.join)(eA, AQ);
        if (!(await tZ.pathExists(el))) return;
        return (await tZ.readFile(el, "utf-8")).trim() || void 0;
      } catch {
        return;
      }
    }
    async hasZipMetadata(eA: any): Promise<any> {
      try {
        return await tZ.pathExists((0, tX.join)(eA, AD));
      } catch {
        return !1;
      }
    }
    classifyHttpCheck(eA: any, el: any): any {
      return el
        ? eA.etag
          ? eA.needsUpdate
            ? "etag-changed"
            : "etag-match"
          : eA.lastModified
            ? eA.needsUpdate
              ? "last-modified-changed"
              : "last-modified-match"
            : eA.needsUpdate
              ? "no-metadata"
              : "etag-match"
        : "no-metadata";
    }
    getCheckIntervalMs(): any {
      try {
        let eA: any = this.productManager.getCurrentConfiguration(),
          el: any = eA?.marketplaceVersionCheckIntervalMs;
        if ("number" == typeof el && el > 0) return el;
      } catch {}
      return AT;
    }
  }
  // UTF-16 9575670..9576155
  class GitAvailabilityDetector {
    declare static DETECTION_TIMEOUT_MS: number;
    [key: string]: any;
    async isAvailable(): Promise<any> {
      return (
        this.probePromise || (this.probePromise = this.probe()),
        this.probePromise
      );
    }
    invalidateCache(): any {
      this.probePromise = void 0;
    }
    async probe(): Promise<any> {
      try {
        return (
          await (0, t8.default)("git", ["--version"], {
            timeout: ew.DETECTION_TIMEOUT_MS,
            env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
          }),
          this.logger.info("[GitAvailability] git is available"),
          !0
        );
      } catch (el: any) {
        let eA: any = el instanceof Error ? el.message : String(el);
        return (
          this.logger.warn(`[GitAvailability] git is unavailable: ${eA}`),
          !1
        );
      }
    }
  }
  // UTF-16 9576904..9577492
  class GitToZipUrlConverter {
    [key: string]: any;
    constructor() {
      this.rules = [...AO];
    }
    registerRule(eA: any): any {
      this.rules.unshift(eA);
    }
    convert(eA: any): any {
      let el: any = this.normaliseToHttpUrl(eA);
      if (el)
        try {
          let eA: any = new URL(el.replace(/\.git$/, "")),
            ec: any = eA.hostname.toLowerCase(),
            eu: any = eA.pathname.replace(/\/+$/, "");
          if (!eu) return;
          for (let el of this.rules)
            if (el.match(ec)) return el.convert(eA.host, eu);
          return;
        } catch {
          return;
        }
    }
    normaliseToHttpUrl(eA: any): any {
      let el: any = eA.trim();
      if (!el) return;
      if (/^[\w.-]+\/[\w.-]+$/.test(el)) return `https://github.com/${el}`;
      let ec: any = el.match(/^git@([^:]+):(.+?)(?:\.git)?$/);
      return ec
        ? `https://${ec[1]}/${ec[2]}`
        : /^https?:\/\//i.test(el)
          ? el
          : void 0;
    }
  }
  let ew = GitAvailabilityDetector;
  GitAvailabilityDetector.DETECTION_TIMEOUT_MS = 5000;
  const AO: any = [
    {
      name: "cnb.cool",
      match: (eA: any) => "cnb.cool" === eA || eA.endsWith(".cnb.cool"),
      convert: (eA: any, el: any) =>
        `https://${eA}${el}/-/git/archive/refs/heads/master.zip`,
    },
    {
      name: "cnb.woa.com",
      match: (eA: any) => "cnb.woa.com" === eA || eA.endsWith(".cnb.woa.com"),
      convert: (eA: any, el: any) =>
        `https://${eA}${el}/-/git/archive/refs/heads/main.zip`,
    },
    {
      name: "git.woa.com",
      match: (eA: any) => "git.woa.com" === eA,
      convert: (eA: any, el: any) =>
        `https://${eA}${el}/-/repository/archive.zip`,
    },
    {
      name: "github.com",
      match: (eA: any) => "github.com" === eA || eA.endsWith(".github.com"),
      convert: (eA: any, el: any) =>
        `https://${eA}${el}/archive/refs/heads/main.zip`,
    },
    {
      name: "gitlab",
      match: (eA: any) => "gitlab.com" === eA || eA.includes("gitlab"),
      convert: (eA: any, el: any) => {
        let ec: any = el.split("/").filter(Boolean).pop() ?? "repo";
        return `https://${eA}${el}/-/archive/main/${ec}-main.zip`;
      },
    },
    {
      name: "gitee.com",
      match: (eA: any) => "gitee.com" === eA,
      convert: (eA: any, el: any) =>
        `https://${eA}${el}/repository/archive/master.zip`,
    },
    {
      name: "bitbucket.org",
      match: (eA: any) => "bitbucket.org" === eA,
      convert: (eA: any, el: any) => `https://${eA}${el}/get/main.zip`,
    },
  ];
  const t9 = runtime.providers?.git ?? GithubMarketplace,
    t7 = runtime.providers?.http ?? HttpMarketplace,
    Ap = runtime.providers?.zip ?? ZipMarketplace;
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
    GithubMarketplace,
    HttpMarketplace,
    ZipMarketplace,
    MarketplaceUpdateChecker,
    GitAvailabilityDetector,
    GitToZipUrlConverter,
    services,
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
