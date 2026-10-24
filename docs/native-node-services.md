# Native Node services

`createNativeNodeServices` restores namespace 67846 and 373 complete factories, including FilePathServiceImpl, UserHomeServiceImpl, FileUploadServiceImpl, COSFileUploader and its bundled SDK, stream/filesystem helpers, proxy resolution, system-proxy detection and PAC RPC. Twenty-five dependency factories reuse the recovered HTTP, Express and common-service modules.

## Composition

The original bootstrap's 10352 stage imports 67846 and consumes its decorators through `autoBind()`. `createNativeBackendFoundation` now routes this stage with the same DI and service identities used by the earlier registrations.

Supply shared `di`, `http`, `express`, `common`, `globals`, `process` and Node `require` surfaces, plus `filename` for the original bundled `__filename`. The loader preserves module IDs, loaded flags, exports-bound factory calls and the original require-cache surface used by a configuration dependency. Creation is inert; `load()` activates the namespace.

FilePathService retains its platform-dependent base directory, current-user and IDE suffixes. UserHomeService retains its Downloads path. These implementations are now registered against the tokens from common services. FileUploadService selects the first supporting uploader and returns the original failure result when none supports the request.

## Proxy and upload behavior

ProxyResolver retains PAC-hook, explicit configuration, environment and system-detection behavior, including direct mode, bypass matching and OS-cache invalidation. The PAC client uses the original authenticated HTTP request over a supplied Unix socket. Runtime reads and subprocesses remain those of the captured implementation; no automatic proxy discovery is invoked merely by creating the wrapper.

COSFileUploader keeps original credentials retrieval, retry, progress, timeout, abort and result logic. Its bundled COS SDK is recovered, not replaced with an npm package or a mock transport.

## Verification and limits

All 373 factory ASTs match the fixed sample. Captured and recovered modules run the same original-bootstrap scenario, covering platform paths, uploader selection, local COS-info retrieval and empty upload results, proxy configuration/environment/PAC precedence, loopback bypass, and authenticated PAC requests to an owned Unix socket.

A separate step in that scenario instantiates the actual recovered COS SDK with a local custom domain and sends a real PUT body to an owned HTTP server. This proves the SDK transport executes; it does not claim a credentialed production COS upload or end-to-end multi-file upload coverage. Temporary files, sockets and servers are cleaned up. Other product namespaces and source-map installation remain explicit fixtures.

REA evidence `ev_79f49e8fbd31c97f640e80b16d7ed0b43bf2461d7a568f3e78e45a172f9f5710` covers 372 inert files, 283,267 AST nodes and zero parse failures. Semantic coverage is partial/truncated with 750-node and 150-unknown limits and a 45-second budget. The full original bundle entrypoint is never evaluated.

```sh
npm run verify:node-services -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run verify:backend-foundation -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run smoke:native-di -w @axonfire/harness
```

## Lazy multipart recovery

Factory 88654 (the original bundled node-fetch) loads factory 26952 only when multipart `Response.formData()` runs. The previous eager dependency closure omitted it: the regression initially failed with `Explicit Node services parent required: 26952`. Its complete 5,089-character original factory is now present at fixed UTF-16 offsets `[21401848, 21406937)` and uses the already-recovered FormData/File dependencies 48695 and 23239. The foundation discovers it through the existing Node-services module table.

The source-paired Node-services scenario now parses multipart input split into one-byte stream chunks, checks duplicate UTF-8 fields and exact binary file bytes/name/type, rejects a missing boundary and preserves URL-encoded form handling. All 373 complete factory ASTs match the fixed sample and the expanded original/recovered behavior scenario passes. No whole-bundle bootstrap executes.

REA evidence `ev_4648c3a2c4f0e7b4228131b24edcc8777602c22abc8ce0f584cead42bad7ae10` covers the additional inert factory: one parsed file, 1,420 AST nodes, zero parse failures. The earlier 372-file evidence remains the record for the original closure.
