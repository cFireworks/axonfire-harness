export enum CompactType {
  USER_COMMAND = "user-command",
  PRE_MESSAGE_AUTO = "pre-message-auto",
  EMERGENCY_AUTO = "emergency-auto",
}

export const DEFAULT_TOKEN_THRESHOLD = 0.7;
export const DEFAULT_MAX_CONSECUTIVE_COMPACT = 5;
export const SUMMARY_MAX_TOKENS = 24_000;
export const COMPACT_FALLBACK_ROUNDS = 5;
export const SESSION_META_COMPACT_TYPE = "compactType";
export const SESSION_META_COMPACT_EXPECTS_CONTINUE = "compactExpectsContinue";
export const SESSION_META_COMPACT_CONTINUE_IN_PROGRESS = "compactContinueInProgress";
export const SESSION_META_COMPACT_CANCELLED = "compactCancelled";
export const TOOL_OUTPUT_TRUNCATED_PLACEHOLDER = "[Tool call output was truncated; re-invoke if you need the full output.]";

function percentage(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const number = Number.parseInt(value, 10);
  return !Number.isNaN(number) && number >= 1 && number <= 100 ? number / 100 : undefined;
}

export function getAutocompactThresholdOverride(): number | undefined {
  return percentage(process.env.CODEBUDDY_AUTOCOMPACT_PCT_OVERRIDE);
}
export function getPreMessageCompactThresholdOverride(): number | undefined {
  return percentage(process.env.CODEBUDDY_PRE_MESSAGE_COMPACT_PCT);
}
export function getEngineeringCompactSufficiencyRatio(): number {
  return percentage(process.env.CODEBUDDY_ENGINEERING_COMPACT_SUFFICIENCY_PCT) ?? 0.15;
}
export function getAutoCompactWindow(): number {
  const parsed = Number.parseInt(process.env.CODEBUDDY_AUTO_COMPACT_WINDOW ?? "", 10);
  return Math.min(1_000_000, Math.max(100_000, Number.isFinite(parsed) && parsed > 0 ? parsed : 200_000));
}
export function resolveCompactTriggerAt(maxInputTokens: number | undefined, threshold: number): number {
  return maxInputTokens ? maxInputTokens * threshold : getAutoCompactWindow();
}
export function resolvePreMessageCompactEnabled(features?: Record<string, unknown>): boolean {
  const environment = process.env.CODEBUDDY_PRE_MESSAGE_COMPACT;
  if (environment !== undefined && environment !== "") return environment === "true" || environment === "1";
  if (!features) return false;
  return typeof features.enablePreMessageCompact === "boolean" ? features.enablePreMessageCompact : features.ContextSummaryAgent === true;
}
export function withCompactGeneration(id: string | undefined, session?: { compactMessageGeneration?: number }): string | undefined {
  const generation = session?.compactMessageGeneration ?? 0;
  return !id || generation <= 0 ? id : `${id}-c${generation}`;
}
