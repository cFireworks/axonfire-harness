// @ts-nocheck
// Complete original database service, repositories, recovery helpers and loggers.
import * as fs from "node:fs";
import * as fs_promises from "node:fs/promises";
import * as path from "node:path";
import * as nodeOs from "node:os";
import { createRequire } from "node:module";
import { createNativeStorageOrm } from "../vendor/captured-storage-orm.js";
import { createNativeStorageMigrations } from "./native-storage-migrations.js";
import { createNativeSessionRepository } from "../sessions/native-session-repository.js";
export const DATABASE_SERVICE_SHA256 =
  "528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19";
export const DATABASE_SERVICE_DECLARATIONS = [
  ["BufferedFileLogger", 70492, 73903],
  ["DatabaseFileLogger", 74513, 74935],
  ["getDatabaseLogger", 74968, 75042],
  ["excludedColumn", 203602, 203684],
  ["canonicalizeStoredPath", 204307, 204391],
  ["AutomationRepository", 204497, 215822],
  ["parseJsonArray", 215823, 216069],
  ["parsePermissionMode", 216070, 216175],
  ["parseWecomBotSource", 216176, 216283],
  ["AutomationDeliveryOutboxRepository", 216394, 225278],
  ["MigrationMetaRepository", 225388, 225920],
  ["SessionUsageRepository", 239934, 241081],
  ["cleanupGhostDataAfterWalCheckpoint", 241582, 244362],
  ["readLegacyVscdbSessionPayloads", 244460, 244902],
  ["_globalDatabaseRef", 244990, 245013],
  ["registerGlobalDatabaseRef", 245044, 245112],
  ["getGlobalDatabaseRef", 245130, 245193],
  ["WorkbuddyDatabaseService", 245194, 304370],
] as const;
export function createNativeDatabaseService(deps: any): any {
  const os = deps.osModule ?? nodeOs;
  const require = createRequire(import.meta.url);
  const require_runtime_context = deps.runtimeContext;
  const orm = createNativeStorageOrm(deps.BetterSQLite);
  const migrations = createNativeStorageMigrations(orm, deps.BetterSQLite);
  const { SessionRepository } = createNativeSessionRepository(orm);
  const { sql, eq, and, or, inArray, desc, isNull, ne, asc, gt, lte } = orm;
  const {
    openWorkbuddyRawSqliteDatabase,
    configureWorkbuddySqliteConnection,
    createWorkbuddyDrizzleDatabase,
    runWorkbuddyDrizzleMigrations,
    asBetterSqliteDatabase,
    ensureSessionUsageTableSchema,
    getAutomationRunsRunsJsonColumnType,
  } = migrations;
  const {
    sessions,
    automations,
    automationRuns,
    automationRuntimeState,
    automationDeliveryOutbox,
    sessionUsage,
    migrationMeta,
  } = migrations.schema_exports;
  var BufferedFileLogger = class {
    logFilePath;
    logDir;
    filePrefix;
    retentionDays;
    bufferThreshold;
    buffer = [];
    isFlushing = false;
    flushTimer = null;
    constructor(options) {
      this.logDir = options.logDir;
      this.filePrefix = options.filePrefix;
      this.retentionDays = options.retentionDays ?? 30;
      this.bufferThreshold = options.bufferThreshold ?? 50;
      this.ensureDir(this.logDir);
      const dateStr = this.formatDate(/* @__PURE__ */ new Date());
      this.logFilePath = path.join(
        this.logDir,
        `${this.filePrefix}-${dateStr}.log`,
      );
      this.startFlushTimer(options.flushIntervalMs ?? 200);
      this.registerExitHook();
      this.cleanupOldLogs();
      this.writeSessionSeparator();
      this.info(`Logger initialized at ${this.logFilePath}`);
    }
    getLogFilePath() {
      return this.logFilePath;
    }
    debug(message) {
      this.write("debug", message);
    }
    info(message) {
      this.write("info", message);
    }
    warn(message) {
      this.write("warn", message);
    }
    error(message, error) {
      const msg = error
        ? `${message}\n  Stack: ${error.stack || error.message}`
        : message;
      this.write("error", msg);
    }
    /**
     * Stop the flush timer and synchronously write remaining buffered logs.
     * Call this when the application is shutting down gracefully.
     */
    dispose() {
      if (this.flushTimer) {
        clearInterval(this.flushTimer);
        this.flushTimer = null;
      }
      this.flushSync();
    }
    write(level, message) {
      const line = `[${/* @__PURE__ */ new Date().toISOString()}] [${level.toUpperCase().padEnd(5)}] ${message}\n`;
      this.buffer.push(line);
      if (this.buffer.length >= this.bufferThreshold)
        this.flush().catch(() => {});
    }
    async flush() {
      if (this.isFlushing || this.buffer.length === 0) return;
      this.isFlushing = true;
      const lines = this.buffer.splice(0);
      try {
        await fs.promises.appendFile(this.logFilePath, lines.join(""), "utf-8");
      } catch {
        this.buffer.unshift(...lines);
      } finally {
        this.isFlushing = false;
      }
    }
    flushSync() {
      if (this.buffer.length === 0) return;
      try {
        fs.appendFileSync(
          this.logFilePath,
          this.buffer.splice(0).join(""),
          "utf-8",
        );
      } catch {}
    }
    startFlushTimer(intervalMs) {
      this.flushTimer = setInterval(() => {
        this.flush().catch(() => {});
      }, intervalMs);
      this.flushTimer.unref();
    }
    registerExitHook() {
      process.on("exit", () => this.flushSync());
    }
    ensureDir(dir) {
      try {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      } catch {}
    }
    writeSessionSeparator() {
      const timestamp = /* @__PURE__ */ new Date().toISOString();
      const separator = `\n${"=".repeat(80)}\n  Session started at ${timestamp}\n${"=".repeat(80)}\n`;
      this.buffer.push(separator);
    }
    formatDate(date) {
      const pad = (n) => String(n).padStart(2, "0");
      return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
    }
    cleanupOldLogs() {
      this.cleanupOldLogsAsync().catch(() => {});
    }
    async cleanupOldLogsAsync() {
      try {
        const cutoffDate = /* @__PURE__ */ new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);
        const cutoffStr = this.formatDate(cutoffDate);
        const prefix = `${this.filePrefix}-`;
        const files = await fs.promises.readdir(this.logDir);
        for (const file of files.filter(
          (f) => f.startsWith(prefix) && f.endsWith(".log"),
        ))
          if (file.replace(prefix, "").replace(".log", "") < cutoffStr)
            await fs.promises
              .unlink(path.join(this.logDir, file))
              .catch(() => {});
      } catch {}
    }
  };
  var DatabaseFileLogger = class DatabaseFileLogger extends BufferedFileLogger {
    static instance = null;
    constructor() {
      super({
        logDir: require_runtime_context.getWorkbuddyRuntimeLogsDir("database"),
        filePrefix: "database",
        retentionDays: 30,
      });
    }
    static getInstance() {
      if (!DatabaseFileLogger.instance)
        DatabaseFileLogger.instance = new DatabaseFileLogger();
      return DatabaseFileLogger.instance;
    }
  };
  function getDatabaseLogger() {
    return DatabaseFileLogger.getInstance();
  }
  function excludedColumn(columnName) {
    return sql.raw(`excluded.${columnName}`);
  }
  function canonicalizeStoredPath(p) {
    if (!p) return p;
    return path.normalize(p);
  }
  var AutomationRepository = class {
    constructor(getDb) {
      this.getDb = getDb;
    }
    upsert(automation) {
      this.getDb()
        .insert(automations)
        .values({
          id: automation.id,
          name: automation.name,
          prompt: automation.prompt,
          status: automation.status,
          scheduleType: automation.scheduleType,
          nextRunAt: automation.nextRunAt ?? null,
          lastRunAt: automation.lastRunAt ?? null,
          cwds: JSON.stringify(
            (automation.cwds ?? []).map(canonicalizeStoredPath),
          ),
          rrule: automation.rrule,
          scheduledAt: automation.scheduledAt ?? null,
          validFrom: automation.validFrom ?? null,
          validUntil: automation.validUntil ?? null,
          modelId: automation.modelId ?? null,
          modelIsThinking: automation.modelIsThinking ? 1 : 0,
          skillsJson: JSON.stringify(automation.skills ?? []),
          pushToWeChat: automation.pushToWeChat ? 1 : 0,
          pushToWecomBot: automation.pushToWecomBot ? 1 : 0,
          wecomBotSource: automation.wecomBotSource ?? null,
          ownerUserId: automation.ownerUserId ?? null,
          ownerStatus: automation.ownerStatus ?? "legacy_unassigned",
          ownerSource: automation.ownerSource ?? null,
          expertId: automation.expertId ?? null,
          expertMarketplace: automation.expertMarketplace ?? null,
          connectorIdsJson: JSON.stringify(automation.connectorIds ?? []),
          permissionMode: automation.permissionMode ?? null,
          createdAt: automation.createdAt,
          updatedAt: automation.updatedAt,
          deletedAt: automation.deletedAt ?? null,
        })
        .onConflictDoUpdate({
          target: automations.id,
          set: {
            name: excludedColumn("name"),
            prompt: excludedColumn("prompt"),
            status: excludedColumn("status"),
            scheduleType: excludedColumn("schedule_type"),
            nextRunAt: excludedColumn("next_run_at"),
            lastRunAt: excludedColumn("last_run_at"),
            cwds: excludedColumn("cwds"),
            rrule: excludedColumn("rrule"),
            scheduledAt: excludedColumn("scheduled_at"),
            validFrom: excludedColumn("valid_from"),
            validUntil: excludedColumn("valid_until"),
            modelId: excludedColumn("model_id"),
            modelIsThinking: excludedColumn("model_is_thinking"),
            skillsJson: excludedColumn("skills_json"),
            pushToWeChat: excludedColumn("push_to_wechat"),
            pushToWecomBot: excludedColumn("push_to_wecom_bot"),
            wecomBotSource: excludedColumn("wecom_bot_source"),
            ownerUserId: excludedColumn("owner_user_id"),
            ownerStatus: excludedColumn("owner_status"),
            ownerSource: excludedColumn("owner_source"),
            expertId: excludedColumn("expert_id"),
            expertMarketplace: excludedColumn("expert_marketplace"),
            connectorIdsJson: excludedColumn("connector_ids_json"),
            permissionMode: excludedColumn("permission_mode"),
            createdAt: excludedColumn("created_at"),
            updatedAt: excludedColumn("updated_at"),
            deletedAt: sql`COALESCE(${excludedColumn("deleted_at")}, ${automations.deletedAt})`,
          },
        })
        .run();
    }
    updateNextRunAt(id, nextRunAt) {
      this.getDb()
        .update(automations)
        .set({
          nextRunAt: nextRunAt ?? null,
          updatedAt: Date.now(),
        })
        .where(eq(automations.id, id))
        .run();
    }
    get(id, options) {
      const row = this.getDb()
        .select()
        .from(automations)
        .where(
          options?.includeDeleted
            ? eq(automations.id, id)
            : and(eq(automations.id, id), isNull(automations.deletedAt)),
        )
        .limit(1)
        .get();
      return row ? this.mapAutomation(row) : void 0;
    }
    list(filter) {
      let query = this.getDb().select().from(automations).$dynamic();
      if (!filter?.includeDeleted)
        query = query.where(isNull(automations.deletedAt));
      return query
        .orderBy(desc(automations.createdAt))
        .all()
        .map((row) => this.mapAutomation(row));
    }
    softDelete(id, deletedAt = Date.now()) {
      this.getDb()
        .update(automations)
        .set({
          deletedAt,
          updatedAt: deletedAt,
        })
        .where(and(eq(automations.id, id), isNull(automations.deletedAt)))
        .run();
    }
    upsertRun(run) {
      this.getDb()
        .insert(automationRuns)
        .values({
          threadId: run.threadId,
          automationId: run.automationId,
          status: run.status,
          readAt: run.readAt ?? null,
          threadTitle: run.threadTitle ?? null,
          sourceCwd: run.sourceCwd
            ? canonicalizeStoredPath(run.sourceCwd)
            : null,
          runsJson: run.runsJson ?? null,
          resultSuccess:
            run.resultSuccess === void 0 ? null : run.resultSuccess ? 1 : 0,
          metadataJson: run.metadataJson ?? null,
          createdAt: run.createdAt,
          updatedAt: run.updatedAt,
        })
        .onConflictDoUpdate({
          target: automationRuns.threadId,
          set: {
            automationId: excludedColumn("automation_id"),
            status: excludedColumn("status"),
            readAt: excludedColumn("read_at"),
            threadTitle: excludedColumn("thread_title"),
            sourceCwd: excludedColumn("source_cwd"),
            runsJson: excludedColumn("runs_json"),
            resultSuccess: excludedColumn("result_success"),
            metadataJson: excludedColumn("metadata_json"),
            createdAt: excludedColumn("created_at"),
            updatedAt: excludedColumn("updated_at"),
          },
        })
        .run();
    }
    getRun(threadId) {
      const row = this.getDb()
        .select()
        .from(automationRuns)
        .where(eq(automationRuns.threadId, threadId))
        .limit(1)
        .get();
      return row ? this.mapRun(row) : void 0;
    }
    getRunSizes() {
      return this.getDb()
        .select({
          threadId: automationRuns.threadId,
          automationId: automationRuns.automationId,
          status: automationRuns.status,
          runsJsonChars: sql`COALESCE(LENGTH(${automationRuns.runsJson}), 0)`,
          updatedAt: automationRuns.updatedAt,
        })
        .from(automationRuns)
        .all()
        .map((row) => ({
          threadId: row.threadId,
          automationId: row.automationId,
          status: row.status,
          runsJsonChars: Number(row.runsJsonChars ?? 0),
          updatedAt: row.updatedAt,
        }));
    }
    getRuns(automationId) {
      let query = this.getDb().select().from(automationRuns).$dynamic();
      if (automationId)
        query = query.where(eq(automationRuns.automationId, automationId));
      return query
        .orderBy(desc(automationRuns.updatedAt))
        .all()
        .map((row) => this.mapRun(row));
    }
    getRunOwnerEvidenceRows(automationId, runsJsonCharLimit) {
      const runsJsonChars = sql`COALESCE(LENGTH(${automationRuns.runsJson}), 0)`;
      return this.getDb()
        .select({
          runsJson: sql`CASE WHEN ${runsJsonChars} <= ${runsJsonCharLimit} THEN ${automationRuns.runsJson} ELSE NULL END`,
          runsJsonChars,
        })
        .from(automationRuns)
        .where(
          and(
            eq(automationRuns.automationId, automationId),
            ne(automationRuns.status, "IN_PROGRESS"),
          ),
        )
        .orderBy(asc(automationRuns.createdAt), asc(automationRuns.updatedAt))
        .all()
        .map((row) => {
          const chars = Number(row.runsJsonChars ?? 0);
          return {
            runsJson: row.runsJson ? String(row.runsJson) : void 0,
            oversized: chars > runsJsonCharLimit,
          };
        });
    }
    upsertRuntimeState(state) {
      this.getDb()
        .insert(automationRuntimeState)
        .values({
          automationId: state.automationId,
          lastRunAt: state.lastRunAt ?? null,
          lastError: state.lastError ?? null,
          running: state.running ? 1 : 0,
          runningStartedAt: state.runningStartedAt ?? null,
          runningConversationId: state.runningConversationId ?? null,
          metadataJson: state.metadataJson ?? null,
        })
        .onConflictDoUpdate({
          target: automationRuntimeState.automationId,
          set: {
            lastRunAt: excludedColumn("last_run_at"),
            lastError: excludedColumn("last_error"),
            running: excludedColumn("running"),
            runningStartedAt: excludedColumn("running_started_at"),
            runningConversationId: excludedColumn("running_conversation_id"),
            metadataJson: excludedColumn("metadata_json"),
          },
        })
        .run();
    }
    replaceRuntimeStates(states) {
      this.getDb().transaction((tx) => {
        tx.delete(automationRuntimeState).run();
        for (const state of states)
          tx.insert(automationRuntimeState)
            .values({
              automationId: state.automationId,
              lastRunAt: state.lastRunAt ?? null,
              lastError: state.lastError ?? null,
              running: state.running ? 1 : 0,
              runningStartedAt: state.runningStartedAt ?? null,
              runningConversationId: state.runningConversationId ?? null,
              metadataJson: state.metadataJson ?? null,
            })
            .onConflictDoUpdate({
              target: automationRuntimeState.automationId,
              set: {
                lastRunAt: excludedColumn("last_run_at"),
                lastError: excludedColumn("last_error"),
                running: excludedColumn("running"),
                runningStartedAt: excludedColumn("running_started_at"),
                runningConversationId: excludedColumn(
                  "running_conversation_id",
                ),
                metadataJson: excludedColumn("metadata_json"),
              },
            })
            .run();
      });
    }
    getRuntimeStates() {
      return this.getDb()
        .select()
        .from(automationRuntimeState)
        .all()
        .map((row) => this.mapRuntimeState(row));
    }
    deleteRun(threadId) {
      this.getDb()
        .delete(automationRuns)
        .where(eq(automationRuns.threadId, threadId))
        .run();
    }
    compactReplaceRunsJson(params) {
      const info = this.getDb()
        .update(automationRuns)
        .set({ runsJson: params.nextRunsJson })
        .where(
          and(
            eq(automationRuns.threadId, params.threadId),
            eq(automationRuns.automationId, params.expectedAutomationId),
            ne(automationRuns.status, "IN_PROGRESS"),
            eq(automationRuns.updatedAt, params.expectedUpdatedAt),
            sql`COALESCE(LENGTH(${automationRuns.runsJson}), 0) = ${params.expectedRunsJsonChars}`,
          ),
        )
        .run();
      return Number(info.changes ?? 0) === 1;
    }
    mapAutomation(row) {
      return {
        id: row.id,
        name: row.name,
        prompt: row.prompt,
        status: row.status,
        scheduleType: row.scheduleType,
        nextRunAt:
          row.nextRunAt === null || row.nextRunAt === void 0
            ? void 0
            : Number(row.nextRunAt),
        lastRunAt:
          row.lastRunAt === null || row.lastRunAt === void 0
            ? void 0
            : Number(row.lastRunAt),
        cwds: parseJsonArray(row.cwds),
        rrule: row.rrule ?? "",
        scheduledAt: row.scheduledAt || void 0,
        validFrom: row.validFrom || void 0,
        validUntil: row.validUntil || void 0,
        modelId: row.modelId || void 0,
        modelIsThinking: Boolean(row.modelIsThinking),
        skills: parseJsonArray(row.skillsJson),
        pushToWeChat: Boolean(row.pushToWeChat),
        pushToWecomBot: Boolean(row.pushToWecomBot),
        wecomBotSource: parseWecomBotSource(row.wecomBotSource),
        ownerUserId: row.ownerUserId || void 0,
        ownerStatus: row.ownerStatus || "legacy_unassigned",
        ownerSource: row.ownerSource || void 0,
        expertId: row.expertId || void 0,
        expertMarketplace: row.expertMarketplace || void 0,
        connectorIds: parseJsonArray(row.connectorIdsJson),
        permissionMode: parsePermissionMode(row.permissionMode),
        createdAt: Number(row.createdAt),
        updatedAt: Number(row.updatedAt),
        deletedAt:
          row.deletedAt === null || row.deletedAt === void 0
            ? void 0
            : Number(row.deletedAt),
      };
    }
    mapRun(row) {
      return {
        threadId: row.threadId,
        automationId: row.automationId,
        status: row.status,
        readAt:
          row.readAt === null || row.readAt === void 0
            ? void 0
            : Number(row.readAt),
        threadTitle: row.threadTitle || void 0,
        sourceCwd: row.sourceCwd || void 0,
        runsJson: row.runsJson || void 0,
        resultSuccess:
          row.resultSuccess === null || row.resultSuccess === void 0
            ? void 0
            : Boolean(row.resultSuccess),
        metadataJson: row.metadataJson || void 0,
        createdAt: Number(row.createdAt),
        updatedAt: Number(row.updatedAt),
      };
    }
    mapRuntimeState(row) {
      return {
        automationId: row.automationId,
        lastRunAt:
          row.lastRunAt === null || row.lastRunAt === void 0
            ? void 0
            : Number(row.lastRunAt),
        lastError: row.lastError || void 0,
        running: Boolean(row.running),
        runningStartedAt:
          row.runningStartedAt === null || row.runningStartedAt === void 0
            ? void 0
            : Number(row.runningStartedAt),
        runningConversationId: row.runningConversationId || void 0,
        metadataJson: row.metadataJson || void 0,
      };
    }
  };
  function parseJsonArray(value) {
    if (typeof value !== "string" || !value) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.filter((item) => typeof item === "string")
        : [];
    } catch {
      return [];
    }
  }
  function parsePermissionMode(value) {
    if (value === "fullAccess" || value === "default") return value;
  }
  function parseWecomBotSource(value) {
    if (value === "standalone" || value === "assistant") return value;
  }
  var AutomationDeliveryOutboxRepository = class {
    constructor(getDb) {
      this.getDb = getDb;
    }
    enqueue(row) {
      this.getDb()
        .insert(automationDeliveryOutbox)
        .values(this.toDrizzleInsert(row))
        .onConflictDoNothing({ target: automationDeliveryOutbox.dedupeKey })
        .run();
      const existing = this.getByDedupeKey(row.dedupeKey);
      if (!existing)
        throw new Error(
          `Failed to enqueue automation delivery outbox: ${row.dedupeKey}`,
        );
      return existing;
    }
    getByDedupeKey(dedupeKey) {
      const row = this.getDb()
        .select()
        .from(automationDeliveryOutbox)
        .where(eq(automationDeliveryOutbox.dedupeKey, dedupeKey))
        .limit(1)
        .get();
      return row ? this.mapRow(row) : void 0;
    }
    hasNewer(candidate) {
      const row = this.getDb()
        .select({ matched: sql`1` })
        .from(automationDeliveryOutbox)
        .where(
          and(
            ne(automationDeliveryOutbox.id, candidate.id),
            eq(automationDeliveryOutbox.automationId, candidate.automationId),
            eq(automationDeliveryOutbox.channel, candidate.channel),
            candidate.ownerUserId === void 0
              ? isNull(automationDeliveryOutbox.ownerUserId)
              : eq(automationDeliveryOutbox.ownerUserId, candidate.ownerUserId),
            candidate.hostId === void 0
              ? isNull(automationDeliveryOutbox.hostId)
              : eq(automationDeliveryOutbox.hostId, candidate.hostId),
            gt(automationDeliveryOutbox.createdAt, candidate.createdAt),
          ),
        )
        .limit(1)
        .get();
      return Boolean(row?.matched);
    }
    claim(now, workerId, leaseExpireAt, limit) {
      const db = this.getDb();
      const rows = db
        .select()
        .from(automationDeliveryOutbox)
        .where(
          and(
            inArray(automationDeliveryOutbox.status, [
              "pending",
              "retry_waiting",
              "pending_auth",
            ]),
            lte(automationDeliveryOutbox.nextRunAt, now),
          ),
        )
        .orderBy(
          asc(automationDeliveryOutbox.nextRunAt),
          asc(automationDeliveryOutbox.createdAt),
        )
        .limit(Math.max(1, limit))
        .all();
      const claimed = [];
      for (const row of rows) {
        const id = row.id;
        const result = db
          .update(automationDeliveryOutbox)
          .set({
            status: "in_flight",
            leaseOwner: workerId,
            leaseExpireAt,
            updatedAt: now,
          })
          .where(
            and(
              eq(automationDeliveryOutbox.id, id),
              inArray(automationDeliveryOutbox.status, [
                "pending",
                "retry_waiting",
                "pending_auth",
              ]),
              lte(automationDeliveryOutbox.nextRunAt, now),
            ),
          )
          .run();
        if (Number(result.changes ?? 0) !== 1) continue;
        const claimedRow = this.getById(id);
        if (claimedRow) claimed.push(claimedRow);
      }
      return claimed;
    }
    markSucceeded(id, workerId, deliveryId, now) {
      const result = this.getDb()
        .update(automationDeliveryOutbox)
        .set({
          status: "succeeded",
          attemptCount: sql`${automationDeliveryOutbox.attemptCount} + 1`,
          deliveryId: deliveryId ?? null,
          leaseOwner: null,
          leaseExpireAt: null,
          lastErrorCode: null,
          lastErrorMessage: null,
          updatedAt: now,
          finishedAt: now,
        })
        .where(
          and(
            eq(automationDeliveryOutbox.id, id),
            eq(automationDeliveryOutbox.status, "in_flight"),
            eq(automationDeliveryOutbox.leaseOwner, workerId),
          ),
        )
        .run();
      return Number(result.changes ?? 0) === 1;
    }
    markFailed(id, workerId, update) {
      const attemptDelta = update.incrementAttempt === false ? 0 : 1;
      const result = this.getDb()
        .update(automationDeliveryOutbox)
        .set({
          status: update.status,
          attemptCount: sql`${automationDeliveryOutbox.attemptCount} + ${attemptDelta}`,
          nextRunAt: update.nextRunAt ?? update.now,
          leaseOwner: null,
          leaseExpireAt: null,
          lastErrorCode: update.errorCode ?? null,
          lastErrorMessage: update.errorMessage ?? null,
          updatedAt: update.now,
          finishedAt: update.finishedAt ?? null,
        })
        .where(
          and(
            eq(automationDeliveryOutbox.id, id),
            eq(automationDeliveryOutbox.status, "in_flight"),
            eq(automationDeliveryOutbox.leaseOwner, workerId),
          ),
        )
        .run();
      return Number(result.changes ?? 0) === 1;
    }
    getNextRunAt() {
      const row = this.getDb()
        .select({ nextRunAt: sql`MIN(${automationDeliveryOutbox.nextRunAt})` })
        .from(automationDeliveryOutbox)
        .where(
          inArray(automationDeliveryOutbox.status, [
            "pending",
            "retry_waiting",
            "pending_auth",
          ]),
        )
        .get();
      if (row?.nextRunAt === null || row?.nextRunAt === void 0) return;
      return Number(row.nextRunAt);
    }
    reclaimStuck(now, limit) {
      const result = this.getDb()
        .update(automationDeliveryOutbox)
        .set({
          status: "manual_required",
          leaseOwner: null,
          leaseExpireAt: null,
          lastErrorCode: "lease_expired_ambiguous",
          lastErrorMessage:
            "push worker lease expired; delivery may already have reached backend",
          updatedAt: now,
          finishedAt: now,
        })
        .where(
          sql`${automationDeliveryOutbox.id} IN (
                SELECT id FROM ${automationDeliveryOutbox}
                WHERE ${automationDeliveryOutbox.status} = 'in_flight'
                  AND ${automationDeliveryOutbox.leaseExpireAt} IS NOT NULL
                  AND ${automationDeliveryOutbox.leaseExpireAt} <= ${now}
                ORDER BY ${automationDeliveryOutbox.leaseExpireAt} ASC
                LIMIT ${Math.max(1, limit)}
            )`,
        )
        .run();
      return Number(result.changes ?? 0);
    }
    cleanupTerminal(params) {
      const limit = Math.max(1, params.limit);
      const db = this.getDb();
      const agedResult = db
        .delete(automationDeliveryOutbox)
        .where(
          sql`${automationDeliveryOutbox.id} IN (
                SELECT ${automationDeliveryOutbox.id} FROM ${automationDeliveryOutbox}
                WHERE ${automationDeliveryOutbox.finishedAt} IS NOT NULL
                    AND (
                        (${automationDeliveryOutbox.status} IN ('succeeded', 'skipped') AND ${automationDeliveryOutbox.finishedAt} < ${params.succeededFinishedBefore})
                        OR (${automationDeliveryOutbox.status} IN ('manual_required', 'abandoned') AND ${automationDeliveryOutbox.finishedAt} < ${params.failedFinishedBefore})
                    )
                ORDER BY ${automationDeliveryOutbox.finishedAt} ASC
                LIMIT ${limit}
            )`,
        )
        .run();
      const remainingLimit = Math.max(
        0,
        limit - Number(agedResult.changes ?? 0),
      );
      if (remainingLimit === 0) return Number(agedResult.changes ?? 0);
      const overflowResult = db
        .delete(automationDeliveryOutbox)
        .where(
          sql`${automationDeliveryOutbox.id} IN (
                SELECT ${automationDeliveryOutbox.id} FROM ${automationDeliveryOutbox}
                WHERE ${automationDeliveryOutbox.status} IN ('manual_required', 'abandoned')
                    AND ${automationDeliveryOutbox.finishedAt} IS NOT NULL
                    AND ${automationDeliveryOutbox.id} NOT IN (
                        SELECT ${automationDeliveryOutbox.id} FROM ${automationDeliveryOutbox}
                        WHERE ${automationDeliveryOutbox.status} IN ('manual_required', 'abandoned')
                            AND ${automationDeliveryOutbox.finishedAt} IS NOT NULL
                        ORDER BY ${automationDeliveryOutbox.finishedAt} DESC
                        LIMIT ${Math.max(0, params.failedRetainLimit)}
                    )
                ORDER BY ${automationDeliveryOutbox.finishedAt} ASC
                LIMIT ${remainingLimit}
            )`,
        )
        .run();
      return (
        Number(agedResult.changes ?? 0) + Number(overflowResult.changes ?? 0)
      );
    }
    getById(id) {
      const row = this.getDb()
        .select()
        .from(automationDeliveryOutbox)
        .where(eq(automationDeliveryOutbox.id, id))
        .limit(1)
        .get();
      return row ? this.mapRow(row) : void 0;
    }
    toDrizzleInsert(row) {
      return {
        id: row.id,
        dedupeKey: row.dedupeKey,
        channel: row.channel,
        automationId: row.automationId,
        runId: row.runId,
        automationName: row.automationName,
        ownerUserId: row.ownerUserId ?? null,
        hostId: row.hostId ?? null,
        payloadJson: row.payloadJson,
        status: row.status,
        attemptCount: row.attemptCount,
        maxAttempts: row.maxAttempts,
        nextRunAt: row.nextRunAt,
        leaseOwner: row.leaseOwner ?? null,
        leaseExpireAt: row.leaseExpireAt ?? null,
        lastErrorCode: row.lastErrorCode ?? null,
        lastErrorMessage: row.lastErrorMessage ?? null,
        deliveryId: row.deliveryId ?? null,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        finishedAt: row.finishedAt ?? null,
      };
    }
    mapRow(row) {
      return {
        id: row.id,
        dedupeKey: row.dedupeKey,
        channel: row.channel || "wechatmp",
        automationId: row.automationId,
        runId: row.runId,
        automationName: row.automationName,
        ownerUserId: row.ownerUserId || void 0,
        hostId: row.hostId || void 0,
        payloadJson: row.payloadJson,
        status: row.status,
        attemptCount: Number(row.attemptCount ?? 0),
        maxAttempts: Number(row.maxAttempts ?? 5),
        nextRunAt: Number(row.nextRunAt),
        leaseOwner: row.leaseOwner || void 0,
        leaseExpireAt:
          row.leaseExpireAt === null || row.leaseExpireAt === void 0
            ? void 0
            : Number(row.leaseExpireAt),
        lastErrorCode: row.lastErrorCode || void 0,
        lastErrorMessage: row.lastErrorMessage || void 0,
        deliveryId: row.deliveryId || void 0,
        createdAt: Number(row.createdAt),
        updatedAt: Number(row.updatedAt),
        finishedAt:
          row.finishedAt === null || row.finishedAt === void 0
            ? void 0
            : Number(row.finishedAt),
      };
    }
  };
  var MigrationMetaRepository = class {
    constructor(getDb) {
      this.getDb = getDb;
    }
    get(key) {
      return this.getDb()
        .select({ value: migrationMeta.value })
        .from(migrationMeta)
        .where(eq(migrationMeta.key, key))
        .limit(1)
        .get()?.value;
    }
    set(key, value) {
      this.getDb()
        .insert(migrationMeta)
        .values({
          key,
          value,
        })
        .onConflictDoUpdate({
          target: migrationMeta.key,
          set: { value: excludedColumn("value") },
        })
        .run();
    }
    delete(key) {
      this.getDb()
        .delete(migrationMeta)
        .where(eq(migrationMeta.key, key))
        .run();
    }
  };
  var SessionUsageRepository = class {
    constructor(getDb) {
      this.getDb = getDb;
    }
    get(sessionId) {
      const row = this.getDb()
        .select()
        .from(sessionUsage)
        .where(eq(sessionUsage.sessionId, sessionId))
        .limit(1)
        .get();
      if (!row) return;
      return this.mapRow(row);
    }
    upsert(entry) {
      this.getDb()
        .insert(sessionUsage)
        .values({
          sessionId: entry.sessionId,
          used: entry.used,
          size: entry.size,
          updatedAt: entry.updatedAt,
          creditJson: entry.creditJson ?? null,
        })
        .onConflictDoUpdate({
          target: sessionUsage.sessionId,
          set: {
            used: excludedColumn("used"),
            size: excludedColumn("size"),
            updatedAt: excludedColumn("updated_at"),
            creditJson: excludedColumn("credit_json"),
          },
        })
        .run();
    }
    delete(sessionId) {
      this.getDb()
        .delete(sessionUsage)
        .where(eq(sessionUsage.sessionId, sessionId))
        .run();
    }
    all() {
      return this.getDb()
        .select()
        .from(sessionUsage)
        .all()
        .map((row) => this.mapRow(row));
    }
    mapRow(row) {
      return {
        sessionId: row.sessionId,
        used: Number(row.used ?? 0),
        size: Number(row.size ?? 0),
        updatedAt: Number(row.updatedAt ?? 0),
        creditJson: row.creditJson || void 0,
      };
    }
  };
  function cleanupGhostDataAfterWalCheckpoint(dbPath) {
    const rawDb = openWorkbuddyRawSqliteDatabase(dbPath);
    try {
      configureWorkbuddySqliteConnection(rawDb);
      const db = createWorkbuddyDrizzleDatabase(rawDb);
      const now = Date.now();
      const emptyResult = db
        .update(sessions)
        .set({
          deletedAt: now,
          updatedAt: now,
        })
        .where(
          sql`${sessions.deletedAt} IS NULL AND (${sessions.cwd} IS NULL OR TRIM(${sessions.cwd}) = '')`,
        )
        .run();
      const emptyCwdSessions = Number(emptyResult.changes ?? 0);
      const sessionIdsToClean = db
        .select({
          id: sessions.id,
          cwd: sessions.cwd,
        })
        .from(sessions)
        .where(
          sql`${sessions.deletedAt} IS NULL AND ${sessions.cwd} IS NOT NULL AND TRIM(${sessions.cwd}) != ''`,
        )
        .all()
        .filter((session) => !fs.existsSync(session.cwd))
        .map((session) => session.id);
      let missingCwdSessions = 0;
      if (sessionIdsToClean.length > 0) {
        const result = db
          .update(sessions)
          .set({
            deletedAt: now,
            updatedAt: now,
          })
          .where(inArray(sessions.id, sessionIdsToClean))
          .run();
        missingCwdSessions = Number(result.changes ?? 0);
      }
      const automationsWithCwds = db
        .select({
          id: automations.id,
          cwds: automations.cwds,
        })
        .from(automations)
        .where(
          sql`${automations.deletedAt} IS NULL AND ${automations.cwds} IS NOT NULL AND TRIM(${automations.cwds}) != '' AND TRIM(${automations.cwds}) != '[]'`,
        )
        .all();
      const automationIdsToClean = [];
      for (const automation of automationsWithCwds)
        try {
          const cwdList = JSON.parse(automation.cwds);
          if (!Array.isArray(cwdList) || cwdList.length === 0) {
            automationIdsToClean.push(automation.id);
            continue;
          }
          if (
            cwdList.every(
              (cwd) => typeof cwd === "string" && !fs.existsSync(cwd),
            )
          )
            automationIdsToClean.push(automation.id);
        } catch {
          automationIdsToClean.push(automation.id);
        }
      let missingCwdAutomations = 0;
      if (automationIdsToClean.length > 0) {
        const result = db
          .update(automations)
          .set({
            deletedAt: now,
            updatedAt: now,
          })
          .where(inArray(automations.id, automationIdsToClean))
          .run();
        missingCwdAutomations = Number(result.changes ?? 0);
      }
      const runIdsToClean = db
        .select({
          threadId: automationRuns.threadId,
          sourceCwd: automationRuns.sourceCwd,
        })
        .from(automationRuns)
        .where(
          sql`${automationRuns.sourceCwd} IS NOT NULL AND TRIM(${automationRuns.sourceCwd}) != ''`,
        )
        .all()
        .filter(
          (run) => run.sourceCwd !== null && !fs.existsSync(run.sourceCwd),
        )
        .map((run) => run.threadId);
      let missingSourceCwdRuns = 0;
      if (runIdsToClean.length > 0) {
        const result = db
          .delete(automationRuns)
          .where(inArray(automationRuns.threadId, runIdsToClean))
          .run();
        missingSourceCwdRuns = Number(result.changes ?? 0);
      }
      return {
        emptyCwdSessions,
        missingCwdSessions,
        missingCwdAutomations,
        missingSourceCwdRuns,
      };
    } finally {
      rawDb.close();
    }
  }
  function readLegacyVscdbSessionPayloads(vscdbPath) {
    let vscdb;
    try {
      vscdb = openWorkbuddyRawSqliteDatabase(vscdbPath, { readonly: true });
      const rows = vscdb
        .prepare("SELECT value FROM ItemTable WHERE key LIKE 'session:%'")
        .all();
      const payloads = [];
      for (const row of rows) {
        if (!row.value) continue;
        try {
          payloads.push(JSON.parse(row.value));
        } catch {}
      }
      return payloads;
    } finally {
      vscdb?.close();
    }
  }
  var _globalDatabaseRef;
  function registerGlobalDatabaseRef(db) {
    _globalDatabaseRef = db;
  }
  function getGlobalDatabaseRef() {
    return _globalDatabaseRef;
  }
  var WorkbuddyDatabaseService = class WorkbuddyDatabaseService {
    /**
     * Raw better-sqlite3 handle. This is only for lifecycle and SQLite
     * maintenance operations such as close, pragma, checkpoint, quick_check,
     * and schema adoption. Business table reads/writes must use drizzleDb.
     */
    rawSqliteDb;
    drizzleDb;
    dbPath;
    disposed = false;
    /**
     * 进程内「恢复通知是否已被消费」标记，防止多窗口重复弹窗。
     * `.recovered` 标记文件由损坏恢复流程写入，consumeRecoveryNotice() 第一次
     * 调用时读取并删除文件、置位此标记，后续调用一律返回 undefined。
     */
    recoveryNoticeConsumed = false;
    pendingAutomationFileBackups = /* @__PURE__ */ new Map();
    pendingAutomationFileBackupRemovals = /* @__PURE__ */ new Set();
    automationFileBackupFlushTimer;
    automationFileBackupFlushRunning = false;
    sessionRepository = new SessionRepository(() => this.getDrizzleDb());
    automationRepository = new AutomationRepository(() => this.getDrizzleDb());
    deliveryOutboxRepository = new AutomationDeliveryOutboxRepository(() =>
      this.getDrizzleDb(),
    );
    sessionUsageRepository = new SessionUsageRepository(() =>
      this.getDrizzleDb(),
    );
    migrationMetaRepository = new MigrationMetaRepository(() =>
      this.getDrizzleDb(),
    );
    constructor(options = {}) {
      this.dbPath =
        options.dbPath ??
        path.join(
          options.configDir ??
            require_runtime_context.getWorkbuddyRuntimeConfigDir(),
          "workbuddy.db",
        );
    }
    initialize(onRepairProgress) {
      if (this.rawSqliteDb) return;
      if (this.disposed)
        throw new Error(
          "[WorkbuddyDatabaseService] Cannot initialize after dispose",
        );
      fs.mkdirSync(path.dirname(this.dbPath), { recursive: true });
      this.performStartupWalCheckpointIfNeeded(onRepairProgress);
      const preExistingCorruptWal = this.detectPreExistingCorruptWal();
      const MAX_RETRIES = 3;
      const RETRY_DELAY_MS = 1e3;
      let lastError;
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++)
        try {
          this.openDatabase();
          this.initializeAllSchemas();
          if (attempt > 1)
            getDatabaseLogger().info(
              `Database initialized on attempt ${attempt}`,
            );
          if (preExistingCorruptWal)
            this.handleSilentWalDataLoss(preExistingCorruptWal);
          this.pruneCorruptBackups();
          return;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          try {
            this.rawSqliteDb?.close();
          } catch {}
          this.rawSqliteDb = void 0;
          this.drizzleDb = void 0;
          getDatabaseLogger().warn(
            `initialize attempt ${attempt}/${MAX_RETRIES} failed: ${lastError.message}`,
          );
          if (attempt < MAX_RETRIES) {
            const sleepUntil = Date.now() + RETRY_DELAY_MS;
            while (Date.now() < sleepUntil);
          }
        }
      if (
        this.isDatabaseCorruptionError(lastError) ||
        this.isDatabaseAccessError(lastError)
      ) {
        const diagnosis = this.diagnoseDamageType();
        if (diagnosis.status === "WAL_DAMAGED") {
          getDatabaseLogger().info(diagnosis.message);
          if (this.attemptWalOnlyRepair()) return;
        } else if (diagnosis.status === "HEALTHY") {
          getDatabaseLogger().warn(
            `${diagnosis.message} — not recovering (likely transient I/O issue)`,
          );
          try {
            this.openDatabase();
            this.initializeAllSchemas();
            this.pruneCorruptBackups();
            return;
          } catch {
            try {
              this.rawSqliteDb?.close();
            } catch {}
            this.rawSqliteDb = void 0;
            this.drizzleDb = void 0;
          }
        } else getDatabaseLogger().error(diagnosis.message);
        getDatabaseLogger().error(
          "Database corruption detected, attempting full auto-recovery...",
        );
        onRepairProgress?.({
          phase: "backup",
          message: "Backing up corrupted files",
        });
        const timestamp = /* @__PURE__ */ new Date()
          .toISOString()
          .replace(/[:.]/g, "-");
        try {
          this.backupCorruptedFiles(timestamp);
          onRepairProgress?.({
            phase: "rebuild",
            message: "Rebuilding database",
          });
          this.openDatabase();
          this.initializeAllSchemas();
          getDatabaseLogger().info(
            "Auto-recovery successful: database rebuilt from scratch",
          );
          this.disposed = false;
          onRepairProgress?.({
            phase: "recover",
            message: "Recovering data",
          });
          const recoveryResult = this.performDataRecovery(timestamp);
          try {
            fs.writeFileSync(
              this.dbPath + ".recovered",
              JSON.stringify({
                recoveredAt: /* @__PURE__ */ new Date().toISOString(),
                reason: lastError?.message,
                dataRecovery: {
                  type: "full-corruption",
                  source: "sidecar-history",
                  sessionsRecovered: recoveryResult.sessions,
                  automationsRecovered: recoveryResult.automations,
                  automationsLost: recoveryResult.automations === 0,
                },
              }),
            );
          } catch {}
          onRepairProgress?.({ phase: "done" });
          this.pruneCorruptBackups();
          return;
        } catch (recoveryError) {
          getDatabaseLogger().error(
            "Auto-recovery failed",
            recoveryError instanceof Error
              ? recoveryError
              : new Error(String(recoveryError)),
          );
          this.rawSqliteDb = void 0;
          this.drizzleDb = void 0;
        }
      }
      let packagePath = "unresolved";
      try {
        packagePath = require.resolve("better-sqlite3/package.json");
      } catch {}
      const runtimeVersion = `node=${process.versions.node} platform=${process.platform} arch=${process.arch}`;
      throw new Error(
        `${lastError?.message}\n[WorkbuddyDatabaseService] runtime=${runtimeVersion} better-sqlite3=${packagePath}\n[WorkbuddyDatabaseService] Install or rebuild better-sqlite3 for the current runtime.`,
      );
    }
    dispose() {
      this.flushAutomationFileBackupsSync();
      if (this.walCheckpointTimer) {
        clearInterval(this.walCheckpointTimer);
        this.walCheckpointTimer = void 0;
      }
      if (!this.rawSqliteDb) {
        this.drizzleDb = void 0;
        this.disposed = true;
        return;
      }
      try {
        this.walCheckpoint("TRUNCATE");
        this.rawSqliteDb?.close();
      } finally {
        this.rawSqliteDb = void 0;
        this.drizzleDb = void 0;
        this.disposed = true;
        registerGlobalDatabaseRef(void 0);
      }
    }
    getDatabasePath() {
      return this.dbPath;
    }
    /**
     * 消费一次数据库自动恢复通知。
     *
     * 损坏恢复流程（attemptWalOnlyRepair / 主库重建 / silent WAL loss）会向
     * `<dbPath>.recovered` 写入恢复详情。本方法读取并删除该文件，返回 notice。
     *
     * 语义：读后清除（at-most-once）。进程内通过 recoveryNoticeConsumed 守护，
     * 多窗口 / 多次 RPC 只会拿到一次通知；文件读取失败或不存在均返回 undefined，
     * 绝不抛错（不阻塞 renderer 启动）。
     */
    consumeRecoveryNotice() {
      if (this.recoveryNoticeConsumed) return;
      this.recoveryNoticeConsumed = true;
      const markerPath = this.dbPath + ".recovered";
      try {
        if (!fs.existsSync(markerPath)) return;
        const raw = fs.readFileSync(markerPath, "utf-8");
        try {
          fs.unlinkSync(markerPath);
        } catch {}
        return JSON.parse(raw);
      } catch {
        return;
      }
    }
    /**
     * Upsert a session row.
     *
     * ### Archived 降级硬化（M21）
     *
     * `ON CONFLICT DO UPDATE` 对 `status` 的合并策略从"直接覆盖"改为
     * "archived 不降级"：一旦 DB 中 `LOWER(status) = 'archived'`，后续
     * `upsertSession` 不会再把它改回 `Completed / Running / ...`。
     *
     * 这条防御层独立于迁移路径存在，兜底 history 增量迁移 / backend sync
     * 等可能把 archived 覆盖掉的场景。
     *
     * 合法 unarchive / status-only 降级路径由 session record store
     * `session-record-store.ts` 适配层检测并分派到
     * {@link WorkbuddyDatabaseService.updateSessionStatus}，绕过该合并策略。
     */
    upsertSession(session) {
      this.sessionRepository.upsert(session);
    }
    /**
     * 仅更新 session.status（专用低层写路径）。
     *
     * 用于绕过 {@link upsertSession} 的"archived 不降级"合并策略，服务于：
     * - M21 归档回放 (`replayArchivedSessionIdsPatch`)：把已存在但非 archived
     *   的 session 强制置为 archived。
     * - 合法 unarchive 路径：上层 `session-manager.unarchiveSession` 经
     *   适配层拦截后，需要把 archived → completed。
     *
     * **限制**：不要在 session-manager / migration 之外调用，否则会绕过
     * 业务层的状态流转校验。不存在的 id 不会抛错（幂等），返回影响行数。
     */
    updateSessionStatus(id, status, updatedAt) {
      return this.sessionRepository.updateStatus(id, status, updatedAt);
    }
    /**
     * Update only the permission_mode field for an existing session.
     * Returns the number of rows affected (0 if session does not exist).
     */
    updateSessionPermissionMode(id, permissionMode) {
      return this.sessionRepository.updatePermissionMode(id, permissionMode);
    }
    getSession(id) {
      return this.sessionRepository.get(id);
    }
    getSessions(filter) {
      this.ensureInitialized();
      return this.sessionRepository.list(filter);
    }
    /**
     * Return the most recent non-deleted session for a user whose cwd matches the given suffix.
     * Legacy empty-userId sessions are included for old Claw history compatibility.
     */
    getLatestSessionByCwdSuffix(cwdSuffix, userId) {
      this.ensureInitialized();
      return this.sessionRepository.getLatestByCwdSuffix(cwdSuffix, userId);
    }
    fixNonTerminalSessions(terminatedAt = Date.now()) {
      this.ensureInitialized();
      return this.sessionRepository.fixNonTerminal(terminatedAt);
    }
    deleteSession(id, deletedAt = Date.now()) {
      this.sessionRepository.delete(id, deletedAt);
    }
    upsertWorkspace(workspacePath, lastOpenedAt = Date.now()) {
      this.sessionRepository.upsertWorkspace(workspacePath, lastOpenedAt);
    }
    getWorkspaces() {
      return this.sessionRepository.getWorkspaces();
    }
    upsertAutomation(automation) {
      this.automationRepository.upsert(automation);
      this.queueAutomationFileBackup(automation);
    }
    updateAutomationNextRunAt(id, nextRunAt) {
      this.automationRepository.updateNextRunAt(id, nextRunAt);
    }
    getAutomation(id, options) {
      this.ensureInitialized();
      return this.automationRepository.get(id, options);
    }
    getAutomations(filter) {
      return this.automationRepository.list(filter);
    }
    /**
     * issue #42250：软删除 automation。
     *
     * 之前的实现走"事务内 DELETE 三张表"路径——会同时把 automation 行、
     * 关联的 automation_runs、automation_runtime_state 全部物理删掉。
     * 改为软删除后：
     *   - 仅在 automations 表上 `UPDATE deleted_at` 标记本行已删除；
     *   - automation_runs / automation_runtime_state 不再随之物理删除。
     *
     * 上层仍会把该 automation 从当前内存 inbox / runtimeState / queue 中移除，
     * 确保软删除任务立刻从 UI、snapshot 和调度链路消失；但 SQLite storage
     * adapter 在 persistInbox / persistRuntimeState 时会保留软删除 automation
     * 对应的 DB 行。这样未来把 deleted_at 置回 NULL 后，可以把 automation
     * 主记录、历史 runs 和 runtime_state 一起从 DB 恢复回来。
     *
     * `purgeOrphanAutomationRecords` 保留为历史兼容入口，但当前也不会物理删除
     * true orphan；这些记录由业务读取路径隐藏，最大化避免误删用户历史数据。
     */
    deleteAutomation(id, deletedAt = Date.now()) {
      this.automationRepository.softDelete(id, deletedAt);
      this.queueAutomationFileBackupRemoval(id);
    }
    /**
     * 历史兼容入口：保留 orphan automation_runs / automation_runtime_state。
     *
     * 背景：issue #38362 时这里会物理清理“automation_id 在 automations 主表中
     * 完全不存在”的孤儿记录，用来兜底删除临界态产生的脏 IN_PROGRESS 行。
     *
     * issue #42250 后策略改为“用户历史 run 数据一律尽量保留”：
     * - soft-deleted automation：主表仍在，runs/runtime_state 必须保留，未来把
     *   deleted_at 置回 NULL 后可整体恢复；
     * - true orphan：主表已不存在，无法恢复完整 automation 配置，但子表仍可能
     *   包含用户历史执行结果。为了避免误删用户数据，也保留原样。
     *
     * 当前业务读取路径（readInbox/readInProgressRuns/readRuntimeState）都会按 active
     * automations 过滤，因此这些保留数据不会进入 UI、snapshot、调度或重启恢复链路。
     * 本方法保持 no-op，仅返回 0，避免旧调用点扩大删除语义。
     */
    deleteOrphanAutomationRecords() {
      this.ensureInitialized();
      return {
        runsDeleted: 0,
        runtimeStatesDeleted: 0,
      };
    }
    upsertAutomationRun(run) {
      this.automationRepository.upsertRun(run);
    }
    getAutomationRun(threadId) {
      return this.automationRepository.getRun(threadId);
    }
    /**
     * issue #36167：仅返回 automation_runs 的轻量元数据（不读 runs_json 内容，
     * 只取其字符长度），用于 compact 迁移的扫描阶段，避免一次性把所有行的
     * 大 runs_json 全部加载到 JS 内存。
     *
     * 注意：SQLite 的 LENGTH() 对 TEXT 列返回字符数，对 UTF-8 字符数 ≤ 字节数，
     * 因此调用方应将阈值除以 4（UTF-8 最大字符宽度）做安全预筛，再单行读出
     * 真实 byteLength 精确判断。
     */
    getAutomationRunSizes() {
      return this.automationRepository.getRunSizes();
    }
    /**
     * issue #36167 follow-up：返回 automation_runs.runs_json 列在 SQLite schema
     * 中的声明类型（如 'TEXT' / 'BLOB' / ''）。compact 迁移在执行前会调用本
     * 方法做 schema sanity check：LENGTH() 在 TEXT 列返回字符数、在 BLOB 列
     * 返回字节数，两种语义混用会让扫描预筛与写回 CAS 错位（误把大行当小行
     * 跳过、或写回时永远 changes=0）。一旦未来某条 migration 把列类型改成
     * BLOB，迁移路径必须能感知并安全跳过、不写 marker。
     *
     * 返回值约定：
     * - 'TEXT'：当前唯一被迁移路径接受的合约类型
     * - 其它非空字符串：意外类型，调用方应跳过迁移
     * - undefined：表未找到 runs_json 列（schema 损坏），调用方应跳过迁移
     */
    getAutomationRunsRunsJsonColumnType() {
      this.ensureInitialized();
      return getAutomationRunsRunsJsonColumnType(this.rawSqliteDb);
    }
    getAutomationRuns(automationId) {
      return this.automationRepository.getRuns(automationId);
    }
    getAutomationRunOwnerEvidenceRows(automationId, runsJsonCharLimit) {
      return this.automationRepository.getRunOwnerEvidenceRows(
        automationId,
        runsJsonCharLimit,
      );
    }
    getSessionUserIdsByIds(sessionIds) {
      this.ensureInitialized();
      return this.sessionRepository.getUserIdsByIds(sessionIds);
    }
    upsertAutomationRuntimeState(state) {
      this.automationRepository.upsertRuntimeState(state);
    }
    replaceAutomationRuntimeStates(states) {
      this.automationRepository.replaceRuntimeStates(states);
    }
    getAutomationRuntimeStates() {
      return this.automationRepository.getRuntimeStates();
    }
    enqueueAutomationDeliveryOutbox(row) {
      return this.deliveryOutboxRepository.enqueue(row);
    }
    getAutomationDeliveryOutboxByDedupeKey(dedupeKey) {
      return this.deliveryOutboxRepository.getByDedupeKey(dedupeKey);
    }
    hasNewerAutomationDeliveryOutbox(candidate) {
      return this.deliveryOutboxRepository.hasNewer(candidate);
    }
    claimAutomationDeliveryOutbox(now, workerId, leaseExpireAt, limit) {
      return this.deliveryOutboxRepository.claim(
        now,
        workerId,
        leaseExpireAt,
        limit,
      );
    }
    markAutomationDeliverySucceeded(id, workerId, deliveryId, now) {
      return this.deliveryOutboxRepository.markSucceeded(
        id,
        workerId,
        deliveryId,
        now,
      );
    }
    markAutomationDeliveryFailed(id, workerId, update) {
      return this.deliveryOutboxRepository.markFailed(id, workerId, update);
    }
    getNextAutomationDeliveryOutboxRunAt() {
      return this.deliveryOutboxRepository.getNextRunAt();
    }
    reclaimStuckAutomationDeliveries(now, limit) {
      return this.deliveryOutboxRepository.reclaimStuck(now, limit);
    }
    cleanupTerminalAutomationDeliveries(params) {
      return this.deliveryOutboxRepository.cleanupTerminal(params);
    }
    deleteAutomationRun(threadId) {
      this.automationRepository.deleteRun(threadId);
    }
    /**
     * issue #36167：compact 迁移专用的行级带条件回写。
     *
     * 仅当数据库中行的 (status, updated_at, runs_json 字符长度) 三元组完全
     * 等于调用方在扫描阶段记录的"前置快照值"时，才会更新 runs_json。其它
     * 字段（automation_id / read_at / thread_title / source_cwd / result_success
     * / metadata_json / created_at / updated_at）原样保留，避免影响 inbox 排序、
     * 已读状态、archived 等用户可见字段。
     *
     * 返回 true 表示真的写入了一行（DB 层 changes === 1）；false 表示行已被
     * 并发写入路径修改/删除，调用方应跳过。
     *
     * 设计要点：
     * - 用 SQL `WHERE` 子句作为最后一道行级保护，不依赖 JS 同步语义
     *   （即便未来 better-sqlite3 改成 async、或引入额外的写入路径，本
     *   原子操作仍能保证不会覆盖 IN_PROGRESS 行或已被改写的最新数据）。
     * - 不修改 status / updated_at：本意只是"在不改变行为可见状态的前提
     *   下减小存储体积"，因此 updated_at 保持不变不会影响 inbox 排序。
     * - 不要替换 upsertAutomationRun 的语义：upsert 在主流程仍然是无条件
     *   覆盖（IN_PROGRESS 心跳、archive、persistInbox 等都依赖此语义）。
     */
    compactReplaceRunsJson(params) {
      this.ensureInitialized();
      return this.automationRepository.compactReplaceRunsJson(params);
    }
    /**
     * Read the persisted ACP `usage_update` snapshot for a session.
     * Returns `undefined` if no row exists.
     *
     * Callers (UsageCacheStore adapter) wrap this in try/catch to honor ADR-003
     * (SQLite as a rebuildable cache).
     */
    getSessionUsage(sessionId) {
      return this.sessionUsageRepository.get(sessionId);
    }
    /**
     * UPSERT a `session_usage` row. The primary key is `session_id`, so the
     * `ON CONFLICT` clause performs a last-write-wins overwrite of the
     * remaining columns.
     *
     * Note: there is no SQL-level `updatedAt` monotonic guard here — the
     * caller (DefaultUsageCacheService) enforces last-write-wins in memory
     * before calling `upsertUsage`. The DB row is only a persisted snapshot
     * of the latest in-memory value.
     */
    upsertSessionUsage(entry) {
      this.sessionUsageRepository.upsert(entry);
    }
    /**
     * Delete a `session_usage` row by session id. No-op if the row does not exist.
     */
    deleteSessionUsage(sessionId) {
      this.sessionUsageRepository.delete(sessionId);
    }
    /**
     * One-shot bulk read of all `session_usage` rows (for memory pre-warming on
     * app startup). Safe to call on a cold table — returns an empty array.
     */
    getAllSessionUsages() {
      return this.sessionUsageRepository.all();
    }
    /**
     * (Re)create the `session_usage` table idempotently. Normal startup creates
     * it through the Drizzle baseline migration; this method remains the runtime
     * self-healing path for {@link UsageCacheStore} when a SQLite "no such table"
     * error indicates the table was dropped after init (see ADR-003 in
     * docs/workbuddy/2026-05-18-acp-session-usage-context-ring.md).
     *
     * Public so the cache adapter can invoke self-healing without depending on
     * the full initialization path.
     */
    ensureSessionUsageTable() {
      this.ensureInitialized();
      ensureSessionUsageTableSchema(this.rawSqliteDb);
    }
    getMigrationMeta(key) {
      return this.migrationMetaRepository.get(key);
    }
    setMigrationMeta(key, value) {
      this.migrationMetaRepository.set(key, value);
    }
    deleteMigrationMeta(key) {
      this.migrationMetaRepository.delete(key);
    }
    /**
     * 执行 WAL checkpoint，将 WAL 内容合并回主数据库文件。
     * @param mode - checkpoint 模式：
     *   - 'PASSIVE'（默认）：不阻塞，尽力而为，适合定时任务
     *   - 'FULL'：阻塞写操作，强制将所有 WAL 页回写主库（不阻塞读）
     *   - 'TRUNCATE'：阻塞等待所有读取完成后截断 WAL，适合 dispose 时使用
     * 返回 checkpoint 结果 [busy, log, checkpointed]。
     */
    walCheckpoint(mode = "PASSIVE") {
      if (!this.rawSqliteDb) return;
      try {
        return this.rawSqliteDb.pragma(`wal_checkpoint(${mode})`)?.[0];
      } catch (err) {
        getDatabaseLogger().warn(
          `WAL checkpoint failed: ${err instanceof Error ? err.message : String(err)}`,
        );
        return;
      }
    }
    /**
     * 在 initialize 流程中、openDatabase 之前执行大 WAL checkpoint。
     *
     * 当 WAL 文件过大（≥10MB）时，先用临时连接执行一次 PASSIVE checkpoint，
     * 将 WAL 数据合并回主 DB 文件。这避免了后续 openDatabase + initializeAllSchemas
     * 面对巨大 WAL 时的性能问题。
     *
     * 通过 onRepairProgress 回调通知 UI 显示"数据同步中"进度，
     * 与 DB 修复流程共用同一个 splash 展示通道。
     *
     * 注意：此方法在 initialize() 内部同步调用，必须是同步实现。
     */
    performStartupWalCheckpointIfNeeded(onProgress) {
      const walPath = this.dbPath + "-wal";
      const WAL_LARGE_THRESHOLD = 10 * 1024 * 1024;
      let walSize = 0;
      try {
        if (fs.existsSync(walPath)) walSize = fs.statSync(walPath).size;
      } catch {}
      if (walSize < WAL_LARGE_THRESHOLD) return;
      getDatabaseLogger().info(
        `Large WAL detected before open (${(walSize / 1024 / 1024).toFixed(1)}MB), performing startup checkpoint`,
      );
      onProgress?.({
        phase: "recover",
        message: `Syncing WAL data (${(walSize / 1024 / 1024).toFixed(0)}MB)`,
      });
      let checkpointEffective = false;
      let lastCheckpointResult;
      try {
        const tempDb = openWorkbuddyRawSqliteDatabase(this.dbPath);
        try {
          tempDb.pragma("busy_timeout = 10000");
          const result = tempDb.pragma("wal_checkpoint(TRUNCATE)");
          if (result?.[0]) {
            lastCheckpointResult = result[0];
            const walSizeAfter = fs.existsSync(walPath)
              ? fs.statSync(walPath).size
              : 0;
            getDatabaseLogger().info(
              `Startup WAL checkpoint (TRUNCATE) done: log=${lastCheckpointResult.log}, checkpointed=${lastCheckpointResult.checkpointed}, busy=${lastCheckpointResult.busy}, walAfter=${(walSizeAfter / 1024).toFixed(0)}KB`,
            );
            if (walSizeAfter < 32 * 1024) checkpointEffective = true;
          }
        } finally {
          tempDb.close();
        }
      } catch (err) {
        getDatabaseLogger().warn(
          `Startup WAL checkpoint failed (non-fatal): ${err instanceof Error ? err.message : String(err)}`,
        );
      }
      if (!checkpointEffective)
        try {
          const currentWalSize = fs.existsSync(walPath)
            ? fs.statSync(walPath).size
            : 0;
          if (currentWalSize < WAL_LARGE_THRESHOLD) {
          } else {
            let safeToQuarantine = false;
            let quarantineReason = "";
            if (lastCheckpointResult) {
              if (
                lastCheckpointResult.busy === 0 &&
                (lastCheckpointResult.log === 0 ||
                  lastCheckpointResult.log ===
                    lastCheckpointResult.checkpointed)
              ) {
                safeToQuarantine = true;
                quarantineReason = `checkpoint reports safe (busy=0, log=${lastCheckpointResult.log}, checkpointed=${lastCheckpointResult.checkpointed})`;
              }
            } else if (!this.checkWalHeaderMagic(walPath)) {
              safeToQuarantine = true;
              quarantineReason =
                "checkpoint failed AND WAL header magic invalid (corrupt/orphan file)";
            }
            if (!safeToQuarantine)
              getDatabaseLogger().warn(
                `WAL still ${(currentWalSize / 1024 / 1024).toFixed(1)}MB but unsafe to quarantine (busy=${lastCheckpointResult?.busy}, log=${lastCheckpointResult?.log}, checkpointed=${lastCheckpointResult?.checkpointed}). Leaving WAL intact for SQLite recovery on open.`,
              );
            else {
              const shmPath = this.dbPath + "-shm";
              const ts = Date.now();
              const quarantinedWal = `${walPath}.orphan-${ts}`;
              const quarantinedShm = `${shmPath}.orphan-${ts}`;
              getDatabaseLogger().warn(
                `WAL still ${(currentWalSize / 1024 / 1024).toFixed(1)}MB after TRUNCATE checkpoint. Reason: ${quarantineReason}. Quarantining → ${quarantinedWal}`,
              );
              onProgress?.({
                phase: "recover",
                message: "Quarantining orphan WAL file",
              });
              try {
                fs.renameSync(walPath, quarantinedWal);
              } catch (e) {
                getDatabaseLogger().warn(
                  `rename -wal failed: ${e instanceof Error ? e.message : String(e)}`,
                );
              }
              if (fs.existsSync(shmPath))
                try {
                  fs.renameSync(shmPath, quarantinedShm);
                } catch (e) {
                  getDatabaseLogger().warn(
                    `rename -shm failed: ${e instanceof Error ? e.message : String(e)}`,
                  );
                }
            }
          }
        } catch (err) {
          getDatabaseLogger().warn(
            `Orphan WAL quarantine failed (non-fatal): ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      if (walSize >= WAL_LARGE_THRESHOLD)
        this.cleanupGhostSessionsAfterWalCheckpoint();
      onProgress?.({ phase: "done" });
    }
    /**
     * WAL checkpoint 后清理"幽灵会话"。
     *
     * 场景：大 WAL checkpoint 将数据合并到主 DB 后，可能恢复出无效的 session 记录：
     *   1. cwd 为空字符串（WAL 中的不完整写入）
     *   2. cwd 指向用户机器上已不存在的目录（session 对应的项目已被删除/移动）
     *
     * 这些 session 无法被正常加载（performLoadSession 需要有效的 cwd），
     * 在 UI 中展示并被点击/自动选中后会导致主窗口卡顿。
     *
     * 策略：
     *   - cwd 为空 → 直接标记软删除
     *   - cwd 非空但目录不存在于文件系统 → 标记软删除
     * 不做物理 DELETE，保留数据可追溯性。
     */
    cleanupGhostSessionsAfterWalCheckpoint() {
      try {
        const stats = cleanupGhostDataAfterWalCheckpoint(this.dbPath);
        const totalSessions = stats.emptyCwdSessions + stats.missingCwdSessions;
        if (totalSessions > 0)
          getDatabaseLogger().warn(
            `Cleaned ${totalSessions} ghost session(s) after WAL checkpoint (empty_cwd=${stats.emptyCwdSessions}, missing_cwd_dir=${stats.missingCwdSessions})`,
          );
        if (stats.missingCwdAutomations > 0 || stats.missingSourceCwdRuns > 0)
          getDatabaseLogger().warn(
            `Cleaned automation ghost data after WAL checkpoint (automations_missing_cwds=${stats.missingCwdAutomations}, runs_missing_source_cwd=${stats.missingSourceCwdRuns})`,
          );
      } catch (err) {
        getDatabaseLogger().warn(
          `Ghost session cleanup failed (non-fatal): ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
    /**
     * 执行数据库完整性快速检查。
     * @param pageLimit - 限制检查的最大页数（SQLite 3.33.0+），不传则检查全部页面。
     *   建议定时/延迟检查传 100（耗时 < 100ms），initialize 二次确认不传（全量检查）。
     * 返回 'ok' 表示正常，其他值表示有问题。
     */
    quickCheck(pageLimit) {
      if (!this.rawSqliteDb) return "no database";
      try {
        const pragma = pageLimit ? `quick_check(${pageLimit})` : "quick_check";
        return this.rawSqliteDb.pragma(pragma)?.[0]?.quick_check ?? "unknown";
      } catch (err) {
        return `error: ${String(err)}`;
      }
    }
    static HEALTH_CHECK_MARKER_FILE = ".needs-recovery";
    /**
     * 延迟健康检查：启动后异步执行，不阻塞主流程。
     * 使用 quick_check(100) 限制检查页数（< 100ms），延迟 30 秒执行。
     */
    scheduleHealthCheck(delayMs = 3e4) {
      return setTimeout(() => {
        if (!this.rawSqliteDb) return;
        const status = this.quickCheck(100);
        if (status !== "ok") {
          getDatabaseLogger().error(`Deferred health check failed: ${status}`);
          const markerPath =
            this.dbPath + WorkbuddyDatabaseService.HEALTH_CHECK_MARKER_FILE;
          try {
            fs.writeFileSync(
              markerPath,
              JSON.stringify({
                detectedAt: /* @__PURE__ */ new Date().toISOString(),
                status,
              }),
            );
          } catch {}
        } else {
          const markerPath =
            this.dbPath + WorkbuddyDatabaseService.HEALTH_CHECK_MARKER_FILE;
          try {
            fs.unlinkSync(markerPath);
          } catch {}
        }
      }, delayMs);
    }
    /** 定时 WAL checkpoint 的 timer 引用，用于 dispose 时清理 */
    walCheckpointTimer;
    /**
     * 启动后延迟执行一次 PASSIVE checkpoint（用于大 WAL 场景）。
     *
     * 在 initialize() 成功后异步调用，确保 splash 可显示进度。
     * - 如果 WAL > 10MB，汇报 'repairing' phase 让 splash 显示"数据同步中"
     * - 执行 PASSIVE checkpoint（不阻塞其他读写，SQLite WAL 设计保证无冲突）
     * - 完成后汇报 'done' phase
     *
     * @param onProgress - 可选的进度回调（用于更新 splash 显示）
     * @param delayMs - 延迟多少毫秒后执行（默认 500ms，给 splash 渲染时间）
     */
    scheduleStartupWalCheckpoint(onProgress, delayMs = 500) {
      let resolve;
      const done = new Promise((r) => {
        resolve = r;
      });
      return {
        timer: setTimeout(() => {
          try {
            if (!this.rawSqliteDb) return;
            const walPath = this.dbPath + "-wal";
            let walSize = 0;
            try {
              if (fs.existsSync(walPath)) walSize = fs.statSync(walPath).size;
            } catch {}
            if (walSize < 10 * 1024 * 1024) return;
            getDatabaseLogger().info(
              `Large WAL detected (${(walSize / 1024 / 1024).toFixed(1)}MB), performing startup checkpoint`,
            );
            onProgress?.({
              phase: "recover",
              message: `Syncing WAL data (${(walSize / 1024 / 1024).toFixed(0)}MB)`,
            });
            const result = this.walCheckpoint("PASSIVE");
            if (result)
              getDatabaseLogger().info(
                `Startup WAL checkpoint done: log=${result.log}, checkpointed=${result.checkpointed}, busy=${result.busy}`,
              );
            onProgress?.({ phase: "done" });
          } finally {
            resolve();
          }
        }, delayMs),
        done,
      };
    }
    /**
     * 启动定时 WAL checkpoint（每 5 分钟执行一次 TRUNCATE 强制同步并截断）。
     *
     * 作为 SQLite 默认 auto-checkpoint 阈值之外的兜底，防止异常退出、
     * 长读事务或历史大 WAL 场景让 WAL 文件持续膨胀。
     *
     * 使用 TRUNCATE 而非 FULL/PASSIVE 的原因：
     * - TRUNCATE 不仅回写所有 WAL 页到主库，还会物理截断 WAL 文件为 0 字节，释放磁盘空间
     * - PASSIVE 无法保证完全同步且无法截断文件（见 SQLite 文档）
     * - FULL 虽能保证回写，但 WAL 文件保持原大小不释放空间
     * - 在 better-sqlite3 单连接同步模型中，TRUNCATE 的"等待所有读完成"条件天然满足
     *   （同一连接内操作串行，定时器 tick 时不存在进行中的读操作）
     * - 已全局设置 busy_timeout=10s，即使极罕见的外部进程持锁也有超时保护
     *
     * 间隔选择（5 分钟）：
     * - 1 分钟过于频繁，对低端 HDD 用户可能产生不必要的 I/O 压力
     * - 5 分钟在 WAL 膨胀控制与 I/O 开销之间取得平衡
     * - 配合 auto-checkpoint 阈值（1000 页 ≈ 4MB），正常写入量下 WAL 不会在 5 分钟内膨胀到危险大小
     *
     * 注意事项：
     * - 只允许调用一次，内部有防重入保护
     * - dispose() 时自动清理定时器
     * - 返回 timer 引用供调用方管理（如提前取消）
     */
    schedulePeriodicWalCheckpoint(intervalMs = 300 * 1e3) {
      if (this.walCheckpointTimer) return this.walCheckpointTimer;
      this.walCheckpointTimer = setInterval(() => {
        if (!this.rawSqliteDb) return;
        try {
          const result = this.walCheckpoint("TRUNCATE");
          if (result && result.log > 0)
            getDatabaseLogger().info(
              `Periodic WAL checkpoint (TRUNCATE): log=${result.log}, checkpointed=${result.checkpointed}, busy=${result.busy}`,
            );
        } catch (err) {
          getDatabaseLogger().warn(
            `Periodic WAL checkpoint error: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }, intervalMs);
      if (this.walCheckpointTimer.unref) this.walCheckpointTimer.unref();
      return this.walCheckpointTimer;
    }
    /**
     * 判断错误是否为数据库文件损坏类型。
     *
     * ⚠️ 注意：
     * - 不包含 'database or disk is full'（磁盘满不是损坏，删除重建后仍会失败）
     * - 不包含 'disk i/o error'（可能来自权限/文件锁/临时 I/O 故障，不能证明数据库内容损坏）
     *   disk i/o error / unable to open 场景走 isDatabaseAccessError() 判断，需二次确认后才执行重建
     */
    isDatabaseCorruptionError(error) {
      if (!error) return false;
      const msg = error.message.toLowerCase();
      return (
        msg.includes("database disk image is malformed") ||
        msg.includes("file is not a database")
      );
    }
    /**
     * 判断错误是否为数据库访问错误（I/O 故障或无法打开文件，可能是临时性的，需二次诊断确认）。
     * 包含：
     * - 'disk i/o error'：磁盘 I/O 故障
     * - 'unable to open database file'：WAL/SHM 权限异常、文件状态不一致等
     */
    isDatabaseAccessError(error) {
      if (!error) return false;
      const msg = error.message.toLowerCase();
      return (
        msg.includes("disk i/o error") ||
        msg.includes("unable to open database file")
      );
    }
    /**
     * 诊断数据库损坏类型：通过隔离 WAL/SHM 文件精确区分仅 WAL 损坏 vs 主库损坏。
     *
     * 流程：
     * 1. 如果没有 WAL 文件，直接判定主库损坏
     * 2. 临时 rename WAL/SHM → .diagbak（原子操作，无需复制大文件）
     * 3. 在 WAL 隔离状态下打开主 .db 执行 integrity_check
     * 4. finally 中无条件还原 WAL/SHM（确保不破坏现场）
     *
     * @returns 诊断结果，含损坏类型和描述信息
     */
    diagnoseDamageType() {
      const walPath = this.dbPath + "-wal";
      const shmPath = this.dbPath + "-shm";
      if (!fs.existsSync(this.dbPath))
        return {
          status: "MAIN_DB_DAMAGED",
          message: "Main .db file does not exist",
        };
      if (!fs.existsSync(walPath))
        return {
          status: "MAIN_DB_DAMAGED",
          message: "No WAL file present, main .db is damaged",
        };
      const walBak = walPath + ".diagbak";
      const shmBak = shmPath + ".diagbak";
      let hasWalBak = false;
      let hasShmBak = false;
      try {
        if (fs.existsSync(walPath)) {
          fs.renameSync(walPath, walBak);
          hasWalBak = true;
        }
        if (fs.existsSync(shmPath)) {
          fs.renameSync(shmPath, shmBak);
          hasShmBak = true;
        }
        let testDb;
        try {
          testDb = openWorkbuddyRawSqliteDatabase(this.dbPath);
          const result = testDb.pragma("integrity_check");
          testDb?.close();
          testDb = void 0;
          if (
            result &&
            result.length === 1 &&
            result[0].integrity_check === "ok"
          )
            return {
              status: "WAL_DAMAGED",
              message:
                "WAL file corrupted, main .db is healthy (isolated integrity_check passed)",
            };
          return {
            status: "MAIN_DB_DAMAGED",
            message: `Main .db damaged (integrity_check: ${result?.map((r) => r.integrity_check).join("; ") ?? "unknown"})`,
          };
        } catch (openErr) {
          if (testDb)
            try {
              testDb?.close();
            } catch {}
          return {
            status: "MAIN_DB_DAMAGED",
            message: `Main .db cannot be opened without WAL: ${openErr instanceof Error ? openErr.message : String(openErr)}`,
          };
        }
      } catch (fsErr) {
        return {
          status: "UNKNOWN_ERROR",
          message: `File operation failed during diagnosis: ${fsErr instanceof Error ? fsErr.message : String(fsErr)}`,
        };
      } finally {
        try {
          if (hasWalBak && fs.existsSync(walBak))
            fs.renameSync(walBak, walPath);
        } catch (restoreErr) {
          getDatabaseLogger().error(
            "Critical: failed to restore WAL file after diagnosis",
            restoreErr instanceof Error
              ? restoreErr
              : new Error(String(restoreErr)),
          );
        }
        try {
          if (hasShmBak && fs.existsSync(shmBak))
            fs.renameSync(shmBak, shmPath);
        } catch (restoreErr) {
          getDatabaseLogger().error(
            "Critical: failed to restore SHM file after diagnosis",
            restoreErr instanceof Error
              ? restoreErr
              : new Error(String(restoreErr)),
          );
        }
      }
    }
    /**
     * WAL-only repair：确认仅 WAL 损坏后，删除 WAL/SHM 并重新打开数据库。
     *
     * 前置条件：调用方已通过 diagnoseDamageType() 确认 status === 'WAL_DAMAGED'。
     * 本方法只负责执行修复动作：删除损坏文件 → 重新打开 → 验证 → 初始化 schema。
     *
     * @returns true 表示修复成功，数据库已可用；false 表示执行过程失败
     */
    attemptWalOnlyRepair() {
      const walPath = this.dbPath + "-wal";
      const shmPath = this.dbPath + "-shm";
      getDatabaseLogger().info(
        "Executing WAL-only repair (diagnosis confirmed WAL_DAMAGED)...",
      );
      const timestamp = /* @__PURE__ */ new Date()
        .toISOString()
        .replace(/[:.]/g, "-");
      try {
        if (fs.existsSync(walPath)) {
          const walBackup = `${walPath}.corrupt-${timestamp}`;
          try {
            fs.copyFileSync(walPath, walBackup);
          } catch {}
          fs.unlinkSync(walPath);
        }
        if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
      } catch (cleanErr) {
        getDatabaseLogger().warn(
          `WAL-only repair failed: cannot remove WAL/SHM files: ${cleanErr instanceof Error ? cleanErr.message : String(cleanErr)}`,
        );
        return false;
      }
      try {
        this.openDatabase();
        this.rawSqliteDb.pragma("quick_check(1)");
        this.initializeAllSchemas();
        getDatabaseLogger().info(
          "WAL-only repair successful — database recovered with minimal data loss",
        );
        try {
          fs.writeFileSync(
            this.dbPath + ".recovered",
            JSON.stringify({
              recoveredAt: /* @__PURE__ */ new Date().toISOString(),
              reason:
                "WAL file corruption detected, removed corrupt WAL/SHM and reopened",
              dataRecovery: { type: "wal-only" },
            }),
          );
        } catch {}
        this.pruneCorruptBackups();
        return true;
      } catch (reopenErr) {
        getDatabaseLogger().error(
          "WAL-only repair: reopen after WAL removal failed",
          reopenErr instanceof Error ? reopenErr : new Error(String(reopenErr)),
        );
        try {
          this.rawSqliteDb?.close();
        } catch {}
        this.rawSqliteDb = void 0;
        this.drizzleDb = void 0;
        return false;
      }
    }
    /** Minimum WAL size to consider it "had data" (WAL header = 32 bytes + at least one frame header 24 bytes + one page) */
    static MIN_WAL_WITH_DATA = 4152;
    /** SQLite WAL magic numbers (big-endian): 0x377f0682 (normal) or 0x377f0683 (with checksum) */
    static WAL_MAGIC_1 = 931071618;
    static WAL_MAGIC_2 = 931071619;
    /**
     * 检查 WAL 文件的 header magic 是否有效。
     * 有效 magic: 0x377f0682 (normal WAL) 或 0x377f0683 (with checksum)。
     * 返回 true 表示 header 有效（SQLite 可能会尝试 recovery），false 表示无效/损坏/不可读。
     */
    checkWalHeaderMagic(walPath) {
      try {
        if (!fs.existsSync(walPath)) return false;
        if (fs.statSync(walPath).size < 4) return false;
        const fd = fs.openSync(walPath, "r");
        try {
          const magicBuf = Buffer.alloc(4);
          fs.readSync(fd, magicBuf, 0, 4, 0);
          const magic = magicBuf.readUInt32BE(0);
          return (
            magic === WorkbuddyDatabaseService.WAL_MAGIC_1 ||
            magic === WorkbuddyDatabaseService.WAL_MAGIC_2
          );
        } finally {
          fs.closeSync(fd);
        }
      } catch {
        return false;
      }
    }
    /**
     * Pre-check: detect if a large WAL file with invalid header magic exists before opening.
     * Must be called BEFORE openDatabase() since SQLite will silently ignore the WAL.
     */
    detectPreExistingCorruptWal() {
      const walPath = this.dbPath + "-wal";
      if (!fs.existsSync(walPath)) return null;
      try {
        const stat = fs.statSync(walPath);
        if (stat.size < WorkbuddyDatabaseService.MIN_WAL_WITH_DATA) return null;
        const fd = fs.openSync(walPath, "r");
        try {
          const magicBuf = Buffer.alloc(4);
          fs.readSync(fd, magicBuf, 0, 4, 0);
          const magic = magicBuf.readUInt32BE(0);
          if (
            magic === WorkbuddyDatabaseService.WAL_MAGIC_1 ||
            magic === WorkbuddyDatabaseService.WAL_MAGIC_2
          )
            return null;
          return {
            walPath,
            walSize: stat.size,
          };
        } finally {
          fs.closeSync(fd);
        }
      } catch {
        return null;
      }
    }
    /**
     * Post-check: after successful initialization, handle the silent WAL data loss.
     * Determines loss severity, logs warning, backs up corrupted WAL, and writes recovery marker.
     */
    handleSilentWalDataLoss(corruptWal) {
      const dbSessionCount = this.countDbSessions();
      const sidecarSessionCount = this.countSidecarSessions();
      let severity;
      if (dbSessionCount === 0 && sidecarSessionCount === 0) severity = "";
      else if (
        sidecarSessionCount > dbSessionCount &&
        sidecarSessionCount - dbSessionCount > 3
      )
        severity = "partial loss";
      else severity = sidecarSessionCount > dbSessionCount ? "minor loss" : "";
      const severityLabel = severity ? ` (${severity})` : "";
      getDatabaseLogger().warn(
        `Silent WAL data loss detected${severityLabel}: WAL file (${corruptWal.walSize} bytes) had invalid header magic and was silently ignored by SQLite`,
      );
      const timestamp = /* @__PURE__ */ new Date()
        .toISOString()
        .replace(/[:.]/g, "-");
      try {
        const walBackup = `${corruptWal.walPath}.silent-loss-${timestamp}`;
        fs.copyFileSync(corruptWal.walPath, walBackup);
      } catch {}
      let recoveredSessions = 0;
      if (sidecarSessionCount > dbSessionCount)
        try {
          const sessionsDir = this.getSessionsHistoryDir();
          if (sessionsDir) {
            recoveredSessions =
              this.rebuildSessionIndexFromHistory(sessionsDir);
            if (recoveredSessions > 0) {
              getDatabaseLogger().info(
                `Silent WAL loss recovery: rebuilt ${recoveredSessions} session(s) from sidecar history`,
              );
              this.supplementSessionDataFromVscdb();
            }
          }
        } catch (err) {
          getDatabaseLogger().warn(
            `Silent WAL loss recovery: sidecar rebuild failed: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      try {
        fs.writeFileSync(
          this.dbPath + ".recovered",
          JSON.stringify({
            recoveredAt: /* @__PURE__ */ new Date().toISOString(),
            reason:
              "WAL file had invalid header magic, silently ignored by SQLite",
            dataRecovery: {
              type: severity
                ? `silent-wal-loss-${severity}`
                : "silent-wal-loss",
              walSize: corruptWal.walSize,
              dbSessionCount,
              sidecarSessionCount,
              recoveredSessions,
            },
          }),
        );
      } catch {}
    }
    /** Count sessions currently in the DB (fast, no filtering) */
    countDbSessions() {
      if (!this.rawSqliteDb || !this.drizzleDb) return 0;
      try {
        return (
          this.drizzleDb
            .select({ cnt: sql`COUNT(*)` })
            .from(sessions)
            .where(isNull(sessions.deletedAt))
            .get()?.cnt ?? 0
        );
      } catch {
        return 0;
      }
    }
    /** Count sessions from sidecar history files (projects/<cwd>/<session>.jsonl) */
    countSidecarSessions() {
      const projectsDir = path.join(path.dirname(this.dbPath), "projects");
      if (!fs.existsSync(projectsDir)) return 0;
      let count = 0;
      try {
        const cwdDirs = fs
          .readdirSync(projectsDir, { withFileTypes: true })
          .filter((d) => d.isDirectory());
        for (const cwdDir of cwdDirs)
          try {
            const cwdDirPath = path.join(projectsDir, cwdDir.name);
            const jsonlFiles = fs
              .readdirSync(cwdDirPath)
              .filter((f) => f.endsWith(".jsonl"));
            count += jsonlFiles.length;
          } catch {}
      } catch {}
      return count;
    }
    /**
     * 备份损坏的数据库文件（.db / .db-wal / .db-shm）。
     * Windows 文件锁场景下 fallback：rename → unlink。
     * @param timestamp - 可选的时间戳字符串，未传则自动生成
     */
    backupCorruptedFiles(timestamp) {
      const ts =
        timestamp ??
        /* @__PURE__ */ new Date().toISOString().replace(/[:.]/g, "-");
      const extensions = ["", "-wal", "-shm"];
      let allCleared = true;
      for (const ext of extensions) {
        const src = this.dbPath + ext;
        if (fs.existsSync(src)) {
          const dest = `${this.dbPath}${ext}.corrupt-${ts}`;
          try {
            fs.renameSync(src, dest);
            getDatabaseLogger().info(
              `Backed up corrupted file: ${src} → ${dest}`,
            );
          } catch (err) {
            getDatabaseLogger().warn(
              `Failed to rename ${src}, attempting delete: ${err instanceof Error ? err.message : String(err)}`,
            );
            try {
              fs.unlinkSync(src);
            } catch (unlinkErr) {
              getDatabaseLogger().warn(
                `Failed to unlink ${src}: ${unlinkErr instanceof Error ? unlinkErr.message : String(unlinkErr)}`,
              );
              allCleared = false;
            }
          }
        }
      }
      if (!allCleared)
        throw new Error(
          "Failed to clear corrupted files (likely file lock), recovery aborted",
        );
    }
    ensureInitialized() {
      if (!this.rawSqliteDb)
        throw new Error("WorkbuddyDatabaseService is not initialized");
    }
    getDrizzleDb() {
      this.ensureInitialized();
      if (!this.drizzleDb)
        throw new Error(
          "WorkbuddyDatabaseService Drizzle database is not initialized",
        );
      return this.drizzleDb;
    }
    /** 打开数据库连接并设置基本 pragma（WAL + busy_timeout + auto-checkpoint） */
    openDatabase() {
      this.rawSqliteDb = openWorkbuddyRawSqliteDatabase(this.dbPath);
      configureWorkbuddySqliteConnection(this.rawSqliteDb);
      this.drizzleDb = createWorkbuddyDrizzleDatabase(this.rawSqliteDb);
    }
    /** Run the WorkBuddy Drizzle migration pipeline before business SQL runs. */
    initializeAllSchemas() {
      this.ensureInitialized();
      runWorkbuddyDrizzleMigrations(asBetterSqliteDatabase(this.rawSqliteDb), {
        configDir: path.dirname(this.dbPath),
      });
    }
    static AUTOMATION_BACKUP_DIR = "automation-backups";
    /**
     * 自动治愈后的数据恢复编排入口。
     *
     * 恢复策略：统一从 sidecar history 目录重建，不再依赖损坏备份 DB。
     * 1. 从 sidecar history（projects/）目录重建 session 索引
     * 2. 从 vscdb 补充 userId 等元数据
     * 3. 从 automation-backups/ 文件系统冗余备份恢复 automation 配置
     */
    performDataRecovery(_timestamp) {
      const result = {
        sessions: 0,
        automations: 0,
      };
      const sessionsDir = this.getSessionsHistoryDir();
      if (sessionsDir)
        result.sessions = this.rebuildSessionIndexFromHistory(sessionsDir);
      if (result.sessions > 0) this.supplementSessionDataFromVscdb();
      const fileAutomations = this.recoverAutomationsFromFileBackup();
      if (fileAutomations.length > 0)
        for (const automation of fileAutomations)
          try {
            this.upsertAutomation(automation);
            result.automations++;
          } catch {}
      this.markMigrationCompletedAfterRecovery(result);
      getDatabaseLogger().info(
        `Recovery complete: ${result.sessions} sessions, ${result.automations} automations`,
      );
      return result;
    }
    /**
     * 从 legacy vscdb 补充 session 的 userId 等元数据。
     *
     * sidecar history 重建的 session userId 为空字符串（projects/ 下可能是任意用户的会话），
     * 但 legacy vscdb（codebuddy-sessions.vscdb）中存储了完整的 userId/title/customTitle/status。
     * 本方法从 vscdb 读取这些信息，通过 upsertSession 合并回 DB。
     *
     * 重要安全约束：只 UPDATE 已存在的 session，不 INSERT 新的。
     * 如果 vscdb 中有 session 但 recovery 没从 .jsonl 重建出来，说明历史文件已丢失，
     * INSERT 会创建"DB 有记录但无对应历史"的半恢复会话（#50848 风险）。
     *
     * upsertSession 的 ON CONFLICT 策略对已存在的 session 是安全的：
     * - user_id: 保留已有非空值（CASE WHEN sessions.user_id IS NOT NULL AND != '' THEN keep ELSE update）
     * - title: COALESCE（保留已有值）
     * - status: archived 不降级
     */
    supplementSessionDataFromVscdb() {
      const appDataDir =
        process.platform === "darwin"
          ? path.join(os.homedir(), "Library", "Application Support")
          : process.platform === "win32"
            ? process.env.APPDATA?.trim() ||
              path.join(os.homedir(), "AppData", "Roaming")
            : process.env.XDG_CONFIG_HOME?.trim() ||
              path.join(os.homedir(), ".config");
      const vscdbPath = path.join(
        appDataDir,
        "WorkBuddy",
        "codebuddy-sessions.vscdb",
      );
      if (!fs.existsSync(vscdbPath)) {
        getDatabaseLogger().info(
          "No legacy vscdb found, skipping userId supplement",
        );
        return;
      }
      try {
        const payloads = readLegacyVscdbSessionPayloads(vscdbPath);
        let supplemented = 0;
        for (const parsed of payloads)
          try {
            const sessionId = parsed.conversationId;
            const userId = parsed.userId;
            const cwd = parsed.cwd;
            if (!sessionId || !userId || !cwd) continue;
            if (parsed.deletedAt) continue;
            if (
              !this.getDrizzleDb()
                .select({ matched: sql`1` })
                .from(sessions)
                .where(eq(sessions.id, sessionId))
                .limit(1)
                .get()
            )
              continue;
            const vscdbIsPlayground =
              "isPlayground" in parsed ? Boolean(parsed.isPlayground) : void 0;
            this.upsertSession({
              id: sessionId,
              cwd,
              userId,
              title: parsed.title,
              customTitle: parsed.customTitle,
              status: parsed.status || "Completed",
              createdAt: parsed.createdAt || Date.now(),
              updatedAt: parsed.updatedAt || Date.now(),
              deletedAt: void 0,
              isPlayground: vscdbIsPlayground,
            });
            supplemented++;
          } catch {}
        if (supplemented > 0)
          getDatabaseLogger().info(
            `Supplemented ${supplemented} sessions with userId from legacy vscdb`,
          );
      } catch (err) {
        getDatabaseLogger().warn(
          `Failed to supplement session data from vscdb: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
    /**
     * Recovery 完成后写 migration_meta 标记，阻止 MigrationService 重复跑。
     *
     * Recovery 已经从 backup/sidecar/vscdb 恢复了数据，MigrationService 的 history 迁移
     * 在此场景下是重复劳动（且 DB 重建后 migration_meta 为空，MigrationService 会误以为
     * "从未迁移过"而完整重跑，浪费启动时间）。
     */
    markMigrationCompletedAfterRecovery(recoveryResult) {
      try {
        if (recoveryResult.sessions > 0)
          this.setMigrationMeta(
            "legacy_history_migration",
            JSON.stringify({
              status: "success",
              migrationVersion: 2,
              completedAt: Date.now(),
              sessionCount: recoveryResult.sessions,
              source: "data-recovery",
              reason: "rebuilt_after_corruption",
              repairChecked: false,
            }),
          );
        if (recoveryResult.automations > 0)
          this.setMigrationMeta(
            "legacy_automation_migration",
            JSON.stringify({
              status: "success",
              completedAt: Date.now(),
              source: "data-recovery",
            }),
          );
      } catch (err) {
        getDatabaseLogger().warn(
          `Failed to mark migration meta after recovery: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
    /**
     * 从 projects 目录重建 session 索引。
     *
     * Session history 的文件系统布局：
     * ```
     * projects/
     * ├── <compressedCwd>/            ← 目录名是 CWD 路径经有损压缩得到（/ → -）
     * │   ├── <sessionId>.jsonl       ← 会话的完整 event 流
     * │   ├── <sessionId>.meta.json   ← 可选的元数据文件（迁移的老会话才有）
     * │   └── <sessionId>/            ← 可选的子目录（workflow 等）
     * ```
     *
     * 重建策略：
     * 1. 遍历 projects/ 下的所有子目录
     * 2. 对于每个子目录，扫描其中的 .jsonl 文件
     * 3. 从 jsonl 的前几行提取 sessionId、cwd、aiTitle
     * 4. 如果有 .meta.json，从中补充 createdAt/updatedAt/cwd 等信息
     *
     * **注意**：projects 下可能包含不同用户的会话。重建时 userId 设为空字符串，
     * 上层 getSessions 通过 `user_id IS NULL OR user_id = ''` 条件保证这些记录
     * 对当前用户可见。用户登录后的正常写入会通过 upsertSession 补上正确的 userId。
     *
     * @param projectsDir - `~/.workbuddy/projects/` 目录路径
     */
    rebuildSessionIndexFromHistory(projectsDir) {
      if (!this.rawSqliteDb || !fs.existsSync(projectsDir)) return 0;
      let rebuilt = 0;
      try {
        const cwdDirs = fs
          .readdirSync(projectsDir, { withFileTypes: true })
          .filter((d) => d.isDirectory());
        for (const cwdDir of cwdDirs)
          try {
            const cwdDirPath = path.join(projectsDir, cwdDir.name);
            const jsonlFiles = fs
              .readdirSync(cwdDirPath)
              .filter((f) => f.endsWith(".jsonl"));
            for (const jsonlFile of jsonlFiles)
              try {
                const jsonlPath = path.join(cwdDirPath, jsonlFile);
                const sessionId = jsonlFile.replace(/\.jsonl$/, "");
                if (!sessionId) continue;
                const stat = fs.statSync(jsonlPath);
                if (stat.size === 0) continue;
                const metaPath = path.join(
                  cwdDirPath,
                  `${sessionId}.meta.json`,
                );
                let meta = {};
                try {
                  if (fs.existsSync(metaPath))
                    meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
                } catch {}
                const extracted = this.extractSessionInfoFromJsonl(jsonlPath);
                const cwd =
                  extracted.cwd ||
                  (typeof meta.cwd === "string" ? meta.cwd : "") ||
                  "";
                const createdAt =
                  typeof meta.createdAt === "number"
                    ? meta.createdAt
                    : (typeof meta.createdAt === "string"
                        ? new Date(meta.createdAt).getTime()
                        : 0) ||
                      extracted.firstTimestamp ||
                      stat.birthtimeMs;
                const updatedAt =
                  typeof meta.updatedAt === "number"
                    ? meta.updatedAt
                    : (typeof meta.updatedAt === "string"
                        ? new Date(meta.updatedAt).getTime()
                        : 0) ||
                      extracted.lastTimestamp ||
                      stat.mtimeMs;
                const isPlayground =
                  "isPlayground" in meta
                    ? Boolean(meta.isPlayground)
                    : this.inferIsPlaygroundFromDir(
                        cwdDir.name,
                        jsonlFiles.length,
                      );
                const session = {
                  id: sessionId,
                  cwd,
                  userId: "",
                  title: extracted.aiTitle || void 0,
                  status: "Completed",
                  createdAt,
                  updatedAt,
                  lastActivityAt: stat.mtimeMs,
                  isPlayground,
                  model:
                    extracted.model ||
                    (typeof meta.model === "string" ? meta.model : void 0),
                  projectId:
                    typeof meta.projectId === "string" && meta.projectId.trim()
                      ? meta.projectId.trim()
                      : void 0,
                };
                this.upsertSession(session);
                rebuilt++;
              } catch (err) {
                getDatabaseLogger().warn(
                  `Failed to rebuild session from ${jsonlFile}: ${err instanceof Error ? err.message : String(err)}`,
                );
              }
          } catch (err) {
            getDatabaseLogger().warn(
              `Failed to scan project dir ${cwdDir.name}: ${err instanceof Error ? err.message : String(err)}`,
            );
          }
      } catch (err) {
        getDatabaseLogger().warn(
          `Failed to scan projects directory: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
      if (rebuilt > 0)
        getDatabaseLogger().info(
          `Rebuilt ${rebuilt} session records from history files`,
        );
      return rebuilt;
    }
    /**
     * 从 projects 子目录名和 jsonl 文件数量推断 session 是否为 playground（普通任务）。
     *
     * 推断规则：
     * - 普通任务（isPlayground=true）：目录名包含 "WorkBuddy" 且尾段匹配时间戳格式
     *   （如 Users-borfyqiu-WorkBuddy-2026-06-09-20-21-49），**并且**目录仅有一个 jsonl 文件。
     *   这类目录对应系统自动生成的临时 CWD。
     * - 空间任务（isPlayground=false）：目录名对应用户真实项目路径
     *   （如 Users-borfyqiu-Desktop-self-study-multica），或目录中有多个 jsonl 文件
     *   （多 session 共享同一 workspace 说明是持久化的项目空间）。
     */
    inferIsPlaygroundFromDir(dirName, jsonlFileCount) {
      if (jsonlFileCount > 1) return false;
      return /WorkBuddy-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}$/i.test(dirName);
    }
    /**
     * 从 session JSONL 文件的前 N 行提取关键元数据。
     *
     * 读取策略：只读前 30 行（足够覆盖 ai-title 事件），避免大文件 IO。
     * 解析的事件类型：
     * - `message`（role=user/assistant）：提取 cwd
     * - `ai-title`：提取 aiTitle
     *
     * @returns 提取到的 cwd、aiTitle、model、时间戳范围
     */
    extractSessionInfoFromJsonl(jsonlPath) {
      const result = {
        cwd: void 0,
        aiTitle: void 0,
        model: void 0,
        firstTimestamp: void 0,
        lastTimestamp: void 0,
      };
      let customTitle;
      let foundAiTitle;
      let topicTitle;
      let firstUserMessage;
      try {
        const fd = fs.openSync(jsonlPath, "r");
        try {
          const fileSize = fs.fstatSync(fd).size;
          const headBufSize = 64 * 1024;
          const headBuf = Buffer.alloc(Math.min(headBufSize, fileSize));
          const headBytesRead = fs.readSync(fd, headBuf, 0, headBuf.length, 0);
          const headLines = headBuf
            .toString("utf-8", 0, headBytesRead)
            .split("\n");
          const headMaxLines = Math.min(headLines.length, 30);
          for (let i = 0; i < headMaxLines; i++) {
            const line = headLines[i].trim();
            if (!line) continue;
            try {
              const item = JSON.parse(line);
              const ts =
                typeof item.timestamp === "number" ? item.timestamp : void 0;
              if (ts) {
                if (!result.firstTimestamp) result.firstTimestamp = ts;
                result.lastTimestamp = ts;
              }
              if (!result.cwd && typeof item.cwd === "string" && item.cwd)
                result.cwd = item.cwd;
              if (
                !foundAiTitle &&
                item.type === "ai-title" &&
                typeof item.aiTitle === "string" &&
                item.aiTitle.trim()
              )
                foundAiTitle = item.aiTitle.trim();
              if (
                item.type === "custom-title" &&
                typeof item.customTitle === "string" &&
                item.customTitle.trim()
              )
                customTitle = item.customTitle.trim();
              if (
                !topicTitle &&
                item.type === "topic" &&
                typeof item.topic === "string" &&
                item.topic.trim()
              )
                topicTitle = item.topic.trim();
              if (!result.model && typeof item.model === "string")
                result.model = item.model;
              if (
                !firstUserMessage &&
                item.type === "message" &&
                item.role === "user"
              ) {
                const pd = item.providerData;
                if (
                  !pd?.skipRun &&
                  !pd?.isCompactInternal &&
                  pd?.agent !== "compact" &&
                  typeof pd?.teammateMessage?.from !== "string"
                )
                  firstUserMessage = this.extractUserMessageText(item.content);
              }
            } catch {}
          }
          if (!customTitle && fileSize > headBufSize) {
            const tailBufSize = 32 * 1024;
            const tailOffset = Math.max(0, fileSize - tailBufSize);
            const tailBuf = Buffer.alloc(
              Math.min(tailBufSize, fileSize - tailOffset),
            );
            const tailBytesRead = fs.readSync(
              fd,
              tailBuf,
              0,
              tailBuf.length,
              tailOffset,
            );
            const tailLines = tailBuf
              .toString("utf-8", 0, tailBytesRead)
              .split("\n");
            for (let i = tailLines.length - 1; i >= 0; i--) {
              const line = tailLines[i].trim();
              if (!line) continue;
              try {
                const item = JSON.parse(line);
                if (
                  item.type === "custom-title" &&
                  typeof item.customTitle === "string" &&
                  item.customTitle.trim()
                ) {
                  customTitle = item.customTitle.trim();
                  break;
                }
                if (
                  !foundAiTitle &&
                  item.type === "ai-title" &&
                  typeof item.aiTitle === "string" &&
                  item.aiTitle.trim()
                )
                  foundAiTitle = item.aiTitle.trim();
              } catch {}
            }
          }
        } finally {
          fs.closeSync(fd);
        }
      } catch {}
      const resolvedTitle = customTitle ?? foundAiTitle ?? topicTitle;
      if (resolvedTitle) result.aiTitle = resolvedTitle;
      else if (firstUserMessage)
        result.aiTitle =
          firstUserMessage.length > 50
            ? firstUserMessage.slice(0, 50) + "..."
            : firstUserMessage;
      return result;
    }
    /**
     * 从 jsonl message item 的 content 字段提取可读文本。
     * content 可能是 string 或 ContentBlock[]（OpenAI 格式）。
     *
     * 提取策略与 agent-cli 的 session-title-utils.ts getUserTitleText 对齐：
     * 1. 对 content 数组：优先使用 block.providerData.content（前端原始输入，无系统注入）
     * 2. 跳过 isSystemInternalMessage 类型的 block（纯系统上下文）
     * 3. 对 block.text 做 stripPromptContextXml 等清理
     */
    extractUserMessageText(content) {
      if (typeof content === "string")
        return this.stripContextAndExtractQuery(content);
      if (Array.isArray(content))
        for (const block of content) {
          if (typeof block === "string") {
            const extracted = this.stripContextAndExtractQuery(block);
            if (extracted) return extracted;
            continue;
          }
          if (block && typeof block === "object") {
            const b = block;
            if (b.type && b.type !== "input_text") continue;
            const text = b.text ?? b.input_text;
            if (typeof text !== "string" || !text.trim()) continue;
            if (text.includes("<image_local_path>")) continue;
            if (
              text.trimStart().startsWith("<system-reminder") &&
              !text.includes("<user_query>")
            )
              continue;
            const providerData = b.providerData;
            if (providerData && typeof providerData.content === "string") {
              const providerContent = providerData.content.trim();
              if (providerContent) return providerContent;
            }
            const extracted = this.stripContextAndExtractQuery(text);
            if (extracted) return extracted;
          }
        }
    }
    /**
     * 从用户消息文本中移除系统上下文标签，提取真正的用户查询。
     * 逻辑对齐 @genie/agent-client-protocol 的 stripPromptContextXml：
     * 1. 移除 <system-reminder>...</system-reminder> 整块
     * 2. 移除 <user_query> 标签但保留内部内容
     * 3. 移除其他已知系统标签（additional_data, user_info, cb_summary, rules 等）
     */
    stripContextAndExtractQuery(text) {
      if (!text || !text.trim()) return;
      let stripped = text.replace(
        /<system-reminder\b[^>]*>[\s\S]*?<\/system-reminder>\s*/g,
        "",
      );
      if (/<user_query>([\s\S]*?)<\/user_query>/g.test(stripped))
        stripped = stripped.replace(
          /<user_query>([\s\S]*?)<\/user_query>/g,
          "$1",
        );
      stripped = stripped
        .replace(/<additional_data>[\s\S]*?<\/additional_data>\s*/g, "")
        .replace(/<user_info>[\s\S]*?<\/user_info>\s*/g, "")
        .replace(/<cb_summary>[\s\S]*?<\/cb_summary>\s*/g, "")
        .replace(/<rules>[\s\S]*?<\/rules>\s*/g, "")
        .replace(/<content_policy>[\s\S]*?<\/content_policy>\s*/g, "")
        .replace(/<agent_skills>[\s\S]*?<\/agent_skills>\s*/g, "")
        .replace(
          /<always_applied_workspace_rules\b[^>]*>[\s\S]*?<\/always_applied_workspace_rules>\s*/g,
          "",
        )
        .replace(
          /<agent_requestable_workspace_rules\b[^>]*>[\s\S]*?<\/agent_requestable_workspace_rules>\s*/g,
          "",
        )
        .replace(/<project_context>[\s\S]*?<\/project_context>\s*/g, "")
        .replace(/<communication>[\s\S]*?<\/communication>\s*/g, "")
        .replace(/<tool_calling>[\s\S]*?<\/tool_calling>\s*/g, "")
        .replace(/<making_code_changes>[\s\S]*?<\/making_code_changes>\s*/g, "")
        .replace(/<response_language>[\s\S]*?<\/response_language>\s*/g, "")
        .replace(/<git_status>[\s\S]*?<\/git_status>\s*/g, "")
        .trim();
      return stripped || void 0;
    }
    /**
     * 获取 sidecar session history 的根目录路径。
     *
     * Session history 存储在 `~/.workbuddy/projects/<compressedCwd>/<sessionId>.jsonl`，
     * 不在 `~/.workbuddy/sessions/`（那里是 sidecar PID 文件）。
     */
    getSessionsHistoryDir() {
      const projectsDir = path.join(path.dirname(this.dbPath), "projects");
      if (fs.existsSync(projectsDir)) return projectsDir;
    }
    /**
     * 从文件系统冗余备份中恢复 automation 配置。
     * 当从损坏备份中无法抢救 automation 数据时使用。
     */
    recoverAutomationsFromFileBackup() {
      const backupDir = path.join(
        path.dirname(this.dbPath),
        WorkbuddyDatabaseService.AUTOMATION_BACKUP_DIR,
      );
      if (!fs.existsSync(backupDir)) return [];
      const automations = [];
      try {
        const files = fs
          .readdirSync(backupDir)
          .filter((f) => f.endsWith(".json"));
        for (const file of files)
          try {
            const content = fs.readFileSync(
              path.join(backupDir, file),
              "utf-8",
            );
            automations.push(JSON.parse(content));
          } catch {}
      } catch {}
      if (automations.length > 0)
        getDatabaseLogger().info(
          `Recovered ${automations.length} automations from file backup`,
        );
      return automations;
    }
    /**
     * 冗余备份 automation 到文件系统（best-effort）。
     *
     * SQLite 是主存储；文件备份只用于损坏恢复时兜底。业务写入路径不能因为
     * `mkdir/writeFile` 阻塞事件循环，所以这里先入队，稍后异步落盘。
     */
    queueAutomationFileBackup(automation) {
      this.pendingAutomationFileBackupRemovals.delete(automation.id);
      this.pendingAutomationFileBackups.set(
        automation.id,
        JSON.stringify(automation, null, 2),
      );
      this.scheduleAutomationFileBackupFlush();
    }
    scheduleAutomationFileBackupFlush() {
      if (this.automationFileBackupFlushTimer) return;
      this.automationFileBackupFlushTimer = setTimeout(() => {
        this.automationFileBackupFlushTimer = void 0;
        this.flushAutomationFileBackups().catch((err) => {
          getDatabaseLogger().warn(
            `Failed to flush automation backups: ${err instanceof Error ? err.message : String(err)}`,
          );
        });
      }, 0);
      this.automationFileBackupFlushTimer.unref?.();
    }
    async flushAutomationFileBackups() {
      if (this.automationFileBackupFlushRunning) return;
      this.automationFileBackupFlushRunning = true;
      try {
        while (
          this.pendingAutomationFileBackups.size > 0 ||
          this.pendingAutomationFileBackupRemovals.size > 0
        ) {
          const backups = Array.from(
            this.pendingAutomationFileBackups.entries(),
          );
          const removals = Array.from(this.pendingAutomationFileBackupRemovals);
          this.pendingAutomationFileBackups.clear();
          this.pendingAutomationFileBackupRemovals.clear();
          await this.applyAutomationFileBackupBatch(backups, removals);
        }
      } finally {
        this.automationFileBackupFlushRunning = false;
        if (
          this.pendingAutomationFileBackups.size > 0 ||
          this.pendingAutomationFileBackupRemovals.size > 0
        )
          this.scheduleAutomationFileBackupFlush();
      }
    }
    async applyAutomationFileBackupBatch(backups, removals) {
      const backupDir = path.join(
        path.dirname(this.dbPath),
        WorkbuddyDatabaseService.AUTOMATION_BACKUP_DIR,
      );
      await Promise.all(
        removals.map(async (id) => {
          try {
            await fs_promises.unlink(path.join(backupDir, `${id}.json`));
          } catch {}
        }),
      );
      if (backups.length === 0) return;
      try {
        await fs_promises.mkdir(backupDir, { recursive: true });
      } catch {
        return;
      }
      await Promise.all(
        backups.map(async ([id, payload]) => {
          try {
            await fs_promises.writeFile(
              path.join(backupDir, `${id}.json`),
              payload,
            );
          } catch {}
        }),
      );
    }
    /**
     * 删除 automation 文件系统备份（与 deleteAutomation 配合）。
     */
    queueAutomationFileBackupRemoval(id) {
      this.pendingAutomationFileBackups.delete(id);
      this.pendingAutomationFileBackupRemovals.add(id);
      this.scheduleAutomationFileBackupFlush();
    }
    /**
     * dispose 是同步生命周期钩子。退出前尽力把尚未执行的异步备份队列落盘；
     * 这仍然不影响正常业务 CRUD 路径。
     */
    flushAutomationFileBackupsSync() {
      if (this.automationFileBackupFlushTimer) {
        clearTimeout(this.automationFileBackupFlushTimer);
        this.automationFileBackupFlushTimer = void 0;
      }
      if (this.automationFileBackupFlushRunning) return;
      const backups = Array.from(this.pendingAutomationFileBackups.entries());
      const removals = Array.from(this.pendingAutomationFileBackupRemovals);
      this.pendingAutomationFileBackups.clear();
      this.pendingAutomationFileBackupRemovals.clear();
      if (backups.length === 0 && removals.length === 0) return;
      const backupDir = path.join(
        path.dirname(this.dbPath),
        WorkbuddyDatabaseService.AUTOMATION_BACKUP_DIR,
      );
      for (const id of removals)
        try {
          fs.unlinkSync(path.join(backupDir, `${id}.json`));
        } catch {}
      if (backups.length === 0) return;
      try {
        fs.mkdirSync(backupDir, { recursive: true });
      } catch {
        return;
      }
      for (const [id, payload] of backups)
        try {
          fs.writeFileSync(path.join(backupDir, `${id}.json`), payload);
        } catch {}
    }
    /**
     * 清理过期的备份文件，防止磁盘空间无限累积。
     *
     * 匹配模式：
     * - `.corrupt-<timestamp>`：全量损坏备份（由 backupCorruptedFiles 产生）
     *
     * 策略：保留最近 keepCount 组（同一时间戳为一组，含 .db/.wal/.shm），
     * 超出保留数量且超过 maxAgeDays 天的删除。
     *
     * 调用时机：initialize() 成功后。
     */
    pruneCorruptBackups(keepCount = 2, maxAgeDays = 7) {
      try {
        const dir = path.dirname(this.dbPath);
        const baseName = path.basename(this.dbPath);
        const entries = [];
        const backupPattern = /\.(corrupt|silent-loss)-/;
        for (const f of fs.readdirSync(dir)) {
          if (!f.startsWith(baseName) || !backupPattern.test(f)) continue;
          const fullPath = path.join(dir, f);
          try {
            const mtime = fs.statSync(fullPath).mtimeMs;
            entries.push({
              name: f,
              fullPath,
              mtime,
            });
          } catch {}
        }
        if (entries.length === 0) return;
        const timestampGroups = /* @__PURE__ */ new Map();
        for (const entry of entries) {
          const ts =
            entry.name.match(/\.(?:corrupt|silent-loss)-(.+)$/)?.[1] ?? "";
          if (!timestampGroups.has(ts)) timestampGroups.set(ts, []);
          timestampGroups.get(ts).push(entry);
        }
        const sortedGroups = [...timestampGroups.entries()].sort(
          (a, b) =>
            Math.max(...b[1].map((e) => e.mtime)) -
            Math.max(...a[1].map((e) => e.mtime)),
        );
        const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1e3;
        let kept = 0;
        for (const [, group] of sortedGroups) {
          if (kept < keepCount) {
            kept++;
            continue;
          }
          if (Math.max(...group.map((e) => e.mtime)) < cutoff)
            for (const entry of group)
              try {
                fs.unlinkSync(entry.fullPath);
                getDatabaseLogger().info(`Pruned old backup: ${entry.name}`);
              } catch {}
        }
      } catch (err) {
        getDatabaseLogger().warn(
          `Failed to prune backups: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  };
  if (deps.logger) DatabaseFileLogger.instance = deps.logger;
  return {
    WorkbuddyDatabaseService,
    AutomationRepository,
    AutomationDeliveryOutboxRepository,
    SessionUsageRepository,
    MigrationMetaRepository,
    BufferedFileLogger,
    DatabaseFileLogger,
    getDatabaseLogger,
    getGlobalDatabaseRef,
    registerGlobalDatabaseRef,
    cleanupGhostDataAfterWalCheckpoint,
    readLegacyVscdbSessionPayloads,
  };
}
