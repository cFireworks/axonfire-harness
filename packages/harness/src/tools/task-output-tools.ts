import { readFile } from "node:fs/promises";
import { z } from "zod";
import type { HarnessSession } from "../sessions/session.js";
import type { AgentTaskManager, ManagedAgentTask } from "../agents/agent-task-manager.js";
import type { BackgroundTaskManager, BackgroundShellTask } from "./core-shell-tools.js";
import type { ToolManager } from "./tool-manager.js";

export const taskOutputParameters = z.object({
  task_id: z.string().describe("The ID of the background task to retrieve"),
  block: z.boolean().optional().describe("Whether to wait for task completion (default: true)"),
  timeout: z.coerce.number().optional().default(60_000).describe("Timeout in milliseconds (0-600000, default: 60000)"),
  filter: z.string().optional().describe("Optional regex pattern to filter output lines (only applies to background shell tasks)"),
}).superRefine((value, context) => {
  if (value.timeout !== undefined && (value.timeout < 0 || value.timeout > 600_000)) context.addIssue({ code: "custom", message: "timeout must be between 0 and 600000 milliseconds", path: ["timeout"] });
});
export const taskStopParameters = z.object({
  task_id: z.string().optional().describe("The ID of the background task to stop"),
  shell_id: z.string().optional().describe("Deprecated: use task_id instead"),
}).refine((input) => input.task_id || input.shell_id, { message: "Either task_id or shell_id is required" });
export const killShellParameters = z.object({ shell_id: z.string().describe("The ID of the background shell to kill") });
const TERMINAL = new Set(["completed", "failed", "cancelled", "killed"]);
export function formatTaskDuration(milliseconds: number): string {
  if (milliseconds < 1000) return `${milliseconds}ms`;
  const seconds = Math.floor(milliseconds / 1000), minutes = Math.floor(seconds / 60), hours = Math.floor(minutes / 60);
  return hours > 0 ? `${hours}h ${minutes % 60}m ${seconds % 60}s` : minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
}
export type WorkflowBackgroundTask = { id: string; toolName: "Workflow"; title: string; status: string; startTime?: number; endTime?: number; error?: string; outputFilePath?: string };

/** Product TaskOutput and TaskStop, dispatching agent/shell/workflow task namespaces. */
export class TaskOutputTools {
  constructor(private readonly agents: AgentTaskManager, private readonly shells: Pick<BackgroundTaskManager, "get" | "kill">,
    private readonly getWorkflow?: (id: string) => WorkflowBackgroundTask | undefined) {}
  async output(input: z.input<typeof taskOutputParameters>, session?: HarnessSession): Promise<any> {
    const { task_id: id, block, timeout, filter } = taskOutputParameters.parse(input);
    const agent = this.agents.getTask(id);
    if (agent) return this.executeAgentTask(agent, id, block !== false, timeout);
    const workflow = this.getWorkflow?.(id);
    if (workflow) return this.executeWorkflowTask(workflow, id);
    const shell = this.shells.get(id);
    if (shell) return this.executeBackgroundShellTask(shell, id, filter, block !== false, timeout, session);
    return { content: `Background task "${id}" not found. Check the task ID and try again.`, error: "Task not found" };
  }
  async executeWorkflowTask(task: WorkflowBackgroundTask, id: string): Promise<any> {
    const lines = [`Workflow Run ID: ${id}`, `Name: ${task.title}`, `Status: ${task.status}`];
    if (task.startTime) lines.push(`Duration: ${formatTaskDuration((task.endTime || Date.now()) - task.startTime)}`);
    if (task.error) lines.push(`Error: ${task.error}`);
    lines.push("");
    if (task.status === "running") { lines.push('<system-reminder data-role="tool-hint">', `Workflow ${id} (name: ${task.title}) is still running. You will be automatically notified via a <task-notification> message when it finishes — do NOT poll TaskOutput in a loop.`, "</system-reminder>"); return { content: lines.join("\n") }; }
    if (!task.outputFilePath) { lines.push("(workflow output not persisted)"); return { content: lines.join("\n") }; }
    try { lines.push("Output:", await readFile(task.outputFilePath, "utf8") || "(empty)"); }
    catch (error) { lines.push(`Failed to read output file ${task.outputFilePath}: ${(error as Error).message ?? error}`); }
    return { content: lines.join("\n"), renderer: { type: "text", value: lines.join("\n") } };
  }
  async executeAgentTask(task: ManagedAgentTask, id: string, block: boolean, timeout?: number): Promise<any> {
    if ((task.isTeamMember || task.teamContext) && task.status !== "completed" && task.status !== "failed") {
      return { content: `Task "${id}" is a team member task (status: ${task.status}). You do NOT need to wait for it — the agent will send results back via SendMessage automatically. Continue with other work.` };
    }
    if (block) {
      try { task = await this.agents.waitFor(id, timeout); }
      catch (error) { const message = error instanceof Error ? error.message : String(error); return { content: `Error waiting for task: ${message}`, error: message }; }
    }
    const lines = [`Task ID: ${id}`, `Status: ${task.status}`];
    const duration = task.startTime ? (task.endTime || Date.now()) - task.startTime : undefined;
    if (task.startTime) {
      lines.push(`Duration: ${formatTaskDuration(duration!)}`, `Started: ${new Date(task.startTime).toISOString()}`);
      if (task.endTime) lines.push(`Ended: ${new Date(task.endTime).toISOString()}`);
    }
    if (task.agentType) lines.push(`Agent Type: ${task.agentType}`);
    lines.push(`Task ID (for resume): ${task.id}`, "");
    if (task.prompt && typeof task.prompt === "string") lines.push("Prompt:", task.prompt, "");
    if (task.response && typeof task.response === "string") lines.push("Response:", task.response, "");
    lines.push("--- RESULT ---");
    if (task.status === "completed" && task.result) lines.push(task.result);
    else if (task.status === "failed" && task.error) lines.push(`Error: ${task.error}`);
    else if (task.status === "running") lines.push("(Task still running - check again later)");
    else if (task.status === "cancelled") lines.push("(Task was cancelled)");
    else lines.push("(No result available)");
    if (task.status === "running") lines.push("", "(Task still running. You will be notified automatically when it completes.)");
    return { content: lines.join("\n"), renderer: { type: "agent-output", value: JSON.stringify({ taskId: id, status: task.status, agentType: task.agentType,
      description: task.description, duration, lastContextWindow: task.tokenUsage?.lastContextWindow, toolCallCount: task.toolCallHistory?.length,
      result: task.status === "completed" ? task.result : undefined, error: task.status === "failed" ? task.error : undefined }) } };
  }
  async executeBackgroundShellTask(task: BackgroundShellTask, id: string, filter?: string, block = true, timeout = 60_000, session?: HarnessSession): Promise<any> {
    if (block && task.status === "running") await this.waitForShellTerminal(task, timeout, session);
    let stdout = task.stdout.toString(true), stderr = task.stderr.toString(true);
    if (filter) {
      try {
        const expression = new RegExp(filter, "i");
        if (stdout) stdout = stdout.split("\n").filter((line) => expression.test(line)).join("\n");
        if (stderr) stderr = stderr.split("\n").filter((line) => expression.test(line)).join("\n");
      } catch (error) { return { content: `Invalid regex pattern: ${filter}. Error: ${error}` }; }
    }
    const lines = [`Shell ID: ${id}`, `Command: ${task.title}`, `Status: ${task.status}`, `Duration: ${formatTaskDuration((task.endTime || Date.now()) - task.startTime)}`, `Timestamp: ${new Date().toISOString()}`, ""];
    if (stdout) lines.push(`Stdout (${filter ? "filtered" : "full"}):`, stdout); else lines.push("Stdout: (no output)");
    lines.push("");
    if (stderr) lines.push(`Stderr (${filter ? "filtered" : "full"}):`, stderr); else lines.push("Stderr: (no output)");
    if (task.status === "running") lines.push("", '<system-reminder data-role="tool-hint">', `Background Bash ${id} (command: ${task.title}) is still running. You will be automatically notified via a <task-notification> message when it finishes — do NOT poll TaskOutput in a loop.`, "</system-reminder>");
    return { content: lines.join("\n"), renderer: { type: "text", value: stdout || stderr || "No output available" } };
  }
  waitForShellTerminal(task: BackgroundShellTask, timeout: number, session?: HarnessSession): Promise<void> {
    if (TERMINAL.has(task.status)) return Promise.resolve();
    return new Promise((resolve) => {
      let deadline: NodeJS.Timeout | undefined;
      let poll: NodeJS.Timeout | undefined;
      let finished = false;
      const signal = session?.abortSignal;
      const finish = () => { if (finished) return; finished = true; if (deadline) clearTimeout(deadline); if (poll) clearInterval(poll); signal?.removeEventListener("abort", finish); resolve(); };
      if (timeout > 0) deadline = setTimeout(finish, timeout);
      if (signal?.aborted) { finish(); return; }
      signal?.addEventListener("abort", finish, { once: true });
      poll = setInterval(() => { if (TERMINAL.has(task.status)) finish(); }, 200);
      if (TERMINAL.has(task.status)) finish();
    });
  }
  async stop(input: z.infer<typeof taskStopParameters>): Promise<any> {
    const id = input.task_id || input.shell_id;
    if (!id) return { content: "Error: task_id is required", error: "Missing task_id" };
    const agent = this.agents.getTask(id);
    if (agent) return this.stopAgentTask(agent, id);
    const shell = this.shells.get(id);
    if (shell) return this.stopBackgroundShellTask(shell, id);
    return { content: `Background task with ID "${id}" not found. Use /tasks command to see available tasks.` };
  }
  async stopAgentTask(task: ManagedAgentTask, id: string): Promise<any> {
    if (task.status !== "running" && task.status !== "pending") return { content: `Task "${id}" is not running. Current status: ${task.status}. Only running or pending tasks can be stopped.` };
    try {
      await this.agents.cancel(id);
      const label = task.agentType && task.description ? `${task.agentType} › ${task.description}` : task.title || task.description || "Untitled Task";
      return { content: `Successfully cancelled task "${id}"\nTask: ${label}\nRuntime: ${formatTaskDuration(Date.now() - task.startTime)}\nStatus: cancelled`, renderer: { type: "text", value: `Task ${id} cancelled successfully` } };
    } catch (error) { return { content: `Error cancelling task "${id}": ${error}` }; }
  }
  async stopBackgroundShellTask(task: BackgroundShellTask, id: string): Promise<any> {
    try {
      if (!await this.shells.kill(id)) return { content: `Failed to stop task "${id}". The task may have already completed or failed.` };
      (task as BackgroundShellTask & { notified?: boolean }).notified = true;
      return { content: `Cleanup completed for task "${id}"\nCommand: ${task.title}\nRuntime: ${formatTaskDuration(Date.now() - task.startTime)}\nStatus: ${task.status}`, renderer: { type: "text", value: `Task ${id} cleanup completed (status: ${task.status})` } };
    } catch (error) { return { content: `Error stopping task "${id}": ${error}` }; }
  }
  async killShell(input: z.infer<typeof killShellParameters>): Promise<any> {
    const id = input.shell_id, task = this.shells.get(id);
    if (!task) return { content: `Background shell with ID "${id}" not found. Use /tasks command to see available tasks.` };
    try {
      if (!await this.shells.kill(id)) return { content: `❌ Failed to kill shell "${id}". The shell may have already completed or failed.` };
      return { content: `✅ Cleanup completed for shell "${id}"\nCommand: ${task.title}\nRuntime: ${formatTaskDuration(Date.now() - task.startTime)}\nStatus: ${task.status}`, renderer: { type: "text", value: `✅ Shell ${id} cleanup completed (status: ${task.status})` } };
    } catch (error) { return { content: `❌ Error killing shell "${id}": ${error}` }; }
  }
  register(manager: ToolManager): void {
    manager.register("TaskOutput", { parameters: taskOutputParameters, needsApproval: false, aliases: ["task_output", "task-output", "BashOutput", "bash_output", "bash-output"], execute: (input, context) => this.output(taskOutputParameters.parse(input), context.context) });
    manager.register("TaskStop", { parameters: taskStopParameters, needsApproval: false, aliases: ["taskstop", "task-stop", "KillShell", "kill-shell"], execute: (input) => this.stop(taskStopParameters.parse(input)) });
    manager.register("KillShell", { parameters: killShellParameters, aliases: ["kill_shell", "kill-shell"], execute: (input) => this.killShell(killShellParameters.parse(input)) });
  }
}
