import { z } from "zod";
import type { RunContext } from "@openai/agents-core";
import type { HarnessSession } from "../sessions/session.js";
import type { AgentTaskConfig, AgentTask } from "../agents/agent-task.js";
import type { AgentTaskManager } from "../agents/agent-task-manager.js";
import type { CommandConfiguration, CommandHost, CommandToolResult, ProductCommand, ProductSkill, PluginInfo } from "../commands/types.js";
import type { CustomCommandRenderer } from "../commands/custom-command-renderer.js";
import { NON_MODEL_COMMANDS, CONDITIONAL_COMMANDS, getAllowedBuiltinCommands } from "../commands/builtin-commands.js";
import type { ToolManager } from "./tool-manager.js";
import { validateToolParameters } from "./zod-utils.js";

export const skillParameters = z.object({
  skill: z.string().optional().describe('The skill name. E.g., "commit", "review-pr", or "pdf"'),
  command: z.string().optional().describe('(Legacy) The skill name (no arguments). E.g., "pdf" or "xlsx"'),
  args: z.string().optional().describe("Optional arguments for the skill"),
}).refine((input) => input.skill || input.command, { message: 'Either "skill" or "command" parameter is required' });
export type SkillInput = z.infer<typeof skillParameters>;
export type CommandToolRuntime = {
  configuration(): Promise<CommandConfiguration>;
  renderer: CustomCommandRenderer;
  renderPrompt(content: string): Promise<string>;
  commands: CommandHost;
  logger?: { info?(message: string): void; error?(message: string): void; warn?(message: string): void };
  isDesktop?: () => boolean;
  reportCapability?: (event: { name: string; pName: string; type: string; action: string; conversationId: string | undefined; requestId: string | undefined }) => void;
  needsApproval?: (tool: unknown, context: RunContext<HarnessSession>, input: unknown, callId: string | undefined, resolveArgs: (...args: any[]) => unknown) => Promise<boolean>;
  createTask?: (config: AgentTaskConfig, main: HarnessSession) => AgentTask;
  tasks?: Pick<AgentTaskManager, "registerTask">;
  resolveModel?: (value: string | undefined, source: string) => Promise<string | undefined>;
};
export function isSkillAdminTrusted(skill?: ProductSkill): boolean {
  return Boolean(skill && !skill.pluginInfo && skill.source !== "plugin" && skill.source !== "project" && skill.source !== "user");
}
/** Source 11919499..11926988. Skill instructions are data returned to the agent, not executed by this class. */
export class SkillTool {
  readonly name = "Skill";
  readonly aliases = ["skill"];
  readonly parameters = skillParameters;
  readonly needsApproval = false;
  constructor(readonly runtime: CommandToolRuntime) {}
  resolveNeedPermissionArgs(_context: unknown, input: SkillInput): Array<{ type: string; value: string }> {
    const value = input.skill || input.command || "";
    return [{ type: value.trim().startsWith("/") ? "slashCommand" : "skill", value }];
  }
  validateToolParams(input: SkillInput): string | undefined {
    const error = validateToolParameters(this.parameters, input);
    if (error) return error;
    if (!(input.skill || input.command)?.trim()) return "Skill name cannot be empty";
  }
  async execute(input: SkillInput, context?: RunContext<HarnessSession>): Promise<CommandToolResult> {
    const error = this.validateToolParams(input);
    if (error) return { content: `Skill rejected: ${input.skill || input.command || ""}\nReason: ${error}` };
    try {
      const name = (input.skill || input.command || "").trim(), args = input.args?.trim() || "";
      return name.startsWith("/") ? this.executeSlashCommand(name, args, context) : this.executeSkill(name, args, context);
    } catch (error) { const message = error instanceof Error ? error.message : String(error); return { content: `Error executing skill: ${message}`, error: message }; }
  }
  async executeSlashCommand(name: string, args: string, context?: RunContext<HarnessSession>): Promise<CommandToolResult> {
    const input = args ? `${name} ${args}` : name, token = name.split(/\s+/)[0]!;
    const builtin = await this.tryExecuteBuiltinCommand(token, input, context);
    if (builtin) return builtin;
    const command = (await this.runtime.configuration()).commands?.find((command) => command.name === token);
    if (!command) return { content: `Error: Can not find command: "${token}"` };
    this.reportPluginCommandCall(command, token, context);
    const message = `Command "${token}" loaded. Follow the instructions below to complete it:`;
    const rendered = await this.runtime.renderer.render(command, input);
    const content = await this.safeRender(rendered!) || input;
    const argumentsText = input.substring(token.length).trim(), argsTag = argumentsText ? ` <command-args>${argumentsText}</command-args>` : "";
    return { content: [`<command-message>${token.substring(1)}</command-message> <command-name>${token}</command-name>${argsTag}`, content].join("\n"), renderer: { type: "text", value: message } };
  }
  async tryExecuteBuiltinCommand(name: string, input: string, context?: RunContext<HarnessSession>): Promise<CommandToolResult | null> {
    const commands = this.runtime.commands;
    // Deliberately unlike SlashCommand: only NON_MODEL_COMMANDS and local executors trigger this branch.
    if (!(NON_MODEL_COMMANDS.some((command) => command.name === name) || commands.isLocalCommand(name))) return null;
    if (!getAllowedBuiltinCommands().has(name)) return { content: `Error: The built-in command "${name}" is not available for model-driven calls. It requires direct user interaction.` };
    if (!commands.isLocalCommand(name)) return { content: `Error: No executor found for built-in command "${name}".` };
    const session = context?.context;
    if (!session) return { content: `Error: Session context required to execute built-in command "${name}".` };
    const parsed = commands.parseCommand(input);
    if (!parsed) return { content: `Error: Failed to parse built-in command: "${input}"` };
    try {
      const index = session.history.length;
      await commands.executeLocalCommand({ name: parsed.name, session, args: parsed.args });
      await commands.finalizeCommandExecution(session);
      const output: string[] = [];
      for (const item of session.history.slice(index) as any[]) if (item.type === "message" && item.role === "user") {
        for (const part of Array.isArray(item.content) ? item.content : [{ type: "input_text", text: String(item.content) }]) if (part.type === "input_text" && part.text) {
          const match = part.text.match(/<local-command-stdout>([\s\S]*?)<\/local-command-stdout>/);
          if (match) output.push(match[1]!.trim());
        }
      }
      return { content: output.length ? output.join("\n") : `Built-in command executed: ${input}`, renderer: { type: "text", value: `Executed: ${input}` } };
    } catch (error) { const message = error instanceof Error ? error.message : String(error); return { content: `Error executing built-in command "${name}": ${message}`, error: message }; }
  }
  findSkill(skills: readonly ProductSkill[] | undefined, name: string): { skill?: ProductSkill; error?: string } {
    if (!skills?.length) return {};
    const exact = skills.find((skill) => skill.name === name);
    if (exact) return { skill: exact };
    if (!name.includes(":")) {
      const matches = skills.filter((skill) => (skill.name.includes(":") ? skill.name.split(":").pop() : skill.name) === name);
      if (matches.length === 1) return { skill: matches[0]! };
      if (matches.length > 1) return { error: `Ambiguous skill name "${name}". Multiple skills match: ${matches.map((skill) => `"${skill.name}"`).join(", ")}. Please use the full qualified name.` };
    }
    const display = skills.filter((skill) => skill.displayName === name);
    if (display.length === 1) return { skill: display[0]! };
    if (display.length > 1) return { error: `Ambiguous skill display name "${name}". Multiple skills match: ${display.map((skill) => `"${skill.name}"`).join(", ")}. Please use the technical name.` };
    return {};
  }
  async executeSkill(name: string, args: string, context?: RunContext<HarnessSession>): Promise<CommandToolResult> {
    const configuration = await this.runtime.configuration(), { skill, error } = this.findSkill(configuration.skills, name);
    if (error) return { content: error };
    if (skill) {
      this.runtime.logger?.info?.(`Skill "${name}" context=${skill.context}, agent=${skill.agent}`);
      this.reportPluginCapabilityCall("skill", skill.name, skill.pluginInfo, context);
      if (skill.context === "fork") return context?.context ? this.executeSkillInForkContext(skill, args, context) : { content: `Error: Fork context skill "${name}" requires a session context`, error: "Session context required for fork context skill" };
      let instructions = await this.runtime.renderer.processContent(skill.instructions, args || undefined);
      if (context?.context.id) instructions = this.replaceSessionId(instructions, context.context.id);
      return { content: [`Base directory for this skill: ${skill.baseDirectory}`, instructions].join("\n"), renderer: { type: "text", value: `Skill "${name}" loaded. Follow the instructions below to complete it:` } };
    }
    const commandName = `/${name}`, builtin = await this.tryExecuteBuiltinCommand(commandName, args ? `${commandName} ${args}` : commandName, context);
    if (builtin) return builtin;
    return configuration.commands?.find((command) => command.name === commandName || command.name === name) ? this.executeSlashCommand(commandName, args, context)
      : { content: `Error: Can not find skill: "${name}". Also checked for slash command "/${name}" but not found.` };
  }
  async safeRender(content: string): Promise<string> { try { return await this.runtime.renderPrompt(content); } catch { this.runtime.logger?.error?.(`Failed to render prompt: ${content}`); return content; } }
  reportPluginCapabilityCall(type: string, action: string, info: PluginInfo | undefined, context?: RunContext<HarnessSession>): void {
    if (this.runtime.isDesktop?.() && info?.pluginName) try { this.runtime.reportCapability?.({ name: info.pluginName, pName: info.marketplaceName || "", type, action, conversationId: context?.context.id, requestId: context?.context.conversationRequestId }); }
    catch (error) { this.runtime.logger?.warn?.(`Failed to report plugin_capability_call: ${error}`); }
  }
  reportPluginCommandCall(command: ProductCommand, action: string, context?: RunContext<HarnessSession>): void {
    if (!this.runtime.isDesktop?.()) return;
    const tags = command.tags;
    if (!Array.isArray(tags) || !tags.includes("plugin")) return;
    const tag = tags.at(-1);
    if (!tag || typeof tag !== "string" || tag === "plugin") return;
    const separator = tag.indexOf("@"), name = separator > 0 ? tag.substring(0, separator) : tag, marketplaceName = separator > 0 ? tag.substring(separator + 1) : "";
    this.reportPluginCapabilityCall("command", action, { pluginName: name, marketplaceName }, context);
  }
  async buildForkPrompt(skill: ProductSkill, args: string, context?: RunContext<HarnessSession>): Promise<string> {
    let content = await this.runtime.renderer.processContent(skill.instructions, args || undefined);
    if (context?.context.id) content = this.replaceSessionId(content, context.context.id);
    return [...skill.baseDirectory ? [`Base directory for this skill: ${skill.baseDirectory}`] : [], content].join("\n");
  }
  async executeSkillInForkContext(skill: ProductSkill, args: string, context: RunContext<HarnessSession>): Promise<CommandToolResult> {
    const prompt = await this.buildForkPrompt(skill, args, context), type = skill.agent || "general-purpose";
    const model = await this.runtime.resolveModel?.(skill.model, `skill:${skill.name}`);
    if (!this.runtime.createTask || !this.runtime.tasks) throw new Error("Skill fork AgentTask host is not connected");
    const task = this.runtime.createTask({ description: `Skill: ${skill.name}`, prompt, subagent_type: type, ...(model === undefined ? {} : { model }), captureOutput: false, detached: true,
      ...skill.hooks ? { additionalHooks: skill.hooks, additionalHooksSourceLabel: `skill '${skill.name}'`, additionalHooksAdminTrusted: isSkillAdminTrusted(skill) } : {} }, context.context);
    this.runtime.tasks.registerTask(task, true);
    try { const result = await task.execute(); return { content: [`Skill "${skill.name}" completed (forked execution).`, "", result.content].join("\n"), renderer: { type: "text", value: `Skill "${skill.name}" completed` } }; }
    catch (error) { const message = error instanceof Error ? error.message : String(error); this.runtime.logger?.error?.(`Fork context skill "${skill.name}" failed: ${message}`); return { content: `Skill "${skill.name}" failed in fork context: ${message}`, error: message }; }
  }
  private replaceSessionId(content: string, id: string): string { return content.replace(/\$\{CODEBUDDY_SESSION_ID\}/g, id).replace(/\$\{CLAUDE_SESSION_ID\}/g, id); }
  register(manager: ToolManager): void { manager.register(this.name, { parameters: this.parameters, parseInput: false, aliases: this.aliases, needsApproval: this.needsApproval,
    resolveNeedPermissionArgs: (context, input) => this.resolveNeedPermissionArgs(context, input as SkillInput), execute: (input, context) => this.execute(input as SkillInput, context) }); }
}
export const ALL_BUILTIN_COMMAND_NAMES = new Set([...NON_MODEL_COMMANDS, ...CONDITIONAL_COMMANDS.map((entry) => entry.command)].map((command) => command.name));
