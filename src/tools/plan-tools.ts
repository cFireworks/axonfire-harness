import { z } from "zod";
import type { AgentInputItem, RunContext } from "@openai/agents";
import type { HarnessSession } from "../sessions/session.js";
import type { SessionManager } from "../sessions/session-manager.js";
import type { PlanStorageService } from "../plans/plan-storage-service.js";
import { PermissionMode } from "../permissions/permission.js";
import type { ProductPromptRenderer } from "../prompts/prompt-renderer.js";
import type { TeamMailbox } from "../teams/team-mailbox.js";
import { createToolCallResultItem, type RawFunctionCall } from "./tool-rejection.js";
import type { ToolManager } from "./tool-manager.js";

export const enterPlanModeParameters = z.object({});
export const exitPlanModeParameters = z.object({ allowedPrompts: z.array(z.object({
  tool: z.enum(["Bash"]).describe("The tool this prompt applies to"),
  prompt: z.string().describe('Semantic description of the action, e.g. "run tests", "install dependencies"'),
})).optional().describe("Prompt-based permissions needed to implement the plan. These describe categories of actions rather than specific commands.") });
export type PlanToolsRuntime = {
  mailbox?: Pick<TeamMailbox, "send">;
  reportPlanAction?: (session: HarnessSession, event: { action: "build" | "update"; status: "prepare" | "ready" }) => void;
};
const missing = () => ({ content: "Error: No context provided", error: "Missing context", renderer: { type: "text" } });

export class PlanTools {
  constructor(readonly storage: PlanStorageService, private readonly prompts: ProductPromptRenderer,
    private readonly sessions: SessionManager, private readonly runtime: PlanToolsRuntime = {}) {}
  async enter(_input: unknown, context?: RunContext<HarnessSession>): Promise<any> {
    if (!context) return missing();
    const session = context.context;
    if (session.meta.parentSessionId) return {
      content: 'EnterPlanMode tool cannot be used in agent contexts. Plan mode is owned by the main agent; sub-agents should be spawned with mode="plan" by their parent if plan-mode behavior is required.',
      error: "EnterPlanMode is not available to sub-agents", renderer: { type: "text" },
    };
    if (session.permissionModeSubject.value === PermissionMode.Plan) return { content: "Already in plan mode. Continue exploring or call ExitPlanMode when ready.", renderer: { type: "text" } };
    session.meta.prePlanPermissionMode = session.permissionModeSubject.value;
    session.permissionModeSubject.next(PermissionMode.Plan);
    const path = this.storage.initializePlanFilePath(session);
    try { this.runtime.reportPlanAction?.(session, { action: "build", status: "prepare" }); } catch {}
    const systemReminder = this.prompts.has("system-reminder-planmode") ? await this.prompts.renderAsync("system-reminder-planmode", { planFilePath: path }) : "";
    const content = this.prompts.has("tool-enterplanmode-result") ? await this.prompts.renderAsync("tool-enterplanmode-result", { systemReminder }) : "";
    return { content, rawResponse: { planFilePath: path }, renderer: { type: "enterplan" } };
  }
  async exit(_input: z.infer<typeof exitPlanModeParameters>, context?: RunContext<HarnessSession>): Promise<any> {
    if (!context) return missing();
    const session = context.context, mode = session.permissionModeSubject.value;
    const saved = session.meta.prePlanPermissionMode as PermissionMode | undefined;
    const team = session.meta.teamContext as { memberName?: string; teamName?: string; color?: string } | undefined;
    if (team?.memberName) return this.handleTeammateExitPlanMode(session, team);
    if (session.meta.parentSessionId) return { content: "ExitPlanMode is not available to sub-agents. Plan mode is owned by the main agent; the parent decides when to exit plan mode.", error: "ExitPlanMode is not available to sub-agents", renderer: { type: "text" } };
    if (mode === PermissionMode.Plan) session.permissionModeSubject.next(saved ?? PermissionMode.Default);
    if (saved !== undefined) delete session.meta.prePlanPermissionMode;
    const plan = await this.storage.read(session), path = this.storage.getPlanFilePath(session);
    try { this.runtime.reportPlanAction?.(session, { action: "update", status: "ready" }); } catch {}
    if (!plan) return { content: "Exited plan mode. Warning: Plan file was not found or empty - the plan content could not be read, but plan mode has been exited successfully.", rawResponse: { planFilePath: path, plan: "" }, renderer: { type: "plan" } };
    if (!path) return { content: "Exited plan mode. Warning: No plan file path found in session, but plan mode has been exited successfully.", rawResponse: { planFilePath: "", plan }, renderer: { type: "plan" } };
    const content = this.prompts.has("tool-exit-planmode-resolve") ? await this.prompts.renderAsync("tool-exit-planmode-resolve", { planFilePath: path, plan }) : "";
    return { content: content || "User has approved your plan. You can now start coding. Start with updating your todo list if applicable", rawResponse: { planFilePath: path, plan }, renderer: { type: "plan" } };
  }
  async handleTeammateExitPlanMode(session: HarnessSession, team: { memberName?: string; teamName?: string; color?: string }): Promise<any> {
    if (!this.runtime.mailbox) return { content: "Plan approval cannot be requested: team mailbox is not available. Continue planning until the lead intervenes.", error: "TeamMailbox unavailable", renderer: { type: "text" } };
    const plan = await this.storage.read(session), path = this.storage.getPlanFilePath(session);
    const requestId = `plan-approval-${session.id}-${Date.now().toString(36)}`;
    const message = { from: team.memberName!, text: JSON.stringify({ type: "plan_approval_request", request_id: requestId, from: team.memberName,
      planFilePath: path ?? "", plan: plan ?? "", timestamp: new Date().toISOString() }),
      summary: `Plan approval requested by ${team.memberName}`, timestamp: new Date().toISOString(), ...(team.color === undefined ? {} : { color: team.color }) };
    try { await this.runtime.mailbox.send(team.teamName!, "team-lead", message); }
    catch (error) { return { content: `Failed to send plan approval request to team-lead: ${String(error)}`, error: "mailbox send failed", renderer: { type: "text" } }; }
    return { content: `Plan approval request sent to team-lead (request_id: ${requestId}). Wait for the lead's plan_approval_response before taking further action; you remain in plan mode until then.`, rawResponse: { requestId, planFilePath: path, plan }, renderer: { type: "text" } };
  }
  async resolveEnterRejectedResult(raw: RawFunctionCall): Promise<AgentInputItem[]> {
    if (!this.prompts.has("tool-enterplanmode-rejected")) return [];
    const content = await this.prompts.renderAsync("tool-enterplanmode-rejected");
    return content ? [createToolCallResultItem(content, raw, { status: "incomplete", error: "User declined to enter plan mode", skipRun: true })] : [];
  }
  async resolveExitRejectedResult(raw: RawFunctionCall): Promise<AgentInputItem[]> {
    let exited = false;
    try { exited = this.sessions.getCurrent()?.permissionModeSubject.value !== PermissionMode.Plan; } catch {}
    const selected = exited && this.prompts.has("tool-exit-planmode-exited") ? "tool-exit-planmode-exited" : "tool-exit-planmode-rejected";
    if (!this.prompts.has(selected)) return [];
    const content = await this.prompts.renderAsync(selected);
    return content ? [createToolCallResultItem(content, raw, { status: "incomplete", error: exited ? "User exited plan mode" : "User rejected CodeBuddy's plan", skipRun: true })] : [];
  }
  register(manager: ToolManager): void {
    manager.register("EnterPlanMode", { parameters: enterPlanModeParameters, needsApproval: false, execute: (input, context) => this.enter(input, context), resolveRejectedResult: (raw) => this.resolveEnterRejectedResult(raw as RawFunctionCall) });
    manager.register("ExitPlanMode", { parameters: exitPlanModeParameters, needsApproval: true, execute: (input, context) => this.exit(exitPlanModeParameters.parse(input), context), resolveRejectedResult: (raw) => this.resolveExitRejectedResult(raw as RawFunctionCall) });
  }
}
