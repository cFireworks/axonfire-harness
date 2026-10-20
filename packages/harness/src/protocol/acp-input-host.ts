import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { AsyncLocalStorage } from "node:async_hooks";
import type { createHarness } from "../runtime/create-harness.js";
import type { HarnessSession } from "../sessions/session.js";
import { NativeHistoryInputUtils } from "../sessions/input-processor-utils.js";
import {
  CommandMessageUtils,
  COMMAND_MESSAGE_TYPES,
} from "../commands/command-message-utils.js";
import { INTERRUPTED_BY_USER_MESSAGE } from "../models/model-error-utils.js";
import { createOwnedPluginFilesystem } from "../plugins/owned-plugin-filesystem.js";
import {
  createUserPromptHost,
  type UserPromptHostOptions,
} from "../prompts/user-prompt-host.js";
import { createCapturedAcpModules } from "./captured-acp-modules.js";
import { createNativeAcpInputRenderer } from "./native-acp-input-renderer.js";
import { createNativeSessionPrompt } from "../sessions/native-session-prompt.js";

type Backend = Awaited<ReturnType<typeof createHarness>>;
export type AcpPromptRequest = { prompt: any[]; _meta?: Record<string, any> };
export type AcpInputHostOptions = {
  stateDir: string;
  getWorkDir(): string;
  backend: Backend;
  session: HarnessSession;
  desiredConfig: any;
  projectId?: string;
  readRoots?: string[];
  userPromptHost?: Awaited<ReturnType<typeof createUserPromptHost>>;
  userPrompts?: Omit<UserPromptHostOptions, "stateDir" | "getWorkDir">;
  onSessionUpdate?: (payload: any) => void | Promise<void>;
  logger?: any;
  runtime?: { Date?: any; crypto?: any; modules?: Record<number, any> };
};

/** Standalone SDK ingress, not the Desktop daemon/RPC server or its account/history store. */
export async function createAcpInputHost(options: AcpInputHostOptions) {
  await fs.promises.mkdir(path.resolve(options.stateDir), { recursive: true });
  const root = await fs.promises.realpath(path.resolve(options.stateDir));
  const prompts =
    options.userPromptHost ??
    (await createUserPromptHost({
      ...options.userPrompts,
      stateDir: path.join(root, "prompts"),
      getWorkDir: options.getWorkDir,
    }));
  const ownsPrompts = !options.userPromptHost;
  const { backend, session } = options;
  const pending = new Set<Promise<any>>(),
    operations = new AsyncLocalStorage<{ active: number }>();
  let closed = false,
    busy = false,
    closing: Promise<void> | undefined,
    compactDuringPrompt = false;
  const logger: any = Object.fromEntries(
    ["info", "warn", "error", "debug"].map((name) => [
      name,
      (...args: any[]) => options.logger?.[name]?.(...args),
    ]),
  );
  function guard() {
    if (closed && !operations.getStore()?.active)
      throw Error("ACP input host is closed");
  }
  function own<T>(callback: () => T): T {
    guard();
    let operation = operations.getStore();
    operation = operation?.active ? operation : { active: 0 };
    operation.active++;
    let value: T;
    try {
      value = operations.run(operation, callback);
    } catch (error) {
      operation.active--;
      throw error;
    }
    if (value && typeof (value as any).then === "function") {
      const job = value as unknown as Promise<any>;
      pending.add(job);
      void job.then(
        () => {
          pending.delete(job);
          operation!.active--;
        },
        () => {
          pending.delete(job);
          operation!.active--;
        },
      );
    } else operation.active--;
    return value;
  }
  const inside = (base: string, file: string) => {
    const rel = path.relative(base, file);
    return (
      rel !== ".." && !rel.startsWith(".." + path.sep) && !path.isAbsolute(rel)
    );
  };
  function readable(target: string) {
    guard();
    const file = path.resolve(target),
      roots = [
        root,
        path.resolve(options.getWorkDir()),
        ...(options.readRoots ?? []).map((p) => path.resolve(p)),
      ];
    const allowed = roots.find((base) => inside(base, file));
    if (!allowed) throw Error("ACP image read is outside owned state/project");
    let ancestor = file;
    while (!fs.existsSync(ancestor)) {
      const parent = path.dirname(ancestor);
      if (parent === ancestor) break;
      ancestor = parent;
    }
    if (!inside(fs.realpathSync(allowed), fs.realpathSync(ancestor)))
      throw Error("ACP image read traverses external symlink");
    return file;
  }
  const writes = createOwnedPluginFilesystem(root);
  const ownedFs = {
    existsSync(file: string) {
      try {
        return fs.existsSync(readable(file));
      } catch {
        return false;
      }
    },
    readFileSync: (file: string, ...args: any[]) =>
      (fs.readFileSync as any)(readable(file), ...args),
    mkdirSync: (file: string, ...args: any[]) => {
      guard();
      return (fs.mkdirSync as any)(writes.assertWritePath(file), ...args);
    },
    writeFileSync: (file: string, ...args: any[]) => {
      guard();
      return (fs.writeFileSync as any)(writes.assertWritePath(file), ...args);
    },
  };
  const ConsoleManager = Symbol("OwnedAcpConsole");
  const native = createCapturedAcpModules({
    Date: options.runtime?.Date,
    fs: ownedFs,
    os: { ...os, homedir: () => root, tmpdir: () => path.join(root, "tmp") },
    env: { CODEBUDDY_CONFIG_DIR: path.join(root, "cli") },
    logger,
    modules: {
      80699: {
        ContainerUtil: {
          get(token: symbol) {
            if (token === ConsoleManager) return logger;
            throw Error("Unsupported ACP DI token");
          },
        },
      },
      8443: { ConsoleManager },
      58830: { InputItemUtils: NativeHistoryInputUtils },
      8046: { INTERRUPTED_BY_USER_MESSAGE },
      67019: { CommandMessageUtils, CommandType: COMMAND_MESSAGE_TYPES },
      ...options.runtime?.modules,
    },
  });
  const { renderer, applyAcpPromptTimestamp } = createNativeAcpInputRenderer(
    native.codec,
    { timestamps: native.timestamps, AcpUtils: native.AcpUtils },
  );
  const ownerNative = createNativeSessionPrompt({
    crypto: options.runtime?.crypto,
  });
  const owner = new ownerNative.NativeSessionPrompt();
  const stored: any = session.meta.axonfireAcpOwnerRecord;
  const state: any = {
    sessionId: session.id,
    cwd: options.getWorkDir(),
    desiredConfig: options.desiredConfig,
    projectId: options.projectId,
    hasUserMessageSinceLastCompact: false,
    eventHistory: [],
    lastUserPromptExpertSelection:
      ownerNative.fromPersistedExpertSelectionState(
        stored?.lastUserPromptExpertSelection,
      ),
  };
  Object.assign(owner, {
    logger,
    userPromptComposer: prompts.service,
    userPromptComposerReady: Promise.resolve(),
    sessions: new Map([[state.sessionId, state]]),
    sessionEffectChains: new Map(),
    liveEmittedSyntheticUserPromptKeys: new Set(),
    logDiagnostic: (level: string, ...args: any[]) => logger[level]?.(...args),
    emitOrBufferScopedEvent: (_state: any, payload: any) => {
      void own(() => publish(payload)).catch((error) =>
        logger.warn("ACP synthetic update observer failed", error),
      );
    },
    upsertSessionRecord: async (_id: string, update: (current: any) => any) => {
      const current = session.meta.axonfireAcpOwnerRecord ?? {
        updatedAt: session.updatedAt,
      };
      session.meta.axonfireAcpOwnerRecord = update(current);
      await backend.sessions.save(session);
    },
  });
  async function publish(payload: any) {
    await options.onSessionUpdate?.(payload);
  }
  function accept(payload: any, isReplay = false) {
    guard();
    const copy = structuredClone(payload);
    if (!isReplay && busy && ownerNative.isCompactInternalEventPayload(copy))
      compactDuringPrompt = true;
    return owner.recordSessionEvent(state, copy, { isReplay });
  }
  function observe(item: any) {
    // Use original CLI output projection. No history-length approximation of first-turn state.
    for (const update of native.AcpUtils.convertHistoryItemToAcp(item)) {
      const payload = { sessionId: session.id, update };
      accept(payload);
      void own(() => publish(payload)).catch((error) =>
        logger.warn("ACP update observer failed", error),
      );
    }
  }
  const subscription = session.inputSubject.subscribe((item) => {
    try {
      observe(item);
    } catch (error) {
      logger.warn("ACP history projection failed", error);
    }
  });
  // Replay is deliberately marked isReplay: the source recordSessionEvent does NOT
  // update first-turn flags for history. A fresh daemon/backend starts false even on resume.
  try {
    for (const item of session.history)
      for (const update of native.AcpUtils.convertHistoryItemToAcp(item))
        accept({ sessionId: session.id, update }, true);
  } catch (error) {
    subscription.unsubscribe();
    if (ownsPrompts) await prompts.close();
    throw error;
  }
  let localText: string[] = [];
  // No TUI executors in this host: give the unchanged native parser the two
  // original ACP-rejected names without modifying the ordinary CLI registry.
  const commandParser = Object.create(backend.commandManager);
  commandParser.commandExecutorMap = {
    has(name: string) {
      return (
        name === "/stats" ||
        name === "/rewind" ||
        (backend.commandManager as any).commandExecutorMap.has(name)
      );
    },
  };
  Object.assign(renderer, {
    commandManager: {
      parseCommand: backend.commandManager.parseCommand.bind(commandParser),
      isOverriddenByCustom: backend.commandManager.isOverriddenByCustom.bind(
        backend.commandManager,
      ),
      executeLocalCommand: backend.commandManager.executeLocalCommand.bind(
        backend.commandManager,
      ),
    },
    sessionManager: backend.sessions,
    logger,
    broadcastService: {
      broadcastSessionEnd: async () => {
        throw Error("No implicit ACP broadcast connection");
      },
    },
  });
  // The original local-command interpreter uses a connection abstraction. The owned
  // in-process connection publishes real updates; it never opens a network transport.
  const connection = {
    getConnection: () => ({
      sessionUpdate: async (payload: any) => {
        if (payload.update?.sessionUpdate === "agent_message_chunk")
          localText.push(payload.update.content?.text ?? "");
        await publish(payload);
      },
    }),
    getConnectionId: () => undefined,
  };
  async function prompt(
    request: AcpPromptRequest,
    promptOptions: Parameters<Backend["prompt"]>[2] = {},
  ) {
    guard();
    if (busy) throw Error("ACP input session is already running");
    busy = true;
    compactDuringPrompt = false;
    localText = [];
    try {
      return await own(async () => {
        promptOptions?.signal?.throwIfAborted();
        const promptExpertSelection = ownerNative.toExpertSelectionIdentity(
          state.desiredConfig,
        );
        const composed = await owner.composePromptForBackend(
          state,
          request.prompt,
          request._meta,
        );
        promptOptions?.signal?.throwIfAborted();
        owner.recordSyntheticUserPromptEvent(
          state,
          request.prompt,
          request._meta,
        );
        const timestamp = native.timestamps.resolveAcpTimestamp(
          request._meta?.timestamp,
        );
        const visible = native.codec
          .extractVisiblePromptText(composed ?? [])
          .trim();
        const local = await backend.sessions.run(session, () =>
          renderer.tryExecuteLocalCommand(
            visible,
            session,
            connection,
            request._meta?.["codebuddy.ai"],
            native.timestamps.createAcpHistoryMarker(session.history),
            timestamp,
          ),
        );
        let output: string;
        if (local) {
          if (local.errorMessage) throw Error(local.errorMessage);
          output = localText.join("\n");
          promptOptions?.onText?.(output);
        } else {
          // Original local-command dispatch precedes image persistence / SDK conversion.
          const wire = native.AcpUtils.promptToUserMessage({
            sessionId: session.id,
            prompt: composed,
          });
          const items = native.StreamJsonUtils.parseMessagesFromPipeInput(
            JSON.stringify(wire),
          );
          renderer.annotatePromptDerivedContent(items, composed);
          applyAcpPromptTimestamp(items, timestamp);
          output = await backend.prompt(session, items, promptOptions);
        }
        if (!compactDuringPrompt) {
          state.lastUserPromptExpertSelection = promptExpertSelection;
          await owner.flushSessionEffects(session.id);
          await owner.persistLastUserPromptExpertSelection(state);
        } else await owner.flushSessionEffects(session.id);
        return output;
      });
    } finally {
      busy = false;
    }
  }
  async function flush() {
    while (pending.size) await Promise.allSettled([...pending]);
    await owner.flushSessionEffects(session.id);
    await prompts.flush();
  }
  return {
    prompt,
    state,
    native,
    ownerNative,
    owner,
    userPromptHost: prompts,
    root,
    acceptSessionUpdate: (payload: any, options?: { isReplay?: boolean }) =>
      own(() => accept(payload, options?.isReplay === true)),
    flush,
    close() {
      if (closing) return closing;
      closed = true;
      closing = (async () => {
        await flush();
        subscription.unsubscribe();
        owner.sessions.clear();
        owner.liveEmittedSyntheticUserPromptKeys.clear();
        if (ownsPrompts) await prompts.close();
        operations.disable();
      })();
      return closing;
    },
    get closed() {
      return closed;
    },
    get busy() {
      return busy;
    },
    get pendingCount() {
      return pending.size;
    },
  };
}
