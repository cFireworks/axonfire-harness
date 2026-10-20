import { user } from "@openai/agents-core";
import type { AgentTask } from "../agents/agent-task.js";
import type { AgentTaskManager } from "../agents/agent-task-manager.js";
import type { HarnessSession } from "../sessions/session.js";
import type { SessionRunStateMachine } from "../sessions/run-state-machine.js";
import type { MessageQueueManager } from "../sessions/message-queue-manager.js";
import { TeamMailbox, formatTeammateMessage, getTeamMemberColor, type TeamMessage } from "./team-mailbox.js";
import type { TeamManager } from "./team-manager.js";
import type { TeammateIdleTracker } from "./teammate-idle-tracker.js";
import type { ShutdownCoordinator } from "./shutdown-coordinator.js";
import type { TeamLogger, TeamMemberInfo, TeamTaskFactory, TeammateBackend } from "./team-types.js";
import type { TeammateFailure } from "../agents/teammate-failure.js";
export type TeamMemberRuntime = {
  mailbox: TeamMailbox; messageQueue: MessageQueueManager; stateMachine: SessionRunStateMachine; manager: TeamManager; registry: TeamMemberRegistry;
  backend: TeammateBackend; createTask: TeamTaskFactory; taskManager: AgentTaskManager; idleTracker?: TeammateIdleTracker; shutdown?: ShutdownCoordinator;
  runDefault(input: ReturnType<typeof user>[], session: HarnessSession): Promise<void>; logger?: TeamLogger;
};
export type TeamMemberSpawnOptions = { model?: string | undefined; memberIndex?: number | undefined; maxTurns?: number | undefined; permissionMode?: string | undefined; taskDescription?: string | undefined; skipPromptWrapping?: boolean | undefined; backend?: TeammateBackend; leaderEndpoint?: string | undefined };
/** 6995005..7004426: lifecycle, finished-member respawn and mailbox protocol. */
export class TeamMember {
  private killedWithoutTask = false;
  private isRespawning = false;
  private isWaking = false;
  lastFailure: TeammateFailure | undefined;
  private spawnConfig: { mainSession: HarnessSession; subagentType: string; model?: string | undefined; memberIndex?: number | undefined; maxTurns?: number | undefined; permissionMode?: string | undefined } | undefined;
  private agentTask: AgentTask | undefined;
  private originalTaskId: string | undefined;
  private backendId: string | undefined;
  private backend: TeammateBackend | undefined;
  private stopPoller: (() => void) | undefined;
  constructor(readonly teamName: string, readonly info: TeamMemberInfo, readonly runtime: TeamMemberRuntime) {}
  async spawn(main: HarnessSession, prompt: string, subagentType: string, options: TeamMemberSpawnOptions = {}): Promise<void> {
    const { model, memberIndex, maxTurns, permissionMode, taskDescription, skipPromptWrapping, backend, leaderEndpoint } = options;
    this.lastFailure = undefined; this.killedWithoutTask = false; this.spawnConfig = { mainSession: main, subagentType, model, memberIndex, maxTurns, permissionMode };
    const members = this.runtime.manager.getMembers().filter((member) => member.name !== this.info.name).map((member) => member.name);
    if (memberIndex !== undefined) this.info.color = getTeamMemberColor(memberIndex);
    const selected = backend || this.runtime.backend, spec = { name: this.info.name, teamName: this.teamName, prompt, agentType: subagentType, cwd: main.meta?.cwd as string || process.cwd(), mainSession: main, parentSessionId: main.id, model, permissionMode, maxTurns, leaderEndpoint, color: this.info.color, memberIndex, taskDescription, skipPromptWrapping, teamMembers: members }, spawned = await selected.spawn(spec);
    Object.assign(this.info, { agentId: spawned.agentId, joinedAt: Date.now(), backendType: spawned.backendType, cwd: spec.cwd, pid: spawned.pid, logPath: spawned.logPath, tmuxPaneId: spawned.tmuxPaneId || (spawned.backendType === "in-process" ? "in-process" : "") });
    this.backendId = spawned.backendId; this.backend = selected; if (spawned.agentTask) this.agentTask = spawned.agentTask; if (this.agentTask) this.originalTaskId = this.agentTask.id;
    if (main.teamCancelled) { await this.forceKill({ keepWakeable: false }); this.runtime.logger?.info?.(`TeamMember "${this.info.name}" spawned after team cancel and was killed immediately`); return; }
    if (spawned.backendType === "in-process") { this.startMailboxPolling(); try { this.runtime.idleTracker?.register(this.teamName, this.info.name); } catch (error) { this.runtime.logger?.warn?.(`TeammateIdleTracker.register failed for "${this.info.name}": ${error}`); } }
    this.runtime.logger?.info?.(`TeamMember "${this.info.name}" spawned via ${spawned.backendType} (backendId=${spawned.backendId})`);
  }
  async respawn(prompt: string, description?: string): Promise<void> {
    if (this.isRespawning) { this.runtime.logger?.debug?.(`Respawn already in progress for "${this.info.name}", skipping`); return; }
    if (!this.spawnConfig) { this.runtime.logger?.warn?.(`Cannot respawn "${this.info.name}": no saved spawn config`); return; }
    this.isRespawning = true;
    try {
      this.lastFailure = undefined; this.killedWithoutTask = false; const { mainSession, subagentType, model, maxTurns, permissionMode } = this.spawnConfig;
      const members = this.runtime.manager.getMembers().filter((member) => member.name !== this.info.name).map((member) => member.name);
      const task = this.runtime.createTask({ description: description || this.info.name, prompt, subagent_type: subagentType, ...(model !== undefined ? { model } : {}), detached: true, captureOutput: true, ...(maxTurns !== undefined ? { maxTurns } : {}), ...(permissionMode !== undefined ? { permissionMode } : {}), ...(this.originalTaskId !== undefined ? { resume: this.originalTaskId } : {}), teamContext: { teamName: this.teamName, memberName: this.info.name, teamMembers: members, ...(this.info.color !== undefined ? { color: this.info.color } : {}) }, isFormalTeamMember: true }, mainSession);
      this.agentTask = task; this.runtime.taskManager.registerTask(task); void task.execute().catch((error) => this.runtime.logger?.error?.(`Respawn "${this.info.name}" execute() failed: taskId=${task.id}, status=${task.status}, error=`, error));
      this.runtime.logger?.info?.(`Teammate "${this.info.name}" respawned with newTaskId=${task.id}`);
    } finally { this.isRespawning = false; }
  }
  getAgentTask(): AgentTask | undefined { return this.agentTask; }
  setAgentTask(task: AgentTask): void { this.agentTask = task; }
  getTaskId(): string { return this.agentTask?.id ?? ""; }
  isActive(): boolean { if (this.backend && this.backendId && this.info.backendType !== "in-process") return !this.isFinished(); if (this.agentTask?.status === "running" || this.agentTask?.status === "pending" || this.isRespawning || this.isWaking) return true; try { const session = this.agentTask?.getSubAgentSession?.(); if (session && this.runtime.stateMachine.isBusy(session)) return true; } catch {} return false; }
  isFinished(): boolean { return this.agentTask ? ["completed", "failed", "cancelled", "killed"].includes(this.agentTask.status) : this.killedWithoutTask; }
  async isAliveAsync(): Promise<boolean> { return this.backend && this.backendId ? this.backend.isAlive(this.backendId) : this.isActive(); }
  async sendMessage(from: string, text: string, summary?: string, color?: string): Promise<void> { await this.runtime.mailbox.send(this.teamName, this.info.name, { from, text, summary, timestamp: new Date().toISOString(), color }); }
  async requestShutdown(): Promise<void> { await this.sendMessage("team-lead", JSON.stringify({ type: "shutdown_request", from: "team-lead", timestamp: new Date().toISOString() }), "Shutdown requested"); }
  async shutdownGracefully(options?: { timeoutMs?: number; reason?: string; waitForIdleFirst?: boolean }): Promise<string> { try { if (!this.runtime.shutdown) throw new Error("ShutdownCoordinator unavailable"); return await this.runtime.shutdown.shutdown(this, options); } catch (error) { if (!this.isActive()) return "not-alive"; this.runtime.logger?.warn?.(`shutdownGracefully coordinator unavailable for "${this.info.name}": ${error}`); await this.requestShutdown(); await this.forceKill(); return "forced"; } }
  async forceKill(options: { keepWakeable?: boolean } = {}): Promise<void> { const keepWakeable = options.keepWakeable !== false; if (!keepWakeable) this.stopMailboxPolling(); if (this.backend && this.backendId) { await this.backend.kill(this.backendId); if (!this.agentTask) this.killedWithoutTask = true; } else if (this.agentTask) await this.agentTask.kill(); this.runtime.logger?.info?.(`TeamMember "${this.info.name}" force killed (keepWakeable=${keepWakeable})`); }
  async destroy(): Promise<void> { this.stopMailboxPolling(); try { if (this.isActive() || this.backend && this.backendId) await this.forceKill({ keepWakeable: false }); } finally { try { this.runtime.idleTracker?.unregister(this.teamName, this.info.name); } catch {} } if (this.runtime.manager.isInTeam()) try { await this.runtime.manager.removeMember(this.info.name); } catch (error) { this.runtime.logger?.warn?.(`Failed to remove member "${this.info.name}" from config: ${error}`); } this.runtime.registry.remove(this.info.name, this.teamName); }
  startMailboxPolling(): void { this.stopPoller = this.runtime.mailbox.startPolling(this.teamName, this.info.name, (messages) => this.handleIncomingMessages(messages), 2000); }
  stopMailboxPolling(): void { if (this.stopPoller) { this.stopPoller(); this.stopPoller = undefined; } }
  formatMessageForInjection(message: TeamMessage): string { return message.from === "user" ? message.text : formatTeammateMessage(message.from, message.summary || `Message from ${message.from}`, message.text); }
  async handleIncomingMessages(messages: TeamMessage[]): Promise<void> {
    if (!this.agentTask) { this.runtime.logger?.warn?.(`No agentTask for "${this.info.name}", skipping message handling`); return; }
    const status = this.agentTask.status, finished = this.isFinished(), active = this.isActive();
    if (finished) {
      const shutdownRequests = messages.filter((message) => { try { return JSON.parse(message.text).type === "shutdown_request"; } catch { return false; } });
      if (shutdownRequests.length && shutdownRequests.length === messages.length) {
        for (const message of shutdownRequests) { let requestId: string | undefined; try { requestId = JSON.parse(message.text).request_id; } catch {} await this.runtime.mailbox.send(this.teamName, "team-lead", { from: this.info.name, text: JSON.stringify({ type: "shutdown_response", request_id: requestId, approve: true, reason: "Task already completed, auto-approved shutdown", from: this.info.name, timestamp: new Date().toISOString() }), summary: `Shutdown accepted by ${this.info.name}`, timestamp: new Date().toISOString(), color: this.info.color }); }
        void this.forceKill({ keepWakeable: false }).catch((error) => this.runtime.logger?.error?.(`"${this.info.name}" auto-shutdown forceKill failed:`, error)); return;
      }
      const senders = [...new Set(messages.map((message) => message.from))].join(", ");
      void this.runtime.mailbox.send(this.teamName, "team-lead", { from: this.info.name, text: `Teammate "${this.info.name}" has been reactivated to process new message(s) from ${senders}.`, summary: `${this.info.name} reactivated — processing new messages`, timestamp: new Date().toISOString(), color: this.info.color }).catch((error) => this.runtime.logger?.warn?.(`Failed to send respawn notification for "${this.info.name}":`, error));
      void this.respawn(messages.map((message) => this.formatMessageForInjection(message)).join("\n\n"), this.info.name).catch((error) => this.runtime.logger?.error?.(`Failed to respawn "${this.info.name}":`, error)); return;
    }
    if (!active) throw new Error(`Teammate "${this.info.name}" not active yet (status=${status}), will retry on next poll`);
    const session = this.agentTask.getSubAgentSession(); if (!session) throw new Error(`Sub-agent session not available for "${this.info.name}" (status=${status}), will retry on next poll`);
    const input = messages.map((message) => user(this.formatMessageForInjection(message)));
    if (this.runtime.stateMachine.isBusy(session) || this.isWaking) for (const item of input) this.runtime.messageQueue.enqueueMessage(session, item);
    else { this.isWaking = true; void (async () => { try { await this.runtime.runDefault(input, session); } catch (error) { this.runtime.logger?.debug?.(`Failed to wake up "${this.info.name}" agent:`, error); } finally { this.isWaking = false; } })(); }
  }
}
export class TeamMemberRegistry {
  private readonly members = new Map<string, TeamMember>();
  keyOf(team: string, member: string): string { return `${team}::${member}`; }
  register(member: TeamMember): void { this.members.set(this.keyOf(member.teamName, member.info.name), member); }
  get(name: string, team: string): TeamMember | undefined { return this.members.get(this.keyOf(team, name)); }
  findByName(name: string): TeamMember | undefined { for (const member of this.members.values()) if (member.info.name === name) return member; }
  getAll(): TeamMember[] { return [...this.members.values()]; }
  getActive(): TeamMember[] { return this.getAll().filter((member) => member.isActive()); }
  remove(name: string, team: string): void { this.members.delete(this.keyOf(team, name)); }
  async destroyAll(): Promise<void> { await Promise.all(this.getAll().map((member) => member.destroy())); this.members.clear(); }
  get size(): number { return this.members.size; }
}
