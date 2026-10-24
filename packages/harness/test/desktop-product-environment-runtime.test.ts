import { test } from "node:test";
import { desktopProductEnvironmentScenarios } from "../scripts/helpers/desktop-product-environment-scenarios.js";
import { createNativeDesktopProductEnvironment } from "../src/auth/native-desktop-product-environment.js";
for (const [name, run] of desktopProductEnvironmentScenarios)
  test("original Desktop product environment: " + name, () =>
    run(createNativeDesktopProductEnvironment),
  );
