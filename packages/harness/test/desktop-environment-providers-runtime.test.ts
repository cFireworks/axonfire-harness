import { test } from "node:test";
import { desktopEnvironmentProvidersScenarios } from "../scripts/helpers/desktop-environment-providers-scenarios.js";
import { createNativeDesktopEnvironmentProviders } from "../src/config/native-desktop-environment-providers.js";
for (const [name, run] of desktopEnvironmentProvidersScenarios)
  test("original Desktop environment providers: " + name, () =>
    run(createNativeDesktopEnvironmentProviders),
  );
