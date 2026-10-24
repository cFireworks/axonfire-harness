# Native ACP connection assembly

`createNativeAcpConnectionsHost` exposes the recovered connection services as a runtime assembly. It creates the original stream manager, transport factory/manager, Agent registry, server, context, controller, connection guard, and security middleware. It does not import test helpers, start the installed application, or replace the original protocol SDK.

The original ten classes, 84 members, sixteen functions, initializers, timeouts, and routes remain in `native-acp-connections.ts`. The new host is an explicit adapter around those classes, not newly recovered product business logic.

## Embedding

```ts
import { createNativeAcpConnectionsHost } from
  "@axonfire/harness/protocol/native-acp-connections-host.js";

const connections = createNativeAcpConnectionsHost({
  runtime: {
    modules: parentModules,
    stdin: ownedInput,
    stdout: ownedOutput,
    env: explicitEnvironment,
  },
  dependencies: {
    logger, sessionManager, settingsManager, interruptionService,
    broadcastService, auditLog, requestMatcher, pathResolver,
    corsService, auth,
  },
  beforeClose: async () => {
    await stopParentAdmissionAndCancelOwnedAgentWork();
    // For stdio: end the input owned by this parent so the SDK reader ends.
    ownedInput.end();
  },
});
for (const [token, instance] of connections.bindings) parentDI.set(token, instance);
connections.agents.init();
connections.guard.initialize();
await connections.guard.setup();
await connections.start({ transport: "streamable-http" });
// Mount connections.controller/middleware through the parent's original HTTP
// routes, or explicitly choose { transport: "stdio" } with owned pipes.
await connections.close();
```

This is an embedding sketch, not a standalone production launch script. The parent must supply the original module namespaces, SDK, HTTP context, fresh Agent provider, logger, delegate service, and business dependencies. `bindings` supplies the three objects queried through connection DI; it does not mutate the parent's container. Starting streamable HTTP mode does not open a listener or authenticate a product account. The guard's original settings-loading lifecycle remains the parent's responsibility.

The returned raw components support explicit parent DI. Only the host's `start()` rejects calls once closing begins; callers must stop all raw-component dispatch before shutdown. The host does not pretend that exposed raw objects are revocable facades. It never closes borrowed settings/auth/session services, the HTTP listener, or borrowed standard output.

## Ownership and shutdown

The host observes original method Promises without replacing their return values. An isolated protocol overlay observes actual `AgentSideConnection` construction while retaining the SDK instance's prototype/constructor. No extra protocol or model-stream consumer is added. The original server installs one transport Subject subscriber; the host observes its detached async work on that owned Subject and reports failures during cleanup.

Shutdown is idempotent and follows these phases:

1. Call `beforeClose` to stop parent admission and finish/cancel borrowed Agent work. For stdio, the parent must end its input; the host does not destroy shared process streams.
2. Wait for already accepted transport creations to publish their owned streams.
3. End owned HTTP protocol readers, including readers whose state the original `close()` already removed. Pending SSE responses are retained independently of connection state until all their original write Promises settle, including concurrent writes to the same response. Run original transport/stream close methods. Disconnect unfinished owned HTTP responses so an SSE write waiting for `drain` can settle through its original close/error listener.
4. Wait for SDK connection closure and original history-flush/Agent-removal work. Borrowed session method receivers are retained.
5. Stop the original server, complete the owned transport Subject, revoke this host's connection tokens, clear remaining owned timers, and restore instance method descriptors. Cleanup failures are collected and reported after other release operations are attempted.

Two source boundaries matter: original `AcpServer.stop()` only clears its registry and ACP mode; original stream close deletes state without ending the SDK input reader. The host's EOF/response cleanup is an explicit lifecycle adaptation. It does not claim that the original product performs the same shutdown sequence.

Waiting for every write before ending responses would deadlock under SSE backpressure. A regression models `response.end()` that cannot finish buffered writes and verifies that disconnecting the owned response releases the original waiter. A parent callback or borrowed Agent that never completes can still prevent shutdown; no fake success or arbitrary timeout replaces that dependency.

## Evidence and verification

- Fixed original CLI SHA-256: `4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd`.
- REA 6.7.0 Evidence: `ev_0b774793860a023361df92e449ffe9000df42630725e129dfe7853ddda53b0de`. The input contains original connection declarations sliced at their recorded UTF-16 offsets plus provenance metadata. Original bootstrap was not executed.
- REA parsed one JavaScript file, visited 8,202 AST nodes, and recorded zero skipped JavaScript files or parse failures. Semantic coverage is **partial/truncated** under 750 nodes and 150 unknowns, globally and per file, with a 45-second per-source budget. Static relationships do not establish runtime equivalence.
- `verify:acp-connections` compares complete declarations and 29 original connection scenarios plus 10 modified SDK scenarios against the fixed sample. The component fixture now delegates construction/cleanup to this public runtime host on both sides.
- The existing 42 runtime tests cover the original connection/SDK cases and owned stdio/loopback HTTP behavior. Eleven additional host tests cover identity, subscriptions, borrowed resources, repeated close, discarded connection state, slow history flush, accepted creation, parent failure, detached observer failure, and SSE backpressure.

```sh
npm run check
npm run build
npm run smoke:acp-connections
npm run verify:acp-connections -w @axonfire/harness -- /path/to/codebuddy.js
```

The test Agent/network/clock boundaries remain explicit in the fixture. This migration does not convert the separate full ACP/AgentService parent test graph or default CLI/Web startup to a complete native product bootstrap. Actual parent authentication, all interceptors/configuration modes, daemon/independent-process recovery, production account storage, and Desktop HistoryStore remain follow-up work. See the [recovery ledger](recovery-status.md).
