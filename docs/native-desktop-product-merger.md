# Native Desktop product merging

`createNativeDesktopProductMerger()` exposes the original `DefaultProductMerger` and all five original Desktop strategies: Override, Merge, SmartMerge, DeepSmartMerge and CommandsSmartMerge. Ten verbatim source regions include their enum, override symbol and special-field constants. Outer decorators are omitted; a host supplies the original strategy instances to the merger's `productMergeStrategies` field.

The Desktop product/cloud integration now uses this complete merger rather than a fixture that directly selected a strategy. This retains the original per-layer strategy scan, special routing checks and final removal of the `mergeStrategy` property.

## Preserved semantics

- The default strategy recursively merges objects and replaces arrays, retaining the original null/undefined and falsy-source shortcuts. Override replaces the current product with the supplied product.
- SmartMerge merges object-array entries by ID or name. The original `OVERRIDE_MODE` symbol protects a source entry marked `replace`. The designated `builtInMarketPluginsMerge` array is replaced instead of merged.
- DeepSmartMerge adds primitive-array union behavior and original recursion-path cycle detection. It resets the cycle sets for each merge. It does not convert cyclic inputs into serializable JSON.
- CommandsSmartMerge merges command arrays by name and preserves existing commands when the incoming command list is empty. Other arrays retain the normal replacement behavior.
- `DefaultProductMerger` checks each layer's explicitly supplied Galileo routing keys. Supplying some but not all of `projectId`, `endpoint`, `app` and `server` disables the route and clears those routing keys, while retaining unrelated fields. A layer with no routing keys does not trigger this reset. The final product has no `mergeStrategy` property.

Strategy order is an explicit host binding. The recovered merger uses the first strategy whose original `support()` method accepts a layer; it does not add an unknown-strategy fallback.

## Verification

Source: fixed Desktop `main/common.js`, SHA-256 `786cdfa0ec67e97753b4bc3e476f4582f10f4ccba694b5a9ec7de121478708a7`. Exported metadata records exact UTF-16 ranges. The independent verifier checks the hash, compares all ten regions and constructs the comparison implementation from captured source text.

REA evidence `ev_87646a0678f991769240c4463a2894955371d5626780fdec9e2708fcd2179a75` covers one file, 9,230 UTF-8 bytes, 1,360 AST nodes and zero parse failures.

Five paired scenarios cover strategy selection/removal, partial/complete Galileo routing, identity/override protection, forced array replacement, primitive unions/cycles and command-array behavior. The six Desktop product and five cloud scenario pairs also pass with the complete original merger. Their provider, account and storage boundaries remain fixtures; default Web service assembly is still separate work.

The root build and all 2,388 core tests passed. The combined merger/product/cloud compiled scenarios passed 16/16 under Node and 16/16 under WorkBuddy Electron. Default Web startup is unchanged; no new full host-suite run is claimed.
