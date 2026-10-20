import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { user } from "@openai/agents-core";
import type { HarnessSession } from "../sessions/session.js";
import type { TeamMessage } from "./team-mailbox.js";
import { formatTeammateMessage } from "./team-mailbox.js";
import { PermissionBridgeClient } from "./permission-bridge.js";
import type { TeamLogger } from "./team-types.js";
export function getArgValue(flag: string, args = process.argv): string | undefined { for (let index = 0; index < args.length; index++) { if (args[index] === flag && index + 1 < args.length) return args[index + 1]; if (args[index]!.startsWith(`${flag}=`)) return args[index]!.slice(flag.length + 1); } return; }
export function hasArg(flag: string, args = process.argv): boolean { return args.includes(flag); }
export type TeammateRunnerRuntime = {
  args?: string[]; sleep?: (milliseconds: number) => Promise<void>; exit?: (code: number) => void; onSignal?: (signal: "SIGTERM" | "SIGINT", listener: () => void) => void;
  endpointProvider?: { get(): Promise<string | undefined> }; permissionClient?: (endpoint: string, member: string, team: string) => Pick<PermissionBridgeClient, "isAvailable">;
};
/** Native 8412968..8417181. runAgent deliberately awaits publication, not SDK completion. */
export class TeammateRunner {
  shuttingDown = false;
  session: HarnessSession | undefined;
  constructor(readonly teamMailbox: { getUnread(team: string, member: string): Promise<TeamMessage[]>; markAllAsRead(team: string, member: string): Promise<void>; send(team: string, recipient: string, message: TeamMessage): Promise<void> }, readonly sessionManager: { create(): Promise<HarnessSession>; initRunResultHandler(session: HarnessSession): void }, readonly agentService: { runDefault(input: ReturnType<typeof user>[], options: { context: HarnessSession }): Promise<void> }, readonly endpointPath: (team: string, member: string) => string, readonly logger: TeamLogger & { setContext?(context: string): void } = {}, readonly runtime: TeammateRunnerRuntime = {}) {}
  private sleep(milliseconds: number): Promise<void> { return this.runtime.sleep?.(milliseconds) ?? new Promise((done) => setTimeout(done, milliseconds)); }
  private exit(code: number): void { if (this.runtime.exit) this.runtime.exit(code); else process.exit(code); }
  async onStart(_context?: unknown): Promise<void> { if (!hasArg("--teammate-mode", this.runtime.args)) return; const team = getArgValue("--team-name", this.runtime.args), member = getArgValue("--agent-name", this.runtime.args); if (team && member) { this.logger.setContext?.(`TeammateMailbox-${member}@${team}`); void this.runService(team, member).catch((error) => { this.logger.error?.("Teammate mailbox service failed:", error); this.exit(1); }); } }
  async runService(team: string, member: string): Promise<void> {
    const leader = getArgValue("--leader-endpoint", this.runtime.args), parent = getArgValue("--parent-session-id", this.runtime.args);
    this.logger.info?.(`Teammate mailbox service starting (leader=${leader || "none"})`);
    this.session = await this.sessionManager.create(); this.session.options ||= {}; this.session.meta ||= {}; this.session.meta.teamName = team; this.session.meta.agentName = member; this.session.meta.isTeamMember = true; if (parent) this.session.meta.parentSessionId = parent; this.session.meta.teamContext = { teamName: team, memberName: member, teamMembers: [] };
    this.sessionManager.initRunResultHandler(this.session); void this.writeEndpointFile(team, member).catch((error) => this.logger.warn?.(`Failed to write endpoint file: ${error}`));
    if (leader) { const client = this.runtime.permissionClient?.(leader, member, team) ?? new PermissionBridgeClient(leader, member, team), available = await client.isAvailable(); this.logger.info?.(available ? `Permission Bridge connected to ${leader}` : `Permission Bridge: ${leader} not reachable`); }
    const listen = this.runtime.onSignal ?? ((signal, callback) => { process.on(signal, callback); }); listen("SIGTERM", () => { this.shuttingDown = true; }); listen("SIGINT", () => { this.shuttingDown = true; });
    const initial = await this.waitForInitialMessage(team, member); if (!initial.length) { this.logger.error?.("No initial message received within timeout"); return; }
    const prompt = initial.map((message) => this.formatMessage(message)).join("\n\n"); this.logger.info?.(`Initial prompt (${prompt.length} chars), starting agent`); await this.runAgent(prompt); await this.mailboxLoop(team, member); this.logger.info?.("Teammate mailbox service exiting");
    try { await this.writeEndpointFile(team, member); } catch (error) { this.logger.warn?.(`Failed to write final endpoint file: ${error}`); } this.exit(0);
  }
  async runAgent(prompt: string): Promise<void> { if (this.session) try { await this.agentService.runDefault([user(prompt)], { context: this.session }); } catch (error) { if (!this.shuttingDown) this.logger.error?.("Agent run failed:", error); } }
  async waitForInitialMessage(team: string, member: string): Promise<TeamMessage[]> { const deadline = Date.now() + 60000; while (Date.now() < deadline && !this.shuttingDown) { const messages = await this.teamMailbox.getUnread(team, member); if (messages.length > 0) { await this.teamMailbox.markAllAsRead(team, member); return messages; } await this.sleep(500); } return []; }
  async mailboxLoop(team: string, member: string): Promise<void> { while (!this.shuttingDown) { await this.sleep(2000); if (this.shuttingDown) break; const messages = await this.teamMailbox.getUnread(team, member); if (!messages.length) continue; await this.teamMailbox.markAllAsRead(team, member); const shutdown = messages.find((message) => this.isShutdownRequest(message)); if (shutdown) { await this.handleShutdownRequest(shutdown, team, member); break; } const prompt = messages.map((message) => this.formatMessage(message)).join("\n\n"); this.logger.info?.(`Received ${messages.length} message(s), running agent`); await this.runAgent(prompt); } }
  formatMessage(message: TeamMessage): string { return message.from === "user" ? message.text : formatTeammateMessage(message.from, message.summary || `Message from ${message.from}`, message.text); }
  isShutdownRequest(message: TeamMessage): boolean { try { return JSON.parse(message.text).type === "shutdown_request"; } catch (error) { this.logger.debug?.(`Failed to parse mailbox message as JSON: ${error}`); return false; } }
  async handleShutdownRequest(message: TeamMessage, team: string, member: string): Promise<void> { this.logger.info?.("Shutdown request received"); this.shuttingDown = true; let requestId; try { requestId = JSON.parse(message.text).request_id; } catch (error) { this.logger.debug?.(`Failed to parse shutdown request_id: ${error}`); } await this.teamMailbox.send(team, "team-lead", { from: member, text: JSON.stringify({ type: "shutdown_response", request_id: requestId, approve: true, reason: "Shutdown approved", from: member, timestamp: new Date().toISOString() }), summary: `Shutdown accepted by ${member}`, timestamp: new Date().toISOString() }); }
  async writeEndpointFile(team: string, member: string): Promise<void> { let endpoint; try { endpoint = await this.runtime.endpointProvider?.get(); } catch (error) { this.logger.debug?.(`EndpointProvider not available yet: ${error}`); } const path = this.endpointPath(team, member); mkdirSync(dirname(path), { recursive: true }); const history = this.session?.history || []; writeFileSync(path, JSON.stringify({ endpoint, sessionId: this.session?.id, memberName: member, teamName: team, pid: process.pid, timestamp: new Date().toISOString(), history: history.length > 0 ? history : undefined })); this.logger.info?.(`Endpoint file written: ${path} → ${endpoint || "no endpoint"} (${history.length} history items)`); }
}
