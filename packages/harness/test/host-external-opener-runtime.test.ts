import { test } from "node:test";
import { createNativeHostExternalUriOpener } from "../src/auth/native-host-external-uri-opener.js";
import { hostExternalOpenerScenarios } from "../scripts/helpers/host-external-opener-scenarios.js";
for (const [name, run] of hostExternalOpenerScenarios)
  test(`original host opener: ${name}`, () =>
    run(createNativeHostExternalUriOpener));
