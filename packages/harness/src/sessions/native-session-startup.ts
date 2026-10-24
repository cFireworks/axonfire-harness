// Complete original Desktop session startup and its local function dependencies.
import * as node_fs from "node:fs";
import * as node_path from "node:path";
import * as node_crypto from "node:crypto";
import { createNativeSessionModes } from "./native-session-modes.js";
import { createNativeSessionAddons } from "./native-session-addons.js";
export const SESSION_STARTUP_SHA256 =
  "528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19";
export const SESSION_STARTUP_FUNCTIONS = [
  ["normalizeCwdPath", 4572819, 4573213],
  ["resolveDefaultCwdOrThrow", 4572371, 4572818],
  ["classifyErrno", 4541207, 4541404],
  ["assertSessionCwdUsable", 4542308, 4543431],
  ["restoreStoredPluginContext", 4786446, 4787745],
  ["hasOwn", 4785821, 4785921],
  ["buildAddonSelectionFromPluginContext", 4567416, 4568022],
  ["filterDerivedPluginIds", 4566340, 4566473],
  ["isWorkbuddyWorkModePluginId", 4553699, 4554002],
  ["readSessionSourceMode", 4571012, 4571389],
  ["readCodebuddyMeta", 4570610, 4570738],
  ["buildSessionSettingsFromPluginContext", 4568023, 4568691],
  ["syncAddonSelectionWithDesiredConfig", 4787746, 4788897],
  ["hasExplicitWelcomeModeInput", 4786269, 4786445],
  ["readIsBackgroundAutomation", 4571390, 4571517],
  ["readProjectId", 4573214, 4573399],
  ["readSessionOwnerUserId", 4573400, 4573639],
  ["withPersistedSessionMeta", 4574165, 4574650],
  ["hasExplicitPluginContextInput", 4785922, 4786268],
  ["restoreTaskStateFromStoredStatus", 3521654, 3523008],
  ["createInitialTaskState", 3515180, 3515377],
  ["normalizeTaskStatus", 3519139, 3520032],
  ["applyManualTaskStatus", 3520033, 3521653],
  ["fromPersistedExpertSelectionState", 4793551, 4793687],
  ["normalizeBackendPermissionMode$2", 4783491, 4783647],
  ["deriveToolsFromDisabled", 4789215, 4789550],
] as const;
export const SESSION_STARTUP_MEMBERS = [
  ["startSession", 4667316, 4677512],
  ["buildDesiredConfig", 4769374, 4770256],
  ["awaitPendingSessionDisposal", 4704514, 4704637],
] as const;
export type SessionStartupDependencies = {
  deriveSessionDeferredBuiltinPolicy: (tools: string) => any;
  registerSessionDeferredBuiltinPolicy: (id: string, policy: any) => void;
  unregisterSessionDeferredBuiltinPolicy: (id: string) => void;
  ensureStoredSessionRecord: (session: any, generation: number) => Promise<any>;
  finishHistoryHydrationAfterBackendReplay: (session: any) => void;
  finishHistoryHydration: (session: any) => void;
  getCurrentUserId?: () => string | undefined;
  console?: Pick<Console, "warn">;
};
/** Attach after configuration and readiness. Storage, backend wiring and hydration remain explicit. */
export function attachNativeSessionStartup(
  controller: any,
  dependencies: SessionStartupDependencies,
) {
  const require_workbuddy_auth_product_coordinator = {
    ...createNativeSessionModes(),
    deriveSessionDeferredBuiltinPolicy:
      dependencies.deriveSessionDeferredBuiltinPolicy,
    registerSessionDeferredBuiltinPolicy:
      dependencies.registerSessionDeferredBuiltinPolicy,
    unregisterSessionDeferredBuiltinPolicy:
      dependencies.unregisterSessionDeferredBuiltinPolicy,
  };
  const {
    SessionCwdUnavailableError,
    WORKBUDDY_BUILTIN_MARKETPLACE,
    WORKBUDDY_WORK_MODE_PLUGIN_PREFIXES,
  } = createNativeSessionAddons();
  const console = dependencies.console ?? globalThis.console;
  function normalizeCwdPath(value: any): any {
    if (typeof value !== "string") return;
    const trimmed: any = value.trim();
    if (!trimmed) return;
    const normalized: any = node_path.normalize(trimmed);
    const root: any = node_path.parse(normalized).root;
    let end: any = normalized.length;
    while (
      end > root.length &&
      (normalized[end - 1] === "/" || normalized[end - 1] === "\\")
    )
      end -= 1;
    return normalized.slice(0, end);
  }
  function resolveDefaultCwdOrThrow(): any {
    try {
      return node_path.normalize(process.cwd());
    } catch (err: any) {
      const errno: any = err.code;
      const reason: any = classifyErrno(errno);
      throw new SessionCwdUnavailableError(
        `Daemon process.cwd() is unusable and no session cwd was supplied (${errno ?? "unknown"})`,
        {
          cwd: "<daemon process cwd unavailable>",
          reason,
          errno,
          systemMessage: err instanceof Error ? err.message : String(err),
        },
      );
    }
  }
  function classifyErrno(errno: any): any {
    switch (errno) {
      case "ENOENT":
      case "ENOTDIR":
        return "missing";
      case "EACCES":
      case "EPERM":
        return "permission_denied";
      default:
        return "unknown";
    }
  }
  async function assertSessionCwdUsable(cwd: any): Promise<any> {
    let stat: any;
    try {
      stat = await node_fs.promises.stat(cwd);
    } catch (err: any) {
      const errno: any = err.code;
      const reason: any = classifyErrno(errno);
      throw new SessionCwdUnavailableError(
        reason === "missing"
          ? `Session working directory does not exist or was removed: ${cwd}`
          : reason === "permission_denied"
            ? `Permission denied for session working directory: ${cwd}`
            : `Cannot access session working directory: ${cwd} (${errno ?? "unknown"})`,
        {
          cwd,
          reason,
          errno,
          systemMessage: err instanceof Error ? err.message : String(err),
        },
      );
    }
    if (!stat.isDirectory())
      throw new SessionCwdUnavailableError(
        `Session working directory path is not a directory: ${cwd}`,
        {
          cwd,
          reason: "not_a_directory",
        },
      );
    try {
      await node_fs.promises.access(
        cwd,
        node_fs.constants.R_OK | node_fs.constants.X_OK,
      );
    } catch (err: any) {
      const errno: any = err.code;
      throw new SessionCwdUnavailableError(
        `Permission denied for session working directory: ${cwd}`,
        {
          cwd,
          reason: "permission_denied",
          errno,
          systemMessage: err instanceof Error ? err.message : String(err),
        },
      );
    }
  }
  function restoreStoredPluginContext(
    opts: any,
    context: any,
    stored: any,
  ): any {
    const config: any = opts.config ?? {};
    const nextAddonSelection: any = hasOwn(config, "addonSelection")
      ? config.addonSelection
      : buildAddonSelectionFromPluginContext(
          context,
          require_workbuddy_auth_product_coordinator.normalizeWelcomeMode(
            config.welcomeMode ??
              readSessionSourceMode(opts._meta) ??
              stored.sourceMode,
          ),
          require_workbuddy_auth_product_coordinator.normalizeSceneMode(
            config.mode ?? opts.mode ?? stored.mode,
          ),
        );
    let nextSessionSettings: any = config.sessionSettings;
    if (!hasOwn(config, "sessionSettings"))
      nextSessionSettings = buildSessionSettingsFromPluginContext(context);
    else if (config.sessionSettings) {
      const storedSettings: any =
        buildSessionSettingsFromPluginContext(context);
      if (storedSettings)
        nextSessionSettings = {
          ...storedSettings,
          ...config.sessionSettings,
          ...(hasOwn(config.sessionSettings, "enabledPlugins")
            ? { enabledPlugins: config.sessionSettings.enabledPlugins }
            : {}),
          ...(hasOwn(config.sessionSettings, "extraKnownMarketplaces")
            ? {
                extraKnownMarketplaces:
                  config.sessionSettings.extraKnownMarketplaces,
              }
            : {}),
        };
    }
    return {
      ...opts,
      config: {
        ...config,
        addonSelection: nextAddonSelection,
        ...(nextSessionSettings !== void 0
          ? { sessionSettings: nextSessionSettings }
          : {}),
      },
    };
  }
  function hasOwn(value: any, key: any): any {
    return !!value && Object.prototype.hasOwnProperty.call(value, key);
  }
  function buildAddonSelectionFromPluginContext(
    context: any,
    welcomeMode: any,
    interactionMode: any,
  ): any {
    return {
      version: 1,
      ...(welcomeMode ? { welcomeMode } : {}),
      interactionMode: interactionMode ?? "craft",
      microSceneIds: [...context.microSceneIds],
      enabledPluginIds: filterDerivedPluginIds(context.selectedPluginIds),
      promptContentBlockCount: 0,
      resourceLinkCount: 0,
      projectResources: {
        connectorSkillIds: [...context.projectResources.connectorSkillIds],
        mcpServerNames: [...context.projectResources.mcpServerNames],
        projectSkillNames: [...context.projectResources.projectSkillNames],
      },
    };
  }
  function filterDerivedPluginIds(pluginIds: any): any {
    return pluginIds.filter(
      (pluginId: any) => !isWorkbuddyWorkModePluginId(pluginId.trim()),
    );
  }
  function isWorkbuddyWorkModePluginId(pluginId: any): any {
    if (!pluginId.endsWith(`@${WORKBUDDY_BUILTIN_MARKETPLACE}`)) return false;
    const pluginName: any = pluginId.slice(
      0,
      -`@${WORKBUDDY_BUILTIN_MARKETPLACE}`.length,
    );
    return WORKBUDDY_WORK_MODE_PLUGIN_PREFIXES.some((prefix: any) =>
      pluginName.startsWith(prefix),
    );
  }
  function readSessionSourceMode(meta: any): any {
    const codebuddyMeta: any = readCodebuddyMeta(meta);
    const sourceMode: any = codebuddyMeta?.sourceMode;
    if (typeof sourceMode === "string" && sourceMode.trim().length > 0)
      return sourceMode.trim();
    const welcomeMode: any = codebuddyMeta?.welcomeMode;
    if (typeof welcomeMode === "string" && welcomeMode.trim().length > 0)
      return welcomeMode.trim();
  }
  function readCodebuddyMeta(meta: any): any {
    const raw: any = meta?.["codebuddy.ai"];
    return raw && typeof raw === "object" ? raw : void 0;
  }
  function buildSessionSettingsFromPluginContext(context: any): any {
    const enabledPlugins: any = Object.fromEntries(
      Object.entries(context.pluginSettings.enabledPlugins).filter(
        ([pluginId]: any) => !isWorkbuddyWorkModePluginId(pluginId.trim()),
      ),
    );
    const extraKnownMarketplaces: any = Object.fromEntries(
      Object.entries(context.pluginSettings.extraKnownMarketplaces).map(
        ([name, config]: any) => [name, { ...config }],
      ),
    );
    if (
      Object.keys(enabledPlugins).length === 0 &&
      Object.keys(extraKnownMarketplaces).length === 0
    )
      return;
    return {
      ...(Object.keys(enabledPlugins).length > 0 ? { enabledPlugins } : {}),
      ...(Object.keys(extraKnownMarketplaces).length > 0
        ? { extraKnownMarketplaces }
        : {}),
    };
  }
  function syncAddonSelectionWithDesiredConfig(
    config: any,
    preferAddonSelection: any = false,
  ): any {
    if (!config.addonSelection) return config;
    const addonInteractionMode: any =
      require_workbuddy_auth_product_coordinator.normalizeSceneMode(
        config.addonSelection.interactionMode,
      );
    const addonWelcomeMode: any =
      require_workbuddy_auth_product_coordinator.normalizeWelcomeMode(
        config.addonSelection.welcomeMode,
      );
    const nextInteractionMode: any = preferAddonSelection
      ? (addonInteractionMode ?? config.mode)
      : (config.mode ?? addonInteractionMode);
    const nextWelcomeMode: any = preferAddonSelection
      ? (addonWelcomeMode ?? config.welcomeMode)
      : (config.welcomeMode ?? addonWelcomeMode);
    const nextAddonSelection: any = {
      ...config.addonSelection,
      ...(nextInteractionMode ? { interactionMode: nextInteractionMode } : {}),
      ...(nextWelcomeMode ? { welcomeMode: nextWelcomeMode } : {}),
      enabledPluginIds: config.addonSelection.enabledPluginIds.filter(
        (pluginId: any) => !isWorkbuddyWorkModePluginId(pluginId),
      ),
    };
    return {
      ...config,
      ...(nextInteractionMode ? { mode: nextInteractionMode } : {}),
      ...(nextWelcomeMode ? { welcomeMode: nextWelcomeMode } : {}),
      addonSelection: nextAddonSelection,
    };
  }
  function hasExplicitWelcomeModeInput(config: any): any {
    return (
      !!config &&
      (hasOwn(config, "welcomeMode") ||
        (!!config.addonSelection &&
          hasOwn(config.addonSelection, "welcomeMode")))
    );
  }
  function readIsBackgroundAutomation(meta: any): any {
    return readCodebuddyMeta(meta)?.isBackgroundAutomation === true
      ? true
      : void 0;
  }
  function readProjectId(meta: any): any {
    const projectId: any = readCodebuddyMeta(meta)?.projectId;
    return typeof projectId === "string" && projectId.trim().length > 0
      ? projectId.trim()
      : void 0;
  }
  function readSessionOwnerUserId(meta: any): any {
    const sessionOwnerUserId: any = readCodebuddyMeta(meta)?.sessionOwnerUserId;
    return typeof sessionOwnerUserId === "string" &&
      sessionOwnerUserId.trim().length > 0
      ? sessionOwnerUserId.trim()
      : void 0;
  }
  function withPersistedSessionMeta(meta: any, options: any): any {
    const nextCodebuddyMeta: any = {
      ...(readCodebuddyMeta(meta) ?? {}),
      ...(options.sourceMode ? { sourceMode: options.sourceMode } : {}),
      ...(options.isBackgroundAutomation
        ? { isBackgroundAutomation: true }
        : {}),
      ...(options.sessionOwnerUserId
        ? { sessionOwnerUserId: options.sessionOwnerUserId }
        : {}),
    };
    if (Object.keys(nextCodebuddyMeta).length === 0) return meta;
    return {
      ...(meta ?? {}),
      "codebuddy.ai": nextCodebuddyMeta,
    };
  }
  function hasExplicitPluginContextInput(config: any): any {
    if (!config) return false;
    if (hasOwn(config, "addonSelection")) return true;
    if (!hasOwn(config, "sessionSettings")) return false;
    if (!config.sessionSettings) return true;
    return (
      hasOwn(config.sessionSettings, "enabledPlugins") ||
      hasOwn(config.sessionSettings, "extraKnownMarketplaces")
    );
  }
  function restoreTaskStateFromStoredStatus(
    sessionId: any,
    createdAt: any,
    rawStatus: any,
    options: any,
  ): any {
    const initial: any = createInitialTaskState(sessionId, createdAt);
    const normalized: any = normalizeTaskStatus(rawStatus);
    const onDecision: any = options?.onDecision;
    if (
      normalized === "archived" ||
      normalized === "completed" ||
      normalized === "failed" ||
      normalized === "error" ||
      normalized === "terminated"
    ) {
      onDecision?.({
        decision: "terminal-preserved",
        sessionId,
        rawStatus,
        normalized,
      });
      return applyManualTaskStatus(initial, normalized, createdAt);
    }
    if (
      normalized === "planning" ||
      normalized === "working" ||
      normalized === "pending"
    ) {
      const updatedAt: any = options?.updatedAt;
      const threshold: any = options?.staleThresholdMs ?? 18e5;
      const now: any = options?.now?.() ?? Date.now();
      if (typeof updatedAt === "number" && now - updatedAt > threshold) {
        onDecision?.({
          decision: "stale-inflight-to-terminated",
          sessionId,
          rawStatus,
          normalized,
          updatedAt,
          now,
          ageMs: now - updatedAt,
        });
        return applyManualTaskStatus(initial, "terminated", updatedAt);
      }
      onDecision?.({
        decision: "fallback-to-initial",
        sessionId,
        rawStatus,
        normalized,
        updatedAt,
        now,
      });
      return initial;
    }
    onDecision?.({
      decision: "fallback-to-initial",
      sessionId,
      rawStatus,
      normalized,
    });
    return initial;
  }
  function createInitialTaskState(sessionId: any, createdAt: any): any {
    return {
      sessionId,
      runState: "idle",
      executionStage: null,
      terminalOutcome: null,
      lastTransitionAt: createdAt,
      turnSeq: 0,
    };
  }
  function normalizeTaskStatus(rawStatus: any): any {
    switch (
      rawStatus
        ?.trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "_")
    ) {
      case "planning":
      case "preparing":
      case "connecting":
        return "planning";
      case "working":
      case "running":
      case "tool_start":
      case "tool_end":
      case "handoff":
      case "summarizing":
      case "waiting_team_members":
      case "model_requesting":
      case "model_streaming":
      case "model_done":
      case "tool_executing":
        return "working";
      case "pending":
      case "idle":
      case "await_input":
      case "awaitinput":
      case "waiting_input":
      case "waiting_user_input":
      case "connected":
        return "pending";
      case "completed":
      case "cancelled":
      case "canceled":
      case "done":
        return "completed";
      case "failed":
        return "failed";
      case "error":
        return "error";
      case "terminated":
        return "terminated";
      case "archived":
        return "archived";
      default:
        return "pending";
    }
  }
  function applyManualTaskStatus(
    state: any,
    status: any,
    timestamp: any = Date.now(),
  ): any {
    if (status === "archived")
      return {
        ...state,
        archivedAt: timestamp,
        lastTransitionAt: timestamp,
      };
    const base: any = {
      ...state,
      archivedAt: void 0,
      lastTransitionAt: timestamp,
    };
    switch (status) {
      case "planning":
        return {
          ...base,
          runState: "running",
          executionStage: "planning",
          terminalOutcome: null,
          pendingInputKind: void 0,
          turnSeq: Math.max(base.turnSeq, 1),
        };
      case "working":
        return {
          ...base,
          runState: "running",
          executionStage: "working",
          terminalOutcome: null,
          pendingInputKind: void 0,
          turnSeq: Math.max(base.turnSeq, 1),
        };
      case "pending":
        return {
          ...base,
          runState: "awaiting_input",
          executionStage: null,
          terminalOutcome: null,
          pendingInputKind: "user_input",
        };
      case "completed":
        return {
          ...base,
          runState: "idle",
          executionStage: null,
          terminalOutcome: "completed",
          pendingInputKind: void 0,
          turnSeq: Math.max(base.turnSeq, 1),
        };
      case "failed":
        return {
          ...base,
          runState: "idle",
          executionStage: null,
          terminalOutcome: "failed",
          pendingInputKind: void 0,
          turnSeq: Math.max(base.turnSeq, 1),
        };
      case "error":
        return {
          ...base,
          runState: "errored",
          executionStage: null,
          terminalOutcome: "error",
          pendingInputKind: void 0,
          turnSeq: Math.max(base.turnSeq, 1),
        };
      case "terminated":
        return {
          ...base,
          runState: "terminated",
          executionStage: null,
          terminalOutcome: "terminated",
          pendingInputKind: void 0,
          turnSeq: Math.max(base.turnSeq, 1),
        };
      default:
        return base;
    }
  }
  function fromPersistedExpertSelectionState(state: any): any {
    return state?.version === 1 && state.selection
      ? { ...state.selection }
      : void 0;
  }
  function normalizeBackendPermissionMode$2(mode: any): any {
    return (
      require_workbuddy_auth_product_coordinator.normalizePermissionMode(
        mode,
      ) ?? "bypassPermissions"
    );
  }
  function deriveToolsFromDisabled(mode: any, disabledTools: any): any {
    if (!disabledTools || disabledTools.length === 0) return;
    const disabledSet: any = new Set(disabledTools);
    return require_workbuddy_auth_product_coordinator
      .resolveModeTools(mode)
      .split(",")
      .map((t: any) => t.trim())
      .filter(Boolean)
      .filter((tool: any) => !disabledSet.has(tool))
      .join(",");
  }
  class NativeSessionStartup {
    [key: string]: any;
    async startSession(
      opts: any,
      kind: any,
      expectedLifecycleGeneration: any,
    ): Promise<any> {
      const cwd: any = normalizeCwdPath(opts.cwd) ?? resolveDefaultCwdOrThrow();
      await assertSessionCwdUsable(cwd);
      const requestedSessionId: any =
        opts.sessionId ?? (0, node_crypto.randomUUID)();
      if (kind === "new") {
        const pendingTransaction: any =
          this.pendingSessionDeleteTransactions.get(requestedSessionId);
        if (pendingTransaction) await pendingTransaction;
        const pendingDelete: any =
          this.pendingSessionDeletes.get(requestedSessionId);
        if (pendingDelete) await pendingDelete;
      }
      const lifecycleGeneration: any =
        kind === "new"
          ? this.beginNewSessionLifecycle(requestedSessionId)
          : (expectedLifecycleGeneration ??
            this.getSessionLifecycleGeneration(requestedSessionId));
      this.assertSessionLifecycleCurrent(
        requestedSessionId,
        lifecycleGeneration,
      );
      await this.awaitPendingSessionDisposal(requestedSessionId);
      const storedEntry: any =
        kind !== "new"
          ? await this.resolveStoredEntry(requestedSessionId)
          : null;
      const createdAt: any = storedEntry?.createdAt ?? Date.now();
      const updatedAt: any = storedEntry?.updatedAt ?? createdAt;
      const lastActivityAt: any = storedEntry?.lastActivityAt;
      const resolvedDisabledTools: any = this.disabledToolsResolver
        ? this.disabledToolsResolver({
            cwd,
            callerDisabledTools: opts.disabledTools,
            kind,
          })
        : void 0;
      const baseEffectiveOpts: any =
        resolvedDisabledTools !== void 0
          ? {
              ...opts,
              disabledTools: resolvedDisabledTools,
            }
          : opts;
      const effectiveOpts: any = storedEntry?.pluginContext
        ? restoreStoredPluginContext(
            baseEffectiveOpts,
            storedEntry.pluginContext,
            {
              sourceMode: storedEntry.sourceMode,
              mode: storedEntry.mode,
            },
          )
        : baseEffectiveOpts;
      let desiredConfig: any = syncAddonSelectionWithDesiredConfig(
        this.buildDesiredConfig(effectiveOpts),
      );
      if (!desiredConfig.mode && storedEntry?.mode)
        desiredConfig.mode =
          require_workbuddy_auth_product_coordinator.normalizeSceneMode(
            storedEntry.mode,
          );
      if (!desiredConfig.model && storedEntry?.model)
        desiredConfig.model = storedEntry.model;
      if (!desiredConfig.expertId && storedEntry?.expertId)
        desiredConfig.expertId = storedEntry.expertId;
      if (
        desiredConfig.expertId &&
        !desiredConfig.locale &&
        storedEntry?.expertLocale
      )
        desiredConfig.locale = storedEntry.expertLocale;
      if (
        desiredConfig.expertId &&
        !desiredConfig.runtimeIdentity &&
        storedEntry?.expertRuntimeIdentity
      )
        desiredConfig.runtimeIdentity = storedEntry.expertRuntimeIdentity;
      if (
        desiredConfig.expertId &&
        !desiredConfig.expertMarketplace &&
        storedEntry?.expertMarketplace
      )
        desiredConfig.expertMarketplace = storedEntry.expertMarketplace;
      if (!desiredConfig.permissionMode && storedEntry?.permissionMode)
        desiredConfig.permissionMode = storedEntry.permissionMode;
      const runtimeSandboxOverride: any =
        this.runtimeSandboxOverrides.get(requestedSessionId);
      if (
        desiredConfig.useSandboxCLI === void 0 &&
        runtimeSandboxOverride !== void 0
      ) {
        desiredConfig.useSandboxCLI = runtimeSandboxOverride.enabled;
        desiredConfig.sandboxDisabledReason =
          runtimeSandboxOverride.disabledReason;
      }
      const sourceMode: any =
        hasExplicitWelcomeModeInput(opts.config) && desiredConfig.welcomeMode
          ? require_workbuddy_auth_product_coordinator.toLegacySourceMode(
              desiredConfig.welcomeMode,
            )
          : (readSessionSourceMode(opts._meta) ??
            storedEntry?.sourceMode ??
            (desiredConfig.welcomeMode
              ? require_workbuddy_auth_product_coordinator.toLegacySourceMode(
                  desiredConfig.welcomeMode,
                )
              : void 0));
      if (!desiredConfig.welcomeMode && sourceMode)
        desiredConfig.welcomeMode =
          require_workbuddy_auth_product_coordinator.normalizeWelcomeMode(
            sourceMode,
          );
      desiredConfig = syncAddonSelectionWithDesiredConfig(
        require_workbuddy_auth_product_coordinator.normalizeDesiredConfig(
          desiredConfig,
        ),
      );
      if (typeof desiredConfig.useSandboxCLI === "boolean")
        this.runtimeSandboxOverrides.set(requestedSessionId, {
          enabled: desiredConfig.useSandboxCLI,
          disabledReason: desiredConfig.sandboxDisabledReason,
        });
      const isBackgroundAutomation: any =
        readIsBackgroundAutomation(opts._meta) ??
        storedEntry?.isBackgroundAutomation;
      const currentUserId: any = this.getCurrentUserId?.();
      const storedProjectId: any =
        !!currentUserId &&
        !!storedEntry?.userId &&
        storedEntry.userId !== currentUserId
          ? void 0
          : storedEntry?.projectId;
      const projectId: any =
        opts.projectId ?? readProjectId(opts._meta) ?? storedProjectId;
      if (projectId)
        opts.env = {
          ...opts.env,
          CODEBUDDY_PROJECT_ID: projectId,
        };
      const sessionOwnerUserId: any =
        readSessionOwnerUserId(opts._meta) ??
        storedEntry?.userId ??
        (typeof currentUserId === "string" && currentUserId.trim().length > 0
          ? currentUserId.trim()
          : void 0);
      const effectiveMeta: any = withPersistedSessionMeta(opts._meta, {
        sourceMode,
        isBackgroundAutomation,
        sessionOwnerUserId,
      });
      const runtimeConfig: any = await this.resolveRuntimeConfig({
        sessionId: requestedSessionId,
        cwd,
        desiredConfig,
      });
      this.logDiagnostic(
        "info",
        "[SessionManager] startSession model resolution",
        {
          sessionId: requestedSessionId,
          kind,
          optsModel: opts.model,
          optsConfigModel: opts.config?.model,
          storedEntryModel: storedEntry?.model,
          desiredConfigModel: desiredConfig.model,
          runtimeConfigModel: runtimeConfig.model,
          hasStoredEntry: !!storedEntry,
        },
      );
      const backend: any = this.requireCreateBackend()({
        backendId: opts.backendId,
        sessionId: requestedSessionId,
        cwd,
        runtimeConfig,
        env: opts.env,
        _meta: effectiveMeta,
      });
      const session: any = {
        sessionId: requestedSessionId,
        cwd,
        createdAt,
        updatedAt,
        lastActivityAt,
        backend,
        userId: sessionOwnerUserId,
        isPlayground: opts.isPlayground,
        projectId,
        backendId: opts.backendId,
        env: opts.env,
        _meta: effectiveMeta,
        customTitle: opts.customTitle,
        desiredConfig,
        runtimeConfig,
        persistPluginContext:
          !!storedEntry?.pluginContext ||
          hasExplicitPluginContextInput(opts.config),
        taskState: restoreTaskStateFromStoredStatus(
          requestedSessionId,
          createdAt,
          storedEntry?.status,
          {
            updatedAt: storedEntry?.updatedAt,
            onDecision: (decision: any) => {
              const level: any =
                decision.decision === "stale-inflight-to-terminated"
                  ? "warn"
                  : "info";
              this.logDiagnostic(
                level,
                `[TaskStatus] restore ${decision.decision}`,
                decision,
              );
            },
          },
        ),
        isProcessing: false,
        stopRequested: false,
        userCancelRequested: false,
        pluginRecommendationCancelRequested: false,
        pendingPermissionRequests: /* @__PURE__ */ new Map(),
        pendingQuestionRequests: /* @__PURE__ */ new Map(),
        pendingElicitationRequests: /* @__PURE__ */ new Map(),
        pendingPluginRecommendations: /* @__PURE__ */ new Map(),
        historyHydrationDepth: kind === "load" ? 1 : 0,
        awaitingHistoryReplayEnd: kind === "load",
        sawHistoryReplayStart: false,
        sawHistoryReplayContent: false,
        bufferedScopedEventsDuringHistoryHydration: [],
        ownerHistoryHydrated: kind === "new",
        eventHistory: [],
        hasUserMessageSinceLastCompact: false,
        lastUserPromptExpertSelection: fromPersistedExpertSelectionState(
          storedEntry?.lastUserPromptExpertSelection,
        ),
        toolResults: /* @__PURE__ */ new Map(),
        teamRuntime: { membersByName: /* @__PURE__ */ new Map() },
        stateTransitionLog: [],
        modeEpoch: 0,
      };
      session.modeEpoch++;
      this.wireBackend(session);
      try {
        require_workbuddy_auth_product_coordinator.registerSessionDeferredBuiltinPolicy(
          requestedSessionId,
          require_workbuddy_auth_product_coordinator.deriveSessionDeferredBuiltinPolicy(
            require_workbuddy_auth_product_coordinator.resolveModeTools(
              runtimeConfig.addonManifest?.selected.interactionMode,
            ),
          ),
        );
        const handle: any = await backend.initialize(
          kind === "new"
            ? {
                kind: "new",
                request: {
                  cwd,
                  mcpServers: [],
                  _meta: effectiveMeta,
                },
              }
            : {
                kind,
                request: {
                  sessionId: requestedSessionId,
                  cwd,
                  mcpServers: [],
                  _meta: effectiveMeta,
                },
              },
        );
        if (handle.sessionId !== requestedSessionId)
          throw new Error(
            `[SessionManager] Backend "${backend.id}" returned mismatched session id: expected "${requestedSessionId}", got "${handle.sessionId}"`,
          );
        this.assertSessionLifecycleCurrent(
          requestedSessionId,
          lifecycleGeneration,
        );
        this.sessions.set(requestedSessionId, session);
        await this.ensureStoredSessionRecord(session, lifecycleGeneration);
        this.assertSessionLifecycleCurrent(
          requestedSessionId,
          lifecycleGeneration,
        );
        if (desiredConfig.useSandboxCLI !== void 0)
          await session.backend
            .setSandboxMode(
              desiredConfig.useSandboxCLI,
              desiredConfig.sandboxDisabledReason,
            )
            .catch((err: any) => {
              console.warn(
                "[SessionManager] startSession: setSandboxMode failed:",
                err,
              );
            });
        const effectivePermissionMode: any = normalizeBackendPermissionMode$2(
          runtimeConfig.permissionMode,
        );
        this.logDiagnostic(
          "info",
          "[SessionManager] startSession: syncing permissionMode to backend",
          {
            sessionId: requestedSessionId,
            runtimePermissionMode: runtimeConfig.permissionMode || "(empty)",
            effectiveMode: effectivePermissionMode,
          },
        );
        await session.backend
          .setSessionMode({ modeId: effectivePermissionMode })
          .catch((err: any) => {
            console.warn(
              "[SessionManager] startSession: setSessionMode failed:",
              err,
            );
          });
        if (kind === "load")
          this.finishHistoryHydrationAfterBackendReplay(session);
        this.assertSessionLifecycleCurrent(
          requestedSessionId,
          lifecycleGeneration,
        );
        if (this.sessions.get(requestedSessionId) !== session)
          throw new Error(
            `Session "${requestedSessionId}" startup was superseded by a newer lifecycle`,
          );
        return session;
      } catch (error: any) {
        const errMsg: any =
          error instanceof Error ? error.message : String(error);
        const errStack: any =
          error instanceof Error ? error.stack?.slice(0, 500) : "";
        this.logDiagnostic(
          "error",
          `[SessionManager] startSession FAILED: sessionId=${requestedSessionId}, kind=${kind}, error=${errMsg}`,
          { stack: errStack },
        );
        if (kind === "load") this.finishHistoryHydration(session);
        if (this.sessions.get(requestedSessionId) === session) {
          this.sessions.delete(requestedSessionId);
          require_workbuddy_auth_product_coordinator.unregisterSessionDeferredBuiltinPolicy(
            requestedSessionId,
          );
        } else if (!this.sessions.has(requestedSessionId))
          require_workbuddy_auth_product_coordinator.unregisterSessionDeferredBuiltinPolicy(
            requestedSessionId,
          );
        await backend.destroy().catch(() => {});
        throw error;
      }
    }
    buildDesiredConfig(opts: any): any {
      const mode: any =
        require_workbuddy_auth_product_coordinator.normalizeSceneMode(
          opts.config?.mode ?? opts.mode,
        );
      const explicitTools: any = opts.config?.tools ?? opts.tools;
      const shouldUsePluginComposeTools: any = !!opts.config?.addonSelection;
      const tools: any =
        explicitTools ??
        (shouldUsePluginComposeTools
          ? void 0
          : deriveToolsFromDisabled(mode, opts.disabledTools));
      return require_workbuddy_auth_product_coordinator.normalizeDesiredConfig({
        ...opts.config,
        mode,
        expertId: opts.config?.expertId ?? opts.expertId,
        locale: opts.config?.locale ?? opts.locale,
        model: opts.config?.model ?? opts.model,
        systemPrompt: opts.config?.systemPrompt ?? opts.systemPrompt,
        tools,
        permissionMode: opts.config?.permissionMode ?? opts.permissionMode,
        permissionModeBeforePlan:
          opts.config?.permissionModeBeforePlan ?? "bypassPermissions",
      });
    }
    async awaitPendingSessionDisposal(sessionId: any): Promise<any> {
      await this.pendingSessionDisposals.get(sessionId)?.catch(() => void 0);
    }
  }
  for (const [name] of SESSION_STARTUP_MEMBERS)
    Object.defineProperty(
      controller,
      name,
      Object.getOwnPropertyDescriptor(NativeSessionStartup.prototype, name)!,
    );
  Object.assign(controller, {
    pendingSessionDeleteTransactions: new Map(),
    pendingSessionDeletes: new Map(),
    pendingSessionDisposals: new Map(),
    ensureStoredSessionRecord: dependencies.ensureStoredSessionRecord,
    finishHistoryHydrationAfterBackendReplay:
      dependencies.finishHistoryHydrationAfterBackendReplay,
    finishHistoryHydration: dependencies.finishHistoryHydration,
    getCurrentUserId: dependencies.getCurrentUserId,
  });
  return { controller, restoreTaskStateFromStoredStatus };
}
