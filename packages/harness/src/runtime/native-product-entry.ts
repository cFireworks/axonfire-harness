// @ts-nocheck
// Complete original product entry factory. Activate only in an owned process.
export const PRODUCT_ENTRY_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const PRODUCT_ENTRY_MODULES = [[29570, 7518353, 7519876]] as const;
export function createNativeProductEntry(runtime: any) {
  if (
    !runtime?.globals ||
    !runtime.process ||
    !runtime.filename ||
    !runtime.getModule
  )
    throw Error(
      "Explicit product entry globals, process, filename and parent resolver required",
    );
  const globalThis = runtime.globals,
    process = runtime.process,
    __filename = runtime.filename;
  // prettier-ignore
  const factories = {29570(eA,el,ec){"use strict";ec(55943);var eu=ec(20181),ed=ec(73339);globalThis.require=(0,ed.createRequire)(__filename);let patchSpawnLike=eA=>function(...el){let ec=el[el.length-1];return ec&&"object"==typeof ec&&!Array.isArray(ec)?void 0===ec.windowsHide&&(ec.windowsHide=!0):el.push({windowsHide:!0}),eA.apply(this,el)},patchExecLike=eA=>function(el,...ec){let eu=ec[0];return eu&&"function"!=typeof eu?"object"==typeof eu&&void 0===eu.windowsHide&&(eu.windowsHide=!0):ec.unshift({windowsHide:!0}),eA.call(this,el,...ec)};if("win32"===process.platform){let eA=ec(35317);eA.spawn=patchSpawnLike(eA.spawn),eA.spawnSync=patchSpawnLike(eA.spawnSync),eA.execFile=patchSpawnLike(eA.execFile),eA.execFileSync=patchSpawnLike(eA.execFileSync),eA.fork=patchSpawnLike(eA.fork),eA.execSync=patchExecLike(eA.execSync),eA.exec=patchExecLike(eA.exec)}{let eA=process.emitWarning;process.emitWarning=function(el,...ec){let eu="string"==typeof el?el:el?.message;if(!("string"==typeof eu&&eu.includes("NODE_TLS_REJECT_UNAUTHORIZED")))return eA.call(process,el,...ec)}}{let eA=process.rawListeners("warning");process.removeAllListeners("warning"),process.on("warning",el=>{if(!("MaxListenersExceededWarning"===el.name&&el.message?.includes("AbortSignal")))for(let ec of eA)ec(el)})}if(void 0===globalThis.File)if(eu.File)globalThis.File=eu.File;else{let FilePolyfill=class FilePolyfill extends eu.Blob{constructor(eA,el,ec){super(eA,ec),this.name=el,this.lastModified=ec?.lastModified??Date.now()}};globalThis.File=FilePolyfill}ec(86355)}};
  const cache = new Map();
  function ec(id: number) {
    if (cache.has(id)) return cache.get(id).exports;
    if (!factories[id]) {
      const exports = runtime.getModule(id);
      if (exports === undefined)
        throw Error("Explicit product entry parent required: " + id);
      return exports;
    }
    const module = { id, loaded: false, exports: {} };
    cache.set(id, module);
    factories[id].call(module.exports, module, module.exports, ec);
    module.loaded = true;
    return module.exports;
  }
  return { start: () => ec(29570), getModule: ec };
}
