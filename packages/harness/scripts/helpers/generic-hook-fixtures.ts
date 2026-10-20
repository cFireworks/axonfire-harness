import { EventEmitter } from "node:events";
import { createGenericHookHost } from "../../src/hooks/hook-runtime.js";
export function genericHookFixture(captured?: any) {
  const logs: any[] = [],
    events: any[] = [],
    children: any[] = [],
    timers: any[] = [];
  const settings: any = {},
    plugins: any[] = [],
    internal: any[] = [],
    processors: any[] = [],
    sdk: any = {};
  let plan: any = {},
    seq = 0,
    response = '{"ok":true}',
    sdkResult: any = {},
    httpResult: any = { status: 200, text: '{"continue":true}' };
  const permissionUtils = {
    matchCommandRule: (command: string, pattern: string) => {
      events.push(["command-rule", command, pattern]);
      return command === pattern;
    },
    matchFileRule: (file: string, pattern: string) => {
      events.push(["file-rule", file, pattern]);
      return file === pattern;
    },
  };
  const host = createGenericHookHost({
    workDir: () => "/owned/project",
    env: { PUBLIC: "owned-value" },
    uuid: () => "owned-" + ++seq,
    now: () => 1000,
    shell: {
      isWindows: () => false,
      getShellConfiguration: () => ({
        executable: "/owned/shell",
        argsPrefix: ["-c"],
      }),
    },
    permissionUtils,
    settings: { get: async (key: string) => settings[key] },
    pluginManager: { getActivePlugins: async () => plugins },
    sdkHooksManager: {
      getHooks: (event: string) => sdk[event] ?? [],
      invokeCallback: async (...args: any[]) => {
        events.push(["sdk", ...args]);
        if (sdkResult instanceof Error) throw sdkResult;
        return sdkResult;
      },
    },
    endpointProvider: { get: async () => "http://127.0.0.1:1" },
    hookProvider: { sortSync: () => internal },
    hookInputProcessorProvider: { sortSync: () => processors },
    logger: Object.fromEntries(
      ["debug", "info", "warn", "error"].map((k) => [
        k,
        (...args: any[]) => logs.push([k, ...args]),
      ]),
    ),
    getAgentService: () => ({
      runOneTime: async (...args: any[]) => {
        events.push(["one-time", ...args]);
        if (plan.promptError) throw Error("owned-model-error");
        return response;
      },
    }),
    setTimeout: (callback: any, ms: number) => {
      const timer: any = {
        callback,
        ms,
        cleared: false,
        unref() {
          this.unreferenced = true;
          return this;
        },
      };
      timers.push(timer);
      return timer;
    },
    clearTimeout: (timer: any) => {
      timer.cleared = true;
    },
    fetch: (async (...args: any[]) => {
      events.push(["fetch", ...args]);
      if (httpResult.error) throw httpResult.error;
      return { status: httpResult.status, text: async () => httpResult.text };
    }) as any,
    spawn: (...args: any[]) => {
      events.push(["spawn", ...args]);
      const child: any = new EventEmitter();
      child.pid = 123;
      child.killed = false;
      child.stdout = new EventEmitter();
      child.stderr = new EventEmitter();
      child.stdin = new EventEmitter();
      for (const stream of [child.stdout, child.stderr, child.stdin])
        stream.destroy = () => {};
      child.kill = (signal: string) => {
        child.killed = true;
        events.push(["kill", signal]);
        queueMicrotask(() => child.emit("exit", null));
        return true;
      };
      child.stdin.write = (text: string) => {
        events.push(["stdin", text]);
        if (plan.writeError) throw Error("owned-write-error");
      };
      child.stdin.end = () =>
        queueMicrotask(() => {
          if (plan.error) {
            child.emit("error", Error("owned-spawn-error"));
            return;
          }
          for (const text of plan.stdout ?? [])
            child.stdout.emit("data", Buffer.from(text));
          if (plan.stderr) child.stderr.emit("data", Buffer.from(plan.stderr));
          if (plan.stdinError)
            child.stdin.emit(
              "error",
              Object.assign(Error("owned-stdin"), { code: plan.stdinError }),
            );
          if (!plan.hold)
            child.emit("exit", plan.exit === undefined ? 0 : plan.exit);
        });
      children.push(child);
      return child;
    },
  });
  if (captured) {
    host.runtime.ifRule = captured.rules(permissionUtils);
    host.runtime.shellHelpers = {
      ...host.runtime.shellHelpers,
      ...captured.shell(host.runtime),
    };
    host.runtime.promptProtocol = captured.protocol(() => "/owned/project");
    host.registry = captured.construct("ScopedHookRegistryImpl", host.runtime);
    host.executor = captured.construct("HookExecutorImpl", host.runtime);
    host.promptService = captured.construct(
      "PromptHookServiceImpl",
      host.runtime,
    );
    Object.assign(host.runtime.dependencies, {
      scopedHookRegistry: host.registry,
      hookExecutor: host.executor,
      promptHookService: host.promptService,
    });
    host.manager = captured.construct("HookManagerImpl", host.runtime);
  }
  return {
    ...host,
    logs,
    events,
    children,
    timers,
    settings,
    plugins,
    internal,
    processors,
    sdk,
    permissionUtils,
    setPlan(value: any) {
      plan = value;
    },
    setResponse(value: string) {
      response = value;
    },
    setSdkResult(value: any) {
      sdkResult = value;
    },
    setHttpResult(value: any) {
      httpResult = value;
    },
  };
}
