import assert from "node:assert/strict";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedShellIO } from "./helpers/captured-shell-io.js";
import { SHELL_IO_CASES } from "./helpers/shell-io-scenarios.js";
import {
  createNativeShellIO,
  SHELL_IO_MODULES,
} from "../src/sandbox/native-shell-io.js";
const source = loadCapturedShellIO(
  readFileSync(getCapturedBundlePath(), "utf8"),
);
for (const c of SHELL_IO_CASES) {
  const root = mkdtempSync(join(tmpdir(), "axonfire-io-pair-"));
  assert.deepEqual(
    await c.run(createNativeShellIO, root),
    await c.run(source, root),
    c.name,
  );
}
console.log(
  JSON.stringify({
    modules: SHELL_IO_MODULES.length,
    comparisons: SHELL_IO_CASES.length,
    bootstrapExecuted: false,
    ok: true,
  }),
);
