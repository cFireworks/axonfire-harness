import { existsSync, readFileSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { dirname, join, parse, resolve } from "node:path";
import * as os from "node:os";
import type { AgentManager } from "../agents/agent-manager.js";
import type { SettingsManager } from "../models/model-provider.js";
import type { ProductConfiguration } from "../config/product-config.js";
import type { HarnessSession } from "../sessions/session.js";

export type PromptContext = Record<string, unknown>;
export interface PromptContextInitializer { initialize(context: PromptContext): Promise<void>; }
/** Sequential initializers, sharing only an in-flight resolution (not a permanent cache). */
export class PromptContextProvider {
  private pendingPromise: Promise<PromptContext> | null = null;
  constructor(readonly initializers: readonly PromptContextInitializer[]) {}
  async get(): Promise<PromptContext> {
    if (this.pendingPromise) return this.pendingPromise;
    this.pendingPromise = this.resolve();
    try { return await this.pendingPromise; } finally { this.pendingPromise = null; }
  }
  async resolve(): Promise<PromptContext> {
    const context: PromptContext = {};
    for (const initializer of this.initializers) await initializer.initialize(context);
    return context;
  }
}
const positiveInteger = (value: unknown): number | undefined => {
  if (value == null) return undefined;
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : undefined;
};
const BASE_BASH_DEFAULT = positiveInteger(process.env.BASH_DEFAULT_TIMEOUT_MS) ?? 120_000;
const BASE_BASH_MAX = positiveInteger(process.env.BASH_MAX_TIMEOUT_MS) ?? 600_000;
export class SystemInfoPromptContextInitializer implements PromptContextInitializer {
  constructor(private readonly paths: { workDir(): string; homeDir(): string; detectShell?: () => string }, private readonly settings: SettingsManager) {}
  async initialize(context: PromptContext): Promise<void> {
    Object.assign(context, { platform: os.platform(), version: os.version(), date: new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "short", day: "numeric" }),
      workDir: this.paths.workDir(), defaultShell: this.detectShell(), homeDir: os.homedir(), codebuddyHome: this.paths.homeDir(), isWsl: this.detectWsl() });
    try {
      const env = await this.settings.get<Record<string, string>>("env");
      context.bashMaxTimeoutMs = positiveInteger(env?.BASH_MAX_TIMEOUT_MS) ?? BASE_BASH_MAX;
      context.bashDefaultTimeoutMs = positiveInteger(env?.BASH_DEFAULT_TIMEOUT_MS) ?? BASE_BASH_DEFAULT;
    } catch { context.bashMaxTimeoutMs = BASE_BASH_MAX; context.bashDefaultTimeoutMs = BASE_BASH_DEFAULT; }
  }
  detectShell(): string {
    try {
      if (this.paths.detectShell) return this.paths.detectShell();
      const requested = process.env.CODEBUDDY_CODE_SHELL;
      if (requested) { if (["bash", "zsh", "sh", "powershell"].includes(requested)) return requested; throw new Error("Unsupported shell type"); }
      if (process.platform === "win32") return "powershell";
      const shell = process.env.SHELL;
      if (shell && existsSync(shell)) {
        const name = shell.toLowerCase().split("/").at(-1) || "sh";
        return ["bash", "zsh", "fish", "ksh", "tcsh", "csh"].find((type) => name.startsWith(type)) ?? "sh";
      }
      return "sh";
    } catch { return process.platform === "win32" ? "powershell" : "bash"; }
  }
  detectWsl(): boolean {
    if (os.platform() !== "linux") return false;
    if (process.env.WSL_DISTRO_NAME || process.env.WSL_INTEROP) return true;
    try { return /microsoft|wsl/.test(readFileSync("/proc/version", "utf8").toLowerCase()); } catch { return false; }
  }
}
export class GitPromptContextInitializer implements PromptContextInitializer {
  constructor(private readonly workDir: () => string) {}
  async initialize(context: PromptContext): Promise<void> {
    let directory = resolve(this.workDir()), root: string | undefined;
    for (;;) { if (existsSync(join(directory, ".git"))) { root = directory; break; } const parent = dirname(directory); if (parent === directory) break; directory = parent; }
    if (root) context.gitRoot = root;
    context.isGitRepo = Boolean(root);
  }
}
const CHINESE = "当前处于中文环境，使用简体中文回答 (Speak in Chinese).";
const ENGLISH = "Your output language MUST be English by default.\nIf the user's message (<user_query>) is written in Chinese, respond in Chinese instead.\nIMPORTANT: Base your language decision solely on the natural language of the user's message, not on technical content like code, paths, or logs.";
export class SettingsPromptContextInitializer implements PromptContextInitializer {
  constructor(private readonly settings: SettingsManager) {}
  resolveResponseLanguage(settings: Record<string, any>): string {
    if (settings.language) return /中文|chinese|zh/i.test(settings.language) ? CHINESE : ENGLISH;
    return (process.env.LANG || process.env.LC_ALL || process.env.LANGUAGE || "").toLowerCase().startsWith("zh") ? CHINESE : ENGLISH;
  }
  async initialize(context: PromptContext): Promise<void> {
    const settings = await this.settings.list?.() ?? {};
    context.settings = settings;
    if (settings.language) context.language = settings.language;
    context.ResponseLanguage = this.resolveResponseLanguage(settings);
  }
}
export class ModelPromptContextInitializer implements PromptContextInitializer {
  constructor(private readonly agents: AgentManager, private readonly current: () => HarnessSession | undefined) {}
  async initialize(context: PromptContext): Promise<void> {
    if (!this.agents.ready) return;
    const session = this.current(), configured = session?.options.model;
    let id = configured, name = configured, images: boolean | undefined;
    const agent = await this.agents.getDefault();
    if (configured) {
      const model = (await this.agents.getModels(agent.name)).find((model) => model.id === configured || model.name === configured);
      if (model) { name = model.name; images = model.supportsImages; }
    } else {
      const model = await this.agents.getModel(agent.name);
      id = model.id; name = model.name; images = model.supportsImages;
    }
    context.modelId = id || "Unknown"; context.modelName = name || "Unknown";
    if (images !== undefined) context.modelSupportsImages = images;
  }
}
export class SessionPromptContextInitializer implements PromptContextInitializer {
  constructor(private readonly current: () => HarnessSession | undefined) {}
  async initialize(context: PromptContext): Promise<void> { const session = this.current(); if (session) context.sessionId = session.id; }
}
export class ProductFeaturePromptContextInitializer implements PromptContextInitializer {
  constructor(private readonly product: ProductConfiguration) {}
  async initialize(context: PromptContext): Promise<void> { context.productFeatures = this.product.raw.productFeatures ?? {}; }
}
export class MemoryPromptContextInitializer implements PromptContextInitializer {
  constructor(private readonly getMemory: (scope: "user" | "project") => Promise<unknown>) {}
  async initialize(context: PromptContext): Promise<void> { context.userMemory = await this.getMemory("user"); context.projectMemory = await this.getMemory("project"); }
}
export class CliDocsPromptContextInitializer implements PromptContextInitializer {
  private cached: string | null | undefined;
  constructor(private readonly root: string) {}
  async initialize(context: PromptContext): Promise<void> {
    if (this.cached === undefined) { const directory = join(this.root, "dist/web-ui/docs"); this.cached = await stat(directory).then((value) => value.isDirectory() ? directory : null).catch(() => null); }
    if (this.cached) context.cliDocsDir = this.cached;
  }
}
type PromptVarValue = string | number | boolean | null;
export class PromptVarsFileContextInitializer implements PromptContextInitializer {
  private activeFilePath: string | undefined;
  private cachedSnapshot: { filePath: string; variables: Record<string, PromptVarValue> } | undefined;
  private pendingLoad: { filePath: string; promise: Promise<{ filePath: string; variables: Record<string, PromptVarValue> }> } | undefined;
  constructor(private readonly getFilename: () => unknown) {}
  async initialize(context: PromptContext): Promise<void> {
    const option = this.getFilename();
    if (typeof option !== "string" || !option.trim()) { this.selectFile(undefined); return; }
    const path = resolve(option.trim()); this.selectFile(path);
    this.mergeVariables(context, (await this.getSnapshot(path)).variables);
  }
  selectFile(path: string | undefined): void { if (this.activeFilePath !== path) { this.activeFilePath = path; this.cachedSnapshot = undefined; this.pendingLoad = undefined; } }
  async getSnapshot(path: string): Promise<{ filePath: string; variables: Record<string, PromptVarValue> }> {
    if (this.cachedSnapshot?.filePath === path) return this.cachedSnapshot;
    if (this.pendingLoad?.filePath === path) return this.pendingLoad.promise;
    const promise = this.readPayload(path).then((payload) => ({ filePath: path, variables: Object.freeze({ ...payload.variables }) }));
    this.pendingLoad = { filePath: path, promise };
    try { const snapshot = await promise; if (this.activeFilePath === path) this.cachedSnapshot = snapshot; return snapshot; }
    finally { if (this.pendingLoad?.promise === promise) this.pendingLoad = undefined; }
  }
  mergeVariables(context: PromptContext, variables: Record<string, PromptVarValue>): void {
    for (const [key, value] of Object.entries(variables)) if (!["__proto__", "prototype", "constructor"].includes(key) && !Object.prototype.hasOwnProperty.call(context, key)) context[key] = value;
  }
  isPromptVariableValue(value: unknown): value is PromptVarValue { return value === null || ["string", "number", "boolean"].includes(typeof value); }
  isPromptVarsFilePayload(value: any): value is { version: 1; variables: Record<string, PromptVarValue> } {
    return Boolean(value && typeof value === "object" && !Array.isArray(value) && value.version === 1 && value.variables && typeof value.variables === "object" && !Array.isArray(value.variables) && Object.values(value.variables).every(this.isPromptVariableValue));
  }
  async readPayload(path: string): Promise<{ version: 1; variables: Record<string, PromptVarValue> }> {
    let text: string;
    try { text = await readFile(path, "utf8"); } catch (error) { throw new Error(`Failed to read --prompt-vars-file "${path}": ${error instanceof Error ? error.message : String(error)}`); }
    let value: unknown;
    try { value = JSON.parse(text); } catch (error) { throw new Error(`Invalid JSON in --prompt-vars-file "${path}": ${error instanceof Error ? error.message : String(error)}`); }
    if (!this.isPromptVarsFilePayload(value)) throw new Error(`Invalid --prompt-vars-file payload "${path}": expected { "version": 1, "variables": { ... } }`);
    return value;
  }
}
