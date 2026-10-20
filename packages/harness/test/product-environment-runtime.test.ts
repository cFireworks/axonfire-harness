import assert from "node:assert/strict";
import test from "node:test";
import * as fs from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { EventEmitter } from "node:events";
import { BehaviorSubject } from "rxjs";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import { productEnvironmentFixture } from "../scripts/helpers/product-environment-fixtures.js";
import { productEnvironmentSettingsRace } from "../scripts/helpers/product-environment-settings-race.js";
import { createNativeProductEnvironmentHost } from "../src/config/native-product-environment-host.js";
import { createNativeSettingsHost } from "../src/config/native-settings-host.js";
import { createNativeProductHost } from "../src/config/native-product-host.js";
import { loadProductConfiguration } from "../src/config/product-config.js";
import { createHarness } from "../src/runtime/create-harness.js";
const key = "CODEBUDDY_INTERNET_ENVIRONMENT",
  legacy = "CODEBUDDY_INTERNET_ENVIROMENT";
setTraceProcessors([]);
test("original endpoint read can overwrite a newer permission cache and a following non-transactional permission update can lose a rule", async () => {
  assert.deepEqual(await productEnvironmentSettingsRace(), {
    afterWrite: ["Write", "Read"],
    stale: ["Write"],
    finalDisk: [],
    finalContext: ["Read"],
  });
});
async function owned(t: any) {
  const root = await fs.mkdtemp(join(tmpdir(), "product-environment-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  return root;
}
async function put(file: string, value: any) {
  await fs.mkdir(join(file, ".."), { recursive: true });
  await fs.writeFile(
    file,
    typeof value === "string" ? value : JSON.stringify(value),
  );
}
function gate() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => (resolve = r));
  return { promise, resolve };
}
async function fixture(t: any, spec: any = {}) {
  const root = await owned(t),
    state = join(root, "state"),
    resources = join(root, "resources"),
    env: any = { ...spec.env };
  const base = {
    authentication: {
      id: "owned",
      attributes: {
        internalDomain: "internal.owned",
        externalDomain: "external.owned",
      },
    },
  };
  await put(join(resources, "product.json"), spec.base ?? base);
  const settings = createNativeSettingsHost({
    stateDir: state,
    getWorkDir: () => root,
    logger: {},
  });
  await settings.start();
  const current = new BehaviorSubject<any>(
    spec.current === null ? undefined : (spec.current ?? base),
  );
  let syncs = 0;
  const productManager = {
    configuration: current,
    getCurrentConfiguration: () => current.value,
    waitConfiguration: async () => current.value ?? {},
    async sync() {
      syncs++;
      await spec.sync?.();
    },
  };
  const h = createNativeProductEnvironmentHost({
    getHomeDir: () => state,
    settingsManager: settings.manager,
    productManager,
    authenticationManager: {
      currentSessionSubject: new BehaviorSubject(undefined),
    },
    logger: { info() {}, warn() {}, error() {}, setContext() {} },
    env,
    configuration: {
      resourcesRoot: resources,
      platform: spec.platform ?? "darwin",
    },
  });
  t.after(async () => {
    await h.close();
    await settings.close();
    current.complete();
  });
  return {
    root,
    resources,
    state,
    env,
    settings,
    h,
    current,
    syncs: () => syncs,
  };
}
test("native environment names priorities and complete Boolean helpers retain the captured contracts", () => {
  const f = productEnvironmentFixture();
  assert.equal(f.service.constructor.name, "tl");
  assert.equal(f.internet.constructor.name, "td");
  assert.equal(f.endpoint.constructor.name, "eM");
  assert.equal(f.internet.priority, 6005);
  assert.equal(f.endpoint.priority, 6000);
  for (const truth of [true, " TRUE ", "yes", "on", "1"])
    assert.equal(f.classes.BooleanUtils.isTruthy(truth), true);
  assert.equal(f.classes.BooleanUtils.toBoolean(undefined, true), true);
  assert.equal(f.classes.BooleanUtils.toBoolean("off", true), false);
  assert.throws(() => f.classes.BooleanUtils.isTruthy(1), TypeError);
  f.dispose();
});
test("original current environment and product provider retain different legacy-versus-process precedence", async () => {
  const f = productEnvironmentFixture(undefined, {
    settings: { env: { [legacy]: "internal" } },
    env: { [key]: "external" },
    noFs: true,
  });
  assert.equal(await f.service.getCurrent(), "internal");
  await f.internet.provide({ current: {} });
  // The provider selected external (no deployment type), not the legacy setting's internal JSON.
  assert.equal(f.internet.cachedProductConfigurations.size, 0);
  f.internet.fs = {
    existsSync: () => true,
    readFileSync: (name: string) => {
      assert.equal(name, "/resources/product.external.json");
      return "{}";
    },
  };
  await f.internet.provide({ current: {} });
  f.dispose();
});
test("native switch commits environment before sync and swallows sync failure without retrying an identical switch", async () => {
  const f = productEnvironmentFixture(undefined, { syncError: true });
  await f.service.switch("internal");
  await f.service.switch("internal");
  assert.equal(f.env[key], "internal");
  assert.equal(f.service.lastSwitchedEnv, "internal");
  assert.equal(f.calls.filter((c) => c[0] === "sync").length, 1);
  await f.service.switch(undefined);
  assert.equal(f.env[key], "internal");
  f.dispose();
});
test("switchBySession respects explicit process/settings overrides but may replace its own prior switch", async () => {
  const f = productEnvironmentFixture(undefined, {
    env: { [key]: "external" },
  });
  await f.service.switchBySession({ auth: { domain: "internal.owned" } });
  assert.equal(f.env[key], "external");
  f.service.lastSwitchedEnv = "external";
  await f.service.switchBySession({ auth: { domain: "internal.owned" } });
  assert.equal(f.env[key], "internal");
  f.settings.env = { [legacy]: "external" };
  await f.service.switchBySession({ auth: { domain: "cloud.owned" } });
  assert.equal(f.env[key], "internal");
  f.dispose();
});
test("domain matching retains one-label wildcard and original unescaped regular expression errors", () => {
  const f = productEnvironmentFixture();
  assert.equal(f.service.matchDomain("*.owned", "a.owned"), true);
  assert.equal(f.service.matchDomain("*.owned", "a.b.owned"), false);
  assert.equal(f.service.matchDomain("a+owned", "aaowned"), false);
  assert.throws(
    () => f.service.matchDomain("(*.owned", "a.owned"),
    SyntaxError,
  );
  f.dispose();
});
for (const platform of ["darwin", "win32", "linux"])
  test(`early environment reads only its owned ${platform} session path, leaving the process environment untouched`, async (t) => {
    const f = await fixture(t, { platform, env: { [legacy]: "external" } }),
      processValue = process.env[key];
    await put(join(f.h.authDirectory, "owned.info"), {
      auth: { domain: "internal.owned" },
    });
    f.h.start();
    assert.equal(f.env[key], "internal");
    assert.equal(await f.h.service.getCurrent(), "internal");
    assert.equal(process.env[key], processValue);
    assert.ok(f.h.platformHome.startsWith(f.state));
  });
test("owned early bootstrap retains enterprise precedence, malformed settings tolerance, and no-auth-id early return", async (t) => {
  const f = await fixture(t);
  await put(join(f.h.authDirectory, "owned.info"), {
    auth: { domain: "internal.owned" },
  });
  await put(join(f.state, "settings.json"), {
    enterpriseEndpoint: "http://owned",
  });
  f.h.start();
  assert.equal(f.env[key], "selfhosted");
  const empty = await fixture(t, { base: {} });
  await put(join(empty.state, "settings.json"), {
    enterpriseEndpoint: "http://owned",
  });
  empty.h.start();
  assert.equal(empty.env[key], undefined);
  const corrupt = await fixture(t);
  await put(join(corrupt.state, "settings.json"), "broken");
  await put(join(corrupt.h.authDirectory, "owned.info"), {
    auth: { domain: "external.owned" },
  });
  corrupt.h.start();
  assert.equal(corrupt.env[key], "external");
});
test("environment host refuses external session/resource symlinks and resource traversal", async (t) => {
  const f = await fixture(t),
    outside = await owned(t);
  await put(join(outside, "account.info"), {
    auth: { domain: "internal.owned" },
  });
  await fs.mkdir(f.h.authDirectory, { recursive: true });
  await fs.symlink(
    join(outside, "account.info"),
    join(f.h.authDirectory, "owned.info"),
  );
  f.h.start();
  assert.equal(f.env[key], undefined);
  assert.throws(
    () => f.h.runtime.pathUtils.resolveRootPathSync("../other.json"),
    /outside configured/,
  );
  await put(join(outside, "product.internal.json"), {
    endpoint: "http://outside.owned",
  });
  await fs.symlink(
    join(outside, "product.internal.json"),
    join(f.resources, "product.internal.json"),
  );
  f.env[key] = "internal";
  assert.deepEqual(await f.h.internet.provide({ current: {} }), {});
});
test("resolveEnvBySession uses original packaged JSON fallback and networkEnvironment precedes session inference", async (t) => {
  const f = await fixture(t, { current: null });
  assert.equal(
    await f.h.service.resolveEnvBySession({
      auth: { domain: "internal.owned" },
    }),
    "internal",
  );
  f.current.next({ networkEnvironment: "sandbox" });
  assert.equal(await f.h.service.getCurrent(), "sandbox");
});
test("native environment product cache ignores force and changed JSON bytes for the same lower-case key", async (t) => {
  const f = await fixture(t, { env: { [key]: "INTERNAL" } });
  await put(join(f.resources, "product.internal.json"), {
    endpoint: "http://first.owned",
    models: [{ id: "owned" }],
  });
  const first = await f.h.internet.provide({ current: {} });
  await put(join(f.resources, "product.internal.json"), {
    endpoint: "http://second.owned",
  });
  f.env[key] = "internal";
  assert.equal(await f.h.internet.provide({ force: true, current: {} }), first);
  f.env.CODEBUDDY_DISABLE_BUILTIN_MODELS = "true";
  assert.deepEqual(
    (await f.h.internet.provide({ force: true, current: {} })).models,
    [{ id: "owned" }],
  );
});
test("native missing environment JSON is not cached and deployment inference prefers configured cloud domain", async (t) => {
  const f = await fixture(t, { env: { [key]: "selfhosted" } });
  const input = {
    current: {
      endpoint: "http://tenant.cloud.owned",
      authentication: { attributes: { cloudHostedDomain: "*.cloud.owned" } },
    },
  };
  assert.deepEqual(await f.h.internet.provide(input), {
    deploymentType: "Cloud-Hosted",
  });
  assert.equal(f.h.internet.cachedProductConfigurations.size, 0);
  await put(join(f.resources, "product.selfhosted.json"), {
    endpoint: "http://owned",
  });
  assert.deepEqual(await f.h.internet.provide(input), {
    endpoint: "http://owned",
    deploymentType: "Cloud-Hosted",
  });
});
test("productConfigEnv retains its string character iteration precedence and malformed JSON behavior", () => {
  const f = productEnvironmentFixture(undefined, {
    env: {
      CONFIG: '{"networkEnvironment":"internal"}',
      C: '{"networkEnvironment":"external"}',
      BAD: "broken",
    },
  });
  assert.equal(
    f.internet.getNetworkEnviromentFromConfigEnv("CONFIG"),
    "external",
  );
  assert.equal(
    f.internet.getNetworkEnviromentFromConfigEnv(["missing", "CONFIG"]),
    "internal",
  );
  assert.equal(
    f.internet.getNetworkEnviromentFromConfigEnv(["BAD"]),
    undefined,
  );
  f.dispose();
});
test("endpoint preserves exact TTL edge, force ignoring, environment invalidation, and uncoerced trim failures", async () => {
  const f = productEnvironmentFixture(undefined, {
    settings: { endpoint: " http://one.owned " },
  });
  const first = await f.endpoint.provide({});
  assert.deepEqual(first, { endpoint: "http://one.owned" });
  f.settings.endpoint = "http://two.owned";
  f.setNow(109999);
  assert.equal(await f.endpoint.provide({ force: true }), first);
  f.setNow(110000);
  assert.deepEqual(await f.endpoint.provide({}), {
    endpoint: "http://two.owned",
  });
  f.env[key] = "selfhosted";
  f.settings.enterpriseEndpoint = " http://enterprise.owned ";
  assert.deepEqual(await f.endpoint.provide({}), {
    endpoint: "http://enterprise.owned",
  });
  f.settings.endpoint = 42;
  await assert.rejects(f.endpoint.generateConfig(), TypeError);
  f.dispose();
});
test("real SettingsManager endpoint changes invalidate the native cache and trigger product sync, unrelated changes do not", async (t) => {
  const f = await fixture(t, {
    current: { stagingEndpoint: "http://stage.owned" },
  });
  f.h.start();
  await f.h.endpoint.provide({});
  await f.settings.manager.set("endpoint", " http://one.owned ");
  await f.h.flush();
  assert.equal(f.syncs(), 1);
  assert.deepEqual(await f.h.endpoint.provide({}), {
    endpoint: "http://one.owned",
  });
  await f.settings.manager.set("language", "zh");
  await f.h.flush();
  assert.equal(f.syncs(), 1);
  await f.settings.manager.set("envRouteMode", "staging");
  await f.h.flush();
  assert.equal(f.syncs(), 2);
  assert.deepEqual(await f.h.endpoint.provide({}), {
    endpoint: "http://stage.owned",
    stagingEndpoint: "http://stage.owned",
  });
  await f.h.close();
  assert.equal(f.h.subscriptionCount, 0);
  await f.settings.manager.set("endpoint", "http://after.owned");
  assert.equal(f.syncs(), 2);
  await assert.rejects(f.h.service.switch("internal"), /closed/);
});
test("environment close drains accepted async session switch and settings callbacks while rejecting new work", async (t) => {
  const held = gate(),
    f = await fixture(t, { sync: () => held.promise });
  f.h.start();
  const job = f.h.service.switch("internal");
  let settled = false;
  const closing = f.h.close().then(() => {
    settled = true;
  });
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.equal(settled, false);
  held.resolve();
  await job;
  await closing;
  assert.equal(f.h.pendingCount, 0);
});
const model: Model = {
  async getResponse() {
    return { output: [], usage: new Usage() };
  },
  async *getStreamedResponse() {
    yield { type: "response_started" } as any;
    yield {
      type: "response_done",
      response: {
        id: "owned",
        usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
        output: [
          {
            type: "message",
            id: "m",
            role: "assistant",
            status: "completed",
            content: [{ type: "output_text", text: "environment owned done" }],
          },
        ],
      },
    } as any;
  },
};
async function integration(t: any, extra: any = {}) {
  const root = await owned(t),
    resources = join(root, "resources"),
    base = (await loadProductConfiguration()).raw;
  for (const [name, endpoint] of [
    ["product.json", "http://base.owned"],
    ["product.internal.json", "http://internal.owned"],
    ["product.selfhosted.json", "http://self.owned"],
    ["product.external.json", "http://external.owned"],
  ] as const)
    await put(join(resources, name), {
      ...base,
      endpoint: name === "product.selfhosted.json" ? undefined : endpoint,
      config: { disabled: true },
      authentication: {
        id: "owned",
        attributes: { internalDomain: "internal.owned" },
      },
    });
  const out = new EventEmitter() as any;
  out.write = () => true;
  const h = await createHarness({
    workDir: root,
    stateDir: join(root, "state"),
    recordReplayEnv: {},
    modelProvider: { getModel: () => model },
    sdkControl: { stdout: out },
    productRuntime: {
      watch: false,
      environment: { resourcesRoot: resources },
      env: {},
    },
    ...extra,
  });
  t.after(() => h.close());
  return {
    root,
    resources,
    h,
    async reopen() {
      const stdout = new EventEmitter() as any;
      stdout.write = () => true;
      const next = await createHarness({
        workDir: root,
        stateDir: join(root, "state"),
        recordReplayEnv: {},
        modelProvider: { getModel: () => model },
        sdkControl: { stdout },
        productRuntime: {
          watch: false,
          environment: { resourcesRoot: resources },
          env: {},
        },
      });
      t.after(() => next.close());
      return next;
    },
  };
}
test("default root SDK endpoint initialization uses real environment service and refreshed native product, then real SDK can run", async (t) => {
  const { h, root, reopen } = await integration(t);
  assert.equal(
    h.sdkHandlers!.initializer.productEnvService,
    h.productRuntime.environmentHost!.service,
  );
  const initialized = await h.sdkHandlers!.initializer.handle(
    { request: { endpoint: "http://enterprise.owned" } },
    new AbortController().signal,
  );
  assert.equal(initialized.account, null);
  await h.productRuntime.flush();
  assert.equal(h.productRuntime.runtime.env[key], "selfhosted");
  assert.equal(h.product.raw.endpoint, "http://enterprise.owned");
  assert.equal(
    JSON.parse(await fs.readFile(join(root, "state", "settings.json"), "utf8"))
      .enterpriseEndpoint,
    "http://enterprise.owned",
  );
  const session = await h.openSession();
  const result = await h.prompt(session, "owned offline environment probe");
  assert.ok(result);
  await h.close();
  assert.equal(h.productRuntime.environmentHost!.pendingCount, 0);
  const restarted = await reopen();
  assert.equal(restarted.productRuntime.runtime.env[key], "selfhosted");
  assert.equal(restarted.product.raw.endpoint, "http://enterprise.owned");
});
test("native product environment changes refresh Agent data using the owned per-environment full JSON", async (t) => {
  const { h, resources } = await integration(t);
  const previous = await h.agents.getDefault();
  const json = JSON.parse(
    await fs.readFile(join(resources, "product.internal.json"), "utf8"),
  );
  json.agents = json.agents.map((agent: any) => ({
    ...agent,
    description: agent.description + " owned-env-marker",
  }));
  await put(join(resources, "product.internal.json"), json);
  await h.productRuntime.environmentHost!.service.switch("internal");
  await h.agents.waitForRebuildSettled();
  assert.equal(h.product.raw.endpoint, "http://internal.owned");
  assert.ok(
    (
      await h.agents.getAgentConfig(h.agents.getDefaultAgentName())
    )?.description?.includes("owned-env-marker"),
  );
  assert.notEqual(await h.agents.getDefault(), previous);
});
test("independent ProductHost owns real settings when no borrowed manager is given and closes both hosts", async (t) => {
  const root = await owned(t),
    h = createNativeProductHost({
      initialConfiguration: {},
      getHomeDir: () => join(root, "state"),
      getWorkDir: () => root,
      watch: false,
      cloud: false,
    });
  t.after(() => h.close());
  await h.start();
  assert.ok(h.ownedSettingsHost);
  await h.ownedSettingsHost!.manager.set("endpoint", "http://local.owned");
  await h.flush();
  assert.equal(h.facade.getEndpoint(), "http://local.owned");
  await put(join(root, "state", "settings.json"), {
    endpoint: "http://disk.owned",
  });
  assert.equal(
    await h.ownedSettingsHost!.manager.get("endpoint"),
    "http://local.owned",
  );
  h.configWatch.clearSettingsCache();
  assert.equal(
    await h.ownedSettingsHost!.manager.get("endpoint"),
    "http://disk.owned",
  );
  await h.close();
  assert.equal(h.environmentHost!.subscriptionCount, 0);
  assert.equal(h.ownedSettingsHost!.ownedHandleCount, 0);
});
test("native provider ordering retains higher-priority environment JSON endpoint overriding settings endpoint", async (t) => {
  const { h, resources } = await integration(t);
  const config = JSON.parse(
    await fs.readFile(join(resources, "product.selfhosted.json"), "utf8"),
  );
  config.endpoint = "http://json-precedence.owned";
  await put(join(resources, "product.selfhosted.json"), config);
  await h.sdkHandlers!.initializer.switchEnvironmentIfNeeded(
    undefined,
    "http://enterprise.owned",
  );
  await h.productRuntime.flush();
  assert.equal(h.product.raw.endpoint, "http://json-precedence.owned");
  assert.deepEqual(
    await h.productRuntime.environmentHost!.endpoint.generateConfig(),
    { endpoint: "http://enterprise.owned" },
  );
});
test("none filters merged environment settings but original early USER file inference is independent of setting-sources", async (t) => {
  const f = await fixture(t);
  await f.settings.manager.set("enterpriseEndpoint", "http://owned");
  await f.settings.updateCliOptions({ settingSources: "none" });
  assert.equal(await f.settings.manager.get("enterpriseEndpoint"), undefined);
  f.h.start();
  assert.equal(f.env[key], "selfhosted");
  assert.deepEqual(await f.h.endpoint.provide({}), {});
});
test("closing after a fire-and-forget endpoint callback still waits for its queued native product sync", async (t) => {
  const held = gate(),
    entered = gate();
  const f = await fixture(t, {
    sync: async () => {
      entered.resolve();
      await held.promise;
    },
  });
  f.h.start();
  await f.h.endpoint.provide({});
  await f.settings.manager.set("endpoint", "http://queued.owned");
  await entered.promise;
  let done = false;
  const closing = f.h.close().then(() => {
    done = true;
  });
  await new Promise<void>((r) => setImmediate(r));
  assert.equal(done, false);
  held.resolve();
  await closing;
  assert.equal(f.h.pendingCount, 0);
});
test("root shutdown holds shared settings for an already accepted environment callback", async (t) => {
  const held = gate(),
    entered = gate();
  let hold = false;
  const { h } = await integration(t, {
    nativeSettings: { dependencies: { hookManager: undefined } },
  });
  const endpoint = h.productRuntime.environmentHost!.endpoint,
    nativeGenerate = endpoint.generateConfig.bind(endpoint);
  endpoint.generateConfig = async () => {
    if (hold) {
      entered.resolve();
      await held.promise;
    }
    return nativeGenerate();
  };
  hold = true;
  await h.settingsManager.set("endpoint", "http://queued.owned");
  await entered.promise;
  let closed = false;
  const closing = h.close().then(() => {
    closed = true;
  });
  await new Promise<void>((r) => setImmediate(r));
  assert.equal(closed, false);
  held.resolve();
  await closing;
  assert.equal(h.productRuntime.environmentHost!.pendingCount, 0);
  assert.equal(h.settingsHost.pendingCount, 0);
});
test("environment composition retains prototype methods and original receiver on borrowed ProductManager", async (t) => {
  const f = await fixture(t);
  class ProductManager {
    configuration = new BehaviorSubject<any>({
      networkEnvironment: "internal",
    });
    getCurrentConfiguration() {
      assert.equal(this, manager);
      return this.configuration.value;
    }
    async waitConfiguration() {
      assert.equal(this, manager);
      return this.configuration.value;
    }
    async sync() {
      assert.equal(this, manager);
    }
  }
  const manager = new ProductManager();
  const h = createNativeProductEnvironmentHost({
    getHomeDir: () => f.state,
    settingsManager: f.settings.manager,
    productManager: manager,
    authenticationManager: {
      currentSessionSubject: new BehaviorSubject(undefined),
    },
    logger: {},
    env: {},
    configuration: { resourcesRoot: f.resources },
  });
  try {
    assert.equal(await h.service.getCurrent(), "internal");
    assert.deepEqual(await h.endpoint.generateConfig(), {});
    await h.service.switch("external");
  } finally {
    await h.close();
    manager.configuration.complete();
  }
});
test("concurrent ProductHost starts join the same settings initialization and close drains an unfinished start", async (t) => {
  const root = await owned(t),
    h = createNativeProductHost({
      initialConfiguration: {},
      getHomeDir: () => join(root, "state"),
      getWorkDir: () => root,
      watch: false,
      cloud: false,
    });
  t.after(() => h.close());
  const held = gate(),
    originalStart = h.ownedSettingsHost!.start.bind(h.ownedSettingsHost);
  h.ownedSettingsHost!.start = async () => {
    await held.promise;
    await originalStart();
  };
  let finished = 0;
  const first = h.start().then(
      () => {
        finished++;
      },
      (error) => error,
    ),
    second = h.start().then(
      () => {
        finished++;
      },
      (error) => error,
    );
  await new Promise<void>((r) => setImmediate(r));
  assert.equal(finished, 0);
  let closed = false;
  const closing = h.close().then(() => {
    closed = true;
  });
  await new Promise<void>((r) => setImmediate(r));
  assert.equal(closed, false);
  held.resolve();
  const errors = await Promise.all([first, second]);
  assert.ok(
    errors.every(
      (error) => error instanceof Error && /closed/.test(error.message),
    ),
  );
  await closing;
  assert.equal(h.environmentHost!.subscriptionCount, 0);
  assert.equal(h.ownedSettingsHost!.ownedHandleCount, 0);
});
