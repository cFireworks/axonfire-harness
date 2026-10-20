import { randomUUID } from "node:crypto";
import type { AgentInputItem } from "@openai/agents-core";
import type { ProductPromptRenderer } from "../prompts/prompt-renderer.js";
import { PermissionMode } from "../permissions/permission.js";
import type { HarnessSession } from "../sessions/session.js";

export const TOOL_REJECT_RESULT_CONTENT =
  "The user doesn't want to proceed with this tool use. The tool use was rejected (eg. if it was a file edit, the new_string was NOT written to the file). STOP what you are doing and wait for the user to tell you how to proceed. ";
export const TOOL_REJECT_RESULT_DISPLAY =
  "No (tell CodeBuddy what to do differently)";
export const USER_DECLINED_TO_ANSWER_QUESTIONS =
  "User declined to answer questions";

export type RawFunctionCall = {
  type: string;
  name?: string;
  callId?: string;
  id?: string;
  arguments?: string;
  [key: string]: unknown;
};

export type RejectionResultOptions = {
  status?: "completed" | "incomplete";
  skipRun?: boolean;
  error?: unknown;
};

/** Exact shape emitted by WorkBuddy's InputItemUtils helper. */
export function createToolCallResultItem(
  content: string,
  call: RawFunctionCall,
  options: RejectionResultOptions = {},
): AgentInputItem {
  const status =
    options.status ?? (options.error != null ? "incomplete" : detectStatusFromOutput(content));
  return {
    id: randomUUID(),
    name: call.name,
    callId: call.callId,
    status,
    type: "function_call_result",
    providerData: {
      skipRun: options.skipRun ?? false,
      error: options.error,
    },
    output: { type: "text", text: content },
  } as unknown as AgentInputItem;
}

export function detectStatusFromOutput(content: string): "completed" | "incomplete" {
  if (!content) return "completed";
  const text = content.trimStart(); if (!text.startsWith("{") && !text.startsWith("[")) return "completed";
  try { const parsed = JSON.parse(text); if (!parsed || typeof parsed !== "object") return "completed"; if (parsed.isError === true) return "incomplete"; const error = parsed.error; if (typeof error === "string" && error.trim().length > 0 || error && typeof error === "object" && typeof error.message === "string" && error.message.trim().length > 0) return "incomplete"; } catch {}
  return "completed";
}

export function createDefaultRejectedResult(
  call: RawFunctionCall,
  options: { skipRun: boolean; backgroundReason?: string },
): AgentInputItem {
  const name = call.name ?? "unknown";
  const error =
    options.backgroundReason ??
    (name === "AskUserQuestion"
      ? USER_DECLINED_TO_ANSWER_QUESTIONS
      : TOOL_REJECT_RESULT_DISPLAY);
  return createToolCallResultItem(TOOL_REJECT_RESULT_CONTENT, call, {
    status: "incomplete",
    skipRun: options.skipRun,
    error,
  });
}

export function enterPlanModeRejectedResult(
  call: RawFunctionCall,
  prompts: ProductPromptRenderer,
): AgentInputItem[] {
  const content = prompts.has("tool-enterplanmode-rejected")
    ? prompts.render("tool-enterplanmode-rejected")
    : "";
  return content
    ? [
        createToolCallResultItem(content, call, {
          status: "incomplete",
          error: "User declined to enter plan mode",
          skipRun: true,
        }),
      ]
    : [];
}

export function exitPlanModeRejectedResult(
  call: RawFunctionCall,
  prompts: ProductPromptRenderer,
  session: HarnessSession | undefined,
): AgentInputItem[] {
  const exited = session?.permissionModeSubject.value !== PermissionMode.Plan;
  const name = exited
    ? "tool-exit-planmode-exited"
    : "tool-exit-planmode-rejected";
  const content = prompts.has(name)
    ? prompts.render(name)
    : prompts.has("tool-exit-planmode-rejected")
      ? prompts.render("tool-exit-planmode-rejected")
      : "";
  return content
    ? [
        createToolCallResultItem(content, call, {
          status: "incomplete",
          error: exited
            ? "User exited plan mode"
            : "User rejected CodeBuddy's plan",
          skipRun: true,
        }),
      ]
    : [];
}
