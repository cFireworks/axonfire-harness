import { test } from "node:test";
import { desktopAuthScenarios } from "../scripts/helpers/desktop-auth-scenarios.js";
import { createNativeDesktopAuthentication } from "../src/auth/native-desktop-authentication.js";
for (const [name, run] of desktopAuthScenarios)
  test("original Desktop authentication: " + name, () =>
    run(createNativeDesktopAuthentication),
  );
