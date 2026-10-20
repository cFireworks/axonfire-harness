import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";
import { z } from "zod3";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Subject } from "rxjs";
import { user } from "@openai/agents";
import { WechatReplyTool } from "../src/channels/wechat-reply-tool.js";
import { WecomReplyTool } from "../src/channels/wecom-reply-tool.js";
import { WechatChannelBridge } from "../src/channels/wechat-channel-bridge.js";
import { WecomBotChannelBridge } from "../src/channels/wecom-bot-channel-bridge.js";
import { ChannelManagerImpl } from "../src/channels/channel-manager.js";
import { ChannelPermissionAdapterImpl } from "../src/channels/channel-permission-adapter.js";
import * as C from "../src/channels/channel-constants.js";
import { ToolNames } from "../src/tools/tool-names.js";
import { CommandMessageUtils } from "../src/commands/command-message-utils.js";
import {
  bridgeFixture,
  replyFixture,
  inbound,
  settleChannelFixture,
  fixtureClient,
} from "../test/helpers/channel-fixtures.js";
const filename = process.argv[2];
if (!filename) throw Error("Pass captured bundle path");
const source = await readFile(filename, "utf8");
assert.equal(
  createHash("sha256").update(source).digest("hex"),
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd",
);
function evaluate(code: string, bindings: any = {}): any {
  return runInNewContext(
    `Object.setPrototypeOf(TypeError.prototype,Error.prototype);${code}`,
    { Error, Buffer, Map, Set, Promise, ...bindings },
    { timeout: 1000, contextCodeGeneration: { strings: false, wasm: false } },
  );
}
let comparisons = 0;
function normalize(value: any): any {
  if (value === undefined) return "[undefined]";
  if (typeof value === "function") return "[function]";
  if (typeof value === "symbol") return String(value);
  if (Object.prototype.toString.call(value) === "[object Error]")
    return {
      name: value.name,
      message:
        value.name === "TypeError" ? "[engine TypeError]" : value.message,
    };
  if (value instanceof Map || value instanceof Set)
    return Array.from(value, normalize);
  if (Array.isArray(value)) return Array.from(value, normalize);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, normalize(value[key])]),
    );
  return value;
}
function equal(a: any, b: any) {
  assert.deepEqual(normalize(a), normalize(b));
  comparisons++;
}
async function outcome(fn: () => any) {
  try {
    return { result: await fn() };
  } catch (error) {
    return { error };
  }
}
const moduleStart = source.indexOf("37402(eA,el,ec){"),
  moduleEnd = source.indexOf("},68458(eA,el,ec){", moduleStart),
  exports: any = {};
const load: any = () => ({ z });
load.r = () => {};
load.d = (target: any, entries: any) => {
  for (const [key, get] of Object.entries(entries))
    Object.defineProperty(target, key, { get: get as any, enumerable: true });
};
evaluate(`({${source.slice(moduleStart, moduleEnd + 1)}})[37402]`)(
  null,
  exports,
  load,
);
const nativeC = exports;
for (const key of [
  "CHANNEL_CAPABILITY_KEY",
  "CHANNEL_PERMISSION_CAPABILITY_KEY",
  "CHANNEL_NOTIFICATION_METHOD",
  "CHANNEL_PERMISSION_REQUEST_METHOD",
  "CHANNEL_PERMISSION_RESPONSE_METHOD",
])
  equal((C as any)[key], nativeC[key]);
const converterStart = source.indexOf(
    'let i2=Symbol("Let zodToJsonSchema',
    11618000,
  ),
  converterEnd = source.indexOf(";var om=ec(22618)", converterStart),
  convert = evaluate(
    `(()=>{${source.slice(converterStart, converterEnd + 1)}return zodToJsonSchema})()`,
    { iJ: z },
  );
for (const key of [
  "ChannelNotificationSchema",
  "ChannelPermissionRequestSchema",
  "ChannelPermissionResponseSchema",
])
  equal(zodToJsonSchema((C as any)[key]), convert(nativeC[key]));
for (const [marker, endMarker, name] of [
  ['let eQ="wechat",eD=1e3,eT=', ",eR=class", "WECHAT_CHANNEL_INSTRUCTIONS"],
  ['let eR="wecom",ek=1e3,eM=', ",ex=class", "WECOM_CHANNEL_INSTRUCTIONS"],
]) {
  const start = source.indexOf(marker!),
    end = source.indexOf(endMarker!, start);
  equal((C as any)[name!], evaluate(source.slice(start + marker!.length, end)));
}
const helpers = evaluate(
  `(()=>{${source.slice(10011969, source.indexOf("__decorate(", 10011969))}return {stripAtMention,escapeXmlAttr}})()`,
);
for (const value of [
  "",
  " hello ",
  "@Bot",
  "@Bot two words",
  "@Bot\nY",
  'a&"<>',
]) {
  equal(C.stripAtMention(value), helpers.stripAtMention(value));
  equal(C.escapeXmlAttr(value), helpers.escapeXmlAttr(value));
}
function reply(native: boolean, kind: string, options: any = {}) {
  const f = replyFixture(options);
  if (!native)
    return {
      ...f,
      tool:
        kind === "wechat"
          ? new WechatReplyTool(f.runtime)
          : new WecomReplyTool(f.runtime),
    };
  const factory = {},
    bridge = {},
    module = (id: number) =>
      id === 51455
        ? f.runtime.files
        : id === 54496
          ? { WechatClientFactory: factory }
          : id === 86186
            ? { WecomBotClientFactory: factory }
            : id === 84163
              ? { WechatChannelBridge: bridge }
              : { WecomBotChannelBridge: bridge },
    get = (token: any) =>
      token === factory ? f.runtime.wechatFactory : f.runtime.wechatBridge();
  const Tool = evaluate(
    `(${kind === "wechat" ? source.slice(12068622, 12072932) : source.slice(12073361, 12076598)})`,
    {
      iz: { BaseTool: class {} },
      iJ: { z },
      ec: module,
      nk: { ContainerUtil: { get } },
      cZ: f.runtime.files,
      fetch: f.runtime.fetch,
      AbortSignal: { timeout: f.runtime.timeoutSignal },
    },
  );
  return { ...f, tool: new Tool() };
}
for (const kind of ["wechat", "wecom"]) {
  const a = reply(false, kind),
    b = reply(true, kind);
  equal(a.tool.name, b.tool.name);
  equal(a.tool.description, b.tool.description);
  equal(a.tool.needsApproval, b.tool.needsApproval);
  equal(zodToJsonSchema(a.tool.parameters), convert(b.tool.parameters));
  for (const value of [
    {},
    { chat_id: "" },
    { chat_id: "x", text: 1 },
    { chat_id: "x", file_url: "x" },
    { chat_id: "x", text: "", extra: "strip" },
  ]) {
    const aa = a.tool.parameters.safeParse(value),
      bb = b.tool.parameters.safeParse(value);
    equal(aa.success ? aa.data : "invalid", bb.success ? bb.data : "invalid");
  }
}
for (const kind of ["wechat", "wecom"])
  for (const options of [
    {},
    { clients: [] },
    { clients: [{ status: "connecting" }] },
    { bridgeError: "fixture bridge" },
  ]) {
    const a = reply(false, kind, options),
      b = reply(true, kind, options);
    equal(await a.tool.isEnabled(), await b.tool.isEnabled());
  }
const inputs: any[] = [
  {},
  null,
  { chat_id: "" },
  { chat_id: " " },
  { chat_id: 42, text: "x" },
  { chat_id: "id" },
  { chat_id: "wechat_bot_user hello" },
  { chat_id: "中文" },
  { chat_id: "x".repeat(129) },
  { chat_id: "id", text: " " },
  { chat_id: "id", text: "x", context_token: "short" },
  { chat_id: "id", text: "x", context_token: "0123456789" },
  { chat_id: "id", file_path: "/fixture/a.PNG", text: "caption" },
  { chat_id: "id", file_path: "/fixture/a.svg", text: "caption" },
  {
    chat_id: "id",
    file_path: "/fixture/a.pdf",
    file_url: "https://fixture.invalid/b",
    image_url: "data:image/png;base64,Zg==",
    text: "caption",
  },
  {
    chat_id: "id",
    file_url: "https://fixture.invalid/a.mp4?x=1",
    text: "ignored",
  },
  { chat_id: "id", image_url: "data:image/png;base64,Zg==" },
  { chat_id: "id", image_url: "data:image/png,invalid" },
  { chat_id: "id", file_url: "./fixture.wav" },
  { chat_id: "id", file_url: "relative.wav" },
];
for (const kind of ["wechat", "wecom"])
  for (const options of [
    {},
    { size: 20971520 },
    { size: 20971521 },
    { platformData: {} },
    { bridgeError: "missing bridge" },
    { resolveError: "not connected" },
    { ok: false },
    { readError: "ENOENT fixture" },
  ])
    for (const input of inputs) {
      const a = reply(false, kind, options),
        b = reply(true, kind, options);
      equal(
        await outcome(() => a.tool.execute(input, {})),
        await outcome(() => b.tool.execute(input, {})),
      );
      equal(a.events, b.events);
    }
for (const kind of ["wechat", "wecom"])
  for (const message of [
    "No WeChat client is connected",
    "invalid file timeout",
    "malformed",
    "File failure",
    "ENOENT",
    "Timeout",
    "unknown",
    { message: "" },
    null,
  ]) {
    const options = {
        sendError: typeof message === "string" ? Error(message) : message,
      },
      a = reply(false, kind, options),
      b = reply(true, kind, options);
    equal(
      await outcome(() => a.tool.execute({ chat_id: "id", text: "x" }, {})),
      await outcome(() => b.tool.execute({ chat_id: "id", text: "x" }, {})),
    );
    equal(a.events, b.events);
  }
for (const input of [
  "a.jpg",
  "A.HEIF",
  "a.svg",
  "a.mp4",
  "a.mov",
  "a.mp3",
  "a.ogg",
  "a.pdf",
  "a",
  "a.JPG?x",
  null,
]) {
  const a = reply(false, "wecom"),
    b = reply(true, "wecom");
  equal(
    await outcome(() => a.tool.detectMediaType(input)),
    await outcome(() => b.tool.detectMediaType(input)),
  );
}
function bridge(native: boolean, kind: string, options: any = {}) {
  const f = bridgeFixture(kind, options),
    runtime = f.runtime;
  if (!native)
    return {
      ...f,
      bridge:
        kind === "wechat"
          ? new WechatChannelBridge(runtime)
          : new WecomBotChannelBridge(runtime),
    };
  const scope = { ContainerUtil: { get: () => runtime.agentService } },
    bindings: any = {
      Date: { now: runtime.now },
      setTimeout: runtime.setTimeout,
      ec: () => ({ AgentService: {} }),
      escapeXmlAttr: helpers.escapeXmlAttr,
      stripAtMention: helpers.stripAtMention,
    };
  Object.assign(
    bindings,
    kind === "wechat"
      ? {
          eQ: "wechat",
          eD: 1000,
          eT: C.WECHAT_CHANNEL_INSTRUCTIONS,
          eB: nativeC,
          ev: { ToolNames },
          ey: { user },
          em: scope,
        }
      : {
          eR: "wecom",
          ek: 1000,
          eM: C.WECOM_CHANNEL_INSTRUCTIONS,
          e_: nativeC,
          eQ: { ToolNames },
          ew: { user },
          eD: { CommandMessageUtils },
          eE: scope,
        },
  );
  const Bridge = evaluate(
    `(${kind === "wechat" ? source.slice(9955951, 9970590) : source.slice(9995529, 10011968)})`,
    bindings,
  );
  return { ...f, bridge: Object.assign(new Bridge(), runtime) };
}
function state(b: any) {
  return {
    connectedCount: b.connectedCount,
    isWaking: b.isWaking,
    subscribedClients: b.subscribedClients,
    subscribedSessionId: b.subscribedSessionId,
    pendingPermissionRequests: b.pendingPermissionRequests,
    pendingAsk: b.pendingAsk,
    lastReplyContext: b.lastReplyContext
      ? {
          ...b.lastReplyContext,
          sourceClient: b.lastReplyContext.sourceClient?.instanceId,
        }
      : undefined,
    chatClientMap: b.chatClientMap
      ? [...b.chatClientMap].map(([id, client]: any) => [id, client.instanceId])
      : undefined,
    chatRoutes: b.chatRoutes,
  };
}
async function compareBridges(
  kind: string,
  options: any,
  action: (f: ReturnType<typeof bridge>) => any,
) {
  const a = bridge(false, kind, options),
    b = bridge(true, kind, options);
  equal(await outcome(() => action(a)), await outcome(() => action(b)));
  await settleChannelFixture();
  equal(a.events, b.events);
  equal(state(a.bridge), state(b.bridge));
  equal(a.session.meta, b.session.meta);
  equal(a.configs, b.configs);
}
for (const kind of ["wechat", "wecom"])
  for (const options of [
    {},
    { noSession: true },
    { busy: false },
    { plan: "# Plan\n- step\nordinary" },
  ]) {
    await compareBridges(kind, options, async (f) => {
      f.bridge.initialize();
      f.bridge.subscribeToClient(f.clients[0]);
      f.clients[0].onStatusChange.next({ status: "connected" });
      await settleChannelFixture();
      f.clients[0].onStatusChange.next({ status: "connected" });
      f.clients[0].onStatusChange.next({ status: "disconnected" });
      f.clients[0].onStatusChange.next({ status: "disconnected" });
    });
    await compareBridges(kind, options, async (f) => {
      const message = inbound(kind, 'body <tag> & "x"', {
        mediaFiles: ["/a", "/b"],
      });
      message.replyContext.userId = 'u&"<';
      if (kind === "wechat")
        f.bridge.handleWechatMessage(message, f.clients[0]);
      else await f.bridge.handleWecomMessage(message);
    });
    await compareBridges(kind, options, (f) => {
      f.bridge.runAgentWithMessage(f.session, user("fixture"));
      return f.bridge.isWaking;
    });
  }
for (const kind of ["wechat", "wecom"])
  for (const prompt of [
    "y",
    "YES",
    "allow",
    "好",
    "a",
    "always",
    "别再问",
    "n",
    "取消",
    "q",
    "退出",
    "unrecognized",
    "@Bot y",
    "@Bot another word",
  ])
    for (const tool of ["Read", "ExitPlanMode"]) {
      await compareBridges(kind, {}, (f) => {
        f.bridge.pendingPermissionRequests.set("first", tool);
        f.bridge.pendingPermissionRequests.set("second", "Write");
        return f.bridge.tryHandlePermissionReply(prompt);
      });
    }
for (const kind of ["wechat", "wecom"])
  for (const tool of [
    "Bash",
    "Read",
    "ExitPlanMode",
    "DeferExecuteTool",
    "Unknown",
  ])
    for (const input of [
      "{}",
      '{"command":"echo fixture","description":"reason"}',
      '{"toolName":"Read","params":{"file_path":"/fixture"}}',
      '"{\\"file_path\\":\\"/a\\"}"',
      "not json",
      '{"content":"secret","x":1,"yes":true,"long":"' + "x".repeat(121) + '"}',
    ])
      await compareBridges(kind, { plan: "# Plan\n- step" }, (f) =>
        f.bridge.formatPermissionMessage(tool, input),
      );
for (const kind of ["wechat", "wecom"])
  for (const text of [
    "1",
    "2abc",
    "free form answer",
    "@Bot free form answer",
  ]) {
    await compareBridges(kind, {}, (f) => {
      const item = {
        rawItem: {
          type: "function_call",
          callId: "ask",
          name: "AskUserQuestion",
          arguments: JSON.stringify({
            questions: [
              {
                question: "Q1",
                options: [
                  { label: "A", description: "first" },
                  { label: "B", description: "second" },
                ],
              },
              {
                question: "Q2",
                options: [{ label: "C", description: "third" }],
              },
            ],
          }),
        },
      };
      f.bridge.lastReplyContext =
        kind === "wechat"
          ? {
              chatId: "wechat_bot_user",
              contextToken: "0123456789",
              sourceClient: f.clients[0],
            }
          : {
              chatId: "wecom_room_user",
              instanceId: "bot",
              platformData: { chatid: "room", chattype: "group" },
            };
      f.bridge.handleAskUserQuestion(item);
      f.bridge.tryHandleAskReply(text);
      return f.bridge.tryHandleAskReply("custom answer");
    });
  }
for (const kind of ["wechat", "wecom"])
  for (const text of ["y", "n", "unexpected", "@Bot y"]) {
    await compareBridges(kind, {}, async (f) => {
      const chat = kind === "wechat" ? "wechat_bot_user" : "wecom_room_user";
      const promise = f.bridge.sendPromptSuggestionAndWaitForApproval(
        "continue fixture",
        chat,
        f.session.id,
      );
      await settleChannelFixture();
      const result = f.bridge.tryHandleSuggestionApprovalReply(text);
      return { result, approved: await promise };
    });
  }
for (const options of [
  {},
  { overridden: true },
  { local: false },
  { noSession: true },
  { commandError: "fixture failure" },
])
  for (const command of [
    "/clear args",
    "/theme",
    "/permissions",
    "/workflows",
    "hello",
  ])
    await compareBridges("wecom", options, (f) =>
      f.bridge.tryHandleLocalCommand(command, "wecom_room_user"),
    );
for (const chat of [
  "wechat_bot_user",
  "wechat_missing_user",
  "wechat_legacy",
  "user",
  "wechat_bot_a_b",
]) {
  await compareBridges("wechat", {}, async (f) => {
    const parsed = f.bridge.parseChatId(chat);
    await f.bridge.sendReply(chat, "reply", "0123456789");
    await f.bridge.sendImageReply(chat, "/fixture.png", "caption", undefined);
    await f.bridge.sendFileReply(chat, "/fixture.pdf", undefined, undefined);
    return parsed;
  });
}
for (const chat of [
  "wecom_room_user",
  "wecom_user_user",
  "wecom_bad",
  "unknown",
]) {
  await compareBridges("wecom", {}, async (f) => {
    const result = f.bridge.resolveClientForChat(chat);
    await f.bridge.sendReply(chat, "reply");
    return {
      instanceId: result.client.instanceId,
      platformData: result.platformData,
    };
  });
}
for (const kind of ["wechat", "wecom"])
  for (const tool of ["Read", "ExitPlanMode", "AskUserQuestion"])
    for (const context of [false, true]) {
      await compareBridges(kind, { plan: "# Plan\n- step" }, async (f) => {
        if (context)
          f.bridge.lastReplyContext =
            kind === "wechat"
              ? {
                  chatId: "wechat_bot_user",
                  contextToken: "0123456789",
                  sourceClient: f.clients[0],
                }
              : {
                  chatId: "wecom_room_user",
                  instanceId: "bot",
                  platformData: { chatid: "room", chattype: "group" },
                };
        return f.bridge.sendPermissionRequestToUser({
          request_id: "p",
          tool_name: tool,
          input_preview: '{"file_path":"/fixture"}',
        });
      });
    }
for (const kind of ["wechat", "wecom"])
  await compareBridges(kind, {}, async (f) => {
    f.bridge.pendingPermissionRequests.set("old", "Read");
    const message = inbound(kind, "new instruction", {
      mediaFiles: ["/a", "/b"],
    });
    if (kind === "wechat") f.bridge.handleWechatMessage(message, f.clients[0]);
    else await f.bridge.handleWecomMessage(message);
    for (const timer of f.timers) timer();
  });
await compareBridges("wechat", {}, async (f) => {
  f.clients[0].onInstanceIdChanged = (before: any, after: any) =>
    f.events.push(["renamed", before, after]);
  f.bridge.initialize();
  f.clients[0].onInstanceIdChanged("bot", "new");
  f.bridge.lastReplyContext = {
    chatId: "wechat_bot_user",
    sourceClient: f.clients[0],
  };
  f.session.interruptionSubject.next({
    rawItem: {
      type: "function_call",
      callId: "ask",
      name: "AskUserQuestion",
      arguments: JSON.stringify({
        questions: [
          { question: "Q", options: [{ label: "A", description: "a" }] },
        ],
      }),
    },
  });
  await settleChannelFixture();
  f.clients[0].onMessage.next(inbound("wechat", "1"));
});
for (const kind of ["wechat", "wecom"])
  await compareBridges(kind, { clients: [] }, (f) =>
    kind === "wechat"
      ? f.bridge.resolveClient("wechat_missing")
      : f.bridge.resolveClientForChat("wecom_room_user"),
  );
const Manager = evaluate(`(${source.slice(7360067, 7363197)})`, {
  eB: { Subject },
  eC: nativeC,
});
for (const options of [
  {},
  {
    channels: "plugin:wechat@v1,wecom",
    dangerouslyLoadDevelopmentChannels: "dev",
  },
]) {
  const logsA: any[] = [],
    logsB: any[] = [],
    logger = (logs: any[]) =>
      Object.fromEntries(
        ["debug", "warn", "info"].map((key) => [
          key,
          (...args: any[]) => logs.push([key, ...args]),
        ]),
      ),
    a = new ChannelManagerImpl(logger(logsA), { get: async () => false }),
    b = Object.assign(new Manager(), {
      logger: logger(logsB),
      settingsManager: { get: async () => false },
    });
  a.configureFromSessionOptions(options);
  b.configureFromSessionOptions(options);
  for (const name of ["wechat", "wecom", "other"]) {
    a.registerChannel(
      name,
      { notification() {} },
      {
        experimental: {
          [C.CHANNEL_CAPABILITY_KEY]: {},
          [C.CHANNEL_PERMISSION_CAPABILITY_KEY]: {},
        },
      },
      "prompt",
    );
    b.registerChannel(
      name,
      { notification() {} },
      {
        experimental: {
          [C.CHANNEL_CAPABILITY_KEY]: {},
          [C.CHANNEL_PERMISSION_CAPABILITY_KEY]: {},
        },
      },
      "prompt",
    );
    equal(a.channelServers, b.channelServers);
  }
  for (const item of [1, 2]) {
    a.enqueueEventForSession("s", item);
    b.enqueueEventForSession("s", item);
  }
  equal(a.consumeEventsForSession("s"), b.consumeEventsForSession("s"));
  equal(a.consumeEventsForSession("s"), b.consumeEventsForSession("s"));
  equal(a.shouldBypassAllowlist("dev"), b.shouldBypassAllowlist("dev"));
  await settleChannelFixture();
  equal(a.enabled, b.enabled);
  equal(logsA, logsB);
}
const Adapter = evaluate(`(${source.slice(7366430, 7367715)})`, {
  eQ: "abcdefghijkmnopqrstuvwxyz",
  eD: 5,
  Date: { now: () => 12345 },
  Math: Object.assign(Object.create(Math), { random: () => 0 }),
});
for (const decision of [
  "allow",
  "allow_always",
  "deny",
  "deny_and_exit_plan",
]) {
  const eventsA: any[] = [],
    eventsB: any[] = [],
    manager = (events: any[]) => ({
      getPermissionRelayChannels: () => [{}],
      broadcastPermissionRequest: (value: any) => events.push(value),
    }),
    logger = { debug() {}, info() {} },
    a = new ChannelPermissionAdapterImpl(manager(eventsA), logger, {
      now: () => 12345,
      random: () => 0,
    }),
    b = Object.assign(new Adapter(), {
      channelManager: manager(eventsB),
      logger,
    });
  const pa = a.createPermissionRequest("call", "Read", "desc", "{}"),
    pb = b.createPermissionRequest("call", "Read", "desc", "{}");
  equal(eventsA, eventsB);
  equal(a.toolCallToRequestId, b.toolCallToRequestId);
  for (const x of [a, b])
    x.handlePermissionResponse({ requestId: "aaaaa", behavior: decision });
  equal(await pa, await pb);
  equal(a.pendingRequests, b.pendingRequests);
  void a.createPermissionRequest("cancel", "Read", "desc", "{}");
  void b.createPermissionRequest("cancel", "Read", "desc", "{}");
  a.cancelRequest("cancel");
  b.cancelRequest("cancel");
  equal(a.pendingRequests, b.pendingRequests);
  equal(a.toolCallToRequestId, b.toolCallToRequestId);
}
console.log(
  `Channel tools/bridges/manager/approval differential passed: ${comparisons} comparisons; fixed bundle SHA-256; fake clients/files/network only.`,
);
