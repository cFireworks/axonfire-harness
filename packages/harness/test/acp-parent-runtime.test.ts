import test from "node:test";
import { ACP_PARENT_CASES } from "../scripts/helpers/acp-parent-scenarios.js";
import {
  acpRendezvousSdk,
  ACP_RENDEZVOUS_MODES,
} from "../scripts/helpers/acp-rendezvous-sdk.js";
for (const scenario of ACP_PARENT_CASES)
  test(scenario.name, () => scenario.run());
for (const mode of ACP_RENDEZVOUS_MODES)
  test(
    "source ACP newSession / HTTP / native sessions / View rendezvous / full interruption / SDK: " +
      mode,
    { timeout: 20000 },
    async () => {
      await acpRendezvousSdk(undefined, mode);
    },
  );
