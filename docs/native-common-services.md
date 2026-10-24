# Native common services

`createNativeCommonServices` restores namespace 51147 and 64 complete factories. It includes the original sample encoder, filename helpers, environment/object/hash/patch utilities, request-header interceptor, memory cleanup and monitoring classes, resource disposal helpers and shared service tokens. Eight dependency factories reuse the recovered HTTP and Express module caches.

## Original registration

Creation is inert. `load()` registers original decorators; bootstrap stage 65903 imports this namespace and calls `autoBind()`. The shared Backend foundation now routes this stage. `CommonHeaderHttpInterceptor` is an original ApplicationLifecycle component, so application initialization installs its interceptor on the container's singleton REST client.

The interceptor preserves an explicit request ID, otherwise copies the trace ID or generates an ID, and sets the request's proxy option to false. `SampleEncryptor` retains its original base64 wrapper format; this is the captured sample implementation. Interface tokens such as FilePathService and FileUploadService do not imply that their product-specific implementations have been connected.

## Runtime and cleanup

Supply the shared `di`, `http`, `express`, `process` and `globals` surfaces. Optional console, Error, Date, window, navigator and timer functions allow explicit runtime ownership. The original cleanup code can trim global caches, change `Error.stackTraceLimit`, invoke `global.gc` and schedule work. Supply owned objects when isolating those effects.

The original disposal behavior is retained. SubscriptionManager disposes registered resources; EnhancedMemoryCleanup and monitors expose their own cleanup methods. MemoryCleanupService's aggressive cleanup also schedules an untracked delayed GC, which its `dispose()` does not cancel. The wrapper adds no automatic lifecycle policy to these classes. Close application resources before releasing the foundation's request context.

## Verification

All 64 factory ASTs are compared with the fixed sample. A captured/recovered integration scenario runs through original bootstrap registration and real network requests, covering request-ID precedence and generation, proxy settings, sample encoding, filenames, hashes and patch generation.

The same scenario uses an owned Error constructor, global cache and controlled timers to exercise enhanced cleanup, memory-pressure cleanup, smart-monitor baseline and warning/critical/recovery transitions, timer disposal, cleanup counters and the untracked delayed GC behavior. Remaining product namespaces and source-map installation are explicit fixtures in this scenario.

```sh
npm run verify:common-services -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run verify:backend-foundation -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run smoke:native-di -w @axonfire/harness
```

REA evidence `ev_e1cf95eac536ec0b3cc3ca66992cea94038ea594908acf522187a81b36d77880` covers 64 inert factory files, 30,905 AST nodes and zero parse failures. Semantic coverage is partial/truncated at the configured 750-node and 150-unknown limits with a 45-second budget. The original full bundle entrypoint is never evaluated.
