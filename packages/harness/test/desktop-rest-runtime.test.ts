import { test } from "node:test";
import { desktopRestScenarios } from "../scripts/helpers/desktop-rest-scenarios.js";
import { createNativeDesktopRest } from "../src/http/native-desktop-rest.js";
for (const [name, run] of desktopRestScenarios)
  test("original Desktop REST: " + name, () => run(createNativeDesktopRest));
