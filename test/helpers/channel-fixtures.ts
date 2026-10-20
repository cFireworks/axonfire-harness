import { Subject, BehaviorSubject } from "rxjs";
import { ChannelManagerImpl } from "../../src/channels/channel-manager.js";
import {
  createReplyToolRuntime,
  type ChannelBridgeRuntime,
  type ChannelClientFactory,
} from "../../src/channels/channel-runtime.js";
export const channelFixtureBytes = Buffer.from("owned channel fixture bytes");
export function fixtureClient(kind = "wechat", id = "bot", events: any[] = []) {
  return {
    clientType: kind,
    instanceId: id,
    status: "connected",
    onMessage: new Subject<any>(),
    onStatusChange: new Subject<any>(),
    sendReply: async (...args: any[]) => {
      events.push(["client.sendReply", id, ...args]);
    },
    sendAsyncReply: async (...args: any[]) => {
      events.push(["client.sendAsyncReply", id, ...args]);
    },
    sendImageReply: async (...args: any[]) => {
      events.push(["client.sendImageReply", id, ...args]);
    },
    sendFileReply: async (...args: any[]) => {
      events.push(["client.sendFileReply", id, ...args]);
    },
    uploadMedia: async (...args: any[]) => {
      events.push(["client.uploadMedia", id, ...args]);
      return { media_id: "fixture-media" };
    },
    sendMediaMessage: async (...args: any[]) => {
      events.push(["client.sendMediaMessage", id, ...args]);
    },
  };
}
export function fixtureFactory(clients: any[]): ChannelClientFactory {
  return {
    getAll: () => clients,
    get: (id: string) => clients.find((c) => c.instanceId === id),
  };
}
export function bridgeFixture(kind = "wechat", options: any = {}) {
  const events: any[] = [],
    timers: Array<() => void> = [],
    clients = options.clients ?? [fixtureClient(kind, "bot", events)],
    factory = fixtureFactory(clients);
  const logger: any = Object.fromEntries(
    ["setContext", "info", "warn", "debug", "error"].map((key) => [
      key,
      (...args: any[]) => events.push([key, ...args]),
    ]),
  );
  const session: any = {
    id: "fixture-session",
    meta: {},
    interruptionSubject: new Subject<any>(),
    combineSubject: new Subject<any>(),
  };
  const configs: any = {
    cli: { tools: ["Read"] },
    Explore: { tools: ["Read"] },
  };
  const manager = new ChannelManagerImpl(logger);
  const runtime: ChannelBridgeRuntime = {
    logger,
    clientFactory: factory,
    channelManager: manager,
    sessionManager: {
      getCurrent: () => (options.noSession ? undefined : session),
      sessionSubject: new BehaviorSubject(
        options.noSession ? undefined : session,
      ),
      setCurrent: (value: any) => events.push(["setCurrent", value.id]),
      run: async (_session: any, fn: () => any) => fn(),
    },
    agentManager: {
      getAll: async () => Object.keys(configs).map((name) => ({ name })),
      getAgentConfig: async (name: string) => configs[name],
      refreshAgentTools: async (name: string) => events.push(["refresh", name]),
      getDefault: async () => ({ name: "cli" }),
    },
    channelPermissionAdapter: {
      handlePermissionResponse: (value: any) =>
        events.push(["permission", value]),
    },
    askService: {
      setAsk: (item: any) => events.push(["setAsk", item]),
      doneAsk: (answers: any, id: any) => events.push(["doneAsk", answers, id]),
    },
    interruptionService: {
      approve: (item: any) => events.push(["approve", item]),
    },
    planStorageService: { syncRead: () => options.plan },
    messageQueueManager: {
      enqueueMessage: (_s: any, item: any) => events.push(["enqueue", item]),
    },
    stateMachine: {
      isBusyForQueue: () => options.busy ?? true,
      getSnapshot: () => ({ status: "running" }),
      forceIdle: (_s: any, reason: any) => events.push(["forceIdle", reason]),
    },
    commandManager: {
      parseCommand: (text: string) =>
        text.startsWith("/")
          ? {
              name: text.split(" ")[0],
              args: text.split(" ").slice(1).join(" "),
            }
          : undefined,
      isOverriddenByCustom: () => !!options.overridden,
      isLocalCommand: () => options.local ?? true,
      executeLocalCommand: async (params: any) => {
        events.push(["command", { name: params.name, args: params.args }]);
        if (options.commandError) throw Error(options.commandError);
        session.combineSubject.next({
          type: "input",
          data: {
            role: "user",
            content:
              "<local-command-stdout>fixture output</local-command-stdout>",
          },
        });
      },
      finalizeCommandExecution: async () => {
        events.push(["finalize"]);
      },
    },
    agentService: {
      run: async (agent: any, input: any, context: any) =>
        events.push(["run", agent.name, input, context.context.id]),
    },
    now: () => 12345,
    setTimeout: ((callback: () => void, delay: number) => {
      events.push(["timer", delay]);
      timers.push(callback);
      return timers.length;
    }) as any,
  };
  return {
    runtime,
    events,
    timers,
    session,
    factory,
    clients,
    manager,
    configs,
  };
}
export function replyFixture(options: any = {}) {
  const events: any[] = [],
    factory = fixtureFactory(options.clients ?? [{ status: "connected" }]);
  const send =
    (method: string) =>
    async (...args: any[]) => {
      events.push([method, ...args]);
      if (options.sendError !== undefined) throw options.sendError;
    };
  const client = {
    uploadMedia: async (...args: any[]) => {
      events.push(["uploadMedia", ...args]);
      if (options.sendError !== undefined) throw options.sendError;
      return { media_id: "fixture-media" };
    },
    sendMediaMessage: send("sendMediaMessage"),
  };
  const bridge = {
    sendReply: send("sendReply"),
    sendImageReply: send("sendImageReply"),
    sendFileReply: send("sendFileReply"),
    resolveClientForChat: (id: any) => {
      events.push(["resolve", id]);
      if (options.resolveError) throw Error(options.resolveError);
      return {
        client,
        platformData: options.platformData ?? {
          chatid: "target",
          chattype: "group",
        },
      };
    },
  };
  const runtime = createReplyToolRuntime({
    wechatFactory: factory,
    wecomFactory: factory,
    wechatBridge: () => {
      if (options.bridgeError) throw Error(options.bridgeError);
      return bridge;
    },
    wecomBridge: () => {
      if (options.bridgeError) throw Error(options.bridgeError);
      return bridge;
    },
    files: {
      stat: (async (...args: any[]) => {
        events.push(["stat", ...args]);
        return { size: options.size ?? 3 };
      }) as any,
      readFile: (async (...args: any[]) => {
        events.push(["readFile", ...args]);
        if (options.readError) throw Error(options.readError);
        return channelFixtureBytes;
      }) as any,
    },
    fetch: (async (...args: any[]) => {
      events.push(["fetch", ...args]);
      return {
        ok: options.ok ?? true,
        status: 404,
        statusText: "Not Found",
        arrayBuffer: async () => channelFixtureBytes,
      };
    }) as any,
    timeoutSignal: (delay: number) => {
      events.push(["timeoutSignal", delay]);
      return new AbortController().signal;
    },
  });
  return { runtime, events, bridge };
}
export function inbound(
  kind = "wechat",
  prompt = "fixture prompt",
  extra: any = {},
) {
  return {
    prompt,
    replyContext: {
      clientType: kind,
      conversationId: kind === "wechat" ? "wechat_bot_user" : "wecom_room_user",
      userId: "user",
      platformData:
        kind === "wechat"
          ? { context_token: "0123456789", ...extra }
          : { instanceId: "bot", chatid: "room", chattype: "group", ...extra },
    },
  };
}
export async function settleChannelFixture() {
  for (let i = 0; i < 16; i++) await Promise.resolve();
}
