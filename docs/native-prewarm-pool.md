# Native CLI prewarm pool

`createNativeCliPrewarmPool()` in `@axonfire/harness/terminal/native-cli-prewarm-pool.js` exposes the complete original `CliPrewarmPool`, agent-team environment resolver and supporting helpers. The pool owns prewarmed CLI processes separately from the sidecar's session table. It is recovered and executable; the default Web launcher does not yet assemble it into its service graph.

## Lifecycle and matching

- `start()` fills the configured idle capacity. A nonpositive pool size disables acquisition. Children run the original CLI `--prewarm --prewarm-id` path and become idle after their IPC socket answers ping.
- `tryAcquire(delta, runtimeManagedEnv, trustedKeys)` rejects unrecognized per-session environment keys. When a cold-start managed environment is supplied, it must exactly match the selected child's spawn environment plus the captured delta. Stale entries are discarded and replenished. Acquisition reserves an entry synchronously; it does not perform an inline ping. Background health checks handle unhealthy idle entries.
- Activation sends the original ready-ACK request, including session ID, cwd, CLI arguments and permitted environment delta. ACK validation requires the expected PID/session ID and an HTTP endpoint at `127.0.0.1:<port>/api/v1/acp`, without query or fragment.
- Acquisition schedules replacement capacity. Activated entries do not consume idle capacity. Reservations and a second capacity check limit concurrent replenish requests; repeated startup failures use the original backoff.
- `flush()` discards idle/spawning entries while keeping activated sessions. Concurrent requests share a flush loop and can request one additional pass. Current product configuration overrides the initial baseline, with file-path configuration taking precedence over inline configuration.
- `killSession()` terminates a pool-owned session or returns false for sidecar fallback. `stop()` marks all tracked entries discarded, clears health timers, empties mappings and terminates children. Termination retains the original graceful interval and forced-kill behavior, including PID-file cleanup.

The original class also exposes active endpoints for the manager to merge into session lookup. Its source comments discuss historical acquire-time ping behavior; the recovered implementation uses the actual background-probe code, without adding that earlier behavior back.

## AppServer construction and configuration lifecycle

`createNativeHostedCliLifecycle()` in `@axonfire/harness/terminal/native-hosted-cli-lifecycle.js` exposes the original capacity/cache helpers, authentication lifecycle and two assembly adapters. `initializePrewarmPool()` wraps the contiguous original pool-construction statements from `bootstrapWorkbuddyAppServer`; `bindProductSnapshot()` wraps the complete original subscription statement from background-service startup. The wrapper signatures and return values are reconstruction boundaries; the extracted statements are unchanged.

Pool capacity resolves from `WORKBUDDY_CLI_PREWARM_POOL_SIZE`, then cached `prewarmPoolSize`, then the original default of one. Environment values must be decimal nonnegative safe integers; cached numeric values use the original nonnegative integer check, which does not impose the safe-integer restriction. Invalid environment values warn and fall back. Zero disables pool creation. Startup obtains QIMEI once, builds an initial environment plus a provider for subsequent spawns, starts the pool and attaches it to backend factory options and the runtime manager. Failures retain the original cold-start fallback.

Remote capacity persistence accepts nonnegative integers, ignores invalid/missing values, and catches write failures. This updates the cache for the next application start; it does not resize an existing pool. Product snapshots independently request host rotation, then flush the pool even if rotation failed. Authentication ownership uses UID, domain and enterprise ID; token-only changes do not reset the runtime. Owner changes queue host reset, pool flush and active-backend reset in order. Logout first invalidates session history. A host-reset rejection skips the later actions for that event; a later queued event recovers. Pool/backend failures are logged separately. Stopping unsubscribes and drains the pending reset queue.

REA evidence `ev_48cf960702907bc9c570559e3a669b79a8c9ae3063b2a48da8ce7e3b3b20ad66` covers 6,249 bytes / 784 AST nodes / zero parse failures. Eight source regions span the fixed `initialize.js` and `workbuddy-auth-product-coordinator.js` captures; eight paired scenario groups cover assembly, precedence, cache failures, subscriptions, ordering and failure isolation.

The real prewarm test now constructs the pool through the original AppServer statements, with fixture-owned installation paths and the original CLI-path/environment builders. The host fixture invokes the original product-snapshot callback to rotate an actual CLI and the original logout lifecycle to reset the sidecar manager. These fixtures supply explicit event emitters and history/backend callbacks; they do not simulate a production account login or prove that the entire background-service graph is installed.

## Original CLI path and environment construction

`createNativeAppCliEnvironment()` recovers `resolveWorkbuddyAppServerCodeCliPath`, `buildWorkbuddyAppServerCodeCliEnv` and the scoped warning helper. Pool assembly now uses these functions by default. It resolves the bundled bin path before the bundled JavaScript path, then falls back to a trimmed `CODEBUDDY_CODE_PATH` with an existence check and warning. A nonempty bundled path is trusted without checking the file; the resolver contract, rather than this function, determines whether a bundled asset is available.

Environment construction combines the original product-config file/inline precedence, client identity, enabled plugin directories, managed Node/Python paths, bundled-runtime policy, proxy values, shared gateway authentication and selected process overrides. It reads the original registry and file helpers recovered with the sidecar manager. Explicit session extras apply last. `WORKBUDDY_NODE_ENV` defaults to the parent's `NODE_ENV` or `production`. A truthy V3 inline configuration bypasses the bootstrap provider; a product file still wins over the provider's inline result, although that provider is called when V3 is absent.

The factory shares gateway state with the containing runtime when supplied, so parent HTTP authentication and child environment agree. OS/process boundaries can be injected for owned test roots; no original environment builder is replaced in the real prewarm fixture. The fixture supplies installation paths and a private model product file, while the restored functions build the managed baseline used by both pool spawning and acquisition matching.

REA evidence `ev_8768a0042ba0aaf443c838b02d59216646ea04c0ef9a597ca6dadd87c9716bd3` covers 3,101 bytes / 357 AST nodes / zero parse failures. Three complete source regions and seven paired scenario groups cover path precedence/fallback, product sources, identity, filesystem-derived plugins/runtime paths, proxy filtering, session overrides and error propagation.

## Backend acquisition and termination

`createNativeRuntimeAcquisition({ logger })` exposes the complete original backend `acquireRuntime` and `killRuntimeSession` methods plus argument conversion and logging helpers. Bind these methods to the owning backend instance, supplying its original dependencies, runtime manager, session identity and lifecycle flags.

Foreground acquisition tries the prewarm pool with the session delta, cold-start managed environment and trusted environment keys. Activation strips the CLI executable argument and appends `--port 0`, injecting `--serve` when absent. Failed activation falls back to the manager; background automation bypasses the pool. The synchronous `tryAcquire()` call is outside the activation catch, so a synchronous pool error propagates unchanged.

If destruction occurs during either startup path, the original method kills the newly created session and rejects. Termination first uses the pool for prewarm-owned sessions; an unhandled or failed pool kill falls back to the manager. The original method clears lifecycle flags and catches manager termination rejection.

REA evidence `ev_7756bde9219c521e366df0fe0470d68d4250a1d771967adab7a62854c926c91e` covers 3,153 bytes / 521 AST nodes / zero parse failures. `verify:runtime-acquisition` compares five complete original source regions and runs eight paired scenario groups, including destruction races, failure fallback, ownership and argument behavior. The real prewarm CLI fixture now calls these backend acquisition/termination methods instead of invoking the lease directly.

## AppServer backend dependency factory and MCP configuration

`createNativeAppCodeBackend()` exposes the original `createWorkbuddyAppServerCodeBackend` factory, POI feature gate, ownership key and complete connector-proxy MCP configuration declarations. The original factory passes platform paths/version/locale, configuration readers, CLI path/environment functions, telemetry adapters, connector tokens, project environment/MCP resolvers, agent-team state, authentication state, audit storage and the prewarm pool into the supplied backend constructor. Accessor functions retain their dynamic reads and Tencent Docs' bound receiver.

MCP configuration targets the local connector proxy, preserving bearer headers, transparent proxy mode, builtin bare names and deferred tools. Cloud-memory, POI and project/netdrive flags retain their original defaults. POI uses the merged feature object ahead of the current product object; an empty merged object suppresses fallback. Ardot's second mapping pass can restore a tool filtered by an earlier pass and forces nondeferred loading. This is verified configuration-generation behavior, not evidence that the remote tool handler authorizes execution. Invalid/nonpositive ports return an empty configuration and warn; finite positive fractions remain accepted by the original check.

REA evidence `ev_9ef6a0c7a9784c1cd87aea146389864b2e073ef5d5762110af8660d21d7a57a1` covers 7,238 bytes / 847 AST nodes / zero parse failures. Nineteen complete original regions and seven paired scenario groups validate the dependency factory and MCP configuration. The real prewarm fixture now receives its dependencies through this factory and independently rebuilds the acquisition environment through its `buildEnv` accessor; this must match the original pool baseline for a warm hit.

The acquisition-focused fixture retains its explicit constructor boundary. A separate [complete backend fixture](native-code-session-backend.md) now creates the original `CodeBuddyCodeBackend` / `CodeBuddyCodeSessionBackend`, initializes a real prewarmed CLI and prompts through the original ACP client. Live connector-proxy tool service and full default-host wiring remain separate integration work.

## Original AppServer shutdown

`createNativeAppServerStop()` in `@axonfire/harness/sessions/native-app-server-stop.js` recovers the complete original `stop` method returned by `bootstrapWorkbuddyAppServer`, with its closure dependencies supplied explicitly.

It cancels plugin recommendation requests, stops session runtime/event handles, disposes edge synchronization, clears power tracking, disposes document and memory services, stops the bootstrap, stops the runtime manager and stops the prewarm pool. It retains the original selective exception handling: edge disposal, bootstrap stop, manager stop and pool stop failures are caught. Document/memory disposal failures can still propagate and prevent later cleanup.

The original manager's close-callback/dispose race remains in its lower-level API. The original AppServer method catches that rejection. The cold-daemon fixture now calls this recovered upper-level method and verifies successful completion, daemon exit code zero and removed control/PID files. Other AppServer resources in that fixture are explicit boundary adapters that record cleanup order; this is not a claim that the entire AppServer bootstrap is assembled.

## Evidence and verification

REA evidence `ev_c155b4c9c334d140815fe5d851c4ffdf9e01c0c5bdde138495a19a3f8d747c66` covers 28,638 bytes / 3,416 AST nodes / zero parse failures. Verification compares 34 full prewarm declarations from the hash-locked `cli-prewarm-pool.js` capture plus the complete stop method from `initialize.js`. Seven paired scenario groups cover shutdown order/failure boundaries, exact environment comparison, acquisition and delta snapshots, ACK identity, endpoint validation, flush and stop.

`apps/web/test/native-prewarm-pool.test.mjs` starts the actual recovered CLI in prewarm mode, acquires and activates it through the real IPC protocol, completes an ACP prompt against an owned local model endpoint, observes replacement idle capacity and verifies child-process cleanup. `native-sidecar-cold.test.mjs` separately covers actual detached daemon cold start and the original AppServer stop behavior. No second agent loop or synthetic ready reporter is used.

Complete backend construction now passes real prewarm and cold-start integration, and default Web uses the recovered sidecar manager. Windows execution, the complete coordinator/background-service graph and adoption of the full desktop session controller by default Web remain separate integration work. Native compatibility bugs already documented in the recovery ledger remain visible.


## Default Web composition

Default Web now initializes this pool through the original `initializePrewarmPool` assembly. Its config getter uses the recovered app-config file accessor, and its CLI path/environment providers are explicit browser-host boundaries. The original environment builder is shared between pool baselines and conversation backends, including host capabilities and static managed environment. Capacity precedence and default remain unchanged.

The browser adapter forwards user CLI options through both the original cold manager and warm lease activation. It does not replace `tryAcquire`, environment comparison, activation, replenishment or termination algorithms. Original pool stop is included after session and manager cleanup. The real host fixture verifies warm ownership, cold fallback on changed managed environment, disabled capacity, model overrides and process exit. Account-change and product-snapshot subscriptions still require complete Desktop services.

Validation on 2026-10-24: full host aggregate 118 passes, zero failures and one known MCP TODO (119 total); root build passed; focused real Web prewarm cases 4/4 under Node and 4/4 under WorkBuddy Electron. These results do not establish live account/product-snapshot subscription assembly or a startup-latency benchmark.
