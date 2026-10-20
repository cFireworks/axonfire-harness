import { createHookLifecycleHost } from "../../src/hooks/hook-lifecycle-runtime.js";
import { resolve } from "node:path";
export function hookLifecycleFixture(captured?: any) {
  const events: any[] = [],
    logs: any[] = [],
    watchers: any[] = [],
    enabled = new Set<string>(),
    outputs: any = {},
    files = new Map<string, boolean>();
  let now = 5000;
  const fs = {
    existsSync: (p: string) => files.has(p),
    statSync: (p: string) => ({ isDirectory: () => files.get(p) === true }),
    watch: (p: string, opts: any, callback: any) => {
      const w = {
        p,
        opts,
        callback,
        close() {
          events.push(["watch-close", p]);
        },
      };
      watchers.push(w);
      events.push(["watch", p, opts]);
      return w;
    },
  };
  const host = createHookLifecycleHost({
    workDir: () => "/owned/project",
    env: {},
    platform: "darwin",
    fs,
    getHomeDir: () => "/owned/home",
    now: () => now,
    sessionStore: {
      getSessionFilePath: (id: string, parent: any) => {
        events.push(["transcript", id, parent]);
        return "/owned/transcripts/" + id + ".jsonl";
      },
    },
    logger: Object.fromEntries(
      ["debug", "info", "warn", "error"].map((k) => [
        k,
        (...args: any[]) => logs.push([k, ...args]),
      ]),
    ),
    endpointProvider: { get: async () => "http://127.0.0.1:1" },
    terminalNotificationService: {
      async sendNotification(...args: any[]) {
        events.push([
          "notification",
          ...args.map((a) => (a?.id ? "<session>" : a)),
        ]);
      },
    },
    galileoSessionBridge: Object.fromEntries(
      [
        "addToolStartSpanEvent",
        "addToolSuccessSpanEvent",
        "addToolErrorSpanEvent",
      ].map((k) => [k, (s: any, data: any) => events.push([k, s.id, data])]),
    ),
    pipelineDependencies: {
      tryInterceptTool: () => null,
      checkIdeInputTransformation: () => null,
      async createFileBackupBeforeExecute(...args: any[]) {
        events.push(["backup", args[0], args[1]]);
      },
      reportMcpToolCapabilityCall: (name: string) =>
        events.push(["capability", name]),
      async injectConditionalRules(...args: any[]) {
        events.push(["conditional", args[0], args[1]]);
      },
    },
  });
  const manager = {
    async hasHooks(event: string) {
      events.push(["has", event]);
      return enabled.has(event);
    },
    async executeHooks(event: string, input: any, options?: any) {
      events.push([
        "hook",
        event,
        { ...input, session: input.session ? "<session>" : undefined },
        options,
      ]);
      const value = outputs[event];
      if (value instanceof Error) throw value;
      return typeof value === "function"
        ? await value(input)
        : (value ?? { allowed: true });
    },
  };
  host.lifecycleRuntime.dependencies.hookManager = manager;
  host.sessionManager.hookManager = manager;
  host.toolManager.hookManager = manager;
  if (captured) {
    host.lifecycleRuntime.helpers = captured.helpers({
      fs,
      path: {
        resolve: (...args: string[]) => resolve("/owned/project", ...args),
      },
    });
    host.sessionManager = captured.construct(
      "SessionHookManagerImpl",
      host.lifecycleRuntime,
    );
    host.toolManager = captured.construct(
      "ToolHookManagerImpl",
      host.lifecycleRuntime,
    );
    Object.assign(host.lifecycleRuntime.dependencies, {
      sessionHookManager: host.sessionManager,
      toolHookManager: host.toolManager,
    });
    host.pipeline = captured.construct(
      "NativeToolExecutionPipeline",
      host.lifecycleRuntime,
    );
  }
  const controller = new AbortController();
  const session: any = {
    id: "owned-session",
    storeId: "owned-store",
    agentName: "owned-agent",
    meta: { parentSessionId: "owned-parent" },
    history: [
      {
        type: "message",
        role: "assistant",
        content: [{ type: "output_text", text: "last-owned-answer" }],
      },
    ],
    abortController: controller,
    abortSignal: controller.signal,
    _toolStartTimes: new Map([["call", 4500]]),
  };
  return {
    ...host,
    session,
    events,
    logs,
    watchers,
    files,
    enabled,
    outputs,
    manager,
    setNow: (value: number) => {
      now = value;
    },
  };
}
