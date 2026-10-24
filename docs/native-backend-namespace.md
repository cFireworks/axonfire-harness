# Native Backend namespace

`createNativeBackendNamespace` restores factory 15062 and its namespace/helper closure: six complete factories. It provides the namespace imported by the original synchronous backend registration stage, 67759.

## Shared service identities

The wrapper is lazy. `load()` evaluates the original exports once; `getModule(id)` exposes the same cached module instances. It reuses three caller-supplied parents:

| Parent | Recovered implementation |
| --- | --- |
| 93772 | `createNativeBackendApplication(...).getModule(93772)` |
| 96000 | The same application's state-service module |
| 30805 | `createNativeHttpHost(...).native.getModule(30805)` |

Supply the application modules lazily when the bootstrap requests this namespace, so decorators register at the original stage. Use the same DI instance and process surface for the application. Reuse the HTTP host's existing Context module to preserve its request namespace and class identity.

The namespace's `Context` is the HTTP runtime's **BaseContext**. The HTTP host uses a derived request context; both share the original CLS namespace. Constructing another context module would introduce separate state and is unnecessary.

The included `crc32` helper delegates directly to `node:crypto.createHash("crc32")`. It has no added fallback. Its availability therefore remains subject to the Node/OpenSSL implementation, including the original unsupported-algorithm error where applicable.

## Activation and cleanup

Creating the namespace wrapper has no process or context side effects. Loading its parents can register components and create the owned HTTP context host. The caller owns those parent resources.

The original application starts only when its `start()` method is called. Its stop state remains `stoped`; stopping does not remove tagged signal listeners automatically. Remove its tagged SIGINT/SIGTERM handlers and close the owned HTTP host when disposing this composition.

## Evidence

The source verifier compares all six factory ASTs and two behavioral scenarios against the captured bundle. The composed scenario loads this actual namespace through the original container bootstrap, resolves the application via real DI, starts and stops it, and checks two concurrent requests for shared Context identity and isolation. Product namespaces outside this Backend stage and the source-map installer remain explicit fixtures in that test.

REA evidence `ev_441dd2cf7f4d087ae337ed539d8bc1ae32815fa33493367c59b338288f80286b` covers six parsed files and 787 AST nodes, with zero parse failures and partial/truncated semantic coverage. No original full-bundle entrypoint is executed.

```sh
npm run verify:backend-namespace -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run smoke:native-di -w @axonfire/harness
```

The Backend registration namespace is now available for composition. The full default product graph and original server entrypoint still require further assembly.
