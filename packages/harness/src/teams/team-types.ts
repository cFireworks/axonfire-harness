import type { AgentTask, AgentTaskConfig } from "../agents/agent-task.js";
import type { HarnessSession } from "../sessions/session.js";
export type TeamLogger = { info?(text: string): void; debug?(text: string, error?: unknown): void; warn?(text: string, error?: unknown): void; error?(text: string, error?: unknown): void };
export type TeamMemberInfo = {
  agentId: string; name: string; agentType: string; joinedAt: number; tmuxPaneId: string; cwd: string; subscriptions: string[];
  model?: string | undefined; prompt?: string | undefined; role?: string | undefined; color?: string | undefined; planModeRequired?: boolean | undefined;
  backendType?: string | undefined; pid?: number | undefined; logPath?: string | undefined; worktreePath?: string | undefined; [key: string]: unknown;
};
export type TeamConfig = { name: string; description?: string | undefined; createdAt: number; leadAgentId: string; leadSessionId: string; members: TeamMemberInfo[]; isAutoTeam?: boolean };
export type TeamTaskFactory = (config: AgentTaskConfig, main: HarnessSession) => AgentTask;
export type TeammateSpawnSpec = {
  name: string; teamName: string; prompt: string; agentType: string; cwd: string; mainSession: HarnessSession; parentSessionId: string;
  model?: string | undefined; permissionMode?: string | undefined; maxTurns?: number | undefined; leaderEndpoint?: string | undefined; color?: string | undefined;
  memberIndex?: number | undefined; taskDescription?: string | undefined; skipPromptWrapping?: boolean | undefined; teamMembers?: string[] | undefined;
};
export type TeammateSpawnResult = { success: boolean; backendId: string; agentId: string; backendType: string; agentTask?: AgentTask; pid?: number | undefined; logPath?: string | undefined; tmuxPaneId?: string | undefined };
export interface TeammateBackend { readonly type: string; isAvailable(): Promise<boolean>; spawn(spec: TeammateSpawnSpec): Promise<TeammateSpawnResult>; kill(id: string): Promise<boolean>; isAlive(id: string): Promise<boolean>; }
