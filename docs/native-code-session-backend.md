# Native CodeBuddy session backend

`createNativeCodeSessionBackend()` in `@axonfire/harness/terminal/native-code-session-backend.js` exposes the complete original `CodeBuddyCodeBackend` and `CodeBuddyCodeSessionBackend`, including the original HTTP/SSE `WorkbuddyACPClient`. It composes the previously recovered sidecar environment, runtime, proxy, product, client-identity and gateway services. Importing the module does not start the captured application bootstrap.

## Recovered execution path

The backend definition tracks active session owners. Creating a duplicate session detaches the old ACP transport before tracking the replacement; orphan transport cleanup does not itself kill the runtime. Global owner changes soft-reset live session transports while preserving their initialization request. Runtime responsibility (`runtimeEverStarted`) remains distinct from current transport ownership (`runtimeStarted`), so destruction can reclaim an orphaned process without prematurely killing a replacement's runtime during detach.

Session initialization builds the original CLI arguments and managed environment, injects connector/project/session headers, writes prompt files, acquires a prewarmed or cold runtime, verifies local readiness, connects the original ACP client, attaches the session and replays retained configuration options. Prompt handling preserves materialization of resource links and hidden context, prompt-variable restoration, transport recovery and trace reporting. The complete class also retains cancellation, reconfiguration, interruption responses, runtime release and destruction methods.

The recovered dependency closure includes:

- The original HTTP/SSE transport, request correlation, permissions, questions and elicitation handling.
- CLI argument generation, language resolution, prompt-variable files and endpoint readiness checks.
- Audit input/status correlation, bounded caches and original forensic hashing.
- Resource-link encoding and prompt text extraction from the coordinator capture.
- Default workspace resolution and its configuration setters, error/log serializers and the Aegis reporter closure.

The factory accepts a shared gateway, process, console, fetch and OS boundary. Tests use owned directories and a local model endpoint. The original default workspace functions can create and probe workspace directories when called; callers should supply the intended workspace configuration through the exposed original setters.

## Fidelity and boundaries

The source preserves complete declarations rather than reimplementing only tested methods. Eight paired scenario groups cover duplicate-owner detach, soft-reset responsibility, authentication gates, original CLI arguments, prompt-variable restoration, SSE parsing, audit hashing and prompt/reporter state. The original prompt-variable file is a versioned `{version: 1, variables: ...}` envelope. The original SSE parser retains carriage returns in data lines; this behavior remains covered instead of being silently normalized.

A complete-source recovery is not proof that every branch is exercised. Live enterprise authentication, connector-proxy tool execution, broad platform coverage, every transport-recovery race and full application background-service wiring still need integration evidence. Default Web now composes this backend with the complete original SessionManager and recovered sidecar manager. Desktop account, connector and background-service assembly remains separate integration work.

## Evidence

The module records SHA-256 hashes and UTF-16 offsets for 204 original declarations: 143 from `initialize.js`, 58 from `workbuddy-auth-product-coordinator.js`, and three reporter declarations from `log-acl-guard.js`. `verify:code-session-backend` compares every region with the fixed captures and evaluates the captured declarations independently with the same host bindings.

REA evidence `ev_3268878c6ce79ba2e7edf1f479c965c1a7b21f2c1a560eb7481cdb7653db480b` covers 146,865 bytes, 19,709 AST nodes and zero parse failures. The dependency inspection found no unresolved lexical identifiers after original helper recovery and explicit module bindings. It does not substitute for runtime tests or prove that external services are available.

## Real CLI integration

`apps/web/test/native-code-session-backend.test.mjs` composes the original AppServer dependency factory, pool assembly, full backend classes and ACP client. It uses an owned local model endpoint, initializes the session through the complete class in prewarm and background cold-start modes, verifies the selected ownership path, receives the model response through the original notification handler, observes idle replacement capacity and calls `destroy()` to release the owned CLI process. The full backend is instantiated normally; this fixture does not replace `initializeInternal`, `createClient`, `prompt` or `destroy`.

The cold-start mode keeps an idle pool entry but marks the session as background automation. The original backend bypasses the pool and starts an actual detached sidecar/CLI. The test verifies the pool remains idle and the original AppServer stop completes daemon cleanup.

## Controller integration

The session-restart fixture now uses these complete backend classes through the original AppServer backend factory and actual SidecarManager. It no longer implements an ACP backend adapter. Both active-delete and reclaim-then-delete paths verify mode/config replacement, real queue restoration, prompt-file loading, tool execution, history replay and persistent database deletion under Node and WorkBuddy Electron. See the [full lifecycle contract](native-session-restart.md#complete-backend-integration-2026-10-24).

The [input-resolution capsule](native-session-input-resolution.md) also connects to these classes in a real owned CLI fixture. It checks selected allow/deny responses, explicit rejection, question answers and skips with original pending-input settlement. The input fixture now uses the complete original SessionManager, including its task dispatch and prompt finalization. The local model and event consumer supplying owned user decisions remain test boundaries.
