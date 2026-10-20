import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import { DelegateToolManagerImpl } from "../src/delegate/delegate-tool-manager.js";
import { DelegateToolsChangedHandler } from "../src/delegate/delegate-tools-changed-handler.js";
import {
  DelegateToolImpl,
  delegateToolParameters,
  delegateToolJsonSchema,
} from "../src/tools/delegate-tool.js";
import {
  createHarness,
  type HarnessOptions,
} from "../src/runtime/create-harness.js";
setTraceProcessors([]);
const definition = (name = "Fixture") => ({
  name,
  description: `Description ${name}`,
  inputSchema: {
    type: "object",
    required: ["text"],
    properties: { text: { type: "string" } },
  },
  requiresApproval: false,
});
async function fixture(
  t: { after(fn: () => any): void },
  options: Partial<HarnessOptions> = {},
) {
  const root = await mkdtemp(join(tmpdir(), "harness-delegate-"));
  const h = await createHarness({
    workDir: root,
    modelProvider: {
      getModel() {
        throw new Error("unused model");
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
  return h;
}
function modelFixture(requests: any[], input: any): Model {
  let count = 0;
  return {
    async getResponse() {
      return { output: [], usage: new Usage() };
    },
    async *getStreamedResponse(request) {
      requests.push(request);
      count++;
      const output =
        count === 1
          ? [
              {
                type: "function_call",
                id: "delegate-call",
                callId: "delegate-call",
                name: "DelegateTool",
                status: "completed",
                arguments: JSON.stringify(input),
              },
            ]
          : [
              {
                type: "message",
                id: "answer",
                role: "assistant",
                status: "completed",
                content: [{ type: "output_text", text: "delegated" }],
              },
            ];
      yield { type: "response_started" };
      if (count > 1) yield { type: "output_text_delta", delta: "delegated" };
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
test("delegate schema retains Zod 3 record JSON without propertyNames and permits native negative timeout", () => {
  assert.equal(
    delegateToolParameters.safeParse({
      toolId: "",
      input: {},
      timeout: -1,
      extra: true,
    }).success,
    true,
  );
  assert.equal(
    delegateToolParameters.safeParse({ toolId: "t", input: [] }).success,
    false,
  );
  assert.equal(
    (delegateToolJsonSchema as any).properties.input.propertyNames,
    undefined,
  );
  assert.deepEqual((delegateToolJsonSchema as any).required, [
    "toolId",
    "input",
  ]);
});
test("registration clones map but shares definitions and ignores available-tools session", async () => {
  const manager = new DelegateToolManagerImpl(),
    value = { ...definition(), id: "override" };
  await manager.registerTool("registered", value, "provider");
  manager.getTools().clear();
  assert.equal(manager.hasTools(), true);
  value.name = "Mutated";
  assert.equal(manager.getTools().get("registered")!.name, "Mutated");
  assert.equal(manager.getAvailableTools("session-a")[0]!.id, "override");
  assert.deepEqual(
    manager.getAvailableTools("session-a"),
    manager.getAvailableTools("session-b"),
  );
});
test("overwrite retains stale provider ownership; clear does not notify", async () => {
  const manager = new DelegateToolManagerImpl();
  let notifications = 0;
  manager.setOnToolsChanged(() => {
    notifications++;
  });
  await manager.registerTool("id", definition("first"), "first");
  await manager.registerTool("id", definition("second"), "second");
  await manager.unregisterTool("missing");
  assert.equal(notifications, 2);
  await manager.clearTools("first");
  assert.equal(manager.hasTools(), false);
  assert.equal(manager.providerTools.get("second")!.has("id"), true);
  assert.equal(notifications, 2);
});
test("callback errors are logged without rolling back committed registration", async () => {
  const logs: any[] = [],
    manager = new DelegateToolManagerImpl({
      error: (...args) => logs.push(args),
    });
  manager.setOnToolsChanged(() => {
    throw new Error("notification failed");
  });
  await manager.registerTool("id", definition(), "provider");
  assert.equal(manager.hasTools(), true);
  assert.equal(logs.length, 1);
  await manager.unregisterTool("id");
  assert.equal(manager.hasTools(), false);
  assert.equal(logs.length, 2);
});
test("forwarding uses last global connection, empty session and timeout truthiness", async () => {
  const manager = new DelegateToolManagerImpl(),
    calls: any[] = [];
  await manager.registerTool("id", definition(), "unrelated-provider");
  manager.setConnection({
    async extMethod() {
      throw new Error("old connection");
    },
  });
  manager.setConnection({
    async extMethod(...args) {
      calls.push(args);
      return { status: "success", output: "done" };
    },
  });
  for (const timeout of [undefined, 0, -1])
    assert.deepEqual(await manager.executeTool("id", { raw: 1 }, timeout), {
      status: "success",
      output: "done",
    });
  assert.deepEqual(
    calls.map((c) => [c[0], c[1].sessionId, c[1].timeout]),
    [
      ["_codebuddy.ai/delegateTool", "", 30000],
      ["_codebuddy.ai/delegateTool", "", 30000],
      ["_codebuddy.ai/delegateTool", "", -1],
    ],
  );
  assert.match(calls[0][1].toolCallId, /^delegate-id-\d+$/);
  manager.clearConnection();
  assert.equal(manager.hasTools(), true);
  assert.deepEqual(await manager.executeTool("id", {}), {
    status: "error",
    error: "ACP connection not available",
  });
});
test("timeout is forwarded, not enforced by a harness timer; disconnect does not cancel pending call", async () => {
  const manager = new DelegateToolManagerImpl();
  await manager.registerTool("id", definition(), "provider");
  let release!: (value: any) => void;
  manager.setConnection({
    extMethod: () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  });
  let settled = false;
  const pending = manager.executeTool("id", {}, 1).then((value) => {
    settled = true;
    return value;
  });
  manager.clearConnection();
  await new Promise((resolve) => setTimeout(resolve, 10));
  assert.equal(settled, false);
  release({ status: "success", output: "late" });
  assert.deepEqual(await pending, { status: "success", output: "late" });
});
test("source error/status conversion ignores plain-string client error", async () => {
  const manager = new DelegateToolManagerImpl();
  await manager.registerTool("id", definition(), "provider");
  for (const [response, expected] of [
    [
      { status: "error", error: "ignored" },
      { status: "error", error: "Unknown error" },
    ],
    [
      { status: "error", error: { message: "detail" } },
      { status: "error", error: "detail" },
    ],
    [
      { status: "cancelled" },
      { status: "cancelled", error: "Tool execution cancelled" },
    ],
  ]) {
    manager.setConnection({ extMethod: async () => response });
    assert.deepEqual(await manager.executeTool("id", {}), expected);
  }
});
test("handler preserves nested ToolResult wrapping and falsy-output fallback", async () => {
  const tool = new DelegateToolImpl(() => ({
    executeTool: async () => ({ status: "success", output: false }),
  }));
  const result = await tool.execute({ toolId: "id", input: {} }, {});
  assert.deepEqual(result, {
    content: { content: { status: "success", output: false } },
  });
  assert.deepEqual(tool.extractRawResponse(result), result.content);
  assert.deepEqual(await tool.execute({ toolId: "id", input: {} }), {
    content: { error: "No execution context provided" },
  });
  assert.match(
    (
      await new DelegateToolImpl(() => undefined).execute(
        { toolId: "id", input: {} },
        {},
      )
    ).content.error,
    /ACP connection may be offline/,
  );
});
test("ACP notification preserves provider fallback, partial commits and removed-array precedence", async () => {
  const manager = new DelegateToolManagerImpl(),
    handler = new DelegateToolsChangedHandler(() => manager);
  await assert.rejects(
    handler.handleDelegateToolsChanged({
      changeType: "added",
      sessionId: "session",
      tools: [{ id: "id", ...definition(), inputSchema: null }, null],
    }),
    TypeError,
  );
  assert.equal(manager.tools.get("id")!.providerId, "session");
  assert.deepEqual(manager.getTools().get("id")!.inputSchema, {});
  await handler.handleDelegateToolsChanged({
    changeType: "removed",
    tools: [],
    toolIds: ["id"],
  });
  assert.equal(manager.hasTools(), true);
  await handler.handleDelegateToolsChanged({
    changeType: "removed",
    toolIds: [1, "id"],
  });
  assert.equal(manager.hasTools(), false);
});
test("getAll lists eagerly constructed CLI agents and registration refreshes tools without replacing agent/model", async (t) => {
  const h = await fixture(t);
  const eagerAgents = await h.agents.getAll();
  assert.equal(h.agents.ready, true);
  assert.equal(eagerAgents.length, 19);
  const agent = await h.agents.getDefault();
  agent.model = "explicit-model";
  assert.equal(
    agent.tools.some((tool: any) => tool.name === "DelegateTool"),
    false,
  );
  await h.delegateToolManager.registerTool("id", definition(), "provider");
  assert.equal(await h.agents.getDefault(), agent);
  assert.equal(agent.model, "explicit-model");
  assert.equal((await h.agents.getAll()).length, eagerAgents.length);
  assert.equal(
    agent.tools.some((tool: any) => tool.name === "DelegateTool"),
    true,
  );
  await h.delegateToolManager.unregisterTool("id");
  assert.equal(
    agent.tools.some((tool: any) => tool.name === "DelegateTool"),
    false,
  );
});
test("dynamic descriptions cache per agent, clearTools does not invalidate, registration does", async (t) => {
  const h = await fixture(t),
    config = h.product.defaultAgent;
  await h.delegateToolManager.registerTool(
    "first-id",
    definition("First"),
    "provider",
  );
  const first = await h.tools.getToolDescriptionFromProduct(
    "DelegateTool",
    config,
  );
  assert.match(first!, /first-id/);
  assert.match(first!, /Input Schema/);
  await h.delegateToolManager.clearTools();
  assert.equal(
    await h.tools.getToolDescriptionFromProduct("DelegateTool", config),
    first,
  );
  await h.delegateToolManager.registerTool(
    "second-id",
    definition("Second"),
    "provider",
  );
  const second = await h.tools.getToolDescriptionFromProduct(
    "DelegateTool",
    config,
  );
  assert.match(second!, /second-id/);
  assert.doesNotMatch(second!, /first-id/);
  await h.tools.getToolDescriptionFromProduct("DelegateTool", {
    ...config,
    name: "other-agent",
  });
  assert.equal(
    h.tools.toolDescriptionCache.has("DelegateTool:other-agent"),
    true,
  );
  assert.equal(
    await h.tools.getToolDescriptionFromProduct(
      "DelegateTool",
      { ...config, name: "explicit-config" },
      {
        ...h.product.raw,
        tools: [
          {
            name: "DelegateTool",
            description: "Explicit {{delegateToolsCount}}",
          },
        ],
      },
    ),
    "Explicit 1",
  );
});
test("registration gates availability, not connection health; original non-CLI allowlists stay unchanged", async (t) => {
  const h = await fixture(t, {
    delegateTools: [
      { id: "id", definition: definition(), providerId: "provider" },
    ],
  });
  assert.equal(h.delegateToolManager.connection, null);
  assert.equal(
    (await h.agents.getDefault()).tools.some(
      (tool: any) => tool.name === "DelegateTool",
    ),
    true,
  );
  const config = h.product.raw.agents.find(
    (agent) =>
      agent.name !== h.product.defaultAgent.name &&
      !agent.tools?.includes("DelegateTool"),
  )!;
  assert.ok(config);
  assert.equal(
    (await h.agents.get(config.name))!.tools.some(
      (tool: any) => tool.name === "DelegateTool",
    ),
    false,
  );
});
test("real SDK forwards raw input without validating provider schema and preserves nested result", async (t) => {
  const requests: any[] = [],
    calls: any[] = [],
    approvals: string[] = [],
    model = modelFixture(requests, {
      toolId: "id",
      input: { text: 42, undeclared: true },
      timeout: -1,
    });
  const h = await fixture(t, {
    modelProvider: { getModel: () => model },
    approveTool: (name) => {
      approvals.push(name);
      return true;
    },
    delegateTools: [
      { id: "id", definition: definition(), providerId: "provider" },
    ],
    delegateConnection: {
      async extMethod(...args) {
        calls.push(args);
        return { status: "success", output: { fixture: "result" } };
      },
    },
  });
  const session = await h.openSession();
  assert.equal(await h.prompt(session, "run delegated tool"), "delegated");
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0][1].input, { text: 42, undeclared: true });
  assert.equal(calls[0][1].sessionId, "");
  assert.equal(calls[0][1].timeout, -1);
  assert.ok(approvals.includes("DelegateTool"));
  assert.match(JSON.stringify(requests[0].tools), /Description Fixture/);
  assert.match(JSON.stringify(requests[1].input), /fixture/);
  const toolResult = requests[1].input.find(
    (item: any) => item.type === "function_call_result",
  );
  const serialized = toolResult.output.text;
  assert.deepEqual(JSON.parse(serialized), {
    content: { fixture: "result" },
  });
  assert.match(JSON.stringify(session.history), /result/);
  assert.equal(h.sessions.getCachedSessions().length, 1);
});
test("provider requiresApproval false does not bypass standalone permission guard", async (t) => {
  let calls = 0;
  const h = await fixture(t, {
    delegateTools: [
      { id: "id", definition: definition(), providerId: "provider" },
    ],
    delegateConnection: {
      async extMethod() {
        calls++;
        return { status: "success" };
      },
    },
  });
  const session = await h.openSession();
  await assert.rejects(
    Promise.resolve(
      (await h.tools.get("DelegateTool"))!.execute(
        { toolId: "id", input: {} },
        { context: session },
      ),
    ),
    /Tool permission denied/,
  );
  assert.equal(calls, 0);
});
test("close clears owned registry/connection without contacting external client", async (t) => {
  let calls = 0;
  const h = await fixture(t, {
    delegateTools: [
      { id: "id", definition: definition(), providerId: "provider" },
    ],
    delegateConnection: {
      async extMethod() {
        calls++;
        return {};
      },
    },
  });
  await h.close();
  assert.equal(h.delegateToolManager.connection, null);
  assert.equal(h.delegateToolManager.hasTools(), false);
  assert.equal(calls, 0);
});
