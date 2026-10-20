import { EventEmitter } from "node:events";
import { createNativeSdkControl } from "../../src/sdk/native-sdk-control.js";
export function sdkControlFixture(construct: any = createNativeSdkControl) {
  const events: any[] = [],
    timers = new Map<number, { callback: () => void; ms: number }>(),
    stdout = new EventEmitter() as any;
  let tick = 0;
  stdout.write = (line: string) => {
    events.push(["write", JSON.parse(line)]);
    return true;
  };
  const runtime = {
    now: () => 17,
    stdout,
    setTimeout: (callback: () => void, ms: number) => {
      const id = ++tick;
      timers.set(id, { callback, ms });
      events.push(["timer", id, ms]);
      return id;
    },
    clearTimeout: (id: number) => {
      events.push(["clear", id]);
      timers.delete(id);
    },
  };
  const classes = construct(runtime),
    writer = new classes.StdoutWriter(),
    logger = Object.fromEntries(
      ["info", "warn", "debug", "error"].map((name) => [
        name,
        (...args: any[]) =>
          events.push([
            "log",
            name,
            ...args.map((x) => (x instanceof Error ? x.message : x)),
          ]),
      ]),
    );
  const permission = Object.assign(new classes.SdkPermissionClientImpl(), {
      stdoutWriter: writer,
    }),
    hooks = Object.assign(new classes.SdkHooksManagerImpl(), {
      stdoutWriter: writer,
      logger,
    }),
    mcp = Object.assign(new classes.SdkMcpMessageClientImpl(), {
      stdoutWriter: writer,
    }),
    elicitation = Object.assign(new classes.SdkElicitationClientImpl(), {
      stdoutWriter: writer,
    }),
    control = Object.assign(new classes.ControlSignalHandlerImpl(), {
      stdoutWriter: writer,
      logger,
      sdkPermissionClient: permission,
      sdkHooksManager: hooks,
      sdkMcpMessageClient: mcp,
      sdkElicitationClient: elicitation,
      subtypeHandlers: [],
    });
  const messages = () =>
    events.filter((e) => e[0] === "write").map((e) => e[1]);
  const response = async (id: string, body: any, subtype = "success") => {
    await control.handleMessage({
      type: "control_response",
      response: {
        request_id: id,
        subtype,
        ...(subtype === "error" ? { error: body } : { response: body }),
      },
    });
  };
  const settle = (promise: Promise<any>): Promise<any> =>
    promise.then(
      (value) => ({ value }),
      (error) => ({ error: error?.message ?? String(error) }),
    );
  function fireTimer(id: number) {
    const timer = timers.get(id);
    if (!timer) throw Error("missing timer " + id);
    timers.delete(id);
    timer.callback();
  }
  return {
    classes,
    runtime,
    events,
    timers,
    stdout,
    writer,
    logger,
    permission,
    hooks,
    mcp,
    elicitation,
    control,
    messages,
    response,
    settle,
    fireTimer,
  };
}
export type ClientCase = {
  kind: "permission" | "hook" | "mcp" | "elicitation";
  finish: "success" | "error" | "cancel" | "cancelAll" | "timeout" | "abort";
  missing?: boolean;
  options?: any;
};
export async function sdkClientCase(spec: ClientCase, construct?: any) {
  const f = sdkControlFixture(construct),
    abort = new AbortController();
  let pending: Promise<any>;
  if (spec.kind === "permission")
    pending = f.permission.requestPermission(
      "OwnedTool",
      { text: "owned" },
      "call-owned",
      spec.options,
    );
  else if (spec.kind === "hook")
    pending = f.hooks.invokeCallback(
      "owned-callback",
      { hook_event_name: "PreToolUse" },
      "call-owned",
      spec.options?.timeout ?? 60000,
    );
  else if (spec.kind === "mcp")
    pending = f.mcp.sendMcpMessage(
      "owned-server",
      { jsonrpc: "2.0", id: 1, method: "tools/list" },
      abort.signal,
    );
  else
    pending = f.elicitation.createElicitation(
      { message: "owned question", requestedSchema: { type: "object" } },
      { signal: abort.signal },
    );
  const settled = f.settle(pending),
    message = f.messages()[0],
    id = message.request_id;
  if (spec.finish === "success")
    await f.response(
      id,
      spec.missing
        ? undefined
        : spec.kind === "permission"
          ? {
              allowed: true,
              reason: "owned",
              updatedInput: { text: "edited" },
              interrupt: false,
            }
          : spec.kind === "mcp"
            ? { mcp_response: { jsonrpc: "2.0", id: 1, result: { tools: [] } } }
            : { continue: false, action: "accept" },
    );
  else if (spec.finish === "error")
    await f.response(id, "owned failure", "error");
  else if (spec.finish === "cancelAll") {
    if (spec.kind === "permission")
      f.permission.cancelAllPending("owned close");
    else if (spec.kind === "hook") f.hooks.clearHooks();
    else if (spec.kind === "mcp") f.mcp.cancelAllPending("owned close");
    else f.elicitation.cancelAllPending("owned close");
  } else if (spec.finish === "cancel") {
    if (spec.kind === "permission") f.permission.cancelRequest(id);
    else if (spec.kind === "mcp") f.mcp.cancelRequest(id);
    else if (spec.kind === "hook") f.hooks.clearHooks();
    else f.elicitation.cancelAllPending("owned cancel");
  } else if (spec.finish === "abort") abort.abort();
  else f.fireTimer([...f.timers.keys()][0]!);
  const result = await settled;
  await f.response(id, { allowed: true });
  return {
    events: f.events,
    result,
    pending: {
      permission: f.permission.pendingRequests.size,
      hooks: f.hooks.pendingRequests.size,
      mcp: f.mcp.pendingRequests.size,
      elicitation: f.elicitation.pendingRequests.size,
    },
    timers: [...f.timers].map(([id, t]) => [id, t.ms]),
  };
}
export async function sdkInitializeCase(spec: any = {}, construct?: any) {
  const f = sdkControlFixture(construct),
    state = new f.classes.SdkInitializeStateServiceImpl(),
    events = f.events;
  const handler = Object.assign(new f.classes.InitializeHandler(), {
    sdkHooksManager: f.hooks,
    sdkInitializeState: state,
    productManager: {
      async sync(force: boolean) {
        events.push(["sync", force]);
        if (spec.productFail) throw Error("owned sync failure");
      },
    },
    agentManager: {
      async waitForRebuildSettled() {
        events.push(["rebuild"]);
      },
      async getDefault() {
        return { name: "owned-default" };
      },
      async getModels() {
        return [{ id: "owned-model", description: "owned model" }];
      },
      async getPrimaryModel() {
        if (spec.primaryFail) throw Error("owned primary");
        return { id: "owned-model" };
      },
    },
    commandManager: {
      async getAll() {
        return [{ name: "/owned", description: "owned command" }];
      },
    },
    outputStyleManager: {
      async getAllOutputStyles() {
        return [{ name: "Default" }, { name: "Owned" }];
      },
    },
    settingsManager: {
      async get(key: string) {
        events.push(["get", key]);
        return spec.style;
      },
      async set(...args: any[]) {
        events.push(["set", ...args]);
      },
    },
    productEnvService: {
      async switch(env: string) {
        events.push(["environment", env]);
      },
    },
    mcpReadyService: {
      async waitForServersReady() {
        events.push(["mcpReady"]);
      },
    },
    mcpManager: {
      async add(...args: any[]) {
        events.push(["mcpAdd", ...args]);
      },
    },
    authManager: {
      currentSessionSubject: {
        getValue: () =>
          spec.account
            ? {
                account: {
                  uid: "owned-user",
                  nickname: "owned",
                  type: "owned-type",
                  enterprise: true,
                  enterpriseName: "owned enterprise",
                  enterpriseId: "owned-enterprise",
                },
                auth: {},
              }
            : undefined,
      },
    },
    hostCapabilityProvider: {
      markElicitationForm() {
        events.push(["form"]);
      },
      markWeixinpayInterception() {
        events.push(["paymentCapability"]);
      },
    },
  });
  const request = {
    environment: spec.environment,
    endpoint: spec.endpoint,
    systemPrompt: spec.prompt,
    appendSystemPrompt: spec.append,
    agents: spec.agents,
    sdkMcpServers: spec.servers,
    hooks: spec.hooks,
    capabilities: spec.capabilities,
  };
  const result = await handler.handle(
    { request },
    new AbortController().signal,
  );
  return {
    events,
    result,
    state: state.get(),
    changed: state.set(state.get()),
    capabilities: f.hooks.getCapabilities(),
    hookEvents: [...f.hooks.hooksConfig.keys()],
  };
}
export async function sdkSettingsCase(spec: any = {}, construct?: any) {
  const f = sdkControlFixture(construct),
    events = f.events;
  const session: any = spec.absent
    ? undefined
    : {
        id: "owned-session",
        permissionModeSubject: {
          value: "default",
          next(v: any) {
            this.value = v;
          },
        },
        requestOptions: {},
        options: { model: "previous-owned" },
      };
  const sessions = {
    sessionSubject: { getValue: () => session },
    setOverrideModel: (...args: any[]) =>
      events.push(["modelOverride", ...args]),
    setOverridePermissionMode: (...args: any[]) =>
      events.push(["permissionOverride", ...args]),
  };
  const handler = Object.assign(
    new (spec.kind === "model"
      ? f.classes.SetModelHandler
      : f.classes.SetPermissionModeHandler)(),
    {
      sessionManager: sessions,
      logger: f.logger,
      cliSettingsProvider: {
        async set(...args: any[]) {
          events.push(["cliSet", ...args]);
        },
      },
      planStorageService: {
        initializePlanFilePath: (s: any) => "/owned/plan/" + s.id + ".md",
      },
    },
  );
  const response = await f.settle(
    handler.handle(
      { request: { session_id: spec.id, mode: spec.mode, model: spec.model } },
      new AbortController().signal,
    ),
  );
  return { response, events, session };
}
