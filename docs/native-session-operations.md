# Native session cancellation and queue operations

`attachNativeSessionOperations(controller, dependencies)` installs 24 complete original SessionManager methods for cancellation, queue operations, command/subagent lookup, yield, sampling/roots replies and extension dispatch. It uses two original task-state helpers and composes with the existing readiness, cleanup, team-state and task-effect services. It does not enable a new browser-facing controller by itself.

## Source and verification

The source is fixed `initialize.js`, SHA-256 `528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19`. Exported method/function ranges identify all 26 original regions. REA evidence `ev_b97457825c259eb1515655b233766c0452ebbeb6b6d7932b6baeea323ed57994` covers 7,912 bytes, 1,128 AST nodes and zero parse failures. The verifier compares each complete source region and runs ten paired scenario groups against the captured and recovered implementations.

```sh
npm run verify:session-operations -w @axonfire/harness -- /absolute/path/to/captured/cli/dist/codebuddy.js
node --import tsx --test packages/harness/test/session-operations-runtime.test.ts
```

## Cancellation behavior

User cancellation and recommendation-switch cancellation preserve distinct intent flags and stop reasons. Both request a processing stop before awaiting the backend. Recommendation cancellation clears its own cancellation/stop flags when the operation fails; ordinary user cancellation propagates the failure while retaining its intent.

A detached, nonterminal planning/working session with no active team members can finalize stale pending/in-progress tool records as failed, then complete cancellation and flush effects. A processing, terminal, awaiting-input or active-team session does not receive that fabricated detached completion. A deferred team completion has a separate path: apply the terminal signal, mark completion finalized, flush effects, then await the processing-stop hook. These decisions depend on the original surrounding services, not only on whether the cancel RPC returned.

## Queue and extension behavior

Queue reads/saves use the existing session map and prepare that backend; they do not restore an absent session. An absent queue read/save returns `undefined`, while queue-state lookup returns `null`. Save removes the outer `sessionId` before forwarding its payload. Queue mutations go through readiness and return the backend's result unchanged.

Command/subagent queries select an explicit session ID or the first map entry. Missing sessions return the original empty result shapes. Yield returns `true` after completion; sampling and roots replies return void. A direct extension call rejects a backend without extension support. Broadcast skips unsupported backends and contains asynchronous failures, but the original synchronous throw still escapes before `Promise.allSettled`.

The fixed CLI has no `session/get_queue_state` or `session/cancel_queue` dispatch case even though the original desktop backend exposes those calls. Recovering the desktop entrypoints does not establish support in the CLI. The real Node lifecycle fixture verifies that both return JSON-RPC `-32601` (method not found), then continues the supported queue edits and restart flow. This boundary remains explicit rather than adding an invented successful response.

## Integration boundary

The complete lifecycle fixture now routes queue save/read and edits through these original controller entrypoints, the complete backend, original ACP client, real sidecar and native CLI. The input fixture adds user and recommendation-switch cancellation while an owned Write permission is pending. That fixture now uses the complete SessionManager task/prompt pipeline and verifies cancel causes, state cleanup and actual model/file effects. Browser/Electron UI delivery remains outside the fixture.

Full SessionManager initialization and record-list/mutation/continuation methods are now part of the [complete class recovery](native-session-manager.md). Live POI and plugin recommendation service integration remains separate work. The existing sandbox audit and MCP permission limitations are unchanged.

Validation on 2026-10-24: source comparisons 26/26; paired scenarios 10/10; core suite 2,338/2,338; root build succeeded; compiled scenarios 10/10. The nine combined input/lifecycle cases pass under Node and Electron, including both cancellation modes, queue edits, restart persistence and active/reclaimed deletion. A focused Node rerun and the final Electron run also assert `-32601` for the two unsupported queue methods.
