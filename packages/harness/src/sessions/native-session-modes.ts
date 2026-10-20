// Fixed Desktop coordinator sample. Complete declarations with TS-only annotations.
export const SESSION_MODES_SHA256 =
  "8624215504229c4b6190f5c2172da270e015cc96871e90b261786f047e4c6e78";
export const SESSION_MODE_FUNCTIONS = [
  ["resolveModeTools", 1061311, 1061450],
  ["normalizeSessionSandboxDisabledReason", 1061746, 1061907],
  ["isSessionWelcomeMode", 1063287, 1063403],
  ["cloneDesiredConfig", 1063536, 1063612],
  ["cloneResolvedRuntimeConfig", 1063613, 1063697],
  ["normalizeSceneMode", 1063698, 1063849],
  ["normalizeWelcomeMode", 1064333, 1064522],
  ["toLegacySourceMode", 1064523, 1064679],
  ["normalizePermissionMode", 1064680, 1064878],
  ["normalizeNonPlanPermissionMode", 1064879, 1065046],
  ["normalizeRuntimeIdentity", 1065047, 1065178],
  ["normalizeSessionSettings", 1065179, 1065334],
  ["normalizeStringArray", 1065335, 1065461],
  ["normalizeAddonSelection", 1065462, 1066601],
  ["normalizeDesiredConfig", 1066602, 1067738],
  ["buildSessionRestartFingerprint", 1068202, 1068635],
  ["buildFallbackRuntimeConfig", 1068636, 1069829],
  ["resolveDefaultPermissionMode", 1069830, 1069934],
  ["resolveDefaultTools", 1069935, 1070005],
] as const;
export const SESSION_MODE_CLASSES = [
  ["DefaultModeHandler", 1070369, 1071833],
  ["ExpertModeHandler", 1072148, 1073261],
  ["ModeService", 1073595, 1074401],
] as const;
export const SESSION_MODE_CONSTANTS = [
  ["CRAFT_TOOLS", 1060268, 1060870],
  ["PLAN_TOOLS", 1060871, 1060943],
  ["MODE_TOOLS_CONFIG", 1060944, 1061310],
  ["SESSION_SANDBOX_DISABLED_REASONS", 1061586, 1061745],
  ["SESSION_WELCOME_MODES", 1062959, 1063019],
  ["DEFAULT_MODE_PERMISSION_CONFIG", 1063404, 1063535],
] as const;
export function createNativeSessionModes() {
  var CRAFT_TOOLS: any = [
    "Read",
    "Write",
    "Edit",
    "MultiEdit",
    "Glob",
    "Grep",
    "Bash",
    "PowerShell",
    "TaskCreate",
    "TaskGet",
    "TaskUpdate",
    "TaskList",
    "TaskStop",
    "TaskOutput",
    "WebFetch",
    "WebSearch",
    "Skill",
    "SkillManage",
    "AskUserQuestion",
    "Defer(LSP)",
    "Defer(ImageGen)",
    "Defer(VideoGen)",
    "Agent",
    "Defer(TeamCreate)",
    "Defer(TeamDelete)",
    "SendMessage",
    "ToolSearch",
    "DeferExecuteTool",
    "read_me",
    "show_widget",
    "present_files",
    "automation_update",
    "Defer(conversation_search)",
    "Defer(workbuddy_cloudstudio_deploy)",
    "ListMcpResources",
    "ReadMcpResource",
  ];
  var PLAN_TOOLS: any = [...CRAFT_TOOLS, "EnterPlanMode", "ExitPlanMode"];
  var MODE_TOOLS_CONFIG: any = {
    craft: CRAFT_TOOLS.join(","),
    ask: [
      "Read",
      "AskUserQuestion",
      "WebFetch",
      "WebSearch",
      "Glob",
      "Grep",
      "read_me",
      "show_widget",
      "present_files",
      "automation_update",
      "Defer(conversation_search)",
      "ListMcpResources",
      "ReadMcpResource",
    ].join(","),
    plan: PLAN_TOOLS.join(","),
    expert: PLAN_TOOLS.join(","),
  };
  function resolveModeTools(mode: any): any {
    if (!mode) return MODE_TOOLS_CONFIG.craft;
    return MODE_TOOLS_CONFIG[mode] ?? MODE_TOOLS_CONFIG.craft;
  }
  var SESSION_SANDBOX_DISABLED_REASONS: any = [
    "security-center-setting-disabled",
    "session-local-environment-selected",
    "background-automation-no-approval-ui",
  ];
  function normalizeSessionSandboxDisabledReason(value: any): any {
    return typeof value === "string" &&
      SESSION_SANDBOX_DISABLED_REASONS.includes(value)
      ? value
      : void 0;
  }
  var SESSION_WELCOME_MODES: any = ["code", "work", "design"];
  function isSessionWelcomeMode(value: any): any {
    return typeof value === "string" && SESSION_WELCOME_MODES.includes(value);
  }
  var DEFAULT_MODE_PERMISSION_CONFIG: any = {
    craft: "bypassPermissions",
    ask: "default",
    plan: "plan",
    expert: "bypassPermissions",
  };
  function cloneDesiredConfig(config: any): any {
    return config ? { ...config } : {};
  }
  function cloneResolvedRuntimeConfig(config: any): any {
    return config ? { ...config } : {};
  }
  function normalizeSceneMode(mode: any): any {
    switch (mode) {
      case "craft":
      case "ask":
      case "plan":
      case "expert":
        return mode;
      default:
        return;
    }
  }
  function normalizeWelcomeMode(mode: any): any {
    if (isSessionWelcomeMode(mode)) return mode;
    switch (mode) {
      case "coding":
        return "code";
      case "working":
        return "work";
      default:
        return;
    }
  }
  function toLegacySourceMode(mode: any): any {
    switch (mode) {
      case "code":
        return "coding";
      case "work":
        return "working";
      case "design":
        return "design";
    }
  }
  function normalizePermissionMode(mode: any): any {
    switch (mode) {
      case "acceptEdits":
      case "bypassPermissions":
      case "fullAccess":
      case "default":
      case "plan":
        return mode;
      default:
        return;
    }
  }
  function normalizeNonPlanPermissionMode(mode: any): any {
    const normalized: any = normalizePermissionMode(mode);
    return normalized && normalized !== "plan" ? normalized : void 0;
  }
  function normalizeRuntimeIdentity(identity: any): any {
    return typeof identity === "string" && identity.trim() !== ""
      ? identity
      : void 0;
  }
  function normalizeSessionSettings(settings: any): any {
    if (!settings || typeof settings !== "object" || Array.isArray(settings))
      return;
    return { ...settings };
  }
  function normalizeStringArray(value: any): any {
    return Array.isArray(value)
      ? value.filter((item: any) => typeof item === "string")
      : [];
  }
  function normalizeAddonSelection(selection: any): any {
    if (!selection || typeof selection !== "object" || Array.isArray(selection))
      return;
    const input: any = selection;
    if (input.version !== 1 || typeof input.interactionMode !== "string")
      return;
    const projectResources: any =
      input.projectResources && typeof input.projectResources === "object"
        ? input.projectResources
        : void 0;
    const welcomeMode: any = normalizeWelcomeMode(input.welcomeMode);
    return {
      version: 1,
      ...(welcomeMode ? { welcomeMode } : {}),
      interactionMode: input.interactionMode,
      microSceneIds: normalizeStringArray(input.microSceneIds),
      enabledPluginIds: normalizeStringArray(input.enabledPluginIds),
      promptContentBlockCount:
        typeof input.promptContentBlockCount === "number"
          ? input.promptContentBlockCount
          : 0,
      resourceLinkCount:
        typeof input.resourceLinkCount === "number"
          ? input.resourceLinkCount
          : 0,
      projectResources: {
        connectorSkillIds: normalizeStringArray(
          projectResources?.connectorSkillIds,
        ),
        mcpServerNames: normalizeStringArray(projectResources?.mcpServerNames),
        projectSkillNames: normalizeStringArray(
          projectResources?.projectSkillNames,
        ),
      },
    };
  }
  function normalizeDesiredConfig(config: any): any {
    const rawPermissionMode: any = normalizePermissionMode(
      config.permissionMode,
    );
    const normalizedPermissionMode: any =
      config.mode === "plan"
        ? "plan"
        : rawPermissionMode === "plan"
          ? (normalizeNonPlanPermissionMode(config.permissionModeBeforePlan) ??
            "bypassPermissions")
          : rawPermissionMode;
    return {
      mode: normalizeSceneMode(config.mode),
      expertId: config.expertId,
      expertMarketplace: config.expertMarketplace,
      locale: config.locale,
      runtimeIdentity: normalizeRuntimeIdentity(config.runtimeIdentity),
      model: config.model,
      systemPrompt: config.systemPrompt,
      tools: config.tools,
      permissionMode: normalizedPermissionMode,
      permissionModeBeforePlan: normalizeNonPlanPermissionMode(
        config.permissionModeBeforePlan,
      ),
      useSandboxCLI: config.useSandboxCLI,
      sandboxDisabledReason:
        config.useSandboxCLI === false
          ? normalizeSessionSandboxDisabledReason(config.sandboxDisabledReason)
          : void 0,
      welcomeMode: normalizeWelcomeMode(config.welcomeMode),
      sessionSettings: normalizeSessionSettings(config.sessionSettings),
      addonSelection: normalizeAddonSelection(config.addonSelection),
    };
  }
  function buildSessionRestartFingerprint(input: any): any {
    return JSON.stringify({
      v: 1,
      mode: input.mode,
      expertId: input.expertId,
      expertMarketplace: input.expertMarketplace,
      locale: input.locale,
      runtimeIdentity: input.runtimeIdentity,
      explicitSystemPrompt: input.explicitSystemPrompt,
      tools: input.tools,
      welcomeMode: input.welcomeMode,
      cwd: input.cwd,
      permissionModeBeforePlan: input.permissionModeBeforePlan,
    });
  }
  function buildFallbackRuntimeConfig(desiredConfig: any): any {
    const runtimeIdentity: any = normalizeRuntimeIdentity(
      desiredConfig.runtimeIdentity,
    );
    const tools: any =
      desiredConfig.tools ?? resolveDefaultTools(desiredConfig.mode);
    return {
      model: desiredConfig.model,
      systemPrompt: desiredConfig.systemPrompt,
      restartFingerprint: buildSessionRestartFingerprint({
        mode: desiredConfig.mode ?? "craft",
        expertId: desiredConfig.expertId,
        expertMarketplace: desiredConfig.expertMarketplace,
        locale: desiredConfig.locale,
        runtimeIdentity,
        explicitSystemPrompt: desiredConfig.systemPrompt,
        tools,
        welcomeMode: desiredConfig.welcomeMode,
        cwd: void 0,
        permissionModeBeforePlan: desiredConfig.permissionModeBeforePlan,
      }),
      tools,
      permissionMode:
        desiredConfig.permissionMode ??
        resolveDefaultPermissionMode(desiredConfig.mode),
      ...(desiredConfig.permissionModeBeforePlan
        ? { permissionModeBeforePlan: desiredConfig.permissionModeBeforePlan }
        : {}),
      ...(runtimeIdentity ? { runtimeIdentity } : {}),
      ...(desiredConfig.welcomeMode
        ? { welcomeMode: desiredConfig.welcomeMode }
        : {}),
      ...(desiredConfig.sessionSettings
        ? { sessionSettings: desiredConfig.sessionSettings }
        : {}),
    };
  }
  function resolveDefaultPermissionMode(mode: any): any {
    return DEFAULT_MODE_PERMISSION_CONFIG[mode ?? "craft"];
  }
  function resolveDefaultTools(mode: any): any {
    return resolveModeTools(mode);
  }
  var DefaultModeHandler: any = class {
    [key: string]: any;
    modes: any = ["craft", "ask", "plan"];
    constructor(promptRenderer: any, options: any) {
      this.promptRenderer = promptRenderer;
      this.options = options;
    }
    async resolve(input: any): Promise<any> {
      const requestedMode: any = input.mode ?? "craft";
      const promptMode: any =
        requestedMode === "plan" ? "craft" : requestedMode;
      const toolsMode: any = requestedMode;
      const promptOptions: any = {
        mode: promptMode,
        expertId: input.expertId,
        expertMarketplace: input.expertMarketplace,
        locale: input.locale,
        modelId: input.model,
        cwd: input.cwd,
        conversationId: input.sessionId,
        welcomeMode: normalizeWelcomeMode(input.welcomeMode),
      };
      const systemPrompt: any =
        input.systemPrompt ??
        (await this.promptRenderer.renderSystemPrompt(promptOptions));
      const promptContextVariables: any =
        await this.promptRenderer.collectSystemPromptVariables?.(promptOptions);
      const explicitPermissionMode: any = normalizePermissionMode(
        input.permissionMode,
      );
      const result: any = {
        tools: resolveModeTools(toolsMode),
        permissionMode:
          explicitPermissionMode === "plan"
            ? "plan"
            : requestedMode === "plan"
              ? "plan"
              : (explicitPermissionMode ??
                resolveDefaultPermissionMode(promptMode)),
      };
      if (systemPrompt) result.systemPrompt = systemPrompt;
      if (
        promptContextVariables &&
        Object.keys(promptContextVariables).length > 0
      )
        result.promptContextVariables = promptContextVariables;
      if (this.options?.mcpConfig) result.mcpConfig = this.options.mcpConfig;
      return result;
    }
  };
  var ExpertModeHandler: any = class {
    [key: string]: any;
    modes: any = ["expert"];
    constructor(promptRenderer: any) {
      this.promptRenderer = promptRenderer;
    }
    async resolve(input: any): Promise<any> {
      if (!input.expertId)
        throw new Error("expertId is required for expert mode");
      const promptOptions: any = {
        mode: "expert",
        expertId: input.expertId,
        expertMarketplace: input.expertMarketplace,
        locale: input.locale,
        modelId: input.model,
        cwd: input.cwd,
        conversationId: input.sessionId,
        welcomeMode: normalizeWelcomeMode(input.welcomeMode),
      };
      const systemPrompt: any =
        input.systemPrompt ??
        (await this.promptRenderer.renderSystemPrompt(promptOptions));
      const promptContextVariables: any =
        await this.promptRenderer.collectSystemPromptVariables?.(promptOptions);
      const result: any = {
        tools: resolveModeTools("expert"),
        permissionMode:
          normalizePermissionMode(input.permissionMode) ??
          resolveDefaultPermissionMode("expert"),
      };
      if (systemPrompt) result.systemPrompt = systemPrompt;
      if (
        promptContextVariables &&
        Object.keys(promptContextVariables).length > 0
      )
        result.promptContextVariables = promptContextVariables;
      return result;
    }
  };
  var ModeService: any = class {
    [key: string]: any;
    handlers: any;
    constructor(promptRenderer: any, logger: any, defaultModeOptions: any) {
      this.logger = logger;
      this.handlers = [
        new DefaultModeHandler(promptRenderer, defaultModeOptions),
        new ExpertModeHandler(promptRenderer),
      ];
    }
    async resolveOptions(options: any): Promise<any> {
      const mode: any = options.mode ?? "craft";
      const handler: any = this.handlers.find((h: any) =>
        h.modes.includes(mode),
      );
      if (!handler) {
        this.logger.warn(
          `[ModeService] No handler found for mode "${mode}", using raw options`,
        );
        return options;
      }
      const modeConfig: any = await handler.resolve(options);
      const merged: any = { ...modeConfig };
      for (const [key, value] of Object.entries(options))
        if (value !== void 0) merged[key] = value;
      if (modeConfig.mcpConfig !== void 0)
        merged.mcpConfig = modeConfig.mcpConfig;
      return merged;
    }
  };
  return {
    CRAFT_TOOLS,
    PLAN_TOOLS,
    MODE_TOOLS_CONFIG,
    resolveModeTools,
    SESSION_SANDBOX_DISABLED_REASONS,
    normalizeSessionSandboxDisabledReason,
    SESSION_WELCOME_MODES,
    isSessionWelcomeMode,
    DEFAULT_MODE_PERMISSION_CONFIG,
    cloneDesiredConfig,
    cloneResolvedRuntimeConfig,
    normalizeSceneMode,
    normalizeWelcomeMode,
    toLegacySourceMode,
    normalizePermissionMode,
    normalizeNonPlanPermissionMode,
    normalizeRuntimeIdentity,
    normalizeSessionSettings,
    normalizeStringArray,
    normalizeAddonSelection,
    normalizeDesiredConfig,
    buildSessionRestartFingerprint,
    buildFallbackRuntimeConfig,
    resolveDefaultPermissionMode,
    resolveDefaultTools,
    DefaultModeHandler,
    ExpertModeHandler,
    ModeService,
  };
}
