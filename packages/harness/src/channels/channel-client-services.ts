import {
  createChannelClientIoRuntime,
  type ChannelClientIoRuntime,
} from "./channel-client-runtime.js";
import { createWechatCredentialStore } from "./wechat-credential-store.js";
import { createWecomCredentialStore } from "./wecom-credential-store.js";
import { createWechatMediaService } from "./wechat-media.js";
import { createWecomMediaService } from "./wecom-media.js";
import { WechatApi } from "./wechat-api.js";
import { LivenessWatchdog } from "./liveness-watchdog.js";
import { PollWatchdog } from "./poll-watchdog.js";
import type { ChannelLogger } from "./channel-runtime.js";
export type WechatClientRuntime = ChannelClientIoRuntime & {
  credentialsStore: ReturnType<typeof createWechatCredentialStore>;
  media: ReturnType<typeof createWechatMediaService>;
  createApi(credentials: any): any;
  createPollWatchdog(deps: any, options?: any): any;
};
export type WecomClientRuntime = ChannelClientIoRuntime & {
  credentialsStore: ReturnType<typeof createWecomCredentialStore>;
  media: ReturnType<typeof createWecomMediaService>;
  createWatchdog(deps: any, options?: any): any;
};
export function createWechatClientRuntime(
  options: Partial<WechatClientRuntime> = {},
): WechatClientRuntime {
  const io = createChannelClientIoRuntime(options);
  return {
    ...io,
    credentialsStore: createWechatCredentialStore(io),
    media: createWechatMediaService(io),
    createApi: (credentials) => new WechatApi(credentials, io),
    createPollWatchdog: (deps, settings) =>
      new PollWatchdog(deps, settings, io),
    ...options,
  };
}
export function createWecomClientRuntime(
  options: Partial<WecomClientRuntime> = {},
): WecomClientRuntime {
  const io = createChannelClientIoRuntime(options);
  return {
    ...io,
    credentialsStore: createWecomCredentialStore(io),
    media: createWecomMediaService(io),
    createWatchdog: (deps, settings) =>
      new LivenessWatchdog(deps, settings, io),
    ...options,
  };
}
export type NativeChannelFactoryRuntime = {
  logger: ChannelLogger;
  clientRegistry: any;
  credentialsStore: any;
  env: NodeJS.ProcessEnv;
  createClient(): any;
  getBridge(): any;
};
