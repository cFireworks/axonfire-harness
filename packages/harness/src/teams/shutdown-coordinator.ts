import type { TeamLogger } from "./team-types.js";
export type ShutdownResult = "not-alive" | "forced" | "approved" | "rejected" | "timeout";
export type ShutdownMember = { info: { name: string }; teamName: string; isActive(): boolean; sendMessage(from: string, text: string, summary?: string): Promise<void>; forceKill(): Promise<void> };
export function resolveShutdownTimeoutMs(): number { const value = process.env.CODEBUDDY_TEAM_SHUTDOWN_GRACEFUL_TIMEOUT_MS; if (value === undefined) return 15000; const number = Number.parseInt(value, 10); return !Number.isFinite(number) || number < 0 ? 15000 : number; }
export class ShutdownCoordinator {
  private readonly pending = new Map<string, { requestId: string; member: ShutdownMember; resolve(result: ShutdownResult): void; timer?: NodeJS.Timeout }>();
  constructor(readonly idleTracker?: { waitForIdle(team: string, member: string, options: { timeoutMs: number }): Promise<unknown> }, readonly logger: TeamLogger = {}) {}
  async shutdown(member: ShutdownMember, options: { timeoutMs?: number; reason?: string; waitForIdleFirst?: boolean } = {}): Promise<ShutdownResult> {
    if (!member.isActive()) return "not-alive";
    const timeout = options.timeoutMs ?? resolveShutdownTimeoutMs(), reason = options.reason ?? "Team lead requested shutdown";
    if (options.waitForIdleFirst && timeout > 0) { await this.waitIdleBestEffort(member, Math.floor(timeout / 3)); if (!member.isActive()) return "not-alive"; }
    const requestId = this.newRequestId(member.info.name), result = new Promise<ShutdownResult>((resolve) => { const entry: { requestId: string; member: ShutdownMember; resolve(result: ShutdownResult): void; timer?: NodeJS.Timeout } = { requestId, member, resolve }; this.pending.set(requestId, entry); if (timeout > 0) entry.timer = setTimeout(() => { void this.onTimeout(requestId).catch(() => undefined); }, timeout); });
    try { await member.sendMessage("team-lead", JSON.stringify({ type: "shutdown_request", request_id: requestId, from: "team-lead", reason, timestamp: new Date().toISOString() }), `Shutdown requested: ${reason}`); } catch (error) { this.logger.warn?.(`[ShutdownCoordinator] failed to deliver shutdown_request to "${member.info.name}": ${error}`); try { await member.forceKill(); } catch (error) { this.logger.warn?.(`[ShutdownCoordinator] forceKill after send failure also failed: ${error}`); } this.resolvePending(requestId, "forced"); }
    return result;
  }
  fulfillResponse(id: string, approved: boolean, reason?: string): boolean { if (this.pending.get(id)) { if (reason) this.logger.info?.(`[ShutdownCoordinator] response ${approved ? "approved" : "rejected"} requestId=${id}, reason: ${reason}`); this.resolvePending(id, approved ? "approved" : "rejected"); return true; } this.logger.info?.(`[ShutdownCoordinator] fulfillResponse for unknown requestId=${id} (likely timed out already, or tool-initiated request without registered pending)`); return false; }
  cancelAll(reason: string): void { if (!this.pending.size) return; this.logger.info?.(`[ShutdownCoordinator] cancelAll (${this.pending.size} pending): ${reason}`); for (const id of [...this.pending.keys()]) this.resolvePending(id, "timeout"); }
  async onTimeout(id: string): Promise<void> { const entry = this.pending.get(id); if (!entry) return; this.logger.warn?.(`[ShutdownCoordinator] timeout for requestId=${id} member="${entry.member.info.name}" — forceKill`); try { await entry.member.forceKill(); } catch (error) { this.logger.warn?.(`[ShutdownCoordinator] forceKill failed for "${entry.member.info.name}": ${error}`); } this.resolvePending(id, "forced"); }
  resolvePending(id: string, result: ShutdownResult): void { const entry = this.pending.get(id); if (!entry) return; this.pending.delete(id); if (entry.timer !== undefined) clearTimeout(entry.timer); entry.resolve(result); }
  async waitIdleBestEffort(member: ShutdownMember, timeoutMs: number): Promise<void> { if (timeoutMs <= 0) return; try { await this.idleTracker?.waitForIdle(member.teamName, member.info.name, { timeoutMs }); } catch {} }
  newRequestId(member: string): string { return `shutdown-${member}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`; }
}
