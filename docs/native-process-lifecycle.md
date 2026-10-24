# Native process lifecycle

`installNativeProcessLifecycle` recovers the complete body of original module `76360`. `createNativeSafeExit` recovers the complete `36648` factory. Importing either file installs no process handlers. Explicit installation runs the original startup checks, wraps the supplied process's `exit`, and installs the original signal, stream-error, diagnostic, TTY-orphan and debug-crash behavior.

## Activation and parent ownership

The caller supplies `process`, `console`, `setTimeout`, `clearTimeout`, `setInterval`, `clearInterval`, and original dependency namespaces through `modules` or `getModule`. `Date` can be supplied for controlled execution. The SafeExit namespace can be created with `createNativeSafeExit({ process })` and supplied as module `36648`.

The remaining parent namespaces include the container and logger storage, semver, product/package metadata, telemetry shutdown helpers, TeamManager and team member registry, Shell and ShellSnapshot services, gateway process and PTY services, SessionManager/SessionHookManager, synchronous Sandbox CLI cleanup, log levels, and Windows Bash discovery. Token identity must match the parent graph. These are required dependencies, not successful placeholders.

Install once per owned process, as the original module loader does. The adapter exposes the original `exit`, `flushLogsSync`, `formatExitDiagnostic`, `persistExitDiagnostic`, and `isStreamJsonMode` closures for explicit ownership and verification. It does not add idempotent installation, handler removal, or a new shutdown order. The original async `exit` closure itself has a single-flight flag. A second caller returns immediately instead of awaiting the first shutdown.

## Preserved shutdown order

1. Start an unrefed five-second fallback timer, then flush telemetry with a 1,500 ms budget.
2. Clear shell snapshot cache, await Shell disposal, destroy gateway PTY sessions and gateway processes.
3. For an automatic team, stop its poller, destroy members and delete the team; then clean up session teams.
4. Execute SessionEnd hooks for the current session, if present, with the supplied reason.
5. Shut down telemetry with a 1,500 ms budget.
6. Clear the fallback timer and call `SafeExitUtils.exit(0)` in `finally`.

Each local cleanup has its original catch boundary. A failure in the initial telemetry flush skips the remaining cleanup; a SessionEnd failure skips telemetry shutdown. The final safe exit still runs. The fallback calls wrapped `process.exit(1)`. The wrapper first calls `killAllSandboxCliSync`, swallowing its errors, then delegates to the original process exit. SafeExit disables raw input when supported, restores the cursor on a TTY, and exits; terminal restoration errors are swallowed.

The module handles `SIGQUIT`, `SIGTERM` and `SIGHUP`; it does not add a `SIGINT` handler. Unhandled rejections are logged without initiating this cleanup. Broken-stream uncaught exceptions exit with code 1; other uncaught exceptions are logged or emitted as stream-JSON errors. The original 30-second orphan-TTY check, version/Node checks, Windows Bash checks and environment-gated debug-crash timer are retained.

## Evidence and verification

The fixed `codebuddy.js` SHA256 is `4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd`. Module ranges are UTF-16 `[9852690,9858421)` and `[13359185,13359526)`. The verifier compares every original statement of module 76360, excluding only the adapter's appended return of existing closures, and the complete SafeExit factory AST.

```sh
npm run verify:process-lifecycle -w @axonfire/harness -- /path/to/captured/codebuddy.js
npm run smoke:process-lifecycle -w @axonfire/harness
```

Eleven component source/recovery pairs cover shutdown order, failure scopes, concurrency, timeout behavior, signal handling, TTY polling, diagnostics, startup gates and the forced-uncaught debug branch. Four SafeExit comparisons cover terminal restoration and failure handling. A further pair launches real owned Node children, sends SIGTERM, and verifies exit code 0 and ordered calls through the actual recovered/original module and SafeExit implementation. The parent process is not modified. Component fixtures use explicit service adapters, and the real child also uses those service adapters: this proves process signal/exit behavior, not a complete production service graph. It does not execute the proprietary application bootstrap. Windows skips the POSIX real-process pair.

REA evidence `ev_8f9e0646a750119adfbedc7d733e4465546933d22237078ee30b5fb107a24967` covers 1,371 AST nodes in two inert original JavaScript fragments, with zero skipped files and zero parse failures. Semantic coverage is partial/truncated under the 750-node/150-unknown per-file/global limits and a 45-second analysis budget.

Default CLI/Web activation remains pending the original parent graph, including local/legacy Shell, telemetry helpers and session ownership. This module must not be used to claim that those parents are already recovered or integrated.

## Original telemetry exit coordination

`createNativeTelemetryExit` recovers complete factory `93441`, UTF-16 `[7887746,7889212)`, and can supply the process lifecycle's `93441` namespace. The parent still supplies `80699.ContainerUtil`, `92735.TraceService`, and `8395.AgentMetricsAggregator` with their actual service instances. This helper does not instantiate a trace exporter or metrics aggregator.

The original helper runs metrics and trace flushing concurrently. Metrics receive 80% of the remaining deadline, rounded down; trace gets the remaining deadline, and an outer timeout bounds the wait. Each timeout is unrefed when supported. Timeouts resolve without cancelling underlying work. Failures are swallowed at the original boundaries. `flushTelemetryBeforeExit` is repeatable, while `shutdownTelemetryBeforeExit` caches its first Promise, including a nonpositive-budget no-op. The original test reset export is retained. Shutdown invokes metrics `flushAndShutdown` and trace `forceFlush`; it does not add a trace shutdown call.

```sh
npm run verify:telemetry-exit -w @axonfire/harness -- /path/to/captured/codebuddy.js
```

Six original/recovered pairs cover budget consumption, concurrency, repeated flush versus cached shutdown, zero-budget caching/reset, missing/failing services, pending timeout behavior, and both telemetry stages of the recovered process-exit flow. The last case uses the actual recovered helper with explicit metrics/trace adapters; it does not prove exporter delivery or full product shutdown.

REA evidence `ev_4b7c428fdc64b4dea1a4a6d7fd744a17cdb2d59023d1d41cf7416e188206ca80` covers 381 AST nodes, one parsed inert JavaScript fragment, zero skipped files and zero parse failures. Semantic coverage is reported as **unknown**, not truncated; this is not a semantic-equivalence claim. The complete-factory AST comparison and finite paired runtime checks provide the component evidence.

## Agent metrics aggregator

`createNativeAgentMetrics` restores complete module `8395`, including its `AgentMetricsAggregator` Symbol, implementation, 30-second interval constant, property decorators and application-lifecycle registration. The parent supplies common DI decorators (`80699`), logger namespace (`92735`) and Galileo namespace (`40602`). Inject the actual `galileo` and `logger` services before invoking lifecycle methods. Use the returned `8395` namespace and aggregator instance when wiring the telemetry exit helper's container lookup; re-creating a separate Symbol does not establish a shared binding.

The implementation retains request, tool, task-outcome, cache-rate, generated-tool-call and per-model token windows. Error details are emitted immediately and truncated to 500 UTF-16 code units. A tool initially attributed to `builtin` can be promoted to a named MCP server. Task fallback labels use the last observed model. Periodic start installs an unrefed 30-second timer; stop clears it and flushes.

Two original boundary behaviors matter for integration: cache-rate/generated-call counts alone do not pass the window's flush guard, and `flushAndShutdown` flushes the final window only when an active timer exists. It still calls Galileo shutdown when no timer exists. A caught emission failure discards the window after warning. These behaviors were not changed to make tests easier or shutdown more conventional.

```sh
npm run verify:agent-metrics -w @axonfire/harness -- /path/to/captured/codebuddy.js
```

Six original/recovered comparisons cover all metric families, window reset and guard behavior, timer ownership, started versus unstarted shutdown, export failures, error truncation, outcome labels, and the actual aggregator participating in both telemetry-exit stages. Galileo emission/flush/shutdown and trace export remain explicit adapters in these tests. This proves aggregation and coordination behavior, not delivery to the original telemetry backend.

Complete-factory AST comparison uses UTF-16 `[7875230,7882707)` and the same fixed bundle SHA256. REA evidence `ev_defb1f41c8ae9ee80eb457c4c4f0cb4c3a957a88e1e8112e8bbf2382640b6557` covers 1,747 AST nodes, one parsed inert JavaScript fragment, zero skipped files and zero parse failures. Semantic coverage is partial/truncated under the 750-node/150-unknown per-file/global limits and 45-second budget. The original application bootstrap was not executed.
