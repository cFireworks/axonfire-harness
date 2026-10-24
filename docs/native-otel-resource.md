# Native OpenTelemetry Resource

`createNativeOtelResource` restores five complete factories: Resource (78766),
semantic resource constants (42152), SDK identity (80221), default service name
(39858), and constant-map construction (92321). Fixed SHA-256 and UTF-16 ranges
support structural AST comparison of every factory.

The captured OpenTelemetry SDK identity is `1.30.1`; this is separate from the
Galileo SDK's `0.3.17-beta.1`. Default resources include the original SDK name,
language and version, plus `unknown_service:` followed by the supplied process
argv0. Empty resources retain the captured singleton behavior.

Async attributes merge over synchronous attributes when settled. Access before
settlement logs the original error; rejected attributes log a debug diagnostic,
clear the pending flag and preserve synchronous values without rejecting the
wait helper. Merging resources preserves the original precedence: left sync,
left async, right sync, right async. Neither input resource is mutated by merge.

Four original/reconstructed scenario pairs verify defaults, async completion,
rejection and merge ordering. MeterProvider's five source pairs now use actual
Resource instances and the default resource merge path, replacing the previous
plain-resource/merge-disabled fixture. Real HTTP delivery asserts both the user
service name and captured OpenTelemetry SDK version in serialized resource
attributes. Diagnostics remain an explicit sink and process input is explicit;
this module does not run resource detection or activate telemetry on import.
SDK logger, SetupGalileo and default application assembly remain separate work.

```sh
npm run verify:otel-resource -w @axonfire/harness -- /path/to/codebuddy.js
npm run smoke:galileo-transport -w @axonfire/harness
```

REA evidence: `ev_c75f8f2bac6695f05383aaf0a19a3fea3c38c2f0f0dab3af5e3af7ba1a79c55b`. The inert extraction contains 2992 AST nodes in 5 parsed files, with no parse failures. Semantic coverage: `partial`; truncated: `true` under 750-node and 150-unknown limits.
