import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, rm, access, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { safeDeleteFixture } from "../../../packages/harness/dist/scripts/helpers/safe-delete-fixture.js";

test("staged original safe-delete shims move owned files and directories to the real macOS trash", {
  skip: process.platform !== "darwin" || process.arch !== "arm64", timeout: 20000,
}, async (t) => {
  // Original shims permanently remove OS-temp paths; use an owned ignored workspace.
  const work = fileURLToPath(new URL("../../../work/", import.meta.url));
  await mkdir(work, { recursive: true });
  const root = await mkdtemp(join(work, "native-trash-"));
  const assets = fileURLToPath(new URL("../../../packages/harness/dist/native-product/", import.meta.url));
  const fixture = safeDeleteFixture(undefined, {
    root, assets: false, process: { execPath: process.execPath },
    modules: { 44237: { PathUtils: { getRootPathSync: () => assets, getWorkDir: () => root } } },
  });
  const trashPaths = [];
  async function exercise(command, python) {
    const name = `${basename(root)}-${command}`, file = join(root, name);
    const trashed = join(homedir(), ".Trash", name);
    trashPaths.push(trashed);
    if (command === "rmdir") await mkdir(file);
    else await writeFile(file, "owned-native-trash-642");
    const report = join(root, `${command}-report.jsonl`);
    const env = fixture.s.buildSafeDeleteEnv({
      PATH: process.env.PATH, HOME: root, CODEBUDDY_SESSION_ID: "owned-trash-session",
      CODEBUDDY_SAFE_DELETE_REPORT_PATH: report,
    }, { enabled: true, sessionId: "owned-trash-session", toolCallId: command });
    assert.equal(env.GENIE_TRASH_DIR, join(assets, "vendor/genie-trash"));
    const executable = command === "python" ? python : command === "node" ? process.execPath : join(env.CODEBUDDY_SAFE_DELETE_BIN_DIR, command);
    const args = command === "python"
      ? ["-c", "import os, sys; os.unlink(sys.argv[1])", file]
      : command === "node"
      ? ["-e", "require('node:fs').unlinkSync(process.argv[1])", file]
      : [file];
    assert.ok((await stat(executable)).mode & 0o111);
    await promisify(execFile)(executable, args, { cwd: root, env, timeout: 5000 });
    await assert.rejects(access(file), { code: "ENOENT" });
    if (command === "rmdir") assert.equal((await stat(trashed)).isDirectory(), true);
    else assert.equal(await readFile(trashed, "utf8"), "owned-native-trash-642");
    const records = (await readFile(report, "utf8")).trim().split("\n").map(line => JSON.parse(line));
    assert.ok(records.some(record => record.operation === "trash" && record.runtime === (["node", "python"].includes(command) ? command : "bash") && record.path === file));
  }
  try {
    for (const command of ["rm", "unlink", "rmdir", "node"]) await exercise(command);
    let python;
    try {
      python = (await promisify(execFile)("python3", ["-c", "import sys; print(sys.executable)"], { timeout: 5000 })).stdout.trim();
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    await t.test("original Python sitecustomize intercepts unlink with the native helper", { skip: !python }, async () => exercise("python", python));
  } finally {
    // Only exact names created above are removed; never enumerate the user's Trash.
    for (const path of trashPaths) await rm(path, { recursive: true, force: true });
    fixture.close();
  }
});
