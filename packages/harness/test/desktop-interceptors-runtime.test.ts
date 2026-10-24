import { test } from "node:test";
import { desktopInterceptorScenarios } from "../scripts/helpers/desktop-interceptor-scenarios.js";
import { createNativeDesktopProductInterceptors } from "../src/http/native-desktop-product-interceptors.js";
for (const [name, run] of desktopInterceptorScenarios)
  test("original Desktop interceptor: " + name, () =>
    run(createNativeDesktopProductInterceptors),
  );
