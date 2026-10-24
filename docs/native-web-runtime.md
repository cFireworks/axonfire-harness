# Native Web runtime

The default `npm start` browser server uses the recovered product graph in an owned child process. The default CLI and browser share the original entry, DI bootstrap, authentication, sessions, AgentService/Runner, tools and model transport. The browser UI and transport adapter are new host code, not recovered product UI.

## Start and configure

Build once, then set `AXONFIRE_NATIVE_PRODUCT_CONFIG` to a private product JSON file as described in [native product runtime](native-product-runtime.md). Run `npm start` and open the printed loopback URL. The native child uses an ephemeral loopback port; only the browser-facing server uses `AXONFIRE_PORT` or `--port`.

`npm run demo` remains an offline standalone SDK fixture. `npm run web:workbench` explicitly selects the previous standalone host with its OpenAI-compatible environment configuration and asset adapter. Neither is a silent fallback when native configuration fails.

## Protocol mapping

| Browser operation | Original service |
| --- | --- |
| Create session | ACP `session/new` |
| Resume session | ACP `session/load` |
| Stream a prompt | ACP `session/prompt` and `session/update` |
| Permission decision | `session/request_permission` response selecting an offered one-time option |
| Answer or skip | `_codebuddy.ai/resolveInterruption` against the original AskService |
| Cancel / disconnected browser | ACP `session/cancel` |
| List sessions | REST `/api/v1/sessions` |
| Display history | REST `/api/v1/sessions/{id}/history` summary |
| Compact | Original advertised `compact` command only |

The client declares `_meta["codebuddy.ai"].question: true`, which the original AskUserQuestion tool requires. It supports nested server requests while a prompt SSE response is open. JSON-RPC replies and notifications are separate POSTs returning 202; prompt responses are consumed incrementally rather than buffered until completion.

The browser server still enforces its existing single active turn, Host/Origin checks, CSRF token and bounded request bodies. ACP connection tokens remain in server memory. The child’s native loopback server retains its original authentication behavior; the browser adapter does not establish off-loopback security guarantees for that original service.

Permission denial is not a continued model turn in this original path: the tested response is `cancelled` with `PERMISSION_DENIED`. The adapter preserves that outcome. It never selects permanent/session-wide approval for a one-time browser approval. Question skip uses the original skip behavior and reaches the model as the original explanatory tool result.

Closing the browser stream aborts its decision wait and sends native cancellation. Shutdown deletes the ACP connection and terminates the owned process, with a bounded kill fallback if normal termination stalls. Child diagnostic output is not forwarded to the browser. Reconnection and full process restart retain original native disk sessions; standalone-workbench histories are not migrated.

## Evidence and boundaries

Executable Web tests use a deterministic HTTP model and the real native graph. They verify Write approval/denial, cancellation with a pending permission request, browser disconnect, answer/skip, streaming, and native disk recovery after restarting both browser server and product process. Separate ACP tests verify connection recreation, history replay and continuation after cancellation. Existing standalone browser security/approval tests remain in the host suite.

The browser history view uses the original REST summary, not the complete ACP event log. Background team notifications, MCP Apps/terminal delegation, richer permission widgets, and full distributed-product compaction are not yet exposed or validated here. The native compact button refuses a session that does not advertise `compact`; it must not send an unsupported command as an ordinary model prompt or report a successful compaction. Product resources and the previous `--builtin-assets` adapter still require further native integration.

REA evidence for original factories 30638 (question capability gate), 93928 (ACP Agent/interruptions) and 74428 (HTTP stream manager): `ev_d6c9b3d9ec61c831927199a5c01e89233e7907fdfd3d538fef71a96acf12be72`. All three files parsed, with 208,240 visited AST nodes and zero parse failures. Existing complete-factory source verifiers cover recovered body fidelity. These new files are explicitly transport/process/UI adapters and do not modify recovered factories.

## Sandbox escalation context

The original ACP tool-call metadata distinguishes sandbox escalation from ordinary tool approval. The bridge forwards only its interception flag, bypass flag and affected target as an optional approval context. The existing Web decision flow displays the target and explains that approval will rerun outside sandbox isolation when the original bypass flag is set. It still selects the original one-time approval or rejection option; no permanent permission is granted.

`native-sandbox-web.test.mjs` exercises Web HTTP/SSE → native ACP → original Bash/rule services → captured macOS arm64 sandbox. The owned file is initially unreadable under the test rule. Reject returns the original sandbox denial to the model; allow-once returns the contents and original bypass warning. Both tests assert the exact sandbox context transmitted to the browser and the final streamed response. They test the real server bridge, not automated pixel/layout rendering.
