# Original Desktop User-Agent interceptor

`createNativeDesktopUserAgent()` restores the complete `UserAgentHttpInterceptor` plus the original `User-Agent` and `X-Skip-User-Agent-Merge` header assignments. It runs in the recovered REST request pipeline and obtains current identity from the client-info provider.

The original order is platform/version, product/version, the existing User-Agent, then the optional CLI user-agent extension. A present platform or product without a version uses `unknown`. Empty fields are omitted. A truthy skip header is removed and bypasses identity lookup and merging, preserving the supplied User-Agent. Provider errors propagate through the original request pipeline.

The account owner now constructs the original WorkBuddy client-info provider for all account HTTP traffic unless an explicit borrowed provider is supplied. Browser login and the User-Agent interceptor share that same provider. Its initialization and asynchronous shutdown drain remain owned. Default Web account traffic therefore uses the same original interceptor; model request and hosted CLI code remain unchanged.

## Evidence

Three verbatim source regions from the fixed `common.js` are checked against its SHA-256. `npm run verify:desktop-user-agent -w @axonfire/harness` runs three paired original/recovered scenarios, covering order, missing fields, request mutation, skip behavior and error propagation. REA evidence `ev_2e489d377e92c241cfdc5c667dc2f5f4829a53c7525e000617915c53bd96380f` covers 1,159 bytes, 180 AST nodes and zero parse failures.

A real loopback HTTP owner test checks the wire-level merged and exact User-Agent values. Existing file-backed login/cloud configuration tests also assert the emitted identity. No production server, OS browser or live product account is required for this validation. Full telemetry and other Desktop HTTP policy composition remain separate recovery work.

Validation: build and type/syntax checks pass; Node and Electron focused suites each pass 16/16. Full core passes 2,461/2,461; default Web bootstrap/real process ownership passes 6/6. See the [recovery ledger](recovery-status.md) for log references.
