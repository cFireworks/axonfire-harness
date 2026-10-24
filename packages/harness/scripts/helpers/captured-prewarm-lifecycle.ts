import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import * as crypto from "node:crypto";
import * as childProcess from "node:child_process";
import * as net from "node:net";
import ts from "typescript";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
import * as pool from "../../src/terminal/native-cli-prewarm-pool.js";
import * as stop from "../../src/sessions/native-app-server-stop.js";
import { createNativeSidecarEnvironment } from "../../src/terminal/native-sidecar-environment.js";
export const recoveredPrewarmLifecycle = {
  pool: pool.createNativeCliPrewarmPool,
  stop: stop.createNativeAppServerStop,
};
export function loadCapturedPrewarmLifecycle() {
  const root =
    process.env.WORKBUDDY_DESKTOP_MAIN ??
    path.resolve(path.dirname(getCapturedBundlePath()), "../../main");
  const p = pool.PREWARM_SOURCE,
    st = stop.APP_SERVER_STOP_SOURCE;
  const raw = fs.readFileSync(path.join(root, p.file), "utf8"),
    main = fs.readFileSync(path.join(root, st.file), "utf8");
  assert.equal(crypto.createHash("sha256").update(raw).digest("hex"), p.sha256);
  assert.equal(
    crypto.createHash("sha256").update(main).digest("hex"),
    st.sha256,
  );
  const target = fs.readFileSync(
    new URL("../../src/terminal/native-cli-prewarm-pool.ts", import.meta.url),
    "utf8",
  );
  const body = p.regions
    .map((r) => {
      const value = raw.slice(r.from, r.to);
      assert.ok(target.includes(value));
      return value;
    })
    .join("\n");
  const wrapper = (
    target.slice(
      target.indexOf("export function"),
      target.indexOf("// BEGIN ORIGINAL"),
    ) +
    body +
    "\n" +
    target.slice(target.indexOf("// END ORIGINAL"))
  ).replace("export function", "function");
  const output = ts.transpileModule(wrapper, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2023,
      module: ts.ModuleKind.ESNext,
    },
  }).outputText;
  const originalPool = new Function(
    "nodeFs",
    "node_path",
    "node_os",
    "nodeNet",
    "nodeCrypto",
    "nodeChildProcess",
    "createNativeSidecarEnvironment",
    output + "\nreturn createNativeCliPrewarmPool;",
  )(fs, path, os, net, crypto, childProcess, createNativeSidecarEnvironment);
  const originalStop = main.slice(st.from, st.to);
  const stopTarget = fs.readFileSync(
    new URL("../../src/sessions/native-app-server-stop.ts", import.meta.url),
    "utf8",
  );
  assert.ok(stopTarget.includes(originalStop));
  const start = stopTarget.indexOf("export function");
  const stopWrapper = (
    stopTarget.slice(start, stopTarget.indexOf("return {", start)) +
    "return {" +
    originalStop +
    "};\n}"
  ).replace("export function", "function");
  const stopOutput = ts.transpileModule(stopWrapper, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2023,
      module: ts.ModuleKind.ESNext,
    },
  }).outputText;
  return {
    services: {
      pool: originalPool,
      stop: new Function(stopOutput + "\nreturn createNativeAppServerStop;")(),
    },
    regions: p.regions.length + 1,
  };
}
