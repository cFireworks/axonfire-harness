import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import {
  DESKTOP_USER_AGENT_SOURCE as source,
  createNativeDesktopUserAgent,
} from "../src/http/native-desktop-user-agent.js";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { desktopUserAgentScenarios } from "./helpers/desktop-user-agent-scenarios.js";
const root =
  process.env.WORKBUDDY_DESKTOP_MAIN ??
  path.resolve(path.dirname(getCapturedBundlePath()), "../../main");
const raw = fs.readFileSync(path.join(root, source.file), "utf8");
assert.equal(createHash("sha256").update(raw).digest("hex"), source.sha256);
const target = fs.readFileSync(
  new URL("../src/http/native-desktop-user-agent.ts", import.meta.url),
  "utf8",
);
const body = source.regions
  .map((r) => {
    const text = raw.slice(r.from, r.to);
    assert.ok(target.includes(text));
    return text;
  })
  .join("\n");
const captured = new Function(
  `const HttpHeaders={},import_common$31={HttpHeaders};var UserAgentHttpInterceptor,SkipUserAgentMergeHeader;${body};return {UserAgentHttpInterceptor,SkipUserAgentMergeHeader,HttpHeaders};`,
);
for (const [, run] of desktopUserAgentScenarios) {
  await run(captured as () => any);
  await run(createNativeDesktopUserAgent);
}
console.log(
  JSON.stringify({
    sourceComparisons: source.regions.length,
    pairedScenarios: desktopUserAgentScenarios.length,
  }),
);
