import { randomUUID } from "node:crypto";
import type { ProductConfiguration } from "../config/product-config.js";
import type { ProductModel } from "../config/types.js";
import type { HarnessSession } from "../sessions/session.js";
import type { SessionManager } from "../sessions/session-manager.js";
import type { SettingsManager } from "./model-provider.js";
import {
  createStreamingTextProcessor,
  getHeaderCaseInsensitive,
  injectReasoningSummaryIfNeeded,
  isCustomModelRequest,
  isRecord,
  mergeRequestProviderData,
  parseCustomHeaders,
  parseSSEChunk,
  requestWithConnectionRetry,
  setHeaderCaseInsensitive,
} from "./model-transport-utils.js";
import { normalizeChatCompletionsURL } from "./model-provider.js";

export const MODEL_HEADERS = {
  traceId: "X-Trace-ID",
  requestId: "X-Request-ID",
  rootRequestId: "X-Root-Request-ID",
  conversationId: "X-Conversation-ID",
  conversationRequestId: "X-Conversation-Request-ID",
  conversationMessageId: "X-Conversation-Message-ID",
  agentIntent: "X-Agent-Intent",
  agentPurpose: "X-Agent-Purpose",
  product: "X-Product",
  ideType: "X-IDE-Type",
  ideName: "X-IDE-Name",
  ideVersion: "X-IDE-Version",
  apiKey: "X-API-Key",
  privateData: "X-Private-Data",
  skipAuthInterceptor: "X-Skip-Auth-Interceptor",
} as const;

export const DEFAULT_STREAM_TIMEOUT_MS = 1_200_000;
export const DEFAULT_FIRST_TOKEN_TIMEOUT_MS = 1_200_000;
export const FINISH_REASON_GRACE_MS = 5_000;

export type ClientInfo = {
  ideType?: string;
  platform?: string;
  platformVersion?: string;
};

export interface ClientInfoProvider {
  get(): Promise<ClientInfo>;
}

export type MutableModelRequest = {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: BodyInit | null | undefined;
  signal?: AbortSignal;
  modelId?: string;
};

export interface ModelRequestProcessor {
  priority?: number;
  process(request: MutableModelRequest): Promise<void> | void;
}

export type WorkBuddyTransportOptions = {
  product: ProductConfiguration;
  sessions: SessionManager;
  settings: SettingsManager;
  fetch?: typeof fetch;
  clientInfo?: ClientInfoProvider;
  internalModelRequestHeaders?: () => Record<string, string> | undefined;
  alwaysThinkingEnabled?: () => Promise<boolean> | boolean;
  streamTimeoutMs?: number;
  firstTokenTimeoutMs?: number;
  finishReasonGraceMs?: number;
};

export class StreamTimeoutError extends Error {
  override name = "StreamTimeoutError";

  constructor(
    readonly timeoutMs: number,
    readonly chunkCount = 0,
    readonly totalBytes = 0,
    readonly isFirstTokenTimeout = false,
  ) {
    super(
      `Stream timeout: no data received for ${timeoutMs}ms`,
    );
  }
  get firstToken(): boolean { return this.isFirstTokenTimeout; }
}

export class EmptyStreamError extends StreamTimeoutError {
  override name = "EmptyStreamError";

  constructor(
    chunkCount: number,
    totalBytes: number,
  ) {
    super(0, chunkCount, totalBytes, false);
    this.message = `Empty stream: upstream gateway sent only placeholder chunks without any model output (chunks=${chunkCount}, bytes=${totalBytes})`;
  }
}

export class WorkBuddyModelTransport {
  private readonly processors: ModelRequestProcessor[] = [];
  private readonly transportFetch: typeof fetch;

  constructor(private readonly options: WorkBuddyTransportOptions) {
    this.transportFetch = options.fetch ?? fetch;
  }

  registerProcessor(processor: ModelRequestProcessor): () => void {
    this.processors.push(processor);
    return () => {
      const index = this.processors.indexOf(processor);
      if (index >= 0) this.processors.splice(index, 1);
    };
  }

  readonly fetch: typeof fetch = async (input, init) => {
    const session =
      this.options.sessions.getCurrent() ??
      this.options.sessions.sessionSubject.getValue();
    if (!session) throw new Error("Model request has no active session");

    const request = await this.buildRequest(input, init, session);
    for (const processor of [...this.processors].sort(
      (left, right) => (left.priority ?? 1_000) - (right.priority ?? 1_000),
    )) {
      await processor.process(request);
    }

    const response = await requestWithConnectionRetry(
      () => {
        const requestInit: RequestInit = {
          method: request.method,
          headers: request.headers,
          ...(request.body !== undefined ? { body: request.body } : {}),
          ...(request.signal ? { signal: request.signal } : {}),
        };
        return this.transportFetch(request.url, requestInit);
      },
      request.signal,
    );

    if (!isStreamingRequest(request) || !response.body) return response;
    return this.monitorStream(response, session, request.signal);
  };

  private async buildRequest(
    input: RequestInfo | URL,
    init: RequestInit | undefined,
    session: HarnessSession,
  ): Promise<MutableModelRequest> {
    const source = input instanceof Request ? input : undefined;
    let url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
    const method = init?.method ?? source?.method ?? "GET";
    const headers = headersToRecord(init?.headers ?? source?.headers);
    let body: BodyInit | null | undefined = init?.body;
    if (body === undefined && source && source.body) body = await source.clone().text();

    session.messageId = randomUUID().replace(/-/g, "");
    const info = (await this.options.clientInfo?.get()) ?? {};
    headers[MODEL_HEADERS.conversationId] = session.id;
    headers[MODEL_HEADERS.conversationRequestId] =
      session.conversationRequestId ?? "";
    headers[MODEL_HEADERS.conversationMessageId] = session.messageId;
    headers[MODEL_HEADERS.requestId] = session.messageId;
    headers[MODEL_HEADERS.agentIntent] =
      String(session.meta["codebuddy.ai/mode"] ?? "craft");
    if (process.env.PERSONAL_AGENT_ROLE) {
      headers[MODEL_HEADERS.agentPurpose] = "person_agent";
    } else if (session.agentPurpose) {
      headers[MODEL_HEADERS.agentPurpose] = session.agentPurpose;
    }
    headers[MODEL_HEADERS.ideType] = info.ideType ?? "CLI";
    headers[MODEL_HEADERS.ideName] = info.platform ?? process.platform;
    headers[MODEL_HEADERS.ideVersion] = info.platformVersion ?? "0.0.0";

    let parsedBody = await parseRequestBody(body);
    let changed = false;
    const modelId =
      isRecord(parsedBody) && typeof parsedBody.model === "string"
        ? parsedBody.model
        : undefined;
    const model = modelId
      ? this.options.product.findModelByIdNameOrAlias(modelId)
      : undefined;

    if (model?.url) {
      if (model.useCustomProtocol) url = model.url;
      else {
        url = isCustomModelRequest(modelId, model)
          ? normalizeChatCompletionsURL(model.url)
          : model.url;
      }
    }
    if (!model?.useCustomProtocol && /\/chat\/completions(?:[/?#]|$)/.test(url)) {
      url = normalizeChatCompletionsURL(url);
    }

    const providerData = session.requestOptions.providerData;
    const isSelfHosted =
      (process.env.CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT ??
        this.options.product.raw.deploymentType) === "selfhosted";
    if (
      providerData &&
      (!isCustomModelRequest(modelId, model) || isSelfHosted)
    ) {
      const merged = mergeRequestProviderData(parsedBody, providerData);
      changed ||= merged !== parsedBody;
      parsedBody = merged;
    }

    const customHeaders = await this.getCustomHeaders(model);
    for (const [name, value] of Object.entries(customHeaders)) {
      setHeaderCaseInsensitive(headers, name, value);
    }
    // The OpenAI client supplies these in lower case; WorkBuddy removes those
    // raw defaults after merging its own model/session headers.
    delete headers.authorization;
    delete headers["user-agent"];

    if (isCustomModelRequest(modelId, model)) {
      deleteHeaderCaseInsensitive(headers, MODEL_HEADERS.privateData);
    }

    const internalHeaders = this.options.internalModelRequestHeaders?.();
    if (model && !isCustomModelRequest(modelId, model) && internalHeaders) {
      for (const [name, value] of Object.entries(internalHeaders)) {
        setHeaderCaseInsensitive(headers, name, value);
      }
    }

    setHeaderCaseInsensitive(headers, MODEL_HEADERS.requestId, session.messageId);
    setHeaderCaseInsensitive(
      headers,
      MODEL_HEADERS.conversationMessageId,
      session.messageId,
    );
    const rootRequestId = session.meta.rootRequestId;
    if (typeof rootRequestId === "string" && rootRequestId.length > 0) {
      setHeaderCaseInsensitive(headers, MODEL_HEADERS.rootRequestId, rootRequestId);
    }

    if (isRecord(parsedBody)) {
      const injectedReasoningSummary = injectReasoningSummaryIfNeeded(
        parsedBody,
        (await this.options.alwaysThinkingEnabled?.()) === true,
      );
      changed = injectedReasoningSummary || changed;
      if (modelId?.startsWith("custom-local:") && parsedBody.model === modelId) {
        parsedBody.model = modelId.slice("custom-local:".length);
        changed = true;
      }
      const flattenedImageContent = flattenUnsupportedImageContent(
        parsedBody,
        model,
      );
      changed = flattenedImageContent || changed;
      if (
        isCustomModelRequest(modelId, model) &&
        model?.supportsToolCall === false &&
        (this.options.product.raw.productFeatures as
          | Record<string, unknown>
          | undefined)?.SkipToolCallSupportCheck !== true
      ) {
        if (parsedBody.tools !== undefined || parsedBody.tool_choice !== undefined) {
          delete parsedBody.tools;
          delete parsedBody.tool_choice;
          changed = true;
        }
      }
      if (hasGrowthEvent(parsedBody)) {
        if (session.conversationRequestId) {
          session.requestOptions.growthEventRequestId =
            session.conversationRequestId;
        } else {
          delete session.requestOptions.growthEventRequestId;
        }
      }
    }

    const env = await this.options.settings.get<Record<string, string>>("env");
    const skipInternal =
      env?.CODEBUDDY_SKIP_INTERNAL_HEADERS ??
      process.env.CODEBUDDY_SKIP_INTERNAL_HEADERS;
    if (skipInternal) {
      stripInternalHeaders(headers, Object.keys(internalHeaders ?? {}));
      headers[MODEL_HEADERS.skipAuthInterceptor] = "1";
    }

    if (changed && typeof body === "string" && isRecord(parsedBody)) {
      body = JSON.stringify(parsedBody);
    } else if (isRecord(parsedBody) && typeof body !== "string") {
      body = JSON.stringify(parsedBody);
    }

    const signal = init?.signal ?? source?.signal ?? undefined;
    return {
      url,
      method,
      headers,
      body,
      ...(signal ? { signal } : {}),
      ...(modelId ? { modelId } : {}),
    };
  }

  private async getCustomHeaders(
    model: ProductModel | undefined,
  ): Promise<Record<string, string>> {
    const env = await this.options.settings.get<Record<string, string>>("env");
    const processHeaders = parseCustomHeaders(process.env.CODEBUDDY_CUSTOM_HEADERS);
    const settingsHeaders = parseCustomHeaders(env?.CODEBUDDY_CUSTOM_HEADERS);
    const optimization = await this.options.settings.get<{ enabled?: boolean }>(
      "enableModelOptimization",
    );
    settingsHeaders[MODEL_HEADERS.privateData] =
      optimization?.enabled === false ? "true" : "false";
    const result = {
      ...processHeaders,
      ...settingsHeaders,
      ...(this.options.sessions.getCurrent()?.requestOptions.headers ?? {}),
    };
    if (!process.env.CODEBUDDY_API_KEY_DISABLED) {
      const apiKey =
        model?.apiKey ?? env?.CODEBUDDY_API_KEY ?? process.env.CODEBUDDY_API_KEY;
      if (apiKey) {
        result[MODEL_HEADERS.apiKey] = apiKey;
        result.Authorization = `Bearer ${apiKey}`;
      }
    }
    return result;
  }

  private monitorStream(
    response: Response,
    session: HarnessSession,
    signal?: AbortSignal,
  ): Response {
    const reader = response.body!.getReader();
    const processor = createStreamingTextProcessor();
    const streamTimeout = positiveTimeout(
      this.options.streamTimeoutMs,
      process.env.CODEBUDDY_STREAM_TIMEOUT_MS,
      DEFAULT_STREAM_TIMEOUT_MS,
    );
    const firstTokenTimeout = positiveTimeout(
      this.options.firstTokenTimeoutMs,
      process.env.CODEBUDDY_FIRST_TOKEN_TIMEOUT_MS,
      DEFAULT_FIRST_TOKEN_TIMEOUT_MS,
    );
    const finishGrace =
      this.options.finishReasonGraceMs ?? FINISH_REASON_GRACE_MS;
    const skipFirstTokenTimeout =
      Number(session.meta.firstTokenTimeoutRetryCount ?? 0) >= 1;

    const monitored = new ReadableStream<Uint8Array>({
      start(controller) {
        let chunkCount = 0;
        let totalBytes = 0;
        let meaningful = skipFirstTokenTimeout;
        let finished = false;
        let stopped = false;
        let lastDataAt = Date.now();
        let firstTimer: ReturnType<typeof setTimeout> | undefined;
        let idleTimer: ReturnType<typeof setInterval> | undefined;
        let graceTimer: ReturnType<typeof setTimeout> | undefined;

        const cleanup = () => {
          if (firstTimer) clearTimeout(firstTimer);
          if (idleTimer) clearInterval(idleTimer);
          if (graceTimer) clearTimeout(graceTimer);
          signal?.removeEventListener("abort", abort);
        };
        const fail = (error: unknown) => {
          if (stopped) return;
          stopped = true;
          cleanup();
          void reader.cancel(error).catch(() => undefined);
          controller.error(error);
        };
        const close = () => {
          if (stopped) return;
          stopped = true;
          cleanup();
          const tail = processor.flush();
          if (tail) controller.enqueue(tail);
          controller.close();
          void reader.cancel().catch(() => undefined);
        };
        const startIdleMonitor = () => {
          if (idleTimer) return;
          idleTimer = setInterval(() => {
            if (Date.now() - lastDataAt < streamTimeout) return;
            if (finished) close();
            else
              fail(
                new StreamTimeoutError(
                  streamTimeout,
                  chunkCount,
                  totalBytes,
                ),
              );
          }, Math.min(1_000, streamTimeout));
          idleTimer.unref?.();
        };
        const abort = () => {
          if (stopped) return;
          stopped = true;
          cleanup();
          void reader.cancel(signal?.reason).catch(() => undefined);
          controller.close();
        };
        signal?.addEventListener("abort", abort, { once: true });
        if (signal?.aborted) return abort();

        if (skipFirstTokenTimeout) startIdleMonitor();
        else {
          firstTimer = setTimeout(() => {
            if (!meaningful) {
              fail(
                new StreamTimeoutError(
                  firstTokenTimeout,
                  chunkCount,
                  totalBytes,
                  true,
                ),
              );
            }
          }, firstTokenTimeout);
          firstTimer.unref?.();
        }

        void (async () => {
          try {
            while (!stopped) {
              const next = await reader.read();
              if (next.done) {
                if (!stopped) close();
                return;
              }
              const chunk = next.value;
              chunkCount += 1;
              totalBytes += chunk.byteLength;
              lastDataAt = Date.now();
              const info = parseSSEChunk(chunk);
              if (info.chunkId && session.telemetry && !session.telemetry.chunkId) {
                session.telemetry.chunkId = info.chunkId;
              }
              if (!meaningful && info.finishReason === "error") {
                fail(new EmptyStreamError(chunkCount, totalBytes));
                return;
              }
              if (!meaningful && info.hasContent) {
                meaningful = true;
                if (session.telemetry) session.telemetry.firstTokenAt = Date.now();
                if (firstTimer) clearTimeout(firstTimer);
                startIdleMonitor();
              }
              if (!finished && info.finishReason) {
                finished = true;
                graceTimer = setTimeout(close, finishGrace);
                graceTimer.unref?.();
              }
              const output = processor.process(chunk);
              if (output) controller.enqueue(output);
            }
          } catch (error) {
            fail(error);
          }
        })();
      },
      cancel(reason) {
        return reader.cancel(reason);
      },
    });

    return new Response(monitored, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }
}

function headersToRecord(value: HeadersInit | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!value) return result;
  new Headers(value).forEach((headerValue, name) => {
    result[name] = headerValue;
  });
  return result;
}

async function parseRequestBody(
  body: BodyInit | null | undefined,
): Promise<unknown> {
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  }
  if (body instanceof Uint8Array) {
    try {
      return JSON.parse(Buffer.from(body).toString("utf8"));
    } catch {
      return body;
    }
  }
  return body;
}

function flattenUnsupportedImageContent(
  body: Record<string, any>,
  model: ProductModel | undefined,
): boolean {
  if (
    !model?.tags?.includes("custom") ||
    model.supportsImages !== false ||
    !Array.isArray(body.messages)
  ) {
    return false;
  }
  let changed = false;
  for (const message of body.messages) {
    if (!Array.isArray(message?.content)) continue;
    message.content = message.content
      .filter((part: any) => part?.type === "text")
      .map((part: any) => part.text)
      .join("\n");
    changed = true;
  }
  return changed;
}

function hasGrowthEvent(body: Record<string, any>): boolean {
  return (
    isRecord(body.extra_vars) && typeof body.extra_vars.growthEvent === "string"
  );
}

function isStreamingRequest(request: MutableModelRequest): boolean {
  return (
    getHeaderCaseInsensitive(request.headers, "accept") === "text/event-stream" ||
    request.url.includes("stream=true") ||
    (typeof request.body === "string" && request.body.includes('"stream":true'))
  );
}

function positiveTimeout(
  explicit: number | undefined,
  environment: string | undefined,
  fallback: number,
): number {
  if (explicit !== undefined && explicit > 0) return explicit;
  if (environment) {
    const parsed = Number.parseInt(environment, 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return fallback;
}

function deleteHeaderCaseInsensitive(
  headers: Record<string, string>,
  name: string,
): void {
  const key = Object.keys(headers).find(
    (candidate) => candidate.toLowerCase() === name.toLowerCase(),
  );
  if (key) delete headers[key];
}

function stripInternalHeaders(
  headers: Record<string, string>,
  pluginHeaderNames: string[],
): void {
  const blocked = new Set(
    [
      MODEL_HEADERS.conversationId,
      MODEL_HEADERS.conversationRequestId,
      MODEL_HEADERS.conversationMessageId,
      MODEL_HEADERS.requestId,
      MODEL_HEADERS.agentIntent,
      MODEL_HEADERS.agentPurpose,
      MODEL_HEADERS.ideType,
      MODEL_HEADERS.ideName,
      MODEL_HEADERS.ideVersion,
      MODEL_HEADERS.product,
      MODEL_HEADERS.apiKey,
      MODEL_HEADERS.privateData,
      ...pluginHeaderNames,
      "X-User-Id",
      "X-Enterprise-Id",
      "X-Department-Info",
      "X-Tenant-Id",
      "X-Domain",
      "User-Agent",
      "X-Requested-With",
    ].map((name) => name.toLowerCase()),
  );
  for (const name of Object.keys(headers)) {
    const lower = name.toLowerCase();
    if (blocked.has(lower) || lower.startsWith("x-stainless-")) {
      delete headers[name];
    }
  }
}
