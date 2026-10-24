# Native Desktop product environment service

`createNativeDesktopProductEnvironment()` restores all six original `ProductEnvServiceImpl` methods, the environment enum/key and authentication-manager DI token. Four source regions from fixed Desktop `common.js` remain verbatim. The host supplies a scoped process environment, product manager and an authentication-manager lookup; no global application container is started.

## Selection and synchronization

- Explicit `CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT` takes precedence over the product's `networkEnvironment`. With neither present, the current manager session determines the environment.
- Domain resolution checks internal, iOA, cloud-hosted and external configuration in that order. Arrays are supported. A nonempty unmatched domain selects self-hosted; a missing domain resolves to undefined.
- Matching is case-sensitive. A wildcard matches zero or more non-dot characters. The original implementation escapes dots and replaces stars but retains other regular-expression metacharacters; malformed resulting expressions can throw. No replacement hostname matcher is introduced.
- `switch()` writes the environment before awaiting product synchronization. A synchronization failure leaves that mutation in place. An undefined environment writes an empty string. `switchBySession(undefined)` does nothing; a session with no domain can clear the selected environment.

## Verification and composition

The independent source verifier checks the input SHA-256 and all four UTF-16 ranges, constructs the original captured-text factory and runs five paired scenarios. These cover domain priority, wildcard edge cases, current-environment precedence, synchronization failure semantics and composition with the complete original Desktop product manager. The latter publishes changed endpoints through the original synchronization/merger pipeline, using the original environment file provider and owned product JSON files; the base file also uses the original ClientProductProvider.

The browser-login composition now also uses the original environment service for both provider and authentication manager. The owned HTTP service returns a domain, product attributes map that domain, and the manager reselects the environment after login before persisting the session. Original REST/interceptors/provider/file storage remain in that chain. Its six captured/recovered scenarios still pass.

Product-source registration and parent lifecycle/default Web composition remain open. Tests use owned environments, local HTTP and temporary directories; this does not change installed account state or prove live production login.

REA evidence `ev_36f9d9c0d45908b526b1366ee32d6e90daed3329a8692d439a72a30ab17244f4` covers one file, 2,547 UTF-8 bytes, 354 AST nodes and zero parse failures.

Root build passed. The five environment and six browser-login compiled scenarios passed together under Node and WorkBuddy Electron (11/11 each). No new full host-suite run is claimed.

All 2,416 core tests passed.

The final application rebinds this shared service to [WorkbuddyProductEnvService](native-workbuddy-auth-bindings.md), whose switch behavior publishes coordinator snapshots instead of synchronizing the product directly. The combined cloud/account scenario now uses that application override.
