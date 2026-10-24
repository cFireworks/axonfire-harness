# Native Desktop cloud product manager

`createNativeDesktopCloudProduct()` exposes the complete original Desktop `CloudProductManagerImpl`: 12 class members and its original cache, retry and request-header constants. Six source regions are preserved verbatim. The factory binds the clock, timeout scheduler and the product-manager container lookup. A host supplies the real logger, user-info provider, storage, REST operations and optional Git collector before use.

Importing or constructing the class does not fetch configuration. It introduces no replacement login flow, network endpoint or account service.

## Preserved behavior

- L1 memory cache entries are keyed by user ID and expire after eight minutes. The URL is not part of that key. Anonymous requests do not use the per-user caches.
- Remote GET requests use the product endpoint, a five-second timeout, `Connection: close` and repository URLs as query parameters. Successful responses update memory immediately and start an asynchronous disk-cache update.
- Remote failures prefer stale memory, then disk data without a TTL check, then an empty configuration. Disk entries form an LRU list capped at 20 users; reading an entry moves it to the end.
- Background retries use the original shared `retrying` flag and delays of 1, 2, 4, 8 and 16 seconds. Final error logging is deduplicated over one minute.
- Reset clears memory/current configuration and resets the retry flag, preserving disk entries. It does **not** cancel already scheduled or in-flight retries: a pending retry may repopulate memory after reset. A host must account for this original lifecycle boundary when wiring account changes and shutdown.
- The coordinator's forced refresh does not bypass this manager's L1 cache. Clearing the cloud cache before a forced coordinator refresh produces another request; otherwise the original cached response may be reused.

The original `briefError()` bounds its diagnostic output; it is not a general-purpose secret scrubber. Failures outside the remote-fetch catch boundary, such as a rejecting user-info provider, are not converted into an empty configuration.

## Source and verification

Source: fixed Desktop `main/common.js`, SHA-256 `786cdfa0ec67e97753b4bc3e476f4582f10f4ccba694b5a9ec7de121478708a7`. Exported metadata records the UTF-16 ranges. The paired verifier validates the hash, compares all six regions and independently builds the comparison implementation from captured source text.

REA evidence `ev_be588a6429a5e0c03ae7a9df14be202cc92020e0c5899b96d05ff86552df7776` covers one file, 7,771 UTF-8 bytes, 1,040 AST nodes and zero parse failures.

Five paired scenarios cover request parameters, user-keyed TTL and anonymous requests, stale fallback, retries/log deduplication, disk LRU/reset behavior and a composed loopback flow. That flow uses the complete Desktop product manager, cloud manager, experiment manager and authentication/product coordinator. It verifies publication of remote models, exclusion of remote authentication/endpoint overrides, the forced-refresh cache boundary, and restoration of local configuration on logout.

The integration now uses the previously recovered user-info projection, the [original CellJS REST factory and bundled Axios](native-desktop-rest.md), and the original Desktop authentication/endpoint interceptors. Its authentication manager, file storage, custom-token provider and local base product provider now use recovered original implementations. See [account/product composition](native-desktop-account-product-assembly.md) for the restored startup binding and remaining application rebindings. It does not claim live account services or automatic default Web background refresh are assembled.

The root build and all 2,372 core tests passed. All five compiled scenarios passed under Node and WorkBuddy Electron. Default Web startup is unchanged; this increment does not claim a new full host-suite run.
