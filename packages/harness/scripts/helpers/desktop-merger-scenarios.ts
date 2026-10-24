import assert from "node:assert/strict";
type Factory = () => any;
function owned(factory: Factory) {
  const api = factory();
  const merger = new api.DefaultProductMerger();
  merger.productMergeStrategies = [
    new api.OverrideProductMergeStrategy(),
    new api.MergeProductMergeStrategy(),
    new api.SmartMergeProductMergeStrategy(),
    new api.DeepSmartMergeProductMergeStrategy(),
    new api.CommandsSmartMergeProductMergeStrategy(),
  ];
  return { api, merger };
}
export const desktopMergerScenarios: [
  string,
  (factory: Factory) => Promise<void>,
][] = [
  [
    "default, override, unsupported strategy and final strategy removal",
    async (factory) => {
      const { merger } = owned(factory);
      assert.deepEqual(
        await merger.merge(
          { a: 1, nested: { a: true }, array: [1] },
          { nested: { b: true }, array: [2], a: null },
        ),
        { a: 1, nested: { a: true, b: true }, array: [2] },
      );
      assert.deepEqual(
        await merger.merge({ a: 1 }, { mergeStrategy: "override", b: 2 }),
        { b: 2 },
      );
      assert.deepEqual(
        await merger.merge({ a: 1 }, { mergeStrategy: "unrecognized", b: 2 }),
        { a: 1 },
      );
      assert.deepEqual(await merger.merge(), {});
    },
  ],
  [
    "partial Galileo routing disables incomplete route but preserves unrelated fields",
    async (factory) => {
      const { merger } = owned(factory);
      const base = {
        galileo: {
          enable: true,
          projectId: "p",
          endpoint: "https://owned.invalid",
          app: "a",
          server: "s",
          other: 1,
        },
      };
      const partial = await merger.merge(base, {
        galileo: { endpoint: "https://other.invalid", other: 2 },
      });
      assert.equal(partial.galileo.enable, false);
      for (const key of ["projectId", "endpoint", "app", "server"])
        assert.equal(partial.galileo[key], undefined);
      assert.equal(partial.galileo.other, 2);
      const untouched = await merger.merge(base, { galileo: { other: 3 } });
      assert.equal(untouched.galileo.enable, true);
      const complete = await merger.merge(base, {
        galileo: {
          projectId: "q",
          endpoint: "https://other.invalid",
          app: "b",
          server: "t",
        },
      });
      assert.equal(complete.galileo.enable, true);
      assert.equal(complete.galileo.projectId, "q");
    },
  ],
  [
    "smart model identity, override protection and forced marketplace replacement",
    async (factory) => {
      const { api, merger } = owned(factory);
      const protectedModel = {
        id: "protected",
        value: "local",
        [api.OVERRIDE_MODE]: "replace",
      };
      const result = await merger.merge(
        {
          models: [{ id: "m", nested: { a: 1 } }, protectedModel],
          builtInMarketPluginsMerge: [{ name: "old" }],
        },
        {
          mergeStrategy: "smartMerge",
          models: [
            { id: "m", nested: { b: 2 } },
            { id: "protected", value: "remote" },
            { name: "new" },
            null,
          ],
          builtInMarketPluginsMerge: [],
        },
      );
      assert.deepEqual(result.models[0], { id: "m", nested: { a: 1, b: 2 } });
      assert.equal(result.models[1], protectedModel);
      assert.equal(result.models[2].name, "new");
      assert.deepEqual(result.builtInMarketPluginsMerge, []);
    },
  ],
  [
    "deep smart primitive union and circular-reference cutoff preserve source behavior",
    async (factory) => {
      const { api } = owned(factory);
      const strategy = new api.DeepSmartMergeProductMergeStrategy();
      assert.deepEqual(
        await strategy.merge(
          { values: [1, 2, null] },
          { values: [2, 3, null] },
        ),
        { values: [1, 2, null, 3] },
      );
      const a: any = { name: "a" },
        b: any = { name: "b" };
      a.self = a;
      b.self = b;
      const result = await strategy.merge(a, b);
      assert.equal(result.name, "b");
      assert.equal(result.self, b);
      assert.deepEqual(
        await strategy.merge({ value: { a: 1 } }, { value: { b: 2 } }),
        { value: { a: 1, b: 2 } },
      );
    },
  ],
  [
    "command smart merge preserves empty command overlays while replacing other arrays",
    async (factory) => {
      const { merger } = owned(factory);
      const base = {
        commands: [
          { name: "one", description: "base", nested: { a: 1 } },
          { name: "keep" },
        ],
        models: [{ id: "old" }],
      };
      const result = await merger.merge(base, {
        mergeStrategy: "commandsSmartMerge",
        commands: [{ name: "one", nested: { b: 2 } }, { name: "new" }],
        models: [{ id: "new" }],
      });
      assert.deepEqual(result.commands, [
        { name: "one", description: "base", nested: { a: 1, b: 2 } },
        { name: "keep" },
        { name: "new" },
      ]);
      assert.deepEqual(result.models, [{ id: "new" }]);
      assert.deepEqual(
        (
          await merger.merge(base, {
            mergeStrategy: "commandsSmartMerge",
            commands: [],
          })
        ).commands,
        base.commands,
      );
      assert.equal(result.mergeStrategy, undefined);
    },
  ],
];
