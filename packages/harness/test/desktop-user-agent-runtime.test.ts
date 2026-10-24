import { test } from "node:test";
import { createNativeDesktopUserAgent } from "../src/http/native-desktop-user-agent.js";
import { desktopUserAgentScenarios } from "../scripts/helpers/desktop-user-agent-scenarios.js";
for (const [name, run] of desktopUserAgentScenarios)
  test(`original Desktop User-Agent: ${name}`, () =>
    run(createNativeDesktopUserAgent));
