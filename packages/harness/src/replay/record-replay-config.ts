export const OriginalModelProvider = Symbol("OriginalModelProvider");
export const ENV_RECORD_DIR = "CODEBUDDY_RECORD_DIR";
export const ENV_REPLAY_DIR = "CODEBUDDY_REPLAY_DIR";
export const ENV_REPLAY_SPEED = "CODEBUDDY_REPLAY_SPEED";
export const ENV_REPLAY_STRICT = "CODEBUDDY_REPLAY_STRICT";
export const REPLAY_ENV_KEYS = [
  "CODEBUDDY_MEMORY_RELEVANCE_DISABLED",
  "CODEBUDDY_MEMORY_EXTRACTION_DISABLED",
  "CODEBUDDY_DISABLE_AUTO_MEMORY",
  "CODEBUDDY_CODE_DISABLE_TERMINAL_TITLE",
  "CODEBUDDY_CODE_DISABLE_SESSION_SUMMARY",
];
export type RecordReplayMode = "record" | "replay" | "passthrough";
/** Native module 26314. Optional env replaces process.env only for embedding. */
export function getRecordReplayMode(
  env: NodeJS.ProcessEnv = process.env,
): RecordReplayMode {
  const record = env[ENV_RECORD_DIR],
    replay = env[ENV_REPLAY_DIR];
  if (record && replay)
    throw new Error(
      `${ENV_RECORD_DIR} and ${ENV_REPLAY_DIR} are mutually exclusive. Set only one at a time.`,
    );
  return record ? "record" : replay ? "replay" : "passthrough";
}
