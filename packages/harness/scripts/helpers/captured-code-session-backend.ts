import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import * as crypto from "node:crypto";
import * as net from "node:net";
import * as http from "node:http";
import * as https from "node:https";
import ts from "typescript";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
import { CODE_SESSION_BACKEND_SOURCE as meta } from "../../src/terminal/native-code-session-backend.js";
import { createNativeSidecarManager } from "../../src/terminal/native-sidecar-manager.js";
import { createNativeCliPrewarmPool } from "../../src/terminal/native-cli-prewarm-pool.js";
import { createNativeSidecarEnvironment } from "../../src/terminal/native-sidecar-environment.js";
import { createNativeSidecarClientInfo } from "../../src/terminal/native-sidecar-client-info.js";
import { createNativeSidecarCliProductEnvironment } from "../../src/terminal/native-sidecar-cli-product-env.js";
import { createNativeSidecarProxyEnvironment } from "../../src/terminal/native-sidecar-proxy-env.js";
import { createNativeSessionReplayTransport } from "../../src/sessions/native-session-replay-transport.js";
export function loadCapturedCodeSessionBackend() {
  const root =
    process.env.WORKBUDDY_DESKTOP_MAIN ??
    path.resolve(path.dirname(getCapturedBundlePath()), "../../main");
  const target = fs.readFileSync(
    new URL(
      "../../src/terminal/native-code-session-backend.ts",
      import.meta.url,
    ),
    "utf8",
  );
  let wrapper = target
    .slice(target.indexOf("export function"))
    .replace("export function", "function");
  let regions = 0;
  for (const s of meta) {
    const raw = fs.readFileSync(path.join(root, s.file), "utf8");
    assert.equal(
      crypto.createHash("sha256").update(raw).digest("hex"),
      s.sha256,
    );
    for (const r of s.regions) {
      const original = raw.slice(r.from, r.to);
      assert.ok(wrapper.includes(original));
      wrapper = wrapper.replace(original, original);
      regions++;
    }
  }
  const js = ts.transpileModule(wrapper, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2023,
      module: ts.ModuleKind.ESNext,
    },
  }).outputText;
  const names = [
    "node_fs",
    "node_path",
    "nodeOs",
    "node_crypto",
    "node_net",
    "node_http",
    "node_https",
    "createNativeSidecarManager",
    "createNativeCliPrewarmPool",
    "createNativeSidecarEnvironment",
    "createNativeSidecarClientInfo",
    "createNativeSidecarCliProductEnvironment",
    "createNativeSidecarProxyEnvironment",
    "createNativeSessionReplayTransport",
  ];
  return {
    regions,
    factory: new Function(
      ...names,
      js + "\nreturn createNativeCodeSessionBackend;",
    )(
      fs,
      path,
      os,
      crypto,
      net,
      http,
      https,
      createNativeSidecarManager,
      createNativeCliPrewarmPool,
      createNativeSidecarEnvironment,
      createNativeSidecarClientInfo,
      createNativeSidecarCliProductEnvironment,
      createNativeSidecarProxyEnvironment,
      createNativeSessionReplayTransport,
    ),
  };
}
