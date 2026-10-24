# Native event reporting services

`createNativeEventServices` restores namespace 92735 and 162 complete factories, including StandardEventService, ModelEventService, report processors, logging/history interfaces and startup performance helpers. Fifteen parent dependencies reuse the recovered foundation. Original registration stage 18707 now runs in the Backend foundation scenario.

Supply the shared DI, globals, process, Node require, Express resolver and foundation module resolver. Optional timer functions let a host account for the original processor timeout timers. Construction is lazy; registration and service initialization remain explicit.

## Preserved behavior

The standard service obtains its endpoint and headers from ProductManager. Product, cloud experiment, user, optional client IP/Qimei and timezone processors enrich events. Extra headers can override configured headers; per-report headers override both. Reports with equivalent sorted header pairs share a batch. `reportSync` awaits transport completion, while ordinary reports enqueue or send asynchronously. Shutdown flushes pending batches and disposes the scheduler.

Any truthy `DISABLE_TELEMETRY` environment value disables reporting, including the string `"0"`. Disabled ordinary reports return without emitting; disabled synchronous reports throw. The original processor timeout race leaves its timeout pending after successful processing. The recovered factories preserve this detail; the scenario tracks and clears its owned timers during cleanup.

## Verification and boundaries

The same integration scenario runs against recovered and captured factories. It uses original registration stages, actual ProductManager and REST implementations, an isolated temporary product configuration and a local HTTP receiver. It checks processor fields, synchronous delivery, sorted header grouping, override precedence, environment stripping, report notifications and disabled behavior. No external telemetry endpoint is contacted.

All 162 factory ASTs match the fixed original bundle. REA evidence `ev_d1d47807416cf827a0666ab6e799c17b6cff036a71e9e2748babb918705d5b9c` covers 162 parsed files, 114,583 AST nodes and zero parse failures. Semantic analysis is bounded at 750 nodes, 150 unknowns and 45 seconds; it does not establish complete semantic coverage. The original whole-bundle entrypoint is never evaluated.

```sh
npm run verify:event-services -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run verify:backend-foundation -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run smoke:native-di -w @axonfire/harness
```

This namespace is the event-reporting registration, not the complete Galileo SDK assembly. Node logging and file storage/upload registration are now connected; remaining product registrations still need to be assembled before the default native product graph is complete.
