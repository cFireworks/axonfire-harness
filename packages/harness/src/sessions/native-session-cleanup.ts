// @ts-nocheck
// Complete original session deletion/disposal members and owned field initializers.
import * as node_path from "node:path";
export const SESSION_CLEANUP_SHA256 =
  "528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19";
export const SESSION_CLEANUP_MEMBERS = [
  ["destroySession", 4588903, 4589351],
  ["deleteSession", 4589353, 4589735],
  ["deleteSessionWithLifecycle", 4589737, 4590802],
  ["performDeleteSession", 4590804, 4591726],
  ["disposeActiveSession", 4591728, 4593839],
  ["cancelBeforeDestroy", 4600011, 4600346],
  ["waitForProcessingEnd", 4600503, 4600848],
  ["requestProcessingStop", 4768668, 4768772],
  ["getHistoryStoreGeneration", 4586578, 4586748],
  ["invalidateStoredSessionHistory", 4586750, 4587443],
  ["clearSidebarMetaDebounce", 4715469, 4715688],
  ["releasePluginRecommendationContinuation", 4653745, 4653942],
  ["stopRuntimeReclaimJanitor", 4595264, 4595483],
  ["destroyAll", 4664845, 4665562],
  ["shouldProtectSessionFromDelete", 4593841, 4594298],
  ["hasUnsettledTeamRuntime", 4771936, 4772180],
  ["hasActiveTeamMembers", 4740702, 4740877],
  ["syncPendingInputStateAfterMutation", 4660360, 4660672],
  ["getLatestPendingInputKind", 4660674, 4661635],
  ["historyStoreGeneration", 4574854, 4574881],
  ["historyOwnerGeneration", 4574883, 4574910],
  ["historySessionGenerations", 4574912, 4574966],
  ["pluginRecommendationContinuationBarriers", 4578715, 4578784],
  ["sidebarMetaDebounceTimers", 4576774, 4576828],
  ["runtimeReclaimEligibleSince", 4576870, 4576926],
  ["runtimeReclaimingSessions", 4576928, 4576982],
  ["liveEmittedSyntheticUserPromptKeys", 4577340, 4577403],
  ["runtimeReclaimJanitorTimer", 4577436, 4577463],
  ["runtimeReclaimJanitorOptions", 4577465, 4577494],
] as const;
export const SESSION_CLEANUP_FUNCTIONS = [
  ["normalizeCwdPath", 4572819, 4573213],
  ["cloneSessionPayload", 4782942, 4783017],
  ["isActiveTeamMemberStatus", 4795983, 4796145],
  ["normalizeTeamMemberStatus", 4795869, 4795982],
] as const;
export function attachNativeSessionCleanup(controller: any, deps: any): any {
  const require_workbuddy_auth_product_coordinator = {
    unregisterSessionDeferredBuiltinPolicy:
      deps.unregisterSessionDeferredBuiltinPolicy,
  };
  const console = deps.console ?? globalThis.console;
  function normalizeCwdPath(value) {
    if (typeof value !== "string") return;
    const trimmed = value.trim();
    if (!trimmed) return;
    const normalized = node_path.normalize(trimmed);
    const root = node_path.parse(normalized).root;
    let end = normalized.length;
    while (
      end > root.length &&
      (normalized[end - 1] === "/" || normalized[end - 1] === "\\")
    )
      end -= 1;
    return normalized.slice(0, end);
  }
  function cloneSessionPayload(payload) {
    return structuredClone(payload);
  }
  function isActiveTeamMemberStatus(status) {
    const normalized = normalizeTeamMemberStatus(status);
    return normalized === "pending" || normalized === "running";
  }
  function normalizeTeamMemberStatus(rawStatus) {
    return rawStatus
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");
  }
  class NativeSessionCleanup {
    async destroySession(sessionId) {
      this.releasePluginRecommendationContinuation(sessionId);
      this.pluginRecommendationRegistry?.cancelSession(
        sessionId,
        "session closed",
      );
      let session = this.sessions.get(sessionId);
      if (!session) {
        await this.pendingSessionRestores
          .get(sessionId)
          ?.promise.catch(() => void 0);
        session = this.sessions.get(sessionId);
      }
      if (!session) return;
      await this.disposeActiveSession(sessionId, session);
    }
    deleteSession(sessionId) {
      const pending = this.pendingSessionDeletes.get(sessionId);
      if (pending) return pending;
      const deletion = this.performDeleteSession(sessionId).finally(() => {
        if (this.pendingSessionDeletes.get(sessionId) === deletion)
          this.pendingSessionDeletes.delete(sessionId);
      });
      this.pendingSessionDeletes.set(sessionId, deletion);
      return deletion;
    }
    deleteSessionWithLifecycle(sessionId, lifecycle) {
      const pending = this.pendingSessionDeleteTransactions.get(sessionId);
      if (pending) return pending;
      let committed = false;
      const transaction = (async () => {
        try {
          if (
            ((await lifecycle.beforeDelete?.()) ?? "continue") === "cancelled"
          ) {
            await lifecycle.abortDelete?.();
            return "cancelled";
          }
          await this.deleteSession(sessionId);
          committed = true;
          try {
            await lifecycle.afterDelete?.();
          } catch (error) {
            this.logDiagnostic(
              "error",
              "[SessionManager] deleteSession afterDelete failed",
              {
                sessionId,
                error: error instanceof Error ? error.message : String(error),
              },
            );
          }
          return "deleted";
        } catch (error) {
          if (!committed) await lifecycle.abortDelete?.();
          throw error;
        }
      })().finally(() => {
        if (
          this.pendingSessionDeleteTransactions.get(sessionId) === transaction
        )
          this.pendingSessionDeleteTransactions.delete(sessionId);
      });
      this.pendingSessionDeleteTransactions.set(sessionId, transaction);
      return transaction;
    }
    async performDeleteSession(sessionId) {
      this.deletedSessionIds.add(sessionId);
      this.bumpSessionLifecycleGeneration(sessionId);
      this.pendingSessionRestores.delete(sessionId);
      this.invalidateStoredSessionHistory(sessionId);
      const session = this.sessions.get(sessionId);
      if (session)
        await this.disposeActiveSession(sessionId, session, {
          preserveHistory: false,
        });
      this.primedReplayStates.delete(sessionId);
      this.runtimeSandboxOverrides.delete(sessionId);
      await this.onAfterDelete?.(sessionId).catch(() => {});
      const deletedKeyPrefix = `${sessionId}::`;
      for (const key of this.liveEmittedSyntheticUserPromptKeys)
        if (key.startsWith(deletedKeyPrefix))
          this.liveEmittedSyntheticUserPromptKeys.delete(key);
      if (this.recordStore?.deleteSession)
        await this.recordStore.deleteSession(sessionId).catch(() => {});
      if (this.usageCacheService)
        await this.usageCacheService.purge(sessionId).catch(() => {});
    }
    async disposeActiveSession(sessionId, session, options) {
      const pending = this.pendingSessionDisposals.get(sessionId);
      if (pending) {
        await pending;
        return;
      }
      const preserveHistory = options?.preserveHistory !== false;
      const historyGeneration = this.getHistoryStoreGeneration(sessionId);
      this.sessions.delete(sessionId);
      require_workbuddy_auth_product_coordinator.unregisterSessionDeferredBuiltinPolicy(
        sessionId,
      );
      this.pendingSessionRestores.delete(sessionId);
      this.runtimeReclaimEligibleSince.delete(sessionId);
      this.runtimeReclaimingSessions.delete(sessionId);
      session.disposing = true;
      const disposal = (async () => {
        await this.cancelBeforeDestroy(session).catch((error) => {
          console.warn(
            "[SessionManager] disposeActiveSession: cancel before destroy failed:",
            error,
          );
        });
        await this.flushSessionEffects(sessionId).catch((error) => {
          console.warn(
            "[SessionManager] disposeActiveSession: flush effects failed:",
            error,
          );
        });
        await this.awaitPendingBackendRestart(
          session,
          "disposeActiveSession",
        ).catch((error) => {
          console.warn(
            "[SessionManager] disposeActiveSession: await backend restart failed:",
            error,
          );
        });
        this.sessionEffectChains.delete(sessionId);
        this.clearSidebarMetaDebounce(sessionId);
        if (session.historyHydrationFallbackHandle) {
          clearTimeout(session.historyHydrationFallbackHandle);
          session.historyHydrationFallbackHandle = void 0;
        }
        session.noResponseWatchdog?.stop();
        await session.backend.destroy().catch(() => {});
        if (
          preserveHistory &&
          session.ownerHistoryHydrated &&
          this.getHistoryStoreGeneration(sessionId) === historyGeneration &&
          !this.sessions.has(sessionId) &&
          !this.primedReplayStates.has(sessionId)
        )
          this.primedReplayStates.set(sessionId, {
            cwd: normalizeCwdPath(session.cwd),
            events: session.eventHistory.map((event) =>
              cloneSessionPayload(event),
            ),
          });
      })();
      this.pendingSessionDisposals.set(sessionId, disposal);
      try {
        await disposal;
      } finally {
        if (this.pendingSessionDisposals.get(sessionId) === disposal)
          this.pendingSessionDisposals.delete(sessionId);
      }
    }
    async cancelBeforeDestroy(session, cause = "session_teardown") {
      if (!session.isProcessing) return;
      if (session.pendingPromptCancelCause === void 0)
        session.pendingPromptCancelCause = cause;
      this.requestProcessingStop(session);
      await session.backend.cancel().catch(() => {});
      await this.waitForProcessingEnd(session, 5e3);
    }
    waitForProcessingEnd(session, timeoutMs) {
      if (!session.isProcessing) return Promise.resolve();
      return new Promise((resolve) => {
        const start = Date.now();
        const check = () => {
          if (!session.isProcessing || Date.now() - start >= timeoutMs) {
            resolve();
            return;
          }
          setTimeout(check, 100);
        };
        check();
      });
    }
    requestProcessingStop(session) {
      if (!session.isProcessing) return;
      session.stopRequested = true;
    }
    getHistoryStoreGeneration(sessionId) {
      return sessionId
        ? (this.historySessionGenerations.get(sessionId) ??
            this.historyOwnerGeneration)
        : this.historyOwnerGeneration;
    }
    invalidateStoredSessionHistory(sessionId) {
      this.historyStoreGeneration += 1;
      this.historySessionGenerations.set(
        sessionId,
        this.historyStoreGeneration,
      );
      this.primedReplayStates.delete(sessionId);
      const active = this.sessions.get(sessionId);
      if (!active) return;
      active.ownerHistoryHydrated = false;
      active.eventHistory = [];
      active.hasUserMessageSinceLastCompact = false;
      active.bufferedScopedEventsDuringHistoryHydration = [];
      active.planSnapshot = void 0;
      active.toolResults.clear();
      active.pendingPermissionRequests.clear();
      active.pendingQuestionRequests.clear();
      active.pendingElicitationRequests.clear();
      this.syncPendingInputStateAfterMutation(active);
    }
    clearSidebarMetaDebounce(sessionId) {
      const existing = this.sidebarMetaDebounceTimers.get(sessionId);
      if (existing !== void 0) {
        clearTimeout(existing);
        this.sidebarMetaDebounceTimers.delete(sessionId);
      }
    }
    releasePluginRecommendationContinuation(sessionId) {
      this.pluginRecommendationContinuationBarriers.get(sessionId)?.release();
      this.pluginRecommendationContinuationBarriers.delete(sessionId);
    }
    stopRuntimeReclaimJanitor() {
      if (this.runtimeReclaimJanitorTimer) {
        clearInterval(this.runtimeReclaimJanitorTimer);
        this.runtimeReclaimJanitorTimer = void 0;
      }
      this.runtimeReclaimJanitorOptions = void 0;
    }
    async destroyAll() {
      this.pluginRecommendationRegistry?.cancelAll("daemon stopped");
      for (const barrier of this.pluginRecommendationContinuationBarriers.values())
        barrier.release();
      this.pluginRecommendationContinuationBarriers.clear();
      this.stopRuntimeReclaimJanitor();
      for (const timer of this.sidebarMetaDebounceTimers.values())
        clearTimeout(timer);
      this.sidebarMetaDebounceTimers.clear();
      const ids = [...this.sessions.keys()];
      await Promise.allSettled(ids.map((id) => this.destroySession(id)));
      this.primedReplayStates.clear();
      this.runtimeSandboxOverrides.clear();
      this.runtimeReclaimEligibleSince.clear();
      this.runtimeReclaimingSessions.clear();
      this.userPromptComposer?.cleanup();
    }
    shouldProtectSessionFromDelete(session) {
      const { runState } = session.taskState;
      if (
        runState === "running" ||
        runState === "awaiting_input" ||
        runState === "stopping"
      )
        return true;
      if (session.isProcessing || session.stopRequested) return true;
      if (
        session.pendingPermissionRequests.size > 0 ||
        session.pendingQuestionRequests.size > 0 ||
        session.pendingElicitationRequests.size > 0
      )
        return true;
      return this.hasUnsettledTeamRuntime(session);
    }
    hasUnsettledTeamRuntime(session) {
      if (session.teamRuntime.teamTrulyIdle === true) return false;
      if (
        session.teamRuntime.teamActive ||
        session.teamRuntime.teamTrulyIdle === false
      )
        return true;
      return this.hasActiveTeamMembers(session);
    }
    hasActiveTeamMembers(session) {
      for (const member of session.teamRuntime.membersByName.values())
        if (isActiveTeamMemberStatus(member.status)) return true;
      return false;
    }
    syncPendingInputStateAfterMutation(session) {
      const nextPendingKind = this.getLatestPendingInputKind(session);
      if (nextPendingKind) {
        this.applyTaskSignal(session, {
          type: "awaiting_input",
          kind: nextPendingKind,
        });
        return;
      }
      this.applyTaskSignal(session, { type: "input_resolved" });
    }
    getLatestPendingInputKind(session) {
      let latestPermissionAt = -1;
      for (const pending of session.pendingPermissionRequests.values())
        latestPermissionAt = Math.max(latestPermissionAt, pending.receivedAt);
      let latestQuestionAt = -1;
      for (const pending of session.pendingQuestionRequests.values())
        latestQuestionAt = Math.max(latestQuestionAt, pending.receivedAt);
      for (const pending of session.pendingElicitationRequests.values())
        latestQuestionAt = Math.max(latestQuestionAt, pending.receivedAt);
      let latestPluginRecAt = -1;
      for (const pending of session.pendingPluginRecommendations.values())
        latestPluginRecAt = Math.max(latestPluginRecAt, pending.receivedAt);
      if (
        latestPermissionAt < 0 &&
        latestQuestionAt < 0 &&
        latestPluginRecAt < 0
      )
        return;
      if (
        latestPluginRecAt >= latestQuestionAt &&
        latestPluginRecAt >= latestPermissionAt
      )
        return "plugin_recommendation";
      return latestQuestionAt >= latestPermissionAt ? "question" : "permission";
    }
    historyStoreGeneration = 0;
    historyOwnerGeneration = 0;
    historySessionGenerations = /* @__PURE__ */ new Map();
    pluginRecommendationContinuationBarriers = /* @__PURE__ */ new Map();
    sidebarMetaDebounceTimers = /* @__PURE__ */ new Map();
    runtimeReclaimEligibleSince = /* @__PURE__ */ new Map();
    runtimeReclaimingSessions = /* @__PURE__ */ new Set();
    liveEmittedSyntheticUserPromptKeys = /* @__PURE__ */ new Set();
    runtimeReclaimJanitorTimer;
    runtimeReclaimJanitorOptions;
  }
  Object.assign(controller, new NativeSessionCleanup());
  for (const name of [
    "destroySession",
    "deleteSession",
    "deleteSessionWithLifecycle",
    "performDeleteSession",
    "disposeActiveSession",
    "cancelBeforeDestroy",
    "waitForProcessingEnd",
    "requestProcessingStop",
    "getHistoryStoreGeneration",
    "invalidateStoredSessionHistory",
    "clearSidebarMetaDebounce",
    "releasePluginRecommendationContinuation",
    "stopRuntimeReclaimJanitor",
    "destroyAll",
    "shouldProtectSessionFromDelete",
    "hasUnsettledTeamRuntime",
    "hasActiveTeamMembers",
    "syncPendingInputStateAfterMutation",
    "getLatestPendingInputKind",
  ])
    Object.defineProperty(
      controller,
      name,
      Object.getOwnPropertyDescriptor(NativeSessionCleanup.prototype, name),
    );
  for (const name of [
    "applyTaskSignal",
    "onAfterDelete",
    "usageCacheService",
    "pluginRecommendationRegistry",
    "userPromptComposer",
  ])
    if (deps[name] !== undefined) controller[name] = deps[name];
  return controller;
}
