import test from "node:test";
import {
  ACP_PARENT_RECOVERY_MODES,
  acpParentSessionLifecycle,
  ACP_PARENT_FAILURE_MODES,
  acpParentFailureLifecycle,
} from "../scripts/helpers/acp-parent-session-lifecycle.js";
for (const mode of ACP_PARENT_RECOVERY_MODES)
  test(
    "native parent disk recovery and SDK continuation: " + mode,
    { timeout: 25000 },
    async () => {
      await acpParentSessionLifecycle(mode);
    },
  );
for (const mode of ACP_PARENT_FAILURE_MODES)
  test(
    "native parent failed/missing entrance preserves source behavior: " + mode,
    { timeout: 25000 },
    async () => {
      await acpParentFailureLifecycle(mode);
    },
  );
