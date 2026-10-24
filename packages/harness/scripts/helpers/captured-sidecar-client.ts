import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import * as net from "node:net";
import * as events from "node:events";
import * as path from "node:path";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
import { SIDECAR_CLIENT_SOURCE as meta } from "../../src/terminal/native-sidecar-client.js";
import { createNativeSidecarEnvironment } from "../../src/terminal/native-sidecar-environment.js";
export function loadCapturedSidecarClient() {
  const root =
    process.env.WORKBUDDY_DESKTOP_MAIN ??
    path.resolve(path.dirname(getCapturedBundlePath()), "../../main");
  const raw = readFileSync(path.join(root, meta.file), "utf8");
  assert.equal(createHash("sha256").update(raw).digest("hex"), meta.sha256);
  const body = raw.slice(meta.from, meta.to);
  assert.ok(
    readFileSync(
      new URL("../../src/terminal/native-sidecar-client.ts", import.meta.url),
      "utf8",
    ).includes(body),
  );
  return (runtime: any = {}) =>
    new Function(
      "net",
      "node_events",
      "require_cli_process_env",
      "console",
      body + "\nreturn {SidecarClient};",
    )(
      runtime.net ?? net,
      events,
      runtime.environment ?? createNativeSidecarEnvironment(),
      runtime.console ?? console,
    );
}
