import * as fs from "node:fs";
import * as fsp from "node:fs/promises";
import { homedir } from "node:os";
import { createMemoryRuleUtilities } from "./memory-rule-utilities.js";
import { createConditionalRulesToolInjector } from "./conditional-rules-tool-injector.js";
import {
  MemoryManagerImpl,
  MemoryLoaderImpl,
  MemoryParserImpl,
  MemoryCacheImpl,
  MemoryValidatorImpl,
  GlobMatcherImpl,
  SubdirectoryMemoryLoaderImpl,
  ConditionalRulesServiceImpl,
} from "./native-memory-services.js";
export type MemoryRulesRuntime = {
  fs: any;
  utilities: ReturnType<typeof createMemoryRuleUtilities>;
  dependencies: Record<string, any>;
  getHookManager(): any;
};
export type MemoryRulesOptions = {
  /** Product config-home scope; defaults to this harness stateDir, not installed ~/.codebuddy. */
  homeDir?: string | (() => string);
  userHomeDir?: () => string;
  fs?: Partial<typeof fsp> & { accessSync?: typeof fs.accessSync };
  instructionsHooks?: {
    hasHooks(event: string): boolean | Promise<boolean>;
    executeHooks(event: string, input: Record<string, unknown>): any;
  };
  logger?: {
    setContext?(name: string): void;
    debug?(...args: any[]): void;
    info?(...args: any[]): void;
    warn?(...args: any[]): void;
    error?(...args: any[]): void;
  };
};
/** Standalone DI/I/O owner; source decisions live in the eight unabridged native classes. */
export function createMemoryRulesHost(
  workDir: () => string,
  stateDir: string,
  options: MemoryRulesOptions = {},
) {
  const io = { ...fsp, accessSync: fs.accessSync, ...options.fs },
    logger = Object.fromEntries(
      ["setContext", "debug", "info", "warn", "error"].map((name) => [
        name,
        (...args: any[]) => (options.logger as any)?.[name]?.(...args),
      ]),
    );
  const homeDir = () =>
    typeof options.homeDir === "function"
      ? options.homeDir()
      : (options.homeDir ?? stateDir);
  const utilities = createMemoryRuleUtilities({
    platform: process.platform,
    getWorkDir: workDir,
    getHomeDir: homeDir,
    getUserHomeDir: options.userHomeDir ?? homedir,
    fs: io,
  });
  const runtime: MemoryRulesRuntime = {
    fs: io,
    utilities,
    dependencies: { logger },
    getHookManager: () => options.instructionsHooks,
  };
  const manager = new MemoryManagerImpl(runtime),
    loader = new MemoryLoaderImpl(runtime),
    parser = new MemoryParserImpl(runtime),
    cache = new MemoryCacheImpl(runtime),
    validator = new MemoryValidatorImpl(runtime),
    globMatcher = new GlobMatcherImpl(runtime),
    subdirLoader = new SubdirectoryMemoryLoaderImpl(runtime),
    conditionalRules = new ConditionalRulesServiceImpl(runtime);
  Object.assign(runtime.dependencies, {
    memoryManager: manager,
    memoryLoader: loader,
    memoryCache: cache,
    parser,
    validator,
    globMatcher,
    subdirLoader,
  });
  for (const service of [
    manager,
    loader,
    parser,
    cache,
    validator,
    globMatcher,
    subdirLoader,
    conditionalRules,
  ]) {
    Object.assign(service, runtime.dependencies);
    service.initialize?.();
  }
  const pendingHooks = new Set<Promise<any>>(),
    dispatch = loader.dispatchInstructionsLoadedHooks.bind(loader);
  loader.dispatchInstructionsLoadedHooks = (memories: any) => {
    const promise = dispatch(memories);
    pendingHooks.add(promise);
    void promise.finally(() => pendingHooks.delete(promise)).catch(() => {});
    return promise;
  };
  return {
    runtime,
    manager,
    loader,
    parser,
    cache,
    validator,
    globMatcher,
    subdirLoader,
    conditionalRules,
    toolInjector: createConditionalRulesToolInjector(
      conditionalRules,
      utilities.PathUtils,
      logger,
    ),
    clear() {
      manager.clear();
      subdirLoader.clear();
    },
    async close() {
      while (pendingHooks.size) await Promise.allSettled([...pendingHooks]);
    },
  };
}
