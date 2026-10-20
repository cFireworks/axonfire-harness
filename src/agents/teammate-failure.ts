export const AGENT_TASK_INTERRUPTED_MESSAGE = "Task was interrupted by user";
export const MAX_TEAMMATE_ERROR_LENGTH = 500;
export type TeammateFailure = { error: string; occurredAt: number; category: "auth" | "network" | "model" | "unknown" };
export function isAgentTaskUserInterruption(error: unknown): boolean { return error instanceof Error ? error.message === AGENT_TASK_INTERRUPTED_MESSAGE : typeof error === "string" && error === AGENT_TASK_INTERRUPTED_MESSAGE; }
export function extractErrorString(error: unknown): string { if (error == null) return ""; if (error instanceof Error) return error.message; if (typeof error === "string") return error; try { return String(error); } catch { return ""; } }
export function categorizeFailure(error: unknown): TeammateFailure["category"] {
  const text = extractErrorString(error).toLowerCase(); if (!text) return "unknown";
  if (/\b(401|403)\b/.test(text) || ["authentication failed", "unauthorized", "invalid api key", "invalid_api_key", "incorrect api key"].some((value) => text.includes(value))) return "auth";
  if (["econnreset", "etimedout", "enotfound", "econnrefused", "timed out", "network error", "bad gateway", "service unavailable"].some((value) => text.includes(value)) || /\btimeout\b/.test(text) || /\b(502|503|504)\b/.test(text)) return "network";
  if (["model not found", "model_not_found", "unknown model", "unsupported model", "model does not exist"].some((value) => text.includes(value))) return "model";
  return "unknown";
}
export function sanitizeErrorForPrompt(error: unknown): string {
  let text = extractErrorString(error); if (!text) return "";
  text = text.replace(/(https?:\/\/[^\s"'<>]+?)\?[^\s"'<>]*/gi, "$1")
    .replace(/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/gi, "$1 <redacted>")
    .replace(/\b(api[_-]?key|apikey|access[_-]?key|secret[_-]?key|x-api-key|authorization|token)\s*[:=]\s*["']?[A-Za-z0-9._~+/=-]{8,}["']?/gi, "$1=<redacted>")
    .replace(/\b(sk|tc|pk|xoxp|xoxb|ghp|ghs|glpat)[-_][A-Za-z0-9_-]{16,}/gi, "<redacted>").replace(/\s+/g, " ").trim();
  if (text.length > MAX_TEAMMATE_ERROR_LENGTH) text = text.slice(0, MAX_TEAMMATE_ERROR_LENGTH - 1) + "…"; return text;
}
export const TEAMMATE_FAILURE_TTL_MS = 600000;
export const TEAMMATE_FAILURE_MARKER = "Teammate Failure Report";
export function formatTeammateFailuresBlock(members: Array<{ name?: string | undefined; lastFailure?: TeammateFailure | undefined }>, now = Date.now()): string | undefined {
  const failures = members.filter((member) => member.lastFailure && typeof member.lastFailure.occurredAt === "number" && now - member.lastFailure.occurredAt <= TEAMMATE_FAILURE_TTL_MS).map((member) => ({ name: member.name ?? "<unknown>", failure: member.lastFailure! }));
  if (!failures.length) return undefined;
  return [`# ${TEAMMATE_FAILURE_MARKER}`, "", "The following teammates FAILED during their most recent run in this session.", "You MUST surface these failures to the user clearly and MUST NOT fabricate", "content on their behalf. When responding:", "  - Acknowledge which teammates failed and the category of failure.", "  - Do NOT synthesize an analysis/report as if the failed teammates had", "    successfully completed their work.", "  - If the failure looks recoverable (e.g. transient network), suggest", "    the user retry; otherwise ask the user how they want to proceed.", "", "Failed teammates:", ...failures.map(({ name, failure }) => `  - ${name} (${failure.category ?? "unknown"}): ${failure.error}`)].join("\n");
}
