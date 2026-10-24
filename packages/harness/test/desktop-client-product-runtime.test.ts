import { test } from "node:test";
import { desktopClientProductScenarios } from "../scripts/helpers/desktop-client-product-scenarios.js";
import { createNativeDesktopClientProduct } from "../src/config/native-desktop-client-product.js";
for (const [name, run] of desktopClientProductScenarios)
  test("original Desktop client product: " + name, () =>
    run(createNativeDesktopClientProduct),
  );
