import * as fs from "node:fs";
import nunjucks from "nunjucks";
import { Agent } from "@openai/agents-core";
import { ProductConfiguration } from "../config/product-config.js";
import type { ProductConfig } from "../config/types.js";
import type { ProductPromptRenderer } from "../prompts/prompt-renderer.js";
import type { ToolManager } from "../tools/tool-manager.js";
import type { McpRegistry } from "../mcp/mcp-registry.js";
import type { AgentFactory } from "./agent-factory.js";
import type { AgentManagerImpl } from "./native-agent-manager.js";
import {
  createAgentManagerRuntime,
  type AgentManagerRuntime,
} from "./native-agent-manager-runtime.js";
import { DeferToolConfigServiceImpl } from "../tools/defer-tool-config-service.js";
import {
  createPluginAgentComposer,
  type PluginAgentComposeRuntime,
} from "./plugin-agent-compose.js";
import { createAgentMarkdownUtils } from "./native-agent-markdown.js";
import { CapturedYaml } from "../vendor/captured-yaml.js";
import { substituteLoadTimeVariables } from "../commands/skill-product-provider.js";
export type AgentManagerHostOptions = {
  settings?: { get(key: string): Promise<any>; list?(): Promise<any> };
  getConfiguration?(force?: boolean): Promise<ProductConfig>;
  onConfigurationChange?(
    listener: () => void,
  ): { dispose?(): void; unsubscribe?(): void } | void;
  getCliOptions?(): Record<string, any>;
  plugins?: { getActivePlugins(): Promise<any[]> };
  outputStyles?: { getOutputStyleByName(name: string): Promise<any> };
  prewarmStateService?: any;
  mcpManager?: any;
  mcpReadyService?: any;
  mcpSubagentToolManager?: any;
  compose?: Partial<PluginAgentComposeRuntime>;
  runtime?: Partial<Omit<AgentManagerRuntime, "dependencies">>;
  logger?: {
    debug(...args: any[]): void;
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
  };
};
/** Only missing desktop services are adapted here; canonical manager decisions remain in the source port. */
export class StandaloneAgentManagerHost {
  core!: AgentManagerImpl;
  commands: any = {
    async get() {},
    async getCustomCommands() {
      return [];
    },
    async getMcpCommands() {
      return [];
    },
  };
  readonly runtime: AgentManagerRuntime;
  private started = false;
  private closed = false;
  private readonly subscriptions: Array<{
    dispose?(): void;
    unsubscribe?(): void;
  }> = [];
  readonly mcpWhitelists = new Map<string, string[]>();
  constructor(
    readonly product: ProductConfiguration,
    readonly prompts: ProductPromptRenderer,
    readonly tools: ToolManager,
    readonly mcp: McpRegistry,
    readonly factory: AgentFactory | undefined,
    readonly options: AgentManagerHostOptions = {},
  ) {
    const settings = {
      list: () => options.settings?.list?.() ?? Promise.resolve({}),
      get: (key: string) =>
        options.settings?.get(key) ?? Promise.resolve(undefined),
    };
    const productManager = {
      waitConfiguration: async (force?: boolean) => {
        const snapshot =
          (await options.getConfiguration?.(force)) ?? product.raw;
        if (snapshot !== product.raw)
          Object.assign(product, new ProductConfiguration(snapshot));
        return snapshot;
      },
      onDidChange: (listener: () => void) => {
        const disposable = options.onConfigurationChange?.(() => {
          if (!this.closed) listener();
        });
        if (disposable) this.subscriptions.push(disposable);
        return disposable;
      },
    };
    const runtime = createAgentManagerRuntime(
      {
        settingsManager: settings,
        productManager,
        factory: factory ?? { create: (opts: any) => new Agent(opts) },
        toolManager: {
          get: (name: string, agent: any, snapshot: any) =>
            tools.getForAgent(name, agent, snapshot),
          invalidatePluginDependentToolCaches: () =>
            tools.invalidatePluginDependentToolCaches(),
        },
        commandManager: {
          get: (...args: any[]) => this.commands.get(...args),
          getCustomCommands: () => this.commands.getCustomCommands(),
          getMcpCommands: () => this.commands.getMcpCommands(),
        },
        promptRenderer: {
          render: (...args: any[]) => prompts.renderAsync(args[0], args[1]),
        },
        mcpManager: options.mcpManager ?? {
          list: () => mcp.listForAgentManager(),
          getConnectedServers: (opts?: any) =>
            opts?.waitForSettle
              ? mcp
                  .waitForServersReady(opts.signal)
                  .then(() => mcp.connectedServers())
              : Promise.resolve(mcp.connectedServers()),
          waitForPendingServers: (opts: any) =>
            mcp.waitForServersReady(opts.signal),
        },
        mcpReadyService: options.mcpReadyService ?? {
          waitForServersReady: () => mcp.waitForServersReady(),
        },
        mcpSubagentToolManager: options.mcpSubagentToolManager ?? {
          register: (name: string, values: string[]) =>
            this.mcpWhitelists.set(name, values),
          unregister: (name: string) => this.mcpWhitelists.delete(name),
        },
        cliProvider: {
          parseOpts: () => ({ opts: options.getCliOptions?.() ?? {} }),
        },
        outputStyleManager: options.outputStyles ?? {
          async getOutputStyleByName() {
            return undefined;
          },
        },
        ...(options.prewarmStateService
          ? { prewarmStateService: options.prewarmStateService }
          : {}),
        ...(options.plugins ? { pluginManager: options.plugins } : {}),
        ...(options.logger ? { logger: options.logger } : {}),
      },
      { hasDelegateTools: () => tools.hasDelegateTools(), ...options.runtime },
    );
    const composer = createPluginAgentComposer(
      {
        readFileSync: (path, encoding) => fs.readFileSync(path, encoding),
        existsSync: fs.existsSync,
        markdown: createAgentMarkdownUtils(CapturedYaml.parse),
        substituteLoadTimeVariables,
        ...options.compose,
      },
      nunjucks,
    );
    runtime.composePluginAgent = composer.composePluginAgent;
    runtime.dependencies.deferToolConfigService =
      new DeferToolConfigServiceImpl({
        env: runtime.env,
        dependencies: { settingsManager: settings, productManager },
      });
    this.runtime = runtime;
  }
  async start() {
    if (this.closed) throw Error("AgentManager host is closed");
    if (!this.started) {
      this.started = true;
      this.core.init();
    }
    await this.core.readyDeferred.promise;
    await this.core.waitForRebuildSettled(0);
  }
  async close() {
    this.closed = true;
    for (const subscription of this.subscriptions.splice(0)) {
      subscription.dispose?.();
      subscription.unsubscribe?.();
    }
    await this.core.waitForRebuildSettled(0);
  }
}
