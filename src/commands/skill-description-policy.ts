import type { ProductAgent } from "../config/types.js";
import type { ProductCommand, ProductSkill } from "./types.js";
import { NON_MODEL_COMMANDS, CONDITIONAL_COMMANDS } from "./builtin-commands.js";

export type DescriptionOverview = { truncationMode: string; totalCount: number; shownCount: number; omittedCount: number; scanDirs?: Array<{ path: string; source: string }> };
/** Recovered ToolManager description budgeting (11666500..11671870). */
export class SkillDescriptionPolicy {
  readonly slashCommandCharBudget: number;
  readonly skillCharBudget: number;
  readonly agentToolCharBudget = 30_000;
  constructor(private readonly userSkillsDir: () => string) {
    const slash = process.env.SLASH_COMMAND_TOOL_CHAR_BUDGET;
    this.slashCommandCharBudget = slash && !isNaN(Number(slash)) && Number(slash) > 0 ? Number(slash) : 8_000;
    this.skillCharBudget = this.initSkillCharBudget();
  }
  initSkillCharBudget(): number {
    for (const value of [process.env.CODEBUDDY_SKILL_TOOL_CHAR_BUDGET, process.env.SLASH_COMMAND_TOOL_CHAR_BUDGET]) if (value && !isNaN(Number(value)) && Number(value) > 0) return Number(value);
    return 8_000;
  }
  hardCap(value: string, length: number): string { return value.length <= length ? value : length <= 1 ? value.slice(0, length) : value.slice(0, length - 1) + "…"; }
  isProtectedSkill(skill: ProductSkill): boolean { return skill.source === "bundled" || skill.source === "builtin"; }
  getSkillScanDirs(): Array<{ path: string; source: string }> { try { return [{ path: this.userSkillsDir(), source: "user" }]; } catch { return []; } }
  formatCommandForBudget(command: ProductCommand): string { return `- ${command.name.startsWith("/") ? command.name : `/${command.name}`}${command.argumentHint ? ` ${command.argumentHint}` : ""}: ${command.description || ""}`.trim(); }
  truncateCommandsByCharBudget(commands: readonly ProductCommand[]): { customCommands: ProductCommand[]; truncatedCustomCommands: ProductCommand[] } {
    const custom = commands.filter((command) => command.tags?.includes("custom") && !command.disableModelInvocation), shown: ProductCommand[] = []; let used = 0;
    for (const command of custom) { const length = this.formatCommandForBudget(command).length + 1; if (used + length > this.slashCommandCharBudget) break; shown.push(command); used += length; }
    return { customCommands: custom, truncatedCustomCommands: shown };
  }
  formatAgentForBudget(agent: ProductAgent, description: string): string { return `- ${agent.name}${description ? `: ${description}` : ""} (Tools: ${agent.tools?.length ? agent.tools.join(",") : ""})`; }
  truncateAgentsByCharBudget(agents: readonly ProductAgent[]): { agents: readonly ProductAgent[]; overview: DescriptionOverview } {
    const types = agents.filter((agent) => agent.asTool), shown: ProductAgent[] = [];
    let used = 0;
    const overview = (mode: string, count = types.length, omitted = 0) => ({ truncationMode: mode, totalCount: types.length, shownCount: count, omittedCount: omitted });
    if (!types.length) return { agents, overview: overview("none", 0) };
    for (const agent of types) { const length = this.formatAgentForBudget(agent, agent.description || "").length + 1; if (used + length > this.agentToolCharBudget) break; shown.push(agent); used += length; }
    if (shown.length === types.length) return { agents, overview: overview("none") };
    const names = new Set(shown.map((agent) => agent.name));
    return { agents: agents.filter((agent) => !agent.asTool || names.has(agent.name)), overview: overview("overflow", shown.length, types.length - shown.length) };
  }
  truncateSkillsByCharBudget(skills: readonly ProductSkill[]): { skills: Array<ProductSkill & { truncatedDescription: string }>; overview: DescriptionOverview } {
    const base = (mode: string, count: number, omitted = 0): DescriptionOverview => ({ truncationMode: mode, totalCount: skills.length, shownCount: count, omittedCount: omitted, scanDirs: this.getSkillScanDirs() });
    if (!skills.length) return { skills: [], overview: base("none", 0) };
    const entries = skills.map((skill) => ({ skill, protected: this.isProtectedSkill(skill), user: skill.source === "user", description: this.hardCap(skill.description || "", 150) }));
    const cost = (entry: typeof entries[number], description: string) => description.length + (entry.skill.name?.length ?? 0) + (entry.skill.source?.length ?? 0) + 90;
    const nonUser = entries.filter((entry) => !entry.user), user = entries.filter((entry) => entry.user), space = Math.max(0, 200 - nonUser.length), keptUser = user.slice(0, space), omitted = user.slice(space).length;
    const names = new Set(keptUser.map((entry) => entry.skill.name)), retained = entries.filter((entry) => !entry.user || names.has(entry.skill.name)), unprotected = retained.filter((entry) => !entry.protected);
    if (retained.reduce((total, entry) => total + cost(entry, entry.description), 0) <= this.skillCharBudget || !unprotected.length) return { skills: retained.map((entry) => ({ ...entry.skill, truncatedDescription: entry.description })), overview: base(omitted ? "overflow" : "none", retained.length, omitted) };
    const max = Math.floor((this.skillCharBudget - retained.filter((entry) => entry.protected).reduce((sum, entry) => sum + cost(entry, entry.description), 0) - unprotected.reduce((sum, entry) => sum + cost(entry, ""), 0)) / unprotected.length);
    if (max < 20) return { skills: retained.map((entry) => ({ ...entry.skill, truncatedDescription: entry.protected ? entry.description : "" })), overview: base(omitted ? "overflow" : "names-only", retained.length, omitted) };
    const trimmed = unprotected.filter((entry) => entry.description.length > max).length;
    return { skills: retained.map((entry) => ({ ...entry.skill, truncatedDescription: entry.protected ? entry.description : this.hardCap(entry.description, max) })), overview: base(omitted ? "overflow" : trimmed ? "trimmed" : "none", retained.length, omitted) };
  }
  variables(tool: string, agent: ProductAgent, skills: readonly ProductSkill[], commands: readonly ProductCommand[], agents: readonly ProductAgent[], acp = false): Record<string, unknown> {
    const selected = (agent.skills?.length ? skills.filter((skill) => agent.skills!.includes(skill.name)) : skills).filter((skill) => !skill.disableModelInvocation);
    const names = new Set<string>();
    for (const skill of skills) { const name = typeof skill.name === "string" ? skill.name : String(skill.name ?? ""); if (name) { names.add(name); if (typeof skill.displayName === "string" && skill.displayName) names.add(skill.displayName); if (name.includes(":")) { const suffix = name.split(":").pop(); if (suffix) names.add(suffix); } } }
    const builtins: ProductSkill[] = acp ? [] : [...NON_MODEL_COMMANDS, ...CONDITIONAL_COMMANDS.map((entry) => entry.command)].filter((command) => !command.disableModelInvocation).map((command) => ({ name: command.name.startsWith("/") ? command.name.substring(1) : command.name, description: command.description || "", instructions: "", baseDirectory: "", source: "builtin", location: "" }));
    const combined = [...builtins.filter((skill) => !names.has(skill.name)), ...selected];
    const variables: Record<string, unknown> = { agents, commands: commands.filter((command) => !command.disableModelInvocation), skills: combined, agentToolNames: agent.tools || [], teamEnabled: tool !== "Agent" && tool !== "TaskList", forkSubagentDisabled: ["1", "true", "yes", "on"].includes((process.env.CODEBUDDY_DISABLE_FORK_SUBAGENT ?? "").toLowerCase().trim()) };
    if (tool === "Skill") { const { skills, overview } = this.truncateSkillsByCharBudget(combined); variables.skills = skills; variables.skillsOverview = overview; }
    if (tool === "SlashCommand") Object.assign(variables, this.truncateCommandsByCharBudget(commands));
    if (tool === "Agent") { const { agents, overview } = this.truncateAgentsByCharBudget(variables.agents as ProductAgent[]); variables.agents = agents; variables.agentsOverview = overview; }
    return variables;
  }
}
