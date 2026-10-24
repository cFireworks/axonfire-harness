# Native Galileo metric exporter

`createNativeGalileoMetricExporter` restores 39 complete statements from captured
module 92763: the concrete metric exporter, its base and temporality selectors,
instrument descriptors, aggregation classes and accumulations, and their local
helpers. Source ranges and the fixed CLI SHA-256 accompany structural AST
comparison of all statements.

The recovered aggregation implementations include drop, sum, last value,
explicit/default histograms and exponential histograms. They retain original
record, merge, diff and metric-data conversion behavior. Default aggregation
selects by instrument type and honors histogram boundary advice. Monotonic sum
diff detects resets; histogram data retains the original min/max and bucket
handling. Exponential histograms retain signed buckets, scaling and zero counts.

The metric exporter uses the recovered OTLP exporter base, configuration,
serializer and HTTP transport. Explicit aggregation and temporality preferences
take precedence; otherwise it reads the supplied original environment-module
interface. Cumulative, delta and low-memory selectors retain their distinct
instrument mappings and warning fallback for unknown preference values.

Five original/reconstructed scenario pairs exercise temporality across all
instrument types, explicit selector overrides and default aggregation resolution,
sum resets and histogram merge/diff, signed exponential histogram accumulation,
and real loopback delivery. The integration test generates a metric with the
actual recovered sum aggregator, exports it through the concrete metric exporter
and checks the received integer value in OTLP JSON before flush/shutdown.

The composition takes explicit recovered component namespaces, SDK constants,
diagnostics, time and the environment module. Tests now use the [recovered environment module](native-otel-environment.md)
for module 70000; diagnostics remain an explicit adapter. Crypto is supplied for an unused shared-declaration import.
Shared log serialization helpers are retained as captured, but metric export
uses the previously recovered metric serializer. No original telemetry endpoint
is contacted. MeterProvider, SDK logger, SetupGalileo and the default
application graph remain separate integration work.

```sh
npm run verify:galileo-metric-exporter -w @axonfire/harness -- /path/to/codebuddy.js
npm run smoke:galileo-transport -w @axonfire/harness
```

REA evidence: `ev_af2873aaa6e7b30cc818b49ef725779af8eadf1fda87fcda630d99378de42469`.
The inert extraction contains 9,214 AST nodes in one parsed JavaScript file and
no parse failures. Semantic coverage is partial/truncated under 750-node and
150-unknown limits; it did not execute the application bootstrap.

[Metric readers](native-metric-reader.md) now use this module’s original
aggregation and timeout helpers and have real exporter delivery tests.
