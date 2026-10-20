import { z } from "zod";
import type { HarnessSession } from "../sessions/session.js";
import { TaskStorageService, type StoredTask, type TaskUpdate } from "../tasks/task-storage-service.js";
import type { ToolManager } from "./tool-manager.js";

export const taskCreateParameters = z.object({
  subject: z.string().describe("A brief title for the task"),
  description: z.string().describe("A detailed description of what needs to be done"),
  activeForm: z.string().optional().describe('Present continuous form shown in spinner when in_progress (e.g., "Running tests")'),
  metadata: z.record(z.string(), z.unknown()).optional().describe("Arbitrary metadata to attach to the task"),
  owner: z.string().optional().describe("Task owner (agent name). Use to assign the task to a specific teammate."),
});
export const taskGetParameters = z.object({ taskId: z.string().describe("The ID of the task to retrieve") });
export const taskUpdateParameters = z.object({
  taskId: z.string().describe("The ID of the task to update"),
  subject: z.string().optional().describe("New subject for the task"),
  description: z.string().optional().describe("New description for the task"),
  activeForm: z.string().optional().describe('Present continuous form shown in spinner when in_progress (e.g., "Running tests")'),
  status: z.enum(["pending", "in_progress", "completed", "deleted"]).optional().describe("New status for the task"),
  addBlocks: z.array(z.string()).optional().describe("Task IDs that this task blocks"),
  addBlockedBy: z.array(z.string()).optional().describe("Task IDs that block this task"),
  owner: z.string().optional().describe("New owner for the task"),
  metadata: z.record(z.string(), z.unknown()).optional().describe("Metadata keys to merge into the task. Set a key to null to delete it."),
});
export const taskListParameters = z.object({});
export type TaskHookPayload = { taskId: string; subject: string; description?: string; teammateName?: string; teamName?: string };
export type TaskToolsRuntime = {
  getTeamName?: () => string | undefined;
  executeTaskCreatedHooks?: (session: HarnessSession, payload: TaskHookPayload) => Promise<void>;
  executeTaskCompletedHooks?: (session: HarnessSession, payload: TaskHookPayload) => Promise<void>;
};
const textError = (content: string, error: string) => ({ content, error, renderer: { type: "text" } });
export function resolveTaskSessionId(session?: HarnessSession): string | undefined {
  return process.env.CODEBUDDY_TASK_LIST_ID?.trim() || session?.meta.parentSessionId as string | undefined || session?.id;
}
export function tasksToTodos(tasks: StoredTask[]) {
  const items = tasks.map((task) => ({ id: task.id, content: task.subject, activeForm: task.activeForm || task.subject, status: task.status,
    dependencies: task.blockedBy, createdAt: task.createdAt, updatedAt: task.updatedAt, owner: task.owner }));
  return items.length > 0 && items.every((item) => item.status === "completed") ? [] : items;
}
export function generateActiveForm(subject: string): string {
  const words = subject.trim().split(/\s+/), first = words[0]!.toLowerCase();
  let verb = first.endsWith("e") && !first.endsWith("ee") ? first.slice(0, -1) + "ing"
    : /[aeiou][^aeiou]$/i.test(first) && first.length <= 4 ? first + first.slice(-1) + "ing" : first + "ing";
  verb = verb.charAt(0).toUpperCase() + verb.slice(1);
  return [verb, ...words.slice(1)].join(" ");
}

/** Four distinct product handlers; shared storage/team resolution and todo envelope. */
export class TaskTools {
  constructor(readonly storage: TaskStorageService, private readonly runtime: TaskToolsRuntime = {}) {}
  private scope(session?: HarnessSession): string | undefined { return this.runtime.getTeamName?.() ?? resolveTaskSessionId(session); }
  resolvePreferredTaskId(session?: HarnessSession, callId?: string): number | undefined {
    if (!session || !callId) return undefined;
    let ordinal = 0;
    for (const item of session.history as any[]) if (item.type === "function_call" && item.name === "TaskCreate") {
      ordinal++; if (item.callId === callId) return ordinal;
    }
    return undefined;
  }
  validateCreate(input: z.infer<typeof taskCreateParameters>): string | undefined {
    if (!input.subject?.trim()) return "The 'subject' parameter cannot be empty.";
    if (!input.description?.trim()) return "The 'description' parameter cannot be empty.";
    if (input.activeForm !== undefined && !input.activeForm.trim()) return "The 'activeForm' parameter, when provided, cannot be blank.";
    if (input.owner !== undefined && !input.owner.trim()) return "The 'owner' parameter, when provided, cannot be blank.";
    return undefined;
  }
  private async hook(event: "created" | "completed", session: HarnessSession | undefined, task: StoredTask): Promise<void> {
    if (!session) return;
    const team = this.runtime.getTeamName?.();
    const payload = { taskId: String(task.id), subject: task.subject,
      ...(task.description ? { description: task.description } : {}), ...(task.owner ? { teammateName: task.owner } : {}), ...(team ? { teamName: team } : {}) };
    try { await (event === "created" ? this.runtime.executeTaskCreatedHooks : this.runtime.executeTaskCompletedHooks)?.(session, payload); } catch { /* Best effort in the product. */ }
  }
  async create(input: z.infer<typeof taskCreateParameters>, session?: HarnessSession, callId?: string) {
    const error = this.validateCreate(input);
    if (error) throw new Error(`Error: Invalid parameters provided. Reason: ${error}`);
    const scope = this.scope(session);
    if (!scope) return textError("Error: Session ID is required", "Missing session");
    try {
      const task = await this.storage.create(scope, { ...input, activeForm: input.activeForm || generateActiveForm(input.subject), status: "pending" } as Omit<StoredTask, "id" | "createdAt" | "updatedAt">, this.resolvePreferredTaskId(session, callId));
      const todos = tasksToTodos(await this.storage.list(scope));
      await this.hook("created", session, task);
      return { content: `Task #${task.id} created successfully: ${task.subject}`, rawResponse: { task, todos }, renderer: { type: "todo" } };
    } catch (error) { const message = error instanceof Error ? error.message : String(error); return textError(`Error creating task: ${message}`, message); }
  }
  async get(input: z.infer<typeof taskGetParameters>, session?: HarnessSession) {
    const scope = this.scope(session);
    if (!scope) return textError("Error: Session ID is required", "Missing session");
    try {
      const task = await this.storage.get(scope, input.taskId);
      if (!task) return textError(`Task with ID "${input.taskId}" not found`, "Task not found");
      const lines = [`Task ID: ${task.id}`, `Subject: ${task.subject}`, `Status: ${task.status}`, `Description: ${task.description}`];
      if (task.activeForm) lines.push(`Active Form: ${task.activeForm}`);
      if (task.owner) lines.push(`Owner: ${task.owner}`);
      if (task.blocks?.length) lines.push(`Blocks: ${task.blocks.join(", ")}`);
      if (task.blockedBy?.length) lines.push(`Blocked By: ${task.blockedBy.join(", ")}`);
      if (task.metadata && Object.keys(task.metadata).length) lines.push(`Metadata: ${JSON.stringify(task.metadata)}`);
      return { content: lines.join("\n"), rawResponse: task, renderer: { type: "text" } };
    } catch (error) { const message = error instanceof Error ? error.message : String(error); return textError(`Error retrieving task: ${message}`, message); }
  }
  async update(input: z.infer<typeof taskUpdateParameters>, session?: HarnessSession) {
    const scope = this.scope(session);
    if (!scope) return textError("Error: Session ID is required", "Missing session");
    const { taskId, status, ...rest } = input;
    try {
      if (status === "deleted") {
        if (!await this.storage.delete(scope, taskId)) return textError(`Task with ID "${taskId}" not found`, "Task not found");
        return { content: `Task ${taskId} deleted successfully`, rawResponse: { taskId, deleted: true, todos: tasksToTodos(await this.storage.list(scope)) }, renderer: { type: "todo" } };
      }
      const update = { ...rest, ...(status ? { status } : {}) } as TaskUpdate;
      if (!Object.keys(update).length) return textError("No updates provided", "No updates");
      const task = await this.storage.update(scope, taskId, update);
      if (!task) return textError(`Task with ID "${taskId}" not found`, "Task not found");
      const todos = tasksToTodos(await this.storage.list(scope));
      if (status === "completed") await this.hook("completed", session, task);
      const changed = [rest.subject && "subject", rest.description && "description", rest.activeForm && "activeForm", rest.owner && "owner", rest.metadata && "metadata", rest.addBlocks && "blocks", rest.addBlockedBy && "blockedBy", status && "status"].filter(Boolean);
      return { content: `Updated task #${task.id} ${changed.join(", ")}`, rawResponse: { task, todos }, renderer: { type: "todo" } };
    } catch (error) { const message = error instanceof Error ? error.message : String(error); return textError(`Error updating task: ${message}`, message); }
  }
  async list(_input: unknown, session?: HarnessSession) {
    const scope = this.scope(session);
    if (!scope) return textError("Error: Session ID is required", "Missing session");
    try {
      const tasks = await this.storage.list(scope), todos = tasksToTodos(tasks);
      if (!tasks.length) return { content: "No tasks found.", rawResponse: { tasks, todos }, renderer: { type: "todo" } };
      const lines = tasks.map((task) => {
        let line = `#${task.id} [${task.status}] ${task.subject}`;
        if (task.owner) line += ` (${task.owner})`;
        const pending = task.blockedBy?.filter((id) => { const blocker = tasks.find((item) => item.id === id); return blocker && blocker.status !== "completed"; });
        if (pending?.length) line += ` [blocked by: ${pending.join(", ")}]`;
        return line;
      });
      lines.push("", this.generateSummary(tasks));
      return { content: lines.join("\n"), rawResponse: { tasks, todos }, renderer: { type: "todo" } };
    } catch (error) { const message = error instanceof Error ? error.message : String(error); return textError(`Error listing tasks: ${message}`, message); }
  }
  generateSummary(tasks: StoredTask[]): string {
    return `Summary: ${tasks.filter((task) => task.status === "completed").length} completed, ${tasks.filter((task) => task.status === "in_progress").length} in progress, ${tasks.filter((task) => task.status === "pending").length} pending (${tasks.length} total)`;
  }
  register(manager: ToolManager): void {
    manager.register("TaskCreate", { parameters: taskCreateParameters, needsApproval: false, execute: (input, context, details) => this.create(taskCreateParameters.parse(input), context.context, details?.toolCall?.callId) });
    manager.register("TaskGet", { parameters: taskGetParameters, needsApproval: false, execute: (input, context) => this.get(taskGetParameters.parse(input), context.context) });
    manager.register("TaskUpdate", { parameters: taskUpdateParameters, needsApproval: false, execute: (input, context) => this.update(taskUpdateParameters.parse(input), context.context) });
    manager.register("TaskList", { parameters: taskListParameters, needsApproval: false, execute: (input, context) => this.list(input, context.context) });
  }
}
