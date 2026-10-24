# Native OTLP JSON serializers

`createNativeOtlpSerializers` restores the captured trace, metrics and log JSON
serializers from module 92763. It includes 42 complete source statements plus
three complete helper factories: 41437 (time), 77047 (hex conversion), and 11447
(value types). Fixed SHA-256 and UTF-16 ranges are embedded in the module and
checked by structural AST comparison against the captured CLI.

Trace and log records group by resource object identity, then instrumentation
scope identity fields. The JSON serializers preserve hex trace/span IDs and
encode nanosecond timestamps as decimal strings. Attribute conversion retains
the original scalar, array, nested-object, byte-array and nullish behavior.
Metrics support sum, gauge, histogram and exponential histogram data, including
aggregation temporality and integer/double point values. Response parsing uses
the original JSON parser, including its failure behavior.

The factory exposes `trace`, `metrics` and `logs`, each with `serializeRequest`
and `deserializeResponse`, alongside the recovered request conversion helpers.
It requires explicit parent namespaces for module 32047 (performance) and 70000
(the environment module imported in a shared declaration). Tests supply actual
Node performance and an empty namespace for the unused environment import.
The three recovered helper factories execute without the application bootstrap.

Five original/reconstructed scenario pairs verify trace grouping and precise
fields, all metric point shapes, structured logs, binary/time encoders and
response parsing, and a real loopback HTTP delivery through the recovered gzip
transport. The receiving server parses and checks the generated trace JSON;
its response passes through the original deserializer. SDK records are explicit
fixtures. Provider-generated records and concrete exporter wrappers,
`SetupGalileo` and default application assembly remain separate integration work.

```sh
npm run verify:otlp-serializers -w @axonfire/harness -- /path/to/codebuddy.js
npm run smoke:galileo-transport -w @axonfire/harness
```

REA evidence: `ev_db014820fbe2b1b9d135e95e68bd4a151e9f40e8ec94db8fc7ce7bdd3c7b43c4`. The inert extraction has 4316 AST nodes across 4 parsed JavaScript files, with no parse failures.
Semantic coverage is partial/truncated under the 750-node and 150-unknown limits.

The separately recovered [export delegate](native-otlp-export.md) now connects
the log serializer to the transport in a real loopback delivery test.
