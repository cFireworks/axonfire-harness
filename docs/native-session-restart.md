# Native session restart controller

The complete [SessionManager class](native-session-manager.md) is now recovered. The real lifecycle fixture uses that class directly; the narrower restart/configuration capsules below remain available for isolated source comparisons and scenario testing.

`createNativeSessionRestart` recovers the Desktop SessionManager's six complete restart members and seven supporting declarations. It exposes the original idle-drain, backend replacement and queue restoration behavior through explicit host dependencies. It does **not** supply the full Desktop SessionManager or automatically enable mode switching in the CLI, Web host or `createAddonSession`.

## Source and evidence

The fixed Desktop `initialize.js` SHA-256 is `528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19`; the coordinator SHA-256 is `8624215504229c4b6190f5c2172da270e015cc96871e90b261786f047e4c6e78`. UTF-16 source ranges are exported in `SESSION_RESTART_FUNCTIONS`, `SESSION_RESTART_MEMBERS` and `SESSION_RESTART_POLICY`.

REA evidence `ev_cdcf2a5162edb1f3d739fffbfaa9eedffcc5883123bc43b8570b5d32e4e1cc87` analyzes the isolated original declarations: one file, 10,315 bytes, 1,395 AST nodes, zero parse failures. No Desktop bootstrap is executed. The verifier compares all 13 declarations/members after removing TypeScript annotations, then runs the same ten behavior scenarios against both the captured original and the reconstruction.

```sh
npm run verify:session-restart -w @axonfire/harness -- /absolute/path/to/captured/cli/dist/codebuddy.js
node --import tsx --test packages/harness/test/session-restart-runtime.test.ts
```

The verifier requires the matching Desktop files beside the captured CLI tree, or explicit `WORKBUDDY_DESKTOP_INITIALIZE` and `WORKBUDDY_MODE_COORDINATOR` paths. Ordinary runtime tests and builds do not require an installed WorkBuddy.

## Integration contract

Import from `@axonfire/harness/sessions/native-session-restart.js`. Supply `createBackend`, `wireBackend` and `registerSessionDeferredBuiltinPolicy`; diagnostic logging and the warning sink are optional. These are host adapters, not recovered implementations. The controller uses the already recovered mode normalization and real working-directory validation.

The caller owns the compatible session record: identity, cwd, current backend/configuration, `modeEpoch`, pending desired/runtime configurations and lifecycle flags. `controller.applyPendingRuntimeConfigBeforePrompt(session)` drains pending changes and propagates restart errors. `flushPendingRuntimeConfigIfIdle` can instead warn and return on errors. The caller must coordinate prompt entry, cancellation and disposal. The companion `createNativeSessionConfiguration` below supplies the recovered configuration mutation routing; neither factory supplies the full Desktop lifecycle.

Backend objects provide queue snapshot/save, destroy, initialize, model/mode setters and sandbox mode updates. `releaseRuntime` is optional in the original interface. A real process adapter should implement it: replacement construction can detach the old transport before `destroy`, so transport ownership alone does not establish that the old process has stopped.

## Preserved behavior

- Processing, stop requests and an active prompt invocation defer draining. Disposal returns immediately. Concurrent drains await the same restart promise; newer pending changes are consumed after the current replacement settles.
- Configuration equality uses the restart fingerprint, falling back to the system prompt. It compares model, tools, permission modes, prompt variables, runtime identity and welcome mode. Prompt variables use stable key ordering. This SessionManager comparison does not inspect `sessionSettings` directly, and an unchanged fingerprint hides rendered system-prompt changes. This is not a claim about every Desktop configuration layer.
- Replacement snapshots the queue, creates the backend, registers deferred-tool policy, releases and destroys the old backend, then loads the **same session ID**. A mismatched returned ID is an error. Success installs the replacement, increments `modeEpoch`, wires it, restores the queue and applies model, permission and sandbox settings.
- Queue restoration retains only pending/sending entries, downgrades sending to pending, clears attempt timestamps, sorts and renumbers FIFO order, and replaces the conversation ID with the known session ID. Scheduling starts inactive. Only an error pause and its error message survive.
- Ordinary restart failures destroy the replacement, restore the prior deferred-tool policy and requeue the attempted configuration unless a newer one is already pending. An unavailable cwd drops the attempted pending configuration before touching the backend.
- Snapshot, old-backend cleanup and individual setter/save failures are best effort. Initialization failure can occur after the old backend is destroyed; this is not transactional rollback, and retry does not guarantee recovery of its in-memory queue. The original implementation is retained.

## Verification boundary

Ten scenarios cover ordered replacement, queue contents, busy gates, concurrent draining with a newer configuration, failure retry, preservation of newer pending changes, mismatched identity, invalid cwd, best-effort failures, fingerprint equality and pause normalization. They use controlled backend doubles with the real cwd validator. The separate process-level fixture below verifies a successful owned CLI replacement and persisted history recovery. Failed live replacements, full configuration mutation routing, transport reconnection and Desktop event wiring still require coverage before automatic mode restart can be claimed for a runnable host.


## Real CLI replacement through ACP

`apps/web/test/native-session-restart.test.mjs` now calls the recovered `updateSessionConfig` entry point and backend `reconfigure` decision before the restart controller replaces the owned native CLI process. It no longer manually fills pending restart fields. It now constructs the complete recovered `CodeBuddyCodeBackend` through the original AppServer backend factory and starts real CLI processes through the recovered SidecarManager and daemon. Original initialization, argument/prompt-file generation, ACP transport, reconfiguration, queue operations and destruction replace the former hand-written backend adapter. The fixture retains a private HOME/state directory, owned model endpoint and explicit account/connector boundaries; automatic configuration updates in CLI/Web remain unwired.

The fixture verifies:

- The first process has the first system prompt and Read-only schema. Its completed question and answer are persisted.
- The old process exits before the replacement starts, and its old HTTP endpoint is unavailable afterward.
- The replacement is launched with the same session ID, then ACP loads that session. The backend returns its known ID after a successful load, matching the original `initializeInternal`; ACP `session/load` itself does not return an ID.
- Queue snapshot/save use real `session/get_message_queue` and `session/save_message_queue` requests. Sending entries become pending, sent entries disappear, ordering becomes contiguous and the error pause survives.
- The next model request sees the new system prompt and Write schema, retains the old question/answer and excludes the old system prompt. Write executes under the replacement's AcceptEdits configuration and its real file content and model-visible tool result are asserted. The paused queue produces no extra model requests during this exchange.

The replacement load forwards the request metadata as the original load branch does; it does not add the original new-session branch's `codebuddy.ai/continue` flag. Initial creation enters the recovered `startSession` and the complete backend's own new-session branch, which calls `session/load` with the known ID and `codebuddy.ai/continue: true`. This still does not reproduce every Desktop backend initialization branch.

REA evidence `ev_4ae787a832146c87e48961ee68c10a48e6f35cbb692e0576d14595ea1046b530` covers the original backend's complete `initializeInternal` (5450447–5462844), queue getters/setters (5479096–5479223 and 5479225–5479363), and `callSessionExtension` (5490493–5491063): 13,261 bytes, 1,838 AST nodes, zero parse failures. That earlier evidence guided the former fixture adapter. The complete backend is now separately recovered and verified; see [backend source and boundaries](native-code-session-backend.md).

```sh
npm run build
node --test apps/web/test/native-session-restart.test.mjs
```


## Configuration mutation and backend decisions

`createNativeSessionConfiguration` in `@axonfire/harness/sessions/native-session-reconfiguration.js` composes the restart controller with three complete SessionManager members: `updateSessionConfig`, `enqueueSessionConfigMutation` and `applyDesiredConfig`. Its `createBackendReconfiguration` helper supplies the complete original backend `reconfigure` member. Thirteen helper functions and the original permission-mode constant are also recovered.

Host adapters supply session acquisition (`withReadySession`), public session projection, desired-config persistence, runtime resolution and optional disabled-tool resolution, in addition to the restart dependencies. The factory owns the mutation-tail and runtime sandbox-override maps. It does not implement missing-session resume, Desktop persistence or event subscriptions on behalf of those adapters.

| Change | Original behavior |
| --- | --- |
| Model only, with no pending restart/config | Clone current runtime config, replace model, ask backend to reconfigure; skip full resolution |
| Sandbox only | Apply sandbox setting, update desired config and persist; skip cwd validation and runtime resolution |
| Sandbox reason without a sandbox flag | Remove the reason-only patch before applying |
| Mismatched expected expert | Return `configUpdateApplied: false`; skip mutation and matched callback |
| Tools, fingerprint, runtime identity, pre-plan permission, welcome mode or prompt variables | Backend reports `restart_required` in that order, after the agent-teams environment check |
| Agent-teams environment drift | Require restart even when the runtime config otherwise compares equal |
| Permission/model change without a restart reason | Apply nonempty permission mode first, then nonempty model, then replace backend runtime config |
| Settings-only difference | Backend returns `applied` and stores the config; this method sends no settings RPC |

Mutations serialize per session. A failed mutation does not poison later operations. Mode changes derive tools with the disabled-tool resolver unless tools were explicitly supplied. Explicit addon selection controls the selected modes, strips derived work-mode plugin IDs and clears stale tools unless the patch supplies them. A restart-required response publishes pending configs, increments the mode epoch and launches a deduplicated idle flush; the successful restart increments the epoch again. During an active prompt, the pending configs remain queued.

These methods preserve nontransactional behavior: sandbox delivery occurs before later resolution/validation, and a successful permission setter can precede a failing model setter. They do not roll back those external effects. A successful backend `applied` result does not by itself prove every changed field reached the running CLI.

REA evidence `ev_6cfe67a8d29e77d9dad7270064e3ecec4eef47fc1e02c21f50794765bf6edb08` covers the isolated original declarations: 14,895 bytes, 1,936 AST nodes, zero parse failures. `verify:session-reconfiguration` compares **18 complete AST declarations/members** and runs **nine paired scenarios** against original and reconstructed code. Those scenarios cover restart precedence, setter failure ordering, model fast paths, sandbox rules, expert preconditions, busy mode changes, addon selection, serialized failure recovery and model updates while a restart is pending.

The real-process fixture now also attaches the recovered readiness methods. Its first preparation hook calls `updateSessionConfig`, causing real process replacement; the recursive preparation call then reports `backendRestarted: true`. The fixture asserts preparation flags `[false, true]` and that the selected backend is the new session backend before sending the next prompt. The real-process fixture uses the recovered fallback runtime resolver. The companion readiness, startup and record attachments below now replace its provisional session-acquisition and persistence callbacks; the database implementation remains a test adapter. Default CLI/Web automatic mode switching, complete Addon resolution at that entry point, failed live replacement and reconnect remain unverified integration work.

```sh
npm run verify:session-reconfiguration -w @axonfire/harness -- /absolute/path/to/captured/cli/dist/codebuddy.js
node --import tsx --test packages/harness/test/session-reconfiguration-runtime.test.ts
```

## Readiness and prompt preparation

`attachNativeSessionReadiness` in `@axonfire/harness/sessions/native-session-readiness.js` installs eleven complete original SessionManager members on a recovered configuration/restart controller. Attach it once during host construction. It initializes the restore, replay and lifecycle maps and replaces the host's provisional `withReadySession` adapter with the recovered implementation. The host supplies the active-session map, stored-record lookup, actual session startup, replay-state replacement and optional preparation hook. It remains responsible for setting prompt/cancellation/disposal state and implementing startup safely.

Ordinary operations resolve the active session or resume an inactive one, wait for an in-flight backend restart and drain pending configuration before executing their action. The explicit `skipAwaitRestart` option used by configuration mutations bypasses that wait/drain step so a configuration change can be published during a restart. Failure in preparation prevents the action.

Prompt dispatch drains pending changes before invoking the preparation hook, drains again afterward and recursively prepares again if the backend changed. The hook receives `backendRestarted` relative to the last successfully prepared backend. Hook errors are warning-only and do not update that prepared marker. This is the recovered preparation path; the larger original prompt method's watchdogs, state transitions and activity flags are not provided by this attachment.

Inactive restoration preserves these original rules:

- An active session returns immediately. Otherwise a pending load satisfies either load or resume; a pending resume satisfies another resume but does not prevent a distinct load from starting.
- Stored cwd takes precedence over primed replay cwd, which takes precedence over the requested cwd. Normalization trims whitespace and trailing separators without resolving relative paths to absolute paths.
- A stored record without any cwd gets a new `wb-session-` temporary directory. `temporaryRoot` redirects that allocation for an owning host; cleanup remains the host's responsibility. No record and no cwd is an error.
- Startup receives the current lifecycle generation. Deleted or superseded generations are rejected by the original assertion. A custom startup adapter must also perform the appropriate generation checks across its own asynchronous work. The companion startup attachment below supplies the original checks around backend initialization and persistence.
- Primed replay is consumed after successful startup. Completion removes a pending-restore entry only if it still points to that restore, preserving a newer in-flight load. Failure clears its own pending entry so a later retry can proceed.

REA evidence `ev_5fb9f6873be05f2a8f3431b0fa1bd0778a2710b8ad32691c6d3722f9edb73849` covers 5,812 bytes and 756 AST nodes with zero parse failures. The verifier checks twelve complete AST declarations/members and eleven paired scenarios, including wait ordering, drain errors, hook-driven backend replacement, nonfatal hook errors, active reuse, cwd/replay precedence, restore sharing, load/resume overlap, failed restore retry, real temporary-directory allocation and lifecycle generations. Inactive startup and storage are controlled adapters in these scenarios, not a claim of complete Desktop restoration.

```sh
npm run verify:session-readiness -w @axonfire/harness -- /absolute/path/to/captured/cli/dist/codebuddy.js
node --import tsx --test packages/harness/test/session-readiness-runtime.test.ts
```

## Session startup

`attachNativeSessionStartup` in `@axonfire/harness/sessions/native-session-startup.js` adds the complete original `startSession`, `buildDesiredConfig` and pending-disposal wait methods. Twenty-six local function dependencies preserve configuration restoration, metadata, cwd validation and task-state initialization. The existing Addon recovery supplies its error class and fixed plugin constants.

Attach it once after configuration and readiness, before operations begin. It replaces the readiness startup adapter and initializes the pending delete/disposal maps. The owning host still supplies backend construction/event wiring, runtime resolution, record lookup and persistence, hydration completion and deferred-tool policy storage. Stored plugin context must have the normalized original shape; these methods are not a replacement for record-store validation.

The recovered startup sequence validates cwd, waits for pending deletion/disposal as appropriate, establishes a lifecycle generation and restores stored configuration. Explicit fields take precedence; an existing runtime sandbox override can fill an unspecified sandbox choice. Stored project identity is excluded when the current user and stored owner differ, while an explicit project is propagated through `CODEBUDDY_PROJECT_ID`. Backend initialization is followed by identity and lifecycle checks before publication, persistence and final return.

Startup preserves the original session-state maps and flags, task status, hydration mode and mode epoch. Terminal stored task states survive. In-flight planning/working/pending states older than thirty minutes become terminated; other in-flight restoration falls back to the initial idle state. Load initialization begins history hydration and invokes the supplied completion adapter afterward.

On failure inside the original guarded initialization sequence, startup destroys its backend and removes/unregisters only the session it still owns. A newer session in the map is preserved. Sandbox and permission setters are best effort. This is not transactional cleanup of every possible earlier failure: runtime resolution and `wireBackend` occur before the guarded initialization block, and external storage or event adapters retain their own contracts.

REA evidence `ev_310c43dafb1041f4736649ea19457dff6b1ea60170905e3d55094ec16917102a` covers the isolated original source: 24,435 bytes, 3,264 AST nodes and zero parse failures. Verification compares **29 complete declarations/members** and runs **13 paired scenarios**, including initial publication, stored/explicit configuration precedence, project ownership, plugin context, deletion waits, disposal failure, initialization failure, identity mismatch, deletion during initialization, replacement during persistence, record failure, setter errors and stale task states.

```sh
npm run verify:session-startup -w @axonfire/harness -- /absolute/path/to/captured/cli/dist/codebuddy.js
node --import tsx --test packages/harness/test/session-startup-runtime.test.ts
```


The real CLI fixture now starts its first session through the recovered `startSession`, rather than constructing the manager session record by hand. It uses a known UUID and the original backend's `session/load + continue` new-session attachment pattern. Subsequent preparation-hook reconfiguration and restart continue to verify history, paused queue restoration and real Write output. The companion record attachment below now supplies Desktop record projection and database routing. The database implementation, event wiring and hydration callbacks remain fixture adapters; CLI history persistence and ACP/SDK execution are real.

## Session records and effect ordering

`createNativeSessionRecords` in `@axonfire/harness/sessions/native-session-records.js` supplies the original database-facing `createSessionRecordStore` and an `attach(controller, recordStore)` function. Attach once after configuration, readiness and startup. It installs ten complete manager methods and initializes the effect-chain map. Twenty-three complete helper declarations preserve metadata, plugin-context projection, expert selection, status normalization and database adaptation.

The adapter receives the original-style dependency promise containing a `database` object. It calls optional database initialization before each operation and delegates get/list/upsert/delete. It does not implement the Desktop database service, SQLite schema, migrations or repository merge policy. Supplying a test database proves the adapter path, not durable database equivalence.

Startup persistence creates a complete record when missing. For existing records it fills missing metadata/choices and compares stable expert/plugin state before writing; existing user choices and timestamps are retained. Desired-config persistence projects current mode/model/permissions, explicitly clears removed expert fields to empty strings, updates explicit welcome metadata and preserves the existing `updatedAt`. Clearing the previous expert selection stores `{ version: 1, selection: null }`.

The original effect ordering has precise limits:

- `enqueueSessionEffect` skips a session that is already stale when enqueued, serializes accepted effects per ID and continues after an earlier effect rejects.
- It does not recheck owner identity when an already accepted effect eventually runs. Individual effects must retain their own guards; startup persistence checks lifecycle generation before and after its database read.
- `flushSessionEffects` waits for the tail observed at call time, not effects appended later.
- `upsertSessionRecord` is not itself an enqueue operation. It updates active in-memory timestamps before awaiting the database write; a failed write does not roll back those timestamps. Configuration mutation routing provides its own serialization.

Reading an inactive stored `planning`, `working` or `pending` record immediately persists `terminated` without changing `updatedAt`, regardless of age. Active records are left alone. This reconciliation is distinct from the startup helper's thirty-minute stale-task rule and runs before normal inactive startup uses the record.

The database adapter fills a missing user ID from its optional callback. When an existing archived record is written with a non-archived status and the database supports `updateSessionStatus`, it takes the status-only path and does not apply the other supplied fields. If that database method is absent, it uses ordinary upsert. These are preserved original semantics, not substitute merge rules.

REA evidence `ev_8c8b17535e92fdeddbbed4b2509fca5a5f220d945bb885122d0d9f3a5049d252` covers 18,583 bytes and 2,729 AST nodes with zero parse failures. Verification compares **33 complete declarations/members** and runs **13 paired scenarios**, including startup merging, lifecycle races, effect ordering/failure, stale ownership, flush scope, explicit clearing, timestamp failure ordering, inactive reconciliation and archived-record adaptation.

```sh
npm run verify:session-records -w @axonfire/harness -- /absolute/path/to/captured/cli/dist/codebuddy.js
node --import tsx --test packages/harness/test/session-records-runtime.test.ts
```

The real CLI fixture composes this record attachment with startup, readiness, configuration routing and restart. The SQLite repository integration below replaces its initial in-memory database seam. The two real CLI processes exercise durable CLI history, ACP queue restoration and actual Write execution; this does not establish the full Desktop database lifecycle.

## SQLite repository and bundled ORM

`createNativeSessionRepository(orm)` in `@axonfire/harness/sessions/native-session-repository.js` exposes the complete original `SessionRepository` and its `sessions` and `workspaces` table declarations. The factory uses the existing recovered plugin-context serializer/parser. `createNativeStorageOrm(BetterSQLite)` in `@axonfire/harness/vendor/captured-storage-orm.js` preserves 53 complete Drizzle regions from the fixed Desktop bundle, including its SQL builders and better-sqlite3 adapter. It does not substitute a newer ORM or execute the Desktop bootstrap. The host supplies a compatible better-sqlite3 constructor or passes its compatible client directly to the returned `drizzle` function.

The captured better-sqlite3 package identifies itself as **12.8.0**. Its shipped native binary requires Node ABI 136; this host's Node 23 uses ABI 131, so that binary cannot execute here. Tests use an explicit Node SQLite bridge for the repository's prepare/run/get/all operations. Its raw-row conversion supports this repository's unique selected column names; it is not a general driver replacement or a production fallback. No dependency version or native binary was replaced.

The repository preserves the original SQL behavior:

- Upsert canonicalizes paths with `path.normalize`, preserving Unicode normalization and case. Blank models become null; most nullable incoming fields coalesce with existing values. Explicit empty expert strings clear the mapped expert fields.
- Existing nonempty user IDs and case-insensitive archived status survive ordinary upserts. `updateStatus` explicitly changes archived status; the record adapter's archive-restoration path still changes status and timestamp only.
- A session that has become non-playground cannot become playground through upsert. Background automation `false` becomes null and therefore cannot clear an existing true value through this merge. Sandbox false is stored explicitly and does clear true.
- Lists require a user ID, include legacy unclaimed rows, exclude soft-deleted rows by default and sort by update time. Suffix queries escape `%`, `_` and backslash before using SQL LIKE.
- Deletion is soft. Nonterminal repair updates all nonterminal rows, including soft-deleted rows, to `Terminated`. Workspaces appear only while a nondeleted, non-playground session refers to them.
- Owner lookup deduplicates IDs and queries in chunks of 500. Invalid persisted plugin/expert JSON is ignored according to the original parsers.

REA evidence `ev_d467ba361124d5f5f6934c3adf4b4ee8ac410c6445ca0165fc73e8b6b965df4a` covers two inert source files, 150,102 bytes and 21,114 AST nodes, with zero parse failures. Its semantic graph is bounded and incomplete. Verification compares **212 complete top-level AST statements** across the ORM and seven repository/helper/table declarations. Eleven paired scenarios execute actual SQLite SQL and include file close/reopen, merge rules, owner filtering, soft deletion, suffix escaping, terminal repair, workspace visibility, chunking, JSON failures, permission updates and adapter-driven archive restoration.

The initial repository tests created a schema from recovered table declarations. The migration integration below now initializes their SQLite files through the original schema adoption and migration pipeline. WAL checkpointing, corruption repair, sidecar recovery, automation repository behavior and complete `WorkbuddyDatabaseService` lifecycle remain separate recovery work.

```sh
npm run verify:session-repository -w @axonfire/harness -- /absolute/path/to/captured/cli/dist/codebuddy.js
node --import tsx --test packages/harness/test/session-repository-runtime.test.ts
```

The real CLI replacement fixture now uses this recovered repository and ORM against an owned SQLite file. It verifies initial records, changed mode/permission settings and owner metadata after closing and reopening the database. The native fixture passes **1/1** in 7.4 seconds (`work/session-repository-native.log`); it continues to verify actual process replacement, persisted CLI history, paused queue restoration and Write execution. Its database driver/schema setup and service forwarding remain explicit test adapters.

## Database schema adoption and migrations

`createNativeStorageMigrations(orm, BetterSQLite?)` in `@axonfire/harness/storage/native-storage-migrations.js` restores five complete original regions: legacy schema adoption, all eight schema table declarations, the migration entry point and materializer, raw/Drizzle connection helpers and SQLite connection settings. It consumes the recovered ORM's migration reader, executor, embedded SQL and journal. The ORM wrapper now binds Node filesystem and crypto modules required by that reader; no migration SQL or journal entries were changed.

The pipeline adopts known missing columns on existing legacy tables, writes three original SQL files and their journal beneath `<configDir>/.workbuddy-sqlite-migrations`, executes the Drizzle migrations and asserts required table/column names. It creates the sessions, workspaces, automation, delivery, migration-meta and usage tables. Identical materialized files keep their timestamps; changed contents are replaced by the original embedded content. Connection configuration sets WAL, a 10,000 ms busy timeout and a 1,000-page auto-checkpoint.

These original limits are preserved:

- Adoption skips absent tables and does not add the plugin-context or last-expert columns; their journaled migrations do that.
- Adoption runs before the SQL migration transaction. A later failure rolls back transaction-local schema changes and journal inserts, but does not undo already adopted legacy columns.
- An existing plugin-context column without a corresponding journal can cause duplicate-column failure. The original pipeline does not infer or repair missing migration history.
- Drizzle selects migrations from the latest recorded timestamp. A missing migrated column is not recreated when the journal says its migration already ran; final validation rejects the incomplete schema.
- Schema validation checks names, not declared column types. The separate automation-runs column-type probe can report `BLOB` even when the required-column check passes.
- Standalone usage-table repair is independently idempotent and preserves existing rows.

REA evidence `ev_10a1269424b17c2f1918f52f2aa705ef8076905fe18899cb3e1ee9cd187968fb` covers 22,734 bytes and 2,280 AST nodes with zero parse failures. Verification compares **32 complete migration/schema statements**, plus the existing **212 ORM/repository statements**, and runs **10 paired SQLite scenarios**. These cover new databases, ID-only legacy tables, a partially applied journal, materialized-file restoration, missing-schema diagnostics, usage repair, connection pragmas, transaction rollback boundaries, declared types and a journal/schema mismatch.

Repository scenarios and the real CLI replacement fixture now initialize their owned database through these original migrations rather than generated test DDL. The Node SQLite driver bridge and service forwarding remain test adapters. The complete DatabaseService integration below adds startup/retry and recovery coverage. The migration pipeline alone does not establish native better-sqlite3 execution, WAL damage handling, sidecar recovery or migration from other product stores.

```sh
npm run verify:storage-migrations -w @axonfire/harness -- /absolute/path/to/captured/cli/dist/codebuddy.js
node --import tsx --test packages/harness/test/storage-migrations-runtime.test.ts
```

With original migration initialization enabled, the compiled migration/session regression passes **77/77** and the real CLI replacement fixture passes **1/1** in 7.3 seconds (`work/storage-migrations-built.log`, `work/storage-migrations-native.log`). Full build and configuration checks pass; the core suite passes **2,081/2,081**. These gates do not replace the separately recorded full-host aggregate.

## Complete DatabaseService and recovery

`createNativeDatabaseService(deps)` in `@axonfire/harness/storage/native-database-service.js` exposes the complete original `WorkbuddyDatabaseService`, four dependent repositories (automation, delivery outbox, usage and migration metadata), file loggers, global-reference helpers, ghost cleanup and legacy vscdb reader. It composes the recovered session repository, ORM and migration pipeline. Eighteen complete original declarations are retained; this is the full captured class, not a selection of lifecycle methods.

The host supplies a compatible `BetterSQLite` constructor and runtime-context directory functions (`getWorkbuddyRuntimeConfigDir` and `getWorkbuddyRuntimeLogsDir`). An explicit `osModule` can scope home-directory lookup; an optional logger can replace the factory's logger singleton for an owning host or test. Otherwise the original buffered file logger is used. Each factory owns its module-level database reference and logger singleton. The owning application must dispose its services and logger; creating this factory does not automatically register the global database reference or start periodic health/checkpoint jobs.

Startup creates the database directory, checks the existing WAL, opens/configures SQLite and runs the recovered migrations. It attempts initialization three times, preserving the original one-second synchronous waits between failed attempts. Exhausted ordinary errors retain the files and report runtime/package information. Corruption/access errors enter the original diagnosis/recovery branches; the ordinary retry count does not by itself authorize deleting a healthy database.

The recovered paths include:

- WAL diagnosis temporarily renames WAL/SHM evidence, checks the main database in isolation and restores the evidence in `finally`. WAL-only repair backs up/removes the owned WAL and reopens the main database.
- Full main-database recovery backs up damaged files, recreates the schema, restores sidecar session indexes and automation file backups, supplements eligible sessions from legacy vscdb and records recovery metadata.
- Invalid WAL header detection can trigger sidecar reconstruction after otherwise successful initialization. The original header threshold and severity labels are preserved.
- Recovery notices are read at most once per service instance, including when the marker is missing or malformed. A malformed marker may already have been removed before parsing fails.
- Ghost cleanup soft-deletes sessions whose cwd is empty or absent, while retaining sessions with live directories. Automation/run cleanup branches are also retained.
- Automation backups have asynchronous queued writes and synchronous disposal flushing. Disposal checkpoints/closes the connection, clears the module's registered database reference and prevents later initialization on that service instance.

Sidecar reconstruction preserves the original bounded JSONL reads, title precedence, metadata fallback and playground inference. It is not a general lossless replay of every field: restored records are marked `Completed`, owners start empty, and title/model/cwd information comes from the fields the original extractor recognizes. Original repository merge rules still apply.

REA evidence `ev_81f5a541a9bfd780e135c07872f6869a138208bdb1370082c2bec418999cc753` covers 96,554 bytes and 11,771 AST nodes with zero parse failures. Source verification compares **18 complete declarations** and verifies **244 dependency statements**. Eleven paired scenarios run against owned real SQLite files through the explicit Node SQLite test driver. They exercise initialization/reopen/disposal, retry success/exhaustion, a damaged main file rebuilt from sidecar and automation backups, WAL evidence restoration/repair, invalid-header recovery, header variants, notice consumption, ghost sessions, automation backup flushing and JSONL title extraction.

The default core recovery tests use the Node SQLite bridge. The native-driver validation below adds matching-ABI execution and one real pinned-reader WAL case. Broader large/busy WAL checkpoint matrices, scheduled health-check timing, every delivery-outbox state transition, every legacy vscdb variant, filesystem permission failures and cross-process writer matrices remain unverified. Recovering the complete class does not establish every branch's behavioral coverage or automatic Desktop/Electron integration.

```sh
npm run verify:database-service -w @axonfire/harness -- /absolute/path/to/captured/cli/dist/codebuddy.js
node --import tsx --test packages/harness/test/database-service-runtime.test.ts
```

The real CLI replacement fixture now gives the recovered record adapter a complete DatabaseService instance using the test SQLite constructor. Its initial repository-forwarding and schema-setup adapters are removed. Records survive original service disposal/reinitialization while CLI history, paused queue, new prompt/tool schema and actual Write continue to pass. Full build/configuration checks pass, core tests pass **2,092/2,092**, compiled database/migration/session tests pass **88/88**, and the native fixture passes **1/1** in 7.5 seconds (`work/database-service-native.log`). No new full-host aggregate is implied.

## Captured native SQLite driver and runtime separation

The original better-sqlite3 **12.8.0** binary is now verified under the installed WorkBuddy Electron **37.10.3** runtime in `ELECTRON_RUN_AS_NODE=1` mode: Node **22.21.1**, ABI **136**, SQLite **3.51.3**, macOS arm64. No original application bootstrap is executed. The binary remains unchanged, SHA-256 `e0acce53677ede79ce4f323eee875f30c7c010fff5c1a9f48734ffb2da542ad1`. The verification loader checks this digest and package version, then confirms the default package loader cached that exact native file.

REA Mach-O evidence `ev_d132293dc6db3743a66a951886dec04c32dba3a7c65b60efae3de764f1a8fdd4` identifies an arm64, 64-bit Mach-O bundle, UUID `E81338E5-5476-3095-9CF8-33BDBF1A0BAD`. This is binary-layout evidence, not a native decompilation. ABI compatibility and SQLite execution are established by the runtime probes and tests.

All **11 database-service scenarios** pass against both captured and recovered code using the original native driver (`work/database-original-driver-verify.log`). A separate paired scenario creates a **16 MiB WAL** with a pinned reader: the reader retains its old snapshot, the writer sees all sixteen committed rows, and the original startup checkpoint reports busy and leaves WAL intact without quarantine. After releasing the reader, initialization checkpoints successfully and all sixteen rows remain (`work/database-original-wal-final.log`). The original ten-second busy timeout is retained; this is one real concurrency case, not an exhaustive WAL matrix.

The complete native-driver CLI replacement fixture passes **1/1** in 7.6 seconds with runtime separation: Electron hosts the recovered Desktop DatabaseService and original binary, while the owned CLI processes use the normal Node executable. `startNativeProductProcess` accepts an explicit `nodeExecutable` for such hosts and defaults to `process.execPath`. The fixture verifies records after database service disposal/reinitialization together with actual CLI history, queue, prompt/tool-schema and Write behavior. Its logs are in `work/database-original-driver-native-node-cli.log`.

An initial attempt to run the CLI child under Electron Node mode timed out before readiness (`work/database-original-driver-native.log`). Investigation found that the fixture's isolated child environment omitted `ELECTRON_RUN_AS_NODE=1`, so the child did not enter the intended mode. The fixture now preserves explicitly selected Electron Node mode. The same command then passed with both host and CLI children using Electron (`work/database-electron-node-env-fixed.log`); the earlier timeout is not evidence of CLI incompatibility. Independent Node children remain supported through `nodeExecutable`. The normal Node 23 host still cannot load this ABI-136 database binary directly. No driver recompilation, replacement or default-runtime change was made.

Run the optional fixed-sample checks with your own paths and an ABI-compatible runtime:

```sh
export WORKBUDDY_SQLITE_DRIVER=/absolute/path/to/sample/node_modules/better-sqlite3
export WORKBUDDY_BUNDLE=/absolute/path/to/sample/cli/dist/codebuddy.js
ELECTRON_RUN_AS_NODE=1 /absolute/path/to/matching/Electron --import tsx \
  packages/harness/scripts/verify-native-database-driver.ts

# The compiled fixture needs npm run build first.
ELECTRON_RUN_AS_NODE=1 \
AXONFIRE_TEST_SQLITE_DRIVER="$WORKBUDDY_SQLITE_DRIVER" \
AXONFIRE_TEST_CLI_EXECUTABLE="$(command -v node)" \
/absolute/path/to/matching/Electron --test apps/web/test/native-session-restart.test.mjs
```

`--wal-only` limits the source verifier to the slower pinned-reader case; `--outbox-only` runs the six delivery-outbox cases. Omitting `AXONFIRE_TEST_CLI_EXECUTABLE` in the fixture command uses the matching Electron Node runtime for CLI children too. These optional checks require the external fixed sample and matching runtime; ordinary local CLI/Web use does not acquire that requirement. Build/configuration checks pass. The default Node bridge database tests pass **11/11**, its CLI fixture passes **1/1**, and default-runtime ACP regressions pass **6/6**. No new full core or full-host aggregate was run; their previously recorded scope and unresolved failures remain unchanged.

## Delivery outbox ownership and recovery

The complete recovered `AutomationDeliveryOutboxRepository` is now exercised through DatabaseService with two real SQLite connections and with the original native driver. This verifies persistence and ownership semantics; it does not send messages or exercise external delivery providers.

- Deduplication preserves the first row and payload for a dedupe key. Claiming orders eligible rows by next-run and creation time and clamps the limit to at least one. This repository does not enforce `maxAttempts` during claim; that policy belongs to callers.
- Claiming selects candidates and then conditionally updates each row. It is not one transaction covering the whole batch. A deterministic interleaving lets a second connection claim after the first connection's SELECT but before its UPDATE; the first connection's guarded update then returns no claim, preserving exclusive ownership.
- Success and failure updates require the current `in_flight` status and matching worker. Authorization deferral can preserve the attempt count; ordinary failure and success increment it. Success clears the prior error and lease.
- Expired leases become `manual_required` with `lease_expired_ambiguous`, retain attempt count and survive reopen. They are not automatically requeued because delivery may already have occurred. An in-flight row without an expiry is not reclaimed by this operation.
- Cleanup spends its shared limit on aged terminal rows first, then excess failure rows, retaining the newest configured failure count. Strict age cutoffs, pending rows and missing finish timestamps are preserved.
- Supersession matches automation, channel, owner and host, then requires a strictly later creation time. It does not filter the newer row's status.

REA evidence `ev_69a6a95a4832161a5c4dbbc2d842777bf5f433b7a5c49dfa85f5f07db190fded` covers the complete original repository declaration: 8,884 bytes and 1,326 AST nodes with zero parse failures. Its AST is already included in the DatabaseService's eighteen-declaration verifier. The default verifier now runs **17 paired service/outbox scenarios** (`work/database-outbox-verify.log`); the six new scenarios also pass with the hash-verified original better-sqlite3 binary (`work/database-outbox-native-verify.log`). The interleaving uses real independent connections with a test hook at SELECT completion; it is not a claim of an uncontrolled cross-process stress test.

Final gates for the outbox and Electron-mode fixture changes: full build/configuration verification passes; core **2,098/2,098**, compiled service/outbox **17/17**, Electron/native-driver CLI replacement **1/1** (7.3 seconds) and default Node/bridge replacement **1/1** (7.8 seconds). These focused host runs do not replace the separate full-host aggregate.


## Session deletion and resource disposal

`attachNativeSessionCleanup` in `@axonfire/harness/sessions/native-session-cleanup.js` installs nineteen complete original methods and ten field initializers, with four supporting declarations. Attach it once, after readiness, startup, configuration and records have been composed, before accepting operations. Reattaching resets owned history generations and cleanup bookkeeping. The host supplies deferred-policy unregistration and task-state signaling; optional deletion, usage-cache, recommendation and prompt-composer adapters retain their original contracts.

Closing and deleting have different semantics. `destroySession` waits for an existing restore, removes the active owner, cancels processing, drains effects and restart work, stops timers/watchdog and destroys the backend. Hydrated history is cloned into replay state only while its generation is unchanged and no replacement owner or replay has appeared. `deleteSession` first tombstones the identity and advances lifecycle/history generations, invalidating older restores, then disposes without preserving replay and clears stored records and usage through adapters. DatabaseService deletion is a soft delete; filesystem history removal remains the host's `onAfterDelete` responsibility.

Concurrent deletion and disposal share their respective promises, with identity-checked cleanup protecting newer entries. `deleteSessionWithLifecycle` holds the transaction through its post-delete callback: cancellation aborts, pre-commit failure aborts and propagates, and post-commit callback failure logs while retaining the deleted result. The original protection predicate reports pending input or unsettled teammates but is not automatically enforced by `deleteSession`.

Cancellation, effect flushing, restart waiting and backend destruction have best-effort boundaries. Watchdog failure can still reject after removing the active owner, before backend destruction; no rollback is added. Pending plugin recommendations survive history invalidation. `destroyAll` stops the janitor and timers, releases recommendation barriers, settles active disposals, clears replay/reclaim state and calls composer cleanup.

REA evidence `ev_8fc3fd7833573304e8c6eaa58b26470797b6967fbba8ab16e6ada334061dab56` covers 11,343 bytes and 1,649 AST nodes with zero parse failures. The verifier compares all **33 complete declarations/members** and runs **12 paired scenarios** against original and recovered code, including concurrent ownership changes, lifecycle callbacks, history-generation fencing and cleanup failures.

```sh
npm run verify:session-cleanup -w @axonfire/harness -- /absolute/path/to/captured/cli/dist/codebuddy.js
node --import tsx --test packages/harness/test/session-cleanup-runtime.test.ts
```

The owned CLI replacement fixture additionally deletes the restarted session through this capsule and checks its persisted tombstone after DatabaseService reinitialization. Backend event wiring and turn-boundary delivery remain fixture adapters; the companion task-state capsule below replaces the earlier task-signal stub. This does not enable a complete Desktop delete UI or remove original CLI history files.

## Task state, terminal cleanup and persistence

`attachNativeSessionTaskState` in `@axonfire/harness/sessions/native-session-task-state.js` supplies thirteen complete SessionManager methods, its original sidebar debounce constant, eight helper functions and the transition-log limit. Attach after cleanup and records, before accepting operations. It installs `applyTaskSignal` and `applyExplicitTaskStatus`, input settlement, terminal cleanup, telemetry routing and derived-status persistence; it preserves existing debounce/run-switch maps. The controller still needs session ownership, ordered effect routing, record upsert and diagnostic logging. Record-event publication and optional telemetry/recommendation callbacks are explicit host adapters.

Runtime signals move the task through planning, working, input waits and terminal outcomes. The original terminal guard ignores late `awaiting_input` and `input_resolved` state transitions; bookkeeping flags still follow the received signal. A new terminal transition settles permission/question/elicitation/recommendation maps and matching history requests, then marks only pending/in-progress tool results failed. Recommendation run switches suppress registry cancellation without preserving those pending requests. Tool-targeted settlement follows nested permission tool IDs and `codebuddy.ai` elicitation metadata.

Status changes enqueue persistence and record publication immediately. Same-status metadata changes debounce for the original two seconds; a removed session prevents the timer from enqueueing work. The queued callback captures its status argument but reads the session's timestamps when it executes. Manual archive sets an archive marker retained by runtime signals; manual unarchive clears the in-memory marker, while the original record updater retains an existing stored marker. These source behaviors are preserved.

Transition history suppresses unchanged state/phase entries and retains the last fifty entries. Task duration starts with the first turn. Cancellation-classified termination reports completion telemetry without changing the terminated task state; telemetry errors are caught. Telemetry remains inactive when no callback is supplied.

REA evidence `ev_6db80ea82e11298e400dc3679b6944be0eef21e4b465b097fd873708a0ddd16e` covers 16,023 bytes and 2,261 AST nodes with zero parse failures. The verifier compares **23 complete declarations/members** and runs **10 paired original/recovered scenarios**, including real debounce timing and persistence ordering.

```sh
npm run verify:session-task-state -w @axonfire/harness -- /absolute/path/to/captured/cli/dist/codebuddy.js
node --import tsx --test packages/harness/test/session-task-state-runtime.test.ts
```

The real CLI replacement fixture uses this capsule in place of its previous task-signal stub. Its explicit turn-boundary adapter sends start/completion signals around the two actual ACP prompts, verifies planning/completed records, and checks completion telemetry through a local recorder. Full Desktop backend notification routing is still separate; the fixture does not infer task events from every ACP notification or contact a telemetry service.

## Backend event wiring

`attachNativeSessionBackendEvents` in `@axonfire/harness/sessions/native-session-backend-events.js` installs the complete original `wireBackend` and its four supporting functions. Attach before starting sessions; startup and replacement then install callbacks on each backend. Compose it with task-state and cleanup support for runtime signals and input settlement. History deduplication/hydration, plan preparation, tool-result capture, team/status updates and scoped event publication remain explicit downstream dependencies; the capsule does not implement them implicitly.

The original callback ordering is preserved:

- Session updates refresh activity/message timestamps, reset the watchdog and capture the first usable trace ID. An existing update-level metadata object takes precedence over top-level trace metadata, even when it contains no trace ID. Foreign session IDs are normalized to the owning session.
- Valid usage updates optionally update the usage cache, then emit directly. Credit accumulates per request ID; invalid costs are ignored and invalid category metadata retains existing categories. Invalid usage envelopes instead follow the ordinary update path. Usage and recognized team-member events bypass history and plan handling.
- Mode/config updates carry the current mode epoch. Normal updates prepare plans, process history boundaries, deduplicate, commit plans, capture tools, handle state, emit, optionally derive and independently deduplicate a plan, then process replay completion. Duplicate normal updates stop after boundary processing.
- Questions and elicitations enter pending state and maps before history deduplication. Permissions emit scoped and general events without calling the history recorder. Terminal tasks ignore questions/permissions and synchronously request elicitation cancellation; a synchronous cancellation exception propagates.
- Elicitation-completion extensions settle matching input and synchronize state before forwarding the extension event. Runtime signals use the original task-state method; transport activity alone updates the activity timestamp without claiming a backend message.

REA evidence `ev_c26eae041d3cd8680adeafa8fdb42f004ad54e9bc70b3a0f72ec110ecb7ba8c6` covers 8,337 bytes and 1,254 AST nodes with zero parse failures. Verification compares **five complete declarations/members** and runs **ten paired original/recovered scenarios**, including composed task-state/input settlement.

```sh
npm run verify:session-backend-events -w @axonfire/harness -- /absolute/path/to/captured/cli/dist/codebuddy.js
node --import tsx --test packages/harness/test/session-backend-events-runtime.test.ts
```

The native CLI replacement fixture forwards real ACP `session/update` notifications through these installed callbacks and checks agent/tool updates and owning session identity. Its explicit turn boundaries now enter through `onRuntimeSignal`. Downstream plan/history handlers remain fixture adapters, so this demonstrates callback installation and notification routing across replacement, not complete Desktop history or team behavior.

## Plan snapshots and task-tool derivation

`attachNativeSessionPlans` in `@axonfire/harness/sessions/native-session-plans.js` installs fifteen complete original plan methods and two helpers. Attach after backend event wiring to replace its plan preparation, commit and derivation dependencies. The capsule has no external service dependencies; it reads existing plan snapshots and, when tool metadata lacks a name, the session's tool-result map.

Preparation normalizes a plan into an owner-tagged full snapshot without committing it. Both prepared and committed snapshots are cloned; downstream mutation does not change previously committed state. Non-plan notifications pass through unchanged. Revisions increase from the committed revision, honoring a larger finite explicit value from notification metadata before update metadata. A nonfinite outer numeric revision masks an inner value and falls back to incrementing; fractional revisions remain allowed. No deduplication is added to this method: the original event pipeline decides whether to commit.

Entries normalize content, status, priority, IDs, order, active forms and dependencies while preserving cloned metadata. String selectors trim; status/priority recognition is case-sensitive. Nested `codebuddy.ai` metadata takes precedence over outer metadata and row fields. Dependency lists keep duplicates; unrecognized existing metadata is not universally removed. Invalid structured-clone values propagate errors instead of being silently discarded.

Only completed `tool_call_update` notifications for exactly named `TaskCreate`, `TaskUpdate` or `TaskList` derive a plan. Tool-name lookup prefers flat metadata, then nested metadata, then captured tool state; an empty string in a higher-priority source still masks lower sources. Raw results prefer nested `rawOutput.rawResponse`, then recognizable direct raw output, then flat/nested metadata. An empty `todos` array takes precedence over `tasks`. Singular task results alone do not generate a plan. Derived notifications identify the source tool and tool-call ID, then use the same normalization and snapshot preparation path.

REA evidence `ev_9239b583b41a903564f25fa47dcd64951b28e81f76f39bfc7aa20bc937fd0724` covers 7,507 bytes and 1,136 AST nodes with zero parse failures. The verifier compares **17 complete declarations/members** and runs **eight paired original/recovered scenarios** covering cloning, revision/source precedence, metadata normalization, task-tool gating and clone failure.

```sh
npm run verify:session-plans -w @axonfire/harness -- /absolute/path/to/captured/cli/dist/codebuddy.js
node --import tsx --test packages/harness/test/session-plans-runtime.test.ts
```

The real CLI replacement fixture now replaces its plan adapters with this capsule. After restart it executes Write and TaskCreate, then TaskList, verifies the actual task in the committed snapshot, and asserts an emitted plan identifies `TaskList` and the real tool-call ID as its source. Both Node and the captured native SQLite driver under WorkBuddy Electron pass. History deduplication/hydration and tool-state capture remain explicit fixture boundaries.

## Captured tool results and queries

`attachNativeSessionToolResults` in `@axonfire/harness/sessions/native-session-tool-results.js` installs the three complete original tool-result capture/query methods and four metadata/status helpers. Attach after backend event wiring; it replaces the capture dependency while preserving any existing recommendation run-switch map. Optional recommendation registry, usage observer and logger are host dependencies.

Only `tool_call`/`tool_call_update` notifications with a nonempty string ID create entries. Updates replace the entry object while retaining fields omitted as `undefined`; explicit `null` raw input/output replaces the previous value. Tool-name precedence is flat metadata, direct field, title, then the previous name. Empty strings count as names; nested tool-name metadata is not read by this capture method. Metadata merges shallowly, and raw values remain shared references. Status strings are preserved without normalization.

`getSessionToolResults` returns a new Map whose records still share references with the session. Latest-by-name queries use exact names and strictly newer timestamps; equal timestamps retain the first insertion-order match. Missing sessions or matching records return `undefined`.

Terminal recommendation-tool results cancel their registry request unless a run switch is active. Registry exceptions propagate after storing the new entry and before observer delivery. The observer receives owner identity, current tool fields, trimmed source/welcome mode, literal-true background-automation metadata and the capture timestamp. Observer exceptions are logged and do not roll back captured state. No external observer is enabled by default.

REA evidence `ev_07928165c4f63e13367978764e94c4abcf8ec6ab9c9d290ef19ccbf5e4e6d095` covers 3,332 bytes and 527 AST nodes with zero parse failures. Verification compares **seven complete declarations/members** and runs **seven paired original/recovered scenarios**, including plan derivation from a previously captured tool name when the completion notification omits that name.

```sh
npm run verify:session-tool-results -w @axonfire/harness -- /absolute/path/to/captured/cli/dist/codebuddy.js
node --import tsx --test packages/harness/test/session-tool-results-runtime.test.ts
```

The real CLI fixture replaces its empty capture adapter with this capsule and verifies completed Write, TaskCreate and TaskList records plus local observer delivery. It checks that session deletion removes query access while a previously acquired Map retains its records. The original terminal-cleanup and plan-derivation capsules operate on these actual captured entries. Both Node and WorkBuddy Electron with the original SQLite binary pass.

## Event history deduplication and hydration

`attachNativeSessionHistory` in `@axonfire/harness/sessions/native-session-history.js` installs eleven complete original history/hydration/publication methods and ten supporting functions. Attach after startup and backend wiring so the recovered methods replace those dependencies. The host supplies `pushEvent`; compact-history effects use the existing records capsule's ordered effect and expert-selection persistence methods. Existing scoped listener maps are preserved.

History recording clones stored payloads. Non-stream update offsets deduplicate first, including the original `parseInt` handling of string offsets. User-message identity can replace a synthetic event with its real counterpart, but offset deduplication takes precedence; IDs are validated with trimming but compared without trimming. Stream question requests replace their history counterparts, question cancellation resolutions replace earlier resolutions, and permission requests have no analogous key here. Statusless tool updates coalesce backward across non-tool events until another tool event blocks the search. These are distinct rules, not a universal payload hash.

Prompt-history state updates occur before duplicate detection unless `isReplay` is explicitly selected. Compact/separator events clear user-since-compact and expert-selection state and enqueue persistence, even when recording later reports a duplicate. Structured-clone failures propagate.

Hydration depth supports nesting. History-mode events publish immediately while other events are cloned and buffered; finishing the outermost hydration drains the buffer in order and resets replay flags. Replay phase metadata has the original update/top-level precedence. Replay content without a start marker can finish as soon as the backend returns. If neither content nor start arrived, the original fifty-millisecond timer provides a fallback; a late start cancels that timer and waits for an end marker.

Scoped publication calls the host publisher before listeners. Listener exceptions are isolated; publisher exceptions propagate and prevent subsequent listener delivery. Subscription removal is idempotent and removes empty listener sets. This capsule does not supply inactive-session history loading or all replay replacement/reconciliation methods.

REA evidence `ev_4c3240d9feed0212f0ad27b337f4c42bf6b88dddbfaa08b6e17ea21069d918f0` covers 10,746 bytes and 1,440 AST nodes with zero parse failures. Verification compares **21 complete declarations/members** and runs **ten paired original/recovered scenarios**, including real fallback timers. Original optional-chain parentheses are retained because formatter simplification otherwise changes AST shape under strict comparison.

```sh
npm run verify:session-history -w @axonfire/harness -- /absolute/path/to/captured/cli/dist/codebuddy.js
node --import tsx --test packages/harness/test/session-history-runtime.test.ts
```

The real CLI replacement fixture now composes this capsule with original backend wiring, task state, plan snapshots and tool-result capture. It verifies actual tool/plan events in session history and completed hydration with no buffered events after restart, in both Node and WorkBuddy Electron with the captured SQLite driver. The host publication callback only collects scoped events; the previous history and buffering stubs are removed. Team/status handling and inactive replay reconciliation remain separate boundaries.

## Notification state and deferred team completion

`attachNativeSessionTeamState` in `@axonfire/harness/sessions/native-session-team-state.js` installs twenty-five complete original methods and nine helpers. It replaces backend notification state handling and supplies team roster tracking, deferred completion, late-team reactivation, title updates and processing lifecycle helpers. Compose after task-state, cleanup, records and backend-event support. The controller still supplies ordered record effects, publication, diagnostics and idle configuration draining.

Notification handling first settles pending input for terminal tool results, then extracts and gates runtime signals, applies team updates, and optionally persists a meaningful title. Agent-phase metadata takes precedence over update type, which precedes normalized raw state. History-mode notifications do not apply runtime signals; ordinary terminal/working/planning signals require processing or a stop request, while input waits require processing. Placeholder titles are ignored, custom titles are preserved, and history/hydration title updates retain the record timestamp.

Team creation clears old roster/name/auto-team metadata. Member updates replace the roster and normalize names/statuses; only pending/running members count as active. A deferred completion waits for active members and for explicit idle when team state requires it. `team_deleted` during processing is not itself proof that the team is idle. `team_idle` settles active members and can finalize exactly once for the tracked deferred turn.

User cancellation finalizes as completed with a cancelled reason; stop requests/cancelled reasons terminate, failed reasons fail, and ordinary completion succeeds. Processing-stop resets cancellation flags and drains pending runtime configuration; awaiting-input state keeps processing ownership and the watchdog running. Late first-team activity can reactivate a previously finalized successful turn only under the original narrow conditions. Prior members, cancellation, non-completed state or missing idle/finalization markers prevent this path.

The host prompt controller must choose when to call `shouldDeferTurnCompletion`, `deferTurnCompletion` or `markTurnCompletionFinalized`; attaching these methods alone does not replace the entire prompt controller. The deferral predicate's explicit-idle override and the finalizer's separate active-member check are intentionally preserved.

REA evidence `ev_7fdf4618b357ad2f2dc804ede92e93c6eb9602a30d67e1fd3c600235ba22032a` covers 21,961 bytes and 3,043 AST nodes with zero parse failures. Verification compares **34 complete declarations/members** and runs **eleven paired original/recovered scenarios** with recovered task-state/input settlement. These verify controlled team transitions, not a live multi-agent team workload.

```sh
npm run verify:session-team-state -w @axonfire/harness -- /absolute/path/to/captured/cli/dist/codebuddy.js
node --import tsx --test packages/harness/test/session-team-state-runtime.test.ts
```

The real CLI fixture now uses recovered processing-start/stop and completion-marker methods around its explicit ACP prompt boundaries. Actual agent/tool notifications enter working-state persistence through this capsule; both Node and WorkBuddy Electron verify two completed turns, cleared processing ownership and completion sequence 2. The fixture retains its original restart, SQLite, plan/history and deletion checks. This single-session process test does not establish live multi-agent team behavior.

## Replay priming, replacement and payload hydration

`attachNativeSessionReplay` in `@axonfire/harness/sessions/native-session-replay.js` supplies five complete original replay methods and six helpers. Compose after readiness, cleanup, records, history, plan/tool capture and notification/task state. It preserves the existing primed-replay map and optionally binds the recommendation registry. Callers supply history payloads; this capsule does not itself read Desktop history files or implement all renderer replay commands.

Priming an inactive session clones events and normalizes cwd. Both priming and replacement reject a mismatched expected history generation. Priming an active session delegates to replacement; replacing an inactive session delegates to priming. Successful active replacement removes the primed entry.

Replacement rebuilds history, plans and tool state from the supplied events. Before first hydration it retains non-history events as a live tail, applied after supplied history; already-hydrated sessions do not retain that tail. Processing, stop requests or pending permission/question/elicitation requests preserve the previous task state and those input maps after reconstruction. Plugin-recommendation maps are not cleared or included in that preservation predicate. A terminal-to-nonterminal replay regression restores the prior terminal state; the original task-state guard may instead retain terminal state while pending-map hydration still proceeds.

Payload hydration normalizes history ownership, deduplicates before updating derived state, and reuses the original plan, tool-result and notification handlers. Historical plugin recommendation questions/elicitations require an existing registry request; the separate recommendation-request envelope has different validation and rebuilds candidate state. Question cancellation settles matching inputs and cancels registry ownership. Malformed recommendation payloads can throw after state reset; no transactional rollback is introduced.

REA evidence `ev_4ce33add75cab5077549854f0bd3be0a1c05e6edb2db3736a506fcc44dafcb65` covers 11,114 bytes and 1,503 AST nodes with zero parse failures. Verification compares **eleven complete declarations/members** and runs **nine paired original/recovered scenarios**, composed with recovered history, task, team, plan and tool-result methods. Coverage includes generation rejection, live-tail/control preservation, terminal behavior, derived-state rebuilding, recommendation forms and partial failure.

```sh
npm run verify:session-replay -w @axonfire/harness -- /absolute/path/to/captured/cli/dist/codebuddy.js
node --import tsx --test packages/harness/test/session-replay-runtime.test.ts
```

The real CLI fixture now replaces the prior replay adapter with this capsule, passes its actual conversation event history to generation-gated replacement, and verifies terminal-state preservation, history markers, completed TaskList capture and reconstruction of the actual plan task. Both Node and WorkBuddy Electron with the original SQLite driver pass before the existing persistent deletion checks. The current fixture obtains these events through the recovered Desktop HTTP replay transport described below; the original CLI host supplies its persisted transcript.

## Complete prompt invocation and no-response watchdog

`attachNativeSessionPromptController` in `@axonfire/harness/sessions/native-session-prompt-controller.js` installs the complete original prompt entry, invocation finalizer, team reset, prompt composition/metadata enrichment, synthetic user-message recording, continuation wait and watchdog startup. It also retains the continuation identity set and full original `NoResponseWatchdog` class/constants. Compose after the readiness, records, cleanup, task/team state, history, replay and backend capsules. Optional user-prompt composition, telemetry and logging are host dependencies; the backend accepts the original `{ prompt, _meta }` request shape.

The entry waits for recommendation continuation, resolves the ready backend, clears stale input, records the original user prompt, starts processing/watchdog state and flushes effects before calling the backend. It temporarily wraps session updates to collect assistant text and background automation tool results, excludes compact-internal text from ordinary answers, and restores the prior callback in `finally`. Expert selection persistence follows the original compact-event distinction.

Outcome routing preserves recommendation/user cancellation, stop requests, system-interruption causes, stale cancellation, team deferral, pending questions, clear/compact handling and backend errors. A prompt response can leave the task working while a team is unfinished or awaiting input while a question is pending. Rejections can emit synthetic failure state when the backend has not supplied native error metadata. Invocation cleanup clears the invocation flag and attempts deferred configuration draining even after an error. Earlier processing-stop/drain failures are not universally swallowed.

The watchdog retains the original thirty-second check interval, two-minute ordinary timeout and one-minute pending-input threshold. It bases ordinary timeout on backend message activity, reports once until reset, includes recent transition-path data and stops on user cancellation when reporting is enabled. The class and timer lifecycle are recovered; telemetry is only sent through the supplied callback.

REA evidence `ev_a070d6c1f085d6c52bc5afd26d78c9770689df446ea91d38a4e4cd6513232c3d` covers 32,705 bytes and 4,496 AST nodes with zero parse failures. Verification compares **40 complete declarations/members** and runs **eleven paired original/recovered scenarios** with the existing recovered session capsules. They cover callback restoration, text/automation collection, cancellation causes, team/input continuation, failures, compaction, composer isolation, continuation barriers and watchdog thresholds using an injected clock.

```sh
npm run verify:session-prompt-controller -w @axonfire/harness -- /absolute/path/to/captured/cli/dist/codebuddy.js
node --import tsx --test packages/harness/test/session-prompt-controller-runtime.test.ts
```

The native fixture now calls this complete entry for both real ACP prompts, removing its manual turn signals, completion markers and processing-stop sequence. It verifies assistant-response metadata, restored lifecycle flags and stopped watchdog alongside existing replacement, real task-tool plans, replay replacement and persistent deletion. An explicit preparation call still permits inspection of the replacement queue before the second prompt. The owned backend supplies transport only; no production telemetry endpoint is used. Both Node and WorkBuddy Electron with the original SQLite binary pass. The earlier `createNativeSessionPrompt` composition module remains unchanged and separate.

## Renderer session loading and stored history publication

`attachNativeSessionLoading(controller)` attaches eleven complete original SessionManager methods and four local helpers. Attach it alongside readiness, history, plans, replay and cleanup. It uses the controller's existing `toSessionInfo`, `resolveReadySession`, `restoreInactiveSessionState`, `extractElicitationToolCallId` and scoped publisher; it does not introduce a substitute session-info projection or history-file parser.

An ordinary active `loadSession` publishes current pending permission/question/elicitation requests and the current plan, without replaying the transcript. A forced idle load publishes cloned history (excluding old input requests), then the plan and current pending inputs, and reports `rendererHistoryReplayComplete: true`. When either processing or prompt invocation is active, forced replay publishes only user-message chunks and current pending inputs, and reports incomplete replay. Historical messages carry `codebuddy.ai.mode: history`; pending inputs carry `workbuddyReplayKind: pendingInput`.

`replayStoredSessionHistory` prefers an owner whose history is hydrated. Live owners receive the same user-only partial history, without pending-input publication. Otherwise it falls back to cloned primed events and reports complete replay; unlike the hydrated-owner path, this original branch does not filter input requests. `hasStoredSessionHistory` tests hydration/priming, not whether the transcript has entries. Active-only pending-input replay never restores a missing owner; async pending-input replay first resolves a ready session.

Inactive loading reuses an existing pending load. If a pending resume exists, it awaits that resume, begins hydration and requests backend `loadSession` with normalized owner cwd (requested cwd is fallback), an empty MCP-server list and the existing metadata. Backend success and failure both call the original hydration finisher. An empty replay schedules the existing 50 ms fallback; it is not synchronously complete. Missing cwd throws before that `try/finally`, leaving the begun hydration state intact. No extra rollback has been added. Without a pending operation, this method delegates to the recovered readiness restore with kind `load`.

Fifteen whole member/helper AST comparisons and nine original/recovered scenarios cover publication order, isolation, activity gating, primed precedence, pending inputs and inactive restore/error behavior. The native CLI fixture also forces an idle renderer load after replay hydration and verifies actual assistant/plan publication without changing the completed task state. The fixture now also attaches the original session-info projection described below. The check does not establish direct reading of Desktop history files.


## Session information and exported status

`attachNativeSessionInfo(controller)` supplies the complete original `toSessionInfo`, exported task/input status and team/member view methods. Attach it with cleanup, task-state and team-state methods, which provide pending-input selection and active/unsettled checks. Configuration copying uses the previously recovered `createNativeSessionModes().cloneDesiredConfig` from the fixed coordinator sample.

The projection includes identity, cwd, timestamps, user/project, configuration, background/source metadata, status, pending-input kind, active tool/team flags, processing state, team details and mode epoch. Configuration excludes undefined values and is shallow-copied; nested values retain identity. Source mode trims a nonempty source string and otherwise falls back to the welcome mode. Automation metadata is exported only for literal boolean true.

Hard terminal statuses take precedence. A terminal task exports its terminal outcome even when its run state still says running, hides pending input and suppresses active-tool flags. Team activity remains independently visible. A stop request with deferred team completion exports terminated before considering pending input; this does not itself make the task-state object terminal. Otherwise pending requests precede unsettled team activity, which precedes the base task status. Request timestamps resolve input kind, with plugin recommendations winning ties, then questions/elicitation, then permission; task-state input kind is fallback.

Team view presence follows the original updated timestamp / idle marker / member-list gate: a team name or active flag alone does not create a view. `teamTrulyIdle: true` suppresses the view's `hasActiveMembers` even when the top-level active-member scan remains true. Member usage and failure objects are shallow copies; optional zero tool-call counts are retained. These asymmetries are preserved and tested rather than normalized.

With the query extensions below, twenty-four whole AST comparisons and nine paired scenarios validate the original methods/helpers. The native CLI fixture removes its former session-id-only projection and checks the original completed status, cwd, configuration, pending/tool flags, processing state, user and mode epoch through `loadSession`. This is the original session-info contract; full Electron/renderer assembly remains separate work.

## Desktop replay transport and gateway authentication

`createNativeSessionReplayTransport()` recovers the original Desktop replay request, response parser, cancellation helper, event projection/filter and gateway-secret module functions. Create one instance for a parent service graph and share its `gatewaySecretEnv()` with all spawned sidecars and its request methods with all parent callers. The original module has one lazy process-wide secret; the explicit factory scopes that singleton to the caller's graph. Creating separate instances for spawn and fetch would produce different credentials.

The secret is generated lazily from 32 random bytes, encoded as base64url, and retained in memory. The original environment fragment sets gateway authentication to `password`, supplies the same secret and disables API docs. Requests add `X-CodeBuddy-Request: 1` and `Authorization: Bearer ...`. This capsule does not persist secrets or change the original CLI authentication implementation.

`requestWorkbuddySessionReplay` obtains the runtime host endpoint, encodes the session ID, defaults to 5,000 events and includes a trimmed cwd when supplied. Endpoint acquisition races an optional abort signal; the same signal reaches fetch. The original pre-aborted path still invokes `getHostEndpoint` before rejecting its result. HTTP errors preserve the status and body, with status-text fallback when reading the body fails. JSON may be bare or wrapped in `data`; byte counts use UTF-8 response bytes and augment existing replay timing. Malformed response shapes are not silently repaired.

`toScopedSessionReplayPayload` converts CLI session-update events to owner payloads; other events become extension notifications. `isOwnerReplayHydratablePayload` selects update objects and the original input-envelope types. These are the original Desktop conversion rules, not an alternative transcript format.

The real CLI replacement fixture now obtains replay from the authenticated HTTP endpoint instead of cloning its in-memory manager history. It passes mapped events into recovered owner hydration, then verifies tool results, plans, completed task state and renderer publication. A request to the same replay endpoint without the secret must return 401. The CLI's existing replay implementation performs the persistent-history reading. The complete surrounding Desktop LOAD RPC orchestration is recovered in the following section.

## Complete Desktop LOAD RPC orchestration

`createNativeSessionLoadRpc()` supplies the complete original `registerWorkbuddySessionLoadHandler(registry, deps)`, twelve helper functions, renderer-history metadata key and the fixed coordinator's complete session-channel constant. Register once per RPC registry. Its closure owns pending-load and in-flight replay maps. The optional factory timer binding exists for deterministic boundary tests; normal assembly uses the global timer with the original 500 ms delay.

The handler validates a nonblank string identity and deduplicates concurrent loads by history generation, session ID, normalized requested cwd and force flag. Request ID is used for timing, not deduplication. A different load aborts all prior in-flight replays, including another session's replay. Success paths fence generation/abort state before owner mutation. Cached owner or primed history bypasses HTTP and retains its replay-completeness result, even when the force flag is set; current pending inputs, project/cwd/media registration and runtime sweep are still handled.

For an uncached load, the original HTTP transport receives the abort signal and selected cwd. Missing history for automation sessions/workspaces propagates for UI fallback. Other fetch failures return a loaded-but-incomplete result without restoring a backend. The handler does not add a transaction or rollback around this fallback.

Successful replay selects stored cwd before returned replay cwd, event cwd and requested cwd. Truncated history is trimmed to its first user message when one exists. Owner payloads are projected and filtered, then replace active history or prime inactive history. Renderer delivery includes truncation metadata, the original renderer-history marker and extension events; a lifecycle hook may consume individual events. A delivery failure still clears the replay marker in `finally`, but does not undo owner hydration already performed.

For idle or terminal sessions, the handler may schedule a synthetic prompt response after 500 ms. It skips that response if processing has begun or the current history count differs from the scheduled count. This guard is intentionally count-based; it is not a generation or content-hash check. Terminated maps to cancelled, while other terminal outcomes map to end-turn. Nonterminal idle status is asynchronously written as completed. These are original behaviors rather than extra completion guarantees.

The session-info attachment now also includes original `getSession`, `hasSession`, `toSessionViewState`, `getSessionRecord`, `rememberSessionCwd`, `updateSessionStatus`, `toSessionRecord` and `toEphemeralSessionRecord`. Views clone history/plan/input payloads and omit pending-input arrays for terminal tasks. Records prefer stored entries; cwd and status changes route through the original persistence/effect methods. Tests cover snapshot isolation, inactive record precedence and the distinction between written task status and exported pending-input status.

The owned native CLI fixture first calls the original history invalidator, checking that owner history, tool results and plan are cleared. It then invokes the complete LOAD handler through a minimal registry adapter, obtains authenticated HTTP history, rebuilds the owner, publishes renderer events and observes the actual delayed completion. A second load exercises cached-history reuse without another HTTP request. This completes the explicit LOAD path, not the full Electron RPC transport, media/project services, global runtime sweep or complete Desktop UI.

## Inactive runtime reclaim and janitor

`attachNativeSessionReclaim(controller, runtime?)` attaches six complete original methods, five helpers and the original policy constant. Compose it after cleanup, task/team state and session information so it can query owner state and call the recovered `destroySession`. Existing eligibility and in-progress collections are retained. Optional Date/interval bindings support deterministic tests; normal assembly uses global clocks and timers.

The default policy is a 15-minute eligible-idle timeout, 30-second sweep and maximum of six managed sessions. Finite nonpositive values disable the corresponding threshold or interval; nonfinite values, including positive infinity, select the original defaults. Ignored sessions are excluded from the managed count and lose prior eligibility. Protection also clears eligibility: nonterminal task state, delete-protected processing/input/team state, or an active tool call prevents candidate selection.

Eligibility begins at the first unprotected scan, independently of old activity timestamps. Capacity reclaim runs first in ascending eligibility time; idle reclaim follows and skips successfully reclaimed candidates. Protected owners still count toward capacity, so a sweep may remain over its limit. Reported managed/protected/eligible counts describe the initial scan, while totalSessions reflects the collection after reclaim. Protection is evaluated during candidate collection; the original method does not perform a second protection check immediately before every asynchronous destruction.

Concurrent `reclaimInactiveSessions` calls share the pending sweep and its original options. Per-session ownership prevents duplicate in-flight destruction. Reclaim sets the original `runtime_reclaim` cancellation cause and calls `destroySession`, preserving hydrated history through the existing cleanup path. It does not delete the persistent session record. Destroy failures are logged, return no successful reclaim result and release per-session ownership; later sweeps can retry.

Starting the janitor replaces its earlier interval, shallow-copies options, unrefs the timer when supported and immediately runs a sweep. Disabled intervals do not run that immediate sweep. Stopping clears the interval/options; it does not cancel an already-running sweep. Sweep rejection clears single-flight state, and the janitor reports it through the original diagnostic callback.

Twelve whole declaration comparisons and nine original/recovered scenarios cover policy defaults, protection, eligibility timing, capacity/idle ordering, ignored owners, failure retry, in-flight deduplication and janitor lifecycle. The native CLI fixture preserves direct active deletion as one case and adds a second case that reclaims a completed backend, checks history/record preservation, loads cached history without starting another backend, then deletes the inactive record. Automatic global Desktop sweep scheduling remains part of the pending full host assembly.

## AppServer session host attachment

`createNativeSessionHostRuntime(runtime?)` restores the complete original `attachWorkbuddyAppServerSessionRuntime`, daemon session-handler registration, create/config and auxiliary registrations, route-state handler, terminal attachment function and their helper declarations. Its LOAD handler is the same complete original flow verified above. The factory retains original constants for session/auxiliary/route channels, replay metadata and reclaim policy.

The attachment starts the original janitor immediately. Its ignore predicate excludes a configured cwd after resolve/lowercase comparison, and excludes the currently routed task while the window is focused. Route updates retain only string pathname/taskId fields. It supplies a LOAD-triggered sweep callback unless the caller already supplied one; sweep failures are logged without becoming rejected RPC results. When all renderer clients disconnect, it obtains the current file-watch service and releases its subscriptions. `stop()` stops the janitor and any owned terminal proxy. It does not unregister RPCs or the disconnect callback, and does not cancel an in-flight sweep.

Create/config registration preserves Claw workspace tool filtering, per-workspace in-flight creation reuse, latest-session selection by backend activity (createdAt fallback), stored-conversation resumption, and explicit config precedence. Expert preload can inject the original team environment before creation. Project-resource registration can allocate a session UUID and inject environment before creation; installation errors are nonblocking and late registration follows the original result-identity branches. Expert-type recording on config updates happens through the matched-precondition callback rather than immediately on request. These handlers delegate to the supplied original manager and expert/project/Claw services; this does not reconstruct those entire services anew.

Auxiliary RPCs retain artifact/media, file/directory-watch, persisted usage and local-expert path behavior, including absent-service return values and input validation. In particular, explicit media registration precedes asynchronous publication; publication failure does not undo registration. The complete channel constants are source-verified, not inferred from renderer labels.

If the endpoint exposes an HTTP server and a data-socket resolver, terminal attachment now defaults to the recovered `TerminalProxy`; a constructor override remains available. The caller still supplies `runtime.loggerModule.createWorkbuddyScopedLogger`. Original constructor/start/logger/token/stop wiring is checked with a boundary double, and the default proxy is separately verified with real WebSocket/Unix-socket connections; see the [terminal proxy contract](native-terminal-proxy.md). Without both endpoint/resolver prerequisites, the original function skips terminal attachment.

Thirty-one whole declaration comparisons and ten paired scenarios cover the attachment and handler branches. The real CLI fixture now registers LOAD through this host attachment, checks that the original janitor starts, routes its task to the focused window, checks eligibility is cleared by a host-triggered sweep, observes disconnect subscription cleanup, and stops the janitor before deletion. Its RPC registry, focus provider and file-watch boundary remain owned test adapters; create/config/auxiliary service behavior beyond the exercised paths is covered by paired scenarios, not a claim of complete Electron UI assembly.

## Complete backend integration (2026-10-24)

Both active-delete and reclaim-then-delete lifecycle cases pass with the complete original backend under Node and WorkBuddy Electron with the captured SQLite driver. The test observes lifecycle order without replacing backend methods with transport implementations. It verifies actual prompt-file contents, tool schema changes, preserved conversation and queue state, Write/TaskCreate/TaskList results, plan reconstruction, authenticated replay, persistent deletion and daemon exit.

Desktop client metadata enables a separate title-generation request. The owned model fixture now answers that request independently, so title traffic cannot accidentally advance the conversation/tool script. Product configuration is passed through the original `ACC_PRODUCT_CONFIG_PATH` environment contract. REST replay uses the origin of the backend's ACP endpoint, rather than appending REST paths to the ACP path.

Logs: `work/session-full-backend-chain.log` and `work/session-full-backend-chain-electron.log`. This proves the explicit assembled lifecycle; the default Web browser adapter has not yet been replaced by the full session controller.

## Original queue entrypoints (2026-10-24)

The lifecycle fixture now attaches [session operations](native-session-operations.md) and routes queue save/read, enqueue, reorder, edit-pop, removal, pause, activation and resume through the original SessionManager entrypoints and complete backend. It verifies queue ordering/content and that paused queue edits create no model turn, then retains the existing replacement/restoration and persistent-deletion checks. The fixed CLI returns method-not-found (`-32601`) for desktop `getQueueState` and `cancelMessageQueue`; both are asserted before continuing supported operations.

## Complete SessionManager integration (2026-10-24)

The real fixture now constructs `createNativeSessionManager().SessionManager` and calls its original `initialize` and `setEventSink`. It no longer attaches individual configuration, startup, readiness, task/history/team, queue, cleanup or reclaim methods, and no longer replaces record persistence or task event dispatch. The original runtime-config path creates the addon manifest, original record effects emit `session:upserted`, and the actual coordinator registry is checked before and after deletion. The model endpoint, account/connector boundaries, host RPC registry and platform database-driver selection remain explicit fixture infrastructure.
