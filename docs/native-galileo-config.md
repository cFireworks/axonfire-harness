# Galileo remote configuration client

`createNativeGalileoConfig` restores the complete Config factory 86097 and its
captured dependency closure: 77 full factories covering the embedded Axios
client, redirects, proxy selection, multipart/form utilities, MIME data and
supporting modules. Node builtin imports are explicit through the supplied
`require` boundary. Source hash, UTF-16 ranges and structural AST comparisons
cover every factory. The wrapper caches module objects so CommonJS
`module.exports` reassignment is visible to subsequent imports.

`startPull()` awaits an initial POST and then installs a 60-second interval.
The request preserves platform, object name and target/namespace/environment
resource fields. Successful responses replace trace dyeing rules and histogram
buckets, using null for absent/falsy fields. Failed requests are logged and leave
the previous state intact. `stopPull()` clears the currently stored interval and
sets its handle to null. No timeout, retry policy, deduplication, unref or new
shutdown semantics are added to the original Config class.

Two original/reconstructed scenario pairs exercise the actual captured HTTP
client against owned loopback servers. One follows a 307 redirect while retaining
the POST body, decompresses a gzip JSON response, applies subsequent updates,
retains data after HTTP 503 and clears data after an empty successful response.
The second supplies the real Config class to recovered SetupGalileo and verifies
that fetched histogram boundaries reach a real MeterProvider and its exported
histogram. HTTP, redirects, serialization and compression are real; polling
interval callbacks are controlled explicitly rather than waiting 60 seconds.

Tests provide an isolated process environment without proxy settings and permit
only Node builtin imports. They stop Config polling and shut down all providers.
This Config-specific scenario retains instrumentation adapters. The additional
[HTTP/Fetch integration](native-galileo-http-instrumentation.md) now exercises
real automatic patching together with this Config client.
Full SDK default composition and the native application graph remain unfinished.

```sh
npm run verify:galileo-config -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run smoke:galileo-transport -w @axonfire/harness
```

REA evidence: `ev_58b650179a923635807883dd3d94a53e59800b2edc519787a8b42c23f48d47f4`.
The inert extraction parsed 77 files, 28,371 AST nodes and zero parse failures.
Semantic coverage is partial/truncated at 750 nodes and 150 unknowns with a
45-second budget. MIME data and auxiliary HTTP paths retain source fidelity;
these scenarios do not claim exhaustive behavior coverage of the embedded client.
