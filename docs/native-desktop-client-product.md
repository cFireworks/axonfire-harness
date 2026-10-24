# Native Desktop base product provider

`createNativeDesktopClientProduct()` restores the complete original `ClientProductProvider`, builtin-model switch helpers, BooleanUtils and provider-priority enum. Six regions from fixed Desktop `common.js` and `module-base.js` remain verbatim. The host supplies process/directory bindings and injects filesystem, configuration base path and logger into the provider.

The provider searches `product.json` in the configured base directory (or module directory), then two parent directories. Missing filesystem/files and parse/read failures return an empty object. A later call retries failed loads. A successful result is cached by reference and bypasses future file reads and switch evaluation.

The original builtin-model switch recognizes the original truthy strings through BooleanUtils. When enabled, it removes only the top-level `models` field using a shallow copy. Authentication, agents, agent model references, prompts and all other fields remain present. This provider does not rewrite agent model references or substitute prompts.

## Verification and composition

The independent verifier checks both fixed-file SHA-256 hashes and all six UTF-16 ranges, constructs the original captured-text factory and runs five scenario pairs. They cover real file loading/cache identity, parent search and malformed-file retry, optional filesystem, truthy switch handling/shallow-copy identity, first-load cache behavior, and the fixed captured product configuration.

The fixed-file check loads the repository's original product JSON through the recovered provider and compares the entire object. It confirms all 19 agents and 44 models, then verifies that disabling models retains the complete original agents and authentication configuration.

The environment-service composition now uses original providers for both base and environment product files, together with the complete original Desktop product manager and merger. There is no base-product or environment-sensitive provider fixture in that scenario. Owned JSON files define the test endpoints and domain mappings; the provider registry remains an explicit ordered binding.

Production service registration, merging this product composition into the complete login/cloud/coordinator lifecycle, and default Web assembly remain open. This addition leaves current default startup unchanged.

REA evidence `ev_9afbaaf9e9d912c2fb14c6fdb9f59fe47d8182cb223855437a1bcc7ff100f770` covers two files, 4,591 UTF-8 bytes, 451 AST nodes and zero parse failures.

Root build passed. The combined base-provider, environment-provider and environment-service compiled scenarios passed 15/15 under Node and WorkBuddy Electron. No new full host-suite run is claimed.

All 2,426 core tests passed.
