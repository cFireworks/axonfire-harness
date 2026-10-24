# Native Desktop external-link authentication

`createNativeDesktopExternalLink()` exposes the complete original Desktop `ExternalLinkAuthenticationProvider`, versioned login-step callbacks, authentication errors/constants and account snapshot helpers. Thirty-three regions from fixed `common.js` are retained verbatim. Original framework `wait` and `CustomError` primitives are shared with the recovered CLI runtime; `vscode-uri` remains the explicit URI boundary. Product/environment services, browser opening, client information and REST operations are injected by the host.

When composing with the original Desktop authentication manager, pass its factory API as `runtime.authenticationApi` to preserve shared `CanceledError`, `SignLicenseError` and `UnauthorizedError` identities. The recovered class declarations remain intact; this binding gives both original components the same module-level error identities.

## Login and account behavior

- Login requests an authentication state, opens the returned URL, polls for a token and current account, then fetches an account snapshot. The original overall deadline is 300 seconds and polling interval is one second.
- Browser-open failure does not stop polling. The URL remains available for manual login. An outer timeout before a successful browser open becomes `OpenExternalLinkError`.
- Launch-schema parameters follow the configured whitelist. The client version is appended; a login session ID is appended only for the exact WorkBuddy platform check used by `openAuthUrl`.
- Token/account business retry codes are preserved. Account HTTP 401/403 responses allow five retries after the first attempt. Abort is checked after each polling wait.
- Account snapshots retain all accounts separately from plugin-enabled accounts. WorkBuddy metadata enrichment uses the full snapshot, preserving avatars for accounts whose plugin is disabled. Matching avoids choosing between multiple ambiguous enterprise accounts.
- Refresh calculates missing expiry timestamps, retains original domain/header semantics and maps authentication HTTP errors to the original unauthorized error. Switch-account paths, retry count, license errors and streamed IP-limit errors remain unchanged.

## Preserved lifecycle boundaries

Versioned callbacks suppress stale state/failed/completed notifications and prevent stale callback cleanup. The outer `polling_timeout` callback calls the current global callback directly, without a version check. A paired scenario records this original boundary.

The outer timeout races the login promise without cancelling or draining it. Provider initialization subscribes to product configuration without adding a disposal method. `openAuthUrl` unsubscribes after the opener resolves; it does not use a finally block for a rejected opener. Parent ownership remains responsible for these boundaries; this recovery does not silently change them.

## Verification

The source verifier validates the fixed input SHA-256 and all 33 exact UTF-16 regions, constructs an independent factory from captured text, and runs six scenario pairs. They cover a complete login despite browser-open failure, callback versioning/outer timeout, polling retry/cancellation/deadline, license/refresh/IP-limit errors, account enrichment/switching, and real HTTP composition.

The composition uses the original REST client and both Desktop HTTP interceptors, the complete original manager/provider, and original file storage in an owned temporary directory. It checks request authorization, session persistence, logout and the resulting marker. Product configuration and browser opening remain fixtures; environment switching now uses the original Desktop service; the local HTTP server supplies deterministic account responses. No live production account login or automatic default Web provider registration is claimed.

REA evidence `ev_f753d877405e184ebe0e7adf289f69b170019acb052a87337007efcd895d2fa8` covers one file, 24,910 UTF-8 bytes, 3,443 AST nodes and zero parse failures. The root build and all six compiled scenarios passed under Node and WorkBuddy Electron.

All 2,411 core tests passed. Default Web startup remains unchanged; this focused addition does not claim a new full host-suite run.
