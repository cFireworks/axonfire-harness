import { WecomClientConstants as em } from "./channel-client-constants.js";
import type { NativeChannelFactoryRuntime } from "./channel-client-services.js";
export const WecomBotClientFactory = Symbol("WecomBotClientFactory");
// Native UTF-16 offsets 10015182..10017282.
export class WecomBotClientFactoryImpl {
  [key: string]: any;
  constructor(readonly runtime: NativeChannelFactoryRuntime) {
    Object.assign(this, runtime);
    this.instances = new Map();
  }
  initialize(): any {
    (this.logger.setContext("WecomBotClientFactory"),
      this.loadAllSavedInstances());
  }
  loadAllSavedInstances(): any {
    try {
      for (let eA of (0, this.runtime.credentialsStore.loadAllInstances)())
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
              this.logger.info(`Loaded wecom instance: ${eA.instanceId}`));
          } catch (el: any) {
            this.logger.warn(
              `Failed to load wecom instance '${eA.instanceId}': ${el.message}`,
            );
          }
    } catch (eA: any) {
      this.logger.warn(`Failed to load wecom instances: ${eA.message}`);
    }
    this.loadInstanceFromEnv();
  }
  loadInstanceFromEnv(): any {
    if (this.instances.has("default")) return;
    let eA: any = this.runtime.env[em.ENV_KEY_WECOM_BOT_ID],
      el: any = this.runtime.env[em.ENV_KEY_WECOM_BOT_SECRET];
    if (eA && el)
      try {
        let eA: any = (0,
        this.runtime.credentialsStore.resolveWecomCredentials)("default");
        if (!eA) return;
        let el: any = this.runtime.createClient();
        (el.init(this.logger, "default", "WeCom:default", eA),
          this.instances.set("default", el),
          this.clientRegistry.register(el),
          this.logger.info(
            "Created default wecom instance from environment variables",
          ));
      } catch (eA: any) {
        this.logger.warn(
          `Failed to create wecom instance from env vars: ${eA.message}`,
        );
      }
  }
  getAll(): any {
    return Array.from(this.instances.values());
  }
  get(eA: any): any {
    return this.instances.get(eA);
  }
  create(eA: any, el: any, eu?: any): any {
    if (this.instances.has(eA))
      throw Error(`WecomBotClient instance '${eA}' already exists`);
    let ep: any = this.runtime.createClient();
    (ep.init(this.logger, eA, eu || `WeCom:${eA}`, el),
      this.instances.set(eA, ep),
      this.clientRegistry.register(ep));
    try {
      (this.runtime.getBridge().subscribeToClient(ep),
        this.logger.info(`Subscribed client ${eA} to channel bridge`));
    } catch (el: any) {
      this.logger.warn(
        `Failed to subscribe client ${eA} to bridge: ${el?.message}. Will retry on next bridge init.`,
      );
    }
    return (this.logger.info(`Created WecomBotClient instance: ${eA}`), ep);
  }
  remove(eA: any): any {
    let el: any = this.instances.get(eA);
    el &&
      (el.dispose(),
      this.instances.delete(eA),
      this.clientRegistry.unregister("wecom", eA),
      (0, this.runtime.credentialsStore.clearWecomCredentials)(eA),
      this.logger.info(`Removed WecomBotClient instance: ${eA}`));
  }
}
