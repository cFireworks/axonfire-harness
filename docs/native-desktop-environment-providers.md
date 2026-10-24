# Native Desktop environment product providers

`createNativeDesktopEnvironmentProviders()` restores `WorkbuddyInternetEnviromentProductProvider`, `WorkbuddyDevEnvEndpointProductProvider`, the original development resolver setter and provider-priority enum. Five regions from fixed Desktop `common.js` and `module-base.js` remain verbatim. Node path/process/directory and the already recovered endpoint interceptor are explicit factory bindings. Provider filesystem, configuration base path and logger remain injected as in the original.

## Environment configuration

The provider selects the explicit copilot environment first, then the current product's network environment, then the first valid named JSON environment configuration containing a network environment. It lowercases the chosen value for both the filename and cache key.

File search checks the injected base path, the module directory and two parent directories. Missing filesystem/files and read/parse errors return an empty object. Successful reads remove `authentication` before caching. The cached object is returned by reference; later disk changes are not reread, and consumer mutations remain visible. No clone, cache invalidation or authentication override is added.

The environment provider's priority is `CLIENT + 5`; the developer endpoint provider uses `CLIENT - 1000`. The original setter registers the same resolver with the HTTP endpoint interceptor. This lets requests use a developer endpoint before product synchronization has published it. An empty resolver result yields no product overlay.

## Verification and integration

The independent source verifier checks both fixed-file hashes and all five UTF-16 ranges, then runs five original/recovered pairs: environment precedence, real file loading and shared caching, search/error/optional-filesystem behavior, resolver identity/dynamic changes, and real original REST/interceptor requests while the product endpoint remains stale.

The environment-service composition now uses this original file provider with the complete original Desktop product manager. It reads owned internal/external product files, publishes their endpoints after environment switches, and confirms their authentication fields cannot replace base authentication. Both environment and base product files now use their original providers; the previous source fixtures have been removed.

Production provider registration and parent lifecycle/default Web assembly remain open. The local base-file provider is now recovered; composition with the full login/cloud/coordinator lifecycle remains open. Tests use owned files and loopback HTTP; no installed account or production endpoint is accessed.

REA evidence `ev_bc58a66d55c3ef0ed43fe4f6b75d106ccac8fe68006b587595f3ae3b30007fda` covers two files, 3,336 UTF-8 bytes, 476 AST nodes and zero parse failures.

Root build passed. The combined provider, environment-service and browser-login compiled scenarios passed 16/16 under Node and WorkBuddy Electron. No new full host-suite run is claimed.

All 2,421 core tests passed.
