# Galileo sampling and span batching

`createNativeGalileoTrace` restores Galileo's complete trace-registration
statement and compression enum, plus six full factories: sampling decisions,
always-on/off samplers, parent-based sampler, trace-ID ratio sampler and
BatchSpanProcessor. Exact bundle hash, UTF-16 ranges and structural AST checks
cover all captured statements and factories.

The Galileo sampler preserves the original order: disable tracing first;
exclude configured caller/callee methods; optionally inherit parent sampling;
then match remote attribute rules; finally apply configured random sampling.
The captured ratio sampler validates trace IDs and normalizes its ratio before
comparing the XOR of trace-ID words against its threshold. Parent-based sampling
uses actual recovered span-context helpers for local and remote parents.

Registration constructs a real Galileo exporter and batch processor with gzip,
concurrency 30, a 10-second export timeout, queue size 100, batch size 20 and a
5-second scheduled delay. It passes the original sampler/resource/processors to
an explicitly supplied BasicTracerProvider and registers an enabled ALS manager.
The [BasicTracerProvider factory](native-basic-tracer.md) now supplies the
recovered provider and tracer/span dependencies. The registration test uses a constructor/registration recorder;
the additional BasicTracerProvider integration verifies real tracer creation,
registration and HTTP export.

Three original/reconstructed scenario pairs verify ratio normalization and
invalid IDs, local/remote parent decisions, Galileo sampling precedence and
processor configuration, and real batch export. Sampled span fixtures flow
through the recovered BatchSpanProcessor, exporter, serializer and gzip HTTP
transport; unsampled spans are omitted. The exporter observes suppressed trace
context and the caller's context is restored. Node timers are real and processors
are explicitly flushed/shut down. Span fixtures are not a recovered Span class.

```sh
npm run verify:galileo-trace -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run smoke:galileo-transport -w @axonfire/harness
```

REA evidence: `ev_6d35cf70c5fe134c2c41b193581590e362c3f0f25ff941c36ff4fad97ebdc063`.
The inert extraction parsed seven files, 2,405 AST nodes and zero parse failures.
Semantic coverage is partial/truncated with 750 node / 150 unknown limits and a
45-second budget. The [HTTP/Fetch integration](native-galileo-http-instrumentation.md) now runs
through recovered SetupGalileo. Default application composition remains incomplete.
