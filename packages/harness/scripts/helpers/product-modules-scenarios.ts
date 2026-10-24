import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import { createNativeDi } from "../../src/di/native-di.js";
import { diRuntime } from "./native-di-scenarios.js";
import { createNativeExpress } from "../../src/http/native-express.js";
import { createNativeBackendFoundation } from "../../src/http/native-backend-foundation.js";
import { createNativeProductModules } from "../../src/runtime/native-product-modules.js";
const require = createRequire(import.meta.url);
export async function productModulesScenario(
  factory: typeof createNativeProductModules,
) {
  const proc = Object.create(process);
  proc.env = {};
  const di = createNativeDi({ ...diRuntime(), process: proc }),
    core = di.getModule(78842).default;
  const runtime = {
    di,
    globals: Object.create(globalThis),
    require,
    process: proc,
    basePath: "/owned/product",
    filename: "/owned/product/bundle.js",
    Error: runInNewContext("Error"),
  };
  Object.defineProperty(runtime.globals, "crypto", {
    value: require("node:crypto").webcrypto,
  });
  const foundation = createNativeBackendFoundation(runtime),
    express = createNativeExpress(runtime),
    timers = new Map<number, () => void>();
  let sequence = 0;
  const host = factory({
    ...runtime,
    express,
    getModule: foundation.getModule,
    setTimeout(fn: () => void) {
      const id = ++sequence;
      timers.set(id, fn);
      return id;
    },
    clearTimeout(id: number) {
      timers.delete(id);
    },
  });
  const container = di.ContainerFactory.create(core);
  let subscription: any;
  try {
    const pkce = host.getModule(3849);
    const challenge = await pkce.default(43);
    assert.equal(challenge.code_verifier.length, 43);
    assert.equal(
      await pkce.verifyChallenge(
        challenge.code_verifier,
        challenge.code_challenge,
      ),
      true,
    );
    const navigation = host.getModule(84492),
      undo = host.getModule(63767),
      record = host.getModule(26314);
    assert.equal(host.getModule(84492), navigation);
    container.load(di.autoBind());
    di.ContainerProvider.set(container);
    const nav = container.get(navigation.NavigationManager),
      history = container.get(undo.UndoRedoService);
    const values: any[] = [];
    subscription = nav.navigateSubject.subscribe((value: any) =>
      values.push(value),
    );
    const route = { path: "/owned" };
    nav.setInitialRoute(route);
    assert.notEqual(nav.initialRoute, route);
    await nav.to(route);
    assert.deepEqual(values, [route]);
    nav.clearInitialRoute();
    assert.equal(nav.initialRoute, undefined);
    history.onValueChange("a", 1);
    history.onValueChange("ab", 2);
    assert.equal(history.undoStack.length, 1);
    assert.deepEqual(history.undo(), { value: "", cursorOffset: 1 });
    history.onValueChange("", 0);
    assert.equal(history.canUndo(), false);
    history.clear();
    assert.equal(timers.size, 0);
    assert.equal(record.getRecordReplayMode(), "passthrough");
    proc.env.CODEBUDDY_RECORD_DIR = "/owned/record";
    assert.equal(record.getRecordReplayMode(), "record");
    proc.env.CODEBUDDY_REPLAY_DIR = "/owned/replay";
    assert.throws(() => record.getRecordReplayMode(), /mutually exclusive/);
    return { navigation: values, undo: true, record: "record" };
  } finally {
    subscription?.unsubscribe();
    timers.clear();
    await container.unbindAllAsync();
    await foundation.closeContext();
  }
}
