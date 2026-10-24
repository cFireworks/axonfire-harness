# Native LoggerProvider

`createNativeLoggerProvider` restores six complete statements from captured
module 92763, containing LogRecord, Logger, LoggerProvider, processor/configuration
helpers, batching and the console exporter. Fourteen complete parent factories
supply severity levels, no-op logging, merge/bind/timeout utilities, attribute
validation, trace context helpers, error handling and timers. All ranges retain
the captured SHA-256 and UTF-16 offsets and pass structural AST comparison.

Actual logger emission now constructs records with timestamps, instrumentation
scope, resource and trace context. Attribute limits, truncation, dropped counts
and readonly state retain the captured behavior. LoggerProvider caches loggers
by scope, dispatches to registered processors and preserves singleflight shutdown
and no-op logger behavior after shutdown. Batch processing queues records,
flushes batches, waits for asynchronous resource attributes and exports through
the captured context-aware bridge.

Four original/reconstructed scenario pairs verify record limits and readonly
behavior, valid trace context, logger reuse, batching and repeated shutdown,
async Resource readiness, and actual HTTP delivery. The integration path is
`getLogger().emit()` → real LogRecord → BatchLogRecordProcessor → concrete
Galileo log exporter → serializer/transport → loopback receiver. The received
payload is checked for body, scope and SDK resource identity. Explicit timestamps
make original/reconstructed comparisons deterministic. Timers and Node transport
are real; tests force flush and shut down processors to release timers/agents.

The composition reuses recovered context, environment, Resource and time modules.
Trace access is bound to the actual recovered span-context helpers rather than
a full TraceAPI/tracer provider. Diagnostics use the recovered context registry;
no host-global logger/provider is registered. Console exporter source is retained
but console output is not independently exercised. The [outer Galileo logger](native-galileo-logger.md) now composes this provider;
the [self-monitor factory](native-galileo-self-monitor.md) also composes real metrics.
The [SetupGalileo entry point](native-galileo-setup.md) is also recovered;
default application assembly remains unfinished. No original telemetry endpoint is contacted.

```sh
npm run verify:logger-provider -w @axonfire/harness -- /path/to/codebuddy.js
npm run smoke:galileo-transport -w @axonfire/harness
```

REA evidence: `ev_a701da5971e484b5dd308c2743e2d0714faa2e7b9c75c7ef29cb4344898cab69`. The inert extraction contains 7727 AST nodes in 15 parsed files with no parse failures. Semantic coverage: `partial`; truncated: `true` under 750-node and 150-unknown limits.
