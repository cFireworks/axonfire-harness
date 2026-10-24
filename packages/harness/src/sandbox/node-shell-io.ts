import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
import { createNativeShellIO } from "./native-shell-io.js";
/** Node builtin boundary for the original Shell IO graph. No global installation. */
export function createNodeShellIO(runtime: {
  process: any;
  Bun?: any;
  console?: any;
  modules?: Record<number, any>;
}) {
  return createNativeShellIO({
    ...runtime,
    modules: {
      20181: require("node:buffer"),
      13193: require("node:string_decoder"),
      2203: require("node:stream"),
      79896: require("node:fs"),
      91943: require("node:fs/promises"),
      16928: require("node:path"),
      ...runtime.modules,
    },
  });
}
