# Native authentication and product coordinator

`createNativeAuthProductCoordinator()` exposes the complete original `WorkbuddyAuthProductCoordinator` class, its snapshot/overlay helpers, the required original Desktop product-configuration functions and development-endpoint resolution. The class retains all 37 members. The factory binds Node/process/OS boundaries and keeps its caches and initializer state local; importing it does not run captured application bootstrap or start account/network services.

## Source fidelity

The module preserves 87 original regions from four fixed Desktop files: `workbuddy-auth-product-coordinator.js`, `workbuddy-product-config.js`, `dev-env-override.js` and `common.js`. These include complete declarations plus selected original enum/cache initializers. `AUTH_PRODUCT_COORDINATOR_SOURCE` records hashes and UTF-16 ranges. DI decoration is replaced by explicit host wiring; method bodies are unchanged.

REA evidence `ev_1f818b65b954cd707a9e06bd63ea77a393093d804a832471b48c6c0a0151fe77` covers four parsed files, 100,158 UTF-8 bytes, 6,606 AST nodes and zero parse failures. The paired verifier checks fixed hashes, compares all regions and constructs an independent factory directly from captured text.

## Preserved behavior

- Snapshot publication sorts/normalizes JSON, updates the original inline/file product environment and computes a separate hosted-runtime rotation key. Changes limited to volatile signed download URL parameters update the published environment without rotating the host.
- Diagnostics redact secret-like keys and remove download URL query parameters. Actual configuration is preserved for the child runtime.
- Product composition combines base, environment and source layers. Base authentication identity takes precedence, while source authentication attributes are merged. A nonempty remote model list replaces the base/environment model lists when the original remote-model flag is set.
- On Linux, snapshots above the original 48,000-byte threshold spill to the original config cache path using a temporary file and rename; subsequent small snapshots restore inline mode. Other platforms preserve the original inline behavior.
- Remote refresh retains its eight-minute cache, identity key, serialized queue, forced-refresh option, excluded remote fields, original merge selection and local-agent preservation. Same-identity failures retain an existing overlay; a new identity clears it before fetching.
- Experiment overlays and development endpoint overrides retain their source helpers. The production-mode endpoint override is disabled by the original guard. macOS install-channel composition uses the original implementation; callers/tests must supply their intended asset and filesystem context.

Listener notifications are asynchronous. A rejected listener clears the notified key only if it still matches that publication. A synchronous listener throw propagates through publication, and identical serialized snapshots return early before notifying again. These boundaries are preserved rather than replaced with an assumed retry mechanism.

## Host composition

A host supplies the real logger, authentication subject, product manager/merger, cloud-product manager and experiment manager fields before calling `init()` or the relevant methods. `assetsRoot` selects the original bundled-product resolver root; the optional `di` boundary supplies the original container logger lookup. The product builder already catches unavailable diagnostic-container lookup. `process` and `os` bindings allow owned runtime state without altering the user's global environment.

This recovery does not fabricate account login, remote service access or experiment providers. Default Web still requires complete live service/subscription assembly before automatic account/product refresh can be claimed. Existing private product configuration and restart requirements remain in effect.

## Verification

Eight paired scenarios cover snapshot/noise filtering, redaction, listener disposal/failures, product/auth/model precedence, Linux file spill, remote cache/failure/identity behavior, agent smart merge, initializer/logout publication and development guards. External providers are owned fixtures; product merging uses the already recovered native merge strategy.

The real hosted-CLI fixture passes under both Node and WorkBuddy Electron. It publishes through this complete coordinator and the original hosted lifecycle callback, verifies a changed host PID/endpoint and old-process exit, then prompts the rotated CLI and checks that its model request contains the new instructions. An identical snapshot does not trigger another rotation. Tests bind `process.resourcesPath` to their owned temporary root because the original resolver prioritizes Electron resources over `assetsRoot`.

The root build and 2,354 core tests passed; all eight compiled coordinator tests and the final eight paired/source scenarios passed. Full live account/cloud/experiment integration remains a separate requirement.
