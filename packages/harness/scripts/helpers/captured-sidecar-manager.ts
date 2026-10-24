import { createNativeSidecarClientInfo } from "../../src/terminal/native-sidecar-client-info.js";
import { createNativeSidecarCommon } from "../../src/terminal/native-sidecar-common.js";
import { createNativeSidecarRuntimeContext } from "../../src/terminal/native-sidecar-runtime-context.js";
import { createNativeSidecarProxyEnvironment } from "../../src/terminal/native-sidecar-proxy-env.js";
import { createNativeSidecarLogger } from "../../src/terminal/native-sidecar-logger.js";
import { createNativeSidecarCliProductEnvironment } from "../../src/terminal/native-sidecar-cli-product-env.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import * as path from "node:path";
import ts from "typescript";
import * as fs from "node:fs";
import * as os from "node:os";
import * as crypto from "node:crypto";
import * as childProcess from "node:child_process";
import * as net from "node:net";
import { fileURLToPath } from "node:url";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
import { SIDECAR_MANAGER_SOURCE as meta } from "../../src/terminal/native-sidecar-manager.js";
import { createNativeSidecarEnvironment } from "../../src/terminal/native-sidecar-environment.js";
import { createNativeSidecarClient } from "../../src/terminal/native-sidecar-client.js";
import { createNativeSessionReplayTransport } from "../../src/sessions/native-session-replay-transport.js";
export function loadCapturedSidecarManager() {
  const root =
    process.env.WORKBUDDY_DESKTOP_MAIN ??
    path.resolve(path.dirname(getCapturedBundlePath()), "../../main");
  const raw = readFileSync(path.join(root, meta.file), "utf8");
  assert.equal(createHash("sha256").update(raw).digest("hex"), meta.sha256);
  const source = readFileSync(
    new URL("../../src/terminal/native-sidecar-manager.ts", import.meta.url),
    "utf8",
  );
  for (const d of meta.declarations)
    assert.ok(source.includes(raw.slice(d.from, d.to)), d.names.join(","));
  const begin = source.indexOf("export function createNativeSidecarManager");
  const first = meta.declarations[0]!;
  const bodyStart = source.indexOf(raw.slice(first.from, first.to), begin);
  const originalBody = meta.declarations
    .map((d) => raw.slice(d.from, d.to))
    .join("\n");
  const wrapper = (
    source.slice(begin, bodyStart) +
    originalBody +
    "\nreturn {" +
    meta.declarations.flatMap((d) => [...d.names]).join(",") +
    "};\n}"
  ).replace("export function", "function");
  const transpiled = ts.transpileModule(wrapper, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2023,
      module: ts.ModuleKind.ESNext,
    },
  }).outputText;
  return new Function(
    "createNativeSidecarRuntimeContext",
    "createNativeSidecarProxyEnvironment",
    "createNativeSidecarLogger",
    "createNativeSidecarCliProductEnvironment",
    "createNativeSidecarClientInfo",
    "createNativeSidecarCommon",
    "nodeFs",
    "nodePath",
    "nodeOs",
    "nodeCrypto",
    "nodeChildProcess",
    "nodeNet",
    "fileURLToPath",
    "createNativeSidecarEnvironment",
    "createNativeSidecarClient",
    "createNativeSessionReplayTransport",
    transpiled
      .replace("import.meta.url", JSON.stringify(import.meta.url))
      .replace(/export \{\};?/g, "") + "\nreturn createNativeSidecarManager;",
  )(
    createNativeSidecarRuntimeContext,
    createNativeSidecarProxyEnvironment,
    createNativeSidecarLogger,
    createNativeSidecarCliProductEnvironment,
    createNativeSidecarClientInfo,
    createNativeSidecarCommon,
    fs,
    path,
    os,
    crypto,
    childProcess,
    net,
    fileURLToPath,
    createNativeSidecarEnvironment,
    createNativeSidecarClient,
    createNativeSessionReplayTransport,
  );
}
