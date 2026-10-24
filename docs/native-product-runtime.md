# Native product runtime composition

`createNativeProductRuntime` connects the original product entry factory, recovered DI container bootstrap, source-map installer, synchronous Backend foundation, complete product-module loader, final asynchronous product registration and original BackendServer. It preserves their original factory bodies and registration order. The foundation and product modules share one Express instance.

## Run the original CLI and server

After `npm run build`, `npm run cli -- --help` displays the recovered CLI options. `npm run cli` (also available as `npm run native`) runs the complete native service graph in its own Node process. The previous standalone CLI is now `npm run workbench`. Default live Web now uses the native graph through an owned ACP process; `npm run web:workbench` retains the previous host and `npm run demo` remains its offline fixture.

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

Set `AXONFIRE_NATIVE_PRODUCT_CONFIG` to its path, or supply the original `ACC_PRODUCT_CONFIG_V3` JSON environment variable. The file takes precedence. The native ModelProvider uses the configured model URL verbatim, including its endpoint path. Authentication/provider requirements must match your endpoint; the example token is a placeholder.

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
