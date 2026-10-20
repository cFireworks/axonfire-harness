import type { HarnessSession } from "../sessions/session.js";

export type HookDefinition = Record<string, unknown>;
export type HookMap = Record<string, HookDefinition[]>;

export type ScopedHookMetadata = {
  isAgent?: boolean;
  sourceLabel?: string;
};

export type HookExecutionResult = {
  allowed: boolean;
  message?: string;
  blocking?: boolean;
  stdout?: string;
  suppressOutput?: boolean;
  [key: string]: unknown;
};

export type HookExecutor = {
  hasHooks(
    event: string,
    sessionId?: string,
    scopedHooks?: readonly HookDefinition[],
  ): boolean | Promise<boolean>;
  executeHooks(
    event: string,
    input: Record<string, unknown>,
    scopedHooks?: readonly HookDefinition[],
  ): HookExecutionResult | Promise<HookExecutionResult>;
};

export type SessionHookLogger = {
  info?(message: string): void;
  warn?(message: string): void;
  error?(message: string, error?: unknown): void;
};

type ScopedRegistration = {
  hooks: HookMap;
  metadata: ScopedHookMetadata;
};

export class ScopedHookRegistry {
  private readonly registrations = new Map<string, ScopedRegistration>();

  register(
    sessionId: string,
    hooks: HookMap,
    metadata: ScopedHookMetadata = {},
  ): void {
    this.registrations.set(sessionId, { hooks, metadata });
  }

  unregister(sessionId: string): void {
    this.registrations.delete(sessionId);
  }

  get(sessionId: string, event?: string): readonly HookDefinition[] | HookMap {
    const registration = this.registrations.get(sessionId);
    if (!registration) return event ? [] : {};
    return event ? (registration.hooks[event] ?? []) : registration.hooks;
  }

  getMetadata(sessionId: string): ScopedHookMetadata | undefined {
    return this.registrations.get(sessionId)?.metadata;
  }
}

export class SessionHookManager {
  constructor(
    private readonly executor: HookExecutor,
    private readonly registry: ScopedHookRegistry,
    private readonly options: {
      cwd?: () => string;
      transcriptPath?: (session: HarnessSession) => string;
      productName?: string;
      logger?: SessionHookLogger;
      notifyTerminal?: (
        message: string,
        title: string,
        type: string,
        session?: HarnessSession,
      ) => void | Promise<void>;
    } = {},
  ) {}

  async executeSubagentStartHooks(session: HarnessSession): Promise<void> {
    const event = "SubagentStart";
    if (!(await this.hasHooks(event, session))) return;
    try {
      await this.execute(event, session, {
        ...this.baseInput(session, event),
      });
    } catch (error) {
      this.options.logger?.error?.(
        "SubagentStart hook execution failed:",
        error,
      );
    }
  }

  async executeSubagentStopHooks(
    session: HarnessSession,
    result?: unknown,
  ): Promise<void> {
    const event = "SubagentStop";
    if (!(await this.hasHooks(event, session))) return;
    const transcriptPath = this.getHookTranscriptPath(session);
    try {
      const last = this.extractLastAssistantMessage(session, result);
      const response = await this.execute(event, session, {
        ...this.baseInput(session, event),
        stop_hook_active: false,
        agent_transcript_path: transcriptPath,
        ...(last ? { last_assistant_message: last } : {}),
      });
      if (!response.allowed && response.message && response.blocking) {
        this.options.logger?.info?.(
          "SubagentStop hook requests continuation with message for subagent",
        );
        session.hookContexts ??= {};
        session.hookContexts.subagentStopHookFeedback = response.message;
      } else if (!response.allowed) {
        this.options.logger?.warn?.(
          `SubagentStop hook failed non-blockingly; not continuing: ${response.message ?? ""}`,
        );
      }
    } catch (error) {
      this.options.logger?.error?.(
        "SubagentStop hook execution failed:",
        error,
      );
    }
  }

  async executeTeammateIdleHooks(
    session: HarnessSession,
    context: { teammateName: string; teamName: string },
  ): Promise<void> {
    const event = "TeammateIdle";
    if (!(await this.hasHooks(event, session))) return;
    try {
      await this.execute(event, session, {
        ...this.baseInput(session, event),
        teammate_name: context.teammateName,
        team_name: context.teamName,
      });
    } catch (error) {
      this.options.logger?.error?.(
        "TeammateIdle hook execution failed:",
        error,
      );
    }
  }

  async executeNotificationHooks(
    session: HarnessSession | undefined,
    message: string,
    notificationType: string,
  ): Promise<void> {
    const title = this.options.productName ?? "CodeBuddy Code";
    try {
      await this.options.notifyTerminal?.(
        message,
        title,
        notificationType,
        session,
      );
    } catch (error) {
      this.options.logger?.warn?.(
        `Failed to send terminal notification: ${String(error)}`,
      );
    }
    const event = "Notification";
    if (!(await this.hasHooks(event, session))) return;
    try {
      await this.execute(event, session, {
        ...(session
          ? this.baseInput(session, event)
          : {
              session_id: "",
              transcript_path: "",
              cwd: this.options.cwd?.() ?? process.cwd(),
              hook_event_name: event,
            }),
        message,
        notification_type: notificationType,
        title,
      });
    } catch (error) {
      this.options.logger?.error?.(
        "Notification hook execution failed:",
        error,
      );
    }
  }

  private async hasHooks(
    event: string,
    session: HarnessSession | undefined,
  ): Promise<boolean> {
    const scoped = session
      ? (this.registry.get(session.id, event) as readonly HookDefinition[])
      : [];
    return this.executor.hasHooks(event, session?.id, scoped);
  }

  private async execute(
    event: string,
    session: HarnessSession | undefined,
    input: Record<string, unknown>,
  ): Promise<HookExecutionResult> {
    const scoped = session
      ? (this.registry.get(session.id, event) as readonly HookDefinition[])
      : [];
    return this.executor.executeHooks(event, input, scoped);
  }

  private baseInput(
    session: HarnessSession,
    event: string,
  ): Record<string, unknown> {
    return {
      session_id: resolveHookSessionId(session),
      session,
      transcript_path: this.getHookTranscriptPath(session),
      cwd: this.options.cwd?.() ?? process.cwd(),
      hook_event_name: event,
      ...buildAgentTrigger(session),
    };
  }

  private getHookTranscriptPath(session: HarnessSession): string {
    return this.options.transcriptPath?.(session) ?? "";
  }

  private extractLastAssistantMessage(
    session: HarnessSession,
    result?: unknown,
  ): string | undefined {
    if (result && typeof result === "object") {
      const finalOutput = (result as { finalOutput?: unknown }).finalOutput;
      if (typeof finalOutput === "string" && finalOutput.length > 0) {
        return finalOutput;
      }
    }
    for (let index = session.history.length - 1; index >= 0; index -= 1) {
      const item = session.history[index] as unknown as {
        type?: string;
        role?: string;
        content?: unknown;
      };
      if (item.type !== "message" || item.role !== "assistant") continue;
      if (typeof item.content === "string") return item.content;
      if (Array.isArray(item.content)) {
        const text = item.content
          .map((block) =>
            block && typeof block === "object"
              ? ((block as { text?: unknown }).text ?? "")
              : "",
          )
          .filter((value): value is string => typeof value === "string")
          .join("");
        if (text) return text;
      }
    }
    return undefined;
  }
}

export function buildAgentTrigger(
  session: HarnessSession | undefined,
): Record<string, string> {
  if (!session) return {};
  return {
    ...(session.agentName ? { agent_type: session.agentName } : {}),
    ...(session.storeId ? { agent_id: session.storeId } : {}),
  };
}

export function resolveHookSessionId(
  session: HarnessSession | undefined,
): string | undefined {
  if (!session) return undefined;
  const parent = session.meta.parentSessionId;
  return typeof parent === "string" ? parent : session.id;
}

export function isAgentAdminTrusted(
  agent: { tags?: string[] } | undefined,
): boolean {
  return Boolean(agent && !(agent.tags ?? []).includes("custom"));
}

export function shouldRegisterFrontmatterHooks(
  adminTrusted: boolean,
  allowUntrusted: boolean,
): boolean {
  return adminTrusted || allowUntrusted === true;
}
