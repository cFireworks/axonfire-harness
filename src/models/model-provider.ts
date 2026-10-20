import type {
  Model,
  ModelProvider as SdkModelProvider,
} from "@openai/agents-core";
import { OpenAIChatCompletionsModel } from "@openai/agents-openai";
import OpenAI from "openai";
import { FunctionCallResultAgentInputItemProcessor } from "../sessions/function-call-result-processor.js";
import { ToolMessageModelRequestProcessor } from "./tool-message-request-processor.js";
import type { ProductConfiguration } from "../config/product-config.js";
import type { HarnessSession } from "../sessions/session.js";
import type { SessionManager } from "../sessions/session-manager.js";
import {
  WorkBuddyModelTransport,
  type WorkBuddyTransportOptions,
} from "./model-transport.js";

export const MAX_MODEL_CACHE_SIZE = 32;

export type AuthenticationSnapshot = {
  accessToken?: string;
};

export interface AuthenticationManager {
  initialized: Promise<void>;
  current(): AuthenticationSnapshot | undefined;
  clear(): void;
}

export interface SettingsManager {
  get<T>(key: string): Promise<T | undefined>;
  list?(): Promise<Record<string, any>>;
}

export class WorkBuddyModelProvider implements SdkModelProvider {
  private readonly modelCache = new Map<string, Model>();
  readonly transport: WorkBuddyModelTransport;
  readonly functionCallResultAgentInputItemProcessor = new FunctionCallResultAgentInputItemProcessor();
  readonly toolMessageRequestProcessor: ToolMessageModelRequestProcessor;

  constructor(
    private readonly product: ProductConfiguration,
    private readonly authentication: AuthenticationManager,
    private readonly settings: SettingsManager,
    private readonly sessions: SessionManager,
    transportFetch: typeof fetch = fetch,
    transportOptions: Partial<
      Omit<WorkBuddyTransportOptions, "product" | "sessions" | "settings" | "fetch">
    > = {},
    imageBlobService?: any,
  ) {
    this.toolMessageRequestProcessor = new ToolMessageModelRequestProcessor(imageBlobService);
    this.transport = new WorkBuddyModelTransport({
      product,
      sessions,
      settings,
      fetch: transportFetch,
      ...transportOptions,
    });
    this.transport.registerProcessor({ process: async (request) => { const config = { data: request.body }; await this.toolMessageRequestProcessor.process(config); request.body = config.data; } });
  }

  async getModel(modelName?: string): Promise<Model> {
    if (!modelName) throw new Error("model name is required");
    await this.normalizeLatestSessionResults(this.sessions.getCurrent() ?? this.sessions.sessionSubject.value);

    const auth = this.authentication.current();
    const env = await this.settings.get<Record<string, string>>("env");
    const envBaseURL =
      env?.CODEBUDDY_BASE_URL ?? process.env.CODEBUDDY_BASE_URL;
    const config = this.product.findModelByIdNameOrAlias(modelName);
    const baseURL = this.resolveModelBaseURL({
      ...(envBaseURL ? { envBaseURL } : {}),
      ...(config?.url ? { modelConfigURL: config.url } : {}),
      productEndpoint: this.product.raw.endpoint,
    });
    const apiKey = config?.apiKey ?? auth?.accessToken;
    if (!apiKey) {
      this.authentication.clear();
      throw new Error("AuthenticationRequired");
    }

    const cacheKey = `${baseURL}@${modelName}@:${apiKey}`;
    const cached = this.modelCache.get(cacheKey);
    if (cached) return cached;

    if (this.modelCache.size >= MAX_MODEL_CACHE_SIZE) {
      const remove = MAX_MODEL_CACHE_SIZE / 2;
      for (let index = 0; index < remove; index += 1) {
        const key = this.modelCache.keys().next().value as string | undefined;
        if (key) this.modelCache.delete(key);
      }
    }

    try {
      const client = new OpenAI({
        baseURL,
        apiKey,
        fetch: this.transport.fetch,
        maxRetries: 0,
      });
      const model = new OpenAIChatCompletionsModel(
        client as unknown as ConstructorParameters<
          typeof OpenAIChatCompletionsModel
        >[0],
        modelName,
      );
      this.modelCache.set(cacheKey, model);
      return model;
    } catch (error) {
      if (!apiKey || String(error).includes("OPENAI_API_KEY")) {
        this.authentication.clear();
        throw new Error("AuthenticationRequired", { cause: error });
      }
      throw error;
    }
  }

  resolveModelBaseURL(input: {
    envBaseURL?: string;
    modelConfigURL?: string;
    productEndpoint?: string;
  }): string {
    if (input.modelConfigURL)
      return normalizeChatCompletionsURL(input.modelConfigURL);
    if (input.envBaseURL) return input.envBaseURL;
    if (!input.productEndpoint) {
      throw new Error(
        "Cannot resolve model request endpoint: set CODEBUDDY_BASE_URL or provide product.endpoint",
      );
    }
    return `${input.productEndpoint.replace(/\/+$/, "")}/v2`;
  }

  async normalizeNewToolResults(items: Array<{rawItem: any}>, session: HarnessSession): Promise<void> {
    for (const item of items) if (item.rawItem.type === "function_call_result") await this.functionCallResultAgentInputItemProcessor.process(item.rawItem, session);
  }
  private async normalizeLatestSessionResults(session: HarnessSession | undefined): Promise<void> {
    if (!session) return;
    const result = session.resultSubject.value as any;
    if (result?.newItems.length) await this.normalizeNewToolResults(result.newItems, session);
    // DefaultInputItemProcessor + model-tool telemetry are separate remaining
    // lifecycle dependencies; SessionManager already owns ID/history metadata.
  }
}

export function normalizeChatCompletionsURL(value: string): string {
  const url = new URL(value);
  let path = url.pathname.replace(/\/+$/, "");
  while (path.endsWith("/chat/completions")) {
    path = path.slice(0, -"/chat/completions".length).replace(/\/+$/, "");
  }
  url.pathname = `${path}/chat/completions`;
  return url.toString();
}
