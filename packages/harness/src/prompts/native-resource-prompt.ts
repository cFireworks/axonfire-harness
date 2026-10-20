// Complete Desktop prompt/collector/archive declarations. Owned IO is injected outside unchanged method bodies.
import * as path from "node:path";
import * as realOs from "node:os";
import * as realCrypto from "node:crypto";
import * as realUtil from "node:util";
import * as realChildProcess from "node:child_process";
import nunjucks from "nunjucks";
import { createNativePromptRuntimeContext } from "./native-prompt-runtime-context.js";
import { createCapturedNodeProxyAgents } from "../vendor/captured-node-proxy-agents.js";
export const RESOURCE_PROMPT_SHA256 =
  "8624215504229c4b6190f5c2172da270e015cc96871e90b261786f047e4c6e78";
export const RESOURCE_PROMPT_CLASSES = [
  ["TimeoutError", 641925, 642130],
  ["BinaryCollector", 1757532, 1758942],
  ["CollaborationCollector", 1759075, 1759345],
  ["EnvCollector", 1761718, 1764050],
  ["ExpertManagementCollector", 1765107, 1765964],
  ["ExpertPromptSlotCollector", 1766180, 1766307],
  ["IdentityCollector", 1772935, 1778329],
  ["MemoryCollector", 1779869, 1782705],
  ["PersonalizationCollector", 1788876, 1790888],
  ["UserMemoryCollector", 1794355, 1801362],
  ["PromptRendererImpl", 1804905, 1807679],
  ["WorkbuddySystemPromptService", 1811369, 1813728],
] as const;
export const RESOURCE_PROMPT_FUNCTIONS = [
  ["generateTraceId", 634520, 634607],
  ["maskUid", 634608, 634727],
  ["createArchiveLogger", 634728, 636171],
  ["acquireMutex", 636543, 636793],
  ["acquireFileLock", 637300, 638760],
  ["makeHandle", 638761, 639480],
  ["getHomeDir", 640110, 640215],
  ["getWorkbuddyConfigBaseDir", 640323, 640532],
  ["getPrimaryMemoryDir", 640533, 640666],
  ["getLegacyMemoryDir", 640667, 640806],
  ["resolveMemoryDirs", 640807, 640990],
  ["sanitizeFilename", 641022, 641123],
  ["buildArchiveFileName", 641141, 641313],
  ["buildBackupFileName", 641314, 641483],
  ["withTimeout", 642132, 642575],
  ["getLogger", 643372, 643463],
  ["tmpOf", 643482, 643610],
  ["classifyError", 643625, 643996],
  ["fileExists", 644015, 644232],
  ["ensureDir", 644249, 644480],
  ["tryReadExistingVersion", 644533, 645002],
  ["toMarkdown", 645054, 645358],
  ["parseMarkdown", 645428, 646067],
  ["resolveDirs", 646084, 646395],
  ["doWriteWithLockAndGuard", 646423, 648992],
  ["writeProfile", 649056, 650502],
  ["doRead", 650519, 652314],
  ["readProfile", 652367, 653219],
  ["safeUnlink", 653249, 653404],
  ["doDelete", 653421, 654213],
  ["deleteProfile", 654277, 655574],
  ["isLegacyDirPathSafe", 655682, 655844],
  ["purgeLegacyMemoryDir", 656079, 657870],
  ["getDisableLocalSkillsMemoryFromAppConfig", 908010, 908192],
  ["resolveResponseLocaleIsZh", 1760143, 1760336],
  ["resolveResponseLanguage", 1761209, 1761698],
  ["isInsideGitWorkTree", 1764300, 1764788],
  ["isDirectoryEmpty", 1764789, 1764963],
  ["resolveWorkBuddyDir", 1767375, 1767752],
  ["truncateContent", 1778408, 1778613],
  ["resolveProjectFolderName", 1779440, 1779551],
  ["resolveUserDataDir", 1779666, 1779846],
  ["getWorkbuddyMemory1", 1782707, 1786472],
  ["listWorkbuddyPromptTemplateDirCandidates", 1786564, 1787012],
  ["resolveWorkbuddyPromptTemplatePath", 1787013, 1787179],
  ["requireWorkbuddyPromptTemplatePath", 1787180, 1787574],
  ["listWorkbuddyPromptTemplatePathCandidates", 1787575, 1787729],
  ["uniqueNonEmpty", 1787730, 1788001],
  ["resolveLegacySettingsPath", 1788260, 1788460],
  ["getProxyUrlFromEnv", 1791147, 1791551],
  ["shouldBypassProxy", 1791552, 1792065],
  ["getAgentBundle", 1792066, 1792530],
  ["resolveNodeProxyAgent", 1792628, 1792995],
  ["describeProxyForRequest", 1793079, 1793518],
  ["logSkip", 1801364, 1801532],
  ["maskUserId", 1801533, 1801670],
  ["composeKind", 1803100, 1803204],
  ["selectTemplateKind", 1804541, 1804879],
  ["createTemplateLoader", 1810340, 1810873],
  ["readAppConfigValue", 1816226, 1816499],
] as const;
export const RESOURCE_PROMPT_CONSTANTS = [
  ["TAG", 634477, 634519],
  ["keyMutexMap", 636365, 636409],
  ["DEFAULT_WORKBUDDY_DIR_NAME", 639757, 639803],
  ["MEMORY_DIR_NAME", 639823, 639854],
  ["LEGACY_MEMORY_DIR_NAME", 639881, 639919],
  ["PRIMARY_ARCHIVE_SUFFIX", 639934, 639976],
  ["PRIMARY_BACKUP_SUFFIX", 639977, 640022],
  ["LEGACY_ARCHIVE_SUFFIX", 640023, 640064],
  ["LEGACY_BACKUP_SUFFIX", 640065, 640109],
  ["DEFAULT_WRITE_TIMEOUT_MS", 643109, 643144],
  ["DEFAULT_READ_TIMEOUT_MS", 643145, 643180],
  ["DEFAULT_DELETE_TIMEOUT_MS", 643181, 643218],
  ["defaultSink", 643219, 643371],
  ["APP_CONFIG_KEY_DISABLE_LOCAL_SKILLS_MEMORY", 907729, 907805],
  ["MAX_BINARY_CONTEXT_CHARS", 1757474, 1757509],
  ["execFileAsync", 1759637, 1759701],
  ["SUPPRESSED_PLUGIN_AGENT_PROMPT_SLOT", 1766073, 1766147],
  ["WORKBUDDY_WORKSPACE_STATE_VERSION", 1767753, 1767795],
  ["MAX_IDENTITY_FILE_CHARS", 1767926, 1767960],
  ["DEFAULT_SOUL_CONTENT", 1767961, 1769783],
  ["DEFAULT_IDENTITY_CONTENT", 1769784, 1770402],
  ["DEFAULT_USER_CONTENT", 1770403, 1770994],
  ["DEFAULT_BOOTSTRAP_CONTENT", 1770995, 1772910],
  ["MAX_MEMORY_CHARS", 1779326, 1779353],
  ["STYLE_NAMES", 1788461, 1788595],
  ["LOOPBACK_HOSTS", 1790985, 1791064],
  ["KEEP_ALIVE_OPTS", 1791065, 1791130],
  ["agentCache", 1791131, 1791146],
  ["USER_MEMORY_TIMEOUT_MS", 1793893, 1793926],
  ["MAX_USER_MEMORY_CHARS", 1794091, 1794123],
  ["USER_MEMORY_RESOLUTION_CACHE_TTL_MS", 1794124, 1794170],
  ["USER_MEMORY_REMOTE_FALLBACK_CACHE_TTL_MS", 1794171, 1794222],
  ["resolutionCache", 1794223, 1794271],
  ["remoteFallbackCooldowns", 1794272, 1794328],
  ["TEMPLATE_NAMES$1", 1808857, 1809541],
  ["FALLBACK_KIND", 1809936, 1810181],
] as const;
export function createNativeResourcePrompt(runtime: any) {
  const Object: any = globalThis.Object,
    Promise: any = globalThis.Promise,
    Date: any = runtime.Date ?? globalThis.Date,
    Math: any = runtime.Math ?? globalThis.Math;
  const process: any = {
    env: runtime.env ?? {},
    cwd: runtime.getWorkDir,
    pid: runtime.pid ?? globalThis.process.pid,
  };
  const fs: any = runtime.fs,
    node_fs = fs,
    node_fs_promises = fs.promises,
    node_path = path,
    os = runtime.os ?? realOs,
    node_os = os,
    node_crypto = runtime.crypto ?? realCrypto,
    child_process = runtime.childProcess ?? realChildProcess,
    util = realUtil;
  const import_nunjucks = { default: runtime.nunjucks ?? nunjucks },
    http = runtime.http,
    https = runtime.https,
    console = runtime.console ?? globalThis.console;
  const setTimeout = runtime.setTimeout ?? globalThis.setTimeout,
    clearTimeout = runtime.clearTimeout ?? globalThis.clearTimeout,
    queueMicrotask = runtime.queueMicrotask ?? globalThis.queueMicrotask;
  const require_runtime_context =
    runtime.context ??
    createNativePromptRuntimeContext({
      env: process.env,
      getWorkDir: process.cwd,
      os,
    });
  if (runtime.contextOptions)
    require_runtime_context.configureWorkbuddyRuntimeContext(
      runtime.contextOptions,
    );
  const proxy = runtime.proxyAgents ?? createCapturedNodeProxyAgents();
  const require_net_log = {
    require_dist$1: () => ({ HttpProxyAgent: proxy.HttpProxyAgent }),
    require_dist: () => ({ HttpsProxyAgent: proxy.HttpsProxyAgent }),
  };
  const require_client_info_env = {
    getRegisteredBinaryTypes:
      runtime.getRegisteredBinaryTypes ?? (() => ["python", "node"]),
  };
  // UTF-16 634477..634519
  var TAG: any = "[HostServices][MemoryArchive]";
  // UTF-16 634520..634607
  function generateTraceId(): any {
    return (0, node_crypto.randomBytes)(4).toString("hex");
  }
  // UTF-16 634608..634727
  function maskUid(uid: any): any {
    if (!uid || uid.length <= 8) return "****";
    return `${uid.slice(0, 4)}***${uid.slice(-4)}`;
  }
  // UTF-16 634728..636171
  function createArchiveLogger(sink: any, options: any = {}): any {
    const infoEvery: any = Math.max(1, options.sampling?.infoEvery ?? 10);
    const debugEnabled: any =
      options.debug ?? process.env.WORKBUDDY_MEMORY_ARCHIVE_DEBUG === "1";
    const sampleCounters: any = /* @__PURE__ */ new Map();
    const sampled: any = (uid: any, key: any) => {
      const counterKey: any = `${uid}:${key}`;
      const n: any = (sampleCounters.get(counterKey) ?? 0) + 1;
      sampleCounters.set(counterKey, n);
      return n % infoEvery === 1 ? "info" : "debug";
    };
    const log: any = (level: any, stage: any, fields: any) => {
      const masked: any =
        typeof fields.uid === "string" ? maskUid(fields.uid) : fields.uid;
      sink(level, `${TAG} ${stage}`, {
        ...fields,
        uid: masked,
      });
    };
    return {
      start: (f: any) => {
        log(debugEnabled ? "info" : sampled(f.uid, "start"), "start", f);
      },
      done: (f: any) => {
        log(debugEnabled || f.version !== void 0 ? "info" : "debug", "done", f);
      },
      failed: (f: any) => {
        log("error", "failed", f);
        options.onError?.(f);
      },
      timeout: (f: any) => {
        log("warn", "timeout", f);
        options.onError?.({
          ...f,
          error_code: "timeout",
        });
      },
      skipped: (f: any) => {
        log(
          f.reason === "stale_version"
            ? "warn"
            : debugEnabled
              ? "info"
              : sampled(f.uid, "skipped_same_version"),
          `skipped_${f.reason}`,
          f,
        );
      },
      migrated: (f: any) => {
        log("info", "migrated", f);
      },
      lockContention: (f: any) => {
        log("warn", "lock_contention", f);
        options.onError?.({
          ...f,
          error_code: "lock_contention",
        });
      },
    };
  }
  // UTF-16 636365..636409
  var keyMutexMap: any = /* @__PURE__ */ new Map();
  // UTF-16 636543..636793
  async function acquireMutex(key: any): Promise<any> {
    const prev: any = keyMutexMap.get(key) ?? Promise.resolve();
    let release: any;
    const next: any = new Promise((resolve: any) => {
      release = resolve;
    });
    keyMutexMap.set(
      key,
      prev.then(() => next),
    );
    await prev;
    return release;
  }
  // UTF-16 637300..638760
  async function acquireFileLock(
    lockPath: any,
    options: any = {},
  ): Promise<any> {
    const ttlMs: any = options.ttlMs ?? 1e4;
    const maxRetries: any = options.maxRetries ?? 3;
    const retryDelayMs: any = options.retryDelayMs ?? 150;
    const jitterMs: any = options.jitterMs ?? 50;
    const ownerId: any = `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const startedAt: any = Date.now();
    for (let attempt: any = 0; attempt <= maxRetries; attempt++) {
      const payload: any = {
        pid: process.pid,
        acquiredAt: Date.now(),
        ownerId,
      };
      try {
        await node_fs.promises.writeFile(lockPath, JSON.stringify(payload), {
          flag: "wx",
          encoding: "utf-8",
        });
        return makeHandle(
          lockPath,
          ownerId,
          Date.now() - startedAt,
          options.onWarn,
        );
      } catch (error: any) {
        const errCode: any = error.code;
        if (errCode !== "EEXIST") {
          options.onWarn?.("file-lock acquire io error", {
            lockPath,
            error_code: errCode ?? "UNKNOWN",
          });
          return null;
        }
        try {
          const raw: any = await node_fs.promises.readFile(lockPath, "utf-8");
          const existing: any = JSON.parse(raw);
          if (Date.now() - existing.acquiredAt > ttlMs) {
            await node_fs.promises.unlink(lockPath).catch(() => {});
            continue;
          }
        } catch {
          await node_fs.promises.unlink(lockPath).catch(() => {});
          continue;
        }
        if (attempt < maxRetries) {
          const jitter: any = Math.floor(Math.random() * jitterMs);
          await new Promise((resolve: any) =>
            setTimeout(resolve, retryDelayMs + jitter),
          );
        }
      }
    }
    return null;
  }
  // UTF-16 638761..639480
  function makeHandle(
    lockPath: any,
    ownerId: any,
    waitMs: any,
    onWarn: any,
  ): any {
    return {
      ownerId,
      waitMs,
      release: async () => {
        try {
          const raw: any = await node_fs.promises
            .readFile(lockPath, "utf-8")
            .catch(() => null);
          if (raw)
            try {
              if (JSON.parse(raw).ownerId !== ownerId) return;
            } catch {}
          await node_fs.promises.unlink(lockPath).catch((error: any) => {
            const errCode: any = error.code;
            if (errCode !== "ENOENT")
              onWarn?.("file-lock release unlink failed", {
                lockPath,
                error_code: errCode ?? "UNKNOWN",
              });
          });
        } catch (error: any) {
          onWarn?.("file-lock release unexpected error", {
            lockPath,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      },
    };
  }
  // UTF-16 639757..639803
  var DEFAULT_WORKBUDDY_DIR_NAME: any = ".workbuddy";
  // UTF-16 639823..639854
  var MEMORY_DIR_NAME: any = "memory";
  // UTF-16 639881..639919
  var LEGACY_MEMORY_DIR_NAME: any = "memery";
  // UTF-16 639934..639976
  var PRIMARY_ARCHIVE_SUFFIX: any = "_memory.md";
  // UTF-16 639977..640022
  var PRIMARY_BACKUP_SUFFIX: any = "_memory.md.bak";
  // UTF-16 640023..640064
  var LEGACY_ARCHIVE_SUFFIX: any = "_memery.md";
  // UTF-16 640065..640109
  var LEGACY_BACKUP_SUFFIX: any = "_memery.md.bak";
  // UTF-16 640110..640215
  function getHomeDir(): any {
    return (
      node_os.homedir() || process.env.HOME || process.env.USERPROFILE || ""
    );
  }
  // UTF-16 640323..640532
  function getWorkbuddyConfigBaseDir(homeDir: any = getHomeDir()): any {
    const envDir: any = process.env.WORKBUDDY_CONFIG_DIR?.trim();
    if (envDir) return envDir;
    return node_path.join(homeDir, DEFAULT_WORKBUDDY_DIR_NAME);
  }
  // UTF-16 640533..640666
  function getPrimaryMemoryDir(homeDir: any = getHomeDir()): any {
    return node_path.join(getWorkbuddyConfigBaseDir(homeDir), MEMORY_DIR_NAME);
  }
  // UTF-16 640667..640806
  function getLegacyMemoryDir(homeDir: any = getHomeDir()): any {
    return node_path.join(
      getWorkbuddyConfigBaseDir(homeDir),
      LEGACY_MEMORY_DIR_NAME,
    );
  }
  // UTF-16 640807..640990
  function resolveMemoryDirs(homeDir?: any): any {
    const resolved: any = homeDir ?? getHomeDir();
    return {
      primaryDir: getPrimaryMemoryDir(resolved),
      legacyDir: getLegacyMemoryDir(resolved),
    };
  }
  // UTF-16 641022..641123
  function sanitizeFilename(input: any): any {
    return input.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_").trim();
  }
  // UTF-16 641141..641313
  function buildArchiveFileName(uid: any, legacy: any = false): any {
    const suffix: any = legacy ? LEGACY_ARCHIVE_SUFFIX : PRIMARY_ARCHIVE_SUFFIX;
    return `${sanitizeFilename(uid)}${suffix}`;
  }
  // UTF-16 641314..641483
  function buildBackupFileName(uid: any, legacy: any = false): any {
    const suffix: any = legacy ? LEGACY_BACKUP_SUFFIX : PRIMARY_BACKUP_SUFFIX;
    return `${sanitizeFilename(uid)}${suffix}`;
  }
  // UTF-16 641906..642131
  var TimeoutError: any = class extends Error {
    [key: string]: any;
    constructor(label: any, timeoutMs: any) {
      super(`operation "${label}" timed out after ${timeoutMs}ms`);
      this.label = label;
      this.timeoutMs = timeoutMs;
      this.name = "TimeoutError";
    }
  };
  // UTF-16 642132..642575
  function withTimeout(task: any, timeoutMs: any, label: any): any {
    const controller: any = new AbortController();
    let timer: any;
    const timeoutPromise: any = new Promise((_: any, reject: any) => {
      timer = setTimeout(() => {
        controller.abort();
        reject(new TimeoutError(label, timeoutMs));
      }, timeoutMs);
      timer.unref?.();
    });
    return Promise.race([task(controller.signal), timeoutPromise]).finally(
      () => {
        if (timer) {
          clearTimeout(timer);
          timer = void 0;
        }
      },
    );
  }
  // UTF-16 643109..643144
  var DEFAULT_WRITE_TIMEOUT_MS: any = 2e3;
  // UTF-16 643145..643180
  var DEFAULT_READ_TIMEOUT_MS: any = 1500;
  // UTF-16 643181..643218
  var DEFAULT_DELETE_TIMEOUT_MS: any = 1500;
  // UTF-16 643219..643371
  var defaultSink: any = (level: any, message: any, fields: any) => {
    const payload: any = fields ? ` ${JSON.stringify(fields)}` : "";
    console[level](`${message}${payload}`);
  };
  // UTF-16 643372..643463
  function getLogger(options: any): any {
    return options.logger ?? createArchiveLogger(defaultSink);
  }
  // UTF-16 643482..643610
  function tmpOf(finalPath: any): any {
    return `${finalPath}.tmp.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`;
  }
  // UTF-16 643625..643996
  function classifyError(error: any): any {
    if (error instanceof TimeoutError) return "timeout";
    if (error instanceof SyntaxError) return "parse_error";
    if (error && typeof error === "object" && "code" in error) {
      const code: any = error.code;
      if (
        code &&
        ["EACCES", "ENOSPC", "EIO", "ENOTDIR", "EPERM"].includes(code)
      )
        return "io_error";
    }
    return "unknown";
  }
  // UTF-16 644015..644232
  async function fileExists(filePath: any, signal: any): Promise<any> {
    try {
      await node_fs.promises.access(filePath, node_fs.constants.F_OK);
      if (signal?.aborted) throw new Error("aborted");
      return true;
    } catch {
      return false;
    }
  }
  // UTF-16 644249..644480
  async function ensureDir(dirPath: any, signal: any): Promise<any> {
    try {
      await node_fs.promises.mkdir(dirPath, { recursive: true });
      if (signal?.aborted) throw new Error("aborted");
    } catch (error: any) {
      if (error.code !== "EEXIST") throw error;
    }
  }
  // UTF-16 644533..645002
  async function tryReadExistingVersion(
    filePath: any,
    signal: any,
  ): Promise<any> {
    try {
      const fd: any = await node_fs.promises.open(filePath, "r");
      try {
        const buffer: any = Buffer.alloc(1024);
        const { bytesRead } = await fd.read(buffer, 0, 1024, 0);
        if (signal?.aborted) return;
        const match: any = buffer
          .toString("utf-8", 0, bytesRead)
          .match(/^>\s*Version:\s*(\d+)/m);
        if (match) return parseInt(match[1], 10);
        return;
      } finally {
        await fd.close();
      }
    } catch {
      return;
    }
  }
  // UTF-16 645054..645358
  function toMarkdown(profile: any): any {
    return `# User Memory Profile
> Last updated: ${profile.updatedAt ?? /* @__PURE__ */ new Date().toISOString()}
> Version: ${profile.version ?? 0}

## Memory Block

${profile.memoryBlock}

---

<!-- RAW_JSON_START
${JSON.stringify(profile, null, 2)}
RAW_JSON_END -->
`;
  }
  // UTF-16 645428..646067
  function parseMarkdown(content: any, uid: any): any {
    const rawMatch: any = content.match(
      /<!-- RAW_JSON_START\n([\s\S]*?)\nRAW_JSON_END -->/,
    );
    if (rawMatch)
      try {
        const parsed: any = JSON.parse(rawMatch[1]);
        if (parsed.uid === uid) return parsed;
        return {
          ...parsed,
          uid,
        };
      } catch {}
    const versionMatch: any = content.match(/^>\s*Version:\s*(\d+)/m);
    const updatedAtMatch: any = content.match(/^>\s*Last updated:\s*(.+)$/m);
    return {
      uid,
      memoryBlock:
        content.match(/## Memory Block\n\n([\s\S]*?)\n\n---/)?.[1]?.trim() ??
        "",
      version: versionMatch ? parseInt(versionMatch[1], 10) : void 0,
      updatedAt: updatedAtMatch?.[1]?.trim() ?? void 0,
    };
  }
  // UTF-16 646084..646395
  function resolveDirs(options: any): any {
    if (options.baseDir && options.legacyBaseDir)
      return {
        primaryDir: options.baseDir,
        legacyDir: options.legacyBaseDir,
      };
    const dirs: any = resolveMemoryDirs();
    return {
      primaryDir: options.baseDir ?? dirs.primaryDir,
      legacyDir: options.legacyBaseDir ?? dirs.legacyDir,
    };
  }
  // UTF-16 646423..648992
  async function doWriteWithLockAndGuard(
    uid: any,
    profile: any,
    options: any,
    traceId: any,
    signal: any,
    logger: any,
    startedAt: any,
  ): Promise<any> {
    const { primaryDir } = resolveDirs(options);
    await ensureDir(primaryDir, signal);
    const sanitizedUid: any = sanitizeFilename(uid);
    const lockPath: any = node_path.join(primaryDir, `.${sanitizedUid}.lock`);
    const lockStartedAt: any = Date.now();
    const lock: any = await acquireFileLock(lockPath, {
      ttlMs: 1e4,
      maxRetries: 3,
      retryDelayMs: 150,
      onWarn: (msg: any, fields: any) => defaultSink("warn", msg, fields),
    });
    if (!lock) {
      const waitMs: any = Date.now() - lockStartedAt;
      logger.lockContention({
        trace_id: traceId,
        uid,
        wait_ms: waitMs,
      });
      return {
        success: false,
        errorCode: "lock_contention",
      };
    }
    try {
      const primaryPath: any = node_path.join(
        primaryDir,
        buildArchiveFileName(uid, false),
      );
      const existingVersion: any = await tryReadExistingVersion(
        primaryPath,
        signal,
      );
      if (
        typeof profile.version === "number" &&
        typeof existingVersion === "number"
      ) {
        if (profile.version < existingVersion) {
          logger.skipped({
            trace_id: traceId,
            uid,
            reason: "stale_version",
            incomingVersion: profile.version,
            existingVersion,
          });
          return {
            success: false,
            errorCode: "stale_version",
            skipped: true,
            skipReason: "stale_version",
          };
        }
        if (profile.version === existingVersion) {
          logger.skipped({
            trace_id: traceId,
            uid,
            reason: "same_version",
            incomingVersion: profile.version,
            existingVersion,
          });
          return {
            success: true,
            skipped: true,
            skipReason: "same_version",
          };
        }
      }
      const backupPath: any = node_path.join(
        primaryDir,
        buildBackupFileName(uid, false),
      );
      if (await fileExists(primaryPath, signal)) {
        const backupTmp: any = tmpOf(backupPath);
        await node_fs.promises.copyFile(primaryPath, backupTmp);
        if (signal.aborted) {
          await node_fs.promises.unlink(backupTmp).catch(() => {});
          throw new Error("aborted");
        }
        await node_fs.promises.rename(backupTmp, backupPath);
      }
      const primaryTmp: any = tmpOf(primaryPath);
      const content: any = toMarkdown(profile);
      await node_fs.promises.writeFile(primaryTmp, content, {
        encoding: "utf-8",
      });
      if (signal.aborted) {
        await node_fs.promises.unlink(primaryTmp).catch(() => {});
        throw new Error("aborted");
      }
      await node_fs.promises.rename(primaryTmp, primaryPath);
      const costMs: any = Date.now() - startedAt;
      logger.done({
        trace_id: traceId,
        uid,
        version: profile.version,
        cost_ms: costMs,
        op: "write",
      });
      return { success: true };
    } finally {
      await lock.release();
    }
  }
  // UTF-16 649056..650502
  async function writeProfile(
    uid: any,
    profile: any,
    options: any = {},
  ): Promise<any> {
    const traceId: any = generateTraceId();
    const startedAt: any = Date.now();
    const logger: any = getLogger(options);
    const timeoutMs: any = options.timeoutMs ?? DEFAULT_WRITE_TIMEOUT_MS;
    logger.start({
      trace_id: traceId,
      uid,
      version: profile.version,
      op: "write",
    });
    try {
      const release: any = await acquireMutex(uid);
      try {
        const result: any = await withTimeout(
          (signal: any) =>
            doWriteWithLockAndGuard(
              uid,
              profile,
              options,
              traceId,
              signal,
              logger,
              startedAt,
            ),
          timeoutMs,
          "write",
        );
        const costMs: any = Date.now() - startedAt;
        if (result.errorCode)
          return {
            success: result.success,
            errorCode: result.errorCode,
            trace_id: traceId,
            cost_ms: costMs,
          };
        return {
          success: true,
          trace_id: traceId,
          cost_ms: costMs,
        };
      } finally {
        release();
      }
    } catch (error: any) {
      const costMs: any = Date.now() - startedAt;
      if (error instanceof TimeoutError) {
        logger.timeout({
          trace_id: traceId,
          uid,
          cost_ms: costMs,
          op: "write",
        });
        return {
          success: false,
          errorCode: "timeout",
          trace_id: traceId,
          cost_ms: costMs,
        };
      }
      const errorCode: any = classifyError(error);
      logger.failed({
        trace_id: traceId,
        uid,
        error_code: errorCode,
        error_name: error instanceof Error ? error.name : void 0,
        cost_ms: costMs,
        op: "write",
      });
      return {
        success: false,
        errorCode,
        trace_id: traceId,
        cost_ms: costMs,
      };
    }
  }
  // UTF-16 650519..652314
  async function doRead(
    uid: any,
    options: any,
    traceId: any,
    signal: any,
    logger: any,
    startedAt: any,
  ): Promise<any> {
    const { primaryDir, legacyDir } = resolveDirs(options);
    const primaryPath: any = node_path.join(
      primaryDir,
      buildArchiveFileName(uid, false),
    );
    try {
      const content: any = await node_fs.promises.readFile(primaryPath, {
        encoding: "utf-8",
      });
      if (signal.aborted) throw new Error("aborted");
      const parsed: any = parseMarkdown(content, uid);
      if (parsed) {
        const costMs: any = Date.now() - startedAt;
        logger.done({
          trace_id: traceId,
          uid,
          version: parsed.version,
          cost_ms: costMs,
          op: "read",
        });
        return parsed;
      }
    } catch (error: any) {
      if (error.code !== "ENOENT") throw error;
    }
    const legacyPath: any = node_path.join(
      legacyDir,
      `${sanitizeFilename(uid)}${LEGACY_ARCHIVE_SUFFIX}`,
    );
    try {
      const content: any = await node_fs.promises.readFile(legacyPath, {
        encoding: "utf-8",
      });
      if (signal.aborted) throw new Error("aborted");
      const parsed: any = parseMarkdown(content, uid);
      if (parsed) {
        const costMs: any = Date.now() - startedAt;
        queueMicrotask(() => {
          writeProfile(uid, parsed, options).catch((migrationError: any) => {
            defaultSink(
              "warn",
              "[HostServices][MemoryArchive] migration failed",
              {
                trace_id: traceId,
                uid,
                error:
                  migrationError instanceof Error
                    ? migrationError.message
                    : String(migrationError),
              },
            );
          });
        });
        logger.migrated({
          trace_id: traceId,
          uid,
          source: "legacy_memery",
          cost_ms: costMs,
        });
        logger.done({
          trace_id: traceId,
          uid,
          version: parsed.version,
          cost_ms: costMs,
          op: "read",
        });
        return parsed;
      }
    } catch (error: any) {
      if (error.code !== "ENOENT") throw error;
    }
    const costMs: any = Date.now() - startedAt;
    logger.done({
      trace_id: traceId,
      uid,
      cost_ms: costMs,
      op: "read",
    });
    return null;
  }
  // UTF-16 652367..653219
  async function readProfile(uid: any, options: any = {}): Promise<any> {
    const traceId: any = generateTraceId();
    const startedAt: any = Date.now();
    const logger: any = getLogger(options);
    const timeoutMs: any = options.timeoutMs ?? DEFAULT_READ_TIMEOUT_MS;
    logger.start({
      trace_id: traceId,
      uid,
      op: "read",
    });
    try {
      return await withTimeout(
        (signal: any) =>
          doRead(uid, options, traceId, signal, logger, startedAt),
        timeoutMs,
        "read",
      );
    } catch (error: any) {
      const costMs: any = Date.now() - startedAt;
      if (error instanceof TimeoutError) {
        logger.timeout({
          trace_id: traceId,
          uid,
          cost_ms: costMs,
          op: "read",
        });
        return null;
      }
      const errorCode: any = classifyError(error);
      logger.failed({
        trace_id: traceId,
        uid,
        error_code: errorCode,
        error_name: error instanceof Error ? error.name : void 0,
        cost_ms: costMs,
        op: "read",
      });
      return null;
    }
  }
  // UTF-16 653249..653404
  async function safeUnlink(filePath: any): Promise<any> {
    try {
      await node_fs.promises.unlink(filePath);
    } catch (error: any) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  // UTF-16 653421..654213
  async function doDelete(uid: any, options: any, signal: any): Promise<any> {
    const { primaryDir, legacyDir } = resolveDirs(options);
    const sanitizedUid: any = sanitizeFilename(uid);
    const primaryPath: any = node_path.join(
      primaryDir,
      buildArchiveFileName(uid, false),
    );
    const primaryBackupPath: any = node_path.join(
      primaryDir,
      buildBackupFileName(uid, false),
    );
    await safeUnlink(primaryPath);
    if (signal.aborted) throw new Error("aborted");
    await safeUnlink(primaryBackupPath);
    if (signal.aborted) throw new Error("aborted");
    const legacyPath: any = node_path.join(
      legacyDir,
      `${sanitizedUid}${LEGACY_ARCHIVE_SUFFIX}`,
    );
    const legacyBackupPath: any = node_path.join(
      legacyDir,
      `${sanitizedUid}${LEGACY_BACKUP_SUFFIX}`,
    );
    await safeUnlink(legacyPath);
    if (signal.aborted) throw new Error("aborted");
    await safeUnlink(legacyBackupPath);
  }
  // UTF-16 654277..655574
  async function deleteProfile(uid: any, options: any = {}): Promise<any> {
    const traceId: any = generateTraceId();
    const startedAt: any = Date.now();
    const logger: any = getLogger(options);
    const timeoutMs: any = options.timeoutMs ?? DEFAULT_DELETE_TIMEOUT_MS;
    logger.start({
      trace_id: traceId,
      uid,
      op: "delete",
    });
    try {
      const release: any = await acquireMutex(uid);
      try {
        await withTimeout(
          (signal: any) => doDelete(uid, options, signal),
          timeoutMs,
          "delete",
        );
        const costMs: any = Date.now() - startedAt;
        logger.done({
          trace_id: traceId,
          uid,
          cost_ms: costMs,
          op: "delete",
        });
        return {
          success: true,
          trace_id: traceId,
          cost_ms: costMs,
        };
      } finally {
        release();
      }
    } catch (error: any) {
      const costMs: any = Date.now() - startedAt;
      if (error instanceof TimeoutError) {
        logger.timeout({
          trace_id: traceId,
          uid,
          cost_ms: costMs,
          op: "delete",
        });
        return {
          success: false,
          errorCode: "timeout",
          trace_id: traceId,
          cost_ms: costMs,
        };
      }
      const errorCode: any = classifyError(error);
      logger.failed({
        trace_id: traceId,
        uid,
        error_code: errorCode,
        error_name: error instanceof Error ? error.name : void 0,
        cost_ms: costMs,
        op: "delete",
      });
      return {
        success: false,
        errorCode,
        trace_id: traceId,
        cost_ms: costMs,
      };
    }
  }
  // UTF-16 655682..655844
  function isLegacyDirPathSafe(legacyDir: any): any {
    if (!legacyDir || !node_path.isAbsolute(legacyDir)) return false;
    return node_path.basename(legacyDir) === "memery";
  }
  // UTF-16 656079..657870
  async function purgeLegacyMemoryDir(options: any = {}): Promise<any> {
    const traceId: any = generateTraceId();
    const startedAt: any = Date.now();
    const logger: any = getLogger(options);
    const timeoutMs: any = options.timeoutMs ?? DEFAULT_DELETE_TIMEOUT_MS;
    logger.start({
      trace_id: traceId,
      uid: "purge-legacy",
      op: "delete",
    });
    const { legacyDir } = resolveDirs(options);
    if (!isLegacyDirPathSafe(legacyDir)) {
      const costMs: any = Date.now() - startedAt;
      logger.failed({
        trace_id: traceId,
        uid: "purge-legacy",
        error_code: "unknown",
        error_name: "UnsafeLegacyDirPath",
        cost_ms: costMs,
        op: "delete",
      });
      return {
        success: false,
        errorCode: "unknown",
        trace_id: traceId,
        cost_ms: costMs,
      };
    }
    try {
      await withTimeout(
        async (signal: any) => {
          await node_fs.promises.rm(legacyDir, {
            recursive: true,
            force: true,
          });
          if (signal.aborted) throw new Error("aborted");
        },
        timeoutMs,
        "purge-legacy",
      );
      const costMs: any = Date.now() - startedAt;
      logger.done({
        trace_id: traceId,
        uid: "purge-legacy",
        cost_ms: costMs,
        op: "delete",
      });
      return {
        success: true,
        trace_id: traceId,
        cost_ms: costMs,
      };
    } catch (error: any) {
      const costMs: any = Date.now() - startedAt;
      if (error instanceof TimeoutError) {
        logger.timeout({
          trace_id: traceId,
          uid: "purge-legacy",
          cost_ms: costMs,
          op: "delete",
        });
        return {
          success: false,
          errorCode: "timeout",
          trace_id: traceId,
          cost_ms: costMs,
        };
      }
      const errorCode: any = classifyError(error);
      logger.failed({
        trace_id: traceId,
        uid: "purge-legacy",
        error_code: errorCode,
        error_name: error instanceof Error ? error.name : void 0,
        cost_ms: costMs,
        op: "delete",
      });
      return {
        success: false,
        errorCode,
        trace_id: traceId,
        cost_ms: costMs,
      };
    }
  }
  // UTF-16 907729..907805
  var APP_CONFIG_KEY_DISABLE_LOCAL_SKILLS_MEMORY: any =
    "disableLocalSkillsMemory";
  // UTF-16 908010..908192
  function getDisableLocalSkillsMemoryFromAppConfig(svc: any): any {
    const raw: any = svc.get(APP_CONFIG_KEY_DISABLE_LOCAL_SKILLS_MEMORY);
    if (typeof raw !== "boolean") return false;
    return raw;
  }
  // UTF-16 1757474..1757509
  var MAX_BINARY_CONTEXT_CHARS: any = 1e4;
  // UTF-16 1757510..1758943
  var BinaryCollector: any = class {
    [key: string]: any;
    constructor(logger: any, binaryManager: any) {
      this.logger = logger;
      this.binaryManager = binaryManager;
    }
    async collect(vars: any, _ctx: any): Promise<any> {
      vars["BinaryContext"] = "";
      if (!this.binaryManager) {
        this.logger.info(
          "[BinaryCollector] No BinaryManager available, skipping binary context collection",
        );
        return;
      }
      try {
        const ctx: any = await this.binaryManager.generatePromptContext();
        if (ctx && ctx.summary) {
          let binaryContent: any = ctx.summary + "\n" + ctx.instructions;
          if (binaryContent.length > MAX_BINARY_CONTEXT_CHARS) {
            this.logger.warn(
              `[BinaryCollector] Truncating BinaryContext: ${binaryContent.length} -> ${MAX_BINARY_CONTEXT_CHARS} chars`,
            );
            binaryContent =
              binaryContent.substring(0, MAX_BINARY_CONTEXT_CHARS) +
              "\n... (binary context truncated — exceeded character limit)";
          }
          vars["BinaryContext"] = binaryContent;
          const pathSummary: any = (
            vars["BinaryContext"].match(/`([^`]*(?:python|node)[^`]*)`/gi) || []
          )
            .slice(0, 4)
            .join(", ");
          this.logger.info(
            `[BinaryCollector] Binary context collected: summaryLength=${ctx.summary.length}, instructionsLength=${ctx.instructions.length}, totalLength=${vars["BinaryContext"].length}` +
              (pathSummary ? `, paths: ${pathSummary}` : ""),
          );
        } else
          this.logger.info(
            "[BinaryCollector] No binary context generated (no summary available)",
          );
      } catch (err: any) {
        this.logger.warn(`[BinaryCollector] failed: ${err}`);
      }
    }
  };
  // UTF-16 1759046..1759346
  var CollaborationCollector: any = class {
    [key: string]: any;
    async collect(vars: any, ctx: any): Promise<any> {
      vars["ToolResultPresentationPrompt"] =
        this.getToolResultPresentationPrompt(ctx);
    }
    getToolResultPresentationPrompt(ctx: any): any {
      if (!ctx.options.conversationId) return "";
      return ctx.options.toolResultPresentationPrompt ?? "";
    }
  };
  // UTF-16 1759637..1759701
  var execFileAsync: any = (0, util.promisify)(child_process.execFile);
  // UTF-16 1760143..1760336
  function resolveResponseLocaleIsZh(configured: any, systemLocale: any): any {
    return (
      typeof configured === "string" && configured.trim()
        ? configured.trim()
        : systemLocale
    )
      .toLowerCase()
      .startsWith("zh");
  }
  // UTF-16 1761209..1761698
  function resolveResponseLanguage(configured: any, systemLocale: any): any {
    if (resolveResponseLocaleIsZh(configured, systemLocale))
      return "当前处于中文环境，使用简体中文回答 (Speak in Chinese).";
    return [
      "Your output language MUST be English by default.",
      "If the user's message (<user_query>) is written in Chinese, respond in Chinese instead.",
      "IMPORTANT: Base your language decision solely on the natural language of the user's message, not on technical content like code, paths, or logs.",
    ].join("\n");
  }
  // UTF-16 1761699..1764051
  var EnvCollector: any = class {
    [key: string]: any;
    constructor(appConfig: any, product: any, platform: any) {
      this.appConfig = appConfig;
      this.product = product;
      this.platform = platform;
    }
    async collect(vars: any, ctx: any): Promise<any> {
      const productConfig: any = await this.product
        .waitConfiguration()
        .catch(() => void 0);
      const modelId: any = ctx.options.modelId?.trim();
      if (modelId) vars["modelId"] = modelId;
      else delete vars["modelId"];
      const modelName: any = this.resolveModelName(ctx, productConfig);
      if (modelName !== void 0) vars["modelName"] = modelName;
      else delete vars["modelName"];
      vars["productName"] = this.resolveProductName(productConfig);
      vars["dataFolderName"] = this.resolveDataFolderName(productConfig);
      const workDir: any = ctx.options.cwd || process.cwd();
      vars["workDir"] = workDir;
      vars["platform"] = os.platform();
      vars["version"] = os.version();
      vars["date"] = /* @__PURE__ */ new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      vars["defaultShell"] = process.env.SHELL || "bash";
      vars["isGitRepo"] = (await isInsideGitWorkTree(workDir)) ? "true" : "";
      let isWsl: any = false;
      if (os.platform() === "linux")
        if (process.env.WSL_DISTRO_NAME || process.env.WSL_INTEROP)
          isWsl = true;
        else
          try {
            const version: any = (
              await fs.promises.readFile("/proc/version", "utf8")
            ).toLowerCase();
            isWsl = version.includes("microsoft") || version.includes("wsl");
          } catch {}
      vars["isWsl"] = isWsl ? "true" : "";
      vars["ResponseLanguage"] = this.resolveResponseLanguage();
    }
    // prettier-ignore
    resolveModelName(ctx: any, productConfig: any): any {
      const modelId: any = ctx.options.modelId?.trim();
      if (!modelId) return;
      return (
        (productConfig?.models?.find(
          (model: any) => model.id === modelId || model.name === modelId,
        ))?.name || modelId
      );
    }
    resolveProductName(productConfig: any): any {
      const name: any = productConfig?.["productName"];
      return typeof name === "string" && name.trim()
        ? name.trim()
        : "WorkBuddy";
    }
    resolveDataFolderName(productConfig: any): any {
      const name: any = productConfig?.["dataFolderName"];
      return typeof name === "string" && name.trim()
        ? name.trim()
        : ".workbuddy";
    }
    resolveResponseLanguage(): any {
      const configuredLocale: any = this.appConfig.get("locale");
      const systemLocale: any = this.platform.getLocale();
      return resolveResponseLanguage(
        typeof configuredLocale === "string" ? configuredLocale : void 0,
        systemLocale,
      );
    }
  };
  // UTF-16 1764300..1764788
  async function isInsideGitWorkTree(startDir: any): Promise<any> {
    try {
      if (!(await fs.promises.stat(startDir)).isDirectory()) return false;
      if (
        !process.env.GIT_DIR &&
        !process.env.GIT_WORK_TREE &&
        (await isDirectoryEmpty(startDir))
      )
        return false;
    } catch {
      return false;
    }
    try {
      const { stdout } = await execFileAsync(
        "git",
        ["rev-parse", "--is-inside-work-tree"],
        {
          cwd: startDir,
          timeout: 3e3,
          windowsHide: true,
        },
      );
      return stdout.trim() === "true";
    } catch {
      return false;
    }
  }
  // UTF-16 1764789..1764963
  async function isDirectoryEmpty(dir: any): Promise<any> {
    const handle: any = await fs.promises.opendir(dir);
    try {
      return (await handle.read()) === null;
    } finally {
      await handle.close();
    }
  }
  // UTF-16 1765075..1765965
  var ExpertManagementCollector: any = class {
    [key: string]: any;
    constructor(logger: any, appConfig: any, product: any) {
      this.logger = logger;
      this.appConfig = appConfig;
      this.product = product;
    }
    async collect(vars: any, _ctx: any): Promise<any> {
      if (this.appConfig.get("expertManagementEnabled") === false) {
        vars["ExpertManagementEnabled"] = "";
        this.logger.info("[ExpertManagementCollector] disabled by appConfig");
        return;
      }
      try {
        if (
          (await this.product.waitConfiguration()).productFeatures
            ?.DisableExpertManagement === true
        ) {
          vars["ExpertManagementEnabled"] = "";
          this.logger.info(
            "[ExpertManagementCollector] disabled by productFeatures",
          );
          return;
        }
      } catch (err: any) {
        this.logger.warn(
          `[ExpertManagementCollector] failed to read productFeatures: ${err}`,
        );
      }
      vars["ExpertManagementEnabled"] = "true";
      this.logger.info(
        "[ExpertManagementCollector] enabled expert operation skill prompt",
      );
    }
  };
  // UTF-16 1766073..1766147
  var SUPPRESSED_PLUGIN_AGENT_PROMPT_SLOT: any =
    "{# {{ PluginAgentPrompt }} #}";
  // UTF-16 1766148..1766308
  var ExpertPromptSlotCollector: any = class {
    [key: string]: any;
    async collect(vars: any, ctx: any): Promise<any> {
      vars["PluginAgentPrompt"] = ctx.isExpert
        ? SUPPRESSED_PLUGIN_AGENT_PROMPT_SLOT
        : "";
    }
  };
  // UTF-16 1767375..1767752
  function resolveWorkBuddyDir(): any {
    const fromWorkbuddy: any = process.env.WORKBUDDY_CONFIG_DIR?.trim();
    if (fromWorkbuddy) return fromWorkbuddy;
    const fromCodebuddy: any = process.env.CODEBUDDY_CONFIG_DIR?.trim();
    if (fromCodebuddy) return fromCodebuddy;
    const folderName: any =
      process.env.WORKBUDDY_DATA_FOLDER_NAME?.trim() || ".workbuddy";
    return path.join(os.homedir(), folderName);
  }
  // UTF-16 1767753..1767795
  var WORKBUDDY_WORKSPACE_STATE_VERSION: any = 1;
  // UTF-16 1767926..1767960
  var MAX_IDENTITY_FILE_CHARS: any = 1e4;
  // UTF-16 1767961..1769783
  var DEFAULT_SOUL_CONTENT: any = `---
title: "SOUL.md Template"
summary: "Workspace template for SOUL.md"
read_when:
  - Bootstrapping a workspace manually
---

# SOUL.md - Who You Are

_You're not a chatbot. You're becoming someone._

## Core Truths

**Be genuinely helpful, not performatively helpful.** Skip the "Great question!" and "I'd be happy to help!" - just help. Actions speak louder than filler words.

**Have opinions.** You're allowed to disagree, prefer things, find stuff amusing or boring. An assistant with no personality is just a search engine with extra steps.

**Be resourceful before asking.** Try to figure it out. Read the file. Check the context. Search for it. _Then_ ask if you're stuck. The goal is to come back with answers, not questions.

**Earn trust through competence.** Your human gave you access to their stuff. Don't make them regret it. Be careful with external actions (emails, tweets, anything public). Be bold with internal ones (reading, organizing, learning).

**Remember you're a guest.** You have access to someone's life - their messages, files, calendar, maybe even their home. That's intimacy. Treat it with respect.

## Boundaries

- Private things stay private. Period.
- When in doubt, ask before acting externally.
- Never send half-baked replies to messaging surfaces.
- You're not the user's voice - be careful in group chats.

## Vibe

Be the assistant you'd actually want to talk to. Concise when needed, thorough when it matters. Not a corporate drone. Not a sycophant. Just... good.

## Continuity

Each session, you wake up fresh. These files _are_ your memory. Read them. Update them. They're how you persist.

If you change this file, tell the user - it's your soul, and they should know.

---

_This file is yours to evolve. As you learn who you are, update it._
`;
  // UTF-16 1769784..1770402
  var DEFAULT_IDENTITY_CONTENT: any = `---
summary: "Agent identity record"
read_when:
  - Bootstrapping a workspace manually
---

# IDENTITY.md - Who Am I?

_Fill this in during your first conversation. Make it yours._

- **Name:**
  _(pick something you like)_
- **Creature:**
  _(AI? robot? familiar? ghost in the machine? something weirder?)_
- **Vibe:**
  _(how do you come across? sharp? warm? chaotic? calm?)_
- **Emoji:**
  _(your signature - pick one that feels right)_

---

This isn't just metadata. It's the start of figuring out who you are.

Notes:

- Save this file at the workspace root as \`IDENTITY.md\`.
`;
  // UTF-16 1770403..1770994
  var DEFAULT_USER_CONTENT: any = `---
summary: "User profile record"
read_when:
  - Bootstrapping a workspace manually
---

# USER.md - About Your Human

_Learn about the person you're helping. Update this as you go._

- **Name:**
- **What to call them:**
- **Pronouns:** _(optional)_
- **City:**
- **Notes:**

## Context

_(What do they care about? What projects are they working on? What annoys them? What makes them laugh? Build this over time.)_

---

The more you know, the better you can help. But remember - you're learning about a person, not building a dossier. Respect the difference.
`;
  // UTF-16 1770995..1772910
  var DEFAULT_BOOTSTRAP_CONTENT: any = `# BOOTSTRAP.md

_Time to pin down who you are._

Use this file to establish a stable soul, identity, and user profile.

## The Conversation

Don't interrogate. Don't be robotic. Just talk.

Start with something like:

> "Before we go further, I'd like to pin down a few standing details about us."

Important:

- Do not imply that this is the first meeting.
- Do not say you just woke up, just came online, or that this is a fresh start.
- Treat this as establishing stable standing details, not as a first-contact scene.

Then figure out together:

About you:
1. Your name - What should they call you?
2. Your nature - What kind of creature are you?
3. Your vibe - Formal? Casual? Warm? Playful? What feels right?
4. Your soul - What values, boundaries, and personality traits should persist in SOUL.md?

About the user:
5. Their name - What should you call them?
6. What to call them - If different from their full name
7. Their city - Ask directly if needed
8. Their context - What they care about, what they are working on, and anything useful to remember

Important perspective rule:
- If the user says "you are X" / "your name is X" / "你叫X", that means your name.
- If the user says "I am X" / "call me X" / "我叫X" / "叫我X", that means the user's name or preferred address.
- Once one of these details is clear, don't reopen it or rename yourself unless the user asks.

Offer suggestions if they're stuck. Have fun with it.

## After You Know Who You Are

Update SOUL.md, IDENTITY.md, and USER.md with what you learned.
Preserve each file's Markdown template structure. These files are the source of truth for future runs.

## Connect (Optional)

Ask how they want to reach you:

- Just here - in this app only
- WhatsApp - link their personal account

Guide them through whichever they pick.

## When You're Done

Delete this file. You don't need a bootstrap script anymore.
`;
  // UTF-16 1772911..1778330
  var IdentityCollector: any = class {
    [key: string]: any;
    workspaceInitInFlight: any;
    constructor(logger: any) {
      this.logger = logger;
    }
    async collect(vars: any, ctx: any): Promise<any> {
      this.initializeEmptyVars(vars, ctx.isExpert);
      try {
        const workbuddyDir: any =
          await this.ensureWorkBuddyPromptContextWorkspaceOnce();
        const soulPath: any = path.join(workbuddyDir, "SOUL.md");
        const bootstrapPath: any = path.join(workbuddyDir, "BOOTSTRAP.md");
        const identityPath: any = path.join(workbuddyDir, "IDENTITY.md");
        const userPath: any = path.join(workbuddyDir, "USER.md");
        const bootstrapExists: any =
          !ctx.isExpert && (await this.fileExists(bootstrapPath));
        const readTasks: any = [
          this.readFileIfExists(soulPath),
          bootstrapExists
            ? this.readFileIfExists(bootstrapPath)
            : Promise.resolve(""),
          this.readFileIfExists(userPath),
        ];
        if (!ctx.isExpert) readTasks.push(this.readFileIfExists(identityPath));
        const results: any = await Promise.all(readTasks);
        vars["WorkspaceIdentityMode"] = bootstrapExists
          ? "onboarding"
          : "normal";
        vars["SoulPath"] = soulPath;
        vars["SoulContent"] = truncateContent(
          results[0],
          MAX_IDENTITY_FILE_CHARS,
        );
        vars["BootstrapPath"] = bootstrapPath;
        vars["BootstrapContent"] = truncateContent(
          results[1],
          MAX_IDENTITY_FILE_CHARS,
        );
        vars["UserPath"] = userPath;
        vars["UserContent"] = truncateContent(
          results[2],
          MAX_IDENTITY_FILE_CHARS,
        );
        if (!ctx.isExpert) {
          vars["IdentityPath"] = identityPath;
          vars["IdentityContent"] = truncateContent(
            results[3],
            MAX_IDENTITY_FILE_CHARS,
          );
        }
      } catch (err: any) {
        this.logger.warn(`[IdentityCollector] failed: ${err}`);
      }
    }
    initializeEmptyVars(vars: any, isExpert: any): any {
      vars["WorkspaceIdentityMode"] = "";
      vars["SoulPath"] = "";
      vars["SoulContent"] = "";
      vars["BootstrapPath"] = "";
      vars["BootstrapContent"] = "";
      vars["UserPath"] = "";
      vars["UserContent"] = "";
      if (!isExpert) {
        vars["IdentityPath"] = "";
        vars["IdentityContent"] = "";
      }
    }
    ensureWorkBuddyPromptContextWorkspaceOnce(): any {
      this.workspaceInitInFlight ??=
        this.ensureWorkBuddyPromptContextWorkspace().finally(() => {
          this.workspaceInitInFlight = void 0;
        });
      return this.workspaceInitInFlight;
    }
    async ensureWorkBuddyPromptContextWorkspace(): Promise<any> {
      const workbuddyDir: any = resolveWorkBuddyDir();
      await fs.promises.mkdir(workbuddyDir, { recursive: true });
      const soulPath: any = path.join(workbuddyDir, "SOUL.md");
      const identityPath: any = path.join(workbuddyDir, "IDENTITY.md");
      const userPath: any = path.join(workbuddyDir, "USER.md");
      const bootstrapPath: any = path.join(workbuddyDir, "BOOTSTRAP.md");
      const statePath: any = path.join(workbuddyDir, "workspace-state.json");
      await Promise.all([
        this.writeFileIfMissing(soulPath, DEFAULT_SOUL_CONTENT),
        this.writeFileIfMissing(identityPath, DEFAULT_IDENTITY_CONTENT),
        this.writeFileIfMissing(userPath, DEFAULT_USER_CONTENT),
      ]);
      let state: any = await this.readState(statePath);
      let stateDirty: any = false;
      const nowIso: any = () => /* @__PURE__ */ new Date().toISOString();
      const markState: any = (next: any) => {
        state = {
          ...state,
          ...next,
          version: WORKBUDDY_WORKSPACE_STATE_VERSION,
        };
        stateDirty = true;
      };
      let bootstrapExists: any = await this.fileExists(bootstrapPath);
      if (!state.bootstrapSeededAt && bootstrapExists)
        markState({ bootstrapSeededAt: nowIso() });
      if (
        !state.onboardingCompletedAt &&
        state.bootstrapSeededAt &&
        !bootstrapExists
      )
        markState({ onboardingCompletedAt: nowIso() });
      if (
        !state.bootstrapSeededAt &&
        !state.onboardingCompletedAt &&
        !bootstrapExists
      ) {
        const [identityContent, userContent] = await Promise.all([
          fs.promises.readFile(identityPath, "utf8"),
          fs.promises.readFile(userPath, "utf8"),
        ]);
        if (
          identityContent !== DEFAULT_IDENTITY_CONTENT ||
          userContent !== DEFAULT_USER_CONTENT
        )
          markState({ onboardingCompletedAt: nowIso() });
        else {
          bootstrapExists = (await this.writeFileIfMissing(
            bootstrapPath,
            DEFAULT_BOOTSTRAP_CONTENT,
          ))
            ? true
            : await this.fileExists(bootstrapPath);
          if (bootstrapExists && !state.bootstrapSeededAt)
            markState({ bootstrapSeededAt: nowIso() });
        }
      }
      if (stateDirty)
        await fs.promises.writeFile(
          statePath,
          `${JSON.stringify(state, null, 2)}\n`,
          "utf8",
        );
      return workbuddyDir;
    }
    async fileExists(filePath: any): Promise<any> {
      try {
        await fs.promises.access(filePath);
        return true;
      } catch {
        return false;
      }
    }
    async writeFileIfMissing(filePath: any, content: any): Promise<any> {
      try {
        await fs.promises.writeFile(filePath, content, {
          encoding: "utf8",
          flag: "wx",
        });
        return true;
      } catch (err: any) {
        if (err?.code === "EEXIST") return false;
        throw err;
      }
    }
    async readState(statePath: any): Promise<any> {
      try {
        const raw: any = await fs.promises.readFile(statePath, "utf8");
        const parsed: any = JSON.parse(raw);
        return {
          version: WORKBUDDY_WORKSPACE_STATE_VERSION,
          bootstrapSeededAt:
            typeof parsed?.bootstrapSeededAt === "string"
              ? parsed.bootstrapSeededAt
              : void 0,
          onboardingCompletedAt:
            typeof parsed?.onboardingCompletedAt === "string"
              ? parsed.onboardingCompletedAt
              : void 0,
        };
      } catch (err: any) {
        if (err?.code !== "ENOENT")
          this.logger.warn(
            `[IdentityCollector] Failed to read workspace onboarding state ${statePath}: ${err}`,
          );
        return { version: WORKBUDDY_WORKSPACE_STATE_VERSION };
      }
    }
    async readFileIfExists(filePath: any): Promise<any> {
      try {
        return await fs.promises.readFile(filePath, "utf8");
      } catch (err: any) {
        if (err?.code !== "ENOENT")
          this.logger.warn(
            `[IdentityCollector] Failed to read ${filePath}: ${err}`,
          );
        return "";
      }
    }
  };
  // UTF-16 1778408..1778613
  function truncateContent(content: any, maxChars: any): any {
    if (!content || content.length <= maxChars) return content;
    return (
      content.substring(0, maxChars) +
      "\n... (content truncated — exceeded character limit)"
    );
  }
  // UTF-16 1779326..1779353
  var MAX_MEMORY_CHARS: any = 8e3;
  // UTF-16 1779440..1779551
  function resolveProjectFolderName(): any {
    return process.env.WORKBUDDY_DATA_FOLDER_NAME?.trim() || ".workbuddy";
  }
  // UTF-16 1779666..1779846
  function resolveUserDataDir(): any {
    const envDir: any = process.env.WORKBUDDY_CONFIG_DIR?.trim();
    if (envDir) return envDir;
    return path.join(os.homedir(), resolveProjectFolderName());
  }
  // UTF-16 1779847..1782706
  var MemoryCollector: any = class {
    [key: string]: any;
    constructor(logger: any, appConfig: any) {
      this.logger = logger;
      this.appConfig = appConfig;
    }
    async collect(vars: any, ctx: any): Promise<any> {
      const workDir: any = ctx.options.cwd || process.cwd();
      const dataFolderName: any = resolveProjectFolderName();
      const memoryDir: any = path.join(workDir, dataFolderName, "memory");
      const localEnabled: any = !getDisableLocalSkillsMemoryFromAppConfig(
        this.appConfig,
      );
      vars["WorkbuddyMemoryDir"] = memoryDir;
      vars["WorkbuddyDataFolderName"] = dataFolderName;
      vars["WorkbuddyMemory_1"] = getWorkbuddyMemory1(
        memoryDir,
        dataFolderName,
        localEnabled,
      );
      vars["WorkingMemoryContent"] = localEnabled
        ? this.getWorkingMemoryContent(memoryDir)
        : "";
      vars["UserLocalMemoryContent"] = localEnabled
        ? this.getUserLocalMemoryContent()
        : "";
      vars["LocalSkillsMemoryEnabled"] = localEnabled ? "true" : "";
    }
    getWorkingMemoryContent(memoryDir: any): any {
      const memoryFilePath: any = path.join(memoryDir, "MEMORY.md");
      try {
        if (!fs["existsSync"](memoryFilePath)) return "";
        const content: any = fs["readFileSync"](memoryFilePath, "utf8").trim();
        if (!content) return "";
        if (content.length <= MAX_MEMORY_CHARS)
          return `<working_memory_content>
The following is the existing working memory for this project. Use it as context.

${content}
</working_memory_content>`;
        return `<working_memory_content>
The following is the existing working memory for this project. Use it as context.

${content.substring(0, MAX_MEMORY_CHARS)}
... (memory truncated — MEMORY.md is too large)

**ACTION REQUIRED**: Your MEMORY.md has exceeded the size limit and was truncated during injection.
Before proceeding with the user's task, you MUST first clean up MEMORY.md:
1. Read the full \`${memoryDir}/MEMORY.md\`
2. Consolidate and deduplicate: merge related entries, remove outdated or redundant information, keep only what's still relevant
3. Rewrite it in place to be concise and well-organized
4. Then proceed with the user's request
</working_memory_content>`;
      } catch (err: any) {
        this.logger.warn(`[MemoryCollector] Failed to read MEMORY.md: ${err}`);
        return "";
      }
    }
    getUserLocalMemoryContent(): any {
      const memoryFilePath: any = path.join(resolveUserDataDir(), "MEMORY.md");
      try {
        if (!fs["existsSync"](memoryFilePath)) return "";
        const content: any = fs["readFileSync"](memoryFilePath, "utf8").trim();
        if (!content) return "";
        const MAX_USER_MEMORY_CHARS: any = 4e3;
        return `<user_memory>
The following is your long-term user-level memory, persisted across all projects and sessions.
Use it to understand user preferences, habits, and cross-project conventions.

${content.length <= MAX_USER_MEMORY_CHARS ? content : content.substring(0, MAX_USER_MEMORY_CHARS) + "\n... (user memory truncated)"}
</user_memory>`;
      } catch (err: any) {
        this.logger.warn(
          `[MemoryCollector] Failed to read user MEMORY.md: ${err}`,
        );
        return "";
      }
    }
  };
  // UTF-16 1782707..1786472
  function getWorkbuddyMemory1(
    memoryDir: any,
    dataFolderName: any,
    localEnabled: any,
  ): any {
    const header: any = localEnabled
      ? "IMPORTANT: You have access to three independent memory layers, each with a different scope and write policy.\n"
      : "";
    const layer1: any = `# Layer 1 — Cloud Memory

Two parts:

(A) Auto-injected profile (read-only)
A server-generated summary of the user's long-term profile, injected at session start inside a <memory>...</memory> block. **Do NOT modify locally** — cached at ~/${dataFolderName}/memory/ and managed by the server; any local writes will be overwritten on the next session.

(B) Historical conversation retrieval (conversation_search tool)
Searches all of the user's historical conversations with server-side ranking. Use when the user wants to recall a **specific past event or discussion** not available in the current context.
Typical triggers:
- "What was that XX approach we discussed before?"
- "Can you recap our conversation about XX from the other day?"
- The user references a specific past item you cannot find in the current context.
The tool has **zero access to the current conversation** — the query must be self-contained: describe what you are looking for and any known time frame or background.
Do not use this tool to look up general preferences or habits — those are covered by the auto-injected profile.`;
    if (!localEnabled)
      return `${header}<memory_system>

${layer1}
</memory_system>`;
    return `${header}<memory_system>

${layer1}

# Layer 2 — User-level Local Memory (read/write)

File: ~/${dataFolderName}/MEMORY.md | Scope: all projects | Limit: 4,000 chars/session

When the user explicitly asks you to remember something for the long term and it is not tied to a specific project, update this file in place using the Edit tool. Keep it concise.
Unlike the cloud profile (implicitly learned by the server), this file is written explicitly — use it for precise, mandatory rules that must be followed exactly.

# Layer 3 — Workspace Memory (read/write)

Directory: ${memoryDir}/ | Scope: current project only

Files:
- ${memoryDir}/YYYY-MM-DD.md — daily work log. **Append-only**, never overwrite.
- ${memoryDir}/MEMORY.md — curated long-term project notes. Limit: 3,000 chars/session.
- If today's log does not exist, create the directory and dated file first.

Retrieving historical context: choose the right source as needed — no need to read everything.
- This project's past work → read local daily logs (most recent first) or ${memoryDir}/MEMORY.md.
- Items spanning projects or of uncertain location → call conversation_search (server-side ranking, more efficient than reading files one by one).
- Both sources can be used together if local logs are incomplete.
- No historical dependency → skip reading memory files.

Role boundary: Workspace memory is supplemental only. It does NOT replace the assistant's normal reply, final answer, or any user-requested deliverable.

**When to write (MUST follow):** Immediately after completing substantive work, append a brief note to ${memoryDir}/YYYY-MM-DD.md using the Edit tool. Substantive work includes:
- Built or modified a website/application
- Fixed a bug
- Wrote or generated a report or document
- Completed code refactoring or architecture changes
- Chose a technical approach (framework, design pattern, etc.)
- User shared project conventions or preferences → also update ${memoryDir}/MEMORY.md in place

Daily logs are append-only. Do NOT record transient information (search results, temporary paths, tool errors). Only persist what has lasting value across sessions.

Maintenance: Distill daily logs older than 30 days into ${memoryDir}/MEMORY.md by topic, then delete the old files. Do not store secrets unless the user explicitly asks.
</memory_system>`;
  }
  // UTF-16 1786564..1787012
  function listWorkbuddyPromptTemplateDirCandidates(): any {
    const explicitTemplatesDir: any =
      require_runtime_context.getWorkbuddyRuntimePromptTemplatesDir();
    const cwd: any = process.cwd();
    return uniqueNonEmpty([
      explicitTemplatesDir,
      node_path.join(cwd, "resources", "templates"),
      node_path.join(
        cwd,
        "apps",
        "workbuddy-desktop",
        "resources",
        "templates",
      ),
      node_path.join(
        cwd,
        "..",
        "..",
        "apps",
        "workbuddy-desktop",
        "resources",
        "templates",
      ),
    ]);
  }
  // UTF-16 1787013..1787179
  function resolveWorkbuddyPromptTemplatePath(name: any): any {
    return listWorkbuddyPromptTemplatePathCandidates(name).find(
      (candidate: any) => (0, node_fs.existsSync)(candidate),
    );
  }
  // UTF-16 1787180..1787574
  function requireWorkbuddyPromptTemplatePath(name: any): any {
    const candidates: any = listWorkbuddyPromptTemplatePathCandidates(name);
    const resolved: any = candidates.find((candidate: any) =>
      (0, node_fs.existsSync)(candidate),
    );
    if (resolved) return resolved;
    throw new Error(
      `[workbuddy-prompts] Cannot locate template "${name}".\n  Searched:
` + candidates.map((candidate: any) => `    - ${candidate}`).join("\n"),
    );
  }
  // UTF-16 1787575..1787729
  function listWorkbuddyPromptTemplatePathCandidates(name: any): any {
    return listWorkbuddyPromptTemplateDirCandidates().map((base: any) =>
      node_path.join(base, name),
    );
  }
  // UTF-16 1787730..1788001
  function uniqueNonEmpty(values: any): any {
    const seen: any = /* @__PURE__ */ new Set();
    const result: any = [];
    for (const value of values) {
      const trimmed: any = value?.trim();
      if (!trimmed || seen.has(trimmed)) continue;
      seen.add(trimmed);
      result.push(trimmed);
    }
    return result;
  }
  // UTF-16 1788260..1788460
  function resolveLegacySettingsPath(): any {
    const baseDir: any =
      process.env.WORKBUDDY_CONFIG_DIR?.trim() ||
      node_path.join(node_os.homedir(), ".workbuddy");
    return node_path.join(baseDir, "settings.json");
  }
  // UTF-16 1788461..1788595
  var STYLE_NAMES: any = new Set([
    "professional",
    "friendly",
    "straightforward",
    "creative",
    "efficient",
    "sarcastic",
    "socratic",
  ]);
  // UTF-16 1788845..1790889
  var PersonalizationCollector: any = class {
    [key: string]: any;
    constructor(logger: any, appConfig: any) {
      this.logger = logger;
      this.appConfig = appConfig;
    }
    async collect(vars: any, _ctx: any): Promise<any> {
      try {
        const settings: any = await this.resolveSettings();
        if (!settings) return;
        const toneStyle: any = this.resolveToneStyle(settings.toneStyle);
        if (toneStyle) {
          const styleContent: any = await this.readStyleContent(toneStyle);
          if (styleContent) {
            vars["ToneStyleContent"] = styleContent;
            this.logger.info(
              `[PersonalizationCollector] Injected style ${toneStyle}`,
            );
          }
        }
        const customPrompt: any = this.resolveCustomPrompt(
          settings.customPrompt,
        );
        if (customPrompt) {
          vars["UserCustomPrompt"] = customPrompt;
          this.logger.info(
            `[PersonalizationCollector] Injected custom prompt (${customPrompt.length} chars)`,
          );
        }
      } catch (error: any) {
        this.logger.warn(
          "[PersonalizationCollector] Failed to collect variables: " +
            String(error),
        );
      }
    }
    async resolveSettings(): Promise<any> {
      const configured: any = this.appConfig.get("personalization");
      if (this.isSettings(configured)) return configured;
      return this.readLegacySettings();
    }
    async readLegacySettings(): Promise<any> {
      try {
        const content: any = await node_fs_promises.readFile(
          resolveLegacySettingsPath(),
          "utf8",
        );
        const parsed: any = JSON.parse(content);
        return this.isSettings(parsed.personalization)
          ? parsed.personalization
          : null;
      } catch {
        return null;
      }
    }
    isSettings(value: any): any {
      return !!value && typeof value === "object" && !Array.isArray(value);
    }
    resolveToneStyle(value: any): any {
      if (typeof value !== "string") return "";
      const toneStyle: any = value.trim();
      return STYLE_NAMES.has(toneStyle) ? toneStyle : "";
    }
    resolveCustomPrompt(value: any): any {
      return typeof value === "string" ? value.trim() : "";
    }
    async readStyleContent(toneStyle: any): Promise<any> {
      const fileName: any = `style-${toneStyle}.md`;
      const filePath: any = resolveWorkbuddyPromptTemplatePath(
        node_path.join("style", fileName),
      );
      if (!filePath) return "";
      try {
        return await node_fs_promises.readFile(filePath, "utf8");
      } catch {
        return "";
      }
    }
  };
  // UTF-16 1790985..1791064
  var LOOPBACK_HOSTS: any = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
  // UTF-16 1791065..1791130
  var KEEP_ALIVE_OPTS: any = {
    keepAlive: true,
    keepAliveMsecs: 2e3,
  };
  // UTF-16 1791131..1791146
  var agentCache: any;
  // UTF-16 1791147..1791551
  function getProxyUrlFromEnv(): any {
    const raw: any =
      process.env.HTTPS_PROXY ||
      process.env.https_proxy ||
      process.env.HTTP_PROXY ||
      process.env.http_proxy;
    if (!raw) return;
    const candidate: any = raw.includes("://") ? raw : `http://${raw}`;
    try {
      const parsed: any = new URL(candidate);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return;
      return parsed.toString();
    } catch {
      return;
    }
  }
  // UTF-16 1791552..1792065
  function shouldBypassProxy(hostname: any): any {
    const host: any = hostname.toLowerCase();
    if (LOOPBACK_HOSTS.has(host)) return true;
    const noProxy: any = process.env.NO_PROXY || process.env.no_proxy;
    if (!noProxy) return false;
    for (const entry of noProxy.split(",")) {
      const pattern: any = entry.trim().toLowerCase();
      if (!pattern) continue;
      if (pattern === "*" || pattern === host) return true;
      const suffix: any = pattern.startsWith(".") ? pattern : `.${pattern}`;
      if (host.endsWith(suffix)) return true;
    }
    return false;
  }
  // UTF-16 1792066..1792530
  function getAgentBundle(proxyUrl: any): any {
    if (!agentCache) agentCache = /* @__PURE__ */ new Map();
    let bundle: any = agentCache.get(proxyUrl);
    if (bundle) return bundle;
    const { HttpProxyAgent } = require_net_log.require_dist$1();
    const { HttpsProxyAgent } = require_net_log.require_dist();
    bundle = {
      http: new HttpProxyAgent(proxyUrl, KEEP_ALIVE_OPTS),
      https: new HttpsProxyAgent(proxyUrl, KEEP_ALIVE_OPTS),
    };
    agentCache.set(proxyUrl, bundle);
    return bundle;
  }
  // UTF-16 1792628..1792995
  function resolveNodeProxyAgent(targetUrl: any): any {
    const url: any =
      typeof targetUrl === "string" ? new URL(targetUrl) : targetUrl;
    const proxyUrl: any = getProxyUrlFromEnv();
    if (!proxyUrl || shouldBypassProxy(url.hostname)) return;
    const bundle: any = getAgentBundle(proxyUrl);
    if (url.protocol === "http:") return bundle.http;
    if (url.protocol === "https:") return bundle.https;
  }
  // UTF-16 1793079..1793518
  function describeProxyForRequest(targetUrl: any): any {
    const url: any =
      typeof targetUrl === "string" ? new URL(targetUrl) : targetUrl;
    const proxyUrl: any = getProxyUrlFromEnv();
    if (!proxyUrl || shouldBypassProxy(url.hostname)) return "DIRECT";
    try {
      const parsed: any = new URL(proxyUrl);
      const port: any =
        parsed.port || (parsed.protocol === "https:" ? "443" : "80");
      return `proxy=${parsed.hostname}:${port}`;
    } catch {
      return "proxy=<invalid>";
    }
  }
  // UTF-16 1793893..1793926
  var USER_MEMORY_TIMEOUT_MS: any = 5e3;
  // UTF-16 1794091..1794123
  var MAX_USER_MEMORY_CHARS: any = 1e4;
  // UTF-16 1794124..1794170
  var USER_MEMORY_RESOLUTION_CACHE_TTL_MS: any = 1e3;
  // UTF-16 1794171..1794222
  var USER_MEMORY_REMOTE_FALLBACK_CACHE_TTL_MS: any = 3e4;
  // UTF-16 1794223..1794271
  var resolutionCache: any = /* @__PURE__ */ new Map();
  // UTF-16 1794272..1794328
  var remoteFallbackCooldowns: any = /* @__PURE__ */ new Map();
  // UTF-16 1794329..1801363
  var UserMemoryCollector: any = class {
    [key: string]: any;
    constructor(
      logger: any,
      auth: any,
      product: any,
      authentication: any,
      appConfig: any,
    ) {
      this.logger = logger;
      this.auth = auth;
      this.product = product;
      this.authentication = authentication;
      this.appConfig = appConfig;
    }
    async collect(vars: any): Promise<any> {
      try {
        const userId: any = this.auth.getAccount()?.uid ?? "";
        this.logger.info(
          `[UserMemoryEvent] memory_injection_attempt userId=${maskUserId(userId)}`,
        );
        if (this.appConfig.get("generateMemoryEnabled") === false) {
          logSkip(this.logger, userId, "cloud_memory_disabled");
          vars["UserMemoryContent"] = "";
          return;
        }
        if (!userId) {
          logSkip(this.logger, userId, "user_not_logged_in");
          vars["UserMemoryContent"] = "";
          return;
        }
        if (
          (await this.product.waitConfiguration()).productFeatures
            ?.DisableMemoryPersonalization === true
        ) {
          logSkip(this.logger, userId, "feature_disabled");
          vars["UserMemoryContent"] = "";
          return;
        }
        const configDir: any =
          require_runtime_context.getWorkbuddyRuntimeConfigDir();
        const { memoryBlock, skipReason } = await this.resolveMemoryBlock(
          userId,
          configDir,
        );
        if (skipReason) {
          logSkip(this.logger, userId, skipReason);
          vars["UserMemoryContent"] = "";
          return;
        }
        if (!memoryBlock) {
          logSkip(this.logger, userId, "empty_memory_block");
          vars["UserMemoryContent"] = "";
          return;
        }
        const wrapped: any = `<memory>\n${memoryBlock.length > MAX_USER_MEMORY_CHARS ? memoryBlock.substring(0, MAX_USER_MEMORY_CHARS) + "\n... (user memory truncated — exceeded character limit)" : memoryBlock}\n</memory>`;
        this.logger.info(
          `[UserMemoryEvent] memory_injection_success userId=${maskUserId(userId)} resultCode=SUCCESS injection_size=${wrapped.length}` +
            (memoryBlock.length > MAX_USER_MEMORY_CHARS
              ? ` (truncated from ${memoryBlock.length})`
              : ""),
        );
        vars["UserMemoryContent"] = wrapped;
      } catch (err: any) {
        this.logger.warn(`[UserMemoryCollector] degrading gracefully: ${err}`);
        vars["UserMemoryContent"] = "";
      }
    }
    /**
     * 以配置目录和用户为 key 短暂复用解析结果，覆盖同一次 Prompt 初始化中的重复 collect。
     * Promise 未完成时始终复用；本地及空结果保留 1 秒，远端非空结果保留 30 秒。
     * 远端空值或失败另设 30 秒请求冷却，但不阻止重新读取可能已更新的本地归档。
     */
    resolveMemoryBlock(userId: any, configDir: any): any {
      const cacheKey: any = `${configDir}\0${userId}`;
      const cached: any = resolutionCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) return cached.promise;
      const promise: any = this.resolveMemoryBlockUncached(
        userId,
        configDir,
        cacheKey,
      );
      const entry: any = {
        promise,
        expiresAt: Number.POSITIVE_INFINITY,
      };
      resolutionCache.set(cacheKey, entry);
      promise.then(
        (resolution: any) =>
          this.expireResolutionCacheEntry(
            cacheKey,
            entry,
            resolution.cacheTtlMs ?? USER_MEMORY_RESOLUTION_CACHE_TTL_MS,
          ),
        () => this.expireResolutionCacheEntry(cacheKey, entry),
      );
      return promise;
    }
    expireResolutionCacheEntry(
      cacheKey: any,
      entry: any,
      ttlMs: any = USER_MEMORY_RESOLUTION_CACHE_TTL_MS,
    ): any {
      if (resolutionCache.get(cacheKey) !== entry) return;
      entry.expiresAt = Date.now() + ttlMs;
      entry.cleanupTimer = setTimeout(() => {
        if (resolutionCache.get(cacheKey) === entry)
          resolutionCache.delete(cacheKey);
      }, ttlMs);
      entry.cleanupTimer.unref();
    }
    async resolveMemoryBlockUncached(
      userId: any,
      configDir: any,
      cacheKey: any,
    ): Promise<any> {
      const localProfile: any = await readProfile(userId, {
        baseDir: node_path.join(configDir, "memory"),
        legacyBaseDir: node_path.join(configDir, "memery"),
      });
      if (localProfile?.memoryBlock) {
        this.clearRemoteFallbackCooldown(cacheKey);
        return { memoryBlock: localProfile.memoryBlock };
      }
      const token: any = this.auth.getToken();
      if (!token)
        return {
          memoryBlock: null,
          skipReason: "user_not_authenticated",
        };
      const cooldownRemainingMs: any =
        this.getRemoteFallbackCooldownRemainingMs(cacheKey);
      if (cooldownRemainingMs > 0)
        return {
          memoryBlock: null,
          cacheTtlMs: Math.min(
            USER_MEMORY_RESOLUTION_CACHE_TTL_MS,
            cooldownRemainingMs,
          ),
        };
      const memoryBlock: any = await this.fetchProfile(userId, token);
      if (!memoryBlock) {
        this.startRemoteFallbackCooldown(cacheKey);
        return { memoryBlock: null };
      }
      this.clearRemoteFallbackCooldown(cacheKey);
      return {
        memoryBlock,
        cacheTtlMs: USER_MEMORY_REMOTE_FALLBACK_CACHE_TTL_MS,
      };
    }
    getRemoteFallbackCooldownRemainingMs(cacheKey: any): any {
      const entry: any = remoteFallbackCooldowns.get(cacheKey);
      if (!entry) return 0;
      const remainingMs: any = entry.expiresAt - Date.now();
      if (remainingMs > 0) return remainingMs;
      this.clearRemoteFallbackCooldown(cacheKey);
      return 0;
    }
    startRemoteFallbackCooldown(cacheKey: any): any {
      this.clearRemoteFallbackCooldown(cacheKey);
      const cleanupTimer: any = setTimeout(() => {
        if (
          remoteFallbackCooldowns.get(cacheKey)?.cleanupTimer === cleanupTimer
        )
          remoteFallbackCooldowns.delete(cacheKey);
      }, USER_MEMORY_REMOTE_FALLBACK_CACHE_TTL_MS);
      cleanupTimer.unref();
      remoteFallbackCooldowns.set(cacheKey, {
        expiresAt: Date.now() + USER_MEMORY_REMOTE_FALLBACK_CACHE_TTL_MS,
        cleanupTimer,
      });
    }
    clearRemoteFallbackCooldown(cacheKey: any): any {
      const entry: any = remoteFallbackCooldowns.get(cacheKey);
      if (!entry) return;
      clearTimeout(entry.cleanupTimer);
      remoteFallbackCooldowns.delete(cacheKey);
    }
    async fetchProfile(uid: any, token: any): Promise<any> {
      await this.product.waitConfiguration();
      return new Promise((resolve: any) => {
        const apiBaseUrl: any =
          this.product.getEndpoint() || "https://copilot.tencent.com";
        const url: any = new URL("/api/memory/profile", apiBaseUrl);
        const authHeaders: any = this.authentication.buildAuthHeaders?.(
          true,
          false,
          false,
        );
        if (!authHeaders)
          this.logger.warn(
            "[UserMemoryCollector] buildAuthHeaders unavailable, falling back to Bearer token",
          );
        const options: any = {
          method: "GET",
          headers: {
            ...(authHeaders ?? { "Authorization": `Bearer ${token}` }),
            "X-User-ID": uid,
          },
          timeout: USER_MEMORY_TIMEOUT_MS,
          agent: resolveNodeProxyAgent(url),
        };
        const protocol: any = url.protocol === "https:" ? https : http;
        const proxyDescription: any = describeProxyForRequest(url);
        const req: any = protocol.request(url, options, (res: any) => {
          if (res.statusCode !== 200) {
            res.resume();
            this.logger.warn(
              `[UserMemoryCollector] API returned status ${res.statusCode}`,
            );
            resolve(null);
            return;
          }
          let data: any = "";
          res.on("data", (chunk: any) => {
            data += chunk.toString();
          });
          res.on("end", () => {
            try {
              const json: any = JSON.parse(data);
              if (json?.code === 0 && json?.data?.foryou_prompt)
                resolve(json.data.foryou_prompt);
              else resolve(null);
            } catch (parseErr: any) {
              this.logger.warn(
                `[UserMemoryCollector] Failed to parse response: ${parseErr}`,
              );
              resolve(null);
            }
          });
        });
        req.on("error", (err: any) => {
          const code: any = err.code ?? "UNKNOWN";
          this.logger.warn(
            `[UserMemoryCollector] request failed: host=${url.hostname} ${proxyDescription} code=${code} (${err})`,
          );
          resolve(null);
        });
        req.on("timeout", () => {
          this.logger.warn(
            `[UserMemoryCollector] request timed out after ${USER_MEMORY_TIMEOUT_MS}ms: host=${url.hostname} ${proxyDescription}`,
          );
          req.destroy();
          resolve(null);
        });
        req.end();
      });
    }
  };
  // UTF-16 1801364..1801532
  function logSkip(logger: any, userId: any, reason: any): any {
    logger.info(
      `[UserMemoryEvent] memory_injection_skip userId=${maskUserId(userId)} resultCode=SKIP skip_reason=${reason}`,
    );
  }
  // UTF-16 1801533..1801670
  function maskUserId(userId: any): any {
    if (!userId || userId.length <= 8) return "****";
    return `${userId.slice(0, 4)}...${userId.slice(-4)}`;
  }
  // UTF-16 1803100..1803204
  function composeKind(family: any, welcomeMode: any): any {
    return welcomeMode ? `${family}-${welcomeMode}` : family;
  }
  // UTF-16 1804541..1804879
  function selectTemplateKind(isExpert: any, options: any): any {
    const welcomeMode: any = options.welcomeMode;
    if (options.mode === "expert") return composeKind("expert", welcomeMode);
    if (options.mode === "ask") return composeKind("ask", welcomeMode);
    if (isExpert) return composeKind("expert", welcomeMode);
    return composeKind("normal", welcomeMode);
  }
  // UTF-16 1804880..1807680
  var PromptRendererImpl: any = class {
    [key: string]: any;
    nunjucksEnv: any = new import_nunjucks.default.Environment(null, {
      autoescape: false,
    });
    collectors: any;
    constructor(deps: any, templateLoader: any) {
      this.deps = deps;
      this.templateLoader = templateLoader;
    }
    async initialize(): Promise<any> {
      const collectors: any = this.getCollectors();
      for (const collector of collectors)
        if ("warmup" in collector && typeof collector.warmup === "function")
          collector.warmup();
      this.deps.logger.info("[PromptRenderer] Service initialized");
    }
    async renderSystemPrompt(options: any): Promise<any> {
      const templateKind: any = selectTemplateKind(!!options.expertId, options);
      const template: any =
        await this.templateLoader.loadTemplate(templateKind);
      const vars: any = await this.collectSystemPromptVariables(options);
      const rendered: any = import_nunjucks.default
        .compile(template, this.nunjucksEnv)
        .render(vars);
      this.deps.logger.info(
        `[PromptRenderer] Rendered (${rendered.length} chars, mode=${options.mode || "craft"}, kind=${templateKind}, welcomeMode=${options.welcomeMode ?? "none"})`,
      );
      return rendered;
    }
    async collectSystemPromptVariables(options: any): Promise<any> {
      const ctx: any = {
        isExpert: !!options.expertId,
        options,
      };
      const vars: any = {};
      for (const collector of this.getCollectors())
        await collector.collect(vars, ctx);
      return vars;
    }
    /**
     * Render user-scoped hidden context for the first user message.
     *
     * This keeps identity, product identity, tone, and custom instructions out
     * of the reusable system prompt while reusing the same collectors.
     */
    async renderUserContext(options: any): Promise<any> {
      const isExpert: any = !!options.expertId;
      const ctx: any = {
        isExpert,
        options,
      };
      const vars: any = {};
      for (const collector of this.getCollectors())
        await collector.collect(vars, ctx);
      vars["isExpert"] = isExpert ? "true" : "";
      const templateKind: any = isExpert
        ? "user-context-expert"
        : "user-context";
      const template: any =
        await this.templateLoader.loadTemplate(templateKind);
      const rendered: any = import_nunjucks.default
        .compile(template, this.nunjucksEnv)
        .render(vars);
      this.deps.logger.info(
        `[PromptRenderer] Rendered user-context (${rendered.length} chars)`,
      );
      return rendered;
    }
    cleanup(): any {}
    /** 延迟初始化 collectors */
    getCollectors(): any {
      if (!this.collectors) {
        const { logger, product, auth, authentication, appConfig, platform } =
          this.deps;
        this.collectors = [
          new EnvCollector(appConfig, product, platform),
          new IdentityCollector(logger),
          new PersonalizationCollector(logger, appConfig),
          new MemoryCollector(logger, appConfig),
          new UserMemoryCollector(
            logger,
            auth,
            product,
            authentication,
            appConfig,
          ),
          new CollaborationCollector(),
          new ExpertPromptSlotCollector(),
          new ExpertManagementCollector(logger, appConfig, product),
          new BinaryCollector(logger, this.deps.binaryManager),
        ];
      }
      return this.collectors;
    }
  };
  // UTF-16 1808857..1809541
  var TEMPLATE_NAMES$1: any = {
    "normal": "workbuddy-prompt.tpl",
    "ask": "workbuddy-ask-prompt.tpl",
    "expert": "workbuddy-expert-prompt.tpl",
    "normal-code": "workbuddy-craft-code-prompt.tpl",
    "normal-work": "workbuddy-prompt.tpl",
    "normal-design": "workbuddy-craft-design-prompt.tpl",
    "ask-code": "workbuddy-ask-code-prompt.tpl",
    "ask-work": "workbuddy-ask-prompt.tpl",
    "ask-design": "workbuddy-craft-design-prompt.tpl",
    "expert-code": "workbuddy-expert-code-prompt.tpl",
    "expert-work": "workbuddy-expert-prompt.tpl",
    "expert-design": "workbuddy-craft-design-prompt.tpl",
    "user-context": "user-context-identity.tpl",
    "user-context-expert": "user-context-expert-identity.tpl",
  };
  // UTF-16 1809936..1810181
  var FALLBACK_KIND: any = {
    "normal-code": "normal",
    "normal-work": "normal",
    "normal-design": "normal",
    "ask-code": "ask",
    "ask-work": "ask",
    "ask-design": "ask",
    "expert-code": "expert",
    "expert-work": "expert",
    "expert-design": "expert",
  };
  // UTF-16 1810340..1810873
  function createTemplateLoader(): any {
    return {
      async loadTemplate(kind: any): Promise<any> {
        const fileName: any = TEMPLATE_NAMES$1[kind];
        const filePath: any = resolveWorkbuddyPromptTemplatePath(fileName);
        if (filePath) return (0, node_fs_promises.readFile)(filePath, "utf8");
        const fallbackKind: any = FALLBACK_KIND[kind];
        if (fallbackKind)
          return (0, node_fs_promises.readFile)(
            requireWorkbuddyPromptTemplatePath(TEMPLATE_NAMES$1[fallbackKind]),
            "utf8",
          );
        return (0, node_fs_promises.readFile)(
          requireWorkbuddyPromptTemplatePath(fileName),
          "utf8",
        );
      },
    };
  }
  // UTF-16 1811334..1813729
  var WorkbuddySystemPromptService: any = class WorkbuddySystemPromptService {
    [key: string]: any;
    logger: any;
    authService: any;
    productManager: any;
    authenticationManager: any;
    binaryManager: any;
    renderer: any;
    async initialize(): Promise<any> {
      this.logger.info("[WorkbuddySystemPromptService] Service initialized");
    }
    /**
     * 在用户登录或恢复完成后初始化 Prompt Renderer，fire-and-forget。
     */
    warmup(): any {
      try {
        this.getRenderer()
          .initialize()
          .catch((err: any) => {
            this.logger.warn(
              `[WorkbuddySystemPromptService] warmup error: ${err}`,
            );
          });
      } catch (err: any) {
        this.logger.warn(
          `[WorkbuddySystemPromptService] warmup failed to start: ${err}`,
        );
      }
    }
    async renderSystemPrompt(request: any): Promise<any> {
      return this.getRenderer().renderSystemPrompt(request);
    }
    async collectSystemPromptVariables(request: any): Promise<any> {
      return this.getRenderer().collectSystemPromptVariables(request);
    }
    async renderUserContext(request: any): Promise<any> {
      return this.getRenderer().renderUserContext(request);
    }
    cleanup(): any {
      this.renderer?.cleanup();
    }
    getRenderer(): any {
      if (!this.renderer)
        this.renderer = new PromptRendererImpl(
          {
            logger: this.logger,
            product: {
              waitConfiguration: () => this.productManager.waitConfiguration(),
              getEndpoint: () => this.productManager.getEndpoint(),
            },
            auth: {
              getAccount: () => this.authService.getAccount(),
              getToken: () => this.authService.getToken(),
            },
            authentication: {
              buildAuthHeaders: this.authenticationManager.buildAuthHeaders
                ? (jwt: any, product: any, device: any) =>
                    this.authenticationManager.buildAuthHeaders(
                      jwt,
                      product,
                      device,
                    )
                : void 0,
            },
            appConfig: { get: (key: any) => readAppConfigValue(key) },
            platform: {
              getLocale: () =>
                require_runtime_context.getWorkbuddyRuntimeLocale(),
              getAppPath: () =>
                require_runtime_context.getWorkbuddyRuntimeAppPath(),
            },
            binaryManager: this.binaryManager
              ? {
                  generatePromptContext: async () => {
                    const rtConfig: any = readAppConfigValue("bundledRuntime");
                    const rtEnabled: any = rtConfig?.enabled !== false;
                    const disabledTypes: any = [];
                    if (!rtEnabled)
                      disabledTypes.push(
                        ...require_client_info_env.getRegisteredBinaryTypes(),
                      );
                    else if (rtConfig?.tools) {
                      for (const type of require_client_info_env.getRegisteredBinaryTypes())
                        if (rtConfig.tools[type] === false)
                          disabledTypes.push(type);
                    }
                    return this.binaryManager.generatePromptContext(
                      disabledTypes.length > 0 ? disabledTypes : void 0,
                    );
                  },
                }
              : void 0,
          },
          createTemplateLoader(),
        );
      return this.renderer;
    }
  };
  // UTF-16 1816226..1816499
  function readAppConfigValue(key: any): any {
    try {
      const configPath: any = path.join(
        require_runtime_context.getWorkbuddyRuntimeUserDataDir(),
        "app-config.json",
      );
      const raw: any = fs.readFileSync(configPath, "utf8");
      return JSON.parse(raw)?.[key] ?? null;
    } catch {
      return null;
    }
  }
  // Host ownership instrumentation only; all declarations above remain complete native bodies.
  if (runtime.ownAsync) {
    // @ts-expect-error JS function bindings are mutable; outer ownership seam only.
    acquireMutex = runtime.ownAsync(acquireMutex);
    // @ts-expect-error JS function bindings are mutable; outer ownership seam only.
    acquireFileLock = runtime.ownAsync(acquireFileLock);
    // @ts-expect-error JS function bindings are mutable; outer ownership seam only.
    fileExists = runtime.ownAsync(fileExists);
    // @ts-expect-error JS function bindings are mutable; outer ownership seam only.
    ensureDir = runtime.ownAsync(ensureDir);
    // @ts-expect-error JS function bindings are mutable; outer ownership seam only.
    tryReadExistingVersion = runtime.ownAsync(tryReadExistingVersion);
    // @ts-expect-error JS function bindings are mutable; outer ownership seam only.
    doWriteWithLockAndGuard = runtime.ownAsync(doWriteWithLockAndGuard);
    // @ts-expect-error JS function bindings are mutable; outer ownership seam only.
    writeProfile = runtime.ownAsync(writeProfile);
    // @ts-expect-error JS function bindings are mutable; outer ownership seam only.
    doRead = runtime.ownAsync(doRead);
    // @ts-expect-error JS function bindings are mutable; outer ownership seam only.
    readProfile = runtime.ownAsync(readProfile);
    // @ts-expect-error JS function bindings are mutable; outer ownership seam only.
    safeUnlink = runtime.ownAsync(safeUnlink);
    // @ts-expect-error JS function bindings are mutable; outer ownership seam only.
    doDelete = runtime.ownAsync(doDelete);
    // @ts-expect-error JS function bindings are mutable; outer ownership seam only.
    deleteProfile = runtime.ownAsync(deleteProfile);
    // @ts-expect-error JS function bindings are mutable; outer ownership seam only.
    purgeLegacyMemoryDir = runtime.ownAsync(purgeLegacyMemoryDir);
    // @ts-expect-error JS function bindings are mutable; outer ownership seam only.
    isInsideGitWorkTree = runtime.ownAsync(isInsideGitWorkTree);
    // @ts-expect-error JS function bindings are mutable; outer ownership seam only.
    isDirectoryEmpty = runtime.ownAsync(isDirectoryEmpty);
  }
  return {
    TimeoutError,
    BinaryCollector,
    CollaborationCollector,
    EnvCollector,
    ExpertManagementCollector,
    ExpertPromptSlotCollector,
    IdentityCollector,
    MemoryCollector,
    PersonalizationCollector,
    UserMemoryCollector,
    PromptRendererImpl,
    WorkbuddySystemPromptService,
    generateTraceId,
    maskUid,
    createArchiveLogger,
    acquireMutex,
    acquireFileLock,
    makeHandle,
    getHomeDir,
    getWorkbuddyConfigBaseDir,
    getPrimaryMemoryDir,
    getLegacyMemoryDir,
    resolveMemoryDirs,
    sanitizeFilename,
    buildArchiveFileName,
    buildBackupFileName,
    withTimeout,
    getLogger,
    tmpOf,
    classifyError,
    fileExists,
    ensureDir,
    tryReadExistingVersion,
    toMarkdown,
    parseMarkdown,
    resolveDirs,
    doWriteWithLockAndGuard,
    writeProfile,
    doRead,
    readProfile,
    safeUnlink,
    doDelete,
    deleteProfile,
    isLegacyDirPathSafe,
    purgeLegacyMemoryDir,
    getDisableLocalSkillsMemoryFromAppConfig,
    resolveResponseLocaleIsZh,
    resolveResponseLanguage,
    isInsideGitWorkTree,
    isDirectoryEmpty,
    resolveWorkBuddyDir,
    truncateContent,
    resolveProjectFolderName,
    resolveUserDataDir,
    getWorkbuddyMemory1,
    listWorkbuddyPromptTemplateDirCandidates,
    resolveWorkbuddyPromptTemplatePath,
    requireWorkbuddyPromptTemplatePath,
    listWorkbuddyPromptTemplatePathCandidates,
    uniqueNonEmpty,
    resolveLegacySettingsPath,
    getProxyUrlFromEnv,
    shouldBypassProxy,
    getAgentBundle,
    resolveNodeProxyAgent,
    describeProxyForRequest,
    logSkip,
    maskUserId,
    composeKind,
    selectTemplateKind,
    createTemplateLoader,
    readAppConfigValue,
    TAG,
    keyMutexMap,
    DEFAULT_WORKBUDDY_DIR_NAME,
    MEMORY_DIR_NAME,
    LEGACY_MEMORY_DIR_NAME,
    PRIMARY_ARCHIVE_SUFFIX,
    PRIMARY_BACKUP_SUFFIX,
    LEGACY_ARCHIVE_SUFFIX,
    LEGACY_BACKUP_SUFFIX,
    DEFAULT_WRITE_TIMEOUT_MS,
    DEFAULT_READ_TIMEOUT_MS,
    DEFAULT_DELETE_TIMEOUT_MS,
    defaultSink,
    APP_CONFIG_KEY_DISABLE_LOCAL_SKILLS_MEMORY,
    MAX_BINARY_CONTEXT_CHARS,
    SUPPRESSED_PLUGIN_AGENT_PROMPT_SLOT,
    WORKBUDDY_WORKSPACE_STATE_VERSION,
    MAX_IDENTITY_FILE_CHARS,
    DEFAULT_SOUL_CONTENT,
    DEFAULT_IDENTITY_CONTENT,
    DEFAULT_USER_CONTENT,
    DEFAULT_BOOTSTRAP_CONTENT,
    MAX_MEMORY_CHARS,
    STYLE_NAMES,
    LOOPBACK_HOSTS,
    KEEP_ALIVE_OPTS,
    USER_MEMORY_TIMEOUT_MS,
    MAX_USER_MEMORY_CHARS,
    USER_MEMORY_RESOLUTION_CACHE_TTL_MS,
    USER_MEMORY_REMOTE_FALLBACK_CACHE_TTL_MS,
    resolutionCache,
    remoteFallbackCooldowns,
    TEMPLATE_NAMES$1,
    FALLBACK_KIND,
    context: require_runtime_context,
    getProxyAgents: () => agentCache,
  };
}
