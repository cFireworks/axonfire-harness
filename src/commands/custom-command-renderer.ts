import type { ProductCommand } from "./types.js";

export interface InlineShellProcess { wait(): Promise<{ stdout?: string; stderr?: string }>; dispose(): void; }
export interface InlineShellService { execute(input: { command: string }): Promise<InlineShellProcess>; }
export interface CommandReferenceService { process(content: string): Promise<string>; }
/** Source 7649414..7650992. Replacement-string semantics (including $&) are intentional. */
export class CustomCommandRenderer {
  constructor(private readonly shell: InlineShellService, private readonly references: CommandReferenceService,
    private readonly logger: { error(message: string, error?: unknown): void } = { error() {} }) {}
  async render(command: ProductCommand, input: string): Promise<string | undefined> {
    if (!command.prompt) return command.prompt;
    const args = this.extractArguments(input, command.name);
    let content = this.replaceParameters(command.prompt, args);
    content = await this.executeInlineBash(content);
    return this.references.process(content);
  }
  async processContent(content: string, args?: string): Promise<string> {
    if (!content) return content;
    let output = args ? content.replace(/\$ARGUMENTS\b/g, args) : content;
    output = await this.executeInlineBash(output);
    return this.references.process(output);
  }
  async executeInlineBash(content: string): Promise<string> {
    if (!content) return content;
    const expression = /!`([^`]+)`/g;
    let output = content, match: RegExpExecArray | null;
    while ((match = expression.exec(content)) !== null) {
      let child: InlineShellProcess | undefined;
      const command = match[1]!.trim();
      try {
        child = await this.shell.execute({ command });
        const { stdout, stderr } = await child.wait();
        output = output.replace(match[0], (stdout || stderr || "").trim());
      } catch (error) { this.logger.error(`Failed to execute inline bash command: ${command}`, error); output = output.replace(match[0], ""); }
      finally { child?.dispose(); }
    }
    return output;
  }
  replaceParameters(content: string, args: string[]): string {
    if (!content || !args?.length) return content;
    const positions = content.match(/\$(\d+)\b/g);
    const max = positions ? Math.max(...positions.map((position) => parseInt(position.substring(1)))) : 0;
    let output = content;
    for (let index = 0; index < Math.min(args.length, max); index++) output = output.replace(new RegExp(`\\$${index + 1}\\b`, "g"), args[index]!);
    output = output.replace(/\$ARGUMENTS\b/g, args.join(" "));
    if (args.length > max) output += "\n\n\nARGUMENTS: " + args.slice(max).join(" ");
    return output;
  }
  extractArguments(input: string, commandName: string): string[] {
    if (!input || !commandName) return [];
    let text = input.trim();
    if (text.startsWith(commandName)) text = text.substring(commandName.length).trim();
    if (!text) return [];
    const args: string[] = [];
    let current = "", quoted = false, quote = "";
    for (const character of text) {
      if (!quoted && (character === '"' || character === "'")) { quoted = true; quote = character; }
      else if (quoted && character === quote) { quoted = false; quote = ""; }
      else if (!quoted && /\s/.test(character)) { if (current) { args.push(current); current = ""; } }
      else current += character;
    }
    if (current) args.push(current);
    return args;
  }
}
