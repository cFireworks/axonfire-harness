import {
  createChannelClientIoRuntime,
  type ChannelClientIoRuntime,
} from "./channel-client-runtime.js";
import {
  createWechatClientRuntime,
  createWecomClientRuntime,
} from "./channel-client-services.js";
import { WechatClient } from "./wechat-client.js";
import { WecomBotClient } from "./wecom-bot-client.js";
import { WechatClientFactoryImpl } from "./wechat-client-factory.js";
import { WecomBotClientFactoryImpl } from "./wecom-client-factory.js";
import { LongConnectionClientRegistryImpl } from "./long-connection-client-registry.js";
import { noopChannelLogger, type ChannelLogger } from "./channel-runtime.js";
import { createOwnedChannelFetch } from "./owned-channel-fetch.js";
export type NativeChannelClientOptions = {
  loadSavedInstances?: boolean;
  env?: NodeJS.ProcessEnv;
  io?: Partial<ChannelClientIoRuntime>;
  wechatInstances?: readonly {
    instanceId: string;
    displayName?: string;
    credentials?: any;
  }[];
  wecomInstances?: readonly {
    instanceId: string;
    displayName?: string;
    credentials: any;
  }[];
};
/** Standalone DI/lifecycle adapter around original classes. Never auto-connects. */
export function createNativeChannelClients(
  stateDir: string,
  options: NativeChannelClientOptions = {},
  getBridge: (kind: "wechat" | "wecom") => any = () => {
    throw Error("Channel bridge is unavailable");
  },
  logger: ChannelLogger = noopChannelLogger,
) {
  let closed = false,
    initialized = false;
  const timers = new Set<any>(),
    intervals = new Set<any>(),
    owned = new Set<WechatClient | WecomBotClient>();
  const base = createChannelClientIoRuntime({
    getHomeDir: () => stateDir,
    ...options.io,
    env: options.env ?? options.io?.env ?? {},
  });
  const timeout = ((
    fn: (...args: any[]) => void,
    delay: number,
    ...args: any[]
  ) => {
    if (closed) throw Error("Channel clients are closed");
    let id: any;
    id = base.setTimeout(() => {
      timers.delete(id);
      fn(...args);
    }, delay);
    timers.add(id);
    return id;
  }) as typeof setTimeout;
  const interval = ((
    fn: (...args: any[]) => void,
    delay: number,
    ...args: any[]
  ) => {
    if (closed) throw Error("Channel clients are closed");
    const id = base.setInterval(fn, delay, ...args);
    intervals.add(id);
    return id;
  }) as typeof setInterval;
  const ownedFetch = createOwnedChannelFetch(base.fetch, base.AbortController);
  const socketCtors = new WeakMap<Function, any>();
  const ownedCtor = (ctor: any) => {
    if (typeof ctor !== "function") return ctor;
    let wrapped = socketCtors.get(ctor);
    if (!wrapped) {
      wrapped = new Proxy(ctor, {
        construct(target, args, newTarget) {
          if (closed) throw Error("Channel clients are closed");
          return Reflect.construct(target, args, newTarget);
        },
      });
      socketCtors.set(ctor, wrapped);
    }
    return wrapped;
  };
  const io = createChannelClientIoRuntime({
    ...base,
    fetch: ownedFetch.fetch,
    loadWebSocketModule: () => {
      if (closed) throw Error("Channel clients are closed");
      const module = base.loadWebSocketModule();
      return { ...module, default: ownedCtor(module.default) };
    },
    globalWebSocket: ownedCtor(base.globalWebSocket),
    setTimeout: timeout,
    setInterval: interval,
    clearTimeout: (id: any) => {
      timers.delete(id);
      base.clearTimeout(id);
    },
    clearInterval: (id: any) => {
      intervals.delete(id);
      base.clearInterval(id);
    },
  });
  const wechatRuntime = createWechatClientRuntime(io),
    wecomRuntime = createWecomClientRuntime(io),
    registry = new LongConnectionClientRegistryImpl();
  // Explicit supplied WeChat credentials are an in-memory credential-provider overlay,
  // since the original factory.create accepts only instanceId/displayName.
  const supplied = new Map(
      (options.wechatInstances ?? [])
        .filter((x) => x.credentials !== undefined)
        .map((x) => [x.instanceId, x.credentials]),
    ),
    store = wechatRuntime.credentialsStore;
  wechatRuntime.credentialsStore = {
    ...store,
    loadCredentials: (id: any) =>
      supplied.has(id) ? supplied.get(id) : store.loadCredentials(id),
  };
  const createWechat = () => {
      if (closed) throw Error("Channel clients are closed");
      const client = new WechatClient(wechatRuntime);
      owned.add(client);
      return client;
    },
    createWecom = () => {
      if (closed) throw Error("Channel clients are closed");
      const client = new WecomBotClient(wecomRuntime);
      owned.add(client);
      return client;
    };
  const wechatFactory = new WechatClientFactoryImpl({
      logger,
      clientRegistry: registry,
      credentialsStore: store,
      env: io.env,
      createClient: createWechat,
      getBridge: () => getBridge("wechat"),
    }),
    wecomFactory = new WecomBotClientFactoryImpl({
      logger,
      clientRegistry: registry,
      credentialsStore: wecomRuntime.credentialsStore,
      env: io.env,
      createClient: createWecom,
      getBridge: () => getBridge("wecom"),
    });
  function initializeConfigured() {
    if (closed) throw Error("Channel clients are closed");
    if (initialized) return;
    initialized = true;
    if (options.loadSavedInstances) {
      wechatFactory.initialize();
      wecomFactory.initialize();
    } else if (options.env) wecomFactory.loadInstanceFromEnv();
    for (const instance of options.wechatInstances ?? [])
      wechatFactory.create(instance.instanceId, instance.displayName);
    for (const instance of options.wecomInstances ?? [])
      wecomFactory.create(
        instance.instanceId,
        instance.credentials,
        instance.displayName,
      );
  }
  function close() {
    if (closed) return;
    closed = true;
    for (const client of owned) {
      try {
        if (client instanceof WecomBotClient)
          client.rejectAllPendingResponses("Channel clients are closed");
        client.dispose();
      } catch (error) {
        logger.warn("Failed to dispose owned channel client", error);
      }
    }
    ownedFetch.close();
    for (const id of timers) base.clearTimeout(id);
    for (const id of intervals) base.clearInterval(id);
    timers.clear();
    intervals.clear();
  }
  return {
    io,
    registry,
    wechatFactory,
    wecomFactory,
    wechatRuntime,
    wecomRuntime,
    initializeConfigured,
    close,
  };
}
