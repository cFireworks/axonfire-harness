import assert from "node:assert/strict";
import test from "node:test";
import { loadProductConfiguration } from "../src/config/product-config.js";
import {
  DefaultPromptRenderer,
  ProductPromptRenderer,
} from "../src/prompts/prompt-renderer.js";

test("Nunjucks rendering matches WorkBuddy options", () => {
  const renderer = new DefaultPromptRenderer();
  const result = renderer.renderTemplate(
    "{% if enabled %}<x>{{ value }}</x>{% endif %}",
    { enabled: true, value: "<raw>" },
  );
  assert.equal(result, "<x><raw></x>");
});

test("named prompt resolution returns original template", async () => {
  const product = await loadProductConfiguration();
  const renderer = new ProductPromptRenderer(product);
  assert.equal(
    renderer.template("cli-agent-prompt"),
    product.promptsByName.get("cli-agent-prompt")?.template,
  );
  assert.match(
    renderer.render("compact-agent-prompt", { language: "中文" }),
    /中文/,
  );
});
