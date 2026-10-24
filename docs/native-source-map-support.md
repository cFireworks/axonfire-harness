# Native source-map support

`createNativeSourceMapSupport` restores factory 25844 and its complete 15-factory closure, including the original source-map consumer, generator and source-node implementations. This supplies the installer called at the beginning of the original container bootstrap.

## Activation and ownership

Creation loads the module exports but does not install stack or exception handlers. Call `install()` explicitly, or supply the returned module as bootstrap parent 25844.

The wrapper requires explicit `require`, `process` and `Error` surfaces. It preserves the original installer behavior:

- `Error.prepareStackTrace` maps stack locations through retrieved source maps.
- Inline maps and filesystem map references use the original retrieval/cache pipeline.
- By default, installation wraps the supplied process's `emit` to print and exit for an otherwise unhandled uncaught exception.
- Existing uncaught-exception listeners retain their handling path.
- Repeated installation does not repeatedly wrap the process or reinstall the stack formatter.
- `resetRetrieveHandlers()` resets retrieval callbacks; it does **not** undo process or Error patches.

The module has no added global teardown or altered exception policy. A caller using the real process and Error owns those process-wide changes. The optional `hookRequire` path retains the original bundled dynamic-require behavior; the wrapper does not synthesize a `module.require` method.

## Bootstrap composition

```ts
const sourceMaps = createNativeSourceMapSupport({
  require: createRequire(import.meta.url),
  process,
  Error,
});
const bootstrap = createNativeContainerBootstrap({
  di,
  configBasePath,
  getModule: (id) => id === 25844 ? sourceMaps : resolveOtherModule(id),
});
```

Constructing these objects does not execute the original bundle entrypoint. Bootstrap activation remains an explicit `bootstrap.start()` operation. Other component namespaces still require real implementations.

## Verification

`verify:source-map-support` compares all 15 complete factory ASTs and four source/port scenarios:

- Original bootstrap installation with the real source-map module.
- Real temporary JavaScript files with inline maps, mapped VM exception stacks and source excerpts.
- Repeated installation, existing exception listeners, and the unhandled print/exit path.
- Retrieval overrides/reset and invalid environment rejection.

Tests use a separate VM Error constructor and an EventEmitter-backed process with recorded exit calls. They assert that the test runner's Error stack formatter remains unchanged.

REA evidence `ev_95437730825da5fa5f0de1b5fb7a7563c3127b296a6f812f5a6294d2d02ede44` covers 15 parsed files and 10,437 AST nodes, with zero parse failures and partial/truncated semantic coverage. Analysis does not execute the original bundle bootstrap.

```sh
npm run verify:source-map-support -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run smoke:native-di -w @axonfire/harness
```
