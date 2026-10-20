import { access, appendFile, mkdir, open, readFile, readdir, stat, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join } from "node:path";
import type { AgentInputItem } from "@openai/agents-core";
import { HarnessSession } from "./session.js";
import { sanitizeContentBlockTypes, type HistoryItem } from "./history-utils.js";

export type SessionLoadOptions = { historyLimit?: number; cwd?: string };
export type SessionStoreLogger = {
  debug?(message: string): void;
  warn?(message: string, error?: unknown): void;
  error?(message: string, error?: unknown): void;
};
export type SessionStoreOptions = {
  storageDir: string;
  projectsDir?: string;
  workDir?: () => string;
  projectDirForCwd?: (cwd: string) => string;
  createSession?: (seed: Partial<HarnessSession>) => HarnessSession | Promise<HarnessSession>;
  logger?: SessionStoreLogger;
  imageBlobService?: {
    storeFromDataUri(data: string, source?: string, originalFilename?: string): Promise<unknown>;
  };
  toolResultBlobService?: {
    shouldExternalize(content: string): boolean;
    externalize(callId: string, content: string, storeId: string, parentSessionId?: string): Promise<string>;
  };
};

export function resolveSessionMaxItems(value = process.env.CODEBUDDY_SESSION_MAX_ITEMS, fallback = 1_000): number {
  if (value === undefined || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function isSessionPersistenceDisabled(session?: HarnessSession, args = process.argv): boolean {
  return args.includes("--no-session-persistence") || session?.options.sessionPersistence === false;
}

/** Append-only WorkBuddy transcript plus a separate product metadata file. */
export class SessionStore {
  private readonly writeLocks = new Map<string, Promise<void>>();

  constructor(private readonly options: SessionStoreOptions) {}

  getStorageDir(): string { return this.options.storageDir; }

  getSessionFilePath(id: string, parentSessionId?: string): string {
    return join(this.sessionDirectory(id, parentSessionId), `${id}.jsonl`);
  }

  getSessionMetaFilePath(id: string, parentSessionId?: string): string {
    return join(this.sessionDirectory(id, parentSessionId), `${id}.meta.json`);
  }

  async save(session: HarnessSession): Promise<void> {
    if (isSessionPersistenceDisabled(session)) return;
    const id = session.storeId ?? session.id;
    const parent = this.parentId(session);
    const path = this.getSessionFilePath(id, parent);
    await mkdir(dirname(path), { recursive: true });
    const existing = await stat(path).catch(() => undefined);
    if (!existing?.size) await writeFile(path, "", "utf8");
    if (Object.keys(session.meta).length > 0) {
      await writeFile(this.getSessionMetaFilePath(id, parent), JSON.stringify(session.meta, null, 2), "utf8");
    }
  }

  async appendHistory(id: string, items: AgentInputItem[], parentSessionId?: string, session?: HarnessSession): Promise<void> {
    if (isSessionPersistenceDisabled(session)) return;
    const previous = this.writeLocks.get(id) ?? Promise.resolve();
    const operation = previous.catch(() => undefined).then(async () => {
      const path = this.getSessionFilePath(id, parentSessionId);
      await mkdir(dirname(path), { recursive: true });
      const transformed = await Promise.all(items.map((item) => this.transformItemForSaveAsync(item, id, parentSessionId)));
      await appendFile(path, transformed.map((item) => JSON.stringify(item) + "\n").join(""), "utf8");
    });
    this.writeLocks.set(id, operation);
    try { await operation; }
    finally { if (this.writeLocks.get(id) === operation) this.writeLocks.delete(id); }
  }

  async saveHistory(session: HarnessSession): Promise<void> {
    if (isSessionPersistenceDisabled(session)) return;
    await this.save(session);
    await this.appendHistory(session.storeId ?? session.id, session.history, this.parentId(session), session);
  }

  async flush(id: string): Promise<void> { await this.writeLocks.get(id); }

  async get(id: string, options?: SessionLoadOptions): Promise<HarnessSession | undefined> {
    const preferred = options?.cwd && this.options.projectDirForCwd?.(options.cwd.trim());
    if (preferred) {
      const found = await this.deserializeSessionFromPath(join(preferred, `${id}.jsonl`), options);
      if (found) return found;
    }
    if (id.startsWith("agent-")) {
      const directories = await readdir(this.getStorageDir(), { withFileTypes: true }).catch(() => []);
      for (const directory of directories) {
        if (!directory.isDirectory()) continue;
        const found = await this.deserializeSessionFromPath(join(this.getStorageDir(), directory.name, "subagents", `${id}.jsonl`), options);
        if (found) return found;
      }
    }
    const current = await this.deserializeSessionFromPath(this.getSessionFilePath(id), options);
    if (current) return current;
    if (!this.options.projectsDir) return undefined;
    for (const project of await readdir(this.options.projectsDir, { withFileTypes: true }).catch(() => [])) {
      if (!project.isDirectory()) continue;
      const found = await this.deserializeSessionFromPath(join(this.options.projectsDir, project.name, `${id}.jsonl`), options);
      if (found) return found;
    }
    return undefined;
  }

  async deserializeSessionFromPath(path: string, options?: SessionLoadOptions): Promise<HarnessSession | undefined> {
    try {
      const maximum = options?.historyLimit ?? resolveSessionMaxItems();
      const reversed: HistoryItem[] = [];
      for await (const line of reverseLines(path)) {
        if (!line.trim()) continue;
        try {
          const item = JSON.parse(line.trim()) as HistoryItem;
          reversed.push(item);
          if (options?.historyLimit !== undefined) {
            if (reversed.length >= maximum) break;
          } else if ((reversed.length >= maximum && item.type === "message" && item.role === "user") || reversed.length > maximum + 100) break;
        } catch { /* A truncated or malformed JSONL record does not discard the session. */ }
      }
      const history = sanitizeContentBlockTypes(reversed.reverse());
      const info = await stat(path);
      const fileId = basename(path, extname(path));
      let id = fileId;
      for (const item of history.slice(0, 10)) {
        if (item.sessionId) { id = item.sessionId; break; }
      }
      let meta: Record<string, unknown> = {};
      try { meta = JSON.parse(await readFile(path.replace(/\.jsonl$/, ".meta.json"), "utf8")); } catch {}
      const seed: Partial<HarnessSession> = {
        id, ...(id === fileId ? {} : { storeId: fileId }),
        history: history as AgentInputItem[],
        createdAt: info.birthtimeMs > 0 && Number.isFinite(info.birthtimeMs) ? info.birthtimeMs : info.ctimeMs,
        updatedAt: info.mtimeMs, meta,
        hasCompactedHistory: history.some((item) => item.logicalParentId && !item.parentId),
      };
      if (typeof meta.agentName === "string") seed.agentName = meta.agentName;
      const last = history.findLast((item) => typeof item.id === "string");
      if (last) seed.lastMessageId = last.id;
      return this.options.createSession?.(seed) ?? new HarnessSession(id, seed);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") this.options.logger?.error?.(`[SessionStore] deserializeSessionFromPath failed for ${path}`, error);
      return undefined;
    }
  }

  async getAll(): Promise<HarnessSession[]> {
    const sessions = await this.loadDirectory(this.getStorageDir());
    return this.sort(sessions);
  }

  async getMostRecent(): Promise<HarnessSession | undefined> {
    return (await this.getAll())[0];
  }

  async getAllAcrossProjects(options?: { sinceMs?: number }): Promise<HarnessSession[]> {
    if (!this.options.projectsDir) return this.getAll();
    const sessions: HarnessSession[] = [];
    for (const directory of await readdir(this.options.projectsDir, { withFileTypes: true }).catch(() => [])) {
      if (directory.isDirectory()) sessions.push(...await this.loadDirectory(join(this.options.projectsDir, directory.name), options?.sinceMs));
    }
    return this.sort(sessions);
  }

  async getAllByWorkdir(cwd?: string, options?: { sinceMs?: number }): Promise<HarnessSession[]> {
    if (cwd === "*") return this.getAllAcrossProjects(options);
    if (!cwd) return this.getAll();
    if (!(await stat(cwd).catch(() => undefined))?.isDirectory()) return [];
    return (await this.getAllAcrossProjects(options)).filter((session) => (session.history as HistoryItem[]).find((item) => item.cwd)?.cwd === cwd);
  }

  async remove(id: string, parentSessionId?: string): Promise<void> {
    await unlink(this.getSessionFilePath(id, parentSessionId)).catch(() => undefined);
    await unlink(this.getSessionMetaFilePath(id, parentSessionId)).catch(() => undefined);
  }

  normalizeUsageFormat(usage: HistoryItem): HistoryItem {
    if (!usage || typeof usage !== "object") return usage;
    const normalized: HistoryItem = {};
    for (const [camel, snake] of [["inputTokens", "input_tokens"], ["outputTokens", "output_tokens"], ["totalTokens", "total_tokens"]]) {
      if (camel! in usage) normalized[snake!] = usage[camel!];
      else if (snake! in usage) normalized[snake!] = usage[snake!];
    }
    const cacheRead = usage.cache_read_input_tokens ?? usage.inputTokensDetails?.cached_tokens ?? usage.inputTokensDetails?.cachedTokens ?? 0;
    const cacheCreation = usage.cache_creation_input_tokens ?? usage.inputTokensDetails?.cache_creation_tokens ?? 0;
    if (cacheRead > 0) normalized.cache_read_input_tokens = cacheRead;
    if (cacheCreation > 0) normalized.cache_creation_input_tokens = cacheCreation;
    return normalized;
  }

  async transformItemForSaveAsync(item: AgentInputItem, storeId?: string, parentSessionId?: string): Promise<HistoryItem> {
    const original = item as HistoryItem;
    const transformed = { ...original };
    if (transformed.providerData?.usage && ["message", "assistant", "function_call"].includes(transformed.type)) {
      transformed.message = { ...transformed.message, usage: this.normalizeUsageFormat(transformed.providerData.usage) };
    }
    if (!transformed.timestamp) { transformed.timestamp = Date.now(); original.timestamp = transformed.timestamp; }
    if (!transformed.cwd && !["summary", "topic"].includes(transformed.type)) transformed.cwd = this.options.workDir?.() ?? process.cwd();
    await this.replaceImageDataWithBlobRef(transformed);
    if (storeId && ["function_call_result", "function_call_output"].includes(transformed.type)) {
      await this.externalizeToolResultIfNeeded(transformed, storeId, parentSessionId);
    }
    if (transformed.output !== original.output) original.output = transformed.output;
    const { id, parentId, logicalParentId, timestamp, type, role, ...rest } = transformed;
    return { id, parentId, logicalParentId, timestamp, type, role, ...rest };
  }

  private async replaceImageDataWithBlobRef(eA: any): Promise<any> {
const service=this.options.imageBlobService;if(!service)return;
if("message"===eA.type&&"user"===eA.role&&Array.isArray(eA.content)){eA.content=[...eA.content];for(let el: any=0;el<eA.content.length;el++){let ec: any=eA.content[el];if(ec?.type==="input_image"&&"string"==typeof ec.image&&ec.image.startsWith("data:"))try{let eu: any=await service.storeFromDataUri(ec.image,ec.source,ec.original_filename);eA.content[el]=eu}catch(eA: any){this.options.logger?.warn?.("Failed to replace image with blob ref in user message:",eA)}}}("function_call_output"===eA.type||"function_call_result"===eA.type)&&await this.replaceImageInFunctionCallOutput(eA)}

  private async replaceImageInFunctionCallOutput(eA: any): Promise<any> {
const service=this.options.imageBlobService;if(!service)return;
if(Array.isArray(eA.providerData?.toolResult?.content))for(let el: any=0;el<eA.providerData.toolResult.content.length;el++){let ec: any=eA.providerData.toolResult.content[el];if(ec?.type==="image_url"&&ec.image_url?.url?.startsWith("data:"))try{let eu: any=await service.storeFromDataUri(ec.image_url.url);eA.providerData.toolResult.content[el]=eu}catch(eA: any){this.options.logger?.warn?.("Failed to replace image in toolResult content:",eA)}}let el: any="string"==typeof eA.output?eA.output:"string"==typeof eA.output?.text?eA.output.text:"";if(el.includes("data:image/")){let ec: any=el;try{let eA: any=JSON.parse(el);if(Array.isArray(eA)){let el: any=!1;for(let ec: any=0;ec<eA.length;ec++){let eu: any=eA[ec];if(eu?.type==="image_url"&&eu.image_url?.url?.startsWith("data:"))try{let ed: any=await service.storeFromDataUri(eu.image_url.url);eA[ec]=ed,el=!0}catch(eA: any){this.options.logger?.warn?.("Failed to replace image in output array:",eA)}}el&&(ec=JSON.stringify(eA))}}catch{let eA: any,eu: any=/data:(image\/[a-zA-Z+]+);base64,([A-Za-z0-9+/=]{1000,})/g,ed: any=[];for(;null!==(eA=eu.exec(el));)ed.push({full:eA[0],dataUri:eA[0]});for(let eA of ed)try{let el: any=await service.storeFromDataUri(eA.dataUri),eu: any=JSON.stringify(JSON.stringify(el)).slice(1,-1);ec=ec.replace(eA.full,eu)}catch(eA: any){this.options.logger?.warn?.("Failed to replace image data URI in function call output:",eA)}}ec!==el&&("string"==typeof eA.output?eA.output=ec:eA.output?.text&&(eA.output={...eA.output,text:ec}))}}

  private async externalizeToolResultIfNeeded(eA: any,el: any,ec: any): Promise<any> {
const service=this.options.toolResultBlobService;if(!service)return;
let eu: any,ed: any=eA.output;if(Array.isArray(ed))return void await this.externalizeStructuredArrayOutput(eA,ed,el,ec);let ep: any=!1;if("string"==typeof ed?eu=ed:"string"==typeof ed?.text&&(eu=ed.text,ep=!0),!eu||!service.shouldExternalize(eu)||eu.startsWith("<persisted-output>"))return;let eg: any=eA.callId||eA.call_id||eA.id||`unknown-${Date.now()}`;try{let ed: any=await service.externalize(eg,eu,el,ec);ep?eA.output={...eA.output,text:ed}:eA.output=ed}catch(eA: any){this.options.logger?.warn?.("Failed to externalize tool result:",eA)}}

  private async externalizeStructuredArrayOutput(eA: any,el: any,ec: any,eu: any): Promise<any> {
const service=this.options.toolResultBlobService;if(!service)return;
let ed: any=eA.callId||eA.call_id||eA.id||`unknown-${Date.now()}`,ep: any=!1,eg: any=[...el];for(let eA: any=0;eA<eg.length;eA++){let el: any=eg[eA];if((el?.type==="input_text"||el?.type==="text")&&"string"==typeof el.text){let eh: any=el.text;if(!service.shouldExternalize(eh)||eh.startsWith("<persisted-output>"))continue;try{let ef: any=eg.length>1?`${ed}_${eA}`:ed,em: any=await service.externalize(ef,eh,ec,eu);eg[eA]={...el,text:em},ep=!0}catch(el: any){this.options.logger?.warn?.(`Failed to externalize structured output element [${eA}]:`,el)}}}ep&&(eA.output=eg)}

  private sessionDirectory(id: string, parent?: string): string {
    return parent && id.startsWith("agent-") ? join(this.getStorageDir(), parent, "subagents") : this.getStorageDir();
  }

  private parentId(session: HarnessSession): string | undefined {
    return typeof session.meta.parentSessionId === "string" ? session.meta.parentSessionId : undefined;
  }

  private async loadDirectory(directory: string, sinceMs?: number): Promise<HarnessSession[]> {
    const files = await readdir(directory).catch(() => []);
    const results = await Promise.all(files.filter((file) => file.endsWith(".jsonl")).map(async (file) => {
      const path = join(directory, file);
      if (sinceMs && (await stat(path)).mtimeMs < sinceMs) return undefined;
      return this.deserializeSessionFromPath(path);
    }));
    return results.filter((session): session is HarnessSession => Boolean(session && !session.meta.parentSessionId && !session.meta.taskId && !session.meta.isForkedCompactionSession));
  }

  private sort(sessions: HarnessSession[]): HarnessSession[] { return sessions.sort((a, b) => b.updatedAt - a.updatedAt); }
}

async function* reverseLines(path: string): AsyncGenerator<string> {
  const file = await open(path, "r");
  try {
    let position = (await file.stat()).size;
    let remainder = Buffer.alloc(0);
    while (position > 0) {
      const size = Math.min(65_536, position);
      position -= size;
      const buffer = Buffer.alloc(size);
      const { bytesRead } = await file.read(buffer, 0, size, position);
      const combined = Buffer.concat([buffer.subarray(0, bytesRead), remainder]);
      let end = combined.length;
      for (let index = combined.length - 1; index >= 0; index -= 1) {
        if (combined[index] !== 10) continue;
        yield combined.subarray(index + 1, end).toString("utf8");
        end = index;
      }
      remainder = Buffer.from(combined.subarray(0, end));
    }
    if (remainder.length) yield remainder.toString("utf8");
  } finally { await file.close(); }
}
