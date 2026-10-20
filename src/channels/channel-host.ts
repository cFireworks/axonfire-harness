import { WechatChannelBridge } from "./wechat-channel-bridge.js";
import { WecomBotChannelBridge } from "./wecom-bot-channel-bridge.js";
import { ChannelManagerImpl } from "./channel-manager.js";
import { ChannelPermissionAdapterImpl } from "./channel-permission-adapter.js";
import type { NativeChannelClientOptions } from "./native-channel-clients.js";
import {
  createReplyToolRuntime,
  emptyChannelClientFactory,
  noopChannelLogger,
  type ChannelBridgeRuntime,
  type ChannelClientFactory,
  type ChannelLogger,
  type ReplyToolRuntime,
} from "./channel-runtime.js";
export type ChannelHostOptions = {
  /** Opt-in restored clients. Still disconnected until explicit connect(). */
  native?: NativeChannelClientOptions;
  wechat?: ChannelClientFactory;
  wecom?: ChannelClientFactory;
  channels?: string;
  dangerouslyLoadDevelopmentChannels?: string;
  io?: Partial<Pick<ReplyToolRuntime, "files" | "fetch" | "timeoutSignal">>;
  now?: () => number;
  random?: () => number;
  setTimeout?: typeof setTimeout;
  clearTimeout?: typeof clearTimeout;
};
/** Standalone ownership adapter. Native bridge methods remain separately exported/testable. */
export function createChannelHost(
  options: ChannelHostOptions | undefined,
  manager: ChannelManagerImpl,
  permission: ChannelPermissionAdapterImpl,
  services: Omit<
    ChannelBridgeRuntime,
    | "clientFactory"
    | "now"
    | "setTimeout"
    | "channelManager"
    | "channelPermissionAdapter"
    | "logger"
  >,
  logger: ChannelLogger = noopChannelLogger,
) {
  let closed = false;
  const subscriptions = new Set<{ unsubscribe(): void }>(),
    timers = new Set<ReturnType<typeof setTimeout>>(),
    clients = new WeakMap<object, any>();
  const ownedSessions = new Set<any>(),
    runs = new Set<Promise<void>>();
  const outbound = new Set([
    "sendReply",
    "sendAsyncReply",
    "sendImageReply",
    "sendFileReply",
    "uploadMedia",
    "sendMediaMessage",
  ]);
  const track = (source: any) =>
    source
      ? new Proxy(source, {
          get(target, key) {
            if (key === "subscribe")
              return (...args: any[]) => {
                if (closed) return { unsubscribe() {} };
                const subscription = target.subscribe(...args);
                subscriptions.add(subscription);
                return subscription;
              };
            const value = Reflect.get(target, key);
            return typeof value === "function" ? value.bind(target) : value;
          },
        })
      : source;
  const client = (source: any) => {
    if (!source) return source;
    let result = clients.get(source);
    if (result) return result;
    result = new Proxy(source, {
      get(target, key) {
        if (key === "onMessage" || key === "onStatusChange")
          return track(target[key]);
        const value = Reflect.get(target, key);
        if (
          typeof key === "string" &&
          outbound.has(key) &&
          typeof value === "function"
        )
          return (...args: any[]) => {
            if (closed) throw Error("Channel host is closed");
            return value.apply(target, args);
          };
        return typeof value === "function" ? value.bind(target) : value;
      },
    });
    clients.set(source, result);
    return result;
  };
  const factory = (source: ChannelClientFactory): ChannelClientFactory => ({
    getAll: () => (closed ? [] : source.getAll().map(client)),
    get: (id) => (closed ? undefined : client(source.get(id))),
  });
  const wechatFactory = factory(options?.wechat ?? emptyChannelClientFactory),
    wecomFactory = factory(options?.wecom ?? emptyChannelClientFactory);
  const sessionManager = new Proxy(services.sessionManager, {
    get(target, key) {
      if (key === "sessionSubject") return track(target[key]);
      if (key === "setCurrent")
        return (session: any) => target.sessionSubject.next(session);
      const value = Reflect.get(target, key);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
  const setTimer: typeof setTimeout = ((
    fn: (...args: any[]) => void,
    delay: number,
    ...args: any[]
  ) => {
    let id: ReturnType<typeof setTimeout>;
    id = (options?.setTimeout ?? setTimeout)(() => {
      timers.delete(id);
      if (!closed) fn(...args);
    }, delay);
    timers.add(id);
    return id;
  }) as any;
  const shared = {
    ...services,
    agentService: {
      run: (...args: any[]) => {
        if (closed) return Promise.reject(Error("Channel host is closed"));
        const session = args[2]?.context;
        if (session) ownedSessions.add(session);
        const pending = Promise.resolve(services.agentService.run(...args));
        // Native run returns after publishing a stream; do not change that return
        // boundary. Track its full completion separately for host-owned shutdown.
        const finished = pending
          .then(async () => {
            if (closed) session?.abortController?.abort();
            const result = session?.resultSubject?.value;
            await result?.completed;
            if (result)
              await services.sessionManager.waitForResultHandled?.(result);
          })
          .catch(() => undefined)
          .finally(() => runs.delete(finished));
        runs.add(finished);
        return pending;
      },
    },
    sessionManager,
    logger,
    channelManager: manager,
    channelPermissionAdapter: permission,
    now: options?.now ?? Date.now,
    setTimeout: setTimer,
  };
  const wechatBridge = new WechatChannelBridge({
      ...shared,
      clientFactory: wechatFactory,
    }),
    wecomBridge = new WecomBotChannelBridge({
      ...shared,
      clientFactory: wecomFactory,
    });
  for (const bridge of [wechatBridge, wecomBridge]) {
    const subscribe = bridge.subscribeToSessionInterruptions.bind(bridge);
    bridge.subscribeToSessionInterruptions = (session: any) => {
      const view = Object.create(session);
      Object.defineProperty(view, "interruptionSubject", {
        value: track(session.interruptionSubject),
      });
      return subscribe(view);
    };
  }
  const runtime = createReplyToolRuntime({
    ...options?.io,
    wechatFactory,
    wecomFactory,
    wechatBridge: () => wechatBridge,
    wecomBridge: () => wecomBridge,
  });
  // Explicit channels opt-in only: no auto-discovery, credentials, connects or startup messages.
  let started = false;
  function start() {
    if (!options || started || closed) return;
    started = true;
    manager.configureFromSessionOptions(options);
    wechatBridge.initialize();
    wecomBridge.initialize();
  }
  function close() {
    if (closed) return;
    closed = true;
    for (const session of ownedSessions) session.abortController?.abort();
    for (const subscription of subscriptions) subscription.unsubscribe();
    subscriptions.clear();
    for (const id of timers) (options?.clearTimeout ?? clearTimeout)(id);
    timers.clear();
    for (const bridge of [wechatBridge, wecomBridge])
      bridge.resolvePendingSuggestionApproval(false);
    manager.unregisterChannel("wechat");
    manager.unregisterChannel("wecom");
  }
  return {
    runtime,
    wechatFactory,
    wecomFactory,
    wechatBridge,
    wecomBridge,
    manager,
    permission,
    start,
    close,
    waitForRuns: async () => {
      await Promise.allSettled([...runs]);
    },
  };
}
