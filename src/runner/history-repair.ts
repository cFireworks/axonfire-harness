import type { AgentInputItem } from "@openai/agents-core";
import { jsonrepair } from "jsonrepair";

export const TRUNCATION_RETRY_MARKER =
  "Do NOT repeat the same oversized tool call. Break it into smaller operations.";
export const TRUNCATION_RETRY_EXHAUSTED = "[TRUNCATION_RETRY_EXHAUSTED]";

const TOOL_RETRY_GUIDANCE: Record<string, string> = {
  Write:
    "The Write tool call was too large. Instead of writing the entire file at once, use multiple Edit calls to make changes incrementally. First Read the file if you haven't already, then apply individual Edit operations for each change.",
  MultiEdit:
    "The MultiEdit tool call was too large. Split the edits into multiple separate Edit calls, each modifying one section at a time. Do NOT try to put all edits into a single MultiEdit call.",
  Edit: "The Edit tool call was too large. Use a smaller old_string that uniquely identifies the target location with minimal surrounding context, and keep new_string focused on only the changed content.",
  Bash: "The Bash command was too long. Break it into multiple shorter commands executed sequentially.",
};

const GENERIC_RETRY_GUIDANCE =
  "The tool call was too large and got truncated. Break the operation into multiple smaller tool calls.";

export type ModelInputData = {
  input: AgentInputItem[];
  instructions?: string;
};

type LooseItem = Record<string, any>;

export function buildTruncationRetryMessage(
  toolNames: Iterable<string>,
): string {
  const lines = [
    "Your previous response was truncated due to output length limits.",
    "",
  ];
  const guidance = new Set<string>();
  for (const name of toolNames) {
    const value = TOOL_RETRY_GUIDANCE[name];
    if (value && !guidance.has(value)) {
      lines.push(value, "");
      guidance.add(value);
    }
  }
  if (guidance.size === 0) lines.push(GENERIC_RETRY_GUIDANCE, "");
  lines.push(TRUNCATION_RETRY_MARKER);
  return lines.join("\n");
}

export function filterTruncatedToolCalls(
  modelData: ModelInputData,
  lastFinishReason?: string,
): ModelInputData {
  if (!Array.isArray(modelData.input)) return modelData;
  const afterLengthFinish = lastFinishReason === "length";
  const input = modelData.input as LooseItem[];
  const completedCallIds = new Set<string>();

  for (const item of input) {
    if (
      item.type !== "function_call_result" &&
      item.type !== "function_call_output"
    ) {
      continue;
    }
    const callId = item.callId ?? item.call_id;
    if (
      callId &&
      !item.providerData?.skipRun &&
      !item.providerData?.isPartialAborted
    ) {
      completedCallIds.add(callId);
    }
  }

  const invalidCallIds = new Set<string>();
  const invalidToolNames = new Set<string>();
  for (const item of input) {
    if (item.type !== "function_call") continue;
    const callId = item.callId ?? item.call_id;
    let args = typeof item.arguments === "string" ? item.arguments : "";
    let error: string | undefined;

    if (item.arguments === "") {
      if (
        !afterLengthFinish &&
        callId &&
        completedCallIds.has(callId) &&
        item.status !== "incomplete" &&
        !item.providerData?.isPartialAborted
      ) {
        item.arguments = "{}";
        args = "{}";
      } else {
        error = "arguments is empty";
      }
    } else if (args) {
      try {
        JSON.parse(args);
      } catch (parseError) {
        try {
          const repaired = jsonrepair(args);
          item.arguments = repaired;
          args = repaired;
        } catch (repairError) {
          const greaterThanFixed = args.replace(
            /">\s*([[{"\d\-ntf])/g,
            '": $1',
          );
          if (greaterThanFixed !== args) {
            try {
              const repaired = jsonrepair(greaterThanFixed);
              item.arguments = repaired;
              args = repaired;
            } catch {
              error = (parseError as Error).message || "invalid JSON";
            }
          } else {
            error = (repairError as Error).message || "invalid JSON";
          }
        }
      }
    } else {
      error = "arguments is empty";
    }

    if (error && callId) {
      invalidCallIds.add(callId);
      invalidToolNames.add(item.name ?? "unknown");
    }
  }

  if (invalidCallIds.size === 0) return modelData;
  const filtered = input.filter((item) => {
    const callId = item.callId ?? item.call_id;
    return !(
      callId &&
      invalidCallIds.has(callId) &&
      (item.type === "function_call" || item.type === "function_call_result")
    );
  });
  if (!afterLengthFinish)
    return { ...modelData, input: filtered as AgentInputItem[] };

  const alreadyRetried = input.some(
    (item) =>
      item.type === "message" &&
      item.role === "user" &&
      Array.isArray(item.content) &&
      item.content.some(
        (part: any) =>
          typeof part.text === "string" &&
          (part.text.includes(TRUNCATION_RETRY_MARKER) ||
            part.text.includes(TRUNCATION_RETRY_EXHAUSTED)),
      ),
  );
  const text = alreadyRetried
    ? "Your tool call failed again after a previous retry. Stop attempting this tool call. Instead, tell the user what you were trying to do and ask for guidance. " +
      TRUNCATION_RETRY_EXHAUSTED
    : buildTruncationRetryMessage(invalidToolNames);
  filtered.push({
    type: "message",
    role: "user",
    content: [{ type: "input_text", text }],
  });
  return { ...modelData, input: filtered as AgentInputItem[] };
}
