import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createServer, type RequestListener } from "node:http";
import { getEventListeners } from "node:events";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import {
  WebFetchTool,
  webFetchParameters,
} from "../src/tools/web-fetch-tool.js";
import {
  WebSearchTool,
  webSearchParameters,
} from "../src/tools/web-search-tool.js";
import {
  createWebToolRuntime,
  cleanHtml,
  isPrivateHost,
  isPrivateIP,
  matchDomainPattern,
  WEB_FETCH_CACHE_TTL_MS,
} from "../src/tools/web-tool-runtime.js";
import { IOA_DEFAULT_STAGING_DOMAIN } from "../src/models/ioa-utils.js";
import { HarnessSession } from "../src/sessions/session.js";
import { createHarness } from "../src/runtime/create-harness.js";
import {
  readManagedSecurityPolicyFromEnv,
  loadWebNetworkConfig,
} from "../src/permissions/managed-security-policy.js";
setTraceProcessors([]);
async function directory(t: { after(fn: () => any): void }) {
  const root = await mkdtemp(join(tmpdir(), "harness-web-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  WebFetchTool.cache.clear();
  t.after(() => WebFetchTool.cache.clear());
  return root;
}
async function server(
  t: { after(fn: () => any): void },
  handler: RequestListener,
) {
  const value = createServer(handler as any);
  await new Promise<void>((resolve) => value.listen(0, "127.0.0.1", resolve));
  t.after(
    () =>
      new Promise<void>((resolve, reject) => {
        value.closeAllConnections();
        value.close((error) => (error ? reject(error) : resolve()));
      }),
  );
  return `http://127.0.0.1:${(value.address() as any).port}`;
}
const final = (text: string) => [
  {
    type: "message",
    id: "message",
    role: "assistant",
    status: "completed",
    content: [{ type: "output_text", text }],
  },
];
const call = (name: string, args: any) => [
  {
    type: "function_call",
    id: "call",
    callId: "call",
    name,
    status: "completed",
    arguments: JSON.stringify(args),
  },
];
function modelFixture(
  requests: any[],
  response: (request: any, count: number) => any[],
): Model {
  let count = 0;
  return {
    async getResponse() {
      return { usage: new Usage(), output: [] };
    },
    async *getStreamedResponse(request) {
      requests.push(request);
      yield { type: "response_started" };
      const output = response(request, ++count);
      for (const item of output)
        if (item.type === "message")
          for (const part of item.content)
            if (part.type === "output_text")
              yield { type: "output_text_delta", delta: part.text };
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
test("web schemas preserve unknown-key acceptance, whitespace/query quirks and exact freshness boundaries", () => {
  assert.equal(
    webFetchParameters.safeParse({ url: "", prompt: "", extra: true }).success,
    true,
  );
  const fetch = new WebFetchTool(),
    search = new WebSearchTool();
  assert.equal(
    fetch.validateParams({ url: " ", prompt: "x" }),
    "The 'url' parameter cannot be empty.",
  );
  assert.equal(
    search.validateParams({ query: "  " }),
    "The 'query' parameter cannot be empty.",
  );
  assert.equal(search.toAutoClassifierInput({ query: 4 }), "");
  assert.equal(
    fetch.toAutoClassifierInput({ url: "url", prompt: "prompt" }),
    "url: prompt",
  );
  assert.deepEqual(fetch.resolveNeedPermissionArgs({}, { url: "url" }), [
    { type: "url", value: "url" },
  ]);
  assert.deepEqual(search.aliases, ["read"]);
  for (const freshness of ["d", "d1", "d30", "m", "m12", "y", "y5"])
    assert.equal(
      webSearchParameters.safeParse({ query: "ab", freshness }).success,
      true,
    );
  for (const freshness of ["d0", "d31", "m13", "y6", "D1", "d01", "d1 "])
    assert.equal(
      webSearchParameters.safeParse({ query: "ab", freshness }).success,
      false,
    );
});
test("network policy preserves early gates, host-only checks, wildcard rules and source IPv6 gaps", async () => {
  let config: any = {
      network: {
        denyAll: true,
        allowedDomains: ["*.example.com"],
        deniedDomains: ["example.com"],
      },
    },
    clears = 0;
  const tool = new WebFetchTool(
    createWebToolRuntime({
      networkConfig: async () => config,
      clearSettingsCache: () => {
        clears++;
      },
    }),
  );
  assert.deepEqual(await tool.checkNetworkPolicy("https://EXAMPLE.com"), {
    allowed: true,
  });
  assert.equal(
    (await tool.checkNetworkPolicy("https://else.test")).reason,
    "network denyAll is enabled",
  );
  config = { network: { deniedDomains: ["*.example.com"] } };
  assert.equal(
    (await tool.checkNetworkPolicy("https://a.example.com")).allowed,
    false,
  );
  assert.equal(
    (await tool.checkNetworkPolicy("https://127.0.0.1")).allowed,
    false,
  );
  assert.equal((await tool.checkNetworkPolicy("https://[::1]")).allowed, true);
  assert.equal(
    (await tool.checkNetworkPolicy("https://dns-that-might-be-private.test"))
      .allowed,
    true,
  );
  config = { networkPolicyEnabled: false };
  assert.equal(
    (await tool.checkNetworkPolicy("ftp://localhost")).allowed,
    true,
  );
  config = {};
  assert.equal((await tool.checkNetworkPolicy("not a URL")).allowed, true);
  assert.ok(clears > 5);
  assert.equal(isPrivateHost("[::1]"), false);
  assert.equal(isPrivateIP("::ffff:127.0.0.1"), false);
  assert.equal(isPrivateIP("100.64.0.1"), false);
  assert.equal(matchDomainPattern("a.example.com", "*.example.com"), true);
});
test("network policy runs before cache, and cache ignores prompt/auth with native 15-minute strict-expiry gate", async (t) => {
  await directory(t);
  let allowed = true,
    fetches = 0;
  const runtime = createWebToolRuntime({
      networkConfig: async () => ({
        network: { deniedDomains: allowed ? [] : ["example.test"] },
      }),
    }),
    tool = new WebFetchTool(runtime);
  tool.fetchWithFallback = async () => {
    fetches++;
    return {
      content: "answer for first prompt",
      needsSummary: false,
      source: "api",
    };
  };
  assert.equal(
    (
      await tool.execute(
        { url: "http://example.test/path", prompt: "first" },
        { context: {} },
      )
    ).content,
    "answer for first prompt",
  );
  assert.equal(
    (
      await new WebFetchTool(runtime).execute(
        { url: "https://example.test/path", prompt: "other" },
        { context: {} },
      )
    ).content,
    "answer for first prompt",
  );
  assert.equal(fetches, 1);
  allowed = false;
  await assert.rejects(
    tool.execute(
      { url: "https://example.test/path", prompt: "other" },
      { context: {} },
    ),
    /blocked by security center/,
  );
  WebFetchTool.cache.get("https://example.test/path").timestamp -=
    WEB_FETCH_CACHE_TTL_MS + 1;
  assert.equal(tool.getCachedEntry("https://example.test/path"), undefined);
  assert.equal(
    tool.normalizeUrl("https://host/github.com/blob/main/x"),
    "https://host/raw.githubusercontent.com/main/x",
  );
});
test("local HTML conversion uses native Turndown 7.2.1/atx, strips scripts and preserves date/author text", async () => {
  const html =
    "<h1>Heading</h1><p>Author: Alice — 2026-10-20</p><script>secret()</script><style>hidden</style><noscript>hidden</noscript><textarea style='display:none'>hidden</textarea><p>Body <strong>bold</strong>.</p>";
  assert.doesNotMatch(cleanHtml(html), /secret|hidden/);
  const tool = new WebFetchTool(createWebToolRuntime());
  tool.fetchWithTimeout = async () =>
    new Response(html, { headers: { "content-type": "text/html" } });
  const result = await tool.fetchAndProcessLocally("https://example.test");
  assert.match(result, /^# Heading/);
  assert.match(result, /Alice — 2026-10-20/);
  assert.match(result, /\*\*bold\*\*/);
  assert.doesNotMatch(result, /secret|hidden/);
});
test("local fetch retains non-2xx body, cross-host redirect-after-fetch error, 100k truncation and metadata fallback", async () => {
  const tool = new WebFetchTool(
    createWebToolRuntime({
      getTurndownService: async () => ({ turndown: () => "" }),
    }),
  );
  tool.fetchWithTimeout = async () =>
    new Response("error page", { status: 503 });
  assert.equal(
    await tool.fetchAndProcessLocally("https://example.test"),
    "error page",
  );
  tool.fetchWithTimeout = async () => ({
    redirected: true,
    url: "https://different.test/x",
  });
  await assert.rejects(
    tool.fetchAndProcessLocally("https://example.test"),
    /redirected to different host/,
  );
  tool.fetchWithTimeout = async () => new Response("x".repeat(100001));
  assert.equal(
    (await tool.fetchAndProcessLocally("https://example.test")).length,
    100000,
  );
  tool.fetchWithTimeout = async () =>
    new Response(
      "<meta name='description' content='description'><title> title </title>",
      { headers: { "content-type": "text/html" } },
    );
  assert.equal(
    await tool.fetchAndProcessLocally("https://example.test"),
    "Title: title\n\nDescription: description",
  );
  tool.fetchWithTimeout = async () =>
    new Response(" ", { status: 500, statusText: "Broken" });
  await assert.rejects(
    tool.fetchAndProcessLocally("https://example.test"),
    /500 Broken and empty response body/,
  );
});
test("API/local race waits for API even when local is ready, cancels loser, and local-only always summarizes", async () => {
  const tool = new WebFetchTool(
    createWebToolRuntime({ configuration: async () => ({}) }),
  );
  let finish!: (value: string) => void,
    localAborted = false,
    completed = false;
  tool.fetchContentViaApi = () =>
    new Promise((resolve) => {
      finish = resolve;
    });
  tool.fetchAndProcessLocally = async (_url, signal) => {
    signal.addEventListener("abort", () => {
      localAborted = true;
    });
    return "ready local";
  };
  const pending = tool.fetchWithFallback("https://example.test", "prompt", {});
  void pending.then(() => {
    completed = true;
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(completed, false);
  finish("short API");
  assert.equal((await pending).source, "api");
  assert.equal(localAborted, true);
  tool.fetchContentViaApi = async () => {
    throw new Error("API failed");
  };
  assert.equal(
    (await tool.fetchWithFallback("https://example.test", "prompt", {}))
      .needsSummary,
    true,
  );
  tool.runtime.env = { CODEBUDDY_DISABLE_WEB_FETCH_REMOTE_API: "true" };
  tool.fetchAndProcessLocally = async () => "short local";
  const local = await tool.fetchWithFallback("url", "prompt", {});
  assert.equal(local.needsSummary, true);
  assert.equal(
    local.apiErrorReason,
    "Remote API disabled via env or product feature",
  );
});
test("AI/template fallback prompts are exact/native and telemetry keeps only safe URL parts plus truncated reasons", async () => {
  const logs: any[] = [],
    tool = new WebFetchTool(
      createWebToolRuntime({
        renderPrompt: async () => {
          throw new Error("render");
        },
        analyze: async () => {
          throw new Error("model");
        },
        telemetry: {
          isReady: () => true,
          logInfo: (...args) => logs.push(args),
          logError: (...args) => logs.push(args),
        },
      }),
    );
  assert.match(
    await tool.createAnalysisPrompt("content", "prompt"),
    /CONTENT SAFETY \(HIGHEST PRIORITY\)/,
  );
  assert.equal(
    await tool.processContentWithAI("content", "prompt"),
    tool.createFallbackResponse("content", "prompt"),
  );
  tool.reportTelemetry({
    status: "failed",
    url: "https://example.test/path?secret=1#fragment",
    errorReason: "x".repeat(300),
    outcome: {
      apiStatus: "failed",
      apiErrorReason: "y".repeat(300),
      localDurationMs: 0,
    },
  });
  assert.equal(logs[0][0], "webfetch.failed");
  assert.equal(logs[0][1].urlPath, "/path");
  assert.equal(logs[0][1].errorReason.length, 257);
  assert.equal(logs[0][1].localDurationMs, 0);
  assert.doesNotMatch(JSON.stringify(logs), /secret|fragment/);
});
test("local timeout/abort messages and API original abort reason/listener behavior match native paths", async () => {
  const runtime = createWebToolRuntime({
      configuration: async () => ({ endpoint: "https://service.test" }),
      authentication: () => ({ auth: { accessToken: "fixture" } }),
      fetch: async (_url, options) =>
        new Promise((_resolve, reject) => {
          const signal = options!.signal!;
          if (signal.aborted) reject(new DOMException("aborted", "AbortError"));
          else
            signal.addEventListener(
              "abort",
              () => reject(new DOMException("aborted", "AbortError")),
              { once: true },
            );
        }),
    }),
    tool = new WebFetchTool(runtime);
  await assert.rejects(
    tool.fetchWithTimeout("https://example.test", 5),
    /Request timed out after 5ms/,
  );
  const controller = new AbortController();
  controller.abort(new Error("original reason"));
  await assert.rejects(
    tool.fetchWithTimeout("https://example.test", 50, controller.signal),
    /Request aborted/,
  );
  await assert.rejects(
    tool.fetchContentViaApi("url", "prompt", { id: "s" }, controller.signal),
    /original reason/,
  );
  const active = new AbortController();
  tool.runtime.fetch = async () => Response.json({ content: "answer" });
  await tool.fetchContentViaApi("url", "prompt", { id: "s" }, active.signal);
  assert.equal(getEventListeners(active.signal, "abort").length, 1);
});
test("WebSearch body/header/IOA construction and result projection retain original defaults", async () => {
  const calls: any[] = [],
    runtime = createWebToolRuntime({
      configuration: async () => ({
        endpoint: "https://service.test/",
        deploymentType: "deployment",
      }),
      authentication: () => ({
        auth: { accessToken: "web-only" },
        account: {
          type: " Personal ",
          uid: "uid",
          departmentFullName: "department",
        },
      }),
      settings: {
        get: async (key) =>
          key === "env" ? { CODEBUDDY_INTERNET_ENVIRONMENT: "ioa" } : "staging",
      },
      uuid: () => "ab-cd",
      fetch: async (url, options) => {
        calls.push({ url, options });
        return Response.json({
          results: [
            {},
            {
              title: "Title",
              url: "url",
              snippet: "snippet",
              site: "site",
              favicon: "icon",
              hidden: "omit",
            },
          ],
        });
      },
    }),
    tool = new WebSearchTool(runtime),
    session = new HarnessSession("session");
  session.meta["codebuddy.ai/mode"] = "plan";
  const result = await tool.execute(
    {
      query: "query",
      allowed_domains: ["allowed.test"],
      blocked_domains: ["a.test", "b.test"],
      freshness: "m2",
    },
    { context: session },
  );
  assert.equal(calls[0].url, "https://service.test//agenttool/v1/search");
  assert.deepEqual(JSON.parse(calls[0].options.body), {
    query: "query (-site:a.test -site:b.test)",
    type: "text2text",
    max_results: 5,
    allowed_domains: ["allowed.test"],
    freshness: "m2",
  });
  const headers = calls[0].options.headers;
  assert.equal(headers.Authorization, "Bearer web-only");
  assert.equal(headers["X-Agent-Intent"], "plan");
  assert.equal(headers["X-Domain"], IOA_DEFAULT_STAGING_DOMAIN);
  assert.equal(headers["X-Enterprise-Id"], undefined);
  assert.equal(headers["X-Request-ID"], "abcd");
  assert.equal(result.rawResponse.results[0].title, "Untitled");
  assert.equal(result.rawResponse.results[1].hidden, undefined);
  assert.match(result.title, /Found 2 results/);
});
test("WebSearch timeout ignores parent cancellation and errors preserve native request-id text", async () => {
  const parent = new HarnessSession("parent");
  parent.abortController.abort();
  let aborted = true;
  const tool = new WebSearchTool(
    createWebToolRuntime({
      configuration: async () => ({ endpoint: "https://service.test" }),
      authentication: () => ({ auth: { accessToken: "fixture" } }),
      uuid: () => "request-id",
      fetch: async (_url, options) => {
        aborted = !!options?.signal?.aborted;
        return Response.json({ code: 1, msg: "blocked" });
      },
    }),
  );
  await assert.rejects(
    tool.execute({ query: "query" }, { context: parent }),
    /Error: Error during web search.*blocked \(requestId: requestid\)/,
  );
  assert.equal(aborted, false);
  tool.WEB_SEARCH_TIMEOUT_MS = 5;
  tool.runtime.fetch = async (_url, options) =>
    new Promise((_resolve, reject) =>
      options?.signal?.addEventListener("abort", () =>
        reject(new DOMException("abort", "AbortError")),
      ),
    );
  await assert.rejects(
    tool.performWebSearch({ query: "query" }, parent),
    /timed out after 0.005s/,
  );
});
test("real SDK default WebSearch calls an explicit local product-service endpoint and keeps structured tool result", async (t) => {
  const root = await directory(t),
    received: any[] = [],
    endpoint = await server(t, async (req: any, res: any) => {
      let body = "";
      for await (const chunk of req) body += chunk;
      received.push({
        url: req.url,
        headers: req.headers,
        body: JSON.parse(body),
      });
      res.setHeader("content-type", "application/json");
      res.end(
        JSON.stringify({
          provider: "fixture",
          results: [
            { title: "Result", url: "https://result.test", snippet: "Snippet" },
          ],
          total_results: 1,
          response_time_ms: 2,
        }),
      );
    }),
    requests: any[] = [],
    model = modelFixture(requests, (_req, count) =>
      count === 1
        ? call("WebSearch", { query: "query", freshness: "d1" })
        : final("searched"),
    ),
    harness = await createHarness({
      workDir: root,
      modelProvider: { getModel: () => model },
      apiKey: "model-key-must-not-be-used",
      approveTool: () => true,
      webTools: { endpoint, accessToken: "web-only-token" },
    });
  t.after(() => harness.close());
  const session = await harness.openSession();
  assert.equal(await harness.prompt(session, "search fixture"), "searched");
  assert.equal(received.length, 1);
  assert.equal(received[0].url, "/agenttool/v1/search");
  assert.equal(received[0].headers.authorization, "Bearer web-only-token");
  assert.equal(received[0].body.max_results, 5);
  assert.match(JSON.stringify(session.history), /web_search_tool_result/);
  assert.match(JSON.stringify(requests[1].input), /Snippet/);
  assert.ok(harness.product.defaultAgent.tools!.includes("WebSearch"));
  assert.equal((harness.tools as any).handlers.size, 47);
});
test("real SDK WebFetch local HTML enters separate contentAnalyzer turn and returns summary to parent", async (t) => {
  const root = await directory(t),
    endpoint = await server(t, (_req: any, res: any) => {
      res.setHeader("content-type", "text/html");
      res.end(
        "<h1>Fixture Article</h1><p>Author Alice, published 2026-10-20.</p><script>hidden()</script><p>Useful body.</p>",
      );
    }),
    requests: any[] = [],
    model = modelFixture(requests, (_req, count) =>
      count === 1
        ? call("WebFetch", {
            url: "https://article.test/page",
            prompt: "Summarize with attribution",
          })
        : final(count === 2 ? "analyzed article with date" : "fetched"),
    ),
    harness = await createHarness({
      workDir: root,
      modelProvider: { getModel: () => model },
      approveTool: () => true,
      webTools: {
        env: { CODEBUDDY_DISABLE_WEB_FETCH_REMOTE_API: "true" },
        fetch: (_url, options) => fetch(endpoint + "/page", options),
      },
    });
  t.after(() => harness.close());
  const session = await harness.openSession();
  assert.equal(await harness.prompt(session, "fetch fixture"), "fetched");
  assert.equal(requests.length, 3);
  assert.match(JSON.stringify(requests[1].input), /Fixture Article/);
  assert.match(
    JSON.stringify(requests[1].input),
    /Alice, published 2026-10-20/,
  );
  assert.doesNotMatch(JSON.stringify(requests[1].input), /hidden\(\)/);
  assert.match(JSON.stringify(requests[2].input), /analyzed article with date/);
  assert.equal(
    session.history.filter((item: any) => item.role === "user").length,
    1,
  );
  assert.ok(harness.sessions.getCachedSessions().length >= 2);
});
test("standalone web credentials are not inferred from model key; default permission denies before any fetch", async (t) => {
  const root = await directory(t);
  let calls = 0;
  const h = await createHarness({
    workDir: root,
    apiKey: "model-key",
    modelProvider: {
      getModel() {
        throw new Error("not used");
      },
    },
    webTools: {
      fetch: async () => {
        calls++;
        throw new Error("must not fetch");
      },
    },
  });
  t.after(() => h.close());
  const session = await h.openSession();
  await assert.rejects(
    Promise.resolve(
      (await h.tools.get("WebFetch"))!.execute(
        { url: "https://example.test", prompt: "prompt" },
        { context: session },
      ),
    ),
    /Tool permission denied/,
  );
  assert.equal(calls, 0);
  await assert.rejects(
    h.webSearchTool.performWebSearch({ query: "query" }, session),
    /Authentication required for web search/,
  );
  assert.equal(h.webRuntime.authentication(), undefined);
});
test(
  "compiled CLI can configure separate web endpoint/token and replay a real WebSearch without model credentials",
  { timeout: 10000 },
  async (t) => {
    const root = await directory(t),
      received: any[] = [],
      endpoint = await server(t, async (req, res) => {
        let body = "";
        for await (const chunk of req) body += chunk;
        received.push({
          authorization: req.headers.authorization,
          body: JSON.parse(body),
        });
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify({ provider: "cli-fixture", results: [] }));
      });
    const values = [
      { type: "metadata", version: 1 },
      ...[
        call("WebSearch", { query: "cli query" }),
        final("CLI web complete"),
      ].map((output, turnId) => ({
        type: "stream_response",
        modelName: "fixture",
        turnId,
        events: [
          { offsetMs: 0, event: { type: "response_started" } },
          {
            offsetMs: 0,
            event: {
              type: "response_done",
              response: {
                id: `r-${turnId}`,
                output,
                usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
              },
            },
          },
        ],
      })),
    ];
    await writeFile(
      join(root, "recording.jsonl"),
      values.map((value) => JSON.stringify(value)).join("\n") + "\n",
    );
    const env: NodeJS.ProcessEnv = { ...process.env };
    for (const key of [
      "CODEBUDDY_RECORD_DIR",
      "CODEBUDDY_REPLAY_DIR",
      "CODEBUDDY_API_KEY",
      "OPENAI_API_KEY",
      "CODEBUDDY_BASE_URL",
      "OPENAI_BASE_URL",
    ])
      delete env[key];
    env.CODEBUDDY_REPLAY_DIR = root;
    env.WORKBUDDY_HARNESS_WEB_ACCESS_TOKEN = "cli-web-token";
    const cli = new URL(
        `../src/cli.${import.meta.url.endsWith(".ts") ? "ts" : "js"}`,
        import.meta.url,
      ),
      result = await promisify(execFile)(
        process.execPath,
        [
          ...(import.meta.url.endsWith(".ts")
            ? ["--import", import.meta.resolve("tsx")]
            : []),
          cli.pathname,
          "--cwd",
          root,
          "--model",
          "fixture",
          "--web-endpoint",
          endpoint,
          "--allow-tools",
          "WebSearch",
          "-p",
          "cli input",
        ],
        { cwd: root, env, timeout: 7000 },
      );
    assert.equal(result.stdout, "CLI web complete\n");
    assert.deepEqual(received, [
      {
        authorization: "Bearer cli-web-token",
        body: { query: "cli query", type: "text2text", max_results: 5 },
      },
    ]);
  },
);
test("managed Security Center V3/V2/file priority overrides user network lists and reaches real tool policy gate", async (t) => {
  const root = await directory(t),
    path = join(root, "policy.json"),
    security = (domain: string) =>
      JSON.stringify({
        clientSecurity: {
          config: {
            sandbox: {
              enabled: false,
              networkAccess: {
                mode: "deny_all_with_whitelist",
                whitelistDomains: [domain],
                blacklistDomains: ["denied.test"],
              },
            },
          },
        },
      });
  await writeFile(path, security("file.test"));
  assert.equal(
    readManagedSecurityPolicyFromEnv({
      ACC_PRODUCT_CONFIG_V3: '{"clientSecurity":false}',
      ACC_PRODUCT_CONFIG_V2: security("v2.test"),
      ACC_PRODUCT_CONFIG_PATH: path,
    }).managed,
    false,
  );
  assert.deepEqual(
    readManagedSecurityPolicyFromEnv({
      ACC_PRODUCT_CONFIG_V3: "bad",
      ACC_PRODUCT_CONFIG_V2: security("v2.test"),
      ACC_PRODUCT_CONFIG_PATH: path,
    }).network.allowedDomains,
    ["v2.test"],
  );
  assert.deepEqual(
    readManagedSecurityPolicyFromEnv({ ACC_PRODUCT_CONFIG_PATH: path }).network
      .allowedDomains,
    ["file.test"],
  );
  const env = { ACC_PRODUCT_CONFIG_V3: security("managed.test") },
    settings = {
      list: async () => ({
        sandbox: {
          network: { allowedDomains: ["user.test"], deniedDomains: [] },
        },
      }),
    },
    config = await loadWebNetworkConfig(settings, env);
  assert.deepEqual(config.network.allowedDomains, ["managed.test"]);
  assert.equal(config.network.denyAll, true);
  const harness = await createHarness({
    workDir: root,
    modelProvider: {
      getModel() {
        throw new Error("not used");
      },
    },
    settings: { get: async () => undefined, list: settings.list },
    webTools: {
      env,
      endpoint: "https://service.test",
      accessToken: "web-token",
    },
  });
  t.after(() => harness.close());
  assert.equal(
    (await harness.webFetchTool.checkNetworkPolicy("https://user.test"))
      .allowed,
    false,
  );
  assert.equal(
    (await harness.webFetchTool.checkNetworkPolicy("https://managed.test"))
      .allowed,
    true,
  );
  assert.equal(
    harness.detachedTeamHost.processManager.paths.env!
      .WORKBUDDY_HARNESS_WEB_ACCESS_TOKEN,
    "web-token",
  );
  assert.ok(
    harness.detachedTeamHost.processManager.paths.extraArgs!.includes(
      "--web-endpoint",
    ),
  );
});
