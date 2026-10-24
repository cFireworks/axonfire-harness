import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { createHash } from "node:crypto";
type Factory = (runtime?: any) => any;
async function owned(factory: Factory, run: (s: any) => Promise<void>) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "axon-local-storage-")),
    env: any = { WORKBUDDY_CONFIG_DIR: root },
    events: any[] = [],
    logs: any[] = [],
    logger = Object.fromEntries(
      ["info", "warn", "error"].map((k) => [
        k,
        (...v: any[]) => logs.push([k, ...v]),
      ]),
    );
  const runtime = {
      process: { env },
      os: { ...os, homedir: () => root },
      logger,
      productConfig: {
        tryGetWorkbuddyBaseProductConfiguration: () => ({
          dataFolderName: ".owned",
        }),
      },
    },
    api = factory(runtime),
    storage = new api.WorkbuddyFileLocalStorage();
  const listener = storage.changeEvent((e: any) => events.push(e));
  storage.init();
  try {
    await run({ api, storage, root, env, events, logs, runtime });
  } finally {
    listener.dispose();
    storage.emitter.dispose();
    fs.rmSync(root, { recursive: true, force: true });
  }
}
export const workbuddyLocalStorageScenarios: [
  string,
  (f: Factory) => Promise<void>,
][] = [
  [
    "original hashed JSON layout survives new storage instances",
    (f) =>
      owned(f, async (s) => {
        const key = "用户/../../cache",
          value = { models: ["a"], enabled: false, nested: { count: 2 } };
        await s.storage.set(key, value);
        const hash = createHash("md5").update(key).digest("hex");
        assert.equal(
          s.storage.resolveEntryPath(key),
          path.join(s.root, "local_storage", `wb_entry_${hash}.info`),
        );
        assert.deepEqual(
          JSON.parse(fs.readFileSync(s.storage.resolveEntryPath(key), "utf8")),
          value,
        );
        assert.deepEqual(s.events, [{ domain: key }]);
        const second = new s.api.WorkbuddyFileLocalStorage();
        try {
          assert.deepEqual(await second.get(key), value);
          assert.notEqual(second.getSync(key), value);
        } finally {
          second.emitter.dispose();
        }
        assert.equal(
          s.api.HashUtils.sha256("owned"),
          createHash("sha256").update("owned").digest("hex"),
        );
      }),
  ],
  [
    "missing and corrupt entries return the same supplied default without change events",
    (f) =>
      owned(f, async (s) => {
        const fallback = { owned: true };
        assert.equal(s.storage.getSync("missing", fallback), fallback);
        await s.storage.set("bad", { initial: true });
        s.events.length = 0;
        fs.writeFileSync(s.storage.resolveEntryPath("bad"), "{bad");
        assert.equal(await s.storage.get("bad", fallback), fallback);
        assert.equal(
          fs.readFileSync(s.storage.resolveEntryPath("bad"), "utf8"),
          "{bad",
        );
        assert.equal(s.events.length, 0);
        await s.storage.set("null", null);
        assert.equal(await s.storage.get("null", fallback), null);
      }),
  ],
  [
    "original writes and removals emit only after success; missing removal still emits",
    (f) =>
      owned(f, async (s) => {
        const circular: any = {};
        circular.self = circular;
        await assert.rejects(s.storage.set("circular", circular), TypeError);
        assert.equal(s.events.length, 0);
        await s.storage.remove("absent");
        assert.deepEqual(s.events, [{ domain: "absent" }]);
        await s.storage.set("entry", { v: 1 });
        await s.storage.remove("entry");
        assert.equal(fs.existsSync(s.storage.resolveEntryPath("entry")), false);
        assert.equal(s.events.length, 3);
      }),
  ],
  [
    "write/remove failures propagate while read failures return defaults",
    (f) =>
      owned(f, async (s) => {
        const api = f({
            ...s.runtime,
            fs: {
              ...fs,
              existsSync: () => true,
              readFileSync: () => {
                throw Error("read-failure");
              },
              writeFileSync: () => {
                throw Error("write-failure");
              },
              rmSync: () => {
                throw Error("remove-failure");
              },
            },
          }),
          storage = new api.WorkbuddyFileLocalStorage(),
          events: any[] = [];
        const sub = storage.changeEvent((e: any) => events.push(e));
        try {
          assert.equal(storage.getSync("x", "fallback"), "fallback");
          await assert.rejects(storage.set("x", 1), /write-failure/);
          await assert.rejects(storage.remove("x"), /remove-failure/);
          assert.equal(events.length, 0);
        } finally {
          sub.dispose();
          storage.emitter.dispose();
        }
      }),
  ],
  [
    "configuration directory override and original product folder fallback",
    (f) =>
      owned(f, async (s) => {
        s.env.WORKBUDDY_CONFIG_DIR = "  " + s.root + "  ";
        assert.equal(s.storage.resolveHomeDir(), s.root);
        s.env.WORKBUDDY_CONFIG_DIR = " ";
        assert.equal(s.storage.resolveHomeDir(), path.join(s.root, ".owned"));
        const fallback = f({
            ...s.runtime,
            productConfig: {
              tryGetWorkbuddyBaseProductConfiguration: () => ({
                dataFolderName: " ",
              }),
            },
          }),
          storage = new fallback.WorkbuddyFileLocalStorage();
        try {
          assert.equal(
            storage.resolveHomeDir(),
            path.join(s.root, ".workbuddy"),
          );
        } finally {
          storage.emitter.dispose();
        }
      }),
  ],
];
