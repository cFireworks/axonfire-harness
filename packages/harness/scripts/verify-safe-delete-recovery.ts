import { sandboxCliProcessScenario } from "./helpers/sandbox-cli-process-scenario.js";
import { createNativeSandboxCLI } from "../src/sandbox/native-sandbox-cli.js";
import { createNativeSandboxRules } from "../src/sandbox/native-sandbox-rules.js";
import { createNativeBashSandboxManager } from "../src/sandbox/native-bash-sandbox-manager.js";
import { createNativeSandboxShell } from "../src/sandbox/native-sandbox-shell.js";
import { createNativeSecurityAudit } from "../src/sandbox/native-security-audit.js";
import { loadCapturedSandboxCLI } from "./helpers/captured-sandbox-cli.js";
import { loadCapturedSandboxRules } from "./helpers/captured-sandbox-rules.js";
import { loadCapturedBashSandboxManager } from "./helpers/captured-bash-sandbox-manager.js";
import { loadCapturedSandboxShell } from "./helpers/captured-sandbox-shell.js";
import { loadCapturedSecurityAudit } from "./helpers/captured-security-audit.js";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { createHash } from "node:crypto";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedSafeDelete } from "./helpers/captured-safe-delete.js";
import { SAFE_DELETE_CASES } from "./helpers/safe-delete-scenarios.js";
import { safeDeleteVendorRoot } from "./helpers/safe-delete-fixture.js";
import { createNativeSafeDelete } from "../src/sandbox/native-safe-delete.js";
const original = getCapturedBundlePath(),
  source = loadCapturedSafeDelete(readFileSync(original, "utf8")),
  manifest = JSON.parse(
    readFileSync(join(safeDeleteVendorRoot, "shim-manifest.json"), "utf8"),
  );
for (const a of manifest.assets) {
  const port = readFileSync(join(safeDeleteVendorRoot, "shim", a.path)),
    raw = readFileSync(resolve(dirname(original), "../vendor/shim", a.path));
  assert.deepEqual(port, raw);
  assert.equal(createHash("sha256").update(port).digest("hex"), a.sha256);
  assert.equal(port.length, a.bytes);
  assert.equal(
    statSync(join(safeDeleteVendorRoot, "shim", a.path)).mode & 0o777,
    a.mode,
  );
}
for (const c of SAFE_DELETE_CASES) {
  const root = mkdtempSync(join(tmpdir(), "axonfire-safe-pair-"));
  assert.deepEqual(
    await c.run(createNativeSafeDelete, root),
    await c.run(source, root),
    c.name,
  );
}
if (process.platform !== "win32") {
  const cli = readFileSync(original, "utf8"),
    root = mkdtempSync(join(tmpdir(), "axonfire-safe-ipc-pair-"));
  assert.deepEqual(
    await sandboxCliProcessScenario(
      createNativeSandboxCLI,
      createNativeSandboxRules,
      createNativeBashSandboxManager,
      root,
      createNativeSandboxShell,
      createNativeSafeDelete,
      createNativeSecurityAudit,
    ),
    await sandboxCliProcessScenario(
      loadCapturedSandboxCLI(cli),
      loadCapturedSandboxRules(cli),
      loadCapturedBashSandboxManager(cli),
      root,
      loadCapturedSandboxShell(cli),
      source,
      loadCapturedSecurityAudit(cli),
    ),
  );
}
console.log(
  JSON.stringify({
    modules: 7,
    assets: manifest.assets.length,
    comparisons: SAFE_DELETE_CASES.length,
    realProcessPairs: process.platform === "win32" ? 0 : 1,
    bootstrapExecuted: false,
    ok: true,
  }),
);
