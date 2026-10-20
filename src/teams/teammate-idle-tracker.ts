export const TEAMMATE_MAX_RECENT_ACTIVITIES = 10;

export function isTeammateIdleDetectionDisabled(): boolean {
  return process.env.CODEBUDDY_TEAM_IDLE_DETECTION_DISABLED === "1";
}

export type TeammateActivity = {
  toolName: string;
  input: unknown;
  at: number;
};

export type TeammateIdleSnapshot = {
  teamName: string;
  teammateName: string;
  isIdle: boolean;
  alive: boolean;
  lastEndedAt: number;
  lastBusyAt: number;
  awaitingApprovalRequestId?: string;
  progress: {
    toolUseCount: number;
    tokenCount: number;
    recentActivities: TeammateActivity[];
  };
};

export type TeammateIdleLogger = {
  debug?(message: string): void;
  warn?(message: string, error?: unknown): void;
};

type IdleRecord = {
  teamName: string;
  teammateName: string;
  isIdle: boolean;
  alive: boolean;
  lastEndedAt: number;
  lastBusyAt: number;
  awaitingApprovalRequestId?: string;
  callbacks: Array<() => void>;
  toolUseCount: number;
  tokenCount: number;
  recentActivities: TeammateActivity[];
};

export class TeammateIdleTracker {
  private readonly records = new Map<string, IdleRecord>();

  constructor(private readonly logger: TeammateIdleLogger = {}) {}

  register(teamName: string, teammateName: string): void {
    if (isTeammateIdleDetectionDisabled()) return;
    const key = this.keyOf(teamName, teammateName);
    if (this.records.has(key)) return;
    this.records.set(key, {
      teamName,
      teammateName,
      isIdle: false,
      alive: true,
      lastEndedAt: 0,
      lastBusyAt: 0,
      callbacks: [],
      toolUseCount: 0,
      tokenCount: 0,
      recentActivities: [],
    });
    this.logger.debug?.(`[TeammateIdle] register ${key}`);
  }

  unregister(teamName: string, teammateName: string): void {
    const key = this.keyOf(teamName, teammateName);
    const record = this.records.get(key);
    if (!record) return;
    record.alive = false;
    const callbacks = record.callbacks.splice(0);
    this.records.delete(key);
    for (const callback of callbacks) this.scheduleCallback(callback, true);
    this.logger.debug?.(`[TeammateIdle] unregister ${key}`);
  }

  markAgentEnd(
    teamName: string,
    teammateName: string,
    _sessionId: string,
    hasQueuedWork = false,
  ): void {
    if (isTeammateIdleDetectionDisabled()) return;
    const record = this.records.get(this.keyOf(teamName, teammateName));
    if (!record?.alive) return;
    record.lastEndedAt = Date.now();
    if (hasQueuedWork) {
      record.isIdle = false;
      return;
    }
    if (record.isIdle) return;
    record.isIdle = true;
    for (const callback of record.callbacks.splice(0)) {
      this.scheduleCallback(callback, false);
    }
  }

  markBusy(
    teamName: string,
    teammateName: string,
    _sessionId: string,
  ): void {
    if (isTeammateIdleDetectionDisabled()) return;
    const record = this.records.get(this.keyOf(teamName, teammateName));
    if (!record?.alive) return;
    record.isIdle = false;
    record.lastBusyAt = Date.now();
  }

  getState(
    teamName: string,
    teammateName: string,
  ): TeammateIdleSnapshot | undefined {
    const record = this.records.get(this.keyOf(teamName, teammateName));
    return record ? this.toSnapshot(record) : undefined;
  }

  getAllInTeam(teamName: string): TeammateIdleSnapshot[] {
    const result: TeammateIdleSnapshot[] = [];
    for (const record of this.records.values()) {
      if (record.teamName === teamName && record.alive) {
        result.push(this.toSnapshot(record));
      }
    }
    return result;
  }

  getWorkingTeammates(teamName: string): string[] {
    return [...this.records.values()]
      .filter(
        (record) =>
          record.teamName === teamName && record.alive && !record.isIdle,
      )
      .map((record) => record.teammateName);
  }

  async waitForIdle(
    teamName: string,
    teammateName: string,
    options?: { timeoutMs?: number; signal?: AbortSignal },
  ): Promise<boolean> {
    if (isTeammateIdleDetectionDisabled()) return true;
    const record = this.records.get(this.keyOf(teamName, teammateName));
    if (!record?.alive) return false;
    if (record.isIdle) {
      await Promise.resolve();
      return true;
    }
    return new Promise<boolean>((resolve) => {
      let timeout: NodeJS.Timeout | undefined;
      let settled = false;
      const settle = (value: boolean): void => {
        if (settled) return;
        settled = true;
        if (timeout) clearTimeout(timeout);
        if (abort && options?.signal)
          options.signal.removeEventListener("abort", abort);
        resolve(value);
      };
      const callback = (): void => {
        const current = this.records.get(this.keyOf(teamName, teammateName));
        settle(Boolean(current?.isIdle && current.alive));
      };
      const removeCallback = (): void => {
        const index = record.callbacks.indexOf(callback);
        if (index >= 0) record.callbacks.splice(index, 1);
      };
      const abort = options?.signal
        ? () => {
            removeCallback();
            settle(false);
          }
        : undefined;
      record.callbacks.push(callback);
      if (options?.timeoutMs && options.timeoutMs > 0) {
        timeout = setTimeout(() => {
          removeCallback();
          settle(false);
        }, options.timeoutMs);
        timeout.unref?.();
      }
      if (options?.signal) {
        if (options.signal.aborted) {
          removeCallback();
          settle(false);
          return;
        }
        options.signal.addEventListener("abort", abort!, { once: true });
      }
    });
  }

  async waitAllIdle(
    teamName: string,
    options?: { timeoutMs?: number; signal?: AbortSignal },
  ): Promise<boolean> {
    if (isTeammateIdleDetectionDisabled()) return true;
    const records = this.getAllInTeam(teamName);
    if (records.length === 0) return true;
    const deadline =
      options?.timeoutMs && options.timeoutMs > 0
        ? Date.now() + options.timeoutMs
        : 0;
    for (const record of records) {
      const timeoutMs = deadline === 0 ? undefined : Math.max(0, deadline - Date.now());
      if (deadline !== 0 && timeoutMs === 0) return false;
      if (
        !(await this.waitForIdle(record.teamName, record.teammateName, {
          ...(timeoutMs === undefined ? {} : { timeoutMs }),
          ...(options?.signal ? { signal: options.signal } : {}),
        }))
      ) {
        return false;
      }
    }
    return true;
  }

  onIdle(
    teamName: string,
    teammateName: string,
    callback: () => void,
  ): () => void {
    if (isTeammateIdleDetectionDisabled()) {
      this.scheduleCallback(callback, false);
      return () => undefined;
    }
    const record = this.records.get(this.keyOf(teamName, teammateName));
    if (!record?.alive || record.isIdle) {
      this.scheduleCallback(callback, false);
      return () => undefined;
    }
    record.callbacks.push(callback);
    return () => {
      const index = record.callbacks.indexOf(callback);
      if (index >= 0) record.callbacks.splice(index, 1);
    };
  }

  setAwaitingApproval(
    teamName: string,
    teammateName: string,
    requestId: string | undefined,
  ): void {
    const record = this.records.get(this.keyOf(teamName, teammateName));
    if (!record) return;
    if (requestId === undefined) delete record.awaitingApprovalRequestId;
    else record.awaitingApprovalRequestId = requestId;
  }

  recordActivity(
    teamName: string,
    teammateName: string,
    toolName: string,
    input: unknown,
  ): void {
    if (isTeammateIdleDetectionDisabled() || !toolName) return;
    const record = this.records.get(this.keyOf(teamName, teammateName));
    if (!record?.alive) return;
    record.toolUseCount += 1;
    record.recentActivities.push({ toolName, input, at: Date.now() });
    if (record.recentActivities.length > TEAMMATE_MAX_RECENT_ACTIVITIES) {
      record.recentActivities.shift();
    }
  }

  recordTokens(
    teamName: string,
    teammateName: string,
    count: number,
  ): void {
    if (
      isTeammateIdleDetectionDisabled() ||
      !Number.isFinite(count) ||
      count <= 0
    ) {
      return;
    }
    const record = this.records.get(this.keyOf(teamName, teammateName));
    if (record?.alive) record.tokenCount += Math.floor(count);
  }

  private keyOf(teamName: string, teammateName: string): string {
    return `${teamName}::${teammateName}`;
  }

  private toSnapshot(record: IdleRecord): TeammateIdleSnapshot {
    return {
      teamName: record.teamName,
      teammateName: record.teammateName,
      isIdle: record.isIdle,
      alive: record.alive,
      lastEndedAt: record.lastEndedAt,
      lastBusyAt: record.lastBusyAt,
      ...(record.awaitingApprovalRequestId === undefined
        ? {}
        : { awaitingApprovalRequestId: record.awaitingApprovalRequestId }),
      progress: {
        toolUseCount: record.toolUseCount,
        tokenCount: record.tokenCount,
        recentActivities: record.recentActivities.slice(),
      },
    };
  }

  private scheduleCallback(callback: () => void, unregister: boolean): void {
    queueMicrotask(() => {
      try {
        callback();
      } catch (error) {
        this.logger.warn?.(
          unregister
            ? "[TeammateIdle] onIdle callback threw on unregister:"
            : "[TeammateIdle] onIdle callback threw:",
          error,
        );
      }
    });
  }
}

export function extractTeammateProgress(
  value: unknown,
  tracker: TeammateIdleTracker,
  teamName: string,
  teammateName: string,
): void {
  if (!value || typeof value !== "object") return;
  const item = value as {
    type?: string;
    name?: string;
    arguments?: unknown;
    role?: string;
    content?: unknown[];
  };
  if (item.type === "function_call" && typeof item.name === "string") {
    let input = item.arguments;
    if (typeof input === "string") {
      try {
        input = JSON.parse(input);
      } catch {
        // Preserve the exact string when a tool emitted malformed JSON.
      }
    }
    tracker.recordActivity(teamName, teammateName, item.name, input);
    return;
  }
  if (
    item.type === "message" &&
    item.role === "assistant" &&
    Array.isArray(item.content)
  ) {
    for (const block of item.content) {
      if (!block || typeof block !== "object") continue;
      const text = (block as { text?: unknown }).text;
      if (typeof text === "string" && text.length > 0) {
        tracker.recordTokens(
          teamName,
          teammateName,
          Math.ceil(text.length / 4),
        );
      }
    }
  }
}
