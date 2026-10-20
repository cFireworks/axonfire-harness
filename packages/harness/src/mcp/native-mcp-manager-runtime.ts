// Fixed WorkBuddy 5.3.14 SHA; complete original methods, TS-only annotations and outer DI.
import * as fs from "node:fs";
import * as path from "node:path";
import { randomBytes } from "node:crypto";
import { Subject, BehaviorSubject, combineLatest } from "rxjs";
import {
  NativeDeferred,
  NativeEmitter,
} from "../agents/native-agent-manager-runtime.js";
import { SettingsScope } from "../permissions/native-permission-policy.js";
import { CapturedJsonUtils } from "../vendor/captured-jsonc.js";
import { createNativeMcpUtils } from "./native-mcp-utils.js";
import { createNativeMcpRuntime } from "./native-mcp-runtime.js";
import { createNativeHostDetection } from "../permissions/native-host-detection.js";
import * as constants from "./native-mcp-manager-constants.js";
export function createNativeMcpManagerRuntime(runtime: any) {
  const Object: any = globalThis.Object;
  const process = {
      env: runtime.env ?? globalThis.process.env,
      argv: runtime.argv ?? [],
      stdout: { isTTY: runtime.isTTY ?? true },
    },
    Date = runtime.Date ?? globalThis.Date,
    AT = runtime.fs ?? fs,
    t7 = path,
    Ap = {
      ObjectUtils: {
        copy:
          runtime.copy ?? ((value: any) => JSON.parse(JSON.stringify(value))),
      },
    },
    AS = { SettingsScope },
    AL = { JsonUtils: CapturedJsonUtils },
    AR = "{}",
    AQ = 10000,
    eu = /\$\{([A-Z_][A-Z0-9_]*)(?::-(.*?))?\}/g;
  const tF: any = {
      ...constants,
      McpCliConfigInitializer: "cliInitializer",
      McpConfigManager: "configManager",
    },
    tH = { Subject },
    tG = { BehaviorSubject },
    A0 = { combineLatest },
    t5 = { randomBytes: runtime.randomBytes ?? randomBytes },
    tY = createNativeHostDetection(runtime),
    tj = { Events: { McpGetPrompt: "mcp_get_prompt" } },
    tJ = { StartupPhase: { MCP_CONFIG_LOAD: "mcp_config_load" } };
  const setTimeout = runtime.setTimeout ?? globalThis.setTimeout,
    clearTimeout = runtime.clearTimeout ?? globalThis.clearTimeout,
    setImmediate = runtime.setImmediate ?? globalThis.setImmediate;
  const tU: any = {
    Deferred: runtime.Deferred ?? NativeDeferred,
    Emitter: runtime.Emitter ?? NativeEmitter,
    Logger: "logger",
    ContainerUtil: {
      get: (name: string) => {
        if (!(name in runtime.dependencies))
          throw Error("MCP manager dependency not configured: " + name);
        return runtime.dependencies[name];
      },
    },
  };
  const ef = path,
    ep = AT,
    eh = { homedir: runtime.getPlatformHomeDir ?? runtime.getHomeDir },
    eE = constants;
  class PathUtils {
    static getHomeDir() {
      return runtime.getHomeDir();
    }
    static getWorkDir() {
      return runtime.getWorkDir();
    }
    static getMcpFilePath(eA: any): any {
      return eA === eE.McpScope.USER || eA === eE.McpScope.LOCAL
        ? (0, ef.join)((0, eh.homedir)(), eE.MCP_FILENAME)
        : (0, ef.join)(PathUtils.getWorkDir(), eE.MCP_LOCAL_FILENAME);
    }
    static resolveMcpFilePath(eA: any): any {
      if (eA === eE.McpScope.USER) {
        let eA: any = [
          (0, ef.join)(PathUtils.getHomeDir(), ".mcp.json"),
          (0, ef.join)(PathUtils.getHomeDir(), "mcp.json"),
          (0, ef.join)((0, eh.homedir)(), eE.MCP_FILENAME),
        ];
        for (let el of eA) if ((0, ep.existsSync)(el)) return el;
        return eA[0];
      }
      if (eA !== eE.McpScope.PROJECT) return PathUtils.getMcpFilePath(eA);
      {
        let eA: any = PathUtils.getWorkDir(),
          el: any = [
            (0, ef.join)(eA, ".mcp.json"),
            (0, ef.join)(eA, "mcp.json"),
          ];
        for (let eA of el) if ((0, ep.existsSync)(eA)) return eA;
        return el[0];
      }
    }
  }
  const mcpUtils = runtime.mcpUtils ?? createNativeMcpUtils(runtime),
    t8 = { McpUtils: mcpUtils, JsonUtils: CapturedJsonUtils, PathUtils },
    tW = { McpUtils: mcpUtils },
    A8 = { expandEnvVariables };
  const computeMcpConfigFingerprint =
    runtime.computeMcpConfigFingerprint ??
    createNativeMcpRuntime({
      ...runtime,
      dependencies: runtime.dependencies ?? {},
    }).computeMcpConfigFingerprint;
  let ey: any;
  function stableConfigValue(eA: any): any {
    return Array.isArray(eA)
      ? eA.map(stableConfigValue)
      : eA && "object" == typeof eA
        ? Object.fromEntries(
            Object.entries(eA)
              .sort(([eA]: any, [el]: any) => eA.localeCompare(el))
              .map(([eA, el]: any) => [eA, stableConfigValue(el)]),
          )
        : eA;
  }
  function computeProjectedConfigFingerprint(eA: any): any {
    return `${computeMcpConfigFingerprint(eA)}:${JSON.stringify(stableConfigValue(eA))}`;
  }
  function isTransportAlreadyStartedError(eA: any): any {
    return /already started/i.test(eA);
  }
  function expandEnvVariables(eA: any): any {
    let el: any = new Set();
    return {
      expanded: eA.replace(eu, (eA: any, ec: any, eu: any) => {
        let ed: any = process.env[ec];
        return void 0 !== ed ? ed : void 0 !== eu ? eu : (el.add(ec), eA);
      }),
      missingVars: [...el],
    };
  }
  // UTF-16 9201138..9223000
  class McpManager {
    [key: string]: any;
    declare static UNINITIALIZED_SERVERS: any;
    constructor() {
      ((this.serverCollectionSubject = new tG.BehaviorSubject(
        ey.UNINITIALIZED_SERVERS,
      )),
        (this.oauthCompletionSubject = new tH.Subject()),
        (this.allServersCache = []),
        (this.allServersCacheInitialized = !1),
        (this.desiredRevision = 0),
        (this.projectedRevision = -1),
        (this.queuedRevision = -1),
        (this.reconcileTail = Promise.resolve()),
        (this.runtimeSlots = new Map()),
        (this.nextRuntimeGeneration = 0),
        (this.connectedServersCache = []),
        (this.committedRuntimeGenerations = new Map()),
        (this.nonInteractiveMode = !1),
        (this.indexedDeferServers = new Map()),
        (this.cacheDbgInflight = 0),
        (this.cacheDbgRunSeq = 0),
        (this.rebuildChain = Promise.resolve()));
    }
    initialize(): any {
      (this.startupProfiler.markStart(
        tJ.StartupPhase.MCP_CONFIG_LOAD,
        "MCP Config Load",
      ),
        this.syncServerModelStatus(),
        this.syncToggleStatus(),
        this.syncToolsListChanged(),
        this.syncConfigChanges(),
        this.startupProfiler.markEnd(tJ.StartupPhase.MCP_CONFIG_LOAD));
    }
    syncServerModelStatus(): any {
      this.serverModelManager.changedSubject.subscribe((eA: any) => {
        let el: any = this.runtimeSlots.get(eA.name);
        (el?.model === eA && this.committedRuntimeGenerations.delete(eA.name),
          (this.rebuildChain = this.rebuildChain
            .then(() => this.rebuildConnectedCache(eA))
            .catch((eA: any) => {
              this.logger.error(
                `[MCP] syncServerModelStatus subscriber failed: ${eA instanceof Error ? eA.message : eA}`,
              );
            })));
      });
    }
    async rebuildConnectedCache(eA: any): Promise<any> {
      let el: any = ++this.cacheDbgRunSeq,
        ec: any = ++this.cacheDbgInflight;
      try {
        let eu: any = this.runtimeSlots.get(eA.name);
        if (eu && eu.model !== eA)
          return void this.logger.info(
            `[MCP] ignoring stale connection result: server=${eA.name} currentGeneration=${eu.generation}`,
          );
        if (!eu && !this.allServersCache.includes(eA))
          return void this.logger.info(
            `[MCP] ignoring orphaned connection result for removed server=${eA.name}`,
          );
        let ed: any = this.connectedServersCache.map((eA: any) => eA.name);
        this.logger.info(
          `[MCP][cacheDbg] run#${el} ENTER (inflight=${ec}): trigger=${eA.name} status=${eA.status} isActive=${eA.isActive()} | cacheBefore=[${ed.join(",")}] (size=${ed.length})`,
        );
        let ep: any = !1;
        if (
          eu &&
          eA.isActive() &&
          this.indexedDeferServers.get(eA.name) !== eu.generation
        ) {
          (this.indexedDeferServers.set(eA.name, eu.generation),
            this.logger.info(`Indexing deferred tools for server: ${eA.name}`));
          try {
            if (!(await this.indexDeferredToolsForServer(eA, eu))) return;
            ep = !0;
          } catch (el: any) {
            if (
              (this.logger.error(
                `Failed to index deferred tools for ${eA.name}: ${el}`,
              ),
              !this.isCurrentRuntimeSlot(eA.name, eu))
            )
              return void this.discardStaleDeferredIndex(
                eA.name,
                eu,
                "index-failed-after-reconcile",
              );
            (this.toolSearchService.removeToolsByServer(eA.name),
              this.indexedDeferServers.get(eA.name) === eu.generation &&
                this.indexedDeferServers.delete(eA.name),
              (ep = !0));
          }
        } else
          eu &&
            eA.isActive() &&
            this.indexedDeferServers.get(eA.name) === eu.generation &&
            (ep = !0);
        let eg: any = this.collectActiveModels(),
          eh: any = await Promise.all(
            eg.map(async (eA: any) => {
              try {
                let el: any = await this.serverManager.get(eA.name);
                return { name: eA.name, instance: el, error: void 0 };
              } catch (el: any) {
                return { name: eA.name, instance: void 0, error: el };
              }
            }),
          ),
          ef: any = new Map();
        for (let eA of eh) eA.instance && ef.set(eA.name, eA.instance);
        for (let eA of this.connectedServersCache)
          ef.has(eA.name) || ef.set(eA.name, eA);
        let em: any = this.collectActiveModels();
        this.logger.info(
          `[MCP][cacheDbg] run#${el} activeNow=[${em.map((eA: any) => eA.name).join(",")}] | allServers=[${this.allServersCache.map((eA: any) => `${eA.name}:${eA.status}`).join(",")}]`,
        );
        let eE: any = em.filter((eA: any) => !ef.has(eA.name));
        eE.length > 0 &&
          this.logger.warn(
            `[MCP][cacheDbg] run#${el} no instance yet for active models: [${eE.map((eA: any) => eA.name).join(",")}] (will be picked up by a later rebuild)`,
          );
        let eC: any = em.flatMap((el: any) => {
            let ec: any = this.runtimeSlots.get(el.name),
              eu: any = ef.get(el.name);
            return ec &&
              ec.model === el &&
              eu &&
              (this.committedRuntimeGenerations.get(el.name) ===
                ec.generation ||
                this.indexedDeferServers.get(el.name) === ec.generation ||
                (el === eA && ep && this.isCurrentRuntimeSlot(el.name, ec)))
              ? [{ active: el, slot: ec, instance: eu }]
              : [];
          }),
          ey: any = eC.map((eA: any) => eA.instance);
        for (let { active: eA, slot: el } of (this.connectedServersCache.splice(
          0,
          this.connectedServersCache.length,
          ...ey,
        ),
        eC))
          this.committedRuntimeGenerations.set(eA.name, el.generation);
        let ew: any = this.connectedServersCache.map((eA: any) => eA.name),
          eB: any = ed.filter((eA: any) => !ew.includes(eA));
        (this.logger.info(
          `[MCP][cacheDbg] run#${el} cache rebuilt: cacheAfter=[${ew.join(",")}] (size=${ew.length})` +
            (eB.length > 0 ? ` | REMOVED=[${eB.join(",")}]` : ""),
        ),
          this.allServersCache.some(
            (eA: any) =>
              eA.status === tF.McpServerStatus.PENDING ||
              eA.status === tF.McpServerStatus.CONNECTING,
          ) || this.mcpReadyService.resolve(),
          this.serverCollectionSubject.next(this.allServersCache));
      } finally {
        (this.cacheDbgInflight--,
          this.logger.info(
            `[MCP][cacheDbg] run#${el} EXIT (inflight=${this.cacheDbgInflight})`,
          ));
      }
    }
    collectActiveModels(): any {
      return this.allServersCache.filter((eA: any) => {
        let el: any = this.runtimeSlots.get(eA.name);
        return eA.isActive() && (!el || el.model === eA);
      });
    }
    syncToggleStatus(): any {
      this.toggleManager.toggleSubject.subscribe(
        async ({ serverName: eA, disabled: el }: any) => {
          let ec: any =
            this.runtimeSlots.get(eA)?.model ?? this.serverModelManager.get(eA);
          ec &&
            ec.status !== tF.McpServerStatus.PENDING_APPROVAL &&
            (el
              ? this.connectionManager.disconnect(ec)
              : this.connectionManager.reconnect(ec));
        },
      );
    }
    syncToolsListChanged(): any {
      this.serverManager.toolsListChangedSubject.subscribe((eA: any) => {
        this.rebuildChain = this.rebuildChain
          .then(() => this.reindexDeferredToolsForCurrentSlot(eA))
          .catch((el: any) => {
            this.logger.debug(
              `Error handling tools/list_changed for ${eA}: ${el}`,
            );
          });
      });
    }
    async reindexDeferredToolsForCurrentSlot(eA: any): Promise<any> {
      this.consoleManager.log(
        `[MCP] Server "${eA}" reported tool list changes. Tools will be refreshed on next use.`,
      );
      let el: any = this.runtimeSlots.get(eA);
      if (el && el.model.isActive()) {
        (this.toolSearchService.removeToolsByServer(eA),
          this.indexedDeferServers.set(eA, el.generation));
        try {
          await this.indexDeferredToolsForServer(el.model, el);
        } catch (ec: any) {
          if (
            (this.logger.debug(
              `Failed to re-index deferred tools for ${eA}: ${ec}`,
            ),
            !this.isCurrentRuntimeSlot(eA, el))
          )
            return void this.discardStaleDeferredIndex(
              eA,
              el,
              "tools-list-changed-after-reconcile",
            );
          this.indexedDeferServers.get(eA) === el.generation &&
            this.indexedDeferServers.delete(eA);
        }
      }
    }
    syncConfigChanges(): any {
      this.configManager.changedSubject.subscribe(({ scope: eA }: any) => {
        (this.logger.info(
          `[MCP] config scope=${eA} changed — scheduling desired revision ${this.desiredRevision + 1}`,
        ),
          this.desiredRevision++,
          (this.allServersCacheInitialized = !1),
          (this.nonInteractiveMode ||
            this.queuedRevision > this.projectedRevision) &&
            this.enqueueReconcile(`config:${eA}`).catch((el: any) => {
              this.logger.error(
                `[MCP] Rescan after config change (scope=${eA}) failed: ${el instanceof Error ? el.message : el}`,
              );
            }));
      });
    }
    async add(eA: any, el: any, ec: any = tF.McpScope.LOCAL): Promise<any> {
      (await this.configManager.set(ec, eA, el),
        await this.enqueueReconcile(`add:${ec}:${eA}`));
    }
    async remove(eA: any, el?: any): Promise<any> {
      try {
        if (el) await this.configManager.delete(el, eA);
        else
          for (let el of tF.MERGE_SCOPE_PRIORITY)
            await this.configManager.delete(el, eA);
      } catch (eA: any) {}
      await this.enqueueReconcile(`remove:${el ?? "all"}:${eA}`);
    }
    async get(eA: any, el: any): Promise<any> {
      if (el === tF.McpScope.INTERNAL)
        throw Error("Cannot access INTERNAL scope servers externally");
      let ec: any = this.serverModelManager.get(eA, el);
      if (!ec) throw Error(`No MCP server found with name: ${eA}`);
      if (ec.scope === tF.McpScope.INTERNAL)
        throw Error("Cannot access INTERNAL scope servers externally");
      return ec;
    }
    async list(eA?: any): Promise<any> {
      return (this.logger.info(
        `[Startup] McpManager.list: starting (scope=${eA ?? "all"})`,
      ),
      eA)
        ? eA === tF.McpScope.INTERNAL
          ? []
          : Object.entries(await this.configManager.list(eA)).map(
              ([el, ec]: any) => this.serverModelManager.create(eA, el, ec),
            )
        : this.allServersCacheInitialized &&
            this.projectedRevision >= this.desiredRevision
          ? this.allServersCache
          : this.enqueueReconcile("list");
    }
    getProjectedPluginServerNames(): any {
      return Object.freeze(
        this.allServersCache
          .filter((eA: any) => eA.scope === tF.McpScope.PLUGIN)
          .map((eA: any) => eA.name)
          .sort(),
      );
    }
    async previewEffectivePluginServerNames(eA: any): Promise<any> {
      let el: any = await this.configManager.list(),
        ec: any = new Set(),
        eu: any = [];
      for (let ed of tF.MERGE_SCOPE_PRIORITY)
        for (let ep of Object.keys(ed === tF.McpScope.PLUGIN ? eA : el[ed]))
          ec.has(ep) || (ec.add(ep), ed === tF.McpScope.PLUGIN && eu.push(ep));
      return Object.freeze(eu.sort());
    }
    enqueueReconcile(eA: any): any {
      let el: any = this.desiredRevision;
      if (this.allServersCacheInitialized && this.projectedRevision >= el)
        return Promise.resolve(this.allServersCache);
      if (this.queuedRevision < el) {
        this.queuedRevision = el;
        let run: any = () => this.reconcileRevision(el, eA),
          ec: any = this.reconcileTail.then(run, run);
        this.reconcileTail = ec.then(
          () => void 0,
          (eA: any) => {
            (this.queuedRevision === el &&
              this.projectedRevision < el &&
              (this.queuedRevision = this.projectedRevision),
              this.logger.error(
                `[MCP] reconcile revision=${el} failed: ${eA instanceof Error ? eA.message : String(eA)}`,
              ));
          },
        );
      }
      return this.waitForReconcileTailToStabilize();
    }
    async waitForReconcileTailToStabilize(): Promise<any> {
      for (;;) {
        let eA: any = this.reconcileTail;
        if ((await eA, eA === this.reconcileTail)) return this.allServersCache;
      }
    }
    async reloadPluginServers(): Promise<any> {
      let eA: any = this.desiredRevision;
      (this.configManager.invalidatePluginScopeCache?.(),
        this.desiredRevision === eA && this.desiredRevision++,
        (this.allServersCacheInitialized = !1),
        await this.enqueueReconcile("reload-plugins"));
    }
    async reconcileRevision(eA: any, el: any): Promise<any> {
      this.logger.info(`[MCP] reconcile revision=${eA} started (${el})`);
      let ec: any = await this.configManager.list(),
        eu: any = new Map();
      for (let eA of tF.MERGE_SCOPE_PRIORITY)
        for (let [el, ed] of Object.entries(ec[eA])) {
          if (eu.has(el)) continue;
          let ec: any = await this.permissionsManager.isAllowed(el, eA);
          eu.set(el, {
            name: el,
            scope: eA,
            config: ed,
            allowed: ec,
            fingerprint: `${computeProjectedConfigFingerprint(ed)}:allowed=${ec}`,
          });
        }
      for (let eA of Object.keys(ec[tF.McpScope.PLUGIN] ?? {}))
        eu.get(eA)?.scope !== tF.McpScope.PLUGIN &&
          this.serverModelManager.delete?.(tF.McpScope.PLUGIN, eA);
      let ed: any = new Map(
          this.allServersCache.map((eA: any) => [eA.name, eA]),
        ),
        ep: any = [],
        eg: any = new Map(),
        eh: any = [],
        ef: any = new Set(),
        em: any = [];
      for (let [eA, el] of ed)
        eu.has(eA) ||
          (ef.add(eA),
          this.runtimeSlots.delete(eA),
          this.committedRuntimeGenerations.delete(eA),
          this.toolSearchService.removeToolsByServer(eA),
          this.indexedDeferServers.delete(eA),
          this.serverModelManager.delete?.(el.scope, eA));
      for (let eA of eu.values()) {
        let el: any = ed.get(eA.name),
          ec: any = this.runtimeSlots.get(eA.name);
        if (
          el &&
          ec &&
          el.scope === eA.scope &&
          ec.fingerprint === eA.fingerprint
        ) {
          (ep.push(el), eg.set(eA.name, ec));
          continue;
        }
        (this.committedRuntimeGenerations.delete(eA.name),
          el &&
            (ef.add(eA.name),
            this.toolSearchService.removeToolsByServer(eA.name),
            this.indexedDeferServers.delete(eA.name),
            this.serverModelManager.delete?.(el.scope, eA.name)));
        let eu: any = this.serverModelManager.create(
          eA.scope,
          eA.name,
          eA.config,
        );
        ((eu.status = eA.allowed
          ? tF.McpServerStatus.PENDING
          : tF.McpServerStatus.PENDING_APPROVAL),
          eA.allowed || (eu.error = "Needs approval"));
        let eE: any = {
          generation: ++this.nextRuntimeGeneration,
          fingerprint: eA.fingerprint,
          model: eu,
        };
        (ep.push(eu),
          eg.set(eA.name, eE),
          eA.allowed
            ? eh.push({ name: eA.name, config: eA.config, model: eu, slot: eE })
            : (ef.add(eA.name), em.push({ name: eA.name, slot: eE })));
      }
      for (let [eA, el] of ((this.allServersCache = ep),
      this.runtimeSlots.clear(),
      eg))
        this.runtimeSlots.set(eA, el);
      ((this.projectedRevision = Math.max(this.projectedRevision, eA)),
        (this.allServersCacheInitialized =
          this.projectedRevision >= this.desiredRevision));
      let eE: any = new Set(
          ep
            .filter((eA: any) => {
              let el: any = this.runtimeSlots.get(eA.name);
              return (
                ed.get(eA.name) === eA &&
                eA.isActive() &&
                !!el &&
                el.model === eA &&
                this.committedRuntimeGenerations.get(eA.name) === el.generation
              );
            })
            .map((eA: any) => eA.name),
        ),
        eC: any = this.connectedServersCache.filter((eA: any) =>
          eE.has(eA.name),
        );
      this.connectedServersCache.splice(
        0,
        this.connectedServersCache.length,
        ...eC,
      );
      let ey: any = new Set(em.map((eA: any) => eA.name));
      for (let eA of ef) ey.has(eA) || this.evictServerRuntime(eA);
      for (let eA of em) this.evictDeniedRuntime(eA.name, eA.slot);
      for (let eA of (this.serverCollectionSubject.next(this.allServersCache),
      eh))
        setImmediate(() => {
          this.connectProjectedSlot(eA).catch((el: any) => {
            this.logger.error(
              `[MCP] background connect failed for ${eA.name}: ${el instanceof Error ? el.message : String(el)}`,
            );
          });
        });
      (0 === ep.length && this.mcpReadyService.resolve(),
        this.logger.info(
          `[MCP] reconcile revision=${eA} projected (retained=${ep.length - eh.length}, pending=${eh.length}, evicted=${ef.size})`,
        ));
    }
    isCurrentRuntimeSlot(eA: any, el: any): any {
      let ec: any = this.runtimeSlots.get(eA);
      return (
        ec?.generation === el.generation &&
        ec.fingerprint === el.fingerprint &&
        ec.model === el.model
      );
    }
    evictServerRuntime(eA: any): any {
      this.serverManager.delete(eA).catch((el: any) => {
        this.logger.warn(
          `[MCP] failed to evict server runtime=${eA}: ${el instanceof Error ? el.message : String(el)}`,
        );
      });
    }
    evictDeniedRuntime(eA: any, el: any): any {
      this.evictServerRuntime(eA);
      let ec: any = this.serverManager.waitForIdle?.bind(this.serverManager);
      ec &&
        ec(eA)
          .then(() => {
            this.isCurrentRuntimeSlot(eA, el) &&
              el.model.status === tF.McpServerStatus.PENDING_APPROVAL &&
              this.evictServerRuntime(eA);
          })
          .catch((el: any) => {
            this.logger.warn(
              `[MCP] failed to finish denied runtime cleanup=${eA}: ${el instanceof Error ? el.message : String(el)}`,
            );
          });
    }
    async connectProjectedSlot(eA: any): Promise<any> {
      if (this.isCurrentRuntimeSlot(eA.name, eA.slot)) {
        eA.model.status = tF.McpServerStatus.CONNECTING;
        try {
          if (
            (await this.serverManager.create(eA.name, eA.config),
            !this.isCurrentRuntimeSlot(eA.name, eA.slot))
          ) {
            this.logger.info(
              `[MCP] discarded stale create result: server=${eA.name} generation=${eA.slot.generation}`,
            );
            let el: any = this.runtimeSlots.get(eA.name);
            (el && el.model.status !== tF.McpServerStatus.PENDING_APPROVAL) ||
              this.evictServerRuntime(eA.name);
            return;
          }
          this.toggleManager.isDisabled(eA.name)
            ? await this.connectionManager.disconnect(eA.model)
            : await this.connectionManager.connect(eA.model);
        } catch (ec: any) {
          if (!this.isCurrentRuntimeSlot(eA.name, eA.slot)) return;
          let el: any = ec instanceof Error ? ec.message : String(ec);
          ((eA.model.error = `Failed to create/connect server: ${el}`),
            (eA.model.status = tF.McpServerStatus.DISCONNECTED));
        }
        this.isCurrentRuntimeSlot(eA.name, eA.slot) ||
          this.logger.info(
            `[MCP] discarded stale connect result: server=${eA.name} generation=${eA.slot.generation}`,
          );
      }
    }
    async listTools(eA: any, el: any): Promise<any> {
      await this.list();
      let ec: any = this.runtimeSlots.get(eA);
      if (
        !ec ||
        (void 0 !== el && ec.model.scope !== el) ||
        ec.model.status === tF.McpServerStatus.PENDING_APPROVAL
      )
        return [];
      let eu: any = await this.serverManager.create(eA, ec.model.config);
      return (await eu?.listTools()) || [];
    }
    async getLocations(): Promise<any> {
      let eA: any = [];
      for (let el of [
        tF.McpScope.USER,
        tF.McpScope.PROJECT,
        tF.McpScope.LOCAL,
      ]) {
        let ec: any = this.configStore.getLocation(el);
        el === tF.McpScope.LOCAL
          ? eA.push({
              scope: el,
              path: ec.filePath,
              nestedPath: `projects[${ec.projectPath}]`,
            })
          : eA.push({ scope: el, path: ec.filePath });
      }
      return eA;
    }
    async getServerAllTools(): Promise<any> {
      let eA: any = new Map();
      for (let el of await this.list())
        if (el.status === tF.McpServerStatus.CONNECTED)
          try {
            let ec: any = await this.listTools(el.name, el.scope);
            eA.set(el.name, ec);
          } catch (eA: any) {
            this.consoleManager.debug(
              `Failed to get tools from MCP server ${el.name}:`,
              eA,
            );
          }
      return eA;
    }
    async reconnect(eA: any, el: any): Promise<any> {
      await this.list();
      let ec: any = this.runtimeSlots.get(eA),
        eu: any = ec?.model;
      if (
        !eu ||
        (void 0 !== el && eu.scope !== el) ||
        eu.status === tF.McpServerStatus.PENDING_APPROVAL
      )
        return !1;
      let ed: any = Date.now();
      try {
        let { status: el } = await this.connectionManager.reconnect(eu);
        if (el !== tF.McpServerStatus.CONNECTED) return !1;
        let ec: any = Date.now() - ed;
        return (
          this.debugService.debug(
            `MCP server "${eA}": Successfully reconnected to ${eu.config.type} server in ${ec}ms`,
          ),
          !0
        );
      } catch (eA: any) {
        return !1;
      }
    }
    async startOAuthFlow(eA: any, el: any): Promise<any> {
      return (await this.oauthManager.getAuthorizationUrl(eA)) || "";
    }
    async hasValidOAuthTokens(eA: any): Promise<any> {
      let el: any = await this.oauthManager.getProvider(eA);
      return !!el && void 0 !== el.tokens();
    }
    async invalidateOAuthCredentials(
      eA: any,
      el: any = "tokens",
    ): Promise<any> {
      await this.oauthManager.invalidateCredentials(eA, el);
    }
    setNonInteractiveMode(eA: any): any {
      (this.logger.info(`[Startup] McpManager.setNonInteractiveMode(${eA})`),
        (this.nonInteractiveMode = eA),
        eA &&
          (this.logger.info(
            "[Startup] McpManager: non-interactive projection enabled, calling list()...",
          ),
          this.list()));
    }
    isNonInteractiveMode(): any {
      return this.nonInteractiveMode;
    }
    allServersSettled(): any {
      return (
        this.allServersCacheInitialized &&
        !this.allServersCache.some((eA: any) =>
          this.isServerPendingOrUncommitted(eA),
        )
      );
    }
    isServerPendingOrUncommitted(eA: any): any {
      if (
        eA.status === tF.McpServerStatus.PENDING ||
        eA.status === tF.McpServerStatus.CONNECTING
      )
        return !0;
      if (!eA.isActive()) return !1;
      let el: any = this.runtimeSlots.get(eA.name);
      return (
        !!el &&
        el.model === eA &&
        this.committedRuntimeGenerations.get(eA.name) !== el.generation
      );
    }
    async waitForPendingServers(eA: any = {}): Promise<any> {
      await this.list();
      let el: any = eA.names ? new Set(eA.names) : void 0,
        hasPending: any = () =>
          this.allServersCache.some(
            (eA: any) =>
              (!el || el.has(eA.name)) && this.isServerPendingOrUncommitted(eA),
          );
      if (!hasPending() || eA.signal?.aborted) return;
      let ec: any = eA.timeoutMs ?? 2e3;
      await new Promise((el: any) => {
        let eu: any = !1,
          ed: any = {},
          finish: any = () => {
            eu ||
              ((eu = !0),
              ed.timer && clearTimeout(ed.timer),
              ed.subscription?.unsubscribe(),
              eA.signal?.removeEventListener("abort", finish),
              el());
          };
        ((ed.subscription = this.serverCollectionSubject.subscribe(() => {
          hasPending() || finish();
        })),
        eu)
          ? ed.subscription.unsubscribe()
          : ((ed.timer = setTimeout(finish, Math.max(0, ec))),
            eA.signal?.addEventListener("abort", finish, { once: !0 }),
            (!hasPending() || eA.signal?.aborted) && finish());
      });
    }
    async waitForServer(eA: any, el: any = {}): Promise<any> {
      return (
        await this.waitForPendingServers({
          names: [eA],
          timeoutMs: el.timeoutMs,
          signal: el.signal,
        }),
        this.connectedServersCache.find((el: any) => el.name === eA)
      );
    }
    async getConnectedServers(eA: any): Promise<any> {
      let el: any = eA?.waitForSettle ?? !1,
        ec: any = this.isNonInteractiveMode();
      if (
        (this.logger.info(
          `[MCP][cacheDbg] getConnectedServers() called: nonInteractive=${ec} waitForSettle=${el} cacheNow=[${this.connectedServersCache.map((eA: any) => eA.name).join(",")}] allServers=[${this.allServersCache.map((eA: any) => `${eA.name}:${eA.status}`).join(",")}]`,
        ),
        el && ec && !this.allServersSettled())
      ) {
        let el: any = Date.now();
        (await this.waitForPendingServers({
          timeoutMs: eA?.timeoutMs ?? 2e3,
          signal: eA?.signal,
        }),
          this.logger.info(
            `[MCP][cacheDbg] getConnectedServers() settle wait=${Date.now() - el}ms`,
          ));
      }
      return (
        this.logger.info(
          `[MCP][cacheDbg] getConnectedServers() returning: [${this.connectedServersCache.map((eA: any) => eA.name).join(",")}] (size=${this.connectedServersCache.length})`,
        ),
        this.connectedServersCache
      );
    }
    async getServerScopes(eA: any): Promise<any> {
      return (await this.configManager.getByName(eA)).map(
        (eA: any) => eA.scope,
      );
    }
    async allow(eA: any): Promise<any> {
      0 !== eA.length &&
        (await this.permissionsManager.approve(eA),
        await this.reconcilePermissionDecision(`allow:${eA.join(",")}`));
    }
    async deny(eA: any): Promise<any> {
      0 !== eA.length &&
        (await this.permissionsManager.deny(eA),
        await this.reconcilePermissionDecision(`deny:${eA.join(",")}`));
    }
    async allowAllForever(): Promise<any> {
      (await this.permissionsManager.approveAll(),
        await this.reconcilePermissionDecision("allow-all"));
    }
    async reconcilePermissionDecision(eA: any): Promise<any> {
      (this.desiredRevision++,
        (this.allServersCacheInitialized = !1),
        await this.enqueueReconcile(`permission:${eA}`));
    }
    async getAllNeedingApproval(): Promise<any> {
      return this.permissionsManager.getServersNeedingConfirmation();
    }
    async toggleServer(eA: any, el: any): Promise<any> {
      el
        ? await this.toggleManager.enable(eA)
        : await this.toggleManager.disable(eA);
    }
    isServerDisabled(eA: any): any {
      return this.toggleManager.isDisabled(eA);
    }
    async getPrompt(eA: any, el: any, ec: any): Promise<any> {
      await this.list();
      let eu: any = this.runtimeSlots.get(eA);
      if (!eu) throw Error(`MCP server "${eA}" not found`);
      if (eu.model.status === tF.McpServerStatus.PENDING_APPROVAL)
        throw Error(`MCP server "${eA}" requires approval`);
      let ed: any = await this.serverManager.get(eA);
      if (!ed) throw Error(`MCP server "${eA}" not found`);
      let ep: any = el;
      try {
        let eu: any = await ed.listPrompts();
        eu.find((eA: any) => eA.name === el) ||
          (el = eu.find((eA: any) => eA.title === el)?.name || "");
        let eg: any = await ed.getPrompt(el, ec);
        return (this.reportMcpGetPrompt(eA, ep, ec, !0), eg);
      } catch (eu: any) {
        throw (
          this.logger.error(
            `[MCP] Failed to getPrompt "${el}" from server "${eA}":`,
            eu,
          ),
          this.reportMcpGetPrompt(eA, ep, ec, !1),
          eu
        );
      }
    }
    reportMcpGetPrompt(eA: any, el: any, ec: any, eu: any): any {
      if ((0, tY.isWorkBuddyDesktop)())
        try {
          this.eventService
            .report(tj.Events.McpGetPrompt, {
              id: "",
              name: eA,
              toolName: el,
              toolArgs: JSON.stringify(ec ?? {}),
              toolCallSuccessful: eu,
            })
            .catch(() => {});
        } catch {}
    }
    discardStaleDeferredIndex(eA: any, el: any, ec: any): any {
      (this.indexedDeferServers.delete(eA),
        this.toolSearchService.removeToolsByServer(eA),
        this.logger.info(
          `[MCP] discarded stale deferred-tool index: server=${eA} generation=${el.generation} reason=${ec}`,
        ));
      let eu: any = this.runtimeSlots.get(eA);
      eu &&
        eu.generation !== el.generation &&
        eu.model.isActive() &&
        (this.rebuildChain = this.rebuildChain
          .then(async () => {
            let ec: any = this.runtimeSlots.get(eA);
            ec &&
              ec.generation !== el.generation &&
              ec.model.isActive() &&
              this.indexedDeferServers.get(eA) !== ec.generation &&
              (await this.reindexDeferredToolsForCurrentSlot(eA));
          })
          .catch((el: any) => {
            this.logger.debug(
              `[MCP] failed to recover deferred-tool index for ${eA}: ${el}`,
            );
          }));
    }
    async indexDeferredToolsForServer(eA: any, el: any): Promise<any> {
      let stillOwnsSlot: any = () => this.isCurrentRuntimeSlot(eA.name, el),
        rejectStaleCommit: any = (ec: any) => (
          this.discardStaleDeferredIndex(eA.name, el, ec),
          !1
        ),
        ec: any = eA.config;
      if ("sdk" === ec.type)
        return (
          this.logger.debug(
            `[MCP][defer] indexDeferredToolsForServer SKIP server=${eA.name} reason=sdk-type`,
          ),
          stillOwnsSlot() || rejectStaleCommit("sdk-skip-after-reconcile")
        );
      let eu: any = await this.serverManager.get(eA.name);
      if (!stillOwnsSlot())
        return rejectStaleCommit("server-get-after-reconcile");
      if (!eu)
        return (
          this.logger.warn(
            `[MCP][defer] indexDeferredToolsForServer SKIP server=${eA.name} reason=serverManager.get returned null`,
          ),
          !0
        );
      let ed: any = await eu.listTools();
      if (!stillOwnsSlot())
        return rejectStaleCommit("list-tools-after-reconcile");
      this.logger.debug(`Server ${eA.name} has ${ed.length} tools to index`);
      let ep: any = "transparent_proxy" in ec && !0 === ec.transparent_proxy,
        eg: any = 0,
        eh: any = 0;
      for (let el of ed) {
        let eu: any = tW.McpUtils.getRawToolName(el.name),
          ed: any = tW.McpUtils.buildDeferLookupNames(eA.name, el.name, ep),
          ef: any = await this.deferToolConfigService.isToolDeferLoading(
            ec,
            ...ed,
          );
        if (!stillOwnsSlot())
          return rejectStaleCommit("defer-policy-after-reconcile");
        if (ef) {
          eg++;
          let ep: any = "tools" in ec ? ec.tools : void 0,
            eh: any =
              "builtin_tools" in ec && Array.isArray(ec.builtin_tools)
                ? new Set(ec.builtin_tools)
                : void 0,
            ef: any =
              eh?.has(el.name) === !0 ||
              ep?.[el.name]?.bare_name === !0 ||
              ed.some((eA: any) => ep?.[eA]?.bare_name === !0),
            em: any =
              el.name.startsWith("mcp__") || ef
                ? el.name
                : tW.McpUtils.buildFullToolName(eA.name, el.name),
            eE: any = el._meta?.[tF.TOOL_SHORT_DESCRIPTION_META_KEY],
            eC: any = "string" == typeof eE ? eE : void 0;
          if (
            (this.logger.debug(`Indexed deferred tool: ${em}`),
            await this.toolSearchService.indexTool({
              name: em,
              description: el.description || "",
              summary: eC || el.description || "",
              parameters: el.inputSchema || {},
              defer_loading: !0,
              isBare: ef,
              serverName: eA.name,
              rawToolName: eu,
            }),
            !stillOwnsSlot())
          )
            return rejectStaleCommit("index-tool-after-reconcile");
        } else eh++;
      }
      return stillOwnsSlot()
        ? (this.logger.debug(
            `[MCP][defer] indexDeferredToolsForServer EXIT server=${eA.name} indexed=${eg} skipped=${eh}`,
          ),
          !0)
        : rejectStaleCommit("index-complete-after-reconcile");
    }
  }
  // UTF-16 9227386..9235183
  class McpConfigManager {
    [key: string]: any;
    constructor() {
      ((this.changedSubject = new tH.Subject()),
        (this.scopeDataCache = new Map()),
        (this.inflightReads = new Map()),
        (this.strictDynamic = !1),
        (this.dynamicConfigInitialized = new tU.Deferred()),
        (this.mcpToSettingsScopeMap = {
          [tF.McpScope.USER]: AS.SettingsScope.USER,
          [tF.McpScope.PROJECT]: AS.SettingsScope.PROJECT,
          [tF.McpScope.LOCAL]: AS.SettingsScope.PROJECT_LOCAL,
        }));
    }
    async get(eA: any, el: any): Promise<any> {
      let ec: any = this.scopeDataCache.get(eA);
      if (ec && el in ec) return this.expandSingleConfig(el, ec[el], eA);
      await this.awaitDynamicConfigInitialized("get");
      let eu: any = (await this.list(eA))[el];
      if (!eu) throw Error(`Server '${el}' not found in scope '${eA}'`);
      return eu;
    }
    async set(eA: any, el: any, ec?: any): Promise<any> {
      if ("string" == typeof el) {
        let eu: any = el;
        if (!ec) throw Error("Config is required when setting a single server");
        let ed: any = this.scopeDataCache.get(eA) ?? {};
        if (ed[eu] === ec) return;
        ((ed[eu] = ec),
          this.writeServerConfigs(ed, eA),
          this.scopeDataCache.set(eA, ed));
      } else {
        let ec: any = el,
          eu: any = this.normalizePartialData(ec);
        (this.writeServerConfigs(eu, eA, !0), this.scopeDataCache.set(eA, eu));
      }
      (eA === tF.McpScope.DYNAMIC && this.dynamicConfigInitialized.resolve(),
        this.changedSubject.next({ scope: eA }));
    }
    async delete(eA: any, el: any): Promise<any> {
      let ec: any = this.scopeDataCache.get(eA) ?? {};
      if (
        eA === tF.McpScope.DYNAMIC ||
        eA === tF.McpScope.INTERNAL ||
        eA === tF.McpScope.SDK
      )
        return (
          delete ec[el],
          this.mcpLogService.log(el, `Server removed from scope '${eA}'`),
          this.changedSubject.next({ scope: eA }),
          !0
        );
      let eu: any = await this.read(eA);
      return el in eu
        ? (delete eu[el],
          this.writeServerConfigs(eu, eA, !0),
          this.mcpLogService.log(el, `Server removed from scope '${eA}'`),
          this.changedSubject.next({ scope: eA }),
          !0)
        : (this.mcpLogService.log(el, `Server not found in scope '${eA}'`), !1);
    }
    async list(eA?: any): Promise<any> {
      if (void 0 !== eA) {
        let el: any = Date.now();
        this.logger.info(
          `[Startup] McpConfigManager.list: loading scope=${eA}`,
        );
        let ec: any = this.scopeDataCache.get(eA);
        if (ec)
          return (
            this.logger.info(
              `[Startup] McpConfigManager.list: scope=${eA} cache hit (${Date.now() - el}ms)`,
            ),
            this.expandScopeData(ec, eA)
          );
        let eu: any = this.inflightReads.get(eA);
        if (eu) {
          this.logger.info(
            `[Startup] McpConfigManager.list: scope=${eA} inflight join`,
          );
          let ec: any = await eu;
          return (
            this.logger.info(
              `[Startup] McpConfigManager.list: scope=${eA} inflight resolved (${Date.now() - el}ms)`,
            ),
            this.expandScopeData(ec, eA)
          );
        }
        let ed: any = Promise.resolve().then(async () => {
          try {
            let el: any = await this.read(eA),
              ec: any = this.normalizePartialData(el);
            return (
              this.inflightReads.get(eA) === ed &&
                this.scopeDataCache.set(eA, ec),
              ec
            );
          } catch (el: any) {
            throw (
              this.logger.error(
                `[Startup] McpConfigManager.list: scope=${eA} read failed: ${el instanceof Error ? el.message : el}`,
              ),
              el
            );
          } finally {
            this.inflightReads.get(eA) === ed && this.inflightReads.delete(eA);
          }
        });
        this.inflightReads.set(eA, ed);
        let ep: any = await ed;
        return (
          this.logger.info(
            `[Startup] McpConfigManager.list: scope=${eA} read completed (${Date.now() - el}ms)`,
          ),
          this.expandScopeData(ep, eA)
        );
      }
      return {
        [tF.McpScope.INTERNAL]: await this.list(tF.McpScope.INTERNAL),
        [tF.McpScope.SDK]: await this.list(tF.McpScope.SDK),
        [tF.McpScope.PLUGIN]: await this.list(tF.McpScope.PLUGIN),
        [tF.McpScope.USER]: await this.list(tF.McpScope.USER),
        [tF.McpScope.PROJECT]: await this.list(tF.McpScope.PROJECT),
        [tF.McpScope.LOCAL]: await this.list(tF.McpScope.LOCAL),
        [tF.McpScope.DYNAMIC]: await this.list(tF.McpScope.DYNAMIC),
      };
    }
    async readMcpServersFromPlugins(): Promise<any> {
      try {
        this.logger.info(
          "[Startup] McpConfigManager: reading MCP servers from plugins...",
        );
        let eA: any = {},
          el: any = await this.pluginManager.getActivePlugins();
        for (let { plugin: ec, components: eu } of (this.logger.info(
          `[Startup] McpConfigManager: got ${el.length} active plugins`,
        ),
        el))
          (this.logger.info(
            `[Startup] McpConfigManager: loading components for enabled plugin: ${ec.name}@${ec.marketplaceName}`,
          ),
            eu?.mcpServers &&
              (this.logger.info(
                `[Startup] McpConfigManager: plugin ${ec.name} has ${Object.keys(eu.mcpServers).length} MCP servers`,
              ),
              Object.assign(eA, eu.mcpServers)));
        return (
          this.logger.info(
            `[Startup] McpConfigManager: total MCP servers from plugins: ${Object.keys(eA).length}`,
          ),
          eA
        );
      } catch (eA: any) {
        return (
          this.mcpLogService.log(
            "PluginMcpLoader",
            `Error reading MCP servers from plugins: ${eA}`,
          ),
          this.logger.error(
            `[Startup] McpConfigManager plugin loading error: ${eA instanceof Error ? eA.stack : eA}`,
          ),
          {}
        );
      }
    }
    normalizePartialData(eA: any): any {
      let el: any = {};
      for (let [ec, eu] of Object.entries(eA)) {
        if ("type" in eu && eu.type) {
          el[ec] = eu;
          continue;
        }
        "command" in eu && eu.command
          ? (el[ec] = {
              type: "stdio",
              command: eu.command,
              args: eu.args,
              env: eu.env,
              description: eu.description,
              alwaysLoad: eu.alwaysLoad,
              defer_loading: eu.defer_loading,
              tools: eu.tools,
            })
          : "ideName" in eu && eu.ideName
            ? (el[ec] = {
                type: "ws-ide",
                url: eu.url,
                ideName: eu.ideName,
                authToken: eu.authToken ?? void 0,
                ideRunningInWindows: eu.ideRunningInWindows ?? void 0,
                description: eu.description,
                alwaysLoad: eu.alwaysLoad,
                defer_loading: eu.defer_loading,
                tools: eu.tools,
              })
            : "url" in eu && eu.url
              ? (el[ec] = {
                  type: "http",
                  url: eu.url,
                  headers: "headers" in eu ? eu.headers : void 0,
                  description: eu.description,
                  alwaysLoad: eu.alwaysLoad,
                  defer_loading: eu.defer_loading,
                  tools: eu.tools,
                })
              : this.mcpLogService.log(
                  ec,
                  `Warning: Cannot infer type for server '${ec}', missing required fields`,
                );
      }
      return el;
    }
    async readInternal(): Promise<any> {
      return this.scopeDataCache.get(tF.McpScope.INTERNAL) ?? {};
    }
    async readSdk(): Promise<any> {
      return this.scopeDataCache.get(tF.McpScope.SDK) ?? {};
    }
    async awaitDynamicConfigInitialized(eA: any): Promise<any> {
      await tW.McpUtils.raceWithTimeout(
        this.dynamicConfigInitialized.promise,
        () =>
          this.logger.warn(
            `[Startup] McpConfigManager.${eA}: dynamicConfigInitialized not resolved within ${AQ}ms — proceeding with current DYNAMIC cache (may be empty)`,
          ),
        AQ,
      );
    }
    async readDynamic(): Promise<any> {
      return (
        this.logger.info(
          "[Startup] McpConfigManager.readDynamic: waiting for dynamicConfigInitialized...",
        ),
        await this.awaitDynamicConfigInitialized("readDynamic"),
        this.logger.info(
          "[Startup] McpConfigManager.readDynamic: dynamicConfigInitialized resolved",
        ),
        this.scopeDataCache.get(tF.McpScope.DYNAMIC) ?? {}
      );
    }
    async shouldLoadFromFilesystem(eA: any): Promise<any> {
      if (eA === tF.McpScope.DYNAMIC) return !0;
      if (this.strictDynamic) return !1;
      if (
        eA === tF.McpScope.INTERNAL ||
        eA === tF.McpScope.SDK ||
        eA === tF.McpScope.PLUGIN
      )
        return !0;
      let el: any = this.mcpToSettingsScopeMap[eA];
      return (
        !!el &&
        (await this.cliSettingSourcesProvider.getSettingScopes()).includes(el)
      );
    }
    async read(eA: any): Promise<any> {
      if (eA === tF.McpScope.INTERNAL) return this.readInternal();
      if (eA === tF.McpScope.SDK) return this.readSdk();
      if (eA === tF.McpScope.DYNAMIC) return this.readDynamic();
      if (eA === tF.McpScope.PLUGIN) return this.readMcpServersFromPlugins();
      if (!(await this.shouldLoadFromFilesystem(eA))) return {};
      let el: any = this.configStore.read(eA);
      return (
        el?.mcpServers ?? Ap.ObjectUtils.copy(tF.DefaultMcpConfig.mcpServers)
      );
    }
    writeServerConfigs(eA: any, el: any, ec: any = !1): any {
      if (
        el === tF.McpScope.DYNAMIC ||
        el === tF.McpScope.INTERNAL ||
        el === tF.McpScope.SDK
      )
        return;
      let eu: any = this.configStore.read(el) ?? tF.DefaultMcpConfig,
        ed: any = { ...eu, mcpServers: ec ? eA : { ...eu.mcpServers, ...eA } };
      this.configStore.update(el, ed);
    }
    setStrictDynamic(eA: any): any {
      this.strictDynamic = eA;
    }
    invalidateFilesystemScopeCaches(eA: any): any {
      let el: any = eA?.includeUser
        ? [tF.McpScope.USER, tF.McpScope.PROJECT, tF.McpScope.LOCAL]
        : [tF.McpScope.PROJECT, tF.McpScope.LOCAL];
      for (let eA of el)
        (this.scopeDataCache.delete(eA), this.inflightReads.delete(eA));
      for (let eA of el) this.changedSubject.next({ scope: eA });
    }
    invalidatePluginScopeCache(): any {
      (this.scopeDataCache.delete(tF.McpScope.PLUGIN),
        this.inflightReads.delete(tF.McpScope.PLUGIN),
        this.changedSubject.next({ scope: tF.McpScope.PLUGIN }));
    }
    async getByName(eA: any): Promise<any> {
      let el: any = [],
        ec: any = await this.list();
      for (let eu of tF.MERGE_SCOPE_PRIORITY) {
        let ed: any = ec[eu];
        if (!ed || !ed[eA]) continue;
        let ep: any = ed[eA];
        el.push({ scope: eu, config: ep });
      }
      return el;
    }
    async waitDynamicConfigInitialized(): Promise<any> {
      await this.dynamicConfigInitialized.promise;
    }
    expandScopeData(eA: any, el: any): any {
      let ec: any = {};
      for (let [eu, ed] of Object.entries(eA))
        ec[eu] = this.expandSingleConfig(eu, ed, el);
      return ec;
    }
    expandSingleConfig(eA: any, el: any, ec: any): any {
      try {
        let { config: eu, diagnostics: ed } =
          this.envExpandService.expandConfig(eA, el, ec);
        if (ed.length > 0)
          for (let el of (this.diagnosticsManager.addDiagnostics(ed), ed))
            this.mcpLogService.log(eA, el.message);
        return eu;
      } catch (eA: any) {
        return el;
      }
    }
  }
  // UTF-16 9237347..9240044
  class McpConfigStore {
    [key: string]: any;
    read(eA: any): any {
      if (
        eA === tF.McpScope.DYNAMIC ||
        eA === tF.McpScope.INTERNAL ||
        eA === tF.McpScope.SDK
      )
        return;
      let el: any = this.getLocation(eA);
      try {
        let ec: any = this.readConfigFile(el.filePath);
        switch (eA) {
          case tF.McpScope.USER:
          case tF.McpScope.PROJECT:
            return {
              mcpServers: ec.mcpServers,
              disabledMcpServers: ec.disabledMcpServers || [],
            };
          case tF.McpScope.LOCAL:
            if ("projects" in ec) {
              let eA: any = ec.projects?.[el.projectPath];
              if (eA)
                return {
                  mcpServers: eA.mcpServers,
                  disabledMcpServers: eA.disabledMcpServers || [],
                };
            }
            return Ap.ObjectUtils.copy(tF.DefaultMcpConfig);
          default:
            return Ap.ObjectUtils.copy(tF.DefaultMcpConfig);
        }
      } catch (eA: any) {
        if ("ENOENT" === eA.code)
          return Ap.ObjectUtils.copy(tF.DefaultMcpConfig);
        throw eA;
      }
    }
    update(eA: any, el: any): any {
      if (
        eA === tF.McpScope.DYNAMIC ||
        eA === tF.McpScope.INTERNAL ||
        eA === tF.McpScope.SDK
      )
        return;
      let ec: any = this.getLocation(eA),
        eu: any = (0, t7.dirname)(ec.filePath);
      (0, AT.existsSync)(eu) || (0, AT.mkdirSync)(eu, { recursive: !0 });
      let ed: any = this.readConfigFileRaw(ec.filePath);
      switch (eA) {
        case tF.McpScope.USER:
        case tF.McpScope.PROJECT:
          ((ed = t8.JsonUtils.modifyProperty(
            ed,
            ["mcpServers"],
            el.mcpServers,
          )),
            (ed = t8.JsonUtils.modifyProperty(
              ed,
              ["disabledMcpServers"],
              el.disabledMcpServers,
            )));
          break;
        case tF.McpScope.LOCAL: {
          let eA: any = ec.projectPath || t8.PathUtils.getWorkDir();
          ((ed = t8.JsonUtils.modifyProperty(
            ed,
            ["projects", eA, "mcpServers"],
            el.mcpServers,
          )),
            (ed = t8.JsonUtils.modifyProperty(
              ed,
              ["projects", eA, "disabledMcpServers"],
              el.disabledMcpServers,
            )));
          break;
        }
        default:
          throw Error(`Unsupported scope: ${eA}`);
      }
      return (
        t8.McpUtils.writeConfigFileAtomic(ec.filePath, ed, {
          encoding: "utf-8",
        }),
        el
      );
    }
    delete(eA: any): any {
      if (
        eA === tF.McpScope.DYNAMIC ||
        eA === tF.McpScope.INTERNAL ||
        eA === tF.McpScope.SDK
      )
        return;
      let el: any = this.getLocation(eA),
        ec: any = this.readConfigFileRaw(el.filePath);
      if (eA === tF.McpScope.LOCAL) {
        let eA: any = el.projectPath || t8.PathUtils.getWorkDir(),
          eu: any = this.readConfigFile(el.filePath);
        eu.projects?.[eA] &&
          ((ec = t8.JsonUtils.modifyProperty(
            ec,
            ["projects", eA, "mcpServers"],
            {},
          )),
          t8.McpUtils.writeConfigFileAtomic(el.filePath, ec, {
            encoding: "utf-8",
          }));
      } else
        ((ec = t8.JsonUtils.modifyProperty(ec, ["mcpServers"], {})),
          t8.McpUtils.writeConfigFileAtomic(el.filePath, ec, {
            encoding: "utf-8",
          }));
    }
    getLocation(eA: any): any {
      if (
        eA === tF.McpScope.DYNAMIC ||
        eA === tF.McpScope.INTERNAL ||
        eA === tF.McpScope.SDK
      )
        return { filePath: "" };
      let el: any = t8.PathUtils.resolveMcpFilePath(eA);
      return eA === tF.McpScope.LOCAL
        ? { filePath: el, projectPath: t8.PathUtils.getWorkDir() }
        : { filePath: el };
    }
    readConfigFileRaw(eA: any): any {
      try {
        return (0, AT.readFileSync)(eA, "utf-8").trim() || AR;
      } catch (eA: any) {
        if ("ENOENT" === eA.code) return AR;
        throw eA;
      }
    }
    readConfigFile(eA: any): any {
      try {
        let el: any = (0, AT.readFileSync)(eA, "utf-8").trim();
        if (!el) return Ap.ObjectUtils.copy(tF.DefaultMcpConfig);
        return t8.McpUtils.parseJsonc(el);
      } catch (eA: any) {
        if ("ENOENT" === eA.code)
          return Ap.ObjectUtils.copy(tF.DefaultMcpConfig);
        throw eA;
      }
    }
  }
  // UTF-16 9240751..9243796
  class McpConnectionManager {
    [key: string]: any;
    constructor() {
      this.inFlightConnects = new Map();
    }
    async connect(eA: any): Promise<any> {
      if (eA.status === tF.McpServerStatus.CONNECTED) return eA;
      let el: any = this.inFlightConnects.get(eA.name);
      if (el) {
        if (el.model === eA) return el.promise;
        this.logger.info(
          `[MCP] superseding stale in-flight connect for server=${eA.name}`,
        );
      }
      let ec: any = this.doConnect(eA),
        eu: any = { model: eA, promise: ec };
      this.inFlightConnects.set(eA.name, eu);
      try {
        return await ec;
      } finally {
        this.inFlightConnects.get(eA.name) === eu &&
          this.inFlightConnects.delete(eA.name);
      }
    }
    async waitForIdle(eA: any): Promise<any> {
      let el: any = this.inFlightConnects.get(eA);
      el && (await el.promise.catch(() => void 0));
    }
    async doConnect(eA: any): Promise<any> {
      let el: any = Date.now();
      this.logger.info(
        `[MCP][cacheDbg] doConnect START: server=${eA.name} type=${eA.config.type}`,
      );
      try {
        eA.status = tF.McpServerStatus.CONNECTING;
        let ec: any = await this.mcpServerManager.get(eA.name);
        if (!ec)
          throw (
            (eA.status = tF.McpServerStatus.DISCONNECTED),
            this.logger.warn(
              `[MCP][cacheDbg] doConnect: server "${eA.name}" NOT FOUND in serverManager -> DISCONNECTED`,
            ),
            Error(`MCP server "${eA.name}": Server not found`)
          );
        await ec.connect();
        let eu: any = Date.now() - el;
        return (
          this.mcpLogService.log(
            ec.name,
            `Successfully connected to ${eA.config.type.toLowerCase()} server in ${eu}ms`,
          ),
          (eA.status = tF.McpServerStatus.CONNECTED),
          this.logger.info(
            `[MCP][cacheDbg] doConnect OK: server=${eA.name} elapsed=${eu}ms`,
          ),
          eA
        );
      } catch (ec: any) {
        if (ec instanceof Error && "Unauthorized" === ec.message) {
          let el: any = "Failed to connect to server: Unauthorized";
          return (
            (eA.error = el),
            (eA.needsAuth = !0),
            (eA.status = tF.McpServerStatus.UNAUTHORIZED),
            this.mcpLogService.log(eA.name, el),
            eA
          );
        }
        let el: any = ec instanceof Error ? ec.message : String(ec);
        if (isTransportAlreadyStartedError(el))
          return (
            (eA.error = void 0),
            (eA.status = tF.McpServerStatus.CONNECTED),
            this.logger.info(
              `[MCP][cacheDbg] doConnect: server=${eA.name} transport already started, treating as CONNECTED`,
            ),
            eA
          );
        return (
          (eA.error = `Failed to connect to server: ${el}`),
          (eA.status = tF.McpServerStatus.DISCONNECTED),
          this.logger.warn(
            `[MCP][cacheDbg] doConnect FAIL: server=${eA.name} error=${el}`,
          ),
          this.mcpLogService.log(
            eA.name,
            `Failed to connect to ${eA.config.type.toLowerCase()} server: ${el}`,
          ),
          eA
        );
      }
    }
    async disconnect(eA: any): Promise<any> {
      if (eA.status === tF.McpServerStatus.DISCONNECTED) return eA;
      let el: any = await this.mcpServerManager.get(eA.name);
      if (!el)
        throw (
          (eA.status = tF.McpServerStatus.DISCONNECTED),
          Error(`MCP server "${eA.name}": Server not found`)
        );
      try {
        (this.mcpLogService.log(
          eA.name,
          `Attempting to disconnect from ${eA.config.type} server`,
        ),
          await el.close(),
          (eA.status = tF.McpServerStatus.DISCONNECTED),
          this.mcpLogService.log(
            eA.name,
            `Successfully disconnected from ${eA.config.type} server`,
          ));
      } catch (ec: any) {
        let el: any = ec instanceof Error ? ec.message : String(ec);
        this.mcpLogService.log(
          eA.name,
          `Failed to disconnect from ${eA.config.type} server: ${el}`,
        );
      }
      return eA;
    }
    async reconnect(eA: any): Promise<any> {
      try {
        return (
          this.mcpLogService.log(
            eA.name,
            `Attempting to reconnect to ${eA.config.type} server`,
          ),
          await this.disconnect(eA),
          await this.connect(eA)
        );
      } catch (ec: any) {
        let el: any = ec instanceof Error ? ec.message : String(ec);
        throw (
          this.mcpLogService.log(
            eA.name,
            `Failed to reconnect to ${eA.config.type} server: ${el}`,
          ),
          ec
        );
      }
    }
  }
  // UTF-16 9277575..9279382
  class McpPermissionsManager {
    [key: string]: any;
    async getMcpSettings(): Promise<any> {
      let [eA, el] = await Promise.all([
          this.settingsManager.list(AS.SettingsScope.PROJECT_LOCAL),
          this.settingsManager.list(AS.SettingsScope.CLI),
        ]),
        {
          enableAllProjectMcpServers: ec,
          enabledMcpjsonServers: eu = [],
          disabledMcpjsonServers: ed = [],
        } = { ...eA, ...el };
      return {
        enableAllProjectMcpServers: ec,
        enabledMcpjsonServers: eu,
        disabledMcpjsonServers: ed,
      };
    }
    async isAllowed(eA: any, el: any): Promise<any> {
      if (
        (void 0 !== el && el !== tF.McpScope.PROJECT) ||
        !(await this.mcpConfigManager
          .get(tF.McpScope.PROJECT, eA)
          .catch(() => void 0))
      )
        return !0;
      let {
        enableAllProjectMcpServers: ec,
        enabledMcpjsonServers: eu,
        disabledMcpjsonServers: ed,
      } = await this.getMcpSettings();
      return !ed.includes(eA) && (!!ec || eu.includes(eA));
    }
    async approve(eA: any): Promise<any> {
      if (0 === eA.length) return;
      let { enabledMcpjsonServers: el, disabledMcpjsonServers: ec } =
          await this.getMcpSettings(),
        eu: any = [...new Set([...el, ...eA])],
        ed: any = ec.filter((el: any) => !eA.includes(el));
      (await this.settingsManager.set(
        "enabledMcpjsonServers",
        eu,
        AS.SettingsScope.PROJECT_LOCAL,
      ),
        await this.settingsManager.set(
          "disabledMcpjsonServers",
          ed,
          AS.SettingsScope.PROJECT_LOCAL,
        ));
    }
    async deny(eA: any): Promise<any> {
      if (0 === eA.length) return;
      let { enabledMcpjsonServers: el, disabledMcpjsonServers: ec } =
          await this.getMcpSettings(),
        eu: any = el.filter((el: any) => !eA.includes(el)),
        ed: any = [...new Set([...ec, ...eA])];
      (await this.settingsManager.set(
        "enabledMcpjsonServers",
        eu,
        AS.SettingsScope.PROJECT_LOCAL,
      ),
        await this.settingsManager.set(
          "disabledMcpjsonServers",
          ed,
          AS.SettingsScope.PROJECT_LOCAL,
        ));
    }
    async approveAll(): Promise<any> {
      await this.settingsManager.set(
        "enableAllProjectMcpServers",
        !0,
        AS.SettingsScope.PROJECT_LOCAL,
      );
    }
    async getServersNeedingConfirmation(): Promise<any> {
      let {
        enableAllProjectMcpServers: eA,
        enabledMcpjsonServers: el,
        disabledMcpjsonServers: ec,
      } = await this.getMcpSettings();
      return eA
        ? []
        : Object.keys(
            await this.mcpConfigManager.list(tF.McpScope.PROJECT),
          ).filter((eA: any) => !el.includes(eA) && !ec.includes(eA));
    }
  }
  // UTF-16 9280501..9282018
  class McpToggleManager {
    [key: string]: any;
    constructor() {
      ((this.toggleSubject = new tH.Subject()),
        (this.inMemoryDisabled = new Set()));
    }
    async disable(eA: any): Promise<any> {
      for (let el of Array.isArray(eA) ? eA : [eA])
        this.updateDisabledState(el, !0);
    }
    async enable(eA: any): Promise<any> {
      for (let el of Array.isArray(eA) ? eA : [eA])
        this.updateDisabledState(el, !1);
    }
    isDisabled(eA: any): any {
      if (this.inMemoryDisabled.has(eA)) return !0;
      let el: any = this.mcpServerModelManager.get(eA);
      if (!el) return !1;
      if (el.scope === tF.McpScope.PROJECT) {
        let el: any = this.mcpConfigStore.read(tF.McpScope.PROJECT);
        return !!(el && el.disabledMcpServers?.includes(eA));
      }
      if (
        el.scope === tF.McpScope.USER ||
        el.scope === tF.McpScope.LOCAL ||
        el.scope === tF.McpScope.PLUGIN
      ) {
        let el: any = this.mcpConfigStore.read(tF.McpScope.LOCAL);
        return !!(el && el.disabledMcpServers?.includes(eA));
      }
      return !1;
    }
    updateDisabledState(eA: any, el: any): any {
      let ec: any = this.mcpServerModelManager.get(eA);
      ec &&
        (ec.scope === tF.McpScope.PROJECT
          ? this.updateScopeDisabledState(tF.McpScope.PROJECT, eA, el)
          : ec.scope === tF.McpScope.USER ||
              ec.scope === tF.McpScope.LOCAL ||
              ec.scope === tF.McpScope.PLUGIN
            ? this.updateScopeDisabledState(tF.McpScope.LOCAL, eA, el)
            : el
              ? this.inMemoryDisabled.add(eA)
              : this.inMemoryDisabled.delete(eA),
        this.toggleSubject.next({ serverName: eA, disabled: el }));
    }
    updateScopeDisabledState(eA: any, el: any, ec: any): any {
      let eu: any = this.readScopeData(eA),
        ed: any = eu.disabledMcpServers.indexOf(el),
        ep: any = -1 !== ed;
      ec && !ep
        ? (eu.disabledMcpServers.push(el), this.mcpConfigStore.update(eA, eu))
        : !ec &&
          ep &&
          (eu.disabledMcpServers.splice(ed, 1),
          this.mcpConfigStore.update(eA, eu));
    }
    readScopeData(eA: any): any {
      let el: any = this.mcpConfigStore.read(eA);
      return el || { mcpServers: {}, disabledMcpServers: [] };
    }
  }
  // UTF-16 9283117..9283188
  class McpLogService {
    [key: string]: any;
    log(eA: any, el: any): any {
      this.debugService.debug(`MCP server "${eA}": ${el}`);
    }
  }
  // UTF-16 9286093..9286776
  class McpServerModelImpl {
    [key: string]: any;
    get onDidChangeStatus(): any {
      return this._statusEmitter.event;
    }
    get status(): any {
      return this._status;
    }
    set status(eA: any) {
      this._status !== eA &&
        (tU.ContainerUtil.get(tU.Logger).info(
          `[MCP][cacheDbg] status setter: server=${this.name} ${this._status} -> ${eA}`,
        ),
        (this._status = eA),
        this._statusEmitter.fire(this._status));
    }
    constructor(eA: any, el: any, ec: any) {
      ((this.scope = eA),
        (this.name = el),
        (this.config = ec),
        (this._status = tF.McpServerStatus.PENDING),
        (this._statusEmitter = new tU.Emitter()),
        (this.needsAuth = !1));
    }
    generateState(): any {
      return (0, t5.randomBytes)(16).toString("base64url");
    }
    state(): any {
      return (this._state || (this._state = this.generateState()), this._state);
    }
    isActive(): any {
      return this.status === tF.McpServerStatus.CONNECTED;
    }
  }
  // UTF-16 9287338..9288224
  class McpServerModelManager {
    [key: string]: any;
    constructor() {
      ((this.changedSubject = new tH.Subject()),
        (this.cache = new Map()),
        (this.emitSeq = 0));
    }
    create(eA: any, el: any, ec: any): any {
      let eu: any = this.getCacheKey(el, eA);
      if (this.cache.has(eu)) return this.cache.get(eu);
      let ed: any = new McpServerModelImpl(eA, el, ec);
      return (
        this.cache.set(eu, ed),
        ed.onDidChangeStatus(() => {
          let eA: any = ++this.emitSeq;
          (this.logger.info(
            `[MCP][cacheDbg] changedSubject.next #${eA}: server=${ed.name} status=${ed.status}`,
          ),
            this.changedSubject.next(ed));
        }),
        ed
      );
    }
    get(eA: any, el: any): any {
      if (el) {
        let ec: any = this.getCacheKey(eA, el);
        return this.cache.get(ec);
      }
      return Array.from(this.cache.values())
        .filter((el: any) => el.name === eA)
        .sort(
          (eA: any, el: any) =>
            tF.MERGE_SCOPE_PRIORITY.indexOf(eA.scope) -
            tF.MERGE_SCOPE_PRIORITY.indexOf(el.scope),
        )
        .shift();
    }
    delete(eA: any, el: any): any {
      this.cache.delete(this.getCacheKey(el, eA));
    }
    deleteScope(eA: any): any {
      let el: any = `${eA}:`;
      for (let eA of this.cache.keys())
        eA.startsWith(el) && this.cache.delete(eA);
    }
    getCacheKey(eA: any, el: any): any {
      return `${el}:${eA}`;
    }
  }
  // UTF-16 9290013..9291502
  class McpReadyService {
    [key: string]: any;
    constructor() {
      ((this.deferred = new tU.Deferred()),
        (this.resolved = !1),
        (this.headlessMcpConfigEnsured = !1));
    }
    watchArgvAndCwdForMcpInit(): any {
      (0, A0.combineLatest)([
        this.cliRuntimeOptions.onDidChange,
        this.cwdService.onDidChangeCwd,
      ]).subscribe(() => {
        this.ensureHeadlessMcpConfigInitialized();
      });
    }
    async waitForServersReady(): Promise<any> {
      (this.ensureHeadlessMcpConfigInitialized(),
        this.logger.info(
          "[Startup] McpReadyService.waitForServersReady: config projection triggered; network connections continue asynchronously",
        ));
    }
    async waitFor(eA: any): Promise<any> {
      this.resolved ||
        (await tW.McpUtils.raceWithTimeout(
          this.deferred.promise,
          () => {
            this.logger.info(
              `[Startup] McpReadyService.waitFor: timeout after ${eA}ms, proceeding without waiting`,
            );
          },
          eA,
        ));
    }
    isHeadless(): any {
      let eA: any =
        process.argv.includes("--mcp-config") ||
        process.argv.includes("--strict-mcp-config");
      return (
        (!process.argv.includes("--prewarm") || !!eA) &&
        (process.argv.includes("--print") ||
          process.argv.includes("-p") ||
          process.argv.includes("--acp") ||
          process.argv.includes("--serve") ||
          process.argv.includes("-h") ||
          process.argv.includes("--help") ||
          !process.stdout.isTTY)
      );
    }
    ensureHeadlessMcpConfigInitialized(): any {
      !this.headlessMcpConfigEnsured &&
        this.isHeadless() &&
        ((this.headlessMcpConfigEnsured = !0),
        this.logger.info(
          "[Startup] McpReadyService: headless mode — initializing MCP config (DYNAMIC scope)",
        ),
        tU.ContainerUtil.get(tF.McpCliConfigInitializer).initialize());
    }
    resolve(): any {
      this.resolved ||
        ((this.resolved = !0),
        this.logger.info("[Startup] McpReadyService.resolve: marked resolved"),
        this.deferred.resolve());
    }
  }
  // UTF-16 9292999..9293699
  class McpCliConfigInitializer {
    [key: string]: any;
    constructor() {
      this.initialized = !1;
    }
    initialize(): any {
      if (this.initialized) return;
      this.initialized = !0;
      let eA: any = tU.ContainerUtil.get(tF.McpConfigManager);
      (process.argv.includes("--strict-mcp-config") && eA.setStrictDynamic(!0),
        this.initDynamicConfigFromArgs(eA),
        this.mcpManager.setNonInteractiveMode(!0));
    }
    initDynamicConfigFromArgs(eA: any): any {
      let el: any = process.argv,
        ec: any = el.findIndex((eA: any) => "--mcp-config" === eA);
      if (-1 !== ec && ec + 1 < el.length) {
        let eu: any = el[ec + 1];
        try {
          let el: any;
          try {
            el = AL.JsonUtils.parse(eu);
          } catch {
            let eA: any = (0, t7.resolve)(eu),
              ec: any = (0, AT.readFileSync)(eA, "utf-8");
            el = AL.JsonUtils.parse(ec);
          }
          let ec: any = el.mcpServers || el;
          if (ec && "object" == typeof ec)
            return void eA.set(tF.McpScope.DYNAMIC, ec);
        } catch {}
      }
      eA.set(tF.McpScope.DYNAMIC, {});
    }
  }
  // UTF-16 9294448..9295818
  class McpConfigEnvExpandService {
    [key: string]: any;
    expandConfig(eA: any, el: any, ec: any): any {
      let eu: any,
        ed: any = [],
        ep: any = [];
      switch (el.type) {
        case "stdio":
          eu = this.expandStdioConfig(el, ep);
          break;
        case "sse":
        case "http":
        case "remote":
          eu = this.expandUrlConfig(el, ep);
          break;
        default:
          eu = el;
      }
      if (ep.length > 0) {
        let el: any = [...new Set(ep)];
        ed.push({
          serverName: eA,
          scope: ec,
          severity: tF.McpConfigDiagnosticSeverity.WARNING,
          message: `Missing environment variables: ${el.join(", ")}`,
          category: "env-expansion",
          timestamp: new Date(),
          metadata: { missingVars: el },
        });
      }
      return { config: eu, diagnostics: ed };
    }
    expandStdioConfig(eA: any, el: any): any {
      let ec: any,
        eu: any,
        { expanded: ed, missingVars: ep } = (0, A8.expandEnvVariables)(
          eA.command,
        );
      el.push(...ep);
      let eg: any = eA.args?.map((eA: any) => {
        let { expanded: ec, missingVars: eu } = (0, A8.expandEnvVariables)(eA);
        return (el.push(...eu), ec);
      });
      if (eA.cwd) {
        let { expanded: eu, missingVars: ed } = (0, A8.expandEnvVariables)(
          eA.cwd,
        );
        ((ec = eu), el.push(...ed));
      }
      if (eA.env)
        for (let [ec, ed] of ((eu = {}), Object.entries(eA.env))) {
          let { expanded: eA, missingVars: ep } = (0, A8.expandEnvVariables)(
            ed,
          );
          (el.push(...ep), (eu[ec] = eA));
        }
      return {
        ...eA,
        command: ed,
        ...(void 0 !== eg && { args: eg }),
        ...(void 0 !== eu && { env: eu }),
        ...(void 0 !== ec && { cwd: ec }),
      };
    }
    expandUrlConfig(eA: any, el: any): any {
      let ec: any,
        { expanded: eu, missingVars: ed } = (0, A8.expandEnvVariables)(eA.url);
      if ((el.push(...ed), eA.headers))
        for (let [eu, ed] of ((ec = {}), Object.entries(eA.headers))) {
          let { expanded: eA, missingVars: ep } = (0, A8.expandEnvVariables)(
            ed,
          );
          (el.push(...ep), (ec[eu] = eA));
        }
      return { ...eA, url: eu, ...(void 0 !== ec && { headers: ec }) };
    }
  }
  // UTF-16 9296334..9297907
  class McpConfigDiagnosticsManager {
    [key: string]: any;
    constructor() {
      ((this.changedSubject = new tH.Subject()), (this.diagnostics = []));
    }
    addDiagnostic(eA: any): any {
      this.isDuplicate(eA) ||
        (this.diagnostics.push(eA), this.changedSubject.next(this.diagnostics));
    }
    addDiagnostics(eA: any): any {
      if (0 === eA.length) return;
      let el: any = !1;
      for (let ec of eA)
        this.isDuplicate(ec) || (this.diagnostics.push(ec), (el = !0));
      el && this.changedSubject.next(this.diagnostics);
    }
    getDiagnostics(): any {
      return [...this.diagnostics].sort(
        (eA: any, el: any) => el.timestamp.getTime() - eA.timestamp.getTime(),
      );
    }
    getDiagnosticsForServer(eA: any): any {
      return this.getDiagnostics().filter((el: any) => el.serverName === eA);
    }
    getDiagnosticsForServerScope(eA: any, el: any): any {
      return this.getDiagnostics().filter(
        (ec: any) => ec.serverName === eA && ec.scope === el,
      );
    }
    getDiagnosticCount(eA: any): any {
      return void 0 === eA
        ? this.diagnostics.length
        : this.diagnostics.filter((el: any) => el.severity === eA).length;
    }
    hasDiagnostics(eA: any): any {
      return void 0 === eA
        ? this.diagnostics.length > 0
        : this.diagnostics.some((el: any) => el.severity === eA);
    }
    clearDiagnostics(): any {
      0 !== this.diagnostics.length &&
        ((this.diagnostics = []), this.changedSubject.next(this.diagnostics));
    }
    clearServerDiagnostics(eA: any): any {
      let el: any = this.diagnostics.length;
      ((this.diagnostics = this.diagnostics.filter(
        (el: any) => el.serverName !== eA,
      )),
        this.diagnostics.length !== el &&
          this.changedSubject.next(this.diagnostics));
    }
    clearServerScopeDiagnostics(eA: any, el: any): any {
      let ec: any = this.diagnostics.length;
      ((this.diagnostics = this.diagnostics.filter(
        (ec: any) => ec.serverName !== eA || ec.scope !== el,
      )),
        this.diagnostics.length !== ec &&
          this.changedSubject.next(this.diagnostics));
    }
    isDuplicate(eA: any): any {
      return this.diagnostics.some(
        (el: any) =>
          el.serverName === eA.serverName &&
          el.scope === eA.scope &&
          el.category === eA.category &&
          el.message === eA.message,
      );
    }
  }
  // UTF-16 9301052..9301648
  class McpPluginRegistry {
    [key: string]: any;
    constructor() {
      this.serverToPlugin = new Map();
    }
    replace(eA: any): any {
      let el: any = new Map();
      for (let [ec, eu] of eA)
        ec &&
          eu?.pluginName &&
          el.set(ec, {
            pluginName: eu.pluginName,
            marketplaceName: eu.marketplaceName || "",
          });
      this.serverToPlugin = el;
    }
    register(eA: any, el: any): any {
      eA &&
        el?.pluginName &&
        this.serverToPlugin.set(eA, {
          pluginName: el.pluginName,
          marketplaceName: el.marketplaceName || "",
        });
    }
    registerMany(eA: any, el: any): any {
      for (let ec of eA) this.register(ec, el);
    }
    get(eA: any): any {
      return this.serverToPlugin.get(eA);
    }
    unregisterPlugin(eA: any, el: any): any {
      if (eA)
        for (let [ec, eu] of this.serverToPlugin)
          eu.pluginName === eA &&
            eu.marketplaceName === (el || "") &&
            this.serverToPlugin.delete(ec);
    }
  }
  ey = McpManager;
  McpManager.UNINITIALIZED_SERVERS = [];
  return {
    McpManager,
    McpConfigManager,
    McpConfigStore,
    McpConnectionManager,
    McpPermissionsManager,
    McpToggleManager,
    McpLogService,
    McpServerModelImpl,
    McpServerModelManager,
    McpReadyService,
    McpCliConfigInitializer,
    McpConfigEnvExpandService,
    McpConfigDiagnosticsManager,
    McpPluginRegistry,
    PathUtils,
    stableConfigValue,
    computeProjectedConfigFingerprint,
    isTransportAlreadyStartedError,
    expandEnvVariables,
  };
}
