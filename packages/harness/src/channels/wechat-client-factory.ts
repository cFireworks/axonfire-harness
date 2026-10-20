import { WecomClientConstants as em } from "./channel-client-constants.js";
import type { NativeChannelFactoryRuntime } from "./channel-client-services.js";
export const WechatClientFactory = Symbol("WechatClientFactory");
// Native UTF-16 offsets 9973452..9975439.
export class WechatClientFactoryImpl {
  [key: string]: any;
  constructor(readonly runtime: NativeChannelFactoryRuntime) {
    Object.assign(this, runtime);
    this.instances = new Map();
  }
  initialize(): any {
    (this.logger.setContext("WechatClientFactory"),
      (0, this.runtime.credentialsStore.cleanupPendingInstances)(),
      this.loadAllSavedInstances());
  }
  loadAllSavedInstances(): any {
    try {
      for (let eA of (0, this.runtime.credentialsStore.loadAllInstances)()) {
        if (eA.instanceId.startsWith("_pending")) {
          this.logger.info(
            `Skipping pending instance during load: ${eA.instanceId}`,
          );
          continue;
        }
        if (!this.instances.has(eA.instanceId))
          try {
            let el: any = this.runtime.createClient();
            (el.init(
              this.logger,
              eA.instanceId,
              eA.displayName,
              eA.credentials,
            ),
              this.instances.set(eA.instanceId, el),
              this.clientRegistry.register(el),
              this.logger.info(`Loaded wechat instance: ${eA.instanceId}`));
          } catch (el: any) {
            this.logger.warn(
              `Failed to load wechat instance '${eA.instanceId}': ${el.message}`,
            );
          }
      }
    } catch (eA: any) {
      this.logger.warn(`Failed to load wechat instances: ${eA.message}`);
    }
  }
  getAll(): any {
    return Array.from(this.instances.values());
  }
  get(eA: any): any {
    return this.instances.get(eA);
  }
  create(eA: any, el?: any): any {
    if (this.instances.has(eA))
      throw Error(`WechatClient instance '${eA}' already exists`);
    let eu: any = this.runtime.createClient();
    (eu.init(this.logger, eA, el),
      this.instances.set(eA, eu),
      this.clientRegistry.register(eu),
      (eu.onInstanceIdChanged = (eA: any, el: any) => {
        this.updateInstanceId(eA, el);
      }));
    try {
      let ep: any = this.runtime.getBridge();
      "function" == typeof ep.subscribeToClient &&
        (ep.subscribeToClient(eu),
        this.logger.info(`Subscribed client ${eA} to channel bridge`));
    } catch (el: any) {
      this.logger.warn(
        `Failed to subscribe client ${eA} to bridge: ${el?.message}`,
      );
    }
    return (this.logger.info(`Created WechatClient instance: ${eA}`), eu);
  }
  remove(eA: any): any {
    let el: any = this.instances.get(eA);
    el &&
      (el.dispose(),
      this.instances.delete(eA),
      this.clientRegistry.unregister("wechat", eA),
      (0, this.runtime.credentialsStore.clearCredentials)(eA),
      this.logger.info(`Removed WechatClient instance: ${eA}`));
  }
  updateInstanceId(eA: any, el: any): any {
    let ec: any = this.instances.get(eA);
    ec &&
      (this.instances.delete(eA),
      this.instances.set(el, ec),
      this.clientRegistry.unregister("wechat", eA),
      this.clientRegistry.register(ec),
      this.logger.info(`Updated wechat instance ID: ${eA} → ${el}`));
  }
}
