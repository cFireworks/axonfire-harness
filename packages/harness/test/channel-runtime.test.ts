import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, rm, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import { WechatReplyTool } from "../src/channels/wechat-reply-tool.js";
import { WecomReplyTool } from "../src/channels/wecom-reply-tool.js";
import { WechatChannelBridge } from "../src/channels/wechat-channel-bridge.js";
import { WecomBotChannelBridge } from "../src/channels/wecom-bot-channel-bridge.js";
import { ChannelManagerImpl } from "../src/channels/channel-manager.js";
import { ChannelPermissionAdapterImpl } from "../src/channels/channel-permission-adapter.js";
import * as C from "../src/channels/channel-constants.js";
import {
  createHarness,
  type HarnessOptions,
} from "../src/runtime/create-harness.js";
import {
  fixtureClient,
  fixtureFactory,
  bridgeFixture,
  replyFixture,
  inbound,
  settleChannelFixture,
  channelFixtureBytes,
} from "./helpers/channel-fixtures.js";
setTraceProcessors([]);
async function harness(
  t: { after(fn: () => any): void },
  options: Partial<HarnessOptions> = {},
) {
  const root = await mkdtemp(join(tmpdir(), "harness-channel-")),
    h = await createHarness({
      workDir: root,
      modelProvider: {
        getModel() {
          throw Error("unused model");
        },
      },
      ...options,
    });
  t.after(async () => {
    try {
      await h.close();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
  return { h, root };
}
function modelFixture(requests: any[], name: string, args: any): Model {
  let n = 0;
  return {
    async getResponse() {
      return { output: [], usage: new Usage() };
    },
    async *getStreamedResponse(request) {
      requests.push(request);
      n++;
      const output =
        n === 1
          ? [
              {
                type: "function_call",
                id: "channel-call",
                callId: "channel-call",
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
                content: [{ type: "output_text", text: "fixture complete" }],
              },
            ];
      yield { type: "response_started" };
      if (n > 1) yield { type: "output_text_delta", delta: "fixture complete" };
      yield {
        type: "response_done",
        response: {
          id: `r-${n}`,
          output,
          usage: { inputTokens: 10, outputTokens: 2, totalTokens: 12 },
        },
      } as any;
    },
  };
}
test("channel schema preserves native protocol fields and stripAtMention's last-word behavior", () => {
  assert.equal(
    C.ChannelPermissionResponseSchema.safeParse({
      method: C.CHANNEL_PERMISSION_RESPONSE_METHOD,
      params: { request_id: "id", behavior: "deny_and_exit_plan" },
    }).success,
    true,
  );
  assert.equal(
    C.ChannelPermissionResponseSchema.safeParse({
      method: C.CHANNEL_PERMISSION_RESPONSE_METHOD,
      params: { request_id: "id", behavior: "approve" },
    }).success,
    false,
  );
  assert.equal(C.stripAtMention("@Bot free form answer"), "answer");
  assert.equal(C.stripAtMention("@Bot"), "");
  assert.equal(C.escapeXmlAttr('a&"<>'), "a&amp;&quot;&lt;&gt;");
});
test("reply tools preserve optional schema fields and gate only on a connected supplied client", () => {
  const f = replyFixture(),
    wechat = new WechatReplyTool(f.runtime),
    wecom = new WecomReplyTool(f.runtime);
  for (const tool of [wechat, wecom]) {
    assert.equal(tool.parameters.safeParse({ chat_id: "" }).success, true);
    assert.equal(tool.needsApproval, false);
    assert.equal(tool.isEnabled(), true);
  }
  f.runtime.wechatFactory = {
    getAll() {
      throw Error("factory");
    },
    get() {},
  };
  assert.equal(wechat.isEnabled(), false);
  assert.equal(
    new WecomReplyTool(
      replyFixture({ clients: [{ status: "connecting" }] }).runtime,
    ).isEnabled(),
    false,
  );
});
test("WeChat distinguishes malformed/no-content calls, short tokens and validations outside catch", async () => {
  const f = replyFixture(),
    tool = new WechatReplyTool(f.runtime);
  assert.match(
    (await tool.execute({ chat_id: "" }, {})).error,
    /Missing chat_id/,
  );
  assert.match(
    (await tool.execute({ chat_id: "wechat_bot_user hello" }, {})).error,
    /Malformed call/,
  );
  assert.match(
    (await tool.execute({ chat_id: "wechat_bot_user" }, {})).error,
    /Either text or file_path/,
  );
  assert.match(
    (
      await tool.execute(
        { chat_id: "id", text: "x", context_token: "short" },
        {},
      )
    ).error,
    /too short/,
  );
  await assert.rejects(tool.execute({ chat_id: 42, text: "x" }, {}), TypeError);
  assert.equal(f.events.length, 0);
});
test("WeChat sends image captions together but nonimage captions as a separate preceding text", async () => {
  const a = replyFixture(),
    tool = new WechatReplyTool(a.runtime);
  assert.deepEqual(
    await tool.execute(
      {
        chat_id: "wechat_bot_user",
        text: "caption",
        file_path: "/fixture/A.PNG",
        context_token: "0123456789",
      },
      {},
    ),
    { content: "sent" },
  );
  assert.deepEqual(a.events, [
    [
      "sendImageReply",
      "wechat_bot_user",
      "/fixture/A.PNG",
      "caption",
      "0123456789",
    ],
  ]);
  a.events.length = 0;
  await tool.execute(
    { chat_id: "id", text: "caption", file_path: "/fixture/a.svg" },
    {},
  );
  assert.deepEqual(
    a.events.map((x) => x[0]),
    ["sendReply", "sendFileReply"],
  );
  assert.equal(a.events[1]![3], undefined);
});
test("WeChat maps connection/format/file/timeout errors in source order and retains generic tips", async () => {
  for (const [message, expected] of [
    ["No WeChat client is connected", "currently connected"],
    ["invalid file timeout", "Invalid chat_id"],
    ["File timeout", "File operation failed"],
    ["Timeout", "WeChat API timeout"],
    ["UNKNOWN", "Debugging tips"],
  ]) {
    const tool = new WechatReplyTool(
      replyFixture({ sendError: Error(message) }).runtime,
    );
    assert.match(
      (await tool.execute({ chat_id: "id", text: "x" }, {})).error,
      new RegExp(expected!),
    );
  }
});
test("WeCom chooses local file before URL/image/text and only local stat enforces 20MB", async () => {
  const f = replyFixture(),
    tool = new WecomReplyTool(f.runtime);
  const result = await tool.execute(
    {
      chat_id: "id",
      file_path: "/fixture/a.JPG",
      file_url: "https://fixture.invalid/b.mp4",
      image_url: "data:image/png;base64,Zg==",
      text: "ignored",
    },
    {},
  );
  assert.equal(JSON.parse(result.content).media_type, "image");
  assert.deepEqual(
    f.events.map((e) => e[0]),
    ["resolve", "stat", "readFile", "uploadMedia", "sendMediaMessage"],
  );
  assert.deepEqual(f.events.at(-1), [
    "sendMediaMessage",
    "target",
    "image",
    "fixture-media",
    2,
  ]);
  const large = new WecomReplyTool(
    replyFixture({ size: 20 * 1024 * 1024 + 1 }).runtime,
  );
  assert.match(
    (await large.execute({ chat_id: "id", file_path: "/large" }, {})).error,
    /20 MB/,
  );
  assert.equal(
    (
      await new WecomReplyTool(
        replyFixture({ size: 20 * 1024 * 1024 }).runtime,
      ).execute({ chat_id: "id", file_path: "/limit" }, {})
    ).error,
    undefined,
  );
});
test("WeCom retains extension-driven media types, data-URL filename quirk and raw path routing", async () => {
  const f = replyFixture(),
    tool = new WecomReplyTool(f.runtime);
  for (const [name, expected] of [
    ["a.heic", "image"],
    ["a.svg", "image"],
    ["a.mp4", "video"],
    ["a.mp3", "voice"],
    ["a.pdf", "file"],
  ])
    assert.equal(tool.detectMediaType(name), expected);
  const result = await tool.execute(
    { chat_id: "id", image_url: "data:image/png;base64,Zg==" },
    {},
  );
  assert.equal(JSON.parse(result.content).media_type, "file");
  assert.equal(JSON.parse(result.content).filename, "png;base64,Zg==");
  assert.equal(await tool.urlToBuffer("relative.bin"), undefined);
  assert.deepEqual(
    await tool.urlToBuffer("./relative.bin"),
    channelFixtureBytes,
  );
});
test("WeCom remote fetch uses exactly 30s signal and preserves errors/missing route", async () => {
  const f = replyFixture({ ok: false }),
    tool = new WecomReplyTool(f.runtime);
  assert.match(
    (
      await tool.execute(
        { chat_id: "id", file_url: "https://fixture.invalid/a.mp4" },
        {},
      )
    ).error,
    /HTTP 404 Not Found/,
  );
  assert.deepEqual(
    f.events.find((e) => e[0] === "timeoutSignal"),
    ["timeoutSignal", 30000],
  );
  assert.equal(
    (
      await new WecomReplyTool(
        replyFixture({ platformData: {} }).runtime,
      ).execute({ chat_id: "id", file_path: "/fixture" }, {})
    ).error,
    "Cannot resolve chat target: missing chatid in route",
  );
  assert.match(
    (await tool.execute({ chat_id: "id" }, {})).error,
    /At least one/,
  );
});
test("WeChat routes mapped client then last source then first connected; parser keeps legacy underscores", async () => {
  const f = bridgeFixture(),
    bridge = new WechatChannelBridge(f.runtime),
    second = fixtureClient("wechat", "two", f.events);
  f.clients.push(second);
  bridge.chatClientMap.set("known", second);
  assert.equal(bridge.resolveClient("known"), second);
  bridge.lastReplyContext = { sourceClient: second };
  assert.equal(bridge.resolveClient("unknown"), second);
  second.status = "disconnected";
  assert.equal(bridge.resolveClient("unknown"), f.clients[0]);
  assert.deepEqual(bridge.parseChatId("wechat_bot_user_with_under"), {
    instanceId: "bot",
    userId: "user_with_under",
  });
  assert.deepEqual(bridge.parseChatId("wechat_missing_user"), {
    userId: "missing_user",
  });
  await bridge.sendReply("wechat_bot_user", "x", "token");
  assert.equal(f.events.at(-1)[2].platformData.context_token, "token");
});
test("WeCom unknown route retains last target and missing platformData uses native lossy chat-id parser", () => {
  const f = bridgeFixture("wecom"),
    bridge = new WecomBotChannelBridge(f.runtime);
  bridge.lastReplyContext = {
    instanceId: "bot",
    platformData: { chatid: "previous", chattype: "single" },
  };
  assert.equal(
    bridge.resolveClientForChat("wecom_other_sender").platformData.chatid,
    "previous",
  );
  bridge.lastReplyContext = undefined;
  assert.deepEqual(
    bridge.resolveClientForChat("wecom_room_user").platformData,
    { chatid: "room", chattype: "group" },
  );
  assert.deepEqual(
    bridge.resolveClientForChat("wecom_user_user").platformData,
    { chatid: "user", chattype: "single" },
  );
});
test("bridge duplicate connected events count repeatedly; only WeCom augments cached agent configs", async () => {
  for (const kind of ["wechat", "wecom"]) {
    const f = bridgeFixture(kind),
      bridge =
        kind === "wechat"
          ? new WechatChannelBridge(f.runtime)
          : new WecomBotChannelBridge(f.runtime);
    bridge.initialize();
    bridge.subscribeToClient(f.clients[0]);
    assert.equal(f.clients[0].onMessage.observers.length, 1);
    for (let i = 0; i < 2; i++)
      f.clients[0].onStatusChange.next({ status: "connected" });
    await settleChannelFixture();
    assert.equal(bridge.connectedCount, 2);
    assert.equal(f.manager.isChannel(kind), true);
    assert.equal(
      f.configs.Explore.tools.includes("WeComReply"),
      kind === "wecom",
    );
    f.clients[0].onStatusChange.next({ status: "disconnected" });
    assert.equal(f.manager.isChannel(kind), true);
    f.clients[0].onStatusChange.next({ status: "disconnected" });
    assert.equal(f.manager.isChannel(kind), false);
  }
});
test("channel injection escapes only attributes, keeps body verbatim, records media and queues while busy", async () => {
  const f = bridgeFixture(),
    bridge = new WechatChannelBridge(f.runtime),
    message = inbound("wechat", '<untrusted body> & "raw"', {
      mediaFiles: ["/a", "/b"],
    });
  message.replyContext.userId = 'u&"<';
  bridge.handleWechatMessage(message, f.clients[0]);
  const queued = f.events.find((e) => e[0] === "enqueue")[1];
  assert.match(queued.content[0].text, /sender="u&amp;&quot;&lt;"/);
  assert.match(queued.content[0].text, /<untrusted body> & "raw"/);
  assert.match(queued.content[0].text, /file_paths="\/a,\/b"/);
  assert.equal(
    f.session.meta.channelChatId,
    message.replyContext.conversationId,
  );
  assert.equal(f.session.meta.isChannelSession, true);
});
test("unknown permission reply denies oldest and forwards after native 1000ms without media metadata", () => {
  const f = bridgeFixture(),
    bridge = new WechatChannelBridge(f.runtime);
  bridge.pendingPermissionRequests.set("old", "Read");
  bridge.pendingPermissionRequests.set("next", "Write");
  bridge.handleWechatMessage(
    inbound("wechat", "new instruction", { mediaFiles: ["/a"] }),
    f.clients[0],
  );
  assert.deepEqual(
    f.events.find((e) => e[0] === "permission"),
    ["permission", { requestId: "old", behavior: "deny" }],
  );
  assert.deepEqual(
    f.events.find((e) => e[0] === "timer"),
    ["timer", 1000],
  );
  assert.equal(
    f.events.some((e) => e[0] === "enqueue"),
    false,
  );
  f.timers[0]!();
  const item = f.events.find((e) => e[0] === "enqueue")[1];
  assert.doesNotMatch(item.content[0].text, /file_path=/);
  assert.equal(bridge.pendingPermissionRequests.has("next"), true);
});
test("permission formatting, plan exit choices and WeCom group confirmation preserve original text", async () => {
  const f = bridgeFixture("wecom", { plan: "# Plan\n- step" }),
    bridge = new WecomBotChannelBridge(f.runtime);
  bridge.lastReplyContext = {
    chatId: "wecom_room_user",
    instanceId: "bot",
    platformData: { chatid: "room", chattype: "group" },
  };
  assert.equal(
    bridge.formatPermissionMessage(
      "Bash",
      JSON.stringify({ command: "echo fixture", description: "reason" }),
    ),
    "reason\n我想运行 echo fixture",
  );
  await bridge.sendPermissionRequestToUser({
    request_id: "p",
    tool_name: "ExitPlanMode",
    input_preview: "{}",
  });
  assert.match(
    f.events.find((e) => e[0] === "client.sendAsyncReply")[3],
    /^\[请回复确认\]/,
  );
  assert.equal(bridge.tryHandlePermissionReply("@bot q"), "consumed");
  assert.equal(f.events.at(-1)[1].behavior, "deny_and_exit_plan");
});
test("AskUserQuestion uses parseInt prefix and WeCom @mention keeps only final word", () => {
  for (const kind of ["wechat", "wecom"]) {
    const f = bridgeFixture(kind),
      bridge =
        kind === "wechat"
          ? new WechatChannelBridge(f.runtime)
          : new WecomBotChannelBridge(f.runtime);
    const item = {
      rawItem: {
        type: "function_call",
        callId: "ask",
        name: "AskUserQuestion",
        arguments: JSON.stringify({
          questions: [
            {
              question: "Q",
              options: [
                { label: "A", description: "first" },
                { label: "B", description: "second" },
              ],
            },
          ],
        }),
      },
    };
    bridge.handleAskUserQuestion(item);
    assert.equal(
      bridge.tryHandleAskReply(kind === "wechat" ? "2abc" : "@bot 2abc"),
      true,
    );
    assert.deepEqual(
      f.events.find((e) => e[0] === "doneAsk"),
      ["doneAsk", { Q: "B" }, "ask"],
    );
    assert.equal(bridge.pendingAsk, undefined);
  }
});
test("WeCom local commands collect output, TUI-only hint and custom override preserve dispatch", async () => {
  const f = bridgeFixture("wecom"),
    bridge = new WecomBotChannelBridge(f.runtime);
  bridge.chatRoutes.set("id", {
    instanceId: "bot",
    platformData: { chatid: "room" },
  });
  assert.equal(await bridge.tryHandleLocalCommand("/clear now", "id"), true);
  assert.equal(
    f.events.find((e) => e[0] === "client.sendAsyncReply")[3],
    "fixture output",
  );
  assert.equal(await bridge.tryHandleLocalCommand("/theme", "id"), true);
  assert.match(f.events.at(-1)[3], /仅在终端 TUI/);
  const g = bridgeFixture("wecom", { overridden: true });
  assert.equal(
    await new WecomBotChannelBridge(g.runtime).tryHandleLocalCommand(
      "/clear",
      "id",
    ),
    false,
  );
});
test("suggestion approval supersedes previous waiter; cross-session input resolves false and is forwarded", async () => {
  const f = bridgeFixture(),
    bridge = new WechatChannelBridge(f.runtime);
  const first = bridge.sendPromptSuggestionAndWaitForApproval(
    "first",
    "wechat_bot_user",
    f.session.id,
  );
  await settleChannelFixture();
  const second = bridge.sendPromptSuggestionAndWaitForApproval(
    "second",
    "wechat_bot_user",
    "other",
  );
  await settleChannelFixture();
  assert.equal(await first, false);
  assert.equal(bridge.tryHandleSuggestionApprovalReply("y"), false);
  assert.equal(await second, false);
});
test("ChannelManager settings gate, capabilities, allowed parsing and FIFO consume preserve source", async () => {
  const manager = new ChannelManagerImpl(undefined, { get: async () => false });
  manager.configureFromSessionOptions({
    channels: "plugin:wechat@v1,wecom",
    dangerouslyLoadDevelopmentChannels: "dev",
  });
  manager.registerChannel(
    "wechat",
    { notification() {} },
    {
      experimental: {
        [C.CHANNEL_CAPABILITY_KEY]: {},
        [C.CHANNEL_PERMISSION_CAPABILITY_KEY]: {},
      },
    },
    "prompt",
  );
  assert.equal(manager.isChannel("wechat"), true);
  assert.equal(manager.shouldBypassAllowlist("dev"), true);
  manager.enqueueEventForSession("s", 1);
  manager.enqueueEventForSession("s", 2);
  assert.deepEqual(manager.consumeEventsForSession("s"), [1, 2]);
  assert.deepEqual(manager.consumeEventsForSession("s"), []);
  await settleChannelFixture();
  assert.equal(manager.enabled, false);
  manager.registerChannel(
    "wecom",
    {},
    { experimental: { [C.CHANNEL_CAPABILITY_KEY]: {} } },
  );
  assert.equal(manager.isChannel("wecom"), false);
});
test("Channel permission adapter preserves five-letter IDs, cancellation without resolve and late-response behavior", async () => {
  const manager = new ChannelManagerImpl(),
    adapter = new ChannelPermissionAdapterImpl(manager, undefined, {
      now: () => 123,
      random: () => 0,
    });
  let notification: any;
  manager.registerChannel(
    "fixture",
    {
      notification: (value: any) => {
        notification = value;
      },
    },
    {
      experimental: {
        [C.CHANNEL_CAPABILITY_KEY]: {},
        [C.CHANNEL_PERMISSION_CAPABILITY_KEY]: {},
      },
    },
  );
  const promise = adapter.createPermissionRequest("tool", "Read", "read", "{}");
  assert.equal(notification.params.request_id, "aaaaa");
  adapter.handlePermissionResponse({ requestId: "aaaaa", behavior: "allow" });
  assert.equal(await promise, "allow");
  let resolved = false;
  void adapter
    .createPermissionRequest("cancel", "Read", "read", "{}")
    .then(() => (resolved = true));
  adapter.cancelRequest("cancel");
  adapter.handlePermissionResponse({ requestId: "aaaaa", behavior: "deny" });
  await settleChannelFixture();
  assert.equal(resolved, false);
});
test("standalone has all 47 handlers but disconnected reply tools are unavailable; direct tools still require host approval", async (t) => {
  const { h } = await harness(t);
  assert.equal((h.tools as any).handlers.size, 47);
  assert.deepEqual(
    [...(h.tools as any).handlers.keys()].sort(),
    [...new Set(h.product.raw.tools.map(tool => tool.name))].sort(),
  );
  assert.equal(h.wechatReplyTool.isEnabled(), false);
  assert.equal(h.wecomReplyTool.isEnabled(), false);
  const session = await h.openSession();
  assert.equal(
    (await h.agents.getDefault()).tools.some(
      (tool: any) => tool.name === "WeChatReply",
    ),
    true,
  );
  await assert.rejects(
    Promise.resolve(
      (await h.tools.get("WeChatReply"))!.execute(
        { chat_id: "id", text: "x" },
        { context: session },
      ),
    ),
    /permission denied/,
  );
});
test("real SDK executes native WeChatReply and persists exact channel instructions without external messaging", async (t) => {
  const events: any[] = [],
    client = fixtureClient("wechat", "bot", events),
    requests: any[] = [],
    model = modelFixture(requests, "WeChatReply", {
      chat_id: "wechat_bot_user",
      text: "fixture outbound",
      context_token: "0123456789",
    });
  const { h } = await harness(t, {
    modelProvider: { getModel: () => model },
    channels: { wechat: fixtureFactory([client]) },
    approveTool: () => true,
  });
  const session = await h.openSession();
  client.onStatusChange.next({ status: "connected" });
  await settleChannelFixture();
  assert.equal(await h.prompt(session, "reply fixture"), "fixture complete");
  assert.deepEqual(events.find((e) => e[0] === "client.sendReply")?.slice(2), [
    {
      clientType: "wechat",
      userId: "user",
      conversationId: "wechat_bot_user",
      platformData: { context_token: "0123456789" },
    },
    "fixture outbound",
  ]);
  assert.ok(
    requests[0].input
      .flatMap((item: any) =>
        typeof item.content === "string"
          ? [item.content]
          : (item.content ?? []).map((part: any) => part.text ?? ""),
      )
      .join("\n")
      .includes(C.WECHAT_CHANNEL_INSTRUCTIONS),
  );
  assert.ok(
    session.history.some(
      (item: any) =>
        item.type === "function_call_result" && item.name === "WeChatReply",
    ),
  );
});
test(
  "real SDK channel approval resumes Read once and does not require a local approval callback",
  { timeout: 8000 },
  async (t) => {
    const events: any[] = [],
      client = fixtureClient("wechat", "bot", events),
      requests: any[] = [],
      model = modelFixture(requests, "Read", { file_path: "fixture.txt" });
    const { h, root } = await harness(t, {
      modelProvider: { getModel: () => model },
      channels: { wechat: fixtureFactory([client]) },
    });
    await writeFile(join(root, "fixture.txt"), "channel approved fixture");
    const session = await h.openSession();
    const bridge = h.channelHost.wechatBridge;
    bridge.lastReplyContext = {
      chatId: "wechat_bot_user",
      contextToken: "0123456789",
      sourceClient: client,
    };
    bridge.chatClientMap.set("wechat_bot_user", client);
    const original = client.sendReply;
    client.sendReply = async (...args: any[]) => {
      await original(...args);
      if (String(args[1]).includes("可以吗"))
        queueMicrotask(() => client.onMessage.next(inbound("wechat", "y")));
    };
    client.onStatusChange.next({ status: "connected" });
    const controller = new AbortController();
    t.after(() => controller.abort());
    assert.equal(
      await h.prompt(session, "read fixture", { signal: controller.signal }),
      "fixture complete",
    );
    assert.ok(
      JSON.stringify(requests[1].input).includes("channel approved fixture"),
      JSON.stringify({ input: requests[1].input, events }),
    );
    assert.equal(h.channelPermissionAdapter.pendingRequests.size, 0);
    assert.equal(session.queue.length, 0);
  },
);
test("channel host closes only owned subscriptions/timers and never disconnects supplied clients", async (t) => {
  const client = fixtureClient(),
    { h } = await harness(t, {
      channels: { wechat: fixtureFactory([client]) },
    });
  const session = await h.openSession();
  assert.ok(client.onMessage.observers.length > 0);
  assert.ok(session.interruptionSubject.observers.length > 0);
  await h.close();
  assert.equal(client.status, "connected");
  assert.equal(client.onMessage.observers.length, 0);
  assert.equal(client.onStatusChange.observers.length, 0);
  assert.equal(session.interruptionSubject.observers.length, 0);
  client.onMessage.next(inbound());
  assert.equal(session.queue.length, 0);
});
test(
  "real SDK AskUserQuestion is answered through native WeChat interruption bridge",
  { timeout: 8000 },
  async (t) => {
    const events: any[] = [],
      client = fixtureClient("wechat", "bot", events),
      requests: any[] = [],
      model = modelFixture(requests, "AskUserQuestion", {
        questions: [
          {
            question: "Choose fixture",
            header: "Choice",
            multiSelect: false,
            options: [
              { label: "A", description: "first" },
              { label: "B", description: "second" },
            ],
          },
        ],
      });
    const { h } = await harness(t, {
        modelProvider: { getModel: () => model },
        channels: { wechat: fixtureFactory([client]) },
      }),
      session = await h.openSession();
    h.channelHost.wechatBridge.lastReplyContext = {
      chatId: "wechat_bot_user",
      contextToken: "0123456789",
      sourceClient: client,
    };
    const send = client.sendReply;
    client.sendReply = async (...args: any[]) => {
      await send(...args);
      if (String(args[1]).includes("❓"))
        queueMicrotask(() => client.onMessage.next(inbound("wechat", "2abc")));
    };
    client.onStatusChange.next({ status: "connected" });
    const controller = new AbortController();
    t.after(() => controller.abort());
    assert.equal(
      await h.prompt(session, "ask fixture", { signal: controller.signal }),
      "fixture complete",
    );
    const result = requests
      .at(-1)
      .input.find(
        (item: any) =>
          item.type === "function_call_result" &&
          item.name === "AskUserQuestion",
      );
    assert.ok(result);
    assert.match(JSON.stringify(result), /Choose fixture/);
    assert.match(JSON.stringify(result), /B/);
    assert.equal(h.channelHost.wechatBridge.pendingAsk, undefined);
  },
);
test("real SDK WeCom sends fixture file with source priority and refreshes eager runtime agent allowlists", async (t) => {
  const events: any[] = [],
    client = fixtureClient("wecom", "bot", events),
    requests: any[] = [],
    { h, root } = await harness(t, {
      modelProvider: { getModel: () => model },
      channels: { wecom: fixtureFactory([client]) },
      approveTool: () => true,
    });
  const filename = join(root, "fixture.png"),
    model = modelFixture(requests, "WeComReply", {
      chat_id: "wecom_room_user",
      file_path: filename,
      text: "ignored caption",
    });
  await writeFile(filename, channelFixtureBytes);
  const session = await h.openSession();
  await h.agents.get("Explore");
  assert.equal(h.agents.ready, true);
  assert.equal(
    (await h.agents.getAgentConfig("Explore"))!.tools!.includes("WeComReply"),
    false,
  );
  h.channelHost.wecomBridge.chatRoutes.set("wecom_room_user", {
    instanceId: "bot",
    platformData: { chatid: "room", chattype: "group" },
  });
  // The native bridge refreshes all eager agents sequentially; await its actual
  // lifecycle completion instead of assuming a fixed number of microtasks.
  const bridge = h.channelHost.wecomBridge;
  const refresh = bridge.refreshAgentToolsAfterConnection.bind(bridge);
  let refreshed: Promise<any> | undefined;
  bridge.refreshAgentToolsAfterConnection = () => (refreshed = refresh());
  client.onStatusChange.next({ status: "connected" });
  assert.ok(refreshed);
  await refreshed;
  assert.equal(
    (await h.agents.getAgentConfig("Explore"))!.tools!.includes("WeComReply"),
    true,
  );
  assert.equal(await h.prompt(session, "send fixture"), "fixture complete");
  assert.equal(h.agents.ready, true);
  assert.deepEqual(
    events.find((e) => e[0] === "client.uploadMedia")?.slice(2),
    [channelFixtureBytes, { type: "image", filename: "fixture.png" }],
  );
  assert.deepEqual(
    events.find((e) => e[0] === "client.sendMediaMessage")?.slice(2),
    ["room", "image", "fixture-media", 2],
  );
  assert.equal(
    events.some((e) => e[0] === "client.sendAsyncReply"),
    false,
  );
  const disk = JSON.parse(
    await readFile(join(process.cwd(), "config/original/product.json"), "utf8"),
  );
  assert.equal(
    disk.agents
      .find((agent: any) => agent.name === "Explore")
      .tools.includes("WeComReply"),
    false,
  );
});
test(
  "channel guard denial is returned to real SDK without reading the fixture",
  { timeout: 8000 },
  async (t) => {
    const events: any[] = [],
      client = fixtureClient("wechat", "bot", events),
      requests: any[] = [],
      model = modelFixture(requests, "Read", { file_path: "fixture.txt" }),
      { h, root } = await harness(t, {
        modelProvider: { getModel: () => model },
        channels: { wechat: fixtureFactory([client]) },
      });
    await writeFile(join(root, "fixture.txt"), "must not be read");
    const session = await h.openSession();
    h.channelHost.wechatBridge.lastReplyContext = {
      chatId: "wechat_bot_user",
      contextToken: "0123456789",
      sourceClient: client,
    };
    const send = client.sendReply;
    client.sendReply = async (...args: any[]) => {
      await send(...args);
      queueMicrotask(() => client.onMessage.next(inbound("wechat", "n")));
    };
    client.onStatusChange.next({ status: "connected" });
    assert.equal(await h.prompt(session, "deny fixture"), "fixture complete");
    const result = requests
      .at(-1)
      .input.find((item: any) => item.type === "function_call_result");
    assert.match(JSON.stringify(result), /permission denied/);
    assert.doesNotMatch(JSON.stringify(result), /must not be read/);
    assert.equal(h.channelPermissionAdapter.pendingRequests.size, 0);
  },
);
test(
  "channel guard abort cancels native adapter pending state without inventing a native timer",
  { timeout: 8000 },
  async (t) => {
    const client = fixtureClient(),
      requests: any[] = [],
      model = modelFixture(requests, "Read", { file_path: "fixture.txt" }),
      { h } = await harness(t, {
        modelProvider: { getModel: () => model },
        channels: { wechat: fixtureFactory([client]) },
      }),
      session = await h.openSession(),
      controller = new AbortController();
    h.channelHost.wechatBridge.lastReplyContext = {
      chatId: "wechat_bot_user",
      sourceClient: client,
    };
    client.sendReply = async () => {
      queueMicrotask(() => controller.abort(Error("fixture abort")));
    };
    client.onStatusChange.next({ status: "connected" });
    await assert.rejects(
      h.prompt(session, "abort fixture", { signal: controller.signal }),
      /fixture abort/,
    );
    assert.equal(h.channelPermissionAdapter.pendingRequests.size, 0);
  },
);
test(
  "native inbound channel bridge wakes idle real SDK and persists channel metadata",
  { timeout: 8000 },
  async (t) => {
    const events: any[] = [],
      client = fixtureClient("wechat", "bot", events),
      requests: any[] = [],
      model = modelFixture(requests, "WeChatReply", {
        chat_id: "wechat_bot_user",
        text: "inbound fixture reply",
        context_token: "0123456789",
      }),
      { h } = await harness(t, {
        modelProvider: { getModel: () => model },
        channels: { wechat: fixtureFactory([client]) },
        approveTool: () => true,
      }),
      session = await h.openSession();
    let done!: () => void;
    const completed = new Promise<void>((resolve) => {
      done = resolve;
    });
    let responses = 0;
    const sub = session.modelSubject.subscribe((event: any) => {
      if (event.type === "response_done" && ++responses === 2) done();
    });
    t.after(() => sub.unsubscribe());
    client.onStatusChange.next({ status: "connected" });
    client.onMessage.next(inbound("wechat", "owned inbound fixture"));
    await completed;
    const result = session.resultSubject.value as any;
    await result.completed;
    await h.sessions.waitForResultHandled(result);
    assert.equal(result.finalOutput, "fixture complete");
    assert.equal(session.meta.channelId, "wechat");
    assert.equal(session.meta.channelChatId, "wechat_bot_user");
    assert.equal(h.channelHost.wechatBridge.isWaking, false);
    assert.ok(
      events.some(
        (e) => e[0] === "client.sendReply" && e[3] === "inbound fixture reply",
      ),
    );
    assert.match(
      await readFile(h.sessions.getSessionFilePath(session)!, "utf8"),
      /owned inbound fixture/,
    );
  },
);
test(
  "host close aborts an inbound-owned real SDK stream without disconnecting the caller client",
  { timeout: 8000 },
  async (t) => {
    const client = fixtureClient(),
      requests: any[] = [],
      readyResolvers: { start?: () => void } = {},
      ready = new Promise<void>((resolve) => {
        readyResolvers.start = resolve;
      });
    const model: Model = {
      async getResponse() {
        return { output: [], usage: new Usage() };
      },
      async *getStreamedResponse(request) {
        requests.push(request);
        yield { type: "response_started" };
        readyResolvers.start!();
        await new Promise<void>((_resolve, reject) => {
          if (request.signal?.aborted) reject(request.signal.reason);
          else
            request.signal?.addEventListener(
              "abort",
              () => reject(request.signal!.reason),
              { once: true },
            );
        });
      },
    };
    const { h } = await harness(t, {
        modelProvider: { getModel: () => model },
        channels: { wechat: fixtureFactory([client]) },
      }),
      session = await h.openSession();
    client.onStatusChange.next({ status: "connected" });
    client.onMessage.next(inbound());
    await ready;
    await h.close();
    assert.equal(requests[0].signal.aborted, true);
    assert.equal(client.status, "connected");
    assert.equal(client.onMessage.observers.length, 0);
    assert.equal(requests.length, 1);
    await assert.rejects(
      h.channelHost.wechatBridge.sendReply("wechat_bot_user", "late"),
      /closed/,
    );
  },
);
