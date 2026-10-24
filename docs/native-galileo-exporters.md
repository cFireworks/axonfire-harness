# Native Galileo trace and log exporters

`createNativeGalileoExporters` restores the original trace and log exporter
constructors, HTTP option helper and shared header declaration from module
92763. It also restores the complete Galileo SDK constants and enum factories
15086 and 15183. These retain SDK version `0.3.17-beta.1` and the original
resource names and defaults. Fixed SHA-256 and UTF-16 source ranges accompany
AST comparison of all four statements and both factories.

The composition factory accepts the recovered export, HTTP configuration,
serializer and transport namespaces. Its original constructors bind those
components together; they do not substitute a generic exporter implementation.
Trace and log signals use their original signal names and resource paths.
Headers include the original Galileo User-Agent and JSON Content-Type, with
the original defaults-last precedence. Runtime construction is explicit and
has no import-time activation or automatic telemetry delivery.

Two source/reconstructed paired scenarios cover both constructors. The first
creates the real recovered exporters, sends trace and log records through the
full recovered configuration/delegate/serializer/gzip/HTTP chain to ephemeral
loopback servers, checks paths, headers and OTLP payloads, then flushes and
shuts down. The second checks signal-specific endpoints, timeout, concurrency,
encryption disablement and constructor validation. It creates no outbound
requests. Earlier transport tests separately cover real RSA/KMS encryption.

The supplied component namespaces are actual recovered modules. Their remaining
diagnostic, performance and unused-parent boundaries are explicit in the
component documentation. SDK records remain fixtures. The [metric exporter and aggregation base](native-galileo-metric-exporter.md)
are now recovered separately. Provider creation, SDK logger, SetupGalileo and
the default application graph are not yet assembled here.

```sh
npm run verify:galileo-exporters -w @axonfire/harness -- /path/to/codebuddy.js
npm run smoke:galileo-transport -w @axonfire/harness
```

REA evidence: `ev_0b7742626831b2cd8d7ccfb7e9a34d5cd68e9eb222f47a55c7fc2d4b3971c5a6`. The inert extraction contains 1002 AST nodes in 3 parsed JavaScript files with no parse failures. Semantic coverage is reported as unknown, not truncated, under 750-node and 150-unknown limits.
