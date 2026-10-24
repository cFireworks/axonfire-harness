import { join } from "node:path";

// Owned model/tool fixtures do not test package-manager discovery, remote
// marketplaces or telemetry. Use the original opt-outs, never change the
// production launcher's defaults or substitute recovered service methods.
export const nativeFixtureEnv = Object.freeze({
  PATH: process.platform === "win32"
    ? join(process.env.SystemRoot ?? "C:\\Windows", "System32")
    : "/usr/bin:/bin",
  DISABLE_TELEMETRY: "1",
  CODEBUDDY_REMOTE_CONFIG_DISABLED: "true",
  DISABLE_AUTOUPDATER: "1",
  DISABLE_GALILEO: "1",
  CODEBUDDY_SKIP_BUILTIN_MARKETPLACE: "1",
});
