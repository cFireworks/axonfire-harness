# Native Winston registration

`createNativeWinstonServices` restores namespace 66467 and 117 complete factories, including the captured Winston implementation, transports, formats and supporting dependencies. Fifteen parents reuse the recovered HTTP and Express modules.

The shared Backend foundation routes the namespace lazily. Original stage 30135 imports it and consumes its decorators, rebinding the Cell Logger token to transient WinstonLogger instances. Supply the shared DI, globals, process, Node require, HTTP and Express resolvers. Construction itself does not install a logger or transport.

## Original initialization behavior

WinstonLogger supports optional RawWinstonLogger and WinstonConfig bindings. The captured fallback initializer has a significant detail: when no raw logger is injected and the module-local cache is empty, it creates the shared logger but does not assign that logger to the first instance. Subsequent instances receive the cached logger. The recovered body preserves this behavior; calling the first instance's logging methods can therefore fail.

The integration scenario checks this source behavior explicitly. It also injects a real captured Winston logger with a writable-stream transport and verifies transient wrapper identities, shared raw logger identity, context formatting and info/warn/error output. Its owner closes the logger and stream after use.

The foundation scenario executes stage 30135 followed by the recovered Node logging stage 57100, which replaces Logger with FileLogger. It now serves a health request without a RawWinstonLogger fixture. The isolated Winston scenario still uses an explicit injected logger to verify the adapter itself. See [Node logging](native-node-logging.md) for the file-storage integration and remaining boundaries.

## Source checks

All 117 factory ASTs are compared with the fixed sample. The same scenarios execute against captured and recovered factories, using the real original DI and registration stage.

```sh
npm run verify:winston-services -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run verify:backend-foundation -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run smoke:native-di -w @axonfire/harness
```

REA evidence `ev_a38b5d926fb87d5fcf335e34a164fd763b2aaa3f7b9a128e828c51bf6a985965` covers 117 inert files, 47,147 AST nodes and zero parse failures. Semantic coverage is partial/truncated with 750-node and 150-unknown limits and a 45-second budget. The full original bundle entrypoint is never evaluated.
