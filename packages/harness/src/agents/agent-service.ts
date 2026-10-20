import {
  Agent,
  type AgentInputItem,
  type ModelSettings,
  type RunState,
  user,
} from "@openai/agents";
import { randomUUID } from "node:crypto";
import type { AgentManager } from "./agent-manager.js";
import type {
  AuthenticationManager,
  SettingsManager,
} from "../models/model-provider.js";
import { PermissionMode } from "../permissions/permission.js";
import type { HarnessSession } from "../sessions/session.js";
import type { SessionManager } from "../sessions/session-manager.js";
import type { SessionRunStateMachine } from "../sessions/run-state-machine.js";
import type { RunnerFactory } from "../runner/runner-factory.js";
import type { InterruptionService } from "../permissions/interruption-service.js";
import { HistoryAgentRunInterceptor } from "./history-agent-run-interceptor.js";

export const DEFAULT_MAX_TURNS = 500;
export const AGENT_RUN_INTERCEPTOR_HISTORY_PRIORITY = 1_400;

export type AgentRunOptions = {
  context?: HarnessSession;
  maxTurns?: number;
  stream?: true;
  signal?: AbortSignal;
  bypassMessageQueue?: boolean;
  [key: string]: unknown;
};

export type AgentRunContext = {
  input:
    | string
    | AgentInputItem[]
    | RunState<HarnessSession, Agent<HarnessSession>>;
  agent: Agent<HarnessSession>;
  session: HarnessSession;
  agentOptions: AgentRunOptions;
  skipRun: boolean;
  bypassMessageQueue: boolean;
  skipAddHistory?: boolean;
};

export interface AgentRunInterceptor {
  priority: number;
  intercept(context: AgentRunContext): Promise<void>;
}

export interface PluginRuntimeRefreshService {
  waitForRefreshSettled(): Promise<void>;
}

export type OneTimeOverrides = {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  bypassPermissions?: boolean;
  model?: string;
  maxTurns?: number;
};

export class AgentService {
  private runnerPromise?: ReturnType<RunnerFactory["create"]>;
  private readonly logger={warn(..._args:any[]) {}};

  constructor(
    private readonly authentication: AuthenticationManager,
    private readonly settings: SettingsManager,
    private readonly runnerFactory: RunnerFactory,
    private readonly sessions: SessionManager,
    private readonly stateMachine: SessionRunStateMachine,
    private readonly agents: AgentManager,
    private readonly interceptors: AgentRunInterceptor[] = [],
    private readonly pluginRuntimeRefresh?: PluginRuntimeRefreshService,
    private readonly interruptions?: InterruptionService,
  ) {}

  async run(
    agent: Agent<HarnessSession>,
    input:
      | string
      | AgentInputItem[]
      | RunState<HarnessSession, Agent<HarnessSession>>,
    options: AgentRunOptions = {},
  ): Promise<void> {
    // Dynamic schemas and prompt initializers resolve SessionManager.getCurrent()
    // before runner.run(), including child runs that inherit a parent's async scope.
    if (options.context && this.sessions.getCurrent() !== options.context) return this.sessions.run(options.context, () => this.run(agent, input, options));
    await this.authentication.initialized;
    const runner = await (this.runnerPromise ??= this.runnerFactory.create());
    const controller = new AbortController();
    const envMaxTurns = Number(process.env.CODEBUDDY_CODE_MAX_TURNS);
    const agentOptions: AgentRunOptions = {
      maxTurns:
        Number.isFinite(envMaxTurns) && envMaxTurns > 0
          ? envMaxTurns
          : DEFAULT_MAX_TURNS,
      stream: true,
      ...options,
      signal: controller.signal,
    };
    const bypassMessageQueue = agentOptions.bypassMessageQueue === true;
    delete agentOptions.bypassMessageQueue;
    const session = options.context ?? (await this.sessions.create());
    this.sessions.ensureRunResultHandler(session);
    await this.interruptions?.waitFor(session);
    const previousController = session.abortController;
    const previousWasAborted = previousController.signal.aborted;
    session.lastCancelledQueue = undefined;
    session.abortController = controller;
    session.abortSignal = controller.signal;
    controller.signal.addEventListener(
      "abort",
      () => {
        if (!previousController.signal.aborted) previousController.abort();
      },
      { once: true },
    );

    const runContext: AgentRunContext = {
      input: typeof input === "string" ? [user(input)] : input,
      agent,
      session,
      agentOptions,
      skipRun: false,
      bypassMessageQueue,
    };
    let ownsLifecycle = false;
    if (!bypassMessageQueue || this.stateMachine.isIdle(session)) {
      const before = this.stateMachine.getSnapshot(session).status;
      const after = this.stateMachine.transition(session, "run_preparing");
      ownsLifecycle = before === "idle" && after === "preparing";
    }

    const configuredInterceptors = [...this.interceptors];
    if (!configuredInterceptors.some((interceptor) => interceptor.priority === AGENT_RUN_INTERCEPTOR_HISTORY_PRIORITY)) {
      configuredInterceptors.push(new HistoryAgentRunInterceptor(this.sessions));
    }
    const ordered = configuredInterceptors.sort((a, b) => b.priority - a.priority);
    const historyIndex = ordered.findIndex(
      (interceptor) =>
        interceptor.priority === AGENT_RUN_INTERCEPTOR_HISTORY_PRIORITY,
    );
    let joinedPluginRefresh = false;
    for (let index = 0; index < ordered.length; index += 1) {
      try {
        await ordered[index]!.intercept(runContext);
      } catch (error) {
        this.stateMachine.transition(session, "run_failed");
        throw error;
      }
      if (index === historyIndex && !runContext.skipRun) {
        await this.joinPluginRuntimeRefreshForRun(runContext);
        joinedPluginRefresh = true;
      }
    }
    if (runContext.skipRun) {
      if (ownsLifecycle) this.stateMachine.transition(session, "run_skipped");
      const hasQueuedInput = session.queue.length > 0;
      if (
        this.stateMachine.isIdle(session) &&
        !previousWasAborted &&
        hasQueuedInput
      ) {
        setImmediate(() => {
          void this.runDefault([], { context: session });
        });
      }
      return;
    }
    if (!joinedPluginRefresh)
      await this.joinPluginRuntimeRefreshForRun(runContext);
    await this.agents.ensureAgentToolsFreshForRun(runContext.agent.name, session, controller.signal,this.agents.isManagedAgentInstance(runContext.agent)?runContext.agent:undefined);

    await this.sessions.run(session, async () => {
      const result = await runner.run(runContext.agent, runContext.input, {
        ...(agentOptions as any),
        context: session,
        stream: true,
        signal: controller.signal,
      });
      session.resultAbortSignalMap.set(result, controller.signal);
      session.state = result.state;
      session.resultSubject.next(result);
    });
  }

  /** Native 7192992 resolveAgentForSession; unknown names return to the default agent. */
  async resolveAgentForSession(session?:HarnessSession):Promise<Agent<HarnessSession>>{
    const name=session?.agentName||session?.meta?.agentName,defaultName=this.agents.getDefaultAgentName();
    if(name&&name!==defaultName)try{const agent=await this.agents.get(String(name));if(agent)return agent;this.logger.warn(`[AgentService] Agent "${name}" not found for session ${session?.id}, falling back to default agent`);}catch(error){this.logger.warn(`[AgentService] Error resolving agent "${name}" for session ${session?.id}, falling back to default agent:`,error);}
    return this.agents.getDefault();
  }
  async runDefault(
    input: string | AgentInputItem[],
    options: AgentRunOptions = {},
  ): Promise<void> {
    if (options.context && this.sessions.getCurrent() !== options.context) return this.sessions.run(options.context, () => this.runDefault(input, options));
    const agent = await this.resolveAgentForSession(options.context);
    return this.run(agent, input, options);
  }

  async runOneTime(
    agentName: string,
    input: string | AgentInputItem[],
    options: AgentRunOptions = {},
  ): Promise<string> {
    await this.waitForPluginRuntimeRefresh();
    const session = options.context ?? (await this.sessions.create());
    const agent = await this.agents.get(agentName, { session });
    if(!agent)throw Error(`Failed find agent [${agentName}]`);
    agent.model = (await this.agents.getModel(agentName)).id;
    const previousRequestId = session.conversationRequestId;
    session.conversationRequestId = randomUUID().replace(/-/g, "");
    try {
      return await this.consumeOneTime(
        agentName,
        agent,
        input,
        session,
        options,
      );
    } finally {
      if (previousRequestId === undefined) delete session.conversationRequestId;
      else session.conversationRequestId = previousRequestId;
    }
  }

  async runOneTimeWithOverrides(
    agentName: string,
    input: string | AgentInputItem[],
    overrides: OneTimeOverrides,
    options: AgentRunOptions = {},
  ): Promise<string> {
    await this.waitForPluginRuntimeRefresh();
    const original = await this.agents.get(
      agentName,
      options.context ? { session: options.context } : {},
    );
    if(!original)throw Error(`Failed find agent [${agentName}]`);
    const modelSettings: ModelSettings = { ...original.modelSettings };
    if (overrides.temperature !== undefined)
      modelSettings.temperature = overrides.temperature;
    if (overrides.maxTokens !== undefined)
      modelSettings.maxTokens = overrides.maxTokens;
    if (overrides.stopSequences !== undefined) {
      modelSettings.providerData = {
        ...modelSettings.providerData,
        stop: overrides.stopSequences,
      };
    }
    const agent = original.clone({
      instructions: overrides.systemPrompt ?? original.instructions,
      modelSettings,
    });
    const session = options.context ?? (await this.sessions.create());
    if (overrides.bypassPermissions) {
      session.permissionModeSubject.next(PermissionMode.BypassPermissions);
    }
    const configured = overrides.model?.trim();
    agent.model =
      (configured && (await this.agents.resolveModel(configured))?.id) ??
      (await this.agents.getModel(agentName)).id;
    return this.consumeOneTime(agentName, agent, input, session, {
      ...options,
      maxTurns: overrides.maxTurns ?? DEFAULT_MAX_TURNS,
    });
  }

  async runForked(
    agentName: string,
    input: string | AgentInputItem[],
    source: HarnessSession,
    options: { disableTools?: boolean; maxTurns?: number } = {},
  ): Promise<string> {
    await this.waitForPluginRuntimeRefresh();
    const original = await this.agents.get(agentName, { session: source });
    if(!original)throw Error(`Failed find agent [${agentName}]`);
    const agent = options.disableTools
      ? original.clone({ tools: [] })
      : original;
    agent.model = (await this.agents.getModel(agentName)).id;
    const history = prepareForkHistory(source.history);
    const combined = [
      ...history,
      ...(typeof input === "string" ? [user(input)] : input),
    ];
    const fork = await this.sessions.create();
    const text = await this.consumeOneTime(agentName, agent, combined, fork, {
      maxTurns: options.maxTurns ?? 1,
    });
    const result = fork.resultSubject.value as any;
    for (const response of result?.rawResponses ?? []) {
      if (response.usage) source.usage.add(response.usage);
    }
    return text;
  }

  async runTransientAgent(
    agent: Agent<HarnessSession>,
    input: string | AgentInputItem[],
    session: HarnessSession,
    options: AgentRunOptions & { bypassPermissions?: boolean } = {},
  ): Promise<string> {
    if (options.bypassPermissions) {
      session.permissionModeSubject.next(PermissionMode.BypassPermissions);
    }
    return this.consumeOneTime(agent.name, agent, input, session, options);
  }

  private async consumeOneTime(
    agentName: string,
    agent: Agent<HarnessSession>,
    input: string | AgentInputItem[],
    session: HarnessSession,
    options: AgentRunOptions,
  ): Promise<string> {
    const runner = await (this.runnerPromise ??= this.runnerFactory.create());
    const controller = new AbortController();
    const previousController = session.abortController;
    session.abortController = controller;
    session.abortSignal = controller.signal;
    if (previousController.signal.aborted) controller.abort();
    const externalAbort = (): void => controller.abort();
    options.signal?.addEventListener("abort", externalAbort, { once: true });
    if (options.signal?.aborted) controller.abort();
    controller.signal.addEventListener(
      "abort",
      () => !previousController.signal.aborted && previousController.abort(),
      { once: true },
    );
    const previousPurpose = session.agentPurpose;
    session.agentPurpose ??= agentName;
    try {
      return await this.sessions.runWithoutHistory(() => this.sessions.run(session, async () => {
        const result = (await runner.run(
          agent,
          typeof input === "string" ? [user(input)] : input,
          {
            ...(options as any),
            context: session,
            stream: true,
            signal: controller.signal,
          },
        )) as any;
        session.resultSubject.next(result);
        let output = "";
        for await (const chunk of result.toTextStream()) output += chunk;
        for (const response of result.rawResponses) {
          if (response.usage) session.usage.add(response.usage);
        }
        return output;
      }));
    } finally {
      options.signal?.removeEventListener("abort", externalAbort);
      if (previousPurpose === undefined) delete session.agentPurpose;
      else session.agentPurpose = previousPurpose;
    }
  }

  private async waitForPluginRuntimeRefresh(): Promise<void> {
    await this.pluginRuntimeRefresh?.waitForRefreshSettled();
  }

  private async joinPluginRuntimeRefreshForRun(
    context: AgentRunContext,
  ): Promise<void> {
    const managed = this.agents.isManagedAgentInstance(context.agent);
    await this.waitForPluginRuntimeRefresh();
    if (!managed) return;
    const refreshed = await this.agents.get(context.agent.name, {
      session: context.session,
    });
    if (refreshed&&refreshed.name===context.agent.name&&this.agents.isManagedAgentInstance(refreshed))
      context.agent = refreshed;
  }
}

function prepareForkHistory(history: AgentInputItem[]): AgentInputItem[] {
  const result = [...history];
  const last = result.at(-1) as any;
  if (
    last?.type === "message" &&
    last.role === "assistant" &&
    last.status === "in_progress"
  ) {
    result.pop();
  }
  const validCallIds = new Set<string>();
  for (const item of result as any[]) {
    if (item.type === "function_call" && (item.callId ?? item.call_id)) {
      validCallIds.add(item.callId ?? item.call_id);
    }
  }
  return (result as any[]).filter((item) => {
    if (item.providerData?.truncated || item.providerData?.taskOnly)
      return false;
    if (
      item.type === "function_call_result" ||
      item.type === "function_call_output"
    ) {
      return validCallIds.has(item.callId ?? item.call_id);
    }
    return true;
  }) as AgentInputItem[];
}
