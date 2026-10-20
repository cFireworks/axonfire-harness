import type { ModelInputData, Runner } from "@openai/agents";
import type { ModelProvider } from "@openai/agents-core";
import type { AgentManager } from "../agents/agent-manager.js";
import type { ProductConfiguration } from "../config/product-config.js";
import type { HarnessSession } from "../sessions/session.js";
import type { SessionManager } from "../sessions/session-manager.js";
import type { SessionRunStateMachine } from "../sessions/run-state-machine.js";
import { CompactType } from "../context/compact-config.js";
import { createNativeRunnerHost } from "./native-runner-host.js";

export interface ToolCallLoopDetector {
  check(modelData: ModelInputData): ModelInputData | undefined | null;
}
export interface ContextCompactSummarizer {
  compactAndSummarize(
    session: HarnessSession,
    options: { force: true; type: CompactType.EMERGENCY_AUTO },
  ): Promise<void | boolean>;
}
export interface TelemetryService {
  reportUserTaskFailedCreditRefund(
    session: HarnessSession,
    reason: "loop_detected",
  ): Promise<void>;
}

/** Compatibility constructor only. Every Runner decision now uses the complete original class. */
export class RunnerFactory {
  readonly host: ReturnType<typeof createNativeRunnerHost>;
  constructor(
    modelProvider: ModelProvider,
    sessions: SessionManager,
    stateMachine: SessionRunStateMachine,
    agents: AgentManager,
    product: ProductConfiguration,
    loopDetector: ToolCallLoopDetector | undefined,
    compactor: ContextCompactSummarizer,
    telemetry?: TelemetryService,
    runtimeOptions: {
      tracingDisabled?: boolean;
      logger?: any;
      env?: Record<string, string | undefined>;
    } = {},
  ) {
    this.host = createNativeRunnerHost({
      modelProvider,
      sessionManager: sessions,
      stateMachine,
      agentManager: agents,
      productManager: { waitConfiguration: async () => product.raw },
      loopDetector,
      compactor,
      telemetryService: telemetry,
      env: runtimeOptions.env ?? process.env,
      ...(runtimeOptions.tracingDisabled === undefined
        ? {}
        : { tracingDisabled: runtimeOptions.tracingDisabled }),
      ...(runtimeOptions.logger ? { logger: runtimeOptions.logger } : {}),
    });
  }
  create(): Promise<Runner> {
    return this.host.factory.create();
  }
  checkAutoCompact(): Promise<void> {
    return this.host.factory.checkAutoCompact();
  }
  shouldCompact(session: HarnessSession): Promise<boolean> {
    return this.host.factory.shouldCompact(session, undefined);
  }
  close(): Promise<void> {
    return this.host.close();
  }
}
