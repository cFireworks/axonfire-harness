// Fixed sample modules 18629, 24613, 55114 and ProductManagerImpl statics.
export const MergeStrategy = {
  Override: "override",
  Merge: "merge",
  SmartMerge: "smartMerge",
  DeepSmartMerge: "deepSmartMerge",
  CommandsSmartMerge: "commandsSmartMerge",
} as const;
export const OVERRIDE_MODE = Symbol.for("@genie/product:overrideMode");
export const PRODUCT_CONFIGURATION_CACHE_TIMEOUT = 480000;
export const ProductProviderPriority = {
  CLIENT: 5000,
  CLIENT_SETTINGS_ENDPOINT: 6000,
  CLOUD_PRE: 9999,
  CLOUD: 10000,
  MODELS: 100100,
  AGENTS: 100200,
  AGENT_MODEL_RESOLVER: 100300,
  CLIENT_SETTINGS: 11000,
  WORKSPACE: 15000,
  MODEL_SETTINGS: 18000,
  ENV: 20000,
  OPTIONS: 21000,
  MODEL_CHECK: 24000,
  DEFAULT: 25000,
} as const;
export const ProductFeature = {
  DisableTerminalVariable: "DisableTerminalVariable",
  DisableMultimodalGeneration: "DisableMultimodalGeneration",
} as const;
export const PRODUCT_MANAGER_STATICS = {
  cacheKeyPrefix: "CodeBuddy-Product-Cache",
  endpointCacheKey: "CodeBuddy-Endpoint-Cache",
  envCacheKey: "CodeBuddy-Environment-Cache",
  ENV_KEY: "CODEBUDDY_INTERNET_ENVIRONMENT",
  PRODUCT_VERSION_ENV_KEY: "CLIENT_INFO_PRODUCT_VERSION",
  MAX_CACHE_TTL: 480000,
  PROXY_SYNC_THROTTLE_MS: 2000,
} as const;
