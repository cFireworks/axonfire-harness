// Complete Desktop configuration mutation and backend reconfigure members.
import {
  createNativeSessionRestart,
  type SessionRestartDependencies,
} from "./native-session-restart.js";
import { createNativeSessionModes } from "./native-session-modes.js";
import { createNativeSessionAddons } from "./native-session-addons.js";
export const SESSION_RECONFIGURATION_SHA256 =
  "528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19";
export const SESSION_RECONFIGURATION_FUNCTIONS = [
  ["syncAddonSelectionWithDesiredConfig", 4787746, 4788897],
  ["deriveToolsFromDisabled", 4789215, 4789550],
  ["isModelOnlyPatch", 4785456, 4785600],
  ["isUseSandboxOnlyPatch", 4785601, 4785820],
  ["hasOwn", 4785821, 4785921],
  ["hasExplicitPluginContextInput", 4785922, 4786268],
  ["hasExplicitWelcomeModeInput", 4786269, 4786445],
  ["normalizeRuntimeConfig", 5498275, 5498885],
  ["getRestartIdentity", 5498886, 5498983],
  ["isPlainObject", 5498984, 5499088],
  ["stableJsonStringify", 5499089, 5499449],
  ["isSameRuntimeConfig", 5499450, 5500011],
  ["normalizeBackendPermissionMode", 5436520, 5436658],
] as const;
export const SESSION_RECONFIGURATION_CONSTANTS = [
  ["VALID_PERMISSION_MODES", 5436203, 5436318],
] as const;
export const SESSION_RECONFIGURATION_MEMBERS = [
  ["updateSessionConfig", 4615594, 4617774],
  ["enqueueSessionConfigMutation", 4617776, 4618224],
  ["applyDesiredConfig", 4753774, 4758849],
  ["reconfigure", 5466422, 5469059],
] as const;
export type SessionConfigurationDependencies = SessionRestartDependencies & {
  withReadySession: (
    id: string,
    operation: (session: any) => Promise<any>,
    resumeCwd: any,
    options: any,
  ) => Promise<any>;
  toSessionInfo: (session: any) => any;
  persistSessionDesiredConfig: (session: any, options: any) => Promise<any>;
  resolveRuntimeConfig: (request: any) => Promise<any>;
  disabledToolsResolver?: (request: any) => any;
};
export function createNativeSessionConfiguration(
  dependencies: SessionConfigurationDependencies,
) {
  const restart = createNativeSessionRestart(dependencies);
  const require_workbuddy_auth_product_coordinator = {
    ...createNativeSessionModes(),
    deriveSessionDeferredBuiltinPolicy:
      restart.deriveSessionDeferredBuiltinPolicy,
    registerSessionDeferredBuiltinPolicy:
      dependencies.registerSessionDeferredBuiltinPolicy,
  };
  const { assertSessionCwdUsable, isWorkbuddyWorkModePluginId } =
    createNativeSessionAddons();
  const console = dependencies.console ?? globalThis.console;
  const sidecarLog = {
    info: (message: string) => dependencies.logDiagnostic?.("info", message),
  };
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
  function isModelOnlyPatch(patch: any): any {
    return (
      !!patch &&
      Object.keys(patch).length === 1 &&
      Object.prototype.hasOwnProperty.call(patch, "model")
    );
  }
  function isUseSandboxOnlyPatch(patch: any): any {
    return (
      !!patch &&
      Object.prototype.hasOwnProperty.call(patch, "useSandboxCLI") &&
      Object.keys(patch).every(
        (key: any) =>
          key === "useSandboxCLI" || key === "sandboxDisabledReason",
      )
    );
  }
  function hasOwn(value: any, key: any): any {
    return !!value && Object.prototype.hasOwnProperty.call(value, key);
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
  function hasExplicitWelcomeModeInput(config: any): any {
    return (
      !!config &&
      (hasOwn(config, "welcomeMode") ||
        (!!config.addonSelection &&
          hasOwn(config.addonSelection, "welcomeMode")))
    );
  }
  function normalizeRuntimeConfig(config: any): any {
    const normalized: any = {
      model: config?.model,
      systemPrompt: config?.systemPrompt,
      restartFingerprint: config?.restartFingerprint,
      tools: config?.tools,
      permissionMode: config?.permissionMode,
      permissionModeBeforePlan: config?.permissionModeBeforePlan,
      sessionSettings: config?.sessionSettings,
      promptVariables: config?.promptVariables,
      addonManifest: config?.addonManifest,
    };
    if (config?.runtimeIdentity)
      normalized.runtimeIdentity = config.runtimeIdentity;
    if (config?.welcomeMode) normalized.welcomeMode = config.welcomeMode;
    return normalized;
  }
  function getRestartIdentity(config: any): any {
    return config.restartFingerprint ?? config.systemPrompt;
  }
  function isPlainObject(value: any): any {
    return !!value && typeof value === "object" && !Array.isArray(value);
  }
  function stableJsonStringify(value: any): any {
    if (Array.isArray(value))
      return `[${value.map((item: any) => stableJsonStringify(item)).join(",")}]`;
    if (isPlainObject(value))
      return `{${Object.keys(value)
        .sort()
        .filter((key: any) => value[key] !== void 0)
        .map(
          (key: any) =>
            `${JSON.stringify(key)}:${stableJsonStringify(value[key])}`,
        )
        .join(",")}}`;
    return JSON.stringify(value);
  }
  function isSameRuntimeConfig(left: any, right: any): any {
    return (
      left.model === right.model &&
      getRestartIdentity(left) === getRestartIdentity(right) &&
      left.tools === right.tools &&
      left.permissionMode === right.permissionMode &&
      left.permissionModeBeforePlan === right.permissionModeBeforePlan &&
      stableJsonStringify(left.sessionSettings) ===
        stableJsonStringify(right.sessionSettings) &&
      stableJsonStringify(left.promptVariables) ===
        stableJsonStringify(right.promptVariables) &&
      left.runtimeIdentity === right.runtimeIdentity &&
      left.welcomeMode === right.welcomeMode
    );
  }
  function normalizeBackendPermissionMode(mode: any): any {
    if (mode && VALID_PERMISSION_MODES.has(mode)) return mode;
    return "bypassPermissions";
  }
  var VALID_PERMISSION_MODES: any = new Set([
    "fullAccess",
    "plan",
    "default",
    "acceptEdits",
    "bypassPermissions",
  ]);
  class NativeSessionConfiguration {
    [key: string]: any;
    async updateSessionConfig(
      sessionId: any,
      patch: any,
      resumeCwd: any,
      options: any,
    ): Promise<any> {
      const effectivePatch: any =
        !Object.prototype.hasOwnProperty.call(patch, "useSandboxCLI") &&
        Object.prototype.hasOwnProperty.call(patch, "sandboxDisabledReason")
          ? Object.fromEntries(
              Object.entries(patch).filter(
                ([key]: any) => key !== "sandboxDisabledReason",
              ),
            )
          : patch;
      this.logDiagnostic(
        "info",
        "[SessionManager] updateSessionConfig called",
        {
          sessionId,
          patchKeys: Object.keys(effectivePatch),
          patchModel: effectivePatch.model,
          patchPermissionMode: effectivePatch.permissionMode,
          patchUseSandboxCLI: effectivePatch.useSandboxCLI,
          hasResumeCwd: !!(resumeCwd && resumeCwd.trim().length > 0),
        },
      );
      return this.enqueueSessionConfigMutation(sessionId, async () => {
        let configUpdateApplied: any = true;
        const hasExpertPrecondition: any = Object.prototype.hasOwnProperty.call(
          options ?? {},
          "expectedExpertId",
        );
        const expectedExpertId: any = options?.expectedExpertId?.trim() || null;
        const updatedSession: any = await this.withReadySession(
          sessionId,
          async (session: any) => {
            if (
              hasExpertPrecondition &&
              (session.desiredConfig.expertId?.trim() || null) !==
                expectedExpertId
            ) {
              configUpdateApplied = false;
              return session;
            }
            options?.onPreconditionMatched?.();
            if (Object.keys(effectivePatch).length === 0) return session;
            const nextDesiredConfig: any = {
              ...session.desiredConfig,
              ...effectivePatch,
            };
            if (
              Object.prototype.hasOwnProperty.call(
                effectivePatch,
                "useSandboxCLI",
              )
            )
              nextDesiredConfig.sandboxDisabledReason =
                effectivePatch.useSandboxCLI === false
                  ? effectivePatch.sandboxDisabledReason
                  : void 0;
            await this.applyDesiredConfig(
              session,
              nextDesiredConfig,
              effectivePatch,
            );
            return session;
          },
          resumeCwd,
          { skipAwaitRestart: true },
        );
        if (
          configUpdateApplied &&
          typeof effectivePatch.useSandboxCLI === "boolean"
        )
          this.runtimeSandboxOverrides.set(sessionId, {
            enabled: updatedSession.desiredConfig.useSandboxCLI === true,
            disabledReason: updatedSession.desiredConfig.sandboxDisabledReason,
          });
        const info: any = this.toSessionInfo(updatedSession);
        return hasExpertPrecondition
          ? {
              ...info,
              configUpdateApplied,
            }
          : info;
      });
    }
    enqueueSessionConfigMutation(sessionId: any, operation: any): any {
      const result: any = (
        this.sessionConfigMutationTails.get(sessionId) ?? Promise.resolve()
      ).then(operation);
      const nextTail: any = result.then(
        () => void 0,
        () => void 0,
      );
      this.sessionConfigMutationTails.set(sessionId, nextTail);
      nextTail.finally(() => {
        if (this.sessionConfigMutationTails.get(sessionId) === nextTail)
          this.sessionConfigMutationTails.delete(sessionId);
      });
      return result;
    }
    async applyDesiredConfig(
      session: any,
      nextDesiredConfig: any,
      explicitPatch: any,
    ): Promise<any> {
      const hasExplicitAddonSelectionPatch: any =
        !!explicitPatch &&
        Object.prototype.hasOwnProperty.call(explicitPatch, "addonSelection");
      nextDesiredConfig = syncAddonSelectionWithDesiredConfig(
        nextDesiredConfig,
        hasExplicitAddonSelectionPatch,
      );
      const hasExplicitToolsPatch: any =
        !!explicitPatch &&
        Object.prototype.hasOwnProperty.call(explicitPatch, "tools");
      const persistenceOptions: any = {
        hasExplicitExpertPatch:
          !!explicitPatch &&
          Object.prototype.hasOwnProperty.call(explicitPatch, "expertId"),
        hasExplicitWelcomeModePatch: hasExplicitWelcomeModeInput(explicitPatch),
        hasExplicitPluginContextPatch:
          hasExplicitPluginContextInput(explicitPatch),
      };
      if (!!nextDesiredConfig.addonSelection && !hasExplicitToolsPatch)
        nextDesiredConfig = {
          ...nextDesiredConfig,
          tools: void 0,
        };
      else if (
        nextDesiredConfig.mode &&
        nextDesiredConfig.mode !== session.desiredConfig.mode &&
        !hasExplicitToolsPatch
      ) {
        const resolvedDisabledTools: any = this.disabledToolsResolver
          ? this.disabledToolsResolver({
              cwd: session.cwd,
              callerDisabledTools: void 0,
              kind: "update",
            })
          : void 0;
        nextDesiredConfig = {
          ...nextDesiredConfig,
          tools: deriveToolsFromDisabled(
            nextDesiredConfig.mode,
            resolvedDisabledTools,
          ),
        };
      }
      const normalizedDesired: any =
        require_workbuddy_auth_product_coordinator.normalizeDesiredConfig(
          nextDesiredConfig,
        );
      const hasExplicitSandboxPatch: any =
        !!explicitPatch &&
        Object.prototype.hasOwnProperty.call(explicitPatch, "useSandboxCLI");
      if (
        normalizedDesired.useSandboxCLI !== void 0 &&
        (hasExplicitSandboxPatch ||
          normalizedDesired.useSandboxCLI !==
            session.desiredConfig.useSandboxCLI)
      )
        await session.backend.setSandboxMode(
          normalizedDesired.useSandboxCLI,
          normalizedDesired.sandboxDisabledReason,
        );
      if (isUseSandboxOnlyPatch(explicitPatch)) {
        session.desiredConfig =
          require_workbuddy_auth_product_coordinator.cloneDesiredConfig(
            normalizedDesired,
          );
        await this.persistSessionDesiredConfig(session, persistenceOptions);
        return;
      }
      await assertSessionCwdUsable(session.cwd);
      const nextRuntimeConfig: any =
        isModelOnlyPatch(explicitPatch) &&
        !session.pendingBackendRestart &&
        !session.pendingDesiredConfig &&
        !session.pendingRuntimeConfig
          ? require_workbuddy_auth_product_coordinator.cloneResolvedRuntimeConfig(
              {
                ...session.runtimeConfig,
                model: normalizedDesired.model,
              },
            )
          : await this.resolveRuntimeConfig({
              sessionId: session.sessionId,
              cwd: session.cwd,
              desiredConfig: normalizedDesired,
              currentRuntimeConfig: session.runtimeConfig,
            });
      const result: any = await session.backend.reconfigure({
        runtimeConfig: nextRuntimeConfig,
      });
      if (session.disposing) return;
      this.logDiagnostic(
        "info",
        "[SessionManager] applyDesiredConfig reconfigure result",
        {
          sessionId: session.sessionId,
          resultKind: result.kind,
          currentModel: session.runtimeConfig?.model,
          nextModel: nextRuntimeConfig.model,
          isProcessing: session.isProcessing,
        },
      );
      require_workbuddy_auth_product_coordinator.registerSessionDeferredBuiltinPolicy(
        session.sessionId,
        require_workbuddy_auth_product_coordinator.deriveSessionDeferredBuiltinPolicy(
          require_workbuddy_auth_product_coordinator.resolveModeTools(
            nextRuntimeConfig.addonManifest?.selected.interactionMode,
          ),
        ),
      );
      if (result.kind === "restart_required") {
        this.logDiagnostic(
          "info",
          `[SessionManager] RESTART_REQUIRED sessionId=${session.sessionId} reason=${result.reason} hasInFlightRestart=${!!session.pendingBackendRestart}`,
        );
        session.desiredConfig =
          require_workbuddy_auth_product_coordinator.cloneDesiredConfig(
            normalizedDesired,
          );
        session.pendingDesiredConfig =
          require_workbuddy_auth_product_coordinator.cloneDesiredConfig(
            normalizedDesired,
          );
        session.pendingRuntimeConfig =
          require_workbuddy_auth_product_coordinator.cloneResolvedRuntimeConfig(
            nextRuntimeConfig,
          );
        session.modeEpoch++;
        await this.persistSessionDesiredConfig(session, persistenceOptions);
        if (!session.hasPendingFlush) {
          session.hasPendingFlush = true;
          this.logDiagnostic(
            "info",
            `[SessionManager] FLUSH_FIRE sessionId=${session.sessionId} — fire-and-forget flush started`,
          );
          this.flushPendingRuntimeConfigIfIdle(session)
            .catch((error: any) => {
              console.warn(
                "[SessionManager] applyDesiredConfig: deferred flush failed (non-fatal):",
                error,
              );
            })
            .finally(() => {
              session.hasPendingFlush = false;
              this.logDiagnostic(
                "info",
                `[SessionManager] FLUSH_DONE sessionId=${session.sessionId} — flush completed, accepting new flushes`,
              );
            });
        } else
          this.logDiagnostic(
            "info",
            `[SessionManager] FLUSH_DEDUP sessionId=${session.sessionId} — skipped (existing flush will consume latest config)`,
          );
      } else {
        session.desiredConfig =
          require_workbuddy_auth_product_coordinator.cloneDesiredConfig(
            normalizedDesired,
          );
        session.runtimeConfig =
          require_workbuddy_auth_product_coordinator.cloneResolvedRuntimeConfig(
            nextRuntimeConfig,
          );
        session.pendingDesiredConfig = void 0;
        session.pendingRuntimeConfig = void 0;
        await this.persistSessionDesiredConfig(session, persistenceOptions);
      }
    }
  }
  class NativeBackendReconfiguration {
    [key: string]: any;
    async reconfigure(request: any): Promise<any> {
      const nextConfig: any = normalizeRuntimeConfig(request.runtimeConfig);
      const current: any = this.runtimeConfig;
      const desiredAgentTeamsEnv: any = this.dependencies.getAgentTeamsEnv?.(
        this.sessionId,
      );
      if (desiredAgentTeamsEnv !== this.lastAppliedAgentTeamsEnv) {
        sidecarLog.info(
          `[CodeBuddyCodeBackend] reconfigure: agent-teams env drift sessionId=${this.sessionId} applied=${this.lastAppliedAgentTeamsEnv ?? "(unset)"} desired=${desiredAgentTeamsEnv ?? "(unset)"}; restart required`,
        );
        return {
          kind: "restart_required",
          reason: "agent-teams env drift",
        };
      }
      if (isSameRuntimeConfig(current, nextConfig)) return { kind: "noop" };
      if (current.tools !== nextConfig.tools) {
        this.logDiagnostic("info", "reconfigure() tools diff detected", {
          sessionId: this.sessionId,
          currentToolsLength: current.tools?.length ?? 0,
          nextToolsLength: nextConfig.tools?.length ?? 0,
          currentToolsPreview: current.tools?.slice(0, 200),
          nextToolsPreview: nextConfig.tools?.slice(0, 200),
          currentIsUndefined: current.tools === void 0,
          nextIsUndefined: nextConfig.tools === void 0,
        });
        return {
          kind: "restart_required",
          reason: "tools changed",
        };
      }
      if (getRestartIdentity(current) !== getRestartIdentity(nextConfig))
        return {
          kind: "restart_required",
          reason: "restart fingerprint changed",
        };
      if (current.runtimeIdentity !== nextConfig.runtimeIdentity)
        return {
          kind: "restart_required",
          reason: "runtime identity changed",
        };
      if (
        current.permissionModeBeforePlan !== nextConfig.permissionModeBeforePlan
      )
        return {
          kind: "restart_required",
          reason: "permission mode before plan changed",
        };
      if (current.welcomeMode !== nextConfig.welcomeMode)
        return {
          kind: "restart_required",
          reason: "welcomeMode changed",
        };
      if (
        stableJsonStringify(current.promptVariables) !==
        stableJsonStringify(nextConfig.promptVariables)
      )
        return {
          kind: "restart_required",
          reason: "prompt variables changed",
        };
      if (
        current.permissionMode !== nextConfig.permissionMode &&
        nextConfig.permissionMode
      ) {
        const effectiveMode: any = normalizeBackendPermissionMode(
          nextConfig.permissionMode,
        );
        this.logDiagnostic("info", "reconfigure() permissionMode change", {
          sessionId: this.sessionId,
          from: current.permissionMode,
          requested: nextConfig.permissionMode,
          effective: effectiveMode,
        });
        await this.setSessionMode({ modeId: effectiveMode });
      }
      if (current.model !== nextConfig.model && nextConfig.model)
        await this.setSessionModel({ modelId: nextConfig.model });
      this.runtimeConfig = nextConfig;
      return { kind: "applied" };
    }
  }
  const controller = restart.controller;
  for (const name of [
    "updateSessionConfig",
    "enqueueSessionConfigMutation",
    "applyDesiredConfig",
  ])
    Object.defineProperty(
      controller,
      name,
      Object.getOwnPropertyDescriptor(
        NativeSessionConfiguration.prototype,
        name,
      )!,
    );
  Object.assign(controller, {
    sessionConfigMutationTails: new Map(),
    runtimeSandboxOverrides: new Map(),
    withReadySession: dependencies.withReadySession,
    toSessionInfo: dependencies.toSessionInfo,
    persistSessionDesiredConfig: dependencies.persistSessionDesiredConfig,
    resolveRuntimeConfig: dependencies.resolveRuntimeConfig,
    disabledToolsResolver: dependencies.disabledToolsResolver,
  });
  function createBackendReconfiguration(options: {
    sessionId: string;
    runtimeConfig: any;
    setSessionMode: (request: any) => Promise<any>;
    setSessionModel: (request: any) => Promise<any>;
    getAgentTeamsEnv?: (id: string) => any;
    lastAppliedAgentTeamsEnv?: any;
  }) {
    return Object.assign(new NativeBackendReconfiguration(), {
      sessionId: options.sessionId,
      runtimeConfig: normalizeRuntimeConfig(options.runtimeConfig),
      dependencies: { getAgentTeamsEnv: options.getAgentTeamsEnv },
      lastAppliedAgentTeamsEnv: options.lastAppliedAgentTeamsEnv,
      setSessionMode: options.setSessionMode,
      setSessionModel: options.setSessionModel,
      logDiagnostic: dependencies.logDiagnostic ?? (() => {}),
    });
  }
  return { ...restart, createBackendReconfiguration };
}
