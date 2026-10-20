import type { HarnessSession } from "../sessions/session.js";
type Emitter = { on(listener: (event: any) => void): () => void };
type Logger = { debug?(message: string): void; warn?(message: string): void };
export type WorkflowEventWriter = { write(text: string): unknown };
export type WorkflowAcpAgentManager = {
  get(
    id: string,
  ):
    | {
        getConnection?():
          | {
              sessionUpdate?(input: {
                sessionId: string;
                update: {
                  sessionUpdate: "session_info_update";
                  _meta: Record<string, unknown>;
                };
              }): unknown;
            }
          | undefined;
      }
    | undefined;
};
/** Native 8893656..8895753. Uses current async session, not event ownership. */
export class WorkflowAcpBridge {
  private unsubscribe: (() => void) | undefined;
  constructor(
    readonly emitter: Emitter | undefined,
    readonly sessionManager: { getCurrent(): HarnessSession | undefined },
    readonly getAgentManager: () => WorkflowAcpAgentManager,
    readonly logger: Logger = {},
  ) {}
  install(): void {
    if (this.unsubscribe || !this.emitter) return;
    if (typeof this.emitter.on === "function") {
      this.unsubscribe = this.emitter.on((event) => this.dispatch(event));
      this.logger.debug?.(
        "[WorkflowAcpBridge] subscribed to workflow progress",
      );
    }
  }
  dispose(): void {
    if (this.unsubscribe) {
      try {
        this.unsubscribe();
      } catch {}
      this.unsubscribe = undefined;
    }
  }
  dispatch(event: any): void {
    const session = this.resolveSession(),
      id = session?.meta?.acpConnectionId;
    if (id && session)
      void this.send(id as string, session.id, event).catch((error) =>
        this.logger.warn?.(
          `[WorkflowAcpBridge] dispatch failed: ${error.message}`,
        ),
      );
  }
  resolveSession(): HarnessSession | undefined {
    try {
      return this.sessionManager.getCurrent();
    } catch {
      return;
    }
  }
  async send(
    connectionId: string,
    sessionId: string,
    event: any,
  ): Promise<void> {
    let manager;
    try {
      manager = this.getAgentManager();
    } catch {
      return;
    }
    const agent = manager.get(connectionId);
    if (!agent) return;
    const connection = agent.getConnection?.();
    if (!connection || typeof connection.sessionUpdate !== "function") return;
    await connection.sessionUpdate({
      sessionId,
      update: {
        sessionUpdate: "session_info_update",
        _meta: this.toMeta(event),
      },
    });
  }
  toMeta(event: any): Record<string, unknown> {
    const meta: Record<string, unknown> = {
      "codebuddy.ai/workflowEventKind": event.kind,
    };
    switch (event.kind) {
      case "workflow_run_started":
      case "workflow_run_finished":
        meta["codebuddy.ai/workflowRunId"] = event.record.runId;
        meta["codebuddy.ai/workflowName"] = event.record.name;
        meta["codebuddy.ai/workflowStatus"] = event.record.status;
        meta["codebuddy.ai/workflowAgentCount"] = event.record.agentCount;
        meta["codebuddy.ai/workflowCachedCount"] =
          event.record.cachedAgentCount;
        meta["codebuddy.ai/workflowPhaseCount"] = event.record.phaseCount;
        if (event.record.error !== undefined)
          meta["codebuddy.ai/workflowError"] = event.record.error;
        break;
      case "workflow_phase_started":
      case "workflow_phase_finished":
        meta["codebuddy.ai/workflowRunId"] = event.runId;
        meta["codebuddy.ai/workflowPhase"] = event.phase;
        break;
      case "workflow_agent_started":
      case "workflow_agent_finished":
      case "workflow_agent_cached":
        meta["codebuddy.ai/workflowRunId"] = event.runId;
        meta["codebuddy.ai/workflowAgentKey"] = event.agent.key;
        for (const [field, suffix] of [
          ["label", "Label"],
          ["phase", "Phase"],
          ["error", "Error"],
          ["tokens", "Tokens"],
        ] as const)
          if (event.agent[field] !== undefined)
            meta[`codebuddy.ai/workflowAgent${suffix}`] = event.agent[field];
    }
    return meta;
  }
}
/** Native 8897019..8898409. Host must explicitly install; no mode gate here. */
export class WorkflowPrintModeHandler {
  private unsubscribe: (() => void) | undefined;
  writer: WorkflowEventWriter = {
    write(text) {
      process.stdout.write(text);
    },
  };
  constructor(
    readonly emitter?: Emitter,
    readonly logger: Logger = {},
  ) {}
  setWriter(writer: WorkflowEventWriter): void {
    this.writer = writer;
  }
  install(): void {
    if (this.unsubscribe || !this.emitter) return;
    if (typeof this.emitter.on === "function") {
      this.unsubscribe = this.emitter.on((event) => this.printEvent(event));
      this.logger.debug?.("[WorkflowPrintModeHandler] installed");
    }
  }
  dispose(): void {
    if (this.unsubscribe) {
      try {
        this.unsubscribe();
      } catch {}
      this.unsubscribe = undefined;
    }
  }
  printEvent(event: any): void {
    const text = JSON.stringify(this.toJsonRecord(event)) + "\n";
    try {
      this.writer.write(text);
    } catch (error) {
      this.logger.warn?.(
        `[WorkflowPrintModeHandler] write failed: ${(error as Error).message}`,
      );
    }
  }
  toJsonRecord(event: any): Record<string, unknown> {
    const record: Record<string, unknown> = {
      type: "workflow",
      kind: event.kind,
    };
    switch (event.kind) {
      case "workflow_run_started":
      case "workflow_run_finished":
        record.runId = event.record.runId;
        record.name = event.record.name;
        record.status = event.record.status;
        record.agentCount = event.record.agentCount;
        record.cachedAgentCount = event.record.cachedAgentCount;
        record.phaseCount = event.record.phaseCount;
        if (event.record.error !== undefined) record.error = event.record.error;
        break;
      case "workflow_phase_started":
      case "workflow_phase_finished":
        record.runId = event.runId;
        record.phase = event.phase;
        break;
      case "workflow_agent_started":
      case "workflow_agent_finished":
      case "workflow_agent_cached":
        record.runId = event.runId;
        record.key = event.agent.key;
        for (const field of ["label", "phase", "error", "tokens"])
          if (event.agent[field] !== undefined)
            record[field] = event.agent[field];
        if (event.agent.cached) record.cached = true;
    }
    return record;
  }
}
