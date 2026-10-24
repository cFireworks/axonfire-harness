import test from "node:test";
import { SHELL_IO_CASES } from "../scripts/helpers/shell-io-scenarios.js";
import { createNativeShellIO } from "../src/sandbox/native-shell-io.js";
for (const c of SHELL_IO_CASES) test(c.name, () => c.run(createNativeShellIO));
