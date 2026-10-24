import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import { createHash } from "node:crypto";
import ts from "typescript";
import { parse } from "acorn";
import { cleanAst } from "./captured-acp-protocol.js";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
import { loadCapturedSessionRepository } from "./captured-session-repository.js";
import {
  STORAGE_MIGRATIONS_SHA256,
  STORAGE_MIGRATIONS_RANGES,
} from "../../src/storage/native-storage-migrations.js";
import type { MigrationsFactory } from "./storage-migrations-scenarios.js";
export function loadCapturedStorageMigrations(): {
  factory: MigrationsFactory;
  statements: number;
  ormAndRepositoryStatements: number;
} {
  const source = fs.readFileSync(
    process.env.WORKBUDDY_DESKTOP_INITIALIZE ??
      path.resolve(
        path.dirname(getCapturedBundlePath()),
        "../../main/initialize.js",
      ),
    "utf8",
  );
  assert.equal(
    createHash("sha256").update(source).digest("hex"),
    STORAGE_MIGRATIONS_SHA256,
  );
  const original = STORAGE_MIGRATIONS_RANGES.map(([, a, b]) =>
    source.slice(a, b),
  ).join("\n");
  const emitted = ts.transpileModule(
    fs.readFileSync(
      new URL(
        "../../src/storage/native-storage-migrations.ts",
        import.meta.url,
      ),
      "utf8",
    ),
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
      n.type === "ExportNamedDeclaration" &&
      n.declaration?.id?.name === "createNativeStorageMigrations",
  ).declaration;
  const raw: any = parse(original, { ecmaVersion: "latest" });
  const statements = fn.body.body.slice(3, -1);
  assert.deepEqual(cleanAst(statements), cleanAst(raw.body));
  const code =
    emitted.slice(fn.start, statements[0].start) +
    original +
    emitted.slice(statements.at(-1).end, fn.end);
  const migrationsFactory = new Function("fs", "path", "return " + code)(
    fs,
    path,
  );
  const captured = loadCapturedSessionRepository();
  return {
    statements: raw.body.length,
    ormAndRepositoryStatements: captured.statements,
    factory: () => {
      const { orm } = captured.factory();
      return { orm, migrations: migrationsFactory(orm) };
    },
  };
}
