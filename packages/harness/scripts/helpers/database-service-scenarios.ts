import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
  readdirSync,
  rmSync,
} from "node:fs";
import * as os from "node:os";
import { join } from "node:path";
import { SQLiteTestDatabase } from "./sqlite-test-driver.js";
export type DatabaseServiceFactory = ((deps: any) => any) & {
  sqliteDriver?: any;
};
export async function databaseFixture(
  factory: DatabaseServiceFactory,
  fn: (f: any) => any,
  BetterSQLite: any = factory.sqliteDriver ?? SQLiteTestDatabase,
) {
  const root = mkdtempSync(join(os.tmpdir(), "axon-db-service-"));
  const logs: any[] = [];
  const runtime = factory({
    BetterSQLite,
    runtimeContext: {
      getWorkbuddyRuntimeConfigDir: () => root,
      getWorkbuddyRuntimeLogsDir: (...segments: string[]) =>
        join(root, "logs", ...segments),
    },
    osModule: { ...os, homedir: () => root },
    logger: {
      info: (...a: any[]) => logs.push(["info", ...a]),
      warn: (...a: any[]) => logs.push(["warn", ...a]),
      error: (...a: any[]) => logs.push(["error", ...a]),
    },
  });
  const services: any[] = [];
  const create = (options: any = {}) => {
    const s = new runtime.WorkbuddyDatabaseService({
      configDir: root,
      ...options,
    });
    services.push(s);
    return s;
  };
  const db = create();
  try {
    await fn({ root, logs, runtime, db, create });
  } finally {
    for (const s of services) {
      await s.flushAutomationFileBackups();
      if (!s.disposed) s.dispose();
    }
    rmSync(root, { recursive: true, force: true });
  }
}
const record = (root: string, patch: any = {}) => ({
  id: "s",
  cwd: root,
  userId: "u",
  status: "Working",
  createdAt: 1,
  updatedAt: 2,
  ...patch,
});
function seedHistory(root: string) {
  const dir = join(root, "projects", "owned-project");
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, "restored.jsonl"),
    [
      JSON.stringify({
        type: "message",
        role: "user",
        cwd: root,
        model: "m",
        timestamp: 100,
        content: "<user_query>Owned recovered question</user_query>",
      }),
      JSON.stringify({ type: "ai-title", aiTitle: "AI title", timestamp: 200 }),
      JSON.stringify({
        type: "custom-title",
        customTitle: "Custom title",
        timestamp: 300,
      }),
    ].join("\n"),
  );
  writeFileSync(
    join(dir, "restored.meta.json"),
    JSON.stringify({
      projectId: " project ",
      createdAt: 10,
      isPlayground: false,
    }),
  );
  return dir;
}
export const databaseServiceScenarios: Array<
  [string, (factory: DatabaseServiceFactory) => Promise<void>]
> = [
  [
    "initialize migrates, persists usage/meta/session rows and dispose prevents reuse",
    (factory) =>
      databaseFixture(factory, ({ root, db, create, runtime }: any) => {
        db.initialize();
        db.initialize();
        db.upsertSession(record(root));
        db.upsertSessionUsage({
          sessionId: "s",
          used: 7,
          size: 9,
          updatedAt: 3,
          creditJson: "{}",
        });
        db.setMigrationMeta("owned", "v");
        assert.equal(db.quickCheck(), "ok");
        assert.equal(db.getSessionUsage("s").used, 7);
        assert.equal(db.getMigrationMeta("owned"), "v");
        runtime.registerGlobalDatabaseRef(db);
        assert.equal(runtime.getGlobalDatabaseRef(), db);
        db.dispose();
        assert.equal(runtime.getGlobalDatabaseRef(), undefined);
        assert.throws(() => db.initialize(), /Cannot initialize after dispose/);
        const next = create();
        next.initialize();
        assert.equal(next.getSession("s").userId, "u");
        assert.equal(next.getAllSessionUsages().length, 1);
        assert.equal(next.getMigrationMeta("owned"), "v");
      }),
  ],
  [
    "startup retries twice before successful real SQLite initialization",
    async (factory) => {
      let opens = 0;
      class FailTwice extends (factory.sqliteDriver ?? SQLiteTestDatabase) {
        constructor(file: string, options: any) {
          if (++opens <= 2) throw Error("owned transient open");
          super(file, options);
        }
      }
      await databaseFixture(
        factory,
        ({ db, logs }: any) => {
          db.initialize();
          assert.equal(opens, 3);
          assert.equal(
            logs.filter((r: any) => String(r[1]).includes("initialize attempt"))
              .length,
            2,
          );
          assert.equal(db.quickCheck(), "ok");
        },
        FailTwice,
      );
    },
  ],
  [
    "exhausted noncorruption errors preserve the original file and report runtime",
    async (factory) => {
      class Refuse extends (factory.sqliteDriver ?? SQLiteTestDatabase) {
        constructor(_file: string, _options: any) {
          throw Error("owned disk full");
          super(_file, _options);
        }
      }
      await databaseFixture(
        factory,
        ({ root, db }: any) => {
          const p = join(root, "workbuddy.db");
          writeFileSync(p, "owned sentinel");
          assert.throws(
            () => db.initialize(),
            /owned disk full[\s\S]*runtime=node=/,
          );
          assert.equal(readFileSync(p, "utf8"), "owned sentinel");
          assert.equal(
            readdirSync(root).some((p: string) => p.includes(".corrupt-")),
            false,
          );
        },
        Refuse,
      );
    },
  ],
  [
    "damaged main file is backed up and rebuilt from sidecar plus automation backup",
    (factory) =>
      databaseFixture(factory, ({ root, db }: any) => {
        seedHistory(root);
        mkdirSync(join(root, "automation-backups"));
        writeFileSync(
          join(root, "automation-backups", "auto.json"),
          JSON.stringify({
            id: "auto",
            name: "Owned",
            prompt: "Owned prompt",
            status: "enabled",
            createdAt: 1,
            updatedAt: 2,
          }),
        );
        writeFileSync(
          join(root, "workbuddy.db"),
          "owned invalid SQLite contents",
        );
        const phases: string[] = [];
        db.initialize((p: any) => phases.push(p.phase));
        assert.deepEqual(phases, ["backup", "rebuild", "recover", "done"]);
        const r = db.getSession("restored");
        assert.equal(r.title, "Custom title");
        assert.equal(r.cwd, root);
        assert.equal(r.model, "m");
        assert.equal(r.createdAt, 10);
        assert.equal(r.projectId, "project");
        assert.equal(db.getAutomation("auto").name, "Owned");
        const notice = db.consumeRecoveryNotice();
        assert.equal(notice.dataRecovery.type, "full-corruption");
        assert.equal(notice.dataRecovery.sessionsRecovered, 1);
        assert.equal(notice.dataRecovery.automationsRecovered, 1);
        assert.equal(db.consumeRecoveryNotice(), undefined);
        assert.ok(
          readdirSync(root).some((p: string) =>
            p.startsWith("workbuddy.db.corrupt-"),
          ),
        );
        assert.equal(
          JSON.parse(db.getMigrationMeta("legacy_history_migration")).source,
          "data-recovery",
        );
      }),
  ],
  [
    "WAL diagnosis restores evidence and WAL-only repair preserves healthy main rows",
    (factory) =>
      databaseFixture(factory, ({ root, db, create }: any) => {
        db.initialize();
        db.upsertSession(record(root));
        db.dispose();
        const next = create();
        const wal = join(root, "workbuddy.db-wal"),
          shm = join(root, "workbuddy.db-shm");
        writeFileSync(wal, Buffer.alloc(5000, 1));
        writeFileSync(shm, "owned shm");
        assert.equal(next.diagnoseDamageType().status, "WAL_DAMAGED");
        assert.equal(readFileSync(wal).length, 5000);
        assert.equal(readFileSync(shm, "utf8"), "owned shm");
        assert.equal(next.attemptWalOnlyRepair(), true);
        assert.equal(next.getSession("s").userId, "u");
        assert.equal(
          next.consumeRecoveryNotice().dataRecovery.type,
          "wal-only",
        );
        assert.ok(
          readdirSync(root).some((p: string) =>
            p.startsWith("workbuddy.db-wal.corrupt-"),
          ),
        );
      }),
  ],
  [
    "invalid WAL header triggers sidecar recovery on successful initialization",
    (factory) =>
      databaseFixture(factory, ({ root, db, create }: any) => {
        db.initialize();
        db.dispose();
        seedHistory(root);
        writeFileSync(join(root, "workbuddy.db-wal"), Buffer.alloc(5000, 1));
        const next = create();
        assert.equal(next.detectPreExistingCorruptWal().walSize, 5000);
        next.initialize();
        assert.equal(next.getSession("restored").title, "Custom title");
        const notice = next.consumeRecoveryNotice();
        assert.equal(notice.dataRecovery.type, "silent-wal-loss-minor loss");
        assert.equal(notice.dataRecovery.recoveredSessions, 1);
      }),
  ],
  [
    "header checks distinguish small files, valid magic and invalid data",
    (factory) =>
      databaseFixture(factory, ({ root, db, runtime }: any) => {
        const p = join(root, "workbuddy.db-wal");
        writeFileSync(p, Buffer.alloc(10));
        assert.equal(db.detectPreExistingCorruptWal(), null);
        const data = Buffer.alloc(5000);
        for (const magic of [
          runtime.WorkbuddyDatabaseService.WAL_MAGIC_1,
          runtime.WorkbuddyDatabaseService.WAL_MAGIC_2,
        ]) {
          data.writeUInt32BE(magic);
          writeFileSync(p, data);
          assert.equal(db.detectPreExistingCorruptWal(), null);
          assert.equal(db.checkWalHeaderMagic(p), true);
        }
        data.writeUInt32BE(1);
        writeFileSync(p, data);
        assert.equal(db.checkWalHeaderMagic(p), false);
        assert.equal(db.detectPreExistingCorruptWal().walSize, 5000);
      }),
  ],
  [
    "recovery notices are consumed at most once even when malformed or initially absent",
    (factory) =>
      databaseFixture(factory, ({ root, db, create }: any) => {
        assert.equal(db.consumeRecoveryNotice(), undefined);
        const p = join(root, "workbuddy.db.recovered");
        writeFileSync(p, '{"owned":true}');
        assert.equal(db.consumeRecoveryNotice(), undefined);
        const next = create();
        assert.deepEqual(next.consumeRecoveryNotice(), { owned: true });
        assert.equal(existsSync(p), false);
        writeFileSync(p, "broken");
        const third = create();
        assert.equal(third.consumeRecoveryNotice(), undefined);
        assert.equal(existsSync(p), false);
      }),
  ],
  [
    "ghost cleanup soft-deletes missing workspaces but preserves live sessions",
    (factory) =>
      databaseFixture(factory, ({ root, db, runtime }: any) => {
        db.initialize();
        db.upsertSession(record(root));
        db.upsertSession(
          record(root, { id: "missing", cwd: join(root, "absent") }),
        );
        db.upsertSession(record(root, { id: "empty", cwd: "" }));
        const stats = runtime.cleanupGhostDataAfterWalCheckpoint(
          db.getDatabasePath(),
        );
        assert.equal(stats.emptyCwdSessions, 1);
        assert.equal(stats.missingCwdSessions, 1);
        assert.equal(db.getSession("s").deletedAt, undefined);
        assert.ok(db.getSession("missing").deletedAt);
        assert.ok(db.getSession("empty").deletedAt);
      }),
  ],
  [
    "automation file backups flush on dispose and deletion removes only its backup",
    (factory) =>
      databaseFixture(factory, async ({ root, db }: any) => {
        db.initialize();
        db.upsertAutomation({
          id: "a",
          name: "Owned",
          prompt: "p",
          status: "enabled",
          createdAt: 1,
          updatedAt: 2,
        });
        await db.flushAutomationFileBackups();
        const p = join(root, "automation-backups", "a.json");
        assert.equal(JSON.parse(readFileSync(p, "utf8")).name, "Owned");
        db.deleteAutomation("a", 9);
        await db.flushAutomationFileBackups();
        assert.equal(existsSync(p), false);
        assert.equal(db.getAutomation("a"), undefined);
        db.upsertAutomation({
          id: "b",
          name: "Second",
          prompt: "p",
          status: "enabled",
          createdAt: 1,
          updatedAt: 2,
        });
        db.dispose();
        assert.equal(
          JSON.parse(
            readFileSync(join(root, "automation-backups", "b.json"), "utf8"),
          ).name,
          "Second",
        );
      }),
  ],
  [
    "JSONL title extraction filters internal context and honors custom titles",
    (factory) =>
      databaseFixture(factory, ({ root, db }: any) => {
        const dir = seedHistory(root);
        assert.equal(
          db.extractSessionInfoFromJsonl(join(dir, "restored.jsonl")).aiTitle,
          "Custom title",
        );
        assert.equal(
          db.extractUserMessageText([
            {
              type: "input_text",
              text: "<system-reminder>internal</system-reminder>",
            },
            {
              type: "input_text",
              text: "<user_query>visible question</user_query>",
            },
          ]),
          "visible question",
        );
        assert.equal(
          db.inferIsPlaygroundFromDir("Users-WorkBuddy-2026-06-09-20-21-49", 1),
          true,
        );
        assert.equal(
          db.inferIsPlaygroundFromDir("Users-WorkBuddy-2026-06-09-20-21-49", 2),
          false,
        );
      }),
  ],
];
