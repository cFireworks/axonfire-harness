import { StringDecoder } from "node:string_decoder";
import type { ProductModel } from "../config/types.js";

export type SSEChunkInfo = {
  hasContent: boolean;
  finishReason: string | null;
  chunkId?: string;
};

export function isRecord(value: unknown): value is Record<string, any> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function isCustomModelRequest(
  modelId: string | undefined,
  model: ProductModel | undefined,
): boolean {
  const id = modelId ?? model?.id;
  return Boolean(
    id?.startsWith("custom-local:") ||
      id?.startsWith("custom:") ||
      model?.trustLevel === "custom" ||
      model?.tags?.includes("custom"),
  );
}

export function mergeRequestProviderData(
  body: unknown,
  providerData: Record<string, unknown> | undefined,
): unknown {
  if (!providerData || !isRecord(body)) return body;
  const incomingExtra = isRecord(providerData.extra_vars)
    ? providerData.extra_vars
    : undefined;
  const bodyExtra = isRecord(body.extra_vars) ? body.extra_vars : {};
  return {
    ...body,
    ...providerData,
    ...(incomingExtra
      ? { extra_vars: { ...bodyExtra, ...incomingExtra } }
      : {}),
  };
}

export function parseCustomHeaders(
  value: string | undefined,
): Record<string, string> {
  if (!value) return {};
  const lines = value.includes("\\n")
    ? value.split("\\n")
    : value.includes("\n")
      ? value.split("\n")
      : [value];
  const result: Record<string, string> = {};
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const name = line.slice(0, separator).trim();
    const headerValue = line.slice(separator + 1).trim();
    if (name && headerValue) result[name] = headerValue;
  }
  return result;
}

export function getHeaderCaseInsensitive(
  headers: Record<string, string>,
  name: string,
): string | undefined {
  const key = Object.keys(headers).find(
    (candidate) => candidate.toLowerCase() === name.toLowerCase(),
  );
  return key ? headers[key] : undefined;
}

export function setHeaderCaseInsensitive(
  headers: Record<string, string>,
  name: string,
  value: string,
): void {
  const key = Object.keys(headers).find(
    (candidate) => candidate.toLowerCase() === name.toLowerCase(),
  );
  if (key) delete headers[key];
  headers[name] = value;
}

export function parseSSEChunk(chunk: Uint8Array | Buffer): SSEChunkInfo {
  let chunkId: string | undefined;
  let hasContent = false;
  let finishReason: string | null = null;
  try {
    for (const rawLine of Buffer.from(chunk).toString("utf8").split("\n")) {
      const line = rawLine.trim();
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const parsed = JSON.parse(payload) as any;
        if (
          !chunkId &&
          typeof parsed?.id === "string" &&
          parsed.id.length > 0
        ) {
          chunkId = parsed.id;
        }
        if (!Array.isArray(parsed?.choices) || parsed.choices.length === 0)
          continue;
        for (const choice of parsed.choices) {
          if (
            typeof choice.finish_reason === "string" &&
            choice.finish_reason !== ""
          ) {
            hasContent = true;
            finishReason = choice.finish_reason;
          }
          const delta = choice.delta;
          if (!delta) continue;
          const hasText =
            typeof delta.content === "string" && delta.content.length > 0;
          const hasReasoning =
            (typeof delta.reasoning_content === "string" &&
              delta.reasoning_content.length > 0) ||
            (typeof delta.reasoning === "string" && delta.reasoning.length > 0);
          const hasTools =
            Array.isArray(delta.tool_calls) && delta.tool_calls.length > 0;
          if (hasText || hasReasoning || hasTools) hasContent = true;
        }
        if (hasContent && finishReason) break;
      } catch {
        // Incomplete SSE line; a later chunk may complete it.
      }
    }
  } catch {
    // WorkBuddy treats malformed monitoring data as non-content, not transport failure.
  }
  return {
    hasContent,
    finishReason,
    ...(chunkId ? { chunkId } : {}),
  };
}

export function normalizeStreamingToolCallIds(
  text: string,
  seenIds: Set<string>,
): string {
  if (!text.includes("tool_calls")) return text;
  const lines = text.split("\n");
  let changed = false;
  for (let index = 0; index < lines.length; index += 1) {
    const raw = lines[index]!;
    const trimmed = raw.trim();
    if (!trimmed.startsWith("data:")) continue;
    const payload = trimmed.slice(5).trimStart();
    if (!payload || payload === "[DONE]") continue;
    try {
      const parsed = JSON.parse(payload) as any;
      const toolCalls = parsed?.choices?.[0]?.delta?.tool_calls;
      if (!Array.isArray(toolCalls) || toolCalls.length === 0) continue;
      let lineChanged = false;
      for (const call of toolCalls) {
        if (typeof call.id !== "string" || call.id === "") continue;
        if (seenIds.has(call.id)) {
          delete call.id;
          lineChanged = true;
        } else {
          seenIds.add(call.id);
        }
      }
      if (lineChanged) {
        lines[index] =
          `${raw.startsWith("data: ") ? "data: " : "data:"}${JSON.stringify(parsed)}`;
        changed = true;
      }
    } catch {
      // Preserve malformed or partial SSE data byte-for-byte.
    }
  }
  return changed ? lines.join("\n") : text;
}

export function createStreamingTextProcessor(): {
  process(chunk: Uint8Array): Uint8Array | null;
  flush(): Uint8Array | null;
} {
  const decoder = new StringDecoder("utf8");
  const encoder = new TextEncoder();
  const seenIds = new Set<string>();
  return {
    process(chunk) {
      const text = decoder.write(Buffer.from(chunk));
      return text.length === 0
        ? null
        : encoder.encode(normalizeStreamingToolCallIds(text, seenIds));
    },
    flush() {
      const text = decoder.end();
      return text.length > 0 ? encoder.encode(text) : null;
    },
  };
}

export function isConnectionLevelRetryableError(error: unknown): boolean {
  if (!isRecord(error) || error.response !== undefined) return false;
  const code = typeof error.code === "string" ? error.code : "";
  const message =
    typeof error.message === "string" ? error.message.toLowerCase() : "";
  return (
    new Set([
      "ECONNRESET",
      "ECONNREFUSED",
      "ETIMEDOUT",
      "EAI_AGAIN",
      "EPIPE",
      "UND_ERR_SOCKET",
      "ERR_STREAM_PREMATURE_CLOSE",
    ]).has(code) || message.includes("socket hang up")
  );
}

export async function requestWithConnectionRetry<T>(
  request: () => Promise<T>,
  signal?: AbortSignal,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= 1; attempt += 1) {
    try {
      return await request();
    } catch (error) {
      lastError = error;
      if (
        attempt >= 1 ||
        signal?.aborted ||
        !isConnectionLevelRetryableError(error)
      ) {
        break;
      }
    }
  }
  throw lastError;
}

export function sanitizeURLForTrace(value: string): string {
  return value.replace(
    /([?&])(key|token|api_key|apikey|secret|password)=[^&]*/gi,
    "$1$2=***",
  );
}

export function injectReasoningSummaryIfNeeded(
  body: Record<string, any>,
  alwaysThinkingEnabled: boolean,
): boolean {
  const thinking =
    alwaysThinkingEnabled ||
    typeof body.reasoning_effort === "string" ||
    typeof body.reasoning?.effort === "string";
  if (!thinking || body.reasoning_summary) return false;
  body.reasoning_summary = "auto";
  return true;
}
