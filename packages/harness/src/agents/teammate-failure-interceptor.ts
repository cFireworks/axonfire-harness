import type { AgentInputItem } from "@openai/agents-core";
import type { AgentRunContext, AgentRunInterceptor } from "./agent-service.js";
import { addSystemReminder } from "./system-reminder-agent-run-interceptor.js";
import { formatTeammateFailuresBlock, TEAMMATE_FAILURE_MARKER, type TeammateFailure } from "./teammate-failure.js";
export class TeammateFailureInterceptor implements AgentRunInterceptor {
  readonly priority = 1160;
  constructor(readonly manager: { isInTeam?(): boolean }, readonly registry: { getAll(): Array<{ info?: { name?: string }; lastFailure?: TeammateFailure | undefined }> }) {}
  async intercept(context: AgentRunContext): Promise<void> {
    if (!Array.isArray(context.input) || context.skipRun || context.session.meta?.teamContext || !this.manager.isInTeam?.() || this.hasExistingFailureMarker(context.input)) return;
    let members; try { members = this.registry.getAll().map((member) => ({ name: member.info?.name ?? "<unknown>", lastFailure: member.lastFailure })); } catch { return; }
    const text = formatTeammateFailuresBlock(members); if (text) addSystemReminder(context.input, `<system-reminder data-role="teammate-failures">\n${text}\n</system-reminder>`, "last");
  }
  hasExistingFailureMarker(input: AgentInputItem[]): boolean { return input.some((raw: any) => raw.type === "message" && raw.role === "user" && (typeof raw.content === "string" ? raw.content.includes(TEAMMATE_FAILURE_MARKER) : Array.isArray(raw.content) && raw.content.some((part: any) => part?.type === "input_text" && typeof part.text === "string" && part.text.includes(TEAMMATE_FAILURE_MARKER)))); }
}
