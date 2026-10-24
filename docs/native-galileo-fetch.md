# Galileo Fetch instrumentation

`createNativeGalileoFetch` restores the complete FetchInstrumentation factory
8009 and its instrumentation-base/module-hook dependency closure: 88 complete
factories. These include wrapping utilities, module-hook machinery, semver and
supporting helpers. The already recovered telemetry APIs, context, enums and time
helpers are explicit parents. All factories retain their original hash/ranges and
structural AST checks.

The caller supplies the global surface whose `fetch` is wrapped. The captured
implementation preserves duplicate-enable handling, disable/restore behavior,
request normalization, tracing and propagation, ignored request hooks, body and
header capture, response/error handling, and client/self-monitor metrics. It uses
the recovered instrumentation base and actual module-hook implementation, rather
than a replacement base class.

A source-paired integration wraps Node's real native fetch on an owned global
object. Real requests exercise a JSON POST via Request, HTTP 500, an ignored
request and a server-induced socket failure. Recovered providers generate actual spans and
metrics that are flushed to a loopback OTLP receiver. The test verifies propagated
trace headers, preserved request body, ignored-request bypass, three generated
spans and three started-client metric observations. It checks idempotent enable,
disable and that the host-global fetch reference remains unchanged. Real module
hooks are tracked and explicitly unhooked after the test.

The globals object inherits native web classes; this tests real network fetch,
not an HTTP stub. Span IDs, request URLs and timing-derived data are excluded from
paired comparisons. The outer Setup fixture supplies real providers but still
uses its existing HTTP instrumentation adapter. The additional [HTTP/SDK integration](native-galileo-http-instrumentation.md)
now runs Setup's actual Fetch branch alongside real Node HTTP patching. TRPC, profiler and default
application graph recovery are still incomplete.

```sh
npm run verify:galileo-fetch -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run smoke:galileo-transport -w @axonfire/harness
```

REA evidence: `ev_9a2b068abcb9296df259363e3649468bf54976c0eb2873a02cf7996c38f5b01d`.
The inert extraction parsed 88 files, 32,512 AST nodes and zero parse failures.
Semantic coverage is partial/truncated at 750 nodes and 150 unknowns with a
45-second budget. This preserves auxiliary module-hook paths without claiming
that every CommonJS/ESM loading variant has independent runtime coverage.
