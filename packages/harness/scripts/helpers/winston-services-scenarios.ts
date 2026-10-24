import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { Writable } from "node:stream";
import { createNativeDi } from "../../src/di/native-di.js";
import { diRuntime } from "./native-di-scenarios.js";
import { createNativeExpress } from "../../src/http/native-express.js";
import { createNativeBackendFoundation } from "../../src/http/native-backend-foundation.js";
import { createNativeContainerBootstrap } from "../../src/di/native-container-bootstrap.js";
import { createNativeWinstonServices } from "../../src/runtime/native-winston-services.js";
const require = createRequire(import.meta.url);
export async function winstonServicesScenario(
  factory: typeof createNativeWinstonServices,
) {
  async function run(inject: boolean) {
    const di = createNativeDi(diRuntime()),
      core = di.getModule(78842).default;
    const runtime = {
      di,
      globals: Object.create(globalThis),
      require,
      process,
    };
    const foundation = createNativeBackendFoundation(runtime),
      express = createNativeExpress(runtime);
    const host = factory({ ...runtime, http: foundation, express });
    const loader = createNativeContainerBootstrap({
      di,
      configBasePath: "/owned",
      getModule: (id: number) =>
        id === 66467 ? host.load() : foundation.getModule(id),
    });
    const container = di.ContainerFactory.create(core);
    const stage = loader.getModule(30135).default,
      api = host.load(),
      winston = host.getModule(92454);
    const lines: string[] = [];
    const sink = new Writable({
      write(chunk, encoding, callback) {
        lines.push(chunk.toString());
        callback();
      },
    });
    let raw: any;
    try {
      if (inject) {
        raw = winston.createLogger({
          level: "debug",
          format: winston.format.printf(
            (info: any) => `${info.level}:${info.message}`,
          ),
          transports: [new winston.transports.Stream({ stream: sink })],
        });
        container.bind(api.RawWinstonLogger).toConstantValue(raw);
      }
      container.load(stage);
      di.ContainerProvider.set(container);
      const first = container.get(di.Logger),
        second = container.get(di.Logger);
      assert.ok(first instanceof api.WinstonLogger);
      assert.notEqual(first, second);
      if (!inject) {
        assert.equal(first.getLogger(), undefined);
        raw = second.getLogger();
        assert.ok(raw);
        assert.throws(() => first.info("first"), /undefined/);
        assert.equal(container.get(di.Logger).getLogger(), raw);
        return { firstUnset: true };
      }
      assert.equal(first.getLogger(), raw);
      assert.equal(second.getLogger(), raw);
      first.setContext("owned");
      first.info("message", "child");
      first.warn("warning");
      first.error("error");
      await new Promise<void>((r) => setImmediate(r));
      assert.equal(lines.length, 3);
      assert.ok(
        lines[0]!.includes("owned") &&
          lines[0]!.includes("child") &&
          lines[0]!.includes("message"),
      );
      assert.ok(lines[1]!.startsWith("warn:"));
      assert.ok(lines[2]!.startsWith("error:"));
      return { lines };
    } finally {
      raw?.close();
      sink.destroy();
      await container.unbindAllAsync();
      await foundation.closeContext();
    }
  }
  return { unbound: await run(false), injected: await run(true) };
}
