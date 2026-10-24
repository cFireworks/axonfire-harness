import { test } from "node:test";
import { desktopFileAuthScenarios } from "../scripts/helpers/desktop-file-auth-scenarios.js";
import { createNativeDesktopFileAuthentication } from "../src/auth/native-desktop-file-authentication.js";
for (const [name, run] of desktopFileAuthScenarios)
  test("original Desktop file authentication: " + name, () =>
    run(createNativeDesktopFileAuthentication),
  );
