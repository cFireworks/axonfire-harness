import { CommandMessageUtils } from "./command-message-utils.js";
export { LOCAL_COMMAND_TIP } from "./command-message-utils.js";
import type { CommandConfiguration, CommandHost, ProductCommand } from "./types.js";
import type { HarnessSession } from "../sessions/session.js";
import type { SessionManager } from "../sessions/session-manager.js";
import { NON_MODEL_COMMANDS, CONDITIONAL_COMMANDS } from "./builtin-commands.js";

export type CommandExecution = { name: string; session: HarnessSession; args: string[]; timestamp?: number };
export type CommandExecutor = { name: string; message?: string; autoGenerateHistory?: boolean; execute(input: CommandExecution): Promise<void> };
/** CommandManager control flow; native/UI executors are registered explicitly, never mocked as successful. */
export class CommandManager implements CommandHost {
  private commands = new Map<string, ProductCommand>();
  private readonly commandExecutorMap = new Map<string, CommandExecutor>();
  private executingCommand: CommandExecution | undefined;
  private currentConfiguration: CommandConfiguration | undefined;
  private resolveReady!: () => void;
  private readonly ready = new Promise<void>((resolve) => { this.resolveReady = resolve; });
  constructor(private readonly configuration: () => Promise<CommandConfiguration>, private readonly sessions: Pick<SessionManager, "addHistory">,
    executors: readonly CommandExecutor[] = [], private readonly options: { currentConfiguration?: () => CommandConfiguration | undefined; conditionalEnabled?: (name: string) => Promise<boolean>; features?: () => Promise<Record<string, unknown>>; workflows?: () => Promise<readonly { name: string; description?: string; scope: string }[]>; workflowRegistry?: { invalidate?(): void; list(): Promise<readonly { name: string; description?: string; scope: string }[]> }; logger?: { warn?(message: string): void } } = {}) {
    for (const executor of executors) this.commandExecutorMap.set(executor.name, executor);
  }
  async rebuildCommands(): Promise<void> {
    this.currentConfiguration = await this.configuration();
    const { commands = [] } = this.currentConfiguration, base = new Map<string, ProductCommand>(), user = new Map<string, ProductCommand>(), project = new Map<string, ProductCommand>();
    for (const command of commands) { if (!command.name.startsWith("/")) command.name = `/${command.name}`; (command.scope === "user" ? user : command.scope === "project" ? project : base).set(command.name, command); }
    for (const [name, command] of user) base.set(name, command);
    for (const [name, command] of project) base.set(name, command);
    await this.injectSavedWorkflowCommands(base); this.commands = base; this.resolveReady();
  }
  async injectSavedWorkflowCommands(commands: Map<string, ProductCommand>): Promise<void> {
    let workflows: readonly { name: string; description?: string; scope: string }[];
    try { if (this.options.workflowRegistry) { this.options.workflowRegistry.invalidate?.(); workflows = await this.options.workflowRegistry.list(); } else workflows = await this.options.workflows?.() ?? []; } catch (error) { this.options.logger?.warn?.(`[CommandManager] failed to load saved workflows: ${(error as Error).message}`); return; }
    for (const workflow of workflows) { const name = `/${workflow.name}`; if (!commands.has(name)) commands.set(name, { name, description: `[dynamic workflow] ${workflow.description ?? `Saved workflow (${workflow.scope})`}`, prompt: "", requiredVariables: [], argumentHint: "[args...]", disableModelInvocation: true, tags: ["dynamic-workflow"] }); }
  }
  async get(name: string): Promise<ProductCommand | undefined> { await this.ready; return this.commands.get(name); }
  async register(command: ProductCommand): Promise<void> { await this.ready; this.commands.set(command.name, command); }
  async unregister(name: string): Promise<void> { await this.ready; this.commands.delete(name); }
  async refresh(): Promise<void> { await this.rebuildCommands(); }
  getNonModelCommands(): readonly ProductCommand[] { return NON_MODEL_COMMANDS; }
  getAllNonModelCommands(): ProductCommand[] { return [...NON_MODEL_COMMANDS, ...CONDITIONAL_COMMANDS.map((entry) => entry.command)]; }
  async getEnabledNonModelCommands(): Promise<ProductCommand[]> {
    const commands = [...NON_MODEL_COMMANDS];
    const enabled = await Promise.all(CONDITIONAL_COMMANDS.map(async ({ command, isEnabled }) => ({ command, enabled: this.options.conditionalEnabled ? await this.options.conditionalEnabled(command.name) : await isEnabled(this.options.features) })));
    for (const entry of enabled) if (entry.enabled) commands.push(entry.command);
    return commands;
  }
  async getAll(): Promise<ProductCommand[]> { await this.ready; const commands = new Map((await this.getEnabledNonModelCommands()).map((command) => [command.name, command])); for (const [name, command] of this.commands) commands.set(name, command); return [...commands.values()]; }
  async getCustomCommands(): Promise<ProductCommand[]> { await this.ready; return [...this.commands.values()].filter((command) => command.tags?.includes("custom")); }
  async getMcpCommands(): Promise<ProductCommand[]> { await this.ready; return [...this.commands.values()].filter((command) => command.tags?.includes("mcp-prompt")); }
  isOverriddenByCustom(name: string): boolean { if (this.commands.get(name)?.tags?.includes("custom")) return true; const unqualified = name.startsWith("/") ? name.substring(1) : name; return Boolean((this.options.currentConfiguration?.() ?? this.currentConfiguration)?.skills?.some((skill) => skill.name === unqualified)); }
  isLocalCommand(name: string): boolean { return this.commandExecutorMap.has(name); }
  /** Explicit standalone composition of native executor DI. */
  registerExecutor(executor: CommandExecutor): void { this.commandExecutorMap.set(executor.name, executor); }
  parseCommand(input: string): { name: string; args: string[] } | undefined {
    const text = input.trim(), btw = text.match(/^\/btw\s+(.*)/i);
    if (btw) { const value = btw[1]!.trim(); return { name: "/btw", args: value ? [value] : [] }; }
    const args = text.split(/\s+/), name = args.shift()?.trim();
    if (name && this.commandExecutorMap.has(name)) return { name, args };
  }
  async executeLocalCommand(input?: CommandExecution): Promise<void> {
    input ??= this.executingCommand;
    if (!input) return;
    this.executingCommand = input;
    const executor = this.commandExecutorMap.get(input.name);
    if (!executor) throw new Error(`Command executor not found: ${input.name}`);
    await this.sessions.addHistory(input.session, [CommandMessageUtils.buildCaveat()]);
    if (executor.autoGenerateHistory) {
      void this.sessions.addHistory(input.session, [CommandMessageUtils.buildInput(input, executor)]);
    }
    const message = executor.message?.trim(); if (message) input.session.progressSubject.next(message);
    try { await executor.execute(input); } finally { if (message) input.session.progressSubject.next(undefined); }
  }
  async finalizeCommandExecution(session: HarnessSession, output?: string): Promise<void> { void this.sessions.addHistory(session, [CommandMessageUtils.buildOutput(output || "")]); }
}
