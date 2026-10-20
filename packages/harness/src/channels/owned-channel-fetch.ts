/** Host-only ownership boundary. Does not replace the native API's timeout rules. */
export function createOwnedChannelFetch(
  fetchImpl: typeof fetch,
  Controller: typeof AbortController = AbortController,
) {
  let closed = false;
  const requests = new Map<AbortController, () => void>();
  const ownedFetch: typeof fetch = async (input, init) => {
    if (closed) throw Error("Channel clients are closed");
    const controller = new Controller(),
      external =
        init?.signal ?? (input instanceof Request ? input.signal : undefined);
    let rejectAbort!: (error: any) => void;
    const aborted = new Promise<never>((_resolve, reject) => {
        rejectAbort = reject;
      }),
      onAbort = () => rejectAbort(controller.signal.reason ?? Error("Aborted")),
      relay = () => controller.abort(external?.reason);
    void aborted.catch(() => undefined);
    const cleanup = () => {
      requests.delete(controller);
      controller.signal.removeEventListener("abort", onAbort);
      external?.removeEventListener("abort", relay);
    };
    controller.signal.addEventListener("abort", onAbort, { once: true });
    external?.addEventListener("abort", relay, { once: true });
    requests.set(controller, cleanup);
    if (external?.aborted) relay();
    try {
      controller.signal.throwIfAborted();
      const response = await Promise.race([
        fetchImpl(input, { ...init, signal: controller.signal }),
        aborted,
      ]);
      return new Proxy(response, {
        get(target, key) {
          const value = Reflect.get(target, key, target);
          if (
            [
              "text",
              "json",
              "arrayBuffer",
              "blob",
              "formData",
              "bytes",
            ].includes(String(key)) &&
            typeof value === "function"
          )
            return async (...args: any[]) => {
              try {
                controller.signal.throwIfAborted();
                return await Promise.race([value.apply(target, args), aborted]);
              } finally {
                cleanup();
              }
            };
          return typeof value === "function" ? value.bind(target) : value;
        },
      });
    } catch (error) {
      cleanup();
      throw error;
    }
  };
  return {
    fetch: ownedFetch,
    close() {
      if (closed) return;
      closed = true;
      for (const [controller, cleanup] of requests) {
        controller.abort(Error("Channel clients are closed"));
        cleanup();
      }
      requests.clear();
    },
    get pendingCount() {
      return requests.size;
    },
  };
}
