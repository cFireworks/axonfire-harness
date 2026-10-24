# Native product configuration services

`createNativeProductConfigServices` restores 62 complete factories from namespaces 9151 and 55762. They include the original ProductManager and CloudProductManager, product providers and merge strategies, client/environment/custom-model sources, model catalog and capability helpers, feature filters, gzip support and endpoint interceptor. Shared dependencies retain the existing foundation's module identities.

## Original registration and configuration

The shared Backend foundation routes stages 54387 and 66892. The first registers product services; the second registers source providers and binds ProductConfigBasePath to the bootstrap's explicit config directory. The later product-registration override remains a separate stage.

Supply the shared DI, globals, process, require and parent resolver, an Express resolver, and `basePath` for the original `__dirname`. Constructing the wrapper is inert. Instantiating ProductManager starts its original cache load and synchronization; providers may read configuration, perform network requests and install file watchers according to the captured implementation.

ClientProductProvider searches the configured directory and parent directories for product.json and caches its parsed result. Environment providers retain legacy field stripping and source selection. Custom model providers retain watcher behavior, environment substitutions and model metadata enrichment. Merge strategies and AvailableModelsFilterProvider remain original code, including filtering the final model list by availableModels. Partial Galileo connection overrides retain the original disable/reset behavior.

## Lifecycle and evidence

The integration scenario uses an owned temporary directory and process environment. It verifies client caching after the file changes, environment precedence and legacy stripping, custom-model loading and filtering, ProductManager synchronization, endpoint normalization, incomplete telemetry override behavior and watcher disposal. The actual CloudProductManager fetches configuration from a local HTTP server; the original endpoint interceptor routes a relative request through a local override and adds the product header.

All 62 factory ASTs are checked against the fixed sample, and the same scenario runs against captured and recovered factories. The foundation scenario also loads both registration stages before serving a health request. These checks do not establish production authentication, remote configuration availability or all later product providers. Remaining product registrations still need to be connected.

Call provider disposal/container teardown after outstanding synchronization finishes. The wrapper does not add cancellation semantics to the original manager's background work.

```sh
npm run verify:product-config-services -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run verify:backend-foundation -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run smoke:native-di -w @axonfire/harness
```

REA evidence `ev_a8dcb00929b387130581c25c76efb058fba13402a6ed95061cd5e51822df9689` covers 62 inert files, 74,885 AST nodes and zero parse failures. Semantic coverage is partial/truncated at 750 nodes and 150 unknowns with a 45-second budget. The full original bundle entrypoint is never evaluated.
