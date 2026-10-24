# Native Desktop product manager

`createNativeDesktopProductManager()` exposes the complete original `WorkbuddyProductManager` and its original Desktop `ProductManagerImpl` base. It retains all 18 subclass members and 26 base members, including static initialization blocks. The implementation preserves 16 original source regions across three fixed Desktop files, plus previously recovered product helpers from the authentication/product coordinator.

The factory binds Node/process/OS, RxJS, framework events, diagnostics and timers explicitly. It does not run captured decorators/bootstrap or fabricate product providers, authentication or cloud services. A host supplies `productProviderProvider`, `productMerger` and `localStorage` before initialization. `coordinatorApi` can share the already recovered product resource/cache scope with a coordinator.

## Configuration flow

The Desktop subclass reverses the sorted provider list and excludes externally owned environment, cloud, generic custom/enterprise models, workspace and available-model filter providers. Desktop-specific custom and enterprise model providers retain their independent outputs. Stable provider results are merged separately when volatile providers exist, so transient runtime configuration is not written into the stable cache.

Publication preserves this order:

1. Merge local configuration and the resolved remote overlay.
2. Apply environment product features, then the experiment overlay. Experiment models only modify existing model IDs.
3. Reapply Desktop enterprise models with DeepSmartMerge and custom models with SmartMerge.
4. Merge model promotions from local, environment and remote layers; filter by available models and apply original feature restrictions.
5. Apply a development endpoint override, publish changed configuration through the original subject/event, and save the stable cache.

The original change comparison runs after feature filters and the development endpoint override. An unchanged resolved configuration does not emit another notification or save another cache entry. No new equality or notification policy is introduced.

## Base behavior and resource ownership

The base keeps version-qualified compressed configuration caches, endpoint/environment cache keys, synchronous cache reads with asynchronous fallback, bootstrap environment precedence, serial sync promises, volatile-provider replay, configuration waiting and throttled proxy refresh. Original feature filters retain their exact injected prompt text and bundled-skill exclusion rules.

Additional original helpers resolve the network environment from the shared authentication file and respect its `.logged-out` marker. The host must select the intended filesystem/process scope. In particular, original asset resolution prioritizes Electron `resourcesPath`; owned tests bind both that path and the home directory to a temporary root.

The original Desktop subclass and CLI generic manager are distinct. Recovering this class does not by itself establish a fully assembled Desktop provider graph or automatic Web account/cloud refresh.

## Verification

REA evidence `ev_30047fb2b3734865b9183551ca867284831e516edb8f54cd3fb5c03b51dc1600` covers three files, 30,045 UTF-8 bytes, 3,775 AST nodes and zero parse failures. Exported metadata records fixed-file SHA-256 hashes and UTF-16 source ranges. The verifier compares all 16 regions and builds an independent target implementation from captured text. Previously recovered coordinator helpers remain an explicit shared dependency.

Six paired scenarios cover cache/version/bootstrap behavior, provider exclusion and stable cache separation, remote/experiment/enterprise/custom precedence, model and feature filters, authentication-file environment selection and logout markers, and the original subscription chain across the Desktop manager, experiment manager and coordinator. The last scenario checks that an experiment changes the published model limit and clearing restores the base value. Provider selection, REST responses and storage are owned fixtures. The complete [original Desktop merger and its five strategies](native-desktop-product-merger.md) now replace the earlier fixture strategy selector; all three manager classes remain recovered implementations.

The root build and all 2,367 core tests passed. All six compiled scenarios passed under Node and WorkBuddy Electron. This increment adds the recovered classes and composition evidence; it does not change the default Web startup graph or claim another full host-suite run.
