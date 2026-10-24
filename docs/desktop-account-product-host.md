# Desktop account and product host

`createDesktopAccountProductHost()` assembles the recovered Desktop account and product services outside the test fixtures. It is a new ownership adapter, not a recovered application bootstrap. Default Web now activates the owner through [its bootstrap adapter](native-web-accounts.md).

## Service graph

The host constructs the original application authentication manager, environment service, bootstrap/file/custom-token storage and application userinfo provider. Product services use the original base/Internet/development providers, merger strategies, file local storage, cloud manager, experiment manager and authentication/product coordinator. REST uses the recovered CellJS factory with bundled Axios and both original HTTP interceptors.

Provider sorting calls the recovered framework `Prioritizeable.prioritizeAll`; the product manager retains its own reversal and merge rules. Authentication storage selection is also original: an environment-enabled custom token takes precedence over file storage and does not acquire invented file-persistence behavior. File-backed login is tested separately.

The original file-authentication configuration getter and application session synchronizer are bound explicitly. Environment-provider endpoint overrides share the same resolver as the HTTP interceptor. No recovered class body is edited by this host.

## Inputs and ownership

The constructor requires absolute `resourcesRoot`, `productDirectory` and `configDirectory` paths. `resourcesRoot` contains `cli/product.json`; `productDirectory` supplies the local product and environment JSON files. The environment is cloned, exposed as `host.env`, and receives original child-product snapshot publications. `WORKBUDDY_CONFIG_DIR` is scoped to the explicit configuration directory. Electron resource lookup and home-directory lookup are scoped as well. An input `ACC_PRODUCT_CONFIG_PATH` is copied byte-for-byte to a unique owned bootstrap file before initialization: the original publisher can delete its previous spill file without deleting caller-owned input. Children must consume the owner’s current snapshot environment, including its updated or removed path, instead of retaining the original input path as a higher-priority override.

The caller supplies logger, tracing, events, notifications and current-user path services. Logger must support the original methods, including `time` and `timeEnd`. These are borrowed services. The host owns its newly constructed HTTP agents, account/product instances, file watcher and polling resources; it does not remove persisted configuration or credentials on close.

The optional provider callback can bind additional authentication providers using the constructed services. Their browser/IDE/other external resource ownership remains with the parent.

`browserLogin: { externalUriOpener, clientInfoProvider }` additionally constructs the recovered `ExternalLinkAuthenticationProvider` with the same original REST client, product environment and authentication error identities as the owner. Alternatively, supply `browserLogin.openExternal(url)` instead of `externalUriOpener`; the host then owns the [original WorkBuddy host opener](native-host-external-opener.md), preserving its delegate-result semantics. The opener must expose `open(url)` and an RxJS-compatible `urlSubject`; client info must provide `get()` with `pluginVersion`. Supplied dependencies are borrowed. If `clientInfoProvider` is omitted, the owner constructs the [original WorkBuddy client-info provider](native-workbuddy-client-info.md), using its product/environment/assets and owning initialization, asynchronous drain and subject completion. The owner forwards URL notifications through its own subject, initializes the original provider before authentication restoration, and tracks its asynchronous prototype methods. Closing disconnects the borrowed stream and completes the owned bridge, including subscriptions left by an original rejected-opener path. It does not close the parent's opener or URL stream.

The original provider still determines supported authentication types, performs state/token/account HTTP requests and polling, and continues polling when the opener returns false. Original timeout and cancellation behavior is preserved. Closing aborts the authentication context and drains accepted provider calls; a borrowed opener that never settles can still delay close. This is an explicit host capability, not a new browser-account UI or automatic browser-launch policy in default Web.

## Startup and shutdown

- `start()` coalesces concurrent calls. It initializes storage/providers/HTTP policies, loads product cache, synchronizes local configuration, initializes environment and file monitoring, restores authentication, subscribes the coordinator, then synchronizes the resolved product.
- `login()`, `logout()` and `refresh()` await startup and reject new work after close begins.
- `close()` coalesces concurrent calls, waits for startup, disposes authentication and file watching, completes storage subscriptions, stops experiments, drains tracked operations and then completes the owned product configuration stream before destroying HTTP agents and emitters. A failed start can still be closed; callers should always use `try/finally`.
- The host tracks promises returned by original prototype methods, including internal fire-and-forget method calls. It preserves receivers, arguments and returned promises. Callable service dependencies such as Axios are not wrapped.
- Original cloud retry delays are preserved. Shutdown can wait for those retries and their HTTP timeouts; it does not clear a sleeping retry's timer and leave its promise unresolved.

`services` exposes borrowed instances for integration and inspection. Mutations should use host methods; callers must not retain or invoke instances after close begins. Arbitrary external operations through exposed REST or additional providers are outside the owned-operation drain contract. Hosted CLI callbacks registered through the binding described below are tracked. The original classes do not acquire new public drain guarantees.

## Hosted CLI lifecycle binding

`host.bindHostedCliRuntime({ runtimeManager, prewarmPool, sessionManager, agentBackend })` attaches the recovered `bindProductSnapshot` and `bindHostedCliAuthLifecycle` functions. Bind once the parent runtime is ready. These functions retain original behavior: snapshot changes request host rotation and pool flushing; account-owner changes serialize runtime resets, invalidate history on logout and reset active agent sessions. Rotation/flush failure handling remains inside the original functions.

The returned `stop()` is coalesced. It unsubscribes both event sources and waits for the original auth reset queue and tracked account/product work. Host `close()` invokes outstanding stops automatically, stops its own refresh/watch/poll sources, and drains accepted work before releasing owned HTTP resources. The runtime manager, pool, session manager and backend are borrowed; close the account/product owner before shutting down those dependencies so accepted callbacks can finish.

The coordinator's original `runInBackground(task, label)` returns `void`. The ownership adapter now tracks its task argument as well as ordinary method return promises. This covers snapshot listeners whose rotation or pool flush outlives snapshot publication, without replacing original callback error logging or notification-key handling.

Tests block rotation, pool flush and account reset independently and confirm owner shutdown remains pending until they finish. The failure case confirms a failed rotation still attempts pool flush, and both original catches remain effective. Runtime manager/pool/backend calls in these focused tests are controlled boundaries. The separate real sidecar test now also uses this owner and binding: it verifies changed CLI PID/endpoint, old-process exit, an ACP prompt consuming the newly published instructions, real account logout, history invalidation and empty sessions after reset. It passes under both Node and WorkBuddy Electron. Default Web now registers this binding; see [the Web bootstrap contract](native-web-accounts.md).

## Verification and limits

Owned loopback tests cover file-backed login and persisted reopening, original cloud headers/model publication, HTTP-401 rollback, coalesced start/close, subscription and file-watcher cleanup, close before start, close during an accepted cloud request, close during startup and initialization failure cleanup. They use the actual recovered services and native filesystem/HTTP behavior.

The wrapper is integration code and has no new REA source-equivalence claim. Source provenance remains in [application bindings](native-workbuddy-auth-bindings.md), [account/product assembly](native-desktop-account-product-assembly.md) and their linked component evidence. Default Web browser-login/UI wiring, production browser dependencies, experiment polling under this owner and shutdown through all original retry/error branches still require broader integration verification.

The root build passes. Compiled owner tests pass 5/5 under Node and 5/5 under WorkBuddy Electron (`work/desktop-account-host-compiled.log`, `work/desktop-account-host-electron.log`). This does not represent a new full CLI/Web host-suite run.

The full core regression passes 2,442/2,442 (`work/desktop-account-host-core.log`).


After lifecycle integration, the root build passes and compiled owner tests pass 8/8 under both Node and WorkBuddy Electron (`work/desktop-account-lifecycle-compiled-final.log`, `work/desktop-account-lifecycle-electron-final.log`). The real sidecar host case passes 1/1 on each runtime (`work/desktop-account-lifecycle-sidecar.log`, `work/desktop-account-lifecycle-sidecar-electron.log`). The lifecycle source verifier passes eight original regions and eight paired scenarios. No new full-host aggregate is claimed.

Final core regression after bootstrap input isolation passes 2,445/2,445 (`work/desktop-account-lifecycle-core-final.log`).

Browser-provider integration adds three owner cases: real HTTP login/cloud publication/logout, cancellation while an opener is pending, and rejected-opener subscription cleanup. All eleven owner cases pass under Electron (`work/browser-owner-electron.log`). Root build and type/syntax checks pass; full core passes 2,448/2,448 (`work/browser-owner-core.log`), and default Web bootstrap/real process ownership passes 6/6 (`work/browser-owner-web.log`). Original provider verification remains 33 regions and six paired scenarios; REA evidence remains `ev_f753d877405e184ebe0e7adf289f69b170019acb052a87337007efcd895d2fa8`.
