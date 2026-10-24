# Native Galileo service

`createNativeGalileoService` restores the complete `GalileoServiceImpl` class,
its decorators and static state, the OTLP hostname predicate, and decorator
helpers from module 92763 of the captured CLI. The four original statements
retain their UTF-16 source ranges in `GALILEO_SERVICE_REGIONS` and are checked
against the fixed bundle SHA-256. This is a service extraction, not recovery of
the entire 197,458-character module containing the embedded Galileo SDK.

For the real SDK composition, use [GalileoService SDK binding](native-galileo-service-module.md), which supplies recovered configuration, providers and proxy dependencies while keeping application DI explicit.

## Lifecycle and behavior

- `initialize()` starts asynchronous configuration and SDK setup. Any nonempty
  `DISABLE_GALILEO` value disables it, including `"0"`. Invalid resolved settings
  also disable initialization. `onStart()` does not await initialization;
  `waitReady()` provides a bounded wait.
- Setup captures meter, trace and logger flush targets, creates a startup span,
  subscribes to authentication and configuration updates, and attaches the
  primary trace processor when supported.
- Duration histograms and counters are cached by name. Global patch, version
  and user dimensions override caller dimensions. Logs normalize attribute
  values to strings; nullish values become empty strings.
- Flush ends the startup span and flushes all three providers concurrently.
  Shutdown flushes all providers before closing them, catches per-provider
  failures, and caches shutdown after readiness. Timeout resolution does not
  cancel provider work; a zero budget still invokes provider methods.
- A changed configuration fingerprint shuts down the current generation and
  rebuilds valid routes. Invalid routes remain shut down. `onStop()` removes
  subscriptions and ends the startup span; provider shutdown is separate.
- Proxy installation wraps the supplied HTTPS module's `request` once per
  generated class and rewrites only the configured collector hostname. The
  original URL/options overload handling and proxy precedence are retained.

## Explicit runtime boundaries

The factory requires a process boundary, `SetupGalileo`, a Galileo logger
constructor, and parent module namespaces. It does not activate on import.
The embedded SDK setup, SDK logger, OpenTelemetry implementations, product
configuration resolver, authentication, OS information and DI remain supplied
boundaries. Tests use owned fixtures for these roles and never patch the host
HTTPS module or send telemetry.

Seven paired scenarios compare original and reconstructed service statements.
They cover disable/configuration handling, setup and instruments, flush and
shutdown failures, configuration rebuild, proxy overloads, timeout behavior,
and a combined original Galileo + metrics + TraceService + telemetry-exit
path. That combined test verifies service orchestration, not collector delivery.

```sh
npm run verify:galileo-service -w @axonfire/harness -- /path/to/codebuddy.js
npm run smoke:process-lifecycle -w @axonfire/harness
```

REA evidence: `ev_5fd83489d4143a42ab7c5765f253df396ae12602211fbe39f07d067853225685`.
The inert extraction contains 2,690 AST nodes in one parsed JavaScript file,
with no parse failures. Semantic coverage is partial/truncated under the
750-node and 150-unknown limits; static analysis did not execute the application.

The separately recovered [encrypted HTTP transport](native-galileo-transport.md)
now has real loopback KMS and delivery tests. It is not yet assembled into the
SDK setup boundary described above.
