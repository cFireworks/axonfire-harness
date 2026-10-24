# Native Web runtime ownership

The default live Web host now starts its CLI through the recovered `SidecarManager`, executable sidecar entry and session ready-ACK protocol. `apps/web/native-owned-runtime.mjs` is the host adapter; it contains no model loop or tool implementation. The browser adapter composes the complete recovered `SessionManager` and `CodeBuddyCodeBackend`; the original CLI product graph handles model/tool execution and ACP/REST requests. The offline demo and explicit standalone workbench retain their own runtime selection.

## Startup and state

Each Web runtime creates a private temporary control root and a fresh sidecar session ID. This isolates daemon PID/socket ownership from an installed WorkBuddy and from other Web processes. The manager starts the original sidecar and provisions its authenticated hosted CLI for persistent history reads. Each conversation uses the original backend to provision its own CLI, with user Web CLI arguments and environment forwarded at the launch boundary. The original port-zero readiness report determines the ACP origin; Web no longer scrapes an endpoint from CLI stdout.

Persistent CLI state continues to use the configured `WORKBUDDY_CONFIG_DIR` or `AXONFIRE_STATE_DIR` and the existing launcher default. Removing the private control root does not remove that state. The browser resolves the workspace real path before starting sessions or querying history. This matters on macOS, where `/var` and `/private/var` aliases otherwise produce different native project-storage keys. The daemon uses the parent's temporary-directory namespace so parent and child compute identical control-socket paths, including when a caller passes a reduced environment.

The host and CLI share an original gateway secret. ACP connect/request/disconnect and REST history calls send its server-side headers. The browser never receives the secret. Owned tests verify that an unauthenticated health request is rejected, authenticated health/ACP work, and history survives a new daemon/CLI lifetime with the same state directory.

## Conversation prewarming

Pool startup runs before hosted history-CLI readiness, allowing both original startup paths to overlap. The original initializer reads capacity from the host environment or the original `app/app-config.json` accessor. The Web host supplies its resolved CLI path and a shared original managed-env builder; no placeholder account or connector services are installed. The pool attaches to both the original manager and code backend.

Acquisition, health probing, environment matching, activation ACKs, replenishment and fallback execute in recovered code. The host forwards user CLI arguments at both cold launch and warm activation boundaries. Idle and activated processes remain owned by the pool; controller destruction and pool stop reclaim them during Web shutdown. Product/account event subscriptions remain separate Desktop integration work.

`native-web-prewarm.test.mjs` checks actual pool ownership and cold-launch counts, not only model output. It covers warm hits, automatic replenishment, a second independent warm conversation, managed-environment mismatch fallback, and zero capacity through both environment and persisted configuration. The model sees the user's explicit model override on both launch paths. No performance improvement is claimed without a benchmark.

## Proxy environment

Both hosted history CLI and conversation CLI launches now use the recovered proxy environment helpers. `HTTP_PROXY` / `HTTPS_PROXY` take precedence over their lowercase aliases. When either proxy is set, the original helper preserves user `NO_PROXY` entries and appends `localhost`, `127.0.0.1` and `::1`; it sets `NODE_OPTIONS` to the original `--use-system-ca` value. This is original replacement behavior, not an additive merge of user Node options. The browser host no longer substitutes an empty proxy resolver or overwrites normalized bypass entries with its raw environment.

`native-web-proxy.test.mjs` owns a local HTTP proxy and model server. A reserved `.invalid` model hostname can only succeed through that proxy. The real CLI executes a Bash command that returns its inherited `NO_PROXY`; model continuation checks the tool result. The fixture also reads persisted history and rejects unexpected proxy destinations, covering both uppercase and lowercase environment inputs. Reverting the host normalization and restoring the previous empty resolvers makes the child-environment assertion fail with only the user bypass entry. TLS interception, system proxy discovery and enterprise certificates are not established by this HTTP fixture.

## Shutdown

Web close is coalesced: it cancels an active prompt, drains pending browser decisions, destroys controller sessions, and waits for original manager shutdown, original pool stop, daemon exit and private control-directory cleanup. It drains an in-flight startup before a second manager stop, so a late spawn cannot silently escape the initial stop. The adapter preserves the original manager's known shutdown race and catches its rejection, as the original AppServer caller does. A bounded fallback terminates an owned daemon that has not exited after shutdown.

The host holds a referenced timer during asynchronous shutdown because original IPC handles are unrefed. The Web server lazily imports the standalone harness only when that host is selected. This avoids installing an unused SDK tracing provider in native Web. The main signal listeners stay registered until host cleanup finishes: a once-only listener disappeared before SDK tracing's asynchronous signal handler checked for other listeners, allowing that handler to exit the process before daemon cleanup. The SDK itself remains unchanged.

Native Web now uses the complete original SessionManager initializer, prompt pipeline, permission/question resolution, cancellation and backend cleanup. Its event bridge subscribes to session-scoped original events. The browser config resolver preserves product JSON tools and prompts; desktop mode defaults are not substituted for them. Native CLI persistence provides browser history without requiring the Desktop SQLite service. The original prewarm pool is now enabled in this browser composition, using the original initializer and shared managed environment. Its capacity follows the original environment override, persisted app-config value, then default of one idle process. Setting `WORKBUDDY_CLI_PREWARM_POOL_SIZE=0` disables it. Browser form/URL elicitation now bridges original controller/backend response methods through local SSE decisions. See [elicitation behavior and validation boundaries](native-web-elicitation.md). Full application background services, live connector proxy and enterprise account lifecycle remain open integration work.

## Verification

- `native-web.test.mjs` exercises allow/reject, cancellation, answered/skipped questions, disconnect and history reload. The allow case additionally creates a second conversation in the same process and verifies separate IDs and model-visible history. Its shutdown helper now verifies exit code zero and that all observed Web descendants have exited; passing browser responses alone is insufficient.
- `native-owned-runtime.test.mjs` checks gateway-authenticated REST/ACP, state/history across two daemon lifetimes, coalesced close, both CLI/daemon PIDs gone and control files removed while persistent state remains.
- `native-code-session-backend.test.mjs` runs the complete original backend in both prewarm and background cold-start modes. Cold mode uses the actual detached daemon, preserves idle pool capacity, prompts through the original ACP client and shuts down through the recovered AppServer stop path.

The legacy direct-process adapter remains available to focused CLI/ACP fixtures; it is no longer the default live Web launcher. Native platform coverage remains strongest on macOS arm64. These ownership checks do not resolve the separately recorded sandbox audit or MCP permission limitations.

The latest 2026-10-24 full host run completed with 119 tests: 118 passed, zero failed and one known MCP permission TODO (`work/web-prewarm-hosts.log`). All ownership and six default Web interaction tests passed with the complete controller. The earlier intermittent sandbox audit failure did not reproduce; this does not establish its resolution. The three focused backend/ownership tests also passed under WorkBuddy Electron. See the [recovery ledger](recovery-status.md) for evidence and unresolved boundaries.
