import type { AgentInputItem } from "@openai/agents-core";
import { isRealUserMessageItem, type HistoryItem } from "../sessions/history-utils.js";
import { TOOL_OUTPUT_TRUNCATED_PLACEHOLDER } from "./compact-config.js";

export function takeRecentRounds(items: AgentInputItem[], rounds: number): AgentInputItem[] {
  if (rounds <= 0) return [];
  let count = 0;
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (isRealUserMessageItem(items[index] as HistoryItem) && ++count >= rounds) return items.slice(index);
  }
  return items.slice();
}

export function removeLastToolResultFromHistory(items: AgentInputItem[]): AgentInputItem[] | undefined {
  const copy = items.slice() as HistoryItem[];
  let index = copy.length - 1;
  let count = 0;
  while (index >= 0 && !["function_call_result", "function_call_output"].includes(copy[index]!.type)) index -= 1;
  while (index >= 0) {
    const item = copy[index]!;
    if (["function_call_result", "function_call_output"].includes(item.type)) {
      copy[index] = { ...item, output: TOOL_OUTPUT_TRUNCATED_PLACEHOLDER };
      count += 1;
    } else if (item.type !== "function_call") break;
    index -= 1;
  }
  return count > 0 ? copy as AgentInputItem[] : undefined;
}

export function sanitizeItemsForSummaryAgent(items: AgentInputItem[]): AgentInputItem[] {
  return (items as HistoryItem[]).map((item) => {
    if (item.type === "message" && Array.isArray(item.content)) {
      const { content, changed } = sanitizeContentArray(item.content);
      if (changed) return { ...item, content };
    }
    if (["function_call_result", "function_call_output"].includes(item.type)) {
      const parts = item.providerData?.toolResult?.content;
      if (Array.isArray(parts)) {
        const { content, changed } = sanitizeContentArray(parts);
        if (changed) return { ...item, providerData: { ...item.providerData, toolResult: { ...item.providerData.toolResult, content } } };
      }
      if (typeof item.output === "string" && item.output.includes("image_blob_ref")) {
        const output = item.output.replace(/\{[^{}]*"type"\s*:\s*"image_blob_ref"[^{}]*\}/g, (value: string) => {
          try { const ref = JSON.parse(value); return `[Image: ${ref.original_filename || ref.source || "image"}]`; }
          catch { return "[Image]"; }
        });
        if (output !== item.output) return { ...item, output };
      }
    }
    return item;
  }) as AgentInputItem[];
}

function sanitizeContentArray(parts: any[]): { content: any[]; changed: boolean } {
  let changed = false;
  const content = parts.map((part) => {
    if (!part || typeof part !== "object") return part;
    const ref = part.type === "image_blob_ref" ? part : part.type === "input_image" && part.image?.type === "image_blob_ref" ? part.image : undefined;
    if (ref) { changed = true; return { type: "input_text", text: `[Image: ${ref.original_filename || ref.source || "image"}]` }; }
    if (part.type === "input_image" && typeof part.image === "string") {
      changed = true;
      return { type: "input_text", text: "[Image]" };
    }
    return part;
  });
  return { content, changed };
}
