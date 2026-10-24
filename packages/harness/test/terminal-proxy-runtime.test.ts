import { test } from "node:test";
import { createNativeTerminalProxy } from "../src/terminal/native-terminal-proxy.js";
import { terminalProxyScenarios } from "../scripts/helpers/terminal-proxy-scenarios.js";
for (const [name, run] of terminalProxyScenarios)
  test("native terminal proxy: " + name, () => run(createNativeTerminalProxy));
