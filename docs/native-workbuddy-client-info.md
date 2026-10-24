# Original WorkBuddy client information

`createNativeWorkbuddyClientInfo()` restores the complete application-specific `WorkbuddyClientInfoProvider` from `module-base.js`. It includes the Windows download-channel helpers, asset resolver binding, original environment-key map and IDE mapping. It reuses the already recovered machine-identity implementation and runtime-context service. This is the WorkBuddy application provider, rather than the generic Desktop default provider.

## Behavior

The provider builds application identity from product configuration, runtime app version, machine identity and a stable per-instance session UUID. Environment fields override the initial projection. The original bundled `product.json` name lookup then takes precedence over the resulting product name. CLI user-agent version comes from `cli/package.json`, including the original custom-package fallback when the ordinary version is `0.0.0`.

`initialize()` subscribes to product configuration; each update rebuilds and publishes client info. `get()` returns the cached object once initialized. Platform overrides retain the original IDE mapping and explicit IDE/user environment precedence. Optional file-path services receive the selected IDE type.

On Windows, absent an inherited download channel, the provider starts one background registry probe. The original helper tries HKCU then HKLM, using `reg query` with a three-second timeout and the original output parser. A discovered channel updates the subject and is written to the scoped environment only when no channel is already set. Original provider and helper bodies are unchanged.

## Account host integration

The account owner constructs this original provider by default for account HTTP traffic and browser login. A supplied `browserLogin.clientInfoProvider` remains an explicit override. It uses the owner's scoped environment/runtime context, product manager and asset roots; initializes it before authentication restoration; tracks accepted asynchronous methods; and completes its subject after shutdown drain. `WORKBUDDY_APP_VERSION` retains the original runtime-context precedence. A supplied client-info provider remains borrowed.

The owner supplies its IDE-aware file-path service only when that service supports `setIDEType`; the original provider already allows the service to be absent. The [original User-Agent interceptor](native-desktop-user-agent.md) shares this identity source with browser login. Browser login needs only an explicit browser delegate or opener to use original client information. Default Web browser-account controls remain separate work.

## Evidence and limits

Metadata records SHA-256 hashes for `module-base.js` and `common.js` plus 17 original UTF-16 source ranges. `npm run verify:workbuddy-client-info -w @axonfire/harness` checks hashes and verbatim source, then runs five paired original/recovered scenarios. REA evidence `ev_d31989f83ba70aa0162053f8dffc01d2384d85e77f572fc17ac669b204360ad3` covers two extracted files, 8,785 bytes, 1,199 AST nodes and zero parse failures.

Tests cover cache identity and product updates, environment and bundled-name precedence, IDE routing, malformed/missing assets, CLI version fallback, Windows registry fallback/publication and inherited-channel suppression. The owner HTTP-login test uses the default recovered provider and checks the version in the emitted authentication URL. Machine ID and process execution are controlled fixture boundaries. Windows branch tests on macOS do not claim native Windows execution or installation validation.

Validation: root build and type/syntax checks pass; Node and Electron provider/owner suites each pass 17/17. Full core passes 2,457/2,457, and default Web bootstrap/real process ownership passes 6/6. Log references are recorded in the [recovery ledger](recovery-status.md).
