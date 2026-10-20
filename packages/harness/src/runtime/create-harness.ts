import { NoopTrace, withTrace, type AgentInputItem, type ModelProvider } from "@openai/agents-core";
import { mkdir } from "node:fs/promises";
import { createChannelHost, type ChannelHostOptions } from "../channels/channel-host.js";
import { createNativeSettingsHost, type NativeSettingsHostOptions } from "../config/native-settings-host.js";
import { ChannelManagerImpl } from "../channels/channel-manager.js";
import { ChannelPermissionAdapterImpl } from "../channels/channel-permission-adapter.js";
import { noopChannelLogger } from "../channels/channel-runtime.js";
import { WechatReplyTool } from "../channels/wechat-reply-tool.js";
import { WecomReplyTool } from "../channels/wecom-reply-tool.js";
import { createNativeChannelClients } from "../channels/native-channel-clients.js";
import { statSync } from "node:fs";
import { resolve } from "node:path";
import { setImmediate as nextTick } from "node:timers/promises";
import { AgentManager } from "../agents/agent-manager.js";
import { AgentFactory } from "../agents/agent-factory.js";
import { TeammateFailureInterceptor } from "../agents/teammate-failure-interceptor.js";
import { AgentService } from "../agents/agent-service.js";
import { AgentTask } from "../agents/agent-task.js";
import { AgentTaskManager } from "../agents/agent-task-manager.js";
import { AgentTaskOutputFileManager } from "../agents/agent-task-output-file-manager.js";
import { ModelConfigAgentRunInterceptor } from "../agents/model-config-agent-run-interceptor.js";
import { loadProductConfiguration, ProductConfiguration } from "../config/product-config.js";
import { ContextCompactSummarizerImpl } from "../context/context-compact-summarizer.js";
import type { CompactOptions } from "../context/context-compact-summarizer.js";
import { McpRegistry } from "../mcp/mcp-registry.js";
import { createAutoMemoryHost, type AutoMemoryOptions } from "../memory/auto-memory-runtime.js";
import { createMemoryRulesHost, type MemoryRulesOptions } from "../memory/memory-rules-runtime.js";
import { MemoryScope, MemoryType } from "../memory/memory-rule-constants.js";
import { ConditionalRulesAgentRunInterceptor } from "../agents/conditional-rules-agent-run-interceptor.js";
import { MemoryPromptContextInitializer } from "../prompts/prompt-context.js";
import { WorkBuddyModelProvider, type SettingsManager } from "../models/model-provider.js";
import { InterruptionService, type InterruptionServiceOptions } from "../permissions/interruption-service.js";
import { PermissionMode } from "../permissions/permission.js";
import { createSdkControlHost, type SdkControlHostOptions } from "../sdk/sdk-control-host.js";
import { attachHarnessSdkControl } from "../sdk/harness-sdk-control.js";
import { createNativeMcpHost, type NativeMcpHostOptions } from "../mcp/native-mcp-host.js";
import { createNativeMcpProjectionHost, type NativeMcpProjectionOptions } from "../mcp/native-mcp-projection-host.js";
import { createNativeProductHost, type NativeProductHostOptions } from "../config/native-product-host.js";
import { ProductPromptRenderer } from "../prompts/prompt-renderer.js";
import { RunnerFactory } from "../runner/runner-factory.js";
import { ToolCallLoopDetectorImpl } from "../runner/tool-call-loop-detector.js";
import { SessionManager } from "../sessions/session-manager.js";
import { SessionRunStateMachine } from "../sessions/run-state-machine.js";
import { SessionStore } from "../sessions/session-store.js";
import { AgentInputItemPipeline } from "../sessions/input-item-pipeline.js";
import { createInputProcessorUtilities } from "../sessions/input-processor-utils.js";
import { DefaultInputItemProcessor } from "../sessions/default-input-item-processor.js";
import { ParentIdLinkageProcessor } from "../sessions/parent-id-linkage-processor.js";
import { FunctionCallAgentInputItemProcessor } from "../sessions/function-call-agent-input-item-processor.js";
import { UsageAgentInputItemProcessor } from "../sessions/usage-agent-input-item-processor.js";
import { ExitPlanModeToolCallProcessor } from "../sessions/exit-plan-mode-tool-call-processor.js";
import { ImageFilterAgentRunInterceptor } from "../agents/image-filter-agent-run-interceptor.js";
import { ImageRehydrationAgentRunInterceptor } from "../agents/image-rehydration-agent-run-interceptor.js";
import { ImageCompressionAgentRunInterceptor } from "../agents/image-compression-agent-run-interceptor.js";
import type { ImageHistoryRuntime } from "../agents/image-history-runtime.js";
import { WorkflowSourceResolver } from "../workflow/workflow-source-resolver.js";
import { createBlobRuntime, type BlobRuntime } from "../blobs/blob-runtime.js";
import { BlobStoreImpl } from "../blobs/blob-store-impl.js";
import { ImageBlobServiceImpl } from "../blobs/image-blob-service-impl.js";
import { ToolResultBlobServiceImpl } from "../blobs/tool-result-blob-service-impl.js";
import { createNativeImageUtils } from "../images/native-image-utils.js";
import { createImageCodecRuntime, type ImageCodecRuntime } from "../images/image-codec-runtime.js";
import { getCurrentImageModel } from "../images/current-image-model.js";
import {createSessionResultObservers,type SessionLifecycleOptions,type ModelResponseInterceptor} from '../sessions/session-result-runtime.js';
import {createOwnedInputHistory,type InputHistoryOptions} from '../sessions/input-history-runtime.js';
import {createResponseInterceptorUtilities} from '../responses/response-interceptor-runtime.js';
import {createNativeResponseInterceptors} from '../responses/native-response-interceptors.js';
import type {AgentManagerHostOptions} from '../agents/standalone-agent-manager-host.js';
import {createHookLifecycleHost,type HookLifecycleHostOptions} from '../hooks/hook-lifecycle-runtime.js';
import { createNativePluginHost, type NativePluginHostOptions } from '../plugins/native-plugin-host.js';
import { NativeEmitter } from '../agents/native-agent-manager-runtime.js';
import { CommandMessageUtils } from '../commands/command-message-utils.js';
import { createToolPermissionHost, type ToolPermissionHostOptions } from '../permissions/tool-permission-host.js';
import type { HarnessSession } from "../sessions/session.js";
import { registerCoreFileTools } from "../tools/core-file-tools.js";
import { registerCoreSearchTools } from "../tools/core-search-tools.js";
import { registerCoreShellTools } from "../tools/core-shell-tools.js";
import { registerDeferredRuntimeTools } from "../tools/deferred-runtime.js";
import { ToolManager } from "../tools/tool-manager.js";
import { AgentTool } from "../tools/agent-tool.js";
import { TaskTools } from "../tools/task-tools.js";
import { TaskOutputTools } from "../tools/task-output-tools.js";
import { TaskStorageService } from "../tasks/task-storage-service.js";
import { PlanStorageService } from "../plans/plan-storage-service.js";
import { PlanTools } from "../tools/plan-tools.js";
import { AskService, type QuestionAnswers } from "../interaction/ask-service.js";
import { AskUserQuestionTool, validateAskUserQuestionParams, type AskUserQuestionInput } from "../tools/ask-user-question.js";
import { EnvAgentRunInterceptor } from "../agents/env-agent-run-interceptor.js";
import { SystemReminderAgentRunInterceptor, type SystemReminderRuntime } from "../agents/system-reminder-agent-run-interceptor.js";
import { UserQueryWrapperAgentRunInterceptor } from "../agents/user-query-wrapper-agent-run-interceptor.js";
import { SkipRunAgentRunInterceptor } from "../agents/skip-run-agent-run-interceptor.js";
import { SkillTool } from "../tools/skill-tool.js";
import { SlashCommandTool } from "../tools/slash-command-tool.js";
import { SkillProductProvider, type SkillProviderPaths } from "../commands/skill-product-provider.js";
import { SkillDescriptionPolicy } from "../commands/skill-description-policy.js";
import { CustomCommandRenderer, type InlineShellService, type CommandReferenceService } from "../commands/custom-command-renderer.js";
import { ReferenceService } from "../commands/reference-service.js";
import { StandaloneInlineShell } from "../commands/standalone-inline-shell.js";
import { CommandManager, type CommandExecutor } from "../commands/command-manager.js";
import type { ProductCommand, ProductSkill, CommandHost } from "../commands/types.js";
import { SkillManageTool } from "../tools/skill-manage-tool.js";
import { NotebookEditTool } from "../tools/notebook-edit-tool.js";
import { StructuredOutputTool } from "../tools/structured-output-tool.js";
import { StructuredOutputContextFactory, StructuredOutputSessionStartHook, StructuredOutputStopHook } from "../structured-output/structured-output-context.js";
import { CronStateManager } from "../cron/cron-state-manager.js";
import { CronStorage } from "../cron/cron-storage.js";
import { CronSchedulerService } from "../cron/cron-scheduler-service.js";
import type { CronSchedulerRuntime } from "../cron/cron-scheduler.js";
import { CronTools } from "../tools/cron-tools.js";
import { MessageQueueManager, QueueDispatchUtils, isQueueHoldItem, mergeConsecutiveUserMessages } from "../sessions/message-queue-manager.js";
import { MessageQueueAgentRunInterceptor } from "../agents/message-queue-agent-run-interceptor.js";
import { WorktreeContextInterceptor } from "../agents/worktree-context-interceptor.js";
import { CwdService } from "../worktrees/cwd-service.js";
import { WorktreeService } from "../worktrees/worktree-service.js";
import { WorktreeInitializer } from "../worktrees/worktree-initializer.js";
import { WorktreeChangeDetector } from "../worktrees/worktree-helpers.js";
import { WorktreeSessionManager } from "../worktrees/worktree-session-manager.js";
import { WorktreeTools } from "../tools/worktree-tools.js";
import type { WorktreeHookManager } from "../worktrees/worktree-types.js";
import { TeamMailbox } from "../teams/team-mailbox.js";
import { TeamManager } from "../teams/team-manager.js";
import { TeamWorktreeCleanupService } from "../teams/team-worktree-cleanup.js";
import { TeamMemberRegistry } from "../teams/team-member.js";
import { InProcessTeammateBackend } from "../teams/in-process-teammate-backend.js";
import { StandaloneDetachedTeamHost } from "./standalone-detached-team-host.js";
import type { AcpUpdate } from "../teams/detached-member-sse-bridge.js";
import { TeamLeadInboxPoller } from "../teams/team-lead-inbox-poller.js";
import { TeamAgentSpawner } from "../teams/team-agent-spawner.js";
import { TeammateIdleTracker } from "../teams/teammate-idle-tracker.js";
import { ShutdownCoordinator } from "../teams/shutdown-coordinator.js";
import { TeamTools } from "../tools/team-tools.js";
import { SendMessageTool } from "../tools/send-message-tool.js";
import { TeamContextInterceptor } from "../agents/team-context-interceptor.js";
import { AgentTaskExecutionFactory } from "../workflow/agent-task-execution.js";
import { WorkflowSubagentPrompts } from "../workflow/workflow-subagent-prompts.js";
import { WorkflowSubagentSpawner } from "../workflow/workflow-subagent-spawner.js";
import { StandaloneWorkflowRuntime } from "./standalone-workflow-runtime.js";
import { WorkflowTool } from "../tools/workflow-tool.js";
import { isWorkflowDisabled } from "../workflow/workflow-feature.js";
import { BackgroundTaskNotifier } from "../agents/background-task-notifier.js";
import { RecordingStoreImpl } from "../replay/recording-store.js";
import { RecordReplayModelProvider } from "../replay/record-replay-model.js";
import { getRecordReplayMode } from "../replay/record-replay-config.js";
import { WebFetchTool } from "../tools/web-fetch-tool.js";
import { WebSearchTool } from "../tools/web-search-tool.js";
import { createWebToolRuntime, type WebToolRuntime } from "../tools/web-tool-runtime.js";
import { loadWebNetworkConfig } from "../permissions/managed-security-policy.js";
import { DelegateToolManagerImpl, type DelegateClientConnection, type DelegateToolDefinition, type DelegateLogger } from "../delegate/delegate-tool-manager.js";
import { DelegateToolsChangedHandler } from "../delegate/delegate-tools-changed-handler.js";
import { DelegateToolImpl } from "../tools/delegate-tool.js";
import { LSPClientImpl, type LSPClientRuntime } from "../lsp/lsp-client.js";
import { LSPManagerImpl } from "../lsp/lsp-manager.js";
import { noopLSPLogger, type LSPLogger, type LSPServerConfig, type LSPPluginManager, type LSPWorkspace } from "../lsp/lsp-types.js";
import { LSPTool } from "../tools/lsp-tool.js";
import { createMediaRuntime, type MediaRuntime } from "../media/media-runtime.js";
import { ImageServiceImpl } from "../media/image-service-impl.js";
import { VideoServiceImpl } from "../media/video-service-impl.js";
import { ImageGenTool } from "../media/image-gen-tool.js";
import { ImageEditTool } from "../media/image-edit-tool.js";
import { VideoGenTool } from "../media/video-gen-tool.js";
import { ImageToolHookInputProcessor } from "../media/image-tool-hook-input-processor.js";
import { FunctionCallResultAgentInputItemProcessor } from "../sessions/function-call-result-processor.js";
import { ComputerUseTool } from "../computer-use/computer-use-tool.js";
import { createComputerUseExecutor } from "../computer-use/computer-use-executor.js";
import { createComputerUseRuntime, type ComputerUseRuntime } from "../computer-use/computer-use-runtime.js";
import { CommandAgentRunInterceptor } from "../agents/command-agent-run-interceptor.js";
import { WorkflowsCommandExecutor, SaveWorkflowCommandExecutor } from "../commands/workflow-command-executors.js";
import { WorkflowRegistry } from "../workflow/workflow-registry.js";
import { StaticBuiltinWorkflowProvider } from "../workflow/builtin-workflow-provider.js";
import type { WorkflowAcpAgentManager, WorkflowEventWriter } from "../workflow/workflow-presentation.js";
import { PromptContextProvider, SystemInfoPromptContextInitializer, GitPromptContextInitializer, SettingsPromptContextInitializer, ModelPromptContextInitializer,
  SessionPromptContextInitializer, ProductFeaturePromptContextInitializer, PromptVarsFileContextInitializer } from "../prompts/prompt-context.js";

// 0.5.2 clones its AsyncLocal trace context; inherited NoopTrace.clone()
// returns a normal Trace. Preserve the no-op identity across that SDK path.
class LocalNoopTrace extends NoopTrace {
  override clone(): LocalNoopTrace { return new LocalNoopTrace(); }
}

export type HarnessOptions = {
  productRuntime?: Partial<Omit<NativeProductHostOptions, "initialConfiguration" | "getWorkDir" | "getHomeDir">>;
  /** Complete native classifier/SDK callback path; independent of the approval UI host. */
  nativePermissions?: boolean;
  /** Complete captured approval controller, with legacy UI retained as the default during migration. */
  nativeApprovals?: boolean;
  approvalController?: Partial<NonNullable<InterruptionServiceOptions["controller"]>>;
  /** Explicit owned JSONL control transport; enables both native permission paths by default. */
  sdkControl?: SdkControlHostOptions;
  nativeMcp?: Partial<Omit<NativeMcpHostOptions, "getWorkDir" | "getHomeProjectDir" | "permissionUtils">> & { servers?: Record<string, any>; projection?: Partial<Omit<NativeMcpProjectionOptions, "serverHost" | "getWorkDir" | "getHomeDir" | "toolSearchService" | "deferToolConfigService">> };
  permissionHost?: Partial<ToolPermissionHostOptions>;
  workDir: string;
  stateDir?: string;
  apiKey?: string;
  baseURL?: string;
  model?: string;
  fallbackModel?: string;
  jsonSchema?: string | Record<string, unknown>;
  outputFormat?: "text" | "json" | "stream-json";
  cronStorageDir?: string;
  cronRuntime?: CronSchedulerRuntime;
  onScheduledOutput?: (output: string, session: HarnessSession) => void;
  worktreeHooks?: WorktreeHookManager;
  workflowBuiltinDir?: string;
  workflowEventWriter?: WorkflowEventWriter;
  getWorkflowAcpAgentManager?(): WorkflowAcpAgentManager;
  mcpPromptRenderer?: { render(command: ProductCommand, input: string): Promise<string | undefined> };
  /** Explicit host override; native TeamMember still defaults to in-process. */
  teamBackend?: "in-process" | "detached-process";
  onTeamMemberUpdate?: (event: { sessionId: string; update: AcpUpdate }) => void | Promise<void>;
  modelProvider?: ModelProvider;
  /** Explicit env DI for independent embedding/tests; native default is process.env. */
  recordReplayEnv?: NodeJS.ProcessEnv;
  /** Product web service credentials are separate from model endpoint/API key. */
  webTools?: Partial<WebToolRuntime> & { endpoint?: string; accessToken?: string; account?: Record<string, unknown> };
  /** Product media endpoint/token are separate from model credentials. */
  mediaTools?: Partial<MediaRuntime> & { endpoint?: string; accessToken?: string };
  computerUse?: Partial<ComputerUseRuntime>;
  /** Native blob service is default; optional service override and compression codec. */
  imageHistory?: ImageHistoryRuntime;
  imageCodec?: Partial<ImageCodecRuntime>;
  sessionLifecycle?: Omit<SessionLifecycleOptions,'getInterruptionService'>;
  inputHistory?: InputHistoryOptions;
  /** Explicit product refresh adapter; captured offline config cannot impersonate a live sync. */
  productRefresh?: {sync(force:boolean):Promise<void>};
  agentManager?:AgentManagerHostOptions;
  /** Native plugin manager/loaders; only explicit trusted directories, no installed account discovery. */
  nativePlugins?: NativePluginHostOptions;
  nativeSettings?: NativeSettingsHostOptions;
  /** Explicit blob I/O override; native defaults stay within this harness stateDir. */
  blobs?: Partial<BlobRuntime>;
  /** Trusted, pre-existing clients only; no credential discovery or automatic connection. */
  channels?: ChannelHostOptions;
  delegateConnection?: DelegateClientConnection;
  delegateTools?: readonly { id: string; definition: DelegateToolDefinition; providerId: string }[];
  /** Explicit trusted plugin/config adapter; never auto-discovers installed IDE plugins. */
  lsp?: { servers?: Record<string, LSPServerConfig>; pluginManager?: LSPPluginManager; workspace?: LSPWorkspace; clientRuntime?: Partial<LSPClientRuntime> };
  settings?: SettingsManager;
  memoryExtraction?: boolean;
  memoryRules?: MemoryRulesOptions;
  autoMemory?: AutoMemoryOptions;
  /** Explicit hook providers/I/O; default only consumes this host's settings. */
  hooks?: Partial<Omit<HookLifecycleHostOptions,'workDir'|'sessionStore'>>;
  promptVarsFile?: string;
  skills?: readonly ProductSkill[];
  commands?: readonly ProductCommand[];
  skillPaths?: SkillProviderPaths;
  commandHost?: CommandHost;
  commandExecutors?: readonly CommandExecutor[];
  inlineShell?: InlineShellService;
  commandReferences?: CommandReferenceService;
  reminderSources?: SystemReminderRuntime;
  askUserQuestion?: (input: AskUserQuestionInput, session: HarnessSession, callId: string) => QuestionAnswers | undefined | Promise<QuestionAnswers | undefined>;
  /** Reconstructed host adapter, NOT the product's unfinished tool classifier. */
  approveTool?: (name: string, input: Record<string, unknown>, session: HarnessSession) => boolean | Promise<boolean>;
  logger?: { warn(message: string): void; info?(message: string): void };
};
export type PromptOptions = {
  onText?: (text: string) => void;
  signal?: AbortSignal;
  maxTurns?: number;
};

/** Explicit composition root; original services/config, reconstructed standalone host. */
export async function createHarness(options: HarnessOptions) {
  if (options.nativePlugins && options.agentManager?.plugins && options.nativePlugins.pluginManager !== options.agentManager.plugins)
    throw Error("nativePlugins and agentManager.plugins must use the same complete pluginManager adapter");
  const workDir = resolve(options.workDir);
  const cwdService = new CwdService(); cwdService.setCwdState(workDir);
  const getWorkDir = () => cwdService.getCwd();
  const stateDir = resolve(options.stateDir ?? resolve(workDir, ".workbuddy-harness"));
  const inputHistoryOwner=createOwnedInputHistory(stateDir,getWorkDir,{logger:{info:(...args)=>options.logger?.info?.(args.map(String).join(' ')),warn:(...args)=>options.logger?.warn(args.map(String).join(' ')),error:(...args)=>options.logger?.warn(args.map(String).join(' '))},...options.inputHistory});
  const inputHistory=inputHistoryOwner.service;
  const recordReplayEnv = options.recordReplayEnv ?? process.env, recordReplayMode = getRecordReplayMode(recordReplayEnv);
  if (recordReplayMode !== "replay" && !options.modelProvider && (!options.apiKey || !options.baseURL)) {
    throw new Error("Standalone runtime requires explicit apiKey and baseURL (or an injected ModelProvider).");
  }
  if (options.baseURL && !["http:", "https:"].includes(new URL(options.baseURL).protocol)) throw new Error("baseURL must use HTTP or HTTPS");
  const sdkControl = options.sdkControl ? createSdkControlHost(options.sdkControl) : undefined;
  const nativeApprovals = options.nativeApprovals ?? (!!sdkControl || !!options.nativeMcp), nativePermissions = options.nativePermissions ?? (!!sdkControl || !!options.nativeMcp);
  const sdkPermissionClient = options.approvalController?.sdkPermissionClient ?? sdkControl?.permission;
  const sdkCliOverrides = new Set<string>();
  let pluginSettings: any;
  const product = await loadProductConfiguration();
  let productRuntime: ReturnType<typeof createNativeProductHost> | undefined;
  const prompts = new ProductPromptRenderer(product);
  const mcp = new McpRegistry();
  const settings: SettingsManager & {clearCache(scope?:string):void} = {
    async list() { return {...await pluginSettings?.list(),...await options.settings?.list?.()}; },
    clearCache(scope?:string) { pluginSettings?.clearCache(scope); (options.settings as any)?.clearCache?.(scope); },
    async get<T>(key: string): Promise<T | undefined> {
      if (sdkCliOverrides.has(key)) return (await settingsHost.cli.getSettings())[key];
      if(key==='model'&&options.model!==undefined)return options.model as T;
      const provided=await options.settings?.get<T>(key);
      const value:any=provided!==undefined?provided:await pluginSettings?.get(key);
      if (key === "env" && options.baseURL) return { ...value, CODEBUDDY_BASE_URL: options.baseURL } as T;
      if (key === "memory" && options.memoryExtraction !== undefined) return { ...value, memoryExtraction: options.memoryExtraction } as T;
      return value;
    },
  };
  const pluginProductChanges = new NativeEmitter();
  const pluginProductManager = {
    getCurrentConfiguration: () => product.raw,
    waitConfiguration: async (force?: boolean) => productRuntime?.started ? productRuntime.facade.waitConfiguration(force) : product.raw,
    onDidChange: pluginProductChanges.event,
    async sync(force?: boolean) { if (!productRuntime) throw Error("Product runtime is not initialized"); await productRuntime.facade.sync(force); },
    async syncVolatileProviders(force?: boolean) { if (!productRuntime) throw Error("Product runtime is not initialized"); await productRuntime.facade.syncVolatileProviders(force); },
  };
  // A legacy read-only source is retained as such; it cannot impersonate the full native manager.
  const pluginHost = options.agentManager?.plugins && !options.nativePlugins ? undefined : createNativePluginHost({
    stateDir, getWorkDir, productManager: pluginProductManager, promptRenderer: prompts,
    settings, plugins: options.nativePlugins, cwdService,
    configuration:{...options.nativeSettings,cliOptions:{...(options.model?{model:options.model}:{}),...options.nativeSettings?.cliOptions}},
    logger: { info: (...args:any[]) => options.logger?.info?.(args.map(String).join(' ')), warn: (...args:any[]) => options.logger?.warn(args.map(String).join(' ')), error: (...args:any[]) => options.logger?.warn(args.map(String).join(' ')) },
  });
  // Legacy nativePlugins.settings may implement only the scoped plugin view.
  // The global harness settings facade always uses the complete native service.
  const fallbackSettingsHost = pluginHost ? undefined : createNativeSettingsHost({
    stateDir,getWorkDir,cwdService,
    logger:{warn:(...args:any[])=>options.logger?.warn(args.map(String).join(' '))},
    configuration:{...options.nativeSettings,cliOptions:{...(options.model?{model:options.model}:{}),...options.nativeSettings?.cliOptions}},
  });
  const settingsHost = pluginHost?.settingsHost ?? fallbackSettingsHost!;
  pluginSettings=settingsHost.manager;
  const pluginSource = options.agentManager?.plugins ?? pluginHost?.pluginManager;
  const stateMachine = new SessionRunStateMachine();
  const messageQueue = new MessageQueueManager();
  const deferredQueueDispatch = () => QueueDispatchUtils.isDeferredDispatchEnabledSync(product.raw.productFeatures as Record<string, unknown> ?? {});
  const cronState = new CronStateManager();
  const cronTools = new CronTools(cronState);
  const resultErrors = new WeakMap<object, unknown>();
  // CLI-only terminal rejection; never rewrites the original interceptor gate.
  const terminalRejectedResults=new WeakSet<object>();
  let nativeHooks:ReturnType<typeof createHookLifecycleHost>|undefined;
  const blobRuntime = createBlobRuntime(stateDir, resolve(stateDir, "sessions"), {
    logger: { setContext() {}, debug() {}, info: message => options.logger?.info?.(message), warn: message => options.logger?.warn(message) }, ...options.blobs,
  });
  const blobStore = new BlobStoreImpl(blobRuntime); blobStore.init();
  const nativeImageBlobService = new ImageBlobServiceImpl(blobRuntime, { blobStore }); nativeImageBlobService.init();
  const imageBlobService = options.imageHistory?.blobService ?? nativeImageBlobService;
  const toolResultBlobService = new ToolResultBlobServiceImpl(blobRuntime); toolResultBlobService.init();
  const nativeImageUtils = createNativeImageUtils(createImageCodecRuntime({logger:{warn:message=>options.logger?.warn(message)},...options.imageCodec}));
  const store = new SessionStore({ storageDir: resolve(stateDir, "sessions"), workDir: getWorkDir, imageBlobService, toolResultBlobService, ...(options.logger ? {logger: options.logger} : {}) });
  const functionCallResultProcessor = new FunctionCallResultAgentInputItemProcessor();
  const processorUtilities = createInputProcessorUtilities(getWorkDir, () => stateDir);
  const processorProductManager = { waitConfiguration: async () => productRuntime?.started ? productRuntime.facade.waitConfiguration() : product.raw };
  const responseUtilities=createResponseInterceptorUtilities({getCurrentConfiguration:()=>product.raw});
  const responseInterceptors:ModelResponseInterceptor[]=[...(options.sessionLifecycle?.interceptors??[])];
  const inputItemPipeline = new AgentInputItemPipeline([
    new DefaultInputItemProcessor({ productManager: processorProductManager, utilities: processorUtilities }),
    new ParentIdLinkageProcessor({ utilities: processorUtilities }),
    functionCallResultProcessor, new UsageAgentInputItemProcessor({ utilities: processorUtilities }),
  ]);
  const sessions:SessionManager = new SessionManager(store, stateMachine, { inputItemPipeline, onUserPromptSubmit:(session,items)=>nativeHooks?.sessionManager.executeUserPromptSubmitHooks(session,items), resultLifecycle:{...options.sessionLifecycle,onSessionStart:async(session,reason)=>{await nativeHooks?.sessionManager.executeSessionStartHooks(session,reason);await options.sessionLifecycle?.onSessionStart?.(session,reason);},onNotification:async(session,message,kind)=>{await nativeHooks?.sessionManager.executeNotificationHooks(session,message,kind);await options.sessionLifecycle?.onNotification?.(session,message,kind);},interceptors:responseInterceptors,mapMessageErrorCode:options.sessionLifecycle?.mapMessageErrorCode??responseUtilities.ErrorUtils.mapMessageErrorCode,getInterruptionService:()=>interruptions,logger:options.sessionLifecycle?.logger??{info:(...args)=>options.logger?.info?.(args.map(String).join(' ')),debug(){},warn:(...args)=>options.logger?.warn(args.map(String).join(' ')),error:(...args)=>options.logger?.warn(args.map(String).join(' '))}},manageResultErrorState: false, onResultError: (error, _session, result) => resultErrors.set(result, error) });
  const worktreeInitializer = new WorktreeInitializer();
  const worktreeService = new WorktreeService(cwdService, worktreeInitializer);
  const worktreeChanges = new WorktreeChangeDetector();
  const worktreeSessions = new WorktreeSessionManager(worktreeService, worktreeChanges, cwdService, options.worktreeHooks??{async hasHooks(event){return await nativeHooks?.manager.hasHooks(event)??false;},async executeHooks(event,payload){return await nativeHooks?.manager.executeHooks(event,payload)??{allowed:true};}}, {
    getCurrentSession: () => sessions.getCurrent() ?? sessions.sessionSubject.value,
    getSessionFilePath: (id) => store.getSessionFilePath(id),
    // The product changes process.cwd. Keep embedding runtimes independent while
    // feeding the same CwdService state into every cwd-sensitive host adapter.
    changeDirectory: (directory) => { if (!statSync(directory).isDirectory()) throw new Error(`Not a directory: ${directory}`); for (const session of sessions.getCachedSessions()) session.options.workDir = directory; },
  });
  const worktreeTools = new WorktreeTools(worktreeSessions, worktreeChanges);
  const teamMailbox = new TeamMailbox(stateDir), teamCleanup = new TeamWorktreeCleanupService(worktreeService, worktreeChanges);
  const teamManager = new TeamManager(stateDir, teamMailbox, getWorkDir, teamCleanup), teamMembers = new TeamMemberRegistry(), teammateIdle = new TeammateIdleTracker();
  const shutdownCoordinator = new ShutdownCoordinator(teammateIdle);
  const teamLeadPoller = new TeamLeadInboxPoller(teamMailbox, teamMembers, shutdownCoordinator, messageQueue, stateMachine, {
    isDeferredDispatchEnabled: deferredQueueDispatch,
    // Existing standalone queue drain supplies the absent desktop dispatch host.
    runInput: async (session, input) => { for (const item of input) messageQueue.enqueueMessage(session, item); scheduleQueueDispatch(session); },
  });
  const teamTools = new TeamTools(teamManager, teamMembers, teamLeadPoller), sendMessageTool = new SendMessageTool(teamManager, teamMailbox, teamMembers, shutdownCoordinator);
  const authentication = { initialized: Promise.resolve(), current: () => ({ ...(options.apiKey ? { accessToken: options.apiKey } : {}) }), clear: () => undefined };
  const plans = new PlanStorageService(resolve(stateDir, "plans"));
  const asks = new AskService();
  const approvedCalls = new WeakMap<HarnessSession, Set<string>>();
  const channelApprovalTargets = new Map<string, {session: HarnessSession; name: string}>();
  const channelLogger = { ...noopChannelLogger, info: (...args: any[]) => options.logger?.info?.(args.map(String).join(" ")), warn: (...args: any[]) => options.logger?.warn(args.map(String).join(" ")), error: (...args: any[]) => options.logger?.warn(args.map(String).join(" ")) };
  const channelManager = new ChannelManagerImpl(channelLogger, settings);
  const channelPermissionAdapter = new ChannelPermissionAdapterImpl(channelManager, channelLogger, { now: options.channels?.now ?? Date.now, random: options.channels?.random ?? Math.random });
  function markChannelApproval(id: string) { const target = channelApprovalTargets.get(id); if (!target) return; let entries = approvedCalls.get(target.session); if (!entries) approvedCalls.set(target.session, entries = new Set()); entries.add(`${target.name}\0${id}`); channelApprovalTargets.delete(id); }
  const tools = new ToolManager(product, prompts, undefined, async (name, input, context, details) => {
    const session = context.context;
    // Standalone stream consumer and SDK tool executor run concurrently. Native
    // async input processors must publish the call before history-based tools
    // compute ordinals. This is an explicit host barrier, not a native method edit.
    await sessions.flushHistory(session);
    session.abortSignal.throwIfAborted();
    const recordedCallId=details?.toolCall?.callId||details?.toolCall?.id;
    if(recordedCallId)await sessions.waitForToolCallHistory(session,recordedCallId);
    // Search/discovery wrappers do not authorize their target; deferred builtin
    // invocation re-enters this same guard through ToolManager.get().
    if (name === "ToolSearch" || name === "DeferExecuteTool" || name === "WaitForMcpServers") return;
    const id = details?.toolCall?.callId || details?.toolCall?.id;
    if (id && approvedCalls.get(session)?.delete(`${name}\0${id}`)) {
      if (name === "AskUserQuestion") input.answers = await asks.acquireAnswers(id, session.abortSignal);
      return;
    }
    if (name === "AskUserQuestion") {
      if (validateAskUserQuestionParams(input)) return;
      // Deferred builtin calls do not traverse the SDK's approval callback.
      // Route them to the same human host; never trust model-supplied answers.
      const answers = await options.askUserQuestion?.(input as AskUserQuestionInput, session, id ?? "");
      if (!answers) throw new Error("User declined to answer questions");
      input.answers = answers;
      return;
    }
    const mode = session.permissionModeSubject.value;
    const delegatedMode = mode === PermissionMode.Plan ? session.meta.prePlanPermissionMode : mode;
    const bypass = delegatedMode === PermissionMode.BypassPermissions;
    const planEdit = mode === PermissionMode.Plan && (name === "Write" || name === "Edit") && input.file_path
      && resolve(getWorkDir(), String(input.file_path)) === plans.getPlanFilePath(session);
    const memoryWrite = session.agentPurpose === "memory_extraction" && (name === "Write" || name === "Edit")
      && isWithin(resolve(stateDir, "memory"), resolve(getWorkDir(), String(input.file_path ?? "")));
    if (planEdit || memoryWrite || bypass || await options.approveTool?.(name, input, session)) return;
    // Standalone guard adapter for tools whose native metadata needs no SDK pause.
    // Explicit injected channels provide a human decision; never auto-approve a send.
    if (id && options.channels && !options.approveTool && channelManager.getPermissionRelayChannels().length) {
      let abort!: () => void;
      const aborted = new Promise<never>((_resolve, reject) => { abort = () => reject(session.abortSignal.reason ?? new Error("Aborted")); session.abortSignal.addEventListener("abort", abort, {once:true}); });
      try {
        session.abortSignal.throwIfAborted();
        const decision = await Promise.race([channelPermissionAdapter.createPermissionRequest(id, name, `Tool call: ${name}`, JSON.stringify(input).slice(0,200)), aborted]);
        if (decision === "allow" || decision === "allow_always") return;
      } finally { session.abortSignal.removeEventListener("abort", abort); channelPermissionAdapter.cancelRequest(id); }
    }
    throw new Error(`Tool permission denied: ${name}. Provide an approval callback or explicitly select bypassPermissions.`);
  });
  const fileTools = registerCoreFileTools(tools, { get workDir() { return getWorkDir(); }, imageUtils:nativeImageUtils, imageBlobService, getCurrentModel:session=>getCurrentImageModel(agents,session),logger:{warn:(...args)=>options.logger?.warn(args.map(String).join(' ')),info:(...args)=>options.logger?.info?.(args.map(String).join(' '))} });
  const memoryRules=createMemoryRulesHost(getWorkDir,stateDir,{instructionsHooks:{hasHooks:(event)=>nativeHooks?.manager.hasHooks(event)??false,executeHooks:(event,input)=>nativeHooks?.manager.executeHooks(event,input)??Promise.resolve({allowed:true})},logger:{warn:(...args)=>options.logger?.warn(args.map(String).join(' ')),error:(...args)=>options.logger?.warn(args.map(String).join(' ')),info:(...args)=>options.logger?.info?.(args.map(String).join(' '))},...options.memoryRules});
  tools.attachConditionalRulesService(memoryRules.conditionalRules,memoryRules.runtime.utilities.PathUtils,memoryRules.runtime.dependencies.logger);
  const autoMemory=await createAutoMemoryHost({workDir:getWorkDir,stateDir,settings,sessions,stateMachine,getAgentService:()=>service,runnerProvider:{async get(){const runner=await runnerFactory.create();return{run:(agent:any,state:any,opts:any)=>sessions.run(state._context.context,()=>runner.run(agent,state,opts))}}},logger:memoryRules.runtime.dependencies.logger,options:options.autoMemory});
  cronTools.register(tools);
  worktreeTools.register(tools);
  teamTools.register(tools); sendMessageTool.register(tools);
  const notebookEdit = new NotebookEditTool(fileTools.readFileState); notebookEdit.register(tools);
  registerCoreSearchTools(tools, { get workDir() { return getWorkDir(); } });
  const shell = registerCoreShellTools(tools, { workDir, getWorkDir, settings });
  const lspLogger: LSPLogger = { ...noopLSPLogger, warn: (...args) => options.logger?.warn(args.map(String).join(" ")), error: (...args) => options.logger?.warn(args.map(String).join(" ")), info: (...args) => options.logger?.info?.(args.map(String).join(" ")) };
  const lspClients = new Set<LSPClientImpl>();
  const lspManager = new LSPManagerImpl(() => { const client = new LSPClientImpl(lspLogger, options.lsp?.workspace ?? {}, getWorkDir, options.lsp?.clientRuntime); lspClients.add(client); return client; }, options.lsp?.pluginManager ?? pluginSource, lspLogger);
  await lspManager.ensurePluginsLoaded();
  if (options.lsp?.servers) lspManager.registerServers(options.lsp.servers, "standalone", "explicit-host-config");
  const lspTool = new LSPTool(lspManager, getWorkDir, lspLogger); lspTool.register(tools);
  const computerUseRuntime = createComputerUseRuntime({ getHomeDir: () => stateDir, logger: { warn: (...args) => options.logger?.warn(args.map(String).join(" ")) }, ...options.computerUse });
  const computerUseExecutor = createComputerUseExecutor(computerUseRuntime), computerUseTool = new ComputerUseTool(computerUseExecutor, computerUseRuntime); computerUseTool.register(tools);
  const deferredRuntime = registerDeferredRuntimeTools(tools, mcp, { cwd: getWorkDir, resolveAllowedTools: (name) =>
    product.agentsByName.get(name ?? product.defaultAgent.name)?.tools ?? product.defaultAgent.tools });
  const agentFactory = new AgentFactory(stateMachine);
  const agents:AgentManager = new AgentManager(product, prompts, tools, mcp, agentFactory,{settings,getConfiguration:async(force)=>productRuntime?.started ? productRuntime.facade.waitConfiguration(force) : ({...product.raw,...await getSkillConfiguration()}),onConfigurationChange:listener=>productRuntime?.facade.onDidChange(listener),...(pluginSource?{plugins:pluginSource}:{}),...(pluginHost?{outputStyles:pluginHost.outputStyles}:{}),logger:{debug(){},info:(...args)=>options.logger?.info?.(args.map(String).join(' ')),warn:(...args)=>options.logger?.warn(args.map(String).join(' ')),error:(...args)=>options.logger?.warn(args.map(String).join(' '))},...options.agentManager});
  const delegateLogger: DelegateLogger = { warn: (...args) => options.logger?.warn(args.map(String).join(" ")), error: (...args) => options.logger?.warn(args.map(String).join(" ")), info: (...args) => options.logger?.info?.(args.map(String).join(" ")) };
  const delegateToolManager = new DelegateToolManagerImpl(delegateLogger), delegateToolsChangedHandler = new DelegateToolsChangedHandler(() => delegateToolManager, delegateLogger), delegateTool = new DelegateToolImpl(() => delegateToolManager);
  delegateTool.register(tools); tools.attachDelegateToolManager(delegateToolManager, agents, delegateLogger);
  if (options.delegateConnection) delegateToolManager.setConnection(options.delegateConnection);
  for (const tool of options.delegateTools ?? []) await delegateToolManager.registerTool(tool.id, tool.definition, tool.providerId);
  const currentSession = () => sessions.getCurrent() ?? sessions.sessionSubject.value;
  const structuredContexts = new StructuredOutputContextFactory();
  const structuredOutputTool = new StructuredOutputTool(currentSession, structuredContexts, { error: (message) => options.logger?.warn(message) }); structuredOutputTool.register(tools);
  const structuredStartHook = new StructuredOutputSessionStartHook(structuredContexts, undefined, options.logger);
  const structuredStopHook = new StructuredOutputStopHook(structuredContexts, options.logger);
  nativeHooks=createHookLifecycleHost({
    ...options.hooks,pluginManager:options.hooks?.pluginManager??pluginSource,sdkHooksManager:options.hooks?.sdkHooksManager??sdkControl?.hooks,workDir:getWorkDir,sessionStore:store,settings:options.hooks?.settings??settings,
    logger:options.hooks?.logger??memoryRules.runtime.dependencies.logger,
    getAgentService:options.hooks?.getAgentService??(()=>service),agentManager:options.hooks?.agentManager??agents,
    runnerProvider:options.hooks?.runnerProvider??{async get(){const runner=await runnerFactory.create();return{run:(agent:any,state:any,opts:any)=>sessions.run(state._context.context,()=>runner.run(agent,state,opts))};}},
    hookProvider:{sortSync:()=>[structuredStartHook,structuredStopHook,autoMemory.stopHook,autoMemory.freshnessHook,...options.hooks?.hookProvider?.sortSync()??[]].sort((a,b)=>(a.priority??500)-(b.priority??500))},
    hookInputProcessorProvider:{sortSync:()=>[imageToolHookInputProcessor,...options.hooks?.hookInputProcessorProvider?.sortSync()??[]].sort((a,b)=>(a.priority??500)-(b.priority??500))},
  });
  tools.attachHookLifecycle(nativeHooks.pipeline);
  const permissions = createToolPermissionHost({
    getWorkDir, getHomeDir: () => stateDir, sessionStore: store, planStorageService: plans,
    sessionHookManager: nativeHooks.sessionManager, toolHookManager: nativeHooks.toolManager,
    logger: { warn: (...args: any[]) => options.logger?.warn(args.map(String).join(' ')) },
    ...options.permissionHost,
    settingsManager: options.permissionHost?.settingsManager ?? pluginSettings,
  });
  if (nativePermissions) { tools.attachPermissionService(permissions); deferredRuntime.deferExecute.attachPermissionAdapter(permissions); }
  const skillPaths = options.skillPaths ?? { get project() { return resolve(getWorkDir(), ".codebuddy/skills"); }, user: resolve(stateDir, "skills"), connector: resolve(stateDir, "connector-skills") };
  const skillProvider = new SkillProductProvider(skillPaths);
  const configuredCommands = [...(Array.isArray(product.raw.commands) ? product.raw.commands as ProductCommand[] : []), ...options.commands ?? []].map((command) => ({ ...command }));
  const getSkillConfiguration = async () => {
    if (productRuntime?.started) return productRuntime.facade.waitConfiguration();
    const skills = new Map((await skillProvider.loadSkillsCached()).map((skill) => [skill.name, skill]));
    for (const skill of options.skills ?? []) skills.set(skill.name, skill);
    return { skills: [...skills.values()], commands: configuredCommands };
  };
  const skillManageTool = new SkillManageTool(async () => ({ ...await getSkillConfiguration(), productFeatures: product.raw.productFeatures as Record<string, unknown> ?? {} }), () => skillPaths.user);
  skillManageTool.register(tools);
  const workflowRegistry = new WorkflowRegistry({ cwd: getWorkDir, userDir: () => resolve(stateDir, "workflows") }, options.logger, options.workflowBuiltinDir ? new StaticBuiltinWorkflowProvider(() => options.workflowBuiltinDir!) : undefined);
  inputItemPipeline.processors.push(new FunctionCallAgentInputItemProcessor({ toolManager: tools, workflowSourceResolver: new WorkflowSourceResolver(workflowRegistry, getWorkDir), utilities: processorUtilities, logger: { debug() {} } }),
    new ExitPlanModeToolCallProcessor({ planStorageService: plans, consoleManager: { error: (...args: unknown[]) => options.logger?.warn(args.map(String).join(" ")) } }));
  const commandManager = new CommandManager(getSkillConfiguration, sessions, options.commandExecutors, { features: async () => product.raw.productFeatures as Record<string, unknown> ?? {}, workflowRegistry, ...(options.logger ? { logger: options.logger } : {}) });
  await commandManager.refresh();
  agents.attachCommandManager(commandManager);
  const references = options.commandReferences ?? new ReferenceService(getWorkDir);
  const commandRenderer = new CustomCommandRenderer(options.inlineShell ?? new StandaloneInlineShell(getWorkDir, currentSession), references,
    { error: (message, error) => options.logger?.warn(`${message}${error ? `: ${String(error)}` : ""}`) });
  const descriptionPolicy = new SkillDescriptionPolicy(() => skillPaths.user);
  tools.attachDescriptionVariablesResolver(async (name, agent,snapshot) => { const configuration = snapshot??await getSkillConfiguration(); return descriptionPolicy.variables(name, agent, configuration.skills as ProductSkill[], configuration.commands as ProductCommand[], snapshot?.agents??product.raw.agents); });
  const promptContext = new PromptContextProvider([
    new SystemInfoPromptContextInitializer({ workDir: getWorkDir, homeDir: () => stateDir }, settings),
    new GitPromptContextInitializer(getWorkDir), new SettingsPromptContextInitializer(settings),
    new ModelPromptContextInitializer(agents, currentSession), new SessionPromptContextInitializer(currentSession),
    new ProductFeaturePromptContextInitializer(product), new PromptVarsFileContextInitializer(() => options.promptVarsFile),
    new MemoryPromptContextInitializer(scope=>memoryRules.manager.get({scope})),
  ]);
  prompts.attachContextProvider(promptContext);
  let service!: AgentService;
  const nativeMcp = options.nativeMcp || sdkControl ? createNativeMcpHost({
    getWorkDir, getHomeProjectDir: () => blobRuntime.paths.getHomeProjectDir(), permissionUtils: permissions.permissionUtils, registry: mcp,
    ...options.nativeMcp,
    dependencies: {
      store, sessions, stateMachine, queue: messageQueue, settings,
      toolHooks: nativeHooks!.toolManager, permissions,
      channels: channelManager,
      channelSecurity: undefined, // Explicit nativeMcp.dependencies adapter until the product security service is restored.
      channelPermission: channelPermissionAdapter,
      sdkMcpMessageClient: sdkControl?.mcp,
      overlayCache: agents.standaloneHost.runtime.dependencies.agentToolDeferOverlayCache,
      deferConfig: agents.standaloneHost.runtime.dependencies.deferToolConfigService,
      subagentTools: agents.standaloneHost.runtime.dependencies.mcpSubagentToolManager,
      agents,
      service: { run: (...args: any[]) => nativeMcp?.closed ? Promise.resolve() : (service.run as any)(...args) },
      ...options.nativeMcp?.dependencies,
    },
  }) : undefined;
  const nativeMcpProjection = nativeMcp ? await createNativeMcpProjectionHost({
    serverHost: nativeMcp, getWorkDir, getHomeDir: () => resolve(stateDir, "mcp"),
    cwdService,
    toolSearchService: deferredRuntime.search,
    deferToolConfigService: agents.standaloneHost.runtime.dependencies.deferToolConfigService,
    ...(pluginSource ? { plugins: pluginSource } : {}),
    logger: nativeMcp.runtime.logger,
    ...options.nativeMcp?.projection,
    settings: options.nativeMcp?.projection?.settings ?? pluginSettings,
  }) : undefined;
  if (nativeMcp && nativeMcpProjection) {
    nativeMcp.attachProjection(nativeMcpProjection);
    mcp.attachNativeManager(nativeMcpProjection.manager, nativeMcpProjection.ready);
    agentFactory.attachNativeMcpApprovalResolver(name => nativeMcp.resolveNeedsApproval(name));
  }
  async function connectNativeMcp(name: string, config: any, scope?: string) {
    if (!nativeMcp) throw Error("Native MCP host is not configured");
    return nativeMcp.connect(name, config, scope);
  }
  const interruptions:InterruptionService = new InterruptionService(stateMachine, {
    ...(nativeApprovals ? { controller: {
      permissions: { async applyUpdate(session: HarnessSession, update: any) { await permissions.initializeContext(session); return permissions.service.applyUpdate(session, update); } },
      toolManager: tools, commands: permissions.commands.CommandUtils, getWorkDir,
      sdkHooksManager: nativeHooks!.runtime.dependencies.sdkHooksManager,
      workflowSourceResolver: new WorkflowSourceResolver(workflowRegistry, getWorkDir),
      ...options.approvalController,
      ...(sdkPermissionClient ? { sdkPermissionClient: {
        async requestPermission(name: string, input: any, callId: string) {
          const session = currentSession();
          const decision = await sdkPermissionClient.requestPermission(name, input, callId);
          if (decision.allowed && session) {
            const effective = { ...input, ...decision.updatedInput }, effectiveName = name === "DeferExecuteTool" && typeof effective.toolName === "string" ? effective.toolName : name;
            let entries = approvedCalls.get(session); if (!entries) approvedCalls.set(session, entries = new Set()); entries.add(`${effectiveName}\0${callId}`);
          }
          return decision;
        },
      }} : {}),
    }} : {}),
    resultDispatch: {
      getDefaultAgent: () => agents.getDefault(),
      beforeResult: (_session, result) => sessions.waitForResultHandled(result),
      executeStopHooks: (session, result, config) => nativeHooks!.sessionManager.executeStopHooks(session, result, config),
    },
    executeNotificationHooks:(session,message,kind)=>nativeHooks!.sessionManager.executeNotificationHooks(session,message,kind),
    ...(options.channels ? { channelPermissionAdapter: {
      createPermissionRequest: (...args: [string,string,string,string]) => channelPermissionAdapter.createPermissionRequest(...args).then((decision: any) => { if (decision === "allow" || decision === "allow_always") markChannelApproval(args[0]); else channelApprovalTargets.delete(args[0]); return decision; }),
      cancelRequest: (id: string) => { channelPermissionAdapter.cancelRequest(id); channelApprovalTargets.delete(id); },
    }} : {}),
    recovery: {
      service: {
        run: (...args) => withTrace(new LocalNoopTrace(), async () => {
          if (sdkControl?.closed) return;
          const previous = args[2]?.context?.resultSubject.value;
          await service.run(...args);
          if (nativeApprovals && Array.isArray(args[1]) && args[1].some((item: any) => item.providerData?.skipRun)) {
            if (previous && typeof previous === "object") terminalRejectedResults.add(previous);
            if (args[2]?.context) stateMachine.forceIdle(args[2].context, "native-rejected-tool-skip-run");
          }
        }),
        runDefault: (...args) => withTrace(new LocalNoopTrace(), async () => { if (!sdkControl?.closed) await service.runDefault(...args); }),
      },
      beforeHandleError: (_session, result) => sessions.waitForResultHandled(result),
      describeDeferredTool: (name) => deferredRuntime.search.describe(name),
      getTasks: () => taskManager.getTasks(),
      isDeferredDispatchEnabled: deferredQueueDispatch,
    },
    logger: { error: (message, error) => options.logger?.warn(`${message}: ${String(error)}`) },
    onContinue: async (agent, state, session) => {
      // Wait for the sole stream consumer to persist all pre-pause tool calls.
      const previous = session.resultSubject.value;
      if (previous && typeof previous === "object") await sessions.waitForResultHandled(previous);
      await service.run(agent ?? await agents.getDefault({ session }), state, { context: session });
    },
    onRejectedResults: async (session, _item, results) => {
      if (session.abortSignal.aborted) return;
      const previous = session.resultSubject.value;
      if (previous && typeof previous === "object") await sessions.waitForResultHandled(previous);
      await service.runDefault(results, { context: session });
      if (results.some((item: any) => item.providerData?.skipRun)) {if(previous&&typeof previous==='object')terminalRejectedResults.add(previous);stateMachine.forceIdle(session, "rejected-tool-skip-run");}
    },
    resolveRejectedResult: async (name, raw) => (await tools.get(name))?.resolveRejectedResult?.(raw) as AgentInputItem[] ?? [],
  });
  const pendingSubscription = interruptions.pending$.subscribe((pending) => {
    if (!pending) return;
    const source = interruptions.findSessionByItem(pending.item);
    if (!source) return;
    // The captured stream-json path delegates to the SDK client, not the local UI.
    if (nativeApprovals && source.options.inputFormat === "stream-json" && !source.options.acp) return;
    const raw = pending.item.rawItem as any;
    void (async () => {
      let approved = false;
      let effectiveName = raw.name;
      try {
        const params = JSON.parse(raw.arguments || "{}");
        const deferred = raw.name === "DeferExecuteTool" && typeof params.toolName === "string";
        effectiveName = deferred ? params.toolName : raw.name;
        const effectiveInput = deferred ? (typeof params.params === "string" ? JSON.parse(params.params) : params.params || {}) : params;
        const pendingId = raw.callId || raw.id;
        if (pendingId) channelApprovalTargets.set(pendingId, {session: source, name: effectiveName});
        // Native relay supplies the human decision when no local callback is present.
        if (channelManager.getPermissionRelayChannels().length && (effectiveName === "AskUserQuestion" ? !options.askUserQuestion : !options.approveTool)) return;
        if (effectiveName === "AskUserQuestion") {
          asks.setAsk(pending.item);
          const id = raw.callId || raw.id;
          const answers = await options.askUserQuestion?.(effectiveInput, source, id);
          if (answers && !source.abortSignal.aborted) {
            // A provided answers field is the SDK permission-component surface.
            // Human answers override any prefilled, model-supplied answers.
            if (params.answers) raw.arguments = JSON.stringify({ ...params, answers });
            asks.doneAsk(answers, id); approved = true;
          } else asks.rejectAsk(id);
        } else approved = await options.approveTool?.(effectiveName, effectiveInput, source) ?? false;
      } catch { /* Invalid args or a failed host approval is a denial. */ }
      if (approved) {
        const id = raw.callId || raw.id;
        if (id) { let entries = approvedCalls.get(source); if (!entries) approvedCalls.set(source, entries = new Set()); entries.add(`${effectiveName}\0${id}`); }
        interruptions.approve(pending.item);
      }
      else interruptions.reject(pending.item);
      channelApprovalTargets.delete(raw.callId || raw.id);
    })();
  });
  const compactions = new Map<string, Promise<boolean>>();
  let compactor!: ContextCompactSummarizerImpl;
  const originalProvider = options.modelProvider ?? new WorkBuddyModelProvider(product, authentication, settings, sessions, fetch, {}, imageBlobService);
  const recordingStore = new RecordingStoreImpl(recordReplayEnv);
  const provider = new RecordReplayModelProvider(originalProvider, recordingStore, { info: (message) => options.logger?.info?.(message) }, recordReplayEnv);
  const runnerFactory = new RunnerFactory(provider, sessions, stateMachine, agents, product, new ToolCallLoopDetectorImpl(), {
    compactAndSummarize: (session, compactOptions) => {
      const pending = compactor.compactAndSummarize(session, compactOptions);
      compactions.set(session.id, pending);
      void pending.finally(() => { if (compactions.get(session.id) === pending) compactions.delete(session.id); }).catch(() => undefined);
      return pending;
    },
  }, undefined, { tracingDisabled: true });
  service = new AgentService(authentication, settings, runnerFactory, sessions, stateMachine, agents,
    [new CommandAgentRunInterceptor(agents, getSkillConfiguration, commandRenderer, { render: (content, variables) => prompts.renderAsync(content, variables) }, options.mcpPromptRenderer ?? { async render(...args:any[]) { if(!productRuntime)throw new Error("Product runtime is not initialized");return (productRuntime.mcpPromptRenderer.render as any)(...args); } }, { error: (message) => options.logger?.warn(message) }), new EnvAgentRunInterceptor(settings), new ConditionalRulesAgentRunInterceptor(memoryRules.conditionalRules), autoMemory.context, new MessageQueueAgentRunInterceptor(messageQueue, stateMachine, deferredQueueDispatch), new SkipRunAgentRunInterceptor(stateMachine), new SystemReminderAgentRunInterceptor(prompts, plans, { getAlwaysMemory:scope=>memoryRules.manager.get({scope:scope==='project_local'?MemoryScope.PROJECT_LOCAL:scope,type:MemoryType.ALWAYS}), channelServers: () => channelManager.channelServers.values(), ...options.reminderSources }),
      new WorktreeContextInterceptor(worktreeSessions), new TeamContextInterceptor(teamManager, prompts), new TeammateFailureInterceptor(teamManager, teamMembers), new UserQueryWrapperAgentRunInterceptor(), new ModelConfigAgentRunInterceptor(agents, sessions, settings), new ImageFilterAgentRunInterceptor({ productManager: processorProductManager, logger: { info: (message: string) => options.logger?.info?.(message) } }),
      new ImageRehydrationAgentRunInterceptor({ imageBlobService, settingsManager: settings, logger: { debug() {}, warn: (...args: unknown[]) => options.logger?.warn(args.map(String).join(" ")) } }),
      new ImageCompressionAgentRunInterceptor({ imageUtils: options.imageHistory?.imageUtils??nativeImageUtils, logger: { info: (message: string) => options.logger?.info?.(message), warn: (message: string) => options.logger?.warn(message) } })], pluginHost, interruptions);
  const channelClients = options.channels?.native ? createNativeChannelClients(stateDir, options.channels.native, kind => ({subscribeToClient: (client: any) => { const factory = kind === "wechat" ? channelHost.wechatFactory : channelHost.wecomFactory; const selected = factory.get(client.instanceId); if (!selected) throw new Error("Native client is not selected by this channel host"); (kind === "wechat" ? channelHost.wechatBridge : channelHost.wecomBridge).subscribeToClient(selected); }}), channelLogger) : undefined;
  const channelOptions = options.channels ? {...options.channels, ...(channelClients ? {wechat: options.channels.wechat ?? channelClients.wechatFactory, wecom: options.channels.wecom ?? channelClients.wecomFactory} : {})} : undefined;
  const channelHost = createChannelHost(channelOptions, channelManager, channelPermissionAdapter, {
    sessionManager: sessions, agentManager: agents, askService: asks, planStorageService: plans, messageQueueManager: messageQueue, stateMachine, commandManager,
    interruptionService: { approve: (item: any) => { const approved = interruptions.approve(item); if (approved) markChannelApproval(item.rawItem.callId || item.rawItem.id); return approved; } },
    agentService: { run: (...args: Parameters<AgentService["run"]>) => withTrace(new LocalNoopTrace(), () => service.run(...args)) },
  }, channelLogger);
  const wechatReplyTool = new WechatReplyTool(channelHost.runtime), wecomReplyTool = new WecomReplyTool(channelHost.runtime); wechatReplyTool.register(tools); wecomReplyTool.register(tools);
  const webRuntime = createWebToolRuntime({
    configuration: async () => ({ ...product.raw, endpoint: options.webTools?.endpoint ?? "" }),
    authentication: () => options.webTools?.accessToken ? { auth: { accessToken: options.webTools.accessToken }, account: options.webTools.account } : undefined,
    settings, renderPrompt: (name, variables) => prompts.renderAsync(name, variables),
    analyze: (name, input) => withTrace(new LocalNoopTrace(), () => service.runOneTime(name, input)),
    // Native network projection includes managed Security Center sources;
    // full BashSandboxManager/platform lifecycle remains a separate service.
    networkConfig: () => loadWebNetworkConfig(settings, options.webTools?.env ?? process.env, { warn: (message, error) => options.logger?.warn(`${message}: ${String(error)}`) }),
    logger: { warn: (...args) => options.logger?.warn(args.map(String).join(" ")) }, ...options.webTools,
  });
  const webFetchTool = new WebFetchTool(webRuntime), webSearchTool = new WebSearchTool(webRuntime); webFetchTool.register(tools); webSearchTool.register(tools);
  const mediaRuntime = createMediaRuntime({ getWorkDir, configuration: async () => ({ ...product.raw, endpoint: options.mediaTools?.endpoint ?? "" }), authentication: () => options.mediaTools?.accessToken ? { accessToken: options.mediaTools.accessToken } : undefined, settings,
    logger: { info: (...args) => options.logger?.info?.(args.map(String).join(" ")), debug() {}, error: (...args) => options.logger?.warn(args.map(String).join(" ")) }, ...options.mediaTools });
  const imageService = new ImageServiceImpl(mediaRuntime), videoService = new VideoServiceImpl(mediaRuntime), imageGenTool = new ImageGenTool(mediaRuntime, imageService), imageEditTool = new ImageEditTool(mediaRuntime, imageService), videoGenTool = new VideoGenTool(mediaRuntime, imageService, videoService), imageToolHookInputProcessor = new ImageToolHookInputProcessor(imageService, options.logger);
  imageGenTool.register(tools); imageEditTool.register(tools); videoGenTool.register(tools);
  compactor = new ContextCompactSummarizerImpl(product, agents, service, sessions, stateMachine, prompts, { settings, interruptions,executePreCompactHooks:(session,trigger,instructions)=>nativeHooks!.sessionManager.executePreCompactHooks(session,trigger,instructions),executePostCompactHooks:(session,trigger,summary)=>nativeHooks!.sessionManager.executePostCompactHooks(session,trigger,summary) });
  const taskManager = new AgentTaskManager({ getTeam: () => { const team = teamManager.getTeam(); return team ? { name: team.name, auto: team.isAutoTeam === true } : undefined; }, mailbox: teamMailbox,
    activeMemberCount: () => teamMembers.getActive().length, memberCount: () => teamMembers.size, stopLeadPolling: () => teamLeadPoller.stopTeamLeadPoller(), destroyMembers: () => teamMembers.destroyAll(), deleteTeam: () => teamManager.deleteTeam() });
  taskManager.init();
  const taskStorage = new TaskStorageService(resolve(stateDir, "tasks"));
  const taskTools = new TaskTools(taskStorage, { getTeamName: () => teamManager.getTeam()?.name,executeTaskCreatedHooks:(session,payload)=>nativeHooks!.sessionManager.executeTaskCreatedHooks(session,payload),executeTaskCompletedHooks:(session,payload)=>nativeHooks!.sessionManager.executeTaskCompletedHooks(session,payload) });
  taskTools.register(tools);
  const taskOutputs = new AgentTaskOutputFileManager(resolve(stateDir, "task-output"));
  const detachedExecutions = new Set<Promise<unknown>>();
  const createTask = (config: import("../agents/agent-task.js").AgentTaskConfig, main: HarnessSession) => {
    const task = new AgentTask(config, main, service, agents, sessions, stateMachine, {
      settings, interruptions, outputFiles: taskOutputs, idleTracker: teammateIdle,
      hooks:nativeHooks!.sessionManager,scopedHooks:nativeHooks!.registry,
      getTeamMember: (name, teamName) => teamMembers.get(name, teamName),
      hasQueuedTeamWork: (id) => sessions.getCachedSessions().some((session) => session.id === id && session.queue.length > 0),
      skills: async () => (await getSkillConfiguration()).skills, renderSkill: (skill) => commandRenderer.processContent(skill.instructions),
      killBackgroundTasksBySessionId: (id) => tools.killBackgroundTasksBySessionId(id),
    });
    const executeTask = task.execute.bind(task);
    task.execute = () => { const result = task.isDetached ? withTrace(new LocalNoopTrace(), executeTask) : executeTask(); if (task.isDetached) { detachedExecutions.add(result); void result.finally(() => detachedExecutions.delete(result)).catch(() => undefined); } return result; };
    return task;
  };
  const inProcessTeammateBackend = new InProcessTeammateBackend(createTask, taskManager);
  const detachedTeamHost = new StandaloneDetachedTeamHost({ stateDir, workDir: getWorkDir, mailbox: teamMailbox, sessions, interruptions,
    ...(options.webTools?.endpoint ? { webEndpoint: options.webTools.endpoint } : {}), ...(options.webTools?.accessToken ? { webAccessToken: options.webTools.accessToken } : {}),
    ...(options.mediaTools?.endpoint ? { mediaEndpoint: options.mediaTools.endpoint } : {}), ...(options.mediaTools?.accessToken ? { mediaAccessToken: options.mediaTools.accessToken } : {}),
    ...(options.apiKey ? { apiKey: options.apiKey } : {}), ...(options.baseURL ? { baseURL: options.baseURL } : {}), ...(options.model ? { model: options.model } : {}),
    ...(options.approveTool ? { approveTool: options.approveTool } : {}), ...(options.onTeamMemberUpdate ? { onUpdate: options.onTeamMemberUpdate } : {}), ...(options.logger ? { logger: options.logger } : {}) });
  const teammateBackend = options.teamBackend === "detached-process" ? detachedTeamHost.backend : inProcessTeammateBackend;
  async function createWorkflowSubagentSpawner(session: HarnessSession): Promise<WorkflowSubagentSpawner> {
    // Original Startup has already warmed the default agent before Workflow runs.
    await agents.getDefault();
    const factory = new AgentTaskExecutionFactory(new WorkflowSubagentPrompts(), createTask, taskManager);
    const spawner = new WorkflowSubagentSpawner(factory, worktreeService, worktreeChanges, cwdService, options.logger);
    spawner.setMainSession(session); return spawner;
  }
  const workflowRuntimes = new Set<StandaloneWorkflowRuntime>();
  const workflowRuntimeBySession = new Map<HarnessSession, Promise<StandaloneWorkflowRuntime>>();
  async function createWorkflowRuntime(session: HarnessSession): Promise<StandaloneWorkflowRuntime> {
    if (closed) throw new Error("Harness is closed");
    let pending = workflowRuntimeBySession.get(session);
    if (!pending) { pending = (async () => { const spawner = await createWorkflowSubagentSpawner(session); if (closed) throw new Error("Harness is closed"); const runtime = new StandaloneWorkflowRuntime({ stateDir, cwd: getWorkDir, parentSessionId: session.id, spawner, getCurrentSession: () => sessions.getCurrent(), refreshCommands: () => commandManager.refresh(), ...(options.workflowBuiltinDir ? { builtinDir: options.workflowBuiltinDir } : {}), ...(options.workflowEventWriter ? { eventWriter: options.workflowEventWriter } : {}), ...(options.getWorkflowAcpAgentManager ? { getAcpAgentManager: options.getWorkflowAcpAgentManager } : {}), ...(options.logger ? { logger: options.logger } : {}) }); workflowRuntimes.add(runtime); return runtime; })(); workflowRuntimeBySession.set(session, pending); }
    return pending;
  }
  if (!commandManager.isLocalCommand("/workflows")) commandManager.registerExecutor(new WorkflowsCommandExecutor({ listActive: () => [...workflowRuntimes].flatMap((runtime) => runtime.manager.listActive()).sort((a, b) => b.startedAt - a.startedAt) }, workflowRegistry, sessions, options.logger));
  if (!commandManager.isLocalCommand("/save-workflow")) commandManager.registerExecutor(new SaveWorkflowCommandExecutor({ saveAs: async (sessionId, runId, name, scope) => { const session = sessions.getCachedSessions().find((entry) => entry.id === sessionId); if (!session) throw new Error(`Session not found: ${sessionId}`); return (await createWorkflowRuntime(session)).manager.saveAs(sessionId, runId, name, scope); } }, sessions, options.logger));
  // Original notifier enqueues meta input and calls runDefault([]). The absent
  // desktop's deferred dispatcher is supplied by the existing standalone drain.
  const backgroundTaskNotifier = new BackgroundTaskNotifier(messageQueue, stateMachine, () => ({ runDefault: async (_input, { context }) => { scheduleQueueDispatch(context); } }), options.logger);
  const workflowTool = new WorkflowTool({
    start: async (input, context) => { const session = sessions.getCurrent(); if (!session || session.id !== context.sessionId) throw new Error("Workflow standalone host has no matching run context"); return (await createWorkflowRuntime(session)).manager.start(input, context); },
    abort: (id, reason) => { for (const runtime of workflowRuntimes) if (runtime.manager.abort(id, reason)) return true; return false; },
  }, cwdService, tools, backgroundTaskNotifier, taskOutputs, () => isWorkflowDisabled(settings), options.logger);
  const executeWorkflow = workflowTool.execute.bind(workflowTool);
  workflowTool.execute = async (input, context, details) => {
    // Adapter supplies native current-session precondition to direct/deferred
    // embedding calls and enforces the manager's absent availability gate.
    if (!await workflowTool.isEnabled(context?.context)) throw new Error("Workflow tool is disabled by environment or settings");
    return context?.context ? sessions.run(context.context, () => executeWorkflow(input, context, details)) : executeWorkflow(input, context, details);
  };
  const workflowFinalizers = new Set<Promise<void>>(), finalizeWorkflow = workflowTool.finalizeBackgroundTask.bind(workflowTool);
  workflowTool.finalizeBackgroundTask = (...args) => { const operation = finalizeWorkflow(...args); workflowFinalizers.add(operation); void operation.finally(() => workflowFinalizers.delete(operation)).catch(() => undefined); return operation; };
  workflowTool.register(tools);
  const addShellTask = shell.backgroundTasks.add.bind(shell.backgroundTasks);
  shell.backgroundTasks.add = (task) => { addShellTask(task); tools.addBackgroundTask(task); };
  const teamMemberRuntime = { mailbox: teamMailbox, messageQueue, stateMachine, manager: teamManager, registry: teamMembers, backend: teammateBackend, createTask, taskManager, idleTracker: teammateIdle, shutdown: shutdownCoordinator,
    runDefault: async (input: import("@openai/agents-core").AgentInputItem[], session: HarnessSession) => { for (const item of input) messageQueue.enqueueMessage(session, item); scheduleQueueDispatch(session); } };
  const teamSpawner = new TeamAgentSpawner(teamManager, teamMembers, taskManager, teamLeadPoller, teamMemberRuntime, getWorkDir);
  const skillTool = new SkillTool({ configuration: getSkillConfiguration, renderer: commandRenderer, renderPrompt: (content) => prompts.renderAsync(content),
    commands: options.commandHost ?? commandManager, createTask, tasks: taskManager, resolveModel: (value, source) => agents.resolveConfiguredModelOrFallback(value, source) });
  skillTool.register(tools);
  const slashCommandTool = new SlashCommandTool(skillTool.runtime); slashCommandTool.register(tools);
  const agentTool = new AgentTool(agents, taskManager, {
    createTask,
    teamsEnabled: () => teamManager.isEnabled(),
    spawnBackground: (session, spec) => teamSpawner.spawnBackground(session, spec), spawnTeammate: (session, spec) => teamSpawner.spawnTeammate(session, spec),
    worktrees: { create: (name) => worktreeService.create(name), hasChanges: async (worktree) => (await worktreeChanges.detect(worktree.worktreePath, worktree.headCommit)).hasChanges,
      remove: (worktree) => worktreeService.remove(worktree.worktreePath, { force: true, deleteBranch: true }), run: (directory, operation) => cwdService.runWithCwd(directory, operation) },
  });
  agentTool.register(tools);
  const taskOutputTools = new TaskOutputTools(taskManager, { get: (id) => (tools.getBackgroundTask(id) ?? shell.backgroundTasks.get(id)) as import("../tools/core-shell-tools.js").BackgroundShellTask | undefined, kill: (id) => tools.getBackgroundTask(id) ? tools.killBackgroundTask(id) : shell.backgroundTasks.kill(id) }, (id) => { const task = tools.getBackgroundTask(id); return task?.toolName === "Workflow" ? task as import("../tools/task-output-tools.js").WorkflowBackgroundTask : undefined; });
  taskOutputTools.register(tools);
  await mkdir(resolve(stateDir, "plans"), { recursive: true });
  const planTools = new PlanTools(plans, prompts, sessions, { mailbox: teamMailbox });
  planTools.register(tools);
  const askTool = new AskUserQuestionTool(asks);
  askTool.register(tools);
  const memory = autoMemory.extraction;
  let memoryPending: Promise<void> = Promise.resolve();
  async function waitForMemory(): Promise<void> { await memoryPending; await memory.waitForExtraction(); }
  const active = new Map<HarnessSession, Promise<string>>();
  const opened = new Set<HarnessSession>();
  const openingSessionIds = new Set<string>();
  const queueSubscriptions = new Map<HarnessSession, Array<{ unsubscribe(): void }>>();
  const dispatchingQueue = new Set<HarnessSession>();
  const dispatchScheduled = new Set<HarnessSession>();
  let closed = false;
  const watchQueue = (session: HarnessSession) => { if (!queueSubscriptions.has(session)) queueSubscriptions.set(session, [session.queueSubject.subscribe(() => scheduleQueueDispatch(session)), stateMachine.getChange$(session).subscribe(() => scheduleQueueDispatch(session))]); };
  const sessionQueueSubscription = sessions.sessionSubject.subscribe((session) => { if (session) watchQueue(session); });
  const cronStorageDir = resolve(options.cronStorageDir ?? resolve(stateDir, "cron"));
  const cronScheduler = new CronSchedulerService(cronState, stateMachine, messageQueue, { storageDir: () => cronStorageDir,
    runEmpty: async (session) => { scheduleQueueDispatch(session); }, ...(options.cronRuntime ? { timers: options.cronRuntime } : {}), ...(options.logger ? { logger: options.logger } : {}) });

  // Standalone replacement for the absent desktop frontend's deferred queue dispatch.
  // The recovered scheduler still enqueues meta messages; it never calls a model from tick().
  function scheduleQueueDispatch(session: HarnessSession): void {
    if (closed || dispatchScheduled.has(session)) return;
    dispatchScheduled.add(session);
    queueMicrotask(() => {
      dispatchScheduled.delete(session);
      if (closed || dispatchingQueue.has(session) || active.has(session) || session.abortSignal.aborted || session.isCompressing || !stateMachine.isIdle(session)) return;
      const regular = session.queue.filter((item) => !isQueueHoldItem(item)); if (!regular.length) return;
      const deferred = deferredQueueDispatch();
      dispatchingQueue.add(session);
      if (deferred) { const held = session.queue.filter(isQueueHoldItem); messageQueue.clearQueue(session); for (const item of held) messageQueue.enqueueMessage(session, item); }
      void prompt(session, deferred ? mergeConsecutiveUserMessages(regular) : []).then((output) => options.onScheduledOutput?.(output, session))
        .catch((error) => { if (!session.queue.length) { session.queue.push(...regular); session.queueSubject.next([...session.queue]); } options.logger?.warn(`Queue dispatch failed: ${String(error)}`); })
        .finally(() => { dispatchingQueue.delete(session); if (session.queue.some((item) => !isQueueHoldItem(item))) scheduleQueueDispatch(session); });
    });
  }

  const explicitProductProvider = { priority: 21001, volatile: true, async provide() { return { mergeStrategy: "smartMerge", ...(options.skills ? { skills: options.skills } : {}), ...(options.commands ? { commands: options.commands } : {}) }; } };
  productRuntime = createNativeProductHost({
    initialConfiguration: product.raw, getWorkDir, getHomeDir: () => stateDir,
    settingsManager: pluginSettings,
    ...(sdkControl ? { sdkInitializeState: sdkControl.initializeState } : {}),
    ...(pluginSource ? { plugins: pluginSource } : {}),
    ...(options.agentManager?.getCliOptions ? { cliOptions: options.agentManager.getCliOptions } : {}),
    mcpManager: nativeMcpProjection?.manager ?? { getConnectedServers: (opts:any) => mcp.getConnectedServers(opts), async getPrompt() { throw Error("MCP prompts require native MCP projection"); } },
    skillProvider, logger: { warn: (...args:any[]) => options.logger?.warn(args.map(String).join(' ')) },
    cwdService,
    ...(nativeMcpProjection ? { serverModelManager:nativeMcpProjection.models } : {}),
    watchDependencies: { memoryCache:memoryRules.cache,subdirectoryMemory:memoryRules.subdirLoader,settings,
      mcpConfig:nativeMcpProjection?.config,
      ...options.productRuntime?.watchDependencies,
    },
    ...options.productRuntime,
    providers: [explicitProductProvider, ...options.productRuntime?.providers ?? []],
    onConfiguration(configuration) {
      Object.assign(product, new ProductConfiguration(configuration));
      pluginProductChanges.fire(undefined);
      tools.invalidatePluginDependentToolCaches();
      return Promise.all([commandManager.refresh(), options.productRuntime?.onConfiguration?.(configuration)]).then(() => undefined);
    },
  });
  if (pluginHost) {
    pluginHost.attach({ hookManager:nativeHooks!.manager,skillProductProvider: skillProvider, toolManager: tools, commandManager, outputStyleManager: pluginHost.outputStyles,
      agentManager: agents, sessionManager: sessions, lspManager: { async reloadPluginServers() {
        if (closed) throw Error("Harness is closed");
        await lspManager.reloadPluginServers();
        if (!closed && options.lsp?.servers) lspManager.registerServers(options.lsp.servers, "standalone", "explicit-host-config");
      } },
      ...(nativeMcpProjection ? { mcpManager: nativeMcpProjection.manager, mcpPluginRegistry: nativeMcpProjection.pluginRegistry } : {}),
    });
    commandManager.registerExecutor(pluginHost.executor as any);
  }
  fallbackSettingsHost?.attach({hookManager:nativeHooks!.manager});
  const sdkHandlers = sdkControl ? attachHarnessSdkControl(sdkControl, {
    sessions, agents, commands: commandManager, product, plans,
    settings: pluginSettings,
    cliSettings: { async set(key: string, value: any) { await settingsHost.cli.set(key,value); sdkCliOverrides.add(key); } },
    logger: { warn: (...args: any[]) => options.logger?.warn(args.map(String).join(' ')) },
    initializeDependencies: {
      productManager: productRuntime.facade,
      ...(productRuntime.environmentHost ? { productEnvService: productRuntime.environmentHost.service, authManager: productRuntime.sourceHost.authentication } : {}),
      ...(nativeMcp ? { mcpReadyService: { waitForServersReady: () => mcp.waitForServersReady() }, mcpManager: { add: connectNativeMcp } } : {}),
      ...options.sdkControl?.initializeDependencies,
    },
  }) : undefined;

  async function openSession(id?: string, config: { sessionId?: string; print?: boolean; permissionMode?: PermissionMode; jsonSchema?: string | Record<string, unknown>; outputFormat?: "text" | "json" | "stream-json" } = {}): Promise<HarnessSession> {
    if (closed) throw new Error("Harness is closed");
    if (config.sessionId !== undefined && (id !== undefined || !/^[a-zA-Z0-9_-]+$/.test(config.sessionId))) throw Error("Explicit new sessionId must be a safe identifier and cannot accompany resume");
    if (config.sessionId !== undefined && openingSessionIds.has(config.sessionId)) throw Error("Session is already opening: " + config.sessionId);
    if (config.sessionId !== undefined) openingSessionIds.add(config.sessionId);
    try {
      if (config.sessionId !== undefined && await sessions.get(config.sessionId)) throw Error("Session already exists: " + config.sessionId);
      const session = id ? await sessions.get(id) : await sessions.create(config.sessionId ? {id:config.sessionId} : {});
      if (!session) throw new Error(`Session not found: ${id}`);
      opened.add(session);
      taskManager.setMainSession(session);
      session.options.workDir = getWorkDir();
      session.meta.cwd = getWorkDir();
      session.options.print = config.print === true;
      if (sdkControl) session.options.inputFormat = "stream-json";
      if (options.model) session.options.model = options.model;
      const overrideModel = sessions.getOverrideModel(session.id);
      if (overrideModel !== undefined) session.requestOptions.model = overrideModel;
      if (options.fallbackModel !== undefined) session.options.fallbackModel=options.fallbackModel;
      if (config.jsonSchema ?? options.jsonSchema) session.options.jsonSchema = config.jsonSchema ?? options.jsonSchema;
      if (config.outputFormat ?? options.outputFormat) session.options.outputFormat = config.outputFormat ?? options.outputFormat;
      const restored = session.meta.standalonePermissionMode as PermissionMode | undefined;
      session.permissionModeSubject.next(config.permissionMode ?? sessions.getOverridePermissionMode(session.id) ?? restored ?? PermissionMode.Default);
      await permissions.initializeContext(session);
      await sessions.emitSessionStart(session, id ? "resume" : "startup");
      watchQueue(session);
      cronScheduler.start(session);
      return session;
    } finally {
      if (config.sessionId !== undefined) openingSessionIds.delete(config.sessionId);
    }
  }

  async function execute(session: HarnessSession, input: string | AgentInputItem[], promptOptions: PromptOptions): Promise<string> {
    await waitForMemory();
    if (closed) throw new Error("Harness is closed");
    promptOptions.signal?.throwIfAborted();
    const abort = () => session.abortController.abort(promptOptions.signal?.reason);
    promptOptions.signal?.addEventListener("abort", abort, { once: true });
    const text = session.modelSubject.subscribe((event: any) => {
      if (!session.isCompressing && event?.type === "output_text_delta") promptOptions.onText?.(event.delta);
    });
    try {
      // Standalone/Web ingress mirrors the CLI's local-command dispatch; not a second agent loop.
      const local = typeof input === "string" ? commandManager.parseCommand(input) : undefined;
      if (local && !commandManager.isOverriddenByCustom(local.name)) {
        const start = session.history.length;
        await sessions.run(session, () => commandManager.executeLocalCommand({ ...local, session }));
        await sessions.flushHistory(session);
        const output = session.history.slice(start).flatMap((item:any) => {
          if (item.type !== "message" || item.role !== "user") return [];
          const text = typeof item.content === "string" ? item.content : item.content.filter((part:any) => part.type === "input_text").map((part:any) => part.text).join("\n");
          const parsed = CommandMessageUtils.parseOutput(text); return parsed ? [parsed.text] : [];
        }).join("\n");
        promptOptions.signal?.throwIfAborted(); promptOptions.onText?.(output); return output;
      }
      await service.runDefault(input, { context: session, ...(promptOptions.maxTurns ? { maxTurns: promptOptions.maxTurns } : {}) });
      if (promptOptions.signal?.aborted) abort();
      for (;;) {
        const result = session.resultSubject.value as any;
        if (!result) throw new Error("Run did not publish a result");
        let streamError: unknown;
        try { await result.completed; } catch (error) { streamError = error; }
        await sessions.waitForResultHandled(result);
        await interruptions.waitForResultHandled(result);
        // Deferred auto-compaction begins on setImmediate in the original runner.
        await nextTick();
        await compactions.get(session.id);
        if (session.resultSubject.value !== result) continue;
        promptOptions.signal?.throwIfAborted();
        if (result.error) throw result.error;
        if (interruptions.getResultError(result)) throw interruptions.getResultError(result);
        if (streamError && !result.silentAbort && !session.isCompressing) throw streamError;
        if (resultErrors.has(result)) throw resultErrors.get(result);
        const gate=sessions.getResultGate(result);
        if(gate&&await gate.completed&&!result.__cancelNudge&&!session.abortSignal.aborted&&!terminalRejectedResults.has(result)){
          await sessions.waitForNextResult(session,result,session.abortSignal);
          continue;
        }
        session.meta.standalonePermissionMode = session.permissionModeSubject.value;
        await sessions.save(session);
        const output = result.interruptions?.length ? undefined : result.finalOutput;
        // Keep an independent no-op context alive for the complete background
        // run, after the main prompt's AsyncLocal trace context has ended.
        if (!result.interruptions?.length) memoryPending = withTrace(new LocalNoopTrace(), async () => {
          await memory.waitForExtraction();
        }).catch((error) => options.logger?.warn(`Memory extraction host failed: ${String(error)}`));
        return typeof output === "string" ? output : output === undefined ? "" : JSON.stringify(output);
      }
    } catch (error) {
      stateMachine.transition(session, "run_failed");
      throw error;
    } finally {
      text.unsubscribe();
      promptOptions.signal?.removeEventListener("abort", abort);
    }
  }

  function prompt(session: HarnessSession, input: string | AgentInputItem[], promptOptions: PromptOptions = {}): Promise<string> {
    if (closed) return Promise.reject(new Error("Harness is closed"));
    if (active.has(session)) return Promise.reject(new Error("A prompt is already running for this session"));
    // SDK 0.5.2 Runner.tracingDisabled disables model traces but still creates
    // a root trace. An explicit NoopTrace also prevents root/tool export, without
    // mutating SDK global tracing settings in an embedding application's process.
    const operation = withTrace(new LocalNoopTrace(), () => execute(session, input, promptOptions));
    active.set(session, operation);
    void operation.finally(() => { if (active.get(session) === operation) active.delete(session); scheduleQueueDispatch(session); }).catch(() => undefined);
    return operation;
  }

  async function compact(session: HarnessSession, compactOptions: CompactOptions = {}): Promise<boolean> {
    if (closed || active.has(session)) throw new Error("Cannot compact a closed or busy harness session");
    await waitForMemory();
    return withTrace(new LocalNoopTrace(), () => compactor.compactAndSummarize(session, { force: true, skipContinue: true, ...compactOptions }));
  }

  async function close(): Promise<void> {
    if (closed) return;
    closed = true;
    for (const session of active.keys()) session.abortController.abort();
    sdkControl?.close();
    const mcpClosing = nativeMcp?.close();
    const environmentClosing=productRuntime?.environmentHost?.close();
    const settingsConsumersSettled=Promise.allSettled([mcpClosing,environmentClosing,interruptions.waitForPermissionWrites(),permissions.waitForUpdates()]);
    const pluginClosing = pluginHost?.close(settingsConsumersSettled);
    await mcpClosing;
    channelHost.close(); channelClients?.close(); channelApprovalTargets.clear();
    sessionQueueSubscription.unsubscribe(); teamLeadPoller.stopTeamLeadPoller(); teamMailbox.stopAll(); shutdownCoordinator.cancelAll("harness closed");
    for (const session of opened) session.teamCancelled = true;
    for (const session of opened) cronScheduler.stop(session.id);
    for (const subscriptions of queueSubscriptions.values()) for (const subscription of subscriptions) subscription.unsubscribe();
    queueSubscriptions.clear();
    for (const session of active.keys()) session.abortController.abort();
    for (const session of sessions.getCachedSessions()) if (session.meta.teamContext) session.abortController.abort();
    // Explicit host ownership adapter: release this harness's LSP requests so
    // uncancellable JSON-RPC calls cannot prevent the SDK close barrier.
    // Invalidate native scheduleRestart's identity gate before disposing the
    // in-flight client; otherwise that failure can spawn a new process at close.
    lspManager.languageConfigs.clear(); lspManager.extensionToLanguage.clear();
    await Promise.allSettled([...lspClients].map((client) => client.isRunning() ? client.shutdown() : client.cleanup()));
    await pluginClosing;
    await Promise.allSettled([...lspClients].map((client) => client.isRunning() ? client.shutdown() : client.cleanup()));
    pluginProductChanges.dispose();
    await productRuntime?.close();
    await Promise.allSettled([...active.values()]);
    await channelHost.waitForRuns();
    await Promise.allSettled([...workflowRuntimes].map((runtime) => runtime.close())); workflowRuntimes.clear();
    await Promise.allSettled(workflowRuntimeBySession.values()); workflowRuntimeBySession.clear();
    await Promise.allSettled(workflowFinalizers);
    await teamSpawner.waitForSpawns();
    await teamMembers.destroyAll();
    await detachedTeamHost.close();
    for (const task of taskManager.getTasks()) if (task.status === "running" || task.status === "pending") await task.kill();
    await Promise.allSettled([...detachedExecutions]);
    await waitForMemory();
    // Product handleExit returns a UI decision for dirty/hook worktrees. This
    // host defaults that unresolved choice to keep; clean worktrees are removed.
    if (worktreeSessions.isInWorktreeSession()) { if (await worktreeSessions.handleExit() === "keep") await worktreeSessions.keepWorktree(); }
    taskManager.stopCleanup();
    tools.backgroundTaskRegistry.dispose();
    await teamManager.cleanupSessionTeams();
    for (const task of shell.backgroundTasks.list()) if (task.status === "running") await task.kill();
    pendingSubscription.unsubscribe();
    for (const id of asks.getRoutingState().waitingDeferredKeys) asks.rejectAsk(id);
    asks.cleanup();
    for (const session of sessions.getCachedSessions()) {
      await nativeHooks!.sessionManager.executeSessionEndHooks(session,"other");
      await CronStorage.releaseLock(cronStorageDir, { sessionId: session.id, pid: process.pid });
      structuredContexts.dispose(session);
      interruptions.disposeSession(session);
      await sessions.flushHistory(session);
      sessions.release(session);
    }
    opened.clear();
    recordingStore.close();
    await lspManager.shutdownAll(); lspClients.clear();
    await delegateToolManager.clearTools(); delegateToolManager.clearConnection();
    await inputHistoryOwner.close();
    await agents.close();
    await memoryRules.close();
    await autoMemory.close();
    await settingsConsumersSettled;
    await fallbackSettingsHost?.close();
    await nativeHooks!.close();
    // Native auxiliary services create sessions outside openSession(). Release
    // this manager's remaining owned observers/timers at host teardown as well.
    for(const session of sessions.getCachedSessions()){
      session.abortController.abort();interruptions.disposeSession(session);
      await sessions.flushHistory(session);sessions.release(session);
    }
  }
  if(options.sessionLifecycle?.interceptors===undefined)responseInterceptors.push(...createNativeResponseInterceptors({
    getAgentService:()=>service,getAgentManager:()=>agents,utilities:responseUtilities,stateMachine,
    contextCompactSummarizer:compactor,
    productManager:options.productRefresh??{async sync(){throw new Error('Product configuration refresh requires an explicit host adapter');}},
    telemetryService:createSessionResultObservers(options.sessionLifecycle).telemetryService,
    logger:options.sessionLifecycle?.logger??{info:(...args)=>options.logger?.info?.(args.map(String).join(' ')),debug(){},warn:(...args)=>options.logger?.warn(args.map(String).join(' ')),error:(...args)=>options.logger?.warn(args.map(String).join(' '))},
  }));
  try{
    await settingsHost.start();
    await productRuntime.start();
    await agents.start(); await agents.getDefault();
    await pluginHost?.start();
    for (const [name, config] of Object.entries(options.nativeMcp?.servers ?? {})) {
      if ((config as any).type === "sdk") throw Error("Register SDK MCP servers through initialize after the control receiver is ready");
      await connectNativeMcp(name, config);
    }
  }catch(error){await close();throw error;}
  channelClients?.initializeConfigured();
  channelHost.start();
  return { product, agents, agentFactory, tools, mcp, sessions, store, service, stateMachine, interruptions, compactor, memory, memoryRules, autoMemory, hooks:nativeHooks, permissions, shell, taskManager, taskStorage, taskTools, agentTool, taskOutputTools, plans, planTools, asks, askTool, promptContext, createWorkflowSubagentSpawner, createWorkflowRuntime, workflowTool, backgroundTaskNotifier, recordingStore, recordReplayProvider: provider, webFetchTool, webSearchTool, webRuntime,
    sdkControl, sdkHandlers, nativeMcp, connectNativeMcp, productRuntime, productManager: productRuntime.facade, settingsHost,settingsManager:pluginSettings,pluginHost, pluginManager: pluginSource, pluginRuntimeRefresh: pluginHost?.refresh, channelHost, channelClients, channelManager, channelPermissionAdapter, wechatReplyTool, wecomReplyTool,
    delegateToolManager, delegateToolsChangedHandler, delegateTool,
    lspManager, lspTool,
    mediaRuntime, imageService, videoService, imageGenTool, imageEditTool, videoGenTool, imageToolHookInputProcessor,
    computerUseRuntime, computerUseExecutor, computerUseTool, functionCallResultProcessor, blobRuntime, blobStore, imageBlobService, toolResultBlobService, nativeImageUtils,inputHistory,responseInterceptors,
    skillProvider, commandManager, commandRenderer, references, skillTool, slashCommandTool, skillManageTool, notebookEdit, structuredOutputTool, structuredContexts, structuredStartHook, structuredStopHook,
    messageQueue, cronState, cronTools, cronScheduler, cwdService, worktreeInitializer, worktreeService, worktreeChanges, worktreeSessions, worktreeTools,
    teamMailbox, teamManager, teamMembers, teamCleanup, teamLeadPoller, teamTools, sendMessageTool, shutdownCoordinator, teammateBackend, inProcessTeammateBackend, detachedTeamHost, teammateIdle, teamSpawner, descriptionPolicy, openSession, prompt, compact, waitForMemory, close };
}

function isWithin(directory: string, path: string): boolean { return path.startsWith(directory + "/") || path.startsWith(directory + "\\"); }
