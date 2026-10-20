import * as http from "node:http";
import { randomUUID } from "node:crypto";
import type { HarnessSession } from "../sessions/session.js";
import type { TeamLogger } from "./team-types.js";
import { withSecurityHeader } from "./teammate-transport.js";
export type BridgeDecision = "allow" | "allowAll" | "deny" | "rejectAndExitPlan";
export type BridgePermissionRequest = { requestId: string; teammateName: string; teamName: string; toolName: string; toolArguments: unknown; toolCallId: string; timestamp: string };
export type BridgePermissionResponse = { requestId: string; decision: BridgeDecision; reason?: string | undefined };
export class PermissionBridgeClient {
  constructor(readonly leaderEndpoint: string, readonly teammateName: string, readonly teamName: string) {}
  async requestPermission(toolName: string, toolArguments: unknown, toolCallId: string): Promise<{ decision: BridgeDecision; reason?: string | undefined }> {
    const request = { requestId: randomUUID(), teammateName: this.teammateName, teamName: this.teamName, toolName, toolArguments, toolCallId, timestamp: new Date().toISOString() };
    try { const result = await this.post("/api/v1/permission-bridge/request", request); return { decision: result.decision, reason: result.reason }; }
    catch (error) { return { decision: "deny", reason: `Permission bridge error: ${error instanceof Error ? error.message : "Unknown error"}` }; }
  }
  async isAvailable(): Promise<boolean> { try { const url = new URL("/api/v1/auth/status", this.leaderEndpoint); return new Promise((resolve) => { const request = http.get(url.toString(), { timeout: 3000, headers: withSecurityHeader() }, (response) => { response.resume(); resolve(response.statusCode === 200); }); request.on("error", () => resolve(false)); request.on("timeout", () => { request.destroy(); resolve(false); }); }); } catch { return false; } }
  post(path: string, payload: unknown): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.leaderEndpoint), body = JSON.stringify(payload), request = http.request(url.toString(), { method: "POST", headers: withSecurityHeader({ "Content-Type": "application/json", "Content-Length": String(Buffer.byteLength(body)) }), timeout: 360000 }, (response) => { let text = ""; response.setEncoding("utf8"); response.on("data", (chunk) => { text += chunk; }); response.on("end", () => { if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) try { const parsed = JSON.parse(text); resolve(parsed.data || parsed); } catch { reject(new Error(`Invalid JSON response: ${text.slice(0, 200)}`)); } else reject(new Error(`HTTP ${response.statusCode}: ${text.slice(0, 200)}`)); }); });
      request.on("error", reject); request.on("timeout", () => { request.destroy(); reject(new Error("Permission bridge request timed out")); }); request.write(body); request.end();
    });
  }
}
type BridgeApprovalItem = { rawItem: { type: string; id: string; callId: string; name: string; arguments: unknown; status: string; providerData: { isTeamMember: boolean; memberName: string } }; _bridgeRequestId: string; _bridgeTeammate: string };
type ApprovalSurface = { approve(item: any, options?: any): any; reject(item: any, options?: any): any };
/** Native 8418746..8422004. The current-session comma-expression bug and
 * approval monkey-patch lifecycle are deliberately preserved. */
export class PermissionBridgeService {
  readonly pendingRequests = new Map<string, { deferred: { promise: Promise<BridgePermissionResponse>; resolve(value: BridgePermissionResponse): void }; timeoutId: ReturnType<typeof setTimeout> }>();
  constructor(readonly sessionManager: { getCurrent(): HarnessSession | undefined }, readonly interruptionService: ApprovalSurface, readonly logger: TeamLogger = {}) {}
  async handleRequest(request: BridgePermissionRequest, signal?: AbortSignal): Promise<BridgePermissionResponse> {
    this.logger.info?.(`[PermissionBridge] Request from ${request.teammateName}: ${request.toolName} (id=${request.requestId})`);
    const leader = this.findLeaderSession(request.teamName); if (!leader) return { requestId: request.requestId, decision: "deny", reason: "Leader session not available" };
    const item = this.createApprovalItem(request); let resolve!: (value: BridgePermissionResponse) => void; const promise = new Promise<BridgePermissionResponse>((done) => { resolve = done; }), deferred = { promise, resolve };
    const timeoutId = setTimeout(() => { deferred.resolve({ requestId: request.requestId, decision: "deny", reason: "Permission request timed out" }); this.pendingRequests.delete(request.requestId); }, 300000); if (typeof timeoutId.unref === "function") timeoutId.unref();
    this.pendingRequests.set(request.requestId, { deferred, timeoutId });
    signal?.addEventListener("abort", () => { deferred.resolve({ requestId: request.requestId, decision: "deny", reason: "Request cancelled" }); this.cleanup(request.requestId); }, { once: true });
    leader.interruptionSubject.next(item as any); this.watchForDecision(request.requestId, item, leader); return deferred.promise;
  }
  resolveRequest(requestId: string, decision: BridgeDecision, reason?: string): void { const pending = this.pendingRequests.get(requestId); if (pending) { pending.deferred.resolve({ requestId, decision, reason }); this.cleanup(requestId); } }
  findLeaderSession(teamName: string): HarnessSession | undefined { try { const session = this.sessionManager.getCurrent(); /* Native evaluates but discards this condition with a comma. */ void (session?.meta?.teamName === teamName || session?.meta?.isTeamLead); return session; } catch { return; } }
  createApprovalItem(request: BridgePermissionRequest): BridgeApprovalItem { return { rawItem: { type: "function_call", id: request.toolCallId, callId: request.toolCallId, name: request.toolName, arguments: request.toolArguments, status: "completed", providerData: { isTeamMember: true, memberName: request.teammateName } }, _bridgeRequestId: request.requestId, _bridgeTeammate: request.teammateName }; }
  watchForDecision(requestId: string, item: BridgeApprovalItem, leader: HarnessSession): void {
    const subscription = leader.interruptionSubject.subscribe((current) => { if (current !== item as any && this.pendingRequests.has(requestId)) subscription.unsubscribe(); });
    const approve = this.interruptionService.approve.bind(this.interruptionService), reject = this.interruptionService.reject.bind(this.interruptionService);
    this.interruptionService.approve = (current, options) => { if (current._bridgeRequestId === requestId) { this.resolveRequest(requestId, options?.decision === "allowAll" ? "allowAll" : "allow"); subscription.unsubscribe(); this.interruptionService.approve = approve; this.interruptionService.reject = reject; return; } return approve(current, options); };
    this.interruptionService.reject = (current, options) => { if (current._bridgeRequestId === requestId) { this.resolveRequest(requestId, options?.decision === "rejectAndExitPlan" ? "rejectAndExitPlan" : "deny"); subscription.unsubscribe(); this.interruptionService.approve = approve; this.interruptionService.reject = reject; return; } return reject(current, options); };
  }
  cleanup(requestId: string): void { const pending = this.pendingRequests.get(requestId); if (pending) { clearTimeout(pending.timeoutId); this.pendingRequests.delete(requestId); } }
}
