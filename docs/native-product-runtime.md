# Native product runtime composition

`createNativeProductRuntime` connects the original product entry factory, recovered DI container bootstrap, source-map installer, synchronous Backend foundation, complete product-module loader, final asynchronous product registration and original BackendServer. It preserves their original factory bodies and registration order. The foundation and product modules share one Express instance.

## Run the original CLI and server

After `npm run build`, `npm run cli -- --help` displays the recovered CLI options. `npm run cli` (also available as `npm run native`) runs the complete native service graph in its own Node process. The previous standalone CLI is now `npm run workbench`. Default live Web now uses the native graph through the recovered sidecar manager and authenticated ACP ([ownership and cleanup](native-web-ownership.md)); `npm run web:workbench` retains the previous host and `npm run demo` remains its offline fixture.

The build stages the recovered product JSON variants, original CLI package metadata, sandbox configuration, parser WASM and safe-delete shims under `packages/harness/dist/native-product`. The launcher uses this resource root for the original path resolver. Building does not read an installed WorkBuddy application.

To retain the original default CLI agent, auxiliary agents, tools, commands and prompts, omit `agents` from your private configuration and override the original default model ID `auto`:

```json
{
  "authentication": { "type": "custom-token", "attributes": { "token": "YOUR_TOKEN" } },
  "config": { "disabled": true },
  "models": [{
    "id": "auto",
    "name": "your-provider-model-name",
    "url": "https://your-provider.example/v1/chat/completions"
  }]
}
```

You may instead supply your own `agents` array for a deliberately smaller product. The original environment provider replaces arrays: supplying `agents` removes the distributed default agents, even when the incoming JSON specifies `mergeStrategy: "smartMerge"`. Global commands are loaded separately; replacing agents does not remove them. A custom agent can therefore still expose `/compact` without retaining the original compact agent. Clear or replace `commands` explicitly when designing a minimal product. `AXONFIRE_NATIVE_ASSETS` can explicitly select a different trusted product resource root.

Set `AXONFIRE_NATIVE_PRODUCT_CONFIG` to its path, supply the original `ACC_PRODUCT_CONFIG_V3` JSON environment variable, or pass a managed `ACC_PRODUCT_CONFIG_PATH`. The explicit Axonfire file takes precedence. A path-only managed snapshot is validated and left on disk for the original environment provider; the launcher does not copy large snapshots back into an environment variable. When inline V3 is already present, original path/inline overlay handling is retained. The native ModelProvider uses the configured model URL verbatim, including its endpoint path. Authentication/provider requirements must match your endpoint; the example token is a placeholder.

```sh
export AXONFIRE_NATIVE_PRODUCT_CONFIG=/absolute/path/to/private-product.json
npm run cli -- -p "Read README.md" --allowedTools Read
npm run cli -- --serve
```

The original CLI uses `--allowedTools`; it is distinct from the current workbench host's `--allow-tools`. Non-interactive requests requiring approval are denied unless allowed by original CLI/settings permission rules. The launcher does not bypass those rules. Use `--help` for the original CLI's interactive and output options.

State defaults to `~/.axonfire/native`. `AXONFIRE_STATE_DIR` overrides that default; an explicitly supplied `WORKBUDDY_CONFIG_DIR` takes precedence. `AXONFIRE_PORT` selects the original HTTP server port (0 allows an ephemeral port). No original whole-bundle entrypoint is evaluated. The wrapper loads recovered module factories through `createNativeProductRuntime`; original process hooks, console routing and source-map installation run in that process.

## API and ownership

Provide the shared DI namespace, Node require, process, globals, native Error constructor, filename and basePath. The runtime forwards optional console, fetch and other explicit host surfaces to the recovered modules. Use an owned process: original activation installs process handlers, source-map support, console routing and fetch instrumentation.

- `start()` executes original entry factory 29570: sidecar preload, global require, Windows child-process patches, warning filters and File fallback, followed by original BackendServer activation. This is the executable launcher path.
- `loadContainer()` starts the original bootstrap and returns its cached container promise. Original bootstrap failure behavior is preserved.
- `startServer()` bypasses the top-entry patches and invokes the original server factory, which awaits its container, starts Application and listens using the original server configuration. Its return value is the original module export, not a listener-ready promise.
- `getModule(id)` resolves shared original modules and tokens. A caller can register a ServerAware observer to obtain the listener and await readiness.
- `closeContext()` releases the foundation's context host after the caller has drained the server and stopped Application. It does not undo process-wide patches.

## Verified protocol behavior

The integration runs in a child process with temporary configuration/home paths, explicit Web Crypto, a writable isolated fetch property and native Node Error. It uses the real source-map installer and verifies replacement of Error.prepareStackTrace. Every registration namespace and service implementation is recovered code; the additional ServerAware binding only observes the listener.

The original server listens on an ephemeral loopback port. The test verifies:

1. `/health` without `x-codebuddy-request` returns the original 403 response.
2. The same request with `x-codebuddy-request: 1` returns 200 and `status: UP`.
3. `/api/openapi.json` serves the original gateway schema, including session routes.
4. `POST /api/v1/acp/connect` returns a connection ID and session token.
5. ACP `initialize` returns an SSE JSON-RPC result with protocol version 1 and the original agent capabilities.
6. Original custom-token authentication restores from `ACC_PRODUCT_CONFIG_V3`; `session/new` returns a session ID and original session updates. The test supplies a CLI/default agent and its `models` list through product configuration.
7. `session/prompt` traverses the original AgentService/Runner and ModelProvider, sends a streaming Chat Completions request to an owned loopback model server, forwards its text through ACP, and returns `end_turn`.
8. A model-requested `Read` executes against a temporary file; its real contents appear in the next model request and ACP reports tool completion with the same contents.
9. The connection can be deleted, the HTTP listener drained, and Application stopped with its original `stoped` state.

The child permits HTTP requests only to its own service and model ports; external network and subprocess execution remain blocked. The model server supplies deterministic completions, while authentication, session creation, model selection and execution use the recovered implementations.

Requests use the original custom header and ACP Accept/content headers. The test is local; it does not establish off-loopback authentication behavior. Original ACP middleware explicitly bypasses session-token validation for loopback addresses.

## Remaining integration work

This verifies full native HTTP/ACP startup and an authenticated model conversation against an owned deterministic HTTP model server. A separate launcher test exercises the original CLI with the real `Read` tool, verifies denial without permission, and verifies execution with `--allowedTools Read`, starts `--serve` on an ephemeral port, checks the original health/header behavior, and confirms SIGTERM termination. Other tools, additional interactive approval modes, production endpoints, broader Web protocol coverage and deployment-grade process supervision remain to be validated. The original interactive terminal now has the focused PTY verification described below. The workbench CLI/Web hosts retain their current integration boundaries. This composition does not add routes or substitute a server implementation.

```sh
npm run build
npm run smoke:native-di -w @axonfire/harness
```

Factory fidelity is covered by the source-map, container-bootstrap, product-registration, BackendServer and 2,153-factory product-module verifiers. This composition introduces no newly extracted factories and never evaluates the original whole bundle. The selected entry factory is executed through the reconstructed module resolver.

## Original entry fidelity

Factory 29570 is preserved in full. Its preload (55943) and Node built-in module parents resolve through the shared native graph. The entry reuses the recovered Buffer namespace (20181) for File/Blob support. Startup remains cached, so a second `start()` does not rewrap process methods.

Source-paired tests verify preload/createRequire/server order, existing and fallback File behavior, TLS-warning suppression, selective AbortSignal listener-warning suppression, and the Windows spawn/exec wrappers. They preserve the original execFile callback/options ordering rather than correcting it. Windows behavior is tested with owned process/child-process fixtures; that is not a full Windows deployment test. The native launcher integration additionally exercises the actual entry in its own macOS Node process.

```sh
npm run verify:product-entry -w @axonfire/harness -- /absolute/path/to/fixed/codebuddy.js
```

## Native browser bridge

`npm start` starts the existing same-origin browser UI with a native product process behind it. Supply the same private product JSON used by the CLI. The browser server owns an ephemeral loopback child, initializes ACP, and maps the UI's session/stream operations to original ACP and REST APIs. It does not construct an alternative agent loop or substitute tools. Original permission requests are presented in the browser; original safe-tool/permission decisions still apply.

The bridge declares the original question capability (`_meta["codebuddy.ai"].question`), handles `session/request_permission`, and sends question answers/skips through `_codebuddy.ai/resolveInterruption`. Cancellation uses `session/cancel`; closing a browser stream also cancels. Original denial ends the turn with `PERMISSION_DENIED`, and is not rewritten into a continued model turn.

Tests run the default Web executable against a deterministic HTTP model and the real recovered services. They cover Write approval/denial, cancellation while approval is pending, question/skip, streamed responses, and native disk history after restarting both Web and product processes. Session listings/history use original REST endpoints, while resumption uses ACP `session/load`. The standalone workbench's old history format is not migrated.

The compact button delegates only when the original session advertises a `compact` command. A minimal product configuration without that command fails explicitly instead of sending `/compact` as ordinary model input or claiming successful compaction. Native compaction with distributed product resources is covered by the ACP regression described below. Native `--builtin-assets` mapping is also unfinished; use original product-managed resources or the explicit workbench host for its existing asset adapter.

## Resource and compaction verification

The ACP host regression retains the distributed agents and prompts, runs an approved real Write, reconnects the session, invokes `/compact`, and continues. It asserts that compaction uses the original summarization system prompt with no tools, then returns to the CodeBuddy CLI prompt with the generated summary and without the old tool messages. All model responses are supplied by a local deterministic server.

The resource manifest records byte lengths and SHA-256 hashes for the recovered package metadata, sandbox configuration and two parser WASM files; the build checks them before copying. Product JSON retains its existing config provenance and verifier. Captured macOS arm64 ripgrep, sandbox and trash binaries, sandbox rules, the ripgrep notice and the product icon are now staged with byte hashes. Executables receive mode 0755 at build time because the extracted sample files had mode 0644. These are captured binaries, not reconstructed native source; other platform binaries are not present.

Factory 41936 selects the first existing directory, including the product root, rather than testing for the WASM files. The build therefore retains `dist/wasm` and adds identical root copies. The resource regression verifies automatic original parser initialization, quoted compound-command parsing and invalid-input rejection. It also executes the captured ripgrep against an owned temporary file on macOS arm64.

The sandbox binary does not implement a conventional `--help` exit: the probe started its IPC service and was explicitly terminated. Factory 43121 provides a platform-package fallback, but the original process manager first searches versioned vendor directories and successfully resolves the staged binary without an environment override. A macOS arm64 integration now connects the original lifecycle/IPC client to the real binary, opens a session, sets a `no_access` rule for an owned temporary file, and observes `/bin/cat` fail with a file-block record. After clearing the rule, the same read succeeds and returns the expected bytes. This verifies one real file-isolation path with explicit parent dependencies; broader network/projection policies, OS helper integration and trash behavior still need validation. Default-product Bash routing is additionally verified below.

## Native Bash sandbox routing and escalation

On macOS arm64, a native-process ACP regression supplies `--settings` with `sandbox.enabled: true` and an owned file in `sandbox.filesystem.denyRead`. The model invokes the original Bash tool; original interceptors synchronize the rule, the real sandbox blocks the read, and ACP exposes a post-execution sandbox permission request with the canonical blocked path. No substitute shell or sandbox implementation is used.

Rejecting the request produces the original rejection text in the next model request and ends with `PARTIAL_SUCCESS`. Selecting `allow_once` triggers the original escalation rerun **outside sandbox isolation**; the tool result includes the original bypass warning and expected file contents, and the turn ends with `SUCCESS`. This distinction is asserted in the regression. Neither path changes the file.

The original non-interactive CLI could wait at post-execution sandbox approval for its default 30-minute timeout. The Axonfire launcher now sets the existing `CBC_SANDBOX_APPROVAL_TIMEOUT_MS` to 100 ms for `-p`/`--print` when it is unset, excluding `--serve`, `--acp` and `--input-format stream-json`. This is a host policy for a mode without an approval UI; it uses the original timeout, queue cleanup and rejection logic without modifying recovered factories. An explicitly supplied timeout remains authoritative. Interactive, ACP and streaming-input SDK clients keep their original defaults.

A real CLI regression requires a completed final answer and the second model request carrying the blocked tool result; merely seeing exit code zero is insufficient. The original tool-result template calls this rejection “REJECTED BY USER” even when reached through timeout; that inherited wording does not mean a human denied the non-interactive request.

The native Web bridge forwards a narrow sandbox approval context (sandbox interception, bypass flag and affected target). The browser approval card explains when allowing will rerun outside isolation. Two Web HTTP/SSE regressions verify this context and both decisions through the actual native sandbox; full visual/browser automation coverage remains separate.

## Captured safe-delete resources

The build restores executable permissions on `vendor/shim/safe-bin/rm`, `unlink` and `rmdir` without changing their original bytes. Their original environment builder resolves the staged `genie-trash` helper. A macOS arm64 regression invokes all three staged entrypoints and the original Node.js/Python startup shims against owned workspace files/directories, verifies the objects in the actual system Trash, checks original Bash/Node/Python trash-report records, and cleans only those exact test-created paths.

The original wrappers permanently delete paths under OS temporary directories. The test therefore creates its isolated workspace under the repository's ignored `work/` directory. The original runtime configuration enables safe-delete injection only for the WorkBuddy desktop host; ordinary native CLI/Web does not claim that identity and retains the original disabled state. This lower-level shim/helper integration does not imply automatic trash protection for every CLI delete, or complete desktop-host integration. Python integration runs when `python3` is available and otherwise reports an explicit skipped subtest.

## Original interactive terminal verification

`apps/cli/test/native-interactive.test.mjs` runs the default launcher in a real POSIX PTY using the already pinned `@lydell/node-pty` dependency. It exercises the recovered Ink/React terminal interface and actual SDK against a local deterministic model endpoint, with a temporary HOME, state directory and workspace. It does not replace the original widgets or input handling.

The checks cover both trust decisions: Escape exits from the original folder-trust dialog before any model request; Enter selects the original default “Trust folder only” option, after which the initial prompt runs. A second prompt is typed through the PTY, both assistant answers appear in terminal output, and the second model request includes the first user/assistant exchange. Keyboard Ctrl+C exits with code zero and no terminating signal. Forced process termination is reserved for failed-test cleanup and cannot satisfy the exit assertion.

Each test model response has a distinct completion ID. An exploratory fixture reused an ID, which caused the original view to deduplicate the second answer; correcting that fixture restored both displayed answers without changing recovered code.

REA evidence `ev_d3436b31f49cac91a6a9b4013d5a0822f2b39bc10e5d1e5367d04ec00dc03169` covers six relevant original factories (15210, 66605, 90566, 14083, 12307 and 86942), 7,036 AST nodes and zero parse failures. This verifies the trust/input/render/exit path on the current macOS arm64 host. Additional tool/approval modes, terminal resize, richer key bindings and Windows terminal deployment remain separate validation work.

The PTY tests also exercise the original Read permission dialog. Enter permits the real file read, whose unique contents must reach the next model request. Escape produces the original rejection display and returns control to the user without an automatic model continuation. After a new user prompt, the next request must include the rejected tool result and must not contain the file contents. These assertions preserve the terminal-specific rejection flow instead of assuming it behaves like an ACP client. The fixture waits for input effects after a rendered frame and for session completion before testing keyboard exit.

## Deterministic native host fixtures

The CLI/Web model-and-tool tests share `apps/test/native-fixture-env.mjs`. They use the original `DISABLE_AUTOUPDATER=1`, `DISABLE_GALILEO=1` and `CODEBUDDY_SKIP_BUILTIN_MARKETPLACE=1` controls in addition to the existing telemetry/config opt-outs. Their PATH contains system binaries rather than the developer machine's package-manager shims. These settings apply only to owned fixtures; the production launchers retain the sample's defaults. Marketplace installation, updater behavior and telemetry are outside these model/tool fixtures' scope and retain their separate recovery checks.

The earlier environment was not fully isolated merely because the model URL was loopback: tracing observed package-manager discovery, a Corepack pnpm download, builtin marketplace ZIP downloads and a Galileo configuration request. With the explicit opt-outs, a representative ACP trace made no external requests and reached its first model request roughly 80 ms after session creation. Startup still uses the original service graph, SDK, permissions, tools, ACP and HTTP implementations. No test timeout or audit assertion was relaxed.

REA evidence `ev_c4c3ae30793d81ce4cd6fac4c46b9f254570ba1fa523a7fa8e22cb3d2a445cbe` covers the relevant original installation/updater/plugin/Galileo factories 48662, 10175, 14625 and 92763: four inert files, 115,643 AST nodes and zero parse failures.

## CLI session recovery across processes

The original CLI supports `--session-id <id>`, `--resume <id>`, `--continue` and `--fork-session`. Keep the same working directory, state directory and private product configuration across invocations. `--resume <id> --fork-session` creates a separate persisted history; subsequent turns in that fork must not appear when resuming the original session.

`apps/cli/test/native-resume.test.mjs` runs separate default-launcher processes against a local model. It verifies initial session identity, explicit resume, most-recent continuation, initial fork identity, inherited messages and independent histories when both branches are resumed. The original Store selects a logical session ID from embedded history records and retains a differing filename as `storeId`. In this short fork case, restoring the fork emits the original logical ID even though it loads and appends to the fork file. Callers must retain the fork storage ID instead of assuming the emitted ID is a stable branch handle. This covers normal process exit and disk persistence, not recovery from a killed process or an interrupted tool.

For machine-readable session IDs, `--output-format stream-json` emits the original `system/init` event with `session_id`. The ordinary `json` option returned a history array in the tested sample; it is not the same response envelope. The original CliExecutor writes stdout without awaiting its completion and subsequently calls `process.exit(0)`. Before the Node host adaptation, ordinary JSON through a pipe twice truncated at exactly 8,192 bytes. The launcher now calls `configureNativeStdio` before startup: non-TTY stdout/stderr handles exposing Node's `setBlocking` are switched to synchronous writes. This is an explicit host adaptation; original executor factories, output formats, exit calls and exit codes are unchanged. It does not buffer, reserialize or rewrite product output.

The adapter uses a Node internal stdio-handle capability, guarded by feature detection; TTY streams and handles without that capability retain their existing behavior. A slow pipe reader can apply synchronous backpressure. Verification on macOS arm64 / Node 23.9 covers large UTF-8 output through actual default CLI text/json/stream-json paths, complete stdout and stderr from a directly exiting child, and preservation of nonzero exit status. The session-recovery regression now consumes pipes directly, with no file-output workaround. Other operating systems remain deployment verification boundaries.

## Bidirectional CLI stream input

The default launcher accepts the original line-delimited SDK protocol when both `--input-format stream-json` and `--output-format stream-json` are selected with `-p`. Keep stdin open for control replies and subsequent user messages. This is a real persistent product process, separate from the HTTP/ACP transport.

Initialization is a `control_request` with a caller-chosen `request_id` and `request: { subtype: "initialize", hasPrompt: true }`. Wait for its matching `control_response` before sending `{ type: "user", message: { role: "user", content: "..." } }`. The response exposes the configured model inventory without starting a model turn. Each completed turn emits a `result`; sending the next user line after it retains the same session and model-visible history.

Tool approval arrives on stdout as `control_request` / `can_use_tool`, including `tool_name`, `input` and `tool_use_id`. Reply on stdin with `type: "control_response"` and `response: { subtype: "success", request_id, response: { allowed: true, updatedInput } }`, or `allowed: false` with a denial message. The request ID must match the pending request. The native integration test verifies that approved `updatedInput` changes the actual Write contents and that denial creates no file. The print-only short sandbox approval timeout does not apply to this bidirectional input mode.

`apps/cli/test/native-stream-input.test.mjs` also closes stdin while Write approval is pending. The original executor cancels pending SDK permission/MCP/elicitation requests on EOF and waits for accepted input-line work before exit. In this tested permission case, no file is created, the turn settles and the process exits naturally with code zero. Pending MCP EOF is covered separately below. Multiple simultaneous user lines, pending elicitation EOF and other control subtypes remain distinct verification boundaries; the tests send user turns sequentially.

## SDK-hosted MCP over CLI stdio

Include `sdkMcpServers: ["server-name"]` in the stream initialization request to register an SDK-hosted MCP server. The original MCP client then emits `control_request` messages with `request.subtype: "mcp_message"`, `server_name` and a JSON-RPC `message`. Return a matching `control_response` whose successful `response` contains `mcp_response`. This carries MCP initialization, tool discovery and calls over the same stdin/stdout channel; no separate network MCP service is required.

The native launcher regression registers an owned echo server, advertises it to the model as `mcp__owned__echo`, permits that exact tool through `--allowedTools`, checks call arguments and verifies the returned content appears in the next model request. A second case returns MCP `isError: true` with error text. The original `SdkMcpServer.callTool` returns the parsed content array, so the error text reaches the model; this is not evidence that the error flag is preserved through every layer. Both cases continue a second user turn in the same session. Tool approval over the SDK control channel is tested separately by the Write scenarios.

EOF during an MCP call differs from EOF during permission approval. The executor cancels existing SDK requests, but subsequent model preparation may issue another `tools/list` after stdin closes. A diagnostic using the unmodified timeouts observed that request wait 60 seconds, then emit MCP cancellation, complete the turn and exit with code zero at about 64 seconds. The regular regression checks the post-EOF request boundary and deliberately terminates its owned child; it does not claim prompt graceful shutdown. This original latency remains documented rather than replaced with a synthetic response or shortened timeout. Waiting for the final turn result before closing stdin avoids this tested pending-call case.

### MCP elicitation capability boundary

The SDK initialization capability `elicitation.form` and MCP client capabilities are separate in the fixed sample. Setting the former marks the product host as capable of receiving its own elicitation control messages. The original SDK-hosted MCP server still constructs its MCP client without elicitation capabilities or an `elicitation/create` handler.

A real CLI regression sets the SDK host capability, then has the owned MCP server request a form while an echo tool is pending. The outgoing MCP initialize message has no elicitation capability, the client returns JSON-RPC `-32601` for the server request, and no `elicitation_create` control request is emitted. After the mock server handles that rejection and completes its original tool response, the model and a second turn continue normally. This preserves an original unsupported path; the reconstruction does not invent MCP form support from the similarly named SDK host flag.

## Streamable HTTP MCP

A `mcpServers` entry with `url` and optional `headers` can omit `type`: the original configuration manager normalizes it to HTTP. Use `type: "http"` when an explicit transport is preferred. The default CLI accepts this through `--mcp-config <file> --strict-mcp-config`; an exact `--allowedTools mcp__<server>__<tool>` rule authorizes the tested call.

The owned HTTP fixture exercises both JSON and SSE responses to POST requests using the captured MCP SDK, plus successful tool results, MCP `isError` content and JSON-RPC error propagation back into the next model turn. It verifies initialize/initialized, discovery, unprefixed remote tool names and exact arguments, static authorization/custom headers, session ID continuity and the negotiated protocol-version header. A separate case verifies that explicit `--model` supplies `X-Model-ID` on tool calls; selecting the agent default alone leaves that header absent, and initialization has no model header. The model configuration uses the full model endpoint URL; the original provider does not append `/chat/completions` to the configured URL.

The fixture's optional GET stream returns 405. These tests therefore cover Streamable HTTP POST responses (including SSE framing), not the separate legacy SSE transport, persistent server-initiated notifications, OAuth, resumability after connection loss or remote service deployment. Error-content checks do not establish end-to-end preservation of every MCP error metadata field. The stdio policy-denial defect documented below remains open and is not overridden by successful allowed HTTP calls.

## Legacy SSE MCP

Use an explicit `type: "sse"` with the server URL and optional headers. This selects the original SSE transport; URL-only entries normalize to Streamable HTTP instead. The client opens a long-lived GET stream, receives an `endpoint` event, POSTs JSON-RPC messages to that advertised endpoint and receives replies as `message` events on the original stream.

Four native CLI cases verify successful results, tool-error content, JSON-RPC errors and an explicit model override. They assert a single GET stream, the advertised POST endpoint and session query, tool discovery and exact call arguments, authorization/custom headers on both GET and POST, and negotiated protocol headers on subsequent POSTs. `X-Model-ID` is absent on initial GET/initialize and present on tool POSTs only with the explicit model override. CLI completion must close the GET stream before fixture cleanup. Each case uses an owned loopback server and private state with an exact allowed-tool rule.

These cases establish ordinary connection/call/closure behavior, not reconnection after stream loss, event replay, OAuth or server-initiated requests. The separate Streamable HTTP cases above keep their JSON/SSE POST-response checks. The shared MCP policy-denial defect below remains unresolved.

## MCP tool-list change notifications

Two default-CLI cases exercise `notifications/tools/list_changed` over both Streamable HTTP (an SSE POST response) and legacy SSE (the persistent GET stream). The owned server replaces `echo` with `echo_new` during the first tool call, emits the notification, and withholds that call's result until a new tools/list request arrives. This establishes notification-triggered discovery before the model can begin its next iteration.

After releasing the result, the next model request must advertise `mcp__owned__echo_new` and omit the old name. The model then calls the new tool; exact remote arguments and its result in a third model request are checked. An isolated negative control that omitted the notification hit the five-second discovery deadline, confirming the barrier distinguishes ordinary later discovery from the notification path. This deadline bounds the fixture's observation; original runtime timeouts are unchanged.

The original manager serializes notification reindexing through its rebuild chain and checks the current server generation. These cases cover an active unchanged server instance. They do not establish behavior across concurrent configuration replacement, reconnect or a notification flood.

## External stdio MCP and the original permission-cache boundary

`--mcp-config <file> --strict-mcp-config` accepts `mcpServers` entries with `command`, `args` and `env`. The native transport starts the configured process and exchanges newline-delimited JSON-RPC over stdin/stdout. Diagnostics belong on stderr. The owned CLI fixture covers initialization, initialized notification, tool discovery, an allowed call, error content, a PreToolUse hook denial with zero remote calls, and child termination after CLI exit. Process exit is polled separately from its final log event because the event can precede OS reaping.

**Known original defect:** in default permission mode with plain `-p`, an unallowed external MCP tool can execute despite the policy logging that unavailable prompts require denial. `ToolPermissionService.needsApproval` caches `{allowed: false, permissionDecision: "deny"}` by call ID and returns false (no approval interruption). The MCP proxy's `callTool` path invokes PreToolUse hooks again with a newly generated ID, without consuming that cached denial, before dispatching the remote call. The ordinary builtin execution pipeline does consume the cache; its behavior does not establish MCP enforcement.

`native-stdio-mcp.test.mjs` retains the expected-denial assertion as an explicit failing TODO, rather than treating observed execution as a successful permission test. The separate HTTP PreToolUse denial does stop the remote call. This batch preserves the fixed sample's implementation and documents the defect; it does not claim an MCP policy repair or a safe default-denial boundary. The SDK, original factories and prompts are unchanged.

## Background CLI sessions

`--bg --name <name>` runs the original detached-process fork. The parent reports its PID and log path; `ps --json` lists active sessions, `logs <pid-or-name>` reads a registered session's log, and `kill <pid-or-name>` terminates it through the original signal/wait/registry-cleanup flow. The fork resolves the current launcher from `process.argv[1]`, so it does not require an installed WorkBuddy CLI.

The original background fork adds `--print` and `-y` (`--dangerously-skip-permissions`) unless its internal caller opts out. The public `--bg` command uses those defaults. Product configuration, working directory and isolated state environment are inherited by the child. A completed background conversation can be resumed with `--resume <session-id>` when the same state and working directory are reused.

The native background fixture holds a local model response while checking the actual child PID and `ps` registry entry. Its completion case checks `logs`, releases the answer, requires the child to exit, verifies its log output and resumes the persisted conversation in a new CLI process. Its termination case invokes the original `kill` command during the pending model call, requires the process to disappear without the command's force-kill fallback, and cleans only the fixture's owned state. Tests use a tool-free agent; no unrestricted background tool execution is inferred from these lifecycle checks. Manual daemon supervisor lifecycle is covered below. Attach-follow, teammate coordination and Electron lifecycle remain separate verification scopes.

## Manual daemon supervisor lifecycle

The original `daemon start`, `daemon status`, `daemon restart` and `daemon stop` commands run through the recovered default launcher. Start reports an owned daemon PID and HTTP endpoint; repeating start reuses the running daemon. Restart replaces the process, preserves the configured port and disk sessions, and stop removes the active registry entry. The captured default daemon configuration specifies loopback port 9527; an explicit `daemon start --port <port> --host 127.0.0.1` is covered by the native regression.

`apps/cli/test/native-daemon.test.mjs` uses a private HOME/state directory and a free port. It verifies stopped/running status, live PIDs, HTTP health, idempotent start, changed PID and retained endpoint on restart, and final stopped status with no live owned daemon. It also runs an actual local-model ACP turn before restart, loads that session through a fresh ACP connection afterward and verifies the next model request contains the previous conversation. No environment port override masks the CLI `--port` path.

The fixture disables sleep inhibition and channel auto-connect through the original `CODEBUDDY_DAEMON_ALLOW_SLEEP=1` and `CODEBUDDY_DAEMON_AUTO_CONNECT_CHANNELS=0` flags, in addition to the shared local-fixture updater/integration opt-outs. Production defaults are unchanged. Automatic update-triggered restart, wake/channel reconnection, automatic crash restart, recovery of tool side effects and broader daemon tool approval remain unverified scopes. The model fixture uses a tool-free agent and does not establish production account integration.

### Forced-exit recovery

Two additional daemon cases send SIGKILL only to the fixture-owned PID. One kills the daemon after a completed turn; the other holds a subsequent model response and kills the daemon while that request is active. Both observe the stale PID file left behind, require `status` to report stopped, run the original `ps` cleanup, verify the stale file is removed and explicitly start a fresh daemon on the same port.

After a fresh ACP connection loads the saved session, completed user/assistant history is present. In the active-request case, the unanswered user input is also present, and the withheld assistant answer is absent. The model request count confirms there was no extra retry before the explicitly requested continuation. The interrupted ACP request fails on connection loss. Closing that raw ACP client also rejects because its remote DELETE endpoint is gone; the fixture handles that expected error without changing client behavior.

These tests verify manual recovery after an abrupt process exit, not automatic supervisor resurrection or exactly-once tool side effects. The active-request fixture stalls before returning any model content and has no tools enabled. Partial streamed output is covered separately below.


### Partial answers: cancellation versus process loss

Two further daemon cases emit an unfinished model text chunk and wait until the ACP client actually receives it. A normal `session/cancel` returns `cancelled`; after daemon restart, that partial answer exists in the persisted JSONL, ACP session replay and the next model request. With SIGKILL at the same streaming boundary, the partial answer is absent from all three, while completed conversation and the pending user message survive.

This matches the original `AbortedStreamDraftStore` and SessionManager stream lifecycle: stream deltas accumulate in memory, completed items are committed, and an aborted run flushes remaining drafts through `addHistory`. Abrupt process death cannot execute that flush. Client-visible text is therefore not proof that an unfinished answer is durable. The reconstruction preserves this behavior rather than adding a new streaming journal. These tool-free checks do not establish reasoning/tool-call draft recovery or replay safety for external side effects.


### Recovery while Write approval is pending

The daemon starts in the original `delegate` permission mode. The pending-Write regression explicitly selects `default` through ACP `session/set_mode` before requesting a tool; it does not treat the daemon default as an interactive approval mode. It waits for `session/request_permission` with a complete Write call, then either cancels the session or kills only the owned daemon PID before granting approval.

After restart and session load, both cases replay the Write as pending followed by `cancelled`, with `codebuddy.ai/toolCancelReason: session_interrupted`. The next model request retains the original call and arguments, paired with empty tool content carrying `skipRun: true`. The original history utility supplies that incomplete result for an unmatched call; it is not evidence of successful execution. The target file remains absent before interruption and after continuation, and the fixture verifies the expected model request count. No approval is granted in either case.

These checks cover interruption before a Write executes. They do not establish exactly-once execution, rollback, or replay safety when a tool has already produced side effects. The text-stream fixtures above use a tool-free agent; these two cases deliberately enable only Write.


### Recovery after Write returns a result

A further daemon case explicitly approves one Write, waits for the file to contain the expected bytes and for the next model request to carry its nonempty tool result, then holds that model response and kills the owned daemon. After manual restart, replay marks that call completed rather than cancelled. The resumed model request contains the same tool result, and the withheld assistant answer is absent.

The regression checks file content, inode, nanosecond modification time and change time before and after recovery, plus one approval and the exact expected model request count. These observations establish no repeat write at this tested boundary. They do not establish atomicity between a filesystem mutation and the later history append: original ToolManager execution, post-tool hooks and SessionManager result persistence are separate steps. The post-hook interruption test below exercises a crash after the side effect but before its result is recorded.


### Crash after a side effect but before result persistence

The `post-hook-crash` case configures a project-local HTTP `PostToolUse` hook matching Write. It approves one Write and holds the hook response after the endpoint receives the original tool input and successful tool response. The file already contains the expected bytes, but the next model request has not started. The fixture then kills its owned daemon and manually restarts it.

The file survives with unchanged inode, modification/change timestamps and bytes. Recovery does not invoke another hook or request approval again. However, ACP replay marks the call `cancelled` with `session_interrupted`, and the resumed model receives an empty `skipRun: true` tool result rather than the successful Write result observed by the hook. The original tool result had not yet reached the history append. A replayed cancellation therefore does **not** mean that the tool produced no side effects.

This is an observed original consistency boundary, preserved by the reconstruction. There is no demonstrated rollback or transaction spanning tool side effects and session persistence. The fixture's continuation model returns text only; it does not establish what happens if a real model chooses to retry the operation based on the incomplete history. The test also verifies that project-local hook settings reach the original HTTP hook executor through the default daemon host.


## Agent child sessions through the default CLI

The original Agent tool can execute a foreground child session and return its result to the parent through the default CLI. A product-configured child must participate in CLI agent registration: the fixture uses `tags: ["cli", "custom"]`, a unique name, its own instructions/tools, and a model configuration. A `custom` tag alone did not make that child available in the tested native graph. The parent selects it with Agent's `subagent_type`.

`apps/cli/test/native-subagent.test.mjs` uses separate parent and child model IDs backed by an owned loopback server. The parent exposes Agent, the child exposes Read, and four actual model requests follow parent → child → child → parent. The child executes Read on an owned file; its tool result stays in child history, while its final answer is returned through the parent's Agent result. Parent and child retain their configured instructions and model routing.

Two permission cases explicitly allow Agent and either include or omit Read in `--allowedTools`. Allowing Read carries real file contents into the child's next request; omitting it returns a permission-denial result without those contents. Both child outcomes reach the parent model, and the CLI exits naturally. This covers foreground execution and inherited allowlisting; it does not establish detached/background subagents, teammate messaging, fork/worktree isolation or cancellation in the native default host. Those retain separate implementation and verification boundaries.


### Resume a child from a new parent process

The original Agent result appends `[Agent ID: ...]`. Agent accepts that ID as its `resume` argument together with `subagent_type` and the next prompt. The native fixture exits the first CLI process, extracts the ID and checks its child JSONL, then creates a new parent in a second process using the same working/state directory. It loads the prior child question, answer and exact Read success/denial result, retaining the configured child model and returning the same ID. The fresh parent does not inherit the old parent's prompt.

**Cross-parent persistence is split in this sample.** The resumed answer is written under the new parent's `subagents/` directory with the same child filename; the original file stays unchanged, and the new file does not copy the loaded history. Original `findSubagentSessionByStoreId` returns the first matching file in filesystem directory order. A subsequent lookup therefore selects one transcript, rather than merging them or selecting the most recently updated one. A stable returned child ID is not sufficient evidence of a complete, continuously accumulated transcript across different parents.

The regression verifies both files and compares a third process's loaded history with the original lookup's first matching file. It covers allowed and denied initial Read results. This preserves the fixed sample's behavior; no history merge, migration or new ID policy is added. Same-parent resumption is covered below. Child-crash recovery, changes to permissions on resume and detached coordination remain separate verification scopes.


### Continue a child under its original parent

For continuity across normal CLI exits, retain the parent session as well as the child Agent ID. Start with `--session-id <parent-id>`, and use `--resume <parent-id>` on subsequent CLI launches in the same working/state directory. Within that restored parent conversation, use Agent's `resume` argument for the original child ID.

The same-parent native regression runs three independent CLI processes with an explicit parent ID. It checks parent history restoration, child model routing, unchanged child identity, original Read success/denial history and both subsequent child answers. Exactly one child JSONL remains, and all three answers accumulate in that file and are available on the third model turn. Both allowed and denied initial Read cases pass. This is a verified normal-exit path with unchanged permissions; it does not repair child files previously split across different parents.


### Original ACP cancellation timing boundaries

AcpView deliberately rejects new prompts during the first 500 ms after cancellation, returning `cancelled` before normal dispatch. The exact source boundary is elapsed time `< 500`, including future timestamps; at 500 ms the barrier no longer applies. Receiving the old prompt's cancelled response does not imply this window has expired.

A separate original ordering issue can affect a completed follow-up even after the barrier. ACP's abort forwarder resolves and removes its subscription immediately. Pending tool rejection later awaits trace flushing, then sets `session.meta.userInitiatedAbort`. If this happens after the old subscription was removed, the next model can produce a normal answer but its final result is still classified as `cancelled` with finish reason `stop`. That result consumes the leftover flag. Native logs confirmed this sequence, and source-paired tests reproduce it with controlled ordering; this supersedes the earlier unexplained timing observation.

The native regression waits beyond the barrier, requires the next model call and streamed answer to occur without writing the denied file, accepts either original completion label according to scheduling, and strictly requires another prompt to finish with `end_turn`. The deterministic source test separately requires the stale-flag path to return `cancelled`, clear the flag and let the next result finish normally. The reconstruction does not relabel original protocol results or automatically resend prompts: a cancelled label alone does not prove that no answer or side effect was produced.


## Auto permission classification

The original Auto strategy inherits **AcceptEdits**: Write and other edit-type tools pass that strategy without consulting the classifier. Auto is therefore not a per-edit model review mode. Explicit deny and ask rules still take precedence.

The default CLI fixture exercises the real classifier through bidirectional `stream-json`, using separate parent and classifier models on an owned local endpoint. Bash sends the projected command and conversation to the original classification prompt. A first-stage `<block>no</block>` permits execution; otherwise a second request decides. A second-stage `yes`, or output with no parseable block decision, denies execution. Tests verify the resulting file contents or absence, the tool result returned to the main model, model routing and the exact number of classifier requests. No manual permission request is permitted in these cases.

Plain `-p --permission-mode auto` has a separate original boundary: when permission prompts are unavailable, Bash is denied before Auto finalization and the classifier is not called. The bidirectional fixture keeps stdin open through the result and supplies the original SDK control initialization. Adding `auto` to a plain print command alone does not enable the same classification path.

The standalone permission adapter previously bound Auto's dependency to DontAsk. It now resolves AcceptEdits, matching the original factory. The source comparison also pins this dependency binding; comparing isolated class bodies with the same incorrect injected token had missed the discrepancy. This correction does not alter the default native factory, which already retained the original binding. Classifier timeouts, transcript limits and account-backed model behavior remain separate verification scopes.


### Classifier errors and recovery

Owned HTTP 400 responses exercise failures in each classifier stage through the default CLI. Both stages deny the action without a manual approval request, leave the target file absent and return the original failure reason to the main model. The original error report is written under the fixture's private `auto-mode-classifier-errors` directory and contains the failing stage and projected action. A subsequent prompt in the same session succeeds once the classifier endpoint recovers; it runs a new classification and executes the shell command.

A separate four-prompt scenario verifies the original circuit breaker. The first three classifier failures each deny the action. The third failure moves the session out of Auto. The fourth action makes no classifier request and instead emits the normal `can_use_tool` control request. The fixture rejects that request and requires the file to remain absent throughout. This establishes the consecutive-failure threshold and the fallback path; it does not imply automatic re-entry into Auto, timeout recovery, or circuit reset across process restarts.


### Reusing the Auto policy service

The library exports `createNativeAutoModePermissionService`, `AutoModeDenialTracker` and the original `ClassifierUnavailableError`, `ClassifierStage2Error` and `TranscriptTooLongError` classes. The extracted service preserves the original class bodies and constants: three consecutive classifier failures open the circuit, three consecutive denials or twenty total denials trigger the denial limit, and up to twenty recent denied actions are retained per session. Successful classification resets the failure counter; approval resets consecutive denials and removes the matching previously denied action.

Composition requires an explicit classifier (`classify`), rules resolver (`resolve`), project-instructions resolver (`resolve`) and settings manager. The low-level permission host accepts these under `autoMode`, or an already composed service under `autoModePermissionService`; an explicitly supplied service takes precedence. Without either, that standalone host retains its unavailable response. This API does not silently choose a model, construct a classification prompt, or read an installed application's settings. The default CLI/Web native graph continues to use its original classifier and service factories.

Use the exported error classes when a separately hosted classifier must signal a stage-two failure or transcript overflow; the original service distinguishes them by class identity. A caller may provide a tracker to manage session lifetime and call `clear(sessionId)` on disposal. The recovered service's circuit state remains in memory; this extraction does not add persistence or automatic re-entry into Auto.


### Reusing the classifier client

`createNativeAutoModeClassifier` exposes the original client, transcript serializer and timeout helpers through explicit dependencies: `agentService.runOneTimeWithOverrides`, `systemPromptBuilder.build`, `transcriptLimit.check`, tool projections and an owned state directory. Its result can be passed as the `classifier` dependency to `createNativeAutoModePermissionService`. The two-stage suffixes, 64/8,192-token limits, first-stage stop sequence and zero temperature are preserved. The original timeout defaults are 60/120 seconds; a positive finite `CODEBUDDY_AUTO_MODE_CLASSIFIER_TIMEOUT_MS` overrides both stages.

Transcript serialization retains user text, projected relevant tool calls and successful answers to AskUserQuestion. It excludes assistant prose, ordinary tool results and the original list of read/search calls. Transcript-like delimiters in retained text are neutralized. Missing current-tool projections fall back to raw input, while unknown historical tool calls are omitted; an explicitly empty projection allows the current action without a model call. Projection exceptions use the original raw-input fallback.

The client strips thinking sections before parsing block/reason tags and preserves failure diagnostics under the supplied state directory. Timeout rejects the classification race; the original helper does not cancel the underlying model promise. The low-level client accepts explicit prompt and length-check dependencies. The composed runtime below supplies their recovered implementations; the default native graph retains its original factories.


### Complete owned Auto composition

`createNativeAutoModeRuntime` wires the recovered settings resolver, prompt builder, project-instructions resolver, transcript limiter, classifier and permission service. Provide the host's settings manager, prompt manager, agent/model managers, product configuration provider, tool projections and state directory; memory access is optional. Its `service` can be passed to the permission host's `autoModePermissionService` option. It does not change the default native CLI/Web graph or select a replacement SDK/model.

The settings resolver reads user, project-local and CLI `autoMode` settings in that order, excluding the shared project scope. It merges each section, expands `$defaults` once, and retains defaults for missing or empty sections. Replacing soft/hard-deny defaults without `$defaults` emits the original warning. The four original default-rule sections are preserved as data. The prompt builder loads `auto-mode-classifier-instructions` from the supplied prompt manager and substitutes the original environment/allow/deny tags plus permission-deny-rule guidance.

Project instructions combine nonempty user and project memory content, trim it, and truncate the combined text after 20,000 characters. Missing or failed memory access yields empty instructions. The transcript limiter uses the existing recovered `TokenUtils.estimateTokensRough`; it subtracts the original reserves of 8,000 and 8,192 tokens from the selected classifier model's configured window. Missing, nonpositive or unresolved windows use 128,000 tokens; the remaining limit is at least one token. Equality with the limit is allowed, and only a strictly larger estimate is rejected. These are the original rough-estimation semantics, not a tokenizer-specific context guarantee.


### Enable Auto in an embedded harness

Pass `nativeAutoMode: true` to `createHarness` to compose these services with that harness's actual AgentService, product/prompt configuration, settings, memory and registered tools. This enables `nativePermissions` by default; an explicit `nativePermissions` value retains precedence. Open the session with `PermissionMode.Auto` to use classification. Construction itself does not run a classifier model.

```ts
const harness = await createHarness({
  workDir,
  stateDir,
  modelProvider,
  nativeAutoMode: true,
  approveTool, // Retains the independent standalone execution approval.
});
const session = await harness.openSession(undefined, {
  permissionMode: PermissionMode.Auto,
});
await harness.prompt(session, "Run the requested task.");
```

The returned `autoModeRuntime` exposes the composed services. Tool projections refresh before each classification, including handlers registered after construction. Existing `permissionHost.autoModePermissionService` or `permissionHost.autoMode` takes precedence; in those cases no second runtime is constructed and `autoModeRuntime` is undefined. Omitting `nativeAutoMode` retains the existing explicit-composition behavior. This option belongs to the embedded host, not a new native CLI flag.

### Tool projections and the standalone SDK path

`ToolManager.getAutoClassifierTools()` supplies the registered tools' recovered classifier projections. Fifteen explicit projection methods and BaseTool's empty projection are preserved. Built-in descriptors returned by `get()` retain their projection as well, including deferred-tool consumers. A registered custom handler can supply `toAutoClassifierInput`; an unknown custom tool without one is omitted from the index so the original classifier uses its raw-current-input fallback. Known native tools without an override retain the base empty projection.

The owned SDK integration uses the harness's actual AgentService `runOneTimeWithOverrides`, original classifier agent configuration, captured prompt template, model/window resolver, memory resolver and tool descriptors. It verifies fast and second-stage approval, denial, classifier error and a final host rejection against a real Bash file write. The projection excludes the tool's display description and retains the command.

The standalone host's execution guard remains independent of the recovered classifier. A classifier denial or failure prevents execution before the host approval callback; an allow reaches that callback, which can still reject. The fixture verifies both approved writes and file absence after host rejection. This is distinct from the default native CLI's direct classifier path and from an ACP-owned approval route. Merely injecting a classifier into the standalone host does not remove its existing execution guard.
