# Native export context

`createNativeExportContext` restores the original suppressed `_export` function
from module 72912 and nine complete factories: context suppression (65890),
context facade (33835), ContextAPI (57717), immutable context values (98902),
AsyncLocalStorage manager (1801), API registry (70647), diagnostics (58583),
async context binding (87819), and diagnostic levels (79232).

The original function runs the exporter under a derived context with tracing
suppressed and resolves from its callback. Node AsyncLocalStorage preserves
that context across asynchronous work; callers regain their prior context.
The manager retains function receivers/arguments and the original EventEmitter
listener wrapping/removal behavior. Context values remain immutable. Registry
version checks, duplicate registration, diagnostic level filtering and
component logging use the captured implementations.

The factory requires an explicit registry object and Node `async_hooks` and
`events` namespaces. Tests use a fresh registry per fixture, leaving the host's
OpenTelemetry global registry untouched. Manager installation remains explicit.
The broad 47763 API namespace is bridged only to the recovered root context and
context facade used here; its other APIs are not claimed. The alternative
AsyncHooksContextManager is not included.

Four source/reconstructed scenario pairs verify immutable/no-op/ALS context
behavior, asynchronous export suppression and caller restoration, function and
EventEmitter binding, and registry/diagnostic behavior. Metric reader tests now
use this original context-aware export bridge rather than a direct callback
adapter. They assert suppression inside export and retain real loopback metric
delivery tests. Node builtins are real; producer collection and reader diagnostic
sinks remain explicit fixtures. Full MeterProvider and application assembly are
still separate work.

```sh
npm run verify:export-context -w @axonfire/harness -- /path/to/codebuddy.js
npm run smoke:galileo-transport -w @axonfire/harness
```

REA evidence: `ev_ee78f09d636d8541a33e5e2da22c3e1fcbb7bbaae27ab2174ed2abeac19abf03`. The inert extraction contains 3455 AST nodes across 10 parsed JavaScript files with no parse failures. Semantic coverage: `partial`; truncated: `true` under 750-node and 150-unknown limits.
