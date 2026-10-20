import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import type { Subscription } from "rxjs";
import type { HarnessSession } from "../sessions/session.js";
import type { SessionManager } from "../sessions/session-manager.js";
import type { InterruptionService } from "../permissions/interruption-service.js";
import type { TeamMailbox } from "../teams/team-mailbox.js";
import type { TeammateBackend, TeamLogger } from "../teams/team-types.js";
import { DaemonProcessManager } from "../teams/daemon-process-manager.js";
import { DetachedProcessTeammateBackend } from "../teams/detached-process-teammate-backend.js";
import { PermissionBridgeService } from "../teams/permission-bridge.js";
import { DetachedMemberSseBridge, type AcpUpdate } from "../teams/detached-member-sse-bridge.js";
import { StandaloneTeamGateway } from "./standalone-team-gateway.js";

/** Explicit standalone composition, not recovered product Startup/DI. Native
 * TeamMember defaults to InProcess, not registry auto-detection. */
export class StandaloneDetachedTeamHost {
  readonly processManager: DaemonProcessManager;
  readonly detached: DetachedProcessTeammateBackend;
  readonly backend: TeammateBackend;
  private readonly ownedPids = new Set<number>();
  private readonly gateways = new Map<HarnessSession, Promise<StandaloneTeamGateway>>();
  private readonly bridges = new Map<HarnessSession, DetachedMemberSseBridge>();
  private readonly subscriptions: Subscription[] = [];
  private closed = false;
  constructor(readonly options: {
    stateDir: string; workDir: () => string; apiKey?: string; baseURL?: string; model?: string; webEndpoint?: string; webAccessToken?: string; mediaEndpoint?: string; mediaAccessToken?: string;
    mailbox: TeamMailbox; sessions: SessionManager; interruptions: InterruptionService; logger?: TeamLogger;
    approveTool?: (name: string, input: Record<string, unknown>, session: HarnessSession) => boolean | Promise<boolean>;
    onUpdate?: (event: { sessionId: string; update: AcpUpdate }) => void | Promise<void>;
  }) {
    this.processManager = new DaemonProcessManager({
      logDir: () => resolve(options.stateDir, "logs"),
      entryPath: async () => fileURLToPath(new URL(import.meta.url.endsWith(".ts") ? "../cli.ts" : "../cli.js", import.meta.url)),
      extraArgs: ["--state-dir", options.stateDir, ...(options.webEndpoint ? ["--web-endpoint", options.webEndpoint] : []), ...(options.mediaEndpoint ? ["--media-endpoint", options.mediaEndpoint] : [])],
      // Resolve development loaders before changing to a tool work directory.
      execArgv: process.execArgv.map((arg) => arg === "tsx" ? import.meta.resolve("tsx") : arg === "--import=tsx" ? `--import=${import.meta.resolve("tsx")}` : arg),
      env: { ...(options.apiKey ? { CODEBUDDY_API_KEY: options.apiKey } : {}), ...(options.baseURL ? { CODEBUDDY_BASE_URL: options.baseURL } : {}), ...(options.model ? { CODEBUDDY_MODEL: options.model } : {}), ...(options.webAccessToken ? { WORKBUDDY_HARNESS_WEB_ACCESS_TOKEN: options.webAccessToken } : {}), ...(options.mediaAccessToken ? { WORKBUDDY_HARNESS_MEDIA_ACCESS_TOKEN: options.mediaAccessToken } : {}) },
      onFork: (pid) => this.ownedPids.add(pid),
    });
    this.detached = new DetachedProcessTeammateBackend(this.processManager, options.mailbox);
    this.backend = {
      type: this.detached.type, isAvailable: () => this.detached.isAvailable(),
      spawn: async (spec) => {
        if (this.closed) throw new Error("Detached Team host is closed");
        if (!options.apiKey || !options.baseURL) throw new Error("Detached teammates require explicit apiKey and baseURL; an in-memory ModelProvider cannot cross a process boundary");
        const gateway = await this.gateway(spec.mainSession);
        if (this.closed) throw new Error("Detached Team host is closed");
        return this.detached.spawn({ ...spec, leaderEndpoint: gateway.getEndpoint()! });
      },
      kill: (id) => this.detached.kill(id), isAlive: (id) => this.detached.isAlive(id),
    };
  }
  private gateway(session: HarnessSession): Promise<StandaloneTeamGateway> {
    let pending = this.gateways.get(session);
    if (!pending) {
      pending = (async () => {
        const permissionBridge = new PermissionBridgeService(this.options.sessions, this.options.interruptions, this.options.logger);
        this.subscriptions.push(session.interruptionSubject.subscribe((item: any) => {
          if (!item?._bridgeRequestId) return;
          // Native handleRequest publishes before installing approval wrappers.
          // Defer host UI decisions until that synchronous setup has finished.
          setImmediate(() => { void (async () => {
            if (!permissionBridge.pendingRequests.has(item._bridgeRequestId)) return;
            let allow = false;
            try {
              const raw = item.rawItem; const input = typeof raw.arguments === "string" ? JSON.parse(raw.arguments) : raw.arguments;
              allow = !this.closed && await this.options.approveTool?.(raw.name, input ?? {}, session) === true;
            } catch (error) { this.options.logger?.warn?.(`Team approval failed: ${String(error)}`); }
            if (!permissionBridge.pendingRequests.has(item._bridgeRequestId)) return;
            if (allow) this.options.interruptions.approve(item); else this.options.interruptions.reject(item);
          })(); });
        }));
        const gateway = new StandaloneTeamGateway({ mailbox: this.options.mailbox, permissionBridge, withLeader: (operation) => this.options.sessions.run(session, operation), ...(this.options.logger ? { logger: this.options.logger } : {}) });
        try { await gateway.start(); return gateway; } catch (error) { await gateway.close(); throw error; }
      })();
      this.gateways.set(session, pending);
    }
    return pending;
  }
  /** Call after the child endpoint is published; false means not ready. Native
   * connect semantics (including history-only replay) remain unchanged. */
  async connectMember(session: HarnessSession, team: string, member: string): Promise<boolean> {
    if (this.closed) return false;
    let bridge = this.bridges.get(session);
    if (!bridge) { bridge = new DetachedMemberSseBridge(this.options.logger ?? {}, session.id, { sessionUpdate: async (event) => this.options.onUpdate?.(event) }, (name, agent) => this.options.mailbox.getTeamMemberEndpointPath(name, agent)); this.bridges.set(session, bridge); }
    return bridge.connectMember(team, member);
  }
  async close(): Promise<void> {
    this.closed = true;
    for (const bridge of this.bridges.values()) bridge.disconnectAll(); this.bridges.clear();
    // Only PIDs forked by this host are eligible, including spawn/mailbox failure.
    for (const pid of this.ownedPids) {
      if (this.processManager.isProcessRunning(pid)) {
        this.processManager.sendSignal(pid, "SIGTERM");
        if (!await this.processManager.waitForExit(pid, 5000)) { this.processManager.sendSignal(pid, "SIGKILL"); await this.processManager.waitForExit(pid, 1000); }
      }
    }
    this.ownedPids.clear();
    for (const gateway of await Promise.allSettled(this.gateways.values())) if (gateway.status === "fulfilled") await gateway.value.close();
    this.gateways.clear(); for (const subscription of this.subscriptions) subscription.unsubscribe();
  }
}
