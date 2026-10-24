import { createSQLiteTestDriver } from "./sqlite-test-driver.js";
import { createNativeStorageMigrations } from "../../src/storage/native-storage-migrations.js";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, normalize } from "node:path";
import { createNativeSessionRecords } from "../../src/sessions/native-session-records.js";
export type RepositoryFactory = () => {
  orm: any;
  SessionRepository: any;
  sessions: any;
  workspaces: any;
};
// Test-only bridge: repository SQL executes in SQLite, not a fake query engine.
// Node 23 returns objects; this repository selects unique column names, so the
// raw-row bridge preserves select order. This is not a general better-sqlite3 shim.
export function createSessionRepositorySQLiteFixture(
  factory: RepositoryFactory,
) {
  const root = mkdtempSync(join(tmpdir(), "axonfire-repository-")),
    file = join(root, "sessions.sqlite");
  const runtime = factory();
  let sqlite = new DatabaseSync(file);
  const statements: string[] = [];
  const client = createSQLiteTestDriver(() => sqlite, statements);
  const migrations = createNativeStorageMigrations(runtime.orm);
  migrations.configureWorkbuddySqliteConnection(client);
  migrations.runWorkbuddyDrizzleMigrations(client, { configDir: root });
  const db = runtime.orm.drizzle(client);
  const repo = new runtime.SessionRepository(() => db);
  return {
    repo,
    sqlite,
    statements,
    reopen() {
      sqlite.close();
      sqlite = new DatabaseSync(file);
    },
    close() {
      sqlite.close();
      rmSync(root, { recursive: true, force: true });
    },
  };
}
const fixture = createSessionRepositorySQLiteFixture;
const record = (id = "s", patch: any = {}) => ({
  id,
  cwd: "/owned/a/../project",
  userId: "u",
  status: "Working",
  createdAt: 1,
  updatedAt: 2,
  ...patch,
});
function withFixture(
  factory: RepositoryFactory,
  fn: (f: ReturnType<typeof fixture>) => any,
) {
  const f = fixture(factory);
  try {
    return fn(f);
  } finally {
    f.close();
  }
}
export const sessionRepositoryScenarios: Array<
  [string, (factory: RepositoryFactory) => any]
> = [
  [
    "round trip survives SQLite close/reopen with normalized paths and typed fields",
    (factory) =>
      withFixture(factory, (f) => {
        f.repo.upsert(
          record("s", {
            title: "hello",
            model: "model",
            useSandboxCLI: false,
            isBackgroundAutomation: true,
            lastActivityAt: 3,
            expertId: "e",
            lastUserPromptExpertSelection: {
              version: 1,
              selection: { id: " e ", marketplace: " market " },
            },
            pluginContext: {
              version: 1,
              selectedPluginIds: ["a"],
              microSceneIds: [],
              projectResources: {
                connectorSkillIds: [],
                mcpServerNames: [],
                projectSkillNames: [],
              },
              pluginSettings: {
                enabledPlugins: { a: true },
                extraKnownMarketplaces: {},
              },
            },
          }),
        );
        f.reopen();
        const r = f.repo.get("s");
        assert.equal(r.cwd, normalize("/owned/a/../project"));
        assert.equal(r.title, "hello");
        assert.equal(r.useSandboxCLI, false);
        assert.equal(r.isBackgroundAutomation, true);
        assert.equal(r.lastActivityAt, 3);
        assert.deepEqual(r.lastUserPromptExpertSelection, {
          version: 1,
          selection: { id: "e", marketplace: "market" },
        });
        assert.deepEqual(r.pluginContext.selectedPluginIds, ["a"]);
        assert.deepEqual(f.repo.getWorkspaces(), [r.cwd]);
      }),
  ],
  [
    "upsert keeps owner and archive while merging nullable fields and explicit clears",
    (factory) =>
      withFixture(factory, (f) => {
        f.repo.upsert(
          record("s", {
            status: "ARCHIVED",
            title: "old",
            customTitle: "custom",
            model: "model",
            expertId: "expert",
            isBackgroundAutomation: true,
            useSandboxCLI: true,
            lastActivityAt: 4,
            projectId: "p",
          }),
        );
        f.repo.upsert(
          record("s", {
            userId: "other",
            status: "Working",
            createdAt: 8,
            updatedAt: 9,
            model: "   ",
            expertId: "",
            isBackgroundAutomation: false,
            useSandboxCLI: false,
          }),
        );
        const r = f.repo.get("s");
        assert.equal(r.userId, "u");
        assert.equal(r.status, "ARCHIVED");
        assert.equal(r.createdAt, 8);
        assert.equal(r.updatedAt, 9);
        assert.equal(r.title, "old");
        assert.equal(r.customTitle, "custom");
        assert.equal(r.model, "model");
        assert.equal(r.expertId, undefined);
        assert.equal(r.isBackgroundAutomation, true);
        assert.equal(r.useSandboxCLI, false);
        assert.equal(r.lastActivityAt, 4);
        assert.equal(r.projectId, "p");
        assert.equal(f.repo.updateStatus("s", "Completed", 10), 1);
        assert.equal(f.repo.get("s").status, "Completed");
        assert.equal(f.repo.updateStatus("missing", "Failed", 11), 0);
      }),
  ],
  [
    "empty legacy owner can be claimed and playground can only downgrade",
    (factory) =>
      withFixture(factory, (f) => {
        f.repo.upsert(record("s", { userId: "", isPlayground: true }));
        assert.deepEqual(f.repo.getWorkspaces(), []);
        f.repo.upsert(record("s", { userId: "new", isPlayground: false }));
        f.repo.upsert(record("s", { userId: "other", isPlayground: true }));
        assert.equal(f.repo.get("s").userId, "new");
        assert.equal(f.repo.get("s").isPlayground, false);
        assert.equal(f.repo.getWorkspaces().length, 1);
      }),
  ],
  [
    "list requires owner, includes unclaimed rows and respects soft deletion and sort",
    (factory) =>
      withFixture(factory, (f) => {
        for (const r of [
          record("mine", { updatedAt: 5 }),
          record("other", { userId: "v", updatedAt: 6 }),
          record("legacy", { userId: "", updatedAt: 4 }),
          record("gone", { updatedAt: 3 }),
        ])
          f.repo.upsert(r);
        f.repo.delete("gone", 9);
        assert.deepEqual(f.repo.list(), []);
        assert.deepEqual(
          f.repo.list({ userId: "u" }).map((r: any) => r.id),
          ["mine", "legacy"],
        );
        assert.deepEqual(
          f.repo
            .list({ userId: "u", includeDeleted: true })
            .map((r: any) => r.id),
          ["gone", "mine", "legacy"],
        );
        assert.equal(f.repo.get("gone").deletedAt, 9);
      }),
  ],
  [
    "suffix lookup escapes SQL wildcards and ignores other owners and deleted rows",
    (factory) =>
      withFixture(factory, (f) => {
        for (const r of [
          record("exact", { cwd: "/root/a%_\\tail", updatedAt: 2 }),
          record("wild", { cwd: "/root/axy\\tail", updatedAt: 3 }),
          record("other", {
            cwd: "/root/a%_\\tail",
            userId: "v",
            updatedAt: 5,
          }),
          record("gone", {
            cwd: "/root/a%_\\tail",
            updatedAt: 6,
            deletedAt: 7,
          }),
        ])
          f.repo.upsert(r);
        assert.equal(f.repo.getLatestByCwdSuffix("a%_\\tail", "u").id, "exact");
        assert.equal(
          f.repo.getLatestByCwdSuffix("' OR 1=1 --", "u"),
          undefined,
        );
      }),
  ],
  [
    "nonterminal repair preserves terminal case variants but includes deleted in-flight rows",
    (factory) =>
      withFixture(factory, (f) => {
        for (const [id, status] of [
          "Completed",
          "FAILED",
          "terminated",
          "Archived",
          "Pending",
          "Working",
          "idle",
          "unknown",
        ].entries())
          f.repo.upsert(
            record(String(id), { status, deletedAt: id === 5 ? 7 : undefined }),
          );
        assert.equal(f.repo.fixNonTerminal(20), 4);
        assert.equal(f.repo.get("5").status, "Terminated");
        assert.equal(f.repo.get("5").deletedAt, 7);
        assert.equal(f.repo.get("0").updatedAt, 2);
        assert.equal(f.repo.get("4").updatedAt, 20);
      }),
  ],
  [
    "workspace visibility depends on nondeleted nonplayground sessions",
    (factory) =>
      withFixture(factory, (f) => {
        f.repo.upsert(record("a", { cwd: "/root/a", updatedAt: 4 }));
        f.repo.upsert(record("b", { cwd: "/root/b", updatedAt: 3 }));
        f.repo.upsert(
          record("play", {
            cwd: "/root/play",
            updatedAt: 5,
            isPlayground: true,
          }),
        );
        f.repo.upsertWorkspace("/root/orphan", 99);
        assert.deepEqual(f.repo.getWorkspaces(), ["/root/a", "/root/b"]);
        f.repo.delete("a", 7);
        assert.deepEqual(f.repo.getWorkspaces(), ["/root/b"]);
        f.repo.upsert(record("a", { cwd: "/root/a", updatedAt: 8 }));
        assert.deepEqual(f.repo.getWorkspaces(), ["/root/a", "/root/b"]);
      }),
  ],
  [
    "owner query deduplicates and chunks beyond five hundred IDs",
    (factory) =>
      withFixture(factory, (f) => {
        f.sqlite.exec("BEGIN");
        for (let n = 0; n < 502; n++)
          f.repo.upsert(
            record(String(n), {
              isPlayground: true,
              userId: n === 0 ? "" : "u",
            }),
          );
        f.sqlite.exec("COMMIT");
        f.statements.length = 0;
        const ids = Array.from({ length: 502 }, (_, n) => String(n));
        const rows = f.repo.getUserIdsByIds(["", ...ids, ...ids]);
        assert.equal(rows.length, 502);
        assert.equal(rows.find((r: any) => r.id === "0").userId, "");
        assert.equal(
          f.statements.filter((q) => q.startsWith("select")).length,
          2,
        );
        assert.deepEqual(f.repo.getUserIdsByIds([]), []);
      }),
  ],
  [
    "corrupt JSON is ignored and explicit null expert selection survives",
    (factory) =>
      withFixture(factory, (f) => {
        f.repo.upsert(record());
        f.sqlite
          .prepare(
            "UPDATE sessions SET plugin_context_json=?, last_user_prompt_expert_selection=? WHERE id=?",
          )
          .run("{broken", '{"version":1,"selection":null}', "s");
        const r = f.repo.get("s");
        assert.equal(r.pluginContext, undefined);
        assert.deepEqual(r.lastUserPromptExpertSelection, {
          version: 1,
          selection: null,
        });
        f.sqlite
          .prepare(
            "UPDATE sessions SET last_user_prompt_expert_selection=? WHERE id=?",
          )
          .run("{broken", "s");
        assert.equal(f.repo.get("s").lastUserPromptExpertSelection, undefined);
      }),
  ],
  [
    "permission-only update changes timestamp and missing row returns zero",
    (factory) =>
      withFixture(factory, (f) => {
        f.repo.upsert(record());
        const before = Date.now();
        assert.equal(f.repo.updatePermissionMode("s", "acceptEdits"), 1);
        assert.equal(f.repo.get("s").permissionMode, "acceptEdits");
        assert.ok(f.repo.get("s").updatedAt >= before);
        assert.equal(f.repo.updatePermissionMode("missing", "default"), 0);
      }),
  ],
  [
    "record adapter archive restoration deliberately writes status only to SQLite",
    async (factory) => {
      const f = fixture(factory);
      try {
        f.repo.upsert(record("s", { status: "Archived", model: "old" }));
        const store = createNativeSessionRecords().createSessionRecordStore(
          Promise.resolve({
            database: {
              getSession: (id: string) => f.repo.get(id),
              upsertSession: (r: any) => f.repo.upsert(r),
              updateSessionStatus: (id: string, status: string, time: number) =>
                f.repo.updateStatus(id, status, time),
            },
          }),
        );
        await store.upsertSession(
          record("s", { status: "Completed", model: "new", updatedAt: 50 }),
        );
        f.reopen();
        assert.equal(f.repo.get("s").status, "Completed");
        assert.equal(f.repo.get("s").model, "old");
        assert.equal(f.repo.get("s").updatedAt, 50);
      } finally {
        f.close();
      }
    },
  ],
];
