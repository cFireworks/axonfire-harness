# Galileo product configuration resolver

`resolveGalileoConfig` restores the product-level routing policy used by the original GalileoService. This is separate from the SDK's remote `Config` polling client.

## Behavior

- Only literal `enable: true` enables collection.
- Collector endpoints must be HTTP(S) origins, without credentials, query parameters, fragments, or non-slash paths. Values are trimmed and normalized through `URL.origin`.
- OTLP export requires an endpoint, app and server. Aegis additionally requires a project ID; missing it does not disable OTLP.
- A valid `aegisEndpoint` overrides only the `/collect` destination. Invalid or absent overrides fall back to the primary endpoint.
- The fingerprint includes enabled, project ID, endpoint, app, server and platform. It intentionally omits `aegisEndpoint` and patch name, preserving the original change-detection policy.

```ts
import { resolveGalileoConfig } from "@axonfire/harness";

const resolved = resolveGalileoConfig(
  { enable: true, endpoint: "https://collector.example", app: "agent", server: "cli" },
  { platform: "ElectronApp" },
);
// resolved.canExportOtlp === true; resolved.canExportAegis === false
```

## Evidence and verification

Factory 73620 is retained in full from UTF-16 range `[15619235, 15620763)` of the fixed WorkBuddy bundle (SHA-256 `4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd`). `verify:galileo-config-resolver` checks the complete factory AST and compares two input matrices against the captured original. No bundle bootstrap is executed.

REA evidence `ev_53d291864818a1d44dc79db4bdbc60ff5a3807ee4319911f1393b3fbbbb7a854` records one parsed file, 417 AST nodes and zero parse failures. Semantic coverage is `unknown`, without truncation; it is static analysis, not a runtime-equivalence claim.

Two additional service integration tests bind this resolver into the original GalileoService and check accepted and rejected initialization branches. Those tests retain explicit SDK/provider and DI fixtures; they do not establish the full native service graph or exercise real telemetry delivery.

```sh
npm run verify:galileo-config-resolver -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run smoke:galileo-transport -w @axonfire/harness
```
