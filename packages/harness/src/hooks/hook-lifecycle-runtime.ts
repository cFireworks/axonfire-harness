import * as fs from "node:fs";
import * as path from "node:path";
import { homedir } from "node:os";
import {
  createGenericHookHost,
  type GenericHookHostOptions,
} from "./hook-runtime.js";
import { createHookPlatformShell } from "./hook-platform-shell.js";
import { createHookPermissionUtils } from "./hook-permission-utils.js";
import { createHookMessageUtils } from "./hook-message-utils.js";
import { createHookLifecycleHelpers } from "./hook-lifecycle-helpers.js";
import * as trigger from "./hook-trigger-utils.js";
import { RunResultUtils } from "../agents/run-result-utils.js";
import { NativeHistorySummaryUtils } from "../sessions/input-processor-utils.js";
import { isToolExecutionError } from "../tools/tool-execution-error.js";
import * as toolErrors from "../tools/native-tool-errors.js";
import { SessionHookManagerImpl } from "./native-session-hook-manager.js";
import { ToolHookManagerImpl } from "./native-tool-hook-manager.js";
import { NativeToolExecutionPipeline } from "./native-tool-execution-pipeline.js";
export type HookLifecycleRuntime = {
  dependencies: Record<string, any>;
  utilities: any;
  helpers: ReturnType<typeof createHookLifecycleHelpers>;
  trigger: typeof trigger;
  toolErrors: typeof toolErrors;
  isToolExecutionError: typeof isToolExecutionError;
  env: NodeJS.ProcessEnv;
  now(): number;
  getCwd(): string;
  productCliName: string;
  consoleError(...args: any[]): void;
  getPaymentInterceptor(): any;
};
export type HookLifecycleHostOptions = Omit<
  GenericHookHostOptions,
  "shell" | "permissionUtils"
> & {
  shell?: GenericHookHostOptions["shell"];
  permissionUtils?: GenericHookHostOptions["permissionUtils"];
  fs?: any;
  platform?: NodeJS.Platform;
  which?: any;
  getHomeDir?: () => string;
  getCommandParserService?: () => any;
  productCliName?: string;
  sessionStore: {
    getSessionFilePath(id: string, parentSessionId?: any): string;
  };
  terminalNotificationService?: { sendNotification(...args: any[]): any };
  galileoSessionBridge?: any;
  /** Absent product IDE/backup/checkpoint/payment services remain explicit host adapters. */
  pipelineDependencies?: Record<string, any>;
  getPaymentInterceptor?: () => any;
};
/** Native lifecycle classes, with standalone ownership and explicit product dependencies. */
export function createHookLifecycleHost(options: HookLifecycleHostOptions) {
  const io = options.fs ?? fs;
  const shell =
    options.shell ??
    createHookPlatformShell({
      env: options.env ?? process.env,
      getCwd: options.workDir,
      platform: options.platform ?? process.platform,
      fs: io,
      which: options.which,
      warn: (...args: any[]) => options.logger?.warn?.(...args),
    });
  const permissionUtils =
    options.permissionUtils ??
    createHookPermissionUtils({
      getWorkDir: options.workDir,
      getHomeDir: options.getHomeDir ?? homedir,
      getCommandParserService: options.getCommandParserService,
      getDebugService: () => options.debugService,
    });
  const host = createGenericHookHost({ ...options, shell, permissionUtils });
  const watchers = new Set<() => void>();
  const nativeHelpers = createHookLifecycleHelpers({
    fs: io,
    path: {
      resolve: (...args: string[]) => path.resolve(options.workDir(), ...args),
    },
  });
  const helpers = {
    ...nativeHelpers,
    registerWatchPaths(...args: any[]) {
      const result = (nativeHelpers.registerWatchPaths as any)(...args);
      const dispose = () => {
        watchers.delete(dispose);
        result.dispose();
      };
      if (result.watcherCount > 0) watchers.add(dispose);
      return { ...result, dispose };
    },
  };
  const galileo = options.galileoSessionBridge ?? {
    addToolStartSpanEvent() {},
    addToolSuccessSpanEvent() {},
    addToolErrorSpanEvent() {},
  };
  const dependencies: any = {
    logger: host.runtime.dependencies.logger,
    hookManager: host.manager,
    sessionStore: options.sessionStore,
    terminalNotificationService: options.terminalNotificationService ?? {
      async sendNotification() {},
    },
    galileoSessionBridge: galileo,
  };
  const runtime: HookLifecycleRuntime = {
    dependencies,
    env: host.runtime.env,
    now: host.runtime.now,
    getCwd: options.workDir,
    trigger,
    helpers,
    toolErrors,
    isToolExecutionError,
    productCliName: options.productCliName ?? "CodeBuddy Code",
    consoleError: (...args: any[]) => options.logger?.error?.(...args),
    getPaymentInterceptor: options.getPaymentInterceptor ?? (() => undefined),
    utilities: {
      PathUtils: { getWorkDir: options.workDir },
      RunResultUtils,
      SummaryUtils: NativeHistorySummaryUtils,
      MessageContentUtils: createHookMessageUtils(),
    },
  };
  const sessionManager = new SessionHookManagerImpl(runtime),
    toolManager = new ToolHookManagerImpl(runtime);
  Object.assign(dependencies, {
    sessionHookManager: sessionManager,
    toolHookManager: toolManager,
    tryInterceptTool: () => null,
    checkIdeInputTransformation: () => null,
    async createFileBackupBeforeExecute() {},
    reportMcpToolCapabilityCall() {},
    async injectConditionalRules() {},
    checkpointService: { async createCheckpoint() {} },
    ...options.pipelineDependencies,
  });
  const pipeline = new NativeToolExecutionPipeline(runtime);
  return {
    ...host,
    lifecycleRuntime: runtime,
    sessionManager,
    toolManager,
    pipeline,
    permissionUtils,
    shell,
    async close() {
      for (const dispose of [...watchers]) dispose();
      await host.close();
    },
  };
}
