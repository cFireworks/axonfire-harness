import { z } from "zod";
import type { RunContext } from "@openai/agents-core";
import type { HarnessSession } from "../sessions/session.js";
import type { TeamManager } from "../teams/team-manager.js";
import type { TeamMemberRegistry } from "../teams/team-member.js";
import type { TeamLeadInboxPoller } from "../teams/team-lead-inbox-poller.js";
import type { ToolManager } from "./tool-manager.js";
export const TeamCreateSchema = z.object({ team_name: z.string().describe("Name for the new team to create."), description: z.string().optional().describe("Team description/purpose."), agent_type: z.string().optional().describe('Type/role of the team lead (e.g., "researcher", "test-runner"). Used for team file and inter-agent coordination.') });
export const TeamDeleteSchema = z.object({});
export class TeamTools {
  constructor(readonly manager: TeamManager, readonly registry: TeamMemberRegistry, readonly poller: TeamLeadInboxPoller) {}
  async create(input: z.infer<typeof TeamCreateSchema>, context?: RunContext<HarnessSession>): Promise<any> {
    if (!context?.context) throw new Error("Session is required to create a team"); const session = context.context;
    if (this.manager.isInTeam()) return { content: `Already in team "${this.manager.getTeam()!.name}". Delete the current team first before creating a new one.` };
    try { const team = await this.manager.createTeam(input.team_name, session, input.description, input.agent_type), name = team.name; if (session.meta) { session.meta.teamName = name; session.meta.isTeamLead = true; } this.poller.startTeamLeadInboxPolling(name, session); const renamed = name !== input.team_name ? ` (renamed from "${input.team_name}")` : ""; return { content: [`Team "${name}" created.${renamed}`, input.description ? `Description: ${input.description}` : "", `Lead: ${team.leadAgentId}`, "", "Spawn teammates with the Agent tool using `name` and `team_name` parameters."].filter(Boolean).join("\n"), renderer: { type: "team-created", value: JSON.stringify({ teamName: name, description: input.description }) } }; } catch (error) { return { content: `Failed to create team: ${error instanceof Error ? error.message : String(error)}` }; }
  }
  async delete(_input: unknown, context?: RunContext<HarnessSession>): Promise<any> {
    if (!context?.context) throw new Error("Session is required"); const session = context.context;
    if (!this.manager.isInTeam()) return { content: "Not in a team. Nothing to delete." };
    const name = this.manager.getTeam()!.name, active = this.registry.getActive().filter((member) => member.info.name !== "team-lead");
    if (active.length) return { content: `Cannot delete team "${name}": ${active.length} teammate(s) still active: ${active.map((member) => member.info.name).join(", ")}. Send a shutdown_request to each via SendMessage and wait for their shutdown_response, then retry TeamDelete.` };
    try { this.poller.stopTeamLeadPoller(); await this.registry.destroyAll(); await this.manager.deleteTeam(); if (session.meta) { delete session.meta.teamName; delete session.meta.isTeamLead; } return { content: `Team "${name}" deleted successfully.\n\nRemoved: ${this.manager.teamDir(name)}/\nRemoved: ${this.manager.taskDir(name)}/` }; } catch (error) { return { content: `Failed to delete team: ${error instanceof Error ? error.message : String(error)}` }; }
  }
  register(tools: ToolManager): void {
    tools.register("TeamCreate", { parameters: TeamCreateSchema, parseInput: false, needsApproval: false, isEnabled: () => this.manager.isEnabled(), shouldShowInToolSearch: () => this.manager.isEnabled(), execute: (input, context) => this.create(input as any, context) });
    tools.register("TeamDelete", { parameters: TeamDeleteSchema, parseInput: false, needsApproval: false, isEnabled: () => this.manager.isEnabled(), shouldShowInToolSearch: () => this.manager.isEnabled(), execute: (input, context) => this.delete(input, context) });
  }
}
