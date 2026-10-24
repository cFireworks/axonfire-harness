import assert from "node:assert/strict";
type Factory = (runtime?: any) => any;
function config(api: any, options: any = {}) {
  return JSON.parse(api.buildConnectorProxyMcpConfig(43210, options))
    .mcpServers["connector-proxy"];
}
export const appCodeBackendScenarios: [
  string,
  (f: Factory) => Promise<void>,
][] = [
  [
    "unready ports warn and return empty; finite positive fractions remain accepted",
    async (f) => {
      const warnings: any[] = [];
      const api = f({ console: { warn: (v: any) => warnings.push(v) } });
      for (const p of [0, -1, NaN, Infinity, undefined, "2"])
        assert.equal(api.buildConnectorProxyMcpConfig(p), "");
      assert.equal(warnings.length, 6);
      assert.equal(
        JSON.parse(api.buildConnectorProxyMcpConfig(1.5)).mcpServers[
          "connector-proxy"
        ].url,
        "http://127.0.0.1:1.5/mcp",
      );
    },
  ],
  [
    "default MCP exposes original bare/deferred tools and bearer transport",
    async (f) => {
      const api = f();
      const c = config(api, { proxySecret: "owned" });
      assert.equal(c.type, "http");
      assert.equal(c.transparent_proxy, true);
      assert.equal(c.defer_loading, true);
      assert.deepEqual(c.headers, { Authorization: "Bearer owned" });
      assert.deepEqual(c.tools.present_files, { defer_loading: false });
      assert.deepEqual(c.tools.conversation_search, {
        defer_loading: true,
        bare_name: true,
      });
      assert.ok(c.builtin_tools.includes("pick_location"));
      assert.deepEqual(c.tools["netdrive_tdrive.file_upload"], {
        server_name: "netdrive",
        defer_loading: true,
      });
      assert.equal(new Set(c.builtin_tools).size, c.builtin_tools.length);
    },
  ],
  [
    "memory, POI and project gates filter their original paths",
    async (f) => {
      const api = f();
      const c = config(api, {
        cloudMemoryEnabled: false,
        poiMapEnabled: false,
        netdriveEnabled: false,
        connectorToolServerMap: {
          conversation_search: "memory",
          drive: "netdrive",
          foreign: "custom",
        },
      });
      assert.equal(c.tools.conversation_search, undefined);
      assert.equal(c.tools.pick_location, undefined);
      assert.equal(c.tools.drive, undefined);
      assert.equal(c.tools["netdrive_tdrive.file_upload"], undefined);
      assert.deepEqual(c.tools.foreign, { server_name: "custom" });
      assert.ok(!c.builtin_tools.includes("conversation_search"));
      assert.equal(c.headers, undefined);
    },
  ],
  [
    "Ardot second pass overrides deferral including earlier memory filtering",
    async (f) => {
      const api = f();
      const c = config(api, {
        cloudMemoryEnabled: false,
        connectorToolServerMap: {
          conversation_search: "ardot",
          present_files: "ardot",
          external: "ardot",
          read_me: "custom",
        },
      });
      assert.deepEqual(c.tools.conversation_search, {
        server_name: "ardot",
        defer_loading: false,
      });
      assert.deepEqual(c.tools.external, {
        server_name: "ardot",
        defer_loading: false,
      });
      assert.deepEqual(c.tools.read_me, { defer_loading: false });
      assert.equal(c.tools.present_files.server_name, "ardot");
      assert.ok(!c.builtin_tools.includes("conversation_search"));
    },
  ],
  [
    "POI merged feature object takes precedence without per-key fallback",
    async (f) => {
      const api = f();
      const logs: string[] = [];
      const logger = { info: (s: string) => logs.push(s) };
      assert.equal(
        api.isPoiMapEnabled(
          {
            configuration: { getValue: () => ({ productFeatures: {} }) },
            getCurrentConfiguration: () => ({
              productFeatures: { PoiMap: true },
            }),
          },
          logger,
        ),
        false,
      );
      assert.equal(
        api.isPoiMapEnabled({
          getCurrentConfiguration: () => ({
            productFeatures: { PoiMap: true },
          }),
        }),
        true,
      );
      assert.equal(
        api.isPoiMapEnabled({
          getCurrentConfiguration: () => ({
            productFeatures: { PoiMap: "true" },
          }),
        }),
        false,
      );
      assert.match(logs[0]!, /source=configuration/);
    },
  ],
  [
    "backend factory binds dynamic platform, auth, project and document dependencies",
    async (f) => {
      let deps: any;
      const calls: any[] = [];
      const manager = {},
        pool = {},
        audit = {};
      let session: any = null;
      let memory: any = false;
      let teams = "0";
      const docs = {
        prefix: "doc",
        resolveAgentEnv() {
          return { DOC: this.prefix };
        },
      };
      const api = f({
        cliEnvironment: {
          resolveWorkbuddyAppServerCodeCliPath: (o: any) => {
            calls.push(o);
            return "/cli";
          },
          buildWorkbuddyAppServerCodeCliEnv: (o: any, extra: any) => ({
            extra,
          }),
        },
      });
      const opts: any = {
        runtimeManager: manager,
        cliPrewarmPool: pool,
        auditStore: audit,
        platform: {
          appRootPath: "/app",
          isPackaged: true,
          appVersion: "v1",
          appLocale: () => "en",
          configDir: "/config",
          dataDir: "/data",
        },
        celljs: {
          logger: {},
          configService: { get: () => memory },
          productManager: {
            getCurrentConfiguration: () => ({
              productFeatures: { PoiMap: false },
            }),
          },
          connectorProxyServer: {
            getPort: () => 1234,
            getProxySecret: () => "secret",
          },
          connectorMcpProxy: {
            getToolServerMap: () => ({ drive: "netdrive" }),
          },
          connectorService: {
            getSkillOnlyTokenEnv: () => ({ TOKEN: "owned" }),
          },
          authenticationManager: {
            currentSessionSubject: { getValue: () => session },
          },
        },
        tencentDocsMcp: docs,
        agentTeamsEnvResolver: {
          resolveForSession: (id: string) => {
            calls.push(id);
            return teams;
          },
        },
        adapters: {
          getProjectSessionEnv: (id: string) => ({ PROJECT: id }),
          getProjectMcpServersForSession: (id: string) => [id],
          getQimei36: () => "q",
        },
        createBackend: (m: any, d: any) => {
          assert.equal(m, manager);
          deps = d;
          return "backend";
        },
      };
      assert.equal(api.createWorkbuddyAppServerCodeBackend(opts), "backend");
      assert.equal(deps.cliPrewarmPool, pool);
      assert.equal(deps.auditStore, audit);
      assert.equal(deps.getAppVersion(), "v1");
      opts.platform.appVersion = "v2";
      assert.equal(deps.getAppVersion(), "v2");
      assert.equal(deps.resolveCliPath(), "/cli");
      assert.equal(calls[0], opts);
      assert.deepEqual(deps.buildEnv({ A: "b" }), { extra: { A: "b" } });
      assert.deepEqual(deps.getAgentExtraEnv(), { DOC: "doc" });
      assert.deepEqual(deps.getProjectSessionEnv("s"), { PROJECT: "s" });
      assert.deepEqual(deps.getProjectMcpServersForSession("s"), ["s"]);
      assert.equal(deps.getAgentTeamsEnv("s"), "0");
      teams = "1";
      assert.equal(deps.getAgentTeamsEnv("s"), "1");
      assert.equal(deps.isAuthenticated(), false);
      session = { auth: { domain: "owned" } };
      assert.equal(deps.isAuthenticated(), true);
      let m = JSON.parse(deps.getMcpConfig()).mcpServers["connector-proxy"];
      assert.equal(m.tools.drive, undefined);
      assert.equal(m.tools.conversation_search, undefined);
      memory = true;
      m = JSON.parse(deps.getMcpConfig({ projectId: "project" })).mcpServers[
        "connector-proxy"
      ];
      assert.deepEqual(m.tools.drive, { server_name: "netdrive" });
      assert.ok(m.tools.conversation_search);
      delete opts.adapters.getProjectSessionEnv;
      assert.equal(deps.getProjectSessionEnv("s"), undefined);
      assert.deepEqual(deps.getConnectorTokenEnv(), { TOKEN: "owned" });
      assert.equal(deps.getQimei36, opts.adapters.getQimei36);
    },
  ],
  [
    "builtin config calls are isolated across flag changes",
    async (f) => {
      const api = f();
      const a = config(api, {
        cloudMemoryEnabled: false,
        poiMapEnabled: false,
        netdriveEnabled: false,
      });
      a.tools.read_me.changed = true;
      const b = config(api);
      assert.ok(b.tools.conversation_search);
      assert.ok(b.tools.pick_location);
      assert.equal(b.tools.read_me.changed, undefined);
      assert.ok(b.tools["netdrive_tdrive.dir_list"]);
    },
  ],
];
