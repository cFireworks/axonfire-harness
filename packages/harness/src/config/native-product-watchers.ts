// Fixed WorkBuddy 5.3.14 SHA; complete original watcher classes, outer owned I/O.
import * as fs from "node:fs";
import * as path from "node:path";
import { NativeEmitter } from "../agents/native-agent-manager-runtime.js";
import * as memory from "../memory/memory-rule-constants.js";
import { SettingsScope } from "../permissions/native-permission-policy.js";
import { McpServerStatus } from "../mcp/mcp-registry.js";
export function createNativeProductWatchers(runtime: any) {
  const process = {
      env: runtime.env ?? {},
      platform: runtime.platform ?? globalThis.process.platform,
    },
    Date = { now: runtime.now ?? globalThis.Date.now },
    setTimeout = runtime.setTimeout ?? globalThis.setTimeout,
    clearTimeout = runtime.clearTimeout ?? globalThis.clearTimeout,
    tC = runtime.fs ?? fs,
    tS = tC.promises,
    tQ = path,
    e5 = {
      Emitter: runtime.Emitter ?? NativeEmitter,
      ContainerUtil: {
        get: (name: string) => {
          if (!(name in runtime.dependencies))
            throw Error("Product watcher dependency not configured: " + name);
          return runtime.dependencies[name];
        },
      },
    },
    tf = {
      ENV_KEY_CODEBUDDY_DISABLE_HOT_RELOAD: "CODEBUDDY_DISABLE_HOT_RELOAD",
      SETTINGS_FILENAME: "settings.json",
      SETTINGS_LOCAL_FILENAME: "settings.local.json",
      SettingsScope,
      SettingsManager: "settings",
    },
    tu = {
      PathUtils: {
        getWorkDir: runtime.getWorkDir,
        getHomeDir: runtime.getHomeDir,
        getProjectHomeDir:
          runtime.getProjectHomeDir ??
          (() => path.join(runtime.getWorkDir(), ".codebuddy")),
      },
    },
    tN = {
      ...memory,
      MemoryCache: "memoryCache",
      SubdirectoryMemoryLoader: "subdirectoryMemory",
    },
    tM = { SkillProductProvider: "skills" },
    tL = { PluginManager: "plugins" },
    tP = { McpConfigManager: "mcpConfig", McpServerStatus },
    e9 = { ProductManager: "productManager" };
  let eN: any;
  // UTF-16 9893732..9902774
  class ConfigWatchServiceImpl {
    [key: string]: any;
    constructor() {
      ((this.watchers = new Map()),
        (this.watchedPaths = new Set()),
        (this.debounceTimer = null),
        (this.debounceDelay = 3e3),
        (this.watchersInitialized = !1),
        (this.hotReloadEnabled = !0),
        (this.onDidHotReloadEmitter = new e5.Emitter()),
        (this.onDidHotReload = this.onDidHotReloadEmitter.event),
        (this.watchConfigMap = new Map()));
    }
    initialize(): any {
      ((this.hotReloadEnabled =
        !process.env[tf.ENV_KEY_CODEBUDDY_DISABLE_HOT_RELOAD]),
      this.hotReloadEnabled)
        ? (this.cwdChangeSubscription =
            this.cwdService.onDidChangeCwd.subscribe((eA: any) => {
              this.watchersInitialized
                ? (this.logger.info(
                    `[HotReload] cwd changed to "${eA}", rebinding watchers & invalidating project caches`,
                  ),
                  this.invalidateAllProjectCaches(),
                  this.rebindWatchers(eA).catch((eA: any) => {
                    this.logger.warn(
                      "[HotReload] Failed to rebind watchers after cwd change:",
                      eA,
                    );
                  }))
                : ((this.watchersInitialized = !0),
                  setTimeout(() => {
                    this.rebindWatchers(eA).catch((eA: any) => {
                      this.logger.warn(
                        "[HotReload] Failed to setup watchers:",
                        eA,
                      );
                    });
                  }, eN.WATCH_SETUP_DELAY));
            }))
        : this.logger.info("Hot reload is disabled via environment variable");
    }
    invalidateAllProjectCaches(): any {
      (this.clearMemoryCache(),
        this.clearSettingsCache(),
        this.clearSkillCache(),
        this.clearPluginCache(),
        this.clearMcpConfigCache(),
        this.syncProductManager(!0));
    }
    async rebindWatchers(eA: any): Promise<any> {
      (this.unwatchAll(), await this.setupWatchers());
    }
    cleanup(): any {
      (this.cwdChangeSubscription?.unsubscribe(),
        (this.cwdChangeSubscription = void 0),
        this.unwatchAll(),
        this.debounceTimer && clearTimeout(this.debounceTimer));
    }
    isHotReloadEnabled(): any {
      return this.hotReloadEnabled;
    }
    async getWatchConfigs(): Promise<any> {
      let eA: any = [],
        el: any = tu.PathUtils.getProjectHomeDir(),
        ec: any = tu.PathUtils.getHomeDir(),
        memoryFileFilter: any = (eA: any) => {
          let el: any = eA.toLowerCase();
          return (
            el === tN.MEMORY_FILENAME.toLowerCase() ||
            el === tN.MEMORY_LOCAL_FILENAME.toLowerCase() ||
            el === tN.MEMORY_FILENAME_MDC.toLowerCase() ||
            el === tN.MEMORY_LOCAL_FILENAME_MDC.toLowerCase() ||
            "agents.md" === el ||
            "agents.mdc" === el
          );
        },
        settingsFileFilter: any = (eA: any) => {
          let el: any = eA.toLowerCase();
          return (
            el === tf.SETTINGS_FILENAME.toLowerCase() ||
            el === tf.SETTINGS_LOCAL_FILENAME.toLowerCase()
          );
        };
      if (await this.pathExists(el)) {
        let ec: any = (0, tQ.join)(el, "skills");
        (await this.pathExists(ec)) &&
          eA.push({ path: ec, recursive: !0, changeType: "skills" });
        let eu: any = (0, tQ.join)(el, "commands");
        (await this.pathExists(eu)) &&
          eA.push({ path: eu, recursive: !0, changeType: "commands" });
        let ed: any = (0, tQ.join)(el, "agents");
        (await this.pathExists(ed)) &&
          eA.push({ path: ed, recursive: !0, changeType: "agents" });
        let ep: any = (0, tQ.join)(el, "rules");
        ((await this.pathExists(ep)) &&
          eA.push({ path: ep, recursive: !0, changeType: "rules" }),
          eA.push({
            path: el,
            recursive: !1,
            changeType: "memory",
            fileFilter: (eA: any) =>
              memoryFileFilter(eA) || settingsFileFilter(eA),
          }));
      }
      if (await this.pathExists(ec)) {
        let el: any = (0, tQ.join)(ec, "skills");
        (await this.pathExists(el)) &&
          eA.push({ path: el, recursive: !0, changeType: "skills" });
        let eu: any = (0, tQ.join)(ec, "commands");
        (await this.pathExists(eu)) &&
          eA.push({ path: eu, recursive: !0, changeType: "commands" });
        let ed: any = (0, tQ.join)(ec, "agents");
        (await this.pathExists(ed)) &&
          eA.push({ path: ed, recursive: !0, changeType: "agents" });
        let ep: any = (0, tQ.join)(ec, "rules");
        ((await this.pathExists(ep)) &&
          eA.push({ path: ep, recursive: !0, changeType: "rules" }),
          eA.push({
            path: ec,
            recursive: !1,
            changeType: "memory",
            fileFilter: (eA: any) =>
              memoryFileFilter(eA) || settingsFileFilter(eA),
          }));
      }
      let eu: any = tu.PathUtils.getWorkDir();
      return (
        (await this.pathExists(eu)) &&
          eA.push({
            path: eu,
            recursive: !1,
            changeType: "memory",
            fileFilter: memoryFileFilter,
          }),
        eA
      );
    }
    async pathExists(eA: any): Promise<any> {
      try {
        return (await (0, tS.access)(eA), !0);
      } catch {
        return !1;
      }
    }
    async setupWatchers(): Promise<any> {
      for (let eA of await this.getWatchConfigs()) await this.watchPath(eA);
      this.logger.info(
        `[HotReload] Watching ${this.watchedPaths.size} paths for changes`,
      );
    }
    async watchPath(eA: any): Promise<any> {
      let { path: el, changeType: ec, fileFilter: eu } = eA,
        ed: any = await this.getEffectiveRecursiveWatch(eA);
      if (this.watchedPaths.has(el))
        return void this.logger.debug(`Path already being watched: ${el}`);
      try {
        let ep: any = (0, tC.watch)(
          el,
          { recursive: ed },
          (eA: any, ed: any) => {
            if (!ed || (eu && !eu(ed))) return;
            let ep: any = el.endsWith("/") ? el + ed : el + "/" + ed,
              eg: any = this.determineChangeType(ed, ec);
            (this.logger.debug(`File ${eA}: ${ep} (type: ${eg})`),
              "rename" === eA
                ? this.performHotReload(eg, ep)
                : this.debouncedSync(eg, ep));
          },
        );
        (ep.on("error", (eA: any) => {
          if ("EMFILE" === eA.code || eA.message.includes("EMFILE")) {
            (this.logger.warn(
              "[HotReload] EMFILE error detected, disabling all file watchers to prevent crash",
            ),
              this.disableHotReloadDueToFdLimit());
            return;
          }
          (this.logger.error(`Watcher error for path ${el}: ${eA.message}`),
            this.unwatchPath(el));
        }),
          this.watchers.set(el, ep),
          this.watchedPaths.add(el),
          this.watchConfigMap.set(el, eA),
          "function" == typeof ep.unref && ep.unref(),
          this.logger.debug(
            `Started watching: ${el} (recursive: ${ed}, type: ${ec})`,
          ));
      } catch (ec: any) {
        if (eA.recursive && ed && "win32" === process.platform) {
          (this.logger.warn(
            `[HotReload] Recursive watcher failed for ${el}, retrying non-recursive: ${ec?.message || ec}`,
          ),
            await this.watchPath({ ...eA, recursive: !1 }));
          return;
        }
        if (ec?.code === "EMFILE" || ec?.message?.includes("EMFILE")) {
          (this.logger.warn(
            `[HotReload] EMFILE error when setting up watcher for ${el}, disabling hot reload`,
          ),
            this.disableHotReloadDueToFdLimit());
          return;
        }
        this.logger.error(`Failed to watch path ${el}:`, ec);
      }
    }
    async getEffectiveRecursiveWatch(eA: any): Promise<any> {
      if (!eA.recursive) return !1;
      if ("win32" !== process.platform) return !0;
      try {
        let el: any = await (0, tS.readdir)(eA.path, { withFileTypes: !0 });
        if (el.length > eN.WINDOWS_RECURSIVE_WATCH_ENTRY_THRESHOLD)
          return (
            this.logger.info(
              `[HotReload] Using non-recursive watch for large Windows directory ${eA.path} (${el.length} entries)`,
            ),
            !1
          );
      } catch (el: any) {
        this.logger.debug(
          `[HotReload] Failed to inspect watch directory ${eA.path}`,
          el,
        );
      }
      return !0;
    }
    determineChangeType(eA: any, el: any): any {
      let ec: any = eA.toLowerCase();
      return ec === tf.SETTINGS_FILENAME.toLowerCase() ||
        ec === tf.SETTINGS_LOCAL_FILENAME.toLowerCase()
        ? "settings"
        : ec === tN.MEMORY_FILENAME.toLowerCase() ||
            ec === tN.MEMORY_LOCAL_FILENAME.toLowerCase() ||
            ec === tN.MEMORY_FILENAME_MDC.toLowerCase() ||
            ec === tN.MEMORY_LOCAL_FILENAME_MDC.toLowerCase() ||
            "agents.md" === ec ||
            "agents.mdc" === ec
          ? "memory"
          : el;
    }
    unwatchPath(eA: any): any {
      let el: any = this.watchers.get(eA);
      el &&
        (el.close(),
        this.watchers.delete(eA),
        this.watchedPaths.delete(eA),
        this.watchConfigMap.delete(eA),
        this.logger.debug(`Stopped watching: ${eA}`));
    }
    unwatchAll(): any {
      for (let eA of this.watchedPaths) this.unwatchPath(eA);
    }
    disableHotReloadDueToFdLimit(): any {
      (this.logger.warn(
        "[HotReload] Disabling hot reload due to file descriptor limit (EMFILE)",
      ),
        this.logger.warn(
          "[HotReload] To avoid this issue, set CODEBUDDY_DISABLE_HOT_RELOAD=1",
        ),
        this.unwatchAll(),
        (this.hotReloadEnabled = !1));
    }
    getWatchedDirectories(): any {
      return Array.from(this.watchedPaths);
    }
    isWatching(eA: any): any {
      return this.watchedPaths.has(eA);
    }
    debouncedSync(eA: any, el: any): any {
      (this.debounceTimer && clearTimeout(this.debounceTimer),
        (this.debounceTimer = setTimeout(() => {
          this.performHotReload(eA, el);
        }, this.debounceDelay)));
    }
    performHotReload(eA: any, el: any): any {
      try {
        switch (
          (this.logger.info(
            `[HotReload] Triggered by ${eA} change: ${el || "unknown"}`,
          ),
          eA)
        ) {
          case "memory":
          case "rules":
            this.clearMemoryCache();
            break;
          case "settings":
            this.clearSettingsCache();
            break;
          case "skills":
            (this.clearSkillCache(), this.syncProductManager());
            break;
          case "commands":
          case "agents":
            this.syncProductManager();
        }
        (this.onDidHotReloadEmitter.fire({
          type: eA,
          filePath: el,
          timestamp: Date.now(),
        }),
          this.logger.info(`[HotReload] Completed for ${eA}`));
      } catch (eA: any) {
        this.logger.error("[HotReload] Failed:", eA);
      }
    }
    clearSkillCache(): any {
      try {
        let eA: any = e5.ContainerUtil.get(tM.SkillProductProvider);
        eA &&
          "function" == typeof eA.clearCache &&
          (eA.clearCache(),
          this.logger.debug("[HotReload] Skill cache cleared"));
      } catch (eA: any) {
        this.logger.debug(
          "[HotReload] SkillProductProvider not available for cache clear",
          eA,
        );
      }
    }
    clearPluginCache(): any {
      try {
        let eA: any = e5.ContainerUtil.get(tL.PluginManager);
        eA &&
          "function" == typeof eA.clearCache &&
          (eA.clearCache(),
          this.logger.debug("[HotReload] Plugin cache cleared"));
      } catch (eA: any) {
        this.logger.debug(
          "[HotReload] PluginManager not available for cache clear",
          eA,
        );
      }
    }
    clearMemoryCache(): any {
      try {
        let eA: any = e5.ContainerUtil.get(tN.MemoryCache);
        eA &&
          (eA.clear(), this.logger.debug("[HotReload] Memory cache cleared"));
        let el: any = e5.ContainerUtil.get(tN.SubdirectoryMemoryLoader);
        el &&
          (el.clear(),
          this.logger.debug("[HotReload] Subdirectory memory cache cleared"));
      } catch (eA: any) {
        this.logger.warn("[HotReload] Failed to clear memory cache:", eA);
      }
    }
    clearSettingsCache(): any {
      try {
        let eA: any = e5.ContainerUtil.get(tf.SettingsManager);
        eA &&
          "function" == typeof eA.clearCache &&
          (eA.clearCache(tf.SettingsScope.PROJECT),
          eA.clearCache(tf.SettingsScope.PROJECT_LOCAL),
          eA.clearCache(tf.SettingsScope.USER),
          this.logger.debug("[HotReload] Settings cache cleared"));
      } catch (eA: any) {
        this.logger.warn("[HotReload] Failed to clear settings cache:", eA);
      }
    }
    clearMcpConfigCache(): any {
      try {
        let eA: any = e5.ContainerUtil.get(tP.McpConfigManager);
        eA &&
          "function" == typeof eA.invalidateFilesystemScopeCaches &&
          (eA.invalidateFilesystemScopeCaches(),
          this.logger.debug(
            "[HotReload] MCP PROJECT/LOCAL config cache cleared",
          ));
      } catch (eA: any) {
        this.logger.debug(
          "[HotReload] McpConfigManager not available for cache clear",
          eA,
        );
      }
    }
    syncProductManager(eA: any = !1): any {
      try {
        let el: any = e5.ContainerUtil.get(e9.ProductManager);
        el
          ? (el.sync(eA),
            this.logger.debug(
              `[HotReload] ProductManager synced (force=${eA})`,
            ))
          : this.logger.warn("[HotReload] ProductManager not found");
      } catch (eA: any) {
        this.logger.warn("[HotReload] Failed to sync ProductManager:", eA);
      }
    }
  }
  eN = ConfigWatchServiceImpl;
  Object.assign(ConfigWatchServiceImpl, {
    WATCH_SETUP_DELAY: 2000,
    WINDOWS_RECURSIVE_WATCH_ENTRY_THRESHOLD: 512,
  });
  // UTF-16 9904348..9905553
  class McpWatchServiceImpl {
    [key: string]: any;
    constructor() {
      ((this.subscription = null),
        (this.debounceTimer = null),
        (this.debounceDelay = 3e3));
    }
    initialize(): any {
      this.setupServerModelSubscription();
    }
    cleanup(): any {
      (this.unsubscribe(),
        this.debounceTimer && clearTimeout(this.debounceTimer));
    }
    setupServerModelSubscription(): any {
      ((this.subscription = this.serverModelManager.changedSubject.subscribe(
        (eA: any) => {
          let el: any = eA.status;
          (this.logger.debug(
            `MCP server "${eA.name}" status changed to: ${el}`,
          ),
            (el === tP.McpServerStatus.CONNECTED ||
              el === tP.McpServerStatus.DISCONNECTED) &&
              (this.logger.debug(
                `Triggering ProductManager sync for MCP server "${eA.name}"`,
              ),
              this.debouncedSync()));
        },
      )),
        this.logger.debug("MCP server status watcher initialized"));
    }
    unsubscribe(): any {
      this.subscription &&
        (this.subscription.unsubscribe(),
        (this.subscription = null),
        this.logger.debug("MCP server status watcher unsubscribed"));
    }
    debouncedSync(): any {
      (this.debounceTimer && clearTimeout(this.debounceTimer),
        (this.debounceTimer = setTimeout(() => {
          try {
            let eA: any = e5.ContainerUtil.get(e9.ProductManager);
            eA
              ? (this.logger.info(
                  "[ProductManager.sync] Triggered by MCP server status changes",
                ),
                eA.sync())
              : this.logger.warn("ProductManager not found, cannot sync");
          } catch (eA: any) {
            this.logger.error("Failed to trigger ProductManager sync:", eA);
          }
        }, this.debounceDelay)));
    }
  }
  return { ConfigWatchServiceImpl, McpWatchServiceImpl };
}
