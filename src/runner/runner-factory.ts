import {
  Runner,
  type AgentInputItem,
  type ModelInputData,
} from "@openai/agents";
import type { AgentManager } from "../agents/agent-manager.js";
import type { ProductConfiguration } from "../config/product-config.js";
import type { ModelProvider } from "@openai/agents-core";
import type { HarnessSession } from "../sessions/session.js";
import type { SessionManager } from "../sessions/session-manager.js";
import type { SessionRunStateMachine } from "../sessions/run-state-machine.js";
import { filterTruncatedToolCalls } from "./history-repair.js";
import { CompactType, getAutocompactThresholdOverride, resolveCompactTriggerAt } from "../context/compact-config.js";
import { estimateTrailingToolResultTokens, hasMeaningfulNewHistorySinceLastCompact } from "../sessions/history-utils.js";

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

export class RunnerFactory {
  constructor(
    private readonly modelProvider: ModelProvider,
    private readonly sessions: SessionManager,
    private readonly stateMachine: SessionRunStateMachine,
    private readonly agents: AgentManager,
    private readonly product: ProductConfiguration,
    private readonly loopDetector: ToolCallLoopDetector,
    private readonly compactor: ContextCompactSummarizer,
    private readonly telemetry?: TelemetryService,
    private readonly runtimeOptions: { tracingDisabled?: boolean } = {},
  ) {}

  async create(): Promise<Runner> {
    const runner = new Runner({
      ...this.runtimeOptions,
      modelProvider: this.modelProvider,
      callModelInputFilter: async ({ modelData }) => {
        const loopRecovery = this.loopDetector.check(modelData);
        if (loopRecovery) {
          const session =
            this.sessions.getCurrent() ?? this.sessions.sessionSubject.value;
          if (session && this.telemetry) {
            await this.telemetry
              .reportUserTaskFailedCreditRefund(session, "loop_detected")
              .catch(() => undefined);
          }
          return loopRecovery;
        }
        await this.checkAutoCompact();
        const session =
          this.sessions.getCurrent() ?? this.sessions.sessionSubject.value;
        const repaired = filterTruncatedToolCalls(
          modelData,
          session?.meta.lastFinishReason as string | undefined,
        );
        if (session && !isAuxiliaryPurpose(session.agentPurpose)) {
          this.stateMachine.transition(session, "model_request_started");
        }
        return repaired;
      },
    });
    return runner;
  }

  async checkAutoCompact(): Promise<void> {
    const session =
      this.sessions.getCurrent() ?? this.sessions.sessionSubject.value;
    if (!session || !(await this.shouldCompact(session))) return;
    setImmediate(() => {
      void this.compactor.compactAndSummarize(session, {
        force: true,
        type: CompactType.EMERGENCY_AUTO,
      }).catch(() => undefined);
    });
  }

  async shouldCompact(session: HarnessSession): Promise<boolean> {
    if (session.isCompressing || session.abortSignal.aborted) return false;
    if (
      session.lastCompactTimestamp &&
      Date.now() - session.lastCompactTimestamp < 30_000
    ) {
      return false;
    }
    if (session.history.length === 0) return false;
    const result = session.resultSubject.value as any;
    if (result?.lastAgent?.name === "compact") return false;

    const isSubAgent = Boolean(
      session.meta.parentSessionId || session.meta.taskId,
    );
    const thresholds = this.product.raw.tokenUsageThresholds?.inputTokens;
    const threshold =
      getAutocompactThresholdOverride() ??
      (isSubAgent ? thresholds?.subAgentEmergency : undefined) ??
      thresholds?.emergency ??
      0.92;
    const latestUsage = latestInputTokens(session);
    const tokens =
      latestUsage + (latestUsage > 0 ? estimateTrailingToolResultTokens(session.history) : 0);
    const agentName =
      session.agentName ??
      result?.lastAgent?.name ??
      this.agents.getDefaultAgentName();
    const model = await this.agents.getModel(agentName);
    const triggerAt = resolveCompactTriggerAt(model.maxInputTokens, threshold);
    if (triggerAt <= 0 || tokens < triggerAt) return false;
    if (!hasMeaningfulNewHistorySinceLastCompact(session.history)) return false;
    if (
      !isSubAgent &&
      result?.lastAgent?.name !== this.agents.getDefaultAgentName()
    ) {
      return false;
    }
    return true;
  }
}

function latestInputTokens(session: HarnessSession): number {
  const result = session.resultSubject.value as any;
  const responses = result?.rawResponses as any[] | undefined;
  for (let index = (responses?.length ?? 0) - 1; index >= 0; index -= 1) {
    const value = responses?.[index]?.usage?.inputTokens;
    if (typeof value === "number") return value;
  }
  return session.usage.inputTokens;
}

function isAuxiliaryPurpose(value: string | undefined): boolean {
  return [
    "summary", "webfetch", "conversation_topic", "memory_selection", "insights", "prompt_hook",
    "agent_instructions", "prompt_suggestion", "memory_extraction", "auto_mode_classifier", "context_summary_pre_message",
  ].includes(value ?? "");
}
