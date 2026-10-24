import test from "node:test";
import {
  SANDBOX_PROTOCOL_CASES,
  sandboxProtocolFactories,
} from "../scripts/helpers/sandbox-protocol-scenarios.js";
for (const scenario of SANDBOX_PROTOCOL_CASES)
  test(scenario.name, () => scenario.run(sandboxProtocolFactories));
