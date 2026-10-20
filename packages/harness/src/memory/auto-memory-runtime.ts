import * as fs from "node:fs";
import * as fsp from "node:fs/promises";
import * as os from "node:os";
import { randomUUID } from "node:crypto";
import { execSync } from "node:child_process";
import { resolve } from "node:path";
import { createMemoryFreshness } from "./memory-freshness.js";
import { createMemoryPromptBuilder } from "./memory-prompt-builder.js";
import { createNativeMemoryScanner } from "./native-memory-scanner.js";
import { createAutoMemoryUtilities } from "./auto-memory-utilities.js";
import { loadMemoryPolicy } from "./memory-extraction-prompts.js";
import { parseMemorySemanticType } from "./memory-store.js";
import {
  MemoryRelevanceServiceImpl,
  MemoryExtractionServiceImpl,
  MemoryExtractionStopHook,
  MemoryFreshnessPostToolHook,
} from "./native-auto-memory-services.js";
import { MemoryContextInterceptor } from "../agents/memory-context-interceptor.js";
import { addSystemReminder } from "../agents/system-reminder-agent-run-interceptor.js";
import { createResponseInputUtils } from "../sessions/response-input-utils.js";
import { INTERRUPTED_BY_USER_MESSAGE } from "../models/model-error-utils.js";
import { fillFunctionCallResultHistory } from "../sessions/history-utils.js";
import { ToolResult } from "../tools/tool-result.js";
export type AutoMemoryRuntime = {
  dependencies: Record<string, any>;
  env: NodeJS.ProcessEnv;
  fs: any;
  fsPromises: any;
  now(): number;
  uuid(): string;
  isTTY(): boolean;
  setTimeout(callback: () => void, ms: number): any;
  os: any;
  utilities: any;
  scanner: any;
  freshness: any;
  prompts: any;
  getAgentService(): any;
};
export type AutoMemoryOptions = {
  env?: NodeJS.ProcessEnv;
  fs?: Partial<typeof fs>;
  fsPromises?: Partial<typeof fsp>;
  now?: () => number;
  uuid?: () => string;
  isTTY?: () => boolean;
  setTimeout?: (callback: () => void, ms: number) => any;
  gitUserName?: () => string | undefined;
  userInfo?: () => { username: string };
  getProjectMemoryDir?: (id?: string) => string;
  getTeamMemoryDir?: (userId: string) => string;
  getSessionHistoryDir?: (id?: string) => string;
};
/** Standalone filesystem/DI ownership. Native decisions are isolated in the source classes. */
export async function createAutoMemoryHost(input: {
  workDir: () => string;
  stateDir: string;
  settings: any;
  sessions: any;
  stateMachine: any;
  getAgentService(): any;
  runnerProvider: any;
  logger?: any;
  options?: AutoMemoryOptions | undefined;
}) {
  const options = input.options ?? {},
    io = { ...fs, ...options.fs },
    fsPromises = { ...fsp, ...options.fsPromises },
    logger = Object.fromEntries(
      ["setContext", "debug", "info", "warn", "error"].map((k) => [
        k,
        (...args: any[]) => input.logger?.[k]?.(...args),
      ]),
    ),
    now = options.now ?? Date.now,
    uuid = options.uuid ?? randomUUID;
  const {
    PathUtils: originalPaths,
    MessageUtils,
    GitUtils,
  } = createAutoMemoryUtilities({
    childProcess: {
      execSync: (command: string, opts: any) =>
        execSync(command, { ...opts, cwd: input.workDir() }),
    },
    fs: io,
    getWorkDir: input.workDir,
    getHomeDir: () => input.stateDir,
    addSystemReminder,
  });
  const PathUtils = {
    getCompressedWorkDir: () => originalPaths.getCompressedWorkDir(),
    getProjectMemoryDir:
      options.getProjectMemoryDir ?? (() => resolve(input.stateDir, "memory")),
    getTeamMemoryDir:
      options.getTeamMemoryDir ??
      ((id: string) => originalPaths.getTeamMemoryDir(id)),
    getSessionHistoryDir:
      options.getSessionHistoryDir ??
      (() => resolve(input.stateDir, "sessions")),
  };
  const policy = await loadMemoryPolicy(),
    runtime: AutoMemoryRuntime = {
      dependencies: {
        logger,
        settingsManager: input.settings,
        sessionManager: input.sessions,
        stateMachine: input.stateMachine,
        runnerProvider: input.runnerProvider,
      },
      env: options.env ?? process.env,
      fs: io,
      fsPromises,
      now,
      uuid,
      isTTY: options.isTTY ?? (() => !!process.stdout.isTTY),
      setTimeout: options.setTimeout ?? setTimeout,
      os: { userInfo: options.userInfo ?? os.userInfo },
      utilities: {
        PathUtils,
        MessageUtils,
        GitUtils: {
          getGitUserName:
            options.gitUserName ?? (() => GitUtils.getGitUserName()),
        },
        InputItemUtils: createResponseInputUtils(uuid),
        INTERRUPTED_BY_USER_MESSAGE,
        HistoryUtils: { fillFunctionCallResultHistory },
      },
      scanner: undefined,
      freshness: createMemoryFreshness({ now }),
      prompts: undefined,
      getAgentService: input.getAgentService,
    };
  runtime.scanner = createNativeMemoryScanner(
    { fs: io, fsPromises, warn: (...args: any[]) => logger.warn?.(...args) },
    parseMemorySemanticType,
  );
  runtime.prompts = createMemoryPromptBuilder(policy, {
    fs: io,
    getSessionHistoryDir: PathUtils.getSessionHistoryDir,
    warn: (...args: any[]) => logger.warn?.(...args),
  });
  const relevance = new MemoryRelevanceServiceImpl(runtime),
    extraction = new MemoryExtractionServiceImpl(runtime),
    stopHook = new MemoryExtractionStopHook(runtime),
    freshnessHook = new MemoryFreshnessPostToolHook(runtime);
  Object.assign(runtime.dependencies, {
    memoryRelevanceService: relevance,
    extractionService: extraction,
  });
  for (const value of [relevance, extraction, stopHook, freshnessHook]) {
    Object.assign(value, runtime.dependencies);
    value.init?.();
  }
  const context = new MemoryContextInterceptor(runtime);
  // Product Startup creates this directory; our explicit host owns its replacement.
  await fsPromises.mkdir(PathUtils.getProjectMemoryDir(), { recursive: true });
  return {
    runtime,
    relevance,
    extraction,
    stopHook,
    freshnessHook,
    context,
    originalPaths,
    async postToolUse(
      name: string,
      tool_input: any,
      session: any,
      result: any,
    ) {
      if (name !== "Read" || !result) return;
      const output = await freshnessHook.execute({ tool_input, session });
      const additional = output?.hookSpecificOutput?.additionalContext;
      if (additional && ToolResult.is(result)) {
        const suffix = `\n<system-reminder data-role="tool-hint">${additional}</system-reminder>`;
        result.content =
          typeof result.content === "string"
            ? result.content + suffix
            : String(result.content || "") + suffix;
      }
    },
    async close() {
      await extraction.waitForExtraction();
    },
  };
}
