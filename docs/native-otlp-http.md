# Native OTLP HTTP configuration

`createNativeOtlpHttp` restores 26 complete HTTP configuration statements from
module 92763 and three complete baggage factories (44874, 20662, 3250). All
source ranges use UTF-16 offsets in the fixed captured CLI, with SHA-256 and
structural AST verification.

Explicit user options take priority over signal-specific environment settings,
general environment settings and defaults for endpoint, timeout and compression.
Signal endpoints are normalized as URLs; general endpoints receive the resource
path. Invalid explicit URLs and timeouts throw. Invalid environment values warn
and fall back. Defaults include a 10-second timeout, concurrency limit 30,
no compression, localhost port 4318 and a keep-alive agent.

Header merging follows its own original order: environment, user, then default
headers, so defaults win conflicts. User values become strings; undefined values
warn and are omitted. The merged object persists across calls, retaining keys
that later inputs omit; default headers are captured when the merger is created.
Baggage parsing decodes percent escapes, skips empty values, uses the last
duplicate key, and throws on malformed percent encoding.

Legacy `keepAlive` conversion mutates the supplied `httpAgentOptions` when its
own keepAlive value is absent. Explicit agent keepAlive wins. Passing metadata
to the HTTP options converter produces the original warning.

The runtime takes an explicit process environment and diagnostics. Module 72912
is a narrow namespace bridge exposing the actual recovered baggage helpers;
its unrelated reexports are not restored here. The baggage factory's diagnostic
API remains an explicit supplied parent. Importing this module neither reads
the host environment nor opens network connections.

Five source/reconstructed scenario pairs verify precedence and defaults,
signal/general fallback, malformed inputs, persistent dynamic headers, legacy
agent mutation and immutable baggage operations. This is configuration-layer
verification; concrete Galileo exporter constructors and SDK assembly are still
pending. The existing transport and export tests cover their own HTTP paths.

```sh
npm run verify:otlp-http -w @axonfire/harness -- /path/to/codebuddy.js
npm run smoke:galileo-transport -w @axonfire/harness
```

REA evidence: `ev_4afda3d19a4c8e3325c06abc5b5a6f2f07b6dbde4878b18b214614cb3187be0e`. The inert extraction contains 2445 AST nodes in 4 parsed JavaScript files with no parse failures. Coverage is partial/truncated under 750-node and 150-unknown limits.

The [trace/log exporter constructors](native-galileo-exporters.md) are now
connected to these recovered components and tested with real loopback delivery.
The metric exporter and upper-level SDK setup remain separate work.
