# Recovery status

此文件区分“目标样本中逐字节保留”“从 bundle 控制流还原”“仅建立接口骨架”三类状态。百分比只描述当前重建工程，不代表原应用总体功能覆盖率。


Entries below are newest first. Older entries retain the boundaries known at that stage; later entries supersede them where new evidence is recorded.

## Original application client-info provider (2026-10-25)

Recovered the complete `WorkbuddyClientInfoProvider` and original registry, asset and protocol helpers. The browser-login account owner now defaults to this provider, reusing recovered machine identity and runtime context, with explicit scoped assets/environment. Borrowed client-info providers remain supported. Original class bodies are unchanged. See [client-info behavior and provenance](native-workbuddy-client-info.md).

Verification passes 17 original regions across two fixed source files and five paired scenario groups (`work/client-info-verify.log`). REA `ev_d31989f83ba70aa0162053f8dffc01d2384d85e77f572fc17ac669b204360ad3` reports two extracted files, 8,785 bytes, 1,199 AST nodes and zero parse failures. Node focused provider/owner tests pass 17/17 (`work/client-info-owner.log`), including a real HTTP login whose URL version comes from the original provider. Windows registry fallback/publication is tested through scoped platform/process boundaries; no actual Windows-host validation is claimed.

Root build and type/syntax checks pass (`work/client-info-build.log`, `work/client-info-check.log`). Electron focused provider/owner tests pass 17/17 (`work/client-info-electron.log`). Full core passes 2,457/2,457 (`work/client-info-core.log`), and default Web bootstrap/real process ownership passes 6/6 (`work/client-info-web.log`). Default Web login/account UI, production browser launch bindings and complete diagnostic services remain open.


## Original host browser opener and immediate-login shutdown (2026-10-25)

Recovered all five original application opener declarations (842 bytes) with the original delegate binding, URL notification order and mock rejection switch. The account owner can now construct this opener from an explicit `openExternal` delegate; supplied opener instances remain borrowed. Original false/rejected-delegate behavior is retained: with a configured delegate the host opener still returns true. See [the opener contract](native-host-external-opener.md).

The new real HTTP login/owner test exposed a shutdown ordering defect in the host adapter: immediate close could complete the product configuration stream before an accepted environment/remote refresh finished awaiting it. A 15-second bounded diagnostic reproduced the hang (`work/host-opener-debug.log`). Shutdown now drains accepted work before completing configuration; the same unqualified-login/immediate-close test passes without changing recovered source. Node focused tests pass 15/15 (`work/host-opener-tests-final.log`).

Source verification passes five verbatim regions and three paired scenario groups (`work/host-opener-verify.log`). REA `ev_f78b6103d5055137d77a61f3713d9261e20154297afd95081bad7d4d82d2a42d` reports 842 bytes, 88 AST nodes and zero parse failures. Root build and type/syntax checks pass (`work/host-opener-build.log`, `work/host-opener-check.log`). Electron also passes all 15 focused cases (`work/host-opener-electron.log`). Full core passes 2,452/2,452 (`work/host-opener-core.log`), and default Web bootstrap/real process ownership passes 6/6 (`work/host-opener-web.log`). Original client-info integration and default Web account controls remain open; source inspection located the application-specific `WorkbuddyClientInfoProvider` in `module-base.js` for the next dependency recovery.


## Browser login provider owned by the account/product host (2026-10-25)

The account host now accepts explicit borrowed browser opener/client-info services and constructs the complete recovered external-link provider using its existing original REST client, product environment and shared authentication error classes. Provider methods participate in the owned-operation drain. An owned URL-stream bridge keeps original opener subscriptions off the borrowed stream and is completed during shutdown. Original provider bodies, timeout/polling intervals and false-opener manual-login behavior remain unchanged.

New loopback integration covers real HTTP state/token/account login, file persistence, cloud snapshot publication, logout, close while browser opening is pending, stale-account rejection after close, and opener rejection cleanup. The parent URL subject remains usable after owner close. Eleven focused owner cases pass under Electron (`work/browser-owner-electron.log`). The source verifier passes 33 original regions and six paired groups (`work/browser-owner-source-verify.log`). REA re-inspection retains `ev_f753d877405e184ebe0e7adf289f69b170019acb052a87337007efcd895d2fa8`; this is host integration around existing original source, not new module recovery.

Default Web browser-login controls and production browser dependencies remain open. A borrowed opener must settle for shutdown to drain it; the host does not invent cancellation for that external service. Root build and type/syntax checks pass (`work/browser-owner-build.log`, `work/browser-owner-check.log`). Full core passes 2,448/2,448 (`work/browser-owner-core.log`); default Web bootstrap and real process-owner checks pass 6/6 (`work/browser-owner-web.log`). The full CLI/Web aggregate was not rerun for this optional provider addition; its latest 126-pass/one-TODO result remains the preceding managed-path run.


## Managed path-only product snapshot startup (2026-10-25)

CLI and default Web now share `prepareNativeProductInput()`. It preserves explicit Axonfire-file precedence and existing inline V3 handling, accepts a path-only managed snapshot, validates that its file contains a JSON object, and leaves it on disk for the original environment provider. Informational CLI calls retain their prior no-input behavior. No recovered provider, merger, spill publisher or SDK code was changed.

The new real CLI test first reproduced the former guard rejection (`work/spilled-launcher-before.log`). It now passes (`work/spilled-launcher-after.log`): the original coordinator's Linux branch produces a path-only snapshot over 48 KiB; a real CLI/SDK request carries its 60 KB system prompt to an owned model server, receives the expected response, and leaves the original file bytes unchanged. Input preparation is checked not to populate inline V3. Web also accepts the path-only input and restores its original custom-token session without deleting the caller's file.

REA evidence `ev_fa21686e1b661aa5f0096816c2df33b12b3cfa20b0310ecdc8639ca6d7929d6f` re-inspects three unchanged original product-config functions: cache-path resolution, spill/inline selection and inline assignment. It covers 1,561 bytes, 219 AST nodes and zero parse failures. This is integration evidence around already recovered source, not an additional original module recovery.

Focused input/CLI/Web checks pass eight tests under Electron (`work/spilled-input-electron.log`), including the real CLI model request. Node's real CLI and seven input/Web checks pass (`work/spilled-launcher-after.log`, `work/spilled-input-tests.log`). Repository type/syntax checks pass (`work/spilled-input-check.log`). The emitter's Linux branch is selected through a scoped process boundary on macOS; no actual Linux-host execution or non-macOS native-asset support is claimed. Full CLI/Web host regression passes 126 tests with zero failures and one preserved original MCP denial TODO, 127 tests total (`work/spilled-input-hosts.log`). The previously verified core suite remains 2,445/2,445; this change only modifies app launch adapters and does not alter library source.


## Default native Web account/product registration (2026-10-25)

Default Web now starts `createDesktopAccountProductHost()` before sidecar/prewarm startup, forwards the current resolved snapshot to CLI environments, binds original account-owner and snapshot lifecycles to the actual manager/pool/SessionManager/backend, and closes the account owner before tearing down borrowed process services. The host accepts explicit parent product providers; Web delegates its startup layer to the recovered CLI EnvProductProvider and mergers, using an immutable input environment separate from published snapshots. Local diagnostic/event/notification sinks remain adapters; full browser login/telemetry/UI are not claimed.

Initial Web interaction regression failed with `model not found for agent cli`, while standalone account tests and raw sidecar startup passed. Inspection of actual CLI logs showed original WorkbuddyEnvAgentsPatchProductProvider expanding one supplied agent into twenty by adding agents from its different base asset file. The Web adapter now stages the original CLI merge result as the common Desktop snapshot/child CLI base, copies environment JSON unchanged and links remaining original runtime assets. The patch provider remains unchanged. The real default Web Write-approval case then passed. Earlier failures are not counted as successful validation.

REA evidence `ev_4fea41e06d9e1015802d234732c44cc68f7006bffaf5ff5c61da23fad6431611` re-inspects existing original module 38569 (fixed CLI UTF-16 15,654,757–15,659,142), with a 4,390-byte parse wrapper, 1,047 AST nodes and zero parse failures. This is source-guided integration, not a new source-recovery claim. See [Web account/product contract](native-web-accounts.md).

Focused tests cover source input preservation, CLI file-over-inline precedence, retained original prompt configuration, remote/local baseline separation across refresh/logout, malformed input and a shared explicit agent replacement. Default process ownership checks now assert the account owner is open/closed with its parent. Root build and repository type/syntax checks pass (`work/web-account-build.log`, `work/web-account-check.log`). Full core passes 2,445/2,445 (`work/web-account-core.log`). Full CLI/Web hosts pass 122 tests with zero failures and one preserved original MCP denial TODO, 123 tests total (`work/web-account-hosts.log`). The four bootstrap cases pass on Electron (`work/web-account-bootstrap-electron.log`); the real account/sidecar owner round trip and process cleanup also pass on Electron (`work/web-account-owned-electron.log`). No broader OS enforcement or original MCP-denial fix is claimed.

The integration is validated on the current macOS runtime. A source audit identifies a remaining Linux handoff: the original coordinator emits path-only snapshots above 48 KiB, while the native launcher still requires inline V3 or its explicit input-file flag. Explicit managed spill-path support must be completed before claiming that Linux startup path. Full browser-login services/UI, original diagnostic services and additional experiment/retry ownership paths remain open.


## Account/product ownership over hosted CLI lifecycle callbacks (2026-10-25)

Added `bindHostedCliRuntime()` to the reusable account/product owner. It invokes the already recovered original snapshot-rotation and authentication-owner lifecycle bindings with explicit parent runtime/pool/session/backend services. Subscriptions are owned, stop is coalesced, original auth reset queues are awaited, and close stops account/watch/poll sources before draining lifecycle work. Borrowed runtime services are not disposed by the account owner.

Source inspection found a missing drain path: coordinator `runInBackground(task, label)` returns void, so return-value tracking alone cannot await hosted CLI callback promises. The adapter now tracks that method's promise argument while preserving original warning handling and notification-key behavior. Controlled integration tests block rotation, pool flush and auth reset to prove close waits; they also verify logout history invalidation and the original rotation-error-to-flush path. Tests do not substitute a new lifecycle implementation.

The first snapshot test attempted to rotate by changing local models while a remote overlay was active; original remote model precedence correctly suppressed the change. The trigger was corrected to an endpoint change. Original product precedence was left intact. See [ownership and lifecycle contract](desktop-account-product-host.md).

This extends new host integration around existing recovered source; no new original-source recovery is claimed. The existing lifecycle REA evidence is `ev_48cf960702907bc9c570559e3a669b79a8c9ae3063b2a48da8ce7e3b3b20ad66` (6,249 bytes, 784 AST nodes, zero parse failures). Its verifier passes eight source regions and eight captured/recovered scenarios (`work/desktop-account-lifecycle-verify.log`).

Moving the owner into the existing real sidecar test exposed an input-path ownership error. Original inline snapshot publication removes the prior spill path; passing the caller's input path through the owner's cloned environment deleted that file while the parent retained its stale path. The owner now stages original input bytes into a unique private bootstrap file and cleans up that owned copy. The integration feeds children the owner's current snapshot path/value rather than a stale input override. Original publisher behavior remains unchanged. The initial real-sidecar failure and subsequent correction do not establish default Web activation.

The final real sidecar integration passes under Node and WorkBuddy Electron (1/1 each, `work/desktop-account-lifecycle-sidecar.log`, `work/desktop-account-lifecycle-sidecar-electron.log`). It now uses the complete account/product owner instead of simplified authentication/experiment boundaries: original snapshot publication rotates the real CLI PID/endpoint, the new ACP request carries updated instructions, old process exit is checked, actual logout invalidates history/resets sessions, and the caller's input JSON remains intact. Parent diagnostics/session-history/backend callbacks remain explicit test boundaries.

Root build passes after annotating the mutable environment as `NodeJS.ProcessEnv` (`work/desktop-account-lifecycle-build.log`). Final compiled owner tests pass 8/8 under Node and 8/8 under Electron (`work/desktop-account-lifecycle-compiled-final.log`, `work/desktop-account-lifecycle-electron-final.log`). Final core regression after bootstrap input isolation passes 2,445/2,445 (`work/desktop-account-lifecycle-core-final.log`). No new full CLI/Web host aggregate is claimed.


## Reusable owned Desktop account/product assembly (2026-10-25)

Added exported `createDesktopAccountProductHost()` as an explicit ownership adapter around the recovered Desktop services. It constructs original product providers/mergers, persisted local storage, application authentication/environment/userinfo, file/bootstrap/custom-token storage, REST/interceptors, cloud/experiment managers and the product coordinator. Registry sorting uses the recovered framework priority implementation. The original bootstrap file-auth getter and session synchronizer are bound. All paths, diagnostics and environment are explicit; HTTP uses the scoped process environment.

The owner coalesces startup/close, rejects new work during shutdown, stops authentication/file/polling resources, completes owned subjects and drains tracked original prototype-method promises before destroying owned sockets/emitters. Original cloud retries remain intact. Borrowed additional login-provider/browser resources and direct external operations on exposed services remain the parent's responsibility. See [host contract](desktop-account-product-host.md).

Initial development exposed an ownership-wrapper error: treating every function-valued property as a method also wrapped the callable Axios instance and removed its request methods. Tracking now covers prototype methods only; dependency values remain intact. Test development also confirmed that enabled custom-token storage intentionally does not persist sessions to the file store. Coverage exercises original file selection separately instead of changing those priorities. These failures were corrected in the adapter/tests; recovered original method bodies were not edited.

This is runtime integration code, not a new verbatim-source recovery or REA equivalence claim. Existing component evidence continues to apply. Default Web registration, complete browser-login ownership and broader polling/retry shutdown coverage remain open.

Root build passes (`work/desktop-account-host-build.log`). The five compiled owner integrations pass under both Node and WorkBuddy Electron (`work/desktop-account-host-compiled.log`, `work/desktop-account-host-electron.log`), including initialization-failure cleanup and close during startup. Full core regression passes 2,442/2,442 (`work/desktop-account-host-core.log`); no new full CLI/Web host aggregate is claimed.


## Original application userinfo and account/cloud composition (2026-10-25)

Recovered the original `WorkbuddyUserinfoProvider` from fixed `module.app-server.js` and included it in the application binding factory. Fourteen verbatim regions across three files now cover these bindings. REA evidence `ev_8ff43d695557cee442133fb1a701c5b067b8653d0fa7da42492b4437ec9bf00f` records 6,200 bytes, 675 AST nodes and zero parse failures. The captured/recovered verifier passes all 14 source comparisons and six scenario pairs (`work/workbuddy-userinfo-verify.log`). The new scenario checks current-session identity, Unicode nickname mapping, enterprise/department fields, absent fields and logout clearing.

The complete account/cloud composition now uses the original application userinfo class instead of the CLI implementation. All five cloud pairs pass (`work/workbuddy-userinfo-cloud-verify.log`), preserving original HTTP identity headers, durable cache readback, automatic relogin publication and HTTP-401 logout rollback. Root build passes (`work/workbuddy-userinfo-build.log`); compiled binding/cloud tests pass 11/11 under both Node and WorkBuddy Electron (`work/workbuddy-userinfo-compiled.log`, `work/workbuddy-userinfo-electron.log`). Full core regression passes 2,437/2,437 (`work/workbuddy-userinfo-core.log`). README records that count and explicitly separates verified Desktop account composition from default Web registration.

Reusable owned account/product runtime packaging, asynchronous-operation draining and default Web registration remain open. This increment recovers a missing original application dependency; it does not claim those lifecycle tasks or a new full-host aggregate run are complete. Original class bodies remain unchanged.


## Original prewarm pool and AppServer shutdown (2026-10-24)

Recovered the complete CliPrewarmPool and supporting agent-team/env/IPC helpers: **34 full declarations** from `cli-prewarm-pool.js`. Also recovered the complete original `stop` method returned by `bootstrapWorkbuddyAppServer`. Source inspection establishes that the original upper-level method catches `runtimeManager.onStop()` rejection, so the previously observed manager close/dispose race is handled by the original AppServer caller without changing the lower-level class.

REA evidence `ev_c155b4c9c334d140815fe5d851c4ffdf9e01c0c5bdde138495a19a3f8d747c66` covers **28,638 bytes / 3,416 AST nodes / zero parse failures**. Verification passes **35 original source regions / seven paired scenario groups** (`work/prewarm-verify.log`), covering exact managed-env checks, delta snapshots, ready ACK identity/endpoint validation, flush/stop, upper-level shutdown order and selective error propagation. Pool free-identifier checks are clear.

The real prewarm integration starts the actual recovered CLI with `--prewarm`, acquires an idle child, activates it over the original IPC socket, executes an ACP prompt against an owned model endpoint, observes automatic replenishment and verifies process cleanup. The cold-daemon test now uses the original AppServer stop method; it resolves successfully while the lower-level manager race remains unchanged and covered by its own regression. Other AppServer cleanup resources are explicit boundary adapters, not a claim of complete bootstrap assembly.

Node and Electron each pass **2/2** real prewarm/cold-daemon integrations (`work/prewarm-native.log`, `work/prewarm-electron.log`). Full core passes **2,282/2,282** (`work/prewarm-core.log`); compiled prewarm/lifecycle checks pass **7/7**. Full build, configuration, syntax and whitespace checks pass. README and the new [prewarm/lifecycle contract](native-prewarm-pool.md) document the expanded behavior and boundaries.

Default CLI/Web process ownership, full AppServer pool-construction/coordinator wiring, backend acquire/fallback integration and remaining renderer services still require work. Original sandbox audit and MCP permission issues remain open; no new full-host aggregate success is claimed.

## Original executable sidecar entry and cold start (2026-10-24)

Recovered the original sidecar entry functions, executable catch handler and synchronous crash writer. The build now emits `terminal/sidecar-entry.js`, matching SidecarManager's existing default relative lookup. Importing the library factory does not start the daemon; the executable preserves token parsing, crash-hook installation, SIGTERM/SIGINT shutdown and fatal startup exit. Crash writer reports remain local and synchronous; filter/exporter service recovery is separate.

REA evidence `ev_9a1b59a1cf7c84123c07192c5cee747db651b45c31c08dc1d9f24d13ce78b081` covers **6,809 bytes / 1,194 AST nodes / zero parse failures**. Verification passes **19 verbatim source regions / four paired scenario groups** (`work/sidecar-entry-verify.log`). Free-identifier checks are clear. Full build and configuration checks pass; full core passes **2,275/2,275** (`work/sidecar-entry-final-core.log`), and compiled entry/manager cases pass **12/12**.

The new cold-start integration begins without a PID file, lets the original manager spawn the actual detached daemon from its default compiled entry, provisions and rotates real hosted CLI processes, performs an ACP prompt, resets/reconnects, and verifies daemon exit plus control-socket/PID-file removal. Paths, model responses and artifacts are owned temporary fixtures. No in-process sidecar server substitutes for the daemon in this test. Combined cold-start/hosted-runtime cases pass **2/2** under Node and **2/2** under Electron (`work/sidecar-cold-final-native.log`, `work/sidecar-cold-electron.log`), with the shutdown-rejection expectation below.

**Confirmed original shutdown defect:** `adoptClient` clears `this.client` on socket close while `shutdown()` awaits the close; its `finally` subsequently calls `this.client.dispose()` on null. Both extracted original and recovered manager reproduce this TypeError; manager verification is now **71 declarations / eight paired groups** (`work/sidecar-entry-manager-verify.log`). The cold fixture explicitly expects the API rejection while separately requiring daemon exit code zero, no surviving owned process and removed socket/PID file. It does not claim successful shutdown promise resolution. An initial fixture failed before closing its model HTTP server; fixture cleanup now preserves the error while closing resources.

Default CLI/Web launcher ownership remains unchanged. Next work is native Web/host lifecycle assembly, including original caller handling of this shutdown rejection, followed by prewarm behavior and remaining renderer boundaries. The prior full-host sandbox audit failure and MCP permission TODO remain open; no new full-host aggregate success is claimed.

## Original client/common services and hosted CLI rotation (2026-10-24)

Recovered the remaining manager environment services: original client-info/version cache, machine-identity probes, complete Node/Python type configurations, security-policy translation and product-endpoint override state. SidecarManager now has original defaults for all six previously explicit environment-module boundaries. Binary configuration initialization retains the original once-only helper; it does not run downloads or Python signing, nor claim the full binary-manager implementation.

REA evidence `ev_3014ac87d32765a75cbb3d75f85ca95ac207e501d8d448b739602f2cb145f595` covers **13,664 bytes / 1,737 AST nodes / zero parse failures**. Verification hashes `client-info-env.js`, `common.js` and `chunk.js`, then checks **39 verbatim source regions / five paired scenario groups** (`work/sidecar-remaining-verify.log`). Manager re-verification remains **71 declarations / seven paired groups**. Free-identifier checks are clear. Original Windows machine-ID fallback and cache semantics are preserved; controlled test adapters avoid logging a user's machine identifier or modifying signed binaries.

The new `native-sidecar-host.test.mjs` provisions the actual recovered CLI via `getHostEndpoint`, coalesces concurrent callers, validates the original runtime ID/PID health contract, executes an ACP prompt, then rotates to a replacement host. It verifies the endpoint-change notification, old process exit, reset and reconnection. Owned paths/model configuration and the shared gateway-secret instance are supplied; no environment service implementation is stubbed. Node standalone hosted-runtime integration passes **1/1** (`work/sidecar-host-native.log`). Combined hosted-runtime, ordinary CLI and PTY integrations pass **3/3** under both Node and Electron (`work/sidecar-host-combined.log`, `work/sidecar-host-electron.log`).

Full core passes **2,270/2,270** (`work/sidecar-remaining-core.log`); compiled remaining-service/manager scenarios pass **12/12**. Full build, configuration, syntax and whitespace checks pass. README and the sidecar contract reflect the stronger provisioning/rotation evidence.

Detached daemon spawning still needs the recovered executable entry, and default CLI/Web launcher ownership, prewarm implementation and terminal renderer remain separate work. The prior full-host sandbox audit failure and MCP permission TODO remain open; no full-host aggregate success is claimed.

## Original default sidecar runtime services (2026-10-24)

Recovered and wired four original services as SidecarManager defaults: runtime context, proxy environment, scoped logger and CLI product environment. They preserve environment/context precedence, NO_PROXY loopback merging, logger scope/level fallback and product file/inline/V2 network-environment resolution. The product module uses the original selected enum/key and initializer assignments; the unrelated whole common-module bootstrap is not executed.

REA evidence `ev_f509582aa6f2e10d1927dbc464767054a29c97de635d7a0f3df8453d2d05736c` covers **9,104 bytes / 1,110 AST nodes / zero parse failures**. Verification hashes the five original source files and compares **37 verbatim source regions / five paired scenario groups**, including actual private product-file reads (`work/sidecar-services-verify.log`). SidecarManager re-verification remains **71 declarations / seven paired groups** (`work/sidecar-services-manager-verify.log`). Free-identifier checks are clear.

The real manager/CLI fixture no longer injects a scoped-logger substitute. Node and Electron each pass the real CLI/PTY integrations **2/2** (`work/sidecar-services-native.log`, `work/sidecar-services-electron.log`). Full core passes **2,265/2,265** (`work/sidecar-services-core.log`); compiled service/manager checks pass **12/12**. Full build, configuration, syntax and whitespace checks pass. README and the sidecar contract are updated.

The remaining manager cold-start boundaries are `clientInfo` and manager-specific `common` services. Next capture targets are `buildWorkbuddyClientInfoEnv` and machine identity/cache dependencies in `client-info-env.js`, the registered binary configurations, and `translateRemoteSecurityCenter` / product endpoint override declarations in `common.js`. Detached spawning, default hosted-runtime provisioning/rotation, prewarm implementation and terminal renderer remain unproven end-to-end. Earlier sandbox audit and MCP permission issues remain open; no new full-host aggregate is claimed.

## Original SidecarManager and runtime helpers (2026-10-24)

Recovered **71 complete original declarations** from `main/cli-prewarm-pool.js`: the full SidecarManager plus CLI runtime environment/file helpers and health/endpoint probes. The factory binds the existing original sidecar environment/client and gateway secret implementations. Desktop-specific logger, runtime context, proxy, client-info, product-env and common-module dependencies remain explicit inputs; the full default cold-start graph is not yet claimed.

REA evidence `ev_b2c253aa2df7d21182955ee8d9a6e26a3a6fc51cdc8bf625284377cde984dd57` covers **65,357 bytes / 8,313 AST nodes / zero parse failures**. All 71 original declaration slices are verified verbatim against the hash-locked capture, then independently evaluated inside the binding wrapper. **Seven paired scenario groups** cover health identity/PID/envelope checks, startup coalescing, current-client close fencing, protected/candidate cleanup, prewarm endpoint lookup, reset/rotation guards and executable/environment precedence (`work/sidecar-manager-verify.log`). Free-identifier analysis is clear.

The real CLI integration now uses SidecarManager to discover and reconnect to an owned running sidecar, create a real CLI PTY session, accept native readiness and execute an ACP prompt against the owned model server. It then kills the CLI, resets the manager and reconnects again. Node and Electron sidecar integrations each pass **2/2** (`work/sidecar-manager-native.log`, `work/sidecar-manager-electron.log`). Compiled manager scenarios pass **7/7**. Full core passes **2,260/2,260** (`work/sidecar-manager-core.log`); full build, configuration, syntax and whitespace checks pass.

Detached daemon spawning and automatic hosted-runtime provisioning/rotation are recovered code but not yet exercised end-to-end through their full default dependency graph. Next assembly targets are `runtime-context.js`, `proxy-env.js`, `logger.js`, `cli-product-env.js` and the required declarations of `client-info-env.js` / `common.js`. Prewarm implementation and terminal renderer remain open, as do the earlier sandbox audit failure and MCP permission TODO. See the [sidecar contract](native-sidecar.md).

## Original sidecar client and real CLI readiness (2026-10-24)

Recovered the complete original SidecarClient from `main/cli-prewarm-pool.js`, including connection lifecycle, JSON-RPC framing/IDs, error metadata, notification callbacks, method-specific timeout budgets, pending-request rejection, data socket attachment and shutdown acknowledgement/close handling. The real PTY integration now uses this original client instead of a handwritten fixture RPC client.

REA evidence `ev_cb677a6f5f0102faddf175d46934cc68cb95661003d5e3e107a9cd87d319c291` covers **5,270 bytes / 855 AST nodes / zero parse failures**. Source SHA-256 `ecb7ff634b205288b5ea236519f01292a0a2d02802e1bded03d382532ec3f296` and **three verbatim original declarations / six paired scenario groups** pass (`work/sidecar-client-verify.log`). Original per-chunk UTF-8 decoding can corrupt split multibyte characters; that behavior is retained and regression-tested, not silently repaired. Free-identifier analysis is clear.

A new integration launches the **actual recovered CLI through the original sidecar client/server and PTY adapter**. The CLI sends its own native readiness report, the protected health endpoint responds using original gateway secret headers, and an ACP session completes a prompt against an owned loopback model server. The test observes the model request and answer, then kills the session and verifies the process is gone. It does not substitute the ready reporter or parse stdout for endpoint discovery. An initial health assertion got HTTP 403 because the fixture omitted the original request headers; supplying the real gateway environment/headers resolved it without changing production behavior.

Node sidecar/CLI/terminal integration passes **2/2** (`work/sidecar-client-native.log`); Electron passes the same **2/2** (`work/sidecar-client-electron.log`). Compiled sidecar/client scenarios pass **7/7**; full core passes **2,253/2,253** (`work/sidecar-client-core.log`). Full build, configuration, syntax and whitespace checks pass. README and the [sidecar contract](native-sidecar.md) reflect the stronger evidence.

The higher-level SidecarManager, daemon discovery/spawning, generation-fenced host rotation, prewarm ownership, default launcher integration and terminal renderer remain open. The next source is the manager region in `main/cli-prewarm-pool.js`, beginning with `TAG$1` and `SidecarManager`; its real defaults include separate product/runtime/proxy environment dependencies. No full-host aggregate was rerun; the prior sandbox audit failure and MCP permission TODO remain unresolved.

## Original sidecar process and terminal daemon (2026-10-24)

Recovered the complete core of `main/sidecar-entry.js` plus the protocol, path and environment declarations from `main/cli-process-env.js`: **48 original declarations retained verbatim**. Importable factories expose the real SidecarServer, binary PTY/pipe process adapters, 8 MiB ring buffer and PID/token-bound endpoint readiness registry. Original automatic bootstrap/crash-writer installation is excluded; importing does not start a daemon. The default CLI/Web launchers have not been changed to sidecar process ownership.

REA evidence `ev_5ae46c3b47cd9a917db4d483656922e6795fc05be73f0c4006d5c7be02c097f5` covers **43,166 bytes / 6,167 AST nodes / zero parse failures**. Both source hashes and complete recovered declaration regions pass verification; original and recovered buffer/environment/readiness scenarios pass (`work/sidecar-verify.log`). Server free-identifier checking reports no missing identifiers. Full core passes **2,247/2,247** (`work/sidecar-core.log`); build and configuration checks pass.

A real PTY child now opens a loopback HTTP endpoint and reports readiness over the actual daemon control socket. The integration drives control RPC, authenticated terminal WebSocket IO, replay on reconnect, resize, capture, kill and owned process/socket cleanup. Node passes **1/1** (`work/sidecar-native.log`); Electron combined sidecar/proxy cases pass **5/5** (`work/sidecar-electron-native.log`). The combined Node sidecar/proxy/real-CLI lifecycle suite also passes **7/7** (`work/sidecar-combined-native.log`), and the final compiled sidecar plus real PTY checks pass **2/2** after rebuilding (`work/sidecar-final-built.log`). An initial Electron fixture timeout was resolved by explicitly supplying managed `ELECTRON_RUN_AS_NODE=1`, consistent with the original environment filter; no production behavior was changed to make the test pass.

The real child is a controlled fixture, not the model-serving CLI. Windows transport/selection, production CLI readiness through this daemon, packaged daemon ownership and terminal renderer integration remain open. The original instance token is metadata, not control-RPC authentication; readiness and WebSocket tokens are separate checks. See the [sidecar contract](native-sidecar.md). No new full-host aggregate result is claimed; the earlier sandbox audit failure and MCP permission TODO remain open.

## Original TerminalProxy with real socket verification (2026-10-24)

Recovered the complete original TerminalProxy class, two URL helpers and three constants in `createNativeTerminalProxy`. The session-host factory now defaults to this implementation while retaining constructor injection for boundary tests. Node net and the pinned ws-native 8.18.3 package are the normal bindings; the host scoped-logger module remains a separate supplied dependency.

REA evidence `ev_bd61c578dcd55280d7e21149c4078d8441166d4a2d62e730b002fe8707e34a8d` covers 3,404 bytes and 540 AST nodes with zero parse failures. **Six whole declaration comparisons, fifteen byte-identical captured WebSocket package source files and seven original/recovered scenarios** pass (`work/terminal-proxy-verify-final.log`). Host attachment re-verification also passes **31 comparisons / ten paired scenarios** (`work/terminal-proxy-host-verify.log`). Free-identifier checking reports no missing identifiers.

Full core passes **2,246/2,246** (`work/terminal-proxy-core.log`); full build and configuration/syntax/whitespace checks pass. Compiled terminal/host scenarios pass **17/17** (`work/terminal-proxy-built.log`). Four real loopback WebSocket/private Unix-socket cases pass **4/4** (`work/terminal-proxy-sockets.log`), covering lossless binary forwarding, missing/bad-token HTTP 401 before data connection, empty-token and prefix parsing, server/data closure and missing-socket 1011. Node real CLI lifecycle cases still pass **2/2**, 15.7 seconds (`work/terminal-proxy-session-native.log`).

Electron with the original SQLite driver passes the combined real socket and session lifecycle suites **6/6**, 14.3 seconds (`work/terminal-proxy-electron-native.log`).

The original stop behavior leaves the HTTP upgrade listener installed; a later matching upgrade can reference the cleared WebSocket-server field. This is retained in the paired regression and documented, not silently repaired. Real fixtures close their owned HTTP server. README and the [terminal proxy contract](native-terminal-proxy.md) distinguish the verified transport from the remaining sidecar terminal-daemon, shell/protocol and renderer integration. No full-host aggregate was rerun; the prior sandbox audit failure and MCP permission TODO remain open.

## Original AppServer session host attachment and RPC registration (2026-10-24)

Recovered the complete original AppServer session attachment, registration aggregator, create/config and auxiliary handlers, route-state handler, terminal wiring and all local helper functions in `createNativeSessionHostRuntime`. This includes original Claw reuse/config helpers and the already-identified complete LOAD flow. TerminalProxy and scoped logger implementation remain explicit injected dependencies when terminal attachment is enabled; no replacement terminal service was introduced.

REA evidence `ev_2854aed44e5b3dff8ab9e86d7298f0e06d9fae3aa558cb70615d984df43e2e97` covers 35,238 bytes and 4,733 AST nodes with zero parse failures. Verification passes **31 whole declaration comparisons and ten original/recovered paired scenarios** (`work/session-host-runtime-verify-final.log`). They cover focused route/ignored-cwd protection, default/custom LOAD sweep callbacks, disconnect file-watch release, logged sweep errors, terminal lifecycle wiring, expert/project create setup, Claw selection/concurrent reuse/config precedence, matched-precondition expert updates and auxiliary media/watch/usage/path boundaries. Free-identifier checking reports no missing identifiers.

Full core passes **2,239/2,239** (`work/session-host-runtime-core.log`); full build and configuration/syntax/whitespace checks pass. The real fixture now creates its LOAD RPC through the full host attachment, awaits the immediate janitor sweep, publishes focused route state, clears eligibility through the host's sweep callback and checks subscription cleanup and janitor stop. Its registry, window focus and file-watch service remain owned host adapters. The English README and [attachment contract](native-session-restart.md#appserver-session-host-attachment) describe the remaining terminal/service/renderer integration boundaries. Compiled session suites pass **342/342** (`work/session-host-runtime-built.log`). Node/bridge real-process cases pass **2/2**, 16.2 seconds (`work/session-host-runtime-native.log`), retaining both direct deletion and reclaim-then-delete under the recovered host attachment.

Electron/original SQLite also passes **2/2**, 14.2 seconds (`work/session-host-runtime-electron-native.log`). No full-host aggregate was repeated; the prior sandbox audit failure and MCP permission TODO remain open.

## Original inactive runtime reclaim and janitor (2026-10-24)

Recovered six complete SessionManager reclaim/janitor methods, five helpers and the original policy constant in `attachNativeSessionReclaim`. It composes with recovered session-info, task/team state and cleanup. The original default is 15 minutes of eligibility, a 30-second sweep and six managed owners; finite nonpositive values disable while nonfinite values select defaults.

REA evidence `ev_9140446877a1e3d0c942e1992b03cccc1bcf7c8235cb68b8861a14955aa9a8ed` covers 7,297 bytes and 1,003 AST nodes with zero parse failures. Verification passes **12 whole declaration comparisons and nine original/recovered scenarios** (`work/session-reclaim-verify-final.log`). Tests cover eligibility timing, protection/input/team/tool states, ignored owners, capacity then idle ordering, destruction failure/retry, concurrent sweep/per-owner ownership, configuration edge cases and immediate/replaced/disabled/unrefed janitor intervals. Free-identifier checking reports no missing identifiers.

Full core passes **2,229/2,229** (`work/session-reclaim-core.log`), full build passes (`work/session-reclaim-build.log`), and configuration/syntax/whitespace checks pass. The real process fixture now has two cases, preserving active deletion and adding reclaim-then-delete, rather than replacing the earlier deletion coverage. README and the [reclaim contract](native-session-restart.md#inactive-runtime-reclaim-and-janitor) are updated. Compiled session suites pass **332/332** (`work/session-reclaim-built.log`). Node/bridge real-process cases pass **2/2**, 16.0 seconds (`work/session-reclaim-native.log`): direct deletion remains covered, while reclaim closes the backend with the original cancellation cause, preserves the database record and primed history, permits a cached LOAD without a new process/HTTP request, then deletes the inactive record.

Electron with the original native SQLite driver also passes **2/2**, 14.3 seconds (`work/session-reclaim-electron-native.log`). Global Desktop scheduler assembly remains incomplete. No full-host aggregate was repeated; sandbox audit and MCP permission boundaries remain open.

## Complete Desktop LOAD RPC and owner queries (2026-10-24)

Recovered the complete original `registerWorkbuddySessionLoadHandler`, twelve helpers, renderer-history marker and full coordinator channel constant in `createNativeSessionLoadRpc`. The same work extends `attachNativeSessionInfo` with eight original query/view/cwd/status/record-projection members and their helpers, so the handler can use original manager queries instead of simplified adapters.

REA LOAD evidence `ev_cbfc499ea783b7a647f530e5e57512b60849c8b1a088349a0a88fa89e75dde72` covers 16,188 bytes and 2,010 AST nodes; expanded info evidence `ev_7ef14141396fcfa56194a116cc2dd684f596159d2d9aad7823ef6e4f8e0859e9` covers 14,346 bytes and 2,155 nodes. Both have zero parse failures. LOAD verification passes **15 whole declaration comparisons and nine paired scenarios**; expanded info verification passes **24 whole comparisons and nine paired scenarios** (`work/session-load-rpc-verify-final.log`, `work/session-load-rpc-info-verify-complete.log`). Both free-identifier checks pass.

Tests cover cached-history reuse, normalized-key deduplication, cross-session superseding cancellation, generation fencing, truncation/owner/renderer routing, automation missing-history errors, ordinary incomplete fallback, lifecycle delivery failure and synthetic completion guards. Query tests cover cloned views, terminal pending-input omission, record precedence, cwd persistence and status mutation. An initial expectation that RUNNING must export working was corrected against the original: a retained pending question still exports pending.

The first compilation found three unchecked timer-array indexes in the test fixture; non-null annotations now follow the preceding timer-presence assertions, without changing runtime logic.

Integration then exposed missing persisted/ephemeral record projection methods. Both were recovered in full, replacing their paired-test adapters and completing the `getSessionRecord` dependency path.

The first real RPC run correctly hit cached history: original startup marks a new owner hydrated. The fixture now explicitly invokes the original history invalidator and checks cleared history/tools/plan before exercising HTTP reconstruction. It does not force the flag directly or alter LOAD cache selection.

Final full build passes (`work/session-load-rpc-build-verified.log`), and current compiled session suites pass **323/323** (`work/session-load-rpc-built-verified.log`), including the updated tests without record-projection substitutes.

Full core passes **2,220/2,220** (`work/session-load-rpc-core-complete.log`). The real flow passes Node/bridge **1/1**, 9.0 seconds (`work/session-load-rpc-native-complete.log`) and Electron/original SQLite **1/1**, 7.4 seconds (`work/session-load-rpc-electron-native.log`). It verifies original invalidation clears history/tool/plan caches, authenticated HTTP rebuilds them, the real 500 ms synthetic completion arrives, a second LOAD uses cached history without another HTTP request, and record identity/status/mode plus subsequent renderer/deletion checks remain correct. Type checks and configuration verification pass.

The real fixture now invokes the complete RPC handler with the recovered HTTP requester and manager queries; its registry remains an explicit test host boundary. English README and the [LOAD integration contract](native-session-restart.md#complete-desktop-load-rpc-orchestration) describe remaining full-host services. No full-host aggregate was rerun; the existing sandbox audit failure and MCP permission TODO remain open.

## Desktop replay HTTP transport and shared gateway secret (2026-10-24)

Tracing the original LOAD handler shows that Desktop requests replay from its CLI host instead of directly parsing transcript files. Recovered that original transport, endpoint-abort race, JSON parser, event projection/hydration filter and the gateway-secret module in `createNativeSessionReplayTransport`. One factory instance represents one parent service graph and must be shared between child environment generation and REST callers, preserving the original module's shared lazy-secret semantics.

REA evidence `ev_1daff6b7bf98b3d0c5b298cd83e90e60ee0292b65dc41c9e4e2d671736eebdd6` covers 3,444 bytes and 508 AST nodes with zero parse failures. **Sixteen whole function/declarator comparisons across both fixed source files and seven original/recovered paired scenarios** pass (`work/session-replay-transport-verify-final.log`). Scenarios cover shared secret/env/header identity, URL/cwd/limit handling, signal propagation and endpoint cancellation, JSON envelope and UTF-8 byte accounting, HTTP failures and owner-event filtering. Static free-identifier checking reports no missing identifiers.

The first compilation caught TypeScript inference treating original JavaScript optional parameters as required and overconstraining injected fetch fixtures. The export wrapper now has an explicit dynamic return annotation, consistent with the other raw recovery factories; original function bodies remain unchanged and the source verifier passes again. Full core passes **2,209/2,209** (`work/session-replay-transport-core.log`).

Final full build/type/configuration and syntax/whitespace checks pass. Compiled session suites pass **312/312** (`work/session-replay-transport-built.log`). The authenticated real CLI flow passes with Node/bridge **1/1**, 7.8 seconds, and Electron/original SQLite **1/1**, 6.8 seconds (`work/session-replay-transport-native.log`, `work/session-replay-transport-electron-native.log`). Both check nonempty HTTP replay, byte accounting, missing-secret 401, reconstructed TaskList/plan state, completed status, renderer publication and existing restart/deletion invariants. English README and the [transport contract](native-session-restart.md#desktop-replay-transport-and-gateway-authentication) are updated.

The native fixture now injects the recovered password/Bearer environment and obtains history from the original HTTP replay endpoint instead of cloning manager memory. It feeds the original projected payloads into owner hydration and renderer loading. Full Desktop LOAD RPC orchestration (deduplication, superseding aborts, truncation and delayed synthetic completion) remains a separately located recovery target. No full-host aggregate was rerun; sandbox audit and MCP permission boundaries remain open.

## Original full session information and exported state (2026-10-24)

Recovered five complete SessionManager information/status/team-view methods and seven helpers in `attachNativeSessionInfo`. This replaces the native CLI fixture's former `{ sessionId }` adapter. Configuration uses the previously recovered coordinator `cloneDesiredConfig` through `createNativeSessionModes`; no alternate configuration serializer was introduced.

REA evidence `ev_98ee088a0cc265ba38361926b8d3026be399ba055aa12d47d0a13c2a54bdb643` covers 6,115 bytes and 918 AST nodes with zero parse failures. **Twelve whole AST comparisons and seven original/recovered paired scenarios** pass (`work/session-info-verify.log`). The coordinator/addon verifier was also rerun: **204 comparisons**, including 93 whole functions, 13 class members and 18 constant initializers (`work/session-info-modes-verify.log`). Static free-identifier checking reports no missing identifiers.

Tests cover timestamps, shallow configuration copies, undefined/null distinctions, strict automation metadata, source/welcome fallback, terminal precedence, pending-request timestamp/tie rules, deferred team termination, team-view presence and member copies. They preserve the original distinction between terminal task state and an exported terminated status, plus independent top-level and team-view active-member flags.

Compiled session suites pass **305/305** (`work/session-info-built.log`). The real CLI scenario passes with Node/bridge **1/1**, 7.8 seconds, and Electron/original SQLite **1/1**, 6.7 seconds (`work/session-info-native.log`, `work/session-info-electron-native.log`). Through `loadSession`, both verify full original identity/cwd, completed status, configuration, pending/tool flags, processing state, user and mode epoch, while retaining process replacement, tool/plan/history and deletion checks.

Full core passes **2,202/2,202** (`work/session-info-core.log`); full build, type/syntax/whitespace checks and configuration verification pass. The [session-info contract](native-session-restart.md#session-information-and-exported-status) and English README are updated. Full Electron/renderer assembly, direct Desktop history-file reading and the existing sandbox/MCP boundaries remain incomplete; no full-host aggregate was rerun for this capsule.

## Original renderer load and stored history publication (2026-10-24)

Recovered eleven complete SessionManager methods and four helpers in `attachNativeSessionLoading`: active/inactive `loadSession`, stored-history presence/replay, pending-input replay, control-state publication and plan-event conversion. This composes with readiness and history/replay rather than adding an alternative transcript implementation. REA evidence `ev_0cb61b342005962c0523027752ff0e92405aeef9a1dc69c55191decc6b041a7e` covers 7,435 bytes and 1,007 AST nodes with zero parse failures.

Verification passes **15 whole member/helper comparisons and nine original/recovered paired scenarios** (`work/session-loading-verify.log`). Coverage distinguishes normal control-only loads, complete forced idle replay, user-only replay while processing or invoking, hydrated-owner versus primed precedence, active-only versus restoring input replay, pending load/resume coordination, normalized cwd and backend failure. Tests preserve the original empty-replay 50 ms fallback and missing-cwd failure before cleanup, which leaves hydration begun. Static free-identifier checking reports no missing identifiers.

The real CLI fixture attaches the recovered loader and forces renderer history publication after replacing history from its actual conversation. It verifies assistant messages, plan events, history metadata, presence reporting and unchanged completed task state. Node/bridge passes **1/1**, 8.0 seconds (`work/session-loading-native.log`); Electron with the original native SQLite driver also passes **1/1**, 7.3 seconds (`work/session-loading-electron-native.log`). The fixture still supplies a minimal `toSessionInfo` adapter; this proves publication, not the entire Desktop information view or direct history-file reading.

Full core passes **2,195/2,195** (`work/session-loading-core.log`), full build passes (`work/session-loading-build.log`), and all compiled `session-*-runtime` suites pass **298/298** (`work/session-loading-built.log`). Type/syntax/whitespace checks and configuration verification pass. README and [loading contract](native-session-restart.md#renderer-session-loading-and-stored-history-publication) are updated. No full-host aggregate was repeated for this capsule; the latest aggregate's sandbox audit failure and MCP permission TODO remain open.

## Full host revalidation after prompt-controller integration (2026-10-24)

The complete CLI/Web host aggregate now reports **88 tests: 86 passes, one failure and one known TODO**, in 249.1 seconds (`work/current-host-aggregate-after-session-controller.log`). The sandbox audit failure reproduced: the owned read was denied with exit code 1 and `Operation not permitted`, but the raw native `ProcessExit` omitted `fileBlockRecords`. The original JavaScript client's callback matched that raw payload. The external stdio MCP policy-denial TODO also remains unchanged. Passing host tests do not erase either boundary.

This failure exposed a diagnostic limitation: the original `SandboxCliStdioCapture` retains only 1,024 characters at each end, so collecting its snapshot cannot recover middle-of-stream monitor logs. The fixture now passively captures an independent 65,536-character tail per native stdout/stderr stream, with UTF-8 decoding and per-observation snapshots. Original production capture, binary, timing and assertions remain unchanged.

The focused replay passes **1/1** in 1.9 seconds (`work/sandbox-independent-output.log`). Its independent capture retains the original monitor's ready message, a matching tag with `parse=Some`, `pre-kill records=1, waited=190ms`, and the resulting IPC record. This verifies the added diagnostics on a successful run, not the intermittent failure's cause. No failed run with complete reader diagnostics has yet established that cause. Syntax validation passes; the preceding full core/build results remain applicable because this change affects only test diagnostics and documentation.

## Complete original prompt entry and no-response watchdog (2026-10-24)

Recovered the complete prompt invocation flow, seven supporting methods, its continuation identity field, helper declarations and the complete original NoResponseWatchdog class/constants in `attachNativeSessionPromptController`. It composes the preceding recovered lifecycle/history/task/team capsules and replaces manual start/completion/processing-stop calls in the real CLI fixture. The existing `createNativeSessionPrompt` composition module remains available unchanged; full invocation lives in the separate `native-session-prompt-controller.ts` module.

REA evidence `ev_a070d6c1f085d6c52bc5afd26d78c9770689df446ea91d38a4e4cd6513232c3d` covers 32,705 bytes and 4,496 AST nodes with zero parse failures. Verification passes **40 whole-declaration/member comparisons and eleven original/recovered paired scenarios** (`work/session-prompt-controller-verify.log`). They cover assistant text/callback restoration, compact and automation output, cancellation-cause distinctions, team/input continuation, backend errors, composer input isolation, continuation barriers and watchdog timing. Static checking found no unbound identifiers (`work/session-prompt-controller-free.log`).

The first aggregate run exposed a module-name collision with the existing prompt composer and three import failures (`work/session-prompt-core.log`). The original tracked module was restored byte-for-byte; the new controller, metadata exports and verifier use distinct names. The rerun passes **2,186/2,186** (`work/session-prompt-controller-core.log`), preserving prior ACP/resource/Addon coverage rather than bypassing those consumers. Full build/type/configuration and syntax/whitespace checks pass; compiled session suites pass **144/144** (`work/session-prompt-controller-built.log`).

Both real ACP turns now call `controller.prompt` with original block-array requests. The fixture checks assistant response metadata, cleared invocation state, stopped watchdog and existing task/tool/plan/history/replay/deletion behavior. It retains an explicit preparation step to inspect the replacement queue before the second prompt, plus owned backend transport adapters. Final Node/bridge and Electron/original-driver tests each pass **1/1**, 7.6 and 7.0 seconds (`work/session-prompt-controller-node-native-final.log`, `work/session-prompt-controller-electron-native-final.log`). Its exceptional cleanup also stops the owned watchdog.

README and [prompt-controller contract](native-session-restart.md#complete-prompt-invocation-and-no-response-watchdog) are updated. This proves the recovered entry under owned fixtures, not complete Desktop assembly, production-account login or arbitrary live team workloads. Desktop history-file loading and broader UI/runtime assembly remain incomplete. No full-host aggregate was rerun; the sandbox audit failure and MCP permission TODO remain open.

## Original replay replacement, priming and payload hydration (2026-10-24)

Recovered five complete SessionManager replay methods and six helpers in `attachNativeSessionReplay`. Inactive priming and active replacement are history-generation gated; replacement preserves the original live-tail/control-state rules and rebuilds plans/tools through recovered handlers. The fixture's former replacement stub is removed. This capsule consumes caller-provided replay events; Desktop history-file reading and the complete inactive-load/renderer lifecycle remain separate work.

REA evidence `ev_4ce33add75cab5077549854f0bd3be0a1c05e6edb2db3736a506fcc44dafcb65` covers 11,114 bytes and 1,503 AST nodes with zero parse failures. Verification passes **eleven whole-declaration/member comparisons and nine original/recovered paired scenarios** (`work/session-replay-verify.log`). Composed tests cover inactive cloning/generation rejection, first-hydration live tails, processing/input preservation, terminal guards with pending-map hydration, tool/plan rebuilding, recommendation registry distinctions, cancellation and partial failure. Static checking found no unbound identifiers (`work/session-replay-free.log`). No rollback or extra terminal-input normalization was added.

The native CLI fixture takes its actual event history after Write/TaskCreate/TaskList and invokes original replay replacement with the current generation. It verifies completed task state, history ownership markers, completed TaskList result, reconstructed plan task and cleared primed state, then performs the existing persistent deletion checks. Node/bridge and Electron/original-driver each pass **1/1**, 7.6 and 7.1 seconds (`work/session-replay-node-native.log`, `work/session-replay-electron-native.log`). The source of these events is the real process conversation; this does not claim standalone Desktop history-file parsing.

Validation: full build, type/configuration and syntax/whitespace checks pass; full core **2,175/2,175** (`work/session-replay-core.log`); compiled session suites **133/133** (`work/session-replay-built.log`). README and [replay integration contract](native-session-restart.md#replay-priming-replacement-and-payload-hydration) are updated. Full prompt-controller assembly and inactive history loading remain incomplete. No full-host aggregate was rerun; the sandbox audit failure and MCP permission TODO remain open.

## Original notification state and deferred team completion (2026-10-24)

Recovered twenty-five complete SessionManager methods and nine helpers in `attachNativeSessionTeamState`. They cover runtime-signal extraction/gating, phase/title handling, input settlement on terminal tools, team roster metadata, deferred completion, late-team reactivation and processing lifecycle. The native event fixture now uses original `handleBackendSessionUpdate` in place of its last downstream state stub. Host prompt-boundary orchestration, record publication and transport remain explicit adapters.

REA evidence `ev_7fdf4618b357ad2f2dc804ede92e93c6eb9602a30d67e1fd3c600235ba22032a` covers 21,961 bytes and 3,043 AST nodes with zero parse failures. Verification passes **34 whole-declaration/member comparisons and eleven original/recovered paired scenarios** (`work/session-team-state-verify.log`). These compose the recovered task-state/input methods and cover history/inactive signal gates, roster replacement, explicit-idle waits, user cancellation versus termination/failure, deletion while processing, narrow late-team reactivation, title timestamp/custom-title rules and processing-stop behavior. Static checking found no unbound identifiers (`work/session-team-state-free.log`). Controlled team transitions are verified; a live multi-agent team workload has not been exercised by this batch.

The real CLI fixture now enters processing through the recovered helper, routes actual agent/tool notifications into working-state persistence, marks turn completion and calls original processing-stop cleanup. It verifies working records, two completed turns, cleared processing state and completion sequence 2 while retaining all Write/TaskCreate/TaskList, plan/history, restart and deletion assertions. Node/bridge and Electron/original-driver each pass **1/1**, 7.6 and 6.9 seconds (`work/session-team-state-node-native.log`, `work/session-team-state-electron-native.log`).

Validation: full build, type/configuration and syntax/whitespace checks pass; full core **2,166/2,166** (`work/session-team-state-core.log`); compiled session suites **124/124** (`work/session-team-state-built.log`). README and [team/notification integration contract](native-session-restart.md#notification-state-and-deferred-team-completion) are updated. Full prompt-controller assembly and inactive replay reconciliation remain incomplete. No full-host aggregate was rerun; the sandbox audit failure and MCP permission TODO remain open.

## Original history deduplication, hydration and scoped publication (2026-10-24)

Recovered eleven complete SessionManager methods and ten helpers in `attachNativeSessionHistory`: event recording, prompt-history updates, replay boundaries/completion, nested hydration and fallback completion, scoped buffering/publication and subscriptions. The native CLI fixture now uses these original methods instead of history/publishing adapters. Record effects and the host publisher remain explicit dependencies; inactive-session history loading and full replay replacement/reconciliation are still separate work.

REA evidence `ev_4c3240d9feed0212f0ad27b337f4c42bf6b88dddbfaa08b6e17ea21069d918f0` covers 10,746 bytes and 1,440 AST nodes with zero parse failures. Strict verification passes **21 whole-declaration/member comparisons and ten original/recovered paired scenarios** (`work/session-history-verify-restored.log`). Formatting initially collapsed optional-chain parentheses and changed AST shape; the helpers now retain original source text rather than weakening comparison. An earlier source-locator invocation used an incorrect local path and was corrected before verification. Static checking found no unbound identifiers (`work/session-history-free.log`).

Behavior coverage includes offset/user/interruption deduplication precedence, synthetic replacement, statusless tool-update coalescing, compact-state effects before duplicate detection, nested hydration, cloned buffering, real fifty-millisecond fallback timing, late replay start and publication/listener error boundaries. The real CLI fixture verifies stored tool/plan events, zero remaining hydration depth, cleared replay-end state and an empty buffer after replacement. Node/bridge and Electron/original-driver each pass **1/1**, 7.8 and 7.0 seconds (`work/session-history-node-native.log`, `work/session-history-electron-native.log`), retaining real TaskList derivation and prior restart/persistence/deletion checks.

Validation: full build, type/configuration and syntax/whitespace checks pass; full core **2,155/2,155** (`work/session-history-core.log`); compiled session suites **113/113** (`work/session-history-built.log`). README now separates session, Desktop lifecycle and Desktop storage scope; [history integration contracts](native-session-restart.md#event-history-deduplication-and-hydration) are documented. Team/status handling remains incomplete. No full-host aggregate was rerun; the sandbox audit failure and MCP permission TODO remain open.

## Original incremental tool-result capture and queries (2026-10-24)

Recovered the three complete SessionManager capture/query methods and four helpers in `attachNativeSessionToolResults`. The real backend event fixture now uses original tool-result capture instead of an empty adapter. Raw field retention/null replacement, shallow metadata merge, exact tool-name precedence, shared record references, latest-result tie behavior, recommendation cancellation and observer error boundaries are preserved. Optional usage observation and recommendation registry remain host dependencies.

REA evidence `ev_07928165c4f63e13367978764e94c4abcf8ec6ab9c9d290ef19ccbf5e4e6d095` covers 3,332 bytes and 527 AST nodes with zero parse failures. Verification passes **seven whole-declaration/member comparisons and seven original/recovered paired scenarios** (`work/session-tool-results-verify.log`). They include composed plan derivation using an earlier captured tool name, cancellation exceptions after capture, and observer failure without rollback. Static checking found no unbound identifiers (`work/session-tool-results-free.log`).

The actual Write, TaskCreate and TaskList calls now produce completed captured entries and local observer records. The CLI fixture verifies no active tools remain, lookup becomes unavailable after session deletion, and a previously acquired Map still retains its completed record. Existing real TaskList-derived plan, restart, history/queue, SQLite and deletion checks remain active. Node/bridge and Electron/original-driver each pass **1/1**, 7.7 and 6.9 seconds (`work/session-tool-results-node-native.log`, `work/session-tool-results-electron-native.log`). No external usage-reporting service is enabled.

Validation: full build, type/configuration and syntax/whitespace checks pass; full core **2,145/2,145** (`work/session-tool-results-core.log`); compiled session suites **103/103** (`work/session-tool-results-built.log`). README and [tool-result integration contract](native-session-restart.md#captured-tool-results-and-queries) are updated. History deduplication/hydration and team/status handling still require recovery. No full-host aggregate was rerun; the sandbox audit failure and MCP permission TODO remain open.

## Original plan snapshots and real TaskList-derived updates (2026-10-24)

Recovered fifteen complete SessionManager plan methods and two helpers in `attachNativeSessionPlans`. The native event fixture now uses original plan preparation, normalization, revision selection, snapshot commit and task-tool derivation instead of its former plan adapters. History deduplication/hydration, tool-result capture and team/status updates remain separate dependencies.

REA evidence `ev_9239b583b41a903564f25fa47dcd64951b28e81f76f39bfc7aa20bc937fd0724` covers 7,507 bytes and 1,136 AST nodes with zero parse failures. Verification passes **17 whole-declaration/member comparisons and eight original/recovered paired scenarios** (`work/session-plans-verify.log`). Coverage includes independent snapshots, monotonic/fractional revisions, nonfinite metadata precedence, primitive rows, dependency metadata, exact tool-name lookup, raw-result precedence, completed-tool gating and structured-clone failure. No unbound identifiers were found in the capsule (`work/session-plans-free.log`).

The real CLI fixture now executes Write plus TaskCreate, followed by TaskList, through the restarted native service graph. It verifies an owned task in the committed plan and an emitted derived plan tagged with source `TaskList` and tool-call ID `owned-task-list`. It retains prior history/queue/mode/persistence/deletion assertions and uses four local model requests. Final Node/bridge and Electron/original-driver fixtures each pass **1/1**, 7.5 and 7.0 seconds (`work/session-plans-node-native-final.log`, `work/session-plans-electron-native-final.log`). This validates actual tool-result derivation, not just a hand-built notification.

Validation: full core **2,138/2,138** (`work/session-plans-core.log`); compiled session suites **96/96** (`work/session-plans-built.log`). The first build caught a test-only strict array-index typing error; adding the non-null annotation for its literal fixture array leaves behavior unchanged. The subsequent full build/type check passes (`work/session-plans-build-final.log`); configuration and syntax/whitespace checks pass. README and [plan integration contract](native-session-restart.md#plan-snapshots-and-task-tool-derivation) are updated. No full-host aggregate was rerun; the sandbox audit failure and MCP permission TODO remain open.

## Complete original backend callback wiring (2026-10-24)

Recovered the complete `wireBackend` SessionManager method and four helpers in `attachNativeSessionBackendEvents`. Startup and replacement now install the original session-update, extension, question, elicitation, permission, runtime-signal and transport-activity callbacks in the real CLI fixture. Downstream history deduplication/hydration, plan preparation, tool-result capture, team/status handling and event publication remain explicit adapters; this is not yet the complete Desktop notification pipeline.

REA evidence `ev_c26eae041d3cd8680adeafa8fdb42f004ad54e9bc70b3a0f72ec110ecb7ba8c6` covers 8,337 bytes and 1,254 AST nodes with zero parse failures. Verification passes **five whole-declaration/member comparisons and ten paired original/recovered scenarios** (`work/session-backend-events-verify.log`). They cover ordered dispatch, identity normalization, duplicate stopping points, usage validation and accumulated credit, team-event bypass, trace precedence, input-map/emit ordering, terminal elicitation cancellation and composed task-state/input settlement. Static checking with the no-check directive removed found no unbound identifiers (`work/session-backend-events-free.log`).

The native CLI fixture forwards actual ACP notifications through these callbacks and asserts agent/tool updates, session identity and backend activity. Its explicit start/completion boundaries now enter through `onRuntimeSignal`; the prior direct task-method calls are removed. Node with the test SQLite bridge passes **1/1**, 7.5 seconds, and WorkBuddy Electron with the original native SQLite driver passes **1/1**, 6.9 seconds (`work/session-backend-events-node-native.log`, `work/session-backend-events-electron-native.log`). Existing prompt/history/queue/write/deletion and persistent terminal-state assertions remain active.

Validation: full build, type/configuration checks and syntax/whitespace checks pass; full core **2,130/2,130** (`work/session-backend-events-core.log`); compiled session suites **88/88** (`work/session-backend-events-built.log`). English README and [backend event contract](native-session-restart.md#backend-event-wiring) are updated, and the aggregate verifier discovers `verify:session-backend-events`. No full-host aggregate was rerun; the known sandbox audit failure and MCP permission TODO remain open.

## Original task-state transitions and terminal input settlement (2026-10-24)

Recovered thirteen complete SessionManager methods, the original two-second debounce constant, eight helper functions and the fifty-entry transition-log limit in `attachNativeSessionTaskState`. This replaces the native CLI fixture's task-signal stub with original transition/reducer, terminal cleanup, targeted input settlement, derived-status persistence and telemetry routing. Record publication, telemetry sinks and delivery of turn boundaries remain explicit host adapters; full Desktop backend notification wiring is still incomplete.

REA evidence `ev_6db80ea82e11298e400dc3679b6944be0eef21e4b465b097fd873708a0ddd16e` covers 16,023 bytes and 2,261 AST nodes with zero parse failures. Verification passes **23 whole-declaration/member comparisons and 10 original/recovered paired scenarios** (`work/session-task-state-verify-final.log`). Coverage includes late-input terminal guards, pending-request/history settlement, active-tool cleanup, nested tool identity, archive-marker behavior, deferred timestamp reads, cancellation telemetry, telemetry failure, transition-log truncation, actual debounce timers and recommendation run switches. Static checking with the local no-check directive removed found no unbound identifiers (`work/session-task-state-free.log`).

The real CLI fixture emits explicit start/completion boundaries around both actual ACP prompts, checks planning/completed records through recovered DatabaseService, records local telemetry for two turns, then verifies deletion preserves the terminal status across database reinitialization. Node with the test SQLite bridge passes **1/1**, 7.7 seconds; WorkBuddy Electron with the unchanged captured native driver passes **1/1**, 7.0 seconds (`work/session-task-state-node-native.log`, `work/session-task-state-electron-native.log`). No telemetry network endpoint is used.

Validation: full build, type/syntax/configuration checks and whitespace checks pass; full core **2,120/2,120** (`work/session-task-state-core.log`); compiled session suites **78/78** (`work/session-task-state-built.log`). The English README and [task-state integration contract](native-session-restart.md#task-state-terminal-cleanup-and-persistence) are updated. The aggregate source verifier discovers the new `verify:session-task-state` command. No full-host aggregate was rerun; the existing sandbox audit failure and MCP permission TODO remain open.

## Original session deletion, disposal and shutdown (2026-10-24)

Recovered nineteen complete SessionManager methods, ten owned field initializers and four helpers in `attachNativeSessionCleanup`. The capsule composes with the existing readiness/startup/configuration/records controller. It preserves close-versus-delete history semantics, lifecycle-generation invalidation, shared deletion/disposal promises, before/abort/after transaction callbacks, cancellation and effect/restart drains, watchdog/backend teardown, recommendation barriers and shutdown cleanup. Host event/task-state signaling and optional filesystem deletion remain explicit adapters.

REA evidence `ev_8fc3fd7833573304e8c6eaa58b26470797b6967fbba8ab16e6ada334061dab56` covers 11,343 bytes and 1,649 AST nodes with zero parse failures. The verifier passes **33 complete AST comparisons and 12 original/recovered paired scenarios** (`work/session-cleanup-verify.log`). Scenarios cover concurrent ownership changes, generation-fenced replay, cancelled/failed transaction hooks, best-effort cleanup and the original watchdog-failure boundary. The separate delete-protection predicate is preserved without adding enforcement to the original deletion method.

The real two-process CLI fixture now deletes the restarted session through the recovered capsule, confirms the replacement process has exited and its health endpoint is unavailable, and checks the soft-delete timestamp after DatabaseService disposal/reinitialization. Both default Node with the test SQLite bridge and WorkBuddy Electron with the unchanged original native driver pass **1/1** (`work/session-cleanup-node-native.log`, `work/session-cleanup-electron-native.log`). This verifies owned process/resource cleanup and persistent soft deletion; it does not claim removal of CLI history files or full Desktop task-state/event wiring.

Validation: full build, type/configuration checks and whitespace checks pass; core **2,110/2,110** (`work/session-cleanup-core.log`); compiled session suites **68/68** (`work/session-cleanup-built.log`). The English README and [cleanup integration contract](native-session-restart.md#session-deletion-and-resource-disposal) reflect the new component and verified boundaries. No full-host aggregate was rerun; its sandbox audit failure and MCP permission TODO remain open.

## Electron child-mode fix and delivery-outbox ownership verification (2026-10-24)

The earlier Electron CLI startup timeout was traced to the test fixture's isolated child environment: it omitted `ELECTRON_RUN_AS_NODE=1`. The fixture now retains explicitly selected Electron Node mode. The original command passes with Electron hosting both DatabaseService and the CLI children, using the captured native SQLite binary. This supersedes the earlier unresolved-compatibility note; no product control flow or startup timeout was changed. The explicit independent Node executable option remains available.

Added six real-SQLite delivery-outbox scenarios covering deduplication, due-order/minimum-limit behavior, attempt-budget boundaries, owner-guarded success/failure, authorization deferral, expired-lease ambiguity, terminal retention and supersession scope. A deterministic SELECT-completion hook lets a second connection claim before the first connection's conditional UPDATE; the first returns no claim and the second retains ownership. The source uses per-row conditional updates, not a batch transaction. Expired leases persist as `manual_required` rather than being automatically redelivered. No external delivery provider or message is invoked.

REA evidence `ev_69a6a95a4832161a5c4dbbc2d842777bf5f433b7a5c49dfa85f5f07db190fded` covers the complete original outbox repository declaration, 8,884 bytes and 1,326 AST nodes with zero parse failures. Its AST remains covered by the eighteen-declaration DatabaseService verifier. The combined verifier now passes **17 paired service/outbox scenarios**, with **244 dependency statement comparisons** (`work/database-outbox-verify.log`). All six new cases separately pass with the original hash-verified native driver (`work/database-outbox-native-verify.log`). This is controlled two-connection interleaving, not cross-process stress coverage.

Validation: full build/configuration checks pass; core **2,098/2,098** (`work/database-outbox-core.log`); compiled service/outbox tests **17/17** (`work/database-outbox-built.log`). After the final build, Electron/native-driver CLI replacement passes **1/1**, 7.3 seconds (`work/database-electron-node-env-final.log`), and default Node/bridge replacement passes **1/1**, 7.8 seconds (`work/database-outbox-node-native.log`). Syntax/whitespace checks pass. [Outbox contracts](native-session-restart.md#delivery-outbox-ownership-and-recovery) and [corrected runtime guidance](native-session-restart.md#captured-native-sqlite-driver-and-runtime-separation) are documented; README reflects the latest core count. No full-host aggregate was rerun; its sandbox audit failure and MCP permission TODO remain open.

## Original SQLite binary verified with matching ABI and a busy WAL (2026-10-24)

The installed WorkBuddy Electron 37.10.3 runtime supports Node mode with Node 22.21.1 / ABI 136. It successfully loads the unchanged captured better-sqlite3 12.8.0 binary and reports SQLite 3.51.3. The new fixed-sample loader checks SHA-256 `e0acce53677ede79ce4f323eee875f30c7c010fff5c1a9f48734ffb2da542ad1`, package version and the default loader's cached binary identity. No native package was rebuilt, replaced or upgraded.

REA Mach-O evidence `ev_d132293dc6db3743a66a951886dec04c32dba3a7c65b60efae3de764f1a8fdd4` identifies the arm64/64-bit bundle and UUID `E81338E5-5476-3095-9CF8-33BDBF1A0BAD`. Runtime evidence is separate: **11 original/recovered paired service scenarios** pass on the original binary (`work/database-original-driver-verify.log`), plus **one paired pinned-reader WAL scenario** (`work/database-original-wal-final.log`). A 16 MiB committed WAL remains intact while checkpoint is busy; releasing the reader permits checkpoint and retains all sixteen rows. The original busy timeout is unchanged. An initial WAL-only verifier invocation exposed argument parsing conflict with the shared source locator; the flag is now consumed before locating the fixed source.

The native-driver CLI fixture initially timed out when Electron Node mode was also used for CLI children; the cause remains unresolved (`work/database-original-driver-native.log`). The host process helper now accepts an explicit `nodeExecutable`, preserving its existing default. With Electron hosting Desktop storage and ordinary Node hosting CLI children, the real fixture passes **1/1**, 7.6 seconds (`work/database-original-driver-native-node-cli.log`), including service reopen, CLI history/queue recovery and Write. This proves runtime separation, not arbitrary Electron CLI compatibility or Node-23 loading of an ABI-136 binary.

Validation: fresh full build/configuration checks pass; unchanged default-bridge database scenarios pass **11/11**, the bridge CLI fixture passes **1/1**, and default-runtime ACP regressions pass **6/6** (`work/database-original-driver-bridge-tests.log`, `work/database-original-driver-bridge-native.log`, `work/database-original-driver-acp.log`). Syntax/whitespace checks pass. No new full core or full-host aggregate was run; core 2,092 remains the prior full run, and the full-host sandbox audit failure/MCP permission TODO remain open. [Native driver verification commands and limitations](native-session-restart.md#captured-native-sqlite-driver-and-runtime-separation) are documented.

## Complete original DatabaseService and owned recovery paths (2026-10-24)

Recovered the complete `WorkbuddyDatabaseService` class, four dependent repositories, buffered/database loggers, module-level database reference helpers, ghost cleanup and legacy vscdb reader. `createNativeDatabaseService` composes these with the previously recovered session repository, ORM and migrations. The host supplies the SQLite constructor and runtime-context paths; optional OS/logger bindings make ownership explicit. The ORM exports four additional original comparison/sort helpers used by the repositories. No original SDK, SQL, migration journal or configuration/prompt assets were replaced.

REA evidence `ev_81f5a541a9bfd780e135c07872f6869a138208bdb1370082c2bec418999cc753` covers 96,554 bytes and 11,771 AST nodes with zero parse failures. Verification passes **18 complete declaration comparisons**, checks **244 dependency statements**, and runs **11 paired scenarios**. Static checking also found no unbound identifiers in the recovered service capsule.

Actual owned SQLite files cover initialization/reopen/disposal, two failed opens followed by success, exhausted ordinary errors without deleting the original file, a malformed main file rebuilt from sidecar and automation backups, isolated WAL diagnosis with evidence restoration, WAL-only repair, invalid-header sidecar recovery, header variants, at-most-once notices, ghost-session cleanup, automation backup flushing and JSONL title extraction. Original synchronous one-second retry delays and nontransactional filesystem boundaries are preserved. These tests use the explicit Node SQLite driver bridge, not the incompatible captured native binary.

The real two-process CLI fixture now passes the full recovered DatabaseService directly to the record-store adapter. Its prior repository forwarding/schema setup is removed. It verifies records after service disposal/reinitialization alongside CLI history, paused queue restoration, prompt/tool-schema changes and actual Write execution. Production account login, native-driver execution, large/busy WAL matrices, scheduled health checks, full delivery-outbox behavior and external concurrent writers remain separate coverage.

Validation: full build/configuration checks pass; core **2,092/2,092** (`work/database-service-core.log`); compiled database/migration/session tests **88/88** (`work/database-service-built.log`); native fixture **1/1**, 7.5 seconds (`work/database-service-native.log`). Source verification passes (`work/database-service-verify.log`) and is registered as `verify:database-service` in the aggregate verifier. Compiled exports and syntax/whitespace checks pass. [Service contracts and recovery boundaries](native-session-restart.md#complete-databaseservice-and-recovery) are documented. No new full-host aggregate is claimed; its sandbox audit failure and MCP permission TODO remain unresolved.

## Original SQLite schema adoption and migration pipeline (2026-10-24)

Added `createNativeStorageMigrations` with five complete original regions: legacy schema adoption, eight schema table declarations, migration/materialization entry points, connection helpers and SQLite runtime settings. The pipeline uses the three original embedded SQL migrations and journal already preserved in the bundled ORM. Node filesystem/crypto bindings needed by its migration reader are now supplied by the ORM wrapper; no original SQL, journal, SDK dependency or prompt/configuration assets changed.

REA evidence `ev_10a1269424b17c2f1918f52f2aa705ef8076905fe18899cb3e1ee9cd187968fb` covers 22,734 bytes and 2,280 AST nodes with zero parse failures. Verification passes **32 complete schema/migration statement comparisons**, plus **212 existing ORM/repository statement comparisons**, and **10 paired SQLite scenarios**. Coverage includes empty and legacy databases, partial migration history, file materialization, required-column checks, usage repair, connection pragmas, failed-migration rollback and schema/journal inconsistencies. An initial error assertion expected the SQLite message at the top level; it was corrected to assert the original Drizzle error and its nested SQLite cause, with no implementation change.

The original sequence adopts legacy columns outside the later migration transaction. A duplicate plugin column with no journal causes failure; SQL/journal changes inside the transaction roll back, while prior adoption remains. An already recorded migration does not heal a missing column, and required-column validation does not validate declared types. These source behaviors remain intact.

Repository scenarios and the real CLI replacement fixture now initialize owned SQLite files through this pipeline, replacing generated test DDL. Real process replacement, persisted CLI history, queue restoration, database reopen and Write execution continue to pass. The Node SQLite driver bridge and service forwarding remain adapters; original native-driver execution, complete DatabaseService initialization/retry, WAL damage repair and sidecar data recovery remain open.

Validation: full build/configuration checks pass; core **2,081/2,081** (`work/storage-migrations-core.log`); compiled migration/repository/record/startup/readiness/configuration/restart tests **77/77** (`work/storage-migrations-built.log`); native fixture **1/1**, 7.3 seconds (`work/storage-migrations-native.log`). Source verification passes (`work/storage-migrations-verify.log`, `work/storage-migrations-repository-verify.log`); `verify:storage-migrations` joins the aggregate verifier. Compiled exports and syntax/whitespace checks pass. [Migration contracts and boundaries](native-session-restart.md#database-schema-adoption-and-migrations) are documented. No fresh full host aggregate is claimed; the existing sandbox audit failure and MCP permission TODO remain unresolved.

## Original SQLite session repository and bundled Drizzle (2026-10-24)

Recovered the complete `SessionRepository`, original session/workspace table declarations and local helpers in `createNativeSessionRepository`. The companion `createNativeStorageOrm` preserves all 53 Drizzle regions present in the fixed Desktop initialize bundle, including SQL builders and the better-sqlite3 adapter. Existing recovered plugin-context parsing/serialization is reused; SDK versions, dependencies, configuration and prompt assets are unchanged.

REA evidence `ev_d467ba361124d5f5f6934c3adf4b4ee8ac410c6445ca0165fc73e8b6b965df4a` covers two inert files, 150,102 bytes and 21,114 AST nodes with zero parse failures. The bounded semantic graph is incomplete. Verification passes **212 complete AST statement comparisons**, covering the ORM and seven repository/helper/table declarations, and **11 paired SQLite scenarios**. These exercise disk reopen, owner/archive preservation, nullable-field merge and explicit clears, playground downgrade, soft deletion, suffix escaping, nonterminal repair, workspace visibility, 500-ID chunking, corrupt JSON, permission updates and archive restoration through the recovered record adapter.

The sample's better-sqlite3 package is 12.8.0; its binary requires Node ABI 136 and cannot load in this host's ABI 131. No binary or dependency was replaced. Tests execute real SQLite SQL through a clearly scoped Node SQLite prepare/run/get/all bridge and construct their schema from the recovered table declarations. They do not verify original native-driver execution, migrations, schema adoption, WAL repair or complete DatabaseService initialization.

The real two-process CLI fixture replaces its in-memory record seam with the recovered repository/ORM and an owned SQLite file. It verifies changed records and owner metadata after database close/reopen while retaining CLI history, queue, prompt/tool-schema and actual Write assertions. The driver bridge, schema setup and service forwarding remain test boundaries.

Validation: full build and configuration verification pass; core **2,071/2,071** (`work/session-repository-core.log`); compiled repository/record/startup/readiness/configuration/restart tests **67/67** (`work/session-repository-built.log`); real native fixture **1/1**, 7.4 seconds (`work/session-repository-native.log`). Final source verification passes (`work/session-repository-verify-final.log`) and joins the aggregate verifier as `verify:session-repository`. Syntax/whitespace checks pass. [Repository and driver contracts](native-session-restart.md#sqlite-repository-and-bundled-orm) document limits. No fresh full host aggregate is claimed; the previous sandbox audit failure and MCP permission TODO remain open.

## Original session records and serialized effects (2026-10-24)

Added `createNativeSessionRecords`: ten complete manager methods and twenty-three complete helper declarations, including the original database-facing record-store adapter. It composes with startup, readiness, configuration and restart. Record projection, startup merge, desired configuration, expert selection, inactive-status reconciliation and per-session effect ordering now use recovered control flow. The underlying Desktop database service/schema remains outside this attachment.

REA evidence `ev_8c8b17535e92fdeddbbed4b2509fca5a5f220d945bb885122d0d9f3a5049d252` covers 18,583 bytes and 2,729 AST nodes with zero parse failures. Verification passes **33 complete declaration/member AST comparisons** and **13 paired scenarios**. Preserved boundaries include ownership checked at effect enqueue, flushing only the observed tail, timestamps updated before a failed database write, immediate inactive task termination, and status-only updates when restoring an archived record through a database with that capability.

The native process fixture now uses these original record methods and adapter with an explicit in-memory database seam. It verifies record creation and configuration updates alongside actual CLI process replacement, persisted CLI history, paused queue restoration and Write execution. This proves integration of manager persistence routing, not durable Desktop database storage.

Validation: full build and configuration verification pass; core suite **2,060/2,060** (`work/session-records-core.log`); compiled record/startup/readiness/configuration/restart tests **56/56** (`work/session-records-built.log`); native fixture **1/1**, 7.2 seconds (`work/session-records-native.log`). Initial compile errors in optional TypeScript parameters and test assertion narrowing were corrected; the final build and source verification pass (`work/session-records-final-build.log`, `work/session-records-source-final.log`). `verify:session-records` joins the aggregate recovery verifier. [Record and effect contracts](native-session-restart.md#session-records-and-effect-ordering) document the remaining boundaries. No fresh full host aggregate is claimed; the sandbox audit failure and MCP permission TODO remain open.

## Original session startup connected to the real CLI fixture (2026-10-24)

Added `attachNativeSessionStartup`: complete `startSession`, `buildDesiredConfig` and pending-disposal wait methods, plus 26 complete local helper functions. Startup restores stored configuration and task state, initializes the original session maps/flags, applies project/user metadata rules, waits for deletion/disposal and validates lifecycle identity across initialization and persistence. Cleanup preserves a newer session rather than unregistering or deleting it. Existing recovered Addon constants and cwd error types are reused. Backend/event wiring, Desktop record persistence and hydration completion remain explicit host dependencies.

REA evidence `ev_310c43dafb1041f4736649ea19457dff6b1ea60170905e3d55094ec16917102a` covers 24,435 bytes and 3,264 AST nodes, with zero parse failures. Verification passes **29 complete declaration/member AST comparisons** and **13 paired scenarios**. Initial validation identified missing reused plugin constants and an incompletely shaped stored plugin-context fixture; those were corrected without changing original control flow. The final cases cover stored/explicit field precedence, foreign project isolation, plugin context, delete/disposal waits, identity mismatch, initialization/persistence failure, deletion during initialization, preservation of newer sessions, best-effort setters and stale task-state restoration.

The native process fixture now enters recovered `startSession` to create the manager state and backend. The backend adapter follows the original new-session behavior: known session UUID, CLI `--session-id`, then ACP `session/load` with the continue marker. A preparation hook subsequently triggers configuration routing and process replacement. History, paused queue restoration, new prompt/tool schema and real Write still pass. This replaces the fixture's manually constructed initial session state but does not claim complete Desktop record storage or event wiring.

Validation: full build and configuration verification pass; core suite **2,047/2,047** (`work/session-startup-core.log`); compiled startup/readiness/configuration/restart tests **43/43** (`work/session-startup-built.log`); real native fixture **1/1**, 7.4 seconds (`work/session-startup-native.log`). Source verification is registered as `verify:session-startup` in the aggregate recovery verifier. Syntax/whitespace checks pass. [Startup integration and remaining contracts](native-session-restart.md#session-startup) are documented. The prior full-host sandbox audit failure and MCP permission TODO remain unresolved; no new full host aggregate is claimed.

## Original readiness and prompt preparation composed with configuration/restart (2026-10-24)

Added `attachNativeSessionReadiness`, installing eleven complete SessionManager methods and the original cwd-normalization helper. Operations resolve sessions, await restart completion and drain pending changes; configuration mutations retain the explicit wait-bypass path. Prompt preparation rechecks configuration after its hook and recursively prepares a replacement backend. Inactive restoration preserves original cwd/replay precedence, pending restore sharing and load/resume overlap, fallback-directory creation, retry cleanup and lifecycle-generation checks. Actual storage/startup/replay adapters and the larger prompt lifecycle remain host-owned. [The contract and boundaries](native-session-restart.md#readiness-and-prompt-preparation) are documented.

REA evidence `ev_5fb9f6873be05f2a8f3431b0fa1bd0778a2710b8ad32691c6d3722f9edb73849` analyzes 5,812 bytes and 756 AST nodes with zero parse failures. Verification passes **12 complete declaration/member AST comparisons** and **11 paired behavior scenarios**. Tests include restore promise identity/cleanup, a load superseding a pending resume, hook failure, hook-induced backend replacement and actual owned temporary-directory creation. The lifecycle adapter still must enforce generation validity across its own asynchronous startup; these methods do not supply a full Desktop `startSession`.

The native CLI fixture now enters through recovered `withReadySession` and `resolveBackendForPromptSend`. A preparation hook calls recovered `updateSessionConfig`, which invokes recovered backend reconfiguration and restart. The fixture requires preparation to repeat with flags **[false, true]**, selects the replacement backend, then verifies the same persisted history, restored paused queue, new prompt/tool schema and real Write result. It passes **1/1** (`work/session-readiness-native.log`, 7.3 seconds). No hand-written readiness callback or pending-config assignment drives that active-session path. Its inactive startup and persistence callbacks remain fixture boundaries.

Validation: fresh full build and configuration verification pass; core suite **2,034/2,034** (`work/session-readiness-core.log`); compiled readiness/configuration/restart tests **30/30** (`work/session-readiness-built.log`); syntax and whitespace checks pass. `verify:session-readiness` is included in aggregate recovery verification. No fresh full host aggregate is claimed; the prior sandbox audit failure and MCP permission TODO remain unresolved. Automatic default CLI/Web mode controls, full inactive Desktop startup and reconnect remain unfinished.

## Original configuration routing composed with native restart (2026-10-24)

Added `createNativeSessionConfiguration`, combining the recovered restart controller with complete original `updateSessionConfig`, `enqueueSessionConfigMutation` and `applyDesiredConfig` members. Its backend reconfiguration helper preserves the complete original `reconfigure` decision method. Thirteen supporting functions and the permission-mode constant are recovered as well. Host-owned acquisition, persistence, projection and runtime-resolution callbacks remain explicit; this is not the full Desktop SessionManager or an automatically enabled Web/CLI mode-switching UI.

REA evidence `ev_6cfe67a8d29e77d9dad7270064e3ecec4eef47fc1e02c21f50794765bf6edb08`: one isolated source, 14,895 bytes, 1,936 AST nodes, zero parse failures. Hash-bound verification passes **18 whole declaration/member AST comparisons** and **nine paired behavior scenarios**. Covered branches include restart-reason precedence, environment drift, permission-before-model delivery and partial failure, model-only fast paths, sandbox-only updates and ignored reason-only patches, expected-expert preconditions, disabled-tool derivation, addon-selection precedence, mutation-tail serialization after failure and a model update while a mode restart is already pending.

The real native process fixture now calls `updateSessionConfig` and the recovered backend `reconfigure`; it no longer hand-populates pending restart fields. With the recovered fallback runtime resolver, this path successfully replaces the owned CLI process, resumes its history and queue, changes prompts/tool schema and executes Write under the new AcceptEdits configuration. The native fixture passes **1/1** in 7.3 seconds (`work/session-reconfiguration-native.log`). Desired-config persistence and session acquisition in that fixture are adapters; complete Desktop mutation routing, failed live replacement and reconnect remain open.

Validation: full build and config verification pass; the full core suite passes **2,023/2,023** (`work/session-reconfiguration-core.log`); compiled configuration/restart tests pass **19/19** (`work/session-reconfiguration-built.log`). Final TypeScript emission also verifies the widened optional diagnostic-details callback type. Syntax/whitespace checks pass. `verify:session-reconfiguration` joins the aggregate recovery verifier. No new full host aggregate is claimed; its existing sandbox audit failure and MCP permission TODO remain unresolved. [The integration document](native-session-restart.md#configuration-mutation-and-backend-decisions) records the original settings-only behavior and nontransactional external effects.

## Restart controller verified against real native CLI processes (2026-10-24)

Added `apps/web/test/native-session-restart.test.mjs`, connecting the compiled recovered controller to owned CLI processes through real ACP. It verifies old-process exit before replacement startup, old endpoint shutdown, same-session history recovery, changed system prompt/tool schema, real queue snapshot/restoration and an actual Write under the replacement AcceptEdits configuration. The written file and model-visible tool result are asserted. The restored queue preserves its error pause and does not dispatch additional model turns during the exchange. This closes a successful live-replacement evidence gap; the adapter remains test infrastructure and automatic mode changes are not yet wired into CLI/Web.

The first probe exposed a fixture assumption: ACP `session/load` returns no session ID. The original backend returns its already-known identity after load succeeds. The adapter now follows that behavior and passes `--session-id` to the replacement process. Source inspection also distinguished load metadata from the new-session branch: the final fixture forwards load metadata without adding `codebuddy.ai/continue`. No recovered controller or product behavior was changed to accommodate the fixture.

REA evidence `ev_4ae787a832146c87e48961ee68c10a48e6f35cbb692e0576d14595ea1046b530` covers four complete original backend members, 13,261 bytes and 1,838 AST nodes, with zero parse failures. [The restart document](native-session-restart.md#real-cli-replacement-through-acp) records the source ranges and integration boundaries.

Validation: the new process fixture plus existing ACP/Web regressions passed **13/13** (`work/session-restart-native-regression.log`). After the final metadata correction and added queue-error assertion, the final process fixture passed **1/1** (`work/session-restart-native-final.log`, 7.5 seconds). Syntax/whitespace checks pass. Production sources and built assets were unchanged this batch; the previous build and **2,014/2,014** core suite remain the latest such gates. No fresh full host aggregate is claimed, and its prior sandbox audit failure and MCP permission TODO remain open. Failed live replacement, reconnect, full Desktop initialization and automatic update routing remain separate scopes.

## Desktop session restart controller recovered (2026-10-24)

Added `createNativeSessionRestart`: six complete SessionManager members plus seven supporting declarations, including idle-drain serialization, pending configuration retry, explicit old-runtime release, same-ID backend loading, deferred-tool policy updates and unsent queue restoration. This is an extracted controller with explicit backend/wiring/policy adapters, not the entire Desktop manager. `createAddonSession`, default CLI and Web do not automatically use it yet. See [integration contract and preserved failure behavior](native-session-restart.md).

REA evidence `ev_cdcf2a5162edb1f3d739fffbfaa9eedffcc5883123bc43b8570b5d32e4e1cc87` covers 10,315 bytes and 1,395 AST nodes in one isolated original source, with zero parse failures. Hash-bound verification passes **13 complete declaration/member AST comparisons** and **10 paired behavior scenarios** against captured and reconstructed implementations. Scenarios cover successful lifecycle order and queue contents, busy/cancel/prompt gates, concurrent drains receiving newer configuration, failed initialization and retry, newer-config preservation, identity mismatch, unavailable cwd, best-effort cleanup/setter failures and configuration equality. Controlled backend doubles do not establish live process replacement or Desktop event wiring.

Preserved boundaries include settings not participating directly in this SessionManager equality check, fingerprint precedence over rendered prompt text, and nontransactional restart failure after the old backend has been destroyed. Queue restoration is best effort and cannot guarantee recovery on a second attempt after such a failure. No behavior was silently changed to improve the test outcome.

Validation: fresh `npm run check`, configuration verification and full build pass; original assets are staged. The core suite passes **2,014/2,014** (`work/session-restart-core.log`); compiled restart tests pass **10/10** (`work/session-restart-built-tests.log`). Launcher smoke checks pass for original CLI help, workbench help and Web → real SDK → recovered harness streaming in offline mode (`work/session-restart-launchers.log`). `verify:session-restart` is included in the aggregate recovery verifier. No fresh full host aggregate is claimed: the prior **79 passes, one sandbox audit failure and one known MCP permission TODO** remains the latest aggregate result.

## MCP list-change notifications verified before tool completion (2026-10-24)

The native network fixture adds HTTP and legacy SSE list-change cases. During the first echo call, the server replaces its tool list, emits notifications/tools/list_changed and holds the tool result until another tools/list arrives. Both cases pass this barrier, then require the next model schema to contain echo_new and omit echo, call the new tool and verify its result in a third model request. This is stronger than merely checking a later schema, which could pass through ordinary per-turn discovery.

A separate owned negative-control copy omits the notification and fails specifically at the discovery deadline (`work/native-mcp-list-change-negative.log`). The positive barrier run passes **2/2** (`work/native-mcp-list-change-barrier.log`). The final combined MCP regression records **18 passes and 1 failing TODO** in 31 seconds (`work/native-mcp-list-change-all.log`). Syntax and whitespace checks pass; no full build/core/host aggregate was rerun. The temporary negative control is diagnostic evidence, not part of the regular regression suite or a production modification.

REA evidence `ev_691c9b109ed7a769564e9d57620a697b0000feb55f020c7d552b8c011d2b24af` covers the complete original McpManager class, including serialized notification reindexing and generation checks: one file, 21,883 bytes, 5,028 AST nodes, zero parse failures. Production code, SDK, timeouts, configuration and prompts remain unchanged. Concurrent configuration replacement, notification storms and reconnect remain separate scopes. The prior full host aggregate failure/TODO is not superseded by this targeted work.

## Legacy SSE MCP connected through the default native CLI (2026-10-24)

The network MCP fixture now exercises explicit type=sse separately from Streamable HTTP. An owned long-lived GET stream advertises a session-specific POST endpoint and carries JSON-RPC replies as SSE message events. Four cases verify success, tool-error text, JSON-RPC error propagation and explicit-model headers. Assertions cover exact arguments, discovery, authentication/custom headers on both transports, subsequent protocol headers and GET-stream closure before cleanup. Existing five Streamable HTTP cases remain intact.

REA evidence `ev_347343e2d6c1e4e5034066705b0751f3e4c1a0982fdbd708397da939e4633d48` covers the original SSE underlying server and wrapper: two files, 4,666 bytes, 918 AST nodes, zero parse failures. The first focused native run passes **4/4** (`work/native-legacy-sse-probe.log`). The combined MCP run records **16 passes and 1 failing TODO** in 31 seconds (`work/native-all-mcp-transports.log`), including all five prior Streamable HTTP cases. Syntax and whitespace checks pass. No new full build/core/host aggregate is claimed. This adds protocol coverage only; the original SDK/factories, configuration and prompts are unchanged. Reconnection, replay and OAuth remain separate evidence gaps. The previous full host aggregate's sandbox failure and MCP permission TODO remain open.

## Native audit listener startup and reproducible static inspection (2026-10-24)

Further arm64 analysis identifies the monitor's first-line reader at `0x10012dae0`: it performs one read_line, tests nonempty length and returns, without parsing the line's content. The parent joins that reader before announcing readiness. This rules out a completely unwaited startup path, while leaving actual OS subscription readiness and the intermittent audit loss unproven. Exact instruction anchors are documented in the sandbox analysis; no native behavior is changed.

`scripts/inspect-sandbox-audit-native.mjs` now reproduces this supplemental static inspection against the fixed captured binary. It verifies the entire image hash and Mach-O text mapping, resolves four unique Rust symbols, computes code-span hashes, extracts command literals and binds kill/nanosleep/join/mutex stubs. Optional assembly output is retained in `work/sandbox-audit-native-static.json`. The successful run covers four symbol spans totaling 11,696 bytes; spans end at the next text symbol and do not imply full native source recovery. It uses local nm/LLVM without launching the target. The matching REA Mach-O evidence from the preceding entry is reused, not misrepresented as a decompiler result. Syntax and whitespace checks pass; production sources and test results are otherwise unchanged.

## Native macOS sandbox audit collection partially recovered (2026-10-24)

REA Mach-O inspection and LLVM static disassembly locate the original Rust SandboxLogMonitor start/stop functions and denial-to-IPC conversion. The monitor spawns `/usr/bin/log stream` with a kernel Sandbox predicate, filters tagged records, polls in 10 ms steps, waits up to a 300 ms empty-record boundary, then applies a 150 ms collection window and three stable-count observations within a 600 ms counter limit. It terminates the log child and collects through reader EOF. Exact addresses, binary hash, instruction anchors and limitations are recorded in [the sandbox audit monitor analysis](native-sandbox-cli.md#native-macos-audit-monitor-partial-static-recovery). No native code was patched or replaced.

REA evidence `ev_fe0df082e6e2fdd6d442bc474a22ceb8be3138d1983147f64e7af2a23f81602c` establishes Mach-O identity/layout; the timing interpretation uses independently retained LLVM assembly and indirect-symbol bindings (`work/sandbox-log-monitor.asm`). Four isolated concurrent fixture probes pass (`work/sandbox-audit-concurrent-1.log` through `-4.log`), and an owned diagnostic trace shows syslog-tag matching, one record after 190 ms of counted waits, and that record in IPC (`work/sandbox-audit-native-logs.log`). These observations narrow the mechanism but do not prove why the prior aggregate lost audit records.

Failure diagnostics now also collect bounded owned log files after native shutdown, when buffered writes can flush. Successful-run diagnostics are opt-in. The subsequent strict fixture passes (`work/sandbox-audit-capture-final.log`); the previous 79-pass/1-failure/1-TODO aggregate remains unresolved and is not replaced by these targeted successes. Production JavaScript, native binary, SDK, configuration and prompts remain unchanged.

## Current full host aggregate exposes the native sandbox audit gap again (2026-10-24)

The complete current CLI/Web suite records **81 tests: 79 passed, 1 failed, 1 failing TODO** in 241 seconds (`work/current-host-aggregate.log`). This includes all nine daemon lifecycle/recovery cases, five HTTP MCP cases, stdio and SDK MCP, native Auto, interactive/output/stream input, child sessions, ACP, Web and sandbox host paths. The existing MCP default-policy denial TODO remains explicit. The actual failure is the captured-binary sandbox test: file access was denied with exit code 1 and “Operation not permitted”, but the raw native ProcessExit frame contained only exitCode/processId and no fileBlockRecords. The client preserved that entire frame, ruling out field loss in its JavaScript parsing for this occurrence.

The fixture now includes the native peer's own captured stdout/stderr (bounded tails) in failure diagnostics, in addition to raw IPC and lifecycle logs. This uses the original manager's read-only capture method and adds neither a delay nor synthesized denial records. One subsequent focused run passed (`work/current-sandbox-diagnostic.log`); it does not supersede the failed aggregate or establish the cause of intermittent missing audit records. The strict audit assertion is retained. README explicitly reports the failed aggregate, and all 100 local README links resolve. Fresh sandbox CLI source verification passes four classes, 88 members, 13 comparisons and one real-process pair (`work/current-sandbox-source.log`); syntax and whitespace checks pass. Production code and staged assets are unchanged in this batch.

## Embedded harness now composes the full original Auto pipeline (2026-10-24)

`createHarness({ nativeAutoMode: true, ... })` now supplies the recovered Auto runtime with its actual AgentService, settings, product/prompt configuration, memory, model resolution and tool projections. The option defaults native permissions on, while preserving an explicit nativePermissions value. Existing explicit Auto services/classifier hosts take precedence; omitted options retain prior behavior. The composed runtime is returned as `autoModeRuntime`. Tool projections refresh before each classification so post-construction registrations are visible. The independent standalone execution approval guard remains in place.

Five actual SDK/Bash cases now use this public option instead of manually bridging the classifier and permission host: fast allow, second-stage allow, denial, classifier error and host rejection. They verify original prompt/stage inputs, real filesystem effects, dynamic tool projection refresh and host approval ordering. Two additional construction cases verify opt-out and explicit-service precedence without model resolution. An initial test-only failure omitted the required explicit ModelProvider; the corrected construction fixtures supply a provider that throws if accessed, confirming no implicit model work during setup.

REA evidence `ev_c1c04c2dee218914979f559156ec6143adcc3503c6035abf1b4498761e694e5d` rechecks the original classifier and permission-service classes: two files, 7,818 bytes, 1,454 AST nodes, zero parse failures. This change adds host wiring; recovered class bodies, original native entry factories, SDK, configuration and prompt content remain unchanged. Configuration fidelity, type/syntax checks and resource-staging build pass (`work/auto-host-composition-config.log`, `work/auto-host-composition-check.log`, `work/auto-host-composition-build.log`). Full core regression passes **2,004/2,004** in 64 seconds (`work/auto-host-composition-core.log`). Targeted native Auto passes **9/9** and standalone Web passes **11/11** (`work/auto-host-composition-hosts.log`, `work/auto-host-composition-web.log`); the full host aggregate was not rerun. The built package entry also initializes the new runtime without resolving a model (`work/auto-host-composition-built.log`). After the final test edits, a fresh build and all **7/7 compiled composition tests** pass (`work/auto-host-composition-final-build.log`, `work/auto-host-composition-built-tests.log`). Whitespace checks pass.

## Streamable HTTP MCP verified through the default CLI (2026-10-24)

The new `native-http-mcp.test.mjs` runs the default CLI against an owned loopback MCP/model server. Five cases cover JSON and SSE-framed POST responses, tool error content, JSON-RPC errors and explicit model selection. Assertions verify URL-only configuration normalization, discovery, exact remote arguments, static authorization/custom headers, MCP session/protocol continuity and results in the next model request. The model-ID header appears for an explicit CLI model override and is absent for the agent-default case, matching the original proxy's request/session lookup.

The initial fixture wrongly expected the model provider to append `/chat/completions`; diagnostic output showed successful MCP discovery and a model request to the configured `/v1` URL. The fixture now supplies the complete endpoint (`work/native-http-mcp-diagnostic.log`). A subsequent speculative default-model header assertion failed in all four cases (`work/native-mcp-transports-final.log`); inspecting the proxy identified the explicit-override boundary, and a fifth case now verifies it. The final focused run passes **5/5** (`work/native-http-mcp-model-header.log`). The combined HTTP/stdio/SDK-hosted run records **12 passes and 1 failing TODO** in 24 seconds (`work/native-mcp-transports-verified.log`); syntax and whitespace checks also pass. These probe failures were fixture assumptions, not production changes.

REA evidence `ev_0fdee810e8f2bfd45dde363847702d0dde99ec26668d0a0a4b7098578cf505cc` covers the original underlying HTTP transport class, wrapper and server manager: three files, 16,578 bytes, 3,742 AST nodes, zero parse failures. Fresh source verification passes 157 complete method/function ASTs, one JSONC factory and 752 behavior comparisons (`work/native-http-mcp-source.log`). This batch changes tests and documentation only. GET returns 405 in the fixture: persistent notification streams, legacy SSE, OAuth and network reconnection remain outside this evidence. The original permission-denial TODO remains open. No fresh full build/core/host aggregate is claimed.

## External stdio MCP lifecycle and a reproduced original denial defect (2026-10-24)

A new default-CLI fixture starts an owned newline-JSON-RPC MCP subprocess with private HOME/state and a local model endpoint. It verifies initialize/initialized, tools/list, advertised names, successful tools/call, error text, explicit HTTP PreToolUse denial with zero remote calls, and child process exit after CLI completion. Shutdown checks wait for OS process disappearance instead of treating the final shutdown log as proof of reaping.

The first probe failed the immediate process assertion in allow/error cases and also exposed a separate policy failure in the deny case (`work/native-stdio-mcp-probe.log`). Follow-up logs explicitly show default-mode noninteractive denial, followed by an actual remote tool result (`work/native-stdio-mcp-default-probe.log`). The original permission service caches its deny result and returns false from needsApproval; the MCP proxy reruns hooks with a new call ID instead of consuming that cache. The builtin tool execution pipeline reads that cache, so builtin permission tests had not established this MCP boundary. Production behavior is preserved. The expected-denial assertion remains a failing TODO with a clear reason, not a passing test that accepts execution.

REA evidence `ev_b2cc39c4a2ab52ade4ab2708e3600d05f98ddd7d111648a4c9409014ee9489fe` covers the original underlying stdio server, wrapper and transport manager: three files, 6,022 bytes, 1,248 AST nodes, zero parse failures. Fresh MCP source verification passes 157 complete method/function ASTs, one JSONC factory and 752 behavior comparisons (`work/native-stdio-mcp-source.log`). The focused host run records **3 passes and 1 failing TODO** (`work/native-stdio-mcp-final-boundary.log`). The final combined stdio/SDK-hosted MCP run records **7 passes and 1 failing TODO** in 17 seconds (`work/native-mcp-hosts-final.log`). TODO is applied only after the exact denial/execution defect is reproduced and all transport/lifecycle checks pass; unrelated failures remain ordinary failures. Syntax and whitespace checks pass. This is not a fully passing MCP permission suite; no fresh full build/core/host aggregate is claimed. No production code, SDK, configuration or prompts changed in this batch. README now describes the restored Auto pipeline and removes the stale claim that the classifier is still missing.

## Tool projections restored and Auto exercised through the real standalone SDK (2026-10-24)

Integration inspection found that standalone tool descriptors dropped `toAutoClassifierInput`, even for tools whose original classes implemented it. All fifteen explicit methods plus BaseTool's empty method are now extracted. ToolManager preserves projections in returned descriptors and exposes a classifier index; custom handlers may supply their own projection, while unknown names without a projection remain absent to preserve the classifier's raw-input fallback. Existing SDK permission and execution guards are unchanged.

A real SDK integration connects the composed Auto runtime to the harness's actual AgentService, prompt/configuration/model managers, memory resolver and tool index. Five cases verify fast allow, second-stage allow, classifier denial, classifier error and host rejection, including actual Bash filesystem results and exclusion of display-only description text. The initial probe correctly exposed the retained standalone execution guard (`work/auto-projection-sdk-probe.log`): classifier allow alone did not authorize a write. The final cases require host approval for allowed writes and preserve rejection behavior rather than weakening the guard (`work/auto-projection-sdk-final.log`).

Source verification discovers the original projection methods and constructor names directly from the fixed bundle, compares all sixteen method ASTs and passes 496 input/output comparisons (`work/auto-projection-source.log`). REA evidence `ev_684633a401712163f113c29ce1f96201e5d0b9dcce5a8a4f6cb22f4325218751` covers the extracted methods: one file, 2,692 bytes, 649 AST nodes, zero parse failures. Descriptor tests also cover native, inherited empty, custom and unknown tool projections. Fresh configuration fidelity, type/syntax checks and resource-staging build pass (`work/auto-projection-config.log`, `work/auto-projection-check.log`, `work/auto-projection-build.log`). Full core regression passes **2,002/2,002** in 73 seconds (`work/auto-projection-core.log`); targeted native Auto and standalone Web hosts pass **20/20** in 33 seconds (`work/auto-projection-hosts.log`). The built projection export works, and post-format source verification still passes. No fresh full host aggregate is claimed.

## Original Auto support services and complete composition restored (2026-10-24)

Four more original classes are now reusable: AutoModeSettingsResolver, AutoModeSystemPromptBuilder, AutoModeProjectInstructionsResolver and AutoModeTranscriptLimit. The four AUTO_MODE_DEFAULTS sections are retained verbatim as data from factory 50948. `createNativeAutoModeRuntime` composes these with the recovered classifier and permission service from explicit host dependencies. The default native graph and SDK remain unchanged; the library no longer requires a consumer to invent prompt substitution or transcript-limit logic to compose Auto.

Source comparison passes all four complete class ASTs, the existing TokenUtils rough-estimator AST, the complete defaults data and eight paired behavior reports. Scenarios cover allowed settings scopes and ordering, `$defaults` expansion, empty-section fallback, warning behavior, original prompt substitution including literal replacement text, settings-deny guidance, missing prompts, memory filtering/truncation/failure, configured and fallback model windows, exact-limit acceptance and over-limit rejection. A composition test loads the captured 25,466-character prompt template, classifies an action and then verifies that a too-small window blocks a later action before a model call.

REA evidence `ev_6fbe89da8c59c9a47c01a6c7c6e28a33d7c78d0fa8a909353e6959229f17e442` covers five original fragments: 25,907 bytes, 846 AST nodes, zero parse failures. Source verification and both focused tests pass (`work/auto-support-source.log`, `work/auto-support-test.log`). Fresh configuration fidelity, type/syntax checks and resource-staging build pass (`work/auto-support-config.log`, `work/auto-support-check.log`, `work/auto-support-build.log`). The full core suite passes **1,996/1,996** in 73 seconds (`work/auto-support-core.log`); targeted native Auto and standalone Web regression passes **20/20** in 33 seconds (`work/auto-support-hosts.log`). The built runtime/defaults exports load successfully. The full host aggregate was not rerun for this batch.

## Original Auto classifier client and transcript helpers extracted (2026-10-24)

The library now exports `createNativeAutoModeClassifier`, retaining the complete original client, transcript serializer, timeout helpers and stage constants. Explicit dependencies supply the AgentService override runner, system-prompt builder, transcript-limit checker, tool projections and owned state directory. The resulting client composes with the previously extracted Auto policy service. Default native factories, SDK configuration and original prompt content are unchanged.

Source verification compares twenty AST nodes (one complete class, twelve functions and seven constant declarations), checks injected timeout values against original primitive factory 75798, and pairs twelve behavior reports. Scenarios verify transcript inclusion/exclusion, delimiter neutralization, valid AskUserQuestion answers, both stage argument sets, thinking-tag filtering, malformed output, empty/unknown/failing projections, circular-input fallback, transcript overflow, stage-specific error identity, private diagnostic writes and timeout with a still-resolvable underlying model promise. The classifier agent name is checked against the original enum binding.

REA evidence `ev_d5b7f346027cfa0ca2f1259bc197921692453045da577db947b9d68caa582b82` covers the original extracted client/helpers: one file, 7,546 bytes, 1,474 AST nodes, zero parse failures. Source verification and the focused classifier scenario pass (`work/auto-client-source.log`, `work/auto-client-test.log`). Fresh configuration fidelity, type/syntax checks and resource-staging build pass (`work/auto-client-config.log`, `work/auto-client-check.log`, `work/auto-client-build.log`). Full core regression passes **1,994/1,994** in 60 seconds (`work/auto-client-core.log`); targeted native Auto and standalone Web regression passes **20/20** in 34 seconds (`work/auto-client-hosts.log`). The built classifier export loads successfully. This batch does not claim a fresh full host aggregate.

## Reusable original Auto policy service extracted (2026-10-24)

The standalone permission host can now compose the recovered AutoModePermissionService from an explicitly supplied classifier, rules resolver and project-instructions resolver. The library exports the service factory, denial tracker and all three original classifier error classes. An existing explicitly supplied service still takes precedence; absent configuration remains unavailable. This adds reusable original policy behavior without changing the default native graph or substituting model prompts.

The extraction retains all five complete class ASTs. Source verification compares them against the fixed sample and runs 18 normalized behavior reports against both implementations. Assertions cover recent-action deduplication and the twenty-entry cap, isolated session state, three-failure circuit opening and success reset, consecutive/total denial limits and reset, removal of an approved action, settings opt-out, transcript limits, headless versus interactive fallback and explicit tracker clearing. Host tests exercise the new composition and the unchanged unconfigured boundary.

REA evidence `ev_fb66cad8453dd3a8958d4dc72a1430a6713b671a7af7d44a9a0373df90f9b887` covers the original service, tracker and error declarations: three files, 5,820 bytes, 1,170 AST nodes, zero parse failures. `npm run verify:auto-mode-service --workspace packages/harness` passes five class AST comparisons and 18 behavior reports (`work/auto-service-source.log`). The initial two focused module/host tests pass (`work/auto-service-test.log`). Fresh configuration fidelity, type/syntax checks and the resource-staging build pass (`work/auto-service-config.log`, `work/auto-service-check.log`, `work/auto-service-build.log`). The full core suite passes **1,993/1,993** in 61 seconds (`work/auto-service-core.log`). Targeted native Auto plus standalone Web host regression passes **20/20** in 33 seconds (`work/auto-service-hosts.log`), and the built package exports load successfully. The full host aggregate was not rerun; the previous 69-host aggregate predates the three classifier failure cases and this explicit standalone composition.

## Native classifier failure recovery and circuit transition (2026-10-24)

The native Auto fixture now adds stage-one failure, stage-two failure and circuit-open scenarios. Errors are returned by the owned model endpoint as HTTP 400 responses, without replacing classifier/service methods. Each stage-specific failure denies Bash, produces the original distinct safety message and a private error report, then a later prompt in the same session reclassifies and executes successfully after endpoint recovery. The circuit case requires three consecutive failed classifications, verifies the file remains absent, and requires the fourth prompt to bypass the classifier and emit a normal SDK permission request. Rejecting that request still leaves the file absent.

REA evidence `ev_62e6f04c87a14610c00cf0120caf24d6da1d4dae7945e7d588e131132d05c6e8` covers the complete original AutoModePermissionService and denial tracker (UTF-16 11570431..11574048 and 11555146..11556741): two files, 5,266 bytes, 1,077 AST nodes, zero parse failures. Initial targeted probes passed both error-recovery cases and the four-prompt circuit case. The final expanded native Auto suite passes **9/9** in 33 seconds (`work/native-auto-failure-final.log`), including all six prior cases. Syntax and whitespace checks pass. Production source, prompts, SDK and configuration remain unchanged. The prior full build and 1,991-core/69-host run apply to the preceding tree; this batch adds targeted host coverage, not a new full aggregate claim.

## Auto strategy dependency corrected and native classification exercised (2026-10-24)

Default CLI probes exposed a dependency error in the standalone reconstruction: the original Auto strategy resolves `iy`, which is AcceptEdits, while both the port and its captured-class fixture injected DontAsk. The port and fixture now resolve AcceptEdits. A source binding assertion prevents the same shared injection mistake from silently passing isolated class comparisons. A direct regression requires Auto Write to bypass classification, even when the fixture classifier would deny it. Existing classifier-specific checks now use Bash so they actually reach the classification branch.

Native tests use the unchanged original factory and classifier through SDK bidirectional stream-json. Four cases verify fast allow, second-stage allow, second-stage denial and unparseable second-stage denial, including exact model request counts, projected input, zero temperature, no manual approval and actual file side effects. Two further cases establish original boundaries: Auto Write executes without a classifier request, and plain print-mode Bash is denied before classification because permission prompts are unavailable. All six pass (`work/native-auto-final.log`). The initial failed Write and plain Bash probes remain diagnostic evidence rather than being counted as successful classifier coverage.

REA evidence `ev_01fe9f8b6a8e00bd05ce34742f1b2c357c9e09ab620edf6a32d825c327bf7dfc` analyzes four complete original class expressions (classifier, AcceptEdits, Auto and ToolPermissionService): 24,043 bytes, 4,833 AST nodes, zero parse failures. Source verification passes 118 method/function ASTs, 18 constant tables and 1,920 behavior comparisons (`work/native-auto-source.log`). All 22 targeted permission tests pass (`work/native-auto-core-target.log`). Fresh batch gates also pass original configuration fidelity, type/syntax checks and the resource-staging build (`work/native-auto-config.log`, `work/native-auto-check.log`, `work/native-auto-build.log`). The full core suite passes **1,991/1,991** in 66 seconds; the full CLI/Web host suite passes **69/69** in 260 seconds (`work/native-auto-core.log`, `work/native-auto-hosts.log`). This includes the corrected ACP cancellation continuation scenario and supersedes the earlier 62/63 aggregate failure for the current tree. It does not establish complete reconstruction or remove the documented original cancellation timing boundary.

## ACP cancellation barrier and late rejection marker identified (2026-10-24)

Source inspection identified an original 500 ms cancellation barrier in AcpView. The paired scenario now checks that 499 ms blocks even local command dispatch and exactly 500 ms permits it. Waiting for this barrier alone did not resolve the follow-up failure: native diagnostics showed a second model request, a streamed answer and finish reason `stop`, yet `stopReason: cancelled` (`work/native-cancel-barrier-host.log`).

Flushed owned logs established the separate ordering: ACP forwarding resolves on abort and unsubscribes; InterruptionService later finishes trace flushing and sets `userInitiatedAbort`; the next successful result is then classified as internally aborted (`work/native-cancel-flushed-probe.log`). A new source-paired scenario reproduces this late marker, requires the completed follow-up to be cancelled, verifies flag consumption, and requires the following result to finish normally. This replaces the earlier unexplained continuation observation with a supported original-code boundary.

The native fixture now waits past the deliberate barrier, requires a real follow-up model request and answer, verifies that the denied Write never executes, records either original completion label according to ordering, and strictly requires a further prompt to return `end_turn`. This intentionally replaces the unsupported assumption that every first follow-up must be labelled successful; it does not hide missing answers or relax file-side-effect checks. Production code, SDK and cancellation state are unchanged. No automatic prompt retry or output relabelling was introduced.

REA evidence `ev_312aa0687d6b0d298096438f68b5d7e991f62c65c20f1448f5b3218d8ceede11` covers the original barrier declaration, AcpView, ACP Agent and InterruptionService: four files, 28,550 AST nodes and zero parse failures. Protocol verification passed eight complete classes, 217 members, five primitive factories, 29 declarations and **37 paired scenario groups** (`work/native-cancel-state-source.log`). All **38 targeted core tests** and **six native ACP cases** passed (`work/native-cancel-state-core.log`, `work/native-cancel-state-final.log`). Syntax/whitespace checks passed. The full 62/63 host run remains historical failure evidence; the full aggregate and unchanged runtime build were not rerun for these targeted fixture/scenario changes.

## Same-parent child continuation across CLI processes (2026-10-24)

The child-session fixture now pairs new-parent and same-parent recovery for both allowed and denied Read histories. Same-parent cases start with an explicit `--session-id` and use `--resume` for two later CLI processes. The parent prompt/history is restored, the child retains its ID and configured model, and its original tool outcome plus both subsequent answers accumulate in exactly one JSONL. A third child model request sees both earlier answers. The new-parent cases retain their split-file assertions rather than being changed to the more convenient same-parent behavior.

Both initial same-parent probes passed in about 24 seconds (`work/native-child-same-parent-probe.log`). The existing REA evidence for original factories 97959/71915 and session-stack comparison applies to unchanged production sources. Runtime documentation now describes the verified parent-ID plus child-ID continuation procedure, and keeps crash, changed-permission and previously split-history boundaries explicit. No original store/metadata behavior was changed.

Fresh batch gates passed configuration fidelity, type/syntax checks, build with original staged assets, and **1,989/1,989 core tests** (`work/native-child-resume-config.log`, `work/native-child-resume-check.log`, `work/native-child-resume-build.log`, `work/native-child-resume-core.log`). The full host run passed **62/63**, including all four child scenarios, but ACP cancellation followed by an immediate prompt returned `cancelled` instead of expected `end_turn` once (`work/native-child-resume-hosts.log`). The strict assertion is retained with additional result/model-count/phase diagnostics. An isolated replay passed (`work/native-acp-cancel-followup-probe.log`); that does not establish a root cause or supersede the failed aggregate.

Three further isolated cancel/follow-up probes run concurrently also passed (`work/native-acp-cancel-followup-1.log` through `-3.log`). The intermittent continuation issue remains open; no timeout, runtime logic or success assertion was relaxed. Whitespace and modified JavaScript syntax checks passed.

## Cross-parent child resume and split transcript storage (2026-10-24)

The native child fixture now uses three separate CLI processes. It extracts the original `[Agent ID: ...]`, resumes the child from a fresh parent, and verifies prior child question, answer, exact Read success/denial result, configured model routing and stable returned ID. The second parent's initial input excludes the old parent prompt. Both permission cases pass through actual native Agent/session/store implementations.

A stronger persistence assertion exposed a fixed-sample limitation: the resumed answer is not appended to the first parent's JSONL. The second parent writes another `subagents/<same-child-id>.jsonl` containing only resumed history. Original lookup returns the first matching file in filesystem directory order, without merging or choosing by recency. The third process is checked against that exact selection rule. This is preserved source behavior, not a reconstruction fix or a promise of complete cross-parent continuation.

The initial model-history probe passed (`work/native-child-resume-probe.log`); the incorrect single-file append assumption failed (`work/native-child-resume-final.log`). The storage diagnostic confirmed two files (`work/native-child-resume-storage-probe.log`). Final strengthened tests passed **2/2**, with zero failures or skips, in about 24 seconds, including third-process lookup (`work/native-child-resume-split-history.log`). Same-parent child resume and changed permissions remain separate scopes.

REA evidence `ev_50c407d780f29595a95b364d953690a59d94daa821da53310785f4c943f97077` covers complete original factories 97959 and 71915: two files, 60,711 AST nodes and zero parse failures. Session-stack source verification passed three classes, 87 members, seven declarations, three factories, 48 comparisons and two real SDK pairs (`work/native-child-resume-source.log`). Syntax and whitespace checks passed. README/runtime documentation now state the storage boundary. Runtime sources are unchanged; the preceding full host/core/build checks were not rerun for this fixture/documentation change.

## Foreground child Agent through the native default CLI (2026-10-24)

A new real-process fixture exercises the original Agent tool, child session and child Read through the default launcher. Separate configured parent/child model IDs produce four requests in parent → child → child → parent order. The child's own instructions, delegated prompt, tool inventory and real Read result reach its model. The final child answer returns in the parent's Agent tool result, while the child's raw Read tool message does not appear directly in parent history.

The permission pair includes or omits Read from the parent's explicit `--allowedTools Agent` list. The allowed case reads owned file evidence; the denied case returns a permission error without file contents. Both return a distinct mock child answer to the parent and exit naturally. This is foreground/default-host evidence; native background teammates, fork/worktree isolation, resume and cancellation remain separate scopes.

The initial configuration used only a `custom` child tag and failed with `Task agent owned-child is not available` (`work/native-subagent-probe.log`). Original AgentManager registration filters CLI agents; using `cli` and `custom` follows the original rule and passed (`work/native-subagent-cli-tag.log`). Separate model routing and the strengthened permission pair also passed. No runtime implementation or SDK was modified.

REA evidence `ev_727ea302f7ebc79b17fd87746152ea6e6f37b10020db93ec5a28984bc1855c55` covers the complete original Agent tool class: one file, 3,059 AST nodes and zero parse failures. Task source verification passed 495 schema/behavior comparisons (`work/native-subagent-source.log`). AgentManager verification passed 559 comparisons across 68 methods and 74 YAML modules (`work/native-subagent-manager-source.log`). Final targeted validation passed **2/2 native child-agent cases**, zero failures or skips, in about 8.5 seconds (`work/native-subagent-final.log`). Syntax and whitespace checks passed. The preceding full 59-host, 1,989-core and successful build/type checks remain historical baselines for unchanged runtime sources, not reruns of this addition. README and runtime documentation now include the native child-session capability and configuration rule.

## Side effect survives a crash before tool-result persistence (2026-10-24)

A new native daemon case installs a project-local HTTP PostToolUse hook matching Write, explicitly approves the tool, and holds the hook response. It verifies the hook received the original arguments and successful tool response, the target file exists, and model continuation has not started. SIGKILL at this point leaves the file intact, but after manual restart ACP marks the call cancelled with `session_interrupted`, and the next model request gets empty tool content with `skipRun: true`. File bytes, inode, modification/change timestamps, one hook request and one approval are checked across recovery. The continuation model emits text only, so no inference is made about a model deciding to retry.

This directly establishes a non-atomic boundary between tool side effects and session result history in the fixed sample. A replayed cancellation is not proof that nothing executed; there is no demonstrated rollback. Original behavior is preserved rather than patched into a synthetic successful result. The test additionally exercises project-local hook settings and the original HTTP hook executor through the default daemon. The initial probe passed in about 17.5 seconds (`work/native-post-hook-crash-probe.log`); diagnostic observations were converted into explicit assertions.

REA evidence `ev_23f1e02f39bb6f9f96383d37f07342e743443c58913feb40c309073c2589276e` covers complete original ToolManager and ToolHookManager classes: two files, 6,741 AST nodes and zero parse failures. Hook lifecycle verification passed 70 complete AST methods/functions and 884 comparisons with 15 unchanged dependency factories (`work/native-post-hook-source.log`). README and runtime documentation now distinguish a persisted completed result from a side effect whose result was lost. Runtime/SDK sources are unchanged.

Final full-host validation passed **59/59 tests**, with zero failures, cancellations or skips, in about 185 seconds (`work/native-post-hook-hosts.log`). This includes all nine daemon scenarios and all four PTY cases after the chunk-wait correction, superseding the previous 57/58 host run. Syntax and whitespace checks passed. The preceding 1,989-core passing run and successful build/type check remain applicable historical evidence for unchanged production sources; they were not rerun for this test/documentation-only addition.

## Completed Write result across daemon crash (2026-10-24)

The native daemon fixture now approves one real Write, verifies its bytes, waits for the following model request to contain its actual nonempty tool result, and holds that response before SIGKILL. Manual restart and ACP session load replay the call as completed, preserve the exact tool result in the next model request, and omit the withheld answer. File content, inode, nanosecond modification/change times, one approval and expected model request count are checked across recovery. The initial probe passed in about 16 seconds (`work/native-daemon-written-probe.log`); the diagnostic output was replaced with explicit completed/not-cancelled replay assertions.

REA evidence `ev_9229693cfd1c9a79a1b17159db8664a5b8881fb668c5e8150666012c67d21b30` covers the complete original ToolManager class at UTF-16 offsets 11657350..11681925: one file, 5,730 AST nodes and zero parse failures. Original tool execution and post-tool hooks precede SessionManager's separate result-history append, so this successful recovery does not establish atomicity in the side-effect-before-persistence window. The preceding stream lifecycle and ACP replay source evidence remains applicable. No runtime factory, permission default or SDK behavior changed. README and runtime documentation describe this narrower verified boundary explicitly.

Fresh full core validation passed **1,989/1,989 tests**, with zero failures, cancellations or skips, in about 68 seconds (`work/native-written-recovery-core.log`). This replaces the earlier 1,988-test core baseline and includes the strengthened sandbox audit scenario.

The fresh full-host run passed **57/58**, including all eight daemon cases, but exposed a PTY fixture race (`work/native-written-recovery-hosts.log`): it waited only for the folder-trust title before asserting the option, and one terminal frame arrived split across chunks. The fixture now waits for both title and option using the existing deadline, retaining the assertion and production behavior. This failed aggregate remains recorded rather than relabelled as green.

After the PTY wait correction, all **4/4 interactive cases** passed in about 17 seconds (`work/native-pty-frame-final.log`). Syntax and whitespace checks passed. The full host aggregation was not repeated after this fixture-only correction; its other 57 passing cases and the targeted rerun are separate evidence. Runtime build/type validation from the preceding step remains applicable to unchanged production sources.

## Pending Write approval across daemon interruption (2026-10-24)

The native daemon regression now exercises a completed Write tool call waiting for ACP permission. It explicitly switches the original daemon's `delegate` mode to `default` using `session/set_mode`, then cancels or kills the owned daemon without approving the call. After restart, ACP replay emits the original call followed by `cancelled` with `session_interrupted`; the next model request contains the original arguments and an empty `skipRun: true` tool result. The target file is absent before interruption and after continuation. This establishes recovery before execution, not exactly-once side effects or rollback.

The first probes incorrectly expected interactive approval in the daemon's default mode (`work/native-daemon-approval-probe.log`, `work/native-daemon-approval-diagnostic.log`). A subsequent fixture held its own approval callback while waiting for the request to settle; that run was stopped, its verified owned daemon and temporary state cleaned, and the callback gate corrected (`work/native-daemon-approval-default.log`). Neither issue required a runtime change. Both corrected native probes passed (`work/native-daemon-approval-corrected.log`).

REA evidence `ev_a23a4595099c9f67c883e5d5d8db33cd318901fdaeed868f140d91ad13b7b2df` covers complete original ACP replay factory 67037 and the original `fillFunctionCallResultHistory` method: two files, 2,602 AST nodes and zero parse failures. The replay source verifier passed one factory, 16 functions, nine comparisons, four cold-parent pairs and four entrance-edge pairs (`work/native-approval-recovery-source.log`). The separate history/input pipeline verifier passed 1,261 comparisons (`work/native-approval-history-source.log`); that broader processor check is not presented as a direct verifier of missing-result repair. README and runtime documentation now distinguish cancelled approval from completed tool execution.

Final targeted validation passed **7/7 daemon cases**, with zero failures, cancellations or skips, in about 103 seconds (`work/native-daemon-approval-final.log`). Syntax and whitespace checks passed. Runtime code is unchanged; the immediately preceding successful build, type check and 55-host aggregate remain historical baselines and were not rerun for this test/documentation-only step.

## Partial streamed answers across cancellation and daemon loss (2026-10-24)

Two new daemon cases wait for the real ACP client to receive an unfinished model text chunk before interruption. Normal `session/cancel` returns `cancelled` and preserves that draft in disk JSONL, ACP replay and the next model request after restart. SIGKILL at the same streaming boundary loses that unfinished answer in all three places, while retaining completed history and the pending user input. Assertions now enforce this distinction. No runtime factory, SDK or persistence behavior was changed.

Original stream handling accumulates deltas in `AbortedStreamDraftStore`, commits completed items, and flushes drafts through `addHistory` when the abort signal is handled. Abrupt process loss cannot execute that flush. REA evidence `ev_3d85cfe74d467eb36ef6dac7fd57efa83ac9938f48cd8783af9794428ff36d88` analyzes the original draft declaration and complete session factory: two files, 50,722 AST nodes and zero parse failures. The session-result verifier passed 682 comparisons covering draft storage, abortable iteration, seven SessionManager methods and four content-filter helpers (`work/native-stream-draft-source-pair.log`).

Both targeted probes passed (`work/native-daemon-partial-cancel-probe.log`, `work/native-daemon-partial-crash-probe.log`). The five-case daemon fixture also checks completed-turn restart/crash and interruption before model content. These tool-free tests do not establish recovery of reasoning/tool-call drafts, automatic crash restart or exactly-once external side effects. README and runtime documentation describe the observed persistence boundary.

Final full-host aggregation passed **55/55 tests**, with zero failures, cancellations or skips, in about 165 seconds (`work/native-stream-draft-hosts.log`). Fresh `npm run build` and `npm run check` passed, including staging original native assets (`work/native-stream-draft-build.log`, `work/native-stream-draft-check.log`). Syntax and whitespace checks passed. The full core suite was not rerun for this test/documentation-only step; its earlier baseline remains historical evidence.

## Daemon forced-exit recovery, including an active model request (2026-10-24)

The daemon fixture now covers ordinary restart, SIGKILL after a completed turn, and SIGKILL while a subsequent model response is held. Only known fixture-owned PIDs are signalled. Crash cases confirm the PID file survives without an exit hook, `status` reports stopped, original `ps` cleanup removes the stale record, and explicit start creates a new daemon. A new ACP connection loads the saved session and continues with the completed conversation intact.

For the active-model case, the unanswered user input survives too, the withheld assistant answer is absent, and the request count shows no extra model retry before explicit continuation. The old ACP request must fail after connection loss. The first active-crash probe failed because the fixture treated DELETE cleanup against the dead server as successful; the raw ACP client's existing disconnect error is now asserted. No runtime behavior was changed or network error hidden. This does not establish automatic process resurrection, recovery after partial streamed output, or tool-side-effect replay safety.

REA evidence `ev_ebe37df8a36f80a218fd530a232c4a179c8c0cadcde9e12f936f7af3243c6e13` covers original registry and daemon service declarations: two files, 1,699 AST nodes and zero parse failures. Initial completed-turn crash tests and the corrected active-crash probe passed (`work/native-daemon-crash-test.log`, `work/native-daemon-active-crash-recovery.log`); the initial cleanup-assumption failure remains in `work/native-daemon-active-crash.log`. Final targeted validation passed all three daemon cases, with zero failures or skips, in about 44 seconds (`work/native-daemon-crash-final.log`). JavaScript syntax and whitespace checks passed. The prior full 51-host run and unchanged runtime build/core baseline are not claimed as rerun in this step.

## Original manual daemon lifecycle and ACP recovery (2026-10-24)

The default CLI now has a native daemon regression for stopped status, start, idempotent repeated start, live PID/HTTP health, restart with a new PID, and stop with an empty active registry. A second version removed environment port pinning and confirmed that explicit `--port` takes effect and survives restart through the original configuration snapshot. ACP performs a real local-model turn before restart and loads the same session afterward; the second model request must retain the first user/assistant messages.

The fixture disables original sleep-inhibition and channel auto-connect integrations and inherits the shared updater/local-fixture opt-outs. Those flags do not change production defaults. It uses a tool-free agent, so manual supervisor lifecycle does not establish daemon-specific tool approval, production login, wake/channel reconnect, automatic updater restart or crash recovery. All PIDs, state and endpoints belong to the temporary fixture. No runtime service implementation was changed.

REA evidence `ev_e58195ed30f696dbcaf83df8acc902a29eb6aeed6dcf05eae7e4768003c81fff` covers the original daemon dispatch strategy, service declaration and constants: three files, 1,195 AST nodes and zero parse failures. Both initial lifecycle and strengthened ACP/CLI-port probes passed in about 13.5 seconds (`work/native-daemon-test.log`, `work/native-daemon-acp-test.log`). Syntax and whitespace checks passed. Final full-host aggregation passed **51/51 tests**, with zero failures, cancellations or skips, in about 122 seconds (`work/native-daemon-hosts.log`). This includes the two background lifecycle cases, daemon/ACP restart recovery and the preceding CLI/Web/SDK/MCP suite. The unchanged runtime build/core checks were not rerun in this test/documentation-only step.

## Default CLI detached background lifecycle (2026-10-24)

A native background fixture now runs the original `--bg` path through the default launcher, rather than the standalone process adapter. The parent-reported child PID and log path belong to the owned fixture; the child reaches a held local model request and appears in `ps --json` with its expected name and `bg` kind. The completion path reads the registered log through `logs`, lets the child finish, requires process exit, verifies the logged answer and resumes the same persisted session through a fresh CLI invocation. The termination path invokes original `kill <pid>` during the held request, observes termination without force-kill fallback and verifies the owned process is gone.

Source inspection confirms that the original background fork adds print and permission-bypass flags, and uses `process.argv[1]` for its entry. Documentation now states these defaults. Fixtures use no tools and do not infer arbitrary tool safety or daemon supervisor/teammate/Electron coverage from process lifecycle success. No runtime factory or launcher behavior changed.

REA evidence `ev_5191435b5c4e226792eefbd4af8459d9527eba2f46f471782b6103dce1f9de1d` covers complete original factories 74428 and 99972, including the process/session CLI group and session-kind constants: two files, 187,794 AST nodes and zero parse failures. Team source verification passed 1,432 schema/behavior comparisons; external-team verification passed 1,021 comparisons. Those deterministic verifiers are distinct from the actual detached-process tests. Both targeted lifecycle cases passed in about 15 seconds (`work/native-background-final.log`), with zero skips. Syntax and whitespace checks passed. The previous full 48-host run remains the full-suite baseline; it was not rerun for this test/documentation-only addition, and the unchanged runtime build/core baseline remains historical evidence.

## SDK host form capability distinguished from MCP elicitation (2026-10-24)

The fixed SDK-hosted MCP implementation creates a client without elicitation capabilities or a form handler. A new native-process case initializes the CLI with `capabilities.elicitation.form: true`, registers the owned MCP tool, and sends an MCP `elicitation/create` request while that tool is pending. The client still advertises no MCP elicitation capability and returns JSON-RPC `-32601`; it emits no SDK `elicitation_create`. The server then completes the original tool response, and both the model follow-up and second user turn succeed. This is evidence for an original unsupported boundary, not a missing service silently replaced by a mock success.

REA evidence `ev_fa3d7c088415dc3752d70823766ae3b1b72d058d54655869572ae7b9f2f0d6e6` covers original MCP Client factory 38112, SDK control factory 86569 and SDK-hosted server declaration: three files, 44,305 AST nodes and zero parse failures. The targeted native case passed in `work/native-mcp-elicitation-test.log`; original MCP/SDK AST and behavior checks from the immediately preceding steps remain applicable to unchanged runtime sources. Final host aggregation passed **48/48 tests**, with zero failures, cancellations or skips, in about 108 seconds (`work/native-mcp-elicitation-hosts.log`). This includes all four MCP fixtures, the three bidirectional SDK permission cases and the previous CLI/Web baseline. The MCP EOF boundary case intentionally stops its owned child after observing post-EOF work; the separate 64-second natural-exit diagnostic remains distinct evidence. Syntax and whitespace checks passed. Runtime code is unchanged; build and core tests were not repeated.

## SDK-hosted MCP through the default CLI (2026-10-24)

New native-process fixtures register an SDK MCP server during stream initialization, complete MCP initialize/list exchanges, expose its tool to the actual model request, execute the tool through JSON-RPC control messages and carry its result into the next model request. Success and MCP `isError` content both reach the model, followed by a second user turn with the same session/history. The tool is explicitly allowlisted; SDK permission approval has separate coverage. The original server returns parsed content, so these checks do not claim preservation of the `isError` flag at every layer.

The initial EOF test failed its 20-second observation deadline after the pending tool call was cancelled and a new `tools/list` appeared on the closed-input connection. A separate diagnostic with unchanged product timeouts completed naturally in about 64 seconds: the new request hit the MCP SDK's original 60-second timeout, emitted cancellation, then the model turn settled and the process exited zero. This is a delayed original shutdown path, not proven permanent deadlock. `work/native-sdk-mcp-eof-probe.log` retains timestamps. The regular boundary case stops after confirming the post-EOF request and deliberately terminates only its owned child; successful/error cases still require natural zero exit. No production timeout, source factory or SDK behavior was changed.

REA evidence `ev_ba0dedae6f650aff56efa16f75e38638c73eeefaafe6d29f7d8c994b70c169b8` covers original SDK clients, transport and server declarations: three files, 13,648 AST nodes and zero parse failures. MCP source verification passed 157 complete method/function ASTs, one captured JSONC factory and 752 comparisons. All three targeted host cases passed in `work/native-sdk-mcp-boundaries.log`; the separate full-duration EOF diagnostic also passed. The preceding 44-host full run, build and type checks remain historical baselines for unchanged runtime code; they were not repeated for this test/documentation addition.

## Original bidirectional CLI SDK input exercised end to end (2026-10-24)

Three new native-launcher fixtures run the actual `-p --input-format stream-json --output-format stream-json` process with a local model and original SDK. Initialization returns the configured model inventory before any model request. A Write invokes stdout `can_use_tool`; the test replies through stdin to approve with modified input or reject. Approved bytes must match the replacement input, and rejected writes must create no file. Both cases then complete a second turn with the same session ID and earlier user/assistant history.

The third case closes stdin while approval is pending. The original EOF handler cancels the pending permission request; no target file is created, the turn settles, and the process exits with code zero without forced termination. These finite checks do not establish concurrent user-line semantics or pending MCP/elicitation cancellation. No original factory, SDK, permission timeout or prompt was changed.

REA evidence `ev_2917d68a9ee0f750a6fdcc8bd11d4c7a3c19560361daf7bf9be684036e650774` covers complete original factories 53343, 19492 and 86569: three files, 27,077 AST nodes and zero parse failures. All three targeted native cases passed in `work/native-stream-input-disconnect.log`. Final validation: **44/44 host tests passed** with zero failures, cancellations or skips in about 100 seconds (`work/native-stream-input-hosts.log`). The SDK control source verifier passed 75 complete method/function ASTs, three constant tables and 794 comparisons (`work/native-stream-input-source-pair.log`). JavaScript syntax and whitespace checks passed. No runtime sources changed this turn; the preceding type check, build and core baseline were not rerun.

## Native Node launcher preserves output before original exit (2026-10-24)

A new real-CLI regression reproduced truncation before the fix with a large UTF-8 model response. The Node launcher now configures non-TTY stdout/stderr handles for synchronous writes when their `setBlocking` capability is available. This is a small, explicit Node host adaptation: original factories, SDK, prompts, output formatting, immediate exit calls and exit codes are retained. No synthetic response or deferred process-exit replacement is introduced. TTY streams and handles without this Node capability are unchanged; slow consumers can apply synchronous pipe backpressure. Cross-platform deployment is not inferred from the macOS test.

The real launcher now passes large UTF-8 text, history-array JSON and stream-json pipe checks. A separate child writes large payloads to both stdout/stderr then exits with status 7; both payloads and exit status are preserved. The seven-process CLI resume/fork test has been switched from file-backed output to direct pipes, removing the prior workaround. The pre-fix failure remains in `work/native-output-before.log`, with post-fix evidence in `work/native-output-after.log` and `work/native-stdio-test.log`.

This implementation follows the original CliExecutor analysis recorded in REA evidence `ev_6eec91291b91471ec5063104ae7a9acb567062767ed584b7469a0dbddfbcfded`; the original code is unchanged. Final validation: **41/41 host tests passed**, with zero failures, cancellations or skips, in about 95 seconds (`work/native-stdio-hosts.log`). This includes original PTY interaction, direct-pipe CLI recovery, native sandbox, ACP and Web. `npm run check` passed, including the new adapter, and all three original product-entry source comparisons passed. The TypeScript runtime/factory sources are unchanged, so the preceding clean build and core baseline were not repeated for this JavaScript host adaptation.

## Native CLI resume, continuation and fork persistence (2026-10-24)

A new default-launcher regression exercises separate CLI processes with one owned working/state directory and local model: initial explicit session ID, explicit resume, most-recent continuation, fork creation, independent original continuation, fork restoration and a final original continuation. It checks model-visible history, not only emitted IDs. Existing Web tests already covered graceful process restart; this adds the CLI option paths, not crash recovery.

The initial fork-restore assertion failed because the sample's original Store restores its logical ID from the first embedded session ID in history and retains the differing filename as `storeId`. The recovered fork therefore reports the original logical ID after cold load while reading and writing the fork file. The fixture now checks that exact source behavior and continues to require independent histories. Session ingress source comparisons passed all 44 cases; Store/Factory/Manager comparisons passed all 48 cases plus two real SDK pairs. No runtime factory was rewritten to normalize this original ID behavior.

The ordinary `--output-format json` probe also exposed invalid pipe output truncated at exactly 8,192 bytes twice. File-backed output parsed successfully as a history array; stream-json provides the system/init session identifier. The original CliExecutor writes without awaiting the stdout callback and later calls `process.exit(0)`. The recovery test uses file-backed stream-json output; pipe truncation remains open and is explicitly documented, not hidden by a passing persistence test. An independent Node child probe confirmed the drain mechanism: a 100,012-byte payload yielded 8,192 bytes with immediate exit, 16,384 bytes with a next-immediate exit and all 100,012 bytes when exit waited for the write callback (`work/native-cli-stdout-drain-probe.json`).

REA evidence `ev_6eec91291b91471ec5063104ae7a9acb567062767ed584b7469a0dbddfbcfded` covers the original session factory group, protocol group and CLI executor declaration: three files, 66,648 AST nodes, zero parse failures. The initial full host run retained the incorrect stable-logical-ID assertion and failed that new test; its log is `work/native-cli-resume-hosts.log`. Final host validation is recorded below. This turn changes tests and documentation only; the preceding clean build remains applicable to unchanged runtime sources.

Final host validation: all **39 tests passed**, with zero failures, cancellations or skips, in about 86 seconds (`work/native-cli-resume-hosts-final.log`). The new CLI case completed seven independent product launches in about 27 seconds. JavaScript syntax and whitespace checks passed. Runtime sources are unchanged; the full core suite and build were not repeated in this turn.

## Sandbox exit fidelity and concurrent native audit attribution (2026-10-24)

The captured-binary fixture now passively records socket frames before the original IPC parser, compares complete native `ProcessExit` payloads with callbacks, and runs four concurrent reads with distinct process IDs and per-file denial/allow assertions. Output and audit attribution are checked for each owned process. Missing audit failures include raw exit data and recent native logs; the audit requirement is unchanged.

A new original/recovery Shell comparison confirms that omitted or empty file records, zero action masks and ignored `process-exec` records do not produce `sandboxDenied`, even with a nonzero exit and permission-denied stderr. This preserves original behavior rather than adding inferred audit data. Ten sequential captured-binary probes passed without reproducing the prior missing-record failure; the extended concurrent fixture also passed. The root cause remains open, and these passes are not presented as a fix.

REA evidence `ev_4e0f4e0383918618470c779f343080ed556ad83aa6abe13a30e112ae34849ff0` covers three original inert declarations, 6,308 AST nodes and zero parse failures. Native executable analysis returned `provider_unavailable`; no native decompilation is claimed. The JavaScript analysis and actual protocol tests remain independently usable evidence.

Fresh build and launcher smoke passed, as did all 37 affected compiled tests, 16 Shell source comparisons plus their real-process pair, and 13 CLI source comparisons plus their real-process pair. Logs use the `sandbox-audit-*` prefix; native concurrent evidence is `work/sandbox-concurrent-wire-audit.log`. The full core and host suites were not repeated for this test/documentation-only change; the preceding 1,988-core and 38-host baselines remain historical evidence. Sandbox documentation now reflects default CLI/Web activation and distinguishes direct binary coverage from product integration.

## Native host fixtures isolated from unrelated startup integrations (2026-10-24)

The ACP timeout investigation traced the original `preparing` stage rather than extending the test deadline. The prior “local model” environment still ran installation discovery (`brew`, npm, yarn, pnpm, Bun and dnf), reached npm registry through Corepack, downloaded official marketplace ZIPs and requested Galileo configuration. `DISABLE_TELEMETRY` and `CODEBUDDY_REMOTE_CONFIG_DISABLED` alone did not isolate these other integrations. One traced run spent about six seconds between session creation and its first model call.

Seven native CLI/Web fixture groups now share `apps/test/native-fixture-env.mjs`: a system-binary PATH and the original updater/Galileo/builtin-marketplace opt-outs, alongside their existing telemetry/config flags. The production launchers, original factories, SDK, prompts, permission behavior and timeout thresholds are unchanged. Updater/marketplace/telemetry behavior remains outside these local model/tool fixtures and retains separate recovery coverage. A traced isolated ACP run made no external requests and reached the first model request about 80 ms after session creation; an uninstrumented skip regression passed in about 3.9 seconds.

REA evidence `ev_c4c3ae30793d81ce4cd6fac4c46b9f254570ba1fa523a7fa8e22cb3d2a445cbe` covers original factories 92763, 14625, 10175 and 48662: four inert files, 115,643 AST nodes, zero parse failures. Work evidence includes `acp-owned-operations.jsonl`, `acp-owned-isolated-operations.jsonl`, `acp-preparation-instrumented.log` and `acp-preparation-isolated.log`; these are diagnostics from owned temporary fixtures, not production account traces.

`npm run test:hosts` now passes **38/38**, with zero failures, cancellations or skips, in about 74 seconds (`work/native-isolated-hosts.log`). The previous non-isolated 38-test run took about 246 seconds and is retained as failed evidence. The captured sandbox audit test passed in this run with its unchanged blocked-path assertion, but the earlier missing-audit-record observation is not explained by this fixture change and remains a known intermittent boundary. Runtime TypeScript sources are unchanged from the prior clean build and 1,988-core baseline; those gates were not rerun for this test-environment-only change.

## Original interactive CLI exercised through a real terminal (2026-10-24)

A new POSIX PTY regression runs the default launcher and recovered Ink/React interface against a local deterministic model server. Its four cases cover rejecting folder trust without a model request; accepting the original folder-only trust option, entering a second prompt, retaining conversation history and rendering both answers; permitting an actual Read; and rejecting that Read then continuing from a new user prompt. Permitted file bytes must reach the next model request, while rejected bytes must not. Keyboard exit must report code zero and no signal; forced termination is only failed-test cleanup.

Exploration corrected two test assumptions without changing product code. Model completion IDs must be unique across turns because the original terminal deduplicates message identity. Read rejection returns control to the user; the fixture now supplies a follow-up prompt instead of requiring an automatic model continuation. Input waits for React effects after the first frame and for the session to settle before exit. Failed-test cleanup escalates only its own PTY child and bounds temporary-directory cleanup retries.

REA evidence `ev_d3436b31f49cac91a6a9b4013d5a0822f2b39bc10e5d1e5367d04ec00dc03169`: six original terminal/trust/confirmation factories, 7,036 AST nodes, zero parse failures. The pinned PTY package and actual SDK are used; no original factory, SDK, configuration or prompt is rewritten. The Windows PTY deployment case remains explicitly outside this POSIX fixture. Additional permission choices, other interactive tools, resize and richer keyboard behavior remain unverified.

The preliminary host run overlapped exploratory terminal probes and recorded a terminal failure plus two ACP test timeouts; `work/native-interactive-hosts.log` retains that result. Later fixture investigations are retained separately. Final standard-host verification is recorded below. This turn changes tests and documentation; the preceding clean build and 1,988-core baseline apply to the unchanged runtime sources.

Final host run: all four new PTY cases passed. Across 38 host tests, 36 passed, one sandbox test failed and one ACP skip test timed out (cancelled); zero tests were skipped. This is **not a green full-host result**. The sandbox peer returned `{exitCode:1, processId:"pipe-1"}` without `fileBlockRecords`; an isolated replay reproduced the missing-record result, while a later replay passed. The assertion now includes the actual result/stdout/stderr for diagnosis and still requires the blocked path's audit record. Two isolated ACP skip reruns passed, but a later diagnostic rerun also timed out. At cancellation the native server and ACP client were initialized, with zero model requests and zero approvals: the stall precedes the first model call, so it is not established as only a transport teardown or full-suite concurrency problem. The abort-before-cleanup diagnostic preserves these counts. No timeout was increased, request retried automatically, or audit requirement relaxed. Current evidence is in `work/native-interactive-hosts-final.log`, `work/native-interactive-sandbox-recheck.log` and `work/native-interactive-acp-recheck-final.log` and `work/native-interactive-acp-diagnostic-check.log`. These intermittent native audit/transport issues remain open.

## Shared dependency routes completed at the product entry (2026-10-24)

Direct product-level module lookup was incomplete even where original factory bodies already existed. A regression first reproduced an undefined source-map barrel (74064), then an undefined DI core (78842). The foundation now exposes the recovered Backend namespace child modules and CLS dependencies through their existing owners. The product entry routes the full source-map support table to its existing cache. Remaining captured DI and Express IDs resolve through their existing loaders after specialized service routes, preserving established precedence.

A static routing-table audit against the fixed sample found 488 remaining candidate IDs after the explicit namespace/CLS/source-map routes were added; all belonged to the DI or Express tables. The current declared route union includes all 4,566 top-level sample factory IDs. This is route coverage only: it does not establish execution of every factory, full behavioral coverage, cross-platform support or complete product parity. Evidence is recorded in `work/shared-route-inventory.json`.

The shared context host supports deferred initialization. Package metadata and CLS implementation selection create no async hooks; loading the original BaseContext creates its namespace, and the owning host releases its hook on close. Deferred configuration failure releases hooks and closes the unusable host. Existing eager embedders retain their default initialization path. Regression tests check these lifecycle boundaries, DI/namespace/source-map export identity, a real generated/consumed source mapping, forwarded-address parsing and duration parsing through product lookup.

REA evidence `ev_52b50f905ce8bbdb2e719a2339ef25b040b38eb94b2cd74a3b1c0938adbc4b9f` covers 13 relevant original factories, 7,166 AST nodes and zero parse failures. No original factory body was changed; these are host routing and ownership changes. HTTP, Backend foundation and source-map source-paired verifiers passed.

The first full core run recorded 1,987 passes and one failure: the original product child completed health/OpenAPI checks, then its ACP initialize fetch failed. An immediate isolated rerun passed both product tests. The original failure omitted the nested fetch cause; the test helper now reports nested error details without retrying requests. Follow-up full-suite verification is recorded below; the initial failure is retained rather than treated as a passed run.

Final validation: fresh build passed; the unchanged full core command passed all **1,988 tests** with zero skips on rerun; all **34 CLI/Web host tests** passed with zero skips; launcher smoke and the updated Backend foundation source-paired check passed. The initial ACP fetch failure remains unexplained, so the passing rerun is not presented as a diagnosed transport fix. The full 131-command source-verifier aggregate was not repeated for these host-only routing changes. Current logs use the `shared-fallback-*` prefix under ignored `work/`.

## Original CLS selector and legacy factories restored (2026-10-24)

The HTTP runtime previously replaced original factory 61987 with a fixed alias to modern CLS factory 63192. It now executes the complete original version selector, with actual Node version metadata and the existing recovered semver adapter supplied by the owned host. The public CLS accessor and original WebContext follow the same selector.

Twelve complete factories have been added, including the selector and legacy CLS/async-hook-jl/stack-chain implementations and package metadata. HTTP fidelity now checks 51 complete factory ASTs, 35 classes/75 members, 37 declarations, two constants and six configuration bindings. All 33 behavior comparisons and two real SDK source-paired scenarios pass. The added selector scenario covers Node 6/7, the Node 8 prerelease/release boundary, Node 22.19 and the current version, including lazy selection and export identity. Legacy implementations remain inert in these boundary tests; obsolete async_wrap hooks were not activated on modern Node, and the supported runtime remains Node 22.19+.

REA evidence `ev_729a907fba57e34f8dc5c6aa7e4a391aba5be2f244249e9b455cfbae2750e161`: 12 inert files, 4,007 AST nodes, zero parse failures. Fresh compilation and 53 affected compiled tests pass, including modern request isolation, Agent HTTP, multipart Node services and the native product HTTP/authenticated ACP model/tool child process. All 34 CLI/Web host tests pass with zero skips, and launcher smoke passes. These targeted checks include the preceding multipart restoration; the historical 131-command aggregate and 1,984-core baseline were not rerun for this change.

## Missing lazy multipart factory restored (2026-10-24)

The factory-inventory audit found a live missing branch: bundled node-fetch factory 88654 lazily requests factory 26952 in multipart `Response.formData()`. A new regression failed before the change with `Explicit Node services parent required: 26952`. The complete original factory is now recovered in Node services; existing FormData/File dependencies are reused and the foundation picks up the new table entry automatically.

Node-services fidelity now covers 373 complete factory ASTs. Source-paired behavior checks include one-byte multipart stream chunks, duplicate UTF-8 fields, binary file bytes/name/type, missing-boundary rejection and URL-encoded forms. REA evidence `ev_4648c3a2c4f0e7b4228131b24edcc8777602c22abc8ce0f584cead42bad7ae10`: one inert file, 1,420 AST nodes, zero parse failures.

Fresh build passed, the expanded source-paired verifier passed, and three compiled regressions passed: Node services, product module navigation/bindings, and the full native HTTP/authenticated ACP model/tool child process. The prior full 131-command/1,984-core/34-host baseline predates this addition; only affected verification scopes were rerun here. Legacy pre-Node-8 async-context branches remain under audit.


## Complete registered source-verifier run (2026-10-24)

`npm run verify:recovery -- <fixed codebuddy.js>` completed with exit code zero. All 131 registered source-verifier commands ran in the expected package-script order, including the original Desktop companion samples resolved from the captured application layout. The run finished with the 2,153-product-factory verifier and three original-entry behavior comparisons. Product-factory coverage includes complete AST comparisons, not just exported names; its finite behavior scenario is a separate, narrower check.

The ignored work evidence consists of `native-aggregate-verification.log` and a command-list/log-hash summary in `native-aggregate-verification-summary.json`. No bundle bootstrap was needed for this aggregate run; verifiers execute selected inert extractions and owned fixtures as documented individually. The separately completed runtime baseline remains 1,984 core tests and 34 host tests, with build/check/config/launcher smoke passing.

The old module-registration inventory was also audited against the fixed top-level factory index. It is not itself a complete source-coverage proof: additional bootstrap/source-map/backend/entry modules are recovered elsewhere, and some optional legacy async-hook/stack-chain factories plus the multipart factory 26952 need a dedicated lookup-path audit. These unverified paths are not counted as completed merely because the registered verification suite passes. README status descriptions were reconciled with the newer sandbox and resource evidence.


## Consolidated native-host validation and Python trash (2026-10-24)

The original Python `sitecustomize` wrapper now has a real native-helper regression alongside Bash and Node. It intercepts `os.unlink`, preserves the owned file contents in macOS Trash, and records the original Python audit event. The Python subtest explicitly skips when `python3` is absent; it ran and passed on this host. No original shim or factory bytes changed.

Fresh validation on macOS arm64 / Node 23.9.0:

- `npm run build`: passed, including staged resource hashes and executable permissions.
- `npm run check`: passed; the launcher approval-policy module is now included in syntax checks.
- `node --test dist/test/*.test.js` from `packages/harness`: 1,984 passed, zero failures or skips.
- `npm run test:hosts`: 34 passed, zero failures or skips. Host concurrency is fixed at two workers to bound simultaneous native processes.
- `npm run verify:config`: passed.
- `npm run smoke:launchers`: passed for native CLI help, explicit workbench CLI help and offline SDK/Web round trip.

These results supersede the earlier core-test baseline and aggregate the recent resource, parser, sandbox, ACP/Web approval, print-mode and Trash changes. The aggregate source verifier discovers 131 commands; a new full aggregate source-verifier run has not yet been completed at this checkpoint. This validation does not establish production login, Electron/daemon lifecycle, network/projection coverage or cross-platform native support.


## Original safe-delete entrypoints and real Trash (2026-10-24)

Build staging now restores execute bits for the original rm/unlink/rmdir entrypoints; extracted source scripts remain byte-identical. A macOS arm64 regression uses the recovered environment builder and staged native helper, verifies the three Bash operations plus Node.js unlink interception against actual Trash objects and original audit records, and cleans only exact paths created by the test. A direct helper probe also verified byte-preserving trash placement.

Original desktop-only activation is preserved. Ordinary CLI/Web is not relabeled as desktop to turn it on. OS-temp paths are permanently deleted by the original shims, so the regression uses an owned ignored repository workspace. The native Trash test and 12 existing safe-delete regressions passed. Fixed-source verification passed seven modules, eight assets, eleven source-paired comparisons and one real-process pair. Python-to-native-helper behavior and complete desktop-host tool integration remain unverified. Existing REA path evidence includes factory 35568 under `ev_7308374313ca6012c9d77f02eec670e33880a7e8ad295e6504edb5d26632896f`; no factory body changed.


## Non-interactive CLI sandbox approval settlement (2026-10-24)

The launcher now uses the existing `CBC_SANDBOX_APPROVAL_TIMEOUT_MS` control, defaulting it to 100 ms only for `-p`/`--print` without `--serve`/`--acp`/streaming JSON input, and only when the user has not set it. Original sandbox approval queue cleanup and denial remain unchanged. Interactive/ACP defaults are preserved. This resolves the previously observed unattended CLI wait without changing recovered factory bodies.

The actual native CLI regression exercises a model-requested Bash read blocked by a real sandbox rule, verifies the file bytes never reach the model, and requires both the tool-result model turn and final answer. It passed. Original denial wording still says “REJECTED BY USER” for timeout; documentation explicitly distinguishes this from a human decision.

REA evidence for original approval factory 6350: `ev_52d562259d487dcea755428bff58cfbb7887a9cf8567b9d1032aff1995af56b1`, one parsed file, 131,489 AST nodes, zero parse failures. The factory's configurable timeout and queue cleanup, rather than a new approval resolver, supply the behavior.


## Native Web sandbox escalation context (2026-10-24)

The Web adapter now forwards the original sandbox interception/bypass/target metadata into an optional approval context. Its approval card explains isolation bypass before the user permits a rerun and displays the affected target using text-only rendering. Original factories, approval option selection and shell execution are unchanged.

Two macOS arm64 HTTP/SSE regressions pass through the actual Web host, native ACP, original Bash services and captured sandbox. They verify the browser-facing context, rejection without file contents, allow-once with contents and original bypass warning, and final streamed responses. These are server-bridge tests, not pixel/layout browser tests. Standalone Web regression coverage remains applicable because ordinary approvals omit the new optional context.


## Default-product Bash sandbox routing via ACP (2026-10-24)

Two real native-process regressions now cover model → original Bash tool → SandboxAgentRunInterceptor/rule synchronization → captured sandbox file denial → original ACP escalation. Reject returns denial text to the model and `PARTIAL_SUCCESS`; one-time approval reruns outside isolation, returns the owned file bytes with the original bypass warning, and yields `SUCCESS`. Both branches passed with temporary app/workspace state.

REA inspected inert factories 66545 and 43522: `ev_366ddb4233ad515888c0cce6ce749b3979a87af7163e35461e6b4767e016a663`, two parsed files, 49,955 AST nodes, zero parse failures. Original factory bodies were unchanged. This extends the prior explicit-parent binary test into the default native service graph.

The exploratory non-interactive CLI denial stalled at the queued sandbox approval until SIGTERM; it is recorded as an unresolved behavior, not a successful smoke test. Browser escalation metadata presentation, network/projection/helper branches and trash integration remain open.


## Real captured sandbox file-isolation regression (2026-10-24)

The original process manager resolves the staged versioned vendor binary directly; platform-package resolution is only a fallback. This corrects the earlier narrower inference from factory 43121. No path override or original-code edit is needed for this lookup.

A new macOS arm64 host test starts the captured binary through the recovered lifecycle, with a temporary app home and real Node IPC/process boundaries. It applies a `no_access` rule to an owned file, observes the real `/bin/cat` process fail with a canonical file-block record and no stdout, clears the rule, and observes the same read return the exact file contents. It verifies native PID registration and shutdown cleanup. The existing deterministic fixtures remain separate from this actual-binary evidence.

Validation: all 15 selected sandbox tests passed, including the new native-binary test, 13 deterministic cases and the owned protocol-peer integration. The fixed-source verifier again passed four classes / 88 members, 13 source-paired comparisons and one real-process pair, without executing the bundle bootstrap. Full default-product Bash routing, network isolation, projection/helper branches and trash integration remain open; this does not establish complete sandbox equivalence.


## Native parser and captured binary resources (2026-10-24)

The original TreeSitterParserStrategy now initializes from build-staged files without changing its factory. The original root-directory selection skips the captured `dist/wasm` directory; byte-identical root aliases satisfy that lookup. A real WASM regression verifies compound commands, quoted arguments and malformed input.

The resource manifest now includes the captured macOS arm64 ripgrep executable/addon, trash helper, sandbox executable/rules, icon and ripgrep notice. Build output restores executable permission bits. A CLI integration uses original Grep against an owned file with builtin ripgrep enabled, in addition to the existing Read permission/HTTP checks. Parser/resource and extended CLI tests passed. Other platforms' binaries are not captured here, and native binary source is not reconstructed.

REA evidence for binary path factories 43121, 73487 and 35568: `ev_7308374313ca6012c9d77f02eec670e33880a7e8ad295e6504edb5d26632896f`, three parsed files, 6,535 AST nodes and zero parse failures. The sandbox executable starts IPC even when passed `--help`; that exploratory process was terminated. Wiring its platform package/rules and verifying actual isolation, plus trash integration, remain open. See [resource verification](native-product-runtime.md#resource-and-compaction-verification).


## Native product resource staging and original compaction (2026-10-24)

The native launcher now resolves its product root to the build-staged original configuration layout. The build copies all five recovered product JSON variants, checksum-verifies original CLI metadata, sandbox configuration and parser WASM, and stages recovered safe-delete shims. No installed application is needed. Original factories and configuration bytes are unchanged.

An ACP regression retains the distributed agents and prompts rather than substituting a test agent: approved Write → reconnect/load → original compact agent with no tools → CLI agent continuation containing the summary and no old tool messages. The ordinary Web missing-command regression now explicitly clears global commands, because the recovered product supplies those commands independently of custom agents.

REA inspected the inert path-resolution and parser factories 44237 and 41936: evidence `ev_137bf5c3a88ab5f0d0a636364ebb885e57d93cafd714bd40156d6133855c9a46`, two parsed JavaScript files, 5,010 AST nodes, zero parse failures. Resource hashes are in `packages/harness/vendor/native-assets/manifest.json`. Validation: build, TypeScript check, original configuration verification, launcher smoke, and all 24 CLI/Web/ACP host tests passed. The prior 1,984 core-test baseline was not rerun for this asset/host change; recovered TypeScript factory bodies are unchanged. Native binary packaging and parser initialization remain open; see [native runtime boundaries](native-product-runtime.md#resource-and-compaction-verification).


## 已固化证据

- WorkBuddy：`5.3.14`
- Product commit：`825709d4641e734288fccb0f3c04114e67f713dd`
- `app.asar` SHA-256：`2206731a15f5f68e741fc82828026a18e667f94683f444a9568f69e12f7653a7`
- `codebuddy.js` SHA-256：`4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd`
- REA evidence：`ev_875f0d4d1e6a43839507573f957186fa7622897997a86c505abf0bc90c554ad4`
- bundle 内 memory policy 常量的规范化导出 SHA-256：`6d2bdeeef7bef8029396250abc25823d6db6784fe486dc6160ac35b7ba5729b0`（独立于 115 个 product prompts，运行时和 `verify:config` 均验证）

## 模块状态

| 顺序 | 模块              | 当前状态                     | 证据/缺口                                                                                                                                                                                                                                                                             |
| ---: | ----------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|    1 | OpenAI Agents SDK | 完成                         | 精确锁定 `@openai/agents* 0.5.2`、`openai 6.25.0`；SDK 不重写                                                                                                                                                                                                                         |
|    2 | Product config    | 100% 字节保留                | default/cloudhosted/internal/ioa/selfhosted/sandbox 六份原始 JSON；SHA 验证                                                                                                                                                                                                           |
|    2 | ProductManager / providers | 原manager、merger及文件/模型provider默认接入 | 首批19类/112处AST/743次比较；文件/模型15类及helper为118处AST/263次比较。插件刷新队列与原SettingsManager/PluginPolicy现默认接入，seed物化/交接已接显式资源根；Cloud四类22成员/8常量/38次比较现已默认接入，认证/REST为显式边界；Addon核心与独立后端已恢复（见后文）；原环境三类和BooleanUtils/6helper共21成员、397次比较现已接入；资源PromptService与九collector/22份模板现已接入，完整UserPromptService/17 sections已提供独立ACP宿主，Addon显式promptAcp已接原meta/首轮核心与ACP→SDK链，完整CLI会话栈/ACP回放及父恢复现已另行恢复，默认父bootstrap/daemon动态编排/登录鉴权仍待补，不等于完整产品bootstrap |
|    2 | PluginManager / loaders / refresh | 完整核心类、市场、安装器和设置/策略主路径默认接入 | 首批14完整类含PluginManager194成员与七loader/事务/reload/style：294处AST/472次比较；市场/锁15类+19helper：129处AST/584次比较；Git/npm/subdir/Options/ErrorCollector5类：45处AST/120次比较。原PluginPolicy与Settings/CLI服务已默认连接，支持磁盘启停/卸载/重启及实时产品策略；资源seed/MCPB与完整产品控制器仍待补 |
|    2 | Settings / PluginPolicy | 6完整类与原常量默认接入 | SettingsManager/Controller/ValidateMiddleWare、CliSettings/SettingSourcesProvider、PluginPolicy，另3个helper共66处完整AST、9个pure factory与94次有限行为比较；JSONC/作用域/缓存/损坏拒写/锁/Hook/CLI队列和策略事件保留。权限/MCP/SDK消费者已补原分scope读写和关闭屏障（另105成员/154组联合复验）；完整路由/环境bootstrap仍未据此宣称恢复 |
|    2 | Builtin seed / plugin controller | 原物化与metadata交接链已接入 | 43个Desktop seed/复制函数、5个资源解析函数/7级候选、完整PluginController23方法及Validator/Error类：78处AST、12初始化表达式、113次有限比较。显式资源根启动接原manager事务/刷新；第三方二进制不分发，完整Electron/daemon/session-addon未据此标为恢复 |
|    2 | Prompt registry   | 原内容保留、资源与用户组合核心已恢复 | 115个product模板、284,899 Unicode code point不变；另22份Desktop模板/风格逐字节校验。资源PromptService/Renderer和九collector完整移植；UserPromptService与17 sections（18类91成员/141函数/58初始化）提供独立ACP宿主，Addon promptAcp已接原meta/首轮核心与SDK转换，完整CLI会话栈/ACP回放现已另行恢复，默认父装配与外部Docs engine仍待补 |
|    2 | Tool registry | 47个不同名称均有handler | 原48条声明含一条重复Agent。新增WeChatReply/WeComReply与bridge，默认CLI声明不变；WeCom连接沿原逻辑补入已构造Agent内存tools。47/47只是名称覆盖，已有工具的客户端/宿主分支、动态缓存/插件等仍待补；不是整体100% |
|    2 | AgentManager | 完整原类移植，68个非constructor方法结构对照 | eager构建/ready与models屏障、pending/force重建/指纹、CLI/handoff/asTool、模型继承/related/env、插件replace/volatile expert/settings优先级、MCP首轮等待/原生defer/权限门槛已恢复；74个原YAML模块factory逐字保留。独立host明确适配DI/Deferred/Emitter，不等于完整ProductManager/插件loader/工具索引热刷新服务 |
|    7 | MemoryManager / 条件规则 | 八类完整服务和依赖链已接入 | Manager/Loader/Parser/Cache/Validator/GlobMatcher/Subdirectory/ConditionalRules，原LRU、Path/Import/Glob/Markdown/context helper、tool注入/run interceptor；67个完整方法AST与282次比较。user/project/local发现、import/缓存/Hook、常驻提醒、Read/Write/Edit条件匹配接真实SDK；相关性/entrypoint/freshness及原提取RunState现已接入；watchers/UI与通用Hook命令执行器仍未完成 |
|    3 | SessionManager | 完整原CLI类与公开父宿主已提供 | 完整原Manager38成员、Store28、Draft21及本地helper/factory均已恢复并做全文AST/差分；公开会话/HTTP宿主已接原ACP父链Read/Write/Ask/Plan、磁盘load/resume/continue/fork及真实SDK，拥有Subject/RX/调度/写盘收尾。兼容CLI/Web默认仍使用既有独立宿主，完整默认native父装配、桌面视图和Telemetry transport未完成 |
|    3 | Input/image pipeline | 原处理器方法和宿主主路径已接 | Default10/Parent9/Function8/Result7/Usage6/Exit4按原provider正priority/降序；37套renderer、ImageFilter850默认接入，Rehydration1050现默认接入原blob服务；Compression1075现默认接原ImageUtils/Jimp，803次原codec图/Read方法差分+11项专项。另535次原三blob服务/四SessionStore方法差分+13项专项，不再以假blob依赖充当默认存储 |
|    3 | SessionStore | 完整原CLI类及真实磁盘恢复已验证 | 完整28成员保留JSONL/meta、逆向64KB reader/边界/损坏行/storeId/legacy修复/跨项目查找/图片和工具结果外置；冷图真实读盘恢复历史和meta，fork续跑不改源JSONL/meta。原项目路径服务、全部媒体/跨工作目录父场景仍待补；不把CLI permissionMode Subject说成已持久化 |
|    3 | Run state machine | 原始迁移表与事件投影差分通过 | 原生 13 状态/20 事件的完整表、非法迁移忽略、legacy agentState/phase metadata、日志、busy/idle/queue-busy、force idle 与 runStateSubject 去重已恢复；`getChange$(session,true)` 原语义是跳过当前值并发出 void，不是 emitCurrent。有限事件矩阵已与原类逐项比较；完整产品 UI projection service/宿主接线仍待补 |
|    3 | AgentFactory / lifecycle | 原生 Agent 事件接线差分通过 | Agent start/end/tool/handoff、activeRunContext 与旧回合结束过滤、9 个 bypass 名称与仅 pre-message summary purpose gate、工具参数原正则递归重写、MCP AsyncLocalStorage call context 已恢复；真实 SDK 保持 0.5.2，不改 SDK 内部。独立 bootstrap 注入 factory，手动构造 AgentManager 时需显式传入 |
|    4 | AgentService | 完整原类/本地interceptors与公开父装配已提供 | 原run/runDefault/one-time/override/fork/插件刷新/发布/取消链保持完整；原SDK与ACP父链已改用公开宿主，拥有自有调度并被动等待本次SDK完成。不把选定5/15个interceptor集成当成完整产品全部服务图；默认认证/配置/CLI父启动仍待接线 |
|    5 | RunnerFactory | 完整原Factory/Provider/loop与公开父装配已提供 | 原缓存、loop/停止Prompt/marker、自动compact/30s cooldown、JSON/jsonrepair/精确重试Prompt均保留；公开执行宿主默认创建原类，真实SDK/ACP已改接，不复制SDK。CLI/Web既有独立Runner宿主仍兼容，完整默认原生父图未完成 |
|    5 | ModelConfig interceptor | 本批主逻辑差分通过 | priority=900、request > CLI > default、未知 ID 继承基础配置、1.0 默认 temperature、100k output cap、递归 handoff、session/global thinking、MAX_THINKING_TOKENS、default effort/max→xhigh、summary/verbosity/fallback 已恢复；972 组样本类对照通过，独立 env cap 单测通过；日志/遥测侧效应未移植 |
|    5 | ModelProvider     | transport 主路径高覆盖       | endpoint 优先级、`/chat/completions` 归一化、凭证/cache/SDK model、会话与内部 header、providerData/extra_vars、自定义模型兼容、reasoning summary、连接级单次 retry、首 token/idle timeout、finish grace、SSE tool-call ID 去重均已接入；Axios/OTel/遥测侧效应待补 |
|    5 | Core file tools   | 主路径高覆盖                 | 三个原始 Zod schema、1-based paging、2000 行/字符限制、256KB/100MB 限制、binary/Notebook/image、行号格式、读后写和外部修改保护、CRLF/BOM、唯一/全量替换已实现；原ImageUtils完整类/Jimp0.22.12与Read图片方法、模型/二进制门槛、blob去重已恢复；非UTF编码全集、其他文本Read原方法/错误码复核及遥测待补                                                                            |
|    5 | Core search tools | 主路径高覆盖                 | 原始 Glob/Grep schema、60s Glob timeout、ripgrep、node_modules/.git 排除、mtime 排序、分页、三种 Grep 输出、上下文/类型/multiline 参数、50,000 字符截断已实现                                                                                                                         |
|    5 | Core shell tools  | 核心控制流已实现             | 原始 Bash/PowerShell schema、120s/600s timeout、30k/150k 限制、上下文 env、前台 envelope、6 位 task ID、显式后台、timeout 转后台、后台输出/kill 已实现；sandbox orchestrator、ConPTY、safe-delete、安全分类和 UI streaming 待补                                                   |
|    6 | Permission flow | 完整原控制器/权限服务及SDK控制客户端 | 原InterruptionService、always/background审批、权限/缓存/模式策略已移植；SDK JSONL权限/Hook/MCP消息/elicitation客户端与dispatcher已接真实SDK。显式sdkControl或nativeMcp默认启用nativePermissions/nativeApprovals及原生MCP projection/server/proxy；SDK启动/鉴权/产品初始化依赖、policy到独立guard统一、Auto backend/专用Settings消费者接线仍待补，普通CLI/Web默认不变 |
|    6 | AgentTask         | 完成/失败仲裁与主生命周期差分通过 | setup/execute/cleanup、new/resume/fork、model/permission/hooks/skills/转发/usage 主路径保留；agent_end/idle、stream final-step guard、retryInProgress/compaction、200ms/120s 压缩轮询/重挂、精确取消、原错误 rethrow、Hook best-effort、RESULT delimiter、nullish resume meta 与 teammate failure 已恢复。executePhaseWithRetry 无内部重试循环；普通会话重试现由 InterruptionService 负责，45s throttle/watchdog 已确认属于 Workflow 并在对应链路恢复；独立 result reset/落盘 barrier 为 host adapter |
|    6 | Agent tool | 同步/Worktree/进程内与显式进程外 Team 接入真实 SDK | 原 schema、env max turns、model variant、fork boilerplate/child 检测、disabled fork、父 toolCall id、同步/中断/错误码 19920..19923/subAgent meta 已恢复。真实 SDK 验证 Explore→Read→独立 transcript→resume、子审批、Worktree、Team，以及子任务网络重试不误判失败。spawn chain/重名/颜色/rollback/失败后 chain 拒绝保持原行为；默认保持原 in-process，显式 standalone override 接 detached-process；全部权限宿主分支仍待补 |
|    6 | AgentTaskManager | 核心调度与 Team 策略接入 | register/get/alias/status/session/wait/cancel/events、5 分钟 TTL/60s cleanup、20 个已完成 Team session 上限、4s 通知延迟/30s dedup/末成员强制通知/10s auto-team cleanup 已恢复；现接 TeamManager/registry/mailbox/cleanup adapter，长时间调度/全部失败竞态未穷举 |
|    6 | Task storage/CRUD | 文件协议与 handler 已接入 | 原始 subject/description/activeForm/status/blocks/blockedBy/owner/metadata、scope 优先级、TaskCreate 调用序号 ID、数字递增、原子 tmp/rename、metadata null 删除、todo 全完成隐藏、hook payload、mkdir+lock.json/进程存活/过期清理均已恢复；完整 Hook 执行器待补 |
|    6 | TaskOutput/Stop | agent/shell/Workflow 已接入 | 原 agent/shell 输出/等待/取消与旧 KillShell schema/文案保留；通用 BackgroundTaskRegistry 的 add/get/kill/session kill/5 分钟 TTL、60s unref cleanup、Workflow 输出/停止与 backgroundTaskSubject 已接入。Workflow 最终输出/完成通知/SDK 续跑验证通过；完整产品 background UI、所有 shell completion 自动通知与资源路径编码仍待补 |
|    6 | Team runtime      | 进程内/外主路径及 SDK 验证通过 | TeamManager/Registry、in-process backend、成员 spawn/respawn/状态/mailbox/forceKill/destroy、leader polling、ShutdownCoordinator、roster Prompt 与 Worktree cleanup、failure registry 已恢复。新增 DaemonProcessManager、detached/tmux backend/registry、HTTP mailbox/PermissionBridge/REST controllers、TeammateRunner 与 SSE bridge；原类 1,021 次差分通过。真实 fork 验证 leader 审批/Read/后续消息/历史/退出及活动流和失败 PID 清理；tmux 只用假命令验证，完整 rich-queue 前端/所有 Plan 状态/产品 Gateway/ACP/真实 tmux 宿主未完成 |
|    6 | Interruption 错误恢复 | 原错误分支差分与 SDK 验证通过 | ECONNRESET/ECONNABORTED/ETIMEDOUT 与最近 3 条活动历史 marker、首 token timeout 2 次/其他 stream timeout 1 次及 2s×次数 delay、成功后清零；SyntaxError/ModelBehaviorError 最近 4 条/2 marker 上限、deferred/未知工具纠正与终止 Prompt、silentAbort/未完成 call 回注/状态与 child 路由已恢复。独立 SessionManager 不抢先 RUN_FAILED，宿主等待恢复发布后再决定抛错；完整主 UI Stop Hook/profiler/telemetry/权限 callback 分支未完成 |
|    6 | Team tools        | 原 schema/文案/身份路由与 SDK 通过 | TeamCreate/Delete 非 deferred、SendMessage 默认直接暴露、原 allowlist/env gate、meta/active delete barrier、身份拒绝冒充 leader、main alias/未知收件人 inbox/broadcast、shutdown 默认 approve/协调器/kill、Plan response 与 renderer 已恢复；外部进程 mailbox/审批/关闭协议已接独立宿主；完整原生前端视图与 Plan 状态仍待补 |
|    6 | Session hooks     | 子 Agent 关键事件已实现      | scoped registry、admin trust gate、`SubagentStart`/`SubagentStop`/`TeammateIdle`/`Notification` 的真实 payload 与 blocking feedback 已实现；其余 HookEvent、命令执行器和 transcript 文件生命周期待补                                                                                       |
|    7 | Compaction        | 工程压缩与策略主路径已实现   | 原始 XML engineering compact 通过 105 组安装包类差分；PreMessage/MaxToken/Blocking 策略、15% 工程摘要充分性阈值、24k summary maxTokens、末批工具输出截断重试、5 轮 fallback、连续 5 次上限、pending interruption gate、静默中止/恢复、摘要 Prompt、历史逻辑边界、继续消息和环境 override 已恢复；Blocking 的 ACP 60s result 观察、compact-agent microcompact、全部 hook/telemetry 侧效应仍待补 |
|    7 | Memory extraction | 提取主路径与磁盘扫描已实现   | enabled/disabled 环境优先级、settings、消息游标、已有 memory write 检测、异步提取、隔离 RunContext/5 工具/5 turns、bypass 后恢复、无 transcript 污染、完整提取 Prompt 与独立 policy hash、4096-byte frontmatter 扫描/200 文件上限、manifest、MemoryLoadContext 已恢复；MemoryManager规则发现/导入/cache及条件注入现已恢复；MemoryRelevance/entrypoint/context/read freshness和原提取类现已恢复；产品REST/UI/watchers仍待补 |
|    7 | Deferred tools    | 主路径高覆盖                 | MiniSearch `7.2.0` 索引、name boost=2/prefix/OR、精确 lookup、fuzzy fallback、3/20/30,000 限制、agent/session allowlist、Defer/NoDefer、AJV `8.17.1` allErrors/coerceTypes、builtin/MCP 分流、图片与 sideband meta 转换均已实现；本批补 wrapper deny/allow、目标强制审批、mandatory flag/target adapter、MCP 权限名转发并通过目标类差分。独立宿主只接 intrinsic approval+host guard，完整 classifier/mandatory target 服务、ACP progress/UI broadcast 与透明代理静态配置解析待补 |
|    7 | Plan mode | 完整原存储/命名与 native 父审批接通 | Enter/Exit schema、mode 保存/恢复、子 Agent 禁用、teammate 请求、拒绝 Prompt/skipRun、PlanStrategy 已恢复；完整 PlanStorage 6 方法及原 PlanModeUtils 已替换公开重写。原ACP父链默认deferred Enter→计划Write→Exit批准/拒绝/扩展退出及精确usage成对验证通过。完整 Team lead approval response/宿主策略全集仍待接 |
|    7 | AskUserQuestion | 完整原 AskService 与 native ACP 问答接通 | 原 advertised schema/友好校验、legacy normalization、19201..19204/90003/90004、capability、自由文本/跳过已恢复；完整原服务14成员/early answer/per-call waiter/timeout/abort/span替换公开重写。原ACP扩展映射问题与数组答案、skip、cancel接真实SDK并成对验证；原桌面UI/实际遥测exporter/所有失败竞态仍待补，standalone覆盖模型预填答案不冒充native父链证明 |
|    7 | Skill / SlashCommand | 核心 handler 与 SDK 验证通过 | Skill 精确/短名/显示名/歧义、legacy 参数、session 替换、命令 fallback、fork AgentTask/model/hook 信任门、原始结果和插件遥测 adapter 已恢复；SlashCommand 原始 schema/审批委派/本地与自定义分流已恢复。原配置 19 个 Agent 均不暴露 SlashCommand，独立入口保留此边界；legacy handler 通过显式 SDK Agent 验证 |
|    7 | SkillManage | 原始指引/文件读取协议已恢复 | 原 feature gate（当前 false）、list/create/modify/delete、30 条详情/30k 字符、registry 结构/失败回退、registry 或 agent_created 双来源判定、短名歧义/目录 100 条/模板与原始 workflow 文案已恢复。handler 不直接创建、写入或删除；真实 SDK 在显式内存 feature overlay 下通过默认 deferred 调用验证 |
|    7 | NotebookEdit | 文件状态机与差分通过 | 原 schema、参数错误、隐式 insert/replace、绝对 .ipynb、50MiB 上限、JSON/nbformat/cells 校验、cell ID 精确/索引/partial、source 换行、创建/替换/插入/删除、execution/output 字段细节、refresh read state 已恢复；当前 Agent 均不暴露该 legacy handler，SDK 显式注册验证。原生文件遥测/代码比例报告与 sandbox 文件权限父类宿主仍为 adapter |
|    7 | StructuredOutput | 动态 schema 与完成反馈已接入 | AJV allErrors、会话 schema string/object/identity cache/fallback、输出捕获/context factory、SessionStart format gate/JSON 检查、Stop priority200/最多 3 条 meta 强制反馈/第 4 次 Stop 完成、dispose/completionDeferred 已恢复；真实 SDK 验证校验失败后重试和跨会话 schema 隔离。嵌入入口已接通，完整 JSON/stream-json 视图和通用 Hook/AgentCompletionWaiter 框架尚未恢复 |
|    7 | Cron tools / scheduler | 主路径及真实 SDK 队列验证通过 | 原 schema/参数/文案、session-only 模型任务、50 cap、本地时间五段解析/DOM-DOW OR/数字前缀、确定性 jitter、3 天过期最后触发、storage/owner lock/文件 watch/missed 通知、500ms tick/5s owner retry、enabled/env gate 已恢复。保留 durable-delete 数量等原行为；19 个原 Agent 均不暴露 Cron，不扩大 allowlist；原生遥测和 stop/async init 全竞态仍未穷举 |
|    7 | Message queue | core manager/interceptor 与宿主 drain 接通 | queueSubject、编辑/held/图片回填、合并/teammate 隔离、priority1800 的 legacy/deferred/busy 分流、QueueDispatchUtils feature/env gate 已恢复。独立宿主 idle drain 接真实 SDK、JSONL 和输出回调，保留原 deferred=true；RichMessageQueueManager/完整 request processors/UI 仍未恢复，独立 drain 不是原桌面前端 |
|    7 | Worktree | 核心 service/session/工具与 SDK 隔离验证通过 | schema/aliases/审批/文案、name/PR parser、base branch/remote fallback、Git create/reuse/list/remove、初始化设置/软链接/include、allSettled 变更检测、CWD ALS/observable、session Hook/退出与逐字提示已恢复。原 19 Agent 均不暴露 Enter/Leave；独立 CWD adapter 不改变 embedding process.cwd，关闭时 dirty/hook 默认 keep。Workflow spawner lease 已验证 SDK 隔离 Read/保留父修改/清理干净 checkout；原生 Hook executor、tmux UI、产品 startup/exit、Bun.Glob 全平台与完整 Workflow 主入口仍待补 |
|    7 | Skill provider / descriptions | Workspace provider 主路径差分通过 | project/user/connector/session-dir/bundled、深度 5/并发 32/symlink、metadata 四类优先顺序、visibility/颜色/品牌与变量、clone cache/force、描述 8k 预算/150 cap/200 总数仅削减 user/protected/collision/agent.skills 已恢复，description vars 与 frontmatter preload 已接入；插件 loader/seed 物化、描述缓存/热刷新生命周期仍待补 |
|    7 | Command / reference runtime | 核心协议、改写拦截与 Workflow 命令接入 | 57 normal+4 conditional 元数据、model-invocation allowlist、条件 feature/env、作用域覆盖、parse/register/local execute、CommandMessageUtils 全套 XML/history、参数/inline Bash/@引用已恢复；新增 AgentSwitch priority1600、AgentManager.getCommands、agent/model/allowedTools/custom/MCP/skill 改写与 Workflow 两个本地 executor。CLI 分派与 host DI 明确为适配；其余 executor/UI、MCP prompt renderer、插件物化及 Shell sandbox/PTY 待补 |
|    7 | PromptContext/interceptors | 核心注入已接入 | 顺序 initializer/in-flight coalescing、系统/Git/语言/模型/会话/feature、prompt-vars primitive 校验/快照/防覆盖、Env(priority2000)、SkipRun(1700)、SystemReminder(1200)、UserQueryWrapper(1025) 已接入；规则来源 adapter、IDE 2000 字符截断、Hook context consume、channel/MCP symbol 注入与 user-query 合并已恢复。MemoryPrompt initializer和真实规则来源/条件priority1740已接入；插件/扩展initializer、Windows shell factory及遥测日志副作用仍待补 |
|    7 | MCP               | 原projection/config/connection及proxy/transport完整类已接入 | 上批底层157处AST/752次比较与30项专项之后，新增顶层McpManager等14类、146处完整AST/279次比较与25项专项；scope优先级/项目批准/revision队列/generation隔离/索引提交/热刷新/settle及原JSONC配置写入已接真实SDK。产品插件自动编排、完整CLI命令/UI、OAuth/Hook服务端/产品channel security仍待补 |
|    8 | Workflow          | 主链、控制层与命令/事件桥差分通过 | Execution/Factory、Acorn8.16.0 Parser、Compiler/prelude、root/nested VM、durability/hash/budget/journal/record/registry、Spawner/AgentTask/schema/watchdog/Worktree 已恢复；主链1,412次。第37个 handler WorkflowTool、Manager/PauseGate/快照/saveAs/recent/provider/后台通知恢复，控制层536次。新增 `/workflows`、`/save-workflow`、保存命令注入/专用指令分支、AcpBridge/PrintModeHandler及显式宿主接线，1,488次差分；保留空 prompt 与完整ID限制。真实SDK、CLI、本地JSONL/跨OS进程cache验证通过；产品React UI/完整ACP生命周期/完整stream-json视图、内置脚本资源及全状态崩溃恢复待补 |
|    8 | Record/replay     | 原模型/Store协议替换兼容骨架，启动与离线CLI已接通 | 原RecordingStoreImpl同步JSONL/metadata/覆盖/队列推断/peek/consume/fallback/count/close、RecordingModel请求先写/stream offsets、ReplayModel错误类/仅model strict/倍率、Provider模式/env均恢复；2,282次差分。13项专项含真实SDK录制/重放、新进程CLI与工具权限守卫；不承诺全产品bootstrap/磁盘故障/全并发状态空间，重放不等于dry run |
|    8 | WebFetch / WebSearch | 原handler、协议/本地/SDK主链已接入 | 第38/39个handler：schema/错误/freshness/域名筛选、API请求头/IOA/超时/结果投影、WebFetch API优先竞跑/本地HTML/Turndown7.2.1/100k截断/15k分析/15分钟URL缓存/contentAnalyzer/逐字回退Prompt/网络策略/遥测映射；托管Security Center转换及V3/V2/file网络来源已接。544次差分+15项专项，真实SDK和CLI仅本地受控HTTP验证；产品服务认证/远端检索、完整Sandbox/UI/所有平台故障仍未恢复 |
|    8 | DelegateTool | handler/Manager/变更消息/描述刷新已接入 | 第40个handler，Zod3 schema及原包转换器JSON、全局connection/空session/timeout透传、注册覆盖/索引/清理/回调、ACP added/removed、嵌套结果/错误与描述变量/cache失效/已构造Agent刷新均恢复；282次差分与15项专项，真实SDK回合通过内存客户端验证。完整ACP transport/认证/产品AgentManager生命周期及CLI连接参数仍未恢复 |
|    9 | Standalone bootstrap/CLI | 已编译与本地端到端验证 | createHarness注册47个不同handler，接入AgentTask/TaskManager/TaskStorage/Skill/commands/StructuredOutput/Cron/队列/Worktree/CWD、进程内/显式detached-process Team、SDK runner/transport/JSONL、压缩/memory/interruption；媒体端点/token含CLI/child纯数据传递；Delegate/LSP/ComputerUse显式DI，不自动连接IDE或新增桌面allowlist；结果解包/多模态请求和显式原生渠道client/factory及owned I/O关闭接通，默认不connect/不扫描安装账号。Workflow后台通知/TaskOutput/Stop与关闭barrier已接；CLI有--web-endpoint/独立web token、--team-backend及--serve --teammate-mode入口。默认按原env gate/in-process，close先停止本次SDK/PID再清理Team。子进程预热/trace/审批/minimal loopback Gateway明确为host adapter；完整产品CLI/JSON view/Gateway/ACP/classifier/MCP权限/渠道自动连接/配置UI/安全服务与其余宿主分支待补 |
|    8 | ComputerUse / multimodal | 原handler、命令协议与结果/请求主链已接入 | 第45个handler，14动作/Zod3/完整说明、macOS命令/共享缩放/cliclick缓存/错误文案保留；priority7工具结果/MCP转换、请求清理/图片数组/MIME恢复。1,028次固定SHA差分+18项专项，真实SDK到本地HTTP的截图回注闭环使用全假桌面I/O；真实OS授权/视觉质量、Telemetry/UI仍未验证或恢复 |
|    8 | WeChat/WeCom channels | 工具/bridge及原client协议接入 | bridge/manager/审批1,810次差分+29项专项；新增client/API/auth/media/store/factory/registry/watchdog，1,016次差分+29项专项。显式native opt-in/手动connect，真实loopback HTTP/WS/SDK闭环。真实服务/TLS、自动连接middleware/UI、完整ChannelSecurityManager未验证或未恢复；原依赖风险另列 |

## 不能宣称 100% 的部分

通用Hook最新进度：六个完整原类（Manager/Executor/Prompt/Scoped/Session/Tool）和原工具执行wrapper已移植，默认createHarness现接会话/工具/子Agent/Task/compact/Worktree/InstructionsLoaded，shell发现/匹配谓词/watchPaths已补。表内早期“执行器待补”不再指这些核心类缺失；完整ToolPermissionService/SDK审批前缓存、MCP elicitation/输出替换、service proxy及产品Startup/插件服务仍有缺口。旧session facade保留兼容但不是默认路径，不能把它和native实现混同。

两套回复handler/完整bridge/manager/审批和原client/API/auth/media/store/factory/registry均已接入，47个名称都有handler；仍不等于完整harness达到100%。仅受控本地HTTP/WS和自有凭证验证，真实服务认证/TLS/全部平台兼容未证明；完整ChannelSecurityManager/MCP通知校验、RemoteControl自动连接middleware/配置UI/代理与telemetry、AgentManager核心现已恢复，但完整ProductManager/PluginRuntimeRefreshService仍有缺口。guard allow_always只放行本次，不代表原持久审批规则已补齐。

媒体新增第42–44个handler ImageGen/ImageEdit/VideoGen、完整ImageService/VideoService方法与ImageToolHookInputProcessor。370次原类/包内schema转换器差分+19项专项，真实SDK默认deferred图片/视频及显式legacy编辑、独立CLI协议/权限/落盘验证通过；原ImageEdit不暴露、feature/model-tag、schema/Prompt和Agent allowlist不变。默认REST为显式fetch适配，不等同原RestOperations/Axios全拦截器、认证刷新/产品进度UI；Hook输入类未伪装成已接完整Hook/图片rehydration/blob管线。

LSP作为第41个handler已恢复：工具九种operation/schema/原格式，完整Client的stdio/握手/反向消息/文档打开/归一化/关闭，Manager注册/懒启动/coalescing/重试/状态/插件reload/warmup/drain，711次差分+16项专项。原19个Agent均不声明LSP，不扩大默认allowlist；插件来源与工作目录显式DI。仅本工程fixture语言进程和显式SDK注册验证，完整产品插件loader/startup/reload宿主、真实第三方服务兼容、真实Windows进程和全部竞态仍未完成。

- 48条工具声明含重复Agent，实际47个不同名称均已注册handler。名称覆盖不是整体harness或各handler全宿主分支100%；渠道真实服务/完整安全校验、插件、权限分类、完整CLI/UI等仍有下述缺口。
- 渠道沿原保留全局最后上下文/FIFO审批/不绑定答复chat、WeCom未知路由可复用旧chatid、客户端/实例fallback、重复connected计数、@mention只取末词、2abc选项解析、dataURL按basename误判、仅local>20MiB检查、远端body无大小限制/完整截止时间。注册settings/allowed-list不是全部入站/工具发送授权；只允许可信客户端和消息源。关闭时订阅/timer/迟到发送守卫与入站SDK流abort/barrier是独立host ownership适配，不是原类新增的方法。
- ComputerUse是普通function tool，不是SDK内置computer tool，原19个Agent不暴露；Darwin+精确env gate之外仍要宿主审批。其低层execute不检查gate/abort，wait不可取消，cliclick负缓存/并发null、跨调用缩放、同毫秒截图覆盖均保留。独立host的stateDir/每harness工厂是明确适配，未操作真实桌面/授权/依赖安装。原工具结果及模型请求处理器已恢复，仍不等于全部输入处理链、mandatory分类器或UI/遥测；自定义ModelProvider需自行处理请求。
- Delegate只有显式内存connection/注册依赖注入，不自动连接IDE或冒充完整ACP。单一全局connection、空session、ID毫秒碰撞、inputSchema仅说明、父取消/断开不取消pending、timeout只透传、旧provider索引与clearTools不通知均保留原行为；默认宿主审批不受客户端requiresApproval=false绕过。当前cache仅覆盖Delegate，不冒充完整ToolSearch fingerprint/插件描述生命周期。
- 媒体保留原边界：输出目录在参数检查前创建、mkdir不在catch内、共享outputDir并发覆盖、秒级同名文件覆盖/部分写入、后缀不代表编码、MIME按扩展名、raw-base64排斥斜杠、dataURL内容不验证、相对输入按process CWD。HTTP输入/下载不走WebFetch策略、视频10分钟门槛不能中断挂起请求、sleep listener残留；配置会导致本地文件上传，只接受可信端点/配置并保留宿主审批。产品media凭证与模型key/web token分开，真实服务认证/生成质量和codec、完整原REST/代理/mandatory权限/所有故障仍待补。
- LSP原边界保留：外层server key决定languageId、覆盖不清旧extension/旧client、maxRestarts=0回退3、运行崩溃保留manager旧status/下次lazy获取才重启；didOpen只发送一次/version1不刷新、LocationLink数组被filter丢弃、hover只取第一项并将MarkupContent按plaintext格式化；500ms+1000ms启动门槛，startupTimeout不覆盖initialize/请求、父abort无JSON-RPC取消、shutdown未清败选timer、cleanup不等进程退出且无PID失败对象保留。独立host关闭清本次identity gate/owned clients以释放请求、防止重启，是单独适配；不提供可信进程隔离，不自动装服务或修改CLI/原Agent声明。
- Web工具保留非安全边界：不解析DNS、IPv6括号/映射缺口、策略配置early allow、请求后才拒跨host重定向、URL-only跨会话缓存、WebSearch父abort不传播、fetch头部timeout不涵盖全部body、API父abort listener未移除；不宣称SSRF防护/安全沙箱。网页服务endpoint/token需显式配置，模型key不复用；主题色/客户端信息/无遥测默认与依赖注入为宿主适配。完整BashSandboxManager及命令/文件策略应用、原产品认证和远端服务内部实现不在本批完成范围。
- Agent 同步委派、子会话恢复、Worktree 隔离、进程内/显式 detached-process Team 与会话错误恢复已验证；SubagentThrottleRetry/停滞 watchdog 属于 Workflow，已在原 spawner 子链恢复，非普通 AgentTask 的通用重试。Team 协议类不代表完整 Gateway/ACP/UI/所有 Plan approval 状态/权限分支；插件/扩展与MemoryController REST/UI/managed来源等仍待补齐，MemoryManager规则发现/条件注入核心已接入。
- Team inbox 采用原 read-modify-write JSON，无原子并发锁；spawn chain 失败后持续拒绝、低层路径/递归删除/Worktree force fallback 均保留原行为，不等于安全沙箱或全并发状态空间保证。独立宿主 leader/member idle 唤醒复用已有队列 drain，不冒充完整 RichMessageQueueManager/request processors/UI；状态机表和非法迁移已经逐项差分，不代表全组件并发状态空间穷举。
- 外部 Team 原行为保留：TeamMember 默认硬编码 in-process，registry 不自动接入；自然退出的进程成员 isActive 不查 PID；初始发送失败仍留 backend PID map；Runner 只等 runDefault 发布，不等 SDK 完成，SIGTERM 只置 shuttingDown；PermissionBridge findLeaderSession 的团队检查被逗号表达式丢弃，watcher 猴子补丁的 timeout/overlap 清理缺陷仍在；HTTP mailbox 成功坏 JSON 返回 undefined，而权限 client fail closed；IPv6 URL.hostname 带方括号被判远程；SSE 非空历史只重放不订阅、callId 不参与 call_id/id 优先级。独立 host 的 PID ledger/SDK abort-settle/审批 relay/路径与请求大小限制单独标注，不改写原类缺陷。最小 loopback Gateway 无完整 ACP/认证/沙箱，x-codebuddy-request 不是身份认证，不可公网转发。
- 独立 cached resume 清除旧 result、完成后等待 SDK/JSONL、额外 teardown 旧 abort listener 属于 host adapter。当前createHarness返回前已完成原AgentManager eager启动，不再需要调用方getDefault预热来规避旧lazy提示初始化自等待；直接构造Manager须注册工具后start，并close显式宿主订阅。完整产品Startup/PluginRuntimeRefreshService仍未恢复。
- Worktree 原生 Hook 命令执行器、tmux UI、产品启动参数/退出选择、Workflow isolation host 尚未恢复；CWD 的 embedding adapter 与原 process.chdir 明确分开。原 remove 的递归删除 fallback、tracked-file probe 失败放行、porcelain trim/slice 偏差等保留源行为，不能等同于安全边界或所有平台验证。
- WorkBuddy 插件系统、完整 HookEvent/命令执行器、React输入历史/条件规则watchers与产品控制器UI，以及 interruption 的 SDK callback 权限客户端/错误恢复仍有未接入分支。InputHistory服务、八类响应interceptor、业务码映射和aborted-draft/gate/idle-start核心现已移植；真实产品配置刷新/热重建、完整UI/telemetry未因此完成。
- ModelProvider 的 OTel span、Galileo/增长遥测、IOA 默认 header 和 Axios interceptor 侧效应尚未移植；请求/流主路径已经接通。
- Workflow 主运行、Manager/暂停/快照/后台工具/通知、跨 OS 进程 journal cache、原列表/保存命令、ACP progress/print JSON 协议已恢复；产品 React UI、完整 ACP 生命周期/输出视图、SDK tracing host、原内置脚本资源、全部故障/跨进程崩溃恢复与宿主策略仍不完整。暂未定位独立的 WorkflowTraceWriter 类，不以 print handler 冒充 trace writer。低层路径由 host 注入，独立根不冒充产品项目编码。
- 保存命令元数据 prompt 是空字符串，原 CommandInterceptors.isCommand 要求非空，AgentManager 默认仅自动附加 custom/MCP commands；专用 Workflow 改写分支不能据此宣称默认可达。原 `/save-workflow` usage 说支持8位ID，实际 manager不解析前缀；两处原行为均保留。ACP仅取当前异步会话、无owner fallback；print JSON在writer try外序列化，BigInt等序列化错误不被writer catch吞掉。CLI本地分派、显式writer/ACP依赖注入为宿主适配，不补隐式策略或全局stdout副作用。
- Workflow 保留样本可见行为：activity 只看最后工具时间，adapter.abort 仅中止 task.abortController，不保证 watchdog 即停止底层 SDK；root abort racer 结束运行不表示子请求结束。部分 hook 取消后永久 pending；reserve 不预留并发 token、无预算 deduct 不记 spent，reserve 失败还在 semaphore try/finally 外；cache 命中不重写 agent_finished；nested phase 不记录且缺 body 会抛原 TypeError；nested timer 与 root timer 不同。独立 harness close 单独取消/等待仍注册 SDK 任务。Prelude/扫描/Node VM 不是安全隔离，host 构造函数按原暴露，只运行受信任脚本；不声称恢复了额外权限策略或安全沙箱。
- ErrorUtils 本批只恢复重试谓词与相关文案，非整个错误/计费/遥测映射模块。原 null 输入可能触发 TypeError 的谓词边界保留；当前无色独立宿主使用纯文本错误展示，升级链接/ANSI 仍属于外部 presentation adapter。
- 已提供可启动的独立 CLI/bootstrap，验证真实 SDK、原 transport、本地 HTTP SSE 工具调用与跨进程 JSONL resume；不等同于完整 WorkBuddy CLI、所有工具/权限分类器或真实产品服务端验证。
- 服务端策略不在本地安装包中，只能做黑盒兼容。

## 下一批恢复顺序

Workflow 控制层保留原生细节：resolveSession 忽略 ID 只取当前异步会话；snapshot 异步竞态/不存在时回退目录、saveAs 覆盖、recent 仅内存；restartAgent 只取消并记 invalidated；finalizeRun 先复制 detail 再 dispose，并 cancelPending 全 emitter。原工具 args 只接受 string，默认 CLI Agent 不声明 Workflow；独立宿主显式绑定当前会话、检查 disable gate、按 parent 分配 runtime，并等待本次快照/finalizer。generic BackgroundTaskRegistry 的产品 bg-tasks 路径 cleanup 由注入决定，独立 host 不猜测/删除未映射目录。原 notifier 提前置 notified/失败不重试、raw task-id、XML/原提示、busy/ACP drain 分流已恢复，不宣称原桌面队列/全部 shell 通知接线完成。

1. 原ToolPermissionService/SDK审批前PreToolUse缓存及PermissionRequest/Denied接线、MCP自动elicitation/输出替换、Hook服务代理/产品Startup与SessionStart自动首消息。六个完整Hook核心类、默认会话/工具/子Agent/Task/compact/Worktree/InstructionsLoaded、shell发现/匹配谓词/watchPaths已恢复，不重复计数；命令原生无统一abort/rewake支持，不能捏造。MemoryContext/Relevance/Extraction/Stop/Freshness和规则发现/注入、InputHistory、aborted-draft/response gate/idle-start及blob/codec核心已接入；完整媒体/UI接线和Telemetry transport仍待补。
2. ProductManager/config provider、完整插件loader/物化/Extension、PluginRuntimeRefreshService与ToolManager索引/缓存失效生命周期；再补RichMessageQueueManager/deferred processors和Worktree产品入口/Hook/tmux。AgentManager完整类/eager/rebuild/ready及插件组合已恢复，47个registry名称已有handler，仍不等于全产品启动与远端策略恢复。
3. Workflow React UI/产品lifecycle/完整stream-json/tracing宿主、内置脚本资源及崩溃恢复（/workflows、/save-workflow、命令改写、ACP/print事件桥、record/replay主路径已恢复，不重复）；完整生命周期/磁盘故障矩阵待回补。
4. Team 完整 Gateway/ACP/前端视图、跨进程 Plan/权限全状态和真实 tmux 宿主接线（detached/HTTP/SSE/ShutdownCoordinator/failure registry 核心已恢复）。
5. 回补 Bash sandbox/PTY/safe-delete 与 ModelProvider OTel/遥测宿主分支。
6. 接通 DeferExecuteTool 完整 classifier/mandatory-target 服务、透明代理配置解析和 MCP progress/UI broadcast 宿主分支（审批转发控制流已恢复并差分）。

每完成一批都必须满足：`npm run verify:config && npm run check && npm test && npm run build`。

本批证据定位（解码后的 bundle JS offset）：ModelConfig 类 `7122560..7126281`；loop detector 类 `7207144..7210301`，marker 定义 module `40038`。`verify:model-config` 972 组与 `verify:loop` 1,411 组差分均通过；这些计数不涵盖完整业务状态空间，不宣称全 harness 100%。

本批新增证据：AgentTaskManager `6938245..6948289`；Agent `11853702..11868971`；TaskOutput `11871294..11877034`；TaskCreate `11878834..11881602`；TaskGet `11882713..11884149`；TaskUpdate `11886284..11888544`；TaskList `11889858..11891561`；KillShell `11907242..11908295`；TaskStop `11909163..11911279`；TaskStorage `12177331..12180570`。`verify:tasks` 在 hash 验证后的 VM 目标类与重建实现之间执行 495 组 schema/CRUD/持久化/结果/fork Prompt 等比较；不覆盖完整 Team/worktree/异常状态空间。

本批新增证据：PlanStorage `12170604..12172463`；PlanStrategy `11577909..11579866`；Enter `11893642..11895876`；Exit `11898187..11903027`；Ask `11500785..11504469`；AskService `7222438..7228156`；Defer `12008364..12018235`；PromptContext `7698068` 起；PromptVars `7755614..7758563`；SystemReminder `7148490..7155494`；UserQueryWrapper `7120151..7120981`；Env `7098273..7098467`；SkipRun `7116734..7117040`。`verify:interaction` 对 hash 固定的样本目标类做 1,438 组 schema/行为比较；所有 Prompt 模板和原始配置继续逐字节保留，不把有限差分称作全分支 100%。

最新证据：Skill `11919499..11926988`；SlashCommand `11914165..11917177`；CustomCommandRenderer `7649414..7650992`；Workspace SkillProductProvider `9921736..9926463`；ReferenceService `9942584..9945696`；CommandManager `7542703` 起；ToolManager 描述预算在 `11657350..11681925` 类内；builtin declarations `7528426` 与 conditional `7537267` 起。`verify:skills` 在固定 hash 原始目标类与重建实现之间通过 536 组比较，涵盖 handler/schema/结果、fork 配置/错误、渲染、元数据、预算、扫描、变量、命令 local history、引用 token 截断。新配置 `config/recovered-builtin-commands.json` 是原始声明的求值数据，不替换或修改 `config/original`；PRODUCT_NAME=CodeBuddy 已核对目标模块常量。

最新证据：SkillManage `11929601..11938484`；NotebookEdit `11844914..11851712`；StructuredOutput `11998971..12000593`；StructuredOutputStopHook `8484193..8485073`；SessionStartHook `8486296` 起；ContextImpl `8962324..8962707`、Factory `8962715..8963017`；feedback template module `54954`。`verify:management-output` 753 组对照涵盖参数/错误、registry/list/template/文案、Notebook 持久化结果、schema/context/Start/Stop Hook；排除 telemetry/sandbox 的原生宿主副作用。

最新证据：Cron helper module `48935`（`7847494` 起）、state `7853292..7854715`、storage `7854929` 起、scheduler `8433274..8436873`、service `8437554..8439536`；CronCreate `12061370..12063241`、Delete `12064081..12064779`、List `12065615..12066616`；MessageQueueManager `11093993..11096012`、QueueDispatchUtils `13351509..13352372`，MessageQueue interceptor 在 `7117655` 前后。`verify:cron` 在固定 hash 的原模块/类与重建实现之间通过 1,442 组比较，涵盖 schema/文案、解析/时间/jitter、内存与 durable 状态、存储/lock、owner retry/missed/最后触发、队列编辑/图片合并与 legacy/deferred interceptor。Timer/owner 测试使用可控 clock/storage，不启动真实产品或外部服务。

最新证据：WorktreeService `13413904..13418608`；SessionManager `13422043..13428097`；Initializer `13430239..13434960`；ChangeDetector `13435488..13436847`；NameGenerator `13437640..13437912`；PRParser `13438636..13439095`；CwdService `13441020..13441541`；ContextInterceptor `13442613..13443444`；Enter `12056034..12057158`；Leave `12058504..12060359`。`verify:worktree` 在 hash 固定原类与重建实现之间通过 1,519 组比较，覆盖 schema/文案/PR/命名/CWD、初始化/变更检测、base branch/Git 命令序列、create/reuse/list/remove fallback、session/Hook payload/退出与逐字 context prompt。Git 网络操作以 stub 差分、真实 Git SDK 链路只在临时仓库测试；不覆盖原生 Hook executor、tmux UI 与 Bun.Glob 全平台语义。

最新证据：TeamManager `8378071..8383696`；TeamCreate `12185238..12187024`；TeamDelete `12043568..12045075`；SendMessage `12045874..12054922`；TeamMember `6995005..7004426`；Registry `7004450..7005055`；InProcess backend `6989786..6991010`；ShutdownCoordinator `6992109..6994648`；leader polling `12182179..12185238`；TeamContext `7180171..7183219`；Worktree cleanup `8388023..8389368`；Agent spawn 在 `11853702..11868971` 类内。`verify:team` 对 hash 固定原类与恢复实现通过 1,432 组比较，涵盖 schema/文案/文件/身份/协议、backend/成员 spawn/respawn/状态、关闭回应/超时、派生重名/回滚/失败 chain、leader 收件/roster Prompt 和 Worktree cleanup。SDK 原配置继续逐字节验证；不覆盖真实 detached-process/HTTP 服务或所有竞态。

最新证据：RunState types module `71389`；完整状态表 `11165469..11173010`，类 `11173014..11178903`，runState property `10995874` 起；AgentFactory `7063971..7065964`；AgentTask `6952421..6977558`，错误 helper `6949040` 起、resume meta `6951242` 起；RunResultUtils `13255534` 起；失败提示函数 `7184359` 起、interceptor `7185305..7186430`；工具参数重写规则 `11892453` 起、MCP context module `80539`。`verify:lifecycle` 对固定 hash 样本做 7,358 次比较，包含 13×21（含无效事件）×3 metadata 矩阵的结果/副作用/日志/派生读数、subject 去重、bypass/旧 RunContext、完成/错误/取消/压缩/retry 分支、原错误 rethrow/严格 silentAbort、恢复 metadata、脱敏/分类/TTL/逐字提示与重写/context。此数量是断言比较次数，非 7,358 个独立场景；真实退避重试、压缩全部竞态和 detached-process 仍不在覆盖承诺内。

新增证据：InterruptionService 原类 `11047102..11089570`（重点为 waitFor 的成功/错误完成路径、marker/计数方法）；ErrorUtils 重试谓词/format `13075544` 起，timeout 类型 `9382292` 前后。`verify:recovery-retry` 对固定 hash 样本通过 2,801 次比较，覆盖 network/timeout/empty stream/syntax/model/wrapped/deferred/auth/cancel、pending call/窗口/child/silentAbort/abort/legacy-deferred dispatch、原顺序/metadata/Prompt/Stop Hook 通知边界及 helper 状态判定；engine TypeError 仅比较类型，不比较含压缩局部变量名的引擎消息。

新增证据：Workflow errors/concurrency `8694784` 起；preamble 常量 `8700757`、builder `8701265` 起；WorktreeIsolation `8858551..8859533`；schema retry `8859575..8860184`、validator `8860325` 起、validation error `8862119` 起；abort bridge `8862343`、watchdog `8862692..8863355`、throttle `8863448..8864297`、sleep `8864298` 起；spawner `8865193..8867173`；AgentTaskExecution `8868809..8870571`、preview helper `8870950` 前后。`verify:workflow-subagents` 通过 1,139 次原类比较，覆盖错误码/常量、abort/watchdog/fake clock、限流门槛与 45s 单次重试、sleep-abort、schema parse/defaults/失败/correction、逐字 preamble、Worktree release、metrics/cleanup/abort forwarding 与 spawner 重试顺序；不覆盖完整 Workflow 主脚本/持久化/沙箱。

本批实测：211 项测试通过；编译 JS 上 `smoke:runtime` 133 项通过，CLI --help 启动通过。新增 23 项：普通会话网络恢复/上限/真实 SDK deferred-tool 纠正/首 token timeout/子任务不误报失败，Workflow throttle/watchdog/abort/schema/Prompt/Worktree/adapter，以及 SDK schema 纠正与真实 Git 隔离 Read。全量测试中发现无 socket 的 mock 流遇到原 unref timeout 会提前退出；仅为该测试增加存活句柄，运行时计时器语义未改。此前各模块测试与差分全部回归；SDK 保持 0.5.2，全部离线或 loopback，不读取宿主凭证，有限测试不等于完整 harness 100%。

最新外部 Team 证据：DetachedProcess backend `8401515..8403168`；tmux `8403979..8407658`；registry `8408738..8409549`；PermissionBridgeClient `8410552..8412136`；Runner `8412968..8417181`；PermissionBridgeService `8418746..8422004`；mailbox/HTTP/factory `8422800` 起；DetachedMemberSseBridge `8282427..8289110`；DaemonProcessManager `8975002..8978316`；REST response helpers `10151569` 起，permission/team controllers `10469300`/`10471700` 前后。`verify:team-external` 对固定 SHA 样本执行 1,021 次参数/env/信号/失败顺序、模拟 tmux、transport 分类/HTTP header/timeout/响应、审批/取消/逗号表达式、SSE 转换与 Runner 格式比较；控制器以实际 loopback HTTP 验证，不把宿主 adapter 或所有异步竞态计入原类差分。

最新实测：224 项全量测试、146 项编译 JS smoke，新增 13 项外部 Team 专项；真实 fork 验证初始任务→leader Read 审批→结果/后续 mailbox→shutdown→历史/父 Team 保留、活动请求中 close 及发送失败 PID 清理。源码 TS fork 的 tsx loader 解析为绝对路径，编译 JS fork 不依赖 tsx；子入口补齐原 Startup 的默认 Agent 预热前提。SDK 仍为 0.5.2，原配置与 115 Prompt 不变。下一主缺口是 Workflow 主执行器/编译器/沙箱及剩余工具，而非重复恢复已验证 Team 子链。

最新 Workflow 主链证据：Semaphore `8697308..8697995`；runtime prelude `8698413..8700101`；Execution `8702580..8713535` 与 preview/format helpers；CallDurability `8714923..8716595`；factory `8717151..8717811`；resolver `8719312..8722229`；parser `8846075..8851731`（样本 Acorn 8.16.0）；compiler `8852562..8856864`；progress `8857538..8858372`；NestedRunner `8871665..8873121`；AbortRacer `8873145..8873565`；AbortAwareTimer `8873671..8874761`；SandboxBuilder `8874789..8875787`；Runner `8876331..8880561`；hasher `8882430..8882702`；budget `8883418..8883883`；FileJournal/factory/snapshot `8884575` 起；RecordWriter `8886966..8887483`；registry/meta-head helpers `8888365` 起。`verify:workflow-core` 对固定 SHA 原类执行 1,412 次比较，涵盖解析/错误位置/offset、原 prelude 字符串、扫描启发式/包装、Agent/cache/phase/事件、parallel/pipeline、budget/hash/journal 投影、root/nested VM、resolver、abort/timer 与 meta helper；不是所有 UI/持久化故障/并发状态空间。

最新实测：241 项测试通过、163 项编译 JS smoke，新增 17 项 Workflow 核心测试；真实 SDK 完成编译脚本→结构化子 Agent→journal 落盘→resume/cache 不重复模型调用，并验证 root abort 和实际 SDK 子任务取消的不同边界。主运行类已替换早期猜测骨架（包括 hook 签名），独立入口为 createWorkflowRuntime；当前 handler 数仍为 36/47。SDK 0.5.2、六份配置与 115 Prompt 保持不变；尚未完成整个 harness。

最新 Workflow 控制层证据：PauseGate `8902629..8903230`；Manager `8903785..8910018`，SAFE_NAME_RE 在其后；StaticBuiltinWorkflowProvider `8892273..8893039`；WorkflowTool `12164717..12168718`；BackgroundTaskNotifier `6983141..6985756`；ToolManager generic background methods `11671594` 起；TruncateBuffer `11320355` 起；disable helper `13411199` 起。固定 SHA 的 `verify:workflow-control` 通过 536 次 schema/原文、pause/abort、Manager start/参数/状态/进度/detail/finalize、通知 XML/meta/去重/drain、tool 立即返回/最终输出/状态/callId、buffer/TTL 比较。快照/saveAs/builtin 文件协议由真实临时目录测试，不把全部宿主 UI/竞态算入差分。

最新实测：255 项全量测试、177 项编译 JS smoke，新增 14 项控制层测试。真实 SDK 通过原 DeferExecuteTool→Workflow 后台执行→子 Agent→最终文件/通知→leader idle 续跑，输出保留原 Agent ID 尾注；真实新 Node 进程从旧 journal 恢复、命中 cache 且不调用模型。TaskOutput/Stop、关闭收尾和直接/deferred 禁用 gate 已验证，handler 数为 37/47；SDK 0.5.2、全部原配置/Prompt 不变。目标仍未全部完成。

最新命令/事件桥证据：CommandInterceptors `7088984..7093909`（AgentSwitch priority1600）；AgentManager.getCommands `7043292` 起；WorkflowsCommandExecutor `7662202..7663498`、formatElapsed 紧随；SaveWorkflowCommandExecutor `7665117..7667019`；WorkflowAcpBridge `8893656..8895753`；WorkflowPrintModeHandler `8897019..8898409`；CommandMessageUtils `13045260..13049605`。`verify:workflow-presentation` 在固定 SHA 原类 VM 中通过1,488次比较：caveat原文字面量、完整XML构造/解析、命令/Skill/channel/agent/model/allowedTools/保存专用指令、列表/参数/原usage/history、ACP与print字段矩阵、订阅/取消/当前会话与连接/错误门槛。数量为断言比较次数，不是独立场景数。

最新实测：269项全量测试、191项编译JS smoke，新增14项命令/事件桥专项。验证本地列表/保存不请求模型、完整ID/空prompt缺陷、保存刷新与跨宿主历史恢复、真实SDK改写、显式executor覆盖、ACP/print/关闭取消订阅、编译CLI `-p /workflows` 和 `-p /save-workflow`。全部旧差分、check/build/help与原配置校验通过。37/47 handler、SDK0.5.2和115个原Prompt保持不变；当前仍不宣称完整harness达到100%。

最新录制/重放证据：RecordingStoreImpl `9009857..9012563`、RecordingModel `9012653..9013585`、serializeRequest紧随、ReplayModel `9013666..9014705`、ReplayExhaustedError `9014731..9014999`、ReplayTypeMismatchError `9015028..9015276`、RecordReplayModelProvider `9015846..9016315`、配置module26314（`9941xxx`）。`verify:record-replay` 固定SHA后通过2,282次比较，包含env真值/互斥、原metadata五键、signal剔除/错误/提前停流/事件顺序、Replay类型/耗尽/模型strict/倍率timer、queue分布/peek/consume/回退/close、Provider日志与路由，并对原类与重建类分别执行真实临时文件I/O、坏文件/初始化错误/metadata回填。数量是断言次数，不是独立业务场景。

本批纠正早期错误兼容逻辑：原strict仅校验modelName，不比较请求；speed是offset差值除倍率，不是每事件固定sleep；RecordingModel构造顺序delegate/modelName/store；原Store不使用turn-object append/next接口。已按原重建完整类和协议，不保留不符合样本的旧接口。SDK0.5.2未改写。Store首次使用覆盖recording.jsonl、仅剔除signal、无敏感信息脱敏；加载接受任意metadata.replayEnv键回填空值，坏文件首次失败即置initialized，close不重置队列/标志；同模型并发响应按完成/落盘顺序重放，均保留源行为。recordReplayEnv是显式宿主DI，不冒充完整process env隔离或安全策略。

最新实测：282项全量测试、204项编译JS smoke，新增13项录制/重放专项；真实SDK录制工具回合后，在无API key/baseURL的全新CLI进程重放、显式批准并重新执行Write。权限缺失时相同录制不会写文件；不同prompt仍可返回旧模型输出，验证非request严格匹配/非dry-run边界。全部旧差分、配置/check/build/help回归通过；仍为37/47 handler，完整harness目标未全部完成。

最新网页工具证据：WebFetch `11809212..11824073`（static cache在后）；helper/limits/schema `118079xx`起；WebSearch `11827419..11831956`（schema紧前）；IOAUtils `13282850..13283616`、常量module24618；Security Center translator module71445 `15624xxx..15626xxx`；parse/read managed policy `73258xx..73265xx`；BashSandboxManager.loadConfig `7331106`起的网络合并分支。主handler方法体机械移植后添加TypeScript注解/显式DI，原内嵌fallbackPrompt未改写。`verify:web-tools` 固定SHA后通过544次比较，包含schema/原常量/header值、URL/domain/IP/HTML/meta/逐字Prompt、cache边界、API优先竞跑/长度门槛、网络策略/请求体/结果/错误、AI回退、IOA与托管策略矩阵；数量是断言次数，不是独立场景数。所有真实产品远端服务均未调用。

最新实测：297项全量测试、219项编译JS smoke，新增15项网页工具专项。真实SDK默认WebSearch访问本地产品协议端点，WebFetch本地HTML经真实contentAnalyzer回合后返回父会话；新CLI进程可单独配置web端点/token并重放工具请求，工具审批仍开启。Security Center V3/V2/file优先级与托管网络覆盖已接入默认projection，完整Sandbox lifecycle/文件/命令执行仍待补。补齐standalone detached child的纯数据web端点/token传递；不序列化内存callbacks。修正Team fixture teardown：先close/等待本次runtime，再删临时目录，未更改原Team调度。此前全部差分、配置/check/build/help回归通过，原配置/115个Prompt与SDK0.5.2不变。当前39/47 handler，仍不满足完整harness全部还原的完成条件。

最新Delegate证据：Manager `8375029..8377400`；schema紧前/handler `12067549..12068556`；ACP handleDelegateToolsChanged `6905059..6906164`；ToolManager描述注入 `11665171` 起、callback/invalidate `11679936..116808xx`；AgentManager.getAll `7043xxx`。`verify:delegate` 固定SHA后通过282次比较，覆盖原包实际schema转换器、注册/覆盖/索引/清理/通知失败、连接/timeout/status/异常、嵌套结果/raw getter读取次数、ACP变更/部分注册、描述变量/刷新缓存/Agent列表。Zod3.25.67别名与转换器3.25.2并存SDK的Zod4；转换器实际JSON已与包内版本一致，不承诺整个转换库版本或全输入等价。

最新实测：312项全量测试、234项编译JS smoke，新增15项Delegate专项，真实SDK模型回合经内存客户端转发原样输入并回注结果、验证默认审批、Agent identity/model保持与关闭清理；无真实IDE/外部产品服务或凭证访问。修正旧Bash测试固定80ms等待假设，改等实际任务完成，运行时未改。全部19个差分脚本、配置/check/build/help通过；40/47 handler，SDK0.5.2、六份原配置和115 Prompt不变。完整ACP/UI、剩余工具及其他宿主缺口继续推进，整体目标未完成。

最新LSP证据：类型/枚举module12490 `9146380`起；resolveCommand/helper紧前；Client `11971809..11982082`；Manager `11983089..11990110`；schema `119914xx`起/Tool `11992011..11997772`；PathUtils文件解析/normalize/unixToWindows `13336036`起。`verify:lsp` 固定SHA后在VM装载原类/包内schema转换器，711次比较涵盖schema/coerce/坐标、九种operation与原文/50截断、符号/Location/hover/completion归一、workspace root优先级、完整初始化参数/服务端反向请求与通知、document-open缓存/缺连接/读失败、Windows where过滤/启动spawn env/固定时序、注册/旧映射/无效配置/重试与Manager状态、shutdown/cleanup/timer残留及路径。数量是断言比较次数，不等于711个独立场景；引擎TypeError比较类型，不比较含局部变量名的消息。

最新实测：328项全量测试、250项编译JS smoke，新增16项LSP专项。真实stdio fixture子进程完成initialize/服务端configuration请求与capability/progress ack、didOpen一次快照、九操作相关调用、崩溃后lazy重启、startupTimeout/挂起request关闭、missing executable/unsupported transport；显式SDK注册调用LSP并回注结果，原19 Agent均不声明它的边界不变。standalone close额外清本次注册identity gate、清理owned clients（含被覆盖者）以解除初始化/SDK等待和避免关闭时重启，不改原Manager/Client类。20个差分脚本、配置/check/build/CLI help回归通过，41/47 handler。SDK0.5.2、六份原配置和115 Prompt不变；完整plugin loader/lifecycle、真实第三方语言服务兼容与Windows进程、其余6工具和其他宿主缺口仍待推进，整体目标保持未完成。

最新媒体证据：ImageGen `12001889..12004324`；ImageEdit `12021234..12023170`；ImageService `12024390..12031124`；VideoGen `12033776..12035596`；VideoService `12037069..12041876`，poll interval5000/max600000与Kling fallback常量紧前；BaseImageParameters/ImageEditExtendParameters及4个tag在module57651 `121969xx`附近；image PostToolUse输入processor `85064xx`附近；对应env常量module在`11219xxx`附近。完整ToolNames 53项字符串表也已保留并比较，含未进入47-name产品registry的legacy名称，不将常量声明当成handler实现。

`verify:media`固定SHA后通过370次原类/包内schema转换器比较：原schema/描述、常量表、feature/env/model gate、四tag优先级、Hunyuan/Gemini/其他请求分流、图片输入/MIME/HTTP/错误、服务认证/response与submit/poll边界、原handler result/renderer、Hook输入以及受控临时文件命名/内容。方法体机械移植后加TS注解/显式runtime，类型别名同时保留BaseImageParameters/ImageEditExtendParameters。不是370个独立场景，也不覆盖完整产品RestOperations/认证刷新/图片重注入/全I/O并发故障。

最新实测：347项全量测试、269项编译JS smoke，新增19项媒体专项：真实SDK默认deferred ImageGen/VideoGen、显式SDK legacy ImageEdit（仅内存feature/model overlay）、CLI无模型凭证重放后调用本地产品协议服务、权限守卫、分离media token、HTTP输入与本地输出、目录竞态/同名覆盖、错误/MIME/视频轮询/取消/sleep listener与Hook输入。测试字节不代表实际图片/视频编码或生成质量；未调用真实产品媒体服务。CLI新增--media-endpoint/WORKBUDDY_HARNESS_MEDIA_ACCESS_TOKEN并向detached child只传纯数据；SDK0.5.2/六份原配置/115 Prompt不变。21个差分脚本、配置/check/build/help回归通过，当前44个handler覆盖47-name产品registry，仍缺ComputerUse/WeChatReply/WeComReply及多项宿主分支，整体目标未完成。

## ComputerUse与多模态结果恢复批次

原工具类 `12149394..12152228`、执行器从 `function isDarwin`（12137xxx）至computer_use_tool_decorate、schema/validation从 `let u2`（121476xx）至 `let u4=class`；坐标/键表/AppleScript/Quartz脚本、14动作、描述/renderer/错误字符串均来自固定SHA样本。此处偏移均为JS字符串UTF-16索引。PathUtils.getHomeDir在13330739附近，保留非空CODEBUDDY_CONFIG_DIR原值，否则homedir/.codebuddy；独立host只映射自身stateDir。原19个Agent不声明ComputerUse，未更改原配置或启用默认工具；普通function tool继续使用SDK0.5.2。系统依赖不内嵌、不自动安装，不直接调用当前桌面验证。

截图先screencapture，再并行探测原图/Finder尺寸，sips最长边1280/JPEG75，最后压缩图尺寸更新共享scale。压缩失败继续、探测失败1:1、cliclick一次检测的正/负缓存及并发null、截屏同毫秒覆盖/无清理、鼠标参数缩放但返回坐标未缩放、cursor原值、AppleScript fallback与Quartz滚动、hold/wait clamp/超时、无父abort都按原实现。schema动作字段可选与handler后验校验不合并；handler screenshot无display参数，即使底层支持。execute不替代gate或审批；直接调用是不受保护的底层接口。

补回截图依赖而非仅接handler：FunctionCallResultAgentInputItemProcessor `11041906..11044215`、ToolResult.is/from（121923xx）、ToolMessageModelRequestProcessor `8559013..8561670`、ImageUtils magic-bytes/base64检测（13202xxx起）。完整工具结果留在providerData.toolResult，output只解包一次；MCP input_text/image/file逆转换、空text过滤；请求移除无效tool-call/result配对、私有toolResult、空消息/末尾assistant，图片字符串数组转image_url。保留原null/type/name异常边界和blob-ref优先级，不凭猜测补name或统一吞异常。ModelProvider.normalizeNewToolResults不再为空，并在getModel时处理最新结果；SessionManager历史复制与SDK raw共享providerData避免二次解包是host兼容处理。完整DefaultInputItemProcessor/FunctionCall processor、telemetry、ImageFilter/Rehydration/blob服务尚未全接，不能据此宣称所有媒体管线完成。

`verify:computer-use`通过1,028次固定SHA原类/包内schema转换器比较：schema/验证/gate、所有动作/键脚本、命令参数/时序/scale、平台/cache、权限/读取错误、工具结果/MCP/请求清理/blob优先级和MIME。不是1,028个独立场景，也未穷举所有并发/平台故障。18项专项含真实SDK+真实模型transport+本地HTTP服务的截图回注：下一次请求确为image_url数组，历史记录可持久化；所有execFile/mkdir/截图readFile/timer均为假实现，只使用受控fixture字节。未读取屏幕、输入键鼠、变更系统权限或访问真实模型/产品服务，未验证真实JPEG编码/视觉识别/远端接受能力。

本批最新实测：365项全量测试、287项编译JS smoke；22个差分脚本全部回归，check/build/原配置校验与编译CLI help通过。45/47个handler已接，仍缺WeChatReply/WeComReply及上表宿主分支；115个Prompt/六份配置/原Agent allowlist/SDK0.5.2不变。旧Delegate测试仅纠正期望的结果解包层级，旧TaskCreate历史fixture补齐原协议必需name；未放宽运行时错误边界。整体目标保持进行中。

## WeChat/WeCom channel恢复批次

固定SHA样本证据（均为JS UTF-16偏移）：WeChatReply `12068622..12072932`，WeComReply `12073361..12076598`；WechatChannelBridge `9955951..9970590`，WecomBotChannelBridge `9995529..10011968`；ChannelManager `7360067..7363197`，ChannelPermissionAdapter `7366430..7367715`；protocol/schema模块37402从7357294起，channel instructions为两bridge前的eT/eM常量。原handler/bridge方法机械移植，仅加TS/显式runtime；动态AgentService导入仍保留Promise.then/await边界。两份逐字channel提示独立于原115个product prompts；SDK继续锁0.5.2，六份JSON及Prompt内容未改。

两个工具的schema可选字段、isEnabled任一connected、needsApproval=false、不同返回/错误文本原样保留。WeChat的chat_id验证/误拼接分支/token短值检查、图像caption合发/普通文件先text后file（不回滚）；WeCom的local→remote→image→text优先级、media时忽略caption、20MiB仅local检查、extension判型/dataURL filename怪异值、30s fetch/path回退与uploadMedia/sendMediaMessage参数均恢复。低层handler不替代宿主审批，发送本地文件会交给客户端，不是安全文件沙箱。

完整bridge包含客户端订阅/连接注册/刷新、实例rename（WeChat）、原路由/解析/context、permission/Ask/suggestion、逐字中文确认/格式化、群聊前缀、用户channel XML/meta/附件、busy队列/idle AgentService唤醒、WeCom local命令/TUI-only清单、combine输出收集与错误。原CLI声明两工具不变；WeCom连接会修改已构造Agent内存tools并刷新，WeChat只刷新。全局FIFO许可不绑定chat、未知输入deny+1s转发（丢媒体meta）、Ask numeric prefix/@mention末词、建议替换/跨session取消、last route/首connected fallback等缺陷未擅自修复。

ChannelManager注册capabilities/permission relay、settings/allowed/development-channel解析、广播/FIFO消费；审批ID原alphabet的5字符、随机碰撞覆盖、无TTL/timeout、cancel只删索引不resolve等恢复。注入工厂为空时不连接、不发消息、两工具不启用。显式`channels.wechat/wecom`接收getAll/get已有可信客户端；不是原factory、账号存储或传输实现。接已有SystemReminder channelServers源和InterruptionService relay；独立host额外处理普通guard内人工等待/abort/local callback竞争、SDK Ask审批一次性guard授权、订阅/计时器/迟到发送关闭守卫、入站所有者SDK流abort与完成barrier，不断开调用方客户端，也不改变原run发布流后返回的边界。guard的allow_always只作用本次，持久审批服务仍缺。

WeCom连接刷新暴露此前lazy AgentManager.ready把“任一缓存Agent”当ready，造成Explore先构造后CLI描述渲染等待自身。原AgentManager `7025572..7059651` 中_ready独立初始化false、rebuild结束才置true；独立host现映射为默认Agent已缓存才ready，并加真实SDK先Explore/后CLI回归。没有声称原eager构建、rebuild队列、模型readyDeferred/插件热更新已完整恢复。

`verify:channels`通过1,810次固定SHA原类/包内schema转换器比较，涵盖schema/说明/错误/逐字instructions、文件/URL/媒体、路由/连接/rename、事件/唤醒/队列、权限/Ask/建议/本地命令、manager/adapter状态与日志。不是1,810个独立场景，不代表全异步竞态、真实认证/加密协议或系统平台兼容已穷举。29项专项含真实SDK文本/文件、原提示/JSONL、渠道允许/拒绝/abort、Ask暂停/答案回注、原连接后allowlist与磁盘配置不变、入站唤醒/关闭活动流。所有网络、客户端发送/上传均为注入假实现；文件仅本次临时fixture，未读取账号凭证或向真实联系人发消息。

本批最新实测：394项全量测试、316项编译JS smoke，23个差分脚本全部回归，check/build/配置校验/编译CLI help通过。47/47名称handler已接；原SDK/六份配置/115 Prompt保持不变。整体目标仍进行中，下一阶段应恢复原渠道client/factory/registry与传输、核心输入/blob处理和AgentManager/权限/宿主剩余分支，不能以工具名称覆盖宣布完整harness完成。

## 渠道原客户端、认证与媒体协议恢复批次

固定SHA原包（UTF-16索引）：WechatClient `9976556..9987096`，WecomBotClient `10020791..10036952`，WechatApi `9947251..9949214`，LivenessWatchdog `9946223..9946941`，PollWatchdog `9976129..9976483`，WechatClientFactory `9973452..9975439`，WecomBotClientFactory `10015182..10017282`，LongConnectionClientRegistry `10079261..10079689`。辅助模块83782从9946943、3470从9949216、35714从9987098、88795从9990426、20816从9991114、39437从10036954、305从9946024、73196从10515449起。两套原客户端/factory/registry和API/QR/store/加解密/helper/watchdog原方法机械移植，加入TS与显式I/O依赖；原模块级credential/media函数、逐项常量/枚举/DI symbol同时保留，未把factory的getAll/get骨架当真实实现。

WechatApi保留URL/认证/UIN/base_info、UTF8长度、ret/HTTP/JSON/AbortError边界。getupdates45s、sendmessage/getuploadurl15s、getconfig/sendtyping10s；headers返回后即清超时/外部abort监听，body仍可挂起。WechatClient保留QR后_pending→account ID改名/回调、owner lock、poll过滤/type/state、cursor/-14、去重500、退避与typing，disconnect清backoff timer不resolve已等待Promise。caption/image在client中分两条消息，而不是原handler一次sendImageReply就等于单条API消息；文件media_type=3但message item type=4、aes_key采用hex字符串的base64等细节未规范化。

Wechat媒体原AES-128-ECB/PKCS padding、MD5、random filekey/key、getuploadurl优先级、CDN binary/header与raw16/hex32 key解析、temp命名和extensionForType均恢复。full_url/上传地址不做域名/协议/大小/统一timeout隔离，原下载必须有AES key；来源/路径仅可可信，不当成安全文件服务。WeCom媒体保留HTTPS/suffix/redirect:error、plaintext JPEG/PNG/GIF/BMP/WebP优先于aeskey、AES-256-CBC/IV前16/1–32 padding与原STT/mixed文本、错误/落盘/filename规则。

WecomBotClient保留Node ws/Bun选择、subscribe/任意成功响应在connecting时的原判断、req_id pending、stream/chunk/async markdown/media/welcome、消息/事件回调、去重1000、heartbeat30s/watchdog>90s、指数退避和源socket状态。上传512KiB/chunk、100块上限/MD5、三次retry/500–1000ms、空文件init/finish、缺upload/media ID错误保留；普通发送不等待ack。连接30s timer原生不清、pending无socket也会arm、disconnect不总是同步reject pending、error/close/重连及falsy msgid等原边界不被宿主假装修复。Bun日志字面量在机械替换中发现偏差后已恢复，并新增原模块Bun分支差分；真实Bun/Windows宿主仍未验证。

credential store保留instances.json/legacy credentials*.json迁移、共享.tmp/尝试0600/rename、重复/坏文件处理、WeChat pending cleanup/保存开关和账号前8字符清理、WeCom suffix/default env与保存记录来源顺序。QR bot_type3、35s poll/8min总门槛/1s sleep/最多3次refresh、scaned拼写、确认缺字段及缺instanceId的原异常边界均保留；qrcode utf8/M/margin0/version/catch空串和getVersion回退1恢复。WeCom180s/3s配置轮询、中文提示与状态事件恢复。保存为明文，没有新增加密vault/实例名安全校验/跨进程锁，legacy文件不删除；factory加载后默认断开，create/duplicate/remove/rename/index/register行为保持原类。

独立宿主新增`channels.native`和`channelClients`：提供实例/自有credentials可初始化原factory，但仍需显式connect；默认没有客户端，不读已安装应用账号、不连接真实服务。仅显式loadSavedInstances才批量initialize，per-instance原init/connect缺凭证仍会读/迁移独立stateDir；Wechat给定凭证是内存provider overlay，WeCom走原create参数。host native env默认{}，不借用模型/web/media token。原低层模块直接API仍有原home/env默认值，调用方需自行限定范围。批量初始化与原I/O实现不等同完整RemoteControlAutoConnectMiddleware/登录配置UI/代理/安全服务/产品DI bootstrap。

host ownership另跟踪本次自建client/timers/socket构造/HTTP请求：关闭时dispose owned clients、reject pending uploads、clear遗留timer、阻止迟到WS构造和新请求，owned fetch对headers后挂起body也可中止。外部注入client不由native owner disconnect。原类的deadline/锁/退避逻辑未改变；QR/配置/backoff原等待无完整取消协议，纯headers响应的ownership ledger可留到close，关闭不等于撤回已经发送消息。真实SDK取消后仍可能进入model adapter，测试fixture现尊重已aborted signal并拒绝开始新流，未改SDK内部循环去掩盖这个边界。

依赖证据为原cli/package.json qrcode1.5.4及app node_modules/ws8.18.3。新增独立alias ws-native8.18.3，`npm ls`确认SDK原ws8.22.0未被替换，Agents SDK仍0.5.2。此旧ws存在[高危内存耗尽](https://github.com/websockets/ws/security/advisories/GHSA-96hv-2xvq-fx4p)与[未初始化内存泄露](https://github.com/websockets/ws/security/advisories/GHSA-58qx-3vcg-4xpx)告警，本轮npm audit共11项（5 moderate/6 high，含既有依赖）。为还原保留原版本但默认不connect，未自动audit fix改写依赖；不是生产安全背书，也不据此断言原应用Bun原生分支受到同一Node ws问题影响。

`verify:channel-clients`在固定SHA原模块/类之间通过1,016次比较：常量/模块接口、QR/state/错误/迁移、API头/body/ret、CDN上传/密文/解密、CBC padding/URL、内容提取/文案、完整poll/connect/rename/退避/帧、upload retry、watchdog/Node/Bun、factory与registry日志/状态。全部I/O/clock/random/socket边界注入，比较数不是独立业务场景数，不穷举真实平台/协议变化/并发。另29项专项用真实临时凭证文件、本地HTTP QR与long-poll→真实SDK→API回复、本地WebSocket subscribe/callback→SDK→分块上传/发送、pending body/关闭/迟到构造验证。账号/token/key/file均为自有fixture；未访问真实微信/企业微信/模型服务、读取安装账号或发真实联系人消息。真实TLS、服务认证/编码/服务器内部逻辑、产品UI/自动连接/全状态仍未证明。

本批最新实测：423项全量测试、345项编译JS smoke；24个差分脚本全部回归，配置/check/build/编译CLI help通过。47个产品工具名、SDK0.5.2、六份配置/115 Prompt不变。下一阶段优先input/history/blob与原AgentManager/权限/MemoryManager等核心来源和宿主缺口；整体目标保持进行中，未以本批或handler名称覆盖宣称完整harness完成。

## 原生输入处理与图片历史拦截器批次

固定SHA样本的UTF-16区间：Default `11036587..11037814`、ParentIdLinkage `11038139..11039351`、FunctionCall `11039444..11041199`、既有Result `11041906..11044215`、Usage `11044508..11045003`、原公开名ExitPlanModeInputItemProcessor `11045096..11045850`。ImageFilter `7127682..7129711`、Rehydration `7111289..7113649`、Compression `7114393..7115673`；时间helper从10956732、InputItemUtils子集13267xxx/13270xxx、PathUtils13337xxx、SummaryUtils13376xxx，原priority enum111845xx、DI symbol11183391；原provider排序器116xxx。37套工具renderer各自原区间在源码注释保存；PowerShell redactor12173724起。构造改为显式依赖注入，保留方法体/关键字符串/priority/公开方法名；未执行原应用初始化、读取安装账号或访问真实服务。

原六个输入处理器按正priority筛选/降序运行，原Telemetry5未填假实现。Default的Agent仅取result.lastAgent（不是session.agentName fallback）；custom/sub-agent两tag/color、成功compact marker和meta compactType继承；SummaryUtils原case-sensitive提取和case-insensitive envelope探测混用、空白summary不算成功等边界照保留。Parent按原replay compact/系统队友消息规则修复self/missing/cycle并维护lastUserMessageId；子Agent判断依赖storeId差异。普通消息悬空parent不被擅自修正；compact assistant标记不自动等价为用户replay边界。五个时间helper保留零/有限数/无效时间和非对象set边界。

FunctionCall parseDisplayText、SyntaxError discard、非语法错误吞掉与DeferExecuteTool→Workflow预载条件/错误debug完整移植；37份原renderer接入ToolManager，每实例隔离mutable数组。含ToolSearch/Workflow/Cron formatter、路径/URL、PowerShell脱敏。脱敏只作用argumentsDisplayText，raw arguments/录制/其他日志仍可能含敏感信息，不是全链路密钥保护。单属性缺失可能TypeError被吞、formatter返回空串有效、数组跳过、对象/null参数边界均保留。ExitPlanMode调用和结果都按原读取/快照计划，保留Warning与error文案。既有FunctionCallResult工具结果与SDK raw元数据共享路径不变。

ImageFilter默认接入Model900之后、priority850：精确model id且supportsImages严格false才过滤；user input_image、RunState.history、工具output.text JSON数组/单对象image/image_url规则不扩展为递归清理。Compression1075/Rehydration1050方法完整移植，imageHistory.imageUtils/blobService显式依赖后接入并供SessionStore保存图片。保留原先压缩后回填的顺序；reset/no-ref短路、settings/track在try外、JSON blob正则、错误warn、retainRounds nullish默认2/零值等原边界。没有将测试blob/codec依赖写成默认算法；原内容寻址文件布局、轮次保留/placeholder/去重、真实压缩codec及图片工具全链仍待补。

独立宿主明确适配：有pipeline时停用原手工元数据分支，旧直接嵌入构造不传pipeline仍保留兼容分支；工作/主目录经utilities注入，不假装全局process.chdir。SDK流消费者与tool execute并行，新增异步processor曾暴露TaskCreate ordinal竞态；beforeExecute等待session现有history锁，未改原TaskCreate或processor算法。18项专项含SDK Read元数据/usage/JSONL、预载自有Workflow且不执行、unsupported-image过滤、显式测试blob/codec先压缩后回填闭环，既有TaskCreate序号/恢复测试继续通过。

`verify:history-pipeline`现通过1,261次固定SHA差分：原类、独立原helper子集/原enum/原provider过滤排序、37套renderer及redactor、时间helper的返回/错误/变更/调用日志。TypeError对比归一化引擎文案，有限fixture不等于全状态空间或所有坏对象输入证明。25个差分脚本回归通过；本批最新441项全量测试、363项编译JS smoke、check/build/config/编译CLI help通过。SDK0.5.2、六配置和115 Prompt未变。

整体目标继续进行中。下一步优先原blob/压缩codec、aborted-draft/response gate/idle timer与完整InputHistory服务，再推进eager AgentManager、MemoryManager/插件命令等剩余产品宿主；不把可编译启动、handler名称覆盖或本批有限差分当作完整harness已经100%还原。

## 原Blob/图片历史/工具结果外置批次

固定SHA原包UTF-16：BlobStoreImpl `7343391..7344212`、ImageBlobServiceImpl `7345147..7353749`、ToolResultBlobServiceImpl `7355182..7356920`；SessionStore的replaceImageDataWithBlobRef `10982845..10983449`、replaceImageInFunctionCallOutput `10983449..10984924`、externalizeToolResultIfNeeded `10984924..10985512`、externalizeStructuredArrayOutput `10985512..10986118`。PathUtils getBlobsDir/getBlobPath/mimeToExt13331083起，MIME_EXT_MAP13339544起，ImageUtils MIME异步检测13203887起/映射13209024起，FileUtils.formatFileSize13094789起。三个DI symbol原名保留，MAX_VERSIONS_PER_SOURCE=3、50KB阈值、2048 preview、占位/日志原文和方法完整移植，仅增加TS/显式I/O构造边界。

Blob按解码后字节SHA256寻址、前两位分桶、MIME决定扩展名；existsSync命中不重写/不验证现存文件哈希，无原子rename/并发锁。storeFromDataUri保留严格正则（不接受空body/额外charset），storeFromFile按原magic优先/扩展名fallback MIME；空blob存在也因空base64为falsy而回填placeholder。ref.blob_path不决定实际read路径；source/original_filename影响展示。类型守卫只检查type/blob_id字符串，不验证64位hash或可信路径。

图片历史：所有user计轮次、不排skipRun/reminder；按blob_id最后item筛选候选后，对每source留最近三个版本，无source候选单独保留。整item入选可令同item另一旧blob也回填，不改成每blob强去重。user扁平/嵌套input_image、工具output与toolResult内容、image_url中对象/JSON引用均按原轻量规则处理；缺失/旧版/空blob用原placeholder，单个JSON对象不被processContentArray递归展开。new/unchanged/duplicate及source变更分支、重置tracking、JSON正则fallback均保留。

ToolResultBlobService保留env parseInt以及NaN/0/负门槛；shouldExternalize比较UTF-16 length，预览也是code unit切片，并非文案所称UTF-8字节。parent+agent-*路径、普通session路径、spill file envelope/read/cleanupSession与catch边界保留。SessionStore四原方法替代手工近似，外置和图片数组按元素catch/warn继续；fallback仍只匹配长data URI。只缩短output，providerData.toolResult原UI完整内容可能仍大，不宣称全JSONL尺寸上限或完整Bash原生stream-spill接线。

独立host默认创建真实三服务：根目录映射到自己的stateDir/blobs与stateDir/sessions，不自动读产品home/project目录。Rehydration现默认接入；ModelProvider/HTTP请求处理器注入真实ImageBlobService，JSONL保存引用、模型请求仍回填data URI。显式imageHistory.blobService/codec与blobs I/O override保留；不把它们默认当假实现。close不清除外置文件，保留resume；cleanupSession只作为显式低层方法存在。完整产品项目目录编码、Read直接track/dedup/压缩、真实codec与媒体/stream spill接线仍待补。

安全边界不能由fidelity推导：原ID/路径不校验，存在非原子并发写、现存blob信任、低层cleanup递归删除/任意路径read等能力；仅用于可信历史和可信显式依赖，不可向不可信客户端暴露或当作文件沙箱。测试所有真实文件写入/清理仅在自有mkdtemp目录，不触及安装账号、真实联系人、真实模型服务或系统屏幕。

13项新专项通过，另将已有ComputerUse SDK+loopback HTTP测试加强为“请求图片仍正确，JSONL为blob ref且不含原data URI，实际blob字节与fixture相同”；真正跨harness重启恢复图片和close保留外置文件通过。`verify:blobs`535次固定SHA差分执行原三服务、独立原helper子集和四个SessionStore方法，比较返回/异常/输入变更/内存FS/日志。535不是535个独立场景，也未穷举多进程/磁盘故障/恶意对象状态。

最新454项全量测试、376项编译JS smoke、26个差分脚本、check/build/config/编译CLI help通过。SDK0.5.2、六份JSON及115 Prompt未变。整体目标继续进行中；下一阶段继续原压缩codec/Read图像路径、aborted-draft/response gate/idle timer与完整InputHistory、eager AgentManager/MemoryManager/插件命令等，不能以本批或可启动替代完整harness目标。

## 原ImageUtils/Jimp与Read图片分支批次

固定SHA、UTF-16：ImageUtils完整类 `13202774..13208907`（23静态方法+三个原常量），所属84024模块 `13108540..13209592`；Read.isImageFile从11696110、readImageFile从11696313至read_tool_decorate前；ModelUtils.getCurrentModel从13320247、ToolExecutionError从12196419。原Jimp配置、CODEBUDDY_CODE_IMAGE_COMPRESSION_MAX_DIMENSION和两套profile在ImageUtils前；Read模型图片错误1010/压缩省略1011与图片helper的1001/1002/1003取原enum。原SessionFactory conditionalRules={pendingTriggers,processedRules}从10997841附近保留，Read登记pendingTriggers；完整条件规则来源/执行尚未因此恢复。

完整ImageUtils不只是resize：1080档maxBase64Size512000/maxRawBytes384000/qualities85,70,50,30；2000档5242880/3932160/80,60,40,20。env parseInt/负数/NaN回退、unsupported warning、profile0返回undefined、原regex、round等比缩放、MIME探测、JPEG重压/转换顺序、throwOnFailure、resolution-limit和失败省略保持。base64字节估算round(.75*长度)未扣padding；解码失败的小内容可以保留原串，0在Read/profile绕过但直接compressImage仍有原尝试/失败日志。没有增加额外强拒绝/安全校验策略。

新锁定原包依赖jimp0.22.12，未升级SDK。captured-image-module从固化bundle装载84024及其依赖共89个模块，运行原内嵌Jimp编解码器；未启动应用entry，文件/网络/字体加载边界阻断，process/env/logger为fixture。PNG/JPEG/BMP实际编码data URI逐字节对照独立安装原版本Jimp，含真实resize、重编码、高熵降质，不是只用假codec自洽。instrumented codec另验证全部quality循环、read/buffer失败与省略控制流。可信源码VM不是安全沙箱，也未证明全部Jimp功能、Bun/浏览器、字体/URL路径和恶意图片安全。

Read替换旧扩展名直发分支：模型family格式列表+原1024字节binary probe，再判断supportsImages严格false。ModelUtils子集按default Agent、session.request/options和name/id，不识别aliases；未知包装custom模型。若干format函数对无分隔符裸文件名own.bmp与裸扩展名bmp结果不同，保留。Read先access/stat/read-state、重复读取原字节/MIME、存原图blob并track，再压缩；unchanged/duplicate提示、标题size/压缩比、blob失败warn/fallback和错误边界保留。ANSI仅String/pure text宿主适配；其他文本Read/文件工具原方法与错误码仍需完整复核，不据此宣称整个Read类100%。

第一次压缩省略后tracking仍有效，第二次可能返回unchanged；先存原图，压缩后的output也可能另存blob。字符串型providerData.toolResult.content仍可能含data URI，即使output已改blob；loopback测试同时断言此原行为，未为全JSONL无图片字节而改源码。压缩无CPU/内存隔离、timeout/完整取消，文件多次读也非原子快照。直接嵌入CoreFileTools无model/blob DI的默认format/fallback与产品DI区分；imageHistory窄codec override只影响输入interceptor，完整codec/env可由imageCodec注入。

11项新测试：真实PNG缩放/MIME、高熵转JPEG、错误/省略、模型/二进制门槛、原图重复/复制/变化、失败后去重、模型解析、默认input interceptor真实SDK回注；loopback HTTP+真实SDK连续三次Read得到压缩image_url、unchanged、duplicate并校验blob字节/JSONL。verify:image-codec通过803次固定SHA比较，含完整公开面/常量、Read/model方法和调用次序；TypeError文案归一化，真实编码路径另做完整字符串相等检查，非全状态空间证明。

当前npm audit报告15个受影响依赖项（9 moderate/6 high，非15个独立漏洞），Jimp链file-type等增加moderate项，phin标deprecated。为保真未audit fix/跨大版本升级，原ws-native8.18.3既有风险仍在。仅自有测试图片/临时目录与本地HTTP，未读取安装账号/屏幕、联系真实用户或请求真实服务，不宣称生产安全。

最新465项全量测试、387项编译JS smoke、27个差分脚本全部回归，check/build/config/编译CLI help通过。SDK0.5.2/OpenAI6.25.0、六配置/115 Prompt未变。整体目标继续进行中；下一阶段优先aborted-draft/response gate/idle timer和完整InputHistory，再推进eager AgentManager/MemoryManager/插件命令、媒体/条件规则等未完成宿主，不以本批可启动或有限差分代替完整harness目标。

## 结果生命周期与中断草稿批次

固定SHA、UTF-16：AbortedStreamDraftStore完整类`10949890..10954861`；createAbortableIterator从`10955502`，其前A_闭包读取CODEBUDDY_ABORT_GRACE_MS；原SessionManager类`10956217..10977596`，本批选取resetIdleTimer、emitSessionStart、initRunResultHandler、handleRunResult、handleStreamRunResult、handleContentFilteredResponse、handleNonStreamRunResult七个方法。InputItemUtils四个content-filter方法在`13270xxx`，notice英文常量从`13273180`；InterruptionService的_hasInterruptions快照在`110638xx`。方法体加TS注解与显式DI，原分支/字符串未改写；不执行整个应用模块或读取安装登录态。

DraftStore按原先后顺序记录reasoning/output_text_delta/tool参数，支持ChatCompletions index→callId以及Responses call_id路径；raw Chat content不冒充output_text_delta，Responses arguments不补item_id/index fallback。committed refs/keys避免重复，reset只清草稿，不清已提交集合。flush顺序reasoning→assistant→tools，输出incomplete/isPartialAborted，允许未闭合JSON；复制content/rawContent避免快照别名。保留原字段/空值/缺name丢弃边界，不承诺全部并发状态下无损。

迭代器每轮race next/abort；abort后等待默认3000ms或正parseInt环境值，timer按原unref。宽限内next仍可完成，到期同步调用return但不await其promise；已abort时迭代器异常记日志退出，未abort则抛出。预先abort不发起next。取消后native stream按当前session.abortSignal判定，可能与初始捕获signal不同；不擅自把原语义改成即时取消/可靠资源回收。

结果处理保留request/message observer入口、流/非流分支、RUN_FAILED、completed等待、gate和end observer顺序。retry gate按_hasInterruptions ?? live interruptions，再network/result.error、completed retryable model/stream timeout、retryInProgress、isCompressing，再interceptor计算；严格true才拦截，单个失败warn继续，捕获的旧resolver不被重叠result覆盖。gate先resolve再end telemetry；自动retry分支清telemetry并跳过报告。非流只追加newItems.rawItem。stream恢复timestamp/metadata、tool streaming别名、最后响应item的rawUsage回填、response.id覆盖、空输出silentAbort和structured例外、model/combine转发及abort草稿落盘。

content-filter沿原messageId匹配最早过滤响应，使用原parentId、真实用户candidate和逐字notice创建skipRun分支，去重并historyReload；空messageId不捏造。idle定时60000ms，busy重新安排、idle发原通知；startup/resume复用WeakMap里首次promise，完成/失败后仍不删除。订阅显式init会替换旧者；新增host ensure只在首次启动初始化，避免每个SDK回合重播旧BehaviorSubject。

独立宿主新增per-result gate/error/consumer ledger，等待异步后续result与历史flush；终止计划/审批拒绝用独立terminal ledger返回，不修改原gate或滥用__cancelNudge。原TaskCreate扫描history计算序号；新增host指定callId的发布屏障保证执行前该记录已落地，不修改其算法。关闭清理owned timer/subscription。未配置resultLifecycle的旧SessionManager嵌入入口保留兼容实现，createHarness默认使用新生命周期。

sessionLifecycle显式支持interceptors、onSessionStart/onNotification、timers/env、telemetryService/galileoSessionBridge和mapMessageErrorCode。原业务错误码映射尚未移植，不用error.code猜替；默认mapper空返回、observer离线空适配。生产六类响应interceptor全集、通用Hook命令执行器、完整InputHistory服务、Galileo/telemetry transport、ACP/print最终输出宿主仍未因此恢复。OpenAI Docs仅用于核对SDK结果边界，运行时仍使用0.5.2而非升级后的API。

`verify:session-result`共682次原包比较：完整DraftStore、iterator、七个SessionManager方法和四个过滤helper；固定UUID/clock/timers/observer，RunResultUtils/ErrorUtils与基础InputItemUtils使用此前已恢复依赖。比较是断言次数，不是682个独立业务场景。20项新增专项另验证真实SDK部分reasoning/text/tool参数取消→JSONL只落一次→下一回合，真实模型transport+loopback HTTP/SSE保留32hex messageId/model/timestamp，以及CLI gate等待延迟续跑；无真实账号、外网模型、联系人或桌面交互。

全量485项测试和编译JS smoke407项通过，28个差分脚本全部回归；check/build/config/编译CLI help通过。六份JSON/115 Prompt、SDK0.5.2/OpenAI6.25.0未变。整体目标继续进行中；下一步按完整InputHistory、生产响应interceptor/Hook、eager AgentManager与MemoryManager/插件命令推进，不以本批有限差分或可编译启动宣称完整harness已经100%还原。

## InputHistory与生产响应拦截器批次

固定SHA、UTF-16：InputHistoryServiceImpl完整类`11139187..11142447`，10个方法及原构造字段；常量history.jsonl和InputHistoryService symbol在11183xxx。响应类：ContextTruncation `11097159..11101525`、finishReasonError `11102390..11106192`、TextualToolCall `11107081..11110592`、TruncatedToolCall `11111362..11112484`、QueuedMessagesCleanup `11112796..11113108`、MediaContentError `11113694..11125692`、FallbackModelError `11127506..11129255`、ModelPermissionError `11130150..11131571`，共52个原方法。静态字段/regex/逐字Prompt沿原赋值恢复。Component metadata push从37824、autoBind反向绑定从53076，默认链按原反序，非源码正序猜测。

InputHistory是UI用户输入记录，不是模型transcript分支。保留JSONL追加、project选择、最近100条/时间排序、display+project连续去重、legacy input_history fallback但不落盘、writeLock/finally释放、坏JSON行告警和无schema校验。maxHistorySize=10000、cleanupDelay=5000，stat.size达到120×maxHistorySize才读行/保留末尾上限；cleanupHistory默认30天。只有本实例append串行，cleanup没有跨进程锁/原子替换，源类没有mkdir/close/敏感信息脱敏。不修改这些边界来冒充原实现。

独立宿主映射到自身stateDir/history.jsonl，legacy reader仅显式DI，不读取已安装应用数据。CLI交互模式按Node readline载入/保存用户输入，print/内部model turns不写UI记录；原React的搜索/模式前缀/粘贴状态机不在本批恢复范围。owner关闭清timer并等待append锁/已经开始的异步cleanup，这是单列host资源接线，不是原类新增协议。cleanup低层方法可能重写文件，仅操作明确传入的工程数据；不将其视为跨进程安全数据库。

八类默认链为ModelPermissionError→FallbackModelError→MediaContentError→QueuedMessagesCleanup→TruncatedToolCall→TextualToolCall→finishReasonError→ContextTruncation；显式sessionLifecycle.interceptors整体替换默认链。truncated JSON先discard/记录工具名，finishReason length按最近15项/最多2个marker纠正，内嵌Write/MultiEdit/Edit/Bash提示与terminal notice逐字保留。Textual最多1次，排除fenced/inline code，只匹配原invoke正则；CLEAN_RETRY_ENABLED在模块加载时读取CODEBUDDY_TEXTUAL_TOOL_CALL_CLEAN_RETRY，只有精确0关闭。getTurnRawItems优先历史messageId，否则newItems.rawItem；没有transport messageId时原discard可能只标SDK对象、不标历史副本，该边界已专项保留。

媒体按原pattern表判IMAGE_SIZE_TOO_LARGE/REQUEST_BODY_TOO_LARGE/TOO_MANY_IMAGES/INVALID_IMAGE/MULTIMODAL_CONTENT_SHAPE；最旧/最近图片选择、tool output/JSON/provider内容/路径/blob-ref处理、替换占位及逐字recovery Prompt完整移植。GIF拒绝码11125/11133/11135只替换用户GIF，不自动发起重试；普通媒体marker上限10，body/shape无可移除媒体才走PTL截断。错误内层message及JSON解析的原优先级、重复视图计数等不猜测式修正。

补回TokenUtils完整类、PtlErrorUtils namespace、HistoryTruncateUtils namespace与三个原InputItemUtils消息构造方法/自定义类型判断。PTL先EMERGENCY_AUTO force compact，false/throw再fallback；compact limit/pending approval禁止fallback，compact agent自己PTL跳过，continue during compact走确定性截断。按token gap或20% API rounds删旧，单组则按50%匹配工具对删旧，至少保留一组/一对；marker、skipRun/isCompactInternal/isPtlRecovery/isMediaBodyRecovery字段保留，最多3个PTL marker。中文1.8/其余4字符估算、图片占位、JSON/循环对象fallback沿原；RunnerFactory和ContextCompactSummarizer的末尾工具结果估算已替换旧近似stripImages路径。TokenUtils单独模块避免history/input初始化循环。

ErrorUtils恢复原ServerErrorCode enum、extractBizCode/overload/quota/input-length分类及mapMessageErrorCode所需原helper，支持嵌套错误/response.data、status/statusCode、responseBody、429内层data.code优先及原3001/3002/3003/3004/3006/default映射。SessionResultRuntime默认不再使用空mapper，root注入捕获产品配置；普通Interruption网络重试仍保持ECONNRESET/ECONNABORTED/ETIMEDOUT，未扩大为全部HTTP错误。完整ErrorUtils其余presentation/ACP等未据此宣称全集还原。

fallback保留print gate、same-model/已激活检查，overload先primary重试一次、quota直接切、原meta与bypassMessageQueue输入。原CLI选项`--fallback-model <model>`从7409394，现接到HarnessOptions.fallbackModel/session.options。真实CLI子进程+本地HTTP验证请求模型严格primary/primary/fallback且stdout最终答案正常；无远端服务。权限码11136仅通过显式productRefresh.sync(true)适配强制刷新/追加模型列表；offline默认明确拒绝live sync，不假装刷新固化配置。AgentManager核心live重建现已恢复；完整ProductManager远端sync与插件刷新编排仍待恢复。

`verify:history-response`982次比较涵盖完整InputHistory方法面及文字、八类方法面/静态字段/regex/内嵌Prompt与日志模板、原autoBind反序、业务enum/分类/映射、Token/PTL/截断/输入helper。原类/namespace在VM中隔离执行；FS/clock/UUID/observers为受控依赖，已有基础InputItemUtils/HistoryUtils明确复用，不执行应用bootstrap。982是断言次数，不是独立业务场景数，不证明全部并发/多进程/UI/真实产品策略。

25项新增专项另验证真实SDK的length续跑、textual清理、PTL截断、fallback切模；真实transport+loopback HTTP/SSE验证messageId/discard和11136刷新，真实CLI子进程覆盖原fallback参数。最新510项全量测试、432项编译JS smoke、29个原包差分脚本通过；check/build/config与编译CLI help通过。SDK0.5.2/OpenAI6.25.0、六份JSON/115 Prompt均未修改；未登录真实账号、访问真实模型/产品服务、联系人或桌面。

该批结束时整体目标仍进行中；其后的AgentManager恢复见下节。InputHistory服务和这八类响应核心已恢复，但原React/ACP/print最终输出视图、遥测transport和全部配置/并发状态仍有缺口；不以可编译启动或有限差分替代完整harness目标。

## AgentManager / eager bootstrap / 插件组合批次

同一固定SHA样本继续静态提取，不重新读取安装账号。AgentManagerImpl完整类`7025572..7059651`移植至`src/agents/native-agent-manager.ts`；68个非constructor方法（含ready getter和静态skills fingerprint）、原constructor字段初始化，以及A2/A3/A4/A8/A5/A6全部初始化表达式均做结构对照。保留原控制流/表达式/内嵌Prompt，只加TS注解和显式DI/env/clock/timer/profiler/compose/delegate边界；不是用整包bootstrap充当还原代码。SDK0.5.2保持外部依赖，构建factory不额外注入model/modelSettings，运行前ModelConfig继续负责配置。

原init会settings.list，再等ProductConfiguration，standby只在activation后启动；eager注册全部CLI-tag配置，当前19个Agent在createHarness返回前均就绪。get/getAgentConfig等ready并异步查Map，missing get返回undefined；getAll直接列Map而不触发构造/等ready。普通refresh只替tools不换实例；配置rebuild创建新SDK Agent，WeakSet保留旧managed实例，ensure的第四参数可将当前tools回写给旧实例。ensure返回void；AgentService/AgentTask/命令/压缩及测试调用方已同步接口，未知session Agent按原resolveAgentForSession回退default但不重写请求metadata。

pending/force重建合并、settled emitter/3000ms默认等待/timeout=0无限等待、失败记录与forced refresh rethrow、首次placeholder models独立屏障、CLI config force gate、custom command/skills/plugin指纹全部保留。指纹只取instruction/description长度与前32字符，model部分只取ID；同ID内容替换/仅模型删除可能被跳过，普通删除Agent可留旧Map记录，初次build失败也会开放ready。工具注入自身改变初次配置指纹可能导致下一次额外构建。这些行为有明确测试，不修改成“更合理”的全量hash/删除策略，也不宣称全部竞态已穷举。

完整registerAgent包含递归handoff/asTool、参数JSON/失败日志、handoff prompt/inputFilter/reset、custom默认移除Agent、显式mcp工具/server proxy/白名单、11个internal generator例外及原SendMessage/ExitPlan注入。模型选择包含custom/chat继承、alias/name/ID、disabled fallback、trust用户未知ID、lite/reasoning/env/defaultRelatedModels。完整plugin方法包含settings.agent/CLI、plugin replace、volatile persona expert Prompt、headers归一、source解析/fingerprint、standalone注册清理、MCP whitelist同步、output-style与default指令渲染。

原plugin composer全部helper`7018190..7024410`恢复到独立factory：仅builtin welcome root组合enabled interaction plugin；多个mode警告跳过，compose条件分支仅处理interactionMode/welcomeMode/workMode，其他Nunjucks块原样保留；include路径/循环/未知原文、frontmatter/变量替换、fallback fragment与工具union均保留。原MarkdownUtils三个方法、PermissionUtils三个方法恢复；frontmatter解析不换npm版本，`captured-yaml.ts`保留原module43519及其74个依赖factory，逐factory原始文本比较。vendor loader只允许process/buffer/util，不启动产品模块或读取账号。

Toolspec module8844的parseSingle/parseToolSpecs/augment、原ToolDeferOverlay与cache，以及DeferToolConfigServiceImpl`12005561..12006914`恢复。保留lenient warnings、重复/冲突last modifier、nested/comma错误、ToolSearch/DeferExecute no-defer补入、overlay返回force-defer/force-no-defer、env→settings→feature/default优先级。工具gate恢复整工具deny（排除MCP/scoped）、大小写精确allow、不擅自把*扩展为通配、alias scoped过滤、delegate原8工具白名单与Plan限制。MCP首session等待按server/overlay候选筛选，2000ms deadline，合并并发prewait；外部abort可重试，内部超时/异常按原completed语义，取消监听与timer沿原清理。

独立host只替代缺失的桌面服务：Deferred/Emitter框架、显式settings/product snapshot/命令/prompts/工具/MCP/prewarm/plugin I/O。createHarness启动时注册全部工具后start，close清理自身config订阅并等待rebuild。显式插件目录需可信；未自动扫描安装插件/账号，MCP whitelist adapter当前只记录注册意图，不冒充完整原SDK权限client。ProductManager/providers远端sync、完整Plugin/Extension loader与物化、PluginRuntimeRefreshService、ToolManager完整fingerprint/index/cache生命周期仍待恢复；standby激活/真实服务/MCP自动加载也不因原类移植而宣称完整产品启动已恢复。

`verify:agent-manager`559次比较包含68个完整方法AST/constructor与内嵌常量Prompt、原spec/composer全函数AST、74个YAML factory逐字文本、原类隔离VM行为与副作用。DI/Deferred/Emitter/SDK为明确依赖边界；VM跨realm的Promise.all调度可不同，独立Agent的日志/副作用按值和数量比较，重建/MCP竞态另测屏障与状态，不将任意调度顺序当契约。有限比较不等于559个独立场景或全配置/并发状态空间100%。旧delegate/命令差分的Object.create夹具已改用原Map字段，不改变native方法来迁就旧字段。

14项新增专项覆盖eager/Map、模型与instruction指纹、重建合并/失败/placeholder/standby、MCP deadline/abort/managed旧实例、原权限gate、插件persona/真实临时文件组合，以及真实SDK Read、显式config事件重建后模型请求和缺Agent回退。最新524项全量测试、446项编译JS smoke通过；30个原包差分脚本、check/build/config与编译CLI help通过。SDK/OpenAI锁定版本、六份JSON和115 Prompt未修改；只用owned临时文件、内存/假时钟、本地fixture服务，未访问真实产品/模型/联系人/桌面。

该批结束时整体目标仍进行中；其后的MemoryManager与条件规则恢复见下节。仍不将完整类移植、可编译启动或有限差分称为完整harness的100%还原。

## MemoryManager / 条件规则完整加载链批次

继续使用同一固化SHA原包，均为JS UTF-16偏移：Manager`9313253..9314720`、Loader`9316053..9320988`、Parser`9322398..9322964`、Cache`9323568..9323772`、Validator`9324564..9324969`、GlobMatcher`9325634..9326091`、LRU`9326727..9327035`、Subdirectory`9327165..9329952`、ConditionalRules`9331562..9332942`。上述八类服务完整移植至native-memory-services，原方法控制流/字段/日志/内嵌Prompt保留；框架DI、FS/Path/Hooks显式注入，不用原包bootstrap运行产品。

补回原MarkdownUtils小frontmatter/parser/list、MemoryLoadContextUtils、完整ImportUtils/GlobUtils和五个PathUtils方法（Memory路径、isPathInside、file:/~/@/separator/Windows路径处理）。规则解析明确不用上批的YAML parser；当前memory-store的公共小parser也转发同一原生方法，避免提取scanner与规则加载语义分叉。Glob由原module70941及45919两factory逐字保留，不猜npm版本或改用fast-glob；module3238所有MemoryScope/Type、文件名、40k和section header与原导出比较。

Loader并行加载user/project/project-local，共享loadedMemories/visitedDirectories；project主文件自祖先到当前、遍历不含系统根，当前`.codebuddy/rules`递归，user从config home主文件/rules，local只当前目录。CODEBUDDY.md/.mdc、AGENTS.md/.mdc按组首个成功者优先，`.codebuddy/`主文件另取首个；只加载.md/.mdc，symlink realpath与目录去重沿原。PathUtils默认写project优先已存在CODEBUDDY.md再AGENTS.md，否则CODEBUDDY.md；user写配置根，其余scope按源码落local。addFact去前置hyphen、substring去重、逐字section插入/换行，直接writeFile后仅清主cache，不伪造原子锁/事务。

Parser仅支持原小frontmatter，`paths`为逗号字符串/多行列表；brace切分保留`{a,b}`，inline `[a,b]`仍是普通字符串，alwaysApply/paths决定always/manual。Validator默认拒enabled=false、alwaysApply=false且无paths；import忽略这些开关，但仍限40k UTF-16。@import跳过代码块/行内code，支持相对/绝对/~/任意外部路径；loaded realpath优先去重并追加importedFrom，深度>=5跳过，directory import不读取列表。循环已在Map时直接命中，不擅自新增循环告警或改写路径/标点匹配。

Cache缓存Promise并合并并发，拒绝也保留直到clear；不是自动watcher。Subdirectory以原200/200/100 LRU缓存chain/dir/file，negative sentinel也缓存；从触发文件目录向上加载，不含cwd自身及其`.codebuddy`内部，主文件仅CODEBUDDY.md/.mdc，不额外加AGENTS；相对glob锚定子目录，非法/空glob回退dir/**，native isPathInside自身返回false。Glob按normalizePath和matchBase匹配，数组为逐项OR而非ordered include/exclude，大小写、dotfile、negation/extglob/braces沿原minimatch，未扩展为权限沙箱。

ConditionalRulesService.consume先匹配manual主规则与subdirectory规则，按触发/候选顺序匹配并即刻记录processedRules，再清pending和构造原完整conditional_workspace_rules Prompt；无匹配也清pending，匹配异常则不会走清理。会话同路径只注入一次；若结果非ToolResult甚至null导致追加失败，已经processed的状态不回滚。原ToolManager.injectConditionalRules方法从116794xx完整提取，Read/Write/Edit/MultiEdit未抛异常且truthy返回后接入原方法；工具结果string直接追加、非string按String(value||'')转换。完整ToolManager.execute/hooks/checkpoint/classifier编排仍未因此恢复，现有guard/handler与post边界为standalone接线，不宣称整类已移植。

原ConditionalRulesAgentRunInterceptor`7106105..7106449`（priority1740）默认接入Array input run路径，消费其他待触发并注入last user；不增加skipRun/meta过滤。MemoryPromptContext按原scope get注入user/project（scope查询本身不按type过滤），SystemReminder实际来源按always筛user/project/local。原pendingTriggers此前只记录不消费，image-codec旧测试的“保留pending”断言现改为消费后为空，原图片编码/HTTP/JSONL验证全部保留。

InstructionsLoaded保留原payload/cwd/空transcript/memory_type和session_start reason、每条best-effort警告；loader fire-and-forget，不等待Hook。独立host显式接instructionsHooks，close额外等待自身已经派发的Hook作为ownership边界；没有隐式加载/执行shell配置。默认配置home绑定本harness stateDir，不读取已安装~/.codebuddy；可显式memoryRules.homeDir/userHomeDir覆盖。规则及import可读取cwd外文件，只应接受可信文件；任何这些服务或Node VM/子目录校验都不是安全隔离。

`verify:memory-rules`282次比较包含67个完整方法AST与原constructor字段、常量/Prompt、两原minimatch factory逐字文本、规则发现/import/disabled/深度/去重、cache拒绝/clear、子目录负缓存、glob/path、section写入、Hook及注入行为。原类隔离VM只给内存FS/Hook和明确Path边界，不启动原应用。并行独立加载的日志/I/O按值和数量比较，业务顺序另由祖先/优先级/processed场景验证；计数不是独立场景，也不穷举全部平台/文件故障/并发。

新增18项专项覆盖上述协议及真实SDK常驻user/project/local规则、Read+子目录规则结果/历史、Write无需Read触发且仍需审批、手动pending run注入/clear后新session重载，以及真实CLI→loopback Chat Completions携带项目规则。最新542项全量测试、464项编译JS smoke、31个源码差分脚本、check/build/config和编译CLI help通过。SDK0.5.2/OpenAI6.25.0、六份JSON/115 Prompt和memory policy hash未改；无真实模型/产品服务、账号、联系人或桌面访问。

该批结束时整体目标仍进行中；其后的MemoryContext/Relevance/Extraction/Freshness恢复见下节。当前原MemoryController REST/UI、watchers、完整企业managed来源/远端策略仍有缺口，不将八服务/可运行或有限差分等同完整memory子系统或全harness100%。

## Auto memory / entrypoint / relevance / extraction / freshness批次

固定SHA、JS UTF-16证据：MemoryContextInterceptor完整类`7167120..7175582`、MemoryRelevanceServiceImpl`9342347..9344463`、MemoryExtractionServiceImpl`9348849..9352982`、StopHook`9354814..9355075`、FreshnessPostToolHook`9355943..9356698`。五类完整移植；SDK Agent/RunContext/RunState仍引用本地0.5.2，不重写、不升级。官方[运行边界说明](https://developers.openai.com/api/docs/guides/agents/running-agents)只用于SDK边界核对，实际恢复以固化bundle及本地0.5.2代码为准，不引入当前文档的新API。

MemoryContext保留priority1150、Array/skipRun/compact gate，auto-memory默认true、typed默认true、relevance默认false、extraction默认false。disable-auto 1/0先于MEMORY_ENABLED，再settings；typed/team/relevance/extraction各自env优先与大小写/不trim行为原样保留。shouldInject按user数量1、continue/continued与首user的memory role标记判断；query在注入前提取，剥除原四类reminder/命令标签，不新增meta过滤。team身份按env→settings→Git→OS，team关闭也仍查询身份；GitUtils.getGitUserName原完整方法恢复，只读固定git config user.name、5000ms/utf-8/stdio/trim/异常undefined。

原entrypoint builder六函数（typed/search/lines/prompt及extract opener/prompt）、freshness四函数、scanner四函数完整恢复。typed先trim、200行/40000 UTF-16（虽常量名BYTES）、整行优先截断与逐字WARNING；legacy独立保持200行/40000截断、不trim空白和Current MEMORY.md段。完整policy/TYPES/WHAT_NOT/WHEN_TO_ACCESS/TRUSTING_RECALL、保存/计划/任务/历史搜索文案及extraGuidelines均保留。public buildExtractPrompt转发原同步函数，旧手写Prompt拼装不再作为生产路径；policy hash继续6d2bdeeef7bef8029396250abc25823d6db6784fe486dc6160ac35b7ba5729b0，独立于115 product prompts。

Scanner原readFileHead采用stat+createReadStream bounded byte范围/高水位、data/end/error/close/abort处理；4096头部、200条、递归.md/排除basename MEMORY.md、allSettled跳坏项/mtime排序、原metadata与manifest均恢复。memory-store公共接口转发原scanner。scan预先abort会返回空列表，但直接readFileHead无precheck会正常读取；没有替原代码补更“合理”的即时取消/额外大小限制。目录错误除ENOENT仍原warn，freshness以floor/clamp算天，<=1天不提示，>=2天原逐字提醒。

Relevance先按surfaced排除，再独立session调用memorySelector；原Query/manifest/recent tools Prompt、贪婪JSON正则、selected_memories数组/有效文件名过滤、重复项保留和错误/abort返回空保持。MemoryContext在读文件前即加入surfaced，读取失败也不回滚；每个文件含age/body/旧memory caveat。选取前AGENT_STARTED与50ms不可取消等待保留；parent abort后skipRun、原incomplete Interrupted by user history、forceIdle(memory-aborted-by-user)，不额外启动主模型。SDK实测后续回合不重复选择已surfaced路径。

Extraction旧手写核心已由完整原类替换；旧构造器facade继承原类，只保留extract/shouldExtract两legacy embedding辅助，不是doExtract生产路径。保留单例inProgress/游标、两条新user/assistant门槛、原assistant.content工具写入形态检查（不自行扩大为所有SDK flat call）、工具筛选五名、共享modelSettings、独立conversationRequestId、RunContext浅拷贝、RunState maxTurns5、runnerProvider与runWithoutHistory文本流消费、permission/purpose恢复/成功advanceCursor/失败仅日志。预先已abort的父signal不补主动检查、成功后原listener不主动移除等边界未改写。bypassPermissions不等于目录沙箱，Prompt的只写memory约束并非强制文件策略。

StopHook event Stop/Low800按source仅非TTY等待；FreshnessHook PostToolUse/Normal500/matcher Read，只检查原project memory字符串prefix（不是安全path验证），stat失败debug退出。原追加内容经宿主ToolManager成功truthy结果边界包装为tool-hint，再执行条件规则，原字符串/非字符串转换保留。完整通用Hook执行器、PostToolUse配置/异步/失败编排并未因此完成，不能把两个原Hook类当成完整HookManager。

九个原Path helper、两个MessageUtils方法和Git helper恢复。独立host默认project memory/stateDir/memory、transcript/stateDir/sessions，导出原layout helper供显式宿主使用；team按原cwd/.codebuddy/memories/@id。project目录由本宿主bootstrap创建，team目录准备/企业managed/产品Startup仍未据此证明。Git cwd绑定CwdService，提供显式Git/OS/FS/env/clock/UUID/timer/path overrides；不读取已安装WorkBuddy登录态。CLI model现进入settings model适配，避免相关性lite在自定义端点错误退回捕获产品模型；SDK实测selector与主回合都用显式外部model。runner scope和close清剩余aux session observers/timers为明确ownership adapter，不改变原类分支。

`verify:auto-memory`597次固定SHA比较、54个完整方法/函数AST（另constructor字段），覆盖五类、完整builders/scanner/freshness、Path/Message/Git helper，所有内嵌Prompt/regex/flags/branch控制流。VM仅给受控memory I/O/SDK依赖，未启动原应用；SDK0.5.2作为明确外部依赖。差分AST索引已缓存，避免每个fixture重复遍历全包；不是通过缩小行为矩阵来加速。有限比较不等于597个独立业务场景，不覆盖所有时钟/并发/文件故障或平台。

新增23项专项：entrypoint/flags/team/query、scanner4096/200/pre-abort、freshness/Git、选择重复/未知/abort/unreadable状态、原RunState5与失败恢复、StopTTY；真实SDK验证entrypoint新session重载、selector→主请求→后续去重、CLI model、Read旧memory嵌套提示、实际extraction Write且主历史/文本无污染、选取中取消；CLI经loopback SSE验证entrypoint。最新565项全量测试、487项编译JS smoke、32个源码差分、check/build/config及编译CLI help通过。原SDK/OpenAI锁定版本、六份JSON/115 Prompt/policy hash未改，无真实模型/产品服务、联系人或桌面操作；Git身份只执行原只读命令，新专项可注入假身份。

整体目标继续进行中。下一阶段优先通用Hook配置/匹配/命令执行器与完整HookManager，再推进ProductManager/插件刷新编排。MemoryController REST/UI、watchers、完整managed/remote policy来源、全部Startup/权限/输出视图与遥测仍有缺口，不将本批核心链、可编译启动或有限差分视为整个harness100%还原。

## 通用 Hook 核心执行与协议批次

新增四个完整原类：HookExecutorImpl `8446794..8452932`、HookManagerImpl `8454850..8469415`、PromptHookServiceImpl `8474519..8476927`、ScopedHookRegistryImpl `8477754..8478813`。位移均为固定bundle的UTF-16索引。仅增加TS注解和显式DI/I/O映射；不用原bundle整体作运行时。保留constructor WeakSet/Map字段，未把前一批两个memory内部Hook当成完整HookManager。

命令部分恢复shell/直接PowerShell选择、六个Windows路径转换、NODE_OPTIONS清空、JSON stdin去session、stdout/stderr/exit/error/EPIPE、60s默认timeout、TERM/延迟KILL及原killed guard、首JSON对象分块/字符串转义async probe、4096阈值、asyncTimeout毫秒和detach。保留原缺陷：asyncRewake虽透传但不消费；不支持通用AbortSignal；非零exit（除2和null）可能覆盖JSON deny为allowed；循环输入先在debug JSON序列化抛错；原延迟kill guard不保证杀掉忽略TERM的进程，detach timer不随正常退出自动清理。独立host close另行回收本次记录的child/timer，不宣称进程树沙箱。

Manager恢复input processors、internal/local并发及SDK后置执行、三种matcher各自fallback、settings/plugin/scoped来源、if表达式语法/委托、来源/type/shell/if去重、WeakSet once、plugin env三套alias、service proxy URL准备、HTTP header允许变量插值及超时/异常协议。聚合按原浅合并，additionalContext后者覆盖而非拼接；只拼字符串continuation message，保留completionPromise barrier；SDK updatedInput与command modifiedInput不同字段保留。HTTP非2xx/异常放行、计时不覆盖body、opts.signal未消费；allowedEnvVars不是command环境隔离。只接受可信显式Hook，不连接真实产品/读取安装凭证。

Prompt恢复全部参数JSON、首个$ARGUMENTS替换、JSON/markdown/正文fallback解析、空/失败响应放行与空object/array拒绝；Stop/SubagentStop历史评估用真实SDK0.5.2 Agent clone、RunState(maxTurns=1)、父RunContext复用、history修复/custom过滤、stream消费和purpose finally恢复。options.timeout未在原PromptService内落实，不补造超时机制。普通prompt/agent类型按原都调用同一Prompt服务；impossible/onResult/continueOnBlock/preventContinuation按原处理。115份product Prompt、memory policy及SDK/OpenAI锁定版本不改。OpenAI Docs只核对状态/stream边界，不替换固定版本行为。

Registry按全局scope注册，缺sourceId打stamp、agent Stop改SubagentStop、合并已有事件、不按当前session自动隔离；与旧按session查询的兼容facade明确分离。恢复28个HookEvent、NotificationType、HookPriority含数字反向映射，以及全部EVENTS_WITHOUT_MATCHER/事件输入输出说明/标题；说明中的productName由显式metadata工厂注入。InputItemUtils.createHookMessage `13266826..13267176`也完整对照。

`createGenericHookHost`要求显式workDir、shell选择和permissionUtils底层谓词，可注入settings/plugins/sdk callbacks/endpoint/internal hooks/input processors及Prompt模型依赖。默认不扫描安装配置、插件或账号；无产品endpoint不伪造服务代理。Host目前是可使用的显式嵌入入口，尚未默认替换createHarness中的session/tool/structured/memory Hook分派；shell发现、完整PermissionUtils及产品service proxy controller不在本批完成范围。

验证：52个完整方法/函数AST、constructor原字段、三项事件metadata完整AST、事件/通知/priority协议，1,077次固定SHA比较。新增26项专项，真实自有node子进程读取stdin/修改参数、detach/关闭、loopback HTTP和真实SDK历史RunState都通过；其余Win/timeout/错误/并发分支使用fake I/O/clock，未运行真实Windows/产品命令或真实模型。

最新门槛：591项全量测试、513项编译JS smoke、33个源码差分脚本、check/build/config与编译CLI help通过。仍不声称100%还原；下一批优先完整SessionHookManager/ToolHookManager、权限底层/平台shell发现、watchPaths/服务代理及默认生命周期接线，之后继续ProductManager/插件刷新编排。

## Session / Tool Hook 生命周期与默认接线批次

完整SessionHookManagerImpl `11017694..11034969`和ToolHookManagerImpl `11942842..11947638`已按原控制流移植；ToolManager `11657350..11681925`中的getPlainToolInput/executeToolWithHooks/extractRawResponse三个完整方法单独恢复为NativeToolExecutionPipeline。纠正检索歧义：`9186841..9198615`属于MCP ServerManager，不能将其记作ToolHookManager。位移均为固定bundle UTF-16索引。

默认createHarness改用createHookLifecycleHost。SessionStart/idle Notification复用既有barrier；UserPromptSubmit按原addHistory的真实/noncompact/root条件，在输入处理和发布后、append前派发。Stop主完成/失败/取消由独立宿主调用完整原方法，消费continuation并传stop_hook_active；structuredStart/Stop、memory Stop/Freshness统一provider排序，删除旧的分别执行，避免重复提取和反馈。TaskCreated/Completed、SubagentStart/Stop/TeammateIdle、compact前后、WorktreeCreate/Remove、InstructionsLoaded和图片HookInputProcessor均已接通。旧SessionHookManager/scoped兼容facade仍保留，但不再用于默认运行路径。

Stop只在completed且未abort时接续；preventContinuation、显式continueRequest和blocking feedback按原优先级。正常仲裁在没有continuation时发FinalStop，Stop自身异常转StopFailure。SessionStart忽略blocking，保存additionalContext/initialUserMessage并设置watchPaths；PreCompact仅返回allowed且未suppress的stdout，不补造额外阻断策略。完整产品SessionStart自动首消息、原SessionManager onResult的SDK interrupted/non-default/headless分支仍待移植，不能把独立main prompt的接线视为全部原结果生命周期。

工具wrapper保留callId pre-cache消费、value包装和输入浅合并、IDE变换/sandboxWrite/backup/支付/检查点依赖边界、truthy成功后PostToolUse及条件规则、失败PostToolUseFailure和Error hint追加。PreToolUse拒绝在execution try之外，不额外发Failure；updatedInput与command modifiedInput仍不混同。完整ToolHookManager恢复event-name判断、MCP专属updatedOutput、response_flag/thrown错误、持续时间、registered error resolver/原错误分类和Galileo调用参数。工具宿主仍保留显式审批guard；完整原ToolPermissionService/SDK暂停前PreToolUse缓存、PermissionRequest/Denied自动分派、MCP输出替换/elicitation、IDE/fileTrack/checkpoint/payment服务与遥测transport并未因此完成，未配置依赖明确为空adapter。

补齐原watchPaths `11015934..11016717`、last assistant helper `11017263..11017687`、trigger/session ID helper、可见消息/XML处理、完整ToolErrorCode/PermissionDeniedError、八个文件/命令匹配方法、七个shell发现函数和完整WindowsBashUtils。micromatch/which的15个factory原文保留，不猜版本升级。命令解析服务可显式注入，默认沿源码regex fallback；它不是安全分类器。watchPaths沿原fs.watch/递归/rename add-or-unlink，不加debounce或路径沙箱；与memory规则热加载watcher是不同服务。宿主close另行清本次拥有的watchers/children/timers，不改原方法逻辑。

验证：70个完整方法/函数AST、884次固定SHA比较，覆盖两个完整类、三个工具wrapper、输入/XML边界、权限/平台helper、错误码和15个factory原文。新增28项专项：默认真实SDK Hook上下文/阻断/Stop续跑/工具改写/失败回注、Task/compact/子Agent事件、真实自有node命令和once跨session、Prompt evaluator历史隔离、真实自有fs.watch与结束清理。Windows/故障/计时分支使用fake I/O；无真实产品账号/模型服务、联系人或桌面操作。

最新门槛：619项全量测试、541项最新编译JS smoke、34个源码差分、check/build/config及编译CLI help全部通过；六份原JSON、115 Prompt、memory policy和SDK/OpenAI固定版本不变。OpenAI Docs只核对审批/状态边界，不按现行文档升级SDK。整体目标继续进行，下一批优先原onResult/审批与Hook服务代理，再继续ProductManager/插件热刷新。

## Axonfire 仓库分层与本地 Web 宿主批次

按用户要求建立 axonfire-harness 仓库；还原基线保留为本地/远端历史提交。参照 deepseek-harness 的 apps/packages/docs 分层，但未导入其 Cordis/插件架构。原 src/config/test/scripts/tsconfig 整体移至 packages/harness，SDK 与模型依赖版本、原配置和 prompt 不变。原报告移至 docs/reconstruction.md 与本文件；历史根级路径按 packages/harness 映射。

新增 apps/cli 统一启动器、apps/web 本地工作台、npm workspaces、.env.example、根级全量差分入口和 CI 定义。新 Web 宿主明确不属于原版 UI 或原产品 Gateway：使用同一 createHarness 与真实 Agents SDK，支持流式文本、会话列表/恢复、上下文压缩、逐次工具审批、AskUserQuestion 和取消。离线 demo 注入固定模型，不调用远端服务或工具；不把它记作真实供应商验证。

Web 固定监听 127.0.0.1，校验 Host/Origin/CSRF，限制请求体，审批超时/取消/断连不会自动允许，单回合运行槽避免共享状态并发冲突；模型密钥不发送给浏览器，不序列化可能包含认证头的上游异常。不是 OS 沙箱、多用户服务或公网部署方案。

迁移后619项核心回归、541项编译 smoke、34组样本差分以及原配置哈希门槛通过。新增10项宿主测试，包括真实SDK通过Web调用Write的允许与拒绝、恢复与压缩、取消/断连、问答、输入和跨源校验。浏览器离线演示已实际运行并保存截图。样本差分的默认输入不再绑定本机目录，须显式提供原bundle路径或 WORKBUDDY_BUNDLE；原安装包/完整bundle不随仓库发布。

下一批核心还原顺序保持不变：原 SessionManager onResult/onResultError/SDK interruption、审批缓存与 ToolPermissionService / Hook proxy，然后 ProductManager/插件刷新。新的使用界面不代表这些原产品边界已完成。

## InterruptionService 完整结果分派批次

先纠正归属：此前报告将 Stop 完成/错误的剩余分派统称为 SessionManager onResult/onResultError；固定样本中 `11047102..11089570` 的拥有者实际上是 InterruptionService。核心方法为完整 `waitFor` (`11062476..11077211`)，不是另一个尚未找到的同名 SessionManager 方法。原 SessionManager 的 stream/history/gate 已在既有 SessionResultLifecycle 内恢复，两条订阅路径应分别保留。

新增 `native-interruption-result-dispatcher.ts`，直接移植完整 waitFor、continueAgentWithMessage、startupProfiler getter、sanitizeToolNotFoundMessage 及四个 retry helper。方法体仅把结果订阅替换为显式所有权桥接；容器查找、时钟、调度器和依赖工具在工厂闭包中注入，不拆分或重排原 catch/finally 分支。新入口默认接入 createHarness，移除 Root prompt 里另行执行 Stop、拼接续跑和错误补发 Stop 的代码。

保留以下源码行为：默认 Agent 完成传 `stopReason: completed`，消费 session hookContexts 中一次性的 stopHookActive，续跑通过 setImmediate 调度；非默认 Agent 的 Stop 不传 options，丢弃 continuation；child 不执行 root Stop。headless deferred 可能在分支和 finally 重复 resolve，并非改造成一次性事件。结果中断标志在分派前打 stamp；最终 agent_end 只在 model_done/idle 发出，避免覆盖新 run。silentAbort 将没有结果的 call 标 incomplete、清 silentAbort 并不执行 failed Stop。完整错误分支保留 pending call 回填、网络/首 token/流超时/模型错误的优先顺序、次数上限、提示原文、队列开关与 finally 的 resultAbortSignalMap 删除。

完整 continueAgentWithMessage 保留 5 秒 idle wait、前后两次 abort 检查和源码的计时器行为：异步 idle 变化回调不清 timeout，只有立即 idle 检查清除；宿主关闭时另外清理本次拥有的剩余计时器。独立宿主在调用服务或 Stop 前等待自己的历史消费者刷盘，并跟踪 setImmediate 续跑的发布完成，使 CLI/Web 不先返回旧回合结果；这些显式桥接不计作原产品逻辑或 SDK 重写。

验证：8 个完整方法 AST、902 组固定 SHA 行为差分，覆盖默认/非默认/缺少 lastAgent、child/abort/interruption、Stop continuation/active/异常、final/非 final、队列开关，以及网络/模型/语法/包装错误/鉴权/流超时和 silentAbort。新增12项专项，包括真实SDK终止失败/取消恰好一次 Stop、网络重试后唯一 completed Stop、绕过 root prompt 的非默认 Agent 完成。既有默认 Stop 续跑、真实 SDK 工具审批与子 Agent 回归继续保留。

边界仍明确：本批恢复的是完整结果分派，不是完整 InterruptionService 类。审批队列、handleInterruptions 的 ACP/SDK interrupt 拒绝路径、requestSdkPermission/PermissionRequest callbacks、完整 ToolPermissionService、PreToolUse 审批缓存和 MCP Hook proxy 仍待进一步移植；此前的兼容审批宿主仍提供可用功能，不能把它等同于原实现。ProductManager/插件热刷新随后推进。OpenAI Docs 仅核对审批应从 RunState 恢复的边界，继续锁定本地 SDK 0.5.2。

REA 对本次选定单 bundle 的受限重分析在 45 秒预算内超时；不把失败输出视为新的证据或提高覆盖率。继续使用此前 REA 证据链、固定 SHA 校验、原方法 AST 与原样本 VM 差分。原安装包、完整 bundle、超时分析日志均不进入发布仓库。

本批门槛：631项核心测试、10项Web宿主测试、553项编译JS smoke、35组样本差分、check/build/config和CLI/Web实际启动全部通过。六份配置JSON、115个prompt、memory policy及SDK依赖锁定版本保持不变，发布前基本凭据/运行记录扫描未发现命中。目标仍在进行，不宣称整个harness已100%恢复。

下一批已定位的原类：ToolPermissionService `11948949..11968077`，包含 checkPermission/doCheckPermission/needsApproval、PermissionRequest/Denied、executeAndCachePreToolUseHooks/cachePreToolUseResult、策略/规则/危险命令与更新持久化等27个方法（含constructor）；另一个 preToolUseHookResults.set 位于 DeferExecute 包装 `12008364..12018235`，不可仅恢复前者便认为缓存链路完整。随后对接完整 handleInterruptions / requestSdkPermission，再继续 MCP Hook proxy 与 ProductManager/插件热刷新。这些定位本身不计为已恢复代码。

## 完整 ToolPermissionService / 规则 / 风险与审批缓存批次

完整 ToolPermissionService `11948949..11968077`（27方法含constructor）、完整 PermissionUtils `13340331..13350579`（31方法）、完整 CommandUtils 与模块级辅助函数/正则表 `13050284..13060942`，以及 Default/AcceptEdits/Plan/Bypass/Work/Delegate/DontAsk/Auto 八个原策略均已直接移植。另恢复 BaseTool 与13种具体工具的权限参数/类型/别名元数据、完整危险allow规则过滤器、模块75753的host识别缓存。方法体只加TS类型，实例字段/容器/时钟/进程和宿主服务在外层工厂注入；没有按测试结果重写权限优先级。

保留原先后顺序：deny → 可信allow → 非print命令安全检查 → ask规则 → bypass可用性与危险命令判断 → 非可信allow → 非MCP策略 → 不可提示时deny → 默认ask。可信allow本身可越过命令安全检查，未信任目录的project/local allow不能；Auto过滤危险allow。规则deny只需匹配一个子命令，命令allow必须所有子命令都匹配；重定向不按普通前缀allow。MCP权限按精确名/server/server wildcard处理，不借用builtin aliases。完整doCheckPermission和mode finalization的DontAsk、Auto降级/熔断/超长/denialLimit/headless abort分支均在本批范围。

needsApproval完整恢复PreToolUse、PermissionRequest/Denied分派、deny不要求SDK审批但缓存拒绝的协议、回调updatedInput、无callId时抛原PermissionDeniedError，以及异常回退ask。原DeferExecute构造器的整个审批arrow和defaultNeedsApproval单独移植为native-defer-approval：包装器deny写缓存、mandatory判断、intrinsic true、MCP/bare名和target参数解析顺序均保留；其余Defer执行/MCP转换仍沿既有实现，不能据此认为整个原类都已替换。

真实SDK0.5.2验证发现needsApproval在首次暂停和state恢复时均会重新运行，因此PreToolUse可执行两次并覆盖同一个callId缓存，执行包装只消费最后一次缓存。本批保留该行为，不增加源码不存在的“已有缓存则跳过”。测试分别证明直接Write、cached deny不触达文件系统、PermissionRequest改写、Defer外层deny不执行target Pre以及已索引Defer builtin审批后的实际写入。所有写入都在自有临时目录，危险命令只作为分类器字符串输入，从未执行。

宿主入口：createHarness返回permissions（service/permissionUtils/strategies/commands/pathUtils与initializeContext），`nativePermissions: true`显式连接BaseTool默认needsApproval和Defer SDK callback；permissionHost可注入scoped settings、auto classifier、sandbox配置/信任/Hook adapter。为避免把未恢复的审批控制器伪装成原实现，该SDK路径暂不默认启用。现有默认CLI/Web审批仍可用；独立执行guard继续保留，所以原PermissionRequest allow不自动撤销宿主额外审批。默认scoped settings更新保存在宿主内存中，不声称已恢复原SettingsManager的磁盘持久化；Auto backend未配置时明确不可用，不调用真实模型或伪造分类结果。命令策略是否为WorkBuddy Desktop按原CODEBUDDY_HOST/argv缓存检测，不能因分析对象是桌面应用便对独立CLI硬编码true。

验证：118个完整方法/函数AST、18张原正则/常量表AST、1,920组原样本行为比较；新增21项专项包含5项实际SDK直接/Defer运行验证与权限别名的跨宿主隔离。配置中的115个prompt、原JSON和SDK/OpenAI锁定版本不变。OpenAI Docs仅用于核对审批从RunState恢复的边界，SDK重复回调事实以锁定版本源码与实际测试为准。

下一批优先完整InterruptionService审批控制器（approve/reject/queue/handleInterruptions/requestSdkPermission/SDK hooks与denials），对齐默认SDK接线与兼容审批宿主，再补MCP Hook proxy、AutoMode classifier backend、SettingsManager持久化、ProductManager/插件刷新；本批未把这些依赖标成完成。

最新门槛：652项核心测试、10项Web宿主测试、574项编译JS smoke、36组样本差分、check/build/config和CLI/Web实际启动全部通过。发布前基本凭据/运行记录扫描未发现命中，未升级任何SDK或模型依赖。整体目标继续进行。

## 完整 InterruptionService 审批控制器批次

`native-interruption-service.ts`直接移植原类 `11047102..11089570` 的完整constructor及其余32个成员，复用此前完整结果分派的外部依赖绑定，不再用手写兼容handleInterruptions代表原实现。另直接移植ToolAlwaysApprovalService `11939394..11942161`（11成员）、BackgroundTaskToolApprovalService `6987547..6988678`（4成员）、原Deferred/CustomError/ErrorUtil、四个审批异常类和两个trace取消helper。完整class/member AST去除TS注解后与固定SHA样本比较；仅waitFor的结果订阅改为显式所有权桥接，原容器、时钟、诊断和客户端依赖在工厂闭包注入。

原approve的always分支委派helper，由helper检查风险、记录签名、applyUpdate后批准state，控制器不额外强造state.approve。Session缓存跨工具共享同一session Set的原结构保留；child审批可同步main。危险Bash和ExitPlanMode不加入always缓存，但本次人工同意仍批准。后台任务原approve helper与handle各调用一次state.approve，保留重复调用，不按“理想实现”去重。

队列保留对象身份键、main/child/team缓存、sourceSession fallback、sandbox全局pending占用与orphan迁移、head元数据、广播参数和清理顺序。只有sandbox出队/取消触发原跨队列提升，普通队列不补造相同行为。原sandbox批准不额外发permissionResolved；拒绝与cancel的广播仍按原分支。控制器原方法返回undefined，兼容facade在外层转换为已有boolean/count接口。

完整handle保留后台/direct-approve mode ceiling、FullAccess/子AcceptEdits/Bypass的优先级、危险命令与mandatory Defer例外、always缓存和同工具pending检查、workflow源码预载、200ms UI延迟、pre-hook reason回填、Notification best-effort、local/channel race、deny_and_exit_plan模式恢复、abort与compaction区别。CLI普通拒绝silentAbort+abort+agent_end并异步发送工具特有skipRun结果；ACP或SDK interrupt拒绝中止且root发interrupted Stop，不进行拒绝续跑。compaction catch只break，不设置普通拒绝标志，所以末尾仍调用state continuation，这是固定样本行为，未擅自“修正”。

SDK请求保留缺失callId直接approve、参数JSON解析失败转reject、PermissionRequest回调顺序、空transcript_path/cwd/callId和timeout秒转毫秒（默认60s）、单callback异常仅warn并继续、result-owned abort signal、updatedInput浅合并、精确permissionDenials字段以及SdkPermissionDeniedError.interrupt。缺失callId自动approve属于原行为，不代表宿主会绕过独立执行guard。外部SDK客户端/Hook callback transport没有伪造实现；默认不可用依赖明确拒绝/为空回调集合。mandatory target判断仍为显式adapter，未冒充完整ModelUtils支付/高额度服务。

嵌入API新增`nativeApprovals: true`与`approvalController`，可和`nativePermissions: true`组合。原类通过InterruptionService facade接入；独立宿主在class外等待自己的历史消费者，并跟踪原fire-and-forget service.run和setImmediate续跑，使prompt不会提前返回旧结果。Deferred原constructor不改；外部所有权子类只观察200ms UI窗口内可能发生的早期拒绝，避免Node未处理拒绝。skipRun结果落盘后关闭宿主gate，不强迫再生成一次模型结果。宿主close清理本次拥有的订阅和计时器。

stream-json且非ACP时，不与本地approveTool同时竞争，沿原SDK客户端路径；显式人工SDK客户端allowed后登记宿主guard授权，拒绝不登记，输入改写真正传到工具。Hook PermissionRequest allow与SDK人工客户端同意仍是不同来源，前者不会隐式撤销独立guard。CLI/Web默认保留兼容控制器，两项native选项均未默认启用；不能据此宣称所有入口已经统一为原产品协议。

验证：58处完整成员/helper AST、1,100组固定SHA行为比较，包含完整控制器waitFor桥接、模式/child/后台/六种决策、危险/mandatory工具、SDK/ACP/缺ID/回调故障/interrupt矩阵、channel/ceiling/workflow、跨会话sandbox与普通队列。新增20项专项，其中6项使用实际SDK和自有临时目录，覆盖批准暂停恢复/实际Write、拒绝skipRun历史、Defer路由、SDK客户端真实输入改写、interrupt拒绝和取消前无文件副作用。危险命令仅为分类器字符串，不执行；没有访问真实产品账户、联系人、远端模型或桌面。

本批门槛：672项核心测试、10项Web宿主测试、594项最新编译JS smoke、37组源码差分、check/build/config和实际CLI/Web launcher验证通过。六份原JSON、115个prompt、memory policy与固定SDK依赖保持不变。OpenAI Docs只用于核对SDK审批状态边界，不按现行文档替换锁定版本。

下一批优先SDK PermissionClient / SDKHooksManager transport与MCP Hook proxy，随后统一默认审批接线，再推进AutoMode classifier backend、SettingsManager磁盘持久化及ProductManager/插件刷新。完整控制器方法已恢复不等于其所有外部产品服务完成，整体目标继续进行。

## SDK 控制客户端、JSONL 与初始化协议批次

直接移植12个完整原类：StdoutWriter `7794169..7794674`、SdkPermissionClientImpl `7795251..7796834`、SdkHooksManagerImpl `7797641..7800832`、SdkMcpMessageClientImpl `7801845..7803380`、SdkElicitationClientImpl `7804207..7805343`、ControlSignalHandlerImpl `7806184..7808272`、SdkInitializeStateServiceImpl `7810342..7810807`、InitializeHandler `7811554..7814144`、SetPermissionMode/GetAvailableModes/GetAvailableModels/SetModel四个handler。补原control predicates、HOOK_EVENTS/60秒请求配置/产品环境值、Deferred与createAbortController无限监听helper，以及SessionManager `10977093..10977351` 的四个override map方法。class constructor和方法体仅加TS注解；stdout、clock、timers、Deferred所有权与容器服务在外层注入，不改原JSON协议字段。

权限请求使用perm_、默认不创建timeout，仅显式正timeout生效；can_use_tool保留agent_id/permission_suggestions/blocked_path/decision_reason的truthy展开。成功返回allowed默认false及reason/interrupt/updatedInput；错误、单次取消/全取消按原错误文本清理Map和timer。Hook请求使用hook_、默认60秒，executeHooks按matcher构造所有callback并Promise.allSettled，聚合保留deny > ask > allow、system/additionalContext顺序和最后停止原因。即使已有deny，后续allow的updatedInput仍可复制进结果；未擅自删除该字段。clearHooks清请求但不清capabilities，setHooks不取消既有pending，invalid regex回退精确文本。

MCP message客户端使用mcp_，携带server_name/message，成功必须有truthy mcp_response；abort/listener cleanup/cancel保留原路径。elicitation使用elic_，create可取消，complete发送control_notification(channel:elicitation)。这两个客户端是SDK控制通道的一端，不等于已恢复SdkMcpServer/transport或MCP Hook proxy。

ControlSignalHandler按三种消息类型和四种response ID前缀路由，request按subtype provider查找；保留60秒超时、cancel abort、handler失败回复error、未知subtype错误和finally清理。StdoutWriter按原JSON.stringify+换行、write(false)后drain、批量flush及部分splice保留背压行为，没有重排或重复输出。InitializeState仅由markSynced推进fingerprint；clear本身不推进，因而可能连续返回true，这是原行为。

Initialize完整保留环境/endpoint优先级、Hook与capabilities配置、elicitation form标记、MCP注册与SDK overrides并行、ProductManager.sync(true)/失败返回/重建屏障、命令/样式/模型/原账号字段映射。SetPermissionMode原支持六种，而availableModes仍只列四种，文案不替换；Plan初始化计划路径；当前session不匹配拒绝，尚无session但给ID时存override。SetModel同时更新requestOptions/options/CLI settings/override；GetAvailableModels按原排除url/apiKey后返回rawModels。未新增原类不存在的“全字段脱敏”行为，也未接触真实账号。

新增createSdkControlHost，返回原clients/control/init state，receive/receiveLine处理调用方提供的控制对象/完整单行。所有输出只写显式提供的Writable式对象，不自动绑定stdin。外层所有权观察原unused Deferred拒绝、close清pending/timers/drain listeners、禁止关闭后再发新请求，不结束调用方stream。原类sendRequest抛错的清理行为没有修改；host shutdown另行清本次拥有的状态。既有class原方法与host adapter分开标注。

createHarness的显式sdkControl默认启用nativePermissions/nativeApprovals，并连接同一原SDK hooks manager与权限客户端。新会话inputFormat:stream-json、不竞争本地UI；SDK允许后登记独立guard授权，真实input rewrite通过工具执行验证。断连取消请求后不再启动后续模型run，harness.close也会关闭其拥有的SDK控制组件。初始化基础metadata、available modes/models、模式/模型更新已注册；默认account:null，绝不把模型API key映射成产品账号。动态system/append/agents覆盖在ProductManager adapter缺失时明确错误，环境切换与SDK MCP创建依赖同样不可伪装成功，原完整handler仍可通过显式initializeDependencies组合验证。

验证：75处完整方法/函数AST、3组常量表检查、794组固定SHA行为比较。覆盖四类客户端请求/错误/缺payload/取消/超时/abort与晚到响应、Hook顺序/匹配/聚合、控制超时/取消/provider失败、initialize环境/账号/同步失败/重建、六种模式/缺session/mismatch/model更新矩阵。新增21项专项，其中6项经真实SDK，验证JSONL人工批准与实际Write改写、interrupt拒绝无文件副作用、Pre两次/Post/Stop回调、initialize/modes/model状态、真正pending权限请求的断连清理与不续发模型。其余使用自有临时目录、假时钟/消息/账户/输出，不访问安装应用令牌、真实模型或联系人。

本批门槛：693项核心测试、10项Web宿主测试、615项编译JS smoke、38组差分、check/build/config和实际CLI/Web启动均通过。固定SDK/OpenAI依赖、六份配置JSON、115个prompt与memory policy不变。OpenAI Docs仅核对SDK生命周期边界，不用当前文档改写锁定0.5.2的运行行为。

剩余边界：普通CLI/Web默认仍为兼容审批宿主；SDK控制组件不等于原stdin/headless startup或鉴权命令全集。完整McpServerManager `9186841..9198615` 的server/tool/Hook proxy、SdkMcpServer与重写transport已定位但本批没有把定位计为实现；下一批优先恢复其完整依赖链。之后继续ProductManager动态初始化/插件刷新、Auto classifier backend、SettingsManager磁盘持久化，并统一原policy allow到执行guard的默认语义。整体目标保持进行中，不以当前门槛代替最终完成标准。

## MCP 原生 proxy、transport 与 SDK server 批次

本批延续固定5.3.14样本和REA证据，不执行整个应用bootstrap。以下均为bundle UTF-16索引，不是字节偏移；类方法仅加TS注解与外层DI，不将新宿主逻辑记为原源码。

- stdio两类 `9163484..9167354`、`9167384..9168040`；SSE两类 `9168078..9172056`、`9172084..9172734`；HTTP两类 `9172783..9176847`、`9176886..9177569`。
- SdkMcpTransport `9177633..9178529`、SdkMcpServer `9179086..9185768`，McpServerManager `9186841..9198615`，McpTransportManager `9284064..9285512`。
- 完整McpSubagentToolManager `9288945..9289339`、McpUtils `13306418..13309176`；结果处理13函数 `9153118..9157667`，UI三函数 `9306064..9307806`，另恢复span/header/progress/sideband/channel/配置指纹helper。原JSONC module52537 factory逐字保留，不猜替代npm parser版本。

原server/tool proxy包含schema归一化、工具前缀/transparent aliases/builtin passthrough、defer overlay和子Agent白名单、needsApproval、PreToolUse改写/拒绝/错误best-effort、PostToolUse与payment替换顺序、非枚举is_error/_meta、sideband与UI广播。保留原空builtin分支，不将其误改成缺失实现；原SDK server.callTool只接受两参数、不转发第三参数progress/meta，也不按新版SDK行为“修正”。

remote override恢复listTools缓存/30秒失败cooldown、原toolFilter、call timeout/signal/progress、模型X-Model-ID的AsyncLocal隔离、错误清理和close。McpUtils默认tool timeout为原值100,000,000ms，不能误写成100秒；配置写入保留原atomic/symlink/模式/fallback。结果保留原4*token字符预算、image不计数且保留、audio/resource/link截断、大结果父/子Agent目录与完整读取提示。channel helper保持原SDK/generic的不同bypass分支；未用真实联系人验证。

`native-mcp-host` 是明确新增的拥有者：只连接显式配置，注入DI、管理timer/subscription、等待创建及关闭，包括原disposeUnderlying已移除但仍异步关闭的旧连接。重复initialize复用相同活跃transport，不重复SDK握手。stdio依赖调用方Hook endpoint；默认抛错。OAuth默认不伪造登录，产品channel security/支付/遥测/ACP传输仍需显式adapter。

两处跨模块接线由真实SDK测试发现并对照源码修复。其一，完整顶层McpManager（尚未移植）在`9201138..9223000`持有稳定connectedServersCache并splice更新，而AgentManager.refreshAgentTools不会替换mcpServers；独立registry现遵循相同live-array契约，初始化后添加和删除工具均可见。其二，样本SDK mcpToFunctionTool会转发needsApproval，但npm固定0.5.2未转发。AgentFactory仅在安装SDK转换后补这一descriptor字段，保留SDK依赖、转换器和缓存，不修改node_modules/不vendor SDK源码。允许/拒绝实际调用真实SDK验证，拒绝时无底层tools/call。

嵌入API提供`nativeMcp`、`connectNativeMcp`与`nativeMcp.delete/close`；`sdkControl`默认接入同一宿主，原initialize可添加SDK MCP server。普通CLI/Web不新增假称原版的配置flags；默认兼容审批宿主不变。独立MCP依赖按样本固定别名`mcp-sdk-native = npm:@modelcontextprotocol/sdk@1.24.3`，此前lock中的已有包版本未变，OpenAI SDK/OpenAI版本不变。此次安装audit为16项（9 moderate / 7 high），未做改变还原行为的强制升级。

`verify:mcp-native`核对12个完整类的全部成员与34个helper，共157处AST，另逐字核对JSONC factory；752次差分为400个proxy矩阵、64个filter/defer矩阵和288个大结果比较，使用隔离VM与fake I/O。McpUtils/UI等完整类/函数主要由AST覆盖，不把752次比较夸大成所有方法全行为状态空间。30项专项覆盖原hook/alias/meta/whitelist、JSONC自有临时文件、结果落盘、transport abort/cooldown/progress/并发header、稳定proxy/cache、关闭屏障；真实SDK经JSONL MCP allow/deny/重复initialize，及真实stdio子进程、loopback HTTP/SSE和完整harness审批/执行/删除均通过。未用真实账号、产品服务或远端模型。

本批门槛：723核心测试、10Web宿主测试、645最新编译JS smoke、39组样本差分、check/build/config、CLI/Web实际启动全部通过。六份JSON/115 Prompt与memory policy哈希保持不变；OpenAI Docs仅辅助核对MCP集成边界，不以现行文档覆盖锁定SDK行为。

下一批优先完整顶层McpManager配置来源/代次reconcile/权限/索引与热刷新，之后ProductManager动态初始化、SDK输入/鉴权与Hook服务端、Auto backend和SettingsManager持久化。完整ServerManager不等于完整产品McpManager；整体目标继续进行，不宣称100%完成。

## 顶层 MCP 配置、代次投影与热刷新批次

本批保持固定样本SHA、REA证据和SDK版本，不执行原应用bootstrap。完整移植14个原类，以下仍为UTF-16索引：McpManager `9201138..9223000`（constructor及48个方法），McpConfigManager `9227386..9235183`、McpConfigStore `9237347..9240044`、McpConnectionManager `9240751..9243796`、McpPermissionsManager `9277575..9279382`、McpToggleManager `9280501..9282018`、McpLogService `9283117..9283188`；McpServerModelImpl `9286093..9286776`、McpServerModelManager `9287338..9288224`、McpReadyService `9290013..9291502`、McpCliConfigInitializer `9292999..9293699`、McpConfigEnvExpandService `9294448..9295818`、McpConfigDiagnosticsManager `9296334..9297907`、McpPluginRegistry `9301052..9301648`。

另恢复stableConfigValue/computeProjectedConfigFingerprint `9200766..9201128`、isTransportAlreadyStartedError `9240666..9240744`、完整环境展开helper `13069545..13069734`（保留原`${UPPER_CASE:-default}` regex），PathUtils.getMcpFilePath/resolveMcpFilePath `13328983..13329658`。原module73850的scope/status/priority/默认配置/diagnostic severity/文件名/shortDescription常量与原factory导出比较；startup phase使用原mcp_config_load。ObjectUtils.copy边界保持原JSON stringify/parse语义，不以structuredClone替换。

顶层manager保留原优先级internal > sdk > dynamic > local > project > user > plugin；投影指纹包含完整归一化配置和allowed决策，稳定传输指纹不变也可触发proxy配置投影。保留desired/projected/queued revision、失败后tail恢复、并发list等待稳定尾、runtime generation、连接与索引提交屏障、旧model/orphan状态过滤、拒绝期间晚到create的二次清理，以及旧listTools/defer/index结果的丢弃和当前代索引恢复。原连接active并不自动可见；对应代次索引提交之后才splice进同一个connectedServersCache。SDK类型按原逻辑跳过defer索引。

ConfigManager保留同scope的inflight读合并、原type推断字段与typed对象透传、plugin组件合并、dynamic初始化10秒race/缓存优先、setting source过滤、filesystem/plugin失效、per-read环境展开与diagnostic去重。ConfigStore保留JSONC注释/无关字段、project-local的projects[workDir]嵌套与atomic写入。两个容易被“顺手修复”的细节现专门锁测试：文件配置delete不会自动抹掉已缓存的scope view，需要显式invalidate；read(PLUGIN)分支先于shouldLoadFromFilesystem，不能把strictDynamic误改成禁读所有特殊scope。

ConnectionManager保留同model的inflight join、不同model supersede、Unauthorized状态和already-started恢复、reconnect/disconnect分支；模型保留状态变化去重、原Emitter/随机state及scope优先级。项目配置批准先于transport创建，CLI settings覆盖project-local批准设置；toggle按原project或local作用域写disabled列表。Ready服务等待的是配置触发而非强制所有网络就绪；指定name/timeout/abort的settle等待由原manager负责。原CLI配置initializer支持inline JSON或显式文件、strict flag和once guard，但未据此宣称完整CLI parser/产品启动已恢复。

`native-mcp-projection-host` 为明确新增owned composition：注入scoped settings、插件来源、FS/home路径、clock/DI；跟踪订阅、setImmediate、inflight连接及异步清理，关闭屏障等待创建/重建与旧实例close；不修改原类决策。McpRegistry在native模式转发真实manager/ready/cache，旧compat模式保留旧settle等待行为；原生连接不再接受手工register绕过配置。root的nativeMcp默认使用同一AgentManager显式plugin来源，可单独覆盖；插件加载器和ProductManager的自动刷新事件仍未实现。

显式nativeMcp现在与sdkControl一样默认启用nativePermissions/nativeApprovals，使ToolSearch→DeferExecuteTool→MCP真正使用原权限检查与暂停/恢复。调用方仍可明确覆盖开发者开关；不能据此把关闭native后的compat路径当成完整策略。普通CLI/Web默认不变。用户/全局MCP路径默认重定向到owned state/mcp，filesystemScopes默认空，不读取安装应用配置；显式project写入仍修改调用方项目文件。原项目批准settings默认仅内存，可注入自有持久化list/set；完整SettingsManager磁盘服务仍待补。

`verify:mcp-manager`共146处完整类成员/函数/Path方法AST，另核对module常量；279次有限行为比较为168个scope/批准/defer/连接失败/禁用组合、32个项目批准决策组合、16个替换/索引刷新/toggle/删除流程、7个环境helper输入、28个strict/source/scope读取矩阵和28个remote/stdio环境展开矩阵。独立VM直接执行原类，服务/FS/clock/网络均为fake；跨realm Promise可能让独立日志交错，比较日志的值/数量而非任意调度顺序，关键提交/撤销顺序由手动gate专项验证。有限矩阵不证明全平台/并发/产品状态空间100%。

新增25项专项覆盖上述主链、同scope缓存失效/队列竞态、晚到索引/create清理、orphan状态、settle abort/timeout、JSONC真实临时文件与嵌套、env/diagnostics、toggle、CLI strict初始化、prompt title alias、OAuth接口边界和plugin registry。真实SDK两例均先验证project批准前无HTTP握手，再批准配置、索引后ToolSearch→DeferExecute→自有loopback HTTP；允许时只执行一次，拒绝时无tools/call，之后撤销配置清空连接和索引。没有真实账号、外网模型、联系人或桌面操作。

本批门槛：748核心、10Web宿主、670最新编译JS smoke、40组样本差分、check/build/config及CLI/Web实际启动通过。依赖锁、SDK/OpenAI版本、六份JSON/115 Prompt和memory policy哈希均未修改；当前旧依赖audit 16项风险未强制升级。下一批优先完整ProductManager初始化覆盖、配置/插件跨服务刷新、命令物化，再补SDK输入/鉴权/Hook服务端、Auto classifier backend与SettingsManager持久化；整体目标继续进行，不能以当前完整MCP类群或可编译启动代替整个harness最终完成。

## ProductManager、原合并策略与动态配置发布批次

保持固定5.3.14样本/SHA与REA证据。完整ProductManagerImpl `15588491..15597577`（constructor及17个成员）已移植；缓存key/endpoint/env/version key、MAX_CACHE_TTL=480000、PROXY_SYNC_THROTTLE_MS=2000及PRODUCT_CONFIGURATION_CACHE_TIMEOUT=480000均按原值。以下位移仍为UTF-16索引，方法仅加TS注解与外层DI。

完整五策略：Override `15599132..15599242`、Merge `15599371..15599892`、SmartMerge `15600057..15601365`、DeepSmartMerge `15601498..15602636`、CommandsSmartMerge `15602777..15603887`；DefaultProductMerger `15604751..15605166`。保留undefined/null/数组/primitive语义、按id/name合并、Symbol.for('@genie/product:overrideMode')的replace锁、builtInMarketPluginsMerge原路径例外、deep primitive去重/循环WeakSet、commands路径和Galileo四字段不完整时禁用/清字段。优先级provider排序按原Prioritizeable规则：正值、降序稳定sort，ProductManager再reverse，因此同优先级应用顺序也反转，不能用随手的升序sort替换。

原provider与renderer首批完整类：CliOptionsProductProvider `9877981..9880084`、SdkInitializeProductProvider `9881205..9881847`、PluginsProductProvider `9912987..9913726`、McpPromptProductProvider `9915058..9916130`、DefaultProductProvider `15261645..15261742`、ClientProductProvider `15628995..15629918`、EnvProductProvider `15639250..15640120`；McpPromptRendererImpl `7652318..7654310`。原Agent-definition转换/system-prompt override两函数 `9876813..9877412` 一并恢复。补完整GzipUtils `15627963..15628249`、MemoryLocalStorage `15669496..15669815`，默认分别使用Node zlib与自有内存实例，不扫描安装应用缓存。

ProductManager保留sync/finally队列、stable与volatile快照、强制标记、条件独立/endpoint-dependent prefetch、发布Proxy、data level防止晚到cache覆盖新server结果、gzip/base64缓存及endpoint/environment恢复、过期读取节流、网络环境解析和完整feature过滤。源finally链若先前拒绝，后续doSync可运行但返回的Promise仍保留旧拒绝，这个怪异语义也有回归，不改成“成功恢复”。DisableMultimodalGeneration追加的中英capability_constraints整段文字通过完整AST保留，重复过滤不追加；terminal变量和bundled skill basename过滤亦保留。原六份JSON/115个registry prompt未修改，新增内嵌文案不伪算为新增registry prompt。

constructor.name是本批独立核查点。原manager用可读provider名称字符串判断prefetch，而压缩包相关类是tB/tI/tz/tV/eE或eS=eu等匿名赋值名；Component decorator仅登记元数据，不重命名。移植后通过显式name descriptor保留样本名称（公开类接口仍用原导出名，例如CliOptionsProductProvider），不因可读TS类名意外激活原包未命中的分支。差分另用真实命中名单的named fake provider覆盖条件并行分支，不将该分支测试当作所有默认provider在样本中都并行。

完整ConfigWatchServiceImpl `9893732..9902774`、McpWatchServiceImpl `9904348..9905553`恢复，合计19个完整原类。保留2秒watch setup、3秒change debounce、rename即时刷新、文件类型过滤、CWD失效/重绑、memory/settings/skill/plugin/MCP缓存调用、Windows目录512阈值与递归失败降级、EMFILE停用、MCP connected/disconnected合并sync。新增owned host跟踪setup/Promise/subscription/FS watcher、关闭中的初始化与发布，避免晚到任务在close后重挂载；不改原watcher决策。依赖中缺少完整SettingsManager.clearCache/插件服务时，仍按原能力检查处理，不以空方法计为已恢复。

默认createHarness现使用原ProductManager，固定JSON作为base客户端快照；现有Skill provider与显式commands/skills参数通过标记清楚的宿主provider接线，额外provider可显式注入。每次发布更新同一个ProductConfiguration视图及其索引，清ToolManager描述cache、刷新CommandManager，并经原onDidChange重建eager AgentManager。SDK initialize真实应用systemPrompt/appendSystemPrompt/custom agents，等待原重建屏障，不再是假成功或默认“依赖缺失”。插件组件provider忽略settings字段，volatile重放从稳定快照开始，移除插件不残留其instructions/命令。MCP prompt provider、原renderer与Command interceptor已打通，引号参数/剩余参数、角色和资源文本按源码转换。

独立Product host默认环境对象为空、缓存为自有MemoryLocalStorage，home/watch路径为当前state/工作目录；不读取原账号/安装缓存，不请求原配置服务。显式productRuntime.env/storage/providers可注入自有来源，模型API key仍不映射为产品账号。当前接入的是完整manager与首批provider，不是整个provider注册表：Cloud/Models/Agent-model/CustomAgents与CustomCommands文件发现、完整ProductEnvService、API-key-helper及插件原子跨服务刷新事务仍待补。ConfigWatch看见commands/agents文件变化只会调用sync，不能据此声称尚缺的文件发现provider已工作。完整stdin/CLI鉴权/Hook服务端与SettingsManager磁盘也仍未恢复。

`verify:product-manager`核对112处完整成员/函数AST，包括19类与两helper，另验证原module常量和manager静态字段；743次有限比较：五策略11×11输入共605组，24组stable/volatile/错误/名称分支同步流程，6组sync/async缓存，108组platform/512阈值/changeType/rename-change watcher矩阵。原factory/类在独立VM执行，FS/clock/provider为fake；合并顺序按最终值验证，独立日志交错按值/数量比较。有限矩阵不是所有provider、平台或并发状态空间100%。

新增27项专项覆盖策略/循环/replace、gzip/cache晚到和finally失败、命名分支、proxy节流、feature prompt、原SDK/CLI/Env/Client provider、优先级、watch路由/EMFILE/Windows、取消与发布错误恢复。三条真实SDK链路验证initialize prompt/custom-agent确实进入模型请求、插件移除后的Agent/命令刷新、原MCP prompt经自有loopback HTTP回注；另用真正的owned fs.watch rename验证skill配置刷新，测试等待期间仅ref自有watcher，结束关闭。均不使用真实账号、外网模型、联系人或桌面。

本批775核心、10Web宿主、697编译JS smoke、41组样本差分、check/build/config与CLI/Web实际启动通过；固定SDK/OpenAI、依赖锁、六份JSON/115 Prompt与memory policy保持不变。OpenAI Docs仅核对Agent instructions/运行时上下文边界，实际行为仍以锁定SDK与原样本为准。整体目标继续进行；下一批优先原CustomAgents/CustomCommands发现器、Models/Agent-model provider及插件刷新事务，再推进环境/SDK启动与剩余宿主服务，不以本批完整类群宣称整个harness已100%完成。

## 文件发现、模型来源/解析与企业策略批次

本批补齐上一批明确缺失的文件/模型provider，不替换SDK或六份原JSON。以下仍为固定SHA样本的UTF-16位移，不是字节位移。

- 完整CustomCommandsProductProvider `9884646..9886370`、CustomAgentsProductProvider `9887502..9889624`、ModelsProductProvider `9908398..9911296`、CustomModelsProductProvider `15631247..15637656`。
- 完整AgentModelResolverProvider `15242324..15243876`、AvailableModelsFilterProvider `15244778..15245391`、EnterpriseCustomModelPolicyFilterProvider `15215137..15216830`、CraftToCliAgentModelsSyncProvider `9883035..9883686`。8个provider默认加入同一个原ProductManager，不是只导出未使用类。
- 完整EnterpriseCustomModelPolicyServiceImpl `15218023..15226745`、CliEnterpriseCustomModelPolicyServiceImpl `15205780..15209592`、PolicyDiskCacheImpl `15211363..15212558`、CloudEnterprisePolicyService `15212826..15214360`。CLI策略服务默认接入；Cloud服务完整类可显式使用，不冒充Cloud product provider已恢复。
- 完整DirectoryScanUtils `13223474..13224875`、ColorUtils `13220744..13223330`、MissingPluginUserConfigError `9813953..9814156`。原Path四个目录方法、环境变量展开、两种加载时变量方法及13个plugin变量/环境/Hook配置函数一并恢复。简单frontmatter复用已恢复MemoryMarkdownUtils，完整YAML复用原74模块parser。

模型能力目录与类型/策略常量保留原纯module factory：55119/66954/95198/47023/17489/90276的原文gzip保存在独立文件，解压后合成文本SHA-256 `914831e9049e5296cd6211bd03b0d15cb7b6a5b2e12c8220af1a5d30a6bcacea`；不是安装包或SDK代码副本。Ceph检测82005完整factory单独保留，并验证其AST。目录元数据是固定样本快照，不代表当前模型服务可用性或推荐。

文件发现保留project后user数组顺序、嵌套命令冒号名、大小写敏感`.md`、canonical realpath、symlink循环去重、100深度上限与Ceph跳过；命令与Agent的两种frontmatter不能混用。加载时变量保留session占位到运行期，plugin敏感option在content中保留原提示，不泄露实际值。模型配置保留user/project两阶段merge、原disabled默认、custom-local前缀/alias、URL的replace symbol、env解析、能力补全和availableModels原列表规则；项目primitive列表可替换user列表，并非无条件union两层。

企业模型接口保留480秒cache、30秒起指数退避/300秒上限、force绕过、旧成功结果fallback和chat模型反向unshift关系。Agent模型解析只按id/name，不按alias，variant置前、unknown保留、explicit限制与Craft补入按原逻辑。企业策略保留owner切换隔离、并发fetch合并、5分钟/30秒cache、1.5秒timeout、URL enterprise编码、401匿名不缓存、未知错误fail-open、旧denial的stale-cache、远端allowed变化触发sync和磁盘stale先回后刷新；不以永远allowed的policy stub代替。

新source host只接owned路径、认证/REST/workspace适配器及资源所有权：默认认证为空，产品REST必须显式注入，不读取安装账号或原用户home。user路径默认重定向state；环境默认空，显式productRuntime.env才参与展开。跟踪原未保存的Models.init订阅、策略interval/immediate、queueMicrotask、watch与inflight策略/磁盘任务；close等待自有任务并阻止晚到sync。watch:false是明确的独立宿主选项，不改原provider的解析方法。

保留一个重要原行为：普通Agent文件删除后，product快照不含其定义，但原AgentManager仅清plugin registry，已构建的非plugin SDK Agent可能仍由get(name)取出。测试明确断言该差异，不以修改原manager使测试“更合理”。命令更新/删除真实刷新命令表；原静态prompt registry数量与内容不变。

`verify:product-sources`验证15个完整原类、变量函数与Path方法，共118处完整成员/函数AST；263次有限比较覆盖模型解析/过滤、成功/失败/force/cache/backoff、企业policy响应/时钟、实际临时文件及symlink/深度、frontmatter、变量/颜色、两层models.json与feature矩阵、policy filter/Craft同步。原完整方法体在同一显式DI边界执行，7个纯factory另做原文/AST核对；不是独立运行完整原bootstrap，也不是全状态空间100%。

新增19项专项含真实SDK文件命令改写/刷新/删除、原Agent缓存行为、models.json经原WorkBuddyModelProvider到自有loopback Chat Completions SSE，以及真实models.json watch/debounce/close。所有文件/HTTP/账号/时钟均自有或fake，不访问原应用账户、真实企业/模型服务、联系人或桌面。

本批794核心、10Web宿主、716编译JS smoke、42组样本差分、check/build/config与CLI/Web实际启动通过。SDK/OpenAI、依赖锁、六份JSON/115 Prompt与memory policy不变；旧依赖audit风险不因本批功能恢复消失。下一批优先插件跨服务刷新事务、Cloud product与环境服务，再推进SDK输入/启动/鉴权、Hook服务端、Auto classifier backend和SettingsManager持久化。核心方法/字符串的有限AST与差分结果不等于整个harness已100%恢复，整体目标继续进行。

## 完整插件管理类、本地组件加载与跨服务刷新批次

沿用固定5.3.14样本SHA及原REA证据，不执行安装应用bootstrap。另以完整原module28579的惰性factory片段运行REA静态分析，得到派生Evidence `ev_f226988140af2bc7a440a361edb602a2c24000edd0d9f1b77f47888c89f758ed`；该fragment有原UTF-16来源说明，500-node/100-unknown边界下关系覆盖明确为partial，不把它当完整应用控制流证据。后续移植与差分仍逐项核对固定原bundle。

完整PluginManagerImpl `9624900..9758187`含constructor及193个方法，PluginDependencyResolutionError `9624672..9624889`；恢复初始化/缓存代次/installed registry迁移与原子写入/路径及seed判定/版本和依赖闭包/安装启停与策略流程/inline来源/组件cache和active快照等全部成员。完整类存在不等于每条外部服务已接通；默认独立host只使用owned路径和显式本地目录，不下载市场内容。

完整PluginLoaderManager `9617689..9621098`；七loader分别为Agent `9583201..9587093`、Command `9588330..9591824`、Skill `9593102..9597847`、Hook `9599266..9602081`、MCP `9603335..9608128`、LSP `9609592..9612038`、OutputStyle `9613296..9616389`。manifest路径配置/默认目录/递归与去重、完整YAML与简单frontmatter、插件命名/model id/name差异、Hook schema和环境/user_config、MCP JSONC与缺type推断/LSP env/输出样式namespace及settings.json覆写均保留；MCPB动态模块仍需下载/提取backend，不伪造可用。

完整PluginRuntimeRefreshService `9832687..9835683`、PluginMcpToolChangeBlockedError `9832171..9832559`、pluginMcpServerConfigs `9832560..9832680`。队列按refreshTail串行；prepareDesiredState先执行；startup/prewarm/builtin/reload的desired-state与repair分支保持原样。reload的beforeCommit比较投影与期望有效MCP名称，按排序added/removed抛逐字错误；先校验再更新registry/active snapshot，失败不提交。提交后按原序刷新MCP、LSP、工具cache、full/volatile Product、命令、样式和Agent；reload/builtin LSP故意后台，启动等其他原因等待。失败调用本身拒绝，但settled tail吞该错误并允许下一事务，不沿用ProductManager的sticky-rejection队列语义。

完整ReloadPluginsCommandExecutor `7626670..7628827`和OutputStyleManagerImpl `9420919..9423931`恢复。reload保留原force/ToolSearch/已有outputTokens门槛、caveat/input/output与计数文案；本地命令不发模型请求。输出样式保留built-in先、ancestor根到当前、plugin最后且首次同名保留的原顺序，不改成“最近目录覆盖”。原source仅比较MCP有效名称，不检测同名配置内容变化；依赖修复后的第二次active提交原本不再运行同一MCP阻断校验，两点均明确测试保留。

原helper包括mapWithConcurrencyLimit、resolveDependencyClosure、cache-marker exit注册、parseFrontmatterHooks和extended Hook env gate、两个filesystem并发函数，以及8组原Zod3 schema表达式。module6527/47962/26106三个纯constant factory原文保留，合成SHA-256 `edd7b1253f42337215c19e8f8c684283c6108e60949e093dadfe0ade5c1d67cb`；metadata不是完整bundle或SDK源码。新增精确固定样本`semver 7.7.2`依赖，其他既有依赖、SDK/OpenAI、六份JSON/115 Prompt和memory policy均不变；audit仍为16项旧风险。

默认createHarness拥有原PluginManager及loader，空配置时不扫描任何安装插件；CLI/Web的repeatable `--plugin-dir`与嵌入nativePlugins.directories传入显式可信目录。共享active snapshot进入Product/Agent/Hooks/MCP/LSP，接上AgentService已有原refresh join与托管Agent替换屏障；删除插件manifest并reload会清除plugin-tag Agent/命令/Hook/style。legacy只读agentManager.plugins保持原来兼容边界，不冒充完整事务manager。完整manager adapter可显式共用，避免两个不一致的plugin owner。

新增owned host区分原方法与平台bootstrap：默认市场/managed-policy来源未配置，原Installer/MarketplaceFactory、资源seed/MCPB、真实磁盘Settings/Options/跨进程锁/Git执行仍需后续服务，不把空数据来源记为这些服务完成。Node文件桥不是原fs-extra；写入/删除限制到本次state并检查外部symlink，进程接口仅允许signal0只读存活检查。原启动5秒auto-update timer、immediate/订阅/原方法返回Promise与background LSP均由宿主跟踪；close拒绝新刷新，释放I/O后等事务，再关闭Product并清理自有cache marker。LSP显式standalone配置在原reload后重新注册，属于宿主适配。

补保留module94377 `13019243..13020520`完整semver包装factory：Bun的order/satisfies/valid快速分支、Node fallback以及始终委派semver的range/coerce等方法不合并成一套近似算法。Node依赖锁定7.7.2；另验证原factory的AST/摘要并用受控Bun适配器测试分支，不据此宣称完整Bun产品bootstrap已恢复。

Web/嵌入入口新增同CLI的本地命令分派，原executor结果先刷JSONL再返回/流式输出，不调用第二套loop。Web同源/CSRF/单运行槽不变；可信插件可自动执行Hook，逐次工具审批不是插件沙箱，不自动扩展legacy工具/MCP allowlist。

`verify:plugins`核对14完整类及全部方法体、helper/并发函数/8组schema共294处完整AST，3纯factory另核对；472次有限比较覆盖reason/desired reload/修复/失败矩阵、MCP有效名称、manager路径/registry/scope/version/依赖闭包。原完整方法体使用同一owned DI边界，不独立执行完整产品bootstrap，也未穷举全部194方法的磁盘/安装/并发状态空间。

新增24项核心专项与1项Web测试：真实本地七loader、模型规则、快照校验/冻结/cache晚到/依赖guard、队列顺序/失败/背景LSP、命令文案和路径保护；真实SDK跨插件Agent/命令/输出样式/Hook刷新及删除、刷新屏障、MCP阻断前0次握手/force后自有HTTP连接；独立CLI进程和Web均验证reload不发模型请求。模型/HTTP/命令子进程与文件均为自有或fake，不读取安装账号或访问真实模型/联系人/桌面。

门槛：818核心、11Web宿主、740编译JS smoke、43组样本差分、check/build/config及CLI/Web启动通过。下一批优先市场/资源seed和持久化依赖、Cloud product/环境服务，再推进SDK输入/启动/鉴权、Hook服务端、Auto backend与默认审批统一。完整核心类/本地主路径可运行不等于整个harness或产品bootstrap已100%恢复，整体目标继续进行。

## 本地市场与持久化依赖批次

直接移植9个完整类：FileLockServiceImpl `9144647..9146302`、BaseMarketplace `9536013..9537667`、DirectoryMarketplace `9538211..9539998`、MarketplaceFactory `9555538..9556101`、MarketplaceStorage `9556732..9563889`、MarketplaceConfigManager `9565529..9567108`、BuiltInMarketplaceProvider `9573457..9574515`、GitFallbackCoordinator `9579120..9579902`、LocalPluginInstaller `9780911..9782967`。上述为固定SHA样本的UTF-16索引；方法体只加TS注解，DI在外层绑定。module13423 `9805697..9807385`的原名称/官方来源/默认自动更新policy纯factory整体保留并校验AST与SHA，不用近似规则替代原白名单。

市场存储恢复原进程内Promise写队列、mkdir/lock.json跨进程协议、PID signal=0、过期/损坏锁最多三次移除、路径截断、临时JSON/原子rename与100/200/400/800/1000ms退避、损坏`.broken-<timestamp>`备份和legacy cache引用迁移。原FileLock保留Mutex Map，不再用上一版tails近似；第三方async-mutex按CLI样本固定0.5.0。注意原Storage获取文件锁失败会降级为进程内锁；完整控制流恢复不等于所有失败下仍有跨进程强一致性。原init失败Promise也保持sticky，不自行重试。

默认owned plugin host以原Factory加载已保存的本地目录市场；ConfigManager按user/project/project-local/CLI的原规则合并，显式作用域配置可在启动时添加市场。原LocalInstaller验证名字和词法路径边界，Directory provider合并插件manifest、缓存/coalesce及浅克隆均保留。Object source只读取`url`、manifest字段可覆盖条目、storageName写盘不保留name字段等原行为不修正。市场记录默认写`<state>/plugins/known_marketplaces.json`，锁写`<state>/tmp`，不读取安装应用账户或真实市场目录。

BuiltInMarketplaceProvider为完整原类，独立host默认通过显式空profile关闭样本生产市场；原六份产品JSON完全不改。可显式注入`nativePlugins.builtInMarketplaces`及远端provider，不能据此宣称Git/HTTP/ZIP下载器已恢复。GitFallbackCoordinator对本地source直接返回原对象；远端detector/converter仍为明确的未配置依赖。原命名policy通过动态模块入口接入ConfigManager→PluginManager安装链，不绕过受保护名称校验。telemetry仅独立日志sink，不冒充网络transport。

Node文件桥改成明确只读接口和受控写方法，移除展开fs.promises带来的未包装mutator；补move与utimes，阻止已有最终文件symlink向state外写入。该桥仍有TOCTOU和可信插件边界，不是OS沙箱，也不是原fs-extra。宿主追踪Storage/Config/BuiltIn返回的Promise，关闭等待已发起写入完成；不修改原类存储决策。

REA再次分析从module65117精确截取的惰性输入，证据`ev_b68ebceab157f73c4b6dd34384736380ab7a81d2651dda2b3a93da5b0c843ab9`，500节点/每文件500节点、100 unknown及45秒上限。语义图因unknown上限为partial/truncated；不执行工厂或原bootstrap。此派生小片段证据仅补充文件锁语义图，不代表完整bundle或全部市场服务覆盖。

`verify:marketplaces`核对9完整类/63成员的完整AST、1个原policy factory及381次有限比较。新增24项专项覆盖真实自有子进程锁竞争/并发写入、备份/迁移/退避/失败恢复、目录缓存/manifest覆盖、作用域合并、命名policy、默认host add/重启、配置驱动安装与close写入屏障；真实SDK两次启动均加载持久化市场的Agent/命令并消费Prompt。PID故障分支使用fake probe；模型为fake，未访问真实模型、生产市场、联系人或桌面。

最新门槛：842核心、11Web宿主、764编译JS smoke、44组样本差分、check/build/config与实际CLI/Web启动。另在不含原应用/bundle/旧node_modules的暂存快照副本完成全新npm ci、check/build、CLI/Web启动、48项插件/市场编译后测试及11项Web测试。保留SDK/OpenAI锁定版本、六份原JSON、115个Prompt和memory policy摘要；旧audit仍16项，未强制升级。下一批继续远端Git/HTTP/ZIP provider、更新检查/原子替换/安装器及资源seed，再补Options/完整策略/磁盘Settings、Cloud product与其余产品bootstrap；整体目标尚未完成。

## 远端市场provider与更新链路批次

完整移植GithubMarketplace `9540634..9543574`、HttpMarketplace `9544069..9547325`、ZipMarketplace `9547937..9555429`、MarketplaceUpdateChecker `9569105..9572073`、GitAvailabilityDetector `9575670..9576155`、GitToZipUrlConverter `9576904..9577492`。索引仍为固定SHA原样本UTF-16；市场/锁批次累计15完整类。完整module14783中19个helper `9845680..9851651`按函数移植，不执行其原module或应用bootstrap；第三方yauzl按CLI样本固定3.2.0，不复制第三方源码或改写SDK。

Factory默认创建真实Git/HTTP/ZIP provider，不再返回未配置的Symbol；UpdateChecker、BuiltinProvider、Git detector/converter/coordinator接入同一宿主。Git保留浅clone、当前branch fetch、reset --hard/clean -fd、无效目录移除/重clone、manifest命名对齐。HTTP保留先取manifest再update的两次fetch、完整base URL拼接、metadata目录探测缓存、旧metadata清理和单插件失败继续；它只下载清单，不假称已下载所有插件资源。

ZIP保留重定向/60秒下载与30秒HEAD超时、ETag/Last-Modified/本地mtime、UUID版本种子与60秒默认检查节流、404-only main/master互换、临时提取/staging/backup交换、恢复失败时保留backup、旧孤儿匹配清理。原helper保留yauzl路径检查、permissions、忽略__MACOSX后单目录展平、rename退避；gzip helper只解压不解tar，provider临时文件固定.zip，使tgz输入仍有原失败边界。它不是带总大小/条目数限制的安全解包器。原提取按entry input end推进，未改写为另一套pipeline/发布时序。

新增owned-marketplace-io只负责显式网络/流/ZIP打开/子进程和关闭所有权：下载/清单abort、未使用响应体排空、关闭已有与late-open归档、read stream end与close差异、等待自有资源。默认Git仅支持原市场所需命令，clone目标和更新cwd限制在state；HOME/Git config隔离，不使用安装账号、SSH identity/agent。认证SSH需显式exec adapter。原provider中的reset/clean在测试中只作用于新建自有fixture clone，未操作用户checkout。source方法体与原字符串不因这个adapter而改变；adapter不是execa/fs-extra或OS沙箱。

`verify:marketplaces`扩展为129处完整成员/函数AST、12个原常量initializer（含7条转换规则/分支/缓存值）及1个policy factory，584次有限比较。新增203次原类/原helper与还原代码的owned DI比较覆盖Git命令/探测、URL转换、HTTP错误、slug/格式/版本、HEAD分类、分支回退、真实归档提取与回滚。新增27项专项覆盖自有HTTP/HEAD/redirect、ZIP本地与远端安装/更新、etag跳过/UUID提交、unsafe path/单目录/gzip、双失败backup保留、关闭中下载与late-open、真实自有file:// Git clone/update。真实SDK在两次启动中从显式远端ZIP配置安装/恢复版本cache、Agent/命令并消费原Prompt，第二次不重复GET。真实生产网络、TLS、代理、私有仓库认证及全部平台/并发状态未据此证明。

REA惰性module14783派生证据`ev_f99aa1ee5da288fab92c030d50e9b0dd0ad331a27d0414af734e0382285afb41`，750节点/每文件750节点与150 unknown上限、45秒；语义图partial/truncated，不代表完整应用覆盖。

全量编译smoke首次运行发现原FileLock元数据发布竞态：一个进程mkdir后尚未写lock.json，另一个进程的isLockStale会因metadata缺失返回true并删除它，两个owner随后都能返回acquire成功，真实fixture曾丢失a2更新。新增确定性barrier在原类与还原类中复现双owner，完整AST也仍一致，不为通过测试修改生产协议。跨进程正向测试改为有效记录上的明确争用/调度，仍检查两个真实进程的全部6条记录；不声称涵盖创建窗口或所有并发。当前市场存储并非强一致方案，源码保真不等于修复原bug。

多套全量验证/编译并行时，既有真实fs.watch用例另出现一次10秒超时；未据此修改watcher方法或放宽deadline。该27项suite单独复测通过，停止并行构建后的完整源码870项及11项Web测试通过；编译后792项也通过。这些记录不把操作系统事件交付/所有负载下时序称作已穷举。

本批仅新增yauzl及其新传递依赖，既有版本完全未变；锁定SDK/OpenAI、六份JSON、115 Prompt和memory policy摘要均不变。npm audit现17项（10中危/7高危），其中yauzl3.2.0新增[GHSA-gmq8-994r-jv83](https://github.com/advisories/GHSA-gmq8-994r-jv83)中危告警。当前原路径不调用该告警涉及的entry.getLastModDate，但不宣称总体安全，也不通过升级破坏样本保真；只用可信归档。

最新门槛：870核心、11Web宿主、792编译JS smoke、44组样本差分、check/build/config与实际CLI/Web启动。另从暂存快照在无原应用/bundle/旧node_modules的全新目录验证npm ci/check/build、76项编译后插件/市场测试、11项Web测试与CLI/Web实际回复。下一批继续独立Git/npm/subdir插件安装器、Options/原策略/磁盘Settings及资源seed、Cloud product和其余产品bootstrap，整体目标仍未完成。

## 独立插件安装器与Options/ErrorCollector批次

移植5个完整原类：GitPluginInstaller `9784026..9788420`、NpmPluginInstaller `9789325..9790587`、GitSubdirPluginInstaller `9791710..9795641`、PluginErrorCollector `9796644..9797503`、PluginOptionsStorageImpl `9818861..9822846`。以上均为固定SHA样本的UTF-16索引；45处完整成员AST与5个原常量initializer（含env/正则/100条上限）验证，120次原类/还原类owned DI有限比较。UUID无参v4以Node crypto适配，Emitter/FS/Settings/进程在工厂注入，不执行原bootstrap，不改SDK依赖或原方法体。

三个installer加入默认同一个集合，原Manager的Git版本/tag/cache方法接入owned执行器。Git保留完整40位SHA、ref与默认分支的不同fetch/checkout/reset/clean分支、SHA验证失败清理和错误收集；sparse保留filter=tree:0、no-cone、120/60/30秒超时、嵌套path与祖先.git查找、pull失败清理/重装。npm保留package/versionConstraint优先级、prefix/no-save/registry透传和120秒超时；没有偷偷添加ignore-scripts。实际fixture的安装脚本正常执行，说明信任/权限边界，不能把owned路径适配当作沙箱或完整孙进程树清理保证。

原NPM正则接受前导连字符，install后仍检查包目录；原update将installedPath上溯两层再交给install，包含scoped包时也保留嵌套prefix边界。sparse checkout失败会删除clone，但checkout成功后不存在subdir会保留目录；update失败会清理找到的repo再重装。测试只使用自有clone，外部写/删除被standalone FS/cwd边界拒绝；不操作用户checkout、不访问生产registry/仓库。默认Git/npm HOME/config/cache不读取安装账号或用户npmrc，认证仍需显式适配。

OptionsStorage恢复USER/pluginConfigs与pluginSecrets拆分、敏感值精确true/转字符串、合并/跨存储scrub、cache别名/clear、has/delete与词字符占位替换。默认敏感文件位于本次state/credentials.json，明文、首次创建0600；已有mode不保证收紧。损坏JSON读作空，下次保存可覆盖损坏内容；保留原无锁read-modify-write，非事务。敏感先写、非敏感失败时可能已存新secret却仍保留旧缓存，确定性测试覆盖，不添加原实现没有的rollback/自动清缓存。

非敏感默认使用新增owned-plugin-option-settings，只保存USER/pluginConfigs到state/plugins/plugin-options.json，有本进程写队列/临时rename，不冒充完整原SettingsManager，也不保证跨进程RMW事务。调用方显式提供nativePlugins.settings或dependencies.pluginOptionSettings时沿用其get/set/list，read-only视图的失败仍由原类处理。默认loader与Manager动态容器共用原OptionsStorage，真实SDK验证保存→reload→组件变量替换→重启；模型请求不含测试secret。ErrorCollector默认替换原数组占位，保留100条上限、Date排序和plugin/source查询键，不擅自把pluginName/marketplaceName改作匹配键。

适配桥另修正mkdirp对this的依赖：原类通过(0, fs.mkdirp)无绑定调用，原fs-extra支持，之前Node桥不支持；现在保持同一owned范围并支持无绑定调用。新增installer/Options Promise纳入关闭屏障，错误Emitter只释放自建实例；ownedHandleCount也包含已有I/O资源。不是通过改原方法来掩盖宿主缺口。

新增29项专项：真实自有Git/SHA/sparse更新，真实本地npm tarball+loopback registry与生命周期脚本，Git/npm/subdir各两次真实SDK安装/版本cache/Agent/command恢复，选项拆分/迁移/部分失败/损坏文件/cache/替换/delete、原ErrorCollector筛选与窄Settings边界。模型是fake，registry/仓库/进程/文件均为自有，未操作真实账户、联系人或桌面。REA对惰性module2845生成派生证据`ev_cdbe6f3bf44d8099f0443e3b3e408b28dc8b0b86ace1e411008bb040bb28ba52`，750节点/150unknown/45秒上限，语义图partial/truncated，不当作完整应用覆盖。

最新门槛：899核心、11Web宿主、821编译JS smoke、45组样本差分、check/build/config与CLI/Web实际启动；全新暂存快照副本无原应用/bundle/旧node_modules，npm ci/check/build、105项插件/市场/安装器编译后测试、11项Web测试与CLI/Web启动均通过。SDK/OpenAI固定版本、六份JSON/115 Prompt/memory policy摘要与依赖锁均不变，已有17项audit风险未强制升级。下一批推进完整PluginPolicy/磁盘Settings与资源seed/Cloud product/其余bootstrap；安装器与选项可用不等于完整产品控制器或整个harness已100%恢复。

## 原Settings、CLI加载队列与PluginPolicy批次

移植6个完整类：PluginPolicyServiceImpl `9824149..9826670`、CliSettingSourcesProvider `11188750..11191471`、CliSettingsProvider `11193064..11196069`、SettingsManagerImpl `11202361..11209123`、SettingsController `11210623..11211440`、SettingsValidateMiddleWare `11213940..11214445`。另保留deepDiffDefaults `11201978..11202354`、normalizeReasoningEffort `11192966..11193057`和PathUtils.getSettingsFilePath `13328279..13328565`。均为固定SHA样本的UTF-16索引，不是字节偏移。

`verify:settings`核对66处完整成员/函数AST、9个原pure factory payload/hash及94次原类/还原类有限比较。factory包括原DEFAULT_SETTINGS/作用域/白名单/优先级、sandbox默认值和ObjectUtils；后者copy是原JSON.parse(JSON.stringify)而非structuredClone。sandbox只恢复纯配置，不意味着已恢复BashSandbox执行器。Console NATIVE、startup phase、effort列表与policy regex另核对固定样本，独立验证不执行原应用bootstrap。

原SettingsManager成为默认磁盘服务：USER为state/settings.json，PROJECT和PROJECT_LOCAL为cwd/.codebuddy/settings.json及settings.local.json。保留JSONC注释/尾逗号、原默认差分写入、scope Mutex与文件锁、60秒缓存、固定.tmp/rename、失败清理、同步change事件与后台ConfigChange Hook。数组Set并集、四个subkey递归合并、其他对象后覆盖、USER磁盘默认浅合并、数组作为有效object读入等源码边界不修饰。损坏JSON经50/100ms重试后标记并拒写；修复后仅clearCache不够，还须成功读取清标记，不自动备份/改写原文件。无效非object值不缓存也不标损坏。

CLI服务保留初始化Deferred、串行loadChain、来源顺序/去重与无效项处理。none只排除磁盘scope，CLI始终允许；JSON对象字符串或相对cwd文件、model/effort优先级保留。CLI/Web启动器新增--settings/--setting-sources/--effort，teammate独立入口显式传递同一配置；不宣称已恢复整个原CLI解析/SDK启动协议。logger按原代码可能记录CLI JSON，不用于传递账户密钥。

原PluginPolicy读取ProductManager.builtInMarketPluginsMerge并监听更新；regex、重复ID后项覆盖、五个字段差异检测、strict-false限制、Map.has自动安装语义与恒false的市场阻断检查保持。version/metadata单独变化不触发策略事件。不用空数组服务冒充实现；固定六份产品JSON中该字段未配置时为空仍为实际数据结果。默认内置市场仍用显式owned profile，未暗中启用生产市场。

默认OptionsStorage现依赖同一SettingsManager，非敏感USER/pluginConfigs不再用窄adapter。旧plugins/plugin-options.json只迁移新配置缺失的插件项，旧文件保留且不覆盖现有项；敏感credentials原实现不变。源change事件由明确宿主桥同步排队原settings-change刷新，AgentService可join；原controller/middleware可在嵌入接口使用，不假称已有完整/internal/config路由/UI。全局CWD及ConfigWatch连接原clearCache。显式nativePlugins.settings继续作为插件scope覆盖，global options.settings为只读覆盖；旧agentManager.plugins兼容路径不自动建立此宿主。权限/MCP局部内存settings仍独立，下一步需核对其原消费者接线而非重复恢复Settings类。

新增23项设置专项：作用域/JSONC/default diff/缓存/拒写/数组/CLI/锁降级/并发update/rename失败、Controller/middleware、policy差异、owned symlink边界、加载队列/关闭、旧文件迁移；真实SDK验证磁盘插件禁用→重启→启用→卸载、live Product策略禁止操作、原ConfigChange命令Hook和CWD路径切换。CLI实际子进程验证none排除磁盘SessionStart Hook且effort覆盖JSON；Web launcher使用同样参数运行离线SDK回复。全部模型/仓库/进程/文件/loopback均为自有，不读取安装账号、不操作桌面或联系人。

专项暴露并修正新owned设置FS桥对悬空symlink的检查，未改原类。全量首跑另暴露兼容审批Deferred的拒绝所有权：Notification Hook现异步读盘，human deny可早于后续await，导致两项用例出现未接管rejection。只在独立兼容Deferred构造时添加观察catch，调用方仍等待原rejecting promise并按原逻辑拒绝；新增确定性异步notification用例，不改完整原InterruptionController方法。原FileLock发布竞态和拿锁失败继续写的已知边界仍保留，不宣称强一致。

REA对惰性module35151派生证据`ev_0619b7b365f46fa0637acb8a6655910fbebbc870b97fda1fc0d1a40f855ac7ea`；750节点/每文件750节点、150 unknown与45秒上限，semantic graph为partial/truncated，不等于完整应用覆盖。115 Prompt、六份JSON、memory policy摘要、SDK/OpenAI版本和依赖锁均未修改。

最新门槛：923核心、11Web宿主、844编译JS smoke（821既有+23设置）、46组样本差分、check/build/config与实际CLI/Web启动全部通过。全新暂存快照无原应用/bundle/旧node_modules，npm ci/check/build、136项编译后插件/市场/设置/兼容审批测试、11项Web测试和CLI/Web实际启动均通过。发布审计567个文件未发现所检查的凭据/运行文件；此扫描不是安全证明，原17项audit风险未强制升级。下一批推进资源seed/Cloud product/其余产品bootstrap及权限/MCP专用settings消费者，整体目标保持未完成。

## 内置资源seed、资源解析与PluginController批次

Desktop样本`main/index.js` SHA-256为`ec41f11bec48bc4fcb81477a8695083161047db303504b03f2ef87dbf6d27935`；`main/workbuddy-product-config.js`为`3a3e001bb227550087d735d07e470a9d06ac8d29141ea1764e0eb48c6e467251`。移植前者safe-copy-dir、builtin-plugin-marketplace-materializer和seed-builtin-plugins三个完整相关函数集合（43个函数），后者完整bundled-assets解析（5个函数及7候选initializer）。位置表由`native-builtin-seed.ts`/`native-bundled-assets.ts`导出，均为各自文件UTF-16索引。另移植固定CLI SHA的PluginController `9763415..9773771`（23方法）、ManifestValidationError `9839074..9839229`及PluginValidatorImpl `9839237..9844910`（6方法），不执行Electron或CLI原bootstrap。

`verify:builtin-seed`核对78处完整成员/函数AST、12处原常量/初始化表达式（包括两个validator正则和完整候选数组），并执行113次原函数/原类与port的有限输出/调用/文件树比较。validator仍是原弱字段检查，不升级为另一套严格schema；依赖semver沿原wrapper。controller保留parsePluginId的split边界、未知scope回user、dry-run/TTY确认、原打印文案、ManifestValidationError身份，以及metadata未提交就抛错、metadata已提交而投影失败返回冻结结果的区别。

物化保留source/cache两树、清单metadata.workbuddySeed/revision/sourceRoots、平台筛选、首项去重、旧两段cache布局恢复、symlink修复/拒绝、canonical路径检查、staging/backup交换与回滚、snapshot有效性验证、orphan marker清理。无版本fallback沿原appVersion+BUILD_COMMIT；有效同版本snapshot不因body更新被重写，新增版本不覆盖旧版本。原safeCopy逐文件read probe/copy，跳过symlink/特殊条目并记录失败，不调用fs.cpSync。source copy不完整会throw；snapshot部分复制则丢弃staging并返回false；原writeJsonAtomic在rename失败时可遗留固定.tmp，均未为测试而修饰成统一事务。

默认候选只考虑builtin-plugin类目，mode/template/skill/mcp-app不全局盖章。IntentRecommend非精确true走all；否则TencentPptxBuiltinDefaultEnabled精确false可使defaults集合为空/none；默认白名单与原字符串保留。已有enabledPlugins键不覆盖，不机器生成false。资源不存在/无支持平台时原函数返回空seed结果，而非偷偷发送available=false删除已有注册。

物化不写CLI元数据，原PluginController把metadataRequest交给原builtin-seed刷新队列与PluginManager已有锁定注册/默认值/installed事务。失败按原tracker回滚新鲜USER基线中的相关ID及市场记录，不回滚已物化文件，也不假称回滚已发布到所有消费者的运行时副作用。用户损坏JSON继续拒写并保留原字节。原FileLock发布窗口竞态及拿锁失败降级仍在；同步物化本身没有新增跨进程强锁，不宣称强一致。

CLI/Web新增`--builtin-assets`，嵌入为`nativePlugins.builtinSeed`及`pluginHost.builtinSeedHost.seed()`；没有显式资源根不探测安装应用。原7级资源解析允许parent/../../候选，resourcesPath仅显式注入，不能把assetsRoot当硬读取沙箱。Node同步FS桥仅允许state/plugins内写，独立宿主串行持有seed/metadata Promise并等待初始投影；Controller host拥有console/readline并关闭自己的确认问题。这里不复刻Electron原15秒提示的后台RPC交接、daemon会话池再刷新或session-addon编排。独立CLI的isWorkBuddyDesktop依然false，不能为凑覆盖硬编码为Desktop；桌面专用mode/template全snapshot注册/会话选择尚需对应bootstrap。

新增29项专项含真实自有文件物化/两版本cache/旧布局恢复、copy/probe与rename注入失败、双restore失败backup保留、symlink/marker/canonical路径、默认开关/白名单/平台、JSON遗留tmp、原validator/controller/TTY与关闭、metadata回滚/损坏拒写及7级资源候选。真实SDK消费seeded Agent/命令、两次启动恢复、保留显式false、升级registry/旧snapshot orphan marker；CLI实际子进程及Web launcher使用owned资源，Web再执行原reload检查Enabled:1。模型为fake，没有调用生产服务或读取账户。

另在拥有权明确的临时state中，对固定样本实际资源进行原函数/port纯物化和哈希比较：清单SHA为`88dd94749e2bd98e6464e2f3d23c8d8c4d37b7beb06d24b7b193328c567a5412`，均成功产出metadataRequest，1193个物化文件条目一致。没有import/执行其Hook、MCP、Shell或原生程序；测试后的自有副本已删除。资源包内附带支付CLI、vendor压缩包和其他第三方二进制，不随本仓库分发。此比较不证明第三方程序可在所有平台或真实账户中运行，资源prompt/程序的分发与完整Addon链仍须独立处理。

端到端升级暴露并修复两个旧宿主绑定缺口：native path helper会返回macOS /private/var真实路径，原owned插件FS仅认/var词法根导致orphan标记失败；现在接受同一配置state的canonical根并仍拒绝根删除/外部/悬空symlink写入。OutputStyleManager原import为fs/promises，旧host却传入回调版fs；现分离loader的fs与style的fs/promises，真实workspace样式加载回归通过。均未改原方法体/字符串。

REA对惰性Desktop函数片段生成`ev_6a384acd64576685eca56eab8e395268fc3931c3b7fd69d73e5e793bb91c5a37`，750节点/每文件750节点、150unknown、45秒；semantic graph为partial/truncated。六份JSON、115 Prompt、memory policy摘要、SDK/OpenAI版本和依赖锁均未变。

最新门槛：952核心、11Web、873编译JS smoke（821既有+23设置+29seed）、47组样本差分、check/build/config与实际CLI/Web启动全部通过。无原应用/bundle/旧node_modules的全新暂存快照通过npm ci/check/build、165项编译后插件/市场/设置/审批/seed测试、11项Web测试及实际seed/reload启动；不借助本机已安装资源即可编译和运行owned演示。发布审计578文件未发现所检查的凭据/运行文件，非安全证明；既有17项audit风险未强制升级。下一批继续Cloud product、资源prompt/会话Addon编排、权限/MCP专用settings消费者及剩余产品bootstrap；整体目标未完成。

## Cloud 产品配置、用户投影与缓存/重试批次

完整移植四类：UserinfoProviderImpl `7241866..7242195`、CloudPreProductProvider `9907133..9907405`、CloudProductManagerImpl `15252547..15256941`、CloudProductProvider `15258449..15260416`，仍为固定CLI SHA样本的UTF-16索引。完整22个成员AST去除TS注解后与原样本一致；另独立核对8个初始化表达式/字符串和原匿名class的e0/tG/e_/eE名称。类名不是纯可读性问题，改成可读name会改变ProductManager按constructor.name判断的预取/缓存分支，因此显式保留样本名。

四类默认接入现有ProductManager与来源provider，不是单独未使用代码。预门槛priority9999，Cloud priority10000；有效accessToken且tokenType不等于精确ApiKey才通过。Userinfo只认truthy account.uid，保留缺失auth时的原TypeError，不将模型API key伪装成账户。默认独立匿名账户不访问远端。登录/完整原REST中间件没有据此恢复；需要嵌入者显式传入账户Subject和REST或单origin HTTP transport，不读取安装应用令牌。

保留原缓存和失败边界：内存只按userId索引，不按URL/endpoint；8分钟有效期，到期等于边界即失效，返回同一对象引用。远端失败先退过期内存/存储记录，再由全局retrying门槛按1/2/4/8/16秒重试，错误日志大于60秒才重报；匿名不缓存/不重试。磁盘协议key为cloud_product_config_cache，最多20条，读命中移到尾部但不检查年龄/刷新ts/写回内存。默认仍是原MemoryLocalStorage而非凭方法名宣称磁盘持久化；跨重启通过显式owned get/set adapter实测。reset只清内存和retrying/configuration，不删磁盘也不取消旧worker，可能允许重试并行；宿主close另收敛资源。重试成功只暖缓存，不自动ProductManager.sync；force sync也不绕过Cloud内存TTL。

CloudProvider原位删除远端endpoint/stagingEndpoint，再浅排除deploymentType；内存别名因而也被修改。CODEBUDDY_REMOTE_CONFIG_DISABLED只认1/true。CommandsSmartMerge取远端nullish回退本地，disabled/失败不重置cached strategy。CloudAgentsSmartMerge下同名Agent本地字段优先，远端显式models例外；models按远端列表遍历合并，同id远端字段覆盖，未出现的本地模型被删除，null/无id保留。不开启smart标志时不擅自补Agent列表。

新增owned Node HTTP只负责显式origin、可选显式header、repos[]参数、JSON响应包装、5000ms超时、取消/response与timer关闭屏障，不冒充原CellJS/Axios或生产认证。拒绝跨origin和redirect，不自动把账户token加到HTTP/模型请求。ProductHost的独立Promise桥追踪原fire-and-forget、在close唤醒sleep并等待旧任务，正常reset保留原语义。任意外部adapter若忽略signal，close仍须等待其settle；不宣称可强杀任意第三方Promise。

`verify:cloud-product`新增第48组源码校验：22完整成员、8独立常量、38组原完整方法体/port有限行为比较；覆盖精确账户/env门槛、缓存别名/过期回退/LRU、全局重试/重置并行、原TypeError、权威模型列表/Agent合并/策略状态、日志与错误格式。不是所有并发/生产账户/服务端策略状态空间穷举。22项专项运行测试另含真实owned loopback HTTP、body超时/abort、close无后续I/O、显式存储重启，以及真实SDK消费Cloud Agent/模型和两次显式同步后的prompt变化，产品token不进入模型请求。

REA对四类惰性片段再次分析，证据`ev_d040e81908e84846b52c594362210aa335501f03305da79a5b914e6f3c019f11`；750节点/每文件750节点、150unknown、45秒上限，semantic graph为partial/truncated。未执行原bootstrap。六份JSON、115原Prompt/memory policy摘要、SDK/OpenAI版本和依赖锁均未变。

最新门槛：974核心、11Web、895编译JS smoke（821既有+23设置+29seed+22Cloud）、48组源码差分、check/build/config与实际CLI/Web启动全部通过。无原应用/bundle/旧node_modules的全新暂存快照重新npm ci/check/build，246项编译后Cloud/产品/插件/市场/设置/审批/seed测试及11项Web测试、CLI/Web实际seed/reload启动全部通过。发布审计585文件在所检查规则内无发现，不是安全证明；既有17项audit告警（10中危/7高危）不强制升级。后续继续资源prompt/会话Addon编排、权限/MCP专用settings消费者、环境服务与剩余产品启动/鉴权链；整体目标未完成。

## Desktop 会话 Addon、模式配置与原 CLI 交接批次

新增固定样本：`main/initialize.js` SHA-256 `528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19`，`main/workbuddy-auth-product-coordinator.js` SHA-256 `8624215504229c4b6190f5c2172da270e015cc96871e90b261786f047e4c6e78`。源码中的明确region证明Addon核心位于Desktop服务侧，不是CLI Agent loop。所有位置仍是对应文件UTF-16索引，由SESSION_MODE_FUNCTIONS/CLASSES/CONSTANTS及SESSION_ADDON_FUNCTIONS/CLASSES/CONSTANTS完整导出。verify额外样本可分别用WORKBUDDY_DESKTOP_INITIALIZE和WORKBUDDY_MODE_COORDINATOR指定；默认读取CLI旁main目录，不执行原bootstrap。

完整移植DefaultModeHandler、ExpertModeHandler、ModeService三个类（coordinator变量声明`1070369..1071833`、`1072148..1073261`、`1073595..1074401`），CWD错误类及原预检；完整mode-tools-config/runtime-config、Storage plugin-context规范化、micro-scene/user-resource/work-mode packs、pack registry、session expander/composer/manifest、会话plugin-context投影、原runtime resolver/log-details、cli-runtime-args和prompt-vars文件/修复函数。另移植原Desktop SessionManager.resolveRuntimeConfig成员`4767659..4768528`连接resolver、manifest与expansion，不冒充已移植该大类全部方法。总计93完整函数、13类成员（含字段/constructor和该单独成员）、18初始化表达式，去除TS注解后独立AST一致；SDK依赖不改写。

保留原决定：craft/ask/plan/expert工具名单完整（含Defer(...)、read_me/show_widget等），plan用craft prompt但plan权限，expert必须expertId；ModeService最后以非undefined显式输入覆盖handler返回，mcpConfig例外由handler优先。permissionMode只接受原五种，离开plan用permissionModeBeforePlan或bypass；welcome coding/working输入规范化为code/work，raw非空runtimeIdentity不trim返回。restartFingerprint只含结构字段，不含model/渲染日期/记忆。

会话选型启用welcome/interaction/prompt-common，不把mode/template列入机器默认USER seed。原专家craft→expert选择、micro-scene未解析warning、project resource provenance、先到先得Addon ID去重、八种bucket、prompt仅摘要、sorted stable JSON/SHA且generatedAt不参与hash均保留。enabledPlugins摘要仅排除精确false（null也算启用）；合成时禁用未选中work-mode前缀插件，用户插件保留。持久化plugin context则仅保留boolean启停，trim/去重/排序并剔除派生模式；这两套语义不能合并成一套近似normalizer。

原buildAgentCliRuntimeArgs只在work-mode承担prompt/tools时抑制旧参数；显式用户覆盖保留。allowedTools、permission/model、sessionSettings/trustedDirectories、language/envRouteMode、strict MCP与prompt-vars参数保留原顺序。根cwd的trustedDirectories原表达式会生成`//**`，没有擅自修正成`/**`。原session resolver还保留Claw路径比较失败不禁用支付插件、明确匹配时将weixinpay session-local置false；Claw目录查找由显式owned callback提供，不调用原会创建/修改系统默认workspace的全局服务。

原prompt文件、prompt-vars写入/健康检查/修复与11109错误协议已接入：缺失/损坏JSON/shape/内容不匹配修复，目标必须canonical path，目录不可写、写失败和修复后仍不健康保留原reason。底层函数仅改fs/os/Date闭包DI；独立宿主将OS temp根重定向到本次state内随机目录。原异步cwd stat/access预检不替调用方创建丢失项目目录。

新增明确标记的createSessionAddonHost与createAddonSession是独立宿主，不是原daemon进程池：每会话独占state/完整Settings/Product/Plugin/Agent实例，在原CLI scope应用合成设置，真实SDK消费原插件settings.agent和fragment composer。两个并行ask/craft实例经owned资源验证互不污染，不把mode写入USER。通过显式close/resume重建验证同ID模式变化后新prompt与既有历史；尚未恢复原pending配置排队、自动backend restart、ACP/pool或队列迁移。普通CLI/Web入口保持原standalone默认，新的Desktop风格入口目前是嵌入API。显式systemPrompt无需原资源；完整资源PromptService仍待恢复，可注入renderer，未提供时沿原fallback。

权限边界必须明确：原craft/expert默认bypassPermissions会绕过standalone工具guard，这个默认被保留。真实SDK测试只对owned文件验证其写入行为，同时验证显式default拒绝同一写入；若需人工审批，应显式default。可信设置/插件Hook仍可自动执行，不是OS沙箱。后端state根canonical化，进程内同路径独占，拒绝session state symlink；不是跨进程daemon锁。borrowed resolver忽略取消时close等待settle，不擅自销毁外部PromptService。

`verify:session-addons`为第49组源码差分，93函数/13类成员/18初始化项、204组有限原完整方法体/port比较；包含模式/权限/选型矩阵、manifest及CLI参数、存储context、resolver/Claw/变量、prompt-vars故障、cwd errno。18专项另验证真实SDK、并行mode插件、close/resume、明确bypass/default边界、原文件修复和显式新sessionId启动/并发防重。不是全daemon/生产账户/所有模式资源或全部并发状态空间100%。

REA对93函数及相关类/初始化项的惰性派生片段分析，证据`ev_6c46f709037be3790dba543b7f4434d73cf2a3618aeb02a7e9b73cf88718f959`；750节点/每文件750节点、150unknown、45秒上限，semantic graph明确partial/truncated。六份JSON、115个原Prompt与memory policy摘要、SDK/OpenAI版本和依赖锁未变。

本批编译后全量运行暴露旧fs.watch测试的不确定性：测试名为rename但用writeFile创建文件，change分支的3秒fake clock未推进。首次改真实rename及防抖驱动后，全量通过但干净快照仍超时，说明不能将其仅归因于防抖。现fixture在5秒内用真实rename探针等待实际OS投递进入原hotReload，再检查配置/关闭；记录投递event/filename以便无事件时诊断，不假设watch返回即完成OS就绪。防抖只推进测试自己的clock，不直接调用原performHotReload制造成功；原watcher与确定性时序测试均不改变。

最新门槛：992核心、11Web、913编译JS smoke（821既有+23设置+29seed+22Cloud+18Addon）、49组样本源码差分、check/build/config及实际CLI/Web启动全部通过。最终不含原应用/bundle/旧node_modules的全新暂存快照重新npm ci/check/build，264项编译后Addon/Cloud/产品/插件/市场/设置/审批/seed及11项Web测试、CLI/Web实际seed/reload启动均通过；修正后的真实OS watcher测试另独立连续5次通过。早前失败快照和修复原因如上，不以某次重试绿灯掩盖旧fixture问题。发布审计592文件未发现所检查的凭据/运行文件，不是安全证明；既有17项audit告警保持不变。后续优先完整权限/MCP settings消费者、资源PromptService及daemon会话动态配置/自动重启、环境与鉴权链；整体目标仍未完成。

## 原 SettingsManager 的权限、MCP 与 SDK 消费者批次

本批不是把若干存储Map写成JSON兼容层，而是让已恢复的原类直接共享同一个完整SettingsManager和原CLI provider。固定CLI SHA仍为`4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd`。原SettingsManagerImpl `11202361..11209123`、CliSettingsProvider `11193064..11196069`、ToolPermissionService `11948949..11968077`、PermissionUtils `13340331..13350579`、McpPermissionsManager `9277575..9279382`、InitializeHandler `7811554..7814144`、SetModelHandler `7825195..7826336`均保持原完整方法体。本批联合复验7类105成员，而非宣称又新移植105个方法；所有索引为固定样本UTF-16。

移除root的permissionSettings Map，权限服务现在直接注入harness.settingsManager，MCP permissions和SDK initialize也指向该实例。仅使用外部只读agentManager.plugins时也创建原SettingsHost，不再因没有PluginHost而缺失scope存储、CLI队列、ConfigChange和cwd cache失效。独立MCP projection未传settings时创建自己的原SettingsHost，USER根为显式getHomeDir；传入borrowed adapter则原样使用且不擅自close。filesystemScopes仍默认不扫描原应用或外部服务器。

补正公开Session的权限上下文接口和初值：调用原PermissionUtils.createDefaultToolPermissionContext生成九来源allow/deny/ask（policySettings、flagSettings、userSettings、projectSettings、localSettings、cliArg、command、session、sandbox）、独立目录Map及两个flag，替代旧三字段近似结构。源样本SessionManager.create/SessionMiddleware有initializeContext调用（调用点约10963387、11000932）；独立host现在在公开openSession完成options之后、SessionStart之前调用同一原方法，辅助会话仍有工具首次初始化。未据此声称整个原SessionFactory/Middleware均已移植。

保留实际scope语义：userSettings/projectSettings/localSettings分别写USER/PROJECT/PROJECT_LOCAL；session/cliArg不持久化。原get/list显式scope不应用setting-sources合并过滤；故none的合并视图可只含CLI，但权限初始化仍读取四scope，MCP仍读取local+CLI。原PROJECT/LOCAL allow是否成为可信allow仍由directoryTrustService决定，不能借此次接线自动提升项目可信度。只读options.settings不是四个native scope，显式permissionHost.settingsManager/projection.settings仍有优先级。

MCP批准/拒绝沿原两个set写enabledMcpjsonServers/disabledMcpjsonServers，approveAll写enableAllProjectMcpServers；local与CLI采用浅字段覆盖，CLI显式拒绝不会被local批准撤销，USER同名字段不是该类来源。它们不等于McpConfigStore的disabledMcpServers transport开关。共享cwd事件清理原settings cache，独立宿主可显式传入cwdService；关闭释放借用observable的订阅。

SDK initialize原switchEnvironmentIfNeeded先set enterpriseEndpoint（默认USER）再switch环境，现前一步真实落盘，即使后一步adapter失败也保留原部分写入。真实ProductEnv/Auth链仍待恢复，不自动请求生产账户。SDK set_model现在调用原CLI provider.set，仍不写USER、不触发SettingsManager.onDidChange，独立facade仅记录哪些CLI键来自SDK并读取真实provider值，不再另存一份模型数据。自定义can_use_tool响应并不支持updatedPermissions；原解析只返回allowed/reason/interrupt/updatedInput，没有添加看似兼容的额外持久化协议。

错误边界不改写：applyUpdate先更新内存再persist，I/O失败不回滚；损坏scope可按原set无写入返回，不能把Promise resolve解释为保存成功。MCP两个set不是事务，第二个失败保留第一个；always-approve原缓存与持久化顺序仍在。原文件锁发布竞态、拿锁失败继续执行也不修饰为强事务；独立state根并非全机器唯一锁域，项目scope文件由项目共享。

独立所有权桥持有权限update及原fire-and-forget always-approve Promise，MCP权限调用也纳入projection drain。PluginHost停止新刷新后等待消费者settle，再关闭共享SettingsHost；依赖失败不被当作仍在运行。设置方法外层以AsyncLocalStorage的活动操作计数允许旧写入/ConfigChange读写收敛，完成后旧async上下文失效，close拒绝新事务并释放订阅/重试timer。该层不是原业务方法，也不是OS沙箱；外部adapter忽略取消时仍需自行settle，未宣称所有平台/所有teardown错误均已穷举。

新增第50组`verify:settings-consumers`：7完整类105成员AST再核对，154组原类/port联合场景使用完整原SettingsManager实际自有临时文件，连接权限更新/MCP批准/SDK CLI与endpoint方法，对照磁盘字节、scope视图、context/模式、CLI状态、Hook数据和错误。29专项另覆盖真实SDK重启deny、实际owned MCP连接批准/拒绝/重启、CLI优先级、corrupt/外部symlink拒写、关闭时两次set/always-approve、过期async token、borrowed adapter、真实ConfigChange命令Hook及fallback宿主cwd。不是全并发/账户/服务端/所有CLI消费者100%。

REA对上述七个惰性完整类再次分析，证据`ev_e4d6aa312fc274bf8969d8201a0188d3758131be352c407b76d1ad7cea83aceb`；750节点/每文件750节点、150unknown、45秒，semantic graph为partial/truncated。未执行原bootstrap，SDK/OpenAI锁定版本、依赖锁、六份JSON、115 Prompt与memory policy摘要均未改。

本批最终门槛：1021核心、11Web、942编译JS smoke（821既有+23设置+29seed+22Cloud+18Addon+29消费者）、50组样本源码差分及check/build/config、CLI/Web实际启动全部通过。新的暂存快照不含原应用/bundle/旧node_modules，重新npm ci/check/build，314项编译后设置消费者/Addon/Cloud/产品/插件/市场/设置/权限/seed/SDK控制专项、11项Web测试及实际CLI/Web seed/reload启动全部通过。发布审计594文件，在所检查的凭据/运行文件规则内无发现，不是安全证明；既有17项audit风险（10中危/7高危）未强制升级。后续继续资源PromptService、daemon会话动态配置/自动重启、client-settings endpoint与完整环境/鉴权/启动链；原消费者接线已恢复不等于整个harness全部100%完成。

## 原产品环境服务与 client-settings endpoint 批次

固定CLI SHA不变。新增完整ProductEnvServiceImpl `9860010..9862805`、ClientInternetEnviromentProductProvider `9865679..9868185`、SettingsEndpointProductProvider `9890783..9892221`及BooleanUtils `15165544..15165887`，共4类21成员；完整findProductJson `9862806..9862889`、resolveEnvFromSessionFileSync `9862889..9864084`、matchDomainList `9864084..9864267`、isBuiltinModelsDisabled `15245802..15245976`、stripBuiltinModelsIfDisabled `15246138..15246237`、ObjectUtils.isChanged原函数 `15169398..15169461`共6函数。所有索引为固定样本UTF-16；完整方法体/参数AST核对，不只对照选中分支。保留原tl/td/eM constructor.name，不因可读命名误触发ProductManager按名字选择的预取逻辑。

原环境getCurrent依次检查settings.env新/旧拼写、显式env新/旧拼写、产品networkEnvironment、当前session域名；provider的顺序却为settings新、env新、settings旧、env旧、current.networkEnvironment、ENV_PRODUCT_CLI_ACCOUNT_TYPE，再尝试productConfigEnv。这个差别及字符串productConfigEnv按字符再查env的边界均保留。switch先提交env/lastSwitchedEnv再sync并吞异常，同一值不重试；switchBySession保留显式设置/环境覆盖保护。域名通配符仍只跨单标签，其他regex元字符不全面转义，非法模式仍可throw。

ClientInternetEnviromentProductProvider按lower-case环境名加载product.<env>.json，6005优先级在endpoint provider6000之后合并，故环境JSON显式endpoint可覆盖settings endpoint。deploymentType先看current endpoint是否符合cloudHostedDomain，再按selfhosted/cloudhosted推断；缺文件保留原警告/降级且不缓存失败，成功JSON永久Map缓存、不被force/磁盘改写/strip-model env改变自动清除。stripBuiltinModelsIfDisabled与完整BooleanUtils实际原语义及抛错类型均保留，六份原JSON不改。

SettingsEndpointProductProvider保留10秒TTL、force不跳过、显式env变化即失效；三个配置值沿原trim，不做类型强制修复。selfhosted/cloudhosted且enterpriseEndpoint非空优先，其后staging+current stagingEndpoint，再普通endpoint。原SettingsChange清cachedConfig并generateConfig，仅ObjectUtils.isChanged(lastConfig,next)才触发原fire-and-forget sync；不擅自把全部设置变化都变成环境重建。

root默认注入同一原SettingsManager；SDK initialize的switchEnvironmentIfNeeded现在实际调用原环境服务，USER enterpriseEndpoint持久化后经原ProductManager发布/Agent重建，并可关闭/重启恢复。sdkControl.initializeDependencies仍最后覆盖；默认匿名account:null，显式sources.authenticationManager可作为借用来源，但模型API key不冒充产品token。ProductManager/环境/默认Cloud沿同一显式env对象，不写process.env。独立ProductHost未给manager时拥有完整SettingsHost，clearSettingsCache也接同一实例；不关闭借用manager。

earlyEnvInit/同步session推断未删改原方法。原PathUtils/平台home只读桥把真实home重定向至本次state/product-environment/platform-home，仅允许产品JSON和state内USER/session布局；默认无session文件，不读取安装账户/真实home。显式resourcesRoot可以换可信产品文件，symlink越界/资源路径穿越被桥拒绝，不是OS沙箱或全部竞态防护。early helper先检查authentication.id，直接读USER不应用setting-sources合并过滤，损坏JSON分支和三平台布局均测试；none不是禁止所有读盘。真实认证storage/登录命令和自动AuthenticationManager→switchBySession调用链仍待恢复。

所有权桥跟踪原settings回调、未await的sync和已接受的服务/嵌套方法，使用活动async token允许旧任务收敛而拒绝新调用。root在关闭共享SettingsHost之前先关闭环境入口并join；独立ProductHost并发start共享初始化屏障，close等待unfinished start，不会在close后又挂载环境订阅。借用ProductManager通过代理保留prototype方法及原this。

全量回归一度暴露连续权限规则测试磁盘allow丢失；不能简单当作测试噪声。现用受控真实临时文件读时序，完整原SettingsManager、endpoint和ToolPermissionService联合对照：慢读先捕获Write；新写提交Write+Read；旧读晚到回填60秒cache；下一次remove Write从旧cache构造set，磁盘变空而context保留Read。原类与port均确定性复现。未通过新增全局锁改变源码语义；旧串行转换测试在每步等待environment/settings消费者settle，并单列这一丢规则的竞态测试。源get/set非事务、cache无版本屏障这一风险明确保留。

第51组verify:product-environment涵盖4完整类21成员/6函数及398组有限行为比较，其中1组是上述跨完整原类的真实文件竞态；27专项覆盖三平台owned早期推断、scope/none、TTL/永久缓存、JSON优先级、SDK完整initialize/真实SDK调用/重启、Agent刷新、设置回调、原型receiver、并发start/close及安全路径边界。不是全认证、所有并发或整个harness100%。

REA对四个惰性完整类和三个session helper再次静态分析，证据`ev_617c617aa0417d2060733603a0d0c2cb61cb798f9824fe67291f73d1fcd2da21`；750节点/每文件750、150unknown、45秒，semantic graph为partial/truncated，未执行原bootstrap。SDK/OpenAI版本、依赖锁、六份JSON、115 Prompt及memory policy摘要保持不变。

本批最终门槛：1048核心、11Web、969编译JS smoke（942既有+27环境专项）、51组样本源码差分、check/build/config与实际CLI/Web启动全部通过。无原应用/bundle/旧node_modules的全新暂存快照重新npm ci/check/build，341项编译后环境/设置消费者/Addon/Cloud/产品/插件/市场/设置/权限/seed/SDK控制测试、11项Web测试及CLI/Web实际seed/reload启动均通过。发布审计601文件，在所检查的凭据/运行文件规则内无发现，不是安全证明；既有17项audit告警（10中危/7高危）未强制升级。上述失败时序已明确区分原竞态与串行测试前提，不以一次重试通过代替原因分析。后续优先WorkbuddySystemPromptService/原PromptRenderer与九collector/资源模板，再继续daemon动态配置/自动重启、完整认证storage/登录/SDK启动及其他产品providers；整体目标仍未完成。

## 原资源 PromptService、九 collector 与 Desktop 文本批次

coordinator SHA仍为8624215504229c4b6190f5c2172da270e015cc96871e90b261786f047e4c6e78。完整原Binary/Collaboration/Env/ExpertManagement/ExpertPromptSlot/Identity/Memory/Personalization/UserMemory九collector、PromptRendererImpl、WorkbuddySystemPromptService及archive TimeoutError，共12类67成员；原archive logger/mutex/file-lock/path/timeout/读写删迁移及prompt/template/proxy helper合计60函数、36初始化。另initialize.js完整resolveCliSettingsLanguage `5425992..5426506`（SHA528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19）使全函数为61。全部UTF-16定位与SHA/表见源码catalog；未执行Desktop bootstrap。

runtime-context完整13声明保留env/context/default优先级与dropUndefined，样本SHA9dc270ab82e397b64bf8984e840562236c5b46435a208e8204fc14ef6b112f43。原Node代理agent-base/helpers、HttpProxyAgent、HttpsProxyAgent及parseProxyResponse共5个完整惰性CJS factory单独固化net-log.js SHA。其builtin与debug sink只作显式外部依赖，不把它们冒充完整net-log/PAC/企业HTTP栈。SDK/OpenAI、Nunjucks依赖锁均未改。

新增config/desktop-prompts的15份tpl、7份style按原字节复制（不只是归一化字符串），manifest与verify:config独立核对SHA和字节数；115 product prompt、六份JSON及memory policy原摘要不变。模板kind选择仍scene mode优先于expertId，welcome code/design文件缺失沿原fallback，plain缺失抛原搜索路径错误。未知kind可先在path.join抛TypeError，未擅自增加fallback。原Nunjucks Environment(null,{autoescape:false})、逐次compile/render及collector顺序均保持。

身份初始化保留wx/default模板、短期workspaceInitInFlight共用而非永久initialized标志、workspace-state版本与BOOTSTRAP首次补种/删除完成/用户自定义文件跳过onboarding；expert仍物化基础文件但不注入Bootstrap/Identity。stale expertId+ask会选Ask模板但vars仍按isExpert处理，未“修复”另一层语义。默认SOUL/USER/IDENTITY/BOOTSTRAP的原文与截断notice不改。

Personalization先app-config对象（空对象也阻断legacy），再legacy settings.json；七种style、trim与非法类型原样处理。locale由app配置/系统locale得出，EnvCollector不直接消费request.locale；CLI参数沿原resolveCliSettingsLanguage得到简体中文/English。项目/用户记忆8k/4k、身份/二进制/云记忆10k均是JS UTF-16 substring边界；原提示文字和代码阈值不强行统一。disableLocalSkillsMemory不禁用云记忆，expertManagement和generateMemoryEnabled严格false及远端feature门槛均保留。

UserMemory按configDir+uid共用pending Promise，本地/空结果1秒、非空远端30秒；远端空/失败有另一个30秒cooldown，不阻止1秒后重读新增本地档案。UID存在且local非空时不要求token；legacy memery经原queueMicrotask→writeProfile→per-uid mutex→跨进程锁→版本守卫/backup/temp/rename完整迁移，旧文件保留。RAW_JSON解析/UID重标记/markdown fallback、相同版本跳过/旧版本拒绝、purge路径安全方法均未改。原跨进程锁协议不是全系统强一致保证。

完整原fetchProfile仍选择product endpoint或固定生产fallback、GET /api/memory/profile、5秒timeout；空authHeaders对象会抑制Bearer fallback，而不是自动合并token。sourceProxy helpers保留HTTPS_PROXY等优先级、loopback/NO_PROXY后缀与日志脱敏。独立host默认不允许任何网络origin，即使显式给了token；授权origin与代理origin都要显式列出。自有HTTP和真实captured HTTP proxy agent已实际验证，不访问目标域名/生产服务。响应流错误与close通过外部资源桥转交原error分支，不称所有网络底层行为100%等价。

createResourcePromptHost的Node FS边界只允许自有state、当前项目和可信templates读取，写入仅自有state；平台home重定向到state/home，默认app-config位于home/.workbuddy/app/app-config.json，不与CLI四scope设置混为同一存储。原git探测仍实际执行只读git rev-parse；HOME/显式env由桥拥有，不修改宿主process.env。symlink越界和Addon内部.resource-prompts符号链接被拒绝；不是OS沙箱，不执行原登录或BinaryManager安装/探测服务。

所有权桥持有原warmup/collector/helper的Promise，归档async声明在外层observer重绑，方法体不改。关闭会销毁自有请求/响应/代理socket/Git进程、join真实close事件，等待已接受的归档迁移（含延迟tmp写/锁释放），再释放TTL timer与cache。外部product/auth/binary adapter忽略取消时仍需自行settle，未声称任意借用adapter可强制终止。

createAddonSession无显式resolver/service时默认建立该宿主，把原vars与语言交到CLI；资源状态位于stateRoot/.resource-prompts，关闭保留文件。显式prompt仍优先，borrowed service/resolver不被擅自cleanup；resourcePrompts:false保留旧fallback边界。普通CLI/Web不改成Desktop入口；原mode插件抑制legacy prompt/tools仍需显式可信assetsRoot，新增tpl不代表整套插件/第三方二进制已发布。默认每独立后端的renderer/cache隔离、产品为原固定快照，应用级共享和live ProductManager/Auth需显式借用，未冒充原应用单例bootstrap。

首条身份/个性化隐藏块的实际调用者为完整WorkbuddyUserPromptService/IdentityContextSection，包含first-turn/clear/meta、Teams/Connector/文件与项目引用/additional-data分支。本批恢复原renderUserContext接口与全部模板输出，但未用近似字符串拼接替代整个UserPromptService，实际SDK消息注入链仍列为下一模块；不因变量文件/三个render方法可用就标记完整产品Prompt pipeline已恢复。

第52组verify:resource-prompts：12完整类67成员、61全函数、36初始化AST，13 runtime声明、5完整proxy factory、22资源字节；186组有限原类/port行为场景。验证用原Nunjucks24个compiler/runtime factory，禁用其可选chokidar加载，不启动watcher或app。29专项覆盖真实SDK vars/CLI语言、identity/bootstrap/个性化/memory、cache/cooldown、原归档/迁移、HTTP/proxy、真实Git和关闭屏障等，不是全平台/所有并发/企业账户100%。

REA对12完整惰性类、60 helper及36初始化做静态分析，证据ev_2bb30afdeff5c63ccd456050615b841ad79c980e6fdd84f9f8a128c0e300be88；750节点/每文件750、150unknown、45秒，semantic graph仍partial/truncated。该证据不含后来单列的CLI语言helper，不用静态关系冒充真实业务执行。

本批最终门槛：1077核心、11Web、998编译JS smoke（969既有+29资源专项）、52组源码差分、check/build/config及CLI/Web实际启动全部通过。新的全暂存快照无原应用/bundle/旧node_modules，重新npm ci/check/build，通过370项编译后资源/环境/设置消费者/Addon/Cloud/产品/插件/市场/设置/权限/seed/SDK控制、11项Web测试及实际CLI/Web seed/reload启动；22份Desktop资源304358字节另独立核对。五份原style带末尾空行，未为diff-check裁掉原字节；.gitattributes仅对捕获资源保留文本字节/末尾空行并防止EOL转换，其他代码diff-check无新增问题。发布审计634文件，在所检查的凭据/运行文件规则内无发现，不是安全证明；既有17项audit风险（10中危/7高危）未强制升级。后续继续完整WorkbuddyUserPromptService/sections与首条隐藏上下文、默认文本插件资源、daemon动态配置/重启和完整认证/启动链；整个目标仍未完成。

## 2026-10-20：完整用户PromptService与17 sections的独立ACP宿主

固定`workbuddy-auth-product-coordinator.js` SHA仍为`8624215504229c4b6190f5c2172da270e015cc96871e90b261786f047e4c6e78`。恢复完整`WorkbuddyUserPromptService`、17个section，共18类91成员；141个完整helper和58个初始化包括XML/CDATA、Teams固定prompt、NetDrive文件类型/大小限制、元数据/附件解析、命令URI与市场查找、frontmatter、腾讯文档选区和路径扫描/灰度策略。公开文件内catalog逐项列出原UTF-16范围；不混淆为字节offset。115 product prompts、6原JSON、22 Desktop资产与SDK依赖版本均未修改。

服务保留原懒加载section顺序、first_turn/every_turn、clear-session/alreadyInjectedUserContext、Legacy additional_data合并和Teams user-context/additional-data分层。包括首条身份调用、用户规则/项目信息、实际命令内容注入、专家切换/取消、工作摘要、项目指令更新与撤销提醒、Connector状态、Agent Mail虚拟项、todo/message chips占位符、微信/IMA/乐享/网盘附件和Ardot/style/image/mode/plan原提示词。所有本批恢复的class initializer、完整函数和const initializer逐项AST对照，非只对比几个method片段；两个原可选链括号单独prettier-ignore，防止格式化改变AST结构。

源边界一并保留：网盘缓存按session建键，先Set标记再await，因此并发第二次不join Promise；skipCall无缓存不标记，普通失败缓存null、17201/17210清三个project缓存；同session换project仍复用旧结果。项目指令以trim正文去重而非version/project；空正文不清旧值，work-summary优先todo再meta并跨轮保留。Connector diff仅id/status，名称变化不再注入，空配置不清指纹；无ConnectorService连虚拟Agent Mail也不输出。Todo引用提取能从URI回落id，而chip替换只认metadata.todoId，不能“修正”为两者都回落。异常IMA percent escape仍throw；原8000/20000等各处UTF-16字数与字符串逻辑不统一重写。

`createUserPromptHost`是新增独立所有权/DI桥：默认拥有原资源PromptHost，真正调用其renderUserContext；也可借用且不关闭。借用Connector/Expert/Product/Authentication、项目根和项目指令resolver，不读取安装账户、不自动请求原项目服务。只读桥允许state/project/templates及明确pluginReadRoots，检查现存祖先与symlink，允许macOS `/var`/`/private/var`显式根别名，不宣称OS沙箱/TOCTOU保护。close拒绝新服务调用，等待在途组合和owned资源写入，调用原cleanup再释放section图；不改原业务method，也不关闭借用服务。

TencentDocsAdditionalSection完整声明、selection/file-path parser、严格个人/企业/VPC feature gate、最多512 session FIFO和fallback调用分支已恢复；外部`@tencent/tencent-docs-ai-engine`真实renderer及完整DocumentService仍未恢复。启用AI edit却不给引擎adapter会明确报错，不塞空renderer当作完成。第53组verify:user-prompts的78场有限比较使用明确的外部engine/identity doubles，仅验证源section的调用参数、顺序、门控与缓存；独立29专项另覆盖真实资源模板身份组合、源码不一致、插件文件、祖先/symlink限制及关闭屏障。不能把替身输出当原外部引擎prompt字节已核对。

REA对本批18类/141函数/58初始化的惰性片段做静态分析，证据`ev_67c767e485d8ba0c1567b31ced36d7369726abc58667119671911ea78dd4a296`；13915 AST nodes，无parse失败。semantic graph上限750节点/150 unknown、45秒，仍partial/truncated；不执行应用bootstrap，不把静态边证明为运行时等价。

**仍未接通原SessionManager→ACP/SDK消息链**：本批公开API接受ACP blocks，不冒充AgentInputItems，不用本地计数器猜首轮；CLI/Web和Addon默认prompt路径尚未改。原meta富化、真实历史首轮/重放判定、附件/codec、默认插件文本、daemon动态配置/重启、完整登录/认证和BinaryManager仍待继续。完整模块声明还原与独立组合成功，不等于整个harness 100%。

全量与首次干净安装验证再次命中原settings慢读回填旧cache导致权限规则/模式丢失的既有风险。仅在首个更新之前和各步骤间等待消费者仍不能排除后续fire-and-forget读取；因此这个只断言串行权限转换的测试显式environment:false，仍运行真实权限服务/SettingsHost，其余默认环境集成测试不关闭。已有完整原类/port确定性竞态对照继续验证丢规则的失败时序，不给原SettingsManager加锁或改缓存版本语义，也不把重跑通过当修复。

最终门槛：check/build、1106核心+11Web、1027项编译JS smoke、53组源码/行为差分、config原字节校验及CLI/Web真实启动全部通过。新的全暂存快照不带原应用/bundle或旧node_modules，重新npm ci/check/build，通过154项编译后用户Prompt/资源Prompt/环境/设置消费者/Addon/Cloud测试、11项Web和真实CLI/Web seed/reload启动；22 Desktop资产仍为304358字节。发布审计640文件，在所检查的凭据/运行文件规则内无发现；既有17项依赖告警（10中危/7高危）不强制升级。下一批沿原`SessionManager.composePromptForBackend/enrichPromptMeta`、`hasUserMessageSinceLastCompact`状态与ACP codec推进实际后端消息链，不用会话长度近似压缩后的首轮。整个目标仍未完成。

## 2026-10-20：原 ACP 输入转换与首轮核心接入 Addon/真实 SDK

沿固定CLI SHA `4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd`与initialize SHA `528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19`继续。8个完整惰性CJS factory：12502 AcpUtils、18703 prompt-codec、80742 XML、56037 StreamJsonUtils、38548 timestamps、83473 AnsiUtils、69466 Agent符号/常量、67330 compact常量/策略helper；保留全部factory AST，不只复制几个输入case。另恢复原getVisibleTodoItems及applyAcpPromptTimestamp。原ToolNames沿已恢复枚举依赖，不复制其整个带zod与产品schema的模块；外部UI/EditFile/DI依赖为明确adapter，未知访问会报错，不用空对象算法假装恢复。

原CLI renderer的annotatePromptDerivedContent、injectTrackingMeta、tryExecuteLocalCommand完整3方法恢复。annotation仅第一个multi-block user且input_text多于1才加command hint，单块command的原遗漏不修；image-path附加文本导致的index计数原行为也保留。local command在SDK转换/图片写盘前执行；stats/rewind按原分支输出TUI-only提醒。本宿主只让原parser认识这两个不可执行名字，不注册假TUI执行器、不改变普通CLI command map。其他本地命令走实际CommandManager，纯文本输入不因加ACP接口而成为新agent loop。

initialize SessionManager选取完整8方法：enrichPromptMeta、composePromptForBackend、recordSessionEvent、updatePromptHistoryState、recordSyntheticUserPromptEvent、persistLastUserPromptExpertSelection、enqueueSessionEffect、flushSessionEffects；另15个完整helper支持metadata、原始事件去重、expert v1持久化、compact/separator和首轮判定。文件明确标记fragment，不把这8方法冒充整个大类/daemon。`isCompactInternalEventPayload`保留两个嵌套可选链括号并prettier-ignore，AST不做宽松忽略。

关键证据改变了“恢复历史是否算首轮”的判断：原session创建标志始终false，sessionHasPriorUserMessages只返回hasUserMessageSinceLastCompact；recordSessionEvent在isReplay时不调用updatePromptHistoryState。因此新backend恢复SDK历史仍重新注入首轮上下文，不能从history.length或user-message计数推断。实时user chunk置true，原compact/internal/separator清false并清上一位专家。合成原始用户事件在backend send之前记入，所以即使发送失败也不回滚该标志；本轮看到compact时不把旧expert重新写回。meta富化克隆请求，daemon/session上的上一专家覆盖请求伪造值；projectId与原truthy/trim差别保留。

新增`createAcpInputHost`为独立SDK所有权桥，Addon公开惰性`promptAcp({prompt,_meta},options)`入口：原UserPromptService组合 → 合成原始用户事件 → 原local command → AcpUtils.promptToUserMessage → StreamJsonUtils.parseMessagesFromPipeInput → annotation/timestamp → 既有backend/AgentService/真实SDK。没有手工把ACP blocks强转AgentInputItems，也不重新实现SDK。SDK inputSubject的新增历史经原AcpUtils投影驱动原状态；回放只按isReplay记录。独立接口返回文本，不冒充完整ACP RPC PromptResponse；原`.prompt`和CLI/Web默认入口不改，`acpInput:false`可禁用。

默认借用Addon资源PromptHost，保留原renderUserContext/17 sections；必要时单独owned创建。metadata storage用既有SDK session.meta.axonfireAcpOwnerRecord与SessionStore的明确adapter承载原v1专家结构，不模拟原账号/history数据库。state/project/显式readRoots限定图片读取；缓存仅写owned acp-input/cli/clipboard-images，保留原时间/sha1扩展名与existing absolute path优先，不写process.env、不扫描已安装home。外部image path不合法则回落到传入base64；source.type:text document原来只加base64 URI前缀但不编码，未“修复”。Addon内部acp-input拒绝symlink，路径桥不等于OS沙箱或TOCTOU保护。

关闭时先拒新ACP入口并关闭SDK后端，join已接受组合/异步观察者/原effect chain，再释放owned用户Prompt服务和借用资源，避免先关resource导致旧组合中途失败。原source synthetic/live通知的异步sink也由外层跟踪/记录rejection。普通SDK入口与ACP入口的原后端并发保护仍存在；外层ACP同会话拒绝第二次组合，不承诺完整daemon排队/cancel barrier。

第54组verify:acp-input对8完整factory、原Session 8方法/15helper、renderer3方法与2个额外helper逐项完整AST核对，并做235组有限行为比较：协议/元数据/徽标encode-decode、隐藏文本、文件/选区/图片、stream JSON/document、原meta/去重/合成事件/首轮/replay/compact及expert v1边界。验证原代码来自惰性declaration replacement，没有执行应用bootstrap。21专项另经真实SDK验证首轮/续轮、Teams引用、图片缓存、失败重试不回滚、恢复backend重新注入、真实history publication驱动compact、local reload/TUI提醒、时间戳、专家持久化/清除、并发/关闭、symlink与sink rejection；不等于所有平台、全部图片/文档或所有RPC分支穷尽证明。

REA静态证据`ev_677282a144de12af579ad9262517f0d232530cc36cf8dc803c0d504ed76f016e`覆盖本批惰性原声明，22657 AST nodes、0 parse失败；750 semantic节点/150 unknown、45秒，仍partial/truncated，不把静态边当运行时等价。OpenAI Docs核对了[官方SDK入口](https://developers.openai.com/api/docs/guides/agents/quickstart)，实际契约仍以本地锁定0.5.2源码和原调用链为准，未按当前文档升级SDK或替换SDK输入实现；测试仅自有Model/loopback，不调用生产模型或安装账号。

剩余范围：完整AcpView/RPC/连接认证/广播/队列与cancel barrier、SessionManager任务/Plan/权限请求回放与真实HistoryStore、原全局配置/插件home共享、动态mode/runtime自动重启/回收、真实Auth与BinaryManager、腾讯文档外部engine等仍未恢复。本批SDK入口可用不代表整个产品消息pipeline和完整harness 100%；默认文本插件资产/全部第三方二进制也不能据此算完成。

最终门槛：check/build、1127核心+11Web、1048编译JS smoke、54组源码/行为差分及config/CLI/Web启动全部通过。新的全暂存快照无原应用/bundle/旧node_modules，重新npm ci/check/build，通过175项编译后ACP/用户Prompt/资源Prompt/环境/设置消费者/Addon/Cloud相关测试、11项Web、CLI/Web seed/reload实际启动与原字节配置检查。115 product prompts、6 JSON、22 Desktop资源（304358字节）及SDK依赖未改。发布审计647文件，在所检查的凭据/运行文件规则内无发现；既有17项依赖告警（10中危/7高危）保留。后续继续完整原CLI AcpView/通知tracking与daemon会话控制，不把本批8个SessionManager方法与SDK示例当成整体目标完成。

## 2026-10-20：完整 ACP Agent/View、团队桥与流式协议核心

固定 CLI SHA 保持 `4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd`。新增完整 AcpAgentImpl（95 成员）、JsonStreamParser（17）、AcpView（22）、AcpTeamBridge（21）、DetachedMemberSseBridge（13）、AcpToolInterceptor（28）、TelemetryUtils（9）、RequestError（12），合计 8 类 217 成员。Agent 16 个完整函数、View 2 个函数以及关联常量一并保留；另 5 个完整惰性 factory 包含 Deferred、协议 tokens、W3C trace、历史 fork/用户消息 ID 和 ErrorUtils。新 wrapper 只承担显式模块解析/时钟/定时器，完整类体与声明的编译后 AST 对照，不执行原 74428 巨大模块的 bootstrap。

原生转发器不再只剩输入转换：保留 phase/progress/input/model/result/interruption 订阅、工具 pending/delta/done 与原 JsonStreamParser、tracking/compact generation/response-model 元数据、旧 result 忽略、interceptorGate/compact continue 抑制、团队终态与 session-idle 双重完成门槛、ModelBehaviorError 自校正、权限拒绝 cancelled 通知、审批 ACK 等待/客户端-abort-本地竞争和 WeakSet 去重。完整 ErrorUtils 恢复覆盖先前窄接口未导出的 getErrorMessage、stream timeout、empty stream、retryable model 等协议依赖。

保留源边界：Agent 5000 毫秒 ACK 超时返回 false、View abort 抛 AbortError；取消后不足 500 毫秒（含负差值）短路；busy prompt 走 queued 分支；background drain 在运行前清空队列且失败不恢复；iterator return 后仍先读取已停放项；退出 plan 的先前模式恢复、Ask ID 512 上限、空/重复 denial ID 过滤不重写。完整声明恢复不意味着这些原行为全部理想或可直接当新产品默认策略。

第55组 verify:acp-protocol 对 8 完整类/217 成员、29 声明、5 完整 factory 做 AST 核对；36 组有限差分包含增量 JSON 的全部切分位置、RPC/trace/mention/history/cache、ACK/abort、queue/iterator、审批各 outcome/本地竞争、compact/retry/team idle 和清理。协议客户端/外部服务为明确测试 doubles，不算原服务已上线。另一个真实 Agents SDK 集成通过既有 AgentService/SessionManager/TaskManager 跑 owned Read、工具结果、文本流和第二轮历史重放；只在该 fixture 显式 bypassPermissions，避免同时运行两个审批 owner，不修改默认安全策略。共37项新增测试。

REA 对三份惰性模块的静态证据为 `ev_fad57295cf09e96e53ed43bdf1ace2615cd12bf0bc75828c7bf81803122e30e2`，35243 AST nodes、3文件、0 parse failures。semantic graph 上限750节点/150 unknown、45秒，仍 partial/truncated；不将静态图或有限差分当整体运行时等价证明。

接线边界明确：公开 createNativeAcpAgent/createNativeAcpView/createNativeAcpPrimitives；依赖缺失明确抛错，不注入空业务服务。默认只含原 RequestError，不冒充完整 ACP transport SDK；外部 transport 需显式提供模块38113。CLI/Web、Addon.prompt 与上一阶段 promptAcp 默认链路不改。完整 View/Agent 类体已经恢复，但 RPC/连接 guard/广播、usage/title/friction 服务生产接线、审批 owner 切换仍待继续；Desktop SessionManager/HistoryStore/Plan 重放、daemon mode 自动重启、全局插件配置、真实认证/BinaryManager/外部 Docs 引擎等也未完成。SDK依赖、115 product prompts、6 JSON、22 Desktop资产字节未修改。参见 [ACP 协议核心](acp-protocol.md)。

最终门槛：check/build、1164核心+11Web、1085项编译JS smoke、55组源码/行为验证、原字节配置及CLI/Web实际启动全部通过。新的全暂存快照不带原应用/bundle/旧node_modules，重新npm ci/check/build，通过212项编译后ACP协议/输入/用户Prompt/资源/环境/设置消费者/Addon/Cloud相关测试、11项Web及CLI/Web seed/reload实际启动和配置检查。发布审计656文件，在所检查的凭据/运行文件规则内无发现，不是安全证明；既有17项依赖告警（10中危/7高危）保留。下一批优先恢复完整 friction/title 等源依赖，明确审批归属，再接完整View/RPC/广播与daemon会话控制；整个目标仍未完成。

## 2026-10-20：ACP 完整源服务、导出接口与 View 执行依赖接通

固定 CLI SHA 仍为 `4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd`。新增完整 SessionTitleServiceImpl（16成员）、FrictionAnalysisServiceImpl（9）、FrictionRecallClientImpl（1）、AcpBroadcastServiceImpl（26）、AcpUsagePublisherImpl（13）、UsageUtils（5），合计6类70成员、17全函数、15初始化。8完整惰性factory保留标题helpers、MessageContentUtils/MessageUtils、SessionUtils、usage分类/上下文构建器和完整ProductFeature/FeatureToggle枚举。原title/friction/recall模块16个导出getter单独AST核对，含Service/Client DI Symbols与同一Impl引用；getModule(68593/18945/43324)对应原导出，不只移植Impl而漏掉接口。巨大74428/93039模块未冒充全量恢复或执行其bootstrap。

保留原标题非TTY/force/env门槛、最短2 UTF-16 units、三次失败放弃、15000毫秒race、custom-title优先、generation ID、完整session prompt和JSON/regex解析。friction的boolean true gate、3000毫秒/POST/原路径、19个类型映射和root-cause集合、request/session去重、20/10条历史窗口、300字execution signal均按原实现；最高score结构合格但标签无效不尝试次高，上报前先标记reported导致失败不重试，不“修复”为新的策略。

广播原origin排除、tracking/compact/subagent、permission/question/checkpoint和session_end idle+0毫秒复查保留；ACK超时是2000毫秒而非主Agent/View的5000。usage保留250毫秒coalesce、used/size/cost/message/category去重、原快照request ID、团队stage先标记后发送及失败不重试、cache token优先级、CJK/ASCII/图片/hidden-section与token总数守恒分配。找不到model.maxInputTokens时原样skip/warn，不用估算上限制造一条成功usage。

createAcpServicesHost为明确新增所有权/DI桥，借用真实SDK backend与父ACP有边界的resolver，原类方法不改。外层shim观察嵌套/fire-and-forget Promise并保留facade方法name/arity/稳定引用；原未await的terminal updater、计数器和日志异步回调也被观察并保留receiver。close先拒新服务调用/连接登记，停broadcast/usage订阅，保持旧title/broadcast timeout race，join后清owned timers/连接/prompt状态图；不关闭借用backend/client/REST/Event/terminal服务。超时赢race不取消借用模型，请求/外部adapter自己负责传输和取消，这不是OS沙箱或所有借用操作终止证明。

默认没有远端recall/report网络能力；功能开启而缺少adapter时明确错误进入原catch/log，不塞空召回或假telemetry当完成。friction capture/tryReport方法可供原telemetry链调用，但还未自动恢复Galileo/EventService和request-send hook。原DI decorators不执行；新服务宿主不是原全局App/bootstrap。

第56组verify:acp-services核对完整声明/类体、8 factory和16导出getter，再做18组有限行为差分。另6项宿主/真实SDK测试，共24项：完整原AcpView.executePrompt以实际AgentService/SessionManager/TaskManager执行Read、工具结果、两轮历史、旁路广播、session_end、usage和原标题生成；另验关闭期间title/broadcast/未await回调、方法引用/arity、借用backend继续可用以及默认不连接外部服务。协议/recall/report边界使用明确doubles；SDK模型和文件均为owned fixture，单独bypassPermissions以避免两个审批owner，不据此声称默认ACP审批已等价。

CLI/Web、Addon.prompt与promptAcp默认入口未切换。后续仍需完整RPC/NDJSON/HTTP/连接guard/认证、审批owner及入口切换、Source request-send telemetry/标题Hook、Desktop SessionManager/HistoryStore/Plan重放、daemon mode动态配置/自动重启、真实Auth/BinaryManager/外部Docs引擎等。完整View直接执行与原组件保真比上一阶段更接近目标，但整个harness仍未完成；[ACP服务边界](acp-services.md)明确列出剩余范围。

REA对本批两份源服务/所有权宿主的静态证据为 `ev_f0869863d3a63ce4b2b839a0f8477b290519e9867fb087e94e010638f435d02a`，16007 AST nodes、2文件、0 parse failures。semantic graph 上限750节点/150 unknown、45秒，仍partial/truncated；不执行应用bootstrap，不把静态图或有限差分当整个harness运行时等价。SDK依赖、115 product prompts、6原JSON与22份Desktop模板字节保持不变。

最终门槛：check/build、1188核心+11Web、1109项编译JS smoke、56组源码/行为验证、原字节配置与CLI/Web实际启动全部通过。新的全暂存快照不带原应用/bundle/旧node_modules，重新npm ci/check/build，通过236项编译后ACP服务/协议/输入/用户Prompt/资源/环境/设置消费者/Addon/Cloud测试、11项Web和实际CLI/Web seed/reload启动及配置检查。发布审计664文件，在所检查的凭据/运行文件规则内无发现，不是安全证明；既有17项依赖告警（10中危/7高危）不强制升级。后续继续完整RPC/连接manager/guard、入口与审批owner切换、原request-send telemetry/标题Hook以及daemon会话控制；整个目标仍未完成。

## 2026-10-20：ACP 连接/Stream/Guard 与完整修改版 SDK

固定 CLI SHA 不变。恢复完整 AcpAgentManagerImpl、AcpServerImpl、AcpContextImpl、AcpController、AcpTransportManagerImpl、AcpTransportImpl、AcpTransportFactoryImpl、AcpStreamManagerImpl、AcpConnectionGuardImpl、AcpSecurityMiddleware，10类84成员；另16完整函数、4初始化、6个类外静态配置赋值和原var eG自引用。类体之外的静态赋值也逐项AST核对，防止漏掉30分钟/0/5000/30000毫秒与sweep kind。原HTTP decorators不执行，但4条完整路由的verb/path/action和post的Body参数零与样本核对；POST /connect没有误作GET。

完整factory38113恢复样本修改版ACP SDK：5类88成员、6完整顶层函数及全部内联schema，8个原导出接口。manifest版本0.25.0不能证明stock npm SDK等价；保留样本NES/provider/CodeBuddy扩展，不替换OpenAI SDK。原Zod factory25223独立执行确认core是4.0.0；使用既有锁定zod3@3.25.67的v4模块，由有界局部CJS loader隔离内部裸zod自引用，避免误用根zod4.3.5。参考差分侧运行完整原Zod factory，不与移植侧共用同一npm Zod。未复制整个Zod或改动依赖版本。

保留原guard TTL非滑动/严格大于过期、容量检查先于同ID替换、5000毫秒idle grace与dead连接优先；HTTP双Accept门槛、初始化校验前置标志、id0与batch回复；write/flush异常和drain背压；server request暂停idle、任意client POST恢复、POST heartbeat续idle deadline；cancel grace正常cancelled result与idle -32800回收。原首个orphan sweep清其他in-flight标记却留下对应POST stream，不在source类里修正。server.stop不释放订阅/transport，原transport.close为空，stream.close不结束incoming controller；测试宿主拥有并显式关闭这些资源。

第57组verify:acp-connections完整AST核对，再做29组连接和9组SDK/Zod有限行为差分。41项专项含三项真实owned PassThrough/Node HTTP loopback测试，以原Server/Controller/Stream和完整修改版SDK完成UTF-8 NDJSON、POST双向permission/通知、独立GET SSE和DELETE。业务Agent、认证、文件/终端为明确doubles，不算完整业务Agent/View.render已接进RPC。原middleware缺少依赖会next、loopback绕过认证/token；不提供默认公网listener或声称完整认证。旧primitive无参默认值仍仅RequestError，可显式注入完整模块38113。

REA对三份惰性组件/SDK/Zod桥静态分析证据`ev_08971e22aaf8eb0c81242c356eca7d8772e286fff0d2e4e88359c89509e66cb7`，25158 AST nodes、3文件、0 parse失败；semantic上限750节点/150 unknown、45秒，仍partial/truncated，不执行应用bootstrap，不作为运行时整体等价证明。OpenAI Docs仅核对[SDK运行/流式边界](https://developers.openai.com/api/docs/guides/agents/running-agents)，还原依据仍是锁定SDK和原样本，不用当前文档改写历史逻辑。

完整业务RPC入口、View.render迭代/关闭与单一审批owner、真实网关认证、request-send telemetry/标题Hook、Desktop SessionManager/HistoryStore/Plan回放、daemon模式自动重启回收仍待继续。CLI/Web、Addon.prompt和promptAcp默认路径保持不变，整个harness没有宣称100%完成；[连接说明](acp-connections.md)记录API与所有权边界。

最终门槛：check/build、1229核心+11Web、1150项编译JS smoke、57组源码/行为验证、原字节配置与CLI/Web实际启动全部通过。新的暂存快照不含原应用/bundle/旧node_modules，重新npm ci/check/build，通过277项编译后连接/服务/协议/输入/用户Prompt/资源/环境/设置消费者/Addon/Cloud相关测试、11项Web、实际CLI/Web seed/reload启动与配置检查。SDK依赖、115 product prompts、6 JSON与22 Desktop资源（304358字节）保持不变。发布审计675文件，在所检查的凭据/运行文件规则内无发现，不是安全证明；既有17项依赖告警（10中危/7高危）保留。

## 2026-10-21：完整 ACP View 循环、单一审批归属与取消生命周期

固定 CLI SHA 不变。新增 native-acp-lifecycle 的6完整惰性factory：7357/66742 task outcome与错误类别、95449 ReferenceService token、99006 session接口/phase、71389全部run-state枚举/helpers、50523完整取消清理。另恢复HostCapabilityProvider完整类/常量、CliExternalUriOpener完整类，以及team pause/resume等5函数和原WeakSet，共8完整声明；没有执行decorators，也不冒充整个71915/79814聚合模块。

保留源取消的Plan恢复/残留清理、in_progress任务仅加metadata不改status、allSettled/日志容错、compact两种检测、queue浅拷贝不清原队列和progress/reset顺序；follow-up仅恢复cancel暂停原因；URI先通知后open，失败返回false。第58组verify:acp-lifecycle对全部factory/声明做AST核对、14组有限差分，并以完整原Agent/View/primitive/services/ACP SDK（参考侧完整原Zod factory）和真实SDK后端做批准、拒绝、Defer Write、自动Read、Always Allow及deny rule六组成对集成。仅比较时归一化临时目录，不用有限运行代替时间/随机meta的全部证明。

createAcpViewHost为明确新增的已有会话所有权桥，运行完整原render/iterator，而非单次executePrompt或新agent loop。借用实际SDK backend、专用source Agent/连接、源ServicesHost与显式DI/Context；rpcAgent facade拒绝关闭后的新RPC，缺少真实父依赖不会填空服务。外围观察源async事件订阅、SDK result.completed、history/审批续跑、任务存储和未await队列分支；拥有View定时器/监听，source类体AST不变。Noop trace原clone策略抽到共享宿主helper，不改SDK/global processors。

backend.approvalOwners只在内存保存精确session lease；idle、无pending、无standalone执行时才可claim/release。实际主会话当前item及queue对象身份均匹配才让旧UI退出，不依靠持久化meta/伪造parent ID。原控制器接受该SDK待决item后登记standalone执行器的一次性call ID/name凭据，Defer归属真实目标；自动Read/规则/Always Allow则被动观察原native gate、不重复分类，false中的allowed=false/permissionDecision=deny缓存不算放行，仍由原hook pipeline阻止。人工未owned/过期/无state/sandbox不登记。原ACK/allow/always/reject/abort竞争仍由完整source Agent处理，不启用bypassPermissions；View要求nativePermissions/nativeApprovals都启用。

占用期间旧prompt/compact拒绝并发，原standalone队列派发唤醒完整View.triggerDrain；释放后恢复旧入口。TeamLeadInboxPoller对精确session借用同一源WeakSet，释放保留暂停状态。close走原cancel、结束iterator、处理未完成Deferred，join owned SDK/审批后才对已abort且仍CANCELLING的会话做宿主关闭归一化；不改原运行期取消行为。借用backend/services/connection由父宿主按顺序关闭。

新增34专项（14源依赖、7归属、13完整View/SDK），实际批准/拒绝/Defer Write、自动Read、Always Allow后二次Write、deny=false无落盘、两轮history、队列唤醒、取消无落盘、异步CLI设置等待、Context错误/启动失败和close后legacy可用都通过，不再仅bypass测试。另发现并验证原View发送session_end产品扩展、而原SDK client schema以-32602拒收；分别记录原始wire与丢弃，不改宽schema。这不证明原产品UI收不到消息，因为其通知消费者尚未证实相同。SDK差分现10组，连接专项42项。

REA对生命周期/新View宿主/审批归属/权限观察桥/后端接线/团队暂停/Noop trace共7文件的最终静态证据`ev_2a8162465945f3ed8a1dc37cf929443d231fd367cf78cd10926298d7f8d7fa3a`，17890 AST nodes、0 parse失败。semantic上限750节点/150 unknown、45秒，仍partial/truncated，不执行应用bootstrap，不冒充整个运行时等价。OpenAI Docs核对[官方审批/续跑边界](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals)，实际仍使用锁定SDK和原调用链，不根据当前文档改写样本。

剩余：默认完整ACP父runtime/内部新会话与认证路由/启动入口、Ask/Plan/回放完整交互、真实AuthenticationManager/网关、Desktop SessionManager/HistoryStore、daemon模式自动重启回收、request-send telemetry/标题Hook及外部Docs/其余native服务等。CLI/Web默认仍可用但未整体切换ACP；这个现有会话完整循环不是整个harness 100%。见[ACP View宿主](acp-view-host.md)。

全量干净编译首轮暴露两处验证问题：仓库根直接node --test误用package相对config路径，改在harness workspace执行；已有串行权限变换测试即使environment:false仍出现defaultMode丢失，说明仅关环境provider不排除其他源并发读，也不能把flush当全部消费者屏障。该聚焦断言改为专用真实SettingsHost/PermissionHost和session，保留相同磁盘/模式/重复项严格断言；其余默认完整消费者测试和完整原类的确定性慢读回填/丢规则对照仍保留。没有给原SettingsManager加锁、版本化缓存或改变生产语义，不把重跑通过当修复原竞态。

最终门槛：check/build、1264核心+11Web、1185项编译JS smoke、58组源码/行为验证、原字节配置与CLI/Web实际启动通过。无原应用/bundle/旧node_modules的暂存快照重新npm ci/check/build，在正确workspace运行全部1264项编译后核心测试和11项Web全部通过，实际CLI/Web seed/reload启动与配置检查通过。115 product prompts、6 JSON、22 Desktop资源（304358字节）和SDK依赖版本保持不变。发布审计686文件，在所检查的凭据/运行文件规则内无发现，不是安全证明；既有17项依赖告警（10中危/7高危）保留。

## 2026-10-21：完整内部 AgentController / SessionFactory / SessionMiddleWare

固定 CLI SHA 不变。恢复完整内部 AgentController（3方法）、SessionFactoryImpl（create）、SessionMiddleWare（构造器/17方法）、SandboxApprovalStoreImpl（构造器/4方法）及 SessionNotFoundError/InvalidSessionIdError/ForkOperationError 完整构造器。合计7类30成员、10完整声明，包括 runState 属性 helper、两份默认状态和 sandbox key helper。STANDARD_HEADERS、setupFired 两个类外静态赋值、原var eO/eD、自引用/模块绑定均校验；GET models/POST run 与 Body0/Header1 的 decorator 元数据也核对，不执行decorators、不启动原应用。

保留原 sessionId/resume 优先级、continue/current/store 分支、空ID truthiness、fork浅拷贝/force save、Usage活动分支、seed引用、ReplaySubject(0)在锁定RxJS仍缓存一项、runState按status/transition.at抑制更新。保留插件refresh→目录信任→类级Setup→SessionStart的次序、print/ACP跳信任、Hook不阻塞handle、Setup失败不重试、barrier identity清理；未给原忽略finally返回Promise的异步失败分支加业务修复。Plan/Auto/override/已有模式/危险跳过/设置scope的原优先级、undefined model override清旧值、Defer工具配置与错误文本均保留。控制器原print等待/普通setImmediate、trace重置、未校验Number(maxTurns)、stream-json报错、标准header黑名单与旧自定义header保留、getModels顶层字段过滤也未改写。

第59组verify:session-ingress对全部完整声明/类体/静态值/自引用/绑定/routes/参数进行AST核对，执行44组有限行为差分。另2项完整原ACP Agent测试证明匿名认证与初始化失败在REST/新session rendezvous之前拒绝，不制造“已登录”状态，也不把模型API key当产品账户。组件测试的SessionManager/认证/路径/HTTP边界明确使用owned doubles；Usage沿用已还原UsageUtils和真实固定SDK Usage。没有凭空补出完整原SessionManager，也没有替换默认CLI/Web业务链。

REA对完整native-session-ingress单文件的静态证据为`ev_ff9b11b7b4c10649ac812b0b2c378bf36c6ba379f250885f40e113c727a2d3bf`，3162 AST nodes、1 parsed file、0 parse failures。semantic上限750节点/150 unknown、45秒，仍partial/truncated；未执行bootstrap，不用这些有限测试声称整个运行时等价。

仓库继续采用apps/cli、apps/web、packages/harness、docs、scripts分层和现有开箱即用命令。新增smoke:session-ingress并纳入根smoke:runtime/CI链；新源码通过workspace子路径显式访问。README合并旧ACP阶段描述并链接新[会话入口边界](session-ingress.md)，避免把组件恢复、已有会话完整View与默认父runtime混为一谈。

剩余：完整原SessionManager/Store及其与HTTP Context/连接/Agent.setSession/View的rendezvous、实际认证storage/网关与默认启动入口、Ask/Plan/回放端到端、Desktop会话/HistoryStore、daemon自动重启回收、request-send telemetry/标题Hook、其余native与外部Docs引擎。原manager同ID合并/异ID完成旧subjects的语义已定位，不能用现有独立宿主多会话cache冒充。整体目标仍未完成。

最终门槛：check/build、1310核心+11Web、1231项编译JS smoke、59组源码/行为校验、原配置字节及真实CLI/Web seed/reload启动均通过。暂存快照不带原应用/bundle/旧node_modules，重新npm ci/check/build后，在harness workspace执行全部1310项编译后核心测试及11项Web全部通过，配置与CLI/Web实际启动也通过。115 product prompts、6 JSON、22 Desktop资源（304358字节）和SDK依赖固定版本不变。发布审计693文件，在检查的凭据/运行文件规则内无发现，不是安全证明；既有17项依赖告警（10中危/7高危）保留。

## 2026-10-21：完整原生 CLI SessionManager / SessionStore / 取消草稿

固定 CLI SHA 不变。恢复完整 SessionManagerImpl（38成员）、SessionStoreImpl（28成员）、AbortedStreamDraftStore（21成员），含完整构造器和全部方法；另有createAbortableIterator、abort grace初始化、history limit函数/初始化，共7完整声明。完整惰性factory73571反向读行、95695持久化开关、89483 content-block sanitizer也恢复；没有拿独立宿主reverseLines替代。类体/声明/factory/模块绑定逐项AST校验，未执行原decorators/应用bootstrap，也不冒充整个71915或Desktop会话模块。

保留原create不发布当前会话、HTTP Request scope fallback、相同ID旧对象/options/缺失meta合并/abort重置、不同ID完成10个旧subjects与进度/cron/task/result/timer回收。保留addHistory processor→发布→UserPromptSubmit→checkpoint→append顺序、已排队失败继承、Hook失败内存与磁盘差异、SessionStart WeakMap完成后仍缓存、BehaviorSubject重建consumer旧结果重放、cancel-nudge跳过、原gate/metadata/interceptor/telemetry分支。完整取消草稿在真实SDK取消中以incomplete/isPartialAborted落盘；不补新的idle/终止状态语义。

Store保留当前/cwd/跨项目/subagents定位、逻辑ID/物理storeId、反向65536 chunk/history limit/损坏行跳过、birthtime fallback/sanitizer、listing/most-recent非用户过滤。保留save非空JSONL不覆盖、meta非空才写、空meta冷加载undefined、saveHistory重复追加、浅拷贝副作用、timestamp0被Store真值分支覆盖、usage/cache旧字段、真实image/tool-result blob转换。原writeLocks存previous.then(()=>gate)却在finally比较gate，正常操作后Map条目保留，gate仍释放且IO失败后可再append；已成对验证，未修复原业务行为。remove保留override maps，getAllAcrossProjects原Manager丢参数等也保留。

第60组verify:session-stack核对3类87成员/7声明/3factory/模块绑定，做48组有限差分。50专项含2项真实固定SDK集成：已有还原AgentService/Runner/Read与完整原Manager/Store/Factory执行Read并写JSONL，以新建原Manager/ALS/订阅对同一owned存储冷恢复续聊；真实stream取消后完整DraftStore落盘partial文本。原样本完整Manager/Store/DraftStore再各跑一次，共2组成对SDK验证。比较确定回复/类型/副作用/用量等，不把随机IDs/所有metadata称为穷尽等价。

已有AgentService需要ensureRunResultHandler，测试facade仅委托原handleRunResult，不加第二consumer、不改类体。集成初次失败定位到空meta冷加载与现有HistoryAgentRunInterceptor不兼容；成功用例显式seed非空owned meta并按原入口顺序save，保留空meta不补对象的独立测试。权限初始化、HTTP attributes、Hook/checkpoint/注册与telemetry等为明确doubles，模型/文件/存储均owned，不伪造产品账号。作用域LocalNoopTrace避免测试线上追踪，不改全局SDK处理器或依赖。OpenAI Docs核对[SDK运行/流式边界](https://developers.openai.com/api/docs/guides/agents/running-agents)，还原仍以锁定样本/SDK为准。

REA对native-session-stack单文件的静态证据为`ev_c9c727f3e1ec3776f205ca6172ea46f94613cbaa9b591c6f03484dd8786432aa`，11064 AST nodes、1 parsed file、0 parse failures。semantic上限750节点/150 unknown、45秒，仍partial/truncated，不执行bootstrap，不把静态图当运行时整体证明。

仓库分层/默认CLI/Web/已有ACP ViewHost不改；新smoke:session-stack纳入根smoke与CI，显式嵌入接口及边界见[原生会话栈](native-session-stack.md)。下一步仍需完整原AgentService/其前置interceptors、父HTTP Context→middleware→Agent.setSession/View rendezvous、真实AuthenticationManager/网关和默认启动切换；Desktop HistoryStore/daemon自动重启/Ask/Plan回放/telemetry与Docs等仍未完成。整体目标保持未完成，不能把完整CLI会话类等同于整个harness。

最终门槛：check/build、1360核心+11Web、1281项编译JS smoke、60组源码/行为校验、原配置字节与真实CLI/Web seed/reload启动均通过。无原应用/bundle/旧node_modules的暂存快照重新npm ci/check/build，在harness workspace运行全部1360项编译后核心测试和11项Web通过，配置及CLI/Web实际启动通过。115 product prompts、6 JSON、22 Desktop资源（304358字节）和SDK固定版本未改。发布审计701文件，在所检查的凭据/运行文件规则内无发现，不是安全证明；既有17项依赖告警（10中危/7高危）保留。

## 2026-10-21：完整原生 AgentService / 前置执行链 / History 输入工具

固定 CLI SHA 不变。保存 AgentServiceImpl 完整 9 成员，及本聚合模块全部 31 个 interceptor 完整类，共 32 类169成员、45完整声明、9函数、19初始化值。原 constructor/name map 还借用此前恢复的 WorktreeContextInterceptor，共32个拦截器名称；不重复计算外部类。完整37个原export getter、模块绑定、配置判断与内嵌DeepResearch/Ultracode/teammate等prompt保留。未执行原decorators/应用bootstrap，未声称恢复整个66545聚合模块。

完整factory69466/7340和77787/18553/21580/58830/46943/2623/4636，共9个，包含Agent tokens/constants、SessionUtils、AgentPurpose、产品SDK wrapper、HistoryUtils、InputItemUtils、MessageUtils、resend branch与summary/error。产品wrapper只重导出固定SDK、定义8种custom item及user ID补充，模块25301仍使用真实npm SDK，未复制SDK实现。Memory动态OS导入所需原namespace-loader IIFE单独完整保留；测试只注入owned身份fallback，不读真实Git/系统身份。

run保留authentication initialized屏障、runner取得时机、maxTurns有限正数（含1.5）、严格true才移除bypass选项、原abort连接、resultSubject/signal发布；不主动设置state/安装第二stream消费者。原前置排序、History边界后插件刷新及同名托管Agent重绑、状态/span所有权与queue drain保持。one-time不发布主会话history/result，override原型派生/permission副作用、fork过滤与tools恢复亦保留。

第61组verify:agent-run对完整声明/类体/factory/37getter/绑定/name map/namespace loader做AST核对，并执行47组成对有限场景与4组成对真实SDK测试。专项51项。原样本片段在同一显式DI边界独立运行，不执行产品入口；AST与确定性快照不冒充全功能穷尽证明。

真实SDK组合完整原AgentService、15原interceptor、完整原Manager/Store/Factory、已还原AgentManager/Factory/Read/ProductPromptRenderer，执行Read→JSONL、全新Manager/ALS从空meta磁盘会话冷恢复、同RunState续轮、stream取消partial草稿与one-time usage。原system-reminder-md渲染后，owned规则文件实际进入模型输入。原History的optional meta配合原Telemetry在正确阶段创建rootRequestId等，解决上一批旧移植History冷meta不兼容；不改Store冷加载语义、不补假meta、不用旧ensureRunResultHandler facade。权限、HTTP、memory/telemetry外部服务明确为owned test adapters；没有生产认证快照/请求。

REA 6.7.0对两个惰性源码文件的静态证据为`ev_267c38332ef956e2cfa2d763114bd32839136217310d07cefce464953318bda0`，29403 AST nodes、2 parsed files、0 parse failures。750节点/每文件750、150unknown、45秒限制下semantic graph仍partial/truncated，不执行bootstrap，静态图不作为运行时整体证明。

保持apps/cli、apps/web、packages/harness、docs、scripts分层，根smoke与CI加入smoke:agent-run。接口与边界见[原生执行链](native-agent-run.md)。完整原RunnerFactory/Provider尚未接入：上述集成直接用固定SDK Runner。默认CLI/Web仍使用已验证的独立宿主，不能将完整类恢复等同于完整原生启动。下一步为原Runner构造、父HTTP Context→middleware→Agent.setSession/View rendezvous及资源所有权；真实认证/网关、Desktop HistoryStore、daemon重启、Ask/Plan回放、request-send服务和Docs仍未完成，整体目标保持进行中。

最终门槛：check/build、1411核心+11Web、1332项编译JS smoke、61组源码/行为校验、原配置字节与真实CLI/Web seed/reload启动均通过。暂存快照不带原应用/bundle/旧node_modules，重新npm ci/check/build后，在harness workspace执行全部1411项编译核心测试、11项Web、配置和CLI/Web实际启动均通过。115 product prompts、6 JSON、22 Desktop资源（304358字节）与SDK固定版本未改。发布审计710文件，在已检查的凭据/运行文件规则内无发现，不是安全证明；既有17项依赖告警（10中危/7高危）保留。

## 2026-10-21：完整原 RunnerFactory / Provider / loop 与默认 Runner 切换

固定 CLI SHA 不变。恢复完整 RunnerFactoryImpl（43843，5方法）、RunnerProviderImpl（66545，1方法）和ToolCallLoopDetectorImpl（66545，9方法），共3主要类15成员/5完整声明/4原export getter。原retry helper、工具专用/通用prompt、retry/exhausted marker、loop阈值与blacklist均保留；40038 loop tokens、67330 compact配置/环境/枚举与3927 NumberUtils为完整原factory。没有执行decorators/聚合模块bootstrap，不复制SDK实现。

原create参数未使用，配置只有modelProvider/inputFilter。保留loop退款短路→checkAutoCompact→完整HistoryUtils内容过滤/截断处理→await空的injectSendNowItems→非辅助purpose状态事件的顺序。check/deferred compaction和退款/状态失败由原分支捕获/记录；空send-now方法不脑补逻辑。shouldCompact使用历史UsageUtils而非session聚合usage/rawResponses、trailing tool tokens、storeId物理subagent、阈值/环境/未知窗口fallback、meaningful post-compact与默认Agent检查，失败返回false。Provider先await创建再缓存，首次并发可重复创建/后完成者覆盖，失败后重试，未改Promise缓存。

保留先读取length再cleanup删除meta的时机、完成结果对应空arguments改{}特例、真实jsonrepair及greater-than二次修复、精确retry/exhausted prompt与callId真值分支。原invalid-call过滤不删除function_call_output的差异也保留。原NumberUtils使用Number→floor→clamp，5e5有效而500000junk无效；独立compact-config窗口helper同步纠正，百分比仍按原parseInt，不统一改写。

第62组verify:native-runner对完整声明/类体/成员/模块绑定/getter/factory做AST核对，并执行41组成对有限组件场景、4组成对完整原Runner/Provider/loop+完整原AgentService/前置链/Manager/Store的真实SDK验证。四模式为Read/空meta冷恢复、同RunState续轮、真实stream取消草稿、one-time usage。比较原样本片段与还原片段；模型/文件/存储和权限、Hook、memory/telemetry等外围均为明确owned边界，不冒充真实认证。修正旧fixture缺失AgentNames的UsageUtils依赖，注入完整原常量/历史工具；没有改原shouldCompact或伪造usage以通过正向分支。

新增native-runner-host仅负责显式DI/借用固定SDK/资源所有权，完整原History/Input/Purpose/SessionUtils/UsageUtils及既有原TokenUtils均在该链中。现有RunnerFactory兼容构造器已委托完整原Factory，默认CLI/Web的Runner决策和loop detector不再走旧近似实现。SDK tracingDisabled属于宿主隐私策略，只在借用SDK构造器外缘提供；原create方法及node_modules不变。宿主跟踪已安排immediate/Promise，close在释放会话前等待；4项host测试覆盖真正SDK、委托、关闭barrier和Number窗口兼容，加45原链专项共49项。

REA 6.7.0对native-runner/host两文件的静态证据为`ev_d74ffcc1a6cc4fa99e8ee205bdc30662b3e6d2013afb31a72d23e4537f7db81f`，4375 AST nodes、2 parsed files、0 parse failures。750节点/每文件750、150unknown、45秒限制下semantic graph仍partial/truncated，未执行bootstrap，不把静态图作为整个运行时等价证明。

仓库分层与开箱即用CLI/Web命令保持，smoke:native-runner纳入根smoke与CI，公开嵌入接口见[Runner创建链](native-runner.md)。这次切换仅限Runner，不等于完整原生父runtime完成。下一步是父HTTP Context→SessionMiddleWare→controller→Agent.setSession/View rendezvous、父资源所有权与真实认证/网关入口；Desktop HistoryStore、daemon自动重启、Ask/Plan回放、request-send服务与Docs仍未完成，整体目标继续进行。

最终门槛：check/build、1460核心+11Web、1381项编译JS smoke、62组源码/行为校验、原配置字节与真实CLI/Web seed/reload启动均通过。修正fixture依赖后61/62组重新成对校验通过；宿主immediate直接执行原async同步前段的受控测试也通过，不额外加微任务。无原应用/bundle/旧node_modules的暂存快照重新npm ci/check/build，并在最终源码版本的build成功后顺序执行全部1460项编译核心测试、11项Web、配置和CLI/Web实际启动，均通过。115 product prompts、6 JSON、22 Desktop资源（304358字节）及SDK固定版本未改。发布审计720文件，在所检查的凭据/运行文件规则内无发现，不是安全证明；既有17项依赖告警（10中危/7高危）保留。

## 2026-10-21：原 HTTP / MVC / CLS 与真实请求执行链

固定 CLI SHA 不变。新增 native-http-runtime：35 个完整主要类、75 成员、37 完整声明、2 个 CJS 常量赋值，覆盖 middleware/dispatcher/chain/mapping/matcher/path、trace、5 个错误类、MVC route builder/provider/adapter、8 个参数 resolver、3 个响应 resolver 与 View resolver/provider。另恢复39个完整惰性factory，包括Base/Web Context、Node async_hooks CLS及emitter-listener/shimmer、UrlPattern、compose、Deferred、Prioritizeable、metadata helpers、CustomError/ErrorUtil、URL/HTTP tokens/类型/headers等。factory内部类/原型方法不重复计入35类。6个Value注入键/绑定/目标属性独立核对，只恢复键不推断默认配置值。聚合模块仅为明确局部投影，未执行DI decorators/应用bootstrap/REST client，不冒充整个框架。

保留原Request/Session/Application真值fallback、Application=0差异、缺HTTP Session抛错、Context.run返回undefined、runPromise无效返回留下context、destroyNamespace只tombstone不disable hook。保留compose顺序/重复next、正优先级过滤及provider缓存、path startsWith、正则match数组与负specificity导致regex routes被过滤的源缺陷。RouteProvider.init仍由父宿主显式调用，原方法不返回build Promise/没有catch，重复init更新route但Deferred仍保留首次结果。View默认值/headers修改、falsy model跳过渲染但仍响应、继承错误view、trace/end/skip顺序均按原类。UrlPattern原EmptyStatement用局部prettier-ignore保留，未放松AST核对。

createNativeHttpHost为明确新增的DI/资源所有权桥：完整原CLS使用私有process facade/namespace registry和真实Node hooks，不触碰进程真实process.namespaces；支持项目Node22.19+，不恢复Node<8分支。run借用原namespace.runAndReturn，保留返回/同步异常/真实Promise上下文；close拒绝新任务、等待run返回的Promise、禁用自有hooks和释放namespace，构造失败也清理。原Context.run不变；借用listener/父服务/任意fire-and-forget任务不由此host自动拥有。

第63组verify:native-http核对全部声明/类体/绑定/CJS导出/完整factory及6配置注入，32组有限组件差分和2组真实HTTP/SDK成对集成通过，共34项专项。原样本参考侧替换完整HTTP、AgentService/utilities、Runner片段，既有已验证session/ingress依赖共用；不执行原bundle bootstrap。自有随机loopback Node HTTP经原Context/CLS、RouteBuilder/RouteProvider.init、MVC参数/响应/View resolver和完整原SessionMiddleWare/Controller，连接完整原AgentService/Manager/Store/Runner/Provider与固定npm SDK，执行Read自有UTF-8文件→JSONL→续轮。冷模式新建完整原Manager、空current，直接从磁盘恢复；不预加载/补meta。模型回调实际读到各请求header为0/0/1，验证Read后续调用与下一请求CLS隔离；未授权capability请求在分派前403，不进入模型。

JSON view/Node parser/pipe、权限/Hook/initialized/telemetry外缘为明确owned测试适配器，capability不是产品登录，JSON view不是原AcpView。共享fixture允许在原session/lifecycle factory初始化前注入真实HTTP模块，默认旧组件边界不变，不靠晚替换枚举掩盖原常量捕获。没有线上模型/账户/网关请求，没有读取已安装auth缓存；SDK继续保留npm依赖。

REA 6.7.0对runtime/host两份惰性源码的证据为`ev_8f8888af45c45262d005a3ccb4af4f9a06b99e861e6e82afa97ef8930b2570da`，16361 AST nodes、2 parsed files、0 parse failures。750节点/每文件750、150unknown/每文件150、45秒限制下semantic仍partial/truncated；静态图不代替运行时整体证明。OpenAI Docs仅核对[SDK应用上下文与模型输入边界](https://developers.openai.com/api/docs/guides/agents/define-agents)，以固定样本/SDK为实现依据。

保持apps/cli、apps/web、packages/harness、docs、scripts分层；smoke:native-http纳入根smoke/CI，嵌入接口与源行为见[HTTP核心](native-http.md)。默认CLI/Web仍可独立启动，未切换为完整原生父HTTP runtime。下一步是原Agent.setSession/AcpView新会话rendezvous、父资源所有权、实际AuthenticationManager/网关与完整bootstrap；Desktop HistoryStore、daemon重启、Ask/Plan回放、request-send服务和外部Docs等未完成，整体目标仍进行中。

最终门槛：check/build、1494核心+11Web、1415项编译JS smoke、63组源码/行为验证、原配置字节与真实CLI/Web seed/reload启动均通过。暂存快照不含原应用/bundle/旧node_modules，重新npm ci/check/build成功后，在harness workspace顺序执行全部1494项编译核心测试；11项Web、配置和CLI/Web实际启动也通过。115 product prompts、6 JSON、22 Desktop资源（304358字节）与SDK固定版本不变。发布审计729文件，在所检查的凭据/运行文件规则内无发现，不是安全证明；既有17项依赖告警（10中危/7高危）保留。

## 2026-10-21：完整原 AuthenticationManager / provider / storage 核心

固定 CLI SHA 不变。父新会话握手的原initializeSession明确先await auth.initialized、拒绝无当前账户，然后才发HTTP/等Agent.setSession；本阶段据此先恢复缺失前置依赖，不预填“已登录”Subject。新增native-authentication：完整AuthenticationManagerImpl（25成员）、ExternalLinkAuthenticationProvider（25）、UserInfoContextVariableResolver（3）、AuthenticationHttpInterceptor（4）、DefaultAuthenticationStorage（5）、CustomTokenAuthenticationProvider（6）、CustomTokenAuthenticationStorageImpl（12）、WxAuthenticationProvider（14），共8主要类94成员、44完整业务声明/表达式、3个非DI declarator；后者明确不是完整原多变量声明。原callback revision/enum/Set/helpers、导出与MIN_REFRESH_DELAY_MS静态赋值一并核对，不执行decorators/应用bootstrap。

15完整惰性factory恢复协议tokens/headers/7错误类、账户快照/匹配、SubscriptionManager/DisposableComponent、原异步调度/取消/Event/Emitter/Disposable、AIError/NotFoundError、Deferred/CustomError/Prioritizeable/ErrorUtil、AuthenticationType与完整ProductFeature/FeatureToggle。模块51147/9151/17237仅为明确局部投影；factory内部类不重复计入94成员，既有ProductEnvService不重复移植。JWT仍为外部94959依赖，不复制库/SDK，不推断原依赖版本。

保留storage token+JSON equality去重、anonymous不去重、环境切换→当前发布→刷新/sync及storageSessionRevision门控。登录/登出/切账户/刷新分别保留authOperation/loginAttempt/committedLogin revisions、原abort/过期结果丢弃和beforeStore/afterStore/marker检查；持久化tail失败可继续，clean=false时Subject可保留而loggedOut已为true。init失败只记录、不结束initialized Promise；DefaultStorage只存内存。refresh保留30秒cooldown、WorkBuddy缺allAccounts例外、uid/idp判断、原随机间隔/15秒最小timer/指数退避、Unauthorized不重试与dispose取消。

保留custom-token env/ACC/spilled信号的priority门控，restore只读合并product token而非信号token；产品config单独有token也可能priority=0，store/clean为空，不称为磁盘持久化/撤销。JWT仅decode非验签，保留sub/nickname/iss/sso企业/domain与显式enterpriseId优先及原hex时限。ExternalLink保留300秒timeout/1秒polling、token/account错误code、account 401/403五次重试、license/IP/launch whitelist/version/loginSessionId/browser=false继续等分支。原HTTP auth header/skip/no-*、endpoint前缀/override/路径白名单保留，不把startsWith当安全origin校验。Wx仍需显式IDE require，其原tmpcode console.error也不删改。

第64组verify:authentication对完整类体/声明/表达式/非DI declarator/导出/绑定和15factory做AST对照，34组有限组件差分、1组真实owned HTTP认证流程和1组原ACP auth gate成对通过，共36项专项。HTTP集成用完整原ExternalLink provider→Manager→DefaultStorage请求state/token/account/accounts、提交/刷新/登出；自有随机loopback端口与显式capability/REST/URL opener/Product/telemetry外缘，账户来自原provider响应链而非预填Subject，不是生产认证。原ACP newSession实际注入完整管理器，等待doInit后拒绝匿名、没有REST请求/会话Deferred；参考侧也替换完整原Agent/View/primitive。JWT decoder、IDE、spilled文件为明确doubles，不算外部库/原IDE已验证。

REA整文件TS和编译JS均因Maximum call stack size exceeded各跳过1文件，证据分别ev_05883e955f07910d921b04e7dbb5854184c5d6d52d19e3deea1b78bf0ac20911、ev_18fc9afde042ca8a15eeb221ce97415ef7890ee2d254332554ce93f2835d3de4；不能用parse_failures=0声称成功。随后将最终编译文件的8scope/15完整factory作为23惰性单元静态分析，证据ev_db867704bd54dfe5e1efcdf5dcef4439ad343b1aba78286a1247ea79093c5754：19306 AST nodes、23parsed、0skipped/parse failures。750节点/每文件750、150unknown/每文件150、45秒下仍partial/truncated，不证明完整闭包/父bootstrap关系；完整公开文件另有AST/成对运行校验。OpenAI Docs仅核对SDK运行/恢复边界，以固定样本/SDK为依据。

保持既有仓库分层与默认CLI/Web可启动路径，新增smoke:authentication进入根smoke/CI；接口与源差异见[认证核心](native-authentication.md)。本批恢复完整认证业务类，不等同真实IDE/磁盘凭据库/生产网关已接线，更不等同完整默认父runtime。下一步仍需Agent.setSession/AcpView新会话rendezvous、实际REST/账户存储和父资源所有权/完整bootstrap；Desktop HistoryStore、daemon重启、Ask/Plan回放、request-send与外部Docs等仍未完成，整体目标继续进行。

最终门槛：check/build、1530核心+11Web、1451项编译JS smoke、64组源码/行为校验、原配置字节与CLI/Web seed/reload实际启动均通过。无原应用/bundle/旧node_modules的暂存快照重新npm ci/check/build，成功后在harness workspace运行全部1530项编译核心测试，再核对11项Web、配置及实际启动均通过。115 product prompts、6 JSON、22 Desktop资源（304358字节）和SDK固定版本不变。发布审计737文件，在所检查的凭据/运行文件规则内无发现，不是安全证明；既有17项依赖告警（10中危/7高危）保留。

## 2026-10-21：原 ACP 新会话 HTTP/View rendezvous 与 native 结果闭环

固定CLI SHA不变。新增完整EndpointProviderImpl（3成员）、CliServerErrorHandler（3）、CliRuntimeOptions（3）、DefaultRestOperationsFactory（1），共4主要类10成员；含完整pickDefinedCliSessionInitialOptions，共12完整业务声明/表达式、9个非DI import declarator，按原源码初始化顺序保留。3完整factory为43533 gateway/security tokens/header helper、45654 endpoint token、1562 REST tokens/ResponseEntityUtil，factory内部类不重复计数；原4个scope getter/CJS赋值及cell.client.config的Value注入独立核对，不执行decorators/整个bootstrap。

保留Endpoint的Deferred首个resolve、地址/事件/10ms polling及第51次才reject的500ms文字、错误监听回收、Unix socket/listening无address错误和SERVER__HOST空fallback/IPv6不补括号。CliRuntimeOptions只保留原白名单，不透传cwd/print/inputFormat；raw全量deepEqual发事件、浅拷贝与in-place嵌套修改抑制也保留。REST factory直接传clientConfig引用给外部axios位置，不新增merge/default。CliServerErrorHandler原priority2/始终handle/500原message保持；withSecurityHeader只克隆并写固定x-codebuddy-request=1，不把它当认证。

createAcpRendezvousHost为新增显式所有权桥，不是已有session的AcpViewHost变体。真实ACP initialize/newSession发内部HTTP，经原middleware/Controller/Manager/Store/MVC ViewResolver，只有原AcpView.render调用原Agent.setSession，完成usage注册/原Deferred，再启动原iterator。RPC返回时长HTTP仍开放；后续prompt由同一源循环进入完整原AgentService、5原interceptor（UserInput/MessageQueue/History/Telemetry/State）、Manager/Runner/Provider、完整原InterruptionService及固定SDK，完成Read/JSONL/续轮，无手动resolve/预填session/JSON测试view。

组合测试先定位到旧fixture.waitFor只记调用、不能发布原ACP result；现改为实际32成员完整原InterruptionService原waitFor/Stop/agent_end/combine分派。Manager保持唯一SDK stream/history consumer，controller只被动订阅结果，不伪造完成事件；legacy queue final空run也经原MessageQueue interceptor跳过，不改deferred-dispatch开关躲路径。同连接第二次newSession保留原render先setSession后duplicate检查：第二HTTP结束、首HTTP/iterator继续；旧subjects完成，SDK上下文为新native session且新历史无旧Read。owner只观察原setSession更新关闭目标，不另写会话切换算法。

owner拥有View.init/render/iterator、RPC/Deferred、异步回调/task监听/timers；构造失败清timer，source在finally之前失败也回收所观察监听。专用原Agent方法/字段只外围观察，不提前setSession、不resolve；close后新赋入的原Deferred也拒绝，结束恢复descriptor并禁止重复拥有同一Agent。关闭用原cancel、return iterator、拒绝未完prompt、等待自有任务，cancel失败仍继续回收并报告AggregateError，不forceIdle。借用auth/REST/backend等仍由父宿主停准入/收尾；默认listener/认证/审批owner未被偷偷替换。

第65组verify:acp-parent对新增完整声明/类/绑定/原getter/factory/Value及顺序做AST核对，13组件有限差分、2组完整原父链/HTTP/真实SDK成对集成通过；另8项新owner独立测试，共23专项。参考侧替换原HTTP、AgentService/utilities、Runner、auth、ACP Agent/View/lifecycle/services/registry和完整InterruptionService；既有已校验native sessions/ingress及修改版ACP SDK共用，不称整个应用/所有第三方库重放。只用owned临时文件/随机loopback端口/额外capability/确定模型；custom-token原storage从显式owned配置产生账户，JWT decoder/低层REST/parser/设置/Hook/no-team/权限初始化/telemetry为明确外缘，不算生产登录/完整native审批证明，不靠bypassPermissions。

REA 6.7.0对新增owner/父原语两份惰性源码的证据ev_df0d0239eaa1eae1e1d2dfb43036302bc6750bada187af4f6e6c9ca9ac5e8bed：3864 AST nodes、2parsed、0skipped/parse failures。750节点/每文件750、150unknown/每文件150、45秒下仍partial/truncated，未执行bootstrap，不用静态图替代整体等价证明。OpenAI Docs仅核对SDK运行/恢复边界，以固定样本/SDK为实现依据。

仓库分层/CLI/Web保持，smoke:acp-parent纳入根smoke/CI，详见[父交接与所有权](acp-parent-rendezvous.md)。新会话rendezvous与同连接切换已验证；完整默认公共装配器、生产认证/磁盘账户库、父load/resume/fork、native Write/Ask/Plan审批全链、真实gateway/REST/完整bootstrap、Desktop HistoryStore、daemon重启/回放、request-send/Docs等仍需推进，整体目标未完成。

最终门槛：check/build、1553核心+11Web、1474项编译JS smoke、65组源码/行为验证、原配置字节和CLI/Web seed/reload实际启动均通过。不带原应用/bundle/旧node_modules的暂存快照重新npm ci/check/build成功后，在harness workspace执行全部1553项编译核心测试；11项Web、配置和实际启动均通过。115 product prompts、6 JSON、22 Desktop资源（304358字节）及SDK固定依赖不变。发布审计746文件，在所检查的凭据/运行文件规则内无发现，不是安全证明；既有17项依赖告警（10中危/7高危）保留。

## 2026-10-21：Native 父链 Write 审批、同状态恢复与会话授权

原ACP新会话→原HTTP/MVC/CLS→原View/render/setSession→原Manager/AgentService/Runner/InterruptionService链现装配原设置、Hook、ToolPermissionService/八策略和 always/background 类。Manager.create 与 middleware 都调用原权限初始化，不再仅记录fixture事件；真实 SDK needsApproval/执行 pipeline 走这些服务。普通CLI/Web仍走既有可用独立宿主，本批没有宣称默认产品bootstrap已经切换。

新增四种父链Write集成：Allow批准前不写盘、批准后同一个RunState恢复并落盘；Reject不写盘且ACP cancelled；权限RPC待决时原ACP Cancel不写盘；Always Allow仅授予session规则，第二轮对新文件确实不再询问、项目设置未产生永久grant。结束检查原pending/queues/item-session映射、HTTP/iterator/owner监听回收。没有bypassPermissions、预填批准结果或手动完成事件。

verify:acp-parent扩展为13组件差分+6组真实ACP/HTTP/SDK父链成对集成。参考侧新增替换固定样本中的完整原权限服务/utils/命令安全/八策略和always/background类，保持原InterruptionService32成员。两侧设置/Hook还原类仍共用，并由既有独立源码验证约束；不称全部应用/第三方库重放。原200ms sleep前可快速拒绝Deferred，因此参考加载器增加与迁移宿主相同的被动promise.catch观察；不改变promise identity/settlement、业务决策或控制器类体。

REA对权限host和父装配两份自有惰性源码给出 `ev_cbae15d40f0a5bf82b76fd2c2661b44113fd42daab6646b739883cdb6f3ca919`：6327 AST nodes、2 parsed、0 skipped/parse failures；750 semantic/150unknown/45s限制下partial/truncated，不是运行时等价证明。仍只用owned临时文件、随机loopback与明确模型/外部适配器，无安装账户缓存或生产请求。

剩余下一步：native父链AskUserQuestion/Plan审批与完整配置/模式前沿、load/resume/fork、可复用默认父装配和生产认证/REST。Write四种有限场景不代表这些路径、所有并发竞态或完整harness已100%完成。

本轮门槛：check/build、1557核心+11Web、1478项编译JS smoke、65组源码/行为验证、原配置字节和CLI/Web seed/reload实际启动均通过。新的干净暂存检出不带原应用/bundle/旧node_modules，重新npm ci/check/build后，全部1557编译核心、11Web、配置校验和实际启动通过。SDK依赖、6 JSON/115 product prompts/22 Desktop资源（304358字节）不变；746文件发布审计在已检查规则内无发现，不是安全证明。npm ci仍报告既有17项依赖告警（10中危/7高危），本轮未为处理告警擅自升级样本依赖。

## 2026-10-21：完整原 Ask/Plan 服务与 native 父链人工交互

新增[完整交互服务](native-interaction-services.md)：AskServiceImpl14成员、PlanStorageServiceImpl6方法、完整PlanModeUtils2方法与getItemToolCallId、7业务声明/表达式、9原import declarator、原getter/初始化顺序及3完整factory（Ask token、Deferred、trace常量）。公开AskService继承原类，AnswerDeferred保留同一构造器，公开PlanStorage六方法全部委托原对象；CLI/Web因此也换成完整原服务，而非只在fixture中恢复。

原ACP父链已注入完整AskService，替换等待span double；原Plan存储/ExitPlan input processor/Defer权限参与执行。六组新场景通过真实ACP扩展回答（q_0/数组映射）、跳过、取消及计划批准、拒绝、rejectAndExitPlan。Enter/Exit默认deferred各审批一次，计划Write不额外审批；拒绝后不执行Exit、不继续模型，普通拒绝保留plan模式，扩展退出恢复先前模式。原Hook pipeline外围观察实际工具执行，不靠模拟结果。

保留原细节：setAsk可能消费earlyAnswers到legacy Deferred，后续acquire并非重复投递；同一RunState可跨多次审批复用，所以验证最近一次review后的续跑。deferred Exit普通options没有direct Exit才有的退出选项，使用真实扩展决策而非构造未公布选项。Ask/Plan所有配置/并发/预填答案/错误前沿尚未穷举。

第66组检查完整服务/绑定/factory及PlanModeUtils AST，并做8有限行为差分、另1公开构造器测试；第65组扩展为12组完整原父链/HTTP/SDK成对集成，参考侧也替换原Ask/Plan服务。自有确定模型等待原inputSubject确认上一工具结果再返回下一响应，避免源历史消费者与极快模型的usage时序不等；未改业务类、未删usage比较，明确断言16 tokens/响应的完整累加，并连续三次重复全部12组源对照。缺失的CLI commandSafety外缘与原完整ACP ErrorUtils装配已明确补齐。

REA最终证据 `ev_4f154f7cb260c162193fcc55684e5423ac08c8fee4aeb2be145df47546b2b588`：10479 AST nodes、2 parsed、0 skipped/parse failures；750 semantic/150unknown/45s下partial/truncated，不是完整运行时证明。仍只用owned文件/loopback/确定模型/显式账户double，不读取安装账号或发送生产请求。

下一步优先原ACP父load/resume/fork与可复用默认父装配，再推进生产auth/REST、Desktop HistoryStore/回放和剩余配置/并发边界；本阶段不等于完整harness已100%完成。

最终门槛：check/build、1572核心+11Web、1493编译JS smoke、66组源码/行为验证、原配置字节和CLI/Web seed/reload实际启动全部通过。干净暂存检出重新npm ci/check/build后，全部1572编译核心、11Web、配置与启动也通过，无原应用/bundle/旧node_modules依赖。SDK、6 JSON/115 product prompts/22 Desktop资源（304358字节）不变；752文件发布审计在已检查规则内无发现，不是安全证明。既有17依赖告警（10中危/7高危）保留，没有以升级样本依赖来隐藏差异。

## 2026-10-21：完整原 ACP 回放与父 load/resume/continue/fork 恢复

完整恢复module67037的16函数、原导出getter/import/constants/dynamic deps和整个factory；原HistoryUtils/AcpUtils/title/timestamp/usage链实际参与。replay start/end、逐项offset/原timestamp/request/message ID、孤立工具取消、任务/checkpoint/团队/待决审批/usage投影、MCP UI HTML预取及原timeout/unref/异常传播均保留；详见[原回放/父恢复](acp-replay-recovery.md)。这不是把已有会话列表重新拼成兼容回放。

四组完整父图冷恢复：先由真实SDK完成Read并写原JSONL/meta，关闭所有旧资源，再新建服务图从同一自有根经原HTTP/CLS/MVC/ingress/View/setSession加载，确认不是同一个session、没有共享SDK state/result；原历史进入下一SDK请求、usage从32累加到64。load和continue会原样回放，resume不重放；内部HTTP原forkSession入口创建分支后，真实ACP load接入并继续运行，源JSONL/meta字节不变、保持单iterator。当前证明是同一测试进程的完整服务图重建，不冒充独立OS进程/daemon重启。

保留实际原边界：SDK有session/fork但本版Agent未实现，返回-32601，不添加虚构方法；CliRuntimeOptions也不透传fork字段。CLI Store不保存permissionMode Subject，原plan会话冷载入后回default但meta/历史恢复。missing load/resume原样创建指定ID空会话；非法ID入口失败后sessionRequest暂留，可再resume恢复；fork源缺失不创建目标文件或替换current。四种异常入口均接真实SDK续轮验证，预期错误诊断逐条核对method/code，额外异常仍失败。

新增第67组：完整factory+16函数AST、9组件差分、4冷恢复+4异常父入口成对运行。原参考图替换Replay、SessionManager/Store/Ingress以及完整原HTTP、AgentService/utilities、Runner、auth、ACP协议/服务/权限/审批/AskPlan；已有第65组12场景也改用同一完整参考图。归一化仅替换自有temp根前缀，时钟和UUID在外缘明确提供，timestamp/offset/usage字段不删。部分任务/checkpoint/team/trace和底层IO仍为明确适配器，不称完整产品/所有外缘已接线。

REA最终证据 `ev_aaad63cee936ed5d48ff5ca77468a470989df2b69d8ceb565f3faa3c838368eb`：12036 AST nodes、3 parsed、0 skipped/parse failures；750 semantic/150unknown/45s下partial/truncated，不是运行时等价证明。全部仅使用owned临时磁盘、随机loopback和确定模型，没有安装账号或生产请求。

下一步优先可复用默认native父装配与实际CLI/独立进程生命周期，再继续生产auth/REST、跨工作目录恢复/全部配置模式、Desktop HistoryStore/回放及剩余资源边界；整体目标保持进行中。

最终门槛：check/build、1589核心+11Web、1510编译JS smoke、67组源码/行为验证、配置校验与CLI/Web seed/reload实际启动全部通过。对最终代码的干净暂存检出重新npm ci/check/build后，1589编译核心+11Web、配置和实际启动再次通过，不依赖原应用/bundle或旧node_modules；第65/67组在最后参考图去重后再次通过。SDK、6 JSON/115 product prompts/22 Desktop资源（304358字节）未变；761文件发布审计在已检查规则内无发现，不是完整安全证明。17项既有依赖告警（10中危/7高危）仍保留，未升级样本依赖来掩盖差异。

## 2026-10-21：公开可复用原生父 HTTP 装配

新增[公开父 HTTP 宿主](native-agent-http-host.md) `createNativeAgentHttpHost`，从测试helper移出真实Node监听、原RouteBuilder/Provider/MVC/CLS/参数与响应解析/Dispatcher/View装配、原路由元数据、本机REST传输以及启动/关闭回收。运行时没有scripts/test/bundle依赖；父链helper不再借nativeHttpFixture装配HTTP。已有12种Read/Write/Ask/Plan、4冷恢复、4异常入口及第65/67组原参考图成对验证全部改用公开宿主，未以兼容View或人工resolve替代原AcpView/setSession。

新桥只拥有IPv4 loopback监听、原namespace、本机capability、有界JSON解析和自身REST IO；controller、session middleware、View/SDK、认证、pipe和endpoint均为明确借入。原RouteBuilder预构建成功后由原RouteProvider.init/provide发布同次路由结果，收拢原fire-and-forget错误边界。默认随机端口、1MiB限制等明确是桥选项，不冒称原产品配置。停止准入后须先关闭借入的rendezvous/View，再关闭HTTP；不伪造idle或取消无权拥有的服务。

15项新增测试覆盖真实原MVC/Body/Header/GET models、并发原CLS、双重准入/内部目标限制、JSON/媒体/体积/路由边界、原CliServerErrorHandler、路由/绑定/endpoint失败回滚、并发start-close、两阶段关闭和半截body回收。独立测试的JSON view/controller是明确适配器；完整父链测试仍用原Controller/Ingress/ACP View和真实SDK。没有把这些单元测试计为新恢复的原类，也没有新增无来源的产品接口或升级SDK。

REA证据 `ev_b0aea3f15293ce0da56b4cb9c2abbef1ccb6f0d13869afb68b5a1230383f5421`：9433 AST nodes、2 parsed、0 skipped/parse failures；750 semantic/每文件750、150 unknown/每文件150、45秒上限下partial/truncated，不是完整等价证明。仍仅owned文件/loopback/确定模型，无安装账户/生产请求。

下一步继续将完整原会话栈与AgentService/认证/配置的父装配迁出测试边界，接默认可运行入口和独立OS进程恢复；同时保留生产auth/REST、原JSON/pipe/Body/Cookie/HTTP Session、跨cwd/配置、Desktop HistoryStore等未完成前沿。公开HTTP只是完整默认父启动的一个实质组成部分，整体目标仍进行中。

最终门槛：check/build、1604核心+11Web、1525编译JS smoke、全部67组源码/行为验证、原配置校验和CLI/Web seed/reload实际启动通过。最终暂存代码干净检出重新npm ci/check/build后，1604编译核心+11Web、配置与实际启动再次通过，无bundle/原应用或旧node_modules依赖。SDK和6 JSON/115 product prompts/22 Desktop资源（304358字节）不变；764文件发布审计在已检查规则内无发现，不是安全证明。既有17依赖告警（10中危/7高危）未隐藏。

## 2026-10-21：公开原生会话栈父装配与所有权

新增[公开会话栈宿主](native-session-stack-host.md) `createNativeSessionStackHost`：完整原Factory/Manager/Store/Middleware/Controller默认实例化，核心类体未改；所有实例装配与session Subject/RX/timer/immediate所有权从sessionStackFixture迁到src。外部依赖仍是明确借入的模块/DI、权限/Hook/状态/遥测/服务，不把测试doubles冒充默认产品实现。原48组件+2 SDK会话栈比较及12种ACP父链、4冷恢复、4异常入口均实际经过公开会话宿主和公开HTTP宿主，参考侧保持完整原Manager/Store/Ingress。

Facade保留原this/参数/开放时返回值，构造器身份不变；create不补激活/保存，getCurrent不加全局fallback，Store冷载入也由同一Factory纳入owner。只被动观察原result函数next返回的Promise，不新增SDK stream消费者或改变gate/decision。关闭拒绝新准入，允许原先接受的异步scope完成；短期工作与长期run/Middleware/Controller scope分账，避免ACP的长驻HTTP/render被普通drain等待造成死锁。

关闭等待原写盘/Hook/锁、显式closeSession逐会话释放和已开始的调度，完成自有Subjects、订阅/timers与ALS并恢复subscribe descriptor；晚完成创建和权限初始化失败后的对象也纳入回收。不调用remove、不删或额外saveHistory，JSONL/meta逐字节不变。原idle仍60000ms；未开始的Controller immediate可取消，已开始的真实Promise须收尾。closeSession失败逐个收集、不跳过后续回收，detached异常最终以AggregateError报告；借入View/SDK/transport须先由其owner结束，不能凭空造完成。

18项新专项覆盖原身份/create语义、冷载入/持久文件/慢append、晚建timer、scope与drain、RX被动等待/descriptor/异常、权限失败/晚创建、失败后完整释放、immediate取消/等待、真实原timer清理、借入this与不擅自close、关闭准入。另确认AgentService/Runner组合fixture的errors getter保持动态，不被对象spread快照掩盖；测试getter主动注入detached错误验证传递。

REA最终证据 `ev_7587479b42bf2c0a05978e70b7f80f6a1d647f49999713c2a510a7bda141849f`：3423 AST nodes、2 parsed、0 skipped/parse failures；750 semantic/每文件750、150unknown/每文件150、45秒限制下partial/truncated，不是完整运行时证明。仅owned临时磁盘/loopback/确定模型，无安装账户或生产请求；OpenAI SDK/原Prompt与配置未升级或改写。

下一步继续原AgentService/Runner/认证/配置的公开父装配、默认CLI入口及独立OS进程恢复，再推进生产auth/REST、跨cwd/全部配置、Desktop HistoryStore/回放和其他外围/并发前沿。普通CLI/Web仍可用但未切到完整原生默认父图，整体目标保持进行中。

最终门槛：check/build、1622核心+11Web、1543编译JS smoke、全部67组源码/行为验证、原配置字节校验与CLI/Web seed/reload实际启动通过。最终暂存代码干净检出重新npm ci/check/build后，1622编译核心+11Web、配置与启动再次通过，无原应用/bundle/旧node_modules依赖。SDK、6 JSON/115 product prompts/22 Desktop资源（304358字节）不变；767文件发布审计在已检查规则内无发现，不是安全证明。17项既有依赖告警（10中危/7高危）仍保留。

## 2026-10-21：公开原 AgentService / Runner 父装配

新增[公开执行宿主](native-agent-run-host.md) `createNativeAgentRunHost`：默认使用完整原Service/utility factories、原interceptor constructors与原Runner Factory/Provider/loop。agentRunFixture、nativeRunnerFixture/nativeRunnerSdk以及完整ACP父Runner实例化均已改接，核心类体/Prompt/配置未重写；Provider仍缓存实际同一Runner，module25301仍是锁定npm SDK，原产品wrapper不等于复制SDK。外部模块/DI、认证、配置、interceptor provider和其余服务仍为明确借入，不拿doubles冒充默认服务。

宿主在原sessionManager.run交接处登记signal lease，仅被动观察本次原resultAbortSignalMap匹配的completed；不额外消费SDK stream、不改state/gate/usage或审批。旧BehaviorSubject重放、无lease与不同signal结果不误纳入。runOneTime不发布主result，故另在原Factory新建的专用Runner实例边界观察原run返回值与私有completed，调用原方法并保留Promise/Runner身份和Provider缓存，关闭恢复descriptor；借入Runner不修改，也不宣称已管理任意第三方私有流程。

队列drain/自动compaction的未开始immediate可取消，已开始Promise等待收尾。原50ms等待可承担接受工作Promise的resolve，关闭前不能提前清空timeout造成死锁；先等待工作/SDK完成，再清未来通知timer和订阅/ALS。正常调用者可处理的拒绝和expected SDK completed失败不被重分类成owner错误；detached同步/异步异常清理后AggregateError报告。关闭不擅自abort或close借入会话/auth/models/插件，也不伪造idle/成功，父owner须提供可结束的View/SDK/审批/刷新/transport。

17项新增专项覆盖原类/SDK身份、result发布非完成、禁止额外消费、SDK错误分类、旧/无关/不同signal结果、认证等待与拒绝、queue/timer回收、原50ms等待、detached错误、Provider缓存、compaction取消/等待、关闭准入和不close借入资源，以及私有one-time完成和Runner descriptor恢复。后者使用明确自有SDK边界适配器；另4组真实SDK与12组完整ACP等集成继续证明实际执行链。原AgentService 47+4、Runner41+4及ACP父12/恢复4+4参考成对验证未删timestamp/usage。

REA最终证据 `ev_8c1bd7a8fc5c0c390563d5482ac9538b37dfc96a9edf4a2ab9559b862d637151`：10558 AST nodes、3 parsed、0 skipped/parse failures；750 semantic/每文件750、150unknown/每文件150、45秒限制下partial/truncated，不是运行时等价证明。仅owned磁盘/loopback/确定模型，无安装账户或生产请求。

下一步继续默认原生父认证/配置/ACP与全部interceptor服务图、默认CLI入口和独立OS进程恢复，再推进生产auth/REST、跨cwd/全部模式、Desktop HistoryStore/回放及其他外围/并发前沿。三个公开父宿主已能组合原链，但普通CLI/Web尚未切成完整原生默认bootstrap，整体目标继续进行中。

最终门槛：check/build、1639核心+11Web、1560编译JS smoke、67组源码/行为验证通过；最后专用Runner观察接线后，AgentService/Runner/ACP父/回放四组再单独通过。最终暂存代码干净检出重新npm ci/check/build后，1639编译核心+11Web、原配置校验和CLI/Web seed/reload实际启动通过，无原应用/bundle/旧node_modules依赖。SDK、6 JSON/115 product prompts/22 Desktop资源（304358字节）不变；770文件发布审计在已检查规则内无发现，不是安全证明。既有17依赖告警（10中危/7高危）仍保留。

## 2026-10-21：公开原认证父装配与实际 Product 配置交接

新增[公开认证宿主](native-authentication-host.md) `createNativeAuthenticationHost`，默认构造完整原Manager/DefaultStorage，显式创建CustomToken/ExternalLink/Wx/用户变量及安装HTTP interceptor；核心8类94成员、44业务块和15原factory未改。惰性classes不伪造JWT/IDE，common采用不修改借入namespace的overlay；providers默认空、创建不隐式注册/登录。authenticationFixture已只保留时钟/DI/network/JWT/IDE测试边界，原组件、真实owned HTTP和ACP父链/恢复图均经过公开实例装配。

保留原init失败仅warn、initialized继续pending，host.start观察实际doInit并可拒绝但不改变原barrier。custom env/spilled为优先级信号，token仍来自合并配置。宿主拥有配置/URL订阅、原工作Promise/刷新/轮询timer与本次HTTP IDs；原dispose取消当前sign/revision/refresh，不logout/clean/delete。关闭等待原串行持久化tail与race败选分支，不能提前清掉awaited sleep；外部transport/IDE/browser由明确beforeClose和其owner收尾，共享Product Subject不完成。匿名waitAuthSession保留原pending，但订阅由owner回收，不当作有限关闭工作。

17项新增专项覆盖原身份、初始化成功/失败/关闭准入、匿名waiter、配置与浏览器失败订阅、HTTP IDs/部分安装/清理失败、慢restore、迟到登录、刷新/轮询、借入this/不logout、失败后串行tail与原300000ms超时仍存在的REST败选分支。实测原timeout在browser未打开时重分类OpenExternalLinkError，不用桥替换错误。另在自有home/work目录启动真实ProductHost/EnvProductProvider/merger，ACC V3合并后经原custom storage/Manager发布token、uid、enterprise，确认没有误用CODEBUDDY_AUTH_TOKEN信号；JWT依赖仍为明确decoder double，不冒称签名/生产认证。

全部67组源码/行为验证通过，含认证34+真实HTTP1+原ACP gate1、父链12、恢复4+异常4的原factory成对比较。REA最终证据 `ev_764df34ba635212c199f20b15b658edaf8932875d063077b5a871d37abafea75`：6171 AST nodes、3 parsed、0 skipped/parse failures；750 semantic/每文件750、150 unknown/每文件150、45秒限制下partial/truncated，不是完整等价证明。只用owned文件/随机loopback/确定模型，未读取安装账户或调用生产服务。

下一步继续完整默认native父配置/ACP/全部interceptor接线、可运行CLI入口和独立OS进程生命周期，再推进生产REST/账户磁盘库、跨cwd/全部模式、Desktop HistoryStore及其余并发/外围前沿。现有CLI/Web仍可启动，但尚未替换为完整原生默认bootstrap；整体目标继续进行中。

最终门槛：check/build、1577项编译JS smoke、全部67组源码/行为验证、原配置字节校验及CLI/Web seed/reload实际启动通过。本轮代码从暂存区干净检出，重新npm ci/check/build后，全部1656编译核心+11Web、配置和实际启动再次通过，无原应用/bundle/旧node_modules依赖，并确认检出测试与最终代码逐字节相同。SDK及6 JSON/115 product prompts/22 Desktop资源（304358字节）不变；773文件发布审计在已检查规则内无发现，不是安全证明。既有17项依赖告警（10中危/7高危）保留，未为隐藏告警升级样本依赖。

## 2026-10-21：公开原 ACP 协议组件装配与组合生命周期

新增[公开协议组件宿主](native-acp-protocol-host.md) `createNativeAcpProtocolHost`，将原Agent/View/ToolInterceptor、完整primitives/input factories实例创建、View依赖注入和回收迁入src；acpProtocolFixture只保留clock/DI/协议/权限测试边界。组件、services/view、认证gate及完整父链/冷恢复均已改接并await实际close。原8类217成员/5完整factory、Prompt、配置与SDK未重写；父HTTP交接的View仍由已有rendezvous拥有，不新增第二个默认渲染循环。

公开facade保持constructor/receiver/原Promise及方法name/length和稳定身份；overlay保留借入getter/晚绑定而不修改namespace。原forwarder的会话Subject只在同步安装窗口借subscribe descriptor观察，随即恢复；失败安装会回滚前序lease。关闭后外部新调用拒绝，但已接受原abort/event回调仍可在真实instance完成，不patch/替换/擅自abort调用者signal。Observer receiver与RxJS Subscriber特殊返回身份保留，不另消费SDK流或伪造idle/成功。

追踪原session/tool/prompt Deferred，不新增prompt消费者；原iterator用原return回收，包括未开始的订阅。协议owner accessor与rendezvous组合，同时用getter归属拒绝同一底层Agent的双重接管（含不同facade），关闭恢复descriptor可再用。完整测试曾发现允许accessor带来的重复owner回归，现已修复，不放宽原单一交接约束。

原终端Bash类体未改，仅factory外层加入显式timer hook，消除组件执行直接落到全局timer的缺口；保留ACK5000ms、默认终端120000ms和race成功后败选timer仍存在。关闭先使自有Deferred/iterator/父工作可结束，等待实际forwarding/ACK/回调与异步complete，再清未来timer/订阅/ALS；不提前删awaited timer造成死锁。借入transport/后台terminal必须由父owner实际结束并等原release，不把Command started当完成；原auth.initialized失败保持pending等边界不伪造成功。

21项新增专项覆盖身份/DI/overlay、descriptor窗口与失败回滚、外部abort/不可配置signal方法、待决Deferred和组合/重复owner、iterator/ACK准确时间、URL/借入Subject、detached错误/异步complete/Subscriber身份、清理失败/关闭准入及原终端timeout/败选timer/明确后台收尾。原订阅每轮unsubscribe后即退休账本项，不将旧Subscriber/session闭包保留至连接关闭，并做连续三轮验证。终端为明确owned协议适配器，没有执行真实shell命令；真实SDK/父链继续保持原setSession/单consumer/审批和磁盘历史路径。

REA最终证据 `ev_cee61bcad4e2ef0ab96bd12072a1c8fd935c6fd6c576edcfbe5e867895022c22`：9042 AST nodes、4 parsed、0 skipped/parse failures；750 semantic/每文件750、150unknown/每文件150、45秒限制下partial/truncated，不是整个运行时等价证明。只用owned文件、随机loopback和确定模型，无安装账户或生产请求。

下一步继续实际Product/配置与ACP连接/全部interceptor的默认父图、CLI入口和独立OS进程/daemon恢复，再推进生产REST/账户库、跨cwd/全部模式、Desktop HistoryStore及其他外围/并发前沿。普通CLI/Web仍可运行，但完整原生默认bootstrap尚未切换，整体目标继续进行中。

最终门槛：check/build、1598项编译JS smoke、全部67组源码/行为验证通过；最终订阅退休改动后已重新跑完全部67组，不仅复用此前结果。暂存代码干净检出重新npm ci/check/build后，全部1677编译核心+11Web、原配置校验与CLI/Web seed/reload实际启动通过；12个改动代码/manifest文件与最终检出逐字节一致，无原应用/bundle/旧node_modules依赖。SDK和6 JSON/115 product prompts/22 Desktop资源（304358字节）未变；776文件发布审计在已检查规则内无发现，不是安全证明。npm ci仍报告既有17项依赖告警（10中危/7高危），未升级样本依赖隐藏差异。

## 2026-10-24：公开 ACP 连接装配与英文项目主页

新增[公开连接宿主](native-acp-connections-host.md) `createNativeAcpConnectionsHost`，把原 Stream/Transport Factory/Manager、Agent registry、Server/Context/Controller、Guard/SecurityMiddleware 的创建和依赖接线从组件测试 helper 移入 src。完整原10类84成员、16函数、4 initializer、6 statics、4 routes及协议SDK未改；默认CLI/Web和另一套完整ACP/AgentService父图尚未切到本连接装配，不把组件接线当作默认产品bootstrap已完成。

保留原SDK实例prototype/constructor、方法receiver/原Promise和单一transport订阅；独立namespace overlay不改父protocol，显式DI bindings不擅自注册或伪造Agent。原Server.stop只清注册表、原stream.close不结束SDK输入，宿主显式管理自己的输入EOF及未完成HTTP响应。父beforeClose先停止准入/结束借入Agent工作，stdio输入由父owner结束；接受中的transport创建先完成，再关闭输入/响应，等待原SDK closed/history flush/Agent remove，最后清Subject/token/timer与观察descriptor。共享auth/settings/session/listener/stdout不被关闭。原组件暴露给父DI，调用者必须停止raw dispatch；不是可撤销facade。

新增11项专项，覆盖身份/原订阅、幂等关闭、已删除state的SDK输入、慢history flush/借入receiver、父取消顺序、heartbeat/token清理、失败继续回收、未启动关闭、迟到transport创建、detached observer失败及两种SSE背压。复查发现先drain再关闭响应会死锁；现按创建/写入分阶段收尾，未完成响应显式disconnect；已被原close删state或替换的响应仍按未完成writeSseEvent Promise独立计数，避免并发写提前退休。这些是明确宿主生命周期适配，不重写原协议业务，不额外消费SDK流。

REA 6.7.0对固定SHA样本原连接完整声明做静态分析，证据 `ev_0b774793860a023361df92e449ffe9000df42630725e129dfe7853ddda53b0de`：8202 AST nodes、1 parsed、0 skipped/parse failures；750 semantic及150 unknown（全局/单文件）、45秒预算下partial/truncated。输入保留UTF-16偏移和原SHA provenance；未执行原bootstrap。原声明AST/29连接行为+10 SDK行为成对验证通过；静态图和有限对照不证明完整产品等价。

README改为英文，按能力、快速开始、CLI、架构、还原矩阵、验证、文档导航与使用/许可边界组织；保留样本来源、原SDK、默认入口尚未完整原生化及许可不确定性，移除过时的固定audit数量。README本地链接检查无缺失。此次npm ci实际报告16项告警（10 moderate/6 high），未修改依赖锁或升级样本依赖。

后续继续完整默认native服务图/配置/全部interceptor与CLI父启动入口，独立OS进程/daemon恢复、生产REST/账户库、跨cwd/模式、Desktop HistoryStore等。原有CLI/Web可编译使用，但整体最大化还原目标继续进行中。

最终本批门槛：npm ci后的check/build通过；最终编译JS核心1688项、Web11项全通过，连接专项53项全通过，固定样本原连接29+SDK10成对比较通过，原配置/115 product prompts/22 Desktop资源逐字校验及CLI/Web实际启动、离线流式回答、builtin seed与原生reload通过。未运行本批无关的全部67组源码verifier，也不复用历史全量结果冒充本次运行。首次手工从仓库根目录运行全部编译测试因已有测试按包cwd定位config而失败；改为packages/harness下执行后上述最终1688项通过，未改测试或配置来绕过失败。依赖锁、原类体、Prompt和产品配置未改。

## 2026-10-24：原始 Provider 与全部默认 interceptor 注册装配

新增[默认 interceptor 宿主](native-agent-interceptors-host.md)，从原模块59233/66545的装饰器恢复实际31项 AgentRunInterceptor token 注册（30 local + Worktree）、包含AgentService的86项属性注入、2项PostConstruct。原诊断name map不等于默认注册表：ChannelEvent为self Component，Continue没有token注册；此前漏掉的SandboxTurnTelemetry完整类现恢复，与Sandbox共用原nu WeakMap，原诊断map保持原样。原Agent-run边界现在是33类172成员、46 declarations、9 factories、38 export getters及1 namespace loader；不是33项默认interceptor注册。

恢复原63517/6720/99600完整模块以及68809 registry、98025 creator类，替换组件fixture中的手工排序。保留原优先级>0过滤、order fallback、稳定降序、第一次发现和排序数组缓存、可选parent遍历与typed/generic过滤。修复执行宿主新container路径的Symbol身份问题：必须显式提供parent的63517 namespace，不另造Symbol后静默遗漏父过滤器。既有skipRun测试原本靠修改数组删除已缓存interceptor，改为同一实例显式切换测试行为，符合真实缓存语义。

WorktreeContext从行为重写切换为完整原声明，包括可选manager/options、日志和原提示。原Sandbox process.cwd调用补足显式runtime.cwd边界。新宿主在启动前检查全部必要DI，不伪造缺失服务；只执行原2个init，显式attach原Provider。独立拥有Sandbox session-ready退订及接受中callback等待，关闭时仅恢复仍由自己附着的provider，不关闭借入sandbox/session/execution。默认CLI/Web尚未切换完整原生产品bootstrap；组件测试的显式边界不代表31条生产业务已全链打通。

REA 6.7.0对原Provider inert片段分析证据 `ev_628f20cb1e329723acb5b7fd030534d972f3ae9b2d3d46ea888489d1c6124e15`：745 AST nodes、1 parsed、0 skipped/parse failures；2000 semantic/300 unknown（全局与单文件）、45秒预算；semantic coverage为unknown、truncated=false，不能解释为完整等价。原样本SHA和UTF-16 offsets继续记录于源码及verifier，未执行原bootstrap。

本批原样本验证：Provider完整factory/class AST与8行为对；注册31/属性86/生命周期2逐项AST验证，Worktree完整声明AST与9行为对；Agent-run52行为对+4真实SDK对通过。新增6项宿主测试与8项Provider测试，覆盖完整装配、缺失依赖、过滤/缓存、父token身份、Sandbox回调排空及provider归还；恢复的SandboxTurnTelemetry另增加5项成对场景。README英文还原矩阵和导航同步更新。

最终本批门槛：check/build通过，packages/harness cwd下1707项编译JS核心测试与11项Web测试全通过；上述3组源码/行为verifier通过；原6 JSON/115 product prompts/22 Desktop资源校验、CLI help、Web真实SDK离线流式回答、builtin seed与native reload实际启动通过。未重新运行全部69组源码verifier，不将历史全量结果列为本批结果。README本地链接与git diff whitespace检查无缺失/错误。未改依赖锁、SDK版本和原产品配置/Prompt，未提交或推送；整体最大化还原目标继续进行中。

## 2026-10-24：Sandbox CLI 原进程、IPC 与会话生命周期

新增[原Sandbox CLI服务](native-sandbox-cli.md)：完整SandboxCLIClientImpl、SandboxCliStdioCapture、SandboxCLIProcessManagerImpl、SandboxCLILifecycleImpl共4类88成员，连同共享timeout WeakSet/判别函数、常量声明组、AV类身份和4项原静态超时值逐项恢复。恢复70353/74674/68331三个完整惰性协议模块（46 commands、FileAction/NetAction、默认配置、IPC envelopes/validator/error）以及41695原SandboxTurnConfig token+class声明；不执行原decorators/bootstrap。主类模块aliases已与原require逐项复核。

createNativeSandboxServices提供显式同步装配与原token bindings/namespaces，原client/process init和全部业务方法不变。父容器的41695 namespace必须复用，修复独立复查发现的“借入实例但另造token”问题，真实进程验证已检查原namespace和同一可变实例。宿主不自动开启Sandbox、不代替应用生命周期owner；父方须管理准入、接受中的原Promise、late-start cleanup、文件/进程/network边界及关闭。Shell/rules/telemetry/PID registry产品服务和native executable仍是显式外部依赖，没有以空实现声称默认已完成。

原行为保留：500ms进程存活门槛、TERM/KILL、stdout/stderr UTF8 head/tail、版本选择/GC、配置env过滤、PID/exit listener、IPC framing/反向请求/timeout、readiness coalescing与失败重试、异常退出后restart、projection切换、flush合并/周期与退出前文件同步。原sessionReady callback完成后败选的5秒计时器未清除，这是样本行为；测试先断言该定时器仍存在再推进其到期，不改短超时或删类体掩盖。

REA 6.7.0对原惰性声明组证据 `ev_0daf2a51a670a9c255f0f71671eb94acdd42908ea71c82f5e6bda1a11a76b978`：8598 AST nodes、1 parsed JS、0 skipped/parse failures；750 semantic/150 unknown（全局与单文件）、45秒预算下partial/truncated。保存固定SHA与UTF-16 offset provenance；静态证据不等于执行或完整等价。

原样本成对比较覆盖13组件场景，包含hard-timeout后迟到成功清理、原flush timeout/按session合并、反向请求与fire-and-forget、semver/GC等；另6协议/config场景。新增真实OS子进程+Unix socket一对：完整原三类创建明确owned Node协议peer，OpenSession、请求回应、SIGKILL、原ensureAlive重启、关闭前Query/SyncFileChanges、原stop以及PID/listener/socket回收。未启动安装应用、macOS helper或生产sandbox binary；该peer只证明原进程/IPC链，不证明native OS保护行为。Windows真实进程场景明确skip，macOS helper/Windows pipe分支尚无运行证据。

后续沿原SandboxRuleSyncService、BashSandboxManager、shell/finalization与产品启动父图继续接通；独立产品daemon/Electron、生产账户、完整模式及默认CLI原生化仍未完成。README英文还原矩阵/文档导航同步更新。

最终本批门槛：check/build通过，1727项编译JS核心与11项Web全通过；新2组源码verifier通过（13+6组件对、1真实进程对）；配置/原Prompt逐字校验、CLI help、Web真实SDK离线流式回答和builtin seed/native reload实际启动通过。未重新运行全部71组源码verifier；没有使用历史全量结果替代本批验证。README/新文档本地链接及git diff whitespace检查通过。依赖锁、SDK版本及原产品配置/Prompt未改，未提交/推送。完整默认产品bootstrap尚未完成，目标保持进行中。

## 2026-10-24：Sandbox 每轮规则与默认安全配置

继续上一批原进程链，恢复64187原SandboxRuleSyncService完整24成员、6个lexical helper、原token与allowlist声明，以及42017/20852/3246/78918四个完整惰性默认/安全模块。保留文件与网络规则顺序、strict/fullAccess分支、Windows modify_backup/no-backup path边界、home/codebuddyHome展开、directory/glob标记、safe-delete默认写入规则、网络通配域名、默认权限配置/备份上限，以及原安全分类/allowlist precedence。原decorators不执行，固定SHA与UTF-16位置经AST verifier逐项检查。

createNativeSandboxServices新增显式rules配置，要求父BashSandboxManager.getConfig，复用同一lifecycle和TurnConfig，返回RuleSync/BashSandboxManager实际token bindings；复用parent模块64187/20852/42017及原namespace，不重新发明父token或enabled配置。没有默认CLI启用或新增隐式hook；仍由原Sandbox interceptor/父方在对应时点调用。保留文件下发失败后继续网络下发、分别catch/log的原语义，配置获取/build错误继续抛出。

15组原样本行为对照覆盖规则、配置、路径、安全分类以及状态变化；新增1组真实进程成对对照通过原Client发送SetFileRules/SetNetworkRules，验证restart前后原服务接线、共享permissionMode切到fullAccess后的wire payload。使用明确owned测试协议peer，没有执行生产sandbox binary/安装应用；不把测试peer视为OS权限执行证明。原client/process/lifecycle成对验证继续保留。

REA证据 `ev_e096f544310ab2dd0647cafaa882de2c3f50b5115d4193ac99b8691bb983cef2`：3329 AST nodes、1 parsed JS、0 skipped/parse failures；750 semantic/150 unknown（全局和单文件）、45秒预算下partial/truncated。原factory、helpers/class整体AST与有限行为对照补充静态证据，非全产品等价证明。后续继续BashSandboxManager配置来源、Shell/finalization及完整默认产品父启动链；整体目标仍在进行中。

最终本批门槛：check/build通过，1743项编译JS核心与11项Web全通过；RuleSync verifier通过15组件对+1真实进程对并核对4项原属性装饰器注入；原SandboxCLI verifier继续通过13组件对+1真实进程对。配置/Prompt逐字检查与CLI help、Web真实SDK离线流式回答、builtin seed/native reload启动通过。最终追加的verifier元数据检查后再次check/build，不重复运行未变业务的全量核心测试；未重跑全部72组source verifier。README/文档链接及whitespace检查通过。未改依赖锁、原SDK/产品配置/Prompt，未提交或推送，完整默认bootstrap仍未完成。

## 2026-10-24：原 BashSandboxManager 配置与规则链接通

恢复原16394中BashSandboxManager完整18成员、配置/托管策略/路径helper、command-root静态集合，以及67198/38792/93289/69897/50158/71445六个完整惰性utility factory（原shell parser、deep equality与security translator）。不执行产品bootstrap/decorators；大型9151 re-export只映射实际调用的translator，不声称已还原其全部命名空间；原Linux nf/nm/nE引擎是显式runtime.legacy边界，未伪造引擎或默认成功。

保留settings合并/默认路径叠加、home/project/tmp展开、配置/log denyWrite、managed V3/V2/env-file优先级与网络/command/file/data安全覆盖、Windows native-directory glob、策略序列化去重、shell前缀/变量/管道命令根解析、socat/bwrap依赖检查、Linux初始化/重配置与非Linux委派分支。getConfig返回enabled来自共享useSandboxCLI，而loadConfig/legacy状态使用原settings.enabled，未改写这些不同的原路径；错误保留shallow默认fallback。

createNativeSandboxServices新增bash选项，用父SettingsManager和可选execPolicy/sensitive detector创建原manager，并与RuleSync共享同一TurnConfig和原BashSandboxManager token；禁止同时指定owned与borrowed两个manager。原services仍是同步装配，不隐式init Linux引擎或更换CLI默认入口。12组件行为对照+1完整原三类/规则/配置manager真实子进程对照通过；真实IPC pair依次使用同一owned临时root，直接比较包含路径的wire规则，不删除/重写路径字段来对齐。peer不执行命令，只处理协议，不代表native OS sandbox验证。

REA证据 `ev_986d909eda840a551c835e4545f9703526cb94a0367ce0c8730eec57d194798f`：3992 AST nodes、1 parsed JS、0 skipped/parse failures；750 semantic/150 unknown（全局/单文件）、45秒预算下partial/truncated。源码class/helpers/statics/module AST和有限行为对照补充静态证据，非完整产品等价。后续继续原SandboxShellService/finalization、legacy Linux backend与完整默认父服务/CLI bootstrap；英文README和Sandbox文档同步更新。

最终本批门槛：check/build通过，1756项编译JS核心与11项Web全通过；Bash manager、RuleSync、Sandbox CLI三组固定源码verifier全部通过（12/15/13组件对，每组各1真实进程对）。原配置/Prompt校验、CLI help、Web真实SDK离线流式回答及builtin seed/native reload启动通过。未重跑全部73组source verifier，不复用历史全量结果冒充本批结果。README/文档本地链接与whitespace检查通过。未改依赖锁、原SDK、原产品配置/Prompt，未提交/推送；完整默认产品bootstrap仍未完成，目标保持进行中。下一批原Shell三类精确offset/member研究已保存work/sandbox-shell-research.json供继续核验。

## 2026-10-24：原 Sandbox Shell、Pipe/PTY 与真实 IPC 接通

恢复原SandboxShellServiceImpl、SandboxPipeExecutionHandle、SandboxPtyExecutionHandle三个完整类共58成员，9组声明及原SAFE_DELETE_COMMANDS静态集合；恢复11个完整utility factory：62922（原headless terminal）、6453（shell utils）、2752（终端序列化）、83044（TruncateBuffer）、70543（PowerShell/OSC）、38736/79436/91371（ANSI）、19702/3927（shell constants/number utils）、70064（Windows Bash）。保留AX自引用、双次safe-delete bootstrap注入、Windows暂存脚本和单次stale sweep、UTF-8分片/尾部flush、stdout/stderr与截断、真实终端buffer/颜色/alternate模式、原按键差异、abort/timeout/kill、反向事件/audit/telemetry、失败回退、denial结果丰富和规则增量聚合错误。完整声明/factory/statics AST按固定样本UTF-16范围核验；不运行原产品bootstrap/decorators，同时核对10个原属性注入及init PostConstruct。

createNativeSandboxServices新增可选shell，复用实际Bash manager、RuleSync、TurnConfig和父protocol namespace；调用原init并绑定74674.SandboxShellService，保留19702父namespace/token身份。仍然是显式组合，不替换CLI/Web默认入口。原init/反向注册忽略unsubscribe，disposeAll不会解除生命周期/client订阅，也不保证未完成wait结算；父host关闭所有权仍需恢复，不通过改写原方法掩盖缺口。35568安全删除、48973审计、93130/23238编码、5516可执行查找和80699公共服务仍为显式依赖。测试这些边界使用标明的double，未冒充生产实现。

15组原版/还原组件行为对照通过，包含原headless terminal而非fake renderer；另1组真实owned子进程/Unix socket成对验证在重启前驱动Pipe，重启后驱动PTY，收到输出/退出、wait结算并清空句柄跟踪。两个版本依次使用相同owned root，直接比较结果和协议请求。peer只发送协议事件，不执行请求命令，不代表原native binary或OS sandbox权限验证；Windows跳过真实进程pair。

REA证据 `ev_e205556d0223073f7fc871897a316540f0a1ffe7f7c741d072f36bc8ec9757ac`：52604 AST nodes、1 parsed JS、0 skipped/parse failures；全局/单文件750 semantic nodes、150 unknown及45秒分析预算，semantic coverage partial/truncated。有限配对行为及完整AST检查补充静态证据，不声称全产品等价。英文README/Sandbox文档更新能力、运行方式、实际边界和证据。

最终本批验证：check/build通过；1772项编译JS核心测试、11项Web测试全部通过；Shell verifier通过15组件对+1真实进程对；Bash manager回归verifier通过12组件对+1真实进程对。配置/115 Prompt/22 desktop模板逐字检查通过；CLI help、Web真实SDK离线流式回答、builtin seed/native reload启动通过。最终补充原装饰器元数据核验后再跑Shell verifier及check/build；未重复未变业务的全量核心测试，未重跑全部74组source verifier。文档链接与whitespace检查通过。未改依赖锁/原SDK/原产品配置/Prompt，未提交推送。目标继续active，下一批优先安全删除/审计实依赖、Shell关闭所有权/finalization、legacy Linux引擎和默认产品父启动图。

最终独立复核补强：真实IPC pair的返回值增加RunExecutable/ProcessWrite完整journal记录，比较实际executable/args/env/cwdDir/stdoutMode/data，不只比较command名称；补强后再次Shell成对verifier及build通过。此改动仅加强验证观察值，未修改执行实现。

## 2026-10-24：原安全删除 helper、shipped shim 与 security audit 恢复

恢复35568安全删除完整factory及8616/75753/61462三个完整support factory，复用同源93289/69897/50158完整shell-quote实现，共7个原factory；保留host判定缓存、桌面模式settings/严格threshold、资源root探测/缓存、Node执行路径选择、env去重、Posix bootstrap、PowerShell项目/session上下文、report JSONL读取/删除/原结果附加、bulk marker/信号文件/批准拒绝、Windows recycle metadata/输出/命令目标解析、helper分类及fail-closed escalation。createNativeSafeDelete要求显式process、__filename/__dirname、Node createRequire和Node/path/resource namespaces，不从安装应用隐式加载默认依赖。

在原包cli/vendor/shim定位并按字节复制8个资源共91969bytes，保存在packages/harness/vendor/shim，manifest记录hash/size/mode；原路径并非cli/dist/vendor/shim。包括bulk guard、Node preload、Python sitecustomize、rm/unlink/rmdir和2个shell support文件。提取文件均0644，已有证据目录未发现可核验的archive/header，因此不声称已恢复原archive executable flags，亦未自行chmod掩盖未知。仅发现darwin-arm64 genie-trash binary，未复制或启动；部署权限/native删除backend及跨平台执行仍未证明。明确保留standalone guard DEFAULT_THRESHOLD=20与35568 DEFAULT_SAFE_DELETE_BULK_THRESHOLD=50的原差异。

另恢复完整48973 security audit factory，显式crypto/fs/path/PathUtils与process/Date边界；保持env值严格为1才写入、home/audit-log/spool目录、JSONL补换行、默认字段、redaction与原command hash分离、preview截断、action mask优先级、异常吞掉、ungated test reader、原sandbox block忽略blockType并归为network事件等行为。构造不写audit，实际调用才读写owned/parent roots。

11组SafeDelete原版/还原组件配对通过；原bulk guard在owned fixture文件上真实计数、确认、批准、拒绝并消费信号，文件保留；原Node preload通过helper产生的NODE_OPTIONS在owned child中加载，检查实际fs patch但不执行删除。8资源与原包逐字/hash/mode校验通过。另1组真实子进程/socket原版全图配对，把实际safe-delete与audit namespace接入Shell/CLI/rules/bash链，在重启前Pipe及重启后PTY上比较完整RunExecutable/ProcessWrite env/payload和实际audit条目。peer只提供协议事件，不执行shell命令，不冒充OS sandbox或trash后端。audit另6组件对照及完整factory AST通过。

REA安全删除证据 `ev_d8f60a0c0532e599b51340c650772cc61d2931f686883a2abdc0216be6de363f`：8863 AST nodes、2 parsed JS、0 skipped/parse failures；audit证据 `ev_5d3f861bc4da84615505d45525fd2bb0e2ee75dd9b445375cdd163e135d738bb`：1760 AST nodes、1 parsed JS、0 skipped/parse failures。均750 semantic/150 unknown全局与单文件、45秒预算，semantic partial/truncated；有限原版配对与整体AST/资源逐字检查补足证据，非全产品等价证明。

最终本批门槛：check/build、1790项编译JS核心、11项Web全部通过；SafeDelete（11组件+1真实进程）、audit（6组件）、Shell（15组件+1真实进程，现含actual safe/audit）与Bash manager回归（12组件+1真实进程）source verifier通过；115 prompts/22 desktop模板和配置逐字校验、CLI help、Web真实SDK离线streaming/builtin seed/native reload启动通过。未重跑全部76组source verifier。英文README/Sandbox文档、local links、whitespace检查通过；未改依赖锁/原SDK/原配置/Prompt，未提交推送。完整默认父服务bootstrap与关闭所有权仍未完成，目标active。后续优先连接原sandbox agent lifecycle/finalization与Shell关闭所有权，并恢复剩余真实LocalShell/encoding/which父依赖；原shim对OS temp路径有native-delete例外，任何后续删除行为验证必须保留该原语义，使用明确owned资源并区分拦截、允许、失败与native backend。

### 2026-10-24：Shell 路由与 Sandbox 收尾钩子

- 新增 `native-sandbox-finalization.ts`，恢复 DelegatingShellService、FinalizationFileProjectionSyncHook、FinalizationModifyBackupHook、SandboxCLISessionEndHook：4 个完整类、17 个成员、4 个完整声明组及 38195/57126 两个完整 factory。固定原始 bundle SHA256 仍为 `4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd`；源码文件记录 UTF-16 起止范围。
- 原样保留 Linux legacy / 其他平台 Sandbox CLI / disabled 或配置失败 local 分支；白名单路径仍参与 projection；backup 不按 cancelled 跳过；projection 200 UTF-16 与 backup 16 Unicode codepoint 的不同消息截断；clear/resume 才 stop，其他 SessionEnd 原因只 flush；stop 失败仍恢复 cwd。
- 显式 Sandbox composition 返回三项 hooks 集合、共享 lifecycle/TurnConfig，交给 parent Hook provider 调度；只有提供真实 local/legacy parent 时才建立 delegator 和 ShellService token 绑定。没有自行添加退出顺序或默认成功的 fallback。
- 完整 AST 对照与 11 组原版/恢复行为配对通过；额外真实 owned child + Unix socket 配对使用完整原版/恢复 CLI/rules/bash/shell/safe-delete/audit/finalization 链，强制重启后执行 projection/backup commit 协议请求，检查 shutdown 不停止、clear 停止及资源释放。peer 不执行命令、不投影文件；phase/history 是显式测试适配器，不宣称完整产品等价。
- REA evidence `ev_6a9669fc186124e6bdfe6c780b28769904ebfe44beca057663f6c4f733e486de`：2,825 AST nodes，1 parsed JS，0 skipped，0 parse failures；750 semantic nodes/150 unknowns（per-file/global）、45 秒预算下 partial/truncated。只分析惰性原始片段，未执行 bundle bootstrap。
- 后续仍需完整恢复 local/legacy Shell、root exit owner、默认产品 DI/bootstrap；英文 README 和 Sandbox 文档已同步这一边界。
- 本批最终回归：`npm run check` / `npm run build` 通过；编译后 core 全量 **1,801/1,801**、Web host **11/11**；finalization 11 component pairs + 1 real-process pair、Shell 15 component pairs + 1 real-process pair 通过；115 prompts / 22 Desktop assets 配置校验和 CLI/Web 实际启动 smoke 通过。新增 `verify:sandbox-finalization`，源码 verifier 总数为 77（不含 config）；本批未重跑全部历史 verifier。日志保存在 ignored `work/finalization-*.log`。

### 2026-10-24：原版进程退出与 SafeExit

- `native-process-lifecycle.ts` 恢复原版 76360 的全部模块体（UTF-16 `[9852690,9858421)`），`native-safe-exit.ts` 恢复完整 36648 factory（`[13359185,13359526)`）；固定 bundle hash 未变。显式安装原版模块体，import 不安装 handlers，附加 return 仅暴露现有 closure。未执行原始整个应用 bootstrap。
- 保留 startup/version/Node/Git Bash checks、SIGQUIT/SIGTERM/SIGHUP、异常与同步日志、30 秒 orphan TTY 检测、debug crash gate、process.exit 同步 Sandbox kill 包装。原版退出顺序为 telemetry flush → snapshot/Shell → gateway → team → SessionEnd → telemetry shutdown → SafeExit；本地 catch 与外围 catch 的不同短路行为、5 秒 unref fallback、重复 exit 立即返回均未改写。SafeExit 原样恢复 raw-mode/cursor。
- 全模块语句 AST（仅排除 adapter return）/完整 SafeExit factory AST 对照通过；11 lifecycle component pairs、4 SafeExit cases、1 真实 owned Node child SIGTERM 配对。真实子进程接收 SIGTERM 后 exit code 0、清理调用顺序一致；服务仍为显式 fixture adapters，不宣称默认生产服务图已完成。宿主 process 未修改。
- REA evidence `ev_8f9e0646a750119adfbedc7d733e4465546933d22237078ee30b5fb107a24967`：1,371 AST nodes、2 parsed JS、0 skipped、0 parse failures；750 nodes/150 unknowns per-file/global、45 秒预算，partial/truncated。
- 文档 `docs/native-process-lifecycle.md` 明确 install-once 与无 teardown 的原版边界。尚未默认激活；后续继续 local/legacy Shell、telemetry helpers、session/container graph，不能以进程 fixture 等同产品整体退出验证。
- 本批最终回归：check/build 通过；编译后 core **1,814/1,814**、Web host **11/11**；源码配对 11 lifecycle + 4 SafeExit + 1 real-process pair 全通过；115 prompts/22 Desktop assets 校验及 CLI/Web launcher smoke 通过。新增 `verify:process-lifecycle`/`smoke:process-lifecycle`，source verifier 共 78 项（不含 config），本批未重跑所有历史 verifier。日志为 ignored `work/process-lifecycle-*-final.log`。

### 2026-10-24：完整 LocalShell 模块与 legacy wrapper

- `native-local-shell.ts` 恢复完整 43522（含原版 DI registration、LocalShell、PTY/ChildProcess handles、OutputSpiller、ShellSnapshot、DelegatingShell、完整 PowerShell script/format helpers）及完整 35179/38590 helpers；另恢复完整 legacy class declaration。固定 bundle hash 未变，UTF-16 ranges 写入源码 metadata。
- 新增显式 `createNativeLocalShellServices`，构造 snapshot/local 并执行原版 init，返回原始 token bindings；有 BashSandbox parent 时构造 legacy wrapper。完整 43522 执行原版 decorator statements，decorator 实现仍由 parent 提供；独立 legacy class 采用显式注入。没有把默认 CLI/Web 切换到尚未齐全的 parent graph。
- 完整 3 factories + legacy declaration AST 对照及 6 组 source/recovered 配对通过。包含真实 owned Node raw-command 子进程：stdout/stderr、退出码 7、active handle 清理；使用真实 fs/child_process、实际恢复的 safe-delete（配置 disabled），共享已恢复 shell/terminal utility。DI、encoding/executable lookup 仍有明确 fixture 边界；snapshot concurrency 用替代 creation 隔离 promise ownership，不宣称实际 profile capture 已验证。
- 保留 local dispose 等待句柄、legacy dispose 空操作/count=0、2 秒 unref warmup 不由 dispose 取消、snapshot clearCache 不取消 pending creation 等原版所有权。未把这些边界改成更易通过的行为。
- REA evidence `ev_c8cf521a1bb328f8096f62319f9171e583996095d42c4fb58449a33ea22acfc1`：8,897 AST nodes、4 parsed JS、0 skipped、0 parse failures；750 nodes/150 unknowns per-file/global、45 秒预算 partial/truncated。原片段仅惰性静态分析。
- 待继续：PTY、真实 snapshot generation、output-spill/error/timeout branches、Windows/PowerShell、legacy platform engine 和默认产品服务图；新英文文档 `docs/native-local-shell.md` 及 README 链接明确区分完整源码恢复与有限运行验证。
- 本批最终回归：check/build 通过，compiled core **1,820/1,820**、Web host **11/11**；6 组源码配对（含真实 raw child）通过；115 prompts/22 Desktop assets 配置校验及 CLI/Web launcher smoke 通过。新增 `verify:local-shell`/`smoke:local-shell`，source verifiers 共 79（不含 config）；本批未重跑全部历史 verifier。日志保存于 ignored `work/local-shell-*.log`。

### 2026-10-24：真实 ShellSnapshot、超时与 PTY 执行补证

- 原版执行代码未改写。新增 5 组 source/recovered 对照，LocalShell 共 11 组：真实 Bash 从 owned `.bashrc` 生成并验证 snapshot，后续 local command 恢复 function/alias，过滤单下划线 completion function，clearCache 删除文件并释放 exit listener；真实 snapshot validation 拒绝 stdout/语法错误、creation script 失败传播；OutputSpiller UTF-8 byte count/close/cleanup；真实 raw child timeout SIGTERM process-group 回收；真实 PTY backend/headless terminal 输出且断言未走 fallback。
- 捕获应用 package.json 固定 `@lydell/node-pty@1.2.0-beta.14`。补入相同直接依赖与其上游 optional platform packages；package-lock 仅新增该依赖族，原 SDK pins 未变。原先缺失依赖导致的 getPty import fallback 得到实际修复。
- 原生 provenance 不能用版本号替代：新增 `vendor/pty-provenance.json`，两个 JS entrypoint byte-identical；darwin-arm64 pty.node/spawn-helper 整体 hash 不同。只读 codesign 显示 captured addon 腾讯 Developer ID 签名、npm addon ad-hoc/linker 签名；独立 Mach-O section parser 比较 addon 11 / helper 7 个 sections 的 name/size/flags/content hash 全部一致，未据此推断全部 load commands/loader/signature 行为等价。源码 verifier 重核 4 files 的双方 hash 和 section 数据。未修改捕获文件或其 `0644` 提取模式；真实执行使用 npm prebuild 的可执行包装。
- 仍未验证其他平台 native artifact、PTY input/resize/abort 全分支、真实 legacy engine 与默认服务图。先前 REA 原始模块证据适用，源码没有变化；新增运行证据不冒充完整产品等价。
- 本批最终回归：check/build、11 source/recovery pairs（其中真实 PTY 严格断言 backend 与 handle 类型）、4-file provenance、compiled core **1,825/1,825**、Web host **11/11**、115 prompts/22 Desktop assets 校验、CLI/Web launcher smoke 均通过。没有执行 npm audit fix 或升级其他依赖。日志为 ignored `work/local-shell-extended-*.log`。

### 2026-10-24：Shell 编码、检测与可执行查找真实依赖闭包

- 新增 `native-shell-io.ts`，完整恢复 93130/23238/5516 根入口的 71 个原始 factories（包括编码 tables、detector models、stream adapters、which/isexe）；6 个 Node builtin 作为显式边界。初始提取 72 个中包含 fs/promises 的 require wrapper，该内建被正确归到外部边界，未用空实现替代。源码记录每个 UTF-16 range 与固定原 bundle hash。
- 新增 `createNodeShellIO` 使用 createRequire 提供原始 CommonJS Node builtin 语义。实测 ESM module namespace 缺失 hasOwnProperty，不能直接充当原版 require(buffer) 返回值；修正发生在边界装配，没有修改原 factory。未猜测 npm 版本或替换 bundled encoding/detection/which 实现。
- 全部 71 factories AST 对照、7 source/recovered 场景配对通过：多编码 roundtrip、BOM/alias/unknown codec、跨 chunk multibyte stream、检测结果/置信度、真实 owned executable 权限及 PATH、异步 null 与同步 ENOENT 差异、Bun all-path 去重。
- LocalShell 11 组原版配对现已使用实际恢复的 encoder/detector/which，包含真实 raw child、snapshot、timeout、PTY；不再依赖这些接口的测试占位。其他明确使用 adapters 的 Sandbox component fixture 未声称自动转换。DI decorators 仍为明确 parent 边界。
- REA evidence `ev_7bf4fe902a6f118889e9c0cd2e659a9bc2ddd559d734407f0e2591f1fb569ebb`：104,591 AST nodes、71 parsed JS、0 skipped/invalid UTF8/parse failures；750 nodes/150 unknowns per-file/global、45 秒预算 partial/truncated。未运行原始应用 bootstrap。
- 新增英文 `docs/native-shell-io.md`，同步 README/LocalShell 文档。默认产品服务图仍未接入完整，不能把有限输入的 encoding/lookup 验证扩大为全产品等价。
- 本批最终门槛：check/build、71-factory AST/7 IO 配对、LocalShell 11 配对及 4-file PTY provenance、compiled core **1,832/1,832**、Web **11/11**、115 prompts/22 Desktop assets 配置校验、CLI/Web launcher smoke 全通过。新增 `verify:shell-io`，source verifiers 共 80（不含 config）；未重跑全部历史 source verifier。日志位于 ignored `work/shell-io-*.log`。

### 2026-10-24：统一 Local/legacy/Sandbox Shell 服务装配

- 扩展 `createNativeSandboxServices.local`，在已拥有的 Bash manager 之后构造原版 LocalShell/Snapshot/legacy wrapper，把同一个 LocalShell 注入 Sandbox fallback 和 legacy；finalization 使用同一组 delegates 构造原版 Shell router。Local/Snapshot/Legacy bindings 与 19702/35179/57126 namespaces 返回给 parent，Sandbox Shell 复用 Local 的 19702 Symbol namespace。
- owned local 与 borrowed shell.localShellService / finalization.delegates 的冲突在构造前拒绝。既有显式 borrowed 路径保留。原始 class/factory 代码未改动，没有创造另一套句柄或退出策略。
- 新组合测试验证实际 token/instance identity、hook/lifecycle 共享，经 disabled-Sandbox router 运行真实 owned Node 命令并清理本地句柄；Linux legacy route 使用明确 pass-through engine boundary 跑同一 owned command，legacy count 保持 0、只有 Local 拥有句柄。不宣称该 adapter 执行了真实 Linux sandbox enforcement。
- 原版 finalization 源码 11 component pairs + 1 real child/socket pair 回归通过；该已有配对覆盖 Sandbox restart/projection/session-end。新的统一图测试没有把两组独立证据说成一个完整原生 Sandbox E2E。
- 文档补充统一 graph 用法及 original ownership 边界。仍是显式 API；默认 CLI/Web bootstrap、真实 legacy engine 和全图关闭 ownership 尚未证明完成。此批是装配改动，复用已核验的 REA/source evidence，不重复宣称新增原始模块。
- 本批最终回归：check/build、2 项组合图测试、finalization 11 source pairs + 1 real IPC pair、compiled core **1,834/1,834**、Web **11/11**、115 prompts/22 Desktop assets 配置校验、CLI/Web launcher smoke 均通过。源码 verifier 数仍为 80（不含 config），未重跑所有历史 verifier。日志位于 ignored `work/shell-graph-*.log`。

### 2026-10-24：原版 telemetry exit helper

- 新增 `createNativeTelemetryExit`，完整恢复 93441 factory（UTF-16 `[7887746,7889212)`，固定 bundle hash 未变），可作为 process lifecycle 的实际 93441 namespace。
- 保留 metrics 80% remaining deadline、trace 并发 forceFlush、outer/unref timeout、错误吞并、不取消底层 promise、flush 可重复/shutdown 缓存首次 promise（包含非正预算 no-op）、原 test reset。没有擅自调用 TraceService.shutdown。
- 完整 factory AST 与 6 组 source/recovered 配对通过；其中一组将实际 helper 注入已恢复的原版 process exit，验证两阶段 1500ms budget 对应 metrics 1200ms 并清理所有测试计时器。metrics/trace 服务仍是显式 adapters，不能声称真实 export/delivery 已完成。
- REA evidence `ev_4b7c428fdc64b4dea1a4a6d7fd744a17cdb2d59023d1d41cf7416e188206ca80`：381 AST nodes，1 parsed JS，0 skipped/parse failures；coverage=unknown、truncated=false，未将其表述为完整语义覆盖。源码与行为对照作为独立证据。
- 已进一步定位 8395 `[7875230,7882707)` 含完整 AgentMetricsAggregatorImpl，当前仅提取到 ignored work 供下一步恢复；真实 aggregator/Galileo/TraceService 与默认 bootstrap 仍待接入。
- 本批验证：check/build、telemetry 6 source pairs、process lifecycle 11 source pairs + 4 SafeExit cases + 1 real child pair、compiled process-lifecycle/telemetry 定向测试 **19/19** 全通过；改动未激活默认 runtime，未重复运行全量 core/Web/launchers（最近全量结果仍为上一批 1834/11）。source verifiers 共 81（不含 config）。日志为 ignored `work/telemetry-exit-*.log`。

### 2026-10-24：完整 AgentMetricsAggregator

- `native-agent-metrics.ts` 完整恢复 8395 `[7875230,7882707)` factory、Symbol、class、30s constant、Autowired 与 ApplicationLifecycle registration。固定 bundle hash 不变，原 class/factory 未改写。Galileo 与 logger 仍由 parent 注入。
- 6 组 source/recovered 配对及完整 factory AST 对照通过：request/tool/task/cache/callback/token metrics、window guard/reset、MCP server promotion、500 UTF-16 error truncation、last model fallback、interval unref/clear、started/unstarted shutdown、export failures。新增 actual aggregator + actual telemetry-exit helper 联测，验证 budget 800/400、window flush 与 timers 清理；Galileo/trace exporters 仍为 explicit adapters，不宣称真实发送已还原。
- 特别保留 cache-only/generated-call-only 不触发 flush、无 active timer 的 flushAndShutdown 不 flush window、caught emission failure 后丢弃窗口等原始行为；没有按常规预期“修正”它们。
- REA evidence `ev_defb1f41c8ae9ee80eb457c4c4f0cb4c3a957a88e1e8112e8bbf2382640b6557`：1,747 AST nodes、1 parsed JS、0 skipped/parse failures；750 nodes/150 unknowns per-file/global、45 秒预算 partial/truncated。未执行应用 bootstrap。
- 新增 `verify:agent-metrics`，原 lifecycle smoke 纳入指标测试；英文 README/process lifecycle 文档说明 token 共享与 parent 依赖。真实 Galileo/TraceService、默认 bootstrap 及完整服务图仍未完成。
- 本批最终门槛：check/build、metrics 6 source/recovered pairs、compiled core **1,846/1,846**、Web **11/11**、115 prompts/22 Desktop assets 校验、CLI/Web launcher smoke 通过。source verifiers 共 82（不含 config），未重跑全部历史 verifier。日志保存于 ignored `work/agent-metrics-*.log`。进一步核实 40602 只导出 Galileo Symbol，实际 Galileo 实现位于另一父模块；已保存定位证据，避免将 token 模块误当发送端实现。

### 2026-10-24：TraceService / TracerProvider 与 span 辅助模块

- 新增 `createNativeTracing`，完整恢复 79645/801/1423/94668/97584/63984/11484/86504 共 8 factories，含 DI registrations、trace cache、global/standalone provider、span/empty span、deterministic IDs、logging exporter、env parsers。固定 bundle hash 与全部 UTF-16 ranges 写入 metadata；未执行 bootstrap。
- 8 组 source/recovered 对照与所有完整 factory AST 通过。验证 disabled、standalone init/restart/resource/endpoint/header、Galileo global forceFlush/不 shutdown、100-entry FIFO duplicate-ID eviction、root/child option precedence、remote parent/B3/status、env flags/warnings/percent decoding、logging exporter forwarding，以及 actual TraceService + actual telemetry-exit helper 两阶段联测。
- SDK/API/exporter/DI/header constants 仍为明确 adapters；构造参数观测只投影配置值，不比较每次独立构造的 class/function identity。没有把此测试说成真实 OTLP transport、全局 SDK 注册或 backend delivery；未发送任何遥测。
- REA evidence `ev_3119af25ddaba2ebe428496f513c912ccec19e8012c0fce61c465a995ceb4c9f`：3,553 AST nodes、8 parsed JS、0 skipped/parse failures；750 nodes/150 unknowns per-file/global、45 秒预算 partial/truncated。
- 新增英文 `docs/native-tracing.md` 与 README 链接；新增 `verify:tracing`，source verifiers 共 83（不含 config）。真实 Galileo、OpenTelemetry parents 与默认产品装配仍待完成。
- 本批验证：check/build、8-factory AST/8 source pairs、编译后 process lifecycle/metrics/telemetry/tracing 定向测试 **33/33**（含已有真实 SIGTERM child）全通过。默认 runtime 未激活新 tracing；本批未重复全量 core/Web/launchers，最近全量结果仍为上一批 1846/11。日志为 ignored `work/tracing-*.log`。

### 2026-10-24：GalileoServiceImpl 服务层及退出联测

- 从 92763 恢复 4 个完整原始 statements：GalileoServiceImpl 全类、DI decorators/static flag、isGalileoOtlpRequest、decorator helpers。UTF-16 ranges 与固定 SHA-256 写入 metadata，4-region AST 与 7 组 original/recovered 行为对照通过。不是 92763 全 factory（该模块还内嵌 SDK）。
- 覆盖 disable/invalid config、setup/provider capture、identity dimensions、histogram/counter cache、flush/shutdown failure ordering、fingerprint hot rebuild、proxy URL/options overloads、timeout 不取消底层任务与 0-budget 调用行为。
- 实际恢复的 Galileo + metrics + TraceService + telemetry-exit 两阶段联测通过；SetupGalileo、SDK Logger/OTel、产品配置解析/DI/认证/OS 仍为明确 adapters，无远程上报或 host HTTPS patch。默认产品装配尚未启用该服务。
- REA evidence `ev_5fd83489d4143a42ab7c5765f253df396ae12602211fbe39f07d067853225685`：2,690 AST nodes，1 parsed JS，0 parse failures；750/150 限额、45 秒预算，partial/truncated。
- 新增英文 `docs/native-galileo-service.md` 与 README 索引；新增 `verify:galileo-service`，source verifiers 共 84（不含 config）。
- 本批验证完成：`npm run check`、`npm run build`、4-region AST / 7 source pairs、编译后全量 core **1861/1861**、Web **11/11**、CLI help 与 Web → real SDK → recovered harness 流式离线启动全部通过；`git diff --check` 通过。日志 `work/galileo-{check,build,verify,core,hosts,launchers}.log`。真实 SDK 发送与默认 native DI graph 仍未完成，不以启动 smoke 等同原应用完整还原。

### 2026-10-24：Galileo encrypted HTTP transport 与真实本机 KMS

- 恢复 92763 中 21 个完整 statements：transport/DEKManager、RSA KMS exchange、AES/Base62、gzip、routing/headers/retry helpers；metadata 保留固定 hash 与 UTF-16 ranges。未宣称整个 SDK factory 恢复。
- 6 组 source/recovered 对照通过：真实 loopback HTTP/plain/gzip/503 retry/400 failure、AES framing/header、DEK cache 时序、真实 KMS JSON/error、routing/backoff、真实 RSA-2048 KMS → gzip/Base62/AES → HTTP delivery，两次发送仅一次 KMS 请求。测试在当前 Node 使用实际 crypto/http/zlib，不联系产品遥测服务。
- 保留 Retry-After:0 → -1 → Node TimeoutNegativeWarning；保留缓存 key 后后台 refresh 逻辑。cache 调度单测替换 refresh，独立本机集成用真实 fetchDEK。其他 Node/OpenSSL 版本未验证。
- REA evidence `ev_2d6d637d025c9e209754f6bd22c79a95494c11c92a94253bc7ac8fbe78a036e5`：2,035 AST nodes，1 parsed，0 parse failures，750/150 limits、45秒预算，partial/truncated。
- 新增英文 transport 文档与 README 索引；source verifiers 共 85（不含 config）。Exporter wrappers/serializers/SetupGalileo/SDK logger/default native assembly 仍待衔接。
- 本批最终 check/build、21-region AST / 6 source pairs、编译后的 transport tests **6/6** 与 diff whitespace 检查通过。新 helper 的类型错误已修正后复验；未重复无关全量回归，最近全量仍为上一批 core1861/Web11/CLI+Web启动通过。日志 `work/galileo-transport-*.log`。

### 2026-10-24：OTLP trace/metrics/logs JSON serializers

- 恢复 92763 的 42 个完整 statements 与 41437/77047/11447 三个完整 helper factories，固定 SHA-256/UTF-16 provenance 与全范围 AST 对照通过。
- 5 组 source/recovered 对照验证 resource identity/scope 分组、精确纳秒字符串/hex IDs、四种 metric 点结构、structured log、binary/time helper/response failures，以及真实 loopback serializer → gzip transport → HTTP JSON/response 解析。SDK records 为明确 fixtures，32047 使用 Node performance，70000 未用 env import 为显式空 namespace。
- REA evidence `ev_db014820fbe2b1b9d135e95e68bd4a151e9f40e8ec94db8fc7ce7bdd3c7b43c4`：4316 AST nodes、4 parsed JS、0 parse failures，750/150 limits、45 秒预算，partial/truncated。
- check/build、42-region/3-factory AST 与 5 source pairs 通过；source verifiers 共 86（不含 config）。Exporter wrappers/delegates/SetupGalileo/SDK logger/default native graph 尚待完成。英文 README/serializer 文档已更新。
- 编译后 transport + serializers 联测 **11/11** 通过，包含真实 RSA/KMS 与真实 HTTP。diff whitespace 检查通过；本批未重复全量 core/Web/launchers，最近全量仍为 core1861/Web11 与启动 smoke。日志 `work/otlp-serializers-*.log`。

### 2026-10-24：OTLP exporter delegate / bounded queue

- 恢复 92763 的 8 个完整 statements 与 36275 enum 完整 factory：base/delegate、bounded promise queue、partial-success handler、error type。固定 hash/UTF-16 metadata、全部 AST 和 6 source pairs 通过。
- 覆盖 concurrency overflow、flush/shutdown wait、transport result/rejection、serializer null/synchronous throw、partial-success/malformed response success-with-warning、queue rejection cleanup；真实本机联测 actual exporter base/delegate → actual log serializer → actual transport，验证接收 JSON 和 flush/shutdown。
- 共享声明导入的 10 个未用 parent namespaces 在 fixture 为显式空 adapters；diagnostics 也为明确 adapter。没有把这些 imports 说成完整 SDK parent 恢复。
- REA evidence `ev_ef6294fffac7714d6de7ff6b119528219cab32f858116529bbbbebf4e770c4ce`：2177 AST nodes、2 parsed、0 parse failures，750/150 limits，45秒预算，partial/truncated。
- check/build、8-region/1-factory AST、6 source pairs 通过；source verifiers 共87（不含config）。具体 Galileo exporter constructors/HTTP option resolution/provider setup/SDK logger/default assembly 待继续。英文 README/文档已更新。
- 编译后 export/serializers/transport 联测 **17/17** 通过，含真实 HTTP 与 RSA/KMS；diff whitespace 检查通过。本批未重复全量 core/Web/launchers，最近全量为 core1861/Web11/启动 smoke。日志 `work/otlp-export-*.log`。

### 2026-10-24：OTLP HTTP options 与 baggage helpers

- 恢复 92763 的 26 个完整 statements 与 44874/20662/3250 三个完整 factory。固定 SHA-256/UTF-16 metadata、全部 AST 与 5 source pairs 通过。
- 覆盖 user/signal/general/default 优先级、invalid env fallback、显式 URL/timeout throws、percent decode errors、默认 headers 最后覆盖、动态 headers 保留旧键、keepAlive mutation 和 baggage immutable operations。72912 仅为 recovered baggage namespace bridge，未恢复其无关 reexports；DiagAPI 为明确 adapter。
- REA evidence `ev_4afda3d19a4c8e3325c06abc5b5a6f2f07b6dbde4878b18b214614cb3187be0e`：2445 AST nodes、4 parsed JS、0 parse failures，750/150 limits、45秒预算，partial/truncated。
- check/build、26-region/3-factory AST 与 5 source pairs 通过；source verifiers 共88（不含config）。英文 README/HTTP配置文档更新；具体 exporter constructors 与默认 SDK/native graph 待衔接。
- 编译后 HTTP configuration/export/serializers/transport 定向回归 **22/22** 通过，包含已有真实 HTTP/RSA/KMS；diff whitespace 检查通过。本批未重复全量 core/Web/launchers，最近全量仍为 core1861/Web11/启动 smoke。日志 `work/otlp-http-*.log`。

### 2026-10-24：Galileo trace/log exporter constructors

- 恢复 92763 的 4 个完整 statements（trace/log constructors、HTTP helper、shared header declaration）与 15086/15183 两个完整 constants/enums factories。保留 SDK 0.3.17-beta.1。固定 hash/UTF-16、全部 AST 与 2 source pairs 通过。
- 连接实际 recovered config/delegate/serializer/transport modules，本机 trace/log exporter → gzip → HTTP 完整路径验证 endpoint、headers、User-Agent、OTLP JSON、flush/shutdown；另测 signal env、timeout/concurrency、disabled encryption、invalid constructor。SDK records 是 fixtures，底层原有 diag/performance/unused-import 边界仍明确。
- REA evidence `ev_0b7742626831b2cd8d7ccfb7e9a34d5cd68e9eb222f47a55c7fc2d4b3971c5a6`：1002 AST nodes、3 parsed JS、0 parse failures，750/150 limits、45秒预算，unknown/not truncated。source verifiers 共89（不含config）。
- Metric exporter 的聚合/temporality base、provider/SDK logger/SetupGalileo/default native graph 仍待恢复与装配。英文 README 索引拆为 service/exporters 与 transport 两行，增加对应文档。
- 本批 check/build、4-region/2-factory AST 与2 source pairs通过；编译后全量 core **1885/1885**（确认包含新增 constructors 两例）、Web **11/11**、CLI help 与 Web→real SDK→recovered harness 流式离线启动全部通过。diff whitespace 检查通过；日志 `work/galileo-exporters-*.log`。这不等同默认原生 DI/完整 SDK 已恢复。

### 2026-10-24：Galileo metric exporter 与 aggregation closure

- 恢复 92763 的 39 个完整 statements：metric exporter/base、temporality selectors、instrument descriptor、drop/sum/last-value/histogram/exponential histogram aggregation 与 local helpers。固定 hash/UTF-16 metadata、39-region AST 与 5 source pairs 通过。
- 验证全部 instrument 的累计/增量/低内存选择、显式 override、默认 aggregation、sum reset、histogram merge/diff、signed exponential histogram，以及实际 recovered aggregator 生成 metric → 具体 metric exporter → serializer/HTTP 的真实本机接收与 flush/shutdown。
- 70000 getEnv 与 diagnostics 仍为明确 adapters；未使用的 shared crypto import 提供真实 Node crypto；其他组件为已恢复实现。MeterProvider/readers/SDK logger/SetupGalileo/default native graph 仍待衔接。
- REA evidence `ev_af2873aaa6e7b30cc818b49ef725779af8eadf1fda87fcda630d99378de42469`：9,214 AST nodes、1 parsed JS、0 parse failures，750/150 limits、45秒预算，partial/truncated。source verifiers 共90（不含config）；英文 README 与 metric exporter 文档更新。
- 本批最终 check/build、39-region AST/5 source pairs、编译后 exporter/config/serializer/transport 回归 **29/29** 通过；共享 fixture 增加默认 factory 后复验通过，未改原始实现。diff whitespace 检查通过。本批未重复全量；最近全量 core1885/Web11/CLI+Web启动通过。日志 `work/metric-exporter-*.log`。

### 2026-10-24：OpenTelemetry environment 真实依赖

- 完整恢复 70000（原字面量7e4）/55733/79232/6023 四个 factory，无未恢复的模块依赖。显式 process boundary，固定 hash/UTF-16、全 factory AST 与4 source pairs通过。
- 覆盖原默认值/enums、boolean/number/list/log/string coercion、无效值fallback、live env reads、浅拷贝默认array identity；没有将解析行为改为更严格的现代规则。
- Metric exporter fixture 的 getEnv 桩已替换为实际 recovered module，5组 metric source pairs 在新依赖下重验通过。provider/default app graph仍待完成。
- REA evidence `ev_fa357def9492ca7155057bc5bdf6c517e6207147b70b248dbfe7f02c819f5269`：983 AST nodes、4 parsed、0 parse failures，coverage partial，truncated true，750/150 limits、45秒预算。source verifiers共91（不含config）。README/英文文档已更新。
- 本批 check/build、4-factory/4 source pairs与5 metric source pairs、编译后遥测导出相关回归 **33/33** 通过；diff whitespace检查通过。未重复全量core/Web/launchers，最近全量仍为core1885/Web11/启动smoke。日志 `work/otel-env-*.log`。

### 2026-10-24：MetricReader / PeriodicExportingMetricReader

- 恢复完整共享 reader declaration（含 ancillary predicate/selector helpers）与 60002/61549 两个完整 factory；固定 hash/UTF-16、全 declaration/factory AST 与5 source pairs通过。ancillary helpers保留源码但未独立行为覆盖。
- 验证 producer绑定/合并、interval unref注册、forceFlush/shutdown顺序、空scope跳过、export失败、shutdown timeout后可重试且底层未取消；实际reader→聚合结果→metric exporter→HTTP接收通过。计时器为controlled handles，不以此宣称真实周期触发；delivery通过forceFlush触发。
- 复用实际metric aggregation/timeout helpers；diagnostics/internal export context bridge与SDK producer仍为明确adapters。context suppression/MeterProvider/SDK logger/SetupGalileo/default app graph待补。
- REA evidence `ev_0c20069ce6b63c01fa25e2e47edcf544f8269e7c571d92fb0b5059c56c695722`：3855 AST nodes、3 parsed、0 parse failures，coverage partial，truncated true，750/150 limits、45秒预算。source verifiers共92（不含config）；README和英文reader文档更新。
- 本批最终 check/build、reader AST/5 source pairs、metric exporter AST/5 source pairs回归、编译后相关测试 **38/38** 通过。修正测试末项访问的类型断言后重验通过；原始实现未改。diff whitespace检查通过。本批未重复全量；最近全量core1885/Web11/CLI+Web启动通过。日志 `work/metric-reader-*.log`。

### 2026-10-24：原始 export context / ALS / registry

- 恢复72912原始_export函数和65890/33835/57717/98902/1801/70647/58583/87819/79232九个完整factory，含context suppression/API、immutable values、ALS/绑定、registry/version/diagnostics。固定hash/UTF-16、全AST/4 source pairs通过。47763仅桥接实际使用的ROOT_CONTEXT/context，不宣称整个API namespace已恢复。
- 真实Node async_hooks/events与owned registry验证异步export suppression、caller restoration、函数this/args、EventEmitter/removeListener/once、duplicate registration/diagnostic filtering。未修改host OTel registry，未恢复替代AsyncHooks manager。
- Reader直接export adapter已替换actual context bridge，5 source pairs重验，export内断言suppressed；保留已有真实HTTP metric delivery。producer/diagnostic sink仍为明确fixture。
- REA evidence `ev_ee78f09d636d8541a33e5e2da22c3e1fcbb7bbaae27ab2174ed2abeac19abf03`：3455 AST nodes、10 parsed、0 parse failures，coverage partial，truncated true，750/150 limits、45秒预算。source verifiers共93（不含config）；README/英文文档更新。
- 本批check/build、context AST/4 source pairs、reader AST/5 source pairs与编译后相关回归 **42/42** 通过；diff whitespace检查通过。未重复全量，最近全量core1885/Web11/CLI+Web启动通过。日志 `work/export-context-*.log`。

### 2026-10-24：真实 MeterProvider/instruments/storage/collector

- 恢复92763的15个完整statements与36182完整no-op meter factory，含views、sync/observable instruments/storage、meter shared state、collector/provider lifecycle。固定hash/UTF-16、全AST/5 source pairs通过。
- 测试真实counter/updown/gauge/histogram、observable/batch callbacks、view rename/attribute filter、scope reuse、shutdown/no-op；真实createCounter.add→provider→reader→context/exporter→HTTP链验证接收OTLP计数，无SDK producer桩。
- 复用已恢复的reader/aggregation/time/context helpers；诊断为明确sink。Resource仍是显式边界，测试传plain resource并mergeResourceWithDefaults:false；未宣称默认resource/merge、全部storage edge cases、SDK logger/SetupGalileo/default app graph完成。
- REA evidence `ev_38dccc37ab71727e7e0a6da3593d6c1c6d6b9cd37729ae718b6af8af2b5da608`：11719 AST nodes、2 parsed、0 parse failures，coverage partial，truncated true，750/150 limits、45秒预算。source verifiers共94（不含config）；README与英文文档更新。
- 本批check/build、provider AST/5 source pairs、reader及metric exporter源码回归、编译后遥测相关测试 **47/47** 通过；diff whitespace检查通过。测试按原API为removeBatchObservableCallback传入instrument列表后重验，未改原始实现。未重复全量；最近全量core1885/Web11/启动smoke。日志 `work/meter-provider-*.log`。

### 2026-10-24：Resource defaults/async/merge 真实依赖

- 完整恢复78766/42152/80221/39858/92321五个factory，含Resource、semantic constants、SDK_INFO(OTel1.30.1)、defaultServiceName、const map。固定hash/UTF-16、全factory AST/4 source pairs通过。
- 覆盖默认/empty singleton、async settle/reject/pending diagnostics、sync/async左右合并优先级；MeterProvider fixtures替换plain资源并启用默认merge，5 source pairs重验；真实HTTP断言用户service.name与captured telemetry.sdk.version同时存在。
- process/diagnostic仍显式输入，无resource detection或import activation；SDK logger/SetupGalileo/default app assembly仍待完成。
- REA evidence `ev_c75f8f2bac6695f05383aaf0a19a3fea3c38c2f0f0dab3af5e3af7ba1a79c55b`：2992 AST nodes、5 parsed、0 parse failures，coverage partial，truncated true，750/150 limits、45秒预算。source verifiers共95（不含config）；README和英文文档更新。
- 本批check/build、Resource AST/4 source pairs、MeterProvider AST/5 source pairs、编译后相关回归 **51/51** 通过；diff whitespace检查通过。未重复全量，最近全量core1885/Web11/CLI+Web启动通过。日志 `work/otel-resource-*.log`。

### 2026-10-24：LoggerProvider / LogRecord / BatchLogRecordProcessor

- 恢复92763的6个完整statements与14个完整parent factories，含记录/Logger/Provider/config/processors、severity/noop/merge/bind/timeout/attribute/span-context/error/timer辅助。固定hash/UTF-16、全部AST/4 source pairs通过。
- 验证实际logger emit生成record、scope cache、attributes limit/truncation/dropped/readonly、有效trace context、batch/singleflight shutdown、async Resource等待、真实HTTP body/scope/SDK identity。已不依赖手工LogRecord模拟；实际timers与transport经flush/shutdown清理。
- context/env/Resource/time为已恢复组件，trace绑定真实span-context helpers（未宣称完整TraceAPI provider）；Console exporter保留源码但未独立输出验证。Galileo outer logger/self-monitor/SetupGalileo/default graph待补。
- REA evidence `ev_a701da5971e484b5dd308c2743e2d0714faa2e7b9c75c7ef29cb4344898cab69`：7727 AST nodes、15 parsed、0 parse failures，coverage partial，truncated true，750/150 limits、45秒预算。source verifiers共96（不含config），README/英文文档更新。
- 本批check/build、6-region/14-factory AST/4 source pairs、编译后全量core **1916/1916**（含新增实际logger/HTTP cases）、Web **11/11**、CLI help与Web→real SDK→recovered harness流式离线启动全部通过。README将遥测索引按services/providers/context/transport分行，避免长链接堆叠；diff whitespace检查通过。日志 `work/logger-provider-*.log`。

### 2026-10-24：Galileo outer Logger

- 恢复92763的完整logger class、parseLevel/enums（三个完整statements），以及stringifyHandler/stringifyPlus/isCurrentRequestSampled（三个完整declarators）。固定hash/UTF-16与全部AST对照通过，source verifiers共97（不含config）。
- 一组综合source pair使用真实LoggerProvider→BatchProcessor→Galileo exporter→HTTP接收端，验证level过滤、sampled override、字符串attributes整组校验、user-agent/trace传播、start/success计数及循环对象序列化。测试self-meter仍为明确记录fixture；console仅owned对象安装，未宣称call-site排除行为独立验证。
- REA evidence `ev_92cfa7fb92829ddb8b35c5dd5151460771e999c5a99462703b70055d903e71fa`：1299 AST nodes、1 parsed、0 parse failures，coverage partial/truncated，750/150 limits、45秒预算。英文文档与README索引同步。
- check/build、AST/source pair与编译后遥测回归通过；本批未重复全量core。最近全量1916/1916、Web11/11和CLI/Web启动通过。自监控provider初始化、SetupGalileo与default graph仍未完成。日志 `work/outer-logger-*.log`。

### 2026-10-24：Galileo self-monitor provider 真实组装

- 恢复registerSelfMeterProvider/getSelfMeterProvider两个完整declarators及compression enum完整statement；复用已恢复SumAggregation/Views/MeterProvider/PeriodicReader/Resource/MetricExporter。固定hash、UTF-16与三个区域AST对照通过，source verifiers共98（不含config）。
- 原版/还原版综合pair验证独立provider、固定资源identity、Production→Formal环境映射、30秒/20秒reader配置与真实unref timer、gzip HTTP、两次delta计数2/3。真实outer logger调用self-monitor factory，过滤info+发送warn得到start=2/end=1，无self-counter桩；collector constants仅在测试中重定向loopback，未访问原始endpoint。
- REA evidence `ev_68cfc13745f0aa6a10297332681b503f6baabbf3d47faaea5c90c43649103cfd`：217 AST nodes、1 parsed、0 parse failures，coverage unknown、truncated false，750/150 limits、45秒预算。metric exporter的39区域/5 source pairs回归通过，新增英文文档和README入口。
- SetupGalileo、完整trace/instrumentation初始化与default native service graph仍未完成；未宣称30秒定时触发独立验证。测试显式flush/shutdown所有provider；相关日志 `work/self-monitor-*.log`。
- 本批最终check/build、self-monitor AST/source pair、metric exporter AST/5 pairs与编译后遥测回归 **57/57** 通过，diff whitespace通过。未重复全量；最近全量core1916/Web11/CLI+Web启动仍为上一批证据，不将本次局部回归等同全量验证。

### 2026-10-24：Galileo business metrics / MetricsAPI

- 恢复getEndBuckets/registerMeterProvider两个完整declarators、compression完整statement和37366完整MetricsAPI factory；固定hash/UTF-16、三个区域及factory AST/2 source pairs通过，source verifiers共99（不含config）。
- 实际组装六个views（client/server started/handled counter与handled-duration histogram），保留最后非空匹配远程分桶、一次读取remote配置、delta/gzip/30秒interval/20秒timeout/concurrency30。真实counter/histogram存储经HTTP接收端验证4个sum与2个histogram的bounds/count/sum。
- 全局注册使用真实MetricsAPI与隔离context registry；验证duplicate registration保留原provider但返回新provider、disable回到noop。Node HTTP真实；remote配置与reader定时为明确fixture，测试flush/shutdown并断言无剩余fixture timer。
- REA evidence `ev_56dc8950b10d48ac4da343af533515fb22ac4d11f65b1a51739ee2f6767e3350`：507 AST nodes、2 parsed、0 parse failures，coverage unknown/not truncated，750/150 limits、45秒预算。README将Galileo assembly独立成行，新增英文文档。SetupGalileo、trace provider/instrumentation/remote config与默认native图仍待补齐。
- 本批check/build、AST/2 source pairs、编译后全量core **1920/1920**、Web **11/11**、CLI help与Web→real SDK→recovered harness流式离线启动全部通过；diff whitespace通过。全量覆盖最近新增outer logger/self-monitor/business metrics测试。日志 `work/galileo-meters-*.log`。

### 2026-10-24：Galileo sampling / BatchSpanProcessor

- 恢复完整registerTracerProvider与compression enum两条statements，以及69700/14515/62207/84992/72544/11440六个完整factories（sampling decisions、always on/off、parent/ratio samplers、BatchSpanProcessor）。固定hash/UTF-16、全部AST/3 source pairs通过；source verifiers共100（不含config）。
- 验证ratio归一化/无效trace ID、local/remote parent flags、Galileo disable/filter/parent/remote/random优先级，及queue100/batch20/delay5秒/timeout10秒配置。真实BatchSpanProcessor筛选sampled span fixtures，经exporter/serializer/gzip HTTP发送，export内suppression及caller恢复通过；使用真实Node timer并flush/shutdown。
- BasicTracerProvider目前为显式parent，注册测试为constructor/register recorder；span为显式fixtures，未宣称真实tracer/span创建与global TraceAPI注册。接下来恢复BasicTracerProvider及依赖，再接SetupGalileo/default graph。
- REA evidence `ev_6d35cf70c5fe134c2c41b193581590e362c3f0f25ff941c36ff4fad97ebdc063`：2405 AST nodes、7 parsed、0 parse failures，coverage partial/truncated，750/150 limits、45秒预算。README/英文文档同步。
- 本批check/build、2-region/6-factory AST/3 source pairs、编译后遥测回归 **62/62** 与diff whitespace通过。未重复全量；最近全量core1920/1920、Web11/11与CLI/Web启动为上一批证据。日志 `work/galileo-trace-*.log`。

### 2026-10-24：真实 BasicTracerProvider / Tracer / Span / propagation

- 恢复19个完整factories，含BasicTracerProvider/MultiSpanProcessor、Tracer/Span、TraceAPI/proxy/noop、limits/config/random ID、span enums、PropagationAPI与composite/W3C trace/baggage。固定hash/UTF-16、19-factory AST/3 source pairs通过，source verifiers共101（不含config）。
- 实际创建parent/child spans，验证active scope、scope cache、attribute截断/丢弃、event limit、status/duration与suppression noop；验证注册前proxy在注册后获得真实tracer，以及W3C traceparent/baggage roundtrip。依赖使用已恢复context/env/resources/samplers/batch/helpers；registry为独立测试所有。
- Galileo registerTracerProvider现可传实际BasicTracerProvider；集成使用真实ALS/异步active span、真实Span.end→BatchSpanProcessor→Galileo exporter→gzip HTTP，验证父子关联和显式时间戳。paired输出排除随机ID，独立场景使用固定ID generator；不再以Span fixture支撑此集成。
- REA evidence `ev_4b95ea0db3ce1dea83a7212602360b6e606b6e93ffb3ad3265cc6f94ac18d2ee`：8128 AST nodes、19 parsed、0 parse failures，coverage partial/truncated，750/150 limits、45秒预算。英文文档和README同步修正trace provider边界。
- 本批check/build、全部AST/3 source pairs、编译后遥测回归 **65/65** 与diff whitespace通过。未重复全量；最近全量core1920/Web11/CLI+Web启动为此前记录。SetupGalileo、instrumentation、remote配置与默认native graph仍待恢复。日志 `work/basic-tracer-*.log`。

### 2026-10-24：SetupGalileo 原始初始化入口

- 恢复完整SetupGalileo statement、配置/profiling校验、machine/header/user-ext/profiler-url helpers及instrumentation注册（5完整statements+6完整declarators），并恢复64270完整LogsAPI/proxy factory。固定hash/UTF-16、11-region/1-factory AST/3 source pairs通过，source verifiers共102（不含config）。
- 集成使用真实self-monitor/trace/business metric providers及真实Span/metric storage/ALS/batching/transport，验证remote pull→providers→instrumentation注册顺序、provider wiring、选定HTTP hooks与实际span/counter HTTP payload。远程Config及HTTP/Fetch constructors是明确fixture，未宣称真实自动patching；TRPC/profiler分支源码保留但未独立运行验证。
- 保留原始Setup返回undefined、不提供rollback/关闭handle；独立验证enableRemoteConfig:false在self/trace创建后因null remote.getMetricsConfig失败。测试外部清理部分初始化的providers。配置显式同时disable HTTP/TRPC会拒绝，即使Fetch启用。LogsAPI使用owned registry，验证注册前proxy在注册后emit。
- REA evidence `ev_0f270cf6328caf8f4eae15043c5909c2e96984bdbd2ce9b8c1a07fddbac3e0c9`：3769 AST nodes、2 parsed、0 parse failures，coverage partial/truncated，750/150 limits、45秒预算。英文文档/README与trace provider边界同步。
- 本批check/build、AST/3 source pairs、编译后遥测回归 **68/68** 与diff whitespace通过。未重复全量；最近全量core1920/Web11/CLI+Web启动仍为此前证据。继续恢复remote config、实际instrumentation与默认native图。日志 `work/galileo-setup-*.log`。

### 2026-10-24：真实 Galileo remote Config / embedded HTTP closure

- 完整恢复86097及其依赖闭包共77个factories，包含原始Config、嵌入Axios、redirect/proxy/form/MIME/support与Node builtin import wrappers。所有factory保留hash/UTF-16并通过AST；CommonJS loader缓存module对象以保留exports reassignment。source verifiers共103（不含config）。
- 两组source pairs使用真实Node HTTP：307保留POST/body、gzip JSON、初次pull与60秒配置的受控轮询更新、503保留旧值、成功空响应清null及stopPull。测试未等待真实60秒，未宣称全部embedded client路径覆盖。
- 新集成以真实Config替换Setup fixture，通过原始POST获取histogram buckets并接入实际业务MeterProvider，最终HTTP payload验证remote bounds/counts。Setup的HTTP instrumentation仍是明确adapter；remote配置流量已非替身。环境与collector为owned，未接触原始telemetry服务器。
- REA evidence `ev_58b650179a923635807883dd3d94a53e59800b2edc519787a8b42c23f48d47f4`：28371 AST nodes、77 parsed、0 parse failures，coverage partial/truncated，750/150 limits、45秒预算。英文README/文档更新；继续恢复真实instrumentation与default native graph。
- 本批check/build、77-factory AST/2 source pairs、编译后全量core **1931/1931**、Web **11/11** 与CLI/Web启动全部通过；diff whitespace通过。全量涵盖最近sampling/basic tracer/Setup/config集成。日志 `work/galileo-config-*.log`。

### 2026-10-24：真实 Galileo Fetch instrumentation

- 恢复8009完整FetchInstrumentation及instrumentation base/module hooks/semver等依赖闭包共88个完整factories；复用已恢复OTel APIs/context/enums/time。固定hash/UTF-16与88-factory AST/source pair通过，source verifiers共104（不含config）。
- 在owned global surface包装Node原生fetch，真实JSON POST(Request)、HTTP500、ignore和服务器断开socket路径产生真实spans/propagation/metrics，经loopback exporter验证3 spans/3 client starts、请求body/trace headers及ignored bypass；保留host global fetch。module hooks为真实实现，测试跟踪后unhook，禁用fetch并shutdown providers。
- 原始Fetch constructor/enable/disable及base保持源码；Setup自身Fetch分支尚待直接接入，现使用Setup fixture的真实providers后实例化Fetch。HTTP模块自动patching/TRPC/profiler/default native图仍待补齐。仅完整保留辅助CommonJS/ESM hooks代码，不宣称全部加载变体独立验证。
- REA evidence `ev_9a2b068abcb9296df259363e3649468bf54976c0eb2873a02cf7996c38f5b01d`：32512 AST nodes、88 parsed、0 parse failures，coverage partial/truncated，750/150 limits、45秒预算。README新增instrumentation行，英文边界/验证文档同步。
- 本批最终check/build、全部AST/source pair（真实socket failure）、编译后遥测回归 **71/71** 与diff whitespace通过。未重复全量；最近core1931/Web11/CLI+Web启动为上一批证据。日志 `work/galileo-fetch-*.log`。

### 2026-10-24：真实 Node HTTP 插桩与 Setup HTTP/Fetch 全链路

- 恢复9808/43408/46077三个完整factory（HTTP instrumentation/module definition/RPC context），共享已恢复Fetch instrumentation base/module hooks与OTel parents。固定hash/UTF-16、3-factory AST/source pair通过，source verifiers共105（不含config）。
- 真实SetupGalileo使用真实remote Config及HTTP/Fetch constructors，原生http.get与fetch请求owned app server后，collector收到4个真实spans；验证两对client/server同trace且parentSpanId正确、传播头和响应body。collector hostname exclusion与incoming collector ignore防止遥测递归。
- Node HTTP实际patch，Fetch在owned global surface实际包装。cleanup禁用instrumentation/unhook CJS与ESM hooks/stop Config/shutdown providers，并断言HTTP request/get/Server.emit精确恢复、host fetch未改。HTTPS源码保留但本批未做TLS handshake；TRPC/profiler/default native图仍待完成。
- REA evidence `ev_294efc714409d94a9edf89dcd0488545db99fe88d66334ef388b9c3f2f1d4f83`：14698 AST nodes、3 parsed、0 parse failures，coverage partial/truncated，750/150 limits、45秒预算。README与相关英文文档更新，消除Setup/Config/trace provider仍未恢复的旧边界描述。
- 本批check/build、全部AST/source pair、编译后全量core **1933/1933**、Web **11/11**、CLI/Web启动及diff whitespace通过。日志 `work/galileo-http-instrumentation-*.log`。

### 2026-10-24：公开 Galileo SDK composition host

- 新增src层createNativeGalileoSdkHost，组装全部已恢复context/env/Resource/OTLP transport/exporters/log/metric/trace providers、Config、HTTP/Fetch、Setup与outer Logger，不导入test helpers，不提供provider/network doubles。提供SetupGalileo/Logger/forceFlush/close/getModule/API供后续GalileoService装配。
- 该宿主为明确新增owned composition，不宣称原bootstrap逐字还原；核心captured bodies未改。exporter wrapper增加constantsOnly入口，先读取原SDK_VERSION再构造transport，避免循环依赖未就绪；原4-regions/2-factories source verifier复核保持原语义。
- 宿主记录配置请求/轮询、providers、instrumentations、module hooks及context manager，cached close等待setup/config请求、阻止新setup/logger、继续best-effort cleanup并聚合失败；不移除借入context/propagator。应用自身in-flight请求仍由调用方drain；TRPC/profiler仍是外部模块/支持信息边界，未宣称默认native DI完成。
- 三项真实宿主集成验证HTTP/Fetch spans+outer logs+自定义metrics、关闭期间等待held remote response、重复关闭、关闭失败继续恢复HTTP、保留既有context/propagator。真实Config和timers全部stop，原生HTTP方法精确恢复。
- REA对新增宿主编译后JS做额外静态分析（非原包extraction）：`ev_f3940eff8e01c8c3bbad1d8f2b4386c8fb766157768bb4d8aac6a5138dacdd0a`，1812 AST nodes、1 parsed、0 parse failures，coverage partial/truncated，750/150 limits、45秒预算；目录未包含imports，组件fidelity仍由原source verifiers证明。source verifiers数保持105（不含config）；新增公开宿主文档与README入口。
- 本批最终check/build、exporter AST/2 source pairs、编译后遥测回归 **75/75**（含3个公开宿主测试）与diff whitespace通过。未重复全量；最近core1933/Web11/CLI+Web启动为上一批证据。日志 `work/galileo-sdk-host-*.log`。

### 2026-10-24：Galileo 产品配置路由原始解析器

- 完整恢复73620 factory `[15619235,15620763)`，公开`resolveGalileoConfig`与factory入口；与远端SDK Config轮询保持独立。严格enable、origin校验、OTLP/Aegis资格区别、aegis fallback及fingerprint字段顺序均保留原始行为。
- SHA-256固定样本、完整factory AST及2组source/port输入矩阵通过；2项original GalileoService集成验证真实resolver接受缺project ID配置并生成三类OTLP路径，以及拒绝disabled/invalid配置。服务测试仍用显式SDK/DI fixtures，不冒充公开SDK宿主已完成服务接线。
- REA `ev_53d291864818a1d44dc79db4bdbc60ff5a3807ee4319911f1393b3fbbbb7a854`：1 parsed、417 AST nodes、0 parse failures，semantic coverage unknown、未截断；没有执行bundle bootstrap。新增英文文档与README索引，source verifier增加1项。
- check/build、完整factory源码对照、遥测回归 **79/79**及diff whitespace通过。日志`work/galileo-config-resolver-*.log`。未重复全量core/Web/启动检查。
- 下一步服务装配所需父模块已定位：44708原node:https、48161原node:os、64007为独立HttpsProxyAgent实现（尚未接入）。公开SDK宿主与原Service的完整生命周期装配、默认native DI/bootstrap依然未完成。

### 2026-10-24：原始 HTTPS proxy agent 与 GalileoService 真实 SDK 接线

- 完整恢复64007 HttpsProxyAgent及其20-factory闭包（agent-base、CONNECT parser、debug/helpers、Node builtins）；新增公开factory、逐factory AST verifier及3组source/port对照。真实HTTP CONNECT验证认证与headers，真实HTTPS proxy→TLS destination验证双层TLS，分片/重复header/提前EOF/非法header覆盖响应解析。
- REA `ev_65398ccdbe91b2a438c7a484fdfc9cda66998c05386447f9f78a0dfb90fe455d`：20 parsed、5459 AST nodes、0 parse failures，semantic coverage partial/truncated（750/150、45s），未执行原bootstrap。
- 新增src层createNativeGalileoServiceModule，以真实SdkHost、原resolver、原proxyagent及Node OS/HTTPS装配原Service class；DI/token/product/auth仍显式借入。新增集成测试断言真实provider身份并在loopback接收startup span/log/counter/histogram，服务onStop/shutdown释放订阅，再由SdkHost close回收轮询/剩余providers。未用SDK/provider doubles；原始未匹配KMS origin的plaintext fallback保持不变。
- 新装配是明确新增composition，不修改原Service/SDK bodies，不冒充默认native application bootstrap已完成。原Service全局HTTPS代理patch不自动恢复，多服务及配置切换的完整生命周期仍需上层装配处理。新增两份英文文档并更新README及相关组件文档链接。
- 本批check/build、20完整factory AST及3组source pairs通过；编译后全量core **1944/1944**、遥测 **83/83**、Web **11/11**、CLI/Web launchers及diff whitespace全部通过。日志`work/galileo-service-sdk-{check,build,core,telemetry,hosts,launchers}.log`与`work/https-proxy-agent-verify.log`。默认服务图/bootstrap、TRPC/profiler及上层服务所有权边界继续推进，未标记整体完成。

### 2026-10-24：原始 DI 框架、核心绑定模块与 BackendApplication

- 新增createNativeDi，完整恢复80699框架闭包及78842原始核心binding module，共370 factories；包括Inversify、Reflect metadata、Component/Autowired/Optional/Value/providers、配置表达式、生命周期与状态服务。默认独立Reflect metadata surface，保留标准Reflect方法，不污染宿主Reflect。AST verifier覆盖全部370factory，3组source/port验证singleton/alias/optional/provider、生命周期错误隔离和state waiters。
- 新增createNativeBackendApplication，完整恢复93772与96000两factory，通过真实DI及原78842核心binding module实例化；保留原start顺序、标记signal handler替换、信号exit(0)、stop状态拼写`stoped`，测试使用显式EventEmitter process，不退出宿主进程。2factory AST和1组source/port通过。
- Galileo真实SDK集成改由原容器解析服务，断言class/token/ApplicationLifecycle别名与原属性注入；仍实际发送startup span/log/metrics。应用product/auth/diagnostic inputs保持显式fixture。该步骤替换了此集成路径的no-op DI decorators；尚未把全部产品组件装入默认CLI/Web图。
- REA最终DI evidence `ev_e322348db9d4609a52f50176810091f9ca188b310513578e975c4390e1a6512c`：370 parsed、82200 AST nodes、0 parse failures，partial/truncated；Backend evidence `ev_af605857a9fb4dc8bc4784362c1bad70470ca3ab641d0a44804cce4b27c4765a`：2 parsed、588 nodes、0 parse failures，unknown/not truncated。均750/150 limits、45s预算，静态分析未执行bootstrap。
- 新英文Native DI文档/README入口说明实例化、元数据隔离、核心binding加载顺序和原生命周期边界。顺带移除proxy wrapper从生成模板误带的无关constantsOnly分支；其20factory bodies未改并复核source verifier。
- 已定位原container bootstrap 50984 `[30147,32093)`：先安装25844，再加载78842/67759，顺序异步加载25个模块。该源码已提取到work，尚未执行；下一步需按真实加载次序恢复产品binding入口，而非假定现有独立宿主等价于默认图。
- 最终check/build、DI/backend/proxy源码对照、编译后DI专项 **5/5**、全量core **1948/1948**、Web **11/11**、CLI/Web launchers及diff whitespace全部通过。日志`work/native-di-{check,build,verify,tests,core,hosts,launchers,proxy-verify}.log`与`work/backend-application-verify.log`。总体目标继续保持未完成。

### 2026-10-24：原始容器 bootstrap 与同步注册入口

- 核对固定样本真实入口链29570→86355→50984，确认容器loader属于CLI启动路径而非无关library入口。完整恢复50984及25个同步注册factory，共26factory；公开createNativeContainerBootstrap，显式start且保留单次module cache、原core同步加载和25阶段顺序promise链。
- 原异步入口8588：其依赖92378异步产品聚合模块，仍由调用方显式提供。source-map-support安装25844及各产品component namespace同样显式借入，不以空模块冒充恢复。绑定入口66892的__dirname由configBasePath供给；文档列出全部25阶段与父模块编号。
- 源码对照覆盖26完整factory与3组source/port：真实原DI容器中的import/decorator注册顺序、缓存、REST factory、FileSystem覆盖（保留ES namespace/default形态）、ProductConfigBasePath、held final async module、同步安装throw及异步catch/log/resolve undefined。产品namespace与installer为明确fixture，未宣称默认native全图已可启动。
- REA `ev_162c3874d18bccc0919d07503a74c442f17dc628f987dbb71a7f9eb8a287c4c7`：26 parsed、1889 AST nodes、0 parse failures、partial/truncated（750/150、45s）；未执行全包入口。verifier分别标记bundleBootstrapExecuted=false、recoveredContainerBootstrapExecuted=true，避免将隔离loader测试与原全包启动混淆。
- check/build、26factory源码对照、编译后DI/Backend/Galileo/bootstrap专项 **8/8**及diff whitespace通过。日志`work/container-bootstrap-{check,build,verify,tests}.log`。README/英文bootstrap审计文档已更新。未重复全量core/Web，最近全量1948/Web11/CLI+Web启动为上一批证据。

### 2026-10-24：原始异步模块运行时与最终产品注册

- 新增installNativeModuleRuntime，完整恢复原Rspack helper序列 `[22118069,22120807)`，包含async dependency queues、exports/error/deferred symbols、interop/namespace/live getters及module metadata helper。无自写Promise-all替代原异步语义；完整序列AST对照与3组source/port验证nested/held/rejected依赖、延迟namespace及getter。
- 新增createNativeProductRegistration，完整恢复8588及92378两个factory；保留聚合模块16个组件namespace imports、3个awaited async parents、实时导出、最终autoBind、ProductConfigBasePath动态重绑定、OriginalModelProvider lazy cached alias。创建不激活，load/getModule使用原runtime和独立module cache；源代码及公共出口已纳入index。
- 3组product source/port验证真实DI下等待/拒绝/live exports/model alias，并将真实产品注册接入原50984 bootstrap最后一阶段，held dependency未释放前container不完成，释放后验证最终路径覆盖。产品namespace/process installer仍明确fixture，未宣称整个默认native图已启动；各父namespace列表及共享resolver组合方式见英文文档。
- REA `ev_1cce9ffd75ab7ae131af3b5dc6288bf62fb2ce362ad854eee1775c23bc8296b2`：3 parsed、11940 AST nodes、0 parse failures、partial/truncated，750/150 limits、45s；未执行原全包entrypoint。原26factory bootstrap verifier随fixture导出变更复核通过。新增英文文档并更新README/bootstrap边界说明。
- 最终check/build、runtime完整region及product完整factory源码对照、DI专项 **14/14**、编译后全量core **1957/1957**、Web **11/11**、CLI/Web launchers与diff whitespace全部通过。日志`work/product-registration-{check,build,verify,bootstrap-verify,tests,core,hosts,launchers}.log`与`work/module-runtime-verify.log`。继续恢复真实component namespaces、source-map安装及服务器/启动所有权边界，整体目标未完成。

### 2026-10-24：原始 source-map 安装器与 bootstrap 首阶段

- 新增createNativeSourceMapSupport，完整恢复25844及consumer/generator/source-node依赖，共15factory；显式require/process/Error边界，创建不安装，保留install对Error.prepareStackTrace/process.emit的原始修改及未处理异常print/exit逻辑。没有新增卸载语义或合成module.require兼容行为。
- 15factory AST及4组source/port通过：原bootstrap调用真实installer；真实临时JS/inline map及独立VM Error栈映射/source excerpt；重复安装和已处理/未处理异常；retrieval override/reset及非法环境。测试只修改独立VM Error与EventEmitter process，真实宿主Error formatter不变。恢复原regex flag顺序以满足完整AST，不放宽比较。
- REA `ev_95437730825da5fa5f0de1b5fb7a7563c3127b296a6f812f5a6294d2d02ede44`：15 parsed、10437 AST nodes、0 parse failures、partial/truncated（750/150、45s）；未执行全包entrypoint。bootstrap 26factory源码对照随fixture installer注入扩展复核通过。新增英文source-map文档，README区分DI与bootstrap入口。
- 后续Backend namespace 15062已提取：6579重导出93772/96000；69066重导出30805 Context（已在native-http-runtime完整恢复，可复用owned HTTP host的module identity）；81840重导出35306 crc32→77598 node:crypto。尚未把这些重导出入口装配为默认namespace，不把已提取视为已完成接线。
- 最终check/build、source-map/原bootstrap源码对照、DI专项 **18/18**、编译后全量core **1961/1961**、Web **11/11**、CLI/Web launchers及diff whitespace全部通过。日志`work/source-map-support-{check,build,verify,bootstrap-verify,tests,core,hosts,launchers}.log`。完整默认产品服务图与原服务器启动装配继续推进，整体目标未完成。

### 2026-10-24：Backend namespace 接入原容器启动阶段

- 新增createNativeBackendNamespace，完整恢复15062/6579/69066/81840/35306/77598六factory。load/getModule延迟执行并缓存，93772/96000借入同一原BackendApplication实例，30805借入已有native-http-host的原BaseContext module，避免复制CLS namespace或改变类身份。
- 原bootstrap的67759阶段实际载入该namespace，真实DI取得Application并推进ready→原拼写stoped；两路并发请求验证与HTTP host共享Context身份及隔离。真实父Application/HTTP上下文，其他产品namespace与installer明确为fixture。关闭移除应用tagged signal handlers并等待HTTP owned cleanup。
- 6factory AST与2组source/port通过，crc32 helper保留node:crypto委托行为（包括当前运行时不支持算法时的原错误），未新增fallback。bootstrap verifier随fixture parent路由扩展复核通过。
- REA `ev_441dd2cf7f4d087ae337ed539d8bc1ae32815fa33493367c59b338288f80286b`：6 parsed、787 AST nodes、0 parse failures、partial/truncated（750/150、45s）。新增英文Backend namespace文档，更新README/bootstrap入口。
- check/build、namespace/bootstrap源码对照、编译后装配专项 **20/20**及diff whitespace通过；日志`work/backend-namespace-{check,build,verify,bootstrap-verify,tests}.log`。未重复全量，最近全量core1961/Web11/CLI+Web launcher为上一批证据。
- 下一步原服务器factory86355 `[125764,126462)` 已提取；其Express入口47704→74880的闭包已静态提取到`work/express-closure.json`（169 modules、544693 chars），尚未作为src恢复或执行。76021中看似外部iconv-lite require为诊断字符串，并非真实外部调用；实际builtin imports已列入inventory。完整产品默认图与原服务器启动仍未完成。

### 2026-10-24：内嵌 Express 与原服务器入口

- 新增createNativeExpress，完整恢复47704入口及169-factory闭包（保留原路由/body parser/static/encoding/MIME等实现，未替换为npm Express）。factory创建不监听；Node builtins显式require。完整AST及2组source/port实测gzip JSON、route/query参数、400/413解析错误、500 middleware、all('*')、静态range/HEAD、router mergeParams。
- 新增createNativeBackendServer，完整恢复86355及39654两个factory；显式start保留原container.then→ContainerProvider.set→Application.start→Express all('*')→listen→逐个ServerAware→log顺序。保留原端口环境变量0回退规则和serve打印配置端口；不新增ready Promise、server导出或shutdown/error处理。
- server source/port实际等待held container，再以真实DI/BackendApplication/Express/Dispatcher/HandlerExecutionChain/Context服务两路并发请求及500错误路径；应用route/error dependencies是明确fixtures，未宣称所有产品端点已可用。ServerAware捕获真实server，清理server、tagged signals及owned HTTP context。
- REA `ev_c0728407f0b4e6794338d7105c2039ae14a152c141fe656864ad3f6142c87242`：171 parsed、64496 AST nodes、0 parse failures、partial/truncated（750/150、45s）；未执行原全包entrypoint。新增英文Express/server文档及README入口，bootstrap文档指向已恢复服务器阶段。
- 最终check/build、Express/server完整源码对照、装配专项 **23/23**、编译后全量core **1966/1966**、Web **11/11**、CLI/Web launchers与diff whitespace全部通过。日志`work/backend-server-{check,build,verify,tests,core,hosts,launchers}.log`及`work/express-verify.log`。完整默认产品组件图仍未装配完，目标保持进行中。

### 2026-10-24：完整装饰器 HTTP 组件与真实 DI 请求链

- 新增 createNativeHttpComponents，完整恢复247个factory，保留HTTP Dispatcher、middleware、cookies/session、trace、health、error、validation、pipe与REST组件原始装饰器；116个共享父模块复用原DI/Express，Backend Context显式借入。创建惰性，load/getModule保留module identity及原Rspack helpers。
- 显式globals承载验证库全局metadata，避免无意写入宿主globalThis。真实DI直接解析Dispatcher及其HandlerMapping/MiddlewareProvider，不再手工赋值依赖；原server实际处理两路并发JSON、trace header、健康检查UP及默认404。测试只提供应用route adapter及ServerAware观察器，完整默认产品图仍未完成。
- 247完整factory AST与1组source/port网络场景通过；REA `ev_fc5cfa9903e6ec5c4b865328fddb1e464bae9b56bf63469fd47c003b311548c0`：247 parsed、113183 AST nodes、0 parse failures、partial/truncated（750/150、45s）。未执行原bundle入口。
- 英文HTTP components文档与README入口已更新。后续原bootstrap前三个异步阶段21280→78824 REST、39066→27371 PathResolver、62309→47005 HTTP可接入该组件加载器，需保留分阶段装饰器注册/autoBind顺序，不能预先load全部再假定等价。
- 最终check/build、247factory源码对照、编译后装配专项 **24/24**、全量core **1967/1967**、Web **11/11**、CLI/Web launchers及diff whitespace通过。日志`work/http-components-{check,build,verify,tests,core,hosts,launchers}.log`。目标保持进行中。

### 2026-10-24：共享 Backend foundation 接入原 bootstrap

- 新增 createNativeBackendFoundation 宿主装配层，惰性共享 BackendApplication、Backend namespace、Context、Express、完整 HTTP modules 与 DI。getModule 对未接入产品模块返回 undefined，保留调用方继续路由，不创建空服务或伪造默认产品图；closeContext 只清理自有上下文，应用/服务器/DI由调用方管理。
- 原50984与26个注册factory真实接入15062→78824→27371→47005，保留每阶段autoBind边界。纠正文档中27371的分类：它是PathResolver namespace，参数验证管道在HTTP图中。原RestOperationsFactory注入后创建singleton客户端，实际访问原服务器/原health middleware，返回200/UP；PathResolver及Dispatcher亦从真实容器解析。
- 新增captured/recovered bootstrap装配对照，26factory完整AST与网络场景通过；其余产品namespace与本场景source-map安装仍为明确fixtures。沿用已有REA静态证据，本轮宿主装配代码不冒充新提取factory。
- check/build、backend-foundation源码对照、编译后装配专项 **25/25**通过。日志`work/backend-foundation-{check,build,verify,tests}.log`。英文foundation文档、README和bootstrap说明更新。本轮未重复全量：最近全量core1967/Web11/CLI+Web启动为上一轮证据。完整默认产品图仍未完成，目标保持进行中。

### 2026-10-24：原 MVC 控制器、视图与 bootstrap 注册

- 新增 createNativeHttpController，完整恢复37819 namespace及81个factory（84767 JS chars），其余134个依赖复用已恢复HTTP/Express模块。保留原Controller/HTTP method/参数/Header/Catch装饰器、RouteBuilder/Matcher、MvcHandlerAdapter、参数与响应resolver、JSON/Mustache/File视图及文件依赖。__dirname由显式basePath提供，不自行猜测原安装路径。
- 共享Backend foundation增加惰性MVC路由，原94015注册阶段执行真实namespace和autoBind。更新foundation场景，原bootstrap可解析MVC图并继续启动原服务器。组件创建不提前注册装饰器，不用人工HandlerAdapter替代MVC调用链。
- 81完整factory AST及source/port真实HTTP场景通过：并发POST的Param/Query/Body、异步Context身份、Header、Json、Catch TypeError、Mustache HTML escaping、真实文件流与临时目录清理。通过原singleton REST客户端调用原server；其他产品namespace及该场景source-map安装仍明确为fixtures。
- REA `ev_81291dbeadf16f76bde57b4189825a186af39296c0c9a52689706fcd165ed56f`：81 parsed、23234 AST nodes、0 parse failures、partial/truncated（750/150、45s）。未执行原bundle entrypoint。新增英文MVC文档并更新README和foundation装配说明。
- 下一阶段65903→51147公共namespace已核对16个重导出入口，涉及FilePath/FileName/UserHome、内存清理/监控、上传及AgentEditContext；仅完成入口提取，尚未声称该产品服务图已恢复接线。
- 最终check/build、MVC 81factory与foundation 26factory源码对照、编译后装配专项 **26/26**、全量core **1969/1969**、Web **11/11**、CLI/Web launchers及diff whitespace通过。日志`work/http-controller-{check,build,verify,foundation-verify,tests,core,hosts,launchers}.log`。完整默认产品图仍未完成，目标继续进行。

### 2026-10-24：公共服务 namespace 与原请求头/内存组件

- 新增 createNativeCommonServices，完整恢复51147及64个factory（114670 JS chars），8个依赖共享已有HTTP/Express缓存。保留SampleEncryptor、FileNameService、Env/Object/Hash/Patch工具、CommonHeaderHttpInterceptor、MemoryCleanupService、EnhancedMemoryCleanup、MemoryMonitor、SmartMemoryMonitor、SubscriptionManager及服务tokens；接口token存在不代表对应产品实现已接线。
- Backend foundation惰性路由原65903注册阶段，原ApplicationLifecycle实际安装原REST request interceptor。原服务器/MVC接收真实请求，验证显式request ID优先、trace ID继承、自动ID生成及proxy=false；同一原bootstrap容器解析编码、命名、hash与patch行为。
- 独立globals/Error与受控timers保留内存副作用语义；验证增强清理四个interval的dispose、memory pressure cleanup、Smart monitor baseline/warning/critical/recovered顺序、cleanup统计及原aggressive cleanup的未追踪延迟GC。dispose不取消该延迟GC这一原行为保留，未用新增卸载语义掩盖。
- 64完整factory AST与source/port场景、foundation原26factory对照通过；REA `ev_e1cf95eac536ec0b3cc3ca66992cea94038ea594908acf522187a81b36d77880`：64 parsed、30905 AST nodes、0 parse failures、partial/truncated（750/150、45s）。未执行原全包bootstrap。英文公共服务文档、README与foundation说明更新。
- 后续10352→67846 namespace入口已提取，重导出56490/51157/20760/41885/82005/60559/13393；尚未恢复其完整依赖与注册图。
- 最终check/build、common 64factory与foundation 26factory源码对照、编译后装配专项 **27/27**、全量core **1970/1970**、Web **11/11**、CLI/Web launchers及diff whitespace通过。日志`work/common-services-{check,build,verify,foundation-verify,tests,core,hosts,launchers}.log`。完整默认产品图仍未完成，目标保持进行中。

### 2026-10-24：Node 服务、COS SDK、代理与 PAC RPC

- 新增 createNativeNodeServices，完整恢复67846及372个factory（1205817 JS chars），25个父依赖共享已有HTTP/Express/common modules。包含FilePathServiceImpl、UserHomeServiceImpl、FileUploadServiceImpl、COSFileUploader及完整原COS SDK、stream/filesystem helpers、ProxyResolver/system detection/PAC RPC。保留原module id/loaded、exports-bound调用和require.c cache，显式filename供原__filename使用。
- Backend foundation接入10352→67846真实注册阶段，原容器解析common tokens对应的路径和上传实现。测试验证用户/IDE目录组合、Downloads、无支持uploader结果、通过本地真实REST获得COS info并完成empty upload；不冒充已验证生产多文件上传。
- Source/port场景验证配置/env/PAC优先级、explicit DIRECT、bypass规则、loopback补齐；原PAC客户端实际通过临时Unix socket携带token请求。原COS SDK用本地custom Domain实际发送PUT body，接收端确认字节内容；无外部COS上传，临时文件/socket/server均清理。
- 372完整factory AST与原bootstrap网络场景通过；REA `ev_79f49e8fbd31c97f640e80b16d7ed0b43bf2461d7a568f3e78e45a172f9f5710`：372 parsed、283267 AST nodes、0 parse failures、partial/truncated（750/150、45s）。其余产品namespace与本场景source-map安装仍为明确fixtures；未执行原全包入口。
- 英文Node services文档、README及foundation注册顺序更新。下一阶段53879→66915入口提取用于后续依赖核对，尚不计入恢复完成。
- 最终check/build、Node services 372factory与foundation 26factory源码对照、编译后装配专项 **28/28**、全量core **1971/1971**、Web **11/11**、CLI/Web launchers及diff whitespace通过。日志`work/node-services-{check,build,verify,foundation-verify,tests,core,hosts,launchers}.log`。完整默认产品图仍未完成，目标保持进行中。

### 2026-10-24：上下文变量服务与原空 namespace

- 新增 createNativeContextVariableServices，完整恢复66915及23个factory（6540 JS chars）：tokens、原ContextVariableManagerImpl、转换工具、related-file/knowledge-base enums与原type-only modules。Backend foundation接入53879→66915真实注册阶段，共用DI metadata，不自行补造产品resolver。
- source/port通过原bootstrap真实解析manager，验证正优先级选择、priority异常归零、resolve异常日志后继续、missing/empty跳过、动态collection resolver覆盖、输入不变与重复name最后值覆盖。保留原batch调用getResolver时不传context、仅resolve接收context的源码行为。
- 下一阶段92712依赖80558已确认为原包空factory `80558(){}`，直接加入原bootstrap本地captured factories，当前bootstrap共27factory。去除fixture对80558的虚构component注册，完整AST与顺序/失败场景复核通过；没有把缺失模块自动替换为空。
- REA `ev_72f99dbfc813b98ac90e160c1f1e89430d24adda7c6ec3650c61551ae156755d`覆盖23个context factory+80558：24 parsed、1743 AST nodes、0 parse failures、partial/truncated（750/150、45s）。英文文档、README及bootstrap/foundation说明更新。
- 后续61488/97619文件系统阶段入口已提取：79814与54463服务namespace、61000原memfs入口（数字键原写为61e3）、72018/98776 FileSystem token、79896真实node:fs wrapper。尚未恢复整组文件系统装配。
- 最终check/build、context 23factory与bootstrap/foundation 27factory源码对照、编译后装配专项 **29/29**、全量core **1972/1972**、Web **11/11**、CLI/Web launchers及diff whitespace通过。日志`work/context-variable-services-{check,build,verify,bootstrap-verify,foundation-verify,tests,core,hosts,launchers}.log`。完整默认产品图仍未完成，目标保持进行中。

### 2026-10-24：原 memfs、真实文件系统覆盖与工作区服务

- 新增 createNativeFilesystemServices，完整恢复79814/61000/54463及118个factory（193962 JS chars），8个依赖共享HTTP/Express。包含memfs、原Workspace/FileSystem tokens与实现、URI/Rx依赖、MemoryLocalStorage、Notifier/Opener/Previewer/Userinfo默认实现及SystemInfoContextVariableResolver。
- 提取时确认22186是自带内部loader的URI bundle，其内部ec(975)不是外层bundle module；按外层factory是否接收require参数区分闭包，保留完整嵌套factory，未错误拼入其他数字同名模块。
- Foundation接入61488/97619两阶段，源码场景用真实DI/原注册factory验证先绑定原memfs对象、再覆盖为真实node:fs的ES namespace（保留default及named method身份）。独立volume隔离、memory/disk分别写读、临时目录清理通过。
- 原ContextVariableManager现可解析真实systemInfo resolver，验证默认Desktop、更新Workspace URI后的路径及平台shell；原MemoryLocalStorage事件、false/true/undefined host默认返回和Notifier单次占位符替换均保留。没有将这些原默认行为替换为自造宿主功能。
- 118完整factory AST与source/port、foundation 27factory对照通过；REA `ev_313acc887a4007b5d7d903eceb1653b14077c26f5e7378eb8f0b365a295399ec`：118 parsed、54071 AST nodes、0 parse failures、partial/truncated（750/150、45s）。英文文档、README、bootstrap/foundation说明同步更新。
- 最终check/build、filesystem 118factory与foundation 27factory源码对照、编译后装配专项 **30/30**、全量core **1973/1973**、Web **11/11**、CLI/Web launchers及diff whitespace通过。日志`work/filesystem-services-{check,build,verify,foundation-verify,tests,core,hosts,launchers}.log`。后续54387→9151及66892→55762/18629产品配置阶段仍待完整装配，目标保持进行中。

### 2026-10-24：产品配置原始注册、提供者与管理器

- 新增 createNativeProductConfigServices，完整恢复9151/55762及62个factory（417174 JS chars），包括ProductManager/CloudProductManager、默认/客户端/env/cloud/custom-model providers、原merge策略、catalog/capability helpers、feature filters、gzip和endpoint interceptor。共享既有foundation依赖，显式basePath供原__dirname。
- Foundation接入54387与66892，保留原ProductConfigBasePath绑定、Client缓存与manager PostConstruct同步。测试在独立临时目录/process.env中验证product.json缓存、env优先级及legacy字段剥离、自定义模型真实watcher、availableModels最终过滤、manager重复sync及dispose；未读取现有账号配置。
- 原CloudProductManager对本地HTTP服务实际fetch，原endpoint interceptor将relative请求路由到本地override并添加SaaS product header；partial Galileo连接字段覆盖保留原disable/reset逻辑。完整后续产品提供者及生产认证/远端服务仍未声明完成。
- 62完整factory AST与source/port、foundation 27factory对照通过；REA `ev_a8dcb00929b387130581c25c76efb058fba13402a6ed95061cd5e51822df9689`：62 parsed、74885 AST nodes、0 parse failures、partial/truncated（750/150、45s）。英文文档、README与foundation注册顺序同步更新。
- 最终check/build、product config 62factory与foundation 27factory源码对照、编译后装配专项 **31/31**、全量core **1974/1974**、Web **11/11**、CLI/Web launchers及diff whitespace通过。日志`work/product-config-services-{check,build,verify,foundation-verify,tests,core,hosts,launchers}.log`。后续30135→66467、18707→92735、57100→54834入口已提取但依赖图未装配，目标保持进行中。

### 2026-10-24：原 Winston 注册与共享 logger 生命周期

- 新增 createNativeWinstonServices，完整恢复66467及117个factory（172326 JS chars），15个依赖共享HTTP/Express。保留原Winston、transport/format依赖及30135对DI Logger的transient rebind；foundation提供惰性resolver。
- 明确验证原fallback初始化细节：未提供RawWinstonLogger且module cache首次创建logger时，init只赋共享eu而未赋this.logger，首实例getLogger为undefined、调用info失败，后续实例取得共享logger。源码未被“修复”；需要与后续原FileLogger替换链继续组合。
- 真实DI原注册stage中注入真实captured Winston+Writable stream transport，验证transient wrapper、共享raw identity、context及info/warn/error输出并关闭transport。foundation完整bootstrap测试已加载该stage，最终binding显式提供real raw logger，使已有服务器链继续工作；该测试输入不冒充完成后续产品日志图。
- 117完整factory AST/source-port及foundation 27factory对照通过；REA `ev_a38b5d926fb87d5fcf335e34a164fd763b2aaa3f7b9a128e828c51bf6a985965`：117 parsed、47147 AST nodes、0 parse failures、partial/truncated（750/150、45s）。英文Winston文档、README与foundation边界说明更新。
- 后续92735 telemetry namespace与54834 node logging namespace入口已核对，包含FileLogger重绑、LoggerStorageService/UploadService、ClientIpDetector、OTLP代理等；尚未把这些完整注册namespace接入默认图，不以已有独立SDK宿主替代其DI注册。
- 最终check/build、Winston 117factory与foundation 27factory源码对照、编译后装配专项 **32/32**、全量core **1975/1975**、Web **11/11**、CLI/Web launchers及diff whitespace通过。日志`work/winston-services-{check,build,verify,foundation-verify,tests,core,hosts,launchers}.log`。完整默认产品图仍未完成，目标保持进行中。

### 2026-10-24：原事件报告注册、处理器与 HTTP 分批

- 新增 createNativeEventServices，完整恢复92735及162个factory（474357 JS chars），15个父依赖共享已恢复foundation。包含Standard/Model EventService、product/experiment/user/client-IP/Qimei/timezone processors、logging/history接口和startup performance helpers；foundation接入18707真实注册阶段。
- source/port场景使用真实DI、ProductManager及REST，通过临时product.json和本地HTTP接收端验证同步发送、按排序header key合并批次、extra/per-report header覆盖、processor字段、stripEnv、onReport通知，以及DISABLE_TELEMETRY="0"仍禁用的原语义。原processor timeout race成功后仍保留timer；测试持有并清理这些timer，未修改factory行为。
- 162完整factory AST/source-port及foundation 27factory对照通过。REA `ev_d1d47807416cf827a0666ab6e799c17b6cff036a71e9e2748babb918705d5b9c`：162 parsed、114583 AST nodes、0 parse failures，语义分析受750/150和45s预算限制。没有执行原全包bootstrap，也没有发送外部遥测。
- 英文事件服务文档、README索引及foundation注册链同步更新。92735是事件上报namespace，不等于完整Galileo SDK装配；后续54834 Node日志闭包已提取到work供继续恢复，尚未计入已完成原生默认图。
- 最终check/build、event 162factory与foundation 27factory源码对照、编译后装配专项 **33/33**、全量core **1976/1976**、Web **11/11**、CLI/Web launchers及diff whitespace通过。日志`work/event-services-{check,build,verify,foundation-verify,smoke,core,hosts,launchers}.log`。默认产品图和FileLogger/storage/upload链仍待继续装配，目标保持进行中。

### 2026-10-24：原 Node 日志注册、FileLogger 与存储归档

- 新增 createNativeNodeLogging，完整恢复54834及333个factory（908942 JS chars），包含原FileLogger、LoggerStorageService、Upload API/service、OS事件处理器、IP检测、OTLP proxy injector、archive依赖，以及UploadService导入的86482认证namespace。复用既有DI/Express/event/product/filesystem/HTTP父模块。
- 闭包提取发现40544使用原参数名__webpack_require__而非ec；改为按factory第三参数追踪依赖，补齐jsonwebtoken等28个factory，原函数体保持不变。333完整AST与同场景source/port对照通过。
- Foundation接入57100→54834与57740→86482；原FileLogger自然覆盖Winston Logger binding，删除foundation场景显式RawWinstonLogger注入。原bootstrap和真实Application/Dispatcher/REST仍完成health 200/UP；剩余产品阶段继续明确为fixtures。
- 独立临时product/log目录中使用真实ClientInfoProvider与原注册stage，验证transient FileLogger、过滤前事件通知、日志阈值、异步与同步真实文件写入、workspace header、原ZIP归档、禁用upload结果及真实OTLP proxy agent创建/关闭。外部认证、生产上传与海外IP检测未被本地场景证明。
- 宿主清理顺序验证发现container解绑时原服务仍会产生日志并重启scheduler；改为解绑后排空日志并flush，再dispose scheduler/interval。两项源码集成测试约0.6s结束，不修改原service生命周期以隐藏此行为。
- REA `ev_c7b7df713e09391870da89fec318b55b6426659ed835c51067edcd126e85b698`：333 parsed、247491 AST nodes、0 parse failures；语义分析受750/150和45s预算限制。英文Node logging文档、README及foundation/Winston/event边界说明同步更新。
- check/build、333factory与foundation 27factory源码对照、装配专项 **34/34**、全量core **1977/1977**、Web **11/11**及CLI/Web launchers通过。清理顺序修订后再次编译并复核source/port与装配专项；全量测试在该测试宿主清理修订前通过，产品factory未再修改。日志`work/node-logging-{check,build,verify,foundation-verify,smoke,core,hosts,launchers,teardown}.log`。
- 后续注册roots已提取到work：3203/3618均为原8字符空factory；14931、23294、83052、24015仍待完整依赖装配。空factory尚未替换对应fixtures；默认原生产品图仍未完成，目标保持进行中。

### 2026-10-24：原代码采纳率注册、Git/SVN 与空 namespace

- 新增 createNativeCodeRatioServices，完整恢复14931/23294及19个factory（21661 JS chars），6个父模块共享DI/product/event/diff/filesystem。包含CodeRatioReporter、deployment/feature gates、diff/statistics、Git commit loader、name-status/unified-diff解析和SVN helpers；foundation接入98759/5112真实注册。
- source/port通过真实ProductManager、StandardEventService/处理器和本地HTTP验证rejected/unchanged/binary跳过、实际diff与protocol字段、净增行统计及commit重复去重。临时真实Git仓库生成两个commit，原loadCommit解析parent、两行新增/一行删除；不访问外部仓库或遥测服务。
- 保留原语义差异：CodeChangeEvent.lineCount按文件净增行数计算（本例1），Git commit files保留实际新增行（本例2）及删除行（本例1）；truncateDiff使用JS字符串长度而非字节数，未自行改写算法。
- 将原3203(){}与3618(){}加入bootstrap本地完整factory，删除其虚构namespace fixture组件。当前bootstrap共29个factory，完整AST/顺序及失败路径对照通过；没有以空factory填补缺失实现。
- REA `ev_56c4a12ff9ca58d5e52491f186c8cdad2d9abdb8d1a1bcde7a1efe5286fd34ad`覆盖19个code-ratio factory及2个原空模块：21 parsed、5504 AST nodes、0 parse failures；语义分析受750/150和45s预算限制。英文文档、README及foundation/bootstrap说明同步更新。
- check/build、code-ratio 19factory与bootstrap/foundation 29factory原包对照、装配专项 **35/35**、全量core **1978/1978**、Web **11/11**、CLI/Web launchers和diff whitespace通过。日志`work/code-ratio-services-{check,build,verify,bootstrap-verify,foundation-verify,smoke,core,hosts,launchers}.log`。
- 剩余83052/24015提示词基础设施与PromptManager闭包已提取到work/remaining-platform-closure.json；新增候选244factory/350986 JS chars在work/prompt-services-owned.json，尚未写入产品实现或计入完成。提取修正首模块80707的左边界为bundle首个花括号；仍使用JS UTF16 offsets。默认产品图与最终产品注册装配继续进行中。

### 2026-10-24：提示词基础设施、原 Nunjucks 与 PromptManager

- 新增 createNativePromptServices，完整恢复83052/24015及244个factory（350986 JS chars），16个父依赖共享现有图。包含prompt/message/model基础类、streaming helpers、ProductPromptProvider、evaluator/renderer/manager、原Nunjucks和完整依赖；显式filename用于原依赖__filename诊断。
- Foundation接入94666/59747真实注册，至此最终8588之前同步namespace全部由原factory或原样空factory提供。集成场景仍显式保留source-map安装和最终异步产品注册fixture，未将此里程碑描述成完整产品默认启动。
- source/port场景以真实ProductManager和临时product.json验证缺失模板、tags评分选择、不转义渲染、循环、编译模板cache identity、配置发布后模板替换，以及PromptImpl.copy新建message但共享options原语义。原App启动包含这些注册并完成真实REST health。
- 244完整factory AST与foundation 29factory对照通过。REA `ev_b6f84d8a23472cd23788fe3c61b72f6d88cce0317915de1909f3735ac04b2abe`：244 parsed、99120 AST nodes、0 parse failures；语义分析受750/150与45s预算限制。未改写任何prompt文本或执行原全包bootstrap。
- 英文prompt文档、README及foundation边界更新。check/build、装配专项 **36/36**、全量core **1979/1979**、Web **11/11**、CLI/Web launchers及diff whitespace通过。日志`work/prompt-services-{check,build,verify,foundation-verify,smoke,core,hosts,launchers}.log`。
- 下一阶段聚焦8588/92378最终产品聚合。其19个直接parent factory已提取到work/final-product-roots.json，包含74428主harness aggregate、三个async UI/doctor/resume入口、导航/undo、model provider/record-replay/path等；仅提取供核对，尚未接入真实默认图。目标保持进行中。

### 2026-10-24：完整产品 factory 图、延迟加载与原 Application 激活

- 新增 createNativeProductModules，恢复最终产品聚合所需的2153个完整factory（16570398 source characters），包含主harness、gateways、terminal UI、doctor/resume、model providers、telemetry及依赖；142个父引用复用现有DI/Express/foundation。构造惰性，激活显式；不通过空返回替代缺失模块。
- 初始直接调用闭包1906factory，经require.bind/require.t/require.t.bind边审计补齐247个延迟模块。新增capturedBundleModuleIndex从原包顶层Rspack table索引4566个唯一module ID；所有2153个范围与顶层table一致，再比较完整AST，避免嵌套bundle数字ID误匹配。2153完整AST/source-port通过。
- 真实DI场景验证Navigation/Undo/RecordReplay绑定及原PKCE challenge生成/验证。隔离子进程组合真实foundation、最终8588/92378和完整产品模块，成功创建container、验证OriginalModelProvider binding，并以--serve模式执行原Application.start/stop，状态分别为ready与原拼写stoped。原初始化改写console routing，成功状态通过独立fd输出以免误判无输出。
- 初始MCP未初始化错误经首个factory异常追踪，证实为隔离globals继承Node crypto getter导致ERR_INVALID_THIS的连锁结果；显式Web Crypto修正后消失。后续fetch为包内data: base64 WASM，允许本地解码后完整注册成功；继续拒绝外部网络和subprocess。原telemetry需要替换global fetch，宿主为其提供可写属性。没有修改factory或提前初始化符号来隐藏故障。
- 子进程使用临时cwd/HOME/config、owned process和其原生Error，退出时清理；独立process/global/fetch边界防止污染父测试进程。该测试仍显式使用source-map安装fixture，尚未启动最终HTTP listener或迁移默认CLI/Web到完整产品图，不能据此宣称完整目标已达成。
- REA直接闭包 `ev_89bca599e855041a49edf9917c4f87cd91f637dc1f0816c1c912ddae3a156f45`：1906文件、1905 parsed/1 skipped、2854211 AST nodes、0 parse failures（750/150、45s，partial语义覆盖）。延迟闭包初轮45s超时，120s复核成功：`ev_7ce057a6bdb9f6eb2c15fa01ed7f49f212e1cec826b2c3c136d0fcb6c2075805`，247 parsed、355962 AST nodes、0 parse failures；全factory独立AST验证覆盖REA跳过项。
- 英文product modules文档、README及product registration说明更新。最终check/build、2153factory对照、装配专项 **38/38**、全量core **1981/1981**、Web **11/11**、CLI/Web launchers与diff whitespace通过。日志`work/product-modules-{check,build,verify,bootstrap-tests,smoke,core,hosts,launchers}.log`。
- 下一阶段移除完整产品启动测试中的source-map fixture，连接原BackendServer实际listener并验证health/ACP入口，随后推进默认宿主整合和实际模型/工具回路；目标保持进行中。最终产品聚合不再仅为namespace fixtures，但默认宿主仍保留既有边界。

### 2026-10-24：原生产品 runtime、真实 HTTP 与 ACP 初始化

- 新增createNativeProductRuntime，统一原container bootstrap、source-map installer、foundation、2153factory product modules、8588/92378以及BackendServer的解析与缓存。提供loadContainer/startServer/getModule/closeContext；不自行替换原server生命周期或把startServer返回伪装成ready promise。Foundation公开共享Express实例供产品模块复用。
- 完整产品子进程测试移除source-map install fixture，执行原installer并确认Error.prepareStackTrace身份改变。原BackendServer监听临时loopback端口；observer ServerAware仅记录listener，不替代原服务。Application由原server启动并停止，所有注册namespace来自恢复代码。
- 验证原gateway header middleware：无x-codebuddy-request的health返回403，有header返回200/UP；原/api/openapi.json返回包含sessions的schema。ACP真实connect返回connectionId/sessionToken，带原headers的initialize返回SSE JSON-RPC protocolVersion=1和agentCapabilities.loadSession=true；DELETE成功，随后drain server和Application.stop得到stoped。
- ACP测试处于loopback，原checkSessionToken在loopback直接放行；本场景不冒充验证外部地址token验证。未关闭原gateway或ACP安全middleware来让测试通过。
- 独立session/new探测（work/native-session-probe.log）在无认证配置下获得原错误-32000/Authentication required/category auth。已定位93928 initializeSession要求authManager.currentSessionSubject，以及原40544 CustomTokenAuthenticationStorage可从ACC_PRODUCT_CONFIG_V3/V2中CUSTOM_TOKEN配置恢复会话；下一步使用显式本地测试配置与模型服务验证完整turn，不修改原鉴权逻辑。
- 本轮未新增原factory，复用现有REA/AST证据；foundation 29factory source/port复核通过。check/build、装配专项 **38/38**、全量core **1981/1981**、Web **11/11**、CLI/Web launchers与diff whitespace通过。日志`work/product-runtime-{check,build,tests,smoke,foundation-verify,core,hosts,launchers}.log`。
- 英文runtime文档、README及product modules/registration/foundation边界已更新。HTTP/ACP入口已接通，但完整认证模型/工具turn、原顶层CLI入口补充、默认CLI/Web宿主迁移与跨平台行为仍待验证；整体目标保持进行中。


### 2026-10-24 — Native authenticated ACP model conversation

The full native product child now restores original custom-token authentication from `ACC_PRODUCT_CONFIG_V3`, creates a configured CLI/default agent session over ACP, and completes `session/prompt` through the original AgentService/Runner and ModelProvider. A deterministic local HTTP server receives the streaming Chat Completions request at the exact configured `/v1` URL; ACP forwards the returned assistant text and reports `end_turn`. No authentication subject, AgentManager, Runner or ModelProvider is substituted. Agent configuration uses `models: [id]`, not a singular `model` property.

Internal `/internal/agent` requests require loopback access to the product server itself. The test permits only the two owned ports, blocks external network and subprocesses, and closes pooled connections before stopping Application. This proves a native model conversation, not tool execution or completed default CLI/Web migration.

REA re-analysis of original factories 93928, 69466 and 46307: `ev_387695f4afc78f28b27ccb32612027b65358f50390d831bf79aa3cca86c5bbe0`. REA parsed all three files (27,190 AST nodes, zero parse failures). Existing complete-factory fidelity verifiers remain authoritative; this change adds integration assertions without modifying recovered factory bodies.

### 2026-10-24 — Native tool round trip and executable original CLI

The full native ACP integration now requests the original `Read` tool, reads an owned temporary file, verifies its contents in the next model request, and checks ACP's completed tool event and raw output. The local model supplies only the requested tool call and final completion; the tool schema, permission path, filesystem read, history and execution pipeline are recovered services.

`npm run native` adds an executable process boundary around the complete native runtime. It preserves original CLI arguments and accepts a private product JSON file through `AXONFIRE_NATIVE_PRODUCT_CONFIG` (or original `ACC_PRODUCT_CONFIG_V3`). It defaults product state to `~/.axonfire/native`, supports `AXONFIRE_STATE_DIR` and `AXONFIRE_PORT`, and requires explicit configuration for non-informational invocations. Product prompts are user-supplied configuration, not fabricated recovered assets.

The launcher integration invokes original `--help`, then original `-p` twice: first the original non-interactive permission rule denies Read, then `--allowedTools Read` permits it. The latter returns the actual file contents to the model and prints the final answer. The same executable also starts with `--serve`, passes original health/header checks, and terminates on SIGTERM. No permission bypass or substituted tool implementation is used. This direct native entrypoint advances the default-host migration but does not finish it; `npm run cli` and the Web workbench still use their existing hosts.

REA analysis of original factories 6350 and 74428: `ev_a88040b73cf7c4992bc18860b156613bab0bb14813957d191a7691dc21bf46a9`; two parsed files, 319,075 AST nodes and zero parse failures. The existing complete-factory verifiers still cover body fidelity. Original top-entry platform patches, broader tool coverage, interactive terminal behavior, production endpoints and default Web migration remain open.

Validation for this increment: TypeScript build passed; all 1,981 compiled core tests passed; all 12 host tests passed; the extended native launcher test additionally passed its real `--serve`/SIGTERM checks; existing CLI/Web launcher smoke checks passed. The npm native command displays original help successfully. No recovered factory bodies were changed.


### 2026-10-24 — Complete original product entry factory

Recovered factory 29570 (UTF-16 offsets 7518353–7519876) and added `createNativeProductRuntime.start()`. `npm run native` now uses this original entry sequence rather than directly invoking BackendServer. It preloads the existing sidecar readiness module, creates global require from the owned entry filename, applies original Windows child-process wrappers, installs the original warning filters and File fallback, then activates the server. The shared foundation now exposes the already-recovered Buffer namespace 20181 required by this entry.

The source verifier checks the fixed bundle SHA, exact top-level module index and complete factory AST, then runs three behavioral comparisons against the original extracted factory. REA evidence: `ev_084c56faf10eca1f19b5ca97a527193e4663886cee0e0ce95385680ec3652682` (one parsed file, 405 AST nodes, zero parse failures). No original whole-bundle evaluation occurs. Windows fixtures establish wrapper semantics only; full cross-platform deployment, broader sidecar lifecycle, default CLI/Web migration and product asset coverage remain open.


### 2026-10-24 — Default CLI migrated to the original product graph

`npm run cli` and the dispatcher’s default/chat paths now execute the recovered product entry and complete native graph. The direct `npm run native` alias remains available. The previous standalone CLI is explicitly retained as `npm run workbench`; its help and documentation use that name. The Web workbench still runs its existing host, so default Web migration remains incomplete.

The native launcher regression now invokes the default dispatcher, not the alternate entry file. It verifies original help, non-interactive permission denial, authorized real Read execution and model-result round trip, original HTTP health/header behavior and SIGTERM termination. README and setup documentation distinguish original CLI flags/product JSON from workbench flags/model environment variables. This changes the default CLI configuration contract intentionally; no existing workbench state is deleted or migrated.

Validation for the entry/default-CLI migration: final TypeScript build passed; 1,984 compiled core tests and 12 host tests passed; original-entry source/AST verification and all three source-paired behavior comparisons passed; default native CLI help, explicit workbench CLI help and Web SDK startup smoke checks passed. Interactive terminal use, default Web migration and broader cross-platform/product-resource coverage are not proven by these checks.

### 2026-10-24 — Default live Web migrated through original ACP

Default `npm start` now runs the browser UI over an owned native product process. The new `native-process`, `native-acp-client` and `native-runtime` host adapters start the recovered entry, initialize the real ACP connection, handle incremental SSE and nested permission requests, and translate existing browser operations into original ACP/REST calls. No AgentService, Runner, authentication subject or tool implementation is substituted. `npm run web:workbench` explicitly preserves the previous standalone live host; offline demo remains a separate SDK fixture.

Original Write approval/denial, cancellation during approval, post-cancel continuation, question/skip, connection replay and cold disk recovery all execute through the real original implementations. The Ask tool requires `_meta["codebuddy.ai"].question`; answer/skip is resolved through `_codebuddy.ai/resolveInterruption`. Original denial terminates the prompt with `cancelled`/`PERMISSION_DENIED` and no second model request. The browser disconnect test confirms pending decisions expire and cannot later write the file.

The native browser history view uses original REST session summaries. Full ACP event presentation, background team notifications, rich MCP/terminal views and product-resource compaction remain incomplete. A missing advertised compact command explicitly fails without making a model request. Original safe-tool policy is retained rather than forcing every tool through the old standalone approval guard. The browser UI remains a new local host, not the original product UI.

REA: `ev_d6c9b3d9ec61c831927199a5c01e89233e7907fdfd3d538fef71a96acf12be72`, factories 30638/93928/74428, three parsed files, 208,240 AST nodes, zero parse failures. See [native Web runtime](native-web-runtime.md) for protocol mappings and limitations. Default CLI/live Web graph migration is now implemented; full product parity remains open.

Validation for native Web migration: all 23 host tests passed (including the default CLI, five direct native ACP cases and six default Web process cases); repository type/syntax checks passed; existing CLI/workbench/demo launcher smoke checks passed. A final native browser approval/cold-recovery case passed after the permission-option selection refinement. Core recovered TypeScript factories were unchanged in this increment; their previously verified 1,984-test baseline is not presented as a newly rerun suite here.

### Original backend runtime acquisition and termination (2026-10-24)

Recovered the complete `acquireRuntime` and `killRuntimeSession` methods, `buildPrewarmActivateArgs`, `summarizePrewarmArgs` and their original `TAG` declaration into `native-runtime-acquisition.ts`. All five regions are byte-identical to the fixed `initialize.js` capture (SHA-256 `528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19`). Factory closure bindings supply the logger; callers bind the methods to the backend's original state/dependencies.

REA evidence `ev_7756bde9219c521e366df0fe0470d68d4250a1d771967adab7a62854c926c91e`: 3,153 bytes, 521 AST nodes, zero parse failures. `verify:runtime-acquisition` independently evaluates the captured methods and runs eight paired scenario groups covering managed-env identity, warm ownership, activation fallback, background automation, destruction during warm/cold startup, termination fallback, synchronous failure propagation and argument conversion/log summaries.

The owned native prewarm fixture now uses the recovered backend acquisition and termination methods around an actual CLI process and ACP model conversation. It observes replacement idle capacity and verifies the original process exits. The source implementation remains unchanged: a synchronous `tryAcquire()` exception propagates; activation rejection falls back; failed/unhandled pool termination falls back to the manager.

Validation: root build succeeded; core suite 2,290/2,290 passed; compiled acquisition tests 8/8 passed; real prewarm/ACP fixture passed under both Node and WorkBuddy Electron. Logs: `work/acquisition-build.log`, `work/acquisition-core.log`, `work/acquisition-built.log`, `work/acquisition-native.log`, `work/acquisition-electron.log`. The complete AppServer constructor/configuration-coordinator graph and default Web process ownership are still separate integration work. The prior aggregate sandbox audit failure and MCP permission TODO remain unresolved; focused success does not replace that aggregate result.

### Original hosted CLI configuration and auth lifecycle (2026-10-24)

Added `native-hosted-cli-lifecycle.ts` with six complete original declarations plus two contiguous assembly regions: the prewarm construction block from `bootstrapWorkbuddyAppServer` and the product-snapshot subscription from background-service startup. The wrapper signatures/return values are explicit reconstruction boundaries; source region contents are byte-identical. Captures are hash-locked `initialize.js` and `workbuddy-auth-product-coordinator.js`; metadata records every source offset.

The recovered logic retains environment/cache/default capacity precedence, invalid-environment warnings, QIMEI capture, refreshed spawn-baseline provider, pool startup and attachment, and cold fallback. Remote capacity updates cache the next-start value without live resizing. Product snapshot changes rotate the host, then flush even after rotation failure. Authentication changes compare UID/domain/enterprise ownership, serialize resets, invalidate logout history, flush idle prewarms and reset active backends. Token-only changes do not trigger ownership resets. Stop unsubscribes and drains the queue. Host reset failure skips later steps for that event; later queued events recover; pool/backend failures remain independently caught.

REA evidence `ev_48cf960702907bc9c570559e3a669b79a8c9ae3063b2a48da8ce7e3b3b20ad66`: 6,249 bytes, 784 AST nodes, zero parse failures. Eight original source regions and eight paired scenario groups pass `verify:hosted-cli-lifecycle`. The original cache check intentionally accepts integers above the safe-integer range, whereas the environment parser rejects them.

The real prewarm fixture now creates and attaches the actual pool through the original AppServer assembly statements, then runs backend acquisition, ACP model conversation and cleanup. The real host fixture invokes the original snapshot listener for rotation and the original logout queue for manager reset. Event sources, history/backend callbacks and CLI-path/environment provisioning are owned boundary adapters; this does not establish a production account login or completion of the entire background-service graph.

Validation: root build succeeded; core 2,298/2,298; compiled new tests 8/8; both real integration cases passed under Node and WorkBuddy Electron. Logs: `work/hosted-lifecycle-build.log`, `work/hosted-lifecycle-core.log`, `work/hosted-lifecycle-verify.log`, `work/hosted-lifecycle-built.log`, `work/hosted-lifecycle-native.log`, `work/hosted-lifecycle-electron.log`. Complete production CLI environment/backend construction, the remaining background services and default Web ownership integration remain open. The prior full-host sandbox audit failure and MCP permission TODO remain unchanged.

### Original AppServer CLI path and environment construction (2026-10-24)

Recovered the full `resolveWorkbuddyAppServerCodeCliPath`, `buildWorkbuddyAppServerCodeCliEnv` and scoped `warn` declarations from the fixed desktop `initialize.js` capture into `native-app-cli-environment.ts`. The factory composes the existing original sidecar runtime/file helpers, product environment resolver, client identity builder and logger. The containing graph can share its gateway state; process/OS boundaries support owned test roots.

The hosted CLI lifecycle's pool assembly now defaults to these original functions. Bundled bin precedes bundled JavaScript; a returned nonempty bundled path is trusted without an existence check, while the trimmed environment fallback is checked and warns. Managed baseline construction preserves product file/inline precedence, identity, enabled plugin directories, runtime versions and policy, proxy filtering, selected process overrides and last-applied session extras. The original bootstrap-product provider still runs for a product file when V3 inline configuration is absent. These details are retained rather than normalized.

REA evidence `ev_8768a0042ba0aaf443c838b02d59216646ea04c0ef9a597ca6dadd87c9716bd3`: 3,101 bytes, 357 AST nodes, zero parse failures. Three hash-locked complete source regions and seven paired scenario groups passed `verify:app-cli-environment`; the eight hosted-lifecycle pairs also passed with the new defaults.

The real prewarm fixture no longer supplies handcrafted CLI resolution or managed-environment builders. It supplies installation adapters, private fixture process settings and a shared gateway; the original functions construct the spawn baseline and the environment used for acquisition matching. The actual CLI completes a model conversation through ACP and its backend termination path releases the process. This verifies the restored environment in use, not only object snapshots.

Validation: root build succeeded; core 2,305/2,305; compiled environment/lifecycle tests 15/15; real prewarm/ACP integration passed under both Node and WorkBuddy Electron. Logs: `work/app-cli-env-build.log`, `work/app-cli-env-core.log`, `work/app-cli-env-verify.log`, `work/app-cli-hosted-verify.log`, `work/app-cli-env-built.log`, `work/app-cli-env-native.log`, `work/app-cli-env-electron.log`. Full backend dependency assembly and default Web ownership remain open; prior sandbox audit and MCP permission aggregate limitations remain recorded.

### Original AppServer backend factory and connector MCP configuration (2026-10-24)

Recovered `createWorkbuddyAppServerCodeBackend`, the POI gate and original connector-proxy MCP configuration declarations in `native-app-code-backend.ts`. Nineteen full regions are compared byte-for-byte against hash-locked `initialize.js` and `workbuddy-auth-product-coordinator.js`. REA evidence `ev_9ef6a0c7a9784c1cd87aea146389864b2e073ef5d5762110af8660d21d7a57a1` covers 7,238 bytes / 847 AST nodes / zero parse failures.

The factory wires dynamic platform/config accessors, CLI resolution/environment, telemetry, document environment with its bound receiver, connector tokens, project session environment/MCP, agent-team state, ownership-based authentication, audit store and prewarm pool into the supplied backend constructor. MCP configuration preserves bearer transport, builtin/deferred/bare-name handling, cloud memory, POI and project/netdrive gates, and Ardot's second-pass overrides. An empty merged feature object suppresses POI fallback. The original positive-finite port check accepts fractional values. Ardot can restore an earlier-filtered configuration entry; this is not proof of remote tool authorization.

Seven paired scenario groups pass source/recovered comparisons. The real prewarm fixture now uses this factory's dependency object and independently calls its CLI/environment accessors, instead of assembling dependencies or reusing the pool baseline directly. The callback constructing the acquisition owner is an explicit test boundary: complete CodeBuddy backend/session classes and a live connector-proxy service remain outstanding. Default Web process ownership remains separate integration work.

Validation for this increment: core 2,312/2,312 passed; root build succeeded after correcting a test-only array-index type assertion; compiled backend tests 7/7 passed; real prewarm/ACP/cleanup passed under Node and WorkBuddy Electron with independently reconstructed backend environment. Logs: `work/app-code-backend-build.log`, `work/app-code-backend-core.log`, `work/app-code-backend-verify.log`, `work/app-code-backend-built.log`, `work/app-code-backend-native.log`, `work/app-code-backend-electron.log`. The prior full-host sandbox audit failure and MCP permission TODO remain unresolved; these focused checks do not replace that aggregate result.

### Complete CodeBuddy backend, ACP client and helper closure (2026-10-24)

Recovered the full `CodeBuddyCodeBackend` and `CodeBuddyCodeSessionBackend` classes with their original `WorkbuddyACPClient` HTTP/SSE transport, CLI argument builder, prompt-file lifecycle/readiness checks, audit adapter, prompt/resource-link codec, default workspace resolution, log serializers and reporter state. `native-code-session-backend.ts` composes existing original sidecar/product/environment/gateway modules. It contains 204 complete hash-locked declarations: 143 desktop initialize, 58 coordinator and three log-acl reporter declarations. The original application bootstrap is not executed.

REA evidence `ev_3268878c6ce79ba2e7edf1f479c965c1a7b21f2c1a560eb7481cdb7653db480b`: 146,865 bytes / 19,709 AST nodes / zero parse failures. Source comparison covers every region, and dependency inspection reports no unresolved lexical identifiers. A follow-up member-reference check identified the locale decision helper; it was recovered before the final build and real integration run.

Eight paired groups cover duplicate-owner transport detach without premature process kill, runtime responsibility retained for orphan destruction, global soft reset, authentication guards, original permission/tool arguments, versioned prompt-variable restoration, SSE parsing, audit correlation/hashes and prompt/reporter state. Source behavior remains unchanged, including carriage returns retained in SSE data lines and the `{version: 1, variables: ...}` prompt-variable envelope.

The new `native-code-session-backend.test.mjs` instantiates the real backend through the original AppServer dependency factory, calls complete `initialize`, completes a model prompt through the original ACP transport, observes pool replenishment and destroys the backend with actual CLI process cleanup. No backend lifecycle methods or ACP readiness reports are replaced. The fixture still uses an owned model endpoint and installation/event boundaries; it does not prove live enterprise authentication or connector-proxy tool execution.

Validation: final root build succeeded; core 2,320/2,320 passed; source comparison 204 regions / eight paired groups; compiled backend tests 8/8; real full-backend integration passed under Node and WorkBuddy Electron; compiled locale binding checks 2/2 passed. Logs: `work/code-session-backend-build.log`, `work/code-session-backend-core.log`, `work/code-session-backend-verify.log`, `work/code-session-backend-built.log`, `work/code-session-backend-native.log`, `work/code-session-backend-electron.log`, `work/code-session-backend-locale.log`. Complete default Web ownership, cold-backend end-to-end integration, live connector service and broader recovery branches remain open. The prior aggregate sandbox audit failure and MCP permission TODO remain unresolved.

### Default Web sidecar ownership and full-backend cold start (2026-10-24)

The complete backend integration fixture now covers both prewarm and background cold-start paths using the actual original `SidecarManager`. Background mode keeps the pool idle, starts the original detached sidecar/CLI, runs `initialize` and `prompt` through the original ACP client, destroys the session and uses original AppServer stop for daemon cleanup. The first cold attempt exposed an incomplete fixture console (`log` was missing); the fixture was corrected without modifying recovered code.

Default live Web now uses `native-owned-runtime.mjs`, a host adapter around the recovered sidecar manager, entrypoint and ready-ACK protocol. It retains existing CLI arguments/configuration and persistent state, uses a unique private daemon control root per Web runtime, and shares the original gateway secret with ACP and REST requests. Parent and daemon temporary-directory namespaces are aligned even when the caller supplies a reduced environment. The direct-process adapter remains for focused raw-CLI fixtures.

Stronger shutdown checks found a real integration leak that browser-result assertions missed: `server.mjs` statically loaded the unused standalone SDK, whose tracing signal handler could force exit after the Web host's once-only listener disappeared. The Web host now loads the standalone harness lazily, keeps its own signal listeners until shutdown completes, and holds the event loop through ACP/sidecar teardown. No SDK or original manager source was changed. Close is coalesced, drains in-flight startup and waits for the owned daemon before removing private control files. An owned 1 ms startup-timeout probe verified rejection after drain and removal of private control directories.

New ownership verification checks authenticated REST/ACP, rejection without the gateway secret, history across two daemon/CLI lifetimes, retained state, coalesced close, both process IDs gone and control artifacts removed. Existing Web interaction tests now assert code-zero shutdown and disappearance of all observed descendants. Failed exploratory runs were explicitly reclaimed; their passing interaction results are not treated as cleanup evidence.

The final root build succeeded (`work/native-web-sidecar-build.log`). The complete host regression finished with 101 tests: 99 passes, one sandbox audit failure and one known MCP permission TODO (`work/native-web-sidecar-hosts.log`, 282 seconds). All default Web interaction/descendant-cleanup cases, owned-runtime persistence, and complete backend prewarm/cold-start cases passed. The sandbox still denied the real read but returned no audit records; the original MCP proxy still failed to consume a cached denial. Neither boundary was weakened or marked resolved. The latest core result remains 2,320/2,320 from the preceding backend recovery. WorkBuddy Electron also passed all three focused checks: complete prewarm backend, complete background cold backend, and owned Web runtime persistence/cleanup (`work/native-web-sidecar-electron.log`). Post-test process inspection found no remaining workspace native CLI or sidecar daemon; `git diff --check` passed. Default Web uses the recovered process manager but still has its browser ACP adapter and one CLI serving persisted sessions; it does not yet use the full desktop session-backend as its conversation controller. Live connector/background-service/account integration remains open.

### Full backend/controller chain and native input resolution (2026-10-24)

The real session-restart fixture now constructs the complete original CodeBuddy backend through the recovered AppServer backend factory and SidecarManager. Its former hand-written ACP backend has been removed. Lifecycle wrappers observe original methods without implementing their behavior. The existing queue restoration, prompt replacement, Write/TaskCreate/TaskList, task/plan/history, authenticated LOAD replay, reclamation and SQLite deletion assertions pass for both active-delete and reclaim-then-delete cases under Node and WorkBuddy Electron with the captured native SQLite driver. Evidence: `work/session-full-backend-chain.log`, `work/session-full-backend-chain-electron.log`.

Integration exposed two fixture assumptions: original desktop metadata enables title generation, so the local model now handles that request separately; original CLI environment assembly needs the product path under `ACC_PRODUCT_CONFIG_PATH`. REST replay also needs the origin of the original backend ACP endpoint. Prompt-file contents are checked directly. External account/connector providers, the host RPC registry and the model remain explicit owned boundaries.

An Acorn inventory of the fixed SessionManager found 278 class members and matched 173 by complete source ranges to existing session capsules before this increment. This is a source-coverage inventory, not behavioral parity. Its uncovered methods identified the next runtime gap: input response entrypoints (`work/session-manager-member-audit.json`).

Recovered ten full members in `native-session-input-resolution.ts`: permission accept/reject, semantic result normalization, question resolution, interruption resolution, sandbox response, question answer/cancel, elicitation response and synthetic skipped-question history. REA evidence `ev_ef6913e3aaf8bc0d04b45b285ac9bb0934054ae614c69dc66ebfb1dd5508ef3a` covers 6,438 bytes / 815 AST nodes / zero parse failures. Ten original-source comparisons and eight paired scenario groups pass (`work/session-input-resolution-verify.log`). These preserve permission arrivals during an awaited semantic response, partial acknowledgment, queued-vs-resolved differences, synthetic history ordering, the sandbox method's void return and backend failure propagation.

Core tests pass 2,328/2,328 and the final root build succeeds after correcting a test-only optional array access; compiled new tests pass 8/8. Logs: `work/session-input-resolution-core.log`, `work/session-input-resolution-build.log`, `work/session-input-resolution-built.log`. Real input integration passed all five Node cases: selected allow, selected deny, explicit reject, question answer and question skip (`work/session-input-resolution-native.log`). The final combined Electron run passed all seven input/lifecycle cases using the captured SQLite driver (`work/session-input-resolution-electron.log`). Both Write-denial paths return `cancelled` with one model request and no file; question answer/skip continue with the correct tool result. Original settlement removes pending maps, and skip emits synthetic owner history. Event/task-dispatch sinks are observed fixture boundaries. Post-test process inspection found no remaining workspace native CLI or daemon. Default Web still uses its browser ACP adapter; full SessionManager initialization, cancellation/queue entrypoints, POI and plugin recommendation continuations remain open. The preceding full host aggregate remains 101 tests with 99 passes, one sandbox audit failure and one known MCP permission TODO; focused checks do not replace that aggregate.

### Original cancellation, queue and extension entrypoints (2026-10-24)

Recovered 24 full SessionManager methods and two task-state helpers in `native-session-operations.ts`. This covers user/recommendation cancellation, detached stale-tool finalization, queue read/save/mutations, command and subagent lookup, yield, sampling/roots replies, extension broadcast/direct calls and target selection. All 26 original regions pass captured-source comparison and ten paired scenario groups (`work/session-operations-verify.log`). REA evidence `ev_b97457825c259eb1515655b233766c0452ebbeb6b6d7932b6baeea323ed57994`: 7,912 bytes / 1,128 AST nodes / zero parse failures.

The preserved cancellation path distinguishes active processing from detached planning/working state and active team members. Deferred team completion has its own signal/finalization/effect/stop ordering. Recommendation cancellation failure clears its switch/stop flags; user failure preserves its intent. Queue reads/saves do not restore absent sessions; mutations use readiness. Broadcast contains asynchronous failures while retaining the original synchronous-throw behavior.

Root build succeeded, core tests pass 2,338/2,338, compiled new scenarios pass 10/10 (`work/session-operations-build.log`, `work/session-operations-core.log`, `work/session-operations-built.log`). Real integration now routes queue edits and restart persistence through original controller methods and adds two cancellation paths to the complete-backend input fixture; all nine combined Node cases pass (`work/session-operations-native.log`). A subsequent focused run additionally proves both unsupported queue calls return `-32601` and the two full lifecycle cases still pass (`work/session-operations-queue-boundary.log`). The final combined Electron run passes all nine cases with the captured SQLite driver (`work/session-operations-electron.log`).

Static source inspection found no fixed CLI dispatch for `session/get_queue_state` and `session/cancel_queue`, despite their desktop backend methods. This is a protocol-support boundary, not permission to synthesize success. Default Web remains on the browser ACP adapter. Complete initializer/record APIs and POI/plugin-continuation services remain open, along with the previously recorded sandbox audit and MCP permission issues.

The next complete-class target is now bounded by a lexical closure audit: 152 top-level original declarations / 269,024 source characters, with Node built-ins and twelve coordinator member references (`work/session-manager-closed.json`, `work/session-manager-coordinator-members.json`). This is extraction groundwork only; no complete SessionManager factory or default-host replacement is claimed from that inventory.

### Complete SessionManager class and full controller integration (2026-10-24)

Recovered `createNativeSessionManager()` with the entire original SessionManager declaration (278 class members), its lexical closure and original coordinator policy/configuration helpers: 147 complete declarations from `initialize.js` plus 30 from `workbuddy-auth-product-coordinator.js`. Node built-ins are explicit host bindings; importing does not execute captured bootstrap. The full class preserves initialization, record mutations, lifecycle maps/fences, task/history state, input/queue/cancel methods, POI and recommendation continuation entrypoints. External registries/services are still caller dependencies.

REA evidence `ev_f73582fc99188245b6d12d6b21f160d17d03a9efea836386e0e52fc418367162` covers two files, 281,467 bytes / 36,679 AST nodes / zero parse failures. The verifier hash-checks both fixed sources, compares all 177 original regions and independently constructs the captured factory directly from source declarations. Eight paired scenario groups validate instance/policy isolation, original initialization and composer/connector sink wiring, record mutations, project tagging, addon manifest composition, owner visibility, missing initialization and operation contracts (`work/session-manager-verify.log`).

The lifecycle fixture now directly constructs the complete class and calls its original `initialize` and `setEventSink`. All per-method capsule attachments and fake record/task hooks were removed. The original runtime-config path builds addon manifests; original record effects emit upserts; the actual coordinator policy registry is verified through deletion. Queue editing/restart restoration, actual Write/TaskCreate/TaskList, tool results/plans, authenticated history replay, inactive reclamation and SQLite deletion continue to pass with the full backend and actual daemon.

The input fixture also now uses the complete class, original backend callback wiring and prompt pipeline. It no longer manually inserts pending input or replaces task dispatch. All seven cases (allow, selected deny, explicit reject, answer, skip, user cancel, recommendation switch cancel) verify actual model/file behavior. Original finalization clears pending maps, stops the watchdog, resets processing/intent flags and retains explicit cancellation causes. The fixed state machine records these successfully finalized turns as `completed`, including cancellation; this original semantic is preserved rather than reinterpreted as a different status.

Validation: root build succeeded; core 2,346/2,346; compiled new scenarios 8/8; full Node input/lifecycle 9/9; WorkBuddy Electron with the captured native SQLite driver 9/9. Logs: `work/session-manager-build.log`, `work/session-manager-core.log`, `work/session-manager-built.log`, `work/session-manager-native.log`, `work/session-manager-electron.log`. `git diff --check` and fixture syntax checks pass. No new full-host aggregate result is claimed: the last aggregate remains 101 tests, 99 passes, one sandbox audit failure and one known MCP permission TODO.

Full source recovery does not prove all POI/plugin continuation, live account/connector, concurrency or platform branches. The default browser host still uses its ACP adapter over the recovered sidecar owner. The next integration step is adopting the complete manager/backend composition in the default host while preserving persistent session and user-interaction behavior; broader app services and the original sandbox/MCP issues remain open.


### Default Web adopts the complete native controller (2026-10-24)

`apps/web/native-runtime.mjs` now composes the recovered complete SessionManager and CodeBuddyCodeBackend over the actual SidecarManager. The original initializer, prompt pipeline, permission/question resolution, cancellation and session/backend destruction execute in the default browser path. The browser bridges session-scoped events and user decisions; it does not introduce a second model/tool loop. Product JSON tools and prompts are preserved by an explicit Web config resolver. User CLI settings/plugins remain launch-boundary inputs.

The owned runtime provisions the original authenticated hosted CLI for history reads, and each conversation provisions its own native backend CLI. CLI persistent storage remains independent of temporary daemon control state. History list queries include the canonical workspace path: the original CLI stores `/private/var/...` on macOS, whereas a `/var/...` query selects a different compressed project key. The initial failing restart test exposed this mismatch; resolving the host workspace real path fixes actual persistence lookup without browser caching or source patches. The captured HTTP controller confirms that list reads `cwd`; history remains the original CLI endpoint.

Shutdown cancels active work, waits for browser decisions, destroys controller sessions and closes the owned daemon. Startup composition errors close the owned runtime. Gateway credentials and diagnostic handles remain server-only. Optional Desktop account/connector/SQLite services are not replaced by fixture implementations; full Desktop service composition and browser prewarm adoption remain open.

Validation: type/syntax checks pass. The full host aggregate completed in 333 seconds with 108 tests: 107 passed, zero failed, one known MCP permission TODO. All six default Web modes, restart/history/continuation, sandbox Web escalation, original backend and full controller lifecycle tests passed (`work/default-web-session-manager-hosts.log`). The earlier sandbox audit failure did not reproduce; its intermittent status remains unresolved. The unchanged core's most recent result remains 2,346/2,346 from the complete-class increment.

Final root build passed (`work/default-web-session-manager-build.log`). After that build, an expanded Web allow fixture also passed: it resumes persisted history, then opens a second conversation in the same Web process and asserts a distinct session ID and absence of the first conversation's assistant history in the second model request. Both conversation CLI processes and the hosted CLI/daemon are checked by the existing descendant shutdown assertions (`work/default-web-session-manager-isolation.log`).


### Native Web proxy environment restored (2026-10-24)

Inspection found that Web composition supplied empty `resolveProxyEnv` callbacks to the recovered SidecarManager and CodeBuddyCodeBackend. The original defaults read uppercase/lowercase proxy variables, merge loopback exclusions through `mergeNoProxy` and set the original system-CA Node option. The host now uses those defaults and normalizes its forwarded CLI environment using the recovered `getProxyEnvFromProcess`, preventing the host's raw environment from overwriting the normalized hosted-CLI bypass list. Direct owned-runtime startup uses that same environment. No recovered source declaration or SDK implementation changed.

REA evidence `ev_21b01797d3d54b2d1e1d761c610e96050f33d0459a413ad62dcfdcb983c77730` examines the fixed `cli-prewarm-pool.js` and `proxy-env.js`: two parsed files, 114,103 bytes, 13,055 AST nodes and zero parse failures. Their SHA-256 values remain `ecb7ff634b205288b5ea236519f01292a0a2d02802e1bded03d382532ec3f296` and `bba33b83ef89d9960485bfc5ab300e4782a2cc66c9fe45cb75c892cf95bf799b`. Raw evidence is in `work/web-proxy-rea.json`.

The new real-process fixture tests uppercase and lowercase proxy environments against an owned local HTTP proxy and model. Requests to `axon-owned-model.invalid` reach the local model only through the proxy; an actual Bash tool returns the inherited bypass list, and the following model request verifies user exclusions plus all three loopback entries. Hosted REST history also succeeds. A temporary regression replay of the previous host code fails specifically because the tool receives only `owned.example` (`work/native-web-proxy-before-fix.log`); the current code passes (`work/native-web-proxy.log`). The proxy fixture uses connection-close responses to isolate HTTP requests rather than claim keep-alive proxy coverage. TLS/system-proxy/enterprise-CA integration remains unverified.

Final focused validation: 9/9 real Web proxy, ownership and interaction tests passed, including persistent restart/continuation and separate conversation history; type and syntax checks passed (`work/native-web-proxy-regression.log`, `work/native-web-proxy-check.log`). This host-only increment does not change the compiled harness; the preceding successful root build and 108-test full aggregate remain the latest full-build/full-suite evidence.

A separate browser integration gap was identified during this inspection: the complete backend advertises form elicitation and publishes `elicitationRequest`, while the browser adapter currently handles permission/question events only. The recovered `respondElicitation` controller/ACP path exists, but browser form/URL interaction and its lifecycle still need implementation and real protocol validation. This is pending work, not a claim of complete browser interaction parity.


### Native Web elicitation bridge (2026-10-24)

Default Web now handles original `elicitationRequest` events through an explicit browser callback and the complete SessionManager/CodeBackend/ACP response chain. The new local decision API validates form schemas and standard formats, preserves pending requests after invalid submissions, rejects stale IDs and distinguishes accept/decline/cancel. Browser controls cover primitive/enum fields, JSON structured values and explicit HTTP(S) URL confirmation. Cancel/decline bypass form parsing. Original SDK, source declarations and prompt/configuration artifacts remain unchanged.

REA evidence `ev_2cf45f7d27b377c29703afa8e9d02c3ad1394437d945731e43ee66304a7ef21f` records 136,574 bytes / 17,937 AST nodes / zero parse failures across the previously verified backend and input-resolution source capsules (`work/web-elicitation-rea.json`). Real original controller/backend/client transport is tested against an owned ACP peer through actual browser HTTP/SSE endpoints, not a fabricated SessionManager. Five response/cancellation cases pass, including schema and email-format rejection without settlement, exact RPC correlation and expired browser IDs. Combined protocol/real-CLI/standalone Web regression: 22/22 (`work/web-elicitation-regression.log`); final five protocol cases and type/syntax checks pass (`work/web-elicitation-protocol.log`, `work/web-elicitation-check.log`).

The browser preview could not be opened: both in-app and Chrome automation returned `ERR_BLOCKED_BY_CLIENT` for the owned loopback page. Visual QA is therefore not claimed. Live connector/payment behavior, specialized payment cards and intermediate elicitation-complete rendering remain open. See [the interaction contract](native-web-elicitation.md).

Final root build passed and staged all original assets; the five protocol cases also passed against the rebuilt harness (`work/web-elicitation-build.log`, `work/web-elicitation-built.log`). The full goal remains incomplete, including the explicitly recorded visual and live-service boundaries.


### Default Web adopts original CLI prewarming (2026-10-24)

The owned Web runtime now starts the recovered CliPrewarmPool through original HostedCliLifecycle initialization, before hosted history-CLI readiness. Capacity uses the original environment parser and persisted app-config accessor. Both pool and session backend use the shared original managed environment; the host supplies its product-managed CLI path and resource boundary without fake account/connector services. The manager and code backend receive the actual pool.

Original health checking, environment comparison, activation ACK, replenishment and cold fallback remain intact. The browser adapter forwards user CLI arguments to warm lease activation as well as cold manager creation. Shutdown destroys sessions and stops the original pool in addition to daemon cleanup. Focused real-process checks initially passed warm ownership, changed-environment fallback and explicit zero capacity, including model override propagation and exit of observed hosted/pool/daemon PIDs (`work/web-prewarm-owned.log`). An extended aggregate adds replenishment, second warm-session history isolation and persisted zero-capacity config.

REA evidence `ev_3c7e3615dc0e4f191835d8dc4c84e94007e0d376254e9426eee045d47faf3a9b` covers the previously verified original pool and hosted-lifecycle source regions: two files, 34,324 bytes, 4,101 AST nodes and zero parse failures (`work/web-prewarm-rea.json`). No captured declaration body or SDK/config/prompt asset changed. Desktop account/product-snapshot subscriptions and broader background services remain open.

Full host aggregate completed in 356 seconds: 119 tests, 118 passed, zero failed and one known MCP permission TODO (`work/web-prewarm-hosts.log`). All four new real Web prewarm cases passed, including replenishment and second-session isolation. Existing real Web input, proxy, sandbox escalation and process-cleanup cases passed. The previously intermittent sandbox audit issue did not reproduce and remains recorded. Type/syntax checks passed (`work/web-prewarm-check.log`). The owner-selected Node/Electron executable is also supplied to the original pool initializer so hosted and pooled processes use the same runtime selection.

Final root build passed (`work/web-prewarm-build.log`). Post-build real prewarm cases passed 4/4 under Node and 4/4 under WorkBuddy Electron, including warm replenishment/isolation, changed-environment fallback and both zero-capacity sources (`work/web-prewarm-built.log`, `work/web-prewarm-electron.log`). Their PID checks cover owned hosted/daemon/pool processes after shutdown.


### Complete Desktop authentication/product coordinator (2026-10-24)

Recovered `createNativeAuthProductCoordinator()` with the entire 37-member WorkbuddyAuthProductCoordinator class and its required original snapshot, overlay, product composition, development-override and common-enum dependencies. The module preserves 87 source regions across four fixed Desktop files, including original initialization statements. Explicit Node/process/OS/asset/DI bindings replace only outer application assembly; captured bootstrap and account/network services are not invoked on import.

REA evidence `ev_1f818b65b954cd707a9e06bd63ea77a393093d804a832471b48c6c0a0151fe77`: four parsed files, 100,158 bytes, 6,606 AST nodes and zero parse failures (`work/auth-product-rea.json`). Independent source loading verifies all fixed hashes/regions and passes eight paired scenarios (`work/auth-product-verify.log`). Scenarios preserve signed URL rotation filtering, diagnostic redaction, original listener failures, base authentication/source attributes, remote model replacement, Linux large-env spill, remote TTL/identity/failure handling, native agent merging, original initializer/logout and development endpoint guards.

This adds a complete upstream coordinator; it does not claim live account/cloud/experiment providers or automatic default Web refresh are assembled. See [coordinator boundaries](native-auth-product-coordinator.md).


The actual hosted-CLI rotation fixture now uses this complete coordinator in place of a simulated snapshot callback. Both Node and WorkBuddy Electron pass: publication rotates the host endpoint/PID, the old process exits, the new CLI sends the updated instructions to the owned model, and identical publication does not rotate again (`work/auth-product-node-isolated.log`, `work/auth-product-electron-isolated.log`). Initial Electron verification exposed inherited installation resources in the fixture; binding its `process.resourcesPath` to the owned temporary root fixes isolation while preserving original resolver precedence. No original method was changed.

Root build passed (`work/auth-product-build.log`); the core suite passed 2,354/2,354 (`work/auth-product-core.log`), compiled coordinator tests passed 8/8, and final source/paired checks passed 8/8 with all 87 regions matching (`work/auth-product-compiled.log`, `work/auth-product-source-final.log`, `work/auth-product-verify-final.log`). The latest full host aggregate remains the preceding 119-test prewarm run; this increment reran the changed real-host fixture on both runtimes, not the entire host aggregate.


### Complete Desktop product experiment manager (2026-10-24)

Recovered `createNativeProductExperimentManager()` with all 23 original class members and six verbatim declaration regions from the fixed Desktop coordinator bundle. Timer and outer DI boundaries are explicit; request, queue, generation/session identity, overlay and polling logic remain original. REA evidence `ev_2ceb0ac3aea8ab0a9cdd6d10aa3d6be574289b2ad20fa1c001309e889a390dbb` reports one parsed file, 6,654 bytes, 958 AST nodes and no parse failures.

Seven paired scenarios pass against independently loaded captured source and the recovered factory (`work/product-experiment-verify.log`). The loopback HTTP scenario composes the real experiment manager with the complete snapshot coordinator: the response changes published model/features, and clearing restores base values. REST/auth/product boundaries remain explicit fixtures; live authenticated experiment access and default Web subscription assembly are not claimed. See [native product experiments](native-product-experiments.md).

Root build passed (`work/product-experiment-build.log`). The complete core suite passed 2,361/2,361 (`work/product-experiment-core.log`), and all seven compiled scenarios passed under both Node and WorkBuddy Electron (`work/product-experiment-compiled.log`, `work/product-experiment-electron.log`). Default Web assembly is unchanged. The next upstream dependency is the Desktop-specific WorkbuddyProductManager and its original base class/provider composition; the existing CLI product manager alone does not establish that Desktop graph.


### Complete Desktop product manager and original base (2026-10-24)

Recovered `createNativeDesktopProductManager()` with the entire 18-member Desktop subclass and 26-member original base, including static initialization blocks, plus original object/boolean/gzip utilities and shared-auth environment helpers. Sixteen verbatim source regions across three fixed Desktop files are independently compared. Node/framework boundaries and the already recovered coordinator helpers are explicit; no captured bootstrap or fake production provider graph is introduced.

REA evidence `ev_30047fb2b3734865b9183551ca867284831e516edb8f54cd3fb5c03b51dc1600`: three files, 30,045 bytes, 3,775 AST nodes, zero parse failures. Six paired scenarios passed (`work/desktop-product-verify.log`). They cover original stable-cache separation, provider exclusion, layer ordering, model/feature filters, actual owned authentication file/logout marker, and the complete product/experiment/coordinator subscription chain. In that composition the experiment changes the published model limit, and clearing restores the base value. See [Desktop product manager boundaries](native-desktop-product-manager.md).

Root build passed (`work/desktop-product-build.log`), followed by 2,367/2,367 core tests (`work/desktop-product-core.log`). All six compiled scenarios passed under both Node and WorkBuddy Electron (`work/desktop-product-compiled.log`, `work/desktop-product-electron.log`). Default Web startup remains unchanged. The original Desktop cloud/auth/provider assembly is still required to replace the external fixtures in this verified three-manager composition.


### Complete Desktop cloud configuration manager (2026-10-24)

Recovered `createNativeDesktopCloudProduct()` with the complete 12-member original cloud manager and five original constants: six verbatim regions from fixed Desktop common.js. REA evidence `ev_be588a6429a5e0c03ae7a9df14be202cc92020e0c5899b96d05ff86552df7776` covers one file, 7,771 bytes, 1,040 AST nodes and zero parse failures. Five independently loaded captured/recovered scenario pairs passed (`work/desktop-cloud-verify.log`).

A real owned HTTP server now feeds the complete cloud/product/experiment/coordinator composition. Remote models reach the published snapshot, protected remote auth/endpoint fields are omitted, and logout restores local models. Tests also preserve the original URL-independent per-user cache, forced-coordinator-refresh cache hit, stale fallback, disk LRU, retry backoff/deduplication and reset-with-pending-retry behavior. Reset does not cancel existing retries; no stronger lifecycle guarantee is claimed. The original authenticated REST/account/provider assembly remains separate from the owned transport and fixture subject used here. See [Desktop cloud boundaries](native-desktop-cloud-product.md).

Root build passed (`work/desktop-cloud-build.log`), followed by 2,372/2,372 core tests (`work/desktop-cloud-core.log`). All five compiled scenarios passed under Node and WorkBuddy Electron (`work/desktop-cloud-compiled.log`, `work/desktop-cloud-electron.log`). Default Web startup remains unchanged. The next verified source boundary is Desktop AuthenticationHttpInterceptor and ProductEndpointHttpInterceptor, which govern request headers, endpoint selection and guarded 401 logout before the owned HTTP adapter can be replaced by the original REST assembly.


### Desktop authentication and product endpoint HTTP interceptors (2026-10-24)

Recovered both complete original Desktop interceptor classes, endpoint override helpers and required constants/initializers in `createNativeDesktopProductInterceptors()`. Twenty regions from fixed common.js are preserved verbatim. REA evidence `ev_530dae4162e30ad060a061202e730a43de2be902d4be6aaf9fed09793600197c` covers one file, 7,874 bytes, 953 AST nodes and no parse failures. Six paired scenarios passed against independently loaded captured code (`work/desktop-interceptors-verify.log`).

Real HTTP tests verify emitted auth/product/user headers and original business/HTTP 401 handling. Additional checks cover caller headers, skip flags, route-specific configuration waiting, early/late override state, stale tokens, endpoint/override guards and exact/regex logout exclusions. Original prefix-based endpoint comparison is retained explicitly; it is not claimed as strict URL-origin validation. Tests still supply the REST registry/executor, so native CellJS/Axios composition and default Web service assembly remain open. See [Desktop HTTP boundaries](native-desktop-product-interceptors.md).

Root build passed (`work/desktop-interceptors-build.log`), followed by 2,378/2,378 core tests (`work/desktop-interceptors-core.log`). All six compiled scenarios passed under Node and WorkBuddy Electron (`work/desktop-interceptors-compiled.log`, `work/desktop-interceptors-electron.log`). Original DefaultRestOperationsFactory and its bundled Axios dependency have been located in Desktop common.js for the next REST assembly increment. Default Web startup remains unchanged.


### Original Desktop REST factory and complete captured Axios closure (2026-10-24)

Recovered `createNativeDesktopRest()` with the original CellJS DefaultRestOperationsFactory, captured Axios 0.26.1 and its complete reachable 40-module dependency closure plus original CommonJS loader. Forty-two verbatim regions from fixed common.js/chunk.js are independently compared. REA evidence `ev_732274c21e5f7f144d8ab959dd490af7cd5014bb672a292bb5f6b1bc79dd9ca8`: two files, 92,168 bytes, 12,575 AST nodes and zero parse failures.

Five REST scenario pairs pass (`work/desktop-rest-verify.log`), covering original configuration isolation, JSON/query transforms, interceptor ordering, real redirects/gzip, timeout/cancellation/errors and both Desktop HTTP policies through real Axios. The cloud/product/experiment/coordinator composition now uses this original client and authentication/endpoint interceptors instead of the owned HTTP adapter; its five paired cloud scenarios also pass (`work/desktop-rest-cloud-verify.log`). Fixture account/provider/storage boundaries and default Web service assembly remain open. See [Desktop REST fidelity](native-desktop-rest.md).

Root build passed (`work/desktop-rest-build.log`), followed by 2,383/2,383 core tests (`work/desktop-rest-core.log`). The combined REST/cloud compiled scenarios passed 10/10 under Node and 10/10 under WorkBuddy Electron (`work/desktop-rest-compiled.log`, `work/desktop-rest-electron.log`). The captured dependency closure uses only the recovered CommonJS loader and Node built-ins; no replacement Axios dependency was installed. Default Web startup remains unchanged pending account/provider/lifecycle assembly.


### Complete original Desktop product merger and strategies (2026-10-24)

Recovered DefaultProductMerger and all five original Desktop strategies with their constants: ten verbatim source regions. REA evidence `ev_87646a0678f991769240c4463a2894955371d5626780fdec9e2708fcd2179a75` covers one file, 9,230 bytes, 1,360 AST nodes and zero parse failures. Five source-paired scenarios pass (`work/desktop-merger-verify.log`), including partial Galileo route disabling, strategy selection/removal, identity/override handling, cycle behavior and command merging.

The Desktop product fixture no longer selects a strategy through a custom map: it uses the original DefaultProductMerger with all five captured strategy classes. Six product and five cloud scenario pairs still pass with that composition (`work/desktop-merger-product-verify.log`, `work/desktop-merger-cloud-verify.log`). This closes a simplified merger boundary without claiming live account/provider assembly or changing default Web startup. See [Desktop merge semantics](native-desktop-product-merger.md).

Root build passed (`work/desktop-merger-build.log`), followed by 2,388/2,388 core tests (`work/desktop-merger-core.log`). The combined merger/product/cloud compiled scenarios passed 16/16 under Node and 16/16 under WorkBuddy Electron (`work/desktop-merger-compiled.log`, `work/desktop-merger-electron.log`). Account/provider/lifecycle assembly remains open; default Web startup is unchanged.


### Complete original Desktop authentication manager (2026-10-24)

Recovered `createNativeDesktopAuthentication()` with all 27 original manager members, original SubscriptionManager, auth error classes and required constants/helpers. Twenty fixed Desktop common.js regions are compared verbatim; previously recovered original framework primitives and RxJS remain explicit bindings. REA evidence `ev_ca30c4b6a07ca27ec7ded4186a77c57825f32974413a4f6cb4cfb83e6124a3cc`: one file, 37,080 bytes, 4,408 AST nodes and zero parse failures.

Six independent captured/recovered scenario pairs pass (`work/desktop-auth-verify.log`), covering restore/header/environment behavior, newer-login precedence, logout invalidation of pending login/refresh, storage invalidation, timer/subscription disposal and persistence queue recovery. A real HTTP 401 now runs through the original REST client and auth interceptor into the complete manager's logout method, verifying provider session removal, storage cleanup and session clearing. Account/provider/storage/environment services remain fixtures, and parent draining/default Web assembly remain open. See [Desktop authentication boundaries](native-desktop-authentication.md).

Root build passed (`work/desktop-auth-build.log`), followed by 2,394/2,394 core tests (`work/desktop-auth-core.log`). All six compiled authentication scenarios passed under Node and WorkBuddy Electron (`work/desktop-auth-compiled.log`, `work/desktop-auth-electron.log`). The next persistent-state dependency is the fixed Desktop file-authentication-storage.js implementation, including logout markers and watcher behavior; storage fixtures/default Web assembly remain open.


### Complete Desktop file authentication storage (2026-10-24)

Recovered `createNativeDesktopFileAuthentication()` with all 50 original storage class members, runtime configuration/migration setters, logout-marker helper and priority enum. Eight source regions across fixed file-authentication-storage.js/common.js are preserved verbatim. REA evidence `ev_7ff5838aaa1dfef9234f97aadb233e4220d169ae9a42308015c1e2f509dc2111`: two files, 17,923 bytes, 2,652 AST nodes and zero parse failures.

Six captured/recovered scenario pairs pass (`work/desktop-file-auth-verify.log`). Real filesystem checks cover atomic store/restore, superseded logout tokens, preserved markers during refresh, backup cleanup, legacy-domain guards and directory watching of atomic replacement/marker changes. Unmarked unlink retains the session as in the original. Controlled watcher errors verify retry/backoff/stable reset and disposal. The complete authentication manager now restores, logs in and logs out through the original file storage in an owned directory; provider/environment and parent lifecycle boundaries remain open. See [file authentication behavior](native-desktop-file-authentication.md).

Root build passed (`work/desktop-file-auth-build.log`), followed by 2,400/2,400 core tests (`work/desktop-file-auth-core.log`). All six compiled storage scenarios passed under Node and WorkBuddy Electron (`work/desktop-file-auth-compiled.log`, `work/desktop-file-auth-electron.log`), including real directory watching and manager/storage integration. Authentication provider registration and parent lifecycle/default Web composition remain open.


### Complete Desktop custom-token provider and storage (2026-10-24)

Recovered `createNativeDesktopCustomToken()` with both complete original custom-token classes, constants and the captured jsonwebtoken dependency graph. All 82 regions across common.js/chunk.js remain verbatim. REA evidence `ev_29be90fc101b022bb53491cac8563d1f51b70fef94ee0208a959f2d27ccf3e1b`: two files, 143,017 bytes, 18,881 AST nodes and zero parse failures.

Five captured/recovered scenario pairs pass (`work/desktop-custom-token-verify.log`). Tests cover V3/V2 precedence and V1 exclusion, forced product rechecking, real spilled-file reads, decoded JWT metadata/opaque-token fallback, fixed expiry and original provider/no-op persistence behavior. Complete original manager composition now selects the original custom-token storage over original file storage, restores headers, logs out and logs in through the original provider. File sessions remain intact during custom-token logout, as dictated by the original storage selection and no-op cleanup. See [custom-token fidelity](native-desktop-custom-token.md).

Root build passed (`work/desktop-custom-token-build.log`). All five compiled scenarios passed under Node and WorkBuddy Electron (`work/desktop-custom-token-compiled.log`, `work/desktop-custom-token-electron.log`). External/browser authentication providers, production registration, product environment services and parent lifecycle/default Web composition remain open. No live account or token-signature verification is claimed.

The full core regression passed 2,405/2,405 (`work/desktop-custom-token-core.log`); the README now reports this verified count. The next provider dependency is the original Desktop ExternalLinkAuthenticationProvider and its versioned login-step callbacks, polling and account-fetch error handling.


### Complete Desktop external-link authentication provider (2026-10-24)

Recovered the complete original ExternalLinkAuthenticationProvider, versioned callback helpers, account normalization/snapshot/merge helpers, error classes and constants in 33 verbatim common.js regions. REA evidence `ev_f753d877405e184ebe0e7adf289f69b170019acb052a87337007efcd895d2fa8` covers one file, 24,910 bytes, 3,443 AST nodes and zero parse failures. Original framework primitives and the URI library remain explicit dependencies; shared manager error identities are explicitly bound at composition.

Six source-paired scenarios pass (`work/desktop-external-link-verify.log`), covering complete login despite browser-open failure, versioned callbacks and the unversioned outer timeout callback, token/account polling and authorization retry limits, cancellation/deadline, license/refresh/IP errors, and account enrichment/switching. The complete manager now logs in through the original browser provider, REST client and HTTP interceptors, persists the session through original file storage, and logs out with a real logout marker. The remote account service, browser opening and product/environment dependencies remain owned test boundaries. See [external-link authentication fidelity](native-desktop-external-link.md).

Root build passed (`work/desktop-external-link-build.log`). All six compiled scenarios passed under Node and WorkBuddy Electron (`work/desktop-external-link-compiled.log`, `work/desktop-external-link-electron.log`). The original outer timeout does not cancel/drain the losing login promise, and provider subscriptions have no newly invented disposal contract. Parent lifecycle/default Web assembly and live login remain open. The next concrete dependency is the original ProductEnvServiceImpl, whose domain selection currently remains a fixture in the assembled login scenario.

Full core regression passed 2,411/2,411 (`work/desktop-external-link-core.log`); README reports the verified count. No new full host-suite run is claimed.


### Complete Desktop product environment service (2026-10-24)

Recovered ProductEnvServiceImpl with all six original methods and the environment enum/key/DI token in four verbatim common.js regions. REA evidence `ev_36f9d9c0d45908b526b1366ee32d6e90daed3329a8692d439a72a30ab17244f4` covers one file, 2,547 bytes, 354 AST nodes and zero parse failures.

Five source-paired scenarios pass (`work/desktop-env-verify.log`), including domain priority/arrays, original wildcard and regex behavior, explicit/product/session precedence, failure mutation semantics and full original Desktop product synchronization. Browser login now uses the original environment service for both provider and manager; its six paired scenarios still pass (`work/desktop-env-external-verify.log`). A returned token domain is mapped through actual product attributes after login, rather than retaining an assumed requested environment. See [environment fidelity](native-desktop-product-environment.md).

Root build passed (`work/desktop-env-build.log`). The combined environment/login compiled scenarios passed 11/11 under Node and WorkBuddy Electron (`work/desktop-env-compiled.log`, `work/desktop-env-electron.log`). Product sources remain fixtures in these compositions, and production registration/parent lifecycle/default Web assembly remain open. The next original source dependency is module-base.js's WorkbuddyInternetEnviromentProductProvider and WorkbuddyDevEnvEndpointProductProvider.

Full core regression passed 2,416/2,416 (`work/desktop-env-core.log`); README now reports this verified count.


### Original Desktop environment configuration providers (2026-10-24)

Recovered WorkbuddyInternetEnviromentProductProvider, WorkbuddyDevEnvEndpointProductProvider, their resolver setter and provider-priority enum in five verbatim regions across common.js/module-base.js. REA evidence `ev_bc58a66d55c3ef0ed43fe4f6b75d106ccac8fe68006b587595f3ae3b30007fda` covers two files, 3,336 bytes, 476 AST nodes and zero parse failures.

Five captured/recovered scenarios pass (`work/desktop-env-providers-verify.log`), covering environment precedence, real product JSON reads, authentication stripping, shared lowercase caching, path/error behavior and dynamic resolver identity. A real original REST/interceptor request uses the developer endpoint while the product endpoint is still stale. The environment-service scenarios also pass with the original environment provider replacing the environment-sensitive fixture (`work/desktop-env-providers-env-verify.log`); the full original product manager reads owned internal/external files and publishes endpoints without replacing base authentication. See [environment provider behavior](native-desktop-environment-providers.md).

Root build passed (`work/desktop-env-providers-build.log`). Combined provider/environment/login compiled scenarios pass 16/16 under Node and WorkBuddy Electron (`work/desktop-env-providers-compiled.log`, `work/desktop-env-providers-electron.log`). Base product configuration is still a fixture in the composition; the next original dependency is module-base.js ClientProductProvider with common.js builtin-model stripping helpers. Production registration/parent lifecycle/default Web assembly remain open.

Full core regression passed 2,421/2,421 (`work/desktop-env-providers-core.log`). README reports this verified count and groups authentication documentation into core, login and environment rows.


### Original Desktop base product configuration provider (2026-10-24)

Recovered ClientProductProvider, builtin-model switch helpers, BooleanUtils and provider priorities in six verbatim common.js/module-base.js regions. REA evidence `ev_9afbaaf9e9d912c2fb14c6fdb9f59fe47d8182cb223855437a1bcc7ff100f770` covers two files, 4,591 bytes, 451 AST nodes and zero parse failures.

Five source-paired scenarios pass (`work/desktop-client-product-verify.log`), covering real base-file loading, shared cache identity, parent-directory fallback, malformed retry/optional filesystem, original switch parsing and first-load-only filtering. The fixed repository product JSON is compared in full: all 19 agents and 44 models survive normal loading, and all agent/authentication configuration survives model disabling. No prompt or agent model reference is rewritten. See [base product fidelity](native-desktop-client-product.md).

The five environment-service pairs still pass (`work/desktop-client-product-env-verify.log`) with original base and environment file providers replacing both configuration-source fixtures. The full product manager/merger now selects internal/external endpoints from owned JSON files while preserving base authentication. Provider ordering remains an explicit host binding. Merging this product composition with the complete login/cloud/coordinator lifecycle and default Web registration remains open.

Root build passed (`work/desktop-client-product-build.log`) after correcting a test-only TypeScript narrowing error. Combined base-provider/environment-provider/environment-service compiled scenarios passed 15/15 under Node and WorkBuddy Electron (`work/desktop-client-product-compiled.log`, `work/desktop-client-product-electron.log`). Recovered source bodies were unchanged by the test correction.

Full core regression passed 2,426/2,426 (`work/desktop-client-product-core.log`); README reports the verified count.


### Account/product/cloud composition with original storage and authentication (2026-10-24)

The cloud composition now uses the complete original authentication manager, file storage, custom-token provider, base product provider and shared environment service. The former manually controlled authentication subject and local product-provider fixture were removed. It restores a persisted account, publishes cloud models, logs out with a real file marker, restores local models, logs back in and persists again, then handles HTTP 401 through the original REST/auth interceptor into actual manager logout and coordinator rollback.

Assembly exposed a missing original registration: authentication storage must bind to the base-product authentication getter. The fixed module.app-server.js registers that setter explicitly. The already captured helper is now exposed by the product factory and bound to file storage; all original method bodies remain unchanged. Source comparison still passes for all six product scenarios, and all five cloud scenario pairs pass (`work/desktop-account-product-product-verify.log`, `work/desktop-account-product-cloud-verify.log`). Authentication file identity is asserted stable across a remote overlay.

REA evidence `ev_bff2f0a5b85f2d367cbaee3de822f5db876ae098f6f158da85f2d5e960b1bd1d` covers only the 159-byte original registration statement, 10 AST nodes and zero parse failures; it is not complete-bootstrap evidence. The fixed source file SHA-256 is `965b5e0124e633fc71dd2a7adc2d777ce1b621631fd30994a03a544e3e23c37d`. See [account/product composition](native-desktop-account-product-assembly.md).

Startup inspection identifies remaining application rebindings: WorkbuddyAuthenticationManager's session synchronizer, WorkbuddyProductEnvService's resolved-snapshot behavior, and bootstrap storage selection. This composition still calls coordinator refresh explicitly and uses the shared environment service, so it is not yet the final Desktop registration graph or automatic default Web background refresh.

Root build passed (`work/desktop-account-product-build.log`) after test-side annotations accounted for original JS declaration inference. Combined cloud/product compiled scenarios passed 11/11 under Node and WorkBuddy Electron (`work/desktop-account-product-compiled.log`, `work/desktop-account-product-electron.log`). This strengthens existing coverage without adding a new test count.

Full core regression passed 2,426/2,426 (`work/desktop-account-product-core.log`). The unchanged count reflects stronger composition assertions in existing scenarios.


### Original WorkBuddy application authentication/environment rebindings (2026-10-24)

Recovered WorkbuddyAuthenticationManager, WorkbuddyProductEnvService, WorkbuddyBootstrapAuthenticationStorage, the session synchronizer setter and bootstrap config reader. Thirteen verbatim regions across common.js/cli-product-env.js/module.app-server.js are source-checked. REA evidence `ev_4762b0b579cceab4b4e4d8e18c1b6d5e7729f513e8ebc84bb7dc908be5ea1540` covers three files, 5,712 bytes, 601 AST nodes and zero parse failures.

Five captured/recovered binding pairs pass (`work/workbuddy-auth-bindings-verify.log`), covering bootstrap priority/inline-spilled precedence, original storage forwarding, awaited/rejected synchronizer callbacks, persisted-session environment initialization and non-awaited snapshot publication. Five cloud pairs still pass (`work/workbuddy-auth-bindings-cloud-verify.log`) with the application subclass/environment override and bootstrap storage registered. After relogin, the original storage event and session synchronizer now publish remote models automatically; that phase no longer manually invokes coordinator refresh. Initial remote loading remains explicit. See [application binding fidelity](native-workbuddy-auth-bindings.md).

Root build passed (`work/workbuddy-auth-bindings-build.log`). Combined binding/cloud compiled scenarios passed 10/10 under Node and WorkBuddy Electron (`work/workbuddy-auth-bindings-compiled.log`, `work/workbuddy-auth-bindings-electron.log`). Product/cache persistence still uses the owned local-storage adapter; the next original dependency is WorkbuddyFileLocalStorage. Parent draining and default Web activation remain open.

Full core regression passed 2,431/2,431 (`work/workbuddy-auth-bindings-core.log`); README reports this verified count.


### Original WorkBuddy file local storage and durable product/cloud caches (2026-10-25)

Recovered the complete WorkbuddyFileLocalStorage, path constants and captured hash utility closure in 22 verbatim regions from chunk.js/common.js/module.app-server.js. REA evidence `ev_432c62bb709d3098db99dfc81b920937ed79787e0519f0a06bf8002e6e1cd31b` covers three files, 51,355 bytes, 11,206 AST nodes and zero parse failures. The original framework Emitter is shared explicitly; logger/Node/product boundaries are injected. Bundle-local hash names use an isolated outer scope without renaming original declarations.

Five captured/recovered storage pairs pass (`work/workbuddy-local-storage-verify.log`), covering original hashed JSON layout, Unicode keys, new-instance persistence, events, missing/corrupt/null values, failure behavior and directory selection. Five cloud pairs also pass (`work/workbuddy-local-storage-cloud-verify.log`) after replacing the composition's in-memory local-storage adapter with original file storage for product and cloud caches. Newly constructed storage/cloud instances read back the remote configuration, and the original product cache is checked on disk. Custom-token authentication now shares the same host environment.

Original direct writes, corruption fallback and missing-remove events are preserved; no atomic-write or locking semantics are invented. See [file cache fidelity](native-workbuddy-local-storage.md). Parent lifecycle ownership and default Web registration remain open; the next step is to package the now-composed original account/product services into a reusable owned runtime rather than keeping their construction only in verification fixtures.

Root build passed (`work/workbuddy-local-storage-build.log`) after adding the verifier's fixed-array non-null annotation. Combined file-storage/cloud compiled scenarios passed 10/10 under Node and WorkBuddy Electron (`work/workbuddy-local-storage-compiled.log`, `work/workbuddy-local-storage-electron.log`).

The first full core run recorded 2,435 passes and one failure (`work/workbuddy-local-storage-core.log`): the existing Node logging write/archive test queried only the local current day after Asia/Shanghai midnight, while the original writer names directories by UTC day. Source inspection confirmed the UTC/local boundary in the original implementation. Only the test's archive window/combined-content assertion was corrected; original logging behavior is unchanged and documented. The captured/recovered Node logging verifier passes (`work/workbuddy-local-storage-logging-verify.log`, 333 modules). Full regression is being rerun against that test correction.

After the logging test correction, the root rebuild passed and the combined logging/file-storage/cloud compiled scenarios passed 11/11 under Node and WorkBuddy Electron (`work/workbuddy-local-storage-compiled-final.log`, `work/workbuddy-local-storage-electron-final.log`).

The full core rerun passed 2,436/2,436 (`work/workbuddy-local-storage-core-rerun.log`). README reports this verified count; the initial timezone-related logging failure remains recorded above.
