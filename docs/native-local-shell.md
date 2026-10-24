# Native local and legacy shell

`createNativeLocalShell` preserves the complete original module `43522`, including its service exports and DI registration statements. This includes the local Shell service, PTY and child-process execution handles, output spiller, ShellSnapshot service, delegating shell, PowerShell safe-delete script and command-formatting helpers. Complete helper factories `35179` (snapshot paths/configuration) and `38590` (Windows process cleanup) are also preserved. The legacy shell's complete class declaration is recovered separately from its original parent module.

## Explicit composition

`createNativeLocalShellServices` constructs the snapshot and local Shell services, injects the supplied logger, workspace and settings services, and calls both original `init()` methods. It returns their original token bindings. Supplying `bashSandboxManager` also creates the legacy wrapper and binds it under the parent legacy token.

Pass the resulting `localShell` and `legacyShell` as the explicit delegates to the [Sandbox composition](native-sandbox-cli.md). Reuse the same `19702` shell and `57126` legacy namespaces across both factories; distinct Symbol instances do not form one service graph. This adapter does not silently replace existing parent services or activate the default CLI/Web graph.

The module requires the parent's original DI decorators and common service namespaces, child-process/filesystem/OS/path boundaries, shell utilities, terminal and serialization utilities, safe-delete helpers, and snapshot path utility. Shared recovered factories can be supplied through `runtime.getModule`; the adapter does not replace them with equivalent-looking implementations. Module `43522` executes its original decorators when instantiated, so the parent decides how registrations are stored and consumed. The separate legacy class uses explicit injection in this adapter.

## Ownership retained from the original

- The local service owns active handles. Its `disposeAll()` clears the active set, disposes each handle and awaits its `wait()`, using `Promise.allSettled`. This does not establish a bounded shutdown if a handle never settles.
- The legacy wrapper delegates execution to the local service, replacing only `command` when the Bash manager produces a different wrapped command. Its own `disposeAll()` is empty and `getActiveHandleCount()` returns zero. This avoids giving the wrapper a second set of owned handles.
- Local initialization schedules an unrefed two-second snapshot warmup. The original does not retain a cancellation handle on the service; `disposeAll()` does not cancel it.
- Snapshot cleanup removes its registered exit callback and cached file. It does not cancel or await an in-flight snapshot creation. Creation failure and shared pending-promise behavior are preserved.
- POSIX formatting retains the original two safe-delete bootstrap insertions and shell quoting. The full PowerShell support script remains in its original declaration.

## Verification and remaining work

```sh
npm run verify:local-shell -w @axonfire/harness -- /path/to/captured/codebuddy.js
npm run smoke:local-shell -w @axonfire/harness
```

The verifier checks all three complete factory ASTs and the complete legacy class declaration against the fixed bundle SHA256 `4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd`. UTF-16 source ranges are recorded in `native-local-shell.ts`.

Eleven original/recovered pairs cover DI registrations and token identity, legacy option identity and ownership, invalid working directories, command formatting, snapshot cache/pending/failure behavior, and snapshot path helpers. One case executes a real owned Node child through the local raw-command path, checks both output streams and exit code 7, then verifies active-handle cleanup. The fixture uses actual recovered safe-delete helpers with deletion disabled, recovered shared terminal/shell utilities, and owned filesystem roots. Encoding, detection and executable lookup now use the [complete recovered Shell IO graph](native-shell-io.md); DI registration remains an explicit fixture adapter. The pending-creation case replaces the creation operation to isolate concurrency semantics. A separate real Bash case captures an owned `.bashrc`, restores functions and aliases in a subsequent local command, verifies completion-function filtering, and removes the snapshot and exit listener. Further real cases reject noisy or syntactically invalid snapshots, check snapshot-command failure, count UTF-8 output-spill bytes, and terminate an owned process group on timeout.

REA evidence `ev_c8cf521a1bb328f8096f62319f9171e583996095d42c4fb58449a33ea22acfc1` covers 8,897 AST nodes in four inert original fragments, zero skipped files and zero parse failures. Semantic coverage is partial/truncated under the 750-node/150-unknown per-file/global limits and 45-second budget.

Complete source recovery is broader than current runtime verification. A real macOS arm64 PTY case now verifies the original PTY handle and headless-terminal path without child-process fallback. Broader PTY input/resize/abort behavior, other output-spill/error/timeout branches, Windows process behavior and PowerShell execution still need focused validation. Legacy execution still depends on the separately supplied platform sandbox engine. Default product DI/bootstrap and end-to-end lifecycle integration are unfinished; no proprietary application bootstrap was run.


## PTY dependency provenance

The captured application declares `@lydell/node-pty` at exactly `1.2.0-beta.14`; the reconstruction now pins that same version. Its platform packages remain the upstream optional dependencies. This supplies the dependency used by the original dynamic import; no alternate PTY implementation or changed fallback policy was introduced. Existing OpenAI SDK pins remain unchanged.

`vendor/pty-provenance.json` records captured and npm-installed hashes for four macOS arm64 files. The package and platform JS entrypoints are byte-identical. The native addon and spawn helper are **not** byte-identical: the captured addon has a Tencent Developer ID signature while npm's addon is ad hoc/linker-signed. A read-only Mach-O comparison finds identical section names, sizes, flags and content hashes across all 11 addon sections and all 7 helper sections. This does not prove that every load command or signing/loader behavior is equivalent. The source verifier rechecks both full-file hashes and these section comparisons on macOS arm64; other platform packages have not received this captured-artifact comparison.

The real PTY test uses the installed npm prebuild. It establishes owned-command execution through the recovered JavaScript path on this host, not a full native-binary equivalence claim. The original extracted spawn helper's observed mode is `0644`; the npm package supplies executable packaging. The captured application files were not modified.

For one composed graph rather than separately constructed delegates, use the `local` option of [`createNativeSandboxServices`](native-sandbox-cli.md#combined-local-legacy-and-sandbox-shell-graph). It reuses the LocalShell instance for the legacy wrapper and Sandbox fallback, binds the root delegator under the same Shell token namespace, and exposes the original snapshot binding. Explicit runtime dependencies and application-level shutdown remain the parent's responsibility.
