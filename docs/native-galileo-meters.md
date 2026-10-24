# Galileo business metric assembly

`createNativeGalileoMeters` restores `getEndBuckets`, `registerMeterProvider`,
the compression enum and the complete MetricsAPI factory 37366 from the pinned
bundle. Three source regions and one module retain exact UTF-16 offsets and
structural AST comparisons. Components bind to the recovered MeterProvider,
views, aggregators, periodic reader, resource and metric exporter.

The provider installs six views: client/server started and handled counters use
sum aggregation, and client/server handled-duration histograms use configured
explicit buckets. Bucket selection starts with captured SDK defaults, ignores
empty and unknown entries, and uses the last nonempty matching remote entry.
Remote metric configuration is read once at construction; no polling or live view
replacement is introduced. The captured function calls `remote.getMetricsConfig()`
unconditionally; a missing remote object is not silently replaced with defaults.
The reader retains delta temporality, gzip,
concurrency 30, a 30-second interval and a 20-second timeout.

The recovered MetricsAPI uses the supplied context registry. Registration,
lookup, duplicate rejection and disable are actual captured implementations.
Registering another provider returns the new provider even if registration is
rejected; the existing global provider remains active. Both returned providers
still require shutdown. The tests use an isolated registry, never the host's
OpenTelemetry registry.

Two original/reconstructed scenario pairs cover bucket precedence/default
identity and a complete six-instrument HTTP export. Actual counter/histogram
storage yields four sums and two histograms with the expected boundaries,
buckets, counts and sums. The receiver checks gzip and delta temporality.
Registration, duplicate behavior and fallback to the no-op provider are checked
through the recovered MetricsAPI. Timers use the existing controlled reader
fixture; explicit flush drives collection/export and shutdown removes timers.
Remote configuration is an explicit fixture, not a restored OCP client.

```sh
npm run verify:galileo-meters -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run smoke:galileo-transport -w @axonfire/harness
```

REA evidence: `ev_56dc8950b10d48ac4da343af533515fb22ac4d11f65b1a51739ee2f6767e3350`.
The inert extraction parsed two files, 507 AST nodes and zero parse failures.
Semantic coverage is unknown/not truncated at 750 nodes and 150 unknowns with a
45-second budget. This assembly now participates in the [real SetupGalileo HTTP/Fetch
integration](native-galileo-http-instrumentation.md). Default native application
assembly remains incomplete.
