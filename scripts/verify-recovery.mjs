import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";
const bundle = process.argv[2] ?? process.env.WORKBUDDY_BUNDLE;
if (!bundle)
  throw new Error(
    "Usage: npm run verify:recovery -- /absolute/path/to/captured/codebuddy.js (not distributed)",
  );
const pkg = JSON.parse(
  readFileSync(new URL("../packages/harness/package.json", import.meta.url)),
);
for (const name of Object.keys(pkg.scripts).filter(
  (name) => name.startsWith("verify:") && name !== "verify:config",
)) {
  const result = spawnSync(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["run", name, "-w", "@axonfire/harness", "--", resolve(bundle)],
    { stdio: "inherit" },
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}
