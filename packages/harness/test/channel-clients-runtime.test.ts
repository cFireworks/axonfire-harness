import assert from "node:assert/strict";
import test from "node:test";
import * as crypto from "node:crypto";
import { mkdtemp, rm, readFile, writeFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import {
  WechatClientConstants as WC,
  WecomClientConstants as WW,
} from "../src/channels/channel-client-constants.js";
import { WechatApi, randomWechatUin } from "../src/channels/wechat-api.js";
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
import { createNativeChannelClients } from "../src/channels/native-channel-clients.js";
import {
  generateTerminalQRCode,
  getQRCodeVersion,
  createChannelClientIoRuntime,
} from "../src/channels/channel-client-runtime.js";
import { createHarness } from "../src/runtime/create-harness.js";
import { createOwnedChannelFetch } from "../src/channels/owned-channel-fetch.js";
import {
  clientFixture,
  flushClientFixture,
} from "./helpers/channel-client-fixtures.js";
setTraceProcessors([]);
const require = createRequire(import.meta.url),
  wechatCredentials = {
    apiBaseUrl: "https://fixture.invalid",
    token: "fixture-token",
    accountId: "fixture-account",
  },
  wecomCredentials = {
    botId: "fixture-bot",
    secret: "fixture-secret",
    wsUrl: "ws://fixture.invalid",
  };
function wc(options: any = {}) {
  const f = clientFixture(options),
    runtime = createWechatClientRuntime(f.io),
    client = new WechatClient(runtime);
  client.init(f.logger, "bot", "Fixture", wechatCredentials);
  return { ...f, runtime, client };
}
function ww(options: any = {}) {
  const f = clientFixture(options),
    runtime = createWecomClientRuntime(f.io),
    client = new WecomBotClient(runtime);
  client.init(f.logger, "bot", "Fixture", wecomCredentials);
  return { ...f, runtime, client };
}
async function root(t: { after(fn: () => any): void }) {
  const dir = await mkdtemp(join(tmpdir(), "harness-channel-clients-")),
    closers: Array<() => any> = [];
  t.after(async () => {
    try {
      for (const close of closers) await close();
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
  return { dir, close: (fn: () => any) => closers.unshift(fn) };
}
test("client constants and isolated native dependency versions retain the sample", () => {
  assert.equal(WC.DEFAULT_POLL_TIMEOUT_MS, 35000);
  assert.equal(WC.ERRCODE_SESSION_TIMEOUT, -14);
  assert.equal(WC.DEFAULT_DEDUP_WINDOW_SIZE, 500);
  assert.equal(WW.DEFAULT_DEDUP_WINDOW_SIZE, 1000);
  assert.equal(require("ws-native/package.json").version, "8.18.3");
  assert.equal(require("qrcode/package.json").version, "1.5.4");
});
test("WechatApi preserves UTF8 headers, UIN, base_info overwrite, URL strip-one-slash and credentials update", async () => {
  const f = clientFixture(),
    api = new WechatApi(wechatCredentials, f.io);
  assert.equal(
    randomWechatUin(f.io),
    Buffer.from(String(0x01010101)).toString("base64"),
  );
  await api.sendMessage({ msg: { text: "你好" }, base_info: { wrong: true } });
  const [, url, config] = f.events.find((e) => e[0] === "fetch")!;
  assert.equal(url, "https://fixture.invalid/ilink/bot/sendmessage");
  assert.equal(config.headers.Authorization, "Bearer fixture-token");
  assert.equal(
    config.headers["Content-Length"],
    String(Buffer.byteLength(config.body)),
  );
  assert.deepEqual(JSON.parse(config.body).base_info, {
    channel_version: "cbc-1.0.0",
  });
  api.updateCredentials({ apiBaseUrl: "https://fixture.invalid//" });
  assert.equal(api.url("x"), "https://fixture.invalid//ilink/bot/x");
  assert.equal(api.buildHeaders("{}").Authorization, undefined);
  assert.equal(f.timers.size, 0);
});
test("WechatApi retains nonzero-ret handling, HTTP/JSON errors and AbortError-only poll fallback", async () => {
  let f = clientFixture({ response: { ret: 7, errmsg: "fixture" } }),
    api = new WechatApi(wechatCredentials, f.io);
  await assert.rejects(api.sendMessage({}), /ret=7/);
  assert.ok(f.events.some((e) => e[0] === "stderr"));
  f = clientFixture({ ok: false });
  await assert.rejects(
    new WechatApi(wechatCredentials, f.io).getConfig("u", "token"),
    /HTTP 500/,
  );
  const aborted = Object.assign(Error("fixture abort"), { name: "AbortError" });
  assert.deepEqual(
    await new WechatApi(
      wechatCredentials,
      clientFixture({ fetchError: aborted }).io,
    ).getUpdates("cursor", undefined),
    { ret: 0, msgs: [], get_updates_buf: "cursor" },
  );
  await assert.rejects(
    new WechatApi(
      wechatCredentials,
      clientFixture({ fetchError: Error("other") }).io,
    ).getUpdates("c", undefined),
    /other/,
  );
});
test("WechatApi clears timeout before response body completes, retaining the native header-only deadline", async () => {
  let release!: (x: string) => void;
  const f = clientFixture({
      fetch: async () => ({
        ok: true,
        text: () =>
          new Promise<string>((resolve) => {
            release = resolve;
          }),
      }),
    }),
    api = new WechatApi(wechatCredentials, f.io),
    pending = api.post("fixture", {}, 100, undefined);
  await flushClientFixture();
  assert.equal(f.timers.size, 0);
  release('{"ret":0}');
  assert.deepEqual(await pending, { ret: 0 });
});
test("WeChat store migration, 0600 tmp rename, cleanup and persist=false use only the memory fixture", () => {
  const f = clientFixture({
      files: {
        "/fixture-home/channels/wechat/credentials.json": wechatCredentials,
        "/fixture-home/channels/wechat/credentials.extra.json": {
          ...wechatCredentials,
          accountId: "extra",
        },
      },
    }),
    store = createWechatCredentialStore(f.io);
  assert.deepEqual(store.listWechatCredentialInstances(), ["fixture", "extra"]);
  assert.ok(f.events.some((e) => e[0] === "chmod" && e[2] === 384));
  store.saveCredentials(wechatCredentials, "_pending1", undefined, true);
  store.cleanupPendingInstances();
  assert.equal(store.loadCredentials("_pending1"), undefined);
  store.saveCredentials(wechatCredentials, "transient", undefined, false);
  assert.equal(store.loadCredentials("transient"), undefined);
  store.clearCredentials("extra");
  assert.deepEqual(store.listWechatCredentialInstances(), ["fixture"]);
});
test("WeCom credentials preserve instance/default env precedence and legacy storage format", () => {
  const f = clientFixture({
      env: {
        CODEBUDDY_WECOM_BOT_ID_BOT: "specific",
        CODEBUDDY_WECOM_BOT_SECRET_BOT: "secret",
        CODEBUDDY_WECOM_BOT_ID: "global",
        CODEBUDDY_WECOM_BOT_SECRET: "global-secret",
      },
      files: {
        "/fixture-home/channels/wecom/credentials.json": wecomCredentials,
      },
    }),
    store = createWecomCredentialStore(f.io);
  assert.equal(store.resolveWecomCredentials("bot").botId, "specific");
  assert.equal(store.resolveWecomCredentials("default").botId, "global");
  assert.equal(store.loadWecomCredentials("default").botId, "fixture-bot");
  store.saveWecomCredentials(wecomCredentials, "other");
  assert.equal(store.listWecomCredentialInstances().includes("other"), true);
  store.clearWecomCredentials("other");
  assert.equal(store.loadWecomCredentials("other"), undefined);
});
test("QR auth keeps scanned spelling, three refreshes, confirmed validation and pending persistence", async () => {
  const f = clientFixture({
      autoSleep: true,
      qrStatuses: [
        { status: "scaned" },
        { status: "scaned" },
        { status: "expired" },
        {
          status: "confirmed",
          bot_token: "fixture-token",
          ilink_bot_id: "fixture-account",
        },
      ],
    }),
    store = createWechatCredentialStore(f.io),
    events: any[] = [];
  await store.performQrCodeAuth(
    (event: any) => events.push(event),
    "https://fixture.invalid",
    "_pending1",
  );
  assert.equal(events.filter((e) => e.type === "scanned").length, 1);
  assert.equal(store.loadCredentials("_pending1"), undefined);
  assert.ok(events.some((e) => e.type === "expired"));
  const bad = createWechatCredentialStore(
    clientFixture({
      autoSleep: true,
      qrStatuses: Array.from({ length: 4 }, () => ({ status: "expired" })),
    }).io,
  );
  await assert.rejects(
    bad.performQrCodeAuth(() => {}, "https://fixture.invalid", "id"),
    /expired too many times/,
  );
  await assert.rejects(
    createWechatCredentialStore(
      clientFixture({ qrStatuses: [{ status: "confirmed" }] }).io,
    ).performQrCodeAuth(() => {}, "https://fixture.invalid", "id"),
    /no credentials/,
  );
});
test("terminal QR renderer uses captured qrcode options and original failure fallbacks", async () => {
  assert.equal(
    await generateTerminalQRCode("https://fixture.invalid"),
    (
      await require("qrcode").toString("https://fixture.invalid", {
        type: "utf8",
        errorCorrectionLevel: "M",
        margin: 0,
        version: undefined,
      })
    ).trimEnd(),
  );
  assert.equal(
    await generateTerminalQRCode("x".repeat(500), { version: 1 }),
    "",
  );
  assert.ok(getQRCodeVersion("fixture") >= 1);
});
test("WeChat media preserves AES128 ECB padding, raw/hex-base64 keys and upload request/ciphertext", async () => {
  const f = clientFixture({ files: { "/fixture/file": "owned media" } }),
    media = createWechatMediaService(f.io),
    requests: any[] = [];
  for (const size of [0, 1, 15, 16, 17])
    assert.equal(media.aesEcbPaddedSize(size), 16 * Math.ceil((size + 1) / 16));
  const key = Buffer.alloc(16, 3);
  assert.deepEqual(media.parseAesKey(key.toString("base64")), key);
  assert.deepEqual(
    media.parseAesKey(Buffer.from(key.toString("hex")).toString("base64")),
    key,
  );
  assert.throws(() => media.parseAesKey("Zg=="), /16 raw bytes/);
  const result = await media.uploadMedia(
    {
      getUploadUrl: async (input: any) => {
        requests.push(input);
        return { ret: 0, upload_full_url: "https://fixture.invalid/upload" };
      },
    },
    "/fixture/file",
    "user",
    1,
  );
  const frame = f.events.find((e) => e[0] === "fetch")!;
  assert.deepEqual(
    media.decryptAesEcb(
      Buffer.from(frame[2].body),
      Buffer.from(result.aeskey, "hex"),
    ),
    Buffer.from("owned media"),
  );
  assert.equal(requests[0].media_type, 1);
  assert.equal(
    requests[0].rawfilemd5,
    crypto.createHash("md5").update("owned media").digest("hex"),
  );
  assert.equal(result.downloadEncryptedQueryParam, "fixture-download");
});
test("WeChat media download decrypts into its temp protocol path with no timeout or URL allowlist", async () => {
  const key = Buffer.alloc(16, 4),
    plain = Buffer.from("owned download"),
    cipher = crypto.createCipheriv("aes-128-ecb", key, null),
    encrypted = Buffer.concat([cipher.update(plain), cipher.final()]),
    f = clientFixture({ response: encrypted }),
    media = createWechatMediaService(f.io),
    file = await media.downloadMedia(
      {
        full_url: "http://untrusted.fixture.invalid/fixture",
        aes_key: key.toString("base64"),
      },
      ".bin",
    );
  assert.deepEqual(f.files.get(file), plain);
  const fetch = f.events.find((e) => e[0] === "fetch")!;
  assert.equal(fetch[1], "http://untrusted.fixture.invalid/fixture");
  assert.equal(fetch[2].signal, undefined);
  assert.equal(media.extensionForType(4), "");
});
test("WeCom media keeps trusted HTTPS/no-redirect policy, plaintext image bypass and 32-byte padding checks", async () => {
  const f = clientFixture({ response: Buffer.from([137, 80, 78, 71, 1]) }),
    media = createWecomMediaService(f.io);
  for (const url of [
    "http://wework.qpic.cn/x",
    "https://evil.invalid/x",
    "https://qpic.cn.evil.invalid/x",
  ])
    assert.throws(() => media.validateMediaUrl(url));
  const file = await media.downloadWecomBotMedia(
    "https://wework.qpic.cn/x",
    "invalid-key",
    ".jpg",
  );
  assert.match(file, /\.png$/);
  assert.equal(f.events.find((e) => e[0] === "fetch")![2].redirect, "error");
  const key = Buffer.alloc(32, 7),
    plain = Buffer.from("owned payload"),
    pad = 32 - plain.length,
    padded = Buffer.concat([plain, Buffer.alloc(pad, pad)]),
    cipher = crypto.createCipheriv("aes-256-cbc", key, key.subarray(0, 16));
  cipher.setAutoPadding(false);
  const encrypted = Buffer.concat([cipher.update(padded), cipher.final()]);
  assert.deepEqual(
    media.decryptAes256Cbc(encrypted, key.toString("base64")),
    plain,
  );
  const invalid = crypto.createCipheriv(
    "aes-256-cbc",
    key,
    key.subarray(0, 16),
  );
  invalid.setAutoPadding(false);
  assert.throws(
    () =>
      media.decryptAes256Cbc(
        Buffer.concat([invalid.update(Buffer.alloc(16)), invalid.final()]),
        key.toString("base64"),
      ),
    /padding value/,
  );
});
test("watchdogs preserve strict stale threshold, repeated tick recovery and poll abort", () => {
  const f = clientFixture();
  let activity = f.io.now(),
    recover = 0;
  const dog = new LivenessWatchdog(
    {
      isActive: () => true,
      getLastActivityAt: () => activity,
      onStuck: () => recover++,
      logger: f.logger,
      label: "fixture",
    },
    {},
    f.io,
  );
  dog.start();
  dog.start();
  assert.equal(f.timers.size, 1);
  f.advance(90000);
  dog.tick();
  assert.equal(recover, 0);
  f.advance(1);
  dog.tick();
  dog.tick();
  assert.equal(recover, 2);
  dog.stop();
  let aborted = false;
  const poll = new PollWatchdog(
    {
      isActive: () => true,
      getLastActivityAt: () => 0,
      getCurrentAbort: () => ({ abort: () => (aborted = true) }),
      onAborted: () => activity++,
      logger: f.logger,
    },
    { stuckMs: 1 },
    f.io,
  );
  poll.tick();
  assert.equal(aborted, true);
});
test("WeChat client sends caption and image as separate API messages and preserves hex-ascii aes_key", async () => {
  const f = wc(),
    sent: any[] = [],
    uploads: any[] = [];
  f.client.api = { sendMessage: async (x: any) => sent.push(x) };
  f.runtime.media.uploadMedia = async (...args: any[]) => {
    uploads.push(args);
    return {
      downloadEncryptedQueryParam: "query",
      aeskey: "ab".repeat(16),
      fileSizeCiphertext: 32,
      fileSize: 11,
    };
  };
  const context = {
    userId: "user",
    platformData: { context_token: "0123456789" },
  };
  await f.client.sendImageReply(context, "/fixture.png", "caption");
  assert.equal(sent.length, 2);
  assert.equal(sent[0].msg.item_list[0].type, 1);
  assert.equal(sent[1].msg.item_list[0].type, 2);
  assert.equal(
    sent[1].msg.item_list[0].image_item.media.aes_key,
    Buffer.from("ab".repeat(16)).toString("base64"),
  );
  await f.client.sendFileReply(context, "/fixture.pdf", undefined);
  assert.equal(uploads[1][3], 3);
  assert.equal(sent[2].msg.item_list[0].type, 4);
});
test("WeChat extraction/dedup/filter/cursor/session-timeout preserve poll behavior", async () => {
  const f = wc(),
    received: any[] = [];
  f.client.onMessage.subscribe((value: any) => received.push(value));
  f.client.shouldPoll = true;
  let call = 0;
  f.client.api = {
    getUpdates: async () =>
      ++call === 1
        ? {
            ret: 0,
            get_updates_buf: "cursor",
            msgs: [
              {
                message_id: 1,
                message_type: 1,
                message_state: 2,
                from_user_id: "u",
                item_list: [{ type: 1, text_item: { text: "owned inbound" } }],
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
        : { ret: 1, errcode: -14 },
  };
  await f.client.pollLoop();
  assert.equal(received.length, 1);
  assert.equal(received[0].replyContext.conversationId, "wechat_bot_u");
  assert.equal(f.client.pollCursor, "cursor");
  assert.equal(f.client.shouldPoll, false);
  assert.equal(f.client.status, "disconnected");
  assert.deepEqual(
    await f.client.extractContent([{ type: 3, voice_item: { text: " hi " } }]),
    { text: "[语音转文字] hi", mediaFiles: [] },
  );
  for (let i = 0; i < 501; i++) f.client.recordMsgId(String(i));
  assert.equal(f.client.msgIdQueue.length, 500);
});
test("WeChat locks are owner checked; backoff cancel retains an unresolved original waiter", async () => {
  const f = wc();
  f.client.writeLockFile();
  assert.equal(f.client.isLockHolder(), true);
  f.put(f.client.getLockFilePath(), "other-owner");
  assert.equal(f.client.isLockHolder(), false);
  f.client.removeLockFile();
  assert.equal(f.files.has(f.client.getLockFilePath()), true);
  let resolved = false;
  void f.client.backoffDelay().then(() => (resolved = true));
  f.client.clearReconnectTimer();
  await flushClientFixture();
  assert.equal(resolved, false);
  assert.equal(f.client.reconnectAttempts, 1);
});
test("WeCom handshake, response-free sends, status dedup and original leftover connection timer", async () => {
  const f = ww(),
    statuses: any[] = [];
  f.client.onStatusChange.subscribe((value: any) => statuses.push(value));
  await f.client.connect();
  assert.equal(f.client.status, "connected");
  assert.ok(
    f.events.some(
      (e) =>
        e[0] === "frame" &&
        e[1].cmd === "aibot_subscribe" &&
        e[1].body.secret === "fixture-secret",
    ),
  );
  await f.client.sendAsyncReply(
    { platformData: { chatid: "room", chattype: "group" } },
    "owned markdown",
  );
  assert.equal(
    f.events.filter((e) => e[0] === "frame").at(-1)![1].body.chat_type,
    2,
  );
  assert.ok(
    [...f.timers.values()].some((t) => !t.interval && t.delay === 30000),
  );
  f.client.setStatus("connected");
  assert.equal(statuses.filter((x) => x.status === "connected").length, 1);
  f.client.dispose();
  await flushClientFixture();
});
test("WeCom upload uses MD5/512KiB chunks, zero-byte init/finish and >100 chunk rejection", async () => {
  const f = ww();
  await f.client.connect();
  const data = Buffer.alloc(524289, 9),
    result = await f.client.uploadMedia(data, {
      type: "image",
      filename: "fixture.png",
    });
  assert.equal(result.media_id, "fixture-media");
  const frames = f.events.filter((e) => e[0] === "frame").map((e) => e[1]),
    init = frames.find((e) => e.cmd === "aibot_upload_media_init");
  assert.equal(init.body.total_chunks, 2);
  assert.equal(
    init.body.md5,
    crypto.createHash("md5").update(data).digest("hex"),
  );
  assert.deepEqual(
    frames
      .filter((e) => e.cmd === "aibot_upload_media_chunk")
      .map((e) => Buffer.from(e.body.base64_data, "base64").length),
    [524288, 1],
  );
  await f.client.uploadMedia(Buffer.alloc(0), {
    type: "file",
    filename: "zero",
  });
  await assert.rejects(
    f.client.uploadMedia(
      { length: 524288 * 100 + 1 },
      { type: "file", filename: "large" },
    ),
    /maximum of 100/,
  );
  f.client.dispose();
  await flushClientFixture();
});
test("WeCom chunk retry delays are 500/1000 and finish/init omissions retain their errors", async () => {
  const f = ww({ autoSleep: true });
  let attempts = 0;
  f.client.sendFrameWithResponse = async (frame: any) => {
    if (frame.cmd.endsWith("init")) return { body: { upload_id: "upload" } };
    if (frame.cmd.endsWith("chunk") && ++attempts < 3)
      throw Error("fixture retry");
    return { body: { media_id: "media" } };
  };
  assert.equal(
    (
      await f.client.uploadMedia(Buffer.from("x"), {
        type: "file",
        filename: "x",
      })
    ).media_id,
    "media",
  );
  assert.equal(attempts, 3);
  assert.deepEqual(
    f.events.filter((e) => e[0] === "setTimeout").map((e) => e[2]),
    [500, 1000],
  );
  f.client.sendFrameWithResponse = async () => ({});
  await assert.rejects(
    f.client.uploadMedia(Buffer.alloc(0), { type: "file", filename: "x" }),
    /no upload_id/,
  );
});
test("WeCom pending frame timeout exists even with no socket; close rejects matched waiters", async () => {
  const f = ww(),
    promise = f.client.sendFrameWithResponse(
      { cmd: "fixture", headers: { req_id: "id" } },
      5,
    ),
    rejected = assert.rejects(promise, /timed out after 5ms/);
  await f.fire([...f.timers.keys()][0]!);
  await rejected;
  const other = f.client.sendFrameWithResponse({
      cmd: "fixture",
      headers: { req_id: "other" },
    }),
    closed = assert.rejects(other, /closed fixture/);
  f.client.rejectAllPendingResponses("closed fixture");
  await closed;
  assert.equal(f.client.pendingResponses.size, 0);
});
test("WeCom callback routes, welcome, disconnected event and mixed STT keep native text", async () => {
  const f = ww(),
    received: any[] = [];
  f.client.onMessage.subscribe((x: any) => received.push(x));
  f.client.handleMsgCallback({
    headers: { req_id: "r" },
    body: {
      msgid: "m",
      msgtype: "text",
      text: { content: "hi" },
      chattype: "single",
      from: { userid: "u" },
    },
  });
  await flushClientFixture();
  assert.equal(received[0].replyContext.conversationId, "wecom_u_u");
  f.client.handleEventCallback({
    body: { event: { eventtype: "disconnected_event" } },
  });
  assert.equal(f.client.shouldReconnect, false);
  const result = await f.client.extractContent({
    msgtype: "mixed",
    mixed: {
      msg_item: [
        { msgtype: "text", text: { content: "text" } },
        { msgtype: "voice", voice: { recognition: " spoken " } },
        { msgtype: "video" },
      ],
    },
  });
  assert.equal(result.text, "text\n[语音转文字] spoken");
  assert.equal(
    (await f.client.extractContent({ msgtype: "mixed", mixed: {} })).text,
    "[mixed 消息结构缺失或 msg_item 为空]",
  );
});
test("native factories/registry preserve duplicate guards, colon keys, rename and no auto-connect", () => {
  const f = clientFixture(),
    subscribed: any[] = [],
    native = createNativeChannelClients(
      "/fixture-home",
      {
        io: f.io,
        wechatInstances: [
          { instanceId: "bot", credentials: wechatCredentials },
        ],
        wecomInstances: [{ instanceId: "bot", credentials: wecomCredentials }],
      },
      () => ({ subscribeToClient: (client: any) => subscribed.push(client) }),
      f.logger,
    );
  native.initializeConfigured();
  assert.equal(native.registry.getAll().length, 2);
  assert.equal(subscribed.length, 2);
  assert.equal(f.sockets.length, 0);
  assert.equal(native.wechatFactory.get("bot").status, "disconnected");
  assert.throws(() => native.wechatFactory.create("bot"), /already exists/);
  const client = native.wechatFactory.get("bot");
  client.instanceId = "new";
  client.onInstanceIdChanged("bot", "new");
  assert.equal(native.registry.get("wechat", "new"), client);
  assert.equal(native.wechatFactory.get("bot"), undefined);
  native.close();
  assert.throws(
    () => native.wecomFactory.create("other", wecomCredentials),
    /closed/,
  );
});
test("harness native composition is explicit, transient-credential based and owned on close", async (t) => {
  const dir = await root(t),
    f = clientFixture(),
    h = await createHarness({
      workDir: dir.dir,
      modelProvider: {
        getModel() {
          throw Error("unused model");
        },
      },
      channels: {
        native: {
          io: f.io,
          wechatInstances: [
            { instanceId: "bot", credentials: wechatCredentials },
          ],
        },
      },
    });
  dir.close(() => h.close());
  assert.ok(h.channelClients);
  const client = h.channelClients!.wechatFactory.get("bot");
  assert.equal(client.credentials.token, "fixture-token");
  assert.equal(client.onMessage.observers.length, 1);
  assert.equal(h.wechatReplyTool.isEnabled(), false);
  await h.close();
  assert.equal(client.onMessage.observers.length, 0);
  assert.equal(
    [...f.files.keys()].some((key) => key.includes("instances.json")),
    false,
  );
});
test("owned real credential files reload through native factories without connecting", async (t) => {
  const dir = await root(t),
    io = createChannelClientIoRuntime({ getHomeDir: () => dir.dir, env: {} }),
    wechat = createWechatCredentialStore(io),
    wecom = createWecomCredentialStore(io);
  wechat.saveCredentials(
    { ...wechatCredentials, token: "owned-test-token" },
    "owned",
    "Owned",
    true,
  );
  wecom.saveWecomCredentials(wecomCredentials, "owned", "Owned");
  if (process.platform !== "win32")
    assert.equal((await stat(wechat.getInstancesPath())).mode & 0o777, 0o600);
  const h = await createHarness({
    workDir: dir.dir,
    modelProvider: {
      getModel() {
        throw Error("unused model");
      },
    },
    channels: { native: { loadSavedInstances: true, io } },
  });
  dir.close(() => h.close());
  assert.equal(h.channelClients!.registry.getAll().length, 2);
  assert.ok(
    h
      .channelClients!.registry.getAll()
      .every((client: any) => client.status === "disconnected"),
  );
  h.channelClients!.wechatFactory.remove("owned");
  assert.deepEqual(wechat.listWechatCredentialInstances(), []);
  assert.equal(wecom.loadWecomCredentials("owned").botId, "fixture-bot");
});
test("native close prevents a queued WebSocket constructor from connecting after disposal", async () => {
  const f = clientFixture(),
    native = createNativeChannelClients(
      "/fixture-home",
      {
        io: f.io,
        wecomInstances: [{ instanceId: "bot", credentials: wecomCredentials }],
      },
      () => ({ subscribeToClient() {} }),
      f.logger,
    );
  native.initializeConfigured();
  const pending = native.wecomFactory.get("bot").connect(),
    rejected = assert.rejects(pending, /closed/);
  native.close();
  await rejected;
  assert.equal(f.sockets.length, 0);
});
test("owned fetch aborts a header-complete pending body and observes pre-aborted inputs", async () => {
  let nativeSignal!: AbortSignal;
  const owner = createOwnedChannelFetch((async (_url: any, init: any) => {
    nativeSignal = init.signal;
    return { ok: true, text: () => new Promise(() => {}) };
  }) as any);
  const response = await owner.fetch("https://fixture.invalid"),
    pending = response.text(),
    rejected = assert.rejects(pending, /Channel clients are closed/);
  owner.close();
  await rejected;
  assert.equal(nativeSignal.aborted, true);
  assert.equal(owner.pendingCount, 0);
  let calls = 0;
  const next = createOwnedChannelFetch((async () => {
      calls++;
      throw Error("must not fetch");
    }) as any),
    controller = new AbortController();
  controller.abort(Error("pre-aborted fixture"));
  await assert.rejects(
    next.fetch("https://fixture.invalid", { signal: controller.signal }),
    /pre-aborted fixture/,
  );
  assert.equal(calls, 0);
  next.close();
});
test(
  "real loopback QR protocol confirms owned credentials and writes only memory-store data",
  { timeout: 8000 },
  async (t) => {
    const dir = await root(t),
      seen: any[] = [],
      server = createServer((req, res) => {
        const url = new URL(req.url!, "http://fixture.invalid");
        seen.push({
          path: url.pathname,
          headers: req.headers,
          params: Object.fromEntries(url.searchParams),
        });
        res.setHeader("content-type", "application/json");
        res.end(
          JSON.stringify(
            url.pathname.endsWith("get_bot_qrcode")
              ? {
                  qrcode: "owned &? QR",
                  qrcode_img_content: "https://fixture.invalid/owned",
                }
              : {
                  status: "confirmed",
                  bot_token: "owned-test-token",
                  ilink_bot_id: "owned-account",
                  baseurl: "https://fixture.invalid",
                },
          ),
        );
      });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    dir.close(
      () =>
        new Promise<void>((resolve) => {
          server.closeAllConnections();
          server.close(() => resolve());
        }),
    );
    const f = clientFixture({ io: { fetch } }),
      store = createWechatCredentialStore(f.io),
      states: any[] = [];
    await store.performQrCodeAuth(
      (state: any) => states.push(state),
      `http://127.0.0.1:${(server.address() as any).port}`,
      "owned",
    );
    assert.equal(store.loadCredentials("owned").token, "owned-test-token");
    assert.equal(seen[0].params.bot_type, "3");
    assert.equal(seen[1].params.qrcode, "owned &? QR");
    assert.equal(seen[1].headers["ilink-app-clientversion"], "1");
    assert.deepEqual(
      states.map((x) => x.type),
      ["fetching", "qr_ready", "confirmed"],
    );
  },
);
function modelFixture(requests: any[], name: string, args: any): Model {
  let count = 0;
  return {
    async getResponse() {
      return { output: [], usage: new Usage() };
    },
    async *getStreamedResponse(request) {
      requests.push(request);
      request.signal?.throwIfAborted();
      const first = ++count === 1,
        output = first
          ? [
              {
                type: "function_call",
                id: "native-call",
                callId: "native-call",
                name,
                status: "completed",
                arguments: JSON.stringify(args),
              },
            ]
          : [
              {
                type: "message",
                id: "answer",
                role: "assistant",
                status: "completed",
                content: [
                  { type: "output_text", text: "native fixture complete" },
                ],
              },
            ];
      yield { type: "response_started" };
      yield {
        type: "response_done",
        response: {
          id: `r-${count}`,
          output,
          usage: { inputTokens: 10, outputTokens: 2, totalTokens: 12 },
        },
      } as any;
    },
  };
}
async function waitFinal(h: any, session: any) {
  for (let i = 0; i < 50; i++) {
    const result = session.resultSubject.value;
    if (result) {
      await result.completed;
      await h.sessions.waitForResultHandled(result);
      return result;
    }
    await new Promise((resolve) => setImmediate(resolve));
  }
  throw Error("No SDK stream published");
}
test(
  "real loopback WeChat HTTP long-poll client wakes real SDK and sends original API reply",
  { timeout: 10000 },
  async (t) => {
    const dir = await root(t),
      requests: any[] = [],
      apiRequests: any[] = [],
      server = createServer();
    let delivered = false,
      replyDone!: () => void;
    const replied = new Promise<void>((resolve) => (replyDone = resolve));
    server.on("request", (req, res) => {
      let text = "";
      req.on("data", (x) => (text += x));
      req.on("end", () => {
        const body = JSON.parse(text);
        apiRequests.push({ url: req.url, headers: req.headers, body });
        if (req.url?.endsWith("getupdates")) {
          if (delivered) return;
          delivered = true;
          res.end(
            JSON.stringify({
              ret: 0,
              get_updates_buf: "cursor",
              msgs: [
                {
                  message_id: 1,
                  message_type: 1,
                  message_state: 2,
                  from_user_id: "u",
                  context_token: "0123456789",
                  item_list: [
                    { type: 1, text_item: { text: "owned HTTP inbound" } },
                  ],
                },
              ],
            }),
          );
        } else {
          res.end('{"ret":0}');
          replyDone();
        }
      });
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    dir.close(
      () =>
        new Promise<void>((resolve) => {
          server.closeAllConnections();
          server.close(() => resolve());
        }),
    );
    const baseURL = `http://127.0.0.1:${(server.address() as any).port}`,
      model = modelFixture(requests, "WeChatReply", {
        chat_id: "wechat_bot_u",
        text: "owned reply",
        context_token: "0123456789",
      }),
      h = await createHarness({
        workDir: dir.dir,
        modelProvider: { getModel: () => model },
        approveTool: () => true,
        channels: {
          native: {
            wechatInstances: [
              {
                instanceId: "bot",
                credentials: { ...wechatCredentials, apiBaseUrl: baseURL },
              },
            ],
          },
        },
      });
    dir.close(() => h.close());
    const session = await h.openSession();
    await h.channelClients!.wechatFactory.get("bot").connect();
    await replied;
    const result = await waitFinal(h, session);
    assert.equal(result.finalOutput, "native fixture complete");
    const sent = apiRequests.find((x) => x.url.endsWith("sendmessage"));
    assert.equal(sent.headers.authorization, "Bearer fixture-token");
    assert.equal(sent.body.msg.to_user_id, "u");
    assert.equal(sent.body.msg.item_list[0].text_item.text, "owned reply");
    assert.match(
      await readFile(h.sessions.getSessionFilePath(session)!, "utf8"),
      /owned HTTP inbound/,
    );
    await h.close();
  },
);
test(
  "real loopback WebSocket subscribe/callback/upload client carries SDK reply without external services",
  { timeout: 10000 },
  async (t) => {
    const dir = await root(t),
      WebSocketServer = require("ws-native").WebSocketServer,
      server = new WebSocketServer({ host: "127.0.0.1", port: 0 }),
      frames: any[] = [],
      requests: any[] = [];
    await new Promise<void>((resolve) => server.once("listening", resolve));
    dir.close(
      () =>
        new Promise<void>((resolve) => {
          for (const client of server.clients) client.terminate();
          server.close(() => resolve());
        }),
    );
    let replyDone!: () => void;
    const replied = new Promise<void>((resolve) => (replyDone = resolve));
    server.on("connection", (socket: any) =>
      socket.on("message", (data: any) => {
        const frame = JSON.parse(data.toString());
        frames.push(frame);
        if (frame.cmd === "aibot_subscribe") {
          socket.send(
            JSON.stringify({
              headers: { req_id: frame.headers.req_id },
              errcode: 0,
              errmsg: "ok",
            }),
          );
          socket.send(
            JSON.stringify({
              cmd: "aibot_msg_callback",
              headers: { req_id: "inbound" },
              body: {
                msgid: "m",
                msgtype: "text",
                text: { content: "owned WS inbound" },
                from: { userid: "u" },
                chattype: "group",
                chatid: "room",
              },
            }),
          );
        }
        if (frame.cmd.startsWith("aibot_upload_media_")) {
          const body = frame.cmd.endsWith("init")
            ? { upload_id: "owned-upload" }
            : frame.cmd.endsWith("finish")
              ? { media_id: "owned-media", type: "image" }
              : {};
          socket.send(
            JSON.stringify({
              headers: { req_id: frame.headers.req_id },
              errcode: 0,
              errmsg: "ok",
              body,
            }),
          );
        }
        if (frame.cmd === "aibot_send_msg") {
          replyDone();
        }
      }),
    );
    const filename = join(dir.dir, "owned-upload.png"),
      payload = Buffer.from([137, 80, 78, 71, 1]);
    await writeFile(filename, payload);
    const model = modelFixture(requests, "WeComReply", {
        chat_id: "wecom_room_u",
        file_path: filename,
      }),
      h = await createHarness({
        workDir: dir.dir,
        modelProvider: { getModel: () => model },
        approveTool: () => true,
        channels: {
          native: {
            wecomInstances: [
              {
                instanceId: "bot",
                credentials: {
                  ...wecomCredentials,
                  wsUrl: `ws://127.0.0.1:${server.address().port}`,
                },
              },
            ],
          },
        },
      });
    dir.close(() => h.close());
    const session = await h.openSession();
    await h.channelClients!.wecomFactory.get("bot").connect();
    await replied;
    assert.equal(
      (await waitFinal(h, session)).finalOutput,
      "native fixture complete",
    );
    assert.equal(
      frames.find((x) => x.cmd === "aibot_subscribe").body.secret,
      "fixture-secret",
    );
    assert.equal(
      frames.find((x) => x.cmd === "aibot_send_msg").body.image.media_id,
      "owned-media",
    );
    assert.equal(
      frames.find((x) => x.cmd === "aibot_upload_media_init").body.md5,
      crypto.createHash("md5").update(payload).digest("hex"),
    );
    assert.deepEqual(
      Buffer.from(
        frames.find((x) => x.cmd === "aibot_upload_media_chunk").body
          .base64_data,
        "base64",
      ),
      payload,
    );
    await h.close();
  },
);
test(
  "harness close aborts an owned HTTP send whose body is stalled after headers",
  { timeout: 10000 },
  async (t) => {
    const dir = await root(t),
      server = createServer(),
      requests: any[] = [],
      bodyResolvers: { ready?: () => void } = {},
      bodyReady = new Promise<void>(
        (resolve) => (bodyResolvers.ready = resolve),
      );
    let delivered = false,
      sendSignal!: AbortSignal;
    server.on("request", (req, res) => {
      let raw = "";
      req.on("data", (x) => (raw += x));
      req.on("end", () => {
        if (req.url!.endsWith("getupdates")) {
          if (delivered) return;
          delivered = true;
          res.end(
            JSON.stringify({
              ret: 0,
              msgs: [
                {
                  message_id: 1,
                  message_type: 1,
                  message_state: 2,
                  from_user_id: "u",
                  item_list: [
                    { type: 1, text_item: { text: "owned close fixture" } },
                  ],
                },
              ],
            }),
          );
        } else {
          res.writeHead(200, { "content-type": "application/json" });
          res.flushHeaders();
        }
      });
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    dir.close(
      () =>
        new Promise<void>((resolve) => {
          server.closeAllConnections();
          server.close(() => resolve());
        }),
    );
    const model = modelFixture(requests, "WeChatReply", {
        chat_id: "wechat_bot_u",
        text: "owned pending reply",
      }),
      h = await createHarness({
        workDir: dir.dir,
        modelProvider: { getModel: () => model },
        approveTool: () => true,
        channels: {
          native: {
            io: {
              fetch: async (input, init) => {
                const response = await fetch(input, init);
                if (String(input).endsWith("sendmessage")) {
                  sendSignal = init!.signal!;
                  return new Proxy(response, {
                    get(target, key) {
                      if (key === "text")
                        return () => {
                          bodyResolvers.ready!();
                          return target.text();
                        };
                      const value = Reflect.get(target, key, target);
                      return typeof value === "function"
                        ? value.bind(target)
                        : value;
                    },
                  });
                }
                return response;
              },
            },
            wechatInstances: [
              {
                instanceId: "bot",
                credentials: {
                  ...wechatCredentials,
                  apiBaseUrl: `http://127.0.0.1:${(server.address() as any).port}`,
                },
              },
            ],
          },
        },
      });
    dir.close(() => h.close());
    await h.openSession();
    await h.channelClients!.wechatFactory.get("bot").connect();
    await bodyReady;
    await h.close();
    assert.equal(sendSignal.aborted, true);
    // SDK may enter the model adapter with an already-aborted signal after the
    // tool error. The real transport and this fixture reject before new I/O.
    assert.ok(requests.every((request) => request.signal?.aborted));
  },
);
