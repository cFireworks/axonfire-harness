export type AbortableIteratorRuntime = {
  env: NodeJS.ProcessEnv;
  setTimeout: (callback: () => void, ms: number) => any;
  clearTimeout: (timer: any) => void;
};
export function createAbortableIteratorFactory(
  runtime: AbortableIteratorRuntime = {
    env: process.env,
    setTimeout,
    clearTimeout,
  },
) {
  let A_: any = (() => {
    let eA: any = runtime.env.CODEBUDDY_ABORT_GRACE_MS;
    if (eA) {
      let el: any = parseInt(eA, 10);
      if (!isNaN(el) && el > 0) return el;
    }
    return 3e3;
  })();
  async function* createAbortableIterator(
    eA: any,
    el: any,
    ec: any,
  ): AsyncGenerator<any> {
    if (!el.aborted)
      for (;;) {
        let eu: any,
          ed: any = null,
          ep: any = new Promise((eA: any) => {
            ((eu = () => {
              "function" ==
                typeof (ed = runtime.setTimeout(() => {
                  (ec.info(
                    `[AbortableIterator] Abort grace period (${A_}ms) expired, forcing exit`,
                  ),
                    eA({ done: !0, aborted: !0 }));
                }, A_)).unref && ed.unref();
            }),
              el.aborted
                ? eu()
                : el.addEventListener("abort", eu, { once: !0 }));
          });
        try {
          let el: any = await Promise.race([eA.next(), ep]);
          if (
            (ed && (runtime.clearTimeout(ed), (ed = null)),
            "aborted" in el && el.aborted)
          ) {
            try {
              eA.return?.();
            } catch {}
            return;
          }
          if (el.done) return;
          yield el.value;
        } catch (eA: any) {
          if ((ed && runtime.clearTimeout(ed), el.aborted))
            return void ec.info(
              "[AbortableIterator] Iterator threw after abort, exiting",
            );
          throw eA;
        } finally {
          el.aborted || el.removeEventListener("abort", eu);
        }
      }
  }
  return { createAbortableIterator, abortGraceMs: A_ };
}
export const { createAbortableIterator } = createAbortableIteratorFactory();
