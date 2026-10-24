# Axonfire Harness

**An evidence-based reconstruction of the WorkBuddy agent harness, with a local CLI and Web workbench.**

Axonfire recovers modules from a fixed WorkBuddy **5.3.14** sample and connects them to runnable hosts. It retains the OpenAI Agents SDK and documents which behaviors come from recovered code, which require adapters, and which remain incomplete.

[Quick start](#quick-start) · [CLI](#cli) · [Architecture](#architecture) · [Recovery status](#recovery-status) · [Documentation](#documentation)

> This is an independent, ongoing reconstruction—not an official WorkBuddy release or a claim of complete recovery. The Web workbench is a new host, not the original product UI. Recovered material does not imply an open-source license grant; see [usage and licensing](#usage-and-licensing).

## What you can do

- **Run locally:** use the interactive CLI, a single-prompt CLI invocation, or a browser workbench with streaming responses.
- **Work with tools:** approve tool calls, cancel runs, resume history, compact context, and answer agent questions through the local hosts. Native Web also bridges form and URL elicitation; see [interaction coverage](docs/native-web-elicitation.md).
- **Run child agents:** delegate foreground tasks through the original Agent tool, with separate model/tool configurations, inherited permissions, and child resumption under a restored parent conversation. See [native child sessions](docs/native-product-runtime.md#agent-child-sessions-through-the-default-cli).
- **Use original permission modes:** native Auto classification is verified through bidirectional CLI input, including two-stage approval and denial. Auto inherits AcceptEdits; see [permission behavior and entry-point limits](docs/native-product-runtime.md#auto-permission-classification).
- **Bring a model endpoint:** configure an OpenAI-compatible Chat Completions service using your own credentials.
- **Load trusted extensions:** use local plugins, configured marketplaces, scoped settings, hooks, and explicit built-in resource directories.
- **Inspect the reconstruction:** trace recovered modules through source comparisons, behavioral checks, runtime smoke tests, and documented boundaries.
- **Embed native services:** compose recovered session, AgentService/Runner, a complete Auto permission pipeline (`createHarness({ nativeAutoMode: true, ... })`), authentication, HTTP, and ACP services through explicit runtime hosts. Authenticated ACP and original CLI model/tool conversations are tested end to end against a local model server.

The default CLI and live Web use the native product graph with the recovered product configurations and prompts staged during the build. Native Web also owns the original Desktop account/product services and publishes resolved configuration to its CLI processes. The standalone workbench and offline demo retain their separate host boundary. See [recovery status](docs/recovery-status.md) before relying on a particular product behavior.

## Quick start

Requires **Node.js 22.19+** and npm. An installed copy of WorkBuddy is not required to build or run the local hosts. The captured native binary assets target **macOS arm64**; full native tool support on other platforms remains unverified.

```sh
git clone https://github.com/cFireworks/axonfire-harness.git
cd axonfire-harness
npm ci
npm run build
npm run demo
```

Open **http://127.0.0.1:3080**. The offline demo runs through the real SDK and reconstructed harness with fixed model responses. It needs no API key, makes no remote model calls, and executes no tools.

To use your own model endpoint, create a [native product configuration](docs/native-product-runtime.md) and set its path:

```sh
cp .env.example .env
# Set AXONFIRE_NATIVE_PRODUCT_CONFIG to your private product JSON path.
npm start
```

| Setting | Purpose |
| --- | --- |
| `AXONFIRE_NATIVE_PRODUCT_CONFIG` | Private product JSON overriding authentication and model endpoint; retains original agents by default |
| `ACC_PRODUCT_CONFIG_PATH` | Managed snapshot file accepted by CLI and Web without copying large configuration into environment variables |
| `CODEBUDDY_MODEL` | Optional original model selection override |
| `AXONFIRE_PORT` | Local Web port; defaults to `3080` |
| `AXONFIRE_WORK_DIR` | Tool workspace; defaults to the launch directory |
| `AXONFIRE_STATE_DIR` | Optional custom state directory |
| `WORKBUDDY_CLI_PREWARM_POOL_SIZE` | Idle native CLI capacity; defaults to app configuration or `1`; set `0` to disable |
| `HTTP_PROXY` / `HTTPS_PROXY` | Native proxy settings; lowercase aliases are supported, with original loopback exclusions retained |

Credentials stay on the local server and are not sent to the browser. Default state is separate from an installed WorkBuddy; explicitly supplied product and settings configuration is honored. Keep `.env` out of version control.

For configuration and troubleshooting, see [Getting started](docs/getting-started.md).

## CLI

The default CLI runs the recovered product service graph, including its original CLI, authentication, AgentService/Runner, tools, HTTP server and ACP routes:

```sh
npm run cli -- --help
AXONFIRE_NATIVE_PRODUCT_CONFIG=/absolute/path/to/private-product.json npm run cli -- -p "Read README.md" --allowedTools Read
AXONFIRE_NATIVE_PRODUCT_CONFIG=/absolute/path/to/private-product.json npm run cli -- --serve
```

See [native runtime configuration](docs/native-product-runtime.md) for the product JSON format and verification boundaries. This entrypoint uses original CLI options and defaults to separate state under `~/.axonfire/native`. `npm run native` is an alias for the same native entry. In unattended text-input print mode, sandbox approvals use a short original timeout instead of waiting for an unavailable UI; explicit `CBC_SANDBOX_APPROVAL_TIMEOUT_MS` overrides it. Live Web composes the complete original SessionManager, code backend and sidecar manager over authenticated ACP, with per-conversation CLI processes, private daemon control state and persistent session storage. See [Web ownership](docs/native-web-ownership.md).

Resume a persisted CLI conversation with `--resume <id>`, continue the most recent one with `--continue`, or branch it with `--resume <id> --fork-session`. Reuse the same working directory and state/configuration. See [CLI recovery and output boundaries](docs/native-product-runtime.md#cli-session-recovery-across-processes). The Node launcher preserves large text and structured output through pipes while retaining the original exit behavior.

Background sessions use `--bg --name <name>`, with `ps --json`, `logs <pid-or-name>` and `kill <pid-or-name>` for management. The original fork adds print and permission-bypass flags; see [background session behavior](docs/native-product-runtime.md#background-cli-sessions).

Manage the original daemon with `daemon start`, `daemon status`, `daemon restart` and `daemon stop`. Manual restart and ACP session recovery after forced process exit are verified; see [daemon lifecycle](docs/native-product-runtime.md#manual-daemon-supervisor-lifecycle).

Recovery preserves completed history, but unfinished output and tool side effects have distinct persistence boundaries. Normal cancellation saves partial text; abrupt process death can lose it. A tool may also have changed a file before its result was saved, even when replay marks it cancelled. See [stream persistence](docs/native-product-runtime.md#partial-answers-cancellation-versus-process-loss) and [tool side-effect recovery](docs/native-product-runtime.md#crash-after-a-side-effect-but-before-result-persistence).

SDK clients can use `-p --input-format stream-json --output-format stream-json` for a persistent process with bidirectional tool approvals and multi-turn history. See [stream input protocol](docs/native-product-runtime.md#bidirectional-cli-stream-input) and [SDK-hosted MCP](docs/native-product-runtime.md#sdk-hosted-mcp-over-cli-stdio), including its pending-call shutdown boundary.

## Workbench CLI

The previous standalone CLI and Web host remain available as `npm run workbench` and `npm run web:workbench`. They accept `OPENAI_API_KEY`, `OPENAI_BASE_URL` and `CODEBUDDY_MODEL` for their model adapter:

```sh
# Discover available options.
npm run workbench -- --help

# Start an interactive session in a project.
npm run workbench -- --cwd /absolute/path/to/project

# Run a single prompt.
npm run workbench -- -p "Explain this project" --cwd /absolute/path/to/project

# Explicitly allow a tool in non-interactive mode.
npm run workbench -- -p "Read README.md" --allow-tools Read --cwd /absolute/path/to/project
```

Local plugin and settings options are shared with the Web launcher:

```sh
# Load a trusted local plugin; --plugin-dir can be repeated.
npm run workbench -- --plugin-dir /absolute/path/to/plugin --cwd /absolute/path/to/project
npm run web:workbench -- --plugin-dir /absolute/path/to/plugin

# Exclude disk scopes from the merged settings view; still apply CLI JSON.
npm run workbench -- -p "Hello" --setting-sources none --settings '{"reasoningEffort":"high"}'
npm run web:workbench -- --setting-sources user,project,local --effort high

# Optionally load a trusted resource root containing plugins/workbuddy-builtin.
npm run workbench -- --builtin-assets /absolute/path/to/resources
npm run web:workbench -- --builtin-assets /absolute/path/to/resources
```

Use `/reload-plugins` in the workbench CLI or Web workbench to refresh plugins locally; this command is not sent to the model. Web sessions default to the workspace's `.axonfire/` directory. The workbench CLI retains the standalone host's `.workbuddy-harness/` directory. Both are ignored by Git.

## Architecture

The repository separates runnable applications, the recovered core, and verification tooling without splitting tightly coupled recovered modules into artificial packages.

```text
apps/
  cli/                   CLI and Web launcher
  web/                   Local HTTP/SSE host, browser UI, host tests
packages/
  harness/
    src/                 Recovered modules and marked standalone adapters
    config/              Fixed-sample configuration and original prompts
    test/                Core regression tests
    scripts/             Configuration, AST, and behavioral verification
scripts/                 Repository-level verification entry points
docs/                    Evidence, architecture, usage, and recovery reports
```

The dependency baseline retains `@openai/agents* 0.5.2` and `openai 6.25.0`; Axonfire does not reimplement the SDK. Recovered module paths, configuration access, and dependency versions are preserved where required for behavioral fidelity. The native MCP integration separately pins `@modelcontextprotocol/sdk 1.24.3`.

Native Web resolves startup configuration through the recovered CLI parser, then starts the Desktop account/product owner. Its snapshots feed the original sidecar, prewarm pool and session backend; model and tool execution stays in the recovered CLI and SDK. See [Web configuration and lifecycle](docs/native-web-accounts.md).

See [Architecture and host boundaries](docs/architecture.md) for the distinction between standalone adapters and native service composition.

## Recovery status

The runnable local hosts are available today. Original entry/bootstrap, CLI and live Web paths now run through the recovered graph; full product parity remains incomplete. The [recovery ledger](docs/recovery-status.md) is the authoritative record of evidence, verification results, and remaining work.

| Area | Current scope |
| --- | --- |
| Sandbox services | Original IPC/process lifecycle, Bash configuration, rule synchronization, Shell service with Pipe/PTY handles and headless terminal, safe-delete helpers and shipped shim assets, security audit, backend routing, and finalization/session-end hooks. Source comparisons, a captured macOS arm64 sandbox, and native CLI/ACP/Web tests verify file denial and escalation. Bash/Node/Python shims are tested against the actual Trash; network/projection and broader OS enforcement remain unverified. |
| Native startup | Original entry and DI bootstrap activate the recovered service graph; default CLI and Web exercise authentication, model/tool execution and original HTTP/ACP. A real PTY test also covers interactive folder trust, conversation history, Read approval/rejection and keyboard exit. |
| Shared dependencies | Product-level lookup reaches recovered DI, Express, Backend namespace, CLS and source-map factories through their existing loaders. Request-context hooks are initialized on demand and released by the owning host. |
| Execution | Recovered AgentService, 32 local interceptor classes, the complete 31-entry default interceptor registry (including Worktree), original component providers, and Runner creation/provider/loop; explicit runtime assembly is available. |
| Sessions | Recovered Factory/Manager/Store/Ingress/Controller, cancellation drafts, disk persistence, replay and parent recovery. |
| Desktop lifecycle | The complete original SessionManager and dependency closure are recovered, alongside AppServer session RPC/LOAD attachment. Real lifecycle tests now use its own initializer, task state, events and cleanup. See [full class and host boundaries](docs/native-session-manager.md); default Web now uses this controller and the original code backend; full Desktop service assembly remains incomplete. |
| Terminal transport | Original WebSocket proxy and sidecar PTY runtime are recovered. Original manager services cold-start the daemon and provision/rotate real CLI hosts with runtime ID/PID checks, ACP prompts and process cleanup. Terminal tests cover input/output, reconnect, resize and cleanup under Node/Electron. Default Web now uses the recovered manager; terminal renderer integration remains separate; see the [sidecar contract](docs/native-sidecar.md). |
| Desktop accounts | Original application authentication, environment, bootstrap storage and userinfo bindings compose with persisted sessions and cloud configuration. An [owned runtime](docs/desktop-account-product-host.md) now assembles these services; relogin, persistence, HTTP 401 rollback, shutdown and real CLI rotation are verified. Default Web now registers this owner and the original CLI lifecycle bindings. See [Web account integration](docs/native-web-accounts.md). |
| Desktop REST client | Original CellJS REST factory and bundled Axios 0.26.1 dependency graph, verified with native HTTP policies and cloud configuration. See [client fidelity](docs/native-desktop-rest.md). |
| Desktop HTTP policies | Original authentication and product endpoint interceptors, with request-header and guarded 401 behavior verified over HTTP. See [integration limits](docs/native-desktop-product-interceptors.md). |
| Desktop cloud configuration | Complete original cloud manager, including memory/disk caches, retries and verified snapshot/logout propagation. See [runtime boundaries](docs/native-desktop-cloud-product.md). |
| Desktop product manager | Complete original Desktop subclass, base and [merger strategies](docs/native-desktop-product-merger.md), preserving provider order, overlays, stable cache and notifications. See [composition and verification](docs/native-desktop-product-manager.md). |
| Product experiments | Complete original experiment manager: serialized refresh, stale-session guards, overlay publication and polling. See [behavior and integration boundaries](docs/native-product-experiments.md). |
| Product coordination | Complete original authentication/product coordinator and snapshot helpers, including remote refresh, rotation filtering and product-layer precedence. See [source and integration boundaries](docs/native-auth-product-coordinator.md). |
| CLI prewarm | Original CLI environment and backend dependency factories feed the real idle-process pool. Warm activation, fallback, replenishment, auth reset and product-snapshot rotation are recovered. Default Web now uses the original pool and backend acquisition, with shared environments and owned shutdown; full Desktop background-service wiring remains open; see the [lifecycle contract](docs/native-prewarm-pool.md). |
| Session backend | Complete original backend/session classes, ACP HTTP/SSE client, prompt-file lifecycle and audit adapter are recovered. Full controller-driven restart/queue/history/deletion tests use these classes under Node and Electron. See [execution path and boundaries](docs/native-code-session-backend.md). |
| Session operations | Original cancellation, queue mutation, command lookup and extension entrypoints are recovered. See [behavior and boundaries](docs/native-session-operations.md). |
| Session input | Original permission, question, interruption, sandbox and elicitation response methods are recovered. See [semantics and verification](docs/native-session-input-resolution.md). |
| Desktop storage | Complete original SQLite DatabaseService, repositories and migrations, with owned recovery and outbox verification. The captured native driver is verified under a matching Electron ABI; see [runtime boundaries](docs/native-session-restart.md#captured-native-sqlite-driver-and-runtime-separation). |
| ACP | Recovered protocol core, Agent/View loop, connections, services, and modified protocol SDK; explicit protocol and connection hosts support composition. |
| Parent handoff | Real ACP/internal HTTP paths exercise SDK reads, continuation, same-connection session changes, and write approval/denial/cancellation/session-level allow. |
| Recovery | Fresh service graphs load, resume, and continue disk sessions; internal HTTP forks can be attached through ACP without rewriting the source history. |
| Interaction | Original AskService and PlanStorage support question, skip/cancel, and plan approval/denial/exit through the ACP parent path. |
| Configuration and plugins | Product/environment providers, scoped settings, policy, local and marketplace plugins, persistence, installers and reload are recovered. Native builds stage the original product resources; explicit built-in seed directories remain a standalone-workbench feature. |
| Prompts | 115 fixed product prompts, 22 Desktop text assets, resource collectors, UserPromptService sections, and explicit Addon/ACP prompt composition are tracked and verified. |
| Auto mode | Original classifier client, policy, settings/defaults, prompt assembly, transcript limits and tool projections are recovered. Native CLI and standalone SDK tests cover both classifier stages, denial, failure recovery and circuit opening with owned model endpoints. |
| Authentication and permissions | Explicit original authentication assembly, the [complete Desktop manager](docs/native-desktop-authentication.md) and [file storage](docs/native-desktop-file-authentication.md), and native permission/approval/MCP paths are available; default CLI and live Web use original permission decisions; the browser presents ACP permission/question requests. |

Remaining work includes broader native tool/protocol coverage, cross-platform binaries and Desktop-managed resource deployment, production account/login integration, automatic daemon restart/channel reconnection and Electron lifecycle, automatic mode restart ([configuration routing and CLI replacement verified; automatic host integration pending](docs/native-session-restart.md)), broader process-failure recovery, production Auto-model integration, and additional configuration/concurrency branches. A model API key is not a product account. The verified native flows do not establish full product parity.

A captured sandbox run has intermittently omitted file-block audit records despite denying access. The regression retains strict audit assertions and now captures raw IPC exits; the cause remains open. See [sandbox audit boundaries](docs/native-sandbox-cli.md#exit-audit-boundaries).

External stdio MCP discovery, allowed calls, error content and hook rejection are verified. [Streamable HTTP MCP](docs/native-product-runtime.md#streamable-http-mcp) also covers JSON/SSE responses, session headers and JSON-RPC errors. [Legacy SSE](docs/native-product-runtime.md#legacy-sse-mcp) separately verifies endpoint discovery, calls and stream closure. A known original defect can execute an MCP call after a noninteractive policy denial; the regression remains an explicit failing TODO. See [MCP permission boundary](docs/native-product-runtime.md#external-stdio-mcp-and-the-original-permission-cache-boundary).

Original limitations are documented rather than hidden: for example, this sample's ACP does not implement `session/fork`, and cold recovery resets permission mode to `default`. ACP also has a 500 ms cancellation barrier and a late-marker path that can label a completed follow-up as cancelled; see [cancellation timing](docs/native-product-runtime.md#original-acp-cancellation-timing-boundaries).

## Verification

Native model/tool host tests use explicit original opt-outs for updater, Galileo and builtin-marketplace startup, with a controlled executable PATH. Production defaults remain unchanged; see [fixture boundaries](docs/native-product-runtime.md#deterministic-native-host-fixtures).

```sh
npm run check             # Type and JavaScript syntax checks
npm run build             # Compile the harness
npm test                  # Core and host regression tests
npm run smoke:runtime     # Runtime and native-service smoke suites
npm run smoke:launchers   # CLI/Web launcher checks
npm run verify:config     # Fixed configuration and prompt verification
```

The latest full host run recorded **126 passes, zero failures and one known MCP permission TODO (127 tests total)**. The earlier intermittent sandbox audit failure did not reproduce in this run and remains an open reliability issue; see the [current recovery ledger](docs/recovery-status.md). The latest core suite passed 2,445 tests. The lower-level manager shutdown race remains preserved; the recovered original AppServer stop method catches it and completes daemon cleanup. See the [lifecycle contract](docs/native-prewarm-pool.md#original-appserver-shutdown).

Host tests run with two workers to limit concurrent native processes. Captured-binary tests run on macOS arm64; the Python trash subtest also requires `python3` and explicitly skips when it is unavailable.

Source-level recovery verification additionally needs the matching sample, which is not distributed with this repository:

```sh
npm run verify:recovery -- /absolute/path/to/codebuddy.js
```

When the Desktop main bundle is outside its original application layout, set `WORKBUDDY_DESKTOP_MAIN=/absolute/path/to/main/index.js`. Additional session Addon samples can be supplied with `WORKBUDDY_DESKTOP_INITIALIZE` and `WORKBUDDY_MODE_COORDINATOR`. Verification expects the documented fixed hashes; see the [reconstruction guide](docs/reconstruction.md) and [latest recovery results](docs/recovery-status.md).

## Documentation

| Guide | Contents |
| --- | --- |
| [Getting started](docs/getting-started.md) | Setup, configuration, and troubleshooting |
| [Architecture](docs/architecture.md) | Core, hosts, adapters, and integration boundaries |
| [Recovery ledger](docs/recovery-status.md) | Module coverage, evidence, verification, and remaining gaps |
| [Reconstruction guide](docs/reconstruction.md) | Recovery methodology and historical work; use current repository paths for commands |

<details>
<summary>Native runtime and protocol references</summary>

| Area | References |
| --- | --- |
| ACP protocol | [Protocol core](docs/acp-protocol.md) · [Services](docs/acp-services.md) · [Connections and modified SDK](docs/acp-connections.md) · [Agent/View loop](docs/acp-view-host.md) |
| ACP runtime assembly | [Protocol host](docs/native-acp-protocol-host.md) · [Connections host](docs/native-acp-connections-host.md) |
| Parent and recovery | [Parent rendezvous](docs/acp-parent-rendezvous.md) · [Replay and recovery](docs/acp-replay-recovery.md) |
| Sessions | [Ingress](docs/session-ingress.md) · [Native session stack](docs/native-session-stack.md) · [Session stack host](docs/native-session-stack-host.md) |
| Sandbox services | [Process, IPC and lifecycle](docs/native-sandbox-cli.md) |
| Process exit | [Metrics aggregation, signals and shutdown order](docs/native-process-lifecycle.md) |
| Tracing | [Trace service, providers, spans and telemetry configuration](docs/native-tracing.md) |
| Native application | [DI container, decorators and backend lifecycle](docs/native-di.md) · [Backend namespace](docs/native-backend-namespace.md) |
| Native Web | [ACP transport, permissions and native session recovery](docs/native-web-runtime.md) |
| Native product runtime | [Original entry, CLI, HTTP and ACP model/tool execution](docs/native-product-runtime.md) |
| Native product modules | [Full factory closure and isolated product registration](docs/native-product-modules.md) |
| Native prompt services | [Product templates, evaluation and Nunjucks rendering](docs/native-prompt-services.md) |
| Native code ratio | [Code adoption reporting and Git/SVN helpers](docs/native-code-ratio-services.md) |
| Native Node logging | [FileLogger, file storage and archives](docs/native-node-logging.md) |
| Native event services | [Reporting, processors and header batches](docs/native-event-services.md) |
| Native Winston | [Logger rebinding and original initialization](docs/native-winston-services.md) |
| Native product configuration | [Providers, merging and endpoint routing](docs/native-product-config-services.md) |
| Native filesystem | [memfs, disk rebinding and Workspace](docs/native-filesystem-services.md) |
| Native context variables | [Resolver registration and manager semantics](docs/native-context-variable-services.md) |
| Native Node services | [Paths, COS SDK and proxy/PAC](docs/native-node-services.md) |
| Native common services | [Headers, utilities and memory lifecycle](docs/native-common-services.md) |
| Native HTTP server | [Captured Express](docs/native-express.md) · [Decorated HTTP components](docs/native-http-components.md) · [MVC controllers](docs/native-http-controller.md) · [Shared bootstrap foundation](docs/native-backend-foundation.md) · [Original server entrypoint](docs/native-backend-server.md) |
| Native bootstrap | [Loading order](docs/native-container-bootstrap.md) · [Source maps](docs/native-source-map-support.md) · [Async product registration](docs/native-product-registration.md) |
| Galileo services | [Service lifecycle](docs/native-galileo-service.md) · [Real SDK binding](docs/native-galileo-service-module.md) · [HTTPS proxy agent](docs/native-https-proxy-agent.md) · [Trace/log exporters](docs/native-galileo-exporters.md) · [Metric exporter](docs/native-galileo-metric-exporter.md) |
| Telemetry providers | [MeterProvider](docs/native-meter-provider.md) · [Readers](docs/native-metric-reader.md) · [LoggerProvider](docs/native-logger-provider.md) · [TracerProvider](docs/native-basic-tracer.md) |
| Galileo SDK host | [Public composition, lifecycle and ownership](docs/native-galileo-sdk-host.md) |
| Galileo initialization | [Product routing policy](docs/native-galileo-config-resolver.md) · [Setup and validation](docs/native-galileo-setup.md) · [Remote configuration](docs/native-galileo-config.md) |
| Galileo instrumentation | [Native Fetch](docs/native-galileo-fetch.md) · [Node HTTP and SDK integration](docs/native-galileo-http-instrumentation.md) |
| Galileo assembly | [Logger](docs/native-galileo-logger.md) · [Self-monitor](docs/native-galileo-self-monitor.md) · [Business metrics](docs/native-galileo-meters.md) · [Sampling and batching](docs/native-galileo-trace.md) |
| Telemetry context | [Resource](docs/native-otel-resource.md) · [Export context](docs/native-export-context.md) · [Environment](docs/native-otel-environment.md) |
| Telemetry transport | [HTTP and KMS](docs/native-galileo-transport.md) · [OTLP serializers](docs/native-otlp-serializers.md) · [Export lifecycle](docs/native-otlp-export.md) · [HTTP configuration](docs/native-otlp-http.md) |
| Local shell | [Unified Shell composition, real PTY, snapshots and ownership](docs/native-local-shell.md) |
| Shell IO | [Encoding, charset detection and executable lookup](docs/native-shell-io.md) |
| Native startup | Original entry and DI bootstrap activate the recovered service graph; default CLI and Web exercise authentication, model/tool execution and original HTTP/ACP. A real PTY test also covers interactive folder trust, conversation history, Read approval/rejection and keyboard exit. |
| Execution | [Agent execution chain](docs/native-agent-run.md) · [Runner creation](docs/native-runner.md) · [AgentService/Runner host](docs/native-agent-run-host.md) · [Default interceptor assembly](docs/native-agent-interceptors-host.md) |
| HTTP | [HTTP/MVC/CLS](docs/native-http.md) · [Parent HTTP host](docs/native-agent-http-host.md) |
| Authentication | [Core](docs/native-authentication.md) · [Runtime host](docs/native-authentication-host.md) · [Desktop manager](docs/native-desktop-authentication.md) · [Account/product composition](docs/native-desktop-account-product-assembly.md) · [Application bindings](docs/native-workbuddy-auth-bindings.md) |
| Desktop login | [File storage](docs/native-desktop-file-authentication.md) · [Custom token](docs/native-desktop-custom-token.md) · [Browser login](docs/native-desktop-external-link.md) |
| Desktop environment | [Base product](docs/native-desktop-client-product.md) · [Environment service](docs/native-desktop-product-environment.md) · [Configuration providers](docs/native-desktop-environment-providers.md) · [File cache](docs/native-workbuddy-local-storage.md) |
| Interaction | [AskService and PlanStorage](docs/native-interaction-services.md) |

</details>

## Usage and licensing

This is a development tool with local file and shell access. **Tool approval is not an operating-system sandbox.** Run it in trusted workspaces and review commands before approving them. The Web host binds to `127.0.0.1` and checks Host, Origin, and CSRF tokens; it does not provide public deployment, multi-user authentication, or remote access. Do not expose it directly through a reverse proxy.

Load only trusted plugins, settings, markets, and archives. Plugin and scoped configuration hooks can execute automatically and are distinct from per-call model tool approval. `--setting-sources none` removes disk scopes from the merged settings view, but explicit native permission/MCP scope queries can still read disk settings; it is not a filesystem sandbox. The default built-in marketplace is empty, and installation follows explicitly configured markets, enablement flags, and policy.

Pinned dependencies have known security advisories. Run `npm audit` for the current report; forced upgrades have not been applied where they would change the reconstruction baseline. Treat archive installation as a trusted-input operation, not a secure unpacking service.

The repository excludes application installers, complete original bundles, personal credentials, and runtime records. Recovered configuration and code fragments come from the analyzed sample; their presence does not establish a right to relicense them. Research, verify, and use this project only within rights you hold, and retain dependency licenses and notices. Third-party programs from external resource packs are not redistributed here.
