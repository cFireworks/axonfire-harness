import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createNativeDi } from "../../src/di/native-di.js";
import { diRuntime } from "./native-di-scenarios.js";
import { createNativeExpress } from "../../src/http/native-express.js";
import { createNativeBackendFoundation } from "../../src/http/native-backend-foundation.js";
import { createNativeContainerBootstrap } from "../../src/di/native-container-bootstrap.js";
import {
  createNativePromptServices,
  PROMPT_SERVICES_MODULES,
} from "../../src/runtime/native-prompt-services.js";
const require = createRequire(import.meta.url);
export async function promptServicesScenario(
  factory: typeof createNativePromptServices,
) {
  const temp = await mkdtemp(join(tmpdir(), "axon-prompts-")),
    proc = Object.create(process);
  proc.env = {
    CODEBUDDY_REMOTE_CONFIG_DISABLED: "true",
    WORKBUDDY_CONFIG_DIR: temp,
  };
  await writeFile(
    join(temp, "product.json"),
    JSON.stringify({
      config: { disabled: true },
      prompts: [
        { name: "owned", content: "Hello {{ name }}", tags: ["plain"] },
        {
          name: "owned",
          content: "{% for x in items %}{{ x }}{% endfor %}",
          tags: ["code"],
        },
      ],
      log: { level: "Info", output: ["file"], upload: { enabled: false } },
    }),
  );
  const di = createNativeDi({ ...diRuntime(), process: proc }),
    core = di.getModule(78842).default;
  di.ConfigUtil.getRaw().cell.logger.level = "error";
  const runtime = {
    di,
    globals: Object.create(globalThis),
    require,
    process: proc,
    basePath: temp,
    filename: join(temp, "bundle.js"),
  };
  const foundation = createNativeBackendFoundation(runtime),
    express = createNativeExpress(runtime),
    timers = new Set<any>();
  const host = factory({
    ...runtime,
    express,
    getModule: foundation.getModule,
    setTimeout(fn: any, ms: number) {
      const t = setTimeout(fn, ms);
      timers.add(t);
      return t;
    },
    clearTimeout(t: any) {
      timers.delete(t);
      clearTimeout(t);
    },
  });
  const ids = new Set<number>(PROMPT_SERVICES_MODULES.map(([id]) => id));
  const loader = createNativeContainerBootstrap({
    di,
    configBasePath: temp,
    getModule: (id: number) =>
      ids.has(id) ? host.getModule(id) : foundation.getModule(id),
  });
  const container = di.ContainerFactory.create(core);
  let productManager: any;
  try {
    for (const stage of [
      21280, 39066, 62309, 65903, 10352, 53879, 61488, 97619, 54387, 66892,
      94666, 59747,
    ])
      container.load(loader.getModule(stage).default);
    di.ContainerProvider.set(container);
    const product = foundation.getModule(9151),
      api = host.getModule(24015);
    productManager = container.get(product.ProductManager);
    await productManager.waitConfiguration();
    const providers = container.getAll(api.PromptProvider);
    for (const provider of providers) provider.initialize();
    const manager = container.get(api.PromptManager);
    manager.initialize();
    await manager.loadPrompts();
    assert.equal(await manager.get("missing"), undefined);
    const first = await manager.get("owned"),
      selected = await manager.get("owned", { tags: ["code"] });
    assert.equal(first.content, "Hello {{ name }}");
    assert.deepEqual(selected.tags, ["code"]);
    assert.equal(
      await manager.render(first.content, { variables: { name: "<owned>" } }),
      "Hello <owned>",
    );
    assert.equal(
      await manager.render(selected.content, {
        variables: { items: ["A", "B"] },
      }),
      "AB",
    );
    const renderer = await manager.getRenderer({});
    const compiled = renderer.getCompiledTemplate(first.content);
    assert.equal(compiled, renderer.getCompiledTemplate(first.content));
    productManager.configuration.next({
      ...productManager.getCurrentConfiguration(),
      prompts: [{ name: "updated", content: "new" }],
    });
    await manager.loadPrompts();
    assert.equal(await manager.get("owned"), undefined);
    assert.equal((await manager.get("updated")).content, "new");
    const model = host.load(),
      prompt = model.PromptUtil.create("owned", { temperature: 0.25 }),
      copy = prompt.copy();
    assert.equal(copy.contents, "owned");
    assert.notEqual(copy.instructions[0], prompt.instructions[0]);
    assert.equal(copy.options, prompt.options);
    return {
      first: first.content,
      selected: selected.tags,
      rendered: "AB",
      updated: true,
      copied: copy.contents,
    };
  } finally {
    for (const timer of timers) clearTimeout(timer);
    await productManager?.promise;
    await container.unbindAllAsync();
    await foundation.closeContext();
    await rm(temp, { recursive: true, force: true });
  }
}
