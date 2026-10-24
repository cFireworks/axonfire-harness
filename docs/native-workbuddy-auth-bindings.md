# WorkBuddy application authentication bindings

`createNativeWorkbuddyAuthBindings()` restores the application-specific `WorkbuddyAuthenticationManager`, `WorkbuddyProductEnvService`, `WorkbuddyBootstrapAuthenticationStorage`, session synchronizer setter, original application userinfo provider and bootstrap configuration reader. Fourteen regions across fixed Desktop `common.js`, `cli-product-env.js` and `module.app-server.js` remain verbatim. The host binds the recovered base authentication API, product helpers, process/filesystem and late-bound coordinator/manager container lookups.

## Application behavior

- The authentication subclass overrides `syncProductAfterSessionChange`: it awaits the injected session synchronizer for a defined session. It does not perform its own identity deduplication; the coordinator retains that responsibility.
- The environment override initializes from an explicit environment, otherwise from the original persisted-session resolver. `switch` only updates or deletes the environment key; it does not synchronize the product manager. `switchBySession` resolves through the coordinator and starts snapshot publication without awaiting that publication promise. These are intentional differences from the previously recovered shared environment service.
- Bootstrap storage delegates the original file storage's Subject, restore, store and logout operations without copying sessions or options. It has priority 11 when the first usable V3/V2 authentication type is present and is not custom-token. Otherwise it is disabled.
- Bootstrap configuration uses inline content first, with `ACC_PRODUCT_CONFIG_PATH` fallback only for V3. A malformed inline value does not fall back to the same key's file; selection proceeds to V2. The original synchronous filesystem reader is preserved.

The original `WorkbuddyUserinfoProvider` reads the current session on every call. It maps the nickname to both name fields, preserves enterprise ID and department name, and uses empty identity/token strings after logout. The cloud composition now uses this application class instead of the CLI userinfo implementation.

## Source and verification

Exported metadata records all three fixed-file hashes and exact UTF-16 ranges. The independent captured-text factory checks every region before running six paired scenarios: current-session userinfo projection, bootstrap precedence/spilled files, exact storage delegation, awaited/rejected synchronizers, explicit-versus-session environment initialization, and environment switching/non-awaited snapshot publication.

The cloud composition now instantiates the original application authentication subclass, application environment override and bootstrap storage along with ordinary file/custom-token storage. It binds `setWorkbuddyAuthSessionSyncer` to the complete coordinator's `syncResolvedProduct`, matching the original startup registration.

The existing five cloud scenario pairs pass with these bindings. The composed loopback scenario retains initial explicit remote loading, then logs out and back in. On relogin it waits for the original file-storage event to trigger the application synchronizer and remote model publication; that step no longer calls coordinator refresh directly. HTTP 401 still triggers original manager logout and local-model rollback.

This remains an owned composition with explicit provider ordering, clock and diagnostics; local storage now uses the original file implementation. Default Web registration, complete external login services and parent operation/subscription draining are not yet activated by this change. The original environment publication is fire-and-forget; no new drain contract is attributed to its class.

REA evidence `ev_8ff43d695557cee442133fb1a701c5b067b8653d0fa7da42492b4437ec9bf00f` covers three files, 6,200 UTF-8 bytes, 675 AST nodes and zero parse failures.

Root build passed. The combined binding/cloud compiled scenarios passed 11/11 under Node and WorkBuddy Electron. No new full host-suite run is claimed.

All 2,437 core tests passed after the application userinfo recovery.
