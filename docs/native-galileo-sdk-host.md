# Public Galileo SDK host

`createNativeGalileoSdkHost` is an owned composition layer in `src/runtime`.
It assembles the recovered context, environment, resources, serializers,
transport, exporters, log/metric/trace providers, remote Config, HTTP/Fetch
instrumentation, SetupGalileo and outer Logger. It imports no test helpers and
uses no provider or network doubles. Captured implementation bodies remain
unchanged; the host supplies module bindings and resource ownership.

The public surface provides `SetupGalileo`, `Logger`, `forceFlush`, `close` and
module/API access for consumers such as the recovered GalileoService. Creating a
host does not initialize telemetry, patch HTTP/fetch or start polling. Callers
explicitly supply the process, globals and registry. Optional SDK constant
overrides permit controlled destinations without rewriting the captured setup.
The exporter factory's `constantsOnly` option reads the captured SDK constants
before transport construction; its existing exporter API remains available.

The host handles the original circular module dependencies through deferred
bindings, then constructs actual providers and instrumentation classes. It tracks
configuration requests, polling instances, providers, instrumentation hooks and
context managers. `close()` is cached and blocks new setup/logger creation. It
waits for in-flight setup/config requests, stops polling, disables instrumentation,
unhooks module loading and shuts down owned providers. Cleanup continues after
individual failures and reports them through AggregateError. Borrowed context
managers and propagators are preserved; registrations are removed only when they
belong to this host.

Application requests are still caller-owned: drain them before closing the host.
The host does not cancel an arbitrary in-flight HTTP request or alter Config's
original lack of a request timeout. Profiler support metadata is an explicit
input; optional TRPC/profiler implementations remain module boundaries. The
WorkBuddy service's HTTP-on/TRPC-off configuration can use the recovered path.
This SDK host is not yet the complete application DI/bootstrap graph.

Three compiled integration tests exercise:

- Real configuration pull, HTTP/Fetch spans, outer Logger emission and custom
  metric export through the public host, followed by exact HTTP method restoration
  and repeated close.
- Close during a held configuration response, waiting for initialization and
  cleaning the resources it creates afterwards.
- A pre-existing context manager/propagator and an injected provider shutdown
  failure, verifying that cleanup completes without removing borrowed resources.

Tests use owned loopback endpoints, native fetch, real Node HTTP, real polling
handles and captured providers/exporters. Their profiler metadata is explicit;
profiling is disabled. Run with:

```sh
npm run build
node --test packages/harness/dist/test/native-galileo-sdk-host.test.js
npm run smoke:galileo-transport -w @axonfire/harness
```

This is new integration code, not a claim that the original bootstrap has been
recovered verbatim. Source verification remains attached to each recovered
component; the exporter source verifier additionally checks that exposing
constants has not changed its captured factories or statements.

An additional REA pass on the emitted host (authored integration code, not an
original-bundle extraction) produced evidence
`ev_f3940eff8e01c8c3bbad1d8f2b4386c8fb766157768bb4d8aac6a5138dacdd0a`:
one parsed file, 1,812 AST nodes, zero parse failures, partial/truncated semantic
coverage at 750 nodes / 150 unknowns with a 45-second budget. Its imported
components were not copied into that static analysis directory; integration tests
and component source verifiers provide the separate runtime/fidelity evidence.

The [GalileoService SDK binding](native-galileo-service-module.md) now connects this host to the original service class. Its integration test verifies received startup trace, logs and metrics through real loopback transport; application DI and lifecycle orchestration remain explicit.
