import { z } from "zod";
import type { RunContext } from "@openai/agents";
import type { AgentManager } from "../agents/agent-manager.js";
import { AgentTask, type AgentTaskConfig, type AgentTaskResult } from "../agents/agent-task.js";
import type { AgentTaskManager } from "../agents/agent-task-manager.js";
import type { HarnessSession } from "../sessions/session.js";
import type { ToolManager, ToolCallDetails } from "./tool-manager.js";
import { AGENT_TOOL_ERROR_CODES as CODES, ToolExecutionError } from "./tool-execution-error.js";

export const agentParameters = z.object({
  description: z.string().describe("A short (3-5 word) description of the task"),
  prompt: z.string().describe("The task for the agent to perform"),
  subagent_type: z.string().optional().describe("The type of specialized agent to use for this task"),
  model: z.enum(["default", "lite", "reasoning"]).optional().describe('Model variant to use for this agent. "default": inherits from parent, balanced for general tasks; "lite": fast and cost-effective, ideal for simple searches, quick file operations, and straightforward tasks; "reasoning": enhanced reasoning capability, best for complex analysis, architectural decisions, and multi-step problem solving.'),
  resume: z.string().optional().describe("Optional agent ID to resume from. If provided, the agent will continue from the previous execution transcript."),
  run_in_background: z.boolean().optional().describe("Set to true to run this agent in the background. Use TaskOutput to read the output later."),
  name: z.string().optional().describe('Name for the spawned agent. Makes it addressable via SendMessage({to: name}) while running. The name "team-lead" is reserved for the leader created by TeamCreate — do NOT use it for spawned teammates; pick a role-based name like "pm", "ui-designer", "fe-dev", etc. Names must be unique within a team.'),
  team_name: z.string().optional().describe("Team name for spawning. Uses current team context if omitted."),
  mode: z.enum(["acceptEdits", "bypassPermissions", "default", "plan", "dontAsk", "auto"]).optional().describe('Permission mode for spawned teammate (e.g., "plan" to require plan approval).'),
  max_turns: z.number().int().positive().optional().describe("Maximum number of agentic turns (API round-trips) before stopping."),
});
export type AgentToolInput = z.infer<typeof agentParameters>;
export type AgentToolResult = { content: string; renderer?: { type: string; value?: string }; subAgent?: { sessionId: string; afterId?: string; lastId: string } };
export type AgentWorktree = { worktreePath: string; worktreeBranch: string; headCommit: string };
export type AgentToolRuntime = {
  createTask: (config: AgentTaskConfig, main: HarnessSession) => AgentTask;
  teamsEnabled?: () => boolean;
  spawnBackground?: (main: HarnessSession, config: { description: string; prompt: string; agentType: string; model?: string; maxTurns?: number }) => Promise<AgentToolResult>;
  spawnTeammate?: (main: HarnessSession, config: { name: string; description: string; prompt: string; subagentType: string; model?: string; teamName?: string; permissionMode?: string; maxTurns?: number }) => Promise<AgentToolResult>;
  hasCustomAgent?: (name: string) => boolean;
  reportPluginAgentCall?: (name: string | undefined, session: HarnessSession) => Promise<void>;
  worktrees?: {
    create(name: string): Promise<AgentWorktree>;
    hasChanges(worktree: AgentWorktree): Promise<boolean>;
    remove(worktree: AgentWorktree): Promise<void>;
    run<T>(directory: string, fn: () => Promise<T>): Promise<T>;
  };
};

/** Synchronous/fork routing from class 11853702..11868971; Team/isolated hosts are adapters. */
export class AgentTool {
  readonly parameters = agentParameters;
  readonly needsApproval = false;
  constructor(private readonly agents: AgentManager, private readonly tasks: AgentTaskManager, private readonly runtime: AgentToolRuntime) {}
  toAutoClassifierInput(input: Partial<AgentToolInput> | undefined): string {
    if (typeof input?.prompt !== "string") return "";
    return `(${input.subagent_type || "general-purpose"}${input.mode ? `, mode=${input.mode}` : ""}): ${input.prompt}`;
  }
  classifyAgentError(message: string): string { const lower = message.toLowerCase(); return lower.includes("max turns") && lower.includes("exceeded") ? CODES.maxTurns : CODES.execution; }
  async resolveSpawnModel(value?: string, source?: string): Promise<string | undefined> {
    const normalized = value?.trim().toLowerCase();
    if (normalized && normalized !== "inherit" && normalized !== "default") return this.agents.resolveConfiguredModelOrFallback(value, source);
    return undefined;
  }
  isInForkChild(session: HarnessSession): boolean {
    if (session.meta.agentName === "fork") return true;
    return (session.history as any[]).slice(0, 5).some((item) => typeof item?.content === "string" ? item.content.includes("<fork-boilerplate>")
      : Array.isArray(item?.content) && item.content.some((part: any) => part?.type === "input_text" && typeof part.text === "string" && part.text.includes("<fork-boilerplate>")));
  }
  buildForkChildPrompt(prompt: string): string {
    return `<fork-boilerplate>\nYou are a background fork of the main agent. Follow these rules strictly:\n1. Do NOT spawn additional fork agents (omitting subagent_type). If you need sub-agents, specify a subagent_type explicitly.\n2. Do NOT engage in conversation with the user. Execute the task directly using tools.\n3. Work autonomously — do not ask questions or wait for confirmation.\n4. If you modify files, commit your changes with a descriptive message.\n5. When done, provide a concise report in this format:\n   - **Scope**: What you were asked to do\n   - **Result**: What you accomplished (success/failure/partial)\n   - **Key files**: Important files you read or discovered\n   - **Files changed**: Files you created or modified (if any)\n   - **Issues**: Any problems encountered (if any)\n</fork-boilerplate>\n\n${prompt}`;
  }
  static subAgentMetaOf(result: AgentTaskResult): AgentToolResult["subAgent"] {
    return result.sessionId && result.lastId !== undefined && result.afterId !== result.lastId
      ? { sessionId: result.sessionId, ...(result.afterId !== undefined ? { afterId: result.afterId } : {}), lastId: result.lastId } : undefined;
  }
  async cleanupAgentWorktree(worktree: AgentWorktree | undefined): Promise<string | null> {
    if (!worktree || !this.runtime.worktrees) return null;
    try {
      if (!await this.runtime.worktrees.hasChanges(worktree)) { await this.runtime.worktrees.remove(worktree); return "\n\nWorktree removed (no changes)"; }
      return `\n\nWorktree preserved at ${worktree.worktreePath} on branch: ${worktree.worktreeBranch}`;
    } catch { return null; }
  }
  async execute(input: AgentToolInput, context?: RunContext<HarnessSession>, details?: ToolCallDetails): Promise<AgentToolResult> {
    if (!context?.context) throw new ToolExecutionError("Session is required to run a task", CODES.sessionRequired);
    const main = context.context;
    let type = input.subagent_type;
    const envMax = Number(process.env.CODEBUDDY_CODE_SUBAGENT_MAX_TURNS);
    const maxTurns = envMax && Number.isFinite(envMax) && envMax > 0 ? envMax : input.max_turns;
    const forkDisabled = ["1", "true", "yes", "on"].includes((process.env.CODEBUDDY_DISABLE_FORK_SUBAGENT ?? "").toLowerCase());
    if (type === "fork" && forkDisabled && !this.runtime.hasCustomAgent?.("fork")) type = "general-purpose";
    await this.runtime.reportPluginAgentCall?.(type, main);
    const teams = this.runtime.teamsEnabled?.() === true;
    const inTeam = Boolean(main.meta.teamContext);
    const fork = type === "fork" && !forkDisabled && !this.isInForkChild(main) && !inTeam;
    const actualType = type || "general-purpose";
    if (fork && input.run_in_background && teams) {
      if (!this.runtime.spawnBackground) throw new ToolExecutionError("Team background backend is not connected", CODES.execution);
      return this.runtime.spawnBackground(main, { description: input.description, prompt: this.buildForkChildPrompt(input.prompt), agentType: "fork", ...(input.model ? { model: input.model } : {}), ...(maxTurns ? { maxTurns } : {}) });
    }
    const config = await this.agents.getAgentConfig(actualType);
    const source = input.name && teams ? `teammate:${actualType}` : (input.run_in_background || inTeam) && teams ? `background-subagent:${actualType}` : `subagent:${actualType}`;
    const model = fork ? input.model : await this.resolveSpawnModel(input.model || config?.models?.[0], source);
    if (!fork && input.name && teams) {
      if (!this.runtime.spawnTeammate) throw new ToolExecutionError("Team member backend is not connected", CODES.execution);
      return this.runtime.spawnTeammate(main, { name: input.name, description: input.description, prompt: input.prompt, subagentType: actualType,
        ...(model ? { model } : {}), ...(input.team_name ? { teamName: input.team_name } : {}), ...(input.mode === "plan" ? { permissionMode: "plan" } : {}), ...(maxTurns ? { maxTurns } : {}) });
    }
    if (!fork && (input.run_in_background || inTeam) && teams) {
      if (!this.runtime.spawnBackground) throw new ToolExecutionError("Team background backend is not connected", CODES.execution);
      return this.runtime.spawnBackground(main, { description: input.description, prompt: input.prompt, agentType: actualType, ...(model ? { model } : {}), ...(maxTurns ? { maxTurns } : {}) });
    }
    let worktree: AgentWorktree | undefined;
    if (!fork && config?.isolation === "worktree" && this.runtime.worktrees) {
      try { worktree = await this.runtime.worktrees.create(`agent-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`); } catch { /* Original logs and continues without isolation. */ }
    }
    const task = this.runtime.createTask({ description: input.description, prompt: fork ? this.buildForkChildPrompt(input.prompt) : input.prompt,
      subagent_type: actualType, ...(model ? { model } : {}), ...(input.resume ? { resume: input.resume } : {}), ...(details?.toolCall?.callId ? { parentToolUseId: details.toolCall.callId } : {}), ...(maxTurns ? { maxTurns } : {}) }, main);
    this.tasks.registerTask(task, true);
    try {
      const result = worktree && this.runtime.worktrees ? await this.runtime.worktrees.run(worktree.worktreePath, () => task.execute()) : await task.execute();
      this.tasks.removeTask(task.id);
      const cleanup = await this.cleanupAgentWorktree(worktree);
      const subAgent = AgentTool.subAgentMetaOf(result);
      return { content: result.content + (cleanup || ""), renderer: result.renderer || { type: "text" }, ...(subAgent ? { subAgent } : {}) };
    } catch (error) {
      await this.cleanupAgentWorktree(worktree);
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("aborted") || message.includes("cancelled") || message.includes("interrupted")) {
        return { content: `Task "${input.description}" was interrupted by user. The task has been stopped.\n\nIf the user wants to continue this task later, you can resume it by calling the Agent tool with resume="${task.id}".\n\n${fork ? "" : "Do NOT use TaskOutput to retrieve results - TaskOutput is only for background tasks started with run_in_background=true.\n\n"}[Agent ID: ${task.id}]`, renderer: { type: "text" } };
      }
      this.tasks.removeTask(task.id);
      throw new ToolExecutionError(`Failed to execute task "${input.description}": ${message}`, fork ? CODES.execution : this.classifyAgentError(message));
    }
  }
  register(manager: ToolManager): void { manager.register("Agent", { parameters: this.parameters, needsApproval: false, execute: (input, context, details) => this.execute(agentParameters.parse(input), context, details) }); }
}
