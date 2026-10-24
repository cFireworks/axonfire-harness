import { test } from "node:test";
import { desktopExternalLinkScenarios } from "../scripts/helpers/desktop-external-link-scenarios.js";
import { createNativeDesktopExternalLink } from "../src/auth/native-desktop-external-link.js";
for (const [name, run] of desktopExternalLinkScenarios)
  test("original Desktop external link: " + name, () =>
    run(createNativeDesktopExternalLink),
  );
