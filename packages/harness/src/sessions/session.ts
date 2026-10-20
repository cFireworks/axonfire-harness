import type {
  Agent,
  AgentInputItem,
  RunState,
  RunToolApprovalItem,
} from "@openai/agents-core";
import { BehaviorSubject, Subject } from "rxjs";
import { PermissionMode } from "../permissions/permission.js";
import { createNativePermissionUtils } from "../permissions/native-permission-utils.js";
import type { ToolPermissionContext } from "../permissions/native-permission-policy.js";
import type { ToolDeferOverlayValue } from "../tools/tool-defer-overlay.js";
import type { ProductBackgroundTask } from "../tools/background-task-registry.js";

import type { SessionRunState, SessionRunStatus } from "./run-state-types.js";
export { SessionRunStatus } from "./run-state-types.js";
const NativePermissionDefaults = createNativePermissionUtils({});

export type SessionOptions = {
  model?: string;
  tools?: string;
  outputStyle?: string;
  workDir?: string;
  disallowedTools?: string[];
  toolDeferOverlay?: ToolDeferOverlayValue;
  [key: string]: unknown;
};

export type SessionRequestOptions = {
  model?: string;
  allowedTools?: string[];
  providerData?: Record<string, unknown>;
  headers?: Record<string, string>;
  growthEventRequestId?: string;
  [key: string]: unknown;
};

export class UsageAccumulator {
  inputTokens = 0;
  outputTokens = 0;
  totalTokens = 0;

  add(value: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  }): void {
    this.inputTokens += value.inputTokens ?? 0;
    this.outputTokens += value.outputTokens ?? 0;
    this.totalTokens +=
      value.totalTokens ?? (value.inputTokens ?? 0) + (value.outputTokens ?? 0);
  }
}

export class HarnessSession {
  readonly conditionalRules = {pendingTriggers:new Set<string>(),processedRules:new Set<string>()};
  readonly backgroundTaskSubject = new Subject<ProductBackgroundTask>();
  createdAt = Date.now();
  updatedAt = Date.now();
  readonly historyReloadSubject = new Subject<{ reason: string }>();
  readonly progressSubject = new BehaviorSubject<string | undefined>(undefined);
  readonly resultSubject = new BehaviorSubject<unknown>(undefined);
  readonly inputSubject = new Subject<
    AgentInputItem & {
      providerData?: (Record<string, unknown> & {
        usage?: {
          inputTokens?: number;
          outputTokens?: number;
          totalTokens?: number;
        };
      }) | undefined;
      _fromSubAgent?: boolean;
    }
  >();
  readonly modelSubject = new Subject<unknown>();
  readonly phaseSubject = new BehaviorSubject<{
    phase: string | undefined;
    [key: string]: unknown;
  }>({ phase: "idle", startedAt: Date.now() });
  readonly interruptionSubject = new BehaviorSubject<
    RunToolApprovalItem | undefined
  >(undefined);
  readonly combineSubject = new Subject<{
    type: string;
    data: unknown;
    hasInterruptions?: boolean;
    parentToolUseId?: string;
  }>();
  readonly permissionModeSubject = new BehaviorSubject<PermissionMode>(
    PermissionMode.Default,
  );
  readonly resultAbortSignalMap = new WeakMap<object, AbortSignal>();
  readonly usage = new UsageAccumulator();
  state?: RunState<HarnessSession, Agent<HarnessSession>>;
  agentState: string | undefined;
  activeRunContext: unknown;
  headlessCompletionDeferred?: { resolve(): void };
  readonly agentStateSubject = new BehaviorSubject<string | undefined>(undefined);
  readonly runStateSubject = new BehaviorSubject<SessionRunState>({ status: "idle" });
  get runState(): SessionRunState { return this.runStateSubject.value; }
  set runState(value: SessionRunState) { const next = value ?? { status: "idle" as const }, previous = this.runStateSubject.value; if (previous !== next && (previous.status !== next.status || previous.lastTransition?.at !== next.lastTransition?.at)) this.runStateSubject.next(next); }
  toolPermissionContext: ToolPermissionContext = NativePermissionDefaults.createDefaultToolPermissionContext();
  permissionDenials?: Array<{
    tool_name: string;
    tool_use_id: string;
    tool_input: unknown;
  }>;
  preToolUseHookResults?: Map<
    string,
    { permissionDecision?: string; permissionDecisionReason?: string; allowed?: boolean; message?: string }
  >;
  history: AgentInputItem[] = [];
  queue: AgentInputItem[] = [];
  readonly queueSubject = new BehaviorSubject<AgentInputItem[]>([]);
  /** Earlier host compatibility; native state is owned by runStateSubject. */
  get status(): SessionRunStatus { return this.runState.status; }
  set status(status: SessionRunStatus) { this.runState = { status }; }
  requestOptions: SessionRequestOptions = {};
  options: SessionOptions = {};
  meta: Record<string, unknown> = {};
  teamCancelled?: boolean;
  abortController = new AbortController();
  abortSignal = this.abortController.signal;
  isCompressing = false;
  lastCompactTimestamp?: number;
  lastMessageId?: string;
  lastUserMessageId?: string;
  hasCompactedHistory?: boolean;
  compactMessageGeneration = 0;
  consecutiveMaxTokenCompactCount = 0;
  lastCancelledQueue?: unknown;
  agentPurpose?: string;
  agentName?: string;
  command?: import("../commands/types.js").ProductCommand;
  originalUserIntent?: string;
  structuredOutput?: unknown;
  hookContexts?: {
    subagentStopHookFeedback?: string;
    continueRequest?: unknown;
    [key: string]: unknown;
  };
  storeId?: string;
  conversationRequestId?: string;
  messageId?: string;
  traceId?: string;
  interceptorGate?: {completed:Promise<boolean>;resolve(value:boolean):void};
  promptRequestId?: string;
  telemetry?: {
    modelId?:string;modelName?:string;currentTurn?:number;traceId?:string;
    chunkId?: string;
    firstTokenAt?: number;
    clientSendTime?: number;
    promptStartTime?: number;
    messageTtfbReported?: boolean;
  };

  constructor(
    readonly id: string,
    seed: Partial<HarnessSession> = {},
  ) {
    Object.assign(this, seed);
  }
}
