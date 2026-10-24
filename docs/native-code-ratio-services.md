# Native code adoption reporting

`createNativeCodeRatioServices` restores namespaces 14931 and 23294 and 19 complete factories. They contain CodeRatioReporter, feature gates, diff/statistics helpers, commit loading, Git name-status/unified-diff parsing, SVN working-copy discovery and XML/diff parsing. Six parent dependencies reuse the original DI, product, event, diff and filesystem modules.

Original stages 98759 and 5112 load these namespaces in the shared Backend foundation. The container loader also now owns the sample's genuinely empty factories 3203 and 3618, removing their former namespace fixtures. It contains 29 complete source-verified factories.

## Preserved semantics

Reporting requires an explicitly enabled CodeAdoptionRate product feature and a Cloud-Hosted or Self-Hosted deployment. Rejected, invalid, binary and unchanged edits are skipped. Optional file-reader behavior, diff truncation and event failure results remain original.

The reported `lineCount` is a nonnegative net increase in file line count, not a count of all inserted diff lines. Likewise, character statistics use net string-length increase. The truncation limit uses JavaScript string length despite its byte-oriented name. Git commit parsing separately retains actual added and deleted lines. Commit observations are deduplicated by repository and commit ID, with the original bounded cache and failure retry behavior.

## Verification

The source-paired integration uses original registration stages, ProductManager, StandardEventService and its processors, with a local HTTP receiver. It checks skipped edits, protocol fields, actual diff content, net line counts and duplicate commit observations. A temporary real Git repository supplies two commits; the original loader parses their metadata, additions and deletions. SVN branch inference and invalid Git identifiers are also exercised. No external repository or telemetry endpoint is contacted.

The startup scenario includes these real namespaces and still serves HTTP health. Remaining product modules and its final product registration remain explicit integration boundaries, so this does not claim complete native product startup.

All 19 factory ASTs match the fixed bundle. REA evidence `ev_56c4a12ff9ca58d5e52491f186c8cdad2d9abdb8d1a1bcde7a1efe5286fd34ad` covers these factories and the two original empty modules: 21 parsed files, 5,504 AST nodes and zero parse failures. Semantic analysis is bounded at 750 nodes, 150 unknowns and 45 seconds. The original whole-bundle entrypoint is never evaluated.

```sh
npm run verify:code-ratio-services -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run verify:container-bootstrap -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run verify:backend-foundation -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run smoke:native-di -w @axonfire/harness
```
