import assert from "node:assert/strict";
import * as nodeFs from "node:fs";
import * as nodePath from "node:path";
import * as nodeCrypto from "node:crypto";
import { Subject } from "rxjs";
import { DESKTOP_FILE_AUTHENTICATION_SOURCE as source } from "../../src/auth/native-desktop-file-authentication.js";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
export function loadCapturedDesktopFileAuthentication() {
  const root =
    process.env.WORKBUDDY_DESKTOP_MAIN ??
    nodePath.resolve(nodePath.dirname(getCapturedBundlePath()), "../../main");
  const target = nodeFs.readFileSync(
    new URL(
      "../../src/auth/native-desktop-file-authentication.ts",
      import.meta.url,
    ),
    "utf8",
  );
  let regions = 0;
  const bodies = source.map((g) => {
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
    "nodeFs",
    "nodePath",
    "nodeCrypto",
    "Subject",
    `return function(runtime={}){const fs=runtime.fs??nodeFs,path=nodePath,node_crypto=runtime.crypto??nodeCrypto,process=runtime.process??globalThis.process,Date=runtime.Date??globalThis.Date,setTimeout=runtime.setTimeout??globalThis.setTimeout,clearTimeout=runtime.clearTimeout??globalThis.clearTimeout;var AuthenticationStoragePriority,_FileAuthenticationStorage;${bodies[0]}\nconst require_common$1={Subject,getLogoutMarkerPath,AuthenticationStoragePriority};${bodies[1]}\nreturn {FileAuthenticationStorage,setWorkbuddyAuthenticationConfigurationProvider,getWorkbuddyAuthenticationConfiguration,setWorkbuddyLegacyAuthSessionMigrator,getLogoutMarkerPath,AuthenticationStoragePriority};}`,
  )(nodeFs, nodePath, nodeCrypto, Subject);
  return { factory, regions };
}
