// @ts-nocheck
// Complete original tool-result capture and query methods.
export const SESSION_TOOL_RESULTS_SHA256 =
  "528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19";
export const SESSION_TOOL_RESULTS_MEMBERS = [
  ["getSessionToolResults", 4604671, 4604819],
  ["getLatestToolResultByName", 4604907, 4605235],
  ["captureToolResultFromUpdate", 4605637, 4607669],
] as const;
export const SESSION_TOOL_RESULTS_FUNCTIONS = [
  ["isTerminalToolCallStatus", 4796285, 4796436],
  ["readSessionSourceMode", 4571012, 4571389],
  ["readCodebuddyMeta", 4570610, 4570738],
  ["readIsBackgroundAutomation", 4571390, 4571517],
] as const;
export function attachNativeSessionToolResults(
  controller: any,
  deps: any = {},
): any {
  function isTerminalToolCallStatus(status) {
    return (
      status === "completed" ||
      status === "failed" ||
      status === "cancelled" ||
      status === "canceled"
    );
  }
  function readSessionSourceMode(meta) {
    const codebuddyMeta = readCodebuddyMeta(meta);
    const sourceMode = codebuddyMeta?.sourceMode;
    if (typeof sourceMode === "string" && sourceMode.trim().length > 0)
      return sourceMode.trim();
    const welcomeMode = codebuddyMeta?.welcomeMode;
    if (typeof welcomeMode === "string" && welcomeMode.trim().length > 0)
      return welcomeMode.trim();
  }
  function readCodebuddyMeta(meta) {
    const raw = meta?.["codebuddy.ai"];
    return raw && typeof raw === "object" ? raw : void 0;
  }
  function readIsBackgroundAutomation(meta) {
    return readCodebuddyMeta(meta)?.isBackgroundAutomation === true
      ? true
      : void 0;
  }
  class NativeSessionToolResults {
    getSessionToolResults(sessionId) {
      const session = this.sessions.get(sessionId);
      if (!session) return;
      return new Map(session.toolResults);
    }
    getLatestToolResultByName(sessionId, toolName) {
      const session = this.sessions.get(sessionId);
      if (!session) return;
      let latest;
      for (const entry of session.toolResults.values()) {
        if (entry.toolName !== toolName) continue;
        if (!latest || entry.updatedAt > latest.updatedAt) latest = entry;
      }
      return latest;
    }
    captureToolResultFromUpdate(session, notification) {
      const update = notification.update;
      if (!update) return;
      const sessionUpdate = update.sessionUpdate;
      if (sessionUpdate !== "tool_call" && sessionUpdate !== "tool_call_update")
        return;
      const toolCallId =
        typeof update.toolCallId === "string" ? update.toolCallId : void 0;
      if (!toolCallId) return;
      const prev = session.toolResults.get(toolCallId);
      const now = Date.now();
      const meta = update._meta;
      const metaToolName =
        typeof meta?.["codebuddy.ai/toolName"] === "string"
          ? meta["codebuddy.ai/toolName"]
          : void 0;
      const directToolName =
        typeof update.toolName === "string" ? update.toolName : void 0;
      const titleName =
        typeof update.title === "string" ? update.title : void 0;
      const toolName =
        metaToolName ?? directToolName ?? titleName ?? prev?.toolName;
      const status =
        typeof update.status === "string" ? update.status : prev?.status;
      const rawInput =
        update.rawInput !== void 0 ? update.rawInput : prev?.rawInput;
      const entry = {
        toolCallId,
        toolName,
        status,
        rawInput,
        rawOutput:
          update.rawOutput !== void 0 ? update.rawOutput : prev?.rawOutput,
        meta: meta
          ? {
              ...(prev?.meta ?? {}),
              ...meta,
            }
          : prev?.meta,
        updatedAt: now,
      };
      session.toolResults.set(toolCallId, entry);
      if (
        toolName === "suggest_plugin_install" &&
        isTerminalToolCallStatus(status) &&
        !this.pluginRecommendationRunSwitches.has(session.sessionId)
      )
        this.pluginRecommendationRegistry?.cancelRequest(
          session.sessionId,
          toolCallId,
          "the recommendation tool finished",
        );
      if (this.toolUsageObserver)
        try {
          this.toolUsageObserver.observe({
            sessionId: session.sessionId,
            toolCallId,
            toolName,
            status,
            rawInput,
            sourceMode: readSessionSourceMode(session._meta),
            isBackgroundAutomation: readIsBackgroundAutomation(session._meta),
            occurredAt: now,
          });
        } catch (err) {
          this.logger?.warn?.("toolUsageObserver.observe threw", {
            sessionId: session.sessionId,
            toolCallId,
            error: String(err),
          });
        }
    }
  }
  for (const name of [
    "getSessionToolResults",
    "getLatestToolResultByName",
    "captureToolResultFromUpdate",
  ])
    Object.defineProperty(
      controller,
      name,
      Object.getOwnPropertyDescriptor(NativeSessionToolResults.prototype, name),
    );
  controller.pluginRecommendationRunSwitches ??= new Map();
  for (const name of [
    "pluginRecommendationRegistry",
    "toolUsageObserver",
    "logger",
  ])
    if (deps[name] !== undefined) controller[name] = deps[name];
  return controller;
}
