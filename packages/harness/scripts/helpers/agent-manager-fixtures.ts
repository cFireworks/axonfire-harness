import { Agent } from "@openai/agents-core";
import { AgentManagerImpl } from "../../src/agents/native-agent-manager.js";
import { createAgentManagerRuntime } from "../../src/agents/native-agent-manager-runtime.js";
import { DeferToolConfigServiceImpl } from "../../src/tools/defer-tool-config-service.js";
import { manualTimers } from "./session-result-fixtures.js";
export const agentManagerConfig = (): any => ({
  agents: [
    {
      name: "main",
      tags: ["cli", "default"],
      instructions: "owned main",
      tools: ["Read", "ToolSearch", "DelegateTool"],
      models: ["primary"],
    },
    {
      name: "Explore",
      tags: ["cli"],
      instructions: "owned explore",
      tools: ["Read"],
      models: ["lite"],
    },
    {
      name: "compact",
      tags: ["cli"],
      instructions: "owned compact",
      tools: [],
      models: ["primary"],
    },
    {
      name: "custom",
      tags: ["cli", "custom"],
      instructions: "owned custom",
      models: ["custom:a"],
    },
    {
      name: "hidden",
      tags: [],
      instructions: "not a CLI agent",
      tools: [],
      models: [],
    },
  ],
  models: [
    {
      id: "primary",
      name: "Primary",
      aliases: ["p"],
      relatedModels: { lite: "small" },
    },
    { id: "small", name: "Small" },
    { id: "custom:a", name: "Owned custom", tags: ["custom"] },
  ],
  skills: [],
  commands: [],
  tools: [],
  defaultRelatedModels: { reasoning: "small" },
  productFeatures: {},
});
/** Deterministic DI boundary, real SDK Agent/tool objects, no external I/O. */
export function agentManagerFixture(
  construct?: (runtime: any) => any,
  extra: any = {},
) {
  let configuration = agentManagerConfig();
  const events: any[] = [],
    logs: any[] = [],
    listeners: Array<() => void> = [],
    settings: Record<string, any> = {},
    timers = manualTimers(),
    pending: any[] = [];
  const servers: any[] = [
    {
      name: "owned",
      status: "connected",
      config: { type: "sdk" },
      async listTools() {
        return [];
      },
      async callTool() {
        throw Error("not used");
      },
    },
  ];
  const productManager = {
    async waitConfiguration(force?: boolean) {
      events.push(["config", !!force]);
      return configuration;
    },
    onDidChange(fn: () => void) {
      listeners.push(fn);
      return {
        dispose() {
          events.push(["dispose"]);
        },
      };
    },
  };
  const settingsManager = {
    async get(key: string) {
      events.push(["setting", key]);
      return settings[key];
    },
    async list() {
      events.push(["settings-list"]);
      return settings;
    },
  };
  const runtime = createAgentManagerRuntime(
    {
      settingsManager,
      productManager,
      factory: {
        async create(options: any) {
          events.push(["factory", options.name, Object.keys(options).sort()]);
          return new Agent(options);
        },
      },
      toolManager: {
        invalidatePluginDependentToolCaches() {
          events.push(["invalidate"]);
        },
        async get(name: string) {
          if (name.startsWith("mcp__")) return;
          return {
            name,
            description: "owned " + name,
            parameters: {
              type: "object",
              properties: {},
              required: [],
              additionalProperties: false,
            },
            strict: false,
            execute: async () => "owned",
            defer_loading: name === "Read",
          };
        },
      },
      commandManager: {
        async getCustomCommands() {
          return [];
        },
        async getMcpCommands() {
          return [];
        },
        async get() {
          return undefined;
        },
      },
      promptRenderer: {
        async render(template: string, variables: any = {}) {
          events.push(["render", template, variables]);
          return template.replace(
            /{{\s*PluginAgentPrompt\s*}}/g,
            variables.PluginAgentPrompt ?? "",
          );
        },
      },
      mcpManager: {
        async list() {
          return servers;
        },
        async getConnectedServers(opts?: any) {
          events.push(["connected", opts]);
          return servers;
        },
        async waitForPendingServers(opts: any) {
          events.push(["pending", opts.names, opts.timeoutMs]);
          if (extra.waitPending) await extra.waitPending(opts);
          pending.push(opts);
        },
      },
      mcpReadyService: {
        async waitForServersReady() {
          events.push(["mcp-ready"]);
        },
      },
      mcpSubagentToolManager: {
        register(name: string, tools: string[]) {
          events.push(["whitelist", name, tools]);
        },
        unregister(name: string) {
          events.push(["unregister", name]);
        },
      },
      cliProvider: { parseOpts: () => ({ opts: extra.cli ?? {} }) },
      outputStyleManager: {
        async getOutputStyleByName(name: string) {
          return extra.outputStyle;
        },
      },
      logger: Object.fromEntries(
        ["info", "warn", "error", "debug"].map((name) => [
          name,
          (...args: any[]) => logs.push([name, ...args]),
        ]),
      ),
      ...extra.dependencies,
    },
    {
      env: {},
      now: () => 1234,
      ...timers,
      hasDelegateTools: () => !!extra.delegate,
      composePluginAgent: (input: any) => input.agentConfig,
      ...extra.runtime,
    },
  );
  runtime.dependencies.deferToolConfigService = new DeferToolConfigServiceImpl({
    env: runtime.env,
    dependencies: { settingsManager, productManager },
  });
  const manager = construct
    ? construct(runtime)
    : new AgentManagerImpl(runtime);
  return {
    manager,
    runtime,
    events,
    logs,
    listeners,
    settings,
    timers,
    servers,
    pending,
    get configuration() {
      return configuration;
    },
    set configuration(v: any) {
      configuration = v;
    },
    async start() {
      manager.init();
      await manager.readyDeferred.promise;
      await manager.waitForRebuildSettled(0);
    },
  };
}
