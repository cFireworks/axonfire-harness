# Native Desktop product HTTP interceptors

`createNativeDesktopProductInterceptors()` exposes the complete original `ProductEndpointHttpInterceptor` and `AuthenticationHttpInterceptor`, together with the original endpoint-override setters/getters. Twenty verbatim source regions retain their constants, enum, classes and initialization statements. The factory scopes override state per instance and binds only process/environment and product-manager lookup. Hosts supply the actual REST interceptor registry, authentication manager, logger and notifier.

## Preserved request behavior

The endpoint interceptor recognizes the original product-request substrings. These requests retain an explicit base URL or use the current endpoint without waiting for configuration. Other requests wait for configuration and replace their base URL with the product endpoint. An endpoint override takes precedence in either case. `X-Product` is filled from current configuration, the configuration subject or the original SaaS default unless supplied by the caller.

The authentication interceptor fills bearer authorization and user, enterprise, department, tenant and domain headers from the current session. It preserves existing header values and original opt-out flags. `X-Skip-Auth-Interceptor` bypasses authentication injection and is removed. Other opt-out headers remain in the configuration. Opting out of the enterprise ID does not opt out of the tenant ID; these are separate original checks.

Development overrides are read both during factory initialization and interceptor initialization, preserving early/late environment behavior. Repeated interceptor initialization is not made idempotent by this recovery.

## Preserved 401 behavior

Business responses with `data.code === 401` and HTTP errors with response status 401 consult the same logout guard. The request token must still match the current token. Endpoint mismatch, override mismatch and exact or regex-whitelisted paths suppress logout. Successful response objects pass through unchanged; error objects remain rejected unchanged.

The original endpoint guard uses bidirectional string-prefix comparisons rather than strict URL-origin equality. For example, an endpoint string can match a longer hostname sharing its prefix. This recovery preserves and tests that boundary; it does not present the guard as a strict origin check. Absolute request URLs are considered before baseURL. Path exemptions use exact pathname or the original regex patterns, so a near-prefix path such as `/api/memory/profile-extra` remains eligible for logout.

## Verification and integration limits

Source: fixed Desktop `main/common.js`, SHA-256 `786cdfa0ec67e97753b4bc3e476f4582f10f4ccba694b5a9ec7de121478708a7`. Exported metadata records exact UTF-16 ranges. The verifier checks the hash, compares all 20 regions and independently constructs the captured implementation from source text.

REA evidence `ev_530dae4162e30ad060a061202e730a43de2be902d4be6aaf9fed09793600197c` covers one file, 7,874 UTF-8 bytes, 953 AST nodes and zero parse failures.

Six paired scenarios cover header precedence/opt-outs, route waiting and base URLs, scoped early/late overrides, token/endpoint/path logout guards, both 401 response paths and real HTTP exchanges. The real server observes injected authorization, product and user headers; business and HTTP 401 responses trigger the original guard, while the memory-profile exemption suppresses logout.

The six original interceptor scenarios provide an explicit registry and HTTP executor. Additional [native REST tests](native-desktop-rest.md) now run these same original classes through captured Axios 0.26.1 registries and real HTTP, including actual request/response order and 401 handling. Default Web account/provider assembly remains open.

The root build and all 2,378 core tests passed. All six compiled scenarios passed under Node and WorkBuddy Electron. No default Web startup change or new full host-suite run is claimed by this increment.
