import { extname } from "node:path";
import {
  LSPServerStatus,
  noopLSPLogger,
  type LSPClientService,
  type LSPLogger,
  type LSPPluginManager,
  type LSPServerConfig,
  type LSPServerInstance,
} from "./lsp-types.js";
/** Native Manager 11983089..11990110. No implicit plugin discovery in this DI adapter. */
export class LSPManagerImpl {
  readonly languageConfigs = new Map<string, LSPServerInstance>();
  hasLoadedPlugins = false;
  readonly extensionToLanguage = new Map<string, string>();
  readonly startingServers = new Map<string, Promise<void>>();
  reloadPluginServersTail: Promise<void> = Promise.resolve();
  constructor(
    readonly createClient: () => LSPClientService,
    readonly pluginManager: LSPPluginManager = {
      getActivePlugins: async () => [],
    },
    readonly logger: LSPLogger = noopLSPLogger,
    readonly runtime: {
      setTimeout: typeof setTimeout;
      process: Pick<NodeJS.Process, "on">;
    } = { setTimeout, process },
  ) {}
  init(): void {
    this.logger.setContext("LSPManager");
    this.logger.info("LSP Manager initialized");
    this.runtime.process.on("exit", () => this.shutdownAllSync());
    this.ensurePluginsLoaded().catch((error) =>
      this.logger.error(
        `Failed to load LSP configurations from plugins: ${error}`,
      ),
    );
  }
  async ensurePluginsLoaded(): Promise<void> {
    if (!this.hasLoadedPlugins)
      try {
        for (const {
          plugin,
          components,
        } of await this.pluginManager.getActivePlugins())
          try {
            if (components?.lspServers)
              this.registerServers(
                components.lspServers,
                plugin.name,
                plugin.marketplaceName,
              );
          } catch (error) {
            this.logger.warn(
              `Failed to load LSP config for plugin ${plugin.name}@${plugin.marketplaceName}: ${error}`,
            );
          }
        this.hasLoadedPlugins = true;
        this.logger.info("Loaded LSP configurations from all enabled plugins");
      } catch (error) {
        this.logger.error(`Failed to load LSP configurations: ${error}`);
        throw error;
      }
  }
  registerServers(
    servers: Record<string, LSPServerConfig>,
    pluginName: string,
    marketplaceName: string,
  ): void {
    for (const [language, config] of Object.entries(servers))
      try {
        this.validateConfig(config, language);
        if (this.languageConfigs.has(language)) {
          const old = this.languageConfigs.get(language)!;
          this.logger.warn(
            `LSP server for language '${language}' already registered by '${old.pluginName}@${old.marketplaceName}'. Will be replaced by '${pluginName}@${marketplaceName}'.`,
          );
        }
        const server: LSPServerInstance = {
          languageId: language,
          config,
          status: LSPServerStatus.Stopped,
          restartCount: 0,
          pluginName,
          marketplaceName,
        };
        this.languageConfigs.set(language, server);
        for (const [extension] of Object.entries(config.extensionToLanguage)) {
          const normalized = extension.toLowerCase();
          if (this.extensionToLanguage.has(normalized))
            this.logger.debug(
              `Extension '${extension}' already mapped, will be overridden`,
            );
          this.extensionToLanguage.set(normalized, language);
        }
        if (config.eager === true) {
          this.logger.info(
            `Registered LSP server for language '${language}' from plugin '${pluginName}@${marketplaceName}' (eager mode)`,
          );
          this.startServerInBackground(server);
        } else
          this.logger.info(
            `Registered LSP server for language '${language}' from plugin '${pluginName}@${marketplaceName}' (lazy mode)`,
          );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Failed to register LSP server for language '${language}' from plugin '${pluginName}@${marketplaceName}': ${message}`,
        );
      }
  }
  validateConfig(config: LSPServerConfig, language: string): void {
    if (!config.command)
      throw Error(
        `Missing required field 'command' for language '${language}'`,
      );
    if (
      !config.extensionToLanguage ||
      Object.keys(config.extensionToLanguage).length === 0
    )
      throw Error(
        `Missing required field 'extensionToLanguage' for language '${language}'`,
      );
  }
  async getClientForFile(
    file: string,
  ): Promise<LSPClientService | null | undefined> {
    const extension = extname(file).toLowerCase();
    if (!extension) return null;
    const language = this.extensionToLanguage.get(extension);
    if (!language) return null;
    const server = this.languageConfigs.get(language);
    if (!server) return null;
    if (server.client && server.client.isRunning()) return server.client;
    if (server.status === LSPServerStatus.Starting) {
      const pending = this.startingServers.get(language);
      if (pending) {
        this.logger.info(
          `Waiting for LSP server '${language}' to finish starting...`,
        );
        try {
          await pending;
        } catch {}
        if (server.client && server.client.isRunning()) return server.client;
      }
    }
    if (server.status === LSPServerStatus.Unavailable)
      throw Error(
        `LSP server for language '${language}' is unavailable after ${server.restartCount} failed restart attempts`,
      );
    this.logger.info(`Lazy starting LSP server for language '${language}'...`);
    try {
      await this.startServerSafe(server);
      return server.client;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to start LSP server for '${language}': ${message}`,
      );
      if (this.shouldRestart(server)) {
        this.logger.info(
          `Will retry starting LSP server for '${language}' (attempt ${server.restartCount + 1})`,
        );
        await this.scheduleRestart(server);
        if (server.client && server.client.isRunning()) return server.client;
        return null;
      }
      server.status = LSPServerStatus.Unavailable;
      throw error;
    }
  }
  startServerInBackground(server: LSPServerInstance): void {
    this.startServerSafe(server).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to start LSP server for '${server.languageId}' in background: ${message}`,
      );
      if (this.shouldRestart(server))
        this.scheduleRestart(server).catch((error) =>
          this.logger.error(
            `Failed to schedule restart for '${server.languageId}': ${error}`,
          ),
        );
      else server.status = LSPServerStatus.Unavailable;
    });
  }
  async startServerSafe(server: LSPServerInstance): Promise<void> {
    const language = server.languageId,
      pending = this.startingServers.get(language);
    if (pending) return pending;
    const promise = this.startServer(server).finally(() => {
      if (this.startingServers.get(language) === promise)
        this.startingServers.delete(language);
    });
    this.startingServers.set(language, promise);
    return promise;
  }
  async startServer(server: LSPServerInstance): Promise<void> {
    this.logger.info(`Starting LSP server for language '${server.languageId}'`);
    server.status = LSPServerStatus.Starting;
    try {
      const client = this.createClient();
      client.init(server.config, server.languageId);
      await client.initialize();
      server.client = client;
      server.status = LSPServerStatus.Running;
      server.restartCount = 0;
      this.logger.info(
        `LSP server for language '${server.languageId}' started successfully`,
      );
    } catch (error) {
      server.status = LSPServerStatus.Crashed;
      throw error;
    }
  }
  shouldRestart(server: LSPServerInstance): boolean {
    const enabled = server.config.restartOnCrash !== false,
      max = server.config.maxRestarts || 3;
    return enabled && server.restartCount < max;
  }
  async scheduleRestart(server: LSPServerInstance): Promise<void> {
    if (this.languageConfigs.get(server.languageId) === server) {
      server.restartCount++;
      await new Promise((resolve) => this.runtime.setTimeout(resolve, 1000));
      if (this.languageConfigs.get(server.languageId) === server)
        try {
          await this.startServerSafe(server);
        } catch (error) {
          if (this.shouldRestart(server)) await this.scheduleRestart(server);
          else {
            server.status = LSPServerStatus.Unavailable;
            this.logger.error(
              `LSP server for '${server.languageId}' failed to restart after ${server.restartCount} attempts`,
            );
          }
        }
    }
  }
  getRegisteredLanguages(): string[] {
    return Array.from(this.languageConfigs.keys());
  }
  async shutdownAll(): Promise<void> {
    this.logger.info("Shutting down all LSP servers");
    await this.drainStartingServers();
    const pending: Promise<void>[] = [];
    for (const server of this.languageConfigs.values())
      if (server.client && server.client.isRunning())
        pending.push(
          server.client
            .shutdown()
            .catch((error) =>
              this.logger.error(
                `Error shutting down LSP server for '${server.languageId}': ${error}`,
              ),
            ),
        );
    await Promise.all(pending);
    this.languageConfigs.clear();
    this.extensionToLanguage.clear();
    this.logger.info("All LSP servers shut down");
  }
  async reloadPluginServers(): Promise<void> {
    const promise = this.reloadPluginServersTail.then(async () => {
      await this.shutdownAll();
      this.hasLoadedPlugins = false;
      await this.ensurePluginsLoaded();
    });
    this.reloadPluginServersTail = promise.catch((error) => {
      this.logger.error(`Failed to reload plugin LSP servers: ${error}`);
    });
    return promise;
  }
  async drainStartingServers(): Promise<void> {
    while (this.startingServers.size > 0)
      await Promise.allSettled(
        Array.from(new Set(this.startingServers.values())),
      );
  }
  shutdownAllSync(): void {
    for (const server of this.languageConfigs.values())
      if (server.client)
        try {
          void server.client.shutdown();
        } catch {}
  }
  getServerInstance(language: string): LSPServerInstance | undefined {
    return this.languageConfigs.get(language);
  }
  async warmup(languages?: string[]): Promise<void> {
    const requested = languages ?? Array.from(this.languageConfigs.keys());
    if (requested.length === 0)
      return void this.logger.info("No LSP servers to warm up");
    this.logger.info(
      `Warming up LSP servers for languages: ${requested.join(", ")}`,
    );
    const pending: Promise<void>[] = [];
    for (const language of requested) {
      const server = this.languageConfigs.get(language);
      if (!server) {
        this.logger.warn(
          `Language '${language}' not registered, skipping warmup`,
        );
        continue;
      }
      if (server.status === LSPServerStatus.Stopped)
        pending.push(
          this.startServerSafe(server).catch((error) =>
            this.logger.warn(
              `Failed to warmup LSP server for '${language}': ${error}`,
            ),
          ),
        );
      else
        this.logger.debug(
          `LSP server for '${language}' already in status '${server.status}', skipping warmup`,
        );
    }
    await Promise.all(pending);
    this.logger.info("LSP server warmup completed");
  }
  isServerRunning(language: string): boolean {
    const server = this.languageConfigs.get(language);
    return (
      server?.status === LSPServerStatus.Running &&
      server?.client?.isRunning() === true
    );
  }
}
