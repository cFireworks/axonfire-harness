import { test } from "node:test";
import { desktopProductScenarios } from "../scripts/helpers/desktop-product-scenarios.js";
import { createNativeDesktopProductManager } from "../src/config/native-desktop-product-manager.js";
for (const [name, run] of desktopProductScenarios)
  test("original Desktop product: " + name, () =>
    run(createNativeDesktopProductManager),
  );
