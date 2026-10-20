import type { AgentInputItem } from "@openai/agents";
import type { AgentRunContext, AgentRunInterceptor } from "./agent-service.js";

export function isSystemInjectedContent(text: string): boolean {
  return ["<system-reminder", "<command-message>", "<command-name>", "<local-command-stdout>", "<channel ", "<cb_summary>", "<conversation_history_summary>", "<task-notification>"].some((tag) => text.includes(tag));
}
export class UserQueryWrapperAgentRunInterceptor implements AgentRunInterceptor {
  readonly priority = 1025;
  async intercept(context: AgentRunContext): Promise<void> {
    if (!Array.isArray(context.input) || context.skipRun) return;
    for (const item of context.input as any[]) if (item.type === "message" && item.role === "user") this.wrapUserMessageContent(item);
  }
  wrapUserMessageContent(item: AgentInputItem): void {
    const value = item as any;
    if (typeof value.content === "string") value.content = [{ type: "input_text", text: value.content }];
    if (!Array.isArray(value.content)) return;
    const positions: number[] = [], texts: string[] = [];
    value.content.forEach((part: any, index: number) => {
      if (part.type !== "input_text" || typeof part.text !== "string") return;
      const text = part.text;
      if (!text.trim() || isSystemInjectedContent(text) || (text.startsWith("<user_query>") && text.endsWith("</user_query>"))) return;
      positions.push(index); texts.push(text);
    });
    if (!positions.length) return;
    value.content[positions[0]!].text = `<user_query>${texts.join(" ")}</user_query>`;
    for (let index = positions.length - 1; index >= 1; index--) value.content.splice(positions[index], 1);
  }
}
