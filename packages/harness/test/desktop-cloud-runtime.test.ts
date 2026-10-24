import { test } from "node:test";
import { desktopCloudScenarios } from "../scripts/helpers/desktop-cloud-scenarios.js";
import { createNativeDesktopCloudProduct } from "../src/config/native-desktop-cloud-product.js";
for (const [name, run] of desktopCloudScenarios)
  test("original Desktop cloud: " + name, () =>
    run(createNativeDesktopCloudProduct),
  );
