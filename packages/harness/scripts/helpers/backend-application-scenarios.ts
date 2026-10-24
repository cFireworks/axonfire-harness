import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { createNativeDi } from "../../src/di/native-di.js";
import { diRuntime } from "./native-di-scenarios.js";
import { createNativeBackendApplication } from "../../src/runtime/native-backend-application.js";
export const BACKEND_APPLICATION_CASES = [
  {
    name: "original backend application resolves through DI, starts lifecycles and owns tagged signal handlers",
    async run(factory: typeof createNativeBackendApplication) {
      const di = createNativeDi(diRuntime()),
        proc: any = new EventEmitter(),
        events: any[] = [];
      proc.exit = (code: number) => events.push(["exit", code]);
      const borrowed = () => events.push(["borrowed"]);
      proc.on("SIGINT", borrowed);
      const core = di.getModule(78842).default;
      const n = factory({ di, process: proc }),
        container = di.ContainerFactory.create(
          core,
          di.autoBind((bind: any) => {
            bind(di.ApplicationLifecycle).toConstantValue({
              initialize() {
                events.push(["initialize"]);
              },
              onStart() {
                events.push(["start"]);
              },
              onStop() {
                events.push(["stop"]);
              },
            });
          }),
        );
      di.ContainerProvider.set(container);
      const app = container.get(di.Application),
        state = container.get(di.ApplicationStateService),
        changes: string[] = [];
      state.onStateChanged((s: string) => changes.push(s));
      assert.equal(app, container.get(n.BackendApplication));
      assert.equal(proc.listenerCount("SIGTERM"), 0);
      await app.start();
      assert.equal(state.state, "ready");
      assert.deepEqual(changes, ["started", "ready"]);
      app.setupExitSignals();
      assert.equal(proc.listenerCount("SIGINT"), 2);
      assert.equal(proc.listenerCount("SIGTERM"), 1);
      await app.stop();
      assert.equal(state.state, "stoped");
      proc.emit("SIGTERM");
      assert.deepEqual(events, [
        ["initialize"],
        ["start"],
        ["stop"],
        ["stop"],
        ["exit", 0],
      ]);
      app.removeListeners("SIGINT");
      assert.deepEqual(proc.listeners("SIGINT"), [borrowed]);
      proc.removeAllListeners();
      await container.unbindAllAsync();
      return { events, changes };
    },
  },
];
