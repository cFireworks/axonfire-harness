import assert from "node:assert/strict";
import { statSync, readdirSync } from "node:fs";
import {
  databaseFixture,
  type DatabaseServiceFactory,
} from "./database-service-scenarios.js";
export const nativeDatabaseWalScenarios: Array<
  [string, (factory: DatabaseServiceFactory) => Promise<void>]
> = [
  [
    "large WAL with a pinned reader is retained, then checkpointed after release",
    (factory) =>
      databaseFixture(factory, ({ root, db, create, logs }: any) => {
        assert.ok(
          factory.sqliteDriver,
          "This scenario requires the original native SQLite driver",
        );
        db.initialize();
        db.rawSqliteDb.exec(
          "CREATE TABLE owned_payload (id INTEGER PRIMARY KEY, bytes BLOB NOT NULL)",
        );
        const reader = new factory.sqliteDriver(db.getDatabasePath());
        let reading = false;
        try {
          reader.exec("BEGIN");
          reading = true;
          assert.equal(
            reader.prepare("SELECT count(*) n FROM owned_payload").get().n,
            0,
          );
          const insert = db.rawSqliteDb.prepare(
            "INSERT INTO owned_payload(bytes) VALUES (zeroblob(1048576))",
          );
          db.rawSqliteDb.transaction(() => {
            for (let i = 0; i < 16; i++) insert.run();
          })();
          const wal = db.getDatabasePath() + "-wal";
          assert.ok(statSync(wal).size >= 10 * 1024 * 1024);
          const probe = create();
          const phases: string[] = [];
          probe.performStartupWalCheckpointIfNeeded((p: any) =>
            phases.push(p.phase),
          );
          assert.deepEqual(phases, ["recover", "done"]);
          assert.ok(statSync(wal).size >= 10 * 1024 * 1024);
          assert.equal(
            readdirSync(root).some((p: string) => p.includes(".orphan-")),
            false,
          );
          assert.ok(
            logs.some((r: any) =>
              String(r[1]).includes("unsafe to quarantine (busy=1"),
            ),
          );
          assert.equal(
            reader.prepare("SELECT count(*) n FROM owned_payload").get().n,
            0,
            "original reader keeps its snapshot",
          );
          assert.equal(
            db.rawSqliteDb.prepare("SELECT count(*) n FROM owned_payload").get()
              .n,
            16,
          );
          reader.exec("ROLLBACK");
          reading = false;
          probe.initialize();
          assert.equal(
            probe.rawSqliteDb
              .prepare("SELECT count(*) n FROM owned_payload")
              .get().n,
            16,
          );
          assert.equal(probe.quickCheck(), "ok");
          assert.ok(statSync(wal).size < 32 * 1024);
          assert.equal(
            readdirSync(root).some((p: string) => p.includes(".orphan-")),
            false,
          );
        } finally {
          if (reading) reader.exec("ROLLBACK");
          reader.close();
        }
      }),
  ],
];
