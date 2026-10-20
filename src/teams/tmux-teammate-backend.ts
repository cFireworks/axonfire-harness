import { spawnSync } from "node:child_process";
import type { TeamMailbox } from "./team-mailbox.js";
import { ENV_SESSION_KIND, ENV_SESSION_NAME } from "./daemon-process-manager.js";
import type { TeamLogger, TeammateBackend, TeammateSpawnSpec, TeammateSpawnResult } from "./team-types.js";
export type TmuxService = { isInsideTmux(): boolean; isAvailable(): Promise<{ available: boolean }> };
/** Native 8403979..8407658. Commands are injectable for differential tests. */
export class TmuxTeammateBackend implements TeammateBackend {
  readonly type = "tmux";
  readonly panes = new Map<string, { paneId: string; insideLeaderTmux: boolean }>();
  constructor(readonly tmuxService: TmuxService, readonly mailbox: Pick<TeamMailbox, "send">, readonly logger: TeamLogger = {}, readonly command: typeof spawnSync = spawnSync) {}
  get socketName(): string { return `cbc-team-${process.pid}`; }
  get insideTmux(): boolean { return this.tmuxService.isInsideTmux(); }
  async isAvailable(): Promise<boolean> { return !!this.insideTmux && (await this.tmuxService.isAvailable()).available; }
  async spawn(spec: TeammateSpawnSpec): Promise<TeammateSpawnResult> {
    const id = `${spec.name}@${spec.teamName}`; let pane: string;
    if (this.insideTmux) { pane = this.splitInCurrentSession(spec); this.panes.set(id, { paneId: pane, insideLeaderTmux: true }); this.logger.info?.(`[TmuxBackend] Spawned "${spec.name}" in current tmux session (pane ${pane})`); }
    else { const session = `cbc-${spec.teamName}`; this.ensureExternalSession(session, spec.cwd); pane = this.splitInExternalSession(session, spec); this.panes.set(id, { paneId: pane, insideLeaderTmux: false }); this.logger.info?.(`[TmuxBackend] Spawned "${spec.name}" in external session (pane ${pane}). Attach with: tmux -L ${this.socketName} attach -t ${session}`); }
    await this.mailbox.send(spec.teamName, spec.name, { from: "team-lead", text: spec.prompt, summary: `Initial task for ${spec.name}`, timestamp: new Date().toISOString() }); return { success: true, backendId: id, agentId: id, backendType: "tmux", tmuxPaneId: pane };
  }
  async kill(id: string): Promise<boolean> { const pane = this.panes.get(id); if (!pane) return false; this.command("tmux", pane.insideLeaderTmux ? ["kill-pane", "-t", pane.paneId] : ["-L", this.socketName, "kill-pane", "-t", pane.paneId]); this.panes.delete(id); return true; }
  async isAlive(id: string): Promise<boolean> { const pane = this.panes.get(id); if (!pane) return false; const args = pane.insideLeaderTmux ? ["list-panes", "-F", "#{pane_id}"] : ["-L", this.socketName, "list-panes", "-a", "-F", "#{pane_id}"]; const result = this.command("tmux", args, { encoding: "utf-8" }); return result.status === 0 && result.stdout.includes(pane.paneId); }
  splitInCurrentSession(spec: TeammateSpawnSpec): string { const result = this.command("tmux", ["split-window", "-h", "-P", "-F", "#{pane_id}", "-c", spec.cwd, "sh", "-c", this.buildShellCommand(spec)], { encoding: "utf-8" }); if (result.status !== 0) throw new Error(`Failed to split tmux pane: ${result.stderr}`); const pane = result.stdout.trim(); this.command("tmux", ["select-pane", "-t", pane, "-T", spec.name]); this.command("tmux", ["select-layout", "tiled"]); return pane; }
  ensureExternalSession(session: string, cwd: string): void { if (this.command("tmux", ["-L", this.socketName, "has-session", "-t", session]).status !== 0) { this.command("tmux", ["-L", this.socketName, "new-session", "-d", "-s", session, "-c", cwd, "-x", "200", "-y", "50"]); this.logger.info?.(`[TmuxBackend] Created external tmux session "${session}" on socket "${this.socketName}"`); } }
  splitInExternalSession(session: string, spec: TeammateSpawnSpec): string { const result = this.command("tmux", ["-L", this.socketName, "split-window", "-h", "-P", "-F", "#{pane_id}", "-t", session, "-c", spec.cwd, "sh", "-c", this.buildShellCommand(spec)], { encoding: "utf-8" }); if (result.status !== 0) throw new Error(`Failed to create tmux pane: ${result.stderr}`); const pane = result.stdout.trim(); this.command("tmux", ["-L", this.socketName, "select-pane", "-t", pane, "-T", spec.name]); this.command("tmux", ["-L", this.socketName, "select-layout", "-t", session, "tiled"]); return pane; }
  buildShellCommand(spec: TeammateSpawnSpec): string { const env = `${ENV_SESSION_KIND}=teammate ${ENV_SESSION_NAME}=${this.shellEscape(`teammate-${spec.teamName}-${spec.name}`)} CODEBUDDY_GATEWAY_AUTH=none`, args = ["--serve", "--teammate-mode", "--team-name", this.shellEscape(spec.teamName), "--agent-name", this.shellEscape(spec.name), "--agent-type", this.shellEscape(spec.agentType)]; if (spec.parentSessionId) args.push("--parent-session-id", this.shellEscape(spec.parentSessionId)); if (spec.color) args.push("--agent-color", this.shellEscape(spec.color)); if (spec.leaderEndpoint) args.push("--leader-endpoint", this.shellEscape(spec.leaderEndpoint)); else args.push("-y"); if (spec.model) args.push("--model", this.shellEscape(spec.model)); if (spec.maxTurns) args.push("--max-turns", String(spec.maxTurns)); const entry = process.argv[1] ? `node ${this.shellEscape(process.argv[1])}` : "cbc"; return `env ${env} ${entry} ${args.join(" ")}`; }
  shellEscape(text: string): string { return `'${text.replace(/'/g, "'\\''")}'`; }
}
