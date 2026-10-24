# Native filesystem and workspace services

`createNativeFilesystemServices` restores 118 complete factories: namespaces 79814 and 54463, the original memfs implementation, FileSystem and Workspace bindings, the embedded URI and reactive dependencies, default host services, memory local storage and SystemInfoContextVariableResolver. Eight dependencies share the existing HTTP and Express modules.

## Two original binding stages

The recovered bootstrap preserves the original sequence:

1. Stage 61488 loads namespace 79814 and binds FileSystem to module 61000's `fs` object. The bundle spells this numeric module key `61e3`; it is the original in-memory filesystem.
2. Stage 97619 loads namespace 54463 and rebinds FileSystem to the ES namespace wrapper around module 79896's real Node filesystem. The wrapper's `default` is the underlying filesystem; named methods retain their original identities.

Both stages are routed by the shared Backend foundation. No custom filesystem shim replaces them. Creation is inert, and the supplied shared DI, globals, process and require surfaces retain runtime ownership. Loading namespace 79814 registers its decorators; loading 54463 registers the system-info resolver against the same context-variable tokens as the preceding stage.

## Default host behavior

The original Workspace starts with an empty folder array. SystemInfoContextVariableResolver uses its first folder, or the user's Desktop when empty, and preserves the original platform/shell result.

MemoryLocalStorage stores values in a Map and emits domain-change events on set/remove. The captured default external URI opener returns false, page previewer resolves true and user-info provider returns undefined. These are the source defaults, not newly supplied product implementations. Notifier keeps the original console output and first-occurrence placeholder substitution.

## Verification

All 118 factory ASTs are compared with the fixed sample. Captured and recovered scenarios use real DI and the original registration factories to inspect FileSystem before and after rebinding, write/read isolated memory and disk files, verify independent volumes, resolve systemInfo from an updated Workspace, and exercise storage events and default host behavior. Disk writes stay in an owned temporary directory.

The full foundation scenario also executes both stages in their original startup position and serves a health request through the original server. Remaining product namespaces and the source-map installer in that scenario are explicit fixtures; complete product startup is still being assembled.

```sh
npm run verify:filesystem-services -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run verify:backend-foundation -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run smoke:native-di -w @axonfire/harness
```

REA evidence `ev_313acc887a4007b5d7d903eceb1653b14077c26f5e7378eb8f0b365a295399ec` covers 118 inert files, 54,071 AST nodes and zero parse failures. Semantic coverage is partial/truncated with 750-node and 150-unknown limits and a 45-second budget. The embedded URI bundle retains its own internal loader; its numeric dependencies are not treated as outer bundle imports.
