# Native MVC controllers

`createNativeHttpController` restores 81 complete factories from namespace 37819, including controller and method decorators, route building and matching, argument and response resolvers, exception routes, views, Mustache rendering and filesystem helpers. It shares the recovered DI metadata, HTTP services and Express dependencies.

## Assembly and ownership

Pass the same `di`, `http`, and `express` module resolvers used by the backend, plus Node `require` and an explicit `basePath`. The latter supplies the original bundled `__dirname` for template and file views. The recovered implementations retain their original configuration lookup and path joining behavior.

Creation is inert. `load()` evaluates namespace 37819 and registers its original decorated components; it does not bind a container itself. The original bootstrap requests this namespace in stage 94015 and then consumes registrations through `autoBind()`. `createNativeBackendFoundation` now routes this stage and requires `basePath` when MVC is requested. Register application controllers before the final relevant `autoBind()` and before the route provider is instantiated.

No synthetic route adapter is required. Controllers use the recovered `Controller`, HTTP method, parameter, `Json`, `Html`, `File`, `Header` and `Catch` decorators. The framework builds routes from metadata and dispatches through its original MVC HandlerAdapter. Application-specific controllers and product service dependencies still need to be connected separately.

## Evidence

The source/port comparison checks all 81 factory ASTs and runs an actual network scenario through the original bootstrap and server. It covers:

- Concurrent decorated POST routes with path, query and body arguments, async context isolation and response headers.
- JSON view rendering and a typed exception handler selected through `Catch` metadata.
- Mustache rendering from a temporary template under the explicit base path, including HTML escaping.
- File view streaming from the same owned directory and cleanup after server shutdown.
- The real singleton REST client, health endpoint and original application lifecycle.

Other product namespaces and source-map installation remain explicit fixtures in this scenario. The complete product application is not yet assembled.

```sh
npm run verify:http-controller -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run verify:backend-foundation -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run smoke:native-di -w @axonfire/harness
```

REA evidence `ev_81291dbeadf16f76bde57b4189825a186af39296c0c9a52689706fcd165ed56f` covers 81 inert factory files, 23,234 AST nodes and zero parse failures. Semantic coverage is partial/truncated at 750 nodes and 150 unknowns with a 45-second analysis budget. The full original bundle entrypoint is not executed.
