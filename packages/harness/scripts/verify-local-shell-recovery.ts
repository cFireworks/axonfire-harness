import { verifyPtyProvenance } from "./helpers/pty-provenance.js";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedLocalShell } from "./helpers/captured-local-shell.js";
import { LOCAL_SHELL_CASES } from "./helpers/local-shell-scenarios.js";
import { createNativeLocalShell } from "../src/sandbox/native-local-shell.js";
const source = loadCapturedLocalShell(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of LOCAL_SHELL_CASES) {
  const root = mkdtempSync(join(tmpdir(), "axonfire-local-pair-"));
  assert.deepEqual(
    await c.run(createNativeLocalShell, root),
    await c.run(source, root),
    c.name,
  );
}
const ptyProvenance = verifyPtyProvenance(getCapturedBundlePath());
console.log(
  JSON.stringify({
    modules: 3,
    ptyProvenance,
    legacyDeclarations: 1,
    comparisons: LOCAL_SHELL_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
