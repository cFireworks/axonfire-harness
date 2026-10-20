export function createHookLifecycleHelpers(runtime: any) {
  const AS = runtime.path,
    AX = runtime.fs;
  function registerWatchPaths(eA: any, el: any, ec: any): any {
    let eu: any = [];
    if (!Array.isArray(eA)) return { watcherCount: 0, dispose: () => {} };
    for (let ed of eA) {
      if ("string" != typeof ed || 0 === ed.length) continue;
      let eA: any = (0, AS.resolve)(ed);
      try {
        if (!AX.existsSync(eA)) {
          ec?.logger?.debug?.(`[watchPaths] skip missing path: ${eA}`);
          continue;
        }
        let ed: any = AX.statSync(eA).isDirectory(),
          ep: any = AX.watch(eA, { recursive: ed }, (eu: any, ep: any) => {
            let eg: any,
              eh: any = ed && ep ? (0, AS.resolve)(eA, ep) : eA;
            eg =
              "change" === eu ? "change" : AX.existsSync(eh) ? "add" : "unlink";
            try {
              el(eh, eg);
            } catch (eA: any) {
              ec?.logger?.warn?.(`[watchPaths] onChange threw: ${eA.message}`);
            }
          });
        eu.push(ep);
      } catch (el: any) {
        ec?.logger?.warn?.(`[watchPaths] failed to watch ${eA}: ${el.message}`);
      }
    }
    let ed: any = !1;
    return {
      watcherCount: eu.length,
      dispose: () => {
        if (!ed) {
          for (let eA of ((ed = !0), eu))
            try {
              eA.close();
            } catch {}
          eu.length = 0;
        }
      },
    };
  }
  function extractLastAssistantMessageText(eA: any): any {
    if (Array.isArray(eA) && 0 !== eA.length)
      for (let el: any = eA.length - 1; el >= 0; el--) {
        let ec: any = eA[el];
        if (ec?.type !== "message" || "assistant" !== ec.role) continue;
        let eu: any = ec.content;
        if ("string" == typeof eu) {
          if (eu.length > 0) return eu;
          continue;
        }
        if (Array.isArray(eu)) {
          let eA: any = [];
          for (let el of eu)
            el &&
              "object" == typeof el &&
              "string" == typeof el.text &&
              eA.push(el.text);
          if (eA.length > 0) return eA.join("");
          continue;
        }
      }
  }
  return { registerWatchPaths, extractLastAssistantMessageText };
}
