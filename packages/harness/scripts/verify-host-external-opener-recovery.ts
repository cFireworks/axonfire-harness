import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { Subject } from "rxjs";
import {
  HOST_EXTERNAL_URI_OPENER_SOURCE as source,
  createNativeHostExternalUriOpener,
} from "../src/auth/native-host-external-uri-opener.js";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { hostExternalOpenerScenarios } from "./helpers/host-external-opener-scenarios.js";
const root =
  process.env.WORKBUDDY_DESKTOP_MAIN ??
  path.resolve(path.dirname(getCapturedBundlePath()), "../../main");
const raw = fs.readFileSync(path.join(root, source.file), "utf8");
assert.equal(createHash("sha256").update(raw).digest("hex"), source.sha256);
const target = fs.readFileSync(
  new URL("../src/auth/native-host-external-uri-opener.ts", import.meta.url),
  "utf8",
);
const bodies = source.regions
  .map((r) => {
    const body = raw.slice(r.from, r.to);
    assert.ok(target.includes(body));
    return body;
  })
  .join("\n");
const captured = new Function(
  "Subject",
  `return function(runtime={}){const require_common$2={Subject};const process=runtime.process??globalThis.process,console=runtime.console??globalThis.console;${bodies};return {WorkbuddyHostExternalUriOpener,setWorkbuddyExternalUriOpenDelegate,openExternalWithLocalMock};}`,
)(Subject);
for (const [, run] of hostExternalOpenerScenarios) {
  await run(captured);
  await run(createNativeHostExternalUriOpener);
}
console.log(
  JSON.stringify({
    sourceComparisons: source.regions.length,
    pairedScenarios: hostExternalOpenerScenarios.length,
  }),
);
