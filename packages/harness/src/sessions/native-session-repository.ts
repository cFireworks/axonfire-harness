// @ts-nocheck
// Complete original repository, table declarations and local helpers.
import * as path from "node:path";
import { createNativeSessionAddons } from "./native-session-addons.js";
export const SESSION_REPOSITORY_SHA256 =
  "528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19";
export const SESSION_REPOSITORY_DECLARATIONS = [
  ["SessionRepository", 230854, 239825],
  ["sessions", 196434, 197477],
  ["workspaces", 197478, 197611],
  ["canonicalizeStoredPath", 204307, 204391],
  ["excludedColumn", 203602, 203684],
  ["escapeSqliteLikePattern", 230097, 230197],
  ["parseLastUserPromptExpertSelection", 230198, 230853],
] as const;
export function createNativeSessionRepository(orm: any): any {
  const {
    sql,
    eq,
    or,
    and,
    isNull,
    desc,
    inArray,
    sqliteTable,
    text,
    integer,
  } = orm;
  const { parseSessionPluginContextJson, serializeSessionPluginContext } =
    createNativeSessionAddons();
  var SessionRepository = class {
    constructor(getDb) {
      this.getDb = getDb;
    }
    upsert(session) {
      const db = this.getDb();
      const canonicalCwd = canonicalizeStoredPath(session.cwd);
      const model =
        typeof session.model === "string" && session.model.trim().length === 0
          ? void 0
          : session.model;
      db.insert(sessions)
        .values({
          id: session.id,
          cwd: canonicalCwd,
          userId: session.userId,
          title: session.title ?? null,
          customTitle: session.customTitle ?? null,
          status: session.status,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          lastActivityAt: session.lastActivityAt ?? null,
          deletedAt: session.deletedAt ?? null,
          isPlayground: session.isPlayground ? 1 : 0,
          sourceMode: session.sourceMode ?? null,
          isBackgroundAutomation: session.isBackgroundAutomation ? 1 : null,
          mode: session.mode ?? null,
          model: model ?? null,
          expertId: session.expertId ?? null,
          expertLocale: session.expertLocale ?? null,
          expertRuntimeIdentity: session.expertRuntimeIdentity ?? null,
          expertMarketplace: session.expertMarketplace ?? null,
          lastUserPromptExpertSelectionJson:
            session.lastUserPromptExpertSelection
              ? JSON.stringify(session.lastUserPromptExpertSelection)
              : null,
          permissionMode: session.permissionMode ?? null,
          useSandboxCli:
            session.useSandboxCLI === true
              ? 1
              : session.useSandboxCLI === false
                ? 0
                : null,
          projectId: session.projectId ?? null,
          pluginContextJson: session.pluginContext
            ? serializeSessionPluginContext(session.pluginContext)
            : null,
        })
        .onConflictDoUpdate({
          target: sessions.id,
          set: {
            cwd: excludedColumn("cwd"),
            userId: sql`CASE
                    WHEN ${sessions.userId} IS NOT NULL AND ${sessions.userId} != '' THEN ${sessions.userId}
                    ELSE ${excludedColumn("user_id")}
                END`,
            title: sql`COALESCE(${excludedColumn("title")}, ${sessions.title})`,
            customTitle: sql`COALESCE(${excludedColumn("custom_title")}, ${sessions.customTitle})`,
            status: sql`CASE
                    WHEN LOWER(${sessions.status}) = 'archived' THEN ${sessions.status}
                    ELSE ${excludedColumn("status")}
                END`,
            createdAt: excludedColumn("created_at"),
            updatedAt: excludedColumn("updated_at"),
            lastActivityAt: sql`COALESCE(${excludedColumn("last_activity_at")}, ${sessions.lastActivityAt})`,
            deletedAt: excludedColumn("deleted_at"),
            isPlayground: sql`CASE
                    WHEN ${sessions.isPlayground} = 0 THEN 0
                    ELSE ${excludedColumn("is_playground")}
                END`,
            sourceMode: sql`COALESCE(${excludedColumn("source_mode")}, ${sessions.sourceMode})`,
            isBackgroundAutomation: sql`COALESCE(${excludedColumn("is_background_automation")}, ${sessions.isBackgroundAutomation})`,
            mode: sql`COALESCE(${excludedColumn("mode")}, ${sessions.mode})`,
            model: sql`COALESCE(${excludedColumn("model")}, ${sessions.model})`,
            expertId: sql`COALESCE(${excludedColumn("expert_id")}, ${sessions.expertId})`,
            expertLocale: sql`COALESCE(${excludedColumn("expert_locale")}, ${sessions.expertLocale})`,
            expertRuntimeIdentity: sql`COALESCE(${excludedColumn("expert_runtime_identity")}, ${sessions.expertRuntimeIdentity})`,
            expertMarketplace: sql`COALESCE(${excludedColumn("expert_marketplace")}, ${sessions.expertMarketplace})`,
            lastUserPromptExpertSelectionJson: sql`COALESCE(${excludedColumn("last_user_prompt_expert_selection")}, ${sessions.lastUserPromptExpertSelectionJson})`,
            permissionMode: sql`COALESCE(${excludedColumn("permission_mode")}, ${sessions.permissionMode})`,
            useSandboxCli: sql`COALESCE(${excludedColumn("use_sandbox_cli")}, ${sessions.useSandboxCli})`,
            projectId: sql`COALESCE(${excludedColumn("project_id")}, ${sessions.projectId})`,
            pluginContextJson: sql`COALESCE(${excludedColumn("plugin_context_json")}, ${sessions.pluginContextJson})`,
          },
        })
        .run();
      if (!session.isPlayground)
        this.upsertWorkspace(canonicalCwd, session.updatedAt);
    }
    updateStatus(id, status, updatedAt) {
      const result = this.getDb()
        .update(sessions)
        .set({
          status,
          updatedAt,
        })
        .where(eq(sessions.id, id))
        .run();
      return Number(result?.changes ?? 0);
    }
    updatePermissionMode(id, permissionMode) {
      const result = this.getDb()
        .update(sessions)
        .set({
          permissionMode,
          updatedAt: Date.now(),
        })
        .where(eq(sessions.id, id))
        .run();
      return Number(result?.changes ?? 0);
    }
    get(id) {
      const row = this.getDb()
        .select()
        .from(sessions)
        .where(eq(sessions.id, id))
        .limit(1)
        .get();
      return row ? this.mapRow(row) : void 0;
    }
    list(filter) {
      if (!filter?.userId) {
        console.log(
          "[WorkbuddyDatabaseService] getSessions: no userId provided, returning empty",
        );
        return [];
      }
      const userFilter = or(
        eq(sessions.userId, filter.userId),
        isNull(sessions.userId),
        eq(sessions.userId, ""),
      );
      const whereClause = filter?.includeDeleted
        ? userFilter
        : and(userFilter, isNull(sessions.deletedAt));
      const rows = this.getDb()
        .select()
        .from(sessions)
        .where(whereClause)
        .orderBy(desc(sessions.updatedAt))
        .all();
      console.log(
        `[WorkbuddyDatabaseService] getSessions: userId=${filter.userId}, rows=${rows.length}`,
      );
      return rows.map((row) => this.mapRow(row));
    }
    getLatestByCwdSuffix(cwdSuffix, userId) {
      const cwdPattern = `%${escapeSqliteLikePattern(cwdSuffix)}`;
      const row = this.getDb()
        .select()
        .from(sessions)
        .where(
          and(
            sql`${sessions.cwd} LIKE ${cwdPattern} ESCAPE ${"\\"}`,
            or(
              eq(sessions.userId, userId),
              isNull(sessions.userId),
              eq(sessions.userId, ""),
            ),
            isNull(sessions.deletedAt),
          ),
        )
        .orderBy(desc(sessions.updatedAt))
        .limit(1)
        .get();
      return row ? this.mapRow(row) : void 0;
    }
    fixNonTerminal(terminatedAt = Date.now()) {
      const result = this.getDb()
        .update(sessions)
        .set({
          status: "Terminated",
          updatedAt: terminatedAt,
        })
        .where(
          sql`LOWER(${sessions.status}) NOT IN ('completed', 'failed', 'terminated', 'archived')`,
        )
        .run();
      return Number(result?.changes ?? 0);
    }
    delete(id, deletedAt = Date.now()) {
      this.getDb()
        .update(sessions)
        .set({
          deletedAt,
          updatedAt: deletedAt,
        })
        .where(eq(sessions.id, id))
        .run();
    }
    upsertWorkspace(workspacePath, lastOpenedAt = Date.now()) {
      if (!workspacePath) return;
      const canonicalPath = canonicalizeStoredPath(workspacePath);
      this.getDb()
        .insert(workspaces)
        .values({
          path: canonicalPath,
          lastOpenedAt,
        })
        .onConflictDoUpdate({
          target: workspaces.path,
          set: { lastOpenedAt: excludedColumn("last_opened_at") },
        })
        .run();
    }
    getWorkspaces() {
      return this.getDb()
        .select({ path: workspaces.path })
        .from(workspaces)
        .where(
          sql`EXISTS (
                SELECT 1
                FROM ${sessions}
                WHERE ${sessions.cwd} = ${workspaces.path}
                  AND ${sessions.deletedAt} IS NULL
                  AND COALESCE(${sessions.isPlayground}, 0) = 0
            )`,
        )
        .orderBy(desc(workspaces.lastOpenedAt))
        .all()
        .map((row) => row.path);
    }
    getUserIdsByIds(sessionIds) {
      const ids = [...new Set(sessionIds.filter(Boolean))];
      if (ids.length === 0) return [];
      const result = [];
      for (let offset = 0; offset < ids.length; offset += 500) {
        const chunk = ids.slice(offset, offset + 500);
        const rows = this.getDb()
          .select({
            id: sessions.id,
            userId: sessions.userId,
          })
          .from(sessions)
          .where(inArray(sessions.id, chunk))
          .all();
        result.push(
          ...rows.map((row) => ({
            id: row.id,
            userId: row.userId ?? "",
          })),
        );
      }
      return result;
    }
    mapRow(row) {
      const pluginContext = parseSessionPluginContextJson(
        row.pluginContextJson,
      );
      if (row.pluginContextJson && !pluginContext)
        console.warn(
          `[WorkbuddyDatabaseService] ignored invalid session plugin context: sessionId=${row.id}`,
        );
      return {
        id: row.id,
        cwd: row.cwd,
        userId: row.userId,
        title: row.title || void 0,
        customTitle: row.customTitle || void 0,
        status: row.status,
        createdAt: Number(row.createdAt),
        updatedAt: Number(row.updatedAt),
        lastActivityAt:
          row.lastActivityAt === null || row.lastActivityAt === void 0
            ? void 0
            : Number(row.lastActivityAt),
        deletedAt:
          row.deletedAt === null || row.deletedAt === void 0
            ? void 0
            : Number(row.deletedAt),
        isPlayground: Boolean(row.isPlayground),
        sourceMode: row.sourceMode || void 0,
        isBackgroundAutomation:
          row.isBackgroundAutomation === null ||
          row.isBackgroundAutomation === void 0
            ? void 0
            : Boolean(row.isBackgroundAutomation),
        mode: row.mode || void 0,
        model: row.model || void 0,
        expertId: row.expertId || void 0,
        expertLocale: row.expertLocale || void 0,
        expertRuntimeIdentity: row.expertRuntimeIdentity || void 0,
        expertMarketplace: row.expertMarketplace || void 0,
        lastUserPromptExpertSelection: parseLastUserPromptExpertSelection(
          row.lastUserPromptExpertSelectionJson,
        ),
        permissionMode: row.permissionMode || void 0,
        useSandboxCLI:
          row.useSandboxCli === null || row.useSandboxCli === void 0
            ? void 0
            : Boolean(row.useSandboxCli),
        projectId: row.projectId || void 0,
        ...(pluginContext ? { pluginContext } : {}),
      };
    }
  };
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
  function canonicalizeStoredPath(p) {
    if (!p) return p;
    return path.normalize(p);
  }
  function excludedColumn(columnName) {
    return sql.raw(`excluded.${columnName}`);
  }
  function escapeSqliteLikePattern(value) {
    return value.replace(/[\\%_]/g, (char) => `\\${char}`);
  }
  function parseLastUserPromptExpertSelection(raw) {
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed.version !== 1) return;
      if (parsed.selection === null)
        return {
          version: 1,
          selection: null,
        };
      if (!parsed.selection || typeof parsed.selection !== "object") return;
      const selection = parsed.selection;
      const id = typeof selection.id === "string" ? selection.id.trim() : "";
      const marketplace =
        typeof selection.marketplace === "string"
          ? selection.marketplace.trim()
          : "";
      return id
        ? {
            version: 1,
            selection: {
              id,
              ...(marketplace ? { marketplace } : {}),
            },
          }
        : void 0;
    } catch {
      return;
    }
  }
  return { SessionRepository, sessions, workspaces };
}
