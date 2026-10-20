import { Agent, type AgentInputItem } from "@openai/agents";
import { existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import type { AgentService } from "../agents/agent-service.js";
import { HarnessSession } from "../sessions/session.js";
import { PermissionMode } from "../permissions/permission.js";
import {
  fillFunctionCallResultHistory,
  type HistoryItem,
} from "../sessions/history-utils.js";
import { buildExtractPrompt } from "./memory-extraction-prompts.js";
import { formatMemoryManifest, scanMemoryFiles } from "./memory-store.js";
import * as fs from "node:fs";
import * as fsPromises from "node:fs/promises";
import { MemoryExtractionServiceImpl } from "./native-auto-memory-services.js";
import type { AutoMemoryRuntime } from "./auto-memory-runtime.js";
import { createMemoryPromptBuilder } from "./memory-prompt-builder.js";
import { loadMemoryPolicySync } from "./memory-extraction-prompts.js";

const MEMORY_TOOL_NAMES = new Set(["Read", "Grep", "Glob", "Write", "Edit"]);

export type LegacyExtractionOptions = {
  settings?: any;
  projectMemoryDirectory?: () => string | undefined;
  logger?: any;
  nativeRuntime?: AutoMemoryRuntime;
  runnerProvider?: any;
};
function compatibilityRuntime(
  service: AgentService,
  options: LegacyExtractionOptions,
): AutoMemoryRuntime {
  const logger = Object.fromEntries(
    ["setContext", "debug", "info", "warn", "error"].map((k) => [
      k,
      (...args: any[]) => options.logger?.[k]?.(...args),
    ]),
  );
  return {
    dependencies: {
      logger,
      settingsManager: options.settings ?? { get: async () => undefined },
      sessionManager: (service as any).sessions ?? {
        runWithoutHistory: (fn: any) => fn(),
      },
      runnerProvider: options.runnerProvider ?? {
        get: () => (service as any).runnerFactory.create(),
      },
    },
    env: process.env,
    fs,
    fsPromises,
    now: Date.now,
    uuid: randomUUID,
    isTTY: () => !!process.stdout.isTTY,
    setTimeout,
    os: {},
    utilities: {
      PathUtils: {
        getCompressedWorkDir: () => "",
        getProjectMemoryDir: () => options.projectMemoryDirectory?.(),
      },
      HistoryUtils: { fillFunctionCallResultHistory },
    },
    scanner: { scanMemoryFiles, formatMemoryManifest },
    freshness: {},
    prompts: createMemoryPromptBuilder(loadMemoryPolicySync(), {
      fs,
      getSessionHistoryDir: () => "",
      warn: (...args: any[]) => logger.warn?.(...args),
    }),
    getAgentService: () => service,
  };
}
/** Constructor compatibility; normal extraction/cursor methods are the complete native class.
 * extract()/shouldExtract() below are legacy embedding helpers, not called by doExtract(). */
export class MemoryExtractionService extends MemoryExtractionServiceImpl {
  constructor(
    private readonly service: AgentService,
    options: LegacyExtractionOptions = {},
  ) {
    super(options.nativeRuntime ?? compatibilityRuntime(service, options));
  }

  shouldExtract(input: {
    enabled: boolean;
    projectMemoryDirectory?: string;
    newMessageCount: number;
    mainAgentWroteMemory: boolean;
  }): boolean {
    return Boolean(
      input.enabled &&
        input.projectMemoryDirectory &&
        input.newMessageCount >= 2 &&
        !input.mainAgentWroteMemory,
    );
  }

  async extract(
    sourceAgent: Agent<HarnessSession>,
    session: HarnessSession,
    repairedHistory: AgentInputItem[],
    extractionPrompt: string,
  ): Promise<string> {
    const memoryAgent = new Agent<HarnessSession>({
      name: `${sourceAgent.name}-memory-extractor`,
      instructions: sourceAgent.instructions,
      model: sourceAgent.model,
      modelSettings: { ...sourceAgent.modelSettings },
      handoffs: [],
      tools: sourceAgent.tools.filter((candidate: any) =>
        MEMORY_TOOL_NAMES.has(candidate.name),
      ),
    });
    const previousPurpose = session.agentPurpose;
    const previousPermission = session.permissionModeSubject.value;
    // The product uses a distinct RunContext and suppresses transcript writes.
    const extractionSession = new HarnessSession(session.id, {
      options: { ...session.options, sessionPersistence: false },
      requestOptions: { ...session.requestOptions },
      meta: { ...session.meta },
      toolPermissionContext: session.toolPermissionContext,
      conversationRequestId: randomUUID().replace(/-/g, ""),
      agentPurpose: "memory_extraction",
    });
    const abort = (): void => extractionSession.abortController.abort();
    session.abortSignal.addEventListener("abort", abort, { once: true });
    if (session.abortSignal.aborted) abort();
    session.permissionModeSubject.next(PermissionMode.BypassPermissions);
    session.agentPurpose = "memory_extraction";
    try {
      return await this.service.runTransientAgent(
        memoryAgent,
        [...repairedHistory, userItem(extractionPrompt)],
        extractionSession,
        { maxTurns: 5, bypassPermissions: true },
      );
    } finally {
      session.abortSignal.removeEventListener("abort", abort);
      session.permissionModeSubject.next(previousPermission);
      if (previousPurpose === undefined) delete session.agentPurpose;
      else session.agentPurpose = previousPurpose;
    }
  }
}

function userItem(text: string): AgentInputItem {
  return {
    type: "message",
    role: "user",
    content: [{ type: "input_text", text }],
  };
}
