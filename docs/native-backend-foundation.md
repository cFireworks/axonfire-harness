# Shared native backend foundation

`createNativeBackendFoundation` assembles recovered Backend, Express and HTTP modules behind a shared parent resolver. Pass its `getModule` to the original container bootstrap and server entrypoint while supplying the remaining product parents separately.

The assembly is host code, not an additional recovered factory. It shares one DI instance, BackendApplication, Backend Context, Express runtime and HTTP module cache. Construction does not evaluate decorators or install process listeners. Modules load only when the original bootstrap requests them, preserving the registration boundaries consumed by each `autoBind()` call.

## Inputs and lifecycle

Provide the original `di`, an explicit `globals` object, Node `require`, and a process surface with the Node APIs needed by Express and the application. An optional console controls diagnostics. Supply `filename` when loading Node services. Supply `basePath` when loading MVC; it provides the original directory base for template and file views. Use a fresh globals object when isolating validation metadata.

The resolver handles Backend namespace 15062, REST namespace 78824, PathResolver namespace 27371, HTTP namespace 47005, MVC namespace 37819, common services namespace 51147, Node services namespace 67846, context-variable namespace 66915, filesystem/workspace namespaces 79814 and 54463, product namespaces 9151 and 55762, Winston namespace 66467, event namespace 92735, Node logging namespace 54834 and its authentication dependency 86482, code-ratio namespaces 14931 and 23294, prompt/model namespaces 83052 and 24015, their recovered factories, and the shared parents used by the server. Unknown product modules return `undefined` so the caller can route them to other real implementations. No empty product modules or synthetic service bindings are supplied.

After server draining and application shutdown, call `closeContext()` to release the owned request-context host. The caller owns DI, process, the server and application lifecycle; closing the context does not stop them. The resolver rejects further access after context closure.

## Verified startup path

The integration test runs the original 50984 loader and registration factories against this resolver:

1. Core and Backend registration.
2. 21280 loads the real REST factory and binds the original singleton REST client.
3. 39066 loads the real PathResolver.
4. 62309 loads the decorated HTTP graph.
5. 94015 loads the real MVC controller graph.
6. 65903 loads common services and registers the original request-header lifecycle interceptor.
7. 10352 loads Node services, including concrete path and upload implementations.
8. 53879 loads the context-variable manager; 92712 then imports the locally captured empty namespace 80558.
9. 61488 binds the original memfs; 97619 rebinds FileSystem to the real Node filesystem and registers systemInfo.
10. 54387 and 66892 register product services and configuration sources and bind ProductConfigBasePath.
11. 30135 rebinds Logger to the captured Winston adapter.
12. 18707 registers the original event services and processors. Telemetry stays disabled in this health scenario.
13. 57100 loads Node logging and rebinds Logger to FileLogger; 57740 reuses its already imported authentication namespace 86482.
14. 63159 imports the original empty 3203; 98759 and 5112 register code-ratio and VCS helpers. 75548 later imports original empty 3618.
15. 94666 and 59747 register prompt/model infrastructure and the product-backed PromptManager.
16. The recovered server resolves Application and Dispatcher from that container.
17. The container's REST client sends an actual HTTP request to the server's health endpoint and receives `200` / `UP`.

The same scenario runs against captured bootstrap factories and recovered bootstrap factories, with complete AST checks for all 29 loader/registration/empty-namespace factories. Backend, Express and HTTP factory fidelity is verified by their separate source comparators. Existing REA reports cover those factories; this assembly adds no new extracted source.

The final asynchronous product registration 8588 and source-map installation in this particular integration scenario are explicit fixtures. All preceding synchronous namespace imports use recovered factories or the sample’s exact empty factories. This verifies the foundation's placement within the original bootstrap, not complete product startup. The CLI/Web hosts retain their existing integration boundaries.

```sh
npm run verify:backend-foundation -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run smoke:native-di -w @axonfire/harness
```

The Winston stage preserves its original first-instance fallback behavior; see [Winston registration](native-winston-services.md). The later Node logging stage now replaces that adapter with the original FileLogger, so the integration scenario no longer injects a raw Winston logger. The fixture owner flushes storage and disposes its scheduler during teardown.

The broader [native product runtime](native-product-runtime.md) now composes the real source-map installer and final product namespace, and verifies HTTP health, gateway OpenAPI and ACP initialization. This foundation-only comparison retains its narrower fixtures for independent source-paired coverage.

## Direct shared-module lookup

The foundation routes the complete Backend namespace table, including child barrels 6579, 69066 and 81840 and helper 35306, to the same namespace cache used by 15062. It also routes the recovered CLS selector, modern implementation, emitter wrapper and legacy dependency factories to the shared context runtime. Direct lookup no longer returns `undefined` for these recovered modules.

The context host is created with deferred initialization. Reading legacy package metadata or resolving the CLS implementation does not create an async hook. Loading the original BaseContext creates its namespace; host runs reuse that namespace, and `closeContext()` disables its owned hook. A deferred initialization failure closes the host and releases any hooks already created. This does not add support for running the pre-Node-8 implementation on modern Node.

At the product resolver level, all captured source-map support factory IDs also route to the existing source-map cache. Node `fs` and `path` retain their existing shared builtin routes. Tests check constructor identity across the source-map barrel and individual factories and generate/consume a real source mapping through the product entry.

REA evidence `ev_52b50f905ce8bbdb2e719a2339ef25b040b38eb94b2cd74a3b1c0938adbc4b9f` inventories thirteen relevant original factories as inert files: 7,166 AST nodes, zero parse failures. These changes affect host routing and ownership; no original factory body was rewritten.

After the specialized service routes, remaining IDs in the captured DI and Express factory tables resolve through the existing DI and Express loaders. Specialized module precedence is unchanged. A static comparison against the fixed bundle's 4,566 top-level factory IDs found 488 missing direct routes before this fallback; every candidate belonged to one of these two already recovered tables. The resulting declared route union covers those 4,566 IDs. This establishes routing-table coverage, not that every factory has been executed or every product behavior is complete.

Regression checks first reproduced undefined source-map and DI-core exports, then verified shared DI core identity, source-map construction/consumption, original forwarded-address parsing and duration parsing through product-level lookup. The ignored evidence files are `work/shared-routes-before.log`, `work/shared-fallback-before.log`, `work/shared-fallback-after.log` and `work/shared-route-inventory.json`.
