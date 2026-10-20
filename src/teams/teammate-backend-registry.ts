import type { TeamLogger, TeammateBackend } from "./team-types.js";
export class TeammateBackendRegistry {
  constructor(readonly inProcessBackend: TeammateBackend, readonly detachedBackend: TeammateBackend, readonly tmuxBackend: TeammateBackend, readonly logger: TeamLogger = {}) {}
  async getBackend(preferred?: string): Promise<TeammateBackend> { if (preferred) { const backend = this.resolveBackend(preferred); if (backend && await backend.isAvailable()) return backend; this.logger.debug?.(`Backend "${preferred}" not available, falling back to auto-detect`); } return this.autoDetect(); }
  getAllBackends(): TeammateBackend[] { return [this.inProcessBackend, this.detachedBackend, this.tmuxBackend]; }
  async autoDetect(): Promise<TeammateBackend> { if (await this.inProcessBackend.isAvailable()) return this.inProcessBackend; if (await this.tmuxBackend.isAvailable()) { this.logger.info?.("In-process backend disabled, using tmux backend"); return this.tmuxBackend; } this.logger.info?.("In-process backend disabled, tmux not available, using detached-process backend"); return this.detachedBackend; }
  resolveBackend(type: string): TeammateBackend | undefined { switch (type) { case "in-process": return this.inProcessBackend; case "detached-process": return this.detachedBackend; case "tmux": return this.tmuxBackend; default: return; } }
}
