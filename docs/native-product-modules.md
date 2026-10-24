# Native product factory closure

`createNativeProductModules` provides 2,153 complete factories from the fixed sample: 16,570,398 source characters covering the remaining main harness, gateways, terminal UI, doctor/resume modules, model providers, telemetry and their dependencies. Its 142 parent references reuse the existing DI, Express and Backend foundation graph. All captured bodies remain intact.

Dependency extraction follows direct module calls as well as bound and namespace-import loaders (`require.bind`, `require.t` and `require.t.bind`). The latter add 247 factories that are not necessarily evaluated during startup.

The loader is explicit and lazy. Construction does not activate the product. `getModule(id)` evaluates a requested factory once using the original module runtime, cache, exports-bound call and module ID/loaded semantics. `load()` requests the main harness namespace 74428; it is not the container startup API. Compose with `createNativeProductRegistration` and `createNativeContainerBootstrap` for original registration sequencing.

## Host requirements

Supply shared DI, globals, process, Node require, Express and foundation resolvers, plus filename, basePath and an owned Error constructor. A dedicated child process can use its native Error constructor without modifying the parent process. Timers, fetch and WebSocket can be supplied explicitly. The original process-lifecycle module installs handlers and wraps its supplied process exit; activation requires a deliberate process ownership strategy.

A plain object inheriting from Node's global object cannot safely expose every accessor. In particular, Node's crypto getter rejects that receiver. For isolated globals, define an own crypto value using Node's native Web Crypto implementation and own process/Error/fetch properties. The fetch property must be writable because original instrumentation replaces it. The source-paired scenario verifies the original PKCE generator and challenge verification against this boundary.

Terminal UI initialization fetches embedded WebAssembly through a data URL. This is local asset decoding. The isolated registration test permits data-URL fetches and rejects external network and subprocess operations.

## Verified registration milestone

An owned child process composes the full factory closure, recovered Backend foundation, final async product aggregate and original container bootstrap. All synchronous namespaces and the final product namespace are real recovered code. It creates the container, verifies the OriginalModelProvider binding, starts Application with the original --serve mode, checks its ready state, then calls stop and checks the original stoped state. Temporary home/configuration paths and process hooks are isolated; the child exits after the registration check.

The child now uses the recovered source-map installer and original BackendServer through createNativeProductRuntime. It verifies actual HTTP health, gateway OpenAPI and ACP connect/initialize/delete requests. It does not yet run a production model request or migrate the default CLI/Web hosts to this graph. Those remain integration work. Activation output is recorded directly through a file descriptor because original initialization changes console routing.

An initial probe reported an MCP temporal-dead-zone error. Tracing the first failure showed that the crypto getter had failed earlier, leaving partially initialized exports in the original module cache. Supplying Web Crypto correctly and permitting embedded WASM decoding allowed registration to complete without changing any original factory or hoisting symbols.

## Fidelity and evidence

The verifier indexes the original top-level Rspack table, which contains 4,566 unique module IDs. Every restored factory range matches that table; nested module IDs cannot silently substitute for top-level ones. It then compares all 2,153 complete ASTs and runs source-paired DI navigation, undo, record/replay and PKCE scenarios. The child-process registration test additionally exercises the actual async aggregate.

REA evidence `ev_89bca599e855041a49edf9917c4f87cd91f637dc1f0816c1c912ddae3a156f45` inventories 1,906 files: 1,905 parsed, one skipped, 2,854,211 visited AST nodes and zero parse failures. Semantic analysis is partial and limited by the 750-node, 150-unknown and 45-second budgets. The additional 247 deferred-loader factories have separate REA evidence `ev_7ce057a6bdb9f6eb2c15fa01ed7f49f212e1cec826b2c3c136d0fcb6c2075805`: 247 parsed, 355,962 visited AST nodes and zero parse failures. Their initial 45-second run timed out; a 120-second run completed with the same semantic node/unknown limits. The independent source verifier checks every factory, including the file skipped in the first batch. The original whole-bundle entrypoint is never evaluated.

```sh
npm run verify:product-modules -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run smoke:native-di -w @axonfire/harness
```
