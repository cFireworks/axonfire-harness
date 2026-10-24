# Native Shell encoding and executable lookup

`createNativeShellIO` restores the complete original factory closure behind Shell's encoding (`93130`), charset detection (`23238`) and executable lookup (`5516`) imports: 71 factories, including the original encoding tables, detector models, streaming adapters and executable-permission logic. Six Node builtin modules are explicit external boundaries. No registry package was substituted for the bundled implementations.

`createNodeShellIO({ process })` supplies those six builtins through Node's CommonJS loader. This matters: the original buffer adapter calls `hasOwnProperty` on the module object, so an ESM namespace object is not interchangeable with the original `require("buffer")` result. The recovered factory bodies are unchanged.

```ts
const io = createNodeShellIO({ process: ownedProcess });
const modules = {
  93130: io.iconv,
  23238: io.detector,
  5516: io.which,
};
```

Supply these namespaces to the local/Sandbox Shell runtime alongside its other parent dependencies. The returned `getModule` exposes the same cached factory graph. The caller supplies the process environment, platform, working directory and user/group accessors required for permission checks. `Bun` can be supplied explicitly for that original lookup branch. Construction performs no global installation or application bootstrap.

The original lookup wrapper maps async failures to `null`, while sync lookup throws unless `nothrow` is requested. Its Bun branch deduplicates all-path results. These differences are retained. Encoding aliases, BOM handling, codec caching and stream state remain original; the adapter does not replace them with UTF-8-only behavior.

## Verification

```sh
npm run verify:shell-io -w @axonfire/harness -- /path/to/captured/codebuddy.js
npm run verify:local-shell -w @axonfire/harness -- /path/to/captured/codebuddy.js
```

The first verifier compares every complete factory AST against the fixed bundle SHA256 `4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd`; each factory's UTF-16 range is recorded in the source. Seven original/recovered scenario pairs cover UTF-8/UTF-16/GBK/Shift-JIS/Windows-1252/KOI8-R round trips, aliases and BOM behavior, multibyte stream boundaries, charset detection, real owned executable permissions and PATH traversal, missing-command behavior and Bun lookup. Runtime comparisons are finite; they do not prove every mapping or heuristic for every input.

LocalShell's eleven paired scenarios now use these actual recovered namespaces instead of encoding and lookup test doubles, including real raw child, snapshot, timeout and PTY execution. Its DI decorators remain explicit test boundaries. Existing Sandbox component fixtures that deliberately supply separate encoding/lookup adapters retain their documented scope; this change does not claim every host has switched to the new graph.

REA evidence `ev_7bf4fe902a6f118889e9c0cd2e659a9bc2ddd559d734407f0e2591f1fb569ebb` covers 104,591 AST nodes in 71 parsed inert original JavaScript files, with zero skipped files, invalid UTF-8 files or parse failures. Semantic coverage is partial/truncated under 750-node and 150-unknown per-file/global limits and a 45-second budget. Complete AST checks supplement that bounded semantic evidence. Default product DI/bootstrap integration is still unfinished.
