# Original WorkBuddy host external URI opener

`createNativeHostExternalUriOpener()` restores the complete application-specific `WorkbuddyHostExternalUriOpener`, delegate setter and original local mock switch. Each factory has isolated delegate state. It does not open a browser merely by importing or constructing it; the application supplies the delegate explicitly.

## Preserved behavior

Without a delegate, `open(uri)` returns false and does not emit a URL. With a delegate, it emits the URI before invoking the delegate. A delegate returning false produces the original warning; a rejected delegate is swallowed. Both cases still return true. This is the captured application's behavior, including its distinction from the lower-level delegate result.

`WORKBUDDY_MOCK_OPEN_EXTERNAL_REJECT=1` makes the original helper reject before calling the delegate. The public opener catches that rejection and returns true. URL parsing, browser policy and process launch are delegated to the application; no substitute browser launcher is introduced here.

## Account host binding

The account host accepts either borrowed `browserLogin.externalUriOpener` or `browserLogin.openExternal(url)`, together with `clientInfoProvider`. With the latter, it constructs and owns the original host opener, binds the supplied delegate, and clears the delegate/completes the owned URL subject after draining accepted work. The delegate itself remains borrowed. No browser is opened during tests; delegates and HTTP endpoints are owned fixtures.

Immediate close after login exposed a host assembly ordering bug: product configuration was completed before an accepted refresh had finished awaiting it. The owner now drains accepted operations before completing that stream, then performs its existing second experiment cleanup/drain. Recovered product/authentication bodies remain unchanged. The regression deliberately logs in without preselecting an environment and closes immediately afterward, exercising the pending environment/product refresh.

## Provenance and verification

Five complete declarations are copied from `workbuddy-auth-product-coordinator.js`; the module metadata records the fixed sample SHA-256 and UTF-16 source ranges. `npm run verify:host-external-opener -w @axonfire/harness` checks the sample hash and verbatim regions, then executes three paired scenario groups against the extracted original and recovered factories.

REA evidence `ev_f78b6103d5055137d77a61f3713d9261e20154297afd95081bad7d4d82d2a42d` covers 842 bytes, 88 AST nodes and zero parse failures. Tests cover notification/delegate order, missing delegate, false/rejected delegate behavior, the original mock switch, isolated factories and complete owner login/shutdown. This is not a claim of default Web account UI, OS browser launching, or complete original client-info integration.

Validation: build and type/syntax checks pass; Node and Electron focused suites each pass 15/15. Full core passes 2,452/2,452, and default Web bootstrap/real process ownership passes 6/6. See the [recovery ledger](recovery-status.md) for log references and remaining boundaries.
