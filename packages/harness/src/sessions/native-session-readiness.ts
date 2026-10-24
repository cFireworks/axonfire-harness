// Complete original Desktop readiness, prompt preparation and inactive restore members.
import * as node_fs from "node:fs";
import * as node_path from "node:path";
import * as os from "node:os";
export const SESSION_READINESS_SHA256 =
  "528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19";
export const SESSION_READINESS_FUNCTIONS = [
  ["normalizeCwdPath", 4572819, 4573213],
] as const;
export const SESSION_READINESS_MEMBERS = [
  ["withReadySession", 4702412, 4702655],
  ["prepareBackendForOperation", 4702657, 4703090],
  ["resolveReadySession", 4704639, 4704831],
  ["resolveBackendForPromptSend", 4703092, 4703584],
  ["runBeforePromptHook", 4703586, 4704004],
  ["resumeInactiveSessionState", 4704833, 4704955],
  ["restoreInactiveSessionState", 4705937, 4708690],
  ["getSessionLifecycleGeneration", 4708692, 4708800],
  ["bumpSessionLifecycleGeneration", 4708802, 4709004],
  ["beginNewSessionLifecycle", 4709006, 4709147],
  ["assertSessionLifecycleCurrent", 4709149, 4709419],
] as const;
export type SessionReadinessDependencies = {
  sessions: Map<string, any>;
  resolveStoredEntry: (id: string) => Promise<any>;
  startSession: (
    request: any,
    kind: string,
    generation: number,
  ) => Promise<any>;
  replaceSessionReplayState: (session: any, events: any, cwd: any) => void;
  onBeforePrompt?: (request: any) => Promise<any>;
  temporaryRoot?: string;
  console?: Pick<Console, "warn">;
};
/** Attach to a recovered configuration/restart controller; adapters own storage and startup. */
export function attachNativeSessionReadiness(
  controller: any,
  dependencies: SessionReadinessDependencies,
) {
  const console = dependencies.console ?? globalThis.console;
  const node_os = { tmpdir: () => dependencies.temporaryRoot ?? os.tmpdir() };
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
  class NativeSessionReadiness {
    [key: string]: any;
    async withReadySession(
      sessionId: any,
      action: any,
      resumeCwd: any,
      options: any,
    ): Promise<any> {
      const session: any = await this.resolveReadySession(sessionId, resumeCwd);
      await this.prepareBackendForOperation(
        session,
        "withReadySession",
        options,
      );
      return action(session);
    }
    async prepareBackendForOperation(
      session: any,
      context: any,
      options: any,
    ): Promise<any> {
      if (options?.skipAwaitRestart) {
        this.logDiagnostic(
          "info",
          `[SessionManager] SKIP_AWAIT_RESTART sessionId=${session.sessionId} context=${context} hasInFlightRestart=${!!session.pendingBackendRestart}`,
        );
        return;
      }
      await this.awaitPendingBackendRestart(session, context);
      await this.flushPendingRuntimeConfigIfIdle(session, {
        throwOnRestartError: true,
      });
    }
    async resolveReadySession(sessionId: any, resumeCwd: any): Promise<any> {
      const active: any = this.sessions.get(sessionId);
      if (active) return active;
      return this.resumeInactiveSessionState(sessionId, resumeCwd);
    }
    async resolveBackendForPromptSend(session: any): Promise<any> {
      await this.applyPendingRuntimeConfigBeforePrompt(session);
      const prepare: any = this.onBeforePrompt;
      if (!prepare) return session.backend;
      const backend: any = session.backend;
      if (await this.runBeforePromptHook(session, prepare, backend))
        session.promptPreparedBackend = backend;
      await this.applyPendingRuntimeConfigBeforePrompt(session);
      if (session.backend === backend) return backend;
      return this.resolveBackendForPromptSend(session);
    }
    async runBeforePromptHook(
      session: any,
      hook: any,
      backend: any,
    ): Promise<any> {
      try {
        await hook({
          sessionId: session.sessionId,
          desiredConfig: session.desiredConfig,
          backendRestarted:
            session.promptPreparedBackend !== void 0 &&
            backend !== session.promptPreparedBackend,
        });
        return true;
      } catch (hookError: any) {
        console.warn(
          "[SessionManager] onBeforePrompt hook failed (non-fatal):",
          hookError,
        );
        return false;
      }
    }
    async resumeInactiveSessionState(sessionId: any, cwd: any): Promise<any> {
      return this.restoreInactiveSessionState(sessionId, cwd, "resume");
    }
    async restoreInactiveSessionState(
      sessionId: any,
      cwd: any,
      kind: any,
    ): Promise<any> {
      const lifecycleGeneration: any =
        this.getSessionLifecycleGeneration(sessionId);
      this.assertSessionLifecycleCurrent(sessionId, lifecycleGeneration);
      const active: any = this.sessions.get(sessionId);
      if (active) return active;
      const pendingRestore: any = this.pendingSessionRestores.get(sessionId);
      if (pendingRestore) {
        if (pendingRestore.kind === "load" || pendingRestore.kind === kind)
          return pendingRestore.promise;
      }
      const restorePromise: any = (async () => {
        this.logDiagnostic(
          "info",
          `[SessionManager] restoreInactiveSessionState: sessionId=${sessionId}, kind=${kind}, cwd=${cwd ?? "undefined"}`,
        );
        const requestedCwd: any = normalizeCwdPath(cwd);
        const storedEntry: any = await this.resolveStoredEntry(sessionId);
        const primedReplayAtStart: any = this.primedReplayStates.get(sessionId);
        const recordCwd: any = normalizeCwdPath(storedEntry?.cwd);
        const replayCwd: any = normalizeCwdPath(primedReplayAtStart?.cwd);
        let resolvedCwd: any = recordCwd ?? replayCwd ?? requestedCwd;
        if (requestedCwd && resolvedCwd && resolvedCwd !== requestedCwd)
          this.logDiagnostic(
            "info",
            "[SessionManager] restoreInactiveSessionState: using historical cwd over requested cwd",
            {
              sessionId,
              kind,
              requestedCwd,
              recordCwd,
              replayCwd,
            },
          );
        if (!resolvedCwd && storedEntry) {
          const fallbackCwd: any = normalizeCwdPath(
            node_fs.mkdtempSync(
              node_path.join(node_os.tmpdir(), "wb-session-"),
            ),
          );
          if (fallbackCwd) {
            this.logDiagnostic(
              "info",
              "[SessionManager] restoreInactiveSessionState: created isolated fallback cwd for stored session without local cwd",
              {
                sessionId,
                kind,
                fallbackCwd,
              },
            );
            resolvedCwd = fallbackCwd;
          }
        }
        if (!resolvedCwd)
          throw new Error(
            `Cannot restore inactive session "${sessionId}" without cwd`,
          );
        const resumed: any = await this.startSession(
          {
            sessionId,
            cwd: resolvedCwd,
          },
          kind,
          lifecycleGeneration,
        );
        const primedReplay: any = this.primedReplayStates.get(sessionId);
        if (primedReplay) {
          this.replaceSessionReplayState(
            resumed,
            primedReplay.events,
            primedReplay.cwd ?? resolvedCwd,
          );
          this.primedReplayStates.delete(sessionId);
        }
        return resumed;
      })();
      this.pendingSessionRestores.set(sessionId, {
        kind,
        promise: restorePromise,
      });
      try {
        return await restorePromise;
      } catch (restoreError: any) {
        const msg: any =
          restoreError instanceof Error
            ? restoreError.message
            : String(restoreError);
        this.logDiagnostic(
          "error",
          `[SessionManager] restoreInactiveSessionState FAILED: sessionId=${sessionId}, kind=${kind}, error=${msg}`,
        );
        throw restoreError;
      } finally {
        if (
          this.pendingSessionRestores.get(sessionId)?.promise === restorePromise
        )
          this.pendingSessionRestores.delete(sessionId);
      }
    }
    getSessionLifecycleGeneration(sessionId: any): any {
      return this.sessionLifecycleGenerations.get(sessionId) ?? 0;
    }
    bumpSessionLifecycleGeneration(sessionId: any): any {
      const generation: any = this.getSessionLifecycleGeneration(sessionId) + 1;
      this.sessionLifecycleGenerations.set(sessionId, generation);
      return generation;
    }
    beginNewSessionLifecycle(sessionId: any): any {
      this.deletedSessionIds.delete(sessionId);
      return this.bumpSessionLifecycleGeneration(sessionId);
    }
    assertSessionLifecycleCurrent(
      sessionId: any,
      expectedGeneration: any,
    ): any {
      if (
        this.deletedSessionIds.has(sessionId) ||
        this.getSessionLifecycleGeneration(sessionId) !== expectedGeneration
      )
        throw new Error(
          `Session "${sessionId}" startup was superseded by permanent deletion`,
        );
    }
  }
  for (const [name] of SESSION_READINESS_MEMBERS)
    Object.defineProperty(
      controller,
      name,
      Object.getOwnPropertyDescriptor(NativeSessionReadiness.prototype, name)!,
    );
  Object.assign(controller, {
    sessions: dependencies.sessions,
    resolveStoredEntry: dependencies.resolveStoredEntry,
    startSession: dependencies.startSession,
    replaceSessionReplayState: dependencies.replaceSessionReplayState,
    onBeforePrompt: dependencies.onBeforePrompt,
    pendingSessionRestores: new Map(),
    primedReplayStates: new Map(),
    sessionLifecycleGenerations: new Map(),
    deletedSessionIds: new Set(),
  });
  return { controller, normalizeCwdPath };
}
