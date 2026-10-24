# Native MeterProvider

`createNativeMeterProvider` restores 15 complete statements from captured module
92763 and the complete no-op meter factory 36182. The statements contain views,
instruments, synchronous/asynchronous metric storage, observable registration,
meter state, collection and MeterProvider lifecycle. Fixed SHA-256 and UTF-16
ranges accompany AST comparison of the entire recovered scope.

The provider now creates actual counters, up/down counters, gauges, histograms
and observable instruments. Its shared state binds readers to real collectors;
there is no synthetic SDK producer in the new integration tests. Views select
instruments, rename metrics and filter attributes. Scope identity preserves
meter reuse. Shutdown closes readers and subsequent getMeter calls return the
captured no-op meter.

Five original/reconstructed scenario pairs cover synchronous instruments and
histogram buckets, observable and batch callbacks, view selection/renaming/
attribute filtering, shutdown/no-op behavior, and real counter delivery. The
last test records through `getMeter().createCounter().add()`, flushes the actual
provider, and checks the OTLP integer value received over loopback HTTP through
the recovered periodic reader, context bridge, concrete exporter and transport.

The composition reuses recovered reader selectors, aggregation/storage helpers,
time/value helpers and context. Diagnostics remain an explicit sink. Tests now use [recovered Resource instances](native-otel-resource.md) and
the default resource merge path, including serialized SDK identity checks. The provider's interval handles remain controlled by the reader
fixture, with delivery triggered through forceFlush. Not every instrument/storage
edge case has independent behavioral coverage despite full AST preservation.
SDK logger, SetupGalileo and default application assembly remain unfinished.

```sh
npm run verify:meter-provider -w @axonfire/harness -- /path/to/codebuddy.js
npm run smoke:galileo-transport -w @axonfire/harness
```

REA evidence: `ev_38dccc37ab71727e7e0a6da3593d6c1c6d6b9cd37729ae718b6af8af2b5da608`. The inert extraction contains 11719 AST nodes in 2 parsed files with no parse failures. Semantic coverage: `partial`; truncated: `true` under 750-node and 150-unknown limits.
