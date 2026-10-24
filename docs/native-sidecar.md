# Native sidecar runtime

The recovered sidecar owns terminal processes and the Unix sockets consumed by the [terminal proxy](native-terminal-proxy.md). Its original server, process adapters, ring buffer, readiness registry and environment/path helpers are available as importable factories. Importing them does not start a daemon.

```js
import { createNativeSidecarEnvironment } from '@axonfire/harness/terminal/native-sidecar-environment.js';
import { createNativeSidecar } from '@axonfire/harness/terminal/native-sidecar.js';

// Set WORKBUDDY_CONFIG_DIR to the installation's private configuration directory.
const environment = createNativeSidecarEnvironment();
const { SidecarServer } = createNativeSidecar({ environment });
const sidecar = new SidecarServer('installation-instance-token');
await sidecar.start();
// On application shutdown:
await sidecar.shutdown();
```

The embedding host must own the daemon lifecycle. The server factory does not run bootstrap. The separate recovered entry factory and executable now supply original crash-writer installation, argument parsing, signal handlers and the automatic `main()` invocation. The existing CLI/Web default launchers have not been switched to sidecar-based process ownership.

## Process and transport contract

- macOS/Linux use the original `@lydell/node-pty` adapter with binary encoding. Windows uses the original child-process pipe adapter. The installed and captured PTY package versions are both `1.2.0-beta.14`.
- `session.create` appends `--port <port>` to the supplied command arguments. With port zero it waits for the child to report its actual endpoint through `session.ready`. The report must have protocol version 1, the one-time session token, the armed PID and a valid port. Identical accepted reports remain replayable for ten seconds.
- Environment filtering removes inherited bootstrap, proxy and product-managed variables. Explicit managed values are applied last. Electron children require managed `ELECTRON_RUN_AS_NODE=1`; merely inheriting that variable is insufficient.
- Control requests are newline-delimited JSON-RPC. Methods cover create, ready, reconnect, resize, kill, list, capture, ping and shutdown. The daemon's instance token is returned by ping and stored in its PID file; it is **not** a per-request control authentication check. Private runtime-directory permissions and local socket ownership are part of the original boundary.
- An 8 MiB ring buffer retains terminal bytes. Data sockets carry raw terminal bytes without an additional frame protocol. A replacement connection receives the snapshot; reconnect tracks queued output. Resize updates the PTY dimensions.
- Kill signals the Unix process group, allows two seconds for graceful termination, then escalates if necessary. The control kill RPC can acknowledge before background escalation completes. Session removal closes its data socket, destroys its client and removes the socket path.
- Socket paths use installation/session hashes and a short-path fallback for Unix socket limits. Shutdown rejects readiness waiters, kills sessions, closes control clients and removes the control socket/PID file. Idle shutdown retains the original process-exit behavior: embed this server only where process ownership is intentional.

## Evidence and verification

The recovery retains complete original declaration regions verbatim, rather than approximating their interfaces:

| Source | SHA-256 | Declarations |
| --- | --- | ---: |
| `main/sidecar-entry.js` | `c7428bd733e1f864fd609a105806b4d6fec19557f20fc0dce98f99d365fc9b2b` | 12 |
| `main/cli-process-env.js` | `96e56ce677c2e38f54fddad9bc3e55855a484baceccc04a5870d6cbf24494a60` | 36 |

REA evidence `ev_5ae46c3b47cd9a917db4d483656922e6795fc05be73f0c4006d5c7be02c097f5` covers 43,166 bytes and 6,167 AST nodes with zero parse failures. `verify:sidecar` checks both complete source-region copies against hash-locked captures and runs paired buffer, environment and readiness scenarios against independently evaluated original declarations and the recovered factories.

`apps/web/test/native-sidecar.test.mjs` uses the recovered control client and starts a real PTY child in an owned temporary directory. The child opens a real loopback HTTP endpoint and sends its readiness report over the actual control socket. The test drives JSON-RPC, authenticated WebSocket terminal traffic, reconnect replay, resize, capture, kill and filesystem/process cleanup. It passes under Node and Electron. This child is a controlled fixture. A second test, `apps/web/test/native-sidecar-cli.test.mjs`, launches the recovered model-serving CLI through the original client/server pair. The CLI itself sends the readiness report; the test checks the protected health endpoint with the original gateway secret headers, creates an ACP session, executes a prompt against an owned local model endpoint, observes the answer and verifies process removal. It no longer relies on parsing startup stdout to discover the CLI endpoint.

Windows named pipes and child-process selection, packaged daemon deployment, default launcher process ownership and terminal renderer integration remain separate verification targets. Original behavior is preserved, including control requests without token checking and process exit on idle/shutdown RPC.

## Original control client

`createNativeSidecarClient()` from `@axonfire/harness/terminal/native-sidecar-client.js` returns the complete original `SidecarClient`. Supply the same environment factory as the server when embedding in an isolated installation; otherwise both use the original process-based path resolution.

```js
import { createNativeSidecarClient } from '@axonfire/harness/terminal/native-sidecar-client.js';
const { SidecarClient } = createNativeSidecarClient({ environment });
const client = new SidecarClient();
await client.connect();
const sessions = await client.listSessions();
client.dispose();
```

The original client assigns request IDs, resolves out-of-order replies, preserves RPC error code/data, dispatches exit notifications and rejects pending requests on timeout, write failure, disposal or connection loss. Default RPC timeout is 10 seconds, reconnect uses 60 seconds, and session creation uses the 180-second readiness budget plus 15 seconds for cleanup/response. Shutdown waits for the control socket to close after the server acknowledges; attaching a data socket remains separate from control traffic.

The client is recovered from `main/cli-prewarm-pool.js`, SHA-256 `ecb7ff634b205288b5ea236519f01292a0a2d02802e1bded03d382532ec3f296`. REA evidence `ev_cb677a6f5f0102faddf175d46934cc68cb95661003d5e3e107a9cd87d319c291` covers 5,270 bytes / 855 AST nodes / zero parse failures. Three complete declarations are compared verbatim, and six original/recovered scenario groups cover the control protocol and failure paths.

Original edge behavior is retained: each incoming socket chunk is independently converted to UTF-8, so a multibyte character split across chunks can become replacement characters. Disposal does not invoke the remote-close callback. Notification callback exceptions are not caught, while close callback exceptions are logged. The paired tests preserve these boundaries instead of silently repairing the original protocol.

The higher-level `SidecarManager` is now recovered as described below. Its daemon cold-start path and the separately recovered prewarm pool are verified below; default application launcher wiring remains separate.

## Sidecar manager recovery

`createNativeSidecarManager()` from `@axonfire/harness/terminal/native-sidecar-manager.js` exposes the complete original `SidecarManager` and its runtime environment/file helpers: 71 declarations from the same hash-locked `cli-prewarm-pool.js` capture. The source regions remain verbatim. REA evidence `ev_b2c253aa2df7d21182955ee8d9a6e26a3a6fc51cdc8bf625284377cde984dd57` covers 65,357 bytes / 8,313 AST nodes / zero parse failures.

The manager retains PID-file discovery, protocol-version checks, stale-process cleanup, detached daemon spawning, startup diagnostics, request coalescing, session reconnect, hosted-runtime identity probes, generation fencing, rotation, reset, candidate protection and prewarm endpoint lookup. Seven paired scenario groups check health identity/PID, concurrent startup, stale client close callbacks, protected-session cleanup, endpoint lookup, reset/rotation guards and environment/executable precedence.

The environment factory, original control client, Node bindings, gateway secret factory, scoped logger, runtime context, proxy environment and CLI product environment have normal original bindings. Overrides remain available. Client information, binary type configuration and the manager-specific common declarations now also have original default bindings. `createWorkbuddySidecarManager` applies the original runtime-context defaults.

Recovery of this class does not yet prove the complete default cold-start graph. Real CLI integration exercises manager discovery/reconnection to an owned running sidecar, real session creation and ACP execution, then reset and reconnection. The recovered [prewarm pool](native-prewarm-pool.md) now has real CLI activation verification; default launcher ownership and full application wiring remain separate targets. Detached daemon spawning is now exercised by the cold-start fixture below. Automatic hosted-runtime provisioning and rotation are now verified as described below. The original cleanup code can signal a stale PID and remove legacy sidecar files; tests use isolated configuration directories and do not point at an installed user's runtime.


## Default runtime services

Four original services are now the manager factory's defaults:

| Factory | Original behavior retained |
| --- | --- |
| `createNativeSidecarRuntimeContext` | Incremental context updates, environment overrides, app/config/user-data paths, locale and log paths |
| `createNativeSidecarProxyEnvironment` | User NO_PROXY entries plus localhost, IPv4 and IPv6 loopback bypass; existing duplicates preserved |
| `createNativeSidecarLogger` | Configurable base logger, native scope support, level fallback and console default |
| `createNativeSidecarCliProductEnvironment` | Inline/path product configuration priority, V2 fallback, synchronous/asynchronous file reads and validated hosted-network environment |

Each factory lives in the matching `native-sidecar-runtime-context`, `native-sidecar-proxy-env`, `native-sidecar-logger` or `native-sidecar-cli-product-env` module under `@axonfire/harness/terminal/` (with `.js` extension). State is scoped to the factory/graph, so an embedding host can configure an instance and supply it to the manager.

Product configuration functions retain their original bodies and initialization assignments. Only the required product-environment enum and environment-key assignments are extracted from `common.js`; this does not execute the entire original common-module bootstrap. The remaining common services needed by manager runtime configuration are now supplied by the recovered common-service capsule.

REA evidence `ev_f509582aa6f2e10d1927dbc464767054a29c97de635d7a0f3df8453d2d05736c` covers 9,104 bytes / 1,110 AST nodes / zero parse failures. Verification hash-locks all five captured source files and compares 37 original source regions. Five paired scenario groups cover runtime precedence/state isolation, proxy merging, logger lifetime/fallback, product precedence and actual temporary-file reads. Manager verification remains 71 original declarations and seven paired groups. The real CLI manager fixture no longer supplies a scoped-logger substitute.


## Client identity, binary configuration and common services

`createNativeSidecarClientInfo()` supplies the original version/product-name cache, inherited machine-ID preference, platform machine-ID probes, dynamic download channel and full registered Node/Python type configurations. Its binary registry includes the original configuration objects and Python post-install signing callback; initialization does not run a download, installation or signing operation. This does not claim recovery of the complete binary manager's detector/downloader/installer service graph.

`createNativeSidecarCommon()` supplies original security-policy translation and product-endpoint override state, including the early environment override. Security conversion preserves the distinction between absent sections and explicitly present sections, prefix tokenization, filtered string arrays and runtime defaults. These factories are default manager dependencies and can still be supplied as configured instances.

REA evidence `ev_3014ac87d32765a75cbb3d75f85ca95ac207e501d8d448b739602f2cb145f595` covers 13,664 bytes / 1,737 AST nodes / zero parse failures. Hash-locked verification compares 39 original source regions from `client-info-env.js`, `common.js` and `chunk.js`, with five paired scenario groups. The original once-only initializer is preserved for binary configurations. Platform probes are tested with controlled adapters; tests do not print a user's machine identifier or invoke Python signing.


## Verified hosted-runtime provisioning and rotation

`apps/web/test/native-sidecar-host.test.mjs` exercises the original manager with all recovered environment services. The fixture supplies only installation-specific paths, a shared gateway secret instance and an owned local model configuration. It starts an owned sidecar server, then concurrently requests the host endpoint twice. Both callers receive the same real CLI endpoint, whose runtime instance ID and PID are checked by the original health probe.

After an ACP prompt completes, the test requests a configuration-driven rotation. A new CLI with a new identity/endpoint becomes active, the endpoint-change notification fires, and the previous CLI process exits. Reset then removes the hosted runtime and allows manager reconnection. Temporary host working directories and sidecar artifacts are cleaned up. Node and Electron execute this path with real PTY processes; model replies remain an isolated loopback fixture.

This closes the earlier hosted-runtime creation/rotation verification boundary. A separate cold-start fixture now exercises detached spawning from the compiled entry; default CLI/Web launcher ownership remains unchanged.


## Executable daemon entry and crash writer

The build now emits `packages/harness/dist/src/terminal/sidecar-entry.js`, the exact relative entry location used by the original manager. This executable starts the daemon; import `native-sidecar-entry.js` when a library factory is required. `createNativeSidecarEntry()` exposes the original `main`, token parser and crash-writer installation without running them on import.

The entry preserves required `--token` parsing, SIGTERM/SIGINT shutdown, startup failure exit and the original synchronous crash writer. Reports are written under the configured `logs/Crash-Log` directory, with sanitized process names, launch timestamps, PID metadata, entry limits and dropped counts. The complete writer and child-process reporting helpers are recovered. The unrelated crash filter/exporter service graph is not claimed by this capsule.

REA evidence `ev_9a1b59a1cf7c84123c07192c5cee747db651b45c31c08dc1d9f24d13ce78b081` covers 6,809 bytes / 1,194 AST nodes / zero parse failures. Verification compares 19 original source regions (15 writer declarations, three entry functions and the executable catch handler), with four paired groups for owned crash files, entry limits, child exit/error reporting, token parsing, signal shutdown and crash-writer binding. Tests install process hooks only on controlled emitters or owned daemon children.


## Cold-start verification and original shutdown defect

`apps/web/test/native-sidecar-cold.test.mjs` begins without a daemon PID file and lets the original manager resolve its default compiled entry and spawn a detached daemon. It provisions a real hosted CLI, executes an ACP prompt, rotates the CLI, resets/reconnects, then requests daemon shutdown. The fixture waits for the owned daemon to exit and checks socket/PID-file removal.

This uncovered an original manager defect: the control client's close callback clears `this.client` while `shutdown()` awaits socket closure; the `finally` block then calls `this.client.dispose()` and throws a TypeError. Original/recovered paired verification reproduces it. The manager regression explicitly expects that exception. The cold fixture now uses the recovered original AppServer `stop()` method, which catches the rejection and continues pool cleanup; it independently requires clean daemon exit and removal of owned files. The manager implementation is unchanged. See the [AppServer lifecycle contract](native-prewarm-pool.md#original-appserver-shutdown).
