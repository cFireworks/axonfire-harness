# Native session input resolution

`attachNativeSessionInputResolution(controller, dependencies)` installs ten complete original SessionManager members for permission responses, semantic interruptions, questions, sandbox choices, elicitation and synthetic question-cancellation history. It composes with the recovered readiness, task-state, cleanup and history components. It does not replace the default Web browser adapter by itself.

## Source fidelity

The fixed `initialize.js` SHA-256 is `528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19`. Exported member offsets identify every complete original method. REA evidence `ev_ef6913e3aaf8bc0d04b45b285ac9bb0934054ae614c69dc66ebfb1dd5508ef3a` covers 6,438 bytes, 815 AST nodes and zero parse failures. No captured bootstrap is executed.

`verify:session-input-resolution` compares all ten methods and evaluates eight scenario groups against both the independent captured-source implementation and the recovered module.

## Preserved behavior

- Permission acceptance/rejection settles pending input only when the backend acknowledges it. `rejectPermission` sends a cancelled ACP outcome; selecting `reject_once` through `respondToPermission` sends a selected option instead. In the fixed CLI, both tested Write-denial paths cancel the turn without another model request or a file write.
- Question resolution snapshots pending permission IDs before the semantic request and merges IDs that arrive while it awaits. It deduplicates them, attempts every permission reply, then answers or cancels the question. Partial acknowledgment keeps owner input pending.
- A semantic decision can be queued without resolving immediately. Direct `resolveInterruption` returns only `resolved`; question resolution may accept `queued` when no permission or question request exists. These methods intentionally differ.
- After a successful semantic question decision, permission envelopes receive the original `allow` transport option even when the semantic decision was denial. The semantic decision and envelope acknowledgment are separate steps.
- Successful question cancellation settles input, records a synthetic skipped-question event, emits scoped and global events, then synchronizes pending-input state.
- Sandbox responses preserve the original void return value. A backend acknowledgment settles state; an unhandled request emits a warning.
- Elicitation uses the original synchronous backend acknowledgment contract. Backend exceptions propagate without fabricated success or settlement.

The attachment supplies no fake backend. Callers must provide real readiness, state and event services. These methods now also exist in the recovered [complete SessionManager](native-session-manager.md), including its initializer and queue/continuation entrypoints. Live POI and plugin-recommendation service integration remains separate work.

## Checks

```sh
npm run verify:session-input-resolution -w @axonfire/harness -- /absolute/path/to/captured/cli/dist/codebuddy.js
node --import tsx --test packages/harness/test/session-input-resolution-runtime.test.ts
```

The native interaction fixture additionally joins these methods to the original backend/ACP client and real sidecar CLI. It now uses the complete SessionManager initializer and prompt pipeline, including original event wiring, task dispatch, pending-input settlement and cleanup. Only the external model endpoint and event consumer making the owned user decisions remain fixtures.

Validation on 2026-10-24: source comparisons 10/10; paired scenario groups 8/8; core suite 2,328/2,328; final root build succeeded; compiled scenarios 8/8; real native input cases 5/5 under Node. The combined Electron input and full lifecycle run passed 7/7 with the captured SQLite driver. These focused checks do not resolve the existing aggregate sandbox audit failure or MCP permission TODO.

The full-class fixture extends verification to original prompt finalization: both cancel causes, empty pending-input maps, completed task state, stopped watchdog, reset processing flags and real deletion. The narrower capsule scenarios continue to isolate the response contracts.
