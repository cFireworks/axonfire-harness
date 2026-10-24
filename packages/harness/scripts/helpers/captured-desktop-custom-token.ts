import { createRequire } from "node:module";
import assert from "node:assert/strict";
import * as nodeFs from "node:fs";
import * as nodePath from "node:path";
import * as nodeCrypto from "node:crypto";
import { Subject } from "rxjs";
import { DESKTOP_CUSTOM_TOKEN_SOURCE as source } from "../../src/auth/native-desktop-custom-token.js";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
export function loadCapturedDesktopCustomToken() {
  const root =
    process.env.WORKBUDDY_DESKTOP_MAIN ??
    nodePath.resolve(nodePath.dirname(getCapturedBundlePath()), "../../main");
  const target = nodeFs.readFileSync(
    new URL("../../src/auth/native-desktop-custom-token.ts", import.meta.url),
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
    "nodeRequire",
    "Subject",
    `return function(runtime={}){const require=runtime.require??nodeRequire,process=runtime.process??globalThis.process,Date=runtime.Date??globalThis.Date;${bodies[0]}
const require_chunk={__commonJSMin};var LONG_TIME_AGO,AuthenticationType,Edition,AuthenticationStoragePriority,CustomTokenAuthenticationStorageImpl,CustomTokenAuthenticationProvider;${bodies[1]}
const import_jsonwebtoken={default:require_jsonwebtoken()};return {LONG_TIME_AGO,AuthenticationType,Edition,AuthenticationStoragePriority,CustomTokenAuthenticationStorageImpl,CustomTokenAuthenticationProvider};}`,
  )(createRequire(import.meta.url), Subject);
  return { factory, regions };
}
