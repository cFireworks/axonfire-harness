import test from "node:test";
import { autoModeClassifierScenarios } from "../scripts/helpers/auto-mode-classifier-scenarios.js";
test("original Auto classifier projection, two stages, transcript filtering and failure handling", async () => {
  await autoModeClassifierScenarios();
});
