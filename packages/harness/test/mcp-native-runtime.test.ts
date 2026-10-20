import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, rm, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { EventEmitter } from "node:events";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import { mcpNativeFixture } from "../scripts/helpers/mcp-native-fixtures.js";
import { createNativeMcpResultProcessor } from "../src/mcp/native-mcp-results.js";
import { createNativeMcpUtils } from "../src/mcp/native-mcp-utils.js";
import { createNativeMcpHost } from "../src/mcp/native-mcp-host.js";
import { McpSubagentToolManager } from "../src/mcp/native-mcp-subagent-tools.js";
import { createHarness } from "../src/runtime/create-harness.js";
import { ownedMcpHttp } from "./helpers/owned-mcp-http.js";
import { HarnessSession } from "../src/sessions/session.js";
import { McpRegistry } from "../src/mcp/mcp-registry.js";

test("native MCP proxy normalizes schema, names and original modifiedInput hooks", async () => {
  const out = await mcpNativeFixture({ rewrite: true, hint: true }).execute();
  assert.equal(out.name, "mcp__owned-server__echo");
  assert.equal(out.schema.additionalProperties, false);
  assert.equal(out.events.find((e) => e[0] === "call")[2].owned, "rewritten");
  assert.match(out.output[1].text, /owned hint/);
});
test("native MCP Pre denial avoids underlying calls, but hook errors preserve native best effort", async () => {
  const denied = await mcpNativeFixture({ preDeny: true }).execute();
  assert.equal(
    denied.events.some((e) => e[0] === "call"),
    false,
  );
  assert.match(denied.output[0].text, /blocked by PreToolUse/);
  const failed = await mcpNativeFixture({ preError: true }).execute();
  assert.equal(
    failed.events.some((e) => e[0] === "call"),
    true,
  );
});
test("native MCP transparent aliases/builtin passthrough and sideband nonenumerable flags", async () => {
  const alias = await mcpNativeFixture({
    transparent: true,
    alias: true,
  }).execute();
  assert.equal(alias.name, "mcp__backend__echo");
  assert.equal(alias.config.tools.backend_echo.server_name, "backend");
  assert.equal(alias.events.find((e) => e[0] === "call")[1], "backend_echo");
  assert.equal(
    (await mcpNativeFixture({ transparent: true, builtin: true }).execute())
      .name,
    "Read",
  );
  const sideband = await mcpNativeFixture({ sideband: true }).execute();
  assert.equal(sideband.events.find((e) => e[0] === "post")[5], true);
  assert.equal(JSON.stringify(sideband.output).includes("is_error"), false);
});
test("native MCP desktop invoke metadata and UI result broadcast retain original fields", async () => {
  const out = await mcpNativeFixture({ desktop: true, ui: true }).execute();
  assert.equal(out.events.find((e) => e[0] === "call")[5], "owned-mcp");
  const ui = out.events.find((e) => e[0] === "ui");
  assert.equal(ui[1], "owned-mcp");
  assert.equal(ui[2], "owned-call");
  assert.equal(ui[4].prefersBorder, false);
});
test("native MCP payment replacement is processed before post hook, remote failure skips post", async () => {
  const replaced = await mcpNativeFixture({ payment: true }).execute();
  assert.equal(replaced.output[0].text, "owned payment replacement");
  const failed = await mcpNativeFixture({ callError: true }).execute();
  assert.equal(failed.error, "owned remote failure");
  assert.equal(
    failed.events.some((e) => e[0] === "post"),
    false,
  );
});
test("native MCP config fingerprint ignores dynamic tool proxy options but detects transport changes", () => {
  const { classes } = mcpNativeFixture(),
    fingerprint = classes.computeMcpConfigFingerprint;
  assert.equal(
    fingerprint({
      type: "http",
      url: "http://owned.invalid",
      headers: { b: "2", a: "1" },
    }),
    fingerprint({
      type: "http",
      url: "http://owned.invalid",
      headers: { a: "1", b: "2" },
      transparent_proxy: true,
      tools: { owned: { defer_loading: true } },
    }),
  );
  assert.notEqual(
    fingerprint({ type: "http", url: "http://owned.invalid" }),
    fingerprint({ type: "http", url: "http://changed.invalid" }),
  );
});
test("native subagent whitelist allows prefixed MCP when only builtin restrictions were specified", () => {
  const m = new McpSubagentToolManager();
  m.register("owned", ["Read"]);
  assert.equal(m.isToolAllowed("owned", "mcp__server__echo"), true);
  assert.equal(m.isToolAllowed("owned", "Write"), false);
  m.register("owned", ["mcp__server__echo"]);
  assert.equal(m.isToolAllowed("owned", "mcp__server__other"), false);
  m.register("owned", []);
  assert.deepEqual(m.getTools("owned"), ["mcp__server__echo"]);
  m.clear();
  assert.equal(m.isToolAllowed("owned", "Write"), true);
});
test("native MCP JSONC parser/atomic config writer preserves source comments protocol", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "native-mcp-jsonc-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const utils = createNativeMcpUtils({ env: {}, logger: { debug() {} } });
  assert.deepEqual(utils.parseJsonc('{/* owned */"x":1,}'), { x: 1 });
  assert.throws(() => utils.parseJsonc('{"x":}'), /JSONC parse error/);
  const path = join(root, "owned.json");
  utils.writeConfigFileAtomic(path, '{"owned":true}');
  assert.equal(await readFile(path, "utf8"), '{"owned":true}');
  assert.deepEqual(await readdir(root), ["owned.json"]);
  assert.equal(utils.getToolTimeout(), 100000000);
});
test("native MCP large output spills into owned parent/subagent hierarchy with exact guidance", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "native-mcp-result-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const results = createNativeMcpResultProcessor({
    getHomeProjectDir: () => root,
    env: {},
    now: () => 17,
    crypto: { randomBytes: () => ({ toString: () => "001122" }) },
  });
  const out = await results.processMcpResult(
    [{ type: "text", text: "owned".repeat(20) }],
    10,
    "server/owned",
    "tool:owned",
    "agent-child",
    "parent",
  );
  const files = await readdir(
    join(root, "parent", "subagents", "agent-child", "tool-results"),
  );
  assert.equal(files[0], "mcp-server_owned-tool_owned-17-001122.txt");
  assert.match(out[0].text, /100% of the content/);
  assert.equal(
    await readFile(
      join(
        root,
        "parent",
        "subagents",
        "agent-child",
        "tool-results",
        files[0],
      ),
      "utf8",
    ),
    "owned".repeat(20),
  );
});
test("native MCP image-containing overflow truncates text without dropping images", async () => {
  const result = createNativeMcpResultProcessor({
      getHomeProjectDir: () => {
        throw Error("should not persist");
      },
      env: {},
    }),
    image = { type: "image", data: "owned", mimeType: "image/png" },
    out = await result.processMcpResult(
      [
        { type: "text", text: "x".repeat(90) },
        image,
        { type: "audio", data: "a".repeat(90), mimeType: "audio/wav" },
      ],
      10,
      "owned",
      "echo",
      "owned-session",
      undefined,
    );
  assert.equal(out[0].text.length, 40);
  assert.equal(out[1], image);
  assert.match(out.at(-1).text, /OUTPUT TRUNCATED/);
});
test("native SDK MCP transport aborts inflight on close and does not report abort as a new failure", async () => {
  const { classes } = mcpNativeFixture(),
    events: string[] = [],
    transport = new classes.SdkMcpTransport({
      serverName: "owned",
      sendMcpMessage: (_n: any, _m: any, signal: AbortSignal) =>
        new Promise((_r, reject) =>
          signal.addEventListener(
            "abort",
            () => reject(Error("owned aborted")),
            { once: true },
          ),
        ),
    });
  transport.onerror = () => events.push("error");
  transport.onclose = () => events.push("close");
  const send = transport.send({ jsonrpc: "2.0", id: 1, method: "owned" });
  await transport.close();
  await send;
  await transport.close();
  assert.deepEqual(events, ["close"]);
  assert.equal(transport.inflightControllers.size, 0);
  await assert.rejects(transport.send({}), /is closed/);
});

setTraceProcessors([]);
async function ownedSdkMcp(t: any, allowed = true) {
  const root = await mkdtemp(join(tmpdir(), "native-mcp-sdk-")),
    messages: any[] = [],
    rpcCalls: any[] = [],
    errors: any[] = [];
  let h: any,
    turn = 0;
  const output = new EventEmitter() as any;
  output.write = (line: string) => {
    const message = JSON.parse(line);
    messages.push(message);
    if (message.type === "control_request")
      queueMicrotask(() => {
        let response: any;
        if (message.request.subtype === "can_use_tool")
          response = {
            allowed,
            interrupt: !allowed,
            reason: allowed ? undefined : "owned denied",
          };
        else if (message.request.subtype === "mcp_message") {
          const rpc = message.request.message;
          rpcCalls.push(rpc);
          const result =
            rpc.method === "initialize"
              ? {
                  protocolVersion: "2025-06-18",
                  capabilities: {
                    tools: { listChanged: true },
                    resources: {},
                    prompts: {},
                  },
                  serverInfo: { name: "owned-sdk", version: "1.0.0" },
                }
              : rpc.method === "tools/list"
                ? {
                    tools: [
                      {
                        name: "echo",
                        description: "owned MCP echo",
                        inputSchema: {
                          type: "object",
                          properties: { text: { type: "string" } },
                        },
                      },
                    ],
                  }
                : rpc.method === "tools/call"
                  ? {
                      content: [
                        {
                          type: "text",
                          text: "owned:" + rpc.params.arguments.text,
                        },
                      ],
                    }
                  : rpc.method === "resources/list"
                    ? {
                        resources: [{ uri: "owned://resource", name: "owned" }],
                      }
                    : {
                        contents: [
                          { uri: "owned://resource", text: "owned resource" },
                        ],
                      };
          response = {
            mcp_response:
              rpc.id === undefined
                ? { jsonrpc: "2.0", method: "notifications/tools/list_changed" }
                : { jsonrpc: "2.0", id: rpc.id, result },
          };
        } else response = {};
        void h.sdkControl
          .receive({
            type: "control_response",
            response: {
              subtype: "success",
              request_id: message.request_id,
              response,
            },
          })
          .catch((e: any) => errors.push(e));
      });
    return true;
  };
  const model: Model = {
    async getResponse() {
      return { output: [], usage: new Usage() };
    },
    async *getStreamedResponse() {
      const output: any[] =
        ++turn === 1
          ? [
              {
                type: "function_call",
                name: "mcp__owned__echo",
                callId: "owned-mcp-call",
                id: "owned-mcp-call",
                arguments: '{"text":"fixture"}',
                status: "completed",
              },
            ]
          : [
              {
                type: "message",
                role: "assistant",
                id: "owned-final",
                status: "completed",
                content: [{ type: "output_text", text: "settled" }],
              },
            ];
      yield { type: "response_started" };
      yield {
        type: "response_done",
        response: {
          id: "owned-" + turn,
          usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
          output,
        },
      } as any;
    },
  };
  h = await createHarness({
    workDir: root,
    stateDir: join(root, ".state"),
    recordReplayEnv: {},
    modelProvider: { getModel: () => model },
    sdkControl: { stdout: output },
  });
  t.after(async () => {
    await h.close();
    assert.deepEqual(errors, []);
    await rm(root, { recursive: true, force: true });
  });
  await h.sdkControl.receive({
    type: "control_request",
    request_id: "owned-init",
    request: { subtype: "initialize", sdkMcpServers: ["owned"] },
  });
  const initialized = messages.find(
    (m) => m.response?.request_id === "owned-init",
  );
  assert.equal(
    initialized.response.subtype,
    "success",
    initialized.response.error,
  );
  return {
    h,
    messages,
    rpcCalls,
    session: await h.openSession(),
    get turns() {
      return turn;
    },
  };
}
test(
  "real SDK MCP initialize → list → native approval → tool call → history",
  { timeout: 15000 },
  async (t) => {
    const f = await ownedSdkMcp(t);
    assert.equal(await f.h.prompt(f.session, "owned SDK MCP"), "settled");
    assert.equal(
      f.messages.filter((m) => m.request?.subtype === "can_use_tool").length,
      1,
    );
    assert.equal(f.rpcCalls.filter((r) => r.method === "tools/call").length, 1);
    assert.equal(
      f.rpcCalls.find((r) => r.method === "tools/call").params.name,
      "echo",
    );
    assert.ok(
      f.session.history.some(
        (x: any) =>
          x.type === "function_call_result" && x.callId === "owned-mcp-call",
      ),
    );
  },
);
test(
  "real SDK MCP descriptor approval bridge rejects before transport tool execution",
  { timeout: 15000 },
  async (t) => {
    const f = await ownedSdkMcp(t, false);
    assert.equal(await f.h.prompt(f.session, "owned SDK MCP rejection"), "");
    assert.equal(
      f.messages.filter((m) => m.request?.subtype === "can_use_tool").length,
      1,
    );
    assert.equal(
      f.rpcCalls.some((r) => r.method === "tools/call"),
      false,
    );
    assert.equal(f.turns, 1);
  },
);
test(
  "real SDK MCP repeated initialize retains active transport instead of connecting twice",
  { timeout: 15000 },
  async (t) => {
    const f = await ownedSdkMcp(t),
      first = await f.h.nativeMcp.manager.get("owned");
    await f.h.sdkControl.receive({
      type: "control_request",
      request_id: "owned-init-again",
      request: { subtype: "initialize", sdkMcpServers: ["owned"] },
    });
    assert.equal(
      f.messages.find((m) => m.response?.request_id === "owned-init-again")
        .response.subtype,
      "success",
    );
    assert.equal(await f.h.nativeMcp.manager.get("owned"), first);
    assert.equal(f.rpcCalls.filter((r) => r.method === "initialize").length, 1);
  },
);
test(
  "real stdio MCP override connects owned child, resources/prompts and closes it",
  { timeout: 15000 },
  async (t) => {
    const root = await mkdtemp(join(tmpdir(), "native-mcp-stdio-"));
    const host = createNativeMcpHost({
      getWorkDir: () => root,
      getHomeProjectDir: () => root,
      permissionUtils: {},
      env: { PATH: process.env.PATH ?? "" },
      dependencies: {
        channels: {
          registerChannel() {},
          isChannel() {
            return false;
          },
        },
      },
      endpointProvider: {
        async get() {
          return "http://127.0.0.1:9";
        },
      },
    });
    t.after(async () => {
      await host.close();
      await rm(root, { recursive: true, force: true });
    });
    const fixture = [
      new URL("./fixtures/mcp-native-server.mjs", import.meta.url),
      new URL("../../test/fixtures/mcp-native-server.mjs", import.meta.url),
    ]
      .map((url) => fileURLToPath(url))
      .find(existsSync)!;
    const server = await host.connect("owned", {
      type: "stdio",
      command: process.execPath,
      args: [fixture],
    });
    assert.equal((await server.listTools())[0].name, "mcp__owned__echo");
    const sideband: any[] = [];
    assert.equal(
      (
        await server.callTool(
          "mcp__owned__echo",
          { text: "fixture" },
          { __resultMetaSink: (x: any) => sideband.push(x) },
        )
      )[0].text,
      "owned:fixture",
    );
    assert.equal(sideband[0]._meta.owned, "sideband");
    assert.equal((await server.listResources())[0].uri, "owned://fixture");
    assert.equal((await server.listPrompts())[0].name, "owned");
    assert.equal(
      (await server.readResource({ uri: "owned://fixture" }))[0].text,
      "owned resource",
    );
    await host.close();
    assert.equal(host.transport.transportCache.size, 0);
  },
);
for (const type of ["http", "sse"] as const)
  test(
    `real ${type} MCP transport preserves metadata/model header and closes`,
    { timeout: 15000 },
    async (t) => {
      const peer = await ownedMcpHttp(),
        root = await mkdtemp(join(tmpdir(), "native-mcp-http-"));
      const host = createNativeMcpHost({
        getWorkDir: () => root,
        getHomeProjectDir: () => root,
        permissionUtils: {},
        env: {},
        dependencies: {
          channels: {
            registerChannel() {},
            isChannel() {
              return false;
            },
          },
          store: { getSessionFilePath: () => join(root, "owned.jsonl") },
          toolHooks: {
            async executePreToolUseHooks() {
              return { allowed: true };
            },
            async executePostToolUseHooks() {
              return { allowed: true };
            },
          },
        },
      });
      t.after(async () => {
        await host.close();
        await peer.close();
        await rm(root, { recursive: true, force: true });
      });
      const server = await host.connect("owned", {
        type,
        url: peer.url + (type === "http" ? "/mcp" : "/sse"),
      });
      assert.equal((await server.listTools())[0].name, "mcp__owned__echo");
      const session = new HarnessSession("owned-session");
      session.options.model = "owned-remote-model";
      const sideband: any[] = [];
      assert.equal(
        (
          await server.callTool(
            "mcp__owned__echo",
            { text: type },
            {
              __session: session,
              __resultMetaSink: (x: any) => sideband.push(x),
              __timeoutMs: 2000,
            },
          )
        )[0].text,
        "owned:" + type,
      );
      assert.equal(sideband[0]._meta.owned, "remote-sideband");
      assert.equal(
        peer.requests.find((x) => x.method === "tools/call").model,
        "owned-remote-model",
      );
      assert.equal(host.manager.underlyingCache.size, 1);
      await host.close();
      assert.equal(host.transport.transportCache.size, 0);
    },
  );
test("native MCP model-header context remains isolated across concurrent calls", async () => {
  const { classes } = mcpNativeFixture(),
    transport: any = {
      _fetch: async (_url: any, init: any) =>
        new Headers(init?.headers).get("X-Model-ID"),
    };
  const invoke = (modelId: string) =>
    classes.withMcpModelIdHeader({ transport, modelId }, async () => {
      await new Promise((resolve) => setImmediate(resolve));
      return transport._fetch("owned://fixture", {});
    });
  assert.deepEqual(await Promise.all([invoke("owned-a"), invoke("owned-b")]), [
    "owned-a",
    "owned-b",
  ]);
  assert.equal(await transport._fetch("owned://outside", {}), null);
});
for (const name of [
  "OverriddenUnderlyingMCPServerStdio",
  "OverriddenUnderlyingMCPServerSSE",
  "OverriddenUnderlyingMCPServerStreamableHttp",
  "SdkMcpServer",
] as const)
  test(`native ${name} preserves listTools failure cooldown and retries after 30s`, async () => {
    const fixture = mcpNativeFixture();
    let clock = 100,
      calls = 0;
    const classes = (
      await import("../src/mcp/native-mcp-runtime.js")
    ).createNativeMcpRuntime({ ...fixture.runtime, now: () => clock });
    const server = new (classes[name] as any)({
      name: "owned",
      url: "http://owned.invalid",
      logger: { debug() {}, info() {}, warn() {}, error() {} },
    });
    server.session = {
      async listTools() {
        if (++calls === 1)
          throw Error("<html><title>Owned error</title></html>");
        return { tools: [{ name: "echo", inputSchema: { type: "object" } }] };
      },
    };
    assert.deepEqual(await server.listTools(), []);
    clock += 1;
    assert.deepEqual(await server.listTools(), []);
    assert.equal(calls, 1);
    clock += 30000;
    assert.equal((await server.listTools())[0].name, "echo");
    assert.equal(calls, 2);
  });
for (const name of [
  "OverriddenUnderlyingMCPServerStdio",
  "OverriddenUnderlyingMCPServerSSE",
  "OverriddenUnderlyingMCPServerStreamableHttp",
] as const)
  test(`native ${name} separates progress/signal/timeout from real MCP metadata`, async () => {
    const { classes } = mcpNativeFixture(),
      server = new (classes[name] as any)({
        name: "owned",
        url: "http://owned.invalid",
      }),
      progress: any[] = [],
      sideband: any[] = [],
      requests: any[] = [],
      signal = new AbortController().signal;
    server.session = {
      async callTool(request: any, _schema: any, options: any) {
        requests.push([request, options]);
        options.onprogress({
          progress: 1,
          total: 2,
          message: "owned progress",
        });
        return {
          content: [{ type: "text", text: "owned" }],
          _meta: { owned: true },
          isError: true,
        };
      },
    };
    const result = await server.callTool(
      "echo",
      { owned: true },
      {
        __onProgress: (...args: any[]) => progress.push(args),
        __resultMetaSink: (value: any) => sideband.push(value),
        __signal: signal,
        __timeoutMs: 9,
        modelId: "owned-model",
      },
    );
    assert.equal(result[0].text, "owned");
    assert.deepEqual(progress, [[1, 2, "owned progress"]]);
    assert.equal(requests[0][1].signal, signal);
    assert.equal(requests[0][1].timeout, 9);
    assert.deepEqual(requests[0][0]._meta, { modelId: "owned-model" });
    assert.equal(sideband[0].isError, true);
    assert.equal(sideband[0]._meta.owned, true);
  });
test("native MCP create serializes a rejected predecessor without losing the next creation gate", async () => {
  const { manager } = mcpNativeFixture();
  let release!: () => void;
  const first = new Promise<void>((r) => {
      release = r;
    }),
    calls: string[] = [];
  manager.instantiateServer = async (name: string, config: any) => {
    calls.push(config.url);
    if (config.url === "first") {
      await first;
      throw Error("owned creation failure");
    }
    return { name, async close() {} };
  };
  const one = manager.create("owned", { type: "http", url: "first" }),
    rejection = assert.rejects(one, /owned creation failure/),
    two = manager.create("owned", { type: "http", url: "second" });
  release();
  await rejection;
  await two;
  await manager.waitForIdle("owned");
  assert.deepEqual(calls, ["first", "second"]);
  assert.equal(manager.creating.size, 0);
  assert.equal(manager.serverCache.size, 1);
  await manager.clear();
});
test(
  "real harness SDK calls an initial HTTP MCP server after one explicit host approval",
  { timeout: 15000 },
  async (t) => {
    const peer = await ownedMcpHttp(),
      root = await mkdtemp(join(tmpdir(), "native-mcp-harness-http-")),
      approvals: string[] = [];
    let turn = 0;
    const model: Model = {
      async getResponse() {
        return { output: [], usage: new Usage() };
      },
      async *getStreamedResponse() {
        const output: any[] =
          ++turn === 1
            ? [
                {
                  type: "function_call",
                  name: "mcp__owned__echo",
                  callId: "owned-http-call",
                  id: "owned-http-call",
                  arguments: '{"text":"sdk"}',
                  status: "completed",
                },
              ]
            : [
                {
                  type: "message",
                  role: "assistant",
                  id: "owned-answer",
                  status: "completed",
                  content: [{ type: "output_text", text: "settled" }],
                },
              ];
        yield { type: "response_started" };
        yield {
          type: "response_done",
          response: {
            id: "owned-" + turn,
            usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
            output,
          },
        } as any;
      },
    };
    const h = await createHarness({
      workDir: root,
      stateDir: join(root, ".state"),
      recordReplayEnv: {},
      modelProvider: { getModel: () => model },
      nativeMcp: {
        env: {},
        servers: {
          owned: { type: "http", url: peer.url + "/mcp", defer_loading: false },
        },
      },
      approveTool: (name) => {
        approvals.push(name);
        return true;
      },
    });
    t.after(async () => {
      await h.close();
      await peer.close();
      await rm(root, { recursive: true, force: true });
    });
    const session = await h.openSession();
    assert.equal(await h.prompt(session, "owned HTTP MCP"), "settled");
    assert.deepEqual(approvals, ["mcp__owned__echo"]);
    assert.equal(peer.calls.length, 1);
    assert.equal(peer.calls[0].arguments.text, "sdk");
    const current = await h.agents.getDefault(),
      view = current.mcpServers;
    await h.nativeMcp!.delete("owned");
    assert.equal(current.mcpServers, view);
    assert.equal(view.length, 0);
  },
);
test("native MCP registry retains the original live array contract across add/remove", () => {
  const registry = new McpRegistry(),
    view = registry.connectedServers(),
    server: any = { name: "owned", connected: true };
  registry.register(server);
  assert.equal(registry.connectedServers(), view);
  assert.deepEqual(view, [server]);
  registry.unregister("owned");
  assert.deepEqual(view, []);
});
test("native MCP manager keeps proxy shell while rebuilding underlying on fingerprint change", async () => {
  const f = mcpNativeFixture(),
    calls: any[] = [],
    manager = f.manager;
  manager.transportManager = {
    deleteByNameSync: (name: string) => calls.push(["drop", name]),
  };
  let count = 0;
  manager.instantiateServer = async (name: string) => ({
    name,
    id: ++count,
    async close() {
      calls.push(["close", this.id]);
    },
    async listTools() {
      return [{ name: "echo", inputSchema: { type: "object" } }];
    },
  });
  const a = await manager.create("owned", {
      type: "http",
      url: "http://owned.invalid",
    }),
    b = await manager.create("owned", {
      type: "http",
      url: "http://owned.invalid",
      transparent_proxy: true,
      tools: {},
    }),
    c = await manager.create("owned", {
      type: "http",
      url: "http://changed.invalid",
    });
  assert.equal(a, b);
  assert.equal(b, c);
  assert.equal(c.id, 2);
  assert.equal(count, 2);
  assert.deepEqual(calls, [
    ["drop", "owned"],
    ["close", 1],
  ]);
  assert.equal(manager.creating.size, 0);
  await manager.clear();
});
test("owned MCP host awaits already-disposed underlying closes and shares its shutdown barrier", async () => {
  const host = createNativeMcpHost({
    getWorkDir: () => "/owned",
    getHomeProjectDir: () => "/owned/state",
    permissionUtils: {},
    dependencies: {},
  });
  let release!: () => void;
  let completed = false;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  host.manager.underlyingCache.set("owned", {
    async close() {
      await gate;
      completed = true;
    },
  });
  host.manager.disposeUnderlying("owned");
  assert.equal(host.manager.underlyingCache.size, 0);
  const closing = host.close();
  assert.equal(host.close(), closing);
  let settled = false;
  void closing.then(() => {
    settled = true;
  });
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.equal(settled, false);
  release();
  await closing;
  assert.equal(completed, true);
  assert.equal(host.ownedTimerCount, 0);
});
