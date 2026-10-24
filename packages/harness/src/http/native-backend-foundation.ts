import {
  createNativePromptServices,
  PROMPT_SERVICES_MODULES,
} from "../runtime/native-prompt-services.js";
import {
  createNativeCodeRatioServices,
  CODE_RATIO_SERVICES_MODULES,
} from "../runtime/native-code-ratio-services.js";
import {
  createNativeNodeLogging,
  NODE_LOGGING_MODULES,
} from "../runtime/native-node-logging.js";
import {
  createNativeEventServices,
  EVENT_SERVICES_MODULES,
} from "../runtime/native-event-services.js";
import {
  createNativeWinstonServices,
  WINSTON_SERVICES_MODULES,
} from "../runtime/native-winston-services.js";
import {
  createNativeProductConfigServices,
  PRODUCT_CONFIG_SERVICES_MODULES,
} from "../runtime/native-product-config-services.js";
import {
  createNativeFilesystemServices,
  FILESYSTEM_SERVICES_MODULES,
} from "../runtime/native-filesystem-services.js";
import {
  createNativeContextVariableServices,
  CONTEXT_VARIABLE_SERVICES_MODULES,
} from "../runtime/native-context-variable-services.js";
import {
  createNativeNodeServices,
  NODE_SERVICES_MODULES,
} from "../runtime/native-node-services.js";
import {
  createNativeCommonServices,
  COMMON_SERVICES_MODULES,
} from "../runtime/native-common-services.js";
import {
  createNativeHttpController,
  HTTP_CONTROLLER_MODULES,
} from "./native-http-controller.js";
import { createNativeBackendNamespace, BACKEND_NAMESPACE_MODULES } from "../di/native-backend-namespace.js";
import { createNativeBackendApplication } from "../runtime/native-backend-application.js";
import { DI_MODULES } from "../di/native-di.js";
import { createNativeExpress, EXPRESS_MODULES } from "./native-express.js";
import {
  createNativeHttpComponents,
  HTTP_COMPONENTS_MODULES,
} from "./native-http-components.js";
import { createNativeHttpHost } from "./native-http-host.js";

/** Shared recovered parents for the original bootstrap and server. No product bindings are invented. */
export function createNativeBackendFoundation(runtime: {
  di: any;
  globals: any;
  require: (id: string) => any;
  process: any;
  console?: any;
  basePath?: string;
  filename?: string;
}) {
  let context: ReturnType<typeof createNativeHttpHost> | undefined;
  let application:
    ReturnType<typeof createNativeBackendApplication> | undefined;
  let backend: ReturnType<typeof createNativeBackendNamespace> | undefined;
  let express: ReturnType<typeof createNativeExpress> | undefined;
  let components: ReturnType<typeof createNativeHttpComponents> | undefined;
  let controller: ReturnType<typeof createNativeHttpController> | undefined;
  const controllerIds = new Set<number>(
    HTTP_CONTROLLER_MODULES.map(([id]) => id),
  );
  let common: ReturnType<typeof createNativeCommonServices> | undefined;
  const commonIds = new Set<number>(COMMON_SERVICES_MODULES.map(([id]) => id));
  let node: ReturnType<typeof createNativeNodeServices> | undefined;
  const nodeIds = new Set<number>(NODE_SERVICES_MODULES.map(([id]) => id));
  let variables:
    ReturnType<typeof createNativeContextVariableServices> | undefined;
  const variableIds = new Set<number>(
    CONTEXT_VARIABLE_SERVICES_MODULES.map(([id]) => id),
  );
  let filesystem: ReturnType<typeof createNativeFilesystemServices> | undefined;
  const filesystemIds = new Set<number>(
    FILESYSTEM_SERVICES_MODULES.map(([id]) => id),
  );
  let product: ReturnType<typeof createNativeProductConfigServices> | undefined;
  const productIds = new Set<number>(
    PRODUCT_CONFIG_SERVICES_MODULES.map(([id]) => id),
  );
  let winston: ReturnType<typeof createNativeWinstonServices> | undefined;
  const winstonIds = new Set<number>(
    WINSTON_SERVICES_MODULES.map(([id]) => id),
  );
  let events: ReturnType<typeof createNativeEventServices> | undefined;
  const eventIds = new Set<number>(EVENT_SERVICES_MODULES.map(([id]) => id));
  let nodeLogging: ReturnType<typeof createNativeNodeLogging> | undefined;
  const nodeLoggingIds = new Set<number>(
    NODE_LOGGING_MODULES.map(([id]) => id),
  );
  let codeRatio: ReturnType<typeof createNativeCodeRatioServices> | undefined;
  const codeRatioIds = new Set<number>(
    CODE_RATIO_SERVICES_MODULES.map(([id]) => id),
  );
  let prompts: ReturnType<typeof createNativePromptServices> | undefined;
  const promptIds = new Set<number>(PROMPT_SERVICES_MODULES.map(([id]) => id));
  const namespaceIds = new Set<number>(BACKEND_NAMESPACE_MODULES.map(([id]) => id));
  const contextIds = new Set([30805, 63192, 64891, 10066, 14953, 41708, 49647,
    61987, 65911, 69919, 72086, 73726, 77414, 87815, 93979]);
  const diIds = new Set<number>(DI_MODULES.map(([id]) => id));
  const expressIds = new Set<number>(EXPRESS_MODULES.map(([id]) => id));
  let closed = false;
  const componentIds = new Set<number>(
    HTTP_COMPONENTS_MODULES.map(([id]) => id),
  );
  function getExpress() {
    return (express ??= createNativeExpress(runtime));
  }
  function getModule(id: number): any {
    if (closed) throw Error("Backend foundation context is closed");
    if (id === 80699) return runtime.di;
    if ([71869, 15536, 20847].includes(id)) return runtime.di.getModule(id);
    if (id === 93772 || id === 96000) {
      application ??= createNativeBackendApplication(runtime);
      return application.getModule(id);
    }
    if (contextIds.has(id)) {
      context ??= createNativeHttpHost({ lazy: true });
      return context.native.getModule(id);
    }
    if (namespaceIds.has(id)) {
      backend ??= createNativeBackendNamespace({
        require: runtime.require,
        getModule,
      });
      return backend.getModule(id);
    }
    if (id === 47704) return getExpress().express;
    if ([16928, 79896, 39023, 2203, 20181].includes(id))
      return getExpress().getModule(id);
    if (id === 79896) return getExpress().getModule(id);
    if (promptIds.has(id)) {
      prompts ??= createNativePromptServices({
        ...runtime,
        express: getExpress(),
        getModule,
      });
      return prompts.getModule(id);
    }
    if (codeRatioIds.has(id)) {
      codeRatio ??= createNativeCodeRatioServices({
        ...runtime,
        express: getExpress(),
        getModule,
      });
      return codeRatio.getModule(id);
    }
    if (nodeLoggingIds.has(id)) {
      nodeLogging ??= createNativeNodeLogging({
        ...runtime,
        express: getExpress(),
        getModule,
      });
      return nodeLogging.getModule(id);
    }
    if (eventIds.has(id)) {
      events ??= createNativeEventServices({
        ...runtime,
        express: getExpress(),
        getModule,
      });
      return events.getModule(id);
    }
    if (winstonIds.has(id)) {
      winston ??= createNativeWinstonServices({
        ...runtime,
        http: { getModule },
        express: getExpress(),
      });
      return winston.getModule(id);
    }
    if (productIds.has(id)) {
      product ??= createNativeProductConfigServices({
        ...runtime,
        express: getExpress(),
        getModule,
      });
      return product.getModule(id);
    }
    if (filesystemIds.has(id)) {
      filesystem ??= createNativeFilesystemServices({
        ...runtime,
        http: { getModule },
        express: getExpress(),
        getModule,
      });
      return filesystem.getModule(id);
    }
    if (variableIds.has(id)) {
      variables ??= createNativeContextVariableServices(runtime);
      return variables.getModule(id);
    }
    if (nodeIds.has(id)) {
      node ??= createNativeNodeServices({
        ...runtime,
        http: { getModule },
        common: { getModule },
        express: getExpress(),
      });
      return node.getModule(id);
    }
    if (commonIds.has(id)) {
      common ??= createNativeCommonServices({
        ...runtime,
        http: { getModule },
        express: getExpress(),
      });
      return common.getModule(id);
    }
    if ([16928, 12276, 39023, 35615].includes(id))
      return getExpress().getModule(id);
    if (controllerIds.has(id)) {
      controller ??= createNativeHttpController({
        ...runtime,
        http: { getModule },
        express: getExpress(),
      });
      return controller.getModule(id);
    }
    if (componentIds.has(id)) {
      components ??= createNativeHttpComponents({
        ...runtime,
        express: getExpress(),
        getModule,
      });
      return components.getModule(id);
    }
    // Preserve specialized shared parents before routing remaining captured dependencies.
    if (diIds.has(id)) return runtime.di.getModule(id);
    if (expressIds.has(id)) return getExpress().getModule(id);
    return undefined;
  }
  return {
    getModule,
    getExpress,
    /** Call after stopping the application and draining its server; borrowed DI/process remain owned by the caller. */
    async closeContext() {
      if (closed) return;
      closed = true;
      await context?.close();
    },
  };
}
