// Fixed sample complete seven extension loaders and PluginLoaderManager.
import * as fs from "node:fs";
import * as path from "node:path";
import { createCapturedPluginConstants } from "../vendor/captured-plugin-constants.js";
import { createNativeProductSourceUtilities } from "../config/native-product-source-utils.js";
import {
  deriveSkillVisibility,
  deriveSkillNameFromPath,
} from "../commands/skill-product-provider.js";
export function createNativePluginLoaders(runtime?: any) {
  const Object: any = globalThis.Object,
    Promise: any = globalThis.Promise,
    process = {
      env: runtime.env ?? {},
      platform: runtime.platform ?? globalThis.process.platform,
    },
    t$: any = createCapturedPluginConstants(),
    tX = path,
    A$ = (runtime.fs ?? fs).promises,
    A5 = createNativeProductSourceUtilities(runtime),
    A8 = A5,
    t5 = { ...A5, ...runtime.utilities },
    A4 = runtime.shellHelpers,
    tV = {
      ContainerUtil: {
        get: (key?: any) => {
          if (!(key in runtime.dependencies))
            throw Error(
              "Plugin loader dependency not configured: " + String(key),
            );
          return runtime.dependencies[key];
        },
      },
    },
    AS = { ProductManager: "productManager" },
    AY = { CLI_AGENT_TAG: "cli", CUSTOM_AGENT_TAG: "custom" },
    AJ = { PLUGIN_TAG: "plugin", CUSTOM_COMMAND_TAG: "custom" },
    ra = { deriveSkillVisibility },
    rl = { deriveSkillNameFromPath },
    ec: any = runtime.require,
    A6 = "agents",
    A7 = "commands",
    rc = "skills",
    rp = "hooks/hooks.json",
    rf = ".mcp.json",
    rm = "mcp",
    rC = ".lsp.json",
    rw = "output-styles";
  const { A2, A3 } = runtime.frontmatter;
  const rg = "CODEBUDDY_DISABLE_EXTENDED_PLUGIN_HOOKS";
  let eR: any;
  // UTF-16 9599151..9599259
  function areExtendedPluginHooksDisabled(): any {
    let eA: any = process.env[rg]?.toLowerCase();
    return "1" === eA || "true" === eA;
  }
  // UTF-16 9581916..9582615
  function parseFrontmatterHooks(eA?: any, el?: any, ec?: any): any {
    if (!eA || "object" != typeof eA || Array.isArray(eA)) return;
    let eu: any = {},
      ed: any = 0;
    for (let [ep, eg] of Object.entries(eA)) {
      if (!A3.has(ep)) {
        ec.warn?.(
          `[parseFrontmatterHooks] ${el}: unknown event '${ep}', skipping`,
        );
        continue;
      }
      if (!Array.isArray(eg)) {
        ec.warn?.(
          `[parseFrontmatterHooks] ${el}: event '${ep}' value is not an array, skipping`,
        );
        continue;
      }
      let eA: any = [];
      for (let [eu, ed] of eg.entries()) {
        let eg: any = A2.safeParse(ed);
        if (!eg.success) {
          ec.warn?.(
            `[parseFrontmatterHooks] ${el}: event '${ep}'[${eu}] invalid: ${eg.error.message}`,
          );
          continue;
        }
        eA.push({
          ...(void 0 !== eg.data.matcher && { matcher: eg.data.matcher }),
          hooks: eg.data.hooks,
        });
      }
      eA.length > 0 && ((eu[ep] = eA), (ed += eA.length));
    }
    if (0 !== ed) return eu;
  }
  // UTF-16 9617689..9621098
  class PluginLoaderManager {
    [key: string]: any;
    init(): any {
      this.logger.setContext("PluginLoaderManager");
    }
    normalizePathConfig(eA?: any): any {
      if ("string" == typeof eA) return [eA];
      if (!Array.isArray(eA)) return;
      let el: any = eA.filter((eA?: any) => "string" == typeof eA);
      return el.length > 0 ? el : void 0;
    }
    async loadPluginComponents(eA?: any, el?: any): Promise<any> {
      try {
        let eu: any = `${eA.name}@${eA.marketplaceName}`,
          ed: any = eA.marketplaceName,
          ep: any = eA.name,
          eg: any = {},
          eh: any =
            Object.keys(eA.userConfig || {}).length > 0 ||
            void 0 !== eA.hooks ||
            void 0 !== eA.mcpServers ||
            (eA.mcpBundles?.length || 0) > 0 ||
            void 0 !== eA.lspServers;
        if (this.pluginOptionsStorage && eh)
          try {
            eg = await this.pluginOptionsStorage.loadOptions(eu);
          } catch (eA: any) {
            this.logger.warn(
              `Failed to load user_config for plugin ${eu}:`,
              eA,
            );
          }
        let ef: any = (0, A5.createPluginEnvironmentContext)(
          eu,
          el,
          eg,
          eA.userConfig,
        );
        this.logger.info(`Loading plugin components for ${eu} from ${el}`);
        let em: any = [];
        (em.push(
          this.agentLoader
            .load(el, eu, this.normalizePathConfig(eA.agents), ef)
            .catch(
              (eA?: any) => (
                this.logger.warn(
                  `Failed to load agents from plugin ${eu}:`,
                  eA,
                ),
                []
              ),
            ),
        ),
          em.push(
            this.commandLoader
              .load(el, eu, this.normalizePathConfig(eA.commands), ef)
              .catch(
                (eA?: any) => (
                  this.logger.warn(
                    `Failed to load commands from plugin ${eu}:`,
                    eA,
                  ),
                  []
                ),
              ),
          ),
          em.push(
            this.skillLoader
              .load(el, eu, this.normalizePathConfig(eA.skills), ef)
              .catch(
                (eA?: any) => (
                  this.logger.warn(
                    `Failed to load skills from plugin ${eu}:`,
                    eA,
                  ),
                  []
                ),
              ),
          ),
          em.push(
            this.hookLoader
              .load(el, eu, eA.hooks, ef)
              .catch(
                (eA?: any) => (
                  this.logger.warn(
                    `Failed to load hooks from plugin ${eu}:`,
                    eA,
                  ),
                  {}
                ),
              ),
          ),
          em.push(
            this.mcpLoader
              .load(el, eu, eA.mcpServers, eA.mcpBundles, ef)
              .catch(
                (eA?: any) => (
                  this.logger.warn(
                    `Failed to load MCP servers from plugin ${eu}:`,
                    eA,
                  ),
                  {}
                ),
              ),
          ),
          em.push(
            this.lspLoader
              .load(el, eu, eA.lspServers, ef)
              .catch(
                (eA?: any) => (
                  this.logger.warn(
                    `Failed to load LSP servers from plugin ${eu}:`,
                    eA,
                  ),
                  {}
                ),
              ),
          ),
          em.push(
            this.outputStyleLoader
              .load(el, eu, this.normalizePathConfig(eA.outputStyles))
              .catch(
                (eA?: any) => (
                  this.logger.warn(
                    `Failed to load output styles from plugin ${eu}:`,
                    eA,
                  ),
                  []
                ),
              ),
          ));
        let eE: any = await Promise.all(em),
          eC: any = eE[0],
          ey: any = eE[1],
          ew: any = eE[2],
          eB: any = eE[3],
          e_: any = eE[4],
          eI: any = eE[5],
          ev: any = eE[6],
          eS: any = Object.values(eB || {}).reduce(
            (eA?: any, el?: any) => eA + (Array.isArray(el) ? el.length : 0),
            0,
          );
        this.logger.info(
          `Loaded plugin components for ${eu}: ${(eC || []).length} agent(s), ${(ey || []).length} command(s), ${(ew || []).length} skill(s), ${eS} hook(s), ${Object.keys(e_ || {}).length} MCP server(s), ${Object.keys(eI || {}).length} LSP server(s), ${(ev || []).length} output style(s)`,
        );
        let eQ: any = eA.settings;
        try {
          let { access: eA, readFile: eu } = await Promise.resolve().then(
              ec.t.bind(ec, 91943, 23),
            ),
            { join: ed } = await Promise.resolve().then(
              ec.t.bind(ec, 16928, 23),
            ),
            ep: any = ed(el, "settings.json");
          await eA(ep);
          let eg: any = JSON.parse(await eu(ep, "utf-8")),
            eh: any = {
              ...(eg.agent ? { agent: eg.agent } : {}),
              ...(void 0 !== eg.subagentStatusLine
                ? { subagentStatusLine: eg.subagentStatusLine }
                : {}),
            };
          Object.keys(eh).length > 0 && (eQ = { ...eQ, ...eh });
        } catch {}
        return {
          marketplaceName: ed,
          pluginName: ep,
          agents: eC && eC.length > 0 ? eC : void 0,
          commands: ey && ey.length > 0 ? ey : void 0,
          skills: ew && ew.length > 0 ? ew : void 0,
          hooks: eS > 0 ? eB : void 0,
          mcpServers: e_ && Object.keys(e_).length > 0 ? e_ : void 0,
          lspServers: eI && Object.keys(eI).length > 0 ? eI : void 0,
          outputStyles: ev && ev.length > 0 ? ev : void 0,
          settings: eQ,
        };
      } catch (ec: any) {
        throw (
          this.logger.error(
            `Failed to load plugin components for ${eA.name}: ${ec}`,
          ),
          this.errorCollector.addError({
            type: t$.PluginErrorType.LoadFailed,
            componentType: "PluginComponents",
            pluginName: eA.name,
            marketplaceName: eA.marketplaceName,
            path: el,
            message: `Failed to load components for plugin '${eA.name}'`,
            details: ec instanceof Error ? ec.message : String(ec),
          }),
          ec
        );
      }
    }
  }
  // UTF-16 9583201..9587093
  class AgentExtensionLoader {
    [key: string]: any;
    constructor() {
      this.type = t$.PluginExtensionType.Agent;
    }
    init(): any {
      this.logger.setContext("AgentExtensionLoader");
    }
    async load(eA?: any, el?: any, ec?: any, eu?: any): Promise<any> {
      let ed: any = [],
        ep: any = new Set(),
        eg: any = eu || (0, A5.createPluginEnvironmentContext)(el, eA);
      try {
        if (ec && ec.length > 0)
          try {
            let eu: any = await this.loadFromPaths(eA, el, ec, ep, eg);
            ed.push(...eu);
          } catch (eA: any) {
            this.logger.error(
              `Failed to load agents from extension: ${el}`,
              eA,
            );
          }
        let eu: any = (0, tX.join)(eA, A6);
        if ((await this.pathExists(eu)) && !ep.has(eu)) {
          let ec: any = await this.scanAgentsDirectory(eu, el, ep, eA, eg);
          ed.push(...ec);
        } else
          (ec && 0 !== ec.length) ||
            this.logger.debug(`Agents directory not found: ${eu}`);
        ed.length > 0 &&
          this.logger.info(
            `Loaded ${ed.length} agent(s) from extension: ${el}`,
          );
      } catch (eA: any) {
        (this.logger.error(`Failed to load agents from extension: ${el}`, eA),
          this.errorCollector.addError({
            type: t$.PluginErrorType.LoadFailed,
            componentType: "Agent",
            pluginName: el,
            message: `Failed to load agents from extension '${el}'`,
            details: eA instanceof Error ? eA.message : String(eA),
          }));
      }
      return ed;
    }
    async loadFromPaths(
      eA?: any,
      el?: any,
      ec?: any,
      eu?: any,
      ed?: any,
    ): Promise<any> {
      let ep: any = [];
      for (let eg of ec) {
        let ec: any = (0, tX.join)(eA, eg);
        if (!(await this.pathExists(ec))) {
          this.logger.warn(`Agent path not found: ${ec}`);
          continue;
        }
        if (eu.has(ec)) {
          this.logger.debug(`Agent path already loaded, skipping: ${ec}`);
          continue;
        }
        let eh: any = await (0, A$.stat)(ec);
        if (eh.isFile() && ec.endsWith(".md")) {
          let eg: any = await this.parseAgentFile(ec, eA, el, void 0, ed);
          eg && (ep.push(eg), eu.add(ec));
        } else if (eh.isDirectory()) {
          eu.add(ec);
          let eg: any = await this.scanAgentsDirectory(ec, el, eu, eA, ed);
          ep.push(...eg);
        } else
          this.logger.warn(
            `Invalid agent path (not a directory or .md file): ${ec}`,
          );
      }
      return ep;
    }
    async pathExists(eA?: any): Promise<any> {
      try {
        return (await (0, A$.access)(eA), !0);
      } catch {
        return !1;
      }
    }
    async scanAgentsDirectory(
      eA?: any,
      el?: any,
      ec?: any,
      eu?: any,
      ed?: any,
    ): Promise<any> {
      let ep: any = [];
      for (let eg of await t5.DirectoryScanUtils.getFilesByExtension(
        eA,
        ".md",
      )) {
        if (ec.has(eg.fullPath)) {
          this.logger.debug(
            `Agent file already loaded, skipping: ${eg.fullPath}`,
          );
          continue;
        }
        try {
          let eA: any = await this.parseAgentFile(eg, el, void 0, eu, ed);
          eA && (ep.push(eA), ec.add(eg.fullPath));
        } catch (eA: any) {
          this.logger.debug(`Failed to parse agent file ${eg.fullPath}`, eA);
        }
      }
      return ep;
    }
    async parseAgentFile(
      eA?: any,
      el?: any,
      ec?: any,
      eu?: any,
      ed?: any,
    ): Promise<any> {
      let ep: any, eg: any, eh: any;
      "string" == typeof eA
        ? ((ep = eA), (eg = el), (eh = ec))
        : ((ep = eA.fullPath), (eg = ""), (eh = el));
      try {
        let el: any,
          ec: any = await (0, A$.readFile)(ep, "utf-8"),
          ef: any = t5.MarkdownUtils.extractFrontMatterFull(ec);
        ef.parseError &&
          this.logger.warn(
            `[AgentLoader] Malformed YAML frontmatter in '${ep}': ${ef.parseError}`,
          );
        let em: any = ef.data,
          eE: any =
            "string" == typeof eA ? (0, tX.relative)(eg, ep) : eA.relativePath,
          eC: any = (0, tX.basename)(eE).replace(/\.md$/, ""),
          ey: any = em.name || eC,
          ew: any = this.generateSourceLabel(eE, eh),
          eB: any = em.description || ey;
        eB.includes(ew) || (eB = `${eB} ${ew}`);
        let e_: any = t5.MarkdownUtils.parseListField(em.tools),
          eI: any = e_.length > 0 ? e_ : void 0,
          ev: any = t5.MarkdownUtils.parseListField(em.skills),
          eS: any = em.model?.trim(),
          eQ: any =
            tV.ContainerUtil.get(AS.ProductManager).getCurrentConfiguration()
              ?.models || [];
        if (eS) {
          let eA: any = eQ.find((eA?: any) => eA.id === eS);
          eA
            ? (el = eA.id)
            : this.logger.warn(
                `[AgentExtensionLoader] agent '${ey}' declared model '${eS}' is not in current available models; clearing models to inherit from main agent.`,
              );
        }
        let eD: any = eu || ("string" == typeof eA ? eg : void 0),
          eT: any = parseFrontmatterHooks(
            em.hooks,
            `agent '${ey}'`,
            this.logger,
          ),
          eR: any =
            eT && ed
              ? await (0, A5.enrichPluginHookConfigs)(
                  eT,
                  ed,
                  A4.windowsPathToUnix,
                )
              : eT,
          ek: any = ef.content.trim(),
          eM: any = ed
            ? await (0, A8.substitutePluginLoadTimeVariables)(ek, ep, eD, ed)
            : (0, A8.substituteLoadTimeVariables)(ek, ep, eD);
        return {
          name: ey,
          description: eB,
          instructions: eM,
          ...(eI && { tools: eI }),
          models: el ? [el] : [],
          asTool: !0,
          color: em.color || t5.ColorUtils.generateColorFromName(ey),
          tags: [AY.CLI_AGENT_TAG, AY.CUSTOM_AGENT_TAG, AJ.PLUGIN_TAG, eh],
          ...(em.permissionMode && { permissionMode: em.permissionMode }),
          ...(ev.length > 0 && { skills: ev }),
          ...(eR && { hooks: eR }),
        };
      } catch (eA: any) {
        this.logger.debug(`Failed to parse agent file ${ep}`, eA);
        return;
      }
    }
    generateSourceLabel(eA?: any, el?: any): any {
      let ec: any = eA.split(tX.sep);
      if ((ec.pop(), 0 === ec.length)) return `(${el})`;
      let eu: any = ec.join(":");
      return `(${el}:${eu})`;
    }
  }
  // UTF-16 9588330..9591824
  class CommandExtensionLoader {
    [key: string]: any;
    constructor() {
      this.type = t$.PluginExtensionType.Command;
    }
    init(): any {
      this.logger.setContext("CommandExtensionLoader");
    }
    async load(eA?: any, el?: any, ec?: any, eu?: any): Promise<any> {
      let ed: any = [],
        ep: any = new Set(),
        eg: any = eu || (0, A5.createPluginEnvironmentContext)(el, eA);
      try {
        if (ec && ec.length > 0)
          try {
            let eu: any = await this.loadFromPaths(eA, el, ec, ep, eg);
            ed.push(...eu);
          } catch (eA: any) {
            this.logger.error(
              `Failed to load commands from extension: ${el}`,
              eA,
            );
          }
        let eu: any = (0, tX.join)(eA, A7);
        if ((await this.pathExists(eu)) && !ep.has(eu)) {
          let ec: any = await this.scanCommandsDirectory(eu, el, ep, eA, eg);
          ed.push(...ec);
        } else
          (ec && 0 !== ec.length) ||
            this.logger.debug(`Commands directory not found: ${eu}`);
        ed.length > 0 &&
          this.logger.info(
            `Loaded ${ed.length} command(s) from extension: ${el}`,
          );
      } catch (eA: any) {
        (this.logger.error(`Failed to load commands from extension: ${el}`, eA),
          this.errorCollector.addError({
            type: t$.PluginErrorType.LoadFailed,
            componentType: "Command",
            pluginName: el,
            message: `Failed to load commands from extension '${el}'`,
            details: eA instanceof Error ? eA.message : String(eA),
          }));
      }
      return ed;
    }
    async loadFromPaths(
      eA?: any,
      el?: any,
      ec?: any,
      eu?: any,
      ed?: any,
    ): Promise<any> {
      let ep: any = [];
      for (let eg of ec) {
        if ("string" != typeof eg) {
          this.logger.warn(
            `Skipping non-string command path entry: ${JSON.stringify(eg)}`,
          );
          continue;
        }
        let ec: any = (0, tX.join)(eA, eg);
        if (!(await this.pathExists(ec))) {
          this.logger.warn(`Command path not found: ${ec}`);
          continue;
        }
        if (eu.has(ec)) {
          this.logger.debug(`Command path already loaded, skipping: ${ec}`);
          continue;
        }
        let eh: any = await (0, A$.stat)(ec);
        if (eh.isFile() && ec.endsWith(".md")) {
          let eg: any = await this.parseCommandFile(ec, eA, el, void 0, ed);
          eg && (ep.push(eg), eu.add(ec));
        } else if (eh.isDirectory()) {
          eu.add(ec);
          let eg: any = await this.scanCommandsDirectory(ec, el, eu, eA, ed);
          ep.push(...eg);
        } else
          this.logger.warn(
            `Invalid command path (not a directory or .md file): ${ec}`,
          );
      }
      return ep;
    }
    async pathExists(eA?: any): Promise<any> {
      try {
        return (await (0, A$.access)(eA), !0);
      } catch {
        return !1;
      }
    }
    async scanCommandsDirectory(
      eA?: any,
      el?: any,
      ec?: any,
      eu?: any,
      ed?: any,
    ): Promise<any> {
      let ep: any = [];
      for (let eg of await t5.DirectoryScanUtils.getFilesByExtension(
        eA,
        ".md",
      )) {
        if (ec.has(eg.fullPath)) {
          this.logger.debug(
            `Command file already loaded, skipping: ${eg.fullPath}`,
          );
          continue;
        }
        try {
          let eA: any = await this.parseCommandFile(eg, el, void 0, eu, ed);
          eA && (ep.push(eA), ec.add(eg.fullPath));
        } catch (eA: any) {
          this.logger.debug(`Failed to parse command file ${eg.fullPath}`, eA);
        }
      }
      return ep;
    }
    async parseCommandFile(
      eA?: any,
      el?: any,
      ec?: any,
      eu?: any,
      ed?: any,
    ): Promise<any> {
      let ep: any, eg: any, eh: any;
      "string" == typeof eA
        ? ((ep = eA), (eg = el), (eh = ec))
        : ((ep = eA.fullPath), (eg = ""), (eh = el));
      try {
        let el: any = await (0, A$.readFile)(ep, "utf-8"),
          ec: any = t5.MarkdownUtils.extractFrontMatterWithContent(el),
          ef: any = ec.data,
          em: any = (
            "string" == typeof eA ? (0, tX.relative)(eg, ep) : eA.relativePath
          ).split(tX.sep),
          eE: any = em.pop()?.replace(/\.md$/, "") || "",
          eC: any = em.length > 0 ? `${em.join(":")}:${eE}` : eE,
          ey: any = ef.description || eC;
        ey = `${ey} (${eh.includes("@") ? `plugin: ${eh}` : eh})`;
        let ew: any = t5.MarkdownUtils.parseListField(ef["allowed-tools"]),
          eB: any = ef.model?.trim(),
          e_: any =
            tV.ContainerUtil.get(AS.ProductManager).getCurrentConfiguration()
              ?.models || [];
        if (!e_.find((eA?: any) => eA.id === eB)) {
          let eA: any = e_.find((eA?: any) => eA.name === eB);
          eA && (eB = eA.id);
        }
        let eI: any = eu || ("string" == typeof eA ? eg : void 0),
          ev: any = ec.content.trim(),
          eS: any = ed
            ? await (0, A8.substitutePluginLoadTimeVariables)(ev, ep, eI, ed)
            : (0, A8.substituteLoadTimeVariables)(ev, ep, eI);
        return {
          name: eh.includes("@")
            ? `${eh.substring(0, eh.indexOf("@"))}:${eC}`
            : eC,
          description: ey,
          model: eB || "",
          tags: [AJ.CUSTOM_COMMAND_TAG, AJ.PLUGIN_TAG, eh],
          prompt: eS,
          allowedTools: ew,
          argumentHint: ef["argument-hint"]?.trim() || "",
          requiredVariables: [],
          scope: AJ.PLUGIN_TAG,
          disableModelInvocation: ef["disable-model-invocation"],
        };
      } catch (eA: any) {
        this.logger.debug(`Failed to parse command file ${ep}`, eA);
        return;
      }
    }
  }
  // UTF-16 9593102..9597847
  class SkillExtensionLoader {
    [key: string]: any;
    constructor() {
      this.type = t$.PluginExtensionType.Skill;
    }
    init(): any {
      this.logger.setContext("SkillExtensionLoader");
    }
    async load(eA?: any, el?: any, ec?: any, eu?: any): Promise<any> {
      let ed: any = [],
        ep: any = new Set(),
        eg: any = eu || (0, A5.createPluginEnvironmentContext)(el, eA);
      try {
        if (ec && ec.length > 0)
          try {
            let eu: any = await this.loadFromPaths(eA, el, ec, ep, eg);
            ed.push(...eu);
          } catch (eA: any) {
            this.logger.error(
              `Failed to load skills from extension: ${el}`,
              eA,
            );
          }
        let eu: any = (0, tX.join)(eA, rc);
        if ((await this.pathExists(eu)) && !ep.has(eu)) {
          let ec: any = await this.scanSkillsDirectory(
            eu,
            el,
            ep,
            void 0,
            0,
            eA,
            eg,
          );
          ed.push(...ec);
        } else
          (ec && 0 !== ec.length) ||
            this.logger.debug(`Skills directory not found: ${eu}`);
        let eh: any = (0, tX.join)(eA, "SKILL.md");
        if (!ep.has(eh) && (await this.pathExists(eh))) {
          let ec: any = await this.parseSkillFile(eh, el, void 0, eA, eg);
          ec && (ed.push(ec), ep.add(eh));
        }
        ed.length > 0 &&
          this.logger.info(
            `Loaded ${ed.length} skill(s) from extension: ${el} [${ed.map((eA?: any) => eA.name).join(",")}]`,
          );
      } catch (eA: any) {
        (this.logger.error(`Failed to load skills from extension: ${el}`, eA),
          this.errorCollector.addError({
            type: t$.PluginErrorType.LoadFailed,
            componentType: "Skill",
            pluginName: el,
            message: `Failed to load skills from extension '${el}'`,
            details: eA instanceof Error ? eA.message : String(eA),
          }));
      }
      return ed;
    }
    async loadFromPaths(
      eA?: any,
      el?: any,
      ec?: any,
      eu?: any,
      ed?: any,
    ): Promise<any> {
      let ep: any = [];
      for (let eg of ec) {
        if ("string" != typeof eg) {
          this.logger.warn(
            `Skipping non-string skill path entry: ${JSON.stringify(eg)}`,
          );
          continue;
        }
        let ec: any = (0, tX.join)(eA, eg);
        if (!(await this.pathExists(ec))) {
          this.logger.warn(`Skill path not found: ${ec}`);
          continue;
        }
        if (eu.has(ec)) {
          this.logger.debug(`Skill path already loaded, skipping: ${ec}`);
          continue;
        }
        let eh: any = await (0, A$.stat)(ec);
        if (eh.isFile() && ec.endsWith("SKILL.md")) {
          let eg: any = await this.parseSkillFile(ec, el, void 0, eA, ed);
          eg && (ep.push(eg), eu.add(ec));
        } else if (eh.isDirectory()) {
          eu.add(ec);
          let eg: any = await this.scanSkillsDirectory(
            ec,
            el,
            eu,
            void 0,
            0,
            eA,
            ed,
          );
          ep.push(...eg);
        } else
          this.logger.warn(
            `Invalid skill path (not a directory or SKILL.md file): ${ec}`,
          );
      }
      return ep;
    }
    async pathExists(eA?: any): Promise<any> {
      try {
        return (await (0, A$.access)(eA), !0);
      } catch {
        return !1;
      }
    }
    async unload(eA?: any): Promise<any> {
      this.logger.info(`Unload skills from extension: ${eA}`);
    }
    async scanSkillsDirectory(
      eA?: any,
      el?: any,
      ec?: any,
      eu?: any,
      ed: any = 0,
      ep?: any,
      eg?: any,
    ): Promise<any> {
      let eh: any = [],
        ef: any = eu || eA;
      if (ed > eR.MAX_SCAN_DEPTH) return eh;
      try {
        let eu: any = await (0, A$.readdir)(eA, { withFileTypes: !0 });
        for (let ed of eu) {
          let eu: any = (0, tX.join)(eA, ed.name);
          if (ec.has(eu)) {
            this.logger.debug(`Skill path already loaded, skipping: ${eu}`);
            continue;
          }
          if (
            (await this.isFileEntry(eu, ed)) &&
            "SKILL.md" === ed.name &&
            !ec.has(eu)
          )
            try {
              let eA: any = await this.parseSkillFile(eu, el, ef, ep, eg);
              eA && (eh.push(eA), ec.add(eu));
            } catch (eA: any) {
              this.logger.debug(`Failed to parse skill file ${eu}`, eA);
            }
        }
        for (let em of await (0, t5.mapWithConcurrency)(
          eu,
          this.getSkillLoadConcurrency(),
          async (eu?: any) => {
            let eh: any = (0, tX.join)(eA, eu.name);
            return !(await this.isDirectoryEntry(eh, eu)) || ec.has(eh)
              ? []
              : this.scanSkillsDirectory(eh, el, ec, ef, ed + 1, ep, eg);
          },
        ))
          eh.push(...em);
      } catch (el: any) {
        this.logger.debug(`Failed to scan directory ${eA}`, el);
      }
      return eh;
    }
    getSkillLoadConcurrency(): any {
      return (0, t5.getPositiveIntegerEnv)(
        "CODEBUDDY_SKILL_LOAD_CONCURRENCY",
        t5.DEFAULT_FS_CONCURRENCY,
      );
    }
    async isDirectoryEntry(eA?: any, el?: any): Promise<any> {
      if (el.isDirectory()) return !0;
      if (!el.isSymbolicLink()) return !1;
      try {
        return (await (0, A$.stat)(eA)).isDirectory();
      } catch {
        return !1;
      }
    }
    async isFileEntry(eA?: any, el?: any): Promise<any> {
      if (el.isFile()) return !0;
      if (!el.isSymbolicLink()) return !1;
      try {
        return (await (0, A$.stat)(eA)).isFile();
      } catch {
        return !1;
      }
    }
    async parseSkillFile(
      eA?: any,
      el?: any,
      ec?: any,
      eu?: any,
      ed?: any,
    ): Promise<any> {
      try {
        let ep: any,
          eg: any = await (0, A$.readFile)(eA, "utf-8"),
          eh: any = t5.MarkdownUtils.extractFrontMatterFull(eg);
        eh.parseError &&
          this.logger.warn(
            `[SkillLoader] Malformed YAML frontmatter in '${eA}': ${eh.parseError}`,
          );
        let ef: any = eh.data,
          { userInvocable: em, disableModelInvocation: eE } = (0,
          ra.deriveSkillVisibility)(ef);
        if (el && el.includes("@")) {
          let eA: any = el.indexOf("@"),
            ec: any = el.substring(0, eA),
            eu: any = el.substring(eA + 1);
          ec && (ep = { pluginName: ec, marketplaceName: eu });
        }
        let eC: any = (0, tX.dirname)(eA),
          ey: any =
            eu && "" === (0, tX.relative)(eu, eC)
              ? (ep?.pluginName ?? el)
              : void 0,
          ew: any = ef.name || ey || (0, rl.deriveSkillNameFromPath)(eA, ec),
          eB: any = `(${el})`,
          e_: any = ef.description || ew;
        e_.includes(eB) || (e_ = `${e_} ${eB}`);
        let eI: any = t5.MarkdownUtils.parseListField(ef["allowed-tools"]),
          ev: any = eI.length > 0 ? eI : void 0,
          eS: any = parseFrontmatterHooks(
            ef.hooks,
            `skill '${ew}'`,
            this.logger,
          ),
          eQ: any =
            eS && ed
              ? await (0, A5.enrichPluginHookConfigs)(
                  eS,
                  ed,
                  A4.windowsPathToUnix,
                )
              : eS,
          eD: any = eh.content.trim(),
          eT: any = ed
            ? await (0, A8.substitutePluginLoadTimeVariables)(eD, eA, eu, ed)
            : (0, A8.substituteLoadTimeVariables)(eD, eA, eu);
        return {
          name: ew,
          description: e_,
          instructions: eT,
          baseDirectory: eC,
          allowedTools: ev,
          source: "plugin",
          location: eA,
          color: t5.ColorUtils.generateColorFromName(ew),
          disableModelInvocation: eE,
          context: ef.context,
          agent: ef.agent,
          model: ef.model,
          userInvocable: em,
          ...(eu && { pluginRoot: eu }),
          ...(ep && { pluginInfo: ep }),
          ...(eQ && { hooks: eQ }),
        };
      } catch (el: any) {
        this.logger.debug(`Failed to parse skill file ${eA}`, el);
        return;
      }
    }
  }
  eR = SkillExtensionLoader;
  Object.assign(SkillExtensionLoader, { MAX_SCAN_DEPTH: 5 });
  // UTF-16 9599266..9602081
  class HookExtensionLoader {
    [key: string]: any;
    constructor() {
      this.type = t$.PluginExtensionType.Hook;
    }
    init(): any {
      this.logger.setContext("HookExtensionLoader");
    }
    async load(eA?: any, el?: any, ec?: any, eu?: any): Promise<any> {
      let ed: any = {},
        ep: any = eu;
      if (!ep && this.pluginOptionsStorage)
        try {
          ep = (0, A5.createPluginEnvironmentContext)(
            el,
            eA,
            await this.pluginOptionsStorage.loadOptions(el),
          );
        } catch {}
      ep || (ep = (0, A5.createPluginEnvironmentContext)(el, eA));
      try {
        if (void 0 !== ec)
          try {
            let eu: any = await this.loadFromConfig(eA, el, ec, ep);
            this.mergeHooks(ed, eu);
          } catch (eA: any) {
            this.logger.error(`Failed to load hooks from extension: ${el}`, eA);
          }
        let eu: any = (0, tX.join)(eA, rp);
        if (await this.pathExists(eu)) {
          let ec: any = await this.loadFromFile(eu, el, eA, ep);
          this.mergeHooks(ed, ec);
        } else
          void 0 === ec && this.logger.debug(`Hooks file not found: ${eu}`);
        Object.keys(ed).length > 0 &&
          this.logger.info(`Loaded hooks configuration from extension: ${el}`);
      } catch (eA: any) {
        this.logger.error(`Failed to load hooks from extension: ${el}`, eA);
      }
      return ed;
    }
    async loadFromConfig(eA?: any, el?: any, ec?: any, eu?: any): Promise<any> {
      if (Array.isArray(ec)) {
        let ed: any = {};
        for (let ep of ec) {
          let ec: any = await this.loadFromConfig(eA, el, ep, eu);
          this.mergeHooks(ed, ec);
        }
        return ed;
      }
      if ("string" == typeof ec) {
        let ed: any = (0, tX.join)(eA, ec);
        return (await this.pathExists(ed))
          ? this.loadFromFile(ed, el, eA, eu)
          : (this.logger.warn(`Hooks config file not found: ${ed}`), {});
      }
      return "object" == typeof ec
        ? this.isValidHooksConfig(ec)
          ? await (0, A5.enrichPluginHookConfigs)(ec, eu, A4.windowsPathToUnix)
          : (this.logger.warn(
              `Invalid hooks configuration object in extension: ${el}`,
            ),
            {})
        : {};
    }
    mergeHooks(eA?: any, el?: any): any {
      for (let [ec, eu] of Object.entries(el))
        eA[ec] = [...(eA[ec] || []), ...eu];
    }
    async pathExists(eA?: any): Promise<any> {
      try {
        return (await (0, A$.access)(eA), !0);
      } catch {
        return !1;
      }
    }
    async loadFromFile(eA?: any, el?: any, ec?: any, eu?: any): Promise<any> {
      try {
        let el: any = await (0, A$.readFile)(eA, "utf-8"),
          ec: any = JSON.parse(el),
          ed: any = ec.hooks || ec;
        if (!this.isValidHooksConfig(ed))
          return (
            this.logger.warn(`Invalid hooks configuration format in: ${eA}`),
            {}
          );
        return await (0, A5.enrichPluginHookConfigs)(
          ed,
          eu,
          A4.windowsPathToUnix,
        );
      } catch (el: any) {
        return (
          this.logger.error(`Failed to load hooks from file ${eA}:`, el),
          {}
        );
      }
    }
    isValidHooksConfig(eA?: any): any {
      if (!eA || "object" != typeof eA) return !1;
      for (let [el, ec] of Object.entries(eA)) {
        if (!Array.isArray(ec))
          return (
            this.logger.warn(
              `Invalid hook config for event ${el}: expected array`,
            ),
            !1
          );
        for (let eA of ec)
          if (!this.isValidHookConfig(eA))
            return (this.logger.warn(`Invalid hook config in event ${el}`), !1);
      }
      return !0;
    }
    isValidHookConfig(eA?: any): any {
      if (!eA || "object" != typeof eA || !Array.isArray(eA.hooks)) return !1;
      for (let el of eA.hooks) {
        if (
          !el ||
          "object" != typeof el ||
          (areExtendedPluginHooksDisabled() && "command" !== el.type)
        )
          return !1;
        switch (el.type) {
          case "command":
            if ("string" != typeof el.command) return !1;
            break;
          case "prompt":
          case "agent":
            if ("string" != typeof el.prompt) return !1;
            break;
          case "http":
            if ("string" != typeof el.url) return !1;
            break;
          default:
            return !1;
        }
        if (void 0 !== el.timeout && "number" != typeof el.timeout) return !1;
      }
      return void 0 === eA.matcher || "string" == typeof eA.matcher;
    }
  }
  // UTF-16 9603335..9608128
  class MCPExtensionLoader {
    [key: string]: any;
    constructor() {
      this.type = t$.PluginExtensionType.MCP;
    }
    init(): any {
      this.logger.setContext("MCPExtensionLoader");
    }
    async load(eA?: any, el?: any, eu?: any, ed?: any, ep?: any): Promise<any> {
      try {
        let eg: any = {},
          eh: any = ep;
        if (!eh && this.pluginOptionsStorage)
          try {
            eh = (0, A5.createPluginEnvironmentContext)(
              el,
              eA,
              await this.pluginOptionsStorage.loadOptions(el),
            );
          } catch {}
        if (
          (eh || (eh = (0, A5.createPluginEnvironmentContext)(el, eA)),
          void 0 !== eu)
        ) {
          let ec: any = await this.loadFromConfig(eA, el, eu);
          Object.assign(eg, ec);
        }
        let ef: any = await this.loadFromConfigFile(eA);
        ef && Object.assign(eg, ef);
        let em: any = await this.loadFromDirectory(eA);
        if ((em && Object.assign(eg, em), ed && ed.length > 0))
          try {
            let { loadMcpBundles: eu } = await Promise.resolve().then(
                ec.bind(ec, 86902),
              ),
              ep: any = await eu(ed, eA, el);
            for (let eA of (Object.assign(eg, ep.configs), ep.errors))
              (this.logger.warn(
                `Failed to load MCPB ${eA.bundle.name}: ${eA.error.message}`,
              ),
                this.errorCollector.addError({
                  type: t$.PluginErrorType.McpbDownloadFailed,
                  url: eA.bundle.source,
                  reason: eA.error.message,
                }));
          } catch (eA: any) {
            this.logger.warn(
              `Failed to load MCP bundles from plugin ${el}:`,
              eA,
            );
          }
        let eE: any = await this.enrichWithPluginEnvironment(eg, eh);
        return (
          Object.keys(eE).length > 0 &&
            this.logger.info(
              `Loaded ${Object.keys(eE).length} MCP server(s) from extension: ${el}`,
            ),
          eE
        );
      } catch (eA: any) {
        throw (
          this.logger.error(
            `Failed to load MCP servers from extension: ${el}`,
            eA,
          ),
          this.errorCollector.addError({
            type: t$.PluginErrorType.LoadFailed,
            componentType: "MCP",
            pluginName: el,
            message: `Failed to load MCP servers from extension '${el}'`,
            details: eA instanceof Error ? eA.message : String(eA),
          }),
          eA
        );
      }
    }
    async loadFromConfig(eA?: any, el?: any, ec?: any): Promise<any> {
      if ("string" == typeof ec) {
        let el: any = (0, tX.join)(eA, ec);
        return (await this.pathExists(el))
          ? this.parseServerConfigFile(el)
          : (this.logger.warn(`MCP config file not found: ${el}`), {});
      }
      return "object" == typeof ec ? ec : {};
    }
    async loadFromConfigFile(eA?: any): Promise<any> {
      let el: any = (0, tX.join)(eA, rf);
      return (await this.pathExists(el))
        ? this.parseServerConfigFile(el)
        : (this.logger.debug(`MCP config file not found: ${el}`), {});
    }
    async loadFromDirectory(eA?: any): Promise<any> {
      let el: any = (0, tX.join)(eA, rm);
      if (!(await this.pathExists(el)))
        return (
          this.logger.debug(`MCP servers directory not found: ${el}`),
          {}
        );
      let ec: any = {};
      try {
        for (let eA of await (0, A$.readdir)(el)) {
          let eu: any = (0, tX.join)(el, eA);
          if ((await (0, A$.stat)(eu)).isFile() && eA.endsWith(".json"))
            try {
              let eA: any = await this.parseServerConfigFile(eu);
              eA && Object.assign(ec, eA);
            } catch (eA: any) {
              this.logger.debug(
                `Failed to parse MCP server config file ${eu}:`,
                eA,
              );
            }
        }
      } catch (eA: any) {
        this.logger.debug(`Failed to scan MCP directory ${el}:`, eA);
      }
      return ec;
    }
    async pathExists(eA?: any): Promise<any> {
      try {
        return (await (0, A$.access)(eA), !0);
      } catch {
        return !1;
      }
    }
    async parseServerConfigFile(eA?: any): Promise<any> {
      try {
        let el: any = await (0, A$.readFile)(eA, "utf-8"),
          ec: any = t5.McpUtils.parseJsonc(el);
        return ec.mcpServers || this.inferFlatFormat(ec);
      } catch (el: any) {
        return (
          this.logger.warn(`Failed to parse MCP config file ${eA}:`, el),
          {}
        );
      }
    }
    async enrichWithPluginEnvironment(eA?: any, el?: any): Promise<any> {
      let ec: any = {},
        substitute: any = (eA?: any) =>
          (0, A5.substitutePluginVariables)(eA, el, {
            mode: "config",
            expandEnvironment: !0,
          });
      for (let [eu, ed] of Object.entries(eA)) {
        let eA: any = this.inferTypeIfMissing(eu, ed);
        if (eA)
          try {
            if ("stdio" === eA.type) {
              if ("string" != typeof eA.command || 0 === eA.command.length) {
                this.logger.warn(
                  `MCP server '${eu}' declared as stdio but has no valid 'command' field; skipping.`,
                );
                continue;
              }
              let ed: any = Object.fromEntries(
                Object.entries(eA.env || {}).map(([eA, el]: any) => [
                  eA,
                  substitute(el),
                ]),
              );
              ec[eu] = {
                ...eA,
                command: substitute(eA.command),
                args: eA.args?.map(substitute),
                ...(eA.cwd && { cwd: substitute(eA.cwd) }),
                env: {
                  ...ed,
                  ...(await (0, A5.buildPluginSubprocessEnvironment)(el)),
                },
              };
              continue;
            }
            if (
              "sse" === eA.type ||
              "http" === eA.type ||
              "remote" === eA.type
            ) {
              (await (0, A5.ensurePluginDataDirectoryForText)(
                [eA.url, ...Object.values(eA.headers || {})].join("\n"),
                el,
              ),
                (ec[eu] = {
                  ...eA,
                  url: substitute(eA.url),
                  ...(eA.headers && {
                    headers: Object.fromEntries(
                      Object.entries(eA.headers).map(([eA, el]: any) => [
                        eA,
                        substitute(el),
                      ]),
                    ),
                  }),
                }));
              continue;
            }
            if ("ws-ide" === eA.type || "sse-ide" === eA.type) {
              (await (0, A5.ensurePluginDataDirectoryForText)(
                [eA.url, eA.authToken || ""].join("\n"),
                el,
              ),
                (ec[eu] = {
                  ...eA,
                  url: substitute(eA.url),
                  ...(eA.authToken && { authToken: substitute(eA.authToken) }),
                }));
              continue;
            }
            ec[eu] = eA;
          } catch (eA: any) {
            this.logger.warn(
              `Failed to resolve plugin environment for MCP server '${eu}':`,
              eA,
            );
          }
      }
      return ec;
    }
    inferTypeIfMissing(eA?: any, el?: any): any {
      if (!el || "object" != typeof el)
        return (
          this.logger.warn(`MCP server '${eA}' has invalid config; skipping.`),
          null
        );
      if ("string" == typeof el.type && el.type.length > 0) return el;
      let ec: any = el;
      return "string" == typeof ec.command && ec.command.length > 0
        ? { ...el, type: "stdio" }
        : "string" == typeof ec.ideName && ec.ideName.length > 0
          ? { ...el, type: "ws-ide" }
          : "string" == typeof ec.url && ec.url.length > 0
            ? { ...el, type: "http" }
            : (this.logger.warn(
                `MCP server '${eA}' is missing 'type' and has no recognizable fields (command/url/ideName); skipping.`,
              ),
              null);
    }
    inferFlatFormat(eA?: any): any {
      let el: any = Object.entries(eA);
      return 0 === el.length
        ? {}
        : el.every(
              ([, eA]: any) =>
                "object" == typeof eA &&
                null !== eA &&
                ("command" in eA || "url" in eA),
            )
          ? eA
          : {};
    }
  }
  // UTF-16 9609592..9612038
  class LSPExtensionLoader {
    [key: string]: any;
    constructor() {
      this.type = t$.PluginExtensionType.LSP;
    }
    init(): any {
      this.logger.setContext("LSPExtensionLoader");
    }
    async load(eA?: any, el?: any, ec?: any, eu?: any): Promise<any> {
      try {
        let ed: any = {},
          ep: any = eu;
        if (!ep && this.pluginOptionsStorage)
          try {
            ep = (0, A5.createPluginEnvironmentContext)(
              el,
              eA,
              await this.pluginOptionsStorage.loadOptions(el),
            );
          } catch {}
        return (
          ep || (ep = (0, A5.createPluginEnvironmentContext)(el, eA)),
          (ed =
            void 0 !== ec
              ? await this.loadFromConfig(eA, el, ec)
              : await this.loadFromConfigFile(eA)),
          (ed = await this.enrichWithPluginEnvironment(ed, ep)),
          this.validateConfigs(ed, el),
          Object.keys(ed).length > 0 &&
            this.logger.info(
              `Loaded ${Object.keys(ed).length} LSP server(s) from extension: ${el}`,
            ),
          ed
        );
      } catch (eA: any) {
        throw (
          this.logger.error(
            `Failed to load LSP servers from extension: ${el}`,
            eA,
          ),
          eA
        );
      }
    }
    async loadFromConfig(eA?: any, el?: any, ec?: any): Promise<any> {
      if ("string" == typeof ec) {
        let el: any = (0, tX.join)(eA, ec);
        return (await this.pathExists(el))
          ? this.parseServerConfigFile(el)
          : (this.logger.warn(`LSP config file not found: ${el}`), {});
      }
      return "object" == typeof ec ? ec : {};
    }
    async loadFromConfigFile(eA?: any): Promise<any> {
      let el: any = (0, tX.join)(eA, rC);
      return (await this.pathExists(el))
        ? this.parseServerConfigFile(el)
        : (this.logger.debug(`LSP config file not found: ${el}`), {});
    }
    async pathExists(eA?: any): Promise<any> {
      try {
        return (await (0, A$.access)(eA), !0);
      } catch {
        return !1;
      }
    }
    async parseServerConfigFile(eA?: any): Promise<any> {
      try {
        let el: any = await (0, A$.readFile)(eA, "utf-8"),
          ec: any = JSON.parse(el);
        return ec.lspServers || ec;
      } catch (el: any) {
        return (
          this.logger.warn(`Failed to parse LSP config file ${eA}:`, el),
          {}
        );
      }
    }
    async enrichWithPluginEnvironment(eA?: any, el?: any): Promise<any> {
      let ec: any = {},
        substitute: any = (eA?: any) =>
          (0, A5.substitutePluginVariables)(eA, el, {
            mode: "config",
            expandEnvironment: !0,
          });
      for (let [eu, ed] of Object.entries(eA))
        try {
          if ("string" != typeof ed.command) {
            ec[eu] = ed;
            continue;
          }
          let eA: any = Object.fromEntries(
            Object.entries(ed.env || {}).map(([eA, el]: any) => [
              eA,
              substitute(el),
            ]),
          );
          ec[eu] = {
            ...ed,
            command: substitute(ed.command),
            args: ed.args?.map(substitute),
            env: {
              ...eA,
              ...(await (0, A5.buildPluginSubprocessEnvironment)(el)),
            },
            ...(ed.workspaceFolder && {
              workspaceFolder: substitute(ed.workspaceFolder),
            }),
          };
        } catch (eA: any) {
          this.logger.warn(
            `Failed to resolve plugin environment for LSP server '${eu}':`,
            eA,
          );
        }
      return ec;
    }
    validateConfigs(eA?: any, el?: any): any {
      for (let [ec, eu] of Object.entries(eA))
        (eu.command ||
          this.logger.warn(
            `Invalid LSP config for language '${ec}' in extension '${el}': missing required field 'command'`,
          ),
          (eu.extensionToLanguage &&
            0 !== Object.keys(eu.extensionToLanguage).length) ||
            this.logger.warn(
              `Invalid LSP config for language '${ec}' in extension '${el}': missing required field 'extensionToLanguage'`,
            ));
    }
  }
  // UTF-16 9613296..9616389
  class OutputStyleExtensionLoader {
    [key: string]: any;
    constructor() {
      this.type = t$.PluginExtensionType.OutputStyle;
    }
    init(): any {
      this.logger.setContext("OutputStyleExtensionLoader");
    }
    async load(eA?: any, el?: any, ec?: any): Promise<any> {
      let eu: any = [],
        ed: any = new Set();
      try {
        if (ec && ec.length > 0)
          try {
            let ep: any = await this.loadFromPaths(eA, el, ec, ed);
            eu.push(...ep);
          } catch (eA: any) {
            this.logger.error(
              `Failed to load output styles from configured paths in extension: ${el}`,
              eA,
            );
          }
        let ep: any = (0, tX.join)(eA, rw);
        if ((await this.pathExists(ep)) && !ed.has(ep)) {
          let eA: any = await this.scanOutputStylesDirectory(ep, el, ed);
          eu.push(...eA);
        } else
          (ec && 0 !== ec.length) ||
            this.logger.debug(`Output styles directory not found: ${ep}`);
        let eg: any = new Map();
        for (let eA of eu) eg.has(eA.name) || eg.set(eA.name, eA);
        let eh: any = Array.from(eg.values());
        return (
          eh.length > 0 &&
            this.logger.info(
              `Loaded ${eh.length} output style(s) from extension: ${el} [${eh.map((eA?: any) => eA.name).join(", ")}]`,
            ),
          eh
        );
      } catch (ec: any) {
        (this.logger.error(
          `Failed to load output styles from extension: ${el}`,
          ec,
        ),
          this.errorCollector.addError({
            type: t$.PluginErrorType.ComponentLoadFailed,
            component: "OutputStyle",
            path: (0, tX.join)(eA, rw),
            message: `Failed to load output styles from extension '${el}'`,
            details: ec instanceof Error ? ec.message : String(ec),
          }));
      }
      return eu;
    }
    async loadFromPaths(eA?: any, el?: any, ec?: any, eu?: any): Promise<any> {
      let ed: any = [];
      for (let ep of ec) {
        let ec: any = (0, tX.join)(eA, ep);
        if (!(await this.pathExists(ec))) {
          this.logger.warn(`Output style path not found: ${ec}`);
          continue;
        }
        if (eu.has(ec)) {
          this.logger.debug(
            `Output style path already loaded, skipping: ${ec}`,
          );
          continue;
        }
        let eg: any = await (0, A$.stat)(ec);
        if (eg.isFile() && ec.endsWith(".md")) {
          let eA: any = await this.parseOutputStyleFile(ec, el);
          eA && (ed.push(eA), eu.add(ec));
        } else if (eg.isDirectory()) {
          eu.add(ec);
          let eA: any = await this.scanOutputStylesDirectory(ec, el, eu);
          ed.push(...eA);
        } else
          this.logger.warn(
            `Invalid output style path (not a directory or .md file): ${ec}`,
          );
      }
      return ed;
    }
    async pathExists(eA?: any): Promise<any> {
      try {
        return (await (0, A$.access)(eA), !0);
      } catch {
        return !1;
      }
    }
    async scanOutputStylesDirectory(
      eA?: any,
      el?: any,
      ec?: any,
    ): Promise<any> {
      let eu: any = [];
      try {
        for (let ed of await (0, A$.readdir)(eA, { withFileTypes: !0 })) {
          let ep: any = (0, tX.join)(eA, ed.name);
          if (ec.has(ep)) {
            this.logger.debug(
              `Output style path already loaded, skipping: ${ep}`,
            );
            continue;
          }
          if (ed.isDirectory()) {
            let eA: any = (0, tX.join)(ep, "index.md");
            if ((await this.pathExists(eA)) && !ec.has(eA))
              try {
                let ep: any = await this.parseOutputStyleFile(eA, el, ed.name);
                ep && (eu.push(ep), ec.add(eA));
              } catch (el: any) {
                this.logger.debug(
                  `Failed to parse output style file ${eA}`,
                  el,
                );
              }
          } else if (ed.isFile() && ed.name.endsWith(".md") && !ec.has(ep))
            try {
              let eA: any = await this.parseOutputStyleFile(ep, el);
              eA && (eu.push(eA), ec.add(ep));
            } catch (eA: any) {
              this.logger.debug(`Failed to parse output style file ${ep}`, eA);
            }
        }
      } catch (el: any) {
        this.logger.debug(`Failed to scan directory ${eA}`, el);
      }
      return eu;
    }
    async parseOutputStyleFile(eA?: any, el?: any, ec?: any): Promise<any> {
      try {
        let eu: any,
          ed: any = await (0, A$.readFile)(eA, "utf-8"),
          ep: any = t5.MarkdownUtils.extractFrontMatterWithContent(ed),
          eg: any = ep.data;
        eu = ec || (0, tX.basename)(eA).replace(/\.md$/, "");
        let eh: any = `${el}:${eu}`,
          ef: any = eg.description || eu;
        return {
          name: eh,
          description: ef,
          content: ep.content.trim(),
          keepCodingInstructions:
            eg["keep-coding-instructions"] || eg["force-for-plugin"],
        };
      } catch (el: any) {
        this.logger.debug(`Failed to parse output style file ${eA}`, el);
        return;
      }
    }
  }
  return {
    PluginLoaderManager,
    AgentExtensionLoader,
    CommandExtensionLoader,
    SkillExtensionLoader,
    HookExtensionLoader,
    MCPExtensionLoader,
    LSPExtensionLoader,
    OutputStyleExtensionLoader,
  };
}
