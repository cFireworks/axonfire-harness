// Native AgentManagerImpl UTF-16 7025572..7059651.
import * as AB from "@openai/agents-core";
import * as AD from "@openai/agents-core";
import * as AG from "../tools/native-tool-specs.js";
import {
  agentManagerConstants as A_,
  agentManagerToolNames as Aj,
  agentManagerPermissionUtils as PermissionUtils,
  agentManagerPlanGates as AK,
  NativeDeferred,
  NativeEmitter,
} from "./native-agent-manager-runtime.js";
import { PermissionMode } from "../permissions/permission.js";
import type { AgentManagerRuntime } from "./native-agent-manager-runtime.js";
const Av = { Deferred: NativeDeferred, Emitter: NativeEmitter },
  AH = { PermissionUtils },
  AL = { PermissionMode },
  AQ = {
    isModelVariantType: (value: any) =>
      value === "lite" || value === "reasoning",
  };
const A2 = new Set([
    Aj.ToolNames.AGENT,
    Aj.ToolNames.TASK_STOP,
    Aj.ToolNames.SEND_MESSAGE,
    Aj.ToolNames.ASK_USER_QUESTION,
    Aj.ToolNames.STRUCTURED_OUTPUT,
    Aj.ToolNames.SKILL,
    Aj.ToolNames.WECHAT_REPLY,
    Aj.ToolNames.WECOM_REPLY,
  ]),
  A3 = "PluginAgentPrompt",
  A4 = /{{\s*PluginAgentPrompt\s*}}/,
  A8 = 2000,
  A5 = "__codebuddy_prewait_probe__",
  A6 =
    "<expert_prompt>\nThese are your current conversation persona instructions. They complement the default instructions and must not override higher-priority safety, tool-use, or system-level rules.\n\n{{ PluginAgentPrompt }}\n</expert_prompt>";
export class AgentManagerImpl {
  [key: string]: any;
  constructor(readonly runtime: AgentManagerRuntime) {
    Object.assign(this, runtime.dependencies);
    ((this.agentMap = new Map()),
      (this.managedAgentInstances = new WeakSet()),
      (this.sessionMcpPrewaitCompleted = new WeakSet()),
      (this.sessionMcpPrewaitInFlight = new WeakMap()),
      (this.agentConfigMap = new Map()),
      (this.modelMap = new Map()),
      (this.readyDeferred = new Av.Deferred()),
      (this._ready = !1),
      (this.rebuilding = !1),
      (this.pendingRebuild = !1),
      (this.pendingForceRebuild = !1),
      (this.lastConfigHash = ""),
      (this.lastNonModelConfigHash = ""),
      (this.onDidRebuildSettledEmitter = new Av.Emitter()),
      (this.agentsWithPatchedTools = new Set()));
  }
  init(): any {
    this.settingsManager.list();
    let startAgentBuild: any = () => {
      (this.productManager.waitConfiguration().then(() => {
        let eA: any = this.runtime.getProfiler();
        (eA?.markStart("agent_build", "Agent Build (rebuildAgents)"),
          this.rebuildAgents().then(() => {
            eA?.markEnd("agent_build");
          }));
      }),
        this.productManager.onDidChange(() => {
          this.rebuildAgents();
        }));
    };
    this.prewarmStateService?.isStandby()
      ? this.prewarmStateService.onActivated(startAgentBuild)
      : startAgentBuild();
  }
  get ready(): any {
    return this._ready;
  }
  getDefaultAgentName(): any {
    return this.defaultAgentName;
  }
  isManagedAgentInstance(eA: any): any {
    return this.managedAgentInstances?.has(eA) ?? !1;
  }
  async getDefault(): Promise<any> {
    let eA: any = this.runtime.now();
    (this.logger.debug(
      `[Startup] AgentManager.getDefault: START (ready=${this._ready}, defaultAgent=${this.defaultAgentName})`,
    ),
      this._ready ||
        this.logger.debug(
          "[Startup] AgentManager.getDefault: waiting for readyDeferred...",
        ),
      await this.readyDeferred.promise);
    let el: any = this.runtime.now() - eA;
    this.logger.debug(
      `[Startup] AgentManager.getDefault: ready after ${el}ms, getting agent ${this.defaultAgentName}`,
    );
    let ec: any = await this.get(this.defaultAgentName);
    if (ec) return ec;
    throw Error(`default agent ${this.defaultAgentName} is not registered`);
  }
  async getPrimaryModel(): Promise<any> {
    return this.getModel(this.defaultAgentName);
  }
  getSettingsAgentName(): any {
    return this.settingsAgentName;
  }
  getVolatilePluginAgentState(): any {
    return {
      agentName: this.volatilePluginAgentName,
      sourcePluginId: this.volatilePluginSourcePluginId,
      internalModelRequestHeaders:
        this.volatilePluginInternalModelRequestHeaders,
    };
  }
  async setVolatilePluginAgent(eA: any, el: any = {}): Promise<any> {
    let ec: any = this.normalizePluginAgentSetting(eA),
      eu: any = ec ? el.sourcePluginId : void 0,
      ed: any = this.normalizePluginRequestHeaders(
        el.internalModelRequestHeaders,
      );
    return (
      (this.volatilePluginAgentName !== ec ||
        this.volatilePluginSourcePluginId !== eu ||
        this.stringifyPluginRequestHeaders(
          this.volatilePluginInternalModelRequestHeaders,
        ) !== this.stringifyPluginRequestHeaders(ed)) &&
      ((this.volatilePluginAgentName = ec),
      (this.volatilePluginSourcePluginId = eu),
      (this.volatilePluginInternalModelRequestHeaders = ed),
      this.logger.info(
        `[AgentManager] volatile plugin agent override updated: ${ec || "cleared"} (source=${eu || "none"}, internalModelRequestHeaders=${Object.keys(ed ?? {}).length})`,
      ),
      !1 === el.rebuild ||
        (await this.rebuildAgents(), await this.waitForRebuildSettled(), !0))
    );
  }
  async get(eA: any): Promise<any> {
    return (await this.readyDeferred.promise, this.agentMap.get(eA));
  }
  async getAgentConfig(eA: any): Promise<any> {
    return (await this.readyDeferred.promise, this.agentConfigMap.get(eA));
  }
  async refreshAgentTools(eA: any): Promise<any> {
    try {
      (await this.readyDeferred.promise, await this.waitForRebuildSettled());
      let el: any = this.agentMap.get(eA),
        ec: any = this.agentConfigMap.get(eA);
      if (!el || !ec)
        return void this.logger.warn(
          `Cannot refresh tools for non-existent agent: ${eA}`,
        );
      let eu: any = (await this.settingsManager.get("permissions")) || {},
        { agents: ed = [] } = await this.productManager.waitConfiguration(),
        ep: any = ed.find((el: any) => el.name === eA),
        eg: any = this.agentsWithPatchedTools.has(eA) ? void 0 : ep?.tools,
        eh: any = ec.tags?.includes(A_.CUSTOM_AGENT_TAG),
        ef: any = ["Agent"],
        em: any = [...(eg ?? ec.tools ?? (await this.getDefaultAgentTools()))],
        eE: any =
          !eh || ec.tools || eg ? em : em.filter((eA: any) => !ef.includes(eA));
      (this.maybeInjectSendMessage(eA, eE),
        this.maybeInjectExitPlanMode(eA, eE));
      let eC: any = await this.buildTools(eE, ec, eu);
      ((el.tools = eC),
        this.logger.debug(
          `[refreshAgentTools] Successfully updated tools for agent: ${eA}, tools count: ${eC.length}`,
        ));
    } catch (el: any) {
      this.logger.error(`Failed to refresh tools for agent ${eA}: ${el}`);
    }
  }
  async ensureAgentToolsFreshForRun(
    eA: any,
    el: any,
    ec: any,
    eu: any,
  ): Promise<any> {
    try {
      if ((await this.readyDeferred.promise, !this.agentMap.has(eA))) return;
      if (
        (this.sessionMcpPrewaitCompleted ??
          (this.sessionMcpPrewaitCompleted = new WeakSet()),
        this.sessionMcpPrewaitInFlight ??
          (this.sessionMcpPrewaitInFlight = new WeakMap()),
        !this.sessionMcpPrewaitCompleted.has(el))
      ) {
        let eu: any = this.sessionMcpPrewaitInFlight.get(el);
        eu ||
          ((eu = this.runFirstSessionMcpPrewait(eA, el, ec)
            .then(
              (eA: any) => (
                "completed" === eA && this.sessionMcpPrewaitCompleted.add(el),
                eA
              ),
            )
            .finally(() => {
              this.sessionMcpPrewaitInFlight.get(el) === eu &&
                this.sessionMcpPrewaitInFlight.delete(el);
            })),
          this.sessionMcpPrewaitInFlight.set(el, eu));
        try {
          let el: any = await eu;
          "completed" === el && (await this.refreshAgentTools(eA));
        } catch (eu: any) {
          (ec?.aborted || this.sessionMcpPrewaitCompleted.add(el),
            this.logger.warn(
              `[AgentManager.ensureAgentToolsFreshForRun] MCP prewait failed for ${eA}: ${eu instanceof Error ? eu.message : String(eu)}`,
            ));
        }
      }
      let ed: any = this.agentMap.get(eA);
      eu &&
        eu !== ed &&
        eu.name === eA &&
        this.isManagedAgentInstance(eu) &&
        ed &&
        (eu.tools = ed.tools);
    } catch (el: any) {
      this.logger.warn(
        `[AgentManager.ensureAgentToolsFreshForRun] failed for ${eA}: ${el}`,
      );
    }
  }
  async getFirstRunMcpPrewaitNames(eA: any, el: any): Promise<any> {
    let ec: any = this.agentMap.get(eA);
    if (
      ec?.tools?.some((eA: any) => eA.name === Aj.ToolNames.TOOL_SEARCH) !== !0
    )
      return;
    let eu: any = el.options?.toolDeferOverlay,
      ed: any = this.agentToolDeferOverlayCache?.get(eA),
      ep: any = AG.ToolDeferOverlay.merge(eu, ed),
      eg: any = [eu, ed],
      eh: any = await this.mcpManager.list(),
      ef: any = [];
    for (let eA of eh) {
      let el: any = eA.config;
      if (
        !0 === el.alwaysLoad ||
        "sdk" === el.type ||
        this.overlayMayExposeInlineMcpTool(eA.name, el, eg)
      ) {
        ef.push(eA.name);
        continue;
      }
      let ec: any = "tools" in el ? Object.keys(el.tools ?? {}) : [],
        eu: any = !1;
      for (let ed of ec) {
        let ec: any = this.getMcpPrewaitToolNameCandidates(eA.name, ed);
        if (
          !(await this.deferToolConfigService.isToolDeferLoadingWithOverlay(
            ep,
            el,
            ...ec,
          ))
        ) {
          eu = !0;
          break;
        }
      }
      if (!eu) {
        let ec: any = this.getMcpPrewaitToolNameCandidates(eA.name, A5);
        eu = !(await this.deferToolConfigService.isToolDeferLoadingWithOverlay(
          ep,
          el,
          ...ec,
        ));
      }
      eu && ef.push(eA.name);
    }
    return ef;
  }
  async runFirstSessionMcpPrewait(eA: any, el: any, ec: any): Promise<any> {
    let eu: any;
    if (ec?.aborted) return "aborted";
    let ed: any = this.runtime.now() + A8,
      ep: any = new AbortController(),
      eg: any = new Promise((eA: any) => {
        eu = eA;
      }),
      finishAtDeadline: any = () => {
        (ep.abort(), eu());
      },
      eh: any = this.runtime.setTimeout(finishAtDeadline, A8);
    ec?.addEventListener("abort", finishAtDeadline, { once: !0 });
    let ef: any = (async () => {
      let ec: any = await this.getFirstRunMcpPrewaitNames(eA, el);
      if (ep.signal.aborted || (void 0 !== ec && 0 === ec.length)) return;
      let eu: any = Math.max(0, ed - this.runtime.now());
      0 !== eu &&
        (this.mcpManager.waitForPendingServers
          ? await this.mcpManager.waitForPendingServers({
              ...(ec && { names: ec }),
              timeoutMs: eu,
              signal: ep.signal,
            })
          : await this.mcpManager.getConnectedServers({
              waitForSettle: !0,
              timeoutMs: eu,
              signal: ep.signal,
            }));
    })();
    try {
      return (
        await Promise.race([ef, eg]),
        ec?.aborted ? "aborted" : "completed"
      );
    } catch (el: any) {
      return (
        this.logger.warn(
          `[AgentManager.runFirstSessionMcpPrewait] failed for ${eA}: ${el}`,
        ),
        ec?.aborted ? "aborted" : "completed"
      );
    } finally {
      (this.runtime.clearTimeout(eh),
        ec?.removeEventListener("abort", finishAtDeadline));
    }
  }
  getMcpPrewaitToolNameCandidates(eA: any, el: any): any {
    return [el, `${eA}__${el}`, `mcp__${eA}__${el}`];
  }
  overlayMayExposeInlineMcpTool(eA: any, el: any, ec: any): any {
    let eu: any = new Set([
      ...("tools" in el ? Object.keys(el.tools ?? {}) : []),
      ...("builtin_tools" in el ? (el.builtin_tools ?? []) : []),
    ]);
    for (let el of ec) {
      for (let ec of el?.forceNoDefer?.exact ?? [])
        if (
          ec.startsWith(`mcp__${eA}__`) ||
          ec.startsWith(`${eA}__`) ||
          eu.has(ec)
        )
          return !0;
      for (let ec of el?.forceNoDefer?.glob ?? [])
        if (
          "*" === ec ||
          ec.startsWith("*") ||
          ec.startsWith(`mcp__${eA}__`) ||
          ec.startsWith(`${eA}__`) ||
          this.mcpGlobMayTargetServer(ec, eA) ||
          [...eu].some((eA: any) => this.matchesSimpleToolGlob(ec, eA))
        )
          return !0;
    }
    return !1;
  }
  mcpGlobMayTargetServer(eA: any, el: any): any {
    if (!eA.startsWith("mcp__")) return !1;
    let ec: any = eA.indexOf("__", 5);
    if (ec < 0) return eA.includes("*");
    let eu: any = eA.slice(5, ec);
    return this.matchesSimpleToolGlob(eu, el);
  }
  matchesSimpleToolGlob(eA: any, el: any): any {
    let ec: any = eA.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
    return RegExp(`^${ec}$`).test(el);
  }
  async rebuildAgents(eA: any = !1): Promise<any> {
    let el: any = this.runtime.now();
    if (this.rebuilding) {
      (this.logger.info(
        "[Startup] AgentManager.rebuildAgents: build already in progress, marking pending rebuild",
      ),
        (this.pendingRebuild = !0),
        this.pendingForceRebuild || (this.pendingForceRebuild = eA));
      return;
    }
    (this.logger.info("[Startup] AgentManager.rebuildAgents: START"),
      (this.rebuilding = !0),
      (this.lastRebuildFailure = void 0));
    try {
      await this.buildAgentsFromProductConfiguration(eA);
    } catch (eA: any) {
      ((this.lastRebuildFailure = { error: eA }),
        this.logger.error(`Failed to rebuild agents: ${eA}`));
    } finally {
      this.rebuilding = !1;
    }
    this._ready = !0;
    let ec: any = this.runtime.now() - el;
    if (
      (this.logger.info(
        `[Startup] AgentManager.rebuildAgents: completed in ${ec}ms, resolving readyDeferred`,
      ),
      this.readyDeferred.resolve(),
      this.modelsReadyDeferred &&
        !this.hasPlaceholderModels() &&
        (this.modelsReadyDeferred.resolve(),
        (this.modelsReadyDeferred = void 0)),
      this.pendingRebuild)
    ) {
      this.pendingRebuild = !1;
      let el: any = eA || this.pendingForceRebuild;
      return ((this.pendingForceRebuild = !1), this.rebuildAgents(el));
    }
    this.onDidRebuildSettledEmitter.fire();
  }
  hasPlaceholderModels(): any {
    if (0 === this.modelMap.size) return !0;
    for (let eA of this.modelMap.keys())
      if (!eA.startsWith("default-model")) return !1;
    return !0;
  }
  async buildAgentsFromProductConfiguration(eA: any = !1): Promise<any> {
    let el: any = this.cliProvider.parseOpts().opts,
      ec: any = !!(
        el.systemPrompt ||
        el.systemPromptFile ||
        el.appendSystemPrompt ||
        el.agents ||
        el.agent ||
        el.verbose
      ),
      {
        agents: ed = [],
        models: ep = [],
        skills: eg = [],
        commands: eh = [],
        tools: ef = [],
      } = await this.productManager.waitConfiguration(ec),
      em: any = AgentManagerImpl.buildSkillsFingerprint(eg),
      eE: any = eh
        .filter((eA: any) => eA.tags?.includes("custom"))
        .map((eA: any) => eA.name)
        .sort()
        .join(","),
      eC: any = ep
        .map((eA: any) => eA.id)
        .sort()
        .join(","),
      ey: any = this.buildAgentConfigFingerprint(ed),
      ew: any = await this.getPluginAgentFingerprint(),
      eB: any = `${ey}|${em}|${eE}|${ew}`,
      e_: any = `${eC}|${eB}`;
    if (
      (!eA && e_ === this.lastConfigHash && this._ready) ||
      (!eA &&
        this._ready &&
        ep.length > 0 &&
        this.modelMap.size > 0 &&
        0 ===
          ep
            .filter((eA: any) => !this.modelMap.has(eA.id))
            .map((eA: any) => eA.id).length &&
        eB === this.lastNonModelConfigHash)
    )
      return;
    let eI: any = eB !== this.lastNonModelConfigHash;
    ((this.lastConfigHash = e_),
      (this.lastNonModelConfigHash = eB),
      eI && this.toolManager.invalidatePluginDependentToolCaches());
    let ev: any = this.defaultAgentName;
    for (let eA of (this.clearPluginAgentRuntimeState(), ed))
      this.agentConfigMap.set(eA.name, eA);
    for (let eA of (this.modelMap.clear(), ep)) this.modelMap.set(eA.id, eA);
    !this._ready &&
      this.hasPlaceholderModels() &&
      (this.modelsReadyDeferred = new Av.Deferred());
    let eS: any = ed.filter((eA: any) => eA.tags?.includes(A_.CLI_AGENT_TAG));
    for (let eA of eS)
      eA.tags?.includes("default") && (this.defaultAgentName = eA.name);
    for (let eA of new Set([ev, this.defaultAgentName]))
      this.mcpSubagentToolManager.unregister(eA);
    let eQ: any = await this.applyPluginAgentSetting(eS);
    (await this.applySettingsAgent(eS),
      this.removePluginSettingAgentsFromStandaloneRegistry(eQ, eS));
    let eD: any = this.runtime.getProfiler();
    eD?.markStart("agent_build_permissions", "Agent Build - Permissions Load");
    let eT: any = (await this.settingsManager.get("permissions")) || {};
    eD?.markEnd("agent_build_permissions");
    let eR: any = {
      agents: eS,
      models: ep,
      skills: eg,
      commands: eh,
      tools: ef,
    };
    (this.logger.info(
      `[AgentManager] runtime cli agent view ready: ${eS.length} agents (used for registration and Agent tool descriptions)`,
    ),
      eD?.markStart("agent_build_register", "Agent Build - Agent Registration"),
      await Promise.all(
        eS.map((eA: any) => this.registerAgent(eA, !1, eT, eR)),
      ),
      eD?.markEnd("agent_build_register"));
  }
  clearPluginAgentRuntimeState(): any {
    for (let [eA, el] of (this.agentsWithPatchedTools.clear(),
    this.agentConfigMap))
      el.tags?.includes(A_.PLUGIN_AGENT_TAG) &&
        (this.agentConfigMap.delete(eA),
        this.agentMap.delete(eA),
        this.mcpSubagentToolManager.unregister(eA));
  }
  async registerAgent(
    eA: any,
    el: any = !1,
    ec: any,
    eu: any,
    ed: any = {},
  ): Promise<any> {
    let ep: any = [],
      eg: any = [];
    for (let eh of eA.handoffs ?? []) {
      let ef: any = this.agentConfigMap.get(eh);
      if (ef) {
        let eh: any = eA.name === this.defaultAgentName,
          em: any = await this.registerAgent(ef, eh || el, ec, eu, ed);
        if (!0 === ef.asTool) {
          eg.push(em.asTool({ toolDescription: em.handoffDescription }));
          continue;
        }
        ep.push(
          (0, AD.handoff)(em, {
            onHandoff: (eA: any, el: any) => {
              el && (em.prompt = el.prompt);
            },
            inputType: this.parseParametersToZod(ef.parameters),
            inputFilter: (eA: any) => {
              try {
                if ("string" == typeof em.prompt && em.prompt)
                  return {
                    runContext: eA.runContext,
                    inputHistory: em.prompt,
                    preHandoffItems: eA.preHandoffItems,
                    newItems: [],
                  };
              } finally {
                em.prompt = void 0;
              }
              return { ...eA };
            },
          }),
        );
      }
    }
    let eh: any = eA.handoffDescription
        ? await this.promptRenderer.render(eA.handoffDescription)
        : void 0,
      ef: any = eA.tags?.includes(A_.CUSTOM_AGENT_TAG),
      em: any = A_.AGENTS_WITH_MCP_ACCESS.has(eA.name),
      eE: any = void 0 !== eA.tools,
      eC: any = ["Agent"],
      ey: any = eA.tools ?? (await this.getDefaultAgentTools()),
      ew: any = ef && !eA.tools ? ey.filter((eA: any) => !eC.includes(eA)) : ey;
    (this.maybeInjectSendMessage(eA.name, ew),
      this.maybeInjectExitPlanMode(eA.name, ew));
    let eB: any = (eA.tools ?? []).filter((eA: any) => eA.startsWith("mcp__")),
      e_: any = eB.length > 0,
      eI: any = ef ? !eE || e_ : eA.name === this.defaultAgentName || el || em,
      ev: any = eI
        ? ef && e_
          ? await this.buildMcpServersForTools(eB)
          : await this.buildMcpServers()
        : [],
      eS: any = {
        name: eA.name,
        instructions: async () => {
          let el: any;
          if (eA.name === this.defaultAgentName) {
            let {
              cliDescriptionContent: ec,
              outputStyleContent: eu,
              keepCodingInstructions: ed,
            } = await this.getCliDescriptionAndOutputStyle();
            return ((el = await this.renderDefaultAgentInstructions(eA, {
              cliDescription: ec,
              outputStyle: eu,
              keepCodingInstructions: ed,
            })),
            eA.appendInstructions)
              ? el + "\n\n" + eA.appendInstructions
              : el;
          }
          return await this.promptRenderer.render(eA.instructions ?? "");
        },
        tools: [...(await this.buildTools(ew, eA, ec, eu)), ...eg],
        mcpServers: ev,
        handoffDescription: eh,
        handoffs: ep,
      },
      eQ: any = await this.factory.create(eS);
    return (
      this.logger.info(
        `[MCP][registerAgent] agent=${eA.name} mcpServers=[${ev.map((eA: any) => eA.name).join(",")}] (count=${ev.length}) grantMcpAccess=${eI}`,
      ),
      ef && e_ && this.mcpSubagentToolManager.register(eA.name, eB),
      ed.skipMapRegistration ||
        (this.agentMap.set(eA.name, eQ),
        this.managedAgentInstances ??
          (this.managedAgentInstances = new WeakSet()),
        this.managedAgentInstances.add(eQ)),
      eQ
    );
  }
  parseParametersToZod(eA: any): any {
    if (eA)
      try {
        return "string" == typeof eA ? JSON.parse(eA) : eA;
      } catch (eA: any) {
        this.logger.warn(`Failed to parse parameters to Zod schema: ${eA}`);
        return;
      }
  }
  async buildTools(eA: any, el: any, ec?: any, eu?: any): Promise<any> {
    eA = this.normalizeAgentToolSpecs(eA, el.name);
    let ed: any = ec ?? ((await this.settingsManager.get("permissions")) || {}),
      ep: any = new Set(AH.PermissionUtils.extractWholeToolRules(ed.deny)),
      eg: any = eA.some((eA: any) => eA === Aj.ToolNames.TOOL_SEARCH),
      eh: any = !1;
    try {
      eh = this.runtime.hasDelegateTools();
    } catch {}
    let ef: any = eA.filter((eA: any) =>
      ep.has(eA.toLowerCase())
        ? (this.logger.debug(`Tool ${eA} filtered by permissions.deny`), !1)
        : eA !== Aj.ToolNames.DELEGATE_TOOL ||
          !!eh ||
          (this.logger.debug(
            "DelegateTool filtered: no delegate tools registered",
          ),
          !1),
    );
    return (
      await Promise.all(
        ef.map(async (eA: any) => {
          let ec: any = await this.toolManager.get(eA, el, eu);
          if (ec) {
            let eA: any = { ...ec };
            !eg && eA.defer_loading && (eA.defer_loading = !1);
            let el: any = eA.isEnabled;
            return (
              (eA.isEnabled = await this.createIsEnabledChecker(eA, el)),
              (0, AB.tool)(eA)
            );
          }
        }),
      )
    ).filter((eA: any) => void 0 !== eA);
  }
  normalizeAgentToolSpecs(eA: any, el: any): any {
    if (!eA || 0 === eA.length)
      return (
        el &&
          this.agentToolDeferOverlayCache.set(el, {
            forceDefer: { exact: [], glob: [] },
            forceNoDefer: { exact: [], glob: [] },
          }),
        eA
      );
    let ec: any = (0, AG.parseToolSpecs)(eA, { lenient: !0 });
    for (let eA of ec.warnings)
      this.logger.warn(
        `[AgentToolSpec] ${el ?? "(anon)"}: ${eA.code} — ${eA.message}`,
      );
    let eu: any = (0, AG.augmentParsedSpecsForDefer)(ec);
    return (
      el && this.agentToolDeferOverlayCache.set(el, eu.overlay),
      eu.names
    );
  }
  async createIsEnabledChecker(eA: any, el: any): Promise<any> {
    let ec: any = !0 === eA.defer_loading,
      eu: any = await this.deferToolConfigService.isGlobalDeferLoadingEnabled(),
      ed: any = eA.name,
      ep: any = eA.aliases || [],
      eg: any = this.deferToolConfigService,
      eh: any = this.agentToolDeferOverlayCache;
    return async (eA: any) => {
      let ef: any = AG.ToolDeferOverlay.merge(
        eA.runContext.context.options?.toolDeferOverlay,
        eh.get(eA.agent?.name),
      );
      if (
        (eg.isBuiltinToolDeferLoading(ed, ec, ef) &&
          eu &&
          !0 !== eA.runContext.skipActivationCheck) ||
        (void 0 !== el && !1 === ("function" == typeof el ? await el(eA) : el))
      )
        return !1;
      let em: any = eA.runContext.context,
        eE: any = em.options?.tools;
      if (void 0 !== eE && "default" !== eE) {
        let eA: any = eE
          .split(",")
          .map((eA: any) => eA.trim())
          .filter(Boolean);
        if (
          0 === eA.length ||
          0 === AH.PermissionUtils.matchPermissionRules(eA, [ed]).length
        )
          return !1;
      }
      return (
        !(
          this.isToolDisallowed(em, ed, ep) ||
          (em.permissionModeSubject?.value === AL.PermissionMode.Delegate &&
            !A2.has(ed)) ||
          ((ed === Aj.ToolNames.ENTER_PLAN_MODE ||
            ed === Aj.ToolNames.EXIT_PLAN_MODE) &&
            this.runtime.planGates.isPlanModeDisabled())
        ) &&
        (ed !== Aj.ToolNames.EXIT_PLAN_MODE ||
          !!this.runtime.planGates.isExitPlanModeVisibleForSession(em))
      );
    };
  }
  maybeInjectSendMessage(eA: any, el: any): any {
    !A_.INTERNAL_GENERATOR_AGENTS.has(eA) &&
      (el.includes(Aj.ToolNames.SEND_MESSAGE) ||
        el.push(Aj.ToolNames.SEND_MESSAGE));
  }
  maybeInjectExitPlanMode(eA: any, el: any): any {
    eA === this.defaultAgentName ||
      (!A_.INTERNAL_GENERATOR_AGENTS.has(eA) &&
        (el.includes(Aj.ToolNames.EXIT_PLAN_MODE) ||
          el.push(Aj.ToolNames.EXIT_PLAN_MODE)));
  }
  isToolDisallowed(eA: any, el: any, ec: any): any {
    let eu: any = eA.options?.disallowedTools || [];
    if (0 === eu.length) return !1;
    let ed: any = [el, ...ec].map((eA: any) => eA.toLowerCase());
    return AH.PermissionUtils.matchPermissionRules(eu, ed).some(
      (eA: any) => "*" === eA.rule,
    );
  }
  async buildMcpServers(): Promise<any> {
    let eA: any = this.runtime.now();
    (await this.mcpReadyService.waitForServersReady(),
      await this.mcpManager.list());
    let el: any = this.runtime.now() - eA,
      ec: any = this.runtime.now(),
      eu: any = await this.mcpManager.getConnectedServers({
        waitForSettle: !1,
      }),
      ed: any = this.runtime.now() - ec;
    return (
      (el > 0 || ed > 0) &&
        this.logger.info(
          `[MCP][buildMcpServers] wait breakdown: waitForServersReady=${el}ms getConnectedServers=${ed}ms`,
        ),
      this.logger.info(
        `[MCP][buildMcpServers] connected servers=[${eu.map((eA: any) => eA.name).join(",")}] (count=${eu.length})`,
      ),
      eu
    );
  }
  async buildMcpServersForTools(eA: any): Promise<any> {
    let el: any = await this.mcpManager.getConnectedServers(),
      ec: any = new Set();
    for (let el of eA)
      try {
        let { serverName: eA } = this.parseMcpToolName(el),
          eu: any = eA.replace(/[^a-zA-Z0-9]/g, "_");
        ec.add(eu);
      } catch (eA: any) {
        this.logger.warn(`Invalid MCP tool name: ${el}`);
      }
    return new Proxy(el, {
      get(eA: any, el: any): any {
        let eu: any = eA.filter((eA: any) => {
          let el: any = eA.name.replace(/[^a-zA-Z0-9]/g, "_");
          return ec.has(el);
        });
        return Reflect.get(eu, el, eu);
      },
    });
  }
  parseMcpToolName(eA: any): any {
    let el: any = eA.match(/^mcp__(.+?)__(.+)$/);
    if (!el) throw Error(`Invalid MCP tool name format: ${eA}`);
    let [, ec, eu] = el;
    return { serverName: ec, toolName: eu };
  }
  async getDefaultAgentTools(): Promise<any> {
    let eA: any = Array.from(this.agentConfigMap.values()).find((eA: any) =>
      eA.tags?.includes("default"),
    );
    return eA?.tools ?? [];
  }
  async getAll(): Promise<any> {
    return Array.from(this.agentMap.values());
  }
  async getCommands(eA: any): Promise<any> {
    let el: any = this.agentConfigMap.get(eA),
      ec: any = [];
    if (el?.commands)
      for (let eA of el.commands) {
        let el: any = await this.commandManager.get(`/${eA}`);
        el && ec.push(el);
      }
    return (
      eA === this.defaultAgentName &&
        (ec.push(...(await this.commandManager.getCustomCommands())),
        ec.push(...(await this.commandManager.getMcpCommands()))),
      ec
    );
  }
  findModelByIdOrName(eA: any): any {
    let el: any = this.modelMap.get(eA);
    if (el) return el;
    for (let el of this.modelMap.values()) if (el.name === eA) return el;
    for (let el of this.modelMap.values())
      if (el.aliases?.includes(eA)) return el;
  }
  shouldInheritDefaultAgentSelection(eA: any): any {
    if (!eA) return !1;
    let el: any = eA.models ?? [];
    return (
      0 === el.length ||
      !el.some((eA: any) => {
        let el: any = this.findModelByIdOrName(eA);
        if (!el) return !0;
        let ec: any = el.tags ?? [];
        return !(
          ec.includes("custom") ||
          el.id.startsWith("custom:") ||
          ec.includes("chat")
        );
      })
    );
  }
  async getModels(eA: any): Promise<any> {
    (await this.readyDeferred.promise,
      this.modelsReadyDeferred && (await this.modelsReadyDeferred.promise));
    let el: any = [],
      ec: any = this.agentConfigMap.get(eA);
    if (!ec) return el;
    let eu: any = new Set();
    if (
      eA !== this.defaultAgentName &&
      !(ec.models ?? []).some((eA: any) => {
        let el: any = this.findModelByIdOrName(eA);
        if (!el) return !0;
        let ec: any = el.tags ?? [];
        return !(
          ec.includes("custom") ||
          el.id.startsWith("custom:") ||
          ec.includes("chat")
        );
      })
    )
      return (
        this.logger.info(
          `[AgentManager.getModels] Agent "${eA}" has no originally declared models (only auto-appended custom/chat models), inheriting from default agent "${this.defaultAgentName}"`,
        ),
        this.getModels(this.defaultAgentName)
      );
    for (let eA of ec.models ?? []) {
      let ec: any = this.findModelByIdOrName(eA);
      ec && !eu.has(ec.id) && (el.push(ec), eu.add(ec.id));
    }
    if (eA !== this.defaultAgentName && 0 === el.length) return [];
    for (let eA of this.modelMap.values())
      if (!eu.has(eA.id)) {
        let ec: any = eA.tags?.includes("custom"),
          ed: any = eA.id.startsWith("custom:"),
          ep: any = eA.tags?.includes("chat");
        (ec || ed || ep) && (el.push(eA), eu.add(eA.id));
      }
    return el;
  }
  async getModel(eA: any): Promise<any> {
    let el: any;
    (this.logger.debug(
      `[Startup] AgentManager.getModel(${eA}): waiting for readyDeferred...`,
    ),
      await this.readyDeferred.promise,
      this.modelsReadyDeferred &&
        (this.logger.debug(
          `[Startup] AgentManager.getModel(${eA}): waiting for modelsReadyDeferred...`,
        ),
        await this.modelsReadyDeferred.promise,
        this.logger.debug(
          `[Startup] AgentManager.getModel(${eA}): modelsReadyDeferred resolved`,
        )));
    let ec: any = this.agentConfigMap.get(eA),
      eu: any = ec?.models?.[0];
    if (eu && (0, AQ.isModelVariantType)(eu)) {
      let eA: any = await this.getModel(this.defaultAgentName);
      return this.getRelatedModel(eA.id, eu);
    }
    eA === this.defaultAgentName
      ? (el =
          this.runtime.env.CODEBUDDY_MODEL ||
          (await this.settingsManager.get("model")))
      : this.shouldInheritDefaultAgentSelection(ec) &&
        (el =
          this.runtime.env.CODEBUDDY_MODEL ||
          (await this.settingsManager.get("model")));
    let ed: any = await this.getModels(eA);
    if (el) {
      let ec: any = ed.find(
        (eA: any) => eA.id === el || eA.name === el || eA.aliases?.includes(el),
      );
      if (ec?.disabled) {
        if (eA !== this.defaultAgentName)
          return (
            this.logger.warn(
              `[AgentManager.getModel] requested model '${el}' is disabled for agent '${eA}'; falling back to primary model.`,
            ),
            this.getModel(this.defaultAgentName)
          );
        let ec: any = ed.find((eA: any) => !eA.disabled);
        ec &&
          (this.logger.warn(
            `[AgentManager.getModel] agent='${eA}' requested model '${el}' is disabled; switching to first-enabled='${ec.id}'.`,
          ),
          (el = ec.id));
      } else
        ec ||
          this.logger.debug(
            `[AgentManager.getModel] requested model '${el}' not in agent '${eA}' available models list; trusting user selection.`,
          );
    } else {
      let ec: any = ed.find((eA: any) => !eA.disabled);
      ((el = ec?.id || ed?.[0]?.id),
        this.logger.info(
          `[AgentManager.getModel] agent='${eA}' has no explicit model (auto); resolved to first-available='${el}'`,
        ));
    }
    if (el) {
      let ec: any = this.findModelByIdOrName(el);
      return (
        ec ||
          eA === this.defaultAgentName ||
          (ec = await this.getModel(this.defaultAgentName)),
        ec || (ec = { id: el, name: el }),
        ec
      );
    }
    if (eA !== this.defaultAgentName)
      return this.getModel(this.defaultAgentName);
    throw Error(`model not found for agent ${eA}`);
  }
  async getRelatedModel(eA: any, el: any): Promise<any> {
    await this.readyDeferred.promise;
    let ec: any = this.getModelIdFromEnv(el);
    if (ec) {
      let eA: any = this.findModelByIdOrName(ec);
      return eA
        ? (this.logger.debug(`Using env variable model for ${el}: ${eA.id}`),
          eA)
        : (this.logger.debug(
            `Using env variable model (not in modelMap) for ${el}: ${ec}`,
          ),
          { id: ec, name: ec });
    }
    let eu: any = this.modelMap.get(eA);
    if (!eu)
      return (
        this.logger.warn(
          `Primary model not found: ${eA}, returning fallback model`,
        ),
        { id: eA, name: eA }
      );
    let ed: any = eu.relatedModels?.[el];
    if (ed) {
      let eA: any = this.modelMap.get(ed);
      if (eA)
        return (
          this.logger.debug(
            `Using model-specific related model for ${el}: ${eA.id}`,
          ),
          eA
        );
      this.logger.warn(
        `Model-specific related model not found: ${ed}, falling back to defaults`,
      );
    }
    if (this.isCustomOrExternalModel(eu))
      return (
        this.logger.debug(
          `Custom/external model detected, skipping defaultRelatedModels for ${el}, using primary model: ${eu.id}`,
        ),
        eu
      );
    let { defaultRelatedModels: ep } =
        await this.productManager.waitConfiguration(),
      eg: any = ep?.[el];
    if (eg) {
      let eA: any = this.modelMap.get(eg);
      if (eA)
        return (
          this.logger.debug(`Using default related model for ${el}: ${eA.id}`),
          eA
        );
      this.logger.warn(
        `Default related model not found: ${eg}, using primary model`,
      );
    }
    return (
      this.logger.debug(
        `No related model found for ${el}, using primary model: ${eu.id}`,
      ),
      eu
    );
  }
  isCustomOrExternalModel(eA: any): any {
    return !!(eA.tags?.includes("custom") || eA.id.startsWith("custom:"));
  }
  getModelIdFromEnv(eA: any): any {
    switch (eA) {
      case "lite":
        return this.runtime.env.CODEBUDDY_SMALL_FAST_MODEL;
      case "reasoning":
        return this.runtime.env.CODEBUDDY_BIG_SLOW_MODEL;
      default:
        return;
    }
  }
  async resolveModel(eA: any): Promise<any> {
    if (
      (await this.readyDeferred.promise,
      this.modelsReadyDeferred && (await this.modelsReadyDeferred.promise),
      (0, AQ.isModelVariantType)(eA))
    ) {
      let el: any = await this.getPrimaryModel();
      return this.getRelatedModel(el.id, eA);
    }
    return this.findModelByIdOrName(eA);
  }
  async resolveConfiguredModelOrFallback(eA: any, el: any): Promise<any> {
    let ec: any = eA?.trim();
    if (!ec) return;
    let eu: any = await this.resolveModel(ec);
    if (eu && !eu.disabled) return eu.id;
    let ed: any = eu?.disabled ? "disabled" : "not found";
    this.logger.warn(
      `[AgentManager] configured model '${ec}' (${el}) ${ed}; inheriting main conversation model.`,
    );
  }
  async renderDefaultAgentInstructions(eA: any, el: any): Promise<any> {
    let ec: any = this.hasPluginAgentPromptPlaceholder(eA.instructions)
      ? await this.renderPluginAgentPrompt(eA)
      : void 0;
    return this.promptRenderer.render(eA.instructions ?? "", {
      ...el,
      ...(void 0 !== ec ? { [A3]: ec } : {}),
    });
  }
  async renderPluginAgentPrompt(eA: any): Promise<any> {
    let el: any = eA.pluginAgentPromptTemplate;
    if (el) return this.promptRenderer.render(el);
  }
  hasPluginAgentPromptPlaceholder(eA: any): any {
    return !!eA && A4.test(eA);
  }
  async getCliDescriptionAndOutputStyle(): Promise<any> {
    let eA: any = {};
    try {
      let el: any,
        ec: any = this.cliProvider.parseOpts(),
        eu: any = ec.opts.outputStyle?.toLowerCase();
      if (eu && eu !== A_.OutputStyleType.DEFAULT)
        ((el = eu), this.logger.info(`Using output style from CLI: ${el}`));
      else {
        let eA: any = await this.settingsManager.get("outputStyle");
        eA
          ? ((el = eA.toLowerCase()),
            this.logger.info(`Using output style from settings: ${el}`))
          : (el = A_.OutputStyleType.DEFAULT);
      }
      if (el === A_.OutputStyleType.DEFAULT) return eA;
      let ed: any = await this.outputStyleManager.getOutputStyleByName(el);
      ed &&
        ed.name.toLowerCase() !== A_.OutputStyleType.DEFAULT &&
        ed.content &&
        ((eA.outputStyleContent = ed.content),
        (eA.keepCodingInstructions = ed.keepCodingInstructions),
        (eA.cliDescriptionContent = await this.promptRenderer.render(
          A_.CLI_OUTPUT_STYLE_DESCRIPTION_TEMPLATE,
        )),
        this.logger.info(`Applied output style: ${ed.name}`));
    } catch (eA: any) {
      this.logger.error(
        `Failed to get cli description and output style: ${eA instanceof Error ? eA.message : eA}`,
      );
    }
    return eA;
  }
  async applyPluginAgentSetting(eA: any): Promise<any> {
    let el: any = new Set();
    if (!this.pluginManager) return el;
    try {
      let ec: any = await this.pluginManager.getActivePlugins(),
        eu: any = ec.map(({ plugin: eA }: any) => eA);
      for (let { agentName: eA } of ec.map(
        ({ plugin: eA, components: el }: any) => ({
          plugin: eA,
          agentName: this.getPluginAgentSetting(el),
        }),
      ))
        eA && eA !== this.defaultAgentName && el.add(eA);
      let ed: any = !!this.normalizePluginAgentSetting(
          this.volatilePluginAgentName,
        ),
        ep: any =
          !!ed &&
          (await this.applyReplacePluginAgentBaseBeforeVolatile(eA, ec)),
        eg: any = this.parseVolatilePluginSource(
          this.volatilePluginSourcePluginId,
        ),
        eh: any = this.normalizePluginAgentSetting(
          this.volatilePluginAgentName,
        );
      if (!eh)
        for (let eA of eu) {
          let el: any = ec.find((el: any) => el.plugin === eA),
            eu: any = this.getPluginAgentSetting(el?.components);
          eu &&
            ((eg = { name: eA.name, marketplaceName: eA.marketplaceName }),
            (eh = eu));
        }
      if (!eh) return el;
      await this.registerPluginAgents(eg, eA, ec);
      let ef: any = eh,
        em: any = eA.find((eA: any) => eA.name === ef);
      if (!em)
        for (let eA of eg
          ? [eg]
          : eu.map((eA: any) => ({
              name: eA.name,
              marketplaceName: eA.marketplaceName,
            })))
          try {
            let el: any = ec.find(
                (el: any) =>
                  el.plugin.name === eA.name &&
                  el.plugin.marketplaceName === eA.marketplaceName,
              ),
              eu: any = el?.components.agents?.find(
                (eA: any) => eA.name === ef,
              );
            if (eu) {
              ((em = eu), (eg = eA));
              break;
            }
          } catch {}
      if (!em)
        return (
          this.logger.info(
            `Plugin settings.agent: "${ef}" not found in available or plugin agents. Ignoring.`,
          ),
          el
        );
      if (ef === this.defaultAgentName) return el;
      let eE: any = eA.find((eA: any) => eA.name === this.defaultAgentName);
      if (!eE)
        return (
          this.logger.warn(
            "Plugin settings.agent: default agent config not found, cannot apply",
          ),
          el
        );
      let eC: any = this.runtime.composePluginAgent({
        agentConfig: em,
        matchedPlugin: eg,
        enabledPlugins: eu,
        logger: this.logger,
      });
      if (!eC) return el;
      let ey: any = eC.instructions || eC.prompt,
        ew: any = ed,
        eB: any = this.hasPluginAgentPromptPlaceholder(eE.instructions),
        e_: any =
          ey && !eB
            ? [eE.instructions, A6].filter(Boolean).join("\n\n")
            : eE.instructions,
        eI: any = ey || eE.instructions,
        ev: any = ew ? e_ : eI,
        eS: any = ep && ed,
        eQ: any = {
          ...eE,
          instructions: ev,
          ...(ew && ey ? { pluginAgentPromptTemplate: ey } : {}),
          description:
            eS || !ew ? eE.description : eC.description || eE.description,
          tools: eS ? eE.tools : eC.tools?.length ? eC.tools : eE.tools,
        };
      ((ew && ey) || delete eQ.pluginAgentPromptTemplate,
        eS ||
          this.syncDefaultAgentMcpToolWhitelist(
            eQ.tools,
            "plugin-settings-agent",
          ));
      let eD: any = eA.indexOf(eE);
      (eD >= 0 && (eA[eD] = eQ),
        this.agentConfigMap.set(this.defaultAgentName, eQ),
        this.agentsWithPatchedTools.add(this.defaultAgentName));
      let eT: any = this.volatilePluginAgentName
        ? "volatile override"
        : "plugin settings.agent";
      return (
        this.logger.info(
          `${eT}: applied "${ef}" config onto default agent "${this.defaultAgentName}"`,
        ),
        el
      );
    } catch (eA: any) {
      return (
        this.logger.debug(
          `Failed to apply plugin agent setting: ${eA instanceof Error ? eA.message : String(eA)}`,
        ),
        el
      );
    }
  }
  async applyReplacePluginAgentBaseBeforeVolatile(
    eA: any,
    el: any,
  ): Promise<any> {
    let ec: any, eu: any;
    if (!this.pluginManager) return !1;
    for (let eA of el) {
      let el: any = this.getPluginAgentSetting(eA.components);
      el && ((ec = eA), (eu = el));
    }
    if (!ec || !eu) return !1;
    let ed: any = {
      name: ec.plugin.name,
      marketplaceName: ec.plugin.marketplaceName,
    };
    await this.registerPluginAgents(ed, eA, el);
    let ep: any = eA.find((eA: any) => eA.name === eu);
    if (
      (ep || (ep = ec.components.agents?.find((eA: any) => eA.name === eu)),
      !ep || eu === this.defaultAgentName)
    )
      return !1;
    let eg: any = eA.find((eA: any) => eA.name === this.defaultAgentName);
    if (!eg) return !1;
    let eh: any = this.runtime.composePluginAgent({
      agentConfig: ep,
      matchedPlugin: ed,
      enabledPlugins: el.map(({ plugin: eA }: any) => eA),
      logger: this.logger,
    });
    if (!eh) return !1;
    let ef: any = eh.instructions || eh.prompt;
    if (!ef) return !1;
    let em: any = {
      ...eg,
      instructions: ef,
      description: eg.description,
      tools: eh.tools?.length ? eh.tools : eg.tools,
    };
    (delete em.pluginAgentPromptTemplate,
      this.syncDefaultAgentMcpToolWhitelist(
        em.tools,
        "replace-plugin-agent-base-before-volatile",
      ));
    let eE: any = eA.indexOf(eg);
    return (
      eE >= 0 && (eA[eE] = em),
      this.agentConfigMap.set(this.defaultAgentName, em),
      this.agentsWithPatchedTools.add(this.defaultAgentName),
      this.logger.info(
        `replace plugin agent base: applied "${eu}" config before volatile plugin agent`,
      ),
      !0
    );
  }
  syncDefaultAgentMcpToolWhitelist(eA: any, el: any): any {
    let ec: any = this.normalizeMcpWhitelistToolNames(eA ?? [], el);
    if (0 === ec.length) {
      (this.mcpSubagentToolManager.unregister(this.defaultAgentName),
        this.logger.info(
          `[PluginAgentCompose] default agent MCP tool whitelist cleared agent=${this.defaultAgentName} reason=${el}`,
        ));
      return;
    }
    (this.mcpSubagentToolManager.register(this.defaultAgentName, ec),
      this.logger.info(
        `[PluginAgentCompose] default agent MCP tool whitelist synced agent=${this.defaultAgentName} reason=${el} count=${ec.length}`,
      ));
  }
  normalizeMcpWhitelistToolNames(eA: any, el: any): any {
    if (0 === eA.length) return [];
    let ec: any = (0, AG.parseToolSpecs)(eA, { lenient: !0 });
    for (let eA of ec.warnings)
      this.logger.warn(
        `[AgentToolSpec] ${this.defaultAgentName} MCP whitelist (${el}): ${eA.code} — ${eA.message}`,
      );
    return (0, AG.augmentParsedSpecsForDefer)(ec).names;
  }
  async registerPluginAgents(eA: any, el: any, ec: any): Promise<any> {
    if (this.pluginManager && eA)
      try {
        let eu: any = ec.find(
            (el: any) =>
              el.plugin.name === eA.name &&
              el.plugin.marketplaceName === eA.marketplaceName,
          ),
          ed: any = eu?.components.agents ?? [];
        if (0 === ed.length) return;
        for (let eA of ed) {
          let ec: any = eA,
            eu: any = ec?.name;
          if (eu && !this.agentConfigMap.has(eu))
            try {
              (this.agentConfigMap.set(eu, ec), el.push(ec));
            } catch (eA: any) {
              this.logger.warn(
                `[AgentManager] failed to register plugin agent "${eu}": ${eA instanceof Error ? eA.message : String(eA)}`,
              );
            }
        }
      } catch (eA: any) {
        this.logger.debug(
          `Failed to register plugin agents: ${eA instanceof Error ? eA.message : String(eA)}`,
        );
      }
  }
  removePluginSettingAgentsFromStandaloneRegistry(eA: any, el: any): any {
    if (0 !== eA.size) {
      for (let ec: any = el.length - 1; ec >= 0; ec--) {
        let eu: any = el[ec].name;
        eu !== this.defaultAgentName && eA.has(eu) && el.splice(ec, 1);
      }
      for (let el of eA)
        el !== this.defaultAgentName &&
          (this.agentConfigMap.delete(el), this.agentMap.delete(el));
    }
  }
  async applySettingsAgent(eA: any): Promise<any> {
    try {
      let el: any =
          this.cliProvider.parseOpts().opts.agent ||
          (await this.settingsManager.get("agent")),
        ec: any = "string" == typeof el ? el : void 0;
      if (!ec) {
        this.settingsAgentName = void 0;
        return;
      }
      let eu: any =
        eA.find((eA: any) => eA.name === ec) || this.agentConfigMap.get(ec);
      if (!eu)
        return void this.logger.warn(
          `Settings agent: "${ec}" not found in available agents. Available: ${eA.map((eA: any) => eA.name).join(", ")}. Ignoring.`,
        );
      let ed: any = eA.find((eA: any) => eA.name === this.defaultAgentName);
      if (!ed)
        return void this.logger.warn(
          "Settings agent: default agent config not found, cannot apply",
        );
      if (ec === this.defaultAgentName) {
        this.settingsAgentName = void 0;
        return;
      }
      let ep: any = {
        ...ed,
        instructions: eu.instructions || ed.instructions,
        description: eu.description || ed.description,
        tools: eu.tools?.length ? eu.tools : ed.tools,
      };
      delete ep.pluginAgentPromptTemplate;
      let eg: any = eA.indexOf(ed);
      (eg >= 0 && (eA[eg] = ep),
        this.agentConfigMap.set(this.defaultAgentName, ep),
        this.agentsWithPatchedTools.add(this.defaultAgentName),
        (this.settingsAgentName = ec),
        this.logger.info(
          `Settings agent: applied "${ec}" config (instructions/tools) onto default agent "${this.defaultAgentName}"`,
        ));
    } catch (eA: any) {
      this.logger.warn(
        `Failed to apply settings agent: ${eA instanceof Error ? eA.message : String(eA)}`,
      );
    }
  }
  async refreshAgents(): Promise<any> {
    if (
      (await this.rebuildAgents(!0),
      await this.waitForRebuildSettled(0),
      this.lastRebuildFailure)
    )
      throw this.lastRebuildFailure.error;
  }
  async waitForRebuildSettled(eA: any = 3e3): Promise<any> {
    (this.rebuilding || this.pendingRebuild) &&
      (await new Promise((el: any) => {
        let ec: any,
          eu: any = !1,
          ed: any = this.onDidRebuildSettledEmitter.event(() => {
            eu ||
              ((eu = !0),
              ec && this.runtime.clearTimeout(ec),
              ed.dispose(),
              el());
          });
        eA > 0 &&
          (ec = this.runtime.setTimeout(() => {
            eu ||
              ((eu = !0),
              ed.dispose(),
              this.logger.warn(
                `[AgentManager.waitForRebuildSettled] timeout after ${eA}ms (rebuilding=${this.rebuilding}, pendingRebuild=${this.pendingRebuild})`,
              ),
              el());
          }, eA));
      }));
  }
  getInstructionFingerprint(eA: any): any {
    return eA ? `${eA.length}:${eA.slice(0, 32)}` : "";
  }
  buildAgentConfigFingerprint(eA: any): any {
    return eA
      .map((eA: any) =>
        [
          eA.name,
          this.getInstructionFingerprint(eA.instructions),
          this.getInstructionFingerprint(eA.appendInstructions),
          this.getInstructionFingerprint(eA.pluginAgentPromptTemplate),
          eA.description ?? "",
          (eA.tools ?? []).slice().sort().join("|"),
          (eA.disallowedTools ?? []).slice().sort().join("|"),
          (eA.models ?? []).join("|"),
          (eA.skills ?? []).slice().sort().join("|"),
        ].join(":"),
      )
      .sort()
      .join(",");
  }
  static buildSkillsFingerprint(eA: any): any {
    return eA
      .map(
        (eA: any) =>
          `${eA.name}:${+!!eA.disableModelInvocation}:${+(!1 === eA.userInvocable)}:${eA.description ? `${eA.description.length}:${eA.description.slice(0, 32)}` : ""}:${eA.displayName ?? ""}`,
      )
      .sort()
      .join(",");
  }
  normalizePluginAgentSetting(eA: any): any {
    if ("string" == typeof eA) return eA;
  }
  normalizePluginRequestHeaders(eA: any): any {
    if (!eA || "object" != typeof eA || Array.isArray(eA)) return;
    let el: any = Object.entries(eA)
      .filter(([eA, el]: any) => "" !== eA.trim() && "string" == typeof el)
      .map(([eA, el]: any) => [eA.trim(), el])
      .sort(([eA]: any, [el]: any) => eA.localeCompare(el));
    if (0 === el.length) return;
    let ec: any = {};
    for (let [eA, eu] of el) ec[eA] = eu;
    return ec;
  }
  stringifyPluginRequestHeaders(eA: any): any {
    return eA ? JSON.stringify(eA) : "";
  }
  parseVolatilePluginSource(eA: any): any {
    if (!eA) return;
    let el: any = eA.indexOf("@");
    if (!(el <= 0) && el !== eA.length - 1)
      return { name: eA.slice(0, el), marketplaceName: eA.slice(el + 1) };
  }
  getPluginAgentSetting(eA: any): any {
    return this.normalizePluginAgentSetting(eA?.settings?.agent);
  }
  async getPluginAgentFingerprint(): Promise<any> {
    let eA: any = this.normalizePluginAgentSetting(
      this.volatilePluginAgentName,
    );
    if (eA) {
      let el: any = this.volatilePluginSourcePluginId || "_",
        ec: any = this.stringifyPluginRequestHeaders(
          this.volatilePluginInternalModelRequestHeaders,
        );
      return `volatile:${el}:${eA}:${ec}`;
    }
    if (!this.pluginManager) return "";
    try {
      let eA: any = await this.pluginManager.getActivePlugins(),
        el: any = [];
      for (let { plugin: ec, components: eu } of eA) {
        let eA: any = this.getPluginAgentSetting(eu);
        eA && el.push(`${ec.name}@${ec.marketplaceName}:${eA}`);
      }
      return el.sort().join(",");
    } catch {
      return "";
    }
  }
}
