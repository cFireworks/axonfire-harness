import { z } from "zod";
import type { RunContext } from "@openai/agents-core";
import type { HarnessSession } from "../sessions/session.js";
import type { CommandToolResult } from "../commands/types.js";
import { getAllowedBuiltinCommands } from "../commands/builtin-commands.js";
import { ALL_BUILTIN_COMMAND_NAMES, type CommandToolRuntime } from "./skill-tool.js";
import { validateToolParameters } from "./zod-utils.js";
import type { ToolManager } from "./tool-manager.js";

export const slashCommandParameters = z.object({ command: z.string().describe('The slash command to execute with its arguments, e.g., "/model gpt-4o", "/context", "/review-pr 123"') });
export class SlashCommandTool {
  readonly name = "SlashCommand";
  readonly aliases = ["slash-command"];
  readonly parameters = slashCommandParameters;
  constructor(readonly runtime: CommandToolRuntime) {}
  resolveNeedPermissionArgs(_context: unknown, input: { command: string }): Array<{ type: string; value: string }> { return [{ type: "slashCommand", value: input.command }]; }
  extractCommandName(value?: string): string | undefined { const trimmed = value?.trim(); if (trimmed?.startsWith("/")) return trimmed.split(/\s+/)[0]; }
  async needsApproval(context: RunContext<HarnessSession>, input: { command: string }, callId?: string): Promise<boolean> {
    const name = this.extractCommandName(input.command);
    if (name && getAllowedBuiltinCommands().has(name)) return false;
    return this.runtime.needsApproval?.(this, context, input, callId, (context, input) => this.resolveNeedPermissionArgs(context, input)) ?? false;
  }
  validateToolParams(input: { command: string }): string | undefined {
    const error = validateToolParameters(this.parameters, input);
    if (error) return error;
    const value = input.command?.trim();
    if (!value) return "Command cannot be empty";
    if (!value.startsWith("/")) return 'Command must start with "/"';
    if (value.split(/\s+/)[0]!.length <= 1) return "Invalid command format";
  }
  async safeRender(content: string): Promise<string> { try { return await this.runtime.renderPrompt(content); } catch { this.runtime.logger?.error?.(`Failed to render prompt: ${content}`); return content; } }
  async execute(input: { command: string }, context: RunContext<HarnessSession>): Promise<CommandToolResult> {
    const error = this.validateToolParams(input);
    if (error) return { content: `Slash command rejected: ${input.command}\nReason: ${error}` };
    try {
      const value = input.command.trim(), name = value.split(/\s+/)[0]!;
      if (!value.startsWith("/")) return { content: `Error: Command must start with "/". Received: "${value}"` };
      const builtin = ALL_BUILTIN_COMMAND_NAMES.has(name) || this.runtime.commands.isLocalCommand(name);
      if (builtin && !getAllowedBuiltinCommands().has(name)) return { content: `Error: The built-in command "${name}" is not available for model-driven calls. It requires direct user interaction.` };
      if (builtin && this.runtime.commands.isLocalCommand(name)) return this.executeBuiltinCommand(value, name, context);
      const command = (await this.runtime.configuration()).commands?.find((command) => command.name === name);
      if (!command) return { content: `Error: Can not find command: "${name}"` };
      const message = `Launching slash command: ${value}`, rendered = await this.runtime.renderer.render(command, value), content = await this.safeRender(rendered!) || value;
      const args = value.substring(name.length).trim(), argsTag = args ? ` <command-args>${args}</command-args>` : "";
      return { content: [message, `<command-message>${name.substring(1)}</command-message> <command-name>${name}</command-name>${argsTag}`, content].join("\n"), renderer: { type: "text", value: message } };
    } catch (error) { const message = error instanceof Error ? error.message : String(error); return { content: `Error executing slash command: ${message}`, error: message }; }
  }
  async executeBuiltinCommand(input: string, name: string, context: RunContext<HarnessSession>): Promise<CommandToolResult> {
    const session = context.context, parsed = this.runtime.commands.parseCommand(input);
    if (!parsed) return { content: `Error: Failed to parse built-in command: "${input}"` };
    try {
      await this.runtime.commands.executeLocalCommand({ name: parsed.name, session, args: parsed.args });
      await this.runtime.commands.finalizeCommandExecution(session);
      return { content: `Built-in command executed: ${input}`, renderer: { type: "text", value: `Executed: ${input}` } };
    } catch (error) { const message = error instanceof Error ? error.message : String(error); return { content: `Error executing built-in command "${name}": ${message}`, error: message }; }
  }
  register(manager: ToolManager): void { manager.register(this.name, { parameters: this.parameters, parseInput: false, aliases: this.aliases,
    resolveNeedPermissionArgs: (context, input) => this.resolveNeedPermissionArgs(context, input as { command: string }),
    needsApproval: (context, input, callId) => this.needsApproval(context, input as { command: string }, callId), execute: (input, context) => this.execute(input as { command: string }, context) }); }
}
