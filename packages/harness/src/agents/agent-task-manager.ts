import { EventEmitter } from "node:events";
import type { AgentTask, AgentTaskStatus } from "./agent-task.js";
import type { HarnessSession } from "../sessions/session.js";
import type { TeamMailbox, TeamMessage } from "../teams/team-mailbox.js";

export type ManagedAgentTask = Pick<AgentTask, "id" | "status" | "startTime" | "mainSessionId" | "kill"> & Partial<Pick<AgentTask,
  "endTime" | "cancel" | "onStatusChange" | "description" | "title" | "prompt" | "agentType" | "memberName" | "teamContext" | "isTeamMember" | "result" | "response" | "error" | "tokenUsage" | "toolCallHistory" | "getSubAgentSession">>;
type Waiter = { resolve(task: ManagedAgentTask): void; reject(reason: unknown): void; timeout?: NodeJS.Timeout };
export type TaskManagerTeamRuntime = {
  getTeam(): { name: string; auto: boolean } | undefined;
  mailbox: Pick<TeamMailbox, "getAll" | "send">;
  activeMemberCount(): number;
  memberCount(): number;
  stopLeadPolling(): void;
  destroyMembers(): Promise<void>;
  deleteTeam(): Promise<void>;
};
export function shouldDeliverFrameworkNotification(hasOtherActive: boolean, hasRecentMessage: boolean): boolean { return !hasOtherActive || !hasRecentMessage; }

/** module 97959, class offsets 6938245..6948289. Team host calls are explicit adapters. */
export class AgentTaskManager {
  static readonly COMPLETED_TASK_TTL_MS = 300_000;
  static readonly CLEANUP_INTERVAL_MS = 60_000;
  static readonly MAX_COMPLETED_TEAM_SESSIONS = 20;
  private readonly tasks = new Map<string, ManagedAgentTask>();
  private readonly events = new EventEmitter();
  private readonly waitPromises = new Map<string, Waiter[]>();
  private readonly pendingTeamNotifications = new Map<string, NodeJS.Timeout>();
  private completedTaskCleanupTimer: NodeJS.Timeout | undefined;
  private autoTeamCleanupTimer: NodeJS.Timeout | undefined;
  private mainSession: HarnessSession | undefined;
  constructor(private readonly team?: TaskManagerTeamRuntime) {}
  init(): void { this.startCompletedTaskCleanup(); }
  registerTask(task: ManagedAgentTask, skipStatusMonitoring = false): void {
    this.tasks.set(task.id, task);
    if (!skipStatusMonitoring) task.onStatusChange?.((event) => this.handleTaskStatusChange(event.task, event.oldStatus, event.newStatus));
  }
  getTask(id: string): ManagedAgentTask | undefined {
    return this.tasks.get(id) ?? (id.includes("@") ? [...this.tasks.values()].find((task) => task.teamContext && `${task.teamContext.memberName}@${task.teamContext.teamName}` === id) : undefined);
  }
  getTasks(): ManagedAgentTask[] { return [...this.tasks.values()]; }
  getTasksByStatus(status: AgentTaskStatus): ManagedAgentTask[] { return this.getTasks().filter((task) => task.status === status); }
  getTasksBySession(id: string): ManagedAgentTask[] { return this.getTasks().filter((task) => task.mainSessionId === id); }
  async waitFor(id: string, timeout?: number): Promise<ManagedAgentTask> {
    const task = this.tasks.get(id);
    if (!task) throw new Error(`Task ${id} not found`);
    if (["completed", "failed", "cancelled"].includes(task.status)) return task;
    return new Promise((resolve, reject) => {
      const waiter: Waiter = { resolve, reject };
      if (timeout) waiter.timeout = setTimeout(() => { this.removeWaitPromise(id, waiter); reject(new Error(`Wait for task ${id} timed out after ${timeout}ms`)); }, timeout);
      this.waitPromises.set(id, [...(this.waitPromises.get(id) ?? []), waiter]);
      const current = this.tasks.get(id);
      if (!current) reject(new Error(`Task ${id} was removed`));
      else if (["completed", "failed", "cancelled"].includes(current.status)) { if (waiter.timeout) clearTimeout(waiter.timeout); this.removeWaitPromise(id, waiter); resolve(current); }
    });
  }
  async cancel(id: string): Promise<void> {
    const task = this.tasks.get(id);
    if (!task) throw new Error(`Task ${id} not found`);
    if (task.cancel) await task.cancel(); else await task.kill();
    task.endTime = Date.now();
  }
  on(name: string, listener: (...args: any[]) => void): void { this.events.on(name, listener); }
  off(name: string, listener: (...args: any[]) => void): void { this.events.off(name, listener); }
  removeTask(id: string): void { this.tasks.delete(id); }
  clearCompleted(): void { for (const task of this.tasks.values()) if (task.status === "completed" || task.status === "failed") this.tasks.delete(task.id); }
  async clearBySession(id: string): Promise<void> {
    for (const task of this.getTasksBySession(id)) {
      if (task.status === "pending" || task.status === "running") { try { await this.cancel(task.id); } catch {} }
      this.tasks.delete(task.id);
    }
    this.cancelPendingTeamNotifications();
    try { if (this.team?.getTeam()?.auto) { this.team.stopLeadPolling(); await this.team.destroyMembers(); await this.team.deleteTeam(); } } catch {}
  }
  handleTaskStatusChange(task: ManagedAgentTask, _oldStatus: AgentTaskStatus, status: AgentTaskStatus): void {
    if (status === "running") { this.events.emit("task-started", task); if (this.autoTeamCleanupTimer) clearTimeout(this.autoTeamCleanupTimer); this.autoTeamCleanupTimer = undefined; return; }
    if (["completed", "failed", "cancelled", "killed"].includes(status)) {
      this.resolveWaitPromises(task.id, task);
      this.events.emit(`task-${status}`, task);
      if (status === "completed" || status === "failed") { this.triggerNotification(task); this.evictOldestTeamSessions(); this.checkAutoTeamCompletion(); }
    }
  }
  resolveWaitPromises(id: string, task: ManagedAgentTask): void {
    for (const waiter of this.waitPromises.get(id) ?? []) { if (waiter.timeout) clearTimeout(waiter.timeout); waiter.resolve(task); }
    this.waitPromises.delete(id);
  }
  removeWaitPromise(id: string, waiter: Waiter): void {
    const entries = this.waitPromises.get(id);
    if (!entries) return;
    const index = entries.indexOf(waiter);
    if (index >= 0) entries.splice(index, 1);
    if (!entries.length) this.waitPromises.delete(id);
  }
  setMainSession(session: HarnessSession): void { this.mainSession = session; }
  getMainSession(): HarnessSession | undefined { return this.mainSession; }
  triggerNotification(task: ManagedAgentTask): void { if (task.teamContext) this.scheduleTeamMemberNotification(task); }
  scheduleTeamMemberNotification(task: ManagedAgentTask): void {
    const context = task.teamContext;
    if (!context) return;
    const key = `${context.teamName}/${context.memberName}`, previous = this.pendingTeamNotifications.get(key);
    if (previous) clearTimeout(previous);
    const timer = setTimeout(async () => {
      this.pendingTeamNotifications.delete(key);
      try {
        if (["killed", "cancelled"].includes(task.status) || this.team?.getTeam()?.name !== context.teamName) return;
        const otherActive = this.getTasks().some((other) => other.teamContext?.teamName === context.teamName && other.teamContext?.memberName !== context.memberName && ["pending", "running"].includes(other.status));
        const recent = otherActive && (await this.team!.mailbox.getAll(context.teamName!, "team-lead"))
          .some((message) => message.from === context.memberName && new Date(message.timestamp).getTime() > Date.now() - 30_000);
        if (shouldDeliverFrameworkNotification(otherActive, recent)) await this.team!.mailbox.send(context.teamName!, "team-lead", this.buildTeamMemberNotification(task));
      } catch {}
    }, 4000);
    timer.unref();
    this.pendingTeamNotifications.set(key, timer);
  }
  buildTeamMemberNotification(task: ManagedAgentTask): TeamMessage {
    const member = task.teamContext?.memberName || task.memberName || "unknown", description = task.description || "";
    const verbs: Record<string, string> = { completed: "completed successfully", failed: "failed", cancelled: "was cancelled", killed: "was stopped" };
    const lines = ["[Framework Auto-Notification]", `Teammate "${member}" ${verbs[task.status] || task.status}.`];
    if (description) lines.push(`Task: ${description}`);
    if (task.startTime) { const seconds = Math.floor(((task.endTime || Date.now()) - task.startTime) / 1000), minutes = Math.floor(seconds / 60); lines.push(`Duration: ${minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`}`); }
    if (task.status === "failed" && task.error) lines.push(`Error: ${task.error.length > 200 ? task.error.slice(0, 200) + "..." : task.error}`);
    const summary = task.status === "failed" ? `${member} failed: ${description}` : task.status === "cancelled" ? `${member} was cancelled` : task.status === "killed" ? `${member} was stopped` : `${member} completed: ${description}`;
    return { from: "system", text: lines.join("\n"), summary, timestamp: new Date().toISOString() };
  }
  checkAutoTeamCompletion(): void {
    if (this.autoTeamCleanupTimer || !this.team?.getTeam()?.auto || !this.team.memberCount() || this.team.activeMemberCount() > 0) return;
    this.autoTeamCleanupTimer = setTimeout(async () => {
      this.autoTeamCleanupTimer = undefined;
      try { if (!this.team || this.team.activeMemberCount() > 0) return; this.team.stopLeadPolling(); await this.team.destroyMembers(); await this.team.deleteTeam(); } catch {}
    }, 10_000);
  }
  cancelPendingTeamNotifications(): void {
    for (const timer of this.pendingTeamNotifications.values()) clearTimeout(timer);
    this.pendingTeamNotifications.clear();
    if (this.autoTeamCleanupTimer) clearTimeout(this.autoTeamCleanupTimer);
    this.autoTeamCleanupTimer = undefined;
  }
  evictOldestTeamSessions(): void {
    const tasks = this.getTasks().filter((task) => task.isTeamMember && ["completed", "failed", "cancelled", "killed"].includes(task.status) && task.getSubAgentSession?.());
    tasks.sort((a, b) => (a.endTime || a.startTime) - (b.endTime || b.startTime));
    for (const task of tasks.slice(0, Math.max(0, tasks.length - AgentTaskManager.MAX_COMPLETED_TEAM_SESSIONS))) (task as any).subAgentSession = undefined;
  }
  startCompletedTaskCleanup(): void { this.completedTaskCleanupTimer = setInterval(() => this.cleanupExpiredTasks(), AgentTaskManager.CLEANUP_INTERVAL_MS); this.completedTaskCleanupTimer.unref(); }
  cleanupExpiredTasks(): void {
    for (const task of this.tasks.values()) if (["completed", "failed", "cancelled", "killed"].includes(task.status) && !task.isTeamMember && (task.endTime || task.startTime) && Date.now() - (task.endTime || task.startTime) > AgentTaskManager.COMPLETED_TASK_TTL_MS) this.tasks.delete(task.id);
  }
  stopCleanup(): void { if (this.completedTaskCleanupTimer) clearInterval(this.completedTaskCleanupTimer); this.completedTaskCleanupTimer = undefined; this.cancelPendingTeamNotifications(); }
  async waitForRunningTasks(timeout?: number): Promise<void> { await Promise.all(this.getTasks().filter((task) => ["running", "pending"].includes(task.status)).map((task) => this.waitFor(task.id, timeout))); }
}
