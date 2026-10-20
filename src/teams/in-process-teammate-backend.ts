import type { AgentTask } from "../agents/agent-task.js";
import type { AgentTaskManager } from "../agents/agent-task-manager.js";
import { formatInitialAssignmentSummary, formatTeammateMessage, getTeamMemberColor } from "./team-mailbox.js";
import type { TeamTaskFactory, TeammateBackend, TeammateSpawnSpec, TeammateSpawnResult } from "./team-types.js";
export class InProcessTeammateBackend implements TeammateBackend {
  readonly type = "in-process";
  private readonly tasks = new Map<string, AgentTask>();
  constructor(readonly createTask: TeamTaskFactory, readonly taskManager: AgentTaskManager) {}
  async isAvailable(): Promise<boolean> { return !(process.env.CODEBUDDY_DISABLE_INPROCESS_TEAMMATES === "1" || process.argv.includes("--swarm")); }
  async spawn(spec: TeammateSpawnSpec): Promise<TeammateSpawnResult> {
    const prompt = spec.skipPromptWrapping ? spec.prompt : formatTeammateMessage("team-lead", formatInitialAssignmentSummary(spec.name), spec.prompt), color = spec.color || (spec.memberIndex !== undefined ? getTeamMemberColor(spec.memberIndex) : undefined);
    const task = this.createTask({ description: spec.taskDescription || spec.name, prompt, subagent_type: spec.agentType, ...(spec.model !== undefined ? { model: spec.model } : {}), detached: true, captureOutput: true, ...(spec.maxTurns !== undefined ? { maxTurns: spec.maxTurns } : {}), ...(spec.permissionMode !== undefined ? { permissionMode: spec.permissionMode } : {}), teamContext: { teamName: spec.teamName, memberName: spec.name, teamMembers: spec.teamMembers || [], ...(color ? { color } : {}) }, isFormalTeamMember: true }, spec.mainSession);
    this.taskManager.registerTask(task); void task.execute().catch(() => undefined); this.tasks.set(task.id, task);
    return { success: true, backendId: task.id, agentId: `${spec.name}@${spec.teamName}`, backendType: "in-process", agentTask: task };
  }
  async kill(id: string): Promise<boolean> { const task = this.tasks.get(id); if (!task) return false; await task.kill(); this.tasks.delete(id); return true; }
  async isAlive(id: string): Promise<boolean> { const task = this.tasks.get(id); return !!task && (task.status === "running" || task.status === "pending"); }
}
