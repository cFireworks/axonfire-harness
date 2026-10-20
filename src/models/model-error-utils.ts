import { ModelBehaviorError } from "@openai/agents-core";
import { StreamTimeoutError } from "./model-transport.js";
export const INTERRUPTED_BY_USER_MESSAGE = "Interrupted by user";
export class InterruptedByUserError extends Error { constructor() { super(INTERRUPTED_BY_USER_MESSAGE); this.name = "InterruptedByUserError"; } }
/** Retry predicates from ErrorUtils module; deliberately not broad HTTP retries. */
export const ModelErrorUtils = {
  isNetworkError(error: any): boolean { return error && error.code === "ECONNRESET" || error.code === "ECONNABORTED" || error.code === "ETIMEDOUT"; },
  isStreamTimeoutError(error: any): boolean { if (error instanceof StreamTimeoutError) return true; if (!error) return false; const text = error?.message || ""; return typeof text === "string" && text.includes("Stream timeout: no data received"); },
  isFirstTokenTimeoutError(error: any): boolean { return error instanceof StreamTimeoutError && error.isFirstTokenTimeout; },
  isRetryableModelError(error: any): boolean { return error instanceof ModelBehaviorError || error instanceof SyntaxError || error != null && typeof error === "object" && "error" in error && (error.error instanceof SyntaxError || error.error instanceof ModelBehaviorError); },
  formatErrorMessage(error: any, presentation: { upgradeLink?: string; secondary?: (text: string) => string } = {}): string {
    const { status, message, code } = error;
    if (status === 429 && code === 14001) return `No available credits left. New ones tomorrow at [time, e.g., 12:00 AM CST]. ${presentation.upgradeLink ?? ""}`;
    if (message === "Request was aborted.") return INTERRUPTED_BY_USER_MESSAGE;
    if (message === "Request aborted.") return `Interrupted. ${(presentation.secondary ?? ((text) => text))("Try /clear to free up context in new conversation.")}`;
    if (message && message.includes("Stream timeout: no data received")) return "Response timed out (no data received). Retrying automatically...";
    if (["canceled", "cancelled", "Request cancelled"].includes(message)) return "Request was cancelled. This can happen after system sleep or network interruption. Please try again.";
    return message || "Unknown error";
  },
};
