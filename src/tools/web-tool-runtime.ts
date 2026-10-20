import { randomUUID } from "node:crypto";
import { isIP, isIPv4, isIPv6 } from "node:net";
import { IOAUtils } from "../models/ioa-utils.js";
import type { ToolManager } from "./tool-manager.js";
export const WEB_FETCH_API_TIMEOUT_MS = 20000,
  WEB_FETCH_LOCAL_TIMEOUT_MS = 30000,
  WEB_FETCH_MAX_LENGTH = 100000,
  WEB_FETCH_SUMMARY_THRESHOLD = 15000,
  WEB_FETCH_CACHE_TTL_MS = 900000;
export const HTTP_HEADERS = {
  ACCEPT: "Accept",
  CONTENT_TYPE: "Content-Type",
  X_REQUESTED_WITH: "X-Requested-With",
  USER_AGENT: "User-Agent",
  AUTHORIZATION: "Authorization",
};
export const MEDIA_TYPE = {
  APPLICATION_JSON: "application/json",
  APPLICATION_JSON_UTF8: "application/json;charset=UTF-8",
};
export const WEB_REQUEST_HEADERS = {
  AGENT_INTENT: "X-Agent-Intent",
  CONVERSATION_ID_HEADER: "X-Conversation-ID",
  CONVERSATION_REQUEST_ID_HEADER: "X-Conversation-Request-ID",
  CONVERSATION_MESSAGE_ID_HEADER: "X-Conversation-Message-ID",
  REQUEST_ID_HEADER: "X-Request-ID",
  PRODUCT: "X-Product",
  IDE_TYPE_HEADER: "X-IDE-Type",
  IDE_NAME_HEADER: "X-IDE-Name",
  IDE_VERSION_HEADER: "X-IDE-Version",
  USER_ID_HEADER: "X-User-Id",
};
export type WebToolRuntime = {
  configuration(): Promise<any>;
  authentication(): any;
  clientInfo(): Promise<any>;
  settings: { get(key: string): Promise<any> };
  clearSettingsCache(scope: string): void;
  networkConfig(): Promise<any>;
  renderPrompt(name: string, variables: Record<string, any>): Promise<string>;
  analyze(name: string, prompt: string): Promise<string>;
  logger: { warn?(...args: any[]): void };
  telemetry: {
    isReady(): boolean;
    logError(name: string, properties: any): void;
    logInfo(name: string, properties: any): void;
  };
  applyIoaHeaders(
    headers: Record<string, any>,
    env: any,
    options: any,
  ): Promise<void>;
  fetch: typeof fetch;
  env: NodeJS.ProcessEnv;
  uuid(): string;
  chalk: { success(value: any): any; primary(value: any): any };
  getTurndownService(): Promise<{ turndown(html: string): string }>;
};
let turndownService: Promise<{ turndown(html: string): string }> | undefined;
export function getTurndownService(): Promise<{
  turndown(html: string): string;
}> {
  return (turndownService ??= import("turndown")
    .then((module) => new module.default({ headingStyle: "atx" }))
    .catch((error) => {
      turndownService = undefined;
      throw error;
    }));
}
/** Explicit DI defaults, not the original global container or security center. */
export function createWebToolRuntime(
  options: Partial<WebToolRuntime> = {},
): WebToolRuntime {
  const settings = options.settings ?? { get: async () => undefined },
    env = options.env ?? process.env;
  return {
    configuration: async () => ({}),
    authentication: () => undefined,
    clientInfo: async () => ({}),
    clearSettingsCache() {},
    networkConfig: async () => {
      throw new Error("Network config provider is unavailable");
    },
    renderPrompt: async () => {
      throw new Error("PromptRenderer is unavailable");
    },
    analyze: async () => {
      throw new Error("AgentService is unavailable");
    },
    logger: {},
    telemetry: { isReady: () => false, logError() {}, logInfo() {} },
    applyIoaHeaders: (headers, value, config) =>
      IOAUtils.applyIOADefaultHeaders(headers, value, config, settings, env),
    fetch: (...args) => fetch(...args),
    uuid: randomUUID,
    chalk: { success: (value) => value, primary: (value) => value },
    getTurndownService,
    ...options,
    settings,
    env,
  };
}
export function registerWebTool(
  tool: {
    name: string;
    parameters: any;
    execute(...args: any[]): Promise<any>;
    aliases?: string[];
    resolveNeedPermissionArgs?(...args: any[]): any;
  },
  tools: ToolManager,
): void {
  tools.register(tool.name, {
    parameters: tool.parameters,
    parseInput: false,
    ...(tool.aliases ? { aliases: tool.aliases } : {}),
    ...(tool.resolveNeedPermissionArgs
      ? {
          resolveNeedPermissionArgs: (...args) =>
            tool.resolveNeedPermissionArgs!(...args),
        }
      : {}),
    execute: (...args) => tool.execute(...args),
  });
}
export function cleanHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "")
    .replace(
      /<textarea[^>]*style\s*=\s*["'][^"']*display\s*:\s*none[^"']*["'][^>]*>[\s\S]*?<\/textarea>/gi,
      "",
    );
}
export function matchDomainPattern(host: string, pattern: string): boolean {
  if (!pattern) return false;
  if (pattern === host) return true;
  if (pattern.startsWith("*.")) {
    const suffix = pattern.slice(2);
    return host === suffix || host.endsWith("." + suffix);
  }
  return false;
}
export function isPrivateHost(host: string): boolean {
  if (isIP(host)) return isPrivateIP(host);
  const value = host.toLowerCase();
  return value === "localhost" || value.endsWith(".localhost");
}
export function isPrivateIP(ip: string): boolean {
  if (isIPv4(ip)) {
    const parts = ip.split(".").map(Number);
    return (
      parts[0] === 10 ||
      (parts[0] === 172 && parts[1]! >= 16 && parts[1]! <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      parts[0] === 127 ||
      (parts[0] === 169 && parts[1] === 254) ||
      parts[0] === 0 ||
      false
    );
  }
  if (isIPv6(ip)) {
    const value = ip.toLowerCase();
    if (
      value === "::1" ||
      value.startsWith("fe80:") ||
      value.startsWith("fe80") ||
      value.startsWith("fc") ||
      value.startsWith("fd") ||
      value === "::"
    )
      return true;
  }
  return false;
}
export function isNodeError(error: any): boolean {
  return error instanceof Error && "code" in error;
}
export function getErrorMessage(error: any): string {
  if (error instanceof Error) return error.message;
  try {
    return String(error);
  } catch {
    return "Failed to get error details";
  }
}
