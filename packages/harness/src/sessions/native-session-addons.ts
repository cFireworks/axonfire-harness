// Fixed Desktop initialize sample. No application bootstrap is executed.
import * as node_crypto from "node:crypto";
import * as node_path from "node:path";
import * as nodeFs from "node:fs";
import * as nodeOs from "node:os";
import { createNativeSessionModes } from "./native-session-modes.js";
export const SESSION_ADDONS_SHA256 =
  "528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19";
export const SESSION_ADDON_FUNCTIONS = [
  ["isRecord$14", 226014, 226116],
  ["hasPersistedV1Shape", 226117, 226721],
  ["normalizeString$4", 226722, 226886],
  ["normalizeStringArray$2", 226887, 227059],
  ["normalizeEnabledPlugins", 227060, 227399],
  ["normalizeMarketplaceConfig", 227400, 228084],
  ["normalizeMarketplaces", 228085, 228421],
  ["createEmptySessionPluginContext", 228422, 228720],
  ["normalizeSessionPluginContext", 228721, 229620],
  ["parseSessionPluginContextJson", 229621, 229845],
  ["serializeSessionPluginContext", 229846, 229994],
  ["createMicroScenePack", 4545481, 4546002],
  ["skillItem", 4546122, 4546389],
  ["mcpItem", 4546390, 4546686],
  ["createUserProjectResourcePack", 4546687, 4547192],
  ["toBuiltinPluginId", 4547744, 4547846],
  ["pluginItem$1", 4547847, 4548123],
  ["mcpDependencyItem", 4548124, 4548445],
  ["resolveWorkModePack", 4548446, 4549881],
  ["resolveInteractionModeForPrompt", 4549989, 4550259],
  ["resolveAddonPacks", 4550260, 4551762],
  ["readRecord", 4552032, 4552148],
  ["mergeEnabledPlugins", 4552149, 4552708],
  ["buildAddonComposeRestartFingerprint", 4552709, 4552936],
  ["parseToolNames", 4552937, 4553071],
  ["readSessionSettingsSummary", 4553072, 4553561],
  ["compactUnique", 4553562, 4553698],
  ["isWorkbuddyWorkModePluginId", 4553699, 4554002],
  ["expandSessionRuntimeConfig", 4554003, 4555343],
  ["applySessionAddonExpansionToRuntimeConfig", 4555344, 4555763],
  ["makeEmptyAddons", 4555874, 4556039],
  ["addonBucketForType", 4556040, 4556388],
  ["pushAddon", 4556389, 4556699],
  ["inferPluginSource", 4556700, 4557016],
  ["pluginItem", 4557017, 4557284],
  ["composeSessionAddons", 4557285, 4560157],
  ["summarizeText", 4560268, 4560394],
  ["sha256", 4560395, 4560496],
  ["stableJsonStringify$2", 4560497, 4560931],
  ["buildManifestHash", 4560932, 4561043],
  ["buildSessionAddonManifest", 4561044, 4561617],
  ["isRecord$4", 4566238, 4566339],
  ["filterDerivedPluginIds", 4566340, 4566473],
  ["projectSessionPluginContext", 4566474, 4567415],
  ["buildAddonSelectionFromPluginContext", 4567416, 4568022],
  ["buildSessionSettingsFromPluginContext", 4568023, 4568691],
  ["formatLogDetailsSuffix", 4543513, 4543694],
  ["safeStringifyLogDetails", 4543695, 4544168],
  ["serializeLogErrorForDetails", 4544169, 4544591],
  ["serializeLogErrorCauseForDetails", 4544592, 4544739],
  ["sanitizeLogDetailValue", 4544740, 4545360],
  ["isClawRuntimeCwd", 4804891, 4805126],
  ["withSessionEnabledPluginSetting", 4805257, 4805650],
  ["normalizePromptContextVariables", 4805651, 4805932],
  ["summarizePromptContextVariables", 4805933, 4806152],
  ["summarizeSystemPrompt", 4806153, 4806322],
  ["logResolverInfo", 4806615, 4806731],
  ["createSessionRuntimeConfigResolver", 4806732, 4810465],
  ["normalizeBackendPermissionMode$1", 5416143, 5416285],
  ["shouldSuppressLegacySystemPrompt", 5416286, 5416524],
  ["shouldSuppressLegacyTools", 5416525, 5416748],
  ["buildAgentCliRuntimeArgs", 5416749, 5418332],
  ["classifyErrno", 4541207, 4541404],
  ["assertSessionCwdUsable", 4542308, 4543431],
  ["createAgentCliPromptVarsRestoreFailedError", 5418589, 5418895],
  ["writeAgentCliSystemPromptFile", 5418896, 5419260],
  ["getAgentCliPromptVarsFilePath", 5419261, 5419414],
  ["writeAgentCliPromptVarsFile", 5419415, 5419785],
  ["ensureAgentCliPromptVarsFile", 5420020, 5421687],
  ["inspectAgentCliPromptVarsFile", 5421688, 5422864],
  ["areAgentCliPromptVariablesEqual", 5422865, 5423171],
  ["cleanupAgentCliTempFile", 5423172, 5423293],
  ["cleanupAgentCliSystemPromptFile", 5423294, 5423384],
  ["cleanupAgentCliPromptVarsFile", 5423385, 5423473],
] as const;
export const SESSION_ADDON_CLASSES = [
  ["SessionCwdUnavailableError", 4540512, 4540724],
] as const;
export const SESSION_ADDON_CONSTANTS = [
  ["WORKBUDDY_BUILTIN_MARKETPLACE$1", 4547304, 4547362],
  ["WELCOME_MODE_PLUGIN_NAMES", 4547363, 4547483],
  ["INTERACTION_MODE_PLUGIN_NAMES", 4547484, 4547651],
  ["PROMPT_COMMON_PLUGIN_NAME", 4547652, 4547700],
  ["NETDRIVE_MCP_SERVER_NAME", 4547701, 4547743],
  ["WORKBUDDY_BUILTIN_MARKETPLACE", 4551873, 4551929],
  ["WORKBUDDY_WORK_MODE_PLUGIN_PREFIXES", 4551930, 4552031],
  ["WEIXINPAY_BUILTIN_PLUGIN_ID", 4804661, 4804725],
  ["WORKBUDDY_AGENT_ALLOWED_TOOLS", 5415853, 5416024],
  ["VALID_PERMISSION_MODES$1", 5416025, 5416142],
  ["SESSION_CWD_UNAVAILABLE", 4540160, 4540216],
  ["AGENT_CLI_PROMPT_VARS_RESTORE_FAILED_CODE", 5418534, 5418588],
] as const;
export const SESSION_ADDON_RESOLVE_MEMBER = [4767659, 4768528] as const;
export function createNativeSessionAddons(runtime: any = {}) {
  const node_fs = runtime.fs ?? nodeFs,
    node_os = runtime.os ?? nodeOs,
    Date: any = runtime.Date ?? globalThis.Date,
    require_workbuddy_auth_product_coordinator: any =
      runtime.modes ?? createNativeSessionModes();
  const resolveClawCwd =
    runtime.resolveClawCwd ??
    (() => {
      throw Error("Claw workspace resolver not configured");
    });
  function isRecord$14(value: any): any {
    return !!value && typeof value === "object" && !Array.isArray(value);
  }
  function hasPersistedV1Shape(value: any): any {
    if (!isRecord$14(value) || value.version !== 1) return false;
    const projectResources: any = value.projectResources;
    const pluginSettings: any = value.pluginSettings;
    return (
      Array.isArray(value.selectedPluginIds) &&
      Array.isArray(value.microSceneIds) &&
      isRecord$14(projectResources) &&
      Array.isArray(projectResources.connectorSkillIds) &&
      Array.isArray(projectResources.mcpServerNames) &&
      Array.isArray(projectResources.projectSkillNames) &&
      isRecord$14(pluginSettings) &&
      isRecord$14(pluginSettings.enabledPlugins) &&
      isRecord$14(pluginSettings.extraKnownMarketplaces)
    );
  }
  function normalizeString$4(value: any): any {
    if (typeof value !== "string") return;
    const normalized: any = value.trim();
    return normalized.length > 0 ? normalized : void 0;
  }
  function normalizeStringArray$2(value: any): any {
    if (!Array.isArray(value)) return [];
    return Array.from(
      new Set(value.map(normalizeString$4).filter((item: any) => !!item)),
    ).sort();
  }
  function normalizeEnabledPlugins(value: any): any {
    if (!isRecord$14(value)) return {};
    const entries: any = Object.entries(value)
      .map(([pluginId, enabled]: any) => [pluginId.trim(), enabled])
      .filter(
        (entry: any) => entry[0].length > 0 && typeof entry[1] === "boolean",
      )
      .sort(([left]: any, [right]: any) => left.localeCompare(right));
    return Object.fromEntries(entries);
  }
  function normalizeMarketplaceConfig(value: any): any {
    if (!isRecord$14(value)) return;
    const source: any = value.source;
    if (
      source !== "github" &&
      source !== "git" &&
      source !== "url" &&
      source !== "zip"
    )
      return;
    const repo: any = normalizeString$4(value.repo);
    const url: any = normalizeString$4(value.url);
    const metaUrl: any = normalizeString$4(value.metaUrl);
    const versionUrl: any = normalizeString$4(value.versionUrl);
    const autoUpdate: any =
      typeof value.autoUpdate === "boolean" ? value.autoUpdate : void 0;
    return {
      source,
      ...(repo ? { repo } : {}),
      ...(url ? { url } : {}),
      ...(metaUrl ? { metaUrl } : {}),
      ...(autoUpdate !== void 0 ? { autoUpdate } : {}),
      ...(versionUrl ? { versionUrl } : {}),
    };
  }
  function normalizeMarketplaces(value: any): any {
    if (!isRecord$14(value)) return {};
    const entries: any = Object.entries(value)
      .map(([name, config]: any) => [
        name.trim(),
        normalizeMarketplaceConfig(config),
      ])
      .filter((entry: any) => entry[0].length > 0 && !!entry[1])
      .sort(([left]: any, [right]: any) => left.localeCompare(right));
    return Object.fromEntries(entries);
  }
  function createEmptySessionPluginContext(): any {
    return {
      version: 1,
      selectedPluginIds: [],
      microSceneIds: [],
      projectResources: {
        connectorSkillIds: [],
        mcpServerNames: [],
        projectSkillNames: [],
      },
      pluginSettings: {
        enabledPlugins: {},
        extraKnownMarketplaces: {},
      },
    };
  }
  function normalizeSessionPluginContext(value: any): any {
    if (!isRecord$14(value) || value.version !== 1) return;
    const projectResources: any = isRecord$14(value.projectResources)
      ? value.projectResources
      : {};
    const pluginSettings: any = isRecord$14(value.pluginSettings)
      ? value.pluginSettings
      : {};
    return {
      version: 1,
      selectedPluginIds: normalizeStringArray$2(value.selectedPluginIds),
      microSceneIds: normalizeStringArray$2(value.microSceneIds),
      projectResources: {
        connectorSkillIds: normalizeStringArray$2(
          projectResources.connectorSkillIds,
        ),
        mcpServerNames: normalizeStringArray$2(projectResources.mcpServerNames),
        projectSkillNames: normalizeStringArray$2(
          projectResources.projectSkillNames,
        ),
      },
      pluginSettings: {
        enabledPlugins: normalizeEnabledPlugins(pluginSettings.enabledPlugins),
        extraKnownMarketplaces: normalizeMarketplaces(
          pluginSettings.extraKnownMarketplaces,
        ),
      },
    };
  }
  function parseSessionPluginContextJson(value: any): any {
    if (!value) return;
    try {
      const parsed: any = JSON.parse(value);
      return hasPersistedV1Shape(parsed)
        ? normalizeSessionPluginContext(parsed)
        : void 0;
    } catch {
      return;
    }
  }
  function serializeSessionPluginContext(value: any): any {
    return JSON.stringify(
      normalizeSessionPluginContext(value) ?? createEmptySessionPluginContext(),
    );
  }
  function createMicroScenePack(microSceneIds: any): any {
    return {
      id: "micro-scene:selection",
      source: "micro_scene",
      pluginIds: [],
      items: microSceneIds.map((sceneId: any) => ({
        id: `micro-scene:${sceneId}`,
        type: "plugin",
        source: "micro_scene",
        surfaces: ["runtime_only"],
        payloadSummary: { sceneId },
        provenance: {
          packId: "micro-scene:selection",
          channel: "addonSelection.microSceneIds",
        },
      })),
      validationWarnings:
        microSceneIds.length > 0 ? ["micro_scene_plugin_ids_unresolved"] : [],
    };
  }
  function skillItem(id: any, channel: any, payloadKey: any): any {
    return {
      id: `skill:${id}`,
      type: "skill",
      source: "runtime_only",
      surfaces: ["available_skills"],
      payloadSummary: { [payloadKey]: id },
      provenance: {
        packId: "user:project-resources",
        channel,
      },
    };
  }
  function mcpItem(serverName: any): any {
    return {
      id: `mcp:${serverName}`,
      type: "mcp",
      source: "runtime_only",
      surfaces: ["runtime_only"],
      payloadSummary: { serverName },
      provenance: {
        packId: "user:project-resources",
        channel: "addonSelection.projectResources.mcpServerNames",
      },
    };
  }
  function createUserProjectResourcePack(resources: any): any {
    return {
      id: "user:project-resources",
      source: "runtime_only",
      pluginIds: [],
      items: [
        ...resources.connectorSkillIds.map((skillId: any) =>
          skillItem(
            skillId,
            "addonSelection.projectResources.connectorSkillIds",
            "skillId",
          ),
        ),
        ...resources.projectSkillNames.map((skillName: any) =>
          skillItem(
            skillName,
            "addonSelection.projectResources.projectSkillNames",
            "skillName",
          ),
        ),
        ...resources.mcpServerNames.map(mcpItem),
      ],
      validationWarnings: [],
    };
  }
  var WORKBUDDY_BUILTIN_MARKETPLACE$1: any = "workbuddy-builtin";
  var WELCOME_MODE_PLUGIN_NAMES: any = {
    code: "welcomemode-code",
    work: "welcomemode-work",
    design: "welcomemode-design",
  };
  var INTERACTION_MODE_PLUGIN_NAMES: any = {
    ask: "interactionmode-ask",
    craft: "interactionmode-craft",
    expert: "interactionmode-expert",
    plan: "interactionmode-plan",
  };
  var PROMPT_COMMON_PLUGIN_NAME: any = "prompt-common";
  var NETDRIVE_MCP_SERVER_NAME: any = "netdrive";
  function toBuiltinPluginId(pluginName: any): any {
    return `${pluginName}@${WORKBUDDY_BUILTIN_MARKETPLACE$1}`;
  }
  function pluginItem$1(pluginId: any, role: any, packId: any): any {
    return {
      id: `plugin:${pluginId}`,
      type: "plugin",
      source: "work_mode",
      surfaces: ["runtime_only"],
      payloadSummary: {
        pluginId,
        role,
      },
      provenance: {
        packId,
        channel: "addonRegistry.workMode",
      },
    };
  }
  function mcpDependencyItem(
    serverName: any,
    packId: any,
    dependencyOf: any,
  ): any {
    return {
      id: `mcp:${serverName}`,
      type: "mcp",
      source: "work_mode",
      surfaces: ["runtime_only"],
      payloadSummary: {
        serverName,
        dependencyOf,
      },
      provenance: {
        packId,
        channel: "addonRegistry.workMode.welcomeModeDependencies",
      },
    };
  }
  function resolveWorkModePack({ welcomeMode, interactionMode }: any): any {
    const mode: any = interactionMode || "craft";
    const welcomeModePluginName: any = welcomeMode
      ? WELCOME_MODE_PLUGIN_NAMES[welcomeMode]
      : void 0;
    const interactionPluginName: any = INTERACTION_MODE_PLUGIN_NAMES[mode];
    const welcomeModeId: any = welcomeModePluginName
      ? toBuiltinPluginId(welcomeModePluginName)
      : void 0;
    const interactionModePluginId: any = interactionPluginName
      ? toBuiltinPluginId(interactionPluginName)
      : void 0;
    const promptCommonPluginId: any = toBuiltinPluginId(
      PROMPT_COMMON_PLUGIN_NAME,
    );
    const id: any = `work-mode:${welcomeMode ?? "default"}:${mode}`;
    const validationWarnings: any = [
      ...(welcomeMode && !welcomeModePluginName
        ? [`unknown_welcome_mode:${welcomeMode}`]
        : []),
      ...(!interactionPluginName ? [`unknown_interaction_mode:${mode}`] : []),
    ];
    return {
      id,
      source: "work_mode",
      pluginIds: [
        ...(welcomeModeId ? [welcomeModeId] : []),
        ...(interactionModePluginId ? [interactionModePluginId] : []),
        promptCommonPluginId,
      ],
      welcomeModeId,
      interactionModePluginId,
      promptCommonPluginId,
      items: [
        ...(welcomeModeId
          ? [pluginItem$1(welcomeModeId, "welcome_mode", id)]
          : []),
        ...(welcomeModeId
          ? [mcpDependencyItem(NETDRIVE_MCP_SERVER_NAME, id, welcomeModeId)]
          : []),
        ...(interactionModePluginId
          ? [pluginItem$1(interactionModePluginId, "interaction_mode", id)]
          : []),
        pluginItem$1(promptCommonPluginId, "prompt_common", id),
      ],
      validationWarnings,
    };
  }
  function resolveInteractionModeForPrompt({ desiredConfig }: any): any {
    const interactionMode: any =
      desiredConfig.addonSelection?.interactionMode ??
      desiredConfig.mode ??
      "craft";
    if (desiredConfig.expertId && interactionMode === "craft") return "expert";
    return interactionMode;
  }
  function resolveAddonPacks({ desiredConfig, runtimeConfig }: any): any {
    const selection: any = desiredConfig.addonSelection;
    const welcomeMode: any =
      selection?.welcomeMode ??
      desiredConfig.welcomeMode ??
      runtimeConfig.welcomeMode;
    const interactionMode: any = resolveInteractionModeForPrompt({
      desiredConfig,
    });
    const microSceneIds: any = selection?.microSceneIds ?? [];
    const enabledPluginIds: any = selection?.enabledPluginIds ?? [];
    const projectResources: any = selection?.projectResources ?? {
      connectorSkillIds: [],
      mcpServerNames: [],
      projectSkillNames: [],
    };
    const workModePack: any = resolveWorkModePack({
      welcomeMode,
      interactionMode,
    });
    const microScenePack: any = createMicroScenePack(microSceneIds);
    const userProjectResourcePack: any =
      createUserProjectResourcePack(projectResources);
    const validationWarnings: any = [
      ...workModePack.validationWarnings,
      ...microScenePack.validationWarnings,
      ...userProjectResourcePack.validationWarnings,
    ];
    return {
      selected: {
        ...(welcomeMode ? { welcomeMode } : {}),
        interactionMode,
        ...(workModePack.welcomeModeId
          ? { welcomeModeId: workModePack.welcomeModeId }
          : {}),
        ...(workModePack.interactionModePluginId
          ? { interactionModePluginId: workModePack.interactionModePluginId }
          : {}),
        ...(workModePack.promptCommonPluginId
          ? { promptCommonPluginId: workModePack.promptCommonPluginId }
          : {}),
        microSceneIds,
        microScenePluginIds: [],
        enabledPluginIds,
        validationWarnings,
      },
      packs: [workModePack, microScenePack, userProjectResourcePack],
    };
  }
  var WORKBUDDY_BUILTIN_MARKETPLACE: any = "workbuddy-builtin";
  var WORKBUDDY_WORK_MODE_PLUGIN_PREFIXES: any = [
    "welcomemode-",
    "interactionmode-",
    "prompt-common",
  ];
  function readRecord(value: any): any {
    return value && typeof value === "object" && !Array.isArray(value)
      ? value
      : void 0;
  }
  function mergeEnabledPlugins(settings: any, pluginIds: any): any {
    if (pluginIds.length === 0 && !settings) return;
    const enabledPlugins: any = {
      ...(readRecord(settings?.enabledPlugins) ?? {}),
    };
    const selectedWorkModePluginIds: any = pluginIds.filter(
      isWorkbuddyWorkModePluginId,
    );
    for (const pluginId of Object.keys(enabledPlugins))
      if (
        isWorkbuddyWorkModePluginId(pluginId) &&
        !selectedWorkModePluginIds.includes(pluginId)
      )
        enabledPlugins[pluginId] = false;
    for (const pluginId of pluginIds) enabledPlugins[pluginId] = true;
    return {
      ...(settings ?? {}),
      enabledPlugins,
    };
  }
  function buildAddonComposeRestartFingerprint(
    runtimeConfig: any,
    expansion: any,
  ): any {
    return JSON.stringify({
      base: runtimeConfig.restartFingerprint,
      addonCompose: {
        enabledPluginIds: expansion.selectedPlugins.enabledPluginIds,
      },
    });
  }
  function parseToolNames(value: any): any {
    if (!value) return [];
    return value
      .split(",")
      .map((item: any) => item.trim())
      .filter(Boolean)
      .sort();
  }
  function readSessionSettingsSummary(settings: any): any {
    if (!settings) return;
    const enabledPlugins: any = readRecord(settings.enabledPlugins);
    const extraKnownMarketplaces: any = readRecord(
      settings.extraKnownMarketplaces,
    );
    return {
      keys: Object.keys(settings).sort(),
      enabledPluginIds: enabledPlugins
        ? Object.keys(enabledPlugins)
            .filter((id: any) => enabledPlugins[id] !== false)
            .sort()
        : [],
      extraKnownMarketplaceNames: extraKnownMarketplaces
        ? Object.keys(extraKnownMarketplaces).sort()
        : [],
    };
  }
  function compactUnique(values: any): any {
    return Array.from(
      new Set(
        values.filter(
          (value: any) => typeof value === "string" && value.length > 0,
        ),
      ),
    );
  }
  function isWorkbuddyWorkModePluginId(pluginId: any): any {
    if (!pluginId.endsWith(`@${WORKBUDDY_BUILTIN_MARKETPLACE}`)) return false;
    const pluginName: any = pluginId.slice(
      0,
      -`@${WORKBUDDY_BUILTIN_MARKETPLACE}`.length,
    );
    return WORKBUDDY_WORK_MODE_PLUGIN_PREFIXES.some((prefix: any) =>
      pluginName.startsWith(prefix),
    );
  }
  function expandSessionRuntimeConfig(input: any): any {
    const { runtimeConfig, selected, systemPromptSummary } = input;
    const sessionSettings: any = readSessionSettingsSummary(
      runtimeConfig.sessionSettings,
    );
    const tools: any = parseToolNames(runtimeConfig.tools);
    const workModePluginIds: any = compactUnique([
      selected.welcomeModeId,
      selected.interactionModePluginId,
      selected.promptCommonPluginId,
    ]);
    const sessionSettingPluginIds: any = (
      sessionSettings?.enabledPluginIds ?? []
    ).filter(
      (pluginId: any) =>
        !isWorkbuddyWorkModePluginId(pluginId) ||
        workModePluginIds.includes(pluginId),
    );
    const enabledPluginIds: any = compactUnique([
      ...workModePluginIds,
      ...selected.microScenePluginIds,
      ...selected.enabledPluginIds,
      ...sessionSettingPluginIds,
    ]);
    const missingFromSessionSettings: any = enabledPluginIds.filter(
      (pluginId: any) => !sessionSettingPluginIds.includes(pluginId),
    );
    return {
      ...(sessionSettings ? { sessionSettings } : {}),
      selectedPlugins: {
        enabledPluginIds,
        workModePluginIds,
        microScenePluginIds: selected.microScenePluginIds,
        sessionSettingPluginIds,
        missingFromSessionSettings,
      },
      compose: {
        cliComposeEnabled: true,
        requiredPluginIds: workModePluginIds,
      },
      ...(systemPromptSummary ? { systemPrompt: systemPromptSummary } : {}),
      ...(tools.length > 0 ? { tools } : {}),
      hiddenContextSections: [],
      mcpRuntime: [],
    };
  }
  function applySessionAddonExpansionToRuntimeConfig(
    runtimeConfig: any,
    expansion: any,
  ): any {
    const nextConfig: any = {
      ...runtimeConfig,
      restartFingerprint: buildAddonComposeRestartFingerprint(
        runtimeConfig,
        expansion,
      ),
    };
    const sessionSettings: any = mergeEnabledPlugins(
      runtimeConfig.sessionSettings,
      expansion.selectedPlugins.enabledPluginIds,
    );
    if (sessionSettings) nextConfig.sessionSettings = sessionSettings;
    return nextConfig;
  }
  function makeEmptyAddons(): any {
    return {
      systemPrompts: [],
      tools: [],
      mcp: [],
      skills: [],
      connectors: [],
      plugins: [],
      rules: [],
      subagents: [],
    };
  }
  function addonBucketForType(item: any): any {
    switch (item.type) {
      case "system_prompt":
        return "systemPrompts";
      case "tool":
        return "tools";
      case "mcp":
        return "mcp";
      case "skill":
        return "skills";
      case "connector":
        return "connectors";
      case "plugin":
        return "plugins";
      case "rule":
        return "rules";
      case "subagent":
        return "subagents";
    }
  }
  function pushAddon(
    addons: any,
    provenance: any,
    item: any,
    seenAddonIds: any,
  ): any {
    if (seenAddonIds.has(item.id)) return;
    seenAddonIds.add(item.id);
    addons[addonBucketForType(item)].push(item);
    provenance.push({
      addonId: item.id,
      from: item.source,
      packId: item.provenance.packId,
      channel: item.provenance.channel,
    });
  }
  function inferPluginSource(pluginId: any): any {
    const [pluginName] = pluginId.split("@");
    if (
      pluginName?.startsWith("welcomemode-") ||
      pluginName?.startsWith("interactionmode-") ||
      pluginName === "prompt-common"
    )
      return "work_mode";
    if (pluginId.endsWith("@workbuddy-builtin")) return "runtime_only";
    return "unknown";
  }
  function pluginItem(
    pluginId: any,
    source: any,
    packId: any,
    channel: any = "sessionSettings.enabledPlugins",
  ): any {
    return {
      id: `plugin:${pluginId}`,
      type: "plugin",
      source,
      surfaces: ["runtime_only"],
      payloadSummary: { pluginId },
      provenance: {
        packId,
        channel,
      },
    };
  }
  function composeSessionAddons({
    desiredConfig,
    runtimeConfig,
    systemPromptSummary,
    hashText,
  }: any): any {
    const addons: any = makeEmptyAddons();
    const provenance: any = [];
    const seenAddonIds: any = /* @__PURE__ */ new Set();
    const resolvedPacks: any = resolveAddonPacks({
      desiredConfig,
      runtimeConfig,
    });
    const expanded: any = expandSessionRuntimeConfig({
      runtimeConfig,
      selected: resolvedPacks.selected,
      systemPromptSummary,
    });
    const selected: any = {
      ...resolvedPacks.selected,
      enabledPluginIds: expanded.selectedPlugins.enabledPluginIds,
    };
    for (const pack of resolvedPacks.packs)
      for (const item of pack.items)
        pushAddon(addons, provenance, item, seenAddonIds);
    if (systemPromptSummary) {
      const source: any = desiredConfig.systemPrompt ? "user" : "work_mode";
      pushAddon(
        addons,
        provenance,
        {
          id: desiredConfig.systemPrompt
            ? "system-prompt:explicit"
            : "system-prompt:mode-resolver",
          type: "system_prompt",
          source,
          surfaces: ["system_prompt"],
          payloadSummary: {
            ...systemPromptSummary,
            resolver: desiredConfig.systemPrompt
              ? "SessionDesiredConfig.systemPrompt"
              : "ModeService.resolveOptions",
          },
          provenance: {
            packId:
              source === "work_mode"
                ? `work-mode:${selected.welcomeMode ?? "default"}:${selected.interactionMode ?? "craft"}`
                : "user:explicit-system-prompt",
            channel: desiredConfig.systemPrompt
              ? "desiredConfig.systemPrompt"
              : "runtimeConfig.systemPrompt",
          },
        },
        seenAddonIds,
      );
    }
    const toolNames: any = parseToolNames(runtimeConfig.tools);
    if (toolNames.length > 0) {
      const source: any = desiredConfig.tools ? "user" : "work_mode";
      pushAddon(
        addons,
        provenance,
        {
          id: `tools:${hashText(toolNames.join(","))}`,
          type: "tool",
          source,
          surfaces: ["tools"],
          payloadSummary: {
            count: toolNames.length,
            names: toolNames,
            resolver: desiredConfig.tools
              ? "SessionDesiredConfig.tools"
              : "ModeService.resolveOptions",
          },
          provenance: {
            packId:
              source === "work_mode"
                ? `work-mode:${selected.welcomeMode ?? "default"}:${selected.interactionMode ?? "craft"}`
                : "user:explicit-tools",
            channel:
              runtimeConfig.tools === desiredConfig.tools
                ? "desiredConfig.tools"
                : "runtimeConfig.tools",
          },
        },
        seenAddonIds,
      );
    }
    const sessionSettingPluginIds: any = new Set(
      expanded.sessionSettings?.enabledPluginIds ?? [],
    );
    for (const pluginId of expanded.selectedPlugins.enabledPluginIds) {
      const source: any = inferPluginSource(pluginId);
      const fromSessionSettings: any = sessionSettingPluginIds.has(pluginId);
      pushAddon(
        addons,
        provenance,
        pluginItem(
          pluginId,
          source,
          source === "work_mode"
            ? `work-mode:${selected.welcomeMode ?? "default"}:${selected.interactionMode ?? "craft"}`
            : fromSessionSettings
              ? "session-settings"
              : "addon-selection:enabled-plugins",
          fromSessionSettings
            ? "sessionSettings.enabledPlugins"
            : "addonSelection.enabledPluginIds",
        ),
        seenAddonIds,
      );
    }
    return {
      selected,
      addons,
      expanded,
      provenance,
    };
  }
  function summarizeText(value: any): any {
    if (value === void 0) return;
    return {
      length: value.length,
      sha256: sha256(value),
    };
  }
  function sha256(value: any): any {
    return (0, node_crypto.createHash)("sha256").update(value).digest("hex");
  }
  function stableJsonStringify$2(value: any): any {
    if (Array.isArray(value))
      return `[${value.map((item: any) => stableJsonStringify$2(item)).join(",")}]`;
    if (value && typeof value === "object") {
      const objectValue: any = value;
      return `{${Object.keys(objectValue)
        .sort()
        .filter((key: any) => objectValue[key] !== void 0)
        .map(
          (key: any) =>
            `${JSON.stringify(key)}:${stableJsonStringify$2(objectValue[key])}`,
        )
        .join(",")}}`;
    }
    return JSON.stringify(value);
  }
  function buildManifestHash(manifestWithoutHash: any): any {
    return sha256(stableJsonStringify$2(manifestWithoutHash));
  }
  function buildSessionAddonManifest({
    sessionId,
    desiredConfig,
    runtimeConfig,
  }: any): any {
    const composition: any = composeSessionAddons({
      desiredConfig,
      runtimeConfig,
      systemPromptSummary: summarizeText(runtimeConfig.systemPrompt),
      hashText: sha256,
    });
    const manifestBody: any = {
      version: 1,
      sessionId,
      selected: composition.selected,
      addons: composition.addons,
      expanded: composition.expanded,
      provenance: composition.provenance,
    };
    return {
      ...manifestBody,
      generatedAt: /* @__PURE__ */ new Date().toISOString(),
      hash: buildManifestHash(manifestBody),
    };
  }
  function isRecord$4(value: any): any {
    return !!value && typeof value === "object" && !Array.isArray(value);
  }
  function filterDerivedPluginIds(pluginIds: any): any {
    return pluginIds.filter(
      (pluginId: any) => !isWorkbuddyWorkModePluginId(pluginId.trim()),
    );
  }
  function projectSessionPluginContext(desiredConfig: any): any {
    const empty: any = createEmptySessionPluginContext();
    const selection: any = desiredConfig.addonSelection;
    const sessionSettings: any = desiredConfig.sessionSettings;
    const rawEnabledPlugins: any = isRecord$4(sessionSettings?.enabledPlugins)
      ? sessionSettings.enabledPlugins
      : {};
    const enabledPlugins: any = Object.fromEntries(
      Object.entries(rawEnabledPlugins).filter(
        ([pluginId]: any) => !isWorkbuddyWorkModePluginId(pluginId.trim()),
      ),
    );
    const extraKnownMarketplaces: any = isRecord$4(
      sessionSettings?.extraKnownMarketplaces,
    )
      ? sessionSettings.extraKnownMarketplaces
      : {};
    return (
      normalizeSessionPluginContext({
        version: 1,
        selectedPluginIds: filterDerivedPluginIds(
          selection?.enabledPluginIds ?? [],
        ),
        microSceneIds: selection?.microSceneIds ?? [],
        projectResources: selection?.projectResources ?? empty.projectResources,
        pluginSettings: {
          enabledPlugins,
          extraKnownMarketplaces,
        },
      }) ?? empty
    );
  }
  function buildAddonSelectionFromPluginContext(
    context: any,
    welcomeMode: any,
    interactionMode: any,
  ): any {
    return {
      version: 1,
      ...(welcomeMode ? { welcomeMode } : {}),
      interactionMode: interactionMode ?? "craft",
      microSceneIds: [...context.microSceneIds],
      enabledPluginIds: filterDerivedPluginIds(context.selectedPluginIds),
      promptContentBlockCount: 0,
      resourceLinkCount: 0,
      projectResources: {
        connectorSkillIds: [...context.projectResources.connectorSkillIds],
        mcpServerNames: [...context.projectResources.mcpServerNames],
        projectSkillNames: [...context.projectResources.projectSkillNames],
      },
    };
  }
  function buildSessionSettingsFromPluginContext(context: any): any {
    const enabledPlugins: any = Object.fromEntries(
      Object.entries(context.pluginSettings.enabledPlugins).filter(
        ([pluginId]: any) => !isWorkbuddyWorkModePluginId(pluginId.trim()),
      ),
    );
    const extraKnownMarketplaces: any = Object.fromEntries(
      Object.entries(context.pluginSettings.extraKnownMarketplaces).map(
        ([name, config]: any) => [name, { ...config }],
      ),
    );
    if (
      Object.keys(enabledPlugins).length === 0 &&
      Object.keys(extraKnownMarketplaces).length === 0
    )
      return;
    return {
      ...(Object.keys(enabledPlugins).length > 0 ? { enabledPlugins } : {}),
      ...(Object.keys(extraKnownMarketplaces).length > 0
        ? { extraKnownMarketplaces }
        : {}),
    };
  }
  function formatLogDetailsSuffix(details: any): any {
    if (details === void 0) return "";
    const detailsText: any = safeStringifyLogDetails(details);
    return detailsText ? ` ${detailsText}` : "";
  }
  function safeStringifyLogDetails(details: any): any {
    if (details === null || details === void 0) return "";
    if (typeof details === "string") return details;
    try {
      return JSON.stringify(details, (_key: any, value: any) => {
        if (value instanceof Error) return serializeLogErrorForDetails(value);
        if (typeof value === "bigint") return value.toString();
        return value;
      });
    } catch {
      try {
        return String(details);
      } catch {
        return "[unserializable-log-details]";
      }
    }
  }
  function serializeLogErrorForDetails(error: any): any {
    if (error instanceof Error) {
      const errorWithExtras: any = error;
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: errorWithExtras.code,
        data: sanitizeLogDetailValue(errorWithExtras.data),
        cause: errorWithExtras.cause
          ? serializeLogErrorCauseForDetails(errorWithExtras.cause)
          : void 0,
      };
    }
    return { message: String(error) };
  }
  function serializeLogErrorCauseForDetails(error: any): any {
    if (error instanceof Error) return serializeLogErrorForDetails(error);
    return String(error);
  }
  function sanitizeLogDetailValue(value: any, depth: any = 0): any {
    if (depth >= 3) return "[truncated]";
    if (
      value == null ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      typeof value === "string"
    )
      return value;
    if (Array.isArray(value))
      return value
        .slice(0, 10)
        .map((item: any) => sanitizeLogDetailValue(item, depth + 1));
    if (value instanceof Error) return serializeLogErrorForDetails(value);
    if (typeof value === "object") {
      const entries: any = Object.entries(value).slice(0, 20);
      return Object.fromEntries(
        entries.map(([key, nested]: any) => [
          key,
          sanitizeLogDetailValue(nested, depth + 1),
        ]),
      );
    }
    return String(value);
  }
  var WEIXINPAY_BUILTIN_PLUGIN_ID: any = "weixinpay@workbuddy-builtin";
  function isClawRuntimeCwd(cwd: any): any {
    const trimmed: any = cwd?.trim();
    if (!trimmed) return false;
    try {
      return (
        node_path.resolve(trimmed).toLowerCase() ===
        node_path.resolve(resolveClawCwd()).toLowerCase()
      );
    } catch {
      return false;
    }
  }
  function withSessionEnabledPluginSetting(
    settings: any,
    pluginId: any,
    enabled: any,
  ): any {
    const existingEnabledPlugins: any = settings?.enabledPlugins;
    const enabledPlugins: any =
      existingEnabledPlugins &&
      typeof existingEnabledPlugins === "object" &&
      !Array.isArray(existingEnabledPlugins)
        ? { ...existingEnabledPlugins }
        : {};
    enabledPlugins[pluginId] = enabled;
    return {
      ...(settings ?? {}),
      enabledPlugins,
    };
  }
  function normalizePromptContextVariables(variables: any): any {
    if (!variables) return;
    const normalized: any = {};
    for (const [key, value] of Object.entries(variables))
      if (typeof value === "string") normalized[key] = value;
    return Object.keys(normalized).length > 0 ? normalized : void 0;
  }
  function summarizePromptContextVariables(variables: any): any {
    if (!variables) return;
    return {
      keys: Object.keys(variables).sort(),
      totalLength: Object.values(variables).reduce(
        (sum: any, value: any) => sum + value.length,
        0,
      ),
    };
  }
  function summarizeSystemPrompt(systemPrompt: any): any {
    if (systemPrompt === void 0) return;
    return {
      length: systemPrompt.length,
      preview: systemPrompt.slice(0, 300),
    };
  }
  function logResolverInfo(logger: any, message: any, details: any): any {
    logger.info(`${message}${formatLogDetailsSuffix(details)}`);
  }
  function createSessionRuntimeConfigResolver(deps: any): any {
    let modeServicePromise: any;
    const getModeService: any = async () => {
      if (!modeServicePromise)
        modeServicePromise = deps.then(
          ({ logger, systemPromptService }: any) => {
            return new require_workbuddy_auth_product_coordinator.ModeService(
              {
                initialize: () => systemPromptService.initialize(),
                renderSystemPrompt: (options: any) =>
                  systemPromptService.renderSystemPrompt(options),
                collectSystemPromptVariables: (options: any) =>
                  systemPromptService.collectSystemPromptVariables?.(options) ??
                  Promise.resolve({}),
                cleanup: () => systemPromptService.cleanup(),
              },
              logger,
            );
          },
        );
      return modeServicePromise;
    };
    return {
      async resolveConfig(request: any): Promise<any> {
        const desiredMode: any = request.desiredConfig.mode ?? "craft";
        const desiredPermissionMode: any =
          desiredMode === "plan"
            ? "plan"
            : require_workbuddy_auth_product_coordinator.normalizePermissionMode(
                request.desiredConfig.permissionMode,
              );
        const modeResolveInput: any = {
          mode: desiredMode,
          expertId: request.desiredConfig.expertId,
          expertMarketplace: request.desiredConfig.expertMarketplace,
          locale: request.desiredConfig.locale,
          runtimeIdentity: request.desiredConfig.runtimeIdentity,
          model: request.desiredConfig.model,
          sessionId: request.sessionId,
          cwd: request.cwd,
          permissionMode: desiredPermissionMode,
          systemPrompt: request.desiredConfig.systemPrompt,
          tools: request.desiredConfig.tools,
          welcomeMode: request.desiredConfig.welcomeMode,
        };
        const { logger } = await deps;
        const resolvedOptions: any = await (
          await getModeService()
        ).resolveOptions(modeResolveInput);
        const sessionSettings: any = isClawRuntimeCwd(request.cwd)
          ? withSessionEnabledPluginSetting(
              request.desiredConfig.sessionSettings,
              WEIXINPAY_BUILTIN_PLUGIN_ID,
              false,
            )
          : request.desiredConfig.sessionSettings;
        const promptVariables: any = normalizePromptContextVariables(
          resolvedOptions.promptContextVariables,
        );
        const ret: any = {
          model: request.desiredConfig.model,
          permissionMode:
            require_workbuddy_auth_product_coordinator.normalizePermissionMode(
              resolvedOptions.permissionMode,
            ),
          ...(request.desiredConfig.permissionModeBeforePlan
            ? {
                permissionModeBeforePlan:
                  request.desiredConfig.permissionModeBeforePlan,
              }
            : {}),
          tools: resolvedOptions.tools,
          systemPrompt: resolvedOptions.systemPrompt,
          restartFingerprint:
            require_workbuddy_auth_product_coordinator.buildSessionRestartFingerprint(
              {
                mode: desiredMode,
                expertId: request.desiredConfig.expertId,
                expertMarketplace: request.desiredConfig.expertMarketplace,
                locale: request.desiredConfig.locale,
                runtimeIdentity: request.desiredConfig.runtimeIdentity,
                explicitSystemPrompt: request.desiredConfig.systemPrompt,
                tools: resolvedOptions.tools,
                welcomeMode: request.desiredConfig.welcomeMode,
                cwd: request.cwd,
                permissionModeBeforePlan:
                  request.desiredConfig.permissionModeBeforePlan,
              },
            ),
          ...(request.desiredConfig.runtimeIdentity
            ? { runtimeIdentity: request.desiredConfig.runtimeIdentity }
            : {}),
          ...(request.desiredConfig.welcomeMode
            ? { welcomeMode: request.desiredConfig.welcomeMode }
            : {}),
          ...(sessionSettings ? { sessionSettings } : {}),
          ...(promptVariables ? { promptVariables } : {}),
        };
        logResolverInfo(
          logger,
          "[SessionRuntimeConfigResolver] resolveConfig output",
          {
            sessionId: request.sessionId,
            resolvedOptions: {
              ...resolvedOptions,
              systemPrompt: summarizeSystemPrompt(resolvedOptions.systemPrompt),
              promptContextVariables: summarizePromptContextVariables(
                resolvedOptions.promptContextVariables,
              ),
            },
            runtimeConfig: {
              ...ret,
              systemPrompt: summarizeSystemPrompt(ret.systemPrompt),
              promptVariables: summarizePromptContextVariables(
                ret.promptVariables,
              ),
            },
          },
        );
        return ret;
      },
    };
  }
  var WORKBUDDY_AGENT_ALLOWED_TOOLS: any = [
    "present_files",
    "read_me",
    "show_widget",
    "connect_cloud_service",
    "connect_open_platform",
    "WebFetch",
    "Bash(mcporter:*)",
  ];
  var VALID_PERMISSION_MODES$1: any = new Set([
    "fullAccess",
    "plan",
    "default",
    "acceptEdits",
    "bypassPermissions",
  ]);
  function normalizeBackendPermissionMode$1(mode: any): any {
    if (mode && VALID_PERMISSION_MODES$1.has(mode)) return mode;
    return "bypassPermissions";
  }
  function shouldSuppressLegacySystemPrompt(runtimeConfig: any): any {
    return (
      runtimeConfig.addonManifest?.expanded.compose.cliComposeEnabled ===
        true &&
      runtimeConfig.addonManifest.addons.systemPrompts.some(
        (item: any) => item.source === "work_mode",
      )
    );
  }
  function shouldSuppressLegacyTools(runtimeConfig: any): any {
    return (
      runtimeConfig.addonManifest?.expanded.compose.cliComposeEnabled ===
        true &&
      runtimeConfig.addonManifest.addons.tools.some(
        (item: any) => item.source === "work_mode",
      )
    );
  }
  function buildAgentCliRuntimeArgs({
    runtimeConfig,
    cwd,
    mcpConfig,
    systemPromptFile,
    promptVarsFile,
    language,
    envRouteMode,
  }: any): any {
    const args: any = [];
    const shouldSuppressSystemPrompt: any =
      shouldSuppressLegacySystemPrompt(runtimeConfig);
    const shouldSuppressTools: any = shouldSuppressLegacyTools(runtimeConfig);
    const permissionMode: any = normalizeBackendPermissionMode$1(
      runtimeConfig.permissionMode,
    );
    args.push("--permission-mode", permissionMode);
    if (runtimeConfig.permissionModeBeforePlan)
      args.push(
        "--permission-mode-before-plan",
        runtimeConfig.permissionModeBeforePlan,
      );
    args.push("--allowedTools", ...WORKBUDDY_AGENT_ALLOWED_TOOLS);
    if (runtimeConfig.model) args.push("--model", runtimeConfig.model);
    if (!shouldSuppressTools && runtimeConfig.tools !== void 0)
      args.push("--tools", runtimeConfig.tools);
    if (!shouldSuppressSystemPrompt && systemPromptFile)
      args.push("--system-prompt-file", systemPromptFile);
    else if (!shouldSuppressSystemPrompt && runtimeConfig.systemPrompt)
      args.push("--system-prompt", runtimeConfig.systemPrompt);
    const settingsPayload: any = { ...(runtimeConfig.sessionSettings ?? {}) };
    if (cwd)
      settingsPayload.trustedDirectories = [
        `${cwd.replace(/[/\\]+$/, "") || cwd}/**`,
      ];
    if (envRouteMode) settingsPayload.envRouteMode = envRouteMode;
    if (language) settingsPayload.language = language;
    if (Object.keys(settingsPayload).length > 0)
      args.push("--settings", JSON.stringify(settingsPayload));
    if (mcpConfig) args.push("--mcp-config", mcpConfig, "--strict-mcp-config");
    if (promptVarsFile) args.push("--prompt-vars-file", promptVarsFile);
    return args;
  }
  var SESSION_CWD_UNAVAILABLE: any = "SESSION_CWD_UNAVAILABLE";
  var SessionCwdUnavailableError: any = class extends Error {
    code: any = SESSION_CWD_UNAVAILABLE;
    data: any;
    constructor(message: any, data: any) {
      super(message);
      this.name = "SessionCwdUnavailableError";
      this.data = data;
    }
  };
  function classifyErrno(errno: any): any {
    switch (errno) {
      case "ENOENT":
      case "ENOTDIR":
        return "missing";
      case "EACCES":
      case "EPERM":
        return "permission_denied";
      default:
        return "unknown";
    }
  }
  async function assertSessionCwdUsable(cwd: any): Promise<any> {
    let stat: any;
    try {
      stat = await node_fs.promises.stat(cwd);
    } catch (err: any) {
      const errno: any = err.code;
      const reason: any = classifyErrno(errno);
      throw new SessionCwdUnavailableError(
        reason === "missing"
          ? `Session working directory does not exist or was removed: ${cwd}`
          : reason === "permission_denied"
            ? `Permission denied for session working directory: ${cwd}`
            : `Cannot access session working directory: ${cwd} (${errno ?? "unknown"})`,
        {
          cwd,
          reason,
          errno,
          systemMessage: err instanceof Error ? err.message : String(err),
        },
      );
    }
    if (!stat.isDirectory())
      throw new SessionCwdUnavailableError(
        `Session working directory path is not a directory: ${cwd}`,
        {
          cwd,
          reason: "not_a_directory",
        },
      );
    try {
      await node_fs.promises.access(
        cwd,
        node_fs.constants.R_OK | node_fs.constants.X_OK,
      );
    } catch (err: any) {
      const errno: any = err.code;
      throw new SessionCwdUnavailableError(
        `Permission denied for session working directory: ${cwd}`,
        {
          cwd,
          reason: "permission_denied",
          errno,
          systemMessage: err instanceof Error ? err.message : String(err),
        },
      );
    }
  }
  var AGENT_CLI_PROMPT_VARS_RESTORE_FAILED_CODE: any = 11109;
  function createAgentCliPromptVarsRestoreFailedError(
    message: any,
    data: any,
  ): any {
    const error: any = new Error(message);
    error.code = AGENT_CLI_PROMPT_VARS_RESTORE_FAILED_CODE;
    error.data = {
      reason: data.reason,
      sessionId: data.sessionId,
      ...(data.causeCode ? { causeCode: data.causeCode } : {}),
    };
    return error;
  }
  function writeAgentCliSystemPromptFile(
    sessionId: any,
    systemPrompt: any,
  ): any {
    if (!systemPrompt) return null;
    const tmpDir: any = node_path.join(node_os.tmpdir(), "workbuddy-prompts");
    node_fs.mkdirSync(tmpDir, { recursive: true });
    const filePath: any = node_path.join(tmpDir, `${sessionId}.prompt.txt`);
    node_fs.writeFileSync(filePath, systemPrompt, "utf-8");
    return filePath;
  }
  function getAgentCliPromptVarsFilePath(sessionId: any): any {
    return node_path.join(
      node_os.tmpdir(),
      "workbuddy-prompt-vars",
      `${sessionId}.prompt-vars.json`,
    );
  }
  function writeAgentCliPromptVarsFile(sessionId: any, variables: any): any {
    if (!variables || Object.keys(variables).length === 0) return null;
    const filePath: any = getAgentCliPromptVarsFilePath(sessionId);
    node_fs.mkdirSync(node_path.dirname(filePath), { recursive: true });
    node_fs.writeFileSync(
      filePath,
      JSON.stringify({
        version: 1,
        variables,
      }),
      "utf-8",
    );
    return filePath;
  }
  function ensureAgentCliPromptVarsFile(
    sessionId: any,
    expectedFilePath: any,
    variables: any,
  ): any {
    if (!variables || Object.keys(variables).length === 0)
      return {
        status: "not_required",
        filePath: null,
      };
    const canonicalPath: any = getAgentCliPromptVarsFilePath(sessionId);
    const targetPath: any = expectedFilePath ?? canonicalPath;
    if (targetPath !== canonicalPath)
      throw createAgentCliPromptVarsRestoreFailedError(
        `Refusing to restore prompt-vars file outside canonical path for session ${sessionId}`,
        {
          sessionId,
          reason: "path_mismatch",
        },
      );
    const health: any = inspectAgentCliPromptVarsFile(targetPath, variables);
    if (health.healthy)
      return {
        status: "healthy",
        filePath: targetPath,
      };
    let written: any;
    try {
      written = writeAgentCliPromptVarsFile(sessionId, variables);
    } catch (error: any) {
      const causeCode: any = error.code;
      throw createAgentCliPromptVarsRestoreFailedError(
        `Failed to restore prompt-vars file for session ${sessionId}`,
        {
          sessionId,
          reason: health.reason === "not_file" ? "not_file" : "write_failed",
          ...(typeof causeCode === "string" ? { causeCode } : {}),
        },
      );
    }
    if (!written || written !== canonicalPath)
      throw createAgentCliPromptVarsRestoreFailedError(
        `Failed to restore prompt-vars file for session ${sessionId}`,
        {
          sessionId,
          reason: "write_failed",
        },
      );
    const restoredHealth: any = inspectAgentCliPromptVarsFile(
      written,
      variables,
    );
    if (!restoredHealth.healthy)
      throw createAgentCliPromptVarsRestoreFailedError(
        `Prompt-vars file still unhealthy after restore for session ${sessionId} (${restoredHealth.reason})`,
        {
          sessionId,
          reason: "still_unhealthy",
        },
      );
    return {
      status: "restored",
      filePath: written,
      reason: health.reason,
    };
  }
  function inspectAgentCliPromptVarsFile(filePath: any, variables: any): any {
    let stat: any;
    try {
      stat = node_fs.statSync(filePath);
    } catch (error: any) {
      if (error.code === "ENOENT")
        return {
          healthy: false,
          reason: "missing",
        };
      return {
        healthy: false,
        reason: "unreadable",
      };
    }
    if (!stat.isFile())
      return {
        healthy: false,
        reason: "not_file",
      };
    let raw: any;
    try {
      raw = node_fs.readFileSync(filePath, "utf-8");
    } catch {
      return {
        healthy: false,
        reason: "unreadable",
      };
    }
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return {
        healthy: false,
        reason: "invalid_json",
      };
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return {
        healthy: false,
        reason: "invalid_payload",
      };
    const payload: any = parsed;
    if (payload.version !== 1)
      return {
        healthy: false,
        reason: "invalid_payload",
      };
    if (
      !payload.variables ||
      typeof payload.variables !== "object" ||
      Array.isArray(payload.variables)
    )
      return {
        healthy: false,
        reason: "invalid_payload",
      };
    if (!areAgentCliPromptVariablesEqual(variables, payload.variables))
      return {
        healthy: false,
        reason: "content_mismatch",
      };
    return { healthy: true };
  }
  function areAgentCliPromptVariablesEqual(expected: any, actual: any): any {
    const expectedKeys: any = Object.keys(expected);
    const actualKeys: any = Object.keys(actual);
    if (expectedKeys.length !== actualKeys.length) return false;
    for (const key of expectedKeys)
      if (actual[key] !== expected[key]) return false;
    return true;
  }
  function cleanupAgentCliTempFile(filePath: any): any {
    if (!filePath) return;
    try {
      node_fs.unlinkSync(filePath);
    } catch {}
  }
  function cleanupAgentCliSystemPromptFile(filePath: any): any {
    cleanupAgentCliTempFile(filePath);
  }
  function cleanupAgentCliPromptVarsFile(filePath: any): any {
    cleanupAgentCliTempFile(filePath);
  }
  class NativeSessionAddonResolver {
    [key: string]: any;
    async resolveRuntimeConfig(args: any): Promise<any> {
      const resolvedConfig: any = this.runtimeConfigResolver
        ? require_workbuddy_auth_product_coordinator.cloneResolvedRuntimeConfig(
            await this.runtimeConfigResolver.resolveConfig({
              sessionId: args.sessionId,
              cwd: args.cwd,
              desiredConfig:
                require_workbuddy_auth_product_coordinator.cloneDesiredConfig(
                  args.desiredConfig,
                ),
              currentRuntimeConfig: args.currentRuntimeConfig ?? null,
            }),
          )
        : require_workbuddy_auth_product_coordinator.buildFallbackRuntimeConfig(
            args.desiredConfig,
          );
      const addonManifest: any = buildSessionAddonManifest({
        sessionId: args.sessionId,
        desiredConfig: args.desiredConfig,
        runtimeConfig: resolvedConfig,
      });
      return require_workbuddy_auth_product_coordinator.cloneResolvedRuntimeConfig(
        {
          ...applySessionAddonExpansionToRuntimeConfig(
            resolvedConfig,
            addonManifest.expanded,
          ),
          addonManifest,
        },
      );
    }
  }
  return {
    isRecord$14,
    hasPersistedV1Shape,
    normalizeString$4,
    normalizeStringArray$2,
    normalizeEnabledPlugins,
    normalizeMarketplaceConfig,
    normalizeMarketplaces,
    createEmptySessionPluginContext,
    normalizeSessionPluginContext,
    parseSessionPluginContextJson,
    serializeSessionPluginContext,
    createMicroScenePack,
    skillItem,
    mcpItem,
    createUserProjectResourcePack,
    WORKBUDDY_BUILTIN_MARKETPLACE$1,
    WELCOME_MODE_PLUGIN_NAMES,
    INTERACTION_MODE_PLUGIN_NAMES,
    PROMPT_COMMON_PLUGIN_NAME,
    NETDRIVE_MCP_SERVER_NAME,
    toBuiltinPluginId,
    pluginItem$1,
    mcpDependencyItem,
    resolveWorkModePack,
    resolveInteractionModeForPrompt,
    resolveAddonPacks,
    WORKBUDDY_BUILTIN_MARKETPLACE,
    WORKBUDDY_WORK_MODE_PLUGIN_PREFIXES,
    readRecord,
    mergeEnabledPlugins,
    buildAddonComposeRestartFingerprint,
    parseToolNames,
    readSessionSettingsSummary,
    compactUnique,
    isWorkbuddyWorkModePluginId,
    expandSessionRuntimeConfig,
    applySessionAddonExpansionToRuntimeConfig,
    makeEmptyAddons,
    addonBucketForType,
    pushAddon,
    inferPluginSource,
    pluginItem,
    composeSessionAddons,
    summarizeText,
    sha256,
    stableJsonStringify$2,
    buildManifestHash,
    buildSessionAddonManifest,
    isRecord$4,
    filterDerivedPluginIds,
    projectSessionPluginContext,
    buildAddonSelectionFromPluginContext,
    buildSessionSettingsFromPluginContext,
    formatLogDetailsSuffix,
    safeStringifyLogDetails,
    serializeLogErrorForDetails,
    serializeLogErrorCauseForDetails,
    sanitizeLogDetailValue,
    WEIXINPAY_BUILTIN_PLUGIN_ID,
    isClawRuntimeCwd,
    withSessionEnabledPluginSetting,
    normalizePromptContextVariables,
    summarizePromptContextVariables,
    summarizeSystemPrompt,
    logResolverInfo,
    createSessionRuntimeConfigResolver,
    WORKBUDDY_AGENT_ALLOWED_TOOLS,
    VALID_PERMISSION_MODES$1,
    normalizeBackendPermissionMode$1,
    shouldSuppressLegacySystemPrompt,
    shouldSuppressLegacyTools,
    buildAgentCliRuntimeArgs,
    SESSION_CWD_UNAVAILABLE,
    SessionCwdUnavailableError,
    classifyErrno,
    assertSessionCwdUsable,
    AGENT_CLI_PROMPT_VARS_RESTORE_FAILED_CODE,
    createAgentCliPromptVarsRestoreFailedError,
    writeAgentCliSystemPromptFile,
    getAgentCliPromptVarsFilePath,
    writeAgentCliPromptVarsFile,
    ensureAgentCliPromptVarsFile,
    inspectAgentCliPromptVarsFile,
    areAgentCliPromptVariablesEqual,
    cleanupAgentCliTempFile,
    cleanupAgentCliSystemPromptFile,
    cleanupAgentCliPromptVarsFile,
    NativeSessionAddonResolver,
  };
}
