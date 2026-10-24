# Native dependency injection and application lifecycle

`createNativeDi` restores the original Cell DI framework and its Inversify dependency closure: **370 complete factories**, including the core binding module. It replaces the need to emulate decorators when assembling recovered service classes.

The recovered surface includes component, property, optional, named and tagged decorators; component/constant registration; scopes and aliases; container providers; configuration expressions; component providers; and abstract application lifecycle/state services. All factory bodies retain their source ranges and are checked against the fixed WorkBuddy bundle.

## Creating a container

```ts
import { createRequire } from "node:module";
import { createNativeDi } from "@axonfire/harness";

const di = createNativeDi({
  globals: globalThis,
  process,
  console,
  require: createRequire(import.meta.url),
});
const coreBindings = di.getModule(78842).default;
// Register additional recovered components using this same di/Reflect instance.
const container = di.ContainerFactory.create(coreBindings, di.autoBind());
di.ContainerProvider.set(container);
```

Module 78842 is the original core registration module. It captures currently registered components and binds `Value` and `AutowiredProvider` resolution. `autoBind()` drains the registration metadata when called; import and registration order matter. Component registration defaults, reverse binding order and rebind behavior are preserved.

The wrapper creates a private Reflect surface containing the standard Reflect methods, then installs the original metadata implementation on it. It does not add metadata methods to the host's Reflect. Pass `di.Reflect` to recovered modules that use decorator metadata, and pass `di` as their original framework module 80699. A caller-supplied Reflect surface is used as-is.

## Backend application

`createNativeBackendApplication({di, process})` restores factories 93772 and 96000. Importing or constructing the module installs no signal handlers. The application registers itself under `di.Application`, with its state service under `di.ApplicationStateService`.

- `start()` installs tagged SIGINT/SIGTERM handlers, runs lifecycle initialization followed by awaited start callbacks, and advances through `started` and `ready`.
- Initialization callbacks are invoked synchronously; returned promises are not awaited by the original implementation.
- `stop()` invokes stop callbacks and records the original state string `stoped`.
- Signal handling invokes stop callbacks and `process.exit(0)`. Programmatic stop does not remove signal handlers; `removeListeners(signal)` removes only handlers bearing the application's tag.

The application process surface is explicit. Tests use an EventEmitter-backed process with a recorded exit method so no test can terminate the runner.

## Verification and remaining work

`verify:native-di` compares all 370 factory ASTs and three behavioral scenarios against the captured source. Tests exercise singleton aliases, optional injection, real component providers, metadata isolation, lifecycle error handling and state waiters. `verify:backend-application` compares both application factories and a real-container start/stop/signal scenario, using the original core binding module and logger/configuration dependencies.

The Galileo integration test now resolves the original service through this container, checks its class/token/lifecycle aliases, and delivers telemetry through the real SDK host and loopback transport. Application product/auth inputs remain explicit fixtures.

```sh
npm run verify:native-di -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run verify:backend-application -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run smoke:native-di -w @axonfire/harness
```

These factories provide the original DI and application foundation. They do not yet replace the CLI/Web launchers with the complete product service graph. Product-specific bindings, entrypoint composition and ownership of process-wide resources remain reconstruction work.

REA analyzed the final 370-file DI extraction as evidence `ev_e322348db9d4609a52f50176810091f9ca188b310513578e975c4390e1a6512c` (82,200 AST nodes, zero parse failures, partial/truncated semantic coverage). Backend application evidence is `ev_af605857a9fb4dc8bc4784362c1bad70470ca3ab641d0a44804cce4b27c4765a` (two files, 588 AST nodes, zero parse failures, unknown/non-truncated semantic coverage). Neither analysis executes bundle bootstrap code.

The [native container bootstrap](native-container-bootstrap.md) now preserves the original registration sequence and synchronous entrypoints. Product component namespaces and the final async registration remain explicit dependencies.
