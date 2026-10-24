# Native backend server entrypoint

`createNativeBackendServer` restores complete factories 86355 and 39654: original server activation and default server options. It uses the captured Express implementation through an explicit parent module.

## Original startup sequence

Creating the wrapper is inert. `start()` evaluates the original activation factory once within its module cache:

1. Wait for module 50984's container promise.
2. Publish the container through the original `ContainerProvider` and await the original `Application.start()`.
3. Resolve the port from `parseInt(SERVER__PORT) || ConfigProvider.get("cell.server", defaults).port`; the original default is 3000. An environment value of `0` falls through to configuration.
4. Create Express, register `all("*")`, construct the original request Context and dispatch through the container's Dispatcher.
5. Listen on `SERVER__HOST || "127.0.0.1"`, then await each `ServerAware.setServer(server)` callback and log the configured port.

The default application and context modules can be supplied by the recovered DI and HTTP runtimes. The container must contain the real Dispatcher and ServerAware bindings required by the application.

## Ownership and observable behavior

The original module does not export a readiness promise or the server. `start()` returns its cached module exports, not a server handle. Use a ServerAware binding to observe the server and retain it for shutdown. Installation, startup failures and cancellation have no added handling in the captured body.

The caller must drain and close the server, stop the application, remove its tagged signal handlers where appropriate, and close owned HTTP/context resources. This wrapper does not silently alter those original lifecycle boundaries.

## Integration evidence

A source/port scenario holds the container promise and confirms that no listener starts before it resolves. It then uses the real recovered DI container, BackendApplication, Express, Dispatcher, HandlerExecutionChain and Context to serve two concurrent requests and an error response. It checks application state, ContainerProvider identity, ServerAware notification and startup log ordering. Application route/error-handler dependencies are explicit fixtures; the test does not load the entire product service graph or claim working product endpoints.

The two server factories and all 169 Express factories pass complete AST comparisons. REA evidence `ev_c0728407f0b4e6794338d7105c2039ae14a152c141fe656864ad3f6142c87242` covers their 171 inert files, 64,496 AST nodes and zero parse failures, with partial/truncated semantic coverage. The original bundle entrypoint is never evaluated.

```sh
npm run verify:backend-server -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run smoke:native-di -w @axonfire/harness
```

The original HTTP startup path is now available for composition. The runnable CLI/Web hosts remain separate while the complete default product graph is assembled.
