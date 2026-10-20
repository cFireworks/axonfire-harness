import { spawn as nodeSpawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
  fillFunctionCallResultHistory,
  isCustomHistoryItem,
} from "../sessions/history-utils.js";
import { createHookShellHelpers } from "./hook-shell-helpers.js";
import {
  createHookRuleMatcher,
  toPluginOptionEnvKey,
} from "./hook-rule-matcher.js";
import { createPromptHookProtocol } from "./prompt-hook-protocol.js";
import { HookExecutorImpl } from "./native-hook-executor.js";
import { HookManagerImpl } from "./native-hook-manager.js";
import { PromptHookServiceImpl } from "./native-prompt-hook-service.js";
import { ScopedHookRegistryImpl } from "./native-scoped-hook-registry.js";

export type GenericHookRuntime = {
  dependencies: Record<string, any>;
  env: NodeJS.ProcessEnv;
  now(): number;
  spawn: (...args: any[]) => any;
  setTimeout: (...args: any[]) => any;
  clearTimeout: (timer: any) => void;
  fetch: typeof fetch;
  shell: any;
  shellHelpers: any;
  utilities: any;
  pluginUtilities: { toPluginOptionEnvKey: typeof toPluginOptionEnvKey };
  ifRule: any;
  promptProtocol: ReturnType<typeof createPromptHookProtocol>;
  getAgentService(): any;
};

/** Explicit DI boundary. It does not discover installed settings, plugins, credentials or endpoints. */
export type GenericHookHostOptions = {
  workDir(): string;
  shell: {
    isWindows(): boolean;
    getShellConfiguration(): { executable: string; argsPrefix: string[] };
  };
  permissionUtils: {
    matchCommandRule(command: string, pattern: string): boolean;
    matchFileRule(file: string, pattern: string): boolean;
  };
  settings?: any;
  pluginManager?: any;
  sdkHooksManager?: any;
  endpointProvider?: any;
  hookProvider?: any;
  hookInputProcessorProvider?: any;
  agentManager?: any;
  runnerProvider?: any;
  getAgentService?: () => any;
  logger?: any;
  debugService?: any;
  env?: NodeJS.ProcessEnv;
  now?: () => number;
  uuid?: () => string;
  colorSecondary?: (text: string) => string;
  spawn?: (...args: any[]) => any;
  fetch?: typeof fetch;
  setTimeout?: (...args: any[]) => any;
  clearTimeout?: (timer: any) => void;
};

export function createGenericHookHost(options: GenericHookHostOptions) {
  const children = new Set<any>(),
    timers = new Set<any>();
  const schedule: any = options.setTimeout ?? setTimeout;
  const cancel = options.clearTimeout ?? clearTimeout;
  const logger = Object.fromEntries(
    ["debug", "info", "warn", "error"].map((name) => [
      name,
      (...args: any[]) => options.logger?.[name]?.(...args),
    ]),
  );
  const unavailable = (name: string): never => {
    throw Error(`Hook host dependency not configured: ${name}`);
  };
  const uuid = options.uuid ?? randomUUID;
  const eu = { generateUUUID: uuid },
    em = {
      ThemeUtils: {
        chalk: {
          secondary: options.colorSecondary ?? ((text: string) => text),
        },
      },
    };
  // Native InputItemUtils.createHookMessage, UTF-16 13266826..13267176.
  class HookInputItemUtils {
    static isCustomInputItem = isCustomHistoryItem;
    static createHookMessage(eA: any, el: any = {}, ec?: any, ed?: any): any {
      let {
        status: ep = "completed",
        skipRun: eg = !0,
        error: eh,
        hookStatus: ef,
        exitCode: eE,
      } = el;
      return {
        id: (0, eu.generateUUUID)(),
        type: "message",
        role: "assistant",
        status: ep,
        content: [
          { type: "output_text", text: em.ThemeUtils.chalk.secondary(eA) },
        ],
        providerData: {
          skipRun: eg,
          error: eh,
          hookEvent: ec,
          callId: ed,
          hookStatus: ef,
          exitCode: eE,
        },
      };
    }
  }
  const runtime: GenericHookRuntime = {
    dependencies: {},
    env: options.env ?? process.env,
    now: options.now ?? Date.now,
    spawn(...args: any[]) {
      const child = (options.spawn ?? (nodeSpawn as any))(...args);
      children.add(child);
      child.once("exit", () => children.delete(child));
      child.once("error", () => children.delete(child));
      return child;
    },
    setTimeout(callback: (...args: any[]) => void, ms: number, ...args: any[]) {
      const timer = schedule(() => {
        timers.delete(timer);
        callback(...args);
      }, ms);
      timers.add(timer);
      return timer;
    },
    clearTimeout(timer: any) {
      timers.delete(timer);
      cancel(timer);
    },
    fetch: options.fetch ?? fetch,
    shell: { ...options.shell },
    shellHelpers: undefined,
    utilities: {
      PathUtils: { getWorkDir: options.workDir },
      InputItemUtils: HookInputItemUtils,
      HistoryUtils: { fillFunctionCallResultHistory },
    },
    pluginUtilities: { toPluginOptionEnvKey },
    ifRule: createHookRuleMatcher(options.permissionUtils),
    promptProtocol: createPromptHookProtocol(options.workDir),
    getAgentService:
      options.getAgentService ?? (() => unavailable("AgentService")),
  };
  runtime.shellHelpers = createHookShellHelpers(runtime);
  Object.assign(runtime.shell, {
    windowsPathToUnix: runtime.shellHelpers.windowsPathToUnix,
    parseCommandLine: runtime.shellHelpers.parseCommandLine,
  });
  const provider = { sortSync: () => [] };
  Object.assign(runtime.dependencies, {
    logger,
    debugService: options.debugService ?? {
      debug: (...args: any[]) => logger.debug!(...args),
    },
    settingsManager: options.settings ?? { get: async () => undefined },
    pluginManager: options.pluginManager ?? {
      getActivePlugins: async () => [],
    },
    sdkHooksManager: options.sdkHooksManager ?? {
      getHooks: () => [],
      invokeCallback: () => unavailable("SdkHooksManager.invokeCallback"),
    },
    endpointProvider: options.endpointProvider ?? {
      get: async () => unavailable("EndpointProvider"),
    },
    hookProvider: options.hookProvider ?? provider,
    hookInputProcessorProvider: options.hookInputProcessorProvider ?? provider,
    agentManager: options.agentManager,
    runnerProvider: options.runnerProvider,
  });
  const registry = new ScopedHookRegistryImpl(runtime);
  const executor = new HookExecutorImpl(runtime);
  const promptService = new PromptHookServiceImpl(runtime);
  Object.assign(runtime.dependencies, {
    scopedHookRegistry: registry,
    hookExecutor: executor,
    promptHookService: promptService,
  });
  const manager = new HookManagerImpl(runtime);
  return {
    runtime,
    registry,
    executor,
    promptService,
    manager,
    /** Host-only ownership cleanup, not a new branch in the captured executor. */
    async close() {
      for (const child of children) {
        try {
          child.kill("SIGTERM");
        } catch {}
      }
      if (children.size)
        await new Promise((resolve) => setTimeout(resolve, 30));
      for (const child of children) {
        try {
          child.kill("SIGKILL");
        } catch {}
      }
      children.clear();
      for (const timer of timers) cancel(timer);
      timers.clear();
    },
  };
}
