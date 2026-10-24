import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { BehaviorSubject } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators/index.js";
import { createNativeAuthenticationRuntime } from "../../src/auth/native-authentication.js";
import { createNativeAuthProductCoordinator } from "../../src/config/native-auth-product-coordinator.js";
import { DESKTOP_AUTHENTICATION_SOURCE as source } from "../../src/auth/native-desktop-authentication.js";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
export function loadCapturedDesktopAuthentication() {
  const root =
      process.env.WORKBUDDY_DESKTOP_MAIN ??
      path.resolve(path.dirname(getCapturedBundlePath()), "../../main"),
    raw = fs.readFileSync(path.join(root, source.file), "utf8");
  assert.equal(createHash("sha256").update(raw).digest("hex"), source.sha256);
  const target = fs.readFileSync(
    new URL("../../src/auth/native-desktop-authentication.ts", import.meta.url),
    "utf8",
  );
  const body = source.regions
    .map((r) => {
      const text = raw.slice(r.from, r.to);
      assert.ok(target.includes(text), String(r.from));
      return text;
    })
    .join("\n");
  const factory = new Function(
    "BehaviorSubject",
    "distinctUntilChanged",
    "createNativeAuthenticationRuntime",
    "createNativeAuthProductCoordinator",
    `return function(runtime={}){const console=runtime.console??globalThis.console,Date=runtime.Date??globalThis.Date,Math=runtime.Math??globalThis.Math;const clearTimeout=runtime.clearTimeout??globalThis.clearTimeout,clearInterval=runtime.clearInterval??globalThis.clearInterval;const core=runtime.core??createNativeAuthenticationRuntime(runtime).core;const ProductFeature=runtime.productFeatures??createNativeAuthProductCoordinator(runtime).common.ProductFeature;const import_common$12=core,import_common$14=core,import_common$57=core,HttpHeaders={},import_common$13={HttpHeaders};var _AuthenticationManagerImpl,${source.names.join(",")};${body}\nreturn {AuthenticationManagerImpl,SubscriptionManager,CanceledError,SignLicenseError,UnauthorizedError,NotFoundError,AuthErrorCode,isWorkbuddyAuthenticationPlatform};}`,
  )(
    BehaviorSubject,
    distinctUntilChanged,
    createNativeAuthenticationRuntime,
    createNativeAuthProductCoordinator,
  );
  return { factory, regions: source.regions.length };
}
