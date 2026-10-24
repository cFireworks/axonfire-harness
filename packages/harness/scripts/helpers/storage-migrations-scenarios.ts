import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import {
  mkdtempSync,
  rmSync,
  readFileSync,
  writeFileSync,
  statSync,
  utimesSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { createSQLiteTestDriver } from "./sqlite-test-driver.js";
export type MigrationsFactory = () => { orm: any; migrations: any };
function fixture(factory: MigrationsFactory, fn: (f: any) => void) {
  const root = mkdtempSync(join(tmpdir(), "axon-migration-"));
  const db = new DatabaseSync(join(root, "db.sqlite"));
  const client = createSQLiteTestDriver(() => db),
    runtime = factory();
  try {
    fn({
      root,
      db,
      client,
      ...runtime,
      run: () =>
        runtime.migrations.runWorkbuddyDrizzleMigrations(client, {
          configDir: root,
        }),
    });
  } finally {
    db.close();
    rmSync(root, { recursive: true, force: true });
  }
}
export const storageMigrationsScenarios: Array<
  [string, (factory: MigrationsFactory) => void]
> = [
  [
    "empty database creates eight tables and three migration hashes; rerun is idempotent",
    (factory) =>
      fixture(factory, ({ root, db, run, orm, migrations }: any) => {
        run();
        migrations.assertWorkbuddySqliteSchema(db);
        assert.equal(
          db
            .prepare(
              "SELECT count(*) n FROM sqlite_master WHERE type='table' AND name != '__workbuddy_drizzle_migrations'",
            )
            .get().n,
          8,
        );
        const rows = db
          .prepare(
            "SELECT hash,created_at FROM __workbuddy_drizzle_migrations ORDER BY created_at",
          )
          .all();
        assert.equal(rows.length, 3);
        for (const [
          i,
          e,
        ] of orm.WORKBUDDY_SQLITE_MIGRATION_JOURNAL.entries.entries()) {
          const content = readFileSync(
            join(root, ".workbuddy-sqlite-migrations", e.tag + ".sql"),
            "utf8",
          );
          assert.equal(
            rows[i].hash,
            createHash("sha256").update(content).digest("hex"),
          );
          assert.equal(rows[i].created_at, e.when);
        }
        run();
        assert.equal(
          db
            .prepare("SELECT count(*) n FROM __workbuddy_drizzle_migrations")
            .get().n,
          3,
        );
        assert.equal(
          migrations.getAutomationRunsRunsJsonColumnType(db),
          "TEXT",
        );
      }),
  ],
  [
    "legacy ID-only tables are adopted and existing rows preserved with original defaults",
    (factory) =>
      fixture(factory, ({ db, run, migrations }: any) => {
        const keys: any = {
          sessions: "id",
          workspaces: "path",
          automations: "id",
          automation_runs: "thread_id",
          automation_runtime_state: "automation_id",
          automation_delivery_outbox: "id",
          migration_meta: "key",
          session_usage: "session_id",
        };
        for (const [table, key] of Object.entries(keys)) {
          db.exec(`CREATE TABLE ${table} (${key} TEXT PRIMARY KEY)`);
          db.prepare(`INSERT INTO ${table} VALUES (?)`).run("legacy");
        }
        run();
        migrations.assertWorkbuddySqliteSchema(db);
        const s = db.prepare("SELECT * FROM sessions").get();
        assert.equal(s.id, "legacy");
        assert.equal(s.status, "Pending");
        assert.equal(s.cwd, "");
        assert.equal(s.created_at, 0);
        assert.equal(s.plugin_context_json, null);
        assert.equal(
          db.prepare("SELECT status FROM automations").get().status,
          "enabled",
        );
        assert.equal(
          db
            .prepare("SELECT max_attempts FROM automation_delivery_outbox")
            .get().max_attempts,
          5,
        );
      }),
  ],
  [
    "one recorded migration advances remaining SQL without recreating legacy content",
    (factory) =>
      fixture(factory, ({ db, client, root, orm, migrations, run }: any) => {
        const folder = migrations.materializeWorkbuddySqliteMigrations(root);
        const migrationsList = orm.readMigrationFiles({
          migrationsFolder: folder,
        });
        const drizzle = orm.drizzle(client);
        drizzle.dialect.migrate(migrationsList.slice(0, 1), drizzle.session, {
          migrationsTable: "__workbuddy_drizzle_migrations",
        });
        db.prepare(
          "INSERT INTO sessions(id,cwd,user_id,created_at,updated_at) VALUES (?,?,?,?,?)",
        ).run("old", "/owned", "user", 1, 2);
        run();
        assert.equal(
          db
            .prepare("SELECT count(*) n FROM __workbuddy_drizzle_migrations")
            .get().n,
          3,
        );
        assert.equal(
          db.prepare("SELECT user_id FROM sessions").get().user_id,
          "user",
        );
        migrations.assertWorkbuddySqliteSchema(db);
      }),
  ],
  [
    "edited materialized files are restored, identical files retain their timestamps",
    (factory) =>
      fixture(factory, ({ root, migrations, orm }: any) => {
        const folder = migrations.materializeWorkbuddySqliteMigrations(root);
        const target = join(folder, "0000_workbuddy_sqlite_baseline.sql");
        utimesSync(target, 1000, 1000);
        const old = statSync(target).mtimeMs;
        migrations.materializeWorkbuddySqliteMigrations(root);
        assert.equal(statSync(target).mtimeMs, old);
        writeFileSync(target, "broken");
        writeFileSync(join(folder, "meta", "_journal.json"), "broken");
        migrations.materializeWorkbuddySqliteMigrations(root);
        assert.equal(
          readFileSync(target, "utf8"),
          orm.WORKBUDDY_SQLITE_MIGRATION_FILES[
            "0000_workbuddy_sqlite_baseline.sql"
          ],
        );
        assert.deepEqual(
          JSON.parse(
            readFileSync(join(folder, "meta", "_journal.json"), "utf8"),
          ),
          orm.WORKBUDDY_SQLITE_MIGRATION_JOURNAL,
        );
      }),
  ],
  [
    "adoption skips absent tables and validation reports missing columns",
    (factory) =>
      fixture(factory, ({ db, migrations }: any) => {
        migrations.adoptLegacyWorkbuddySqliteSchema(db);
        assert.equal(
          db
            .prepare("SELECT count(*) n FROM sqlite_master WHERE type='table'")
            .get().n,
          0,
        );
        assert.throws(
          () => migrations.assertWorkbuddySqliteSchema(db),
          /sessions\.\*/,
        );
        db.exec("CREATE TABLE sessions (id TEXT PRIMARY KEY)");
        migrations.adoptLegacyWorkbuddySqliteSchema(db);
        assert.throws(
          () => migrations.assertWorkbuddySqliteSchema(db),
          /sessions\.plugin_context_json/,
        );
        assert.equal(
          db
            .prepare("PRAGMA table_info(sessions)")
            .all()
            .some((c: any) => c.name === "last_user_prompt_expert_selection"),
          false,
        );
      }),
  ],
  [
    "standalone usage schema repair is idempotent and preserves usage rows",
    (factory) =>
      fixture(factory, ({ db, migrations }: any) => {
        db.exec("CREATE TABLE session_usage (session_id TEXT PRIMARY KEY)");
        db.prepare("INSERT INTO session_usage VALUES (?)").run("s");
        migrations.ensureSessionUsageTableSchema(db);
        migrations.ensureSessionUsageTableSchema(db);
        assert.deepEqual(
          { ...db.prepare("SELECT * FROM session_usage").get() },
          {
            session_id: "s",
            used: 0,
            size: 0,
            updated_at: 0,
            credit_json: null,
          },
        );
      }),
  ],
  [
    "connection config sets WAL, ten-second busy timeout and thousand-page checkpoint",
    (factory) =>
      fixture(factory, ({ db, client, migrations }: any) => {
        migrations.configureWorkbuddySqliteConnection(client);
        assert.equal(
          db.prepare("PRAGMA journal_mode").get().journal_mode,
          "wal",
        );
        assert.equal(db.prepare("PRAGMA busy_timeout").get().timeout, 10000);
        assert.equal(
          db.prepare("PRAGMA wal_autocheckpoint").get().wal_autocheckpoint,
          1000,
        );
        assert.equal(migrations.asBetterSqliteDatabase(client), client);
        assert.ok(
          migrations.createWorkbuddyDrizzleDatabase(client).query.sessions,
        );
      }),
  ],
  [
    "migration failure rolls back SQL and journal inserts but not prior adoption",
    (factory) =>
      fixture(factory, ({ db, run }: any) => {
        // Existing plugin column without a journal is not reconciled by the original pipeline.
        db.exec(
          "CREATE TABLE sessions (id TEXT PRIMARY KEY, plugin_context_json TEXT)",
        );
        db.prepare("INSERT INTO sessions VALUES (?,?)").run("s", "{}");
        assert.throws(run, (error: any) => {
          assert.match(error.message, /Failed to run the query/);
          assert.match(
            error.cause?.message,
            /duplicate column name: plugin_context_json/,
          );
          return true;
        });
        assert.equal(
          db
            .prepare("SELECT count(*) n FROM __workbuddy_drizzle_migrations")
            .get().n,
          0,
        );
        assert.equal(
          db
            .prepare(
              "SELECT count(*) n FROM sqlite_master WHERE name='automations'",
            )
            .get().n,
          0,
        );
        assert.equal(
          db.prepare("SELECT cwd,plugin_context_json FROM sessions").get().cwd,
          "",
        );
        assert.equal(
          db.prepare("SELECT plugin_context_json FROM sessions").get()
            .plugin_context_json,
          "{}",
        );
      }),
  ],
  [
    "schema validation checks names without enforcing declared column types",
    (factory) =>
      fixture(factory, ({ db, run, migrations }: any) => {
        run();
        db.exec(
          "ALTER TABLE automation_runs RENAME COLUMN runs_json TO old_runs_json",
        );
        db.exec("ALTER TABLE automation_runs ADD COLUMN runs_json BLOB");
        migrations.assertWorkbuddySqliteSchema(db);
        assert.equal(
          migrations.getAutomationRunsRunsJsonColumnType(db),
          "BLOB",
        );
      }),
  ],
  [
    "later migration timestamp does not heal a missing column",
    (factory) =>
      fixture(factory, ({ db, run }: any) => {
        run();
        db.exec("ALTER TABLE sessions DROP COLUMN plugin_context_json");
        assert.throws(run, /sessions\.plugin_context_json/);
        assert.equal(
          db
            .prepare("SELECT count(*) n FROM __workbuddy_drizzle_migrations")
            .get().n,
          3,
        );
      }),
  ],
];
