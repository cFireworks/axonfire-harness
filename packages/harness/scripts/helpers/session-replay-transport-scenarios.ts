import assert from "node:assert/strict";
import type { createNativeSessionReplayTransport } from "../../src/sessions/native-session-replay-transport.js";
type Factory = typeof createNativeSessionReplayTransport;
export const sessionReplayTransportScenarios: [
  string,
  (factory: Factory) => Promise<void>,
][] = [
  [
    "gateway secret is shared by headers and environment for one parent",
    async (factory) => {
      const service = factory(),
        secret = service.getGatewaySecret();
      assert.match(secret, /^[A-Za-z0-9_-]{43}$/);
      assert.equal(service.getGatewaySecret(), secret);
      assert.deepEqual(service.gatewaySecretEnv(), {
        CODEBUDDY_GATEWAY_AUTH: "password",
        CODEBUDDY_GATEWAY_PASSWORD: secret,
        CODEBUDDY_GATEWAY_DISABLE_API_DOCS: "1",
      });
      assert.deepEqual(service.gatewaySecretHeaders(), {
        Authorization: `Bearer ${secret}`,
      });
      assert.notEqual(factory().getGatewaySecret(), secret);
    },
  ],
  [
    "request preserves encoded identity, default limit, trimmed cwd, signal and secret headers",
    async (factory) => {
      const service = factory(),
        controller = new AbortController();
      const body = JSON.stringify({
        data: { events: [], replayTiming: { serverMs: 2 }, title: "历史" },
      });
      let seen: any;
      const result = await service.requestWorkbuddySessionReplay({
        runtimeManager: { getHostEndpoint: async () => "http://owned" },
        sessionId: "a/b ?",
        cwd: " /owned folder ",
        signal: controller.signal,
        fetchFn: async (url: string, init: any) => {
          seen = { url, init };
          return new Response(body);
        },
      });
      assert.equal(
        seen.url,
        "http://owned/api/v1/sessions/a%2Fb%20%3F/replay?limit=5000&cwd=%2Fowned+folder",
      );
      assert.equal(seen.init.signal, controller.signal);
      assert.equal(seen.init.headers["X-CodeBuddy-Request"], "1");
      assert.deepEqual(seen.init.headers, {
        "X-CodeBuddy-Request": "1",
        ...service.gatewaySecretHeaders(),
      });
      assert.equal(result.replayTiming.bytes, Buffer.byteLength(body));
      assert.equal(result.replayTiming.serverMs, 2);
      assert.equal(result.title, "历史");
    },
  ],
  [
    "bare JSON and explicit limits retain original response semantics",
    async (factory) => {
      const service = factory();
      let urlSeen = "";
      const result = await service.requestWorkbuddySessionReplay({
        runtimeManager: { getHostEndpoint: async () => "http://owned" },
        sessionId: "s",
        limit: 0,
        cwd: " ",
        fetchFn: async (url: string) => {
          urlSeen = url;
          return new Response('{"events":[]}');
        },
      });
      assert.equal(urlSeen, "http://owned/api/v1/sessions/s/replay?limit=0");
      assert.deepEqual(result.events, []);
      assert.deepEqual(
        await service.parseCliJsonResponse(new Response('{"data":null}')),
        { data: null, bytes: 13 },
      );
      await assert.rejects(
        service.parseCliJsonResponse(new Response("invalid")),
        SyntaxError,
      );
    },
  ],
  [
    "HTTP failure includes body and falls back to status text when unreadable",
    async (factory) => {
      const service = factory();
      const base = {
        runtimeManager: { getHostEndpoint: async () => "http://owned" },
        sessionId: "s",
      };
      await assert.rejects(
        service.requestWorkbuddySessionReplay({
          ...base,
          fetchFn: async () => new Response("missing", { status: 404 }),
        }),
        /HTTP 404: missing/,
      );
      await assert.rejects(
        service.requestWorkbuddySessionReplay({
          ...base,
          fetchFn: async () => ({
            ok: false,
            status: 503,
            statusText: "Unavailable",
            text: async () => {
              throw Error("read failure");
            },
          }),
        }),
        /HTTP 503: Unavailable/,
      );
    },
  ],
  [
    "abort during endpoint acquisition rejects without starting fetch",
    async (factory) => {
      const service = factory(),
        controller = new AbortController();
      let release!: (value: string) => void,
        fetched = false;
      const endpoint = new Promise<string>((resolve) => {
        release = resolve;
      });
      const request = service.requestWorkbuddySessionReplay({
        runtimeManager: { getHostEndpoint: () => endpoint },
        sessionId: "s",
        signal: controller.signal,
        fetchFn: async () => {
          fetched = true;
          return new Response("{}");
        },
      });
      const reason = new Error("owned superseded");
      controller.abort(reason);
      await assert.rejects(request, (error) => error === reason);
      release("http://owned");
      await Promise.resolve();
      assert.equal(fetched, false);
    },
  ],
  [
    "endpoint errors propagate and pre-aborted requests retain endpoint invocation",
    async (factory) => {
      const service = factory(),
        controller = new AbortController();
      let calls = 0;
      controller.abort(new Error("already aborted"));
      await assert.rejects(
        service.requestWorkbuddySessionReplay({
          runtimeManager: {
            getHostEndpoint: async () => {
              calls++;
              return "http://owned";
            },
          },
          sessionId: "s",
          signal: controller.signal,
        }),
        /already aborted/,
      );
      assert.equal(calls, 1);
      await assert.rejects(
        service.requestWorkbuddySessionReplay({
          runtimeManager: {
            getHostEndpoint: async () => {
              throw Error("endpoint failure");
            },
          },
          sessionId: "s",
          signal: new AbortController().signal,
        }),
        /endpoint failure/,
      );
    },
  ],
  [
    "event projection preserves update references and filters extension envelopes from owner hydration",
    async (factory) => {
      const service = factory();
      const update = { sessionUpdate: "agent_message_chunk" },
        meta = { retained: true };
      const p = service.toScopedSessionReplayPayload({
        type: "sessionUpdate",
        sessionId: "s",
        update,
        _meta: meta,
      });
      assert.equal(p.update, update);
      assert.equal(p._meta, meta);
      assert.equal(service.isOwnerReplayHydratablePayload(p), true);
      const ext = service.toScopedSessionReplayPayload({
        type: "other",
        sessionId: "s",
        method: "owned",
      });
      assert.deepEqual(ext, {
        type: "extNotification",
        sessionId: "s",
        method: "owned",
        params: {},
      });
      assert.equal(service.isOwnerReplayHydratablePayload(ext), false);
      for (const type of [
        "questionRequest",
        "permissionRequest",
        "questionCancelled",
        "elicitationRequest",
      ])
        assert.equal(service.isOwnerReplayHydratablePayload({ type }), true);
    },
  ],
];
