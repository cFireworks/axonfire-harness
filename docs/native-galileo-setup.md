# SetupGalileo orchestration

`createNativeGalileoSetup` restores the complete SetupGalileo statement, its
configuration/profiling validators, machine and header helpers, profiler URL
routing and instrumentation registration helpers. Five complete statements and
six complete declarators retain exact source ranges. The complete LogsAPI
factory 64270 supplies its proxy/global logger behavior through an explicitly
owned registry. All eleven regions and the module have structural AST checks
against the pinned bundle.

Setup retains the original order: validate configuration; optionally construct
and start the remote configuration client; construct self-monitor, trace and
business metric providers; create requested HTTP/TRPC/Fetch instrumentations;
register instrumentations; optionally start profiling. It preserves hook merging,
collector-host exclusion, user-extension filtering, environment/resource identity
and the original profiling branches. The function returns undefined, does not
return a shutdown handle and does not add rollback after a partial failure.

In particular, disabling remote configuration leaves a null remote object that
the business metric registration dereferences. The recovered entry point retains
this original failure. Config validation also rejects explicitly disabling both
HTTP and TRPC even if Fetch is enabled. These behaviors are source observations,
not newly introduced configuration policies.

Three source-paired scenarios check validation and helper behavior, LogsAPI proxy
activation, actual provider initialization and real trace/metric HTTP export,
and the disabled-remote failure after partial initialization. The integration
uses recovered self-monitor, trace and metric assembly with actual SDK storage,
ALS, Span, batching, serializers and transport. It checks configuration pull
before provider creation, instrumentation provider wiring, selected incoming and
outgoing hooks, and real emitted span/counter payloads.

The original setup scenarios use remote Config and HTTP/Fetch constructor
adapters. The additional [remote Config integration](native-galileo-config.md)
now supplies the captured HTTP client and verifies remotely fetched buckets. The test does not monkey-patch HTTP or Fetch. Profiler support is an
explicit parent and profiler activation is not exercised. The additional [HTTP/Fetch integration](native-galileo-http-instrumentation.md)
now connects both real instrumentations and remote Config through Setup. TRPC,
profiling and application-default composition remain incomplete. Tests redirect all
export traffic to an owned loopback receiver and explicitly shut down providers
created before success or failure; this cleanup is outside the captured Setup.

```sh
npm run verify:galileo-setup -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run smoke:galileo-transport -w @axonfire/harness
```

REA evidence: `ev_0f270cf6328caf8f4eae15043c5909c2e96984bdbd2ce9b8c1a07fddbac3e0c9`.
The inert extraction parsed two files, 3,769 AST nodes and zero parse failures.
Semantic coverage is partial/truncated at 750 nodes and 150 unknowns with a
45-second budget. The application's native default service graph is still
unfinished.
