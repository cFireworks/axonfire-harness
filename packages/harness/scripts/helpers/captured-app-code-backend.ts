import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
import { APP_CODE_BACKEND_SOURCE as meta } from "../../src/terminal/native-app-code-backend.js";
import { createNativeAppCliEnvironment } from "../../src/terminal/native-app-cli-environment.js";
export function loadCapturedAppCodeBackend() {
  const root =
    process.env.WORKBUDDY_DESKTOP_MAIN ??
    path.resolve(path.dirname(getCapturedBundlePath()), "../../main");
  const sources = new Map<string, string>();
  for (const s of meta.sources) {
    const raw = fs.readFileSync(path.join(root, s.file), "utf8");
    assert.equal(createHash("sha256").update(raw).digest("hex"), s.sha256);
    sources.set(s.file, raw);
  }
  const target = fs.readFileSync(
    new URL("../../src/terminal/native-app-code-backend.ts", import.meta.url),
    "utf8",
  );
  const body = meta.regions
    .map((r) => {
      const t = sources.get(r.file)!.slice(r.from, r.to);
      assert.ok(target.includes(t));
      return t;
    })
    .join("\n");
  return (runtime: any = {}) => {
    const env =
      runtime.cliEnvironment ?? createNativeAppCliEnvironment(runtime);
    return new Function(
      "console",
      "resolveWorkbuddyAppServerCodeCliPath",
      "buildWorkbuddyAppServerCodeCliEnv",
      body +
        "\nconst require_workbuddy_auth_product_coordinator={buildConnectorProxyMcpConfig};return {" +
        meta.names.join(",") +
        "};",
    )(
      runtime.console ?? console,
      env.resolveWorkbuddyAppServerCodeCliPath,
      env.buildWorkbuddyAppServerCodeCliEnv,
    );
  };
}
