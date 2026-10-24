# Native WorkBuddy file local storage

`createNativeWorkbuddyLocalStorage()` restores the complete original `WorkbuddyFileLocalStorage`, its path constants and captured hash utility/dependency closure. Twenty-two regions from fixed Desktop `chunk.js`, `common.js` and `module.app-server.js` remain verbatim. The factory binds Node filesystem/path/OS, the recovered original framework Emitter, product helpers and the host logger. Hash dependencies have an isolated scope so original bundle-local names remain intact.

## Persistence behavior

Entries are JSON files under `<home>/local_storage/wb_entry_<MD5(key)>.info`. The original home resolver prefers a trimmed `WORKBUDDY_CONFIG_DIR`, then the base product's data folder under the OS home, then `.workbuddy`.

`set` creates the directory and writes directly to the entry file. It emits `{ domain: key }` after success and propagates write/serialization failures. `getSync` and async `get` parse the stored JSON; missing files, filesystem errors and malformed JSON return the exact supplied default. Corrupt files remain in place. `remove` emits after success even when the entry did not exist, and propagates removal failures.

The original implementation does not add atomic rename, interprocess locking or a disposal method. A composing owner can dispose its Emitter; this recovery does not attribute stronger write or lifecycle guarantees to the original class.

## Verification and integration

The independent verifier checks three fixed-file hashes and all 22 UTF-16 source regions before running five captured/recovered scenario pairs. Tests cover the original hashed filename/JSON layout, Unicode keys, new-instance persistence, change events, corrupt/missing/null values, write/read/remove failure behavior and product/environment home resolution. Captured MD5 and SHA-256 outputs are also checked against Node's hashes.

The account/product/cloud composition now uses original file local storage for both product and cloud caches, replacing its in-memory adapter. A newly created storage instance and newly created cloud manager read back the previously written remote configuration; a product cache entry is also verified on disk. File-backed account restore, logout/relogin, automatic application synchronization and HTTP-401 rollback continue to pass.

The custom-token provider now shares the composition's host environment, including its owned user identity. Provider registration, clock and diagnostic services remain explicit host boundaries. Default Web activation and parent lifecycle ownership remain open.

REA evidence `ev_432c62bb709d3098db99dfc81b920937ed79787e0519f0a06bf8002e6e1cd31b` covers three files, 51,355 UTF-8 bytes, 11,206 AST nodes and zero parse failures.

Root build passed. Combined file-storage/cloud compiled scenarios passed 10/10 under Node and WorkBuddy Electron. No new full host-suite run is claimed.

Including the corrected existing logging archive scenario, the final compiled checks passed 11/11 under both Node and WorkBuddy Electron.

The final full core rerun passed all 2,436 tests.
