# Galileo outer logger

`createNativeGalileoLogger` restores the complete outer logger class, level
parser and enums, circular/error stringification, and current-span sampling
check from module 92763. Three complete statements and three complete variable
declarators retain original UTF-16 ranges and structural AST verification against
the pinned bundle. Parent bindings are explicit; importing this factory does not
install a console hook or contact a telemetry endpoint.

Log calls retain the original level filtering, sampled-span override,
all-or-nothing string attribute validation, user-agent enrichment and mutable
base attributes. Every call increments the self-monitor start counter before
validation/filtering; only emitted records increment the success counter.
`sampledInfo` preserves the original ordinary info dispatch. Console interception
retains the original call-site exclusions and forwards to the supplied console.

The source-paired integration exercises the actual recovered LoggerProvider,
batch processor, exporter, serializer and Node HTTP transport against an owned
loopback receiver. It checks filtering, invalid attributes, sampled debug logs,
trace identity, user-agent propagation, counters and circular serialization.
Clock-derived timestamps are excluded from comparison. Self-monitor counters are
an explicit recording fixture, and console interception is installed only on an
owned object; console output and call-site exclusions are not independently
verified. The [self-monitor factory](native-galileo-self-monitor.md) now restores provider
construction and has an additional real-counter integration with this logger.
The [SetupGalileo entry point](native-galileo-setup.md) is now recovered.
The default application graph remains unfinished.

```sh
npm run verify:galileo-logger -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run smoke:galileo-transport -w @axonfire/harness
```

REA evidence: `ev_92cfa7fb92829ddb8b35c5dd5151460771e999c5a99462703b70055d903e71fa`.
The inert extraction parsed one file, 1,299 AST nodes and zero parse failures.
Semantic coverage is partial/truncated at 750 nodes and 150 unknowns, with a
45-second analysis budget. REA analysis is supplementary to exact AST checks and
paired runtime observations; it does not establish complete SDK recovery.
