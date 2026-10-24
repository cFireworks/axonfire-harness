# Native product experiments

`createNativeProductExperimentManager()` exposes the complete original Desktop `WorkbuddyProductExperimentManager`, including its 23 class members and required constants/helpers. Six original source regions are retained verbatim. The host supplies the logger, authenticated REST provider, product manager, authentication subject and optional Git collector; timer injection supports deterministic verification without changing polling logic. Importing the module does not start network requests or polling.

## Behavior preserved

- Experiments require `productFeatureExperiment.enabled === true`. Polling has a separate strict boolean gate, defaults to 15 minutes and clamps finite numeric intervals to at least one minute.
- Requests use `POST /v2/feature-flag/api/product-config`, the product endpoint, a five-second timeout and repository URLs in query parameters. Missing or failing Git collection yields an empty repository list.
- The response must carry a nonempty `exp_id`; its `value` becomes an in-memory overlay. Missing assignment or empty values clear the overlay. Request failures retain an earlier overlay and preserve polling behavior.
- Refreshes share a serialized promise queue. Generation and session object identity checks discard results from invalidated requests. A session change during overlay publication causes rollback. `clear()` increments the generation, stops polling and clears a previously published overlay.
- Timers are reused for unchanged intervals, restarted when intervals change and unreferenced where supported. Polling reads the current product and session. The original `_options` argument does not force a separate cache policy.

An externally changed identity can stop polling without clearing an already-existing overlay on every stale-return path. The surrounding coordinator's logout/refresh wiring is therefore part of the service contract. This module does not invent stronger invalidation behavior or a new disposal method.

## Evidence and verification

The fixed source is `main/workbuddy-auth-product-coordinator.js`, SHA-256 `8624215504229c4b6190f5c2172da270e015cc96871e90b261786f047e4c6e78`. Exported metadata records exact UTF-16 source ranges. The independent verifier reads the captured file, checks its hash, compares all six regions and constructs the comparison implementation directly from original text.

REA evidence `ev_2ceb0ac3aea8ab0a9cdd6d10aa3d6be574289b2ad20fa1c001309e889a390dbb` covers one file, 6,654 bytes, 958 AST nodes and zero parse failures.

Seven paired scenarios cover strict gates, interval/ID normalization, the request contract, timer reuse/restart, empty responses versus failures, generation/identity races, queue serialization and polling. A real loopback HTTP scenario sends an experiment response through the original manager and complete [authentication/product coordinator](native-auth-product-coordinator.md), verifies the published model and feature changes, then verifies restoration after clearing the overlay.

The loopback HTTP adapter and service fields are explicit test boundaries. These tests do not claim production authentication, remote experiment access, complete Desktop product-manager assembly or automatic default Web subscriptions. Those dependencies remain required before activating the full background service graph.

The root build passed. The complete core suite passed 2,361/2,361 tests; all seven compiled experiment scenarios also passed under Node and WorkBuddy Electron. This increment does not change the default Web service assembly or claim a new full host-suite run.
