# Native tracing service and provider

`createNativeTracing` restores eight complete original factories: TraceService (`79645`), TracerProvider (`801`), trace wrappers (`1423`), span wrappers (`94668`), tracing tokens (`97584`), environment parsing (`63984`), deterministic ID generation (`11484`), and logging exporter (`86504`). It preserves DI registrations, helpers and static behavior without running the application bootstrap.

The factory returns the original classes and token namespace plus `getModule`. The parent supplies common DI (`80699`), product tokens (`9151`), trace-header constants (`51147`), OpenTelemetry API (`47763`), OTLP exporter (`13896`), Resource (`85081`) and tracing SDK (`89752`). It supplies `process`; `Date`, `Reflect` and timer boundaries may be explicit. Constructing these modules does not initialize a provider. Inject the original parent services before calling `init()`.

## Preserved behavior

TraceService delegates initialization, flushing and shutdown to its provider. Restart calls shutdown followed by initialization. Existing trace IDs reuse their cached root span. The original FIFO list is capped at 100 entries; repeated `setTrace` calls for the same ID still append duplicates, so eviction can remove the current map entry for that ID. This behavior is retained.

Provider initialization honors original product and environment gates and precedence. A Galileo-enabled product uses the global OpenTelemetry tracer, skips its own OTLP exporter and does not shut down the global provider. Force-flush delegates to the global provider when available. The standalone path resolves an exporter, resources and processors, schedules registration, and obtains its tracer. Reinitialization retains the original flush/shutdown ordering, including repeated cleanup when reached through `restart`.

Root spans force CLIENT kind and the current start time after supplied options. Child spans apply caller options after the default CLIENT kind. Remote-parent context, deterministic next-trace-ID consumption, B3 headers, span status/end calls and empty-trace behavior remain original. The logging exporter forwards results and optional flush/shutdown operations to its delegate.

The environment helper retains CodeBuddy-versus-Claude enable-flag precedence, trace-specific versus generic OTLP endpoints/headers, percent-decoding behavior, unsupported exporter/protocol warnings and Galileo readiness gates. It does not normalize these into a different telemetry policy.

## Verification and limits

```sh
npm run verify:tracing -w @axonfire/harness -- /path/to/captured/codebuddy.js
npm run smoke:process-lifecycle -w @axonfire/harness
```

Every complete factory AST is compared against bundle SHA256 `4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd`; UTF-16 ranges are recorded in source metadata. Eight original/recovered scenario pairs cover disabled tracing, standalone initialization/restart, global-provider ownership, cache behavior, span/context/header behavior, environment parsing, exporter forwarding, and actual TraceService participation in both stages of the recovered telemetry-exit helper.

The scenarios supply explicit OpenTelemetry API/SDK/exporter, DI and header-constant adapters. Provider-construction observations project configuration fields rather than comparing separately-created class/function identities. Actual exporter transport, serialization, global SDK registration and backend delivery are not established by these checks; no telemetry is sent. Default product service-graph/bootstrap integration remains unfinished.

REA evidence `ev_3119af25ddaba2ebe428496f513c912ccec19e8012c0fce61c465a995ceb4c9f` covers 3,553 AST nodes in eight parsed inert JavaScript fragments, zero skipped files and zero parse failures. Semantic coverage is partial/truncated under the 750-node/150-unknown per-file/global limits and 45-second budget. Complete AST and finite runtime comparisons supplement that bounded analysis.
