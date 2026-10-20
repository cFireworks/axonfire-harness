import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const cwd = fileURLToPath(new URL("../", import.meta.url));
const env = Object.fromEntries(
  Object.entries(process.env).filter(
    ([name]) => !/^(CODEBUDDY_|WORKBUDDY_|OPENAI_|AXONFIRE_)/.test(name),
  ),
);
const help = spawnSync(process.execPath, ["apps/cli/axonfire.mjs", "--help"], {
  cwd,
  env,
  encoding: "utf8",
});
assert.equal(help.status, 0);
assert.match(help.stdout, /Usage: npm run cli/);
console.log("PASS compiled CLI launcher help (no credentials)");

const directory = await mkdtemp(join(tmpdir(), "axonfire-launcher-"));
const child = spawn(
  process.execPath,
  ["apps/cli/axonfire.mjs", "web", "--demo", "--port", "0", "--cwd", directory],
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
  console.log(
    "PASS Web launcher → real SDK → recovered harness → streamed offline answer",
  );
} finally {
  child.kill("SIGTERM");
  const result = await exited;
  clearTimeout(timeout);
  await rm(directory, { recursive: true, force: true });
  assert.equal(result.code, 0, `Web shutdown failed: ${result.signal}`);
}
