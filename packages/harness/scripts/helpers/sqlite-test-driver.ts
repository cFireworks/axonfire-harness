import { DatabaseSync as NodeDatabaseSync } from "node:sqlite";
import type { DatabaseSync } from "node:sqlite";
// Test-only bridge for recovered SQL with unique selected column names.
// Not a general better-sqlite3 replacement: transactions/native pragmas beyond
// the tested migration/repository path remain outside this adapter contract.
export function createSQLiteTestDriver(
  getDb: () => DatabaseSync,
  statements: string[] = [],
) {
  return {
    exec(query: string) {
      statements.push(query);
      getDb().exec(query);
    },
    pragma(query: string) {
      statements.push("PRAGMA " + query);
      return getDb()
        .prepare("PRAGMA " + query)
        .all();
    },
    prepare(query: string) {
      statements.push(query);
      const stmt = getDb().prepare(query);
      let raw = false;
      return {
        raw() {
          raw = true;
          return this;
        },
        run(...args: any[]) {
          return stmt.run(...args);
        },
        get(...args: any[]) {
          const row = stmt.get(...args);
          return raw && row ? Object.values(row) : row;
        },
        all(...args: any[]) {
          const rows = stmt.all(...args);
          return raw ? rows.map(Object.values) : rows;
        },
      };
    },
  };
}

// Owned-file test constructor for the original DatabaseService. Native ABI and
// better-sqlite3-specific behavior are not replaced in production by this class.
export class SQLiteTestDatabase {
  private db: DatabaseSync;
  private bridge: ReturnType<typeof createSQLiteTestDriver>;
  constructor(file: string, options: any = {}) {
    this.db = new NodeDatabaseSync(file, {
      readOnly: options.readonly ?? false,
    });
    this.bridge = createSQLiteTestDriver(() => this.db);
  }
  prepare(query: string) {
    return this.bridge.prepare(query);
  }
  exec(query: string) {
    return this.bridge.exec(query);
  }
  pragma(query: string) {
    return this.bridge.pragma(query);
  }
  close() {
    this.db.close();
  }
  transaction(fn: (...args: any[]) => any) {
    const invoke =
      (mode: string) =>
      (...args: any[]) => {
        this.db.exec("BEGIN " + mode);
        try {
          const value = fn(...args);
          this.db.exec("COMMIT");
          return value;
        } catch (error) {
          this.db.exec("ROLLBACK");
          throw error;
        }
      };
    return Object.assign(invoke("DEFERRED"), {
      deferred: invoke("DEFERRED"),
      immediate: invoke("IMMEDIATE"),
      exclusive: invoke("EXCLUSIVE"),
    });
  }
}
