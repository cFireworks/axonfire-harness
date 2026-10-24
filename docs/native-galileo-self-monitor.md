# Galileo self-monitor providers

`createNativeGalileoSelfMonitor` restores the complete
`registerSelfMeterProvider` and `getSelfMeterProvider` declarators from captured
module 92763, plus its compression enum statement. Original UTF-16 offsets,
pinned bundle hash and structural AST checks cover all three regions.

Every call creates a separate recovered MeterProvider with a periodic reader,
two sum views for `node_instrument_start` and `node_instrument_end`, and a
Galileo metric exporter. The original configuration uses delta temporality,
gzip, concurrency 30, a 30-second interval and a 20-second export timeout.
Resource identity remains `PCG-123.galileo.otp` / `galileo.otp`; the resource
namespace is always Production, while the effective environment becomes Formal
only when the caller's namespace is Production. No cache or global registration
is added. Callers own the returned provider and its shutdown.

A paired original/reconstructed integration uses actual recovered providers,
readers, resources, aggregators, exporters, context and Node HTTP transport.
Two flushes verify delta counter values of 2 and 3. A recovered outer Galileo
logger then creates its self-monitor provider through this factory: one filtered
info call and one emitted warning produce start=2 and end=1 in the received
metric payload. The receiver verifies gzip and metric temporality. The reader
uses a real unreferenced Node timer; the test explicitly flushes and shuts down
all providers. It does not wait 30 seconds to test scheduled firing.

Tests redirect collector constants to owned loopback endpoints and disable
encryption; encryption has separate transport coverage. Runtime diagnostics and
context registries are local. The [SetupGalileo integration](native-galileo-http-instrumentation.md)
now constructs these providers. Default native DI/bootstrap remains unfinished. Importing this factory does
not create providers or make network requests.

```sh
npm run verify:galileo-self-monitor -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run smoke:galileo-transport -w @axonfire/harness
```

REA evidence: `ev_68cfc13745f0aa6a10297332681b503f6baabbf3d47faaea5c90c43649103cfd`.
The inert extraction parsed one file, 217 AST nodes, zero parse failures.
Semantic coverage is reported as unknown, not truncated (750 node / 150 unknown
limits, 45-second budget). Exact AST checks and source-paired runtime results
provide separate evidence of the restored behavior.
