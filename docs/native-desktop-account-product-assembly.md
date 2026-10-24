# Desktop account and product composition

The owned cloud-product composition now connects the recovered original base product provider, product manager/merger, authentication manager, file storage, custom-token provider, application environment service, REST client/interceptors, user-info projection, cloud manager, experiment manager and auth/product coordinator.

Authentication is restored from a real temporary session file. Product configuration is loaded through the original ClientProductProvider. The earlier manually controlled authentication subject and local product-provider fixture have been removed from this scenario.

## Original startup binding

The composition exposed an omitted registration: file authentication storage must use the base product's authentication configuration rather than an overlay-dependent authentication ID. Without that registration, remote changes can move the selected session path during logout.

The fixed `module.app-server.js` registers:

```js
require_file_authentication_storage.setWorkbuddyAuthenticationConfigurationProvider(
  require_workbuddy_product_config.getWorkbuddyAuthenticationConfiguration
);
```

The composition now makes that same connection using the already recovered original helper, newly exposed by `createNativeDesktopProductManager()`. No original storage or manager method was changed. An assertion checks that the authentication file path is stable across remote overlay publication.

The registration was inspected in fixed `module.app-server.js` (SHA-256 `965b5e0124e633fc71dd2a7adc2d777ce1b621631fd30994a03a544e3e23c37d`). Its standalone REA fragment is registration evidence only, not an analysis of the complete application bootstrap.

## Verified flow

1. Load local product JSON and restore the persisted account through the original manager/storage.
2. Fetch cloud configuration over loopback HTTP using original authorization and user headers; publish remote models to both the product manager and the child-process configuration snapshot.
3. Preserve original cloud-cache behavior across forced coordinator refresh, then reset and refetch.
4. Log out through the actual manager, verify the file marker/removal, clear the cloud cache and restore local product models.
5. Log in through the original custom-token provider, verify file persistence and marker retirement, then publish cloud models again.
6. Receive HTTP 401 through the original REST/auth interceptor, trigger actual manager logout and observe the coordinator return to local models.

The existing five captured/recovered cloud scenarios pass with this stronger composition. The complete product source comparison also passes after exposing the existing helper.

## Remaining boundaries

The test controls the clock, owned JSON/session data, provider registry, logger/trace/event sinks; local configuration storage now uses the original file implementation. Initial remote loading is explicit; relogin now triggers remote publication through the original application synchronizer. It does not claim the final application registration graph or default Web activation.

The application-specific authentication manager, environment service and bootstrap storage are now recovered and used in this composition. See [application bindings](native-workbuddy-auth-bindings.md). Default Web activation and parent ownership/draining remain open.

REA registration evidence `ev_bff2f0a5b85f2d367cbaee3de822f5db876ae098f6f158da85f2d5e960b1bd1d` covers the 159-byte standalone registration statement (10 AST nodes, zero parse failures). Component recovery evidence remains in each module document.

Root build passed. The combined cloud/product compiled scenarios passed 11/11 under Node and WorkBuddy Electron, including file-backed authentication, relogin and HTTP-401 rollback. No new full host-suite run is claimed.

All 2,426 core tests passed after these composition changes.

Product and cloud caches now use [original file local storage](native-workbuddy-local-storage.md), with persisted readback verified through new instances.

The composition also uses the original application `WorkbuddyUserinfoProvider`; identity is read from the current session on each call. Its field mapping and post-logout empty values are verified independently against the captured application source.

A reusable [owned account/product host](desktop-account-product-host.md) now assembles these recovered services without importing the verification helpers. Its runtime/lifecycle coverage and remaining default Web boundaries are documented separately.
