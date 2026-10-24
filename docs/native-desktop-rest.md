# Native Desktop REST client

`createNativeDesktopRest()` exposes the original CellJS `DefaultRestOperationsFactory` and its captured Axios **0.26.1** instance. The recovery includes the complete reachable 40-module dependency closure, the original CommonJS loader and the factory declaration: 42 verbatim source regions. It does not install a different Axios release or substitute a compatible HTTP implementation.

The factory takes its original `clientConfig` field before `create()`. Node built-ins and optional process/console boundaries are explicit. Captured decorators and application bootstrap are not executed. Module caches and Axios defaults are scoped to each recovered runtime factory.

```ts
const { DefaultRestOperationsFactory } = createNativeDesktopRest();
const factory = Object.assign(new DefaultRestOperationsFactory(), {
  clientConfig: { baseURL: endpoint, timeout: 5000 },
});
const restOperations = factory.create();
```

A host can supply this client directly to the recovered cloud/experiment managers and initialize the [Desktop product/authentication interceptors](native-desktop-product-interceptors.md) against its actual interceptor registries. Caller-provided agents, proxy configuration and request cancellation remain the caller's responsibility; the original REST factory has no new disposal API.

## Preserved dependency graph

The captured closure includes Axios request/response transformations, header normalization, parameter encoding, configuration merging, interceptor registries, error handling, CancelToken/AbortSignal behavior, Node HTTP and browser XHR adapters, redirect handling, debug helpers and gzip support through Node's original built-ins. The browser branch is retained as source; this increment verifies the Node branch under Node and Electron.

No global Axios defaults are patched. Owned loopback tests set `proxy: false` and supply an owned HTTP agent in the original `clientConfig`, keeping their network traffic isolated without changing the recovered defaults.

## Evidence and verification

Fixed inputs are Desktop `common.js` and `chunk.js`; exported metadata records their SHA-256 hashes and exact UTF-16 ranges. The independent verifier checks both hashes, compares all 42 source regions and constructs its comparison factory from captured source text.

REA evidence `ev_732274c21e5f7f144d8ab959dd490af7cd5014bb672a292bb5f6b1bc79dd9ca8` covers two files, 92,168 UTF-8 bytes, 12,575 AST nodes and zero parse failures.

Five paired scenarios verify the captured version and client isolation, JSON/query handling, reverse request/forward response interceptor order, actual redirect/gzip requests, HTTP errors, timeout/AbortSignal/CancelToken behavior, and the original Desktop authentication/endpoint rules through real Axios requests and 401 responses.

The existing cloud/product/experiment/coordinator integration now uses this original REST factory and both original HTTP interceptors instead of the owned single-origin transport. Its five paired cloud scenarios still pass, including authenticated remote configuration publication, cache boundaries and logout restoration. Account subjects, local product providers and storage remain owned fixtures. This does not yet claim default Web background services or live account-provider assembly.

The root build and all 2,383 core tests passed. The combined REST/cloud compiled tests passed 10/10 under Node and 10/10 under WorkBuddy Electron. Default Web startup is unchanged; no new full host-suite run is claimed.
