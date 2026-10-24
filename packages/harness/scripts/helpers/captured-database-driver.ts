import assert from "node:assert/strict";
import { readFileSync, realpathSync } from "node:fs";
import { join, resolve } from "node:path";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
export const CAPTURED_DATABASE_DRIVER_SHA256 =
  "e0acce53677ede79ce4f323eee875f30c7c010fff5c1a9f48734ffb2da542ad1";
export function loadCapturedDatabaseDriver(
  directory = process.env.WORKBUDDY_SQLITE_DRIVER,
) {
  assert.ok(
    directory,
    "Set WORKBUDDY_SQLITE_DRIVER to the fixed sample better-sqlite3 package directory",
  );
  const root = realpathSync(resolve(directory));
  const binary = join(root, "build", "Release", "better_sqlite3.node");
  assert.equal(
    createHash("sha256").update(readFileSync(binary)).digest("hex"),
    CAPTURED_DATABASE_DRIVER_SHA256,
    "captured native driver identity",
  );
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  assert.equal(pkg.name, "better-sqlite3");
  assert.equal(pkg.version, "12.8.0");
  const require = createRequire(import.meta.url);
  const Database = require(root);
  const probe = new Database(":memory:");
  let sqlite: string;
  try {
    sqlite = probe.prepare("SELECT sqlite_version() version").get().version;
  } finally {
    probe.close();
  }
  assert.ok(
    require.cache[binary],
    "default package loader must use the hash-verified native binary",
  );
  return {
    Database,
    metadata: {
      package: pkg.name,
      version: pkg.version,
      sha256: CAPTURED_DATABASE_DRIVER_SHA256,
      node: process.versions.node,
      electron: process.versions.electron,
      abi: process.versions.modules,
      sqlite,
      platform: process.platform,
      arch: process.arch,
    },
  };
}
