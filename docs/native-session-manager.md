# Complete native SessionManager

`createNativeSessionManager()` exposes the complete original Desktop `SessionManager` class and its coordinator state. Its 278 class members are retained as one original declaration, including instance initialization, configuration and backend replacement, prompts, cancellation, input resolution, queues, history, records, reclamation, plugin continuations and POI entrypoints. Callers use the original `initialize(options)` and `setEventSink(sink)` APIs; the factory does not attach a collection of replacement methods.

## Source and dependency closure

The module includes 177 complete original declarations: 147 from `initialize.js` and 30 from `workbuddy-auth-product-coordinator.js`. Source hashes and UTF-16 ranges are exported as `SESSION_MANAGER_SOURCE`. The fixed hashes are:

- `initialize.js`: `528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19`.
- Coordinator: `8624215504229c4b6190f5c2172da270e015cc96871e90b261786f047e4c6e78`.

REA evidence `ev_f73582fc99188245b6d12d6b21f160d17d03a9efea836386e0e52fc418367162` covers two files, 281,467 bytes, 36,679 AST nodes and zero parse failures. Extraction follows lexical dependencies and checks coordinator member references. Node filesystem/path/OS/crypto imports are explicit. The factory accepts OS and console boundaries; importing it does not execute the captured Desktop bootstrap.

The coordinator closure owns its deferred-tool policy registry per factory. SessionManager instances retain the original per-instance maps, sets, timers, lifecycle fences, input registries and continuation guards. Use one factory for managers that should share coordinator policies; separate factories isolate that state.

## Initialization and host responsibilities

The original initializer installs the backend factory, record store, runtime-config resolver, prompt composer, event hooks, telemetry, user identity, reclaim configuration and optional interaction registries. It calls the prompt composer's initializer and retains its readiness promise. Plugin recommendation settlement cancels still-connecting connectors and updates the owning session's pending input.

Runtime configuration uses the original resolver/fallback path and builds the addon manifest before backend initialization. Record mutation and event delivery now run through the complete class: rename/archive/move, project tagging, owner visibility, persistent status effects and scoped/global history no longer need test replacements.

A host still supplies actual services. The complete class does not create a model endpoint, account session, connector proxy, record database, Electron RPC transport or plugin/POI registry. Optional interfaces being present in the source is not evidence that their external service graphs are runnable.

## Verification

```sh
npm run verify:session-manager -w @axonfire/harness -- /absolute/path/to/captured/cli/dist/codebuddy.js
node --import tsx --test packages/harness/test/session-manager-runtime.test.ts
```

The verifier hash-checks both captures, compares every complete source region, constructs an independent factory directly from captured declarations and runs eight paired scenario groups. They cover instance/policy isolation, initializer/composer/connector wiring, record mutations, project tagging, addon-manifest composition, owner visibility, missing initialization and operation contracts.

The real lifecycle fixture constructs this class with the complete original backend, AppServer backend factory, SidecarManager, native CLI and recovered database service/record store. It uses original initialization, readiness, events, task state and cleanup. The input fixture likewise uses the full class and prompt pipeline, including original task-state transitions and pending-input cleanup; it no longer substitutes task dispatch or manually inserts permission/question state. External model responses and browser event decisions remain controlled fixtures.

The focused checks do not establish exhaustive plugin continuation, POI, sampling, account, concurrency or platform coverage. Default Web now composes this complete controller with the original code backend and sidecar owner. It supplies a product-preserving config resolver and browser event bridge; native CLI persistence provides history. Desktop account, connector and SQLite service assembly remains separate. Existing sandbox audit and MCP permission issues remain visible.

Validation on 2026-10-24: root build passed; core suite 2,346/2,346; compiled scenarios 8/8; full Node input/lifecycle 9/9; Electron with the captured native SQLite driver 9/9. Cancelled turns retain the original final task status `completed`, while prompt responses carry `cancelled` and the appropriate cancellation cause. No source behavior was changed to match an assumed status model.
