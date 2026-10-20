import type { ModelSettings } from "@openai/agents-core";

export type ProductPrompt = {
  name: string;
  template: string;
};

export type ProductTool = {
  name: string;
  description: string;
  deferLoading?: boolean;
};

export type ProductAgent = {
  name: string;
  instructions?: string;
  description?: string;
  tools?: string[];
  handoffs?: string[];
  asTool?: boolean;
  tags?: string[];
  commands?: string[];
  models?: string[];
  modelTags?: string[];
  appendInstructions?: string;
  parameters?: unknown;
  permissionMode?: string;
  isolation?: string;
  disallowedTools?: string[];
  skills?: string[];
  thinkingEnabled?: boolean;
  effort?: string;
  hooks?: Record<string, Array<Record<string, unknown>>>;
};

export type ProductModel = {
  id: string;
  name: string;
  aliases?: string[];
  tags?: string[];
  url?: string;
  apiKey?: string;
  disabled?: boolean;
  trustLevel?: string;
  useCustomProtocol?: boolean;
  isDefault?: boolean;
  maxInputTokens?: number;
  maxOutputTokens?: number;
  maxAllowedSize?: number;
  supportsToolCall?: boolean;
  supportsImages?: boolean;
  supportsReasoning?: boolean;
  onlyReasoning?: boolean;
  relatedModels?: Record<string, string>;
  temperature?: number;
  top_p?: number;
  repetition_penalty?: number;
  reasoning?: ModelSettings["reasoning"];
  [key: string]: unknown;
};

export type ProductConfig = {
  productName: string;
  applicationName: string;
  genieVersion: string;
  commit: string;
  date: string;
  endpoint: string;
  deploymentType: string;
  agents: ProductAgent[];
  tools: ProductTool[];
  models: ProductModel[];
  prompts: ProductPrompt[];
  requestMaxStepLimit?: number;
  defaultRelatedModels?: Record<string, string>;
  tokenUsageThresholds?: {
    inputTokens?: {
      warning?: number;
      critical?: number;
      emergency?: number;
      subAgentEmergency?: number;
      preMessage?: number;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export type ProductVariant =
  | "default"
  | "cloudhosted"
  | "internal"
  | "ioa"
  | "selfhosted";
