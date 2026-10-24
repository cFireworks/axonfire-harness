# Native Desktop file authentication storage

`createNativeDesktopFileAuthentication()` exposes the complete original `FileAuthenticationStorage`, retaining all 50 class members, runtime authentication-configuration and legacy-migration setters, the original logout-marker helper and storage priority enum. Eight source regions from two fixed Desktop files are preserved verbatim. The host supplies the logger, shared data path and product manager; Node filesystem/crypto/timer boundaries and RxJS are explicit.

No installed account is discovered on import or construction. The original path resolver uses the injected authentication ID, then product authentication ID, then `auth`, under the host's `sharedDataPath/auth` directory.

## Persistence and cross-process behavior

- Store serializes the session to a unique temporary file and renames it into place. It checks logout-marker state before and after sensitive steps and confirms that the expected serialized content remains present.
- Refresh/migration stores can preserve an existing logout marker. A normal new login retires the marker. `beginLogout()` publishes a unique marker token; cleanup with a superseded token restores current state rather than removing a newer login.
- Cleanup renames the session to a uniquely named backup and retains the logout marker. Original exclusive link/copy recovery helpers avoid replacing a file that has appeared concurrently.
- Restore ignores a marked-out session, handles malformed files through the original failure path and invokes an explicitly supplied legacy migrator only when needed. Legacy sessions must pass the original domain/endpoint check.
- The directory watcher observes session and marker changes, including atomic replacement. It defers reconciliation during the 300 ms write hold and confirms unlink after 500 ms. An unmarked unlink preserves the in-memory session to avoid a transient deletion causing logout.
- Failed watchers retry with exponential delay from 250 ms up to 30 seconds. A stable watcher resets the delay after 30 seconds. Disposal closes the watcher and clears owned write/unlink/retry/stability timers; no new subject-completion or pending-operation draining contract is added.

## Source and verification

The fixed inputs are Desktop `file-authentication-storage.js` and `common.js`; exported metadata records their SHA-256 hashes and exact UTF-16 ranges. The independent verifier checks both hashes, compares all eight regions and constructs a comparison factory from captured text.

REA evidence `ev_7ff5838aaa1dfef9234f97aadb233e4220d169ae9a42308015c1e2f509dc2111` covers two files, 17,923 UTF-8 bytes, 2,652 AST nodes and zero parse failures.

Six paired scenarios cover real file round trips and path selection, logout/new-login token ownership, corrupt/legacy restoration, a real directory watcher, controlled watcher retry/disposal, and composition with the complete original Desktop authentication manager. The last scenario restores a persisted session, logs in, then logs out through the manager and verifies the session backup/removal and marker on disk.

All filesystem tests use temporary owned directories. The authentication provider, product/environment services and legacy migration source remain explicit fixtures. Live provider registration, parent operation draining and automatic default Web account refresh remain open.

The root build and all 2,400 core tests passed. All six compiled storage scenarios passed under Node and WorkBuddy Electron, including the real directory watcher. Default Web startup is unchanged; no new full host-suite run is claimed.
