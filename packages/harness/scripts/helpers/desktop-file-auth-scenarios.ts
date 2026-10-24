import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { EventEmitter } from "node:events";
import { BehaviorSubject } from "rxjs";
import { createNativeDesktopAuthentication } from "../../src/auth/native-desktop-authentication.js";
import { withOwnedDesktopAuthentication } from "./desktop-auth-scenarios.js";
type Factory = (runtime?: any) => any;
const tick = () => new Promise<void>((r) => setImmediate(r));
async function waitFor(check: () => boolean) {
  const deadline = Date.now() + 4000;
  while (!check() && Date.now() < deadline)
    await new Promise((r) => setTimeout(r, 20));
  assert.ok(check(), "owned watcher deadline");
}
async function owned(
  factory: Factory,
  run: (s: any) => Promise<void>,
  patch: any = {},
) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "axon-file-auth-"));
  const api = factory(patch),
    storage = new api.FileAuthenticationStorage(),
    events: any[] = [],
    logs: any[] = [];
  const config = new BehaviorSubject<any>({
    authentication: { id: "owned", endpoint: "https://owned.invalid" },
  });
  const logger = Object.fromEntries(
    ["info", "warn", "error", "setContext"].map((k) => [
      k,
      (...v: any[]) => logs.push([k, ...v]),
    ]),
  );
  Object.assign(storage, {
    logger,
    filePathService: { sharedDataPath: root },
    productManager: { configuration: config },
  });
  const sub = storage.storeSessionSubject.subscribe((v: any) => events.push(v));
  try {
    await run({ api, storage, root, events, logs, config, logger });
  } finally {
    await storage.dispose();
    sub.unsubscribe();
    config.complete();
    fs.rmSync(root, { recursive: true, force: true });
  }
}
const session = (uid = "owned") => ({
  account: { uid },
  auth: { accessToken: "owned-token", domain: "owned.invalid" },
});
export const desktopFileAuthScenarios: [
  string,
  (factory: Factory) => Promise<void>,
][] = [
  [
    "atomic file round trip, path configuration and write cleanup",
    (factory) =>
      owned(factory, async ({ api, storage, root, events }: any) => {
        assert.equal(await storage.priority(), 6);
        api.setWorkbuddyAuthenticationConfigurationProvider(() => ({
          id: "override",
        }));
        const file = await storage.getAuthSavePath();
        assert.equal(file, path.join(root, "auth", "override.info"));
        await storage.store(session());
        assert.deepEqual(JSON.parse(fs.readFileSync(file, "utf8")), session());
        assert.deepEqual(await storage.restore(), session());
        assert.equal(events.at(-1).account.uid, "owned");
        assert.deepEqual(fs.readdirSync(path.dirname(file)), ["override.info"]);
        api.setWorkbuddyAuthenticationConfigurationProvider(() => {
          throw Error("owned");
        });
        assert.equal(
          await storage.getAuthSavePath(),
          path.join(root, "auth", "owned.info"),
        );
      }),
  ],
  [
    "logout marker blocks refresh and stale clean cannot remove a newer login",
    (factory) =>
      owned(factory, async ({ storage }: any) => {
        await storage.store(session("first"));
        const file = await storage.getAuthSavePath(),
          token = await storage.beginLogout();
        assert.equal(fs.readFileSync(file + ".logged-out", "utf8"), token);
        await storage.store(session("stale"), { preserveLogoutMarker: true });
        assert.equal(await storage.restore(), undefined);
        assert.equal(
          JSON.parse(fs.readFileSync(file, "utf8")).account.uid,
          "first",
        );
        await storage.store(session("new"));
        assert.equal(fs.existsSync(file + ".logged-out"), false);
        assert.equal(await storage.clean({ logoutToken: token }), false);
        assert.equal((await storage.restore()).account.uid, "new");
        const current = await storage.beginLogout();
        assert.equal(await storage.clean({ logoutToken: current }), true);
        assert.equal(fs.existsSync(file), false);
        assert.ok(
          fs
            .readdirSync(path.dirname(file))
            .some((name: string) => name.endsWith(".info")),
        );
        assert.equal(await storage.restore(), undefined);
      }),
  ],
  [
    "corrupt file and legacy domain guards preserve original restore behavior",
    (factory) =>
      owned(factory, async ({ api, storage }: any) => {
        const file = await storage.getAuthSavePath();
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, "{broken");
        assert.equal(await storage.restore(), undefined);
        fs.unlinkSync(file);
        api.setWorkbuddyLegacyAuthSessionMigrator({
          migrate: async () => ({
            ...session(),
            auth: { domain: "other.invalid", accessToken: "owned" },
          }),
        });
        assert.equal(await storage.restore(), undefined);
        assert.equal(fs.existsSync(file), false);
        api.setWorkbuddyLegacyAuthSessionMigrator({
          migrate: async () => session("legacy"),
        });
        assert.equal((await storage.restore()).account.uid, "legacy");
      }),
  ],
  [
    "real directory watcher observes atomic replacement and markers, but preserves unmarked unlink",
    (factory) =>
      owned(factory, async ({ storage, events }: any) => {
        await storage.store(session("first"));
        await storage.initializeWatcher();
        await waitFor(() => !storage.isWriting);
        const file = await storage.getAuthSavePath();
        fs.writeFileSync(
          file + ".external",
          JSON.stringify(session("external")),
        );
        fs.renameSync(file + ".external", file);
        await waitFor(() => events.at(-1)?.account?.uid === "external");
        fs.unlinkSync(file);
        await new Promise((r) => setTimeout(r, 750));
        assert.equal(storage.session.account.uid, "external");
        fs.writeFileSync(file + ".logged-out", "owned-external-logout");
        await waitFor(() => events.at(-1) === undefined);
        assert.equal(storage.session, undefined);
        await storage.dispose();
        assert.equal(storage.watcher, null);
      }),
  ],
  [
    "watcher retry doubles, stable period resets delay and disposal clears all timers",
    async (factory) => {
      const timers = new Set<any>(),
        watchers: any[] = [];
      let attempts = 0;
      const patch = {
        setTimeout: (run: any, ms: number) => {
          const t = { run, ms, unref() {} };
          timers.add(t);
          return t;
        },
        clearTimeout: (t: any) => timers.delete(t),
        fs: {
          ...fs,
          watch: () => {
            if (attempts++ === 0) throw Error("owned-watch");
            const w = new EventEmitter() as any;
            w.close = () => w.emit("close");
            watchers.push(w);
            return w;
          },
        },
      };
      await owned(
        factory,
        async ({ storage }: any) => {
          await storage.initializeWatcher();
          assert.equal(storage.watcherRetryTimer.ms, 250);
          const fire = (timer: any) => {
            timers.delete(timer);
            timer.run();
          };
          fire(storage.watcherRetryTimer);
          await tick();
          assert.equal(watchers.length, 1);
          watchers[0].emit("error", Error("owned"));
          assert.equal(storage.watcherRetryTimer.ms, 500);
          fire(storage.watcherRetryTimer);
          await tick();
          fire(storage.watcherStableTimer);
          assert.equal(storage.watcherRetryDelayMs, 250);
          await storage.dispose();
          assert.equal(timers.size, 0);
        },
        patch,
      );
    },
  ],
  [
    "complete authentication manager restores, logs in and logs out through original file storage",
    async (factory) => {
      await withOwnedDesktopAuthentication(
        createNativeDesktopAuthentication,
        async (auth: any) => {
          await owned(factory, async ({ storage }: any) => {
            await storage.store(auth.session("restored"));
            auth.manager.authenticationStorages = [storage];
            await auth.manager.doInit();
            await tick();
            assert.equal(
              auth.manager.currentSessionSubject.getValue().account.uid,
              "restored",
            );
            assert.equal(await auth.manager.login(), true);
            await tick();
            assert.equal((await storage.restore()).account.uid, "owned");
            await auth.manager.logout();
            await tick();
            const file = await storage.getAuthSavePath();
            assert.equal(
              auth.manager.currentSessionSubject.getValue(),
              undefined,
            );
            assert.equal(fs.existsSync(file), false);
            assert.equal(fs.existsSync(file + ".logged-out"), true);
            assert.ok(auth.calls.includes("remove"));
          });
        },
      );
    },
  ],
];
