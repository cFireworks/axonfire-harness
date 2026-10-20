import * as fs from "node:fs";
import { createMemoryRuleUtilities } from "../memory/memory-rule-utilities.js";
import { ToolArgumentRewriteService } from "../tools/tool-argument-rewrite-service.js";
import { createNativeCommandSafety } from "./native-command-safety.js";
import { createNativePermissionUtils } from "./native-permission-utils.js";
import { createNativeToolPermissionService } from "./native-tool-permission-service.js";
import { createNativeToolPermissionStrategies } from "./native-tool-permission-strategies.js";
export type ToolPermissionHostOptions = {
  getWorkDir(): string;
  getHomeDir(): string;
  settingsManager: any;
  sessionStore: any;
  planStorageService: any;
  sessionHookManager: any;
  toolHookManager: any;
  directoryTrusted?: boolean;
  isTTY?: boolean;
  autoModePermissionService?: any;
  bashSandboxManager?: any;
  commandParserService?: any;
  commandSafety?: any;
  logger?: any;
  /** Passive host observation after the complete original SDK permission gate; never changes its decision. */
  onSdkDecision?(
    tool: any,
    context: any,
    input: any,
    callId: string | undefined,
    needsApproval: boolean,
  ): void;
};
/** Owned standalone composition; never reads installed app settings or invokes a real classifier implicitly. */
export function createToolPermissionHost(options: ToolPermissionHostOptions) {
  const quiet = {
    debug(..._args: any[]) {},
    info(..._args: any[]) {},
    warn(..._args: any[]) {},
    error(..._args: any[]) {},
  };
  const logger = { ...quiet, ...options.logger };
  const pathUtils = createMemoryRuleUtilities({
    getWorkDir: options.getWorkDir,
    getHomeDir: options.getHomeDir,
    getUserHomeDir: options.getHomeDir,
    platform: process.platform,
    fs,
  }).PathUtils;
  const commands = createNativeCommandSafety(options.commandSafety);
  const permissionUtils = createNativePermissionUtils({
    pathUtils,
    getHomeDir: options.getHomeDir,
    isWindows: process.platform === "win32",
    commandUtils: commands.CommandUtils,
    settingsManager: options.settingsManager,
    debugService: logger,
    consoleManager: logger,
    commandParserService: options.commandParserService,
  });
  const strategies = createNativeToolPermissionStrategies({
    permissionUtils,
    pathUtils,
    commandUtils: commands.CommandUtils,
    settingsManager: options.settingsManager,
    planStorageService: options.planStorageService,
    logger,
  });
  const service = createNativeToolPermissionService(
    {
      permissionUtils,
      commandUtils: commands.CommandUtils,
      riskLevel: commands.RiskLevel,
      pathUtils,
      sessionHookManager: options.sessionHookManager,
      getStrategies: () => strategies,
      isTTY: options.isTTY ?? false,
    },
    {
      logger,
      debugService: logger,
      settingsManager: options.settingsManager,
      sessionStore: options.sessionStore,
      directoryTrustService: {
        isTrustDirectory: options.directoryTrusted === true,
      },
      toolArgumentRewriteService: new ToolArgumentRewriteService(),
      toolHookManager: options.toolHookManager,
      bashSandboxManager: options.bashSandboxManager ?? {
        async getConfig() {
          return undefined;
        },
      },
      autoModePermissionService: options.autoModePermissionService ?? {
        async isAutoModeAvailable() {
          return { available: false, reason: "No classifier host configured" };
        },
        async classifyAsk() {
          throw Error("No classifier host configured");
        },
      },
    },
  );
  const initialized = new WeakMap<object, Promise<void>>();
  const pendingUpdates = new Set<Promise<any>>();
  const applyUpdate = service.applyUpdate.bind(service);
  service.applyUpdate = (...args: Parameters<typeof applyUpdate>) => {
    const job = applyUpdate(...args);
    pendingUpdates.add(job);
    void job.then(
      () => pendingUpdates.delete(job),
      () => pendingUpdates.delete(job),
    );
    return job;
  };
  async function initializeContext(session: any) {
    let ready = initialized.get(session);
    if (!ready) {
      const old = session.toolPermissionContext;
      const context = permissionUtils.createDefaultToolPermissionContext();
      for (const kind of ["allowRules", "denyRules", "askRules"])
        if (old?.[kind]) Object.assign(context[kind], old[kind]);
      session.toolPermissionContext = context;
      ready = service.initializeContext(session);
      initialized.set(session, ready!);
    }
    await ready;
  }
  return {
    service,
    permissionUtils,
    strategies,
    commands,
    pathUtils,
    initializeContext,
    async waitForUpdates() {
      while (pendingUpdates.size) await Promise.allSettled([...pendingUpdates]);
    },
    get pendingUpdateCount() {
      return pendingUpdates.size;
    },
    async needsApproval(
      tool: any,
      context: any,
      input: any,
      callId?: string,
      resolveArgs?: any,
    ) {
      if (context?.context) await initializeContext(context.context);
      const result = service.needsApproval(
        tool,
        context,
        input,
        callId,
        resolveArgs,
      );
      if (!options.onSdkDecision) return result;
      const decision = await result;
      options.onSdkDecision(tool, context, input, callId, decision);
      return decision;
    },
    async checkPermission(
      tool: any,
      context: any,
      input: any,
      callId?: string,
      resolveArgs?: any,
    ) {
      if (context?.context) await initializeContext(context.context);
      return service.checkPermission(tool, context, input, callId, resolveArgs);
    },
  };
}
