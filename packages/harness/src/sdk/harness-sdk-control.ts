import type { createSdkControlHost } from "./sdk-control-host.js";
/** Standalone composition only. Product refresh/env/SDK MCP transports remain explicit dependencies. */
export function attachHarnessSdkControl(
  host: ReturnType<typeof createSdkControlHost>,
  services: {
    sessions: any;
    agents: any;
    commands: any;
    product: any;
    plans: any;
    settings: any;
    cliSettings: any;
    logger?: any;
    initializeDependencies?: Record<string, any>;
  },
) {
  const logger = Object.fromEntries(
    ["info", "debug", "warn", "error"].map((name) => [
      name,
      (...args: any[]) => services.logger?.[name]?.(...args),
    ]),
  );
  const unavailable = (name: string): never => {
    throw Error(`SDK initialize host dependency is not configured: ${name}`);
  };
  const capabilities = new Set<string>();
  const initializer = Object.assign(new host.classes.InitializeHandler(), {
    sdkHooksManager: host.hooks,
    sdkInitializeState: host.initializeState,
    commandManager: services.commands,
    agentManager: services.agents,
    outputStyleManager: {
      async getAllOutputStyles() {
        return services.product.raw.outputStyles ?? [];
      },
    },
    settingsManager: services.settings,
    authManager: { currentSessionSubject: { getValue: () => undefined } },
    hostCapabilityProvider: {
      markElicitationForm: () => capabilities.add("elicitationForm"),
      markWeixinpayInterception: () =>
        capabilities.add("weixinpayInterception"),
    },
    productManager: { sync: async () => unavailable("ProductManager.sync") },
    productEnvService: {
      switch: async () => unavailable("ProductEnvironment.switch"),
    },
    mcpReadyService: { async waitForServersReady() {} },
    mcpManager: {
      add: async () => unavailable("McpManager.add SDK transport"),
    },
    ...services.initializeDependencies,
  });
  const handleInitialize = initializer.handle.bind(initializer);
  initializer.handle = (message: any, signal: AbortSignal) => {
    const request = message.request;
    if (
      (request.systemPrompt ||
        request.appendSystemPrompt ||
        (request.agents && Object.keys(request.agents).length)) &&
      !services.initializeDependencies?.productManager
    )
      return Promise.reject(
        Error(
          "SDK initialization overrides require the original ProductManager refresh adapter",
        ),
      );
    return handleInitialize(message, signal);
  };
  const modes = new host.classes.GetAvailableModesHandler(),
    models = Object.assign(new host.classes.GetAvailableModelsHandler(), {
      agentManager: services.agents,
    }),
    permissionMode = Object.assign(
      new host.classes.SetPermissionModeHandler(),
      {
        sessionManager: services.sessions,
        planStorageService: services.plans,
        logger,
      },
    ),
    model = Object.assign(new host.classes.SetModelHandler(), {
      sessionManager: services.sessions,
      cliSettingsProvider: services.cliSettings,
      logger,
    });
  host.addHandlers(initializer, modes, models, permissionMode, model);
  return { initializer, modes, models, permissionMode, model, capabilities };
}
