# Original Desktop terminal proxy

The recovered `TerminalProxy` bridges an AppServer WebSocket connection to the existing sidecar data socket. It does not create a PTY, spawn a shell, interpret terminal frames or implement a terminal renderer.

`createNativeTerminalProxy()` in `@axonfire/harness/terminal/native-terminal-proxy.js` returns the complete original class plus its two URL helpers. Normal bindings use Node's `net` and the pinned `ws-native` alias (`ws` 8.18.3). Explicit bindings exist for paired boundary tests. The AppServer session-host factory now uses this class by default; a caller may still supply a different constructor for a controlled test boundary. Its original scoped-logger module remains a separate host dependency.

## Connection lifecycle

The host supplies its HTTP server, endpoint token and `resolveDataSocketPath(sessionId)`. On a `/pty/` upgrade, the proxy extracts the session prefix and, when the expected token is nonempty, compares the first decoded `token` query parameter. A mismatch writes HTTP 401 and destroys the upgrade socket before resolving or connecting to the data socket. An empty expected token skips validation, as in the fixed sample. This is the AppServer endpoint token, separate from the CLI replay endpoint's Bearer credentials.

The original path regex is prefix-based: `/pty/id/suffix` matches `id`, and `/pty/a%20b` matches `a`. Unrelated paths are left for other HTTP upgrade listeners. These rules are preserved, not tightened in the reconstruction.

After a successful upgrade, the proxy resolves the data path and creates a Node connection. Incoming data chunks are sent as WebSocket binary frames only while the WebSocket is open. WebSocket input accepts Buffer, ArrayBuffer, Buffer-array and string-coercion branches and writes bytes only while the data socket is writable. The original class adds neither a separate queue nor explicit backpressure management.

Data-socket errors close the WebSocket with 1011 / `data socket error`. Data-socket closure closes an open or connecting WebSocket with 1000 / `data socket closed`. WebSocket close/error destroys its owned data socket if necessary. Proxy stop closes active clients with 1001 / `server shutting down`, closes the WebSocket server and clears its reference.

The original stop method leaves its HTTP upgrade listener registered. A subsequent matching upgrade on that still-live HTTP server can access the cleared WebSocket-server reference. The paired regression retains this boundary; the owned real-connection fixture closes the HTTP server during cleanup. No alternative restart/disposal behavior has been inserted.

## Evidence and verification

The class, two helper functions and three constants are recovered from the fixed Desktop `initialize.js` sample. Six whole declaration comparisons cover the entire class and helpers, not selected fragments. Seven original/recovered scenarios test parsing, token handling, frame conversion, writable/ready-state gates, errors, close codes and stop behavior.

The dependency verifier checks version 8.18.3 and byte-compares 15 WebSocket package source files against the captured application's `node_modules/ws`. This establishes the pinned package match; it does not claim a separately normalized AST comparison of every inlined WebSocket module in the Desktop bundle.

REA evidence `ev_bd61c578dcd55280d7e21149c4078d8441166d4a2d62e730b002fe8707e34a8d` covers 3,404 bytes and 540 AST nodes with zero parse failures. Reproduce source/dependency verification with:

```sh
npm run verify:terminal-proxy -w @axonfire/harness -- /absolute/path/to/codebuddy.js
```

Four real-host tests use the default recovered proxy through the recovered AppServer attachment, a loopback HTTP/WebSocket connection and a private Unix socket. They check lossless binary transfer, wrong/missing-token rejection before connection, empty-token and prefix behavior, graceful socket closure, server shutdown and a missing socket. Run after building:

```sh
node --test apps/web/test/native-terminal-proxy.test.mjs
```

The Unix-socket fixture skips Windows. The separately recovered [sidecar runtime](native-sidecar.md) now has a real PTY/readiness/reconnect/cleanup integration test through this proxy. Sidecar data sockets carry raw bytes. The recovered CLI also passes native readiness and ACP prompt execution through this daemon. Default launcher ownership and terminal renderer integration remain separate targets.
