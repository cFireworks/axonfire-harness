import assert from "node:assert/strict";
import { createNativeContextVariableServices } from "../../src/runtime/native-context-variable-services.js";
import { createNativeContainerBootstrap } from "../../src/di/native-container-bootstrap.js";
import { containerBootstrapFixture } from "./container-bootstrap-scenarios.js";
export async function contextVariableServicesScenario(
  factory: typeof createNativeContextVariableServices,
) {
  let api: any;
  const events: any[] = [];
  const context = { owned: true };
  const bootstrap = containerBootstrapFixture(
    createNativeContainerBootstrap,
    undefined,
    ({ di }) => ({
      default: di.autoBind((bind: any) => {
        bind(api.ContextVariableResolver).toConstantValue({
          name: "value",
          async priority(v: any, c: any) {
            events.push(["priority", v.name, c]);
            return 10;
          },
          async resolve(v: any, c: any) {
            assert.equal(c, context);
            events.push(["resolve", v.value]);
            await new Promise<void>((r) => setImmediate(r));
            return { name: v.name, value: v.value };
          },
        });
        bind(api.ContextVariableResolver).toConstantValue({
          name: "value",
          priority() {
            throw Error("priority failure");
          },
          resolve() {
            throw Error("unreachable");
          },
        });
        bind(api.ContextVariableResolver).toConstantValue({
          name: "failed",
          priority: () => 1,
          resolve() {
            throw Error("owned resolver failure");
          },
        });
        bind(api.ContextVariableResolver).toConstantValue({
          name: "empty",
          priority: () => 1,
          resolve: () => undefined,
        });
      }),
    }),
    undefined,
    (id, { di }) => {
      if (id === 66915) {
        const host = factory({ di });
        api = host.load();
        assert.equal(api, host.load());
        return api;
      }
    },
  );
  bootstrap.di.ConfigUtil.getRaw().cell.logger.level = "error";
  let container: any;
  try {
    container = await bootstrap.loader.start();
    assert.ok(container, JSON.stringify(bootstrap.errors));
    bootstrap.di.ContainerProvider.set(container);
    const manager = container.get(api.ContextVariableManager);
    assert.ok(manager instanceof api.ContextVariableManagerImpl);
    const variables = [
      { name: "value", value: "first" },
      { name: "failed" },
      { name: "missing" },
      { name: "empty" },
      { name: "value", value: "last" },
    ];
    const values = await manager.getContextVariables(variables, context);
    assert.deepEqual(values, [
      { name: "value", value: "first" },
      { name: "value", value: "last" },
    ]);
    assert.equal(variables.length, 5);
    assert.deepEqual(events, [
      ["priority", "value", undefined],
      ["resolve", "first"],
      ["priority", "value", undefined],
      ["resolve", "last"],
    ]);
    assert.deepEqual(
      await manager.getContextVariablesMap(
        [
          { name: "value", value: 1 },
          { name: "value", value: 2 },
        ],
        context,
      ),
      { value: 2 },
    );
    assert.equal(
      await manager.getContextVariable({ name: "missing" }, context),
      undefined,
    );
    assert.deepEqual(await manager.getContextVariables(undefined, context), []);
    manager.registerContextVariableResolver({
      name: "value",
      priority: () => 20,
      resolve: (v: any, c: any) => {
        assert.equal(c, context);
        return { name: v.name, value: "collected" };
      },
    });
    assert.deepEqual(
      await manager.getContextVariable({ name: "value" }, context),
      { name: "value", value: "collected" },
    );
    assert.deepEqual(
      api.ContextVariableUtils.toObject([
        { name: "a", value: 1 },
        { name: "a", value: 2 },
      ]),
      { a: 2 },
    );
    assert.deepEqual(api.ContextVariableUtils.toArray({ a: 1, b: 2 }), [
      { name: "a", value: 1 },
      { name: "b", value: 2 },
    ]);
    assert.deepEqual(bootstrap.errors, []);
    return {
      values,
      priorities: events.filter((x) => x[0] === "priority").map((x) => x[2]),
      registered: manager.getResolvers("value").length,
    };
  } finally {
    await container?.unbindAllAsync();
  }
}
