import type { AgentInputItem } from "@openai/agents";
import type { AgentRunContext, AgentRunInterceptor } from "./agent-service.js";
import type { ProductPromptRenderer } from "../prompts/prompt-renderer.js";
import type { PlanStorageService } from "../plans/plan-storage-service.js";
import { PermissionMode } from "../permissions/permission.js";

export const MCP_UI_MODEL_CONTEXT = Symbol("mcpUiModelContext");
export type SystemReminderRuntime = {
  getAlwaysMemory?: (scope: "user" | "project" | "project_local") => Promise<unknown>;
  getIdeSelection?: () => { filePath?: string; text?: string; selection?: { start: { line: number }; end: { line: number } } } | undefined;
  channelServers?: () => Iterable<{ instructions?: string }>;
};
export function addSystemReminder(input: AgentInputItem[], text: string, position: "first" | "last" = "last"): void {
  const user = (position === "first" ? input.find((item: any) => item.type === "message" && item.role === "user")
    : input.findLast((item: any) => item.type === "message" && item.role === "user")) as any;
  if (!user) return;
  if (typeof user.content === "string") user.content = [{ type: "input_text", text: user.content }];
  if (Array.isArray(user.content)) user.content.unshift({ type: "input_text", text });
}
/** Complete reminder control flow from class 7148490..7155494; host sources are injected. */
export class SystemReminderAgentRunInterceptor implements AgentRunInterceptor {
  readonly priority = 1200;
  constructor(private readonly prompts: ProductPromptRenderer, private readonly plans: PlanStorageService, private readonly runtime: SystemReminderRuntime = {}) {}
  async intercept(context: AgentRunContext): Promise<void> {
    if (!Array.isArray(context.input) || context.skipRun || this.isMetaMessage(context) || context.agent.name === "compact") return;
    if (this.shouldInjectSystemReminder(context)) { const text = await this.generateSystemReminder(); if (text) addSystemReminder(context.input, text, "first"); }
    if (this.isUserMessage(context)) { const text = await this.generatePlanModeReminder(context); if (text) addSystemReminder(context.input, text); }
    if (this.isUserMessage(context)) { const text = await this.generateDelegateModeReminder(context); if (text) addSystemReminder(context.input, text); }
    if (this.isUserMessage(context)) { const text = await this.generateIDESelectionReminder(); if (text) addSystemReminder(context.input, text); }
    await this.injectHookContexts(context);
    if (this.isUserMessage(context)) { const text = this.generateChannelInstructions(); if (text) addSystemReminder(context.input, text); }
    if (this.isUserMessage(context)) {
      const session = context.session as any, value = session[MCP_UI_MODEL_CONTEXT];
      if (value) {
        const texts: string[] = [];
        if (value.content) for (const item of value.content) if (item && typeof item === "object" && item.type === "text") texts.push(item.text);
        if (value.structuredContent) texts.push(JSON.stringify(value.structuredContent, null, 2));
        if (texts.length) addSystemReminder(context.input, `<system-reminder data-role="mcp-ui-model-context">\n${texts.join("\n\n")}\n</system-reminder>`);
        delete session[MCP_UI_MODEL_CONTEXT];
      }
    }
  }
  isFirstOrResumeMessage(context: AgentRunContext): boolean {
    return Array.isArray(context.input) && (context.input.filter((item: any) => item.role === "user").length === 1 || Boolean(context.session.options.continue && !context.session.options.continued));
  }
  shouldInjectSystemReminder(context: AgentRunContext): boolean {
    if (["1", "true"].includes(process.env.CODEBUDDY_DISABLE_SYSTEM_REMINDER_MD ?? "")) return false;
    return this.isFirstOrResumeMessage(context) || !this.historyContainsSystemReminder(context.input as AgentInputItem[]);
  }
  historyContainsSystemReminder(input: AgentInputItem[]): boolean {
    return (input as any[]).some((item) => item.type === "message" && item.role === "user" && (typeof item.content === "string" ? this.hasRulesSystemReminder(item.content)
      : Array.isArray(item.content) && item.content.some((part: any) => part.type === "input_text" && typeof part.text === "string" && this.hasRulesSystemReminder(part.text))));
  }
  hasRulesSystemReminder(text: string): boolean {
    const match = text.match(/<system-reminder[^>]*>[\s\S]*?<\/system-reminder>/);
    if (!match) return false;
    return match[0].split(">")[0]!.includes("data-role=") ? this.hasRulesSystemReminder(text.substring(match.index! + match[0].length)) : true;
  }
  isUserMessage(context: AgentRunContext): boolean { return Array.isArray(context.input) && (context.input.at(-1) as any)?.role === "user"; }
  isMetaMessage(context: AgentRunContext): boolean {
    if (!Array.isArray(context.input) || !context.input.length) return false;
    const last = context.input.at(-1) as any; return last?.type === "message" && last.role === "user" && last.providerData?.isMeta === true;
  }
  async generateSystemReminder(): Promise<string | undefined> {
    try {
      const userMemory = await this.runtime.getAlwaysMemory?.("user") ?? [], projectMemory = await this.runtime.getAlwaysMemory?.("project") ?? [], localMemory = await this.runtime.getAlwaysMemory?.("project_local") ?? [];
      if (this.prompts.has("system-reminder-md")) return this.prompts.renderAsync("system-reminder-md", { userMemory, projectMemory, localMemory });
    } catch {}
    return undefined;
  }
  async generatePlanModeReminder(context: AgentRunContext): Promise<string | undefined> {
    try { if (context.session.permissionModeSubject.value === PermissionMode.Plan && this.prompts.has("system-reminder-planmode")) return await this.prompts.renderAsync("system-reminder-planmode", { planFilePath: this.plans.initializePlanFilePath(context.session) }); } catch {}
    return undefined;
  }
  async generateDelegateModeReminder(context: AgentRunContext): Promise<string | undefined> {
    try { if (context.session.permissionModeSubject.value === PermissionMode.Delegate && this.prompts.has("system-reminder-delegate")) return await this.prompts.renderAsync("system-reminder-delegate"); } catch {}
    return undefined;
  }
  async generateIDESelectionReminder(): Promise<string | undefined> {
    try {
      const selection = this.runtime.getIdeSelection?.();
      if (!selection?.filePath) return undefined;
      if (!selection.text) return `<system-reminder data-role="ide-context">The user opened the file ${selection.filePath} in the IDE. This may or may not be related to the current task.</system-reminder>`;
      const start = selection.selection?.start.line ?? 0, count = selection.selection ? selection.selection.end.line - selection.selection.start.line + 1 : 1;
      const text = selection.text.length > 2000 ? selection.text.substring(0, 2000) + "\n... (truncated)" : selection.text;
      return `<system-reminder data-role="ide-context">The user selected the lines ${start} to ${start + count - 1} from ${selection.filePath}:\n${text}\n\nThis may or may not be related to the current task.</system-reminder>`;
    } catch { return undefined; }
  }
  generateChannelInstructions(): string | undefined {
    if (!this.runtime.channelServers) return undefined;
    const text = [...this.runtime.channelServers()].map((server) => server.instructions).filter(Boolean).join("\n\n");
    return text ? `<system-reminder data-role="channel-instructions">\n${text}\n</system-reminder>` : undefined;
  }
  async injectHookContexts(context: AgentRunContext): Promise<void> {
    if (!Array.isArray(context.input) || !context.session.hookContexts) return;
    const hooks = context.session.hookContexts, first = this.isFirstOrResumeMessage(context);
    if (first && hooks.sessionStartReadyPromise) { try { await hooks.sessionStartReadyPromise; } catch {} }
    if (first && hooks.sessionStartContext) { addSystemReminder(context.input, `<system-reminder data-role="hook">${hooks.sessionStartContext}</system-reminder>`, "first"); delete hooks.sessionStartContext; }
    for (const key of ["userPromptSubmitContext", "stopHookFeedback", "subagentStopHookFeedback", "preCompactInstructions"]) {
      if (hooks[key] && this.isUserMessage(context)) { addSystemReminder(context.input, `<system-reminder data-role="hook">${hooks[key]}</system-reminder>`); delete hooks[key]; }
    }
  }
}
