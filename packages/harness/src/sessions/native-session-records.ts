// Complete original Desktop session record operations and database adapter.
import { createNativeSessionModes } from "./native-session-modes.js";
import { createNativeSessionAddons } from "./native-session-addons.js";
export const SESSION_RECORDS_SHA256 =
  "528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19";
export const SESSION_RECORDS_FUNCTIONS = [
  ["readSessionSourceMode", 4571012, 4571389],
  ["readCodebuddyMeta", 4570610, 4570738],
  ["readIsBackgroundAutomation", 4571390, 4571517],
  ["projectSessionPluginContext", 4566474, 4567415],
  ["createEmptySessionPluginContext", 228422, 228720],
  ["isRecord$4", 4566238, 4566339],
  ["isWorkbuddyWorkModePluginId", 4553699, 4554002],
  ["normalizeSessionPluginContext", 228721, 229620],
  ["isRecord$14", 226014, 226116],
  ["normalizeStringArray$2", 226887, 227059],
  ["normalizeEnabledPlugins", 227060, 227399],
  ["normalizeMarketplaces", 228085, 228421],
  ["normalizeMarketplaceConfig", 227400, 228084],
  ["normalizeString$4", 226722, 226886],
  ["filterDerivedPluginIds", 4566340, 4566473],
  ["toPersistedExpertSelectionState", 4793418, 4793550],
  ["stableJsonStringify$1", 4783127, 4783490],
  ["isRecord$3", 4783018, 4783126],
  ["deriveTaskStatus", 3515378, 3516028],
  ["withPersistedSessionMeta", 4574165, 4574650],
  ["normalizeTaskStatus", 3519139, 3520032],
  ["createSessionRecordStore", 304866, 306271],
  ["isArchivedStatus", 304753, 304865],
] as const;
export const SESSION_RECORDS_MEMBERS = [
  ["ensureStoredSessionRecord", 4709575, 4712547],
  ["upsertSessionRecord", 4712549, 4713540],
  ["persistLastUserPromptExpertSelection", 4713542, 4714180],
  ["enqueueSessionEffect", 4714182, 4714631],
  ["flushSessionEffects", 4715690, 4715803],
  ["toStoredSessionRecord", 4779913, 4781298],
  ["persistSessionDesiredConfig", 4758851, 4760768],
  ["resolveStoredEntry", 4753131, 4753299],
  ["reconcileInactiveStoredEntry", 4753301, 4753772],
  ["requireSession", 4684161, 4684325],
] as const;
export function createNativeSessionRecords() {
  const require_workbuddy_auth_product_coordinator = createNativeSessionModes();
  const { WORKBUDDY_BUILTIN_MARKETPLACE, WORKBUDDY_WORK_MODE_PLUGIN_PREFIXES } =
    createNativeSessionAddons();
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
  function readIsBackgroundAutomation(meta: any): any {
    return readCodebuddyMeta(meta)?.isBackgroundAutomation === true
      ? true
      : void 0;
  }
  function projectSessionPluginContext(desiredConfig: any): any {
    const empty: any = createEmptySessionPluginContext();
    const selection: any = desiredConfig.addonSelection;
    const sessionSettings: any = desiredConfig.sessionSettings;
    const rawEnabledPlugins: any = isRecord$4(sessionSettings?.enabledPlugins)
      ? sessionSettings.enabledPlugins
      : {};
    const enabledPlugins: any = Object.fromEntries(
      Object.entries(rawEnabledPlugins).filter(
        ([pluginId]: any) => !isWorkbuddyWorkModePluginId(pluginId.trim()),
      ),
    );
    const extraKnownMarketplaces: any = isRecord$4(
      sessionSettings?.extraKnownMarketplaces,
    )
      ? sessionSettings.extraKnownMarketplaces
      : {};
    return (
      normalizeSessionPluginContext({
        version: 1,
        selectedPluginIds: filterDerivedPluginIds(
          selection?.enabledPluginIds ?? [],
        ),
        microSceneIds: selection?.microSceneIds ?? [],
        projectResources: selection?.projectResources ?? empty.projectResources,
        pluginSettings: {
          enabledPlugins,
          extraKnownMarketplaces,
        },
      }) ?? empty
    );
  }
  function createEmptySessionPluginContext(): any {
    return {
      version: 1,
      selectedPluginIds: [],
      microSceneIds: [],
      projectResources: {
        connectorSkillIds: [],
        mcpServerNames: [],
        projectSkillNames: [],
      },
      pluginSettings: {
        enabledPlugins: {},
        extraKnownMarketplaces: {},
      },
    };
  }
  function isRecord$4(value: any): any {
    return !!value && typeof value === "object" && !Array.isArray(value);
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
  function normalizeSessionPluginContext(value: any): any {
    if (!isRecord$14(value) || value.version !== 1) return;
    const projectResources: any = isRecord$14(value.projectResources)
      ? value.projectResources
      : {};
    const pluginSettings: any = isRecord$14(value.pluginSettings)
      ? value.pluginSettings
      : {};
    return {
      version: 1,
      selectedPluginIds: normalizeStringArray$2(value.selectedPluginIds),
      microSceneIds: normalizeStringArray$2(value.microSceneIds),
      projectResources: {
        connectorSkillIds: normalizeStringArray$2(
          projectResources.connectorSkillIds,
        ),
        mcpServerNames: normalizeStringArray$2(projectResources.mcpServerNames),
        projectSkillNames: normalizeStringArray$2(
          projectResources.projectSkillNames,
        ),
      },
      pluginSettings: {
        enabledPlugins: normalizeEnabledPlugins(pluginSettings.enabledPlugins),
        extraKnownMarketplaces: normalizeMarketplaces(
          pluginSettings.extraKnownMarketplaces,
        ),
      },
    };
  }
  function isRecord$14(value: any): any {
    return !!value && typeof value === "object" && !Array.isArray(value);
  }
  function normalizeStringArray$2(value: any): any {
    if (!Array.isArray(value)) return [];
    return Array.from(
      new Set(value.map(normalizeString$4).filter((item: any) => !!item)),
    ).sort();
  }
  function normalizeEnabledPlugins(value: any): any {
    if (!isRecord$14(value)) return {};
    const entries: any = Object.entries(value)
      .map(([pluginId, enabled]: any) => [pluginId.trim(), enabled])
      .filter(
        (entry: any) => entry[0].length > 0 && typeof entry[1] === "boolean",
      )
      .sort(([left]: any, [right]: any) => left.localeCompare(right));
    return Object.fromEntries(entries);
  }
  function normalizeMarketplaces(value: any): any {
    if (!isRecord$14(value)) return {};
    const entries: any = Object.entries(value)
      .map(([name, config]: any) => [
        name.trim(),
        normalizeMarketplaceConfig(config),
      ])
      .filter((entry: any) => entry[0].length > 0 && !!entry[1])
      .sort(([left]: any, [right]: any) => left.localeCompare(right));
    return Object.fromEntries(entries);
  }
  function normalizeMarketplaceConfig(value: any): any {
    if (!isRecord$14(value)) return;
    const source: any = value.source;
    if (
      source !== "github" &&
      source !== "git" &&
      source !== "url" &&
      source !== "zip"
    )
      return;
    const repo: any = normalizeString$4(value.repo);
    const url: any = normalizeString$4(value.url);
    const metaUrl: any = normalizeString$4(value.metaUrl);
    const versionUrl: any = normalizeString$4(value.versionUrl);
    const autoUpdate: any =
      typeof value.autoUpdate === "boolean" ? value.autoUpdate : void 0;
    return {
      source,
      ...(repo ? { repo } : {}),
      ...(url ? { url } : {}),
      ...(metaUrl ? { metaUrl } : {}),
      ...(autoUpdate !== void 0 ? { autoUpdate } : {}),
      ...(versionUrl ? { versionUrl } : {}),
    };
  }
  function normalizeString$4(value: any): any {
    if (typeof value !== "string") return;
    const normalized: any = value.trim();
    return normalized.length > 0 ? normalized : void 0;
  }
  function filterDerivedPluginIds(pluginIds: any): any {
    return pluginIds.filter(
      (pluginId: any) => !isWorkbuddyWorkModePluginId(pluginId.trim()),
    );
  }
  function toPersistedExpertSelectionState(selection: any): any {
    return {
      version: 1,
      selection: selection ? { ...selection } : null,
    };
  }
  function stableJsonStringify$1(value: any): any {
    if (Array.isArray(value))
      return `[${value.map((item: any) => stableJsonStringify$1(item)).join(",")}]`;
    if (isRecord$3(value))
      return `{${Object.keys(value)
        .sort()
        .filter((key: any) => value[key] !== void 0)
        .map(
          (key: any) =>
            `${JSON.stringify(key)}:${stableJsonStringify$1(value[key])}`,
        )
        .join(",")}}`;
    return JSON.stringify(value);
  }
  function isRecord$3(value: any): any {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
  function deriveTaskStatus(state: any): any {
    if (state.archivedAt) return "archived";
    if (state.runState === "awaiting_input") return "pending";
    if (state.runState === "running" && state.executionStage === "planning")
      return "planning";
    if (state.runState === "running") return "working";
    if (
      state.runState === "terminated" ||
      state.terminalOutcome === "terminated"
    )
      return "terminated";
    if (state.runState === "errored" || state.terminalOutcome === "error")
      return "error";
    if (state.terminalOutcome === "failed") return "failed";
    if (state.terminalOutcome === "completed") return "completed";
    return state.turnSeq === 0 ? "pending" : "completed";
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
  function createSessionRecordStore(celljs: any, options?: any): any {
    const ensureDatabaseReady: any = (database: any) => {
      database.initialize?.();
    };
    return {
      async getSession(sessionId: any): Promise<any> {
        const deps: any = await celljs;
        ensureDatabaseReady(deps.database);
        return deps.database.getSession(sessionId) ?? null;
      },
      async listSessions(listOptions?: any): Promise<any> {
        const deps: any = await celljs;
        ensureDatabaseReady(deps.database);
        return deps.database.getSessions({
          userId: listOptions?.userId || void 0,
          includeDeleted: listOptions?.includeDeleted,
        });
      },
      async upsertSession(entry: any): Promise<any> {
        const deps: any = await celljs;
        ensureDatabaseReady(deps.database);
        let finalEntry: any = entry;
        if (!entry.userId && options?.getCurrentUserId) {
          const currentUserId: any = options.getCurrentUserId();
          if (currentUserId)
            finalEntry = {
              ...entry,
              userId: currentUserId,
            };
        }
        const existing: any = deps.database.getSession(finalEntry.id);
        if (
          existing &&
          isArchivedStatus(existing.status) &&
          !isArchivedStatus(finalEntry.status) &&
          typeof deps.database.updateSessionStatus === "function"
        ) {
          deps.database.updateSessionStatus(
            finalEntry.id,
            finalEntry.status,
            finalEntry.updatedAt,
          );
          return;
        }
        deps.database.upsertSession(finalEntry);
      },
      async deleteSession(sessionId: any): Promise<any> {
        const deps: any = await celljs;
        ensureDatabaseReady(deps.database);
        deps.database.deleteSession(sessionId);
      },
    };
  }
  function isArchivedStatus(status: any): any {
    return typeof status === "string" && status.toLowerCase() === "archived";
  }
  class NativeSessionRecords {
    [key: string]: any;
    async ensureStoredSessionRecord(
      session: any,
      lifecycleGeneration: any,
    ): Promise<any> {
      const recordStore: any = this.recordStore;
      if (!recordStore) return;
      await this.enqueueSessionEffect(session, async () => {
        this.assertSessionLifecycleCurrent(
          session.sessionId,
          lifecycleGeneration,
        );
        const existing: any = await recordStore.getSession(session.sessionId);
        this.assertSessionLifecycleCurrent(
          session.sessionId,
          lifecycleGeneration,
        );
        const sessionSourceMode: any = readSessionSourceMode(session._meta);
        const isBackgroundAutomation: any = readIsBackgroundAutomation(
          session._meta,
        );
        const pluginContext: any = session.persistPluginContext
          ? projectSessionPluginContext(session.desiredConfig)
          : void 0;
        if (existing) {
          const next: any = {
            ...existing,
            ...(!existing.userId && session.userId
              ? { userId: session.userId }
              : {}),
            ...(!existing.sourceMode && sessionSourceMode
              ? { sourceMode: sessionSourceMode }
              : {}),
            ...(!existing.isBackgroundAutomation && isBackgroundAutomation
              ? { isBackgroundAutomation }
              : {}),
            ...(!existing.mode && session.desiredConfig.mode
              ? { mode: session.desiredConfig.mode }
              : {}),
            ...(!existing.model && session.desiredConfig.model
              ? { model: session.desiredConfig.model }
              : {}),
            ...(!existing.expertId && session.desiredConfig.expertId
              ? { expertId: session.desiredConfig.expertId }
              : {}),
            ...(!existing.expertLocale &&
            session.desiredConfig.expertId &&
            session.desiredConfig.locale
              ? { expertLocale: session.desiredConfig.locale }
              : {}),
            ...(!existing.expertRuntimeIdentity &&
            session.desiredConfig.expertId &&
            session.desiredConfig.runtimeIdentity
              ? { expertRuntimeIdentity: session.desiredConfig.runtimeIdentity }
              : {}),
            ...(!existing.expertMarketplace &&
            session.desiredConfig.expertId &&
            session.desiredConfig.expertMarketplace
              ? { expertMarketplace: session.desiredConfig.expertMarketplace }
              : {}),
            ...(!existing.lastUserPromptExpertSelection
              ? {
                  lastUserPromptExpertSelection:
                    toPersistedExpertSelectionState(
                      session.lastUserPromptExpertSelection,
                    ),
                }
              : {}),
            ...(!existing.projectId && session.projectId
              ? { projectId: session.projectId }
              : {}),
            ...(pluginContext ? { pluginContext } : {}),
          };
          if (
            next.userId !== existing.userId ||
            next.sourceMode !== existing.sourceMode ||
            next.isBackgroundAutomation !== existing.isBackgroundAutomation ||
            next.mode !== existing.mode ||
            next.model !== existing.model ||
            next.expertId !== existing.expertId ||
            next.expertLocale !== existing.expertLocale ||
            next.expertRuntimeIdentity !== existing.expertRuntimeIdentity ||
            next.expertMarketplace !== existing.expertMarketplace ||
            stableJsonStringify$1(next.lastUserPromptExpertSelection) !==
              stableJsonStringify$1(existing.lastUserPromptExpertSelection) ||
            next.projectId !== existing.projectId ||
            stableJsonStringify$1(next.pluginContext) !==
              stableJsonStringify$1(existing.pluginContext)
          )
            await recordStore.upsertSession(next);
          return;
        }
        await recordStore.upsertSession(this.toStoredSessionRecord(session));
      });
    }
    async upsertSessionRecord(sessionId: any, transform: any): Promise<any> {
      if (!this.recordStore) return;
      const fallback: any =
        (await this.recordStore.getSession(sessionId)) ??
        this.toStoredSessionRecord(this.requireSession(sessionId));
      const activeMeta: any = this.sessions.get(sessionId)?._meta;
      const activeSourceMode: any = readSessionSourceMode(activeMeta);
      const activeIsBackgroundAutomation: any =
        readIsBackgroundAutomation(activeMeta);
      const activeUserId: any = this.sessions.get(sessionId)?.userId;
      const next: any = transform({
        ...fallback,
        ...(!fallback.userId && activeUserId ? { userId: activeUserId } : {}),
        ...(!fallback.sourceMode && activeSourceMode
          ? { sourceMode: activeSourceMode }
          : {}),
        ...(!fallback.isBackgroundAutomation && activeIsBackgroundAutomation
          ? { isBackgroundAutomation: true }
          : {}),
      });
      const active: any = this.sessions.get(sessionId);
      if (active) {
        active.updatedAt = next.updatedAt;
        active.lastActivityAt = next.lastActivityAt;
      }
      await this.recordStore.upsertSession(next);
    }
    async persistLastUserPromptExpertSelection(
      session: any,
      selectionOverride: any,
    ): Promise<any> {
      try {
        const selection: any =
          selectionOverride === null
            ? void 0
            : (selectionOverride ?? session.lastUserPromptExpertSelection);
        await this.upsertSessionRecord(session.sessionId, (current: any) => ({
          ...current,
          lastUserPromptExpertSelection:
            toPersistedExpertSelectionState(selection),
          updatedAt: current.updatedAt,
        }));
      } catch (error: any) {
        this.logDiagnostic(
          "warn",
          "[SessionManager] failed to persist expert selection prompt state",
          {
            sessionId: session.sessionId,
            error: error instanceof Error ? error.message : String(error),
          },
        );
      }
    }
    enqueueSessionEffect(session: any, effect: any): any {
      const sessionId: any = session.sessionId;
      if (this.sessions.get(sessionId) !== session) return Promise.resolve();
      const next: any = (
        this.sessionEffectChains.get(sessionId) ?? Promise.resolve()
      )
        .catch(() => {})
        .then(effect)
        .finally(() => {
          if (this.sessionEffectChains.get(sessionId) === next)
            this.sessionEffectChains.delete(sessionId);
        });
      this.sessionEffectChains.set(sessionId, next);
      return next;
    }
    async flushSessionEffects(sessionId: any): Promise<any> {
      await (this.sessionEffectChains.get(sessionId) ?? Promise.resolve());
    }
    toStoredSessionRecord(session: any): any {
      const sourceMode: any = readSessionSourceMode(session._meta);
      const isBackgroundAutomation: any = readIsBackgroundAutomation(
        session._meta,
      );
      return {
        id: session.sessionId,
        cwd: session.cwd,
        userId: session.userId ?? "",
        customTitle: session.customTitle,
        status: deriveTaskStatus(session.taskState),
        createdAt: session.createdAt,
        updatedAt: session.updatedAt ?? session.createdAt,
        lastActivityAt:
          session.lastActivityAt ?? session.taskState.lastActivityAt,
        isPlayground: !!session.isPlayground,
        isBackgroundAutomation,
        sourceMode,
        mode: session.desiredConfig.mode,
        model: session.desiredConfig.model,
        expertId: session.desiredConfig.expertId,
        expertLocale: session.desiredConfig.expertId
          ? session.desiredConfig.locale
          : void 0,
        expertRuntimeIdentity: session.desiredConfig.expertId
          ? session.desiredConfig.runtimeIdentity
          : void 0,
        expertMarketplace: session.desiredConfig.expertId
          ? session.desiredConfig.expertMarketplace
          : void 0,
        lastUserPromptExpertSelection: toPersistedExpertSelectionState(
          session.lastUserPromptExpertSelection,
        ),
        permissionMode: session.desiredConfig.permissionMode,
        projectId: session.projectId,
        useSandboxCLI: session.desiredConfig.useSandboxCLI,
        ...(session.persistPluginContext
          ? {
              pluginContext: projectSessionPluginContext(session.desiredConfig),
            }
          : {}),
      };
    }
    async persistSessionDesiredConfig(
      session: any,
      options: any,
    ): Promise<any> {
      if (options.hasExplicitPluginContextPatch)
        session.persistPluginContext = true;
      const persistedWelcomeMode: any =
        session.desiredConfig.welcomeMode ??
        session.desiredConfig.addonSelection?.welcomeMode;
      if (options.hasExplicitWelcomeModePatch && persistedWelcomeMode)
        session._meta = withPersistedSessionMeta(session._meta, {
          sourceMode:
            require_workbuddy_auth_product_coordinator.toLegacySourceMode(
              persistedWelcomeMode,
            ),
        });
      await this.upsertSessionRecord(session.sessionId, (current: any) => {
        const shouldClearExpert: any =
          options.hasExplicitExpertPatch && !session.desiredConfig.expertId;
        return {
          ...current,
          cwd: session.cwd,
          mode: session.desiredConfig.mode ?? current.mode,
          model: session.desiredConfig.model ?? current.model,
          expertId: shouldClearExpert
            ? ""
            : (session.desiredConfig.expertId ?? current.expertId),
          expertLocale: shouldClearExpert
            ? ""
            : session.desiredConfig.expertId
              ? (session.desiredConfig.locale ?? current.expertLocale)
              : current.expertLocale,
          expertRuntimeIdentity: shouldClearExpert
            ? ""
            : session.desiredConfig.expertId
              ? (session.desiredConfig.runtimeIdentity ??
                current.expertRuntimeIdentity)
              : current.expertRuntimeIdentity,
          expertMarketplace: shouldClearExpert
            ? ""
            : session.desiredConfig.expertId
              ? (session.desiredConfig.expertMarketplace ??
                current.expertMarketplace)
              : current.expertMarketplace,
          useSandboxCLI:
            session.desiredConfig.useSandboxCLI ?? current.useSandboxCLI,
          permissionMode:
            session.desiredConfig.permissionMode ?? current.permissionMode,
          ...(options.hasExplicitWelcomeModePatch && persistedWelcomeMode
            ? {
                sourceMode:
                  require_workbuddy_auth_product_coordinator.toLegacySourceMode(
                    persistedWelcomeMode,
                  ),
              }
            : {}),
          ...(session.persistPluginContext
            ? {
                pluginContext: projectSessionPluginContext(
                  session.desiredConfig,
                ),
              }
            : {}),
          updatedAt: current.updatedAt,
        };
      });
    }
    async resolveStoredEntry(sessionId: any): Promise<any> {
      if (!this.recordStore) return null;
      return this.reconcileInactiveStoredEntry(
        await this.recordStore.getSession(sessionId),
      );
    }
    async reconcileInactiveStoredEntry(entry: any): Promise<any> {
      if (!entry) return null;
      if (this.sessions.has(entry.id) || !this.recordStore) return entry;
      const normalized: any = normalizeTaskStatus(entry.status);
      if (
        normalized !== "planning" &&
        normalized !== "working" &&
        normalized !== "pending"
      )
        return entry;
      const reconciled: any = {
        ...entry,
        status: "terminated",
        updatedAt: entry.updatedAt,
      };
      await this.recordStore.upsertSession(reconciled);
      return reconciled;
    }
    requireSession(sessionId: any): any {
      const session: any = this.sessions.get(sessionId);
      if (session) return session;
      throw new Error(`Session "${sessionId}" not found`);
    }
  }
  function attach(controller: any, recordStore?: any) {
    for (const [name] of SESSION_RECORDS_MEMBERS)
      Object.defineProperty(
        controller,
        name,
        Object.getOwnPropertyDescriptor(NativeSessionRecords.prototype, name)!,
      );
    Object.assign(controller, { recordStore, sessionEffectChains: new Map() });
    return controller;
  }
  return { attach, createSessionRecordStore };
}
