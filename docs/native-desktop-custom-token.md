# Native Desktop custom-token authentication

`createNativeDesktopCustomToken()` restores the complete original `CustomTokenAuthenticationStorageImpl` and `CustomTokenAuthenticationProvider`, their constants and the captured jsonwebtoken dependency closure. All 82 source regions remain verbatim; the outer factory supplies Node's module loader, process, clock and RxJS Subject. Loading the factory does not execute Desktop bootstrap or inspect installed account files.

## Original behavior

- Storage priority requires a `CODEBUDDY_AUTH_TOKEN` presence signal, inline V3/V2 custom-token configuration, or a valid `ACC_PRODUCT_CONFIG_PATH` file. V1 is excluded. The first available inline authentication object takes precedence, even when its type is not custom-token. A configured product can trigger a forced configuration recheck before storage is selected.
- Restore reads the token from the merged product configuration. The environment token is a priority signal, not a fallback token source. A product token by itself can therefore remain disabled at priority selection.
- The original JWT library decodes metadata without verifying the signature. `sub`, nickname/preferred username, issuer domain and an `sso-` issuer suffix populate account details. An explicit product enterprise ID overrides the decoded ID. Opaque tokens fall back to environment user details, then `anonymous`.
- JWT expiry is not used: the original fixed `1999999999999` expiry fields are preserved. Restore emits the session on the original Subject. Store and clean are no-ops.
- Provider creation delegates to restore and rejects a missing token. Refresh mutates the supplied session's `lastRefreshTime`; account switching returns the same session. Removing a session is a no-op, so manager logout does not revoke the configured token or erase an independently persisted file session.

## Evidence and verification

Exported metadata records SHA-256 hashes and exact UTF-16 ranges from fixed Desktop `common.js` and `chunk.js`. An independent captured-text factory checks every region before running the same behavioral scenarios against both implementations.

REA evidence `ev_29be90fc101b022bb53491cac8563d1f51b70fef94ee0208a959f2d27ccf3e1b` covers two files, 143,017 UTF-8 bytes, 18,881 AST nodes and zero parse failures. The recovered JWT closure depends only on Node buffer, crypto, stream and util; no replacement JWT package is installed.

Five paired scenarios cover inline precedence/product rechecking, real spilled files, JWT and opaque-token metadata, provider semantics, and the complete original authentication manager with both custom-token and original file storage. The composition selects custom storage over a real persisted file session, restores authorization headers, logs out and logs back in through the original provider. All files and account data belong to temporary test fixtures.

Production provider registration, external/browser login, product environment switching and the parent lifecycle/default Web composition remain separate work. This module does not claim live account authentication or validation of JWT signatures.

The root build and all 2,405 core tests passed. The five compiled scenarios passed under both Node and WorkBuddy Electron. Default Web startup was unchanged; no new full host-suite run is claimed.
