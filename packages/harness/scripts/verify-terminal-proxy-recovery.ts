import { createNativeTerminalProxy } from "../src/terminal/native-terminal-proxy.js";
import {
  loadCapturedTerminalProxy,
  verifyTerminalProxyWebSocketSources,
} from "./helpers/captured-terminal-proxy.js";
import { terminalProxyScenarios } from "./helpers/terminal-proxy-scenarios.js";
const websocketFiles = verifyTerminalProxyWebSocketSources();
const captured = loadCapturedTerminalProxy();
for (const [, run] of terminalProxyScenarios) {
  await run(captured);
  await run(createNativeTerminalProxy);
}
console.log(
  JSON.stringify({
    sourceComparisons: 6,
    websocketFiles,
    pairedScenarios: terminalProxyScenarios.length,
  }),
);
