# Native default interceptor assembly

`createNativeAgentInterceptorsHost` assembles the fixed sample's **31 actual `AgentRunInterceptor` registrations**: 30 from module 66545 and WorktreeContext from module 59233. The registration manifest records original decorator offsets, dependency tokens, optional bindings, and PostConstruct methods. It is distinct from the diagnostic name map: ChannelEvent is self-registered and Continue is an undecorated export, so neither belongs to this default token registry.

The recovered SandboxTurnTelemetry interceptor shares the original WeakMap with Sandbox. WorktreeContext now uses its complete original declaration, including optional manager/options handling and logging. Original class bodies remain unchanged; the host handles explicit composition and resource ownership.

## Parent integration

Supply an existing `createNativeAgentRunHost` result, the parent's original token namespaces through `getModule`, and its `isBound`/`get` container interface. Required dependencies must exist; missing dependencies produce an AggregateError identifying each property. Optional bindings stay absent when not bound. This adapter does not manufacture product services or start the application container.

```ts
const interceptors = createNativeAgentInterceptorsHost({
  execution,
  getModule: parentGetModule,
  container: parentContainer,
  filterRegistry: parentFilterRegistry,
});
await interceptors.start(); // original ImageCompression and Sandbox init methods
interceptors.attach();     // replace execution's provider after initialization
// Use execution with the supplied, fully implemented parent services.
await interceptors.close();
await execution.close();
```

The original ContainerBasedProvider applies component filters, caches its first discovery, and sorts positive priorities in descending order with stable ties. It honors `order` when `priority` is absent. Changing registrations after discovery does not automatically refresh its cached array. The host's local provider includes only its explicit registrations and supplied filters; it does not implicitly traverse a global parent registry. Worktree precedes the local declarations in the recovered dependency/source order; this is not a claim about all possible product bootstrap orders.

For `createNativeAgentRunHost({ interceptorContainer, ... })`, supply the parent's **module 63517** in `runtime.modules`. Provider construction must share the parent's Symbol identities or it cannot discover the parent's ComponentFilterRegistry. A preassembled `agentRunInterceptorProvider` remains supported.

## Ownership and limits

`start()` and `close()` are idempotent. Attachment requires successful initialization. The host owns the Sandbox session-ready subscription, releases it on close, and waits for accepted callbacks. It restores the previous execution provider only if its provider is still attached. It does not stop borrowed sandbox, session, account, model, or execution services. Close this interceptor owner before closing execution, and stop new dispatch in the parent first.

This is a public composition seam for the default registrations, not a production implementation of all their dependencies. Component tests explicitly supply test boundaries. The CLI/Web defaults have not been switched to a complete original product bootstrap; live authentication, all product services, and process/daemon ownership remain separate reconstruction work.

## Evidence and checks

All offsets refer to UTF-16 positions in the captured CLI with SHA-256 `4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd`.

- Provider verification compares three full module factories and two registry/creator classes, with eight original/recovered behavior pairs.
- Registration verification parses both original enclosing modules and checks 31 token registrations, 86 injected properties including AgentService, and two PostConstruct methods. It compares the full Worktree declaration AST and nine behavior pairs.
- Agent-run verification includes the previously omitted SandboxTurnTelemetry declaration and shared WeakMap scenarios.
- Host tests cover preflight, initialization/attachment, caching/filtering, parent token identity, callback draining, and provider restoration.

```sh
npm run build
npm run smoke:agent-run
npm run verify:component-providers -w @axonfire/harness -- /path/to/captured/codebuddy.js
npm run verify:agent-run-registration -w @axonfire/harness -- /path/to/captured/codebuddy.js
npm run verify:agent-run -w @axonfire/harness -- /path/to/captured/codebuddy.js
```

REA 6.7.0 analyzed the original inert provider fragments: evidence `ev_628f20cb1e329723acb5b7fd030534d972f3ae9b2d3d46ea888489d1c6124e15`, 745 AST nodes, one parsed file, no skipped files or parse failures. Semantic coverage is reported as **unknown**, with truncation false. Neither that static result nor the finite behavior comparisons establish whole-product equivalence. No original bootstrap is executed by these verifiers.
