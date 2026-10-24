# Native context-variable services

`createNativeContextVariableServices` restores namespace 66915 and its 23 complete factories: context-variable tokens, ContextVariableManagerImpl, conversion utilities, related-file and knowledge-base enums, and the original empty type-only modules.

The original bootstrap imports this namespace in stage 53879 and then calls `autoBind()`. The Backend foundation supplies the shared DI instance and routes the namespace lazily. Construction is inert; `load()` evaluates the original decorators. Resolver implementations must be registered by the product graph or caller before resolving the manager; the wrapper does not invent resolvers.

## Captured behavior

The manager combines injected resolvers with dynamically registered collection resolvers, filters by variable name and chooses the highest positive priority. Priority failures become zero priority. Resolution proceeds sequentially, skips unknown variables and empty results, logs resolver failures and continues. Object conversion preserves the original last-value-wins behavior for duplicate names.

In the captured implementation, batch resolution calls `getResolver(variable)` without the caller's context, then passes that context to `resolve(variable, context)`. The wrapper preserves this distinction. The source/port scenario checks it explicitly, along with dynamic resolver precedence, failure skipping, input preservation, missing values and map/array conversion.

All 23 factory ASTs are compared with the fixed sample. The scenario uses the real original container bootstrap and DI manager binding; its resolver implementations and unrelated product namespaces are explicit test inputs. This is not a claim that every product-specific context variable is wired into the default application.

```sh
npm run verify:context-variable-services -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run smoke:native-di -w @axonfire/harness
```

REA evidence `ev_72f99dbfc813b98ac90e160c1f1e89430d24adda7c6ec3650c61551ae156755d` covers these 23 factories plus the captured empty bootstrap namespace 80558: 24 inert files, 1,743 AST nodes and zero parse failures. Semantic coverage is partial/truncated with 750-node and 150-unknown limits and a 45-second budget. The full original bundle entrypoint is never evaluated.
