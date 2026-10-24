# Native HTTP components

`createNativeHttpComponents` restores 247 complete module factories, including the original decorators and dependency bindings for HTTP dispatch, middleware, cookies, sessions, tracing, health checks, errors, validation, pipes and REST operations. It reuses the recovered Express and DI dependencies rather than creating separate class identities.

## Composition

Supply `globals`, `di`, `express`, Node `require`, and parent namespace 15062 through `modules` or `getModule`. Use the same DI instance and Backend Context namespace throughout the application. The explicit globals object owns the validation library's metadata storage; use a fresh object when isolating applications.

Creation is inert. `load()` evaluates HTTP namespace 47005; `getModule(id)` loads other captured namespaces on demand. Decorators register with the original DI registry, so load the core container module before loading components, then consume the component registrations with `di.autoBind()`. Preserve the original bootstrap order when integrating REST and path-resolution namespaces.

The returned HTTP Context is derived from the borrowed Backend Context. Pass this HTTP Context, Dispatcher and ServerAware namespace to `createNativeBackendServer`. The caller retains server shutdown and application/context cleanup responsibilities.

## Verification

The integration scenario resolves Dispatcher and its dependencies directly through the original container. It serves concurrent parsed JSON requests with isolated request contexts and trace headers, the original health endpoint, and the original default 404 handler. Only the application route adapter and server observer are test bindings.

All 247 factory ASTs match the fixed sample. The same network scenario runs against both recovered and captured factories. REA evidence `ev_fc5cfa9903e6ec5c4b865328fddb1e464bae9b56bf63469fd47c003b311548c0` covers 247 inert files and 113,183 AST nodes with no parse failures. Semantic coverage is partial/truncated at the configured 750-node and 150-unknown limits. The full original bundle entrypoint is never evaluated.

```sh
npm run verify:http-components -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run smoke:native-di -w @axonfire/harness
```

This supplies the decorated HTTP component graph. Complete product registration and default native application assembly remain ongoing; the existing CLI/Web launchers continue to use their documented hosts.
