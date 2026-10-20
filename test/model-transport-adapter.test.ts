import assert from "node:assert/strict";
import test from "node:test";
import { ProductConfiguration } from "../src/config/product-config.js";
import {
  MODEL_HEADERS,
  StreamTimeoutError,
  WorkBuddyModelTransport,
} from "../src/models/model-transport.js";
import { SessionManager } from "../src/sessions/session-manager.js";

const settings = {
  async get<T>(key: string): Promise<T | undefined> {
    if (key === "env") {
      return {
        CODEBUDDY_CUSTOM_HEADERS: "X-Custom: configured",
        CODEBUDDY_API_KEY: "configured-key",
      } as T;
    }
    if (key === "enableModelOptimization") return { enabled: false } as T;
    return undefined;
  },
};

function productWithModel(model: Record<string, unknown>) {
  return new ProductConfiguration({
    productName: "WorkBuddy",
    applicationName: "workbuddy",
    genieVersion: "5.3.14",
    commit: "test",
    date: "test",
    endpoint: "https://copilot.tencent.com",
    deploymentType: "external",
    agents: [{ name: "cli", tags: ["default"] }],
    tools: [],
    prompts: [],
    models: [model as any],
  });
}

test("transport applies exact request metadata and body compatibility transforms", async () => {
  const sessions = new SessionManager();
  const session = await sessions.create({
    id: "session-1",
    conversationRequestId: "conversation-request-1",
    agentPurpose: "subagent",
    meta: { "codebuddy.ai/mode": "craft", rootRequestId: "root-1" },
    requestOptions: {
      providerData: { temperature: 0.2, extra_vars: { growthEvent: "open" } },
      headers: { "X-Session": "yes" },
    },
  });
  let capturedURL = "";
  let captured: RequestInit | undefined;
  const transport = new WorkBuddyModelTransport({
    product: productWithModel({
      id: "custom-local:test-model",
      name: "test-model",
      tags: ["custom"],
      trustLevel: "custom",
      url: "https://model.test/v1/chat/completions/chat/completions?key=secret",
      supportsImages: false,
      supportsToolCall: false,
    }),
    sessions,
    settings,
    alwaysThinkingEnabled: () => true,
    clientInfo: {
      async get() {
        return { ideType: "CLI", platform: "darwin", platformVersion: "5.3.14" };
      },
    },
    fetch: async (input, init) => {
      capturedURL = String(input);
      captured = init;
      return new Response('{"ok":true}', {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    },
  });

  await transport.fetch("https://default.test/v2/chat/completions", {
    method: "POST",
    headers: { Authorization: "Bearer sdk-default" },
    body: JSON.stringify({
      model: "custom-local:test-model",
      stream: false,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "hello" },
            { type: "image_url", image_url: { url: "data:image/png;base64,x" } },
          ],
        },
      ],
      tools: [{ type: "function", function: { name: "Read" } }],
      tool_choice: "auto",
      reasoning_effort: "high",
    }),
  });

  assert.equal(
    capturedURL,
    "https://model.test/v1/chat/completions?key=secret",
  );
  const headers = captured!.headers as Record<string, string>;
  assert.equal(headers[MODEL_HEADERS.conversationId], "session-1");
  assert.equal(
    headers[MODEL_HEADERS.conversationRequestId],
    "conversation-request-1",
  );
  assert.equal(headers[MODEL_HEADERS.rootRequestId], "root-1");
  assert.equal(headers[MODEL_HEADERS.agentPurpose], "subagent");
  assert.equal(headers["X-Custom"], "configured");
  assert.equal(headers.Authorization, "Bearer configured-key");
  assert.equal(
    Object.keys(headers).some(
      (name) => name.toLowerCase() === MODEL_HEADERS.privateData.toLowerCase(),
    ),
    false,
  );
  const body = JSON.parse(String(captured!.body));
  assert.equal(body.model, "test-model");
  // Provider data is intentionally not merged for external custom models.
  assert.equal(body.temperature, undefined);
  assert.equal(body.messages[0].content, "hello");
  assert.equal(body.tools, undefined);
  assert.equal(body.tool_choice, undefined);
  assert.equal(body.reasoning_summary, "auto");
  assert.equal(session.requestOptions.growthEventRequestId, undefined);
  assert.match(session.messageId!, /^[0-9a-f]{32}$/);
});

test("transport processors are stable priority ordered", async () => {
  const sessions = new SessionManager();
  await sessions.create({ id: "session-2" });
  const order: number[] = [];
  let finalHeader = "";
  const transport = new WorkBuddyModelTransport({
    product: productWithModel({ id: "model", name: "model" }),
    sessions,
    settings,
    fetch: async (_input, init) => {
      finalHeader = (init!.headers as Record<string, string>)["X-Order"]!;
      return new Response("ok");
    },
  });
  transport.registerProcessor({
    priority: 20,
    process(request) {
      order.push(20);
      request.headers["X-Order"] += "-20";
    },
  });
  transport.registerProcessor({
    priority: 10,
    process(request) {
      order.push(10);
      request.headers["X-Order"] = "10";
    },
  });
  await transport.fetch("https://model.test/chat/completions", {
    method: "POST",
    body: JSON.stringify({ model: "model" }),
  });
  assert.deepEqual(order, [10, 20]);
  assert.equal(finalHeader, "10-20");
});

test("stream monitor normalizes duplicate tool ids and enforces first-token timeout", async (t) => {
  // The monitor intentionally unrefs its timer. A mock Response has no live
  // socket; model the host/network liveness explicitly while testing timeout.
  const liveHost = setInterval(() => undefined, 1000);
  t.after(() => clearInterval(liveHost));
  const sessions = new SessionManager();
  await sessions.create({ id: "session-3" });
  const encoder = new TextEncoder();
  const chunks = [
    'data: {"choices":[{"delta":{"tool_calls":[{"id":"call-1"}]}}]}\n',
    'data: {"choices":[{"delta":{"tool_calls":[{"id":"call-1","index":0}]},"finish_reason":"stop"}]}\n',
  ];
  const transport = new WorkBuddyModelTransport({
    product: productWithModel({ id: "model", name: "model" }),
    sessions,
    settings,
    finishReasonGraceMs: 5,
    fetch: async () =>
      new Response(
        new ReadableStream({
          start(controller) {
            for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
            controller.close();
          },
        }),
        { headers: { "content-type": "text/event-stream" } },
      ),
  });
  const response = await transport.fetch("https://model.test/chat/completions", {
    method: "POST",
    headers: { accept: "text/event-stream" },
    body: JSON.stringify({ model: "model", stream: true }),
  });
  const output = await response.text();
  assert.equal((output.match(/"id":"call-1"/g) ?? []).length, 1);

  const timeoutTransport = new WorkBuddyModelTransport({
    product: productWithModel({ id: "model", name: "model" }),
    sessions,
    settings,
    firstTokenTimeoutMs: 10,
    fetch: async () =>
      new Response(new ReadableStream({ start() {} }), {
        headers: { "content-type": "text/event-stream" },
      }),
  });
  const timed = await timeoutTransport.fetch(
    "https://model.test/chat/completions",
    {
      method: "POST",
      headers: { accept: "text/event-stream" },
      body: JSON.stringify({ model: "model", stream: true }),
    },
  );
  await assert.rejects(() => timed.text(), StreamTimeoutError);
});
