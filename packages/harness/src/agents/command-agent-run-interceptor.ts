import type { AgentRunContext, AgentRunInterceptor } from "./agent-service.js";
import type { AgentManager } from "./agent-manager.js";
import type {
  ProductCommand,
  CommandConfiguration,
} from "../commands/types.js";
import type { CustomCommandRenderer } from "../commands/custom-command-renderer.js";
/** Native 7088984..7093909. A saved-workflow command with prompt:"" does
 * not match isCommand; the otherwise-visible Workflow branch stays dormant. */
export class CommandAgentRunInterceptor implements AgentRunInterceptor {
  readonly priority = 1600;
  constructor(
    readonly agentManager: Pick<
      AgentManager,
      "getCommands" | "get" | "resolveConfiguredModelOrFallback"
    >,
    readonly configuration: () => Promise<CommandConfiguration>,
    readonly customCommandRenderer: Pick<
      CustomCommandRenderer,
      "render" | "processContent"
    >,
    readonly promptRenderer: {
      render(
        content: any,
        variables?: Record<string, unknown>,
      ): string | Promise<string>;
    },
    readonly mcpPromptRenderer: {
      render(
        command: ProductCommand,
        input: string,
      ): Promise<string | undefined>;
    },
    readonly logger: { error(message: string): void } = { error() {} },
  ) {}
  async intercept(context: AgentRunContext): Promise<void> {
    if (!Array.isArray(context.input)) return;
    const commands = await this.agentManager.getCommands(context.agent.name),
      name = this.extractInputCommandName(context.input);
    if (
      name &&
      !new Set(
        commands
          .filter((command) => command.tags?.includes("custom"))
          .map((command) => command.name),
      ).has(`/${name}`) &&
      (await this.handleSkillSlashCommand(context))
    )
      return;
    const command = await this.handleCommands(context.input, commands);
    if (command) {
      context.agent = (await this.resolveAgent(command)) ?? context.agent;
      context.session.command = command;
      if (command.allowedTools?.length) {
        context.session.requestOptions.allowedTools ||= [];
        context.session.requestOptions.allowedTools.push(
          ...command.allowedTools,
        );
      }
      if (command.model) {
        const model = await this.agentManager.resolveConfiguredModelOrFallback(
          command.model as string,
          `command:${command.name}`,
        );
        if (model) context.session.requestOptions.model = model;
      }
      if (context.agent.name === "compact") context.skipRun = false;
      return;
    }
    await this.handleSkillSlashCommand(context);
  }
  extractInputCommandName(input: any[]): string | undefined {
    for (const item of input)
      if (item.type === "message" && item.role === "user") {
        const text =
          typeof item.content === "string"
            ? item.content
            : item.content?.find((part: any) => part.type === "input_text")
                ?.text;
        if (text) {
          const name = this.extractCommandText(text).split(/\s+/)[0]!;
          if (name.startsWith("/")) return name.substring(1);
        }
      }
  }
  async resolveAgent(
    command: ProductCommand,
  ): Promise<Awaited<ReturnType<AgentManager["get"]>> | undefined> {
    for (const tag of command.tags ?? [])
      if (tag.endsWith("-agent")) {
        const agent = await this.agentManager.get(tag.replace("-agent", ""));
        if (agent) return agent;
      }
  }
  async handleCommands(
    input: any[],
    commands: ProductCommand[],
  ): Promise<ProductCommand | undefined> {
    if (!input.length || !commands.length) return;
    for (const command of commands)
      for (const item of input)
        if (item.type === "message" && item.role === "user") {
          if (typeof item.content === "string")
            item.content = [{ type: "input_text", text: item.content }];
          for (const part of item.content)
            if (
              part.type === "input_text" &&
              this.isCommand(part.text, command)
            ) {
              const text = this.extractCommandText(part.text);
              if (text !== part.text.trim()) part.text = text;
              part.providerData ||= {};
              part.providerData.content = part.text;
              let prompt = command.prompt;
              if (command.tags?.includes("dynamic-workflow")) {
                const name = command.name.startsWith("/")
                    ? command.name.substring(1)
                    : command.name,
                  args = part.text.substring(command.name.length).trim(),
                  tags = this.buildCommandContextTags(command.name, part.text),
                  suffix = args ? `, "args": ${JSON.stringify(args)}` : "";
                part.text = [
                  tags,
                  `Run the saved Dynamic Workflow "${name}" by calling the Workflow tool with input \`{ "name": "${name}"${suffix} }\`. Do not run any other tool first; do not paraphrase or restate the user's request — just invoke Workflow.`,
                ].join("\n");
                return command;
              }
              if (command.tags?.includes("mcp-prompt")) {
                const tags = this.buildCommandContextTags(
                    command.name,
                    part.text,
                  ),
                  rendered = await this.mcpPromptRenderer.render(
                    command,
                    part.text,
                  );
                part.text = rendered ? `${tags}\n${rendered}` : part.text;
              } else if (command.tags?.includes("custom")) {
                const tags = this.buildCommandContextTags(
                    command.name,
                    part.text,
                  ),
                  template = await this.safeRender(command.prompt);
                prompt = await this.customCommandRenderer.render(
                  { ...command, prompt: template },
                  part.text,
                );
                const rendered = await this.safeRender(prompt);
                part.text = `${tags}\n${rendered || part.text}`;
              } else {
                const args = part.text.substring(command.name.length).trim(),
                  rendered = await this.safeRender(prompt, { prompt: args });
                part.text = rendered
                  ? part.text.replace(command.name, rendered)
                  : part.text;
              }
              return command;
            }
        }
  }
  async safeRender(
    content: any,
    variables?: Record<string, unknown>,
  ): Promise<any> {
    try {
      return await this.promptRenderer.render(content, variables);
    } catch {
      this.logger.error(`Failed to render prompt: ${content}`);
      return content;
    }
  }
  isCommand(text: string, command: ProductCommand): boolean {
    const input = this.extractCommandText(text);
    return (
      !!command.prompt &&
      (input === command.name || input.startsWith(command.name + " "))
    );
  }
  buildCommandContextTags(name: string, input: string): string {
    const display = name.startsWith("/") ? name.substring(1) : name,
      args = input.substring(name.length).trim();
    return `<command-message>${display}</command-message> <command-name>${name}</command-name>${args ? ` <command-args>${args}</command-args>` : ""}`;
  }
  extractCommandText(text: string): string {
    const input = text.trim(),
      wrapped = input.match(/^<channel[^>]*>\s*([\s\S]*?)\s*<\/channel>$/);
    return wrapped ? wrapped[1]!.trim() : input;
  }
  async handleSkillSlashCommand(context: AgentRunContext): Promise<boolean> {
    const skills = (await this.configuration()).skills || [];
    if (!skills.length) return false;
    for (const item of context.input as any[])
      if (item.type === "message" && item.role === "user") {
        if (typeof item.content === "string")
          item.content = [{ type: "input_text", text: item.content }];
        for (const part of item.content)
          if (part.type === "input_text") {
            const text = this.extractCommandText(part.text),
              token = text.split(/\s+/)[0]!,
              name = token.startsWith("/") ? token.substring(1) : token,
              matches = skills.filter((skill) => skill.name === name),
              priority = (source: string | undefined) =>
                source === "project" ? 2 : +(source === "user"),
              skill =
                matches.length > 1
                  ? matches.reduce((a, b) =>
                      priority(b.source) > priority(a.source) ? b : a,
                    )
                  : matches[0];
            if (skill) {
              if (text !== part.text.trim()) part.text = text;
              part.providerData ||= {};
              part.providerData.content = part.text;
              const args = text.substring(token.length).trim(),
                tags = args ? ` <command-args>${args}</command-args>` : "";
              let instructions =
                await this.customCommandRenderer.processContent(
                  skill.instructions,
                  args || undefined,
                );
              const id = context.session?.id;
              if (id)
                instructions = instructions
                  .replace(/\$\{CODEBUDDY_SESSION_ID\}/g, id)
                  .replace(/\$\{CLAUDE_SESSION_ID\}/g, id);
              part.text = [
                `<command-message>${name}</command-message> <command-name>/${name}</command-name>${tags}`,
                `Base directory for this skill: ${skill.baseDirectory}`,
                instructions,
              ].join("\n");
              if (skill.model) {
                const model =
                  await this.agentManager.resolveConfiguredModelOrFallback(
                    skill.model,
                    `skill:${skill.name}`,
                  );
                if (model) context.session.requestOptions.model = model;
              }
              return true;
            }
          }
      }
    return false;
  }
}
