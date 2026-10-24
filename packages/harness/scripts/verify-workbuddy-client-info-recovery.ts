import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import * as nodeFs from "node:fs";
import * as nodeCrypto from "node:crypto";
import * as nodeChildProcess from "node:child_process";
import * as nodeUtil from "node:util";
import { BehaviorSubject } from "rxjs";
import { createNativeSidecarClientInfo } from "../src/terminal/native-sidecar-client-info.js";
import { createNativeSidecarRuntimeContext } from "../src/terminal/native-sidecar-runtime-context.js";
import {
  WORKBUDDY_CLIENT_INFO_SOURCE as source,
  createNativeWorkbuddyClientInfo,
} from "../src/auth/native-workbuddy-client-info.js";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { workbuddyClientInfoScenarios } from "./helpers/workbuddy-client-info-scenarios.js";
const root =
  process.env.WORKBUDDY_DESKTOP_MAIN ??
  path.resolve(path.dirname(getCapturedBundlePath()), "../../main");
const raw = Object.fromEntries(
  source.sources.map((s) => {
    const text = fs.readFileSync(path.join(root, s.file), "utf8");
    assert.equal(createHash("sha256").update(text).digest("hex"), s.sha256);
    return [s.file, text];
  }),
);
const target = fs.readFileSync(
  new URL("../src/auth/native-workbuddy-client-info.ts", import.meta.url),
  "utf8",
);
const bodies = source.regions
  .map((r) => {
    const text = raw[r.file]!.slice(r.from, r.to);
    assert.ok(target.includes(text));
    return text;
  })
  .join("\n");
const bindings =
  "const process=runtime.process??globalThis.process,node_fs=runtime.fs??nodeFs,node_crypto=runtime.crypto??nodeCrypto,node_child_process=runtime.childProcess??nodeChildProcess,node_util=nodeUtil;const require_client_info_env=runtime.clientInfoEnv??createNativeSidecarClientInfo(runtime),require_runtime_context=runtime.runtimeContext??createNativeSidecarRuntimeContext(runtime);var ENV_CLIENT_INFO_KEYS,ClientPlatform,IDETypes,getIDEType;const EnvUtils={isNodeRuntime};const require_common$2={BehaviorSubject,EnvUtils,get ENV_CLIENT_INFO_KEYS(){return ENV_CLIENT_INFO_KEYS},get IDETypes(){return IDETypes},getIDEType:(value)=>getIDEType(value)};";
const captured = new Function(
  "nodeFs",
  "nodeCrypto",
  "nodeChildProcess",
  "nodeUtil",
  "BehaviorSubject",
  "createNativeSidecarClientInfo",
  "createNativeSidecarRuntimeContext",
  `return function(runtime={}){${bindings}${bodies};return {WorkbuddyClientInfoProvider,setWorkbuddyClientInfoAssetResolver,readWindowsDownloadChannel,getIDEType,ENV_CLIENT_INFO_KEYS};}`,
)(
  nodeFs,
  nodeCrypto,
  nodeChildProcess,
  nodeUtil,
  BehaviorSubject,
  createNativeSidecarClientInfo,
  createNativeSidecarRuntimeContext,
);
for (const [, run] of workbuddyClientInfoScenarios) {
  await run(captured);
  await run(createNativeWorkbuddyClientInfo);
}
console.log(
  JSON.stringify({
    sourceComparisons: source.regions.length,
    pairedScenarios: workbuddyClientInfoScenarios.length,
  }),
);
