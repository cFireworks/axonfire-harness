import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdtemp, rm, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ownedBuiltinAssets } from "../packages/harness/dist/scripts/helpers/builtin-seed-fixtures.js";

const cwd = fileURLToPath(new URL("../", import.meta.url));
const env = Object.fromEntries(
  Object.entries(process.env).filter(
    ([name]) =>
      !/^(CODEBUDDY_|WORKBUDDY_|OPENAI_|AXONFIRE_|ACC_PRODUCT_CONFIG)/.test(
        name,
      ),
  ),
);
const help = spawnSync(process.execPath, ["apps/cli/axonfire.mjs", "--help"], {
  cwd,
  env,
  encoding: "utf8",
});
assert.equal(help.status, 0);
assert.match(help.stdout, /Usage: codebuddy\|cbc/);
console.log("PASS default original CLI launcher help (no credentials)");

const workbenchHelp = spawnSync(
  process.execPath,
  ["apps/cli/axonfire.mjs", "workbench", "--help"],
  { cwd, env, encoding: "utf8" },
);
assert.equal(workbenchHelp.status, 0);
assert.match(workbenchHelp.stdout, /Usage: npm run workbench/);
console.log("PASS explicit workbench CLI launcher help");

const directory = await mkdtemp(join(tmpdir(), "axonfire-launcher-"));
const seededAssets = await ownedBuiltinAssets(directory);
const child = spawn(
  process.execPath,
  [
    "apps/cli/axonfire.mjs",
    "web",
    "--demo",
    "--port",
    "0",
    "--cwd",
    directory,
    "--setting-sources",
    "user,project,local",
    "--builtin-assets",
    seededAssets.assets,
    "--settings",
    '{"reasoningEffort":"low"}',
    "--effort",
    "max",
  ],
  { cwd, env, stdio: ["ignore", "pipe", "pipe"] },
);
const exited = new Promise((resolve, reject) => {
  child.once("exit", (code, signal) => resolve({ code, signal }));
  child.once("error", reject);
});
child.stderr.resume();
const timeout = setTimeout(() => child.kill("SIGKILL"), 20_000);
try {
  const ready = new Promise((resolve, reject) => {
    let stdout = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
      const match = stdout.match(/http:\/\/127\.0\.0\.1:\d+/);
      if (match) resolve(match[0]);
    });
    child.once("exit", () =>
      reject(new Error("Web launcher exited before readiness")),
    );
  });
  const url = await ready;
  const page = await fetch(url);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /axonfire/);
  const status = await (await fetch(`${url}/api/status`)).json();
  assert.equal(status.mode, "demo");
  const response = await fetch(`${url}/api/prompt`, {
    method: "POST",
    headers: {
      Origin: url,
      "Content-Type": "application/json",
      "x-axonfire-csrf": status.csrf,
    },
    body: JSON.stringify({ prompt: "offline startup verification" }),
  });
  assert.equal(response.status, 200);
  const stream = await response.text();
  assert.match(stream, /event: delta/);
  assert.match(stream, /event: done/);
  assert.doesNotMatch(stream, /event: error/);
  await access(
    join(
      directory,
      ".axonfire",
      "demo",
      "plugins",
      "cache",
      "workbuddy-builtin",
      "seed-owned",
      "1.0.0",
      ".codebuddy-plugin",
      "plugin.json",
    ),
  );
  const reload = await fetch(`${url}/api/prompt`, {
    method: "POST",
    headers: {
      Origin: url,
      "Content-Type": "application/json",
      "x-axonfire-csrf": status.csrf,
    },
    body: JSON.stringify({ prompt: "/reload-plugins" }),
  });
  assert.equal(reload.status, 200);
  const reloaded = await reload.text();
  assert.match(reloaded, /Enabled: 1/);
  assert.doesNotMatch(reloaded, /event: error/);
  console.log(
    "PASS Web launcher → real SDK → recovered harness → streamed offline answer; owned builtin seed and native reload",
  );
} finally {
  child.kill("SIGTERM");
  const result = await exited;
  clearTimeout(timeout);
  await rm(directory, { recursive: true, force: true });
  assert.equal(result.code, 0, `Web shutdown failed: ${result.signal}`);
}
