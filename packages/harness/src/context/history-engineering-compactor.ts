import type { AgentInputItem } from "@openai/agents-core";
import { getCompactionBoundaryHistory, type HistoryItem } from "../sessions/history-utils.js";

export type EngineeringCompactResult = {
  compactContent: string;
  estimatedTokens: number;
  originalItemCount: number;
};

const OMIT_TYPES = new Set([
  "function_call_result", "reasoning", "custom-title", "topic", "ai-title", "summary", "file-history-snapshot",
]);

export class HistoryEngineeringCompactor {
  static compact(history: AgentInputItem[]): EngineeringCompactResult {
    if (!history?.length) return { compactContent: "", estimatedTokens: 0, originalItemCount: 0 };
    const boundary = getCompactionBoundaryHistory(history as HistoryItem[]);
    const content = this.generateCompressedContent(boundary);
    if (!content.trim()) return { compactContent: "", estimatedTokens: 0, originalItemCount: boundary.length };
    const compactContent = `<cb_summary>\n${this.generateSummaryHeader()}${content}\n</cb_summary>`;
    return { compactContent, estimatedTokens: this.estimateTokens(compactContent), originalItemCount: boundary.length };
  }

  static generateSummaryHeader(): string {
    return 'Summary of the conversation so far:\nThe conversation is between an AI agent and a user.\nUse this to get up to speed, and continue helping the user as the AI agent.\nSome contents may be omitted, indicated by "<omitted />".\n\n';
  }

  static stripSummaryHeader(content: string): string {
    const match = content.match(/<(conversation_history_summary|previous_\w+|analysis|summary)[>\s]/);
    return match?.index !== undefined && match.index > 0 ? content.substring(match.index).trim() : content.trim();
  }

  static generateCompressedContent(history: HistoryItem[]): string {
    let content = "";
    for (const item of history) {
      if (OMIT_TYPES.has(item.type)) continue;
      if (item.type === "function_call") content += this.compressFunctionCallItem(item);
      else if (item.role === "user") content += this.compressUserMessage(item);
      else if (item.role === "assistant") content += this.compressAssistantMessage(item);
    }
    return content;
  }

  static compressUserMessage(item: HistoryItem): string {
    const text = this.extractTextFromUserMessage(item);
    if (item.providerData?.isCompactInternal || item.providerData?.isSummary) {
      if (!text) return "";
      const summary = text.match(/<cb_summary>([\s\S]*?)<\/cb_summary>/)?.[1];
      return (summary ? this.stripSummaryHeader(summary.trim()) : text) + "\n\n";
    }
    if (item.providerData?.isCompacted) {
      const summary = text.match(/<cb_summary>([\s\S]*?)<\/cb_summary>/)?.[1];
      return summary ? this.stripSummaryHeader(summary.trim()) + "\n\n" : "";
    }
    if (!text) return "";
    const query = text.match(/<user_query>\n?([\s\S]*?)\n?<\/user_query>/);
    return `<previous_user_message>\n<user_query>\n${query ? query[1]!.trim() : text}\n</user_query>\n</previous_user_message>\n\n`;
  }

  static compressAssistantMessage(item: HistoryItem): string {
    const text: string[] = [];
    if (typeof item.content === "string") {
      if (item.content.trim()) text.push(item.content);
    } else if (Array.isArray(item.content)) {
      for (const part of item.content) {
        if (["output_text", "text"].includes(part.type) && part.text?.trim()) text.push(part.text);
      }
    }
    let content = text.length ? `<previous_assistant_message>\n${text.join("\n")}\n</previous_assistant_message>\n\n` : "";
    if (Array.isArray(item.tool_calls)) {
      for (const call of item.tool_calls) content += this.compressFunctionCallItem(call.function || call);
    }
    return content;
  }

  static compressFunctionCallItem(item: HistoryItem): string {
    let args = "";
    if (item.arguments) {
      try {
        args = this.processToolArguments(typeof item.arguments === "string" ? JSON.parse(item.arguments) : item.arguments);
      } catch { args = String(item.arguments); }
    }
    return `<previous_tool_call>\nTool: ${item.name || "unknown"}\n${args ? `Arguments: ${args}\n` : ""}<result><omitted /></result>\n</previous_tool_call>\n\n`;
  }

  static extractTextFromUserMessage(item: HistoryItem): string {
    if (!item.content) return "";
    if (typeof item.content === "string") return item.content;
    if (!Array.isArray(item.content)) return "";
    const text: string[] = [];
    for (const part of item.content) {
      if (["input_text", "text"].includes(part.type) && part.text) text.push(part.text);
      else if (part.type === "input_image" && typeof part.image === "string") {
        text.push(part.image.startsWith("data:")
          ? `[image: <${part.image.match(/^data:(image\/[^;]+);/)?.[1] ?? "image/unknown"} base64 image>]`
          : `[image: ${part.image}]`);
      }
    }
    return text.join("\n");
  }

  static processToolArguments(value: any): string {
    if (!value || typeof value !== "object") return JSON.stringify(value || {});
    const args = { ...value };
    for (const key of ["content", "widget_code", "new_string"]) if (key in args) args[key] = "<omitted>";
    return JSON.stringify(args);
  }

  static estimateTokens(content: string): number { return content ? Math.ceil(content.length / 4) : 0; }

  compact(history: AgentInputItem[]): string { return HistoryEngineeringCompactor.compact(history).compactContent; }
  estimateTokens(content: string): number { return HistoryEngineeringCompactor.estimateTokens(content); }
}
