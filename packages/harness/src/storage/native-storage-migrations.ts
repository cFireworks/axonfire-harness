// @ts-nocheck
// Complete original schema adoption, schema, migration and connection regions.
import * as fs from "node:fs";
import * as path from "node:path";
export const STORAGE_MIGRATIONS_SHA256 =
  "528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19";
export const STORAGE_MIGRATIONS_RANGES = [
  ["drizzle/legacy-schema-adoption.ts", 75144, 90090],
  ["drizzle/schema.ts", 196050, 201954],
  ["drizzle/migrator.ts", 202041, 203230],
  ["sqlite/connection.ts", 203318, 203685],
  ["sqlite/runtime.ts", 241167, 241491],
] as const;
export function createNativeStorageMigrations(
  orm: any,
  BetterSQLite?: any,
): any {
  const {
    sql,
    drizzle,
    migrate,
    sqliteTable,
    text,
    integer,
    index,
    uniqueIndex,
    WORKBUDDY_SQLITE_MIGRATION_JOURNAL,
    WORKBUDDY_SQLITE_MIGRATION_FILES,
  } = orm;
  const better_sqlite3 = { default: BetterSQLite };
  // Bundle export adapter: retain lazy schema bindings and module identity.
  const require_chunk = {
    __exportAll(all: any) {
      const target: any = {};
      for (const name in all)
        Object.defineProperty(target, name, {
          get: all[name],
          enumerable: true,
        });
      Object.defineProperty(target, Symbol.toStringTag, { value: "Module" });
      return target;
    },
  };
  var CURRENT_REQUIRED_TABLE_COLUMNS = {
    sessions: [
      "id",
      "cwd",
      "user_id",
      "title",
      "custom_title",
      "status",
      "created_at",
      "updated_at",
      "last_activity_at",
      "deleted_at",
      "is_playground",
      "source_mode",
      "is_background_automation",
      "mode",
      "model",
      "expert_id",
      "expert_locale",
      "expert_runtime_identity",
      "expert_marketplace",
      "permission_mode",
      "use_sandbox_cli",
      "project_id",
      "plugin_context_json",
      "last_user_prompt_expert_selection",
    ],
    workspaces: ["path", "last_opened_at"],
    automations: [
      "id",
      "name",
      "prompt",
      "status",
      "schedule_type",
      "next_run_at",
      "last_run_at",
      "cwds",
      "rrule",
      "scheduled_at",
      "valid_from",
      "valid_until",
      "model_id",
      "model_is_thinking",
      "skills_json",
      "push_to_wechat",
      "push_to_wecom_bot",
      "wecom_bot_source",
      "owner_user_id",
      "owner_status",
      "owner_source",
      "expert_id",
      "expert_marketplace",
      "connector_ids_json",
      "permission_mode",
      "created_at",
      "updated_at",
      "deleted_at",
    ],
    automation_runs: [
      "thread_id",
      "automation_id",
      "status",
      "read_at",
      "thread_title",
      "source_cwd",
      "runs_json",
      "result_success",
      "metadata_json",
      "created_at",
      "updated_at",
    ],
    automation_runtime_state: [
      "automation_id",
      "last_run_at",
      "last_error",
      "running",
      "running_started_at",
      "running_conversation_id",
      "metadata_json",
    ],
    automation_delivery_outbox: [
      "id",
      "dedupe_key",
      "channel",
      "automation_id",
      "run_id",
      "automation_name",
      "owner_user_id",
      "host_id",
      "payload_json",
      "status",
      "attempt_count",
      "max_attempts",
      "next_run_at",
      "lease_owner",
      "lease_expire_at",
      "last_error_code",
      "last_error_message",
      "delivery_id",
      "created_at",
      "updated_at",
      "finished_at",
    ],
    migration_meta: ["key", "value"],
    session_usage: ["session_id", "used", "size", "updated_at", "credit_json"],
  };
  var LEGACY_SCHEMA_COLUMN_ADOPTIONS = {
    sessions: [
      {
        name: "cwd",
        addSql: "ALTER TABLE sessions ADD COLUMN cwd TEXT NOT NULL DEFAULT ''",
      },
      {
        name: "user_id",
        addSql:
          "ALTER TABLE sessions ADD COLUMN user_id TEXT NOT NULL DEFAULT ''",
      },
      {
        name: "title",
        addSql: "ALTER TABLE sessions ADD COLUMN title TEXT",
      },
      {
        name: "custom_title",
        addSql: "ALTER TABLE sessions ADD COLUMN custom_title TEXT",
      },
      {
        name: "status",
        addSql:
          "ALTER TABLE sessions ADD COLUMN status TEXT NOT NULL DEFAULT 'Pending'",
      },
      {
        name: "created_at",
        addSql:
          "ALTER TABLE sessions ADD COLUMN created_at INTEGER NOT NULL DEFAULT 0",
      },
      {
        name: "updated_at",
        addSql:
          "ALTER TABLE sessions ADD COLUMN updated_at INTEGER NOT NULL DEFAULT 0",
      },
      {
        name: "last_activity_at",
        addSql: "ALTER TABLE sessions ADD COLUMN last_activity_at INTEGER",
      },
      {
        name: "deleted_at",
        addSql: "ALTER TABLE sessions ADD COLUMN deleted_at INTEGER",
      },
      {
        name: "is_playground",
        addSql:
          "ALTER TABLE sessions ADD COLUMN is_playground INTEGER NOT NULL DEFAULT 0",
      },
      {
        name: "source_mode",
        addSql: "ALTER TABLE sessions ADD COLUMN source_mode TEXT",
      },
      {
        name: "is_background_automation",
        addSql:
          "ALTER TABLE sessions ADD COLUMN is_background_automation INTEGER",
      },
      {
        name: "mode",
        addSql: "ALTER TABLE sessions ADD COLUMN mode TEXT",
      },
      {
        name: "model",
        addSql: "ALTER TABLE sessions ADD COLUMN model TEXT",
      },
      {
        name: "expert_id",
        addSql: "ALTER TABLE sessions ADD COLUMN expert_id TEXT",
      },
      {
        name: "expert_locale",
        addSql: "ALTER TABLE sessions ADD COLUMN expert_locale TEXT",
      },
      {
        name: "expert_runtime_identity",
        addSql: "ALTER TABLE sessions ADD COLUMN expert_runtime_identity TEXT",
      },
      {
        name: "expert_marketplace",
        addSql: "ALTER TABLE sessions ADD COLUMN expert_marketplace TEXT",
      },
      {
        name: "permission_mode",
        addSql: "ALTER TABLE sessions ADD COLUMN permission_mode TEXT",
      },
      {
        name: "use_sandbox_cli",
        addSql: "ALTER TABLE sessions ADD COLUMN use_sandbox_cli INTEGER",
      },
      {
        name: "project_id",
        addSql: "ALTER TABLE sessions ADD COLUMN project_id TEXT",
      },
    ],
    workspaces: [
      {
        name: "last_opened_at",
        addSql:
          "ALTER TABLE workspaces ADD COLUMN last_opened_at INTEGER NOT NULL DEFAULT 0",
      },
    ],
    automations: [
      {
        name: "name",
        addSql:
          "ALTER TABLE automations ADD COLUMN name TEXT NOT NULL DEFAULT ''",
      },
      {
        name: "prompt",
        addSql:
          "ALTER TABLE automations ADD COLUMN prompt TEXT NOT NULL DEFAULT ''",
      },
      {
        name: "status",
        addSql:
          "ALTER TABLE automations ADD COLUMN status TEXT NOT NULL DEFAULT 'enabled'",
      },
      {
        name: "schedule_type",
        addSql:
          "ALTER TABLE automations ADD COLUMN schedule_type TEXT NOT NULL DEFAULT 'recurring'",
      },
      {
        name: "next_run_at",
        addSql: "ALTER TABLE automations ADD COLUMN next_run_at INTEGER",
      },
      {
        name: "last_run_at",
        addSql: "ALTER TABLE automations ADD COLUMN last_run_at INTEGER",
      },
      {
        name: "cwds",
        addSql:
          "ALTER TABLE automations ADD COLUMN cwds TEXT NOT NULL DEFAULT '[]'",
      },
      {
        name: "rrule",
        addSql:
          "ALTER TABLE automations ADD COLUMN rrule TEXT NOT NULL DEFAULT ''",
      },
      {
        name: "scheduled_at",
        addSql: "ALTER TABLE automations ADD COLUMN scheduled_at TEXT",
      },
      {
        name: "valid_from",
        addSql: "ALTER TABLE automations ADD COLUMN valid_from TEXT",
      },
      {
        name: "valid_until",
        addSql: "ALTER TABLE automations ADD COLUMN valid_until TEXT",
      },
      {
        name: "model_id",
        addSql: "ALTER TABLE automations ADD COLUMN model_id TEXT",
      },
      {
        name: "model_is_thinking",
        addSql:
          "ALTER TABLE automations ADD COLUMN model_is_thinking INTEGER NOT NULL DEFAULT 0",
      },
      {
        name: "skills_json",
        addSql:
          "ALTER TABLE automations ADD COLUMN skills_json TEXT NOT NULL DEFAULT '[]'",
      },
      {
        name: "push_to_wechat",
        addSql:
          "ALTER TABLE automations ADD COLUMN push_to_wechat INTEGER NOT NULL DEFAULT 0",
      },
      {
        name: "push_to_wecom_bot",
        addSql:
          "ALTER TABLE automations ADD COLUMN push_to_wecom_bot INTEGER NOT NULL DEFAULT 0",
      },
      {
        name: "wecom_bot_source",
        addSql: "ALTER TABLE automations ADD COLUMN wecom_bot_source TEXT",
      },
      {
        name: "owner_user_id",
        addSql: "ALTER TABLE automations ADD COLUMN owner_user_id TEXT",
      },
      {
        name: "owner_status",
        addSql:
          "ALTER TABLE automations ADD COLUMN owner_status TEXT NOT NULL DEFAULT 'legacy_unassigned'",
      },
      {
        name: "owner_source",
        addSql: "ALTER TABLE automations ADD COLUMN owner_source TEXT",
      },
      {
        name: "expert_id",
        addSql: "ALTER TABLE automations ADD COLUMN expert_id TEXT",
      },
      {
        name: "expert_marketplace",
        addSql: "ALTER TABLE automations ADD COLUMN expert_marketplace TEXT",
      },
      {
        name: "connector_ids_json",
        addSql:
          "ALTER TABLE automations ADD COLUMN connector_ids_json TEXT NOT NULL DEFAULT '[]'",
      },
      {
        name: "permission_mode",
        addSql: "ALTER TABLE automations ADD COLUMN permission_mode TEXT",
      },
      {
        name: "created_at",
        addSql:
          "ALTER TABLE automations ADD COLUMN created_at INTEGER NOT NULL DEFAULT 0",
      },
      {
        name: "updated_at",
        addSql:
          "ALTER TABLE automations ADD COLUMN updated_at INTEGER NOT NULL DEFAULT 0",
      },
      {
        name: "deleted_at",
        addSql: "ALTER TABLE automations ADD COLUMN deleted_at INTEGER",
      },
    ],
    automation_runs: [
      {
        name: "automation_id",
        addSql:
          "ALTER TABLE automation_runs ADD COLUMN automation_id TEXT NOT NULL DEFAULT ''",
      },
      {
        name: "status",
        addSql:
          "ALTER TABLE automation_runs ADD COLUMN status TEXT NOT NULL DEFAULT ''",
      },
      {
        name: "read_at",
        addSql: "ALTER TABLE automation_runs ADD COLUMN read_at INTEGER",
      },
      {
        name: "thread_title",
        addSql: "ALTER TABLE automation_runs ADD COLUMN thread_title TEXT",
      },
      {
        name: "source_cwd",
        addSql: "ALTER TABLE automation_runs ADD COLUMN source_cwd TEXT",
      },
      {
        name: "runs_json",
        addSql: "ALTER TABLE automation_runs ADD COLUMN runs_json TEXT",
      },
      {
        name: "result_success",
        addSql: "ALTER TABLE automation_runs ADD COLUMN result_success INTEGER",
      },
      {
        name: "metadata_json",
        addSql: "ALTER TABLE automation_runs ADD COLUMN metadata_json TEXT",
      },
      {
        name: "created_at",
        addSql:
          "ALTER TABLE automation_runs ADD COLUMN created_at INTEGER NOT NULL DEFAULT 0",
      },
      {
        name: "updated_at",
        addSql:
          "ALTER TABLE automation_runs ADD COLUMN updated_at INTEGER NOT NULL DEFAULT 0",
      },
    ],
    automation_runtime_state: [
      {
        name: "last_run_at",
        addSql:
          "ALTER TABLE automation_runtime_state ADD COLUMN last_run_at INTEGER",
      },
      {
        name: "last_error",
        addSql:
          "ALTER TABLE automation_runtime_state ADD COLUMN last_error TEXT",
      },
      {
        name: "running",
        addSql:
          "ALTER TABLE automation_runtime_state ADD COLUMN running INTEGER NOT NULL DEFAULT 0",
      },
      {
        name: "running_started_at",
        addSql:
          "ALTER TABLE automation_runtime_state ADD COLUMN running_started_at INTEGER",
      },
      {
        name: "running_conversation_id",
        addSql:
          "ALTER TABLE automation_runtime_state ADD COLUMN running_conversation_id TEXT",
      },
      {
        name: "metadata_json",
        addSql:
          "ALTER TABLE automation_runtime_state ADD COLUMN metadata_json TEXT",
      },
    ],
    automation_delivery_outbox: [
      {
        name: "dedupe_key",
        addSql:
          "ALTER TABLE automation_delivery_outbox ADD COLUMN dedupe_key TEXT NOT NULL DEFAULT ''",
      },
      {
        name: "channel",
        addSql:
          "ALTER TABLE automation_delivery_outbox ADD COLUMN channel TEXT NOT NULL DEFAULT 'wechatmp'",
      },
      {
        name: "automation_id",
        addSql:
          "ALTER TABLE automation_delivery_outbox ADD COLUMN automation_id TEXT NOT NULL DEFAULT ''",
      },
      {
        name: "run_id",
        addSql:
          "ALTER TABLE automation_delivery_outbox ADD COLUMN run_id TEXT NOT NULL DEFAULT ''",
      },
      {
        name: "automation_name",
        addSql:
          "ALTER TABLE automation_delivery_outbox ADD COLUMN automation_name TEXT NOT NULL DEFAULT ''",
      },
      {
        name: "owner_user_id",
        addSql:
          "ALTER TABLE automation_delivery_outbox ADD COLUMN owner_user_id TEXT",
      },
      {
        name: "host_id",
        addSql:
          "ALTER TABLE automation_delivery_outbox ADD COLUMN host_id TEXT",
      },
      {
        name: "payload_json",
        addSql:
          "ALTER TABLE automation_delivery_outbox ADD COLUMN payload_json TEXT NOT NULL DEFAULT '{}'",
      },
      {
        name: "status",
        addSql:
          "ALTER TABLE automation_delivery_outbox ADD COLUMN status TEXT NOT NULL DEFAULT 'pending'",
      },
      {
        name: "attempt_count",
        addSql:
          "ALTER TABLE automation_delivery_outbox ADD COLUMN attempt_count INTEGER NOT NULL DEFAULT 0",
      },
      {
        name: "max_attempts",
        addSql:
          "ALTER TABLE automation_delivery_outbox ADD COLUMN max_attempts INTEGER NOT NULL DEFAULT 5",
      },
      {
        name: "next_run_at",
        addSql:
          "ALTER TABLE automation_delivery_outbox ADD COLUMN next_run_at INTEGER NOT NULL DEFAULT 0",
      },
      {
        name: "lease_owner",
        addSql:
          "ALTER TABLE automation_delivery_outbox ADD COLUMN lease_owner TEXT",
      },
      {
        name: "lease_expire_at",
        addSql:
          "ALTER TABLE automation_delivery_outbox ADD COLUMN lease_expire_at INTEGER",
      },
      {
        name: "last_error_code",
        addSql:
          "ALTER TABLE automation_delivery_outbox ADD COLUMN last_error_code TEXT",
      },
      {
        name: "last_error_message",
        addSql:
          "ALTER TABLE automation_delivery_outbox ADD COLUMN last_error_message TEXT",
      },
      {
        name: "delivery_id",
        addSql:
          "ALTER TABLE automation_delivery_outbox ADD COLUMN delivery_id TEXT",
      },
      {
        name: "created_at",
        addSql:
          "ALTER TABLE automation_delivery_outbox ADD COLUMN created_at INTEGER NOT NULL DEFAULT 0",
      },
      {
        name: "updated_at",
        addSql:
          "ALTER TABLE automation_delivery_outbox ADD COLUMN updated_at INTEGER NOT NULL DEFAULT 0",
      },
      {
        name: "finished_at",
        addSql:
          "ALTER TABLE automation_delivery_outbox ADD COLUMN finished_at INTEGER",
      },
    ],
    migration_meta: [
      {
        name: "value",
        addSql:
          "ALTER TABLE migration_meta ADD COLUMN value TEXT NOT NULL DEFAULT ''",
      },
    ],
    session_usage: [
      {
        name: "used",
        addSql:
          "ALTER TABLE session_usage ADD COLUMN used INTEGER NOT NULL DEFAULT 0",
      },
      {
        name: "size",
        addSql:
          "ALTER TABLE session_usage ADD COLUMN size INTEGER NOT NULL DEFAULT 0",
      },
      {
        name: "updated_at",
        addSql:
          "ALTER TABLE session_usage ADD COLUMN updated_at INTEGER NOT NULL DEFAULT 0",
      },
      {
        name: "credit_json",
        addSql: "ALTER TABLE session_usage ADD COLUMN credit_json TEXT",
      },
    ],
  };
  function adoptLegacyWorkbuddySqliteSchema(db) {
    for (const [tableName, columnMigrations] of Object.entries(
      LEGACY_SCHEMA_COLUMN_ADOPTIONS,
    )) {
      if (!hasTable(db, tableName)) continue;
      runGuardedColumnMigrations(db, tableName, columnMigrations);
    }
  }
  function ensureSessionUsageTableSchema(db) {
    db.exec(`
        CREATE TABLE IF NOT EXISTS session_usage (
            session_id TEXT PRIMARY KEY,
            used INTEGER NOT NULL,
            size INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            credit_json TEXT
        );
    `);
    runGuardedColumnMigrations(
      db,
      "session_usage",
      LEGACY_SCHEMA_COLUMN_ADOPTIONS.session_usage,
    );
    assertTableColumns(
      db,
      "session_usage",
      CURRENT_REQUIRED_TABLE_COLUMNS.session_usage,
    );
  }
  function assertWorkbuddySqliteSchema(db) {
    const missing = [];
    for (const [tableName, requiredColumns] of Object.entries(
      CURRENT_REQUIRED_TABLE_COLUMNS,
    ))
      missing.push(...getMissingTableColumns(db, tableName, requiredColumns));
    if (missing.length > 0)
      throw new Error(
        `[WorkBuddySQLite] schema migration incomplete; missing ${missing.join(", ")}`,
      );
  }
  function getAutomationRunsRunsJsonColumnType(db) {
    return getColumnDeclaredType(db, "automation_runs", "runs_json");
  }
  function runGuardedColumnMigrations(db, tableName, columnMigrations) {
    const existingColumns = getColumnSet(db, tableName);
    for (const column of columnMigrations)
      if (!existingColumns.has(column.name)) db.exec(column.addSql);
  }
  function assertTableColumns(db, tableName, requiredColumns) {
    const missing = getMissingTableColumns(db, tableName, requiredColumns);
    if (missing.length > 0)
      throw new Error(
        `[WorkBuddySQLite] schema migration incomplete; missing ${missing.join(", ")}`,
      );
  }
  function getMissingTableColumns(db, tableName, requiredColumns) {
    if (!hasTable(db, tableName)) return [`${tableName}.*`];
    const existingColumns = getColumnSet(db, tableName);
    return requiredColumns
      .filter((columnName) => !existingColumns.has(columnName))
      .map((columnName) => `${tableName}.${columnName}`);
  }
  function hasTable(db, tableName) {
    const row = db
      .prepare(
        "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1",
      )
      .get(tableName);
    return Boolean(row);
  }
  function getColumnSet(db, tableName) {
    const rows = db.prepare(`PRAGMA table_info(${tableName})`).all();
    return new Set(
      rows.map((row) => row.name).filter((name) => typeof name === "string"),
    );
  }
  function getColumnDeclaredType(db, tableName, columnName) {
    const rows = db.prepare(`PRAGMA table_info(${tableName})`).all();
    for (const row of rows)
      if (String(row.name ?? "") === columnName)
        return String(row.type ?? "").trim() || void 0;
  }

  var schema_exports = /* @__PURE__ */ require_chunk.__exportAll({
    automationDeliveryOutbox: () => automationDeliveryOutbox,
    automationRuns: () => automationRuns,
    automationRuntimeState: () => automationRuntimeState,
    automations: () => automations,
    migrationMeta: () => migrationMeta,
    sessionUsage: () => sessionUsage,
    sessions: () => sessions,
    workspaces: () => workspaces,
  });
  var sessions = sqliteTable("sessions", {
    id: text("id").primaryKey(),
    cwd: text("cwd").notNull(),
    userId: text("user_id").notNull(),
    title: text("title"),
    customTitle: text("custom_title"),
    status: text("status").notNull().default("Pending"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
    lastActivityAt: integer("last_activity_at"),
    deletedAt: integer("deleted_at"),
    isPlayground: integer("is_playground").notNull().default(0),
    sourceMode: text("source_mode"),
    isBackgroundAutomation: integer("is_background_automation"),
    mode: text("mode"),
    model: text("model"),
    expertId: text("expert_id"),
    expertLocale: text("expert_locale"),
    expertRuntimeIdentity: text("expert_runtime_identity"),
    expertMarketplace: text("expert_marketplace"),
    lastUserPromptExpertSelectionJson: text(
      "last_user_prompt_expert_selection",
    ),
    permissionMode: text("permission_mode"),
    useSandboxCli: integer("use_sandbox_cli"),
    projectId: text("project_id"),
    pluginContextJson: text("plugin_context_json"),
  });
  var workspaces = sqliteTable("workspaces", {
    path: text("path").primaryKey(),
    lastOpenedAt: integer("last_opened_at").notNull(),
  });
  var automations = sqliteTable(
    "automations",
    {
      id: text("id").primaryKey(),
      name: text("name").notNull(),
      prompt: text("prompt").notNull(),
      status: text("status").notNull(),
      scheduleType: text("schedule_type").notNull().default("recurring"),
      nextRunAt: integer("next_run_at"),
      lastRunAt: integer("last_run_at"),
      cwds: text("cwds").notNull().default("[]"),
      rrule: text("rrule").notNull().default(""),
      scheduledAt: text("scheduled_at"),
      validFrom: text("valid_from"),
      validUntil: text("valid_until"),
      modelId: text("model_id"),
      modelIsThinking: integer("model_is_thinking").notNull().default(0),
      skillsJson: text("skills_json").notNull().default("[]"),
      pushToWeChat: integer("push_to_wechat").notNull().default(0),
      pushToWecomBot: integer("push_to_wecom_bot").notNull().default(0),
      wecomBotSource: text("wecom_bot_source"),
      ownerUserId: text("owner_user_id"),
      ownerStatus: text("owner_status").notNull().default("legacy_unassigned"),
      ownerSource: text("owner_source"),
      expertId: text("expert_id"),
      expertMarketplace: text("expert_marketplace"),
      connectorIdsJson: text("connector_ids_json").notNull().default("[]"),
      permissionMode: text("permission_mode"),
      createdAt: integer("created_at").notNull(),
      updatedAt: integer("updated_at").notNull(),
      deletedAt: integer("deleted_at"),
    },
    (table) => ({
      owner: index("idx_automations_owner").on(
        table.ownerUserId,
        table.ownerStatus,
        table.deletedAt,
      ),
    }),
  );
  var automationRuns = sqliteTable("automation_runs", {
    threadId: text("thread_id").primaryKey(),
    automationId: text("automation_id").notNull(),
    status: text("status").notNull(),
    readAt: integer("read_at"),
    threadTitle: text("thread_title"),
    sourceCwd: text("source_cwd"),
    runsJson: text("runs_json"),
    resultSuccess: integer("result_success"),
    metadataJson: text("metadata_json"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  });
  var automationRuntimeState = sqliteTable("automation_runtime_state", {
    automationId: text("automation_id").primaryKey(),
    lastRunAt: integer("last_run_at"),
    lastError: text("last_error"),
    running: integer("running").notNull().default(0),
    runningStartedAt: integer("running_started_at"),
    runningConversationId: text("running_conversation_id"),
    metadataJson: text("metadata_json"),
  });
  var automationDeliveryOutbox = sqliteTable(
    "automation_delivery_outbox",
    {
      id: text("id").primaryKey(),
      dedupeKey: text("dedupe_key").notNull(),
      channel: text("channel").notNull().default("wechatmp"),
      automationId: text("automation_id").notNull(),
      runId: text("run_id").notNull(),
      automationName: text("automation_name").notNull(),
      ownerUserId: text("owner_user_id"),
      hostId: text("host_id"),
      payloadJson: text("payload_json").notNull(),
      status: text("status").notNull(),
      attemptCount: integer("attempt_count").notNull().default(0),
      maxAttempts: integer("max_attempts").notNull().default(5),
      nextRunAt: integer("next_run_at").notNull(),
      leaseOwner: text("lease_owner"),
      leaseExpireAt: integer("lease_expire_at"),
      lastErrorCode: text("last_error_code"),
      lastErrorMessage: text("last_error_message"),
      deliveryId: text("delivery_id"),
      createdAt: integer("created_at").notNull(),
      updatedAt: integer("updated_at").notNull(),
      finishedAt: integer("finished_at"),
    },
    (table) => ({
      dedupe: uniqueIndex("automation_delivery_outbox_dedupe_key_unique").on(
        table.dedupeKey,
      ),
      statusNextRun: index("idx_automation_delivery_outbox_status_next_run").on(
        table.status,
        table.nextRunAt,
      ),
      channelStatusNextRun: index(
        "idx_automation_delivery_outbox_channel_status_next_run",
      ).on(table.channel, table.status, table.nextRunAt),
      run: index("idx_automation_delivery_outbox_run").on(
        table.automationId,
        table.runId,
      ),
      ownerStatus: index("idx_automation_delivery_outbox_owner_status").on(
        table.ownerUserId,
        table.status,
      ),
      supersedeLookup: index(
        "idx_automation_delivery_outbox_supersede_lookup",
      ).on(
        table.automationId,
        table.channel,
        table.ownerUserId,
        table.hostId,
        table.createdAt,
      ),
    }),
  );
  var migrationMeta = sqliteTable("migration_meta", {
    key: text("key").primaryKey(),
    value: text("value").notNull(),
  });
  var sessionUsage = sqliteTable("session_usage", {
    sessionId: text("session_id").primaryKey(),
    used: integer("used").notNull(),
    size: integer("size").notNull(),
    updatedAt: integer("updated_at").notNull(),
    creditJson: text("credit_json"),
  });

  var WORKBUDDY_DRIZZLE_MIGRATIONS_TABLE = "__workbuddy_drizzle_migrations";
  function runWorkbuddyDrizzleMigrations(db, options) {
    adoptLegacyWorkbuddySqliteSchema(db);
    const migrationsFolder = materializeWorkbuddySqliteMigrations(
      options.configDir,
    );
    migrate(
      drizzle({
        client: db,
        schema: schema_exports,
      }),
      {
        migrationsFolder,
        migrationsTable: WORKBUDDY_DRIZZLE_MIGRATIONS_TABLE,
      },
    );
    assertWorkbuddySqliteSchema(db);
  }
  function materializeWorkbuddySqliteMigrations(configDir) {
    const migrationsFolder = path.join(
      configDir,
      ".workbuddy-sqlite-migrations",
    );
    const metaFolder = path.join(migrationsFolder, "meta");
    fs.mkdirSync(metaFolder, { recursive: true });
    writeFileIfChanged(
      path.join(metaFolder, "_journal.json"),
      `${JSON.stringify(WORKBUDDY_SQLITE_MIGRATION_JOURNAL, null, 2)}\n`,
    );
    for (const [fileName, content] of Object.entries(
      WORKBUDDY_SQLITE_MIGRATION_FILES,
    ))
      writeFileIfChanged(path.join(migrationsFolder, fileName), content);
    return migrationsFolder;
  }
  function writeFileIfChanged(filePath, content) {
    try {
      if (
        fs.existsSync(filePath) &&
        fs.readFileSync(filePath, "utf8") === content
      )
        return;
    } catch {}
    fs.writeFileSync(filePath, content, "utf8");
  }

  function openWorkbuddyRawSqliteDatabase(file, options) {
    return new better_sqlite3.default(file, options);
  }
  function createWorkbuddyDrizzleDatabase(rawDb) {
    return drizzle({
      client: rawDb,
      schema: schema_exports,
    });
  }
  function asBetterSqliteDatabase(rawDb) {
    return rawDb;
  }
  function excludedColumn(columnName) {
    return sql.raw(`excluded.${columnName}`);
  }

  var WORKBUDDY_SQLITE_BUSY_TIMEOUT_MS = 1e4;
  var WORKBUDDY_SQLITE_AUTO_CHECKPOINT_PAGES = 1e3;
  function configureWorkbuddySqliteConnection(db) {
    db.pragma("journal_mode = WAL");
    db.pragma(`busy_timeout = ${WORKBUDDY_SQLITE_BUSY_TIMEOUT_MS}`);
    db.pragma(`wal_autocheckpoint = ${WORKBUDDY_SQLITE_AUTO_CHECKPOINT_PAGES}`);
  }

  return {
    runWorkbuddyDrizzleMigrations,
    materializeWorkbuddySqliteMigrations,
    adoptLegacyWorkbuddySqliteSchema,
    assertWorkbuddySqliteSchema,
    ensureSessionUsageTableSchema,
    getAutomationRunsRunsJsonColumnType,
    configureWorkbuddySqliteConnection,
    openWorkbuddyRawSqliteDatabase,
    createWorkbuddyDrizzleDatabase,
    asBetterSqliteDatabase,
    schema_exports,
    CURRENT_REQUIRED_TABLE_COLUMNS,
    WORKBUDDY_DRIZZLE_MIGRATIONS_TABLE,
  };
}
