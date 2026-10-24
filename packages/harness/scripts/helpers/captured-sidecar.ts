import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as net from "node:net";
import * as crypto from "node:crypto";
import * as childProcess from "node:child_process";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
import { SIDECAR_SOURCE as envSource } from "../../src/terminal/native-sidecar-environment.js";
import { SIDECAR_SOURCE as serverSource } from "../../src/terminal/native-sidecar.js";
export function loadCapturedSidecar() {
  const root =
    process.env.WORKBUDDY_DESKTOP_MAIN ??
    path.resolve(path.dirname(getCapturedBundlePath()), "../../main");
  const bodies = [envSource, serverSource].map((meta, i) => {
    const raw = readFileSync(path.join(root, meta.file), "utf8");
    assert.equal(createHash("sha256").update(raw).digest("hex"), meta.sha256);
    const body = raw.slice(meta.from, meta.to);
    const target = readFileSync(
      new URL(
        "../../src/terminal/" +
          (i ? "native-sidecar" : "native-sidecar-environment") +
          ".ts",
        import.meta.url,
      ),
      "utf8",
    );
    assert.ok(
      target.includes(body),
      meta.file + " complete original declaration region",
    );
    return body + "\nreturn {" + meta.names.join(",") + "};";
  });
  const environment = (runtime: any = {}) =>
    new Function("fs", "os", "path", "crypto", "process", bodies[0]!)(
      runtime.fs ?? fs,
      runtime.os ?? os,
      path,
      crypto,
      runtime.process ?? process,
    );
  const sidecar = (runtime: any = {}) =>
    new Function(
      "fs",
      "net",
      "crypto",
      "node_crypto",
      "node_child_process",
      "require_cli_process_env",
      "require",
      "console",
      bodies[1]!,
    )(
      fs,
      net,
      crypto,
      crypto,
      childProcess,
      runtime.environment ?? environment(),
      runtime.require ?? createRequire(import.meta.url),
      runtime.console ?? console,
    );
  return {
    environment,
    sidecar,
    declarations: envSource.names.length + serverSource.names.length,
  };
}
