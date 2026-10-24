# Native BasicTracerProvider, Tracer and Span

`createNativeBasicTracer` restores 19 complete captured factories: the basic
provider and processor composition, Tracer and Span, TraceAPI and proxy/no-op
tracers, configuration/limits, random IDs, span enums, PropagationAPI, composite
propagation and W3C trace-context/baggage propagators. Each factory retains its
bundle hash and UTF-16 range and is compared structurally against the original.

The factory exposes the actual TraceAPI and PropagationAPI plus a lazy
BasicTracerProvider constructor. The lazy binding permits the original circular
dependency between provider configuration and samplers to be wired to recovered
modules. Environment, context/registry, Resource, samplers, batching, time,
attribute helpers and baggage utilities are explicit recovered parents.

Three original/reconstructed scenario pairs cover:

- Real parent/child spans, active context, scope caching, attribute truncation
  and dropped counts, event limits, status, duration and suppressed no-op spans.
- A tracer obtained before provider registration becoming active afterwards,
  plus actual W3C traceparent and baggage injection/extraction in an isolated
  registry.
- Galileo registration with the actual BasicTracerProvider and ALS manager,
  real asynchronously active parent/child spans, and batch export through the
  recovered serializer/transport to a gzip HTTP receiver.

The integration checks parent/child trace linkage and explicit span timestamps.
Generated IDs and clock-derived internal bookkeeping are excluded from paired
output comparison. Other tests use deterministic ID generators and explicit
start/end times. Tests flush and shut down providers and disable their isolated
trace/propagation/context registrations. No original telemetry endpoint is used.

```sh
npm run verify:basic-tracer -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run smoke:galileo-transport -w @axonfire/harness
```

REA evidence: `ev_4b95ea0db3ce1dea83a7212602360b6e606b6e93ffb3ad3265cc6f94ac18d2ee`.
The inert extraction parsed 19 files, 8,128 AST nodes and zero parse failures.
Semantic coverage is partial/truncated with 750 node / 150 unknown limits and a
45-second budget. The [SetupGalileo entry point](native-galileo-setup.md) now composes these providers.
The [HTTP/Fetch integration](native-galileo-http-instrumentation.md) also uses
real OCP configuration. The application's default native graph remains incomplete;
restoring this provider does not itself activate application bootstrap.
