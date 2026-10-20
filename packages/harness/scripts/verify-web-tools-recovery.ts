import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";
import * as net from "node:net";
import { z } from "zod";
import {
  WebFetchTool,
  webFetchParameters,
} from "../src/tools/web-fetch-tool.js";
import {
  WebSearchTool,
  webSearchParameters,
} from "../src/tools/web-search-tool.js";
import { validateToolParameters } from "../src/tools/zod-utils.js";
import * as Web from "../src/tools/web-tool-runtime.js";
import * as Ioa from "../src/models/ioa-utils.js";
import {
  translateRemoteSecurityCenter,
  readManagedSecurityPolicyFromEnv,
} from "../src/permissions/managed-security-policy.js";
const filename = process.argv[2];
if (!filename) throw new Error("Pass captured WorkBuddy codebuddy.js path");
const source = await readFile(filename, "utf8");
assert.equal(
  createHash("sha256").update(source).digest("hex"),
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd",
);
const fixedTime = 1790000000000;
class FixedDate extends Date {
  constructor(value?: any) {
    super(value ?? fixedTime);
  }
  static override now() {
    return fixedTime;
  }
}
function evaluate(code: string, bindings: object = {}): any {
  return runInNewContext(
    code,
    {
      Error,
      Date: FixedDate,
      Map,
      Set,
      Promise,
      URL,
      AbortController,
      DOMException,
      setTimeout,
      clearTimeout,
      ...bindings,
    },
    { timeout: 1000, contextCodeGeneration: { strings: false, wasm: false } },
  );
}
let comparisons = 0;
function normalize(value: any): any {
  if (value === undefined) return "[undefined]";
  if (
    Object.prototype.toString.call(value) === "[object Error]" ||
    Object.prototype.toString.call(value) === "[object DOMException]"
  )
    return { name: value.name, message: value.message };
  if (value instanceof AbortSignal) return { aborted: value.aborted };
  if (Array.isArray(value)) return Array.from(value, normalize);
  if (
    value instanceof Map ||
    Object.prototype.toString.call(value) === "[object Map]"
  )
    return [...value].map(normalize);
  if (typeof value === "function") return "[function]";
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, normalize(value[key])]),
    );
  return value;
}
function equal(actual: any, expected: any): void {
  assert.deepEqual(normalize(actual), normalize(expected));
  comparisons++;
}
const translationStart = source.indexOf("71445(eA,el){"),
  translationEnd = source.indexOf("},93004(eA", translationStart),
  nativeTranslation = evaluate(
    `(()=>{const el={};${source.slice(source.indexOf("{", translationStart) + 1, translationEnd)};return el.translateRemoteSecurityCenter})()`,
  );
for (const root of [
  undefined,
  null,
  false,
  "text",
  [],
  {},
  { config: null },
  { config: [] },
])
  equal(translateRemoteSecurityCenter(root), nativeTranslation(root));
for (const enabled of [undefined, false, true, 0])
  for (const mode of [undefined, "deny_all_with_whitelist", "other"])
    for (const lists of [
      undefined,
      [],
      [" example.com ", "", 1, false, "*.a.com"],
    ]) {
      const value = {
        config: {
          sandbox: {
            enabled,
            showDefaultPermission: enabled,
            networkAccess: {
              mode,
              whitelistDomains: lists,
              blacklistDomains: lists,
            },
            fileProtection: { protectPaths: lists, whitelist: lists },
            commandControl: {
              allowPrefixes: lists,
              askPrefixes: [" git   status ", "", 1, "rm -rf"],
            },
          },
        },
      };
      equal(translateRemoteSecurityCenter(value), nativeTranslation(value));
    }
for (const value of [undefined, false, true, 0, -1, "false", NaN])
  for (const toolFlag of [undefined, false, true, "false"]) {
    const config = {
      dataSecurity: {
        secureGatewayEnabled: value,
        transitEncryption: value,
        deleteProtection: value,
        batchDeleteApprovalThreshold: value,
      },
      runtime: {
        enabled: value,
        tools: {
          nodejs: toolFlag,
          python: toolFlag,
          gitBash: toolFlag,
          brokeredShell: toolFlag,
        },
      },
    };
    equal(
      translateRemoteSecurityCenter({ config }),
      nativeTranslation({ config }),
    );
  }
const managedStart = source.indexOf('let nN=["ACC_PRODUCT_CONFIG_V3"'),
  managedEnd = source.indexOf("var __decorate", managedStart),
  nativeManaged = evaluate(
    `(()=>{${source.slice(managedStart, managedEnd)};return readManagedSecurityPolicyFromEnv})()`,
    {
      nO: { translateRemoteSecurityCenter: nativeTranslation },
      ne: () => ({ existsSync: () => false }),
    },
  );
for (const v3 of [
  undefined,
  "",
  "bad",
  "null",
  '{"clientSecurity":null}',
  '{"clientSecurity":false}',
  '{"clientSecurity":{}}',
  '{"clientSecurity":{"config":{"sandbox":{"networkAccess":{"mode":"deny_all_with_whitelist"}}}}}',
])
  for (const v2 of [
    undefined,
    "bad",
    '{"clientSecurity":{"config":{"sandbox":{}}}}',
  ]) {
    const env = { ACC_PRODUCT_CONFIG_V3: v3, ACC_PRODUCT_CONFIG_V2: v2 };
    equal(readManagedSecurityPolicyFromEnv(env), nativeManaged(env));
  }
const limitsStart = source.indexOf("let sY=", 11807000),
  limitsEnd = source.indexOf(";function getTurndownService", limitsStart);
equal(
  [
    Web.WEB_FETCH_API_TIMEOUT_MS,
    Web.WEB_FETCH_LOCAL_TIMEOUT_MS,
    Web.WEB_FETCH_MAX_LENGTH,
    Web.WEB_FETCH_SUMMARY_THRESHOLD,
    Web.WEB_FETCH_CACHE_TTL_MS,
  ],
  evaluate(
    `(()=>{${source.slice(limitsStart, limitsEnd)};return [sY,sJ,sq,sz,sW]})()`,
  ),
);
for (const [key, value] of Object.entries(Web.WEB_REQUEST_HEADERS)) {
  const nativeValue = source
    .slice(15146300, 15147500)
    .match(new RegExp(key + '="([^"]+)"'))?.[1];
  assert.ok(nativeValue);
  equal(value, nativeValue);
}
const nativeSettings = source.slice(11218150, 11222000);
equal(
  [
    Ioa.IOA_DEFAULT_DOMAIN,
    Ioa.IOA_DEFAULT_ENTERPRISE_ID,
    Ioa.IOA_DEFAULT_STAGING_DOMAIN,
    Ioa.IOA_DEFAULT_STAGING_ENTERPRISE_ID,
  ],
  ["tc", "tu", "td", "tp"].map((symbol) => {
    const value = nativeSettings.match(
      new RegExp("\\b" + symbol + '="([^"]+)"'),
    )?.[1];
    assert.ok(value);
    return value;
  }),
);
async function outcome(operation: () => unknown) {
  try {
    return { result: await operation() };
  } catch (error) {
    return { error };
  }
}
const helperStart = source.indexOf("function matchDomainPattern(", 11807000),
  helperEnd = source.indexOf("let sZ=", helperStart),
  helpers = evaluate(
    `(()=>{${source.slice(helperStart, helperEnd)};return {matchDomainPattern,isPrivateHost,isPrivateIP}})()`,
    { sG: net },
  );
const cleanStart = source.indexOf("function cleanHtml(", 11807000),
  cleanEnd = source.indexOf("let sV=", cleanStart),
  nativeClean = evaluate(`(${source.slice(cleanStart, cleanEnd)})`);
const schemaStart = source.indexOf("let sZ=", 11807000),
  searchStart = source.indexOf("let s0=", 11824000),
  fetchSchema = evaluate(
    source.slice(schemaStart + 7, source.indexOf(",sX=tY=class", schemaStart)),
    { iJ: { z } },
  ),
  searchSchema = evaluate(
    source.slice(searchStart + 7, source.indexOf(",s1=class", searchStart)),
    { iJ: { z } },
  );
equal(z.toJSONSchema(webFetchParameters), z.toJSONSchema(fetchSchema));
equal(z.toJSONSchema(webSearchParameters), z.toJSONSchema(searchSchema));
function original(kind: "fetch" | "search", runtime: Web.WebToolRuntime): any {
  const bindings: any = {
    ...helpers,
    cleanHtml: nativeClean,
    iz: { BaseTool: class {} },
    nC: {
      ToolNames: { WEB_FETCH: "WebFetch", WEB_SEARCH: "WebSearch" },
      ToolArgType: { URL: "url" },
    },
    sZ: fetchSchema,
    s0: searchSchema,
    sY: 20000,
    sJ: 30000,
    sq: 100000,
    sz: 15000,
    sW: 900000,
    sV: "content-analyzer-prompt",
    sF: {
      HttpHeaders: Web.HTTP_HEADERS,
      MediaType: Web.MEDIA_TYPE,
      XML_HTTP_REQUEST: "XMLHttpRequest",
    },
    sj: Web.WEB_REQUEST_HEADERS,
    sH: { PRODUCT_TYPE: "CLI" },
    sU: { isPersonalAccount: Ioa.isPersonalAccount },
    ih: { SettingsScope: { USER: "user" } },
    nq: { ProductFeature: { WebFetchRemoteApi: "WebFetchRemoteApi" } },
    nz: {
      AgentService: "service",
      AgentNames: { CONTENT_ANALYZER: "contentAnalyzer" },
    },
    nk: {
      generateUUUID: runtime.uuid,
      ContainerUtil: { get: () => ({ runOneTime: runtime.analyze }) },
    },
    nW: {
      ZodUtils: { validate: validateToolParameters },
      ThemeUtils: { chalk: runtime.chalk },
      IOAUtils: { applyIOADefaultHeaders: runtime.applyIoaHeaders },
      ErrorUtils: {
        isNodeError: Web.isNodeError,
        getErrorMessage: Web.getErrorMessage,
      },
    },
    process: { env: runtime.env },
    getTurndownService: runtime.getTurndownService,
    fetch: runtime.fetch,
  };
  const Class =
    kind === "fetch"
      ? evaluate(
          `(()=>{const tY=${source.slice(11809212, 11824073)};tY.cache=new Map();return tY})()`,
          bindings,
        )
      : evaluate(`(${source.slice(11827419, 11831956)})`, bindings);
  return Object.assign(new Class(), {
    productManager: { waitConfiguration: runtime.configuration },
    authenticationManager: {
      currentSessionSubject: { getValue: runtime.authentication },
    },
    clientInfoProvider: { get: runtime.clientInfo },
    settingsManager: {
      get: runtime.settings.get,
      clearCache: runtime.clearSettingsCache,
    },
    bashSandboxManager: { getConfig: runtime.networkConfig },
    promptRenderer: { render: runtime.renderPrompt },
    logger: runtime.logger,
    galileoService: runtime.telemetry,
  });
}
const pure = new WebFetchTool(),
  oldPure = original("fetch", Web.createWebToolRuntime()),
  search = new WebSearchTool(),
  oldSearch = original("search", Web.createWebToolRuntime());
for (const input of [
  undefined,
  null,
  {},
  { url: "", prompt: "" },
  { url: " ", prompt: "x" },
  { url: "x", prompt: " " },
  { url: 1, prompt: false },
  { url: "url", prompt: "prompt", extra: "ignored" },
]) {
  equal(
    await outcome(() => pure.validateParams(input)),
    await outcome(() => oldPure.validateParams(input)),
  );
  equal(
    pure.toAutoClassifierInput(input),
    oldPure.toAutoClassifierInput(input),
  );
}
for (const input of [
  {},
  { query: "" },
  { query: " " },
  { query: "  " },
  { query: "ab" },
  { query: "ab", freshness: "d0" },
  { query: "ab", freshness: "m12" },
  { query: "ab", freshness: "y5" },
  { query: "ab", freshness: "d31" },
  { query: "ab", allowed_domains: [1] },
  { query: "ab", extra: true },
]) {
  equal(search.validateParams(input), oldSearch.validateParams(input));
  equal(
    search.toAutoClassifierInput(input),
    oldSearch.toAutoClassifierInput(input),
  );
}
for (const url of [
  " http://github.com/a/b/blob/main/x ",
  "HTTP://host/x",
  "https://github.com.evil/blob/a",
  "https://host/github.com/blob/main/x",
  "ftp://host",
  "raw",
  "",
])
  equal(pure.normalizeUrl(url), oldPure.normalizeUrl(url));
const hosts = [
  "localhost",
  "LOCALHOST",
  "a.localhost",
  "localhost.evil",
  "127.0.0.1",
  "10.1.2.3",
  "172.15.0.1",
  "172.16.0.1",
  "172.31.0.1",
  "172.32.0.1",
  "192.168.1.1",
  "169.254.1.1",
  "0.1.1.1",
  "100.64.0.1",
  "8.8.8.8",
  "::",
  "::1",
  "[::1]",
  "::ffff:127.0.0.1",
  "fc00::1",
  "fd00::1",
  "fe81::1",
  "fe80::1",
  "example.com",
  "a.example.com",
];
for (const host of hosts) {
  equal(Web.isPrivateHost(host), helpers.isPrivateHost(host));
  equal(Web.isPrivateIP(host), helpers.isPrivateIP(host));
  for (const pattern of [
    "",
    "example.com",
    "*.example.com",
    "*.localhost",
    "EXAMPLE.COM",
  ])
    equal(
      Web.matchDomainPattern(host, pattern),
      helpers.matchDomainPattern(host, pattern),
    );
}
const savedDate = globalThis.Date;
globalThis.Date = FixedDate as DateConstructor;
try {
  for (const content of [
    "",
    "short",
    "# one\n## two\n" + "p".repeat(60),
    "# 1\n# 2\n# 3\n# 4\n# 5\n# 6",
    "x".repeat(201),
    "<script>hide</script><style>hide</style><noscript>hide</noscript><textarea style='display:none'>hide</textarea><p>text</p>",
  ]) {
    equal(Web.cleanHtml(content), nativeClean(content));
    equal(
      pure.createContentSummary(content),
      oldPure.createContentSummary(content),
    );
    equal(
      pure.createFallbackPrompt(content, 'user "quoted"'),
      oldPure.createFallbackPrompt(content, 'user "quoted"'),
    );
    equal(
      pure.createFallbackResponse(content, "prompt"),
      oldPure.createFallbackResponse(content, "prompt"),
    );
    equal(
      pure.extractMetaContent(content),
      oldPure.extractMetaContent(content),
    );
  }
  for (const html of [
    "<title> title </title><meta name='description' content='desc'>",
    "<meta content='desc' name='description'><meta property='og:title' content='Title'><meta property='og:description' content='desc'><meta name='keywords' content='a,b'>",
    "<title>A &amp; B</title><meta property='og:title' content='A &amp; B'>",
  ])
    equal(pure.extractMetaContent(html), oldPure.extractMetaContent(html));
  for (const config of [
    undefined,
    {},
    { networkPolicyEnabled: false, network: {} },
    { network: {} },
    { network: { denyAll: true, allowedDomains: ["*.example.com"] } },
    { network: { deniedDomains: ["*.example.com"] } },
    { network: { denyAll: false, allowedDomains: ["only.invalid"] } },
    {
      network: {
        denyAll: true,
        allowedDomains: ["example.com"],
        deniedDomains: ["example.com"],
      },
    },
  ])
    for (const url of [
      "https://example.com/x",
      "https://A.EXAMPLE.COM",
      "http://localhost",
      "https://127.0.0.1",
      "https://[::1]",
      "https://8.8.8.8",
      "ftp://example.com",
      "bad",
    ]) {
      const runtime = Web.createWebToolRuntime({
        networkConfig: async () => config,
      });
      equal(
        await new WebFetchTool(runtime).checkNetworkPolicy(url),
        await original("fetch", runtime).checkNetworkPolicy(url),
      );
    }
  for (const age of [899999, 900000, 900001])
    for (const needs of [false, true]) {
      WebFetchTool.cache.clear();
      const before = original("fetch", Web.createWebToolRuntime());
      pure.setCachedContent("url", "content", needs);
      before.setCachedContent("url", "content", needs);
      WebFetchTool.cache.get("url").timestamp -= age;
      before.constructor.cache.get("url").timestamp -= age;
      equal(pure.getCachedEntry("url"), before.getCachedEntry("url"));
      equal(WebFetchTool.cache.size, before.constructor.cache.size);
    }
  for (const enabled of [false, true])
    for (const env of [
      {},
      { CODEBUDDY_DISABLE_WEB_FETCH_REMOTE_API: "true" },
      { CODEBUDDY_DISABLE_WEB_FETCH_REMOTE_API: "1" },
    ]) {
      const runtime = Web.createWebToolRuntime({
        env,
        configuration: async () => ({
          productFeatures: { WebFetchRemoteApi: enabled },
        }),
      });
      equal(
        await new WebFetchTool(runtime).isRemoteApiDisabled(),
        await original("fetch", runtime).isRemoteApiDisabled(),
      );
    }
  for (const needsSummary of [false, true])
    for (const failure of [false, true]) {
      async function run(native: boolean) {
        WebFetchTool.cache.clear();
        const events: any[] = [],
          runtime = Web.createWebToolRuntime({
            networkConfig: async () => ({ network: {} }),
            telemetry: {
              isReady: () => true,
              logInfo: (...args) => events.push(args),
              logError: (...args) => events.push(args),
            },
          }),
          tool = native
            ? original("fetch", runtime)
            : new WebFetchTool(runtime);
        tool.fetchWithFallback = async (...args: any[]) => {
          events.push(["fetch", args]);
          if (failure) throw new Error("fetch failed");
          return { content: "raw", source: "api", needsSummary };
        };
        tool.processContentWithAI = async (...args: any[]) => {
          events.push(["analyze", args]);
          return "summary";
        };
        const first = await outcome(() =>
            tool.execute(
              { url: "http://example.com/x?secret=1", prompt: "first" },
              { context: { id: "session" } },
            ),
          ),
          second = await outcome(() =>
            tool.execute(
              { url: "https://example.com/x?secret=1", prompt: "second" },
              { context: { id: "session" } },
            ),
          );
        return { first, second, events };
      }
      equal(await run(false), await run(true));
    }
  for (const api of [
    "ok",
    "threshold",
    "over-threshold",
    "max",
    "long",
    "fail",
  ])
    for (const local of ["ok", "fail"]) {
      async function run(native: boolean) {
        const runtime = Web.createWebToolRuntime({
            configuration: async () => ({}),
          }),
          tool = native
            ? original("fetch", runtime)
            : new WebFetchTool(runtime);
        tool.fetchContentViaApi = async () => {
          if (api === "fail") throw new Error("api failed");
          return api === "ok"
            ? "api"
            : "x".repeat(
                api === "threshold"
                  ? 15000
                  : api === "over-threshold"
                    ? 15001
                    : api === "max"
                      ? 100000
                      : 100001,
              );
        };
        tool.fetchAndProcessLocally = async () => {
          if (local === "fail") throw new Error("local failed");
          return "local";
        };
        return outcome(() =>
          tool.fetchWithFallback("https://example.com", "prompt", {
            id: "session",
          }),
        );
      }
      equal(await run(false), await run(true));
    }
  for (const status of [200, 400])
    for (const data of [
      {},
      { code: 1, msg: "denied" },
      { content: "answer" },
      { content: " " },
      {
        provider: "provider",
        results: [
          {},
          {
            title: "Title",
            url: "url",
            snippet: "snippet",
            site: "site",
            favicon: "icon",
            ignored: "x",
          },
        ],
        total_results: 20,
      },
    ])
      for (const kind of ["fetch", "search"] as const) {
        async function run(native: boolean) {
          const requests: any[] = [],
            runtime = Web.createWebToolRuntime({
              uuid: () => "a-b-c",
              configuration: async () => ({
                endpoint: "https://service.invalid",
                deploymentType: "cloud",
              }),
              authentication: () => ({
                auth: { accessToken: "fixture" },
                account: {
                  uid: "uid",
                  departmentFullName: "department",
                  enterpriseId: "enterprise",
                },
              }),
              clientInfo: async () => ({
                ideType: "ide",
                platform: "platform",
                platformVersion: "2",
              }),
              fetch: async (url, config) => {
                requests.push({ url, ...config });
                return {
                  ok: status === 200,
                  status,
                  statusText: "status",
                  json: async () => data,
                  text: async () => JSON.stringify(data),
                } as Response;
              },
            }),
            tool = native
              ? original(kind, runtime)
              : kind === "fetch"
                ? new WebFetchTool(runtime)
                : new WebSearchTool(runtime),
            session = {
              id: "session",
              conversationRequestId: "request",
              meta: { "codebuddy.ai/mode": "plan" },
            },
            result = await outcome(() =>
              kind === "fetch"
                ? tool.fetchContentViaApi(
                    "https://example.com",
                    "prompt",
                    session,
                  )
                : tool.performWebSearch(
                    {
                      query: "query",
                      blocked_domains: ["a.com", "b.com"],
                      allowed_domains: ["c.com"],
                      freshness: "d1",
                    },
                    session,
                  ),
            );
          return { result, requests };
        }
        equal(await run(false), await run(true));
      }
  for (const results of [
    [],
    [{ title: "title", url: "url", snippet: "snippet" }],
    [
      { title: "a", url: "a", snippet: "a" },
      { title: "b", url: "b", snippet: "b" },
    ],
  ]) {
    equal(
      search.formatSearchResults(results, "query", "provider"),
      oldSearch.formatSearchResults(results, "query", "provider"),
    );
    equal(
      search.buildStructuredResult("query", {
        results,
        provider: "p",
        total_results: 9,
        response_time_ms: 2,
      }),
      oldSearch.buildStructuredResult("query", {
        results,
        provider: "p",
        total_results: 9,
        response_time_ms: 2,
      }),
    );
  }
  for (const template of ["rendered", "", "throw"])
    for (const answer of ["answer", "", "throw"]) {
      async function run(native: boolean) {
        const events: any[] = [],
          runtime = Web.createWebToolRuntime({
            renderPrompt: async (...args) => {
              events.push(args);
              if (template === "throw") throw new Error("template failed");
              return template;
            },
            analyze: async (...args) => {
              events.push(args);
              if (answer === "throw") throw new Error("model failed");
              return answer;
            },
            logger: { warn: (...args) => events.push(args) },
          }),
          tool = native
            ? original("fetch", runtime)
            : new WebFetchTool(runtime);
        return {
          result: await tool.processContentWithAI("content", "prompt"),
          events,
        };
      }
      equal(await run(false), await run(true));
    }
  const IoaNative = evaluate(`(${source.slice(13282850, 13283616)})`, {
    ep: {
      ...Ioa,
      ENV_KEY_CODEBUDDY_INTERNET_ENVIRONMENT: "CODEBUDDY_INTERNET_ENVIRONMENT",
      SettingsManager: "settings",
    },
    ed: {
      HTTP_HEADER_DOMAIN: "X-Domain",
      HTTP_HEADER_ENTERPRISE_ID: "X-Enterprise-Id",
      HTTP_HEADER_TENANT_ID: "X-Tenant-Id",
    },
    eu: { ContainerUtil: { get: () => ({ get: async () => "staging" }) } },
    process: { env: {} },
  });
  for (const environment of [undefined, "ioa", "IOA", "other"])
    for (const enterpriseId of [undefined, "", " explicit "])
      for (const skipDefaultEnterpriseHeaders of [false, true])
        for (const existing of [false, true]) {
          const env = { CODEBUDDY_INTERNET_ENVIRONMENT: environment },
            a = existing
              ? { "X-Domain": "custom", "X-Enterprise-Id": "already" }
              : {},
            b = { ...a },
            options = {
              ...(enterpriseId !== undefined ? { enterpriseId } : {}),
              skipDefaultEnterpriseHeaders,
            };
          await Ioa.IOAUtils.applyIOADefaultHeaders(
            a,
            env,
            options,
            { get: async () => "staging" },
            {},
          );
          await IoaNative.applyIOADefaultHeaders(b, env, options);
          equal(a, b);
        }
} finally {
  globalThis.Date = savedDate;
  WebFetchTool.cache.clear();
}
console.log(
  `Web tools differential verification passed: ${comparisons} comparisons; captured bundle SHA-256 verified.`,
);
