import { tool, type RunContext, type Tool } from "@openai/agents";
import type { ToolOptions } from "@openai/agents-core";
import type { ZodObject } from "zod";
import { z } from "zod";
import type { ProductConfiguration } from "../config/product-config.js";
import type { ProductAgent, ProductTool } from "../config/types.js";
import {
  extractWholeToolRules,
  matchPermissionRule,
} from "../permissions/permission.js";
import type { ProductPromptRenderer } from "../prompts/prompt-renderer.js";
import { nativeToolArgumentRenderers } from "./native-argument-renderers.js";
import type { AgentInputItem } from "@openai/agents-core";
import type { HarnessSession } from "../sessions/session.js";
import type { DeferredBuiltinTool } from "./defer-execute-tool.js";
import { ToolDeferOverlay } from "./tool-defer-overlay.js";
import { createConditionalRulesToolInjector } from "../memory/conditional-rules-tool-injector.js";
import type { NativeToolExecutionPipeline } from "../hooks/native-tool-execution-pipeline.js";
import type { ToolSearchService } from "./tool-search.js";
import { BackgroundTaskRegistry, type ProductBackgroundTask } from "./background-task-registry.js";
import { nativeToolPermissionMetadata } from "../permissions/native-tool-permission-metadata.js";
import { delegateDescriptionVariables, type DelegateToolManagerImpl, type DelegateLogger } from "../delegate/delegate-tool-manager.js";

export type HarnessToolContext = HarnessSession;
export type ToolCallDetails = NonNullable<Parameters<ToolOptions<any, HarnessSession>["execute"]>[2]>;
export type ToolExecutionGuard = (name: string, input: Record<string, unknown>, context: RunContext<HarnessToolContext>, details?: ToolCallDetails) => void | Promise<void>;
export type ToolParameters = ZodObject<any> | Record<string, unknown>;
export type ToolParameterSource = ToolParameters | (() => Promise<ToolParameters>);
function isZodParameters(value: ToolParameters): value is ZodObject<any> { return typeof value.safeParse === "function" && typeof value.parse === "function"; }

export type RegisteredToolHandler = {
  extractRawResponse?: (result: any) => any;
  resolveThrownErrorCode?: (error: any) => string | undefined;
  argumentRenderer?: { displayProperties?: Array<{ name: string; type?: string }>; formatText?: (input: any) => unknown };
  parameters?: ToolParameterSource;
  parseInput?: boolean;
  aliases?: string[];
  resolveNeedPermissionArgs?: (context: RunContext<HarnessSession>, input: Record<string, unknown>, callId?: string) => unknown;
  execute: (
    input: Record<string, unknown>,
    context: RunContext<HarnessToolContext>,
    details?: ToolCallDetails,
  ) => unknown | Promise<unknown>;
  isEnabled?: (session: HarnessSession) => boolean | Promise<boolean>;
  shouldShowInToolSearch?: () => boolean;
  needsApproval?: boolean | ((context: RunContext<any>, input: unknown, callId?: string) => Promise<boolean>);
  resolveRejectedResult?: (
    rawItem: Record<string, unknown>,
  ) => AgentInputItem[] | Promise<AgentInputItem[]>;
};

export type ToolBuildOptions = {
  deniedRules?: string[];
  globalDeferLoading?: boolean;
  delegateToolsAvailable?: boolean;
};

const ALWAYS_ALLOWED_IN_DELEGATE = new Set([
  "Read",
  "Glob",
  "Grep",
  "TaskGet",
  "TaskList",
  "TaskOutput",
  "SendMessage",
]);

export class ToolManager {
  private permissionService?: { needsApproval(...args: any[]): Promise<boolean> };
  attachPermissionService(service: { needsApproval(...args: any[]): Promise<boolean> }): void { this.permissionService = service; }
  private sdkApproval(name: string, handler: RegisteredToolHandler): NonNullable<RegisteredToolHandler["needsApproval"]> {
    if (handler.needsApproval !== undefined) return handler.needsApproval;
    if (!this.permissionService) return false;
    return async (context, input, callId) => {
      const metadata = nativeToolPermissionMetadata(name);
      const descriptor = { name, aliases: handler.aliases ?? metadata.aliases, resolveToolType: metadata.resolveToolType.bind(metadata) };
      return this.permissionService!.needsApproval(descriptor, context, input, callId, handler.resolveNeedPermissionArgs ?? metadata.resolveNeedPermissionArgs.bind(metadata));
    };
  }
  // The product initializes renderer objects per tool instance. Do not share
  // mutable presentation arrays between independent embedding runtimes.
  private readonly argumentRenderers = new Map(Object.entries(nativeToolArgumentRenderers).map(([name, renderer]) => [name, {
    ...renderer,
    ...(renderer.displayProperties ? { displayProperties: renderer.displayProperties.map(property => ({ ...property })) } : {}),
  }]));
  readonly backgroundTaskRegistry = new BackgroundTaskRegistry();
  addBackgroundTask(task: ProductBackgroundTask): void { this.backgroundTaskRegistry.addBackgroundTask(task); }
  removeBackgroundTask(id: string): void { this.backgroundTaskRegistry.removeBackgroundTask(id); }
  getBackgroundTasks(): ProductBackgroundTask[] { return this.backgroundTaskRegistry.getBackgroundTasks(); }
  getBackgroundTask(id: string): ProductBackgroundTask | undefined { return this.backgroundTaskRegistry.getBackgroundTask(id); }
  killBackgroundTask(id: string): Promise<boolean> { return this.backgroundTaskRegistry.killBackgroundTask(id); }
  killBackgroundTasksBySessionId(id: string): Promise<void> { return this.backgroundTaskRegistry.killBackgroundTasksBySessionId(id); }
  ensureBgTaskCleanupStarted(): void { this.backgroundTaskRegistry.ensureBgTaskCleanupStarted(); }
  cleanupTerminalBackgroundTasks(): void { this.backgroundTaskRegistry.cleanupTerminalBackgroundTasks(); }
  private readonly handlers = new Map<string, RegisteredToolHandler>();
  private conditionalRulesInjector?: ReturnType<typeof createConditionalRulesToolInjector>;
  private postToolUse?: (name:string,input:any,session:HarnessSession,result:any)=>Promise<void>;
  private hookPipeline?: NativeToolExecutionPipeline;
  attachHookLifecycle(pipeline: NativeToolExecutionPipeline): void {
    this.hookPipeline = pipeline;
    pipeline.injectConditionalRules = (name:any,input:any,session:any,result:any) => this.conditionalRulesInjector?.injectConditionalRules(name,input,session,result);
    for (const [name, handler] of this.handlers) if(handler.resolveThrownErrorCode) pipeline.toolHookManager.registerToolErrorResolver(name,handler.resolveThrownErrorCode.bind(handler));
  }
  attachPostToolUse(callback:NonNullable<ToolManager['postToolUse']>):void { this.postToolUse=callback; }
  attachConditionalRulesService(service:any,pathUtils:any,logger:any):void {
    this.conditionalRulesInjector=createConditionalRulesToolInjector(service,pathUtils,logger);
  }
  private readonly resolvedParameters=new WeakMap<object,ToolParameters>();
  private toolSearch: ToolSearchService | undefined;
  private descriptionVariables: ((name: string, agent: ProductAgent,configuration?:ProductConfiguration['raw']) => Promise<Record<string, unknown>>) | undefined;
  // Delegate-only native cache; other description/ToolSearch fingerprint paths
  // retain their existing standalone rendering until their full cache port.
  readonly toolDescriptionCache = new Map<string, string>();
  private delegateManager: DelegateToolManagerImpl | undefined;
  private delegateAgents: { getAll(): Promise<Array<{ name: string }>>; refreshAgentTools(name: string): Promise<void> } | undefined;
  private delegateLogger: DelegateLogger = {};

  constructor(
    private readonly product: ProductConfiguration,
    private readonly prompts: ProductPromptRenderer,
    toolSearch?: ToolSearchService,
    private readonly beforeExecute?: ToolExecutionGuard,
  ) {
    this.toolSearch = toolSearch;
  }

  attachToolSearch(service: ToolSearchService): void {
    this.toolSearch = service;
    for (const name of this.handlers.keys()) void this.indexRegisteredTool(name);
  }
  attachDescriptionVariablesResolver(resolve: (name: string, agent: ProductAgent,configuration?:ProductConfiguration['raw']) => Promise<Record<string, unknown>>): void { this.descriptionVariables = resolve; }
  attachDelegateToolManager(manager: DelegateToolManagerImpl, agents: NonNullable<ToolManager["delegateAgents"]>, logger: DelegateLogger = {}): void { this.delegateManager = manager; this.delegateAgents = agents; this.delegateLogger = logger; this.setupDelegateToolManagerCallback(); }
  hasDelegateTools(): boolean { try { return this.delegateManager?.hasTools() ?? false; } catch { return false; } }
  invalidateCachedToolDescription(name: string): void { for (const key of this.toolDescriptionCache.keys()) if (key === name || key.startsWith(`${name}:`)) this.toolDescriptionCache.delete(key); this.delegateLogger.debug?.(`[ToolManager] Invalidated cached description for tool: ${name}`); }
  setupDelegateToolManagerCallback(): void { try { if (!this.delegateManager) throw new Error("DelegateToolManager dependency is unavailable"); this.delegateManager.setOnToolsChanged(async () => { this.delegateLogger.debug?.("[ToolManager] Delegate tools changed, refreshing DelegateTool description"); this.invalidateCachedToolDescription("DelegateTool"); try { if (!this.delegateAgents) throw new Error("AgentManager dependency is unavailable"); const agents = await this.delegateAgents.getAll(); this.delegateLogger.debug?.(`[ToolManager] Refreshing tools for ${agents.length} agents`); await Promise.all(agents.map((agent) => this.delegateAgents!.refreshAgentTools(agent.name).catch((error: any) => this.delegateLogger.warn?.(`[ToolManager] Failed to refresh tools for agent ${agent.name}: ${error?.message}`)))); this.delegateLogger.debug?.("[ToolManager] Successfully updated tools for all agents"); } catch (error: any) { this.delegateLogger.warn?.(`[ToolManager] Failed to refresh agent tools: ${error?.message}`); } }); } catch (error: any) { this.delegateLogger.debug?.(`[ToolManager] Could not setup delegate tool manager callback: ${error?.message}`); } }
  async getToolDescriptionFromProduct(name: string, agent?: ProductAgent, configuration?: ProductConfiguration["raw"]): Promise<string | undefined> {
    const key = agent?.name ? `${name}:${agent.name}` : name;
    if (name === "DelegateTool" && this.toolDescriptionCache.has(key)) { this.delegateLogger.debug?.(`[ToolManager] Using cached description for tool: ${key}`); return this.toolDescriptionCache.get(key); }
    const definition = configuration ? configuration.tools?.find((tool) => tool.name === name) : this.product.toolsByName.get(name); if (!definition?.description) return;
    const variables = agent ? await this.descriptionVariables?.(name, agent,configuration) ?? {} : {};
    if (name === "DelegateTool" && this.delegateManager) Object.assign(variables, delegateDescriptionVariables(this.delegateManager, this.delegateLogger));
    const rendered = await this.prompts.renderAsync(definition.description, variables); if (name === "DelegateTool") this.toolDescriptionCache.set(key, rendered); return rendered;
  }

  register(name: string, handler: RegisteredToolHandler): void {
    this.handlers.set(name, handler);
    if(handler.resolveThrownErrorCode)this.hookPipeline?.toolHookManager.registerToolErrorResolver(name,handler.resolveThrownErrorCode.bind(handler));
    void this.indexRegisteredTool(name);
  }

  getDefinition(name: string): ProductTool | undefined {
    return this.product.toolsByName.get(name);
  }

  async get(name: string): Promise<DeferredBuiltinTool | undefined> {
    const entry = [...this.handlers].find(
      ([registered]) => registered.toLowerCase() === name.toLowerCase(),
    );
    if (!entry) return undefined;
    const [registered, handler] = entry;
    const parameters = await this.resolveParameters(handler.parameters);
    const executable:DeferredBuiltinTool = {
      name: registered,
      aliases: handler.aliases ?? nativeToolPermissionMetadata(registered).aliases,
      resolveToolType: nativeToolPermissionMetadata(registered).resolveToolType.bind(nativeToolPermissionMetadata(registered)),
      ...((handler.argumentRenderer ?? this.argumentRenderers.get(registered)) ? { argumentRenderer: handler.argumentRenderer ?? this.argumentRenderers.get(registered)! } : {}),
      execute: async (params, context, details) => {
        return this.executeRegistered(registered,handler,parameters,params,context as RunContext<HarnessToolContext>,details as ToolCallDetails|undefined);
      },
      ...(handler.needsApproval === undefined
        ? {}
        : { needsApproval: handler.needsApproval }),
      resolveNeedPermissionArgs: (handler.resolveNeedPermissionArgs ?? nativeToolPermissionMetadata(registered).resolveNeedPermissionArgs.bind(nativeToolPermissionMetadata(registered))) as NonNullable<DeferredBuiltinTool["resolveNeedPermissionArgs"]>,
      ...(handler.resolveRejectedResult
        ? {
            resolveRejectedResult: (rawItem: Record<string, unknown>) =>
              handler.resolveRejectedResult!(rawItem),
          }
        : {}),
    };
    this.resolvedParameters.set(executable,parameters);
    return executable;
  }
  /** Explicit descriptor bridge consumed by the original AgentManager.buildTools. */
  async getForAgent(name:string,agent:ProductAgent,configuration?:ProductConfiguration['raw']):Promise<any>{
    const executable=await this.get(name);if(!executable)return;
    const registered=executable.name!,definition=(configuration?.tools??this.product.raw.tools).find(tool=>tool.name===registered),handler=this.handlers.get(registered);if(!definition||!handler)return;
    const parameters=this.resolvedParameters.get(executable)!;
    const schema=isZodParameters(parameters)?z.toJSONSchema(parameters,{target:"draft-7",unrepresentable:"any"}):parameters;
    return{...executable,name:registered,description:await this.getToolDescriptionFromProduct(registered,agent,configuration)??"",parameters:schema,strict:false,aliases:handler.aliases??nativeToolPermissionMetadata(registered).aliases,defer_loading:definition.deferLoading===true,needsApproval:this.sdkApproval(registered,handler),
      errorFunction:(_context:any,error:any)=>{const message=error instanceof Error?error.message:String(error);return JSON.stringify({content:`Error: ${message}`,error:message});},
      isEnabled:async({runContext}:any)=>(await handler.isEnabled?.(runContext.context))??true};
  }
  invalidatePluginDependentToolCaches():void{this.toolDescriptionCache.clear();}

  async ensureBuiltinDeferIndexed(name: string): Promise<void> {
    await this.indexRegisteredTool(name, true);
  }

  async buildTools(
    names: readonly string[],
    agent: ProductAgent,
    options: ToolBuildOptions = {},
  ): Promise<Tool<HarnessToolContext>[]> {
    const denied = new Set(extractWholeToolRules(options.deniedRules));
    const hasToolSearch = names.includes("ToolSearch");
    const result: Tool<HarnessToolContext>[] = [];

    for (const name of names) {
      if (denied.has(name.toLowerCase())) continue;
      if (name === "DelegateTool" && !(options.delegateToolsAvailable ?? this.hasDelegateTools())) continue;
      const definition = this.product.toolsByName.get(name);
      const handler = this.handlers.get(name);
      if (!definition || !handler) continue;

      const parameters = await this.resolveParameters(handler.parameters);
      // BaseTool.strict is false in the bundle; ToolManager converts Zod to
      // ordinary JSON Schema before handing it to the SDK.
      const jsonSchema = isZodParameters(parameters) ? z.toJSONSchema(parameters, {
        target: "draft-7", unrepresentable: "any",
      }) : parameters;
      const sdkTool = tool<any, HarnessToolContext>({
        name: definition.name,
        description: await this.getToolDescriptionFromProduct(definition.name, agent) ?? "",
        parameters: jsonSchema,
        strict: false,
        needsApproval: this.sdkApproval(definition.name,handler),
        execute: async (input, context, details) => {
          if (!context)
            throw new Error(`Missing run context for tool ${definition.name}`);
          return this.executeRegistered(definition.name,handler,parameters,input,context,details);
        },
        errorFunction: (_context, error) => {
          const message = error instanceof Error ? error.message : String(error);
          return JSON.stringify({ content: `Error: ${message}`, error: message });
        },
        isEnabled: async ({ runContext }) => {
          const session = runContext.context;
          const overlay = session.options.toolDeferOverlay;
          const deferred = ToolDeferOverlay.isDeferred(
            definition.name,
            definition.deferLoading === true && hasToolSearch,
            overlay,
          );
          if (
            options.globalDeferLoading &&
            deferred &&
            !(
              runContext as RunContext<HarnessSession> & {
                skipActivationCheck?: boolean;
              }
            ).skipActivationCheck
          ) {
            return false;
          }
          if (session.options.tools && session.options.tools !== "default") {
            const rules = session.options.tools
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean);
            if (
              !rules.some((rule) => matchPermissionRule(rule, definition.name))
            ) {
              return false;
            }
          }
          if (
            session.options.disallowedTools?.some((rule) =>
              [definition.name, ...(handler.aliases ?? [])].some((candidate) =>
                matchPermissionRule(rule, candidate),
              ),
            )
          ) {
            return false;
          }
          if (
            session.permissionModeSubject.value === "delegate" &&
            !ALWAYS_ALLOWED_IN_DELEGATE.has(definition.name)
          ) {
            return false;
          }
          return (await handler.isEnabled?.(session)) ?? true;
        },
      });
      result.push(sdkTool);
    }
    return result;
  }

  private async executeRegistered(name:string,handler:RegisteredToolHandler,parameters:ToolParameters,input:any,context:RunContext<HarnessSession>,details?:ToolCallDetails):Promise<any> {
    const execute=async(value:any,runContext:RunContext<HarnessSession>,callDetails?:ToolCallDetails)=>{
      const parsed=isZodParameters(parameters)&&handler.parseInput!==false?parameters.parse(value):value;
      await this.beforeExecute?.(name,parsed,runContext,callDetails);
      return handler.execute(parsed,runContext,callDetails);
    };
    if(this.hookPipeline)return this.hookPipeline.executeToolWithHooks({name,extractRawResponse:handler.extractRawResponse?.bind(handler)},execute,input,context,details);
    const result=await execute(input,context,details);
    if(result){await this.postToolUse?.(name,input,context.context,result);await this.conditionalRulesInjector?.injectConditionalRules(name,input,context.context,result);}
    return result;
  }
  private async indexRegisteredTool(
    name: string,
    force = false,
  ): Promise<void> {
    if (!this.toolSearch) return;
    const definition = this.product.toolsByName.get(name);
    const handler = this.handlers.get(name);
    if (!definition || !handler) return;
    if (!force && definition.deferLoading !== true) return;
    let parameters: Record<string, unknown> | undefined;
    if (handler.parameters) {
      try {
        const resolved = await this.resolveParameters(handler.parameters);
        parameters = isZodParameters(resolved) ? z.toJSONSchema(resolved) as Record<string, unknown> : resolved;
      } catch {
        parameters = undefined;
      }
    }
    await this.toolSearch.indexTool({
      name: definition.name,
      description: this.prompts.render(definition.description),
      summary: this.prompts.render(definition.description),
      ...(parameters === undefined ? {} : { parameters }),
      defer_loading: true,
      ...(handler.shouldShowInToolSearch
        ? { shouldShow: handler.shouldShowInToolSearch }
        : {}),
    });
  }
  private async resolveParameters(source?: ToolParameterSource): Promise<ToolParameters> {
    if (typeof source === "function") { try { return await source(); } catch { return z.object({}).passthrough(); } }
    return source ?? z.object({}).passthrough();
  }
}

export function injectCoordinationTools(
  agentName: string,
  tools: string[],
  defaultAgentName: string,
): string[] {
  const internalGenerators = new Set([
    "compact",
    "contextSummary",
    "contentAnalyzer",
    "terminalTitleGenerator",
    "promptSuggestion",
    "memorySelector",
    "summaryGenerator",
    "autoModeClassifier",
    "promptHookEvaluator",
    "insightsAnalyzer",
    "agentInstructions",
    "handoff-summary",
    "enhance-prompt",
  ]);
  const result = [...tools];
  if (!internalGenerators.has(agentName) && !result.includes("SendMessage")) {
    result.push("SendMessage");
  }
  if (
    agentName !== defaultAgentName &&
    !internalGenerators.has(agentName) &&
    !result.includes("ExitPlanMode")
  ) {
    result.push("ExitPlanMode");
  }
  return result;
}
