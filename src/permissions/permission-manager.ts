export const DEFAULT_PERMISSION_TIMEOUT = 300_000;

export type PermissionOption = {
  optionId: string;
  name?: string;
  kind?: string;
};

export type PermissionRequest = {
  toolCall: { toolCallId: string; [key: string]: unknown };
  options: PermissionOption[];
  [key: string]: unknown;
};

export type PermissionResponse =
  | { outcome: { outcome: "selected"; optionId: string } }
  | { outcome: { outcome: "cancelled" } };

export type PermissionManagerLogger = {
  debug?(message: string): void;
  warn?(message: string): void;
};

export type PermissionManagerConfig = {
  timeout?: number;
  autoRejectOnTimeout?: boolean;
  autoApprove?: boolean;
  handler?: (request: PermissionRequest) => Promise<PermissionResponse>;
  logger?: PermissionManagerLogger;
};

export type PermissionManagerCallbacks = {
  onRequest?(id: string, request: PermissionRequest): void;
  onTimeout?(id: string): void;
  onResolved?(id: string, optionId: string): void;
  onRejected?(id: string, reason?: string): void;
};

type PendingPermission = {
  params: PermissionRequest;
  resolve: (value: PermissionResponse) => void;
  reject: (reason: unknown) => void;
  createdAt: number;
  timeoutId?: ReturnType<typeof setTimeout>;
};

export class PermissionTimeoutError extends Error {
  constructor(
    readonly operation: "permission",
    readonly timeout: number,
  ) {
    super(`${operation} timed out after ${timeout}ms`);
    this.name = "TimeoutError";
  }
}

/** ACP permission request lifecycle recovered from WorkBuddy's bundled client. */
export class PermissionManager {
  private readonly pending = new Map<string, PendingPermission>();
  private callbacks: PermissionManagerCallbacks = {};
  private config: Required<
    Pick<
      PermissionManagerConfig,
      "timeout" | "autoRejectOnTimeout" | "autoApprove"
    >
  > &
    Omit<PermissionManagerConfig, "timeout" | "autoRejectOnTimeout" | "autoApprove">;

  constructor(config: PermissionManagerConfig = {}) {
    this.config = {
      timeout: DEFAULT_PERMISSION_TIMEOUT,
      autoRejectOnTimeout: true,
      autoApprove: false,
      ...config,
    };
  }

  setCallbacks(callbacks: PermissionManagerCallbacks): void {
    this.callbacks = callbacks;
  }

  async handleRequest(request: PermissionRequest): Promise<PermissionResponse> {
    const id = request.toolCall.toolCallId;
    this.config.logger?.debug?.(`Permission request received: ${id}`);
    if (this.config.autoApprove) {
      const option = request.options[0];
      this.config.logger?.debug?.(`Auto-approving permission: ${id}`);
      return {
        outcome: {
          outcome: "selected",
          optionId: option?.optionId ?? "approve",
        },
      };
    }
    if (this.config.handler) return this.config.handler(request);
    return new Promise<PermissionResponse>((resolve, reject) => {
      const pending: PendingPermission = {
        params: request,
        resolve,
        reject,
        createdAt: Date.now(),
      };
      if (this.config.timeout > 0) {
        pending.timeoutId = setTimeout(
          () => this.handleTimeout(id),
          this.config.timeout,
        );
      }
      this.pending.set(id, pending);
      this.callbacks.onRequest?.(id, request);
    });
  }

  private handleTimeout(id: string): void {
    const pending = this.pending.get(id);
    if (!pending) return;
    this.config.logger?.warn?.(`Permission request timed out: ${id}`);
    this.callbacks.onTimeout?.(id);
    if (this.config.autoRejectOnTimeout) {
      pending.resolve({ outcome: { outcome: "cancelled" } });
    } else {
      pending.reject(
        new PermissionTimeoutError("permission", this.config.timeout),
      );
    }
    this.pending.delete(id);
  }

  resolve(id: string, optionId: string): boolean {
    const pending = this.pending.get(id);
    if (!pending) {
      this.config.logger?.warn?.(`Permission request not found: ${id}`);
      return false;
    }
    if (pending.timeoutId) clearTimeout(pending.timeoutId);
    this.config.logger?.debug?.(`Permission resolved: ${id} -> ${optionId}`);
    pending.resolve({ outcome: { outcome: "selected", optionId } });
    this.pending.delete(id);
    this.callbacks.onResolved?.(id, optionId);
    return true;
  }

  reject(id: string, reason?: string): boolean {
    const pending = this.pending.get(id);
    if (!pending) {
      this.config.logger?.warn?.(`Permission request not found: ${id}`);
      return false;
    }
    if (pending.timeoutId) clearTimeout(pending.timeoutId);
    this.config.logger?.debug?.(
      `Permission rejected: ${id}${reason ? ` - ${reason}` : ""}`,
    );
    pending.resolve({ outcome: { outcome: "cancelled" } });
    this.pending.delete(id);
    this.callbacks.onRejected?.(id, reason);
    return true;
  }

  getPending(): Map<
    string,
    { params: PermissionRequest; createdAt: number }
  > {
    const result = new Map<
      string,
      { params: PermissionRequest; createdAt: number }
    >();
    for (const [id, pending] of this.pending) {
      result.set(id, {
        params: pending.params,
        createdAt: pending.createdAt,
      });
    }
    return result;
  }

  getPendingById(
    id: string,
  ): { params: PermissionRequest; createdAt: number } | undefined {
    const pending = this.pending.get(id);
    if (!pending) return undefined;
    return { params: pending.params, createdAt: pending.createdAt };
  }

  hasPending(): boolean {
    return this.pending.size > 0;
  }

  get pendingCount(): number {
    return this.pending.size;
  }

  clear(): void {
    for (const [id, pending] of this.pending) {
      if (pending.timeoutId) clearTimeout(pending.timeoutId);
      pending.resolve({ outcome: { outcome: "cancelled" } });
      this.callbacks.onRejected?.(id, "cleared");
    }
    this.pending.clear();
    this.config.logger?.debug?.("Cleared all pending permissions");
  }

  updateConfig(config: PermissionManagerConfig): void {
    this.config = { ...this.config, ...config };
  }
}
