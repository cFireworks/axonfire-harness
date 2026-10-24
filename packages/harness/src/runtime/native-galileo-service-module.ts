import { createRequire } from "node:module";
import { createNativeGalileoService } from "./native-galileo-service.js";
import { createNativeHttpsProxyAgent } from "./native-https-proxy-agent.js";
import { resolveGalileoConfig } from "./native-galileo-config-resolver.js";
import type { createNativeGalileoSdkHost } from "./native-galileo-sdk-host.js";
const require = createRequire(import.meta.url);

/** Bind the original service to an existing SDK host; DI and lifecycle remain caller-owned. */
export function createNativeGalileoServiceModule(
  runtime: {
    process: any;
    modules?: Record<number, any>;
    getModule?: (id: number) => any;
    [key: string]: any;
  },
  sdk: ReturnType<typeof createNativeGalileoSdkHost>,
) {
  const parent = (id: number) =>
    runtime.modules?.[id] ?? runtime.getModule?.(id);
  const product = parent(9151);
  if (!product) throw Error("Explicit Galileo product DI module 9151 required");
  const proxy = createNativeHttpsProxyAgent({
    require,
    globals: globalThis,
    process: runtime.process,
  });
  return createNativeGalileoService({
    ...runtime,
    SetupGalileo: sdk.SetupGalileo,
    Logger: sdk.Logger,
    modules: {
      ...runtime.modules,
      48161: require("node:os"),
      44708: require("node:https"),
      64007: proxy,
      9151: { ...product, resolveGalileoConfig },
      23258: sdk.getModule(23258),
      37366: sdk.getModule(37366),
      11447: sdk.getModule(11447),
      15183: sdk.getModule(15183),
    },
  });
}
