// Captured module 38195; fixed-sample event/priority protocol.
export const HookEvent = {
  PRE_TOOL_USE: "PreToolUse",
  POST_TOOL_USE: "PostToolUse",
  NOTIFICATION: "Notification",
  USER_PROMPT_SUBMIT: "UserPromptSubmit",
  STOP: "Stop",
  SUBAGENT_STOP: "SubagentStop",
  PRE_COMPACT: "PreCompact",
  SESSION_START: "SessionStart",
  SESSION_END: "SessionEnd",
  WORKTREE_CREATE: "WorktreeCreate",
  WORKTREE_REMOVE: "WorktreeRemove",
  POST_TOOL_USE_FAILURE: "PostToolUseFailure",
  SUBAGENT_START: "SubagentStart",
  STOP_FAILURE: "StopFailure",
  POST_COMPACT: "PostCompact",
  CONFIG_CHANGE: "ConfigChange",
  INSTRUCTIONS_LOADED: "InstructionsLoaded",
  PERMISSION_REQUEST: "PermissionRequest",
  PERMISSION_DENIED: "PermissionDenied",
  ELICITATION: "Elicitation",
  ELICITATION_RESULT: "ElicitationResult",
  TASK_CREATED: "TaskCreated",
  TASK_COMPLETED: "TaskCompleted",
  TEAMMATE_IDLE: "TeammateIdle",
  SETUP: "Setup",
  FILE_CHANGED: "FileChanged",
  CWD_CHANGED: "CwdChanged",
  FINAL_STOP: "FinalStop",
} as const;
export const NotificationType = {
  PERMISSION_PROMPT: "permission_prompt",
  IDLE_PROMPT: "idle_prompt",
  AUTH_SUCCESS: "auth_success",
  ELICITATION_DIALOG: "elicitation_dialog",
} as const;
export enum HookPriority {
  Highest = 0,
  High = 100,
  StructuredOutput = 200,
  Normal = 500,
  Low = 800,
  Lowest = 1000,
}
export class HookBlockedError extends Error {
  declare hookEvent: string;
  declare reason: string;
  constructor(eA: any, el: any) {
    (super(`${eA} hook error: 
${el}`),
      (this.hookEvent = eA),
      (this.reason = el),
      (this.name = "HookBlockedError"));
  }
}
