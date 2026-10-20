import type { TeamMailbox } from "./team-mailbox.js";
import { ENV_SESSION_KIND, type TeamProcessManager } from "./daemon-process-manager.js";
import type { TeammateBackend, TeammateSpawnSpec, TeammateSpawnResult } from "./team-types.js";
/** Native 8401515..8403168. Source registers the PID before sending the initial mailbox message. */
export class DetachedProcessTeammateBackend implements TeammateBackend {
  readonly type = "detached-process";
  readonly processes = new Map<string, { pid: number; logPath: string }>();
  constructor(readonly processManager: TeamProcessManager, readonly mailbox: Pick<TeamMailbox, "send">) {}
  async isAvailable(): Promise<boolean> { return true; }
  async spawn(spec: TeammateSpawnSpec): Promise<TeammateSpawnResult> {
    const id = `${spec.name}@${spec.teamName}`, args = this.buildCliArgs(spec), env = this.buildTeammateEnv(spec), hasLeader = !!spec.leaderEndpoint, name = `teammate-${spec.teamName}-${spec.name}`;
    const { pid, logPath } = await this.processManager.forkBgSession(args, { name, cwd: spec.cwd, skipAutoApprove: hasLeader, skipPrintMode: true, extraEnv: env }); this.processes.set(id, { pid, logPath });
    await this.mailbox.send(spec.teamName, spec.name, { from: "team-lead", text: spec.prompt, summary: `Initial task for ${spec.name}`, timestamp: new Date().toISOString() });
    return { success: true, backendId: id, agentId: id, backendType: "detached-process", logPath, pid };
  }
  async kill(id: string): Promise<boolean> { const entry = this.processes.get(id); if (!entry) return false; if (this.processManager.sendSignal(entry.pid, "SIGTERM") && await this.processManager.waitForExit(entry.pid, 5000)) { this.processes.delete(id); return true; } this.processManager.sendSignal(entry.pid, "SIGKILL"); this.processes.delete(id); return true; }
  async isAlive(id: string): Promise<boolean> { const entry = this.processes.get(id); return !!entry && this.processManager.isProcessRunning(entry.pid); }
  buildTeammateEnv(_spec: TeammateSpawnSpec): NodeJS.ProcessEnv { return { [ENV_SESSION_KIND]: "teammate", CODEBUDDY_GATEWAY_AUTH: "none" }; }
  buildCliArgs(spec: TeammateSpawnSpec): string[] { const args = ["--serve", "--teammate-mode", "--team-name", spec.teamName, "--agent-name", spec.name, "--agent-type", spec.agentType]; if (spec.parentSessionId) args.push("--parent-session-id", spec.parentSessionId); if (spec.color) args.push("--agent-color", spec.color); if (spec.leaderEndpoint) args.push("--leader-endpoint", spec.leaderEndpoint); if (spec.model) args.push("--model", spec.model); if (spec.maxTurns) args.push("--max-turns", String(spec.maxTurns)); return args; }
}
