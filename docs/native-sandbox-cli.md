# Native Sandbox CLI services

The fixed-sample Sandbox CLI transport and lifecycle are recovered as complete original declarations. `createNativeSandboxCLI` exposes the original IPC client, process manager, lifecycle, bounded stdio capture, and connect-timeout discriminator. `createNativeSandboxServices` composes these instances with an explicit runtime and returns their original DI token bindings. It does not launch a process until the caller invokes the original lifecycle methods.

## Recovered behavior

- The IPC client uses newline-delimited requests/responses, request IDs and timeouts, reverse requests, event listeners, disconnect cleanup, and original Unix socket/Windows pipe addressing.
- The process manager resolves an explicit executable or original versioned vendor paths, constructs arguments/environment, retains the 500 ms startup gate, captures stdout/stderr, registers process exit cleanup, reports established-process crashes, and performs TERM/KILL shutdown and version-directory GC.
- The lifecycle connects and opens a session, caches readiness, detects unresponsive processes, restarts using bootstrap options, switches projection, flushes access telemetry, and synchronizes file changes before stopping. macOS helper discovery, health checks and spawn-lock branches remain in the recovered class.
- Original protocol modules supply 46 commands, file/network action flags, IPC envelopes, configuration defaults and error behavior. The shared SandboxTurnConfig preserves exactly its original own-property defaults; optional fields are not invented.

The original 30-second readiness limit, 5-second callback limit, 1-second telemetry flush limit and 10-minute flush interval are unchanged. A callback that completes before its timeout leaves the original losing timeout scheduled until expiry. The composition adapter does not silently alter that behavior.

## Captured binary integration

The build stages the captured macOS arm64 sandbox executable under `dist/native-product/vendor/sandbox/5.3.3`. The original process manager finds this versioned vendor path before consulting the platform-package fallback. Its original `--config`, IPC address and `--app_home` arguments work with the captured binary.

`apps/cli/test/native-sandbox-binary.test.mjs` exercises the original lifecycle and IPC classes with real Node process/socket/filesystem boundaries and a temporary application home. It opens a session, applies a `no_access` file rule, executes `/bin/cat`, verifies a nonzero exit plus a canonical-path file-block record and no stdout, then clears the rule and verifies the same read succeeds. Four concurrent reads then check distinct process IDs, denied-path audit attribution and exact allowed output. A passive socket observer compares each raw `ProcessExit` payload with the original client callback before Shell enrichment. The test also checks child PID registration and cleanup. It runs only on macOS arm64 and requires build-staged assets.

This is evidence for the captured binary and one real file-isolation path, in addition to the earlier deterministic protocol-peer comparisons. Separate native CLI/ACP/Web tests cover product Bash denial and approval escalation; this direct binary fixture does not establish network policy coverage, projection semantics, helper installation or cross-platform protection. No original factory was changed to make the binary test pass.

## Exit audit boundaries

The original Shell preserves native `fileBlockRecords` and enriches results only when those records contain an actionable file denial. Nonzero exit codes and “Operation not permitted” stderr alone do not set `sandboxDenied`. Source-paired tests cover omitted records, empty records, zero action masks and ignored `process-exec` operations. No synthetic audit records or fallback denial classification are added.

A previous captured-binary run returned a denied exit without file-block records. Ten subsequent sequential probes passed, as did the concurrent wire-capture fixture, so the earlier intermittent failure remains unexplained. The latest full 81-host run reproduced this gap: 79 passed, one sandbox audit failure and one separate MCP TODO. A subsequent focused run passed, without resolving the intermittent cause. Failed assertions now also include bounded stdout/stderr tails from the original native process capture. Failed assertions retain the raw exit payload, output and recent native logs; the blocked-path requirement remains enforced. REA evidence `ev_4e0f4e0383918618470c779f343080ed556ad83aa6abe13a30e112ae34849ff0` analyzes the original IPC client, Pipe handle and Shell declarations: three files, 6,308 AST nodes and zero parse failures. Native executable decompilation was unavailable because this environment has no configured REA native-analysis provider; this evidence concerns JavaScript behavior and observed protocol traffic.

### Native macOS audit monitor: partial static recovery

The captured arm64 `sandbox-cli` is not stripped of Rust function symbols. Its SHA-256 is `db944b749d228b394838c7b0500e4726c5d81394c3929f3415cf80fd7f70eb41`, Mach-O UUID `C62F1179-DF4E-311A-94BD-469A1B0BBB40`. REA Mach-O evidence `ev_fe0df082e6e2fdd6d442bc474a22ceb8be3138d1983147f64e7af2a23f81602c` establishes the arm64 slice and `__TEXT` mapping (VM base `0x100000000`, file offset zero). This is metadata evidence; the control-flow observations below come from local LLVM static disassembly and indirect-symbol bindings, not a configured REA decompiler or original Rust source.

| Native symbol | Unslid address |
| --- | --- |
| `SandboxLogMonitor.start` | `0x10011f38c` |
| `SandboxLogMonitor.stop_and_collect` | `0x100120aec` |
| `deny_records_to_ipc_file_block_records` | `0x100122a30` |
| `run_executable_pipe_macos` | `0x1001303c4` |
| `macos_post_exit_cleanup` | `0x100134274` |

The start function builds `/usr/bin/log stream --style ndjson --info --debug --predicate` with the literal predicate `((processID == 0) AND (senderImagePath CONTAINS "/Sandbox"))`. These command strings are file-backed at `0x1002284a3` onward (the `stream` literal is at `0x100226a60`). Reader logs independently show per-command `WB_SBX_...` tags and whether each line matched the tag and parsed into a denial. This native log stream can observe unrelated Sandbox events; the tag filter is a separate step.

The startup readiness reader is separately identified at `0x10012dae0` (next text symbol `0x10012dcc4`). It calls `BufRead.read_line` at `0x10012db94`, checks the resulting string length at `0x10012dbcc`–`0x10012dbd4`, frees the string and returns presence/absence. This function does not parse JSON, match a readiness message or inspect the line's contents. The parent calls `_pthread_join` at `0x10011f8b0`, checks the joined result at `0x10011f924`/`0x10011f928`, and emits the “log stream ready” message at `0x10011f978`. Thus startup does wait for a successful nonempty stdout line; the analysis does not establish that the line proves a fully active OS subscription. No startup fix or root-cause claim follows from this observation alone.

The read-only analysis is reproducible on macOS with Command Line Tools:

```sh
node scripts/inspect-sandbox-audit-native.mjs
node scripts/inspect-sandbox-audit-native.mjs --include-assembly > work/sandbox-audit-native-static.json
```

An explicit binary path may be supplied before the optional flag. The script rejects a different sample hash, validates the Mach-O text mapping, resolves four unique Rust symbols, records code-span hashes and command literals, and identifies the relevant imported stubs. It invokes `nm` and `llvm-objdump`, never sandbox-cli. Code spans stop at the next text symbol; this does not claim complete cold/shared code coverage. The retained REA evidence establishes the matching image identity/layout, while this script reproduces the supplemental static disassembly.

The normal, non-poisoned `stop_and_collect` path has the following recovered timing structure:

1. Sleep in 10 ms increments and inspect the record count. With no records, stop this phase once the accumulated sleep counter reaches 300 ms.
2. Once a record appears, wait a further 150 ms, subject to the overall 600 ms counter limit.
3. Poll every 10 ms until three consecutive unchanged record-count observations, resetting the stability counter when the count changes, or until the overall counter reaches 600 ms.
4. Log the pre-kill count, terminate the owned log process, wait/join, and collect the final records, including records read between termination and EOF.

These are accumulated requested-sleep values, not wall-clock deadlines. At `0x100120b64`/`0x100120b68`, the nanosecond immediate is `0x00989680` (10,000,000); `0x100120bb8` calls the stub at `0x1001d1214`, which the indirect symbol table identifies as `_nanosleep`. The comparisons at `0x100120b98`, `0x100120d40`, `0x100120dcc` and `0x100120ea4` establish the 300 ms, 150 ms, 600 ms and stability-count boundaries. The `_kill` stub at `0x1001d113c` is called with signal 9 at `0x100120ff0`. Rust allocation, mutex-poisoning and error paths are not fully reconstructed here.

A normal owned diagnostic run observed a matching syslog denial, `pre-kill records=1, waited=190ms`, and the corresponding IPC fileBlockRecords (`work/sandbox-audit-native-logs.log`). Four concurrent isolated fixture runs also passed. This confirms the mechanism, not the intermittent failure's cause. Delayed or filtered native log delivery remains a candidate explanation for an empty collection; no failing run with matching complete native reader logs has yet proved it. The latest full aggregate reproduced the missing audit record (88 tests: 86 passes, one failure, one known MCP TODO); see `work/current-host-aggregate-after-session-controller.log`.

The fixture collects bounded native stdout/stderr and owned log-file tails. The original manager snapshot retains only the first and last 1,024 characters, so the fixture additionally observes each child stream directly with a UTF-8 decoder and keeps an independent 65,536-character tail per stream. The successful `work/sandbox-independent-output.log` run confirms that these tails preserve the intervening monitor ready, reader/tag/parse, and pre-kill count messages. This independent capture does not change production capture behavior. On failure it appends file logs again after lifecycle shutdown, allowing buffered native logs to flush without delaying the measured operation. Set `AXONFIRE_SANDBOX_DIAGNOSTICS=1` for successful-run observations. Neither this diagnostic switch nor the partial static recovery changes the native executable, wait constants or denial assertions.

## Explicit parent assembly

```ts
import { createNativeSandboxServices } from "@axonfire/harness/sandbox/native-sandbox-services.js";

const sandbox = createNativeSandboxServices({
  runtime: parentSandboxRuntime,
  logger,
  telemetryReporter,
  protocol: parentSandboxProtocol,
  turnConfiguration: parentTurnConfiguration,
  turnConfig: sharedTurnConfig,
  rules: { bashSandboxManager }, // optional, complete parent configuration service
});
// Merge sandbox.bindings into the parent's DI container and use sandbox.namespaces
// for 70353, 74674 and 41695. Pass the SAME mutable turnConfig to all consumers.
await sandbox.lifecycle.ensureReady({ sessionId, appHomeDir, autoProjection });
// Stop new dispatch and settle accepted parent work before shutdown.
await sandbox.lifecycle.stop();
```

`runtime.process` is required. The factory accepts explicit `modules` or `getModule` boundaries for Node net, child_process, fs, path, crypto, string_decoder, semver, original PathUtils, executable-package resolution, PID registry and shell configuration. `Date`, `Math`, timers, immediate scheduling and console may also be supplied. A parent may use ordinary Node implementations where appropriate, but product-specific boundaries must be implemented explicitly. The adapter does not read installed credentials or invent product services.

`bindings` maps the original client/process/lifecycle/config tokens to these exact instances; `namespaces` preserves matching module identity. Reuse the parent's protocol/config namespaces when composing a larger container. The lifecycle token is an original global Symbol; the other tokens are local Symbols and must not be regenerated independently.

This is synchronous composition, **not an application lifetime owner**. Public methods remain original; there is no added admission gate or automatic cancellation of accepted work. The parent owns processes, network access, filesystem roots and outstanding work. In particular, readiness timeouts can trigger original late-start cleanup after the initial rejection, so callers must account for that work before disposing runtime resources.

## Validation and remaining boundary

The verifier checks the fixed CLI SHA-256 `4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd`, complete declaration groups, lexical constants/helpers, four classes with 88 members, and lifecycle statics. The protocol verifier checks three complete module factories plus the TurnConfig declaration and registration.

Thirteen deterministic source/recovery comparisons exercise process start/exit, environment filtering, PID cleanup, UTF-8 capture, IPC framing/timeouts/reverse events, readiness/cache/retry/late cleanup, telemetry coalescing, projection and version GC. Six protocol comparisons cover original defaults, token identity, messages, flags, permissive validation and errors.

A separate paired integration launches an **owned test protocol peer** as a real child, connects over a real Unix socket, performs OpenSession and request/reply, kills the child, restarts through the original lifecycle, synchronizes changed paths and shuts down. It retains the original startup gate and cleans both child processes and sockets. It is not a test of the proprietary sandbox executable or its OS protection mechanisms. The real-process case is skipped on Windows; Windows pipes and macOS helper installation remain unverified runtime branches.

```sh
npm run build
npm run smoke:sandbox -w @axonfire/harness
npm run verify:sandbox-cli -w @axonfire/harness -- /path/to/captured/codebuddy.js
npm run verify:sandbox-protocol -w @axonfire/harness -- /path/to/captured/codebuddy.js
```

REA 6.7.0 analyzed the original inert declaration groups under evidence `ev_0daf2a51a670a9c255f0f71671eb94acdd42908ea71c82f5e6bda1a11a76b978`: 8,598 AST nodes, one parsed JavaScript file, zero skipped files and parse failures. Semantic coverage is partial/truncated under the 750-node/150-unknown per-file and global limits and 45-second analysis budget. Static results and finite runtime comparisons do not establish whole-product equivalence.

The default CLI/Web now activates the recovered product graph, including sandbox routing, safe-delete and audit services. The build stages the captured macOS arm64 executable and original shims; native host tests exercise file denial and escalation. Explicit Shell composition remains available below. Cross-platform native deployment, macOS helper installation, network enforcement and projection behavior remain incomplete or unverified. See the [recovery ledger](recovery-status.md) for current integration evidence.


## Rule synchronization

`createNativeSandboxRules` recovers the complete RuleSync service (24 members), six lexical helpers, and four original default/security module factories (64187 declarations; modules 42017, 20852, 3246 and 78918). It preserves network wildcard expansion and ordering, strict/fullAccess profiles, Windows modify-backup exceptions, home/path normalization, directory markers, default write paths, file-safety classification, and backup size bounds. Modules perform no filesystem discovery at import; filesystem checks happen through the explicit runtime when methods run.

Supply `rules: { bashSandboxManager }` to `createNativeSandboxServices` to compose the service with the same lifecycle and mutable TurnConfig. It adds the original RuleSync and BashSandboxManager bindings and matching namespaces. Existing parent namespaces are reused through `runtime.modules`/`runtime.getModule`; `rules.namespace` may explicitly supply the recovered service namespace. The parent BashSandboxManager must implement the actual configuration behavior; the adapter does not manufacture an enabled configuration. No automatic per-turn hook is added: the original Sandbox interceptor or parent invokes `ruleSync.syncRulesOnTurnStart` at its original point.

`syncRules` sends file rules before network rules. Each send catches and logs its own failure; a failed file-rule request does not skip the network request. Configuration acquisition/build errors still propagate. These are recovered behaviors, not new failover decisions. The embedded security classifier preserves original rule precedence, including explicit allowlist ordering; it is not a new independent policy layer.

Fifteen deterministic source/recovery cases cover those branches, including high-risk classification under a command allow, wildcard depth, exact no-backup path boundaries, direct `process.platform` filtering, and shared configuration updates. A paired real-process case sends rules through the original IPC client before and after lifecycle restart, then switches shared permission mode to fullAccess and checks the resulting wire requests. The peer remains a test protocol endpoint, not evidence of native sandbox enforcement.

```sh
npm run verify:sandbox-rules -w @axonfire/harness -- /path/to/captured/codebuddy.js
```

REA evidence `ev_e096f544310ab2dd0647cafaa882de2c3f50b5115d4193ac99b8691bb983cef2` covers the original inert rule/default declarations: 3,329 AST nodes, one parsed JS file, no skipped files or parse failures. Semantic coverage is partial/truncated under the same 750-node/150-unknown limits and 45-second budget. Full declaration/factory AST comparisons and finite behavior pairs supplement this static evidence; full product equivalence remains unproven.


## Bash configuration manager

`createNativeBashSandboxManager` exposes the complete original 18-member manager, configuration/policy/path helpers, shell-root static sets, and six inert utility factories. These include the original shell parser, deep equality implementation, and remote-security translator. The large product re-export namespace is represented only by the translator actually used here; the Linux engine remains an explicit boundary.

To construct the manager alongside rule synchronization, supply:

```ts
const sandbox = createNativeSandboxServices({
  runtime: parentSandboxRuntime,
  logger,
  turnConfiguration: parentTurnConfiguration,
  turnConfig: sharedTurnConfig,
  bash: { settingsManager, execPolicy, sensitiveCommandDetector },
});
```

This assembles both the manager and RuleSync using the same TurnConfig and BashSandboxManager token namespace. A supplied `bash.namespace` can reuse an existing class namespace. Supplying both `bash` and `rules.bashSandboxManager` is rejected because they identify two different manager owners. The parent owns lifecycle and calls the original reset method when needed; no additional automatic Linux initialization is introduced.

The original manager merges scoped settings with default filesystem paths, expands home/project paths, protects settings/log locations, adds managed file blocklists, applies managed network/command/data-security overrides, and deduplicates policy updates. V3/V2 environment configuration precedes the configured policy file. `getConfig()` uses shared `useSandboxCLI` for the returned enabled flag; `loadConfig()` and legacy initialization retain the original settings-based enabled behavior. Error fallback preserves the original shallow-copy semantics.

Linux wrapping uses explicit `runtime.legacy.initialize`, `wrapWithSandbox` and `reset` functions. Missing engine functions throw at that boundary and the original manager handles the error according to its unchanged methods. Dependency checks still require socat/bwrap; no success stub or substituted operating-system sandbox is supplied. Non-Linux initialization delegates to the Sandbox CLI path as in the sample.

Twelve original/recovered component pairs exercise these behaviors, including missing Linux dependencies and a clearly identified engine test adapter. A further real-process pair connects the recovered configuration manager to RuleSync, the original IPC client and lifecycle, observes actual rule wire payloads across restart, and changes shared permission mode. Both sides use the same owned temporary root sequentially, so path-dependent payloads are compared without deleting fields or rewriting paths. This still validates an owned protocol peer, not the native sandbox engine.

```sh
npm run verify:bash-sandbox -w @axonfire/harness -- /path/to/captured/codebuddy.js
```

REA evidence `ev_986d909eda840a551c835e4545f9703526cb94a0367ce0c8730eec57d194798f`: 3,992 AST nodes, one parsed JS file, zero skipped files or parse failures; partial/truncated semantic coverage under the 750-node/150-unknown limits and 45-second budget. Complete original declaration/factory/static AST comparisons and finite behavior pairs provide additional evidence. Default product bootstrap remains incomplete; the explicit Shell composition and its remaining dependencies are described below.

## Shell service and execution handles

`createNativeSandboxShell` exposes the complete original `SandboxShellServiceImpl`, `SandboxPipeExecutionHandle`, and `SandboxPtyExecutionHandle`: three classes with 58 members, nine declaration groups, and eleven original utility factories. These include the actual bundled headless terminal (`62922`), shell utilities (`6453`), terminal serialization (`2752`), output buffer (`83044`), PowerShell/OSC helpers (`70543`), ANSI helpers (`38736`, `79436`, `91371`), shell constants and number utilities (`19702`, `3927`), and Windows Bash path utilities (`70064`). The headless terminal is the original implementation, not a simulated screen.

The service preserves command formatting, environment construction, excluded-command and readiness fallbacks to the supplied local shell, Windows Bash script staging/cleanup, Pipe/PTY request construction, reverse output/exit events, UTF-8 fragments, output truncation, terminal rendering, cancellation/timeouts, result enrichment, and rule-delta updates. Original details remain intact, including duplicate safe-delete bootstrap insertion and partial rule-update error collection.

Compose it using the optional `shell` argument together with either an owned `bash` manager or a borrowed `rules.bashSandboxManager`:

```ts
const sandbox = createNativeSandboxServices({
  runtime: parentSandboxRuntime,
  logger,
  turnConfiguration: parentTurnConfiguration,
  turnConfig: sharedTurnConfig,
  bash: { settingsManager, execPolicy, sensitiveCommandDetector },
  shell: { workspace, sessionManager, settingsManager, localShellService },
});

// Register sandbox.bindings and reuse sandbox.namespaces in the parent graph.
// Shell init is called during composition; it subscribes to session readiness.
await sandbox.lifecycle.ensureReady({ sessionId, appHomeDir, autoProjection });
const handle = await sandbox.shellService.execute({ command, cwd, usePty: false });
const result = await handle.wait();
```

The composition shares the original protocol tokens, Bash manager, RuleSync service and mutable TurnConfig. It binds the Shell service under the original `74674.SandboxShellService` token and exposes the matching shell constants namespace. `shell.namespace` can supply an existing recovered class namespace; `shell.sourceFactory` supports explicit source comparison.

### Parent dependencies and lifetime

Safe-delete helpers (`35568`) and security audit (`48973`) now have separately recovered factories, described below; their namespaces and resource roots must still be supplied explicitly. Encoding libraries (`93130`, `23238`), executable lookup (`5516`), and common services such as the emitter (`80699`) remain explicit parent boundaries. The parent also supplies filesystem/process roots, the shell parser when not available through the composed Bash manager, workspace/session/settings services, and an actual local shell fallback. Recovering their consumers does not establish that these dependencies are fully integrated. Safe-delete helpers can load vendor scripts and perform filesystem work; an empty or successful placeholder is not a production implementation.

The Shell component comparisons use documented test doubles at external boundaries. The separate safe-delete and audit comparisons below exercise their actual recovered implementations with owned filesystem resources. These checks do not establish a complete production deletion, encoding, executable-discovery, or local-execution graph.

Shell `init()` registers a session-ready callback. On readiness, the original service adds reverse-event and disconnect listeners, guarded by its original one-time registration flag. The original code discards the returned unsubscribe functions. `disposeAll()` kills/disposes active handles and cleans tracked scripts, but **does not release those subscriptions, stop the borrowed lifecycle, or guarantee settlement of outstanding `handle.wait()` calls**. The parent must own subscription release, stop new dispatch, and account for accepted work and handle completion before disposing the runtime. This adapter does not add a complete application shutdown owner.

### Shell verification

Fifteen component source/recovery pairs compare original declarations and utility factories with recovered code. A further paired integration runs a real owned child and Unix socket through the original IPC/lifecycle graph: a Pipe handle before restart and a PTY handle after restart receive protocol output and exit events. **The owned peer does not execute commands.** This validates request payloads, reverse events, handle behavior, terminal processing and restart wiring; it does not validate the proprietary executable or native OS sandbox enforcement. The real-process pair is skipped on Windows.

```sh
npm run verify:sandbox-shell -w @axonfire/harness -- /path/to/captured/codebuddy.js
```

REA evidence `ev_e205556d0223073f7fc871897a316540f0a1ffe7f7c741d072f36bc8ec9757ac` covers 52,604 AST nodes, one parsed JavaScript file, zero skipped files and zero parse failures. Semantic coverage is partial/truncated under the 750-node/150-unknown per-file and global limits and a 45-second analysis budget. Complete original declaration/factory/static AST checks and finite behavior comparisons supplement that evidence; full product equivalence remains unproven. Later native CLI/Web integration evidence is recorded in the [recovery ledger](recovery-status.md).

## Safe-delete helpers and shipped assets

`createNativeSafeDelete` recovers seven complete original factories: the safe-delete helper (`35568`), helper-process classification (`8616`), supporting factories (`75753`, `61462`), and the bundled shell-quote implementation (`93289`, `69897`, `50158`). The parent supplies explicit process, module filename/directory, Node module-loader and dependency namespaces, including filesystem and resource roots. The factory preserves lazy guard loading, original path discovery/cache behavior, environment/bootstrap generation, report parsing, escalation decisions, and approval/rejection forwarding.

Eight shipped shim assets are preserved byte for byte (91,969 bytes): the bulk guard, Node preload, Python customization, three safe-bin wrappers, and two shell support files. They were found under the captured application's `cli/vendor/shim`, rather than `cli/dist/vendor/shim`. Their extracted `0644` modes are retained; archive executable flags have not been verified. No native `genie-trash` executable is copied. Byte equality alone does not establish executable packaging or a working deletion backend.

The standalone guard's default threshold is **20**, while the bundled helper's default is **50**. Both original values are preserved. Eleven original/recovered component pairs include guard checks on owned fixture files for counting, approval and rejection, plus a harmless owned Node child that loads the original preload through generated `NODE_OPTIONS`; no deletion is executed. A further real child/socket pair supplies actual recovered safe-delete and audit namespaces to the Shell/IPC graph. The protocol peer does not execute shell commands. Python and shell deletion entrypoints still lack execution coverage, and these checks do not establish all deletion interception paths.

```sh
npm run verify:safe-delete -w @axonfire/harness -- /path/to/captured/codebuddy.js
```

REA evidence `ev_d8f60a0c0532e599b51340c650772cc61d2931f686883a2abdc0216be6de363f` covers the inert original helper factories and bulk guard: 8,863 AST nodes, two parsed JavaScript files, zero skipped files and zero parse failures. Semantic coverage is partial/truncated under the 750-node/150-unknown limits and 45-second budget.

## Security audit

`createNativeSecurityAudit` preserves the complete original factory `48973`. Its explicit runtime supplies `process` and the crypto, filesystem, path and `PathUtils` namespaces; `Date` and `Buffer` may also be supplied. Construction performs no audit writes. Exported operations retain the exact `CODEBUDDY_ENABLE_SECURITY_AUDIT=1` gate and write JSONL under the supplied home directory's `audit-log/spool`. The reader remains ungated. Filesystem and serialization failures are silently swallowed as in the original implementation.

Six original/recovered pairs use real Node builtins and owned temporary directories to check the environment gate, default fields, credential redaction versus raw-command hashing, the 1,024-character preview limit, missing trailing newline repair, malformed-record handling, write/serialization failures, file action precedence, bulk target limits, and network/sandbox event categorization. The original sandbox block helper always emits a network-block event for a nonempty target, even when the supplied block type describes a file; this behavior is preserved.

```sh
npm run verify:security-audit -w @axonfire/harness -- /path/to/captured/codebuddy.js
```

Complete-factory AST equality and these finite comparisons establish the recovered component boundary. They do not establish full default-product integration or operating-system deletion enforcement.

REA audit evidence `ev_5d3f861bc4da84615505d45525fd2bb0e2ee75dd9b445375cdd163e135d738bb` covers 1,760 AST nodes, one parsed JavaScript file, zero skipped files and zero parse failures. Semantic coverage is partial/truncated under the same 750-node/150-unknown limits and 45-second budget. The original module was analyzed as inert syntax; no bundle bootstrap ran.

## Shell routing and finalization hooks

`createNativeSandboxFinalization` preserves four complete original classes (17 members), their four declaration groups, and the complete hook protocol (`38195`) and legacy shell token (`57126`) factories. It does not install global handlers or execute the product bootstrap.

- `DelegatingShellService` chooses the local backend when the Sandbox configuration is disabled or cannot be read. With Sandbox enabled, Linux selects the legacy backend and other platforms select Sandbox CLI. Execution errors propagate; disposal uses the original `Promise.allSettled` behavior.
- `FinalizationFileProjectionSyncHook` queries the opened Sandbox session, synchronizes all returned paths, and optionally commits the returned changes. The `.codebuddy/` whitelist affects classification/logging, not exclusion from synchronization. Reverse progress listeners and the delayed notification timer are released on completion or failure. Aborted, disabled, and non-completed finalization paths retain their original skip behavior.
- `FinalizationModifyBackupHook` can commit even when `final_stop_reason` is cancelled. Its commit label uses 16 Unicode code points, whereas the projection commit message uses the original 200 UTF-16 code-unit limit.
- `SandboxCLISessionEndHook` stops the lifecycle only for `clear` and `resume`, then restores the working-directory state when supplied. Other reasons, including `shutdown`, only flush access telemetry. A failed stop still reaches working-directory restoration.

Pass `finalization: { cwdService }` to `createNativeSandboxServices` to receive the three original hook instances in `sandbox.hooks`, sharing the same lifecycle and TurnConfig. Register this collection with the parent Hook provider; the adapter does not invent execution order or replace the parent's dispatch/concurrency policy. The original hook namespace is exposed through `sandbox.namespaces.get(38195)`. Explicit phase and message-history utility namespaces remain parent dependencies.

To enable routing as well, supply `finalization.delegates: { localShellService, legacySandboxShellService }` alongside the composed Bash and Sandbox Shell services. The resulting `delegatingShellService` is bound under the same `19702.ShellService` token namespace used by the Shell graph. The adapter does not synthesize local or legacy implementations.

```sh
npm run verify:sandbox-finalization -w @axonfire/harness -- /path/to/captured/codebuddy.js
```

Eleven source/recovery component pairs cover routing, failures, progress cleanup, timer escalation, commit messages, backup behavior, and session-end reasons. A further paired integration composes the original/recovered CLI, rules, Bash manager, Shell, safe-delete, audit, and finalization factories with a real owned child and Unix socket. After a forced restart it sends projection and backup commit requests, verifies that `shutdown` leaves the child running, then verifies that `clear` closes it. The peer acknowledges protocol requests; it does not project files, execute commands, or implement native Sandbox enforcement. Phase/history adapters are explicit test boundaries.

REA evidence `ev_6a9669fc186124e6bdfe6c780b28769904ebfe44beca057663f6c4f733e486de` covers 2,825 AST nodes in one inert original JavaScript fragment, with zero skipped files and zero parse failures. Semantic coverage is partial/truncated under the 750-node/150-unknown limits and 45-second budget. Complete declaration/factory AST equality and the finite paired checks supplement this evidence. The local/legacy execution graph, root exit owner and default product bootstrap remain separate unfinished work.

## Combined local, legacy and Sandbox Shell graph

`createNativeSandboxServices` now accepts `local` to own the recovered local Shell and snapshot services in the same graph. It uses the composed Bash manager to construct the original legacy wrapper, supplies the same local service to Sandbox Shell, and lets finalization composition create the original delegating Shell from those owned instances.

```ts
const graph = createNativeSandboxServices({
  runtime, logger,
  local: { workspace, settingsManager },
  bash: { settingsManager },
  shell: { workspace, settingsManager, sessionManager },
  finalization: { cwdService },
});
const shell = graph.delegatingShellService;
```

The caller still supplies the original runtime namespaces and boundaries, including the shared Shell utilities and DI decorators. `local.sourceFactory` supports original-source comparison. Local/Snapshot/Legacy bindings are added to the returned `bindings`, and their `19702`, `35179` and `57126` namespaces are exposed and reused. The root Shell token points to the original delegator; Sandbox Shell's local fallback and the legacy wrapper both reference `graph.local.localShell`. The legacy wrapper does not gain its own active-handle collection.

With `local`, omit `shell.localShellService` and `finalization.delegates`: conflicting owned and borrowed services are rejected before construction. Existing explicitly borrowed-service composition remains available. A combined routing graph requires Bash, Sandbox Shell and finalization components as shown above. This is an explicit composition API, not activation of the default CLI/Web product graph, and it adds no shutdown policy. The parent retains the original snapshot/warmup/handle ownership responsibilities.

The combined-graph integration check verifies original token identity across service namespaces, hook/lifecycle sharing, a real owned Node command through the disabled-Sandbox local route, and a Linux legacy route using an explicitly supplied pass-through engine boundary. It checks that only the local service owns those handles. The Linux check does not prove OS sandbox enforcement. The separate real IPC finalization pair continues to cover Sandbox Shell/process restart/projection requests and session-end cleanup; the new combined-graph test does not claim one end-to-end native Sandbox run.
