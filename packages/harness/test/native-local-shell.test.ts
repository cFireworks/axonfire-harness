import test from "node:test";
import { LOCAL_SHELL_CASES } from "../scripts/helpers/local-shell-scenarios.js";
import { createNativeLocalShell } from "../src/sandbox/native-local-shell.js";
for (const c of LOCAL_SHELL_CASES)
  test(c.name, () => c.run(createNativeLocalShell));
