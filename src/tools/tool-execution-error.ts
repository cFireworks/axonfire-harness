export class ToolExecutionError extends Error {
  constructor(message: string, readonly toolErrorCode: string) { super(message); this.name = "ToolExecutionError"; }
}
export function isToolExecutionError(value: unknown): value is ToolExecutionError {
  return value instanceof Error && (value.name === "ToolExecutionError" || typeof (value as ToolExecutionError).toolErrorCode === "string");
}
export const AGENT_TOOL_ERROR_CODES = { execution: "19920", sessionRequired: "19921", invalidParams: "19922", maxTurns: "19923" } as const;
