import type { AgentInputItem } from "@openai/agents-core";
import { randomUUID } from "node:crypto";
import type { AgentRunContext, AgentRunInterceptor } from "./agent-service.js";
import type { SessionManager } from "../sessions/session-manager.js";
import { fillFunctionCallResultHistory, getActiveAgentOnlyHistory, getCompactionBoundaryHistory, isSessionSeparatorItem, type HistoryItem } from "../sessions/history-utils.js";

export class HistoryAgentRunInterceptor implements AgentRunInterceptor {
  readonly priority = 1_400;
  constructor(private readonly sessions: SessionManager) {}

  async intercept(context: AgentRunContext): Promise<void> {
    if (!Array.isArray(context.input) || context.skipAddHistory) return;
    const { session } = context;
    for (const item of context.input as HistoryItem[]) {
      item.providerData ??= {};
      item.providerData.agent ||= context.agent.name;
    }
    if (!session.meta.__token_calculation_request__) await this.sessions.addHistory(session, context.input);
    let history = getActiveAgentOnlyHistory(session.history, {
      lastMessageId: session.lastMessageId, hasCompactedHistory: session.hasCompactedHistory,
    }) as HistoryItem[];
    const separator = history.findLastIndex(isSessionSeparatorItem);
    if (separator >= 0) history = history.slice(separator + 1);
    const compact = history.findLastIndex((item) => item.type === "message" && item.role === "assistant" &&
      item.providerData?.agent === "compact" && /<(?:summary|conversation_history_summary)>[\s\S]+?<\/(?:summary|conversation_history_summary)>/i.test(assistantText(item)));
    if (compact >= 0) history = history.slice(compact);
    history = getCompactionBoundaryHistory(history);
    history = history.filter((item) =>
      (context.agent.name === "general-purpose" || item.providerData?.agent !== "general-purpose") &&
      !item.providerData?.truncated &&
      !(item.type === "message" && item.role === "assistant" && item.providerData?.skipRun === true && item.providerData?.error));
    context.input = fillFunctionCallResultHistory(history as AgentInputItem[]);
    if (context.agent.name !== "compact") {
      context.input = replaceCompactWithSummary(context.input, this.sessions.getSessionFilePath(session));
    }
  }
}

export function replaceCompactWithSummary(input: AgentInputItem[], transcriptPath?: string): AgentInputItem[] {
  const history = input as HistoryItem[];
  if (!history.some((item) => item.providerData?.agent === "compact")) return input;
  let summary: string | undefined;
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const item = history[index]!;
    if (item.type !== "message" || item.role !== "assistant" || item.providerData?.agent !== "compact") continue;
    const text = assistantText(item);
    summary = text.match(/<summary>([\s\S]+?)<\/summary>/i)?.[1]?.trim() ??
      text.match(/<conversation_history_summary>([\s\S]+?)<\/conversation_history_summary>/i)?.[1]?.trim();
    if (summary) break;
  }
  const remaining = history.filter((item) => item.providerData?.agent !== "compact") as AgentInputItem[];
  if (!summary) return remaining;
  const context = [
    "This session is being continued from a previous conversation that ran out of context. The summary below covers the earlier portion of the conversation.\n\nSummary:",
    summary, "",
    `If you need specific details from before compaction (like exact code snippets, error messages, or content you generated), read the full transcript at: ${transcriptPath}`,
  ].join("\n");
  return [{
    id: randomUUID(), type: "message", role: "user",
    content: [{ type: "input_text", text: `<system-reminder data-role="compact-summary">\n${context}\n\nPlease address this message and continue with your tasks.\n</system-reminder>` }],
    providerData: { skipRun: true, isCompactInternal: true, agent: "cli" },
  } as AgentInputItem, ...remaining];
}

function assistantText(item: HistoryItem): string {
  return typeof item.content === "string" ? item.content : Array.isArray(item.content)
    ? item.content.filter((block: any) => ["output_text", "text"].includes(block?.type)).map((block: any) => block.text ?? "").join("\n") : "";
}
