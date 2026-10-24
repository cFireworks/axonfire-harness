# Native Node logging registration

`createNativeNodeLogging` restores namespace 54834 and 333 complete factories, including FileLogger, LoggerStorageService, upload API/service, OS event processors, client-IP detection, proxy transports, archive dependencies and the authentication namespace 86482 imported by UploadService. It shares existing DI, Express, event, product, filesystem and HTTP dependencies with the Backend foundation.

## Registration and runtime behavior

Original stage 57100 replaces the transient Winston adapter with transient FileLogger instances. The later stage 57740 reuses namespace 86482 and its module identity. The foundation startup scenario now follows both stages and serves a real health request without an injected RawWinstonLogger.

FileLogger emits log notifications before applying the configured storage threshold. Storage uses a workspace-derived filename under a date directory, includes a workspace header, supports asynchronous batching and synchronous flush, and builds ZIP archives with the captured archive implementation. Optional LoggerStoragePathProvider supplies the destination. Without one, the original storage methods do not write a file.

UploadService retains configuration subscriptions, interval scheduling, environment checks, extra-path collection, task reporting and COS upload orchestration. The OTLP injector preserves proxy-environment precedence and creates the original HttpsProxyAgent. These are original factories; no replacement logging library is substituted.

## Ownership and verification

Supply shared DI, globals, process, Node require, an Express module resolver and the foundation resolver. Construction is lazy. The caller owns application shutdown, configuration subscriptions and timers. The integration scenarios drain disposal-time log writes after unbinding the container, then flush storage and explicitly dispose its scheduler and upload interval; the wrapper does not invent lifecycle hooks absent from the sample.

The source-paired scenario uses a temporary product configuration and log directory, original registration stages and the real ClientInfoProvider. It verifies:

- Transient FileLogger resolution after the Winston stage, log notifications and filtering.
- Actual asynchronous and synchronous file writes, workspace headers and ZIP creation.
- Disabled upload results without contacting a remote service.
- Construction and cleanup of the original OTLP proxy agent.

The application scenario verifies server startup and HTTP health after these registrations. External account login, production log upload, overseas IP detection and the remaining product graph are not established by these local checks.

All 333 factory ASTs match the fixed sample. Extraction follows each factory's actual third parameter, including both `ec` and `__webpack_require__`; the latter is needed by the original JWT storage dependency. REA evidence `ev_c7b7df713e09391870da89fec318b55b6426659ed835c51067edcd126e85b698` covers 333 parsed files, 247,491 AST nodes and zero parse failures. Semantic analysis remains bounded by 750 nodes, 150 unknowns and a 45-second budget. The original whole-bundle bootstrap is never evaluated.

```sh
npm run verify:node-logging -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run verify:backend-foundation -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run smoke:native-di -w @axonfire/harness
```
