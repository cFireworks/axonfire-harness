# Native Web account and product runtime

Default native Web now constructs the recovered Desktop account/product owner before starting the original sidecar and CLI prewarm pool. It registers the original account-owner and product-snapshot lifecycle bindings with the real runtime manager, prewarm pool, SessionManager and code backend. The offline demo and standalone workbench remain separate entry points.

## Configuration boundary

Web accepts the same launch configuration as the native CLI through their shared input adapter: `AXONFIRE_NATIVE_PRODUCT_CONFIG` takes precedence over inline `ACC_PRODUCT_CONFIG_V3`; a managed path-only `ACC_PRODUCT_CONFIG_PATH` is also accepted. A supplied file must contain a JSON object. Managed spills remain on disk rather than being copied into an environment variable. The recovered CLI `EnvProductProvider` and merger strategies resolve that startup input. The Desktop manager receives an explicit parent provider that delegates to that original parser; the Desktop manager's exclusion rules are unchanged.

Input is kept in a separate environment from the coordinator's published snapshots. A refresh therefore cannot accidentally read its own remote overlay back as local configuration. The tests verify that cloud publication followed by refresh/logout retains the original local models.

The transient control directory contains a staged `cli/product.json` built by the original CLI merger. The Desktop snapshot builder and child CLI use this same effective bootstrap base. Environment JSON files are copied unchanged; other runtime assets are linked to the built original asset tree. If no agent override is supplied, original agent/prompt configuration is retained. An explicit CLI agent replacement remains a replacement.

This shared base is necessary because the original `WorkbuddyEnvAgentsPatchProductProvider` runs in Desktop-spawned CLI processes. It adds missing base agents to an environment snapshot. Feeding it a different base can reintroduce `cli` after a user replaced the agent list, making that agent refer to models absent from the user configuration. The adapter aligns the bases; it does not disable or alter the original patch provider.

The parent's `cliEnv` is refreshed from the coordinator before each host/session environment is built. The initial input-file override is removed from child launch environment so it cannot override a newer resolved snapshot. Input files remain caller-owned; the account owner stages a private copy before invoking the original spill/inline publisher.

## Runtime and shutdown

Account/product instances, file watching, cache persistence, HTTP interceptors, cloud configuration and experiments are managed by [the Desktop owner](desktop-account-product-host.md). Configuration/account state uses the existing native Web state directory. Generated bootstrap assets are transient and are removed with the sidecar control directory.

The Web composition binds original snapshot rotation and auth-owner reset after SessionManager/backend construction. Snapshot changes rotate the real hosted CLI and flush the prewarm pool. Owner changes use the original reset queue, including history invalidation on logout and active backend resets.

Shutdown drains account/product lifecycle work before stopping the sidecar manager and pool, then removes transient assets. It leaves persisted state and original source assets in place. Host-only owner handles are never serialized to browser clients.

Web still supplies local diagnostic/event/notification boundaries; these are not claims of complete Desktop tracing, telemetry or UI restoration. Browser login and account-management UI are not added by this integration. The original custom-token/storage semantics remain unchanged. End-to-end experiment polling, all authentication providers, and platform support beyond the tested runtime still need broader verification.

## Evidence

The already recovered CLI patch module 38569 was re-inspected from the fixed sample at UTF-16 offsets 15,654,757–15,659,142. REA evidence `ev_4fea41e06d9e1015802d234732c44cc68f7006bffaf5ff5c61da23fad6431611` covers the 4,390-byte parseable object wrapper, 1,047 AST nodes and zero parse failures. This is integration evidence for existing original source, not a new module-recovery claim.

Focused bootstrap tests cover input-file preservation and precedence, unchanged prompts when omitted from input, cloud/local baseline isolation, malformed input and explicit agent replacement shared by the snapshot and child assets. The real default Web tests exercise the actual CLI/ACP path. Full-suite results are recorded in the recovery ledger rather than inferred from the focused checks.


The root build and type/syntax checks pass. The latest core regression passes 2,445/2,445 (`work/web-account-core.log`). After the app-level managed-path change, full CLI/Web regression records 126 passes, zero failures and one known original MCP denial TODO, 127 total (`work/spilled-input-hosts.log`). Electron passes all eight focused input, CLI and Web bootstrap cases (`work/spilled-input-electron.log`); the earlier real sidecar owner test also passed (`work/web-account-owned-electron.log`).

The managed spill-path handoff is now supported by both CLI and Web startup. A real CLI test uses the original coordinator with a scoped Linux platform to emit a path-only snapshot over 48 KiB, runs a model request containing its 60 KB prompt, and verifies the source file is unchanged. This test passes under Node and WorkBuddy Electron on macOS; it does not establish execution on a Linux host or broader native-binary compatibility.
