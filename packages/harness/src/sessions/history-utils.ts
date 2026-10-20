import type { AgentInputItem } from "@openai/agents-core";
import { createToolCallResultItem } from "../tools/tool-rejection.js";
import {TokenUtils} from "../context/token-utils.js";

/** Runtime history contains product-specific metadata in addition to SDK items. */
export type HistoryItem = Record<string, any>;

export function isSessionSeparatorItem(item: HistoryItem): boolean {
  if (item.type !== "message" || item.role !== "system") return false;
  return item.providerData?.isSessionSeparator === true ||
    String(item.id ?? "").startsWith("session-separator-") ||
    String(item.id ?? "").startsWith("clear-");
}

export function getCompactionBoundaryHistory<T extends HistoryItem>(items: T[]): T[] {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    const item = items[index]!;
    if (item.providerData?.isCompacted === true || item.providerData?.isSummary === true)
      return items.slice(index);
    if (isSessionSeparatorItem(item)) return items.slice(index + 1);
  }
  return items;
}

export function getActiveAgentOnlyHistory(items: AgentInputItem[], options: {
  lastMessageId?: string | undefined; hasCompactedHistory?: boolean | undefined;
} = {}): AgentInputItem[] {
  if (!items.length) return [];
  const history = items as HistoryItem[];
  let current = options.lastMessageId ?? history.findLast((item) => item.id && !isCustomHistoryItem(item))?.id;
  if (!current) return [];
  const active: HistoryItem[] = [];
  for (let index = history.length - 1; index >= 0; index -= 1) {
    if (history[index]!.id !== current) continue;
    active.unshift(history[index]!);
    while (index - 1 >= 0 && history[index - 1]!.id === current) {
      index -= 1; active.unshift(history[index]!);
    }
    const item = history[index]!;
    const compact = item.providerData?.agent === "compact";
    current = item.parentId ?? (options.hasCompactedHistory || index === history.length - 1 || compact ? item.logicalParentId : undefined);
  }
  return active.filter((item) => !isCustomHistoryItem(item)) as AgentInputItem[];
}

export function isCustomHistoryItem(item: HistoryItem): boolean {
  return CUSTOM_INPUT_ITEM_TYPES.has(item.type);
}

// Recovered custom input types are never sent to the summary agent.
export const CUSTOM_INPUT_ITEM_TYPES = new Set([
  "custom-title", "topic", "ai-title", "summary", "file-history-snapshot",
  "goal-result", "goal-progress", "resend-fork-notice",
]);

export function userMessageText(item: HistoryItem): string {
  if (typeof item.content === "string") return item.content;
  if (!Array.isArray(item.content)) return "";
  return item.content
    .filter((block: any) => block && ["input_text", "text"].includes(block.type))
    .map((block: any) => block.text ?? "").join("\n");
}

export function isRealUserMessageItem(item: HistoryItem): boolean {
  if (item.type !== "message" || item.role !== "user") return false;
  if (item.providerData?.skipRun || item.providerData?.isCompactInternal === true) return false;
  const text = userMessageText(item);
  if (text === "/compact" || text === "/_compact") return false;
  if (typeof item.providerData?.teammateMessage?.from === "string") return false;
  return !text.includes("<teammate-message");
}

export function hasMeaningfulNewHistorySinceLastCompact(items: HistoryItem[]): boolean {
  if (!Array.isArray(items) || items.length === 0) return false;
  const boundary = items.findLastIndex((item) => item.providerData?.agent === "compact" &&
    item.type === "message" && item.role === "assistant");
  if (boundary < 0) return true;
  return items.slice(boundary + 1).some(isMeaningfulPostCompactItem);
}

export function isMeaningfulPostCompactItem(item: HistoryItem): boolean {
  if (item.providerData?.agent === "compact" || item.providerData?.isCompactInternal ||
    item.type === "file-history-snapshot" || isCustomHistoryItem(item)) return false;
  if (item.type === "function_call" || item.type === "function_call_result") return true;
  if (item.type === "reasoning") return Array.isArray(item.content) && item.content.length > 0;
  if (item.type === "message") {
    if (item.role === "assistant") return typeof item.content === "string"
      ? item.content.length > 0
      : Array.isArray(item.content) && item.content.some((part: any) => typeof part?.text === "string" && part.text.length > 0);
    if (item.role === "user" && item.providerData?.skipRun) return false;
  }
  return true;
}

export function fillFunctionCallResultHistory(items: AgentInputItem[]): AgentInputItem[] {
  const results = new Map<string, HistoryItem>();
  for (const item of items as HistoryItem[]) {
    if (item.type === "function_call_result") results.set(item.callId, item);
  }
  const callsSeen = new Set<string>();
  const resultsSeen = new Set<string>();
  const output: HistoryItem[] = [];
  for (const item of items as HistoryItem[]) {
    if (item.type === "message" && item.providerData?.discard) continue;
    if (item.type === "function_call" && callsSeen.has(item.callId)) continue;
    if (item.type === "function_call_result" &&
      (!callsSeen.has(item.callId) || resultsSeen.has(item.callId))) continue;
    output.push(item);
    if (item.type === "function_call") {
      const result = results.get(item.callId) ?? createToolCallResultItem("", item as any, {
        status: "incomplete", skipRun: true,
      });
      output.push(result);
      callsSeen.add(item.callId);
      resultsSeen.add((result as HistoryItem).callId);
    }
  }
  return output as AgentInputItem[];
}

export function sanitizeContentBlockTypes<T extends HistoryItem>(items: T[]): T[] {
  return items.map((item) => {
    if (item.type !== "message" || !Array.isArray(item.content)) return item;
    let changed = false;
    const content = item.content.map((block: any) => {
      if (block?.type !== "text" || !["user", "assistant"].includes(item.role)) return block;
      changed = true;
      return { ...block, type: item.role === "assistant" ? "output_text" : "input_text" };
    });
    return changed ? { ...item, content } : item;
  });
}

export function estimateTrailingToolResultTokens(items: HistoryItem[]): number {
  return TokenUtils.estimateTrailingToolResultTokens(items);
}
