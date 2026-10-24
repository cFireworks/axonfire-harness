import { createNativeProductEntry } from "./native-product-entry.js";
import {
  createNativeContainerBootstrap,
  CONTAINER_BOOTSTRAP_MODULES,
} from "../di/native-container-bootstrap.js";
import { createNativeProductRegistration } from "../di/native-product-registration.js";
import { createNativeSourceMapSupport, SOURCE_MAP_SUPPORT_MODULES } from "../di/native-source-map-support.js";
import { createNativeBackendFoundation } from "../http/native-backend-foundation.js";
import { createNativeBackendServer } from "../http/native-backend-server.js";
import {
  createNativeProductModules,
  PRODUCT_MODULES,
} from "./native-product-modules.js";

/** Composes original registration and server entrypoints. Activate in an owned process. */
export function createNativeProductRuntime(runtime: {
  di: any;
  globals: any;
  process: any;
  Error: ErrorConstructor;
  require: (id: string) => any;
  filename: string;
  basePath: string;
  console?: any;
  fetch?: typeof fetch;
  [key: string]: any;
}) {
  const foundation = createNativeBackendFoundation(runtime);
  const sourceMapIds = new Set<number>(SOURCE_MAP_SUPPORT_MODULES.map(([id]) => id).filter(id => id !== 16928 && id !== 79896));
  const productIds = new Set<number>(PRODUCT_MODULES.map(([id]) => id));
  const bootstrapIds = new Set<number>(
    CONTAINER_BOOTSTRAP_MODULES.map(([id]) => id),
  );
  let entry: ReturnType<typeof createNativeProductEntry> | undefined;
  let modules: ReturnType<typeof createNativeProductModules> | undefined;
  let product: ReturnType<typeof createNativeProductRegistration> | undefined;
  let sourceMap: ReturnType<typeof createNativeSourceMapSupport> | undefined;
  const bootstrap = createNativeContainerBootstrap({
    ...runtime,
    configBasePath: runtime.basePath,
    getModule,
  });
  const server = createNativeBackendServer({ ...runtime, getModule });
  function getModule(id: number): any {
    if (id === 29570)
      return (entry ??= createNativeProductEntry({
        ...runtime,
        getModule,
      })).getModule(id);
    if (bootstrapIds.has(id)) return bootstrap.getModule(id);
    if (id === 86355 || id === 39654) return server.getModule(id);
    if (sourceMapIds.has(id))
      return (sourceMap ??= createNativeSourceMapSupport(runtime)).getModule(
        id,
      );
    if (id === 8588 || id === 92378) {
      product ??= createNativeProductRegistration({
        di: runtime.di,
        getModule,
      });
      return product.getModule(id);
    }
    if (productIds.has(id)) {
      modules ??= createNativeProductModules({
        ...runtime,
        express: foundation.getExpress(),
        getModule,
      });
      return modules.getModule(id);
    }
    return foundation.getModule(id);
  }
  return {
    getModule,
    start: () => getModule(29570),
    loadContainer: () => bootstrap.start(),
    startServer: () => server.start(),
    /** Stop Application and drain its server before releasing the foundation context. Process hooks remain owned by the caller. */
    closeContext: () => foundation.closeContext(),
  };
}
