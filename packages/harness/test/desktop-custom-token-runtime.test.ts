import { test } from "node:test";
import { desktopCustomTokenScenarios } from "../scripts/helpers/desktop-custom-token-scenarios.js";
import { createNativeDesktopCustomToken } from "../src/auth/native-desktop-custom-token.js";
for (const [name, run] of desktopCustomTokenScenarios)
  test("original Desktop custom token: " + name, () =>
    run(createNativeDesktopCustomToken),
  );
