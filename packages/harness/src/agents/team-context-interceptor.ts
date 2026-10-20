import type { AgentRunContext, AgentRunInterceptor } from "./agent-service.js";
import type { ProductPromptRenderer } from "../prompts/prompt-renderer.js";
import type { TeamManager } from "../teams/team-manager.js";
import { addSystemReminder } from "./system-reminder-agent-run-interceptor.js";
export const LAST_INJECTED_TEAMMATES = "__lastInjectedTeammates";
export class TeamContextInterceptor implements AgentRunInterceptor {
  readonly priority = 1175;
  constructor(readonly manager: TeamManager, readonly prompts: ProductPromptRenderer) {}
  async intercept(context: AgentRunContext): Promise<void> { if (!Array.isArray(context.input) || context.skipRun) return; const team = context.session.meta?.teamContext as { teamName: string; memberName: string; teamMembers: string[] } | undefined; if (team) await this.injectTeammatePrompt(context, team); else await this.injectTeamLeadPrompt(context); }
  async injectTeammatePrompt(context: AgentRunContext, team: { teamName: string; memberName: string; teamMembers: string[] }): Promise<void> {
    await this.manager.refreshFromDisk(); const current = this.manager.getMembers().filter((member) => member.name !== team.memberName).map((member) => member.name), members = current.length ? current : team.teamMembers, roster = members.slice().sort().join("|");
    if (this.shouldInjectTeamPrompt(context, "Agent Teammate Communication", roster)) try { if (!this.prompts.has("team-sys-prompt")) return; const rendered = await this.prompts.renderAsync("team-sys-prompt", { teamName: team.teamName, memberName: team.memberName, teamMembers: members.join(", ") }); if (rendered) { addSystemReminder(context.input as any[], `<system-reminder data-role="team-context">\n${rendered}\n</system-reminder>`, "last"); this.recordInjectedRoster(context, roster); } } catch {}
  }
  async injectTeamLeadPrompt(context: AgentRunContext): Promise<void> {
    if (!this.manager.isInTeam()) return; await this.manager.refreshFromDisk(); const team = this.manager.getTeam()!, members = this.manager.getMembers().filter((member) => member.name !== "team-lead"), listing = members.map((member) => `- ${member.name} (${member.agentType || "agent"})`).join("\n"); if (!listing) return;
    const roster = members.map((member) => member.name).sort().join("|");
    if (this.shouldInjectTeamPrompt(context, "Agent Team Communication", roster)) try { if (!this.prompts.has("team-lead-prompt")) return; const rendered = await this.prompts.renderAsync("team-lead-prompt", { teamName: team.name, members: listing }); if (rendered) { addSystemReminder(context.input as any[], `<system-reminder data-role="team-context">\n${rendered}\n</system-reminder>`, "last"); this.recordInjectedRoster(context, roster); } } catch {}
  }
  shouldInjectTeamPrompt(context: AgentRunContext, marker: string, roster?: string): boolean { const input = context.input as any[]; if (input.filter((item) => item.role === "user").length === 1 || context.session.options?.continue && !context.session.options?.continued || roster !== undefined && context.session.meta?.[LAST_INJECTED_TEAMMATES] !== roster) return true; for (const item of input) if (item.type === "message" && item.role === "user") { if (typeof item.content === "string" && item.content.includes(marker)) return false; if (Array.isArray(item.content) && item.content.some((part: any) => part.type === "input_text" && typeof part.text === "string" && part.text.includes(marker))) return false; } return true; }
  recordInjectedRoster(context: AgentRunContext, roster: string): void { context.session.meta ||= {}; context.session.meta[LAST_INJECTED_TEAMMATES] = roster; }
}
