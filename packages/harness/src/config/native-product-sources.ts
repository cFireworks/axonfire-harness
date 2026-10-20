// Fixed WorkBuddy 5.3.14 SHA; complete native source/model/policy services, TS-only annotations and explicit DI.
import * as fs from "node:fs";
import * as path from "node:path";
import { URI } from "vscode-uri";
import { createCapturedModelCatalog } from "../vendor/captured-model-catalog.js";
import { createNativeProductSourceUtilities } from "./native-product-source-utils.js";
import * as constants from "./native-product-constants.js";
export function createNativeProductSources(runtime: any) {
  const Object: any = globalThis.Object,
    process = {
      env: runtime.env ?? {},
      platform: runtime.platform ?? globalThis.process.platform,
      pid: runtime.pid ?? globalThis.process.pid,
      cwd: runtime.getWorkDir,
    },
    Date = { now: runtime.now ?? globalThis.Date.now },
    Math = runtime.Math ?? globalThis.Math,
    setTimeout = runtime.setTimeout ?? globalThis.setTimeout,
    clearTimeout = runtime.clearTimeout ?? globalThis.clearTimeout,
    setInterval = runtime.setInterval ?? globalThis.setInterval,
    clearInterval = runtime.clearInterval ?? globalThis.clearInterval,
    setImmediate = runtime.setImmediate ?? globalThis.setImmediate,
    queueMicrotask = runtime.queueMicrotask ?? globalThis.queueMicrotask;
  const catalog = runtime.modelCatalog ?? createCapturedModelCatalog(),
    types = {
      ...constants,
      ...catalog.types,
      ProductManager: "productManager",
      ProductFeature: {
        ...constants.ProductFeature,
        CustomModelIdPrefix: "CustomModelIdPrefix",
        EnableEnterpriseCustomModelPolicy: "EnableEnterpriseCustomModelPolicy",
      },
    },
    utilities = createNativeProductSourceUtilities(runtime),
    container = {
      get: (name: string) => {
        if (!(name in runtime.dependencies))
          throw Error("Product source dependency not configured: " + name);
        return runtime.dependencies[name];
      },
    };
  const providers = (() => {
    const e9 = types,
      tu = utilities,
      tQ = path,
      tS = (runtime.fs ?? fs).promises,
      tT = utilities,
      tD = { CUSTOM_COMMAND_TAG: "custom" },
      tw = { CLI_AGENT_TAG: "cli", CUSTOM_AGENT_TAG: "custom" },
      tK = "/console/enterprises/{enterpriseId}/config/models",
      t$ = "chat",
      e5 = { ContainerUtil: container };
    let ej: any;
    // UTF-16 9884646..9886370
    class CustomCommandsProductProvider {
      [key: string]: any;
      constructor() {
        this.priority = e9.ProductProviderPriority.WORKSPACE;
      }
      async provide(): Promise<any> {
        try {
          let eA: any = await this.loadCustomCommands();
          return { mergeStrategy: e9.MergeStrategy.SmartMerge, commands: eA };
        } catch (eA: any) {
          return (this.logger.debug("Failed to load custom commands", eA), {});
        }
      }
      async loadCustomCommands(): Promise<any> {
        let eA: any = [],
          el: any = (0, tQ.join)(process.cwd(), ".codebuddy", "commands");
        if (await this.pathExists(el)) {
          let ec: any = await this.scanCommandsDirectory(el, "project");
          eA.push(...ec);
        }
        let ec: any = (0, tQ.join)(tu.PathUtils.getHomeDir(), "commands");
        if (await this.pathExists(ec)) {
          let el: any = await this.scanCommandsDirectory(ec, "user");
          eA.push(...el);
        }
        return eA;
      }
      async pathExists(eA: any): Promise<any> {
        try {
          return (await (0, tS.access)(eA), !0);
        } catch {
          return !1;
        }
      }
      async scanCommandsDirectory(eA: any, el: any): Promise<any> {
        let ec: any = [];
        for (let eu of await tu.DirectoryScanUtils.getFilesByExtension(
          eA,
          ".md",
        ))
          try {
            let eA: any = await this.parseCommandFile(eu, el);
            eA && ec.push(eA);
          } catch (eA: any) {
            this.logger.debug(
              `Failed to parse command file ${eu.fullPath}`,
              eA,
            );
          }
        return ec;
      }
      async parseCommandFile(eA: any, el: any): Promise<any> {
        try {
          let ec: any = await (0, tS.readFile)(eA.fullPath, "utf-8"),
            eu: any = tu.MarkdownUtils.extractFrontMatterWithContent(ec),
            ed: any = eu.data,
            ep: any = eA.relativePath.split(tQ.sep),
            eg: any = ep.pop()?.replace(/\.md$/, "") || "",
            eh: any = ep.length > 0 ? `${ep.join(":")}:${eg}` : eg,
            ef: any = ed.description || eh;
          ef = `${ef} (${el})`;
          let em: any = tu.MarkdownUtils.parseListField(ed["allowed-tools"]),
            eE: any = ed.model?.trim();
          return {
            name: eh,
            description: ef,
            model: eE || "",
            tags: [tD.CUSTOM_COMMAND_TAG],
            prompt: (0, tT.substituteLoadTimeVariables)(
              eu.content.trim(),
              eA.fullPath,
            ),
            allowedTools: em,
            argumentHint: ed["argument-hint"]?.trim() || "",
            requiredVariables: [],
            scope: el,
            disableModelInvocation: ed["disable-model-invocation"],
          };
        } catch (el: any) {
          this.logger.debug(`Failed to parse command file ${eA.fullPath}`, el);
          return;
        }
      }
    }
    Object.defineProperty(CustomCommandsProductProvider, "name", {
      value: "tR",
    });
    // UTF-16 9887502..9889624
    class CustomAgentsProductProvider {
      [key: string]: any;
      constructor() {
        this.priority = e9.ProductProviderPriority.WORKSPACE;
      }
      async provide(): Promise<any> {
        try {
          let eA: any = await this.loadCustomAgents();
          return { mergeStrategy: e9.MergeStrategy.SmartMerge, agents: eA };
        } catch (eA: any) {
          return (this.logger.debug("Failed to load custom agents", eA), {});
        }
      }
      async loadCustomAgents(): Promise<any> {
        let eA: any = [],
          el: any = tu.PathUtils.getProjectAgentsDir();
        if (await this.pathExists(el)) {
          let ec: any = await this.scanAgentsDirectory(el, "project");
          eA.push(...ec);
        }
        let ec: any = tu.PathUtils.getHomeAgentsDir();
        if (await this.pathExists(ec)) {
          let el: any = await this.scanAgentsDirectory(ec, "user");
          eA.push(...el);
        }
        return eA;
      }
      async pathExists(eA: any): Promise<any> {
        try {
          return (await (0, tS.access)(eA), !0);
        } catch {
          return !1;
        }
      }
      async scanAgentsDirectory(eA: any, el: any): Promise<any> {
        let ec: any = [];
        for (let eu of await tu.DirectoryScanUtils.getFilesByExtension(
          eA,
          ".md",
        ))
          try {
            let eA: any = await this.parseAgentFile(eu, el);
            eA && ec.push(eA);
          } catch (eA: any) {
            this.logger.debug(`Failed to parse agent file ${eu.fullPath}`, eA);
          }
        return ec;
      }
      async parseAgentFile(eA: any, el: any): Promise<any> {
        try {
          let ec: any = await (0, tS.readFile)(eA.fullPath, "utf-8"),
            eu: any = tu.MarkdownUtils.extractFrontMatterFull(ec);
          eu.parseError &&
            this.logger.warn(
              `[CustomAgentsProductProvider] YAML parse error in ${eA.fullPath}: ${eu.parseError}`,
            );
          let ed: any = eu.data,
            ep: any = eA.relativePath,
            eg: any = eA.fileName.replace(/\.md$/, ""),
            eh: any = ed.name || eg,
            ef: any = this.generateSourceLabel(ep, el),
            em: any = ed.description || eh;
          em.includes(ef) || (em = `${em} ${ef}`);
          let eE: any = tu.MarkdownUtils.parseListField(ed.tools),
            eC: any = eE.length > 0 ? eE : void 0,
            ey: any = tu.MarkdownUtils.parseListField(ed.skills),
            ew: any = ed.model?.trim();
          return {
            name: eh,
            description: em,
            instructions: (0, tT.substituteLoadTimeVariables)(
              eu.content.trim(),
              eA.fullPath,
            ),
            ...(eC && { tools: eC }),
            models: ew ? [ew] : [],
            asTool: !0,
            color: ed.color || tu.ColorUtils.generateColorFromName(eh),
            tags: [tw.CLI_AGENT_TAG, tw.CUSTOM_AGENT_TAG, el],
            source: el,
            ...(ed.permissionMode && { permissionMode: ed.permissionMode }),
            ...(ey.length > 0 && { skills: ey }),
            ...(ed.isolation && { isolation: ed.isolation }),
            ...(ed.hooks && { hooks: ed.hooks }),
          };
        } catch (el: any) {
          this.logger.debug(`Failed to parse agent file ${eA.fullPath}`, el);
          return;
        }
      }
      generateSourceLabel(eA: any, el: any): any {
        let ec: any = eA.split(tQ.sep);
        if ((ec.pop(), 0 === ec.length)) return `(${el})`;
        let eu: any = ec.join(":");
        return `(${el}:${eu})`;
      }
    }
    Object.defineProperty(CustomAgentsProductProvider, "name", { value: "tk" });
    // UTF-16 9908398..9911296
    class ModelsProductProvider {
      [key: string]: any;
      constructor() {
        ((this.priority = e9.ProductProviderPriority.MODELS),
          (this.hasTriggeredSyncForEnterprise = !1),
          (this.cacheExpireAt = 0),
          (this.retryBackoffUntil = 0),
          (this.consecutiveFailures = 0));
      }
      init(): any {
        this.authenticationManager.currentSessionSubject.subscribe(
          (eA: any) => {
            let el: any = eA?.account?.enterpriseId;
            el &&
              !this.hasTriggeredSyncForEnterprise &&
              ((this.hasTriggeredSyncForEnterprise = !0),
              this.logger.info(
                `[ModelsProductProvider] enterpriseId became available: ${el}, triggering sync`,
              ),
              setImmediate(() => {
                e5.ContainerUtil.get(e9.ProductManager)?.sync(!0);
              }));
          },
        );
      }
      async provide(eA: any): Promise<any> {
        if (!eA.force && this.cachedResult && Date.now() < this.cacheExpireAt)
          return (
            this.logger.info(
              `[ModelsProductProvider] returning cached result (${this.cachedResult.models?.length ?? 0} models)`,
            ),
            this.cachedResult
          );
        if (!eA.force && Date.now() < this.retryBackoffUntil)
          return (
            this.logger.debug(
              "[ModelsProductProvider] in failure backoff window, reusing last result",
            ),
            this.getFallbackResult()
          );
        let el: any = this.authenticationManager.currentSessionSubject.value,
          ec: any = el?.account?.enterpriseId;
        if (
          (this.logger.info(
            `[ModelsProductProvider] enterpriseId: ${ec || "undefined"}, endpoint: ${eA.current?.endpoint}`,
          ),
          !ec)
        )
          return (
            this.logger.warn(
              "[ModelsProductProvider] enterpriseId is missing, skipping models API call",
            ),
            this.getFallbackResult()
          );
        let eu: any = tK.replace("{enterpriseId}", ec);
        if (eu)
          try {
            let el: any = new URL(eu, eA.current.endpoint);
            this.logger.debug(
              `[ModelsProductProvider] Calling API: ${el.href}`,
            );
            let ec: any = await this.restOperations.get(el.href, {
              baseURL: eA.current.endpoint,
              timeout: 5e3,
            });
            if (
              (this.logger.debug(
                `[ModelsProductProvider] API response status: ${ec?.status}`,
              ),
              !ec?.data?.data?.length)
            )
              return (
                this.logger.warn(
                  "[ModelsProductProvider] API returned empty or invalid data",
                ),
                this.applyFailureBackoff(),
                this.getFallbackResult()
              );
            {
              let el: any = ec.data.data;
              this.logger.info(
                `[ModelsProductProvider] Got ${el.length} models from API`,
              );
              let eu: any = this.processModelAgentRelations(eA.current, el);
              return (
                (this.cachedResult = eu),
                (this.cacheExpireAt =
                  Date.now() + e9.PRODUCT_CONFIGURATION_CACHE_TIMEOUT),
                (this.consecutiveFailures = 0),
                (this.retryBackoffUntil = 0),
                eu
              );
            }
          } catch (eA: any) {
            (this.logger.error(
              `[ModelsProductProvider] API call failed: ${eA}`,
            ),
              this.applyFailureBackoff());
          }
        return this.getFallbackResult();
      }
      getFallbackResult(): any {
        return this.cachedResult
          ? this.cachedResult
          : { mergeStrategy: e9.MergeStrategy.SmartMerge };
      }
      applyFailureBackoff(): any {
        this.consecutiveFailures += 1;
        let eA: any = Math.min(
          ej.MIN_FAILURE_BACKOFF_MS * 2 ** (this.consecutiveFailures - 1),
          ej.MAX_FAILURE_BACKOFF_MS,
        );
        ((this.retryBackoffUntil = Date.now() + eA),
          this.logger.warn(
            `[ModelsProductProvider] backing off model API for ${eA}ms after ${this.consecutiveFailures} consecutive failure(s)`,
          ));
      }
      processModelAgentRelations(eA: any, el: any = []): any {
        let ec: any = eA.agents || [];
        for (let eA of el)
          if ((eA.tags || []).includes(t$))
            for (let el of ec)
              (el.models || (el.models = []),
                el.models.includes(eA.id) || el.models?.unshift(eA.id));
        return {
          mergeStrategy: e9.MergeStrategy.SmartMerge,
          models: el,
          agents: ec,
        };
      }
    }
    Object.defineProperty(ModelsProductProvider, "name", { value: "ej" });
    ej = ModelsProductProvider;
    Object.assign(ModelsProductProvider, {
      MIN_FAILURE_BACKOFF_MS: 30000,
      MAX_FAILURE_BACKOFF_MS: 300000,
    });
    // UTF-16 9883035..9883686
    class CraftToCliAgentModelsSyncProvider {
      [key: string]: any;
      constructor() {
        this.priority = e9.ProductProviderPriority.AGENT_MODEL_RESOLVER + 100;
      }
      async provide(eA: any): Promise<any> {
        let el: any = eA.current.agents;
        if (!el?.length) return {};
        let ec: any = el.find((eA: any) => "craft" === eA.name),
          eu: any = el.find((eA: any) => "cli" === eA.name);
        if (!ec || !eu) return {};
        let ed: any = ec.models ?? [];
        if (0 === ed.length) return {};
        let ep: any = eu.models ?? [],
          eg: any = new Set(ep),
          eh: any = ed.filter((eA: any) => !eg.has(eA));
        return 0 === eh.length
          ? (this.logger.debug(
              "[CraftToCliSync] cli agent already has all craft models",
            ),
            {})
          : (this.logger.info(
              `[CraftToCliSync] syncing ${eh.length} models from craft to cli: ${eh.join(", ")}`,
            ),
            {
              agents: [{ name: "cli", models: [...ep, ...eh] }],
              mergeStrategy: e9.MergeStrategy.SmartMerge,
            });
      }
    }
    Object.defineProperty(CraftToCliAgentModelsSyncProvider, "name", {
      value: "tv",
    });
    const CustomModelsProductProvider = (() => {
      const ey = types,
        ep = { ContainerUtil: container },
        eg = {
          ...types,
          WORKSPACE_DATA_DIR_NAME: ".codebuddy",
          USER_DATA_DIR_NAME: ".codebuddy",
          EnvUtils: {
            resolveEnvVariables: (eA: any) => {
              if (!eA || "string" != typeof eA) return eA;
              let el = /\$\{([^}]+)\}/g;
              return eA.replace(el, (eA: any, el: any) => {
                let ec = "u" > typeof process ? process.env[el] : void 0;
                return void 0 !== ec ? ec : eA;
              });
            },
          },
        },
        eh = { URI },
        ef = runtime.fs ?? fs,
        em = { homedir: runtime.getUserHomeDir ?? runtime.getHomeDir },
        eE = path,
        eC = catalog; // UTF-16 15631247..15637656
      class CustomModelsProductProvider {
        [key: string]: any;
        constructor() {
          ((this.priority = ey.ProductProviderPriority.ENV + 1e3),
            (this.DEBOUNCE_DELAY = 1e3));
        }
        init(): any {
          this.setupFileWatchers();
        }
        setupFileWatchers(): any {
          var eA: any;
          if (
            (null == (eA = this.workspace) ? void 0 : eA.workspaceFolders) &&
            this.workspace.workspaceFolders.length > 0
          ) {
            let eA: any = this.workspace.workspaceFolders[0].uri,
              el: any = eh.URI.parse(
                `${eA.path}/${eg.WORKSPACE_DATA_DIR_NAME}/models.json`,
              );
            (0, ef.existsSync)(el.fsPath) &&
              this.watchFile(el.fsPath, "project");
          }
        }
        isWorkBuddyProduct(eA: any): any {
          return (eA || "").toLowerCase().includes("workbuddy");
        }
        getUserConfigPath(eA: any, el: any): any {
          var ec: any, eu: any;
          let ed: any =
            (null == (ec = process.env.WORKBUDDY_CONFIG_DIR)
              ? void 0
              : ec.trim()) ||
            (null == (eu = process.env.CODEBUDDY_CONFIG_DIR)
              ? void 0
              : eu.trim());
          if (ed) return (0, eE.join)(ed, "models.json");
          let ep: any =
            (null == el ? void 0 : el.trim()) ||
            (this.isWorkBuddyProduct(eA)
              ? ".workbuddy"
              : eg.USER_DATA_DIR_NAME);
          return (0, eE.join)((0, em.homedir)(), ep, "models.json");
        }
        watchFile(eA: any, el: any): any {
          if ("user" === el) {
            if (this.userConfigWatcher && this.userConfigWatcherPath === eA)
              return;
            this.userConfigWatcher && this.userConfigWatcher.close();
          } else {
            if (
              this.projectConfigWatcher &&
              this.projectConfigWatcherPath === eA
            )
              return;
            this.projectConfigWatcher && this.projectConfigWatcher.close();
          }
          try {
            let ec: any = (0, ef.watch)(eA, (el: any, ec: any) => {
              ec &&
                ec.endsWith("models.json") &&
                (this.logger.debug(`Models config file ${el}: ${eA}`),
                this.debounceSync());
            });
            (ec.on("error", (el: any) => {
              this.logger.error(`Watcher error for file ${eA}: ${el}`);
            }),
              "user" === el
                ? ((this.userConfigWatcher = ec),
                  (this.userConfigWatcherPath = eA))
                : ((this.projectConfigWatcher = ec),
                  (this.projectConfigWatcherPath = eA)),
              this.logger.debug(`Started watching file: ${eA}`));
          } catch (el: any) {
            this.logger.error(`Failed to watch file ${eA}:`, el);
          }
        }
        debounceSync(): any {
          (this.debounceTimer && clearTimeout(this.debounceTimer),
            (this.debounceTimer = setTimeout(() => {
              try {
                let eA: any = ep.ContainerUtil.get(ey.ProductManager);
                eA
                  ? (this.logger.debug(
                      "Syncing product configuration due to models.json changes",
                    ),
                    eA.sync().catch((eA: any) => {
                      this.logger.error(
                        "Failed to sync product configuration",
                        eA,
                      );
                    }))
                  : this.logger.warn("ProductManager not found, cannot sync");
              } catch (eA: any) {
                this.logger.error("Failed to trigger ProductManager sync:", eA);
              }
            }, this.DEBOUNCE_DELAY)));
        }
        dispose(): any {
          (this.debounceTimer && clearTimeout(this.debounceTimer),
            this.userConfigWatcher && this.userConfigWatcher.close(),
            (this.userConfigWatcherPath = void 0),
            this.projectConfigWatcher && this.projectConfigWatcher.close(),
            (this.projectConfigWatcherPath = void 0));
        }
        async provide(eA: any): Promise<any> {
          var el: any, ec: any, eu: any, ed: any;
          if (!this.fs) return {};
          if (
            !(null == (el = eA.current.productFeatures)
              ? void 0
              : el.CustomModelsJSON)
          )
            return (this.logger.info("disable use custom model"), {});
          let ep: any = this.getUserConfigPath(
            eA.current.productName,
            null == (ec = eA.current.config) ? void 0 : ec.customUserDataDir,
          );
          this.logger.info(
            `[CustomModelsProductProvider] productName=${eA.current.productName}, isWorkBuddy=${this.isWorkBuddyProduct(eA.current.productName)}, userConfigPath=${ep}`,
          );
          let ef: any = {};
          try {
            if (this.fs.existsSync(ep)) {
              (this.userConfigWatcher && this.userConfigWatcherPath === ep) ||
                this.watchFile(ep, "user");
              let eA: any = this.fs
                .readFileSync(ep, { encoding: "utf-8" })
                .toString()
                .trim();
              if (eA) {
                let el: any = JSON.parse(eA),
                  { models: ec, availableModels: eu } = this.extractConfig(el);
                ((ef = {
                  models: ec
                    .filter(
                      (eA: any) =>
                        !!eA.id ||
                        (this.logger.warn(
                          `[CustomModelsProductProvider] Skipping model without id in user config: ${JSON.stringify(eA)}`,
                        ),
                        !1),
                    )
                    .map((eA: any) => ({ disabled: !1, ...eA })),
                  availableModels: eu,
                }),
                  this.logger.info(
                    `Loaded custom models config from user: ${ep}`,
                  ));
              } else
                this.logger.info(
                  `Skipping empty custom models config at ${ep}`,
                );
            }
          } catch (eA: any) {
            this.logger.error(
              `Failed to load user-level custom models configuration from ${ep}`,
              eA,
            );
          }
          let em: any = {};
          if (
            (null == (eu = this.workspace) ? void 0 : eu.workspaceFolders) &&
            this.workspace.workspaceFolders.length > 0
          ) {
            let eA: any = this.workspace.workspaceFolders[0].uri,
              el: any = eh.URI.parse(
                `${eA.path}/${eg.WORKSPACE_DATA_DIR_NAME}/models.json`,
              );
            try {
              if (this.fs.existsSync(el.fsPath)) {
                (this.projectConfigWatcher &&
                  this.projectConfigWatcherPath === el.fsPath) ||
                  this.watchFile(el.fsPath, "project");
                let eA: any = this.fs
                  .readFileSync(el.fsPath, { encoding: "utf-8" })
                  .toString()
                  .trim();
                if (eA) {
                  let ec: any = JSON.parse(eA),
                    { models: eu, availableModels: ed } =
                      this.extractConfig(ec);
                  ((em = {
                    models: eu
                      .filter(
                        (eA: any) =>
                          !!eA.id ||
                          (this.logger.warn(
                            `[CustomModelsProductProvider] Skipping model without id in project config: ${JSON.stringify(eA)}`,
                          ),
                          !1),
                      )
                      .map((eA: any) => ({ disabled: !1, ...eA })),
                    availableModels: ed,
                    mergeStrategy: ey.MergeStrategy.SmartMerge,
                  }),
                    this.logger.info(
                      `Loaded custom models config from project: ${el.fsPath}`,
                    ));
                } else
                  this.logger.info(
                    `Skipping empty custom models config at ${el.fsPath}`,
                  );
              }
            } catch (eA: any) {
              this.logger.error(
                `Failed to load project-level custom models configuration from ${el.fsPath}`,
                eA,
              );
            }
          }
          let eE: any = {};
          (Object.keys(ef).length > 0 &&
            (eE = await this.productMerger.merge(eE, ef)),
            Object.keys(em).length > 0 &&
              (eE = await this.productMerger.merge(eE, em)));
          let ew: any = !!(null == (ed = eA.current.productFeatures)
            ? void 0
            : ed[ey.ProductFeature.CustomModelIdPrefix]);
          if (eE.models)
            for (let eA of eE.models) {
              let el: any = eA;
              if (
                ew &&
                "string" == typeof el.id &&
                !el.id.startsWith(ey.CUSTOM_LOCAL_MODEL_PREFIX)
              ) {
                let eA: any = el.id;
                ((el.id = `${ey.CUSTOM_LOCAL_MODEL_PREFIX}${el.id}`),
                  el.aliases || (el.aliases = []),
                  el.aliases.includes(eA) || el.aliases.push(eA));
              }
              (el.tags || (el.tags = []),
                el.tags.push(ey.MODEL_TAG_CUSTOM),
                el.url && (el[ey.OVERRIDE_MODE] = "replace"),
                this.resolveModelEnvVariables(el),
                (0, eC.enrichLanguageModelFromCatalog)(el));
            }
          if (ew && eE.availableModels) {
            let eA: any = eE.availableModels
              .filter((eA: any) => !eA.startsWith(ey.CUSTOM_LOCAL_MODEL_PREFIX))
              .map((eA: any) => `${ey.CUSTOM_LOCAL_MODEL_PREFIX}${eA}`);
            eE.availableModels = Array.from(
              new Set([...eE.availableModels, ...eA]),
            );
          }
          if (void 0 !== eE.availableModels) {
            let el: any = eA.current.availableModels;
            el &&
              el.length > 0 &&
              (eE.availableModels = Array.from(
                new Set([...el, ...eE.availableModels]),
              ));
          }
          return { ...eE, mergeStrategy: ey.MergeStrategy.SmartMerge };
        }
        extractConfig(eA: any): any {
          if (Array.isArray(eA)) return { models: eA, availableModels: void 0 };
          if (null !== eA && "object" == typeof eA) {
            let el: any = eA;
            return {
              models: Array.isArray(el.models) ? el.models : [],
              availableModels: Array.isArray(el.availableModels)
                ? el.availableModels.filter((eA: any) => "string" == typeof eA)
                : void 0,
            };
          }
          return { models: [], availableModels: void 0 };
        }
        resolveModelEnvVariables(eA: any): any {
          let el: any = eA;
          if (el.apiKey) {
            let ec: any = eg.EnvUtils.resolveEnvVariables(el.apiKey);
            ec !== el.apiKey &&
              (this.logger.debug(
                `Resolved apiKey environment variable for model ${eA.id}`,
              ),
              (el.apiKey = ec));
          }
          if (el.url) {
            let ec: any = eg.EnvUtils.resolveEnvVariables(el.url);
            ec !== el.url &&
              (this.logger.debug(
                `Resolved url environment variable for model ${eA.id}`,
              ),
              (el.url = ec));
          }
        }
      }
      Object.defineProperty(CustomModelsProductProvider, "name", {
        value: "ew",
      });
      return CustomModelsProductProvider;
    })();
    const AgentModelResolverProvider = (() => {
      const eg = types; // UTF-16 15242324..15243876
      class AgentModelResolverProvider {
        [key: string]: any;
        constructor() {
          this.priority = eg.ProductProviderPriority.AGENT_MODEL_RESOLVER;
        }
        async provide(eA: any): Promise<any> {
          let { models: el = [], agents: ec = [] } = eA.current;
          return (this.logger.info(
            `[AgentModelResolver] product config input: ${el.length} models, ${ec.length} agents`,
          ),
          this.logger.info(
            `[AgentModelResolver] model ids: ${el.map((eA: any) => eA.id).join(", ")}`,
          ),
          0 === ec.length || 0 === el.length)
            ? {}
            : {
                agents: ec.map((eA: any) => {
                  let ec: any = this.resolveAgentModels(eA, el);
                  return (
                    this.logger.info(
                      `[AgentModelResolver] agent "${eA.name}" original_models=${JSON.stringify(eA.models)} -> resolved_models=${JSON.stringify(ec.models)}`,
                    ),
                    ec
                  );
                }),
                mergeStrategy: eg.MergeStrategy.SmartMerge,
              };
        }
        resolveAgentModels(eA: any, el: any): any {
          var ec: any, eu: any, ed: any, ep: any, eh: any;
          let ef: any = [],
            em: any = new Set(),
            eE: any = [],
            eC: any = new Set();
          for (let eu of null != (ec = eA.models) ? ec : [])
            if (!(0, eg.isModelVariantType)(eu)) {
              let eA: any = this.findModel(el, eu);
              eA && eC.add(eA.id);
            }
          for (let ec of null != (eu = eA.models) ? eu : []) {
            if ((0, eg.isModelVariantType)(ec)) {
              eE.push(ec);
              continue;
            }
            let eA: any = this.findModel(el, ec);
            eA
              ? em.has(eA.id) || (ef.push(eA.id), em.add(eA.id))
              : em.has(ec) || (ef.push(ec), em.add(ec));
          }
          let ey: any =
              null !=
                (ep =
                  null == (ed = eA.models)
                    ? void 0
                    : ed.some((eA: any) => !(0, eg.isModelVariantType)(eA))) &&
              ep,
            ew: any = ey && 0 === eC.size;
          if (ey && !ew)
            for (let eA of el) {
              if (em.has(eA.id) || (eC.size > 0 && !eC.has(eA.id))) continue;
              let el: any = null != (eh = eA.tags) ? eh : [];
              (el.includes("custom") ||
                eA.id.startsWith("custom:") ||
                el.includes("chat")) &&
                (ef.push(eA.id), em.add(eA.id));
            }
          return {
            name: eA.name,
            description: eA.description,
            models: [...eE, ...ef],
          };
        }
        findModel(eA: any, el: any): any {
          var ec: any;
          return null != (ec = eA.find((eA: any) => eA.id === el))
            ? ec
            : eA.find((eA: any) => eA.name === el);
        }
      }
      return AgentModelResolverProvider;
    })();
    const AvailableModelsFilterProvider = (() => {
      const eg = types,
        eh = types; // UTF-16 15244778..15245391
      class AvailableModelsFilterProvider {
        [key: string]: any;
        constructor() {
          this.priority = eg.ProductProviderPriority.DEFAULT + 1e4;
        }
        async provide(eA: any): Promise<any> {
          var el: any;
          let ec: any = eA.current;
          if (
            !ec.models ||
            !ec.availableModels ||
            0 === ec.availableModels.length
          )
            return {};
          try {
            let eA: any = {
              models: ec.models.filter(
                (eA: any) =>
                  ec.availableModels.includes(eA.id) ||
                  ec.availableModels.includes(
                    (0, eh.stripCustomLocalModelPrefix)(eA.id),
                  ),
              ),
              mergeStrategy: eg.MergeStrategy.Merge,
            };
            return (
              this.logger.debug(
                `Filtered models from ${ec.models.length} to ${null == (el = eA.models) ? void 0 : el.length} based on availableModels`,
              ),
              eA
            );
          } catch (eA: any) {
            return (
              this.logger.debug(
                "Failed to filter models based on availableModels",
                eA,
              ),
              {}
            );
          }
        }
      }
      return AvailableModelsFilterProvider;
    })();
    const EnterpriseCustomModelPolicyFilterProvider = (() => {
      const eg = types,
        eh = catalog.policy; // UTF-16 15215137..15216830
      class EnterpriseCustomModelPolicyFilterProvider {
        [key: string]: any;
        constructor() {
          ((this.priority = eg.ProductProviderPriority.DEFAULT + 5e3),
            (this.listenerRegistered = !1));
        }
        async provide(eA: any): Promise<any> {
          let el: any = eA.current.productFeatures;
          if (
            !(null == el
              ? void 0
              : el[eg.ProductFeature.EnableEnterpriseCustomModelPolicy])
          )
            return {};
          this.ensureListenerRegistered();
          let ec: any = this.policyService.getCachedSnapshot();
          if (!ec)
            return (
              this.policyService.scheduleRefresh(),
              (this.lastAllowed = !0),
              {}
            );
          if (((this.lastAllowed = ec.allowed), ec.allowed)) return {};
          let eu: any = eA.current.models;
          if (!eu || 0 === eu.length) return {};
          let ed: any = new Set(),
            ep: any = eu.filter(
              (eA: any) => !this.isLocalCustomModel(eA) || (ed.add(eA.id), !1),
            );
          if (0 === ed.size) return {};
          let eh: any = { models: ep, mergeStrategy: eg.MergeStrategy.Merge };
          if (
            eA.current.availableModels &&
            eA.current.availableModels.length > 0
          ) {
            let el: any = eA.current.availableModels.filter(
              (eA: any) => !ed.has(eA),
            );
            el.length !== eA.current.availableModels.length &&
              (eh.availableModels = el);
          }
          return (
            this.reportFilterApplied(ed.size),
            this.logger.info(
              `[EnterpriseCustomModelPolicyFilterProvider] removed ${ed.size} local custom model(s) due to policy: ${Array.from(ed).join(", ")}`,
            ),
            eh
          );
        }
        isLocalCustomModel(eA: any): any {
          let el: any =
              Array.isArray(eA.tags) && eA.tags.includes(eg.MODEL_TAG_CUSTOM),
            ec: any =
              "string" == typeof eA.id &&
              eA.id.startsWith(eg.CUSTOM_LOCAL_MODEL_PREFIX);
          return el && ec;
        }
        ensureListenerRegistered(): any {
          this.listenerRegistered ||
            ((this.listenerRegistered = !0),
            this.policyService.onChanged((eA: any) => {
              void 0 !== this.lastAllowed &&
                this.lastAllowed !== eA.allowed &&
                this.productManager.sync(!0).catch((eA: any) => {
                  this.logger.warn(
                    "[EnterpriseCustomModelPolicyFilterProvider] productManager.sync(true) failed",
                    eA,
                  );
                });
            }));
        }
        reportFilterApplied(eA: any): any {
          this.logger.info(
            `[telemetry] ${eh.EnterpriseCustomModelPolicyEvents.FilterApplied} ` +
              JSON.stringify({ removedCount: eA }),
          );
        }
      }
      return EnterpriseCustomModelPolicyFilterProvider;
    })();
    return {
      CustomCommandsProductProvider,
      CustomAgentsProductProvider,
      ModelsProductProvider,
      CustomModelsProductProvider,
      AgentModelResolverProvider,
      AvailableModelsFilterProvider,
      EnterpriseCustomModelPolicyFilterProvider,
      CraftToCliAgentModelsSyncProvider,
    };
  })();
  const policies = (() => {
    const EnterpriseCustomModelPolicyServiceImpl = (() => {
      const ep = { ContainerUtil: container },
        ef = { ...types, ProductManager: "productManager" },
        em = catalog.policy; // UTF-16 15218023..15226745
      class EnterpriseCustomModelPolicyServiceImpl {
        [key: string]: any;
        constructor() {
          this.listeners = new Set();
        }
        init(): any {
          var eA: any, el: any, ec: any, eu: any;
          let ed: any = this.computeOwnerKey(
            null ==
              (eA = this.authenticationManager.currentSessionSubject.value)
              ? void 0
              : eA.account,
          );
          ((this.sessionSub =
            this.authenticationManager.currentSessionSubject.subscribe(
              (eA: any) => {
                var el: any, ec: any, eu: any;
                let ep: any = this.computeOwnerKey(
                  null == eA ? void 0 : eA.account,
                );
                ep !== ed &&
                  (this.logger.debug(
                    `[EnterpriseCustomModelPolicy] owner key changed: ${null != ed ? ed : "undefined"} -> ${null != ep ? ep : "undefined"}, clearing cache`,
                  ),
                  (this.cachedSnapshot = void 0),
                  (this.pendingFetch = void 0),
                  (this.pendingFetchOwnerKey = void 0),
                  (ed = ep),
                  (null == (el = null == eA ? void 0 : eA.account)
                    ? void 0
                    : el.enterpriseId) &&
                    (null ==
                    (eu =
                      null ==
                      (ec = this.productManager.getCurrentConfiguration())
                        ? void 0
                        : ec.productFeatures)
                      ? void 0
                      : eu[
                          ef.ProductFeature.EnableEnterpriseCustomModelPolicy
                        ]) &&
                    this.scheduleRefresh());
              },
            )),
            this.startBackgroundRefresh());
          let ep: any =
            null ==
            (el = this.authenticationManager.currentSessionSubject.value)
              ? void 0
              : el.account;
          (null == ep ? void 0 : ep.enterpriseId) &&
            (null ==
            (eu =
              null == (ec = this.productManager.getCurrentConfiguration())
                ? void 0
                : ec.productFeatures)
              ? void 0
              : eu[ef.ProductFeature.EnableEnterpriseCustomModelPolicy]) &&
            this.scheduleRefresh();
        }
        dispose(): any {
          var eA: any;
          (null == (eA = this.sessionSub) || eA.unsubscribe(),
            (this.sessionSub = void 0),
            this.stopBackgroundRefresh(),
            this.listeners.clear(),
            (this.cachedSnapshot = void 0),
            (this.pendingFetch = void 0),
            (this.pendingFetchOwnerKey = void 0));
        }
        startBackgroundRefresh(): any {
          if (void 0 !== this.refreshTimer) return;
          this.refreshTimer = setInterval(() => {
            this.refreshTick().catch((eA: any) => {
              this.logger.warn(
                "[EnterpriseCustomModelPolicy] background refresh failed",
                eA,
              );
            });
          }, em.POLICY_CACHE_TTL_MS);
          let eA: any = this.refreshTimer;
          "function" == typeof eA.unref && eA.unref();
        }
        stopBackgroundRefresh(): any {
          void 0 !== this.refreshTimer &&
            (clearInterval(this.refreshTimer), (this.refreshTimer = void 0));
        }
        async refreshTick(): Promise<any> {
          let eA: any = this.cachedSnapshot;
          !eA ||
            "fail-open" === eA.source ||
            eA.source.startsWith("bypass-") ||
            (await this.getPolicy({ forceRefresh: !0 }));
        }
        async getPolicy(eA: any): Promise<any> {
          var el: any;
          let ec: any =
            null == (el = this.productManager.getCurrentConfiguration())
              ? void 0
              : el.productFeatures;
          if (
            !(null == ec
              ? void 0
              : ec[ef.ProductFeature.EnableEnterpriseCustomModelPolicy])
          )
            return { allowed: !0, source: "bypass-feature-off" };
          let eu: any = this.authenticationManager.currentSessionSubject.value,
            ed: any = null == eu ? void 0 : eu.account;
          if (!ed) return { allowed: !0, source: "bypass-anonymous" };
          if (!ed.enterpriseId)
            return { allowed: !0, source: "bypass-personal" };
          let ep: any = this.computeOwnerKey(ed);
          if (
            !(null == eA ? void 0 : eA.forceRefresh) &&
            this.cachedSnapshot &&
            this.cachedSnapshot.ownerKey === ep &&
            void 0 !== this.cachedSnapshot.fetchedAt
          ) {
            let eA: any =
              "fail-open" === this.cachedSnapshot.source
                ? em.POLICY_FAIL_OPEN_CACHE_TTL_MS
                : em.POLICY_CACHE_TTL_MS;
            if (Date.now() - this.cachedSnapshot.fetchedAt < eA)
              return this.cachedSnapshot;
          }
          if (!this.pendingFetch || this.pendingFetchOwnerKey !== ep) {
            let eA: any = ep;
            ((this.pendingFetchOwnerKey = eA),
              (this.pendingFetch = this.refresh(eA).finally(() => {
                this.pendingFetchOwnerKey === eA &&
                  ((this.pendingFetch = void 0),
                  (this.pendingFetchOwnerKey = void 0));
              })));
          }
          return this.pendingFetch;
        }
        onChanged(eA: any): any {
          return (
            this.listeners.add(eA),
            () => {
              this.listeners.delete(eA);
            }
          );
        }
        getCachedSnapshot(): any {
          var eA: any, el: any;
          let ec: any =
            null == (eA = this.productManager.getCurrentConfiguration())
              ? void 0
              : eA.productFeatures;
          if (
            !(null == ec
              ? void 0
              : ec[ef.ProductFeature.EnableEnterpriseCustomModelPolicy])
          )
            return { allowed: !0, source: "bypass-feature-off" };
          let eu: any =
            null ==
            (el = this.authenticationManager.currentSessionSubject.value)
              ? void 0
              : el.account;
          if (!eu) return { allowed: !0, source: "bypass-anonymous" };
          if (!eu.enterpriseId)
            return { allowed: !0, source: "bypass-personal" };
          let ed: any = this.computeOwnerKey(eu);
          if (this.cachedSnapshot && this.cachedSnapshot.ownerKey === ed)
            return this.cachedSnapshot;
        }
        scheduleRefresh(): any {
          var eA: any;
          let el: any = this.computeOwnerKey(
            null ==
              (eA = this.authenticationManager.currentSessionSubject.value)
              ? void 0
              : eA.account,
          );
          (this.pendingFetch && this.pendingFetchOwnerKey === el) ||
            queueMicrotask(() => {
              var eA: any;
              let el: any = this.computeOwnerKey(
                null ==
                  (eA = this.authenticationManager.currentSessionSubject.value)
                  ? void 0
                  : eA.account,
              );
              (this.pendingFetch && this.pendingFetchOwnerKey === el) ||
                this.getPolicy({ forceRefresh: !0 }).catch((eA: any) => {
                  this.logger.debug(
                    `[EnterpriseCustomModelPolicy] scheduled refresh swallowed error: ${eA instanceof Error ? eA.message : String(eA)}`,
                  );
                });
            });
        }
        async assertOperationAllowed(eA: any): Promise<any> {
          var el: any;
          let ec: any = await this.getPolicy(eA);
          if (!ec.allowed) {
            let eA: any = null != (el = ec.reason) ? el : "INVALID_MODE";
            throw (
              this.logger.info(
                `[EnterpriseCustomModelPolicy] save blocked: reason=${eA} mode=${ec.policy_mode} source=${ec.source}`,
              ),
              new em.MemberCustomModelPolicyDeniedError(eA)
            );
          }
          return ec;
        }
        async refresh(eA: any): Promise<any> {
          var el: any, ec: any, eu: any;
          let ed: any,
            ep: any = null == (el = this.cachedSnapshot) ? void 0 : el.allowed,
            eg: any = Date.now(),
            eh: any = !1;
          try {
            let el: any = await this.fetchFromServer();
            ((eh =
              this.computeOwnerKey(
                null ==
                  (ec = this.authenticationManager.currentSessionSubject.value)
                  ? void 0
                  : ec.account,
              ) !== eA),
              (ed = {
                allowed: "INVALID_MODE" !== el.reason && el.allowed,
                policy_mode: el.policy_mode,
                reason: el.reason,
                source: "remote",
                ownerKey: eA,
                fetchedAt: Date.now(),
              }),
              this.reportCheck(ed, Date.now() - eg),
              "INVALID_MODE" === el.reason && this.reportInvalidMode(ed),
              eh || (this.cachedSnapshot = ed));
          } catch (el: any) {
            if (
              el instanceof em.EnterpriseCustomModelPolicyError &&
              401 === el.httpStatus
            )
              return (
                this.reportCheck(
                  { allowed: !0, source: "bypass-anonymous" },
                  Date.now() - eg,
                ),
                { allowed: !0, source: "bypass-anonymous" }
              );
            ((eh =
              this.computeOwnerKey(
                null ==
                  (eu = this.authenticationManager.currentSessionSubject.value)
                  ? void 0
                  : eu.account,
              ) !== eA),
              this.cachedSnapshot && this.cachedSnapshot.ownerKey === eA
                ? ((ed = {
                    ...this.cachedSnapshot,
                    source: "stale-cache",
                    fetchedAt: Date.now(),
                  }),
                  this.reportCheck(ed, Date.now() - eg))
                : ((ed = {
                    allowed: !0,
                    source: "fail-open",
                    ownerKey: eA,
                    fetchedAt: Date.now(),
                  }),
                  this.reportCheck(ed, Date.now() - eg),
                  this.reportFailOpen(el)),
              eh || (this.cachedSnapshot = ed));
          }
          return (
            eh ||
              (void 0 !== ep && ep !== ed.allowed
                ? (this.notifyListeners(ed), this.triggerProductSync())
                : void 0 === ep && this.notifyListeners(ed)),
            ed
          );
        }
        async fetchFromServer(): Promise<any> {
          var eA: any, el: any;
          let ec: any =
              null ==
              (eA = this.authenticationManager.currentSessionSubject.value)
                ? void 0
                : eA.account,
            eu: any = null == ec ? void 0 : ec.enterpriseId;
          if (!eu)
            throw new em.EnterpriseCustomModelPolicyError(
              "missing enterpriseId",
              401,
            );
          let ed: any = em.USER_CHECK_PATH.replace(
            "{enterpriseId}",
            encodeURIComponent(eu),
          );
          try {
            let eA: any = await this.restOperations.get(ed, {
              timeout: em.POLICY_FETCH_TIMEOUT_MS,
            });
            if (401 === eA.status)
              throw new em.EnterpriseCustomModelPolicyError(
                "unauthorized",
                401,
              );
            if (
              eA.status < 200 ||
              eA.status >= 300 ||
              void 0 === eA.data ||
              null === eA.data
            )
              throw new em.EnterpriseCustomModelPolicyError(
                `unexpected http status ${eA.status}`,
                eA.status,
              );
            return this.parseUserCheckBody(eA.data);
          } catch (eu: any) {
            if (eu instanceof em.EnterpriseCustomModelPolicyError) throw eu;
            let eA: any =
                null == (el = null == eu ? void 0 : eu.response)
                  ? void 0
                  : el.status,
              ec: any = eu instanceof Error ? eu.message : String(eu);
            throw new em.EnterpriseCustomModelPolicyError(ec, eA, eu);
          }
        }
        parseUserCheckBody(eA: any): any {
          if ("object" != typeof eA || null === eA)
            throw new em.EnterpriseCustomModelPolicyError(
              "invalid response schema: not an object",
            );
          let el: any = eA;
          if ("data" in el && void 0 !== el.data && null !== el.data) {
            if ("number" == typeof el.code && 0 !== el.code) {
              let eA: any =
                "string" == typeof el.msg ? el.msg : `code=${el.code}`;
              throw new em.EnterpriseCustomModelPolicyError(
                `backend rejected: ${eA}`,
              );
            }
            return this.assertUserCheckShape(el.data);
          }
          return this.assertUserCheckShape(eA);
        }
        assertUserCheckShape(eA: any): any {
          if ("object" != typeof eA || null === eA)
            throw new em.EnterpriseCustomModelPolicyError(
              "invalid response schema",
            );
          let el: any = eA;
          if ("boolean" != typeof el.allowed)
            throw new em.EnterpriseCustomModelPolicyError(
              "invalid response schema: missing allowed",
            );
          let ec: any =
            "string" == typeof el.policy_mode
              ? el.policy_mode
              : "string" == typeof el.mode
                ? el.mode
                : void 0;
          return { ...eA, policy_mode: ec };
        }
        computeOwnerKey(eA: any): any {
          if (eA)
            return eA.enterpriseId
              ? `enterprise:${eA.enterpriseId}:${eA.uid}`
              : `personal:${eA.uid}`;
        }
        notifyListeners(eA: any): any {
          for (let el of this.listeners)
            try {
              el(eA);
            } catch (eA: any) {
              this.logger.error(
                "[EnterpriseCustomModelPolicy] listener threw",
                eA,
              );
            }
        }
        triggerProductSync(): any {
          var eA: any;
          try {
            let el: any =
              null != (eA = this.productManager)
                ? eA
                : ep.ContainerUtil.get(ef.ProductManager);
            null == el ||
              el.sync(!0).catch((eA: any) => {
                this.logger.warn(
                  "[EnterpriseCustomModelPolicy] productManager.sync(true) failed",
                  eA,
                );
              });
          } catch (eA: any) {
            this.logger.warn(
              "[EnterpriseCustomModelPolicy] productManager.sync(true) threw",
              eA,
            );
          }
        }
        reportCheck(eA: any, el: any): any {
          this.logger.info(
            `[telemetry] ${em.EnterpriseCustomModelPolicyEvents.Check} ` +
              JSON.stringify({
                allowed: eA.allowed,
                policy_mode: eA.policy_mode,
                reason: eA.reason,
                source: eA.source,
                durationMs: el,
              }),
          );
        }
        reportFailOpen(eA: any): any {
          let el: any = eA instanceof Error ? eA.message : String(eA);
          this.logger.warn(
            `[telemetry] ${em.EnterpriseCustomModelPolicyEvents.FailOpen} ` +
              JSON.stringify({ error: el }),
          );
        }
        reportInvalidMode(eA: any): any {
          this.logger.warn(
            `[telemetry] ${em.EnterpriseCustomModelPolicyEvents.InvalidMode} ` +
              JSON.stringify({
                policy_mode: eA.policy_mode,
                reason: eA.reason,
              }),
          );
        }
      }
      return EnterpriseCustomModelPolicyServiceImpl;
    })();
    const CliEnterpriseCustomModelPolicyServiceImpl = (() => {
      const eg: any = { EnterpriseCustomModelPolicyServiceImpl },
        eh = catalog.policy,
        ef = catalog.policyDisk; // UTF-16 15205780..15209592
      class CliEnterpriseCustomModelPolicyServiceImpl extends eg.EnterpriseCustomModelPolicyServiceImpl {
        [key: string]: any;
        init(): any {
          var eA: any;
          (super.init(),
            (this.lastObservedOwnerKey = this.computeOwnerKey(
              null ==
                (eA = this.authenticationManager.currentSessionSubject.value)
                ? void 0
                : eA.account,
            )),
            (this.diskSessionSub =
              this.authenticationManager.currentSessionSubject.subscribe(
                (eA: any) => {
                  let el: any = this.computeOwnerKey(
                    null == eA ? void 0 : eA.account,
                  );
                  if (el === this.lastObservedOwnerKey) return;
                  let ec: any = this.lastObservedOwnerKey;
                  ((this.lastObservedOwnerKey = el),
                    ec && this.removeDiskEntry(ec));
                },
              )));
        }
        dispose(): any {
          var eA: any;
          (null == (eA = this.diskSessionSub) || eA.unsubscribe(),
            (this.diskSessionSub = void 0),
            super.dispose());
        }
        async getPolicy(eA: any): Promise<any> {
          let el: any = this.tryBypass();
          if (el) return el;
          let ec: any =
              this.authenticationManager.currentSessionSubject.value.account,
            eu: any = this.computeOwnerKey(ec);
          if (
            !(null == eA ? void 0 : eA.forceRefresh) &&
            this.cachedSnapshot &&
            this.cachedSnapshot.ownerKey === eu &&
            void 0 !== this.cachedSnapshot.fetchedAt &&
            Date.now() - this.cachedSnapshot.fetchedAt < eh.POLICY_CACHE_TTL_MS
          )
            return this.cachedSnapshot;
          if (!(null == eA ? void 0 : eA.forceRefresh)) {
            let eA: any = this.tryDiskHit(eu);
            if (eA)
              return (
                (this.cachedSnapshot = eA),
                this.scheduleBackgroundRefresh(eu),
                eA
              );
          }
          if (!this.pendingFetch || this.pendingFetchOwnerKey !== eu) {
            let eA: any = eu;
            ((this.pendingFetchOwnerKey = eA),
              (this.pendingFetch = this.refresh(eA).finally(() => {
                this.pendingFetchOwnerKey === eA &&
                  ((this.pendingFetch = void 0),
                  (this.pendingFetchOwnerKey = void 0));
              })));
          }
          return this.pendingFetch;
        }
        scheduleBackgroundRefresh(eA: any): any {
          (this.pendingFetch && this.pendingFetchOwnerKey === eA) ||
            ((this.pendingFetchOwnerKey = eA),
            (this.pendingFetch = this.refresh(eA).finally(() => {
              this.pendingFetchOwnerKey === eA &&
                ((this.pendingFetch = void 0),
                (this.pendingFetchOwnerKey = void 0));
            })),
            this.pendingFetch.catch((eA: any) => {
              this.logger.debug(
                `[EnterpriseCustomModelPolicy] background refresh swallowed error: ${eA instanceof Error ? eA.message : String(eA)}`,
              );
            }));
        }
        getCachedSnapshot(): any {
          var eA: any;
          let el: any = super.getCachedSnapshot();
          if (el) return el;
          let ec: any =
            null ==
            (eA = this.authenticationManager.currentSessionSubject.value)
              ? void 0
              : eA.account;
          if (!(null == ec ? void 0 : ec.enterpriseId)) return;
          let eu: any = this.computeOwnerKey(ec),
            ed: any = this.tryDiskHit(eu);
          if (ed)
            return ((this.cachedSnapshot = ed), this.scheduleRefresh(), ed);
        }
        async refresh(eA: any): Promise<any> {
          let el: any = await super.refresh(eA);
          return (
            "remote" === el.source &&
              void 0 !== el.fetchedAt &&
              el.ownerKey === eA &&
              this.writeDisk(eA, el).catch(() => {}),
            el
          );
        }
        async fetchFromServer(): Promise<any> {
          return super.fetchFromServer();
        }
        tryBypass(): any {
          var eA: any, el: any;
          let ec: any =
            null == (eA = this.productManager.getCurrentConfiguration())
              ? void 0
              : eA.productFeatures;
          if (!(null == ec ? void 0 : ec.EnableEnterpriseCustomModelPolicy))
            return { allowed: !0, source: "bypass-feature-off" };
          let eu: any =
            null ==
            (el = this.authenticationManager.currentSessionSubject.value)
              ? void 0
              : el.account;
          return eu
            ? eu.enterpriseId
              ? void 0
              : { allowed: !0, source: "bypass-personal" }
            : { allowed: !0, source: "bypass-anonymous" };
        }
        tryDiskHit(eA: any): any {
          let el: any = this.diskCache.load();
          if (!el) return;
          let ec: any = el.entries[eA];
          if (ec)
            return {
              ...ec.snapshot,
              source: "stale-cache",
              ownerKey: eA,
              fetchedAt: ec.fetchedAt,
            };
        }
        async writeDisk(eA: any, el: any): Promise<any> {
          var ec: any;
          try {
            let eu: any =
                null != (ec = this.diskCache.load())
                  ? ec
                  : { version: ef.POLICY_DISK_CACHE_VERSION, entries: {} },
              ed: any = {
                version: ef.POLICY_DISK_CACHE_VERSION,
                entries: {
                  ...eu.entries,
                  [eA]: { snapshot: el, fetchedAt: el.fetchedAt },
                },
              };
            await this.diskCache.save(ed);
          } catch (el: any) {
            let eA: any = el instanceof Error ? el.message : String(el);
            this.logger.warn(
              `[EnterpriseCustomModelPolicy] disk cache write failed: ${eA}`,
            );
          }
        }
        removeDiskEntry(eA: any): any {
          try {
            let el: any = this.diskCache.load();
            if (!el || !el.entries[eA]) return;
            let ec: any = { ...el.entries };
            delete ec[eA];
            let eu: any = {
              version: ef.POLICY_DISK_CACHE_VERSION,
              entries: ec,
            };
            this.diskCache.save(eu).catch((eA: any) => {
              this.logger.warn(
                `[EnterpriseCustomModelPolicy] disk cache cleanup save failed: ${eA instanceof Error ? eA.message : String(eA)}`,
              );
            });
          } catch (eA: any) {
            this.logger.warn(
              `[EnterpriseCustomModelPolicy] disk cache cleanup load failed: ${eA instanceof Error ? eA.message : String(eA)}`,
            );
          }
        }
      }
      return CliEnterpriseCustomModelPolicyServiceImpl;
    })();
    const PolicyDiskCacheImpl = (() => {
      const ef = path,
        eg = runtime.fs ?? fs,
        eh = { homedir: runtime.getUserHomeDir ?? runtime.getHomeDir },
        ep = { USER_DATA_DIR_NAME: ".codebuddy" },
        em = catalog.policyDisk; // UTF-16 15211363..15212558
      class PolicyDiskCacheImpl {
        [key: string]: any;
        getPath(): any {
          return (0, ef.join)(
            this.resolveHomeDir(),
            em.POLICY_DISK_CACHE_FILENAME,
          );
        }
        load(): any {
          let eA: any = this.getPath();
          if ((0, eg.existsSync)(eA))
            try {
              let el: any = (0, eg.readFileSync)(eA, "utf-8"),
                ec: any = JSON.parse(el);
              if (!this.isValidFile(ec)) return;
              return ec;
            } catch (eA: any) {
              return;
            }
        }
        async save(eA: any): Promise<any> {
          let el: any = this.getPath(),
            ec: any = (0, ef.dirname)(el);
          (0, eg.existsSync)(ec) || (0, eg.mkdirSync)(ec, { recursive: !0 });
          let eu: any = `${el}.tmp-${process.pid}-${Math.random().toString(36).slice(2, 10)}`;
          try {
            ((0, eg.writeFileSync)(eu, JSON.stringify(eA), "utf-8"),
              (0, eg.renameSync)(eu, el));
          } catch (eA: any) {
            try {
              (0, eg.existsSync)(eu) && (0, eg.unlinkSync)(eu);
            } catch (eA: any) {}
            throw eA;
          }
        }
        resolveHomeDir(): any {
          let eA: any = process.env.CODEBUDDY_CONFIG_DIR;
          return eA && "" !== eA.trim()
            ? eA
            : (0, ef.join)((0, eh.homedir)(), ep.USER_DATA_DIR_NAME);
        }
        isValidFile(eA: any): any {
          if (!eA || "object" != typeof eA) return !1;
          let el: any = eA;
          if (
            el.version !== em.POLICY_DISK_CACHE_VERSION ||
            !el.entries ||
            "object" != typeof el.entries
          )
            return !1;
          let ec: any = el.entries;
          for (let eA of Object.keys(ec))
            if (!this.isValidEntry(ec[eA])) return !1;
          return !0;
        }
        isValidEntry(eA: any): any {
          if (!eA || "object" != typeof eA) return !1;
          let el: any = eA;
          return (
            "number" == typeof el.fetchedAt &&
            !!el.snapshot &&
            "object" == typeof el.snapshot &&
            "boolean" == typeof el.snapshot.allowed
          );
        }
      }
      return PolicyDiskCacheImpl;
    })();
    const ec = 60000,
      eu = 10485760; // UTF-16 15212826..15214360
    class CloudEnterprisePolicyService {
      [key: string]: any;
      constructor(eA: any) {
        ((this.skillCache = null),
          (this.modelCache = null),
          (this.http = eA.context.http));
      }
      async getSkillUploadPolicy(): Promise<any> {
        return this.skillCache && this.skillCache.expiresAt > Date.now()
          ? this.skillCache.snapshot
          : this.refreshSkillUploadPolicy();
      }
      async refreshSkillUploadPolicy(): Promise<any> {
        var eA: any, el: any, ed: any, ep: any, eg: any, eh: any;
        let ef: any;
        try {
          let ec: any = await this.http.get("/console/as/iom/getMemberPolicy"),
            em: any =
              null !=
              (el =
                null == (eA = null == ec ? void 0 : ec.data)
                  ? void 0
                  : eA.skill_upload)
                ? el
                : {};
          ef = {
            allowed: null == (ed = em.allowed) || ed,
            mode: null != (ep = em.mode) ? ep : "all",
            max_size_bytes: null != (eg = em.max_size_bytes) ? eg : eu,
            require_review: null != (eh = em.require_review) && eh,
            reason: em.reason,
            source: "remote",
            fetchedAt: Date.now(),
          };
        } catch (eA: any) {
          ef = {
            allowed: !0,
            mode: "all",
            max_size_bytes: eu,
            require_review: !1,
            source: "fail-open",
            fetchedAt: Date.now(),
          };
        }
        return (
          (this.skillCache = { snapshot: ef, expiresAt: Date.now() + ec }),
          ef
        );
      }
      async getMemberCustomModelPolicy(): Promise<any> {
        return this.modelCache && this.modelCache.expiresAt > Date.now()
          ? this.modelCache.snapshot
          : this.refreshMemberCustomModelPolicy();
      }
      async refreshMemberCustomModelPolicy(): Promise<any> {
        var eA: any, el: any, eu: any, ed: any;
        let ep: any;
        try {
          let ec: any = await this.http.get("/console/as/iom/getMemberPolicy"),
            eg: any =
              null !=
              (el =
                null == (eA = null == ec ? void 0 : ec.data)
                  ? void 0
                  : eA.member_custom_model)
                ? el
                : {};
          ep = {
            allowed: null == (eu = eg.allowed) || eu,
            policy_mode: null != (ed = eg.policy_mode) ? ed : "all",
            reason: eg.reason,
            source: "remote",
            fetchedAt: Date.now(),
          };
        } catch (eA: any) {
          ep = {
            allowed: !0,
            policy_mode: "all",
            source: "fail-open",
            fetchedAt: Date.now(),
          };
        }
        return (
          (this.modelCache = { snapshot: ep, expiresAt: Date.now() + ec }),
          ep
        );
      }
    }
    return {
      EnterpriseCustomModelPolicyServiceImpl,
      CliEnterpriseCustomModelPolicyServiceImpl,
      PolicyDiskCacheImpl,
      CloudEnterprisePolicyService,
    };
  })();
  return { ...providers, ...policies, utilities, catalog, types };
}
