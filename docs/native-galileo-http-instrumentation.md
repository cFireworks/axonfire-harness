# Galileo Node HTTP instrumentation

`createNativeGalileoHttpInstrumentation` restores full factory 9808 plus the
module-definition and RPC metadata factories 43408/46077. It shares the recovered
instrumentation base and module-hook machinery with Fetch instrumentation and
uses the recovered telemetry APIs, context, resources and metric providers.
All three factories retain exact source ranges/hash and structural AST checks.

The captured HTTP class patches outgoing request/get and incoming Server.emit,
retaining HTTP/HTTPS module definitions, propagation, hooks, metric collection,
request/response/error handling and original disable behavior. The factory
requires an explicit global surface and parent modules; importing it does not
activate an instrumentation instance.

A source-paired end-to-end scenario runs the recovered SetupGalileo with real
remote Config, HTTP and Fetch classes. A local configuration receiver supplies
sampling/metric settings before initialization. Node HTTP and native Fetch then
call a separate owned application server. The OTLP receiver gets four real spans:
one client and one server span per request. The test asserts shared trace IDs,
server parentSpanId matching its client spanId, injected trace headers and
unchanged response bodies.

The collector hostname is distinct from the application hostname, exercising
Setup's collector exclusion. Incoming collector requests are explicitly ignored.
Fetch is wrapped on an owned global object; Node HTTP methods are actually
patched. Cleanup disables both instrumentations, unhooks CommonJS/ESM hooks,
stops remote Config polling and shuts down all providers. It verifies exact
restoration of HTTP request/get/Server.emit and unchanged host-global fetch.

```sh
npm run verify:galileo-http-instrumentation -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run smoke:galileo-transport -w @axonfire/harness
```

REA evidence: `ev_294efc714409d94a9edf89dcd0488545db99fe88d66334ef388b9c3f2f1d4f83`.
The inert extraction parsed three files, 14,698 AST nodes and zero parse failures.
Semantic coverage is partial/truncated at 750 nodes and 150 unknowns with a
45-second budget. HTTPS source is retained but a TLS handshake is not separately
exercised here. TRPC, profiling and the application's default native service
graph remain incomplete. This validates SDK assembly, not full application
bootstrap.
