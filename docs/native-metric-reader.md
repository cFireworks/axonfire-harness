# Native metric readers

`createNativeMetricReader` restores the complete shared declaration containing
MetricReader and PeriodicExportingMetricReader from captured module 92763,
plus complete error-handler and timer factories 60002 and 61549. The declaration
also retains its original predicate/attribute-selector helpers; these ancillary
helpers are not separately exposed or behavior-verified. Fixed SHA-256 and
UTF-16 ranges support AST comparison of the entire declaration and both factories.

MetricReader binds once to an SDK producer, combines its scope metrics and
errors with external producers, and retains the SDK producer's resource.
It delegates aggregation, temporality and cardinality selection. Shutdown marks
the reader closed only after its hook succeeds; a timeout leaves it retryable
and does not cancel the underlying hook. Calls after shutdown retain the
original warning/error behavior.

The periodic reader validates intervals/timeouts and registers an unreferenced
interval when bound. Force flush runs collection/export before flushing the
exporter. Shutdown clears the interval, performs that same flush sequence, then
shuts down the exporter. Empty scope collections skip export. Collection errors,
resource readiness, export failures and timeout handling retain the captured
control flow. Timed-out work is not cancelled by the timeout helper.

Five original/reconstructed scenario pairs cover producer binding and merging,
timer registration and lifecycle order, invalid intervals/empty export/failure
handling, retry after shutdown timeout, and actual aggregate delivery through
the recovered metric exporter to a loopback HTTP receiver. The lifecycle tests
use controlled interval handles; they do not establish wall-clock periodic
scheduling. The real delivery test invokes forceFlush explicitly.

Aggregation and timeout helpers come from the already recovered metric module.
Diagnostics remain explicit adapters. The internal export bridge now uses the
[recovered context API and ALS manager](native-export-context.md), including
original context suppression and restoration. SDK producer collection is a fixture, so
this is not yet a complete MeterProvider integration. No original telemetry
endpoint is contacted. MeterProvider, SDK logger, SetupGalileo and default
application assembly remain unfinished.

```sh
npm run verify:metric-reader -w @axonfire/harness -- /path/to/codebuddy.js
npm run smoke:galileo-transport -w @axonfire/harness
```

REA evidence: `ev_0c20069ce6b63c01fa25e2e47edcf544f8269e7c571d92fb0b5059c56c695722`. The inert extraction contains 3855 AST nodes in 3 parsed files with no parse failures. Semantic coverage: `partial`; truncated: `true` under 750-node and 150-unknown limits.

The [MeterProvider integration](native-meter-provider.md) now binds these
readers to real recovered collectors and instruments, with loopback delivery.
Its Resource defaults/merge boundary remains explicit.
