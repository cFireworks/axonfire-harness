import type { AgentRunContext, AgentRunInterceptor } from "./agent-service.js";
import { addSystemReminder } from "./system-reminder-agent-run-interceptor.js";
export const WORKTREE_CONTEXT_PROMPT = `<system-reminder data-role="worktree">
This is a git worktree — an isolated copy of the repository.
Run all commands from this directory. Do NOT \`cd\` to the original repository root.
</system-reminder>`;
export class WorktreeContextInterceptor implements AgentRunInterceptor {
  readonly priority = 1190;
  constructor(readonly worktreeSessionManager?: { isInWorktreeSession(): boolean }) {}
  async intercept(context: AgentRunContext): Promise<void> { if (!Array.isArray(context.input) || context.skipRun || !this.worktreeSessionManager?.isInWorktreeSession()) return; if (this.shouldInjectWorktreePrompt(context)) addSystemReminder(context.input, WORKTREE_CONTEXT_PROMPT, "last"); }
  shouldInjectWorktreePrompt(context: AgentRunContext): boolean {
    const input = context.input as any[];
    if (input.filter((item) => item.role === "user").length === 1 || context.session.options.continue && !context.session.options.continued) return true;
    for (const item of input) if (item.type === "message" && item.role === "user") { if (typeof item.content === "string" && item.content.includes("git worktree")) return false; if (Array.isArray(item.content) && item.content.some((part: any) => part.type === "input_text" && typeof part.text === "string" && part.text.includes("git worktree"))) return false; }
    return true;
  }
}
