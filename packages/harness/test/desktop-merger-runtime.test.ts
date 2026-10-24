import { test } from "node:test";
import { desktopMergerScenarios } from "../scripts/helpers/desktop-merger-scenarios.js";
import { createNativeDesktopProductMerger } from "../src/config/native-desktop-product-merger.js";
for (const [name, run] of desktopMergerScenarios)
  test("original Desktop merger: " + name, () =>
    run(createNativeDesktopProductMerger),
  );
