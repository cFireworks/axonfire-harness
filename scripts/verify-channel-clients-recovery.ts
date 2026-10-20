import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash, createCipheriv } from "node:crypto";
import * as WechatConstantModule from "../src/channels/wechat-client-constants.js";
import * as WecomConstantModule from "../src/channels/wecom-client-constants.js";
import * as WechatCredentialModule from "../src/channels/wechat-credential-store.js";
import * as WecomCredentialModule from "../src/channels/wecom-credential-store.js";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import { Subject } from "rxjs";
import {
  WechatClientConstants,
  WecomClientConstants,
} from "../src/channels/channel-client-constants.js";
import { WechatApi } from "../src/channels/wechat-api.js";
import { WechatClient } from "../src/channels/wechat-client.js";
import { WecomBotClient } from "../src/channels/wecom-bot-client.js";
import {
  createWechatClientRuntime,
  createWecomClientRuntime,
} from "../src/channels/channel-client-services.js";
import { createWechatCredentialStore } from "../src/channels/wechat-credential-store.js";
import { createWecomCredentialStore } from "../src/channels/wecom-credential-store.js";
import { createWechatMediaService } from "../src/channels/wechat-media.js";
import { createWecomMediaService } from "../src/channels/wecom-media.js";
import { LivenessWatchdog } from "../src/channels/liveness-watchdog.js";
import { PollWatchdog } from "../src/channels/poll-watchdog.js";
import { WechatClientFactoryImpl } from "../src/channels/wechat-client-factory.js";
import { WecomBotClientFactoryImpl } from "../src/channels/wecom-client-factory.js";
import { LongConnectionClientRegistryImpl } from "../src/channels/long-connection-client-registry.js";
import {
  generateTerminalQRCode,
  getQRCodeVersion,
} from "../src/channels/channel-client-runtime.js";
import {
  clientFixture,
  flushClientFixture,
} from "../test/helpers/channel-client-fixtures.js";
const require = createRequire(import.meta.url),
  filename = process.argv[2];
if (!filename) throw Error("Pass captured bundle path");
const source = await readFile(filename, "utf8");
assert.equal(
  createHash("sha256").update(source).digest("hex"),
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd",
);
let comparisons = 0;
function normalize(value: any): any {
  if (value === undefined) return "[undefined]";
  if (typeof value === "function") return "[function]";
  if (Object.prototype.toString.call(value) === "[object Error]")
    return {
      name: value.name,
      message:
        value.name === "TypeError" ? "[engine TypeError]" : value.message,
    };
  if (Buffer.isBuffer(value) || ArrayBuffer.isView(value))
    return {
      buffer: Buffer.from(
        value.buffer,
        value.byteOffset,
        value.byteLength,
      ).toString("hex"),
    };
  if (
    value &&
    typeof value.aborted === "boolean" &&
    typeof value.addEventListener === "function"
  )
    return { signalAborted: value.aborted };
  if (value instanceof Map || value instanceof Set)
    return [...value].map(normalize);
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
function nativeGraph(f: ReturnType<typeof clientFixture>) {
  const io = f.io,
    cache = new Map<number, any>(),
    ends: Record<number, number> = {
      305: 83782,
      83782: 3470,
      3470: 84163,
      78470: 35714,
      35714: 88795,
      88795: 20816,
      20816: 18685,
      64537: 39437,
      39437: 7835,
      73196: 31268,
    };
  const process = {
      env: io.env,
      pid: io.pid,
      stderr: { write: io.stderrWrite },
    },
    scope = {
      Error,
      Buffer,
      URL,
      Promise,
      Map,
      Set,
      AbortController: io.AbortController,
      AbortSignal: { timeout: io.timeoutSignal },
      Date: { now: io.now },
      Math: Object.assign(Object.create(Math), { random: io.random }),
      process,
      setTimeout: io.setTimeout,
      clearTimeout: io.clearTimeout,
      setInterval: io.setInterval,
      clearInterval: io.clearInterval,
      fetch: io.fetch,
      Bun: io.isBun ? {} : undefined,
      WebSocket: io.globalWebSocket,
    };
  function evaluate(code: string, bindings: any = {}): any {
    return runInNewContext(
      `Object.setPrototypeOf(TypeError.prototype,Error.prototype);${code}`,
      { ...scope, ...bindings },
      { timeout: 1000, contextCodeGeneration: { strings: false, wasm: false } },
    );
  }
  function load(id: number): any {
    if (id === 67389) return io.loadWebSocketModule();
    const primitives: any = {
      54601: io.crypto,
      79896: io.fs,
      70857: io.os,
      16928: io.path,
      92537: { Subject },
      93039: { PathUtils: { getHomeDir: io.getHomeDir } },
      44237: { PathUtils: { getHomeDir: io.getHomeDir } },
      73196: { generateTerminalQRCode: io.generateTerminalQRCode },
      17304: require("qrcode"),
    };
    if (id in primitives) return primitives[id];
    return module(id);
  }
  (load as any).r = () => {};
  (load as any).d = (target: any, entries: any) => {
    for (const [key, get] of Object.entries(entries))
      Object.defineProperty(target, key, { get: get as any, enumerable: true });
  };
  (load as any).n = (value: any) => () => value;
  function module(id: number): any {
    if (cache.has(id)) return cache.get(id);
    if (!ends[id]) throw Error("Unexpected native import " + id);
    const start = source.indexOf(`,${id}(eA,el,ec){`) + 1,
      end = source.indexOf(`},${ends[id]}(eA,el,ec){`, start);
    assert.ok(start > 0 && end > start);
    const target: any = {};
    cache.set(id, target);
    evaluate(`({${source.slice(start, end + 1)}})[${id}]`)(null, target, load);
    return target;
  }
  return { load, module, evaluate };
}
function pair(options: any = {}) {
  const a = clientFixture(options),
    b = clientFixture(options),
    native = nativeGraph(b);
  return { a, b, native };
}
function compareIo(a: any, b: any) {
  equal(a.events, b.events);
  equal(a.files, b.files);
  equal(
    [...a.timers].map(([id, t]: any) => [id, t.delay, t.interval]),
    [...b.timers].map(([id, t]: any) => [id, t.delay, t.interval]),
  );
}
const constants = pair();
equal(WechatClientConstants, constants.native.load(88795));
equal(WecomClientConstants, constants.native.load(39437));
equal(WechatConstantModule, constants.native.load(88795));
equal(WecomConstantModule, constants.native.load(39437));
for (const [module, id] of [
  [WechatCredentialModule, 3470],
  [WecomCredentialModule, 20816],
] as const)
  for (const key of Object.keys(constants.native.load(id)))
    equal(typeof (module as any)[key], typeof constants.native.load(id)[key]);
for (const kind of ["wechat", "wecom"])
  for (const options of [
    {},
    {
      env: {
        CODEBUDDY_WECOM_BOT_ID_BOT: "specific",
        CODEBUDDY_WECOM_BOT_SECRET_BOT: "s",
        CODEBUDDY_WECOM_BOT_ID: "global",
        CODEBUDDY_WECOM_BOT_SECRET: "g",
      },
    },
    {
      files: {
        [`/fixture-home/channels/${kind}/credentials.json`]:
          kind === "wechat"
            ? { apiBaseUrl: "url", token: "t", accountId: "WeChat-A" }
            : { botId: "b", secret: "s" },
        [`/fixture-home/channels/${kind}/credentials.two.json`]:
          kind === "wechat"
            ? { apiBaseUrl: "url", token: "t" }
            : { botId: "b2", secret: "s2" },
        [`/fixture-home/channels/${kind}/credentials.bad.json`]: '{"bad":true}',
      },
    },
    {
      files: {
        [`/fixture-home/channels/${kind}/instances.json`]: '{"not":"array"}',
      },
    },
  ]) {
    const f = pair(options),
      a: any =
        kind === "wechat"
          ? createWechatCredentialStore(f.a.io)
          : createWecomCredentialStore(f.a.io),
      b: any = f.native.load(kind === "wechat" ? 3470 : 20816),
      creds =
        kind === "wechat"
          ? { apiBaseUrl: "url", token: "t" }
          : { botId: "b", secret: "s" };
    for (const method of [
      kind === "wechat"
        ? "listWechatCredentialInstances"
        : "listWecomCredentialInstances",
      "loadAllInstances",
    ]) {
      equal(await outcome(() => a[method]()), await outcome(() => b[method]()));
      compareIo(f.a, f.b);
    }
    const save = kind === "wechat" ? "saveCredentials" : "saveWecomCredentials",
      get = kind === "wechat" ? "loadCredentials" : "loadWecomCredentials",
      clear = kind === "wechat" ? "clearCredentials" : "clearWecomCredentials";
    for (const id of ["default", "bot", "other", "_pending1"]) {
      equal(
        await outcome(() => a[save](creds, id, "Display")),
        await outcome(() => b[save](creds, id, "Display")),
      );
      equal(await outcome(() => a[get](id)), await outcome(() => b[get](id)));
      if (kind === "wecom")
        equal(
          await outcome(() => a.resolveWecomCredentials(id)),
          await outcome(() => b.resolveWecomCredentials(id)),
        );
      compareIo(f.a, f.b);
    }
    if (kind === "wechat") {
      a.cleanupPendingInstances();
      b.cleanupPendingInstances();
      compareIo(f.a, f.b);
      a.saveCredentials(creds, "transient", undefined, false);
      b.saveCredentials(creds, "transient", undefined, false);
    }
    a[clear]("other");
    b[clear]("other");
    compareIo(f.a, f.b);
  }
for (const statuses of [
  [
    {
      status: "confirmed",
      bot_token: "t",
      ilink_bot_id: "A-B_12345",
      baseurl: "https://fixture.invalid",
    },
  ],
  [
    { status: "scaned" },
    { status: "scaned" },
    { status: "expired" },
    { status: "confirmed", bot_token: "t", ilink_bot_id: "account" },
  ],
  Array.from({ length: 4 }, () => ({ status: "expired" })),
  [{ status: "confirmed" }],
])
  for (const id of ["bot", "_pending1", undefined]) {
    const f = pair({ autoSleep: true, qrStatuses: statuses }),
      a = createWechatCredentialStore(f.a.io),
      b = f.native.load(3470),
      eventsA: any[] = [],
      eventsB: any[] = [];
    equal(
      await outcome(() =>
        a.performQrCodeAuth(
          (x: any) => eventsA.push(x),
          "https://fixture.invalid",
          id,
        ),
      ),
      await outcome(() =>
        b.performQrCodeAuth(
          (x: any) => eventsB.push(x),
          "https://fixture.invalid",
          id,
        ),
      ),
    );
    equal(eventsA, eventsB);
    compareIo(f.a, f.b);
  }
for (const input of [
  "fixture",
  "https://fixture.invalid",
  "",
  "x".repeat(500),
]) {
  const f = pair(),
    native = f.native.module(73196);
  equal(
    await generateTerminalQRCode(input),
    await native.generateTerminalQRCode(input),
  );
  equal(getQRCodeVersion(input), native.getQRCodeVersion(input));
  equal(
    await generateTerminalQRCode(input, { version: 1 }),
    await native.generateTerminalQRCode(input, { version: 1 }),
  );
}
for (const options of [
  {},
  { response: { ret: 4, errmsg: "fixture" } },
  { ok: false },
  { response: "not json" },
  { fetchError: Object.assign(Error("abort fixture"), { name: "AbortError" }) },
  { fetchError: Error("fixture failure") },
]) {
  const f = pair(options),
    NativeApi = f.native.load(83782).WechatApi,
    a = new WechatApi(
      { apiBaseUrl: "https://fixture.invalid//", token: "t" },
      f.a.io,
    ),
    b = new NativeApi({ apiBaseUrl: "https://fixture.invalid//", token: "t" });
  for (const [method, args] of [
    ["url", ["route"]],
    ["buildHeaders", ["你好"]],
    ["sendMessage", [{ msg: { value: "你好" }, base_info: { wrong: true } }]],
    ["getUploadUrl", [{}]],
    ["getConfig", ["u", "context"]],
    ["sendTyping", [{}]],
    ["getUpdates", ["cursor", undefined]],
  ] as any) {
    equal(
      await outcome(() => (a as any)[method](...args)),
      await outcome(() => b[method](...args)),
    );
    compareIo(f.a, f.b);
  }
}
for (const length of [0, 1, 15, 16, 17, 1024]) {
  const data = Buffer.alloc(length, 7),
    f = pair({ files: { "/fixture": data } }),
    a = createWechatMediaService(f.a.io),
    b = f.native.load(35714),
    apiA = {
      getUploadUrl: async (input: any) => {
        f.a.events.push(["uploadUrl", input]);
        return { ret: 0, upload_full_url: "https://fixture.invalid/upload" };
      },
    },
    apiB = {
      getUploadUrl: async (input: any) => {
        f.b.events.push(["uploadUrl", input]);
        return { ret: 0, upload_full_url: "https://fixture.invalid/upload" };
      },
    };
  equal(
    await outcome(() => a.uploadMedia(apiA, "/fixture", "user", 1)),
    await outcome(() => b.uploadMedia(apiB, "/fixture", "user", 1)),
  );
  compareIo(f.a, f.b);
}
for (const result of [
  { ret: 3 },
  { ret: 0 },
  { ret: 0, upload_param: "query&?" },
  { upload_full_url: "https://fixture.invalid/upload" },
]) {
  const f = pair({ files: { "/fixture": "data" } }),
    a = createWechatMediaService(f.a.io),
    b = f.native.load(35714);
  equal(
    await outcome(() =>
      a.uploadMedia({ getUploadUrl: async () => result }, "/fixture", "u", 3),
    ),
    await outcome(() =>
      b.uploadMedia({ getUploadUrl: async () => result }, "/fixture", "u", 3),
    ),
  );
  compareIo(f.a, f.b);
}
for (const rawKey of [
  Buffer.alloc(16, 2).toString("base64"),
  Buffer.from("ab".repeat(16)).toString("base64"),
  "invalid",
  undefined,
])
  for (const fields of [
    { full_url: "http://fixture.invalid/file" },
    { encrypt_query_param: "x&?" },
    {},
  ]) {
    const f = pair({ response: Buffer.alloc(16, 0) }),
      a = createWechatMediaService(f.a.io),
      b = f.native.load(35714);
    equal(
      await outcome(() =>
        a.downloadMedia({ ...fields, aes_key: rawKey }, ".bin", undefined),
      ),
      await outcome(() =>
        b.downloadMedia({ ...fields, aes_key: rawKey }, ".bin", undefined),
      ),
    );
    compareIo(f.a, f.b);
  }
for (const url of [
  "http://qpic.cn/x",
  "https://qpic.cn/x",
  "https://media.work.weixin.qq.com/x",
  "https://evil.qpic.cn.evil/x",
  "https://a.myqcloud.com/x",
])
  for (const bytes of [
    Buffer.from([137, 80, 78, 71, 1]),
    Buffer.from([255, 216, 255, 0]),
    Buffer.alloc(16),
  ]) {
    const f = pair({ response: bytes }),
      a = createWecomMediaService(f.a.io),
      nativeMedia = f.native.load(64537),
      clientCtor = nativeMedia.WecomBotClient;
    /* helper functions are lexical in the module: expose through its client extractContent */ const A =
        new WecomBotClient(createWecomClientRuntime(f.a.io)),
      B = new clientCtor();
    A.init(f.a.logger, "bot", "Fixture", {});
    B.init(f.b.logger, "bot", "Fixture", {});
    equal(
      await outcome(() =>
        A.extractContent({
          msgtype: "image",
          image: { url, aeskey: "invalid" },
        }),
      ),
      await outcome(() =>
        B.extractContent({
          msgtype: "image",
          image: { url, aeskey: "invalid" },
        }),
      ),
    );
    compareIo(f.a, f.b);
  }
function clientPair(kind: string, options: any = {}) {
  const f = pair(options),
    a =
      kind === "wechat"
        ? new WechatClient(createWechatClientRuntime(f.a.io))
        : new WecomBotClient(createWecomClientRuntime(f.a.io)),
    C = f.native.load(kind === "wechat" ? 78470 : 64537)[
      kind === "wechat" ? "WechatClient" : "WecomBotClient"
    ],
    b = new C(),
    creds =
      kind === "wechat"
        ? { apiBaseUrl: "https://fixture.invalid", token: "t" }
        : { botId: "b", secret: "s", wsUrl: "ws://fixture.invalid" };
  a.init(f.a.logger, "bot", "Fixture", creds);
  b.init(f.b.logger, "bot", "Fixture", creds);
  a.onMessage.subscribe((event: any) => f.a.events.push(["inbound", event]));
  b.onMessage.subscribe((event: any) => f.b.events.push(["inbound", event]));
  a.onStatusChange.subscribe((event: any) =>
    f.a.events.push(["status", event]),
  );
  b.onStatusChange.subscribe((event: any) =>
    f.b.events.push(["status", event]),
  );
  return { ...f, clientA: a, clientB: b };
}
function clientState(c: any) {
  return Object.fromEntries(
    [
      "clientType",
      "instanceId",
      "displayName",
      "status",
      "credentials",
      "pollCursor",
      "shouldPoll",
      "shouldReconnect",
      "reconnectAttempts",
      "holderId",
      "lastPollActivityAt",
      "lastWsActivityAt",
      "typingTicket",
      "processedMsgIds",
      "msgIdQueue",
    ]
      .map((k) => [k, c[k]])
      .concat([
        [
          "pendingResponses",
          c.pendingResponses ? [...c.pendingResponses.keys()] : undefined,
        ],
        ["ws", c.ws?.readyState],
      ]),
  );
}
function compareClients(f: ReturnType<typeof clientPair>) {
  compareIo(f.a, f.b);
  equal(clientState(f.clientA), clientState(f.clientB));
}
for (const type of [1, 2, 3, 4, 5, 99])
  for (const extra of [
    {},
    { text_item: { text: "fixture" }, voice_item: { text: " spoken " } },
    {
      image_item: { media: {} },
      voice_item: { media: {} },
      file_item: { media: {} },
      video_item: { media: {} },
    },
  ]) {
    const f = clientPair("wechat");
    equal(
      await outcome(() => f.clientA.extractContent([{ type, ...extra }])),
      await outcome(() => f.clientB.extractContent([{ type, ...extra }])),
    );
    compareClients(f);
  }
for (const body of [
  { msgtype: "text", text: { content: "hi" } },
  { msgtype: "voice", voice: { text: " spoken " } },
  { msgtype: "voice", voice: {} },
  { msgtype: "mixed", mixed: {} },
  {
    msgtype: "mixed",
    mixed: {
      msg_item: [
        { msgtype: "text", text: { content: "hi" } },
        { msgtype: "voice", voice: { recognition: " spoken " } },
        { msgtype: "video" },
      ],
    },
  },
  { msgtype: "file", file: {} },
  { msgtype: "unknown" },
]) {
  const f = clientPair("wecom");
  equal(
    await outcome(() => f.clientA.extractContent(body)),
    await outcome(() => f.clientB.extractContent(body)),
  );
  f.clientA.handleMsgCallback({
    headers: { req_id: "r" },
    body: {
      ...body,
      msgid: "m",
      from: { userid: "u" },
      chattype: "group",
      chatid: "room",
    },
  });
  f.clientB.handleMsgCallback({
    headers: { req_id: "r" },
    body: {
      ...body,
      msgid: "m",
      from: { userid: "u" },
      chattype: "group",
      chatid: "room",
    },
  });
  await flushClientFixture();
  compareClients(f);
}
for (const kind of ["wechat", "wecom"]) {
  const f = clientPair(kind);
  for (const c of [f.clientA, f.clientB]) {
    for (let i = 0; i < 1003; i++) c.recordMsgId(String(i));
    c.setStatus("connected");
    c.setStatus("connected");
    c.clearCredentials();
  }
  compareClients(f);
}
for (const options of [{}, { socketResponses: false }]) {
  const f = clientPair("wecom", options);
  if (!options.socketResponses) {
    /* no socket: promise timeout still arms */ const pA =
        f.clientA.sendFrameWithResponse(
          { cmd: "fixture", headers: { req_id: "id" } },
          5,
        ),
      pB = f.clientB.sendFrameWithResponse(
        { cmd: "fixture", headers: { req_id: "id" } },
        5,
      ),
      a = outcome(() => pA),
      b = outcome(() => pB);
    await f.a.fire([...f.a.timers.keys()][0]!);
    await f.b.fire([...f.b.timers.keys()][0]!);
    equal(await a, await b);
    compareClients(f);
    continue;
  }
  await f.clientA.connect();
  await f.clientB.connect();
  await flushClientFixture();
  compareClients(f);
  for (const [method, args] of [
    ["sendReply", [{ platformData: { reqId: "r" } }, "hi"]],
    [
      "sendStreamChunk",
      [{ platformData: { reqId: "r" } }, "chunk", "stream", false],
    ],
    [
      "sendAsyncReply",
      [{ platformData: { chatid: "room", chattype: "group" } }, "hi"],
    ],
    ["sendMediaMessage", ["room", "image", "media", 2]],
  ] as any) {
    equal(
      await outcome(() => (f.clientA as any)[method](...args)),
      await outcome(() => f.clientB[method](...args)),
    );
    compareClients(f);
  }
  for (const data of [
    Buffer.alloc(0),
    Buffer.from("owned"),
    Buffer.alloc(524289, 2),
  ]) {
    equal(
      await f.clientA.uploadMedia(data, { type: "file", filename: "fixture" }),
      await f.clientB.uploadMedia(data, { type: "file", filename: "fixture" }),
    );
    compareClients(f);
  }
  f.clientA.handleEventCallback({
    body: { event: { eventtype: "disconnected_event" } },
  });
  f.clientB.handleEventCallback({
    body: { event: { eventtype: "disconnected_event" } },
  });
  f.clientA.disconnect();
  f.clientB.disconnect();
  await flushClientFixture();
  compareClients(f);
}
for (const kind of ["wechat", "wecom"])
  for (const mode of ["inactive", "boundary", "stale", "throw"]) {
    const f = pair(),
      eventsA: any[] = [],
      eventsB: any[] = [],
      Native = f.native.load(305).LivenessWatchdog,
      deps = (events: any[]) => ({
        isActive: () => mode !== "inactive",
        getLastActivityAt: () =>
          mode === "boundary" ? f.a.io.now() - 90000 : 0,
        onStuck: (ms: any) => {
          events.push(ms);
          if (mode === "throw") throw Error("fixture");
        },
        logger:
          mode === "throw"
            ? f.a.logger
            : { warn: (...args: any[]) => events.push(args) },
        label: "fixture",
      }),
      da = deps(eventsA),
      db = {
        ...deps(eventsB),
        logger:
          mode === "throw"
            ? f.b.logger
            : { warn: (...args: any[]) => eventsB.push(args) },
      },
      a =
        kind === "wechat"
          ? new PollWatchdog(
              {
                ...da,
                getCurrentAbort: () => ({ abort: () => eventsA.push("abort") }),
                onAborted: () => eventsA.push("aborted"),
              },
              {},
              f.a.io,
            )
          : new LivenessWatchdog(da, {}, f.a.io),
      b =
        kind === "wechat"
          ? new (f.native.evaluate(`(${source.slice(9976129, 9976483)})`, {
              ef: { LivenessWatchdog: Native },
            }))({
              ...db,
              getCurrentAbort: () => ({ abort: () => eventsB.push("abort") }),
              onAborted: () => eventsB.push("aborted"),
            })
          : new Native(db, {});
    a.start();
    b.start();
    a.tick();
    b.tick();
    a.stop();
    b.stop();
    equal(eventsA, eventsB);
    compareIo(f.a, f.b);
  }
const regStart = source.indexOf("function makeKey(", 10079000),
  regEnd = source.indexOf("let tm=class", regStart),
  fr = pair(),
  Registry = fr.native.evaluate(
    `(()=>{${source.slice(regStart, regEnd)}return (${source.slice(10079261, 10079689)})})()`,
  );
for (const kind of ["wechat", "wecom"]) {
  const f = pair({
      files: {
        [`/fixture-home/channels/${kind}/instances.json`]: [
          {
            instanceId: "saved",
            displayName: "Saved",
            credentials:
              kind === "wechat"
                ? { apiBaseUrl: "url", token: "t" }
                : { botId: "b", secret: "s" },
          },
        ],
      },
    }),
    registryA = new LongConnectionClientRegistryImpl(),
    registryB = new Registry(),
    storeA =
      kind === "wechat"
        ? createWechatCredentialStore(f.a.io)
        : createWecomCredentialStore(f.a.io),
    storeB = f.native.load(kind === "wechat" ? 3470 : 20816),
    NativeClient = f.native.load(kind === "wechat" ? 78470 : 64537)[
      kind === "wechat" ? "WechatClient" : "WecomBotClient"
    ],
    nativeRuntime =
      kind === "wechat"
        ? createWechatClientRuntime({
            ...f.a.io,
            credentialsStore: storeA as any,
          })
        : createWecomClientRuntime({
            ...f.a.io,
            credentialsStore: storeA as any,
          }),
    makeA = () =>
      kind === "wechat"
        ? new WechatClient(nativeRuntime as any)
        : new WecomBotClient(nativeRuntime as any),
    bridgeA = {
      subscribeToClient: (client: any) =>
        f.a.events.push(["subscribe", client.instanceId]),
    },
    bridgeB = {
      subscribeToClient: (client: any) =>
        f.b.events.push(["subscribe", client.instanceId]),
    },
    a =
      kind === "wechat"
        ? new WechatClientFactoryImpl({
            logger: f.a.logger,
            clientRegistry: registryA,
            credentialsStore: storeA,
            env: f.a.io.env,
            createClient: makeA,
            getBridge: () => bridgeA,
          })
        : new WecomBotClientFactoryImpl({
            logger: f.a.logger,
            clientRegistry: registryA,
            credentialsStore: storeA,
            env: f.a.io.env,
            createClient: makeA,
            getBridge: () => bridgeA,
          }),
    Factory = f.native.evaluate(
      `(${kind === "wechat" ? source.slice(9973452, 9975439) : source.slice(10015182, 10017282)})`,
      {
        eh: storeB,
        ef:
          kind === "wechat"
            ? { WechatClient: NativeClient }
            : { WecomBotClient: NativeClient },
        em: WecomClientConstants,
        ed: { ContainerUtil: { get: () => bridgeB } },
        ec: () =>
          kind === "wechat"
            ? { WechatChannelBridge: {} }
            : { WecomBotChannelBridge: {} },
      },
    ),
    b = Object.assign(new Factory(), {
      logger: f.b.logger,
      clientRegistry: registryB,
    });
  a.initialize();
  b.initialize();
  compareIo(f.a, f.b);
  const credentials =
    kind === "wechat" ? undefined : { botId: "b", secret: "s" };
  equal(
    await outcome(() => clientState(a.create("new", credentials))),
    await outcome(() => clientState(b.create("new", credentials))),
  );
  equal(
    await outcome(() => a.create("new", credentials)),
    await outcome(() => b.create("new", credentials)),
  );
  compareIo(f.a, f.b);
  equal(
    registryA.getAll().map(clientState),
    registryB.getAll().map(clientState),
  );
  if (kind === "wechat") {
    const aa = a.get("new"),
      bb = b.get("new");
    aa.instanceId = "renamed";
    bb.instanceId = "renamed";
    aa.onInstanceIdChanged("new", "renamed");
    bb.onInstanceIdChanged("new", "renamed");
  }
  a.remove(kind === "wechat" ? "renamed" : "new");
  b.remove(kind === "wechat" ? "renamed" : "new");
  equal(
    registryA.getAll().map(clientState),
    registryB.getAll().map(clientState),
  );
  compareIo(f.a, f.b);
}
// Original WeChat sends/API/media, poll filters, connect/QR rename and teardown.
{
  const options = {
      files: { "/fixture.png": "owned image", "/fixture.pdf": "owned file" },
      fetch: async (url: any, _config: any, response: any) =>
        response(
          String(url).endsWith("getuploadurl")
            ? { ret: 0, upload_param: "owned-query" }
            : { ret: 0 },
        ),
    },
    f = clientPair("wechat", options),
    Api = f.native.load(83782).WechatApi;
  f.clientA.api = new WechatApi(f.clientA.credentials, f.a.io);
  f.clientB.api = new Api(f.clientB.credentials);
  const context = {
    userId: "u",
    platformData: { context_token: "0123456789" },
  };
  for (const [method, args] of [
    ["sendReply", [context, "你好"]],
    ["sendImageReply", [context, "/fixture.png", "caption"]],
    ["sendFileReply", [context, "/fixture.pdf", undefined]],
    ["sendTypingStart", ["u"]],
    ["sendTypingCancel", ["u"]],
  ] as any) {
    f.clientA.typingTicket = "ticket";
    f.clientB.typingTicket = "ticket";
    equal(
      await outcome(() => (f.clientA as any)[method](...args)),
      await outcome(() => f.clientB[method](...args)),
    );
    compareClients(f);
  }
}
for (const qr of [false, true]) {
  const f = clientPair("wechat", { autoSleep: true });
  for (const [c, io] of [
    [f.clientA, f.a],
    [f.clientB, f.b],
  ] as any) {
    c.pollLoop = async () => io.events.push(["poll-start"]);
    if (qr) {
      c.credentials = null;
      c.instanceId = "_pending1";
      c.onInstanceIdChanged = (before: any, after: any) =>
        io.events.push(["rename-client", before, after]);
    }
  }
  equal(
    await outcome(() => f.clientA.connect()),
    await outcome(() => f.clientB.connect()),
  );
  await flushClientFixture();
  compareClients(f);
  equal(
    await outcome(() => f.clientA.connect()),
    await outcome(() => f.clientB.connect()),
  );
  f.clientA.disconnect();
  f.clientB.disconnect();
  await flushClientFixture();
  compareClients(f);
}
{
  const f = clientPair("wechat");
  for (const [c, io] of [
    [f.clientA, f.a],
    [f.clientB, f.b],
  ] as any) {
    let count = 0;
    c.shouldPoll = true;
    c.api = {
      getUpdates: async (cursor: any, signal: any) => {
        io.events.push(["getUpdates", cursor, signal]);
        return ++count === 1
          ? {
              ret: 0,
              get_updates_buf: "cursor",
              msgs: [
                {
                  message_id: 1,
                  message_type: 1,
                  message_state: 2,
                  from_user_id: "u",
                  item_list: [{ type: 1, text_item: { text: "owned" } }],
                },
                {
                  message_id: 1,
                  message_type: 1,
                  message_state: 2,
                  item_list: [],
                },
                { message_id: 2, message_type: 2, message_state: 2 },
                { message_id: 3, message_type: 1, message_state: 1 },
              ],
            }
          : { ret: 1, errcode: -14 };
      },
    };
  }
  equal(
    await outcome(() => f.clientA.pollLoop()),
    await outcome(() => f.clientB.pollLoop()),
  );
  compareClients(f);
  f.clientA.writeLockFile();
  f.clientB.writeLockFile();
  equal(f.clientA.isLockHolder(), f.clientB.isLockHolder());
  f.clientA.removeLockFile();
  f.clientB.removeLockFile();
  compareClients(f);
}
for (const configured of [false, true]) {
  const options = configured
      ? {
          autoSleep: true,
          env: {
            CODEBUDDY_WECOM_BOT_ID_BOT: "b",
            CODEBUDDY_WECOM_BOT_SECRET_BOT: "s",
          },
        }
      : { autoSleep: true },
    f = clientPair("wecom", options);
  equal(
    await outcome(() => f.clientA.promptForCredentials()),
    await outcome(() => f.clientB.promptForCredentials()),
  );
  compareClients(f);
}
for (const failCount of [0, 2, 3]) {
  const f = clientPair("wecom", { autoSleep: true });
  for (const [c, io] of [
    [f.clientA, f.a],
    [f.clientB, f.b],
  ] as any) {
    let attempts = 0;
    c.sendFrameWithResponse = async (frame: any) => {
      io.events.push(["upload-frame", frame]);
      if (frame.cmd.endsWith("init")) return { body: { upload_id: "upload" } };
      if (frame.cmd.endsWith("chunk") && ++attempts <= failCount)
        throw Error("fixture retry");
      return { body: { media_id: "media" } };
    };
  }
  equal(
    await outcome(() =>
      f.clientA.uploadMedia(Buffer.from("owned"), {
        type: "file",
        filename: "fixture",
      }),
    ),
    await outcome(() =>
      f.clientB.uploadMedia(Buffer.from("owned"), {
        type: "file",
        filename: "fixture",
      }),
    ),
  );
  compareClients(f);
}
{
  const f = clientPair("wecom");
  await f.clientA.connect();
  await f.clientB.connect();
  await flushClientFixture();
  f.a.advance(90001);
  f.b.advance(90001);
  f.clientA.watchdog.tick();
  f.clientB.watchdog.tick();
  await flushClientFixture();
  compareClients(f);
  const a = [...f.a.timers].find(([, t]) => !t.interval && t.delay < 30000)![0],
    b = [...f.b.timers].find(([, t]) => !t.interval && t.delay < 30000)![0];
  await f.a.fire(a);
  await f.b.fire(b);
  await flushClientFixture();
  compareClients(f);
  f.clientA.disconnect();
  f.clientB.disconnect();
  await flushClientFixture();
  compareClients(f);
}
for (const errcode of [undefined, 0, 4]) {
  const f = clientPair("wecom", { socketResponses: false }),
    pa = f.clientA.sendFrameWithResponse({
      cmd: "fixture",
      headers: { req_id: "r" },
    }),
    pb = f.clientB.sendFrameWithResponse({
      cmd: "fixture",
      headers: { req_id: "r" },
    }),
    oa = outcome(() => pa),
    ob = outcome(() => pb),
    frame =
      errcode === undefined
        ? { headers: { req_id: "r" }, body: { value: 1 } }
        : { headers: { req_id: "r" }, errcode, errmsg: "fixture" };
  f.clientA.handleFrame(frame, undefined);
  f.clientB.handleFrame(frame, undefined);
  equal(await oa, await ob);
  compareClients(f);
}
for (const padding of ["valid", "zero", "large", "mismatch"]) {
  const key = Buffer.alloc(32, 7),
    payload = Buffer.from([137, 80, 78, 71, 1]),
    pad = 32 - payload.length,
    plain = Buffer.concat([payload, Buffer.alloc(pad, pad)]);
  if (padding === "zero") plain[plain.length - 1] = 0;
  if (padding === "large") plain[plain.length - 1] = 33;
  if (padding === "mismatch") plain[plain.length - 2] = 2;
  const cipher = createCipheriv("aes-256-cbc", key, key.subarray(0, 16));
  cipher.setAutoPadding(false);
  const encrypted = Buffer.concat([cipher.update(plain), cipher.final()]),
    f = clientPair("wecom", { response: encrypted }),
    body = {
      msgtype: "image",
      image: {
        url: "https://fixture.qpic.cn/x",
        aeskey: key.toString("base64"),
      },
    };
  equal(
    await f.clientA.extractContent(body),
    await f.clientB.extractContent(body),
  );
  compareClients(f);
}
{
 const a=clientFixture(),b=clientFixture();a.io.isBun=true;b.io.isBun=true;a.io.globalWebSocket=a.FakeSocket;b.io.globalWebSocket=b.FakeSocket;
 const native=nativeGraph(b),A=new WecomBotClient(createWecomClientRuntime(a.io)),B=new(native.load(64537).WecomBotClient)();A.init(a.logger,"bot","Fixture",{botId:"b",secret:"s"});B.init(b.logger,"bot","Fixture",{botId:"b",secret:"s"});await A.connect();await B.connect();await flushClientFixture();equal(clientState(A),clientState(B));compareIo(a,b);A.disconnect();B.disconnect();await flushClientFixture();compareIo(a,b);
}
console.log(
  `Channel clients/API/media/auth/watchdog/factory differential passed: ${comparisons} comparisons; fixed SHA-256; all transport, credentials and timers injected.`,
);
