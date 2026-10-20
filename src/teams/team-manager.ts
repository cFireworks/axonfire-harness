import { access, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import type { HarnessSession } from "../sessions/session.js";
import { TeamMailbox } from "./team-mailbox.js";
import type { TeamConfig, TeamLogger, TeamMemberInfo } from "./team-types.js";
/** Source 8378071..8383696. The product home is provided by the embedding host. */
export class TeamManager {
  private teamConfig: TeamConfig | undefined;
  private readonly sessionCreatedTeams = new Set<string>();
  constructor(readonly homeDir: string, readonly mailbox: TeamMailbox, readonly getWorkDir: () => string,
    readonly cleanupService: { cleanupTeamWorktrees(members: TeamMemberInfo[]): Promise<{ cleaned: string[]; preserved: string[]; failed: string[] }> }, readonly logger: TeamLogger = {}) {}
  isEnabled(): boolean { return process.env.CODEBUDDY_CODE_EXPERIMENTAL_AGENT_TEAMS !== "0"; }
  isAutoTeam(): boolean { return this.teamConfig?.isAutoTeam ?? false; }
  isInTeam(): boolean { return this.teamConfig !== undefined; }
  teamDir(name: string): string { return join(this.homeDir, "teams", name); }
  taskDir(name: string): string { return join(this.homeDir, "tasks", name); }
  async createTeam(name: string, session: HarnessSession, description?: string, agentType?: string, options?: { isAutoTeam?: boolean }): Promise<TeamConfig> {
    if (this.teamConfig) throw new Error(`Already in a team: "${this.teamConfig.name}". Delete the current team first.`);
    let actual = name, teamDir = this.teamDir(actual), inboxes = this.mailbox.getTeamInboxesDir(actual), tasks = this.taskDir(actual);
    if (options?.isAutoTeam && await this.pathExists(teamDir)) { this.logger.info?.(`Cleaning up stale auto-team directory: ${teamDir}`); await rm(teamDir, { recursive: true, force: true }); await rm(tasks, { recursive: true, force: true }); }
    if (!options?.isAutoTeam && await this.pathExists(teamDir)) { actual = await this.resolveUniqueTeamName(name); teamDir = this.teamDir(actual); inboxes = this.mailbox.getTeamInboxesDir(actual); tasks = this.taskDir(actual); this.logger.info?.(`Team "${name}" already exists, renamed to "${actual}"`); }
    await mkdir(inboxes, { recursive: true }); await mkdir(tasks, { recursive: true });
    const leadAgentId = `team-lead@${actual}`, lead: TeamMemberInfo = { agentId: leadAgentId, name: "team-lead", agentType: agentType || "team-lead", model: session.requestOptions?.model, joinedAt: Date.now(), tmuxPaneId: "", cwd: this.getWorkDir(), subscriptions: [] };
    this.teamConfig = { name: actual, description, createdAt: Date.now(), leadAgentId, leadSessionId: session.id, members: [lead], ...(options?.isAutoTeam ? { isAutoTeam: true } : {}) };
    await this.writeInbox(actual, "team-lead", []); await this.saveConfig(); this.sessionCreatedTeams.add(actual);
    this.logger.info?.(`Team "${actual}" created with lead session ${session.id}${options?.isAutoTeam ? " (auto-team)" : ""}`); return this.teamConfig;
  }
  async autoCreateTeam(sessionId: string, session: HarnessSession): Promise<TeamConfig> { return this.createTeam(`_auto_${sessionId}`, session, "Auto-created team for background tasks", undefined, { isAutoTeam: true }); }
  async deleteTeam(): Promise<void> {
    if (!this.teamConfig) throw new Error("Not in a team. Nothing to delete.");
    const { name, members } = this.teamConfig, cleanup = await this.cleanupService.cleanupTeamWorktrees(members);
    if (cleanup.preserved.length) this.logger.info?.(`Some worktrees were preserved due to changes: ${cleanup.preserved.join(", ")}`);
    await rm(this.teamDir(name), { recursive: true, force: true }); await rm(this.taskDir(name), { recursive: true, force: true }); this.sessionCreatedTeams.delete(name); this.logger.info?.(`Team "${name}" deleted`); this.teamConfig = undefined;
  }
  async cleanupSessionTeams(): Promise<void> {
    if (!this.sessionCreatedTeams.size) return; const teams = [...this.sessionCreatedTeams]; this.logger.info?.(`Cleaning up ${teams.length} team(s) created this session: ${teams.join(", ")}`);
    await Promise.allSettled(teams.map(async (name) => { try { await rm(this.teamDir(name), { recursive: true, force: true }); await rm(this.taskDir(name), { recursive: true, force: true }); } catch (error) { this.logger.warn?.(`Failed to cleanup team "${name}" on session end: ${error}`); } })); this.sessionCreatedTeams.clear();
  }
  getTeam(): TeamConfig | undefined { return this.teamConfig; }
  getMembers(): TeamMemberInfo[] { return this.teamConfig?.members ?? []; }
  getMember(name: string): TeamMemberInfo | undefined { return this.teamConfig?.members.find((member) => member.name === name || member.agentId === name); }
  getTeamDir(): string | undefined { return this.teamConfig ? this.teamDir(this.teamConfig.name) : undefined; }
  getTaskDir(): string | undefined { return this.teamConfig ? this.taskDir(this.teamConfig.name) : undefined; }
  async addMember(member: TeamMemberInfo): Promise<void> { if (!this.teamConfig) throw new Error("Not in a team. Create a team first."); if (this.teamConfig.members.some((existing) => existing.name === member.name)) throw new Error(`Member "${member.name}" already exists in team "${this.teamConfig.name}".`); this.teamConfig.members.push(member); await this.mailbox.createInbox(this.teamConfig.name, member.name); await this.saveConfig(); this.logger.info?.(`Member "${member.name}" added to team "${this.teamConfig.name}"`); }
  async removeMember(name: string): Promise<void> { if (!this.teamConfig) throw new Error("Not in a team."); const index = this.teamConfig.members.findIndex((member) => member.name === name); if (index === -1) throw new Error(`Member "${name}" not found in team "${this.teamConfig.name}".`); if (name === "team-lead") throw new Error("Cannot remove the team lead."); this.teamConfig.members.splice(index, 1); await this.saveConfig(); this.logger.info?.(`Member "${name}" removed from team "${this.teamConfig.name}"`); }
  async updateMember(name: string, update: Partial<TeamMemberInfo>): Promise<void> { if (!this.teamConfig) throw new Error("Not in a team."); const member = this.teamConfig.members.find((member) => member.name === name); if (!member) throw new Error(`Member "${name}" not found in team "${this.teamConfig.name}".`); Object.assign(member, update); await this.saveConfig(); }
  async loadTeam(name: string): Promise<TeamConfig | undefined> { const filename = this.mailbox.getTeamConfigPath(name); try { this.teamConfig = JSON.parse(await readFile(filename, "utf8")); this.logger.info?.(`Team "${name}" loaded from ${filename}`); return this.teamConfig; } catch { return undefined; } }
  async refreshFromDisk(): Promise<void> { if (!this.teamConfig) return; try { const configuration = JSON.parse(await readFile(this.mailbox.getTeamConfigPath(this.teamConfig.name), "utf8")); if (Array.isArray(configuration.members)) this.teamConfig.members = configuration.members; } catch {} }
  async saveConfig(): Promise<void> { if (!this.teamConfig) return; const directory = this.teamDir(this.teamConfig.name); if (!await this.pathExists(directory)) await mkdir(directory, { recursive: true }); await writeFile(this.mailbox.getTeamConfigPath(this.teamConfig.name), JSON.stringify(this.teamConfig, null, 2), "utf8"); }
  async resolveUniqueTeamName(name: string): Promise<string> { for (let attempt = 0; attempt < 5; attempt++) { const candidate = `${name}-${Math.random().toString(16).slice(2, 6)}`; if (!await this.pathExists(this.teamDir(candidate))) return candidate; } return `${name}-${Date.now().toString(16)}`; }
  async writeInbox(team: string, member: string, messages: unknown[]): Promise<void> { const directory = this.mailbox.getTeamInboxesDir(team); if (!await this.pathExists(directory)) await mkdir(directory, { recursive: true }); await writeFile(this.mailbox.getTeamInboxPath(team, member), JSON.stringify(messages, null, 2), "utf8"); }
  async pathExists(filename: string): Promise<boolean> { try { await access(filename); return true; } catch { return false; } }
}
