// Fixed WorkBuddy 5.3.14 complete native refresh/command/style classes. DI and TS annotations only.
import * as path from "node:path";
import * as fs from "node:fs/promises";
import { SettingsScope } from "../permissions/native-permission-policy.js";
import { CommandMessageUtils } from "../commands/command-message-utils.js";
import { ToolNames } from "../tools/tool-names.js";
import { createCapturedPluginConstants } from "../vendor/captured-plugin-constants.js";
export function createNativePluginRuntime(runtime: any) {
  const Object: any = globalThis.Object,
    c: any = createCapturedPluginConstants(),
    eN = { SettingsScope },
    AB = { CommandMessageUtils },
    rp = { ToolNames };
  // UTF-16 9832171..9832559
  class PluginMcpToolChangeBlockedError extends Error {
    [key: string]: any;
    constructor(eA: any, el: any) {
      const ec: any = [...eA, ...el],
        eu: any = 1 === ec.length ? ec[0] : `${ec.length} MCP servers`;
      (super(
        `This reload changes MCP tools (${eu}) — your next message will re-read the whole conversation instead of using the cache. Run /reload-plugins --force to apply.`,
      ),
        (this.added = eA),
        (this.removed = el),
        (this.name = "PluginMcpToolChangeBlockedError"));
    }
  }
  // UTF-16 9832560..9832680
  function pluginMcpServerConfigs(eA: any): any {
    let el: any = {};
    for (let { components: ec } of eA) Object.assign(el, ec.mcpServers ?? {});
    return el;
  }
  // UTF-16 9832687..9835683
  class PluginRuntimeRefreshService {
    [key: string]: any;
    constructor() {
      this.refreshTail = Promise.resolve();
    }
    async waitForRefreshSettled(): Promise<any> {
      await this.refreshTail;
    }
    refresh(eA: any, el: any = {}): any {
      let ec: any = this.refreshTail.then(async () => {
        if (
          (this.logger.info(`[PluginRuntime] refresh started (${eA})`),
          el.prepareDesiredState && (await el.prepareDesiredState()),
          "reload-command" === eA)
        )
          (this.skillProductProvider?.clearCache(),
            this.pluginManager.clearCache());
        else if (!1 !== el.reloadDesiredState) {
          let el: any = "startup" === eA || "prewarm-activate" === eA,
            ec: any = "builtin-seed" === eA;
          (await Promise.all([
            this.cliSettingsProvider.waitUntilSettled(),
            this.cliSettingSourcesProvider.waitUntilSettled(),
          ]),
            this.settingsManager.clearCache(),
            await this.pluginManager.whenReady(),
            this.skillProductProvider?.clearCache(),
            this.pluginManager.clearCache(),
            el ||
              ec ||
              (await this.pluginManager.installMarketplacesFromSettings(),
              await this.pluginManager.reconcileBuiltinSeedInstalledPlugins(),
              await this.pluginManager.repairEnabledPlugins(),
              await this.pluginManager.repairEnabledPlugins({
                enabledPluginScopes: [eN.SettingsScope.CLI],
                persistEnabledPlugins: !1,
              })));
        }
        let ec: any = Object.freeze([]),
          eu: any = Object.freeze([]),
          validateBeforeCommit: any = async (eu: any) => {
            if (
              ((ec = eu.errors),
              "reload-command" !== eA || !0 !== el.blockMcpToolChanges)
            )
              return;
            let ed: any = pluginMcpServerConfigs(eu.previousActivePlugins),
              ep: any = pluginMcpServerConfigs(eu.activePlugins),
              eg: any = new Set(
                this.mcpManager?.getProjectedPluginServerNames?.() ??
                  Object.keys(ed),
              ),
              eh: any = new Set(
                this.mcpManager?.previewEffectivePluginServerNames
                  ? await this.mcpManager.previewEffectivePluginServerNames(ep)
                  : Object.keys(ep),
              ),
              ef: any = [...eh].filter((eA: any) => !eg.has(eA)).sort(),
              em: any = [...eg].filter((eA: any) => !eh.has(eA)).sort();
            if (ef.length > 0 || em.length > 0)
              throw new PluginMcpToolChangeBlockedError(ef, em);
          },
          ed: any = await this.pluginManager.refreshActivePlugins({
            beforeCommit: validateBeforeCommit,
          });
        if ("reload-command" === eA) {
          let eA: any =
            await this.pluginManager.repairMissingPluginDependencies();
          ((eu = eA.installed),
            eA.installed.length > 0 &&
              (this.skillProductProvider?.clearCache(),
              (ed = await this.pluginManager.refreshActivePlugins({
                beforeCommit: (eA: any) => {
                  ec = eA.errors;
                },
              }))));
        }
        await this.mcpManager?.reloadPluginServers?.();
        let ep: any = this.lspManager?.reloadPluginServers?.();
        return (
          "reload-command" === eA || "builtin-seed" === eA
            ? ep?.catch((eA: any) => {
                this.logger.warn(
                  `[PluginRuntime] background LSP reload failed: ${eA instanceof Error ? eA.message : String(eA)}`,
                );
              })
            : await ep,
          this.toolManager?.invalidatePluginDependentToolCaches(),
          "reload-command" === eA || "builtin-seed" === eA
            ? await this.productManager.syncVolatileProviders(!0)
            : await this.productManager.sync(!0),
          await this.commandManager?.refresh(),
          await this.outputStyleManager?.reload?.(),
          this.agentManager?.refreshAgents
            ? await this.agentManager.refreshAgents()
            : await this.agentManager?.waitForRebuildSettled(0),
          this.logger.info(
            `[PluginRuntime] refresh completed (${eA}), active=${ed.length}`,
          ),
          Object.freeze({
            activePlugins: ed,
            errors: ec,
            repairedDependencies: eu,
          })
        );
      });
      return (
        (this.refreshTail = ec.then(
          () => void 0,
          (el: any) => {
            this.logger.warn(
              `[PluginRuntime] refresh failed (${eA}): ${el instanceof Error ? el.message : String(el)}`,
            );
          },
        )),
        ec
      );
    }
  }
  const rG = { PluginMcpToolChangeBlockedError };
  // UTF-16 7626670..7628827
  class ReloadPluginsCommandExecutor {
    [key: string]: any;
    constructor() {
      ((this.name = "/reload-plugins"),
        (this.message = "Reloading plugins..."),
        (this.autoGenerateHistory = !1));
    }
    init(): any {
      this.logger.setContext("ReloadPluginsCommandExecutor");
    }
    async execute(eA: any): Promise<any> {
      if (
        (this.sessionManager.addHistory(eA.session, [
          AB.CommandMessageUtils.buildCaveat(),
          AB.CommandMessageUtils.buildInput(eA, this),
        ]),
        !this.pluginManager || !this.pluginRuntimeRefreshService)
      )
        return void (await this.sessionManager.addHistory(eA.session, [
          AB.CommandMessageUtils.buildOutput("Plugin system is not available."),
        ]));
      try {
        let el: any = eA.args
            .map((eA: any) => String(eA).trim())
            .some((eA: any) => "--force" === eA || "force" === eA),
          ec: any =
            eA.session.agentName ||
            eA.session.meta?.agentName ||
            this.agentManager?.getDefaultAgentName(),
          eu: any = ec
            ? await this.agentManager?.get(ec)
            : await this.agentManager?.getDefault(),
          ed: any =
            eu?.tools?.some(
              (eA: any) => eA.name === rp.ToolNames.TOOL_SEARCH,
            ) === !0,
          ep: any = (eA.session.usage?.outputTokens ?? 0) > 0,
          { activePlugins: eg, errors: eh } =
            await this.pluginRuntimeRefreshService.refresh("reload-command", {
              blockMcpToolChanges: !el && !ed && ep,
            }),
          ef: any = await this.pluginManager.getInstalledPlugins(),
          em: any = eg.length,
          eE: any = ef.filter((eA: any) => "disabled" === eA.status).length,
          eC: any = 0,
          ey: any = 0,
          ew: any = 0,
          eB: any = 0,
          e_: any = 0,
          eI: any = 0,
          ev: any = eh.length;
        for (let { components: eA } of eg)
          try {
            ((eC += eA.commands?.length || 0),
              (ey += eA.agents?.length || 0),
              (eI += eA.skills?.length || 0),
              (eB += Object.keys(eA.mcpServers || {}).length),
              (e_ += Object.keys(eA.lspServers || {}).length),
              (ew += Object.values(eA.hooks || {}).reduce(
                (eA: any, el: any) => eA + (Array.isArray(el) ? el.length : 0),
                0,
              )));
          } catch {
            ev++;
          }
        let eS: any = [
          "Plugins reloaded successfully:",
          `  Enabled: ${em}`,
          `  Disabled: ${eE}`,
          `  Commands: ${eC}`,
          `  Agents: ${ey}`,
          `  Skills: ${eI}`,
          `  Hooks: ${ew}`,
          `  MCP servers: ${eB}`,
          `  LSP servers: ${e_}`,
          ...(ev > 0 ? [`  Errors: ${ev}`] : []),
        ];
        await this.sessionManager.addHistory(eA.session, [
          AB.CommandMessageUtils.buildOutput(eS.join("\n")),
        ]);
      } catch (el: any) {
        if (el instanceof rG.PluginMcpToolChangeBlockedError)
          return void (await this.sessionManager.addHistory(eA.session, [
            AB.CommandMessageUtils.buildOutput(el.message),
          ]));
        (this.logger.error("Failed to reload plugins", el),
          await this.sessionManager.addHistory(eA.session, [
            AB.CommandMessageUtils.buildOutput(
              `Failed to reload plugins: ${el instanceof Error ? el.message : String(el)}`,
            ),
          ]));
      }
    }
  }
  const eC = path,
    eE = runtime.fs ?? fs,
    eh = c,
    ey = c.brand,
    e_ = { PathUtils: { getWorkDir: runtime.getWorkDir } };
  // UTF-16 9420919..9423931
  class OutputStyleManagerImpl {
    [key: string]: any;
    constructor() {
      ((this.initialized = !1), (this.cachedAllOutputStyles = []));
    }
    initialize(): any {
      this.init();
    }
    async init(): Promise<any> {
      this.initialized ||
        ((this.cachedAllOutputStyles = await this.loadAllOutputStyles()),
        (this.initialized = !0),
        this.logger.info(
          `Initialized ${this.cachedAllOutputStyles.length} output styles`,
        ));
    }
    async reload(): Promise<any> {
      ((this.initialized = !1),
        (this.cachedAllOutputStyles = []),
        await this.init());
    }
    parseOutputStyleContent(eA: any, el: any): any {
      let ec: any,
        eu: any = "",
        ed: any = "",
        ep: any = eA,
        eg: any = eA.match(/^---\n([\s\S]*?)\n---/);
      if (eg) {
        let el: any = eg[1],
          eh: any = el.match(/^name:\s*(.+)$/m),
          ef: any = el.match(/^description:\s*(.+)$/m),
          em: any = el.match(/^keep-coding-instructions:\s*(.+)$/m);
        (eh && (eu = eh[1].trim()),
          ef && (ed = ef[1].trim()),
          em && (ec = "true" === em[1].trim().toLowerCase()),
          (ep = eA.replace(/^---\n[\s\S]*?\n---\n?/, "").trim()));
      }
      return (
        eu ||
          (eu = (0, eC.parse)(el)
            .name.replace(/[-_]/g, " ")
            .replace(/\b\w/g, (eA: any) => eA.toUpperCase())),
        { name: eu, description: ed, content: ep, keepCodingInstructions: ec }
      );
    }
    async getAllOutputStyles(): Promise<any> {
      return (
        this.initialized || (await this.init()),
        this.cachedAllOutputStyles
      );
    }
    async getOutputStyleByName(eA: any): Promise<any> {
      return (await this.getAllOutputStyles()).find(
        (el: any) => el.name.toLowerCase() === eA.toLowerCase(),
      );
    }
    async loadBuiltInOutputStyles(): Promise<any> {
      let eA: any = [];
      try {
        for (let el of (await this.productManager.waitConfiguration())
          .outputStyles || []) {
          let ec: any = "";
          if (el.instructions)
            try {
              ec = await this.promptRenderer.render(el.instructions);
            } catch (eA: any) {
              (this.logger.error(
                `Failed to render output style template "${el.instructions}":`,
                eA,
              ),
                (ec = ""));
            }
          eA.push({
            name: el.name,
            description: el.description,
            content: ec,
            keepCodingInstructions: el.keepCodingInstructions,
          });
        }
      } catch (el: any) {
        (this.logger.error("Failed to load built-in output styles:", el),
          eA.push({
            name: "Default",
            description: `${ey.PRODUCT_CLI_NAME} completes coding tasks efficiently and provides concise responses`,
            content: "",
          }));
      }
      return eA;
    }
    async loadAllOutputStyles(): Promise<any> {
      let eA: any = [],
        el: any = e_.PathUtils.getWorkDir(),
        ec: any = (0, eC.parse)(el).root;
      for (; el !== ec; ) {
        let ec: any = [],
          eu: any = (0, eC.join)(el, ".codebuddy", eh.OUTPUT_STYLE_DIRNAME);
        try {
          for (let eA of (await (0, eE.access)(eu),
          (await (0, eE.readdir)(eu)).filter((eA: any) =>
            eA.endsWith(".md"),
          ))) {
            let el: any = (0, eC.join)(eu, eA);
            try {
              let eA: any = await (0, eE.readFile)(el, "utf-8"),
                eu: any = this.parseOutputStyleContent(eA, el);
              ec.push(eu);
            } catch (eA: any) {
              this.logger.error(`Failed to read output style file ${el}:`, eA);
            }
          }
        } catch (eA: any) {
          "ENOENT" !== eA.code &&
            "EACCES" !== eA.code &&
            this.logger.error(
              `Failed to access output style directory ${eu}:`,
              eA,
            );
        }
        ec.length > 0 && eA.push(ec);
        let ed: any = (0, eC.dirname)(el);
        if (ed === el) break;
        el = ed;
      }
      let eu: any = eA.reverse().flat(),
        ed: any = [
          ...(await this.loadBuiltInOutputStyles()),
          ...eu,
          ...(await this.loadPluginOutputStyles()),
        ],
        ep: any = new Set(),
        eg: any = [];
      for (let eA of ed) ep.has(eA.name) || (ep.add(eA.name), eg.push(eA));
      return eg;
    }
    async getProjectOutputStyles(): Promise<any> {
      return this.getAllOutputStyles();
    }
    async loadPluginOutputStyles(): Promise<any> {
      if (!this.pluginManager) return [];
      try {
        let eA: any = await this.pluginManager.getActivePlugins(),
          el: any = [];
        for (let { components: ec } of eA)
          try {
            ec?.outputStyles && el.push(...ec.outputStyles);
          } catch {}
        return el;
      } catch (eA: any) {
        return (
          this.logger.debug("Failed to load plugin output styles", eA),
          []
        );
      }
    }
  }
  return {
    PluginRuntimeRefreshService,
    PluginMcpToolChangeBlockedError,
    ReloadPluginsCommandExecutor,
    OutputStyleManagerImpl,
    pluginMcpServerConfigs,
  };
}
