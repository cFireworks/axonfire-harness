# Native OpenTelemetry environment

`createNativeOtelEnvironment` restores complete factories 70000 (spelled `7e4`
in the bundle), 55733, 79232 and 6023: environment access, parsing and defaults,
diagnostic levels and sampler enums. The factory takes an explicit process
object. It neither imports the captured application nor reads the host process
implicitly. These four factories have no unresolved module dependencies.

`getEnvWithoutDefaults()` parses recognized keys from the supplied environment;
`getEnv()` merges those values over the captured defaults on every call.
`parseEnvironment()` is also exposed for explicit records. The original rules
are preserved rather than normalized to stricter modern conventions:

- Boolean parsing compares the lowercase string with `true` without trimming.
- Numeric conversion uses `Number`; empty strings and null become zero,
  invalid numeric strings are omitted, and infinity remains valid here.
- List values split on commas and trim individual entries, retaining empty
  entries. String keys stringify non-null values; unknown keys are ignored.
- Log level names are case-insensitive but not whitespace-trimmed.
- Defaults merge shallowly: returned objects are fresh, while unoverridden
  default arrays retain shared identity.

Four original/reconstructed scenarios verify defaults and enums, coercion,
invalid-value fallback, live reads and shallow-merge identity. The metric
exporter scenarios now use this actual environment module instead of a `getEnv`
stub; all five metric source pairs are rerun with that dependency. This removes
that specific test boundary, while full provider and application assembly
remain unfinished.

```sh
npm run verify:otel-environment -w @axonfire/harness -- /path/to/codebuddy.js
npm run smoke:galileo-transport -w @axonfire/harness
```

REA evidence: `ev_fa357def9492ca7155057bc5bdf6c517e6207147b70b248dbfe7f02c819f5269`. The inert extraction contains 983 AST nodes across 4 parsed JavaScript files, with no parse failures. Semantic coverage status is `partial`; truncated: `true` (750-node / 150-unknown limits).
