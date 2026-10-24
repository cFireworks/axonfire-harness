# Async product registration and module runtime

`createNativeProductRegistration` restores complete factories 8588 and 92378: the final product binding entrypoint and its export aggregate. `installNativeModuleRuntime` restores the original Rspack async-module and namespace helper sequence from UTF-16 range `[22118069, 22120807)` of the fixed sample.

## Preserved behavior

The runtime retains dependency queues, nested async module exports, rejection propagation, deferred namespace loading, live export getters, CommonJS/ES-module interop and namespace construction. These are original runtime bodies, not a replacement based on `Promise.all` alone.

The product aggregate imports its component namespaces, activates the process-lifecycle import, and waits for three async dependencies before completing. The final binding entrypoint waits for that aggregate, then captures registered components with the original `autoBind()`.

Its binding callback replaces `ProductConfigBasePath` with a dynamic lookup through `PathUtils.getRootPathSync()`. It binds `OriginalModelProvider` to a lazy, cached lookup of `ModelProviderImpl` through the original container provider. Export getters continue to observe the underlying module's current values.

## Composition

Creation is inert; `load()` activates the product module once and returns its cached async export. The caller supplies the recovered DI namespace and the remaining component namespaces. The original module bodies decide when imports occur and when their promises are awaited.

A shared parent resolver preserves token and component identity across the bootstrap and final registration:

```ts
let bootstrap;
const product = createNativeProductRegistration({
  di,
  getModule: (id) => bootstrap.getModule(id),
});
bootstrap = createNativeContainerBootstrap({
  di,
  configBasePath,
  getModule: (id) => id === 8588 ? product.load() : suppliedModule(id),
});
const container = await bootstrap.start();
```

`suppliedModule` must resolve real component namespaces and the source-map installer. It must not silently return empty objects for missing services. Module 76360 is the original process-lifecycle import; integrating it requires an explicit process and dependency boundary.

The component namespaces imported by factory 92378 are 76360, 74428, 34284, 93747, 84492, 7835, 52943, 31268, 56422, 79279, 92319, 60133, 78449, 94091, 63767 and 47321. Factory 8588 additionally imports 9151, 46307, 26314 and 93039. Restoring the aggregate does not by itself restore or activate every exported component.

## Evidence and tests

The runtime verifier checks the complete captured helper sequence. The product verifier checks both complete factory ASTs. Source/port scenarios exercise nested and held dependencies, rejection, deferred namespaces, live getters, original-model caching and product path overrides.

A composed test runs the original container bootstrap with this recovered final registration, keeps an aggregate dependency pending, then releases it and verifies the final binding override through the real DI container. Component namespaces and process installation remain explicit fixtures; this is not a claim of complete default product startup.

```sh
npm run verify:module-runtime -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run verify:product-registration -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run smoke:native-di -w @axonfire/harness
```

REA evidence `ev_1cce9ffd75ab7ae131af3b5dc6288bf62fb2ce362ad854eee1775c23bc8296b2` covers the two factories and runtime helper sequence as three inert files: 11,940 AST nodes, zero parse failures and partial/truncated semantic coverage. No original bundle entrypoint is executed.

The full remaining factory closure is now available through [native product modules](native-product-modules.md). An isolated process test composes it with the foundation and these original registration factories, successfully creating the container and its OriginalModelProvider binding. The same child test also starts and stops the original Application. The original HTTP listener, gateway OpenAPI and ACP initialization are also verified through [native product runtime](native-product-runtime.md). Model/tool turns and default host migration remain separate requirements.
