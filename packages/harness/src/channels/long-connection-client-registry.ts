function makeKey(eA: any, el: any) {
  return `${eA}:${el}`;
}
export const LongConnectionClientRegistry = Symbol(
  "LongConnectionClientRegistry",
);
export class LongConnectionClientRegistryImpl {
  [key: string]: any;
  constructor() {
    this.clients = new Map();
  }
  register(eA: any): any {
    this.clients.set(makeKey(eA.clientType, eA.instanceId), eA);
  }
  unregister(eA: any, el: any): any {
    this.clients.delete(makeKey(eA, el));
  }
  getAll(): any {
    return Array.from(this.clients.values());
  }
  getByType(eA: any): any {
    return Array.from(this.clients.values()).filter(
      (el: any) => el.clientType === eA,
    );
  }
  get(eA: any, el?: any): any {
    if (el) return this.clients.get(makeKey(eA, el));
    for (let el of this.clients.values()) if (el.clientType === eA) return el;
  }
}
