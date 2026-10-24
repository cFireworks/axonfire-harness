# Native prompt and model services

`createNativePromptServices` restores namespaces 83052 and 24015 and 244 complete factories. They include prompt/message/model abstractions, streaming helpers, product prompt providers, evaluators, renderers, PromptManager and the captured Nunjucks implementation and its dependencies. Sixteen parent modules reuse the recovered DI, product, filesystem, HTTP and Express graph.

Original stages 94666 and 59747 now register these services in the Backend foundation. Every synchronous namespace preceding final product registration is backed by recovered factories or the sample's exact empty factories. The final asynchronous product aggregate remains a separate integration boundary.

## Original prompt behavior

ProductPromptProvider subscribes to ProductManager configuration and publishes its `prompts` array. PromptManager groups templates by name, selects an evaluator by positive priority, and chooses the highest positive template score. The default evaluator adds matching-tag counts to its base score; ties preserve the first selected template. Renderer selection likewise uses positive priority.

The default renderer uses the captured Nunjucks Environment with escaping disabled. Compiled templates are cached by their source string. Rendering errors follow the original logging and fallback path. Provider notifications replace the manager's template map; no prompts or instructions are rewritten by this wrapper.

The model-side PromptImpl supports string or message inputs and copies supported message types. Its `copy()` recreates message objects but retains the model-options object identity. Original streaming decoders, model/result helpers and error types remain part of the restored namespace.

## Host and verification

Supply shared DI, globals, process, Node require, filename, Express and parent resolvers. The explicit filename supports captured dependency diagnostics that refer to `__filename`. Creation is lazy. The original application lifecycle controls provider and manager initialization; the isolated scenario calls those initialization methods explicitly. The wrapper does not add disposal hooks missing from the original classes.

Source-paired tests use real registration stages and ProductManager with a temporary product configuration. They verify tag-based selection, missing templates, unescaped rendering, loops, template-cache identity, configuration-driven replacement and prompt-copy behavior. The separate Backend integration starts the real application with these registrations and serves HTTP health. Complete product bootstrapping and the default CLI/Web graph still require the final async aggregate and its dependencies.

All 244 factory ASTs match the fixed sample. REA evidence `ev_b6f84d8a23472cd23788fe3c61b72f6d88cce0317915de1909f3735ac04b2abe` covers 244 parsed files, 99,120 AST nodes and zero parse failures. Semantic analysis is bounded at 750 nodes, 150 unknowns and 45 seconds. The original whole-bundle bootstrap is never evaluated.

```sh
npm run verify:prompt-services -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run verify:backend-foundation -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run smoke:native-di -w @axonfire/harness
```
