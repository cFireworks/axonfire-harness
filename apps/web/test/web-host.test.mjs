import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, rm, readFile, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { request } from "node:http";
import { Usage } from "@openai/agents-core";
import { createWebHost } from "../server.mjs";

async function setup(t, extra = {}) {
  const directory = await mkdtemp(join(tmpdir(), "axonfire-web-test-"));
  const host = await createWebHost({
    harness: { workDir: directory },
    demo: false,
    configured: false,
    ...extra,
  });
  const url = await host.listen(0);
  t.after(async () => {
    await host.close();
    await rm(directory, { recursive: true, force: true });
  });
  const status = await (await fetch(`${url}/api/status`)).json();
  const headers = {
    Origin: url,
    "Content-Type": "application/json",
    "x-axonfire-csrf": status.csrf,
  };
  return {
    directory,
    host,
    url,
    status,
    headers,
    post: (path, body) =>
      fetch(`${url}${path}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      }),
  };
}
async function consume(response, onEvent = async () => {}) {
  assert.equal(response.status, 200);
  const events = [];
  let buffer = "";
  for await (const chunk of response.body.pipeThrough(
    new TextDecoderStream(),
  )) {
    buffer += chunk;
    let index;
    while ((index = buffer.indexOf("\n\n")) >= 0) {
      const packet = buffer.slice(0, index);
      buffer = buffer.slice(index + 2);
      const type = packet
        .split("\n")
        .find((line) => line.startsWith("event: "))
        ?.slice(7);
      const data = packet
        .split("\n")
        .find((line) => line.startsWith("data: "))
        ?.slice(6);
      if (data) {
        const event = { type, data: JSON.parse(data) };
        events.push(event);
        await onEvent(event);
      }
    }
  }
  return events;
}
function provider(outputs) {
  let count = 0;
  return {
    getModel: () => ({
      async getResponse() {
        return { output: [], usage: new Usage() };
      },
      async *getStreamedResponse() {
        const output = outputs(++count);
        yield { type: "response_started" };
        for (const item of output)
          if (item.type === "message")
            yield { type: "output_text_delta", delta: item.content[0].text };
        yield {
          type: "response_done",
          response: {
            id: `web-${count}`,
            usage: { inputTokens: 2, outputTokens: 1, totalTokens: 3 },
            output,
          },
        };
      },
    }),
  };
}
const answer = (text) => [
  {
    type: "message",
    role: "assistant",
    id: "web-answer",
    status: "completed",
    content: [{ type: "output_text", text }],
  },
];

test("static app and configuration status run without credentials, with security headers", async (t) => {
  const fixture = await setup(t);
  const page = await fetch(fixture.url);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /axonfire/);
  assert.match(
    page.headers.get("content-security-policy"),
    /frame-ancestors 'none'/,
  );
  assert.equal(page.headers.get("cache-control"), "no-store");
  assert.equal(fixture.status.configured, false);
  assert.equal(
    (await fixture.post("/api/prompt", { prompt: "hello" })).status,
    503,
  );
  assert.deepEqual(
    await (await fetch(`${fixture.url}/api/sessions`)).json(),
    [],
  );
});
test("rejects cross-origin, DNS-rebinding Host and missing CSRF tokens", async (t) => {
  const { url, headers } = await setup(t);
  for (const override of [
    { Origin: "https://example.com" },
    { "x-axonfire-csrf": "wrong" },
    { Origin: "null" },
  ]) {
    assert.equal(
      (
        await fetch(`${url}/api/cancel`, {
          method: "POST",
          headers: { ...headers, ...override },
          body: "{}",
        })
      ).status,
      403,
    );
  }
  // Node fetch normalizes Host, so use an actual raw HTTP request for rebinding.
  const rebinding = await new Promise((resolve, reject) => {
    const req = request(
      `${url}/api/status`,
      { headers: { Host: "evil.example" } },
      (res) => {
        res.resume();
        resolve(res.statusCode);
      },
    );
    req.on("error", reject);
    req.end();
  });
  assert.equal(rebinding, 403);
  assert.equal(
    (await fetch(`${url}/api/cancel`, { method: "POST", body: "{}" })).status,
    403,
  );
});
test("validates bodies, session paths, and bounds request size", async (t) => {
  const { url, headers, post } = await setup(t, { configured: true });
  assert.equal(
    (await fetch(`${url}/api/prompt`, { method: "POST", headers, body: "{" }))
      .status,
    400,
  );
  assert.equal((await post("/api/prompt", null)).status, 400);
  assert.equal(
    (await post("/api/prompt", { prompt: "x", sessionId: "../../outside" }))
      .status,
    400,
  );
  assert.equal((await fetch(`${url}/api/history?id=..%2fprivate`)).status, 400);
  assert.equal(
    (await post("/api/prompt", { prompt: "x".repeat(70_000) })).status,
    413,
  );
  assert.equal((await post("/api/prompt", { prompt: " " })).status, 400);
});
test("real SDK and recovered harness stream, persist, restore and compact through Web", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "axonfire-web-sdk-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const { url, post } = await setup(t, {
    configured: true,
    harness: {
      workDir: directory,
      modelProvider: provider((count) => answer(`reply-${count}`)),
      recordReplayEnv: {},
    },
  });
  const first = await consume(
    await post("/api/prompt", { prompt: "first input" }),
  );
  const sessionId = first.find((event) => event.type === "session").data.id;
  assert.equal(
    first.find((event) => event.type === "delta").data.text,
    "reply-1",
  );
  assert.equal(first.at(-1).type, "done");
  assert.ok(
    (await (await fetch(`${url}/api/sessions`)).json()).some(
      (session) => session.id === sessionId,
    ),
  );
  assert.match(
    JSON.stringify(
      await (await fetch(`${url}/api/history?id=${sessionId}`)).json(),
    ),
    /first input/,
  );
  const second = await consume(
    await post("/api/prompt", { sessionId, prompt: "second input" }),
  );
  assert.equal(second.at(-1).data.text, "reply-2");
  const compact = await consume(await post("/api/compact", { sessionId }));
  assert.equal(compact.at(-1).data.compacted, true);
});
for (const allow of [false, true])
  test(`real recovered Write tool requires individual Web approval: ${allow}`, async (t) => {
    const directory = await mkdtemp(join(tmpdir(), "axonfire-web-tool-"));
    t.after(() => rm(directory, { recursive: true, force: true }));
    const target = join(directory, "approved.txt");
    const { post } = await setup(t, {
      configured: true,
      harness: {
        workDir: directory,
        recordReplayEnv: {},
        modelProvider: provider((count) =>
          count === 1
            ? [
                {
                  type: "function_call",
                  id: "write-call",
                  callId: "write-call",
                  name: "Write",
                  arguments: JSON.stringify({
                    file_path: target,
                    content: "approved fixture",
                  }),
                  status: "completed",
                },
              ]
            : answer("tool settled"),
        ),
      },
    });
    let approvalId;
    const events = await consume(
      await post("/api/prompt", { prompt: "write the fixture" }),
      async (event) => {
        if (event.type !== "approval") return;
        approvalId = event.data.id;
        assert.equal(event.data.name, "Write");
        assert.equal(
          (await post("/api/approve", { id: approvalId, allow: "yes" })).status,
          400,
        );
        assert.equal(
          (await post("/api/approve", { id: approvalId, allow })).status,
          200,
        );
      },
    );
    assert.ok(approvalId);
    assert.equal(events.at(-1).type, "done");
    if (allow) assert.equal(await readFile(target, "utf8"), "approved fixture");
    else await assert.rejects(access(target));
    assert.equal(
      (await post("/api/approve", { id: approvalId, allow: true })).status,
      404,
    );
  });
test("cancels active prompt, rejects concurrency and never exposes upstream credentials", async (t) => {
  let entered;
  const started = new Promise((resolve) => {
    entered = resolve;
  });
  const { post } = await setup(t, {
    configured: true,
    createRuntime: async () => ({
      store: { get: async () => undefined, getAll: async () => [] },
      openSession: async () => ({ id: "fake-session" }),
      async prompt(_session, _prompt, { signal }) {
        entered();
        await new Promise((resolve) =>
          signal.addEventListener("abort", resolve, { once: true }),
        );
        throw new Error("Authorization: SECRET_FIXTURE_DO_NOT_RETURN");
      },
      async close() {},
    }),
  });
  const response = await post("/api/prompt", { prompt: "wait" });
  await started;
  assert.equal((await post("/api/prompt", { prompt: "overlap" })).status, 409);
  assert.equal((await post("/api/cancel", {})).status, 200);
  const events = await consume(response);
  assert.equal(events.at(-1).data.error, "Turn cancelled");
  assert.doesNotMatch(JSON.stringify(events), /SECRET_FIXTURE/);
});
test("Agent questions round-trip as string answers, including explicit skip", async (t) => {
  let received;
  const { post } = await setup(t, {
    configured: true,
    createRuntime: async (options) => ({
      store: { get: async () => undefined, getAll: async () => [] },
      openSession: async () => ({ id: "question-session" }),
      async prompt(_session, _prompt, { signal }) {
        received = await options.askUserQuestion(
          { questions: [{ question: "Which?", options: [] }] },
          { abortSignal: signal },
        );
        return "answered";
      },
      async close() {},
    }),
  });
  const events = await consume(
    await post("/api/prompt", { prompt: "question" }),
    async (event) => {
      if (event.type === "question")
        assert.equal(
          (
            await post("/api/answer", {
              id: event.data.id,
              answers: { "Which?": "selected" },
            })
          ).status,
          200,
        );
    },
  );
  assert.deepEqual(received, { "Which?": "selected" });
  assert.equal(events.at(-1).type, "done");
});

test("cancel while approval is pending never approves and expires the decision", async (t) => {
  let approved;
  const { post } = await setup(t, {
    configured: true,
    createRuntime: async (options) => ({
      store: { get: async () => undefined, getAll: async () => [] },
      openSession: async () => ({ id: "pending-session" }),
      async prompt(_session, _prompt, { signal }) {
        approved = await options.approveTool(
          "Write",
          { content: "must not run" },
          { abortSignal: signal },
        );
        signal.throwIfAborted();
      },
      async close() {},
    }),
  });
  let id;
  const events = await consume(
    await post("/api/prompt", { prompt: "pending" }),
    async (event) => {
      if (event.type === "approval") {
        id = event.data.id;
        assert.equal((await post("/api/cancel", {})).status, 200);
      }
    },
  );
  assert.equal(approved, false);
  assert.equal(events.at(-1).data.error, "Turn cancelled");
  assert.equal((await post("/api/approve", { id, allow: true })).status, 404);
});

test(
  "closing browser stream aborts its active turn",
  { timeout: 5000 },
  async (t) => {
    let started, aborted;
    const entering = new Promise((resolve) => {
      started = resolve;
    });
    const cancelling = new Promise((resolve) => {
      aborted = resolve;
    });
    const { post } = await setup(t, {
      configured: true,
      createRuntime: async () => ({
        store: { get: async () => undefined, getAll: async () => [] },
        openSession: async () => ({ id: "disconnect-session" }),
        async prompt(_session, _prompt, { signal }) {
          started();
          await new Promise((resolve) =>
            signal.addEventListener("abort", resolve, { once: true }),
          );
          aborted();
          throw new Error("aborted");
        },
        async close() {},
      }),
    });
    const response = await post("/api/prompt", { prompt: "disconnect" });
    await entering;
    await response.body.cancel();
    await cancelling;
  },
);
