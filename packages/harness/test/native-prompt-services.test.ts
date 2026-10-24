import { test } from "node:test";
import { createNativePromptServices } from "../src/runtime/native-prompt-services.js";
import { promptServicesScenario } from "../scripts/helpers/prompt-services-scenarios.js";
test("original prompt registration selects product templates and renders with captured Nunjucks", async () => {
  await promptServicesScenario(createNativePromptServices);
});
