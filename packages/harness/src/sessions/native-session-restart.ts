// Complete restart members from Desktop SessionManager; not the full manager.
import { createNativeSessionModes } from "./native-session-modes.js";
import { createNativeSessionAddons } from "./native-session-addons.js";
export const SESSION_RESTART_SHA256 =
  "528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19";
export const SESSION_RESTART_COORDINATOR_SHA256 =
  "8624215504229c4b6190f5c2172da270e015cc96871e90b261786f047e4c6e78";
export const SESSION_RESTART_FUNCTIONS = [
  ["normalizeBackendPermissionMode$2", 4783491, 4783647],
  ["getRuntimeRestartIdentity", 4783648, 4783754],
  ["isSameSessionRuntimeConfig", 4783755, 4784407],
  ["isRecord$3", 4783018, 4783126],
  ["stableJsonStringify$1", 4783127, 4783490],
  ["normalizeQueueForRestart", 4803506, 4804558],
] as const;
export const SESSION_RESTART_MEMBERS = [
  ["awaitPendingBackendRestart", 4704006, 4704512],
  ["applyPendingRuntimeConfigBeforePrompt", 4760770, 4760913],
  ["shouldDeferRuntimeConfigDrain", 4760915, 4761255],
  ["flushPendingRuntimeConfigIfIdle", 4761257, 4762431],
  ["drainPendingRuntimeConfigWhileIdle", 4762433, 4764197],
  ["restartSessionBackend", 4764199, 4767657],
] as const;
export const SESSION_RESTART_POLICY = [
  "deriveSessionDeferredBuiltinPolicy",
  1930894,
  1931344,
] as const;
export type SessionRestartDependencies = {
  createBackend: (request: any) => any;
  wireBackend: (session: any) => void;
  registerSessionDeferredBuiltinPolicy: (
    sessionId: string,
    policy: any,
  ) => void;
  logDiagnostic?: (level: string, message: string, details?: any) => void;
  console?: Pick<Console, "warn">;
};
/** Caller owns session serialization, backend lifecycle and policy storage. */
export function createNativeSessionRestart(
  dependencies: SessionRestartDependencies,
) {
  const modes = createNativeSessionModes();
  const { assertSessionCwdUsable, SessionCwdUnavailableError } =
    createNativeSessionAddons();
  const console = dependencies.console ?? globalThis.console;
  const require_workbuddy_auth_product_coordinator = {
    ...modes,
    deriveSessionDeferredBuiltinPolicy,
    registerSessionDeferredBuiltinPolicy:
      dependencies.registerSessionDeferredBuiltinPolicy,
  };
  function normalizeBackendPermissionMode$2(mode: any): any {
    return (
      require_workbuddy_auth_product_coordinator.normalizePermissionMode(
        mode,
      ) ?? "bypassPermissions"
    );
  }
  function getRuntimeRestartIdentity(config: any): any {
    return config?.restartFingerprint ?? config?.systemPrompt;
  }
  function isSameSessionRuntimeConfig(left: any, right: any): any {
    return (
      (left?.model ?? void 0) === (right?.model ?? void 0) &&
      getRuntimeRestartIdentity(left) === getRuntimeRestartIdentity(right) &&
      (left?.tools ?? void 0) === (right?.tools ?? void 0) &&
      (left?.permissionMode ?? void 0) === (right?.permissionMode ?? void 0) &&
      (left?.permissionModeBeforePlan ?? void 0) ===
        (right?.permissionModeBeforePlan ?? void 0) &&
      stableJsonStringify$1(left?.promptVariables) ===
        stableJsonStringify$1(right?.promptVariables) &&
      (left?.runtimeIdentity ?? void 0) ===
        (right?.runtimeIdentity ?? void 0) &&
      (left?.welcomeMode ?? void 0) === (right?.welcomeMode ?? void 0)
    );
  }
  function isRecord$3(value: any): any {
    return typeof value === "object" && value !== null && !Array.isArray(value);
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
  function normalizeQueueForRestart(snapshot: any, sessionId: any): any {
    if (!snapshot || typeof snapshot !== "object") return;
    const data: any = snapshot;
    const recoverable: any = (Array.isArray(data.items) ? data.items : [])
      .filter((item: any) => {
        if (!item || typeof item !== "object") return false;
        const status: any = item.status;
        return status === "pending" || status === "sending";
      })
      .map((item: any) => ({
        ...item,
        status: "pending",
        lastAttemptAt: void 0,
      }))
      .sort((a: any, b: any) => Number(a.order ?? 0) - Number(b.order ?? 0))
      .map((item: any, index: any) => ({
        ...item,
        order: index,
      }));
    if (recoverable.length === 0) return;
    const now: any = Date.now();
    const keepPaused: any =
      data.runtime?.paused === true && data.runtime?.pauseReason === "error";
    return {
      version: typeof data.version === "number" ? data.version : 0,
      conversationId: sessionId,
      updatedAt: now,
      items: recoverable,
      runtime: {
        activated: false,
        paused: keepPaused,
        pauseReason: keepPaused ? "error" : void 0,
        lastError: keepPaused ? data.runtime?.lastError : void 0,
        updatedAt: now,
      },
    };
  }
  function deriveSessionDeferredBuiltinPolicy(tools: any): any {
    const specs: any = tools
      .split(",")
      .map((value: any) => value.trim())
      .filter(Boolean);
    if (specs.includes("ToolSearch")) return { scope: "all" };
    const allowedTools: any = /* @__PURE__ */ new Set();
    for (const spec of specs) {
      const toolName: any = /^Defer\(\s*([^)]+?)\s*\)$/.exec(spec)?.[1]?.trim();
      if (toolName) allowedTools.add(toolName);
    }
    return {
      scope: "explicit-defer-only",
      allowedTools,
    };
  }
  class NativeSessionRestart {
    [key: string]: any;
    async awaitPendingBackendRestart(session: any, context: any): Promise<any> {
      while (session.pendingBackendRestart) {
        const restartPromise: any = session.pendingBackendRestart;
        this.logDiagnostic(
          "info",
          `[SessionManager] AWAITING_IN_FLIGHT_RESTART sessionId=${session.sessionId} context=${context}`,
        );
        await restartPromise.catch(() => {});
        if (session.pendingBackendRestart === restartPromise)
          await Promise.resolve();
        if (session.pendingBackendRestart === restartPromise)
          session.pendingBackendRestart = void 0;
      }
    }
    async applyPendingRuntimeConfigBeforePrompt(session: any): Promise<any> {
      await this.flushPendingRuntimeConfigIfIdle(session, {
        throwOnRestartError: true,
      });
    }
    shouldDeferRuntimeConfigDrain(session: any): any {
      const defer: any = session.promptInvocationActive === true;
      if (defer)
        this.logDiagnostic(
          "info",
          `[SessionManager] DEFER_DRAIN_INFLIGHT_PROMPT sessionId=${session.sessionId} hasPendingDesired=${!!session.pendingDesiredConfig} hasPendingRuntime=${!!session.pendingRuntimeConfig}`,
        );
      return defer;
    }
    async flushPendingRuntimeConfigIfIdle(
      session: any,
      options: any,
    ): Promise<any> {
      while (true) {
        if (session.disposing) return;
        if (session.pendingBackendRestart) {
          await this.awaitPendingBackendRestart(
            session,
            "flushPendingRuntimeConfigIfIdle",
          );
          continue;
        }
        if (
          session.isProcessing ||
          session.stopRequested ||
          this.shouldDeferRuntimeConfigDrain(session)
        )
          return;
        if (!session.pendingDesiredConfig || !session.pendingRuntimeConfig)
          return;
        const restartPromise: any = Promise.resolve().then(() =>
          this.drainPendingRuntimeConfigWhileIdle(session),
        );
        session.pendingBackendRestart = restartPromise;
        try {
          await restartPromise;
        } catch (error: any) {
          if (error instanceof SessionCwdUnavailableError)
            console.warn(
              "[SessionManager] Pending runtime config drop: session cwd unavailable",
              {
                sessionId: session.sessionId,
                reason: error.data.reason,
                cwd: error.data.cwd,
              },
            );
          else
            console.warn(
              "[SessionManager] Failed to apply pending runtime config:",
              error,
            );
          if (options?.throwOnRestartError) throw error;
          return;
        } finally {
          if (session.pendingBackendRestart === restartPromise)
            session.pendingBackendRestart = void 0;
        }
      }
    }
    async drainPendingRuntimeConfigWhileIdle(session: any): Promise<any> {
      while (
        !session.disposing &&
        !session.isProcessing &&
        !session.stopRequested &&
        !this.shouldDeferRuntimeConfigDrain(session) &&
        session.pendingDesiredConfig &&
        session.pendingRuntimeConfig
      ) {
        const desiredConfig: any =
          require_workbuddy_auth_product_coordinator.cloneDesiredConfig(
            session.pendingDesiredConfig,
          );
        const runtimeConfig: any =
          require_workbuddy_auth_product_coordinator.cloneResolvedRuntimeConfig(
            session.pendingRuntimeConfig,
          );
        session.pendingDesiredConfig = void 0;
        session.pendingRuntimeConfig = void 0;
        if (isSameSessionRuntimeConfig(session.runtimeConfig, runtimeConfig)) {
          this.logDiagnostic(
            "info",
            `[SessionManager] SKIP_RESTART_SAME_CONFIG sessionId=${session.sessionId}`,
          );
          require_workbuddy_auth_product_coordinator.registerSessionDeferredBuiltinPolicy(
            session.sessionId,
            require_workbuddy_auth_product_coordinator.deriveSessionDeferredBuiltinPolicy(
              require_workbuddy_auth_product_coordinator.resolveModeTools(
                runtimeConfig.addonManifest?.selected.interactionMode,
              ),
            ),
          );
          session.desiredConfig = desiredConfig;
          session.runtimeConfig = runtimeConfig;
          continue;
        }
        this.logDiagnostic(
          "info",
          `[SessionManager] RESTART_BACKEND sessionId=${session.sessionId}`,
        );
        try {
          await this.restartSessionBackend(
            session,
            desiredConfig,
            runtimeConfig,
          );
        } catch (error: any) {
          if (error instanceof SessionCwdUnavailableError) throw error;
          if (!session.pendingDesiredConfig)
            session.pendingDesiredConfig =
              require_workbuddy_auth_product_coordinator.cloneDesiredConfig(
                desiredConfig,
              );
          if (!session.pendingRuntimeConfig)
            session.pendingRuntimeConfig =
              require_workbuddy_auth_product_coordinator.cloneResolvedRuntimeConfig(
                runtimeConfig,
              );
          throw error;
        }
      }
    }
    async restartSessionBackend(
      session: any,
      desiredConfig: any,
      runtimeConfig: any,
    ): Promise<any> {
      await assertSessionCwdUsable(session.cwd);
      const previousBackend: any = session.backend;
      const previousRuntimeConfig: any = session.runtimeConfig;
      let queueSnapshot: any;
      try {
        queueSnapshot = await previousBackend.getMessageQueue();
      } catch (error: any) {
        console.warn(
          "[SessionManager] restartSessionBackend: snapshot message queue failed (continuing restart):",
          error instanceof Error ? error.message : String(error),
        );
      }
      const replacement: any = this.requireCreateBackend()({
        backendId: session.backendId,
        sessionId: session.sessionId,
        cwd: session.cwd,
        runtimeConfig,
        env: session.env,
        _meta: session._meta,
      });
      try {
        require_workbuddy_auth_product_coordinator.registerSessionDeferredBuiltinPolicy(
          session.sessionId,
          require_workbuddy_auth_product_coordinator.deriveSessionDeferredBuiltinPolicy(
            require_workbuddy_auth_product_coordinator.resolveModeTools(
              runtimeConfig.addonManifest?.selected.interactionMode,
            ),
          ),
        );
        if (session.pendingPromptCancelCause === void 0)
          session.pendingPromptCancelCause = "backend_restart";
        await previousBackend.releaseRuntime?.().catch(() => {});
        await previousBackend.destroy().catch(() => {});
        const handle: any = await replacement.initialize({
          kind: "load",
          request: {
            sessionId: session.sessionId,
            cwd: session.cwd,
            mcpServers: [],
            _meta: session._meta,
          },
        });
        if (handle.sessionId !== session.sessionId)
          throw new Error(
            `[SessionManager] Backend "${replacement.id}" returned mismatched session id: expected "${session.sessionId}", got "${handle.sessionId}"`,
          );
        session.backend = replacement;
        session.desiredConfig =
          require_workbuddy_auth_product_coordinator.cloneDesiredConfig(
            desiredConfig,
          );
        session.runtimeConfig =
          require_workbuddy_auth_product_coordinator.cloneResolvedRuntimeConfig(
            runtimeConfig,
          );
        session.modeEpoch++;
        this.wireBackend(session);
        const restoredQueue: any = normalizeQueueForRestart(
          queueSnapshot,
          session.sessionId,
        );
        if (restoredQueue)
          await session.backend
            .saveMessageQueue(restoredQueue)
            .catch((error: any) => {
              console.warn(
                "[SessionManager] restartSessionBackend: restore message queue failed:",
                error instanceof Error ? error.message : String(error),
              );
            });
        queueSnapshot = void 0;
        if (runtimeConfig.model)
          await session.backend
            .setSessionModel({ modelId: runtimeConfig.model })
            .catch((err: any) => {
              console.warn(
                "[SessionManager] restartSessionBackend: setSessionModel failed:",
                err,
              );
            });
        const effectivePermissionMode: any = normalizeBackendPermissionMode$2(
          runtimeConfig.permissionMode,
        );
        await session.backend
          .setSessionMode({ modeId: effectivePermissionMode })
          .catch((err: any) => {
            console.warn(
              "[SessionManager] restartSessionBackend: setSessionMode failed:",
              err,
            );
          });
        if (desiredConfig.useSandboxCLI !== void 0)
          await session.backend
            .setSandboxMode(
              desiredConfig.useSandboxCLI,
              desiredConfig.sandboxDisabledReason,
            )
            .catch((err: any) => {
              console.warn(
                "[SessionManager] restartSessionBackend: setSandboxMode failed:",
                err,
              );
            });
      } catch (error: any) {
        require_workbuddy_auth_product_coordinator.registerSessionDeferredBuiltinPolicy(
          session.sessionId,
          require_workbuddy_auth_product_coordinator.deriveSessionDeferredBuiltinPolicy(
            require_workbuddy_auth_product_coordinator.resolveModeTools(
              previousRuntimeConfig.addonManifest?.selected.interactionMode,
            ),
          ),
        );
        await replacement.destroy().catch(() => {});
        throw error;
      }
    }
  }
  const controller = Object.assign(new NativeSessionRestart(), {
    requireCreateBackend: () => dependencies.createBackend,
    wireBackend: dependencies.wireBackend,
    logDiagnostic: dependencies.logDiagnostic ?? (() => {}),
  });
  return {
    controller,
    normalizeQueueForRestart,
    isSameSessionRuntimeConfig,
    getRuntimeRestartIdentity,
    stableJsonStringify: stableJsonStringify$1,
    deriveSessionDeferredBuiltinPolicy,
  };
}
