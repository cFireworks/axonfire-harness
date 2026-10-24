# Native container bootstrap

`createNativeContainerBootstrap` restores the original container-loading factory 50984 and **25 synchronous registration entrypoints**, plus the captured empty namespaces 80558, 3203 and 3618. It uses the recovered DI framework and preserves original module order, binding overrides, promise sequencing and failure behavior.

The original bundle entry chain is `29570 → 86355 → 50984`. The wrapper executes only the explicitly requested recovered bootstrap, with caller-supplied dependency namespaces; it never evaluates the full original bundle.

## Activation and ordering

Creating the wrapper has no registration or process side effects. `start()` runs factory 50984 once within its module cache:

1. Load Reflect metadata and DI, then call the supplied source-map support module's `install()`.
2. Create the original container and load core module 78842 and backend registration module 67759 synchronously.
3. Import and load the 25 asynchronous stages in source order, awaiting each default export before proceeding.
4. Resolve with the container. Errors in the asynchronous chain are logged and resolve to `undefined`; synchronous installation failures escape directly.

The wrapper does not publish `ContainerProvider`, start `Application`, or create the server. Those operations belong to factory 86355, now available through [the recovered backend server entrypoint](native-backend-server.md), and are not executed here.

## Dependency boundaries

Pass `di`, `configBasePath`, optional `console`, and the remaining modules through `modules` or `getModule(id)`. The recovered core modules are supplied by `di.getModule`; local captured registration factories cannot be replaced by external module overrides.

`configBasePath` supplies the original `__dirname` value for module 66892. The later product-specific override belongs to module 8588. The source-map installer (25844) can now be supplied by [the recovered source-map module](native-source-map-support.md). Product component namespaces remain explicit dependencies. The final async module 8588 can now be supplied by [the recovered product registration](native-product-registration.md). No missing parent silently becomes an empty module.

The import side effects matter: component namespaces register decorators before their entrypoint calls `autoBind()`. Supplying token-only namespaces does not recreate the full product graph.

The 25 asynchronous stages are:

| Order | Registration module | Imported component or binding parents, excluding DI |
| --- | --- | --- |
| 1 | 21280 | 78824 |
| 2 | 39066 | 27371 |
| 3 | 62309 | 47005 |
| 4 | 53073 | None |
| 5 | 94015 | 37819 |
| 6 | 65903 | 51147 |
| 7 | 10352 | 67846 |
| 8 | 53879 | 66915 |
| 9 | 92712 | 80558 (captured empty factory, supplied locally) |
| 10 | 61488 | 79814, 61000, 72018 |
| 11 | 97619 | 54463, 79896, 98776 |
| 12 | 54387 | 9151 |
| 13 | 66892 | 55762, 18629 |
| 14 | 30135 | 66467 |
| 15 | 18707 | 92735 |
| 16 | 57100 | 54834 |
| 17 | 57740 | 86482 |
| 18 | 63159 | 3203 (captured empty factory, supplied locally) |
| 19 | 98759 | 14931 |
| 20 | 5112 | 14931, 23294 |
| 21 | 94666 | 83052 |
| 22 | 59747 | 24015 |
| 23 | 75548 | 3618 (captured empty factory, supplied locally) |
| 24 | 8819 | None |
| 25 | 8588 (composed async entry) | 92378, 9151, 46307, 26314, 93039 |

## Verification

`verify:container-bootstrap` compares the complete ASTs of all 29 captured factories against the fixed sample. Three source/port scenarios use the actual recovered DI container and explicit product-namespace fixtures to verify import order, one-time parent loading, core binding registration, filesystem rebinding, REST factory binding, product base path, a held asynchronous final module, cached startup, and both synchronous and asynchronous failures.

These are bootstrap orchestration tests. The component namespaces and source-map installer are fixtures; this does not establish full native application startup. The existing CLI/Web launcher tests continue to cover the runnable reconstructed hosts separately.

```sh
npm run verify:container-bootstrap -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run smoke:native-di -w @axonfire/harness
```

REA evidence `ev_162c3874d18bccc0919d07503a74c442f17dc628f987dbb71a7f9eb8a287c4c7` covers 26 parsed files, 1,889 AST nodes and zero parse failures. Semantic coverage is partial/truncated. The verifier explicitly distinguishes execution of the isolated recovered container loader from execution of the original bundle bootstrap; the latter is never run.

Backend registration parent 15062 can now be supplied by [the recovered Backend namespace](native-backend-namespace.md), sharing the original application and HTTP Context modules.

The [shared backend foundation](native-backend-foundation.md) now supplies real Backend, REST, PathResolver and HTTP parents in this original registration order. Remaining product namespaces must still be supplied explicitly.

Namespace 80558 is empty in the fixed sample itself; its local factory is source-verified rather than a fallback for missing dependencies. The original 26-file REA report above predates this addition; its additional evidence is recorded with the context-variable services.

The [filesystem services](native-filesystem-services.md) supply the original memfs and host-service namespaces for stages 61488 and 97619. The latter preserves the original real-filesystem namespace rebinding.

Namespaces 3203 and 3618 are also empty in the fixed sample. Their exact factories are local to the loader, removing two former namespace fixtures. Their REA evidence is recorded with [code ratio services](native-code-ratio-services.md).
