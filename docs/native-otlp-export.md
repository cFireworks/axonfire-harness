# Native OTLP export lifecycle

`createNativeOtlpExport` restores eight complete statements from captured module
92763 and the complete export-result enum factory 36275. They contain the
exporter base, export delegate, bounded promise queue, error type and partial
success response handler. Fixed SHA-256 and UTF-16 source ranges accompany
structural AST checks of every recovered statement and factory.

The delegate takes a serializer, transport and promise handler. The network
factory builds the original bounded queue from `concurrencyLimit` and passes
`timeoutMillis` to the transport. `OTLPExporterBase` forwards `export`,
`forceFlush` and `shutdown` to that delegate.

## Original behavior

- A full queue immediately invokes the callback with a failed result. A nullish
  serialized payload also fails. Synchronous serialization exceptions propagate
  synchronously rather than becoming callback results.
- Transport success reports success even if response deserialization fails;
  the diagnostic logger receives that failure. Nonempty partial-success objects
  also warn, including an object whose rejected-record count is zero.
- Transport failures and rejected promises become failed export results.
  Retryable and unknown statuses produce the captured OTLP exporter error.
- Flush waits for queued promises. Shutdown waits for flush and then calls the
  transport shutdown method. It does not add a new shutdown cache or guard.
- The queue removes both fulfilled and rejected promises. Its own `awaitAll`
  rejects if a queued promise rejects; normal delegate failures are handled by
  the callback path before reaching that queue promise.

## Verification and boundaries

Six original/reconstructed paired scenarios exercise queue saturation and
pending shutdown, result mappings, null payloads and synchronous failures,
response warnings, rejected queue entries, and real loopback log delivery.
The last test combines the recovered exporter base/delegate, log serializer
and HTTP transport, verifies the received OTLP JSON, flushes and shuts down.

Diagnostics are explicit test adapters. Ten parent namespaces imported in a
shared original declaration are supplied as empty namespaces because this
recovered path does not use them; their implementations are not claimed here.
The export-result enum is recovered from the actual factory. SDK records are
fixtures, and no original telemetry endpoint is contacted.

Galileo's concrete exporter constructors, provider
setup, SDK logger and default application assembly still need integration.

```sh
npm run verify:otlp-export -w @axonfire/harness -- /path/to/codebuddy.js
npm run smoke:galileo-transport -w @axonfire/harness
```

REA evidence: `ev_ef6294fffac7714d6de7ff6b119528219cab32f858116529bbbbebf4e770c4ce`. The inert extraction contains 2177 AST nodes in 2 parsed JavaScript files with no parse failures. Coverage is partial/truncated under 750-node and 150-unknown limits.

[HTTP option resolution](native-otlp-http.md) is now independently recovered
and source-verified; concrete exporter construction remains to be connected.

The [trace/log exporter constructors](native-galileo-exporters.md) are now
connected to these recovered components and tested with real loopback delivery.
The metric exporter and upper-level SDK setup remain separate work.
