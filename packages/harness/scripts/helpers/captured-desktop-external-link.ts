import { URI as URI$1 } from "vscode-uri";
import { createNativeAuthenticationRuntime } from "../../src/auth/native-authentication.js";
import assert from "node:assert/strict";
import * as nodeFs from "node:fs";
import * as nodePath from "node:path";
import * as nodeCrypto from "node:crypto";
import { Subject } from "rxjs";
import { DESKTOP_EXTERNAL_LINK_SOURCE as source } from "../../src/auth/native-desktop-external-link.js";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
export function loadCapturedDesktopExternalLink() {
  const root =
    process.env.WORKBUDDY_DESKTOP_MAIN ??
    nodePath.resolve(nodePath.dirname(getCapturedBundlePath()), "../../main");
  const target = nodeFs.readFileSync(
    new URL("../../src/auth/native-desktop-external-link.ts", import.meta.url),
    "utf8",
  );
  let regions = 0;
  const bodies = [source].map((g) => {
    const raw = nodeFs.readFileSync(nodePath.join(root, g.file), "utf8");
    assert.equal(
      nodeCrypto.createHash("sha256").update(raw).digest("hex"),
      g.sha256,
    );
    return g.regions
      .map((r) => {
        const text = raw.slice(r.from, r.to);
        assert.ok(target.includes(text), `${g.file}:${r.from}`);
        regions++;
        return text;
      })
      .join("\n");
  });
  const factory = new Function(
    "URI$1",
    "createNativeAuthenticationRuntime",
    `return function(runtime={}){const core=runtime.core??createNativeAuthenticationRuntime(runtime).core,import_common$10=core,import_common$14=core;const process=runtime.process??globalThis.process,Date=runtime.Date??globalThis.Date,console=runtime.console??globalThis.console,setTimeout=runtime.setTimeout??globalThis.setTimeout,clearTimeout=runtime.clearTimeout??globalThis.clearTimeout;var globalLoginStepCallback,globalLoginSessionId,${source.names.join(",")};${bodies[0]}
if(runtime.authenticationApi){({CanceledError,SignLicenseError,UnauthorizedError}=runtime.authenticationApi);}
return {${source.names.join(",")},setLoginStepCallback,emitLoginStep,toSignLicenseError,normalizeAccountType,normalizeAccountAvatar,createAccountSnapshot,mergeCurrentAccountDetails,isWorkbuddyAuthenticationPlatform};}`,
  )(URI$1, createNativeAuthenticationRuntime);
  return { factory, regions };
}
