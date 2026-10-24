# Native Desktop authentication manager

`createNativeDesktopAuthentication()` exposes the complete original Desktop `AuthenticationManagerImpl`, retaining all 27 class members, its original subscription manager, error types, telemetry constants and required helpers. Twenty source regions are preserved verbatim. Application decorators are omitted; the host binds product/environment services, authentication providers and storage, logging, notifications, tracing and file-path updates.

Shared framework primitives use the already recovered original authentication core; RxJS subjects/operators and optional clock/timer/core boundaries are explicit. The factory does not discover an installed account, start browser login or contact remote services on import or construction.

## Preserved state and lifecycle

The original manager keeps separate revisions for storage updates, login attempts, authentication operations and committed logins. Login, account switching and refresh check these revisions before accepting or persisting results. A newer login can supersede an earlier attempt, while logout invalidates a pending login or refresh. Session persistence remains serialized through the original promise tail, including recovery after a failed queued operation.

Initialization selects a positive-priority authentication storage, restores its session, subscribes to updates, applies the configured environment switch and tracks the current user ID. Provider selection, explicit provider override and cached storage selection remain original. Session headers preserve their explicit token/department/refresh-token arguments.

Refresh retains the original recent-refresh guard, WorkBuddy account-metadata recovery exception, minimum delay, jitter, retry behavior and account identity checks. Disposal increments revisions, aborts pending sign context, cancels a refresh timer, disposes subscriptions and completes the session subject. It does not add a new promise-draining contract for a parent host; parent shutdown must still own borrowed operations and pending persistence.

## Source and verification

Source: fixed Desktop `main/common.js`, SHA-256 `786cdfa0ec67e97753b4bc3e476f4582f10f4ccba694b5a9ec7de121478708a7`. Exported metadata records exact UTF-16 ranges. The verifier checks the hash, compares all 20 regions and constructs an independent implementation from captured text. Previously recovered framework primitives remain an explicit shared dependency.

REA evidence `ev_ca30c4b6a07ca27ec7ded4186a77c57825f32974413a4f6cb4cfb83e6124a3cc` covers one file, 37,080 UTF-8 bytes, 4,408 AST nodes and zero parse failures.

Six paired scenarios verify restoration/environment/header behavior, competing login results, logout versus pending login/refresh, storage invalidation and timer disposal, provider/storage selection and persistence queue recovery. The final scenario uses the original REST factory, captured Axios and authentication HTTP interceptor against a real loopback 401 response. It invokes the complete manager's original `logout()` and verifies provider session removal, storage cleanup and clearing of the current session.

The provider, storage, trace/notification and environment services in these scenarios are owned fixtures. This recovery does not claim a real browser login, account backend, complete Desktop provider registration or automatic default Web account refresh. Those services and parent lifecycle ownership remain necessary for the default graph.

The root build and all 2,394 core tests passed. All six compiled authentication scenarios passed under Node and WorkBuddy Electron. Default Web startup is unchanged; no new full host-suite run is claimed.

Additional [original file-storage tests](native-desktop-file-authentication.md) now compose this manager with real persisted sessions and verify restore/login/logout through the original storage, including its marker and backup behavior. The six manager-specific scenarios above retain their controlled storage fixtures for concurrency testing.
