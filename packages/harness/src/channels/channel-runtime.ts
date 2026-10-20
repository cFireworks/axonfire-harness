import { stat, readFile } from "node:fs/promises";
export type ChannelLogger = {
  setContext(context: string): void;
  debug(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
};
export const noopChannelLogger: ChannelLogger = {
  setContext() {},
  debug() {},
  info() {},
  warn() {},
  error() {},
};
/** Existing, explicitly supplied clients only. No credential discovery or automatic connection. */
export type ChannelClientFactory = {
  getAll(): any[];
  get(instanceId: string): any;
};
export const emptyChannelClientFactory: ChannelClientFactory = {
  getAll: () => [],
  get: () => undefined,
};
export type ReplyToolRuntime = {
  wechatFactory: ChannelClientFactory;
  wecomFactory: ChannelClientFactory;
  wechatBridge(): any;
  wecomBridge(): any;
  files: { stat: typeof stat; readFile: typeof readFile };
  fetch: typeof fetch;
  timeoutSignal: (milliseconds: number) => AbortSignal;
};
export function createReplyToolRuntime(
  options: Partial<ReplyToolRuntime> = {},
): ReplyToolRuntime {
  return {
    wechatFactory: emptyChannelClientFactory,
    wecomFactory: emptyChannelClientFactory,
    wechatBridge: () => {
      throw Error("WechatChannelBridge dependency is unavailable");
    },
    wecomBridge: () => {
      throw Error("WecomBotChannelBridge dependency is unavailable");
    },
    files: { stat, readFile },
    fetch,
    timeoutSignal: AbortSignal.timeout,
    ...options,
  };
}
/** Original injected service surface; all control flow remains in the native bridge. */
export type ChannelBridgeRuntime = {
  logger: ChannelLogger;
  clientFactory: ChannelClientFactory;
  channelManager: any;
  sessionManager: any;
  agentManager: any;
  channelPermissionAdapter: any;
  askService: any;
  interruptionService: any;
  planStorageService: any;
  messageQueueManager: any;
  stateMachine: any;
  commandManager?: any;
  agentService: any;
  now: () => number;
  setTimeout: typeof setTimeout;
};
