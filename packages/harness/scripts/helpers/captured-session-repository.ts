import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import * as path from "node:path";
import * as fs from "node:fs";
import * as crypto from "node:crypto";
import ts from "typescript";
import { parse } from "acorn";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
import { cleanAst } from "./captured-acp-protocol.js";
import { createNativeSessionAddons } from "../../src/sessions/native-session-addons.js";
import {
  STORAGE_ORM_RANGES,
  STORAGE_ORM_SHA256,
} from "../../src/vendor/captured-storage-orm.js";
import {
  SESSION_REPOSITORY_DECLARATIONS,
  SESSION_REPOSITORY_SHA256,
} from "../../src/sessions/native-session-repository.js";
import type { RepositoryFactory } from "./session-repository-scenarios.js";
export function loadCapturedSessionRepository(): {
  factory: RepositoryFactory;
  statements: number;
} {
  const source = readFileSync(
    process.env.WORKBUDDY_DESKTOP_INITIALIZE ??
      path.resolve(
        path.dirname(getCapturedBundlePath()),
        "../../main/initialize.js",
      ),
    "utf8",
  );
  const sha = createHash("sha256").update(source).digest("hex");
  assert.equal(sha, STORAGE_ORM_SHA256);
  assert.equal(sha, SESSION_REPOSITORY_SHA256);
  let statements = 0;
  function compare(
    file: string,
    name: string,
    ranges: readonly (readonly [string, number, number])[],
    prefix: number,
  ) {
    const original = ranges.map(([, a, b]) => source.slice(a, b)).join("\n");
    const emitted = ts.transpileModule(
      readFileSync(new URL(file, import.meta.url), "utf8"),
      {
        compilerOptions: {
          target: ts.ScriptTarget.ES2023,
          module: ts.ModuleKind.ESNext,
        },
      },
    ).outputText;
    const tree: any = parse(emitted, {
      ecmaVersion: "latest",
      sourceType: "module",
    });
    const fn = tree.body.find(
      (n: any) =>
        n.type === "ExportNamedDeclaration" && n.declaration?.id?.name === name,
    ).declaration;
    const raw: any = parse(original, { ecmaVersion: "latest" });
    assert.deepEqual(
      cleanAst(fn.body.body.slice(prefix, -1)),
      cleanAst(raw.body),
      name,
    );
    statements += raw.body.length;
    return original;
  }
  const ormSource = compare(
    "../../src/vendor/captured-storage-orm.ts",
    "createNativeStorageOrm",
    STORAGE_ORM_RANGES,
    3,
  );
  const repoSource = compare(
    "../../src/sessions/native-session-repository.ts",
    "createNativeSessionRepository",
    SESSION_REPOSITORY_DECLARATIONS,
    2,
  );
  const ormFactory = new Function(
    "BetterSQLite",
    "fs",
    "crypto",
    `const better_sqlite3$1={default:BetterSQLite};const node_fs$1={default:fs};const node_crypto$1={default:crypto};\n${ormSource}\nreturn {drizzle,sql,eq,or,and,isNull,desc,inArray,sqliteTable,text,integer,getTableColumns,ne,asc,gt,lte,migrate,readMigrationFiles,index,uniqueIndex,WORKBUDDY_SQLITE_MIGRATION_JOURNAL,WORKBUDDY_SQLITE_MIGRATION_FILES};`,
  );
  const repoFactory = new Function(
    "orm",
    "path",
    "createNativeSessionAddons",
    `const {sql,eq,or,and,isNull,desc,inArray,sqliteTable,text,integer}=orm;const {parseSessionPluginContextJson,serializeSessionPluginContext}=createNativeSessionAddons();\n${repoSource}\nreturn {SessionRepository,sessions,workspaces};`,
  );
  return {
    statements,
    factory: () => {
      const orm = ormFactory(undefined, fs, crypto);
      return { orm, ...repoFactory(orm, path, createNativeSessionAddons) };
    },
  };
}
