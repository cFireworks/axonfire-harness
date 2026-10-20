import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "node:http";
import { mkdtemp, rm, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { BehaviorSubject } from "rxjs";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import { cloudProductFixture } from "../scripts/helpers/cloud-product-fixtures.js";
import { createNativeCloudProductHost } from "../src/config/native-cloud-product-host.js";
import { createOwnedCloudProductHttp } from "../src/config/owned-cloud-product-http.js";
import { createNativeProductHost } from "../src/config/native-product-host.js";
import { createHarness } from "../src/runtime/create-harness.js";
import { loadProductConfiguration } from "../src/config/product-config.js";
setTraceProcessors([]);
const key = "cloud_product_config_cache";
function gate() {
  let resolve!: (v?: any) => void;
  const promise = new Promise<any>((r) => (resolve = r));
  return { promise, resolve };
}
async function owned(t: any) {
  const root = await mkdtemp(join(tmpdir(), "cloud-product-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}
async function server(t: any, handler: any) {
  const s = createServer(handler);
  s.listen(0, "127.0.0.1");
  await new Promise<void>((r) => s.once("listening", r));
  t.after(async () => {
    s.closeAllConnections();
    await new Promise<void>((r) => s.close(() => r()));
  });
  return { server: s, url: "http://127.0.0.1:" + (s.address() as any).port };
}
const auth = () => ({
  currentSessionSubject: new BehaviorSubject<any>({
    account: { uid: "owned-user", nickname: "Owned" },
    auth: { accessToken: "owned-cloud-token", tokenType: "Bearer" },
  }),
});
test("native Cloud pre auth gate and userinfo projection preserve literal ApiKey and missing-auth boundaries", async () => {
  const f = cloudProductFixture();
  assert.deepEqual(await f.pre.provide(), {});
  assert.equal((await f.userinfo.provide()).userName, "Owned");
  for (const session of [
    undefined,
    { auth: {} },
    { auth: { accessToken: "x", tokenType: "ApiKey" } },
  ]) {
    f.setSession(session);
    assert.deepEqual(await f.pre.provide(), {
      mergeStrategy: "merge",
      config: { disabled: true },
    });
  }
  f.setSession({
    account: {
      uid: "u",
      nickname: "N",
      enterpriseId: "e",
      departmentFullName: "D",
    },
    auth: { accessToken: "T", tokenType: "apikey" },
  });
  assert.deepEqual(await f.pre.provide(), {});
  assert.deepEqual(await f.userinfo.provide(), {
    userId: "u",
    userName: "N",
    userNickname: "N",
    enterpriseId: "e",
    token: "T",
    enterprise: "D",
  });
  f.setSession({ account: { uid: "u" } });
  await assert.rejects(f.userinfo.provide(), TypeError);
});
test("native Cloud memory cache is user-only, returns aliases, and expires at exactly 480000ms", async () => {
  let n = 0;
  const f = cloudProductFixture(undefined, {
    get: async () => ({ data: { data: { n: ++n } } }),
  });
  const first = await f.manager.fetch("/one");
  assert.equal(await f.manager.fetch("/other-url"), first);
  assert.equal(f.calls.length, 1);
  first.changed = true;
  assert.equal((await f.manager.fetch("/one")).changed, true);
  f.advance(480000);
  assert.deepEqual(await f.manager.fetch("/two"), { n: 2 });
  assert.equal(f.calls.length, 2);
  assert.equal(f.calls[1][1].timeout, 5000);
  assert.deepEqual(f.calls[1][1].headers, { Connection: "close" });
});
test("native Cloud remote envelope and optional git repo parameters retain no-user no-cache behavior", async () => {
  const f = cloudProductFixture();
  f.setSession(undefined);
  f.manager.gitInfoCollector = {
    collect: async () => ({
      repositories: [{ url: "owned-repo-a" }, { url: "owned-repo-b" }],
    }),
  };
  await f.manager.fetch("/v3/config");
  assert.deepEqual(f.calls[0][1].params, {
    repos: ["owned-repo-a", "owned-repo-b"],
  });
  assert.equal(f.manager.memCache.size, 0);
  assert.equal(f.data.has(key), false);
  f.manager.restOperations.get = async () => ({ data: {} });
  assert.deepEqual(await f.manager.fetch("/empty"), {});
});
test("native Cloud failure returns stale memory immediately, then retries five backoffs without refresh publication", async () => {
  const f = cloudProductFixture(undefined, {
    get: async () => {
      throw Error("owned offline");
    },
  });
  f.manager.memCache.set("owned-user", {
    data: { stale: true },
    expireAt: f.now - 1,
  });
  assert.deepEqual(await f.manager.fetch("/config"), { stale: true });
  assert.equal(f.manager.retrying, true);
  await f.drain();
  assert.deepEqual(f.sleeps, [1000, 2000, 4000, 8000, 16000]);
  assert.equal(f.calls.length, 6);
  assert.equal(f.manager.retrying, false);
});
test("native Cloud disk fallback promotes LRU without expiry checks or timestamp rewrite", async () => {
  const f = cloudProductFixture(undefined, {
    get: async () => {
      throw Error("owned offline");
    },
  });
  f.data.set(key, [
    { userId: "owned-user", data: { ancient: true }, ts: 1 },
    { userId: "other", data: { other: true }, ts: 2 },
  ]);
  assert.deepEqual(await f.manager.fetch("/config"), { ancient: true });
  assert.equal(f.data.get(key).at(-1).userId, "owned-user");
  assert.equal(f.data.get(key).at(-1).ts, 1);
  assert.deepEqual(f.manager.configuration, { ancient: true });
  await f.drain();
});
test("native Cloud cache retains max20 entries and reset leaves durable cache and running retry intact", async () => {
  const f = cloudProductFixture(undefined, {
    get: async () => {
      throw Error("owned offline");
    },
  });
  for (let i = 0; i < 23; i++) await f.manager.updateDiskCache("u" + i, { i });
  assert.equal(f.data.get(key).length, 20);
  assert.equal(f.data.get(key)[0].userId, "u3");
  await f.manager.fetch("/config");
  f.manager.updateMemCache("other", { owned: true });
  f.manager.reset("owned-user");
  assert.equal(f.manager.memCache.has("other"), true);
  assert.equal(f.manager.configuration, undefined);
  assert.equal(f.manager.retrying, false);
  assert.ok(f.timers.size);
  assert.equal(f.data.get(key).length, 20);
  await f.drain();
});
test("native Cloud global retry gate suppresses another user and success warms cache without calling product sync", async () => {
  let calls = 0;
  const f = cloudProductFixture(undefined, {
    get: async () => {
      if (++calls === 1) throw Error("owned first failure");
      return { data: { data: { ready: true } } };
    },
  });
  await f.manager.fetch("/config");
  const skipped = f.manager.fetchWithRetry("/other", "other-user");
  await skipped;
  assert.equal(f.sleeps.length, 1);
  await f.drain();
  assert.equal(f.calls.length, 2);
  assert.deepEqual(f.manager.memCache.get("owned-user").data, { ready: true });
  assert.equal(f.manager.memCache.has("other-user"), false);
});
test("native Cloud repeated failure log throttles 60000ms and retains Axios request-id lookup", async () => {
  const error = Object.assign(Error("owned offline"), {
      isAxiosError: true,
      response: {
        status: 503,
        config: { headers: { "X-Request-ID": "owned-request" } },
      },
    }),
    f = cloudProductFixture(undefined, {
      get: async () => {
        throw error;
      },
    });
  for (let i = 0; i < 3; i++) {
    await f.manager.fetch("/config");
    await f.drain();
  }
  const errors = f.logs.filter(
    (e) => e[0] === "error" && String(e[1]).includes("after all retries"),
  );
  assert.equal(errors.length, 2);
  assert.equal(errors[0][2], "owned-request");
});
test("native Cloud provider strips remote endpoint in-place but only shallow-omits deploymentType", async () => {
  const config: any = {
    endpoint: "owned-remote",
    stagingEndpoint: "owned-staging",
    deploymentType: "remote",
    productFeatures: { CommandsSmartMerge: true },
  };
  const f = cloudProductFixture();
  f.provider.cloudProductManager = { fetch: async () => config };
  const result = await f.provider.provide({
    current: { config: { url: "/owned" } },
  });
  assert.equal(result.endpoint, undefined);
  assert.equal(config.endpoint, undefined);
  assert.equal(config.deploymentType, "remote");
  assert.equal(result.deploymentType, undefined);
  assert.equal(result.mergeStrategy, "commandsSmartMerge");
  assert.equal(f.provider.getCachedMergeStrategy(), "commandsSmartMerge");
});
test("native Cloud disabled/env gate, cached strategy and path default use exact source decisions", async () => {
  for (const value of ["1", "true", "TRUE", "0"]) {
    const f = cloudProductFixture(undefined, {
      env: { CODEBUDDY_REMOTE_CONFIG_DISABLED: value },
    });
    let path: any;
    f.provider.cloudProductManager = {
      fetch: async (p: any) => {
        path = p;
        return {};
      },
    };
    await f.provider.provide({ current: {} });
    assert.equal(
      path,
      value === "1" || value === "true" ? undefined : "/v3/config",
    );
  }
  const f = cloudProductFixture();
  await f.provider.provide({ current: { config: { disabled: "false" } } });
  assert.equal(f.calls.length, 0);
  f.provider.cachedMergeStrategy = "commandsSmartMerge";
  await f.provider.provide({ current: { config: { disabled: true } } });
  assert.equal(f.provider.getCachedMergeStrategy(), "commandsSmartMerge");
});
test("native Cloud agent smart merge preserves base fields except explicit remote models; model list is remote-authoritative", async () => {
  const f = cloudProductFixture(),
    base = [
      {
        name: "cli",
        instructions: "base",
        models: ["base-model"],
        nested: { a: 1 },
      },
    ],
    remote = [
      { name: "cli", instructions: "ignored", models: ["remote-model"] },
      { name: "new", instructions: "new" },
    ];
  assert.deepEqual(f.provider.smartMergeAgents(base, remote), [
    {
      name: "cli",
      instructions: "base",
      models: ["remote-model"],
      nested: { a: 1 },
    },
    { name: "new", instructions: "new" },
  ]);
  assert.equal(base[0]!.models[0], "base-model");
  assert.deepEqual(
    f.provider.mergeModelsById(
      [{ id: "a", label: "base", endpoint: "own" }, { id: "dropped" }],
      [{ id: "a", label: "remote" }, null, { name: "no-id" }],
    ),
    [{ id: "a", label: "remote", endpoint: "own" }, null, { name: "no-id" }],
  );
});
test("native Cloud malformed backing cache rejects and primitive final retry errors remain source TypeError", async () => {
  const f = cloudProductFixture(undefined, {
    get: async () => {
      throw Error("owned offline");
    },
  });
  f.data.set(key, {});
  await assert.rejects(f.manager.fetch("/config"), /findIndex/);
  await f.drain();
  const bad = cloudProductFixture(undefined, {
      get: async () => {
        throw "primitive-owned-error";
      },
    }),
    job = bad.manager.fetchWithRetry("/config", "u");
  const rejected = assert.rejects(job, TypeError);
  await bad.drain();
  await rejected;
  assert.equal(bad.manager.retrying, false);
});
test("native Cloud briefError and safeStringify keep length503, nullable fields and cycle behavior", () => {
  const f = cloudProductFixture();
  assert.equal(f.manager.briefError(null), "null");
  assert.equal(f.manager.briefError({ message: "x".repeat(600) }).length, 503);
  assert.equal(
    f.manager.briefError({
      message: "owned",
      response: { status: 403 },
      config: { url: "/owned" },
      code: "E",
    }),
    "owned, status=403, url=/owned, code=E",
  );
  const cyclic: any = {};
  cyclic.self = cyclic;
  assert.equal(f.manager.safeStringify(cyclic), "[object Object]");
  assert.equal(f.manager.safeStringify(undefined), undefined);
});
test("native Cloud provider constructor names and priorities match captured anonymous classes", () => {
  const f = cloudProductFixture();
  assert.equal(f.provider.constructor.name, "eE");
  assert.equal(f.manager.constructor.name, "e_");
  assert.equal(f.pre.constructor.name, "tG");
  assert.equal(f.userinfo.constructor.name, "e0");
  assert.equal(f.provider.priority, 10000);
  assert.equal(f.pre.priority, 9999);
});
test("owned Cloud HTTP uses explicit origin, nested JSON envelope, bracket repo params and per-call headers", async (t) => {
  const seen: any[] = [],
    s = await server(t, (req: any, res: any) => {
      seen.push({ url: req.url, headers: req.headers });
      res.setHeader("Content-Type", "application/json");
      res.end('{"data":{"owned":true}}');
    });
  const h = createOwnedCloudProductHttp({
    baseURL: s.url + "/prefix",
    headers: () => ({ Authorization: "Bearer owned-cloud-token" }),
  });
  try {
    const response = await h.get("/v3/config", {
      params: { repos: ["repo/a", "repo b"] },
      headers: { Connection: "close" },
    });
    assert.deepEqual(response.data, { data: { owned: true } });
    const url = new URL(seen[0].url, s.url);
    assert.equal(url.pathname, "/prefix/v3/config");
    assert.deepEqual(url.searchParams.getAll("repos[]"), ["repo/a", "repo b"]);
    assert.equal(seen[0].headers.authorization, "Bearer owned-cloud-token");
    await assert.rejects(
      h.get("http://127.0.0.1:1/other"),
      /outside explicit origin/,
    );
  } finally {
    await h.close();
  }
  assert.equal(h.ownedHandleCount, 0);
});
test("owned Cloud HTTP never follows redirect and closes pending body on abort", async (t) => {
  const entered = gate(),
    s = await server(t, (req: any, res: any) => {
      if (req.url === "/redirect") {
        res.writeHead(302, { Location: "http://127.0.0.1:1/not-owned" });
        res.end();
        return;
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.write("{");
      entered.resolve();
    });
  const h = createOwnedCloudProductHttp({ baseURL: s.url });
  await assert.rejects(h.get("/redirect"), /HTTP 302/);
  const pending = h.get("/pending"),
    rejected = assert.rejects(pending, /closed|aborted/);
  await entered.promise;
  await h.close();
  await rejected;
  assert.equal(h.pendingCount, 0);
  assert.equal(h.ownedHandleCount, 0);
});
test("owned Cloud HTTP timeout covers body and cleans its 5000ms timer", async (t) => {
  const entered = gate(),
    timers = new Map<any, () => void>(),
    delays: number[] = [],
    s = await server(t, (_req: any, res: any) => {
      res.writeHead(200);
      res.write("{");
      entered.resolve();
    });
  const h = createOwnedCloudProductHttp({
    baseURL: s.url,
    setTimeout(fn, ms) {
      const id = {};
      delays.push(ms);
      timers.set(id, fn);
      return id;
    },
    clearTimeout(id) {
      timers.delete(id);
    },
  });
  const pending = h.get("/slow", { timeout: 5000 }),
    rejected = assert.rejects(pending, /timed out/);
  await entered.promise;
  assert.deepEqual(delays, [5000]);
  for (const fn of [...timers.values()]) fn();
  await rejected;
  await h.close();
  assert.equal(timers.size, 0);
  assert.equal(h.ownedHandleCount, 0);
});
test("owned Cloud host closes sleeping native retry without waiting 31 seconds and no post-close network", async () => {
  let calls = 0;
  const h = createNativeCloudProductHost({
    productManager: { getEndpoint: () => "/owned" },
    storage: { get: async (_k: any, d: any) => d, set: async () => {} },
    logger: {},
    authenticationManager: auth(),
    configuration: {
      restOperations: {
        async get() {
          calls++;
          throw Error("owned offline");
        },
      },
    },
  });
  h.start();
  assert.deepEqual(await h.manager.fetch("/config"), {});
  assert.equal(h.manager.retrying, true);
  assert.ok(h.ownedHandleCount);
  await h.close();
  assert.equal(calls, 1);
  assert.equal(h.pendingCount, 0);
  assert.equal(h.ownedHandleCount, 0);
  await assert.rejects(h.manager.fetch("/config"), /closed/);
});
test("owned Cloud host rejects late adapter result after close and does not populate cache", async () => {
  const pending = gate(),
    entered = gate(),
    h = createNativeCloudProductHost({
      productManager: { getEndpoint: () => "/owned" },
      storage: { get: async (_k: any, d: any) => d, set: async () => {} },
      logger: {},
      authenticationManager: auth(),
      configuration: {
        restOperations: {
          async get() {
            entered.resolve();
            return pending.promise;
          },
        },
      },
    });
  const request = h.manager.fetch("/config"),
    rejected = assert.rejects(request, /closed/);
  await entered.promise;
  const closing = h.close();
  pending.resolve({ data: { data: { late: true } } });
  await closing;
  await rejected;
  assert.equal(h.manager.memCache.size, 0);
  assert.equal(h.pendingCount, 0);
});
test("default product host wires native Cloud classes but anonymous auth never issues REST requests", async (t) => {
  const root = await owned(t);
  let requests = 0;
  const h = createNativeProductHost({
    initialConfiguration: {
      endpoint: "http://owned.invalid",
      config: { url: "/v3/config" },
      agents: [],
      tools: [],
      models: [],
      prompts: [],
    },
    getWorkDir: () => root,
    getHomeDir: () => root,
    watch: false,
    cloud: {
      restOperations: {
        async get() {
          requests++;
          throw Error("must not be called");
        },
      },
    },
  });
  try {
    await h.start();
    assert.equal(h.cloudHost!.pre.priority, 9999);
    assert.equal(requests, 0);
    assert.equal(h.facade.getCurrentConfiguration().config.disabled, true);
  } finally {
    await h.close();
  }
  assert.equal(h.cloudHost!.ownedHandleCount, 0);
});
test("native Cloud cache protocol can persist across restart through an explicit owned storage adapter", async (t) => {
  const root = await owned(t),
    file = join(root, "cache.json"),
    storage = {
      async get(_k: any, d: any) {
        try {
          return JSON.parse(await readFile(file, "utf8"));
        } catch {
          return d;
        }
      },
      async set(_k: any, v: any) {
        await writeFile(file, JSON.stringify(v));
      },
    };
  const first = createNativeCloudProductHost({
    productManager: { getEndpoint: () => "/owned" },
    storage,
    logger: {},
    authenticationManager: auth(),
    configuration: {
      restOperations: {
        async get() {
          return { data: { data: { persisted: true } } };
        },
      },
    },
  });
  await first.manager.fetch("/owned");
  await first.flush();
  await first.close();
  const second = createNativeCloudProductHost({
    productManager: { getEndpoint: () => "/owned" },
    storage,
    logger: {},
    authenticationManager: auth(),
    configuration: {
      restOperations: {
        async get() {
          throw Error("owned offline");
        },
      },
    },
  });
  try {
    assert.deepEqual(await second.manager.fetch("/owned"), { persisted: true });
  } finally {
    await second.close();
  }
});
function model(requests: any[]): Model {
  return {
    async getResponse() {
      return { output: [], usage: new Usage() };
    },
    async *getStreamedResponse(request) {
      requests.push(request);
      yield { type: "response_started" } as any;
      yield {
        type: "response_done",
        response: {
          id: "cloud",
          usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
          output: [
            {
              type: "message",
              role: "assistant",
              id: "m",
              status: "completed",
              content: [{ type: "output_text", text: "cloud-ok" }],
            },
          ],
        },
      } as any;
    },
  };
}
test("real SDK receives native Cloud agent/model updates after explicit sync and never receives cloud auth token", async (t) => {
  const root = await owned(t),
    requests: any[] = [],
    cloudRequests: any[] = [],
    authentication = auth();
  let revision = 1;
  const captured = await loadProductConfiguration();
  const s = await server(t, (req: any, res: any) => {
    cloudRequests.push(req.url);
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        data: {
          endpoint: "must-be-stripped",
          deploymentType: "must-be-omitted",
          agents: [
            {
              name: "cloud-owned",
              tags: ["cli"],
              description: "owned Cloud agent",
              instructions: "owned Cloud revision " + revision,
              models: ["cloud-model"],
            },
          ],
          models: [
            ...captured.raw.models,
            {
              ...captured.raw.models[0],
              id: "cloud-model",
              name: "cloud-model",
              label: "Owned Cloud model",
              config: { temperature: 0.2 },
            },
          ],
        },
      }),
    );
  });
  const h = await createHarness({
    workDir: root,
    stateDir: join(root, "state"),
    recordReplayEnv: {},
    modelProvider: { getModel: () => model(requests) },
    productRuntime: {
      watch: false,
      cloud: {
        authenticationManager: authentication,
        transport: {
          baseURL: s.url,
          headers: { Authorization: "Bearer owned-cloud-token" },
        },
      },
      providers: [
        {
          priority: 6000,
          async provide() {
            return { endpoint: s.url, config: { url: s.url + "/v3/config" } };
          },
        },
      ],
    },
  });
  try {
    assert.ok(await h.agents.get("cloud-owned"));
    const session = await h.openSession();
    session.agentName = "cloud-owned";
    assert.equal(await h.prompt(session, "owned"), "cloud-ok");
    assert.match(requests.at(-1).systemInstructions, /revision 1/);
    assert.doesNotMatch(JSON.stringify(requests), /owned-cloud-token/);
    revision = 2;
    h.productRuntime!.cloudHost!.manager.reset("owned-user");
    await h.productManager.sync(true);
    await h.agents.waitForRebuildSettled(0);
    assert.equal(await h.prompt(session, "owned again"), "cloud-ok");
    assert.match(requests.at(-1).systemInstructions, /revision 2/);
    assert.equal(cloudRequests.length, 2);
    assert.equal(h.product.raw.endpoint, s.url);
  } finally {
    await h.close();
  }
  assert.equal(h.productRuntime!.cloudHost!.ownedHandleCount, 0);
});
