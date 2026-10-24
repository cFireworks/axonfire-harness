import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as fs_promises from "node:fs/promises";
import * as path from "node:path";
import * as nodeOs from "node:os";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import ts from "typescript";
import { parse } from "acorn";
import { cleanAst } from "./captured-acp-protocol.js";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
import { createNativeStorageOrm } from "../../src/vendor/captured-storage-orm.js";
import { createNativeStorageMigrations } from "../../src/storage/native-storage-migrations.js";
import { createNativeSessionRepository } from "../../src/sessions/native-session-repository.js";
import {
  DATABASE_SERVICE_SHA256,
  DATABASE_SERVICE_DECLARATIONS,
} from "../../src/storage/native-database-service.js";
import type { DatabaseServiceFactory } from "./database-service-scenarios.js";
export function loadCapturedDatabaseService(): DatabaseServiceFactory {
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
    DATABASE_SERVICE_SHA256,
  );
  const original = DATABASE_SERVICE_DECLARATIONS.map(([, a, b]) =>
    source.slice(a, b),
  ).join("\n");
  const emitted = ts.transpileModule(
    fs.readFileSync(
      new URL("../../src/storage/native-database-service.ts", import.meta.url),
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
      n.declaration?.id?.name === "createNativeDatabaseService",
  ).declaration;
  const raw: any = parse(original, { ecmaVersion: "latest" });
  const statements = fn.body.body.slice(9, -2);
  assert.deepEqual(cleanAst(statements), cleanAst(raw.body));
  const code = (
    emitted.slice(fn.start, statements[0].start) +
    original +
    emitted.slice(statements.at(-1).end, fn.end)
  ).replace("import.meta.url", JSON.stringify(import.meta.url));
  return new Function(
    "fs",
    "fs_promises",
    "path",
    "nodeOs",
    "createRequire",
    "createNativeStorageOrm",
    "createNativeStorageMigrations",
    "createNativeSessionRepository",
    "return " + code,
  )(
    fs,
    fs_promises,
    path,
    nodeOs,
    createRequire,
    createNativeStorageOrm,
    createNativeStorageMigrations,
    createNativeSessionRepository,
  );
}
