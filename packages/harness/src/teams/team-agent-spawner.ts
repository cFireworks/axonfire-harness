import type { AgentTaskManager } from "../agents/agent-task-manager.js";
import type { HarnessSession } from "../sessions/session.js";
import type { AgentToolResult } from "../tools/agent-tool.js";
import { TeamMember, TeamMemberRegistry, type TeamMemberRuntime } from "./team-member.js";
import { TeamManager } from "./team-manager.js";
import { TeamLeadInboxPoller } from "./team-lead-inbox-poller.js";
import { getTeamMemberColor } from "./team-mailbox.js";
import type { TeamMemberInfo } from "./team-types.js";
/** The serialized spawn chain intentionally retains the source rejection behavior. */
export class TeamAgentSpawner {
  private teamSpawnChain: Promise<void> = Promise.resolve();
  constructor(readonly manager: TeamManager, readonly registry: TeamMemberRegistry, readonly taskManager: AgentTaskManager, readonly poller: TeamLeadInboxPoller, readonly memberRuntime: TeamMemberRuntime, readonly getCwd: () => string) {}
  /** Standalone shutdown barrier, not an additional product spawn branch. */
  async waitForSpawns(): Promise<void> { await this.teamSpawnChain.catch(() => undefined); }
  generateBackgroundAgentName(type: string): string { return `${type}-${this.taskManager.getTasks().filter((task) => task.agentType === type).length + 1}`; }
  resolveUniqueMemberName(team: string, name: string): string { if (!this.registry.get(name, team)) return name; for (let index = 0; index < 5; index++) { const candidate = `${name}-${Math.random().toString(16).slice(2, 6)}`; if (!this.registry.get(candidate, team)) return candidate; } return `${name}-${Date.now().toString(16)}`; }
  async spawnBackground(main: HarnessSession, spec: { description: string; prompt: string; agentType: string; model?: string; maxTurns?: number }): Promise<AgentToolResult> {
    let member!: TeamMember, name!: string, info!: TeamMemberInfo, team!: string;
    try {
      this.teamSpawnChain = this.teamSpawnChain.then(async () => {
        if (!this.manager.isInTeam()) { await this.manager.autoCreateTeam(main.id, main); if (main.meta) { main.meta.teamName = this.manager.getTeam()!.name; main.meta.isTeamLead = true; } this.poller.startTeamLeadInboxPolling(this.manager.getTeam()!.name, main); }
        team = this.manager.getTeam()!.name; name = this.resolveUniqueMemberName(team, this.generateBackgroundAgentName(spec.agentType));
        const index = this.manager.getMembers().filter((member) => member.agentType !== "team-lead").length;
        info = { agentId: `${name}@${team}`, name, agentType: spec.agentType, model: spec.model, prompt: spec.prompt, color: getTeamMemberColor(index), joinedAt: Date.now(), tmuxPaneId: "in-process", cwd: this.getCwd(), subscriptions: ["*"], backendType: "in-process" };
        await this.manager.addMember(info); member = new TeamMember(team, info, this.memberRuntime);
        try { await member.spawn(main, spec.prompt, spec.agentType, { model: spec.model, memberIndex: index, maxTurns: spec.maxTurns, taskDescription: spec.description }); } catch (error) { try { await this.manager.removeMember(info.name); } catch {} throw error; }
        this.registry.register(member);
      });
      await this.teamSpawnChain;
      return { content: `Spawned successfully.\nagent_id: ${info.agentId}\nname: ${name}\nteam_name: ${team}\ntask_id: ${member.getTaskId()}\nThe agent is now running and will receive instructions via mailbox.`, renderer: { type: "team-member-spawned", value: JSON.stringify({ name, description: spec.description, teamName: team, color: info.color, taskId: member.getTaskId(), prompt: spec.prompt }) } };
    } catch (error) { return { content: `Failed to spawn background agent: ${error instanceof Error ? error.message : String(error)}` }; }
  }
  async spawnTeammate(main: HarnessSession, spec: { name: string; description: string; prompt: string; subagentType: string; model?: string; teamName?: string; permissionMode?: string; maxTurns?: number }): Promise<AgentToolResult> {
    const current = this.manager.getTeam(); if (!current) return { content: "No active team found. Create a team first using TeamCreate." };
    const team = spec.teamName || current.name; let member!: TeamMember, info!: TeamMemberInfo, renamedFrom: string | undefined, name = spec.name;
    try {
      this.teamSpawnChain = this.teamSpawnChain.then(async () => {
        const names = new Set(this.manager.getMembers().map((member) => member.name.toLowerCase())); names.add("team-lead");
        const taken = (name: string) => !!this.registry.get(name, team) || names.has(name.toLowerCase());
        if (taken(spec.name)) { let suffix = 2; while (taken(`${spec.name}-${suffix}`)) suffix++; name = `${spec.name}-${suffix}`; renamedFrom = spec.name; }
        const index = this.manager.getMembers().filter((member) => member.agentType !== "team-lead").length;
        info = { agentId: `${name}@${team}`, name, role: spec.description, agentType: spec.subagentType, model: spec.model, prompt: spec.prompt, color: getTeamMemberColor(index), planModeRequired: spec.permissionMode === "plan", joinedAt: Date.now(), tmuxPaneId: "in-process", cwd: this.getCwd(), subscriptions: ["*"], backendType: "in-process" };
        await this.manager.addMember(info); member = new TeamMember(team, info, this.memberRuntime);
        try { await member.spawn(main, spec.prompt, spec.subagentType, { model: spec.model, memberIndex: index, maxTurns: spec.maxTurns, permissionMode: spec.permissionMode, taskDescription: spec.description }); } catch (error) { try { await this.manager.removeMember(info.name); } catch {} throw error; }
        this.registry.register(member);
      });
      await this.teamSpawnChain;
      const note = renamedFrom ? `Note: requested name "${renamedFrom}" was already in use (or reserved for the team leader). Renamed to "${name}". Use this name when addressing the teammate via SendMessage.` : undefined;
      const lines = ["Spawned successfully.", `agent_id: ${info.agentId}`, `name: ${name}`, `team_name: ${team}`, `task_id: ${member.getTaskId()}`, "The agent is now running and will receive instructions via mailbox."]; if (note) lines.push(note);
      return { content: lines.join("\n"), renderer: { type: "team-member-spawned", value: JSON.stringify({ name, renamedFrom, description: spec.description, teamName: team, color: info.color, taskId: member.getTaskId(), prompt: spec.prompt }) } };
    } catch (error) { return { content: `Failed to spawn teammate "${spec.name}": ${error instanceof Error ? error.message : String(error)}` }; }
  }
}
